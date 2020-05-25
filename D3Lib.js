(function() {
    let shadowRoot;

    var Ar = [];
    var xvaluearr = [];	
    var yvaluearr = [];	
	


    let template = document.createElement("template");

	
    template.innerHTML = `
		<style>

		.group text {
		  font: 11px sans-serif;
		  pointer-events: none;
		}

		.group path {
		  stroke: #000;
		}

		path.chord {
		  stroke-width: .75;
		  fill-opacity: .75;
		}

		</style>     
	`

    const d3lib = "https://d3js.org/d3.v3.min.js";

	function loadScript(src) {
	  return new Promise(function(resolve, reject) {
		let script = document.createElement('script');
		console.log("¦¦¦¦¦¦¦¦¦¦¦¦ Load script ¦¦¦¦¦¦¦¦¦¦");
		console.log(src);	    
		console.log("¦¦¦¦¦¦¦¦¦¦¦¦ Load script ¦¦¦¦¦¦¦¦¦¦");	    
		script.src = src;

		script.onload = () => {console.log("Load: " + src); resolve(script);}
		script.onerror = () => reject(new Error(`Script load error for ${src}`));

		shadowRoot.appendChild(script)
	  });
	}

	

    // Create the chart
    function d3chart(divid,value) {

var width = 480,
    height = 500,
    outerRadius = Math.min(width, height) / 2 - 4,
    innerRadius = outerRadius - 20;

var format = d3.format(",.3r");

// Square matrices, asynchronously loaded; credits is the transpose of debits.
var debits = [],
    credits = [];

// The chord layout, for computing the angles of chords and groups.
var layout = d3.layout.chord()
    .sortGroups(d3.descending)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending)
    .padding(.04);

// The color scale, for different categories of “worrisome” risk.
var fill = d3.scale.ordinal()
    .domain([0, 1, 2])
    .range(["#DB704D", "#D2D0C6", "#ECD08D", "#F8EDD3"]);

// The arc generator, for the groups.
var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

// The chord generator (quadratic Bézier), for the chords.
var chord = d3.svg.chord()
    .radius(innerRadius);

// Add an SVG element for each diagram, and translate the origin to the center.
var svg = d3.select("body").selectAll("div")
    .data([debits, credits])
  .enter().append("div")
    .style("display", "inline-block")
    .style("width", width + "px")
    .style("height", height + "px")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Load our data file…
//d3.csv("debt.csv", type, function(error, data) {
//  if (error) throw error;
//var d = [{"Activity Date":"2019-04-07T06:23:49.000Z","Activity Name":"Lunch Ride","Activity Type":"Ride","Distance":16901.30078125,"Moving Time":4731}

var d = [{"creditor":"Britain","debtor":"France","amount":22.4,"risk":3},{"creditor":"France","debtor":"Germany","amount":53.4,"risk":1},{"creditor":"Germany","debtor":"Britain","amount":321,"risk":1}];	 
	 
  var countryByName = d3.map(),
      countryIndex = -1,
      countryByIndex = [];
	    
  // Compute a unique index for each country.
  data.forEach(function(d) {
    if (countryByName.has(d.creditor)) d.creditor = countryByName.get(d.creditor);
    else countryByName.set(d.creditor, d.creditor = {name: d.creditor, index: ++countryIndex});
    if (countryByName.has(d.debtor)) d.debtor = countryByName.get(d.debtor);
    else countryByName.set(d.debtor, d.debtor = {name: d.debtor, index: ++countryIndex});
    d.debtor.risk = d.risk;
  });

  // Initialize a square matrix of debits and credits.
  for (var i = 0; i <= countryIndex; i++) {
    debits[i] = [];
    credits[i] = [];
    for (var j = 0; j <= countryIndex; j++) {
      debits[i][j] = 0;
      credits[i][j] = 0;
    }
  }

  // Populate the matrices, and stash a map from index to country.
  data.forEach(function(d) {
    debits[d.creditor.index][d.debtor.index] = d;
    credits[d.debtor.index][d.creditor.index] = d;
    countryByIndex[d.creditor.index] = d.creditor;
    countryByIndex[d.debtor.index] = d.debtor;
  });

  // For each diagram…
  svg.each(function(matrix, j) {
    var svg = d3.select(this);

    // Compute the chord layout.
    layout.matrix(matrix);

    // Add chords.
    svg.selectAll(".chord")
        .data(layout.chords)
      .enter().append("path")
        .attr("class", "chord")
        .style("fill", function(d) { return fill(d.source.value.risk); })
        .style("stroke", function(d) { return d3.rgb(fill(d.source.value.risk)).darker(); })
        .attr("d", chord)
      .append("title")
        .text(function(d) { return d.source.value.debtor.name + " owes " + d.source.value.creditor.name + " $" + format(d.source.value) + "B."; });

    // Add groups.
    var g = svg.selectAll(".group")
        .data(layout.groups)
      .enter().append("g")
        .attr("class", "group");

    // Add the group arc.
    g.append("path")
        .style("fill", function(d) { return fill(countryByIndex[d.index].risk); })
        .attr("id", function(d, i) { return "group" + d.index + "-" + j; })
        .attr("d", arc)
      .append("title")
        .text(function(d) { return countryByIndex[d.index].name + " " + (j ? "owes" : "is owed") + " $" + format(d.value) + "B."; });

    // Add the group label (but only for large groups, where it will fit).
    // An alternative labeling mechanism would be nice for the small groups.
    g.append("text")
        .attr("x", 6)
        .attr("dy", 15)
        .filter(function(d) { return d.value > 110; })
      .append("textPath")
        .attr("xlink:href", function(d) { return "#group" + d.index + "-" + j; })
        .text(function(d) { return countryByIndex[d.index].name; });
  });
}

function type(d) {
  d.amount = +d.amount;
  d.risk = +d.risk;
  d.valueOf = value; // for chord layout
  return d;
}

function value() {
  return this.amount;
}
    };	

    class D3main extends HTMLElement {
            constructor() {
	    console.log("-------------------------------------------------");	
            console.log("constructor");
	    console.log("-------------------------------------------------");	
            super();
            shadowRoot = this.attachShadow({
                mode: "open"
            });

            shadowRoot.appendChild(template.content.cloneNode(true));

            this._firstConnection = 0;

            this.addEventListener("click", event => {
                console.log('click');
                var event = new Event("onClick");
                this.dispatchEvent(event);

            });
            this._props = {};
        }

        //Fired when the widget is added to the html DOM of the page
	    connectedCallback() {
            console.log("connectedCallback");
        }

		//Fired when the widget is removed from the html DOM of the page (e.g. by hide)
		disconnectedCallback() {
			console.log("disconnectedCallback");
        }

		//When the custom widget is updated, the Custom Widget SDK framework executes this function first
        onCustomWidgetBeforeUpdate(changedProperties) {
            console.log("onCustomWidgetBeforeUpdate");
            this._props = {
                ...this._props,
                ...changedProperties
            };
        }

		//When the custom widget is updated, the Custom Widget SDK framework executes this function after the update
        onCustomWidgetAfterUpdate(changedProperties) {

           console.log("onCustomWidgetAfterUpdate");
           console.log(changedProperties);

	   console.log("%%%%%% INPUT %%%%%%");	

            if ("charttype" in changedProperties) {
                console.log("charttype:" + changedProperties["charttype"]);
                this.$charttype = changedProperties["charttype"];
            }

		
			if ("xvalue" in changedProperties) {
					console.log("xvalue:" + changedProperties["xvalue"]);
					this.$xvalue = changedProperties["xvalue"];

			}
				
			if ("yvalue" in changedProperties) {
					console.log("yvalue:" + changedProperties["yvalue"]);
					this.$yvalue = changedProperties["yvalue"];

			}
				

			var typeOfChart = this.$charttype;
			console.log("Type of chart : " + typeOfChart);	
			xvaluearr = this.$xvalue.split(';');
			console.log(xvaluearr);		
			yvaluearr = this.$yvalue.split(';');
			console.log(yvaluearr);	
			console.log("%%%%%% INPUT %%%%%%");	
            console.log("firsttime: " + this._firstConnection);
            var that = this;

		if (this._firstConnection === 0) {
			
		console.log("@@@@@@@@  html @@@@@@@@");	
		const div = document.createElement('div');
                let divid = changedProperties.widgetName;
                this._tagContainer = divid;
                div.innerHTML = '<div id="d3chart"></div>';
                shadowRoot.appendChild(div);
		console.log(div);	
		const css = document.createElement('div');
		css.innerHTML = '<style>#d3chart {margin:0 auto;width: 100%; height: 800px;overflow:hidden;}</style>';
		shadowRoot.appendChild(css);	
		var mapcanvas_divstr = shadowRoot.getElementById("chartdiv");	
                console.log(mapcanvas_divstr);	
		Ar.push({
                    'div': mapcanvas_divstr
                });
	
		console.log("@@@@@@@@ CSS  @@@@@@@@");
		console.log(css);
		console.log("@@@@@@@@ Shadow Root   @@@@@@@@");
		console.log(shadowRoot);
		console.log("@@@@@@@@  html @@@@@@@@");		
				async function LoadLibs() {
					try {
						await loadScript(d3lib);				
					} catch (e) {
						alert(e);
					} finally {	
						that._firstConnection = 1;	
					}
				}
				LoadLibs();
		} else {		
				console.log("**********///////********");
				console.log("Type of chart : " + typeOfChart);
				d3chart("","");
			
		}
				
        }

		//When the custom widget is removed from the canvas or the analytic application is closed
        onCustomWidgetDestroy() {
			console.log("onCustomWidgetDestroy");
        }
    }
    customElements.define("com-karamba-d3lib", D3main);
})();
