
module.exports = function(app, everyauth) {

	everyauth.debug = false;
	var usersById = [];

	everyauth.everymodule
	  .findUserById( function (userId, callback) {
	    app.db.User.findOne({id: userId}, callback);
	});

	function addUser (source, sourceUser) {

	  var user;
	  if (arguments.length === 1) { // password-based
	    user = sourceUser = source;
	    user.id = ++nextUserId;
	    return usersById[nextUserId] = user;
	  } else { // non-password-based
	    
	    var src = '';
	    if (source === 'facebook') src = "fb";
	    if (source === 'twitter') src = "tw";
	    if (source === 'google') src = "gl";

	    // user  = {id: src+sourceUser.id, service: source};
	    // user[source] = sourceUser;
	    var newUser = new app.db.User();
	    newUser.id = src+sourceUser.id;
	    newUser.source.service = source;
	    newUser.source.id = sourceUser.id;
	    newUser.source.name = sourceUser.name;
	    newUser.source.screenName = sourceUser.screen_name || sourceUser.given_name || sourceUser.username;
	    newUser.source.avatarUrl = sourceUser.profile_image_url || sourceUser.picture || "https://graph.facebook.com/"+sourceUser.id+"/picture";
	    user = newUser;

	    newUser.save(function(err){
	      if (err) {console.log("Existing user signed in - ["+newUser.id+"]");}
	      else {
	        usersById.push(newUser);
	      }
	    });
	  }
	  return user;
	}

	everyauth.twitter 
	  .consumerKey(app.config.twitter.id)
	  .consumerSecret(app.config.twitter.secret)
	  .callbackPath('/auth/twitter/callback')
	  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitUser) {
	    return usersById["tw"+twitUser.id] || (usersById["tw"+twitUser.id] = addUser('twitter', twitUser));
	  })
	  .sendResponse( function (res, data) {
	    var session = data.session;
	    var redirectTo = session.redirectTo;
	    delete session.redirectTo; 
	    res.redirect(redirectTo || "/mine");
	  })
	  .redirectPath('/mine');


	everyauth.facebook
	  .appId(app.config.facebook.id)
	  .appSecret(app.config.facebook.secret)
	  .handleAuthCallbackError( function (req, res) {})
	  .findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
	    return usersById["fb"+fbUserMetadata.id] || (usersById["fb"+fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
	  })
	  .sendResponse( function (res, data) {
	    var session = data.session;
	    var redirectTo = session.redirectTo;
	    delete session.redirectTo;
	    res.redirect(redirectTo || "/mine");
	  })
	  .moduleTimeout(20000)
	  .redirectPath('/mine');
	  

	everyauth.google
	  .appId(app.config.google.id)
	  .appSecret(app.config.google.secret)
	  .scope('https://www.googleapis.com/auth/userinfo.profile') // What you want access to
	  .callbackPath('/auth/google/callback')
	  .handleAuthCallbackError( function (req, res) {})
	  .findOrCreateUser( function (session, accessToken, accessTokenExtra, googleUserMetadata) {
	    return usersById["gl"+googleUserMetadata.id] || (usersById["gl"+googleUserMetadata.id] = addUser('google', googleUserMetadata));
	  })
	  .sendResponse( function (res, data) {
	    var session = data.session;
	    var redirectTo = session.redirectTo;
	    delete session.redirectTo;
	    res.redirect(redirectTo || "/mine");
	  })
	  .redirectPath('/mine');


	everyauth.everymodule.logoutPath('/auth/logout');
	
}