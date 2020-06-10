# Network Flows Demo

<img src="../../resources/image/networkflows.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/analysis/networkflows/index.html).

_Network flow_ algorithms apply to directed networks in which edges have certain capacities and a flow moves from source nodes (i.e., nodes with in-degree 0) to sink nodes (i.e., nodes with out-degree 0).

In our everyday life, flow algorithms can be applied to all problem domains that involve networks (e.g., water supply, electricity/power, internet, shipment) in which the goal is to move some flow (e.g., water, electricity/power, products, internet traffic, message) from one position to another within the network as efficient as possible.

The demo presents three flow algorithms that will be applied on a network with water pipes. The thickness of each edge indicates the edge capacity while the blue-colored part the flow load. The label of each edge is in form "flow / capacity".

The blue part in the interior of each node indicates the flow that comes across the node through the incoming edges. Source nodes are bounded by a green rectangle, while sink nodes by a red rectangle. For "Minimum Cost" algorithm, source nodes are also the ones that can "supply" flow to the network, while sink nodes are those that "demand" flow from the network.

The user can select one of the provided algorithms using the combo-box in the toolbar. The result of each algorithm is also visualized in the toolbar. In the case where for some reason, no feasible solution is found, the result will be -1. Possible changes to the flow due to another algorithm selection or user interaction are highlighted temporary with orange color.
