const projectName = 'tree-map';

const DATASETS = {
  videogames: {
    TITLE: 'Video Game Sales',
    DESCRIPTION: 'Top 100 Most Sold Video Games Grouped by Platform',
    FILE_PATH:
      'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json'
  },
  movies: {
    TITLE: 'Movie Sales',
    DESCRIPTION: 'Top 100 Highest Grossing Movies Grouped By Genre',
    FILE_PATH:
      'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json'
  },
  kickstarter: {
    TITLE: 'Kickstarter Pledges',
    DESCRIPTION:
      'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
    FILE_PATH:
      'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json'
  }
};

// Switch based on the dataset provided
var urlParams = new URLSearchParams(window.location.search);
const DEFAULT_DATASET = 'videogames';
const DATASET = DATASETS[urlParams.get('data') || DEFAULT_DATASET];

document.getElementById('title').innerHTML = DATASET.TITLE;
document.getElementById('description').innerHTML = DATASET.DESCRIPTION;

var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 1000 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// Define the div for the tooltip
var tooltip = d3.select("#main")
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0);

Promise.all([d3.json(DATASET.FILE_PATH)])
.then((data) => ready(data))
.catch((err) => console.log(err));

function ready(data) {

  data = data[0];
  console.log(data);

  var categories = data.children.map((x) => x.name);

  var fader = function (color) {
    return d3.interpolateRgb(color, '#fff')(0.2);
  };

  // Map each category to a color
  var getColor = d3.scaleOrdinal()
  .range(d3.schemeCategory10.map(fader))
  .domain(categories);

  var svg = d3.select("#tree-map")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

  var root = d3.hierarchy(data)
  .eachBefore(function (d) {
    d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
  })
  .sum(function(d){ return d.value})
  .sort(function (a, b) {
    return b.height - a.height || b.value - a.value;
  });

  d3.treemap()
  .size([width, height])
  (root)

  var cell = svg
  .selectAll('g')
  .data(root.leaves())
  .enter()
  .append('g')
  .attr('class', 'group')
  .attr('transform', function (d) {
    return 'translate(' + d.x0 + margin.left + ',' + d.y0 + margin.top + ')';
  });

  cell
    .append('rect')
    .attr('id', function (d) {
      return d.data.id;
    })
    .attr('class', 'tile')
    .attr('width', function (d) {
      console.log(d.x1)
      return d.x1 - d.x0;
    })
    .attr('height', function (d) {
      return d.y1 - d.y0;
    })
    .attr('data-name', function (d) {
      return d.data.name;
    })
    .attr('data-category', function (d) {
      return d.data.category;
    })
    .attr('data-value', function (d) {
      return d.data.value;
    })
    .attr('fill', function (d) {
      return getColor(d.data.category);
    })
    .on('mousemove', function (event, d) {
      tooltip.style('opacity', 0.9);
      tooltip
        .html(
          'Name: ' +
            d.data.name +
            '<br>Category: ' +
            d.data.category +
            '<br>Value: ' +
            d.data.value
        )
        .attr('data-value', d.data.value)
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 28 + 'px');
    })
    .on('mouseout', function () {
      tooltip.style('opacity', 0);
    });
  
  cell
    .append('text')
    .attr('class', 'tile-text')
    // Append a tspan for each space in the words
    .selectAll('tspan')
    .data(function (d) {
      return d.data.name.split(/(?=[A-Z][^A-Z])/g);
    })
    .enter()
    .append('tspan')
    .attr('x', 4)
    .attr('y', function (d, i) {
      return 13 + i * 10;
    })
    .text(function (d) {
      return d;
    });

    var legendWidth = 500;
    var legend = d3.select('#legend')
    .attr('width', legendWidth)
    const LEGEND_OFFSET = 10;
    const LEGEND_RECT_SIZE = 15;
    const LEGEND_H_SPACING = 150;
    const LEGEND_V_SPACING = 10;
    const LEGEND_TEXT_X_OFFSET = 3;
    const LEGEND_TEXT_Y_OFFSET = -2;
    var legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);

    // Ensure categories are in the same order as the data
    categories = root.leaves().map(function (nodes) {
      return nodes.data.category;
    });
    categories = categories.filter(function (category, index, self) {
      return self.indexOf(category) === index;
    });

    var legendElem = legend
      .append('g')
      .attr('transform', 'translate(60,' + LEGEND_OFFSET + ')')
      .selectAll('g')
      .data(categories)
      .enter()
      .append('g')
      .attr('transform', function (d, i) {
        return (
          'translate(' +
          (i % legendElemsPerRow) * LEGEND_H_SPACING +
          ',' +
          (Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE +
            LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)) +
          ')'
        );
      });

      legendElem
        .append('rect')
        .attr('width', LEGEND_RECT_SIZE)
        .attr('height', LEGEND_RECT_SIZE)
        .attr('class', 'legend-item')
        .attr('fill', function (d) {
          return getColor(d);
        });

      legendElem
        .append('text')
        .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
        .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
        .text(function (d) {
          return d;
        });

}