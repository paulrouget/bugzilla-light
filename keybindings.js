let gKeyBindings = {
  init: function() {
  },
  init: function() {
    window.addEventListener("keyup", function(e) {
      let current = $(".comment:focus");
      let node = current;
      let top;
      if (current) {
        top = current.getBoundingClientRect().top;
      }
      switch (e.keyCode) {
        case e.DOM_VK_J:
          if (!node) return;
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
          if (!node) return;
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
            current && comments[0].focus();
          } else {
            current && comments[comments.length - 1].focus();
            document.documentElement.scrollTop = document.body.scrollHeight;
          }
          break;
        default:
      }
    }, true);
  },
}
