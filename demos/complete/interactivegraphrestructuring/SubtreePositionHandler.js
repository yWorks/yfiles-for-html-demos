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
  BaseClass,
  GraphComponent,
  IEdge,
  IGraph,
  IInputModeContext,
  INode,
  INodeStyle,
  IPoint,
  IPositionHandler,
  List,
  Point
} from 'yfiles'
import Subtree from './Subtree.js'
import RelocateSubtreeLayoutHelper from './RelocateSubtreeLayoutHelper.js'

/**
 * An {@link IPositionHandler} that moves a node and its subtree.
 */
export default class SubtreePositionHandler extends BaseClass(IPositionHandler) {
  /**
   * Creates a new instance of a SubtreePositionHandler.
   * @param {?INode} node The selected node
   * @param {?IPositionHandler} nodePositionHandler The original position handler
   * @param {!INodeStyle} movingNodeStyle The node style that is set while the node is moving
   */
  constructor(node, nodePositionHandler, movingNodeStyle) {
    super()
    this.movingNodeStyle = movingNodeStyle
    this.nodePositionHandler = nodePositionHandler
    this.node = node
    this.node2NormalStyle = new Map()
  }

  /**
   * Returns the location of the selected node.
   * @type {!IPoint}
   */
  get location() {
    return this.nodePositionHandler.location
  }

  /**
   * The subtree is upon to be dragged.
   * @param {!IInputModeContext} context The context to retrieve information about the drag from
   */
  initializeDrag(context) {
    this.subtree = new Subtree(context.graph, this.node)

    this.subtree.nodes.forEach(node => {
      // store normal style of the node and set the moving node style while dragging
      this.node2NormalStyle.set(node, node.style)
      context.graph.setStyle(node, this.movingNodeStyle)
    })

    this.layoutHelper = new RelocateSubtreeLayoutHelper(context.canvasComponent, this.subtree)
    this.layoutHelper.initializeLayout()

    this.compositeHandler = SubtreePositionHandler.createCompositeHandler(this.subtree)
    this.compositeHandler.initializeDrag(context)
  }

  /**
   * The subtree is dragged.
   * @param {!IInputModeContext} context The context to retrieve information about the drag from
   * @param {!Point} originalLocation The value of the location property at the time of initializeDrag
   * @param {!Point} newLocation The coordinates in the world coordinate system that the client wants the handle to be at
   */
  handleMove(context, originalLocation, newLocation) {
    this.compositeHandler.handleMove(context, originalLocation, newLocation)
    this.layoutHelper.runLayout()
  }

  /**
   * The drag is canceled.
   * @param {!IInputModeContext} context The context to retrieve information about the drag from
   * @param {!Point} originalLocation The value of the coordinate of the location property at the time of initializeDrag
   */
  cancelDrag(context, originalLocation) {
    this.compositeHandler.cancelDrag(context, originalLocation)
    this.layoutHelper.cancelLayout()
    this.resetStyles(context.graph)
  }

  /**
   * The drag is finished.
   * @param {!IInputModeContext} context The context to retrieve information about the drag from
   * @param {!Point} originalLocation The value of the location property at the time of initializeDrag
   * @param {!Point} newLocation The coordinates in the world coordinate system that the client wants the handle to be at
   */
  dragFinished(context, originalLocation, newLocation) {
    this.compositeHandler.dragFinished(context, originalLocation, newLocation)
    this.layoutHelper.stopLayout()
    this.resetStyles(context.graph)
  }

  /**
   * Replaces the temporary styles used while moving nodes with the original styles.
   * @param {!IGraph} graph
   */
  resetStyles(graph) {
    const nodeToStyle = this.node2NormalStyle
    this.subtree.nodes.forEach(node => {
      if (nodeToStyle.has(node)) {
        // reset style to the normal node style of this node
        const style = nodeToStyle.get(node)
        graph.setStyle(node, style)
      }
    })
    nodeToStyle.clear()
  }

  /**
   * Creates an {@link IPositionHandler} that moves the whole subtree.
   * @param {!Subtree} subtree The nodes and edges of the subtree
   * @returns {!IPositionHandler} An {@link IPositionHandler} that moves the whole subtree
   */
  static createCompositeHandler(subtree) {
    const positionHandlers = new List()
    subtree.nodes.forEach(node => {
      const positionHandler = node.lookup(IPositionHandler.$class)
      if (positionHandler) {
        const subtreeHandler = positionHandler
        positionHandlers.add(subtreeHandler ? subtreeHandler.nodePositionHandler : positionHandler)
      }
    })

    subtree.edges.forEach(edge => {
      const positionHandler = edge.lookup(IPositionHandler.$class)
      if (positionHandler) {
        positionHandlers.add(positionHandler)
      }
    })
    return IPositionHandler.combine(positionHandlers)
  }
}
