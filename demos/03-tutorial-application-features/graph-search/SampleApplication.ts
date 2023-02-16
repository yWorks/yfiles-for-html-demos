/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EdgePathLabelModel,
  EdgeSides,
  GraphComponent,
  ICommand,
  IGraph,
  ILabel,
  INode,
  InteriorLabelModel,
  License,
  NodeStyleDecorationInstaller,
  Rect,
  ShapeNodeStyle,
  Size
} from 'yfiles'

import { bindCommand, showApp } from '../../resources/demo-app'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

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
  applyDemoTheme(graphComponent)

  // configure default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph)

  // configure the highlight style for the nodes that match the searched query
  initSearchHighlightingStyle(graphComponent.graph)

  // add a sample graph
  createGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Configures the highlight style that will be used for the nodes that match the searched query.
 * @param graph The graph.
 */
function initSearchHighlightingStyle(graph: IGraph): void {
  const searchHighlightStyle = new NodeStyleDecorationInstaller({
    // we choose a shape node style
    nodeStyle: new ShapeNodeStyle({
      shape: 'round-rectangle',
      stroke: '3px #0B7189',
      fill: 'transparent'
    }),
    // with a margin for the decoration
    margins: 7
  })
  graph.decorator.nodeDecorator.highlightDecorator.setImplementation(searchHighlightStyle)
}

/**
 * Updates the search results by using the given string.
 * @param searchText The text to be queried
 */
function updateSearch(searchText: string): void {
  // we use the search highlight manager to highlight matching items
  const manager = graphComponent.highlightIndicatorManager

  // first remove previous highlights
  manager.clearHighlights()
  if (searchText.trim() !== '') {
    graphComponent.graph.nodes.forEach((node: INode): void => {
      if (matches(node, searchText)) {
        // if the node is a match, highlight it
        manager.addHighlight(node)
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
  return node.labels.some(
    (label: ILabel): boolean => label.text.toLowerCase().indexOf(text.toLowerCase()) !== -1
  )
}

/**
 * Initializes the defaults for the styling in this tutorial.
 *
 * @param graph The graph.
 */
function initTutorialDefaults(graph: IGraph): void {
  // set styles that are the same for all tutorials
  initDemoStyles(graph)

  // set sizes and locations specific for this tutorial
  graph.nodeDefaults.size = new Size(40, 40)

  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent, null)
  // adds the listener to the search box
  ;(document.getElementById('searchBox') as HTMLInputElement).addEventListener(
    'input',
    (e: any): void => {
      updateSearch(e.target.value)
    }
  )
}

/**
 * Creates an initial sample graph.
 * @param graph The graph.
 */
function createGraph(graph: IGraph): void {
  const node1 = graph.createNode({
    layout: new Rect(241, 273, 130, 70),
    labels: ['Hobbies']
  })
  const node2 = graph.createNode({
    layout: new Rect(309, 126, 70, 40),
    labels: ['Games']
  })
  const node3 = graph.createNode({
    layout: new Rect(435, 318, 70, 40),
    labels: ['Sport']
  })
  const node4 = graph.createNode({
    layout: new Rect(249, 451, 70, 40),
    labels: ['Books']
  })
  const node5 = graph.createNode({
    layout: new Rect(116, 323, 70, 40),
    labels: ['Diy']
  })
  const node6 = graph.createNode({
    layout: new Rect(157, 187, 70, 40),
    labels: ['Collecting']
  })
  const node7 = graph.createNode({
    layout: new Rect(232, 579, 70, 40),
    labels: ['Fantasy']
  })
  const node8 = graph.createNode({
    layout: new Rect(343, 530, 70, 40),
    labels: ['Science\nFiction']
  })
  const node9 = graph.createNode({
    layout: new Rect(137, 503, 70, 40),
    labels: ['Thriller']
  })
  const node10 = graph.createNode({
    layout: new Rect(201, 30, 100, 40),
    labels: ['Cops and\nRobbers']
  })
  const node11 = graph.createNode({
    layout: new Rect(422, 85, 90, 40),
    labels: ['The Settlers\nof Catan']
  })
  const node12 = graph.createNode({
    layout: new Rect(341, 0, 70, 40),
    labels: ['Computer']
  })
  const node13 = graph.createNode({
    layout: new Rect(61, 109, 70, 40),
    labels: ['Stamps']
  })
  const node14 = graph.createNode({
    layout: new Rect(463, 435, 70, 40),
    labels: ['Dancing']
  })
  const node15 = graph.createNode({
    layout: new Rect(568, 349, 70, 40),
    labels: ['Climbing']
  })
  const node16 = graph.createNode({
    layout: new Rect(508, 222, 70, 40),
    labels: ['Soccer']
  })
  const node17 = graph.createNode({
    layout: new Rect(654, 442, 70, 40),
    labels: ['Rock']
  })
  const node18 = graph.createNode({
    layout: new Rect(679, 294, 70, 40),
    labels: ['Ice']
  })
  const node19 = graph.createNode({
    layout: new Rect(0, 272, 70, 40),
    labels: ['Planes']
  })
  const node20 = graph.createNode({
    layout: new Rect(16, 403, 70, 40),
    labels: ['Cars']
  })

  graph.createEdge(node1, node2)
  graph.createEdge(node1, node3)
  graph.createEdge(node1, node4)
  graph.createEdge(node1, node5)
  graph.createEdge(node1, node6)
  graph.createEdge(node2, node10)
  graph.createEdge(node2, node11)
  graph.createEdge(node2, node12)
  graph.createEdge(node3, node14)
  graph.createEdge(node3, node15)
  graph.createEdge(node3, node16)
  graph.createEdge(node4, node7)
  graph.createEdge(node4, node8)
  graph.createEdge(node4, node9)
  graph.createEdge(node5, node19)
  graph.createEdge(node5, node20)
  graph.createEdge(node6, node13)
  graph.createEdge(node15, node17)
  graph.createEdge(node15, node18)
}

// noinspection JSIgnoredPromiseFromCall
run()
