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
			newArr=neededProperty().inf.slice(0,neededProperty().inf.length);
			this.plotAxis(newArr);
	    }
	},
	plotAxis: function (data)
	{
		//Current main element width and height
		const ele=document.getElementById("bar-box");
		const w= 800;
		const h= 600;
		const widthBar= h/data.length;
		const padding= 30;
		// Map date and gdp from array
		const dates= data.map(d => 
		{
			return new Date(d[0]);
		});
		const gdps= data.map(d=>
		{
			return d[1];
		});
		//Svg canvas
		const svg = d3.select("#bar-box")
		.append("svg")
		.attr("width", w)
		.attr("height", h)
		.style("background","#dff0d8");
		// Text
		svg.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('x', -300)
		.attr('y', 70)
		.text('Gross Domestic Product');
  
		svg.append('text')
		.attr('x', w/4)
		.attr('y', padding)
		.text('Source: http://www.bea.gov/national/pdf/nipaguid.pdf')
		
		//Scale Y axis
		const yScale = d3.scaleLinear() 
		 .domain([0, d3.max(gdps, (d) => d)+100]) 
		 .range([h-padding,0]);
		const gdpScaled= d3.scaleLinear()
		 .domain([0, d3.max(gdps, (d) => d)+100]) 
		 .range([0,h-padding]);
		//Scale X axis
		const xScale = d3.scaleTime() 
		 .domain([d3.min(dates, (d)=> d), d3.max(dates,(d)=> d)]) 
		 .range([padding+10,w - padding]);
		// Y axis 
		const yAxis = d3.axisLeft(yScale);
		svg.append("g")
		 .attr("id","y-axis")
		 .attr("transform", "translate("+(padding+10) + ",0)") 
		 .call(yAxis);
		// X axis
		const xAxis = d3.axisBottom(xScale);
		svg.append("g")
		 .attr("id","x-axis")
		 .attr("transform", "translate(0 ,"+(h-padding) + ")") 
		 .call(xAxis);
		//Plot bar chart call
		this.plotCharBar(dates,gdps,svg,xScale,gdpScaled,data, widthBar);
	},
	plotCharBar: function (date,gdp,svg,xsc,ysc,data,wBar)
	{
		let dataset=[];
		for (let i=0; i<gdp.length; i++)
		{
			dataset.push([date[i],gdp[i]]);
		}
		let returnMonth= (num)=>
		{
			let mon=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Nov","Dec"];
			return mon[num];
		};
		let tooltip= d3.select("#bar-box")
		.append("div")
		.attr("id","tooltip")
		.style("opacity",0);
		
		
		svg.selectAll("rect")
			.data(dataset)
			.enter()
		// Bar char rectangles
			.append("rect")
			.attr("class","bar")
			.attr("width", wBar)
			.attr("height", (d)=> ysc(d[1]))
			.attr("data-date", (d,i)=> data[i][0])
			.attr("data-gdp", (d,i)=> data[i][1])
			.attr("x",(d,i)=> xsc(d[0]))
			.attr("y",(d,i)=> 570-ysc(d[1]))
			.style("fill","#3c763d")
		// Data tooltip
			.on("mouseover", function(d,i){
				tooltip.transition()
				.duration(300)
				.style("opacity",1);
				tooltip.html(`${d[0].getUTCFullYear()} ${returnMonth(d[0].getUTCMonth())} $ ${data[i][1]} Billions`)
				.attr("data-date", data[i][0])
				.style("top", 300 +"px")
				.style("left", 350 +"px");
			})
			.on("mouseout", function(d,i)
			{
				tooltip.transition()
				.duration(300)
				.style('opacity', 0);
			});
	}
};

// Define callback of desired key to extract data from JSON.
const neededProperty= () => { return {inf: json.data} };


document.addEventListener("DOMContentLoaded", function(event) 
{
		dataGetter.requestFromURLandGetGraph("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json");
});
