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
  Enum,
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  IGraph,
  License,
  ShapeNodeShape,
  ShapeNodeStyle
} from 'yfiles'

import {
  applyDemoTheme,
  colorSets,
  createDemoEdgeStyle,
  createDemoNodeLabelStyle,
  initDemoStyles
} from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

/**
 * Runs the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  initializeStyleDefaults(graphComponent.graph)

  // Create and configure nodes using shape node style
  createSampleNodes(graphComponent.graph)

  configureInteraction(graphComponent)
  graphComponent.fitGraphBounds()
  initializeUI(graphComponent)
}

/**
 * Creates several nodes for each {@link ShapeNodeShape} value.
 * @param {!IGraph} graph The graph to add the nodes to.
 */
function createSampleNodes(graph) {
  // Create the various shape samples
  const rectangularShapes = [
    ShapeNodeShape.RECTANGLE,
    ShapeNodeShape.ROUND_RECTANGLE,
    ShapeNodeShape.PILL
  ]
  const ellipticalShapes = [ShapeNodeShape.ELLIPSE]
  const skewedShapes = [
    ShapeNodeShape.DIAMOND,
    ShapeNodeShape.SHEARED_RECTANGLE,
    ShapeNodeShape.SHEARED_RECTANGLE2,
    ShapeNodeShape.TRAPEZ,
    ShapeNodeShape.TRAPEZ2
  ]
  const arrowShapes = [ShapeNodeShape.FAT_ARROW, ShapeNodeShape.FAT_ARROW2]
  const polygonalShapes = [
    ShapeNodeShape.TRIANGLE,
    ShapeNodeShape.TRIANGLE2,
    ShapeNodeShape.HEXAGON,
    ShapeNodeShape.HEXAGON2,
    ShapeNodeShape.OCTAGON
  ]
  const starShapes = [
    ShapeNodeShape.STAR5,
    ShapeNodeShape.STAR5_UP,
    ShapeNodeShape.STAR6,
    ShapeNodeShape.STAR8
  ]
  createShapeSamples(rectangularShapes, 0, graph)

  createShapeSamples(ellipticalShapes.concat(arrowShapes), 1, graph)
  createShapeSamples(skewedShapes, 2, graph)
  createShapeSamples(polygonalShapes, 3, graph)
  createShapeSamples(starShapes, 4, graph)
}

/**
 * Creates sample nodes for the given shapes.
 * @param {!Array.<ShapeNodeShape>} shapes The shapes to use.
 * @param {number} column The column index of the nodes.
 * @param {!IGraph} graph The graph to add the nodes to.
 */
function createShapeSamples(shapes, column, graph) {
  const size1 = 45
  const size2 = 90

  // Define colors for distinguishing the three different aspect ratios used below
  const fill1 = colorSets['demo-palette-54'].fill
  const fill2 = colorSets['demo-palette-56'].fill
  const fill3 = colorSets['demo-palette-510'].fill
  const stroke1 = colorSets['demo-palette-54'].stroke
  const stroke2 = colorSets['demo-palette-56'].stroke
  const stroke3 = colorSets['demo-palette-510'].stroke

  for (let i = 0; i < shapes.length; i++) {
    // Create a green node with aspect ratio 1:1
    const n1 = graph.createNode({
      layout: [column * 350 - size1 / 2, i * 200 - size1 / 2, size1, size1],
      style: new ShapeNodeStyle({
        shape: shapes[i],
        fill: fill1,
        stroke: stroke1
      })
    })

    // Create a blue node wit haspect ratio 2:1
    const n2 = graph.createNode({
      layout: [column * 350 + 100 - size2 / 2, i * 200 - size1 / 2, size2, size1],
      style: new ShapeNodeStyle({
        shape: shapes[i],
        fill: fill2,
        stroke: stroke2
      }),
      labels: [Enum.getName(ShapeNodeShape.$class, shapes[i])]
    })

    // Create a yellow node with aspect ratio 1:2
    const n3 = graph.createNode({
      layout: [column * 350 + 200 - size1 / 2, i * 200 - size2 / 2, size1, size2],
      style: new ShapeNodeStyle({
        shape: shapes[i],
        fill: fill3,
        stroke: stroke3
      })
    })

    graph.createEdge(n1, n2)
    graph.createEdge(n2, n3)
  }
}

/**
 * Initializes the style defaults for labels and edges.
 * @param {!IGraph} graph
 */
function initializeStyleDefaults(graph) {
  initDemoStyles(graph)

  // All node labels share the same style and label model parameter
  const labelStyle = createDemoNodeLabelStyle('demo-palette-58')
  labelStyle.font = '24px Arial'
  graph.nodeDefaults.labels.style = labelStyle
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createParameter({
    layoutRatio: [0.5, 0],
    layoutOffset: [0, -50],
    labelRatio: [0.5, 0.5]
  })

  // Edges share the same style as well, they are not important in this demo
  graph.edgeDefaults.style = createDemoEdgeStyle({ colorSetName: 'demo-palette-56' })
}

/**
 * Configures the interactive behavior for this demo.
 * @param {!GraphComponent} graphComponent
 */
function configureInteraction(graphComponent) {
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: false,
    marqueeSelectableItems: GraphItemTypes.NODE,
    allowCreateBend: false,
    allowCreateEdge: false,
    allowCreateNode: false,
    allowAddLabel: false,
    allowEditLabel: false,
    deletableItems: GraphItemTypes.NONE,
    movableItems: GraphItemTypes.NODE
  })
}

/**
 * Binds actions to the demo's UI controls.
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  const aspectRatioToggle = document.querySelector('#intrinsic-aspect-ratio-button')
  aspectRatioToggle.addEventListener('change', () => {
    // Change the keep-intrinsic-aspect-ratio behavior of the nodes depending on the state of the
    // corresponding toggle button
    const keepAspectRatio = aspectRatioToggle.checked
    for (const node of graphComponent.graph.nodes) {
      const shapeNodeStyle = node.style
      shapeNodeStyle.keepIntrinsicAspectRatio = keepAspectRatio
    }

    // Force the graph component to repaint itself
    // This ensures the visual effects of changing ShapeNodeStyle's keep-intrinsic-aspect-ratio
    // behavior is immediately visible
    graphComponent.invalidate()
  })
}

run().then(finishLoading)
