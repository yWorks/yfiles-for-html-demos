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
  CompositeLabelModel,
  EdgeSegmentLabelModel,
  FreeEdgeLabelModel,
  FreeLabelModel,
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ILabel,
  LabelStyleIndicatorRenderer,
  License,
  Size,
  StyleIndicatorZoomPolicy
} from '@yfiles/yfiles'
import LabelHandleProvider from './LabelHandleProvider'
import { createDemoNodeLabelStyle, initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { InteriorNodeLabelModel } from '@yfiles/yfiles/yfiles'
import { RotatableLabelSelectionStyle } from './RotatableLabelSelectionStyle'
let graphComponent
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  initializeGraph()
  initializeInputMode()
}
/**
 * Sets the default styles and creates the graph.
 */
function initializeGraph() {
  const graph = graphComponent.graph
  // add a custom handle provider for labels
  graph.decorator.labels.handleProvider.addFactory(getLabelHandleProvider)
  const labelDecorationRenderer = new LabelStyleIndicatorRenderer({
    labelStyle: new RotatableLabelSelectionStyle(),
    zoomPolicy: StyleIndicatorZoomPolicy.WORLD_COORDINATES
  })
  graphComponent.graph.decorator.labels.selectionRenderer.addConstant(
    (label) =>
      label.layoutParameter.model instanceof FreeNodeLabelModel ||
      label.layoutParameter.model instanceof FreeEdgeLabelModel ||
      label.layoutParameter.model instanceof FreeLabelModel,
    labelDecorationRenderer
  )
  initDemoStyles(graph)
  graphComponent.graph.nodeDefaults.size = new Size(100, 50)
  // Our resize logic does not work together with all label models resp. label model parameters
  // for simplicity, we just use a centered label for nodes
  const compositeLabelModel = new CompositeLabelModel()
  compositeLabelModel.addParameter(InteriorNodeLabelModel.CENTER)
  graph.nodeDefaults.labels.layoutParameter = compositeLabelModel.parameters.at(0)
  const labelModel = new EdgeSegmentLabelModel({ distance: 10 })
  graph.edgeDefaults.labels.layoutParameter = labelModel.createParameterFromSource(
    0,
    0.5,
    'right-of-edge'
  )
  // create sample graph
  const n1 = graph.createNodeAt({
    location: [100, 100],
    labels: ['Centered Node Label. Resizes symmetrically.']
  })
  const rotatingLabelStyle = createDemoNodeLabelStyle('demo-palette-13')
  rotatingLabelStyle.autoFlip = false
  const n2 = graph.createNodeAt({
    location: [500, 0],
    labels: [
      {
        text: 'Free Node Label.\nSupports rotation and asymmetric resizing',
        layoutParameter: new FreeNodeLabelModel().createParameter([0.5, 0.5], [0, 0], [0.5, 0.5]),
        style: rotatingLabelStyle
      }
    ]
  })
  graph.createEdge({
    source: n2,
    target: n1,
    labels: ['Rotated Edge Label']
  })
  graphComponent.fitGraphBounds()
}
/**
 * Returns the LabelHandleProvider for the given label.
 * @param label The given label
 */
function getLabelHandleProvider(label) {
  return new LabelHandleProvider(label)
}
/**
 * Initializes the input mode.
 */
function initializeInputMode() {
  const mode = new GraphEditorInputMode({
    // customize hit test order to simplify click selecting labels
    clickHitTestOrder: [
      GraphItemTypes.EDGE_LABEL,
      GraphItemTypes.NODE_LABEL,
      GraphItemTypes.BEND,
      GraphItemTypes.EDGE,
      GraphItemTypes.NODE,
      GraphItemTypes.PORT,
      GraphItemTypes.ALL
    ]
  })
  // add a label to each created node
  mode.addEventListener('node-created', (evt) => {
    const graph = graphComponent.graph
    graph.addLabel(evt.item, `Node ${graph.nodes.size}`)
  })
  graphComponent.inputMode = mode
}
run().then(finishLoading)
