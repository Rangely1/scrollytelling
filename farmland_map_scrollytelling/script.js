const scroller = scrollama();
let colorScale;

// Step 1: Load CSV data
d3.csv("farmland_1900_total_acres_by_state.csv").then(data => {
  const acreageMap = {};
  data.forEach(d => {
    d["Total Acres"] = +d["Total Acres"].replace(/,/g, "");
    acreageMap[d.State] = d["Total Acres"];
  });

  const maxAcreage = d3.max(data, d => d["Total Acres"]);
  colorScale = d3.scaleSequential()
    .domain([0, maxAcreage])
    .interpolator(d3.interpolateGreens);

  drawMap(acreageMap);
});

// Step 2: Draw the map
function drawMap(acreageMap) {
  const width = 800;
  const height = 600;

  const svg = d3.select("#map").attr("width", width).attr("height", height);

  // Step 3: Load GeoJSON
  d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(us => {
    const geoData = topojson.feature(us, us.objects.states);

    // Step 4: Use fitSize to correctly scale all states
    const projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale(1000);
    const path = d3.geoPath().projection(projection);

    // Step 5: Draw states
    svg.selectAll("path")
      .data(geoData.features)
      .enter().append("path")
      .attr("d", path)
        .attr("fill", d => {
        const name = d.properties.name;
        const acres = acreageMap[name];
        if (!acres) console.log("Missing in CSV:", name);
        return acres ? colorScale(acres) : "#444";
      })
      .attr("stroke", "grey")
      .attr("stroke-width", 1)
      .attr("class", "state")
      .on("click", (event, d) => {
        console.log("Clicked:", d.properties.name);
      });

    // Step 6: Setup scrollytelling
    scroller
      .setup({
        step: ".step",
        offset: 0.5,
        debug: false,
      })
      .onStepEnter(response => {
        if (response.index === 0) {
          svg.selectAll(".state")
            .transition()
            .duration(1000)
            .attr("fill", d => {
              const name = d.properties.name;
              const acres = acreageMap[name];
              if (!acres) console.log("Missing in CSV:", name);
              return acres ? colorScale(acres) : "#444";
            });
        }
      });
  });
}