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
 * Demonstrates how to run a {@link HierarchicalLayout} with configured constraints.
 * @param graph The graph to be laid out
 * @returns {{HierarchicalLayout, HierarchicalLayoutData}} the configured layout algorithm and the corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph: IGraph): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  const layout = new HierarchicalLayout()
  const layoutData = new HierarchicalLayoutData()

  const node4 = graph.nodes.find((node) => node.tag === 4)!
  const node5 = graph.nodes.find((node) => node.tag === 5)!

  // node 5 shall follow node 4 in the sequence...
  layoutData.sequenceConstraints.placeNodeBeforeNode(node4, node5)

  // HierarchicalLayout normally places the nodes so that the edges point in the direction of the
  // layout (here from top to bottom). This would place node 5 in the next layer, i.e. below node 4.
  // In this example, however, we want the two nodes to be in the same layer. We can do this by
  // specifying a same layer constraint.
  layoutData.layerConstraints.placeInSameLayer(node4, node5)

  return { layout, layoutData }
}

/**
 * Demonstrates how to run a {@link HierarchicalLayout} with the default configuration.
 * @param graph The graph to be laid out
 * @returns {{HierarchicalLayout, HierarchicalLayoutData}} the configured layout algorithm and the corresponding layout data
 */
export function createDefaultLayoutConfiguration(graph: IGraph): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  const layout = new HierarchicalLayout()
  const layoutData = new HierarchicalLayoutData()
  return { layout, layoutData }
}
