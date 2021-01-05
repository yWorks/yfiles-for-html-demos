/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  InteriorStretchLabelModel,
  License,
  MinimumNodeSizeStage,
  NodeDropInputMode,
  OrthogonalEdgeEditingContext,
  OrthogonalEdgeEditingPolicy,
  PanelNodeStyle,
  Point,
  PolylineEdgeStyle,
  Rect,
  SimpleNode,
  Size,
  StorageLocation
} from 'yfiles'

import * as FlowchartData from './resources/FlowchartData.js'
import FlowchartStyle, {
  FlowchartNodeStyle,
  FlowchartSerializationListener
} from './FlowchartStyle.js'
import { DragAndDropPanel } from '../../utils/DndPanel.js'
import FlowchartLayoutData from './FlowchartLayoutData.js'
import FlowchartLayout from './FlowchartLayout.js'
import {
  addClass,
  bindAction,
  bindChangeListener,
  bindCommand,
  passiveSupported,
  pointerEventsSupported,
  removeClass,
  setComboboxValue,
  showApp
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  configureInputModes()
  initializeDnDPanel()
  initializeGraph()

  registerCommands()
  showApp(graphComponent)
}

async function runLayout() {
  setUIDisabled(true)

  const allowFlatwiseEdges = document.getElementById('allow-flatwise-edges').checked

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
      flowchartLayoutData
    )
  } catch (error) {
    if (typeof window.reportError === 'function') {
      window.reportError(error)
    } else {
      throw error
    }
  } finally {
    setUIDisabled(false)
  }
}

/**
 * @param {boolean} positive
 */
function getBranchDirection(positive) {
  const select = positive
    ? document.getElementById('select-positive-branch-direction')
    : document.getElementById('select-negative-branch-direction')
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

function getInEdgeGroupingStyle() {
  const select = document.getElementById('select-in-edge-grouping')
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
function configureInputModes() {
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

  const mode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    orthogonalBendRemoval: OrthogonalEdgeEditingPolicy.ALWAYS,
    snapContext
  })
  mode.createEdgeInputMode.orthogonalEdgeCreation = OrthogonalEdgeEditingPolicy.ALWAYS

  // enable drag an drop for elements in the palette
  const nodeDropInputMode = new NodeDropInputMode()
  nodeDropInputMode.showPreview = true
  nodeDropInputMode.enabled = true
  mode.nodeDropInputMode = nodeDropInputMode

  graphComponent.inputMode = mode
}

/**
 * Initializes the drag and drop panel.
 */
function initializeDnDPanel() {
  const dndPanel = new DragAndDropPanel(document.getElementById('dndPanel'), passiveSupported)
  // Set the callback that starts the actual drag and drop operation
  dndPanel.beginDragCallback = (element, data) => {
    const dragPreview = element.cloneNode(true)
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
 * @return {SimpleNode[]}
 */
function createDnDPanelNodes() {
  const nodeContainer = []

  // create a nodes with each style
  const nodeStyles = [
    'process',
    'decision',
    'start1',
    'start2',
    'terminator',
    'cloud',
    'data',
    'directData',
    'database',
    'document',
    'predefinedProcess',
    'storedData',
    'internalStorage',
    'sequentialData',
    'manualInput',
    'card',
    'paperType',
    'delay',
    'display',
    'manualOperation',
    'preparation',
    'loopLimit',
    'loopLimitEnd',
    'onPageReference',
    'offPageReference',
    'annotation',
    'userMessage',
    'networkMessage'
  ]

  nodeStyles.forEach(type => {
    const node = new SimpleNode()
    node.layout = new Rect(0, 0, 80, 40)
    node.style = new FlowchartNodeStyle(type)
    nodeContainer.push(node)
  })

  return nodeContainer
}

/**
 * Initializes defaults for the graph and loads an initial sample.
 */
function initializeGraph() {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new FlowchartNodeStyle('start1')
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

  loadGraph('ProblemSolving')
}

/**
 * Loads a sample graph from data according to the given sample name.
 * @param {string} sampleName
 */
function loadGraph(sampleName) {
  const sample =
    FlowchartData[sampleName.replace('Sample: ', '').replace(' ', '')] ||
    FlowchartData.ProblemSolving

  // clear graph
  graphComponent.graph.clear()

  // initialize graph builder
  const builder = new GraphBuilder({
    graph: graphComponent.graph,
    nodes: [
      {
        data: sample.nodes,
        id: 'id',
        labels: ['label']
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

  // create graph
  graphComponent.graph = builder.buildGraph()

  // update node styles and sizes according to node types.
  graphComponent.graph.nodes.forEach(node => {
    graphComponent.graph.setStyle(node, new FlowchartNodeStyle(node.tag.type))
    if (node.tag.type === 'decision') {
      graphComponent.graph.setNodeLayout(node, Rect.fromCenter(Point.ORIGIN, new Size(145, 100)))
    } else {
      graphComponent.graph.setNodeLayout(node, Rect.fromCenter(Point.ORIGIN, new Size(145, 60)))
    }
  })

  // apply layout
  runLayout()
}

/**
 * Wires up UI-elements.
 */
function registerCommands() {
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

  const select = document.getElementById('select-sample')
  bindChangeListener("select[data-command='SelectSample']", () => {
    updateGraph()
  })

  bindAction("button[data-command='PreviousSample']", () => {
    select.selectedIndex = Math.max(0, select.selectedIndex - 1)
    updateGraph()
  })
  bindAction("button[data-command='NextSample']", () => {
    select.selectedIndex = Math.min(select.selectedIndex + 1, select.options.length - 1)
    updateGraph()
  })

  bindAction("button[data-command='Layout']", runLayout)
}

/**
 * Loads the selected graph and applies a flowchart layout.
 */
function updateGraph() {
  const select = document.getElementById('select-sample')
  const allowFlatwiseEdges = document.getElementById('allow-flatwise-edges')

  // initial settings for the selected sample
  switch (select.selectedIndex) {
    default:
    case 0:
      setComboboxValue('select-positive-branch-direction', 'Undefined')
      setComboboxValue('select-negative-branch-direction', 'Undefined')
      setComboboxValue('select-in-edge-grouping', 'Optimized')
      allowFlatwiseEdges.checked = true
      break
    case 1:
      setComboboxValue('select-positive-branch-direction', 'Same As Flow')
      setComboboxValue('select-negative-branch-direction', 'Left In Flow')
      setComboboxValue('select-in-edge-grouping', 'Optimized')
      allowFlatwiseEdges.checked = true
      break
    case 2:
      setComboboxValue('select-positive-branch-direction', 'Same As Flow')
      setComboboxValue('select-negative-branch-direction', 'Flatwise')
      setComboboxValue('select-in-edge-grouping', 'Optimized')
      allowFlatwiseEdges.checked = true
      break
    case 3:
      setComboboxValue('select-positive-branch-direction', 'Same As Flow')
      setComboboxValue('select-negative-branch-direction', 'Flatwise')
      setComboboxValue('select-in-edge-grouping', 'Optimized')
      allowFlatwiseEdges.checked = true
      break
    case 4:
      setComboboxValue('select-positive-branch-direction', 'Flatwise')
      setComboboxValue('select-negative-branch-direction', 'Flatwise')
      setComboboxValue('select-in-edge-grouping', 'None')
      allowFlatwiseEdges.checked = false
      break
  }

  loadGraph(select.value)
}

/**
 * Enables/disabled the toolbar elements and the input mode.
 * @param {boolean} disabled <code>true</code> if the ui should be disabled, <code>false</code>
 *   otherwise.
 */
function setUIDisabled(disabled) {
  // keep the enabled state for the next/previous button when enabling the ui
  const selectSample = document.getElementById('select-sample')
  selectSample.disabled = disabled
  document.getElementById('previous-sample').disabled = disabled || selectSample.selectedIndex === 0
  document.getElementById('next-sample').disabled =
    disabled || selectSample.selectedIndex === selectSample.options.length - 1
  document.getElementById('select-positive-branch-direction').disabled = disabled
  document.getElementById('select-negative-branch-direction').disabled = disabled
  document.getElementById('select-in-edge-grouping').disabled = disabled
  document.getElementById('allow-flatwise-edges').disabled = disabled
  document.getElementById('layout').disabled = disabled
}

loadJson().then(run)
