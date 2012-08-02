

// email reminders and confirmation
// 


var nodemailer 	= require("nodemailer"),
	redis 		= require('redis'),
	redisClient = redis.createClient(),
	_ 			= require('underscore'),
	cron 		= require('cron'),
	cronJob 	= cron.CronJob,
	hash 		= require('node_hash');



var verificationEmail = function(opts) {
	return {
		to : opts.to,								// default TO
		from : '"mustwatch.it" <hello@mustwatch.it>',		// default FROM
		subject : "Email Verification",						// default SUBJECT
		text: _.template("Hi,\n\nThis email was sent automatically from the busy bots at mustwatch.it, in order to verify your email address. To confirm your email address copy the link below into your broswers address bar. \n\n<%= link %> \n\nHope you have an awesome day! \nFrom mustwatch.it", opts),							// default BODY TEXT
		html: _.template("<h3>Verify your email address</h3><p>This email was sent automatically from the busy bots at mustwatch.it, in order to verify your email address.<br/>To confirm your email address click on the following link:</p><h1><a href=\"<%= link %>\">Confirm</a></h1><p>Hope you have an awesome day! <br/>From mustwatch.it</p>", opts)
	};
};




module.exports = function(app){

	var ses = nodemailer.createTransport("SES", {
		AWSAccessKeyID: app.config.aws.id,
		AWSSecretKey: app.config.aws.key
	});


	var getAllUsers = function(cb){
		app.db.User.find({}, function(err, users){
		if (!err) cb(null, users);
		else cb(err, null);
		})
	}

	var heartBeat = function () {

		getAllUsers(function(err, users){

			var now = new Date(),
				day = now.getDate();

			console.log(now, " : Conjob heatbeat: go!");
			console.log("day: ", day);

			if (!err) {

				// for each User
				_.each(users, function(user){

					var unwatched = _.filter(user.videos, function(v){return v.watched === false;});

					if (user.email.verified ) {
						if (user.email.period === "weekly" && unwatched.length > 0) {
							console.log("email(w): ", user.email.value, "videos: ", unwatched.length);
						} else if (user.email.period === "monthly" && unwatched.length > 0 && day <= 7) {
							console.log("email(m): ", user.email.value, "videos: ", unwatched.length);

							if (user.email.value === "christopherdebeer@gmail.com") {
								ses.sendMail(app.config.email, function(err){
								    if(err){
								        console.log("HB Email: Error sending email: ", err)
								        return;
								    }
								   	console.log("HB Email: Sent to: ", app.config.email.to)
								});
							}
						} else {
							console.log("User: " + user.source.screenName + " has 0 unwatched videos.")
						}
					} else {
						console.log("User: " + user.source.screenName + " has not verfified their email address.")
					}
				});

			} else {
				console.log("Error loading users for cron job / reminders");
			}

			
		});
	};

	return {
		
		cron: new cronJob({
			cronTime: "0 9 * * 2",         // weekly ""
			onTick: heartBeat,
			start: true
		}),

		sendVerificationEmail: function(userId, cb) {
			app.db.User.findOne({id: userId}, function(err, user){
				if (err) cb(err, null);
				else {
					if (typeof user.email.value !== 'undefined' && user.email.value !== "") {
						var code = hash.md5(user.email.value, userId + "mustwatch");
						redisClient.set('mustwatch:emailVerify:' + code, userId, function(err){
							if (err) cb(err,null);
							else {
								var m = verificationEmail({
									to: user.email.value,
									link: ("http://www.mustwatch.it/confirmEmail/" + code).toString()
								});
								console.log("verification email sent: ", m);
								ses.sendMail(m, function(err){
									if (err) cb(err, null);
									else cb(null, m)
								})
								
							}
						})
					} else {
						cb({code: "405", msg: "no email address/value for provided user."}, null)
					}
				}
			})

		},

		checkVerificationCode: function(code, cb) {
			redisClient.get("mustwatch:emailVerify:" + code, function(err, value){

				if (!err) {
					app.db.User.findOne({id: value}, function(err, user){
						if (user) {
							user.email.verified = true;
							user.email.period = "weekly";
							user.save();
							cb(err, user);
						} else {
							cb({code: 404, msg: "User for matching verification code value not found."})
						}
					})
				} else cb(err, value);
			})
		}


	};
}