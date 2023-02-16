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
import { NodeStyleBase, SvgVisual } from '../../node_modules/yfiles/yfiles.js'

/**
 * The very simple node style for this demo.
 *
 * It draws nodes as orange rectangles.
 */
export default class extends NodeStyleBase {
  /**
   * Creates a new visual.
   *
   * @param {IRenderContext} ctx The context.
   * @param {INode} node The node.
   * @returns {SvgVisual} The new visual.
   */
  createVisual(ctx, node) {
    const rect = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', node.layout.width.toString())
    rect.setAttribute('height', node.layout.height.toString())
    rect.setAttribute('fill', '#FF8C00')

    rect.setAttribute('transform', `translate(${node.layout.x} ${node.layout.y})`)

    return new SvgVisual(rect)
  }

  /**
   * Updates an existing visual.
   *
   * @param {IRenderContext} ctx The context.
   * @param {SvgVisual} oldVisual The existing visual.
   * @param {INode} node The node.
   */
  updateVisual(ctx, oldVisual, node) {
    const rect = oldVisual.svgElement
    rect.setAttribute('width', node.layout.width.toString())
    rect.setAttribute('height', node.layout.height.toString())
    rect.transform.baseVal.getItem(0).setTranslate(node.layout.x, node.layout.y)
    return oldVisual
  }
}
