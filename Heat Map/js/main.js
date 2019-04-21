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
			this.plotAxis(json);
	    }
	},
	plotAxis: function (dataset)
	{
		dataset.monthlyVariance.forEach(function(val){
			val.month -= 1;
		});
		const section= d3.select("#bar-box")
		.append("section");
		//Page's heading
		const heading= section.append("header");
		heading.append("h1")
		.attr("id","title")
		.text("Monthly Global Temperature");
		heading.append("h4")
		.attr("id","description")
		.text(`From ${dataset.monthlyVariance[0].year} to ${dataset.monthlyVariance[dataset.monthlyVariance.length-1].year}, with Base Temperature of: ${dataset.baseTemperature}`)
		//canvas's dimensions
		let width = 6*Math.ceil(dataset.monthlyVariance.length/12);
		let height= 12*40;
		let padd = {left: 70, right: 20, top: 60, bottom:80};
		let colorDomain = d3.extent(dataset.monthlyVariance.map(function(vary) {
			return dataset.baseTemperature + vary.variance;
        }));
		let colorScale = d3.scaleOrdinal(["#ff9e1b", "#ff7b08", "#f27d0c", "#e7590e", "#f2671d"]);
		//svg canvas
		const svg= d3.select("#bar-box")
		.append("svg")
		.attr("width", width*1.2)
		.attr("height", height);
		
		//Y axis
		const yScale= d3.scaleBand()
		.domain([0,1,2,3,4,5,6,7,8,9,10,11])
		.rangeRound([padd.top-5,(height-padd.top-20)]);
		
		const yAxis= d3.axisLeft(yScale)
		.tickFormat((d)=>{
			let mon= ['January','February','March','April','May','June','July','August','September','October','November','December'];
			return mon[d];
		})
		.tickSize(10,3);
		
		//append Y axis
		svg.append("g")
		.attr("id","y-axis")
		.classed("y-axis",true)
		.attr("transform", `translate(${padd.left-10},0)`) 
		.call(yAxis);
		
		 //X axis
		 const xScale=d3.scaleBand()
		 .domain(dataset.monthlyVariance.map(function(value){return value.year}))
		 .rangeRound([0,width]);
		
		const xAxis=d3.axisBottom(xScale)
		.tickValues(xScale.domain().filter(function(year){
          //set ticks to years divisible by 10
          return year%10 === 0;
        }))
        .tickFormat(function(year){
          let date = new Date(0);
          date.setUTCFullYear(year)
          return d3.timeFormat("%Y")(date);
        })
		 .tickSize(10, 1); 
		 //append X axis
		 svg.append("g")
		 .attr("id","x-axis")
		 .classed("x-axis",true)
		 .attr("transform", `translate(62,${height-padd.bottom})`) 
		 .call(xAxis);
		 
		 //Map values
		 this.mapHeatRanges(dataset,xScale,yScale,svg,width,height,padd,colorScale,colorDomain);
	},
	mapHeatRanges: function (dataset,xScale,yScale,heatMap,w,h,p,colorScale,colorDomain)
	{
		let variance = dataset.monthlyVariance.map(function(val){
			return val.variance;
		});
		const legendColors= ["#ff9e1b", "#ff7b08", "#f27d0c", "#e7590e", "#f2671d"];
		const minTemp = dataset.baseTemperature + Math.min.apply(null, variance);
		const maxTemp = dataset.baseTemperature + Math.max.apply(null, variance);
		const legendDomain= ((min,max,len)=>
		{
			let arr= [];
			let step=(max)/len;
			for (let i=0; i<len; i++)
			{
				let eq=min+i*step;
				arr.push(eq);
			}
		    return arr;
		})(minTemp,maxTemp,legendColors.length);
		//tooltip element
		let tooltip= d3.select("#bar-box")
		.append("div")
		.attr("id","tooltip")
		.style("opacity",0);
		
		//The legend scaling threshold
		let threshold= d3.scaleThreshold()
		.domain(legendDomain)
		.range(legendColors);
		//Legend's scaling
		let legendBar= d3.scaleLinear()
		.domain([minTemp,maxTemp])
		.range([0,w/3]);
		//Legend's axis
		let legendAxis= d3.axisBottom(legendBar)
		.tickSize(6)
		.tickValues(threshold.domain())
		.tickFormat(d3.format(".1f"));
		
		//append legend's element
		let legendEle= heatMap.append("g")
		.attr("id","legend")
		.classed("legend",true)
		.attr("transform", `translate(62,${h-p.bottom+60})`);
		
		//Map legend
		legendEle.append("g")
		.selectAll("rect")
		.data(threshold.range().map(function(color){
          let d = threshold.invertExtent(color);
          if(d[0] == null) d[0] = legendBar.domain()[0];
          if(d[1] == null) d[1] = legendBar.domain()[1];
          return d;
        }))
		.enter()
		.append('rect')
		.attr('x',(d,i)=> {console.log(d[0]); return legendBar(d[0]);})
		.attr('y', -30)
		.attr('width', (d,i)=> {return legendBar(d[1])-legendBar(d[0]);})
		.attr('height', 30)
		.attr("fill", function(d) {return threshold(d[0]); });
		
		//append legen's axis
		legendEle.append("g").call(legendAxis);
		
		//Legend descriptive text
		legendEle.append("text")
		.attr("fill", "#000")
		.attr("text-anchor", "start")
		.attr("y",0)
		.attr("x", 550)
		.text("Temperature variance (+Base Temp)");

		
		//rect grid map
		heatMap.selectAll("rect")
		.data(dataset.monthlyVariance)
		.enter()
		.append("rect")
		.attr("class","cell")
		.attr('data-month',function(d){
         return d.month;
        })
        .attr('data-year',function(d){
         return d.year;
        })
        .attr('data-temp',function(d){
         return dataset.baseTemperature + d.variance;
        })
		.attr('x', (d)=> xScale(d.year))
		.attr('y', (d)=> yScale(d.month))
		.attr("width", function(d,i){
          return 5;
        })
        .attr("height", function(d,i){
          return yScale.bandwidth(d.month);
        })
		.attr("fill", (d)=> colorScale(dataset.baseTemperature + d.variance))
		.attr("transform", `translate(62,0)`)
		//Tooltip
		.on('mouseover',function (d,i)
			{
				tooltip.transition()
				.duration(100)
				.style("opacity",.85)
				.attr("data-year",d.year)
				tooltip.html(`Month= ${d.month} <br> Year=${d.year} <br> Temp variance=${d.variance}`)
				.style("top", yScale(d.month)+70 +"px")
				.style("left",xScale(d.year)+ 70 +"px");
			})
		.on("mouseout", function(d,i)
			{
				tooltip.transition()
				.duration(100)
				.style('opacity', 0)
			});
		
	}
};



document.addEventListener("DOMContentLoaded", function(event) 
{
	dataGetter.requestFromURLandGetGraph("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json");
});
