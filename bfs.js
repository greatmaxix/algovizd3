d3.bfs = function () {
    var bfs = {}, nodes, edges, source, dispatch = d3.dispatch("start", "tick", "step", "end");

    bfs.run = function (src) {
        source = src;
        var unvisited = [];

        nodes.forEach(function (d) {
            if (d != src) {
                d.distance = Infinity;
                unvisited.push(d);
                d.visited = false;
            }
        });

        var current = src;
        current.distance = 0;

        function tick() {
            current.visited = true;
            current.links.forEach(function(link) {
                var tar = link.target;
                if (!tar.visited) {
                    tar.distance = current.distance + 1;
                    unvisited.push(tar);
                }
            });
            if (unvisited.length == 0 || current.distance == Infinity) {
                dispatch.end()
                return true;
            }
            unvisited.sort(function(a, b) {
                return b.distance - a.distance 
            });

            current = unvisited.pop()

            dispatch.tick();
            
            return false;
        }

        d3.timer(tick);
    }

    bfs.nodes = function (_) {
        if (!arguments.length)
            return nodes;
        else {
            nodes = _;
            return bfs;
        }
    }

    bfs.edges = function (_) {
        if (!arguments.length)
            return edges;
        else {
            edges = _;
            return bfs;
        }
    }

    bfs.source = function (_) {
        if (!arguments.length)
            return source;
        else {
            source = _;
            return bfs;
        }
    }

    dispatch.on("start.code", bfs.run);

    return d3.rebind(bfs, dispatch, "on", "end", "start", "tick");
}