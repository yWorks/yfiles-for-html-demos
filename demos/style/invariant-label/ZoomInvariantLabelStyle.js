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
  FreeLabelModel,
  ICanvasContext,
  IEdge,
  IInputModeContext,
  ILabel,
  ILabelStyle,
  INode,
  IOrientedRectangle,
  IRenderContext,
  ISelectionRenderer,
  ISize,
  ISvgDefsCreator,
  IVisualCreator,
  LabelStyleBase,
  Matrix,
  MatrixOrder,
  OrientedRectangle,
  Point,
  Rect,
  SimpleLabel,
  Size,
  SvgVisual,
  SvgVisualGroup,
  WebGLSupport
} from '@yfiles/yfiles'
import { OrientedRectangleRendererBase } from '@yfiles/demo-utils/OrientedRectangleRendererBase'

/**
 * A label style that renders labels at the same size regardless of the zoom level.
 * The style is implemented as a wrapper for an existing label style.
 *
 * Note that due to the way this class caches the layout for the visualization of the selection,
 * its instances shouldn't be shared between graph items.
 */
export class ZoomInvariantLabelStyleBase extends LabelStyleBase {
  innerLabelStyle
  dummyLabelLayout = new OrientedRectangle()
  // Provides the oriented rectangle displayed by the selection, based on the last handled item.
  // Thus, instances of this style shouldn't be shared between graph items.
  dummyLabelBounds = new OrientedRectangle()
  dummyLabel
  zoomThreshold

  /**
   * Instantiates a new label style.
   *
   * @param innerLabelStyle the style of the label
   * @param zoomThreshold the threshold that we use to control the label's size
   */
  constructor(innerLabelStyle, zoomThreshold) {
    super()
    this.innerLabelStyle = innerLabelStyle
    this.dummyLabel = new SimpleLabel({
      layoutParameter: FreeLabelModel.INSTANCE.createDynamic(this.dummyLabelLayout)
    })
    this.zoomThreshold = typeof zoomThreshold === 'undefined' ? 2.0 : zoomThreshold
  }

  /**
   * Returns the preferred size calculated by the inner style.
   *
   * @param label the current label which will be styled
   */
  getPreferredSize(label) {
    return this.innerLabelStyle.renderer.getPreferredSize(label, this.innerLabelStyle)
  }

  /**
   * Determines the scale factor for the given label and zoom level.
   *
   * @param label the current label which will be styled
   * @param zoom the current zoom level
   */
  getScaleForZoom(label, zoom) {
    // base implementation does nothing
    return 1
  }

  /**
   * Creates the visual for the label.
   *
   * @param ctx The render context.
   * @param label The label to which this style instance is assigned.
   * @returns The visual as required by the {@link IVisualCreator.createVisual} interface.
   */
  createVisual(ctx, label) {
    this.updateDummyLabel(ctx, label)

    // creates the container for the visual and sets a transform for view coordinates
    const container = new SvgVisualGroup()

    const scale = this.getScaleForZoom(label, ctx.zoom)
    container.transform = new Matrix(
      scale,
      0,
      0,
      scale,
      label.layout.center.x,
      label.layout.center.y
    )

    const creator = this.innerLabelStyle.renderer.getVisualCreator(
      this.dummyLabel,
      this.innerLabelStyle
    )

    // pass inverse transform to nullify the scaling and translation on the context
    // therefore inner styles can use the context's methods without considering the current transform
    const inverseTransform = container.transform.clone()
    inverseTransform.invert()
    const innerContext = new DummyContext(ctx, scale * ctx.zoom, inverseTransform)

    // the wrapped style should always think it's rendering with the zoom level set in this.zoomThreshold
    const visual = creator.createVisual(innerContext)
    if (visual === null) {
      return container
    }
    // add the created visual to the container
    container.children.add(visual)
    return container
  }

  /**
   * Update the visual previously created by createVisual.
   *
   * @param ctx The render context.
   * @param oldVisual The visual that has been created in the call to createVisual.
   * @param label The label to which this style instance is assigned.
   * @returns visual as required by the {@link IVisualCreator.createVisual} interface.
   */
  updateVisual(ctx, oldVisual, label) {
    this.updateDummyLabel(ctx, label)

    const visual = oldVisual.children.get(0)
    if (visual === null) {
      return this.createVisual(ctx, label)
    }

    const scale = this.getScaleForZoom(label, ctx.zoom)

    oldVisual.transform = new Matrix(
      scale,
      0,
      0,
      scale,
      label.layout.center.x,
      label.layout.center.y
    )

    // update the visual created by the inner style renderer
    const creator = this.innerLabelStyle.renderer.getVisualCreator(
      this.dummyLabel,
      this.innerLabelStyle
    )

    // pass inverse transform to nullify the scaling and translation on the context
    // therefore inner styles can use the context's methods without considering the current transform
    const inverseTransform = oldVisual.transform.clone()
    inverseTransform.invert()
    const innerContext = new DummyContext(ctx, scale * ctx.zoom, inverseTransform)

    const updatedVisual = creator.updateVisual(innerContext, visual)
    if (!updatedVisual) {
      // nothing to display -> return nothing
      return null
    }

    if (updatedVisual !== visual) {
      oldVisual.remove(visual)
      oldVisual.add(updatedVisual)
    }

    return oldVisual
  }

  /**
   * Updates the internal label to match the given original label.
   */
  updateDummyLabel(context, original) {
    this.dummyLabel.owner = original.owner
    this.dummyLabel.style = original.style
    this.dummyLabel.tag = original.tag
    this.dummyLabel.text = original.text

    const originalLayout = original.layout
    this.dummyLabelLayout.setShape(originalLayout)
    this.dummyLabelLayout.setCenter(new Point(0, 0))
    this.dummyLabel.preferredSize = this.dummyLabelLayout.toSize()

    const scale = this.getScaleForZoom(original, context.zoom)
    this.dummyLabelBounds.setUpVector(originalLayout.upVector)
    this.dummyLabelBounds.width = originalLayout.width * scale
    this.dummyLabelBounds.height = originalLayout.height * scale
    this.dummyLabelBounds.setCenter(originalLayout.center)
  }

  /**
   * Creates a new copy of this instance.
   *
   * In addition to the default memberwise clone, the internal fields for caching the layout are
   * initialized with new instances, too.
   */
  clone() {
    const clone = super.clone()
    clone.dummyLabelBounds = new OrientedRectangle()
    clone.dummyLabelLayout = new OrientedRectangle()
    clone.dummyLabel = new SimpleLabel({
      layoutParameter: FreeLabelModel.INSTANCE.createDynamic(clone.dummyLabelLayout)
    })
    return clone
  }

  /**
   * Gets the bounds of the visual for the label in the given context.
   *
   * @param canvasContext The canvas context.
   * @param label The label to which this style instance is assigned.
   * @returns The visual bounds of the visual representation.
   */
  getBounds(canvasContext, label) {
    this.updateDummyLabel(canvasContext, label)
    const bounds = this.innerLabelStyle.renderer
      .getBoundsProvider(label, this.innerLabelStyle)
      .getBounds(canvasContext)
    const center = bounds.center
    const scale = this.getScaleForZoom(label, canvasContext.zoom)
    const newSize = new Size(bounds.width * scale, bounds.height * scale)
    const newLocation = new Point(center.x - newSize.width * 0.5, center.y - newSize.height * 0.5)
    return new Rect(newLocation, newSize)
  }

  /**
   * Determines whether the visualization for the specified label is visible in the context.
   *
   * @param canvasContext The canvas context.
   * @param clip The clipping rectangle.
   * @param label The label to which this style instance is assigned.
   */
  isVisible(canvasContext, clip, label) {
    this.updateDummyLabel(canvasContext, label)
    return this.getBounds(canvasContext, label).intersects(clip)
  }

  /**
   * Determines whether the visual representation of the label has been hit at the given location.
   *
   * @param canvasContext The canvas context.
   * @param p The point to test.
   * @param label The label to which this style instance is assigned.
   */
  isHit(canvasContext, p, label) {
    this.updateDummyLabel(canvasContext, label)
    return this.dummyLabelBounds.contains(p, 0.001)
  }

  /**
   * Determines whether the visualization for the specified label is included in the marquee selection.
   *
   * @param canvasContext The canvas context.
   * @param box The marquee selection box.
   * @param label The label to which this style instance is assigned.
   */
  isInBox(canvasContext, box, label) {
    this.updateDummyLabel(canvasContext, label)
    return this.getBounds(canvasContext, label).intersects(box)
  }

  /**
   * Returns an adjusted selection rectangle for the resized label styles.
   *
   */
  lookup(label, type) {
    if (type === ISelectionRenderer) {
      return new ZoomInvariantSelectionRenderer(this.dummyLabelBounds)
    }
    return super.lookup(label, type)
  }
}

export class ZoomInvariantBelowThresholdLabelStyle extends ZoomInvariantLabelStyleBase {
  /**
   * Stops the label from getting smaller in view coordinates if the zoom is smaller than zoomThreshold.
   *
   * @param label the current label which will be styled
   * @param zoom the current zoom level
   */
  getScaleForZoom(label, zoom) {
    if (zoom > this.zoomThreshold) {
      return 1
    }
    return this.zoomThreshold / zoom
  }
}

export class ZoomInvariantAboveThresholdLabelStyle extends ZoomInvariantLabelStyleBase {
  /**
   * Stops the label from getting larger in view coordinates if the zoom is greater than zoomThreshold.
   *
   * @param label the current label which will be styled
   * @param zoom the current zoom level
   */
  getScaleForZoom(label, zoom) {
    if (zoom < this.zoomThreshold) {
      return 1
    }
    return this.zoomThreshold / zoom
  }
}

export class ZoomInvariantOutsideRangeLabelStyle extends ZoomInvariantLabelStyleBase {
  maxScale
  constructor(innerLabelStyle, zoomThreshold, maxScale) {
    super(innerLabelStyle, zoomThreshold)
    this.maxScale = maxScale
  }

  /**
   * Stops the label from getting smaller in view coordinates if the zoom is smaller than zoomThreshold
   * and stops it from getting larger in view coordinates if the zoom is greater than maxScale.
   *
   * @param label the current label which will be styled
   * @param zoom the current zoom level
   */
  getScaleForZoom(label, zoom) {
    if (zoom < this.zoomThreshold) {
      return this.zoomThreshold / zoom
    }
    if (zoom > this.maxScale) {
      return this.maxScale / zoom
    }
    return 1
  }
}

export class FitOwnerLabelStyle extends ZoomInvariantLabelStyleBase {
  constructor(innerLabelStyle) {
    super(innerLabelStyle, 1)
  }

  /**
   * Scales the label to fit its owner.
   * @param label the current label which will be styled
   * @param zoom the scale for the zoom
   */
  getScaleForZoom(label, zoom) {
    const labelWidth = label.layout.width
    let ratio = 1
    if (label.owner instanceof INode) {
      const nodeWidth = label.owner.layout.width
      ratio = Math.min(1, nodeWidth / labelWidth)
    } else if (label.owner instanceof IEdge) {
      const edge = label.owner
      const sourcePortLocation = edge.sourcePort.location
      const targetPortLocation = edge.targetPort.location
      const edgeLength = sourcePortLocation.distanceTo(targetPortLocation)
      ratio = Math.min(1, edgeLength / labelWidth)
    }
    return ratio
  }
}

class DummyContext extends BaseClass(IRenderContext) {
  innerContext
  _zoom
  _transform
  // multiply all necessary transforms with the given inverse transform to nullify the outer transform
  _viewTransform
  _intermediateTransform
  _projection

  constructor(innerContext, zoom, inverseTransform) {
    super()
    this.innerContext = innerContext
    this._zoom = zoom
    this._transform = inverseTransform

    // multiply all necessary transforms with the given inverse transform to nullify the outer transform
    this._viewTransform = this.transformMatrix(innerContext.viewTransform)
    this._intermediateTransform = this.transformMatrix(innerContext.intermediateTransform)
    this._projection = this.transformMatrix(innerContext.projection)
  }

  get canvasComponent() {
    return this.innerContext.canvasComponent
  }

  get clip() {
    return this.innerContext.clip
  }

  get viewTransform() {
    return this._viewTransform
  }

  get intermediateTransform() {
    return this._intermediateTransform
  }

  get projection() {
    return this._projection
  }

  get defsElement() {
    return this.innerContext.defsElement
  }

  get svgDefsManager() {
    return this.innerContext.svgDefsManager
  }

  get zoom() {
    return this._zoom
  }

  get hitTestRadius() {
    return this.innerContext.hitTestRadius
  }

  get webGLSupport() {
    return this.innerContext.webGLSupport
  }

  worldToViewCoordinates(worldPoint) {
    return this._viewTransform.transform(worldPoint)
  }

  intermediateToViewCoordinates(intermediatePoint) {
    return this._projection.transform(intermediatePoint)
  }

  worldToIntermediateCoordinates(worldPoint) {
    return this._intermediateTransform.transform(worldPoint)
  }

  getDefsId(defsSupport) {
    return this.innerContext.getDefsId(defsSupport)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  lookup(type) {
    return this.innerContext.lookup(type)
  }

  /**
   * Multiplies the given matrix with the inverse transform of the invariant label style.
   */
  transformMatrix(matrix) {
    const transformed = matrix.clone()
    transformed.multiply(this._transform, MatrixOrder.APPEND)
    return transformed
  }
}

class ZoomInvariantSelectionRenderer extends OrientedRectangleRendererBase {
  fixedLayout
  constructor(fixedLayout) {
    super()
    this.fixedLayout = fixedLayout
  }

  createIndicatorElement(_context, size, _renderTag) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', size.width.toString())
    rect.setAttribute('height', size.height.toString())
    rect.setAttribute('stroke', 'rgb(56,67,79)')
    rect.setAttribute('stroke-width', '2')
    rect.setAttribute('fill', 'none')
    return rect
  }

  updateIndicatorElement(_context, size, _renderTag, oldSvgElement) {
    oldSvgElement.setAttribute('width', size.width.toString())
    oldSvgElement.setAttribute('height', size.height.toString())
    return oldSvgElement
  }

  getLayout(_renderTag) {
    return this.fixedLayout
  }
}
