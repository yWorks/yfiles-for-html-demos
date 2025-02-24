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
  BridgeEdgeStyle,
  Color,
  Fill,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  IGraph,
  License,
  PolylineEdgeStyle,
  Stroke
} from '@yfiles/yfiles'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { TaperedArrow, TaperedArrowExtension } from './TaperedArrow'
import { colorSets } from '@yfiles/demo-resources/demo-colors'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { openGraphML, saveGraphML } from '@yfiles/demo-utils/graphml-support'
/**
 * Runs the demo.
 */
async function run() {
  License.value = await fetchLicense()
  // initialize graph component
  const graphComponent = new GraphComponent('#graphComponent')
  // initialize input mode
  graphComponent.inputMode = new GraphEditorInputMode()
  // initialize demo styles
  initializeStyleDefaults(graphComponent.graph)
  // create the sample graph
  createSampleGraph(graphComponent)
  initializeUI(graphComponent)
}
/**
 * Configure GraphML so that custom arrows can be serialized and deserialized to this format.
 */
function createGraphMLIOHandler() {
  const graphMLIOHandler = new GraphMLIOHandler()
  // ensure that these constants can be deserialized even when they have not yet been used yet
  graphMLIOHandler.addTypeInformation(TaperedArrow, {
    extension: (item) => {
      return TaperedArrowExtension.create(item)
    }
  })
  graphMLIOHandler.addTypeInformation(TaperedArrowExtension, {
    name: 'TaperedArrow',
    xmlNamespace: 'http://www.yworks.com/yFilesHTML/demos/TaperedArrow/1.0',
    properties: {
      fill: { default: Color.BLACK, type: Fill },
      length: { default: 0, type: Number },
      width: { default: 2, type: Number }
    }
  })
  return graphMLIOHandler
}
/**
 * Initializes the style defaults.
 * @param graph The graph.
 */
function initializeStyleDefaults(graph) {
  initDemoStyles(graph)
  // default edge style with the following arrow configuration
  const taperedArrow = new TaperedArrow(5, 10, Fill.from('#ab2346'))
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: new Stroke('#ab2346', 5),
    sourceArrow: taperedArrow,
    targetArrow: taperedArrow
  })
}
/**
 * Creates the sample graph for this demo.
 * @param graphComponent The graphComponent to add the nodes to
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
  void graphComponent.fitGraphBounds()
}
/**
 * Binds actions to the demo's UI controls.
 */
function initializeUI(graphComponent) {
  // configure GraphML so that custom arrows can be serialized and deserialized to this format
  const graphMLIOHandler = createGraphMLIOHandler()
  document.querySelector('#reload').addEventListener('click', () => {
    graphComponent.graph.clear()
    createSampleGraph(graphComponent)
  })
  document.querySelector('#open-file-button').addEventListener('click', async () => {
    await openGraphML(graphComponent, graphMLIOHandler)
  })
  document.querySelector('#save-button').addEventListener('click', async () => {
    await saveGraphML(graphComponent, 'arrowStyle.graphml', graphMLIOHandler)
  })
}
run().then(finishLoading)
