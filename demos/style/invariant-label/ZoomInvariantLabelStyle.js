/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  OrientedRectangle,
  OrientedRectangleIndicatorInstaller,
  Point,
  Rect,
  SimpleLabel,
  Size,
  SvgVisualGroup,
  Visual
} from 'yfiles'

/**
 * A label style that renders labels at the same size regardless of the zoom level.
 * The style is implemented as a wrapper for an existing label style.
 */
class ZoomInvariantLabelStyleBase extends LabelStyleBase {
  /**
   * Instantiates a new label style.
   *
   * @param {ILabelStyle} innerLabelStyle the style of the label
   * @param {number} zoomThreshold the threshold that we use to control the label's size
   */
  constructor(innerLabelStyle, zoomThreshold) {
    super()
    this.innerLabelStyle = innerLabelStyle
    this.dummyLabelLayout = new OrientedRectangle()
    this.dummyLabelBounds = new OrientedRectangle()
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
   * @param {ILabel} label the current label which will be styled
   */
  getPreferredSize(label) {
    return this.innerLabelStyle.renderer.getPreferredSize(label, this.innerLabelStyle)
  }

  /**
   * Determines the scale factor for the given label and zoom level.
   *
   * @param {ILabel} label the current label which will be styled
   * @param {number} zoom the current zoom level
   */
  getScaleForZoom(label, zoom) {
    // base implementation does nothing
    return 1
  }

  /**
   * Creates the visual for the label.
   *
   * @param {ILabel} label The label to which this style instance is assigned.
   * @param {IRenderContext} ctx The render context.
   * @return {Visual | SvgVisualGroup} The visual as required by the {@link IVisualCreator#createVisual} interface.
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
      label.layout.orientedRectangleCenter.x,
      label.layout.orientedRectangleCenter.y
    )

    const creator = this.innerLabelStyle.renderer.getVisualCreator(
      this.dummyLabel,
      this.innerLabelStyle
    )

    // create a new IRenderContext with a zoom of 1
    const innerContext = new DummyContext(ctx, scale)

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
   * @param {ILabel} label The label to which this style instance is assigned.
   * @param {IRenderContext} ctx The render context.
   * @param {Visual | SvgVisualGroup} oldVisual The visual that has been created in the call to createVisual.
   * @return {Visual | null} visual as required by the {@link IVisualCreator#createVisual} interface.
   */
  updateVisual(ctx, oldVisual, label) {
    this.updateDummyLabel(ctx, label)

    const visual = oldVisual.children.get(0)
    if (visual === null) {
      return this.createVisual(ctx, label)
    }

    const scale = this.getScaleForZoom(label, ctx.zoom)

    // create a new IRenderContext with a zoom of this.zoomThreshold
    const innerContext = new DummyContext(ctx, scale)

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
    const updatedVisual = creator.updateVisual(innerContext, visual)
    if (updatedVisual === null) {
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
   *
   * @param {ICanvasContext} context
   * @param {ILabel} original
   * @private
   */
  updateDummyLabel(context, original) {
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
   * @param {ILabel} label The label to which this style instance is assigned.
   * @param {ICanvasContext} canvasContext The canvas context.
   * @return {Rect} The visual bounds of the visual representation.
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
   * @param {ILabel} label The label to which this style instance is assigned.
   * @param {Rect} clip The clipping rectangle.
   * @param {ICanvasContext} canvasContext The canvas context.
   * @return {boolean}
   */
  isVisible(canvasContext, clip, label) {
    this.updateDummyLabel(canvasContext, label)
    return this.getBounds(canvasContext, label).intersects(clip)
  }

  /**
   * Determines whether the visual representation of the label has been hit at the given location.
   *
   * @param {ILabel} label The label to which this style instance is assigned.
   * @param {Point} p The point to test.
   * @param {IInputModeContext} canvasContext The canvas context.
   * @return {boolean}
   */
  isHit(canvasContext, p, label) {
    this.updateDummyLabel(canvasContext, label)
    return this.dummyLabelBounds.containsWithEps(p, 0.001)
  }

  /**
   * Determines whether the visualization for the specified label is included in the marquee selection.
   *
   * @param {ILabel} label The label to which this style instance is assigned.
   * @param {Rect} box The marquee selection box.
   * @param {IInputModeContext} canvasContext The canvas context.
   * @return {boolean}
   */
  isInBox(canvasContext, box, label) {
    this.updateDummyLabel(canvasContext, label)
    return this.getBounds(canvasContext, label).intersects(box)
  }

  /**
   * Returns an adjusted selection rectangle for the resized label styles.
   *
   * @param {ILabel} label
   * @param {Class} type
   * @return {Object}
   */
  lookup(label, type) {
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
   * @param {ILabel} label the current label which will be styled
   * @param {number} zoom the current zoom level
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
   * @param {ILabel} label the current label which will be styled
   * @param {number} zoom the current zoom level
   */
  getScaleForZoom(label, zoom) {
    if (zoom < this.zoomThreshold) {
      return 1
    }
    return this.zoomThreshold / zoom
  }
}

export class ZoomInvariantOutsideRangeLabelStyle extends ZoomInvariantLabelStyleBase {
  constructor(innerLabelStyle, zoomThreshold, maxScale) {
    super(innerLabelStyle, zoomThreshold)
    this.maxScale = maxScale
  }

  /**
   * Stops the label from getting smaller in view coordinates if the zoom is smaller than zoomThreshold
   * and stops it from getting larger in view coordinates if the zoom is greater than maxScale.
   *
   * @param {ILabel} label the current label which will be styled
   * @param {number} zoom the current zoom level
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
   * @param {ILabel} label the current label which will be styled
   */
  getScaleForZoom(label, zoom) {
    const labelWidth = label.layout.width
    let ratio = 1
    if (INode.isInstance(label.owner)) {
      const nodeWidth = label.owner.layout.width
      ratio = Math.min(1, nodeWidth / labelWidth)
    } else if (IEdge.isInstance(label.owner)) {
      const edge = label.owner
      const edgeLength = Math.sqrt(
        Math.pow(edge.sourcePort.location.x - edge.targetPort.location.x, 2) +
          Math.pow(edge.sourcePort.location.y - edge.targetPort.location.y, 2)
      )
      ratio = Math.min(1, edgeLength / labelWidth)
    }
    return ratio
  }
}

class DummyContext extends BaseClass(IRenderContext) {
  /**
   * @param {IRenderContext} innerContext
   * @param {number} zoom
   */
  constructor(innerContext, zoom) {
    super()
    const canvas = innerContext.canvasComponent
    const worldBounds = canvas.contentRect
    this.innerContext = innerContext
    this.$canvas = canvas
    this.$clip = canvas.contentRect
    this.$zoom = zoom
    const transform = new Matrix(zoom, 0, 0, zoom, -worldBounds.x * zoom, -worldBounds.y * zoom)
    const viewTransform = new Matrix()
    viewTransform.set(transform)
    viewTransform.invert()
    this.$viewTransform = viewTransform
    this.$transform = transform
  }

  get canvasComponent() {
    return this.$canvas
  }

  get clip() {
    return this.$clip
  }

  get viewTransform() {
    return this.$viewTransform
  }

  get transform() {
    return this.$transform
  }

  get defsElement() {
    return this.innerContext.defsElement
  }

  get svgDefsManager() {
    return this.innerContext.svgDefsManager
  }

  get zoom() {
    return this.$zoom
  }

  get hitTestRadius() {
    return this.innerContext.hitTestRadius
  }

  /**
   * @param {Point} world
   */
  toViewCoordinates(world) {
    return this.$transform.transform(world)
  }

  /**
   * @param {ISvgDefsCreator} defsSupport
   */
  getDefsId(defsSupport) {
    return this.innerContext.getDefsId(defsSupport)
  }

  /**
   * @param {Class} type
   */
  lookup(type) {
    return this.innerContext.lookup(type)
  }
}
