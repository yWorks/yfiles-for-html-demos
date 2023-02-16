/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import type { NodeLabelingPolicyStringValues } from 'yfiles'
import {
  CircularLayout,
  CircularLayoutData,
  CircularLayoutEdgeRoutingPolicy,
  CircularLayoutOnCircleRoutingStyle,
  CircularLayoutRoutingStyle,
  CircularLayoutStyle,
  Class,
  DefaultLabelStyle,
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  ICommand,
  IGraph,
  IModelItem,
  INode,
  LayoutExecutor,
  License,
  NodeTypeAwareSequencer,
  Point,
  Rect,
  ShapeNodeStyle,
  TimeSpan
} from 'yfiles'

import { bindChangeListener, bindCommand, showApp } from '../../resources/demo-app'
import { fetchLicense } from '../../resources/fetch-license'
import { applyDemoTheme } from '../../resources/demo-styles'
import { NonRibbonEdgeStyle } from './NonRibbonEdgeStyle'
import type { ColorSetName } from '../../resources/demo-colors'
import { colorSets } from '../../resources/demo-colors'
import { configureHighlight } from './HighlightSupport'

const predefinedColorSets = new Map<string, ColorSetName>([
  ['Engineering', 'demo-palette-42'],
  ['Executive Unit', 'demo-palette-43'],
  ['Production', 'demo-palette-44'],
  ['Sales', 'demo-palette-46'],
  ['Accounting', 'demo-palette-47'],
  ['Marketing', 'demo-palette-48']
])

/**
 * Runs this demo.
 */
async function run(): Promise<void> {
  Class.ensure(LayoutExecutor)

  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // configure the input mode to enable hovered tooltips
  configureInputMode(graphComponent)
  // configure the items to be highlighted on hover
  configureHighlight(graphComponent)

  // create an initial sample graph
  await initializeGraph(graphComponent.graph)

  // create and run the initial layout
  document.querySelector<HTMLSelectElement>('#labelStyleSelect')!.value = 'ray-like'
  await configureAndRunChordLayout(graphComponent, 'ray-like')

  // bind the buttons to their commands
  registerCommands(graphComponent)

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Creates and configures the input mode to display node information with tooltips.
 * @param graphComponent The given graphComponent
 */
function configureInputMode(graphComponent: GraphComponent) {
  const gvim = new GraphViewerInputMode()
  gvim.itemHoverInputMode.enabled = true

  const mouseHoverInputMode = gvim.mouseHoverInputMode
  mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
  mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(500)
  mouseHoverInputMode.duration = TimeSpan.fromSeconds(5)

  // Register a listener for when a tooltip should be shown.
  gvim.addQueryItemToolTipListener((src, eventArgs) => {
    if (eventArgs.handled || !INode.isInstance(eventArgs.item)) {
      // Tooltip content has already been assigned -> nothing to do.
      return
    }

    // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
    eventArgs.toolTip = createTooltipContent(eventArgs.item)

    // Indicate that the tooltip content has been set.
    eventArgs.handled = true
  })

  graphComponent.inputMode = gvim
}

/**
 * Creates the node tooltips.
 * @param item The item for which the tooltip is created
 */
function createTooltipContent(item: IModelItem): HTMLElement {
  const tooltip = document.createElement('div')
  tooltip.innerHTML =
    `<div style='margin-bottom: 1ex; font-weight: bold;'>${item.tag.name}</div>` +
    `<div style='margin-bottom: 1ex'>Position: ${item.tag.position}</div>` +
    `<div>Department: ${item.tag.department}</div>`
  return tooltip
}

/**
 * Loads the graph and sets the styles of the graph elements.
 * @param graph The graph.
 * @yjs:keep = connections
 */
async function initializeGraph(graph: IGraph): Promise<void> {
  // set the FreeNodeLabelModel as default layout parameter for the labels so that ray-like labeling is supported
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createDefaultParameter()

  // use a custom style for the edges to support Bézier curves with two colors
  graph.edgeDefaults.style = new NonRibbonEdgeStyle()

  // hide the selection/focus decorator
  const decorator = graph.decorator
  decorator.nodeDecorator.selectionDecorator.hideImplementation()
  decorator.edgeDecorator.selectionDecorator.hideImplementation()
  decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()
  decorator.edgeDecorator.focusIndicatorDecorator.hideImplementation()

  const graphData = await fetch('resources/GraphData.json').then(response => response.json())

  const builder = new GraphBuilder(graph)
  const nodesSource = builder.createNodesSource({
    // use bracket notation to access 'nodes' to prevent yWorks obfuscator from renaming it
    data: graphData['nodes'],
    id: 'id',
    labels: ['tag.name'],
    tag: 'tag'
  })

  nodesSource.nodeCreator.styleProvider = (data: any) => {
    const colorSet = colorSets[predefinedColorSets.get(data.tag?.department) || 'demo-palette-41']
    return new ShapeNodeStyle({
      shape: 'ellipse',
      fill: colorSet.fill,
      stroke: colorSet.stroke
    })
  }

  builder.createEdgesSource({
    // use bracket notation to access 'edges' to prevent yWorks obfuscator from renaming it
    data: graphData['edges'],
    sourceId: 'source',
    targetId: 'target',
    tag: 'tag'
  })

  builder.buildGraph()

  // sets the style for the labels
  graph.labels.forEach(label => {
    const colorSet =
      colorSets[predefinedColorSets.get(label.owner!.tag?.department) || 'demo-palette-41']
    graph.setStyle(
      label,
      new DefaultLabelStyle({
        backgroundFill: colorSet.nodeLabelFill,
        textFill: colorSet.text,
        insets: 3,
        shape: 'round-rectangle'
      })
    )
  })

  // normalizes the nodes based on the number of connections stored in the tag
  let minConnections = Number.MAX_VALUE
  let maxConnections = -Number.MAX_VALUE
  graph.nodes.forEach(node => {
    const connections = node.tag?.connections || 1
    minConnections = Math.min(minConnections, connections)
    maxConnections = Math.max(maxConnections, connections)
  })
  const connectionsDelta = maxConnections !== minConnections ? maxConnections - minConnections : 1

  const largest = 100
  const smallest = 40
  graph.nodes.forEach(node => {
    const connections = node.tag?.connections || 1
    const sizeScale = (largest - smallest) / connectionsDelta
    const size = Math.floor(smallest + (connections - minConnections) * sizeScale)
    graph.setNodeLayout(node, new Rect(node.layout.x, node.layout.y, size, size))
  })
}

/**
 * Binds commands to the buttons in the toolbar.
 * @param graphComponent The given graphComponent
 */
function registerCommands(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindChangeListener('#labelStyleSelect', async value => {
    await configureAndRunChordLayout(graphComponent, value as NodeLabelingPolicyStringValues)
  })
  document
    .querySelector<HTMLButtonElement>('#labelStyleRayLike')!
    .addEventListener('click', async () => {
      document.querySelector<HTMLSelectElement>('#labelStyleSelect')!.value = 'ray-like'
      await configureAndRunChordLayout(graphComponent, 'ray-like')
    })
  document
    .querySelector<HTMLButtonElement>('#labelStyleHorizontal')!
    .addEventListener('click', async () => {
      document.querySelector<HTMLSelectElement>('#labelStyleSelect')!.value = 'horizontal'
      await configureAndRunChordLayout(graphComponent, 'horizontal')
    })
}

/**
 * Configures the CircularLayout algorithm to produce a non-ribbon chord diagram.
 * @param graphComponent The given graphComponent.
 * @param labelingPolicy The selected labeling policy.
 */
async function configureAndRunChordLayout(
  graphComponent: GraphComponent,
  labelingPolicy: NodeLabelingPolicyStringValues
): Promise<void> {
  const chordLayout = new CircularLayout()
  // orders the nodes into a single circle
  chordLayout.layoutStyle = CircularLayoutStyle.SINGLE_CYCLE
  // sets edges to be routed inside the circle
  chordLayout.edgeRoutingPolicy = CircularLayoutEdgeRoutingPolicy.INTERIOR
  chordLayout.singleCycleLayout.minimumNodeDistance = 3
  //  sort the nodes based on their type using NodeTypeAwareSequencer
  chordLayout.singleCycleLayout.nodeSequencer = new NodeTypeAwareSequencer()

  // defines settings for the non-exterior edges
  const defaultEdgeLayoutDescriptor = chordLayout.defaultEdgeLayoutDescriptor
  defaultEdgeLayoutDescriptor.inCircleRoutingStyle = CircularLayoutRoutingStyle.CURVED
  defaultEdgeLayoutDescriptor.onCircleRoutingStyle = CircularLayoutOnCircleRoutingStyle.CURVED

  // since we use the BezierEdgeStyle, we need to determine the control points for the curves
  defaultEdgeLayoutDescriptor.createControlPoints = true

  // enables and configures the labeling algorithm
  chordLayout.integratedNodeLabeling = true
  chordLayout.nodeLabelingPolicy = labelingPolicy
  chordLayout.nodeLabelSpacing = 0

  // creates the layout data needed in order to sort the edges based on their type
  const chordLayoutData = new CircularLayoutData({
    nodeTypes: (node: INode) => node.tag?.department
  })

  // apply the layout
  await graphComponent.morphLayout(chordLayout, '.5s', chordLayoutData)
}

// noinspection JSIgnoredPromiseFromCall
run()
