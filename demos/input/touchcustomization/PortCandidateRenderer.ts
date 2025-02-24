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
  IRenderContext,
  ObjectRendererBase,
  PortCandidateRenderTag,
  SimplePort,
  SvgVisual
} from '@yfiles/yfiles'

/**
 * A port candidate renderer using colored circles as visualizations.
 */
export default class PortCandidateRenderer extends ObjectRendererBase<
  PortCandidateRenderTag,
  SvgVisual
> {
  private readonly radius = 8
  private readonly validFocusedFill = '#0B5517E5'
  private readonly validFocusedStroke = '#FFFFFFB2'
  private readonly validNonFocusedFill = '#0B55177F'
  private readonly validNonFocusedStroke = '#FFFFFF4C'

  /**
   * Renders the port candidate as a colored circle.
   *
   * @param context The context that describes where the renderer is used.
   * @param renderTag The render tag this instance renders.
   */
  createVisual(context: IRenderContext, renderTag: PortCandidateRenderTag): SvgVisual {
    const portCandidate = renderTag.portCandidate
    const current = renderTag.isCurrentCandidate

    const circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circleElement.setAttribute('r', `${this.radius}`)
    const location = context.worldToViewCoordinates(
      new SimplePort(portCandidate.owner, portCandidate.locationParameter).location
    )
    circleElement.setAttribute('cx', `${location.x}`)
    circleElement.setAttribute('cy', `${location.y}`)

    circleElement.setAttribute('fill', current ? this.validFocusedFill : this.validNonFocusedFill)
    circleElement.setAttribute(
      'stroke',
      current ? this.validFocusedStroke : this.validNonFocusedStroke
    )

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    context.viewTransform.applyTo(g)
    g.append(circleElement)

    return new SvgVisual(g)
  }
}
