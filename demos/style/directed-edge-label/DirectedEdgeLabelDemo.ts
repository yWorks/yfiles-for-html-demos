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
import {
  DefaultLabelStyle,
  EdgePathLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IEdge,
  IGraph,
  License,
  NodeStyleLabelStyleAdapter,
  OrthogonalEdgeEditingContext,
  Point,
  Size
} from 'yfiles'
import { bindCommand, checkLicense, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import { DirectedEdgeLabelStyle } from './DirectedEdgeLabelStyle'
import { initBasicDemoStyles } from '../../resources/basic-demo-styles'

function run(licenseData: object): void {
  License.value = licenseData

  const graphComponent = new GraphComponent('graphComponent')

  initBasicDemoStyles(graphComponent.graph, 'demo-palette-31')
  const labelStyle = graphComponent.graph.edgeDefaults.labels.style as DefaultLabelStyle
  labelStyle.minimumSize = new Size(0, 22)

  // Initialize the input mode
  graphComponent.inputMode = new GraphEditorInputMode({
    allowEditLabel: true,
    allowAddLabel: false,
    deletableItems: GraphItemTypes.ALL - GraphItemTypes.LABEL,
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext()
  })

  graphComponent.graph.addEdgeCreatedListener((sender, evt) => addLabels(sender, evt.item))

  // Create some graph elements
  createSampleGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  registerCommands(graphComponent)

  showApp(graphComponent)
}

const toSourceStyle = new DirectedEdgeLabelStyle(true)
toSourceStyle.arrowFill = 'red'

const toTargetStyle = new DirectedEdgeLabelStyle(false)
toTargetStyle.arrowFill = 'green'

function addLabels(graph: IGraph, edge: IEdge) {
  graph.addLabel(
    edge,
    'To Source',
    new EdgePathLabelModel(0, 0, 0, false, 'on-edge').createRatioParameter(0, 'on-edge'),
    toSourceStyle
  )

  graph.addLabel(
    edge,
    'Center',
    new EdgePathLabelModel(0, 0, 0, false, 'on-edge').createRatioParameter(0.5, 'on-edge')
  )

  graph.addLabel(
    edge,
    'To Target',
    new EdgePathLabelModel(0, 0, 0, false, 'on-edge').createRatioParameter(1, 'on-edge'),
    toTargetStyle
  )
}

/**
 * Creates the initial sample graph.
 */
function createSampleGraph(graph: IGraph): void {
  graph.createEdge({
    source: graph.createNodeAt([-100, -100]),
    target: graph.createNodeAt([-200, 100]),
    bends: [new Point(-100, 0), new Point(-200, 0)]
  })

  graph.createEdge({
    source: graph.createNodeAt([100, -100]),
    target: graph.createNodeAt([200, 100]),
    bends: [new Point(100, 0), new Point(200, 0)]
  })

  graph.createEdge({
    source: graph.createNodeAt([-200, 150]),
    target: graph.createNodeAt([200, 150]),
    bends: []
  })
}

function registerCommands(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// start demo
loadJson().then(checkLicense).then(run)
