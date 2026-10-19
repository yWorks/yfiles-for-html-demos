/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/// <reference types="vite/client" />
import './modern/modern-init.css'
import './modern/modern.css'
import { createPanelFor } from './modern/navigation-rail'
import { initializeBurgerMenu, openBurgerMenu } from './modern/burger-menu'
import { initResponsiveToolbars } from './modern/toolbar'
import {
  addNavigationButtons,
  handleSplash,
  maybeStartViewTransition
} from './modern/element-utils'
import { initializeToast } from './modern/toast'

function initializeNavigationRail() {
  createPanelFor(
    document.querySelector<HTMLButtonElement>('.navbar .samples'),
    document.getElementById('samples-popover')
  )
  createPanelFor(
    document.querySelector<HTMLButtonElement>('.navbar .files'),
    document.getElementById('file-popover')
  )
  createPanelFor(
    document.querySelector<HTMLButtonElement>('.navbar .live-demo'),
    document.getElementById('live-demo-popover')
  )
  if (document.getElementById('linked-demos-popover')) {
    createPanelFor(
      document.querySelector<HTMLButtonElement>('.navbar .linked-demos'),
      document.getElementById('linked-demos-popover')
    )
  }

  const filesPopover = document.getElementById('files-popover')
  if (filesPopover) {
    createPanelFor(document.querySelector<HTMLButtonElement>('.navbar .files'), filesPopover)
  }
}

export function initializeSidePanel(panel: Element | null, title: string) {
  const panelBar = document.querySelector('.panel-bar')
  if (panel == null || panelBar == null) {
    return
  }

  // Get the panel to hide from the class name
  const panelName = panel.className.split(' ')[0]
  const collapsePanel = document.createElement('div')
  collapsePanel.classList.add('collapse-anchor')
  const collapseButton = document.createElement('button')
  collapseButton.classList.add('collapse', 'icon')
  collapseButton.title = `Collapse ${title.toLowerCase()} panel`
  collapseButton.innerText = 'collapse_content'
  collapseButton.addEventListener('click', () => {
    maybeStartViewTransition(() => {
      document.body.classList.remove(`${panelName}-visible`)
      document.body.classList.add(`${panelName}-hidden`)
    })
  })
  collapsePanel.append(collapseButton)
  panel.prepend(collapsePanel)

  const expandButton = document.createElement('button')
  expandButton.setAttribute('class', `expand-${panelName} plain`)
  expandButton.title = `Expand ${title} panel`
  expandButton.innerHTML = `<span class="icon">expand_content</span><span class="label">${title}</span>`
  expandButton.addEventListener('click', () => {
    maybeStartViewTransition(() => {
      document.body.classList.remove(`${panelName}-hidden`)
      document.body.classList.add(`${panelName}-visible`)
    })
  })
  panelBar.append(expandButton)
}

function initializeOverviewPanel() {
  const overlayAnchor = document.querySelector<HTMLElement>('.graph-overview-anchor')
  if (overlayAnchor == null) {
    return
  }

  if (overlayAnchor.children.length === 1) {
    // We expect that this is the single element that hosts the overview component.
    // In other cases, the element tree must be created in DOM
    const container = document.createElement('div')
    container.setAttribute('class', 'graph-overview graph-overview--collapsible')
    container.innerHTML = `<div class="graph-overview__header"></div>`

    overlayAnchor.appendChild(container)
    container.appendChild(overlayAnchor.firstElementChild!)
  }

  const showOverview = (header: HTMLElement | null, show: boolean) => {
    if (header == null) {
      return
    }
    header!.textContent = show ? 'Overview' : 'map'
    header!.title = show ? 'Close overview' : 'Show overview'
    const container = header.parentElement!
    if (show) {
      header.classList.remove('material-symbols-outlined')
      container.classList.remove('graph-overview--collapsed')
    } else {
      header.classList.add('material-symbols-outlined')
      container.classList.add('graph-overview--collapsed')
    }
  }

  const headerElement = overlayAnchor.querySelector<HTMLElement>('.graph-overview__header')!
  showOverview(headerElement!, overlayAnchor.classList.contains('open-initially'))
  headerElement?.addEventListener('click', (evt) => {
    maybeStartViewTransition(() => {
      const header = evt.target as HTMLElement
      showOverview(header, header.parentElement!.className.includes('graph-overview--collapsed'))
    })
  })
}

function initializeSelectNavigationButtons() {
  for (const select of document.querySelectorAll<HTMLSelectElement>('select[data-nav-buttons]')) {
    addNavigationButtons(select)
  }
}

function initializeTutorialUI() {
  // handle dragging of description panel in tutorials
  initTutorialDraggableDescription()

  document.getElementById('tutorial-step-select')?.addEventListener('change', (evt) => {
    window.location.href = (evt.target as HTMLSelectElement).value
  })
  // rest of init not relevant to tutorials
  windowLoadSplash()
  hideSplash()
}

function initializeUI() {
  const fullscreenButton = document.querySelector('button.fullscreen-button')!
  fullscreenButton.addEventListener('click', () => {
    toggleFullscreen()
  })

  const toggleThemeButton: HTMLButtonElement = document.querySelector('button.theme-toggle')!
  toggleThemeButton.addEventListener('click', (evt) => {
    toggleTheme(evt.target as HTMLButtonElement)
  })

  if (document.body.classList.contains('demo-tutorial')) {
    initializeTutorialUI()
    return
  }

  initializeNavigationRail()
  initializeBurgerMenu()
  document.querySelector('.burger-menu-button')?.addEventListener('click', () => {
    openBurgerMenu()
  })
  const mobileMenuButton = document.createElement('button')
  mobileMenuButton.setAttribute('class', 'mobile burger-menu plain')
  mobileMenuButton.title = 'Menu'
  mobileMenuButton.innerHTML = `<span class="icon">menu</span>`
  mobileMenuButton.addEventListener('click', () => {
    openBurgerMenu()
  })

  if (document.getElementById('overview-page')) {
    // handle mobile menu button specific to overview page
    document.getElementById('overview-page')!.append(mobileMenuButton)

    // rest of init not relevant to overview page
    hideSplash()
    return
  }

  const graphMainPanel = document.querySelector('.graph-panel')!
  graphMainPanel.append(mobileMenuButton)

  initializeSidePanel(document.querySelector('.interaction-panel'), 'Interaction')
  initializeSidePanel(document.querySelector('.description-panel'), 'Description')
  initResponsiveToolbars()
  initializeOverviewPanel()
  initMobileStartPage()
  initSelectWidths('.toolbar')
  observeSelectChanges('.toolbar')
  initSelectWidths('.interaction-panel')
  observeSelectChanges('.interaction-panel')

  if (document.querySelector('.interaction-panel')) {
    const mobileInteractionButton = document.createElement('button')
    mobileInteractionButton.setAttribute('class', 'mobile expand-interaction plain')
    mobileInteractionButton.title = 'Expand interaction panel'
    mobileInteractionButton.innerHTML = `<span class="icon">expand_content</span>`
    mobileInteractionButton.addEventListener('click', () => {
      maybeStartViewTransition(() => {
        document.body.classList.remove('interaction-panel-hidden')
        document.body.classList.add('interaction-panel-visible')
      })
    })
    graphMainPanel.append(mobileInteractionButton)
  }
  initializeSelectNavigationButtons()
  initializeToast()
  windowLoadSplash()
  hideSplash()
}

export function toggleTheme(button?: HTMLButtonElement) {
  maybeStartViewTransition(() => {
    if (button) {
      button.textContent = button.textContent === 'light_mode' ? 'dark_mode' : 'light_mode'
    }
    const root = document.documentElement
    const theme = root.getAttribute('data-theme')
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    root.setAttribute('data-theme', newTheme)
    if (newTheme === getThemeFromSystem()) {
      // If the new theme is the preferred system theme, remove the stored theme
      localStorage.removeItem('yfiles-ui-theme')
    } else {
      // Otherwise, store the new setting
      localStorage.setItem('yfiles-ui-theme', newTheme)
    }
  })
}

function getThemeFromSystem() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function toggleFullscreen(): void {
  // Before Safari 16.4 (2023-03-27), only the Fullscreen API is prefixed with webkit
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {
      alert(`Error attempting to exit full-screen mode. Perhaps it was blocked by your browser.`)
    })
  } else if ((document as any).webkitFullscreenElement) {
    // The method with vendor prefix might not return a Promise, don't add the error handler here
    ;(document as any).webkitExitFullscreen()
  } else {
    const documentElement = document.documentElement as HTMLElement & {
      webkitRequestFullscreen: any
    }
    if (documentElement.requestFullscreen) {
      documentElement.requestFullscreen().catch(() => {
        alert(
          `Error attempting to enable full-screen mode. Perhaps it was blocked by your browser.`
        )
      })
    } else if (documentElement.webkitRequestFullscreen) {
      // The method with vendor prefix might not return a Promise, don't add the error handler here
      documentElement.webkitRequestFullscreen((Element as any).ALLOW_KEYBOARD_INPUT)
    }
  }
}

function initMobileStartPage() {
  if (!window || !('matchMedia' in window) || !window.matchMedia('(max-width: 80rem)').matches) {
    return
  }

  if (window.matchMedia('(max-width: 64rem)').matches) {
    const descriptionPanel = document.querySelector('.description-panel')
    if (!descriptionPanel) {
      return
    }

    const collapseButton = descriptionPanel.querySelector<HTMLButtonElement>('.collapse')
    if (collapseButton) {
      collapseButton.style.display = 'none'
    }

    const startHereButton = document.createElement('button')
    startHereButton.setAttribute('class', 'mobile-start-here-button')
    startHereButton.title = 'Start here'
    startHereButton.innerHTML = `<span class="icon">play_circle</span><span class="label">Start here</span>`
    startHereButton.addEventListener('click', () => {
      maybeStartViewTransition(() => {
        document.body.classList.remove('description-panel-visible')
        document.body.classList.add('description-panel-hidden')
      })
      if (collapseButton) {
        collapseButton.style.display = 'inline-block'
      }
      window.removeEventListener('resize', showCollapseButton)
      startHereButton.remove()
    })
    const showCollapseButton = () => {
      if (window.matchMedia('(min-width: 64rem)').matches) {
        if (collapseButton) {
          collapseButton.style.display = 'inline-block'
        }
      } else {
        if (collapseButton) {
          collapseButton.style.display = 'none'
        }
      }
    }
    window.addEventListener('resize', showCollapseButton)

    const yFilesTitle = document.createElement('h3')
    yFilesTitle.setAttribute('class', 'mobile-description-yfiles-title')
    yFilesTitle.innerText = 'yFiles for HTML'
    descriptionPanel.prepend(yFilesTitle)
    descriptionPanel.prepend(startHereButton)
  }

  document.body.classList.remove('description-panel-hidden')
  document.body.classList.add('description-panel-visible')
}

const originalText = new WeakMap<HTMLOptionElement, string>()
const initializedSelects = new WeakSet<HTMLSelectElement>()
const selectNaturalWidth = new WeakMap<HTMLSelectElement, number>()
const openSelects = new WeakSet<HTMLSelectElement>()

function getCssMaxWidth(el: HTMLElement): number | undefined {
  const styles = getComputedStyle(el)
  const values = [styles.maxInlineSize, styles.maxWidth]
    .filter((v) => v !== 'none' && v !== '')
    .map((v) => parseFloat(v))
    .filter((v) => Number.isFinite(v))
  return values.length ? Math.min(...values) : undefined
}

function truncateWithEllipsis(
  text: string,
  maxWidth: number,
  measuringSpan: HTMLSpanElement
): string {
  measuringSpan.textContent = text
  if (measuringSpan.offsetWidth <= maxWidth) {
    return text
  }

  // Binary search for the right truncation point
  let truncated = text
  while (truncated.length > 0) {
    truncated = truncated.slice(0, -1)
    measuringSpan.textContent = truncated + '…'

    if (measuringSpan.offsetWidth <= maxWidth) {
      return truncated + '…'
    }
  }
  return '…'
}

function applyTruncation(
  select: HTMLSelectElement,
  availableTextWidth: number,
  temp: HTMLSpanElement
): void {
  if (openSelects.has(select)) return

  // Reserve space for dropdown arrow and add padding
  const ARROW_WIDTH = 25
  const ARROW_PADDING = 8
  const truncateWidth = availableTextWidth - ARROW_WIDTH - ARROW_PADDING

  for (const option of select.options) {
    const fullText = originalText.get(option) ?? option.text
    option.textContent = option.selected
      ? truncateWithEllipsis(fullText, truncateWidth, temp)
      : fullText
  }
}

function createMeasuringSpan(select: HTMLSelectElement): HTMLSpanElement {
  const temp = document.createElement('span')
  temp.style.visibility = 'hidden'
  temp.style.position = 'absolute'
  temp.style.whiteSpace = 'nowrap'
  document.body.appendChild(temp)

  const cs = getComputedStyle(select)
  temp.style.font = cs.font
  temp.style.fontFamily = cs.fontFamily
  temp.style.fontSize = cs.fontSize
  temp.style.fontWeight = cs.fontWeight
  temp.style.letterSpacing = cs.letterSpacing

  return temp
}

function initSelectWidths(containerSelector = '.toolbar'): void {
  document.querySelectorAll<HTMLElement>(containerSelector).forEach((container) => {
    container.querySelectorAll<HTMLSelectElement>('select').forEach((select) => {
      if (openSelects.has(select)) return

      // Store original text for all options
      for (const option of select.options) {
        if (!originalText.has(option)) {
          originalText.set(option, option.text)
        }
      }

      const temp = createMeasuringSpan(select)

      // Calculate and cache natural width once
      if (!selectNaturalWidth.has(select)) {
        select.style.width = ''
        let maxTextWidth = 0
        for (const option of select.options) {
          temp.textContent = originalText.get(option) ?? option.text
          const width = temp.offsetWidth
          if (width > maxTextWidth) maxTextWidth = width
        }

        let extra = 0
        switch (true) {
          case maxTextWidth === 0:
            extra = 235
            break
          case maxTextWidth < 25:
            extra = 50
            break
          case maxTextWidth < 50:
            extra = 65
            break
          case maxTextWidth < 75:
            extra = 55
            break
          case maxTextWidth < 100:
            extra = 50
            break
          case maxTextWidth < 125:
            extra = 43
            break
          case maxTextWidth < 225:
            extra = 38
            break
          default:
            extra = 35
            break
        }

        selectNaturalWidth.set(select, maxTextWidth * 1.2 + extra)
      }

      const naturalWidth = selectNaturalWidth.get(select)!
      const cssMaxWidth = getCssMaxWidth(select)

      // Natural width capped by cssMaxWidth only — parentWidth excluded
      // to avoid reflow inconsistencies after user interactions
      const constrainedWidth = cssMaxWidth ? Math.min(naturalWidth, cssMaxWidth) : naturalWidth

      const ARROW_WIDTH = 25
      const ARROW_PADDING = 8
      const availableWidth = constrainedWidth - ARROW_WIDTH - ARROW_PADDING
      select.style.width = `${constrainedWidth}px`

      if (naturalWidth > constrainedWidth) {
        applyTruncation(select, availableWidth, temp)
      } else {
        // Restore only the selected option — others are never truncated
        const selected = select.options[select.selectedIndex]
        if (selected) {
          const full = originalText.get(selected)
          if (full !== undefined) selected.textContent = full
        }
      }
      temp.remove()

      if (!initializedSelects.has(select)) {
        initializedSelects.add(select)

        // Restore full text when dropdown opens so all options show correctly
        select.addEventListener('mousedown', () => {
          if (document.activeElement === select) {
            // Second click — closing, document mousedown will re-truncate
            openSelects.delete(select)
          } else {
            openSelects.add(select)
            for (const option of select.options) {
              const full = originalText.get(option)
              if (full !== undefined) option.textContent = full
            }
          }
        })

        document.addEventListener('mousedown', (e) => {
          if (e.target === select) {
            // Closing via second click on select
            if (!openSelects.has(select)) {
              requestAnimationFrame(() =>
                requestAnimationFrame(() => initSelectWidths(containerSelector))
              )
            }
            return
          }

          if (!openSelects.has(select)) return

          // Clicked outside — close and re-truncate
          openSelects.delete(select)
          requestAnimationFrame(() =>
            requestAnimationFrame(() => initSelectWidths(containerSelector))
          )
        })

        select.addEventListener('change', () => {
          // Restore previous selected option to full text
          for (const option of select.options) {
            if (!option.selected) {
              const full = originalText.get(option)
              if (full !== undefined) option.textContent = full
            }
          }
          openSelects.delete(select)
          requestAnimationFrame(() =>
            requestAnimationFrame(() => initSelectWidths(containerSelector))
          )
        })

        select.addEventListener('keydown', (e) => {
          if (e.key === 'Tab' || e.key === 'Escape') {
            openSelects.delete(select)
            requestAnimationFrame(() =>
              requestAnimationFrame(() => initSelectWidths(containerSelector))
            )
          }
        })

        window.addEventListener('resize', () => {
          selectNaturalWidth.delete(select)
          initSelectWidths(containerSelector)
        })
      }
    })
  })
}

function observeSelectChanges(containerSelector = '.toolbar'): void {
  const container = document.querySelector(containerSelector)
  if (!container) return

  const observer = new MutationObserver((mutations) => {
    let needsUpdate = false

    for (const mutation of mutations) {
      if (
        mutation.type === 'childList' &&
        [...mutation.addedNodes, ...mutation.removedNodes].some(
          (node) => node instanceof HTMLOptionElement || node instanceof HTMLSelectElement
        )
      ) {
        if (mutation.target instanceof HTMLSelectElement) {
          selectNaturalWidth.delete(mutation.target)
        }
        needsUpdate = true
      }
    }

    if (needsUpdate) initSelectWidths(containerSelector)
  })

  observer.observe(container, { subtree: true, childList: true })
}

const hideSplash = () => {
  const splash = document.getElementById('splash-screen')
  if (splash) {
    splash.remove()
  }
}

function applyDescriptionSize(vertical: boolean, size: number): void {
  const property = vertical ? '--description-width' : '--description-drag-height'
  document.body.style.setProperty(property, `${size}px`)
  const key = vertical ? 'demo-description-width' : 'demo-description-height'
  localStorage.setItem(key, String(size))
}

function initTutorialDraggableDescription() {
  const tutorialDescription = document.querySelector<HTMLElement>('.tutorial-description-panel')
  if (!tutorialDescription) return
  // disable grid-area transition
  document.body.style.transition = 'none'

  const verticalDragArea = document.createElement('div')
  verticalDragArea.classList.add('demo-description__drag-area')
  verticalDragArea.classList.add('demo-description__drag-area--vertical')
  const horizontalDragArea = document.createElement('div')
  horizontalDragArea.classList.add('demo-description__drag-area')
  horizontalDragArea.classList.add('demo-description__drag-area--horizontal')

  tutorialDescription.append(verticalDragArea, horizontalDragArea)

  let resizingElement: HTMLElement | undefined
  const resize = (event: MouseEvent | TouchEvent) => {
    if (!resizingElement) return

    const vertical = resizingElement.classList.contains('demo-description__drag-area--vertical')

    const eventPos =
      event instanceof MouseEvent
        ? vertical
          ? event.clientX
          : window.innerHeight - event.clientY
        : event instanceof TouchEvent
          ? vertical
            ? event.touches.item(0)!.clientX
            : window.innerHeight - event.touches.item(0)!.clientY
          : null

    if (eventPos == null) {
      return
    }
    applyDescriptionSize(vertical, eventPos)
    event.preventDefault()
  }
  const endResize = () => {
    if (resizingElement) {
      document.body.classList.remove('demo-resizing-vertical')
      document.body.classList.remove('demo-resizing-horizontal')
      resizingElement = undefined
    }
  }

  verticalDragArea.addEventListener('mousedown', () => {
    resizingElement = verticalDragArea
    document.body.classList.add('demo-resizing-vertical')
  })
  verticalDragArea.addEventListener(
    'touchstart',
    (e) => {
      resizingElement = verticalDragArea
      document.body.classList.add('demo-resizing-vertical')
      if (e.touches.length > 1) e.preventDefault()
    },
    { passive: false }
  )
  horizontalDragArea.addEventListener('mousedown', () => {
    resizingElement = horizontalDragArea
    document.body.classList.add('demo-resizing-horizontal')
  })
  horizontalDragArea.addEventListener(
    'touchstart',
    (e) => {
      resizingElement = horizontalDragArea
      document.body.classList.add('demo-resizing-horizontal')
      if (e.touches.length > 1) e.preventDefault()
    },
    { passive: false }
  )

  document.addEventListener('mousemove', resize)
  document.addEventListener('touchmove', resize)

  document.addEventListener('touchend', endResize)
  document.addEventListener('mouseup', endResize)

  verticalDragArea.addEventListener('dblclick', () => {
    document.body.style.setProperty('--description-width', '100%')
    // positionVerticalHandle()
  })
  horizontalDragArea.addEventListener('dblclick', () => {
    document.body.style.setProperty('--description-drag-height', window.innerHeight + 'px')
  })

  // Apply description size in local storage
  restoreDescriptionSize(true)
  restoreDescriptionSize(false)
}

if (!(window as any).demo_ui_initialized) {
  ;(window as any).demo_ui_initialized = true
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI)
  } else {
    initializeUI()
  }
}

function restoreDescriptionSize(vertical: boolean) {
  const key = vertical ? 'demo-description-width' : 'demo-description-height'
  const size = getNumberItemFromLocalStorage(key)
  if (size == null) {
    return
  }
  const property = vertical ? '--description-width' : '--description-drag-height'
  document.body.style.setProperty(property, `${size}px`)
}

function getNumberItemFromLocalStorage(key: string) {
  const storageItem = localStorage.getItem(key)

  if (!storageItem) {
    return null
  }
  const size = parseFloat(storageItem)

  return Number.isFinite(size) ? size : null
}

function windowLoadSplash() {
  handleSplash('.graph-panel', true)
  window.addEventListener('load', () => {
    handleSplash('.graph-panel', false)
  })
}
