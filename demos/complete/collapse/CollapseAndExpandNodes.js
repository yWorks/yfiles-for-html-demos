/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CompositeLayoutData,
  FixNodeLayoutData,
  GraphComponent,
  HashMap,
  HierarchicLayout,
  HierarchicLayoutData,
  IGraph,
  ILayoutAlgorithm,
  IList,
  INode,
  LayoutMode,
  List,
  OrganicLayout,
  OrganicLayoutData,
  OrganicLayoutScope,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  StraightLineEdgeRouterData
} from 'yfiles'

/**
 * Provides collapsing and expanding functions and configure the layout
 */
export default class CollapseAndExpandNodes {
  constructor(graphComponent) {
    /** Map that stores whether a node is collapsed. */
    this.nodeCollapsedMap = new HashMap()

    /** Map that stores the node visibility. */
    this.nodeVisibility = new HashMap()

    /** @type {GraphComponent} */
    this.graphComponent = graphComponent
  }

  setCollapsed(node, collapsed) {
    this.nodeCollapsedMap.set(node, collapsed)
  }

  setNodeVisibility(node, visible) {
    this.nodeVisibility.set(node, visible)
  }
  getNodeVisibility(node) {
    return !!this.nodeVisibility.get(node)
  }

  /**
   * Show the children of a collapsed node.
   * @param {INode} node The node that should be expanded
   */
  expand(node) {
    // Stores the collapsed state of the node in the style tag in order
    // to be able to bind to it using a template binding.
    node.style.styleTag = { collapsed: false }
    this.nodeCollapsedMap.set(node, false)

    const filteredGraph = this.graphComponent.graph
    this.getDescendants(filteredGraph.wrappedGraph, node, succ =>
      this.nodeCollapsedMap.get(succ)
    ).forEach(succ => {
      this.nodeVisibility.set(succ, true)
    })
  }

  /**
   * Hide the children of a expanded node.
   * @param {INode} node The node that should be collapsed
   */
  collapse(node) {
    node.style.styleTag = { collapsed: true }
    this.nodeCollapsedMap.set(node, true)

    const filteredGraph = this.graphComponent.graph
    this.getDescendants(filteredGraph.wrappedGraph, node, succ =>
      this.nodeCollapsedMap.get(succ)
    ).forEach(succ => {
      this.nodeVisibility.set(succ, false)
    })
  }

  /**
   * Returns the descendants of the given node.
   *
   * @param {IGraph} graph The graph.
   * @param {INode} node The node.
   * @param {function(INode):boolean?} recursionFilter An optional node predicate that specifies whether
   *   the recursion should continue for the given node.
   * @return {IList.<INode>} The descendants of the given node.
   */
  getDescendants(graph, node, recursionFilter) {
    const visited = new HashMap()
    const descendants = new List()
    const nodes = [node]
    while (nodes.length > 0) {
      graph.successors(nodes.pop()).forEach(s => {
        if (!visited.get(s)) {
          visited.set(s, true)
          descendants.add(s)
          if (recursionFilter == null || !recursionFilter(s)) {
            nodes.push(s)
          }
        }
      })
    }
    return descendants
  }

  /**
   * Moves incremental nodes between their neighbors before expanding for a smooth animation.
   *
   * @param {HashMap} incrementalMap
   */
  prepareSmoothExpandLayoutAnimation(incrementalMap) {
    const graph = this.graphComponent.graph

    // mark the new nodes and place them between their neighbors
    const layoutData = new PlaceNodesAtBarycenterStageData({
      affectedNodes: node => incrementalMap.has(node)
    })

    const layout = new PlaceNodesAtBarycenterStage()
    graph.applyLayout(layout, layoutData)
  }

  /**
   * Configures a new layout to the current graph.
   *
   * Incremental nodes are moved between their neighbors before expanding for a smooth animation.
   * @param {INode} toggledNode An optional toggled node. The children of this node are laid out as
   *   incremental items. Without affected node, a 'from scratch' layout is calculated.
   * @param {boolean} expand Whether this is part of an expand or a collapse action.
   * @param {CompositeLayoutData} currentLayoutData
   * @param {ILayoutAlgorithm} currentLayout
   */
  configureLayout(toggledNode, expand, currentLayoutData, currentLayout) {
    const graph = this.graphComponent.graph
    if (toggledNode) {
      // Keep the clicked node at its location
      currentLayoutData.items.add(
        new FixNodeLayoutData({
          fixedNodes: toggledNode
        })
      )

      const incrementalNodes = this.getDescendants(graph, toggledNode)
      const incrementalMap = new HashMap()
      incrementalNodes.forEach(node => {
        incrementalMap.set(node, true)
      })

      if (expand) {
        // move the incremental nodes between their neighbors before expanding for a smooth animation
        this.prepareSmoothExpandLayoutAnimation(incrementalMap)
      } else {
        // configure StraightLineEdgeRouter and PlaceNodesAtBarycenterStage for a smooth animation
        currentLayoutData.items.add(
          new StraightLineEdgeRouterData({
            affectedNodes: node => incrementalMap.has(node)
          })
        )
        currentLayoutData.items.add(
          new PlaceNodesAtBarycenterStageData({
            affectedNodes: node => incrementalMap.has(node)
          })
        )
      }
      if (currentLayout instanceof OrganicLayout) {
        currentLayout.scope = OrganicLayoutScope.MAINLY_SUBSET

        currentLayoutData.items.add(new OrganicLayoutData({ affectedNodes: graph.nodes.toList() }))
      } else if (currentLayout instanceof HierarchicLayout) {
        currentLayout.layoutMode = LayoutMode.INCREMENTAL

        currentLayoutData.items.add(
          new HierarchicLayoutData({
            incrementalHints: (item, hintsFactory) => {
              if (incrementalNodes.includes(item)) {
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
