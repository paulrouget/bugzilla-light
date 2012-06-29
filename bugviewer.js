const REMOTE = "https://api-dev.bugzilla.mozilla.org/latest/";
const URLREGEXP = /(^|\s)((https?:\/\/)[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;

let gBug;

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
  $("#meta").classList.remove("loading");
}

function buildDependencyList() {
  let code = "";
  if (gBug.depends_on) {
    for (let bug of gBug.depends_on) {
      code += "<a>" + bug + "</a>";
    }
    $(".dependencies > .dependson > dd").innerHTML = code;
  }

  code = "";
  if (gBug.blocks) {
    for (let bug of gBug.blocks) {
      code += "<a>" + bug + "</a>";
    }
    $(".dependencies > .blockers > dd").innerHTML = code;
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

function newcomments(data) {
  let section = $("#comments");
  let template = "<div class='comment'><p class='date'>{prettydate}<span class='commentcounter'> - #{counter}</span></p><p class='author' email='{creator.name}'>{creator.name}</p><pre>{prettytext}</pre></div>\n";
  let html = "";
  let i = 0;
  let description;
  if (data.comments) {
    for (let c of data.comments) {
      if (i == 0) {
        description = buildDescription(c);
      } else {
      }
      c.counter = i++;
      c.prettytext = formatComment(c.text);
      c.prettydate = humaneDate(c.creation_time);
        html = expand(template, c) + html;
    }
    section.innerHTML = description + html;
  }
  comments.classList.remove("loading");
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
    } else {
      lines[i] = lines[i].replace(URLREGEXP, function(match) {
        return "<a href=\'" + match + "\'>" + match + "</a>";
      });
    }
  }
  return lines.join("\n");
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
