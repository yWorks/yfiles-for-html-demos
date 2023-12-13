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
  HierarchicLayout,
  HierarchicLayoutData,
  ICollection,
  type IComparable,
  type IEdge,
  type IGraph,
  type ILayoutAlgorithm,
  type INode,
  ItemMapping,
  type LayoutData,
  NormalizeGraphElementOrderStage,
  PortCandidate,
  PortCandidateSet
} from 'yfiles'

/**
 * Sorts the elements for the layout according to their id, to keep the automatic layout stable.
 */
export function configureLayoutNormalizationIds(
  graph: IGraph,
  nodeId: (node: INode) => IComparable,
  edgeId: (edge: IEdge) => IComparable
): void {
  graph.mapperRegistry.createDelegateMapper(
    NormalizeGraphElementOrderStage.NODE_COMPARABLE_DP_KEY,
    nodeId
  )
  graph.mapperRegistry.createDelegateMapper(
    NormalizeGraphElementOrderStage.EDGE_COMPARABLE_DP_KEY,
    edgeId
  )
}

/**
 * Creates and configures the layout algorithm.
 */
export function createLayout(): ILayoutAlgorithm {
  const layout = new HierarchicLayout({
    orthogonalRouting: true,
    recursiveGroupLayering: false,
    integratedEdgeLabeling: true
  })
  layout.edgeLayoutDescriptor.minimumLastSegmentLength = 25
  layout.edgeLayoutDescriptor.minimumFirstSegmentLength = 25
  // add this stage to ensure the same order of elements for multiple layout invocations
  layout.prependStage(new NormalizeGraphElementOrderStage())
  return layout
}

/**
 * Creates and configures the layout data.
 * @param graph The given graph
 * @param isHierarchyEdge Returns whether an edge is a hierarchy edge
 * @param nodeId The node id for each node
 * @param moveToTop True if nodes should be placed on the topmost layer, false otherwise
 */
export function createLayoutData(
  graph: IGraph,
  isHierarchyEdge: (edge: IEdge) => boolean,
  nodeId: (node: INode) => { toString: () => string },
  moveToTop = false
): LayoutData {
  // create the port candidates for the edges
  const { createPortCandidateSet, createSourcePortCandidates, createTargetPortCandidates } =
    configureEdgeHierarchyCandidates(isHierarchyEdge)

  const layoutData = new HierarchicLayoutData({
    edgeDirectedness: (item) => (isHierarchyEdge(item) ? 1 : 0),
    sourceGroupIds: (item: IEdge) =>
      isHierarchyEdge(item) ? 's-' + nodeId(item.sourceNode!).toString() : null,
    targetGroupIds: (item: IEdge) =>
      isHierarchyEdge(item) ? 't-' + nodeId(item.targetNode!).toString() : null,
    nodePortCandidateSets: createPortCandidateSet,
    sourcePortCandidates: createSourcePortCandidates,
    targetPortCandidates: createTargetPortCandidates
  })

  if (moveToTop) {
    layoutData.partitionGridData.rowIndices = new ItemMapping((node) =>
      graph.inEdgesAt(node).filter(isHierarchyEdge).size === 0 ? 0 : 1
    )
  }

  return layoutData
}

/**
 * Configures the port candidates for the edges.
 * @param isHierarchyEdge Returns whether an edge is a hierarchy edge
 */
function configureEdgeHierarchyCandidates(isHierarchyEdge: (edge: IEdge) => boolean): {
  createPortCandidateSet: () => PortCandidateSet
  createSourcePortCandidates: (edge: IEdge) => ICollection<PortCandidate>
  createTargetPortCandidates: (edge: IEdge) => ICollection<PortCandidate>
} {
  const northCandidate = PortCandidate.createCandidate('north', 1)
  const southCandidate = PortCandidate.createCandidate('south', 1)
  const eastCandidate = PortCandidate.createCandidate('east', 0)
  const westCandidate = PortCandidate.createCandidate('west', 0)

  const hierarchyEdgeSourceSideCandidates = ICollection.from([southCandidate])
  const hierarchyEdgeTargetSideCandidates = ICollection.from([northCandidate])
  const regularEdgeSourceSideCandidates = ICollection.from([eastCandidate, westCandidate])
  const regularEdgeTargetSideCandidates = ICollection.from([westCandidate, eastCandidate])

  function createPortCandidateSet(): PortCandidateSet {
    const portCandidateSet = new PortCandidateSet()
    portCandidateSet.add(northCandidate, 1)
    portCandidateSet.add(southCandidate, 1)
    portCandidateSet.add(eastCandidate, 1 << 30)
    portCandidateSet.add(westCandidate, 1 << 30)
    return portCandidateSet
  }

  const createSourcePortCandidates = (edge: IEdge): ICollection<PortCandidate> =>
    isHierarchyEdge(edge) ? hierarchyEdgeSourceSideCandidates : regularEdgeSourceSideCandidates
  const createTargetPortCandidates = (edge: IEdge): ICollection<PortCandidate> =>
    isHierarchyEdge(edge) ? hierarchyEdgeTargetSideCandidates : regularEdgeTargetSideCandidates

  return { createPortCandidateSet, createSourcePortCandidates, createTargetPortCandidates }
}
