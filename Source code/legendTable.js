(function () {
var legend = d3.select("#my_dataviz2")
.attr("transform", "translate(" + 0 + "," + -650 + ")")
.attr("width", 350)

// Usually you have a color scale in your chart already
var color = d3.scaleThreshold()
.domain([0, 10000, 100000, 1000000, 5000000, 10000000, 20000000])
.range(d3.schemeOrRd[8]);

// Add one dot in the legend for each name.

legend.selectAll("mydots")
.data(color.domain())
.enter()
.append("circle")
.attr("cx", 100)
.attr("cy", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
.attr("r", 7)
.style("fill", function (d) { return color(d) })

// Add one dot in the legend for each name.
legend.selectAll("mylabels")
.data(["0 - 10,000", "10,000 - 100,000", "100,000 - 1,000,000", "1,000,000 - 5,000,000", "5,000,000 - 10,000,000", "10,000,000 - 20,000,000", "20,000,000+"])
.enter()
.append("text")
.attr("x", 120)
.attr("y", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
.style("fill", function (d) { "black" })
.text(function (d, i) { return d })
.attr("text-anchor", "left")
.style("alignment-baseline", "middle")

})();