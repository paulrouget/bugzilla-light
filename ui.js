let UI = {
  templates: new Map(),
  init: function() {
    window.onhashchange = this.handleBug.bind(this);
    this.renderTemplateOfType("onload");
    this.handleBug();
    if (localStorage.username) {
      this.onLoggedIn();
    }
  },
  logout: function() {
    localStorage.username = localStorage.password = null;
    document.body.classList.remove("connected");
    this.renderTemplateOfType("onlogin");
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
    this.renderTemplateOfType("onlogin");
  },

  handleBug: function() {
    let bug = parseInt(window.location.hash.split("#")[1]);
    if (bug == gWorld.bugid) return;
    if (isNaN(bug)) {
      console.error("Not a bug number");
      gWorld.bug = null;
      document.body.classList.add("nobug");
      document.body.classList.remove("bugloaded");
      document.body.classList.remove("bugloading");
    } else {
      gWorld.bugid = bug;
      console.log("found a bug number: " + bug);
      document.body.classList.remove("nobug");
      document.body.classList.remove("bugloaded");
      document.body.classList.add("bugloading");
      this.fetchBugAndComments(bug, function() {
        gResolver.resolveBugs();
        gKeyBindings.init();
        this.buildFollowButton();
      }.bind(this));
    }

  },

  fetchBugAndComments: function(bugid, callback) {
    document.body.classList.add("bugloading");
    gBz.getBug(bugid, function(error, bug) {
      document.body.classList.remove("bugloading");
      if (error) {
        console.error("Error: didn't manage to fetch the bug.");
        return;
      }
      document.body.classList.add("bugloaded");
      gWorld.bug = bug;
      gWorld.originalBug = JSON.parse(JSON.stringify(bug)); // copy
      gResolver.addDependencies();
      gBz.bugComments(bugid, function(error, comments) {
        if (error) {
          console.error("Error: didn't manage to fetch the comments.");
          return;
        }
        gWorld.comments = this.preprocessComments(comments);
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
      let prettytext = this.formatComment(c.text);
      c.formatedtext = prettytext.text;
      c.markdown = prettytext.isMarkdown ? "markdown" : "";
    }
    return comments;
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

  renderTemplateOfType: function(type) {
    let toExpand = $$("script[when=" + type + "]");
    for (let s of toExpand) {
      if (this.templates.has(s)) {
        let elt = this.templates.get(s);
        elt.parentNode.removeChild(elt);
        this.templates.delete(s);
      }
      let tagname = s.getAttribute("tagname") || "div";
      let node = document.createElement(tagname);
      node.className = s.getAttribute("classlist");
      node.innerHTML = Mustache.render(s.textContent, gWorld);
      s.parentNode.insertBefore(node, s);
      this.templates.set(s, node);
    }
  },

  buildFollowButton: function() {
    // cc'ed?
    let cced = false;
    if (gWorld.bug.cc) {
      for (let user of gWorld.bug.cc) {
        if (user.name == gWorld.username) {
          cced = true;
          break;
        }
      }
    }

    cced ? $(".meta").classList.add("cced") :
           $(".meta").classList.remove("cced");

    gBz.getUser(gWorld.username, function(error, user) {
      if (error) {
        console.error("Error while fetching user info");
        return;
      }
      gWorld.userdef = user;
    });
  },

  follow: function() {
    if (gWorld.userdef) {
      gWorld.originalBug.cc.push(gWorld.userdef.ref);
      gBz.updateBug(gWorld.bugid, gWorld.originalBug,
        function(error, success) {
          if (error || !success) {
            console.error("Error while updating cc list");
            return;
          }
          $(".meta").classList.add("cced");
      });
    }
  },
}

window.onload = function() {UI.init();}
