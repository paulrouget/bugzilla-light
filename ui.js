const URLREGEXP = /(^|\s)((https?:\/\/)[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
const BUGREGEXP = /bug (\d+)/gi;

let UI = {
  templates: new Map(),
  init: function() {
    window.onhashchange = this.handleBug.bind(this);
    if (!$("#loginusername").value && !$("#loginpassword").value &&
        localStorage.username && localStorage.password) {
      $("#loginusername").value = localStorage.username;
      $("#loginpassword").value = localStorage.password;
    }
    this.renderTemplateOfType("onload");
    if ($("#loginusername").value && $("#loginpassword").value) {
      this.login(this.handleBug.bind(this));
    } else {
      this.handleBug();
    }
  },
  logout: function() {
      $("#loginusername").value =
      $("#loginpassword").value =
          localStorage.username =
          localStorage.password = "";
      this.login(); // force disconnecton
  },
  login: function(callback) {
    log("trying to log in…");
    gNetwork.tryToLogin(
      $("#loginusername").value,
      $("#loginpassword").value,
      function() {
        this.renderTemplateOfType("onlogin");
        if (callback) callback();
      }.bind(this)
    );
  },

  handleBug: function() {
    let bug = parseInt(window.location.hash.split("#")[1]);
    if (isNaN(bug)) {
      log("Not a bug number");
      gWorld.bug = null;
      document.body.classList.add("nobug");
      document.body.classList.remove("bugloaded");
      document.body.classList.remove("bugloading");
    } else {
      log("found a bug number: " + bug);
      document.body.classList.remove("nobug");
      document.body.classList.remove("bugloaded");
      document.body.classList.add("bugloading");
      this.fetchBugAndComments(bug, function() {
        gResolver.resolveBugs();
      });
    }

  },

  fetchBugAndComments: function(bugid, callback) {
    document.body.classList.add("bugloading");
    gNetwork.getBug(bugid, function(bug) {
      document.body.classList.remove("bugloading");
      if (!bug) {
        log("Error: didn't manage to fetch the bug.");
        return;
      }
      document.body.classList.add("bugloaded");
      gWorld.bug = bug;
      gResolver.addDependencies();
      gNetwork.getComments(bugid, function(comments) {
        if (!comments) {
          log("Error: didn't manage to fetch the comments.");
          return;
        }
        gWorld.comments = this.preprocessComments(comments.comments);
        this.renderTemplateOfType("oncomments");
        callback();
      }.bind(this));
      this.renderTemplateOfType("onbugmeta");
    }.bind(this));
  },

  preprocessComments: function(comments) {
    let counter = 0;
    for (let c of comments) {
      c.mine = (gWorld.username && (c.creator.name == gWorld.username))?"mine":"";
      c.counter = counter++;
      c.prettydate = humaneDate(c.creation_time);
      c.formatedtext = this.formatComment(c.text);
    }
    return comments;
  },

  formatComment: function(text) {
    let lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].replace("<", "&lt;");
      if (lines[i][0] == ">" ||
          lines[i].indexOf("(In reply to ") == 0) {
        lines[i] = "<span class='quotedtext'>" + lines[i] + "</span>";
      }
    }
    text = lines.join("\n");
    text = text.replace(URLREGEXP, function(match) {return "<a href=\'" + match + "\'>" + match + "</a>";});
    text = text.replace(BUGREGEXP, function(match, id) {
      gResolver.addBug(id);
      return "<a class='bug" + id + "' href=\'#" + id + "\'>" + match + "</a>";
    });
    return text;
  },

  renderTemplateOfType: function(type) {
    let toExpand = $$("script[when=" + type + "]");
    for (let s of toExpand) {
      if (this.templates.has(s)) {
        let elt = this.templates.get(s);
        elt.parentNode.removeChild(elt);
        this.templates.delete(s);
      }
      let div = document.createElement("div");
      div.className = s.className;
      div.innerHTML = Mustache.render(s.textContent, gWorld);
      s.parentNode.insertBefore(div, s);
      this.templates.set(s, div);
    }
  },
}

window.onload = function() {UI.init();}
