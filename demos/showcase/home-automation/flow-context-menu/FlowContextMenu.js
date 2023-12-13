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
import { ContextMenu } from 'demo-utils/ContextMenu'
import { GraphComponent, Point } from 'yfiles'

/**
 * An extension of demo implementation of a context menu that is used in various yFiles demos.
 */
export class FlowContextMenu extends ContextMenu {
  /**
   * Creates a new empty menu.
   *
   * @param {!GraphComponent} graphComponent The graph component of this context menu.
   */
  constructor(graphComponent) {
    super(graphComponent)
    this.element.setAttribute('class', 'flow-context-menu')
  }

  /**
   * Adds a new separator to this menu.
   */
  addSeparator() {
    const separator = document.createElement('div')
    separator.setAttribute('class', 'flow-context-menu__separator')
    this.element.appendChild(separator)
  }

  /**
   * Shows this menu at the given location.
   *
   * This menu only shows if it has at least one menu item.
   *
   * @param {!Point} location The location of the menu relative to the left edge of the entire
   *   document. These are typically the pageX and pageY coordinates of the contextmenu event.
   */
  show(location) {
    if (this.element.childElementCount <= 0) {
      return
    }
    this.element.addEventListener('focusout', this.focusOutListener)
    this.element.addEventListener('focusin', this.focusInListener)
    this.element.addEventListener('click', this.closeListener, false)
    document.addEventListener('keydown', this.closeOnEscListener, false)

    // Set the location of this menu and append it to the body
    const style = this.element.style
    style.setProperty('position', 'absolute', '')
    style.setProperty('left', `${location.x}px`, '')
    style.setProperty('top', `${location.y}px`, '')
    if (document.fullscreenElement && !document.fullscreenElement.contains(document.body)) {
      document.fullscreenElement.appendChild(this.element)
    } else {
      document.body.appendChild(this.element)
    }

    // trigger enter animation
    setTimeout(() => {
      this.element.classList.add('flow-context-menu--visible')
    }, 0)
    this.element.firstElementChild.focus()
    this.isOpen = true
  }

  /**
   * Closes this menu.
   */
  close() {
    this.element.removeEventListener('focusout', this.focusOutListener)
    this.element.removeEventListener('focusin', this.focusInListener)
    this.element.removeEventListener('click', this.closeListener, false)
    document.removeEventListener('keydown', this.closeOnEscListener, false)

    const parentNode = this.element.parentNode
    if (parentNode) {
      // trigger fade-out animation on a clone
      const contextMenuClone = this.element.cloneNode(true)
      contextMenuClone.classList.add('flow-context-menu--clone')
      parentNode.appendChild(contextMenuClone)
      // fade the clone out, then remove it from the DOM. Both actions need to be timed.
      setTimeout(() => {
        contextMenuClone.classList.remove('flow-context-menu--visible')

        setTimeout(() => {
          parentNode.removeChild(contextMenuClone)
        }, 300)
      }, 0)

      this.element.classList.remove('flow-context-menu--visible')
      parentNode.removeChild(this.element)
    }

    this.isOpen = false
  }

  /**
   * @param {!string} label
   * @param {?function} clickListener
   * @param {boolean} [disabled]
   * @param {!string} [icon]
   * @returns {!HTMLElement}
   */
  addMenuItem(label, clickListener, disabled, icon) {
    const menuButton = document.createElement('button')
    menuButton.classList.add('flow-context-menu__item')
    if (disabled) {
      menuButton.classList.add('flow-context-menu__item-disabled')
    }

    if (clickListener !== null) {
      menuButton.addEventListener('click', clickListener, false)
    }

    const iconItem = document.createElement('div')
    iconItem.classList.add('flow-context-menu__item-icon')
    if (icon) {
      iconItem.style.backgroundImage = `url(${icon})`
    }
    menuButton.appendChild(iconItem)

    const buttonText = document.createElement('span')
    buttonText.innerHTML = label
    menuButton.appendChild(buttonText)

    // flow-context-menu__item-icon
    this.element.appendChild(menuButton)
    return menuButton
  }
}
