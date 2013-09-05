var assert = require("assert"),
    redis = require("redis"),
    Populate = require('../js/populate.js'),
    Storage = require("../js/storage.js").Storage,
    storage, client, data;

describe("Storage", function(){

  setup(function() {
    client = redis.createClient();
    data = new Populate(client);
  });

  beforeEach(function() {
    data.populateUsers();
    data.populateMessages();
    data.populateAnnouns();
    data.populateNotifs();
  });

  afterEach(function() {
    storage.client.flushdb();
  });

  it("should be able to create db", function() {
    storage = new Storage(client);
    assert(storage);
  });

  it("should throw an error when initialized without db", function() {
    assert.throws(function() {
      storage = new Storage();
    }, /No database passed!/);
  });

  it("should get user in current users and return user id", function(done) {
    storage = new Storage(client);
    var user = {uname: 'ischmidt'};
    storage.getUser(user, function(result) {
      assert.equal(result.id, 1);
      assert.equal(result.first_name, 'Ian');
      assert.equal(result.last_name, 'Schmidt');
      done();
    });
  });

});
