function drawCanada(map) {
   let svg = d3.select('#map')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);

   let area = topojson.feature(map, map.objects.provinces);

   let projection = d3.geoIdentity()
      .reflectY(true)
      .fitExtent([[0, 0], [500, 500]], area);

   let path = d3.geoPath().projection(projection);

   svg.append('g')
      .selectAll("path")
      .data(area.features)
      .enter()
      .append("path")
      .attr("class", "province")
      .attr("d", path);
}
