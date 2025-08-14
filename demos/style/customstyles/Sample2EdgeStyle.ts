/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Arrow,
  ArrowType,
  BaseClass,
  BridgeManager,
  type Constructor,
  EdgeStyleBase,
  GeneralPath,
  IArrow,
  ICanvasContext,
  IEdge,
  IInputModeContext,
  ILookup,
  INode,
  IObstacleProvider,
  IRenderContext,
  ISvgDefsCreator,
  MarkupExtension,
  Point,
  Rect,
  SvgVisual,
  type TaggedSvgVisual
} from '@yfiles/yfiles'
import { type ColorSetName, isColorSetName } from '@yfiles/demo-resources/demo-styles'
import { Sample2Arrow } from './Sample2Arrow'
import { SVGNS } from './Namespaces'

type EdgeRenderDataCache = { path: GeneralPath; obstacleHash: number }

/**
 * The type of the type argument of the creatVisual and updateVisual methods of the style implementation.
 */
type Sample1EdgeStyleVisual = TaggedSvgVisual<SVGGElement | SVGPathElement, EdgeRenderDataCache>

/**
 * A custom demo edge style whose colors match the given well-known CSS style.
 */
export class Sample2EdgeStyle extends EdgeStyleBase<Sample1EdgeStyleVisual> {
  private hiddenArrow: Arrow = new Arrow({ type: ArrowType.NONE, cropLength: 6 })
  private fallbackArrow: Sample2Arrow = new Sample2Arrow()
  private markerDefsSupport: MarkerDefsSupport | null = null
  showTargetArrows = true
  useMarkerArrows = true

  constructor(public cssClass?: string | ColorSetName) {
    super()
  }

  /**
   * Helper function to crop a {@link GeneralPath} by the length of the used arrow.
   */
  private cropRenderedPath(edge: IEdge, gp: GeneralPath | null): GeneralPath | null {
    if (!gp) {
      return null
    }
    if (this.showTargetArrows) {
      const dummyArrow = this.useMarkerArrows ? this.hiddenArrow : this.fallbackArrow
      return this.cropPath(edge, IArrow.NONE, dummyArrow, gp)!
    }
    return this.cropPath(edge, IArrow.NONE, IArrow.NONE, gp)!
  }

  /**
   * Creates the visual for an edge.
   */
  createVisual(renderContext: IRenderContext, edge: IEdge): Sample1EdgeStyleVisual | null {
    let renderPath = this.createPath(edge)
    // crop the path such that the arrow tip is at the end of the edge
    renderPath = this.cropRenderedPath(edge, renderPath)

    if (!renderPath || renderPath.getLength() === 0) {
      return null
    }

    const gp = this.createPathWithBridges(renderPath, renderContext)

    const path = document.createElementNS(SVGNS, 'path')
    const pathData = gp.size === 0 ? '' : gp.createSvgPathData()
    path.setAttribute('d', pathData)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', '#662b00')
    path.setAttribute('stroke-width', '1.5px')

    if (this.cssClass) {
      if (isColorSetName(this.cssClass)) {
        path.setAttribute('class', `${this.cssClass}-edge`)
        this.fallbackArrow.cssClass = this.cssClass
      } else {
        path.setAttribute('class', this.cssClass)
        this.fallbackArrow.cssClass = `${this.cssClass}-arrow`
      }
    }

    if (this.useMarkerArrows) {
      this.showTargetArrows &&
        path.setAttribute(
          'marker-end',
          'url(#' + renderContext.getDefsId(this.createMarker()) + ')'
        )

      return SvgVisual.from(path, {
        path: renderPath,
        obstacleHash: this.getObstacleHash(renderContext)
      })
    }

    // use yFiles arrows instead of markers
    const container = document.createElementNS(SVGNS, 'g')
    container.appendChild(path)
    this.showTargetArrows &&
      super.addArrows(renderContext, container, edge, gp, IArrow.NONE, this.fallbackArrow)

    return SvgVisual.from(container, {
      path: renderPath,
      obstacleHash: this.getObstacleHash(renderContext)
    })
  }

  /**
   * Re-renders the edge by updating the old visual for improved performance.
   */
  updateVisual(
    renderContext: IRenderContext,
    oldVisual: Sample1EdgeStyleVisual,
    edge: IEdge
  ): Sample1EdgeStyleVisual | null {
    if (oldVisual === null) {
      return this.createVisual(renderContext, edge)
    }

    let renderPath = this.createPath(edge)
    if (!renderPath || renderPath.getLength() === 0) {
      return null
    }
    // crop the path such that the arrow tip is at the end of the edge
    renderPath = this.cropRenderedPath(edge, renderPath)
    const newObstacleHash = this.getObstacleHash(renderContext)

    const path = oldVisual.svgElement
    const cache = oldVisual.tag
    if (
      renderPath &&
      (!renderPath.hasSameValue(cache.path) || cache.obstacleHash !== newObstacleHash)
    ) {
      cache.path = renderPath
      cache.obstacleHash = newObstacleHash
      const gp = this.createPathWithBridges(renderPath, renderContext)
      const pathData = gp.size === 0 ? '' : gp.createSvgPathData()
      if (this.useMarkerArrows) {
        // update code for marker arrows
        path.setAttribute('d', pathData)
        return oldVisual
      } else {
        // update code for yFiles arrows
        const container = oldVisual.svgElement as SVGGElement
        const path = container.childNodes.item(0) as SVGPathElement
        path.setAttribute('d', pathData)
        while (container.childElementCount > 1) {
          container.removeChild(container.lastChild!)
        }
        this.showTargetArrows &&
          super.addArrows(renderContext, container, edge, gp, IArrow.NONE, this.fallbackArrow)
      }
    }
    return oldVisual
  }

  /**
   * Creates the path of an edge.
   */
  private createPath(edge: IEdge): GeneralPath | null {
    if (
      edge.sourcePort &&
      edge.targetPort &&
      edge.sourcePort.owner === edge.targetPort.owner &&
      edge.bends.size < 2
    ) {
      // pretty self loops
      let outerX: number, outerY: number
      if (edge.bends.size === 1) {
        const bendLocation = edge.bends.get(0).location
        outerX = bendLocation.x
        outerY = bendLocation.y
      } else {
        if (edge.sourcePort.owner instanceof INode) {
          outerX = edge.sourcePort.owner.layout.x - 20
          outerY = edge.sourcePort.owner.layout.y - 20
        } else {
          const sourcePortLocation = edge.sourcePort.locationParameter.model.getLocation(
            edge.sourcePort,
            edge.sourcePort.locationParameter
          )
          outerX = sourcePortLocation.x - 20
          outerY = sourcePortLocation.y - 20
        }
      }
      const path = new GeneralPath(4)
      const sourceLocation = edge.sourcePort.locationParameter.model.getLocation(
        edge.sourcePort,
        edge.sourcePort.locationParameter
      )
      path.moveTo(sourceLocation)
      path.lineTo(outerX, sourceLocation.y)
      path.lineTo(outerX, outerY)
      const targetLocation = edge.targetPort.locationParameter.model.getLocation(
        edge.targetPort,
        edge.targetPort.locationParameter
      )
      path.lineTo(targetLocation.x, outerY)
      path.lineTo(targetLocation)
      return path
    }
    return super.getPath(edge)
  }

  /**
   * Gets the path of the edge cropped at the node border.
   */
  getPath(edge: IEdge): GeneralPath | null {
    const path = this.createPath(edge)
    // crop path at node border
    return path ? this.cropPath(edge, IArrow.NONE, IArrow.NONE, path) : null
  }

  /**
   * Decorates a given path with bridges.
   * All work is delegated to the BridgeManager's addBridges() method.
   * @param path The path to decorate.
   * @param context The render context.
   * @returns A copy of the given path with bridges.
   */
  createPathWithBridges(path: GeneralPath, context: IRenderContext): GeneralPath {
    const manager = this.getBridgeManager(context)
    // if there is a bridge manager registered: use it to add the bridges to the path
    return manager === null ? path : manager.addBridges(context, path, null)
  }

  /**
   * Gets an obstacle hash from the context.
   * The obstacle hash changes if any obstacle has changed on the entire graph.
   * The hash is used to avoid re-rendering the edge if nothing has changed.
   * This method gets the obstacle hash from the BridgeManager.
   * @param context The context to get the obstacle hash for.
   * @returns A hash value which represents the state of the obstacles.
   */
  getObstacleHash(context: IRenderContext): number {
    const manager = this.getBridgeManager(context)
    // get the BridgeManager from the context's lookup. If there is one
    // get a hash value which represents the current state of the obstacles.
    return manager === null ? 42 : manager.getObstacleHash(context)
  }

  /**
   * Queries the context's lookup for a BridgeManager instance.
   * @param context The context to get the BridgeManager from.
   * @returns The BridgeManager for the given context instance or null
   */
  getBridgeManager(context: IRenderContext): BridgeManager | null {
    return context.lookup(BridgeManager)
  }

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   */
  isHit(inputModeContext: IInputModeContext, p: Point, edge: IEdge): boolean {
    if (
      (edge.sourcePort != null &&
        edge.targetPort != null &&
        edge.sourcePort.owner === edge.targetPort.owner &&
        edge.bends.size < 2) ||
      super.isHit(inputModeContext, p, edge)
    ) {
      const path = this.getPath(edge)
      return path !== null && path.pathContains(p, inputModeContext.hitTestRadius + 1)
    }
    return false
  }

  /**
   * Determines whether the edge visual is visible or not.
   */
  isVisible(canvasContext: ICanvasContext, clip: Rect, edge: IEdge): boolean {
    if (
      edge.sourcePort != null &&
      edge.targetPort != null &&
      edge.sourcePort.owner === edge.targetPort.owner &&
      edge.bends.size < 2
    ) {
      // handle self-loops
      const spl = edge.sourcePort.locationParameter.model.getLocation(
        edge.sourcePort,
        edge.sourcePort.locationParameter
      )
      const tpl = edge.targetPort.locationParameter.model.getLocation(
        edge.targetPort,
        edge.targetPort.locationParameter
      )
      if (clip.contains(spl)) {
        return true
      }

      let outerX: number, outerY: number
      if (edge.bends.size === 1) {
        const bendLocation = edge.bends.get(0).location
        outerX = bendLocation.x
        outerY = bendLocation.y
      } else {
        if (edge.sourcePort.owner instanceof INode) {
          outerX = edge.sourcePort.owner.layout.x - 20
          outerY = edge.sourcePort.owner.layout.y - 20
        } else {
          const sourcePortLocation = edge.sourcePort.locationParameter.model.getLocation(
            edge.sourcePort,
            edge.sourcePort.locationParameter
          )
          outerX = sourcePortLocation.x - 20
          outerY = sourcePortLocation.y - 20
        }
      }

      // intersect the self-loop lines with the clip
      return (
        clip.intersectsLine(spl, new Point(outerX, spl.y)) ||
        clip.intersectsLine(new Point(outerX, spl.y), new Point(outerX, outerY)) ||
        clip.intersectsLine(new Point(outerX, outerY), new Point(tpl.x, outerY)) ||
        clip.intersectsLine(new Point(tpl.x, outerY), tpl)
      )
    }

    return super.isVisible(canvasContext, clip, edge)
  }

  /**
   * Helper method to let the svg marker be created by the {@link ISvgDefsCreator} implementation.
   */
  private createMarker(): ISvgDefsCreator {
    if (this.markerDefsSupport === null) {
      this.markerDefsSupport = new MarkerDefsSupport(this.cssClass)
    }
    return this.markerDefsSupport
  }

  /**
   * This implementation of the look-up provides a custom implementation of the
   * {@link IObstacleProvider} to support bridges.
   * @see Overrides {@link EdgeStyleBase.lookup}
   */
  lookup(edge: IEdge, type: Constructor<any>): object {
    return type === IObstacleProvider
      ? new BasicEdgeObstacleProvider(edge)
      : super.lookup(edge, type)
  }
}

/**
 * Manages the arrow markers as SVG definitions.
 */
export class MarkerDefsSupport extends BaseClass(ISvgDefsCreator) {
  constructor(public cssClass?: string | ColorSetName) {
    super()
  }

  /**
   * Creates a defs-element.
   */
  createDefsElement(context: ICanvasContext): SVGElement {
    const markerElement = document.createElementNS(SVGNS, 'marker')
    markerElement.setAttribute('viewBox', '0 0 15 10')
    markerElement.setAttribute('refX', '5')
    markerElement.setAttribute('refY', '5')
    markerElement.setAttribute('markerWidth', '7')
    markerElement.setAttribute('markerHeight', '7')
    markerElement.setAttribute('orient', 'auto')

    const path = document.createElementNS(SVGNS, 'path')
    path.setAttribute('d', 'M 0 0 L 15 5 L 0 10 z')
    path.setAttribute('fill', '#662b00')

    if (this.cssClass) {
      const attribute = isColorSetName(this.cssClass)
        ? `${this.cssClass}-edge-arrow`
        : `${this.cssClass}-arrow`
      path.setAttribute('class', attribute)
    }

    markerElement.appendChild(path)
    return markerElement
  }

  /**
   * Checks if the specified node references the element represented by this object.
   */
  accept(context: ICanvasContext, node: Node, id: string): boolean {
    return node.nodeType !== Node.ELEMENT_NODE
      ? false
      : ISvgDefsCreator.isAttributeReference(node as Element, 'marker-end', id)
  }

  /**
   * Updates the defs element with the current gradient data.
   */
  updateDefsElement(context: ICanvasContext, oldElement: SVGElement): void {
    // Nothing to do here
  }
}

/**
 * A custom {@link IObstacleProvider} implementation for {@link Sample2EdgeStyle}.
 */
class BasicEdgeObstacleProvider extends BaseClass(IObstacleProvider) {
  constructor(private edge: IEdge) {
    super()
  }

  /**
   * Returns this edge's path as obstacle.
   * @returns The edge's path.
   */
  getObstacles(canvasContext: IRenderContext): GeneralPath | null {
    return this.edge.style.renderer.getPathGeometry(this.edge, this.edge.style).getPath()
  }
}

export class Sample2EdgeStyleExtension extends MarkupExtension {
  private _cssClass = ''
  private _showTargetArrows = true
  private _useMarkerArrows = true

  get cssClass(): string {
    return this._cssClass
  }

  set cssClass(value: string) {
    this._cssClass = value
  }

  get showTargetArrows(): boolean {
    return this._showTargetArrows
  }

  set showTargetArrows(value: boolean) {
    this._showTargetArrows = value
  }

  get useMarkerArrows(): boolean {
    return this._useMarkerArrows
  }

  set useMarkerArrows(value: boolean) {
    this._useMarkerArrows = value
  }

  provideValue(serviceProvider: ILookup): Sample2EdgeStyle {
    const style = new Sample2EdgeStyle()
    style.cssClass = this.cssClass
    style.showTargetArrows = this.showTargetArrows
    style.useMarkerArrows = this.useMarkerArrows
    return style
  }
}
