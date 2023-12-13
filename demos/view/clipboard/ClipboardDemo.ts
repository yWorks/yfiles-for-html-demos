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
import {
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphFocusIndicatorManager,
  ICommand,
  IGraph,
  IInputMode,
  ILabel,
  IModelItem,
  INode,
  License,
  NinePositionsEdgeLabelModel,
  Point,
  Size,
  StringTemplateNodeStyle,
  TemplateNodeStyle,
  VoidNodeStyle
} from 'yfiles'

import { createNodeBusinessData, getCommonName } from './BusinessDataHandling'
import { TaggedNodeClipboardHelper } from './ClipboardHelper'
import { applyDemoTheme, createDemoEdgeStyle } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { bindYFilesCommand, finishLoading } from 'demo-resources/demo-page'

let graphComponent: GraphComponent
let graphComponent2: GraphComponent

async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize the GraphComponents
  graphComponent = new GraphComponent('graphComponent')
  graphComponent2 = new GraphComponent('clipboard-graph-component')
  applyDemoTheme(graphComponent)
  applyDemoTheme(graphComponent2)

  // both components share the clipboard
  graphComponent2.clipboard = graphComponent.clipboard

  // initializes the graph
  initializeGraphStyling()

  // Create nodes and an edge.
  createSampleGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()
  graphComponent2.zoomTo(graphComponent.center, graphComponent.zoom)

  // Enable the Undo functionality.
  graphComponent.graph.undoEngineEnabled = true
  graphComponent2.graph.undoEngineEnabled = true

  // creates the input modes
  graphComponent.inputMode = createInputMode()
  graphComponent2.inputMode = createInputMode()

  // wires up the UI
  initializeUI()

  // sets the focus to the left GraphComponent
  graphComponent.focus()
}

/**
 * Initializes the two graphs.
 */
function initializeGraphStyling(): void {
  // Initialize the left graph
  const graph = graphComponent.graph

  // Create a converter function for the StringTemplateNodeStyle that converts the node width
  // into a "translate" expression that horizontally centers the transformed element
  TemplateNodeStyle.CONVERTERS.centerTransform = (o: number, p: number | null): string => {
    const verticalOffset = p || 0
    // place in horizontal center
    return `translate(${o * 0.5} ${verticalOffset})`
  }

  // Set the default style for new nodes and edges
  graph.nodeDefaults.style = new StringTemplateNodeStyle(`<g>
      <rect stroke-width="1.5" stroke="#617984" fill="#C1E1F1" rx="4" ry="4"
          width="{TemplateBinding width}" height="{TemplateBinding height}"/>
      <text data-content="{Binding name}"
          transform="{TemplateBinding width, Converter=centerTransform, Parameter=15}"
          text-anchor="middle" style="font-size:120%; fill:#000" dy="0.5em"/>
    </g>
  `)
  graph.nodeDefaults.size = new Size(120, 60)

  graph.edgeDefaults.style = createDemoEdgeStyle({ colorSetName: 'demo-palette-31' })

  // Set the default locations for new labels
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.NORTH
  graph.edgeDefaults.labels.layoutParameter = NinePositionsEdgeLabelModel.CENTER_ABOVE

  graph.decorator.nodeDecorator.clipboardHelperDecorator.setImplementation(
    new TaggedNodeClipboardHelper()
  )

  // Initialize the right graph
  const graph2 = graphComponent2.graph
  graph2.nodeDefaults = graph.nodeDefaults
  graph2.edgeDefaults = graph.edgeDefaults

  graphComponent.focusIndicatorManager = new GraphFocusIndicatorManager({
    nodeStyle: VoidNodeStyle.INSTANCE
  })
  graphComponent2.focusIndicatorManager = new GraphFocusIndicatorManager({
    nodeStyle: VoidNodeStyle.INSTANCE
  })

  graph2.decorator.nodeDecorator.clipboardHelperDecorator.setImplementation(
    new TaggedNodeClipboardHelper()
  )
}

/**
 * Creates the GraphEditorInputMode for this demo.
 */
function createInputMode(): IInputMode {
  const inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    // For each new node, create a node label and a business object automatically
    nodeCreator: (context, graph, location) => {
      const node = graph.createNodeAt(location)
      node.tag = createNodeBusinessData()
      graph.addLabel(node, `Label ${graph.nodes.size.toString()}`)
      return node
    },
    // Enable clipboard operations (basically the key bindings/commands)
    allowClipboardOperations: true
  })

  // Discard the first click after getting the focus
  // to prevent node creation when switching between the GraphComponents
  inputMode.clickInputMode.swallowFocusClick = true
  return inputMode
}

/**
 * Wires up the UI.
 */
function initializeUI() {
  function enablePasteSpecialButton(): void {
    document.querySelector<HTMLButtonElement>('#paste-special')!.disabled = false
    document.querySelector<HTMLButtonElement>('#paste-special2')!.disabled = false
  }

  function registerEditNameEnabledListeners(
    inputMode: GraphEditorInputMode,
    buttonSelector: string
  ) {
    inputMode.addMultiSelectionFinishedListener((_, evt) => {
      document.querySelector<HTMLButtonElement>(buttonSelector)!.disabled = evt.selection.size === 0
    })

    inputMode.addDeletedSelectionListener(() => {
      document.querySelector<HTMLButtonElement>(buttonSelector)!.disabled = true
    })
  }

  // Left GraphComponent
  document
    .getElementById('paste-special')!
    .addEventListener('click', (): void => onPasteSpecialCommand(graphComponent))
  document
    .getElementById('edit-name')!
    .addEventListener('click', (): void => onEditNameCommand(graphComponent, 'left'))

  graphComponent.clipboard.addElementsCopiedListener(enablePasteSpecialButton)
  graphComponent.clipboard.addElementsCutListener(enablePasteSpecialButton)
  registerEditNameEnabledListeners(graphComponent.inputMode as GraphEditorInputMode, '#edit-name')

  // Right GraphComponent
  bindYFilesCommand(
    "button[data-command='ZoomIn2']",
    ICommand.INCREASE_ZOOM,
    graphComponent2,
    null,
    'Increase zoom'
  )
  bindYFilesCommand(
    "button[data-command='ZoomOut2']",
    ICommand.DECREASE_ZOOM,
    graphComponent2,
    null,
    'Decrease zoom'
  )
  bindYFilesCommand(
    "button[data-command='FitContent2']",
    ICommand.FIT_GRAPH_BOUNDS,
    graphComponent2,
    null,
    'Fit content'
  )
  bindYFilesCommand(
    "button[data-command='ZoomOriginal2']",
    ICommand.ZOOM,
    graphComponent2,
    1.0,
    'Zoom to original size'
  )

  bindYFilesCommand("button[data-command='Undo2']", ICommand.UNDO, graphComponent2, null, 'Undo')
  bindYFilesCommand("button[data-command='Redo2']", ICommand.REDO, graphComponent2, null, 'Redo')

  bindYFilesCommand("button[data-command='Cut2']", ICommand.CUT, graphComponent2, null, 'Cut')
  bindYFilesCommand("button[data-command='Copy2']", ICommand.COPY, graphComponent2, null, 'Copy')
  bindYFilesCommand("button[data-command='Paste2']", ICommand.PASTE, graphComponent2, null, 'Paste')
  bindYFilesCommand(
    "button[data-command='Delete2']",
    ICommand.DELETE,
    graphComponent2,
    null,
    'Delete'
  )

  document
    .querySelector('#paste-special2')!
    .addEventListener('click', (): void => onPasteSpecialCommand(graphComponent2))
  document
    .querySelector('#edit-name2')!
    .addEventListener('click', (): void => onEditNameCommand(graphComponent2, 'right'))

  registerEditNameEnabledListeners(graphComponent2.inputMode as GraphEditorInputMode, '#edit-name2')
}

/**
 * Executes paste special command.
 * @param component The graphComponent to apply the command to.
 */
function onPasteSpecialCommand(component: GraphComponent): void {
  const clipboard = component.clipboard
  component.selection.clear()

  // This is the filter for the Paste call.
  const filter = (item: IModelItem): boolean => item instanceof INode || item instanceof ILabel
  // This callback is executed for every pasted element. We use it to select the pasted nodes.
  const pasted = (originalItem: IModelItem, pastedItem: IModelItem) => {
    if (pastedItem instanceof INode) {
      component.selection.setSelected(pastedItem, true)
    }
  }
  clipboard.paste(component.graph, filter, pasted)

  // Set the different paste delta.
  clipboard.pasteDelta = new Point(clipboard.pasteDelta.x + 30, clipboard.pasteDelta.y + 30)
}

/**
 * Shows a dialog for editing the node name.
 * @param component The graphComponent to apply the command to.
 * @param elementID The id of the element that shows the dialog.
 */
function onEditNameCommand(component: GraphComponent, elementID: string): void {
  const nameDialog = document.querySelector<HTMLDivElement>('#name-dialog')!
  const nodeNameInput = nameDialog.querySelector<HTMLInputElement>('#node-name-input')!
  nodeNameInput.value = getCommonName(component.selection.selectedNodes)

  const applyListener = (evt: any) => {
    evt.preventDefault()
    nameDialog.style.display = 'none'
    const name = nodeNameInput.value
    component.selection.selectedNodes.forEach((node) => {
      node.tag.name = name
      // The firePropertyChanged method is available on the tag because it was added by the
      // {@link StringTemplateNodeStyle.makeObservable} method.
      node.tag.firePropertyChanged('name')
    })
    component.focus()
    document.querySelector('#apply-button')!.removeEventListener('click', applyListener)
  }

  document.querySelector('#apply-button')!.addEventListener('click', applyListener)

  document.querySelector('#cancel-button')!.addEventListener('click', () => {
    nameDialog.style.display = 'none'
    document.querySelector('#apply-button')!.removeEventListener('click', applyListener)
  })

  nameDialog.style.display = 'block'
  document.querySelector('#' + elementID)?.appendChild(nameDialog)
  nodeNameInput.focus()
}

/**
 * Creates the sample graph.
 */
function createSampleGraph(graph: IGraph): void {
  const sharedBusinessObject = createNodeBusinessData()

  const node1 = graph.createNodeAt({
    location: new Point(100, 100),
    tag: sharedBusinessObject,
    labels: ['Label 1']
  })
  const node2 = graph.createNodeAt({
    location: new Point(350, 100),
    tag: sharedBusinessObject,
    labels: ['Label 2']
  })
  graph.createNodeAt({
    location: new Point(100, 200),
    tag: createNodeBusinessData()
  })
  graph.addLabel(graph.createEdge(node1, node2), 'Shared Object')
}

run().then(finishLoading)
