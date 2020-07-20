const buildTreeMap= async (url)=>{
	// Define body
	const body = d3.select('body');
	// Define the div for the tooltip
	const tooltip = body.append('div')
	.attr('class', 'tooltip')
	.attr('id', 'tooltip')
	.style('opacity', 0);
	// Define svg
	const svg = d3.select('svg'),
    width = +svg.attr('width'),
    height = +svg.attr('height');
	// Color fill
	const color= d3.scaleOrdinal(['#0d0887','#41049d','#6a00a8','#8f0da4','#b12a90','#cc4778','#e16462','#f2844b','#fca636','#fcce25','#f0f921']);
	// TreeMap
	const treemap = d3.treemap()
    .size([width, height])
    .padding(2);
	
	// It's pointless to call functions if data fetching is unsuccessful.
	try{
		const dataset= await d3.json(url);
		
		const traverseHierarchy= (data)=>{
			const sumSize=(d)=> d.value, 
			traverseNodes= (d)=>{
				//console.log(`${(d.parent ? d.parent.data.id + '.' : '')}${d.data.name}`);
				return d.data.id = `${(d.parent ? d.parent.data.id + '.' : '')}${d.data.name}`; },
			sortData= (a,b)=> b.height - a.height || b.value - a.value;

			return d3.hierarchy(data).eachBefore(d => traverseNodes(d)).sum(d=> sumSize(d)).sort((a,b)=>sortData(a,b));
		};
				
		const plotDataOnTreeMap= () =>{
			
			const cell = svg.selectAll('g')
			.data(root.leaves())
			.enter().append('g')
			.attr('class', 'group')
			.attr('transform',d => 'translate(' + d.x0 + ',' + d.y0 + ')');
			
			const tile= cell.append('rect')
			.attr('id',d=> d.data.id)
			.attr('class','tile')
			.attr('height', d => d.y1 - (d.y0-0.8))
			.attr('width', d=> d.x1 - (d.x0-0.8))
			.attr('data-name', d=> d.data.name)
			.attr('data-category', d=> d.data.category)
			.attr('data-value', d=> d.data.value)
			.attr('fill', d=> color(d.data.category))
			//Tooltip
			.on('mouseover',(d)=> {
				tooltip.style('opacity', .9);
				tooltip.style('background-color',color(d.data.category));
				tooltip.html(
				'Name: ' + d.data.name + 
				'<br>Category: ' + d.data.category + 
				'<br>Value: ' + Math.round(d.data.value/1000000)
				).attr('data-value', d.data.value)
				.style('left', (d3.event.pageX + 10) + 'px') 
				.style('top', (d3.event.pageY - 28) + 'px'); 
			})
			.on('mouseout', (d)=> tooltip.style('opacity', 0));
			
			
			cell.append('text')
			.attr('class', 'tile-text')
			.attr('fill','white')
			.selectAll('tspan')
			/* FCC solution. The split pattern is either a capitalized word or uppercase letter. 
			Doesn't always fit its area, still is a better solution than blank spaces as split patterns.*/
			.data(d=>d.data.name.split(/(?=[A-Z][^A-Z])/g))
			.enter().append('tspan')
			.attr('x', 6)
			.attr('y',(d, i)=> 13 + i * 15)
			.text(d=>d);
		}
		
		const createAndAppendLegend= ()=>{
			const categories= root.leaves().map(node=>node.data.category)
			.filter((category,index,thisArr)=> thisArr.indexOf(category)===index);
			const legend = d3.select('#legend');
			let contentPerRow= Math.floor(+legend.attr('width')/120);
			
			const legendContent=legend.append('g')
			.attr('transform', 'translate(60,' + 15 + ')')
			.selectAll('g')
			.data(categories)
			.enter().append('g')
			.attr('transform',(d,i)=>`translate(${(i%contentPerRow)*120},${Math.floor(i/contentPerRow)*20+(12*(Math.floor(i/contentPerRow)))})`);
			
			legendContent.append('rect')                              
			.attr('width', 20)                          
			.attr('height', 20)     
			.attr('class','legend-item')                 
			.attr('fill', d=> color(d));
     
			legendContent.append('text')                              
			.attr('x', 25)                          
			.attr('y', 18)                       
			.text(d=> d);  
		}
		
		const root= traverseHierarchy(dataset);
		treemap(root);
		plotDataOnTreeMap();
		createAndAppendLegend();
	} catch(error){
		console.log(error);
	}
}

const FILE_PATH= 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json';


const myTreeMap= buildTreeMap(FILE_PATH);