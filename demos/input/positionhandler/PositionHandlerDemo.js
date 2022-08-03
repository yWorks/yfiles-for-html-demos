/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IPositionHandler,
  License,
  MutableRectangle,
  Rect
} from 'yfiles'
import { showApp } from '../../resources/demo-app.js'
import LimitingRectangleDescriptor from './LimitedRectangleDescriptor.js'
import GreenPositionHandler from './GreenPositionHandler.js'
import RedPositionHandler from './RedPositionHandler.js'
import OrangePositionHandler from './OrangePositionHandler.js'
import {
  applyDemoTheme,
  createDemoNodeLabelStyle,
  createDemoNodeStyle
} from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/**
 * Registers a callback function as decorator that provides a custom
 * {@link IPositionHandler} for each node.
 * This callback function is called whenever a node in the graph is queried
 * for its {@link IPositionHandler}. In this case, the 'node' parameter will be set
 * to that node and the 'delegateHandler' parameter will be set to the
 * position handler that would have been returned without setting this
 * function as decorator.
 * @param {!IGraph} graph The given graph
 * @param {!MutableRectangle} boundaryRectangle The rectangle that limits the nodes position.
 */
function registerPositionHandler(graph, boundaryRectangle) {
  const positionHandlerDecorator = graph.decorator.nodeDecorator.positionHandlerDecorator
  positionHandlerDecorator.setImplementationWrapper((node, delegateHandler) => {
    if (!delegateHandler) {
      return null
    }

    // Check if it is a known tag and choose the respective implementation.
    // Fallback to the default behavior otherwise.
    if (node == null || typeof node.tag !== 'string') {
      return delegateHandler
    }

    switch (node.tag) {
      case 'orange':
        // This implementation delegates certain behavior to the default implementation
        return new OrangePositionHandler(boundaryRectangle, node, delegateHandler)
      case 'red':
        // A simple implementation that prohibits moving
        return new RedPositionHandler()
      case 'blue':
        // Implementation that uses two levels of delegation to create a combined behavior
        return new OrangePositionHandler(
          boundaryRectangle,
          node,
          new GreenPositionHandler(delegateHandler)
        )
      case 'green':
        // Another implementation that delegates certain behavior to the default implementation
        return new GreenPositionHandler(delegateHandler)
      default:
        return delegateHandler
    }
  })
}

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  configureUserInteraction(graphComponent)

  // Create the rectangle that limits the movement of some nodes
  // and add it to the graphComponent.
  const boundaryRectangle = new MutableRectangle(20, 20, 480, 400)
  graphComponent.backgroundGroup.addChild(boundaryRectangle, new LimitingRectangleDescriptor())

  registerPositionHandler(graphComponent.graph, boundaryRectangle)

  createSampleGraph(graphComponent.graph)

  showApp(graphComponent)
}

/**
 * Restricits interactive editing to selecting and moving nodes for the given graph component.
 * @param {!GraphComponent} graphComponent The demo's graph component.
 */
function configureUserInteraction(graphComponent) {
  // Create a default editor input mode
  const graphEditorInputMode = new GraphEditorInputMode()

  // Just for user convenience: disable node, edge creation and clipboard operations,
  graphEditorInputMode.allowCreateEdge = false
  graphEditorInputMode.allowCreateNode = false
  graphEditorInputMode.allowClipboardOperations = false
  // don't show resize handles,
  graphEditorInputMode.showHandleItems = GraphItemTypes.NONE

  // Finally, set the input mode to the graph component.
  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Creates the sample graph for this demo.
 * @param {!IGraph} graph The graph displayed in the demo's graph component.
 */
function createSampleGraph(graph) {
  createNode(graph, 100, 100, 100, 30, 'demo-red', 'red', 'Unmovable')
  createNode(graph, 300, 100, 100, 30, 'demo-green', 'green', 'One Axis')
  createNode(graph, 80, 250, 140, 40, 'demo-orange', 'orange', 'Limited to Rectangle')
  createNode(
    graph,
    280,
    250,
    140,
    40,
    'demo-lightblue',
    'blue',
    'Limited to Rectangle\nand One Axis'
  )
}

/**
 * Creates a sample node for this demo.
 * @param {!IGraph} graph The given graph
 * @param {number} x The node's x-coordinate
 * @param {number} y The node's y-coordinate
 * @param {number} w The node's width
 * @param {number} h The node's height
 * @param {!ColorSetName} color The given color set name
 * @param {!string} tag The tag to identify the position handler
 * @param {!string} labelText The node's label text
 */
function createNode(graph, x, y, w, h, color, tag, labelText) {
  const node = graph.createNode({
    layout: new Rect(x, y, w, h),
    style: createDemoNodeStyle(color),
    tag: tag
  })
  graph.addLabel({
    owner: node,
    text: labelText,
    style: createDemoNodeLabelStyle(color)
  })
}

// noinspection JSIgnoredPromiseFromCall
run()
