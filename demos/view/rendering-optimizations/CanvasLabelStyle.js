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
  CanvasComponent,
  Font,
  FontStyle,
  HtmlCanvasVisual,
  ILabel,
  IOrientedRectangle,
  IRenderContext,
  IVisualCreator,
  LabelStyleBase,
  Size,
  TextMeasurePolicy,
  TextRenderSupport,
  TextWrapping,
  Visual
} from '@yfiles/yfiles'
/**
 * A simple label style that draws the text into the HTML Canvas. This
 * implementation auto-flips the drawing of the labels, if they're upside
 * down.
 */
export default class CanvasLabelStyle extends LabelStyleBase {
  font = new Font('Arial', 14)
  /**
   * Creates the visual representation for the given label.
   * @param context The render context.
   * @param label The label to which this style instance is assigned.
   * @returns The visual as required by the {@link IVisualCreator.createVisual} interface.
   * @see {@link CanvasLabelStyle.updateVisual}
   */
  createVisual(context, label) {
    return new LabelRenderVisual(label.text, label.layout, this.font)
  }
  /**
   * Updates the visual representation for the given label.
   * @param context The render context.
   * @param oldVisual The visual that has been created in the call to
   * {@link CanvasLabelStyle.createVisual}.
   * @param label The label to which this style instance is assigned.
   * @returns The visual as required by the {@link IVisualCreator.createVisual} interface.
   * @see {@link CanvasLabelStyle.createVisual}
   */
  updateVisual(context, oldVisual, label) {
    oldVisual.layout = label.layout
    return oldVisual
  }
  /**
   * Calculates the preferred {@link Size size} for the given label.
   * @param label The label to which this style instance is assigned.
   * @returns The preferred size.
   */
  getPreferredSize(label) {
    return TextRenderSupport.measureText({
      text: label.text,
      font: this.font,
      wrapping: TextWrapping.NONE,
      measurePolicy: TextMeasurePolicy.CANVAS
    })
  }
}
/**
 * For HTML Canvas based rendering we need to extend from {@link HtmlCanvasVisual}.
 */
class LabelRenderVisual extends HtmlCanvasVisual {
  text
  layout
  font
  /**
   * Create an instance of the actual label render visual.
   */
  constructor(text, layout, font) {
    super()
    this.text = text
    this.layout = layout
    this.font = font
  }
  /**
   * Paints onto the context using HTML Canvas operations.
   * Implementations should not destroy the context's state, but should make sure to restore the state to the
   * previously active state. This is especially true for the transformation and clip.
   * @param context The render context of the {@link CanvasComponent}
   * @param htmlCanvasContext The HTML Canvas context to use for rendering.
   */
  render(context, htmlCanvasContext) {
    htmlCanvasContext.save()
    setFont(htmlCanvasContext, this.font)
    htmlCanvasContext.fillStyle = 'rgba(0,0,0,1)'
    htmlCanvasContext.textBaseline = 'bottom'
    if (this.layout.upY !== -1) {
      const upX = this.layout.upX
      const upY = this.layout.upY
      let transformMatrix
      if (this.layout.upY > 0) {
        // flip label if upside down
        transformMatrix = [
          upY,
          -upX,
          upX,
          upY,
          this.layout.anchorX - upY * this.layout.width,
          this.layout.anchorY + upX * this.layout.width
        ]
      } else {
        transformMatrix = [
          -upY,
          upX,
          -upX,
          -upY,
          this.layout.anchorX + upX * this.layout.height,
          this.layout.anchorY + upY * this.layout.height
        ]
      }
      htmlCanvasContext.transform(
        transformMatrix[0],
        transformMatrix[1],
        transformMatrix[2],
        transformMatrix[3],
        transformMatrix[4],
        transformMatrix[5]
      )
      htmlCanvasContext.fillText(this.text, 0, this.layout.height)
    } else {
      htmlCanvasContext.fillText(this.text, this.layout.anchorX, this.layout.anchorY)
    }
    htmlCanvasContext.restore()
  }
}
/**
 * Sets the font on the context using HTML Canvas.
 */
function setFont(htmlCanvasContext, font) {
  htmlCanvasContext.font = `${fontStyleToString(font.fontStyle)} ${font.fontWeight} ${font.fontSize}px ${font.fontFamily}`
}
/**
 * Converts the font style into a string.
 * @param fontStyle The font style to convert.
 */
function fontStyleToString(fontStyle) {
  switch (fontStyle) {
    case FontStyle.NORMAL:
      return 'normal'
    case FontStyle.ITALIC:
      return 'italic'
    case FontStyle.OBLIQUE:
      return 'oblique'
    case FontStyle.INHERIT:
      return 'inherit'
    default:
      throw new Error(`${fontStyle} is not a valid FontStyle`)
  }
}
