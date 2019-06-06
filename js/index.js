const MARGIN = { top: 20, right: 10, bottom: 160, left: 100 };

const CATEGORIES = {
   "aH3N2": "#2980b9",
   "aUns": "#e74c3c",
   "aH1N1pdm09": "#F4D03F"
};

const width = 700 - MARGIN.left - MARGIN.right;
const height = 500 - MARGIN.top - MARGIN.bottom;

// importing the data
d3.csv("./data/figure3.csv", function(csv) {
   // Aligning the influenza type dropdown with the actual chart
   $('controls').style.marginLeft = `${MARGIN.left}px`;

   // determining the maximum in the dataset based on the specified keys
   // the only reason this function exists is to reduce code duplication
   let max = function(data) {
      return d3.max(data, function(d) {
         let sum = 0;
         /* using a for loop to calculate the total instead of just grabbing the "aTotal" record from the csv
            allows us to add/remove categories to/from the oject "CATEGORIES" above without having to change anything else */
         for (let label of Object.keys(CATEGORIES))
            sum += +d[label];
         return sum;
      });
   };

   let data = csv;

   let svg = d3.select('#areachart')
      .append('svg')
      .attr('id', 'vis')
      .attr("width", width + MARGIN.left + MARGIN.right)
      .attr("height", height + MARGIN.top + MARGIN.bottom)
      .append("g")
      .attr("id", "container")
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);
   
   // grouping the data by province SGC code
   // this allows us to access the array of data using province codes from a map
   let fluWatchByProvince = d3.nest()
      .key(function(d) {return d["season"];})
      .key(function(d) { return d["pruid"]; })
      .key(function(d) { return `${d["startDate"]}-${d["endDate"]}`; })
      .rollup(function(values) {
         for (let key of Object.keys(values[0])){
            values[0][key] = values[0][key].replace("<", "").replace(">", "").replace("suppressed", 5).replace("x", 5);
         }
         return values[0];
      })
      .object(data.sort(function(a, b) { 
      return d3.ascending(new Date(a["startDate"]), new Date(b["startDate"]));
   }));

   let selectedProvince = 1;
   let selectedFluCategory = "all";
   let selectedYear = "2017-2018";
   
   let allYears = Object.keys(fluWatchByProvince);

   for (let year of allYears) {
         let option = document.createElement("option");

         option.textContent = year;
         option.value = year;

         $("years").append(option);
   } 
   
   $("years").value = selectedYear;
   
   // accessing the data for the selectedProvince
   let fluData = d3.values(fluWatchByProvince[selectedYear][selectedProvince]);

   // setting the original y scale
   let y = d3.scaleLinear()
      .domain([0, max(fluData)])
      .range([0, height]);

   let weeks = extractWeeks(fluData);
   let x = d3.scalePoint().domain(weeks).range([0, width]);

   // using D3's stack function, our values
   let stack = d3.stack().keys(Object.keys(CATEGORIES));

   drawAreaChart(stack(fluData), y, x, svg);

   // drawing a map of canada's provinces
   d3.json('./js/maps/provinces.v2.json', function(mapJSON) {
      // populating the provinces dropdown menu with provinces
      for (let province of mapJSON.objects.provinces.geometries) {
         let option = document.createElement("option");

         option.textContent = province.properties["PRENAME"];
         option.value = province.properties["PRUID"];

         $("provinces").append(option);
      }

      drawCanada(mapJSON);

      d3.selectAll(".province").on("click", function(d) {
         // toggling the selection of a province
         selectedProvince = selectedProvince == d.properties["PRUID"] ? 1 : d.properties["PRUID"];
         $('provinces').value = selectedProvince;

         fluData = d3.values(fluWatchByProvince[selectedYear][selectedProvince]);

         let isolatedData = isolateCategory(fluData, selectedFluCategory);
         
         
         weeks = extractWeeks(fluData);
         x = d3.scalePoint().domain(weeks).range([0, width]);
         // changing the domain to accomodate the new data
         y.domain([0, max(isolatedData)]);
         drawAreaChart(stack(isolatedData), y, x, svg);
      });

      $('provinces').addEventListener('change', function() {
         selectedProvince = this.value;

         fluData = d3.values(fluWatchByProvince[selectedYear][selectedProvince]);
         
         let isolatedData = isolateCategory(fluData, selectedFluCategory);
         
         weeks = extractWeeks(fluData);
         x = d3.scalePoint().domain(weeks).range([0, width]);
         // changing the domain to accomodate the new data
         y.domain([0, max(isolatedData)]);
         drawAreaChart(stack(isolatedData), y, x, svg);
      });
   });

   $('flucategory').addEventListener('change', function() {
      selectedFluCategory = this.value;

      let isolatedData = isolateCategory(fluData, selectedFluCategory);
      // changing the domain to accomodate the new data
      y.domain([0, max(isolatedData)]);
      drawAreaChart(stack(isolatedData), y, x, svg);
   });

   d3.selectAll('.path')
      .on('click', function() {
         // toggle selectedFluCategory
         selectedFluCategory = selectedFluCategory == this.id ? "all" : this.id;

         $('flucategory').value = selectedFluCategory;

         let isolatedData = isolateCategory(fluData, selectedFluCategory);

         // changing the domain to accomodate the new data
         y.domain([0, max(isolatedData)]);
         drawAreaChart(stack(isolatedData), y, x, svg);
      })
      // retrieving binded data on hover
      .on('mouseover', function() {
         d3.select(this)
            .style("cursor", "pointer");
      });
   
   $("years").addEventListener("change", function(){
      selectedYear = this.value;
      
      fluData = d3.values(fluWatchByProvince[selectedYear][selectedProvince]);
      let isolatedData = isolateCategory(fluData, selectedFluCategory);
      weeks = extractWeeks(fluData); 
      // changing the domain to accomodate the new data
      y.domain([0, max(isolatedData)]);
      x = d3.scalePoint().domain(weeks).range([0, width]);
      
      drawAreaChart(stack(isolatedData), y, x, svg);
   });
});
