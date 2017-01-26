var active_node;

console.log(active_node)

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(200).strength(1))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("nodes.json", function(error, graph) {
  if (error) throw error;

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", 2);

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 10)
      .attr("fill", function(d) { return color(d.group); })
      .on("click", append_text)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

  var label = svg.selectAll(".mytext")
    .data(graph.nodes)
    .enter().append("text")
      .text(function (d) { return d.name; })
      .style("text-anchor", "middle")
      .style("fill", "#555")
      .style("font-family", "Arial")
      .style("font-size", 12);

  node.append("title")
      .text(function(d) { return d.id; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    
    label
        .attr("x", function(d){ return d.x; })
        .attr("y", function (d) {return d.y -15; });
  }
});

tinymce.init({
  selector: 'textarea',
  height: 315,
  width: 600,
  menubar: false,
  plugins: [
    'advlist autolink lists link image charmap print preview anchor',
    'searchreplace visualblocks code fullscreen',
    'insertdatetime media table contextmenu paste code'
  ],
  toolbar: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code',
  content_css: '//www.tinymce.com/css/codepen.min.css'
});

function append_text(d) {
  
  // toggle the active class
  var activeClass = "active";
  d3.selectAll("circle").classed(activeClass, false);
  d3.select(this).classed(activeClass, true);
  console.log("test")
  
  // append text to editor and text box
  var content = JSON.parse(d.body);
  
  // if there is something in the body field, open in the editor
  if (content != null) {
    tinymce.get('editor').setContent(content);
  }
  
  // if the body field is empty, initialize a blank editor
  else { tinyMCE.get('editor').setContent(''); }
  
  // set active node to selected node
  active_node = d;
  
  // render body field into the text box
  var target = document.getElementById("textbox");
  target.innerHTML = content;
  
}

function save_text() {
  // Button for saving editor text to JSON field
  
  // Get editor content
  var text = JSON.stringify(tinymce.get('editor').getContent())
  console.log(text)
  
  if(typeof active_node !== "undefined") {
    // only if there is an active node
    
    // save content to body field of active node
    active_node.body = text;
    
    // set text box to new content of body field
    var target = document.getElementById("textbox");
    target.innerHTML = JSON.parse(active_node.body);
  } 
  
  // toggle editor state
  toggle_editor();
}

function handleMouseOver(d, i) { 
  // select element, change size
  var circle = d3.select(this);
  circle.transition()
        .attr("r", 15 );

}

function handleMouseOut(d, i) {
  // select element, return to normal size
  var circle = d3.select(this);
  circle.transition()
        .attr("r", 10);
}

//
// Controlling editor/viewer state
//

function toggle_editor() {
  toggle_visibility("text-container");
  toggle_visibility("editor-container");
}

// initialize editor as hidden

document.getElementById("editor-container").style.display = 'none';

function toggle_visibility(name) {
    var div = document.getElementById(name);
    if (div.style.display !== 'none') {
        div.style.display = 'none';
    }
    else {
        div.style.display = 'block';
    }
};
