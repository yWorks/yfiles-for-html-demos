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
  HighlightIndicatorManager,
  ICanvasObjectInstaller,
  IModelItem,
  INode,
  NodeStyleDecorationInstaller,
  ShapeNodeShape,
  ShapeNodeStyle
} from 'yfiles'

/**
 * A highlight manager responsible for highlighting the nodes based on the information stored in their tag.
 */
export class NodeHighlightManager extends HighlightIndicatorManager {
  /**
   * Gets a suitable highlight installer for the given item or `null` if the given
   * item should not be highlighted.
   * @param {!IModelItem} item The item to find an installer for
   * @returns {?ICanvasObjectInstaller} The highlight installer
   */
  getInstaller(item) {
    if (item instanceof INode) {
      return NodeHighlightManager.getNodeHighlightInstaller(item)
    } else {
      return super.getInstaller(item)
    }
  }

  /**
   * Creates a new highlight installer for the given node.
   * @param {!INode} node the node to be highlighted.
   * @returns {!ICanvasObjectInstaller}
   */
  static getNodeHighlightInstaller(node) {
    return new NodeStyleDecorationInstaller({
      nodeStyle: new ShapeNodeStyle({
        // the tag of each node contains information about the appropriate shape for the highlight
        shape: NodeHighlightManager.getShape(node.tag),
        stroke: '3px #621B00',
        fill: 'transparent'
      }),
      // the margin from the actual node to its highlight visualization
      margins: 4
    })
  }

  /**
   * Determines a suitable highlight shape depending on the given tag data.
   * @param {*} tag the tag of the node to be highlighted.
   * @returns {!ShapeNodeShape}
   */
  static getShape(tag) {
    if (tag === 'ellipse') {
      return ShapeNodeShape.ELLIPSE
    } else if (tag === 'triangle') {
      return ShapeNodeShape.TRIANGLE
    } else {
      return ShapeNodeShape.RECTANGLE
    }
  }
}
