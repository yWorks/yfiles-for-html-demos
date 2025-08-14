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
  delegate,
  type GraphComponent,
  HandleInputMode,
  HandlePositions,
  HandlesRenderer,
  type IHandle,
  IHitTestable,
  type IInputModeContext,
  type IMutableRectangle,
  type IPoint,
  IPositionHandler,
  type IRenderContext,
  type IRenderTreeElement,
  IVisualCreator,
  MoveInputMode,
  MultiplexingInputMode,
  MutableRectangle,
  ObservableCollection,
  Point,
  Rect,
  RectangleHandle,
  RenderMode,
  type Size,
  SvgVisual
} from '@yfiles/yfiles'
import { defaultStyling, type TimeFrameStyle } from './Styling'

type BoundsChangedListener = (bounds: Rect) => void

/**
 * The rectangular window element of the timeline with support for user interaction.
 */
export class TimeframeRectangle {
  readonly rect: MutableRectangle = new MutableRectangle(0, 0, 0, 0)

  private readonly visual: RectangleVisual
  private renderTreeElement: IRenderTreeElement | null = null

  private readonly handleInputMode: HandleInputMode
  private readonly moveInputMode: MoveInputMode
  private readonly positionHandler: RectanglePositionHandler

  private boundsChangedListener: BoundsChangedListener | null = null

  constructor(
    private readonly graphComponent: GraphComponent,
    private readonly style?: TimeFrameStyle
  ) {
    // the actual visualization of the timeframe
    this.visual = new RectangleVisual(this.rect, style)

    // creates the handle input mode that manages the handles of the rectangle
    const rectangle = this.rect
    this.handleInputMode = new HandleInputMode({
      priority: 0,
      handlesRenderer: new HandlesRenderer(RenderMode.SVG),
      handles: new ObservableCollection<IHandle>([
        new RectangleHandle(HandlePositions.RIGHT, rectangle),
        new RectangleHandle(HandlePositions.LEFT, rectangle)
      ])
    })

    const onBoundsChanged = this.onBoundsChanged.bind(this)

    // add the listeners of dragging events
    this.handleInputMode.addEventListener('drag-finished', onBoundsChanged)
    this.handleInputMode.addEventListener('dragging', onBoundsChanged)

    // creates the move input mode that manages the movement of the rectangle
    this.positionHandler = new RectanglePositionHandler(rectangle)
    this.moveInputMode = new MoveInputMode({
      hitTestable: IHitTestable.create((context, location) =>
        rectangle.contains(location, context.hitTestRadius + 3 / context.zoom)
      ),
      positionHandler: this.positionHandler,
      priority: 1
    })
    this.moveInputMode.addEventListener('drag-finished', onBoundsChanged)
    this.moveInputMode.addEventListener('dragging', onBoundsChanged)

    this.arm()
  }

  setBounds(bounds: Rect, silent = false): void {
    this.rect.setShape(bounds)
    if (!silent) {
      this.onBoundsChanged()
    }
  }

  get bounds(): Rect {
    return this.rect.toRect()
  }

  set limits(limits: Rect) {
    this.positionHandler.limits = limits
  }

  get limits(): Rect {
    return this.positionHandler.limits
  }

  setBoundsChangedListener(listener: BoundsChangedListener): void {
    this.boundsChangedListener = delegate.combine(this.boundsChangedListener, listener)
  }

  removeBoundsChangedListener(listener: BoundsChangedListener): void {
    this.boundsChangedListener = delegate.remove(this.boundsChangedListener, listener)
  }

  onBoundsChanged(): void {
    this.boundsChangedListener?.(this.rect.toRect())
  }

  private arm(): void {
    this.renderTreeElement = this.graphComponent.renderTree.createElement(
      this.graphComponent.renderTree.backgroundGroup,
      this.visual
    )

    const inputMode = this.graphComponent.inputMode
    if (!(inputMode instanceof MultiplexingInputMode)) {
      throw new Error('RectangleIndicator requires a MultiplexingInputMode')
    }

    inputMode.add(this.handleInputMode)
    inputMode.add(this.moveInputMode)
  }

  cleanup(): void {
    if (this.renderTreeElement) {
      this.graphComponent.renderTree.remove(this.renderTreeElement)
      this.renderTreeElement = null
    }
    const inputMode = this.graphComponent.inputMode as MultiplexingInputMode
    inputMode.remove(this.handleInputMode)
    inputMode.remove(this.moveInputMode)
  }
}

type Cache = SvgVisual & { cache?: { size: Size; location: Point } }

class RectangleVisual extends BaseClass(IVisualCreator) {
  /**
   * Creates a new instance of RectangleVisual.
   *
   * @param rectangle The rectangle that determines the bounds of this visual object.
   * @param style The styling for the rectangle
   */
  constructor(
    public rectangle: MutableRectangle,
    private readonly style?: TimeFrameStyle
  ) {
    super()
  }

  /**
   * Creates the rectangle.
   */
  createVisual(context: IRenderContext): SvgVisual {
    const svgNamespace = 'http://www.w3.org/2000/svg'
    const container = window.document.createElementNS(svgNamespace, 'g')
    const rect = window.document.createElementNS(svgNamespace, 'rect')
    rect.setAttribute('class', 'time-frame-rect')
    rect.setAttribute('x', '0')
    rect.setAttribute('y', '0')
    rect.setAttribute('width', String(this.rectangle.width))
    rect.setAttribute('height', String(this.rectangle.height))
    rect.setAttribute('stroke-width', '3')
    rect.setAttribute('stroke', this.style?.stroke ?? defaultStyling.timeframe!.stroke!)
    rect.setAttribute('stroke-opacity', '1')
    rect.setAttribute('fill', this.style?.fill ?? defaultStyling.timeframe!.fill!)
    rect.setAttribute('fill-opacity', '1')

    container.appendChild(rect)

    container.setAttribute('transform', `translate(${this.rectangle.x} ${this.rectangle.y})`)

    const svgVisual: Cache = new SvgVisual(container)
    svgVisual.cache = {
      location: new Point(this.rectangle.x, this.rectangle.y),
      size: this.rectangle.toSize()
    }
    return svgVisual
  }

  /**
   * Updates the rectangle to improve performance.
   */
  updateVisual(context: IRenderContext, oldVisual: SvgVisual): SvgVisual {
    const svgVisual = oldVisual as SvgVisual & Cache
    const container = svgVisual.svgElement
    const oldDataCache = svgVisual.cache
    const newDataCache = {
      location: new Point(this.rectangle.x, this.rectangle.y),
      size: this.rectangle.toSize()
    }

    if (!newDataCache.size.equals(oldDataCache?.size)) {
      container.firstElementChild!.setAttribute('width', String(this.rectangle.width))
      container.firstElementChild!.setAttribute('height', String(this.rectangle.height))
    }

    if (!newDataCache.location.equals(oldDataCache?.location)) {
      container.setAttribute('transform', `translate(${this.rectangle.x} ${this.rectangle.y})`)
    }

    svgVisual.cache = newDataCache

    return svgVisual
  }
}

class RectanglePositionHandler extends BaseClass(IPositionHandler) {
  private initialPosition = new Point(0, 0)

  constructor(
    private readonly rectangle: IMutableRectangle,
    public limits: Rect = Rect.INFINITE
  ) {
    super()
  }

  get location(): IPoint {
    return this.rectangle.topLeft
  }

  initializeDrag(context: IInputModeContext): void {
    this.initialPosition = this.location.toPoint()
  }

  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    this.updatePosition(originalLocation, newLocation)
  }

  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    this.updatePosition(originalLocation, newLocation)
  }

  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    this.rectangle.setLocation(originalLocation)
  }

  private updatePosition(originalLocation: Point, newLocation: Point): void {
    const delta = newLocation.subtract(originalLocation)
    this.rectangle.setLocation(this.limit(this.initialPosition.add(delta)))
  }

  private limit(newLocation: Point): Point {
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

  private static limitNumber(
    pos: number,
    length: number,
    limitMin: number,
    limitMax: number
  ): number {
    if (pos < limitMin) {
      return limitMin
    } else if (pos + length > limitMax) {
      return limitMax - length
    }
    return pos
  }
}
