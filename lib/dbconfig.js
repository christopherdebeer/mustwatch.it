////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// DB Mongo stuff ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mustwatch', function(err) {
    if (err) {
      console.log("Mongoose Error. Couldn't connect to mongoDB instance.")
      throw err;
    }
});

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var VideoSchema = new Schema({
    id          : String
  , title       : String
  , desc        : String
  , thumbnail   : String
  , provider    : String
  , source      : String
  , watched     : { type: Boolean, default: false}
  , watchers    : Number
});


var UserSchema = new Schema({
    id          : {type: String, index: { unique: true }}
  , email       : {
      value       : String 
    , verified    : { type: Boolean, default: false}
  }
  , passwordHash: String
  , created     : { type: Date, default: Date.now}
  , source      : {
      service     : String
    , id          : String
    , name        : String
    , avatarUrl   : String
    , screenName  : String
  }
  , videos: [VideoSchema]
});



module.exports.Video	= mongoose.model('Video', VideoSchema);
module.exports.User = mongoose.model('User', UserSchema);

