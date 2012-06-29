const REMOTE = "https://api-dev.bugzilla.mozilla.org/latest/";

function $(query) { return document.querySelector(query)}
function $$(query) { return document.querySelectorAll(query)}

// http://github.com/premasagar/tim/
var tim = (function(){
    "use strict";
    var start = "{",
        end = "}",
        path = "[a-z0-9_][\\.a-z0-9_]*", // e.g. config.person.name
        pattern = new RegExp(start + "\\s*("+ path +")\\s*" + end, "gi"),
        undef;
    return function(template, data){
      // Merge data into the template string
      return template.replace(pattern, function(tag, token) {
        var path = token.split("."),
            len = path.length,
            lookup = data,
            i = 0;
        for (; i < len; i++) {
          lookup = lookup[path[i]];
          // Property not found
          // if (lookup === undef) { throw "tim: '" + path[i] + "' not found in " + tag; }
          if (lookup === undef) lookup = "";
          // Return the required value
          if (i === len - 1){return lookup;}
        }
      });
    };
}());

function login() {
  let username = $("#loginusername").value;
  let password = $("#loginpassword").value;
  let credentials = {};
  credentials.username = username ? username : "wrong@wrong";
  credentials.password = password ? password : "wrong@wrong";

  let url = REMOTE + "/user?username={username}&password={password}";
  url = tim(url, credentials);
  let req = new XMLHttpRequest();
  req.onreadystatechange = function(e) {
    if(this.readyState == this.DONE) {
      $("header form").classList.remove("loading");
      if (this.status == 200) {
        localStorage.username = credentials.username;
        localStorage.password = credentials.password;
        document.body.classList.add("connected");
        $("#whoyouare").textContent = "<" + credentials.username + ">";
      } else {
        document.body.classList.remove("connected");
        $("#loginusername").value = "";
        $("#loginpassword").value = "";
        $("#loginusername").placeholder = "nope";
        $("#loginpassword").placeholder = "nope";
        delete localStorage.username;
        delete localStorage.password;
      }
    }
  }
  $("header form").classList.add("loading");
  req.open("GET", url, true);
  req.setRequestHeader("Content-Type", "application/json");
  req.setRequestHeader("Accept", "application/json");
  req.send();
}

function getCredentials() {
  if ("username" in localStorage &&
      "password" in localStorage) {
    return {username: localStorage.username,
            password: localStorage.password};
  } else {
    return null;
  }
}

function urlCredentials() {
  let credentials = getCredentials();
  if (credentials) {
    let url = "?username={username}&password={password}";
    return tim(url, credentials);
  } else {
    return "";
  }
}

function newbug(data) {
  window._bug = data;
  let toexpand = $$(".toexpand");
  for (let elt of toexpand) {
    elt.innerHTML = tim(elt.innerHTML, data);
  }
  let classToExpand = $$("*[classlist]");
  for (let elt of classToExpand) {
    elt.className += " " + tim(elt.getAttribute("classlist"), data);
  }
  let emailToExpand = $$("*[email]");
  for (let elt of emailToExpand) {
    elt.setAttribute("email", tim(elt.getAttribute("email"), data));
  }
  buildDependencyList();
  buildFollowersList();
  $("#meta").classList.remove("loading");
  getAvatars();
}

function buildDependencyList() {
  let code = "";
  if (_bug.depends_on) {
    for (let bug of _bug.depends_on) {
      code += "<a>" + bug + "</a>";
    }
    $(".dependencies > .dependson > dd").innerHTML = code;
  }

  code = "";
  if (_bug.blocks) {
    for (let bug of _bug.blocks) {
      code += "<a>" + bug + "</a>";
    }
    $(".dependencies > .blockers > dd").innerHTML = code;
  }
}

function getAvatars() {
  let targets = $$("*[email]");
  for (let e of targets) {
    let email = e.getAttribute("email");
    e.removeAttribute("email");
    e.classList.add("avatar");
    e.style.backgroundImage = "url(http://avatars.io/email/" + email + ")";
  }
}

function buildFollowersList() {
  let code = "<ul>";
  if (_bug.cc) {
    for (let body of _bug.cc) {
      code += tim("<li title='{name}' email='{name}'>{name} </li>", body);
    }
    code += "</ul>";
    $(".followers").innerHTML = code;
  }
}

function newcomments(data) {
  let section = $("#comments");
  let template = "<div class='comment'><p class='date'>{prettydate}</p><p class='author' email='{creator.name}'>{creator.name}</p><pre>{text}</pre></div>\n";
  let html = "";
  if (data.comments) {
    for (let c of data.comments) {
      c.prettydate = c.creation_time;//prettyDate(c.creation_time);
      html += tim(template, c);
    }
    section.innerHTML = html;
  }
  comments.classList.remove("loading");
  getAvatars();
}

function pull(bugid) {
  let bugreq = new XMLHttpRequest();
  bugreq.onreadystatechange = function() {
    if(this.readyState == this.DONE) {
      newbug(JSON.parse(this.responseText));
    }
  }
  bugreq.open("GET", REMOTE + "/bug/" + bugid + urlCredentials(), true);
  bugreq.setRequestHeader("Content-Type", "application/json");
  bugreq.setRequestHeader("Accept", "application/json");
  bugreq.send();

  let commentreq = new XMLHttpRequest();
  commentreq.onreadystatechange = function() {
    if(this.readyState == this.DONE) {
      newcomments(JSON.parse(this.responseText));
    }
  }
  commentreq.open("GET", REMOTE + "/bug/" + bugid + "/comment" + urlCredentials(), true);
  commentreq.setRequestHeader("Content-Type", "application/json");
  commentreq.setRequestHeader("Accept", "application/json");
  commentreq.send();
}


(function() {
  let credentials = getCredentials();
  if (credentials) {
    $("#loginusername").value = credentials.username;
    $("#loginpassword").value = credentials.password;
    login();
  }
  let bugid = parseInt(window.location.hash.replace("#", ""));
  pull(bugid);
})();


