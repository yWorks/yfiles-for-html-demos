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
export * from './menu'

let idCounter = 0

export class DefaultMenu {
  _container = null
  _containerFactory

  get container() {
    if (this._container == null) {
      this._container = this._containerFactory()
    }
    return this._container
  }

  constructor(containerFactory) {
    this._containerFactory = containerFactory
  }

  addButton(title, callback) {
    const button = document.createElement('button')
    button.classList.add('yplay__menu--button', 'labeled')
    button.innerHTML = title
    button.addEventListener('click', () => {
      this.createRipple(button)
      callback()
    })

    this.container.append(button)
    return button
  }

  updateToggleButtonState = (label, checked) => {
    label.classList.toggle('active', checked)
    this.createRipple(label)
  }

  addToggleButton(title, callback, initialState = false) {
    const input = document.createElement('input')
    const id = `toggle-button-${idCounter++}`
    input.type = 'checkbox'
    input.classList.add('yplay__menu--toggle-button-input', 'demo-toggle-button', 'labeled')
    input.id = id
    const label = document.createElement('label')
    label.htmlFor = id
    label.classList.add('yplay__menu--button', 'yplay__menu--toggle-button', 'option-label')
    label.innerText = title
    input.checked = initialState
    this.updateToggleButtonState(label, initialState)
    input.addEventListener('click', () => {
      const checked = input.checked
      this.updateToggleButtonState(label, checked)
      callback?.(checked)
    })

    label.append(input)
    this.container.append(label)
    return input
  }

  addSelect(title, options, callback, initialValue) {
    const id = `select-${idCounter++}`
    if (title) {
      const labelElement = document.createElement('label')
      labelElement.innerText = title
      labelElement.htmlFor = id
      labelElement.classList.add('yplay__menu--select-label', 'option-label')
      this.container.append(labelElement)
    }

    const selectElement = document.createElement('select')
    selectElement.id = id
    selectElement.classList.add('option-element')
    const entries = options.map((option, index) => {
      const optionElement = document.createElement('option')
      let value
      if (typeof option === 'object' && option !== null && 'value' in option && 'label' in option) {
        value = option.value
        optionElement.innerText = option.label
      } else {
        value = option
        optionElement.innerText = String(option)
      }
      optionElement.value = String(index)
      selectElement.append(optionElement)
      if (typeof initialValue !== 'undefined' && initialValue === value) {
        optionElement.selected = true
        selectElement.value = optionElement.value
      }
      return { optionElement, value }
    })

    selectElement.addEventListener('change', () => {
      const entry = entries.find(({ optionElement }) => optionElement.value === selectElement.value)
      if (entry) {
        callback(entry.value)
      }
    })
    selectElement.classList.add('yplay__menu--select')
    this.container.append(selectElement)
    return selectElement
  }

  addSlider(title, min, max, callback, initialValue, step, showValue = true) {
    const id = `slider-${idCounter++}`

    if (typeof title === 'object') {
      const options = title
      title = options.title ?? ''
      min = options.min ?? 0
      max = options.max ?? 100
      callback = options.callback
      initialValue = options.initialValue ?? 0
      step = options.step ?? 1
    }

    if (title) {
      const labelElement = document.createElement('label')
      labelElement.innerText = title
      labelElement.htmlFor = id
      labelElement.classList.add('yplay__menu--select-label', 'option-label')
      this.container.append(labelElement)
    }

    const sliderContainer = document.createElement('div')
    sliderContainer.classList.add('yplay__menu--slider-container', 'option-element')
    this.container.append(sliderContainer)

    const slider = document.createElement('input')
    slider.id = id
    slider.type = 'range'
    slider.min = String(min ?? 0)
    slider.max = String(max ?? 100)
    slider.step = String(step ?? 1)
    slider.value = String(initialValue ?? 0)
    slider.addEventListener('input', () => {
      callback?.(slider.valueAsNumber)
    })
    slider.classList.add('yplay__menu--slider', 'option-element')
    sliderContainer.append(slider)

    if (showValue) {
      const valueLabel = document.createElement('span')
      valueLabel.classList.add('yplay__menu--slider-value')
      valueLabel.textContent = String(initialValue ?? 0)

      slider.addEventListener('input', () => {
        valueLabel.textContent = String(slider.value)
      })
      sliderContainer.append(valueLabel)
    }

    return slider
  }

  createRipple(el) {
    const rect = el.getBoundingClientRect()
    const diameter = Math.max(rect.width, rect.height)
    const radius = diameter / 2
    const position = [rect.left + rect.width / 2, rect.top + rect.height / 2]

    const wrapper = document.createElement('div')
    wrapper.classList.add('yplay__ripple')

    const circle = document.createElement('span')
    circle.style.width = circle.style.height = `${diameter}px`
    circle.style.left = `${position[0] - rect.left - radius}px`
    circle.style.top = `${position[1] - rect.top - radius}px`
    circle.classList.add('yplay__ripple-effect')

    el.querySelector('.yplay__ripple')?.remove()

    wrapper.appendChild(circle)
    el.appendChild(wrapper)
  }
}
