/** Class implementing the map view. */
class Map {
    /**
     * Creates a Map Object
     */
    constructor() {
        this.projection = d3.geoConicConformal().scale(150).translate([400, 350]);
    }
    /**
     * Function that clears the map
     */
    clearMap() {

        // ******* TODO: PART V*******
        // Clear the map of any colors/markers; You can do this with inline styling or by
        // defining a class style in styles.css
        d3.select('#map').selectAll('circle').remove();
        d3.selectAll('.team').attr('class', 'countries');
        d3.select('.host').attr('class', 'countries');

        // Hint: If you followed our suggestion of using classes to style
        // the colors and markers for hosts/teams/winners, you can use
        // d3 selection and .classed to set these classes on and off here.
    }

    /**
     * Update Map with info for a specific FIFA World Cup
     * @param wordcupData the data for one specific world cup
     */
    updateMap(worldcupData) {

        //Clear any previous selections;
        this.clearMap();

        // ******* TODO: PART V *******
        // Add a marker for the winner and runner up to the map.
        // Hint: remember we have a conveniently labeled class called .winner
        // as well as a .silver. These have styling attributes for the two
        // markers.
        // Iterate through all participating teams and change their color as well.
        // We strongly suggest using CSS classes to style the selected countries.
        // Select the host country and change it's color accordingly.
        // Add a marker for gold/silver medalists
        var projection = this.projection
        
        d3.select('#map').append("circle")
        .attr("r",5).attr('class', 'gold')
        .attr("transform", function() {return "translate(" + projection([worldcupData.WIN_LON,worldcupData.WIN_LAT]) + ")";});

        d3.select('#map').append("circle")
        .attr("r",5).attr('class', 'silver')
        .attr("transform", function() {return "translate(" + projection([worldcupData.RUP_LON,worldcupData.RUP_LAT]) + ")";});
        
        for (var i = 0; i < worldcupData.teams_iso.length; i++) {
            d3.select('#' + worldcupData.teams_iso[i]).attr('class', 'team'); }
            d3.select('#' + worldcupData.host_country_code).attr('class', 'host')

        
    }

    /**
     * Renders the actual map
     * @param the json data with the shape of all countries
     */
    drawMap(world) {
    
        //(note that projection is a class member
        // updateMap() will need it to add the winner/runner_up markers.)

        // ******* TODO: PART IV *******

        // Draw the background (country outlines; hint: use #map)
        // Make sure and add gridlines to the map
        // Hint: assign an id to each country path to make it easier to select afterwards
        // we suggest you use the variable in the data element's .id field to set the id
        // Make sure and give your paths the appropriate class (see the .css selectors at
        // the top of the provided html file)
        var features = topojson.feature(world, world.objects.countries).features,
            path = d3.geoPath().projection(this.projection),
            gridlines = d3.geoGraticule();
        
        d3.select('#map').selectAll("path").data(features)
                .enter().append('path')
                .attr('d', path)
                .attr('id', function(d) { return d.id })
                .attr('class', 'countries');
        d3.select('#map').append('path').datum(gridlines).attr('d', path).attr('class', 'grat');
                        
        

    }


}
