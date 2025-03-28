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
  ArrowNodeDirection,
  ArrowNodeStyle,
  ArrowStyleShape,
  BaseClass,
  ClickEventArgs,
  Cursor,
  HandleType,
  IHandle,
  IInputModeContext,
  INode,
  IPoint,
  IRectangle,
  IRenderContext,
  IVisualCreator,
  Point,
  SvgVisual,
  SvgVisualGroup
} from '@yfiles/yfiles'
/**
 * An {@link IHandle} for nodes with a {@link ArrowNodeStyle} to change the
 * {@link ArrowNodeStyle.angle} interactively.
 */
export class ArrowNodeStyleAngleHandle extends BaseClass(IHandle, IPoint, IVisualCreator) {
  node
  angleChanged
  handleOffset = 15.0
  style
  // x and y factors that are used to translate the mouse delta to the relative handle movement
  xFactor = 0
  yFactor = 0
  arrowSideWidth = 0
  initialAngle = 0
  initialHandleOffset = 0
  handleOffsetToHeadLengthForPositiveAngles = 0
  handleOffsetToHeadLengthForNegativeAngles = 0
  // minimum and maximum handle offsets that result in the minimum and maximum allowed angles
  handleOffsetForMinAngle = 0
  handleOffsetForMaxAngle = 0
  angleLineRenderTreeElement
  /**
   * Creates a new instance for the given node.
   * @param node The node whose style shall be changed.
   * @param angleChanged An action that is called when the handle has been moved.
   */
  constructor(node, angleChanged) {
    super()
    this.node = node
    this.angleChanged = angleChanged
    this.style = node.style
  }
  /**
   * Gets a live view of the handle location.
   *
   * The handle is placed with an offset to the node bounds on the line from the arrow head tip
   * along the arrow blade.
   */
  get location() {
    return this
  }
  /**
   * Initializes the drag gesture and adds a line from the arrow head tip along the arrow blade to
   * the handle to the view.
   * @param context The current input mode context.
   */
  initializeDrag(context) {
    const nodeLayout = this.node.layout
    const isParallelogram = this.style.shape === ArrowStyleShape.PARALLELOGRAM
    const isTrapezoid = this.style.shape === ArrowStyleShape.TRAPEZOID
    // negative angles are only allowed for trapezoids, parallelograms or arrows with shaft ratio = 1
    const negativeAngleAllowed = this.style.shaftRatio >= 1 || isTrapezoid || isParallelogram
    this.arrowSideWidth = ArrowNodeStyleAngleHandle.getArrowSideWidth(this.node.layout, this.style)
    // calculate the factors to convert the handle offset to the new length of the arrowhead note
    // that for positive angles the angle rotates around the arrow tip while for negative ones it
    // rotates around a node corner
    this.handleOffsetToHeadLengthForPositiveAngles =
      this.arrowSideWidth / (this.handleOffset + this.arrowSideWidth)
    this.handleOffsetToHeadLengthForNegativeAngles = this.arrowSideWidth / this.handleOffset
    this.initialAngle = ArrowNodeStyleAngleHandle.getClampedAngle(this.style)
    this.initialHandleOffset =
      ArrowNodeStyleAngleHandle.getArrowHeadLength(this.node.layout, this.style) /
      (this.initialAngle < 0
        ? -this.handleOffsetToHeadLengthForNegativeAngles
        : this.handleOffsetToHeadLengthForPositiveAngles)
    // the maximum length of the arrow head depends on the direction and shape
    const maxHeadLength = ArrowNodeStyleAngleHandle.getMaxArrowHeadLength(nodeLayout, this.style)
    // calculate handle offsets for the current node size that correspond to the minimum and maximum allowed angle
    this.handleOffsetForMaxAngle = maxHeadLength / this.handleOffsetToHeadLengthForPositiveAngles
    this.handleOffsetForMinAngle = negativeAngleAllowed
      ? -maxHeadLength / this.handleOffsetToHeadLengthForNegativeAngles
      : 0
    // xFactor and yFactor are used later to translate the mouse delta to the relative handle movement
    const direction = this.style.direction
    this.xFactor =
      direction === ArrowNodeDirection.LEFT ? 1 : direction === ArrowNodeDirection.RIGHT ? -1 : 0
    this.yFactor =
      direction === ArrowNodeDirection.UP ? 1 : direction === ArrowNodeDirection.DOWN ? -1 : 0
    if (isParallelogram) {
      // for parallelograms the slope of the arrow blade is in the opposite direction
      this.xFactor *= -1
      this.yFactor *= -1
    }
    // add a line from the arrow tip along the arrow blade to the handle location to the view
    // this line is created and updated in the CreateVisual and UpdateVisual methods
    this.angleLineRenderTreeElement = context.canvasComponent?.renderTree.createElement(
      context.canvasComponent?.renderTree.inputModeGroup,
      this
    )
  }
  /**
   * Calculates the new angle depending on the new mouse location and updates the node style and
   * angle visualization.
   * @param context The current input mode context.
   * @param originalLocation The original handle location.
   * @param newLocation The new mouse location.
   */
  handleMove(context, originalLocation, newLocation) {
    // determine delta of the handle
    const handleDelta =
      this.xFactor * (newLocation.x - originalLocation.x) +
      this.yFactor * (newLocation.y - originalLocation.y)
    // determine handle offset from the location that corresponds to angle = 0
    let handleOffset = this.initialHandleOffset + handleDelta
    // ... and clamp to valid values
    handleOffset = Math.max(
      this.handleOffsetForMinAngle,
      Math.min(handleOffset, this.handleOffsetForMaxAngle)
    )
    // calculate the new arrow head length based on the offset of the handle
    const newHeadLength =
      handleOffset < 0
        ? handleOffset * this.handleOffsetToHeadLengthForNegativeAngles
        : handleOffset * this.handleOffsetToHeadLengthForPositiveAngles
    this.style.angle = Math.atan(newHeadLength / this.arrowSideWidth)
    if (this.angleChanged) {
      this.angleChanged()
    }
  }
  /**
   * Resets the initial angle and removes the angle visualization.
   * @param context The current input mode context.
   * @param originalLocation The original handle location.
   */
  cancelDrag(context, originalLocation) {
    this.style.angle = this.initialAngle
    if (this.angleLineRenderTreeElement) {
      context.canvasComponent?.renderTree.remove(this.angleLineRenderTreeElement)
    }
  }
  /**
   * Sets the angle for the new location, removes the angle visualization and triggers the
   * angleChanged callback.
   * @param context The current input mode context.
   * @param originalLocation The original handle location.
   * @param newLocation The new mouse location.
   */
  dragFinished(context, originalLocation, newLocation) {
    this.handleMove(context, originalLocation, newLocation)
    if (this.angleLineRenderTreeElement) {
      context.canvasComponent?.renderTree.remove(this.angleLineRenderTreeElement)
    }
  }
  /**
   * Returns {@link HandleType.CUSTOM3} as handle type that determines the visualization of the
   * handle.
   */
  get type() {
    return HandleType.CUSTOM3
  }
  /**
   * Returns an optional tag object associated with the handle.
   */
  get tag() {
    return null
  }
  /**
   * Returns {@link Cursor.CROSSHAIR} as cursor that shall be used during the drag gesture.
   */
  get cursor() {
    const horizontal =
      this.style.direction === ArrowNodeDirection.RIGHT ||
      this.style.direction === ArrowNodeDirection.LEFT
    return horizontal ? Cursor.EW_RESIZE : Cursor.NS_RESIZE
  }
  /**
   * This implementation does nothing special when clicked.
   */
  handleClick(evt) {}
  /**
   * The handle's x coordinate.
   */
  get x() {
    switch (this.style.direction) {
      case ArrowNodeDirection.RIGHT: {
        const offset = this.calculateHandleInDirectionOffset()
        return this.style.shape === ArrowStyleShape.PARALLELOGRAM
          ? this.node.layout.x + offset
          : this.node.layout.maxX - offset
      }
      case ArrowNodeDirection.UP:
        return this.node.layout.x - this.handleOffset
      case ArrowNodeDirection.LEFT: {
        const offset = this.calculateHandleInDirectionOffset()
        return this.style.shape === ArrowStyleShape.PARALLELOGRAM
          ? this.node.layout.maxX - offset
          : this.node.layout.x + offset
      }
      case ArrowNodeDirection.DOWN:
        return this.style.shape === ArrowStyleShape.TRAPEZOID
          ? this.node.layout.maxX + this.handleOffset
          : this.node.layout.x - this.handleOffset
    }
    return 0
  }
  /**
   * The handle's y coordinate.
   */
  get y() {
    switch (this.style.direction) {
      case ArrowNodeDirection.RIGHT:
        return this.node.layout.y - this.handleOffset
      case ArrowNodeDirection.UP: {
        const offset = this.calculateHandleInDirectionOffset()
        return this.style.shape === ArrowStyleShape.PARALLELOGRAM
          ? this.node.layout.maxY - offset
          : this.node.layout.y + offset
      }
      case ArrowNodeDirection.LEFT:
        return this.style.shape === ArrowStyleShape.TRAPEZOID
          ? this.node.layout.maxY + this.handleOffset
          : this.node.layout.y - this.handleOffset
      case ArrowNodeDirection.DOWN: {
        const offset = this.calculateHandleInDirectionOffset()
        return this.style.shape === ArrowStyleShape.PARALLELOGRAM
          ? this.node.layout.y + offset
          : this.node.layout.maxY - offset
      }
    }
    return 0
  }
  /**
   * Clamps the {@link ArrowNodeStyle.angle} of the given style to a valid value.
   *
   * A valid angle is less than π / 2.
   * For styles using {@link ArrowStyleShape.PARALLELOGRAM} or {@link ArrowStyleShape.TRAPEZOID}
   * shape or having {@link ArrowNodeStyle.shaftRatio} 1, the angle also has to be bigger than
   * -π / 2, otherwise it has to be >= 0.
   *
   * @param style The style to return the clamped angle for.
   * @returns The angle of the style clamped to a valid value.
   */
  static getClampedAngle(style) {
    // clamp angle to be <= Math.PI/2
    let angle = Math.min(Math.PI * 0.5, style.angle)
    if (angle < 0) {
      // if a negative angle is set, check if the effective shaft ratio is 1
      if (
        style.shaftRatio >= 1 ||
        style.shape === ArrowStyleShape.PARALLELOGRAM ||
        style.shape === ArrowStyleShape.TRAPEZOID
      ) {
        // negative angle allowed but has to be > -Math.PI/2
        angle = Math.max(-Math.PI * 0.5, angle)
      } else {
        angle = 0
      }
    }
    return angle
  }
  /**
   * Returns the width of one arrow side for the given node layout and style.
   * @param nodeLayout The node layout whose size shall be used.
   * @param style The style whose shape and direction shall be used.
   * @returns The width of one arrow side for the given node layout and style.
   */
  static getArrowSideWidth(nodeLayout, style) {
    const shape = style.shape
    const isParallelogram = shape === ArrowStyleShape.PARALLELOGRAM
    const isTrapezoid = shape === ArrowStyleShape.TRAPEZOID
    const againstDirectionSize =
      style.direction === ArrowNodeDirection.UP || style.direction === ArrowNodeDirection.DOWN
        ? nodeLayout.width
        : nodeLayout.height
    // for parallelogram and trapezoid, one side of the arrow fills the full againstDirectionSize
    return againstDirectionSize * (isParallelogram || isTrapezoid ? 1 : 0.5)
  }
  /**
   * Returns the maximum possible arrow head length for the given node layout and style.
   * @param nodeLayout The node layout whose size shall be used.
   * @param style The style whose shape and direction shall be used.
   * @returns The maximum possible arrow head length for the given node layout and style.
   */
  static getMaxArrowHeadLength(nodeLayout, style) {
    const shape = style.shape
    const isTrapezoid = shape === ArrowStyleShape.TRAPEZOID
    const isDoubleArrow = shape === ArrowStyleShape.DOUBLE_ARROW
    const inDirectionSize =
      style.direction === ArrowNodeDirection.UP || style.direction === ArrowNodeDirection.DOWN
        ? nodeLayout.height
        : nodeLayout.width
    // for double arrow and trapezoid the arrow may only fill half the inDirectionSize
    return inDirectionSize * (isDoubleArrow || isTrapezoid ? 0.5 : 1)
  }
  /**
   * Calculates the length of the arrow head for the given node layout and style.
   * @param nodeLayout The layout of the node.
   * @param style The style whose shape and angle shall be considered.
   * @returns The length of the arrow head for the given style and node layout.
   */
  static getArrowHeadLength(nodeLayout, style) {
    const maxArrowLength = ArrowNodeStyleAngleHandle.getMaxArrowHeadLength(nodeLayout, style)
    const arrowSideWidth = ArrowNodeStyleAngleHandle.getArrowSideWidth(nodeLayout, style)
    const angle = ArrowNodeStyleAngleHandle.getClampedAngle(style)
    const maxHeadLength = arrowSideWidth * Math.tan(Math.abs(angle))
    return Math.min(maxHeadLength, maxArrowLength)
  }
  /**
   * Calculates the offset of the current handle location to the location corresponding to an angle
   * of 0.
   * @returns The offset of the current handle location to the location corresponding to an angle of
   * 0.
   */
  calculateHandleInDirectionOffset() {
    const headLength = ArrowNodeStyleAngleHandle.getArrowHeadLength(this.node.layout, this.style)
    const arrowSideWidth = ArrowNodeStyleAngleHandle.getArrowSideWidth(this.node.layout, this.style)
    const scaledHeadLength = (headLength * (this.handleOffset + arrowSideWidth)) / arrowSideWidth
    const angle = ArrowNodeStyleAngleHandle.getClampedAngle(this.style)
    return angle >= 0 ? scaledHeadLength : headLength - scaledHeadLength
  }
  /**
   * Creates the line that visualizes the angle during the drag.
   */
  createVisual(context) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('stroke', 'goldenrod')
    line.setAttribute('stroke-width', '2')
    const group = new SvgVisualGroup()
    group.add(new SvgVisual(line))
    return this.updateVisual(context, group)
  }
  /**
   * Updates the line that visualizes the angle during the drag.
   */
  updateVisual(context, group) {
    group.transform = context.viewTransform
    // line shall point from handle to arrow tip
    const lineVisual = group.children.first()
    const line = lineVisual.svgElement
    // synchronize first line point with handle location
    const fromWorld = this.location.toPoint()
    const fromView = context.worldToViewCoordinates(fromWorld)
    line.x1.baseVal.value = fromView.x
    line.y1.baseVal.value = fromView.y
    // synchronize second line point with arrow tip
    const nodeLayout = this.node.layout
    const isParallelogram = this.style.shape === ArrowStyleShape.PARALLELOGRAM
    const isTrapezoid = this.style.shape === ArrowStyleShape.TRAPEZOID
    const againstDirectionRatio = isParallelogram || isTrapezoid ? 1 : 0.5
    let toWorldX = 0
    let toWorldY = 0
    // for negative angles, the arrow tip is moved
    const arrowTipOffset =
      this.style.angle < 0
        ? ArrowNodeStyleAngleHandle.getArrowHeadLength(this.node.layout, this.style)
        : 0
    switch (this.style.direction) {
      case ArrowNodeDirection.RIGHT: {
        toWorldX = isParallelogram
          ? nodeLayout.x + arrowTipOffset
          : nodeLayout.maxX - arrowTipOffset
        toWorldY = nodeLayout.y + nodeLayout.height * againstDirectionRatio
        break
      }
      case ArrowNodeDirection.LEFT: {
        toWorldX = isParallelogram
          ? nodeLayout.maxX - arrowTipOffset
          : nodeLayout.x + arrowTipOffset
        toWorldY = isTrapezoid
          ? nodeLayout.y
          : nodeLayout.y + nodeLayout.height * againstDirectionRatio
        break
      }
      case ArrowNodeDirection.UP: {
        toWorldX = nodeLayout.x + nodeLayout.width * againstDirectionRatio
        toWorldY = isParallelogram
          ? nodeLayout.maxY - arrowTipOffset
          : nodeLayout.y + arrowTipOffset
        break
      }
      case ArrowNodeDirection.DOWN: {
        toWorldX = isTrapezoid
          ? nodeLayout.x
          : nodeLayout.x + nodeLayout.width * againstDirectionRatio
        toWorldY = isParallelogram
          ? nodeLayout.y + arrowTipOffset
          : nodeLayout.maxY - arrowTipOffset
        break
      }
    }
    const toView = context.worldToViewCoordinates(new Point(toWorldX, toWorldY))
    line.x2.baseVal.value = toView.x
    line.y2.baseVal.value = toView.y
    return group
  }
}
