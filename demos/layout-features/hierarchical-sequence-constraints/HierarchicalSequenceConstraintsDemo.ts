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
import { type GraphComponent, HierarchicalLayout, HierarchicalLayoutData } from '@yfiles/yfiles'
import graphData from './sample.json'

/**
 * Demonstrates how to run a {@link HierarchicalLayout} with configured sequence constraints.
 */
async function applyHierarchicalLayoutWithSequenceConstraints(graphComponent: GraphComponent) {
  const layoutData = new HierarchicalLayoutData()

  // Assign constraints to place nodes with a certain tag at the start of the sequence
  graphComponent.graph.nodes.forEach((node) => {
    if (node.tag && node.tag === 'leading') {
      layoutData.sequenceConstraints.placeNodeAtHead(node)
    }
  })

  await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), '0s', layoutData)
}

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Run an initial layout with sequence constraints
await applyHierarchicalLayoutWithSequenceConstraints(graphComponent)

// Add a button to toggle the constraints on and off
demoApp.toolbar.addToggleButton(
  'Apply Sequence Constraints',
  async (pressed) => {
    if (pressed) {
      await applyHierarchicalLayoutWithSequenceConstraints(graphComponent)
    } else {
      await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), '0s')
    }
  },
  true
)
