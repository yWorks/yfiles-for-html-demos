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
  HierarchicalLayout,
  HierarchicalLayoutData,
  IGraph,
  ILayoutAlgorithm,
  LayoutData
} from '@yfiles/yfiles'

/**
 * Demonstrates how to configure layering contraints for {@link HierarchicalLayout}.
 * @param graph The graph to be laid out
 * @returns {{HierarchicalLayout, HierarchicalLayoutData}} the configured layout algorithm and the
 * corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph: IGraph): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  const layout = new HierarchicalLayout()
  const layoutData = new HierarchicalLayoutData()

  // get the nodes for which we want to define layer constraints
  const node0 = graph.nodes.find((node) => node.tag === 0)!
  const node2 = graph.nodes.find((node) => node.tag === 2)!
  const node7 = graph.nodes.find((node) => node.tag === 7)!
  const node9 = graph.nodes.find((node) => node.tag === 9)!

  // this is the factory that we apply the constraints to
  const layerConstraints = layoutData.layerConstraints
  // place node9 in the topmost layer
  layerConstraints.placeAtTop(node9)
  // place node7 in the bottommost layer
  layerConstraints.placeAtBottom(node7)
  // place node0 at least one layer below node9
  layerConstraints.placeInOrder(node9, node0)
  // place node2 in the same layer as node0
  layerConstraints.placeInSameLayer(node0, node2)

  return { layout, layoutData }
}

/**
 * Demonstrates how to run {@link HierarchicalLayout} with its default configuration.
 * @param graph The graph to be laid out
 * @returns {{HierarchicalLayout, HierarchicalLayoutData}} the configured layout algorithm and the
 * corresponding layout data
 */
export function createDefaultLayoutConfiguration(graph: IGraph): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  const layout = new HierarchicalLayout()
  const layoutData = new HierarchicalLayoutData()
  return { layout, layoutData }
}
