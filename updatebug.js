let gUpdate = {

  /* WHITE BOARD */
  whiteboard: function() {
    let form = $("#form-whiteboard");
    form.classList.add("loading");
    form.setAttribute("disabled", "true");
    let shell = {whiteboard: form.value};
    gBz.updateBug(gWorld.bugid, shell,
      function(error, success) {
        form.classList.remove("loading");
        form.setAttribute("disabled", "true");
        if (error || !success) {
          console.error("Error while updating whiteboard list");
          return;
        }
    });
    return false;
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
      gWorld.comments = this.preprocessComments(comments);
      this.renderTemplateOfType("oncomments");
      callback();
    }.bind(this));
  },
}
