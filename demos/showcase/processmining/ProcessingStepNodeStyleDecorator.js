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
import {
  ICanvasContext,
  INode,
  INodeStyle,
  IRenderContext,
  NodeStyleBase,
  Rect,
  SvgVisual,
  SvgVisualGroup
} from 'yfiles'

/**
 * Returns the color associated with the given intensity value from blue (low) to red (high).
 * @param {number} value
 * @returns {!string}
 */
function getIntensityColor(value) {
  return `rgb(${(16 + value * 239) | 0}, ${((1 - value) * 239) | 16}, 16)`
}

/**
 * A decorator style which augments the wrapped style with a circular visualization of its workload.
 */
export class ProcessingStepNodeStyleDecorator extends NodeStyleBase {
  valueGetter

  /**
   * Creates a new instance of the decorator style.
   * @param {!INodeStyle} wrappedStyle the style that is augmented with the workload visualization
   * @param valueGetter a function that provides the current amount of workload for a node
   * @param {!function} [valueGetter]
   */
  constructor(wrappedStyle, valueGetter) {
    super()
    this.wrappedStyle = wrappedStyle
    this.valueGetter = valueGetter || ((node) => node?.tag?.value ?? 0)
  }

  /**
   * Creates the visual for a node.
   * @param {!IRenderContext} renderContext
   * @param {!INode} node
   * @returns {!SvgVisual}
   */
  createVisual(renderContext, node) {
    // This implementation creates a group and uses it as a container for the rendering of the node.
    const group = new SvgVisualGroup()

    const { x, y, height } = node.layout

    const { thickness, r, cx, cy } = this.getCircleLayout(height)

    const nodeVisual = this.wrappedStyle.renderer
      .getVisualCreator(node, this.wrappedStyle)
      .createVisual(renderContext)

    group.add(nodeVisual)

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const circleBackground = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circleBackground.cx.baseVal.value = cx
    circleBackground.cy.baseVal.value = cy
    circleBackground.r.baseVal.value = height / 2 + 3
    circleBackground.setAttribute('fill', 'rgb(220,220,220)')
    circleBackground.setAttribute('stroke', 'none')
    g.appendChild(circleBackground)

    const trackBackground = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    trackBackground.cx.baseVal.value = cx
    trackBackground.cy.baseVal.value = cy
    trackBackground.r.baseVal.value = r
    trackBackground.setAttribute('fill', 'none')
    trackBackground.setAttribute('stroke-width', String(thickness))
    trackBackground.setAttribute('stroke', 'orange')
    g.appendChild(trackBackground)

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')

    const value = this.valueGetter(node)
    const perimeter = r * 2 * Math.PI
    const length = perimeter * (1 - value)
    const color = getIntensityColor(value)

    circle.cx.baseVal.value = cx
    circle.cy.baseVal.value = cy
    circle.r.baseVal.value = r
    circle.setAttribute('fill', 'none')
    circle.setAttribute('stroke-width', String(thickness))
    circle.setAttribute('stroke', color)
    circle.setAttribute('stroke-dashoffset', String(length))
    circle.setAttribute('stroke-dasharray', String(perimeter))
    circle.setAttribute('class', 'circle-animation')
    g.appendChild(circle)

    SvgVisual.setTranslate(g, x, y)
    group.add(new SvgVisual(g))

    group.cache = { value }
    return group
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @param {!IRenderContext} renderContext
   * @param {!Cache} oldVisual
   * @param {!INode} node
   * @returns {!SvgVisual}
   */
  updateVisual(renderContext, oldVisual, node) {
    // first, update the wrapped visual
    const oldWrappedVisual = oldVisual.children.first()
    const newWrappedVisual = this.wrappedStyle.renderer
      .getVisualCreator(node, this.wrappedStyle)
      .updateVisual(renderContext, oldWrappedVisual)
    if (oldWrappedVisual !== newWrappedVisual) {
      oldVisual.children.set(0, newWrappedVisual)
    }

    const { x, y, height } = node.layout
    const cache = oldVisual.cache
    const g = oldVisual.children.last().svgElement
    const value = this.valueGetter(node)

    // update the gauge if necessary
    if (cache && cache.value !== value) {
      const circle = g.lastElementChild

      const { thickness, r } = this.getCircleLayout(height)

      const perimeter = r * 2 * Math.PI
      const length = perimeter * (1 - value)

      const color = getIntensityColor(value)

      circle.setAttribute('stroke-width', String(thickness))
      circle.setAttribute('stroke', color)
      circle.setAttribute('stroke-dashoffset', String(length))
      circle.setAttribute('stroke-dasharray', String(perimeter))

      cache.value = value
    }

    SvgVisual.setTranslate(g, x, y)
    return oldVisual
  }

  /**
   * Get the bounding box of the node.
   * This is used for bounding box calculations and considers the slightly overlapping circles.
   * @param {!ICanvasContext} canvasContext
   * @param {!INode} node
   * @returns {!Rect}
   */
  getBounds(canvasContext, node) {
    const wrappedStyleBounds = this.wrappedStyle.renderer
      .getBoundsProvider(node, this.wrappedStyle)
      .getBounds(canvasContext)

    const { height } = node.layout
    const { r, cx, cy } = this.getCircleLayout(height)

    const gaugeBounds = new Rect(cx - r, cy - r, r, r)
    return Rect.add(gaugeBounds, wrappedStyleBounds)
  }

  /**
   * Gets the radius, center and thickness of the gauge circle
   * @param {number} height the node height
   * @returns {!object}
   */
  getCircleLayout(height) {
    const thickness = Math.min(height / 4, 10)
    const r = height / 2 - thickness / 2
    const cx = height / 2 - 5
    const cy = height / 2

    return { thickness, r, cx, cy }
  }
}
