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
  CompositeNodeStyle,
  ExteriorNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  ImageNodeStyle,
  License,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size
} from '@yfiles/yfiles'

import SampleData from './resources/SampleData'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { ScalingNodeStyle } from './ScalingNodeStyle'

/**
 * Bootstraps the demo.
 */
async function run() {
  License.value = licenseData

  // initialize graph component
  const graphComponent = new GraphComponent('#graphComponent')
  // configure user interaction
  graphComponent.inputMode = new GraphEditorInputMode()

  // create the style definitions from which to compose this demo's node visualizations
  const stylesDefinitions = createStyleDefinitions()

  // configures default styles for newly created graph elements
  configureGraph(graphComponent.graph, stylesDefinitions)

  // add a sample graph
  createGraph(graphComponent.graph, stylesDefinitions)

  // center the sample graph in the visible area
  void graphComponent.fitGraphBounds()

  // enable undo and redo
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Sets defaults styles for the given graph.
 */
function configureGraph(graph, styleDefinitions) {
  // specify a default node size that works well with the insets used in the given style definitions
  graph.nodeDefaults.size = new Size(96, 96)

  graph.nodeDefaults.style = createCompositeStyle(styleDefinitions, 'workstation')

  graph.nodeDefaults.labels.layoutParameter = ExteriorNodeLabelModel.BOTTOM

  graph.edgeDefaults.style = new PolylineEdgeStyle({ stroke: '2px #617984' })
}

/**
 * Creates a sample graph.
 */
function createGraph(graph, stylesDefinitions) {
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    labels: ['label'],
    layout: 'bounds',
    style: (data) => createCompositeStyle(stylesDefinitions, data.type)
  })
  builder.createEdgesSource({ data: SampleData.edges, id: 'id', sourceId: 'src', targetId: 'tgt' })
  builder.buildGraph()
}

/**
 * Creates a new {@link CompositeNodeStyle} instance with the default background and border from
 * the given style definitions as well as the requested icon from the given style definitions.
 * @param styleDefinitions the style definitions used to compose a new node style.
 * @param icon the icon to show in the composite node style instance.
 */
function createCompositeStyle(styleDefinitions, icon) {
  return new CompositeNodeStyle(
    styleDefinitions.background,
    styleDefinitions.border,
    styleDefinitions[icon]
  )
}

/**
 * Creates several style definitions to use with {@link CompositeNodeStyle}.
 */
function createStyleDefinitions() {
  return {
    // the main style for the nodes in this demo
    // aside from background visualization, this style is used for all style related operations
    // such as hit testing and visibility testing
    background: new ShapeNodeStyle({ stroke: null, fill: '#ddd', shape: 'ellipse' }),
    // the border visualization for the nodes in this demo
    border: new ShapeNodeStyle({ stroke: '3px #617984', fill: 'none', shape: 'ellipse' }),
    printer: new ScalingNodeStyle(new ImageNodeStyle('./resources/printer.svg'), 0.7, 0.5),
    router: new ScalingNodeStyle(new ImageNodeStyle('./resources/router.svg'), 0.7, 0.7),
    scanner: new ScalingNodeStyle(new ImageNodeStyle('./resources/scanner.svg'), 0.7, 0.4),
    server: new ScalingNodeStyle(new ImageNodeStyle('./resources/server.svg'), 0.4, 0.7),
    switch: new ScalingNodeStyle(new ImageNodeStyle('./resources/switch.svg'), 0.8, 0.3),
    workstation: new ScalingNodeStyle(new ImageNodeStyle('./resources/workstation.svg'), 0.7, 0.6)
  }
}

run().then(finishLoading)
