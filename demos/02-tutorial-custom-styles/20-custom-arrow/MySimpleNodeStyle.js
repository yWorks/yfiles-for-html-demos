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
  Color,
  FreeNodePortLocationModel,
  GeneralPath,
  GeomUtilities,
  ICanvasContext,
  IInputModeContext,
  ILabel,
  INode,
  INodeStyle,
  IRenderContext,
  ISvgDefsCreator,
  ITagOwner,
  MutablePoint,
  NodeStyleBase,
  Point,
  Rect,
  SimpleEdge,
  SimpleNode,
  SimplePort,
  Size,
  SvgVisual
} from 'yfiles'

import MySimpleEdgeStyle from './MySimpleEdgeStyle.js'

/**
 * A very simple implementation of an {@link INodeStyle}
 * that uses the convenience class {@link NodeStyleBase}
 * as the base class.
 */
export default class MySimpleNodeStyle extends NodeStyleBase {
  constructor() {
    super()
    this.$nodeColor = 'rgba(0,130,180,1)'
  }

  /**
   * Counts the number of gradient fills used to generate a unique id.
   * @type {number}
   */
  static get fillCounter() {
    MySimpleNodeStyle.$fillCounter = (MySimpleNodeStyle.$fillCounter || 0) + 1
    return MySimpleNodeStyle.$fillCounter
  }

  /**
   * Gets the node's color.
   * @type {!string}
   */
  get nodeColor() {
    return this.$nodeColor
  }

  /**
   * Sets the node's color.
   * @type {!string}
   */
  set nodeColor(value) {
    this.$nodeColor = value
  }

  /**
   * Determines the color to use for filling the node.
   * This implementation uses the {@link MySimpleNodeStyle#nodeColor} property unless
   * the {@link ITagOwner#tag} of the {@link INode} is of type {@link Color},
   * in which case that color overrides this style's setting.
   * @param {!INode} node The node to determine the color for.
   * @returns {!string} The color for filling the node.
   */
  getNodeColor(node) {
    // the color can be obtained from the "business data" that can be associated with
    // each node, or use the value from this instance.
    return typeof node.tag === 'string' ? node.tag : this.nodeColor
  }

  /**
   * Creates the visual for a node.
   * @see Overrides {@link NodeStyleBase#createVisual}
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {!SvgVisual}
   */
  createVisual(context, node) {
    // This implementation creates a 'g' element and uses it as a container for the rendering of the node.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Get the necessary data for rendering of the edge
    const cache = this.createRenderDataCache(node)
    // Render the node
    this.render(context, node, g, cache)
    // set the location
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @see Overrides {@link NodeStyleBase#updateVisual}
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @param {!INode} node
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, node) {
    const container = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']
    // get the data for the new visual
    const newCache = this.createRenderDataCache(node)

    // check if something changed except for the location of the node
    if (!newCache.equals(newCache, oldCache)) {
      // something changed - re-render the visual
      while (container.hasChildNodes()) {
        // remove all children
        container.removeChild(container.firstChild)
      }
      this.render(context, node, container, newCache)
    }
    // make sure that the location is up to date
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * Creates an object containing all necessary data to create a visual for the node.
   * @param {!INode} node
   * @returns {*}
   */
  createRenderDataCache(node) {
    // If Tag is set to a Color, use it as background color of the node
    const color = this.getNodeColor(node)

    // Remember center points of labels to draw label edges, relative the node's top left corner
    const labelLocations = node.labels.toArray().map(label => {
      const center = label.layout.orientedRectangleCenter
      const topLeft = node.layout.topLeft
      return new Point(center.x - topLeft.x, center.y - topLeft.y)
    })
    return {
      color,
      size: node.layout.toSize(),
      labelLocations,
      equals: (self, other) =>
        self.color === other.color &&
        self.size.equals(other.size) &&
        locationsEquals(self.labelLocations, other.labelLocations)
    }

    function locationsEquals(a1, a2) {
      if (a1 === a2) {
        return true
      }
      if (a1 === null || a2 === null || a1.length !== a2.length) {
        return false
      }

      for (let i = 0; i < a1.length; ++i) {
        if (!a1[i].equals(a2[i])) {
          return false
        }
      }
      return true
    }
  }

  /**
   * Actually creates the visual appearance of a node given the values provided by
   * {@link MySimpleNodeStyle.RenderDataCache}. This renders the node and the edges to the labels and adds the
   * elements to the <code>container</code>. All items are arranged as if the node was located at (0,0).
   * {@link MySimpleNodeStyle#createVisual} and {@link MySimpleNodeStyle#updateVisual} finally arrange the container
   * so that the drawing is translated into the final position.
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @param {!SVGElement} container
   * @param {*} cache
   */
  render(context, node, container, cache) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    // Create Defs section in container
    const defs = window.document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    container.appendChild(defs)

    // draw the dropshadow
    this.drawShadow(context, container, cache.size)

    // draw edges to node labels
    this.renderLabelEdges(node, context, container, cache)

    const color = cache.color
    const nodeSize = cache.size

    const ellipse = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    const w = nodeSize.width * 0.5
    const h = nodeSize.height * 0.5
    ellipse.cx.baseVal.value = w
    ellipse.cy.baseVal.value = h
    ellipse.rx.baseVal.value = w
    ellipse.ry.baseVal.value = h

    // max and min needed for reflection effect calculation
    const max = Math.max(nodeSize.width, nodeSize.height)
    const min = Math.min(nodeSize.width, nodeSize.height)

    if (nodeSize.width > 0 && nodeSize.height > 0) {
      // Create Background gradient from specified background color
      const gradient = window.document.createElementNS(
        'http://www.w3.org/2000/svg',
        'linearGradient'
      )
      gradient.setAttribute('x1', '0')
      gradient.setAttribute('y1', '0')
      gradient.setAttribute('x2', `${0.5 / (nodeSize.width / max)}`)
      gradient.setAttribute('y2', `${1 / (nodeSize.height / max)}`)
      gradient.setAttribute('spreadMethod', 'pad')
      const stop1 = window.document.createElementNS('http://www.w3.org/2000/svg', 'stop')
      stop1.setAttribute('stop-color', '#FFF')
      stop1.setAttribute('stop-opacity', '0.7')
      stop1.setAttribute('offset', '0')
      const stop2 = window.document.createElementNS('http://www.w3.org/2000/svg', 'stop')
      stop2.setAttribute('stop-color', color)
      stop2.setAttribute('offset', '0.6')
      gradient.appendChild(stop1)
      gradient.appendChild(stop2)

      // creates the gradient id
      const fillId = `MySimpleNodeStyle_fill${MySimpleNodeStyle.fillCounter}`
      // assigns the id
      gradient.id = fillId
      // puts the gradient in the container's defs section
      defs.appendChild(gradient)
      // sets the fill reference in the ellipse
      ellipse.setAttribute('fill', `url(#${fillId})`)
    }

    // Create light reflection effects
    const reflection1 = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    const reflection1Size = min / 20
    reflection1.cx.baseVal.value = reflection1Size
    reflection1.cy.baseVal.value = reflection1Size
    reflection1.rx.baseVal.value = reflection1Size
    reflection1.ry.baseVal.value = reflection1Size
    reflection1.setAttribute('fill', '#fff')
    const reflection2 = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    const reflection2Size = min / 14
    reflection2.cx.baseVal.value = reflection2Size
    reflection2.cy.baseVal.value = reflection2Size
    reflection2.rx.baseVal.value = reflection2Size
    reflection2.ry.baseVal.value = reflection2Size
    reflection2.setAttribute('fill', '#f0f8ff')

    const reflection3Path = new GeneralPath()
    const startPoint = new MutablePoint(nodeSize.width / 2.5, (nodeSize.height / 10) * 9)
    const endPoint = new MutablePoint((nodeSize.width / 10) * 9, nodeSize.height / 2.5)
    const ctrlPoint1 = new MutablePoint(
      startPoint.x + (endPoint.x - startPoint.x) / 2,
      nodeSize.height
    )
    const ctrlPoint2 = new MutablePoint(
      nodeSize.width,
      startPoint.y + (endPoint.y - startPoint.y) / 2
    )
    const ctrlPoint3 = new MutablePoint(ctrlPoint1.x, ctrlPoint1.y - nodeSize.height / 10)
    const ctrlPoint4 = new MutablePoint(ctrlPoint2.x - nodeSize.width / 10, ctrlPoint2.y)

    reflection3Path.moveTo(startPoint)
    reflection3Path.cubicTo(ctrlPoint1, ctrlPoint2, endPoint)
    reflection3Path.cubicTo(ctrlPoint4, ctrlPoint3, startPoint)

    const reflection3 = reflection3Path.createSvgPath()

    reflection3.setAttribute('fill', '#f0f8ff')

    // place the reflections
    reflection1.setAttribute('transform', `translate(${nodeSize.width / 5} ${nodeSize.height / 5})`)
    reflection2.setAttribute(
      'transform',
      `translate(${nodeSize.width / 4.9} ${nodeSize.height / 4.9})`
    )
    // and add all to the container for the node
    container.appendChild(ellipse)
    container.appendChild(reflection2)
    container.appendChild(reflection1)
    container.appendChild(reflection3)
  }

  /**
   * Draws the pre-rendered drop-shadow image at the given size.
   * @param {!IRenderContext} context
   * @param {!SVGElement} container
   * @param {!Size} size
   */
  drawShadow(context, container, size) {
    const tileSize = 32
    const tileSize2 = 16
    const offsetY = 2
    const offsetX = 2

    const xScaleFactor = size.width / tileSize
    const yScaleFactor = size.height / tileSize

    // add the dropshadow to the global defs section, if necessary, and get the id
    const defsId = context.getDefsId(dropShadowDefsCreator)
    const use = window.document.createElementNS('http://www.w3.org/2000/svg', 'use')
    use.href.baseVal = `#${defsId}`
    use.setAttribute(
      'transform',
      `matrix(${xScaleFactor} ${0} ${0} ${yScaleFactor} ${offsetX - tileSize2 * xScaleFactor} ${
        offsetY - tileSize2 * yScaleFactor
      })`
    )
    container.appendChild(use)
  }

  /**
   * Draws the edge-like connectors from a node to its labels.
   * @param {!INode} node
   * @param {!IRenderContext} context
   * @param {!Element} container
   * @param {*} cache
   */
  renderLabelEdges(node, context, container, cache) {
    if (node.labels.size > 0) {
      // Create a SimpleEdge which will be used as a dummy for the rendering
      const simpleEdge = new SimpleEdge()
      // Assign the style
      const edgeStyle = new MySimpleEdgeStyle()
      edgeStyle.pathThickness = 3
      simpleEdge.style = edgeStyle

      // Create a SimpleNode which provides the sourceport for the edge but won't be drawn itself
      const sourceDummyNode = new SimpleNode()
      sourceDummyNode.layout = new Rect(0, 0, node.layout.width, node.layout.height)
      sourceDummyNode.style = node.style
      // Set sourceport to the port of the node using a dummy node that is located at the origin.
      simpleEdge.sourcePort = new SimplePort(
        sourceDummyNode,
        FreeNodePortLocationModel.NODE_CENTER_ANCHORED
      )

      // Create a SimpleNode which provides the targetport for the edge but won't be drawn itself
      const targetDummyNode = new SimpleNode()
      simpleEdge.targetPort = new SimplePort(
        targetDummyNode,
        FreeNodePortLocationModel.NODE_CENTER_ANCHORED
      )

      // Render one edge for each label
      cache.labelLocations.forEach(labelLocation => {
        // move the dummy node to the location of the label
        targetDummyNode.layout = new Rect(labelLocation.x, labelLocation.y, 0, 0)
        // now create the visual using the style interface:
        const renderer = simpleEdge.style.renderer
        const creator = renderer.getVisualCreator(simpleEdge, simpleEdge.style)
        const element = creator.createVisual(context)
        if (element !== null) {
          container.appendChild(element.svgElement)
        }
      })
    }
  }

  /**
   * Gets the outline of the node, an ellipse in this case.
   * This allows for correct edge path intersection calculation, among others.
   * @see Overrides {@link NodeStyleBase#getOutline}
   * @param {!INode} node
   * @returns {!GeneralPath}
   */
  getOutline(node) {
    const outline = new GeneralPath()
    outline.appendEllipse(node.layout, false)
    return outline
  }

  /**
   * Get the bounding box of the node.
   * This is used for bounding box calculations and includes the visual shadow.
   * @see Overrides {@link NodeStyleBase#getBounds}
   * @param {!IInputModeContext} canvasContext
   * @param {!INode} node
   * @returns {!Rect}
   */
  getBounds(canvasContext, node) {
    return new Rect(node.layout.x, node.layout.y, node.layout.width + 3, node.layout.height + 3)
  }

  /**
   * Overridden to take the connection lines to the label into account.
   * Otherwise label intersection lines might not be painted if the node is outside
   * of the clipping bounds.
   * @see Overrides {@link NodeStyleBase#isVisible}
   * @param {!ICanvasContext} canvasContext
   * @param {!Rect} clip
   * @param {!INode} node
   * @returns {boolean}
   */
  isVisible(canvasContext, clip, node) {
    if (super.isVisible(canvasContext, clip, node)) {
      return true
    }
    // check for labels connection lines
    clip = clip.getEnlarged(10)
    return node.labels.some(label =>
      clip.intersectsLine(node.layout.center, label.layout.orientedRectangleCenter)
    )
  }

  /**
   * Hit test which considers HitTestRadius specified in CanvasContext.
   * @returns {boolean} True if p is inside node.
   * @see Overrides {@link NodeStyleBase#isHit}
   * @param {!IInputModeContext} canvasContext
   * @param {!Point} p
   * @param {!INode} node
   */
  isHit(canvasContext, p, node) {
    return GeomUtilities.ellipseContains(node.layout.toRect(), p, canvasContext.hitTestRadius)
  }

  /**
   * Checks if a node is inside a certain box. Considers HitTestRadius.
   * @returns {boolean} True if the box intersects the elliptical shape of the node. Also true if box lies completely
   *   inside node.
   * @see Overrides {@link NodeStyleBase#isInBox}
   * @param {!IInputModeContext} canvasContext
   * @param {!Rect} box
   * @param {!INode} node
   */
  isInBox(canvasContext, box, node) {
    // early exit if not even the bounds are contained in the box
    if (!super.isInBox(canvasContext, box, node)) {
      return false
    }

    const eps = canvasContext.hitTestRadius

    const outline = this.getOutline(node)
    if (outline === null) {
      return false
    }

    if (outline.intersects(box, eps)) {
      return true
    }
    if (outline.pathContains(box.topLeft, eps) && outline.pathContains(box.bottomRight, eps)) {
      return true
    }
    return box.contains(node.layout.topLeft) && box.contains(node.layout.bottomRight)
  }

  /**
   * Exact geometric check whether a point p lies inside the node. This is important for intersection calculation,
   * among others.
   * @see Overrides {@link NodeStyleBase#isInside}
   * @param {!INode} node
   * @param {!Point} point
   * @returns {boolean}
   */
  isInside(node, point) {
    return GeomUtilities.ellipseContains(node.layout.toRect(), point, 0)
  }
}

const dropShadowDefsCreator = createDropShadow()

/**
 * @returns {!ISvgDefsCreator}
 */
function createDropShadow() {
  // This instance is needed in order to support automatic cleanup of the global defs section.
  // In order to improve performance in some browsers, elements needed more than once can be
  // placed in the defs section of the SVG and referenced by a 'use' element, instead of
  // duplicating the element itself for each usage. This is done with the drop shadow image
  // in this tutorial step.
  // Class {@link SvgDefsManager} has the task of managing the entities stored in the
  // SVG's global defs section. This includes putting entities into and cleaning the defs
  // section every once in a while. In order for {@link SvgDefsManager} to interact with
  // the defs elements, those have to implement {@link ISvgDefsCreator} that offers a
  // defined interface to deal with.
  // This code uses an anonymous interface implementation of ISvgDefsCreator.
  return ISvgDefsCreator.create({
    createDefsElement: ctx => createDropShadowElement(),

    accept: (ctx, node, id) => ISvgDefsCreator.isUseReference(node, id),

    updateDefsElement: (ctx, oldElement) => {}
  })
}

/**
 * @returns {!SVGElement}
 */
function createDropShadowElement() {
  // pre-render the node's drop shadow using HTML5 canvas rendering
  const canvas = window.document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext('2d')
  context.fillStyle = 'rgb(0, 0, 0)'
  context.globalAlpha = 0.5
  context.beginPath()
  context.arc(32, 32, 16, 0, Math.PI * 2, true)
  context.closePath()
  context.filter = 'blur(2px)'
  context.fill()

  // put the drop-shadow in an SVG image element
  const image = window.document.createElementNS('http://www.w3.org/2000/svg', 'image')
  image.setAttribute('width', '64')
  image.setAttribute('height', '64')
  image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', canvas.toDataURL('image/png'))

  // switch off pointer events on the drop shadow
  image.setAttribute('style', 'pointer-events: none')

  return image
}
