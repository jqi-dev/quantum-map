var active_node;
var Blob;

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(100))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .alphaTarget(0)
    .on("tick", ticked);

var nodes;
var links;

var link = svg.selectAll(".line");
var node = svg.selectAll(".circle");
var label = svg.selectAll(".label");

d3.json("nodes.json", function(error, graph) {
  if (error) throw error;
  nodes = graph.nodes;
  links = graph.links;
  restart();
});
        
function restart() {

  link = svg.selectAll(".line").data(links, function(d) { return d.source.id + "-" + d.target.id;})
      .enter().append("line")
      .attr("stroke-width", 2)
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
  link.exit().remove();

  node = svg.selectAll(".circle").data(nodes, function(d) { return d.id;})
      .enter().append("circle")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("r", 10)
      .attr("fill", function(d) { return color(d.group); })
      .on("click", node_onclick)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
  node.exit().remove();
 
  label = svg.selectAll(".label").data(nodes, function(d) {return d.id;})
      .enter().append("text")
      .text(function (d) { return d.name; })
      .style("text-anchor", "middle")
      .style("fill", "#555")
      .style("font-family", "Arial")
      .style("font-size", 12);
  label.exit().remove();
  
  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(1).restart();
  
}

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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

d3.select("#add_node").on("click", function(){
  simulation.stop();
  // shouldn't need to remove all, but wasn't working otherwise
  svg.selectAll("*").remove();
  var node_id = nodes.length;
  var new_node = {"id": node_id, 
                  "name": "New node", 
                  "body": null, 
                  "group": 1,
                  "vx": 0,
                  "vy": 0,
                  "x": 200,
                  "y": 200
                 };
  nodes.push(new_node);
  var new_link = {"index": links.length,
                  "source": nodes[node_id],
                  "target": nodes[getRandomInt(0,node_id-1)],
                  "weight": 1
  };
  links.push(new_link);
  restart();
});

// handle downloading graph
d3.select("#download-input").on("click", function(){
  var blob = new Blob([window.JSON.stringify({"nodes": nodes, "links": links})], {type: "text/plain;charset=utf-8"});
  window.saveAs(blob, "new_graph.json");
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
  extended_valid_elements : 'a[onclick|href]',
  content_css: '//www.tinymce.com/css/codepen.min.css'
});

function toggle_class(svg_element) {
  // toggle the active class
  var activeClass = "active";
  d3.selectAll("circle").classed(activeClass, false);
  svg_element.classed(activeClass, true);
}

function append_text(d) {
  
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

function target_link(node_id) {

  // filter all nodes by id to find matching node
  var target = d3.selectAll("circle").filter(function(d) {
    return d.id == node_id; 
  });
  
  toggle_class(target);
  append_text(target.data()[0]);
}

function node_onclick(d) {
  append_text(d);
  var node_element = d3.select(this);
  toggle_class(node_element);
}

function save_text() {
  // Button for saving editor text to JSON field
  
  // Get editor content
  var text = JSON.stringify(tinymce.get('editor').getContent())
  
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