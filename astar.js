d3.astar = function() {
    var astar = {}, nodes = [], edges = [], source, dispatch = d3.dispatch("start", "tick", "step", "end");

    astar.run = function(src, tar) {
        source = src;

        var unvisited = [];

        nodes.forEach(function(d) {
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
                    var dist = current.distance + link.value;
                    tar.distance = Math.min(dist, tar.distance);
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

    astar.nodes = function(_) {
        if (!arguments.length)
            return nodes;
        else {
            nodes = _;
            return astar;
        }
    }

    astar.edges = function(_) {
        if (!arguments.length)
            return edges;
        else {
            edges = _;
            return astar;
        }
    }

    astar.source = function(_) {
        if (!arguments.length)
            return source;
        else {
            source = _;

            return astar;
        }
    }

    dispatch.on("start.code", astar.run);

    return d3.rebind(astar, dispatch, "on");
}