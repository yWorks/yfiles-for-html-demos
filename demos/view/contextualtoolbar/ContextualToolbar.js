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

define([
  'yfiles/view-component',
  'resources/demo-app'
], /** @type {yfiles_namespace} */ /** typeof yfiles */ ((yfiles, app) => {
  /**
   * Adds a HTML panel on top of the contents of the GraphComponent that is used as a container for the contextual
   * toolbar.
   * In order to not interfere with the positioning of the pop-up, HTML content
   * should be added as ancestor of the {@link ContextualToolbar#div div element}, and
   * use relative positioning. This implementation uses a
   * {@link yfiles.graph.ILabelModelParameter label model parameter} to determine the position of the pop-up.
   * Additionally, this implementation expects the node, edge and label styles to be of
   * type {@link yfiles.styles.ShapeNodeStyle}, {@link yfiles.styles.PolylineEdgeStyle} and
   * {@link yfiles.styles.DefaultLabelStyle}.
   */
  class ContextualToolbar {
    /**
     * Sets the items to display the contextual toolbar for.
     * Setting this property to a value other than null shows the toolbar.
     * Setting the property to null hides the toolbar.
     * @type {yfiles.graph.IModelItem[]}
     */
    set selectedItems(array) {
      if (array === null) {
        // eslint-disable-next-line no-throw-literal
        throw "SelectedItems can't be null. To hide the toolbar, set an empty array."
      }
      this.$selectedItems = array
      this.$containsEdges = this.getSelectedEdges().length > 0
      this.$containsNodes = this.getSelectedNodes().length > 0
      this.$containsLabels = this.getSelectedLabels().length > 0
      if (array.length > 0) {
        this.show()
      } else {
        this.hide()
      }
    }

    /**
     * Gets the items to display information for.
     * @type {yfiles.graph.IModelItem[]}
     */
    get selectedItems() {
      return this.$selectedItems
    }

    /**
     * Constructs a new instance of the ContextualToolbar.
     * @param {yfiles.view.GraphComponent} graphComponent
     * @param {HTMLElement} container
     */
    constructor(graphComponent, container) {
      this.$graphComponent = graphComponent
      this.$container = container

      // initialize a label model parameter that is used to position the node pop-up
      const nodeLabelModel = new yfiles.graph.ExteriorLabelModel({ insets: 10 })
      this.$nodeLabelModelParameter = nodeLabelModel.createParameter(
        yfiles.graph.ExteriorLabelModelPosition.NORTH
      )

      // initialize a label model parameter that is used to position the edge pop-up
      const edgeLabelModel = new yfiles.graph.EdgePathLabelModel({ autoRotation: false })
      this.$edgeLabelModelParameter = edgeLabelModel.createDefaultParameter()

      this.$selectedItems = []
      this.$dirty = false

      this.registerUpdateListeners()
      this.registerClickListeners()
    }

    /**
     * Applies the font settings given by the parameter object to all selected labels.
     * @param {Object} parameterObject
     * @param {string|yfiles.view.Fill?} color
     */
    applyFontStyle(parameterObject, color) {
      const labels = this.getSelectedLabels()
      labels.forEach(label => {
        const clone = label.style.clone()
        if (color) {
          clone.textFill = color
        }
        clone.font = clone.font.createCopy(parameterObject)
        this.$graphComponent.graph.setStyle(label, clone)
      })
    }

    /**
     * Increases or decreases the font size by 2px.
     * @param {boolean} doIncrease
     */
    changeFontSize(doIncrease) {
      const labels = this.getSelectedLabels()
      labels.forEach(label => {
        const clone = label.style.clone()
        const fontSize = Math.max(
          2,
          doIncrease ? label.style.font.fontSize + 2 : label.style.font.fontSize - 2
        )
        clone.font = clone.font.createCopy({ fontSize })
        this.$graphComponent.graph.setStyle(label, clone)
      })
    }

    /**
     * Applies the given color and shape to the selected nodes.
     * @param {string?} color
     * @param {string|yfiles.styles.ShapeNodeShape?} shape
     */
    applyNodeStyle(color, shape) {
      const nodes = this.getSelectedNodes()
      nodes.forEach(node => {
        const clone = node.style.clone()
        if (color) {
          clone.fill = color
          clone.stroke = color
        }
        if (shape) {
          clone.shape = shape
        }
        this.$graphComponent.graph.setStyle(node, clone)
      })
    }

    /**
     * Applies the given color and arrow type to the selected edges.
     * @param {string|yfiles.view.Stroke?} color
     * @param {string|yfiles.styles.ArrowType?} sourceArrowType
     * @param {string|yfiles.styles.ArrowType?} targetArrowType
     */
    applyEdgeStyle(color, sourceArrowType, targetArrowType) {
      const edges = this.getSelectedEdges()
      edges.forEach(edge => {
        const clone = edge.style.clone()
        if (color) {
          const strokeClone = edge.style.stroke.cloneCurrentValue()
          strokeClone.fill = color
          clone.stroke = strokeClone
        }
        if (targetArrowType || (color && clone.targetArrow !== yfiles.styles.IArrow.NONE)) {
          const newArrow = new yfiles.styles.Arrow()
          newArrow.fill = clone.stroke.fill
          newArrow.type = targetArrowType || clone.targetArrow.type
          newArrow.scale = 1.5
          clone.targetArrow = newArrow
        }
        if (sourceArrowType || (color && clone.sourceArrow !== yfiles.styles.IArrow.NONE)) {
          const newArrow = new yfiles.styles.Arrow()
          newArrow.fill = clone.stroke.fill
          newArrow.type = sourceArrowType || clone.sourceArrow.type
          newArrow.scale = 1.5
          clone.sourceArrow = newArrow
        }
        this.$graphComponent.graph.setStyle(edge, clone)
      })
    }

    /**
     * Helper function to show/hide a picker container.
     * @param {Event} e The event of the toggle button.
     */
    showPickerContainer(e) {
      const toggleButton = e.target
      const pickerContainer = document.getElementById(e.target.getAttribute('data-container-id'))
      const show = toggleButton.checked

      if (!show) {
        this.hideAllPickerContainer()
        return
      }

      // hide all picker containers except for the one that should be toggled
      this.hideAllPickerContainer(toggleButton, pickerContainer)

      // position the container above/below the toggle button
      pickerContainer.style.display = 'block'
      const labelElement = document.querySelector(`label[for="${toggleButton.id}"]`)
      const labelBoundingRect = labelElement.getBoundingClientRect()
      const toolbarClientRect = this.$container.getBoundingClientRect()
      const pickerClientRect = pickerContainer.getBoundingClientRect()
      pickerContainer.style.left = `${labelBoundingRect.left +
        labelBoundingRect.width / 2 -
        pickerContainer.clientWidth / 2 -
        toolbarClientRect.left}px`
      const gcAnchor = this.$graphComponent.toPageFromView(new yfiles.geometry.Point(0, 0))
      if (toolbarClientRect.top - gcAnchor.y < pickerClientRect.height + 20) {
        pickerContainer.style.top = '55px'
        app.addClass(pickerContainer, 'bottom')
      } else {
        pickerContainer.style.top = `-${pickerClientRect.height + 12}px`
        app.removeClass(pickerContainer, 'bottom')
      }

      // timeout the fading animation to make sure that the element is visible
      setTimeout(() => {
        pickerContainer.style.opacity = '1'
      }, 0)
    }

    /**
     * Closes all picker containers except for the given elements.
     * @param {HTMLInputElement?} exceptToggleButton The container toggle that should not be closed.
     * @param {HTMLElement?} exceptContainer The container that should not be closed.
     */
    hideAllPickerContainer(exceptToggleButton, exceptContainer) {
      const toggleButtons = document.querySelectorAll('input[data-container-id]')
      for (let i = 0; i < toggleButtons.length; i++) {
        const btn = toggleButtons[i]
        if (btn !== exceptToggleButton) {
          btn.checked = false
        }
      }

      const pickerContainers = document.querySelectorAll('.picker-container')
      for (let i = 0; i < pickerContainers.length; i++) {
        const container = pickerContainers[i]
        if (container.style.opacity !== '0' && container !== exceptContainer) {
          container.style.opacity = '0'
          setTimeout(() => {
            container.style.display = 'none'
          }, 300)
        }
      }
    }

    /**
     * Returns an array of the currently selected edges.
     * @returns {yfiles.graph.IEdge[]}
     */
    getSelectedEdges() {
      return this.selectedItems.filter(item => yfiles.graph.IEdge.isInstance(item))
    }

    /**
     * Returns an array of the currently selected nodes.
     * @returns {yfiles.graph.INode[]}
     */
    getSelectedNodes() {
      return this.selectedItems.filter(item => yfiles.graph.INode.isInstance(item))
    }

    /**
     * Returns an array of the currently selected labels.
     * @returns {yfiles.graph.ILabel[]}
     */
    getSelectedLabels() {
      const labels = []
      this.selectedItems.forEach(item => {
        if (yfiles.graph.ILabel.isInstance(item)) {
          labels.push(item)
        } else if (yfiles.graph.INode.isInstance(item) || yfiles.graph.IEdge.isInstance(item)) {
          item.labels.forEach(label => {
            labels.push(label)
          })
        }
      })
      return labels
    }

    /**
     * Shows or hides the user interface elements for the different item types depending on the current selection.
     */
    updateItemUI() {
      const nodeUI = document.getElementById('node-ui')
      const labelUI = document.getElementById('label-ui')
      const edgeUI = document.getElementById('edge-ui')
      if (this.$containsNodes) {
        app.addClass(this.$container, 'node-ui-visible')
        nodeUI.style.display = 'inline-block'
      } else {
        app.removeClass(this.$container, 'node-ui-visible')
        nodeUI.style.display = 'none'
      }
      if (this.$containsLabels) {
        app.addClass(this.$container, 'label-ui-visible')
        labelUI.style.display = 'inline-block'
      } else {
        app.removeClass(this.$container, 'label-ui-visible')
        labelUI.style.display = 'none'
      }
      if (this.$containsEdges) {
        app.addClass(this.$container, 'edge-ui-visible')
        edgeUI.style.display = 'inline-block'
      } else {
        app.removeClass(this.$container, 'edge-ui-visible')
        edgeUI.style.display = 'none'
      }
    }

    /**
     * Updates the label controls depending on the selection.
     * If multiple labels are selected, we just take the state of the first label, for simplicity.
     */
    updateLabelControlState() {
      const labels = this.getSelectedLabels()
      if (labels.length > 0) {
        const firstLabel = labels[0]
        const fontBoldToggle = document.getElementById('font-bold')
        fontBoldToggle.checked = firstLabel.style.font.fontWeight === yfiles.view.FontWeight.BOLD
        const fontItalicToggle = document.getElementById('font-italic')
        fontItalicToggle.checked = firstLabel.style.font.fontStyle === yfiles.view.FontStyle.ITALIC
        const fontUnderlineToggle = document.getElementById('font-underline')
        fontUnderlineToggle.checked =
          firstLabel.style.font.textDecoration === yfiles.view.TextDecoration.UNDERLINE
      }
    }

    /**
     * Makes this toolbar visible near the given items.
     */
    show() {
      clearTimeout(this.$hideTimer)
      this.$container.style.display = 'block'

      // we hide the picker containers such that we don't need to update their position if new elements are added to
      // the toolbar
      this.hideAllPickerContainer()

      // show hide UI for nodes and/or labels
      this.updateItemUI()

      // maybe initialize some label UI elements to match the current label style
      this.updateLabelControlState()

      // place the contextual toolbar
      this.updateLocation()

      this.$container.style.opacity = '1'
    }

    /**
     * Hides this toolbar.
     */
    hide() {
      this.hideAllPickerContainer()
      this.$container.style.opacity = '0'
      // Remove the entire toolbar from the document flow otherwise it will block mouse events. However, we still want
      // to fade it out first.
      this.$hideTimer = setTimeout(() => {
        this.$container.style.display = 'none'
      }, 300)
    }

    /**
     * Changes the location of toolbar to the location calculated by a label model parameter.
     * Depending on the selection, either an edge specific label model is used, or a node label model
     * that uses the union of all selected elements to place the toolbar above that union.
     */
    updateLocation() {
      if (this.selectedItems.length === 0) {
        return
      }
      const width = this.$container.clientWidth
      const height = this.$container.clientHeight
      const zoom = this.$graphComponent.zoom

      let dummyOwner
      let labelModelParameter

      if (this.$containsEdges && !this.$containsNodes) {
        // if only edges are selected, we want to use the first edge as position reference
        dummyOwner = this.selectedItems.find(item => yfiles.graph.IEdge.isInstance(item))
        labelModelParameter = this.$edgeLabelModelParameter
      } else {
        // if nodes and edges are selected, we use the union of the node's bounding boxes as position reference
        dummyOwner = new yfiles.graph.SimpleNode({
          layout: this.getEnclosingRect()
        })
        labelModelParameter = this.$nodeLabelModelParameter
      }

      // create a dummy label to let the LabelModelParameter compute the correct location
      const dummyLabel = new yfiles.graph.SimpleLabel(dummyOwner, '', labelModelParameter)
      if (labelModelParameter.supports(dummyLabel)) {
        dummyLabel.preferredSize = new yfiles.geometry.Size(width / zoom, height / zoom)
        const newLayout = labelModelParameter.model.getGeometry(dummyLabel, labelModelParameter)
        this.setLocation(newLayout.anchorX, newLayout.anchorY - (height + 10) / zoom, width, height)
      }
    }

    /**
     * Returns the union rectangle of the selected nodes and labels.
     */
    getEnclosingRect() {
      const enclosingRect = new yfiles.geometry.MutableRectangle()
      this.selectedItems.forEach(item => {
        if (!yfiles.graph.IEdge.isInstance(item)) {
          // we need the axis-parallel bounding rectangle, thus look out for oriented rectangles of the labels
          const bounds = yfiles.geometry.IOrientedRectangle.isInstance(item.layout)
            ? item.layout.bounds
            : item.layout
          enclosingRect.setToUnion(enclosingRect, bounds)
        }
      })
      return enclosingRect
    }

    /**
     * Sets the location of this pop-up to the given world coordinates.
     * @param {number} x The target x-coordinate of the toolbar
     * @param {number} y The target y-coordinate of the toolbar
     * @param {number} width The width of the toolbar
     * @param {number} height The height of the toolbar
     */
    setLocation(x, y, width, height) {
      // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
      const viewPoint = this.$graphComponent.toViewCoordinates(new yfiles.geometry.Point(x, y))
      const gcSize = this.$graphComponent.innerSize
      const padding = 15
      const left = Math.min(gcSize.width - width - padding, Math.max(padding, viewPoint.x))
      const top = Math.min(gcSize.height - height - padding, Math.max(padding, viewPoint.y))
      this.$container.style.left = `${left}px`
      this.$container.style.top = `${top}px`
    }

    /**
     * Adds listeners for graph changes, to update the location or state of the toolbar accordingly.
     */
    registerUpdateListeners() {
      this.$graphComponent.addViewportChangedListener(() => {
        if (this.selectedItems.length > 0) {
          this.$dirty = true
        }
      })
      this.$graphComponent.graph.addNodeLayoutChangedListener(() => {
        if (this.selectedItems.length > 0) {
          this.$dirty = true
        }
      })
      this.$graphComponent.addUpdatedVisualListener(() => {
        if (this.selectedItems.length > 0 && this.$dirty) {
          this.$dirty = false
          this.updateLocation()
        }
      })
      this.$graphComponent.graph.undoEngine.addUnitUndoneListener(() =>
        this.updateLabelControlState()
      )
      this.$graphComponent.graph.undoEngine.addUnitRedoneListener(() =>
        this.updateLabelControlState()
      )
      this.$graphComponent.clipboard.addElementsCutListener(() => this.hide())
    }

    /**
     * Wire up the functions of the contextual toolbar.
     */
    registerClickListeners() {
      app.bindAction('#clipboard', e => this.showPickerContainer(e))
      app.bindAction('#color-picker', e => this.showPickerContainer(e))
      app.bindAction('#shape-picker', e => this.showPickerContainer(e))
      app.bindAction('#font-color-picker', e => this.showPickerContainer(e))
      app.bindAction('#edge-color-picker', e => this.showPickerContainer(e))
      app.bindAction('#source-arrow-picker', e => {
        document.getElementById('target-arrow-picker').checked = false
        const pickerContainer = document.getElementById(e.target.getAttribute('data-container-id'))
        app.removeClass(pickerContainer, 'target')
        this.showPickerContainer(e)
      })
      app.bindAction('#target-arrow-picker', e => {
        document.getElementById('source-arrow-picker').checked = false
        const pickerContainer = document.getElementById(e.target.getAttribute('data-container-id'))
        app.addClass(pickerContainer, 'target')
        this.showPickerContainer(e)
      })

      app.bindActions('#color-picker-colors > button', e => {
        const color = e.target.getAttribute('data-color')
        this.applyNodeStyle(color)
      })

      app.bindActions('#font-color-picker-colors > button', e => {
        const color = e.target.getAttribute('data-color')
        this.applyFontStyle({}, color)
      })

      app.bindActions('#shape-picker-shapes > button', e => {
        const shape = e.target.getAttribute('data-shape')
        this.applyNodeStyle(null, shape)
      })

      app.bindActions('#arrow-picker-types > button', e => {
        const arrowType = e.target.getAttribute('data-type')
        const isTarget = app.hasClass(e.target.parentElement, 'target')
        if (isTarget) {
          this.applyEdgeStyle(null, null, arrowType)
        } else {
          this.applyEdgeStyle(null, arrowType, null)
        }
      })

      app.bindActions('#edge-colors > button', e => {
        const color = e.target.getAttribute('data-color')
        this.applyEdgeStyle(color)
      })

      app.bindAction('#font-bold', e => {
        this.hideAllPickerContainer()
        this.applyFontStyle({
          fontWeight: e.target.checked ? e.target.getAttribute('data-fontWeight') : 'normal'
        })
      })
      app.bindAction('#font-italic', e => {
        this.hideAllPickerContainer()
        this.applyFontStyle({
          fontStyle: e.target.checked ? e.target.getAttribute('data-fontStyle') : 'normal'
        })
      })
      app.bindAction('#font-underline', e => {
        this.hideAllPickerContainer()
        this.applyFontStyle({
          textDecoration: e.target.checked ? e.target.getAttribute('data-textDecoration') : 'none'
        })
      })
      app.bindAction('#decrease-font-size', () => {
        this.hideAllPickerContainer()
        this.changeFontSize(false)
      })
      app.bindAction('#increase-font-size', () => {
        this.hideAllPickerContainer()
        this.changeFontSize(true)
      })

      const iCommand = yfiles.input.ICommand
      app.bindCommand("div[data-command='Cut']", iCommand.CUT, this.$graphComponent)
      app.bindCommand("div[data-command='Duplicate']", iCommand.DUPLICATE, this.$graphComponent)
      app.bindCommand("div[data-command='Delete']", iCommand.DELETE, this.$graphComponent)
      // we don't use the bindCommand helper for some buttons, because we want to close the picker container after the
      // command was executed
      const pasteButton = document.querySelector("div[data-command='Paste']")
      iCommand.PASTE.addCanExecuteChangedListener(() => {
        if (iCommand.PASTE.canExecute(null, this.$graphComponent)) {
          pasteButton.removeAttribute('disabled')
        } else {
          pasteButton.setAttribute('disabled', 'disabled')
        }
      })
      pasteButton.addEventListener('click', () => {
        if (iCommand.PASTE.canExecute(null, this.$graphComponent)) {
          iCommand.PASTE.execute(null, this.$graphComponent)
          this.hideAllPickerContainer()
        }
      })
      const copyButton = document.querySelector("div[data-command='Copy']")
      iCommand.COPY.addCanExecuteChangedListener(() => {
        if (iCommand.COPY.canExecute(null, this.$graphComponent)) {
          copyButton.removeAttribute('disabled')
        } else {
          copyButton.setAttribute('disabled', 'disabled')
        }
      })
      copyButton.addEventListener('click', () => {
        if (iCommand.COPY.canExecute(null, this.$graphComponent)) {
          iCommand.COPY.execute(null, this.$graphComponent)
          this.hideAllPickerContainer()
        }
      })
    }
  }

  return ContextualToolbar
}))
