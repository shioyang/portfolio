// === GLOBAL ===
var w = 500;
var h = 500;
var vqGlobal = {
   genColors: d3.scale.category10(),
   termColors: d3.scale.category20(),
   isInclude: false
};
var data_mainCircle = [{
   id: 0, cx: w / 2, cy: h / 2, r: 100, "class": "main"
},{
   id: 1, cx: w / 8, cy: h / 2, r: 30,  "class": "sub"
}];
var version = 1;

// === MAIN ===
function main(){
   var svg = d3.select("body").append("svg")
      .classed("svg", true)
      .attr("width", function(){ return w + "px"; })
      .attr("height", function(){ return h + "px"; });

   svg.selectAll("circle").data(data_mainCircle).enter()
      .append("circle")
      .attr("class", function(d){ return d.class; })
      .attr("cx", function(d){ return d.cx; })
      .attr("cy", function(d){ return d.cy; })
      .attr("r", function(d){ return d.r; })
      .style("fill", function(d){ return vqGlobal.genColors(d.id); })
      .style("stroke", function(d){ return vqGlobal.genColors(d.id); })
      .style("stroke-width", 2)
      .style("fill-opacity", .25)
      .style("stroke-opacity", .7);
   
   d3.select(".sub").call(drag);
}

// === Drag ===
var drag = d3.behavior.drag()
   .origin(function(d){ return {x: d.cx, y: d.cy}; })
   .on("dragstart", dragstarted)
   .on("drag", dragged)
   .on("dragend", dragended);

function dragstarted(d){
   // reset state
   vqGlobal.isInclude = false;
   d3.select(this).transition().duration(250)
         // .attr("r", function(d){ return d.r + 20; })
         .style("fill-opacity", .5)
         .style("stroke-opacity", 0);
}

function dragged(d){
   var c_sub = d3.select(this);
   var c_main = d3.select(".main");
   // drag
   c_sub
      .attr("cx", d3.event.x)
      .attr("cy", d3.event.y);
   // check place
   var d_sub = { cx: d3.event.x, cy: d3.event.y, r: c_sub.datum().r };
   var d_main = c_main.datum();
   c_sub.style("fill", function(d){
      vqGlobal.isInclude = isInclude(d_sub.cx, d_sub.cy, d_sub.r, d_main.cx, d_main.cy, d_main.r);
      return vqGlobal.isInclude ? "#58acfa" : vqGlobal.genColors(d.id);
   });
}

function dragended(d){
   var c_sub = d3.select(this);
   if(vqGlobal.isInclude){
      // animation: sub
		c_sub.transition().duration(300)
            .attr("cx", d3.select(".main").datum().cx)
            .attr("cy", d3.select(".main").datum().cy)
			// 	.attr("transform", function(d) { return genTranslateString(p_x, p_y); })
			.transition().delay(1500)
				.style("display", "none");
		c_sub
			.transition().duration(300).delay(300)
				.attr("r", 0);

      // animation: ripple
      var ripple = [
            { delay: 100 },
            { delay: 200 },
            { delay: 300 }
         ];
      var g_ripple = d3.select("svg").append("g").selectAll("circle").data(ripple).enter().append("circle")
         .attr("cx", d3.select(".main").datum().cx)
         .attr("cy", d3.select(".main").datum().cy)
         .attr("r", 0)
         .style("fill-opacity", 0)
         .style("stroke", d3.select(".main").style("stroke"))
         .style("stroke-width", 2)
         .style("stroke-opacity", .7)
         .transition().duration(1200).delay(function(d) { return d.delay; })
            .attr("r", d3.select(".main").datum().r)
            .style("stroke-opacity", 0);
      g_ripple.transition().delay(1500) // = 1200 + Max(ripple.delay)
         .remove();
   }else{
      // reset place
      c_sub
         .style("fill", function(d){ return vqGlobal.genColors(d.id); })
         .transition().duration(500).ease("elastic")
            .attr("cx", function(d){ return d.cx; })
            .attr("cy", function(d){ return d.cy; })
         .transition().delay(500).duration(250).ease("cubic")
            .style("fill-opacity", .25)
            .style("stroke-opacity", .7);
   }
}

// === Util ===
function isInclude(c1_cx, c1_cy, c1_r, c2_cx, c2_cy, c2_r){
	var dist = Math.sqrt(Math.pow(c1_cx - c2_cx, 2) + Math.pow(c1_cy - c2_cy, 2));
	return dist + Math.min(c1_r, c2_r) < Math.max(c1_r, c2_r);
}

// ========
main();

