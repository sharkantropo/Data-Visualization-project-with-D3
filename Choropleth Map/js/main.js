const dataGetandPlot={
	requestFromURL: url =>{
		return new Promise((resolve,reject)=>{
			let req=new XMLHttpRequest();
			req.open("GET",url,true);
			req.send();
			req.onload=() =>
			{
				if(req.status >= 200 && req.status < 300){
					json=JSON.parse(req.responseText);
					JSON.stringify(json);
					resolve(json);
				}
				else{
					reject(req.statusText)
				}
			}
		})
	},
	setPlotCanvas: (svg)=>{
		const x = d3.scaleLinear()
		.domain([2.6, 76])
		.rangeRound([600, 860]);

		const color = d3.scaleThreshold()
		.domain(d3.range(2.6, 76, (75-2.6)/8))
		.range(d3.schemeBlues[9]);
		
		//Define Legend
		const g = svg.append("g")
		.attr("class", "key")
		.attr("id", "legend")
		.attr("transform", "translate(-240,0)");
		
		g.selectAll("rect")
		.data(color.range().map(function(d) {
			/*Invert quantize color's value in hex to array of numbers.  
			In order to determine the value in the domain that corresponds to a shaded area.*/
			d = color.invertExtent(d);
				if (!d[0]) d[0] = x.domain()[0];
				if (!d[1]) d[1] = x.domain()[1];
			return d;
		}))
		.enter().append("rect")
		.attr("height", 8)
		.attr("x", d => x(d[0]))
		.attr("width", d => x(d[1]) - x(d[0]))
		.attr("fill", d=> color(d[0]));
		
		g.call(d3.axisBottom(x)
		.tickSize(12)
		.tickFormat(function(x) { return Math.round(x) + '%' })
		.tickValues(color.domain()))
		.select(".domain")
		.remove();
		
		return [x,color];
	},
	filterCollection: (dataset,d)=> dataset.filter(data=> data.fips == d.id),
	plotData: function (education,usa,svg){
		const [x,color]=this.setPlotCanvas(svg);
		const path = d3.geoPath();
		
		// Define Tooltip
		const body= d3.select('body');
		let tooltip = body.append("div")
		.attr("class", "tooltip")
		.attr("id", "tooltip")
		.style("opacity", 0);
		
		svg.append('g')
		.attr("class", "counties")
		.selectAll("path")
		//Object type: GeometryCollection
		.data(topojson.feature(usa, usa.objects.counties).features)
		.enter().append("path")
		.attr("class", "county")
		.attr("data-fips", d => d.id)
		.attr("data-education", (d)=> {
			let result = this.filterCollection(education,d);
			return result[0] ? result[0].bachelorsOrHigher:(()=>{ console.log('couldn\'t find matching data for: ', d.id); return 0;})();
		})
		.attr("fill", (d)=> {
			let result = this.filterCollection(education,d);
			return result[0] ? color(result[0].bachelorsOrHigher):(()=>{ console.log('couldn\'t find matching data for: ', d.id); return color(0);})();
		})
		.attr("d", path)
		.on("mouseover", function (d){
			//Get current coordinates
			let xLoc=d3.mouse(this)[0];
			let yLoc=d3.mouse(this)[1];
			//console.log('x : '+xLoc+' y : '+yLoc);
			tooltip.style("opacity", .85); 
			tooltip.html(() => {
				let result = dataGetandPlot.filterCollection(education,d);
				return result[0]? ` ${result[0]['area_name']}, State : ${result[0]['state']}, ${result[0].bachelorsOrHigher} %`: 0;
			}).attr("data-education", ()=> {
				let result = dataGetandPlot.filterCollection(education,d);
				return result[0]? result[0].bachelorsOrHigher: 0;
			}).style("left", (xLoc + 180) + "px") 
			.style("top", (yLoc + 15) + "px"); 
        })
		.on("mouseout", function(d) { 
            tooltip.style("opacity", 0); 
        });
		
		svg.append("path")
		.datum(topojson.mesh(usa, usa.objects.states,(a, b) => a !== b))
		.attr("class", "states")
		.attr("d", path);
		
	}
};

document.addEventListener("DOMContentLoaded", function(event) 
{
	const dataArray=['https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json',
	'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'];

	const fetchAsyncData= async item=> {
		const fetched= await dataGetandPlot.requestFromURL(item);
		return fetched;
	};
	
	const getData= async ()=> Promise.all(dataArray.map(item=>fetchAsyncData(item)));
	
	getData().then(dataset=>{
		const [education,counties]=dataset;
		// set variable for svg canvas
		const svg = d3.select("svg"),width = +svg.attr("width"),height = +svg.attr("height");	
		dataGetandPlot.plotData(education,counties,svg);
	}).catch(error=> console.log(error));
});