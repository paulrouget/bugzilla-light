let UI = {
  init: function() {
    window.onhashchange = this.handleBug.bind(this);
    gKeyBindings.init();
    this.handleBug();
    if (localStorage.username) {
      this.onLoggedIn();
    }
  },
  logout: function() {
    delete localStorage.username;
    delete localStorage.password;
    document.body.classList.remove("connected");
  },
  login: function() {
    localStorage.username = $(".loginusername").value;
    localStorage.password = $(".loginpassword").value;
    // FIXME: credentials validation
    this.onLoggedIn();
  },

  onLoggedIn: function() {
    document.body.classList.add("connected");
    gWorld.username = localStorage.username;
    gTemplates.render("login");
  },

  handleBug: function() {
    let bug = parseInt(window.location.hash.split("#")[1]);
    if (bug == gWorld.bugid) return;
    if (isNaN(bug)) {
      console.error("Not a bug number");
      gWorld.bug = null;
    } else {
      gWorld.bugid = bug;
      console.log("found a bug number: " + bug);
      this.fetchBugAndComments(bug);
    }
  },

  fetchBugAndComments: function(bugid) {
    gBz.getBug(bugid, null, function(error, bug) {
      if (error) {
        console.error("Error: didn't manage to fetch the bug.");
        return;
      }
      gWorld.bug = bug;
      gWorld.token = bug.update_token;

      gTemplates.render("title");
      gTemplates.render("h1");
      gTemplates.render("bugzillalink");
      gTemplates.render("status");
      gTemplates.render("flags");
      gTemplates.render("dependencies");
      gTemplates.render("local");
      gTemplates.render("affects");
      gTemplates.render("followers");

      gBz.bugComments(bugid, function(error, comments) {
        if (error) {
          console.error("Error: didn't manage to fetch the comments.");
          return;
        }
        gWorld.comments = comments;
        gTemplates.render("comments");
      });
    });
  },

  preprocessFollowers: function() {
    let cced = false;
    if (gWorld.bug.cc) {
      for (let user of gWorld.bug.cc) {
        if (user.name == gWorld.username) {
          cced = true;
          break;
        }
      }
    }
    gWorld.following = cced;
  },

  preprocessComments: function() {
    let comments = gWorld.comments;
    let counter = 0;
    for (let c of comments) {
      c.mine = (gWorld.username && (c.creator.name == gWorld.username))?"mine":"";
      c.counter = counter++;
      c.prettydate = humaneDate(c.creation_time);
      let prettytext = this.formatComment(c.text);
      c.formatedtext = prettytext.text;
      c.markdown = prettytext.isMarkdown ? "markdown" : "";
    }
    gWorld.comments = comments;
  },

  formatComment: function(text) {
    if (text.indexOf("#markdown") > 0) {
      // render as a markdown content
      if (!this._markdownConverter) {
        this._markdownConverter = new Showdown.converter();
      }
      return {text: this._markdownConverter.makeHtml(text),
              isMarkdown: true};
    } else {
      const URLREGEXP = /((https?:\/\/)[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
      const BUGREGEXP = /bug (\d+)/gi;
      const QUOTEREGEXP = /(^|\n)>.*/g;
      const REPLYREGEX = /\(In reply to .*\)/g;

      text = text.replace("<", "&lt;", "gm");
      text = text.replace(URLREGEXP, function(match) {return "<a href=\'" + match + "\'>" + match + "</a>";}, "gm");
      text = text.replace(BUGREGEXP, function(match, id) { gResolver.addBug(id); return "<a class='bug" + id + "' href=\'#" + id + "\'>" + match + "</a>"; }, "gm");
      text = text.replace(QUOTEREGEXP, function(match) {return "<span class='quotedtext'>" + match + "</span>";}, "gm");
      text = text.replace(REPLYREGEX, function(match) {return "<span class='quotedtext'>" + match + "</span>";}, "gm");
      return {text:text, isMarkdown: false};
    }
  },

  showError: function(node, msg) {
    if (msg) node.setAttribute("error", msg);
    node.classList.add("showerror");
    window.setTimeout(function() {
      node.removeAttribute("error");
      node.classList.remove("showerror");
    }, 1500);
  },

  showSuccess: function(node) {
    node.classList.add("showsuccess");
    window.setTimeout(function() {
      node.classList.remove("showsuccess");
    }, 1500);
  },
}

window.onload = function() {UI.init();}
