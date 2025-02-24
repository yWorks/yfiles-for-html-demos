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
  type INode,
  type INodeStyle,
  type IRenderContext,
  NodeStyleBase,
  SvgVisual,
  SvgVisualGroup
} from '@yfiles/yfiles'

/**
 * A wrapper for the demo node style which sets additional CSS classes on its elements.
 */
export default class CSS3NodeStyleWrapper extends NodeStyleBase {
  private wrapped: INodeStyle

  constructor(wrapped: INodeStyle) {
    super()
    this.wrapped = wrapped
  }

  clone(): this {
    return new CSS3NodeStyleWrapper(this.wrapped.clone()) as this
  }

  /**
   * Re-renders the node.
   */
  updateVisual(context: IRenderContext, oldVisual: SvgVisualGroup, node: INode): SvgVisualGroup {
    const oldWrappedVisual = oldVisual.children.get(0)
    const newWrappedVisual = this.wrapped.renderer
      .getVisualCreator(node, this.wrapped)
      .updateVisual(context, oldWrappedVisual) as SvgVisual
    if (oldWrappedVisual !== newWrappedVisual) {
      oldVisual.children.set(0, newWrappedVisual)
    }
    return oldVisual
  }

  /**
   * Creates the visual for a node and sets some additional CSS classes on it.
   */
  createVisual(context: IRenderContext, node: INode): SvgVisualGroup {
    const wrappedVisual = this.wrapped.renderer
      .getVisualCreator(node, this.wrapped)
      .createVisual(context) as SvgVisual

    const shine = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    shine.setAttribute('class', 'node-flash')
    const { x, y, width, height } = node.layout
    shine.width.baseVal.value = width
    shine.height.baseVal.value = height
    shine.x.baseVal.value = x
    shine.y.baseVal.value = y

    // set additional CSS class based on the state of the node
    if (node.tag != null) {
      const tag = node.tag as { created: boolean }
      if (tag.created) {
        shine.classList.add('node-created')
        // remove the node-created class after the created animation is finished
        // to avoid re-triggering it on subsequent redraws
        for (const event of ['animationend', 'animationcancel'] as const) {
          shine.addEventListener(event, (e) => {
            if (e.animationName === 'nodeCreatedAnimation') {
              shine.classList.remove('node-created')
            }
          })
        }
        // reset created state to avoid adding the class again when the node is redrawn
        tag.created = false
      }
    }

    const svgVisualGroup = new SvgVisualGroup()
    svgVisualGroup.add(wrappedVisual)
    svgVisualGroup.add(new SvgVisual(shine))
    return svgVisualGroup
  }
}
