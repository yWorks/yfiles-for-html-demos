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
  Class,
  DefaultLabelStyle,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  IGraph,
  IInputMode,
  InteriorLabelModel,
  LayoutExecutor,
  License,
  NodeStylePortStyleAdapter,
  OrganicLayout,
  ShapeNodeStyle,
  Size,
  SmartEdgeLabelModel
} from 'yfiles'

import LabelStyleDecorator from './LabelStyleDecorator.js'
import EdgeStyleDecorator from './EdgeStyleDecorator.js'
import NodeStyleDecorator from './NodeStyleDecorator.js'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import graphData from './graph-data.json'

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  graphComponent.inputMode = createInputMode()
  configureGraph(graphComponent.graph)
  loadGraph(graphComponent)

  initializeUI(graphComponent)
}

/**
 * @param {!GraphComponent} graphComponent
 */
function loadGraph(graphComponent) {
  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(new OrganicLayout({ minimumNodeDistance: 100 }))
  graphComponent.fitGraphBounds()

  // add some bends
  for (const edge of graphComponent.graph.edges) {
    const sp = edge.sourcePort
    const tp = edge.targetPort
    graphComponent.graph.addBend(edge, sp.location.add(tp.location).multiply(0.5))
  }

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
}
/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 * @param {!IGraph} graph
 * @param {!JSONGraph} graphData
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  const nodesSource = graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id
  })
  nodesSource.nodeCreator.styleProvider = (item) =>
    item.tag
      ? new NodeStyleDecorator(
          graph.nodeDefaults.getStyleInstance(),
          `resources/${item.tag.toLowerCase()}.svg`
        )
      : undefined
  nodesSource.nodeCreator.createLabelBinding((item) => item.label)

  const edgesSource = graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })
  edgesSource.edgeCreator.tagProvider = (item) => item.tag
  edgesSource.edgeCreator.styleProvider = (item) =>
    item.tag ? graph.edgeDefaults.getStyleInstance() : undefined

  graphBuilder.buildGraph()
}

/**
 * Creates an input mode that supports interactive editing like e.g. creating new nodes and edges or
 * editing labels.
 * @returns {!IInputMode}
 */
function createInputMode() {
  const geim = new GraphEditorInputMode({
    allowEditLabel: true
  })

  // set a random traffic value to edges created interactively
  geim.createEdgeInputMode.addEdgeCreationStartedListener((_, evt) => {
    switch (Math.floor(Math.random() * 4)) {
      case 0:
        evt.item.tag = 'TRAFFIC_VERY_HIGH'
        break
      case 1:
        evt.item.tag = 'TRAFFIC_HIGH'
        break
      case 2:
        evt.item.tag = 'TRAFFIC_NORMAL'
        break
      case 3:
      default:
        evt.item.tag = 'TRAFFIC_LOW'
        break
    }
  })

  return geim
}

/**
 * Configures default styles for nodes and edges.
 * @param {!IGraph} graph
 */
function configureGraph(graph) {
  initDemoStyles(graph)

  graph.nodeDefaults.style = new NodeStyleDecorator(
    new ShapeNodeStyle({
      fill: '#46A8D5',
      stroke: null,
      shape: 'rectangle'
    }),
    'resources/workstation.svg'
  )
  graph.nodeDefaults.size = new Size(80, 40)
  graph.nodeDefaults.shareStyleInstance = false
  graph.edgeDefaults.style = new EdgeStyleDecorator(
    new NodeStylePortStyleAdapter({
      nodeStyle: new ShapeNodeStyle({
        fill: 'lightgray',
        stroke: null,
        shape: 'ellipse'
      }),
      renderSize: [5, 5]
    })
  )
  graph.nodeDefaults.labels.style = new LabelStyleDecorator(
    new DefaultLabelStyle({ textFill: '224556', backgroundFill: '#B4DBED' })
  )
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER

  graph.edgeDefaults.labels.style = new LabelStyleDecorator(new DefaultLabelStyle())
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createDefaultParameter()
  graph.edgeDefaults.shareStyleInstance = false
}

/**
 * Binds actions to the demo's UI controls.
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  document.querySelector('#reload').addEventListener('click', () => {
    graphComponent.graph.clear()
    loadGraph(graphComponent)
  })
}

run().then(finishLoading)
