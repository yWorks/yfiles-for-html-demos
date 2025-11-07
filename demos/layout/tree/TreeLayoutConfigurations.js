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
  CompactSubtreePlacer,
  LeftRightSubtreePlacer,
  Mapper,
  OrganicEdgeRouter,
  SingleLayerSubtreePlacer,
  TreeLayout,
  TreeLayoutData
} from '@yfiles/yfiles'

/**
 * Creates a layout configuration that uses the subtree placers from the panel.
 * This configuration considers assistant nodes as well as an out-edge comparer.
 * @param graph The graph
 * @param subtreePlacerPanel The panel
 */
export function createGenericConfiguration(graph, subtreePlacerPanel) {
  // create layout algorithm
  const layout = new TreeLayout()
  const sample = document.querySelector('#select-sample').value
  if (sample === 'general') {
    // add the tree reduction stage for the case where the graph is not a tree but a general graph
    const treeReductionStage = layout.treeReductionStage
    treeReductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()
  }

  // configure layout data with subtree placers, assistant markers and edge order
  const layoutData = new TreeLayoutData({
    subtreePlacers: (node) => {
      if (graph.outDegree(node) > 0) {
        // return the subtree placer specified for the node
        return subtreePlacerPanel.subtreePlacers.get(node)
      }
      return null
    },
    // mark assistant nodes
    assistantNodes: (node) => node.tag.assistant,
    compactSubtreePlacerStrategyMementos: new Mapper(),
    childOrder: {
      // order out edges by the label of their target nodes
      outEdgeComparables: (edge) => getOrdinal(edge)
    }
  })
  return { layout, layoutData }
}

/**
 * Returns the ordinal which describes where this edge fits in the edge order.
 * This implementation uses the label text if it is a number or 0.
 */
function getOrdinal(edge) {
  const targetLabels = edge.targetNode.labels
  if (targetLabels.size > 0) {
    const number = Number.parseFloat(targetLabels.first().text)
    if (!Number.isNaN(number)) {
      return number
    }
  }
  return 0
}

/**
 * Creates a layout configuration that uses a combination of {@link LeftRightSubtreePlacer} and
 * {@link SingleLayerSubtreePlacer}.
 * @param graph The graph
 * @param subtreePlacerPanel The panel
 */
export function createDefaultTreeConfiguration(graph, subtreePlacerPanel) {
  // create layout algorithm
  const layout = new TreeLayout()

  // create layout data
  const layoutData = new TreeLayoutData()

  for (const node of graph.nodes) {
    // specify placer in layout data, depending on the layer value stored in the node's tag
    const placer =
      node.tag.layer === 3 ? new LeftRightSubtreePlacer() : new SingleLayerSubtreePlacer()
    layoutData.subtreePlacers.mapper.set(node, placer)

    // update subtree placers with the same values to keep the panel intact
    subtreePlacerPanel.subtreePlacers.set(node, placer)
  }

  return { layout, layoutData }
}

/**
 * Creates a layout configuration that places the first two levels horizontally and stacks the
 * remaining layers left-right.
 * @param graph The graph
 * @param subtreePlacerPanel The panel
 */
export function createCategoryTreeConfiguration(graph, subtreePlacerPanel) {
  // create layout algorithm
  const layout = new TreeLayout()

  // create layout data
  const layoutData = new TreeLayoutData()

  for (const node of graph.nodes) {
    //specify placer in layout data, depending on the layer value stored in the node's tag
    const placer =
      node.tag.layer === 0
        ? new SingleLayerSubtreePlacer()
        : new LeftRightSubtreePlacer({ placeLastOnBottom: false })
    layoutData.subtreePlacers.mapper.set(node, placer)

    // update subtree placers with the same values to keep the panel intact
    subtreePlacerPanel.subtreePlacers.set(node, placer)
  }

  return { layout, layoutData }
}

/**
 * Creates a layout configuration that can handle general graphs.
 * Non-tree edges are routed with organic style.
 * @param graph The graph
 * @param subtreePlacerPanel The panel
 */
export function createGeneralGraphConfiguration(graph, subtreePlacerPanel) {
  // create layout algorithm
  const treeLayout = new TreeLayout()
  const treeReductionStage = treeLayout.treeReductionStage
  treeReductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()

  const layout = treeLayout

  // update subtree placers with the same values to keep the panel intact
  for (const node of graph.nodes) {
    subtreePlacerPanel.subtreePlacers.set(node, new SingleLayerSubtreePlacer())
  }

  return { layout }
}

/**
 * Creates a layout configuration that uses {@link CompactSubtreePlacer} for nodes with more than 5 children.
 * @param graph The graph
 * @param subtreePlacerPanel The panel
 */
export function createLargeTreeConfiguration(graph, subtreePlacerPanel) {
  // create layout algorithm
  const layout = new TreeLayout()

  const layoutData = new TreeLayoutData({ compactSubtreePlacerStrategyMementos: new Mapper() })

  // select placer depending on out-degree and specify it in the layout data
  for (const node of graph.nodes) {
    const placer =
      graph.outDegree(node) > 5 ? new CompactSubtreePlacer() : new SingleLayerSubtreePlacer()
    layoutData.subtreePlacers.mapper.set(node, placer)

    // update subtree placers with the same values to keep the panel intact
    subtreePlacerPanel.subtreePlacers.set(node, placer)
  }

  return { layout, layoutData }
}

/**
 * Creates a layout configuration that uses {@link SingleLayerSubtreePlacer} for all nodes in the graph.
 * @param graph The graph
 * @param subtreePlacerPanel The panel
 */
export function createWideTreeConfiguration(graph, subtreePlacerPanel) {
  const singleLayerSubtreePlacer = new SingleLayerSubtreePlacer()
  const layout = new TreeLayout({ defaultSubtreePlacer: singleLayerSubtreePlacer })
  // update subtree placers with the same values to keep the panel intact
  for (const node of graph.nodes) {
    subtreePlacerPanel.subtreePlacers.set(node, singleLayerSubtreePlacer)
  }

  return { layout: layout }
}
