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
/* eslint-disable jsdoc/check-param-names */
import {
  BaseClass,
  BendEventArgs,
  CanvasComponent,
  CollectionModelManager,
  ConcurrencyController,
  Cursor,
  delegate,
  EdgeEventArgs,
  FreeLabelModel,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphItemTypes,
  IBend,
  IBoundsProvider,
  ICanvasContext,
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
  IObjectRenderer,
  IObservableCollection,
  IOrientedRectangle,
  IPort,
  IRenderContext,
  ISvgDefsCreator,
  IVisibilityTestable,
  IVisualCreator,
  KeyEventArgs,
  LabelEventArgs,
  LabelStyle,
  LabelStyleBase,
  ListEnumerable,
  Matrix,
  MatrixOrder,
  NodeEventArgs,
  ObservableCollection,
  OrientedRectangle,
  Point,
  PointerButtons,
  PointerEventArgs,
  PointerType,
  PortEventArgs,
  PropertyChangedEventArgs,
  Rect,
  SimpleBend,
  SimpleEdge,
  SimpleLabel,
  SimpleNode,
  SimplePort,
  Size,
  StretchNodeLabelModel,
  Stroke,
  SvgVisual,
  SvgVisualGroup,
  TimeSpan,
  ToolTipInputMode,
  Visual,
  WebGLSupport
} from '@yfiles/yfiles'
/**
 * The gesture or state {@link ButtonInputMode} uses to decide for which {@link IModelItem}
 * {@link Button}s should be displayed.
 */
export var ButtonTrigger
;(function (ButtonTrigger) {
  /**
   * There is no implicit trigger to show {@link Button}s.
   * Instead the {@link ButtonInputMode.showButtons showButtons} and
   * {@link ButtonInputMode.hideButtons hideButtons} have to be called programmatically.
   */
  ButtonTrigger[(ButtonTrigger['NONE'] = 0)] = 'NONE'
  /**
   * {@link Button}s are displayed for an {@link IModelItem} when hovering over it for at least
   * {@link ButtonInputMode.hoverTime hoverTime}.
   * When hovering over another item long enough or when {@link ButtonInputMode.hideTime hideTime}
   * has passed, the buttons are removed again.
   */
  ButtonTrigger[(ButtonTrigger['HOVER'] = 1)] = 'HOVER'
  /**
   * {@link Button}s are displayed for the {@link GraphComponent.currentItem currentItem}.
   */
  ButtonTrigger[(ButtonTrigger['CURRENT_ITEM'] = 2)] = 'CURRENT_ITEM'
  /**
   * {@link Button}s are displayed for an {@link IModelItem} when right-clicking the item and
   * are removed on the next right-click.
   */
  ButtonTrigger[(ButtonTrigger['RIGHT_CLICK'] = 3)] = 'RIGHT_CLICK'
})(ButtonTrigger || (ButtonTrigger = {}))
/**
 * An {@link IInputMode} that can be used to display several {@link Button buttons} at an owning
 * {@link IModelItem} that trigger different actions for this owner.
 *
 * The kind of model items this input mode should consider as owners is specified by the
 * {@link validOwnerTypes valid owner types}.
 *
 * Different {@link ButtonTrigger} can be used to trigger that buttons for an item are
 * {@link setQueryButtonsListener queried} and all buttons that were
 * {@link QueryButtonsEvent.addButton added} to the {@link QueryButtonsEvent} are displayed using
 * the provided location and styling.
 *
 * The {@link Button.onHoverOver onHoverOver} and {@link Button.onHoverOut onHoverOut} listener
 * are called when hovering over or out of the button while {@link Button.onAction onAction} is
 * called when clicking or touch-clicking the button or starting a mouse-drag.
 *
 * When the {@link GraphComponent} is focused, the 'Tab' key can be used to set a focus
 * the first button and cycle through all buttons. A focused button can be triggered using
 * the 'Enter' or the 'Space' key.
 */
export class ButtonInputMode extends InputModeBase {
  buttons = null
  buttonLabelManager
  queryButtonsListener = null
  itemRemovedListener = this.onItemRemoved.bind(this)
  onPointerMoveListener = this.onPointerMove.bind(this)
  onPointerDragListener = this.onPointerDrag.bind(this)
  onPointerClickedListener = this.onPointerClicked.bind(this)
  onPointerDownListener = this.onPointerDown.bind(this)
  onKeyDownListener = this.onKeyDown.bind(this)
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
  pointerDownButton = null
  tooltipMode = new ToolTipInputMode({
    mouseHoverSize: Size.INFINITE, // Ensure that the tooltip doesn't disappear when moving the mouse
    toolTipLocationOffset: new Point(0, -10)
  })
  _lastTooltipTimeout = undefined
  _focusedButton = null
  /**
   * The cursor displayed when hovering over a {@link Button} when {@link Button.cursor} is not set.
   *
   * The `default` is {@link Cursor.POINTER}.
   */
  get cursor() {
    return this._cursor
  }
  set cursor(value) {
    this._cursor = value
  }
  /**
   * The size used for a {@link Button} when no custom size is specified.
   *
   * The `default` is `(25, 25)`.
   */
  get buttonSize() {
    return this._buttonSize
  }
  set buttonSize(value) {
    this._buttonSize = value
  }
  /**
   * The time an {@link IModelItem} has to be hovered before {@link Button}s are
   * {@link setQueryButtonsListener queried} for it.
   *
   * This property is only used when {@link buttonTrigger} is {@link ButtonTrigger.HOVER}.
   *
   * The `default` is `750`.
   */
  get hoverTime() {
    return this._hoverTime
  }
  set hoverTime(value) {
    this._hoverTime = value
  }
  /**
   * The time before {@link Button}s for a hovered item are hidden again.
   *
   * This property is only used when {@link buttonTrigger} is {@link ButtonTrigger.HOVER}.
   *
   * The `default` is `2000`.
   */
  get hideTime() {
    return this._hideTime
  }
  set hideTime(value) {
    this._hideTime = value
  }
  /**
   * The time a {@link Button} has to be hovered before its {@link Button.tooltip tooltip} is
   * displayed.
   *
   * The `default` is `100`.
   */
  get hoverTooltipTime() {
    return this._hoverTooltipTime
  }
  set hoverTooltipTime(value) {
    this._hoverTooltipTime = value
  }
  /**
   * The gesture or state that is used to decide for which {@link IModelItem}
   * {@link Button}s should be displayed.
   *
   * The `default` ist {@link ButtonTrigger.HOVER}.
   */
  get buttonTrigger() {
    return this._buttonTrigger
  }
  set buttonTrigger(value) {
    this.hideButtons()
    this._buttonTrigger = value
    switch (value) {
      case ButtonTrigger.HOVER:
        if (this.graphComponent) {
          this.updateHoveredItem(
            this.graphComponent.canvasContext.canvasComponent.lastEventLocation
          )
        }
        break
      case ButtonTrigger.CURRENT_ITEM:
        if (this.graphComponent) {
          this.onCurrentItemChanged(new PropertyChangedEventArgs(''), this.graphComponent)
        }
        break
    }
  }
  /**
   * The graph items that are considered by this input mode.
   *
   * The `default` is {@link GraphItemTypes.ALL}.
   */
  get validOwnerTypes() {
    return this._validOwnerTypes
  }
  set validOwnerTypes(value) {
    this._validOwnerTypes = value
  }
  /**
   * The style used to highlight the focused button.
   * Using the TAB key, the focus can be moved to the next button.
   */
  get focusedButtonStyle() {
    return this.buttonLabelManager.renderer.focusedButtonStyle
  }
  set focusedButtonStyle(style) {
    this.buttonLabelManager.renderer.focusedButtonStyle = style
  }
  get graphComponent() {
    return this.parentInputModeContext?.canvasComponent
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
    const buttonLabelManager = new CollectionModelManager(Button)
    buttonLabelManager.renderer = new ButtonRenderer()
    buttonLabelManager.model = new ObservableCollection()
    return buttonLabelManager
  }
  get buttonLabels() {
    return this.buttonLabelManager.model
  }
  /**
   * Determines if buttons should be {@link QueryButtonsEvent queried} for a model item.
   *
   * The implementation verifies an {@link IModelItem} if its type is included in {@link validOwnerTypes}.
   * @param item The item to verify.
   */
  isValidItem(item) {
    const itemType = GraphItemTypes.getItemType(item)
    return (this.validOwnerTypes & itemType) == itemType
  }
  /**
   * {@link hideButtons Hides} the current buttons and {@link setQueryButtonsListener queries} and
   * displays new {@link Button}s for the given item.
   *
   * When {@link buttonTrigger} is set to {@link ButtonTrigger.NONE}, calling this method is the
   * only way to show buttons.
   *
   * @param item The item to show buttons for.
   * @param ensureVisible Pan the viewport to ensure visibility of the buttons and it's owner
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
          const canvasContext = this.parentInputModeContext?.canvasComponent?.canvasContext
          // get the bounding rectangle around all the buttons in this set
          const wholeBounds = this.buttons.reduce((previousValue, currentValue) => {
            const boundsProvider = this.buttonLabelManager.renderer.getBoundsProvider(currentValue)
            return Rect.add(previousValue, boundsProvider.getBounds(canvasContext))
          }, Rect.EMPTY)
          // get the bounds for the owner of the buttons
          const itemBoundsProvider = item.lookup(IBoundsProvider)
          const itemBounds = itemBoundsProvider.getBounds(canvasContext)
          // pan the viewport so both are visible
          this.parentInputModeContext?.canvasComponent?.ensureVisible(
            Rect.add(itemBounds, wholeBounds)
          )
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
   * This implementation {@link QueryButtonsEvent queries} all {@link setQueryButtonsListener added}
   * listeners and returns the buttons {@link QueryButtonsEvent.addButton added} by them.
   * @param item The item to provide buttons for.
   */
  getButtons(item) {
    const buttons = []
    const event = new QueryButtonsEvent(this, item, buttons)
    if (this.queryButtonsListener) {
      this.queryButtonsListener(event, this)
    }
    return buttons
  }
  /**
   * Adds a listener that is queried for {@link Button}s for a provided
   * {@link QueryButtonsEvent.owner owner}.
   * @param listener The listener to add.
   */
  setQueryButtonsListener(listener) {
    this.queryButtonsListener = delegate.combine(listener, this.queryButtonsListener)
  }
  /**
   * Removes a previously {@link setQueryButtonsListener added} query buttons listener.
   * @param listener The listener to remove.
   */
  removeQueryButtonsListener(listener) {
    this.queryButtonsListener = delegate.remove(listener, this.queryButtonsListener)
  }
  getHitButtons(context, location) {
    const graphComponent = context.canvasComponent
    return graphComponent.renderTree
      .hitElementsAt({
        context,
        location,
        root: this.buttonLabelManager.renderTreeGroup
      })
      .map((element) => element.tag)
  }
  getFirstHitButton(location) {
    return this.getHitButtons(this.parentInputModeContext, location).at(0) ?? null
  }
  install(context, controller) {
    super.install(context, controller)
    const graphComponent = context.canvasComponent
    this.buttonLabelManager.renderTreeGroup = graphComponent.renderTree.createGroup(
      graphComponent.renderTree.inputModeGroup
    )
    graphComponent.addEventListener('pointer-move', this.onPointerMoveListener)
    graphComponent.addEventListener('pointer-drag', this.onPointerDragListener)
    graphComponent.addEventListener('pointer-leave', this.onPointerMoveListener)
    graphComponent.addEventListener('pointer-click', this.onPointerClickedListener)
    graphComponent.addEventListener('pointer-down', this.onPointerDownListener)
    graphComponent.addEventListener('key-down', this.onKeyDownListener)
    graphComponent.addEventListener('current-item-changed', this.currentItemChangedListener)
    const graph = graphComponent.graph
    this.setGraphListeners(graph)
    this.tooltipMode.install(context, controller)
  }
  setGraphListeners(graph) {
    graph.addEventListener('node-removed', this.itemRemovedListener)
    graph.addEventListener('edge-removed', this.itemRemovedListener)
    graph.addEventListener('label-removed', this.itemRemovedListener)
    graph.addEventListener('port-removed', this.itemRemovedListener)
    graph.addEventListener('bend-removed', this.itemRemovedListener)
  }
  uninstall(context) {
    this.tooltipMode.uninstall(context)
    const graphComponent = context.canvasComponent
    const graph = graphComponent.graph
    this.removeGraphListener(graph)
    graphComponent.removeEventListener('current-item-changed', this.currentItemChangedListener)
    graphComponent.removeEventListener('key-down', this.onKeyDownListener)
    graphComponent.removeEventListener('pointer-down', this.onPointerDownListener)
    graphComponent.removeEventListener('pointer-click', this.onPointerClickedListener)
    graphComponent.removeEventListener('pointer-move', this.onPointerMoveListener)
    graphComponent.removeEventListener('pointer-drag', this.onPointerDragListener)
    graphComponent.removeEventListener('pointer-leave', this.onPointerMoveListener)
    this.updateHoveredButton(null)
    graphComponent.renderTree.remove(this.buttonLabelManager.renderTreeGroup)
    super.uninstall(context)
  }
  removeGraphListener(graph) {
    graph.removeEventListener('node-removed', this.itemRemovedListener)
    graph.removeEventListener('edge-removed', this.itemRemovedListener)
    graph.removeEventListener('label-removed', this.itemRemovedListener)
    graph.removeEventListener('port-removed', this.itemRemovedListener)
    graph.removeEventListener('bend-removed', this.itemRemovedListener)
  }
  onPointerMove(evt) {
    const newButton = this.getFirstHitButton(evt.location)
    this.updateHoveredButton(newButton)
    if (!newButton && this.buttonTrigger === ButtonTrigger.HOVER) {
      this.updateHoveredItem(evt.location)
    }
  }
  onPointerDown(evt) {
    this.pointerDownButton = this.getFirstHitButton(evt.location)
  }
  onPointerDrag(evt) {
    const draggedButton = this.getFirstHitButton(evt.location)
    if (draggedButton && this.pointerDownButton === draggedButton) {
      this.triggerAction(draggedButton)
    }
    this.pointerDownButton = null
  }
  updateHoveredButton(newButton) {
    if (this.hoveredButton != newButton) {
      this.pointerDownButton = null
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
   * @param button The button whose tooltip shall be displayed.
   */
  calculateTooltipLocation(button) {
    const tooltipWorldSize = this.calculateTooltipWorldSize(button.tooltip)
    // get the bounds of the button using the ButtonRenderer
    const buttonBounds = this.buttonLabelManager.renderer
      .getBoundsProvider(button)
      .getBounds(this.parentInputModeContext.canvasComponent.canvasContext)
    // horizontally the tooltip is centered with the button center
    const x = buttonBounds.centerX - tooltipWorldSize.width / 2
    // vertically the tooltip is on top of the button with an offset of 10 in view coordinates
    const y = buttonBounds.y - tooltipWorldSize.height - 10 / this.parentInputModeContext.zoom
    return new Point(x, y)
  }
  /**
   * Calculate the size of tooltip in world coordinates.
   * @param tooltip The tooltip content.
   */
  calculateTooltipWorldSize(tooltip) {
    // measure the size of the tooltip in view coordinates
    const viewSize = ButtonInputMode.measureTooltipSize(tooltip)
    // convert the view coordinates into world coordinates
    const canvas = this.parentInputModeContext.canvasComponent
    const topLeft = canvas.viewToWorldCoordinates(Point.ORIGIN)
    const bottomRight = canvas.viewToWorldCoordinates(new Point(viewSize.width, viewSize.height))
    return new Size(bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
  }
  /**
   * Measures the size of a {@link HTMLDivElement} element containing the provided HTML string.
   * @param htmlString The content to measure
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
   */
  set focusedButton(focusedButton) {
    this.buttonLabelManager.renderer.focusedButton = focusedButton
    this._focusedButton = focusedButton
    if (focusedButton) {
      this.buttonLabelManager.update(focusedButton)
    }
    this.parentInputModeContext?.canvasComponent?.invalidate()
  }
  get focusedButton() {
    return this._focusedButton
  }
  onPointerClicked(evt) {
    const leftClick =
      (evt.pointerType === PointerType.TOUCH && evt.pointerId === 0) ||
      (evt.changedButtons & PointerButtons.MOUSE_LEFT) !== 0 ||
      (evt.changedButtons & PointerButtons.PEN_CONTACT) !== 0
    const rightClick =
      (evt.changedButtons & PointerButtons.MOUSE_RIGHT) !== 0 ||
      (evt.changedButtons & PointerButtons.PEN_BARREL) !== 0
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
  onKeyDown(evt) {
    if (evt.key === 'Tab') {
      evt.preventDefault()
      if (this.buttons) {
        if (evt.shiftKey) {
          this.updateFocusedButton(-1)
        } else {
          this.updateFocusedButton(+1)
        }
      }
    }
    if (evt.defaultPrevented) {
      return
    }
    if (this._focusedButton != null && (evt.key === 'Enter' || evt.key === ' ')) {
      evt.preventDefault()
      this.triggerAction(this._focusedButton)
    }
  }
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
  getHitItem(location) {
    const context = this.parentInputModeContext
    const hitTester = context.lookup(IHitTester)
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
  onItemRemoved(evt) {
    if (this.buttonOwner === evt.item) {
      this.hideButtons()
    }
  }
  onCurrentItemChanged(evt, component) {
    if (this.buttonTrigger === ButtonTrigger.CURRENT_ITEM) {
      if (component.currentItem === null || !this.isValidItem(component.currentItem)) {
        this.hideButtons()
      } else {
        this.showButtons(component.currentItem)
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
  constructor(mode, item, buttons) {
    this._mode = mode
    this._owner = item
    this._buttons = buttons
  }
  /**
   * The item {@link Button}s shall be {@link addButton added} for.
   */
  get owner() {
    return this._owner
  }
  /**
   * Creates and adds a new button for the {@link owner}.
   *
   * @param options A map of options to configure the button.
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
   */
  addButton(options) {
    let _size = options.size || this._mode.buttonSize
    let _style = options.style || null
    if (!_style) {
      if (options.icon) {
        _style = new IconLabelStyle({
          href: options.icon,
          iconSize: _size,
          iconPlacement: StretchNodeLabelModel.CENTER,
          autoFlip: false
        })
      } else if (options.text) {
        _style = new LabelStyle({
          backgroundStroke: 'darkgray',
          backgroundFill: 'lightgray',
          textSize: 14,
          padding: 2
        })
        _size = options.size || Size.EMPTY
      } else {
        _style = new LabelStyle({
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
export class Button {
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
   * @param options A map of options to configure the button.
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
      // for labels a node is used as dummy owner. The label rotation is considered by ButtonRenderer
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
   */
  get owner() {
    return this._owner
  }
  /**
   * The style used for the button.
   */
  get style() {
    return this._label.style
  }
  /**
   * The size of the button.
   */
  get size() {
    return this._label.preferredSize
  }
  /**
   * An action that is triggered when clicking or dragging the button.
   */
  get onAction() {
    return this._onAction
  }
  /**
   * The text used to style the button.
   * This may be an empty string if {@link style} doesn't require a text.
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
   */
  get layoutParameter() {
    return this._label.layoutParameter
  }
  /**
   * An action that is triggered when starting hovering over the button.
   */
  get onHoverOver() {
    return this._onHoverOver
  }
  /**
   * An action that is triggered when ending hovering over the button.
   */
  get onHoverOut() {
    return this._onHoverOut
  }
  /**
   * An optional tag that can be used to identify the button.
   * This tag is also set as {@link ILabel.tag} of the dummy label used to position and render the
   * button so it can be used by the {@link layoutParameter} and {@link style}.
   */
  get tag() {
    return this._label.tag
  }
  /**
   * An optional text that describes the action triggered by the button.
   */
  get tooltip() {
    return this._tooltip
  }
  /**
   * Whether the button can be focused.
   */
  get focusable() {
    return this._focusable
  }
  /**
   * The cursor used when hovering over this button.
   * When set to `null` (default), the {@link ButtonInputMode.cursor} is used instead.
   */
  get cursor() {
    return this._cursor
  }
  /**
   * A label internally used to position and render the button.
   */
  get label() {
    return this._label
  }
}
/**
 * An {@link IObjectRenderer} for {@link Button}s used by the {@link ButtonInputMode}.
 */
class ButtonRenderer extends BaseClass(
  IObjectRenderer,
  IVisualCreator,
  IBoundsProvider,
  IVisibilityTestable,
  IHitTestable
) {
  // dummy model items used to calculate the view independent bounds of the buttons
  dummyLabelLayout
  dummyLabelBounds
  dummyNode
  previewEdge
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
    this.dummyLabel = new SimpleLabel()
    this.dummyLabel.layoutParameter = FreeLabelModel.INSTANCE.createDynamic(this.dummyLabelLayout)
    this.dummyNode = new SimpleNode()
    this.dummySourceNode = new SimpleNode()
    this.dummyTargetNode = new SimpleNode()
    this.previewEdge = new SimpleEdge({
      sourcePort: new SimplePort(this.dummySourceNode),
      targetPort: new SimplePort(this.dummyTargetNode)
    })
    this.dummyBends = []
    this.dummyBendsBackup = []
    this.previewEdge.bends = new ListEnumerable(this.dummyBends)
    this.focusedButtonStyle = new FocusLabelStyle(Stroke.from('3px #FFCF00'))
  }
  initialize(renderTag) {
    this.button = renderTag
    this.label = this.button.label
  }
  //region IBoundsProvider
  getBoundsProvider(renderTag) {
    this.initialize(renderTag)
    return this
  }
  /**
   * Gets the bounds of the visual for the label in the given context.
   */
  getBounds(ctx) {
    this.updateDummyLabel(ctx)
    return this.dummyLabelBounds.bounds
  }
  //endregion
  //region IHitTestable
  getHitTestable(renderTag) {
    this.initialize(renderTag)
    return this
  }
  /**
   * Determines whether the visual representation of the label has been hit at the given location.
   */
  isHit(ctx, p) {
    this.updateDummyLabel(ctx)
    return this.dummyLabelBounds.contains(p, 0.001)
  }
  //endregion
  //region IVisibilityTestable
  getVisibilityTestable(renderTag) {
    this.initialize(renderTag)
    return this
  }
  /**
   * Determines whether the visualization for the specified label is visible in the context.
   */
  isVisible(ctx, clip) {
    this.updateDummyLabel(ctx)
    return this.getBounds(ctx).intersects(clip)
  }
  //endregion
  //region IVisualCreator
  getVisualCreator(renderTag) {
    this.initialize(renderTag)
    return this
  }
  /**
   * Creates the visual for the label.
   */
  createVisual(ctx) {
    this.updateDummyLabel(ctx)
    // creates the container for the visual and sets a transform for view coordinates
    const container = new SvgVisualGroup()
    const scale = getScaleForZoom(this.label, ctx.zoom)
    const dummyLabelCenter = this.dummyLabelBounds.center
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
   */
  updateVisual(ctx, oldVisual) {
    this.updateDummyLabel(ctx)
    const container = oldVisual
    const visual = container.children.get(0)
    if (visual === null) {
      return this.createVisual(ctx)
    }
    const scale = getScaleForZoom(this.label, ctx.zoom)
    const dummyLabelCenter = this.dummyLabelBounds.center
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
   */
  updateDummyLabel(ctx) {
    this.dummyLabel.style = this.label.style
    this.dummyLabel.tag = this.label.tag
    this.dummyLabel.text = this.label.text
    const originalLayout = this.label.layout
    this.dummyLabelLayout.setShape(originalLayout)
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
    this.dummyLabelBounds.setShape(originalLayout)
    this.dummyLabelBounds.width = originalLayout.width * scale
    this.dummyLabelBounds.height = originalLayout.height * scale
    this.dummyLabelBounds.setCenter(worldCenter)
    this.updateDummyAngles()
  }
  updateDummyLabelOwner(ctx) {
    const canvas = ctx.canvasComponent
    const owner = this.button?.owner
    if (owner instanceof INode) {
      this.dummyNode.layout = this.getViewNodeLayout(owner, canvas)
      return this.dummyNode
    } else if (owner instanceof IEdge) {
      this.previewEdge.style = owner.style
      this.dummySourceNode.layout = this.getViewNodeLayout(owner.sourceNode, canvas)
      const sourcePort = this.previewEdge.sourcePort
      sourcePort.locationParameter = FreeNodePortLocationModel.INSTANCE.createParameter(
        this.previewEdge.sourcePort.owner,
        canvas.worldToViewCoordinates(owner.sourcePort.location)
      )
      this.ensureDummyBends(owner.bends.size)
      this.dummyBends.length = 0
      owner.bends.forEach((bend, index) => {
        const dummyBend = this.dummyBendsBackup[index]
        dummyBend.location = canvas.worldToViewCoordinates(bend.location)
        this.dummyBends.push(dummyBend)
      })
      this.dummyTargetNode.layout = this.getViewNodeLayout(owner.targetNode, canvas)
      const targetPort = this.previewEdge.targetPort
      targetPort.locationParameter = FreeNodePortLocationModel.INSTANCE.createParameter(
        this.previewEdge.targetPort.owner,
        canvas.worldToViewCoordinates(owner.targetPort.location)
      )
      return this.previewEdge
    } else if (owner instanceof IBend || owner instanceof IPort) {
      const centerView = canvas.worldToViewCoordinates(owner.location)
      this.dummyNode.layout = Rect.fromCenter(centerView, new Size(1, 1))
      return this.dummyNode
    } else {
      const labelOwner = owner
      const centerView = canvas.worldToViewCoordinates(labelOwner.layout.center)
      this.dummyNode.layout = Rect.fromCenter(
        centerView,
        labelOwner.layout.toSize().multiply(ctx.zoom)
      )
      return this.dummyNode
    }
  }
  getViewNodeLayout(owner, canvas) {
    const ownerLayout = owner.layout
    const topLeftView = canvas.worldToViewCoordinates(ownerLayout.topLeft)
    const bottomRightView = canvas.worldToViewCoordinates(ownerLayout.bottomRight)
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
  calculateWorldCenter(ctx, viewBounds) {
    const canvas = ctx.canvasComponent
    const owner = this.button.owner
    if (owner instanceof ILabel) {
      const viewOwnerCenter = this.dummyNode.layout.center
      const viewButtonCenter = viewBounds.center
      const viewCenterOffset = rotate(
        viewButtonCenter.subtract(viewOwnerCenter),
        getAngle(owner.layout)
      )
      return canvas.viewToWorldCoordinates(viewOwnerCenter.add(viewCenterOffset))
    } else {
      return canvas.viewToWorldCoordinates(viewBounds.center)
    }
  }
  ensureDummyBends(count) {
    while (count > this.dummyBendsBackup.length) {
      this.dummyBendsBackup.push(new SimpleBend(this.previewEdge, Point.ORIGIN))
    }
  }
}
/**
 * Determines the scale factor for the given label and zoom level.
 */
function getScaleForZoom(label, zoom) {
  // base implementation does nothing
  return 1 / zoom
}
function getAngle(r) {
  const angle = Math.atan2(-r.upX, -r.upY)
  return angle < 0 ? 2 * Math.PI + angle : angle
}
function setAngle(r, angle) {
  const center = r.center
  r.angle = angle
  r.setCenter(center)
}
const FULL_CIRCLE = 2 * Math.PI
function normalizeAngle(angle) {
  while (angle > FULL_CIRCLE) {
    angle -= FULL_CIRCLE
  }
  return angle
}
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
  worldToViewCoordinates(worldPoint) {
    return this.$viewTransform.transform(worldPoint)
  }
  intermediateToViewCoordinates(intermediatePoint) {
    return this.$projection.transform(intermediatePoint)
  }
  worldToIntermediateCoordinates(worldPoint) {
    return this.$intermediateTransform.transform(worldPoint)
  }
  getDefsId(defsSupport) {
    return this.innerContext.getDefsId(defsSupport)
  }
  lookup(type) {
    return this.innerContext.lookup(type)
  }
  /**
   * Multiplies the given matrix with the inverse transform of the invariant label style.
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
  stroke
  constructor(stroke) {
    super()
    this.stroke = stroke
  }
  createVisual(context, label) {
    const labelBounds = label.layout.bounds
    const frame = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    this.stroke.applyTo(frame, context)
    frame.setAttribute('fill', 'none')
    frame.setAttribute('x', `${labelBounds.x}`)
    frame.setAttribute('y', `${labelBounds.y}`)
    frame.setAttribute('width', `${labelBounds.width}`)
    frame.setAttribute('height', `${labelBounds.height}`)
    return SvgVisual.from(frame, {
      x: labelBounds.x,
      y: labelBounds.y,
      width: labelBounds.width,
      height: labelBounds.height
    })
  }
  updateVisual(context, oldVisual, label) {
    const labelBounds = label.layout.bounds
    const frame = oldVisual.svgElement
    const cache = oldVisual.tag
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
  getPreferredSize(label) {
    return new Size(0, 0)
  }
}
