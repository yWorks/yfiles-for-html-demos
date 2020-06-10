/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { INode, IRenderContext, NodeStyleBase, SvgVisual } from 'yfiles'

/**
 * A simple node style to render the node highlight for activity nodes.
 * Only createVisual() is implemented, since updateVisual() is not called for node highlight.
 */
export default class ActivityNodeHighlightStyle extends NodeStyleBase {
  /**
   * @param {object} color
   */
  constructor(color) {
    super()
    this.color = `rgb(${color.r},${color.g},${color.b})`
  }

  /**
   * Creates the visual element for the highlight.
   * @param {IRenderContext} context - The render context.
   * @param {INode} node - The node to which this style instance is assigned.
   * @returns {SvgVisual}
   */
  createVisual(context, node) {
    // get the activity data
    const tag = node.tag
    const layout = node.layout

    // get the width of the lead an followUp decorations
    const leadWidth =
      typeof tag.leadTimeWidth === 'number' && tag.leadTimeWidth > 0 ? tag.leadTimeWidth : 0
    const followUpWidth =
      typeof tag.followUpTimeWidth === 'number' && tag.followUpTimeWidth > 0
        ? tag.followUpTimeWidth
        : 0

    const rectWidth = layout.width + leadWidth + followUpWidth
    const rectX = -leadWidth

    const halfHeight = layout.height * 0.5

    // create the round rectangle
    const rect = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.width.baseVal.value = rectWidth
    rect.height.baseVal.value = layout.height
    rect.rx.baseVal.value = halfHeight
    rect.ry.baseVal.value = halfHeight
    rect.setAttribute('fill', 'none')
    rect.setAttribute('stroke', this.color)
    rect.setAttribute('stroke-width', 4)

    // translate rect to node position
    SvgVisual.setTranslate(rect, layout.x + rectX, layout.y)

    return new SvgVisual(rect)
  }
}
