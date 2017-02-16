var active_node;
var Blob;

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    transform = d3.zoomIdentity;;

svg.on("mouseup", mouseup)
    .call(d3.zoom()
        .scaleExtent([1 / 2, 3])
        .on("zoom", zoomed));

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) {
        return d.id;
    }).distance(140))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .alphaTarget(0)
    .on("tick", ticked);

var nodes;
var links;

svg.append("g");

var g = svg.select("g");

var link = g.selectAll(".line");
var node = g.selectAll(".circle");
var label = g.selectAll(".label");

d3.json("nodes.json", function(error, graph) {
    if (error) throw error;
    nodes = graph.nodes;
    links = graph.links;
    restart();
});

function restart() {

    link = g.selectAll(".line").data(links, function(d) {
            return d.source.id + "-" + d.target.id;
        })
        .enter().append("line")
        .attr("stroke-width", 2)
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
    link.exit().remove();

    node = g.selectAll(".circle").data(nodes, function(d) {
            return d.id;
        })
        .enter().append("circle")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("r", 10)
        .attr("fill", function(d) {
            return color(d.group);
        })
        .on("click", node_onclick)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("mousedown", mousedowned)
        .call(d3.drag()
            .on("drag", dragged));
    node.exit().remove();

    label = g.selectAll(".label").data(nodes, function(d) {
            return d.id;
        })
        .enter().append("text")
        .text(function(d) {
            return d.name;
        })
        .style("text-anchor", "middle")
        .style("fill", "#555")
        .style("font-family", "Arial")
        .style("font-size", 12);
    label.exit().remove();

    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(0.1).restart();

}

function ticked() {
    link
        .attr("x1", function(d) {
            return d.source.x;
        })
        .attr("y1", function(d) {
            return d.source.y;
        })
        .attr("x2", function(d) {
            return d.target.x;
        })
        .attr("y2", function(d) {
            return d.target.y;
        });

    node
        .attr("cx", function(d) {
            return d.x;
        })
        .attr("cy", function(d) {
            return d.y;
        });

    label
        .attr("x", function(d) {
            return d.x;
        })
        .attr("y", function(d) {
            return d.y - 15;
        });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

d3.select("#add_node").on("click", function() {
    simulation.stop();
    g.selectAll("*").remove();
    var node_id = nodes.length;
    var new_node = {
        "id": node_id,
        "name": "New node",
        "body": null,
        "group": 1,
        "vx": 0,
        "vy": 0,
        "x": 200,
        "y": 200
    };
    nodes.push(new_node);
    var new_link = {
        "index": links.length,
        "source": nodes[node_id],
        "target": nodes[getRandomInt(0, node_id - 1)],
        "weight": 1
    };
    links.push(new_link);
    restart();
});

d3.select("#add_edge").on("click", function() {
    simulation.stop();
    g.selectAll("*").remove();
    var node_id = nodes.length - 1;
    var new_link = {
        "index": links.length,
        "source": nodes[getRandomInt(0, node_id)],
        "target": nodes[getRandomInt(0, node_id)],
        "weight": 1
    };
    links.push(new_link);
    restart();
});

// handle downloading graph
d3.select("#download-input").on("click", function() {
    var blob = new Blob([window.JSON.stringify({
        "nodes": nodes,
        "links": links
    })], {
        type: "text/plain;charset=utf-8"
    });
    window.saveAs(blob, "new_graph.json");
});

tinymce.init({
    selector: '#editor',
    height: 320,
    width: 300,
    menubar: false,
    plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table contextmenu paste code'
    ],
    toolbar: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code',
    extended_valid_elements: 'a[onclick|href]',
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
    var title = d.name;

    // if there is something in the body field, open in the editor
    if (content != null) {
        tinymce.get('editor').setContent(content);
    }

    // if the body field is empty, initialize a blank editor
    else {
        tinyMCE.get('editor').setContent('');
    }

    // set active node to selected node
    active_node = d;

    // render body field into the text box
    var target = document.getElementById("textbox");
    target.innerHTML = content;
    var title_target = document.getElementById("title-editor")
    title_target.value = title;
}

function node_onclick(d) {
    console.log("node clicked");
    if (!shiftDown) {
        append_text(d);
        var node_element = d3.select(this);
        toggle_class(node_element);
    }
}

function save_text() {
    // Button for saving editor text to JSON field

    // Get editor content
    var text = JSON.stringify(tinymce.get('editor').getContent())
    var title = document.getElementById("title-editor").value;

    if (typeof active_node !== "undefined") {
        // only if there is an active node

        // save content to body field of active node
        active_node.body = text;
        active_node.name = title;
        // set text box to new content of body field
        var target = document.getElementById("textbox");
        target.innerHTML = JSON.parse(active_node.body);

        // update graph
        g.selectAll("*").remove();
        restart();

        // filter all nodes by id to find matching node
        var selected_node = d3.selectAll("circle").filter(function(d) {
                return d.id == active_node.id;
            })
            // reset node to active class
        toggle_class(selected_node);
    }

    // toggle editor state
    toggle_editor();
}

function handleMouseOver(d, i) {
    // select element, change size
    var circle = d3.select(this);
    circle.transition()
        .attr("r", 12);
}

function handleMouseOut(d, i) {
    // select element, return to normal size
    var circle = d3.select(this);
    circle.transition()
        .attr("r", 10);
}

//
// Shift key logic for editing edges
//

var shiftDown = false;
var setShiftDown = function(event) {
    if (event.keyCode === 16 || event.charCode === 16) {
        window.shiftDown = true;
        svg.classed("crosshair", shiftDown)
    }
};

var setShiftUp = function(event) {
    if (event.keyCode === 16 || event.charCode === 16) {
        window.shiftDown = false;
        svg.classed("crosshair", shiftDown)
    }
};

window.addEventListener ? document.addEventListener('keydown', setShiftDown) : document.attachEvent('keydown', setShiftDown);
window.addEventListener ? document.addEventListener('keyup', setShiftUp) : document.attachEvent('keyup', setShiftUp);

//
// Controlling editor/viewer state
//

function toggle_editor() {
    // swap visibility of editor and text div
    toggle_visibility("text-container");
    toggle_visibility("editor-container");
    // swap ability to edit title field
    var read_value = document.getElementById("title-editor").readOnly
    document.getElementById("title-editor").readOnly = !read_value;
}

// initialize editor as hidden

document.getElementById("editor-container").style.display = 'none';
document.getElementById("title-editor").readOnly = true;

function toggle_visibility(name) {
    var div = document.getElementById(name);
    if (div.style.display !== 'none') {
        div.style.display = 'none';
    } else {
        div.style.display = 'block';
    }
};

var currentZoom = 1;
var translate_x = 0;
var translate_y = 0;

function zoomed() {
    g.attr("transform", d3.event.transform);
    currentZoom = d3.event.transform.k;
    translate_x = d3.event.transform.x;
    translate_y = d3.event.transform.y;
}

function dragged(d) {
    if (!shiftDown) {
        d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        // can set amount of simulation, 0-1. 0 means nodes don't move when adjusting position
        simulation.alpha(0).restart();
    }
}

function mousedowned() {
    var stop = d3.event.button || d3.event.shiftKey;
    if (stop) {
        d3.event.stopImmediatePropagation(); // stop zoom
        var circle = d3.select(this);
        var x_pos = circle.data()[0].x;
        var y_pos = circle.data()[0].y;
        g.append("g");
        var line = g.select("g").append("line")
            .attr("class", ".dashed")
            .attr("x1", x_pos)
            .attr("y1", y_pos)
            .attr("x2", x_pos)
            .attr("y2", y_pos)
            .attr("stroke-width", 2)
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .style("stroke-dasharray", ("3, 3"))
        svg.on("mousemove", function() {
            line.attr("x2", d3.mouse(this)[0] * currentZoom)
                .attr("y2", d3.mouse(this)[1] * currentZoom);
        });
    }
}

function mouseup() {
    svg.on("mousemove", function() {
        null
    });
    g.select("g").remove();
}
//
// Handle internal linking
//

function target_link(node_id) {

    // filter all nodes by id to find matching node
    var target = d3.selectAll("circle").filter(function(d) {
        return d.id == node_id;
    });

    toggle_class(target);
    append_text(target.data()[0]);
}

//
// Delete nodes
//

function delete_node() {
    // remove node from array of nodes
    nodes.splice(active_node.id, 1);
    // remove associated edges from array of edges
    var i = links.length;
    while (i--) {
        if (links[i].source == active_node || links[i].target == active_node) {
            links.splice(i, 1);
        }
    }
    //  console.log(links[0].source)
    g.selectAll("*").remove();
    restart()
}
