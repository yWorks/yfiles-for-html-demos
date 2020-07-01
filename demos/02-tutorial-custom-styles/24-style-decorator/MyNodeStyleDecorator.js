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
  Class,
  EdgeStyleBase,
  FreeNodePortLocationModel,
  GeneralPath,
  ICanvasContext,
  IInputModeContext,
  ILabel,
  INode,
  INodeStyle,
  IRenderContext,
  LabelStyleBase,
  NodeStyleBase,
  Point,
  PortStyleBase,
  Rect,
  SimpleEdge,
  SimpleNode,
  SimplePort,
  SvgVisual,
  SvgVisualGroup
} from 'yfiles'

import MySimpleEdgeStyle from './MySimpleEdgeStyle.js'

/**
 * A simple node style wrapper that takes a given node style and adds label edge rendering
 * as a visual decorator on top of the wrapped visualization.
 *
 * This node style wrapper implementation adds the label edge rendering that was formerly part
 * of {@link MySimpleNodeStyle} to the wrapped style. For this purpose of this tutorial step,
 * label edge rendering was removed from {@link MySimpleNodeStyle}.
 *
 * Similar to this implementation, wrapping styles for other graph items can be created by implementing
 * {@link EdgeStyleBase}, {@link LabelStyleBase} and
 * {@link PortStyleBase}.
 */
export default class MyNodeStyleDecorator extends NodeStyleBase {
  /**
   * Creates a new instance of this style using the given wrapped style.
   * @param {!INodeStyle} wrappedStyle The style that is decorated by this instance.
   */
  constructor(wrappedStyle) {
    super()
    this.wrapped = wrappedStyle
  }

  /**
   * Creates the visual for a node rendering the decorator element on top of the wrapped element.
   * @see Overrides {@link NodeStyleBase#createVisual}
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {!SvgVisual}
   */
  createVisual(context, node) {
    // create the outer g element
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // create the cache for updating the visual
    const cache = this.createRenderDataCache(node)
    // create the wrapped style's visual
    const wrappedVisual = this.wrapped.renderer
      .getVisualCreator(node, this.wrapped)
      .createVisual(context)

    // create label edges as decorators for wrapped style
    const labelEdges = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this.renderLabelEdges(node, context, labelEdges, cache)
    labelEdges.setAttribute('transform', `matrix(1 0 0 1 ${node.layout.x} ${node.layout.y})`)

    // add both visuals to outer container
    g.appendChild(wrappedVisual.svgElement)
    g.appendChild(labelEdges)

    // store wrapped visual for updateVisual
    g['wrapped-visual'] = wrappedVisual

    // store the cache with the container
    g['data-renderDataCache'] = cache
    return new SvgVisual(g)
  }

  /**
   * Re-renders the node using the old visual containing the decorator and the wrapped element for performance
   * reasons.
   * @see Overrides {@link NodeStyleBase#updateVisual}
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @param {!INode} node
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, node) {
    const container = oldVisual.svgElement
    // get the container's children
    const wrappedVisual = container['wrapped-visual']
    const labelEdges = container.childNodes[1]

    // update the wrapped visual
    const updateVisual = this.wrapped.renderer
      .getVisualCreator(node, this.wrapped)
      .updateVisual(context, wrappedVisual)
    if (wrappedVisual !== updateVisual) {
      oldVisual.children.set(0, updateVisual)
      container['wrapped-visual'] = updateVisual
    }

    // check if we need to re-render the label edges
    const oldCache = container['data-renderDataCache']
    const newCache = this.createRenderDataCache(node)
    if (!newCache.equals(newCache, oldCache)) {
      while (labelEdges.hasChildNodes()) {
        // remove all children
        labelEdges.removeChild(labelEdges.firstChild)
      }
      this.renderLabelEdges(node, context, labelEdges, newCache)
      container['data-renderDataCache'] = newCache
    }
    labelEdges.setAttribute('transform', `matrix(1 0 0 1 ${node.layout.x} ${node.layout.y})`)

    return oldVisual
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
      const newMySimpleEdgeStyle = new MySimpleEdgeStyle()
      newMySimpleEdgeStyle.pathThickness = 3
      simpleEdge.style = newMySimpleEdgeStyle

      // Create a SimpleNode which provides the sourcePort for the edge but won't be drawn itself
      const sourceDummyNode = new SimpleNode()
      sourceDummyNode.layout = new Rect(0, 0, node.layout.width, node.layout.height)
      sourceDummyNode.style = node.style
      // Set sourcePort to the port of the node using a dummy node that is located at the origin.
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
   * Creates an object containing all necessary data to create a visual for the node.
   * @param {!INode} node
   * @returns {*}
   */
  createRenderDataCache(node) {
    const labelLocations = []
    // Remember center points of labels to draw label edges, relative the node's top left corner
    node.labels.forEach(label => {
      const labelCenter = label.layout.orientedRectangleCenter
      labelLocations.push(labelCenter.subtract(node.layout.topLeft))
    })
    return {
      labelLocations,
      equals: (self, other) => {
        if (self.labelLocations.length !== other.labelLocations.length) {
          return false
        }
        for (let i = 0; i < self.labelLocations.length; i++) {
          if (!self.labelLocations[i].equals(other.labelLocations[i])) {
            return false
          }
        }
        return true
      }
    }
  }

  /**
   * Get the bounding box of the node.
   * @see Overrides {@link NodeStyleBase#getBounds}
   * @param {!IInputModeContext} canvasContext
   * @param {!INode} node
   * @returns {!Rect}
   */
  getBounds(canvasContext, node) {
    // delegate this to the wrapped style
    return this.wrapped.renderer.getBoundsProvider(node, this.wrapped).getBounds(canvasContext)
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
    // first check if the wrapped style is visible
    if (
      this.wrapped.renderer.getVisibilityTestable(node, this.wrapped).isVisible(canvasContext, clip)
    ) {
      return true
    }
    // if not, check for labels connection lines
    clip = clip.getEnlarged(10)
    for (let i = 0; i < node.labels.size; i++) {
      const label = node.labels.get(i)
      if (clip.intersectsLine(node.layout.center, label.layout.orientedRectangleCenter)) {
        return true
      }
    }
    return false
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
    // delegate this to the wrapped style since we don't want the visual decorator to be hit testable
    return this.wrapped.renderer.getHitTestable(node, this.wrapped).isHit(canvasContext, p)
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
    // delegate this to the wrapped style
    return this.wrapped.renderer.getMarqueeTestable(node, this.wrapped).isInBox(canvasContext, box)
  }

  /**
   * Performs the lookup operation.
   * @see Overrides {@link NodeStyleBase#lookup}
   * @param {!INode} node
   * @param {!Class} type
   * @returns {*}
   */
  lookup(node, type) {
    // delegate this to the wrapped style
    return this.wrapped.renderer.getContext(node, this.wrapped).lookup(type)
  }

  /**
   * Gets the intersection of a line with the node.
   * @see Overrides {@link NodeStyleBase#getIntersection}
   * @param {!INode} node
   * @param {!Point} inner
   * @param {!Point} outer
   * @returns {?Point}
   */
  getIntersection(node, inner, outer) {
    // delegate this to the wrapped style
    return this.wrapped.renderer.getShapeGeometry(node, this.wrapped).getIntersection(inner, outer)
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
    // delegate this to the wrapped style
    return this.wrapped.renderer.getShapeGeometry(node, this.wrapped).isInside(point)
  }

  /**
   * Gets the outline of the node.
   * This allows for correct edge path intersection calculation, among others.
   * @see Overrides {@link NodeStyleBase#getOutline}
   * @param {!INode} node
   * @returns {?GeneralPath}
   */
  getOutline(node) {
    // delegate this to the wrapped style
    return this.wrapped.renderer.getShapeGeometry(node, this.wrapped).getOutline()
  }
}
