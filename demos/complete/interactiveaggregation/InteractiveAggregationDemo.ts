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
  Class,
  Color,
  DefaultLabelStyle,
  Fill,
  GenericLabeling,
  GraphComponent,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphViewerInputMode,
  ICommand,
  IEnumerable,
  IList,
  IModelItem,
  INode,
  INodeStyle,
  InteriorLabelModel,
  LayoutExecutor,
  License,
  ListEnumerable,
  NinePositionsEdgeLabelModel,
  OrganicLayout,
  Point,
  PolylineEdgeStyle,
  PopulateItemContextMenuEventArgs,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  SolidColorFill,
  Stroke,
  YObject
} from 'yfiles'

import { AggregationGraphWrapper, EdgeReplacementPolicy } from '../../utils/AggregationGraphWrapper'
import ContextMenu from '../../utils/ContextMenu'
import loadJson from '../../resources/load-json'
import { initDemoStyles } from '../../resources/demo-styles'
import { bindCommand, checkLicense, showApp } from '../../resources/demo-app'

Class.ensure(LayoutExecutor)

// @ts-ignore
let graphComponent: GraphComponent = null

// @ts-ignore
let aggregateGraph: AggregationGraphWrapper = null

// selectors for shape and/or color
const shapeSelector = (n: INode): ShapeNodeShape => (n.style as ShapeNodeStyle).shape

const fillColorSelector = (n: INode): Color => {
  const fill = (n.style as ShapeNodeStyle).fill! as SolidColorFill
  return fill.color
}

const shapeAndFillSelector = (n: INode): ShapeAndFill =>
  new ShapeAndFill(shapeSelector(n), fillColorSelector(n))

const grayBorder: Stroke = new Stroke('#77776E', 2.0)

// style factories for aggregation nodes
const shapeStyle = (shape: ShapeNodeShape): ShapeNodeStyle =>
  new ShapeNodeStyle({
    fill: '#C7C7A6',
    shape: shape,
    stroke: grayBorder
  })

const fillStyle = (fillColor: Color): ShapeNodeStyle =>
  new ShapeNodeStyle({
    fill: new SolidColorFill(fillColor),
    shape: ShapeNodeShape.ELLIPSE,
    stroke: grayBorder
  })

const shapeAndFillStyle = (shapeAndFill: ShapeAndFill): ShapeNodeStyle =>
  new ShapeNodeStyle({
    fill: new SolidColorFill(shapeAndFill.fillColor),
    shape: shapeAndFill.shape,
    stroke: grayBorder
  })

function run(licenseData: object): void {
  License.value = licenseData

  graphComponent = new GraphComponent('#graphComponent')

  // initialize the demo styles
  initDemoStyles(graphComponent.graph)

  // create and configure a new AggregationGraphWrapper
  aggregateGraph = new AggregationGraphWrapper(graphComponent.graph)

  // set default label text sizes for aggregation labels
  aggregateGraph.aggregationNodeDefaults.labels.style = new DefaultLabelStyle({ textSize: 32 })
  aggregateGraph.aggregationEdgeDefaults.labels.style = new DefaultLabelStyle({ textSize: 24 })

  // assign it to the graphControl
  graphComponent.graph = aggregateGraph

  // disable edge cropping, so thick aggregation edges run smoothly into nodes
  graphComponent.graph.decorator.portDecorator.edgePathCropperDecorator.hideImplementation()

  // don't create edges in both directions when replacing edges by aggregation edges
  aggregateGraph.edgeReplacementPolicy = EdgeReplacementPolicy.UNDIRECTED

  graphComponent.inputMode = new GraphViewerInputMode()

  configureContextMenu(graphComponent)

  registerAggregationCallbacks()

  registerCommands()

  loadGraph().then(() => graphComponent.fitGraphBounds())

  showApp(graphComponent)
}

function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
}

/**
 * Initializes the context menu.
 * @param {GraphComponent} graphComponent The graph component to which the context menu belongs
 */
function configureContextMenu(graphComponent: GraphComponent): void {
  const inputMode = graphComponent.inputMode as GraphViewerInputMode
  inputMode.contextMenuItems = GraphItemTypes.NODE

  // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, location => {
    if (inputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  inputMode.addPopulateItemContextMenuListener((sender, evt) =>
    populateContextMenu(contextMenu, graphComponent, evt)
  )

  // Add a listener that closes the menu when the input mode requests this
  inputMode.contextMenuInputMode.addCloseMenuListener(() => contextMenu.close())

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = (): void => inputMode.contextMenuInputMode.menuClosed()
}

/**
 * Fills the context menu with menu items based on the clicked node.
 */
function populateContextMenu(
  contextMenu: ContextMenu,
  sender: object,
  e: PopulateItemContextMenuEventArgs<IModelItem>
): void {
  e.showMenu = true

  // first update the selection
  const node = e.item as INode
  // if the cursor is over a node select it, else clear selection
  updateSelection(node)

  contextMenu.clearItems()

  // Create the context menu items
  const selectedNodes = graphComponent.selection.selectedNodes
  if (selectedNodes.size > 0) {
    // only allow aggregation operations on nodes that are not aggregation nodes already
    const aggregateAllowed = selectedNodes.some((n: INode) => !aggregateGraph.isAggregationItem(n))

    if (aggregateAllowed) {
      // add aggregation menu items

      contextMenu.addMenuItem('Aggregate Nodes with Same Shape', () =>
        aggregateSame(selectedNodes.toList(), shapeSelector, shapeStyle)
      )

      contextMenu.addMenuItem('Aggregate Nodes with Same Color', () =>
        aggregateSame(selectedNodes.toList(), fillColorSelector, fillStyle)
      )

      contextMenu.addMenuItem('Aggregate Nodes with Same Shape & Color', () =>
        aggregateSame(selectedNodes.toList(), shapeAndFillSelector, shapeAndFillStyle)
      )
    }

    const separateAllowed = selectedNodes.some((n: INode) => aggregateGraph.isAggregationItem(n))

    if (separateAllowed) {
      contextMenu.addMenuItem('Separate', () => separate(selectedNodes.toList()))
    }
  } else {
    // add generic aggregate / separate menu items

    contextMenu.addMenuItem('Aggregate All Nodes by Shape', () =>
      aggregateAll(shapeSelector, shapeStyle)
    )

    contextMenu.addMenuItem('Aggregate All Nodes by Color', () =>
      aggregateAll(fillColorSelector, fillStyle)
    )

    contextMenu.addMenuItem('Aggregate All Nodes by Shape & Color', () =>
      aggregateAll(shapeAndFillSelector, shapeAndFillStyle)
    )

    const separateAllowed = graphComponent.graph.nodes.some(node =>
      aggregateGraph.isAggregationItem(node)
    )

    if (separateAllowed) {
      contextMenu.addMenuItem('Separate All', () => {
        aggregateGraph.separateAll()
        // noinspection JSIgnoredPromiseFromCall
        runLayout()
      })
    }
  }
}

/**
 * Updates the node selection state when the context menu is opened on the node
 * If the node is null, the selection is cleared.
 * If the node is already selected, the selection keeps unchanged, otherwise the selection
 * is cleared and the node is selected.
 * @param node: The node to consider for the selection state
 */
function updateSelection(node: INode | null): void {
  // see if no node was hit
  if (node == null) {
    // clear the whole selection
    graphComponent.selection.clear()
  } else {
    // see if the node was selected, already and keep the selection in this case
    if (!graphComponent.selection.selectedNodes.isSelected(node)) {
      // no - clear the remaining selection
      graphComponent.selection.clear()
      // select the node
      graphComponent.selection.selectedNodes.setSelected(node, true)
      // also update the current item
      graphComponent.currentItem = node
    }
  }
}

function registerAggregationCallbacks(): void {
  const graph = graphComponent.graph

  graph.addNodeCreatedListener((sender, evt) => {
    if (aggregateGraph.isAggregationItem(evt.item)) {
      // add a label with the number of aggregated items to the new aggregation node
      graph.addLabel(
        evt.item,
        String(aggregateGraph.getAggregatedItems(evt.item).size),
        InteriorLabelModel.CENTER
      )
    }
  })

  graph.addEdgeCreatedListener((sender, evt) => {
    const edge = evt.item
    if (!aggregateGraph.isAggregationItem(edge)) {
      return
    }

    // add a label with the number of all original aggregated edges represented by the new aggregation edge
    const aggregatedEdgesCount = aggregateGraph.getAllAggregatedOriginalItems(edge).size

    // set the thickness to the number of aggregated edges
    graph.setStyle(
      edge,
      new PolylineEdgeStyle({
        stroke: new Stroke(Fill.GRAY, 1 + aggregatedEdgesCount)
      })
    )

    if (aggregatedEdgesCount > 1) {
      graph.addLabel(edge, String(aggregatedEdgesCount), NinePositionsEdgeLabelModel.CENTER_ABOVE)
    }
  })
}

async function loadGraph(): Promise<void> {
  const graphMLIOHandler = new GraphMLIOHandler()
  await graphMLIOHandler.readFromURL(graphComponent.graph, 'resources/sample.graphml')
}

/**
 * For all passed nodes, aggregates all nodes that match the given node by the selector.
 * After the aggregation a layout calculation is run.
 * @param nodes The nodes to aggregate by
 * @param selector The selector function to use for aggregation
 * @param styleFactory The style factory to use for the aggregation node
 */
function aggregateSame<TKey>(
  nodes: IList<INode>,
  selector: (arg: INode) => TKey,
  styleFactory: (style: TKey) => ShapeNodeStyle
): void {
  // get one representative of each kind of node (determined by the selector) ignoring aggregation nodes
  const distinctNodes: IList<INode> = nodes
    .filter(n => !aggregateGraph.isAggregationItem(n))
    .groupBy({
      keySelector: selector,
      resultCreator: (key, enumerable) => ({ key: key, enumerable: enumerable })
    })
    .map(grouping => grouping.enumerable.first())
    .toList()

  distinctNodes.forEach(node => {
    // aggregate all nodes of the same kind as the representing node
    const nodesOfSameKind = collectNodesOfSameKind(node, selector)
    aggregate(nodesOfSameKind, selector(node), styleFactory)
  })
  // noinspection JSIgnoredPromiseFromCall
  runLayout()
}

/**
 * Collects all un-aggregated nodes that match the kind of node by the selector.
 * @param node The node to match
 * @param selector The selector function to use for the node matching
 */
function collectNodesOfSameKind<TKey>(node: INode, selector: (arg: INode) => TKey): IList<INode> {
  const nodeKind = selector(node)
  return graphComponent.graph.nodes
    .filter(n => !aggregateGraph.isAggregationItem(n))
    .filter(n => YObject.equals(selector(n), nodeKind))
    .toList()
}

/**
 * Aggregates all nodes of the original graph by the selector and runs the layout.
 * Before aggregating the nodes, all existing aggregations are separated.
 * See {@link AggregationGraphWrapper.separateAll}.
 */
function aggregateAll<TKey>(
  selector: (arg: INode) => TKey,
  styleFactory: (arg: TKey) => INodeStyle
): void {
  aggregateGraph.separateAll()

  graphComponent.graph.nodes
    .groupBy({
      keySelector: selector,
      resultCreator: (key, enumerable) => ({ key: key, enumerable: enumerable })
    })
    .toList()
    .forEach(arg => {
      aggregate(arg.enumerable.toList(), arg.key, styleFactory)
    })

  // noinspection JSIgnoredPromiseFromCall
  runLayout()
}

/**
 * Aggregates the nodes to a new aggregation node.
 * Adds a label with the number of aggregated nodes and adds labels
 * to all created aggregation edges with the number of replaced original edges.
 * @param nodes The nodes to aggregate
 * @param key The key to use for the aggregation
 * @param styleFactory The style factory to use for the aggregation node
 */
function aggregate<TKey>(
  nodes: IList<INode>,
  key: TKey,
  styleFactory: (style: TKey) => INodeStyle
): void {
  const size = graphComponent.graph.nodeDefaults.size.multiply(1 + nodes.size * 0.2)
  const layout = Rect.fromCenter(Point.ORIGIN, size)
  aggregateGraph.aggregate(new ListEnumerable<INode>(nodes), layout, styleFactory(key))
}

/**
 * Separates all nodes and runs the layout afterwards.
 * @param nodes the nodes to separate
 */
function separate(nodes: IEnumerable<INode>): void {
  nodes.forEach(node => {
    if (aggregateGraph.isAggregationItem(node)) {
      aggregateGraph.separate(node)
    }
  })
  // noinspection JSIgnoredPromiseFromCall
  runLayout()
}

/**
 * Runs an organic layout with edge labeling.
 */
async function runLayout(): Promise<void> {
  const genericLabeling = new GenericLabeling({
    placeEdgeLabels: true,
    placeNodeLabels: false,
    reduceAmbiguity: true
  })

  const layout = new OrganicLayout({
    minimumNodeDistance: 60,
    nodeEdgeOverlapAvoided: true,
    labelingEnabled: true,
    labeling: genericLabeling
  })

  await graphComponent.morphLayout(layout, '1s')
}

/**
 * Helper class for aggregation by shape and fill.
 */
class ShapeAndFill {
  public shape: ShapeNodeShape
  public fillColor: Color

  constructor(shape: ShapeNodeShape, fillColor: Color) {
    this.shape = shape
    this.fillColor = fillColor
  }

  public equals(obj: ShapeAndFill): boolean {
    return obj.shape === this.shape && obj.fillColor.equals(this.fillColor)
  }
}

loadJson().then(checkLicense).then(run)
