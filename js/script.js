;(function(exports) {

  var userCookie = splitCookie(document.cookie),
      contentDiv = $("#content"),
      msgContent, socket;
  
  init();
  //Check first if user is logged in with cookies
  if (userCookie.length && userCookie.uid && userCookie.uname) {
    showMsgBox();
  } else {
    showLogin();
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
              contentDiv.html(res);
              $("#loginBtn").on('click', function() {
                loginUser();
              });
            }
    });
  }

  function loginUser() {
    var username = $("#username").val().replace(/^\s+|\s+$/g, ''),
        password = $("#password").val().replace(/^\s+|\s+$/g, '');
    if (!username.length || !password.length) {
      alert('You must enter a username and password!');
      return;
    }

    socket.emit('login', {username: username, password: password});
  }

  function init() {
    socket = io.connect("http://msg-app.jit.su", {port: 80, transports: ["websocket"]});
    setEventHandlers();
  }

  function setEventHandlers() {
    socket.on("error", onError);
    socket.on("loggedin", onLoggedIn);
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

  function onShowMessages(data) {
    var msgArr = [],
        indivMsg = [];
    msgArr.push('<ul id="msg_list">');
    for (var i = 0; i < data.rec.length; i++) {
      indivMsg.push('<li data-msg-id="' + data.rec[i].id + '" data-class-id="' + data.rec[i].class.id + '">' + data.rec[i].class.name + ' - ' + data.rec[i].title + '<br/>' + data.rec[i].sender.first_name);
      indivMsg.push(' ' + data.rec[i].sender.last_name + '<br/>' + data.rec[i].time + ' ' + data.rec[i].date + '<div class="listOptions"><ul><li><a href="#">');
      indivMsg.push(['Mark as read', 'Delete', 'Reply', 'Forward'].join('</a></li><li><a href="#">') + '</a></li></ul></div><input type="checkbox"/></li>');
      msgArr.push(indivMsg.join(''));
      indivMsg.length = 0;
    }
    msgArr.push('</ul>');
    msgContent.html(msgArr.join('\n'));
  }

  function onShowNotifs(data) {
    var notifArr = [],
        indivNotif = [];
    notifArr.push('<ul id="notif_list">');
    for (var i = 0; i < data.rec.length; i++) {
      indivNotif.push('<li data-notifs-id="' + data.rec[i].id + '" data-class-id="' + data.rec[i].class.id + '">' + data.rec[i].class.name);
      indivNotif.push('<br/>' + data.rec[i].title + '<br/>' + data.rec[i].time + ' ' + data.rec[i].date + '<div class="listOptions"><ul><li><a href="#">');
      indivNotif.push(['Mark as read', 'Delete', 'Comment', 'Forward'].join('</a></li><li><a href="#">') + '</a></li></ul></div><input type="checkbox"/></li>');
      notifArr.push(indivNotif.join(''));
      indivNotif.length = 0;
    }
    notifArr.push('</ul>');
    msgContent.html(notifArr.join('\n'));
  }

  function onShowAnnouns(data) {
    var announsArr = [],
        indivAnnoun = [];
    announsArr.push('<ul id="announs_list">');
    for (var i = 0; i < data.rec.length; i++) {
      indivAnnoun.push('<li data-announs-id="' + data.rec[i].id + '" data-class-id="' + data.rec[i].class.id + '">' + data.rec[i].class.name + '<br/>' + data.rec[i].title);
      indivAnnoun.push('<br/>' + data.rec[i].time + ' ' + data.rec[i].date + '<div class="listOptions"><ul><li><a href="#">');
      indivAnnoun.push(['Mark as read', 'Delete', 'Comment', 'Forward'].join('</a></li><li><a href="#">') + '</a></li></ul></div><input type="checkbox"/></li>');
      announsArr.push(indivAnnoun.join(''));
      indivAnnoun.length = 0;
    }
    announsArr.push('</ul>');
    msgContent.html(announsArr.join('\n'));
    
  }

  function onShowUsers(data) {
    var usersArr = [],
        indivUser = [];
    usersArr.push('<ul id="users_list">');
    for (var i = 0; i < data.rec.length; i++) {
      indivUser.push('<li data-users-id="' + data.rec[i].id + '" data-class-id="' + data.rec[i].id + '">' + data.rec[i].first_name + ' ' + data.rec[i].last_name + '<div class="listOptions"><ul><li><a href="#">');
      indivUser.push(['Send Message', 'View Profile'].join('</a></li><li><a href="#">') + '</a></li></ul></div><input type="checkbox"/></li>');
      usersArr.push(indivUser.join(''));
      indivUser.length = 0;
    }
    usersArr.push('</ul>');
    msgContent.html(usersArr.join('\n'));
  }

  function showMsgBox() {
    $.ajax({url: "msgbox.html",
            type: "GET",
            success: function(res) {
              contentDiv.html(res);
              setButtonHandlers();
              getData('notifs');
            }
    });
  }

  function setButtonHandlers() {
    msgContent = $('#msgContent');

    var buttons = {
      notifs : $('#notifsBtn'),
      announs : $('#announsBtn'),
      msgs : $('#msgsBtn'),
      newMsg : $('#newBtn'),
      users : $('#usersBtn')
    },
        bar = {
      readMsg : $('#readMsgBar'),
      newMsg : $('#newMsgBar'),
      msgUsr : $('#msgUsrBar')
    };

    /**
     * The infamous JavaScript Closure Loop Problem
     * Instead of looping hardcoding each of the function for the buttons (which have the same functionalities),
     * simply store them in array and bind correct function to element
     */
    for (var btn in buttons) {
      if (buttons.hasOwnProperty(btn)) {
        buttons[btn].on('click', (function(btnName) {
          return function() {
            $('.checkAll').prop('checked', false);
            selectBtn(buttons, btnName);
            if (btnName === 'newMsg') {
              selectBtn(bar, btnName);
              showNewMessage(msgContent);
            } else {
              if (btnName === 'users') {
                selectBtn(bar, 'msgUsr');
              } else {
                selectBtn(bar, 'readMsg');
              }
              getData(btnName);
            }
          };
        }(btn)));
      }
    }

    $('.checkAll').on('change', function() {
      var self = this;
      $('#msgContent').find('input[type="checkbox"]').each(function() {
        $(this).prop('checked', self.checked);
      });
    });

    console.log(document.getElementsByClassName('dropdown'));
  }

  function selectBtn(btnArr, selectedBtn) {
    for (var btn in btnArr) {
      if (btnArr.hasOwnProperty(btn)) {
        if (btn === selectedBtn) {
          btnArr[btn].addClass('selected');
        } else {
          btnArr[btn].removeClass('selected');
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
    container.html('<textarea></textarea>');
  }

  /**
   * Command to populate redis db with data for users, messages, etc.
   */
  function populateData() {
    socket.emit('populate');
  }

  exports.populateData = populateData;

}(this));
