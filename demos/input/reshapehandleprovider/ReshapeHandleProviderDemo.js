/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  IGraph,
  IReshapeHandleProvider,
  Key,
  KeyEventArgs,
  License,
  NodeStylePortStyleAdapter,
  OrthogonalEdgeEditingContext,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size
} from 'yfiles'

import { checkLicense, readGraph, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import { PortReshapeHandleProvider } from './PortReshapeHandlerProvider.js'

/** @type {GraphComponent} */
let graphComponent
/** @type {GraphEditorInputMode} */
let graphEditorInputMode

/**
 * Indicates whether or not the Ctrl modifier key is pressed.
 * @type {boolean}
 */
let ctrlPressed = false

/**
 * Registers a callback function as a decorator that provides a customized
 * {@link IReshapeHandleProvider} for each port with a {@link NodeStylePortStyleAdapter}.
 * This callback function is called whenever a node in the graph is queried
 * for its <code>IReshapeHandleProvider</code>. In this case, the 'port'
 * parameter will be set to that port.
 * @param {!IGraph} graph
 */
function registerReshapeHandleProvider(graph) {
  const portDecorator = graph.decorator.portDecorator
  portDecorator.getDecoratorFor(IReshapeHandleProvider.$class).setFactory(
    port => port.style instanceof NodeStylePortStyleAdapter,
    port => {
      return new PortReshapeHandleProvider(port, port.style, new Size(5, 5))
    }
  )
}

/**
 * @param {*} licenseData
 * @returns {!Promise}
 */
async function run(licenseData) {
  License.value = licenseData

  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')

  // initialize graph defaults
  initializeGraphDefaults(graphComponent.graph)

  // create a default editor input mode
  graphEditorInputMode = newEditorInputMode()
  // set the input mode to the graph control.
  graphComponent.inputMode = graphEditorInputMode

  // PortReshapeHandlerProvider considers pressed Ctrl keys.
  // Whenever Ctrl is pressed or released, we force GraphEditorInputMode to requery the handles
  // of selected items
  graphComponent.addKeyDownListener(onKeyDown)
  graphComponent.addKeyUpListener(onKeyUp)
  graphComponent.div.addEventListener('blur', onBlur)

  // register the reshape handle provider for ports
  registerReshapeHandleProvider(graphComponent.graph)

  // create initial graph
  await readGraph(new GraphMLIOHandler(), graphComponent.graph, 'resources/sample.graphml')
  graphComponent.fitGraphBounds()

  showApp(graphComponent)
}

/**
 * Configures default behavior and visualizations for the elements of the given graph.
 * @param {!IGraph} graph The graph to be configured.
 */
function initializeGraphDefaults(graph) {
  const adaptedStyle = new ShapeNodeStyle({
    fill: '#61A044',
    stroke: 'transparent'
  })
  graph.nodeDefaults.ports.style = new NodeStylePortStyleAdapter({
    nodeStyle: adaptedStyle,
    renderSize: new Size(7, 7)
  })
  // each port needs its own style instance to have its own render size
  graph.nodeDefaults.ports.shareStyleInstance = false
  // disable removing ports when all attached edges have been removed
  graph.nodeDefaults.ports.autoCleanUp = false

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '3px solid #2E282A'
  })
}

/**
 * Creates a new editor input mode to handle user interaction in this demo.
 * @returns {!GraphEditorInputMode}
 */
function newEditorInputMode() {
  // create a default editor input mode
  const mode = new GraphEditorInputMode()
  // ports are preferred for clicks
  mode.clickHitTestOrder = [
    GraphItemTypes.PORT,
    GraphItemTypes.PORT_LABEL,
    GraphItemTypes.BEND,
    GraphItemTypes.EDGE_LABEL,
    GraphItemTypes.EDGE,
    GraphItemTypes.NODE,
    GraphItemTypes.NODE_LABEL
  ]
  // enable orthogonal edge editing
  mode.orthogonalEdgeEditingContext = new OrthogonalEdgeEditingContext()

  return mode
}

/**
 * Triggers {@link GraphEditorInputMode.requeryHandles} when the Ctrl modifier key is pressed.
 * @param {*} sender
 * @param {!KeyEventArgs} e
 */
function onKeyDown(sender, e) {
  if (e.key === Key.CTRL && !ctrlPressed) {
    ctrlPressed = true
    // update handles
    graphEditorInputMode.requeryHandles()
  }
}

/**
 * Triggers {@link GraphEditorInputMode.requeryHandles} when the Ctrl modifier key is released.
 * @param {*} sender
 * @param {!KeyEventArgs} e
 */
function onKeyUp(sender, e) {
  if (e.key === Key.CTRL) {
    ctrlPressed = false
    // update handles
    graphEditorInputMode.requeryHandles()
  }
}

/**
 * Triggers {@link GraphEditorInputMode.requeryHandles} when the demo's graph component looses focus.
 */
function onBlur() {
  ctrlPressed = false
  // update handles
  graphEditorInputMode.requeryHandles()
}

loadJson().then(checkLicense).then(run)
