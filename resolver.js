let gResolver = {
  bugs: [],
  addBug: function(bug) {
    this.bugs.push(+bug);
  },
  addDependencies: function() {
    if (gWorld.bug.depends_on) {
      this.bugs = this.bugs.concat(gWorld.bug.depends_on);
    }
    if (gWorld.bug.blocks) {
      this.bugs = this.bugs.concat(gWorld.bug.blocks);
    }
  },
  uniquify: function() {
    this.bugs = this.bugs.sort().filter(function(el,i,a) {
      if(i == a.indexOf(el))
        return 1;
      return 0;
    })
  },
  resolveBugs: function() {
    this.uniquify();
    gNetwork.resolveBugs(this.bugs, function(bugs) {
      if (!bugs) {
        log("Error while resolving bugs");
        return;
      }
      for (let bug of bugs) {
        let nodes = document.querySelectorAll(".bug" + bug.id);
        for (let node of nodes) {
          node.setAttribute("status", bug.status);
          node.setAttribute("title", bug.summary);
        }
      }
    });
  },
}
