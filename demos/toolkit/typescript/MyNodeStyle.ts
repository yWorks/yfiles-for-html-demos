/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { INode, IRenderContext, NodeStyleBase, SvgVisual, Visual } from 'yfiles'

export class MyNodeStyle extends NodeStyleBase {
  createVisual(context: IRenderContext, node: INode): Visual {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    const { x, y, width, height } = node.layout
    rect.setAttribute('width', width.toString())
    rect.setAttribute('height', height.toString())
    rect.setAttribute('fill', '#336699')
    g.appendChild(rect)
    g.setAttribute('transform', `translate(${node.layout.x} ${node.layout.y})`)
    const svgVisual = new SvgVisual(g)
    // remember layout on the visual
    ;(svgVisual as any).layout = { x, y, width, height }
    return svgVisual
  }

  updateVisual(context: IRenderContext, oldVisual: Visual, node: INode): Visual {
    const { x, y, width, height } = node.layout

    const oldLayout = (<any>oldVisual).layout
    if (oldLayout.x !== x || oldLayout.y !== y) {
      // make sure that the location is up to date
      ;(<any>(<SvgVisual>oldVisual).svgElement).transform.baseVal
        .getItem(0)
        .setTranslate(node.layout.x, node.layout.y)
      oldLayout.x = x
      oldLayout.y = y
    }
    if (oldLayout.width !== width || oldLayout.height !== height) {
      const rect = (<any>(<SvgVisual>oldVisual).svgElement).firstChild
      rect.setAttribute('width', node.layout.width.toString())
      rect.setAttribute('height', node.layout.height.toString())
    }

    return oldVisual
  }
}
