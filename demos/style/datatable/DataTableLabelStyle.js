/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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

define(['yfiles/view-component', './DataTableNodeStyle.js', './RenderDataCache.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  DataTableNodeStyle,
  RenderDataCache
) => {
  /**
   * A label style to display data in a tabular fashion.
   * This style uses SVG paths and an SVG text element to create a table-like
   * visualization similar to, for example, a HTML table.
   * @extends yfiles.styles.LabelStyleBase
   */
  class DataTableLabelStyle extends yfiles.styles.LabelStyleBase {
    /**
     * Creates a new instance of this style.
     */
    constructor() {
      super()
      this.textPadding = 3
      this.tablePadding = 2
      this.className = 'myTableLabel'

      this.font = new yfiles.view.Font({
        fontFamily: 'Arial',
        fontSize: 12
      })
    }

    /**
     * Creates the visual for the given label.
     * @see Overrides {@link yfiles.styles.LabelStyleBase#createVisual}
     * @param {yfiles.view.IRenderContext} context
     * @param {yfiles.graph.ILabel} label
     * @return {yfiles.view.SvgVisual}
     */
    createVisual(context, label) {
      // This implementation creates a 'g' element and uses it for the rendering of the label.
      const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
      // Get the necessary data for rendering of the label
      const cache = new RenderDataCache(label.owner.tag, this.font)
      // Render the label
      this.render(g, label, cache)

      // move container to correct location
      const transform = yfiles.styles.LabelStyleBase.createLayoutTransform(label.layout, true)
      transform.applyTo(g)

      return new yfiles.view.SvgVisual(g)
    }

    /**
     * Re-renders the label using the old visual for performance reasons.
     * @see Overrides {@link yfiles.styles.LabelStyleBase#updateVisual}
     * @param {yfiles.view.IRenderContext} context
     * @param {yfiles.view.Visual} oldVisual
     * @param {yfiles.graph.ILabel} label
     * @return {yfiles.view.SvgVisual}
     */
    updateVisual(context, oldVisual, label) {
      const container = oldVisual.svgElement
      // Get the data with which the oldvisual was created
      const oldCache = container['data-renderDataCache']
      // Get the data for the new visual
      const newCache = new RenderDataCache(label.owner.tag, this.font)
      if (!oldCache.equals(newCache)) {
        // The data or font changed, create a new visual
        newCache.adoptValues(oldCache)
        this.render(container, label, newCache)
      }

      // nothing changed, return the old visual
      // arrange because the layout might have changed
      const transform = yfiles.styles.LabelStyleBase.createLayoutTransform(label.layout, true)
      transform.applyTo(container)

      return oldVisual
    }

    /**
     * Creates the visual for the given label.
     * @param {SVGElement} container
     * @param {yfiles.graph.ILabel} label
     * @param {object} cache
     */
    render(container, label, cache) {
      // store information with the visual on how we created it
      container['data-renderDataCache'] = cache

      const layout = label.layout
      // The group containing all other elements
      container.setAttribute('class', this.className)

      // The table background
      container.appendChild(
        DataTableNodeStyle.createRectangle(
          0,
          0,
          layout.width,
          layout.height,
          `${this.className} background`
        )
      )

      const names = cache.propertyNames
      if (names) {
        this.updateTextSizes(names, cache)
        container.appendChild(this.createTextElement(names, cache.data, cache))

        const path = window.document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('class', `${this.className} grid`)
        path.setAttribute('d', this.createInnerGridPathString(names.length, layout, cache))
        container.appendChild(path)
      }

      // The table border
      container.appendChild(
        DataTableNodeStyle.createRectangle(
          0,
          0,
          layout.width,
          layout.height,
          `${this.className} border`
        )
      )
    }

    /**
     * Creates the path data string for the inner grid lines.
     * @param {number} columnCount
     * @param {yfiles.geometry.Size} size
     * @param {object} renderDataCache
     * @return {string}
     */
    createInnerGridPathString(columnCount, size, renderDataCache) {
      const cellHeight = renderDataCache.lineHeight + 2 * this.textPadding
      const tp = 0.5 * this.tablePadding
      const maxX = size.width - tp
      const maxY = size.height - tp

      let y = this.tablePadding + cellHeight
      let d = ''
      for (let i = 1; i < columnCount && y < maxY; i++, y += cellHeight) {
        d += ` M ${tp} ${y} H ${maxX}`
      }

      const vLineX = this.tablePadding + renderDataCache.maxLabelWidth + 2 * this.textPadding
      if (vLineX < maxX) {
        d += ` M ${vLineX} ${tp} V ${maxY}`
      }
      return d.length > 0 ? d : 'M 0 0'
    }

    /**
     * Creates the text element, containing all label texts and all value texts.
     * @param {Array.<string>} names
     * @param {object} data
     * @param {object} renderDataCache
     * @return {Element}
     */
    createTextElement(names, data, renderDataCache) {
      const text = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')

      const cellHeight = renderDataCache.lineHeight + 2 * this.textPadding
      const labelTextX = this.tablePadding + this.textPadding
      const valueTextX = this.tablePadding + renderDataCache.maxLabelWidth + 3 * this.textPadding

      // Create lines with text and horizontal splitters
      let y = this.tablePadding
      for (let i = 0; i < names.length; i++) {
        y += cellHeight
        const propertyName = names[i]
        const propertyData = data[propertyName]
        const baseline = y - this.textPadding - 2

        const nameTitleCase = DataTableNodeStyle.toTitleCase(propertyName)
        text.appendChild(
          DataTableNodeStyle.createTextBlock(labelTextX, baseline, nameTitleCase, this.className)
        )
        text.appendChild(
          DataTableNodeStyle.createTextBlock(valueTextX, baseline, propertyData, this.className)
        )
      }

      return text
    }

    /**
     * Callback that returns the preferred {@link yfiles.geometry.Size size} of the label.
     * @param {yfiles.graph.ILabel} label The label to which this style instance is assigned.
     * @return {yfiles.geometry.Size} The preferred size.
     */
    getPreferredSize(label) {
      const data = label.owner.tag
      if (data === null) {
        return yfiles.geometry.Size.EMPTY
      }

      const propertyNames = Object.keys(data)
      let labelColumnWidth = 0.0
      let valueColumnWidth = 0.0
      for (let i = 0; i < propertyNames.length; i++) {
        const propertyName = propertyNames[i]
        labelColumnWidth = Math.max(
          labelColumnWidth,
          yfiles.styles.TextRenderSupport.measureText(propertyName, this.font).width
        )
        valueColumnWidth = Math.max(
          valueColumnWidth,
          yfiles.styles.TextRenderSupport.measureText(data[propertyName], this.font).width
        )
      }

      const lineHeight = yfiles.styles.TextRenderSupport.measureText('Xg', this.font).height
      const tabPad2 = 2 * this.tablePadding
      return new yfiles.geometry.Size(
        tabPad2 + 4 * this.textPadding + labelColumnWidth + valueColumnWidth,
        tabPad2 + propertyNames.length * (2 * this.textPadding + lineHeight)
      )
    }

    /**
     * Updates the line height and the maximum label width stored in the given RenderDataCache
     * by measuring the given texts.
     * @param {Array.<string>} names
     * @param {object} renderDataCache
     */
    updateTextSizes(names, renderDataCache) {
      if (renderDataCache.lineHeight < 0) {
        renderDataCache.lineHeight = yfiles.styles.TextRenderSupport.measureText(
          'Xg',
          this.font
        ).height
      }
      if (renderDataCache.maxLabelWidth < 0) {
        renderDataCache.maxLabelWidth = this.calculateMaximumLabelWidth(names)
      }
    }

    /**
     * Calculates the maximum label width by measuring the texts.
     * @param {Array.<string>} names
     * @return {number}
     */
    calculateMaximumLabelWidth(names) {
      let labelColumnWidth = 0.0
      for (let i = 0; i < names.length; i++) {
        labelColumnWidth = Math.max(
          labelColumnWidth,
          yfiles.styles.TextRenderSupport.measureText(names[i], this.font).width
        )
      }
      return labelColumnWidth
    }
  }

  return DataTableLabelStyle
})
