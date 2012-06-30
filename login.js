let gEmail = "";

function login(callback) {
  let username = $("#loginusername").value;
  let password = $("#loginpassword").value;
  let credentials = {};
  credentials.username = username ? username : "wrong@wrong";
  credentials.password = password ? password : "wrong@wrong";

  let url = REMOTE + "/user?username={username}&password={password}";
  url = expand(url, credentials);
  let req = new XMLHttpRequest();
  req.onreadystatechange = function(e) {
    if(this.readyState == this.DONE) {
      if (this.status == 200) {
        localStorage.username = credentials.username;
        localStorage.password = credentials.password;
        document.body.classList.add("connected");
        $("#whoyouare").textContent = "<" + credentials.username + ">";
        gEmail = credentials.username;
        callback(true);
      } else {
        document.body.classList.remove("connected");
        $("#loginusername").value = "";
        $("#loginpassword").value = "";
        $("#loginusername").placeholder = "nope";
        $("#loginpassword").placeholder = "nope";
        delete localStorage.username;
        delete localStorage.password;
        callback(false);
      }
    }
  }
  req.open("GET", url, true);
  req.setRequestHeader("Content-Type", "application/json");
  req.setRequestHeader("Accept", "application/json");
  req.send();
}

function getCredentials() {
  if ("username" in localStorage &&
      "password" in localStorage) {
    return {username: localStorage.username,
      password: localStorage.password};
  } else {
    return null;
  }
}

function urlCredentials() {
  let credentials = getCredentials();
  if (credentials) {
    let url = "?username={username}&password={password}";
    return expand(url, credentials);
  } else {
    return "";
  }
}

function tryToLogin(callback) {
  let credentials = getCredentials();
  if (credentials) {
    $("#loginusername").value = credentials.username;
    $("#loginpassword").value = credentials.password;
    login(callback);
  } else {
    callback(false);
  }
}
