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
import type { ArrowTypeStringValues, ShapeNodeShapeStringValues } from 'yfiles'
import {
  ArcEdgeStyle,
  Arrow,
  DefaultLabelStyle,
  EdgePathLabelModel,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  FontStyle,
  FontWeight,
  GraphComponent,
  ICommand,
  IEdge,
  ILabel,
  ILabelModelParameter,
  ILabelOwner,
  IModelItem,
  INode,
  IOrientedRectangle,
  MutableRectangle,
  Point,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle,
  SimpleLabel,
  SimpleNode,
  Size,
  Stroke,
  TextDecoration
} from 'yfiles'

import { bindYFilesCommand } from 'demo-resources/demo-page'

// we use font-awesome icons for the toolbar in this demo
import '@fortawesome/fontawesome-free/js/all.min.js'

/**
 * Adds a HTML panel on top of the contents of the GraphComponent that is used as a container for the contextual
 * toolbar.
 * In order to not interfere with the positioning of the pop-up, HTML content
 * should be added as ancestor of the {@link ContextualToolbar.div div element}, and
 * use relative positioning. This implementation uses a
 * {@link ILabelModelParameter label model parameter} to determine the position of the pop-up.
 * Additionally, this implementation expects the node, edge and label styles to be of
 * type {@link ShapeNodeStyle}, {@link PolylineEdgeStyle} and
 * {@link DefaultLabelStyle}.
 */
export default class ContextualToolbar {
  private _selectedItems: IModelItem[]
  private containsEdges = false
  private containsNodes = false
  private containsLabels = false
  private readonly graphComponent: GraphComponent
  private readonly container: HTMLElement
  private readonly nodeLabelModelParameter: ILabelModelParameter
  private readonly edgeLabelModelParameter: ILabelModelParameter
  private dirty = false
  // Remove the entire toolbar from the document flow otherwise it will block mouse events. However, we still want
  // to fade it out first.
  private hideTimer: any

  /**
   * Sets the items to display the contextual toolbar for.
   * Setting this property to a value other than null shows the toolbar.
   * Setting the property to null hides the toolbar.
   */
  set selectedItems(array: IModelItem[]) {
    if (!array) {
      throw "SelectedItems can't be null. To hide the toolbar, set an empty array."
    }
    this._selectedItems = array
    this.containsEdges = this.getSelectedEdges().length > 0
    this.containsNodes = this.getSelectedNodes().length > 0
    this.containsLabels = this.getSelectedLabels().length > 0
    if (array.length > 0) {
      this.show()
    } else {
      this.hide()
    }
  }

  /**
   * Gets the items to display information for.
   */
  get selectedItems(): IModelItem[] {
    return this._selectedItems
  }

  /**
   * Constructs a new instance of the ContextualToolbar.
   */
  constructor(graphComponent: GraphComponent, container: HTMLElement) {
    this.graphComponent = graphComponent
    this.container = container

    // initialize a label model parameter that is used to position the node pop-up
    const nodeLabelModel = new ExteriorLabelModel({ insets: 10 })
    this.nodeLabelModelParameter = nodeLabelModel.createParameter(ExteriorLabelModelPosition.NORTH)

    // initialize a label model parameter that is used to position the edge pop-up
    const edgeLabelModel = new EdgePathLabelModel({ autoRotation: false })
    this.edgeLabelModelParameter = edgeLabelModel.createDefaultParameter()

    this._selectedItems = []

    this.registerUpdateListeners()
    this.registerClickListeners()
  }

  /**
   * Applies the font settings given by the parameter object to all selected labels.
   */
  applyFontStyle(parameterObject: object, color?: any): void {
    const labels = this.getSelectedLabels()
    for (const label of labels) {
      const clone = label.style.clone() as DefaultLabelStyle
      if (color) {
        clone.textFill = color
      }
      clone.font = clone.font.createCopy(parameterObject)
      this.graphComponent.graph.setStyle(label, clone)
    }
  }

  /**
   * Increases or decreases the font size by 2px.
   */
  changeFontSize(doIncrease: boolean): void {
    const labels = this.getSelectedLabels()
    for (const label of labels) {
      const clone = label.style.clone() as DefaultLabelStyle
      let fontSize = clone.font.fontSize
      fontSize = Math.max(2, doIncrease ? fontSize + 2 : fontSize - 2)
      clone.font = clone.font.createCopy({ fontSize })
      this.graphComponent.graph.setStyle(label, clone)
    }
  }

  /**
   * Applies the given color and shape to the selected nodes.
   */
  applyNodeStyle(color: string | null, shape?: ShapeNodeShapeStringValues | null): void {
    const nodes = this.getSelectedNodes()
    for (const node of nodes) {
      const style = node.style as ShapeNodeStyle
      const clone = new ShapeNodeStyle({
        fill: color || style.fill,
        stroke: color || style.stroke,
        shape: shape || style.shape
      })
      this.graphComponent.graph.setStyle(node, clone)
    }
  }

  /**
   * Creates a new node next to the current node and connects both nodes with an edge.
   */
  createConnectedNode(): void {
    const nodes = this.getSelectedNodes()
    const newSelection: INode[] = []
    for (const node of nodes) {
      const graph = this.graphComponent.graph
      const clone = node.style.clone()
      const location = this.getConnectedNodeLocation(node)
      const newNode = graph.createNode(
        [location.x, location.y, node.layout.width, node.layout.height],
        clone
      )
      graph.createEdge(node, newNode)
      newSelection.push(newNode)
    }
    this.graphComponent.selection.clear()
    newSelection.forEach((item) => this.graphComponent.selection.setSelected(item, true))
  }

  /**
   * Finds a location for the new node that doesn't overlap with other nodes.
   */
  getConnectedNodeLocation(originalNode: INode): Point {
    const originalLayout = originalNode.layout
    const nodes = this.graphComponent.graph.nodes
    const stepSize = 70
    for (let i = 1; i < 10; i++) {
      for (let j: number = i * stepSize; j >= -i * stepSize; j -= stepSize) {
        for (let k: number = -i * stepSize; k <= i * stepSize; k += stepSize) {
          const newLayout = new Rect(
            originalLayout.x + k,
            originalLayout.y + j,
            originalLayout.width,
            originalLayout.height
          )
          const noOverlaps = nodes.every((node) => {
            const layout = node.layout
            return (
              layout.x + layout.width < newLayout.x ||
              layout.x > newLayout.x + newLayout.width ||
              layout.y + layout.width < newLayout.y ||
              layout.y > newLayout.y + newLayout.height
            )
          })
          if (noOverlaps) {
            return newLayout.topLeft
          }
        }
      }
    }
    return new Point(originalLayout.x + stepSize, originalLayout.y)
  }

  /**
   * Applies the given color and arrow type to the selected edges.
   */
  applyEdgeStyle(
    color: string | null,
    sourceArrowType: ArrowTypeStringValues | null,
    targetArrowType: ArrowTypeStringValues | null
  ): void {
    for (const edge of this.getSelectedEdges()) {
      const oldStyle = edge.style as PolylineEdgeStyle | ArcEdgeStyle
      const oldStroke = oldStyle.stroke!
      const oldSourceArrow = oldStyle.sourceArrow as Arrow
      const oldTargetArrow = oldStyle.targetArrow as Arrow

      const newStyle = oldStyle.clone()
      newStyle.stroke = new Stroke({
        fill: color || oldStroke.fill,
        thickness: oldStroke.thickness
      })
      newStyle.sourceArrow = new Arrow({
        type: sourceArrowType || oldSourceArrow.type,
        fill: color || oldStroke.fill,
        scale: 1.5
      })
      newStyle.targetArrow = new Arrow({
        type: targetArrowType || oldTargetArrow.type,
        fill: color || oldStroke.fill,
        scale: 1.5
      })

      this.graphComponent.graph.setStyle(edge, newStyle)
    }
  }

  /**
   * Helper function to show/hide a picker container.
   * @param e The event of the toggle button.
   */
  showPickerContainer(e: Event): void {
    const toggleButton = e.target as HTMLInputElement
    const dataContainerId = toggleButton.getAttribute('data-container-id')!
    const pickerContainer = document.querySelector<HTMLElement>('#' + dataContainerId)!
    const show = toggleButton.checked

    if (!show) {
      this.hideAllPickerContainer()
      return
    }

    // hide all picker containers except for the one that should be toggled
    this.hideAllPickerContainer(toggleButton, pickerContainer)

    // position the container above/below the toggle button
    pickerContainer.style.display = 'block'
    const labelElement = document.querySelector<HTMLLabelElement>(
      `label[for="${toggleButton.id}"]`
    )!
    const labelBoundingRect = labelElement.getBoundingClientRect()
    const toolbarClientRect = this.container.getBoundingClientRect()
    const pickerClientRect = pickerContainer.getBoundingClientRect()
    pickerContainer.style.left = `${
      labelBoundingRect.left +
      labelBoundingRect.width / 2 -
      pickerContainer.clientWidth / 2 -
      toolbarClientRect.left
    }px`
    const gcAnchor = this.graphComponent.toPageFromView(new Point(0, 0))
    if (toolbarClientRect.top - gcAnchor.y < pickerClientRect.height + 20) {
      pickerContainer.style.top = '55px'
      pickerContainer.classList.add('bottom')
    } else {
      pickerContainer.style.top = `-${pickerClientRect.height + 12}px`
      pickerContainer.classList.remove('bottom')
    }

    // timeout the fading animation to make sure that the element is visible
    setTimeout(() => {
      pickerContainer.style.opacity = '1'
    }, 0)
  }

  /**
   * Closes all picker containers except for the given elements.
   * @param exceptToggleButton The container toggle that should not be closed.
   * @param exceptContainer The container that should not be closed.
   */
  hideAllPickerContainer(
    exceptToggleButton?: HTMLInputElement,
    exceptContainer?: HTMLElement
  ): void {
    const toggleButtons = document.querySelectorAll<HTMLInputElement>('input[data-container-id]')
    for (let i = 0; i < toggleButtons.length; i++) {
      const btn = toggleButtons[i]
      if (btn !== exceptToggleButton) {
        btn.checked = false
      }
    }

    const pickerContainers = document.querySelectorAll<HTMLElement>('.picker-container')
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
   */
  getSelectedEdges(): IEdge[] {
    return this.selectedItems.filter((item) => item instanceof IEdge) as IEdge[]
  }

  /**
   * Returns an array of the currently selected nodes.
   */
  getSelectedNodes(): INode[] {
    return this.selectedItems.filter((item) => item instanceof INode) as INode[]
  }

  /**
   * Returns an array of the currently selected labels.
   */
  getSelectedLabels(): ILabel[] {
    const labels: ILabel[] = []
    for (const item of this.selectedItems) {
      if (item instanceof ILabel) {
        labels.push(item)
      } else if (item instanceof ILabelOwner) {
        labels.push(...item.labels)
      }
    }
    return labels
  }

  /**
   * Shows or hides the user interface elements for the different item types depending on the current selection.
   */
  updateItemUI(): void {
    const nodeUI = document.querySelector<HTMLElement>('#node-ui')!
    const labelUI = document.querySelector<HTMLElement>('#label-ui')!
    const edgeUI = document.querySelector<HTMLElement>('#edge-ui')!
    if (this.containsNodes) {
      this.container.classList.add('node-ui-visible')
      nodeUI.style.display = 'inline-block'
    } else {
      this.container.classList.remove('node-ui-visible')
      nodeUI.style.display = 'none'
    }
    if (this.containsLabels) {
      this.container.classList.add('label-ui-visible')
      labelUI.style.display = 'inline-block'
    } else {
      this.container.classList.remove('label-ui-visible')
      labelUI.style.display = 'none'
    }
    if (this.containsEdges) {
      this.container.classList.add('edge-ui-visible')
      edgeUI.style.display = 'inline-block'
    } else {
      this.container.classList.remove('edge-ui-visible')
      edgeUI.style.display = 'none'
    }
  }

  /**
   * Updates the label controls depending on the selection.
   * If multiple labels are selected, we just take the state of the first label, for simplicity.
   */
  updateLabelControlState(): void {
    const labels = this.getSelectedLabels()
    if (labels.length > 0) {
      const font = (labels[0].style as DefaultLabelStyle).font
      const fontBoldToggle = document.querySelector<HTMLInputElement>('#font-bold')!
      fontBoldToggle.checked = font.fontWeight === FontWeight.BOLD
      const fontItalicToggle = document.querySelector<HTMLInputElement>('#font-italic')!
      fontItalicToggle.checked = font.fontStyle === FontStyle.ITALIC
      const fontUnderlineToggle = document.querySelector<HTMLInputElement>('#font-underline')!
      fontUnderlineToggle.checked = font.textDecoration === TextDecoration.UNDERLINE
    }
  }

  /**
   * Makes this toolbar visible near the given items.
   */
  show() {
    clearTimeout(this.hideTimer)
    this.container.style.display = 'block'

    // we hide the picker containers such that we don't need to update their position if new elements are added to
    // the toolbar
    this.hideAllPickerContainer()

    // show hide UI for nodes and/or labels
    this.updateItemUI()

    // maybe initialize some label UI elements to match the current label style
    this.updateLabelControlState()

    // place the contextual toolbar
    this.updateLocation()

    this.container.style.opacity = '1'
  }

  /**
   * Hides this toolbar.
   */
  hide() {
    this.hideAllPickerContainer()
    this.container.style.opacity = '0'
    // Remove the entire toolbar from the document flow otherwise it will block mouse events. However, we still want
    // to fade it out first.
    this.hideTimer = setTimeout(() => {
      this.container.style.display = 'none'
    }, 300)
  }

  /**
   * Changes the location of toolbar to the location calculated by a label model parameter.
   * Depending on the selection, either an edge specific label model is used, or a node label model
   * that uses the union of all selected elements to place the toolbar above that union.
   */
  updateLocation(): void {
    if (this.selectedItems.length === 0) {
      return
    }
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    const zoom = this.graphComponent.zoom

    let dummyOwner: ILabelOwner
    let labelModelParameter: ILabelModelParameter

    if (this.containsEdges && !this.containsNodes) {
      // if only edges are selected, we want to use the first edge as position reference
      dummyOwner = this.selectedItems.find((item) => item instanceof IEdge) as IEdge
      labelModelParameter = this.edgeLabelModelParameter
    } else {
      // if nodes and edges are selected, we use the union of the node's bounding boxes as position reference
      dummyOwner = new SimpleNode({
        layout: this.getEnclosingRect()
      })
      labelModelParameter = this.nodeLabelModelParameter
    }

    // create a dummy label to let the LabelModelParameter compute the correct location
    const dummyLabel = new SimpleLabel(dummyOwner, '', labelModelParameter)
    if (labelModelParameter.supports(dummyLabel)) {
      dummyLabel.preferredSize = new Size(width / zoom, height / zoom)
      const newLayout = labelModelParameter.model.getGeometry(dummyLabel, labelModelParameter)
      this.setLocation(newLayout.anchorX, newLayout.anchorY - (height + 10) / zoom, width, height)
    }
  }

  /**
   * Returns the union rectangle of the selected nodes and labels.
   */
  getEnclosingRect(): MutableRectangle {
    const enclosingRect = new MutableRectangle()
    for (const item of this.selectedItems) {
      if (item instanceof INode || item instanceof ILabel) {
        // we need the axis-parallel bounding rectangle, thus look out for oriented rectangles of the labels
        const bounds = item.layout instanceof IOrientedRectangle ? item.layout.bounds : item.layout
        enclosingRect.setToUnion(enclosingRect, bounds)
      }
    }
    return enclosingRect
  }

  /**
   * Sets the location of this pop-up to the given world coordinates.
   * @param x The target x-coordinate of the toolbar
   * @param y The target y-coordinate of the toolbar
   * @param width The width of the toolbar
   * @param height The height of the toolbar
   */
  setLocation(x: number, y: number, width: number, height: number): void {
    // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
    const viewPoint = this.graphComponent.toViewCoordinates(new Point(x, y))
    const gcSize = this.graphComponent.innerSize
    const padding = 15
    const left = Math.min(gcSize.width - width - padding, Math.max(padding, viewPoint.x))
    const top = Math.min(gcSize.height - height - padding, Math.max(padding, viewPoint.y))
    this.container.style.left = `${left}px`
    this.container.style.top = `${top}px`
  }

  /**
   * Adds listeners for graph changes, to update the location or state of the toolbar accordingly.
   */
  registerUpdateListeners(): void {
    this.graphComponent.addViewportChangedListener(() => {
      if (this.selectedItems.length > 0) {
        this.dirty = true
      }
    })
    this.graphComponent.graph.addNodeLayoutChangedListener(() => {
      if (this.selectedItems.length > 0) {
        this.dirty = true
      }
    })
    this.graphComponent.addUpdatedVisualListener(() => {
      if (this.selectedItems.length > 0 && this.dirty) {
        this.dirty = false
        this.updateLocation()
      }
    })
    this.graphComponent.graph.undoEngine!.addUnitUndoneListener(() =>
      this.updateLabelControlState()
    )
    this.graphComponent.graph.undoEngine!.addUnitRedoneListener(() =>
      this.updateLabelControlState()
    )
    this.graphComponent.clipboard.addElementsCutListener(() => this.hide())
  }

  /**
   * Wire up the functions of the contextual toolbar.
   */
  registerClickListeners(): void {
    document
      .querySelector('#clipboard')
      ?.addEventListener('click', (e) => this.showPickerContainer(e))
    document
      .querySelector('#color-picker')
      ?.addEventListener('click', (e) => this.showPickerContainer(e))
    document
      .querySelector('#shape-picker')
      ?.addEventListener('click', (e) => this.showPickerContainer(e))
    document
      .querySelector('#font-color-picker')
      ?.addEventListener('click', (e) => this.showPickerContainer(e))
    document
      .querySelector('#edge-color-picker')
      ?.addEventListener('click', (e) => this.showPickerContainer(e))
    const sourceArrowPicker = document.querySelector<HTMLInputElement>('#source-arrow-picker')
    const targetArrowPicker = document.querySelector<HTMLInputElement>('#target-arrow-picker')
    sourceArrowPicker?.addEventListener('click', (e) => {
      targetArrowPicker!.checked = false
      const pickerContainer = document.getElementById(
        sourceArrowPicker.getAttribute('data-container-id')!
      )!
      pickerContainer.classList.remove('target')
      this.showPickerContainer(e)
    })
    targetArrowPicker?.addEventListener('click', (e) => {
      sourceArrowPicker!.checked = false
      const pickerContainer = document.getElementById(
        targetArrowPicker.getAttribute('data-container-id')!
      )!
      pickerContainer.classList.add('target')
      this.showPickerContainer(e)
    })

    for (const button of document.querySelectorAll<HTMLInputElement>(
      '#color-picker-colors > button'
    )) {
      button.addEventListener('click', (e) => {
        const color = button.getAttribute('data-color')
        this.applyNodeStyle(color)
      })
    }

    for (const button of document.querySelectorAll<HTMLInputElement>(
      '#font-color-picker-colors > button'
    )) {
      button.addEventListener('click', (e) => {
        const color = button.getAttribute('data-color')
        this.applyFontStyle({}, color)
      })
    }

    for (const button of document.querySelectorAll<HTMLInputElement>(
      '#shape-picker-shapes > button'
    )) {
      button.addEventListener('click', (e) => {
        const shape = button.getAttribute('data-shape') as ShapeNodeShapeStringValues | null
        this.applyNodeStyle(null, shape)
      })
    }

    document
      .querySelector('#quick-element-creation')
      ?.addEventListener('click', () => this.createConnectedNode())

    for (const button of document.querySelectorAll<HTMLInputElement>(
      '#arrow-picker-types > button'
    )) {
      button.addEventListener('click', (e) => {
        const arrowType = button.getAttribute('data-type') as ArrowTypeStringValues | null
        const isTarget = button.parentElement!.classList.contains('target')
        if (isTarget) {
          this.applyEdgeStyle(null, null, arrowType)
        } else {
          this.applyEdgeStyle(null, arrowType, null)
        }
      })
    }

    for (const button of document.querySelectorAll<HTMLInputElement>('#edge-colors > button')) {
      button.addEventListener('click', (e) => {
        const color = button.getAttribute('data-color')
        this.applyEdgeStyle(color, null, null)
      })
    }

    document.querySelector('#font-bold')?.addEventListener('click', (e) => {
      this.hideAllPickerContainer()
      const target = e.target as HTMLInputElement
      this.applyFontStyle({
        fontWeight: target.checked ? target.getAttribute('data-fontWeight')! : 'normal'
      })
    })
    document.querySelector('#font-italic')?.addEventListener('click', (e) => {
      this.hideAllPickerContainer()
      const target = e.target as HTMLInputElement
      this.applyFontStyle({
        fontStyle: target.checked ? target.getAttribute('data-fontStyle')! : 'normal'
      })
    })
    document.querySelector('#font-underline')?.addEventListener('click', (e) => {
      this.hideAllPickerContainer()
      const target = e.target as HTMLInputElement
      this.applyFontStyle({
        textDecoration: target.checked ? target.getAttribute('data-textDecoration')! : 'none'
      })
    })
    document.querySelector('#decrease-font-size')?.addEventListener('click', () => {
      this.hideAllPickerContainer()
      this.changeFontSize(false)
    })
    document.querySelector('#increase-font-size')?.addEventListener('click', () => {
      this.hideAllPickerContainer()
      this.changeFontSize(true)
    })

    bindYFilesCommand('#cut-button', ICommand.CUT, this.graphComponent, null, '')
    bindYFilesCommand('#duplicate-button', ICommand.DUPLICATE, this.graphComponent, null, '')
    bindYFilesCommand('#delete-button', ICommand.DELETE, this.graphComponent, null, '')

    // we don't use the bindYFilesCommand helper for some buttons, because we want to close the picker container after the
    // command was executed
    const pasteButton = document.querySelector<HTMLDivElement>('#paste-button')!
    ICommand.PASTE.addCanExecuteChangedListener(() => {
      if (ICommand.PASTE.canExecute(null, this.graphComponent)) {
        pasteButton.removeAttribute('disabled')
      } else {
        pasteButton.setAttribute('disabled', 'disabled')
      }
    })
    pasteButton.addEventListener('click', () => {
      if (ICommand.PASTE.canExecute(null, this.graphComponent)) {
        ICommand.PASTE.execute(null, this.graphComponent)
        this.hideAllPickerContainer()
      }
    })
    const copyButton = document.querySelector<HTMLDivElement>('#copy-button')!
    ICommand.COPY.addCanExecuteChangedListener(() => {
      if (ICommand.COPY.canExecute(null, this.graphComponent)) {
        copyButton.removeAttribute('disabled')
      } else {
        copyButton.setAttribute('disabled', 'disabled')
      }
    })
    copyButton.addEventListener('click', () => {
      if (ICommand.COPY.canExecute(null, this.graphComponent)) {
        ICommand.COPY.execute(null, this.graphComponent)
        this.hideAllPickerContainer()
      }
    })
  }
}
