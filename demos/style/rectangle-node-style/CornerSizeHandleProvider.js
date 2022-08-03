/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ClickEventArgs,
  Cursor,
  HandleTypes,
  ICanvasObject,
  IEnumerable,
  IHandle,
  IHandleProvider,
  IInputModeContext,
  INode,
  IPoint,
  IRenderContext,
  IVisualCreator,
  Point,
  RectangleCorners,
  RectangleNodeStyle,
  SvgVisual,
  SvgVisualGroup
} from 'yfiles'

/**
 * An {@link IHandleProvider} for nodes using a {@link RectangleNodeStyle} that provides
 * a single {@link CornerSizeHandle} to change the
 * {@link RectangleNodeStyle.cornerSize} of the node style interactively.
 */
export default class CornerSizeHandleProvider extends BaseClass(IHandleProvider) {
  /**
   * Initializes a new instance of the provider with an optional `delegateProvider`
   * whose handles are also returned.
   *
   * @param {!INode} node The node to provide handles for
   * @param delegateProvider The wrapped {@link IHandleProvider} implementation
   * @param {?IHandleProvider} [delegateProvider=null]
   */
  constructor(node, delegateProvider = null) {
    super()
    this.delegateProvider = delegateProvider
    this.node = node
  }

  /**
   * Returns the corner size handle, as well as all handles provided by the
   * `delegateProvider`.
   * @param {!IInputModeContext} context
   * @returns {!IEnumerable.<IHandle>}
   */
  getHandles(context) {
    const handles = []
    if (this.delegateProvider) {
      handles.push(...this.delegateProvider.getHandles(context))
    }
    if (this.node.style instanceof RectangleNodeStyle) {
      handles.push(new CornerSizeHandle(this.node))
    }
    return IEnumerable.from(handles)
  }
}

/**
 * An {@link IHandle} for nodes with a {@link RectangleNodeStyle} to change the
 * {@link RectangleNodeStyle.cornerSize} interactively.
 */
class CornerSizeHandle extends BaseClass(IHandle, IPoint, IVisualCreator) {
  /**
   * Initializes a new instance for the given node.
   *
   * @param {!INode} node The node whose style is changed.
   */
  constructor(node) {
    super()
    this.node = node
    this.initialCornerSize = 0
    this.currentCornerSize = 0
    this.cornerRectCanvasObject = null
    this.style = node.style
  }

  /**
   * Returns the handle's location.
   * @type {!IPoint}
   */
  get location() {
    return this
  }

  /**
   * Returns the handle's type. This is merely a visual difference, not a semantic one.
   * @type {!HandleTypes}
   */
  get type() {
    return HandleTypes.DEFAULT | HandleTypes.VARIANT2
  }

  /**
   * Returns the desired mouse pointer when interacting with the handle.
   * @type {!Cursor}
   */
  get cursor() {
    return Cursor.NS_RESIZE
  }

  /**
   * Initializes the drag gesture and adds a rectangle representing the top-left corner of the node
   * using the absolute {@link RectangleNodeStyle.cornerSize} to the view.
   *
   * @param {!IInputModeContext} context The current input mode context.
   */
  initializeDrag(context) {
    this.initialCornerSize = this.getCornerSize()
    this.currentCornerSize = this.initialCornerSize
    this.cornerRectCanvasObject = context.canvasComponent.inputModeGroup.addChild(this)
  }

  /**
   * Calculates the new corner size, depending on the new mouse location and updates the node
   * style and corner visualization.
   *
   * @param {!IInputModeContext} context The current input mode context.
   * @param {!Point} originalLocation The original handle location.
   * @param {!Point} newLocation The new mouse location.
   */
  handleMove(context, originalLocation, newLocation) {
    // determine delta for the corner size
    const dy = newLocation.y - originalLocation.y
    // ... and clamp to valid values
    this.currentCornerSize = Math.max(
      0,
      Math.min(this.initialCornerSize + dy, this.getMaximumCornerSize())
    )
    this.setCornerSize(this.currentCornerSize)
  }

  /**
   * Sets the corner size for the new location and removes the corner visualization.
   *
   * @param {!IInputModeContext} context The current input mode context.
   * @param {!Point} originalLocation The original handle location.
   * @param {!Point} newLocation The new mouse location.
   */
  dragFinished(context, originalLocation, newLocation) {
    this.setCornerSize(this.currentCornerSize)
    this.cornerRectCanvasObject?.remove()
  }

  /**
   * Resets the initial corner size and removes the corner visualization.
   *
   * @param {!IInputModeContext} context The current input mode context.
   * @param {!Point} originalLocation The original handle location.
   */
  cancelDrag(context, originalLocation) {
    this.setCornerSize(this.initialCornerSize)
    this.cornerRectCanvasObject?.remove()
  }

  /**
   * Returns the absolute corner size of the current node's style.
   *
   * This reflects the {@link RectangleNodeStyle.scaleCornerSize} property of the style and clamps
   * the size to where the style would restrict it as well.
   * This ensures that the handle always appears where the corner ends visually.
   * @returns {number}
   */
  getCornerSize() {
    const layout = this.node.layout
    const smallerSize = Math.min(layout.width, layout.height)
    const cornerSize = this.style.scaleCornerSize
      ? this.style.cornerSize * smallerSize
      : this.style.cornerSize
    return Math.min(this.getMaximumCornerSize(), cornerSize)
  }

  /**
   * Sets the {@link RectangleNodeStyle.cornerSize} considering whether the
   * {@link RectangleNodeStyle.scaleCornerSize corner size is scaled}.
   * @param {number} cornerSize
   */
  setCornerSize(cornerSize) {
    if (this.style.scaleCornerSize) {
      const layout = this.node.layout
      this.style.cornerSize = cornerSize / Math.min(layout.height, layout.width)
    } else {
      this.style.cornerSize = cornerSize
    }
  }

  /**
   * Determines the maximum corner size based on the style's current settings.
   * @returns {number}
   */
  getMaximumCornerSize() {
    const corners = this.style.corners
    const layout = this.node.layout
    // if two corners can meet, the maximum size is half the height/width instead
    const maxHeight =
      (corners & RectangleCorners.LEFT) == RectangleCorners.LEFT ||
      (corners & RectangleCorners.RIGHT) == RectangleCorners.RIGHT
        ? layout.height * 0.5
        : layout.height
    const maxWidth =
      (corners & RectangleCorners.TOP) == RectangleCorners.TOP ||
      (corners & RectangleCorners.BOTTOM) == RectangleCorners.BOTTOM
        ? layout.width * 0.5
        : layout.width

    return Math.min(maxWidth, maxHeight)
  }

  /**
   * This implementation does nothing special when clicked.
   * @param {!ClickEventArgs} evt
   */
  handleClick(evt) {}

  // IPoint for the handle's location

  /**
   * The handle's x coordinate.
   * @type {number}
   */
  get x() {
    return this.node.layout.x
  }

  /**
   * The handle's y coordinate.
   * @type {number}
   */
  get y() {
    return this.node.layout.y + this.getCornerSize()
  }

  // IVisualCreator implementation for the rectangle overlay

  /**
   * Creates the rectangle overlay during the drag operation.
   * @param {!IRenderContext} context
   * @returns {!SvgVisualGroup}
   */
  createVisual(context) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('fill', 'none')
    rect.setAttribute('stroke', 'cornflowerblue')
    rect.setAttribute('stroke-width', '2px')
    const group = new SvgVisualGroup()
    group.add(new SvgVisual(rect))
    return this.updateVisual(context, group)
  }

  /**
   * Updates the rectangle overlay during the drag operation.
   * @param {!IRenderContext} context
   * @param {!SvgVisualGroup} group
   * @returns {!SvgVisualGroup}
   */
  updateVisual(context, group) {
    group.transform = context.viewTransform
    const rectVisual = group.children.get(0)
    const rect = rectVisual.svgElement

    const topLeftView = context.toViewCoordinates(this.node.layout.topLeft)
    const cornerSizeView = this.getCornerSize() * context.zoom
    rect.x.baseVal.value = topLeftView.x
    rect.y.baseVal.value = topLeftView.y
    rect.width.baseVal.value = cornerSizeView
    rect.height.baseVal.value = cornerSizeView

    return group
  }
}
