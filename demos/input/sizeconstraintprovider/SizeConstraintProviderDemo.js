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
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  IGraph,
  INodeSizeConstraintProvider,
  License,
  MutableRectangle,
  NodeSizeConstraintProvider,
  Rect,
  Size
} from '@yfiles/yfiles'

import { LimitingRectangleRenderer } from './LimitingRectangleRenderer'
import { GreenSizeConstraintProvider } from './GreenSizeConstraintProvider'
import { BlueSizeConstraintProvider } from './BlueSizeConstraintProvider'
import { createDemoNodeLabelStyle, createDemoNodeStyle } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

/**
 * Registers a callback function as decorator that provides a custom
 * {@link INodeSizeConstraintProvider} for each node.
 * This callback function is called whenever a node in the graph is queried
 * for its {@link INodeSizeConstraintProvider}. In this case, the 'node' parameter will be set
 * to that node.
 * @param graph The given graph
 * @param boundaryRectangle The rectangle that limits the node's size.
 */
function registerSizeConstraintProvider(graph, boundaryRectangle) {
  const nodeDecorator = graph.decorator.nodes
  nodeDecorator.sizeConstraintProvider.addFactory((node) => {
    // obtain the tag from the node
    const nodeTag = node.tag
    // Check if it is a known tag and choose the respective implementation.
    // Fallback to the default behavior otherwise.
    if (nodeTag === 'blue') {
      return new BlueSizeConstraintProvider(node)
    } else if (nodeTag === 'green') {
      return new GreenSizeConstraintProvider(node)
    } else if (nodeTag === 'orange') {
      return new NodeSizeConstraintProvider(new Size(50, 50), new Size(300, 300), boundaryRectangle)
    }
    return null
  })
}

async function run() {
  License.value = await fetchLicense()
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  // create a default editor input mode
  graphComponent.inputMode = new GraphEditorInputMode({
    // just for user convenience: disable node, edge creation and clipboard operations,
    allowCreateEdge: false,
    allowCreateNode: false,
    allowClipboardOperations: false,
    movableSelectedItems: GraphItemTypes.NONE
  })

  // Create the rectangle that limits the movement of some nodes
  // and add it to the graphComponent.
  const boundaryRectangle = new MutableRectangle(210, 350, 30, 30)
  graphComponent.renderTree.createElement(
    graphComponent.renderTree.highlightGroup,
    boundaryRectangle,
    new LimitingRectangleRenderer()
  )

  const graph = graphComponent.graph

  // register size constraint providers that are the main subject of this demo
  registerSizeConstraintProvider(graph, boundaryRectangle)

  createSampleGraph(graph)

  // enable undo and redo
  graph.undoEngineEnabled = true
}

/**
 * Creates the demo's sample graph.
 * @param graph The graph to populate
 */
function createSampleGraph(graph) {
  createNode(graph, 100, 100, 100, 60, 'demo-lightblue', 'blue', 'Never Shrink\n(Max 3x)')
  createNode(graph, 300, 100, 160, 30, 'demo-lightblue', 'blue', 'Never Shrink (Max 3x)')
  createNode(graph, 100, 215, 100, 30, 'demo-green', 'green', 'Enclose Label')
  createNode(graph, 300, 200, 140, 80, 'demo-green', 'green', 'Enclose Label,\nEven Large Ones')
  createNode(
    graph,
    200,
    340,
    140,
    140,
    'demo-orange',
    'orange',
    'Encompass Rectangle,\nMin and Max Size'
  )
}

/**
 * Creates a sample node for this demo.
 * @param graph The given graph
 * @param x The node's x-coordinate
 * @param y The node's y-coordinate
 * @param w The node's width
 * @param h The node's height
 * @param colorSet The color set to use for the new node and its label
 * @param tag The tag to identify the size constraint provider
 * @param labelText The nodes label's text
 */
function createNode(graph, x, y, w, h, colorSet, tag, labelText) {
  const node = graph.createNode({
    layout: new Rect(x, y, w, h),
    style: createDemoNodeStyle(colorSet),
    tag: tag
  })

  graph.addLabel({ owner: node, text: labelText, style: createDemoNodeLabelStyle(colorSet) })
}

run().then(finishLoading)
