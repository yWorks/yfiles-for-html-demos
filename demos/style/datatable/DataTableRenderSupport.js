/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Font, Point, Size, TextRenderSupport } from 'yfiles'

export const SVGNS = 'http://www.w3.org/2000/svg'

const CLIP_PATH_ID_PREFIX = 'dataTableClipPath'

/**
 * Used to create a unique id for each clip path.
 * @type {number}
 */
let clipPathCount = 0

/**
 * Creates the visual appearance for data tables.
 */
export class DataTableRenderSupport {
  /**
   * Initializes a new DataTableRenderSupport instance.
   * @param {!string} className The CSS class name that will be assigned to visualizations created by this class.
   * @param {boolean} clipText If true, text is clipped at the borders of visualizations created by this class.
   */
  constructor(className, clipText) {
    this.clipText = clipText
    this.className = className
    this.textPadding = 3
    this.tablePadding = 2

    this.font = new Font({
      fontFamily: 'Arial',
      fontSize: 12
    })
  }

  /**
   * Creates the visual appearance of a data table for the given size and data cache.
   * @param {*} container The parent SVG element for the new visualization.
   * @param {!Size} size The size of the graph item representing the data table.
   * @param {!RenderDataCache} cache The render data cache for the data table.
   */
  render(container, size, cache) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    // The group containing all other elements
    container.setAttribute('class', this.className)

    // The clip path for the text and inner grid
    const textClipPathId = `${CLIP_PATH_ID_PREFIX}${clipPathCount}`
    if (this.clipText) {
      clipPathCount++

      const clipPad = this.tablePadding + 1
      container.appendChild(
        DataTableRenderSupport.createClipPath(
          clipPad,
          clipPad,
          size.width - 2 * clipPad,
          size.height - 2 * clipPad,
          textClipPathId
        )
      )
    }

    // The table background
    container.appendChild(
      DataTableRenderSupport.createRectangle(
        0,
        0,
        size.width,
        size.height,
        `${this.className} background`
      )
    )

    const names = cache.propertyNames
    if (names) {
      this.updateTextSizes(names, cache)
      const text = this.createTextElement(names, cache.data, cache)
      if (this.clipText) {
        text.setAttribute('style', `clip-path: url(#${textClipPathId});`)
      }
      container.appendChild(text)

      const path = document.createElementNS(SVGNS, 'path')
      path.setAttribute('class', `${this.className} grid`)
      path.setAttribute('d', this.createInnerGridPathString(names.length, size, cache))
      container.appendChild(path)
    }

    // The table border
    container.appendChild(
      DataTableRenderSupport.createRectangle(
        0,
        0,
        size.width,
        size.height,
        `${this.className} border`
      )
    )
  }

  /**
   * Creates the path data string for the inner grid lines.
   * @param {number} columnCount
   * @param {!Size} size
   * @param {!RenderDataCache} renderDataCache
   * @returns {!string}
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
   * @param {!Array.<string>} names
   * @param {!UserData} data
   * @param {!RenderDataCache} renderDataCache
   * @returns {!Element}
   */
  createTextElement(names, data, renderDataCache) {
    const text = document.createElementNS(SVGNS, 'text')

    const cellHeight = renderDataCache.lineHeight + 2 * this.textPadding
    const labelTextX = this.tablePadding + this.textPadding
    const valueTextX = this.tablePadding + renderDataCache.maxLabelWidth + 3 * this.textPadding

    // Create lines with text and horizontal splitters
    let y = this.tablePadding
    for (const name of names) {
      y += cellHeight
      const propertyName = name
      const propertyData = data[propertyName]
      const baseline = y - this.textPadding - 2

      const nameTitleCase = DataTableRenderSupport.toTitleCase(propertyName)
      text.appendChild(
        DataTableRenderSupport.createTextBlock(labelTextX, baseline, nameTitleCase, this.className)
      )
      text.appendChild(
        DataTableRenderSupport.createTextBlock(valueTextX, baseline, propertyData, this.className)
      )
    }

    return text
  }

  /**
   * Updates the line height and the maximum label width stored in the given RenderDataCache
   * by measuring the given texts.
   * @param {!Array.<string>} names
   * @param {!RenderDataCache} renderDataCache
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
   * @param {!Array.<string>} names
   * @returns {number}
   */
  calculateMaximumLabelWidth(names) {
    let labelColumnWidth = 0.0
    for (const name of names) {
      labelColumnWidth = Math.max(
        labelColumnWidth,
        TextRenderSupport.measureText(name, this.font).width
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
   * @param {!string} id
   * @returns {!SVGClipPathElement}
   */
  static createClipPath(x, y, width, height, id) {
    const clipPath = document.createElementNS(SVGNS, 'clipPath')
    clipPath.setAttribute('id', id)
    clipPath.setAttribute('clipPathUnits', 'userSpaceOnUse')
    clipPath.appendChild(DataTableRenderSupport.createRectangle(x, y, width, height, ''))
    return clipPath
  }

  /**
   * Creates a SVG tspan element for the given text at the given relative location.
   * @param {number} x
   * @param {number} y
   * @param {!string} text
   * @param {!string} className
   * @returns {!SVGTSpanElement}
   */
  static createTextBlock(x, y, text, className) {
    const tspan = document.createElementNS(SVGNS, 'tspan')
    tspan.setAttribute('x', x.toString())
    tspan.setAttribute('y', y.toString())
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
   * @param {!string} className
   * @returns {!SVGRectElement}
   */
  static createRectangle(x, y, width, height, className) {
    const rect = document.createElementNS(SVGNS, 'rect')
    rect.x.baseVal.value = x
    rect.y.baseVal.value = y
    rect.width.baseVal.value = width
    rect.height.baseVal.value = height
    if (className) {
      rect.setAttribute('class', className)
    }
    return rect
  }

  /**
   * Converts the given string to title case.
   * @param {!string} text
   * @returns {!string}
   */
  static toTitleCase(text) {
    return text.replace(
      new RegExp('\\w\\S*', 'g'),
      txt => txt.substr(0, 1).toUpperCase() + txt.substr(1).toLowerCase()
    )
  }
}

/**
 * Saves the data which is necessary for the creation of a style and some additional information
 * to speed up node/label style rendering.
 */
export class RenderDataCache {
  /**
   * @param {!UserData} data
   * @param {!Font} font
   * @param {!Size} size
   * @param {!Point} location
   */
  constructor(data, font, size = Size.EMPTY, location = Point.ORIGIN) {
    this.location = location
    this.size = size
    this.font = font
    this.data = data
    this.lineHeight = -1.0
    this.maxLabelWidth = -1.0
    this.propertyNames = this.data ? Object.keys(data) : []
  }

  /**
   * Adopts the values for line height and label widths from the given {@link RenderDataCache} if appropriate.
   * @param {!RenderDataCache} other
   */
  adoptValues(other) {
    if (!this.font.equals(other.font)) {
      return
    }
    this.lineHeight = other.lineHeight
    if (this.data === other.data) {
      this.maxLabelWidth = other.maxLabelWidth
    }
  }

  /**
   * Returns whether this data has the same visual representation (ignoring location and size) as the given other
   * data.
   * @param {!RenderDataCache} other
   * @returns {boolean}
   */
  hasSameVisual(other) {
    return this.data === other.data && other.font.equals(this.font)
  }

  /**
   * @param {!object} [obj]
   * @returns {boolean}
   */
  equals(obj) {
    return !!obj && obj instanceof RenderDataCache && this.hasSameVisual(obj)
  }
}
