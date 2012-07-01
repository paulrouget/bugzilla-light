let gUpdate = {
  commit: function(source, templateName) {
    console.log("gUpdate.commit");
    let bug;
    if (source.tagName && source.tagName == "FORM") {
      // It's a form
      bug  = {};
      for (let elt of source.elements) {
        let name = elt.name;
        // build obj
        let words = name.split(".");
        let ref = bug;
        let word = words[0];
        for (let i = 0; i < (words.length - 1); i++) {
          if (!(word in ref)) {
            ref[word] = {};
          }
          ref = ref[word];
          word = words[i + 1];
        }
        ref[word] = elt.value;
      }
    } else {
      // It's an object
      bug = source;
    }

    let s = $("script[template=" + templateName + "]");
    let node = gTemplates.outputs.get(s);


    if (this.committing) {
      UI.showError(node, "already submitting data");
      console.error("already submitting data");
      return;
    }
    if (!gWorld.token) {
      UI.showError(node, "no token found (connected?)");
      console.error("No token found");
      return;
    }

    bug.token = gWorld.token;

    this.committing = true;
    node.classList.add("loading");

    gBz.updateBug(gWorld.bugid, bug,
      function(error, success) {
        if (error || !success) {
          console.error("Error while updating bug");
          UI.showError(node, "mid-air? wrong username?");
          gUpdate.committing = false;
          node.classList.remove("loading");
          return;
        }
        gBz.getBug(gWorld.bug.id, null, function(error, bug) {
          gUpdate.committing = false;
          if (error) {
            console.error("Error while retrieving bug");
            return;
          }
          gWorld.bug = bug
          gWorld.token = bug.update_token;
          gTemplates.render(templateName);
          let node = gTemplates.outputs.get(s);
          UI.showSuccess(node);
        });
    });
  },

  /* COMMENTS */

  postComment: function() {
    let text = $(".addcomment > textarea").value;
    let comment = {text: text};
    let id = gWorld.bugid;
    $(".comments").classList.add("loading");
    if (comment) {
      gBz.addComment(id, comment, function(error, success) {
        if (error || !success) {
          $(".comments").classList.remove("loading");
          console.error("Error while posting comment:" + error);
          return;
        }
        this.updateComments(function() {
          $(".comments").classList.remove("loading");
        });
      }.bind(this));
    }
  },

  updateComments: function(callback) {
    // FIXME: no need to go through all the comments…
    gBz.bugComments(gWorld.bugid, function(error, comments) {
      if (error) {
        console.error("Error: didn't manage to fetch the comments.");
        callback();
        return;
      }
      gWorld.comments = comments;
      gTemplates.render("comments");
      callback();
    }.bind(this));
  },

  /* Follow */

  follow: function() {
    if (gWorld.userdef) {
      let newCc = gWorld.bug.cc.concat([gWorld.userdef]);
      this.commit({cc: newCc}, "followers");
    } else {
      if (gWorld.username) {
        let node = gTemplates.outputs.get($("script[template=followers]"));
        node.classList.add("loading");
        gBz.getUser(gWorld.username, function(error, user) {
          node.classList.remove("loading");
          if (error) {
            UI.showError(node, "can't get user info");
            return;
          }
          gWorld.userdef = user;
          gUpdate.follow();
        });
      }
    }
  },

  unfollow: function() {
    let newCc = gWorld.bug.cc.filter(function(body) {
      return (body.name != gWorld.username);
    });
    this.commit({cc: newCc}, "followers");
  },

  updateToken: function(callback) {
    gBz.getBug(gWorld.bug.id, {include_fields: "id,update_token"}, function(error, data) {
      gWorld.token = data.update_token;
      console.log("token update: " + gWorld.token);
      callback();
    });
  },

}
