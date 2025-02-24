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
import { NodeStyleBase, SvgVisual } from '@yfiles/yfiles'
/**
 * This node style changes its color after a while.
 * This is used to showcase the render completion callback of the SVG export.
 */
export class DelayedNodeStyle extends NodeStyleBase {
  static pendingPromises = new Set()
  createVisual(context, node) {
    const { x, y, width, height } = node.layout
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', x.toString())
    rect.setAttribute('y', y.toString())
    rect.setAttribute('width', width.toString())
    rect.setAttribute('height', height.toString())
    const promise = new Promise((resolve) => {
      setTimeout(
        () => {
          rect.setAttribute('fill', 'tomato')
          resolve()
          DelayedNodeStyle.pendingPromises.delete(promise)
        },
        200 + Math.random() * 800
      )
    })
    DelayedNodeStyle.pendingPromises.add(promise)
    return new SvgVisual(rect)
  }
  updateVisual(context, oldVisual, node) {
    const { x, y, width, height } = node.layout
    const rect = oldVisual.svgElement
    rect.setAttribute('x', x.toString())
    rect.setAttribute('y', y.toString())
    rect.setAttribute('width', width.toString())
    rect.setAttribute('height', height.toString())
    return oldVisual
  }
}
