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
  BaseClass,
  IGraph,
  IGroupBoundsCalculator,
  IGroupPaddingProvider,
  INode,
  Insets,
  Rect
} from '@yfiles/yfiles'
import { RotatableNodeStyleDecorator } from './RotatableNodes'

/**
 * Calculates group bounds taking the rotated layout for nodes which
 * {@link RotatableNodeStyleDecorator support rotation}.
 */
export class RotationAwareGroupBoundsCalculator extends BaseClass(IGroupBoundsCalculator) {
  constructor(private node: INode) {
    super()
  }

  /**
   * Calculates the minimum bounds for the given group node to enclose all its children plus insets.
   */
  calculateBounds(graph: IGraph): Rect {
    let bounds = Rect.EMPTY
    graph.getChildren(this.node).forEach((node) => {
      const style = node.style
      if (style instanceof RotatableNodeStyleDecorator) {
        // if the node supports rotation: add the outer bounds of the rotated layout
        bounds = Rect.add(bounds, style.getRotatedLayout(node).bounds)
      } else {
        // in all other cases: add the node's layout
        bounds = Rect.add(bounds, node.layout.toRect())
      }
    })
    // if we have content: add insets
    return bounds.isEmpty ? bounds : bounds.getEnlarged(getPadding(this.node))
  }
}

/**
 * Returns insets to add to apply to the given groupNode.
 */
function getPadding(groupNode: INode): Insets {
  const provider = groupNode.lookup(IGroupPaddingProvider)
  if (provider) {
    // get the insets from the node's insets provider if there is one
    return provider.getPadding()
  }
  // otherwise add 5 to each border
  return new Insets(5)
}
