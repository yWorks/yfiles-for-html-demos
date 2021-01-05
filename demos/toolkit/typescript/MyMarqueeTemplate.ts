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
import { BaseClass, IRenderContext, IVisualTemplate, Rect, SvgVisual } from 'yfiles'

export class MyMarqueeTemplate extends BaseClass<IVisualTemplate>(IVisualTemplate) {
  createVisual(context: IRenderContext, bounds: Rect, dataObject: Object): SvgVisual {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGRectElement
    rect.setAttribute('stroke-width', '3')
    rect.setAttribute('stroke', 'blue')
    rect.setAttribute('fill', 'transparent')
    rect.x.baseVal.value = bounds.x
    rect.y.baseVal.value = bounds.y
    rect.width.baseVal.value = bounds.width
    rect.height.baseVal.value = bounds.height
    return new SvgVisual(rect)
  }

  updateVisual(
    context: IRenderContext,
    oldVisual: SvgVisual,
    bounds: Rect,
    dataObject: Object
  ): SvgVisual {
    const rect = oldVisual.svgElement as SVGRectElement
    rect.x.baseVal.value = bounds.x
    rect.y.baseVal.value = bounds.y
    rect.width.baseVal.value = bounds.width
    rect.height.baseVal.value = bounds.height
    return oldVisual
  }
}
