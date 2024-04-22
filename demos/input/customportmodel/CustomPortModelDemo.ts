/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* eslint-disable @typescript-eslint/unbound-method */
import {
  DefaultPortCandidate,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  IGraph,
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
import {
  CustomNodePortLocationModel,
  CustomNodePortLocationModelParameter,
  PortLocation
} from './CustomNodePortLocationModel'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

let graphComponent: GraphComponent = null!

/**
 * This demo shows how to create and use a custom port model.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  // initialize graph component
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  // initialize the input mode
  graphComponent.inputMode = new GraphEditorInputMode()

  // initialize the graph
  initializeGraph(graphComponent.graph)

  // center the graph in the graph component
  graphComponent.fitGraphBounds()

  // for selected nodes show the handles
  graphComponent.graph.decorator.nodeDecorator.handleProviderDecorator.setFactory(
    (node: INode): PortsHandleProvider => new PortsHandleProvider(node)
  )

  // for nodes add a custom port candidate provider implementation which uses our model
  graphComponent.graph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
    getPortCandidateProvider
  )

  // enable the graphml support
  enableGraphML()
}

/**
 * Callback used by the decorator in {@link CreateEditorMode}.
 */
function getPortCandidateProvider(forNode: INode): IPortCandidateProvider {
  const model = new CustomNodePortLocationModel(10)
  // noinspection JSCheckFunctionSignatures
  return IPortCandidateProvider.fromCandidates([
    new DefaultPortCandidate(forNode, model.createCustomParameter(PortLocation.CENTER)),
    new DefaultPortCandidate(forNode, model.createCustomParameter(PortLocation.NORTH)),
    new DefaultPortCandidate(forNode, model.createCustomParameter(PortLocation.EAST)),
    new DefaultPortCandidate(forNode, model.createCustomParameter(PortLocation.SOUTH)),
    new DefaultPortCandidate(forNode, model.createCustomParameter(PortLocation.WEST))
  ])
}

/**
 * Enables loading and saving the graph from/to GraphML.
 */
function enableGraphML(): void {
  // create a new GraphMLSupport instance that handles save and load operations
  const gs = new GraphMLSupport({
    graphComponent,
    // configure loading and saving from/to the file system
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  gs.graphMLIOHandler.addHandleSerializationListener(
    CustomNodePortLocationModelParameter.serializationHandler
  )
  gs.graphMLIOHandler.addHandleDeserializationListener(
    CustomNodePortLocationModelParameter.deserializationHandler
  )
}

/**
 * Sets a custom node port model parameter instance for newly created node ports in the graph,
 * creates example nodes with ports using the the custom model and an edge to connect the ports.
 */
function initializeGraph(graph: IGraph): void {
  // set the defaults for nodes
  initDemoStyles(graph)

  // set the default port location parameter (and thus implicitly the model as well)
  graph.nodeDefaults.ports.locationParameter =
    new CustomNodePortLocationModel().createCustomParameter(PortLocation.CENTER)

  // set the default port style and size for this demo
  const shapeNodeStyle = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: '#224556',
    stroke: null
  })
  graph.nodeDefaults.ports.style = new NodeStylePortStyleAdapter({
    nodeStyle: shapeNodeStyle,
    renderSize: [10, 10]
  })
  graph.nodeDefaults.size = new Size(100, 100)

  const source = graph.createNode(new Rect(90, 90, 100, 100))
  const target = graph.createNode(new Rect(250, 90, 100, 100))

  // creates a port using the default declared above
  const sourcePort = graph.addPort(source)
  // creates a port using a custom model introduce
  const targetPort = graph.addPort(
    target,
    new CustomNodePortLocationModel(10).createCustomParameter(PortLocation.NORTH)
  )

  // create an edge
  graph.createEdge(sourcePort, targetPort)
}

run().then(finishLoading)
