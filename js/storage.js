;(function(exports) {
  
  /**
   * Storage object will handle storing everything,
   * currently, the Message, User and the Group object
   * I chose Redis because its API is async scales well. 
   */
  function Storage(client) {
    if (typeof client === 'undefined') {
      throw new Error('No database passed!');
    }
    this.client = client;
    /**
     * Because there are no primary ids automatically set and incremented upon adding of records in redis (nosql dbs),
     * A key that maintains the number of users and messages is added and incremented when adding a new user or message.
     */
    this.client.on("error", function(err) {
      console.log("Error: " + err);
    });
  }

  Storage.prototype.getUser = function(user, fn) {
    if (typeof user === 'undefined' || (typeof user.uname === 'undefined' && typeof user.id === 'undefined')) {
      throw new Error('No user name or id provided!');
    }
    var that = this,
        username = user.uname || '*',
        userid = user.id || '*';
    // Get user function can either return the user object by the username or by user id
    this.client.keys('users:id' + userid + ':uname:' + username, function(keyErr, keyRes) {
      if (keyErr) {
        throw new Error(keyErr);
      }
      
      if (keyRes.length) {
        that.client.hgetall(keyRes, function(getErr, getRes) {
          if (getErr) {
            throw new Error(getErr);
          }
          fn(getRes);
        });
      } else {
        fn(false);
      }
    });
  }
  
  exports.Storage = Storage;

}(typeof exports === 'undefined' ? this : module.exports));
