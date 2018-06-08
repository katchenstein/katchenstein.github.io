/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(teamData, treeObject) {

        //Maintain reference to the tree Object; 
        this.tree = treeObject; 

        // Create list of all elements that will populate the table
        // Initially, the tableElements will be identical to the teamData
        this.tableElements = teamData; // 

        ///** Store all match data for the 2014 Fifa cup */
        this.teamData = teamData;

        //Default values for the Table Headers
        this.tableHeaders = ["Delta Goals", "Result", "Wins", "Losses", "TotalGames"];

        /** To be used when sizing the svgs in the table cells.*/
        this.cell = {
            "width": 70,
            "height": 20,
            "buffer": 15
        };

        this.bar = {
            "height": 20
        };

        /** Set variables for commonly accessed data columns*/
        this.goalsMadeHeader = 'Goals Made';
        this.goalsConcededHeader = 'Goals Conceded';

        /** Setup the scales*/
        this.goalScale = d3.scaleLinear();
        

        /** Used for games/wins/losses*/
        this.gameScale = d3.scaleLinear();

        /**Color scales*/
        /**For aggregate columns  Use colors '#ece2f0', '#016450' for the range.*/
        this.aggregateColorScale = d3.scaleLinear();

        /**For goal Column. Use colors '#cb181d', '#034e7b'  for the range.*/
        this.goalColorScale = d3.scaleLinear(); 

    }


    /**
     * Creates a table skeleton including headers that when clicked allow you to sort the table by the chosen attribute.
     * Also calculates aggregate values of goals, wins, losses and total games as a function of country.
     *
     */
    createTable() {

        // ******* TODO: PART II *******

        //Update Scale Domains
        this.goalScale
        .domain([d3.min(this.teamData.map(function(item) { return item.value['Goals Made'] })), d3.max(this.teamData.map(function(item) { return item.value['Goals Made'] }))])
        .range([0, this.cell.width * 2 - 5]);

        // Create the x axes for the goalScale.
        var GoalAxis = d3.axisBottom().scale(this.goalScale)

        //add GoalAxis to header of col 1.
        d3.select('#goalHeader').append('svg').attr('width', this.cell.width * 2 + 2)
        .attr('height', this.cell.height).call(GoalAxis)
        
        // ******* TODO: PART V *******

        // Set sorting callback for clicking on headers
        // Clicking on headers should also trigger collapseList() and updateTable(). 
        let table = new Table(this.tableElements ,this.tree);
        d3.select('thead').selectAll('td')
        .each(function(d, i) {
            d3.select(this).on('click', function() {
            var  headerIndex = i;
            table.sortTable(headerIndex); }); }); 
    }


    /**
     * Updates the table contents with a row for each element in the global variable tableElements.
     */
    updateTable() {
        // ******* TODO: PART III *******
        //Create table rows
        var rows = d3.select('tbody').selectAll('tr').data(this.tableElements)
       	.enter().append('tr')

        //Append th elements for the Team Names
        let table = new Table(this.tableElements ,this.tree);
        rows.append('th').text(function(d) { return d.key })
        .on('click', function(d, i) { 
        	if (d.value.type == 'aggregate') {
        		if (d3.select(this.parentNode.nextSibling).datum().value.type == 'aggregate') {
        			table.updateList(i);	}
        		else {table.collapseList(i);}
        	}
        	else {}
        	});
        	

        rows.filter(function(d) { return d.value.type == 'game' })
        	.select('th').text(function(d) { return 'x' + d.key })
        	.style('color', 'LightGray')

        //Append td elements for the remaining columns. 
        //Data for each cell is of the type: {'type':<'game' or 'aggregate'>, 'value':<[array of 1 or two elements]>}
        var td = rows.selectAll('td')
            .data(function(d) { return [{'type': d.value.type, 'vis': 'Goals',
        	 'value': [d.value['Goals Made'] - d.value['Goals Conceded'], d.value['Goals Conceded'], d.value['Goals Made']]},
        	  {'type': d.value.type, 'vis': 'Round/Rsult', 'value': d.value.Result.label},
        	  {'type': d.value.type, 'vis': 'Wins', 'value': d.value.Wins},
        	  {'type': d.value.type, 'vis': 'Losses', 'value': d.value.Losses},
        	  {'type': d.value.type, 'vis': 'TotalGames', 'value': d.value.TotalGames}  ]})
            .enter().append('td')


        td.filter(function(d) { return d.vis == 'Round/Rsult' })
        .append('text').text(function(d) { return d.value });

        var gameScalemin = d3.min(this.tableElements.map(function(item) { return item.value.Wins})),
            gameScalemax = d3.max(this.tableElements.map(function(item) { return item.value.TotalGames})),
            gameScale = this.gameScale
                .domain([gameScalemin, gameScalemax])
                .range([0, this.cell.width]),
            aggregateColorScalemin = d3.min(this.tableElements.map(function(item) { return item.value.Wins})),
            aggregateColorScalemax = d3.max(this.tableElements.map(function(item) { return item.value.TotalGames})),
            aggregateColorScale = this.aggregateColorScale
                .domain([aggregateColorScalemin, aggregateColorScalemax])
                .range(['#ece2f0', '#016450']);


        var Wins = td.filter(function(d) { return d.vis === 'Wins' || d.vis === 'Losses' || d.vis === 'TotalGames' })
        	.filter(function(d) { return d.type == 'aggregate' })
            .append('svg').attr('width', this.cell.width)
            .attr('height', this.cell.height);

            Wins.append('rect').attr('x', 0).attr('y', 0).attr('height', this.cell.height)
        	.attr('width', function(d) { return gameScale(d.value) })
        	.attr('fill', function(d) { return aggregateColorScale(d.value) });

            Wins.append('text')
            .attr('x',  function(d) { return gameScale(d.value) - 10})
            .attr('y', this.cell.height)
            .text(function(d) { return d.value })
            .attr('class', 'label');
        	 
        var goalScalemin =d3.min(this.tableElements.map(function(item) { return item.value['Goals Made'] })),
            goalScalemax = d3.max(this.tableElements.map(function(item) { return item.value['Goals Made'] })),
            goalScale = this.goalScale
                .domain([goalScalemin, goalScalemax])
                .range([5, this.cell.width * 2 - 10]),
            goalColorScalemin = d3.min(this.tableElements.map(function(item) { return item.value['Delta Goals'] })),
            goalColorScalemax = d3.max(this.tableElements.map(function(item) { return item.value['Delta Goals'] })),
            goalColorScale = this.goalColorScale
                .domain([goalColorScalemin, 0, goalColorScalemax])
                .range(['#cb181d', 0, '#034e7b']);

        var Goals = td.filter(function(d) { return d.vis == 'Goals' })
        	.filter(function(d) { return d.type == 'aggregate' })
        	.append('svg')
            .attr('width', this.cell.width * 2 - 5)
            .attr('height', this.cell.height);

        //Create diagrams in the goals column
            Goals.append('rect').attr('class', 'goalBar')
            .attr('y', this.cell.height / 2 - 5)
        	.attr('x', function(d) { if(d.value[0] > 0) {
        		return goalScale(d.value[1]) +1 }
        		else { return goalScale(d.value[2]) }})
        	.attr('width', function(d) { if(d.value[0] > 0) {
        		return goalScale(d.value[0]) }
        		else if(d.value[0] == 0) { return null }
        		else { return goalScale(- d.value[0])}})
        	.attr('height', 10)
            .attr('class', 'goalBar')
        	.attr('fill', function(d) { if(d.value[0] > 0) { return '#034e7b' }
        		else if(d.value[0] == 0) { return null }
        		else{ return '#cb181d' } });

            Goals.append('circle')
            .attr('class', 'goalCircle')
            .attr('cy', this.cell.height / 2)
        	.attr('cx', function(d) { return goalScale(d.value[1]) })
        	.attr('fill','#cb181d');

            Goals.append('circle')
            .attr('class', 'goalCircle')
            .attr('cy', this.cell.height / 2)
        	.attr('cx', function(d) { return goalScale(d.value[2]) })
        	.attr('fill', '#034e7b');
        

        var Goal = td.filter(function(d) { return d.vis == 'Goals' })
        	.filter(function(d) { return d.type == 'game' })
        	.append('svg').attr('width', this.cell.width * 2 - 5)
            .attr('height', this.cell.height);

            Goal.append('rect').attr('class', 'goalBar')
            .attr('y', this.cell.height / 2 - 2)
        	.attr('x', function(d) { 
                if(d.value[0] > 0) { return goalScale(d.value[1]) + 2 }
        		else { return goalScale(d.value[2])  + 2}})
        	.attr('width', function(d) { 
                if(goalScale(d.value[0]) > 2) { return goalScale(d.value[0]) - 2}
        		else if (goalScale(d.value[0]) < -3) { return goalScale(- d.value[0]) - 3}
                else if (2 < goalScale(d.value[0]) > -3){ return null }})
        	.attr('height', 5)
        	.attr('fill', function(d) { 
                if(d.value[0] > 0) { return '#034e7b' }
        		else if(d.value[0] == 0) { return null }
        		else{ return '#cb181d' } });
            
            Goal.append('circle')
            .attr('class', 'goalCircle')
            .attr('cy', this.cell.height / 2)
        	.attr('cx', function(d) { return goalScale(d.value[1]) })
        	.attr('stroke','#cb181d').attr('fill', 'none');

            Goal.append('circle')
            .attr('class', 'goalCircle')
            .attr('cy', this.cell.height / 2)
        	.attr('cx', function(d) { return goalScale(d.value[2]) })
        	.attr('stroke', '#034e7b').attr('fill', 'none');
        
        
        //Add scores as title property to appear on hover
        //Populate cells (do one type of cell at a time )
        //Set the color of all games that tied to light gray
        let tree = this.tree
        d3.select('tbody').selectAll('tr').filter(function(d) { return d.value.type == 'aggregate' })
        .on('mouseover', function(d){ tree.updateTree(d) })
        .on('mouseout', function(d){ tree.clearTree() });
    };

    /**
     * Updates the global tableElements variable, with a row for each row to be rendered in the table.
     *
     */
    updateList(i) {
        // ******* TODO: PART IV *******
        //Only update list for aggregate clicks, not game clicks
       let Games = this.tableElements[i].value.games
       for (var index = 0; index < Games.length; index++) {
       		this.tableElements.splice(i + index + 1, 0, Games[index])  }


       	d3.select('tbody').selectAll('tr').remove()
       	let table = new Table(this.tableElements ,this.tree);	
       	table.updateTable();
    }

    /**
     * Collapses all expanded countries, leaving only rows for aggregate values per country.
     *
     */
    collapseList(i) {

        // ******* TODO: PART IV *******
        var Remove = this.tableElements[i].value.games.length;
        this.tableElements.splice(i + 1, Remove);

        d3.select('tbody').selectAll('tr').remove();
        let table = new Table(this.tableElements ,this.tree);
        table.updateTable();
    }

    sortTable(headerIndex) {
    	// Remove elements
    	var a = [];
        var types = this.tableElements.map(function(item){ return item.value.type });
        for (var i=0; i < types.length; i++){
        	if(types[i] == 'game') { a.push(i) }}
        for (i=a.length - 1; i>=0; i--){
		this.tableElements.splice(a[i], 1) }

		// Sort array
		var header = this.tableHeaders[headerIndex],
            arr = this.tableElements.map(function(item) { return item.value[header] });
    
        for (var i = 0; i < arr.length - 1; i++) {
            if (arr[i] < arr[i+1]) {
                this.tableElements.sort(function(a,b) { 
                return d3.descending(a.value[header], b.value[header])}) }
            else { this.tableElements.sort(function(a,b) { 
                    return d3.ascending(a.value[header], b.value[header]) }) } 
        };


        let table = new Table(this.tableElements ,this.tree);
    	d3.select('tbody').selectAll('tr').remove();
        table.updateTable();
    };

}
