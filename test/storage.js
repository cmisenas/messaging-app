var assert = require("assert"),
    Storage = require("../js/storage.js").Storage,
    storage; 

describe("Storage", function(){

  afterEach(function() {
    storage.client.flushdb();
  });

  it("should be able to create db", function() {
    storage = new Storage('redis');
    assert(storage);
  });

  it("should throw an error when initialized without db", function() {
    assert.throws(function() {
      storage = new Storage();
    }, /No database passed!/);
  });

  it("should store user in current users and return user id", function(done) {
    storage = new Storage('redis');
    var user = {name: 'jdoe'};
    storage.storeUser(user, function(result) {
      assert.equal(result, 1);
      done();
    });
  });

  it("should return false when username is already in current users", function(done) {
    storage = new Storage('redis');
    var newUser = {name: 'jdoe'},
        sameUser = {name: 'jdoe'};
    storage.storeUser(newUser, function(result1) {
      storage.storeUser(sameUser, function(result2) {
        assert.equal(result2, false);
        done();
      });
    });
  });

  it("should store message object and return id", function() {
    storage = new Storage('redis');
    var msgObj = {msg: 'Hello world!'};
    storage.storeMessage(msgObj, function(result) {
    });
  });

  it("should store sending messages with message id and recipients", function() {
    storage = new Storage('redis');
  });

});
