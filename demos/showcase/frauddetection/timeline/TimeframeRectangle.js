/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  delegate,
  HandleInputMode,
  HandlePositions,
  ICanvasObjectDescriptor,
  IHitTestable,
  IPositionHandler,
  IVisualCreator,
  MoveInputMode,
  MultiplexingInputMode,
  MutableRectangle,
  ObservableCollection,
  Point,
  Rect,
  RectangleHandle,
  RenderModes,
  SvgVisual
} from 'yfiles'
import { defaultStyling } from './Styling.js'

/**
 * @typedef {function} BoundsChangedListener
 */

/**
 * The rectangular window element of the timeline with support for user interaction.
 */
export class TimeframeRectangle {
  rect = new MutableRectangle(0, 0, 0, 0)

  visual = null
  canvasObject = null

  handleInputMode
  moveInputMode
  positionHandler

  boundsChangedListener = null

  /**
   * @param {!GraphComponent} graphComponent
   * @param {!TimeFrameStyle} [style]
   */
  constructor(graphComponent, style) {
    this.style = style
    this.graphComponent = graphComponent
    // the actual visualization of the timeframe
    this.visual = new RectangleVisual(this.rect, style)

    // creates the handle input mode that manages the handles of the rectangle
    const rectangle = this.rect
    this.handleInputMode = new HandleInputMode({
      priority: 0,
      renderMode: RenderModes.SVG,
      handles: new ObservableCollection([
        new RectangleHandle(HandlePositions.EAST, rectangle),
        new RectangleHandle(HandlePositions.WEST, rectangle)
      ])
    })

    const onBoundsChanged = this.onBoundsChanged.bind(this)

    // add the listeners of dragging events
    this.handleInputMode.addDragFinishedListener(onBoundsChanged)
    this.handleInputMode.addDraggingListener(onBoundsChanged)

    // creates the move input mode that manages the movement of the rectangle
    this.positionHandler = new RectanglePositionHandler(rectangle)
    this.moveInputMode = new MoveInputMode({
      hitTestable: IHitTestable.create((context, location) =>
        rectangle.containsWithEps(location, context.hitTestRadius + 3 / context.zoom)
      ),
      positionHandler: this.positionHandler,
      priority: 1
    })
    this.moveInputMode.addDragFinishedListener(onBoundsChanged)
    this.moveInputMode.addDraggingListener(onBoundsChanged)

    this.arm()
  }

  /**
   * @param {!Rect} bounds
   * @param {boolean} [silent=false]
   */
  setBounds(bounds, silent = false) {
    this.rect.reshape(bounds)
    if (!silent) {
      this.onBoundsChanged()
    }
  }

  /**
   * @type {!Rect}
   */
  get bounds() {
    return this.rect.toRect()
  }

  /**
   * @type {!Rect}
   */
  set limits(limits) {
    this.positionHandler.limits = limits
  }

  /**
   * @type {!Rect}
   */
  get limits() {
    return this.positionHandler.limits
  }

  /**
   * @param {!BoundsChangedListener} listener
   */
  addBoundsChangedListener(listener) {
    this.boundsChangedListener = delegate.combine(this.boundsChangedListener, listener)
  }

  /**
   * @param {!BoundsChangedListener} listener
   */
  removeBoundsChangedListener(listener) {
    this.boundsChangedListener = delegate.remove(this.boundsChangedListener, listener)
  }

  onBoundsChanged() {
    this.boundsChangedListener?.(this.rect.toRect())
  }

  arm() {
    this.canvasObject = this.graphComponent.backgroundGroup.addChild(
      this.visual,
      ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )

    const inputMode = this.graphComponent.inputMode
    if (!(inputMode instanceof MultiplexingInputMode)) {
      throw new Error('RectangleIndicator requires a MultiplexingInputMode')
    }

    inputMode.add(this.handleInputMode)
    inputMode.add(this.moveInputMode)
  }

  cleanup() {
    this.canvasObject?.remove()
    this.canvasObject = null
    const inputMode = this.graphComponent.inputMode
    inputMode.remove(this.handleInputMode)
    inputMode.remove(this.moveInputMode)
  }
}

/**
 * @typedef {*} Cache
 */

class RectangleVisual extends BaseClass(IVisualCreator) {
  /**
   * Creates a new instance of RectangleVisual.
   *
   * @param {!MutableRectangle} rectangle The rectangle that determines the bounds of this visual object.
   * @param style The styling for the rectangle
   * @param {!TimeFrameStyle} [style]
   */
  constructor(rectangle, style) {
    super()
    this.style = style
    this.rectangle = rectangle
  }

  /**
   * Creates the rectangle.
   * @param {!IRenderContext} context
   * @returns {!SvgVisual}
   */
  createVisual(context) {
    const svgNamespace = 'http://www.w3.org/2000/svg'
    const container = window.document.createElementNS(svgNamespace, 'g')
    const rect = window.document.createElementNS(svgNamespace, 'rect')
    rect.setAttribute('class', 'time-frame-rect')
    rect.setAttribute('x', '0')
    rect.setAttribute('y', '0')
    rect.setAttribute('width', String(this.rectangle.width))
    rect.setAttribute('height', String(this.rectangle.height))
    rect.setAttribute('stroke-width', '3')
    rect.setAttribute('stroke', this.style?.stroke ?? defaultStyling.timeframe.stroke)
    rect.setAttribute('stroke-opacity', '1')
    rect.setAttribute('fill', this.style?.fill ?? defaultStyling.timeframe.fill)
    rect.setAttribute('fill-opacity', '1')

    container.appendChild(rect)

    container.setAttribute('transform', `translate(${this.rectangle.x} ${this.rectangle.y})`)

    const svgVisual = new SvgVisual(container)
    svgVisual.cache = {
      location: new Point(this.rectangle.x, this.rectangle.y),
      size: this.rectangle.toSize()
    }
    return svgVisual
  }

  /**
   * Updates the rectangle to improve performance.
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual) {
    const svgVisual = oldVisual
    const container = svgVisual.svgElement
    const oldDataCache = svgVisual.cache
    const newDataCache = {
      location: new Point(this.rectangle.x, this.rectangle.y),
      size: this.rectangle.toSize()
    }

    if (!newDataCache.size.equals(oldDataCache?.size)) {
      container.firstElementChild.setAttribute('width', String(this.rectangle.width))
      container.firstElementChild.setAttribute('height', String(this.rectangle.height))
    }

    if (!newDataCache.location.equals(oldDataCache?.location)) {
      container.setAttribute('transform', `translate(${this.rectangle.x} ${this.rectangle.y})`)
    }

    svgVisual.cache = newDataCache

    return svgVisual
  }
}

class RectanglePositionHandler extends BaseClass(IPositionHandler) {
  initialPosition = new Point(0, 0)

  /**
   * @param {!IMutableRectangle} rectangle
   * @param {!Rect} limits
   */
  constructor(rectangle, limits = Rect.INFINITE) {
    super()
    this.limits = limits
    this.rectangle = rectangle
  }

  /**
   * @type {!IPoint}
   */
  get location() {
    return this.rectangle.topLeft
  }

  /**
   * @param {!IInputModeContext} context
   */
  initializeDrag(context) {
    this.initialPosition = this.location.toPoint()
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  handleMove(context, originalLocation, newLocation) {
    this.updatePosition(originalLocation, newLocation)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  dragFinished(context, originalLocation, newLocation) {
    this.updatePosition(originalLocation, newLocation)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   */
  cancelDrag(context, originalLocation) {
    this.rectangle.relocate(originalLocation)
  }

  /**
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  updatePosition(originalLocation, newLocation) {
    const delta = newLocation.subtract(originalLocation)
    this.rectangle.relocate(this.limit(this.initialPosition.add(delta)))
  }

  /**
   * @param {!Point} newLocation
   * @returns {!Point}
   */
  limit(newLocation) {
    return new Point(
      RectanglePositionHandler.limitNumber(
        newLocation.x,
        this.rectangle.width,
        this.limits.x,
        this.limits.maxX
      ),
      RectanglePositionHandler.limitNumber(
        newLocation.y,
        this.rectangle.height,
        this.limits.y,
        this.limits.maxY
      )
    )
  }

  /**
   * @param {number} pos
   * @param {number} length
   * @param {number} limitMin
   * @param {number} limitMax
   * @returns {number}
   */
  static limitNumber(pos, length, limitMin, limitMax) {
    if (pos < limitMin) {
      return limitMin
    } else if (pos + length > limitMax) {
      return limitMax - length
    }
    return pos
  }
}
