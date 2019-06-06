function $(selector) {
   return document.getElementById(selector);
}

Array.prototype.cloneObjects = function() {
   let copy = [];

   for (let i in this) {
      copy[i] = Object.assign({}, this[i]);
   }

   return copy;
};


function isolateCategory(data, category = "all") {
   let clonedData = data.cloneObjects();

   if (category != "all") {
      for (let c of Object.keys(CATEGORIES)) {
         if (c != category)
            clonedData.forEach(function(el) { el[c] = 0 });
      }
   }
   return clonedData;
}

function extractWeeks(data) {
   let weeks = [];

   for (let record of data)
      weeks.push(`${record["startDate"]}-${ record["endDate"] }`);
   return weeks;
}
