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
import { HierarchicalLayout, HierarchicalLayoutData } from '@yfiles/yfiles'
import graphData from './sample.json'

/**
 * Demonstrates how to run a {@link HierarchicalLayout} with configured layer constraints.
 */
async function applyHierarchicalLayoutWithLayerConstraints(graphComponent) {
  // Get the nodes for which we want to define layer constraints
  const node0 = graphComponent.graph.nodes.find((node) => node.tag === 0)
  const node2 = graphComponent.graph.nodes.find((node) => node.tag === 2)
  const node7 = graphComponent.graph.nodes.find((node) => node.tag === 7)
  const node9 = graphComponent.graph.nodes.find((node) => node.tag === 9)

  const layoutData = new HierarchicalLayoutData()
  // Place node9 in the topmost layer
  layoutData.layerConstraints.placeAtTop(node9)
  // Place node7 in the bottommost layer
  layoutData.layerConstraints.placeAtBottom(node7)
  // Place node0 at least one layer below node9
  layoutData.layerConstraints.placeInOrder(node9, node0)
  // Place node2 in the same layer as node0
  layoutData.layerConstraints.placeInSameLayer(node0, node2)

  await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), 0, layoutData)
}

// Build the graph from the JSON data
demoApp.buildGraphFromJson(graphData)

// Run an initial layout with layer constraints
await applyHierarchicalLayoutWithLayerConstraints(graphComponent)

// Add a button to toggle the constraints on and off
demoApp.toolbar.addToggleButton(
  'Apply Layer Constraints',
  async (pressed) => {
    if (pressed) {
      await applyHierarchicalLayoutWithLayerConstraints(graphComponent)
    } else {
      await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), 0)
    }
  },
  true
)
