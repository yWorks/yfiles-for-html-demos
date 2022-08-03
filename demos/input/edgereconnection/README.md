# Edge Reconnection Port Candidate Provider Demo

<img src="../../resources/image/edgereconnection.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/input/edgereconnection/index.html).

# Edge Reconnection Port Candidate Provider Demo

This demo shows how the reconnection of edge ports can be customized and restricted.

This is done with custom implementations of [IEdgeReconnectionPortCandidateProvider](https://docs.yworks.com/yfileshtml/#/api/IEdgeReconnectionPortCandidateProvider) that are added to the lookup of the edges.

## Things to Try

Select an edge and drag one of its port handles to another node. When over a node, green indicators highlight valid new locations for the port.

## Edge Types

- _Red edges_ cannot be moved to another port.
- _Orange edges_ connect to other orange nodes, but you cannot create self-loops.
- _Blue edges_ connect to all other ports (black and white dots). Note that the blue edge will reuse existing port locations.
- _Green edges_ connect to any location inside of other green nodes when the `Shift` key is pressed.
