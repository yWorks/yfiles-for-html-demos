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
export function initToolbars() {
  const observer = new ResizeObserver(toolbarSizeChanged)
  for (const toolbar of document.querySelectorAll('.demo-page__toolbar')) {
    if (!toolbar.classList.contains('no-overflow')) {
      initToolbarResponsiveness(toolbar)
      observer.observe(toolbar)
    }

    if (document.body.classList.contains('demo-tutorial')) {
      initTutorialToolbar(toolbar)
    }
  }
}

export function forceToolbarOverflowUpdate() {
  for (const toolbar of document.querySelectorAll('.demo-page__toolbar')) {
    if (!toolbar.classList.contains('no-overflow')) {
      const padding = parseFloat(getComputedStyle(toolbar).paddingRight)
      wrapToolbar(toolbar, toolbar.getBoundingClientRect().width, padding)
    }
  }
}

// @yjs:keep = contentRect
function getToolbarWidthAndPadding(entry: ResizeObserverEntry) {
  let toolbarWidth = 0,
    toolbarContentWidth = 0

  // borderBoxSize and contentBoxSize are not supported by Safari < 15,
  // fallback to contentRect
  if (!entry.borderBoxSize || !entry.contentBoxSize) {
    toolbarWidth = entry.contentRect.width ? entry.contentRect.width + 32 : 0
    toolbarContentWidth = entry.contentRect.width ?? 0
  }
  // old Firefox implemented borderBoxSize and contentBoxSize as non array
  else if (!entry.borderBoxSize[0]) {
    // @ts-ignore borderBoxSize is an array nowadays
    toolbarWidth = entry.borderBoxSize.inlineSize ?? 0
    // @ts-ignore contentBoxSize is an array nowadays
    toolbarContentWidth = entry.contentBoxSize.inlineSize ?? 0
  } else {
    toolbarWidth = entry.borderBoxSize[0].inlineSize
    toolbarContentWidth = entry.contentBoxSize[0].inlineSize
  }

  return { toolbarWidth, toolbarPadding: (toolbarWidth - toolbarContentWidth) / 2 }
}

function toolbarSizeChanged(entries: ResizeObserverEntry[]) {
  window.requestAnimationFrame(() => {
    entries.forEach((entry) => {
      const { toolbarWidth, toolbarPadding } = getToolbarWidthAndPadding(entry)
      if (toolbarWidth > 0) {
        wrapToolbar(entry.target, toolbarWidth, toolbarPadding)
      }
    })
  })
}

/**
 * Initializes responsive toolbar behavior (i.e. puts overflowing toolbar items in a separate
 * overflow menu).
 */
function initToolbarResponsiveness(toolbar: Element) {
  // add overflow container and button
  const overflowContainer = document.createElement('div')
  // Ensure that the content does not inherit the tooltip of the overflow button
  overflowContainer.setAttribute('title', '')
  overflowContainer.classList.add('overflow-container')
  const overflowContainerContent = document.createElement('div')
  overflowContainerContent.classList.add('overflow-container__content')
  overflowContainer.appendChild(overflowContainerContent)

  const overflowButton = document.createElement('span')
  overflowButton.classList.add('overflow-button')
  overflowButton.setAttribute('title', 'More...')

  const closeContainerHandler = (e: any) => {
    let current: any = e.target
    while (current !== overflowContainer && current.parentNode) {
      current = current.parentNode
    }
    if (current !== overflowContainer && e.target !== overflowButton) {
      overflowContainer.classList.remove('overflow-container--open')
      document.removeEventListener('click', closeContainerHandler)
      e.preventDefault()
    }
  }
  overflowButton.addEventListener('click', (e) => {
    if (e.target !== overflowButton) return

    overflowContainer.classList.toggle('overflow-container--open')
    if (overflowContainer.classList.contains('overflow-container--open')) {
      document.addEventListener('click', closeContainerHandler)
      if (e.currentTarget) {
        overflowContainer.style.right = overflowButton.style.right
      }
    }
  })

  overflowButton.appendChild(overflowContainer)
  toolbar.insertBefore(overflowButton, toolbar.firstChild)
}

function wrapToolbar(toolbar: Element, toolbarWidth: number, toolbarPadding: number): void {
  const overflowContainer = toolbar.querySelector('.overflow-container') as HTMLElement

  // not initialized
  if (!overflowContainer) return

  const overflowContainerContent = overflowContainer.querySelector(
    '.overflow-container__content'
  ) as HTMLElement
  const overflowButton = toolbar.querySelector('.overflow-button') as HTMLSpanElement

  // preserve 40px for overflow button
  toolbarWidth -= toolbarPadding + 40

  pushBackOverflow(toolbar, overflowContainerContent, toolbarWidth)
  removeOverflow(toolbar, overflowContainerContent, toolbarWidth)

  if (overflowContainerContent.children.length === 0) {
    overflowButton.classList.add('hidden')
    overflowContainer.classList.remove('overflow-container--open')
  } else {
    overflowButton.classList.remove('hidden')
  }
}

function removeOverflow(toolbar: Element, overflowContainerContent: Element, toolbarWidth: number) {
  let toolbarItem: any = toolbar.lastElementChild

  // move overflowing toolbar items to overflow container
  while (
    toolbarItem &&
    toolbar.children.length > 3 &&
    (toolbarItem.clientWidth === 0 || // Move hidden elements since their offsetLeft is 0 and will stop the overflow
      toolbarItem.offsetLeft + toolbarItem.clientWidth >= toolbarWidth)
  ) {
    ;(toolbarItem as any).previousOffsetWidth = toolbarItem.offsetWidth
    overflowContainerContent.insertBefore(toolbarItem, overflowContainerContent.firstChild)
    if (toolbarItem.hasAttribute('for')) {
      const element = document.getElementById(toolbarItem.getAttribute('for')!)
      if (
        element &&
        element.classList.contains('demo-toggle-button') &&
        element.classList.contains('labeled')
      ) {
        ;(element as any).previousOffsetWidth = element.offsetWidth
        overflowContainerContent.insertBefore(element, overflowContainerContent.firstChild)
      }
    }
    toolbarItem = toolbar.lastElementChild
  }
}

function pushBackOverflow(
  toolbar: Element,
  overflowContainerContent: Element,
  toolbarWidth: number
) {
  let toolbarItem = toolbar.lastElementChild as HTMLElement

  // move overflowing toolbar items back to the toolbar if there is enough space
  let overflowItem: HTMLElement = overflowContainerContent.firstElementChild! as HTMLElement
  while (
    overflowItem &&
    overflowItem.nextElementSibling &&
    (overflowItem.clientWidth === 0 || overflowItem.classList.contains('demo-separator'))
  ) {
    overflowItem = overflowItem.nextElementSibling! as HTMLElement
  }

  // remove 5 px to account for icon spacing
  let space: number = toolbarWidth - toolbarItem.offsetLeft - toolbarItem.offsetWidth - 5

  // add 5 px to client width to handle icon spacing
  while (overflowItem && (overflowItem as any).previousOffsetWidth < space) {
    while (overflowItem.previousElementSibling) {
      toolbar.appendChild(overflowContainerContent.firstElementChild!)
    }
    toolbar.appendChild(overflowItem)

    toolbarItem = toolbar.lastElementChild as HTMLElement
    space = toolbarWidth - toolbarItem.offsetLeft - toolbarItem.offsetWidth - 5
    overflowItem = overflowContainerContent.firstElementChild! as HTMLElement
    while (
      overflowItem &&
      (overflowItem.clientWidth === 0 || overflowItem.classList.contains('demo-separator'))
    ) {
      overflowItem = overflowItem.nextElementSibling! as HTMLElement
    }
  }
}

function initTutorialToolbar(toolbar: Element) {
  const dropdown = toolbar.querySelector('.demo-toolbar__tutorial-dropdown') as HTMLElement

  const closeDropdown = (_evt: Event) => {
    dropdown.classList.remove('demo-toolbar__tutorial-dropdown--expanded')
    document.body.removeEventListener('click', closeDropdown)
  }

  dropdown?.addEventListener('click', (e) => {
    if (dropdown.classList.contains('demo-toolbar__tutorial-dropdown--expanded')) {
      closeDropdown(e)
    } else {
      e.stopPropagation()
      dropdown.classList.add('demo-toolbar__tutorial-dropdown--expanded')
      document.body.addEventListener('click', closeDropdown)
    }
  })
}
