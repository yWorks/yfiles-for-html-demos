/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { registerErrorDialog } from './demo-error.js'
import { detectiOSVersion, enableWorkarounds, detectSafariVersion } from '../utils/Workarounds.js'

// match CSS media query
const SIDEBAR_WIDTH = 320
const SMALL_WIDTH = SIDEBAR_WIDTH * 3

// Polyfill requestAnimationFrame and cancelAnimationFrame if necessary.
window.requestAnimationFrame = window.requestAnimationFrame || (f => window.setTimeout(f, 16))
window.cancelAnimationFrame = window.cancelAnimationFrame || (id => window.clearTimeout(id))

/**
 * Called in an IIFE when the file is loaded
 */
function initializeDemo() {
  const body = document.body

  const demoContentElement = document.querySelector('.demo-content')

  if (document.querySelector('.demo-left')) {
    addClass(body, 'demo-has-left')
  }
  if (document.querySelector('.demo-right')) {
    addClass(body, 'demo-has-right')
  }

  // Add header

  const header = document.createElement('header')
  header.setAttribute('class', 'demo-header')

  const logoLink = document.createElement('a')
  logoLink.setAttribute('href', 'https://www.yworks.com/')

  const logoImage = document.createElement('img')
  logoImage.setAttribute('src', '../../resources/image/ylogo.svg')
  logoImage.setAttribute('class', 'demo-y-logo')

  logoLink.appendChild(logoImage)
  header.appendChild(logoLink)

  const yFilesHTMLLink = document.createElement('a')
  yFilesHTMLLink.setAttribute('href', '../../README.html')
  yFilesHTMLLink.textContent = 'yFiles for HTML'
  header.appendChild(yFilesHTMLLink)

  const isTutorial = window.location.pathname.indexOf('-tutorial-') >= 0
  // For tutorials, place tutorial overview link and tutorial step name in a common element.
  // Otherwise, the tutorial step name will be hidden on small screens
  if (isTutorial) {
    // Create a link to the tutorial overview page
    const tutorialOverviewLink = document.createElement('a')
    const tutorialCategory = window.location.pathname.replace(/.*?\/0\d-(tutorial[^/]+).*/i, '$1')
    tutorialOverviewLink.setAttribute('class', 'demo-title demo-breadcrumb')
    tutorialOverviewLink.setAttribute('style', 'cursor: pointer;')
    tutorialOverviewLink.setAttribute('href', `../../README.html#${tutorialCategory}`)
    tutorialOverviewLink.textContent = getTutorialName()
    header.appendChild(tutorialOverviewLink)
  }

  const demoNameElement = document.createElement('span')
  demoNameElement.setAttribute('class', 'demo-title demo-breadcrumb')
  demoNameElement.textContent = getDemoName(isTutorial)
  header.appendChild(demoNameElement)

  const showSourceButton = document.createElement('div')
  showSourceButton.setAttribute('class', 'demo-show-source-button')
  header.appendChild(showSourceButton)

  const showSourceContent = document.createElement('div')
  showSourceContent.setAttribute('class', 'demo-show-source-content hidden')
  const demoPath = location.toString().replace(/.*\/demos\/([^/]+)\/([^/]+).*/i, '$1/$2')
  showSourceContent.innerHTML = `The source code for this demo is available in your yFiles&nbsp;for&nbsp;HTML package in the following folder:<br><div class="demo-source-path">/demos/${demoPath}</div>`
  showSourceButton.appendChild(showSourceContent)

  showSourceButton.addEventListener('click', () => toggleClass(showSourceContent, 'hidden'))

  if (demoContentElement) {
    demoContentElement.insertBefore(header, demoContentElement.firstChild)
  } else {
    body.insertBefore(header, body.firstChild)
  }

  // Add sidebar toggle buttons
  const sidebars = document.querySelectorAll('.demo-sidebar')
  for (let i = 0; i < sidebars.length; ++i) {
    const sidebar = sidebars.item(i)
    const button = document.createElement('button')
    ;(() => {
      const isLeft = hasClass(sidebar, 'demo-left')
      button.setAttribute('class', `demo-${isLeft ? 'left' : 'right'}-sidebar-toggle-button`)
      button.setAttribute('title', `Toggle ${isLeft ? 'left' : 'right'} sidebar`)
      button.addEventListener('click', () => {
        toggleClass(body, isLeft ? 'demo-left-hidden' : 'demo-right-hidden')
      })
    })()
    body.appendChild(button)
  }

  const sidebar = document.querySelector('.demo-left')
  const playButton = document.createElement('a')
  playButton.className = 'action-run'
  playButton.innerHTML = getDemoName(window.location.pathname.indexOf('-tutorial-') >= 0)
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
  const toolbar = document.querySelector('.demo-toolbar')
  if (toolbar && !hasClass(toolbar, 'no-overflow')) {
    initResponsiveToolbar(toolbar)
  }

  // add fullscreen button
  if (detectiOSVersion() === -1 && detectSafariVersion() === -1) {
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
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen()
        } else if (document.documentElement.msRequestFullscreen) {
          document.body.msRequestFullscreen()
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen()
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
        }
      } else {
        if (window.innerWidth < SMALL_WIDTH) {
          removeClass(document.body, 'demo-left-hidden')
          removeClass(document.body, 'demo-right-hidden')
        }
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        }
      }
    })
    demoContentElement.appendChild(fullscreenButton)
  }

  enableWorkarounds()
}

/**
 * Initializes responsive toolbar behavior (i.e. puts overflowing toolbar items in a separate
 * overflow menu).
 * @param {Element} toolbar
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
  overflowButton.addEventListener('click', () => {
    toggleClass(overflowContainerWrapper, 'open')
    if (hasClass(overflowContainerWrapper, 'open')) {
      document.addEventListener('click', closeContainerHandler)
    }
  })
  toolbar.insertBefore(overflowButton, toolbar.firstChild)
  toolbar.insertBefore(overflowContainerWrapper, toolbar.firstChild)
  let toolbarWidth = 0
  const resizeHandler = () => {
    if (toolbarWidth !== toolbar.clientWidth) {
      toolbarWidth = toolbar.clientWidth
      const toolbarBox = toolbar.getBoundingClientRect()
      let toolbarItem = toolbar.lastElementChild
      let toolbarItemBox = toolbarItem.getBoundingClientRect()
      // move overflowing toolbar items to overflow container
      while (
        toolbarItem &&
        toolbar.children.length > 3 &&
        (toolbarItemBox.top >= toolbarBox.bottom ||
          toolbarItemBox.right >= toolbarBox.right - 45 ||
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

      let space = toolbarBox.right - toolbar.lastElementChild.getBoundingClientRect().right - 45
      // eslint-disable-next-line no-cond-assign
      while (overflowItem && overflowItem.clientWidth < space) {
        while (overflowItem.previousElementSibling) {
          toolbar.appendChild(overflowItem.previousElementSibling)
        }
        toolbar.appendChild(overflowItem)
        space = toolbarBox.right - toolbar.lastElementChild.getBoundingClientRect().right - 45
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
      }
    }
    setTimeout(resizeHandler, 1000)
  }
  setTimeout(resizeHandler, 1000)
}

function hideRightResponsive(body) {
  if (
    window.innerWidth < SMALL_WIDTH &&
    hasClass(body, 'demo-has-right') &&
    !hasClass(body, 'demo-left-hidden')
  ) {
    addClass(body, 'demo-right-hidden')
  }
}

function getDemoName(isTutorial) {
  const title = document.title || ''
  const short = title.replace(/\s*\[yFiles for HTML]\s*/, '')
  return isTutorial ? short.substr(0, short.indexOf(' - ')) : short
}

function getTutorialName() {
  const demoName = getDemoName(false)
  return demoName.substr(demoName.indexOf(' - ') + 3)
}

export function showApp(graphComponent, overviewComponent) {
  // Finished loading
  addClass(document.body, 'loaded')
  window['data-demo-status'] = 'OK'
  if (graphComponent) {
    graphComponent.devicePixelRatio = window.devicePixelRatio || 1
  }
  if (overviewComponent) {
    overviewComponent.devicePixelRatio = window.devicePixelRatio || 1
    const overviewContainer = overviewComponent.div.parentElement
    const overviewHeader = overviewContainer.querySelector('.demo-overview-header')
    overviewHeader.addEventListener('click', () => {
      toggleClass(overviewContainer, 'collapsed')
    })
  }
}

/**
 * Binds the given command to the input element specified by the given selector.
 *
 * @param {string} selector
 * @param {ICommand} command
 * @param {CanvasComponent|GraphComponent} target
 * @param {Object?} parameter
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

export function bindAction(/**string*/ selector, /**function(Event)*/ action) {
  const element = document.querySelector(selector)
  if (!element) {
    return
  }
  element.addEventListener('click', e => {
    action(e)
  })
}

export function bindActions(/**string*/ selectors, /**function(Event)*/ action) {
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

export function bindChangeListener(/**string*/ selector, /**function(string|boolean)*/ action) {
  const element = document.querySelector(selector)
  if (!element) {
    return
  }
  element.addEventListener('change', e => {
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      action(e.target.checked)
    } else {
      action(e.target.value)
    }
  })
}

/** @return {Element} */
export function addClass(/**Element*/ e, /**string*/ className) {
  const classes = e.getAttribute('class')
  if (classes === null || classes === '') {
    e.setAttribute('class', className)
  } else if (!hasClass(e, className)) {
    e.setAttribute('class', `${classes} ${className}`)
  }
  return e
}

/** @return {Element} */
export function removeClass(/**Element*/ e, /**string*/ className) {
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

/** @return {boolean} */
export function hasClass(/**Element*/ e, /**string*/ className) {
  const classes = e.getAttribute('class')
  const r = new RegExp(`\\b${className}\\b`, '')
  return r.test(classes)
}

/** @return {Element} */
export function toggleClass(/**Element*/ e, /**string*/ className) {
  if (hasClass(e, className)) {
    removeClass(e, className)
  } else {
    addClass(e, className)
  }
  return e
}

/**
 * Sets the value of the given combo box.
 * @param comboBoxId
 * @param value
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
 * Reads a graph from the given filename.
 * @param {GraphMLIOHandler} graphMLIOHandler The GraphMLIOHandler that is used to read the graph
 * @param {IGraph} graph The graph.
 * @param {string} filename The filename.
 * @return {Promise} A promise that is resolved when the parsing has completed.
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
    if (typeof window.reportError === 'function') {
      window.reportError(error)
    } else {
      throw error
    }
  })
}

// initialize the application
initializeDemo()

export {
  detectFirefoxVersion,
  detectInternetExplorerVersion,
  detectiOSVersion,
  passiveSupported,
  nativeDragAndDropSupported,
  pointerEventsSupported
} from '../utils/Workarounds.js'
