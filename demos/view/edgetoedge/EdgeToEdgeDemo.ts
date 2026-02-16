/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CreateEdgeInputMode,
  EdgePathPortLocationModel,
  EventRecognizers,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  GridConstraintProvider,
  GridInfo,
  IBend,
  type IEdge,
  IEdgePortHandleProvider,
  IEdgeReconnectionPortCandidateProvider,
  IHitTestable,
  IPortCandidateProvider,
  IPortLocationModel,
  type KeyEventArgs,
  License,
  OrthogonalEdgeEditingContext,
  Point,
  PolylineEdgeStyle,
  PortRelocationHandleProvider,
  ShapePortStyle,
  Stroke,
  Visualization
} from '@yfiles/yfiles'

import { EdgePathPortCandidateProvider } from './EdgePathPortCandidateProvider'
import { initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'

let graphComponent: GraphComponent

/**
 * This application demonstrates the use of edge-to-edge connections. Edges can be created interactively
 * between nodes, nodes and edges and between two edges. Also, this application enables moving the source or
 * target of an edge to another owner.
 *
 * Connecting the source or target of an edge to itself is prohibited since this is conceptually forbidden.
 * Edge-to-edge connections have to be enabled explicitly using the property
 * {@link CreateEdgeInputMode.allowEdgeToEdgeConnections}.
 *
 * This demo also includes customized implementations of {@link IPortCandidateProvider},
 * {@link IEdgeReconnectionPortCandidateProvider}, {@link IHitTestable},
 * {@link IEdgePortHandleProvider} and {@link IPortLocationModel}
 * to enable custom behavior like reconnecting an existing edge to another edge, starting edge creation from an edge
 * etc.
 */
async function run(): Promise<void> {
  License.value = licenseData

  graphComponent = new GraphComponent('graphComponent')
  initializeInputMode()

  initializeGraph()

  createSampleGraph()

  initializeUI()
}

/**
 * Initializes the graph instance setting default styles and customizing behavior.
 */
function initializeGraph(): void {
  const graph = graphComponent.graph

  graph.undoEngineEnabled = true

  initDemoStyles(graph)
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '1.5px #662b00',
    orthogonalEditing: true
  })
  graph.edgeDefaults.shareStyleInstance = false

  // assign a port style for the ports at the edges
  graph.edgeDefaults.ports.style = new ShapePortStyle({
    shape: 'ellipse',
    fill: 'black',
    stroke: null,
    renderSize: [3, 3]
  })

  // enable edge port candidates
  graph.decorator.edges.portCandidateProvider.addFactory(
    (edge) => new EdgePathPortCandidateProvider(edge)
  )

  // set IEdgeReconnectionPortCandidateProvider to allow re-connecting edges to other edges
  graph.decorator.edges.reconnectionPortCandidateProvider.addFactory((edge) =>
    IEdgeReconnectionPortCandidateProvider.fromAllNodeAndEdgeCandidates(edge)
  )
  graph.decorator.edges.handleProvider.addFactory((edge) => {
    const portRelocationHandleProvider = new PortRelocationHandleProvider(null, edge)
    portRelocationHandleProvider.visualization = Visualization.LIVE
    return portRelocationHandleProvider
  })
}

/**
 * Creates the {@link GraphSnapContext}.
 */
function createSnapContext(): GraphSnapContext {
  const snapContext = new GraphSnapContext({
    enabled: false,
    // disable grid snapping
    gridSnapType: 'none'
  })
  // add constraint provider for nodes, bends, and ports
  const gridInfo = new GridInfo(50, 50)
  snapContext.nodeGridConstraintProvider = new GridConstraintProvider(gridInfo)
  snapContext.bendGridConstraintProvider = new GridConstraintProvider(gridInfo)
  snapContext.portGridConstraintProvider = new GridConstraintProvider(gridInfo)
  return snapContext
}

/**
 * Initializes the input mode and enables edge-to-edge connections on the input mode.
 */
function initializeInputMode(): void {
  const mode = new GraphEditorInputMode({
    snapContext: createSnapContext(),
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext({ enabled: false })
  })

  mode.createEdgeInputMode.allowEdgeToEdgeConnections = true

  // create bends only when shift is pressed
  mode.createBendInputMode.beginRecognizer = (eventSource, evt) =>
    EventRecognizers.MOUSE_DOWN(eventSource, evt) &&
    EventRecognizers.SHIFT_IS_DOWN(eventSource, evt)

  mode.createEdgeInputMode.addEventListener('edge-creation-started', (evt) =>
    setRandomEdgeColor(evt.item)
  )

  // disable directional constraint recognizer because Shift is used for bend creation
  mode.handleInputMode.directionalConstraintRecognizer = (evt, eventSource) => {
    console.log(mode.handleInputMode.affectedItems.some((i) => i instanceof IBend))
    return (
      (evt as KeyEventArgs).key == 'Shift' &&
      !mode.handleInputMode.affectedItems.some((i) => i instanceof IBend)
    )
  }

  graphComponent.inputMode = mode
}

/**
 * Creates a small sample graph containing edge to edge connections.
 */
function createSampleGraph(): void {
  const graph = graphComponent.graph

  const n1 = graph.createNodeAt(new Point(0, 0))
  const n2 = graph.createNodeAt(new Point(500, 0))
  const n3 = graph.createNodeAt(new Point(0, 300))
  const n4 = graph.createNodeAt(new Point(500, 300))

  const e1 = graph.createEdge(n1, n3)
  const e2 = graph.createEdge(n2, n4)
  const e3 = graph.createEdge(n3, n4)

  graph.addBends(e3, [
    new Point(100, 300),
    new Point(100, 450),
    new Point(400, 450),
    new Point(400, 300)
  ])

  const p1 = graph.addPort(e1, EdgePathPortLocationModel.INSTANCE.createRatioParameter(0.4))
  const p2 = graph.addPort(e2, EdgePathPortLocationModel.INSTANCE.createRatioParameter(0.4))
  const e4 = graph.createEdge(p1, p2)
  const p3 = graph.addPort(e4, EdgePathPortLocationModel.INSTANCE.createRatioParameter(0.5))
  const p4 = graph.addPort(e3, EdgePathPortLocationModel.INSTANCE.createRatioParameter(0.8))
  const e5 = graph.createEdge(p3, p4)
  graph.addBend(e5, new Point(250, 360))

  graphComponent.fitGraphBounds()

  graph.undoEngine!.clear()
}

/**
 * Wires up the UI.
 */
function initializeUI(): void {
  const snappingButton = document.querySelector<HTMLInputElement>('#demo-snapping-button')!
  snappingButton.addEventListener('click', (evt) => {
    const inputMode = graphComponent.inputMode as GraphEditorInputMode
    inputMode.snapContext!.enabled = snappingButton.checked
  })

  const orthogonalEditingButton = document.querySelector<HTMLInputElement>(
    '#demo-orthogonal-editing-button'
  )!
  orthogonalEditingButton.addEventListener('click', () => {
    const inputMode = graphComponent.inputMode as GraphEditorInputMode
    inputMode.orthogonalEdgeEditingContext!.enabled = orthogonalEditingButton.checked
  })
}

/**
 * Creates a random colored pen and uses that one for the style.
 */
function setRandomEdgeColor(edge: IEdge): void {
  if (edge.style instanceof PolylineEdgeStyle) {
    edge.style.stroke = new Stroke(
      Math.round(Math.random() * 255),
      Math.round(Math.random() * 255),
      Math.round(Math.random() * 255),
      255,
      1.5
    )
  }
}

run().then(finishLoading)
