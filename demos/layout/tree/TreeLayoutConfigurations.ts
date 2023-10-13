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
import {
  CompactNodePlacer,
  DefaultNodePlacer,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  INode,
  LayoutData,
  LeafNodePlacer,
  LeftRightNodePlacer,
  Mapper,
  MinimumNodeSizeStage,
  OrganicEdgeRouter,
  TreeLayout,
  TreeLayoutData,
  TreeReductionStage
} from 'yfiles'
import type { NodePlacerPanel } from './NodePlacerPanel'

export type Configuration = { layout: ILayoutAlgorithm; layoutData?: LayoutData }

/**
 * Creates a layout configuration that uses the node placers from the panel.
 * This configuration considers assistant nodes as well as an out-edge comparer.
 * @param graph The graph
 * @param nodePlacerPanel The panel
 */
export function createGenericConfiguration(
  graph: IGraph,
  nodePlacerPanel: NodePlacerPanel
): Configuration {
  // create layout algorithm
  const treeLayout = new TreeLayout()
  const sample = document.querySelector<HTMLSelectElement>('#select-sample')!.value
  if (sample === 'general') {
    // add the tree reduction stage for the case where the graph is not a tree but a general graph
    const treeReductionStage = new TreeReductionStage({
      nonTreeEdgeRouter: new OrganicEdgeRouter(),
      nonTreeEdgeSelectionKey: OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
    })
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
      return (edge1: IEdge, edge2: IEdge): number => {
        const value1 = getOrdinal(edge1)
        const value2 = getOrdinal(edge2)
        return value1 - value2
      }
    },
    compactNodePlacerStrategyMementos: new Mapper<INode, any>()
  })

  return { layout, layoutData }
}

/**
 * Returns the ordinal which describes where this edge fits in the edge order.
 * This implementation uses the label text if it is a number or 0.
 */
function getOrdinal(edge: IEdge): number {
  const targetLabels = edge.targetNode!.labels
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
 * @param graph The graph
 * @param nodePlacerPanel The panel
 */
export function createDefaultTreeConfiguration(
  graph: IGraph,
  nodePlacerPanel: NodePlacerPanel
): Configuration {
  // create layout algorithm
  const layout = new MinimumNodeSizeStage(new TreeLayout())

  // create layout data
  const layoutData = new TreeLayoutData()

  for (const node of graph.nodes) {
    //specify placer in layout data, depending on the layer value stored in the node's tag
    const placer = node.tag.layer === 3 ? new LeftRightNodePlacer() : new DefaultNodePlacer()
    layoutData.nodePlacers.mapper.set(node, placer)

    // update node placers with the same values to keep the panel intact
    nodePlacerPanel.nodePlacers.set(node, placer)
  }

  return { layout, layoutData }
}

/**
 * Creates a layout configuration that places the first two levels horizontally and stacks the
 * remaining layers left-right.
 * @param graph The graph
 * @param nodePlacerPanel The panel
 */
export function createCategoryTreeConfiguration(
  graph: IGraph,
  nodePlacerPanel: NodePlacerPanel
): Configuration {
  // create layout algorithm
  const layout = new MinimumNodeSizeStage(new TreeLayout())

  // create layout data
  const layoutData = new TreeLayoutData()

  for (const node of graph.nodes) {
    //specify placer in layout data, depending on the layer value stored in the node's tag
    const placer =
      node.tag.layer === 0
        ? new DefaultNodePlacer()
        : new LeftRightNodePlacer({
            placeLastOnBottom: false
          })
    layoutData.nodePlacers.mapper.set(node, placer)

    // update node placers with the same values to keep the panel intact
    nodePlacerPanel.nodePlacers.set(node, placer)
  }

  return { layout, layoutData }
}

/**
 * Creates a layout configuration that can handle general graphs.
 * Non-tree edges are routed with organic style.
 * @param graph The graph
 * @param nodePlacerPanel The panel
 */
export function createGeneralGraphConfiguration(
  graph: IGraph,
  nodePlacerPanel: NodePlacerPanel
): Configuration {
  // create layout algorithm
  const treeLayout = new TreeReductionStage({
    coreLayout: new TreeLayout(),
    nonTreeEdgeRouter: new OrganicEdgeRouter(),
    nonTreeEdgeSelectionKey: OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
  })
  const layout = new MinimumNodeSizeStage(treeLayout)

  // update node placers with the same values to keep the panel intact
  for (const node of graph.nodes) {
    nodePlacerPanel.nodePlacers.set(node, new DefaultNodePlacer())
  }

  return { layout }
}

/**
 * Creates a layout configuration that uses CompactNodePlacer for nodes with more than 5 children.
 * @param graph The graph
 * @param nodePlacerPanel The panel
 */
export function createLargeTreeConfiguration(
  graph: IGraph,
  nodePlacerPanel: NodePlacerPanel
): Configuration {
  // create layout algorithm
  const layout = new MinimumNodeSizeStage(new TreeLayout())

  const layoutData = new TreeLayoutData({
    compactNodePlacerStrategyMementos: new Mapper<INode, any>()
  })

  // select placer depending on out-degree and specify it in the layout data
  for (const node of graph.nodes) {
    const placer = graph.outDegree(node) > 5 ? new CompactNodePlacer() : new DefaultNodePlacer()
    layoutData.nodePlacers.mapper.set(node, placer)

    // update node placers with the same values to keep the panel intact
    nodePlacerPanel.nodePlacers.set(node, placer)
  }

  return { layout, layoutData }
}

/**
 * Creates a layout configuration that uses DefaultNodePlacer for all nodes in the graph.
 * @param graph The graph
 * @param nodePlacerPanel The panel
 */
export function createWideTreeConfiguration(
  graph: IGraph,
  nodePlacerPanel: NodePlacerPanel
): Configuration {
  const defaultNodePlacer = new DefaultNodePlacer()
  const layout = new TreeLayout({
    defaultNodePlacer: defaultNodePlacer
  })
  // update node placers with the same values to keep the panel intact
  for (const node of graph.nodes) {
    nodePlacerPanel.nodePlacers.set(node, defaultNodePlacer)
  }

  return { layout: new MinimumNodeSizeStage(layout) }
}
