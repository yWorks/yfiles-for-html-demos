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
 * Demonstrates how to run a {@link HierarchicalLayout} with configured constraints.
 */
async function applyHierarchicalLayoutWithConstraints(graphComponent) {
  // Get the nodes for which we want to define constraints
  const node4 = graphComponent.graph.nodes.find((node) => node.tag === 4)
  const node5 = graphComponent.graph.nodes.find((node) => node.tag === 5)

  // Initialize a layout data object to define constraints
  const hierarchicalLayoutData = new HierarchicalLayoutData()

  // Define a sequence constraint: Node 5 must follow Node 4 in the layout order
  hierarchicalLayoutData.sequenceConstraints.placeNodeBeforeNode(node4, node5)

  // Define a layer constraint: Node 4 and 5 must be placed in the same layer
  // Otherwise, HierarchicalLayout normally places nodes so that edges point in the layout direction (top to bottom by default)
  hierarchicalLayoutData.layerConstraints.placeInSameLayer(node4, node5)

  await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), 0, hierarchicalLayoutData)
}

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Run an initial layout with constraints
await applyHierarchicalLayoutWithConstraints(graphComponent)

// Add a button to toggle the constraints on and off
demoApp.toolbar.addToggleButton(
  'Apply Constraints',
  async (pressed) => {
    if (pressed) {
      await applyHierarchicalLayoutWithConstraints(graphComponent)
    } else {
      await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), 0)
    }
  },
  true
)
