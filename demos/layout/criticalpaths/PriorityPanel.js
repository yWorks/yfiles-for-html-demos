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

define(['yfiles/view-component'], yfiles => {
  /**
   * This class adds an HTML panel on top of the contents of the GraphComponent that can display arbitrary information
   * about a {@link yfiles.graph.IModelItem graph item}. In order to not interfere with the positioning of the pop-up,
   * HTML content should be added as ancestor of the {@link PriorityPanel#div div element}, and use relative
   * positioning. This implementation uses an {@link yfiles.graph.ILabelModelParameter} to determine the position of
   * the pop-up.
   * @class PriorityPanel
   */
  class PriorityPanel {
    /**
     * Creates a new instance of {@link PriorityPanel}.
     */
    constructor(graphComponent) {
      this.graphComponent = graphComponent
      this.$div = document.getElementById('priority-panel')
      this.$currentItems = null
      this.$dirty = false

      // make the popup invisible
      this.div.style.opacity = '0'
      this.div.style.display = 'none'

      this.registerListeners()
      this.registerClickListeners()
    }

    /**
     * Sets the container {@link PriorityPanel#div div element}.
     * @param {HTMLElement} value
     */
    set div(value) {
      this.$div = value
    }

    /**
     * Returns the container {@link PriorityPanel#div div element}.
     * @return {HTMLElement}
     */
    get div() {
      return this.$div
    }

    /**
     * Sets the {@link yfiles.graph.IModelItem item} to display information for.
     * Setting this property to a value other than <code>null</code> shows the pop-up.
     * Setting the property to null hides the pop-up.
     * @param {Array.<yfiles.graph.IModelItem>} items
     */
    set currentItems(items) {
      if (items && items.length > 0) {
        if (!equals(items, this.$currentItems)) {
          this.$currentItems = items
          this.show()
        }
      } else {
        this.$currentItems = null
        this.hide()
      }
    }

    /**
     * Returns all {@link yfiles.graph.IModelItem}s to display information for.
     * @return {Array.<yfiles.graph.IModelItem>}
     */
    get currentItems() {
      return this.$currentItems
    }

    /**
     * Specifies whether or not the {@link PriorityPanel} needs to update its position.
     * @param {boolean} value
     */
    set dirty(value) {
      this.$dirty = value
    }

    /**
     * Specifies whether or not the {@link PriorityPanel} needs to update its position.
     * @return {boolean}
     */
    get dirty() {
      return this.$dirty
    }

    /**
     * Registers listeners for viewport, node bounds and visual tree changes to the {@link yfiles.view.GraphComponent}.
     */
    registerListeners() {
      // Adds listener for viewport changes
      this.graphComponent.addViewportChangedListener(() => {
        if (this.currentItems && this.currentItems.length > 0) {
          this.dirty = true
        }
      })

      // Adds listener for updates of the visual tree
      this.graphComponent.addUpdatedVisualListener((sender, eventArgs) => {
        if (this.currentItems && this.currentItems.length > 0 && this.dirty) {
          this.dirty = false
          this.updateLocation()
        }
      })
    }

    /**
     * Registers click listeners for all buttons of this {@link PriorityPanel}.
     */
    registerClickListeners() {
      this.addClickListener(document.getElementById('priority-button-0'), 0)
      this.addClickListener(document.getElementById('priority-button-1'), 1)
      this.addClickListener(document.getElementById('priority-button-2'), 2)
      this.addClickListener(document.getElementById('priority-button-3'), 3)
      this.addClickListener(document.getElementById('priority-button-4'), 4)
      this.addClickListener(document.getElementById('priority-button-5'), 5)
    }

    /**
     * Registers a click listener to given element which will invoke the callback {@link #itemPriorityChanged} and
     * {@link #priorityChanged} in case the priority of the current item changed.
     * @param {HTMLElement} element
     * @param {number} priority
     */
    addClickListener(element, priority) {
      element.addEventListener('click', () => {
        this.currentItems.forEach(item => {
          const oldPriority = item.tag && item.tag.priority ? item.tag.priority : 0
          if (oldPriority !== priority) {
            this.itemPriorityChanged(item, priority, oldPriority)
          }
        })
        this.priorityChanged()
        this.currentItems = null
      })
    }

    /**
     * Makes this pop-up visible.
     */
    show() {
      this.div.style.display = 'inline-block'
      this.div.style.opacity = '1'
      for (let i = 0; i < 6; i++) {
        document.getElementById(`priority-button-${i}`).classList.remove('current-priority')
      }
      this.currentItems.forEach(item => {
        document
          .getElementById(`priority-button-${item.tag.priority || 0}`)
          .classList.add('current-priority')
      })
      this.updateLocation()
    }

    /**
     * Hides this pop-up.
     */
    hide() {
      this.div.style.opacity = '0'
      this.div.style.display = 'none'
    }

    /**
     * Changes the location of this pop-up to the location calculated by the
     * {@link PriorityPanel#labelModelParameter}.
     */
    updateLocation() {
      if (!this.currentItems || this.currentItems.length === 0) {
        return
      }
      const width = this.div.offsetWidth
      const height = this.div.offsetHeight
      const zoom = this.graphComponent.zoom

      let dummyLabel = null
      let labelModelParemeter = null
      if (yfiles.graph.IEdge.isInstance(this.currentItems[0])) {
        labelModelParemeter = new yfiles.graph.EdgePathLabelModel({
          autoRotation: false
        }).createDefaultParameter()
        dummyLabel = new yfiles.graph.SimpleLabel(this.currentItems[0], '', labelModelParemeter)
      } else if (yfiles.graph.INode.isInstance(this.currentItems[0])) {
        labelModelParemeter = yfiles.graph.ExteriorLabelModel.NORTH
        dummyLabel = new yfiles.graph.SimpleLabel(this.currentItems[0], '', labelModelParemeter)
      }
      if (labelModelParemeter.supports(dummyLabel)) {
        dummyLabel.preferredSize = new yfiles.geometry.Size(width / zoom, height / zoom)
        const { anchorX, anchorY } = labelModelParemeter.model.getGeometry(
          dummyLabel,
          labelModelParemeter
        )
        this.setLocation(anchorX, anchorY - height / zoom)
      }
    }

    /**
     * Sets the location of this pop-up to the given world coordinates.
     * @param {number} x
     * @param {number} y
     */
    setLocation(x, y) {
      // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
      const viewPoint = this.graphComponent.toViewCoordinates(new yfiles.geometry.Point(x, y))
      this.div.style.left = `${viewPoint.x}px`
      this.div.style.top = `${viewPoint.y}px`
    }

    /**
     * Callback for when the priority changed for a specific edge.
     * @param {yfiles.graph.IModelItem} item
     * @param {number} newPriority
     * @param {number} oldPriority
     */
    itemPriorityChanged(item, newPriority, oldPriority) {}

    /**
     * Callback for when the priority changed for some or all edges in the graph.
     */
    priorityChanged() {}
  }

  /**
   * Checks the given arrays for equality.
   * @param {Array} array1
   * @param {Array} array2
   */
  function equals(array1, array2) {
    if (array1 && array2) {
      if (array1.length === array2.length) {
        const a1 = array1.sort()
        const a2 = array2.sort()
        for (let i = 0; i < array1.length; i++) {
          if (a1[i] !== a2[i]) {
            return false
          }
        }
        return true
      }
    }
    return false
  }

  return PriorityPanel
})
