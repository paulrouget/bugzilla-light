function $(query) { return document.querySelector(query)}
function $$(query) { return document.querySelectorAll(query)}
let logidx = 0; function log(msg) { $(".glog").textContent = logidx++ + ": " + msg + "\n" + $(".glog").textContent; }
