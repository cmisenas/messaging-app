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

  Storage.prototype.getData = function(msgData, fn) {
    if (typeof msgData === 'undefined' || ((typeof msgData.type === 'undefined' && typeof msgData.rtype === 'undefined') && typeof msgData.mid === 'undefined')) {
      throw new Error('No message data provided!');
    }

    var that = this,
        mid = msgData.mid || '*',
        rtype = msgData.rtype || '*',
        rid = msgData.rid || '*';
  }
  
  exports.Storage = Storage;

}(typeof exports === 'undefined' ? this : module.exports));
