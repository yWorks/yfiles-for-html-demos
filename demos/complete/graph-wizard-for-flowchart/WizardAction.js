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
import { GraphWizardInputMode } from './GraphWizardInputMode.js'
/**
 * A condition that has to be met so that a {@link WizardAction} is active.
 * @typedef {function} PreCondition
 */

/**
 * A callback to decide, whether an event triggers an active {@link WizardAction}.
 * @typedef {function} Trigger
 */

/**
 * A combination of {@link Key} and {@link ModifierKeys} that describe a keyboard shortcut.
 * @typedef {Object} Shortcut
 * @property {Key} key
 * @property {ModifierKeys} [modifier]
 */

/**
 * A callback that is called to handle a {@link WizardAction} that has been {@link Trigger triggered}.
 *
 * Returns whether the handling is considered to be successful.
 * @typedef {function} Handler
 */

/**
 * The configuration for an icon style for a {@link Button}.
 * @typedef {Object} IconButton
 * @property {'icon'} type
 * @property {string} iconPath
 * @property {string} [backgroundFill]
 */

/**
 * The configuration for a rectangular style for a {@link Button}.
 * @typedef {Object} RectButton
 * @property {'rect'} type
 * @property {string} [outline]
 * @property {string} [fill]
 */

/**
 * The configuration for a text label style for a {@link Button} that may optionally have an icon.
 * @typedef {Object} TextButton
 * @property {'text'} type
 * @property {string} text
 * @property {string} [iconPath]
 * @property {string} [backgroundFill]
 */

/**
 * The layout style buttons shall be arranged in.
 */
export /**
 * @readonly
 * @enum {number}
 */
const PickerLayout = {
  Grid: 0,
  Row: 1,
  Column: 2
}

/**
 * The configuration options for a {@link Button} used for a {@link WizardAction}.
 * @typedef {Object} ButtonOptions
 * @property {Size} [size]
 * @property {ILabelModelParameter} [layout]
 * @property {function} [layoutFactory]
 * @property {string} [type]
 * @property {function} [typeFactory]
 * @property {string} [tooltip]
 * @property {function} [tooltipFactory]
 * @property {(IconButton|RectButton|TextButton)} [style]
 * @property {function} [styleFactory]
 * @property {Array.<ButtonOptions>} [pickerButtons]
 * @property {PickerLayout} [pickerLayout]
 */

/**
 * An action managed by the {@link GraphWizardInputMode}.
 */
export default class WizardAction {
  /**
   * The type of the action that is passed to the {@link WizardAction.handler}.
   * @type {!string}
   */
  get type() {
    return this._type
  }

  /**
   * Creates a new {@link WizardAction}.
   * @param {!string} type The type of the action that is passed to the {@link WizardAction.handler}.
   * @param {!PreCondition} preCondition The pre-condition that has to be met so that the action is active.
   * @param {!Handler} handler The callback executing the action once it is triggered.
   * @param shortcuts The keyboard shortcuts to trigger this action.
   * @param description The description added to the legend when this action is active.
   * @param buttonOptions The configuration options for a button that is displayed when this action is active.
   * @param trigger A callback to decide whether an event should trigger this action in addition
   * to the short-cuts and the button.
   * @param noUndo Whether the action should not be enqueued in the undo stack.
   * @param {?Array.<Shortcut>} [shortcuts]
   * @param {!string} [description]
   * @param {?ButtonOptions} [buttonOptions]
   * @param {?Trigger} [trigger]
   * @param {boolean} [noUndo]
   */
  constructor(type, preCondition, handler, shortcuts, description, buttonOptions, trigger, noUndo) {
    this.button = null
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
   * @type {!PreCondition}
   */
  get preCondition() {
    return this._preCondition
  }

  /**
   * The callback to decide whether an event should trigger this action.
   * @type {!Trigger}
   */
  get trigger() {
    return this._trigger
  }

  /**
   * The keyboard shortcuts that trigger this action.
   * @type {!Array.<Shortcut>}
   */
  get shortcuts() {
    return this._shortcuts
  }

  /**
   * The callback executing the action once it is triggered.
   * @type {!Handler}
   */
  get handler() {
    return this._handler
  }

  /**
   * The description added to the legend when this action is active.
   * @type {!string}
   */
  get description() {
    return this._description
  }

  /**
   * The configuration options for a button that is displayed when this action is active.
   * @type {?ButtonOptions}
   */
  get buttonOptions() {
    return this._buttonOptions
  }

  /**
   * Whether the action should not be enqueued in the undo stack.
   * @type {boolean}
   */
  get noUndo() {
    return this._noUndo
  }

  /**
   * Returns the default action used for all picker buttons as well as for the main button if no
   * picker buttons are used is to handle this action.
   * @param {!GraphWizardInputMode} mode The {@link GraphWizardInputMode} handling this action.
   * @returns {!ButtonActionListener}
   */
  getDefaultAction(mode) {
    return button => {
      mode.handleAction(
        this,
        button.owner,
        button.tag,
        mode.inputModeContext.canvasComponent.lastInputEvent
      )
    }
  }

  /**
   * Clears the action state when the action gets deactivated.
   */
  clear() {}

  /**
   * Returns the type of the action triggered by the button configured by the button options.
   * @param {!ButtonOptions} options The {@link ButtonOptions} to determine the type for.
   * @param {!IModelItem} owner The model item owning the button.
   * @returns {!string}
   */
  static getButtonType(options, owner) {
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
   * @param {!ButtonOptions} options The {@link ButtonOptions} to determine the style for.
   * @param {!IModelItem} owner The model item owning the button.
   * @param {!Size} buttonSize The size of the button.
   * @returns {!ILabelStyle}
   */
  static getButtonStyle(options, owner, buttonSize) {
    // Determine the style config that has to be defined either by style or styleFactory
    const styleConfig = options.style || options.styleFactory(owner)
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
   * @param {!ButtonOptions} options The {@link ButtonOptions} to determine the text for.
   * @param {!IModelItem} owner The model item owning the button.
   * @returns {!string}
   */
  static getButtonText(options, owner) {
    // Determine the style config that has to be defined either by style or styleFactory
    const styleConfig = options.style || options.styleFactory(owner)
    if (styleConfig && styleConfig.type === 'text') {
      return styleConfig.text
    }
    return ''
  }

  /**
   * Returns the {@link ILabelModelParameter layout} used for the button configured by the button options.
   * @param {!ButtonOptions} options The {@link ButtonOptions} to determine the layout for.
   * @param {!IModelItem} owner The model item owning the button.
   * @returns {!ILabelModelParameter}
   */
  static getButtonLayout(options, owner) {
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
   * @param {!ButtonOptions} options The {@link ButtonOptions} to determine the tooltip for.
   * @param {!IModelItem} owner The model item owning the button.
   * @param shortcuts The shortcuts to include in the tooltip.
   * @param {!Array.<Shortcut>} [shortcuts]
   * @returns {!string}
   */
  static getButtonTooltip(options, owner, shortcuts) {
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
   * @param {!string} text The text to start with.
   * @param {!string} classPrefix The prefix of the class names used in the html string.
   * @param shortcuts The shortcuts to add.
   * @param {!Array.<Shortcut>} [shortcuts]
   * @returns {!string}
   */
  static getTextWithShortcuts(text, classPrefix, shortcuts) {
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
   * @param {!Array.<Shortcut>} shortcuts The shortcuts to visualize.
   * @returns {!string}
   */
  static getShortcutsString(shortcuts) {
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

  /**
   * @param {!Key} key
   * @returns {!string}
   */
  static getKeyName(key) {
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
 * @typedef {Object} ActionStep
 * @property {function} action
 * @property {function} undo
 */

/**
 * Handles processing multiple {@link ActionStep}s that may be canceled to go back to previous steps.
 *
 * Returns `true` if the last step was successful, `false` otherwise.
 * @param {!Array.<ActionStep>} steps The steps to process.
 * @returns {!Promise.<boolean>}
 */
export async function handleMultipleSteps(steps) {
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
    const inputData = currentIndex > 0 ? nextStepDataStore[currentIndex - 1] : null
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
