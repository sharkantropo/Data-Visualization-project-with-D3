const dataGetter=
{
	requestFromURLandGetGraph: function (url) 
	{
		let req=new XMLHttpRequest();
		req.open("GET",url,true);
		req.send();
		req.onload=() =>
		{
			json=JSON.parse(req.responseText);
			JSON.stringify(json);
			const cyclingData= json.map
			((hist)=>
			{
				return neededObject(hist);
			});
			this.plotAxis(cyclingData);
	    }
	},
	plotAxis: function (data)
	{
		//Current main element width and height
		const w= 800;
		const h= 600;
		const widthBar= h/data.length;
		const padding= 30;
		//Color pallete
		const colPal= d3.scaleOrdinal(d3.schemeSet2);
		//Date objects array
		const racingTime= data.map((cyclist)=>
		{
			let trackTime=cyclist.Time.split(':');
			return new Date(Date.UTC(1990,1,1,0,trackTime[0],trackTime[1]));
		});
		let minutesFormat=d3.timeFormat("%M:%S");
		//SVG canvas
		const svg = d3.select("#bar-box")
		.append("svg")
		.attr("width", w)
		.attr("height", h);
		//Scale Y axis
	    const yScale= d3.scaleTime()
		.domain(d3.extent(racingTime,(d)=> { return d;}))
		.range([h-padding,padding]);
		// Y axis 
		const yAxis = d3.axisLeft(yScale)
	.tickFormat((d)=> {return minutesFormat(d)});
		svg.append("g")
		 .attr("id","y-axis")
		 .attr("transform", "translate("+(padding+10) + ",0)") 
		 .call(yAxis);
		//Scale X axis
		const xScale= d3.scaleLinear()
		.domain([d3.min(data,(d)=> d.Year-1),d3.max(data,(d)=> d.Year+1)])
		.range([padding+10,w-padding]);
		// X axis
		const xAxis= d3.axisBottom(xScale).tickFormat((d)=> d);
		svg.append("g")
		.attr("id","x-axis")
		.attr("transform", "translate("+ 0 + ","+(h-padding)+")")
		.call(xAxis);
		this.plotScatterDots(svg,data,racingTime,yScale,xScale,widthBar,colPal)
	},
	plotScatterDots: function (svg,dataset,racingTime,yScale,xScale,wBar,colPal)
	{
		//tooltip element
		let tooltip= d3.select("#bar-box")
		.append("div")
		.attr("id","tooltip")
		.style("opacity",0);
		//scatterplot
		svg.selectAll("circle") 
		.data(dataset) 
		.enter() 
		.append("circle")
		.attr("class","dot")
		.attr("data-xvalue",(d)=> d.Year)
		.attr("data-yvalue",(d,i)=> racingTime[i])
		.attr("cx",(d,i)=> xScale(d.Year)) 
		.attr("cy",(d,i)=> yScale(racingTime[i])) 
		.attr("r", 6)
		.attr("fill", (d)=>{return colPal(d.Doping !== "")})
		//Tooltip
		.on('mouseover',function (d,i)
			{
				tooltip.transition()
				.duration(100)
				.style("opacity",.85)
				.attr("data-year",d.Year)
				tooltip.html(`Name= ${d.Name} <br> Nationality= ${d.Nationality} <br> Year=${d.Year} <br> Race time=${d.Time} <div>${d.Doping}</div>`)
				.style("top", yScale(racingTime[i])+ 60 +"px")
				.style("left", xScale(d.Year)+40 +"px");
			})
		.on("mouseout", function(d,i)
			{
				tooltip.transition()
				.duration(100)
				.style('opacity', 0)
			});
		//Legend
		const legend=svg.selectAll('.legend')
		.data(colPal.domain())
		.enter().append("g")
		.attr("class", "legend")
		.attr("id", "legend")
		.attr("transform", function(d, i) { 
			return "translate(0," + (600/3 - i * 20) + ")";
		});
		
		legend.append("circle")
		.attr("cx", 800-40)
		.attr("cy", 250)
		.attr("r",6)
		.attr("fill", colPal);
		
		legend.append("text")
		.attr("x", 800-50)
		.attr("y", 250)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(function(d) {
			if (d) return "Riders with doping allegations";
		else {
				return "No doping allegations";
			};
		});
	}
};

// Define callback of desired key to extract data from JSON.
const neededObject= (data)=>{ return {"Time": data.Time, "Name": data.Name, "Year":data.Year, "Nationality":data.Nationality, "Doping":data.Doping}};


document.addEventListener("DOMContentLoaded", function(event) 
{
	dataGetter.requestFromURLandGetGraph("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json");
});
