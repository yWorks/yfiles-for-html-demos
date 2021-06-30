/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  ICommand,
  Insets,
  License,
  NodeSizeConstraintProvider,
  OrthogonalEdgeEditingContext,
  Point,
  Rect,
  Size
} from 'yfiles'
import loadJson from '../../resources/load-json'
import { NodeSelectionResizingInputMode } from './NodeSelectionResizingInputMode'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app'
import { initDemoStyles } from '../../resources/demo-styles'
import SampleData from './resources/SampleData'

// @ts-ignore
let graphComponent: GraphComponent = null

// @ts-ignore
let nodeSelectionResizingInputMode: NodeSelectionResizingInputMode = null

function run(licenseData: object): void {
  License.value = licenseData

  graphComponent = new GraphComponent('graphComponent')

  // enable undo engine
  graphComponent.graph.undoEngineEnabled = true

  initializeInputMode()

  // set minimum and maximum sizes for all non-group nodes (group nodes should be able to grow larger so they can
  // contain arbitrary numbers of nodes)
  const sizeConstraintProvider = new NodeSizeConstraintProvider(
    new Size(10, 10),
    new Size(100, 100)
  )
  graphComponent.graph.decorator.nodeDecorator.sizeConstraintProviderDecorator.setFactory(
    node => !graphComponent.graph.isGroupNode(node),
    () => sizeConstraintProvider
  )

  // load sample graph
  loadSampleGraph()

  registerCommands()

  showApp(graphComponent)
}

function initializeInputMode(): void {
  const graphEditorInputMode = new GraphEditorInputMode({
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext({ enabled: true }),

    allowGroupingOperations: true,

    snapContext: new GraphSnapContext({ enabled: false })
  })

  // add a custom input mode to the GraphEditorInputMode that shows a single set of handles when multiple nodes are selected
  nodeSelectionResizingInputMode = new NodeSelectionResizingInputMode('resize', new Insets(10))
  graphEditorInputMode.add(nodeSelectionResizingInputMode)

  graphComponent.inputMode = graphEditorInputMode
}

function loadSampleGraph(): void {
  initDemoStyles(graphComponent.graph)

  const defaultNodeSize = graphComponent.graph.nodeDefaults.size
  const builder = new GraphBuilder(graphComponent.graph)
  builder.createNodesSource({
    data: SampleData.nodes.filter(node => !node.isGroup),
    id: 'id',
    parentId: 'parent',
    layout: (data: any) => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height),
    labels: ['label']
  })
  builder.createGroupNodesSource({
    data: SampleData.nodes.filter(node => node.isGroup),
    id: 'id',
    layout: (data: any) => data // the data object itself has x, y, width, height properties
  })
  builder.createEdgesSource(SampleData.edges, 'source', 'target', 'id')

  builder.buildGraph()
  graphComponent.graph.edges.forEach(edge => {
    edge.tag.bends &&
      edge.tag.bends.forEach((bend: Point) => {
        graphComponent.graph.addBend(edge, bend)
      })
  })
  graphComponent.fitContent()
  graphComponent.graph.undoEngine!.clear()
}

function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)

  const snappingButton = document.querySelector('#demo-snapping-button') as HTMLInputElement
  bindAction('#demo-snapping-button', () => {
    ;(graphComponent.inputMode as GraphEditorInputMode).snapContext!.enabled =
      snappingButton.checked
  })
  const orthogonalEditingButton = document.querySelector(
    '#demo-orthogonal-editing-button'
  ) as HTMLInputElement
  bindAction('#demo-orthogonal-editing-button', () => {
    ;(graphComponent.inputMode as GraphEditorInputMode).orthogonalEdgeEditingContext!.enabled =
      orthogonalEditingButton.checked
  })

  bindChangeListener("select[data-command='ChangeResizeMode']", mode => {
    if (nodeSelectionResizingInputMode) {
      nodeSelectionResizingInputMode.mode = mode
    }
  })
}

// run the demo
loadJson().then(run)
