/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgeRouter,
  EdgeRouterData,
  EdgeRouterEdgeLabelPlacement,
  type IEdge,
  PortSides
} from '@yfiles/yfiles'
import graphData from './sample.json'
import './style.css'

// Initialize the Edge Router algorithm
const edgeRouter = new EdgeRouter({
  defaultEdgeDescriptor: {
    // Distance between edges
    minimumEdgeDistance: 5,
    // Minimum length of the first and last segments
    minimumFirstSegmentLength: 15,
    minimumLastSegmentLength: 15
  },
  // Minimum distance between nodes and edges
  minimumNodeToEdgeDistance: 5,
  // Make the router aware of the fixed labels (i.e., try avoiding overlaps with them)
  edgeLabelPlacement: EdgeRouterEdgeLabelPlacement.CONSIDER_UNAFFECTED_EDGE_LABELS,
  // Edge routes must be on a grid with spacing of 10 pixels
  gridSpacing: 10,
  // Set a maximum duration to prevent very long runtimes for LARGE graphs
  stopDuration: '5s'
})

// Create the layout data for the edge routing algorithm
const edgeRouterData = new EdgeRouterData({
  scope: {
    // Do not route edges with "skipEdgeRouting" tag
    edges: (edge) => edge.tag !== 'skipEdgeRouting'
  }
})

// Configure default (orthogonal) routing style
const defaultDescriptor = edgeRouter.defaultEdgeDescriptor
defaultDescriptor.routingStyle = 'orthogonal'

// Configure octilinear routing style
const octilinearDescriptor = defaultDescriptor.createCopy()
octilinearDescriptor.routingStyle = 'octilinear'

// Use octilinear routing for edges tagged 'octilinear', and default for the rest
edgeRouterData.edgeDescriptors = (edge) =>
  edge.tag === 'octilinear' ? octilinearDescriptor : defaultDescriptor

// Group edges tagged 'groupAtTarget' by giving them the same target group ID
const groupId = 'goldenGroup'
edgeRouterData.targetGroupIds = (edge: IEdge) => (edge.tag === 'groupAtTarget' ? groupId : null)

// Define ports candidates for edges at node 5 and 7 (on the left or right side)
edgeRouterData.ports.sourcePortCandidates = (edge) =>
  edge.sourceNode.tag === 5 || edge.sourceNode.tag === 7
    ? new EdgePortCandidates().addFreeCandidate(PortSides.RIGHT).addFreeCandidate(PortSides.LEFT)
    : null
edgeRouterData.ports.targetPortCandidates = (edge) =>
  edge.targetNode.tag === 5 || edge.targetNode.tag === 7
    ? new EdgePortCandidates().addFreeCandidate(PortSides.RIGHT).addFreeCandidate(PortSides.LEFT)
    : null

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Apply the configured edge router layout
await graphComponent.applyLayoutAnimated(edgeRouter, 0, edgeRouterData)
