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
  AdjacencyTypes,
  FreeNodeLabelModel,
  IEdge,
  IEdgeStyle,
  IEnumerable,
  ILabelStyle,
  INode,
  INodeStyle,
  LabelStyle,
  List,
  NodeAggregate,
  NodeAggregationResult,
  Point,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle,
  Size
} from '@yfiles/yfiles'
import type { AggregationGraphWrapper } from '@yfiles/demo-utils/AggregationGraphWrapper'

/**
 * A helper class that provides methods to aggregate and separate nodes according to a {@link NodeAggregationResult}.
 *
 * Delegates most of it's work to an {@link AggregationGraphWrapper}. Implements some functionality on top:
 *
 * - When separating a node, this class creates a new aggregation node as replacement. This node represents the
 * hierarchy also in separated state and allows the user to aggregate its children again.
 * - Creates additional "hierarchy" edges between such nodes and its children.
 * - Since {@link NodeAggregate}s are allowed to both have children as well as represent an original node, the
 * aggregation nodes for such aggregates are special placeholder nodes that adopt its visual appearance, its labels, as
 * well as its edges to other nodes.
 */
export class AggregationHelper {
  /**
   * The {@link AggregationGraphWrapper} this instance uses.
   */
  public aggregateGraph: AggregationGraphWrapper

  /**
   * The edge style to be used for the artificial hierarchy edges.
   */
  public hierarchyEdgeStyle: IEdgeStyle

  /**
   * The style for labels that are created for aggregation nodes that don't directly represent an original node. Such
   * labels show the text of the most important descendant node.
   */
  public descendantLabelStyle: ILabelStyle

  /**
   * The style used for aggregation nodes (no matter which state). Should adapt to the {@link AggregationNodeInfo} in the node's tag.
   */
  public aggregationNodeStyle: INodeStyle

  /**
   * The aggregation result.
   */
  private $aggregationResult: NodeAggregationResult

  /**
   * Maps {@link NodeAggregate}s to aggregation nodes.
   */
  private readonly $aggregateToNode: Map<NodeAggregate, INode>

  /**
   * A map for placeholder nodes that maps original nodes to their aggregation placeholder node.
   */
  private readonly $placeholderMap: Map<INode, INode>

  public get visibleNodes(): number {
    return this.aggregateGraph
      ? this.aggregateGraph.nodes.filter((node) => this.isOriginalNodeOrPlaceHolder(node)).size
      : 0
  }

  public isOriginalNodeOrPlaceHolder(node: INode): boolean {
    return (
      !this.aggregateGraph.isAggregationItem(node) ||
      (!!node.tag && !!(node.tag as AggregationNodeInfo).aggregate.node)
    )
  }

  public isHierarchyEdge(edge: IEdge): boolean {
    return edge.tag === 'aggregation-edge'
  }

  public get visibleEdges(): number {
    return this.aggregateGraph ? this.aggregateGraph.edges.filter((e) => !e.tag).size : 0
  }

  /**
   * Creates a new instance of this class.
   */
  constructor(aggregationResult: NodeAggregationResult, aggregateGraph: AggregationGraphWrapper) {
    this.aggregateGraph = aggregateGraph
    this.$aggregationResult = aggregationResult

    this.$aggregateToNode = new Map<NodeAggregate, INode>()
    this.$placeholderMap = new Map<INode, INode>()

    this.aggregationNodeStyle = new ShapeNodeStyle({ shape: 'ellipse' })
    this.hierarchyEdgeStyle = new PolylineEdgeStyle()
    this.descendantLabelStyle = new LabelStyle()
  }

  /**
   * Returns the {@link NodeAggregate} for a node.
   */
  public getAggregateForNode(node: INode): NodeAggregate {
    if (this.aggregateGraph.isAggregationItem(node)) {
      return (node.tag as AggregationNodeInfo).aggregate
    } else {
      return this.$aggregationResult.aggregateMap.get(node)!
    }
  }

  /**
   * Returns the placeholder node for an original node or the original node itself if there is no placeholder.
   */
  public getPlaceholder(originalNode: INode): INode {
    const placeHolder = this.$placeholderMap.get(originalNode)
    return placeHolder || originalNode
  }

  /**
   * If a node is aggregated, calls {@link AggregationHelper.separate}, if not calls {@link AggregationHelper.aggregate}.
   * @param node The node.
   * @returns The nodes affected by this operation. The created aggregation node is always the first item.
   */
  public toggleAggregation(node: INode): IEnumerable<INode> {
    const aggregationNodeInfo = node.tag as AggregationNodeInfo
    return aggregationNodeInfo.isAggregated ? this.separate(node) : this.aggregate(node)
  }

  /**
   * Replaces a separated node and its hierarchy children with a new aggregation node.
   * @param node The node.
   * @returns The nodes affected by this operation. The created aggregation node is always the first item.
   */
  public aggregate(node: INode): IEnumerable<INode> {
    const aggregationInfo = node.tag as AggregationNodeInfo
    const aggregate = aggregationInfo.aggregate
    const aggregationNode = this.aggregateRecursively(aggregate)

    const affectedNodes = new List<INode>()
    if (aggregationNode) {
      affectedNodes.add(aggregationNode)

      const parentNode = this.$aggregateToNode.get(aggregate.parent!)
      if (parentNode) {
        this.aggregateGraph.createEdge(
          parentNode,
          aggregationNode,
          this.hierarchyEdgeStyle,
          'aggregation-edge'
        )
        affectedNodes.add(parentNode)
      }

      if (aggregate.node) {
        this.$replaceEdges(aggregationNode)
      }
    }

    return affectedNodes
  }

  /**
   * Aggregates the `aggregate` as well as all its children recursively.
   *
   * Can be used to apply the initial aggregation. If this is not the initial aggregation run, it will reuse existing aggregation nodes.
   *
   * @param aggregate The "root" aggregate.
   * @returns The aggregation node representing the passed `aggregate`
   */
  public aggregateRecursively(aggregate: NodeAggregate): INode {
    if (aggregate.children.size === 0) {
      return aggregate.node!
    }

    let originalCenter: Point
    const node = this.$aggregateToNode.get(aggregate)
    if (node) {
      originalCenter = node.layout.center
      const aggregationInfo = node.tag as AggregationNodeInfo
      if (aggregationInfo.isAggregated) {
        return node
      } else {
        this.aggregateGraph.separate(node)
      }
    } else {
      originalCenter = Point.ORIGIN
    }

    const nodesToAggregate = aggregate.children.map(this.aggregateRecursively.bind(this)).toList()
    if (aggregate.node) {
      nodesToAggregate.add(aggregate.node)
    }

    const size = 30 + Math.sqrt(aggregate.descendantWeightSum) * 4
    const layout = Rect.fromCenter(originalCenter, new Size(size, size))
    const aggregationNode = this.aggregateGraph.aggregate(
      nodesToAggregate,
      layout,
      this.aggregationNodeStyle
    )

    this.$aggregateToNode.set(aggregate, aggregationNode)
    aggregationNode.tag = new AggregationNodeInfo(aggregate, true)

    if (aggregate.node) {
      this.$placeholderMap.set(aggregate.node, aggregationNode)
      this.$copyLabels(aggregate.node, aggregationNode)
    } else {
      const maxChild = AggregationHelper.getMostImportantDescendant(aggregate)
      if (maxChild.node) {
        this.aggregateGraph.addLabel(
          aggregationNode,
          `(${maxChild.node.labels.get(0).text}, …)`,
          FreeNodeLabelModel.CENTER,
          this.descendantLabelStyle
        )
      }
    }

    return aggregationNode
  }

  /**
   * Gets the descendant {@link NodeAggregate} with the highest {@link NodeAggregate.descendantWeightSum}.
   */
  private static getMostImportantDescendant(aggregate: NodeAggregate): NodeAggregate {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const maxChild = aggregate.children.reduce((max, child) =>
        child.descendantWeightSum > max.descendantWeightSum ? child : max
      )
      if (maxChild.node) {
        return maxChild
      }
      aggregate = maxChild
    }
  }

  /**
   * Copies the labels from `source` to `target`.
   */
  private $copyLabels(source: INode, target: INode): void {
    for (const label of source.labels) {
      this.aggregateGraph.addLabel(target, label.text, FreeNodeLabelModel.CENTER, label.style)
    }
  }

  /**
   * Separates an aggregated aggregation node and replaces it by a new aggregation node.
   *
   * Creates hierarchy edges between the new aggregation node and its children.
   *
   * @param node The node.
   * @returns The nodes affected by this operation. The created aggregation node is always the first item.
   */
  public separate(node: INode): IEnumerable<INode> {
    const aggregationInfo = node.tag as AggregationNodeInfo
    const aggregate = aggregationInfo.aggregate
    const aggregatedItems = this.aggregateGraph
      .getAggregatedItems(node)
      .filter((n) => n !== aggregate.node)
      .toList()
    this.aggregateGraph.separate(node)

    const nodesToAggregate = aggregate.node
      ? AggregationHelper.initializer(new List<INode>(), aggregate.node)
      : IEnumerable.EMPTY
    const aggregationNode = this.aggregateGraph.aggregate(
      nodesToAggregate,
      node.layout.toRect(),
      this.aggregationNodeStyle,
      null
    )

    for (const child of aggregatedItems) {
      this.aggregateGraph.createEdge(
        aggregationNode,
        child,
        this.hierarchyEdgeStyle,
        'aggregation-edge'
      )
      this.aggregateGraph.setNodeLayout(
        child,
        Rect.fromCenter(aggregationNode.layout.center, child.layout.toSize())
      )
      this.$replaceEdges(child)
    }

    aggregationInfo.isAggregated = false
    this.$aggregateToNode.set(aggregate, aggregationNode)
    aggregationNode.tag = aggregationInfo

    const affectedNodes = new List<INode>()
    affectedNodes.add(aggregationNode)
    affectedNodes.addRange(aggregatedItems)

    if (aggregate.parent) {
      const parentNode = this.$aggregateToNode.get(aggregate.parent!)
      if (parentNode) {
        this.aggregateGraph.createEdge(
          parentNode,
          aggregationNode,
          this.hierarchyEdgeStyle,
          'aggregation-edge'
        )
        affectedNodes.add(parentNode)
      }
    }

    if (aggregate.node) {
      this.$placeholderMap.set(aggregate.node, aggregationNode)
      this.$copyLabels(aggregate.node, aggregationNode)
      this.$replaceEdges(aggregationNode)
    }

    return affectedNodes
  }

  private static initializer(instance: List<INode>, p1: INode): List<INode> {
    instance.add(p1)
    return instance
  }

  /**
   * Replaces original edges adjacent to a placeholder node with aggregation edges when source and target are currently visible.
   */
  private $replaceEdges(node: INode): void {
    const aggregationInfo = node.tag instanceof AggregationNodeInfo ? node.tag : null
    const originalNode = aggregationInfo ? aggregationInfo.aggregate.node : node

    if (!originalNode) {
      return
    }

    this.aggregateGraph
      .wrappedGraph!.edgesAt(originalNode, AdjacencyTypes.ALL)
      .toList()
      .forEach((edge) => {
        if (edge.targetPort.owner === originalNode) {
          this.$createReplacementEdge(edge.sourceNode, node, edge, true)
        } else {
          this.$createReplacementEdge(node, edge.targetPort.owner as INode, edge, false)
        }
      })
  }

  private $createReplacementEdge(
    sourceNode: INode,
    targetNode: INode,
    edge: IEdge,
    newSource: boolean
  ) {
    if (
      (newSource && this.aggregateGraph.contains(sourceNode)) ||
      (!newSource && this.aggregateGraph.contains(targetNode))
    ) {
      this.$createReplacementEdgeCore(sourceNode, targetNode, edge)
    } else {
      if (newSource) {
        const placeholderSource = this.$placeholderMap.get(sourceNode)
        if (placeholderSource && this.aggregateGraph.contains(placeholderSource)) {
          this.$createReplacementEdgeCore(placeholderSource, targetNode, edge)
        }
      } else {
        const placeholderTarget = this.$placeholderMap.get(targetNode)
        if (placeholderTarget && this.aggregateGraph.contains(placeholderTarget)) {
          this.$createReplacementEdgeCore(sourceNode, placeholderTarget, edge)
        }
      }
    }
  }

  private $createReplacementEdgeCore(sourceNode: INode, targetNode: INode, edge: IEdge): void {
    if (
      (this.aggregateGraph.isAggregationItem(sourceNode) ||
        this.aggregateGraph.isAggregationItem(targetNode)) &&
      !this.aggregateGraph.getEdge(sourceNode, targetNode) &&
      !this.aggregateGraph.getEdge(targetNode, sourceNode)
    ) {
      this.aggregateGraph.createEdge(sourceNode, targetNode, edge.style, null)
    }
  }
}

/**
 * The class for the tag of aggregation nodes.
 */
export class AggregationNodeInfo {
  private readonly $aggregate: NodeAggregate

  public get aggregate(): NodeAggregate {
    return this.$aggregate
  }

  public isAggregated = false

  constructor(aggregate: NodeAggregate, isAggregated: boolean) {
    this.$aggregate = aggregate
    this.isAggregated = isAggregated
  }
}
