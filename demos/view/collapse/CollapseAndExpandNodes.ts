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
/* eslint-disable no-unused-vars */
import {
  Bfs,
  CompositeLayoutData,
  FilteredGraphWrapper,
  GraphComponent,
  HashMap,
  HierarchicalLayout,
  HierarchicalLayoutData,
  IGraph,
  ILayoutAlgorithm,
  IList,
  INode,
  LayoutAnchoringPolicy,
  LayoutAnchoringStageData,
  List,
  OrganicLayout,
  OrganicLayoutData,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  TimeSpan
} from '@yfiles/yfiles'

/**
 * Provides utility function for collapsing and expanding nodes as well as configuring layout
 * algorithms.
 */
export class CollapseAndExpandNodes {
  private nodeCollapsedMap: HashMap<INode, boolean> = new HashMap()
  private nodeVisibility: HashMap<INode, boolean> = new HashMap()

  constructor(private graphComponent: GraphComponent) {}

  /**
   * Sets the given node's collapsed state.
   * @param node The node whose state is set.
   * @param collapsed The given node's new state.
   */
  setCollapsed(node: INode, collapsed: boolean): void {
    this.nodeCollapsedMap.set(node, collapsed)
  }

  /**
   * Gets the given node's collapsed state.
   * @param node The node whose state is queried.
   */
  isCollapsed(node: INode): boolean {
    return !!this.nodeCollapsedMap.get(node)
  }

  /**
   * Sets the given node's visibility.
   * @param node The node whose state is set.
   * @param visible The given node's new state.
   */
  setNodeVisibility(node: INode, visible: boolean): void {
    this.nodeVisibility.set(node, visible)
  }

  /**
   * Gets the given node's visibility.
   * @param node The node whose state is queried.
   */
  getNodeVisibility(node: INode): boolean {
    return !!this.nodeVisibility.get(node)
  }

  /**
   * Show the children of a collapsed node.
   * @param node The node that should be expanded
   */
  expand(node: INode): void {
    this.collapseExpandImpl(node, false)
  }

  /**
   * Hide the children of an expanded node.
   * @param node The node that should be collapsed
   */
  collapse(node: INode): void {
    this.collapseExpandImpl(node, true)
  }

  /**
   * Collapses or expands the given node.
   * @param node The node whose children will be hidden or shown.
   * @param collapse If true, the given node's children will be hidden;
   * otherwise they will be shown.
   */
  private collapseExpandImpl(node: INode, collapse: boolean): void {
    this.setCollapsed(node, collapse)

    const filteredGraph = this.graphComponent.graph as FilteredGraphWrapper
    CollapseAndExpandNodes.getDescendants(filteredGraph.wrappedGraph!, node, (succ) =>
      this.isCollapsed(succ)
    ).forEach((succ) => {
      this.setNodeVisibility(succ, !collapse)
    })
  }

  /**
   * Returns the descendants of the given node.
   * @param graph The graph.
   * @param node The node.
   * @param recursionFilter A node predicate that specifies whether
   * the recursion should continue for the given node.
   * @returns The descendants of the given node.
   */
  private static getDescendants(
    graph: IGraph,
    node: INode,
    recursionFilter: (node: INode) => boolean
  ): IList<INode> {
    const visited = new HashMap<INode, boolean>()
    const descendants = new List<INode>()
    const nodes = [node]
    while (nodes.length > 0) {
      for (const s of graph.successors(nodes.pop()!)) {
        if (!visited.get(s)) {
          visited.set(s, true)
          descendants.add(s)
          if (!recursionFilter(s)) {
            nodes.push(s)
          }
        }
      }
    }
    return descendants
  }

  /**
   * Moves incremental nodes between their neighbors before expanding for a smooth animation.
   * @param incrementalNodes the nodes that need to be moved.
   */
  private prepareSmoothExpandLayoutAnimation(incrementalNodes: HashMap<INode, boolean>): void {
    const graph = this.graphComponent.graph

    // mark the new nodes and place them between their neighbors
    const layoutData = new PlaceNodesAtBarycenterStageData({
      affectedNodes: (node) => incrementalNodes.has(node)
    })

    const layout = new PlaceNodesAtBarycenterStage()
    graph.applyLayout(layout, layoutData)
  }

  /**
   * Configures a new layout for the current graph.
   * Incremental nodes are moved between their neighbors before expanding for a smooth animation.
   * @param toggledNode The children of this node are laid out as incremental items.
   * Without a toggled node, a 'from scratch' layout is calculated.
   * @param expand Whether this is part of an expand or a collapse action.
   * @param currentLayoutData Additional configuration data for the given layout algorithm and the
   * demo's graph.
   * @param currentLayout The layout algorithm to arrange the demo's graph.
   */
  configureLayout(
    toggledNode: INode | null,
    expand: boolean,
    currentLayoutData: CompositeLayoutData,
    currentLayout: ILayoutAlgorithm
  ) {
    const graph = this.graphComponent.graph
    if (toggledNode) {
      // keep the clicked node at its location
      currentLayoutData.items.add(
        new LayoutAnchoringStageData({
          nodeAnchoringPolicies: (node) =>
            node === toggledNode ? LayoutAnchoringPolicy.CENTER : LayoutAnchoringPolicy.NONE
        })
      )

      const incrementalNodes = CollapseAndExpandNodes.getDescendants(
        graph,
        toggledNode,
        (node) => false
      )
      const incrementalMap = new HashMap<INode, boolean>()
      incrementalNodes.forEach((node) => {
        incrementalMap.set(node, true)
        const co = this.graphComponent.graphModelManager.getMainRenderTreeElement(node)
        const toggledNodeCo =
          this.graphComponent.graphModelManager.getMainRenderTreeElement(toggledNode)
        if (co && toggledNodeCo) {
          co.below(toggledNodeCo)
        }
      })

      if (expand) {
        // move the incremental nodes between their neighbors before expanding for a smooth animation
        this.prepareSmoothExpandLayoutAnimation(incrementalMap)
      } else {
        // configure PlaceNodesAtBarycenterStage for a smooth animation
        currentLayoutData.items.add(
          new PlaceNodesAtBarycenterStageData({
            affectedNodes: (node: INode): boolean => incrementalMap.has(node)
          })
        )
      }
      if (currentLayout instanceof OrganicLayout) {
        currentLayout.compactnessFactor = 0.7
        currentLayout.defaultPreferredEdgeLength = 60

        currentLayout.allowNodeOverlaps = false
        currentLayout.defaultMinimumNodeDistance = 10
        currentLayout.qualityTimeRatio = 1
        currentLayout.stopDuration = TimeSpan.fromMilliseconds(1000 + graph.nodes.size * 50)

        const layerIds = new Bfs({
          coreNodes: incrementalNodes.concat(toggledNode),
          traversalDirection: 'both'
        }).run(graph).nodeLayerIds

        currentLayoutData.items.add(
          new OrganicLayoutData({
            nodeInertia: (obj) => 1 - 1 / (layerIds.get(obj)! + 1),
            nodeStress: (obj) => 1 / (layerIds.get(obj)! + 1)
          })
        )
      } else if (currentLayout instanceof HierarchicalLayout) {
        currentLayout.fromSketchMode = true

        const hierarchicalLayoutData = new HierarchicalLayoutData({ incrementalNodes })
        currentLayoutData.items.add(hierarchicalLayoutData)
      }
    } else {
      if (currentLayout instanceof HierarchicalLayout) {
        currentLayout.fromSketchMode = false
      }
    }
  }
}
