function start() {
    let svg = createSvg()
    let maxNodes = d3.select('#numNodes').property('value')
    let startNode = d3.select('#startNode').property('value')
    let endNode = d3.select('#endNode').property('value')
    let algorithm = d3.select('#algorithm').property('value')

    let graph = createGraph(maxNodes, startNode, endNode)
}

var curNode = 0;
var minDist = 700

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
        .attr('width', window.innerWidth - 200)
        .attr('height', 500)

    return svg
}

function updateEndNode() {
    let endNode = d3.select('#endNode').property('value')
    let svg = d3.select('svg')
    // select circle with class endNode
    svg.select('.endNode')
        .classed('endNode', false)
        .style('fill', 'gray')
    // select circle with class endNode
    svg.selectAll('circle')
        .filter(function (d, i) { 
            let selectedName = d3.select('#endNode').selectAll('option')[0][endNode].text.split(',')[0]
            return d.name == selectedName
         })
        .classed('endNode', true)
        .style('fill', 'red')
}

function updateStartNode() {
    let startNode = d3.select('#startNode').property('value')
    let svg = d3.select('svg')
    // select circle with class startNode
    svg.select('.startNode')
        .classed('startNode', false)
        .style('fill', 'gray')
    // select circle with class startNode
    svg.selectAll('circle')
        .filter(function (d, i) { 
            let selectedName = d3.select('#startNode').selectAll('option')[0][startNode].text.split(',')[0]
            return d.name == selectedName
        })
        .classed('startNode', true)
        .style('fill', 'blue')
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
                if (d.hasOwnProperty(k) && k != "Cities1" && d[k] < minDist) {
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

        var linkG = svg.selectAll(".link")
            .data(links)
            .enter().append("g")

        var link = linkG.append("line")
            .attr("class", "link")
            .style("stroke-width", 1);

        var linkText = linkG.append("text")
            .text(function (d) { return d.value })
            .attr('x', 6)
            .attr('y', 3)
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .attr("fill", "black")
            .style("text-anchor", "start")
            .style("display", "none")
            .call(force.drag)

        var nodeG = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")

        var node = nodeG.append("circle")
            .attr("class", "node")
            .attr("r", 5)
            .style("fill", function (d) { 
                // if start node blue
                if (d.name == data[startNode].Cities1.split(',')[0]) {
                    d3.select(this).classed("startNode", true)
                    return "blue"
                }
                // if end node red
                else if (d.name == data[endNode].Cities1.split(',')[0]) {
                    d3.select(this).classed("endNode", true)
                    return "red"
                }
                // else green
                else {
                    return "gray"
                }
            })
            .call(force.drag)

        var nodeText = nodeG.append("text")
            .text(function (d) { return d.name })
            .attr('x', 6)
            .attr('y', 3)
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .attr("fill", "black")
            .style("text-anchor", "start")
            .style("display", "none")
            .call(force.drag)

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

            nodeText.attr("x", function (d) { return d.x; })
                .attr("y", function (d) { return d.y; });

            linkText.attr("x", function (d) { return (d.source.x + d.target.x) / 2; })
                .attr("y", function (d) { return (d.source.y + d.target.y) / 2; });
        })

        node.on("mouseover", function (d) {
            d3.select(this)
              .attr("r", 10)

            d.links.forEach(function(l) {
                l.selection
                  .style("stroke-width", 10)
                l.target.selection
                  .attr("r", 7);

                l.target.selection
                  .select('text')
                  .style("display", "block")

                // show edge weight
                d3.select(l.selection.node().parentNode)
                    .select('text')
                    .style("display", "block")

                // show text for connected nodes
                d3.select(l.target.selection.node().parentNode)
                    .select('text')
                    .style("display", "block")

            })

            // show text for current node
            d3.select(this.parentNode).select('text')
                .style("display", "block")
        })

        node.on("mouseout", function(d) {
            node.attr("r", 5)
            link.style("stroke-width", 1);

            nodeText.style("display", "none")
            linkText.style("display", "none")
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

const animationTimer = new Promise(res => setTimeout(res, 1000));

function startDijkstraAnimation() {
    let startNodeIndex = document.getElementById('startNode').value
    let endNodeIndex = document.getElementById('endNode').value
    let startNode = document.getElementById('startNode').options[startNodeIndex].text.split(',')[0]
    let endNode = document.getElementById('endNode').options[endNodeIndex].text.split(',')[0]

    d3.tsv('cities.tsv', function (data) {
        let i = 0;

        
        // array of node d.name 
        let path = dijkstra(data, startNode, endNode)

        // clear all highlights
        d3.selectAll('.node')
            .style("fill", "gray")
            .attr("r", 5)

        d3.selectAll('.link')
            .style("stroke-width", 1)
            .style("stroke", "gray")
        
        // highlight path
        let pathNodes = d3.selectAll('.node')
            .filter(function (d) {
                return path.includes(d.name)
            }
        )

        pathNodes
            .style("fill", "orange")
            .attr("r", 10)

        // highlight path edges
        let pathEdges = d3.selectAll('.link')
            .filter(function (d) {
                return path.includes(d.source.name) && path.includes(d.target.name)
            }
        )

        pathEdges
            .style("stroke-width", 10)
            .style("stroke", "green")

        // highlight path edge weights
        pathEdges[0]
            .forEach(function (d) {
                d3.select(d.parentNode)
                    .select('text')
                    .style("display", "block")
            })

        // highlight path node text
        pathNodes[0]
            .forEach(function (d) {
                d3.select(d.parentNode)
                    .select('text')
                    .style("display", "block")
            })

        
        // highlight start and end nodes
        let startNodeElem = d3.selectAll('.node')
            .filter(function (d) {
                return d.name == startNode
            }
        )
            
        startNodeElem
            .style("fill", "blue")
            .attr("r", 10)
            
        let endNodeElem = d3.selectAll('.node')
            .filter(function (d) {
                return d.name == endNode
            }

        )

        endNodeElem
            .style("fill", "red")
            .attr("r", 10)

    })
}

function dijkstra(data, startNode, endNode) {
    let visited = []
    let unvisited = data.map(function (d) { return d.Cities1.split(',')[0] })

    let distances = {}
    let previous = {}

    // initialize distances and previous
    for (let i = 0; i < data.length; i++) {
        let node = data[i].Cities1.split(',')[0]
        distances[node] = Infinity
        previous[node] = null
    }

    distances[startNode] = 0

    while (unvisited.length > 0) {
        let currentNode = findLowestDistanceNode(distances, unvisited)
        unvisited.splice(unvisited.indexOf(currentNode), 1)

        let neighbors = findNeighbors(data, currentNode)
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i]
            let alt = distances[currentNode] + findDistance(data, currentNode, neighbor)
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt
                previous[neighbor] = currentNode
            }
        }

        visited.push(currentNode)

        if (currentNode == endNode) {
            break
        }
    }

    let path = []
    let currentNode = endNode
    while (currentNode != null) {
        path.push(currentNode)
        currentNode = previous[currentNode]
    }

    console.log("Shortest path: " + path.reverse().join(" -> "))

    return path.reverse()
}

function findLowestDistanceNode(distances, unvisited) {
    let lowestDistance = Infinity
    let lowestDistanceNode = null

    for (let i = 0; i < unvisited.length; i++) {
        let node = unvisited[i]
        let distance = distances[node]
        if (distance < lowestDistance) {
            lowestDistance = distance
            lowestDistanceNode = node
        }
    }

    return lowestDistanceNode
}

function findNeighbors(data, node) {
    let neighbors = []
    let d = data.filter(function (d) { return d.Cities1.split(',')[0] == node })[0]
    for (let key in d) {
        if (key != 'Cities1' && d[key] != '-' && d[key] < minDist) {
            neighbors.push(key.split(',')[0])
        }
    }

    return neighbors
}

function findDistance(data, node1, node2) {
    for (let i = 0; i < data.length; i++) {
        let d = data[i]
        let city = d.Cities1.split(',')[0]
        let otherCities = Object.keys(d).filter(function (key) { return key != 'Cities1' })

        if (city == node1 && otherCities.indexOf(node2) > -1) {
            return parseInt(d[node2])
        }
        else if (city == node2 && otherCities.indexOf(node1) > -1) {
            return parseInt(d[node1])
        }
    }
}
