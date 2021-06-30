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
  BezierEdgeStyle,
  CanvasComponent,
  EdgeStyleDecorationInstaller,
  Exception,
  GraphComponent,
  HighlightIndicatorManager,
  ICanvasObjectGroup,
  ICanvasObjectInstaller,
  IEdge,
  IInputModeContext,
  ILabel,
  ILabelModelParameter,
  ILabelOwner,
  IModelItem,
  INode,
  IPoint,
  IPositionHandler,
  LabelStyleDecorationInstaller,
  NodeStyleLabelStyleAdapter,
  Point,
  ShapeNodeShape,
  ShapeNodeStyle,
  SimpleLabel,
  Size,
  SolidColorFill,
  Stroke,
  StyleDecorationZoomPolicy,
  UndoUnitBase,
  VoidLabelStyle
} from 'yfiles'

/**
 * This class adds an HTML panel on top of the contents of the graphComponent that can
 * display arbitrary information about a {@link IModelItem graph item}.
 * In order to not interfere with the positioning of the pop-up, HTML content
 * should be added as ancestor of the {@link SankeyPopupSupport#div div element}, and
 * use relative positioning. This implementation uses a
 * {@link ILabelModelParameter label model parameter} to determine
 * the position of the pop-up.
 */
export class SankeyPopupSupport {
  graphComponent: GraphComponent
  labelModelParameter: ILabelModelParameter
  private $div: HTMLElement
  private $currentItem: IModelItem | null
  private $dirty: boolean

  /**
   * Constructor that takes the graphComponent, the container div element and an
   * ILabelModelParameter to determine the relative position of the popup.
   * @param graphComponent The given graphComponent.
   * @param div The div element.
   * @param labelModelParameter The label model parameter that determines
   * the position of the pop-up.
   */
  constructor(
    graphComponent: GraphComponent,
    div: HTMLElement,
    labelModelParameter: ILabelModelParameter
  ) {
    this.graphComponent = graphComponent
    this.labelModelParameter = labelModelParameter
    this.$div = div
    this.$currentItem = null
    this.$dirty = false

    // make the popup invisible
    div.style.opacity = '0'
    div.style.display = 'none'

    this.registerListeners()
  }

  /**
   * Sets the container {@link HTMLPopupSupport#div div element}.
   * @param value The div element to be set.
   */
  set div(value: HTMLElement) {
    this.$div = value
  }

  /**
   * Gets the container {@link HTMLPopupSupport#div div element}.
   */
  get div(): HTMLElement {
    return this.$div
  }

  /**
   * Sets the {@link IModelItem item} to display information for.
   * Setting this property to a value other than null shows the pop-up.
   * Setting the property to null hides the pop-up.
   * @param value The current item.
   */
  set currentItem(value: IModelItem | null) {
    if (value === this.$currentItem) {
      return
    }
    this.$currentItem = value
    if (value !== null) {
      this.show()
    } else {
      this.hide()
    }
  }

  /**
   * Gets the {@link IModelItem item} to display information for.
   * @return The item to display information for
   */
  get currentItem(): IModelItem | null {
    return this.$currentItem
  }

  /**
   * Sets the flag for the current position is no longer valid.
   * @param value True if the current position is no longer valid, false otherwise.
   */
  set dirty(value: boolean) {
    this.$dirty = value
  }

  /**
   * Gets the flag for the current position is no longer valid.
   * @return True if the current position is no longer valid, false otherwise
   */
  get dirty(): boolean {
    return this.$dirty
  }

  /**
   * Registers viewport, node bounds changes and visual tree listeners to the given graphComponent.
   */
  registerListeners(): void {
    // Adds listener for viewport changes
    this.graphComponent.addViewportChangedListener((): void => {
      if (this.currentItem) {
        this.dirty = true
      }
    })

    // Adds listeners for node bounds changes
    this.graphComponent.graph.addNodeLayoutChangedListener((source: object, node: INode): void => {
      if (this.currentItem && this.currentItem === node) {
        this.dirty = true
      }

      if (IEdge.isInstance(this.currentItem)) {
        const sourcePort = this.currentItem.sourcePort
        const targetPort = this.currentItem.targetPort

        if (
          (sourcePort && node === sourcePort.owner) ||
          (targetPort && node === targetPort.owner)
        ) {
          this.dirty = true
        }
      }
    })

    // Adds listener for updates of the visual tree
    this.graphComponent.addUpdatedVisualListener((): void => {
      if (this.currentItem && this.dirty) {
        this.dirty = false
        this.updateLocation()
      }
    })
  }

  /**
   * Makes this pop-up visible near the given item.
   */
  show(): void {
    this.div.style.display = 'block'
    this.div.style.opacity = '1'
    this.updateLocation()
  }

  /**
   * Hides this pop-up.
   */
  hide(): void {
    this.div.style.opacity = '0'
    this.div.style.display = 'none'
  }

  /**
   * Changes the location of this pop-up to the location calculated by the
   * {@link HTMLPopupSupport#labelModelParameter}. Currently, this implementation does not support
   * rotated pop-ups.
   */
  updateLocation(): void {
    if (!this.currentItem && !this.labelModelParameter) {
      return
    }
    const width = this.div.clientWidth
    const height = this.div.clientHeight
    const zoom = this.graphComponent.zoom

    const dummyLabel = new SimpleLabel(
      this.currentItem as ILabelOwner,
      '',
      this.labelModelParameter
    )
    if (this.labelModelParameter.supports(dummyLabel)) {
      dummyLabel.preferredSize = new Size(width / zoom, height / zoom)
      const newLayout = this.labelModelParameter.model.getGeometry(
        dummyLabel,
        this.labelModelParameter
      )
      this.setLocation(newLayout.anchorX, newLayout.anchorY - (height + 10) / zoom)
    }
  }

  /**
   * Sets the location of this pop-up to the given world coordinates.
   * @param x The target x-coordinate of the pop-up.
   * @param y The target y-coordinate of the pop-up.
   */
  setLocation(x: number, y: number): void {
    // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
    const viewPoint = this.graphComponent.toViewCoordinates(new Point(x, y))
    this.div.style.left = `${viewPoint.x}px`
    this.div.style.top = `${viewPoint.y}px`
  }
}

/**
 * This class provides undo/redo for an operation changing tag data.
 */
export class TagUndoUnit extends UndoUnitBase {
  oldTag: object
  newTag: object
  item: IModelItem
  undoRedoCallback: Function | null

  /**
   * The constructor
   * @param undoName Name of the undo operation
   * @param redoName Name of the redo operation
   * @param oldTag The data to restore the previous state
   * @param newTag The data to restore the next state
   * @param item The owner of the tag
   * @param undoRedoCallback Callback
   */
  constructor(
    undoName: string,
    redoName: string,
    oldTag: object,
    newTag: object,
    item: IModelItem,
    undoRedoCallback: Function | null
  ) {
    super(undoName, redoName)
    this.oldTag = oldTag
    this.newTag = newTag
    this.item = item
    this.undoRedoCallback = undoRedoCallback
  }

  /**
   * Undoes the work that is represented by this unit.
   */
  undo(): void {
    this.item.tag = this.oldTag
    this.undoRedoCallback && this.undoRedoCallback()
  }

  /**
   * Redoes the work that is represented by this unit.
   */
  redo(): void {
    this.item.tag = this.newTag
    this.undoRedoCallback && this.undoRedoCallback()
  }
}

/**
 * A custom position handler which constrains the movement along the y axis.
 * This implementation wraps the default position handler and delegates most of the work to it.
 */
export class ConstrainedPositionHandler extends BaseClass(IPositionHandler) {
  handler: IPositionHandler | null
  private lastLocation = Point.ORIGIN

  constructor(handler: IPositionHandler | null) {
    super()
    this.handler = handler
  }

  get location(): IPoint {
    if (this.handler) {
      return this.handler.location
    }
    throw new Exception('IPositionHandler === null')
  }

  initializeDrag(context: IInputModeContext): void {
    if (this.handler === null) {
      return
    }
    this.handler.initializeDrag(context)
    this.lastLocation = this.handler.location.toPoint()
  }

  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    if (this.handler === null) {
      return
    }
    // only move along the y axis, keep the original x coordinate
    newLocation = new Point(originalLocation.x, newLocation.y)
    if (!newLocation.equalsEps(this.lastLocation, 0)) {
      // delegate to the wrapped handler for the actual move
      this.handler.handleMove(context, originalLocation, newLocation)
      // remember the location
      this.lastLocation = newLocation
    }
  }

  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    if (this.handler === null) {
      return
    }
    this.handler.cancelDrag(context, originalLocation)
  }

  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    if (this.handler === null) {
      return
    }
    this.handler.dragFinished(context, originalLocation, newLocation)
  }
}

/**
 * A highlight manager responsible for highlighting edges and labels. In particular, edge highlighting should remain
 * below the label group.
 */
export class HighlightManager extends HighlightIndicatorManager<IModelItem> {
  edgeHighlightGroup: ICanvasObjectGroup

  /**
   * Creates a new instance of HighlightManager.
   */
  constructor(canvas: CanvasComponent) {
    super(canvas)
    const graphModelManager = (this.canvasComponent as GraphComponent).graphModelManager
    this.edgeHighlightGroup = graphModelManager.contentGroup.addGroup()
    this.edgeHighlightGroup.below(graphModelManager.edgeLabelGroup)
  }

  /**
   * This implementation always returns the highlightGroup of the canvasComponent of this instance.
   * @param item The item to check
   * @return An ICanvasObjectGroup or null
   */
  getCanvasObjectGroup(item: IModelItem): ICanvasObjectGroup {
    if (IEdge.isInstance(item)) {
      return this.edgeHighlightGroup
    }
    const canvasObjectGroup = super.getCanvasObjectGroup(item)
    if (canvasObjectGroup === null) {
      throw new Exception('ICanvasObjectGroup === null')
    }
    return canvasObjectGroup
  }

  /**
   * Callback used by install to retrieve the installer for a given item.
   * @param item The item to find an installer for
   * @return The Highlighting installer
   */
  getInstaller(item: IModelItem): ICanvasObjectInstaller {
    if (IEdge.isInstance(item)) {
      return new EdgeStyleDecorationInstaller({
        edgeStyle: new BezierEdgeStyle({
          stroke: new Stroke(new SolidColorFill(item.tag.color), item.tag.thickness)
        }),
        zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
      })
    } else if (ILabel.isInstance(item)) {
      return new LabelStyleDecorationInstaller({
        labelStyle: new NodeStyleLabelStyleAdapter(
          new ShapeNodeStyle({
            shape: ShapeNodeShape.ROUND_RECTANGLE,
            stroke: '2px dodgerblue',
            fill: 'transparent'
          }),
          VoidLabelStyle.INSTANCE
        ),
        margins: 3,
        zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
      })
    }
    const installer = super.getInstaller(item)
    if (installer === null) {
      throw new Exception('ICanvasObjectInstaller === null')
    }
    return installer
  }
}
