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
  type GraphComponent,
  HierarchicalLayout,
  HierarchicalLayoutData,
  NodePortCandidates,
  PortSides
} from '@yfiles/yfiles'
import graphData from './sample.json'

/**
 * Demonstrates how to run a {@link HierarchicalLayout} with a configured set of {@link NodePortCandidates}.
 */
async function applyHierarchicalLayoutWithPortCandidates(graphComponent: GraphComponent) {
  // Add a LayoutPortCandidate for each side of the node. Allow only one connection to each candidate
  const nodePortCandidates = new NodePortCandidates()
  nodePortCandidates.addFreeCandidate(PortSides.TOP)
  nodePortCandidates.addFreeCandidate(PortSides.BOTTOM)
  nodePortCandidates.addFreeCandidate(PortSides.RIGHT)
  nodePortCandidates.addFreeCandidate(PortSides.LEFT)

  // Only use the candidate set for the terminal node
  const layoutData = new HierarchicalLayoutData({
    ports: {
      nodePortCandidates: (node) =>
        node.tag && node.tag === 'terminal' ? nodePortCandidates : null
    }
  })

  await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), '0s', layoutData)
}

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Run an initial layout with port candidates
await applyHierarchicalLayoutWithPortCandidates(graphComponent)

// Add a button to toggle the port candidates on and off
demoApp.toolbar.addToggleButton(
  'Use Node Port Candidates',
  async (pressed: boolean) => {
    if (pressed) {
      await applyHierarchicalLayoutWithPortCandidates(graphComponent)
    } else {
      await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), '0s')
    }
  },
  true
)
