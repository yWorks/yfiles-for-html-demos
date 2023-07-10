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
  Class,
  GenericLabeling,
  HierarchicLayout,
  IEdge,
  type IGraph,
  type ILabel,
  ILabelLayoutDpKey,
  type ILayoutAlgorithm,
  LabelAngleReferences,
  LabelingData,
  LabelPlacements,
  LabelSideReferences,
  type LayoutData,
  NodeHalo,
  OrganicLayout,
  OrganicLayoutData,
  ParallelEdgeRouterData,
  PreferredPlacementDescriptor,
  YBoolean
} from 'yfiles'

/**
 * Demonstrates how to configure {@link OrganicLayout} for automatic edge label placement.
 * Additionally, a post-processing labeling algorithm has to be applied for placing the labels
 * of self-loop or parallel edges, since these are not considered by the {@link OrganicLayout}.
 * @param graph The graph to be laid out
 * @returns {{ILayoutAlgorithm, LayoutData}} the configured layout algorithm and the
 * corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph: IGraph): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  // Integrated edge labeling depends on features of the layout-hierarchic module,
  // which is not a static dependency of layout-organic module for performance reasons.
  // To make sure it's loaded, use Class.ensure(HierarchicLayout)
  Class.ensure(HierarchicLayout)

  const organicLayout = new OrganicLayout()
  // enable the automatic edge label placement
  organicLayout.integratedEdgeLabeling = true
  // set the preferred length for the edges
  organicLayout.preferredEdgeLength = 150
  organicLayout.deterministic = true

  // Integrated edge labeling produces satisfying results that are sensible for a lot of cases by
  // default. Additionally, the algorithm offers some control over how and where individual labels
  // should be placed. This is where preferred placement descriptors come into play.
  // For better results, specify both the side and angle of the labels relative to the edge.

  // move a label as close to its owner edge's source node as possible
  // additionally, the corresponding label is placed on the left side of the edge and parallel to the edge's flow
  const closeToSourceDesc = new PreferredPlacementDescriptor()
  closeToSourceDesc.placeAlongEdge = LabelPlacements.AT_SOURCE_PORT
  closeToSourceDesc.sideReference = LabelSideReferences.RELATIVE_TO_EDGE_FLOW // important for organic layout
  closeToSourceDesc.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW // important for organic layout
  closeToSourceDesc.sideOfEdge = LabelPlacements.LEFT_OF_EDGE
  closeToSourceDesc.distanceToEdge = 4

  // move a label as close to its owner edge's target node as possible
  // additionally, the corresponding label is placed on the right side of the edge and parallel to the edge's flow
  const closeToTargetDesc = new PreferredPlacementDescriptor()
  closeToTargetDesc.placeAlongEdge = LabelPlacements.AT_TARGET_PORT
  closeToTargetDesc.sideReference = LabelSideReferences.RELATIVE_TO_EDGE_FLOW // important for organic layout
  closeToTargetDesc.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW // important for organic layout
  closeToTargetDesc.sideOfEdge = LabelPlacements.RIGHT_OF_EDGE
  closeToTargetDesc.distanceToEdge = 4

  // default placement - labels are placed parallel to the edge's flow
  const defaultDesc = new PreferredPlacementDescriptor()
  defaultDesc.sideReference = LabelSideReferences.RELATIVE_TO_EDGE_FLOW // important for organic layout
  defaultDesc.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW // important for organic layout

  // use the layout data to pass the information about the placement of individual edges
  const organicLayoutData = new OrganicLayoutData()
  organicLayoutData.edgeLabelPreferredPlacement = (label: ILabel): PreferredPlacementDescriptor => {
    switch (label.text) {
      case 'Source':
      case 'Parallel Source':
        return closeToSourceDesc
      case 'Target':
      case 'Parallel Target':
        return closeToTargetDesc
      default:
      case 'Default':
        return defaultDesc
    }
  }

  // Note that the labels of parallel edges and self-loops are routed by ParallelEdgeRouter and
  // SelfLoopEdgeRouter internally and are not considered by the organic layout algorithm.
  // Thus, we have to apply a generic labeling algorithm only for the labels of those edges.
  const affectedLabelsDpKey = new ILabelLayoutDpKey(YBoolean.$class, null, 'AffectedLabels')
  const layout = new GenericLabeling()
  layout.coreLayout = organicLayout
  layout.placeNodeLabels = false
  // place only the edge labels
  layout.placeEdgeLabels = true
  layout.deterministic = true
  // set this key to make sure that the generic labeling algorithm places the labels of self-loops and parallel edges
  layout.affectedLabelsDpKey = affectedLabelsDpKey

  // Since we want to apply a generic labeling algorithm to labels of parallel edges,
  // we need a way to determine which edges are "parallel edges".
  // Fortunately, it is possible to retrieve that information from ParallelEdgeRouterData.
  // We simply have to define an array to be filled with these edges.
  const parallelEdgeRouterData = new ParallelEdgeRouterData()
  // define the array that will contain the parallel edges
  parallelEdgeRouterData.routedParallelEdges = []

  const labelingData = new LabelingData()
  // define the edges that have to be arranged by the generic labeling,
  // i.e., the labels of self-loops and parallel edges
  labelingData.affectedLabels = (label: ILabel): boolean => {
    const owner = label.owner
    if (owner instanceof IEdge) {
      const isParallelEdge = parallelEdgeRouterData.routedParallelEdges!.includes(owner)
      const isSelfLoopEdge = owner.isSelfloop
      return isSelfLoopEdge || isParallelEdge
    }
    return false
  }
  // set the same key as above to place only the specific labels
  labelingData.affectedLabels.dpKey = affectedLabelsDpKey

  // While preferred placement descriptors offer lots of configuration options, they cannot be used
  // to control the minimum distance of a label to the source or target node of its owner edge.
  // However, node halos may be used towards this end. E.g. the halo defined here reserves enough
  // space above all nodes to prevent labels from overlapping the target arrows of their owner
  // edges.
  labelingData.nodeHalos.constant = NodeHalo.create(5)

  // combine the layout data to ensure that all the information is being passed to the algorithm
  const layoutData = organicLayoutData.combineWith(parallelEdgeRouterData).combineWith(labelingData)

  return { layout, layoutData }
}
