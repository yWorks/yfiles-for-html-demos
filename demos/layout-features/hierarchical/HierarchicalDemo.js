/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import { demoApp, graphComponent } from '@yfiles/demo-app/init'
import {
  EdgePortCandidates,
  HierarchicalLayout,
  HierarchicalLayoutData,
  HierarchicalLayoutEdgeDescriptor,
  LayoutOrientation,
  PortSides
} from '@yfiles/yfiles'
import graphData from './sample.json'
import './style.css'

// Initialize the Hierarchical Layout algorithm
const layout = new HierarchicalLayout({
  defaultEdgeDescriptor: {
    // The first segment length can be used to reserve "space" for edge source decorations (typically arrowheads)
    // Reduce it here to reduce the overall height of the diagram
    minimumFirstSegmentLength: 5,
    // Increase the last segment length to prevent bends within target arrowheads.
    minimumLastSegmentLength: 20
  },
  defaultNodeDescriptor: {
    // Set vertical alignment for nodes within a layer (0 = top-aligned, useful for varying node heights).
    // See e.g., the layer with nodes 1, 6, 8, 9, 23, and 25
    layerAlignment: 0
  },
  // The main layout orientation
  layoutOrientation: LayoutOrientation.BOTTOM_TO_TOP,
  // Set a maximum duration to prevent very long runtimes for LARGE graphs
  stopDuration: '5s',
  // Minimum vertical spacing between nodes in different layers
  minimumLayerDistance: 30,
  // Minimum horizontal distance between nodes and multi-layer edges.
  // See e.g., node 1 and the edge connecting node 0 and node 4
  nodeToEdgeDistance: 50,
  // Minimum horizontal spacing between nodes in the same layer
  nodeDistance: 10,
  coordinateAssigner: {
    // Reduce bends for edges spanning layers
    // See e.g., the edges connecting node 26 to node 6 and node 10 to node 20
    straightenEdges: true,
    // Disable barycenter symmetry optimization which conflicts with edge straightening
    symmetryOptimizationStrategy: 'none'
  }
})

// Initialize layout data for the hierarchical layout algorithm
const layoutData = new HierarchicalLayoutData()

// It is possible to specify routing options for specific edges only
// The following code defines a custom descriptor for octilinear edge routing
const octilinearEdgeDescriptor = new HierarchicalLayoutEdgeDescriptor({
  minimumFirstSegmentLength: 5,
  minimumLastSegmentLength: 20,
  routingStyleDescriptor: { defaultRoutingStyle: 'octilinear' }
})
// Assign octilinear descriptor to edges tagged 'octilinear', otherwise use default (orthogonal)
layoutData.edgeDescriptors = (edge) =>
  edge.tag === 'octilinear' ? octilinearEdgeDescriptor : layout.defaultEdgeDescriptor

// Prioritize edges tagged 'criticalPath' for straighter routing
// See the edges connecting nodes 19, 0, 1, and 2
layoutData.criticalEdgePriorities = (edge) => (edge.tag === 'criticalPath' ? 10 : 0)

// Force the edge from node 20 to node 21 to exit its source node from the RIGHT side
layoutData.ports.sourcePortCandidates = (edge) =>
  edge.tag === 'rightOut' ? new EdgePortCandidates().addFreeCandidate(PortSides.RIGHT) : null

// Force the edge from node 9 to node 7 to enter its target node from the RIGHT side
layoutData.ports.targetPortCandidates = (edge) =>
  edge.tag === 'rightIn' ? new EdgePortCandidates().addFreeCandidate(PortSides.RIGHT) : null

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Apply the configured hierarchical layout
await graphComponent.applyLayoutAnimated(layout, 0, layoutData)
