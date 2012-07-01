let gTemplates = {
  outputs: Map(),
  render: function(templateName) {
    let s = $("script[template=" + templateName + "]");
    if (!s) {
      console.error("Invalid template specified");
      return;
    }

    if (this.outputs.has(s)) {
      let elt = this.outputs.get(s);
      elt.parentNode.removeChild(elt);
      this.outputs.delete(s);
    }

    let before = s.getAttribute("execbefore");
    if (before) eval(before);

    let tagname = s.getAttribute("tagname") || "div";
    let node = document.createElement(tagname);
    node.className = s.getAttribute("classlist");
    node.innerHTML = Mustache.render(s.textContent, gWorld);
    s.parentNode.insertBefore(node, s);
    this.outputs.set(s, node);

    let after = s.getAttribute("execafter");
    if (after) eval(after);
  },
}


