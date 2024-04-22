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
import {
  BridgeEdgeStyle,
  Class,
  Fill,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  ICommand,
  IGraph,
  License,
  PolylineEdgeStyle,
  SolidColorFill,
  Stroke
} from 'yfiles'

import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { TaperedArrow, TaperedArrowExtension } from './TaperedArrow.js'
import { colorSets } from 'demo-resources/demo-colors'
import { finishLoading } from 'demo-resources/demo-page'

/**
 * Runs the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize graph component
  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // initialize input mode
  graphComponent.inputMode = new GraphEditorInputMode()

  // configure GraphML so that custom arrows can be serialized and deserialized to this format
  createGraphMLIOHandler(graphComponent)

  // initialize demo styles
  initializeStyleDefaults(graphComponent.graph)

  // create the sample graph
  createSampleGraph(graphComponent)

  initializeUI(graphComponent)
}

/**
 * Configure GraphML so that custom arrows can be serialized and deserialized to this format.
 * @param {!GraphComponent} graphComponent The graphComponent.
 */
function createGraphMLIOHandler(graphComponent) {
  const gs = new GraphMLSupport({
    graphComponent,
    storageLocation: 'file-system'
  })
  const graphMLIOHandler = gs.graphMLIOHandler
  // ensure that these constants can be deserialized even when they have not yet been used yet
  Class.fixType(TaperedArrowExtension)
  graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/TaperedArrow/1.0',
    'TaperedArrow',
    TaperedArrowExtension.$class
  )
  // a serialization listener that must be added when the custom arrow style is serialized
  graphMLIOHandler.addHandleSerializationListener((_, evt) => {
    const item = evt.item
    if (!(item instanceof TaperedArrow)) {
      return
    }

    const markupExtension = new TaperedArrowExtension()
    markupExtension.width = item.width
    markupExtension.length = item.length
    markupExtension.fill = item.fill

    evt.context.serializeReplacement(TaperedArrowExtension.$class, item, markupExtension)
    evt.handled = true
  })
}

/**
 * Initializes the style defaults.
 * @param {!IGraph} graph The graph.
 */
function initializeStyleDefaults(graph) {
  initDemoStyles(graph)

  // default edge style with the following arrow configuration
  const taperedArrow = new TaperedArrow(5, 10, new SolidColorFill('#ab2346'))
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: new Stroke('#ab2346', 5),
    sourceArrow: taperedArrow,
    targetArrow: taperedArrow
  })
}

/**
 * Creates the sample graph for this demo.
 * @param {!GraphComponent} graphComponent The graphComponent to add the nodes to
 */
function createSampleGraph(graphComponent) {
  const graph = graphComponent.graph

  graph.clear()
  const node1 = graph.createNodeAt([0, 0])
  const node2 = graph.createNodeAt([300, 0])

  const heights = [-75, -50, -25, 0, 25, 50, 95]
  const edgeThicknesses = [1, 2, 3, 4, 5, 8, 10]
  const edgeColor = colorSets['demo-orange'].stroke

  for (let i = 0; i < heights.length; i++) {
    const height = heights[i]
    const width = edgeThicknesses[i]
    const taperedArrow = new TaperedArrow(width, 20, Fill.from(edgeColor))
    graph.createEdge(
      node1,
      node2,
      new BridgeEdgeStyle({
        stroke: new Stroke(edgeColor, width),
        height,
        fanLength: 0.4,
        sourceArrow: taperedArrow,
        targetArrow: taperedArrow
      })
    )
  }

  graphComponent.fitGraphBounds()
}

/**
 * Binds actions to the demo's UI controls.
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  document.querySelector('#reload').addEventListener('click', () => {
    graphComponent.graph.clear()
    createSampleGraph(graphComponent)
  })
}

run().then(finishLoading)
