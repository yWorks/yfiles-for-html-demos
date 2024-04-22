/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgeStyleBase,
  GeneralPath,
  GraphComponent,
  ICanvasContext,
  IEdge,
  IGraph,
  IInputModeContext,
  IRenderContext,
  Point,
  Rect,
  SvgVisual,
  Visual,
  YObject
} from 'yfiles'
import { ChordDiagramLayout } from './ChordDiagramLayout'

export type EdgeStyleHints = {
  circleCenter: Point
  sourceStart: Point
  sourceEnd: Point
  targetStart: Point
  targetEnd: Point
}

const SVG_NS = 'http://www.w3.org/2000/svg'
const STROKE_WIDTH = 2

/**
 * A custom edge style that draws the edges of a chord diagram.
 */
export class ChordEdgeStyle extends EdgeStyleBase {
  /**
   * Specifies whether to show the information about the underlying graph
   */
  public showStyleHints = false

  // opacity of edges if not further specified
  static defaultOpacity = 0.8

  constructor(graph: IGraph) {
    super()
    // prepare the style hints that need to be provided by the layout
    graph.mapperRegistry.createMapper(
      IEdge.$class,
      YObject.$class,
      ChordDiagramLayout.STYLE_HINT_KEY
    )
  }

  /**
   * Creates the visual appearance of an edge.
   */
  private render(
    edge: IEdge,
    container: SVGElement & { 'data-renderDataCache'?: EdgeRenderDataCache },
    cache: EdgeRenderDataCache
  ) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    const center = ChordDiagramLayout.CENTER
    const radius = ChordDiagramLayout.RADIUS

    // the arc where the edge touches the node
    const sourceArc =
      ` M ${cache.sourceEnd.x} ${cache.sourceEnd.y}` +
      ` A ${radius} ${radius} 0 0 0 ${cache.sourceStart.x} ${cache.sourceStart.y}`
    // the curve to the target node
    const bezierToTarget = ` Q ${center.x} ${center.y}, ${cache.targetEnd.x} ${cache.targetEnd.y}`
    // the arc where the edge touches the target node
    const targetArc = ` A ${radius} ${radius} 0 0 0 ${cache.targetStart.x} ${cache.targetStart.y}`
    // the curve back to the beginning
    const bezierToSource = ` Q ${center.x} ${center.y}, ${cache.sourceEnd.x} ${cache.sourceEnd.y}`
    // combine all curves and arcs into the shape that will describe the edge
    const wholePath = document.createElementNS(SVG_NS, 'path')
    wholePath.setAttribute('d', sourceArc + bezierToTarget + targetArc + bezierToSource + ' Z')
    wholePath.setAttribute('fill', edge.tag.color)
    wholePath.setAttribute('stroke', 'black')
    wholePath.setAttribute('stroke-width', String(STROKE_WIDTH))
    wholePath.setAttribute(
      'opacity',
      typeof edge.tag.opacity == 'undefined' ? ChordEdgeStyle.defaultOpacity : edge.tag.opacity
    )
    wholePath.setAttribute('fill-rule', 'even-odd')

    // construct a linear gradient between the source and target node color and add it to the svg
    const defs = document.createElementNS(SVG_NS, 'defs')
    const gradient = document.createElementNS(SVG_NS, 'linearGradient')

    const color1 = edge.sourcePort?.owner?.tag.color
    const color2 = edge.targetPort?.owner?.tag.color

    // stop information for the <linearGradient>
    const stops = [
      { color: color1, offset: '30%' },
      { color: color2, offset: '70%' }
    ]

    // appends <stop> elements to the <linearGradient>
    for (let i = 0, length = stops.length; i < length; i++) {
      const stop = document.createElementNS(SVG_NS, 'stop')
      stop.setAttribute('offset', stops[i].offset)
      stop.setAttribute('stop-color', stops[i].color)
      gradient.appendChild(stop)
    }

    // center of the edge at source
    const sourcePoint = new Point(
      (cache.sourceStart.x + cache.sourceEnd.x) / 2,
      (cache.sourceStart.y + cache.sourceEnd.y) / 2
    )
    // center of the edge at target
    const targetPoint = new Point(
      (cache.targetStart.x + cache.targetEnd.x) / 2,
      (cache.targetStart.y + cache.targetEnd.y) / 2
    )

    const deltaY = sourcePoint.y - targetPoint.y
    const deltaX = targetPoint.x - sourcePoint.x
    const result = Math.atan2(deltaY, deltaX)
    let ang = result < 0 ? Math.PI * 2 + result : result
    ang -= Math.PI / 2

    // compute the positions as percentages
    const x1 = Math.round(50 + Math.sin(ang) * 50) / 100
    const y1 = Math.round(50 + Math.cos(ang) * 50) / 100
    const x2 = Math.round(50 + Math.sin(ang + Math.PI) * 50) / 100
    const y2 = Math.round(50 + Math.cos(ang + Math.PI) * 50) / 100

    gradient.setAttribute('x1', String(x1))
    gradient.setAttribute('x2', String(x2))
    gradient.setAttribute('y1', String(y1))
    gradient.setAttribute('y2', String(y2))

    // reference the gradient by its colors
    gradient.id = `Gradient_${color1}_${color2}`

    defs.appendChild(gradient)

    // set the gradient id to the edge path
    wholePath.setAttribute('fill', `url(#Gradient_${color1}_${color2})`)

    container.appendChild(defs)

    container.appendChild(wholePath)

    // displays information about what information the layoutGraph provided
    if (this.showStyleHints) {
      wholePath.setAttribute('opacity', '0.1')
      const line = document.createElementNS(SVG_NS, 'line')
      line.setAttribute('x1', `${edge.sourcePort!.location.x}`)
      line.setAttribute('y1', `${edge.sourcePort!.location.y}`)
      line.setAttribute('x2', `${edge.targetPort!.location.x}`)
      line.setAttribute('y2', `${edge.targetPort!.location.y}`)
      line.setAttribute('stroke', 'black')
      line.setAttribute('stroke-width', '3px')
      container.appendChild(line)
    } else {
      wholePath.setAttribute(
        'opacity',
        typeof edge.tag.opacity == 'undefined' ? ChordEdgeStyle.defaultOpacity : edge.tag.opacity
      )
    }

    // if the edge is highlighted, display a dotted outline
    if (edge.tag.highlighted) {
      wholePath.setAttribute('opacity', '1')
      wholePath.setAttribute('stroke-width', String(STROKE_WIDTH))
      wholePath.setAttribute('stroke-dasharray', '4')
    }
  }

  /**
   * Creates the visualization of an edge in a chord diagram.
   */
  createVisual(context: IRenderContext, edge: IEdge): SvgVisual {
    // This implementation creates a CanvasContainer and uses it for the rendering of the edge.
    const g = document.createElementNS(SVG_NS, 'g')
    // Get the necessary data for rendering of the edge
    const hint = ChordEdgeStyle.getStyleHint(context, edge)
    const cache = new EdgeRenderDataCache(
      hint.sourceStart,
      hint.sourceEnd,
      hint.targetStart,
      hint.targetEnd,
      hint.circleCenter,
      edge.tag.highlighted,
      edge.tag.opacity,
      this.showStyleHints
    )
    // Render the edge
    this.render(edge, g, cache)
    return new SvgVisual(g)
  }

  /**
   * It is generally recommended for performance reasons to avoid creating new Visuals and instead
   * update the existing one. Since chord diagrams are generally small, we will make ado
   * with at least checking whether the visualisation for the edge will not change at all and re-create
   * it otherwise.
   */
  protected updateVisual(
    context: IRenderContext,
    oldVisual: SvgVisual,
    edge: IEdge
  ): Visual | null {
    const container = oldVisual.svgElement as SVGGElement & {
      'data-renderDataCache'?: EdgeRenderDataCache
    }
    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']

    // create the data for the new visual
    const hint = ChordEdgeStyle.getStyleHint(context, edge)
    const newCache = new EdgeRenderDataCache(
      hint.sourceStart,
      hint.sourceEnd,
      hint.targetStart,
      hint.targetEnd,
      hint.circleCenter,
      edge.tag.highlighted,
      edge.tag.opacity,
      this.showStyleHints
    )

    // if nothing changed, reuse old visual, else rebuild
    return newCache.equals(oldCache) ? oldVisual : this.createVisual(context, edge)
  }

  /**
   * Determines if the given location lies on the visualization of an edge in a chord diagram.
   */
  isHit(context: IInputModeContext, location: Point, edge: IEdge): boolean {
    // approximation of the edge outline by Bézier curves
    const hint = ChordEdgeStyle.getStyleHint(context, edge)
    const path = new GeneralPath()
    path.moveTo(hint.sourceStart)
    path.quadTo(edge.sourceNode!.layout.center, hint.sourceEnd)
    path.quadTo(hint.circleCenter, hint.targetStart)
    path.quadTo(edge.targetNode!.layout.center, hint.targetEnd)
    path.quadTo(hint.circleCenter, hint.sourceStart)
    path.close()

    return path.areaContains(location)
  }

  /**
   * Determines whether the edge is to be drawn at all. Because the edge visualization differs
   * from the straight line that makes up the 'real' edge, this implementation checks
   * instead if the bounding box of the circle and the viewport overlap.
   */
  protected isVisible(context: ICanvasContext, rectangle: Rect, edge: IEdge): boolean {
    const hint = ChordEdgeStyle.getStyleHint(context, edge)
    const radius = Math.abs(hint.circleCenter.distanceTo(hint.sourceStart))
    const bounding = new Rect(
      hint.circleCenter.x - radius,
      hint.circleCenter.y - radius,
      radius * 2,
      radius * 2
    )
    return bounding.intersects(rectangle)
  }

  /**
   * Gets the hint object that the layout has provided.
   */
  private static getStyleHint(context: ICanvasContext, edge: IEdge): EdgeStyleHints {
    const graphComponent = context.canvasComponent as GraphComponent
    const mapper = graphComponent.graph.mapperRegistry.getMapper<IEdge, EdgeStyleHints>(
      ChordDiagramLayout.STYLE_HINT_KEY
    )
    return mapper!.get(edge)!
  }
}

class EdgeRenderDataCache {
  constructor(
    public readonly sourceStart: Point,
    public readonly sourceEnd: Point,
    public readonly targetStart: Point,
    public readonly targetEnd: Point,
    public readonly circleCenter: Point,
    public readonly highlighted: boolean,
    public readonly opacity: number,
    public readonly showStyleHints: boolean
  ) {}

  equals(other?: EdgeRenderDataCache): boolean {
    return other == null
      ? false
      : other.sourceStart == this.sourceStart &&
          other.sourceEnd == this.sourceEnd &&
          other.targetStart == this.targetStart &&
          other.targetEnd == this.targetEnd &&
          other.circleCenter == this.circleCenter &&
          other.highlighted == this.highlighted &&
          other.opacity == this.opacity &&
          other.showStyleHints == this.showStyleHints
  }
}
