let gKeyBindings = {
  init: function() {
    $(".comments").addEventListener("keyup", function(e) {
      let current = $(".comment:focus");
      if (!current) return;
      let node = current;
      let top = current.getBoundingClientRect().top;
      switch (e.keyCode) {
        case e.DOM_VK_J:
          do {
            node = node.nextSibling;
          } while (node && node.nodeType == 3); // text node
          if (node && node.classList.contains("comment")) {
            node.focus();
            let rect = node.getBoundingClientRect();
            document.documentElement.scrollTop += rect.top - top;
          }
          break;
        case e.DOM_VK_K:
          do {
            node = node.previousSibling;
          } while (node && node.nodeType == 3); // text node
          if (node && node.classList.contains("comment")) {
            node.focus();
          }
          break;
        case e.DOM_VK_G:
          let comments = $$(".comment");
          if (!e.shiftKey) {
            document.documentElement.scrollTop = 0;
            comments[0].focus();
          } else {
            comments[comments.length - 1].focus();
            document.documentElement.scrollTop = document.body.scrollHeight;
          }
          break;
        default:
      }
    }, true);
  },
}
