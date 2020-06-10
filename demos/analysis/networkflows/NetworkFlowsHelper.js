/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ConcurrencyController,
  Cursor,
  HandlePositions,
  IEdge,
  IHandle,
  IInputModeContext,
  IModelItem,
  INode,
  InputModeBase,
  IReshapeHandleProvider,
  IVisualCreator,
  MouseButtons,
  Point,
  Rect,
  UndoUnitBase
} from 'yfiles'

/**
 * This class provides undo/redo for an operation changing tag data.
 */
export class TagUndoUnit extends UndoUnitBase {
  /**
   * The constructor.
   * @param {string} undoName Name of the undo operation.
   * @param {string} redoName Name of the redo operation
   * @param {Object} oldTag The data to restore the previous state
   * @param {Object} newTag The data to restore the next state
   * @param {IModelItem} item The owner of the tag
   */
  constructor(undoName, redoName, oldTag, newTag, item) {
    super(undoName, redoName)
    this.oldTag = oldTag
    this.newTag = newTag
    this.item = item
  }

  /**
   * Undoes the work that is represented by this unit.
   */
  undo() {
    this.item.tag = this.oldTag
  }

  /**
   * Redoes the work that is represented by this unit.
   */
  redo() {
    this.item.tag = this.newTag
  }
}

/**
 * This class provides undo/redo for an operation the min-cut line bounds.
 */
export class MinCutUndoUnit extends UndoUnitBase {
  /**
   * The constructor.
   * @param {string} undoName Name of the undo operation.
   * @param {string} redoName Name of the redo operation
   * @param {Rect} oldBounds The old min-cut line bounds
   * @param {Rect} newBounds The new min-cut line bounds
   * @param {IVisualCreator} minCutLine The given min-cut line
   */
  constructor(undoName, redoName, oldBounds, newBounds, minCutLine) {
    super(undoName, redoName)
    this.oldBounds = oldBounds
    this.newBounds = newBounds
    this.minCutLine = minCutLine
  }

  /**
   * Undoes the work that is represented by this unit.
   */
  undo() {
    this.minCutLine.bounds = this.oldBounds
  }

  /**
   * Redoes the work that is represented by this unit.
   */
  redo() {
    this.minCutLine.bounds = this.newBounds
  }
}

/**
 * An {@link IReshapeHandleProvider} that doesn't provide any handles.
 */
export class EmptyReshapeHandleProvider extends BaseClass(IReshapeHandleProvider) {
  /**
   * Returns the indicator for no valid position.
   * @param {IInputModeContext} inputModeContext The context for which the handles are queried
   * @see Specified by {@link IReshapeHandleProvider#getAvailableHandles}.
   * @return {HandlePositions} The indicator for no valid position
   */
  getAvailableHandles(inputModeContext) {
    return HandlePositions.NONE
  }

  /**
   * This method is never called since getAvailableHandles returns no valid position.
   * @param {IInputModeContext} inputModeContext The context for which the handles are queried
   * @param {HandlePositions} position The single position a handle implementation should be
   *   returned for
   * @return {IHandle} Null since getAvailableHandles returns no valid position.
   */
  getHandle(inputModeContext, position) {
    // Never called since getAvailableHandles returns no valid position.
    return null
  }
}

/**
 * This input mode handles dragging events on nodes and edges.
 * Dragging events at the area visualizing the flow at a node increase/decrease the node supply or
 * demand. Dragging events on edges increase/decrease the edge capacity.
 */
export class NetworkFlowInputMode extends InputModeBase {
  constructor() {
    super()
    this.graphComponent = null
    this.state = null
    this.hitItem = null
    this.initialLocation = null
    this.initialCapacity = 0
    this.initialSupply = 0
    this.dragFinishedListener = null
    this.oldtag = null

    // initializes listener functions in order to install/uninstall them
    this.onMouseMoveListener = (sender, evt) => this.onMouseMove(evt.location)
    this.onMouseDownListener = (sender, evt) => this.onMouseDown(evt.location, evt.buttons)
    this.onMouseUpListener = (sender, evt) => this.onMouseUp(evt.location)
    this.onMouseDragListener = (sender, evt) => this.onMouseDrag(evt.location)
  }

  /**
   * Installs this input mode into a CanvasComponent using the provided IInputModeContext.
   * @param {IInputModeContext} context The context to install this mode into
   * @param {ConcurrencyController} controller The controller for this mode
   */
  install(context, controller) {
    super.install(context, controller)
    this.graphComponent = context.canvasComponent
    this.graphComponent.addMouseMoveListener(this.onMouseMoveListener)
    this.graphComponent.addMouseDownListener(this.onMouseDownListener)
    this.graphComponent.addMouseUpListener(this.onMouseUpListener)
    this.graphComponent.addMouseDragListener(this.onMouseDragListener)
    this.state = 'start'
  }

  /**
   * Occurs when the mouse has been moved in world coordinates.
   * @param {Point} location The event location in world coordinates
   */
  onMouseMove(location) {
    if (this.controller.active && this.isValidHover(location)) {
      this.state = 'hover'
      this.controller.preferredCursor = Cursor.NS_RESIZE
    } else {
      this.state = 'start'
      this.controller.preferredCursor = null
    }
  }

  /**
   * Checks whether the mouse hover occurred on a valid position. Valid positions are the edges and
   * the area of a node that represents the flow supply/demand (if the flow can be adjusted like in
   * Minimum Cost flow algorithm).
   * @param {Point} location The event location in world coordinates
   * @return {boolean} True if the mouse hover occurred on a valid position, false otherwise
   */
  isValidHover(location) {
    const hits = this.graphComponent.graphModelManager.hitTester.enumerateHits(
      this.inputModeContext,
      location
    )

    this.hitItem = hits.firstOrDefault()

    if (INode.isInstance(this.hitItem)) {
      if (this.hitItem.tag.adjustable) {
        const layout = this.hitItem.layout
        const draggableArea = new Rect(layout.x + 15, layout.y, layout.width - 30, layout.height)
        if (draggableArea.contains(location)) {
          return true
        }
      }
    } else if (IEdge.isInstance(this.hitItem)) {
      return true
    }
    // reset the hitItem if the position is not valid
    this.hitItem = null
    return false
  }

  /**
   * Occurs when a mouse button has been pressed.
   * @param {MouseButtons} buttons The state of the mouse buttons at the time of the event creation
   * @param {Point} location The event location in world coordinates
   */
  onMouseDown(location, buttons) {
    if (this.controller.active && this.hitItem && buttons === MouseButtons.LEFT) {
      this.state = 'down'
      this.initialLocation = location
    }
  }

  /**
   * Occurs when the mouse is being moved while at least one of the mouse buttons is pressed.
   * @param {Point} location The event location in world coordinates
   */
  onMouseDrag(location) {
    if (this.controller.active && this.hitItem && this.state === 'down') {
      super.requestMutex()
      this.state = 'drag'
      this.initialLocation = location
      // drag has started, fire the event
      if (this.dragStartedListener) {
        this.dragStartedListener()
      }

      if (INode.isInstance(this.hitItem)) {
        this.initialSupply = this.hitItem.tag.supply
      } else if (IEdge.isInstance(this.hitItem)) {
        this.initialCapacity = this.hitItem.tag.capacity
      }

      this.oldTag = Object.assign({}, this.hitItem.tag)
    }
    if (this.state === 'drag') {
      const delta = this.initialLocation.y - location.y

      if (INode.isInstance(this.hitItem)) {
        const flow = this.hitItem.tag.flow / this.hitItem.layout.height
        this.hitItem.tag.supply = Math.min(
          1 - flow,
          Math.max(-1, this.initialSupply + delta / this.hitItem.layout.height)
        )
      } else {
        const tag = this.hitItem.tag
        tag.capacity = Math.round(Math.max(0, this.initialCapacity + delta))

        const label = this.hitItem.labels.get(0)
        if (label != null) {
          this.graphComponent.graph.setLabelText(label, `${tag.flow} / ${tag.capacity}`)
        }
      }
      this.graphComponent.invalidate()
    }
  }

  /**
   * Occurs when the mouse button has been released.
   * @param {Point} location The event location in world coordinates
   */
  onMouseUp(location) {
    if (this.controller.active && this.state === 'drag') {
      super.releaseMutex()

      // drag has finished, fire the event
      if (this.dragFinishedListener) {
        this.dragFinishedListener(this.hitItem, this.oldTag)
      }
      // reset the state and the cursor
      // if the last position is valid, reset to hover state, else to start state
      if (this.isValidHover(location)) {
        this.state = 'hover'
        this.controller.preferredCursor = Cursor.NS_RESIZE
      } else {
        this.state = 'start'
        this.controller.preferredCursor = null
        this.initialLocation = null
        this.initialSupply = 0
        this.initialCapacity = 0
        this.hitItem = null
      }
    }
  }

  /**
   * Adds a listener that fires an event whenever the dragging of a node/edge has finished.
   * @param {function(item: IModelItem)} listener The given listener
   */
  addDragFinished(listener) {
    this.dragFinishedListener = listener
  }

  /**
   * Removes the listener that fires an event whenever the dragging of a node/edge has finished.
   * @param {function(item: IModelItem)} listener The given listener
   */
  removeDragFinishedListener(listener) {
    if (this.dragFinishedListener === listener) {
      this.dragFinishedListener = null
    }
  }

  /**
   * Adds a listener that fires an event whenever the dragging of a node/edge has started.
   * @param {function(item: IModelItem)} listener The given listener
   */
  addDragStartedListener(listener) {
    this.dragStartedListener = listener
  }

  /**
   * Removes the listener that fires an event whenever the dragging of a node/edge has started.
   * @param {function(item: IModelItem)} listener The given listener
   */
  removeDragStartedListener(listener) {
    if (this.dragStartedListener === listener) {
      this.dragStartedListener = null
    }
  }

  /**
   * Uninstalls this mode from the canvas.
   * @param {IInputModeContext} context The context to remove this mode from.
   */
  uninstall(context) {
    super.uninstall(context)
    this.graphComponent.removeMouseMoveListener(this.onMouseMoveListener)
    this.graphComponent.removeMouseDownListener(this.onMouseDownListener)
    this.graphComponent.removeMouseUpListener(this.onMouseUpListener)
    this.graphComponent.removeMouseDragListener(this.onMouseDragListener)
    this.graphComponent = null
  }
}
