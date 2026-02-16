/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgePortCandidates,
  HierarchicalLayout,
  HierarchicalLayoutData,
  type IEdge,
  type ILayoutAlgorithm,
  type INode,
  type LayoutData,
  NodePortCandidates
} from '@yfiles/yfiles'

/**
 * Creates and configures the layout algorithm.
 */
export function createLayout(): ILayoutAlgorithm {
  return new HierarchicalLayout({
    groupLayeringPolicy: 'ignore-groups',
    defaultEdgeDescriptor: { minimumFirstSegmentLength: 25, minimumLastSegmentLength: 25 }
  })
}

/**
 * Creates and configures the layout data.
 * @param isHierarchyEdge Returns whether an edge is a hierarchy edge
 * @param nodeId The node id for each node
 */
export function createLayoutData(
  isHierarchyEdge: (edge: IEdge) => boolean,
  nodeId: (node: INode) => { toString: () => string }
): LayoutData {
  // create the port candidates for the edges
  const { createPortCandidateSet, createSourcePortCandidates, createTargetPortCandidates } =
    configureEdgeHierarchyCandidates(isHierarchyEdge)

  return new HierarchicalLayoutData({
    edgeDirectedness: (item) => (isHierarchyEdge(item) ? 1 : 0),
    sourceGroupIds: (item: IEdge) =>
      isHierarchyEdge(item) ? 's-' + nodeId(item.sourceNode).toString() : null,
    targetGroupIds: (item: IEdge) =>
      isHierarchyEdge(item) ? 't-' + nodeId(item.targetNode).toString() : null,
    ports: {
      nodePortCandidates: createPortCandidateSet,
      sourcePortCandidates: createSourcePortCandidates,
      targetPortCandidates: createTargetPortCandidates
    }
  })
}

/**
 * Configures the port candidates for the edges.
 * @param isHierarchyEdge Returns whether an edge is a hierarchy edge
 */
function configureEdgeHierarchyCandidates(isHierarchyEdge: (edge: IEdge) => boolean): {
  createPortCandidateSet: () => NodePortCandidates
  createSourcePortCandidates: (edge: IEdge) => EdgePortCandidates
  createTargetPortCandidates: (edge: IEdge) => EdgePortCandidates
} {
  const hierarchyEdgeSourceSideCandidates = new EdgePortCandidates().addFreeCandidate('bottom', 1)
  const hierarchyEdgeTargetSideCandidates = new EdgePortCandidates().addFreeCandidate('top', 1)
  const regularEdgeSourceSideCandidates = new EdgePortCandidates()
    .addFreeCandidate('right')
    .addFreeCandidate('left')
  const regularEdgeTargetSideCandidates = new EdgePortCandidates()
    .addFreeCandidate('left')
    .addFreeCandidate('right')

  function createPortCandidateSet(): NodePortCandidates {
    const nodePortCandidates = new NodePortCandidates()
    nodePortCandidates
      .addFreeCandidate('top', 1)
      .addFreeCandidate('bottom', 1)
      .addFreeCandidate('right', 1000)
      .addFreeCandidate('left', 1000)
    return nodePortCandidates
  }

  const createSourcePortCandidates = (edge: IEdge): EdgePortCandidates =>
    isHierarchyEdge(edge) ? hierarchyEdgeSourceSideCandidates : regularEdgeSourceSideCandidates
  const createTargetPortCandidates = (edge: IEdge): EdgePortCandidates =>
    isHierarchyEdge(edge) ? hierarchyEdgeTargetSideCandidates : regularEdgeTargetSideCandidates

  return { createPortCandidateSet, createSourcePortCandidates, createTargetPortCandidates }
}
