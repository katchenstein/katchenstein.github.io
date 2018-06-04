var margin = {
  top: 50,
  bottom: 10,
  left: 300,
  right: 40
};

var width = 900 - margin.left - margin.right;
var height = 900 - margin.top - margin.bottom;

var xScale = d3.scaleLinear().range([0, width]);
var yScale = d3.scaleBand().rangeRound([0, height]);

var svg, g;

// Настройки временной шкалы как в заданиях с таблицей

var TIMELINE_MODE = true;
var isAgregated = false;
var timelineData = [1995, 2012];
var filteredData = [];
var prevYear = 1995;
var selectedYear = 1995;
var continentFilter = [];
var sortedTitle = 'name';
var sortedAscending = true;

var filterTitles = [
  'Americas', 'Africa', 'Asia', 'Europe', 'Oceania'
];

var selectedAttribute = 'population';

var barColors = {};

var attributesInfo = [
  {
    title: 'name',
    timeline: false
  },
  {
    title: 'continent',
    timeline: false
  },
  {
    title: 'gdp',
    timeline: true
  },
  {
    title: 'life_expectancy',
    timeline: true
  },
  {
    title: 'population',
    timeline: true
  },
  {
    title: 'year',
    timeline: true
  }
];

var sources = [
  "https://alexanderkub.github.io/DataVis/data/countries_1995_2012.json",
  "https://alexanderkub.github.io/DataVis/data/countries_2012.json"
];

d3.json(TIMELINE_MODE ? sources[0] : sources[1], function (jsonData) {
  
  function getColorForBar(countryName) {
    
    if (!barColors[countryName]) {
      barColors[countryName] = randomColor()();
    }
    
    return barColors[countryName];
  }
  
  function recalculateSVGHeight(data) {
    var baseHeight = isAgregated ? data.length * 60 : data.length * 20;
    height = Math.max(baseHeight, 200) - margin.top - margin.bottom;
    yScale = d3.scaleBand().rangeRound([0, height]);
  
    svg.attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
  }
  
  // взяла из http://bl.ocks.org/jdarling/06019d16cb5fd6795edf
  function randomColor () {
    var golden_ratio_conjugate = 0.618033988749895;
    var h = Math.random();
    
    var hslToRgb = function (h, s, l){
      var r, g, b;
      
      if(s == 0){
        r = g = b = l; // achromatic
      }else{
        function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        }
        
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      return '#'+Math.round(r * 255).toString(16)+Math.round(g * 255).toString(16)+Math.round(b * 255).toString(16);
    };
    
    return function() {
      h += golden_ratio_conjugate;
      h %= 1;
      return hslToRgb(h, 0.5, 0.60);
    };
  }
  
  function getFilteredData() {
    if (continentFilter.length == 0 || continentFilter.length == 5) {
      filteredData = jsonData;
    } else {
      filteredData = [];
      jsonData.forEach(function (item) {
        if (continentFilter.includes(item.continent)) {
          filteredData.push(item);
        }
      });
    }
    
    return sortBars(filteredData);
  }
  
  function sortBars(data) {
    if (!sortedTitle) {
      return;
    }
  
    var timelinedValue = false;
    if (TIMELINE_MODE) {
      var attributeInfo = attributesInfo.find(function(attr) {
        return attr.title == sortedTitle;
      });
    
      if (attributeInfo.timeline) {
        timelinedValue = true;
      }
    }
    
    // Sort rows
    data.sort(function (a, b) {
      var aValue = 0;
      var bValue = 0;
      
      if (timelinedValue) {
        var aYearInfo = a.years.find(function(yearInfo) {
          return yearInfo.year == selectedYear;
        });
        aValue = aYearInfo[sortedTitle];
        var bYearInfo = b.years.find(function(yearInfo) {
          return yearInfo.year == selectedYear;
        });
        bValue = bYearInfo[sortedTitle];
      } else {
        aValue = a[sortedTitle];
        bValue = b[sortedTitle];
      }
      
      if (sortedAscending) {
        return d3.ascending(aValue, bValue)
          || d3.ascending(a['name'], b['name']);
      }
      return d3.descending(aValue, bValue)
        || d3.ascending(a['name'], b['name']);
    });
    
    return data;
  }
  
  function drawSVG(data, prevYear) {
  
    recalculateSVGHeight(data);
    
    if (g) {
      g.selectAll("*").remove();
    }
    
    var max = d3.max(data, function (d) {
      if (TIMELINE_MODE) {
        var yearData = d.years.find(function (yearInfo) {
          return yearInfo.year === selectedYear;
        });
        return yearData[selectedAttribute];
      } else {
        return d[selectedAttribute];
      }
    });
    var min = 0;
    
    xScale.domain([min, max]);
    yScale.domain(data.map(function (d) {
      return d.name;
    }));
    
    var groups = g
      .selectAll("text")
      .data(data)
      .enter()
      .append("g");
    
    groups
      .append("text")
      .text(function (d) {
        return d.name;
      })
      .attr("width", 120)
      .attr("fill", function(d) {
        return getColorForBar(d.name)
      })
      .attr("font-size", isAgregated ? "20px" : "12px")
      .attr("x", xScale(min))
      .attr("y", function (d) {
        return yScale(d.name);
      });
    
    var bars = groups
      .append("rect")
      .attr("fill", function(d) {
        return getColorForBar(d.name)
      })
      .attr("height", isAgregated ? 20 : 5)
      .attr("x", 120 + xScale(min))
      .attr("y", function (d) {
        return isAgregated ? (yScale(d.name) - 15) : (yScale(d.name) - 5);
      })
      .attr("width", function (d) {
        if (!prevYear || !TIMELINE_MODE) {
          return xScale(0);
        }
        if (TIMELINE_MODE) {
          var prevYearData = d.years.find(function (yearInfo) {
            return yearInfo.year === prevYear;
          });
          return xScale(prevYearData[selectedAttribute]);
        }
      })
      .transition()
      .ease(d3.easeCubic)
      .duration(1000)
      .attr("width", function (d) {
        if (TIMELINE_MODE) {
          var yearData = d.years.find(function (yearInfo) {
            return yearInfo.year === selectedYear;
          });
          return xScale(yearData[selectedAttribute]);
        } else {
          return xScale(d[selectedAttribute]);
        }
      });
  }
  
  function aggregateData() {
    var aggrData = d3.nest()
      .key(function (d) {
        return d.continent;
      })
      .rollup(function (leaves) {
        
        if (TIMELINE_MODE) {
          
          var years = [];
          for (var year = timelineData[0]; year <= timelineData[1]; year++) {
            
            years.push({
              gdp: d3.sum(leaves.map(function (item) {
                var yearInfo = item.years.find(function (yearInfo) {
                  return yearInfo.year === parseInt(year);
                });
                return yearInfo ? yearInfo.gdp : 0;
              })),
              life_expectancy: d3.mean(leaves.map(function (item) {
                var yearInfo = item.years.find(function (yearInfo) {
                  return yearInfo.year === parseInt(year);
                });
                return yearInfo ? yearInfo.life_expectancy : 0;
              })),
              population: d3.sum(leaves.map(function (item) {
                var yearInfo = item.years.find(function (yearInfo) {
                  return yearInfo.year === parseInt(year);
                });
                return yearInfo ? yearInfo.population : 0;
              })),
              year: year
            });
          }
          
          return {
            name: leaves[0].continent,
            continent: leaves[0].continent,
            years: years
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
    
    aggrData = aggrData.map(function (item) {
      return item.value;
    });
    
    drawSVG(sortBars(aggrData), prevYear);
  }
  
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
        prevYear = selectedYear;
        selectedYear = parseInt(this.value);
        if (isAgregated) {
          aggregateData();
          return;
        }
        
        drawSVG(getFilteredData(), prevYear);
      });
    timeline.append('span').text(timelineData[1]);
  }
  
  // Радиокнопки для выбора аттрибута
  var attributes = d3.select('body').append('div')
    .attr('class', 'controller-row')
    .text('Encode bars by:').selectAll('span')
    .data(['Population', 'GDP', 'Life expectancy']).enter().append("span");
  
  attributes.append('input').attr('type', 'radio')
    .attr('id', function (d) {
      return 'radio-attributes-' + d.toLowerCase().split(' ').join('_');
    })
    .attr('name', 'attributes')
    .attr('value', function (d) {
      return d.toLowerCase().split(' ').join('_');
    })
    .property('checked', function (d, i) {
      return i == 0;
    })
    .on('click', function (value) {
      selectedAttribute = value.toLowerCase().split(' ').join('_');
  
      if (isAgregated) {
        aggregateData();
        return;
      }
      
      drawSVG(getFilteredData());
    });
  attributes.append("label")
    .attr('for', function (d) {
      return 'radio-attributes-' + d.toLowerCase().split(' ').join('_');
    })
    .text(function (d) {
      return d;
    });
  
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
      
      if (isAgregated) {
        aggregateData();
        return;
      }
      
      drawSVG(getFilteredData());
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
    .data(['Country', 'Continent']).enter().append("span");
  
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
      if (value == 'Country') {
        isAgregated = false;
        
        drawSVG(getFilteredData());
        return;
      }
      isAgregated = true;
  
      aggregateData();
    });
  aggregation.append("label")
    .attr('for', function (d) {
      return 'radio-' + d.toLowerCase();
    })
    .text(function (d) {
      return d;
    });
  
  // Радиокнопки для сортировки по параметру
  var sorts = d3.select('body').append('div')
    .attr('class', 'controller-row')
    .text('Sort by:').selectAll('span')
    .data(['Name', 'Population', 'GDP', 'Life expectancy']).enter().append("span");
  
  sorts.append('input').attr('type', 'radio')
    .attr('id', function (d) {
      return 'radio-sorts-' + d.toLowerCase().split(' ').join('_');
    })
    .attr('name', 'sorts')
    .attr('value', function (d) {
      return d.toLowerCase().split(' ').join('_');;
    })
    .property('checked', function (d, i) {
      return i == 0;
    })
    .on('click', function (value) {
      
      var prepared_value = value.toLowerCase().split(' ').join('_');
      // Select sort direction
      sortedAscending = sortedTitle != prepared_value ? true : !sortedAscending;
      
      sortedTitle = prepared_value;
      if (isAgregated) {
        aggregateData();
        return;
      }
      drawSVG(getFilteredData());
    });
  sorts.append("label")
    .attr('for', function (d) {
      return 'radio-sorts-' + d.toLowerCase().split(' ').join('_');
    })
    .text(function (d) {
      return d;
    });
  
  svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
  
  g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  filteredData = jsonData;
  
  drawSVG(jsonData);
});