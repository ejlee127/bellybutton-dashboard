
// Function to initialize the charts with given sample
    /*
        name: string, name of the given samle
        info: object, metadata of the sample
        sample: object, data for this sample - the otu_ids, otu_labels and sample_values
    */
function init(name, info, sample){

    //---- Display demographic info 
    demographicInfo(info);

    // zip, sort and slice the data in sample
    var otus = sortSample(sample);    
    var otus10 = otus.slice(0,10).reverse();

    //---- Init bar chart with top 10 otus of the given sample
    var data = [{
        type: 'bar',
        x: otus10.map( (d) => d.sample_values ),
        y: otus10.map( (d) => `OTU-${d.otu_ids}` ),
        text: otus10.map( (d) => d.otu_labels ),
        orientation: 'h'
    }];
    var layout = {
        title: `<b>Top 10 Sample Values</b>`,
        xaxis: {title: "Sample values"},
        yaxis: {title: "OTU ID"},
    }
    Plotly.newPlot("bar", data, layout);

    //---- Init bubble chart with the given sample
    var data = [{
        x: otus.map( (d) => d.otu_ids ),
        y: otus.map( (d) => d.sample_values ),
        text: otus.map( (d) => d.otu_labels ),
        mode: 'markers',
        marker: {
        size: otus.map( (d) => d.sample_values ),
        color: otus.map( (d) => d.otu_ids )
        }
    }];  
    var layout = {
        title: `<b>All Sample Values</b>`,
        xaxis: {title: "OTU ID"},
        yaxis: {title: "Sample values"},
        showlegend: false
    };  
    Plotly.newPlot('bubble', data, layout);

    console.log(info.wfreq);
    // ---- Init gauge chart with the given sample
    var gaugeStep = []
    for (var i=0; i<10; i++) {
        gaugeStep.push({ 
            range: [i,i+1], 
            color: `rgb(${245-i*5},${245-i*20},${220-i*20})`,
            name: `${i}-${i+1}`
        });
    }
    console.log(gaugeStep);

    var dataGauge = [{
        type: "indicator",
        mode: "gauge",
        value: info.wfreq,
        gauge: {
            axis: { range: [null, 10], 
                //tickwidth: 1, tickcolor: "darkblue" 
            },
            bar: { color: "rgb(0,76,153" },
            bgcolor: "white",
            borderwidth: 2,
            bordercolor: "gray",
            steps: gaugeStep,
        }
    }];

    var layout = {
        title: `<b>Belly Button Washing Frequency</b><br> Scrubs per Week`,
        width: 500, height: 300, margin: { t: 100, b: 0 }
    };
    Plotly.newPlot("gauge", dataGauge, layout);
    gaugeNeedle(info.wfreq);
}

// Load the sample names and initialize the charts
d3.json("../../data/samples.json").then( (data) => {
    
    names = data.names;

    // Add options for select tag   
    d3.select("#selDataset").selectAll("option")
        .data(names)
        .enter()
        .append("option")
        .attr("value", function(d) {return d})
        .text(function(d) {return "BB-"+d});

    // Show initial metadata and charts
    init(names[0], data.metadata[0], data.samples[0]);
        
});

// Action from 'selection' 
function optionChanged(name) {
    d3.json("../../data/samples.json").then( (data) => {
        // id in metadata : data type is integer
        var sampleInfo = data.metadata.filter( (sample) => sample.id === parseInt(name) )[0];
        demographicInfo(sampleInfo);

        // id in samples : data type is string
        var selectedSample = data.samples.filter( (sample) => sample.id === name )[0];

        // Sorted otus of the selected sample
        var otus = sortSample(selectedSample);

        // Update the charts
        updateBar(otus.slice(0,10));
        updateBubble(name,otus);
        updateGauge(sampleInfo.wfreq);
    });
    
};

function demographicInfo(info) {
    var infoList = d3.select("#sample-metadata");
    infoList.html("");
    Object.entries(info)
        .forEach( ([key,value]) => 
        infoList.append("p")
        .text(`${key.toUpperCase()}: ${value}`));
}

// horizontal bar chart of sample_values and otu_ids.
function updateBar(otus) {

    otus.reverse();
    var x = otus.map( (d) => d.sample_values );
    var y = otus.map( (d) => `OTU-${d.otu_ids}` );
    var text= otus.map( (d) => d.otu_labels );


    Plotly.restyle("bar", "x", [x]);
    Plotly.restyle("bar", "y", [y]);
    Plotly.restyle("bar", "text", [text]);

}

function updateBubble(name,otus) {

    x = otus.map( (d) => d.otu_ids );
    y = otus.map( (d) => d.sample_values );
    text = otus.map( (d) => d.otu_labels );
    marker = {
        size: otus.map( (d) => d.sample_values ),
        color: otus.map( (d) => d.otu_ids )
        };
  
    Plotly.restyle('bubble', "x", [x]);
    Plotly.restyle('bubble', "y", [y]);
    Plotly.restyle('bubble', "marker", [marker]);
}

function updateGauge(value) {
    Plotly.restyle("gauge", "value", [value]);
    gaugeNeedle(value);
}

function sortSample(sample) {
    // Create an array of object of three keys  -- zipped object
    var otus = []
    var len = sample.otu_ids.length;
    for (var i=0; i<len; i++) {
        otus.push( { 
            "otu_ids" : sample.otu_ids[i],
            "sample_values" : sample.sample_values[i],
            "otu_labels" : sample.otu_labels[i]
        }  );
    }
    // Sort the sample object by sample_values in descending order
    otus.sort( (a,b) => b.sample_values - a.sample_values );
    return otus;
}

function gaugeNeedle(value) {

    // needle center & radius
    var cx = 245;
    var cy = 280;
    var cr = 10;
    // needle length
    var length = 130
    // needle point angle clockwise
    var radians = Math.PI * value / 10
    // needle center translation
    var ox = -1 * cr * Math.cos(radians)
    var oy = cr * Math.sin(radians)
    // needle endpoint translation
    var px = -1 * length * Math.cos(radians)
    var py = length * Math.sin(radians)

    // needle triangle three points
    var needlePoints = `${cx-oy}, ${cy-ox}
                        ${cx+oy}, ${cy+ox}
                        ${cx+px}, ${cy-py}`;

    // Select svg-main class created by 'gauge' plot
    var svg = d3.select("#gauge").select(".main-svg")

    // Remove previous needle
    svg.selectAll("circle").remove();
    svg.select("polygon").remove();

    // Add a circle for needle center
    svg.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", cr)
        .attr("fill", "purple")

    // Add a triangle for needle
    svg.append("polygon")
        .attr("points", needlePoints)
        .attr("fill", "purple")
}