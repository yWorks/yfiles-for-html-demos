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
import {
  DefaultLabelStyle,
  DragDropEffects,
  FreeEdgeLabelModel,
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  GraphSnapContext,
  GridSnapTypes,
  HorizontalTextAlignment,
  IArrow,
  ICommand,
  INode,
  InteriorStretchLabelModel,
  License,
  MinimumNodeSizeStage,
  NodeDropInputMode,
  OrthogonalEdgeEditingContext,
  PanelNodeStyle,
  Point,
  PolylineEdgeStyle,
  Rect,
  SimpleNode,
  Size,
  StorageLocation
} from 'yfiles'

import FlowchartData from './resources/FlowchartData'
import FlowchartStyle, {
  FlowchartNodeStyle,
  FlowchartNodeType,
  FlowchartSerializationListener
} from './FlowchartStyle'
import FlowchartLayoutData from './FlowchartLayoutData'
import FlowchartLayout from './FlowchartLayout'
import {
  addClass,
  addNavigationButtons,
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  removeClass,
  setComboboxValue,
  showApp
} from '../../resources/demo-app'
import { pointerEventsSupported } from '../../utils/Workarounds'
import loadJson from '../../resources/load-json'
import { DragAndDropPanel } from '../../utils/DndPanel'

let graphComponent: GraphComponent = null!

async function run(licenseData: any): Promise<void> {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  configureUserInteraction()
  initializeDnDPanel()
  initializeGraphDefaults()

  // load an initial sample
  await loadGraph('ProblemSolving')

  registerCommands()
  showApp(graphComponent)
}

async function runLayout(): Promise<void> {
  setUIDisabled(true)

  const allowFlatwiseEdges = (document.getElementById('allow-flatwise-edges') as HTMLInputElement)
    .checked

  const flowchartLayout = new FlowchartLayout()
  flowchartLayout.allowFlatwiseEdges = allowFlatwiseEdges

  const flowchartLayoutData = new FlowchartLayoutData()
  flowchartLayoutData.preferredPositiveBranchDirection = getBranchDirection(true)
  flowchartLayoutData.preferredNegativeBranchDirection = getBranchDirection(false)
  flowchartLayoutData.inEdgeGrouping = getInEdgeGroupingStyle()
  try {
    await graphComponent.morphLayout(
      new MinimumNodeSizeStage(flowchartLayout),
      '0.5s',
      flowchartLayoutData.create(graphComponent.graph)
    )
  } catch (error) {
    const reporter = (window as any).reportError
    if (typeof reporter === 'function') {
      reporter(error)
    } else {
      throw error
    }
  } finally {
    setUIDisabled(false)
  }
}

function getBranchDirection(positive: boolean): number {
  const select = positive
    ? (document.getElementById('select-positive-branch-direction') as HTMLSelectElement)
    : (document.getElementById('select-negative-branch-direction') as HTMLSelectElement)
  switch (select.selectedIndex) {
    default:
      return FlowchartLayout.DIRECTION_UNDEFINED
    case 0:
      return FlowchartLayout.DIRECTION_WITH_THE_FLOW
    case 1:
      return FlowchartLayout.DIRECTION_FLATWISE
    case 2:
      return FlowchartLayout.DIRECTION_LEFT_IN_FLOW
    case 3:
      return FlowchartLayout.DIRECTION_RIGHT_IN_FLOW
  }
}

function getInEdgeGroupingStyle(): 'none' | 'all' | 'optimized' {
  const select = document.getElementById('select-in-edge-grouping') as HTMLSelectElement
  switch (select.selectedIndex) {
    default:
    case 0:
      return 'none'
    case 1:
      return 'all'
    case 2:
      return 'optimized'
  }
}

/**
 * Configures the input mode for the given graphComponent.
 */
function configureUserInteraction(): void {
  // configure snapping
  const snapContext = new GraphSnapContext({
    nodeToNodeDistance: 30,
    nodeToEdgeDistance: 20,
    snapOrthogonalMovement: false,
    snapDistance: 10,
    snapSegmentsToSnapLines: true,
    snapBendsToSnapLines: true,
    gridSnapType: GridSnapTypes.ALL
  })

  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    snapContext,
    // enable drag an drop for elements in the palette
    nodeDropInputMode: new NodeDropInputMode({
      showPreview: true,
      enabled: true
    })
  })
}

/**
 * Initializes the drag and drop panel.
 */
function initializeDnDPanel(): void {
  const dndPanel = new DragAndDropPanel(document.getElementById('dndPanel')!)
  // Set the callback that starts the actual drag and drop operation
  dndPanel.beginDragCallback = (element: HTMLElement, data: any) => {
    const dragPreview = element.cloneNode(true) as HTMLElement
    dragPreview.style.margin = '0'
    const dragSource = NodeDropInputMode.startDrag(
      element,
      data,
      DragDropEffects.ALL,
      true,
      pointerEventsSupported ? dragPreview : null
    )
    dragSource.addQueryContinueDragListener((src, args) => {
      if (args.dropTarget === null) {
        removeClass(dragPreview, 'hidden')
      } else {
        addClass(dragPreview, 'hidden')
      }
    })
  }
  dndPanel.maxItemWidth = 160
  dndPanel.populatePanel(createDnDPanelNodes)
}

/**
 * Creates the nodes that provide the visualizations for the style panel.
 */
function createDnDPanelNodes(): INode[] {
  const nodeContainer: INode[] = []

  // create a node for each style node type
  for (const type of Object.keys(FlowchartNodeType)) {
    const node = new SimpleNode()
    node.layout = new Rect(0, 0, 80, 40)
    node.style = new FlowchartNodeStyle(FlowchartNodeType[type as keyof typeof FlowchartNodeType])
    nodeContainer.push(node)
  }

  return nodeContainer
}

/**
 * Initializes defaults for the graph.
 */
function initializeGraphDefaults(): void {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new FlowchartNodeStyle(FlowchartNodeType.Start1)
  graph.nodeDefaults.size = new Size(80, 40)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: HorizontalTextAlignment.CENTER
  })
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createDefaultParameter()

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    targetArrow: IArrow.DEFAULT,
    smoothingLength: 20
  })
  graph.edgeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: HorizontalTextAlignment.CENTER
  })
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

  graph.groupNodeDefaults.style = new PanelNodeStyle({
    color: 'rgb(214, 229, 248)',
    insets: [20, 15, 15, 15],
    labelInsetsColor: 'rgb(214, 229, 248)'
  })

  graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH
}

/**
 * Loads the sample graph with the given name from the data.
 */
async function loadGraph(sampleName: string): Promise<void> {
  const sample = (FlowchartData as any)[sampleName] || FlowchartData.ProblemSolving

  // clear the graph
  graphComponent.graph.clear()

  // initialize the graph builder
  const builder = new GraphBuilder({
    graph: graphComponent.graph,
    nodes: [
      {
        data: sample.nodes,
        id: 'id',
        labels: ['label'],
        layout: (dataItem: any) =>
          dataItem.type === 'decision'
            ? Rect.fromCenter(Point.ORIGIN, new Size(145, 100))
            : Rect.fromCenter(Point.ORIGIN, new Size(145, 60)),
        style: (dataItem: any) => new FlowchartNodeStyle(dataItem.type)
      }
    ],
    edges: [
      {
        data: sample.edges,
        sourceId: 'from',
        targetId: 'to',
        labels: ['label']
      }
    ]
  })

  // create the graph
  graphComponent.graph = builder.buildGraph()

  // apply layout
  await runLayout()
}

/**
 * Wires up UI-elements.
 */
function registerCommands(): void {
  const gs = new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  // enable serialization of the flowchart styles - without a namespace mapping, serialization will fail
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    FlowchartStyle
  )
  gs.graphMLIOHandler.addNamespace(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    'demostyle'
  )
  gs.graphMLIOHandler.addHandleSerializationListener(FlowchartSerializationListener)

  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  const select = document.getElementById('select-sample') as HTMLSelectElement
  addNavigationButtons(select)
  bindChangeListener("select[data-command='SelectSample']", () => {
    updateGraph()
  })

  bindAction("button[data-command='Layout']", runLayout)
}

/**
 * Loads the selected graph and applies a flowchart layout.
 */
async function updateGraph(): Promise<void> {
  const select = document.getElementById('select-sample') as HTMLSelectElement
  const allowFlatwiseEdges = document.getElementById('allow-flatwise-edges') as HTMLInputElement

  // initial settings for the selected sample
  switch (select.selectedIndex) {
    default:
    case 0:
      setComboboxValue('select-positive-branch-direction', 'undefined')
      setComboboxValue('select-negative-branch-direction', 'undefined')
      setComboboxValue('select-in-edge-grouping', 'optimized')
      allowFlatwiseEdges.checked = true
      break
    case 1:
      setComboboxValue('select-positive-branch-direction', 'same-as-flow')
      setComboboxValue('select-negative-branch-direction', 'left-in-flow')
      setComboboxValue('select-in-edge-grouping', 'optimized')
      allowFlatwiseEdges.checked = true
      break
    case 2:
      setComboboxValue('select-positive-branch-direction', 'same-as-flow')
      setComboboxValue('select-negative-branch-direction', 'flatwise')
      setComboboxValue('select-in-edge-grouping', 'optimized')
      allowFlatwiseEdges.checked = true
      break
    case 3:
      setComboboxValue('select-positive-branch-direction', 'same-as-flow')
      setComboboxValue('select-negative-branch-direction', 'flatwise')
      setComboboxValue('select-in-edge-grouping', 'optimized')
      allowFlatwiseEdges.checked = true
      break
    case 4:
      setComboboxValue('select-positive-branch-direction', 'flatwise')
      setComboboxValue('select-negative-branch-direction', 'flatwise')
      setComboboxValue('select-in-edge-grouping', 'none')
      allowFlatwiseEdges.checked = false
      break
  }

  await loadGraph(select.value)
}

/**
 * Enables/disabled the toolbar elements and the input mode.
 * @param disabled true if the ui should be disabled, false
 *   otherwise.
 */
function setUIDisabled(disabled: boolean): void {
  // keep the enabled state for the next/previous button when enabling the ui
  const selectSample = document.getElementById('select-sample') as HTMLSelectElement
  selectSample.disabled = disabled
  ;(document.getElementById('select-positive-branch-direction') as HTMLSelectElement).disabled =
    disabled
  ;(document.getElementById('select-negative-branch-direction') as HTMLSelectElement).disabled =
    disabled
  ;(document.getElementById('select-in-edge-grouping') as HTMLSelectElement).disabled = disabled
  ;(document.getElementById('allow-flatwise-edges') as HTMLInputElement).disabled = disabled
  ;(document.getElementById('layout') as HTMLInputElement).disabled = disabled
}

loadJson().then(checkLicense).then(run)
