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
  DefaultLabelStyle,
  FreeLabelModel,
  ICanvasContext,
  INode,
  IRenderContext,
  NodeStyleBase,
  Rect,
  SimpleLabel,
  SvgVisual,
  Visual
} from 'yfiles'

/**
 * @param {number} value
 * @returns {!string}
 */
function getIntensityColor(value) {
  return `rgb(${(16 + value * 239) | 0}, ${((1 - value) * 239) | 16}, 16)`
}

/** @type {number} */
let lastWidth = -1
/** @type {number} */
let lastHeight = -1
/** @type {SimpleLabel} */
let lastDummy = null

/**
 * @param {number} width
 * @param {number} height
 * @returns {!SimpleLabel}
 */
function getDummyLabel(width, height) {
  if (lastWidth === width && lastHeight === height) {
    return lastDummy
  }
  lastWidth = width
  lastHeight = height

  lastDummy = new SimpleLabel({
    owner: null,
    text: 'Hello World',
    preferredSize: [width, height],
    layoutParameter: FreeLabelModel.INSTANCE.createAbsolute([0, height], 0),
    style: new DefaultLabelStyle({
      verticalTextAlignment: 'center',
      textFill: '#d0d0d0',
      backgroundFill: '#3e3e3e',
      clipText: true,
      insets: { top: 0, right: 0, bottom: 0, left: height + 3 }
    })
  })

  return lastDummy
}

export class ProcessingStepNodeStyle extends NodeStyleBase {
  /**
   * @param {!function} [valueGetter]
   * @param {!function} [textGetter]
   */
  constructor(valueGetter, textGetter) {
    super()
    this.valueGetter = valueGetter || (node => (node.tag && node.tag.value ? node.tag.value : 0))
    this.textGetter = textGetter || (node => (node.tag && node.tag.label ? node.tag.label : 'Step'))
  }

  /**
   * Creates the visual for a node.
   * @param {!IRenderContext} renderContext
   * @param {!INode} node
   * @returns {!SvgVisual}
   */
  createVisual(renderContext, node) {
    // This implementation creates a 'g' element and uses it as a container for the rendering of the node.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const {
      layout: { x, y, width, height }
    } = node

    const size = height
    const t = Math.min(size / 4, 10)
    const r = size / 2 - t / 2
    const cx = size / 2 - 5
    const cy = height / 2

    const dummyLabel = getDummyLabel(width, height)
    dummyLabel.owner = node
    dummyLabel.text = this.textGetter(node)

    g.appendChild(
      dummyLabel.style.renderer
        .getVisualCreator(dummyLabel, dummyLabel.style)
        .createVisual(renderContext).svgElement
    )

    const circleBackground = window.document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circleBackground.cx.baseVal.value = cx
    circleBackground.cy.baseVal.value = cy
    circleBackground.r.baseVal.value = size / 2 + 3
    circleBackground.setAttribute('fill', 'rgb(220,220,220)')
    circleBackground.setAttribute('stroke', 'none')
    g.appendChild(circleBackground)

    const trackBackground = window.document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    trackBackground.cx.baseVal.value = cx
    trackBackground.cy.baseVal.value = cy
    trackBackground.r.baseVal.value = r
    trackBackground.setAttribute('fill', 'none')
    trackBackground.setAttribute('stroke-width', String(t))
    trackBackground.setAttribute('stroke', 'orange')
    g.appendChild(trackBackground)

    const circle = window.document.createElementNS('http://www.w3.org/2000/svg', 'circle')

    const value = this.valueGetter(node)
    const perimeter = r * 2 * Math.PI
    const length = perimeter * (1 - value)

    const color = getIntensityColor(value)

    circle.cx.baseVal.value = cx
    circle.cy.baseVal.value = cy
    circle.r.baseVal.value = r
    circle.setAttribute('fill', 'none')
    circle.setAttribute('stroke-width', String(t))
    circle.setAttribute('stroke', color)
    circle.setAttribute('stroke-dashoffset', String(length))
    circle.setAttribute('stroke-dasharray', String(perimeter))
    circle.setAttribute('class', 'circle-animation')

    g.appendChild(circle)

    SvgVisual.setTranslate(g, x, y)
    const svgVisual = new SvgVisual(g)
    svgVisual.cache = { value }
    return svgVisual
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @param {!IRenderContext} renderContext
   * @param {!Visual} oldVisual
   * @param {!INode} node
   * @returns {!SvgVisual}
   */
  updateVisual(renderContext, oldVisual, node) {
    const {
      layout: { x, y, height }
    } = node

    const cache = oldVisual.cache

    const value = this.valueGetter(node)

    if (cache.value !== value) {
      const circle = oldVisual.svgElement.lastElementChild

      const size = height
      const t = Math.min(size / 4, 10)
      const r = size / 2 - t / 2

      const perimeter = r * 2 * Math.PI
      const length = perimeter * (1 - value)

      const color = getIntensityColor(value)

      circle.setAttribute('stroke-width', String(t))
      circle.setAttribute('stroke', color)
      circle.setAttribute('stroke-dashoffset', String(length))
      circle.setAttribute('stroke-dasharray', String(perimeter))

      cache.value = value
    }

    SvgVisual.setTranslate(oldVisual.svgElement, x, y)
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
    return new Rect(
      node.layout.x - 3,
      node.layout.y - 3,
      node.layout.width + 3,
      node.layout.height + 6
    )
  }
}
