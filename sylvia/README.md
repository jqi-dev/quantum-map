# quantum-map > sylvia > d3-process-map (graph)
**data > default > objects.json** contains nodes with parameters type, name, and depends (2-way dependency aka relationships *repetition does not matter*)
**data > default > config.json** contains information for the graph dimension and legend on the right
**data > default > \*.mkdn** contain node descriptions
**js > script.js** contains functionalities for graph and buttons
**graph.php** contains html code for index page
*TO-DO:* put in functionality to edit nodes on the page itself

# quantum-map > sylvia > d3-process-map > json-editor (editor)
**index.html** is the main page that contains js script that pulls information from objects.json and populates node properties
*TO-DO:* update button not functional -> should replace objects.json and redirect to graph page
