/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-editor', 'resources/demo-app'], (yfiles, utils) => {
  const innerRadius = 30
  const outerRadius = 100
  const spacing = 2
  const titleOffset = 15

  function createMenu(items, location) {
    const n = items.length
    const pi2 = Math.PI * 2

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    // temporarily add the svg to the body so the elements can be measured
    window.document.body.appendChild(svg)
    svg.addEventListener('contextmenu', e => e.preventDefault())
    svg.setAttribute('class', 'demo-dial-menu')
    svg.setAttribute('width', outerRadius)
    svg.setAttribute('height', outerRadius)
    svg.style.width = `${outerRadius}px`
    svg.style.height = `${outerRadius}px`
    svg.setAttribute('viewBox', `0 0 ${outerRadius} ${outerRadius}`)
    svg.style.position = 'absolute'
    svg.style.overflow = 'visible'
    svg.style.zIndex = 999999

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    svg.appendChild(g)
    svg.appendChild(defs)

    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
    clipPath.setAttribute('id', 'dial-menu-clip')
    defs.appendChild(clipPath)

    // create the svg elements for each item
    items.forEach((item, i) => {
      const itemContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      itemContainer.setAttribute(
        'class',
        item.disabled ? 'demo-dial-menu-item disabled' : 'demo-dial-menu-item'
      )

      g.appendChild(itemContainer)

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      itemContainer.appendChild(path)

      let middleAngle = Math.PI

      if (items.length === 1) {
        // full-circle menu has to be treated differently
        const d = `M 0 ${innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 0 ${-innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 0 ${innerRadius}
         M 0 ${outerRadius} A ${outerRadius} ${outerRadius} 0 1 0 0 ${-outerRadius} A ${outerRadius} ${outerRadius} 0 1 0 0 ${outerRadius}`
        path.setAttribute('d', d)
        path.setAttribute('fill-rule', 'evenodd')
      } else {
        const leftAngle = i * pi2 / n
        const rightAngle = i * pi2 / n + pi2 / n
        middleAngle = (leftAngle + rightAngle) * 0.5

        const innerLeftPoint = new yfiles.geometry.Point(
          Math.sin(leftAngle) * innerRadius,
          -Math.cos(leftAngle) * innerRadius
        )
        const outerLeftPoint = new yfiles.geometry.Point(
          Math.sin(leftAngle) * outerRadius,
          -Math.cos(leftAngle) * outerRadius
        )
        const innerRightPoint = new yfiles.geometry.Point(
          Math.sin(rightAngle) * innerRadius,
          -Math.cos(rightAngle) * innerRadius
        )
        const outerRightPoint = new yfiles.geometry.Point(
          Math.sin(rightAngle) * outerRadius,
          -Math.cos(rightAngle) * outerRadius
        )

        const d = `M ${innerLeftPoint.x} ${innerLeftPoint.y} L ${outerLeftPoint.x} ${
          outerLeftPoint.y
        } A ${outerRadius} ${outerRadius} 0 0 1 ${outerRightPoint.x} ${outerRightPoint.y} L ${
          innerRightPoint.x
        } ${innerRightPoint.y} A ${innerRadius} ${innerRadius} 0 0 0 ${innerLeftPoint.x} ${
          innerLeftPoint.y
        }`
        path.setAttribute('d', d)
        path.setAttribute('clip-path', 'url(#dial-menu-clip)')

        // create path clip
        const clipElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')

        const leftVector = outerLeftPoint.subtract(innerLeftPoint)
        const leftVectorOrthogonalNormalized = new yfiles.geometry.Point(
          -leftVector.y,
          leftVector.x
        ).normalized
        const rightVector = outerRightPoint.subtract(innerRightPoint)
        const rightVectorOrthogonalNormalized = new yfiles.geometry.Point(
          rightVector.y,
          -rightVector.x
        ).normalized
        const bottomLeft = innerLeftPoint.add(leftVectorOrthogonalNormalized.multiply(spacing))
        const bottomRight = innerRightPoint.add(rightVectorOrthogonalNormalized.multiply(spacing))
        const topRight = bottomRight.add(rightVector)
        const topLeft = bottomLeft.add(leftVector)
        const clipD = `M ${bottomLeft.x} ${bottomLeft.y} L ${bottomRight.x} ${bottomRight.y} L ${
          topRight.x
        } ${topRight.y} A ${outerRadius} ${outerRadius} 0 0 0 ${topLeft.x} ${topLeft.y} Z`
        clipElement.setAttribute('d', clipD)
        clipElement.setAttribute('fill', 'none')
        clipPath.appendChild(clipElement)
      }

      if (item.icon) {
        if (typeof item.icon === 'string') {
          const icon = document.createElementNS('http://www.w3.org/2000/svg', 'image')
          icon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', item.icon)
          icon.setAttribute('width', '32')
          icon.setAttribute('height', '32')
          const position = (outerRadius + innerRadius) / 2
          icon.setAttribute(
            'transform',
            `translate(${-16 + Math.sin(middleAngle) * position}, ${-16 -
              Math.cos(middleAngle) * position})`
          )
          icon.setAttribute('class', 'demo-dial-icon')
          itemContainer.appendChild(icon)
        }
      }

      if (item.title) {
        const textContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        textContainer.setAttribute('class', 'demo-dial-title')
        itemContainer.appendChild(textContainer)

        const padding = 5

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.innerHTML = item.title
        text.setAttribute('transform', `translate(${padding} ${padding})`)
        text.setAttribute('dy', '1em')
        textContainer.appendChild(text)

        const titleBounds = text.getBBox()
        const w = titleBounds.width + padding + padding
        const h = titleBounds.height + padding + padding

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('width', `${w}`)
        rect.setAttribute('height', `${h}`)
        textContainer.insertBefore(rect, text)

        let textLocation = new yfiles.geometry.Point(
          Math.sin(middleAngle) * (outerRadius + titleOffset),
          -(Math.cos(middleAngle) * (outerRadius + titleOffset)) - h * 0.5
        )

        const eps = Math.PI / 180
        if (
          (middleAngle > Math.PI - eps && middleAngle < Math.PI + eps) ||
          middleAngle > 2 * Math.PI - eps ||
          middleAngle < eps
        ) {
          textLocation = new yfiles.geometry.Point(textLocation.x - w * 0.5, textLocation.y)
        } else if (middleAngle > Math.PI) {
          textLocation = new yfiles.geometry.Point(textLocation.x - w, textLocation.y)
        }

        textContainer.setAttribute('transform', `translate(${textLocation.x} ${textLocation.y})`)
      }

      item.element = itemContainer
    })

    g.setAttribute('transform', `translate(${location.x} ${location.y})`)

    svg.parentNode.removeChild(svg)
    return svg
  }

  let hoveredItem = null

  let touchMoveListener = null
  let touchEndListener = null
  let mouseMoveListener = null
  let mouseUpListener = null

  function addEventListeners(items, location, contextMenu) {
    function updateHover(eventLocation) {
      const index = getItemIndex(location, eventLocation, items.length)
      let item = null
      //
      if (index >= 0 && index < Number.POSITIVE_INFINITY) {
        item = items[index].element
      }
      if (hoveredItem !== item) {
        if (hoveredItem !== null) {
          utils.removeClass(hoveredItem, 'highlighted')
        }
        hoveredItem = item
      }
      if (item && !utils.hasClass(item, 'disabled')) {
        utils.addClass(item, 'highlighted')
      }
    }

    function endGesture(eventLocation) {
      const index = getItemIndex(location, eventLocation, items.length)
      if (index < 0) {
        return
      }
      if (index < Number.POSITIVE_INFINITY) {
        const item = items[index]
        if (!item.disabled && typeof item.callback === 'function') {
          const worldLocation = contextMenu.$graphComponent.toWorldCoordinates(
            contextMenu.$graphComponent.toViewFromPage(location)
          )
          item.callback(worldLocation, contextMenu.graphItem)
        }
      }
      removeEventListeners()
      contextMenu.close()
    }

    touchMoveListener = evt => {
      const touch = evt.changedTouches.item(0)
      updateHover(new yfiles.geometry.Point(touch.pageX, touch.pageY))
    }
    touchEndListener = evt => {
      const touch = evt.changedTouches.item(0)
      endGesture(new yfiles.geometry.Point(touch.pageX, touch.pageY))
    }
    mouseMoveListener = evt => {
      evt.preventDefault()
      updateHover(new yfiles.geometry.Point(evt.pageX, evt.pageY))
    }
    mouseUpListener = evt => {
      evt.preventDefault()
      endGesture(new yfiles.geometry.Point(evt.pageX, evt.pageY))
    }

    window.document.addEventListener('touchstart', touchMoveListener, true)
    window.document.addEventListener('touchmove', touchMoveListener, true)
    window.document.addEventListener('touchend', touchEndListener, true)

    window.document.addEventListener('mousedown', mouseMoveListener)
    window.document.addEventListener('mousemove', mouseMoveListener)
    window.document.addEventListener('mouseup', mouseUpListener)
  }

  function removeEventListeners() {
    window.document.removeEventListener('touchstart', touchMoveListener, true)
    window.document.removeEventListener('touchmove', touchMoveListener, true)
    window.document.removeEventListener('touchend', touchEndListener, true)

    window.document.removeEventListener('mousedown', mouseMoveListener)
    window.document.removeEventListener('mousemove', mouseMoveListener)
    window.document.removeEventListener('mouseup', mouseUpListener)
  }

  /**
   * Gets the item index.
   * @param menuLocation The location of the menu
   * @param eventLocation The location of the event
   * @param itemCount The number of menu items
   * @returns {number} Returns the index of the item at the given location; -1 if the location is inside the
   *   innerRadius, Number.POSITIVE_INFINITY if the location is outside the outerRadius.
   */
  function getItemIndex(menuLocation, eventLocation, itemCount) {
    if (itemCount === 0) {
      return Number.POSITIVE_INFINITY
    }
    const delta = eventLocation.subtract(menuLocation)
    const vectorLength = delta.vectorLength
    if (vectorLength < innerRadius) {
      return -1
    } else if (vectorLength > outerRadius + 5) {
      return Number.POSITIVE_INFINITY
    }
    const pi2 = 2 * Math.PI
    const alpha = (Math.atan2(delta.y, delta.x) + Math.PI * 0.5 + pi2) % pi2
    const beta = pi2 / itemCount

    return (alpha / beta) | 0
  }

  /**
   * A context menu implementation that is optimized for touch input.
   * The context menu items are arranged as a ring around the event location.
   */
  class DialContextMenu {
    /**
     * Creates a new instance.
     * @param graphComponent The GraphComponent to use the context menu in.
     */
    constructor(graphComponent) {
      this.$items = []
      this.$graphItem = null
      this.$closeCallback = null
      this.$menuElement = null
      this.$graphComponent = graphComponent
    }

    /**
     * Gets the context menu items
     * @returns {Array}
     */
    get items() {
      return this.$items
    }

    /**
     * Gets the graph item that is associated with the context menu.
     * @returns {yfiles.graph.IModelItem}
     */
    get graphItem() {
      return this.$graphItem
    }

    /**
     * Sets the graph item that is associated with the context menu.
     * @param {yfiles.graph.IModelItem} value
     */
    set graphItem(value) {
      this.$graphItem = value
    }

    /**
     * Clears the context menu items.
     */
    clearItems() {
      this.$items = []
    }

    /**
     * Adds an item to the context menu. Returns 'this', so this function can be chained.
     * @param {Function} clickCallback The function to execute when the item has been clicked
     * @param {Element} [icon] The item icon
     * @param {string} [title] The item title
     * @param {Boolean} [disabled] Whether the item is disabled
     * @returns {DialContextMenu}
     */
    addContextMenuItem(clickCallback, icon, title, disabled) {
      this.items.push({
        callback: clickCallback,
        icon: icon || null,
        title: title || '',
        disabled: !!disabled
      })
      return this
    }

    /**
     * Sets the callback that is executed when the context menu closes
     */
    setOnCloseCallback(callback) {
      this.$closeCallback = callback
    }

    /**
     * Shows the context menu at the given location with the specified parent element
     * @param {yfiles.geometry.Point} location The location in which the context menu should open
     * @param {Element} parentElement The parent element of the context menu
     */
    show(location, parentElement) {
      this.close()
      const el = createMenu(this.items, location)
      addEventListeners(this.items, location, this)
      parentElement.appendChild(el)
      this.$menuElement = el
      this.isOpen = true
    }

    /**
     * Closes the context menu.
     */
    close() {
      const el = this.$menuElement
      if (el && el.parentNode) {
        removeEventListeners()
        el.parentNode.removeChild(el)
        this.$menuElement = null
        if (this.$closeCallback) {
          this.$closeCallback()
          this.$closeCallback = null
        }
      }
      this.isOpen = false
    }

    /**
     * Adds event listeners for events that should show a context menu.
     * Besides the obvious <code>contextmenu</code> event, we listen for the Context Menu key since it is
     * not handled correctly in Chrome. In other browsers, when the Context Menu key is pressed,
     * the correct <code>contextmenu</code> event is fired but the event location is not meaningful.
     * In this case, we set a better location, centered on the given element.
     * @param {yfiles.view.GraphComponent} graphComponent
     * @param {function(yfiles.geometry.Point)} openCallback
     */
    addEventListeners(graphComponent, openCallback) {
      const parent = graphComponent.div // The element on which we listen for contextmenu events.
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
          openCallback(getCenterInPage(parent))
        } else if (me.pageX === 0 && me.pageY === 0) {
          // Most likely, this event was triggered by the context menu key in IE.
          // Thus, the coordinates are meaningless and should be corrected.
          openCallback(getCenterInPage(parent))
        } else {
          openCallback(new yfiles.geometry.Point(me.pageX, me.pageY))
        }
      }

      const contextMenuKeyListener = evt => {
        if (evt.keyCode === 93) {
          evt.preventDefault()
          openCallback(getCenterInPage(parent))
        }
      }

      // Listen for the contextmenu event as well as for the GraphComponent's TouchLongPress event to make it work
      // consistently for the different devices and input types.
      parent.addEventListener('contextmenu', contextMenuListener, false)
      if (graphComponent) {
        graphComponent.addTouchLongPressListener((sender, args) => {
          openCallback(
            graphComponent.toPageFromView(graphComponent.toViewCoordinates(args.location))
          )
        })
      }
      // Additionally, register to the context menu key to make it work in Chrome.
      parent.addEventListener('keyup', contextMenuKeyListener, false)
    }
  }

  /**
   * Calculates the location of the center of the given element in absolute coordinates relative to the body element.
   * @param {HTMLElement} element
   * @return {yfiles.geometry.Point}
   */
  function getCenterInPage(element) {
    let left = element.clientWidth / 2.0
    let top = element.clientHeight / 2.0
    while (element.offsetParent) {
      left += element.offsetLeft
      top += element.offsetTop
      element = element.offsetParent
    }
    return new yfiles.geometry.Point(left, top)
  }

  return DialContextMenu
})
