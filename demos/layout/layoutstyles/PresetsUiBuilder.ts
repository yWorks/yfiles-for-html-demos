/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
import { addClass, hasClass, removeClass } from '../../resources/demo-app'
import { OptionEditor } from '../../resources/demo-option-editor'
import { Tooltip } from './Tooltip'
import type { Preset } from './resources/LayoutSamples'

const CSS_CLASS_BUTTON_GRID = 'option-presets-button-grid'
const CSS_CLASS_PRESET = 'option-presets-button'
const CSS_CLASS_INVALID_PRESET = 'invalid-preset'
const INVALID_PRESET_MESSAGE = '<p><b>Preset has no effect for this sample!</b></p>'
export const CSS_CLASS_PRESET_APPLIED = 'active-preset'
const CSS_CLASS_EDITOR_PRESET = 'editor-preset'

export class PresetsUiBuilder {
  private readonly grid: HTMLDivElement
  private readonly optionEditor: OptionEditor
  private readonly presetDefs: Record<string, Preset>
  private readonly onPresetApplied: (presetId: string) => void
  private tooltip: Tooltip = new Tooltip()
  private tooltipTimer: any

  constructor(options: {
    rootElement: HTMLDivElement
    optionEditor: OptionEditor
    presetDefs: Record<string, Preset>
    onPresetApplied: (presetId: string) => void
  }) {
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

  clearAppliedState(): void {
    removeClass(document.getElementById('data-editor')!, CSS_CLASS_EDITOR_PRESET)
    this.optionEditor.setPresetName(null)
    for (const child of getButtons(this.grid)) {
      removeClass(child, CSS_CLASS_PRESET_APPLIED)
      addClass(child, CSS_CLASS_PRESET)
    }
  }

  setPresetButtonDisabled(disabled: boolean): void {
    clearTimeout(this.tooltipTimer)
    for (const child of getButtons(this.grid)) {
      child.disabled = disabled
    }
  }

  buildUi(
    samplePresets: { presets: string[]; invalidPresets: string[] },
    appliedPresetId: string
  ): void {
    const grid = this.grid
    const optionEditor = this.optionEditor
    const presetDefs = this.presetDefs

    const invalidPresets = samplePresets.invalidPresets

    clearGrid(grid)

    let appliedPreset:
      | {
          handler: (htmlElement: HTMLElement) => void
          htmlElement: HTMLElement
        }
      | undefined

    let idx = 0
    for (const presetId of samplePresets.presets) {
      const preset = presetDefs[presetId]
      if (preset) {
        ++idx

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

  createPresetButton(
    preset: Preset,
    presetId: string,
    handler: (htmlElement: HTMLElement) => void,
    invalidPresets: string[]
  ): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.innerText = preset.label
    btn.addEventListener('click', e => {
      if (hasClass(btn, CSS_CLASS_INVALID_PRESET)) {
        //ignore click because preset is invalid for current sample
        return
      }
      handler(e.target as HTMLElement)
      this.optionEditor.setPresetName(preset.label)
      this.onPresetApplied(presetId)
      clearTimeout(this.tooltipTimer)
      this.tooltip.hide()
    })
    addClass(btn, CSS_CLASS_PRESET)

    if (invalidPresets.indexOf(presetId) !== -1) {
      //preset is invalid for this sample -> add respective class
      addClass(btn, CSS_CLASS_INVALID_PRESET)
    }

    if (preset.description) {
      btn.onmouseenter = e => {
        const invalid = hasClass(btn, CSS_CLASS_INVALID_PRESET)
        // open tooltip with delay
        this.tooltipTimer = setTimeout(() => {
          this.tooltip.show(
            e.target as HTMLElement,
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

  resetInvalidState(): void {
    //make all presets active (for the modified graph sample!)
    for (const child of getButtons(this.grid)) {
      removeClass(child, CSS_CLASS_INVALID_PRESET)
    }
  }
}

function newGrid(rootElement: HTMLDivElement): HTMLDivElement {
  const div = document.createElement('div')
  div.setAttribute('class', CSS_CLASS_BUTTON_GRID)
  rootElement.appendChild(div)
  return div
}

function clearGrid(htmlElement: HTMLElement): void {
  if (htmlElement.childElementCount > 0) {
    while (htmlElement.firstChild) {
      htmlElement.removeChild(htmlElement.lastChild!)
    }
  }
}

function newButtonHandler(optionEditor: OptionEditor, preset: Preset) {
  const config = optionEditor.config

  const setters: (() => void)[] = []
  const settings = preset.settings
  for (const setting in settings) {
    if (Object.prototype.hasOwnProperty.call(settings, setting)) {
      setters.push(() => {
        config[setting] = settings[setting]
        optionEditor.expand(setting)
      })
    }
  }

  return (htmlElement: HTMLElement) => {
    updateCss(htmlElement, CSS_CLASS_PRESET_APPLIED)
    applyValues(optionEditor, setters)
  }
}

function updateCss(htmlElement: HTMLElement, cssApplied: string): void {
  addClass(document.getElementById('data-editor')!, CSS_CLASS_EDITOR_PRESET)
  for (const child of getButtons(htmlElement.parentElement!)) {
    removeClass(child, cssApplied)
    if (child === htmlElement) {
      addClass(child, cssApplied)
    }
  }
}

function getButtons(htmlElement: HTMLElement): Iterable<HTMLButtonElement> {
  return htmlElement.querySelectorAll(`.${CSS_CLASS_PRESET}`)
}

function applyValues(optionEditor: OptionEditor, setters: (() => void)[]): void {
  optionEditor.reset()

  for (const setter of setters) {
    setter()
  }

  optionEditor.refresh()
}
