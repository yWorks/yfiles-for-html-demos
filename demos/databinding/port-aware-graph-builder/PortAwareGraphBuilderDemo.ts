/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import type { GraphBuilderItemEventArgs, INode } from 'yfiles'
import {
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  HierarchicLayout,
  LayoutExecutor,
  LayoutOrientation,
  License
} from 'yfiles'

import { createPortAwareGraphBuilder, setBuilderData } from './GraphBuilder'
import GraphBuilderData from './graph-builder-data'
import { fetchLicense } from 'demo-resources/fetch-license'
import { hideNodesAndRelatedItems, showNodesAndRelatedItems } from './GraphItemsHider'
import { finishLoading } from 'demo-resources/demo-page'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/**
 * This demo shows how to automatically build a graph from business data using
 * a customized GraphBuilder which creates node ports based on the node type and
 * connects the edges to those ports.
 *
 * It also uses GraphBuilder's updateGraph method to modify the existing graph
 * to reflect changes in the business data.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // Initialize graph component
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // We want to keep the unused ports
  graphComponent.graph.nodeDefaults.ports.autoCleanUp = false

  // Use the viewer input mode since this demo should not allow interactive graph editing
  graphComponent.inputMode = new GraphViewerInputMode()

  // Build the graph from data
  builder = createPortAwareGraphBuilder(
    graphComponent.graph,
    GraphBuilderData.gates as any[],
    GraphBuilderData.connections
  )
  builder.buildGraph()

  // Center the graph in the visible area
  graphComponent.fitGraphBounds()

  // Arrange the graph using a tree layout algorithm
  await arrangeGraph(graphComponent)

  // Register toolbar actions
  initializeUI(graphComponent)
}

let builder: GraphBuilder

/**
 * Updates the graph. This reflects changes in the business data while keeping the unchanged items.
 * This function uses GraphBuilder's updateGraph method to modify the existing graph
 * instead of building it anew.
 */
async function updateGraph(
  graphComponent: GraphComponent,
  nodesSource: any[],
  edgesSource: any[]
): Promise<void> {
  const graph = graphComponent.graph

  // determine which nodes were added while updating the graph
  const newNodes: INode[] = []
  const nodeCreatedListener = (_: GraphBuilder, evt: GraphBuilderItemEventArgs<INode, any>) =>
    newNodes.push(evt.item)
  builder.addNodeCreatedListener(nodeCreatedListener)

  // update the graph according the new (but related) data
  // this will remove nodes whose IDs are not in the new data set
  // this will add nodes whose IDs are in the new data set, but not in the old one
  setBuilderData(nodesSource, edgesSource)
  builder.updateGraph()

  builder.removeNodeCreatedListener(nodeCreatedListener)

  // hide the new items (i.e. the new nodes, the edges connected to the new nodes, their labels
  // and their ports) during the animated layout calculation
  hideNodesAndRelatedItems(graph, newNodes)

  await arrangeGraph(graphComponent)

  // after the layout animation has finished, show the previously hidden items
  // this way new items do not seem to be affected by the layout calculation
  // otherwise, new items would appear at the default location (0,0) and then move to their
  // final location during the layout animation
  showNodesAndRelatedItems(graph, newNodes)
}

/**
 * Arranges the graph of the given graph component and applies the new layout in an animated
 * fashion.
 */
function arrangeGraph(graphComponent: GraphComponent): Promise<void> {
  document.querySelector<HTMLButtonElement>('#update-builder')!.disabled = true

  const algorithm = new HierarchicLayout({
    layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT,
    orthogonalRouting: true
  })

  // arrange the graph with the chosen layout algorithm
  return new LayoutExecutor({
    graphComponent: graphComponent,
    graph: graphComponent.graph,
    layout: algorithm,
    fixPorts: true,
    animateViewport: true,
    duration: '0.5s'
  })
    .start()
    .finally(() => {
      document.querySelector<HTMLButtonElement>('#update-builder')!.disabled = false
    })
}

/**
 * Registers the actions for the toolbar buttons during the creation of this application.
 */
function initializeUI(graphComponent: GraphComponent): void {
  let index = 0
  document.querySelector('#update-builder')!.addEventListener('click', async () => {
    // build graph from new data
    const update = ++index % 2 === 1
    const nodeData = update ? GraphBuilderData.updateGates : GraphBuilderData.gates
    const edgeData = update ? GraphBuilderData.updateConnections : GraphBuilderData.connections
    await updateGraph(graphComponent, nodeData, edgeData)
  })
}

run().then(finishLoading)
