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

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * Adds a HTML panel on top of the contents of the GraphComponent that can display arbitrary information about a
   * graph item.
   *
   * In order to not interfere with the positioning of the pop-up, HTML content should be added as ancestor of the
   * {@link BpmnPopupSupport#div div element}, and use relative positioning. This implementation uses a
   * {@link yfiles.graph.ILabelModelParameter label model parameter} to determine the position of the pop-up.
   */
  class BpmnPopupSupport {
    /**
     * @param {yfiles.view.GraphComponent} graphComponent
     * @param {HTMLElement} div
     * @param {yfiles.graph.ILabelModelParameter} labelModelParameter
     */
    constructor(graphComponent, div, labelModelParameter) {
      this.graphComponent = graphComponent
      this.labelModelParameter = labelModelParameter

      this.divField = div
      div.style.display = 'none'
      this.currentItemField = null

      this.dirty = false

      this.registerListeners()
    }

    /**
     * Returns the pop-up div.
     * @type {Element}
     */
    get div() {
      return this.divField
    }

    /**
     * Gets the {@link yfiles.graph.IModelItem item} to display information for.
     * Setting this property to a value other than null shows the pop-up.
     * Setting the property to null hides the pop-up.
     * @type {yfiles.graph.IModelItem}
     */
    get currentItem() {
      return this.currentItemField
    }

    /**
     * Sets the {@link yfiles.graph.IModelItem item} to display information for.
     * Setting this property to a value other than null shows the pop-up.
     * Setting the property to null hides the pop-up.
     * @type {yfiles.graph.IModelItem}
     */
    set currentItem(value) {
      if (value === this.currentItemField) {
        return
      }
      this.currentItemField = value
      if (value !== null) {
        this.show()
      } else {
        this.hide()
      }
    }

    registerListeners() {
      // Add listener for viewport changes
      this.graphComponent.addViewportChangedListener((sender, propertyChangedEventArgs) => {
        if (this.currentItemField) {
          this.dirty = true
        }
      })

      // Add listeners for node bounds changes
      this.graphComponent.graph.addNodeLayoutChangedListener((sender, node, oldLayout) => {
        if (
          (this.currentItemField && this.currentItemField === node) ||
          (yfiles.graph.IEdge.isInstance(this.currentItemField) &&
            (node === this.currentItemField.sourcePort.owner ||
              node === this.currentItemField.targetPort.owner))
        ) {
          this.dirty = true
        }
      })

      // Add listener for updates of the visual tree
      this.graphComponent.addUpdatedVisualListener((sender, eventArgs) => {
        if (this.currentItemField && this.dirty) {
          this.dirty = false
          this.updateLocation()
        }
      })
    }

    /**
     * Makes this pop-up visible near the given item.
     */
    show() {
      this.divField.style.display = 'block'
      this.updateLocation()
    }

    /**
     * Hides this pop-up.
     */
    hide() {
      this.divField.style.display = 'none'
    }

    /**
     * Changes the location of this pop-up to the location calculated by the
     * {@link BpmnPopupSupport#labelModelParameter}. Currently, this implementation does not support rotated pop-ups.
     */
    updateLocation() {
      if (!this.currentItemField && !this.labelModelParameter) {
        return
      }
      const width = this.divField.clientWidth
      const height = this.divField.clientHeight
      const zoom = this.graphComponent.zoom

      const dummyLabel = new yfiles.graph.SimpleLabel(
        null,
        '',
        yfiles.graph.FreeNodeLabelModel.INSTANCE.createDefaultParameter()
      )
      dummyLabel.preferredSize = new yfiles.geometry.Size(width / zoom, height / zoom)

      if (yfiles.graph.ILabelOwner.isInstance(this.currentItemField)) {
        dummyLabel.owner = this.currentItemField
      } else if (yfiles.graph.IPort.isInstance(this.currentItemField)) {
        const location = this.currentItemField.location
        const newSimpleNode = new yfiles.graph.SimpleNode()
        newSimpleNode.layout = new yfiles.geometry.Rect(location.x - 10, location.y - 10, 20, 20)
        dummyLabel.owner = newSimpleNode
      }
      if (this.labelModelParameter.supports(dummyLabel)) {
        dummyLabel.layoutParameter = this.labelModelParameter
        const layout = this.labelModelParameter.model.getGeometry(
          dummyLabel,
          this.labelModelParameter
        )
        this.setLocation(layout.anchorX, layout.anchorY - height / zoom)
      }
    }

    /**
     * Sets the location of this pop-up to the given world coordinates.
     * @param {number} x The target x-coordinate of the pop-up.
     * @param {number} y The target y-coordinate of the pop-up.
     */
    setLocation(x, y) {
      // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
      const viewPoint = this.graphComponent.toViewCoordinates(new yfiles.geometry.Point(x, y))
      this.divField.style.left = `${viewPoint.x}px`
      this.divField.style.top = `${viewPoint.y}px`
    }
  }

  return BpmnPopupSupport
})
