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
  IBoundsProvider,
  type ICanvasContext,
  IFocusRenderer,
  IHighlightRenderer,
  IHitTestable,
  type IInputModeContext,
  type IOrientedRectangle,
  type IRenderContext,
  ISelectionRenderer,
  type ISize,
  IVisibilityTestable,
  IVisualCreator,
  LabelStyleBase,
  MatrixOrder,
  OrientedRectangle,
  Point,
  type Rect,
  SvgVisual,
  type Visual
} from '@yfiles/yfiles'

/**
 * An abstract base class for anything that needs to render a rotated rectangle, e.g., a selection,
 * focus or highlight visualization for rotatable items.
 * This is a convenience implementation that takes care of the transformation and zoom-invariant
 * rendering.
 */
export abstract class OrientedRectangleRendererBase<TRenderTag> extends BaseClass(
  ISelectionRenderer,
  IFocusRenderer,
  IHighlightRenderer,
  IBoundsProvider,
  IHitTestable,
  IVisibilityTestable,
  IVisualCreator
) {
    protected useViewCoordinates: boolean;

  /**
   * Creates a new instance.
   * @param useViewCoordinates Gets or sets a value indicating whether the visualization is drawn in
   * view coordinates or intermediate coordinates.
   */
  constructor(useViewCoordinates = true) {
    super()
      this.useViewCoordinates = useViewCoordinates;
  }

  private $renderTag: TRenderTag | null = null

  /**
   * Creates the SVG element that visualizes the renderItem.
   * @param context The render context.
   * @param size The size of the visualization.
   * @param renderTag The item to render.
   */
  abstract createIndicatorElement(
    context: IRenderContext,
    size: ISize,
    renderTag: TRenderTag
  ): SVGElement

  /**
   * Updates the SVG element that visualizes the renderItem.
   * @param context The render context.
   * @param size The size of the visualization.
   * @param renderTag The item to render.
   * @param oldSvgElement The SVG element to update.
   */
  abstract updateIndicatorElement(
    context: IRenderContext,
    size: ISize,
    renderTag: TRenderTag,
    oldSvgElement: SVGElement
  ): SVGElement

  /**
   * Determines the layout for the renderItem.
   */
  abstract getLayout(renderTag: TRenderTag): IOrientedRectangle

  createVisual(context: IRenderContext): Visual {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    if (this.$renderTag === null) {
      return new SvgVisual(g)
    }

    const layout = this.getLayout(this.$renderTag)
    const intermediateLayout = this.useViewCoordinates
      ? OrientedRectangleRendererBase.getIntermediateLayout(context, layout)
      : layout

    const wrappedEl = this.createIndicatorElement(
      context,
      intermediateLayout.toSize(),
      this.$renderTag
    )

    if (wrappedEl) {
      g.appendChild(wrappedEl)

      const layoutTransform = LabelStyleBase.createLayoutTransform(
        context,
        intermediateLayout,
        false
      )
      if (this.useViewCoordinates) {
        layoutTransform.multiply(context.intermediateTransform, MatrixOrder.APPEND)
      }
      layoutTransform.applyTo(g)
    }
    return new SvgVisual(g)
  }

  updateVisual(context: IRenderContext, oldVisual: Visual): Visual {
    if (this.$renderTag === null) {
      return this.createVisual(context)
    }

    const layout = this.getLayout(this.$renderTag)
    const intermediateLayout = this.useViewCoordinates
      ? OrientedRectangleRendererBase.getIntermediateLayout(context, layout)
      : layout
    const g = (oldVisual as SvgVisual).svgElement as SVGGElement
    const oldWrappedEl = g.firstElementChild

    const wrappedEl = oldWrappedEl
      ? this.updateIndicatorElement(
          context,
          intermediateLayout.toSize(),
          this.$renderTag,
          oldWrappedEl as SVGElement
        )
      : this.createIndicatorElement(context, intermediateLayout.toSize(), this.$renderTag)
    if (wrappedEl !== oldWrappedEl) {
      if (oldWrappedEl) {
        g.removeChild(oldWrappedEl)
      }
      if (wrappedEl) {
        g.appendChild(wrappedEl)
      }
    }
    const layoutTransform = LabelStyleBase.createLayoutTransform(context, intermediateLayout, false)
    if (this.useViewCoordinates) {
      layoutTransform.multiply(context.intermediateTransform, MatrixOrder.APPEND)
    }
    layoutTransform.applyTo(g)
    return oldVisual
  }

  private static getIntermediateLayout(context: IRenderContext, layout: IOrientedRectangle) {
    let anchor = layout.anchor.toPoint()
    const up = layout.upVector
    const right = new Point(-up.y, up.x)
    let topLeft = anchor.add(up.multiply(layout.height))
    let bottomRight = anchor.add(right.multiply(layout.width))
    anchor = context.worldToIntermediateCoordinates(anchor)
    topLeft = context.worldToIntermediateCoordinates(topLeft)
    bottomRight = context.worldToIntermediateCoordinates(bottomRight)

    const or = new OrientedRectangle()
    or.setUpVector(topLeft.subtract(anchor).normalized)
    or.anchorX = anchor.x
    or.anchorY = anchor.y
    or.width = anchor.distanceTo(bottomRight)
    or.height = anchor.distanceTo(topLeft)
    return or
  }

  getBounds(context: ICanvasContext): Rect {
    return this.$renderTag !== null
      ? this.getLayout(this.$renderTag).bounds
      : IBoundsProvider.EMPTY.getBounds(context)
  }

  isVisible(context: ICanvasContext, rectangle: Rect): boolean {
    return this.getBounds(context).intersects(rectangle)
  }

  getBoundsProvider(renderTag: TRenderTag): IBoundsProvider {
    this.$renderTag = renderTag
    return this
  }

  getHitTestable(renderTag: TRenderTag): IHitTestable {
    this.$renderTag = renderTag
    return this
  }

  getVisibilityTestable(renderTag: TRenderTag): IVisibilityTestable {
    this.$renderTag = renderTag
    return this
  }

  isHit(_context: IInputModeContext, _location: Point): boolean {
    return false
  }

  getVisualCreator(renderTag: TRenderTag): IVisualCreator {
    this.$renderTag = renderTag
    return this
  }
}
