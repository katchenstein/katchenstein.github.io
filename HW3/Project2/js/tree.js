/** Class implementing the tree view. */
class Tree {
    /**
     * Creates a Tree Object
     */
    constructor() {
        
    }

    /**
     * Creates a node/edge structure and renders a tree layout based on the input data
     *
     * @param treeData an array of objects that contain parent/child information.
     */
    createTree(treeData) {

        // ******* TODO: PART VI *******

        //Create a tree and give it a size() of 800 by 300. 
        var tree = d3.tree().size([800, 300]);

        //Create a root for the tree using d3.stratify(); 
        var root = d3.stratify()
            .id(function(d) { return d.id })
            .parentId(function(d) { return d.ParentGame })
            (treeData); 
        
        //Add nodes and links to the tree. 
        var nodes = d3.hierarchy(root, function(d) { return d.children })
        nodes = tree(nodes)

        var g = d3.select('#tree'),
            link = g.selectAll('path')
                .data(nodes.descendants().slice(1))
                .enter().append('path')
                .attr('class', 'link')
                .attr('d', function(d){
                    return "M" + d.y + "," + d.x
                    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                    + " " + d.parent.y + "," + d.parent.x;  }),
            node = g.selectAll('.node').data(nodes.descendants())
                .enter().append('g')
                .attr('class', 'node')
                .attr('transform', function(d) {
                    return "translate(" + d.y + "," + d.x + ")"; }) 

        node.append('circle').attr('r', 10)
            .style('fill', function(d) {
                if(d.data.data.Wins == 1) { return '#364e74' }
                else { return '#cb181d' } });
        node.append('text')
            .attr('dy', '.35em')
            .attr('x', function(d) { return d.children ? -13 : 13 })
            .attr('text-anchor', function(d) {
                return d.children ? "end" : "start" })
            .text(function(d) { return d.data.data.Team });

        g.attr('transform', 'translate(100, 0)');
             
    };

    /**
     * Updates the highlighting in the tree based on the selected team.
     * Highlights the appropriate team nodes and labels.
     *
     * @param row a string specifying which team was selected in the table.
     */
    updateTree(row) {
        // ******* TODO: PART VII *******
        d3.select('#tree').selectAll('path').filter(function(d){ return d.data.data.Team.includes(row.key) })
            .filter(function(d){ return d.data.data.Wins == 1 }).attr('class', 'selected')

        d3.select('#tree').selectAll('text').filter(function(d){ return d.data.data.Team.includes(row.key) })
            .attr('class', 'selectedLabel')
    }

    /**
     * Removes all highlighting from the tree.
     */
    clearTree() {
        // ******* TODO: PART VII *******
        d3.select('#tree').selectAll('path').attr('class', 'link')
        d3.select('#tree').selectAll('text').attr('class', null)
        // You only need two lines of code for this! No loops! 
    }
}
