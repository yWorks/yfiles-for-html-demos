/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Font,
  LabelStyleBase,
  Size,
  SvgVisual,
  TextRenderSupport,
  TextWrapping,
  ILabel,
  IRenderContext,
  IOrientedRectangle
} from 'yfiles'

/**
 * This class is an example for a custom style based on the {@link LabelStyleBase}.
 * The font for the label text can be set. The label text is drawn with black letters inside a blue rounded rectangle.
 */
export default class MySimpleLabelStyle extends LabelStyleBase {
  /**
   * Initializes a new instance of the {@link MySimpleLabelStyle} class using the "Arial" font.
   */
  constructor() {
    super()
    this.$font = new Font({
      fontFamily: 'Arial',
      fontSize: 12
    })
  }

  /**
   * Gets the font used for rendering the label text.
   * @type {Font}
   */
  get font() {
    return this.$font
  }

  /**
   * Sets the typeface used for rendering the label text.
   * @type {Font}
   */
  set font(value) {
    this.$font = value
  }

  /**
   * Creates the visual appearance of a label.
   * @param {ILabel} label
   * @param {Element} container
   * @param {IOrientedRectangle} labelLayout
   */
  render(label, container, labelLayout) {
    // background rectangle
    let rect
    if (container.childElementCount > 0) {
      rect = container.childNodes.item(0)
    } else {
      rect = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.rx.baseVal.value = 5
      rect.ry.baseVal.value = 5
      container.appendChild(rect)
    }
    rect.width.baseVal.value = labelLayout.width
    rect.height.baseVal.value = labelLayout.height
    rect.setAttribute('stroke', 'skyblue')
    rect.setAttribute('stroke-width', '1')
    rect.setAttribute('fill', 'rgb(155,226,255)')

    let text
    if (container.childElementCount > 1) {
      text = container.childNodes.item(1)
    } else {
      text = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')
      container.appendChild(text)
    }
    // SVG does not provide out-of-the box text wrapping.
    // The following line uses a convenience method that implements text wrapping
    // with ellipsis by splitting the text and inserting tspan elements as children
    // of the text element. It is not mandatory to use this method, since the same
    // things could be done manually.
    const textContent = TextRenderSupport.addText(
      text,
      label.text,
      this.font,
      labelLayout.toSize(),
      TextWrapping.NONE
    )

    // calculate the size of the text element
    const textSize = TextRenderSupport.measureText(textContent, this.font)

    // calculate horizontal offset for centered alignment
    const translateX = (labelLayout.width - textSize.width) * 0.5

    // calculate vertical offset for centered alignment
    const translateY = (labelLayout.height - textSize.height) * 0.5

    text.setAttribute('transform', `translate(${translateX} ${translateY})`)
    while (container.childElementCount > 2) {
      container.removeChild(container.childNodes.item(2))
    }
  }

  /**
   * Creates the visual for a label to be drawn.
   * @see Overrides {@link LabelStyleBase#createVisual}
   * @param {IRenderContext} context
   * @param {ILabel} label
   * @returns {SvgVisual}
   */
  createVisual(context, label) {
    // This implementation creates a 'g' element and uses it for the rendering of the label.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Render the label
    this.render(label, g, label.layout)
    // move container to correct location
    const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
    transform.applyTo(g)
    // set data item
    g.setAttribute('data-internalId', 'MySimpleLabel')
    g['data-item'] = label
    return new SvgVisual(g)
  }

  /**
   * Calculates the preferred size for the given label if this style is used for the rendering.
   * @see Overrides {@link LabelStyleBase#getPreferredSize}
   * @param {ILabel} label
   * @returns {Size}
   */
  getPreferredSize(label) {
    return new Size(80, 15)
  }
}
