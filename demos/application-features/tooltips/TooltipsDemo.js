/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Class,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeStyle,
  GroupNodeStyleTabPosition,
  HierarchicLayout,
  IEdge,
  IGraph,
  ILabel,
  IModelItem,
  INode,
  IPort,
  LayoutExecutor,
  License,
  Point,
  Size,
  TimeSpan,
  ToolTipQueryEventArgs
} from 'yfiles'

import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import graphData from './graph-data.json'

/** @type {GraphComponent} */
let graphComponent

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)

  // enable tooltips
  initializeTooltips()

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(
    new HierarchicLayout({
      considerNodeLabels: true,
      integratedEdgeLabeling: true
    })
  )
  graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Creates nodes and edges according to the given data.
 * @param {!IGraph} graph
 * @param {!JSONGraph} graphData
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder
    .createNodesSource({
      data: graphData.nodeList.filter(item => !item.isGroup),
      id: item => item.id,
      parentId: item => item.parentId
    })
    .nodeCreator.createLabelBinding(item => item.label)

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter(item => item.isGroup),
      id: item => item.id
    })
    .nodeCreator.createLabelBinding(item => item.label)

  graphBuilder
    .createEdgesSource({
      data: graphData.edgeList,
      sourceId: item => item.source,
      targetId: item => item.target
    })
    .edgeCreator.createLabelBinding(item => item.label)

  graphBuilder.buildGraph()
}

/**
 * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for
 * the {@link MouseHoverInputMode.addQueryToolTipListener QueryToolTip} event of the
 * GraphEditorInputMode using the
 * {@link ToolTipQueryEventArgs} parameter.
 * The {@link ToolTipQueryEventArgs} parameter provides three relevant properties:
 * Handled, QueryLocation, and ToolTip. The Handled property is a flag which indicates
 * whether the tooltip was already set by one of possibly several tooltip providers. The
 * QueryLocation property contains the mouse position for the query in world coordinates.
 * The tooltip is set by setting the ToolTip property.
 */
function initializeTooltips() {
  const inputMode = graphComponent.inputMode

  // Customize the tooltip's behavior to our liking.
  const mouseHoverInputMode = inputMode.mouseHoverInputMode
  mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
  mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(500)
  mouseHoverInputMode.duration = TimeSpan.fromSeconds(5)

  // Register a listener for when a tooltip should be shown.
  inputMode.addQueryItemToolTipListener((src, evt) => {
    if (evt.handled) {
      // Tooltip content has already been assigned -> nothing to do.
      return
    }

    // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
    evt.toolTip = createTooltipContent(evt.item)

    // Indicate that the tooltip content has been set.
    evt.handled = true
  })
}

/**
 * The tooltip may either be a plain string or it can also be a rich HTML element. In this case, we
 * show the latter. We just extract the first label text from the given item and show it as
 * tooltip.
 * Basic tooltip styling can be done using yfiles-tooltip CSS class (see index.html).
 * @param {!IModelItem} item
 * @returns {!HTMLElement}
 */
function createTooltipContent(item) {
  const title = document.createElement('h4')

  // depending on the item, show a different title
  if (INode.isInstance(item)) {
    title.innerHTML = 'Node Tooltip'
  } else if (IEdge.isInstance(item)) {
    title.innerHTML = 'Edge Tooltip'
  } else if (IPort.isInstance(item)) {
    title.innerHTML = 'Port Tooltip'
  } else if (ILabel.isInstance(item)) {
    title.innerHTML = 'Label Tooltip'
  }

  // extract the first label from the item
  let label = ''
  if (INode.isInstance(item) || IEdge.isInstance(item) || IPort.isInstance(item)) {
    if (item.labels.size > 0) {
      label = item.labels.first().text
    }
  } else if (ILabel.isInstance(item)) {
    label = item.text
  }
  const text = document.createElement('p')
  text.innerHTML = `Label: ${label}`

  // build the tooltip container
  const tooltip = document.createElement('div')
  tooltip.classList.add('tooltip')
  tooltip.appendChild(title)
  tooltip.appendChild(text)
  return tooltip
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param {!IGraph} graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
  initDemoStyles(graph)

  const groupNodeStyle = graph.groupNodeDefaults.style
  groupNodeStyle.tabPosition = GroupNodeStyleTabPosition.RIGHT
  groupNodeStyle.cornerRadius = 8

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

run().then(finishLoading)
