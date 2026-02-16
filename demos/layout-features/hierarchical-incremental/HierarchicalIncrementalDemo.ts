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
import { type GraphComponent, HierarchicalLayout, HierarchicalLayoutData } from '@yfiles/yfiles'
import graphData from './sample.json'

/**
 * Demonstrates how to run a {@link HierarchicalLayout} on a predefined subset of nodes and edges.
 */
async function applyIncrementalHierarchicalLayout(graphComponent: GraphComponent) {
  // Configure the layout data to only include nodes with the 'includeInLayout' tag
  const hierarchicalLayoutData = new HierarchicalLayoutData({
    incrementalNodes: (node) => node.tag && node.tag === 'includeInLayout'
  })

  // Create a hierarchical layout with fromSketchMode enabled
  const hierarchicalLayout = new HierarchicalLayout({ fromSketchMode: true })

  await graphComponent.applyLayoutAnimated(hierarchicalLayout, '500ms', hierarchicalLayoutData)
}

// Build the graph from the JSON data
demoApp.buildGraphFromJson(graphData)
await graphComponent.fitGraphBounds()

// Add a button to run the incremental layout
demoApp.toolbar.addButton('Run Incremental Layout', async () => {
  await applyIncrementalHierarchicalLayout(graphComponent)
})
