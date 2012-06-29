function $(query) { return document.querySelector(query)}
function $$(query) { return document.querySelectorAll(query)}

// http://github.com/premasagar/tim/
var expand = (function(){
    "use strict";
    var start = "{",
        end = "}",
        path = "[a-z0-9_][\\.a-z0-9_|]*", // e.g. config.person.name
        pattern = new RegExp(start + "\\s*("+ path +")\\s*" + end, "gi"),
        undef;
    return function(template, data){
      // Merge data into the template string
      return template.replace(pattern, function(tag, token) {
        let paths = token.split("|");
        for (let path of paths) {
          var words = path.split("."),
              len = words .length,
              lookup = data,
              i = 0;
          for (; i < len; i++) {
            lookup = lookup[words[i]];
            if (lookup === undef) {
              break;
            }
            if (i === len - 1){return lookup;}
          }
        }
        return "";
      });
    };
}());


