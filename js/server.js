var http = require('http'),
    fs = require('fs'),
    io = require('socket.io'),
    url = require('url'),
    qs = require('querystring'),
    Populate = require('./populate.js'),
    Storage = require('./storage.js').Storage,
    socket, users = [], storage, client;

init();

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

function init() {
  var store = require('redis');
  socket = initSocketIO(startServer());
  setEventHandlers(socket);
  client = store.createClient(6379, nodejitsudb551450671.redis.irstack.com);
  client.auth(nodejitsudb551450671.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4, function(err) {
    console.log(err);
  });
  storage = new Storage(client);
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
      onGetData(this, 'notifs', data);
    });
	  client.on('get:msgs', function(data) {
      onGetData(this, 'msgs', data);
    });
	  client.on('get:announs', function(data) {
      onGetData(this, 'announs', data);
    });
	  client.on('get:users', function(data) {
      onGetData(this, 'users', data);
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
  var PORT = 80,
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
  storage.getUser({uname: data.username}, function(result) {
    if (result) {
      //password is currently trivial first and last name combination
      if (result.first_name + result.last_name === data.password) {
        client.emit('loggedin', {id: result.id, uname: data.username});
      } else {
        sendError('That username and password combination is incorrect!');
      }
    } else {
      sendError('That username does not exist!');
    }
  });
}

function onGetData(client, type, data) {
  fs.readFile(type + '.json', 'utf-8', function(err, result) {
    //send test data from json file
    //when implemented flatten object with JSON.stringify
    //and parse string to JSON when used
    var rec = JSON.parse(result);
    client.emit('show:' + type, {rec: rec});
  });
}

function onAddUser(client, data) {
  console.log(data, 'add user');
}

function onNewMessage(client, data) {
  console.log(data, 'new message');
}

function onSendMessage(client, data) {
  console.log(data, 'send message');
}

function sendError(msg) {
  socket.sockets.emit('error', {msg: msg});
}

function onPopulate() {
  var data = new Populate(client);
  data.populateUsers();
  data.populateMessages();
  data.populateAnnouns();
  data.populateNotifs();
}
