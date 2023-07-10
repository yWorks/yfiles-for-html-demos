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
import { BrowserDetection } from './BrowserDetection.js'

/**
 * @typedef {Object} OptionData
 * @property {string} value
 * @property {string} text
 */

/**
 * Adds options to an HTMLSelectElement
 * @param {!HTMLSelectElement} selectElement the HTMLSelectElement
 * @param values the option values
 * @param {!Array.<(string|OptionData)>} undefined
 */
export function addOptions(selectElement, ...values) {
  for (const value of values) {
    const option = document.createElement('option')
    if (typeof value === 'string') {
      option.value = value
      option.text = value
    } else {
      option.value = value.value
      option.text = value.text
    }
    selectElement.add(option)
  }
  selectElement.dispatchEvent(new Event('change'))
}

/**
 * Adds navigation buttons to an HTMLSelectElement.
 * @param {!HTMLSelectElement} selectElement The HTMLSelectElement.
 * @param wrapAround Whether to wrap around when navigating beyond the end or beginning of the select.
 * @param wrapInDiv Whether to wrap the select and the navigation buttons into a new div element.
 * @param classes Additional classes for the navigation buttons.
 * @returns The given element for chaining other function calls.
 * @param {boolean} [wrapAround=true]
 * @param {boolean} [wrapInDiv=true]
 * @param {!Array.<string>} undefined
 */
export function addNavigationButtons(
  selectElement,
  wrapAround = true,
  wrapInDiv = true,
  ...classes
) {
  if (selectElement.parentElement == null) {
    throw new Error('The element must have a parent')
  }

  const prevButton = document.createElement('button')
  prevButton.classList.add('demo-icon-yIconPrevious', 'navigation-button', ...classes)
  prevButton.setAttribute('title', 'Previous')
  prevButton.addEventListener('click', _ => {
    const oldIndex = selectElement.selectedIndex
    const newIndex = lastIndexOfEnabled(selectElement, oldIndex - 1, wrapAround)
    if (oldIndex != newIndex && newIndex > -1) {
      selectElement.selectedIndex = newIndex
      selectElement.dispatchEvent(new Event('change'))
    }
  })

  const nextButton = document.createElement('button')
  nextButton.classList.add('demo-icon-yIconNext', 'navigation-button', ...classes)
  nextButton.setAttribute('title', 'Next')
  nextButton.addEventListener('click', _ => {
    const oldIndex = selectElement.selectedIndex
    const newIndex = indexOfEnabled(selectElement, oldIndex + 1, wrapAround)
    if (oldIndex != newIndex && newIndex > -1) {
      selectElement.selectedIndex = newIndex
      selectElement.dispatchEvent(new Event('change'))
    }
  })

  if (wrapInDiv) {
    const wrapper = document.createElement('div')
    wrapper.className = 'navigate-select'
    selectElement.parentElement.insertBefore(wrapper, selectElement)

    wrapper.append(prevButton, selectElement, nextButton)
  } else {
    selectElement.parentElement.insertBefore(prevButton, selectElement)
    if (selectElement.nextElementSibling != null) {
      selectElement.parentElement.insertBefore(nextButton, selectElement.nextElementSibling)
    } else {
      selectElement.parentElement.appendChild(nextButton)
    }
  }

  const updateDisabled = () => {
    const lastIndex = selectElement.options.length - 1
    prevButton.disabled =
      selectElement.disabled || (!wrapAround && selectElement.selectedIndex === 0)
    nextButton.disabled =
      selectElement.disabled || (!wrapAround && selectElement.selectedIndex === lastIndex)
  }

  selectElement.addEventListener('change', _ => {
    updateDisabled()
  })

  const disabledObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'disabled') {
        updateDisabled()
        return
      }
    }
  })
  disabledObserver.observe(selectElement, { attributes: true })
  return selectElement
}

/**
 * Finds the index of the first enabled option in the given HTMLSelectElement.
 * @param {!HTMLSelectElement} selectElement the HTMLSelectElement whose options are searched for an enabled one.
 * @param {number} fromIndex the starting index from which to search.
 * @param {boolean} wrapAround determines if the search should find first enabled option with an index less
 * than fromIndex if there is no enabled option with an index greater than fromIndex.
 * @returns {number}
 */
function indexOfEnabled(selectElement, fromIndex, wrapAround) {
  const n = selectElement.options.length
  for (let idx = fromIndex; idx < n; ++idx) {
    if (!selectElement.options[idx].disabled) {
      return idx
    }
  }
  if (wrapAround) {
    for (let idx = 0; idx < fromIndex; ++idx) {
      if (!selectElement.options[idx].disabled) {
        return idx
      }
    }
  }
  return -1
}

/**
 * Finds the index of the last enabled option in the given HTMLSelectElement.
 * @param {!HTMLSelectElement} selectElement the HTMLSelectElement whose options are searched for an enabled one.
 * @param {number} fromIndex the starting index from which to search.
 * @param {boolean} wrapAround determines if the search should find last enabled option with an index greater
 *   than fromIndex if there is no enabled option with an index less than fromIndex.
 * @returns {number}
 */
function lastIndexOfEnabled(selectElement, fromIndex, wrapAround) {
  for (let idx = fromIndex; idx > -1; --idx) {
    if (!selectElement.options[idx].disabled) {
      return idx
    }
  }
  if (wrapAround) {
    for (let idx = selectElement.options.length - 1; idx > fromIndex; --idx) {
      if (!selectElement.options[idx].disabled) {
        return idx
      }
    }
  }
  return -1
}

/**
 * Checks whether the browser supports WebGL2 and shows a warning message if this is not supported.
 * @returns {boolean}
 */
export function checkWebGL2Support() {
  if (!BrowserDetection.webGL2) {
    const message =
      'Your browser or device does not support WebGL2.<br />\n' +
      'This demo only works if WebGL2 is available.<br />\n' +
      'Please use a modern browser like Chrome, Edge, Firefox, or Opera.<br />\n' +
      'In older versions of Safari and older Apple devices, WebGL2 is an experimental feature\n' +
      'that needs to be activated explicitly.'
    createWebGLSupportWarningMessage(message)
    return false
  }
  return true
}

/**
 * Checks whether the browser supports WebGL and shows a warning message if this is not supported.
 * @returns {boolean}
 */
export function checkWebGLSupport() {
  if (!BrowserDetection.webGL) {
    const message =
      'Your browser or device does not support WebGL.<br /> \n' +
      'This demo only works if WebGL is available.'
    createWebGLSupportWarningMessage(message)
    return false
  }
  return true
}

/**
 * Creates a div to display the no-webgl-support warnings.
 * @param {!string} innerHTML the text to be displayed
 */
function createWebGLSupportWarningMessage(innerHTML) {
  const graphComponentDiv = document.querySelector('#graphComponent')
  if (graphComponentDiv && graphComponentDiv.parentElement) {
    const parent = graphComponentDiv.parentElement
    // show message if the browsers does not support WebGL2
    const webglDiv = document.createElement('div')
    webglDiv.setAttribute('style', 'display:block')
    webglDiv.id = 'no-webgl-support'
    webglDiv.innerHTML = innerHTML
    parent.appendChild(webglDiv)
  }
}

/**
 * Binds the given command to the element specified by the given selector.
 *
 * In more detail, register a click listener that executes the command and an event listener that
 * syncs the disabled state of the command to the button.
 * @param {!string} selector
 * @param {!ICommand} command
 * @param {*} target
 * @param {*} parameter
 * @param {!string} tooltip
 */
export function bindYFilesCommand(selector, command, target, parameter, tooltip) {
  const element = document.querySelector(selector)
  // Check whether an event listener is already registered
  if (!element || element.getAttribute('data-command-registered')) {
    return
  }

  // Add a click listener that executes the command
  element.addEventListener('click', () => {
    if (command.canExecute(parameter, target)) {
      command.execute(parameter, target)
    }
  })

  // Add an event listener that syncs the disabled state of the command to the element
  command.addCanExecuteChangedListener((command, _evt) => {
    if (command.canExecute(parameter, target)) {
      element.removeAttribute('disabled')
    } else {
      element.setAttribute('disabled', 'disabled')
    }
  })

  // Mark the element as having an event listener, and add a tooltip
  element.setAttribute('data-command-registered', '')
  element.setAttribute('title', tooltip)
}

/**
 * Disabled all UI elements matching the given selector.
 * Ignores already disabled elements.
 * @param {!Array.<string>} undefined
 */
export function disableUIElements(...elementSelectors) {
  for (const selector of elementSelectors) {
    document.querySelectorAll(selector).forEach(element => {
      if (!element || element.hasAttribute('disabled')) return

      element.setAttribute('disabled', '')
      element.dataset.disabled = ''
    })
  }
}

/**
 * Re-enables all elements which were previously disabled by {@see disableUIElements}.
 */
export function enableUIElements() {
  document.querySelectorAll('[data-disabled]').forEach(e => {
    e.removeAttribute('disabled')
  })
}

/**
 * Displays or hides the loading indicator which is a div element with id 'loadingIndicator'.
 * @param {boolean} visible Whether to show or hide the loading indicator.
 * @param message A text on the loading indicator.
 * @param {!string} [message]
 * @returns {!Promise}
 */
export async function showLoadingIndicator(visible, message) {
  const loadingIndicator = document.querySelector('#loading-indicator')
  loadingIndicator.style.display = visible ? 'block' : 'none'
  if (message) {
    loadingIndicator.innerText = message
  }
  return new Promise(resolve => setTimeout(resolve, 0))
}
