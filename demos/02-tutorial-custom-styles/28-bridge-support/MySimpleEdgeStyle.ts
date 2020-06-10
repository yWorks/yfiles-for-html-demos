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
/* eslint-disable @typescript-eslint/no-explicit-any */
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

import MySimpleArrow from './MySimpleArrow'
import MySimpleNodeStyle from './MySimpleNodeStyle'

/**
 * This class is an example for a custom edge style based on {@link EdgeStyleBase}.
 */
export default class MySimpleEdgeStyle extends EdgeStyleBase {
  private $arrows: MySimpleArrow
  private $pathThickness: number

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
   */
  get pathThickness(): number {
    return this.$pathThickness
  }

  /**
   * Sets the thickness of the edge.
   */
  set pathThickness(value: number) {
    this.$pathThickness = value
  }

  /**
   * Gets the arrows drawn at the beginning and at the end of the edge.
   */
  get arrows(): MySimpleArrow {
    return this.$arrows
  }

  /**
   * Sets the arrows drawn at the beginning and at the end of the edge.
   */
  set arrows(value: MySimpleArrow) {
    this.$arrows = value
  }

  /**
   * Creates the visual for an edge.
   * @see Overrides {@link EdgeStyleBase#createVisual}
   */
  createVisual(context: IRenderContext, edge: IEdge): SvgVisual {
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
   * @see Overrides {@link EdgeStyleBase#updateVisual}
   */
  updateVisual(context: IRenderContext, oldVisual: SvgVisual, edge: IEdge): SvgVisual {
    const container = oldVisual.svgElement as SVGGElement
    // get the data with which the oldvisual was created
    const oldCache = (container as any)['data-renderDataCache']
    // get the data for the new visual
    const newCache = this.createRenderDataCache(context, edge)

    // check if something changed
    if (!newCache.stateEquals(oldCache)) {
      // more than only the path changed - re-render the visual
      while (container.firstChild) {
        container.removeChild(container.firstChild!)
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
   */
  createRenderDataCache(context: IRenderContext, edge: IEdge): any {
    // Get the owner node's color
    const node = edge.sourcePort!.owner as INode
    let color: string
    const nodeStyle = node.style as MySimpleNodeStyle
    if (typeof nodeStyle.getNodeColor === 'function') {
      color = nodeStyle.getNodeColor(node)
    } else {
      color = '#0082b4'
    }

    const selection =
      context.canvasComponent !== null
        ? (context.canvasComponent as GraphComponent).selection
        : null
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
   */
  render(context: IRenderContext, edge: IEdge, container: SVGGElement, cache: any): void {
    // store information with the visual on how we created it
    ;(container as any)['data-renderDataCache'] = cache

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
   * Updates the edge path data as well as the arrow positions of the visuals stored in <param name="container" />.
   * @param context {IRenderContext}
   * @param edge {IEdge}
   * @param container {SVGElement}
   * @param cache {RenderDataCache}
   */
  updatePath(
    context: IRenderContext,
    edge: IEdge,
    container: SVGGElement,
    cache: RenderDataCache
  ): void {
    // The first child must be a path - else re-create the container from scratch
    if (container.childNodes.length === 0 || !(container.childNodes[0] instanceof SVGPathElement)) {
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
      this.render(context, edge, container, cache)
      return
    }

    // store information with the visual on how we created it
    ;(container as any)['data-renderDataCache'] = cache

    // ////////////// New in this sample ////////////////
    // the cached path is updated with bridges (if there are any)
    const gp = MySimpleEdgeStyle.createPathWithBridges(cache.path, context)
    // //////////////////////////////////////////////////
    const path = container.childNodes[0] as SVGElement

    const updatedPath = gp.createSvgPath()
    path.setAttribute('d', updatedPath.getAttribute('d')!)

    // update the arrows
    super.updateArrows(context, container, edge, gp, cache.arrows, cache.arrows)
  }

  /**
   * Creates a {@link GeneralPath} from the edge's bends.
   * @param edge The edge to create the path for.
   * @return A {@link GeneralPath} following the edge
   * @see Overrides {@link EdgeStyleBase#getPath}
   */
  getPath(edge: IEdge): GeneralPath {
    // ////////////// New in this sample ////////////////
    // Path creation has be extracted into method CreatePath
    // Since the obstacle provider needs the path, too
    const path: GeneralPath = MySimpleEdgeStyle.createPath(edge)
    // shorten the path in order to provide room for drawing the arrows.
    return super.cropPath(edge, this.arrows, this.arrows, path)!
  }

  // //////////////////////////////////////////////////
  // ////////////// New in this sample ////////////////
  // //////////////////////////////////////////////////
  /**
   * Decorates a given path with bridges.
   * All work is delegated to the BridgeManager's addBridges() method.
   * @param path The path to decorate.
   * @param context The render context.
   * @return A copy of the given path with bridges.
   */
  static createPathWithBridges(path: GeneralPath, context: IRenderContext): GeneralPath {
    const manager = getBridgeManager(context)
    // if there is a bridge manager registered: use it to add the bridges to the path
    return manager === null ? path : manager.addBridges(context, path)
  }

  /**
   * Gets an obstacle hash from the context.
   * The obstacle hash changes if any obstacle has changed on the entire graph.
   * The hash is used to avoid re-rendering the edge if nothing has changed.
   * This method gets the obstacle hash from the BridgeManager.
   * @param context The context to get the obstacle hash for.
   * @return A hash value which represents the state of the obstacles.
   */
  static getObstacleHash(context: IRenderContext): number {
    const manager = getBridgeManager(context)
    // get the BridgeManager from the context's lookup. If there is one
    // get a hash value which represents the current state of the obstacles.
    return manager === null ? 42 : manager.getObstacleHash(context)
  }

  // //////////////////////////////////////////////////

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   * Overridden method to include the {@link MySimpleEdgeStyle#pathThickness} and the HitTestRadius specified in the
   * context in the calculation.
   * @see Overrides {@link EdgeStyleBase#isHit}
   */
  isHit(canvasContext: IInputModeContext, p: Point, edge: IEdge): boolean {
    // Use the convenience method in GeneralPath
    return this.getPath(edge).pathContains(
      p,
      canvasContext.hitTestRadius + this.pathThickness * 0.5
    )
  }

  /**
   * Determines whether the edge is visible in the given rectangle.
   * Overridden method to improve performance of the super implementation
   * @see Overrides {@link EdgeStyleBase#isVisible}
   */
  isVisible(context: ICanvasContext, rectangle: Rect, edge: IEdge): boolean {
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
   * @see Overrides {@link EdgeStyleBase#lookup}
   */
  lookup(edge: IEdge, type: Class): object {
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
    return super.lookup.call(this, edge, type)
  }

  // ////////////// New in this sample ////////////////
  // Path creation has been extracted into method CreatePath
  /**
   * Creates a general path for the locations of the ports and the bends of the edge.
   * @param edge The edge.
   * @return A general path for the locations of the ports and the bends of the edge.
   */
  static createPath(edge: IEdge): GeneralPath {
    const path = new GeneralPath()
    path.moveTo(edge.sourcePort!.location)
    edge.bends.forEach((bend: IBend): void => {
      path.lineTo(bend.location)
    })
    path.lineTo(edge.targetPort!.location)
    return path
  }
}

const helperEdgeStyle = new PolylineEdgeStyle({
  sourceArrow: IArrow.NONE,
  targetArrow: IArrow.NONE
})

/**
 * This customized {@link EdgeSelectionIndicatorInstaller} overrides the
 * getStroke method to return <code>null</code>, so that no edge path is rendered if the edge is selected.
 */
class MySelectionInstaller extends EdgeSelectionIndicatorInstaller {
  getStroke(canvas: CanvasComponent, edge: IEdge): Stroke | null {
    return null
  }
}

/**
 * Saves the data which is necessary for the creation of an edge.
 */
class RenderDataCache {
  obstacleHash: number
  pathThickness: number
  color: string
  selected: boolean
  path: GeneralPath
  arrows: MySimpleArrow

  constructor(
    pathThickness: number,
    selected: boolean,
    color: string,
    generalPath: GeneralPath,
    arrows: MySimpleArrow,
    obstacleHash: number
  ) {
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

  equals(obj: any): boolean {
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
   */
  stateEquals(other: any): boolean {
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
   */
  pathEquals(other: any): boolean {
    return other.path.hasSameValue(this.path)
  }
}

// //////////////////////////////////////////////////
// ////////////// New in this sample ////////////////
// //////////////////////////////////////////////////
/**
 * A custom IObstacleProvider implementation for this style.
 */
class BasicEdgeObstacleProvider extends BaseClass<IObstacleProvider>(IObstacleProvider)
  implements IObstacleProvider {
  edge: IEdge

  constructor(edge: IEdge) {
    super()
    this.edge = edge
  }

  /**
   * Returns this edge's path as obstacle.
   * Generally spoken, an obstacle is a path for which other edges
   * might have to draw bridges when crossing it.
   * @return The edge's path.
   * @see Specified by {@link IObstacleProvider#getObstacles}.
   */
  getObstacles(canvasContext: IRenderContext): GeneralPath {
    // simply delegate to CreatePath
    return MySimpleEdgeStyle.createPath(this.edge)
  }
}

/**
 * Queries the context's lookup for a BridgeManager instance.
 * @param context The context to get the BridgeManager from.
 * @return The BridgeManager for the given context instance or null
 */
function getBridgeManager(context: IRenderContext): BridgeManager | null {
  if (context) {
    const tmp = context.lookup(BridgeManager.$class)
    return tmp instanceof BridgeManager ? tmp : null
  }
  return null
}
