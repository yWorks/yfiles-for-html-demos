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
  CanvasComponent,
  Color,
  EdgeStyleBase,
  EdgeStyleDecorationInstaller,
  GeneralPath,
  GeomUtilities,
  HighlightIndicatorManager,
  HtmlCanvasVisual,
  ICanvasContext,
  IEdge,
  IInputModeContext,
  IModelItem,
  INode,
  IRenderContext,
  NodeStyleBase,
  NodeStyleDecorationInstaller,
  Point,
  PolylineEdgeStyle,
  Rect,
  SolidColorFill,
  Stroke,
  StyleDecorationZoomPolicy,
  SvgVisual,
  Visual
} from 'yfiles'

/**
 * A simple node style that visualizes a circular node with an icon.
 */
export class IconNodeStyle extends NodeStyleBase {
  /**
   * Creates the visual for a circular node with an icon.
   * @param {IRenderContext} context The render context
   * @param {INode} node The node to which this style instance is assigned
   * @see Overrides {@link NodeStyleBase#createVisual}
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
    shape.setAttribute('cx', width)
    shape.setAttribute('cy', height)
    shape.setAttribute('rx', width)
    shape.setAttribute('ry', height)
    shape.setAttribute('fill', IconNodeStyle.getFillColor(node))
    shape.setAttribute('stroke', IconNodeStyle.getStrokeColor(node))
    shape.setAttribute('stroke-width', '2')
    g.appendChild(shape)

    // add icon
    const source = IconNodeStyle.getIconPath(node)
    if (source !== null) {
      const icon = window.document.createElementNS('http://www.w3.org/2000/svg', 'image')
      const iconWidth = nodeLayout.width * 0.6
      const iconHeight = nodeLayout.height * 0.6
      icon.setAttributeNS('http://www.w3.org/1999/xlink', 'href', source)
      icon.setAttribute('width', iconWidth)
      icon.setAttribute('height', iconHeight)
      icon.setAttribute('x', width - iconWidth * 0.5)
      icon.setAttribute('y', height - iconHeight * 0.5)
      g.appendChild(icon)
    }

    // set the location
    SvgVisual.setTranslate(g, nodeLayout.x, nodeLayout.y)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @param {IRenderContext} context The render context
   * @param {SvgVisual} oldVisual The old visual
   * @param {INode} node The node to which this style instance is assigned
   * @see Overrides {@link NodeStyleBase#updateVisual}
   */
  updateVisual(context, oldVisual, node) {
    const g = oldVisual.svgElement

    // get relevant data that might have changed
    const oldCache = g['render-data-cache']
    const newCache = IconNodeStyle.createRenderDataCache(node)

    const layout = node.layout
    // update node size
    if (!newCache.equalsSize(newCache, oldCache)) {
      const shape = g.firstElementChild
      const width = layout.width * 0.5
      const height = layout.height * 0.5
      shape.setAttribute('cx', width)
      shape.setAttribute('cy', height)
      shape.setAttribute('rx', width)
      shape.setAttribute('ry', height)

      const icon = g.lastElementChild
      const iconWidth = layout.width * 0.6
      const iconHeight = layout.height * 0.6
      icon.setAttribute('width', iconWidth)
      icon.setAttribute('height', iconHeight)
      icon.setAttribute('x', width - iconWidth * 0.5)
      icon.setAttribute('y', height - iconHeight * 0.5)
    }

    // update node color depending on the fraud state
    if (newCache.fraud !== oldCache.fraud) {
      const shape = g.firstElementChild
      shape.setAttribute('fill', IconNodeStyle.getFillColor(node))
      shape.setAttribute('stroke', IconNodeStyle.getStrokeColor(node))
    }

    // update location
    SvgVisual.setTranslate(g, layout.x, layout.y)

    g['render-data-cache'] = newCache
    return oldVisual
  }

  /**
   * Creates an object containing all necessary data to create a visual for the node.
   * @param {INode} node The node
   * @return {object} The render data cache object
   */
  static createRenderDataCache(node) {
    const layout = node.layout
    return {
      size: layout.toSize(),
      fraud: node.tag.fraud,
      equalsSize: (self, other) => self.size.equals(other.size)
    }
  }

  /**
   * Returns the resource path of the icon file according to the node's type.
   * @param {INode} node The node
   * @return {string} The resource path of the icon
   */
  static getIconPath(node) {
    switch (node.tag.type) {
      case 'Account Holder':
        return './resources/account-holder.svg'
      case 'Address':
        return './resources/address.svg'
      case 'Phone Number':
        return './resources/phone.svg'
      case 'Bank Branch':
        return './resources/bank.svg'
      case 'New Account':
        return './resources/new-account.svg'
      case 'Loan':
        return './resources/loan.svg'
      case 'Payment':
        return './resources/payment.svg'
      case 'Credit Card':
        return './resources/credit-card.svg'
      case 'Participant':
        return './resources/account-holder.svg'
      case 'Doctor':
        return './resources/doctor.svg'
      case 'Lawyer':
        return './resources/lawyer.svg'
      case 'Car':
        return './resources/car.svg'
      case 'Accident':
        return './resources/accident.svg'
      default:
        return null
    }
  }

  /**
   * Returns the fill color of the node according to its type.
   * @param {INode} node The node
   * @return {string} The fill color for the node (SVG)
   */
  static getFillColor(node) {
    if (node.tag.fraud) {
      return 'orangered'
    }
    switch (node.tag.type) {
      case 'Account Holder':
        return 'dodgerblue'
      case 'Address':
        return 'lightskyblue'
      case 'Phone Number':
        return 'plum'
      case 'Bank Branch':
        return 'salmon'
      case 'New Account':
        return 'gold'
      case 'Loan':
        return 'mediumseagreen'
      case 'Credit Card':
        return 'mediumseagreen'
      case 'Payment':
        return 'lightgreen'
      case 'Participant':
      case 'Doctor':
      case 'Lawyer':
      case 'Car':
      case 'Accident':
        return 'lightgray'
      default:
        return 'yellowgreen'
    }
  }

  /**
   * Returns the stroke color of the node according to its type.
   * @param {INode} node The node
   * @return {string} The stroke color for the node (SVG)
   */
  static getStrokeColor(node) {
    if (node.tag.fraud) {
      return 'orangered'
    }
    switch (node.tag.type) {
      case 'Account Holder':
        return 'dodgerblue'
      case 'Address':
        return 'lightskyblue'
      case 'Phone Number':
        return 'plum'
      case 'Bank Branch':
        return 'salmon'
      case 'New Account':
        return 'gold'
      case 'Loan':
        return 'mediumseagreen'
      case 'Credit Card':
        return 'mediumseagreen'
      case 'Payment':
        return 'lightgreen'
      case 'Participant':
        return 'mediumseagreen'
      case 'Doctor':
        return 'lightskyblue'
      case 'Lawyer':
        return 'dodgerblue'
      case 'Car':
        return 'gold'
      case 'Accident':
        return 'salmon'
      default:
        return 'yellowgreen'
    }
  }

  /**
   * Gets the outline of the node, an ellipse in this case.
   * @param {INode} node The given node
   * This allows for correct edge path intersection calculation, among others.
   * @see Overrides {@link NodeStyleBase#getOutline}
   */
  getOutline(node) {
    const outline = new GeneralPath()
    outline.appendEllipse(node.layout.toRect(), false)
    return outline
  }

  /**
   * Get the bounding box of the node.
   * This is used for bounding box calculations and includes the visual shadow.
   * @param {ICanvasContext} canvasContext The context to calculate the bounds for
   * @param {INode} node The given node
   * @see Overrides {@link NodeStyleBase#getBounds}
   */
  getBounds(canvasContext, node) {
    return node.layout.toRect()
  }

  /**
   * Checks if a point hits the node's bounds. Considers HitTestRadius.
   * @param {ICanvasContext} canvasContext The canvas context
   * @param {Point} point The point to test
   * @param {INode} node The given node
   * @see Overrides {@link NodeStyleBase#isHit}
   */
  isHit(canvasContext, point, node) {
    return GeomUtilities.ellipseContains(node.layout.toRect(), point, canvasContext.hitTestRadius)
  }

  /**
   * Checks if a node is inside a certain box. Considers HitTestRadius.
   * @param {IInputModeContext} context The input mode context
   * @param {Rect} box The marquee selection box
   * @param {INode} node The given node
   * @see Overrides {@link NodeStyleBase#isInBox}
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
   * @param {INode} node The given node
   * @param {Point} point The point to test
   * @see Overrides {@link NodeStyleBase#isInside}
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
   * @param {IRenderContext} context The render context
   * @param {IEdge} edge The given edge
   * @see Overrides {@link NodeStyleBase#createVisual}
   */
  createVisual(context, edge) {
    return new EdgeRenderVisual(edge)
  }

  /**
   * Updates the visual for an edge.
   * @param {IRenderContext} context The render context
   * @param {Visual} oldVisual The old visual
   * @param {IEdge} edge The given edge
   * @see Overrides {@link NodeStyleBase#createVisual}
   */
  updateVisual(context, oldVisual, edge) {
    return oldVisual
  }

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   * @param {IInputModeContext} canvasContext The input mode context
   * @param {Point} p The point to test
   * @param {IEdge} edge The edge to which this style instance is assigned
   * @return {boolean} True if the specified edge representation is hit, false otherwise
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
   * @param {IEdge} edge The given edge
   */
  constructor(edge) {
    super()
    this.edge = edge
  }

  /**
   * Paints onto the context using HTML5 Canvas operations.
   * @param {IRenderContext} context The render context
   * @param {CanvasRenderingContext2D} ctx The HTML5 Canvas context to use for rendering
   */
  paint(context, ctx) {
    ctx.save()
    ctx.beginPath()
    let location = this.edge.sourcePort.dynamicLocation
    ctx.moveTo(location.x, location.y)
    this.edge.bends.forEach(bend => {
      location = bend.location
      ctx.lineTo(location.x, location.y)
    })
    location = this.edge.targetPort.dynamicLocation
    ctx.lineTo(location.x, location.y)
    ctx.lineWidth = 5
    const color = getColor(this.edge)
    ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
    ctx.stroke()
    ctx.restore()
  }
}

/**
 * A highlight manager responsible for highlighting the fraud components.
 */
export class FraudHighlightManager extends HighlightIndicatorManager {
  /**
   * Creates a new HighlightManager for fraud.
   * @param {CanvasComponent} canvas
   */
  constructor(canvas) {
    super(canvas)
    const graphModelManager = this.canvasComponent.graphModelManager
    // the edges' highlight group should be above the nodes
    this.edgeHighlightGroup = graphModelManager.contentGroup.addGroup()
    this.edgeHighlightGroup.below(graphModelManager.nodeGroup)

    // the nodes' highlight group should be above the nodes
    this.nodeHighlightGroup = graphModelManager.contentGroup.addGroup()
    this.nodeHighlightGroup.above(graphModelManager.nodeGroup)
  }

  /**
   * This implementation always returns the highlightGroup of the canvasComponent of this instance.
   * @param {IModelItem} item The item to check
   * @return {ICanvasObjectGroup} An ICanvasObjectGroup or null
   */
  getCanvasObjectGroup(item) {
    if (IEdge.isInstance(item)) {
      return this.edgeHighlightGroup
    } else if (INode.isInstance(item)) {
      return this.nodeHighlightGroup
    }
    return super.getCanvasObjectGroup(item)
  }

  /**
   * Callback used by install to retrieve the installer for a given item.
   * @param {IModelItem} item The item to find an installer for
   * @returns {ICanvasObjectInstaller}
   */
  getInstaller(item) {
    if (INode.isInstance(item)) {
      const nodeDecorationInstaller = new NodeStyleDecorationInstaller({
        margins: 2,
        zoomPolicy: StyleDecorationZoomPolicy.MIXED,
        nodeStyle: new IconNodeStyle()
      })
      return nodeDecorationInstaller
    } else if (IEdge.isInstance(item)) {
      const fill = new SolidColorFill(getColor(item))
      return new EdgeStyleDecorationInstaller({
        edgeStyle: new PolylineEdgeStyle({
          stroke: new Stroke(fill, 8)
        }),
        zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
      })
    }
    return super.getInstaller(item)
  }
}

/**
 * Returns the color of the edge according to it type.
 * @param {IEdge} edge The given edge
 * @return {Color} The color for the edge
 */
function getColor(edge) {
  const tag = edge.tag
  if (tag && tag.fraud && !tag.type) {
    return Color.ORANGE_RED
  }
  switch (tag.type) {
    case 'witnesses':
      return Color.MEDIUM_SEA_GREEN
    case 'involves':
      return Color.SALMON
    case 'drives':
      return Color.DARK_SEA_GREEN
    case 'isPassenger':
      return Color.YELLOW_GREEN
    case 'represents':
      return Color.DODGER_BLUE
    case 'heals':
      return Color.LIGHT_SKY_BLUE
    default:
      return Color.LIGHT_GRAY
  }
}
