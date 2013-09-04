var fs = require('fs');

function Populate(db) {
  this.db = db;
  this.db.setnx("global:user:id", 0);
  this.db.setnx("global:user:online", 0);
  this.db.setnx("global:message:id", 0);
  this.db.setnx("global:announs:id", 0);
  this.db.setnx("global:notifs:id", 0);
}

Populate.prototype.populateUsers = function() {
  var self = this;
  fs.readFile('users.json', 'utf-8', function(err, data) {
    if (err) {
      console.log(err);
    } else {
      var usersArr = JSON.parse(data);
      for (var i = 0; i < usersArr.length; i++) {
        self.db.hmset('users:id:' + usersArr[i].username + ':uname:' + usersArr[i].username, JSON.stringify(usersArr[i]));
      }
    }
  });
}

Populate.prototype.populateMessages = function() {
  var self = this;
  fs.readFile('inbox.json', 'utf-8', function(err, data) {
    if (err) {
      console.log(err);
    } else {
      var msgsArr = JSON.parse(data);
      for (var i = 0; i < msgsArr.length; i++) {
        self.db.hmset('messages:id:' + msgsArr[i].id, JSON.stringify(msgsArr[i]));
      }
    }
  });
}

Populate.prototype.populateAnnouns = function() {
  var self = this;
  fs.readFile('announs.json', 'utf-8', function(err, data) {
    if (err) {
      console.log(err);
    } else {
      var announsArr = JSON.parse(data);
      for (var i = 0; i < announsArr.length; i++) {
        self.db.hmset('announs:id:' + announsArr[i].id, JSON.stringify(announsArr[i]));
      }
    }
  });
}

Populate.prototype.populateNotifs = function() {
  var self = this;
  fs.readFile('notifs.json', 'utf-8', function(err, data) {
    if (err) {
      console.log(err);
    } else {
      var notifsArr = JSON.parse(data);
      for (var i = 0; i < notifsArr.length; i++) {
        self.db.hmset('notifs:id:' + notifsArr[i].id, JSON.stringify(notifsArr[i]));
      }
    }
  });
}

module.exports = Populate;
