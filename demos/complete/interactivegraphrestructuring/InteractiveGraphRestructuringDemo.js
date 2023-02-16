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
import {
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IEdge,
  INode,
  IPoint,
  IPositionHandler,
  License,
  MouseEventRecognizers,
  NodeStyleDecorationInstaller,
  Point,
  Rect,
  RectangleNodeStyle,
  Stroke
} from 'yfiles'

import { bindCommand, showApp } from '../../resources/demo-app.js'
import GraphData from './resources/GraphData.js'
import SubtreePositionHandler from './SubtreePositionHandler.js'
import Subtree from './Subtree.js'
import { createDemoNodeStyle, initDemoStyles } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/** @type {GraphComponent} */
let graphComponent = null

/** @type {Subtree} */
let subTree = null

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')

  initDemoStyles(graphComponent.graph)
  graphComponent.graph.nodeDefaults.shareStyleInstance = false

  initializeHighlightDecorator()

  initializeInputMode()

  loadGraph()

  registerCommands()

  showApp(graphComponent)
}

/**
 * Loads the graph.
 */
function loadGraph() {
  let graph = graphComponent.graph
  const graphBuilder = new GraphBuilder(graph)
  graphBuilder.createNodesSource({
    data: GraphData.nodesSource,
    id: 'id',
    parentId: 'parent',
    layout: data =>
      new Rect(data.x, data.y, graph.nodeDefaults.size.width, graph.nodeDefaults.size.height)
  })
  graphBuilder.createEdgesSource(GraphData.edgesSource, 'source', 'target', 'id')

  graph = graphBuilder.buildGraph()

  // adds the bends
  graph.edges.forEach(edge => {
    edge.tag.bends.forEach(bend => {
      graph.addBend(edge, Point.from(bend))
    })
  })

  graphComponent.fitGraphBounds()
}

/**
 * Initializes the input mode.
 */
function initializeInputMode() {
  const mode = new GraphEditorInputMode({
    movableItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NONE,
    allowCreateBend: false,
    allowCreateNode: false
  })
  mode.moveUnselectedInputMode.enabled = true
  mode.marqueeSelectionInputMode.enabled = false
  mode.moveViewportInputMode.pressedRecognizer = MouseEventRecognizers.LEFT_DRAG
  graphComponent.inputMode = mode

  // node style that is applied by SubtreePositionHandler while moving subtree nodes
  const movingNodeStyle = createDemoNodeStyle('demo-palette-12')
  movingNodeStyle.stroke = new Stroke(movingNodeStyle.stroke.fill, 3.5)

  const graph = graphComponent.graph

  // adds the position handler that will relocate the selected node along with the subtree rooted at it
  graph.decorator.nodeDecorator.positionHandlerDecorator.setImplementationWrapper(
    (node, handler) => new SubtreePositionHandler(node, handler, movingNodeStyle)
  )

  const defaultStyle = graph.nodeDefaults.style
  const defaultFill = defaultStyle.stroke.fill
  // normal and thicker stroke that will be set by the hovered item change listener
  const normalStroke = new Stroke(defaultFill, 1.5).freeze()
  const hoveredThickStroke = new Stroke(defaultFill, 3.5).freeze()

  // enable the ItemHoverInputMode and let it handle edges and nodes
  mode.itemHoverInputMode.enabled = true
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  // ignore items of other types which might be in front of them
  mode.itemHoverInputMode.discardInvalidItems = false
  // handle changes on the hovered items
  mode.itemHoverInputMode.addHoveredItemChangedListener((sender, args) => {
    if (subTree !== null) {
      subTree.nodes.forEach(node => {
        const style = node.style
        style.stroke = normalStroke
      })
    }

    const newItem = args.item
    if (newItem) {
      subTree = new Subtree(graph, newItem)
      subTree.nodes.forEach(node => {
        const style = node.style
        style.stroke = hoveredThickStroke
      })
    }
    graphComponent.invalidate()
  })
}

/**
 * Installs a different highlight decorator visual.
 */
function initializeHighlightDecorator() {
  graphComponent.graph.decorator.nodeDecorator.highlightDecorator.setImplementation(
    new NodeStyleDecorationInstaller({
      nodeStyle: new RectangleNodeStyle({
        cornerStyle: 'round',
        fill: null,
        stroke: '5px solid #00d8ff'
      }),
      margins: 8
    })
  )
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// noinspection JSIgnoredPromiseFromCall
run()
