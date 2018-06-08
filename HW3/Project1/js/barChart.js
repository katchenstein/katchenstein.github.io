/** Class implementing the bar chart view. */
class BarChart {

    /**
     * Create a bar chart instance and pass the other views in.
     * @param worldMap
     * @param infoPanel
     * @param allData
     */

    constructor(worldMap, infoPanel, allData) {
        this.worldMap = worldMap;
        this.infoPanel = infoPanel;
        this.allData = allData;

        this.width = 500;
        this.height = 400;
        this.padding = 50;
    }
    /**
     * Render and update the bar chart based on the selection of the data type in the drop-down box
     */
    createBarChart(selectedDimension) {
        
        // ******* TODO: PART I *******
        // Create the x and y scales; make
        // sure to leave room for the axes
        // Create colorScale
        // Create the axes (hint: use #xAxis and #yAxis)
        // Create the bars (hint: use #bars)
        var svg = d3.select('#barChart'),
            data = this.allData.map(function(item) { return item[selectedDimension] }),
            min = d3.min(data),
            max = d3.max(data),
            x = d3.scaleBand()
                .domain(this.allData.map(function(item) { return item.year }))
                .range([this.padding, this.width - this.padding]),
            y = d3.scaleLinear()
                .domain([min, max])
                .range([this.height - this.padding, this.padding]),
            colorScale = d3.scaleLinear()
                .domain([min, max])
                .range(["DarkBlue", "DeepSkyBlue"]),
            xAxis = d3.axisBottom(x),
            yAxis = d3.axisLeft(y),
            bars = svg.append('g')
                .attr('class', 'rectangles')
                .selectAll('rect').data(this.allData);



        svg.append('g').attr('class', 'yaxis').attr('transform', 'translate(50, 0)').call(yAxis);
        svg.append('g').attr('class', 'xaxis').attr('transform', 'translate(0, 350)')
        .call(xAxis).selectAll('text').attr('x', 7).attr('y', -5).attr('transform','rotate(90)').style("text-anchor", "start");


        bars.enter().append('rect')
                .attr('x', function(d, i) { return i * 20 + 55 })
                .attr('width', 10)
                .style('fill', function (d) { return colorScale(d[selectedDimension]); })
                .attr('id', function(d) { return d.year })
                .attr('y', function(d) { return y(d[selectedDimension])} )
                .attr('height', function(d) {  return 350 - y(d[selectedDimension]); })


        // ******* TODO: PART II *******
   
        var years = this.allData.map(function(item) { return item.year }),
            allData = this.allData,
            worldMap = this.worldMap,
            infoPanel = this.infoPanel,
            selected = [];

        // Implement how the bars respond to click events
        // Color the selected bar to indicate is has been selected.
        // Make sure only the selected bar has this new color.
        svg.selectAll('rect').on('click', function(d) {
           if(selected.includes(this.id)){ } 
            else {
                d3.select('.selected').attr('class', null)
                .style('fill', function(d) { return colorScale(d[selectedDimension]) });
                selected = []; selected.push(this.id);
                d3.select(this).attr('class', 'selected').style('fill', '#d20a11'); 
            }
            var selectedWorldCup = years.indexOf(+this.id)
            var worldcupData = allData[selectedWorldCup];

        // Call the necessary update functions for when a user clicks on a bar.
        // Note: think about what you want to update when a different bar is selected.
            worldMap.updateMap(worldcupData);
            infoPanel.updateInfo(worldcupData);
        })
    }

    /**
     *  Check the drop-down box for the currently selected data type and update the bar chart accordingly.
     *
     *  There are 4 attributes that can be selected:
     *  goals, matches, attendance and teams.
     */
    updateBarChart(selectedDimension) {
        // ******* TODO: PART I *******
        //Changed the selected data when a user selects a different
        // menu item from the drop down.
        var svg = d3.select('#barChart'),
            data = this.allData.map(function(item) { return item[selectedDimension] }),
            min = d3.min(data),
            max = d3.max(data),
            y = d3.scaleLinear().domain([min, max]).range([this.height - this.padding, this.padding]),
            yAxis = d3.axisLeft(y);

        svg.select('.yaxis').transition().duration(1000).call(yAxis);
        
        svg.selectAll('rect').transition().duration(1000)
                .attr('y', function(d) { return y(d[selectedDimension])} )
                .attr('height', function(d) {  return 350 - y(d[selectedDimension]); });
        

    }
}