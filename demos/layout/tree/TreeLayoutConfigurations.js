/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CompactNodePlacer,
  DefaultNodePlacer,
  IEdge,
  IGraph,
  LeafNodePlacer,
  LeftRightNodePlacer,
  Mapper,
  MinimumNodeSizeStage,
  OrganicEdgeRouter,
  TreeLayout,
  TreeLayoutData,
  TreeReductionStage
} from 'yfiles'

/**
 * Creates a layout configuration that uses the node placers from the panel.
 * This configuration considers assistant nodes as well as an out-edge comparer.
 * @param {IGraph} graph The graph
 * @param {NodePlacerPanel} nodePlacerPanel The panel
 * @returns {{layout: MinimumNodeSizeStage, layoutData: TreeLayoutData}}
 */
export function createGenericConfiguration(graph, nodePlacerPanel) {
  // create layout algorithm
  const treeLayout = new TreeLayout()
  if (document.getElementById('select-sample').value === 'General Graph') {
    // add the tree reduction stage for the case where the graph is not a tree
    const treeReductionStage = new TreeReductionStage()
    treeReductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()
    treeReductionStage.nonTreeEdgeSelectionKey = OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
    treeLayout.prependStage(treeReductionStage)
  }
  const layout = new MinimumNodeSizeStage(treeLayout)

  // configure layout data with node placers, assistant markers and edge order
  const layoutData = new TreeLayoutData({
    nodePlacers: node => {
      if (graph.outDegree(node) > 0) {
        // return the node placer specified for the node
        return nodePlacerPanel.nodePlacers.get(node)
      }

      // use LeafNodePlacer for all nodes without children to avoid weird node connectors
      return new LeafNodePlacer()
    },
    // mark assistant nodes
    assistantNodes: node => node.tag.assistant,
    // order out edges by the label of their target nodes
    outEdgeComparers: () => {
      return (edge1, edge2) => {
        const value1 = getOrdinal(edge1)
        const value2 = getOrdinal(edge2)
        return value1 - value2
      }
    },
    compactNodePlacerStrategyMementos: new Mapper()
  })

  return {
    layout,
    layoutData
  }
}

/**
 * Returns the ordinal which describes where this edge fits in the edge order.
 * This implementation uses the label text if it is a number or 0.
 * @param {IEdge} edge
 * @return {number}
 */
function getOrdinal(edge) {
  if (!edge) {
    return 0
  }

  const targetLabels = edge.targetNode.labels
  if (targetLabels.size > 0) {
    const number = Number.parseFloat(targetLabels.first().text)
    if (!isNaN(number)) {
      return number
    }
  }
  return 0
}

/**
 * Creates a layout configuration that uses a combination of LeftRightNodePlacer and
 * DefaultNodePlacer.
 * @param {IGraph} graph The graph
 * @param {NodePlacerPanel} nodePlacerPanel The panel
 * @returns {{layout: MinimumNodeSizeStage, layoutData: TreeLayoutData}}
 */
export function createDefaultTreeConfiguration(graph, nodePlacerPanel) {
  // create layout algorithm
  const layout = new MinimumNodeSizeStage(new TreeLayout())

  // create layout data
  const layoutData = new TreeLayoutData({
    nodePlacers: node =>
      node.tag.layer === 3 ? new LeftRightNodePlacer() : new DefaultNodePlacer()
  })

  // update node placers with the same values to keep the panel intact
  graph.nodes.forEach(node => {
    nodePlacerPanel.nodePlacers.set(
      node,
      node.tag.layer === 3 ? new LeftRightNodePlacer() : new DefaultNodePlacer()
    )
  })

  return {
    layout,
    layoutData
  }
}

/**
 * Creates a layout configuration that places the first two levels horizontally and stacks the
 * remaining layers left-right.
 * @param {IGraph} graph The graph
 * @param {NodePlacerPanel} nodePlacerPanel The panel
 * @returns {{layout: MinimumNodeSizeStage, layoutData: TreeLayoutData}}
 */
export function createCategoryTreeConfiguration(graph, nodePlacerPanel) {
  // create layout algorithm
  const layout = new MinimumNodeSizeStage(new TreeLayout())

  // create layout data
  const layoutData = new TreeLayoutData({
    nodePlacers: node => {
      if (node.tag.layer === 0) {
        return new DefaultNodePlacer()
      }
      return new LeftRightNodePlacer({
        placeLastOnBottom: false
      })
    }
  })

  // update node placers with the same values to keep the panel intact
  graph.nodes.forEach(node => {
    if (node.tag.layer === 0) {
      nodePlacerPanel.nodePlacers.set(node, new DefaultNodePlacer())
    } else {
      const leftRightNodePlacer = new LeftRightNodePlacer({
        placeLastOnBottom: false
      })
      nodePlacerPanel.nodePlacers.set(node, leftRightNodePlacer)
    }
  })

  return {
    layout,
    layoutData
  }
}

/**
 * Creates a layout configuration that can handle general graphs.
 * Non-tree edges are routed with organic style.
 * @param {IGraph} graph The graph
 * @param {NodePlacerPanel} nodePlacerPanel The panel
 * @returns {{layout: MinimumNodeSizeStage, layoutData: TreeLayoutData}}
 */
export function createGeneralGraphConfiguration(graph, nodePlacerPanel) {
  // create layout algorithm
  const treeLayout = new TreeReductionStage(new TreeLayout())
  treeLayout.nonTreeEdgeRouter = new OrganicEdgeRouter()
  treeLayout.nonTreeEdgeSelectionKey = OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
  const layout = new MinimumNodeSizeStage(treeLayout)

  // update node placers with the same values to keep the panel intact
  graph.nodes.forEach(node => {
    nodePlacerPanel.nodePlacers.set(node, new DefaultNodePlacer())
  })

  return {
    layout,
    layoutData: null
  }
}

/**
 * Creates a layout configuration that uses CompactNodePlacer for nodes with more than 5 children.
 * @param {IGraph} graph The graph
 * @param {NodePlacerPanel} nodePlacerPanel The panel
 * @returns {{layout: MinimumNodeSizeStage, layoutData: TreeLayoutData}}
 */
export function createLargeTreeConfiguration(graph, nodePlacerPanel) {
  // create layout algorithm
  const layout = new MinimumNodeSizeStage(new TreeLayout())

  const layoutData = new TreeLayoutData({
    nodePlacers: node => {
      if (graph.outDegree(node) > 5) {
        return new CompactNodePlacer()
      }
      return new DefaultNodePlacer()
    },
    compactNodePlacerStrategyMementos: new Mapper()
  })

  // update node placers with the same values to keep the panel intact
  graph.nodes.forEach(node => {
    if (graph.outDegree(node) > 5) {
      nodePlacerPanel.nodePlacers.set(node, new CompactNodePlacer())
    } else {
      nodePlacerPanel.nodePlacers.set(node, new DefaultNodePlacer())
    }
  })

  return {
    layout,
    layoutData
  }
}

/**
 * Creates a layout configuration that uses DefaultNodePlacer for all nodes in the graph.
 * @param {IGraph} graph The graph
 * @param {NodePlacerPanel} nodePlacerPanel The panel
 * @returns {{layout: MinimumNodeSizeStage, layoutData: TreeLayoutData}}
 */
export function createWideTreeConfiguration(graph, nodePlacerPanel) {
  const layout = new TreeLayout({
    defaultNodePlacer: new DefaultNodePlacer()
  })
  // update node placers with the same values to keep the panel intact
  graph.nodes.forEach(node => nodePlacerPanel.nodePlacers.set(node, new DefaultNodePlacer()))

  return {
    layout: new MinimumNodeSizeStage(layout),
    layoutData: null
  }
}
