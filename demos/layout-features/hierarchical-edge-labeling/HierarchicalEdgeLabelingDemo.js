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
  EdgeLabelPreferredPlacement,
  FreeEdgeLabelModel,
  HierarchicalLayout,
  HierarchicalLayoutData,
  Insets,
  LabelAlongEdgePlacements,
  LabelAngleReferences,
  LabelEdgeSides,
  LabelSideReferences
} from '@yfiles/yfiles'
import graphData from './sample.json'

// Default label placement
const defaultPlacement = new EdgeLabelPreferredPlacement()

// Place label near source node, on left of edge (relative to the edge direction)
const closeToSourcePlacement = new EdgeLabelPreferredPlacement({
  placementAlongEdge: LabelAlongEdgePlacements.AT_SOURCE_PORT,
  sideReference: LabelSideReferences.ABSOLUTE_WITH_LEFT_ABOVE,
  edgeSide: LabelEdgeSides.LEFT_OF_EDGE,
  distanceToEdge: 4
})

// Place label near target node, on right of edge (relative to the edge direction)
const closeToTargetPlacement = new EdgeLabelPreferredPlacement({
  placementAlongEdge: LabelAlongEdgePlacements.AT_TARGET_PORT,
  edgeSide: LabelEdgeSides.RIGHT_OF_EDGE,
  distanceToEdge: 4
})

// Rotate label parallel to edge, placed near target node
const downwardsPlacement = new EdgeLabelPreferredPlacement({
  angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW,
  placementAlongEdge: LabelAlongEdgePlacements.AT_TARGET,
  edgeSide: LabelEdgeSides.LEFT_OF_EDGE,
  distanceToEdge: 4
})

// Rotate label parallel to edge
const parallelPlacement = new EdgeLabelPreferredPlacement({
  angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW,
  edgeSide: LabelEdgeSides.LEFT_OF_EDGE,
  distanceToEdge: 4
})

// Rotate label by a fixed angle
const rotatedPlacement = new EdgeLabelPreferredPlacement({
  angle: Math.PI * 0.225,
  edgeSide: LabelEdgeSides.LEFT_OF_EDGE
})

// Place label upside down
const upsideDownPlacement = new EdgeLabelPreferredPlacement({ angle: Math.PI })

// Place label parallel to edge but flipped
const upwardsPlacement = new EdgeLabelPreferredPlacement({
  angle: Math.PI,
  angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW,
  placementAlongEdge: LabelAlongEdgePlacements.AT_TARGET,
  edgeSide: LabelEdgeSides.RIGHT_OF_EDGE,
  distanceToEdge: 4
})

// Set up layout data with custom label placements based on the label text
const layoutData = new HierarchicalLayoutData({
  edgeLabelPreferredPlacements: (label) => {
    switch (label.text) {
      case 'Close to Source':
        return closeToSourcePlacement
      case 'Close to Target':
        return closeToTargetPlacement
      case 'Downwards':
        return downwardsPlacement
      case 'Parallel':
        return parallelPlacement
      case 'Rotated':
        return rotatedPlacement
      case 'Upside down':
        return upsideDownPlacement
      case 'Upwards':
        return upwardsPlacement
      default:
        return defaultPlacement
    }
  },
  // Reserve extra space above nodes to avoid label overlap with target arrows
  nodeMargins: new Insets(15, 0, 0, 0)
})

// Use unrestricted FreeEdgeLabelModel for this demo so that labels can rotate freely
graphComponent.graph.edgeDefaults.labels.layoutParameter =
  new FreeEdgeLabelModel().createParameter()
graphComponent.graph.edgeDefaults.labels.style.autoFlip = false

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Apply the configured hierarchical layout
await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), 0, layoutData)
