var express 		= require('express'),
	static 			= require('node-static'),
	file 			= new (static.Server)('./public'),
	qs 				= require('qs'),
	mongoose    	= require('mongoose'),
	everyauth   	= require("everyauth"),
	color 		  	= require('colors'),
	url 			= require('url'),
	redis 			= require('redis'),
	redisClient 	= redis.createClient(),
	_ 				= require('underscore');

var app = module.exports = express.createServer();

// Configuration

// Attach custom Config and DB properties
app.configure( function() {
  app.config  = require("./lib/config");
  app.db      = require("./lib/dbconfig");
})

// Configure Everyauth
require("./lib/everyauthConfig")(app, everyauth);

app.configure(function(){

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: "mustwatch.it-20120609" }));
	app.use(everyauth.middleware());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
	app.use(function(req, res, next) {
	  var headers = {
	    'Cache-Control' : 'max-age:120',
	    'Access-Control-Allow-Origin': '*',
	  	'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
	  	'Access-Control-Allow-Headers': 'X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept',
	  	'Access-Control-Max-Age': 86400   // 1 day
	  };
	 
	  _.each(headers, function(value, key) {
	    res.setHeader(key, value);
	  });
	 
	  next();
	});
});


everyauth.helpExpress(app);

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 	
});

// Routes


// home
app.get('/', function (req,res) {
	if (req.headers.referer === 'http://www.mustwatch.it/bookmarkletLogin') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end('<script type="text/javascript">window.close();</script>');
	} else {
		redisClient.zrevrange("mustwatch:allvideos", 0, 24, 'withscores', function(err, members){
			if (!err) {

				var groups=_.groupBy(members, function(a,b) {
			        return Math.floor(b/2);
			    });

				var watchCount = {};

			    var keys = _.map(groups, function(x){
			    	watchCount[x[0]] = parseInt((x[1]).replace("mustwatch:", ""));
			    	return "mustwatch:" + x[0];
			    });
			    
			    redisClient.mget(keys, function(err, docs) {
			    	if (!err) {
			    		var recentVideos = _.map(docs, function(x){
			    			var video = JSON.parse(x);
			    			video.watchers = watchCount[video.provider+":"+video.id];
			    			return video;
			    		});
			    		// console.log("recent videos: ", recentVideos);
						res.render('index', {page: "home", req: req, recentVideos: recentVideos});
			    	} else res.render('index', {page: "home", req: req, recentVideos: []})
			    })

				
			} else res.render('index', {page: "home", req: req, recentVideos: []})
		}) 
	}
});


// my videos
app.get('/mine', function (req, res) {

	if (!req.loggedIn) res.redirect('/');
	else { 
		// console.log(req.user.videos); 
		res.render('home', {page: "mine", req: req});
	}
});

// bookmarklet
app.get('/bookmarklet', function (req, res) {
	res.render('bookmarklet', {page: "bookmarklet", req: req});
});

// bookmarklet
app.get('/faq', function (req, res) {
	res.render('faq', {page: "faq", req: req});
});


// video
app.get('/video/:provider/:id', function (req, res) {

	var video = {
		provider: req.params.provider,
		id: req.params.id 
	}

	redisClient.get("mustwatch:" + video.provider+":"+video.id, function(err, rawVideo){
		if (!err && rawVideo) {
			var videoInfo = null;
			try {
				var test = JSON.parse(rawVideo);
				videoInfo = test;
			} catch(e) {
				console.log("error parsing video json: ", e)
			}
			if (videoInfo) {

				var hasVideo = false;
				if (req.loggedIn) {
					for (var emb in req.user.videos) {
						if (req.user.videos[emb].id === req.params.id && req.user.videos[emb].provider === req.params.provider)	{
							videoInfo.watched = req.user.videos[emb];
							hasVideo = true;
						}
					} 
				} else videoInfo.watched = false;
				redisClient.zscore('mustwatch:allvideos', video.provider+":"+video.id, function(err, score){
					if (!err && score) {
						videoInfo.score = parseInt(score);
						res.render('video', {page: "video", req: req, video: videoInfo, hasVideo: hasVideo});
					} else {
						videoInfo.score = 0;
						res.render('video', {page: "video", req: req, video: videoInfo, hasVideo: hasVideo});
					}
				});
			} else res.render('500', {page: "500", req: req});
		} else res.render('404', {page: "404", req: req});
	});
});


app.get('/addVideo', function (req, res) {
	
	if (req.loggedIn) {
		var query = url.parse(req.url).query,
			video = qs.parse(query),
			callback = video.callback;

		// console.log(app.config.prefix + "Processing request to add video: ", video);
		app.db.User.findOne({id: req.user.id}, function(err, thisUser) {
			if (!err && thisUser) {

				// incr or add to redis count
				redisClient.zincrby("mustwatch:allvideos", 1, video.provider+":"+video.id);
				redisClient.set("mustwatch:" + video.provider+":"+video.id, JSON.stringify(video));

				var newVideo = new app.db.Video();
				newVideo.title = video.title;
				newVideo.thumbnail = video.thumbnail;
				newVideo.source = video.source;
				newVideo.provider = video.provider;
				newVideo.id = video.id;

				thisUser.videos.push(newVideo);
				thisUser.save();

				if (callback) {
					res.writeHead(200, {'Content-Type': 'text/javascript'});
					res.end(";" + callback + "(" + JSON.stringify(video) + ");");
				} else {
					video.layout = false;
					res.render('addVideo', video);
				}
			} else {
				res.writeHead(404, {'Content-Type': 'text/plain'})
				res.end('404 user not found');
			}
		});

		
	} else {
		res.redirect("/");
	}
	
})

app.get('/markAsWatched/:provider/:id', function(req, res){
	if (req.loggedIn) {

		app.db.User.findOne({id: req.user.id}, function (err, user) {
			if (!err) {
				for (var emb in user.videos) {
					if (user.videos[emb].id === req.params.id && user.videos[emb].provider === req.params.provider)	{
						user.videos[emb].watched = true;
					}
				} 
				user.save();
				res.send("ok");
			} else {
				console.log(err);
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end("Error loading user profile.")
			}
		});
	} else {
		res.writeHead(401, {'Content-Type': 'text/plain'});
		res.end("No user logged in.")
	}
});

app.get('/markAsUnwatched/:provider/:id', function(req, res){
	if (req.loggedIn) {

		app.db.User.findOne({id: req.user.id}, function (err, user) {
			if (!err) {
				for (var emb in user.videos) {
					if (user.videos[emb].id === req.params.id && user.videos[emb].provider === req.params.provider)	{
						user.videos[emb].watched = false;
					}
				} 
				user.save();
				res.send("ok");
			} else {
				console.log(err);
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end("Error loading user profile.")
			}
		});
	} else {
		res.writeHead(401, {'Content-Type': 'text/plain'});
		res.end("No user logged in.")
	}
});

app.get('/removeVideo/:provider/:id', function(req, res){
	if (req.loggedIn) {

		app.db.User.findOne({id: req.user.id}, function (err, user) {
			if (!err) {
				for (var emb in user.videos) {
					if (user.videos[emb].id === req.params.id && user.videos[emb].provider === req.params.provider)	{
						user.videos[emb].remove();
					}
				} 
				user.save();
				res.send("ok");
			} else {
				console.log(err);
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end("Error loading user profile.")
			}
		});
	} else {
		res.writeHead(401, {'Content-Type': 'text/plain'});
		res.end("No user logged in.")
	}
})

app.get('/addVideo/:provider/:id', function(req, res){
	if (req.loggedIn) {

		app.db.User.findOne({id: req.user.id}, function (err, user) {
			if (!err) {
				// get info of existing video from redis
				redisClient.get("mustwatch:" + req.params.provider+":"+req.params.id, function(err, rawVideo){
					if (!err && rawVideo) {

						var videoInfo = null;
						try {
							var test = JSON.parse(rawVideo);
							videoInfo = test;
						} catch(e) {
							console.log("error parsing video json: ", e)
						}

						if (videoInfo) {

							// incr or add to redis count
							redisClient.zincrby("mustwatch:allvideos", 1, videoInfo.provider+":"+videoInfo.id);

							var newVideo = new app.db.Video();
							newVideo.title = videoInfo.title;
							newVideo.thumbnail = videoInfo.thumbnail;
							newVideo.source = videoInfo.source;
							newVideo.provider = videoInfo.provider;
							newVideo.id = videoInfo.id;

							user.videos.push(newVideo);
							user.save();
							res.send("ok");
						} else {
							res.writeHead(500, {'Content-Type': 'text/plain'});
							res.end("Error loading video data.")
						}
						
					} else {
						console.log(err);
						res.writeHead(500, {'Content-Type': 'text/plain'});
						res.end("Error loading video data.")
					}
				});
				
			} else {
				console.log(err);
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end("Error loading user profile.")
			}
		});
	} else {
		res.writeHead(401, {'Content-Type': 'text/plain'});
		res.end("No user logged in.")
	}
})



app.get('/addEmail', function(req, res){
	var query = url.parse(req.url).query,
		email = qs.parse(query).email;

	if (email) {
		if (req.loggedIn) {
			if (req.user.email.value !== email) {
				req.user.email.value = email;
				req.user.email.verified = false;
				req.user.save();

				// send verification email
				console.log("TODO: send verification email to: ", email);
			}

			res.send("ok: " + email);
		} else {
			res.writeHead(401, {'Content-Type': 'text/plain'});
			res.end("no user logged in");	
		}
	} else {
		res.writeHead(405, {'Content-Type': 'text/plain'});
		res.end("no email in request");
	}
})


app.get('/bookmarkletLogin', function(req, res){res.render('bookmarkletLogin', {page: "bookmarkletLogin", req: req})});
app.get('/logincheck', function(req, res){

	var query = url.parse(req.url).query,
			callback = qs.parse(query).callback;

	res.writeHead(200, {'Content-Type': 'text/javascript'});
	var resp = {
		loggedIn: req.loggedIn,
		user: req.loggedIn ? req.user.id : ""
	};
	res.end(";" + callback + "("+JSON.stringify(resp)+");");
});


app.get('/userList', function(req, res){
	app.db.User.find({}, function(err, users){
		if (!err) res.json({count: users.length, users: _.map(users, function(user){return {user: user.source, videoCount: user.videos.length}})});
		else {
			console.log("eror fetching all users /userList");
			res.json({error: err})
		}
	})
})

app.listen(app.config.port);
console.log(app.config.prefix + "Server listening on port %d in %s mode", app.address().port, app.settings.env);
