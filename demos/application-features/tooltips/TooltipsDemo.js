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
  EdgePathLabelModel,
  EdgeSides,
  ExteriorNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeStyleTabPosition,
  HierarchicalLayout,
  IEdge,
  ILabel,
  INode,
  IPort,
  LayoutExecutor,
  License,
  Point,
  Size,
  TimeSpan
} from '@yfiles/yfiles'

import { initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import graphData from './graph-data.json'

let graphComponent

/**
 * Bootstraps the demo.
 */
async function run() {
  License.value = licenseData

  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode()

  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)

  // enable tooltips
  initializeTooltips()

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(new HierarchicalLayout())
  await graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder
    .createNodesSource({
      data: graphData.nodeList.filter((item) => !item.isGroup),
      id: (item) => item.id,
      parentId: (item) => item.parentId
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder
    .createEdgesSource({
      data: graphData.edgeList,
      sourceId: (item) => item.source,
      targetId: (item) => item.target
    })
    .edgeCreator.createLabelBinding((item) => item.label)

  graphBuilder.buildGraph()
}

/**
 * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for the 'query-item-tool-tip'
 * event of the {@link GraphEditorInputMode} using the {@link QueryItemToolTipEventArgs} parameter.
 * The {@link QueryItemToolTipEventArgs} parameter provides three relevant properties:
 * handled, queryLocation, and toolTip. The {@link QueryItemToolTipEventArgs.handled} property is a flag which indicates
 * whether the tooltip was already set by one of possibly several tooltip providers. The
 * {@link QueryItemToolTipEventArgs.queryLocation} property contains the mouse position for the query in world coordinates.
 * The {@link QueryItemToolTipEventArgs.toolTip} is set by setting the ToolTip property.
 */
function initializeTooltips() {
  const inputMode = graphComponent.inputMode

  // Customize the tooltip's behavior to our liking.
  const toolTipInputMode = inputMode.toolTipInputMode
  toolTipInputMode.toolTipLocationOffset = new Point(15, 15)
  toolTipInputMode.delay = TimeSpan.fromMilliseconds(500)
  toolTipInputMode.duration = TimeSpan.fromSeconds(5)

  // Register a listener for when a tooltip should be shown.
  inputMode.addEventListener('query-item-tool-tip', (evt) => {
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
 */
function createTooltipContent(item) {
  const title = document.createElement('h4')

  // depending on the item, show a different title
  if (item instanceof INode) {
    title.innerHTML = 'Node Tooltip'
  } else if (item instanceof IEdge) {
    title.innerHTML = 'Edge Tooltip'
  } else if (item instanceof IPort) {
    title.innerHTML = 'Port Tooltip'
  } else if (item instanceof ILabel) {
    title.innerHTML = 'Label Tooltip'
  }

  // extract the first label from the item
  let label = ''
  if (item instanceof INode || item instanceof IEdge || item instanceof IPort) {
    if (item.labels.size > 0) {
      label = item.labels.first().text
    }
  } else if (item instanceof ILabel) {
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
 * @param graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
  initDemoStyles(graph)

  const groupNodeStyle = graph.groupNodeDefaults.style
  groupNodeStyle.tabPosition = GroupNodeStyleTabPosition.RIGHT
  groupNodeStyle.cornerRadius = 8

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('bottom')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

run().then(finishLoading)
