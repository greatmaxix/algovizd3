function start() {
    let svg = createSvg()
    let maxNodes = d3.select('#numNodes').property('value')
    let startNode = d3.select('#startNode').property('value')
    let endNode = d3.select('#endNode').property('value')
    let algorithm = d3.select('#algorithm').property('value')

    let graph = createGraph(maxNodes, startNode, endNode)
}

var curNode = 0;

function updateOptions() {
    let citiesData = d3.tsv('cities.tsv', function (d) {
        let maxNodes = d3.select('#numNodes').property('value')
        let startNode = d3.select('#startNode')
        let endNode = d3.select('#endNode')

        startNode.selectAll('option').remove()
        endNode.selectAll('option').remove()

        for (let i = 0; i < d.length; i++) {
            startNode.append('option')
                .attr('value', i)
                .text(d[i].Cities1)

            endNode.append('option')
                .attr('value', i)
                .text(d[i].Cities1)
        }

        // select default values
        startNode.property('value', 0)
        endNode.property('value', 1)

        curNode = 0;

        start()
    })
}

updateOptions()

function createSvg() {
    var container = d3.select('#infovis')
    container.selectAll('svg').remove()
    var svg = container.append('svg')
        .attr('width', 500)
        .attr('height', 500)

    return svg
}

function createGraph(maxNodes, startNode, endNode) {
    d3.tsv('cities.tsv', function (data) {
        data = data.slice(0, maxNodes)

        console.log(data)

        let svg = d3.select('svg')

        var nodes = [], nodesByName = {}, links = [];
        const addNodeByName = (fullname) => {
            let name = fullname.split(',')[0];
            if (!nodesByName[name]) {
                let node = { "name": name, "links": [] }
                nodesByName[name] = node;
                nodes.push(node);
                return node;
            }
            else
                return nodesByName[name];
        }

        data.forEach(function (d) {
            for (k in d) {
                if (d.hasOwnProperty(k) && k != "Cities1" && d[k] < 750) {
                    links.push({ "source": addNodeByName(d["Cities1"]), "target": addNodeByName(k), "value": parseInt(d[k]) })
                }
            }
        })

        console.log(nodes)

        force = d3.layout.force()
            .charge(-120)
            .linkDistance(100)
            .size([500, 500]);

        force
            .nodes(nodes)
            .links(links)
            .start();

        var link = svg.selectAll(".link")
            .data(links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", 1);

        var node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 5)
            .style("fill", function (d) { 
                // if start node blue
                if (d.name == data[startNode].Cities1.split(',')[0]) {
                    return "blue"
                }
                // if end node red
                else if (d.name == data[endNode].Cities1.split(',')[0]) {
                    return "red"
                }
                // else green
                else {
                    return "gray"
                }
            })
            .call(force.drag);

        link.each(function(d) {
            d.source.links.push(d);
            d.selection = d3.select(this);
        });

        node.each(function(d) {
            d.selection = d3.select(this);
        });

        link.each(function (d) {
            d.source.links.push(d);
            d.target.links.push(d);
        })

        force.on("tick", function () {
            link.attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            node.attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; });
        })

        node.on("mouseover", function (d) {
            console.log(d)
            d3.select(this)
              .attr("r", 10)

            d.links.forEach(function(l) {
              l.selection
                .style("stroke-width", 10)
              l.target.selection
                .attr("r", 7);
            })
        })

        node.on("mouseout", function(d) {
            node.attr("r", 5)
            link.style("stroke-width", 1);
        });
      
        link.on("mouseover", function() {
            d3.select(this)
              .style("stroke-width", 10);
        });
      
        link.on("mouseout", function() {
            d3.select(this)
              .style("stroke-width", 1);
        });
    })
}

function next() {
    // go to next node by highlighting it and changing the color to green
    let algorithm = d3.select('#algorithm').property('value')
    
    d3.tsv('cities.tsv', function (data) {
        // do stuff in dijkstra's algorithm
        // if (algorithm == 'dijkstra') {
            // select next node
            let nextNode = data[curNode].Cities1.split(',')[0]
            console.log(nextNode)
            d3.selectAll('circle')
                .style('fill', function (d) {
                    if (d.name == nextNode) {
                        return 'green'
                    }
                    else {
                        return 'gray'
                    }
                }
            )
        // }
    })

}

function prev() {
    // go to previous node by highlighting it and changing the color to green
}