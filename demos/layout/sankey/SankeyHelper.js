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
  GraphComponent,
  IEdge,
  ILabelModelParameter,
  IModelItem,
  IPositionHandler,
  Point,
  SimpleLabel,
  Size,
  UndoUnitBase
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
  /**
   * Constructor that takes the graphComponent, the container div element and an
   * ILabelModelParameter to determine the relative position of the popup.
   * @param {GraphComponent} graphComponent The given graphComponent.
   * @param {Element} div The div element.
   * @param {ILabelModelParameter} labelModelParameter The label model parameter that determines
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
   * Sets the container {@link HTMLPopupSupport#div div element}.
   * @param {HTMLElement} value The div element to be set.
   */
  set div(value) {
    this.$div = value
  }

  /**
   * Gets the container {@link HTMLPopupSupport#div div element}.
   * @return {HTMLElement}
   */
  get div() {
    return this.$div
  }

  /**
   * Sets the {@link IModelItem item} to display information for.
   * Setting this property to a value other than null shows the pop-up.
   * Setting the property to null hides the pop-up.
   * @param {IModelItem} value The current item.
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
   * @return {IModelItem} The item to display information for
   */
  get currentItem() {
    return this.$currentItem
  }

  /**
   * Sets the flag for the current position is no longer valid.
   * @param {boolean} value True if the current position is no longer valid, false otherwise.
   */
  set dirty(value) {
    this.$dirty = value
  }

  /**
   * Gets the flag for the current position is no longer valid.
   * @return {boolean} True if the current position is no longer valid, false otherwise
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
    this.graphComponent.graph.addNodeLayoutChangedListener(node => {
      if (
        ((this.currentItem && this.currentItem === node) || IEdge.isInstance(this.currentItem)) &&
        (node === this.currentItem.sourcePort.owner || node === this.currentItem.targetPort.owner)
      ) {
        this.dirty = true
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
   * {@link HTMLPopupSupport#labelModelParameter}. Currently, this implementation does not support
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
   * @param {string} undoName Name of the undo operation
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
 * A custom position handler which constrains the movement along the y axis.
 * This implementation wraps the default position handler and delegates most of the work to it.
 */
export class ConstrainedPositionHandler extends BaseClass(IPositionHandler) {
  constructor(handler) {
    super()
    this.handler = handler
  }

  get location() {
    return this.handler.location
  }

  initializeDrag(context) {
    this.handler.initializeDrag(context)
    this.lastLocation = this.handler.location.toPoint()
  }

  handleMove(context, originalLocation, newLocation) {
    // only move along the y axis, keep the original x coordinate
    newLocation = new Point(originalLocation.x, newLocation.y)
    if (!newLocation.equalsEps(this.lastLocation, 0)) {
      // delegate to the wrapped handler for the actual move
      this.handler.handleMove(context, originalLocation, newLocation)
      // remember the location
      this.lastLocation = newLocation
    }
  }

  cancelDrag(context, originalLocation) {
    this.handler.cancelDrag(context, originalLocation)
  }

  dragFinished(context, originalLocation, newLocation) {
    this.handler.dragFinished(context, originalLocation, newLocation)
  }
}
