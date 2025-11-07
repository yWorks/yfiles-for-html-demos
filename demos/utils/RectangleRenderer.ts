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
  Insets,
  type IRectangle,
  type IRenderContext,
  ObjectRendererBase,
  Rect,
  SvgVisual
} from '@yfiles/yfiles'

export class RectangleRenderer extends ObjectRendererBase<IRectangle, SvgVisual> {
  private margins: Insets
  private useViewCoordinates: boolean
  private fill: string
  private stroke: string

  constructor(
    stroke: string = 'rgba(0,0,0,1)',
    fill: string = 'rgba(0,0,0,0.0)',
    useViewCoordinates: boolean = true,
    margins: Insets = new Insets(0)
  ) {
    super()
    this.stroke = stroke
    this.fill = fill
    this.useViewCoordinates = useViewCoordinates
    this.margins = margins
  }

  protected createVisual(context: IRenderContext, renderTag: IRectangle) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('fill', this.fill)
    rect.setAttribute('stroke', this.stroke)
    rect.setAttribute('stroke-width', '1')

    return this.updateVisual(context, new SvgVisual(rect), renderTag)
  }

  protected updateVisual(context: IRenderContext, oldVisual: SvgVisual, renderTag: IRectangle) {
    const rect = oldVisual.svgElement

    const bounds = renderTag
    const intermediateBounds = this.useViewCoordinates
      ? new Rect(
          context.canvasComponent!.worldToViewCoordinates(bounds.topLeft),
          context.canvasComponent!.worldToViewCoordinates(bounds.bottomRight)
        ).getEnlarged(this.margins)
      : renderTag

    rect.setAttribute('x', `${intermediateBounds.x}`)
    rect.setAttribute('y', `${intermediateBounds.y}`)
    rect.setAttribute('width', `${intermediateBounds.width}`)
    rect.setAttribute('height', `${intermediateBounds.height}`)

    if (this.useViewCoordinates) {
      context.intermediateTransform.applyTo(rect)
    }

    return oldVisual
  }
}
