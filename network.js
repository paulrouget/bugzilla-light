let gNetwork = {
  tryToLogin: function(username, password, callback) {
    if (gWorld.connecting) {
      log("warning: already trying to connect");
    }
    gWorld.connecting = true;
    if (username && password) {
      let url = gWorld.server + "/user?username=" + username + "&password=" + password;;
      this.req(url, function() {
        gWorld.connecting = false;
        gWorld.connected = true;
        gWorld.username = username;
        localStorage.username = username;
        localStorage.password = password; // FIXME: not secure
        document.body.classList.add("connected");
        log("connected");
        callback();
      }, function() {
        gWorld.connecting = false;
        gWorld.connected = false;
        document.body.classList.remove("connected");
        log("wrong credentials");
        callback();
      });
    } else {
      gWorld.connecting = false;
      gWorld.connected = false;
      document.body.classList.remove("connected");
      log("no credentials");
      callback();
    }
  },

  getBug: function(bugid, callback) {
    let url = gWorld.server + "/bug/" + bugid + this.urlCredentials();
    this.req(url, function(text) {
      log("Got bug");
      callback(JSON.parse(text));
    }, function(text, status) {
      log("Error while fetching bug: " + url);
      callback();
    });
  },

  getComments: function(bugid, callback) {
    let url = gWorld.server + "/bug/" + bugid + "/comment" + this.urlCredentials();
    this.req(url, function(text) {
      log("Got comments");
      callback(JSON.parse(text));
    }, function(text, status) {
      log("Error while fetching comments: " + url);
      callback();
    });
  },

  urlCredentials: function() {
    if (gWorld.connected) {
      return "?username=" + localStorage.username + "&password=" + localStorage.password;
    } else {
      return "";
    }
  },

  resolveBugs: function(bugs, callback) {
    if (bugs.length == 0) return;
    let url = gWorld.server + "/bug?include_fields=id,status,summary&id=";
    url += bugs.join(",");
    this.req(url, function(text) {
      log("Got bugs to resove");
      callback(JSON.parse(text).bugs);
    }, function() {
      log("Error while fetching bugs: " + url);
      callback();
    });
  },

  req: function(url, success, error) {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(e) {
      if(this.readyState == this.DONE) {
        if (this.status == 200) {
          success(this.responseText);
        } else {
          error(this.responseText, this.status);
        }
      }
    }
    req.open("GET", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Accept", "application/json");
    req.send();
  },
}
