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
  EdgePathLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  License,
  Point,
  Size
} from '@yfiles/yfiles'
import { DirectedEdgeLabelStyle } from './DirectedEdgeLabelStyle'
import { initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'

async function run() {
  License.value = licenseData

  const graphComponent = new GraphComponent('graphComponent')
  initDemoStyles(graphComponent.graph, { theme: 'demo-palette-31', orthogonalEditing: true })
  const labelStyle = graphComponent.graph.edgeDefaults.labels.style
  labelStyle.minimumSize = new Size(0, 22)

  // Initialize the input mode
  graphComponent.inputMode = new GraphEditorInputMode({
    allowEditLabel: true,
    allowAddLabel: false,
    deletableItems: GraphItemTypes.ALL - GraphItemTypes.LABEL
  })

  graphComponent.graph.addEventListener('edge-created', (evt, graphComponent) =>
    addLabels(graphComponent, evt.item)
  )

  // Create some graph elements
  createSampleGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()
}

const toSourceStyle = new DirectedEdgeLabelStyle(true)
toSourceStyle.arrowFill = 'red'

const toTargetStyle = new DirectedEdgeLabelStyle(false)
toTargetStyle.arrowFill = 'green'

function addLabels(graph, edge) {
  graph.addLabel(
    edge,
    'To Source',
    new EdgePathLabelModel(0, 0, 0, false, 'on-edge').createRatioParameter(0, 'on-edge'),
    toSourceStyle
  )

  graph.addLabel(
    edge,
    'Center',
    new EdgePathLabelModel(0, 0, 0, false, 'on-edge').createRatioParameter(0.5, 'on-edge')
  )

  graph.addLabel(
    edge,
    'To Target',
    new EdgePathLabelModel(0, 0, 0, false, 'on-edge').createRatioParameter(1, 'on-edge'),
    toTargetStyle
  )
}

/**
 * Creates the initial sample graph.
 */
function createSampleGraph(graph) {
  graph.createEdge({
    source: graph.createNodeAt([-100, -100]),
    target: graph.createNodeAt([-200, 100]),
    bends: [new Point(-100, 0), new Point(-200, 0)]
  })

  graph.createEdge({
    source: graph.createNodeAt([100, -100]),
    target: graph.createNodeAt([200, 100]),
    bends: [new Point(100, 0), new Point(200, 0)]
  })

  graph.createEdge({
    source: graph.createNodeAt([-200, 150]),
    target: graph.createNodeAt([200, 150]),
    bends: []
  })
}

run().then(finishLoading)
