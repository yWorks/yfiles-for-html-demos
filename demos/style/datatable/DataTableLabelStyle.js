/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { ILabel, IRenderContext, LabelStyleBase, Size, SvgVisual, TextRenderSupport } from 'yfiles'
import { DataTableRenderSupport, RenderDataCache, SVGNS } from './DataTableRenderSupport.js'

/**
 * A label style to display data in a tabular fashion.
 * This style uses SVG paths and an SVG text element to create a table-like
 * visualization similar to, for example, a HTML table.
 */
export default class DataTableLabelStyle extends LabelStyleBase {
  /**
   * Creates a new instance of this style.
   */
  constructor() {
    super()
    this.renderSupport = new DataTableRenderSupport('myTableLabel', false)
  }

  /**
   * Creates the visual for the given label.
   * @see Overrides {@link LabelStyleBase#createVisual}
   * @param {!IRenderContext} context
   * @param {!ILabel} label
   * @returns {!SvgVisual}
   */
  createVisual(context, label) {
    // This implementation creates a 'g' element and uses it for the rendering of the label.
    const g = document.createElementNS(SVGNS, 'g')
    // Get the necessary data for rendering of the label
    const cache = new RenderDataCache(label.owner.tag, this.renderSupport.font)
    // Render the label
    this.renderSupport.render(g, label.layout.toSize(), cache)

    // move container to correct location
    const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
    transform.applyTo(g)

    return new SvgVisual(g)
  }

  /**
   * Re-renders the label using the old visual for performance reasons.
   * @see Overrides {@link LabelStyleBase#updateVisual}
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @param {!ILabel} label
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, label) {
    const container = oldVisual.svgElement
    // Get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']
    // Get the data for the new visual
    const newCache = new RenderDataCache(label.owner.tag, this.renderSupport.font)
    if (!newCache.equals(oldCache)) {
      // The data or font changed, create a new visual
      newCache.adoptValues(oldCache)
      this.renderSupport.render(container, label.layout.toSize(), newCache)
    }

    // nothing changed, return the old visual
    // arrange because the layout might have changed
    const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
    transform.applyTo(container)

    return oldVisual
  }

  /**
   * Callback that returns the preferred {@link Size size} of the label.
   * @param {!ILabel} label The label to which this style instance is assigned.
   * @returns {!Size} The preferred size.
   */
  getPreferredSize(label) {
    const data = label.owner.tag
    if (!data) {
      return Size.EMPTY
    }

    const font = this.renderSupport.font

    const propertyNames = Object.keys(data)
    let labelColumnWidth = 0.0
    let valueColumnWidth = 0.0
    for (let i = 0; i < propertyNames.length; i++) {
      const propertyName = propertyNames[i]
      labelColumnWidth = Math.max(
        labelColumnWidth,
        TextRenderSupport.measureText(propertyName, font).width
      )
      valueColumnWidth = Math.max(
        valueColumnWidth,
        TextRenderSupport.measureText(data[propertyName], font).width
      )
    }

    const lineHeight = TextRenderSupport.measureText('Xg', font).height
    const tabPad2 = 2 * this.renderSupport.tablePadding
    const textPad = this.renderSupport.textPadding
    return new Size(
      tabPad2 + 4 * textPad + labelColumnWidth + valueColumnWidth,
      tabPad2 + propertyNames.length * (2 * textPad + lineHeight)
    )
  }
}
