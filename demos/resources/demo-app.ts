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
import { registerErrorDialog } from './demo-error'
import {
  detectInternetExplorerVersion,
  detectiOSVersion,
  detectSafariVersion,
  enableWorkarounds
} from '../utils/Workarounds'
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

export type OptionData = { value: string; text: string }

// match CSS media query
const SIDEBAR_WIDTH = 320
const SMALL_WIDTH = SIDEBAR_WIDTH * 3

const ieVersion = detectInternetExplorerVersion()
const isIE = ieVersion > -1 && ieVersion <= 11

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
    ((f: FrameRequestCallback) =>
      window.setTimeout(() => {
        f(Date.now())
      }, 16))

  window.cancelAnimationFrame =
    window.cancelAnimationFrame || ((id: number) => window.clearTimeout(id))
}

/**
 * Creates some HTML elements of the demo UI.
 *
 * Called in an IIFE when this file is loaded.
 */
function initializeDemoUI(): void {
  const body = document.body

  const demoContentElement = document.querySelector<HTMLElement>('.demo-content')

  if (document.querySelector('.demo-left')) {
    addClass(body, 'demo-has-left')
  }
  if (document.querySelector('.demo-right')) {
    addClass(body, 'demo-has-right')
  }

  // Add header

  const header = document.querySelector<HTMLElement>('.demo-header') || createHeaderElement()

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

  let headerRight = document.querySelector<HTMLElement>('.demo-header-right')
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

  const sidebar = document.querySelector('.demo-left')!

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
  if (detectiOSVersion() === -1 && detectSafariVersion() === -1) {
    const fullscreenButton = document.createElement('button')
    fullscreenButton.setAttribute('class', 'demo-fullscreen-button')
    fullscreenButton.setAttribute('title', 'Toggle fullscreen mode')
    fullscreenButton.addEventListener('click', () => {
      if (
        !document.fullscreenElement &&
        !(document as any).mozFullScreenElement &&
        !(document as any).webkitFullscreenElement &&
        !(document as any).msFullscreenElement
      ) {
        if (window.innerWidth < SMALL_WIDTH) {
          addClass(document.body, 'demo-left-hidden')
          addClass(document.body, 'demo-right-hidden')
        }
        const documentElement = document.documentElement as any
        if (documentElement.requestFullscreen) {
          // Methods with vendor prefix might not return a Promise, don't add the error handler there
          documentElement.requestFullscreen().catch(() => {
            alert(
              `Error attempting to enable full-screen mode. Perhaps it was blocked by your browser.`
            )
          })
        } else if (documentElement.msRequestFullscreen) {
          ;(document.body as any).msRequestFullscreen()
        } else if (documentElement.mozRequestFullScreen) {
          documentElement.mozRequestFullScreen()
        } else if (documentElement.webkitRequestFullscreen) {
          documentElement.webkitRequestFullscreen((Element as any).ALLOW_KEYBOARD_INPUT)
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
        } else if ((document as any).msExitFullscreen) {
          ;(document as any).msExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          ;(document as any).mozCancelFullScreen()
        } else if ((document as any).webkitExitFullscreen) {
          ;(document as any).webkitExitFullscreen()
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
 */
function initResponsiveToolbar(toolbar: Element): void {
  const overflowContainerWrapper = document.createElement('div')
  addClass(overflowContainerWrapper, 'overflow-container-wrapper')
  const overflowContainer = document.createElement('div')
  addClass(overflowContainer, 'overflow-container')
  overflowContainerWrapper.appendChild(overflowContainer)
  const overflowButton = document.createElement('span')
  addClass(overflowButton, 'overflow-button')
  overflowButton.setAttribute('title', 'More...')
  const closeContainerHandler = (e: any) => {
    let current: any = e.target
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
      toolbarComputedStyle.getPropertyValue('padding-right').match(/(\d+)/)![0]
    )
    // only update if clientWidth is > 0 - this allows to temporarily hide the toolbar with "display:'none'"
    if (toolbarWidth !== toolbar.clientWidth - toolbarPadding && toolbar.clientWidth > 0) {
      toolbarWidth = wrapToolbar(toolbar)
    }
    setTimeout(resizeHandler, 1000)
  }
  setTimeout(resizeHandler, 1000)
}

function wrapToolbar(toolbar: Element): number {
  const toolbarComputedStyle = window.getComputedStyle(toolbar, null)
  const toolbarPadding = parseInt(
    toolbarComputedStyle.getPropertyValue('padding-right').match(/(\d+)/)![0]
  )

  const overflowContainerWrapper = toolbar.querySelector(
    '.overflow-container-wrapper'
  ) as HTMLElement
  const overflowContainer = overflowContainerWrapper.querySelector(
    '.overflow-container'
  ) as HTMLElement
  const overflowButton = toolbar.querySelector('.overflow-button') as HTMLSpanElement

  const toolbarBox = toolbar.getBoundingClientRect()
  let toolbarItem: any = toolbar.lastElementChild
  let toolbarItemBox: any = toolbarItem.getBoundingClientRect()
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
        document.getElementById(toolbarItem.getAttribute('for')!)!,
        overflowContainer.firstChild
      )
    }
    toolbarItem = toolbar.lastElementChild
    toolbarItemBox = toolbarItem.getBoundingClientRect()
  }

  // move overflowing toolbar items back to the toolbar if there is enough space
  let overflowItem: Element = overflowContainer.firstElementChild!
  while (
    overflowItem &&
    (overflowItem.clientWidth === 0 || hasClass(overflowItem, 'demo-separator'))
  ) {
    overflowItem = overflowItem.nextElementSibling!
  }

  let space: number =
    toolbarBox.right - toolbarPadding - toolbar.lastElementChild!.getBoundingClientRect().right - 45
  // eslint-disable-next-line no-cond-assign
  while (overflowItem && overflowItem.clientWidth < space) {
    while (overflowItem.previousElementSibling) {
      toolbar.appendChild(overflowItem.previousElementSibling)
    }
    toolbar.appendChild(overflowItem)
    space =
      toolbarBox.right -
      toolbarPadding -
      toolbar.lastElementChild!.getBoundingClientRect().right -
      45
    overflowItem = overflowContainer.firstElementChild!
    while (
      overflowItem &&
      (overflowItem.clientWidth === 0 || hasClass(overflowItem, 'demo-separator'))
    ) {
      overflowItem = overflowItem.nextElementSibling!
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

function hideRightResponsive(body: any): void {
  if (
    window.innerWidth < SMALL_WIDTH &&
    hasClass(body, 'demo-has-right') &&
    !hasClass(body, 'demo-left-hidden')
  ) {
    addClass(body, 'demo-right-hidden')
  }
}

function getDemoName(isTutorial: any): string {
  const title = document.title || ''
  const short = title.replace(/\s*\[yFiles for HTML]\s*/, '')
  return isTutorial ? short.substr(0, short.indexOf(' - ')) : short
}

function getTutorialName(): string {
  const demoName = getDemoName(false)
  return demoName.substr(demoName.indexOf(' - ') + 3)
}

export function showApp(
  graphComponent?: GraphComponent,
  overviewComponent?: GraphOverviewComponent
): void {
  // Finished loading
  addClass(document.body, 'loaded')
  // @ts-ignore
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
 */
export function bindCommand(selector: string, command: any, target: any, parameter?: any): void {
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
  command.addCanExecuteChangedListener((sender: any, e: any) => {
    if (command.canExecute(parameter, target)) {
      element.removeAttribute('disabled')
    } else {
      element.setAttribute('disabled', 'disabled')
    }
  })
  element.addEventListener('click', (e: Event) => {
    if (command.canExecute(parameter, target)) {
      command.execute(parameter, target)
    }
  })
}

export function bindAction(selector: string, action: (arg0: Event) => any): void {
  const element = document.querySelector(selector)
  if (!element) {
    return
  }
  element.addEventListener('click', (e: Event) => {
    action(e)
  })
}

export function bindActions(selectors: string, action: (arg0: Event) => any): void {
  const elements = document.querySelectorAll(selectors)
  if (!elements) {
    return
  }
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    element.addEventListener('click', (e: Event) => {
      action(e)
    })
  }
}

export function bindChangeListener(selector: string, action: (arg0: any) => any): void {
  const element = document.querySelector(selector)
  if (!element) {
    return
  }

  const isRange = element.getAttribute('type') === 'range'
  if (isRange && isIE) {
    const fireChangeIE = () => {
      action((element as HTMLInputElement).value)
    }
    element.addEventListener('change', () => {
      document.removeEventListener('pointerup', fireChangeIE)
      document.addEventListener('pointerup', fireChangeIE)
    })
  } else {
    element.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        action(target.checked)
      } else {
        action(target.value)
      }
    })
  }
}

export function bindInputListener(
  selectorOrElement: string | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  action: (value: string) => void
): void {
  const element =
    typeof selectorOrElement === 'string'
      ? document.querySelector(selectorOrElement)
      : selectorOrElement
  if (!element) {
    throw new Error('No element to bind to')
  }

  const eventKind = isIE ? 'change' : 'input'
  element.addEventListener(eventKind, (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    action(target.value)
  })
}

export function addClass(e: Element, className: string): Element {
  const classes = e.getAttribute('class')
  if (classes === null || classes === '') {
    e.setAttribute('class', className)
  } else if (!hasClass(e, className)) {
    e.setAttribute('class', `${classes} ${className}`)
  }
  return e
}

export function removeClass(e: Element, className: string): Element {
  const classes = e.getAttribute('class')
  if (classes !== null && classes !== '') {
    if (classes === className) {
      e.setAttribute('class', '')
    } else {
      const result = classes
        .split(' ')
        .filter((s: any) => s !== className)
        .join(' ')
      e.setAttribute('class', result)
    }
  }
  return e
}

export function hasClass(e: Element, className: string): boolean {
  const classes = e.getAttribute('class') || ''
  const r = new RegExp(`\\b${className}\\b`, '')
  return r.test(classes)
}

export function toggleClass(e: Element, className: string): Element {
  if (hasClass(e, className)) {
    removeClass(e, className)
  } else {
    addClass(e, className)
  }
  return e
}

/**
 * Sets the value of the given combo box.
 */
export function setComboboxValue(comboBoxId: any, value: any): void {
  const combobox = document.getElementById(comboBoxId)
  if (!combobox) {
    return
  }
  const options = (combobox as HTMLSelectElement).options
  for (let i = 0; i < options.length; i++) {
    const option = options[i]
    if (option.value === value) {
      option.selected = true
    }
  }
}

/**
 * Adds options to an HTMLSelectElement
 * @param selectElement the HTMLSelectElement
 * @param values the option values
 */
export function addOptions(selectElement: HTMLSelectElement, ...values: (string | OptionData)[]) {
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
 * @param selectElement the HTMLSelectElement
 * @param wrapAround whether to wrap around when navigating beyond the end or beginning of the select
 * @param classList additional classes for the navigation buttons
 */
export function addNavigationButtons(
  selectElement: HTMLSelectElement,
  wrapAround = true,
  classList = ''
) {
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
 * @param selectElement the HTMLSelectElement whose options are searched for an enabled one.
 * @param fromIndex the starting index from which to search.
 * @param wrapAround determines if the search should find first enabled option with an index less
 * than fromIndex if there is no enabled option with an index greater than fromIndex.
 */
function indexOfEnabled(
  selectElement: HTMLSelectElement,
  fromIndex: number,
  wrapAround: boolean
): number {
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
 * @param selectElement the HTMLSelectElement whose options are searched for an enabled one.
 * @param fromIndex the starting index from which to search.
 * @param wrapAround determines if the search should find last enabled option with an index greater
 * than fromIndex if there is no enabled option with an index less than fromIndex.
 */
function lastIndexOfEnabled(
  selectElement: HTMLSelectElement,
  fromIndex: number,
  wrapAround: boolean
): number {
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
 * @param graphMLIOHandler The GraphMLIOHandler that is used to read the graph
 * @param graph The graph.
 * @param filename The filename.
 * @return A promise that is resolved when the parsing has completed.
 */
export function readGraph(
  graphMLIOHandler: GraphMLIOHandler,
  graph: any,
  filename: string
): Promise<any> {
  graph.clear()
  return graphMLIOHandler.readFromURL(graph, filename).catch((error: any) => {
    if (graph.nodes.size === 0 && window.location.protocol.toLowerCase().indexOf('file') >= 0) {
      // eslint-disable-next-line no-alert
      alert(
        'Unable to open the graph.' +
          '\nPerhaps your browser does not allow handling cross domain HTTP requests. Please see the demo readme for details.'
      )
      return
    }
    // @ts-ignore
    if (typeof window.reportError === 'function') {
      // @ts-ignore
      window.reportError(error)
    } else {
      throw error
    }
  })
}

/**
 * Displays or hides the loading indicator which is a div element with id 'loadingIndicator'.
 * @param visible Whether to show or hide the loading indicator.
 * @param message A text on the loading indicator.
 */
export async function showLoadingIndicator(visible: boolean, message?: string): Promise<void> {
  const loadingIndicator = document.querySelector<HTMLElement>('#loadingIndicator')!
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
 */
export function configureTwoPointerPanning(graphComponent: GraphComponent): void {
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
  if (detectiOSVersion() !== -1) {
    let previousWheelBehavior: MouseWheelBehaviors | null = null
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
 * Creates a new event with the given type.
 *
 * On Internet Explorer, this method avoids calling the Event constructor.
 * @param eventType The type of the event
 */
function createEvent(eventType: string) {
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
