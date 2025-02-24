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
  LayoutData,
  NodePortCandidates,
  PortSides
} from '@yfiles/yfiles'
/**
 * Demonstrates how to run a {@link HierarchicalLayout} with a configured set of {@link NodePortCandidates}.
 * @param graph The graph to be laid out
 * @returns {{HierarchicalLayout, HierarchicalLayoutData}} the configured layout algorithm and the corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph) {
  const layout = new HierarchicalLayout()
  // Create a set of NodePortCandidates
  const nodePortCandidates = new NodePortCandidates()
  // Add a LayoutPortCandidate for each side of the node. Allow only one connection to each candidate.
  nodePortCandidates.addFreeCandidate(PortSides.TOP)
  nodePortCandidates.addFreeCandidate(PortSides.BOTTOM)
  nodePortCandidates.addFreeCandidate(PortSides.RIGHT)
  nodePortCandidates.addFreeCandidate(PortSides.LEFT)
  // Only use the candidate set for node number 5.
  const layoutData = new HierarchicalLayoutData()
  layoutData.ports.nodePortCandidates = (node) =>
    parseInt(node.tag) === 5 ? nodePortCandidates : null
  return { layout, layoutData }
}
/**
 * Demonstrates how to run a {@link HierarchicalLayout} with the default configuration.
 * @param graph The graph to be laid out
 * @returns {{HierarchicalLayout, HierarchicalLayoutData}} the configured layout algorithm and the corresponding layout data
 */
export function createDefaultLayoutConfiguration(graph) {
  const layout = new HierarchicalLayout()
  const layoutData = new HierarchicalLayoutData()
  return { layout, layoutData }
}
