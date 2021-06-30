/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  BaseClass,
  Class,
  FreeLabelModel,
  ICanvasContext,
  IEdge,
  IInputModeContext,
  ILabel,
  ILabelStyle,
  INode,
  IRenderContext,
  ISelectionIndicatorInstaller,
  ISvgDefsCreator,
  IVisualCreator,
  LabelStyleBase,
  Matrix,
  MatrixOrder,
  OrientedRectangle,
  OrientedRectangleIndicatorInstaller,
  Point,
  Rect,
  SimpleLabel,
  Size,
  SvgVisual,
  SvgVisualGroup,
  WebGLSupport
} from 'yfiles'

/**
 * A label style that renders labels at the same size regardless of the zoom level.
 * The style is implemented as a wrapper for an existing label style.
 */
export class ZoomInvariantLabelStyleBase extends LabelStyleBase {
  innerLabelStyle: ILabelStyle
  dummyLabelLayout: OrientedRectangle = new OrientedRectangle()
  dummyLabelBounds: OrientedRectangle = new OrientedRectangle()
  dummyLabel: SimpleLabel
  zoomThreshold: number

  /**
   * Instantiates a new label style.
   *
   * @param innerLabelStyle the style of the label
   * @param zoomThreshold the threshold that we use to control the label's size
   */
  constructor(innerLabelStyle: ILabelStyle, zoomThreshold: number) {
    super()
    this.innerLabelStyle = innerLabelStyle
    this.dummyLabel = new SimpleLabel(
      null,
      '',
      FreeLabelModel.INSTANCE.createDynamic(this.dummyLabelLayout)
    )
    this.zoomThreshold = typeof zoomThreshold === 'undefined' ? 2.0 : zoomThreshold
  }

  /**
   * Returns the preferred size calculated by the inner style.
   *
   * @param label the current label which will be styled
   */
  getPreferredSize(label: ILabel): Size {
    return this.innerLabelStyle.renderer.getPreferredSize(label, this.innerLabelStyle)
  }

  /**
   * Determines the scale factor for the given label and zoom level.
   *
   * @param label the current label which will be styled
   * @param zoom the current zoom level
   */
  getScaleForZoom(label: ILabel, zoom: number): number {
    // base implementation does nothing
    return 1
  }

  /**
   * Creates the visual for the label.
   *
   * @param label The label to which this style instance is assigned.
   * @param ctx The render context.
   * @return The visual as required by the {@link IVisualCreator#createVisual} interface.
   */
  createVisual(ctx: IRenderContext, label: ILabel): SvgVisualGroup {
    this.updateDummyLabel(ctx, label)

    // creates the container for the visual and sets a transform for view coordinates
    const container = new SvgVisualGroup()

    const scale = this.getScaleForZoom(label, ctx.zoom)
    container.transform = new Matrix(
      scale,
      0,
      0,
      scale,
      label.layout.orientedRectangleCenter.x,
      label.layout.orientedRectangleCenter.y
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
    const visual = creator.createVisual(innerContext) as SvgVisual
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
   * @param label The label to which this style instance is assigned.
   * @param ctx The render context.
   * @param oldVisual The visual that has been created in the call to createVisual.
   * @return visual as required by the {@link IVisualCreator#createVisual} interface.
   */
  updateVisual(ctx: IRenderContext, oldVisual: SvgVisualGroup, label: ILabel): SvgVisual | null {
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
      label.layout.orientedRectangleCenter.x,
      label.layout.orientedRectangleCenter.y
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

    const updatedVisual = creator.updateVisual(innerContext, visual) as SvgVisual
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
  updateDummyLabel(context: ICanvasContext, original: ILabel): void {
    this.dummyLabel.owner = original.owner
    this.dummyLabel.style = original.style
    this.dummyLabel.tag = original.tag
    this.dummyLabel.text = original.text

    const originalLayout = original.layout
    this.dummyLabelLayout.reshape(originalLayout)
    this.dummyLabelLayout.setCenter(new Point(0, 0))
    this.dummyLabel.preferredSize = this.dummyLabelLayout.toSize()

    const scale = this.getScaleForZoom(original, context.zoom)
    this.dummyLabelBounds.reshape(originalLayout)
    this.dummyLabelBounds.resize(originalLayout.width * scale, originalLayout.height * scale)
    this.dummyLabelBounds.setCenter(originalLayout.orientedRectangleCenter)
  }

  /**
   * Gets the bounds of the visual for the label in the given context.
   *
   * @param label The label to which this style instance is assigned.
   * @param canvasContext The canvas context.
   * @return The visual bounds of the visual representation.
   */
  getBounds(canvasContext: ICanvasContext, label: ILabel): Rect {
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
   * @param label The label to which this style instance is assigned.
   * @param clip The clipping rectangle.
   * @param canvasContext The canvas context.
   */
  isVisible(canvasContext: ICanvasContext, clip: Rect, label: ILabel): boolean {
    this.updateDummyLabel(canvasContext, label)
    return this.getBounds(canvasContext, label).intersects(clip)
  }

  /**
   * Determines whether the visual representation of the label has been hit at the given location.
   *
   * @param label The label to which this style instance is assigned.
   * @param p The point to test.
   * @param canvasContext The canvas context.
   */
  isHit(canvasContext: IInputModeContext, p: Point, label: ILabel): boolean {
    this.updateDummyLabel(canvasContext, label)
    return this.dummyLabelBounds.containsWithEps(p, 0.001)
  }

  /**
   * Determines whether the visualization for the specified label is included in the marquee selection.
   *
   * @param label The label to which this style instance is assigned.
   * @param box The marquee selection box.
   * @param canvasContext The canvas context.
   */
  isInBox(canvasContext: IInputModeContext, box: Rect, label: ILabel): boolean {
    this.updateDummyLabel(canvasContext, label)
    return this.getBounds(canvasContext, label).intersects(box)
  }

  /**
   * Returns an adjusted selection rectangle for the resized label styles.
   *
   */
  lookup(label: ILabel, type: Class): object {
    if (type === ISelectionIndicatorInstaller.$class) {
      return new OrientedRectangleIndicatorInstaller(this.dummyLabelBounds)
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
  getScaleForZoom(label: ILabel, zoom: number): number {
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
  getScaleForZoom(label: ILabel, zoom: number): number {
    if (zoom < this.zoomThreshold) {
      return 1
    }
    return this.zoomThreshold / zoom
  }
}

export class ZoomInvariantOutsideRangeLabelStyle extends ZoomInvariantLabelStyleBase {
  constructor(innerLabelStyle: ILabelStyle, zoomThreshold: number, public maxScale: number) {
    super(innerLabelStyle, zoomThreshold)
  }

  /**
   * Stops the label from getting smaller in view coordinates if the zoom is smaller than zoomThreshold
   * and stops it from getting larger in view coordinates if the zoom is greater than maxScale.
   *
   * @param label the current label which will be styled
   * @param zoom the current zoom level
   */
  getScaleForZoom(label: ILabel, zoom: number): number {
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
  constructor(innerLabelStyle: ILabelStyle) {
    super(innerLabelStyle, 1)
  }

  /**
   * Scales the label to fit its owner.
   * @param label the current label which will be styled
   * @param zoom the scale for the zoom
   */
  getScaleForZoom(label: ILabel, zoom: number): number {
    const labelWidth = label.layout.width
    let ratio = 1
    if (label.owner instanceof INode) {
      const nodeWidth = label.owner.layout.width
      ratio = Math.min(1, nodeWidth / labelWidth)
    } else if (label.owner instanceof IEdge) {
      const edge = label.owner
      const sourcePortLocation = edge.sourcePort!.location
      const targetPortLocation = edge.targetPort!.location
      const edgeLength = sourcePortLocation.distanceTo(targetPortLocation)
      ratio = Math.min(1, edgeLength / labelWidth)
    }
    return ratio
  }
}

class DummyContext extends BaseClass(IRenderContext) {
  private readonly _zoom: number
  private readonly _transform: Matrix
  // multiply all necessary transforms with the given inverse transform to nullify the outer transform
  private readonly _viewTransform: Matrix
  private readonly _intermediateTransform: Matrix
  private readonly _projection: Matrix

  constructor(
    private readonly innerContext: IRenderContext,
    zoom: number,
    inverseTransform: Matrix
  ) {
    super()
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

  get clip(): Rect {
    return this.innerContext.clip
  }

  get viewTransform(): Matrix {
    return this._viewTransform
  }

  get intermediateTransform(): Matrix {
    return this._intermediateTransform
  }

  get projection(): Matrix {
    return this._projection
  }

  get defsElement(): Element {
    return this.innerContext.defsElement
  }

  get svgDefsManager() {
    return this.innerContext.svgDefsManager
  }

  get zoom(): number {
    return this._zoom
  }

  get hitTestRadius(): number {
    return this.innerContext.hitTestRadius
  }

  get webGLSupport(): WebGLSupport {
    return this.innerContext.webGLSupport
  }

  toViewCoordinates(worldPoint: Point): Point {
    return this._viewTransform.transform(worldPoint)
  }

  intermediateToViewCoordinates(intermediatePoint: Point): Point {
    return this._projection.transform(intermediatePoint)
  }

  worldToIntermediateCoordinates(worldPoint: Point): Point {
    return this._intermediateTransform.transform(worldPoint)
  }

  getDefsId(defsSupport: ISvgDefsCreator): string {
    return this.innerContext.getDefsId(defsSupport)
  }

  lookup(type: Class): object | null {
    return this.innerContext.lookup(type)
  }

  /**
   * Multiplies the given matrix with the inverse transform of the invariant label style.
   */
  private transformMatrix(matrix: Matrix): Matrix {
    const transformed = matrix.clone()
    transformed.multiply(this._transform, MatrixOrder.APPEND)
    return transformed
  }
}
