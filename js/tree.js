var layoutInfo = {
    startTab: "none", startNavTab: "tree-tab",
    showTree: true, treeLayout: ""
}

addNode("blank", { layerShown: "ghost" })
addLayer("tree-tab", {
    tabFormat: [["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}]],
    previousTab: "", leftTab: true,
})