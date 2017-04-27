const fname = "tax-receipts-ct.tsv";

const val_col = "Receipts",
      sort_col = "Year",
      year_col = "Year",
      growth_col = "Growth";

var top_margin = 4;
var bottom_margin = 4;

var container, svg, g, year_pills;

var interval;

var setup = function(){

    clearInterval(interval);
    container = d3.select("#container")
	.style("width","100%")
	.style("height","300px");

    container.html("");
    
    svg = container.append("svg")
	.attr("shape-rendering","geometricPrecision")
	.attr("width", container.node().getBoundingClientRect().width)
	.attr("height", container.node().getBoundingClientRect().height);

    g = svg.append("g");

    year_pills = container.append("div")
	.classed("pill-
wrapper", true)
	.append("div")
	.classed("pillbox", true);


}


var center = function(){
    return [svg.node().getBoundingClientRect().width / 2,
	    svg.node().getBoundingClientRect().height / 2];
}

var get_radius = function(r)
{

    return g.append("circle")
	.attr("cx", center()[0])
	.attr("cy", center()[1])
	.style("fill","white")
	.style("new", true)
	.style("stroke", "black")
	.attr("r", r );
}

var rscale = function(d){


    var max_r = Math.min((svg.node().getBoundingClientRect().height - bottom_margin) / 2,
			 (svg.node().getBoundingClientRect().width - bottom_margin) / 2);
    
    var range = [(max_r / 1.7) , max_r];

    var domain = d3.extent(d.map(function(a){
	    return a[val_col];
    }));

    return d3.scaleLinear()
	.domain( domain )
	.range( range );
		
}

var highlight_year = function(y)
{
    d3.selectAll("g.cgroup")
	.classed("old", true)

    d3.selectAll(".pill")
	.classed("highlight", false);

    d3.select("g.cgroup[data-year='" + y + "']")
	.classed("old", false);

    d3.select(".pill[data-year='" + y + "']")
	.classed("highlight", true)
    
}

var draw_all_circles = function(d, all_d){

    var circles = g.selectAll("circle")
	.data(d);

    // circles.classed("old", true)
    // 	.classed("new", false)
    // g.selectAll("text.clabel")
    // 	.classed("old", true);
    // g.selectAll("line.rad_line")
    // 	.classed("old", true);

    var prev = false;
    
    var gs = circles.enter()
	.append("g")
	.classed("cgroup", true)
    	.classed("neg", function(a){
	    return Math.round(Number(a[growth_col]) < 0 );
	})

        .attr("data-year", function(a){ return a[year_col];});
    
    var circles = gs.append("circle")
    	.attr("data-year", function(a){ return a[year_col];})
	.attr("cx", center()[0])
	.attr("cy", center()[1])
	// .style("fill","none")
	.style("new", true)
	.attr("r", function(a, i){
	    return rscale(all_d)(a[val_col]);
	    // if ( a[growth_col].length == 0 )
	    // 	return 0;

	    // return rscale(all_d)(d[i-1][val_col]);
	    // return rscale(all_d)(prev);
	})
    // .transition().duration(500).attr("r", function(a){
    // 	return rscale(all_d)(a[val_col]);
    // })
	.classed("neg", function(a){
	    return Math.round(Number(a[growth_col]) < 0 );
	})
	.merge(circles);

    // d3.selectAll("circle:not(.old)").transition().duration(500).attr("r", function(a){
    // 	return rscale(all_d)(a[val_col]);
    // })
    
    // draw radius line
    gs.append("line")
    	.attr("data-year", function(a){ return a[year_col];})
	.classed("rad_line", true)
	.attr("x1", center()[0])
	.attr("y1", center()[1])
	.attr("x2", function(a){
	    return center()[0] + rscale(all_d)(a[val_col]);
	})
	.attr("y2", center()[1]);


    // add year label
    gs.append("text")
	.classed("clabel", true)
	.attr("x", center()[0])
	.attr("y", center()[1] - 3)
	.text(function(d){
    	    return "receipts: $" + Math.round(d[val_col] / 100) / 10 + " billion"
	});
	      // .text(function(d){ return d[year_col];});;

    var vlabel = gs.append("text")
	.classed("clabel", true)
	.classed("change_label", true)
	.classed("val_label", true)
	.attr("x", center()[0])
    	.text(function(d){
	    var fmt = numeral(d[growth_col]).format("$0,0");
	    // console.log(d[growth_col], Number(d[growth_col]), fmt, numeral(d[growth_col]).format("0.0"), d);


	    if (Number(d[growth_col]) ==  0) return "";
	    
	    return "change: " + fmt + " million";
	})

    vlabel
	.attr("y", function(){
	    return center()[1] + d3.select(this).node().getBBox().height;
	})

    // circles.enter().append("line")
    // 	.attr("data-year", function(a){ return a[year_col];})
    // 	.classed("rad_line", true)
    // 	.attr("x1", function(a){
    // 	    return center()[0] + rscale(all_d)(a[val_col]);
    // 	})
    // 	.attr("y1", center()[1])
    // 	.attr("x2", function(a){
    // 	    return center()[0] + rscale(all_d)(a[val_col]);
    // 	})
    // 	.attr("y2", function(a){
    // 	    return center()[1] + rscale(all_d)(a[val_col]);
    // 	});
    

    circles.exit().remove();

    highlight_year(d.reverse()[0][year_col]);
}

var draw = function(d){

    setup();
    
    d.forEach(function(a){
	a[val_col] = Number(a[val_col]);
    });

    var d = d.sort(function(a, b){
    	if ( Number(a[sort_col]) < Number(b[sort_col]) ) return -1;
    	return 1;
    })

    year_pills.selectAll("div.pill")
	.data(d)
	.enter()
	.append("div")
	.classed("pill", true)
	.attr("data-year", function(d){ return d[year_col]; })
	.text(function(d){ return d[year_col]; })
    	.classed("neg", function(a){
	    return Math.round(Number(a[growth_col]) < 0 );
	})
	.on("click",function(d){
	    highlight_year(d[year_col]);
	})
    	.on("hover",function(d){
	    highlight_year(d[year_col]);
	});


    year_pills.append("div")
	.classed("clear-both", true);

    console.log("all data, sorted", d);

    var added = [];

    var i = 0;
    interval = setInterval(function(){

	if ( i >= d.length){
	    clearInterval(interval);
	    return
	}
	    
	added.push(d[i]);

	draw_all_circles(added, d);
	
	i++;
    }, 500);
    
}

var go = function(d){
    draw(d);

    var throttle;

    d3.select(window).on("resize", function (){
	clearTimeout(throttle);    
	throttle = setTimeout(function(){
	    draw(d);
	}, 50);
    });
			  

    
}

d3.tsv(fname, go);
