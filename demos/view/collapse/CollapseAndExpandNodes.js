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
/* eslint-disable no-unused-vars */
import {
  Bfs,
  CompositeLayoutData,
  FilteredGraphWrapper,
  FixNodeLayoutData,
  GraphComponent,
  HashMap,
  HierarchicLayout,
  HierarchicLayoutData,
  IGraph,
  IIncrementalHintsFactory,
  ILayoutAlgorithm,
  IList,
  INode,
  LayoutMode,
  List,
  OrganicLayout,
  OrganicLayoutData,
  OrganicLayoutScope,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData
} from 'yfiles'

/**
 * Provides utility function for collapsing and expanding nodes as well as configuring layout
 * algorithms.
 */
export default class CollapseAndExpandNodes {
  nodeCollapsedMap = new HashMap()
  nodeVisibility = new HashMap()

  /**
   * @param {!GraphComponent} graphComponent
   */
  constructor(graphComponent) {
    this.graphComponent = graphComponent
  }

  /**
   * Sets the given node's collapsed state.
   * @param {!INode} node The node whose state is set.
   * @param {boolean} collapsed The given node's new state.
   */
  setCollapsed(node, collapsed) {
    this.nodeCollapsedMap.set(node, collapsed)
  }

  /**
   * Gets the given node's collapsed state.
   * @param {!INode} node The node whose state is queried.
   * @returns {boolean}
   */
  isCollapsed(node) {
    return !!this.nodeCollapsedMap.get(node)
  }

  /**
   * Sets the given node's visibility.
   * @param {!INode} node The node whose state is set.
   * @param {boolean} visible The given node's new state.
   */
  setNodeVisibility(node, visible) {
    this.nodeVisibility.set(node, visible)
  }

  /**
   * Gets the given node's visibility.
   * @param {!INode} node The node whose state is queried.
   * @returns {boolean}
   */
  getNodeVisibility(node) {
    return !!this.nodeVisibility.get(node)
  }

  /**
   * Show the children of a collapsed node.
   * @param {!INode} node The node that should be expanded
   */
  expand(node) {
    this.collapseExpandImpl(node, false)
  }

  /**
   * Hide the children of an expanded node.
   * @param {!INode} node The node that should be collapsed
   */
  collapse(node) {
    this.collapseExpandImpl(node, true)
  }

  /**
   * Collapses or expands the given node.
   * @param {!INode} node The node whose children will be hidden or shown.
   * @param {boolean} collapse If true, the given node's children will be hidden;
   * otherwise they will be shown.
   */
  collapseExpandImpl(node, collapse) {
    this.setCollapsed(node, collapse)

    const filteredGraph = this.graphComponent.graph
    CollapseAndExpandNodes.getDescendants(filteredGraph.wrappedGraph, node, (succ) =>
      this.isCollapsed(succ)
    ).forEach((succ) => {
      this.setNodeVisibility(succ, !collapse)
    })
  }

  /**
   * Returns the descendants of the given node.
   * @param {!IGraph} graph The graph.
   * @param {!INode} node The node.
   * @param {!function} recursionFilter A node predicate that specifies whether
   * the recursion should continue for the given node.
   * @returns {!IList.<INode>} The descendants of the given node.
   */
  static getDescendants(graph, node, recursionFilter) {
    const visited = new HashMap()
    const descendants = new List()
    const nodes = [node]
    while (nodes.length > 0) {
      for (const s of graph.successors(nodes.pop())) {
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
   * @param {!HashMap.<INode,boolean>} incrementalNodes the nodes that need to be moved.
   */
  prepareSmoothExpandLayoutAnimation(incrementalNodes) {
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
   * @param {?INode} toggledNode The children of this node are laid out as incremental items.
   * Without a toggled node, a 'from scratch' layout is calculated.
   * @param {boolean} expand Whether this is part of an expand or a collapse action.
   * @param {!CompositeLayoutData} currentLayoutData Additional configuration data for the given layout algorithm and the
   * demo's graph.
   * @param {!ILayoutAlgorithm} currentLayout The layout algorithm to arrange the demo's graph.
   */
  configureLayout(toggledNode, expand, currentLayoutData, currentLayout) {
    const graph = this.graphComponent.graph
    if (toggledNode) {
      // keep the clicked node at its location
      currentLayoutData.items.add(
        new FixNodeLayoutData({
          fixedNodes: toggledNode
        })
      )

      const incrementalNodes = CollapseAndExpandNodes.getDescendants(
        graph,
        toggledNode,
        (node) => false
      )
      const incrementalMap = new HashMap()
      incrementalNodes.forEach((node) => {
        incrementalMap.set(node, true)
        const co = this.graphComponent.graphModelManager.getMainCanvasObject(node)
        const toggledNodeCo = this.graphComponent.graphModelManager.getMainCanvasObject(toggledNode)
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
            affectedNodes: (node) => incrementalMap.has(node)
          })
        )
      }
      if (currentLayout instanceof OrganicLayout) {
        currentLayout.compactnessFactor = 0.7
        currentLayout.preferredEdgeLength = 60

        currentLayout.considerNodeSizes = false
        currentLayout.nodeOverlapsAllowed = false
        currentLayout.minimumNodeDistance = 10
        currentLayout.qualityTimeRatio = 1
        currentLayout.maximumDuration = 1000 + graph.nodes.size * 50
        currentLayout.scope = OrganicLayoutScope.ALL

        const layerIds = new Bfs({
          coreNodes: incrementalNodes.concat(toggledNode),
          traversalDirection: 'both'
        }).run(graph).nodeLayerIds

        currentLayoutData.items.add(
          new OrganicLayoutData({
            nodeInertia: (obj) => 1 - 1 / (layerIds.get(obj) + 1),
            nodeStress: (obj) => 1 / (layerIds.get(obj) + 1)
          })
        )
      } else if (currentLayout instanceof HierarchicLayout) {
        currentLayout.layoutMode = LayoutMode.INCREMENTAL

        currentLayoutData.items.add(
          new HierarchicLayoutData({
            incrementalHints: (item, hintsFactory) => {
              if (item instanceof INode && incrementalNodes.includes(item)) {
                return hintsFactory.createLayerIncrementallyHint(item)
              }
            }
          })
        )
      }
    } else {
      if (currentLayout instanceof OrganicLayout) {
        currentLayout.scope = OrganicLayoutScope.ALL
      } else if (currentLayout instanceof HierarchicLayout) {
        currentLayout.layoutMode = LayoutMode.FROM_SCRATCH
      }
    }
  }
}
