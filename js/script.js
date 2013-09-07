;(function(exports) {

  var userCookie = splitCookie(document.cookie),
      contentDiv = $("#content"),
      msgContent, socket;
  
  init();
  populateData();
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
        result = {length: 0},
        i, cur;
    for (i = 0; i < strArr.length; i++) {
      cur = strArr[i].split("=");
      result[cur[0]] = cur[1];
      result.length++;
    }
    return result;
  }

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
    socket.on("new:msgs", onNewMsgs);
    socket.on("new:announs", onNewAnnouns);
  }

  function onNewMsgs(data) {
  }

  function onNewAnnouns(data) {
  }

  function onError(data) {
    alert(data.msg);
  }

  function onLoggedIn(data) {
    document.cookie = 'uname=' + data.uname + '; ' + document.cookie;
    document.cookie = 'uid=' + data.id + '; ' + document.cookie;
    showMsgBox();
  }

  function onShowData(format, include, data, id) {
    var dataArr = [],
        indivData = [],
        splitFormat = format.split('%s');
    dataArr.push('<ul id="' + id + '">');
    for (var i = 0; i < data.rec.length; i++) {
      for (var j = 0; j < include.length; j++) {
        dataArr.push(splitFormat[j]);
        dataArr.push(typeof include[j] === 'string' ? data.rec[i][include[j]] : data.rec[i][include[j][0]][include[j][1]]);
      }
      dataArr.push(splitFormat[splitFormat.length - 1]);
    }
    dataArr.push('</ul>');
    msgContent.html(dataArr.join('\n'));
  }

  function showMsgBox() {
    $.ajax({url: "msgbox.html",
            type: "GET",
            success: function(res) {
              contentDiv.html(res);
              setButtonHandlers();
              setListHandlers();
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
  }
  
  function setListHandlers() {
    $('.checkAll').on('change', function() {
      var self = this;
      $('#msgContent').find('input[type="checkbox"]').each(function() {
        $(this).prop('checked', self.checked);
      });
    });

    $('.dropdown').on('click', function() {
      setDropdownHandler(this);
      setFilterHandler();
    });

    $('#msgInt > ul > li').on('mouseleave', function() {
      $(this).parent().parent().find('.filtersMenu').css('display', 'none');
    });
  }
  
  function setDropdownHandler(dropdown) {
    var getClasses = [];
    $('#msgContent > ul > li').each(function() {
      var id = $(this).data(id).classId.replace(/^\s+|\s+$/g, ''),
          name = $(this).find('.class_name').text();
      if (!getClasses[id]) {
        getClasses[id] = {name: name};
      }
    });
    $(dropdown).parent().parent().find('.filtersMenu').css('display', 'block').html(function() {
      var classList = '';
      for (var id in getClasses) {
        classList += getClasses[id].name + '<input type="checkbox" class="filterClass" value="' + id + '"/>' + '<br/>';
      }
      return classList;
    });
  }

  function setFilterHandler() {
    $('.filterClass').on('change', function() {
      var filterVals = [];
      $(this).parent().find('input.filterClass:checked').each(function() {
        filterVals.push($(this).val());
      });
      $('#msgContent > ul > li').each(function() {
        var id = $(this).data(id).classId.replace(/^\s+|\s+$/g, '');
        if (filterVals.indexOf(id) > -1 || filterVals.length === 0) {
          $(this).css('display', 'block');
        } else {
          $(this).css('display', 'none');
        }
      });
    });
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
    $.ajax({url: "get/" + type,
            type: "GET",
            data: {
              uid: user.uid,
              uname: user.uname
            },
            success: function(res) {
              var data = {rec: JSON.parse(res)},
                  listId = type + '_list';
              successGet(data, type, listId);
            }
    });
  }

  /**
   * TODO: Cleanup formatting
   */
  function successGet(data, type, listId) {
    if (type === "msgs") {
      format = '<li data-msg-id="%s" data-class-id="%s"><span class="class_name">%s</span> - %s<br/>%s %s<br/>%s %s<div class="listOptions"><ul><li><a href="#">';
      format += ['Mark as read', 'Delete', 'Reply', 'Forward'].join('</a></li><li><a href="#">') + '</a></li></ul></div><input type="checkbox"/></li>';
      include = ['id', ['class', 'id'], ['class', 'name'], 'title', ['sender', 'first_name'], ['sender', 'last_name'], 'time', 'date'];
    } else if (type === "notifs") {
      format = '<li data-notifs-id="%s" data-class-id="%s"><span class="class_name">%s</span><br/>%s<br/>%s %s<div class="listOptions"><ul><li><a href="#">';
      format += ['Mark as read', 'Delete', 'Comment', 'Forward'].join('</a></li><li><a href="#">') + '</a></li></ul></div><input type="checkbox"/></li>';
      include = ['id', ['class', 'id'], ['class', 'name'], 'title', 'time', 'date'];
    } else if (type === "announs") {
      format = '<li data-announs-id="%s" data-class-id="%s"><span class="class_name">%s</span><br/>%s<br/>%s %s<div class="listOptions"><ul><li><a href="#">';
      format += ['Mark as read', 'Delete', 'Comment', 'Forward'].join('</a></li><li><a href="#">') + '</a></li></ul></div><input type="checkbox"/></li>';
      include = ['id', ['class', 'id'], ['class', 'name'], 'title', 'time', 'date'];
    } else if (type === "users") {
      format = '<li data-users-id="%s">%s %s<div class="listOptions"><ul><li><a href="#">';
      format += ['Mark as read', 'Delete', 'Comment', 'Forward'].join('</a></li><li><a href="#">') + '</a></li></ul></div><input type="checkbox"/></li>';
      include = ['id', 'first_name', 'last_name'];
    }
    onShowData(format, include, data, listId);
  }

  function showNewMessage(container) {
    container.html('<textarea></textarea>');
  }

  //Command to populate redis db with data for users, messages, etc.
  exports.populateData = function() {
    socket.emit('populate');
  };

}(this));
