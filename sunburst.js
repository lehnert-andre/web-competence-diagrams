// Dimensions of sunburst.
var width = 750;
var height = 600;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
    w: 75, h: 30, s: 3, t: 10
};



// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.partition()
    .size([2 * Math.PI, radius * radius]);

var arc = d3.arc()
    .startAngle(function(d) { return d.x0; })
    .endAngle(function(d) { return d.x1; })
    .innerRadius(function(d) { return Math.sqrt(d.y0); })
    .outerRadius(function(d) { return Math.sqrt(d.y1); });

// Use d3.text and d3.csvParseRows so that we do not need to have a header
// row, and can receive the csv as an array of arrays.


// TODO static d3.text("web-competences.csv", function(text) {
d3.text("https://docs.google.com/spreadsheets/d/e/2PACX-1vS1jTV_Zx9AuiOmnPePGXrWOSXcXkJUwcYnyJBYNx1u02R5nbDav2dSaPPgYL4pqWeRHOfOfPxi62hY/pub?gid=0&single=true&output=csv", function(text) {
    var csv = d3.csvParseRows(text);
    var json = buildHierarchy(csv);
    createVisualization(json);
});

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

    //Basic setup of page elements.
    drawLegend(json);

    // Bounding circle underneath the sunburst, to make it easier to detect
    // when the mouse leaves the parent g.
    vis.append("svg:circle")
        .attr("r", radius)
        .style("opacity", 0);

    // Turn the data into a d3 hierarchy and calculate the sums.
    var root = d3.hierarchy(json)
        .sum(function(d) { return d.size; })
        .sort(function(a, b) { return b.value - a.value; });

    // For efficiency, filter nodes to keep only those large enough to see.
    var nodes = partition(root).descendants()
        .filter(function(d) {
            return (d.x1 - d.x0 > 0.0025); // 0.005 radians = 0.29 degrees
        });

    var path = vis.data([json]).selectAll("path")
        .data(nodes)
        .enter().append("svg:path")
        // id
        .attr("id", function(d) { return "id-" + d.data.name.toLowerCase() })
        .attr("display", function(d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        // color
        .attr("fill-rule", "evenodd")
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return d.data.color; })
        .attr("fill-opacity", d => (d.children ? 0.6 : 0.4))
        .on("mouseover", mouseover);

    // Add the mouseleave handler to the bounding circle.
    d3.select("#container").on("mouseleave", mouseleave);

    // Get total size of the tree = value of root node from partition.
    totalSize = path.datum().value;
};



// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

    d3.select("#selected-name")
        .text(d.data.name);

    d3.select("#explanation")
        .style("visibility", "");

    var sequenceArray = d.ancestors().reverse();
    sequenceArray.shift(); // remove root node from the array

    // Fade all the segments.
    d3.selectAll("path")
        .style("opacity", 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    vis.selectAll("path")
        .filter(function(node) {
            return (sequenceArray.indexOf(node) >= 0);
        })
        .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

    // Hide the breadcrumb trail
    d3.select("#trail")
        .style("visibility", "hidden");

    // Deactivate all segments during transition.
    d3.selectAll("path").on("mouseover", null);

    // Transition each segment to full opacity and then reactivate it.
    d3.selectAll("path")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .on("end", function() {
            d3.select(this).on("mouseover", mouseover);
        });

    d3.select("#explanation")
        .style("visibility", "hidden");
}


function drawLegend(json) {
    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    var li = {
        w: 175, h: 30, s: 3, r: 3
    };

    var legend = d3.select("#legend").append("svg:svg")
        .attr("width", li.w)
        .attr("height", json.children.length * (li.h + li.s));

    const categories = [];
    const color = [];

    json.children.forEach(child => categories.push(child.name));
    json.children.forEach(child => color.push(child.color));

    var g = legend.selectAll("g")
        .data(d3.entries(categories))
        .enter().append("svg:g")
        .attr("transform", function(d, i) {
            return "translate(0," + i * (li.h + li.s) + ")";
        });

    g.append("svg:rect")
        .attr("rx", li.r)
        .attr("ry", li.r)
        .attr("width", li.w)
        .attr("height", li.h)
        .style("fill", function(d) { return color[d.key]; })
        .attr("fill-opacity", 0.6);

    g.append("svg:text")
        .attr("x", li.w / 2)
        .attr("y", li.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return categories[d.key]; });
}