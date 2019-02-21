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
			this.plotData(newArr);
	    }
	},
	plotData: function (data)
	{
		const svg = d3.select("#bar-box")
        .append("svg")
	}
};

// Define callback of desired key to extract data from JSON.
const neededProperty= () => { return {inf: json.data} };


document.addEventListener("DOMContentLoaded", function(event) 
{
		dataGetter.requestFromURLandGetGraph("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json");
});
