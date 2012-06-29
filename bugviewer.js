const REMOTE = "https://api-dev.bugzilla.mozilla.org/latest/";
const URLREGEXP = /(^|\s)((https?:\/\/)[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
const BUGREGEXP = /bug (\d+)/gi;

let gBug;

let bugsToResolve = {};

function buildBugUrl(id) {
  let hash = window.location.hash;
  return window.location.href.replace(hash, "#" + id);
}

function newbug(data) {
  gBug = data;
  let toexpand = $$(".toexpand");
  for (let elt of toexpand) {
    for (let i = 0; i < elt.attributes.length; i++) {
      let attr = elt.attributes[i].name;
      if (attr.indexOf("data-") == 0) {
        let subattr = attr.replace("data-", "");
        elt.setAttribute(subattr, expand(elt.dataset[subattr], gBug));
      }
    }
    let text = elt.dataset.text;
    if (text) elt.textContent = expand(text, gBug);
  }
  buildDependencyList();
  buildFollowersList();
}

function buildDependencyList() {
  for (let obj of [{in: gBug.depends_on, out: $(".dependencies > .dependson > dd")},
                   {in: gBug.blocks, out: $(".dependencies > .blockers > dd")}]) {
    if (obj.in) {
      let code = "";
      let first = true;
      for (let bug of obj.in) {
        if (!first) {
          code += "<span class='separator'></span>"
        }
        code += "<a class='bug" + bug + "' href='" + buildBugUrl(bug) + "'>" + bug + "</a>";
        if (!(bug in bugsToResolve)) {
          bugsToResolve[bug] = 42; // I want to use a Set. But Sets are not itterable yes.
        }
        first = false;
      }
      obj.out.innerHTML = code;
    }
  }
}

function getAvatars(root) {
  let targets = root.querySelectorAll("*[email]");
  for (let e of targets) {
    let email = e.getAttribute("email");
    e.classList.add("avatar");
    e.style.backgroundImage = "url(http://avatars.io/email/" + email + ")";
  }
}

function buildFollowersList() {
  let code = "<ul>";
  if (gBug.cc) {
    for (let body of gBug.cc) {
      code += expand("<li title='{name}' email='{name}'>{name} </li>", body);
    }
    code += "</ul>";
    $(".followers").innerHTML = code;
  }
  getAvatars($(".followers"));
}

function updateBugRefs(bugs) {
  for (let bug of bugs) {
    let nodes = document.querySelectorAll(".bug" + bug.id);
    for (let node of nodes) {
      node.setAttribute("status", bug.status);
      node.setAttribute("title", bug.summary);
    }
  }
}

function newcomments(data) {
  let section = $("#comments");
  let template = "<div class='comment'><p class='date'>{prettydate}<span class='commentcounter'> - #{counter}</span></p>"
     template += "<p class='author' email='{creator.name}'>{creator.name}</p><pre>{prettytext}</pre></div>\n";
  let html = "";
  let i = 0;
  let description;
  if (data.comments) {
    for (let c of data.comments) {
      if (i == 0) {
        description = buildDescription(c);
      } else {
        c.counter = i;
        c.prettytext = formatComment(c.text);
        c.prettydate = humaneDate(c.creation_time);
          html = expand(template, c) + html;
      }
      i++;
    }
    section.innerHTML = description + html;
  }
  getAvatars(section);
}

function buildDescription(c) {
  let h1 = expand("<h1>{alias} Bug {id} - {summary}</h1>", gBug);
  c.prettytext = formatComment(c.text);
  c.prettydate = humaneDate(c.creation_time);
  let template = "<div class='comment'>" + h1 + "<p class='date'>{prettydate}</p><p class='author' email='{creator.name}'>{creator.name}</p><pre>{prettytext}</pre></div>\n";
  return expand(template, c);
}

function formatComment(text) {
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
    if (!(id in bugsToResolve)) {
      bugsToResolve[id] = 42; // I want to use a Set. But Sets are not itterable yes.
    }
    return "<a class='bug" + id + "' href=\'" + buildBugUrl(id) + "\'>" + match + "</a>";
  });
  return text;
}


console.log("-----------------------------------");
tryToLogin(function(logged) {
  window.onhashchange = function handleNewLocation() {
    let bugid = parseInt(window.location.hash.split("#")[1]);
    if (isNaN(bugid)) {
      alert("Bug id incorrect");
    } else {
      getBugAndComments(bugid, newbug, newcomments);
    }
  }
  window.onhashchange();
});
