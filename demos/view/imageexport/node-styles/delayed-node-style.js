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
import './delayed-node-style.css'

/**
 * This node style changes its color after a while.
 * This is used to showcase the render completion callback of the SVG export.
 */
export class DelayedNodeStyle extends NodeStyleBase {
  static pendingPromises = new Set()

  createVisual(context, node) {
    const { x, y, width, height } = node.layout

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('dominant-baseline', 'middle')
    text.setAttribute('width', '20')
    text.setAttribute('height', '20')
    text.setAttribute('x', `${width * 0.5}`)
    text.setAttribute('y', `${height * 0.5}`)
    text.classList.add('loading-text')
    text.textContent = '↺'

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', width.toString())
    rect.setAttribute('height', height.toString())
    rect.setAttribute('fill', '#E0E0E0')

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(rect)
    g.appendChild(text)

    const promise = new Promise((resolve) => {
      setTimeout(
        () => {
          rect.setAttribute('fill', '#4CAF50')
          text.classList.remove('loading-text')
          text.textContent = ''
          resolve()
          DelayedNodeStyle.pendingPromises.delete(promise)
        },
        400 + Math.random() * 800
      )
    })
    DelayedNodeStyle.pendingPromises.add(promise)

    SvgVisual.setTranslate(g, x, y)

    return new SvgVisual(g)
  }

  updateVisual(context, oldVisual, node) {
    const { x, y, width, height } = node.layout
    const g = oldVisual.svgElement
    const rect = g.children[0]
    rect.setAttribute('width', width.toString())
    rect.setAttribute('height', height.toString())
    SvgVisual.setTranslate(g, x, y)
    return oldVisual
  }
}
