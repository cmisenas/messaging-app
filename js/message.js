;(function(exports) {
  
  /**
   * Message object will be the object stored in the database
   * and contains the id of user and the message body.
   * Optionally, it may also contain other info (i.e. subj, date, etc.)
   * Independent of the recipient of the message.
   */
  function Message(uid, options) {
    if (typeof uid === 'undefined' || typeof options === 'undefined' || typeof options.msg === 'undefined') {
      throw new Error('No user id and message given!');
    }
    if (typeof uid !== 'number') {
      throw new Error('No valid user id given!');
    }
    this.uid = uid;
    this.msg = options.msg;
    /**
     * Add other options to message object
     */
    for (var prop in options) {
      if (options.hasOwnProperty(prop) && prop !== 'text') {
        this[prop] = options[prop];
      }
    }
  }
  
  exports.Message = Message;

}(typeof exports === 'undefined' ? this : module.exports));
