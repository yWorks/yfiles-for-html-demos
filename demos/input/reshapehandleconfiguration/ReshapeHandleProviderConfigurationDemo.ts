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
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HandlePositions,
  IGraph,
  IReshapeHandleProvider,
  IReshapeHandler,
  License,
  MutableRectangle,
  NodeReshapeHandleProvider,
  Rect
} from '@yfiles/yfiles'
import { LimitingRectangleRenderer } from './LimitingRectangleRenderer'
import { PurpleNodeReshapeHandleProvider } from './PurpleNodeReshapeHandleProvider'
import {
  ApplicationState,
  ClickableNodeReshapeHandleProvider
} from './ClickableNodeReshapeHandleProvider'
import type { ColorSetName } from '@yfiles/demo-resources/demo-styles'
import { createDemoNodeLabelStyle, createDemoNodeStyle } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

/**
 * Registers a callback function as a decorator that provides a customized
 * {@link IReshapeHandleProvider} for each node.
 * This callback function is called whenever a node in the graph is queried
 * for its {@link IReshapeHandleProvider}. In this case, the 'node'
 * parameter will be set to that node.
 * @param graph The given graph
 * @param boundaryRectangle The rectangle that limits the node's size.
 */
function registerReshapeHandleProvider(graph: IGraph, boundaryRectangle: Rect): void {
  const nodeDecorator = graph.decorator.nodes

  // deactivate reshape handling for the red node
  nodeDecorator.reshapeHandleProvider.hide((node: any): boolean => node.tag === 'red')

  // return customized reshape handle provider for the orange, blue and green node
  nodeDecorator.reshapeHandleProvider.addFactory(
    (node: any): boolean =>
      node.tag === 'orange' ||
      node.tag === 'blue' ||
      node.tag === 'green' ||
      node.tag === 'purple' ||
      node.tag === 'darkblue' ||
      node.tag === 'gold',
    (node: any): NodeReshapeHandleProvider => {
      // Obtain the tag from the node
      const nodeTag = node.tag

      // Create a default reshape handle provider for nodes
      const reshapeHandler = node.lookup(IReshapeHandler)
      let provider = new NodeReshapeHandleProvider(node, reshapeHandler, HandlePositions.BORDER)

      // Customize the handle provider depending on the node's color
      if (nodeTag === 'orange') {
        // Restrict the node bounds to the boundaryRectangle
        provider.maximumBoundingArea = boundaryRectangle
      } else if (nodeTag === 'green') {
        // Show only handles at the corners and always use aspect ratio resizing
        provider.handlePositions = HandlePositions.CORNERS
        provider.ratioReshapeRecognizer = EventRecognizers.ALWAYS
      } else if (nodeTag === 'blue') {
        // Restrict the node bounds to the boundaryRectangle and
        // show only handles at the corners and always use aspect ratio resizing
        provider.maximumBoundingArea = boundaryRectangle
        provider.handlePositions = HandlePositions.CORNERS
        provider.ratioReshapeRecognizer = EventRecognizers.ALWAYS
      } else if (nodeTag === 'purple') {
        provider = new PurpleNodeReshapeHandleProvider(node, reshapeHandler)
      } else if (nodeTag === 'darkblue') {
        provider.handlePositions = HandlePositions.BOTTOM_RIGHT
        provider.centerReshapeRecognizer = EventRecognizers.ALWAYS
      } else if (nodeTag === 'gold') {
        provider = new ClickableNodeReshapeHandleProvider(node, reshapeHandler, applicationState)
      }
      return provider
    }
  )
}

let applicationState: ApplicationState

async function run(): Promise<void> {
  License.value = await fetchLicense()
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph

  // Create a default editor input mode
  const graphEditorInputMode = new GraphEditorInputMode({
    // Just for user convenience: disable node, edge creation and clipboard operations,
    allowCreateEdge: false,
    allowCreateNode: false,
    allowClipboardOperations: false,
    movableSelectedItems: GraphItemTypes.NONE
  })

  applicationState = new ApplicationState(graphEditorInputMode, graph, true)

  // and enable the undo feature.
  graph.undoEngineEnabled = true

  // Finally, set the input mode to the graph component.
  graphComponent.inputMode = graphEditorInputMode

  // Create the rectangle that limits the movement of some nodes
  // and add it to the graphComponent.
  const boundaryRectangle = new MutableRectangle(20, 20, 480, 550)
  const renderTree = graphComponent.renderTree
  renderTree.createElement(
    renderTree.backgroundGroup,
    boundaryRectangle,
    new LimitingRectangleRenderer()
  )

  registerReshapeHandleProvider(graph, boundaryRectangle.toRect())

  createSampleGraph(graph)
}

/**
 * Creates the sample graph of this demo.
 * @param graph The input graph
 */
function createSampleGraph(graph: IGraph): void {
  createNode(graph, 80, 100, 140, 30, 'demo-red', 'red', 'Fixed size')
  createNode(graph, 300, 100, 140, 30, 'demo-green', 'green', 'Keep aspect ratio')
  createNode(graph, 80, 200, 140, 50, 'demo-blue', 'darkblue', 'Keep center')
  createNode(graph, 300, 200, 140, 50, 'demo-purple', 'purple', 'Keep aspect ratio\nat corners')
  createNode(graph, 80, 310, 140, 30, 'demo-orange', 'orange', 'Limited to rectangle')
  createNode(
    graph,
    300,
    300,
    140,
    50,
    'demo-lightblue',
    'blue',
    'Limited to rectangle\nand keep aspect ratio'
  )
  createNode(
    graph,
    80,
    400,
    140,
    70,
    'demo-palette-510',
    'gold',
    'Keep aspect ratio\ndepending on state:\n keep'
  )

  // clear undo after initial graph loading
  graph.undoEngine!.clear()
}

/**
 * Creates a sample node for this demo.
 * @param graph The given graph
 * @param x The node's x-coordinate
 * @param y The node's y-coordinate
 * @param w The node's width
 * @param h The node's height
 * @param colorSet The color set that defines the node color
 * @param tag The tag to identify the reshape handler
 * @param labelText The nodes label's text
 */
function createNode(
  graph: IGraph,
  x: number,
  y: number,
  w: number,
  h: number,
  colorSet: ColorSetName,
  tag: string,
  labelText: string
): void {
  const node = graph.createNode({
    layout: new Rect(x, y, w, h),
    style: createDemoNodeStyle(colorSet),
    tag: tag
  })

  graph.addLabel({ owner: node, text: labelText, style: createDemoNodeLabelStyle(colorSet) })
}

run().then(finishLoading)
