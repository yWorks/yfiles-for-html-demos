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
import {
  BaseClass,
  BridgeManager,
  CanvasComponent,
  Class,
  EdgeSelectionIndicatorInstaller,
  EdgeStyleBase,
  GeneralPath,
  GraphComponent,
  IArrow,
  IBend,
  ICanvasContext,
  IEdge,
  IInputModeContext,
  INode,
  IObstacleProvider,
  IRenderContext,
  ISelectionIndicatorInstaller,
  Point,
  PolylineEdgeStyle,
  Rect,
  Stroke,
  SvgVisual
} from 'yfiles'

import { MySimpleArrow } from './MySimpleArrow.js'

/**
 * This class is an example for a custom edge style based on {@link EdgeStyleBase}.
 */
export class MySimpleEdgeStyle extends EdgeStyleBase {
  /**
   * Initializes a new instance of the {@link MySimpleEdgeStyle} class.
   */
  constructor() {
    super()
    this.$arrows = new MySimpleArrow()
    this.$pathThickness = 3
  }

  /**
   * Gets the thickness of the edge.
   * @type {number}
   */
  get pathThickness() {
    return this.$pathThickness
  }

  /**
   * Sets the thickness of the edge.
   * @type {number}
   */
  set pathThickness(value) {
    this.$pathThickness = value
  }

  /**
   * Gets the arrows drawn at the beginning and at the end of the edge.
   * @type {!MySimpleArrow}
   */
  get arrows() {
    return this.$arrows
  }

  /**
   * Sets the arrows drawn at the beginning and at the end of the edge.
   * @type {!MySimpleArrow}
   */
  set arrows(value) {
    this.$arrows = value
  }

  /**
   * Creates the visual for an edge.
   * @see Overrides {@link EdgeStyleBase.createVisual}
   * @param {!IRenderContext} context
   * @param {!IEdge} edge
   * @returns {!SvgVisual}
   */
  createVisual(context, edge) {
    // This implementation creates a CanvasContainer and uses it for the rendering of the edge.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Get the necessary data for rendering of the edge
    const cache = this.createRenderDataCache(context, edge)
    // Render the edge
    this.render(context, edge, g, cache)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the edge using the old visual for performance reasons.
   * @see Overrides {@link EdgeStyleBase.updateVisual}
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @param {!IEdge} edge
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, edge) {
    const container = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']
    // get the data for the new visual
    const newCache = this.createRenderDataCache(context, edge)

    // check if something changed
    if (!newCache.stateEquals(oldCache)) {
      // more than only the path changed - re-render the visual
      while (container.lastChild != null) {
        // remove all children
        container.removeChild(container.lastChild)
      }
      this.render(context, edge, container, newCache)
      return oldVisual
    }

    if (!newCache.pathEquals(oldCache)) {
      // only the path changed - update the old visual
      this.updatePath(context, edge, container, newCache)
    }
    return oldVisual
  }

  /**
   * Creates an object containing all necessary data to create an edge visual.
   * @param {!IRenderContext} context
   * @param {!IEdge} edge
   * @returns {*}
   */
  createRenderDataCache(context, edge) {
    // Get the owner node's color
    const node = edge.sourcePort.owner
    let color
    const nodeStyle = node.style
    if (typeof nodeStyle.getNodeColor === 'function') {
      color = nodeStyle.getNodeColor(node)
    } else {
      color = '#0082b4'
    }

    const selection = context.canvasComponent !== null ? context.canvasComponent.selection : null
    const selected = selection !== null && selection.isSelected(edge)
    // ////////////// New in this sample ////////////////
    // The RenderDataCache now also holds information about the bridges (the obstacle hash)
    // so the edge will be re-rendered after the bridges have changed
    // Note that the cached path is the edge path *without* bridges
    return new RenderDataCache(
      this.pathThickness,
      selected,
      color,
      this.getPath(edge),
      this.arrows,
      MySimpleEdgeStyle.getObstacleHash(context)
    )
    // //////////////////////////////////////////////////
  }

  /**
   * Creates the visual appearance of an edge.
   * @param {!IRenderContext} context
   * @param {!IEdge} edge
   * @param {!SVGGElement} container
   * @param {*} cache
   */
  render(context, edge, container, cache) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    // ////////////// New in this sample ////////////////
    // the cached path is updated with bridges (if there are any)
    const gp = MySimpleEdgeStyle.createPathWithBridges(cache.path, context)
    // //////////////////////////////////////////////////

    const path = gp.createSvgPath()

    path.setAttribute('fill', 'none')
    path.setAttribute('stroke-width', cache.pathThickness.toString())
    path.setAttribute('stroke-linejoin', 'round')

    if (cache.selected) {
      // Fill for selected state
      path.setAttribute('stroke', 'rgb(255,170,15)')
      path.setAttribute('stroke-opacity', '1')
    } else {
      // Fill for non-selected state
      path.setAttribute('stroke', 'rgb(0,130,180)')
      path.setAttribute('stroke-opacity', '0.55')
    }

    container.appendChild(path)

    // add the arrows to the container
    super.addArrows(context, container, edge, cache.path, cache.arrows, cache.arrows)
  }

  /**
   * Updates the edge path data as well as the arrow positions of the visuals stored in `container`.
   * @param {!IRenderContext} context {IRenderContext}
   * @param {!IEdge} edge {IEdge}
   * @param {!SVGGElement} container {SVGElement}
   * @param {!RenderDataCache} cache {RenderDataCache}
   */
  updatePath(context, edge, container, cache) {
    // The first child must be a path - else re-create the container from scratch
    if (container.childNodes.length === 0 || !(container.childNodes[0] instanceof SVGPathElement)) {
      while (container.lastChild != null) {
        // remove all children
        container.removeChild(container.lastChild)
      }
      this.render(context, edge, container, cache)
      return
    }

    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    // ////////////// New in this sample ////////////////
    // the cached path is updated with bridges (if there are any)
    const gp = MySimpleEdgeStyle.createPathWithBridges(cache.path, context)
    // //////////////////////////////////////////////////
    const path = container.childNodes[0]

    const updatedPath = gp.createSvgPath()
    path.setAttribute('d', updatedPath.getAttribute('d'))

    // update the arrows
    super.updateArrows(context, container, edge, gp, cache.arrows, cache.arrows)
  }

  /**
   * Creates a {@link GeneralPath} from the edge's bends.
   * @param {!IEdge} edge The edge to create the path for.
   * @returns {!GeneralPath} A {@link GeneralPath} following the edge
   * @see Overrides {@link EdgeStyleBase.getPath}
   */
  getPath(edge) {
    // ////////////// New in this sample ////////////////
    // Path creation has be extracted into method CreatePath
    // Since the obstacle provider needs the path, too
    const path = MySimpleEdgeStyle.createPath(edge)
    // shorten the path in order to provide room for drawing the arrows.
    return super.cropPath(edge, this.arrows, this.arrows, path)
  }

  // //////////////////////////////////////////////////
  // ////////////// New in this sample ////////////////
  // //////////////////////////////////////////////////
  /**
   * Decorates a given path with bridges.
   * All work is delegated to the BridgeManager's addBridges() method.
   * @param {!GeneralPath} path The path to decorate.
   * @param {!IRenderContext} context The render context.
   * @returns {!GeneralPath} A copy of the given path with bridges.
   */
  static createPathWithBridges(path, context) {
    const manager = getBridgeManager(context)
    // if there is a bridge manager registered: use it to add the bridges to the path
    return manager === null ? path : manager.addBridges(context, path)
  }

  /**
   * Gets an obstacle hash from the context.
   * The obstacle hash changes if any obstacle has changed on the entire graph.
   * The hash is used to avoid re-rendering the edge if nothing has changed.
   * This method gets the obstacle hash from the BridgeManager.
   * @param {!IRenderContext} context The context to get the obstacle hash for.
   * @returns {number} A hash value which represents the state of the obstacles.
   */
  static getObstacleHash(context) {
    const manager = getBridgeManager(context)
    // get the BridgeManager from the context's lookup. If there is one
    // get a hash value which represents the current state of the obstacles.
    return manager === null ? 42 : manager.getObstacleHash(context)
  }

  // //////////////////////////////////////////////////

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   * Overridden method to include the {@link MySimpleEdgeStyle.pathThickness} and the HitTestRadius specified in the
   * context in the calculation.
   * @see Overrides {@link EdgeStyleBase.isHit}
   * @param {!IInputModeContext} canvasContext
   * @param {!Point} p
   * @param {!IEdge} edge
   * @returns {boolean}
   */
  isHit(canvasContext, p, edge) {
    // Use the convenience method in GeneralPath
    return this.getPath(edge).pathContains(
      p,
      canvasContext.hitTestRadius + this.pathThickness * 0.5
    )
  }

  /**
   * Determines whether the edge is visible in the given rectangle.
   * Overridden method to improve performance of the super implementation
   * @see Overrides {@link EdgeStyleBase.isVisible}
   * @param {!ICanvasContext} context
   * @param {!Rect} rectangle
   * @param {!IEdge} edge
   * @returns {boolean}
   */
  isVisible(context, rectangle, edge) {
    // enlarge the test rectangle to include the path thickness
    const enlargedRectangle = rectangle.getEnlarged(this.pathThickness)
    // delegate to the efficient implementation of PolylineEdgeStyle
    return helperEdgeStyle.renderer
      .getVisibilityTestable(edge, helperEdgeStyle)
      .isVisible(context, enlargedRectangle)
  }

  /**
   * This implementation of the look up provides a custom implementation of the
   * {@link ISelectionIndicatorInstaller} interface that better suits to this style.
   * @see Overrides {@link EdgeStyleBase.lookup}
   * @param {!IEdge} edge
   * @param {!Class} type
   * @returns {!object}
   */
  lookup(edge, type) {
    if (type === ISelectionIndicatorInstaller.$class) {
      return new MySelectionInstaller()
    } else if (type === IObstacleProvider.$class) {
      // //////////////////////////////////////////////////
      // ////////////// New in this sample ////////////////
      // //////////////////////////////////////////////////

      // Provide the own IObstacleProvider implementation
      return new BasicEdgeObstacleProvider(edge)

      // //////////////////////////////////////////////////
    }
    return super.lookup(edge, type)
  }

  // ////////////// New in this sample ////////////////
  // Path creation has been extracted into method CreatePath
  /**
   * Creates a general path for the locations of the ports and the bends of the edge.
   * @param {!IEdge} edge The edge.
   * @returns {!GeneralPath} A general path for the locations of the ports and the bends of the edge.
   */
  static createPath(edge) {
    const path = new GeneralPath()
    path.moveTo(edge.sourcePort.location)
    edge.bends.forEach(bend => {
      path.lineTo(bend.location)
    })
    path.lineTo(edge.targetPort.location)
    return path
  }
}

const helperEdgeStyle = new PolylineEdgeStyle({
  sourceArrow: IArrow.NONE,
  targetArrow: IArrow.NONE
})

/**
 * This customized {@link EdgeSelectionIndicatorInstaller} overrides the
 * getStroke method to return `null`, so that no edge path is rendered if the edge is selected.
 */
class MySelectionInstaller extends EdgeSelectionIndicatorInstaller {
  /**
   * @param {!CanvasComponent} canvas
   * @param {!IEdge} edge
   * @returns {?Stroke}
   */
  getStroke(canvas, edge) {
    return null
  }
}

/**
 * Saves the data which is necessary for the creation of an edge.
 */
class RenderDataCache {
  /**
   * @param {number} pathThickness
   * @param {boolean} selected
   * @param {!string} color
   * @param {!GeneralPath} generalPath
   * @param {!MySimpleArrow} arrows
   * @param {number} obstacleHash
   */
  constructor(pathThickness, selected, color, generalPath, arrows, obstacleHash) {
    // ////////////// New in this sample ////////////////
    // The obstacle hash represents the state of the obstacles in the graph.
    // If the has has been changed the position or number of obstacles has changed.
    // That means the position or number of the bridges on the edge might have to be changed accordingly.
    // Thus, the edge might have to be re-rendered.
    this.obstacleHash = obstacleHash
    this.pathThickness = pathThickness
    this.color = color
    this.selected = selected
    this.path = generalPath
    this.arrows = arrows
  }

  /**
   * @param {*} obj
   * @returns {boolean}
   */
  equals(obj) {
    return (
      obj !== null &&
      obj instanceof RenderDataCache &&
      this.pathEquals(obj) &&
      this.stateEquals(obj)
    )
  }

  /**
   * Check if the path thickness, the selection state and the arrows of this instance
   * are equals to another {@link RenderDataCache}'s properties.
   * @param {*} other
   * @returns {boolean}
   */
  stateEquals(other) {
    return (
      other.pathThickness === this.pathThickness &&
      other.selected === this.selected &&
      other.color === this.color &&
      this.arrows.equals(other.arrows) &&
      other.obstacleHash === this.obstacleHash
    )
  }

  /**
   * Check if the path of this instance is equals to another {@link RenderDataCache}'s path.
   * @param {*} other
   * @returns {boolean}
   */
  pathEquals(other) {
    return other.path.hasSameValue(this.path)
  }
}

// //////////////////////////////////////////////////
// ////////////// New in this sample ////////////////
// //////////////////////////////////////////////////
/**
 * A custom IObstacleProvider implementation for this style.
 */
class BasicEdgeObstacleProvider extends BaseClass(IObstacleProvider) {
  /**
   * @param {!IEdge} edge
   */
  constructor(edge) {
    super()
    this.edge = edge
  }

  /**
   * Returns this edge's path as obstacle.
   * Generally spoken, an obstacle is a path for which other edges
   * might have to draw bridges when crossing it.
   * @returns {!GeneralPath} The edge's path.
   * @see Specified by {@link IObstacleProvider.getObstacles}.
   * @param {!IRenderContext} canvasContext
   */
  getObstacles(canvasContext) {
    // simply delegate to CreatePath
    return MySimpleEdgeStyle.createPath(this.edge)
  }
}

/**
 * Queries the context's lookup for a BridgeManager instance.
 * @param {!IRenderContext} context The context to get the BridgeManager from.
 * @returns {?BridgeManager} The BridgeManager for the given context instance or null
 */
function getBridgeManager(context) {
  if (context) {
    return context.lookup(BridgeManager.$class)
  }
  return null
}
