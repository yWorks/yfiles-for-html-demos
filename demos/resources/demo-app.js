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
import { registerErrorDialog, reportDemoError as reportDemoErrorLocal } from './demo-error.js'
import { enableWorkarounds } from '../utils/Workarounds.js'
import {
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  GraphOverviewComponent,
  MouseWheelBehaviors,
  MoveViewportInputMode,
  ScrollBarVisibility,
  Size,
  TouchEventRecognizers
} from 'yfiles'
import { BrowserDetection } from '../utils/BrowserDetection.js'

/**
 * @typedef {Object} OptionData
 * @property {string} value
 * @property {string} text
 */
export const reportDemoError = reportDemoErrorLocal

// match CSS media query
const SIDEBAR_WIDTH = 320
const SMALL_WIDTH = SIDEBAR_WIDTH * 3

/**
 * Initializes polyfills that are used by some demos.
 *
 * Note that these polyfills are not required for the yFiles for HTML library itself. See the
 * following section in the developer's guide for more advice on using yFiles in older browsers:
 * https://docs.yworks.com/yfileshtml/#/dguide/deployment_es5
 *
 * Called in an IIFE when this file is loaded.
 */
function initializePolyfills() {
  // Polyfill requestAnimationFrame and cancelAnimationFrame if necessary.
  window.requestAnimationFrame =
    window.requestAnimationFrame ||
    (f =>
      window.setTimeout(() => {
        f(Date.now())
      }, 16))

  window.cancelAnimationFrame = window.cancelAnimationFrame || (id => window.clearTimeout(id))
}

/**
 * Creates some HTML elements of the demo UI.
 *
 * Called in an IIFE when this file is loaded.
 */
function initializeDemoUI() {
  const body = document.body

  const demoContentElement = document.querySelector('.demo-content')

  if (document.querySelector('.demo-left')) {
    addClass(body, 'demo-has-left')
  }
  if (document.querySelector('.demo-right')) {
    addClass(body, 'demo-has-right')
  }

  // Add header

  const header = document.querySelector('.demo-header') || createHeaderElement()

  const logoLink = document.createElement('a')
  logoLink.setAttribute('href', 'https://www.yworks.com/products/yfiles')

  const logoImage = document.createElement('img')
  logoImage.setAttribute('src', '../../resources/icons/ylogo.svg')
  logoImage.setAttribute('class', 'demo-y-logo')

  logoLink.appendChild(logoImage)
  header.appendChild(logoLink)

  const yFilesHTMLLink = document.createElement('a')
  yFilesHTMLLink.setAttribute('href', 'https://www.yworks.com/products/yfiles')
  yFilesHTMLLink.setAttribute('class', 'demo-yfiles-link')
  yFilesHTMLLink.textContent = 'yFiles for HTML'
  header.appendChild(yFilesHTMLLink)

  const demoOverviewLink = document.createElement('a')
  demoOverviewLink.setAttribute('class', 'demo-title')
  demoOverviewLink.setAttribute('style', 'cursor: pointer;')
  demoOverviewLink.setAttribute('href', '../../README.html')
  demoOverviewLink.textContent = 'Demos'
  header.appendChild(demoOverviewLink)

  const mobileLink = document.createElement('a')
  mobileLink.setAttribute('class', 'demo-back-button')
  mobileLink.setAttribute('style', 'cursor: pointer;')
  mobileLink.setAttribute('href', '../../README.html')
  mobileLink.textContent = 'yFiles Demos'
  header.appendChild(mobileLink)

  const isTutorial = window.location.pathname.indexOf('-tutorial-') >= 0
  // For tutorials, place tutorial overview link and tutorial step name in a common element.
  // Otherwise, the tutorial step name will be hidden on small screens
  if (isTutorial) {
    // Create a link to the tutorial overview page
    const tutorialOverviewLink = document.createElement('a')
    const tutorialCategory = window.location.pathname.replace(/.*?\/0\d-(tutorial[^/]+).*/i, '$1')
    tutorialOverviewLink.setAttribute('class', 'demo-title')
    tutorialOverviewLink.setAttribute('style', 'cursor: pointer;')
    tutorialOverviewLink.setAttribute('href', `../../README.html#${tutorialCategory}`)
    tutorialOverviewLink.textContent = getTutorialName()
    header.appendChild(tutorialOverviewLink)
  }

  const demoNameElement = document.createElement('span')
  demoNameElement.setAttribute('class', 'demo-title')
  demoNameElement.textContent = getDemoName(isTutorial)
  header.appendChild(demoNameElement)

  let headerRight = document.querySelector('.demo-header-right')
  if (!headerRight) {
    headerRight = document.createElement('div')
    headerRight.className = 'demo-header-right'
  }
  header.appendChild(headerRight)

  const showSourceButton = document.createElement('div')
  showSourceButton.setAttribute('class', 'demo-show-source-button')
  headerRight.appendChild(showSourceButton)

  const showSourceContent = document.createElement('div')
  showSourceContent.setAttribute('class', 'demo-show-source-content hidden')
  const demoPath = location.toString().replace(/.*\/demos\/([^/]+)\/([^/]+).*/i, '$1/$2')
  showSourceContent.innerHTML = `The source code for this demo is available in your yFiles&nbsp;for&nbsp;HTML package in the following folder:<br><div class="demo-source-path">/demos-js/${demoPath}</div>`
  showSourceButton.appendChild(showSourceContent)

  showSourceButton.addEventListener('click', () => toggleClass(showSourceContent, 'hidden'))

  if (header.parentElement == null) {
    if (demoContentElement == null) {
      body.insertBefore(header, body.firstChild)
    } else {
      demoContentElement.insertBefore(header, demoContentElement.firstChild)
    }
  }

  // Add sidebar toggle buttons
  const sidebars = document.querySelectorAll('.demo-sidebar')
  for (let i = 0; i < sidebars.length; ++i) {
    const sidebar = sidebars.item(i)
    const button = document.createElement('button')
    ;(() => {
      const isLeft = hasClass(sidebar, 'demo-left')
      button.setAttribute('class', `demo-${isLeft ? 'left' : 'right'}-sidebar-toggle-button`)
      button.setAttribute('title', isLeft ? `Toggle description` : `Toggle right sidebar`)
      button.addEventListener('click', () => {
        toggleClass(body, isLeft ? 'demo-left-hidden' : 'demo-right-hidden')
      })
    })()
    body.appendChild(button)
  }

  const sidebar = document.querySelector('.demo-left')

  const playButton = document.createElement('a')
  playButton.className = 'action-run'
  playButton.innerHTML = 'start here' // getDemoName(window.location.pathname.indexOf('-tutorial-') >= 0)

  const playBadge = document.createElement('div')
  playBadge.appendChild(playButton)
  playBadge.className = 'demo-play'
  playBadge.addEventListener('click', () => {
    toggleClass(body, 'demo-left-hidden')
  })
  sidebar.appendChild(playBadge)

  registerErrorDialog()

  // collapse right sidebar on small window screens
  if (document.querySelector('.demo-right')) {
    hideRightResponsive(body)
    window.addEventListener('resize', () => {
      hideRightResponsive(body)
    })
  }

  // responsive toolbar
  const toolbars = document.querySelectorAll('.demo-toolbar')
  for (let i = 0; i < toolbars.length; i++) {
    const toolbar = toolbars[i]
    if (!hasClass(toolbar, 'no-overflow')) {
      initResponsiveToolbar(toolbar)
    }
  }

  // add fullscreen button but omit iOS since pinch zoom will always exit fullscreen mode.
  if (!BrowserDetection.iOSVersion && !BrowserDetection.safariVersion) {
    const fullscreenButton = document.createElement('button')
    fullscreenButton.setAttribute('class', 'demo-fullscreen-button')
    fullscreenButton.setAttribute('title', 'Toggle fullscreen mode')
    fullscreenButton.addEventListener('click', () => {
      if (
        !document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement
      ) {
        if (window.innerWidth < SMALL_WIDTH) {
          addClass(document.body, 'demo-left-hidden')
          addClass(document.body, 'demo-right-hidden')
        }
        const documentElement = document.documentElement
        if (documentElement.requestFullscreen) {
          // Methods with vendor prefix might not return a Promise, don't add the error handler there
          documentElement.requestFullscreen().catch(() => {
            alert(
              `Error attempting to enable full-screen mode. Perhaps it was blocked by your browser.`
            )
          })
        } else if (documentElement.msRequestFullscreen) {
          document.body.msRequestFullscreen()
        } else if (documentElement.mozRequestFullScreen) {
          documentElement.mozRequestFullScreen()
        } else if (documentElement.webkitRequestFullscreen) {
          documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
        }
      } else {
        if (window.innerWidth < SMALL_WIDTH) {
          removeClass(document.body, 'demo-left-hidden')
          removeClass(document.body, 'demo-right-hidden')
        }
        if (document.exitFullscreen) {
          // Methods with vendor prefix might not return a Promise, don't add the error handler there
          document.exitFullscreen().catch(() => {
            alert(
              `Error attempting to exit full-screen mode. Perhaps it was blocked by your browser.`
            )
          })
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        }
      }
    })
    headerRight.appendChild(fullscreenButton)
  }

  enableWorkarounds()
}

function createHeaderElement() {
  const header = document.createElement('header')
  header.setAttribute('class', 'demo-header')
  return header
}

/**
 * Initializes responsive toolbar behavior (i.e. puts overflowing toolbar items in a separate
 * overflow menu).
 * @param {!Element} toolbar
 */
function initResponsiveToolbar(toolbar) {
  const overflowContainerWrapper = document.createElement('div')
  addClass(overflowContainerWrapper, 'overflow-container-wrapper')
  const overflowContainer = document.createElement('div')
  addClass(overflowContainer, 'overflow-container')
  overflowContainerWrapper.appendChild(overflowContainer)
  const overflowButton = document.createElement('span')
  addClass(overflowButton, 'overflow-button')
  overflowButton.setAttribute('title', 'More...')
  const closeContainerHandler = e => {
    let current = e.target
    while (current !== overflowContainerWrapper && current.parentNode) {
      current = current.parentNode
    }
    if (current !== overflowContainerWrapper && e.target !== overflowButton) {
      removeClass(overflowContainerWrapper, 'open')
      document.removeEventListener('click', closeContainerHandler)
      e.preventDefault()
    }
  }
  overflowButton.addEventListener('click', e => {
    toggleClass(overflowContainerWrapper, 'open')
    if (hasClass(overflowContainerWrapper, 'open')) {
      document.addEventListener('click', closeContainerHandler)
      if (e.currentTarget) {
        overflowContainerWrapper.style.right = overflowButton.style.right
      }
    }
  })
  toolbar.insertBefore(overflowButton, toolbar.firstChild)
  toolbar.insertBefore(overflowContainerWrapper, toolbar.firstChild)
  let toolbarWidth = 0
  const resizeHandler = () => {
    const toolbarComputedStyle = window.getComputedStyle(toolbar, null)
    const toolbarPadding = parseInt(
      toolbarComputedStyle.getPropertyValue('padding-right').match(/(\d+)/)[0]
    )
    // only update if clientWidth is > 0 - this allows to temporarily hide the toolbar with "display:'none'"
    if (toolbarWidth !== toolbar.clientWidth - toolbarPadding && toolbar.clientWidth > 0) {
      toolbarWidth = wrapToolbar(toolbar)
    }
    setTimeout(resizeHandler, 1000)
  }
  setTimeout(resizeHandler, 1000)
}

/**
 * @param {!Element} toolbar
 * @returns {number}
 */
function wrapToolbar(toolbar) {
  const toolbarComputedStyle = window.getComputedStyle(toolbar, null)
  const toolbarPadding = parseInt(
    toolbarComputedStyle.getPropertyValue('padding-right').match(/(\d+)/)[0]
  )

  const overflowContainerWrapper = toolbar.querySelector('.overflow-container-wrapper')
  const overflowContainer = overflowContainerWrapper.querySelector('.overflow-container')
  const overflowButton = toolbar.querySelector('.overflow-button')

  const toolbarBox = toolbar.getBoundingClientRect()
  let toolbarItem = toolbar.lastElementChild
  let toolbarItemBox = toolbarItem.getBoundingClientRect()
  // move overflowing toolbar items to overflow container
  while (
    toolbarItem &&
    toolbar.children.length > 3 &&
    (toolbarItemBox.top >= toolbarBox.bottom ||
      toolbarItemBox.right >= toolbarBox.right - 45 - toolbarPadding ||
      toolbarItemBox.width === 0)
  ) {
    overflowContainer.insertBefore(toolbarItem, overflowContainer.firstChild)
    if (toolbarItem.hasAttribute('for')) {
      overflowContainer.insertBefore(
        document.getElementById(toolbarItem.getAttribute('for')),
        overflowContainer.firstChild
      )
    }
    toolbarItem = toolbar.lastElementChild
    toolbarItemBox = toolbarItem.getBoundingClientRect()
  }

  // move overflowing toolbar items back to the toolbar if there is enough space
  let overflowItem = overflowContainer.firstElementChild
  while (
    overflowItem &&
    (overflowItem.clientWidth === 0 || hasClass(overflowItem, 'demo-separator'))
  ) {
    overflowItem = overflowItem.nextElementSibling
  }

  let space =
    toolbarBox.right - toolbarPadding - toolbar.lastElementChild.getBoundingClientRect().right - 45
  // eslint-disable-next-line no-cond-assign
  while (overflowItem && overflowItem.clientWidth < space) {
    while (overflowItem.previousElementSibling) {
      toolbar.appendChild(overflowItem.previousElementSibling)
    }
    toolbar.appendChild(overflowItem)
    space =
      toolbarBox.right -
      toolbarPadding -
      toolbar.lastElementChild.getBoundingClientRect().right -
      45
    overflowItem = overflowContainer.firstElementChild
    while (
      overflowItem &&
      (overflowItem.clientWidth === 0 || hasClass(overflowItem, 'demo-separator'))
    ) {
      overflowItem = overflowItem.nextElementSibling
    }
  }
  if (overflowContainer.children.length === 0) {
    addClass(overflowButton, 'hidden')
    removeClass(overflowContainerWrapper, 'open')
  } else {
    removeClass(overflowButton, 'hidden')
    overflowButton.style.right = `${toolbarPadding}px`
  }

  return toolbar.clientWidth - toolbarPadding
}

/**
 * @param {*} body
 */
function hideRightResponsive(body) {
  if (
    window.innerWidth < SMALL_WIDTH &&
    hasClass(body, 'demo-has-right') &&
    !hasClass(body, 'demo-left-hidden')
  ) {
    addClass(body, 'demo-right-hidden')
  }
}

/**
 * @param {*} isTutorial
 * @returns {!string}
 */
function getDemoName(isTutorial) {
  const title = document.title || ''
  const short = title.replace(/\s*\[yFiles for HTML]\s*/, '')
  return isTutorial ? short.substr(0, short.indexOf(' - ')) : short
}

/**
 * @returns {!string}
 */
function getTutorialName() {
  const demoName = getDemoName(false)
  return demoName.substr(demoName.indexOf(' - ') + 3)
}

/**
 * @param {!GraphComponent} [graphComponent]
 * @param {!GraphOverviewComponent} [overviewComponent]
 */
export function showApp(graphComponent, overviewComponent) {
  // Finished loading
  addClass(document.body, 'loaded')
  window['data-demo-status'] = 'OK'

  if (graphComponent) {
    graphComponent.devicePixelRatio = window.devicePixelRatio || 1
    graphComponent.horizontalScrollBarPolicy = ScrollBarVisibility.AS_NEEDED_DYNAMIC
    graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.AS_NEEDED_DYNAMIC
  }
  if (overviewComponent) {
    overviewComponent.devicePixelRatio = window.devicePixelRatio || 1
    const overviewContainer = overviewComponent.div.parentElement
    if (overviewContainer) {
      const overviewHeader = overviewContainer.querySelector('.demo-overview-header')
      if (overviewHeader) {
        overviewHeader.addEventListener('click', () => {
          toggleClass(overviewContainer, 'collapsed')
        })
      }
    }
  }

  const toolbars = document.querySelectorAll('.demo-toolbar')
  for (let i = 0; i < toolbars.length; i++) {
    const toolbar = toolbars[i]
    if (!hasClass(toolbar, 'no-overflow')) {
      wrapToolbar(toolbar)
    }
  }
}

/**
 * Binds the given command to the input element specified by the given selector.
 * @param {!string} selector
 * @param {*} command
 * @param {*} target
 * @param {*} [parameter]
 */
export function bindCommand(selector, command, target, parameter) {
  const element = document.querySelector(selector)
  if (arguments.length < 4) {
    parameter = null
    if (arguments.length < 3) {
      target = null
    }
  }
  if (!element) {
    return
  }
  command.addCanExecuteChangedListener((sender, e) => {
    if (command.canExecute(parameter, target)) {
      element.removeAttribute('disabled')
    } else {
      element.setAttribute('disabled', 'disabled')
    }
  })
  element.addEventListener('click', e => {
    if (command.canExecute(parameter, target)) {
      command.execute(parameter, target)
    }
  })
}

/**
 * @param {!string} selector
 * @param {!function} action
 */
export function bindAction(selector, action) {
  const element = document.querySelector(selector)
  if (!element) {
    return
  }
  element.addEventListener('click', e => {
    action(e)
  })
}

/**
 * @param {!string} selectors
 * @param {!function} action
 */
export function bindActions(selectors, action) {
  const elements = document.querySelectorAll(selectors)
  if (!elements) {
    return
  }
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    element.addEventListener('click', e => {
      action(e)
    })
  }
}

/**
 * @param {!string} selector
 * @param {!function} action
 */
export function bindChangeListener(selector, action) {
  const element = document.querySelector(selector)
  if (!element) {
    return
  }

  const isRange = element.getAttribute('type') === 'range'
  const isIE = BrowserDetection.ieVersion > 0 && BrowserDetection.ieVersion <= 11
  if (isRange && isIE) {
    const fireChangeIE = () => {
      action(element.value)
    }
    element.addEventListener('change', () => {
      document.removeEventListener('pointerup', fireChangeIE)
      document.addEventListener('pointerup', fireChangeIE)
    })
    return
  }
  element.addEventListener('change', e => {
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      action(e.target.checked)
      return
    }
    const target = e.target
    action(target.value)
  })
}

/**
 * @param {!(string|HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement)} selectorOrElement
 * @param {!function} action
 */
export function bindInputListener(selectorOrElement, action) {
  const element =
    typeof selectorOrElement === 'string'
      ? document.querySelector(selectorOrElement)
      : selectorOrElement
  if (!element) {
    throw new Error('No element to bind to')
  }

  const isIE = BrowserDetection.ieVersion > 0 && BrowserDetection.ieVersion <= 11
  const eventKind = isIE ? 'change' : 'input'
  element.addEventListener(eventKind, e => {
    const target = e.target
    action(target.value)
  })
}

/**
 * @param {!Element} e
 * @param {!string} className
 * @returns {!Element}
 */
export function addClass(e, className) {
  const classes = e.getAttribute('class')
  if (classes === null || classes === '') {
    e.setAttribute('class', className)
  } else if (!hasClass(e, className)) {
    e.setAttribute('class', `${classes} ${className}`)
  }
  return e
}

/**
 * @param {!Element} e
 * @param {!string} className
 * @returns {!Element}
 */
export function removeClass(e, className) {
  const classes = e.getAttribute('class')
  if (classes !== null && classes !== '') {
    if (classes === className) {
      e.setAttribute('class', '')
    } else {
      const result = classes
        .split(' ')
        .filter(s => s !== className)
        .join(' ')
      e.setAttribute('class', result)
    }
  }
  return e
}

/**
 * @param {!Element} e
 * @param {!string} className
 * @returns {boolean}
 */
export function hasClass(e, className) {
  const classes = e.getAttribute('class') || ''
  const r = new RegExp(`\\b${className}\\b`, '')
  return r.test(classes)
}

/**
 * @param {!Element} e
 * @param {!string} className
 * @returns {!Element}
 */
export function toggleClass(e, className) {
  if (hasClass(e, className)) {
    removeClass(e, className)
  } else {
    addClass(e, className)
  }
  return e
}

/**
 * Sets the value of the given combo box.
 * @param {*} comboBoxId
 * @param {*} value
 */
export function setComboboxValue(comboBoxId, value) {
  const combobox = document.getElementById(comboBoxId)
  if (!combobox) {
    return
  }
  const options = combobox.options
  for (let i = 0; i < options.length; i++) {
    const option = options[i]
    if (option.value === value) {
      option.selected = true
    }
  }
}

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
  selectElement.dispatchEvent(createEvent('change'))
}
/**
 * Adds navigation buttons to an HTMLSelectElement
 * @param {!HTMLSelectElement} selectElement the HTMLSelectElement
 * @param wrapAround whether to wrap around when navigating beyond the end or beginning of the select
 * @param {!''} classList additional classes for the navigation buttons
 * @param {boolean} [wrapAround=true]
 */
export function addNavigationButtons(selectElement, wrapAround = true, classList = '') {
  if (selectElement.parentElement == null) {
    throw new Error('The element must have a parent')
  }

  // Don't add the buttons for IE 9–10
  // We can't observe the disabled-ness there, and demos may rely on the state not changing
  // when the element should be disabled.
  if (!window.MutationObserver) {
    return
  }

  const prevButton = document.createElement('button')
  prevButton.setAttribute('title', 'Previous')
  prevButton.setAttribute('class', 'demo-icon-yIconPrevious ' + classList)
  prevButton.addEventListener('click', e => {
    const oldIndex = selectElement.selectedIndex
    const newIndex = lastIndexOfEnabled(selectElement, oldIndex - 1, wrapAround)
    if (oldIndex != newIndex && newIndex > -1) {
      selectElement.selectedIndex = newIndex
      selectElement.dispatchEvent(createEvent('change'))
    }
  })

  const nextButton = document.createElement('button')
  nextButton.setAttribute('title', 'Next')
  nextButton.setAttribute('class', 'demo-icon-yIconNext ' + classList)
  nextButton.addEventListener('click', e => {
    const oldIndex = selectElement.selectedIndex
    const newIndex = indexOfEnabled(selectElement, oldIndex + 1, wrapAround)
    if (oldIndex != newIndex && newIndex > -1) {
      selectElement.selectedIndex = newIndex
      selectElement.dispatchEvent(createEvent('change'))
    }
  })

  selectElement.parentElement.insertBefore(prevButton, selectElement)
  if (selectElement.nextElementSibling != null) {
    selectElement.parentElement.insertBefore(nextButton, selectElement.nextElementSibling)
  } else {
    selectElement.parentElement.appendChild(nextButton)
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
 * than fromIndex if there is no enabled option with an index less than fromIndex.
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
 * Reads a graph from the given filename.
 * @param {!GraphMLIOHandler} graphMLIOHandler The GraphMLIOHandler that is used to read the graph
 * @param {*} graph The graph.
 * @param {!string} filename The filename.
 * @returns {!Promise} A promise that is resolved when the parsing has completed.
 */
export function readGraph(graphMLIOHandler, graph, filename) {
  graph.clear()
  return graphMLIOHandler.readFromURL(graph, filename).catch(error => {
    if (graph.nodes.size === 0 && window.location.protocol.toLowerCase().indexOf('file') >= 0) {
      // eslint-disable-next-line no-alert
      alert(
        'Unable to open the graph.' +
          '\nPerhaps your browser does not allow handling cross domain HTTP requests. Please see the demo readme for details.'
      )
      return
    }
    reportDemoError(error)
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
  const loadingIndicator = document.querySelector('#loadingIndicator')
  loadingIndicator.style.display = visible ? 'block' : 'none'
  if (message) {
    loadingIndicator.innerText = message
  }
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Configures two-finger panning on the given input mode by disabling
 * {@link MoveViewportInputMode.allowSinglePointerMovement} and additionally re-configures
 * gestures to immediately act upon touch-down instead of waiting for a long-press.
 * @param {!GraphComponent} graphComponent
 */
export function configureTwoPointerPanning(graphComponent) {
  const inputMode = graphComponent.inputMode
  if (inputMode instanceof GraphEditorInputMode) {
    // disable single pointer movement to allow other gestures to start on a simple single press
    inputMode.moveViewportInputMode.allowSinglePointerMovement = false
    // set gestures to an immediate touch-down recognizer instead of the long-press recognizer
    inputMode.moveInputMode.pressedRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY
    inputMode.createEdgeInputMode.prepareRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY
    inputMode.createBendInputMode.prepareRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY
    inputMode.handleInputMode.pressedRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY
    inputMode.marqueeSelectionInputMode.pressedRecognizerTouch =
      TouchEventRecognizers.TOUCH_DOWN_PRIMARY
    inputMode.moveUnselectedInputMode.pressedRecognizerTouch =
      TouchEventRecognizers.TOUCH_DOWN_PRIMARY
    inputMode.moveLabelInputMode.pressedRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY
  }

  // prevent accidental start of edit gesture for now immediate touchdown gestures
  graphComponent.dragSizeTouch = new Size(40, 40)

  // iOS fires bogus mousewheel events during pinch zooming, so disable mousewheel behavior while
  // two pointers are pressed.
  if (BrowserDetection.iOSVersion > 0) {
    let previousWheelBehavior = null
    graphComponent.addTouchDownListener((sender, args) => {
      if (!args.device.isPrimaryDevice) {
        // a second pointer is down, disable wheel behavior
        previousWheelBehavior = graphComponent.mouseWheelBehavior
        graphComponent.mouseWheelBehavior = MouseWheelBehaviors.NONE
      }
    })

    const resetWheelBehavior = () => {
      if (previousWheelBehavior !== null) {
        graphComponent.mouseWheelBehavior = previousWheelBehavior
        previousWheelBehavior = null
      }
    }
    // reset mousewheel behavior in case the application is used with touch and mouse interaction
    graphComponent.addTouchUpListener(resetWheelBehavior)
    graphComponent.addTouchLeaveListener(resetWheelBehavior)
    graphComponent.addTouchLostCaptureListener(resetWheelBehavior)
  }
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
 * Creates a new event with the given type.
 *
 * On Internet Explorer, this method avoids calling the Event constructor.
 * @param {!string} eventType The type of the event
 */
function createEvent(eventType) {
  if (typeof window.Event === 'function') {
    // Event has type 'function' except in IE
    return new Event(eventType)
  }
  const ev = document.createEvent('Event')
  ev.initEvent(eventType, false, true)
  return ev
}

initializePolyfills()
initializeDemoUI()
