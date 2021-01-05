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
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IGraph,
  INodeStyle,
  InteriorLabelModel,
  License,
  NodeStylePortStyleAdapter,
  Point,
  ShapeNodeStyle,
  SmartEdgeLabelModel
} from 'yfiles'

import { showApp, bindAction, bindCommand } from '../../resources/demo-app.js'
import LabelStyleDecorator from './LabelStyleDecorator.js'
import EdgeStyleDecorator from './EdgeStyleDecorator.js'
import NodeStyleDecorator from './NodeStyleDecorator.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import loadJson from '../../resources/load-json.js'
/** @type {GraphComponent} */
let graphComponent = null

/** @type {INodeStyle} */
let baseStyle = null

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  const graphEditorInputMode = new GraphEditorInputMode({
    allowEditLabel: true
  })

  // set a random traffic value to edges created interactively
  graphEditorInputMode.createEdgeInputMode.addEdgeCreatedListener((source, eventArgs) => {
    switch (Math.floor(Math.random() * 4)) {
      case 0:
        eventArgs.item.tag = 'TRAFFIC_VERY_HIGH'
        break
      case 1:
        eventArgs.item.tag = 'TRAFFIC_HIGH'
        break
      case 2:
        eventArgs.item.tag = 'TRAFFIC_NORMAL'
        break
      case 3:
      default:
        eventArgs.item.tag = 'TRAFFIC_LOW'
        break
    }
  })
  graphComponent.inputMode = graphEditorInputMode

  const graph = graphComponent.graph
  initDemoStyles(graph)

  baseStyle = new ShapeNodeStyle({
    fill: 'rgb(102, 153, 204)',
    stroke: null,
    shape: 'rectangle'
  })
  graph.nodeDefaults.style = new NodeStyleDecorator(baseStyle, 'resources/workstation.svg')
  graph.nodeDefaults.size = [80, 40]

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
    new DefaultLabelStyle({ textFill: 'white' })
  )
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER

  graph.edgeDefaults.labels.style = new LabelStyleDecorator(new DefaultLabelStyle())
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createDefaultParameter()

  createSampleGraph(graph)
  graphComponent.fitGraphBounds()

  registerCommands()

  showApp(graphComponent)
}

function registerCommands() {
  bindAction("button[data-command='Reload']", () => {
    graphComponent.graph.clear()
    createSampleGraph(graphComponent.graph)
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

/**
 * Creates the sample graph of this demo.
 * @param {IGraph} graph The graph to which nodes and edges are added
 */
function createSampleGraph(graph) {
  graph.clear()

  graph.createNodeAt({
    location: new Point(0, 0),
    style: new NodeStyleDecorator(baseStyle, 'resources/switch.svg'),
    tag: 'Root',
    labels: ['Root']
  })
  graph.createNodeAt({
    location: new Point(120, -50),
    style: new NodeStyleDecorator(baseStyle, 'resources/switch.svg'),
    tag: 'Switch',
    labels: ['Switch']
  })
  graph.createNodeAt({
    location: new Point(-130, 60),
    style: new NodeStyleDecorator(baseStyle, 'resources/switch.svg'),
    tag: 'Switch',
    labels: ['Switch']
  })
  graph.createNodeAt({
    location: new Point(95, -180),
    style: new NodeStyleDecorator(baseStyle, 'resources/scanner.svg'),
    tag: 'Scanner',
    labels: ['Scanner']
  })
  graph.createNodeAt({
    location: new Point(240, -110),
    style: new NodeStyleDecorator(baseStyle, 'resources/printer.svg'),
    tag: 'Printer',
    labels: ['Printer']
  })
  graph.createNodeAt({
    location: new Point(200, 50),
    style: new NodeStyleDecorator(baseStyle, 'resources/workstation.svg'),
    tag: 'Workstation',
    labels: ['Workstation']
  })
  graph.createNodeAt({
    location: new Point(-160, -60),
    style: new NodeStyleDecorator(baseStyle, 'resources/printer.svg'),
    tag: 'Printer',
    labels: ['Printer']
  })
  graph.createNodeAt({
    location: new Point(-260, 40),
    style: new NodeStyleDecorator(baseStyle, 'resources/scanner.svg'),
    tag: 'Scanner',
    labels: ['Scanner']
  })
  graph.createNodeAt({
    location: new Point(-200, 170),
    style: new NodeStyleDecorator(baseStyle, 'resources/workstation.svg'),
    tag: 'Workstation',
    labels: ['Workstation']
  })
  graph.createNodeAt({
    location: new Point(-50, 160),
    style: new NodeStyleDecorator(baseStyle, 'resources/workstation.svg'),
    tag: 'Workstation',
    labels: ['Workstation']
  })

  const nodes = graph.nodes.toArray()

  graph.createEdge({
    source: nodes[0],
    target: nodes[1],
    tag: 'TRAFFIC_VERY_HIGH'
  })
  graph.createEdge({
    source: nodes[0],
    target: nodes[2],
    tag: 'TRAFFIC_HIGH'
  })
  graph.createEdge({
    source: nodes[1],
    target: nodes[3],
    tag: 'TRAFFIC_HIGH'
  })
  graph.createEdge({
    source: nodes[1],
    target: nodes[4],
    tag: 'TRAFFIC_NORMAL'
  })
  graph.createEdge({
    source: nodes[1],
    target: nodes[5],
    tag: 'TRAFFIC_HIGH'
  })
  graph.createEdge({
    source: nodes[2],
    target: nodes[6],
    tag: 'TRAFFIC_LOW'
  })
  graph.createEdge({
    source: nodes[2],
    target: nodes[7],
    tag: 'TRAFFIC_LOW'
  })
  graph.createEdge({
    source: nodes[2],
    target: nodes[8],
    tag: 'TRAFFIC_NORMAL'
  })
  graph.createEdge({
    source: nodes[2],
    target: nodes[9],
    tag: 'TRAFFIC_LOW'
  })

  // add some bends
  const edges = graph.edges.toArray()
  edges.forEach(edge => {
    graph.addBend(
      edge,
      edge.sourcePort.location.add(
        edge.targetPort.location.subtract(edge.sourcePort.location).multiply(0.5)
      )
    )
  })
}

// start demo
loadJson().then(run)
