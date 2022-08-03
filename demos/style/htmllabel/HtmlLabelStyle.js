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
import {
  Font,
  ILabel,
  IOrientedRectangle,
  IRenderContext,
  LabelStyleBase,
  Size,
  SvgVisual,
  YObject
} from 'yfiles'

/**
 * @typedef {Object} Cache
 * @property {IOrientedRectangle} layout
 * @property {string} text
 * @property {Font} font
 */

/**
 * A label style which displays HTML markup as label text.
 */
export default class HtmlLabelStyle extends LabelStyleBase {
  /*
   * Creates a new instance of the HTMLLabelStyle class.
   *
   * @param font The font used for rendering the label text.
   */
  /**
   * @param {!Font} font
   */
  constructor(font) {
    super()
    this.font = font
  }

  /**
   * Creates a visual that uses a foreignObject-element to display a HTML formatted text.
   * @see Overrides {@link LabelStyleBase.createVisual}
   * @param {!IRenderContext} context
   * @param {!ILabel} label
   * @returns {!SvgVisual}
   */
  createVisual(context, label) {
    const labelLayout = label.layout

    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
    foreignObject.setAttribute('x', '0')
    foreignObject.setAttribute('y', '0')

    const div = document.createElement('div')
    div.style.setProperty('overflow', 'hidden')
    foreignObject.setAttribute('width', `${labelLayout.width}`)
    foreignObject.setAttribute('height', `${labelLayout.height}`)
    div.style.setProperty('width', `${labelLayout.width}px`)
    div.style.setProperty('height', `${labelLayout.height}px`)
    div.style.setProperty('font-family', this.font.fontFamily)
    div.style.setProperty('font-size', `${this.font.fontSize}px`)
    div.style.setProperty('font-weight', `${this.font.fontWeight}`)
    div.style.setProperty('font-style', `${this.font.fontStyle}`)
    div.innerHTML = label.text
    foreignObject.appendChild(div)

    // move container to correct location
    const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
    transform.applyTo(foreignObject)

    // Get the necessary data for rendering of the label and store information with the visual
    foreignObject['data-cache'] = createRenderDataCache(label, this.font)

    return new SvgVisual(foreignObject)
  }

  /**
   * Updates the visual that uses a foreignObject-element to display a HTML formatted text.
   * @see Overrides {@link LabelStyleBase.updateVisual}
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @param {!ILabel} label
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, label) {
    const element = oldVisual.svgElement
    if (element === null || element.childElementCount !== 1) {
      // re-create from scratch if this is not the case
      return this.createVisual(context, label)
    }

    // get the data with which the old visual was created
    const oldCache = element['data-cache']

    // get the data for the new visual
    const newCache = createRenderDataCache(label, this.font)

    // update elements if they have changed
    const foreignObject = element
    const div = foreignObject.firstElementChild
    if (!YObject.equals(oldCache.layout, newCache.layout)) {
      const labelLayout = label.layout
      foreignObject.setAttribute('width', `${labelLayout.width}`)
      foreignObject.setAttribute('height', `${labelLayout.height}`)

      div.style.setProperty('width', `${labelLayout.width}px`)
      div.style.setProperty('height', `${labelLayout.height}px`)
    }
    if (!oldCache.font.equals(newCache.font)) {
      div.style.setProperty('font-family', this.font.fontFamily)
      div.style.setProperty('font-size', `${this.font.fontSize}px`)
      div.style.setProperty('font-weight', `${this.font.fontWeight}`)
      div.style.setProperty('font-style', `${this.font.fontStyle}`)
    }

    if (oldCache.text !== newCache.text) {
      div.innerHTML = label.text
    }

    // update the cache
    element['data-cache'] = newCache

    // move container to correct location
    const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
    transform.applyTo(foreignObject)

    return oldVisual
  }

  /**
   * Returns the preferred size of the label.
   * @see Overrides {@link LabelStyleBase.getPreferredSize}
   * @param {!ILabel} label The label to which this style instance is assigned.
   * @returns {!Size} The preferred size.
   */
  getPreferredSize(label) {
    const div = document.createElement('div')
    div.style.setProperty('display', 'inline-block')
    div.innerHTML = label.text
    document.body.appendChild(div)
    const clientRect = div.getBoundingClientRect()
    document.body.removeChild(div)
    return new Size(clientRect.width, clientRect.height)
  }
}

/**
 * Creates an object containing all necessary data to create a label visual.
 * @param {!ILabel} label The current label.
 * @param {!Font} font The font of the label text.
 * @returns {!Cache}
 */
function createRenderDataCache(label, font) {
  return {
    text: label.text,
    font,
    layout: label.layout
  }
}
