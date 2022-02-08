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
import { GraphComponent, Point, TimeSpan } from 'yfiles'
import { detectSafariVersion, detectiOSVersion } from './Workarounds.js'

/**
 * A demo implementation of a context menu that is used in various yFiles demos.
 *
 * The yFiles for HTML library can easily be used with any context menu implementation. For your project, we recommend to
 * use the context menu that comes with your GUI framework, if any. However, feel tree to re-use parts of this
 * implementation in your project if it fits your needs.
 *
 * This context menu uses buttons as menu items and thus works with mouse, touch, and keyboard. Once a menu item is
 * clicked and the menu closes, it gives the focus back to its graph component.
 *
 * You shouldn't create a new instance of this menu for each 'show'. Instead, clear its menu items and add new ones
 * for the new show location.
 */
export default class ContextMenu {
  /**
   * Creates a new empty menu.
   *
   * @param {GraphComponent} graphComponent The graph component of this context menu.
   * @param {!GraphComponent} graphComponent
   */
  constructor(graphComponent) {
    const contextMenu = document.createElement('div')
    contextMenu.setAttribute('class', 'demo-context-menu')
    this.element = contextMenu
    this.blurredTimeout = null
    this.isOpen = false
    this.onClosedCallbackField = null

    // Listeners for focus events since this menu closes itself if it loses the focus.
    this.focusOutListener = evt => {
      this.onFocusOut(evt.relatedTarget)
    }

    this.focusInListener = () => {
      if (this.blurredTimeout) {
        clearTimeout(this.blurredTimeout)
        this.blurredTimeout = null
      }
    }

    // A click listener that closes the menu and calls the onCloseCallback.
    // This way, the individual menu items do not need to handle this by themselves.
    this.closeListener = evt => {
      evt.stopPropagation()
      this.close()
      // Set the focus to the graph component
      graphComponent.focus()
      this.onClosedCallback()
    }

    // A ESC key press listener that closes the menu and calls the callback.
    this.closeOnEscListener = evt => {
      if (evt.keyCode === 27 && this.element.parentNode) {
        this.closeListener(evt)
      }
    }

    // We lower the default long-press duration to 100ms to avoid conflicts between the context menu and
    // other gestures on long-press, e.g. edge creation.
    graphComponent.longPressTime = TimeSpan.fromMilliseconds(100)
  }

  /**
   * Adds a new separator to this menu.
   */
  addSeparator() {
    const separator = document.createElement('div')
    separator.setAttribute('class', 'demo-separator')
    this.element.appendChild(separator)
  }

  /**
   * Adds a new menu entry with the given text and click-listener to this menu.
   * @param {!string} label
   * @param {?function} clickListener
   * @returns {!HTMLElement}
   */
  addMenuItem(label, clickListener) {
    const menuItem = document.createElement('button')
    menuItem.setAttribute('class', 'demo-menu-item')
    menuItem.innerHTML = label
    if (clickListener !== null) {
      menuItem.addEventListener('click', clickListener, false)
    }
    this.element.appendChild(menuItem)
    return menuItem
  }

  /**
   * Removes all menu entries and separators from this menu.
   */
  clearItems() {
    const element = this.element
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  }

  /**
   * Shows this menu at the given location.
   *
   * This menu only shows if it has at least one menu item.
   *
   * @param {Point} location The location of the menu relative to the left edge of the entire
   *   document. This are typically the pageX and pageY coordinates of the contextmenu event.
   * @param {!Point} location
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
      this.element.setAttribute('class', `${this.element.getAttribute('class')} visible`)
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
      contextMenuClone.setAttribute(
        'class',
        `${contextMenuClone.getAttribute('class')} demo-context-menu-clone`
      )
      parentNode.appendChild(contextMenuClone)
      // fade the clone out, then remove it from the DOM. Both actions need to be timed.
      setTimeout(() => {
        contextMenuClone.setAttribute(
          'class',
          contextMenuClone.getAttribute('class').replace(/\s?visible/, '')
        )

        setTimeout(() => {
          parentNode.removeChild(contextMenuClone)
        }, 300)
      }, 0)

      this.element.setAttribute(
        'class',
        this.element.getAttribute('class').replace(/\s?visible/, '')
      )
      parentNode.removeChild(this.element)
    }

    this.isOpen = false
  }

  /**
   * Sets a callback function that is invoked if the context menu closed itself, for example because a
   * menu item was clicked.
   *
   * Typically, the provided callback informs the <code>ContextMenuInputMode</code> that this menu is
   * closed.
   */
  get onClosedCallback() {
    if (this.onClosedCallbackField == null) {
      alert('For this context menu, the onClosedCallback property must be set.')
    }
    return this.onClosedCallbackField
  }

  /**
   * @type {!function}
   */
  set onClosedCallback(callback) {
    this.onClosedCallbackField = callback
  }

  /**
   * Adds event listeners for events that should show the context menu. These listeners then call the provided
   * openingCallback function.
   *
   * Besides the obvious <code>contextmenu</code> event, we listen for long presses and the Context Menu key.
   *
   * A long touch press doesn't trigger a <code>contextmenu</code> event on all platforms therefore we listen to the
   * GraphComponent's TouchLongPress event
   *
   * The Context Menu key is not handled correctly in Chrome. In other browsers, when the Context Menu key is
   * pressed, the correct <code>contextmenu</code> event is fired but the event location is not meaningful.
   * In this case, we set a better location, centered on the given element.
   *
   * @param {GraphComponent} graphComponent The graph component of this context menu.
   * @param {function(Point)} openingCallback This function is called when an event that should
   *   open the context menu occurred. It gets the location of the event.
   * @param {!GraphComponent} graphComponent
   * @param {!function} openingCallback
   */
  addOpeningEventListeners(graphComponent, openingCallback) {
    const componentDiv = graphComponent.div
    const contextMenuListener = evt => {
      evt.preventDefault()
      if (this.isOpen) {
        // might be open already because of the longpress listener
        return
      }
      const me = evt
      if (evt.mozInputSource === 1 && me.button === 0) {
        // This event was triggered by the context menu key in Firefox.
        // Thus, the coordinates of the event point to the lower left corner of the element and should be corrected.
        openingCallback(ContextMenu.getCenterInPage(componentDiv))
      } else if (me.pageX === 0 && me.pageY === 0) {
        // Most likely, this event was triggered by the context menu key in IE.
        // Thus, the coordinates are meaningless and should be corrected.
        openingCallback(ContextMenu.getCenterInPage(componentDiv))
      } else {
        openingCallback(new Point(me.pageX, me.pageY))
      }
    }

    // Listen for the contextmenu event
    // Note: On Linux based systems (e.g. Ubuntu), the contextmenu event is fired on mouse down
    // which triggers the ContextMenuInputMode before the ClickInputMode. Therefore handling the
    // event, will prevent the ItemRightClicked event from firing.
    // For more information, see https://docs.yworks.com/yfileshtml/#/kb/article/780/
    componentDiv.addEventListener('contextmenu', contextMenuListener, false)

    if (detectSafariVersion() > 0 || detectiOSVersion() > 0) {
      // Additionally add a long press listener especially for iOS, since it does not fire the contextmenu event.
      let contextMenuTimer
      graphComponent.addTouchDownListener((sender, args) => {
        contextMenuTimer = setTimeout(() => {
          openingCallback(
            graphComponent.toPageFromView(graphComponent.toViewCoordinates(args.location))
          )
        }, 500)
      })
      graphComponent.addTouchUpListener(() => {
        clearTimeout(contextMenuTimer)
      })
    }

    // Listen to the context menu key to make it work in Chrome
    componentDiv.addEventListener('keyup', evt => {
      if (evt.keyCode === 93) {
        evt.preventDefault()
        openingCallback(ContextMenu.getCenterInPage(componentDiv))
      }
    })
  }

  /**
   * Closes the context menu when it lost the focus.
   *
   * @param {HTMLElement} relatedTarget The related target of the focus event.
   *
   * @private
   * @param {!HTMLElement} relatedTarget
   */
  onFocusOut(relatedTarget) {
    // focusout can also occur when the focus shifts between the buttons in this context menu.
    // We have to find out if none of the buttons has the focus and focusout is real
    if (relatedTarget) {
      if (relatedTarget.parentElement && relatedTarget.parentElement !== this.element) {
        this.close()
      }
    } else if (!this.blurredTimeout) {
      // If the browser doesn't provide a related target, we wait a little bit to see whether the focus is given to
      // another button in this context menu
      this.element.addEventListener('focusin', this.focusInListener)
      this.blurredTimeout = setTimeout(() => {
        this.close()
      }, 350)
    }
  }

  /**
   * Calculates the location of the center of the given element in absolute coordinates relative to the body element.
   *
   * @param {HTMLElement} element
   * @returns {!Point} {Point}
   *
   * @private
   * @param {!HTMLElement} element
   */
  static getCenterInPage(element) {
    let left = element.clientWidth / 2.0
    let top = element.clientHeight / 2.0
    while (element.offsetParent) {
      left += element.offsetLeft
      top += element.offsetTop
      element = element.offsetParent
    }
    return new Point(left, top)
  }
}
