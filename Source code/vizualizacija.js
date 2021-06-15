(function () {
    var margin = { top: 500, left: 50, right: 50, bottom: 50 },
        height = 800 - margin.top - margin.bottom,
        width = 1700 - margin.left - margin.right,
        chartWidth = 700 - margin.left - margin.right,
        chartHeight = 400 - 30 - margin.bottom;;


    const tooltip = d3.tip()
        .attr("class", "tooltip");

    var svg = d3.select("#map")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + -150 + "," + margin.top + ")")
        .call(tooltip);


    var chart = d3.select("#map")
        .append("svg")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + 50 + margin.bottom)
        .attr("transform", "translate(" + 1100 + "," + -550 + ")")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + 0 + ")");

    const colorScale = d3.scaleThreshold()
        .domain([10000, 100000, 1000000, 5000000, 10000000, 20000000])
        .range(d3.schemeOrRd[7]);


    var x = d3.scaleBand()
        .range([0, chartWidth])
        .padding(0.2);
    var xAxis = chart.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")

    var y = d3.scaleLinear()
        .range([chartHeight, 0]);
    var yAxis = chart.append("g")
        .attr("class", "myYaxis")

    function formatDate(date) {
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();
        if (dd < 10) { dd = '0' + dd }
        if (mm < 10) { mm = '0' + mm }
        date = yyyy + '-' + mm + '-' + dd;
        return date
    }

    function Last14Days() {
        var result = [];
        for (var i = 2; i < 16; i++) {
            var d = new Date();
            d.setDate(d.getDate() - i);
            result.push(formatDate(d))
        }

        return (result);
    }

    d3.queue()
        .defer(d3.json, "world.topojson")
        .defer(d3.csv, "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/latest/owid-covid-latest.csv")
        .defer(d3.csv, "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/jhu/new_cases.csv")
        .await(ready)

    var projection = d3.geoMercator()
        .translate([width / 2, -height / 2])
        .scale(120)

    var path = d3.geoPath()
        .projection(projection)

    function ready(error, data, corona, dailyCorona) {

        function GetTotalCases(nameToFilter) {
            var result = corona.find(element => element.location == nameToFilter)
            if (result === undefined) {
                return "unknown"
            } else {
                return parseInt(result.total_cases)
            }
        }

        function GetTotalCasesPerMilion(nameToFilter) {
            var result = corona.find(element => element.location == nameToFilter)
            if (result === undefined) {
                return "unknown"
            } else {
                return parseInt(result.total_cases_per_million)
            }
        }

        function GetTotalDeaths(nameToFilter) {
            var result = corona.find(element => element.location == nameToFilter)
            if (result === undefined) {
                return "unknown"
            } else {
                return parseInt(result.total_deaths)
            }
        }

        function GetTotalDeathsPerMilion(nameToFilter) {
            var result = corona.find(element => element.location == nameToFilter)
            if (result === undefined) {
                return "unknown"
            } else {
                return parseInt(result.total_deaths_per_million)
            }
        }

        var countries = topojson.feature(data, data.objects.countries).features

        var days = Last14Days()
        var reversedDays = [14]

        var counter = 13;
        days.forEach(element => {
            reversedDays[counter] = element
            counter--
        });

        var newCasesLastTwoWeeks = []

        reversedDays.forEach(element => {
            newCasesLastTwoWeeks.push(dailyCorona.find(e => e.date == element))
        });

        countries.forEach(element => {
            element.properties.totalCases = GetTotalCases(element.properties.name)
            element.properties.totalDeaths = GetTotalDeaths(element.properties.name)
            element.properties.totalCasesPerMil = GetTotalCasesPerMilion(element.properties.name)
            element.properties.totalDeathsPerMil = GetTotalDeathsPerMilion(element.properties.name)

            element.properties.newCasesLastTwoWeeks = []
            newCasesLastTwoWeeks.forEach(e => {
                if (e[element.properties.name] < 0 || e[element.properties.name] == "unknown" || isNaN(e[element.properties.name])) { element.properties.newCasesLastTwoWeeks.push(0) }
                else {
                    element.properties.newCasesLastTwoWeeks.push(parseInt(e[element.properties.name]))
                }
            });

        });

        console.log(countries)

        function updateChart(cases, name) {
            x.domain(reversedDays)
            xAxis.transition().duration(1000).call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10,25)rotate(-60)")

            console.log(name)
            var bindedData = [];

            for (var i = 0; i < 14; i++) {
                bindedData[i] = {
                    days: reversedDays[i],
                    cases: cases[i]
                };
            }

            console.log(bindedData)

            // Add Y axis
            y.domain([0, d3.max(cases)]);
            yAxis.transition().duration(1000).call(d3.axisLeft(y));

            // variable u: map data to existing bars
            var u = chart.selectAll("rect")
                .data(bindedData)

            maxValue = d3.max(bindedData, d => d.cases)
            increment = maxValue / 6

            const colorScaleGraph = d3.scaleThreshold()
                .domain([0, increment, increment * 2, increment * 3, increment * 4, increment * 5, maxValue])
                .range(d3.schemeOrRd[8]);

            // update bars
            u
                .enter()
                .append("rect")
                .merge(u)
                .transition()
                .duration(1000)
                .attr("x", function (d) {
                    return x(d.days);
                })
                .attr("y", function (d) { return y(d.cases); })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return chartHeight - y(d.cases); })
                .attr("fill", function (d) {
                    return colorScaleGraph(d.cases);
                });

                document.getElementById("grafNaziv").innerHTML = name

        }

        var mouseOver = function (d) {
            d3.select(event.target).style("opacity", 0.5);

            tooltip.html((d) => {
                return `${d.properties.name} <br> Broj zaraženih: ${d.properties.totalCases.toLocaleString()} <br> Broj umrlih: ${d.properties.totalDeaths.toLocaleString()}  `
            });
            tooltip.show(d, event.target);

        }

        let mouseLeave = function (d) {
            tooltip.hide()
            d3.select(event.target).style("opacity", 1);
        };

        svg.selectAll(".country")
            .data(countries)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", "#ccc")
            .attr("stroke", "#3333")
            .attr("fill", function (d) {
                if (d.properties.totalCases == "unknown" || isNaN(d.properties.totalCases))
                    return colorScale(0)
                return colorScale(d.properties.totalCases);
            })
            .on('mouseover', mouseOver)
            .on('mouseleave', mouseLeave)
            .on('click', (d) => updateChart(d.properties.newCasesLastTwoWeeks, d.properties.name))

    }
})();