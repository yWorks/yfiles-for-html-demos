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
  DefaultPortCandidate,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  ICommand,
  INode,
  IPortCandidateProvider,
  License,
  NodeStylePortStyleAdapter,
  PortsHandleProvider,
  Rect,
  ShapeNodeStyle,
  Size,
  StorageLocation
} from 'yfiles'

import DemoStyles, {
  DemoSerializationListener,
  initDemoStyles
} from '../../resources/demo-styles.js'
import CustomNodePortLocationModel from './CustomNodePortLocationModel.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * This demo shows how to create and use a custom label model.
 */
function run(licenseData) {
  License.value = licenseData
  // initialize graph component
  graphComponent = new GraphComponent('graphComponent')
  // initialize the input mode
  graphComponent.inputMode = new GraphEditorInputMode()

  // initialize the graph
  initializeGraph()

  // for selected nodes show the handles
  graphComponent.graph.decorator.nodeDecorator.handleProviderDecorator.setFactory(
    node => new PortsHandleProvider(node)
  )

  // for nodes add a custom port candidate provider implementation which uses our model
  graphComponent.graph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
    getPortCandidateProvider
  )

  // enable the graphml support
  enableGraphML()

  // bind UI elements to actions
  registerCommands()

  showApp(graphComponent)
}

/**
 * Callback used by the decorator in <see cref="CreateEditorMode"/>
 * @param {INode} forNode
 * @return {IPortCandidateProvider}
 */
function getPortCandidateProvider(forNode) {
  const model = new CustomNodePortLocationModel(10)
  return IPortCandidateProvider.fromCandidates([
    new DefaultPortCandidate(
      forNode,
      model.createCustomParameter(CustomNodePortLocationModel.PortLocation.CENTER)
    ),
    new DefaultPortCandidate(
      forNode,
      model.createCustomParameter(CustomNodePortLocationModel.PortLocation.NORTH)
    ),
    new DefaultPortCandidate(
      forNode,
      model.createCustomParameter(CustomNodePortLocationModel.PortLocation.EAST)
    ),
    new DefaultPortCandidate(
      forNode,
      model.createCustomParameter(CustomNodePortLocationModel.PortLocation.SOUTH)
    ),
    new DefaultPortCandidate(
      forNode,
      model.createCustomParameter(CustomNodePortLocationModel.PortLocation.WEST)
    )
  ])
}

/**
 * Enables loading and saving the graph to GraphML.
 */
function enableGraphML() {
  // create a new GraphMLSupport instance that handles save and load operations
  const gs = new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    DemoStyles
  )
  gs.graphMLIOHandler.addHandleSerializationListener(DemoSerializationListener)
  gs.graphMLIOHandler.addHandleSerializationListener(
    CustomNodePortLocationModel.CustomNodePortLocationModelParameter.serializationHandler
  )
  gs.graphMLIOHandler.addHandleDeserializationListener(
    CustomNodePortLocationModel.CustomNodePortLocationModelParameter.deserializationHandler
  )
}

/**
 * Sets a custom node port model parameter instance for newly created node ports in the graph,
 * creates a example nodes with a ports using the our model and an edge to connect the ports.
 */
function initializeGraph() {
  const graph = graphComponent.graph
  // set the defaults for nodes
  initDemoStyles(graph)
  graph.nodeDefaults.ports.locationParameter = new CustomNodePortLocationModel().createCustomParameter(
    CustomNodePortLocationModel.PortLocation.CENTER
  )

  const shapeNodeStyle = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: 'rgb(51, 102, 153)',
    stroke: null
  })
  graph.nodeDefaults.ports.style = new NodeStylePortStyleAdapter(shapeNodeStyle)
  graph.nodeDefaults.ports.style.renderSize = new Size(5, 5)
  graph.nodeDefaults.size = new Size(100, 100)

  const source = graph.createNode(new Rect(90, 90, 100, 100))
  const target = graph.createNode(new Rect(250, 90, 100, 100))

  // creates a port using the default declared above
  const sourcePort = graph.addPort(source)
  // creates a port using the custom model instance
  const targetPort = graph.addPort(
    target,
    new CustomNodePortLocationModel(10).createCustomParameter(
      CustomNodePortLocationModel.PortLocation.NORTH
    )
  )

  // create an edge
  graph.createEdge(sourcePort, targetPort)

  graphComponent.fitGraphBounds()
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    graphComponent.fitGraphBounds()
  })
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

loadJson().then(run)
