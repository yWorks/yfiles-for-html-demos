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
/**
 * Creates the sidebar toggle buttons if needed and adds the play button for small screens to the
 * left sidebar.
 */

export function initSidebarPanel() {
  const sidebar = document.querySelector('.demo-main__sidebar')
  if (!sidebar) return

  const sidebarTitle = sidebar.dataset.title || 'Properties'

  const toggle = document.createElement('div')
  toggle.className = 'demo-sidebar__toggle'

  const button = document.createElement('div')
  button.setAttribute('class', `demo-sidebar__toggle__button`)
  button.setAttribute('title', `Toggle sidebar`)
  button.addEventListener('click', () => {
    sidebar.classList.toggle('demo-main__sidebar--hidden')
  })

  const buttonTitle = document.createElement('div')
  buttonTitle.className = 'demo-sidebar__toggle__title'
  buttonTitle.innerText = sidebarTitle

  toggle.append(button, buttonTitle)
  sidebar.appendChild(toggle)
}

export function initDescriptionPanel() {
  const description = document.querySelector('.demo-page__description')
  if (!description) {
    return
  }

  const toggleButton = description.querySelector('.demo-description__toggle-button')
  toggleButton?.addEventListener('click', () => document.body.classList.toggle('demo-left-hidden'))

  const playButton = description.querySelector('.demo-description__play-button')
  playButton?.addEventListener('click', () => {
    document.body.classList.toggle('demo-left-hidden')
  })

  if (description.classList.contains('demo-description--draggable')) {
    enableDraggableDescription(description)
  }
}

/**
 * @param {!Element} description
 */
function enableDraggableDescription(description) {
  // disable grid-area transition
  document.body.style.transition = 'none'

  const dragArea = document.createElement('div')
  dragArea.classList.add('demo-description__drag-area')
  const verticalDragArea = dragArea
  const horizontalDragArea = dragArea.cloneNode()
  verticalDragArea.classList.add('demo-description__drag-area--vertical')
  horizontalDragArea.classList.add('demo-description__drag-area--horizontal')

  description.append(verticalDragArea, horizontalDragArea)

  let resizingElement
  const resize = event => {
    if (!resizingElement) return

    const vertical = resizingElement.classList.contains('demo-description__drag-area--vertical')

    const eventPos =
      event instanceof MouseEvent
        ? vertical
          ? event.pageX
          : window.innerHeight - event.pageY
        : event instanceof TouchEvent
        ? vertical
          ? event.touches.item(0).pageX
          : window.innerHeight - event.touches.item(0).pageY
        : null

    if (eventPos == null) {
      return
    }
    applyDescriptionSize(vertical, eventPos)
    event.preventDefault()
  }
  const endResize = () => (resizingElement = undefined)

  verticalDragArea.addEventListener('mousedown', () => (resizingElement = verticalDragArea))
  verticalDragArea.addEventListener('touchstart', () => (resizingElement = verticalDragArea))
  horizontalDragArea.addEventListener('mousedown', () => (resizingElement = horizontalDragArea))
  horizontalDragArea.addEventListener('touchstart', () => (resizingElement = horizontalDragArea))

  document.addEventListener('mousemove', resize)
  document.addEventListener('touchmove', resize)

  document.addEventListener('touchend', endResize)
  document.addEventListener('mouseup', endResize)

  verticalDragArea.addEventListener('dblclick', () => {
    document.body.style.setProperty('--description-width', '100%')
  })
  horizontalDragArea.addEventListener('dblclick', () => {
    document.body.style.setProperty('--description-drag-height', window.innerHeight + 'px')
  })
}

/**
 * @param {boolean} vertical
 * @param {number} size
 */
function applyDescriptionSize(vertical, size) {
  const property = vertical ? '--description-width' : '--description-drag-height'
  document.body.style.setProperty(property, `${size}px`)
  const key = vertical ? 'demo-description-width' : 'demo-description-height'
  localStorage.setItem(key, String(size))
}
