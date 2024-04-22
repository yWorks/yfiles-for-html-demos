/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Tooltip } from './Tooltip.js'

const CSS_CLASS_BUTTON_GRID = 'option-presets-button-grid'
const CSS_CLASS_PRESET = 'option-presets-button'
const CSS_CLASS_INVALID_PRESET = 'invalid-preset'
const INVALID_PRESET_MESSAGE = '<p><b>Preset has no effect for this sample!</b></p>'
export const CSS_CLASS_PRESET_APPLIED = 'active-preset'
const CSS_CLASS_EDITOR_PRESET = 'editor-preset'

export class PresetsUiBuilder {
  grid
  optionEditor
  presetDefs
  onPresetApplied
  tooltip = new Tooltip()
  tooltipTimer

  /**
   * @param {!object} options
   */
  constructor(options) {
    this.grid = newGrid(options.rootElement)
    this.optionEditor = options.optionEditor
    this.presetDefs = options.presetDefs
    this.onPresetApplied = options.onPresetApplied

    if (options.optionEditor) {
      options.optionEditor.addChangeListener(() => {
        this.clearAppliedState()
      })
    }
  }

  clearAppliedState() {
    document.getElementById('data-editor').classList.remove(CSS_CLASS_EDITOR_PRESET)
    this.optionEditor.setPresetName(null)
    for (const child of getButtons(this.grid)) {
      child.classList.remove(CSS_CLASS_PRESET_APPLIED)
      child.classList.add(CSS_CLASS_PRESET)
    }
  }

  /**
   * @param {boolean} disabled
   */
  setPresetButtonDisabled(disabled) {
    clearTimeout(this.tooltipTimer)
    for (const child of getButtons(this.grid)) {
      child.disabled = disabled
    }
  }

  /**
   * @param {!object} samplePresets
   * @param {!string} appliedPresetId
   */
  buildUi(samplePresets, appliedPresetId) {
    const grid = this.grid
    const optionEditor = this.optionEditor
    const presetDefs = this.presetDefs

    const invalidPresets = samplePresets.invalidPresets

    clearGrid(grid)

    let appliedPreset

    for (const presetId of samplePresets.presets) {
      const preset = presetDefs[presetId]
      if (preset) {
        const handler = newButtonHandler(optionEditor, preset)
        const btn = this.createPresetButton(preset, presetId, handler, invalidPresets)
        grid.appendChild(btn)

        if (presetId === appliedPresetId) {
          optionEditor.setPresetName(preset.label)
          appliedPreset = { handler, htmlElement: btn }
        }
      }
    }

    if (appliedPreset) {
      appliedPreset.handler(appliedPreset.htmlElement)
    }
  }

  /**
   * @param {!Preset} preset
   * @param {!string} presetId
   * @param {!function} handler
   * @param {!Array.<string>} invalidPresets
   * @returns {!HTMLButtonElement}
   */
  createPresetButton(preset, presetId, handler, invalidPresets) {
    const btn = document.createElement('button')
    btn.innerText = preset.label
    btn.addEventListener('click', (e) => {
      if (btn.classList.contains(CSS_CLASS_INVALID_PRESET)) {
        //ignore click because preset is invalid for current sample
        return
      }
      handler(e.target)
      this.optionEditor.setPresetName(preset.label)
      this.onPresetApplied(presetId)
      clearTimeout(this.tooltipTimer)
      this.tooltip.hide()
    })
    btn.classList.add(CSS_CLASS_PRESET)

    if (invalidPresets.indexOf(presetId) !== -1) {
      //preset is invalid for this sample -> add respective class
      btn.classList.add(CSS_CLASS_INVALID_PRESET)
    }

    if (preset.description) {
      btn.onmouseenter = (e) => {
        const invalid = btn.classList.contains(CSS_CLASS_INVALID_PRESET)
        // open tooltip with delay
        this.tooltipTimer = setTimeout(() => {
          this.tooltip.show(
            e.target,
            `${invalid ? INVALID_PRESET_MESSAGE : ''}${preset.description}`
          )
        }, 300)
      }
      btn.onmouseleave = () => {
        clearTimeout(this.tooltipTimer)
        this.tooltip.hide()
      }
    }
    return btn
  }

  resetInvalidState() {
    //make all presets active (for the modified graph sample!)
    for (const child of getButtons(this.grid)) {
      child.classList.remove(CSS_CLASS_INVALID_PRESET)
    }
  }
}

/**
 * @param {!HTMLDivElement} rootElement
 * @returns {!HTMLDivElement}
 */
function newGrid(rootElement) {
  const div = document.createElement('div')
  div.setAttribute('class', CSS_CLASS_BUTTON_GRID)
  rootElement.appendChild(div)
  return div
}

/**
 * @param {!HTMLElement} htmlElement
 */
function clearGrid(htmlElement) {
  while (htmlElement.lastChild) {
    htmlElement.removeChild(htmlElement.lastChild)
  }
}

/**
 * @param {!OptionEditor} optionEditor
 * @param {!Preset} preset
 */
function newButtonHandler(optionEditor, preset) {
  const config = optionEditor.config

  const setters = []
  const settings = preset.settings
  for (const setting in settings) {
    if (Object.prototype.hasOwnProperty.call(settings, setting)) {
      setters.push(() => {
        config[setting] = settings[setting]
        optionEditor.expand(setting)
      })
    }
  }

  return (htmlElement) => {
    updateCss(htmlElement, CSS_CLASS_PRESET_APPLIED)
    applyValues(optionEditor, setters)
  }
}

/**
 * @param {!HTMLElement} htmlElement
 * @param {!string} cssApplied
 */
function updateCss(htmlElement, cssApplied) {
  document.getElementById('data-editor').classList.add(CSS_CLASS_EDITOR_PRESET)
  for (const child of getButtons(htmlElement.parentElement)) {
    child.classList.remove(cssApplied)
    if (child === htmlElement) {
      child.classList.add(cssApplied)
    }
  }
}

/**
 * @param {!HTMLElement} htmlElement
 * @returns {!Iterable.<HTMLButtonElement>}
 */
function getButtons(htmlElement) {
  return htmlElement.querySelectorAll(`.${CSS_CLASS_PRESET}`)
}

/**
 * @param {!OptionEditor} optionEditor
 * @param {!Array.<function>} setters
 */
function applyValues(optionEditor, setters) {
  optionEditor.reset()

  for (const setter of setters) {
    setter()
  }

  optionEditor.refresh()
}
