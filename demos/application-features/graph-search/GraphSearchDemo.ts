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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GraphBuilder,
  GraphComponent,
  IGraph,
  INode,
  InteriorNodeLabelModel,
  LayoutExecutor,
  License,
  NodeStyleIndicatorRenderer,
  RadialLayout,
  Rect,
  ShapeNodeStyle,
  Size
} from '@yfiles/yfiles'

import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import type { JSONGraph } from '@yfiles/demo-utils/json-model'
import graphData from './graph-data.json'

/**
 * Application Features - Graph Search
 *
 * This demo shows an implementation of the search functionality on the nodes of a graph.
 */
let graphComponent: GraphComponent

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  // configure default styles for newly created graph elements
  initializeGraph(graphComponent.graph)

  // configure the highlight style for the nodes that match the searched query
  initSearchHighlightingStyle(graphComponent)

  // then build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(new RadialLayout())
  graphComponent.fitGraphBounds()

  // bind the buttons to their functionality
  initializeUI()
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  const nodesSource = graphBuilder.createNodesSource(graphData.nodeList, (item) => item.id)
  nodesSource.nodeCreator.layoutProvider = (item) =>
    item.label === 'Hobbies' ? new Rect(0, 0, 130, 70) : new Rect(0, 0, 80, 40)
  nodesSource.nodeCreator.createLabelBinding((data) => data.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Configures the highlight style that will be used for the nodes that match the searched query.
 * @param graphComponent The component containing the graph.
 */
function initSearchHighlightingStyle(graphComponent: GraphComponent): void {
  const searchHighlightStyle = new NodeStyleIndicatorRenderer({
    // we choose a shape node style
    nodeStyle: new ShapeNodeStyle({
      shape: 'round-rectangle',
      stroke: '3px #0B7189',
      fill: 'transparent'
    }),
    // with a margin for the decoration
    margins: 7
  })
  graphComponent.graph.decorator.nodes.highlightRenderer.addConstant(searchHighlightStyle)
}

/**
 * Updates the search results by using the given string.
 * @param searchText The text to be queried
 */
function updateSearch(searchText: string): void {
  // we use the search highlight manager to highlight matching items
  const highlights = graphComponent.highlights

  // first remove previous highlights
  highlights.clear()
  if (searchText.trim() !== '') {
    graphComponent.graph.nodes.forEach((node) => {
      if (matches(node, searchText)) {
        // if the node is a match, highlight it
        highlights.add(node)
      }
    })
  }
}

/**
 * Returns whether the given node is a match when searching for the given text in the label of the node.
 * @param node The node to be examined
 * @param text The text to be queried
 * @returns True if the node matches the text, false otherwise
 */
function matches(node: INode, text: string): boolean {
  return node.labels.some((label) => label.text.toLowerCase().includes(text.toLowerCase()))
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph: IGraph): void {
  // set styles for this demo
  initDemoStyles(graph)

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(80, 40)
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.labels.layoutParameter = InteriorNodeLabelModel.CENTER
}

/**
 * Binds actions to the buttons in the tutorial's toolbar.
 */
function initializeUI(): void {
  // adds the listener to the search box
  document
    .querySelector<HTMLInputElement>('#searchBox')!
    .addEventListener('input', (e: any): void => {
      updateSearch(e.target.value)
    })
}

run().then(finishLoading)
