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
import {
  GraphComponent,
  IEdge,
  ILabelModelParameter,
  INode,
  Point,
  SimpleLabel,
  Size
} from 'yfiles'

/**
 * Adds a HTML panel on top of the contents of the GraphComponent that can
 * display arbitrary information about a node or an edge.
 * In order to not interfere with the positioning of the pop-up, HTML content
 * should be added as ancestor of the {@link HTMLPopupSupport.div div element}, and
 * use relative positioning. This implementation uses a
 * {@link ILabelModelParameter label model parameter} to determine
 * the position of the pop-up.
 */
export default class HTMLPopupSupport {
  /**
   * Constructor that takes the graphComponent, the container div element and an ILabelModelParameter
   * to determine the relative position of the popup.
   * @param {!GraphComponent} graphComponent
   * @param {!HTMLElement} div
   * @param {!ILabelModelParameter} labelModelParameter
   */
  constructor(graphComponent, div, labelModelParameter) {
    this.labelModelParameter = labelModelParameter
    this.div = div
    this.graphComponent = graphComponent
    this._currentItem = null

    // The flag for the current position is no longer valid.
    this.dirty = false

    // make the popup invisible
    div.style.opacity = '0'
    div.style.display = 'none'
    this.div.setAttribute('class', 'popupContent')

    this.registerListeners()
  }

  /**
   * Sets the node or edge to display information for.
   * Setting this property to a value other than null shows the pop-up.
   * Setting the property to null hides the pop-up.
   * @type {?(IEdge|INode)}
   */
  set currentItem(value) {
    if (value === this._currentItem) {
      return
    }
    this._currentItem = value
    if (value) {
      this.show()
    } else {
      this.hide()
    }
  }

  /**
   * Gets the node or edge to display information for.
   * @type {?(IEdge|INode)}
   */
  get currentItem() {
    return this._currentItem
  }

  /**
   * Registers click and visual update listeners.
   */
  registerListeners() {
    // Add power button listener
    const powerButton = document.getElementById('powerButton')
    powerButton.addEventListener('click', () => this.togglePowerButton(), true)

    // Add close button listener
    const closeButton = document.getElementById('closeButton')
    closeButton.addEventListener('click', () => this.hide(), true)

    // Add listener for viewport changes
    this.graphComponent.addViewportChangedListener(() => {
      if (this.currentItem) {
        this.dirty = true
      }
    })

    // Add listeners for node layout changes
    this.graphComponent.graph.addNodeLayoutChangedListener(node => {
      if (this.hasItemPositionChanged(node)) {
        this.dirty = true
      }
    })

    // Add listener for updates of the visual tree
    this.graphComponent.addUpdatedVisualListener(() => {
      if (this.currentItem && this.dirty) {
        this.dirty = false
        this.updateLocation()
      }
    })
  }

  togglePowerButton() {
    if (this.currentItem) {
      const itemTag = this.currentItem.tag
      itemTag.enabled = !itemTag.enabled

      const powerButtonPath = document.getElementById('powerButton-path')
      powerButtonPath.setAttribute('class', itemTag.enabled ? '' : 'powerButton-off')

      this.graphComponent.invalidate()
    }
  }

  /**
   * Checks if the position of the item has been affected by a layout change of the given node.
   * @param {!INode} node
   * @returns {boolean}
   */
  hasItemPositionChanged(node) {
    if (!this.currentItem) {
      return false
    }

    // the current item is a node and has been changed
    if (this.currentItem === node) {
      return true
    }

    // the current item is an edge and one of its adjacent nodes have been changed
    return (
      this.currentItem instanceof IEdge &&
      (node === this.currentItem.sourceNode || node === this.currentItem.targetNode)
    )
  }

  /**
   * Makes this pop-up visible near the given item.
   */
  show() {
    this.div.style.display = 'block'
    // ensure opacity is set after display block, to enable the fading animation
    setTimeout(() => (this.div.style.opacity = '1'), 0)
    this.div.setAttribute('class', 'popupContent popupContentFade')
    this.updateLocation()
  }

  /**
   * Hides this pop-up.
   */
  hide() {
    const parent = this.div.parentNode
    // clone the current tooltip to fade it out, since only one 'real' tooltip can exist
    const clonedTooltip = this.div.cloneNode(true)
    clonedTooltip.setAttribute('class', 'popupContentClone')
    parent.appendChild(clonedTooltip)

    // fade the clone out, then remove it from the DOM. Both actions need to be timed.
    setTimeout(() => {
      clonedTooltip.setAttribute('class', 'popupContentClone invisible')
      setTimeout(() => {
        parent.removeChild(clonedTooltip)
      }, 300)
    }, 10)

    // make the original popup invisible
    this.div.style.opacity = '0'
    this.div.style.display = 'none'
    this.div.setAttribute('class', 'popupContent')
  }

  /**
   * Changes the location of this pop-up to the location calculated by the
   * {@link HTMLPopupSupport.labelModelParameter}. Currently, this implementation does not support rotated pop-ups.
   */
  updateLocation() {
    if (!this.currentItem && !this.labelModelParameter) {
      return
    }

    const newLocation = this.calculateLocation()
    if (newLocation) {
      this.setLocation(newLocation)
      setTimeout(() => this.div.setAttribute('class', 'popupContent'), 300)
    }
  }

  /**
   * @returns {?Point}
   */
  calculateLocation() {
    const width = this.div.clientWidth
    const height = this.div.clientHeight
    const zoom = this.graphComponent.zoom

    // create a dummy label to let the LabelModelParameter compute the correct location
    const dummyLabel = new SimpleLabel(this.currentItem, '', this.labelModelParameter)
    if (!this.labelModelParameter.supports(dummyLabel)) {
      return null
    }

    dummyLabel.preferredSize = new Size(width / zoom, height / zoom)
    const labelLayout = this.labelModelParameter.model.getGeometry(
      dummyLabel,
      this.labelModelParameter
    )
    return new Point(labelLayout.anchorX, labelLayout.anchorY - (height + 10) / zoom)
  }

  /**
   * Sets the location of this pop-up to the given world coordinates.
   * @param {!Point} location
   */
  setLocation(location) {
    // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
    const viewPoint = this.graphComponent.toViewCoordinates(location)
    this.div.style.setProperty('transform', `translate(${viewPoint.x}px, ${viewPoint.y}px)`)
  }
}
