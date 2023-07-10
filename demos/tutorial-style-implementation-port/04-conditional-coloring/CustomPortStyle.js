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
import { PortStyleBase, Rect, SvgVisual } from 'yfiles'

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 * @typedef {Object} Cache
 * @property {number} size
 * @property {string} color
 */

/**
 * @typedef {TaggedSvgVisual.<SVGEllipseElement,Cache>} CustomPortStyleVisual
 */

/**
 * A basic port style that renders a circle.
 */
export class CustomPortStyle extends PortStyleBase {
  /**
   * @param {number} [size=6]
   */
  constructor(size = 6) {
    super()
    this.size = size
  }

  /**
   * @param {!IRenderContext} context
   * @param {!IPort} port
   * @returns {!CustomPortStyleVisual}
   */
  createVisual(context, port) {
    const ellipseElement = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    const { x, y } = port.location
    ellipseElement.setAttribute('cx', String(x))
    ellipseElement.setAttribute('cy', String(y))
    const radius = this.size * 0.5
    ellipseElement.setAttribute('rx', String(radius))
    ellipseElement.setAttribute('ry', String(radius))
    const graph = context.canvasComponent.graph
    const color = this.getColor(graph, port)
    ellipseElement.setAttribute('fill', color)
    ellipseElement.setAttribute('stroke', '#e6f8ff')
    ellipseElement.setAttribute('stroke-width', '1')

    const cache = { size: this.size, color }

    return SvgVisual.from(ellipseElement, cache)
  }

  /**
   * @param {!IRenderContext} context
   * @param {!CustomPortStyleVisual} oldVisual
   * @param {!IPort} port
   * @returns {!CustomPortStyleVisual}
   */
  updateVisual(context, oldVisual, port) {
    const { x, y } = port.location
    // get the ellipse element that needs updating from the old visual
    const ellipseElement = oldVisual.svgElement
    // get the cache object we stored in createVisual
    const cache = oldVisual.tag

    // get the graph from the render context
    const graph = context.canvasComponent.graph
    const color = this.getColor(graph, port)
    if (cache.color !== color) {
      ellipseElement.setAttribute('fill', color)
      cache.color = color
    }

    if (cache.size !== this.size) {
      const radius = this.size * 0.5
      ellipseElement.setAttribute('rx', String(radius))
      ellipseElement.setAttribute('ry', String(radius))
      cache.size = this.size
    }

    // move the visualization to the port location
    ellipseElement.setAttribute('cx', String(x))
    ellipseElement.setAttribute('cy', String(y))

    return oldVisual
  }

  /**
   * Gets the port's color from the tag or calculates it from the number of connected edges.
   * @param {!IGraph} graph
   * @param {!IPort} port
   * @returns {!string}
   */
  getColor(graph, port) {
    return port.tag?.color ?? this.calculateColorByDegree(graph, port)
  }

  /**
   * Calculates the node color based on the number of connected edges.
   * The color is blended between green (0 edges) and red (10+ edges).
   * @param {!IGraph} graph
   * @param {!IPort} port
   * @returns {!string}
   */
  calculateColorByDegree(graph, port) {
    // get the number of edges connected to the port
    const portDegree = graph.degree(port)
    const ratio = Math.min(portDegree / 10, 1)
    const hue = (1 - ratio) * 100
    return `hsl(${hue}deg 100% 50%)`
  }

  /**
   * @param {!ICanvasContext} context
   * @param {!IPort} port
   * @returns {!Rect}
   */
  getBounds(context, port) {
    const { x, y } = port.location
    const radius = this.size * 0.5
    return new Rect(x - radius, y - radius, this.size, this.size)
  }
}
