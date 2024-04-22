/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { BaseClass, INode, INodeSizeConstraintProvider, Rect, Size } from 'yfiles'

/**
 * An {@link INodeSizeConstraintProvider} that prevents shrinking of
 * nodes. Additionally, neither side of the node can become larger than
 * three times its initial size in each resizing operation.
 */
export default class BlueSizeConstraintProvider
  extends BaseClass(INodeSizeConstraintProvider)
  implements INodeSizeConstraintProvider
{
  /**
   * Returns the current node size to prevent the shrinking of nodes.
   * @see Specified by {@link INodeSizeConstraintProvider.getMinimumSize}.
   */
  getMinimumSize(node: INode): Size {
    return node.layout.toSize()
  }

  /**
   * Returns three times the current node size.
   * @see Specified by {@link INodeSizeConstraintProvider.getMaximumSize}.
   */
  getMaximumSize(node: INode): Size {
    return new Size(node.layout.width * 3, node.layout.height * 3)
  }

  /**
   * Returns an empty rectangle since this area is not constraint.
   * @see Specified by {@link INodeSizeConstraintProvider.getMinimumEnclosedArea}.
   */
  getMinimumEnclosedArea(node: INode): Rect {
    return Rect.EMPTY
  }
}
