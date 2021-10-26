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
  CanvasComponent,
  ConcurrencyController,
  CreateEdgeInputMode,
  DefaultLabelStyle,
  DefaultLabelStyleRenderer,
  DefaultPortCandidate,
  EdgePathLabelModel,
  EventArgs,
  EventRecognizers,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  Fill,
  GraphComponent,
  GraphEditorInputMode,
  ICompoundEdit,
  IEdge,
  IGraph,
  IInputMode,
  IInputModeContext,
  ILabelModelParameter,
  IModelItem,
  InputModeBase,
  IPort,
  IPortCandidate,
  IRenderContext,
  Key,
  KeyboardInputMode,
  KeyEventArgs,
  KeyEventRecognizers,
  KeyEventType,
  List,
  ModifierKeys,
  MouseEventArgs,
  MouseEventTypes,
  MultiplexingInputMode,
  Point,
  PropertyChangedEventArgs,
  Size,
  SvgVisual,
  Visual
} from 'yfiles'
import type { ButtonOptions, Shortcut } from './WizardAction'
import WizardAction, { PickerLayout } from './WizardAction'
import type { ButtonActionListener } from '../../input/button-input-mode/ButtonInputMode'
import {
  Button,
  ButtonInputMode,
  ButtonTrigger,
  QueryButtonsEvent
} from '../../input/button-input-mode/ButtonInputMode'
import { OffsetLabelModelWrapper } from '../../input/button-input-mode/OffsetLabelModelWrapper'

const PICKER_BUTTON_BACKGROUND_MARGIN = 8
const PICKER_BUTTON_GRID_OFFSET = 17
const PICKER_BUTTON_SPACING = 2

/**
 * An input mode that simplifies the creation of a specific type of diagram by managing valid
 * {@link WizardAction actions} for modifying it.<br/>
 * Possible actions can be {@link addAction added} and are active when their
 * {@link WizardAction.preCondition pre-condition} is met.<br/>
 * For active actions that have {@link WizardAction.buttonOptions buttonOptions} defined, buttons
 * are displayed using {@link ButtonInputMode}.<br/>
 * When the button of an action is clicked or the action {@link WizardAction.trigger trigger} is
 * satisfied, the action is {@link WizardAction.handler handled} and the active actions are
 * re-evaluated.<br/>
 * When a legend is used, the {@link WizardAction.description descriptions} for
 * all active actions are added to it.
 */
export default class GraphWizardInputMode extends MultiplexingInputMode {
  private static readonly DEFAULT_EDGE_BUTTON_LAYOUT = new EdgePathLabelModel({
    distance: 5,
    autoRotation: false,
    sideOfEdge: 'above-edge'
  }).createDefaultParameter()

  private static readonly DEFAULT_NODE_BUTTON_LAYOUT = new ExteriorLabelModel({
    insets: 10
  }).createParameter(ExteriorLabelModelPosition.NORTH)

  private readonly _mouseHandler: (sender: CanvasComponent, evt: MouseEventArgs) => void
  private readonly _keyHandler: (sender: CanvasComponent, evt: KeyEventArgs) => void
  private readonly _itemChangedHandler: (
    sender: GraphComponent,
    evt: PropertyChangedEventArgs
  ) => void

  private readonly _legendDiv: HTMLDivElement | null = null
  private readonly _buttonMode: ButtonInputMode
  private readonly _createEdgeMode: CreateEdgeInputMode
  private readonly _actions: List<WizardAction>

  private _activeActions: List<WizardAction>
  private _isHandlingAction: boolean

  public activePickersAction: WizardAction | null = null
  private showPickersOnly = false
  private pickerButtons: Button[][] | null = null

  private pickerSelectionAction: WizardAction | null = null
  private pickerSelectionResolve: ((value: boolean | PromiseLike<boolean>) => void | null) | null =
    null

  /**
   * The {@link ButtonInputMode} used to show buttons for active actions.
   */
  get buttonMode(): ButtonInputMode {
    return this._buttonMode
  }

  /**
   * The {@link CreateEdgeInputMode} used to interactively creates edges for the diagram.<br/>
   * The default is a {@link KeyboardCreateEdgeInputMode} that enhances {@link CreateEdgeInputMode}
   * and support selecting the target node via keyboard.
   */
  get createEdgeMode(): CreateEdgeInputMode {
    return this._createEdgeMode
  }

  /**
   * The {@link GraphComponent} the diagram belongs to.
   */
  get graphComponent(): GraphComponent {
    return this.inputModeContext!.canvasComponent! as GraphComponent
  }

  /**
   * The diagram graph.
   */
  get graph(): IGraph {
    return this.graphComponent.graph
  }

  /**
   * The {@link IModelItem} actions are activated and handled for.
   */
  get currentItem(): IModelItem | null {
    return this.graphComponent.currentItem
  }

  set currentItem(item: IModelItem | null) {
    this.graphComponent.currentItem = item
  }

  /**
   * Creates a new input mode instance.
   * @param legendDiv The legend to add the descriptions of the active actions to.
   */
  constructor(legendDiv?: HTMLDivElement) {
    super()

    this.priority = -10
    this.exclusive = true
    this._mouseHandler = this.handleEvent.bind(this)
    this._keyHandler = this.handleEvent.bind(this)
    this._itemChangedHandler = this.updateActiveActions.bind(this)
    this._legendDiv = legendDiv || null

    this._actions = new List()
    this._activeActions = new List()

    this._isHandlingAction = false

    // initialize child input modes
    this._buttonMode = new ButtonInputMode()
    // the button mode is used to show buttons for active actions
    this.buttonMode.buttonTrigger = ButtonTrigger.NONE
    this.buttonMode.buttonSize = new Size(30, 30)
    this.buttonMode.addQueryButtonsListener(this.queryButtons.bind(this))
    this.add(this.buttonMode)

    // A custom CreateEdgeInputMode is used, that allows for selecting the target node via keyboard
    this._createEdgeMode = new KeyboardCreateEdgeInputMode()
    this.createEdgeMode.addEdgeCreationStartedListener(this.updateActiveActions.bind(this))
    this.createEdgeMode.addEdgeCreatedListener((sender, args) => {
      this.handleEvent(sender, new WizardEventArgs('edge-created', args))
    })
    this.createEdgeMode.addGestureCanceledListener((sender, args) => {
      this.handleEvent(sender, new WizardEventArgs('edge-canceled', args))
    })
    this.add(this.createEdgeMode)
  }

  /**
   * Adds a {@link WizardAction} to the actions managed by this mode.
   * @param action The action to add.
   */
  public addAction(action: WizardAction): void {
    this._actions.add(action)
  }

  /**
   * {@link WizardAction.handler Handles} the action and prevents automatic changes of the active
   * actions while the action is handled.
   * @param action The action to handle.
   * @param item The item the action shall handle.
   * @param type The action type the action shall handle.
   * @param e The event that triggered the action.
   */
  public async handleAction(
    action: WizardAction,
    item: IModelItem | null,
    type: string,
    e: EventArgs
  ): Promise<void> {
    this._isHandlingAction = true
    this.hideButtonsAndLegend()
    let compoundEdit: ICompoundEdit | undefined
    if (this.graph.undoEngineEnabled && !action.noUndo) {
      // when undo is enabled and the action can be undone, begin a compound edit, so all steps
      // in the action can be undone as a single undo-operation
      compoundEdit = this.graph.undoEngine?.beginCompoundEdit(
        'Undo ' + action.type,
        'Redo ' + action.type
      )
    }
    // try to disable the KeyboardInputMode to prevent ICommands to be executed during action handling
    const kim = this.getKeyboardInputMode()
    const wasEnabled = !!kim && kim.enabled
    if (wasEnabled) {
      kim!.enabled = false
    }

    // handle action
    const successful = await action.handler(this, item, type, e)

    if (compoundEdit) {
      if (successful == undefined || successful) {
        compoundEdit.commit()
      } else {
        compoundEdit.cancel()
      }
    }
    if (wasEnabled) {
      kim!.enabled = true
    }

    this._isHandlingAction = false
    this.updateActiveActions()
  }

  private getKeyboardInputMode(): KeyboardInputMode | null {
    const ctx = this.inputModeContext
    if (ctx) {
      const parent = ctx.parentInputMode
      if (parent instanceof GraphEditorInputMode) {
        return parent.keyboardInputMode
      }
    }
    return null
  }

  /**
   * Hides all buttons and shows the picker buttons of the provided action instead.
   *
   * A promise is returned that is resolved when one of the buttons is triggered or the pickers
   * are canceled via <em>ESC</em> key.
   * @param action The action whose picker selection shall be displayed.
   * @param item The item used by the action.
   */
  public showPickerSelection(action: WizardAction, item?: IModelItem): Promise<boolean> {
    if (!action.buttonOptions || !action.buttonOptions.pickerButtons) {
      // if action has no picker buttons, resolve instantly
      return Promise.resolve(false)
    }

    // remember action and resolve callback for later
    this.pickerSelectionAction = action
    this.showPickersOnly = true
    const promise = new Promise<boolean>((resolve, reject) => {
      this.pickerSelectionResolve = resolve
    })
    // show picker buttons and focus first one
    this.updateButtons(item)
    if (this.pickerButtons) {
      const mainTag = WizardAction.getButtonType(action.buttonOptions, item ?? this.currentItem!)
      this.buttonMode.focusedButton = this.findPickerButtonToFocus(mainTag)
    }
    return promise
  }

  /**
   * Updates the {@link Button buttons} displayed for the active actions.
   * @param item The mode item to show the buttons for. If not specified, the {@link currentItem}
   * is used.
   */
  public updateButtons(item?: IModelItem): void {
    const buttonOwner = item || this.currentItem
    if (buttonOwner) {
      this.buttonMode.showButtons(buttonOwner, true)
    } else {
      this.buttonMode.hideButtons()
    }
  }

  /**
   * Hides the mode's action buttons and its legend.
   */
  public hideButtonsAndLegend(): void {
    const div = this._legendDiv
    if (div) {
      this.clearLegend(div, false)
    }
    this.buttonMode.hideButtons()
  }

  /**
   * Updates which actions are active as well as the buttons and legend for these actions.
   * @private
   */
  private updateActiveActions(): void {
    if (this._isHandlingAction) {
      // don't update the active actions while an action is handled
      return
    }

    // clear all active actions and find new ones whose pre-condition is met
    this.clear()
    this._activeActions = this._actions.filter(action => action.preCondition(this)).toList()

    // update the buttons and the legend for the active actions
    this.updateButtons()
    this.updateLegend()

    this.inputModeContext!.canvasComponent!.focus()
  }

  /**
   * Updates the legend with the descriptions of the active actions.
   * @private
   */
  private updateLegend(): void {
    if (this._legendDiv) {
      this.clearLegend(this._legendDiv, true)
      const gridDiv = document.createElement('div')
      this._legendDiv.appendChild(gridDiv)
      this._activeActions
        .filter(action => !!action.description)
        .forEach(action => {
          const div = document.createElement('div')
          div.innerHTML = WizardAction.getTextWithShortcuts(
            action.description!,
            'legend',
            action.shortcuts
          )
          gridDiv.appendChild(div)
        })
    }
  }

  /**
   * Clears the given {@link HTMLDivElement} and sets its visibility to the given state.
   * @private
   */
  private clearLegend(legendDiv: HTMLDivElement, visible: boolean): void {
    legendDiv.innerHTML = ''
    legendDiv.parentElement!.parentElement!.hidden = !visible
  }

  /**
   * Handle mouse, keyboard and custom {@link WizardEventArgs wizard} events.
   * @param source The source that dispatched the event.
   * @param e The arguments of the event.
   * @private
   */
  private async handleEvent(source: object, e: EventArgs): Promise<void> {
    const controller = this.controller
    if (!controller) {
      return
    }

    if (!controller.hasMutex() && !controller.canRequestMutex()) {
      return
    }

    this.handleEventImpl(source, e)
  }

  private async handleEventImpl(source: object, e: EventArgs): Promise<void> {
    if (this.pickerSelectionAction) {
      // picker selection is displayed, so only accept moving the button focus and closing the pickers

      if (this.tryMovePickerButtonFocus(e)) {
        // an arrow key was pressed and the focused moved to another picker button
        return
      }

      if (e instanceof KeyEventArgs && e.key == Key.ESCAPE && e.eventType == KeyEventType.UP) {
        // Escape was pressed and so the picker buttons were hidden
        this.resolvePickerSelection(false)
        return
      }
      if (e instanceof MouseEventArgs && e.eventType == MouseEventTypes.CLICK) {
        // Clicking outside of the picker selection buttons resolves the picker selection
        // without handling the pickerSelectionAction
        this.resolvePickerSelection(true)
        return
      }

      // ignore other input while pickerSelection is active
      return
    }
    if (this._isHandlingAction) {
      // prevent event handling while an action is handled
      return
    }

    if (this.tryMovePickerButtonFocus(e)) {
      // an arrow key was pressed and the focused moved to another picker button
      return
    }

    if (this.tryClosePickerButtons(e)) {
      // Escape was pressed and so the picker buttons were hidden
      return
    }

    if (this.tryResetCurrentItem(e)) {
      // Escape was pressed and so the current items was reset to null
      return
    }

    // find an active action that is triggered by the source/event combination
    const triggeredAction = this._activeActions.find(action => action.trigger(source, e))
    if (triggeredAction !== null) {
      if (e instanceof KeyEventArgs || e instanceof MouseEventArgs) {
        e.preventDefault()
      }
      await this.handleAction(triggeredAction, this.currentItem, triggeredAction.type, e)
    }
  }

  /**
   * If an arrow key was pressed and the focused button was one of the picker buttons,
   * the next picker button in arrow direction gets focused.
   * @param e The event to check.
   * @returns Whether the picker button focus was moved.
   * @private
   */
  private tryMovePickerButtonFocus(e: EventArgs): boolean {
    if (
      this.pickerButtons &&
      this.buttonMode.focusedButton &&
      e instanceof KeyEventArgs &&
      e.eventType == KeyEventType.DOWN &&
      (e.key == Key.ARROW_LEFT ||
        e.key == Key.ARROW_RIGHT ||
        e.key == Key.ARROW_UP ||
        e.key == Key.ARROW_DOWN)
    ) {
      // calculate the row and column indices of the focused picker button
      let rowIndex = -1
      let colIndex = -1
      const rowCount = this.pickerButtons.length
      const columnCount = this.pickerButtons[0].length
      for (let r = 0; r < rowCount && rowIndex === -1; r++) {
        const row = this.pickerButtons[r]
        for (let c = 0; c < row.length; c++) {
          if (row[c] === this.buttonMode.focusedButton) {
            rowIndex = r
            colIndex = c
            break
          }
        }
      }
      if (rowIndex > -1) {
        // indices of the focused picker button could be calculated, so calculate the next
        // picker button indices in arrow key direction
        let newRow = rowIndex
        let newColumn = colIndex

        switch (e.key) {
          case Key.ARROW_DOWN:
            do {
              newRow = (newRow + 1) % rowCount
            } while (!this.pickerButtons[newRow][newColumn])
            break
          case Key.ARROW_UP:
            do {
              newRow = (newRow - 1 + rowCount) % rowCount
            } while (!this.pickerButtons[newRow][newColumn])
            break
          case Key.ARROW_LEFT:
            do {
              newColumn = (newColumn - 1 + columnCount) % columnCount
            } while (!this.pickerButtons[newRow][newColumn])
            break
          case Key.ARROW_RIGHT:
          default:
            do {
              newColumn = (newColumn + 1) % columnCount
            } while (!this.pickerButtons[newRow][newColumn])
            break
        }
        if (newRow != rowIndex || newColumn != colIndex) {
          this.buttonMode.focusedButton = this.pickerButtons[newRow][newColumn]
        }
        return true
      }
    }
    return false
  }

  private tryClosePickerButtons(e: EventArgs) {
    if (e instanceof KeyEventArgs && e.key == Key.ESCAPE && e.eventType == KeyEventType.UP) {
      return this.tryClosePickerButtonsCore()
    }
    return false
  }

  private tryClosePickerButtonsCore(): boolean {
    if (this.pickerButtons) {
      this.togglePickerButtons()
      this.updateActiveActions()
      return true
    } else {
      return false
    }
  }

  private tryResetCurrentItem(e: EventArgs) {
    if (this.createEdgeMode.isCreationInProgress) {
      // don't reset current item when edge creation is in progress
      return false
    }
    const keyTriggeredReset =
      e instanceof KeyEventArgs && e.key == Key.ESCAPE && e.eventType == KeyEventType.UP

    const mouseTriggeredReset =
      e instanceof MouseEventArgs &&
      e.eventType == MouseEventTypes.CLICK &&
      e.modifiers == ModifierKeys.NONE &&
      !this.graphComponent.hitElementsAt(e.location).some()

    if (this.currentItem && (keyTriggeredReset || mouseTriggeredReset)) {
      this.currentItem = null
      return true
    }
    return false
  }

  /**
   * A callback for {@link ButtonInputMode.queryButtons} where buttons are added for each active
   * action that has {@link WizardAction.buttonOptions}.
   * @param sender The {@link ButtonInputMode} handling the added buttons.
   * @param evt The event to add the buttons to.
   * @private
   */
  private queryButtons(sender: ButtonInputMode, evt: QueryButtonsEvent): void {
    if (this.pickerSelectionAction) {
      // if showPickerSelection was called, just add the picker buttons
      this.addPickerSelectionButtons(this.pickerSelectionAction, evt)
      return
    }
    // check all active actions for button options
    // if there are no button options for an action, no button is created
    const autoPlacedActions: WizardAction[] = []
    for (const action of this._activeActions) {
      const buttonOptions = action.buttonOptions
      if (buttonOptions) {
        if (buttonOptions.layout || buttonOptions.layoutFactory) {
          // this is an action with button options that specify custom button placement logic
          // place the action button according to said custom placement logic
          this.addSelfPlacedButton(action, evt)
        } else {
          // this is an action with button options but no custom button placement logic
          // collect the action for automatic button placement below
          autoPlacedActions.push(action)
        }
      }
    }

    // place all auto-placed buttons in a row
    this.addAutoPlacedButtons(
      autoPlacedActions.map((action: WizardAction) => action.buttonOptions!),
      PickerLayout.Row,
      GraphWizardInputMode.getBaseLayout(this.currentItem!),
      index => this.createWizardActionHandler(autoPlacedActions[index]),
      (button, index) => {
        autoPlacedActions[index].button = button
      },
      index => autoPlacedActions[index].shortcuts,
      evt
    )

    // if pickers are active for an action, add buttons for those pickers
    if (this.activePickersAction) {
      // calculate layout of the main button to place picker buttons relative to it
      const options = this.activePickersAction.buttonOptions!
      const wrappedParameter = this.activePickersAction.button?.label.layoutParameter!
      // picker buttons and their background are placed north of the parent button with an offset
      const backgroundLayout = new OffsetLabelModelWrapper().createOffsetParameter(
        wrappedParameter,
        new Point(0, -PICKER_BUTTON_GRID_OFFSET),
        options.size ?? this.buttonMode.buttonSize,
        new Point(0.5, 0),
        new Point(0.5, 1)
      )
      // reset button array
      this.pickerButtons = []
      const defaultActionHandler = this.createDefaultButtonHandler(this.activePickersAction)
      this.addAutoPlacedButtons(
        options.pickerButtons!,
        options.pickerLayout ?? PickerLayout.Grid,
        backgroundLayout,
        options => defaultActionHandler,
        this.setPickerButton.bind(this),
        index => undefined,
        evt
      )
    }
  }

  /**
   * Adds the picker buttons for action to the {@link QueryButtonsEvent}.
   * @param action the action to add buttons for.
   * @param evt The event to add the buttons to.
   * @private
   */
  private addPickerSelectionButtons(action: WizardAction, evt: QueryButtonsEvent): void {
    const parentOptions = action.buttonOptions!
    // handle action and close picker selection afterwards
    const handler: ButtonActionListener = async button => {
      this.buttonMode.hideButtons()
      const actionSuccessful = await action.handler(
        this,
        button.owner,
        button.tag,
        this.inputModeContext?.canvasComponent?.lastInputEvent!
      )
      this.resolvePickerSelection(actionSuccessful == undefined || actionSuccessful)
    }
    // reset button array
    this.pickerButtons = []
    this.addAutoPlacedButtons(
      parentOptions.pickerButtons!,
      parentOptions.pickerLayout ?? PickerLayout.Grid,
      WizardAction.getButtonLayout(parentOptions, evt.owner),
      index => handler.bind(this),
      this.setPickerButton.bind(this),
      index => undefined,
      evt
    )
  }

  /**
   * Hides picker buttons and resolves the promise that was returned by {@link showPickerSelection}.
   * @private
   * @param success <em>True</em>, if a picker button was selected, or <em>false</em>, if the picker
   * selection was canceled.
   */
  private resolvePickerSelection(success: boolean): void {
    const resolve = this.pickerSelectionResolve
    this.pickerSelectionResolve = null
    this.pickerSelectionAction = null
    this.showPickersOnly = false
    this.buttonMode.hideButtons()
    if (resolve) {
      resolve(success)
    }
  }

  /**
   * Add button for the action.
   * @param action The action to the button for.
   * @param evt The event to add the buttons to.
   * @private
   */
  private addSelfPlacedButton(action: WizardAction, evt: QueryButtonsEvent): void {
    // only add button if not only picker buttons shall be added
    if (!this.showPickersOnly) {
      const options = action.buttonOptions!
      const buttonSize = options.size ?? this.buttonMode.buttonSize
      action.button = evt.addButton({
        tag: WizardAction.getButtonType(options, evt.owner),
        onAction: this.createWizardActionHandler(action),
        layoutParameter: WizardAction.getButtonLayout(options, evt.owner),
        size: buttonSize,
        style: WizardAction.getButtonStyle(options, evt.owner, buttonSize),
        text: WizardAction.getButtonText(options, evt.owner),
        tooltip: WizardAction.getButtonTooltip(options, evt.owner, action.shortcuts)
      })
    }
  }

  /**
   * Returns a {@link ButtonActionListener} that either {@link togglePickerButtons toggles the picker buttons}
   * if the action has those or just calls the {@link createDefaultButtonHandler default action} handler.
   * @param action The action to create the button handling for.
   * @private
   */
  private createWizardActionHandler(action: WizardAction): ButtonActionListener {
    // triggering the main button when picker buttons are available should toggle whether those
    // picker buttons are visible
    return action.buttonOptions!.pickerButtons
      ? (button: Button) => this.togglePickerButtons(action)
      : this.createDefaultButtonHandler(action)
  }

  /**
   * Returns a {@link ButtonActionListener} that calls {@link handleAction} for the given action.
   * @param action The action to create the button handling for.
   * @private
   */
  private createDefaultButtonHandler(action: WizardAction): ButtonActionListener {
    return (button: Button) => {
      this.handleAction(
        action,
        button.owner,
        button.tag,
        this.inputModeContext?.canvasComponent?.lastInputEvent!
      )
    }
  }

  /**
   * Adds buttons for all button options and a common background if necessary.
   * @param options The button options used to create the buttons.
   * @param pickerLayout The layout style to arrange the buttons.
   * @param baseLayout The layout of the background button.
   * @param handlerProvider A callback providing the {@link ButtonActionListener} for the {@link ButtonOptions}
   * at a specified index.
   * @param onButtonCreated A handler called after the {@link Button} for the {@link ButtonOptions}
   * at a specified index was created.
   * @param getShortcuts A callback providing the shortcuts for the {@link ButtonOptions} at a
   * specified index.
   * @param evt The event to add the buttons to.
   * @private
   */
  private addAutoPlacedButtons(
    options: ButtonOptions[],
    pickerLayout: PickerLayout,
    baseLayout: ILabelModelParameter,
    handlerProvider: (index: number) => ButtonActionListener,
    onButtonCreated: (button: Button, index: number, columnCount: number) => void,
    getShortcuts: (index: number) => Shortcut[] | undefined,
    evt: QueryButtonsEvent
  ): void {
    // use the default button size
    const defaultButtonSize = this.buttonMode.buttonSize
    const buttonCount = options.length

    // calculate: - number of rows and columns
    let colCount: number
    // - accumulated heights (pickerLayout == 'column') or widths (pickerLayout == 'rows') of the buttons
    const sizes: number[] = []
    // - size of the background
    let bgSize: Size
    const marginBothSides = 2 * PICKER_BUTTON_BACKGROUND_MARGIN
    if (pickerLayout === PickerLayout.Grid) {
      // grid currently only supports buttons using defaultButtonSize
      colCount = Math.floor(Math.sqrt(buttonCount))
      const rowCount = Math.ceil(buttonCount / colCount)
      bgSize = new Size(
        colCount * defaultButtonSize.width +
          (colCount - 1) * PICKER_BUTTON_SPACING +
          marginBothSides,
        rowCount * defaultButtonSize.height +
          (rowCount - 1) * PICKER_BUTTON_SPACING +
          marginBothSides
      )
    } else if (pickerLayout === PickerLayout.Row) {
      colCount = buttonCount
      let maxHeight = 0
      options.forEach((value, index) => {
        sizes[index] =
          (index == 0 ? 0 : sizes[index - 1]) +
          (value.size ? value.size.width : defaultButtonSize.width) +
          (index == options.length - 1 ? 0 : PICKER_BUTTON_SPACING)
        maxHeight = Math.max(maxHeight, value.size ? value.size.height : defaultButtonSize.height)
      })
      bgSize = new Size(sizes[sizes.length - 1] + marginBothSides, maxHeight + marginBothSides)
    } else {
      // case PickerLayout.Column

      colCount = 1
      let maxWidth = 0
      options.forEach((value, index) => {
        sizes[index] =
          (index == 0 ? 0 : sizes[index - 1]) +
          (value.size ? value.size.height : defaultButtonSize.height) +
          (index == options.length - 1 ? 0 : PICKER_BUTTON_SPACING)
        maxWidth = Math.max(maxWidth, value.size ? value.size.width : defaultButtonSize.width)
      })
      bgSize = new Size(maxWidth + marginBothSides, sizes[sizes.length - 1] + marginBothSides)
    }

    // if no picker button has its own layout parameter set, add a common background 'button'
    if (options.every(opt => !opt.layout && !opt.layoutFactory)) {
      // add background button
      evt.addButton({
        onAction: button => {},
        layoutParameter: baseLayout,
        style: new DefaultLabelStyle({
          renderer: new DropShadowLabelRenderer(),
          backgroundFill: Fill.WHITE_SMOKE
        }),
        size: bgSize,
        ignoreFocus: true
      })
    }

    // add a button for each ButtonOptions configuration
    options.forEach((options, index) => {
      let buttonLayout: ILabelModelParameter
      if (options.layout) {
        buttonLayout = options.layout
      } else if (options.layoutFactory) {
        buttonLayout = options.layoutFactory(evt.owner)
      } else {
        buttonLayout = this.getAutoPlacedButtonLayout(
          pickerLayout,
          baseLayout,
          bgSize,
          index,
          colCount,
          sizes
        )
      }
      const button = evt.addButton({
        tag: WizardAction.getButtonType(options, evt.owner),
        onAction: handlerProvider(index),
        layoutParameter: buttonLayout,
        size: options.size,
        style: WizardAction.getButtonStyle(options, evt.owner, options.size ?? defaultButtonSize),
        text: WizardAction.getButtonText(options, evt.owner),
        tooltip: WizardAction.getButtonTooltip(options, evt.owner, getShortcuts(index))
      })
      onButtonCreated(button, index, colCount)
    })
  }

  /**
   * Stores the button in the pickerButtons array for later use.
   * @param button The button to store.
   * @param index The index of the button which is used to calculate its row and column indices.
   * @param columnCount The count of columns the pickerButtons array should use.
   * @private
   */
  private setPickerButton(button: Button, index: number, columnCount: number): void {
    const row = Math.floor(index / columnCount)
    const column = index % columnCount
    if (column === 0) {
      // initialize row array if this is the first button in this row
      this.pickerButtons![row] = []
    }
    this.pickerButtons![row][column] = button
  }

  /**
   * Returns the {@link ILabelModelParameter layout} used for a button considering its index and the
   * pickerLayout.
   * @param pickerLayout The layout style to arrange the buttons.
   * @param relativeLayout The layout the picker buttons shall be placed relative to.
   * @param parentButtonSize The size of the button the relative layout shall be used with.
   * @param index The index of this picker button of all picker buttons for this action.
   * @param cols The count of the columns of the picker button grid.
   * @param sizes The heights for a column layout, the widths for a row layout or an empty array for a grid layout.
   * @private
   */
  private getAutoPlacedButtonLayout(
    pickerLayout: PickerLayout,
    relativeLayout: ILabelModelParameter,
    parentButtonSize: Size,
    index: number,
    cols: number,
    sizes: number[]
  ): ILabelModelParameter {
    let dx = PICKER_BUTTON_BACKGROUND_MARGIN
    let dy = PICKER_BUTTON_BACKGROUND_MARGIN
    switch (pickerLayout) {
      case PickerLayout.Grid: {
        // grid currently only supports buttons using the default button size
        const defaultButtonSize = this.buttonMode.buttonSize
        const row = Math.floor(index / cols)
        const col = index % cols
        dx += col * (defaultButtonSize.width + PICKER_BUTTON_SPACING)
        dy += row * (defaultButtonSize.height + PICKER_BUTTON_SPACING)
        break
      }
      case PickerLayout.Row: {
        dx += index > 0 ? sizes[index - 1] : 0
        dy += 0
        break
      }
      case PickerLayout.Column: {
        dx += 0
        dy += index > 0 ? sizes[index - 1] : 0
      }
    }

    // calculate the layout relative to the top-left corner using the calculated offset
    return OffsetLabelModelWrapper.INSTANCE.createOffsetParameter(
      relativeLayout,
      new Point(dx, dy),
      parentButtonSize,
      Point.ORIGIN,
      Point.ORIGIN
    )
  }

  /**
   * Returns the default placement of a button for the given owner.
   * @param owner The owner to return the placement for.
   */
  static getBaseLayout(owner: IModelItem) {
    if (owner instanceof IEdge) {
      return GraphWizardInputMode.DEFAULT_EDGE_BUTTON_LAYOUT
    } else {
      return GraphWizardInputMode.DEFAULT_NODE_BUTTON_LAYOUT
    }
  }

  /**
   * Toggles whether picker buttons are shown for the activePickersAction or another given action.
   *
   * If currently picker actions are shown, they get hidden.
   * If no picker actions were displayed or action is not the activePickersAction, new picker actions
   * are shown.
   * @param action An optional action to toggle the picker buttons for.
   */
  togglePickerButtons(action?: WizardAction): void {
    // hide current pickers if there are any
    const hidePickers = this.pickerButtons
    // show new pickers only if action wasn't the activePickersAction or if there was no activePickersAction
    const showPickers = (action && action != this.activePickersAction) || !this.activePickersAction

    if (hidePickers) {
      const pickerButtonWasFocused =
        this.pickerButtons &&
        this.pickerButtons.some(row => row.some(button => button === this.buttonMode.focusedButton))
      const pickerActionWasFocused =
        this.activePickersAction &&
        this.activePickersAction.button === this.buttonMode.focusedButton
      const newFocusedAction =
        pickerButtonWasFocused || pickerActionWasFocused ? this.activePickersAction : null
      this.activePickersAction = null
      this.updateButtons()
      if (newFocusedAction && newFocusedAction.button) {
        this.buttonMode.focusedButton = newFocusedAction.button
      }
    }

    if (showPickers) {
      let newActivePickersAction: WizardAction | null = action ? action : null
      if (!newActivePickersAction && this.buttonMode.focusedButton) {
        newActivePickersAction = this._activeActions.firstOrDefault(
          action =>
            action.button === this.buttonMode.focusedButton &&
            action.buttonOptions !== null &&
            action.buttonOptions.pickerButtons !== null
        )
      }
      if (newActivePickersAction && newActivePickersAction.buttonOptions?.pickerButtons) {
        this.cleanupActiveAction()
        this.activePickersAction = newActivePickersAction
        this.updateButtons()

        if (this.pickerButtons) {
          const mainTag = this.activePickersAction.button!.tag
          this.buttonMode.focusedButton = this.findPickerButtonToFocus(mainTag)
        } else {
          this.buttonMode.focusedButton = this.activePickersAction.button
        }
      }
    }
  }

  private findPickerButtonToFocus(mainTag: any) {
    this.pickerButtons!.forEach(row => {
      row.forEach(button => {
        if (button.tag == mainTag) {
          return button
        }
      })
    })
    return this.pickerButtons![0][0]
  }

  /**
   * @param {IInputModeContext} context - the context to install this mode into
   * @param {ConcurrencyController} controller - The {@link InputModeBase#controller} for this mode.
   */
  install(context: IInputModeContext, controller: ConcurrencyController): void {
    super.install(context, controller)
    const canvas = context.canvasComponent as GraphComponent
    if (canvas !== null) {
      canvas.addMouseClickListener(this._mouseHandler)
      canvas.addMouseDragListener(this._mouseHandler)
      canvas.addMouseMoveListener(this._mouseHandler)
      canvas.addMouseDownListener(this._mouseHandler)
      canvas.addMouseUpListener(this._mouseHandler)
      canvas.addMouseLostCaptureListener(this._mouseHandler)
      canvas.addMouseEnterListener(this._mouseHandler)
      canvas.addMouseLeaveListener(this._mouseHandler)
      canvas.addKeyPressListener(this._keyHandler)
      canvas.addKeyDownListener(this._keyHandler)
      canvas.addKeyUpListener(this._keyHandler)
      canvas.addCurrentItemChangedListener(this._itemChangedHandler)
    }
  }

  /**
   * @param {IInputModeContext} context - The context to remove this mode from. This is the same instance that has been passed to {@link InputModeBase#install}.
   */
  uninstall(context: IInputModeContext): void {
    super.uninstall(context)
    const canvas = context.canvasComponent as GraphComponent
    if (canvas !== null) {
      canvas.removeMouseClickListener(this._mouseHandler)
      canvas.removeMouseDragListener(this._mouseHandler)
      canvas.removeMouseMoveListener(this._mouseHandler)
      canvas.removeMouseDownListener(this._mouseHandler)
      canvas.removeMouseUpListener(this._mouseHandler)
      canvas.removeMouseLostCaptureListener(this._mouseHandler)
      canvas.removeMouseEnterListener(this._mouseHandler)
      canvas.removeMouseLeaveListener(this._mouseHandler)
      canvas.removeKeyPressListener(this._keyHandler)
      canvas.removeKeyDownListener(this._keyHandler)
      canvas.removeKeyUpListener(this._keyHandler)
      canvas.removeCurrentItemChangedListener(this._itemChangedHandler)
    }
    this.clear()
  }

  /**
   * Clears the active actions.
   * @private
   */
  private clear(): void {
    this.cleanupActiveAction()
    this._activeActions.clear()
  }

  /**
   * Calls {@link WizardAction.clear clear} for all active actions.
   */
  public cleanupActiveAction(): void {
    this._activeActions.forEach(action => action.clear())
    this.activePickersAction = null
    this.pickerButtons = null
  }
}

/**
 * An {@link CreateEdgeInputMode} with keyboard support to finish the edge creation gesture on the
 * {@link GraphComponent.currentItem currentItem}.
 */
export class KeyboardCreateEdgeInputMode extends CreateEdgeInputMode {
  private useCurrentItem: boolean
  private readonly keyListener: (canvasComponent: CanvasComponent, evt: KeyEventArgs) => void
  private readonly mouseListener: (canvasComponent: CanvasComponent, evt: MouseEventArgs) => void

  constructor() {
    super()
    this.useCurrentItem = false
    this.keyListener = (sender, args) => {
      const arrowKeyPressed =
        args.modifiers === ModifierKeys.NONE &&
        (args.key === Key.ARROW_UP ||
          args.key === Key.ARROW_DOWN ||
          args.key === Key.ARROW_LEFT ||
          args.key === Key.ARROW_RIGHT)
      this.useCurrentItem = arrowKeyPressed
    }
    this.mouseListener = (sender, args) => {
      this.useCurrentItem = false
    }

    const endPointMovedRecognizer = this.endPointMovedRecognizer
    this.endPointMovedRecognizer = (sender, args) => {
      if (this.useCurrentItem) {
        return args instanceof KeyEventArgs && this.currentItem !== null
      } else {
        return endPointMovedRecognizer(sender, args)
      }
    }
    this.draggedRecognizer = EventRecognizers.NEVER
    const finishRecognizer = this.finishRecognizer
    this.finishRecognizer = (sender, event) => {
      return (
        finishRecognizer(sender, event) ||
        KeyEventRecognizers.create(KeyEventType.DOWN, Key.ENTER)(sender, event)
      )
    }
  }

  /**
   * @param {IGraph} graph - The graph to create the edge for.
   * @param {IPortCandidate} sourcePortCandidate - The candidate to use for the source end of the edge.
   * Usually the {@link CreateEdgeInputMode#sourcePortCandidate}. In case
   * {@link CreateEdgeInputMode#reversedEdgeCreation}, though, the value of
   * {@link CreateEdgeInputMode#targetPortCandidate}.
   * @param {IPortCandidate} targetPortCandidate - The candidate to use for the target end of the edge.
   * Usually the {@link CreateEdgeInputMode#targetPortCandidate}. In case
   * {@link CreateEdgeInputMode#reversedEdgeCreation}, though, the value of
   * {@link CreateEdgeInputMode#sourcePortCandidate}.
   * @returns {IEdge}
   */
  createEdge(
    graph: IGraph,
    sourcePortCandidate: IPortCandidate,
    targetPortCandidate: IPortCandidate
  ): IEdge | null {
    if (!this.useCurrentItem) {
      return super.createEdge(graph, sourcePortCandidate, targetPortCandidate)
    }
    return super.createEdge(
      graph,
      sourcePortCandidate,
      new DefaultPortCandidate(this.currentItem as IPort)
    )
  }

  updateTargetLocation(location: Point) {
    if (!this.useCurrentItem) {
      super.updateTargetLocation(location)
    }
  }

  /**
   * @param {IInputModeContext} context - The context that this instance shall be installed into.
   * The same instance will be passed to this instance during {@link IInputMode#uninstall}.
   * A reference to the context may be kept and queried during the time the mode is installed.
   * @param {ConcurrencyController} controller - The {@link CreateEdgeInputMode#controller} for this mode.
   */
  install(context: IInputModeContext, controller: ConcurrencyController): void {
    super.install(context, controller)
    context.canvasComponent!.addKeyDownListener(this.keyListener)
    context.canvasComponent!.addMouseMoveListener(this.mouseListener)
  }

  /**
   * @param {IInputModeContext} context - The context to deregister from. This is the same instance
   * that had been passed to {@link IInputMode#install} during installation.
   */
  uninstall(context: IInputModeContext): void {
    context.canvasComponent!.removeKeyDownListener(this.keyListener)
    context.canvasComponent!.removeMouseMoveListener(this.mouseListener)
    super.uninstall(context)
  }

  get currentItem(): IModelItem | null {
    return (this.inputModeContext!.canvasComponent! as GraphComponent).currentItem
  }
}

/**
 * Custom {@link EventArgs} that are dispatched when an interactive edge creation is cancelled or
 * finished.
 */
export class WizardEventArgs extends EventArgs {
  private readonly _type: 'edge-created' | 'edge-canceled'
  private readonly _originalEvent: EventArgs

  /**
   * Creates a new event args instance.
   * @param {'edge-created' | 'edge-canceled'} type The type of the event.
   * @param originalEvent The original event that triggered this event.
   */
  constructor(type: 'edge-created' | 'edge-canceled', originalEvent: EventArgs) {
    super()
    this._type = type
    this._originalEvent = originalEvent
  }

  /**
   * The type of the event.
   */
  get type(): 'edge-created' | 'edge-canceled' {
    return this._type
  }

  /**
   * The original event that triggered this event.
   */
  get originalEvent(): EventArgs {
    return this._originalEvent
  }
}

/**
 * Adds the <em>container-drop-shadow</em> style class to the {@link SVGElement} of the created visual.
 */
class DropShadowLabelRenderer extends DefaultLabelStyleRenderer {
  constructor() {
    super()
  }

  createVisual(context: IRenderContext): Visual | null {
    const visual = super.createVisual(context) as SvgVisual
    visual.svgElement.setAttribute('class', 'container-drop-shadow')
    return visual
  }
}
