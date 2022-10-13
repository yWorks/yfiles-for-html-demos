/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { CanvasComponent, HtmlCanvasVisual, IRectangle, IRenderContext } from 'yfiles'

/**
 * Renders a circle with the given layout and color on a HTML5 Canvas.
 */
export class CircleVisual extends HtmlCanvasVisual {
  /**
   * Creates a new instance.
   * @param {!IRectangle} layout The layout of the node to render.
   * @param {!string} color The color of the node to render.
   */
  constructor(layout, color) {
    super()
    this.layout = layout
    this.color = color
  }

  /**
   * Paints onto the context using HTML5 Canvas operations.
   * Paints a simple filled ellipse with the layout and color.
   * @param {!IRenderContext} context The render context of the {@link CanvasComponent}
   * @param {!CanvasRenderingContext2D} canvas2d The HTML5 Canvas context to use for rendering.
   * @see Overrides {@link HtmlCanvasVisual.paint}
   */
  paint(context, canvas2d) {
    // always save the context and restore it after finishing the rendering
    canvas2d.save()
    // set the fill color
    canvas2d.fillStyle = this.color
    const l = this.layout
    // apply the layout
    canvas2d.translate(l.x, l.y)
    canvas2d.scale(l.width, l.height)
    canvas2d.beginPath()
    // draw the ellipse with center 0.5,0.5, radius 0.5
    // from 0 to 2*Pi
    canvas2d.arc(0.5, 0.5, 0.5, 0, Math.PI * 2, false)
    canvas2d.fill()
    // restore the context
    canvas2d.restore()
  }
}
