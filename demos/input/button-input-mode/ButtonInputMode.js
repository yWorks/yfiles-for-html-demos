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
/* eslint-disable jsdoc/check-param-names */
import {
  BaseClass,
  BendEventArgs,
  CanvasComponent,
  Class,
  CollectionModelManager,
  ConcurrencyController,
  Cursor,
  DefaultLabelStyle,
  delegate,
  EdgeEventArgs,
  FreeLabelModel,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphItemTypes,
  IBend,
  IBoundsProvider,
  ICanvasContext,
  ICanvasObject,
  ICanvasObjectDescriptor,
  IconLabelStyle,
  IEdge,
  IGraph,
  IHitTestable,
  IHitTester,
  IInputMode,
  IInputModeContext,
  ILabel,
  ILabelModelParameter,
  ILabelOwner,
  ILabelStyle,
  IModelItem,
  INode,
  InputModeBase,
  InteriorStretchLabelModel,
  IObservableCollection,
  IOrientedRectangle,
  IPort,
  IRenderContext,
  ISvgDefsCreator,
  ItemEventArgs,
  IVisibilityTestable,
  IVisualCreator,
  Key,
  KeyEventArgs,
  LabelEventArgs,
  LabelStyleBase,
  ListEnumerable,
  Matrix,
  MatrixOrder,
  ModifierKeys,
  MouseButtons,
  MouseEventArgs,
  MouseHoverInputMode,
  NodeEventArgs,
  ObservableCollection,
  OrientedRectangle,
  Point,
  PortEventArgs,
  PropertyChangedEventArgs,
  Rect,
  SimpleBend,
  SimpleEdge,
  SimpleLabel,
  SimpleNode,
  SimplePort,
  Size,
  Stroke,
  SvgVisual,
  SvgVisualGroup,
  TimeSpan,
  TouchEventArgs,
  Visual,
  WebGLSupport,
  YObject
} from 'yfiles'

/**
 * @typedef {function} QueryButtonsListener
 */
/**
 * @typedef {function} ButtonHoverListener
 */
/**
 * @typedef {function} ButtonActionListener
 */

/**
 * The gesture or state {@link ButtonInputMode} uses to decide for which {@link IModelItem}
 * {@link Button}s should be displayed.
 */
export /**
 * @readonly
 * @enum {number}
 */
const ButtonTrigger = {
  NONE: 0,
  HOVER: 1,
  CURRENT_ITEM: 2,
  RIGHT_CLICK: 3
}

/**
 * An {@link IInputMode} that can be used to display several {@link Button buttons} at an owning
 * {@link IModelItem} that trigger different actions for this owner.
 *
 * The kind of model items this input mode should consider as owners is specified by the
 * {@link validOwnerTypes valid owner types}.
 *
 * Different {@link ButtonTrigger} can be used to trigger that buttons for an item are
 * {@link addQueryButtonsListener queried} and all buttons that were
 * {@link QueryButtonsEvent.addButton added} to the {@link QueryButtonsEvent} are displayed using
 * the provided location and styling.
 *
 * The {@link Button.onHoverOver onHoverOver} and {@link Button.onHoverOut onHoverOut} listener
 * are called when hovering over or out of the button while {@link Button.onAction onAction} is
 * called when clicking or touch-clicking the button or starting a mouse-drag.
 *
 * When the {@link GraphComponent} is focused, the {@link Key.TAB} can be used to set a focus
 * the first button and cycle through all buttons. A focused button can be triggered using
 * {@link Key.ENTER} or {@link Key.SPACE}.
 */
export class ButtonInputMode extends InputModeBase {
  buttons = null
  buttonLabelManager
  queryButtonsListener = null
  itemRemovedListener = this.onItemRemoved.bind(this)
  onMouseMoveListener = this.onMouseMove.bind(this)
  onMouseDragListener = this.onMouseDrag.bind(this)
  onMouseClickedListener = this.onMouseClicked.bind(this)
  onMouseDownListener = this.onMouseDown.bind(this)
  onTouchClickedListener = this.onTouchClicked.bind(this)
  onKeyDownListener = this.onKeyDown.bind(this)
  onKeyPressedListener = this.onKeyPressed.bind(this)
  graphChangedListener = this.onGraphChanged.bind(this)
  currentItemChangedListener = this.onCurrentItemChanged.bind(this)

  _cursor
  _buttonSize = new Size(25, 25)
  _hoverTime = 750
  _hideTime = 2000
  _hoverTooltipTime = 100
  _buttonTrigger = ButtonTrigger.HOVER
  _validOwnerTypes = GraphItemTypes.ALL
  _lastTimeout = undefined
  buttonOwner = null
  hoveredOwner = null
  hoveredButton = null
  mouseDownButton = null
  tooltipMode = new MouseHoverInputMode({
    mouseHoverSize: Size.INFINITE // Ensure that the tooltip doesn't disappear when moving the mouse
  })
  _lastTooltipTimeout = undefined
  _focusedButton = null

  /**
   * The cursor displayed when hovering over a {@link Button} when {@link Button.cursor} is not set.
   *
   * The `default` is {@link Cursor.POINTER}.
   * @type {?Cursor}
   */
  get cursor() {
    return this._cursor
  }

  /**
   * @type {?Cursor}
   */
  set cursor(value) {
    this._cursor = value
  }

  /**
   * The size used for a {@link Button} when no custom size is specified.
   *
   * The `default` is `(25, 25)`.
   * @type {!Size}
   */
  get buttonSize() {
    return this._buttonSize
  }

  /**
   * @type {!Size}
   */
  set buttonSize(value) {
    this._buttonSize = value
  }

  /**
   * The time an {@link IModelItem} has to be hovered before {@link Button}s are
   * {@link addQueryButtonsListener queried} for it.
   *
   * This property is only used when {@link buttonTrigger} is {@link ButtonTrigger.HOVER}.
   *
   * The `default` is `750`.
   * @type {number}
   */
  get hoverTime() {
    return this._hoverTime
  }

  /**
   * @type {number}
   */
  set hoverTime(value) {
    this._hoverTime = value
  }

  /**
   * The time before {@link Button}s for a hovered item are hidden again.
   *
   * This property is only used when {@link buttonTrigger} is {@link ButtonTrigger.HOVER}.
   *
   * The `default` is `2000`.
   * @type {number}
   */
  get hideTime() {
    return this._hideTime
  }

  /**
   * @type {number}
   */
  set hideTime(value) {
    this._hideTime = value
  }

  /**
   * The time a {@link Button} has to be hovered before its {@link Button.tooltip tooltip} is
   * displayed.
   *
   * The `default` is `750`.
   * @type {number}
   */
  get hoverTooltipTime() {
    return this._hoverTooltipTime
  }

  /**
   * @type {number}
   */
  set hoverTooltipTime(value) {
    this._hoverTooltipTime = value
  }

  /**
   * The gesture or state that is used to decide for which {@link IModelItem}
   * {@link Button}s should be displayed.
   *
   * The `default` ist {@link ButtonTrigger.HOVER}.
   * @type {!ButtonTrigger}
   */
  get buttonTrigger() {
    return this._buttonTrigger
  }

  /**
   * @type {!ButtonTrigger}
   */
  set buttonTrigger(value) {
    this.hideButtons()
    this._buttonTrigger = value
  }

  /**
   * The graph items that are considered by this input mode.
   *
   * The `default` is {@link GraphItemTypes.ALL}.
   * @type {!GraphItemTypes}
   */
  get validOwnerTypes() {
    return this._validOwnerTypes
  }

  /**
   * @type {!GraphItemTypes}
   */
  set validOwnerTypes(value) {
    this._validOwnerTypes = value
  }

  /**
   * The style used to highlight the focused button.
   * Using the {@link Key.TAB} the focus can be moved to the next button.
   * @type {!ILabelStyle}
   */
  get focusedButtonStyle() {
    return this.buttonLabelManager.descriptor.focusedButtonStyle
  }

  /**
   * @type {!ILabelStyle}
   */
  set focusedButtonStyle(style) {
    this.buttonLabelManager.descriptor.focusedButtonStyle = style
  }

  constructor() {
    super()
    this.priority = 0
    this.exclusive = true
    this.buttonLabelManager = this.createButtonLabelCollectionModel()
    this._cursor = Cursor.POINTER
    this.tooltipMode.duration = TimeSpan.fromSeconds(5)
  }

  createButtonLabelCollectionModel() {
    const buttonLabelManager = new CollectionModelManager(Button.$class)
    buttonLabelManager.descriptor = new ButtonDescriptor()
    buttonLabelManager.model = new ObservableCollection()
    return buttonLabelManager
  }

  /**
   * @type {!IObservableCollection.<Button>}
   */
  get buttonLabels() {
    return this.buttonLabelManager.model
  }

  /**
   * Determines if buttons should be {@link QueryButtonsEvent queried} for a model item.
   *
   * The implementation verifies an {@link IModelItem} if its type is included in {@link validOwnerTypes}.
   * @param {!IModelItem} item The item to verify.
   * @returns {boolean}
   */
  isValidItem(item) {
    const itemType = GraphItemTypes.getItemType(item)
    return (this.validOwnerTypes & itemType) == itemType
  }

  /**
   * {@link hideButtons Hides} the current buttons and {@link addQueryButtonsListener queries} and
   * displays new {@link Button}s for the given item.
   *
   * When {@link buttonTrigger} is set to {@link ButtonTrigger.NONE}, calling this method is the
   * only way to show buttons.
   *
   * @param {!IModelItem} item The item to show buttons for.
   * @param ensureVisible Pan the viewport to ensure visibility of the buttons and it's owner
   * @param {boolean} [ensureVisible]
   */
  showButtons(item, ensureVisible) {
    if (this.isActive()) {
      this.hideButtons()
      if (item) {
        this.buttonOwner = item
        this.buttons = this.getButtons(item)
        this.buttons.forEach((button) => {
          this.buttonLabels.add(button)
        })

        if (ensureVisible) {
          const canvasContext = this.inputModeContext?.canvasComponent?.canvasContext
          // get the bounding rectangle around all the buttons in this set
          const wholeBounds = this.buttons.reduce((previousValue, currentValue) => {
            const boundsProvider =
              this.buttonLabelManager.descriptor.getBoundsProvider(currentValue)
            return Rect.add(previousValue, boundsProvider.getBounds(canvasContext))
          }, Rect.EMPTY)
          // get the bounds for the owner of the buttons
          const itemBoundsProvider = item.lookup(IBoundsProvider.$class)
          const itemBounds = itemBoundsProvider.getBounds(canvasContext)
          // pan the viewport so both are visible
          this.inputModeContext?.canvasComponent?.ensureVisible(Rect.add(itemBounds, wholeBounds))
        }
      }
    }
  }

  isActive() {
    return this.controller && this.controller.active
  }

  clearPending = false

  tryHideButtons() {
    if (this.hoveredButton) {
      // don't clear buttons when currently hovering over them
      this.clearPending = true
    } else {
      this.hideButtons()
    }
  }

  /**
   * {@link hideButtons Hides} all current buttons.
   */
  hideButtons() {
    this.updateHoveredButton(null)
    this.clearFocusedButton()
    this.buttonOwner = null
    this.buttons = null
    this.buttonLabels.clear()

    if (this.hasMutex()) {
      this.releaseMutex()
    }
  }

  /**
   * Returns the {@link Button buttons} that shall be displayed for the item.
   *
   * This implementation {@link QueryButtonsEvent queries} all {@link addQueryButtonsListener added}
   * listeners and returns the buttons {@link QueryButtonsEvent.addButton added} by them.
   * @param {!IModelItem} item The item to provide buttons for.
   * @returns {!Array.<Button>}
   */
  getButtons(item) {
    const buttons = []
    const event = new QueryButtonsEvent(this, item, buttons)
    if (this.queryButtonsListener) {
      this.queryButtonsListener(this, event)
    }
    return buttons
  }

  /**
   * Adds a listener that is queried for {@link Button}s for a provided
   * {@link QueryButtonsEvent.owner owner}.
   * @param {!QueryButtonsListener} listener The listener to add.
   */
  addQueryButtonsListener(listener) {
    this.queryButtonsListener = delegate.combine(this.queryButtonsListener, listener)
  }

  /**
   * Removes a previously {@link addQueryButtonsListener added} query buttons listener.
   * @param {!QueryButtonsListener} listener The listener to remove.
   */
  removeQueryButtonsListener(listener) {
    this.queryButtonsListener = delegate.remove(this.queryButtonsListener, listener)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} location
   */
  getHitButtons(context, location) {
    return context.canvasComponent
      .hitElementsAt(context, location, this.buttonLabelManager.canvasObjectGroup)
      .map((canvasObject) => canvasObject.userObject)
  }

  /**
   * @param {!Point} location
   * @returns {?Button}
   */
  getFirstHitButton(location) {
    return this.getHitButtons(this.inputModeContext, location).at(0) ?? null
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!ConcurrencyController} controller
   */
  install(context, controller) {
    super.install(context, controller)
    const graphComponent = context.canvasComponent
    this.buttonLabelManager.canvasObjectGroup = graphComponent.inputModeGroup.addGroup()
    graphComponent.addMouseMoveListener(this.onMouseMoveListener)
    graphComponent.addMouseDragListener(this.onMouseDragListener)
    graphComponent.addMouseLeaveListener(this.onMouseMoveListener)
    graphComponent.addMouseClickListener(this.onMouseClickedListener)
    graphComponent.addMouseDownListener(this.onMouseDownListener)
    graphComponent.addTouchClickListener(this.onTouchClickedListener)
    graphComponent.addKeyDownListener(this.onKeyDownListener)
    graphComponent.addKeyPressListener(this.onKeyPressedListener)
    graphComponent.addGraphChangedListener(this.graphChangedListener)
    graphComponent.addCurrentItemChangedListener(this.currentItemChangedListener)
    const graph = graphComponent.graph
    this.addGraphListener(graph)
    this.tooltipMode.install(context, controller)
  }

  /**
   * @param {!IGraph} graph
   */
  addGraphListener(graph) {
    graph.addNodeRemovedListener(this.itemRemovedListener)
    graph.addEdgeRemovedListener(this.itemRemovedListener)
    graph.addLabelRemovedListener(this.itemRemovedListener)
    graph.addPortRemovedListener(this.itemRemovedListener)
    graph.addBendRemovedListener(this.itemRemovedListener)
  }

  /**
   * @param {!IInputModeContext} context
   */
  uninstall(context) {
    this.tooltipMode.uninstall(context)
    const graphComponent = context.canvasComponent
    const graph = graphComponent.graph
    this.removeGraphListener(graph)
    graphComponent.removeCurrentItemChangedListener(this.currentItemChangedListener)
    graphComponent.removeGraphChangedListener(this.graphChangedListener)
    graphComponent.removeKeyDownListener(this.onKeyDownListener)
    graphComponent.removeKeyPressListener(this.onKeyPressedListener)
    graphComponent.removeTouchClickListener(this.onTouchClickedListener)
    graphComponent.removeMouseDownListener(this.onMouseDownListener)
    graphComponent.removeMouseClickListener(this.onMouseClickedListener)
    graphComponent.removeMouseMoveListener(this.onMouseMoveListener)
    graphComponent.removeMouseDragListener(this.onMouseDragListener)
    graphComponent.removeMouseLeaveListener(this.onMouseMoveListener)
    this.updateHoveredButton(null)
    this.buttonLabelManager.canvasObjectGroup.remove()
    super.uninstall(context)
  }

  /**
   * @param {!IGraph} graph
   */
  removeGraphListener(graph) {
    graph.removeNodeRemovedListener(this.itemRemovedListener)
    graph.removeEdgeRemovedListener(this.itemRemovedListener)
    graph.removeLabelRemovedListener(this.itemRemovedListener)
    graph.removePortRemovedListener(this.itemRemovedListener)
    graph.removeBendRemovedListener(this.itemRemovedListener)
  }

  /**
   * @param {!CanvasComponent} sender
   * @param {!MouseEventArgs} evt
   */
  onMouseMove(sender, evt) {
    const newButton = this.getFirstHitButton(evt.location)
    this.updateHoveredButton(newButton)
    if (!newButton && this.buttonTrigger === ButtonTrigger.HOVER) {
      this.updateHoveredItem(evt.location)
    }
  }

  /**
   * @param {!CanvasComponent} sender
   * @param {!MouseEventArgs} evt
   */
  onMouseDown(sender, evt) {
    this.mouseDownButton = this.getFirstHitButton(evt.location)
  }

  /**
   * @param {!CanvasComponent} sender
   * @param {!MouseEventArgs} evt
   */
  onMouseDrag(sender, evt) {
    const draggedButton = this.getFirstHitButton(evt.location)
    if (draggedButton && this.mouseDownButton === draggedButton) {
      this.triggerAction(draggedButton)
    }
    this.mouseDownButton = null
  }

  /**
   * @param {?Button} newButton
   */
  updateHoveredButton(newButton) {
    if (this.hoveredButton != newButton) {
      this.mouseDownButton = null
      if (this.hoveredButton) {
        // reset cursor
        this.controller.preferredCursor = null
        if (this.hasMutex()) {
          this.releaseMutex()
        }
        if (this.hoveredButton.onHoverOut) {
          this.hoveredButton.onHoverOut(this.hoveredButton)
        }
        this.tooltipMode.hide()
        clearTimeout(this._lastTooltipTimeout)
      }
      this.hoveredButton = newButton
      if (this.hoveredButton) {
        // set cursor specified by button or this input mode
        this.controller.preferredCursor = this.hoveredButton.cursor ?? this.cursor
        if (this.canRequestMutex()) {
          this.requestMutex()
        }
        if (this.hoveredButton.onHoverOver) {
          this.hoveredButton.onHoverOver(this.hoveredButton)
        }
        if (this.hoveredButton.tooltip.length > 0) {
          this._lastTooltipTimeout = setTimeout(() => {
            if (this.hoveredButton) {
              const tooltipLocation = this.calculateTooltipLocation(this.hoveredButton)
              this.tooltipMode.show(tooltipLocation, this.hoveredButton.tooltip)
            }
          }, this.hoverTooltipTime)
        }
      } else if (this.clearPending) {
        this.clearPending = false
        this._lastTimeout = setTimeout(() => this.tryHideButtons(), this.hideTime)
      }
    }
  }

  /**
   * Calculate the world location where the tooltip of the button shall be displayed.
   * @param {!Button} button The button whose tooltip shall be displayed.
   * @returns {!Point}
   */
  calculateTooltipLocation(button) {
    const tooltipWorldSize = this.calculateTooltipWorldSize(button.tooltip)

    // get the bounds of the button using the ButtonDescriptor
    const buttonBounds = this.buttonLabelManager.descriptor
      .getBoundsProvider(button)
      .getBounds(this.inputModeContext.canvasComponent.canvasContext)

    // horizontally the tooltip is centered with the button center
    const x = buttonBounds.centerX - tooltipWorldSize.width / 2
    // vertically the tooltip is on top of the button with an offset of 10 in view coordinates
    const y = buttonBounds.y - tooltipWorldSize.height - 10 / this.inputModeContext.zoom
    return new Point(x, y)
  }

  /**
   * Calculate the size of tooltip in world coordinates.
   * @param {!string} tooltip The tooltip content.
   * @returns {!Size}
   */
  calculateTooltipWorldSize(tooltip) {
    // measure the size of the tooltip in view coordinates
    const viewSize = ButtonInputMode.measureTooltipSize(tooltip)

    // convert the view coordinates into world coordinates
    const canvas = this.inputModeContext.canvasComponent
    const topLeft = canvas.toWorldCoordinates(Point.ORIGIN)
    const bottomRight = canvas.toWorldCoordinates(new Point(viewSize.width, viewSize.height))
    return new Size(bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
  }

  /**
   * Measures the size of a {@link HTMLDivElement} element containing the provided HTML string.
   * @param {!string} htmlString The content to measure
   * @returns {!Size}
   */
  static measureTooltipSize(htmlString) {
    // create div element with htmlString and append it to the document so it can be measured
    const divElement = document.createElement('div')
    divElement.style.position = 'absolute'
    divElement.style.opacity = '0'
    divElement.innerHTML = htmlString
    document.body.appendChild(divElement)

    // measure bounds and remove the div element again
    const bounds = divElement.getBoundingClientRect()
    document.body.removeChild(divElement)
    return new Size(bounds.width, bounds.height)
  }

  /**
   * @param {!Point} location
   */
  updateHoveredItem(location) {
    const hitItem = this.getHitItem(location)
    if (hitItem != this.hoveredOwner) {
      // hovered model item has changed
      if (hitItem) {
        clearTimeout(this._lastTimeout)
        this.hoveredOwner = hitItem
        this._lastTimeout = setTimeout(() => this.showButtons(hitItem), this.hoverTime)
      } else {
        clearTimeout(this._lastTimeout)
        this.hoveredOwner = null
        this._lastTimeout = setTimeout(() => this.tryHideButtons(), this.hideTime)
      }
    }
  }

  /**
   * @param {number} increment
   */
  updateFocusedButton(increment) {
    if (!this.buttons) {
      return
    }
    let nextIndex = 0
    if (this._focusedButton != null) {
      nextIndex = this.buttons.indexOf(this._focusedButton) + increment
      this.clearFocusedButton()
    }
    nextIndex = (nextIndex + this.buttons.length) % this.buttons.length
    let newButton = this.buttons[nextIndex]
    // skip buttons that shall not be focused
    while (!newButton.focusable) {
      nextIndex = (nextIndex + increment + this.buttons.length) % this.buttons.length
      newButton = this.buttons[nextIndex]
    }

    this.focusedButton = newButton
  }

  clearFocusedButton() {
    this.focusedButton = null
  }

  /**
   * The button that is focused and can be triggered via {@link Key.ENTER} or {@link Key.SPACE}.
   * @param focusedButton The button to focus or `null` if no button shall be focused.
   * @type {?Button}
   */
  set focusedButton(focusedButton) {
    this.buttonLabelManager.descriptor.focusedButton = focusedButton
    this._focusedButton = focusedButton
    if (focusedButton) {
      this.buttonLabelManager.update(focusedButton)
    }
    this.inputModeContext?.canvasComponent?.invalidate()
  }

  /**
   * @type {?Button}
   */
  get focusedButton() {
    return this._focusedButton
  }

  /**
   * @param {!CanvasComponent} sender
   * @param {!MouseEventArgs} evt
   */
  onMouseClicked(sender, evt) {
    const leftClick = (evt.changedButtons & MouseButtons.LEFT) !== 0
    const rightClick = (evt.changedButtons & MouseButtons.RIGHT) !== 0
    if (leftClick) {
      const hitButton = this.getFirstHitButton(evt.location)
      if (hitButton && !evt.defaultPrevented) {
        evt.preventDefault()
        this.triggerAction(hitButton)
      }
    } else if (rightClick && this.buttonTrigger === ButtonTrigger.RIGHT_CLICK) {
      const hitItem = this.getHitItem(evt.location)
      if (hitItem && hitItem != this.buttonOwner) {
        this.showButtons(hitItem)
      } else {
        this.hideButtons()
      }
    }
  }

  /**
   * @param {!CanvasComponent} sender
   * @param {!TouchEventArgs} evt
   */
  onTouchClicked(sender, evt) {
    const hitButton = this.getFirstHitButton(evt.location)
    if (hitButton && !evt.defaultPrevented) {
      evt.preventDefault()
      this.triggerAction(hitButton)
    }
  }

  /**
   * @param {!CanvasComponent} sender
   * @param {!KeyEventArgs} evt
   */
  onKeyDown(sender, evt) {
    if (evt.key == Key.TAB) {
      evt.preventDefault()
      if (this.buttons) {
        if ((evt.modifiers & ModifierKeys.SHIFT) === ModifierKeys.SHIFT) {
          this.updateFocusedButton(-1)
        } else {
          this.updateFocusedButton(+1)
        }
      }
    }
  }

  /**
   * @param {!CanvasComponent} sender
   * @param {!KeyEventArgs} evt
   */
  onKeyPressed(sender, evt) {
    if (evt.defaultPrevented) {
      return
    }
    if (this._focusedButton != null && (evt.key == Key.ENTER || evt.key == Key.SPACE)) {
      evt.preventDefault()
      this.triggerAction(this._focusedButton)
    }
  }

  /**
   * @param {!Button} button
   */
  triggerAction(button) {
    // before handling an action, reset the hovered button
    this.updateHoveredButton(null)
    // try to acquire the mutex at least a short time to prevent the default behavior
    if (!this.hasMutex() && this.canRequestMutex()) {
      this.requestMutex()
      this.releaseMutex()
    }
    button.onAction(button)
  }

  /**
   * @param {!Point} location
   */
  getHitItem(location) {
    const context = this.inputModeContext
    const hitTester = context.lookup(IHitTester.$class)
    const hitItem =
      hitTester?.enumerateHits(context, location).find(this.isValidItem.bind(this)) ?? null

    if (!(hitItem instanceof IEdge) || !this.checkForBends()) {
      return hitItem
    }
    // As bends don't have their own visualization, bend hit testing has to be explicitly checked
    const hitBend = hitItem.bends.find(
      (bend) => bend.location.distanceTo(location) < context.hitTestRadius
    )
    return hitBend ?? hitItem
  }

  checkForBends() {
    return (this.validOwnerTypes & GraphItemTypes.BEND) == GraphItemTypes.BEND
  }

  /**
   * @param {!IGraph} sender
   * @param {!(NodeEventArgs|EdgeEventArgs|LabelEventArgs|PortEventArgs|BendEventArgs)} evt
   */
  onItemRemoved(sender, evt) {
    if (this.buttonOwner === evt.item) {
      this.hideButtons()
    }
  }
  /**
   * @param {!GraphComponent} sender
   * @param {!ItemEventArgs.<IGraph>} evt
   */
  onGraphChanged(sender, evt) {
    if (evt.item) {
      this.removeGraphListener(evt.item)
    }
    if (sender.graph) {
      this.addGraphListener(sender.graph)
    }
  }

  /**
   * @param {!GraphComponent} sender
   * @param {!PropertyChangedEventArgs} evt
   */
  onCurrentItemChanged(sender, evt) {
    if (this.buttonTrigger === ButtonTrigger.CURRENT_ITEM) {
      if (sender.currentItem === null || !this.isValidItem(sender.currentItem)) {
        this.hideButtons()
      } else {
        this.showButtons(sender.currentItem)
      }
    }
  }
}

/**
 * An event used by {@link ButtonInputMode} to query the {@link Button}s that shall be displayed
 * for a specified {@link owner}.
 */
export class QueryButtonsEvent {
  _mode
  _owner
  _buttons

  /**
   * @param {!ButtonInputMode} mode
   * @param {!IModelItem} item
   * @param {!Array.<Button>} buttons
   */
  constructor(mode, item, buttons) {
    this._mode = mode
    this._owner = item
    this._buttons = buttons
  }

  /**
   * The item {@link Button}s shall be {@link addButton added} for.
   * @type {!IModelItem}
   */
  get owner() {
    return this._owner
  }

  /**
   * Creates and adds a new button for the {@link owner}.
   *
   * @param {!object} options A map of options to configure the button.
   *
   *   - onAction: {@link ButtonActionListener} - An action that shall be triggered when clicking or dragging the button.
   *   - layoutParameter: {@link ILabelModelParameter} - A layout parameter to place the button relative to the owner.
   *     If the owner is of type {@link IBend} or {@link ILabel}, the model of the parameter should support nodes as owner.
   *   - style?: {@link ILabelStyle} - The style for the button. This parameter can be omitted if an icon or text is specified.
   *   - text?: string - The text used to style the button. If a text is set, the style parameter should be omitted or has to consider the {@link ILabel.text}.
   *   - icon?: string - The url of the icon to use for the button. If an icon is set, the style parameter should be omitted.
   *   - size?: {@link Size} - The size of the button. If no size is specified, the {@link ButtonInputMode.buttonSize} is used.
   *   - onHoverOver?: {@link ButtonHoverListener} - An action that is triggered when starting hovering over the button.
   *   - onHoverOut?: {@link ButtonHoverListener} - An action that is triggered when ending hovering over the button.
   *   - cursor?: {@link Cursor} - The cursor displayed when hovering over the button. If no cursor is specified, the {@link ButtonInputMode.cursor} is used.
   *   - tag?: any - Optional custom data that can be used in the style or layoutParameter or to identify the button.
   *   - tooltip?: string - An optional text that describes the action triggered by the button.
   *   - ignoreFocus?: boolean - An optional flag that describes whether the button can be focused using the `Tab` key.
   * @returns {!Button}
   */
  addButton(options) {
    let _size = options.size || this._mode.buttonSize
    let _style = options.style || null
    if (!_style) {
      if (options.icon) {
        _style = new IconLabelStyle({
          icon: options.icon,
          iconSize: _size,
          iconPlacement: InteriorStretchLabelModel.CENTER,
          autoFlip: false
        })
      } else if (options.text) {
        _style = new DefaultLabelStyle({
          backgroundStroke: 'darkgray',
          backgroundFill: 'lightgray',
          textSize: 14,
          insets: 2
        })
        _size = options.size || Size.EMPTY
      } else {
        _style = new DefaultLabelStyle({
          autoFlip: false,
          backgroundFill: 'lightgray',
          backgroundStroke: 'darkgray',
          shape: 'pill'
        })
      }
    }
    const button = new Button({
      owner: this.owner,
      style: _style,
      size: _size,
      layoutParameter: options.layoutParameter,
      onAction: options.onAction,
      text: options.text,
      onHoverOver: options.onHoverOver,
      onHoverOut: options.onHoverOut,
      cursor: options.cursor,
      tag: options.tag,
      tooltip: options.tooltip,
      focusable: !options.ignoreFocus
    })
    this._buttons.push(button)
    return button
  }
}

/**
 * A button that is temporarily displayed at an owner {@link IModelItem} and can trigger an action
 * that relates to this item.
 */
export class Button extends YObject {
  _owner
  _dummyOwner
  _onAction
  _onHoverOver = null
  _onHoverOut = null
  _cursor
  _tooltip
  _focusable

  _label

  /**
   * Creates a new button for the {@link item}.
   *
   * @param {!object} options A map of options to configure the button.
   *
   *   - owner: {@link IModelItem} - The model item this button belongs to.
   *   - onAction: {@link ButtonActionListener} - An action that is triggered when clicking or dragging the button.
   *   - layoutParameter: {@link ILabelModelParameter} - A layout parameter to place the button relative to the owner.
   *       If the owner is of type {@link IBend} or {@link ILabel}, the model of the parameter should support nodes as owner.
   *   - style: {@link ILabelStyle} - The style used for the button.
   *   - text?: string - The text used to style the button. If a text is set, the style parameter has to consider the {@link ILabel.text}.
   *   - size: {@link Size} - The size of the button. If {@link Size.isEmpty} and a text is set, the preferred style for the text is used.
   *   - onHoverOver?: {@link ButtonHoverListener} - An action that shall be triggered when starting hovering over the button.
   *   - onHoverOut?: {@link ButtonHoverListener} - An action that shall be triggered when ending hovering over the button.
   *   - cursor?: {@link Cursor} - The cursor displayed when hovering over the button. If no cursor is specified, the {@link ButtonInputMode.cursor} is used.
   *   - tag?: any - Optional custom data that can be used to identify the button or used in the style or layoutParameter.
   *   - tooltip?: string - An optional text that describes the action triggered by the button.
   *   - focusable?: boolean - An optional flag that describes whether the button can be focused using the `Tab` key.
   */
  constructor(options) {
    super()
    this._owner = options.owner
    this._onAction = options.onAction
    this._onHoverOver = options.onHoverOver || null
    this._onHoverOut = options.onHoverOut || null
    this._cursor = options.cursor || null
    this._tooltip = options.tooltip || ''
    this._focusable = options.focusable

    // determine the dummy owner to use for placing the _label
    if (this._owner instanceof ILabelOwner) {
      // for nodes, edges and ports the real owner can be used
      this._dummyOwner = this._owner
    } else if (this._owner instanceof IBend) {
      // for bends a node is used as dummy owner, the size of the node is adjusted when calculating
      // the location
      this._dummyOwner = new SimpleNode({
        layout: Rect.fromCenter(this._owner.location, new Size(1, 1))
      })
    } else if (this._owner instanceof ILabel) {
      // for labels a node is used as dummy owner. The label rotation is considered by ButtonDescriptor
      // when calculating the layout
      this._dummyOwner = new SimpleNode({ layout: this._owner.layout.bounds })
    } else {
      throw new Error(`Unsupported owner type: ${this._owner}`)
    }

    this._label = new SimpleLabel({
      owner: this._dummyOwner,
      style: options.style,
      preferredSize: options.size,
      layoutParameter: options.layoutParameter,
      text: options.text || '',
      tag: options.tag
    })

    if (options.size.isEmpty) {
      // calculate preferred size
      this._label.preferredSize = this._label.style.renderer.getPreferredSize(
        this._label,
        options.style
      )
    }
  }

  /**
   * The model item this button belongs to.
   * @type {!IModelItem}
   */
  get owner() {
    return this._owner
  }

  /**
   * The style used for the button.
   * @type {!ILabelStyle}
   */
  get style() {
    return this._label.style
  }

  /**
   * The size of the button.
   * @type {!Size}
   */
  get size() {
    return this._label.preferredSize
  }

  /**
   * An action that is triggered when clicking or dragging the button.
   * @type {!ButtonActionListener}
   */
  get onAction() {
    return this._onAction
  }

  /**
   * The text used to style the button.
   * This may be an empty string if {@link style} doesn't require a text.
   * @type {!string}
   */
  get text() {
    return this._label.text
  }

  /**
   * A layout parameter to place the button relative to the {@link owner}.
   * The button layout is calculated using a dummy label and this layout parameter.
   * If {@link owner} is an {@link ILabelOwner}, it is used as owner of the dummy label so the
   * model of the layout parameter has to support this owner type.
   * If the owner is of type {@link IBend} or {@link ILabel}, it is modelled as {@link INode}, so
   * the model of the parameter should support nodes as owner.
   * @type {!ILabelModelParameter}
   */
  get layoutParameter() {
    return this._label.layoutParameter
  }

  /**
   * An action that is triggered when starting hovering over the button.
   * @type {?ButtonHoverListener}
   */
  get onHoverOver() {
    return this._onHoverOver
  }

  /**
   * An action that is triggered when ending hovering over the button.
   * @type {?ButtonHoverListener}
   */
  get onHoverOut() {
    return this._onHoverOut
  }

  /**
   * An optional tag that can be used to identify the button.
   * This tag is also set as {@link ILabel.tag} of the dummy label used to position and render the
   * button so it can be used by the {@link layoutParameter} and {@link style}.
   * @type {*}
   */
  get tag() {
    return this._label.tag
  }

  /**
   * An optional text that describes the action triggered by the button.
   * @type {!string}
   */
  get tooltip() {
    return this._tooltip
  }

  /**
   * Whether the button can be focused.
   * @type {boolean}
   */
  get focusable() {
    return this._focusable
  }

  /**
   * The cursor used when hovering over this button.
   * When set to `null` (default), the {@link ButtonInputMode.cursor} is used instead.
   * @type {?Cursor}
   */
  get cursor() {
    return this._cursor
  }

  /**
   * A label internally used to position and render the button.
   * @type {!SimpleLabel}
   */
  get label() {
    return this._label
  }
}

/**
 * An {@link ICanvasObjectDescriptor} for {@link Button}s used by the {@link ButtonInputMode}.
 */
class ButtonDescriptor extends BaseClass(
  ICanvasObjectDescriptor,
  IVisualCreator,
  IBoundsProvider,
  IVisibilityTestable,
  IHitTestable
) {
  // dummy model items used to calculate the view independent bounds of the buttons
  dummyLabelLayout
  dummyLabelBounds
  dummyNode
  dummyEdge
  dummySourceNode
  dummyTargetNode
  dummyBends
  dummyBendsBackup
  dummyLabel

  focusedButton = null
  focusedButtonStyle

  label = new SimpleLabel()
  button = null

  constructor() {
    super()
    this.dummyLabelLayout = new OrientedRectangle()
    this.dummyLabelBounds = new OrientedRectangle()
    this.dummyLabel = new SimpleLabel(
      null,
      '',
      FreeLabelModel.INSTANCE.createDynamic(this.dummyLabelLayout)
    )
    this.dummyNode = new SimpleNode()
    this.dummySourceNode = new SimpleNode()
    this.dummyTargetNode = new SimpleNode()
    this.dummyEdge = new SimpleEdge({
      sourcePort: new SimplePort(this.dummySourceNode),
      targetPort: new SimplePort(this.dummyTargetNode)
    })
    this.dummyBends = []
    this.dummyBendsBackup = []
    this.dummyEdge.bends = new ListEnumerable(this.dummyBends)

    this.focusedButtonStyle = new FocusLabelStyle(Stroke.from('3px #FFCF00'))
  }

  /**
   * @param {*} forUserObject
   */
  initialize(forUserObject) {
    this.button = forUserObject
    this.label = this.button.label
  }

  //region IBoundsProvider

  /**
   * @param {*} forUserObject
   * @returns {!IBoundsProvider}
   */
  getBoundsProvider(forUserObject) {
    this.initialize(forUserObject)
    return this
  }

  /**
   * Gets the bounds of the visual for the label in the given context.
   * @param {!ICanvasContext} ctx
   */
  getBounds(ctx) {
    this.updateDummyLabel(ctx)
    return this.dummyLabelBounds.bounds
  }

  //endregion

  //region IHitTestable

  /**
   * @param {*} forUserObject
   * @returns {!IHitTestable}
   */
  getHitTestable(forUserObject) {
    this.initialize(forUserObject)
    return this
  }

  /**
   * Determines whether the visual representation of the label has been hit at the given location.
   * @param {!IInputModeContext} ctx
   * @param {!Point} p
   */
  isHit(ctx, p) {
    this.updateDummyLabel(ctx)
    return this.dummyLabelBounds.containsWithEps(p, 0.001)
  }

  //endregion

  //region IVisibilityTestable

  /**
   * @param {*} forUserObject
   * @returns {!IVisibilityTestable}
   */
  getVisibilityTestable(forUserObject) {
    this.initialize(forUserObject)
    return this
  }

  /**
   * Determines whether the visualization for the specified label is visible in the context.
   * @param {!ICanvasContext} ctx
   * @param {!Rect} clip
   */
  isVisible(ctx, clip) {
    this.updateDummyLabel(ctx)
    return this.getBounds(ctx).intersects(clip)
  }

  //endregion

  //region IVisualCreator

  /**
   * @param {*} forUserObject
   * @returns {!IVisualCreator}
   */
  getVisualCreator(forUserObject) {
    this.initialize(forUserObject)
    return this
  }

  /**
   * Creates the visual for the label.
   * @param {!IRenderContext} ctx
   * @returns {?SvgVisual}
   */
  createVisual(ctx) {
    this.updateDummyLabel(ctx)

    // creates the container for the visual and sets a transform for view coordinates
    const container = new SvgVisualGroup()

    const scale = getScaleForZoom(this.label, ctx.zoom)
    const dummyLabelCenter = this.dummyLabelBounds.orientedRectangleCenter
    container.transform = new Matrix(scale, 0, 0, scale, dummyLabelCenter.x, dummyLabelCenter.y)

    const creator = this.label.style.renderer.getVisualCreator(this.dummyLabel, this.label.style)

    // pass inverse transform to nullify the scaling and translation on the context
    // therefore inner styles can use the context's methods without considering the current transform
    const inverseTransform = container.transform.clone()
    inverseTransform.invert()
    const innerContext = new DummyContext(ctx, scale * ctx.zoom, inverseTransform)

    // the wrapped style should always think it's rendering with the zoom level set in this.zoomThreshold
    const visual = creator.createVisual(innerContext)

    if (visual) {
      // add the created visual to the container
      container.children.add(visual)
    }
    if (this.button === this.focusedButton) {
      const highlightCreator = this.focusedButtonStyle.renderer.getVisualCreator(
        this.dummyLabel,
        this.focusedButtonStyle
      )
      const highlightVisual = highlightCreator.createVisual(innerContext)
      container.children.add(highlightVisual)
    }
    return container
  }

  /**
   * Update the visual previously created by createVisual.
   * @param {!IRenderContext} ctx
   * @param {!Visual} oldVisual
   * @returns {?SvgVisual}
   */
  updateVisual(ctx, oldVisual) {
    this.updateDummyLabel(ctx)

    const container = oldVisual
    const visual = container.children.get(0)
    if (visual === null) {
      return this.createVisual(ctx)
    }

    const scale = getScaleForZoom(this.label, ctx.zoom)
    const dummyLabelCenter = this.dummyLabelBounds.orientedRectangleCenter

    container.transform = new Matrix(scale, 0, 0, scale, dummyLabelCenter.x, dummyLabelCenter.y)

    // update the visual created by the inner style renderer
    const creator = this.label.style.renderer.getVisualCreator(this.dummyLabel, this.label.style)

    // pass inverse transform to nullify the scaling and translation on the context
    // therefore inner styles can use the context's methods without considering the current transform
    const inverseTransform = container.transform.clone()
    inverseTransform.invert()
    const innerContext = new DummyContext(ctx, scale * ctx.zoom, inverseTransform)

    const updatedVisual = creator.updateVisual(innerContext, visual)
    if (updatedVisual === null) {
      // nothing to display -> return nothing
      return null
    }

    if (updatedVisual !== visual) {
      container.remove(visual)
      container.children.insert(0, updatedVisual)
    }
    if (this.button === this.focusedButton) {
      if (container.children.size > 1) {
        const oldFocusVisual = container.children.get(1)
        const focusCreator = this.focusedButtonStyle.renderer.getVisualCreator(
          this.dummyLabel,
          this.focusedButtonStyle
        )
        const newFocusVisual = focusCreator.updateVisual(innerContext, oldFocusVisual)
        if (newFocusVisual !== oldFocusVisual) {
          container.remove(oldFocusVisual)
          container.children.add(newFocusVisual)
        }
      } else {
        const focusCreator = this.focusedButtonStyle.renderer.getVisualCreator(
          this.dummyLabel,
          this.focusedButtonStyle
        )
        const focusVisual = focusCreator.createVisual(innerContext)
        container.children.add(focusVisual)
      }
    } else if (container.children.size > 1) {
      container.children.removeAt(1)
    }

    return container
  }

  //endregion

  //region Utility methods to calculate the view-independent label bounds

  /**
   * Updates the internal label to match the given original label.
   * @param {!ICanvasContext} ctx
   */
  updateDummyLabel(ctx) {
    this.dummyLabel.style = this.label.style
    this.dummyLabel.tag = this.label.tag
    this.dummyLabel.text = this.label.text

    const originalLayout = this.label.layout
    this.dummyLabelLayout.reshape(originalLayout)
    this.dummyLabelLayout.setCenter(new Point(0, 0))
    this.dummyLabel.preferredSize = this.dummyLabelLayout.toSize()

    this.dummyLabel.owner = this.updateDummyLabelOwner(ctx)
    const viewBounds = this.label.layoutParameter.model.getGeometry(
      this.dummyLabel,
      this.label.layoutParameter
    )
    const worldCenter = this.calculateWorldCenter(ctx, viewBounds)
    this.dummyLabel.owner = this.label.owner

    const scale = getScaleForZoom(this.label, ctx.zoom)

    this.dummyLabelBounds.reshape(originalLayout)
    this.dummyLabelBounds.resize(originalLayout.width * scale, originalLayout.height * scale)
    this.dummyLabelBounds.setCenter(worldCenter)

    this.updateDummyAngles()
  }

  /**
   * @param {!ICanvasContext} ctx
   */
  updateDummyLabelOwner(ctx) {
    const canvas = ctx.canvasComponent

    const owner = this.button?.owner
    if (owner instanceof INode) {
      this.dummyNode.layout = this.getViewNodeLayout(owner, canvas)
      return this.dummyNode
    } else if (owner instanceof IEdge) {
      this.dummyEdge.style = owner.style
      this.dummySourceNode.layout = this.getViewNodeLayout(owner.sourceNode, canvas)
      const sourcePort = this.dummyEdge.sourcePort
      sourcePort.locationParameter = FreeNodePortLocationModel.INSTANCE.createParameter(
        this.dummyEdge.sourcePort.owner,
        canvas.toViewCoordinates(owner.sourcePort.location)
      )
      this.ensureDummyBends(owner.bends.size)
      this.dummyBends.length = 0
      owner.bends.forEach((bend, index) => {
        const dummyBend = this.dummyBendsBackup[index]
        dummyBend.location = canvas.toViewCoordinates(bend.location)
        this.dummyBends.push(dummyBend)
      })
      this.dummyTargetNode.layout = this.getViewNodeLayout(owner.targetNode, canvas)
      const targetPort = this.dummyEdge.targetPort
      targetPort.locationParameter = FreeNodePortLocationModel.INSTANCE.createParameter(
        this.dummyEdge.targetPort.owner,
        canvas.toViewCoordinates(owner.targetPort.location)
      )
      return this.dummyEdge
    } else if (owner instanceof IBend || owner instanceof IPort) {
      const centerView = canvas.toViewCoordinates(owner.location)
      this.dummyNode.layout = Rect.fromCenter(centerView, new Size(1, 1))
      return this.dummyNode
    } else {
      const labelOwner = owner
      const centerView = canvas.toViewCoordinates(labelOwner.layout.orientedRectangleCenter)
      this.dummyNode.layout = Rect.fromCenter(
        centerView,
        labelOwner.layout.toSize().multiply(ctx.zoom)
      )
      return this.dummyNode
    }
  }

  /**
   * @param {!INode} owner
   * @param {!CanvasComponent} canvas
   */
  getViewNodeLayout(owner, canvas) {
    const ownerLayout = owner.layout
    const topLeftView = canvas.toViewCoordinates(ownerLayout.topLeft)
    const bottomRightView = canvas.toViewCoordinates(ownerLayout.bottomRight)
    return new Rect(topLeftView, bottomRightView)
  }

  updateDummyAngles() {
    const owner = this.button.owner
    if (owner instanceof ILabel) {
      const angle = normalizeAngle(getAngle(this.dummyLabelBounds) + getAngle(owner.layout))
      setAngle(this.dummyLabelBounds, angle)
      setAngle(this.dummyLabelLayout, angle)
    }
  }

  /**
   * @param {!ICanvasContext} ctx
   * @param {!IOrientedRectangle} viewBounds
   * @returns {!Point}
   */
  calculateWorldCenter(ctx, viewBounds) {
    const canvas = ctx.canvasComponent
    const owner = this.button.owner
    if (owner instanceof ILabel) {
      const viewOwnerCenter = this.dummyNode.layout.center
      const viewButtonCenter = viewBounds.orientedRectangleCenter
      const viewCenterOffset = rotate(
        viewButtonCenter.subtract(viewOwnerCenter),
        getAngle(owner.layout)
      )
      return canvas.toWorldCoordinates(viewOwnerCenter.add(viewCenterOffset))
    } else {
      return canvas.toWorldCoordinates(viewBounds.orientedRectangleCenter)
    }
  }

  /**
   * @param {number} count
   */
  ensureDummyBends(count) {
    while (count > this.dummyBendsBackup.length) {
      this.dummyBendsBackup.push(new SimpleBend(this.dummyEdge))
    }
  }

  //endregion

  /**
   * @param {!ICanvasContext} ctx
   * @param {!ICanvasObject} canvasObject
   * @returns {boolean}
   */
  isDirty(ctx, canvasObject) {
    return true
  }
}

/**
 * Determines the scale factor for the given label and zoom level.
 * @param {!ILabel} label
 * @param {number} zoom
 */
function getScaleForZoom(label, zoom) {
  // base implementation does nothing
  return 1 / zoom
}

/**
 * @param {!IOrientedRectangle} r
 * @returns {number}
 */
function getAngle(r) {
  const angle = Math.atan2(-r.upX, -r.upY)
  return angle < 0 ? 2 * Math.PI + angle : angle
}

/**
 * @param {!OrientedRectangle} r
 * @param {number} angle
 */
function setAngle(r, angle) {
  const center = r.orientedRectangleCenter
  r.angle = angle
  r.setCenter(center)
}

const FULL_CIRCLE = 2 * Math.PI

/**
 * @param {number} angle
 * @returns {number}
 */
function normalizeAngle(angle) {
  while (angle > FULL_CIRCLE) {
    angle -= FULL_CIRCLE
  }
  return angle
}

/**
 * @param {!Point} vector
 * @param {number} angle
 * @returns {!Point}
 */
function rotate(vector, angle) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return new Point(cos * vector.x + sin * vector.y, cos * vector.y - sin * vector.x)
}

class DummyContext extends BaseClass(IRenderContext) {
  innerContext
  $zoom
  $transform
  $viewTransform
  $intermediateTransform
  $projection

  /**
   * @param {!IRenderContext} innerContext
   * @param {number} zoom
   * @param {!Matrix} inverseTransform
   */
  constructor(innerContext, zoom, inverseTransform) {
    super()
    this.innerContext = innerContext
    this.$zoom = zoom
    this.$transform = inverseTransform

    // multiply all necessary transforms with the given inverse transform to nullify the outer transform
    this.$viewTransform = this.$transformMatrix(this.innerContext.viewTransform)
    this.$intermediateTransform = this.$transformMatrix(this.innerContext.intermediateTransform)
    this.$projection = this.$transformMatrix(this.innerContext.projection)
  }

  /**
   * @type {!WebGLSupport}
   */
  get webGLSupport() {
    return this.innerContext.webGLSupport
  }

  get canvasComponent() {
    return this.innerContext.canvasComponent
  }

  get clip() {
    return this.innerContext.clip
  }

  get viewTransform() {
    return this.$viewTransform
  }

  get intermediateTransform() {
    return this.$intermediateTransform
  }

  get projection() {
    return this.$projection
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
   * @param {!Point} worldPoint
   * @returns {!Point}
   */
  toViewCoordinates(worldPoint) {
    return this.$viewTransform.transform(worldPoint)
  }

  /**
   * @param {!Point} intermediatePoint
   * @returns {!Point}
   */
  intermediateToViewCoordinates(intermediatePoint) {
    return this.$projection.transform(intermediatePoint)
  }

  /**
   * @param {!Point} worldPoint
   * @returns {!Point}
   */
  worldToIntermediateCoordinates(worldPoint) {
    return this.$intermediateTransform.transform(worldPoint)
  }

  /**
   * @param {!ISvgDefsCreator} defsSupport
   */
  getDefsId(defsSupport) {
    return this.innerContext.getDefsId(defsSupport)
  }

  /**
   * @param {!Class} type
   * @returns {*}
   */
  lookup(type) {
    return this.innerContext.lookup(type)
  }

  /**
   * Multiplies the given matrix with the inverse transform of the invariant label style.
   * @param {!Matrix} matrix
   * @returns {!Matrix}
   */
  $transformMatrix(matrix) {
    const transformed = matrix.clone()
    transformed.multiply(this.$transform, MatrixOrder.APPEND)
    return transformed
  }
}

/**
 * A style implementation that draws nothing but a border for its associated label.
 */
class FocusLabelStyle extends LabelStyleBase {
  /**
   * @param {!Stroke} stroke
   */
  constructor(stroke) {
    super()
    this.stroke = stroke
  }

  /**
   * @param {!IRenderContext} context
   * @param {!ILabel} label
   * @returns {!SvgVisual}
   */
  createVisual(context, label) {
    const labelBounds = label.layout.bounds
    const frame = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    this.stroke.applyTo(frame, context)
    frame.setAttribute('fill', 'none')

    frame.setAttribute('x', `${labelBounds.x}`)
    frame.setAttribute('y', `${labelBounds.y}`)
    frame.setAttribute('width', `${labelBounds.width}`)
    frame.setAttribute('height', `${labelBounds.height}`)
    asCacheOwner(frame)['data-renderDataCache'] = {
      x: labelBounds.x,
      y: labelBounds.y,
      width: labelBounds.width,
      height: labelBounds.height
    }

    return new SvgVisual(frame)
  }

  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @param {!ILabel} label
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, label) {
    const labelBounds = label.layout.bounds
    const frame = oldVisual.svgElement
    const cache = asCacheOwner(frame)['data-renderDataCache']
    if (cache.x != labelBounds.x) {
      frame.setAttribute('x', `${labelBounds.x}`)
      cache.x = labelBounds.x
    }
    if (cache.y != labelBounds.y) {
      frame.setAttribute('y', `${labelBounds.y}`)
      cache.y = labelBounds.y
    }
    if (cache.width != labelBounds.width) {
      frame.setAttribute('width', `${labelBounds.width}`)
      cache.width = labelBounds.width
    }
    if (cache.height != labelBounds.height) {
      frame.setAttribute('height', `${labelBounds.height}`)
      cache.height = labelBounds.height
    }
    return oldVisual
  }

  /**
   * @param {!ILabel} label
   * @returns {!Size}
   */
  getPreferredSize(label) {
    return new Size(0, 0)
  }
}

/**
 * @param {!SVGElement} element
 * @returns {!object}
 */
function asCacheOwner(element) {
  return element
}
