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
  type IEdge,
  LayoutOrientation,
  SingleLayerSubtreePlacer,
  TreeLayout,
  TreeLayoutData,
  TreeLayoutPortAssigner,
  TreeLayoutPortAssignmentMode
} from '@yfiles/yfiles'
import graphData from './sample.json'

// Initialize the tree layout algorithm
const treeLayout = new TreeLayout({
  // Set the orientation to left-to-right (horizontal flow)
  layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT,
  // Configure the single layer subtree placer
  defaultSubtreePlacer: new SingleLayerSubtreePlacer({
    // Increase the distances between elements vertically and horizontally
    verticalDistance: 30,
    horizontalDistance: 30,
    // Increase the minimum length of the first and last edge segment
    minimumFirstSegmentLength: 30,
    minimumLastSegmentLength: 30,
    // Set alignment for nodes within a layer, useful for varying node sizes (1 = right-aligned)
    verticalAlignment: 1,
    // Increase the spacing between orthogonally routed edge segments
    minimumChannelSegmentDistance: 6
  }),
  // Distribute the ports evenly on the side of nodes
  defaultPortAssigner: new TreeLayoutPortAssigner({
    mode: TreeLayoutPortAssignmentMode.DISTRIBUTED
  })
})

// Use layout data object to specify item-individual settings
const treeLayoutData = new TreeLayoutData({
  childOrder: {
    // Sort out-edges by the label text (if any) of their target nodes
    outEdgeComparators: () => (edge1: IEdge, edge2: IEdge) => {
      const targetLabel1 = edge1.targetNode.labels.at(0)
      const targetLabel2 = edge2.targetNode.labels.at(0)
      if (targetLabel1 && targetLabel2) {
        return targetLabel1.text.localeCompare(targetLabel2.text)
      }
      return 0
    }
  }
})

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Apply the configured tree layout
void graphComponent.applyLayoutAnimated(treeLayout, 0, treeLayoutData)
