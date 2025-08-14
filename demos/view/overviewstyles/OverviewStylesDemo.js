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
  CompactSubtreePlacer,
  Font,
  GraphBuilder,
  GraphComponent,
  GraphOverviewComponent,
  GraphViewerInputMode,
  LayoutExecutor,
  License,
  LineCap,
  OverviewInputMode,
  PolylineEdgeStyle,
  ShowFocusPolicy,
  Size,
  StretchNodeLabelModel,
  Stroke,
  TreeLayout
} from '@yfiles/yfiles'

import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'
import { HtmlLabelStyle } from './HtmlLabelStyle'
import graphData from './graph-data.json'
import { OverviewCanvasRenderer } from './OverviewCanvasRenderer'
import { OverviewSvgRenderer } from './OverviewSvgRenderer'
import { detailNodeStyleTemplate, overviewNodeStyleTemplate } from './style-templates'
import { createLitNodeStyleFromSource } from '@yfiles/demo-utils/LitNodeStyle'

/**
 * The GraphComponent
 */
let graphComponent

/**
 * The overview graph component that uses the Canvas and Svg visual creator.
 */
let overviewComponent

/**
 * The graph component that uses the overview inputMode to let the overview graph use the same
 * styles as the graphComponent.
 */
let overviewGraphComponent

const overviewStyleBox = document.querySelector('#graph-chooser-box')

/**
 * Runs the demo.
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.focusIndicatorManager.showFocusPolicy = ShowFocusPolicy.ALWAYS
  graphComponent.selectionIndicatorManager.enabled = false
  graphComponent.focusIndicatorManager.enabled = false

  graphComponent.inputMode = new GraphViewerInputMode()

  overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)

  // initialize the overview graph with SVG rendering
  overviewComponent.graphOverviewRenderer = new OverviewSvgRenderer()

  // initialize the overview graph that uses the same GraphComponent styles.
  // If you want the overview to use the same styles as the GraphComponent, you can use a GraphComponent to display the overview.
  overviewGraphComponent = new GraphComponent('overviewGraphComponent')
  overviewGraphComponent.inputMode = new OverviewInputMode({ canvasComponent: graphComponent })

  // Apply default styling
  const graph = graphComponent.graph
  initDemoStyles(graph)
  graph.nodeDefaults.style = createLitNodeStyleFromSource(detailNodeStyleTemplate)
  graph.nodeDefaults.size = new Size(285, 115)
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: new Stroke({ fill: '#FFAAAAAA', lineCap: LineCap.SQUARE, thickness: 2 })
  })
  graph.nodeDefaults.labels.layoutParameter = new StretchNodeLabelModel().createParameter('center')
  graphComponent.focusIndicatorManager.enabled = false

  // Labels get the HTML label style
  const font = new Font('Montserrat,sans-serif', 14)
  graph.nodeDefaults.labels.style = new HtmlLabelStyle(font)
  graph.edgeDefaults.labels.style = new HtmlLabelStyle(font)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(
    new TreeLayout({ defaultSubtreePlacer: new CompactSubtreePlacer() })
  )
  void graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true

  initializeUI()

  const initialStyle = overviewStyleBox.value
  overviewStyling(initialStyle)
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id
  }).nodeCreator.tagProvider = (item) => item.tag

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Styles the overview graph.
 * @param styleType The type of the styling selected with the combobox.
 */
function overviewStyling(styleType) {
  switch (styleType) {
    case 'SvgOverviewRenderer':
      const overviewSvgRenderer = new OverviewSvgRenderer()
      overviewSvgRenderer.nodeStyle = (_) => createLitNodeStyleFromSource(overviewNodeStyleTemplate)
      overviewComponent.graphOverviewRenderer = overviewSvgRenderer

      // updates the overview component then show the overview graph
      void overviewComponent.updateVisualAsync().then(() => {
        // hide the overview graph that uses the GraphComponent styles and show the overview graph that uses the canvas, SVG or WebGL creator
        overviewGraphComponent.htmlElement.classList.add('hide-component')
        overviewComponent.htmlElement.classList.remove('hide-component')
      })
      break
    case 'CanvasOverviewRenderer':
      overviewComponent.graphOverviewRenderer = new OverviewCanvasRenderer()

      // updates the overview component then show the overview graph
      void overviewComponent.updateVisualAsync().then(() => {
        // hides the overview graph that uses the GraphComponent styles and show the overview graph that uses the canvas, SVG or WebGL creator
        overviewGraphComponent.htmlElement.classList.add('hide-component')
        overviewComponent.htmlElement.classList.remove('hide-component')
      })
      break
    case 'OverviewInputMode':
      // sets the overview graph and fit the overview graph bounds
      overviewGraphComponent.graph = graphComponent.graph

      // updates the overview component then show the overview graph
      void overviewGraphComponent.updateVisualAsync().then(() => {
        // hides the overview graph that uses the canvas or Svg visual creator and show the overview graph that uses the GraphComponent styles
        overviewComponent.htmlElement.classList.add('hide-component')
        overviewGraphComponent.htmlElement.classList.remove('hide-component')
        void overviewGraphComponent.fitGraphBounds()
      })
      break
  }
}

/**
 * Registers the actions for the GUI elements, typically the
 * toolbar buttons, during the creation of this application.
 */
function initializeUI() {
  addNavigationButtons(overviewStyleBox).addEventListener('change', (evt) => {
    const selectedValue = evt.target.value
    overviewStyling(selectedValue)
  })
}

void run().then(finishLoading)
