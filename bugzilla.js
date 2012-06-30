function getBugAndComments(bugid, onbug, oncomments) {
  document.body.classList.add("loading");

  let bugreq = new XMLHttpRequest();
  bugreq.onreadystatechange = function() {
    if (this.readyState == this.DONE) {
      newbug(JSON.parse(this.responseText));

      let commentreq = new XMLHttpRequest();
      commentreq.onreadystatechange = function() {
        if (this.readyState == this.DONE) {
          newcomments(JSON.parse(this.responseText));
          pageLoaded();
        }
      }
      commentreq.open("GET", REMOTE + "/bug/" + bugid + "/comment" + urlCredentials(), true);
      commentreq.setRequestHeader("Content-Type", "application/json");
      commentreq.setRequestHeader("Accept", "application/json");
      commentreq.send();
    }
  }
  bugreq.open("GET", REMOTE + "/bug/" + bugid + urlCredentials(), true);
  bugreq.setRequestHeader("Content-Type", "application/json");
  bugreq.setRequestHeader("Accept", "application/json");
  bugreq.send();
}

function resolveBugs() {
  let url = REMOTE + "/bug?include_fields=id,status,summary&id=";
  let empty = true;
  for (let bug in bugsToResolve) {
    empty = false;
    url += bug + ",";
  }
  if (empty) return;
  let req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (this.readyState == this.DONE) {
      updateBugRefs(JSON.parse(this.responseText).bugs);
    }
  }
  req.open("GET", url, true);
  req.setRequestHeader("Content-Type", "application/json");
  req.setRequestHeader("Accept", "application/json");
  req.send();
}
