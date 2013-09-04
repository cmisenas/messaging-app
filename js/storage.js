;(function(exports) {
  
  var userPrefix = "global:user:",
      groupPrefix = "global:group:",
      messagePrefix = "global:msg:",
      userCount = "global:users:count",
      msgCount = "global:msgs:count";

  /**
   * Storage object will handle storing everything,
   * currently, the Message, User and the Group object
   * I chose Redis because its API is async scales well. 
   */
  function Storage(mod) {
    if (typeof mod === 'undefined') {
      throw new Error('No database passed!');
    }
    var store = require(mod);
    this.client = store.createClient();
    /**
     * Because there are no primary ids automatically set and incremented upon adding of records in redis (nosql dbs),
     * A key that maintains the number of users and messages is added and incremented when adding a new user or message.
     */
    this.client.setnx(userCount, 0);
    this.client.setnx(msgCount, 0);

    this.client.on("error", function(err) {
      console.log("Error: " + err);
    });
  }
  Storage.prototype.getUser = function(user, fn) {
    if (typeof user === 'undefined' || (typeof user.name === 'undefined' && typeof user.id === 'undefined')) {
      throw new Error('No user name or id provided!');
    }
    var that = this,
        username = user.name || '*',
        userid = user.id || '*';
    // Get user function can either return the user object by the username or by user id
    this.client.keys('user:uid' + userid + ':uname:' + username, function(keyErr, keyRes) {
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

  Storage.prototype.storeGroup = function(key, vals, fn) {
  }

  Storage.prototype.addToGroup = function(key, vals, fn) {
  }

  Storage.prototype.getGroup = function(hash, index, fn) {
    // Get group function returns an array of user ids by the group name or id 
  }

  Storage.prototype.storeMessage = function(key, vals, fn) {
    var that = this;
    this.client.incr(msgCount);
  }

  Storage.prototype.getMessage = function(hash, index, fn) {
    // Get message function is returned by user id of the recipient 
  }
  
  exports.Storage = Storage;

}(typeof exports === 'undefined' ? this : module.exports));
