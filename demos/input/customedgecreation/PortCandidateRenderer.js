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
import { ObjectRendererBase, SimplePort, SvgVisual } from '@yfiles/yfiles'

/**
 * A port candidate renderer using colored circles as visualizations.
 */
export class PortCandidateRenderer extends ObjectRendererBase {
  validFocusedColor = '#6a6a6a'
  validNonFocusedColor = '#939393'

  /**
   * Renders the port candidate as a colored circle.
   *
   * @param context The context that describes where the renderer is used.
   * @param renderTag The render tag this instance renders.
   */
  createVisual(context, renderTag) {
    const portCandidate = renderTag.portCandidate
    const current = renderTag.isCurrentCandidate

    const circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circleElement.setAttribute('r', '3')
    const location = new SimplePort(portCandidate.owner, portCandidate.locationParameter).location
    circleElement.setAttribute('cx', `${location.x}`)
    circleElement.setAttribute('cy', `${location.y}`)

    circleElement.setAttribute('fill', current ? this.validFocusedColor : this.validNonFocusedColor)
    return new SvgVisual(circleElement)
  }
}
