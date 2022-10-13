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
  DefaultLabelStyle,
  Enum,
  EventArgs,
  Fill,
  HorizontalTextAlignment,
  IconLabelStyle,
  ILabelModelParameter,
  ILabelStyle,
  IModelItem,
  Insets,
  InteriorLabelModel,
  InteriorStretchLabelModel,
  Key,
  KeyEventArgs,
  KeyEventType,
  ModifierKeys,
  Size,
  VerticalTextAlignment
} from 'yfiles'
import { GraphWizardInputMode } from './GraphWizardInputMode'
import type { Button, ButtonActionListener } from '../../input/button-input-mode/ButtonInputMode'

/**
 * A condition that has to be met so that a {@link WizardAction} is active.
 */
export type PreCondition = (mode: GraphWizardInputMode) => boolean

/**
 * A callback to decide, whether an event triggers an active {@link WizardAction}.
 */
export type Trigger = (source: object, evt: EventArgs) => boolean

/**
 * A combination of {@link Key} and {@link ModifierKeys} that describe a keyboard shortcut.
 */
export type Shortcut = {
  key: Key
  modifier?: ModifierKeys
}

/**
 * A callback that is called to handle a {@link WizardAction} that has been {@link Trigger triggered}.
 *
 * Returns whether the handling is considered to be successful.
 */
export type Handler = (
  mode: GraphWizardInputMode,
  item: IModelItem | null,
  type: string,
  evt: EventArgs
) => Promise<boolean> | boolean | void

/**
 * The configuration for an icon style for a {@link Button}.
 */
export type IconButton = {
  type: 'icon'
  iconPath: string
  backgroundFill?: string
}

/**
 * The configuration for a rectangular style for a {@link Button}.
 */
export type RectButton = {
  type: 'rect'
  outline?: string
  fill?: string
}

/**
 * The configuration for a text label style for a {@link Button} that may optionally have an icon.
 */
export type TextButton = {
  type: 'text'
  text: string
  iconPath?: string
  backgroundFill?: string
}

/**
 * The layout style buttons shall be arranged in.
 */
export enum PickerLayout {
  Grid,
  Row,
  Column
}

/**
 * The configuration options for a {@link Button} used for a {@link WizardAction}.
 */
export type ButtonOptions = {
  size?: Size
  layout?: ILabelModelParameter
  layoutFactory?: (item: IModelItem) => ILabelModelParameter
  type?: string
  typeFactory?: (item: IModelItem) => string
  tooltip?: string
  tooltipFactory?: (item: IModelItem) => string
  style?: IconButton | RectButton | TextButton
  styleFactory?: (item: IModelItem) => IconButton | RectButton | TextButton
  pickerButtons?: ButtonOptions[]
  pickerLayout?: PickerLayout
}

/**
 * An action managed by the {@link GraphWizardInputMode}.
 */
export default class WizardAction {
  private readonly _type: string
  private readonly _preCondition: PreCondition
  private readonly _trigger: Trigger
  private readonly _shortcuts: Shortcut[]
  private readonly _handler: Handler
  private readonly _buttonOptions: ButtonOptions | null
  private readonly _description: string | undefined
  private readonly _noUndo: boolean
  button: Button | null = null

  /**
   * The type of the action that is passed to the {@link WizardAction.handler}.
   */
  get type(): string {
    return this._type
  }

  /**
   * Creates a new {@link WizardAction}.
   * @param type The type of the action that is passed to the {@link WizardAction.handler}.
   * @param preCondition The pre-condition that has to be met so that the action is active.
   * @param handler The callback executing the action once it is triggered.
   * @param shortcuts? The keyboard shortcuts to trigger this action.
   * @param description? The description added to the legend when this action is active.
   * @param buttonOptions? The configuration options for a button that is displayed when this action is active.
   * @param trigger? A callback to decide whether an event should trigger this action in addition
   * to the short-cuts and the button.
   * @param noUndo Whether the action should not be enqueued in the undo stack.
   */
  constructor(
    type: string,
    preCondition: PreCondition,
    handler: Handler,
    shortcuts?: Shortcut[] | null,
    description?: string,
    buttonOptions?: ButtonOptions | null,
    trigger?: Trigger | null,
    noUndo?: boolean
  ) {
    this._type = type
    this._preCondition = preCondition
    this._shortcuts = shortcuts ?? []
    this._trigger = (source, evt) => {
      if (trigger && trigger(source, evt)) {
        return true
      } else if (
        this.shortcuts.length > 0 &&
        evt instanceof KeyEventArgs &&
        evt.eventType === KeyEventType.DOWN
      ) {
        return this.shortcuts.some(
          shortCut =>
            shortCut.key == evt.key &&
            (shortCut.modifier === undefined || shortCut.modifier == evt.modifiers)
        )
      }
      return false
    }
    this._handler = handler
    this._description = description
    this._buttonOptions = buttonOptions || null
    this._noUndo = noUndo ?? false
  }

  /**
   * The pre-condition that has to be met so that the action is active.
   */
  get preCondition(): PreCondition {
    return this._preCondition
  }

  /**
   * The callback to decide whether an event should trigger this action.
   */
  get trigger(): Trigger {
    return this._trigger
  }

  /**
   * The keyboard shortcuts that trigger this action.
   */
  get shortcuts(): Shortcut[] {
    return this._shortcuts
  }

  /**
   * The callback executing the action once it is triggered.
   */
  get handler(): Handler {
    return this._handler
  }

  /**
   * The description added to the legend when this action is active.
   */
  get description(): string | undefined {
    return this._description
  }

  /**
   * The configuration options for a button that is displayed when this action is active.
   */
  get buttonOptions(): ButtonOptions | null {
    return this._buttonOptions
  }

  /**
   * Whether the action should not be enqueued in the undo stack.
   */
  get noUndo(): boolean {
    return this._noUndo
  }

  /**
   * Returns the default action used for all picker buttons as well as for the main button if no
   * picker buttons are used is to handle this action.
   * @param mode The {@link GraphWizardInputMode} handling this action.
   */
  getDefaultAction(mode: GraphWizardInputMode): ButtonActionListener {
    return (button: Button) => {
      mode.handleAction(
        this,
        button.owner,
        button.tag,
        mode.inputModeContext!.canvasComponent!.lastInputEvent
      )
    }
  }

  /**
   * Clears the action state when the action gets deactivated.
   */
  clear() {}

  /**
   * Returns the type of the action triggered by the button configured by the button options.
   * @param options The {@link ButtonOptions} to determine the type for.
   * @param owner The model item owning the button.
   * @private
   */
  static getButtonType(options: ButtonOptions, owner: IModelItem): string {
    let type = ''
    if (options.type) {
      type = options.type
    } else if (options.typeFactory) {
      type = options.typeFactory(owner)
    }
    return type
  }

  /**
   * Returns the {@link ILabelStyle style} used for the button configured by the button options.
   * @param options The {@link ButtonOptions} to determine the style for.
   * @param owner The model item owning the button.
   * @param buttonSize The size of the button.
   * @private
   */
  static getButtonStyle(options: ButtonOptions, owner: IModelItem, buttonSize: Size): ILabelStyle {
    // Determine the style config that has to be defined either by style or styleFactory
    const styleConfig = options.style || options.styleFactory!(owner)
    if (styleConfig && styleConfig.type === 'icon') {
      const iconLabelStyle = new IconLabelStyle({
        icon: styleConfig.iconPath,
        iconSize: buttonSize,
        iconPlacement: InteriorStretchLabelModel.CENTER
      })
      const fill = styleConfig.backgroundFill
        ? Fill.from(styleConfig.backgroundFill)
        : Fill.WHITE_SMOKE
      iconLabelStyle.wrapped = new DefaultLabelStyle({
        backgroundFill: fill
      })
      return iconLabelStyle
    } else if (styleConfig && styleConfig.type === 'rect') {
      return new DefaultLabelStyle({
        backgroundStroke: styleConfig.outline,
        backgroundFill: styleConfig.fill || null,
        insets: new Insets(4)
      })
    } else if (styleConfig && styleConfig.type === 'text') {
      const fill = styleConfig.backgroundFill
        ? Fill.from(styleConfig.backgroundFill)
        : Fill.WHITE_SMOKE
      const labelStyle = new DefaultLabelStyle({
        backgroundFill: fill,
        insets: new Insets(1),
        verticalTextAlignment: VerticalTextAlignment.CENTER,
        horizontalTextAlignment: styleConfig.iconPath
          ? HorizontalTextAlignment.RIGHT
          : HorizontalTextAlignment.CENTER
      })
      if (styleConfig.iconPath) {
        const min = Math.min(buttonSize.width, buttonSize.height)
        return new IconLabelStyle({
          icon: styleConfig.iconPath,
          iconSize: new Size(min, min),
          iconPlacement: InteriorLabelModel.WEST,
          wrapped: labelStyle
        })
      }
      return labelStyle
    } else {
      return new DefaultLabelStyle()
    }
  }

  /**
   * Returns the text used for the button configured by the button options.
   *
   * The text is only considered when {@link ButtonOptions.style} is {@link TextButton}.
   * @param options The {@link ButtonOptions} to determine the text for.
   * @param owner The model item owning the button.
   * @private
   */
  static getButtonText(options: ButtonOptions, owner: IModelItem): string {
    // Determine the style config that has to be defined either by style or styleFactory
    const styleConfig = options.style || options.styleFactory!(owner)
    if (styleConfig && styleConfig.type === 'text') {
      return styleConfig.text
    }
    return ''
  }

  /**
   * Returns the {@link ILabelModelParameter layout} used for the button configured by the button options.
   * @param options The {@link ButtonOptions} to determine the layout for.
   * @param owner The model item owning the button.
   * @private
   */
  static getButtonLayout(options: ButtonOptions, owner: IModelItem): ILabelModelParameter {
    if (options.layout) {
      return options.layout
    } else if (options.layoutFactory) {
      return options.layoutFactory(owner)
    } else {
      return GraphWizardInputMode.getBaseLayout(owner)
    }
  }

  /**
   * Returns the tooltip displayed when hovering over the button.
   * @param options The {@link ButtonOptions} to determine the tooltip for.
   * @param owner The model item owning the button.
   * @param shortcuts The shortcuts to include in the tooltip.
   * @private
   */
  static getButtonTooltip(
    options: ButtonOptions,
    owner: IModelItem,
    shortcuts?: Shortcut[]
  ): string {
    let tooltip = ''
    if (options.tooltip) {
      tooltip = options.tooltip
    } else if (options.tooltipFactory) {
      tooltip = options.tooltipFactory(owner)
    }
    return this.getTextWithShortcuts(tooltip, 'tooltip', shortcuts)
  }

  /**
   * Returns a styled html string that combines the text with a presentation of the shortcuts.
   *
   * @param text The text to start with.
   * @param classPrefix The prefix of the class names used in the html string.
   * @param shortcuts The shortcuts to add.
   */
  static getTextWithShortcuts(text: string, classPrefix: string, shortcuts?: Shortcut[]): string {
    let htmlText = '<div class="' + classPrefix + '-container">'
    if (text && text.length > 0) {
      htmlText += text
    }
    if (shortcuts && shortcuts.length > 0) {
      htmlText += '<span class="' + classPrefix + '-shortcuts">'
      htmlText += WizardAction.getShortcutsString(shortcuts)
      htmlText += '</span>'
    }
    htmlText += '</div>'
    return htmlText
  }

  /**
   * Returns a HTML string that visualizes the shortcut keys.
   * @param shortcuts The shortcuts to visualize.
   */
  static getShortcutsString(shortcuts: Shortcut[]): string {
    const startKey = '<kbd class="shortcut">'
    const endKey = '</kbd>'

    let tooltip = ''
    for (let i = 0; i < shortcuts.length; i++) {
      if (i != 0) {
        tooltip += ' / '
      }

      const shortcut = shortcuts[i]
      if (shortcut.modifier) {
        if ((shortcut.modifier & ModifierKeys.CONTROL) === ModifierKeys.CONTROL) {
          tooltip += startKey + 'Ctrl' + endKey + '+'
        }
        if ((shortcut.modifier & ModifierKeys.SHIFT) === ModifierKeys.SHIFT) {
          tooltip += startKey + 'Shift' + endKey + '+'
        }
        if ((shortcut.modifier & ModifierKeys.ALT) === ModifierKeys.ALT) {
          tooltip += startKey + 'Alt' + endKey + '+'
        }
      }
      tooltip += startKey + this.getKeyName(shortcut.key) + endKey
    }
    return tooltip
  }

  private static getKeyName(key: Key): string {
    if (key == Key.ARROW_UP) {
      return '&uarr;'
    } else if (key == Key.ARROW_DOWN) {
      return '&darr;'
    } else if (key == Key.ARROW_LEFT) {
      return '&larr;'
    } else if (key == Key.ARROW_RIGHT) {
      return '&rarr;'
    }
    return Enum.getName(Key.$class, key)
  }
}

/**
 * A single step in a series of cancelable steps handled by {@link handleMultipleSteps}.
 */
export type ActionStep = {
  /**
   * Executes the action of this step and returns whether the action was successful, the data
   * necessary to {@link undo} the action and the date used as __inData__ of the next step.
   * @param inData Data provided by the previous step that is used in the action.
   * @param wasCanceled `true`, if this action is called after canceling its succeeding action,
   * and `false`, if this action is called after its successful previous action.
   */
  action: (
    inData: any,
    wasCanceled: boolean
  ) => Promise<{ success: boolean; undoData?: any; outData?: any }>

  /**
   * Reverts the {@link action} using the `undoData` provided previously.
   * @param undoData
   */
  undo: (undoData: any) => void
}

/**
 * Handles processing multiple {@link ActionStep}s that may be canceled to go back to previous steps.
 *
 * Returns `true` if the last step was successful, `false` otherwise.
 * @param steps The steps to process.
 */
export async function handleMultipleSteps(steps: ActionStep[]): Promise<boolean> {
  let currentIndex = 0
  let wasCanceled = false

  const undoDataStore = []
  const nextStepDataStore = []

  // iterate until either the first step was canceled or the last succeeds
  while (currentIndex >= 0 && currentIndex < steps.length) {
    const currentStep = steps[currentIndex]
    if (wasCanceled) {
      currentStep.undo(undoDataStore[currentIndex])
    }
    // first step has no inputData
    const inputData: any = currentIndex > 0 ? nextStepDataStore[currentIndex - 1] : null
    const { success, undoData, outData } = await currentStep.action(inputData, wasCanceled)
    if (success) {
      undoDataStore[currentIndex] = undoData
      nextStepDataStore[currentIndex] = outData
      wasCanceled = false
      currentIndex++
    } else {
      wasCanceled = true
      currentIndex--
    }
  }
  return currentIndex > 0
}
