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
  ICanvasContext,
  IFocusRenderer,
  IHighlightRenderer,
  IHitTestable,
  IInputModeContext,
  IOrientedRectangle,
  IRenderContext,
  ISelectionRenderer,
  ISize,
  IVisibilityTestable,
  IVisualCreator,
  LabelStyleBase,
  MatrixOrder,
  OrientedRectangle,
  Point,
  Rect,
  SvgVisual,
  Visual
} from '@yfiles/yfiles'
/**
 * An abstract base class for anything that needs to render a rotated rectangle, e.g., a selection,
 * focus or highlight visualization for rotatable items.
 * This is a convenience implementation that takes care of the transformation and zoom-invariant
 * rendering.
 */
export class OrientedRectangleRendererBase extends BaseClass(
  ISelectionRenderer,
  IFocusRenderer,
  IHighlightRenderer,
  IBoundsProvider,
  IHitTestable,
  IVisibilityTestable,
  IVisualCreator
) {
  useViewCoordinates
  /**
   * Creates a new instance.
   * @param useViewCoordinates Gets or sets a value indicating whether the visualization is drawn in
   * view coordinates or intermediate coordinates.
   */
  constructor(useViewCoordinates = true) {
    super()
    this.useViewCoordinates = useViewCoordinates
  }
  $renderTag = null
  createVisual(context) {
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
  updateVisual(context, oldVisual) {
    if (this.$renderTag === null) {
      return this.createVisual(context)
    }
    const layout = this.getLayout(this.$renderTag)
    const intermediateLayout = this.useViewCoordinates
      ? OrientedRectangleRendererBase.getIntermediateLayout(context, layout)
      : layout
    const g = oldVisual.svgElement
    const oldWrappedEl = g.firstElementChild
    const wrappedEl = oldWrappedEl
      ? this.updateIndicatorElement(
          context,
          intermediateLayout.toSize(),
          this.$renderTag,
          oldWrappedEl
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
  static getIntermediateLayout(context, layout) {
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
  getBounds(context) {
    return this.$renderTag !== null
      ? this.getLayout(this.$renderTag).bounds
      : IBoundsProvider.EMPTY.getBounds(context)
  }
  isVisible(context, rectangle) {
    return this.getBounds(context).intersects(rectangle)
  }
  getBoundsProvider(renderTag) {
    this.$renderTag = renderTag
    return this
  }
  getHitTestable(renderTag) {
    this.$renderTag = renderTag
    return this
  }
  getVisibilityTestable(renderTag) {
    this.$renderTag = renderTag
    return this
  }
  isHit(_context, _location) {
    return false
  }
  getVisualCreator(renderTag) {
    this.$renderTag = renderTag
    return this
  }
}
