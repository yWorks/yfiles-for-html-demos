/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  License,
  PolylineEdgeStyle
} from 'yfiles'
import SampleData from './D3ChartNodesData.js'
import D3ChartNodeStyle from './D3ChartNodeStyle.js'
import { bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

function run(licenseData) {
  License.value = licenseData

  // create a new graph component
  graphComponent = new GraphComponent('graphComponent')

  // load an initial graph
  loadSampleGraph()

  // initialize the input mode
  graphComponent.inputMode = new GraphEditorInputMode()
  graphComponent.inputMode.addNodeCreatedListener((sender, args) => {
    // put random data in tag of created node
    args.item.tag = createRandomSparklineData()
  })

  // set an interval to randomly change the sparkline data of some nodes
  setInterval(modifyData.bind(this), 500)

  // set up the UI
  registerCommands()

  showApp(graphComponent)
}

/**
 * Continuously modifies the node data used as the input for the
 * sparkline visualization to simulate updating data from a server.
 */
function modifyData() {
  graphComponent.graph.nodes.forEach(node => {
    if (Math.random() < 0.1) {
      node.tag = createRandomSparklineData()
    }
  })
  // make the graphComponent repaint it's content
  graphComponent.invalidate()
}

/**
 * Creates an array with random data.
 * @return {Object}
 */
function createRandomSparklineData() {
  const data = new Array(10 + Math.floor(Math.random() * 5))
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 10 + 1
  }
  return data
}

/**
 * Creates the initial sample graph.
 */
function loadSampleGraph() {
  // initialize the graph defaults
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new D3ChartNodeStyle()
  graph.nodeDefaults.size = [100, 50]
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 3
  }).createParameter(ExteriorLabelModelPosition.NORTH)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    backgroundFill: 'rgba(255, 255, 255, 0.6)',
    insets: [2, 3, 2, 3]
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle()

  const builder = new GraphBuilder({
    graph: graphComponent.graph,
    nodesSource: SampleData.nodes,
    edgesSource: SampleData.edges,
    sourceNodeBinding: 'source',
    targetNodeBinding: 'target',
    nodeIdBinding: 'id',
    nodeLabelBinding: tag => tag.label,
    locationXBinding: 'x',
    locationYBinding: 'y'
  })

  builder.buildGraph()

  // put random data in tag of each node
  graph.nodes.forEach(node => {
    node.tag = createRandomSparklineData()
  })

  graphComponent.fitGraphBounds()
}

/**
 * Connects the toolbar buttons with actions.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// start demo
loadJson().then(run)
