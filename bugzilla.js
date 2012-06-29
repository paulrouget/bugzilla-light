function getBugAndComments(bugid, onbug, oncomments) {
  let bugreq = new XMLHttpRequest();
  bugreq.onreadystatechange = function() {
    if(this.readyState == this.DONE) {
      newbug(JSON.parse(this.responseText));
    }
  }
  bugreq.open("GET", REMOTE + "/bug/" + bugid + urlCredentials(), true);
  bugreq.setRequestHeader("Content-Type", "application/json");
  bugreq.setRequestHeader("Accept", "application/json");
  bugreq.send();

  let commentreq = new XMLHttpRequest();
  commentreq.onreadystatechange = function() {
    if(this.readyState == this.DONE) {
      newcomments(JSON.parse(this.responseText));
    }
  }
  commentreq.open("GET", REMOTE + "/bug/" + bugid + "/comment" + urlCredentials(), true);
  commentreq.setRequestHeader("Content-Type", "application/json");
  commentreq.setRequestHeader("Accept", "application/json");
  commentreq.send();
}
