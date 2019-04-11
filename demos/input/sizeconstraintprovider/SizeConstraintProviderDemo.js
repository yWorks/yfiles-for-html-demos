/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultLabelStyle,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  IGraph,
  License,
  MutableRectangle,
  NodeSizeConstraintProvider,
  Rect,
  Size,
  YString
} from 'yfiles'

import { DemoNodeStyle } from '../../resources/demo-styles.js'
import { showApp } from '../../resources/demo-app.js'
import LimitedRectangleDescriptor from './LimitedRectangleDescriptor.js'
import GreenSizeConstraintProvider from './GreenSizeConstraintProvider.js'
import BlueSizeConstraintProvider from './BlueSizeConstraintProvider.js'
import loadJson from '../../resources/load-json.js'
/**
 * Registers a callback function as decorator that provides a custom
 * {@link INodeSizeConstraintProvider} for each node.
 * This callback function is called whenever a node in the graph is queried
 * for its <code>ISizeConstraintProvider</code>. In this case, the 'node' parameter will be set
 * to that node.
 * @param {IGraph} graph The given graph
 * @param {MutableRectangle} boundaryRectangle The rectangle that limits the node's size.
 * @return {INodeSizeConstraintProvider}
 */
function registerSizeConstraintProvider(graph, boundaryRectangle) {
  // One shared instance that will be used by all blue nodes
  const blueSizeConstraintProvider = new BlueSizeConstraintProvider()

  const nodeDecorator = graph.decorator.nodeDecorator
  nodeDecorator.sizeConstraintProviderDecorator.setFactory(node => {
    // Obtain the tag from the node
    const nodeTag = node.tag

    // Check if it is a known tag and choose the respective implementation.
    // Fallback to the default behavior otherwise.
    if (!YString.isInstance(nodeTag)) {
      return null
    } else if (nodeTag === 'royalblue') {
      return blueSizeConstraintProvider
    } else if (nodeTag === 'green') {
      return new GreenSizeConstraintProvider()
    } else if (nodeTag === 'orange') {
      return new NodeSizeConstraintProvider(new Size(50, 50), new Size(300, 300), boundaryRectangle)
    }
    return null
  })
}

function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph

  // Create a default editor input mode
  const graphEditorInputMode = new GraphEditorInputMode({
    // Just for user convenience: disable node, edge creation and clipboard operations,
    allowCreateEdge: false,
    allowCreateNode: false,
    allowClipboardOperations: false, // don't allow moving nodes,
    movableItems: GraphItemTypes.NONE
  })
  // and enable the undo feature.
  graph.undoEngineEnabled = true

  // Finally, set the input mode to the graph component.
  graphComponent.inputMode = graphEditorInputMode

  // Create the rectangle that limits the movement of some nodes
  // and add it to the graphComponent.
  const boundaryRectangle = new MutableRectangle(210, 350, 30, 30)
  graphComponent.highlightGroup.addChild(boundaryRectangle, new LimitedRectangleDescriptor())

  // let boundaryRectangle = new MutableRectangle(20, 20, 480, 400);
  // graphComponent.backgroundGroup.addChild(boundaryRectangle, new LimitingRectangleDescriptor());

  registerSizeConstraintProvider(graph, boundaryRectangle)

  createSampleGraph(graph)

  showApp(graphComponent)
}

/**
 * Creates the sample graph of this demo.
 * @param {IGraph} graph The input graph
 */
function createSampleGraph(graph) {
  createNode(graph, 100, 100, 100, 60, 'royalblue', 'whitesmoke', 'Never Shrink\n(Max 3x)')
  createNode(graph, 300, 100, 160, 30, 'royalblue', 'whitesmoke', 'Never Shrink (Max 3x)')
  createNode(graph, 100, 215, 100, 30, 'green', 'whitesmoke', 'Enclose Label')
  createNode(graph, 300, 200, 140, 80, 'green', 'whitesmoke', 'Enclose Label,\nEven Large Ones')
  createNode(graph, 200, 340, 140, 140, 'orange', 'black', 'Encompass Rectangle,\nMin and Max Size')

  // clear undo after initial graph loading
  graph.undoEngine.clear()
}

/**
 * Creates a sample node for this demo.
 * @param {IGraph} graph The given graph
 * @param {number} x The node's x-coordinate
 * @param {number} y The node's y-coordinate
 * @param {number} w The node's width
 * @param {number} h The node's height
 * @param {string} cssClass The given css class
 * @param {string} textColor The color of the text
 * @param {string} labelText The nodes label's text
 */
function createNode(graph, x, y, w, h, cssClass, textColor, labelText) {
  const textLabelStyle = new DefaultLabelStyle({
    textFill: textColor
  })

  const nodeStyle = new DemoNodeStyle()
  nodeStyle.cssClass = cssClass

  const node = graph.createNode(new Rect(x, y, w, h), nodeStyle, cssClass)
  graph.addLabel({
    owner: node,
    text: labelText,
    style: textLabelStyle
  })
}

loadJson().then(run)
