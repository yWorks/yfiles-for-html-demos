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
  CircularLayout,
  CircularLayoutData,
  CircularLayoutEdgeRoutingPolicy,
  CircularLayoutOnCircleRoutingStyle,
  CircularLayoutPartitioningPolicy,
  CircularLayoutRoutingStyle,
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  IModelItem,
  INode,
  LabelStyle,
  LayoutExecutor,
  License,
  Point,
  type RadialNodeLabelPlacementStringValues,
  Rect,
  ShapeNodeStyle,
  TimeSpan
} from '@yfiles/yfiles'

import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { NonRibbonEdgeStyle } from './NonRibbonEdgeStyle'
import type { ColorSetName } from '@yfiles/demo-resources/demo-colors'
import { colorSets } from '@yfiles/demo-resources/demo-colors'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { configureHighlight } from './configure-highlight'

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
  LayoutExecutor.ensure()

  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  // configure the input mode to enable hovered tooltips
  configureInputMode(graphComponent)
  // configure the items to be highlighted on hover
  configureHighlight(graphComponent)

  // create an initial sample graph
  await initializeGraph(graphComponent)

  // create and run the initial layout
  document.querySelector<HTMLSelectElement>('#labelStyleSelect')!.value = 'ray-like'
  await configureAndRunChordLayout(graphComponent, 'ray-like')

  // bind the buttons to their actions
  initializeUI(graphComponent)
}

/**
 * Creates and configures the input mode to display node information with tooltips.
 * @param graphComponent The given graphComponent
 */
function configureInputMode(graphComponent: GraphComponent) {
  const gvim = new GraphViewerInputMode()
  gvim.itemHoverInputMode.enabled = true

  const toolTipInputMode = gvim.toolTipInputMode
  toolTipInputMode.toolTipLocationOffset = new Point(15, 15)
  toolTipInputMode.delay = TimeSpan.fromMilliseconds(500)
  toolTipInputMode.duration = TimeSpan.fromSeconds(5)

  // Register a listener for when a tooltip should be shown.
  gvim.addEventListener('query-item-tool-tip', (evt) => {
    if (evt.handled || !(evt.item instanceof INode)) {
      // Tooltip content has already been assigned -> nothing to do.
      return
    }

    // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
    evt.toolTip = createTooltipContent(evt.item)

    // Indicate that the tooltip content has been set.
    evt.handled = true
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
 * @param graphComponent The component containing the graph.
 * @yjs:keep = connections
 */
async function initializeGraph(graphComponent: GraphComponent): Promise<void> {
  const graph = graphComponent.graph
  // set the FreeNodeLabelModel as default layout parameter for the labels so that ray-like labeling is supported
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.CENTER

  // use a custom style for the edges to support Bézier curves with two colors
  graph.edgeDefaults.style = new NonRibbonEdgeStyle()

  // hide the selection/focus indicators
  graph.decorator.nodes.selectionRenderer.hide()
  graph.decorator.edges.selectionRenderer.hide()
  graph.decorator.nodes.focusRenderer.hide()
  graph.decorator.edges.focusRenderer.hide()

  const graphData = await fetch('resources/GraphData.json').then((response) => response.json())

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
    return new ShapeNodeStyle({ shape: 'ellipse', fill: colorSet.fill, stroke: colorSet.stroke })
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
  graph.labels.forEach((label) => {
    const colorSet =
      colorSets[predefinedColorSets.get(label.owner.tag?.department) || 'demo-palette-41']
    graph.setStyle(
      label,
      new LabelStyle({
        backgroundFill: colorSet.nodeLabelFill,
        textFill: colorSet.text,
        padding: 3,
        shape: 'round-rectangle'
      })
    )
  })

  // normalizes the nodes based on the number of connections stored in the tag
  let minConnections = Number.MAX_VALUE
  let maxConnections = -Number.MAX_VALUE
  graph.nodes.forEach((node) => {
    const connections = node.tag?.connections || 1
    minConnections = Math.min(minConnections, connections)
    maxConnections = Math.max(maxConnections, connections)
  })
  const connectionsDelta = maxConnections !== minConnections ? maxConnections - minConnections : 1

  const largest = 100
  const smallest = 40
  graph.nodes.forEach((node) => {
    const connections = node.tag?.connections || 1
    const sizeScale = (largest - smallest) / connectionsDelta
    const size = Math.floor(smallest + (connections - minConnections) * sizeScale)
    graph.setNodeLayout(node, new Rect(node.layout.x, node.layout.y, size, size))
  })
}

/**
 * Binds actions to the buttons in the toolbar.
 * @param graphComponent The given graphComponent
 */
function initializeUI(graphComponent: GraphComponent): void {
  document
    .querySelector<HTMLSelectElement>('#labelStyleSelect')!
    .addEventListener('change', async (evt) => {
      await configureAndRunChordLayout(
        graphComponent,
        (evt.target as HTMLSelectElement).value as RadialNodeLabelPlacementStringValues
      )
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
  labelingPolicy: RadialNodeLabelPlacementStringValues
): Promise<void> {
  const chordLayout = new CircularLayout()
  // orders the nodes into a single circle
  chordLayout.partitioningPolicy = CircularLayoutPartitioningPolicy.SINGLE_CYCLE
  // sets edges to be routed inside the circle
  chordLayout.edgeRoutingPolicy = CircularLayoutEdgeRoutingPolicy.INTERIOR
  chordLayout.partitionDescriptor.minimumNodeDistance = 3

  // defines settings for the non-exterior edges
  const defaultEdgeDescriptor = chordLayout.edgeDescriptor
  defaultEdgeDescriptor.inCircleRoutingStyle = CircularLayoutRoutingStyle.CURVED
  defaultEdgeDescriptor.onCircleRoutingStyle = CircularLayoutOnCircleRoutingStyle.CURVED

  // since we use the BezierEdgeStyle, we need to determine the control points for the curves
  defaultEdgeDescriptor.createControlPoints = true

  // enables and configures the labeling algorithm
  chordLayout.nodeLabelPlacement = labelingPolicy
  chordLayout.nodeLabelSpacing = 0

  // creates the layout data needed in order to sort the edges based on their type
  const chordLayoutData = new CircularLayoutData({
    nodeTypes: (node: INode) => node.tag?.department
  })

  // apply the layout
  await graphComponent.applyLayoutAnimated(chordLayout, '.5s', chordLayoutData)
}

run().then(finishLoading)
