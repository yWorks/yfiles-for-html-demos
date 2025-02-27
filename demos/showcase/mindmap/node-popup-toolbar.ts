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
import {
  ExteriorNodeLabelModel,
  FreeNodePortLocationModel,
  type GraphComponent,
  type GraphEditorInputMode,
  type IModelItem,
  INode,
  type ItemEventArgs,
  Point,
  PortCandidate
} from '@yfiles/yfiles'
import { stateIcons } from './styles/MindMapIconLabelStyle'
import { getEdgeStyle, getLabelStyle, getNodeStyle, setNodeColor } from './styles/styles-support'
import { changeStateLabel, executeCreateChild, executeDeleteItem } from './interaction/commands'
import { HTMLPopupSupport } from './HTMLPopupSupport'
import { isInLayout } from './mind-map-layout'
import { getNodeData } from './data-types'

// we use font-awesome icons for the contextual toolbar in this demo
import '@fortawesome/fontawesome-free/js/all.min.js'

let nodePopup: HTMLPopupSupport<INode>

/**
 * Creates and initializes the node popup.
 * This popup provides the means to:
 * (i) change the state icon and the color of a node,
 * (ii) create cross-reference edges
 * (iii) add a child node or remove the node itself.
 */
export function initializeNodePopups(graphComponent: GraphComponent): void {
  // creates the HTML elements for the node popup
  createNodePopup(graphComponent)

  // creates the HTML panel that will display the node popup
  nodePopup = new HTMLPopupSupport(
    graphComponent,
    document.getElementById('contextualToolbar')!,
    ExteriorNodeLabelModel.TOP
  )

  graphComponent.selection.addEventListener('item-added', (evt: ItemEventArgs<IModelItem>) => {
    hidePopup(graphComponent)
    if (evt.item instanceof INode) {
      showToolbar(evt.item)
    }
  })

  graphComponent.selection.addEventListener('item-removed', () => {
    hidePopup(graphComponent)
  })

  const inputMode = graphComponent.inputMode as GraphEditorInputMode
  inputMode.addEventListener('item-right-clicked', (evt) => {
    if (!(evt.item instanceof INode)) {
      return
    }
    showToolbar(evt.item)
  })

  inputMode.moveSelectedItemsInputMode.addEventListener('drag-started', () =>
    hidePopup(graphComponent)
  )
  inputMode.addEventListener('canvas-clicked', () => hidePopup(graphComponent))
}

/**
 * Configures which buttons should be visible based on the clicked node and shows the toolbar.
 */
function showToolbar(node: INode): void {
  // exclude some buttons for the root node
  const isRoot = getNodeData(node).depth === 0
  document.getElementById('color-picker-label')!.style.display = isRoot ? 'none' : 'inline-block'
  document.getElementById('node-removal-label')!.style.display = isRoot ? 'none' : 'inline-block'
  nodePopup.currentItem = node
}

/**
 * Creates the HTML elements for the node popup and registers the required listeners to the
 * button components.
 */
function createNodePopup(graphComponent: GraphComponent): void {
  createColorPicker(graphComponent)
  createStateIconPicker(graphComponent)

  document
    .getElementById('state-icon-picker')!
    .addEventListener('click', (evt) =>
      showPickerContainer(graphComponent, evt.target as HTMLInputElement)
    )
  document
    .getElementById('color-picker')!
    .addEventListener('click', (evt) =>
      showPickerContainer(graphComponent, evt.target as HTMLInputElement)
    )

  document.getElementById('cross-edge-creation')!.addEventListener(
    'click',
    async (evt) => {
      const currentItem = nodePopup.currentItem
      hidePopup(graphComponent)
      if (!isInLayout() && currentItem) {
        await startCrossReferenceEdgeCreation(currentItem, graphComponent)
      }
      ;(evt.target as HTMLInputElement).checked = false
    },
    false
  )

  document.getElementById('child-creation')!.addEventListener(
    'click',
    async (evt) => {
      const currentItem = nodePopup.currentItem
      hidePopup(graphComponent)
      if (currentItem) {
        const depth = getNodeData(currentItem).depth
        await executeCreateChild(
          getNodeStyle(depth + 1),
          getEdgeStyle(depth),
          getLabelStyle(depth + 1),
          graphComponent
        )
      }
      ;(evt.target as HTMLInputElement).checked = false
    },
    false
  )
  document.getElementById('node-removal')!.addEventListener(
    'click',
    async (evt) => {
      hidePopup(graphComponent)
      await executeDeleteItem(graphComponent)
      ;(evt.target as HTMLInputElement).checked = false
    },
    false
  )
}

/**
 * Starts interactive creation of a new cross-reference edge.
 */
async function startCrossReferenceEdgeCreation(
  sourceNode: INode,
  graphComponent: GraphComponent
): Promise<void> {
  const inputMode = graphComponent.inputMode as GraphEditorInputMode
  const portCandidate = new PortCandidate(sourceNode, FreeNodePortLocationModel.CENTER)
  const createEdgeInputMode = inputMode.createEdgeInputMode
  // enable CreateEdgeInputMode for the moment
  createEdgeInputMode.enabled = true
  await createEdgeInputMode.startEdgeCreation(portCandidate)
}

/**
 * Shows the color picker associated with the pressed button.
 * Before showing the color-picker, hides any previously opened picker and calculates the position
 * of the new one.
 */
export function showPickerContainer(
  graphComponent: GraphComponent,
  toggleButton: HTMLInputElement
): void {
  const pickerContainer = document.getElementById(
    (toggleButton as HTMLElement).getAttribute('data-container-id')!
  )!
  const show = toggleButton.checked

  if (!show) {
    hideAllPickerContainer()
    return
  }

  // hide all picker containers except for the one that should be toggled
  hideAllPickerContainer(toggleButton, pickerContainer)

  // position the container above/below the toggle button
  pickerContainer.style.display = 'block'
  const labelElement = document.querySelector(`label[for="${toggleButton.id}"]`)!
  const labelBoundingRect = labelElement.getBoundingClientRect()
  const toolbarClientRect = document.getElementById('contextualToolbar')!.getBoundingClientRect()
  const pickerClientRect = pickerContainer.getBoundingClientRect()
  pickerContainer.style.left = `${
    labelBoundingRect.left +
    labelBoundingRect.width / 2 -
    pickerContainer.clientWidth / 2 -
    toolbarClientRect.left
  }px`
  const gcAnchor = graphComponent.viewToPageCoordinates(new Point(0, 0))
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
 * Resets the picker container.
 * Hides all pickers except the given one, if exists and unchecks all buttons.
 */
export function hideAllPickerContainer(
  exceptToggleButton?: HTMLInputElement,
  exceptContainer?: HTMLElement
): void {
  const toggleButtons = document.querySelectorAll('input[data-container-id]')
  for (let i = 0; i < toggleButtons.length; i++) {
    const btn = toggleButtons[i] as HTMLInputElement
    if (btn !== exceptToggleButton) {
      btn.checked = false
    }
  }

  const pickerContainers = document.querySelectorAll('.picker-container')
  for (let i = 0; i < pickerContainers.length; i++) {
    const container = pickerContainers[i] as HTMLElement
    if (container.style.opacity !== '0' && container !== exceptContainer) {
      container.style.opacity = '0'
      setTimeout(() => {
        container.style.display = 'none'
      }, 300)
    }
  }
}

/**
 * Creates the div container for the color picker.
 * Adds the necessary buttons and registers the listeners for the change of the color.
 */
function createColorPicker(graphComponent: GraphComponent): void {
  const colorPickerColors = [
    '#ff6c00',
    '#242265',
    '#aa5f82',
    '#56926e',
    '#6dbc8d',
    '#6c4f77',
    '#4281a4',
    '#e0e04f',
    '#c1c1c1',
    '#db3a34',
    '#f0c808',
    '#2d4d3a'
  ]

  const colorContainer = document.querySelector<HTMLDivElement>('#color-picker-colors')!
  colorPickerColors.forEach((color) => {
    const colorButton = document.createElement('button')
    colorButton.setAttribute('data-color', color)
    colorButton.setAttribute('style', `background-color:${color}`)
    colorButton.setAttribute('title', color)
    colorContainer.appendChild(colorButton)
    colorButton.addEventListener(
      'click',
      () => {
        const currentItem = nodePopup.currentItem
        hidePopup(graphComponent)
        if (currentItem) {
          setNodeColor(currentItem, color, graphComponent)
        }
      },
      false
    )
  })
}

/**
 * Creates the div container for the state-icon picker.
 * Adds the necessary buttons and registers the listeners for the change of the icon.
 */
function createStateIconPicker(graphComponent: GraphComponent): void {
  const iconContainer = document.querySelector<HTMLDivElement>('#state-icon-picker-icons')!
  stateIcons.forEach((stateIcon, i) => {
    const stateButton = document.createElement('button')
    stateButton.setAttribute(
      'style',
      `background:url(./resources/icons/${stateIcon}.svg) no-repeat`
    )
    stateButton.classList.add('toggle-button')
    iconContainer.appendChild(stateButton)
    stateButton.addEventListener('click', async () => {
      await changeStateLabel(i, graphComponent)
      hidePopup(graphComponent)
    })
  })
}

/**
 * Hides the popup element along with its components.
 */
export function hidePopup(graphComponent: GraphComponent): void {
  hideAllPickerContainer()
  nodePopup.currentItem = null
  graphComponent.focus()
}
