;(function(exports) {

  var userCookie = splitCookie(document.cookie),
      contentDiv = document.getElementById("content"),
      msgContent, socket;
  
  init();
  //Check first if user is logged in with cookies
  if (userCookie.length && userCookie.uid && userCookie.uname) {
    showMsgBox();
  } else {
    showLogin();
  }

  function init() {
    socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]}); 
  }

  function splitCookie (str) {
    if (str.replace(/^\s+|\s+$/g, '') === '') {
      return {length: 0};
    }
    var strArr = str.split("; "),
        result = {},
        len = 0,
        i, cur;
    for (i = 0; i < strArr.length; i++) {
      cur = strArr[i].split("=");
      result[cur[0]] = cur[1];
      len++;
    }
    result.length = len;
    return result;
  }

  /**
   * login page
   */
  function showLogin(uname) {
    $.ajax({url: "login.html",
            type: "GET",
            success: function(res){
              contentDiv.innerHTML = res;
              document.getElementById("loginBtn").onclick = function() {
                loginUser();
              }
            }
    });
  }

  function loginUser() {
    var username = document.getElementById("username").value.replace(/^\s+|\s+$/g, '');
    if (!username.length) {
      alert('You must enter a username!');
      return;
    }

    socket.emit('login', {username: username});
  }

  function init() {
    socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});
    setEventHandlers();
  }

  function setEventHandlers() {
    socket.on("error", onError);
    socket.on("loggedin", onLoggedIn);
    socket.on("new:message", onNewMessage);
    socket.on("new:notifs", onNewNotifs);
    socket.on("new:announs", onNewAnnouns);
    socket.on("show:msgs", onShowMessages);
    socket.on("show:notifs", onShowNotifs);
    socket.on("show:announs", onShowAnnouns);
    socket.on("show:users", onShowUsers);
  }

  function onError(data) {
    alert(data.msg);
  }

  function onLoggedIn(data) {
    document.cookie = 'uname=' + data.uname + '; ' + document.cookie;
    document.cookie = 'uid=' + data.id + '; ' + document.cookie;
    showMsgBox();
  }

  function onNewMessage(data) {
  }

  function onNewNotifs(data) {
  }

  function onNewAnnouns(data) {
  }

  function onShowMessages(data) {
    var msgArr = [];
    msgArr.push('<ul id="msg_list">');
    for (var i = 0; i < data.msgs.length; i++) {
      msgArr.push('<li data-msg-id="' + data.msgs[i].id + '">' + data.msgs[i].class + ' - ' + data.msgs[i].title + '<br/>' + data.msgs[i].sender.first_name + ' ' + data.msgs[i].sender.last_name + '<br/>' + data.msgs[i].time + ' ' + data.msgs[i].date + '</li>');
    }
    msgArr.push('</ul>');
    msgContent.innerHTML = msgArr.join('\n');
    $('#msg_list > li').hover(function() {
      /**
       * Mark as read
       * Delete
       * Reply
       * Forward
       */
    });
  }

  function onShowNotifs(data) {
    var notifArr = [];
    notifArr.push('<ul id="notif_list">');
    for (var i = 0; i < data.notifs.length; i++) {
      notifArr.push('<li data-notifs-id="' + data.notifs[i].id + '">' + data.notifs[i].class + '<br/>' + data.notifs[i].title + '<br/>' + data.notifs[i].time + ' ' + data.notifs[i].date + '</li>');
    }
    notifArr.push('</ul>');
    msgContent.innerHTML = notifArr.join('\n');
    $('#notif_list > li').hover(function() {
      /**
       * Mark as read
       * Delete
       * Comment
       * Forward
       */
    });
  }

  function onShowAnnouns(data) {
    var announsArr = [];
    announsArr.push('<ul id="announs_list">');
    for (var i = 0; i < data.announs.length; i++) {
      announsArr.push('<li data-announs-id="' + data.announs[i].id + '">' + data.announs[i].class + '<br/>' + data.announs[i].title + '<br/>' + data.announs[i].time + ' ' + data.announs[i].date + '</li>');
    }
    announsArr.push('</ul>');
    msgContent.innerHTML = announsArr.join('\n');
    $('#announs_list > li').hover(function() {
      /**
       * Mark as read
       * Delete
       * Comment
       * Forward
       */
    });
  }

  function onShowUsers(data) {
    var announsArr = [];
    announsArr.push('<ul id="users_list">');
    for (var i = 0; i < data.users.length; i++) {
      announsArr.push('<li data-users-id="' + data.users[i].id + '">' + data.users[i].first_name + ' ' + data.users[i].last_name + '</li>');
    }
    announsArr.push('</ul>');
    msgContent.innerHTML = announsArr.join('\n');
    $('#users_list > li').hover(function() {
      /**
       * Send message
       * View profile
       */
    });
  }

  function showMsgBox() {
    $.ajax({url: "msgbox.html",
            type: "GET",
            success: function(res) {
              contentDiv.innerHTML = res;
              setButtonHandlers();
              getData('notifs');
            }
    });
  }

  function setButtonHandlers() {
    msgContent = document.getElementById('msgContent');

    var buttons = {
      notifs : document.getElementById('notifsBtn'),
      announs : document.getElementById('announsBtn'),
      inbox : document.getElementById('inboxBtn'),
      newMsg : document.getElementById('newBtn'),
      users : document.getElementById('usersBtn')
    };

    buttons.notifs.onclick = function() {
      selectBtn(buttons, 'notifs');
      getData('notifs');
    };
    buttons.announs.onclick = function() {
      selectBtn(buttons, 'announs');
      getData('announs');
    };
    buttons.inbox.onclick = function() {
      selectBtn(buttons, 'inbox');
      getData('msgs');
    };
    buttons.newMsg.onclick = function() {
      selectBtn(buttons, 'newMsg');
      showNewMessage(msgContent);
    };
    buttons.users.onclick = function() {
      selectBtn(buttons, 'users');
      getData('users');
    };
  }

  function selectBtn(btnArr, selectedBtn) {
    for (var btn in btnArr) {
      if (btnArr.hasOwnProperty(btn)) {
        if (btn === selectedBtn) {
          btnArr[btn].className = 'selected';
        } else {
          btnArr[btn].className = '';
        }
      }
    }
  }

  function getData(type) {
    var user = splitCookie(document.cookie);
    socket.emit('get:' + type, { 
      uid: user.uid,
      uname: user.uname
    });
  }

  function showNewMessage(container) {
    container.innerHTML = '<textarea></textarea>';
  }

  /**
   * Command to populate redis db with data for users, messages, etc.
   */
  function populateData() {
    socket.emit('populate');
  }

  exports.populateData = populateData;

}(this));
