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
  EdgeLabelPlacement,
  EdgeLabelPreferredPlacement,
  FreeEdgeLabelModel,
  GenericLabeling,
  GenericLabelingData,
  Insets,
  LabelAlongEdgePlacements,
  LabelAngleReferences,
  LabelEdgeSides,
  LabelSideReferences,
  OrganicLayout,
  OrganicLayoutData,
  ParallelEdgeRouterData
} from '@yfiles/yfiles'
import graphData from './sample.json'

// Configure the organic layout
const organicLayout = new OrganicLayout({
  // Enable the automatic edge label placement
  edgeLabelPlacement: EdgeLabelPlacement.INTEGRATED,
  // Set the preferred length for the edges
  defaultPreferredEdgeLength: 150,
  deterministic: true
})

/*
  Note: Integrated edge labeling produces satisfying results for a lot of cases by default.
  Additionally, the algorithm offers control over how to place individual labels (EdgeLabelPreferredPlacement).
  For better results, specify both the side and angle of the labels relative to the edge.
*/

// Place label close to the edge's source node, on the left and parallel to the edge flow
const closeToSourcePlacement = new EdgeLabelPreferredPlacement({
  placementAlongEdge: LabelAlongEdgePlacements.AT_SOURCE_PORT,
  sideReference: LabelSideReferences.RELATIVE_TO_EDGE_FLOW,
  angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW,
  edgeSide: LabelEdgeSides.LEFT_OF_EDGE,
  distanceToEdge: 4
})

// Place label close to the edge's target node, on the right and parallel to the edge flow
const closeToTargetPlacement = new EdgeLabelPreferredPlacement({
  placementAlongEdge: LabelAlongEdgePlacements.AT_TARGET_PORT,
  sideReference: LabelSideReferences.RELATIVE_TO_EDGE_FLOW,
  angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW,
  edgeSide: LabelEdgeSides.RIGHT_OF_EDGE,
  distanceToEdge: 4
})

// Default: Place label parallel to edge flow
const defaultPlacement = new EdgeLabelPreferredPlacement({
  sideReference: LabelSideReferences.RELATIVE_TO_EDGE_FLOW,
  angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
})

// Use layout data to pass the info about the placement of individual edges
const organicLayoutData = new OrganicLayoutData({
  // Assign preferred label placements based on the label text
  edgeLabelPreferredPlacements: (label) => {
    switch (label.text) {
      case 'Source':
      case 'Parallel Source':
        return closeToSourcePlacement
      case 'Target':
      case 'Parallel Target':
        return closeToTargetPlacement
      default:
      case 'Default':
        return defaultPlacement
    }
  }
})

/*
  Note: Labels on parallel edges or self-loops are routed by specialized routers (ParallelEdgeRouter
  and SelfLoopEdgeRouter), not the organic layout itself.
  For these, we must use a generic labeling algorithm.
*/

// Setup GenericLabeling
const layout = new GenericLabeling({
  coreLayout: organicLayout,
  // Place only the edge labels
  scope: 'edge-labels',
  deterministic: true
})

// Specify that GenericLabeling should only arrange labels on self-loops or parallel edges
const labelingData = new GenericLabelingData({
  scope: {
    edgeLabels: (label) => {
      const owner = label.owner
      const isParallelEdge = new ParallelEdgeRouterData().routedMultiEdgesResult.includes(owner)
      const isSelfLoopEdge = owner.isSelfLoop
      return isSelfLoopEdge || isParallelEdge
    }
  }
})

// Prevent labels overlap with edge arrows by reserving space above nodes
labelingData.nodeMargins = new Insets(5)

// Use unrestricted FreeEdgeLabelModel for this demo so that labels can rotate freely
graphComponent.graph.edgeDefaults.labels.layoutParameter =
  new FreeEdgeLabelModel().createParameter()

// Combine all layout data to pass all info to the algorithm
const layoutData = organicLayoutData
  .combineWith(new ParallelEdgeRouterData())
  .combineWith(labelingData)

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Apply the configured layout and layout data
await graphComponent.applyLayoutAnimated(layout, 0, layoutData)
