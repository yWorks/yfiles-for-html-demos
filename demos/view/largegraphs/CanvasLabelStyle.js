/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * A simple label style that draws the text into the HTML5 Canvas. This
   * implementation auto-flips the drawing of the labels, if they're upside
   * down.
   * @extends yfiles.styles.LabelStyleBase
   */
  class CanvasLabelStyle extends yfiles.styles.LabelStyleBase {
    /**
     * Create a new HTML5 Canvas label style instance.
     */
    constructor() {
      super()
      this.font = new yfiles.view.Font('Arial', 14)
    }

    /**
     * Callback that creates the visual.
     * This method is called in response to a {@link yfiles.view.IVisualCreator#createVisual}
     * call to the instance that has been queried from the {@link yfiles.styles.LabelStyleBase#renderer}.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.graph.ILabel} label The label to which this style instance is assigned.
     * @return {yfiles.view.Visual} The visual as required by the {@link yfiles.view.IVisualCreator#createVisual}
     *   interface.
     * @see {@link yfiles.styles.LabelStyleBase#updateVisual}
     */
    createVisual(context, label) {
      return new LabelRenderVisual(label.text, label.layout, this.font)
    }

    /**
     * Callback that updates the visual previously created by {@link yfiles.styles.LabelStyleBase#createVisual}.
     * This method is called in response to a {@link yfiles.view.IVisualCreator#updateVisual}
     * call to the instance that has been queried from the {@link yfiles.styles.LabelStyleBase#renderer}.
     * This implementation simply delegates to {@link yfiles.styles.LabelStyleBase#createVisual} so subclasses
     * should override to improve rendering performance.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.view.Visual} oldVisual The visual that has been created in the call to
     *   {@link yfiles.styles.LabelStyleBase#createVisual}.
     * @param {yfiles.graph.ILabel} label The label to which this style instance is assigned.
     * @return {yfiles.view.Visual} The visual as required by the {@link yfiles.view.IVisualCreator#createVisual}
     *   interface.
     * @see {@link yfiles.styles.LabelStyleBase#createVisual}
     */
    updateVisual(context, oldVisual, label) {
      oldVisual.layout = label.layout
      return oldVisual
    }

    /**
     * Callback that returns the preferred {@link yfiles.geometry.Size size} of the label.
     * @param {yfiles.graph.ILabel} label The label to which this style instance is assigned.
     * @return {yfiles.geometry.Size} The preferred size.
     */
    getPreferredSize(label) {
      return yfiles.styles.TextRenderSupport.measureText(
        label.text,
        this.font,
        yfiles.styles.TextMeasurePolicy.CANVAS
      ).toSize()
    }
  }

  /**
   * For HTML5 Canvas based rendering we need to extend from {@link yfiles.view.HtmlCanvasVisual}.
   * @extends yfiles.view.HtmlCanvasVisual
   */
  class LabelRenderVisual extends yfiles.view.HtmlCanvasVisual {
    /**
     * Create an instance of the actual label render visual.
     * @param {string} text
     * @param {yfiles.geometry.IOrientedRectangle} layout
     * @param {yfiles.view.Font} font
     */
    constructor(text, layout, font) {
      super()
      this.$layout = layout
      this.font = font
      this.text = text
    }

    /**
     * Gets the layout of the label.
     * @return {yfiles.geometry.IOrientedRectangle}
     */
    get layout() {
      return this.$layout
    }

    /**
     * Sets the layout of the label.
     * This is necessary for updating the label location in {@link CanvasLabelStyle#updateVisual}
     * @param {yfiles.geometry.IOrientedRectangle} layout
     */
    set layout(layout) {
      this.$layout = layout
    }

    /**
     * Paints onto the context using HTML5 Canvas operations.
     * Implementations should not destroy the context's state, but should make sure to restore the state to the
     * previously active state. This is especially true for the transformation and clip.
     * @param {yfiles.view.IRenderContext} context The render context of the {@link yfiles.view.CanvasComponent}
     * @param {CanvasRenderingContext2D} htmlCanvasContext The HTML5 Canvas context to use for rendering.
     */
    paint(context, htmlCanvasContext) {
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
   * Sets the font on the context using HTML5 Canvas.
   * @param {CanvasRenderingContext2D} htmlCanvasContext
   * @param {yfiles.view.Font} font
   */
  function setFont(htmlCanvasContext, font) {
    htmlCanvasContext.font = `${fontStyleToString(font.fontStyle)} ${fontWeightToString(
      font.fontWeight
    )} ${font.fontSize}px ${font.fontFamily}`
  }

  /**
   * Converts the font style into a string.
   * @param {yfiles.view.FontStyle} fontStyle The font style to convert.
   * @return {string}
   */
  function fontStyleToString(fontStyle) {
    switch (fontStyle) {
      case yfiles.view.FontStyle.NORMAL:
        return 'normal'
      case yfiles.view.FontStyle.ITALIC:
        return 'italic'
      case yfiles.view.FontStyle.OBLIQUE:
        return 'oblique'
      case yfiles.view.FontStyle.INHERIT:
        return 'inherit'
      default:
        throw new Error(`${fontStyle} is not a valid FontStyle`)
    }
  }

  /**
   * Converts the font weight into a string.
   * @param {yfiles.view.FontWeight} fontWeight The font weight to convert.
   * @return {string}
   */
  function fontWeightToString(fontWeight) {
    switch (fontWeight) {
      case yfiles.view.FontWeight.NORMAL:
        return 'normal'
      case yfiles.view.FontWeight.BOLD:
        return 'bold'
      case yfiles.view.FontWeight.BOLDER:
        return 'bolder'
      case yfiles.view.FontWeight.LIGHTER:
        return 'lighter'
      case yfiles.view.FontWeight.INHERIT:
        return 'inherit'
      case yfiles.view.FontWeight.ITEM100:
        return '100'
      case yfiles.view.FontWeight.ITEM200:
        return '200'
      case yfiles.view.FontWeight.ITEM300:
        return '300'
      case yfiles.view.FontWeight.ITEM400:
        return '400'
      case yfiles.view.FontWeight.ITEM500:
        return '500'
      case yfiles.view.FontWeight.ITEM600:
        return '600'
      case yfiles.view.FontWeight.ITEM700:
        return '700'
      case yfiles.view.FontWeight.ITEM800:
        return '800'
      case yfiles.view.FontWeight.ITEM900:
        return '900'
      default:
        throw new Error(`${fontWeight} is not a valid FontWeight`)
    }
  }

  return CanvasLabelStyle
})
