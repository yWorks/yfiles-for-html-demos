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
  GraphComponent,
  IEdgeReconnectionPortCandidateProvider,
  License,
  PolylineEdgeStyle,
  Rect,
  SimpleNode,
  Size,
  VoidLabelStyle
} from 'yfiles'

import { DragAndDropPanel } from 'demo-utils/DragAndDropPanel'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { NotNodeStyle } from './node-styles/NotNodeStyle'
import { XOrNodeStyle } from './node-styles/XOrNodeStyle'
import { AndGateNodeStyle } from './node-styles/AndGateNodeStyle'
import { OrNodeStyle } from './node-styles/OrNodeStyle'
import {
  createPortDescriptors,
  DescriptorDependentPortCandidateProvider
} from './DescriptorDependentPortCandidateProvider'
import { createPortAwareGraphBuilder } from '../../databinding/port-aware-graph-builder/GraphBuilder'
import { sampleData } from './resources/sample-data'
import { createInputMode } from './input'
import { runLayout } from './logicgates-layout'

/**
 * The main graph component
 */
let graphComponent: GraphComponent

async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // initialize the drag and drop panel
  initializeDragAndDropPanel()

  // initialize the default styles
  initializeGraph()

  // create the input mode for this demo
  createInputMode(graphComponent)

  // create the sample graph
  await createSampleGraph()

  // wire up the UI
  initializeUI()
}

function initializeDragAndDropPanel(): void {
  const dndPanel = new DragAndDropPanel(document.getElementById('dnd-panel')!)
  dndPanel.maxItemWidth = 160
  dndPanel.populatePanel(createDragAndDropPanelNodes())
}

/**
 * Creates the nodes that provide the visualizations for the style panel.
 */
function createDragAndDropPanelNodes(): SimpleNode[] {
  // Create some nodes with different styles
  const nodeStyles = [
    new AndGateNodeStyle(false, '#363020', '#201F1A', '#FFFFFF'),
    new AndGateNodeStyle(true, '#605C4E', '#3A3834', '#FFFFFF'),
    new NotNodeStyle('#177e89', '#093237', '#FFFFFF'),
    new OrNodeStyle(false, '#A49966', '#625F50', '#FFFFFF'),
    new OrNodeStyle(true, '#C7C7A6', '#77776E', '#000000'),
    new XOrNodeStyle(false, '#A4778B', '#62555B', '#FFFFFF'),
    new XOrNodeStyle(true, '#AA4586', '#66485B', '#FFFFFF')
  ]

  const nodeContainer = nodeStyles.map(
    (style) =>
      new SimpleNode({
        layout: new Rect(0, 0, 100, 50),
        style: style
      })
  )

  // create the port descriptor for the nodes
  createPortDescriptors(nodeContainer)

  return nodeContainer
}

/**
 * Initialize the graph's default styles and settings.
 */
function initializeGraph(): void {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new AndGateNodeStyle(false, '#605C4E', '#201F1A', '#FFFFFF')
  graph.nodeDefaults.size = new Size(100, 50)

  // don't delete ports if a connected edge gets removed
  graph.nodeDefaults.ports.autoCleanUp = false
  // hide port labels
  graph.nodeDefaults.ports.labels.style = new VoidLabelStyle()
  // set the port candidate provider
  graph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
    (node) => new DescriptorDependentPortCandidateProvider(node)
  )
  graph.edgeDefaults.style = new PolylineEdgeStyle({ stroke: '2px black' })
  graph.decorator.edgeDecorator.edgeReconnectionPortCandidateProviderDecorator.setImplementation(
    IEdgeReconnectionPortCandidateProvider.ALL_NODE_CANDIDATES
  )

  // enable the undo engine
  graph.undoEngineEnabled = true

  // add a listener to add the tags related to the highlighting to the new nodes
  graph.addNodeCreatedListener((_, evt) => {
    evt.item.tag = {
      sourceHighlight: false,
      targetHighlight: false
    }
  })

  // disable edge cropping
  graph.decorator.portDecorator.edgePathCropperDecorator.hideImplementation()
}

/**
 * Wires up the UI.
 */
function initializeUI(): void {
  document
    .getElementById('algorithm-select-box')!
    .addEventListener('change', () => runLayout(graphComponent, true))
  document
    .getElementById('layout-button')!
    .addEventListener('click', () => runLayout(graphComponent, false))
}

/**
 * Creates the sample graph for this demo.
 */
async function createSampleGraph(): Promise<void> {
  const graph = graphComponent.graph

  const graphBuilder = createPortAwareGraphBuilder(graph, sampleData.gates, sampleData.connections)
  graphBuilder.buildGraph()

  createPortDescriptors(graph.nodes, graph)

  // run the layout
  await runLayout(graphComponent, true)
}

void run().then(finishLoading)
