/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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

const tabWidth = 50
const tabHeight = 14

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 * @typedef {Object} Cache
 * @property {number} width
 * @property {number} height
 * @property {string} [fillColor]
 * @property {boolean} showBadge
 */

/**
 * @typedef {TaggedSvgVisual.<SVGGElement,Cache>} CustomNodeStyleVisual
 */

export class CustomNodeStyle extends NodeStyleBase {
  /**
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {!CustomNodeStyleVisual}
   */
  createVisual(context, node) {
    const { x, y, width, height } = node.layout

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathElement.setAttribute('d', createPathData(0, 0, width, height))

    const fillColor = node.tag?.color ?? '#0b7189'
    pathElement.setAttribute('fill', fillColor)
    pathElement.setAttribute('stroke', '#333')


    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    SvgVisual.setTranslate(g, x, y)

    g.append(pathElement)

    const showBadge = node.tag?.showBadge
    if (showBadge) {
      const badge = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      badge.setAttribute('r', '8')
      badge.setAttribute('fill', '#6c9f44')
      badge.setAttribute('stroke', '#496c2e')
      g.append(badge)
    }

    return SvgVisual.from(g, {
      width,
      height,
      fillColor,
      showBadge
    })

  }

  /**
   * @param {!IRenderContext} context
   * @param {!CustomNodeStyleVisual} oldVisual
   * @param {!INode} node
   * @returns {!CustomNodeStyleVisual}
   */
  updateVisual(context, oldVisual, node) {
    const { x, y, width, height } = node.layout
    // get the path element that needs updating from the old visual
    const g = oldVisual.svgElement
    const pathElement = g.firstElementChild
    // get the cache object we stored in createVisual
    const cache = oldVisual.tag

    const showBadge = node.tag?.showBadge
    if (!pathElement || showBadge !== cache.showBadge) {
      // re-create the visual if the badge visibility has changed
      return this.createVisual(context, node)
    }

    const fillColor = node.tag?.color ?? '#0b7189'
    if (fillColor !== cache.fillColor) {
      // update the fill color
      cache.fillColor = fillColor
      pathElement.setAttribute('fill', fillColor)
    }

    if (width !== cache.width || height !== cache.height) {
      // update the path data to fit the new width and height
      pathElement.setAttribute('d', createPathData(0, 0, width, height))
      cache.width = width
      cache.height = height
    }

    SvgVisual.setTranslate(g, x, y)
    return oldVisual
  }
}

/**
 * Creates the path data for the SVG path element.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {!string}
 */
export function createPathData(x, y, width, height) {
  return `M ${x} ${y} h ${tabWidth} v ${tabHeight} h ${width - tabWidth} v ${
    height - tabHeight
  } h ${-width} z`
}
