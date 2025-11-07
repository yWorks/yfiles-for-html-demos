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
  type IGraph,
  IPositionHandler,
  License,
  MutableRectangle,
  Rect
} from '@yfiles/yfiles'
import { LimitingRectangleRenderer } from './LimitingRectangleRenderer'
import { GreenPositionHandler } from './GreenPositionHandler'
import { RedPositionHandler } from './RedPositionHandler'
import { OrangePositionHandler } from './OrangePositionHandler'
import type { ColorSetName } from '@yfiles/demo-app/demo-styles'
import { createDemoNodeLabelStyle, createDemoNodeStyle } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'

/**
 * Registers a callback function as decorator that provides a custom
 * {@link IPositionHandler} for each node.
 * This callback function is called whenever a node in the graph is queried
 * for its {@link IPositionHandler}. In this case, the 'node' parameter will be set
 * to that node and the 'delegateHandler' parameter will be set to the
 * position handler that would have been returned without setting this
 * function as decorator.
 * @param graph The given graph
 * @param boundaryRectangle The rectangle that limits the nodes position.
 */
function registerPositionHandler(graph: IGraph, boundaryRectangle: MutableRectangle): void {
  graph.decorator.nodes.positionHandler.addWrapperFactory((node, originalHandler) => {
    // Check if it is a known tag and choose the respective implementation.
    // Fallback to the default behavior otherwise.
    if (node == null || typeof node.tag !== 'string' || originalHandler == null) {
      return originalHandler
    }

    switch (node.tag) {
      case 'orange':
        // This implementation delegates certain behavior to the default implementation
        return new OrangePositionHandler(boundaryRectangle, node, originalHandler)
      case 'red':
        // A simple implementation that prohibits moving
        return new RedPositionHandler()
      case 'blue':
        // Implementation that uses two levels of delegation to create a combined behavior
        return new OrangePositionHandler(
          boundaryRectangle,
          node,
          new GreenPositionHandler(originalHandler)
        )
      case 'green':
        // Another implementation that delegates certain behavior to the default implementation
        return new GreenPositionHandler(originalHandler)
      default:
        return originalHandler
    }
  })
}

async function run(): Promise<void> {
  License.value = licenseData
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  configureUserInteraction(graphComponent)

  // Create the rectangle that limits the movement of some nodes
  // and add it to the graphComponent.
  const boundaryRectangle = new MutableRectangle(20, 20, 480, 400)
  const renderTree = graphComponent.renderTree
  renderTree.createElement(
    renderTree.backgroundGroup,
    boundaryRectangle,
    new LimitingRectangleRenderer()
  )

  registerPositionHandler(graphComponent.graph, boundaryRectangle)

  createSampleGraph(graphComponent.graph)
}

/**
 * Restricts interactive editing to selecting and moving nodes for the given graph component.
 * @param graphComponent The demo's graph component.
 */
function configureUserInteraction(graphComponent: GraphComponent): void {
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
 * @param graph The graph displayed in the demo's graph component.
 */
function createSampleGraph(graph: IGraph): void {
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
 * @param graph The given graph
 * @param x The node's x-coordinate
 * @param y The node's y-coordinate
 * @param w The node's width
 * @param h The node's height
 * @param color The given color set name
 * @param tag The tag to identify the position handler
 * @param labelText The node's label text
 */
function createNode(
  graph: IGraph,
  x: number,
  y: number,
  w: number,
  h: number,
  color: ColorSetName,
  tag: string,
  labelText: string
): void {
  const node = graph.createNode({
    layout: new Rect(x, y, w, h),
    style: createDemoNodeStyle(color),
    tag: tag
  })
  graph.addLabel({ owner: node, text: labelText, style: createDemoNodeLabelStyle(color) })
}

run().then(finishLoading)
