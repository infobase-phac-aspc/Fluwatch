function renderXAxis(x, target, dur=1000){
    target.selectAll(".x-axis")
      .data([null])
      .enter()
      .append("g")
      .attr("class", "x-axis")
      .style("transform", `translate(0px, ${height}px)`);
     
    target.select(".x-axis")
      .transition()
      .duration(dur)
      .call(d3.axisBottom(x).tickSize(5).ticks(0));
}

function renderXGrid(x, target, dur=1000){
    target.selectAll(".x-grid")
      .data([null])
      .enter()
      .append("g")
      .attr("class", "x-grid")
      .style("transform", `translate(0px, ${height}px)`);
    
    target.select(".x-grid")
      .transition()
      .duration(dur)
      .call(d3.axisBottom(x).tickSize(-height));

    target.select(".x-grid")
      .selectAll("text")
      .attr("transform", "rotate(-50)")
      .attr("x", -9)
      .style("text-anchor", "end");
}

function renderYGrid(y, target, dur=1000){
    target.selectAll(".y-grid")
      .data([null])
      .enter()
      .append("g")
      .attr("class", "y-grid");
      
    target.select(".y-grid")
      .transition()
      .duration(dur)
      .call(d3.axisLeft(y).tickSize(-width).ticks(20));
}

function renderYAxis(y, target, dur=1000){
    target.selectAll(".y-axis")
      .data([null])
      .enter()
      .append("g")
      .attr("class", "y-axis")
      .transition()
      .duration(dur)
      .call(d3.axisLeft(y).tickSize(0).ticks(0));
}

function drawAxis(y, x, dur=1000) {
    let svg = d3.select('#container');
    
    y.range([height, 0]);
   
    renderXGrid(x, svg, dur);
    renderXAxis(x, svg, dur);
    
    renderYGrid(y, svg, dur);
    renderYAxis(y, svg, dur);
    
    y.range([0, height]);
    
    // axis events
    d3.selectAll(".x-grid,.y-grid")
      .selectAll("text")
      .on("mouseover", function() {
         d3.select(this)
            .style("cursor", "pointer")
            .style("font-weight", "bold");
         d3.select(this.parentNode)
            .select("line")
            .style("stroke-width", "2px")
            .style("stroke-dasharray", "3");
      })
      .on("mouseout", function() {
         d3.select(this)
            .style("font-weight", "normal");
         d3.select(this.parentNode)
            .select("line")
            .style("stroke-width", "0.5px")
            .style("stroke-dasharray", "1");
      });
}

function drawAreaChart(data, y, x, target, dur=1000) {
   // bind data to g elements
   // each g is going to represent a stack on the area graph
   let binding = target
      .selectAll("g.path")
      .data(data);
    
   // entering the data and drawing the stacked shapes
   binding.enter()
      .append("g")
      .attr("class", "path")
      .style("transform", `translate(1px)`)
      .attr("id", function(d) { return d.key; })
      .attr("fill", function(d) {
         return CATEGORIES[d.key];
      })
      .append("path")
      .attr("d",
         d3.area()
         .x(function(d) {
            return x(`${d["data"]["startDate"]}-${d["data"]["endDate"]}`);
         })
         .y1(height)
         .y0(height)
      )
      .transition()
      .duration(dur)
      .attr("d",
         d3.area()
         .x(function(d) { return x(`${d["data"]["startDate"]}-${d["data"]["endDate"]}`); })
         .y1(function(d) {
            return height - y(d[1]);
         })
         .y0(function(d) {
            return height - y(d[0]);
         })
      );

   binding.select("path")
      .transition()
      .duration(dur)
      .attrTween("d", function(d) {
               let prevD = d3.select(this).attr("d");

               let newD = d3.area()
                              .x(function(d) { return x(`${d["data"]["startDate"]}-${d["data"]["endDate"]}`); })
                              .y1(function(d) {
                                 return height - y(d[1]);
                              })
                              .y0(function(d) {
                                 return height - y(d[0]);
                              });

               return d3.interpolatePath(prevD, newD(d));
            });

    drawAxis(y, x);
}