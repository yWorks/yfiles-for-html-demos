/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  BezierEdgeStyle,
  CanvasComponent,
  DefaultLabelStyle,
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
  Point,
  SimpleLabel,
  Size,
  SolidColorFill,
  Stroke,
  StyleDecorationZoomPolicy,
  UndoUnitBase
} from 'yfiles'

/**
 * This class adds an HTML panel on top of the contents of the graphComponent that can
 * display arbitrary information about a {@link IModelItem graph item}.
 * In order to not interfere with the positioning of the pop-up, HTML content
 * should be added as ancestor of the {@link SankeyPopupSupport.div div element}, and
 * use relative positioning. This implementation uses a
 * {@link ILabelModelParameter label model parameter} to determine
 * the position of the pop-up.
 */
export class SankeyPopupSupport {
  /**
   * Constructor that takes the graphComponent, the container div element and an
   * ILabelModelParameter to determine the relative position of the popup.
   * @param {!GraphComponent} graphComponent The given graphComponent.
   * @param {!HTMLElement} div The div element.
   * @param {!ILabelModelParameter} labelModelParameter The label model parameter that determines
   * the position of the pop-up.
   */
  constructor(graphComponent, div, labelModelParameter) {
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
   * Sets the container {@link HTMLPopupSupport.div div element}.
   * @param value The div element to be set.
   * @type {!HTMLElement}
   */
  set div(value) {
    this.$div = value
  }

  /**
   * Gets the container {@link HTMLPopupSupport.div div element}.
   * @type {!HTMLElement}
   */
  get div() {
    return this.$div
  }

  /**
   * Sets the {@link IModelItem item} to display information for.
   * Setting this property to a value other than null shows the pop-up.
   * Setting the property to null hides the pop-up.
   * @param value The current item.
   * @type {?IModelItem}
   */
  set currentItem(value) {
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
   * @returns The item to display information for
   * @type {?IModelItem}
   */
  get currentItem() {
    return this.$currentItem
  }

  /**
   * Sets the flag for the current position is no longer valid.
   * @param value True if the current position is no longer valid, false otherwise.
   * @type {boolean}
   */
  set dirty(value) {
    this.$dirty = value
  }

  /**
   * Gets the flag for the current position is no longer valid.
   * @returns True if the current position is no longer valid, false otherwise
   * @type {boolean}
   */
  get dirty() {
    return this.$dirty
  }

  /**
   * Registers viewport, node bounds changes and visual tree listeners to the given graphComponent.
   */
  registerListeners() {
    // Adds listener for viewport changes
    this.graphComponent.addViewportChangedListener(() => {
      if (this.currentItem) {
        this.dirty = true
      }
    })

    // Adds listeners for node bounds changes
    this.graphComponent.graph.addNodeLayoutChangedListener((source, node) => {
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
    this.graphComponent.addUpdatedVisualListener(() => {
      if (this.currentItem && this.dirty) {
        this.dirty = false
        this.updateLocation()
      }
    })
  }

  /**
   * Makes this pop-up visible near the given item.
   */
  show() {
    this.div.style.display = 'block'
    this.div.style.opacity = '1'
    this.updateLocation()
  }

  /**
   * Hides this pop-up.
   */
  hide() {
    this.div.style.opacity = '0'
    this.div.style.display = 'none'
  }

  /**
   * Changes the location of this pop-up to the location calculated by the
   * {@link HTMLPopupSupport.labelModelParameter}. Currently, this implementation does not support
   * rotated pop-ups.
   */
  updateLocation() {
    if (!this.currentItem && !this.labelModelParameter) {
      return
    }
    const width = this.div.clientWidth
    const height = this.div.clientHeight
    const zoom = this.graphComponent.zoom

    const dummyLabel = new SimpleLabel(this.currentItem, '', this.labelModelParameter)
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
   * @param {number} x The target x-coordinate of the pop-up.
   * @param {number} y The target y-coordinate of the pop-up.
   */
  setLocation(x, y) {
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
  /**
   * The constructor
   * @param {!string} undoName Name of the undo operation
   * @param {!string} redoName Name of the redo operation
   * @param {!object} oldTag The data to restore the previous state
   * @param {!object} newTag The data to restore the next state
   * @param {!IModelItem} item The owner of the tag
   * @param {?Function} undoRedoCallback Callback
   */
  constructor(undoName, redoName, oldTag, newTag, item, undoRedoCallback) {
    super(undoName, redoName)
    this.oldTag = oldTag
    this.newTag = newTag
    this.item = item
    this.undoRedoCallback = undoRedoCallback
  }

  /**
   * Undoes the work that is represented by this unit.
   */
  undo() {
    this.item.tag = this.oldTag
    this.undoRedoCallback && this.undoRedoCallback()
  }

  /**
   * Redoes the work that is represented by this unit.
   */
  redo() {
    this.item.tag = this.newTag
    this.undoRedoCallback && this.undoRedoCallback()
  }
}

/**
 * A custom position handler which constrains the movement along the y axis.
 * This implementation wraps the default position handler and delegates most of the work to it.
 */
export class ConstrainedPositionHandler extends BaseClass(IPositionHandler) {
  /**
   * @param {?IPositionHandler} handler
   */
  constructor(handler) {
    super()
    this.lastLocation = Point.ORIGIN
    this.handler = handler
  }

  /**
   * @type {!IPoint}
   */
  get location() {
    if (this.handler) {
      return this.handler.location
    }
    throw new Exception('IPositionHandler === null')
  }

  /**
   * @param {!IInputModeContext} context
   */
  initializeDrag(context) {
    if (this.handler === null) {
      return
    }
    this.handler.initializeDrag(context)
    this.lastLocation = this.handler.location.toPoint()
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  handleMove(context, originalLocation, newLocation) {
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

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   */
  cancelDrag(context, originalLocation) {
    if (this.handler === null) {
      return
    }
    this.handler.cancelDrag(context, originalLocation)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  dragFinished(context, originalLocation, newLocation) {
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
export class HighlightManager extends HighlightIndicatorManager {
  constructor() {
    super()
    this.edgeHighlightGroup = null
  }

  /**
   * Installs the manager on the canvas.
   * Adds the highlight group
   * @param {!CanvasComponent} canvas
   */
  install(canvas) {
    if (canvas instanceof GraphComponent) {
      // create a new group for the edge highlight that lies below the node group
      const graphModelManager = canvas.graphModelManager
      this.edgeHighlightGroup = graphModelManager.contentGroup.addGroup()
      this.edgeHighlightGroup.below(graphModelManager.nodeGroup)
    }
    super.install(canvas)
  }

  /**
   * Uninstalls the manager from the canvas
   * removes the highlight groups
   * @param {!CanvasComponent} canvas
   */
  uninstall(canvas) {
    super.uninstall(canvas)
    if (this.edgeHighlightGroup) {
      this.edgeHighlightGroup.remove()
      this.edgeHighlightGroup = null
    }
  }

  /**
   * This implementation always returns the highlightGroup of the canvasComponent of this instance.
   * @param {!IModelItem} item The item to check
   * @returns {?ICanvasObjectGroup} An ICanvasObjectGroup or null
   */
  getCanvasObjectGroup(item) {
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
   * @param {!IModelItem} item The item to find an installer for
   * @returns {!ICanvasObjectInstaller} The Highlighting installer
   */
  getInstaller(item) {
    if (IEdge.isInstance(item)) {
      return new EdgeStyleDecorationInstaller({
        edgeStyle: new BezierEdgeStyle({
          stroke: new Stroke(new SolidColorFill(item.tag.color), item.tag.thickness)
        }),
        zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
      })
    } else if (ILabel.isInstance(item)) {
      return new LabelStyleDecorationInstaller({
        labelStyle: new DefaultLabelStyle({
          shape: 'pill',
          backgroundStroke: '2px dodgerblue',
          textFill: 'transparent'
        }),
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
