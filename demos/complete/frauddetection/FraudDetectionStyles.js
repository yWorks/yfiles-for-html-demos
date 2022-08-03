/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CanvasComponent,
  EdgeStyleBase,
  EdgeStyleDecorationInstaller,
  GeneralPath,
  GeomUtilities,
  GraphComponent,
  HighlightIndicatorManager,
  HtmlCanvasVisual,
  ICanvasContext,
  ICanvasObjectGroup,
  ICanvasObjectInstaller,
  IEdge,
  IInputModeContext,
  IModelItem,
  INode,
  IPoint,
  IRenderContext,
  NodeStyleBase,
  NodeStyleDecorationInstaller,
  Point,
  PolylineEdgeStyle,
  Rect,
  Size,
  SvgVisual,
  Visual
} from 'yfiles'

/**
 * @typedef {Object} NodeStyleCache
 * @property {Size} size
 * @property {boolean} fraud
 */

/**
 * A simple node style that visualizes a circular node with an icon.
 */
export class IconNodeStyle extends NodeStyleBase {
  /**
   * Creates the visual for a circular node with an icon.
   * @param {!IRenderContext} context The render context
   * @param {!INode} node The node to which this style instance is assigned
   * @see Overrides {@link NodeStyleBase.createVisual}
   * @returns {!SvgVisual}
   */
  createVisual(context, node) {
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // store information with the visual on how we created it
    g['render-data-cache'] = IconNodeStyle.createRenderDataCache(node)

    // create circular base
    const shape = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    const nodeLayout = node.layout
    const width = nodeLayout.width * 0.5
    const height = nodeLayout.height * 0.5
    shape.setAttribute('cx', width.toString())
    shape.setAttribute('cy', height.toString())
    shape.setAttribute('rx', width.toString())
    shape.setAttribute('ry', height.toString())
    shape.setAttribute('fill', getFillColor(node))
    shape.setAttribute('stroke', getStrokeColor(node))
    shape.setAttribute('stroke-width', '2')
    g.appendChild(shape)

    // add icon
    const source = IconNodeStyle.getIconPath(node)
    if (source !== null) {
      const icon = window.document.createElementNS('http://www.w3.org/2000/svg', 'image')
      const iconWidth = nodeLayout.width * 0.6
      const iconHeight = nodeLayout.height * 0.6
      icon.setAttributeNS('http://www.w3.org/1999/xlink', 'href', source)
      icon.setAttribute('width', iconWidth.toString())
      icon.setAttribute('height', iconHeight.toString())
      icon.setAttribute('x', (width - iconWidth * 0.5).toString())
      icon.setAttribute('y', (height - iconHeight * 0.5).toString())
      g.appendChild(icon)
    }

    // set the location
    SvgVisual.setTranslate(g, nodeLayout.x, nodeLayout.y)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @param {!IRenderContext} context The render context
   * @param {!SvgVisual} oldVisual The old visual
   * @param {!INode} node The node to which this style instance is assigned
   * @see Overrides {@link NodeStyleBase.updateVisual}
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, node) {
    const g = oldVisual.svgElement

    // get relevant data that might have changed
    const oldCache = g['render-data-cache']
    const newCache = IconNodeStyle.createRenderDataCache(node)

    const layout = node.layout
    // update node size
    if (!newCache.size.equals(oldCache.size)) {
      const shape = g.firstElementChild
      const width = layout.width * 0.5
      const height = layout.height * 0.5
      shape.setAttribute('cx', width.toString())
      shape.setAttribute('cy', height.toString())
      shape.setAttribute('rx', width.toString())
      shape.setAttribute('ry', height.toString())

      const icon = g.lastElementChild
      const iconWidth = layout.width * 0.6
      const iconHeight = layout.height * 0.6
      icon.setAttribute('width', iconWidth.toString())
      icon.setAttribute('height', iconHeight.toString())
      icon.setAttribute('x', (width - iconWidth * 0.5).toString())
      icon.setAttribute('y', (height - iconHeight * 0.5).toString())
    }

    // update node color depending on the fraud state
    if (newCache.fraud !== oldCache.fraud) {
      const shape = g.firstElementChild
      shape.setAttribute('fill', getFillColor(node))
      shape.setAttribute('stroke', getStrokeColor(node))
    }

    // update location
    SvgVisual.setTranslate(g, layout.x, layout.y)
    g['render-data-cache'] = newCache
    return oldVisual
  }

  /**
   * Creates an object containing all necessary data to create a visual for the node.
   * @param {!INode} node The node
   * @returns {!NodeStyleCache} The render data cache object
   */
  static createRenderDataCache(node) {
    const layout = node.layout
    return {
      size: layout.toSize(),
      fraud: node.tag.fraud
    }
  }

  /**
   * Returns the resource path of the icon file according to the node's type.
   * @param {!INode} node The node
   * @returns {?string} The resource path of the icon
   */
  static getIconPath(node) {
    switch (node.tag.type) {
      case 'Account Holder':
        return 'resources/account-holder.svg'
      case 'Address':
        return 'resources/address.svg'
      case 'Phone Number':
        return 'resources/phone.svg'
      case 'Bank Branch':
        return 'resources/bank.svg'
      case 'New Account':
        return 'resources/new-account.svg'
      case 'Loan':
        return 'resources/loan.svg'
      case 'Payment':
        return 'resources/payment.svg'
      case 'Credit Card':
        return 'resources/credit-card.svg'
      case 'Participant':
        return 'resources/account-holder.svg'
      case 'Doctor':
        return 'resources/doctor.svg'
      case 'Lawyer':
        return 'resources/lawyer.svg'
      case 'Car':
        return 'resources/car.svg'
      case 'Accident':
        return 'resources/accident.svg'
      default:
        return null
    }
  }

  /**
   * Gets the outline of the node, an ellipse in this case.
   * @param {!INode} node The given node
   * This allows for correct edge path intersection calculation, among others.
   * @see Overrides {@link NodeStyleBase.getOutline}
   * @returns {!GeneralPath}
   */
  getOutline(node) {
    const outline = new GeneralPath()
    outline.appendEllipse(node.layout.toRect(), false)
    return outline
  }

  /**
   * Get the bounding box of the node.
   * This is used for bounding box calculations and includes the visual shadow.
   * @param {!ICanvasContext} canvasContext The context to calculate the bounds for
   * @param {!INode} node The given node
   * @see Overrides {@link NodeStyleBase.getBounds}
   * @returns {!Rect}
   */
  getBounds(canvasContext, node) {
    return node.layout.toRect()
  }

  /**
   * Checks if a point hits the node's bounds. Considers HitTestRadius.
   * @param {!ICanvasContext} canvasContext The canvas context
   * @param {!Point} point The point to test
   * @param {!INode} node The given node
   * @see Overrides {@link NodeStyleBase.isHit}
   * @returns {boolean}
   */
  isHit(canvasContext, point, node) {
    return GeomUtilities.ellipseContains(node.layout.toRect(), point, canvasContext.hitTestRadius)
  }

  /**
   * Checks if a node is inside a certain box. Considers HitTestRadius.
   * @param {!IInputModeContext} context The input mode context
   * @param {!Rect} box The marquee selection box
   * @param {!INode} node The given node
   * @see Overrides {@link NodeStyleBase.isInBox}
   * @returns {boolean}
   */
  isInBox(context, box, node) {
    // early exit if not even the bounds are contained in the box
    if (!super.isInBox(context, box, node)) {
      return false
    }

    const eps = context.hitTestRadius

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
    return (
      box.contains(node.layout.toRect().topLeft) && box.contains(node.layout.toRect().bottomRight)
    )
  }

  /**
   * Exact geometric check whether a point lies inside the circular node.
   * @param {!INode} node The given node
   * @param {!Point} point The point to test
   * @see Overrides {@link NodeStyleBase.isInside}
   * @returns {boolean}
   */
  isInside(node, point) {
    return GeomUtilities.ellipseContains(node.layout.toRect(), point, 0)
  }
}

/**
 * A very basic high-performance edge style that uses HTML 5 canvas rendering.
 * Arrows are not supported by this implementation.
 */
export class CanvasEdgeStyle extends EdgeStyleBase {
  /**
   * Creates the visual for an edge.
   * @param {!IRenderContext} context The render context
   * @param {!IEdge} edge The given edge
   * @see Overrides {@link NodeStyleBase.createVisual}
   * @returns {!EdgeRenderVisual}
   */
  createVisual(context, edge) {
    return new EdgeRenderVisual(edge)
  }

  /**
   * Updates the visual for an edge.
   * @param {!IRenderContext} context The render context
   * @param {!Visual} oldVisual The old visual
   * @param {!IEdge} edge The given edge
   * @see Overrides {@link NodeStyleBase.createVisual}
   * @returns {!Visual}
   */
  updateVisual(context, oldVisual, edge) {
    return oldVisual
  }

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   * @param {!IInputModeContext} canvasContext The input mode context
   * @param {!Point} p The point to test
   * @param {!IEdge} edge The edge to which this style instance is assigned
   * @returns {boolean} True if the specified edge representation is hit, false otherwise
   */
  isHit(canvasContext, p, edge) {
    // we use a very simple hit logic here (the base implementation)
    if (!super.isHit(canvasContext, p, edge)) {
      return false
    }

    // but we exclude hits on the source and target node
    const s = edge.sourceNode
    const t = edge.targetNode
    return (
      !s.style.renderer.getHitTestable(s, s.style).isHit(canvasContext, p) &&
      !t.style.renderer.getHitTestable(t, t.style).isHit(canvasContext, p)
    )
  }
}

/**
 * For HTML5 Canvas based rendering we need to extend from {@link HtmlCanvasVisual}.
 */
class EdgeRenderVisual extends HtmlCanvasVisual {
  /**
   * Creates a EdgeRenderVisual for the given edge with the given thickness.
   * @param {!IEdge} edge The given edge
   */
  constructor(edge) {
    super()
    this.edge = edge
  }

  /**
   * Paints onto the context using HTML5 Canvas operations.
   * @param {!IRenderContext} context The render context
   * @param {!CanvasRenderingContext2D} ctx The HTML5 Canvas context to use for rendering
   */
  paint(context, ctx) {
    ctx.save()
    ctx.beginPath()
    let location = this.edge.sourcePort.location
    ctx.moveTo(location.x, location.y)
    this.edge.bends.forEach(bend => {
      location = bend.location
      ctx.lineTo(location.x, location.y)
    })
    location = this.edge.targetPort.location
    ctx.lineTo(location.x, location.y)
    ctx.lineWidth = 5
    ctx.strokeStyle = getColor(this.edge)
    ctx.stroke()
    ctx.restore()
  }
}

/**
 * A highlight manager responsible for highlighting the fraud components.
 */
export class FraudHighlightManager extends HighlightIndicatorManager {
  constructor() {
    super()
    this.edgeHighlightGroup = null
    this.nodeHighlightGroup = null
  }

  /**
   * Installs the manager on the canvas.
   * Adds the highlight groups
   * @param {!CanvasComponent} canvas
   */
  install(canvas) {
    if (canvas instanceof GraphComponent) {
      const graphModelManager = canvas.graphModelManager
      // the edges' highlight group should be above the nodes
      this.edgeHighlightGroup = graphModelManager.contentGroup.addGroup()
      this.edgeHighlightGroup.below(graphModelManager.nodeGroup)

      // the nodes' highlight group should be above the nodes
      this.nodeHighlightGroup = graphModelManager.contentGroup.addGroup()
      this.nodeHighlightGroup.above(graphModelManager.nodeGroup)
    }
    super.install(canvas)
  }

  /**
   * Uninstalls the manager from the canvas
   * removes the highlight groups
   * @param {!CanvasComponent} canvas
   */
  uninstall(canvas) {
    super.uninstall(canvas)
    if (this.edgeHighlightGroup) {
      this.edgeHighlightGroup.remove()
      this.edgeHighlightGroup = null
    }
    if (this.nodeHighlightGroup) {
      this.nodeHighlightGroup.remove()
      this.nodeHighlightGroup = null
    }
  }

  /**
   * This implementation always returns the highlightGroup of the canvasComponent of this instance.
   * @param {!IModelItem} item The item to check
   * @returns {?ICanvasObjectGroup} An ICanvasObjectGroup or null
   */
  getCanvasObjectGroup(item) {
    if (item instanceof IEdge) {
      return this.edgeHighlightGroup
    } else if (INode.isInstance(item)) {
      return this.nodeHighlightGroup
    }
    return super.getCanvasObjectGroup(item)
  }

  /**
   * Callback used by install to retrieve the installer for a given item.
   * @param {!IModelItem} item The item to find an installer for
   * @returns {?ICanvasObjectInstaller}
   */
  getInstaller(item) {
    if (item instanceof INode) {
      return new NodeStyleDecorationInstaller({
        margins: 2,
        zoomPolicy: 'mixed',
        nodeStyle: new IconNodeStyle()
      })
    } else if (item instanceof IEdge) {
      return new EdgeStyleDecorationInstaller({
        edgeStyle: new PolylineEdgeStyle({
          stroke: `8px solid ${getColor(item)}`
        }),
        zoomPolicy: 'world-coordinates'
      })
    }
    return super.getInstaller(item)
  }
}

/**
 * Returns the color of the edge according to it type.
 * @param {!IEdge} edge The given edge
 * @returns {!string} The color for the edge
 */
function getColor(edge) {
  const tag = edge.tag
  if (tag && tag.fraud && !tag.type) {
    return '#ff6c00'
  }
  switch (tag.type) {
    case 'witnesses':
      return '#56926e'
    case 'involves':
      return '#db3a34'
    case 'drives':
      return '#2D4D3A'
    case 'isPassenger':
      return '#e0e04f'
    case 'represents':
      return '#242265'
    case 'heals':
      return '#4281a4'
    default:
      return '#c1c1c1'
  }
}

/**
 * Returns the fill color of the node according to its type.
 * @param {!INode} node The node
 * @returns {!string} The fill color for the node (SVG)
 */
function getFillColor(node) {
  if (node.tag.fraud) {
    return '#ff6c00'
  }
  switch (node.tag.type) {
    case 'Account Holder':
      return '#242265'
    case 'Address':
      return '#4281a4'
    case 'Phone Number':
      return '#6c4f77'
    case 'Bank Branch':
      return '#db3a34'
    case 'New Account':
      return '#f0c808'
    case 'Loan':
      return '#56926e'
    case 'Credit Card':
      return '#56926e'
    case 'Payment':
      return '#6dbc8d'
    case 'Participant':
    case 'Doctor':
    case 'Lawyer':
    case 'Car':
    case 'Accident':
      return '#c1c1c1'
    default:
      return '#e0e04f'
  }
}

/**
 * Returns the stroke color of the node according to its type.
 * @param {!INode} node The node
 * @returns {!string} The stroke color for the node (SVG)
 */
function getStrokeColor(node) {
  if (node.tag.fraud) {
    return '#ff6c00'
  }
  switch (node.tag.type) {
    case 'Account Holder':
      return '#242265'
    case 'Address':
      return '#4281a4'
    case 'Phone Number':
      return '#6c4f77'
    case 'Bank Branch':
      return '#db3a34'
    case 'New Account':
      return '#f0c808'
    case 'Loan':
      return '#56926e'
    case 'Credit Card':
      return '#56926e'
    case 'Payment':
      return '#6dbc8d'
    case 'Participant':
      return '#56926e'
    case 'Doctor':
      return '#4281a4'
    case 'Lawyer':
      return '#242265'
    case 'Car':
      return '#f0c808'
    case 'Accident':
      return '#db3a34'
    default:
      return '#e0e04f'
  }
}
