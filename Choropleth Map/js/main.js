const dataGetter={
	requestFromURLandGetGraph: function (url){
		requestFromURLandGetGraph: function (url) 
		{
			let req=new XMLHttpRequest();
			req.open("GET",url,true);
			req.send();
			req.onload=() =>
			{
				json=JSON.parse(req.responseText);
				JSON.stringify(json);
				console.log(json);
			}
		}
	}
};

document.addEventListener("DOMContentLoaded", function(event) 
{
	dataGetter.requestFromURLandGetGraph();
});