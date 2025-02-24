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
  BaseClass,
  DelegatingEdgeStyle,
  EdgeStyleIndicatorRenderer,
  GeneralPath,
  IBoundsProvider,
  ICanvasContext,
  IEdge,
  type IEdgeStyle,
  IHitTestable,
  IInputModeContext,
  IObjectRenderer,
  IRenderContext,
  ISelectionRenderer,
  IVisibilityTestable,
  IVisualCreator,
  MutableRectangle,
  Point,
  PolylineEdgeStyle,
  Rect,
  Stroke,
  StyleIndicatorZoomPolicy,
  SvgVisual,
  SvgVisualGroup,
  Visual
} from '@yfiles/yfiles'

/**
 * Custom selection style that renders a line segment for collinear control point triples
 */
class SelectionEdgeStyle extends DelegatingEdgeStyle {
  constructor(private delegatingStyle: IEdgeStyle) {
    super()
  }

  protected getStyle(edge: IEdge): IEdgeStyle {
    return this.delegatingStyle
  }

  protected getPath(edge: IEdge): GeneralPath {
    const pathPoints = IEdge.getPathPoints(edge)
    const gp = new GeneralPath(pathPoints.size + 1)
    gp.moveTo(pathPoints.get(0))

    for (let i = 1; i < pathPoints.size; ++i) {
      if (i % 3 === 2) {
        // Skip to the next triple
        gp.moveTo(pathPoints.get(i))
      } else {
        // Draw a line to the next control pint in the triple
        gp.lineTo(pathPoints.get(i))
      }
    }
    return gp
  }
}

/**
 * Custom decoration decorator that adds a rendering of the curves control point segments
 * This implementation adds as a decorator for an existing decorator and just adds the control point rendering on top.
 */
export class BezierSelectionStyle extends BaseClass(ISelectionRenderer) {
  /**
   * A polyline style used for visualizing the control point segments.
   */
  private selectionDecoratorStyle = new SelectionEdgeStyle(
    new PolylineEdgeStyle({
      stroke: new Stroke({
        fill: 'lightgray',
        dashStyle: 'dash',
        thickness: 2
      })
    })
  )

  private readonly renderer: CompositeRenderer
  private readonly decorator: EdgeStyleIndicatorRenderer

  /**
   * Create a new instance that decorates the `coreImpl`
   * @param coreImpl The core indicator that is again decorated by this instance
   */
  constructor(coreImpl: ISelectionRenderer) {
    super()
    this.decorator = new EdgeStyleIndicatorRenderer({
      edgeStyle: this.selectionDecoratorStyle,
      zoomPolicy: StyleIndicatorZoomPolicy.VIEW_COORDINATES
    })

    this.renderer = new CompositeRenderer(coreImpl, this.decorator)
  }

  getBoundsProvider(renderTag: any): IBoundsProvider {
    this.renderer.configure(renderTag)
    return this.renderer
  }

  getHitTestable(renderTag: any): IHitTestable {
    this.renderer.configure(renderTag)
    return this.renderer
  }

  getVisibilityTestable(renderTag: any): IVisibilityTestable {
    this.renderer.configure(renderTag)
    return this.renderer
  }

  getVisualCreator(renderTag: any): IVisualCreator {
    this.renderer.configure(renderTag)
    return this.renderer
  }
}

/**
 * A renderer that combines two render elements.
 */
class CompositeRenderer extends BaseClass(
  IVisualCreator,
  IBoundsProvider,
  IVisibilityTestable,
  IHitTestable
) {
  public renderTag: Object | null = null

  constructor(
    public first: IObjectRenderer,
    public second: IObjectRenderer
  ) {
    super()
  }

  configure(renderTag: Object) {
    this.renderTag = renderTag
  }

  createVisual(context: IRenderContext): Visual {
    const container = new SvgVisualGroup()
    if (this.first) {
      container.add(this.first.getVisualCreator(this.renderTag).createVisual(context) as SvgVisual)
    }

    if (this.second) {
      container.add(this.second.getVisualCreator(this.renderTag).createVisual(context) as SvgVisual)
    }
    return container
  }

  updateVisual(context: IRenderContext, oldVisual: Visual): Visual {
    const container = oldVisual as SvgVisualGroup
    if (!container || container.children.size != 2) {
      return this.createVisual(context)
    }
    this.first?.getVisualCreator(this.renderTag).updateVisual(context, container.children.at(0)!)
    this.second?.getVisualCreator(this.renderTag).updateVisual(context, container.children.at(1)!)

    return oldVisual
  }

  getBounds(context: ICanvasContext): Rect {
    const bounds = new MutableRectangle()
    if (this.first != null) {
      bounds.add(this.first.getBoundsProvider(this.renderTag).getBounds(context))
    }
    if (this.second != null) {
      bounds.add(this.second.getBoundsProvider(this.renderTag).getBounds(context))
    }
    return bounds.toRect()
  }

  isVisible(context: ICanvasContext, rectangle: Rect): boolean {
    return (
      (this.first &&
        this.first.getVisibilityTestable(this.renderTag).isVisible(context, rectangle)) ||
      (this.second != null &&
        this.second.getVisibilityTestable(this.renderTag).isVisible(context, rectangle))
    )
  }

  isHit(context: IInputModeContext, location: Point): boolean {
    return (
      (this.first && this.first.getHitTestable(this.renderTag).isHit(context, location)) ||
      (this.second != null && this.second.getHitTestable(this.renderTag).isHit(context, location))
    )
  }
}
