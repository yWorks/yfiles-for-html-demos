/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
import { NodeStyleBase, SvgVisual } from 'yfiles'
import { getNodeHighlightInfo } from '../NodeHighlightInfo.js'

/**
 * The base class for the logic gate node style. This handles the create
 * and update of the node visuals.
 */
export class GateNodeStyle extends NodeStyleBase {
  /** 
    color for input pins
  * @type {'#E01A4F'}
   */
  static get IN_COLOR() {
    if (typeof GateNodeStyle.$IN_COLOR === 'undefined') {
      GateNodeStyle.$IN_COLOR = '#E01A4F'
    }

    return GateNodeStyle.$IN_COLOR
  }

  /** 
    color for input pins
  * @type {'#E01A4F'}
   */
  static set IN_COLOR(IN_COLOR) {
    GateNodeStyle.$IN_COLOR = IN_COLOR
  }

  /** 
    color for output pins
  * @type {'#01BAFF'}
   */
  static get OUT_COLOR() {
    if (typeof GateNodeStyle.$OUT_COLOR === 'undefined') {
      GateNodeStyle.$OUT_COLOR = '#01BAFF'
    }

    return GateNodeStyle.$OUT_COLOR
  }

  /** 
    color for output pins
  * @type {'#01BAFF'}
   */
  static set OUT_COLOR(OUT_COLOR) {
    GateNodeStyle.$OUT_COLOR = OUT_COLOR
  }

  /**
   * @param {!LogicGateType} gateType
   */
  constructor(gateType) {
    super()
    this.gateType = gateType
  }

  /**
   * @param {!Element} container
   * @param {!Cache} cache
   * @param {!INode} node
   */
  render(container, cache, node) {
    throw new Error('abstract function call')
  }

  /**
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {!SvgVisual}
   */
  createVisual(context, node) {
    // This implementation creates a 'g' element and uses it as a container for the rendering of the node.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Cache the necessary data for rendering of the node
    const cache = createRenderDataCache(node)
    // Render the node
    this.render(g, cache, node)
    // set the location
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @param {!IRenderContext} context The render context
   * @param {!Visual} oldVisual The old visual
   * @param {!INode} node The node to which this style instance is assigned
   * @see Overrides {@link NodeStyleBase.updateVisual}
   * @returns {!Visual}
   */
  updateVisual(context, oldVisual, node) {
    if (!(oldVisual instanceof SvgVisual)) {
      return this.createVisual(context, node)
    }
    const container = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldCache = container['data-cache']
    // get the data for the new visual
    const newCache = createRenderDataCache(node)

    // check if something changed except for the location of the node
    if (!newCache.equals(oldCache)) {
      // something changed - re-render the visual
      while (container.lastChild != null) {
        container.removeChild(container.lastChild)
      }
      this.render(container, newCache, node)
    }
    // make sure that the location is up-to-date
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }
}

/**
 * @typedef {*} CacheOwnerElement
 */

/**
 * @typedef {Object} Cache
 * @property {Size} size
 * @property {boolean} sourceHighlight
 * @property {boolean} targetHighlight
 * @property {function} equals
 */

/**
 * Creates an object containing all necessary data to create a visual for the node.
 * @param {!INode} node The node to which this style instance is assigned.
 * @returns {!Cache} The render data cache object
 */
export function createRenderDataCache(node) {
  return {
    size: node.layout.toSize(),
    sourceHighlight: getNodeHighlightInfo(node).sourceHighlight,
    targetHighlight: getNodeHighlightInfo(node).targetHighlight,
    equals(other) {
      return (
        !!other &&
        this.size.equals(other.size) &&
        this.sourceHighlight === other.sourceHighlight &&
        this.targetHighlight === other.targetHighlight
      )
    }
  }
}

/**
 * Calculates a point on the Bézier cubic curve based on the given t value.
 * @param {number} t The parametric value t in [0,1]
 * @param {!Point} firstPoint The first point of the curve
 * @param {!Point} endPoint The end point of the curve
 * @param {!Point} c1 The first control point of the curve
 * @param {!Point} c2 The second control point of the curve
 * @returns {number} The calculated point the cubic Bézier curve
 */
export function getPointOnCurve(t, firstPoint, endPoint, c1, c2) {
  return (
    (1 - t) ** 3 * firstPoint.x +
    3 * (1 - t) ** 2 * t * c1.x +
    3 * (1 - t) * t * t * c2.x +
    t * t * t * endPoint.x
  )
}

/**
 * Creates an SVG ellipse and appends it to the given container element.
 * @param {!Element} container The SVG element to append the ellipse to
 * @param {number} cx The x coordinate of the center of the ellipse
 * @param {number} cy The y coordinate of the center of the ellipse
 * @param {number} rx The horizontal radius
 * @param {number} ry The vertical radius
 */
export function appendEllipse(container, cx, cy, rx, ry) {
  const ellipse = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
  ellipse.cx.baseVal.value = cx
  ellipse.cy.baseVal.value = cy
  ellipse.rx.baseVal.value = rx
  ellipse.ry.baseVal.value = ry
  setAttribute(ellipse, 'fill', 'white')
  setAttribute(ellipse, 'stroke', 'black')
  setAttribute(ellipse, 'stroke-width', '2')
  container.appendChild(ellipse)
}

/**
 * Creates a svg path from the given general path and appends it to the given container element.
 * @param {!Element} container The svg element to append the path to
 * @param {!GeneralPath} generalPath The given general path
 * @param fill The fill for this path
 * @param stroke The stroke for this path
 * @param {!string} [fill]
 * @param {!string} [stroke]
 */
export function createPath(container, generalPath, fill, stroke) {
  const path = generalPath.createSvgPath()
  setAttribute(path, 'stroke', stroke ?? 'black')
  setAttribute(path, 'stroke-width', '2')
  setAttribute(path, 'fill', fill ?? 'none')
  setAttribute(path, 'stroke-linejoin', 'round')
  container.appendChild(path)
}

/**
 * Creates a svg text element with the given content and font size.
 * @param {!string} textContent The text content
 * @param {number} fontSize The font size
 * @param {!string} color The text color
 * @returns {!Element} The created text element
 */
export function createText(textContent, fontSize, color) {
  const text = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')
  text.textContent = textContent
  setAttribute(text, 'font-family', 'Arial')
  setAttribute(text, 'fill', color)

  setAttribute(text, 'font-size', `${fontSize}px`)
  setAttribute(text, 'font-family', 'Arial')
  setAttribute(text, 'font-weight', 'bold')
  return text
}

/**
 * @param {!Element} element
 * @param {!string} name
 * @param {!(number|string)} value
 */
export function setAttribute(element, name, value) {
  element.setAttribute(name, value.toString())
}
