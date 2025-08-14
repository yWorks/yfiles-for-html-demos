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
  Color,
  type CssFill,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IEnumerable,
  IGraph,
  IList,
  IModelItem,
  INode,
  INodeStyle,
  InteriorNodeLabelModel,
  LabelingScope,
  LabelShape,
  LabelStyle,
  LayoutExecutor,
  License,
  NinePositionsEdgeLabelModel,
  OrganicLayout,
  Point,
  PolylineEdgeStyle,
  PopulateItemContextMenuEventArgs,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  Stroke
} from '@yfiles/yfiles'

import {
  AggregationGraphWrapper,
  EdgeReplacementPolicy
} from '@yfiles/demo-utils/AggregationGraphWrapper'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import type { JSONGraph } from '@yfiles/demo-utils/json-model'
import graphData from './graph-data.json'

LayoutExecutor.ensure()

let graphComponent: GraphComponent = null!

let aggregateGraph: AggregationGraphWrapper = null!

// selectors for shape and/or color
const shapeSelector = (n: INode): ShapeNodeShape => (n.style as ShapeNodeStyle).shape

const fillColorSelector = (n: INode): string => {
  const fill = (n.style as ShapeNodeStyle).fill! as CssFill
  return fill.value
}
const shapeAndFillSelector = (n: INode): ShapeAndFill =>
  new ShapeAndFill(shapeSelector(n), fillColorSelector(n))

const grayBorder: Stroke = new Stroke('#77776E', 2.0)

// style factories for aggregation nodes
const shapeStyle = (shape: ShapeNodeShape): ShapeNodeStyle =>
  new ShapeNodeStyle({ fill: '#C7C7A6', shape: shape, stroke: grayBorder })

const fillStyle = (fillColor: string): ShapeNodeStyle =>
  new ShapeNodeStyle({ fill: fillColor, shape: ShapeNodeShape.ELLIPSE, stroke: grayBorder })

const shapeAndFillStyle = (shapeAndFill: ShapeAndFill): ShapeNodeStyle =>
  new ShapeNodeStyle({
    fill: shapeAndFill.fillColor,
    shape: shapeAndFill.shape,
    stroke: grayBorder
  })

async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('#graphComponent')
  // initialize the demo styles
  initDemoStyles(graphComponent.graph)
  graphComponent.graph.nodeDefaults.size = new Size(40, 40)

  // then build and layout the graph with the given data set
  buildGraph(graphComponent.graph, graphData as unknown as JSONGraph)

  await runLayout()

  // Finally, enable the undo engine. This prevents undoing of the graph creation
  graphComponent.graph.undoEngineEnabled = true

  // create and configure a new AggregationGraphWrapper
  aggregateGraph = new AggregationGraphWrapper(graphComponent.graph)

  // set default label text sizes for aggregation labels
  aggregateGraph.aggregationNodeDefaults.labels.style = new LabelStyle({ textSize: 28 })
  aggregateGraph.aggregationEdgeDefaults.labels.style = new LabelStyle({
    textSize: 18,
    shape: LabelShape.PILL,
    backgroundFill: 'rgba(255,255,255,0.8)',
    padding: 4
  })

  // assign it to the graphComponent
  graphComponent.graph = aggregateGraph

  // disable edge cropping, so thick aggregation edges run smoothly into nodes
  graphComponent.graph.decorator.ports.edgePathCropper.hide()

  // don't create edges in both directions when replacing edges by aggregation edges
  aggregateGraph.edgeReplacementPolicy = EdgeReplacementPolicy.UNDIRECTED

  graphComponent.inputMode = new GraphViewerInputMode()

  configureContextMenu(graphComponent)

  registerAggregationCallbacks()

  void graphComponent.fitGraphBounds()
}

/**
 * Initializes the context menu.
 * @param graphComponent The graph component to which the context menu belongs
 */
function configureContextMenu(graphComponent: GraphComponent): void {
  const inputMode = graphComponent.inputMode as GraphViewerInputMode
  inputMode.contextMenuItems = GraphItemTypes.NODE

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  inputMode.addEventListener('populate-item-context-menu', (evt) => {
    populateContextMenu(graphComponent, evt)
  })
}

/**
 * Fills the context menu with menu items based on the clicked node.
 */
function populateContextMenu(
  _sender: object,
  evt: PopulateItemContextMenuEventArgs<IModelItem>
): void {
  // first update the selection
  const node = evt.item as INode
  // if the cursor is over a node select it, else clear selection
  updateSelection(node)

  // Create the context menu items
  const menuItems = []
  const selectedNodes = graphComponent.selection.nodes
  if (selectedNodes.size > 0) {
    // only allow aggregation operations on nodes that are not aggregation nodes already
    const aggregateAllowed = selectedNodes.some((n: INode) => !aggregateGraph.isAggregationItem(n))

    if (aggregateAllowed) {
      // add aggregation menu items
      menuItems.push({
        label: 'Aggregate Nodes with Same Shape',
        action: () => aggregateSame(selectedNodes.toList(), shapeSelector, shapeStyle)
      })
      menuItems.push({
        label: 'Aggregate Nodes with Same Color',
        action: () => aggregateSame(selectedNodes.toList(), fillColorSelector, fillStyle)
      })
      menuItems.push({
        label: 'Aggregate Nodes with Same Shape & Color',
        action: () => aggregateSame(selectedNodes.toList(), shapeAndFillSelector, shapeAndFillStyle)
      })
    }

    const separateAllowed = selectedNodes.some((n: INode) => aggregateGraph.isAggregationItem(n))
    if (separateAllowed) {
      menuItems.push({ label: 'Separate', action: () => separate(selectedNodes.toList()) })
    }
  } else {
    // add generic aggregate / separate menu items
    menuItems.push({
      label: 'Aggregate All Nodes by Shape',
      action: () => aggregateAll(shapeSelector, shapeStyle)
    })
    menuItems.push({
      label: 'Aggregate All Nodes by Color',
      action: () => aggregateAll(fillColorSelector, fillStyle)
    })
    menuItems.push({
      label: 'Aggregate All Nodes by Shape & Color',
      action: () => aggregateAll(shapeAndFillSelector, shapeAndFillStyle)
    })

    const separateAllowed = graphComponent.graph.nodes.some((node) =>
      aggregateGraph.isAggregationItem(node)
    )
    if (separateAllowed) {
      menuItems.push({
        label: 'Separate All',
        action: () => {
          aggregateGraph.separateAll()
          void runLayout()
        }
      })
    }
  }

  if (menuItems.length > 0) {
    evt.contextMenu = menuItems
  }
}

/**
 * Updates the node selection state when the context menu is opened on the node
 * If the node is null, the selection is cleared.
 * If the node is already selected, the selection for all other nodes is cleared.
 * @param node The node to consider for the selection state
 */
function updateSelection(node: INode | null): void {
  // see if no node was hit
  if (node == null) {
    // clear the whole selection
    graphComponent.selection.clear()
  } else {
    // see if the node was selected, already and keep the selection in this case
    if (!graphComponent.selection.nodes.includes(node)) {
      // no - clear the remaining selection
      graphComponent.selection.clear()
      // select the node
      graphComponent.selection.nodes.add(node)
      // also update the current item
      graphComponent.currentItem = node
    }
  }
}

function registerAggregationCallbacks(): void {
  const graph = graphComponent.graph

  graph.addEventListener('node-created', (evt) => {
    if (aggregateGraph.isAggregationItem(evt.item)) {
      // add a label with the number of aggregated items to the new aggregation node
      graph.addLabel(
        evt.item,
        String(aggregateGraph.getAggregatedItems(evt.item).size),
        InteriorNodeLabelModel.CENTER
      )
    }
  })

  graph.addEventListener('edge-created', (evt) => {
    const edge = evt.item
    if (!aggregateGraph.isAggregationItem(edge)) {
      return
    }

    // add a label with the number of all original aggregated edges represented by the new aggregation edge
    const aggregatedEdgesCount = aggregateGraph.getAllAggregatedOriginalItems(edge).size

    // set the thickness to the number of aggregated edges
    graph.setStyle(
      edge,
      new PolylineEdgeStyle({ stroke: new Stroke(Color.GRAY, Math.max(2, aggregatedEdgesCount)) })
    )

    if (aggregatedEdgesCount > 1) {
      graph.addLabel(edge, String(aggregatedEdgesCount), NinePositionsEdgeLabelModel.CENTER_ABOVE)
    }
  })
}

/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id,
    parentId: (item) => item.parentId
  }).nodeCreator.styleProvider = (item) => nodeStyles[item.tag as string]

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

const nodeStyles: Record<string, any> = {
  blueRectangle: new ShapeNodeStyle({
    fill: '#67b7dc',
    stroke: '#617984',
    shape: ShapeNodeShape.RECTANGLE
  }),
  blueOctagon: new ShapeNodeStyle({
    fill: '#67b7dc',
    stroke: '#617984',
    shape: ShapeNodeShape.OCTAGON
  }),
  blueDiamond: new ShapeNodeStyle({
    fill: '#67b7dc',
    stroke: '#617984',
    shape: ShapeNodeShape.DIAMOND
  }),
  greenRectangle: new ShapeNodeStyle({
    fill: '#177E89',
    stroke: '#304F52',
    shape: ShapeNodeShape.RECTANGLE
  }),
  greenOctagon: new ShapeNodeStyle({
    fill: '#177E89',
    stroke: '#304F52',
    shape: ShapeNodeShape.OCTAGON
  }),
  greenDiamond: new ShapeNodeStyle({
    fill: '#177E89',
    stroke: '#304F52',
    shape: ShapeNodeShape.DIAMOND
  }),
  purpleRectangle: new ShapeNodeStyle({
    fill: '#aa4586',
    stroke: '#66485B',
    shape: ShapeNodeShape.RECTANGLE
  }),
  purpleOctagon: new ShapeNodeStyle({
    fill: '#aa4586',
    stroke: '#66485B',
    shape: ShapeNodeShape.OCTAGON
  }),
  purpleDiamond: new ShapeNodeStyle({
    fill: '#aa4586',
    stroke: '#66485B',
    shape: ShapeNodeShape.DIAMOND
  })
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
    .filter((n) => !aggregateGraph.isAggregationItem(n))
    .groupBy(selector, (key, enumerable) => ({ key: key, enumerable: enumerable }))
    .map((grouping) => grouping.enumerable.first()!)
    .toList()

  distinctNodes.forEach((node) => {
    // aggregate all nodes of the same kind as the representing node
    const nodesOfSameKind = collectNodesOfSameKind(node, selector)
    aggregate(nodesOfSameKind, selector(node), styleFactory)
  })

  void runLayout()
}

/**
 * Collects all un-aggregated nodes that match the kind of node by the selector.
 * @param node The node to match
 * @param selector The selector function to use for the node matching
 */
function collectNodesOfSameKind<TKey>(node: INode, selector: (arg: INode) => TKey): IList<INode> {
  const nodeKind = selector(node)
  return graphComponent.graph.nodes
    .filter((n) => !aggregateGraph.isAggregationItem(n))
    .filter((n) => equals(selector(n), nodeKind))
    .toList()
}

function equals(o1: unknown, o2: unknown) {
  if (o1 == o2) {
    return true
  }
  type HasEquals = { equals: (other: unknown) => boolean } | undefined | null
  const o1Equals = o1 as HasEquals
  if (o1Equals && typeof o1Equals.equals === 'function') {
    return o1Equals.equals(o2)
  }
  const o2Equals = o2 as HasEquals
  if (o2Equals && typeof o2Equals.equals === 'function') {
    return o2Equals.equals(o1)
  }
  return false
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
    .groupBy(selector, (key, enumerable) => ({ key: key, enumerable: enumerable }))
    .toList()
    .forEach((arg) => {
      aggregate(arg.enumerable.toList(), arg.key, styleFactory)
    })

  void runLayout()
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
  const size = Math.sqrt(graphComponent.graph.nodeDefaults.size.width * nodes.size) * 5
  const layout = Rect.fromCenter(Point.ORIGIN, new Size(size, size))
  aggregateGraph.aggregate(nodes, layout, styleFactory(key))
}

/**
 * Separates all nodes and runs the layout afterward.
 * @param nodes the nodes to separate
 */
function separate(nodes: IEnumerable<INode>): void {
  nodes.forEach((node) => {
    if (aggregateGraph.isAggregationItem(node)) {
      aggregateGraph.separate(node)
    }
  })

  void runLayout()
}

/**
 * Runs an organic layout with edge labeling.
 */
async function runLayout(): Promise<void> {
  const layout = new OrganicLayout({
    defaultMinimumNodeDistance: 80,
    defaultPreferredEdgeLength: 100,
    genericLabeling: {
      enabled: true,
      scope: LabelingScope.EDGE_LABELS,
      defaultEdgeLabelingCosts: { ambiguousPlacementCost: 1.0 }
    }
  })

  await graphComponent.applyLayoutAnimated(layout, '1s')
}

/**
 * Helper class for aggregation by shape and fill.
 */
class ShapeAndFill {
  public shape: ShapeNodeShape
  public fillColor: string

  constructor(shape: ShapeNodeShape, fillColor: string) {
    this.shape = shape
    this.fillColor = fillColor
  }

  public equals(obj: ShapeAndFill): boolean {
    return obj.shape === this.shape && obj.fillColor === this.fillColor
  }
}

run().then(finishLoading)
