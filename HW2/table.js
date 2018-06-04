var format = {
  'string': function (t) {
    return t;
  },
  'float': d3.format('.1f'),
  'gdp': d3.format('.2s'),
  'int': d3.format(",.2r")
};

var neededColumns = [
  {
    title: 'name',
    format: format['string'],
    timeline: false
  },
  {
    title: 'continent',
    format: format['string'],
    timeline: false
  },
  {
    title: 'gdp',
    format: format['gdp'],
    timeline: true
  },
  {
    title: 'life_expectancy',
    format: format['float'],
    timeline: true
  },
  {
    title: 'population',
    format: format['int'],
    timeline: true
  },
  {
    title: 'year',
    format: format['string'],
    timeline: true
  }
];

var TIMELINE_MODE = true;
var sortedTitle = '';
var sortedAscending = true;

var filterTitles = [
  'Americas', 'Africa', 'Asia', 'Europe', 'Oceania'
];
var continentFilter = [];

var timelineData = [1995, 2012];

var filtredData = [];

var isAgregated = false;

var selectedYear = 1995;

//  Get json data
d3.json('https://alexanderkub.github.io/DataVis/data/countries_1995_2012.json', function (error, jsonData) {
  // Create timeline
  if (TIMELINE_MODE) {
    var timeline = d3.select('body').append('div')
      .attr('class', 'controller-row').text('Time update:');
    timeline.append('span').text(timelineData[0]);
    timeline.append('input').attr('type', 'range')
      .attr('name', 'points')
      .attr('id', 'selected-year')
      .attr('min', timelineData[0]).attr('max', timelineData[1])
      .attr('step', '1').attr('value', '0')
      .on('change', function (value) {
        selectedYear = parseInt(this.value);
        if (isAgregated) {
          AggregateData();
          return;
        }
        
        tbody.selectAll('tr.row').remove();
        createRowsWithData(getFilteredData());
        sortRowsByTitle(sortedTitle, sortedAscending);
      });
    timeline.append('span').text(timelineData[1]);
  }
  
  // Create filter controller row
  var filterController = d3.select('body').append('div')
    .attr('class', 'controller-row')
    .text('Filter by:').selectAll('span')
    .data(filterTitles).enter().append("span");
  
  filterController.append('input').attr('type', 'checkbox')
    .attr('id', function (d) {
      return 'checkbox-' + d.toLowerCase();
    })
    .attr('name', function (d) {
      return d;
    })
    .attr('value', function (d) {
      return d;
    })
    .on('change', function (value) {
      // Set filter values
      if (this.checked) {
        continentFilter.push(value);
      } else {
        var index = continentFilter.indexOf(value);
        if (index !== -1) {
          continentFilter.splice(index, 1);
        }
      }
      // Apply filter to data
      tbody.selectAll('tr.row').remove();
      if (isAgregated) {
        AggregateData();
        return;
      }
      createRowsWithData(getFilteredData());
      sortRowsByTitle(sortedTitle, sortedAscending);
    });
  filterController.append("label")
    .attr('for', function (d) {
      return 'checkbox-' + d.toLowerCase();
    })
    .text(function (d) {
      return d;
    });
  
  // Create aggregation row
  var aggregation = d3.select('body').append('div')
    .attr('class', 'controller-row')
    .text('Aggregation:').selectAll('span')
    .data(['None', 'by Continent']).enter().append("span");
  
  aggregation.append('input').attr('type', 'radio')
    .attr('id', function (d) {
      return 'radio-' + d.toLowerCase();
    })
    .attr('name', 'aggregation')
    .attr('value', function (d) {
      return d;
    })
    .property('checked', function (d, i) {
      return i == 0;
    })
    .on('click', function (value) {
      //  Apply aggregation to data
      if (value == 'None') {
        isAgregated = false;
        tbody.selectAll('tr.row').remove();
        
        createRowsWithData(getFilteredData());
        sortRowsByTitle(sortedTitle, sortedAscending);
        return;
      }
      isAgregated = true;
      AggregateData();
    });
  
  function getFilteredData() {
    if (continentFilter.length == 0 || continentFilter.length == 5) {
      filtredData = jsonData;
    } else {
      filtredData = [];
      jsonData.forEach(function (item) {
        if (continentFilter.includes(item.continent)) {
          filtredData.push(item);
        }
      });
    }
    
    return filtredData;
  }
  
  function AggregateData() {
    var aggrData = d3.nest()
      .key(function (d) {
        return d.continent;
      })
      .rollup(function (leaves) {
        
        if (TIMELINE_MODE) {
          
          return {
            name: leaves[0].continent,
            continent: leaves[0].continent,
            years: [
              {
                gdp: d3.sum(leaves.map(function (item) {
                  var yearInfo = item.years.find(function (yearInfo) {
                    return yearInfo.year === parseInt(selectedYear);
                  });
                  return yearInfo ? yearInfo.gdp : 0;
                })),
                life_expectancy: d3.mean(leaves.map(function (item) {
                  var yearInfo = item.years.find(function (yearInfo) {
                    return yearInfo.year === parseInt(selectedYear);
                  });
                  return yearInfo ? yearInfo.life_expectancy : 0;
                })),
                population: d3.sum(leaves.map(function (item) {
                  var yearInfo = item.years.find(function (yearInfo) {
                    return yearInfo.year === parseInt(selectedYear);
                  });
                  return yearInfo ? yearInfo.population : 0;
                })),
                year: selectedYear
              }
            ]
          };
        } else {
          
          return {
            name: leaves[0].continent,
            continent: leaves[0].continent,
            gdp: d3.sum(leaves.map(function (item) {
              return item.gdp;
            })),
            life_expectancy: d3.mean(leaves.map(function (item) {
              return item.life_expectancy;
            })),
            population: d3.sum(leaves.map(function (item) {
              return item.population;
            })),
            year: leaves[0].year
          };
        }
        
      }).entries(getFilteredData());
    tbody.selectAll('tr.row').remove();
    aggrData = aggrData.map(function (item) {
      return item.value;
    });
    createRowsWithData(aggrData);
    sortRowsByTitle(sortedTitle, sortedAscending);
  }
  
  aggregation.append("label")
    .attr('for', function (d) {
      return 'radio-' + d.toLowerCase();
    })
    .text(function (d) {
      return d;
    });
  
  //  Create table basic structure
  var table = d3.select('body').append('table')
    .classed('country-table', true);
  var thead = table.append('thead');
  var tbody = table.append('tbody');
  table.append('caption')
    .html('World Countries Ranking');
  
  var sortedThElement;
  //  Create table header
  thead.append('tr').selectAll('th')
    .data(neededColumns)
    .enter().append('th')
    .text(function (d) {
      return d.title;
    })
    .classed('center-text', true)
    //  Sort handler
    .on('click', function (header, i) {
      // Select sort direction
      sortedAscending = sortedTitle != header.title ? true : !sortedAscending;
      sortedTitle = header.title;
      
      // Set style relative sort direction
      if (sortedThElement) {
        sortedThElement.classed('up-arrowed', false);
        sortedThElement.classed('down-arrowed', false);
      }
      sortedThElement = d3.select(this);
      sortedThElement.classed('up-arrowed', sortedAscending);
      sortedThElement.classed('down-arrowed', !sortedAscending);
      sortRowsByTitle(sortedTitle, sortedAscending);
    });
  
  function sortRowsByTitle(title, ascending) {
    if (!title) {
      return;
    }
    
    var timelinedValue = false;
    if (TIMELINE_MODE) {
      var columnInfo = neededColumns.find(function(column) {
        return column.title == title;
      });
      
      if (columnInfo.timeline) {
        timelinedValue = true;
      }
    }
    
    // Sort rows
    tbody.selectAll('tr').sort(function (a, b) {
      
      var aValue = !timelinedValue ? a[title] : a.years.find(function(yearInfo) {
        return yearInfo.year == selectedYear;
      })[title];
      
      var bValue = !timelinedValue ? b[title] : b.years.find(function(yearInfo) {
        return yearInfo.year == selectedYear;
      })[title];
      
      if (ascending) {
        return d3.ascending(aValue, bValue)
          || d3.ascending(a['name'], b['name']);
      }
      return d3.descending(aValue, bValue)
        || d3.ascending(a['name'], b['name']);
    });
  }
  
  function createRowsWithData(data) {
    //  Create table rows from data
    var rows = tbody.selectAll('tr.row').data(data)
      .enter().append('tr').attr('class', 'row');
    
    // Set columns format
    var cells = rows.selectAll('td').data(function (row) {
      return neededColumns.map(function (column, i) {
        if (TIMELINE_MODE && column.timeline) {
          var yearData = row.years.find(function (yearInfo) {
            return yearInfo.year === selectedYear;
          });
          return column.format(yearData[column.title]);
        }
        
        return column.format(row[column.title]);
      });
    }).enter().append('td').text(function (d) {
        return d;
      })
      .attr('class', function (d, i) {
        return i < 2 ? 'center-text' : 'right-text';
      })
      //  Add mousehover events
      .on('mouseover', function (d, i) {
        d3.select(this.parentNode).style('background-color', '#F3ED86');
      })
      .on('mouseout', function () {
        tbody.selectAll('tr').style('background-color', null)
          .selectAll('td').style('background-color', null);
      });
  }
  
  createRowsWithData(jsonData);
});
