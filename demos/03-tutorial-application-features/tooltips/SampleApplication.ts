/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgeSegmentLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IEdge,
  IGraph,
  ILabel,
  IModelItem,
  INode,
  IPort,
  License,
  MouseHoverInputMode,
  Point,
  QueryItemToolTipEventArgs,
  Rect,
  Size,
  TimeSpan,
  ToolTipQueryEventArgs
} from 'yfiles'

import { addClass, bindAction, bindCommand, checkLicense, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import { initBasicDemoStyles } from '../../resources/basic-demo-styles'

// @ts-ignore
let graphComponent: GraphComponent = null

/**
 * Bootstraps the demo.
 */
function run(licenseData: object): void {
  License.value = licenseData
  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  graphComponent.graph.undoEngineEnabled = true

  // configures default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph)

  // enable tooltips
  initializeTooltips()

  // add a sample graph
  createGraph()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for
 * the {@link MouseHoverInputMode#addQueryToolTipListener QueryToolTip} event of the
 * GraphEditorInputMode using the
 * {@link ToolTipQueryEventArgs} parameter.
 * The {@link ToolTipQueryEventArgs} parameter provides three relevant properties:
 * Handled, QueryLocation, and ToolTip. The Handled property is a flag which indicates
 * whether the tooltip was already set by one of possibly several tooltip providers. The
 * QueryLocation property contains the mouse position for the query in world coordinates.
 * The tooltip is set by setting the ToolTip property.
 */
function initializeTooltips(): void {
  const inputMode = graphComponent.inputMode as GraphEditorInputMode

  // Customize the tooltip's behavior to our liking.
  const mouseHoverInputMode = inputMode.mouseHoverInputMode
  mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
  mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(500)
  mouseHoverInputMode.duration = TimeSpan.fromSeconds(5)

  // Register a listener for when a tooltip should be shown.
  inputMode.addQueryItemToolTipListener(
    (src: object, eventArgs: QueryItemToolTipEventArgs<IModelItem>): void => {
      if (eventArgs.handled) {
        // Tooltip content has already been assigned -> nothing to do.
        return
      }

      // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
      eventArgs.toolTip = createTooltipContent(eventArgs.item!)

      // Indicate that the tooltip content has been set.
      eventArgs.handled = true
    }
  )
}

/**
 * The tooltip may either be a plain string or it can also be a rich HTML element. In this case, we
 * show the latter. We just extract the first label text from the given item and show it as
 * tooltip.
 */
function createTooltipContent(item: IModelItem): HTMLElement {
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
  addClass(tooltip, 'tooltip')
  tooltip.appendChild(title)
  tooltip.appendChild(text)
  return tooltip
}

/**
 * Initializes the defaults for the styling in this tutorial.
 *
 * @param graph The graph.
 */
function initTutorialDefaults(graph: IGraph): void {
  // set styles that are the same for all tutorials
  initBasicDemoStyles(graph)

  // set sizes and locations specific for this tutorial
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Creates a simple sample graph.
 */
function createGraph(): void {
  const graph = graphComponent.graph

  const node1 = graph.createNodeAt({ location: [127.07, 20], labels: ['Node 1'] })
  const node2 = graph.createNodeAt({ location: [181.09, 138], labels: ['Node 2'] })
  const node3 = graph.createNodeAt({ location: [73.05, 138], labels: ['Node 3'] })
  const node4 = graph.createNodeAt({ location: [30, 281], labels: ['Node 4'] })
  const node5 = graph.createNodeAt({ location: [100, 281], labels: ['Node 5'] })

  const group = graph.groupNodes({ children: [node1, node2, node3], labels: ['Group 1'] })
  // Enlarge the group node slightly to ensure that all labels also fit inside the node.
  // They are typically not accounted for when calculating the group node size.
  graph.setNodeLayout(group, group.layout.toRect().getEnlarged({ bottom: 25, horizontal: 5 }))

  const edge1 = graph.createEdge({ source: node1, target: node2, labels: ['Edge 1'] })
  const edge2 = graph.createEdge({ source: node1, target: node3, labels: ['Edge 2'] })
  const edge3 = graph.createEdge({ source: node3, target: node4, labels: ['Edge 3'] })
  const edge4 = graph.createEdge({ source: node3, target: node5, labels: ['Edge 4'] })
  const edge5 = graph.createEdge({ source: node1, target: node5, labels: ['Edge 5'] })

  graph.setPortLocation(edge1.sourcePort!, new Point(140.1, 40))
  graph.setPortLocation(edge1.targetPort!, new Point(181.09, 118))
  graph.setPortLocation(edge2.sourcePort!, new Point(113.74, 40))
  graph.setPortLocation(edge2.targetPort!, new Point(73.05, 118))
  graph.setPortLocation(edge3.sourcePort!, new Point(63.05, 158))
  graph.setPortLocation(edge3.targetPort!, new Point(30, 261))
  graph.setPortLocation(edge4.sourcePort!, new Point(83.05, 158))
  graph.setPortLocation(edge4.targetPort!, new Point(90, 261))
  graph.setPortLocation(edge5.sourcePort!, new Point(127.07, 40))
  graph.setPortLocation(edge5.targetPort!, new Point(110, 261))
  graph.addBends(edge1, [new Point(140.4, 54), new Point(181.09, 74)])
  graph.addBends(edge2, [new Point(113.74, 54), new Point(73.05, 74)])
  graph.addBends(edge3, [new Point(63.05, 182), new Point(30, 202)])
  graph.addBends(edge4, [
    new Point(83.05, 182),
    new Point(88.05, 202),
    new Point(88.05, 226),
    new Point(90, 246)
  ])
  graph.addBends(edge5, [new Point(127.07, 226), new Point(110, 246)])

  graph.edgeLabels.forEach((label: ILabel): void => {
    const labelModel = new EdgeSegmentLabelModel({ autoRotation: false })
    graph.setLabelLayoutParameter(
      label,
      labelModel.createParameterFromSource(label.text !== 'Edge 5' ? 2 : 0, 0.5)
    )
  })

  graphComponent.fitGraphBounds()
  graph.undoEngine!.clear()
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands(): void {
  bindAction("button[data-command='New']", (): void => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
}

// start tutorial
loadJson().then(checkLicense).then(run)
