var http = require('http'),
    fs = require('fs'),
    io = require('socket.io'),
    url = require('url'),
    qs = require('querystring'),
    Populate = require('./populate.js'),
    Storage = require('./storage.js').Storage,
    socket, users = [];

socket = initSocketIO(startServer());
setEventHandlers(socket);

function serveStaticFile(filename, type, res) {
  fs.readFile(filename, function (err, data) {
    if (data) {
      res.writeHead(200, { 'Content-Type': type });
      res.end(data);
    } else {
      serveErrorPage(res);
    }
  });
}

function serveErrorPage(res) {
  fs.readFile('error.html', 'utf8', function (err2, data2){
    res.writeHead(404);
    if (err2) {
      res.end('File Not Found!');
    } else {
      res.end(data2);
    }
  });
}

function initSocketIO(app) {
	var socket = io.listen(app);
	socket.configure(function(){
		socket.set('transports', ['websocket']);
		socket.set('log level', 2);
	});
  return socket;
}

function setEventHandlers(socket) {
	socket.sockets.on('connection', function(client) {
	  client.on('login', function(data) {
      onLoginUser(this, data);
    });
	  client.on('get:notifs', function(data) {
      onGetNotifs(this, data);
    });
	  client.on('get:msgs', function(data) {
      onGetMessages(this, data);
    });
	  client.on('get:announs', function(data) {
      onGetAnnouncements(this, data);
    });
	  client.on('get:users', function(data) {
      onGetUsers(this, data);
    });
	  client.on('send:message', function(data) {
      onSendMessage(this, data);
    });
	  client.on('populate', function(data) {
      onPopulate();
    });
  });
}

function startServer() {
  var PORT = 8000,
      app;

  app = http.createServer(function(req, res) {
    var pathname = url.parse(req.url).pathname;
    handleGet(pathname, res)
  }).listen(PORT);

  console.log("Server started on port", PORT);
  return app;
}

function handleGet(pathname, res) {
  if (pathname === '/') {
    serveStaticFile('index.html', 'text/html', res);
  } else {
    var type = pathname.indexOf('.js') > -1 ? 'text/javascript' :
               pathname.indexOf('.html') > -1 ? 'text/html' :
               pathname.indexOf('.css') > -1 ? 'text/css' :
               pathname.indexOf('.svg') > -1 ? 'image/svg+xml' :
               'text/plain';
    serveStaticFile(pathname.substring(1), type, res);
  }
}

/**
 * This is a quick, simple function to register the user on the redis database
 * TODO:
 * data sanitization and checking
 */
function onLoginUser(client, data) {
  if (users.indexOf(data.username) === -1) {
    var id = users.push(data.username);
    client.emit('loggedin', {id: id, uname: data.username});
  } else {
    sendError('That username is already taken!');
  }
}

function onGetNotifs(client, data) {
  if (users.indexOf(data.username)) {
    fs.readFile('notifs.json', 'utf-8', function(err, data) {
      //send test data from json file
      //when implemented flatten object with JSON.stringify
      //and parse string to JSON when used
      var notifs = JSON.parse(data);
      client.emit('show:notifs', {notifs: notifs});
    });
  } else {
    sendError('That user does not exist!');
  }
}

function onGetMessages(client, data) {
  if (users.indexOf(data.username)) {
    fs.readFile('inbox.json', 'utf-8', function(err, data) {
      var inbox = JSON.parse(data);
      client.emit('show:msgs', {msgs: inbox});
    });
  } else {
    sendError('That user does not exist!');
  }
}

function onGetAnnouncements(client, data) {
  if (users.indexOf(data.username)) {
    fs.readFile('announs.json', 'utf-8', function(err, data) {
      var announs = JSON.parse(data);
      client.emit('show:announs', {announs: announs});
    });
  } else {
    sendError('That user does not exist!');
  }
}

function onGetUsers(client, data) {
  if (users.indexOf(data.username)) {
    fs.readFile('users.json', 'utf-8', function(err, data) {
      var users = JSON.parse(data);
      client.emit('show:users', {users: users});
    });
  } else {
    sendError('That user does not exist!');
  }
}

function onAddUser(client, data) {
  if (users.indexOf(data.username)) {
    console.log(data, 'add user');
  } else {
    sendError('That user does not exist!');
  }
}

function onNewMessage(client, data) {
  if (users.indexOf(data.username)) {
    console.log(data, 'new message');
  } else {
    sendError('That user does not exist!');
  }
}

function onSendMessage(client, data) {
  if (users.indexOf(data.username)) {
    console.log(data, 'send message');
  } else {
    sendError('That user does not exist!');
  }
}

function sendError(msg) {
  socket.sockets.emit('error', {msg: msg});
}

function onPopulate() {
  var data = new Populate();
  data.populateUsers();
  data.populateMessages();
  data.populateAnnouns();
  data.populateNotifs();
}
