/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
import {
  Font,
  INode,
  IRenderContext,
  NodeStyleBase,
  Size,
  SvgVisual,
  TextRenderSupport,
  Visual
} from 'yfiles'
import RenderDataCache from './RenderDataCache.js'

/** Used to create a unique id for each clip path */
let clipPathCount = 0
const CLIP_PATH_ID_PREFIX = 'dataTableClipPath'

/**
 * A node style to display data in a tabular fashion.
 * This style uses SVG lines and an SVG text element to create a table-like
 * visualization similar to, for example, a HTML table.
 * To avoid text extending beyond the border of the node, the style of each node
 * as a separate clipPath assigned to its text element.
 */
export default class DataTableNodeStyle extends NodeStyleBase {
  /**
   * Creates a new instance of this style.
   */
  constructor() {
    super()
    this.textPadding = 3
    this.tablePadding = 2
    this.className = 'myTableNode'

    this.font = new Font({
      fontFamily: 'Arial',
      fontSize: 12
    })
  }

  /**
   * Creates the visual for a node.
   * @see Overrides {@link NodeStyleBase#createVisual}
   * @param {IRenderContext} context
   * @param {INode} node
   * @return {SvgVisual}
   */
  createVisual(context, node) {
    // This implementation creates a 'g' element and uses it for the rendering of the node.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Cache the necessary data for rendering of the node
    const cache = new RenderDataCache(
      node.tag,
      this.font,
      node.layout.toSize(),
      node.layout.toPoint()
    )
    // Render the node
    this.render(g, node, cache)

    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the label using the old visual for performance reasons.
   * @see Overrides {@link NodeStyleBase#updateVisual}
   * @param {IRenderContext} context
   * @param {Visual} oldVisual
   * @param {INode} node
   * @return {SvgVisual}
   */
  updateVisual(context, oldVisual, node) {
    const container = oldVisual.svgElement
    // Get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']
    // Get the data for the new visual
    const newCache = new RenderDataCache(
      node.tag,
      this.font,
      node.layout.toSize(),
      node.layout.toPoint()
    )
    if (!oldCache.equals(newCache)) {
      // The data or font changed, create a new visual
      newCache.adoptValues(oldCache)
      while (container.hasChildNodes()) {
        // remove all children
        container.removeChild(container.firstChild)
      }

      this.render(container, node, newCache)
      // make sure that the location is up to date
      SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
      return oldVisual
    }

    if (!newCache.location.equals(oldCache.location)) {
      // Only the location changed, keep the old visual and update its transform and cache
      this.updateVisualLocation(node, oldVisual, oldCache)
    }
    if (!newCache.size.equals(oldCache.size)) {
      // Only the size changed, so update the size of the visual
      this.updateVisualSize(node, oldVisual, oldCache)
    }

    return oldVisual
  }

  /**
   * Actually creates the visual appearance of a node given the values provided by
   * {@link MySimpleNodeStyle#createRenderDataCache}. This renders the node and the edges to the labels and adds the
   * elements to the <code>container</code>. All items are arranged as if the node was located at (0,0).
   * {@link MySimpleNodeStyle#createVisual} and {@link MySimpleNodeStyle#updateVisual}finally arrange the container
   * so that the drawing is translated into the final position.
   * @param {SVGElement} container
   * @param {INode} node
   * @param {object} cache
   */
  render(container, node, cache) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    const layout = node.layout
    // The group containing all other elements
    container.setAttribute('class', this.className)

    // The clip path for the text and inner grid
    const textClipPathId = CLIP_PATH_ID_PREFIX + clipPathCount
    clipPathCount++

    const clipPad = this.tablePadding + 1
    container.appendChild(
      DataTableNodeStyle.createClipPath(
        clipPad,
        clipPad,
        layout.width - 2 * clipPad,
        layout.height - 2 * clipPad,
        textClipPathId
      )
    )

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
      const text = this.createTextElement(names, cache.data, cache)
      text.setAttribute('style', `clip-path: url(#${textClipPathId});`)
      container.appendChild(text)

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
   * Updates the size of the given visual to match the node layout.
   * @param {INode} node
   * @param {Visual} visual
   * @param {object} renderDataCache
   */
  updateVisualSize(node, visual, renderDataCache) {
    const nodeLayout = node.layout
    renderDataCache.size = node.layout.toSize()

    const g = visual.svgElement

    const textClipRect = g.firstChild.firstChild
    const clipPad = this.tablePadding + 1
    textClipRect.width.baseVal.value = nodeLayout.width - 2 * clipPad
    textClipRect.height.baseVal.value = nodeLayout.height - 2 * clipPad

    const tableBackgroundRect = g.childNodes[1]
    tableBackgroundRect.width.baseVal.value = nodeLayout.width
    tableBackgroundRect.height.baseVal.value = nodeLayout.height
    const tableBorderRect = g.childNodes[4]
    tableBorderRect.width.baseVal.value = nodeLayout.width
    tableBorderRect.height.baseVal.value = nodeLayout.height

    // the second child is the text
    const names = renderDataCache.propertyNames
    if (names) {
      const innerGridPath = g.childNodes[3]
      innerGridPath.removeAttribute('d')
      innerGridPath.setAttribute(
        'd',
        this.createInnerGridPathString(names.length, node.layout.toSize(), renderDataCache)
      )
    }
  }

  /**
   * Updates the location of the given visual to match the node layout.
   * This changes only the translation of the top-level SVG element of this style.
   * @param {INode} node
   * @param {Visual} visual
   * @param {object} renderCache
   */
  updateVisualLocation(node, visual, renderCache) {
    const nodeLayout = node.layout
    renderCache.location = nodeLayout.toPoint()
    visual.svgElement.setAttribute('transform', `translate (${nodeLayout.x} ${nodeLayout.y})`)
  }

  /**
   * Creates the path data string for the inner grid lines.
   * @param {number} columnCount
   * @param {Size} size
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
   * Updates the line height and the maximum label width stored in the given RenderDataCache
   * by measuring the given texts.
   * @param {Array.<string>} names
   * @param {object} renderDataCache
   */
  updateTextSizes(names, renderDataCache) {
    if (renderDataCache.lineHeight < 0) {
      renderDataCache.lineHeight = TextRenderSupport.measureText('Xg', this.font).height
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
        TextRenderSupport.measureText(names[i], this.font).width
      )
    }
    return labelColumnWidth
  }

  /**
   * Creates a SVG clipPath element for the given settings.
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {string} id
   * @return {Element}
   */
  static createClipPath(x, y, width, height, id) {
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
    clipPath.setAttribute('id', id)
    clipPath.setAttribute('clipPathUnits', 'userSpaceOnUse')
    clipPath.appendChild(DataTableNodeStyle.createRectangle(x, y, width, height, null))
    return clipPath
  }

  /**
   * Creates a SVG tspan element for the given text at the given relative location.
   * @param {number} x
   * @param {number} y
   * @param {string} text
   * @param {string} className
   * @return {Element}
   */
  static createTextBlock(x, y, text, className) {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    tspan.setAttribute('x', x)
    tspan.setAttribute('y', y)
    tspan.textContent = text
    if (className !== null) {
      tspan.setAttribute('class', className)
    }
    return tspan
  }

  /**
   * Creates a SVG rectangle at (0,0) with the given width and height.
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {string} className
   * @return {Element}
   */
  static createRectangle(x, y, width, height, className) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.x.baseVal.value = x
    rect.y.baseVal.value = y
    rect.width.baseVal.value = width
    rect.height.baseVal.value = height
    if (className !== null) {
      rect.setAttribute('class', className)
    }
    return rect
  }

  /**
   * Converts the given string to title case.
   * @param {string} text
   * @return {string}
   */
  static toTitleCase(text) {
    return text.replace(
      new RegExp('\\w\\S*', 'g'),
      txt => txt.substr(0, 1).toUpperCase() + txt.substr(1).toLowerCase()
    )
  }
}
