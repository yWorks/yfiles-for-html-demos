/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
import { BaseClass, IRenderContext, IVisualCreator, SvgVisual } from 'yfiles'

export default class RectangleVisualCreator extends BaseClass(IVisualCreator) {
  /**
   * Creates the visual for the background.
   * @param context The context that describes where the visual will be used
   * return {Visual} The visual for the background
   */
  createVisual(context: IRenderContext): SvgVisual {
    const svgVisual = new SvgVisual(
      window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    )
    this.updateVisual(context, svgVisual)
    return svgVisual
  }

  /**
   * Updates the visual for the background.
   * @param context The context that describes where the visual will be used
   * @param oldVisual The old visual
   * return {Visual} The visual for the background
   */
  updateVisual(context: IRenderContext, oldVisual: SvgVisual): SvgVisual {
    const rect = context.canvasComponent!.contentRect.getEnlarged(20)
    const rectangle = oldVisual.svgElement
    rectangle.setAttribute('x', rect.x.toString())
    rectangle.setAttribute('y', rect.y.toString())
    rectangle.setAttribute('width', rect.width.toString())
    rectangle.setAttribute('height', rect.height.toString())
    rectangle.setAttribute('fill', '#6699CC')
    return oldVisual
  }
}
