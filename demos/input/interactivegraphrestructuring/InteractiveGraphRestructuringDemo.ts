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
import {
  EventRecognizers,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  type IEdge,
  type INode,
  type IPoint,
  type IPositionHandler,
  License,
  NodeStyleIndicatorRenderer,
  Rect,
  RectangleNodeStyle,
  Stroke
} from '@yfiles/yfiles'

import GraphData from './resources/GraphData'
import { SubtreePositionHandler } from './SubtreePositionHandler'
import { Subtree } from './Subtree'
import { createDemoNodeStyle, initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'

let graphComponent: GraphComponent = null!

let subTree: Subtree = null!

async function run(): Promise<void> {
  License.value = licenseData
  graphComponent = new GraphComponent('#graphComponent')
  initDemoStyles(graphComponent.graph, { orthogonalEditing: true })
  graphComponent.graph.nodeDefaults.shareStyleInstance = false

  initializeHighlightDecorator()

  initializeInputMode()

  loadGraph()
}

/**
 * Loads the graph.
 */
function loadGraph(): void {
  let graph = graphComponent.graph
  const graphBuilder = new GraphBuilder(graph)
  graphBuilder.createNodesSource({
    data: GraphData.nodesSource,
    id: 'id',
    parentId: 'parent',
    layout: (data: any) =>
      new Rect(data.x, data.y, graph.nodeDefaults.size.width, graph.nodeDefaults.size.height)
  })
  graphBuilder.createEdgesSource(GraphData.edgesSource, 'source', 'target', 'id')

  graph = graphBuilder.buildGraph()

  // adds the bends
  graph.edges.forEach((edge: IEdge) => {
    edge.tag.bends.forEach((bend: IPoint) => {
      graph.addBend(edge, bend)
    })
  })

  void graphComponent.fitGraphBounds()
}

/**
 * Initializes the input mode.
 */
function initializeInputMode(): void {
  const mode = new GraphEditorInputMode({
    selectableItems: GraphItemTypes.NONE,
    allowCreateBend: false,
    allowCreateEdge: false,
    allowCreateNode: false,
    moveUnselectedItemsInputMode: { enabled: true },
    marqueeSelectionInputMode: { enabled: false },
    moveViewportInputMode: { beginRecognizer: EventRecognizers.MOUSE_DRAG },
    // enable the ItemHoverInputMode and let it handle edges and nodes
    itemHoverInputMode: { enabled: true, hoverItems: GraphItemTypes.NODE }
  })
  graphComponent.inputMode = mode

  // node style that is applied by SubtreePositionHandler while moving subtree nodes
  const movingNodeStyle = createDemoNodeStyle('demo-palette-12')
  movingNodeStyle.stroke = new Stroke(movingNodeStyle.stroke!.fill!, 3.5)

  const graph = graphComponent.graph

  // adds the position handler that will relocate the selected node along with the subtree rooted at it
  graph.decorator.nodes.positionHandler.addWrapperFactory(
    (node: INode | null, handler: IPositionHandler | null) =>
      new SubtreePositionHandler(node, handler, movingNodeStyle)
  )

  const defaultStyle = graph.nodeDefaults.style as RectangleNodeStyle
  const defaultFill = defaultStyle.stroke!.fill!
  // normal and thicker stroke that will be set by the hovered item change listener
  const normalStroke = new Stroke(defaultFill, 1.5).freeze()
  const hoveredThickStroke = new Stroke(defaultFill, 3.5).freeze()

  // handle changes on the hovered items
  mode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    if (subTree !== null) {
      subTree.nodes.forEach((node) => {
        const style = node.style as RectangleNodeStyle
        style.stroke = normalStroke
      })
    }

    const newItem = evt.item as INode
    if (newItem) {
      subTree = new Subtree(graph, newItem)
      subTree.nodes.forEach((node) => {
        const style = node.style as RectangleNodeStyle
        style.stroke = hoveredThickStroke
      })
    }
    graphComponent.invalidate()
  })
}

/**
 * Installs a different highlight decorator visual.
 */
function initializeHighlightDecorator(): void {
  graphComponent.graph.decorator.nodes.highlightRenderer.addConstant(
    new NodeStyleIndicatorRenderer({
      nodeStyle: new RectangleNodeStyle({
        cornerStyle: 'round',
        fill: null,
        stroke: '5px solid #00d8ff'
      }),
      margins: 8
    })
  )
}

run().then(finishLoading)
