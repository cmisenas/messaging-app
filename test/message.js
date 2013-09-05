var assert = require("assert"),
    Message = require("../js/message.js").Message;

describe("Message", function() {

  it("should be instantiable when passed text and user", function() {
    var uid = 1,
        message = new Message(uid, {msg: "Hello there!"});
    assert(message);
  });

  it("should throw error when text and user not passed", function() {
    assert.throws(function() {
      var message = new Message();
    }, /No user id and message given!/);
  });

  it("should throw error when invalid user id is passed", function() {
    var uid = 'sdl';
    assert.throws(function() {
      var message = new Message(uid, {msg: "I have an invalid string id."});
    }, /No valid user id given!/);
  });

  it("should store user id and message properties to object", function() {
    var uid = 1,
        message = new Message(uid, {msg: "Hello there!"});
    assert.equal(message.uid, uid);
    assert.equal(message.msg, "Hello there!");
  });

});
