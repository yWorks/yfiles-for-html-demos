/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Arrow,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  type IGraph,
  type INode,
  IPortCandidateProvider,
  License,
  PolylineEdgeStyle,
  PortCandidate,
  PortsHandleProvider,
  Rect,
  ShapePortStyle,
  Size
} from '@yfiles/yfiles'
import {
  CustomNodePortLocationModel,
  CustomNodePortLocationModelParameter,
  PortLocation
} from './CustomNodePortLocationModel'
import { createDemoNodeStyle, initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { openGraphML, saveGraphML } from '@yfiles/demo-utils/graphml-support'

let graphComponent: GraphComponent = null!

/**
 * This demo shows how to create and use a custom port model.
 */
async function run(): Promise<void> {
  License.value = licenseData
  // initialize graph component
  graphComponent = new GraphComponent('graphComponent')
  // initialize the input mode
  graphComponent.inputMode = new GraphEditorInputMode()

  // initialize the graph
  initializeGraph(graphComponent.graph)

  // center the graph in the graph component
  void graphComponent.fitGraphBounds()

  // for selected nodes show the handles
  graphComponent.graph.decorator.nodes.handleProvider.addFactory(
    (node: INode): PortsHandleProvider => new PortsHandleProvider(node)
  )

  // for nodes add a custom port candidate provider implementation which uses our model
  graphComponent.graph.decorator.nodes.portCandidateProvider.addFactory(getPortCandidateProvider)

  // enable the graphml support
  enableGraphML()
}

/**
 * Callback used by the decorator in {@link CreateEditorMode}.
 */
function getPortCandidateProvider(forNode: INode): IPortCandidateProvider {
  const model = new CustomNodePortLocationModel(10)
  return IPortCandidateProvider.fromCandidates([
    new PortCandidate(forNode, model.createCustomParameter(PortLocation.CENTER)),
    new PortCandidate(forNode, model.createCustomParameter(PortLocation.TOP)),
    new PortCandidate(forNode, model.createCustomParameter(PortLocation.RIGHT)),
    new PortCandidate(forNode, model.createCustomParameter(PortLocation.BOTTOM)),
    new PortCandidate(forNode, model.createCustomParameter(PortLocation.LEFT))
  ])
}

/**
 * Enables loading and saving the graph from/to GraphML.
 */
function enableGraphML(): void {
  // create a new graphMLIOHandler instance that handles save and load operations
  const graphMLIOHandler = new GraphMLIOHandler()
  graphMLIOHandler.addEventListener(
    'handle-serialization',
    CustomNodePortLocationModelParameter.serializationHandler
  )
  graphMLIOHandler.addEventListener(
    'handle-deserialization',
    CustomNodePortLocationModelParameter.deserializationHandler
  )
  document
    .querySelector<HTMLInputElement>('#open-file-button')!
    .addEventListener('click', async () => {
      await openGraphML(graphComponent, graphMLIOHandler)
    })
  document.querySelector<HTMLInputElement>('#save-button')!.addEventListener('click', async () => {
    await saveGraphML(graphComponent, 'customPortLocationModel.graphml', graphMLIOHandler)
  })
}

/**
 * Sets a custom node port model parameter instance for newly created node ports in the graph,
 * creates example nodes with ports using the custom model and an edge to connect the ports.
 */
function initializeGraph(graph: IGraph): void {
  // set the defaults for nodes
  initDemoStyles(graph)
  graph.nodeDefaults.style = createDemoNodeStyle('demo-palette-58')

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '3px #4E4E4E',
    targetArrow: new Arrow({ fill: '#4E4E4E', type: 'triangle' })
  })

  // set the default port location parameter (and thus implicitly the model as well)
  graph.nodeDefaults.ports.locationParameter = new CustomNodePortLocationModel(
    10
  ).createCustomParameter(PortLocation.CENTER)

  // set the default port style and size for this demo
  graph.nodeDefaults.ports.style = new ShapePortStyle({
    shape: 'ellipse',
    fill: '#ff6c00',
    stroke: null,
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
    new CustomNodePortLocationModel(10).createCustomParameter(PortLocation.TOP)
  )

  // create an edge
  graph.createEdge(sourcePort, targetPort)
}

run().then(finishLoading)
