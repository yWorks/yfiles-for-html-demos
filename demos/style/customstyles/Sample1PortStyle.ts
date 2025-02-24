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
  ICanvasContext,
  IPort,
  IRenderContext,
  PortStyleBase,
  Rect,
  Size,
  SvgVisual,
  type TypedSvgVisual
} from '@yfiles/yfiles'
import { SVGNS } from './Namespaces'

/** the size of the port rendering */
const WIDTH = 4
const HEIGHT = 4

/**
 * The type of the type argument of the creatVisual and updateVisual methods of the style implementation.
 */
type Sample1PortStyleVisual = TypedSvgVisual<SVGEllipseElement>

/**
 * A custom port style based on the {@link PortStyleBase} class.
 * The port is rendered as a circle.
 */
export default class Sample1PortStyle extends PortStyleBase<Sample1PortStyleVisual> {
  createVisual(context: IRenderContext, port: IPort): Sample1PortStyleVisual {
    // create the ellipse
    const ellipse = window.document.createElementNS(SVGNS, 'ellipse')
    ellipse.setAttribute('fill', 'none')
    ellipse.setAttribute('stroke', 'rgb(255,255,255)')
    ellipse.setAttribute('stroke-opacity', '0.31')
    ellipse.cx.baseVal.value = WIDTH * 0.5
    ellipse.cy.baseVal.value = HEIGHT * 0.5
    ellipse.rx.baseVal.value = WIDTH * 0.5
    ellipse.ry.baseVal.value = HEIGHT * 0.5
    // and arrange it
    const portLocation = port.locationParameter.model.getLocation(port, port.locationParameter)
    const locationX = portLocation.x - WIDTH * 0.5
    const locationY = portLocation.y - HEIGHT * 0.5
    SvgVisual.setTranslate(ellipse, locationX, locationY)
    return SvgVisual.from(ellipse)
  }

  updateVisual(
    context: IRenderContext,
    oldVisual: Sample1PortStyleVisual,
    port: IPort
  ): Sample1PortStyleVisual {
    const ellipse = oldVisual.svgElement
    const portLocation = port.locationParameter.model.getLocation(port, port.locationParameter)
    // arrange the old ellipse
    const locationX = portLocation.x - WIDTH * 0.5
    const locationY = portLocation.y - HEIGHT * 0.5
    SvgVisual.setTranslate(ellipse, locationX, locationY)
    return oldVisual
  }

  /**
   * Calculates the bounds of this port.
   * These are also used for arranging the visual, hit testing, visibility testing, and marquee box tests.
   * @see Overrides {@link PortStyleBase.getBounds}
   */
  getBounds(context: ICanvasContext, port: IPort): Rect {
    const portLocation = port.locationParameter.model.getLocation(port, port.locationParameter)
    return Rect.fromCenter(portLocation, new Size(WIDTH, HEIGHT))
  }
}
