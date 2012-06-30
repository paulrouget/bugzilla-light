console.log("-----------------------------------");
tryToLogin(function(logged) {
  window.onhashchange = handleNewLocation;
  function handleNewLocation() {
    let bugid = parseInt(window.location.hash.split("#")[1]);
    if (isNaN(bugid)) {
      alert("Bug id incorrect");
    } else {
      getBugAndComments(bugid, newbug, newcomments);
    }
  }
  handleNewLocation();
});

function pageLoaded() {
  document.body.classList.remove("loading");
  setupLocalNotes();
  resolveBugs();
  setupKeys();
}

function setupKeys() {
  $$(".comment")[0].focus();
  $("#comments").addEventListener("keyup", function(e) {
    console.dir(e);
    console.log("fo");
    let current = $(".comment:focus");
    if (!current) return;
    let node = current;
    let top = current.getBoundingClientRect().top;
    switch (e.keyCode) {
      case e.DOM_VK_J:
        do {
          node = node.nextSibling;
        } while (node && node.nodeType == 3); // text node
        if (node) {
          node.focus();
          scrollElt(node, top);
        }
        break;
      case e.DOM_VK_K:
        do {
          node = node.previousSibling;
        } while (node && node.nodeType == 3); // text node
        if (node) {
          node.focus();
          //scrollElt(node, top);
        }
        break;
      case e.DOM_VK_G:
        if (!e.shiftKey) {
          document.documentElement.scrollTop = 0;
          $(".comment:first-of-type").focus();
        } else {
          $(".comment:last-of-type").focus();
        }
        break;
      default:
    }
  }, true);

}

function scrollElt(elt, prev) {
  let rect = elt.getBoundingClientRect();
  document.documentElement.scrollTop += rect.top - prev;
}

function setupLocalNotes() {
  let node = $("#localnotes");
  let key = "notes" + gBug.id;

  node.value = localStorage.getItem(key) || "";
  node.addEventListener("input", function() {
    localStorage.setItem("notes" + gBug.id, node.value); // can be very slow.
  }, true);
}
