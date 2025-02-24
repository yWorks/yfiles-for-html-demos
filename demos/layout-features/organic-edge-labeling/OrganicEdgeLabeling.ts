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
  EdgeLabelDataKey,
  EdgeLabelPreferredPlacement,
  GenericLabeling,
  GenericLabelingData,
  type IEdge,
  type IGraph,
  type ILabel,
  type ILayoutAlgorithm,
  Insets,
  LabelAlongEdgePlacements,
  LabelAngleReferences,
  LabelEdgeSides,
  LabelSideReferences,
  type LayoutData,
  OrganicLayout,
  OrganicLayoutData,
  ParallelEdgeRouterData
} from '@yfiles/yfiles'

/**
 * Demonstrates how to configure {@link OrganicLayout} for automatic edge label placement.
 * Additionally, a post-processing labeling algorithm has to be applied for placing the labels
 * of self-loop or parallel edges, since these are not considered by the {@link OrganicLayout}.
 * @param graph The graph to be laid out
 * @returns The configured layout algorithm and the corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph: IGraph): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  const organicLayout = new OrganicLayout()
  // enable the automatic edge label placement
  organicLayout.edgeLabelPlacement = 'integrated'
  // set the preferred length for the edges
  organicLayout.defaultPreferredEdgeLength = 150
  organicLayout.deterministic = true

  // Integrated edge labeling produces satisfying results that are sensible for a lot of cases by
  // default. Additionally, the algorithm offers some control over how and where individual labels
  // should be placed. This is where preferred placement descriptors come into play.
  // For better results, specify both the side and angle of the labels relative to the edge.

  // move a label as close to its owner edge's source node as possible
  // additionally, the corresponding label is placed on the left side of the edge and parallel to the edge's flow
  const closeToSourceDesc = new EdgeLabelPreferredPlacement()
  closeToSourceDesc.placementAlongEdge = LabelAlongEdgePlacements.AT_SOURCE_PORT
  closeToSourceDesc.sideReference = LabelSideReferences.RELATIVE_TO_EDGE_FLOW // important for organic layout
  closeToSourceDesc.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW // important for organic layout
  closeToSourceDesc.edgeSide = LabelEdgeSides.LEFT_OF_EDGE
  closeToSourceDesc.distanceToEdge = 4

  // move a label as close to its owner edge's target node as possible
  // additionally, the corresponding label is placed on the right side of the edge and parallel to the edge's flow
  const closeToTargetDesc = new EdgeLabelPreferredPlacement()
  closeToTargetDesc.placementAlongEdge = LabelAlongEdgePlacements.AT_TARGET_PORT
  closeToTargetDesc.sideReference = LabelSideReferences.RELATIVE_TO_EDGE_FLOW // important for organic layout
  closeToTargetDesc.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW // important for organic layout
  closeToTargetDesc.edgeSide = LabelEdgeSides.RIGHT_OF_EDGE
  closeToTargetDesc.distanceToEdge = 4

  // default placement - labels are placed parallel to the edge's flow
  const defaultDesc = new EdgeLabelPreferredPlacement()
  defaultDesc.sideReference = LabelSideReferences.RELATIVE_TO_EDGE_FLOW // important for organic layout
  defaultDesc.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW // important for organic layout

  // use the layout data to pass the information about the placement of individual edges
  const organicLayoutData = new OrganicLayoutData()
  organicLayoutData.edgeLabelPreferredPlacements = (label: ILabel): EdgeLabelPreferredPlacement => {
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
  const affectedLabelsDataKey = new EdgeLabelDataKey<boolean>('AffectedLabels')
  const layout = new GenericLabeling()
  layout.coreLayout = organicLayout
  // place only the edge labels
  layout.scope = 'edge-labels'
  layout.deterministic = true

  // Since we want to apply a generic labeling algorithm to labels of parallel edges,
  // we need a way to determine which edges are "parallel edges".
  // Fortunately, it is possible to retrieve that information from ParallelEdgeRouterData.
  // We simply have to define an array to be filled with these edges.
  const parallelEdgeRouterData = new ParallelEdgeRouterData()

  const labelingData = new GenericLabelingData()
  // define the edges that have to be arranged by the generic labeling,
  // i.e., the labels of self-loops and parallel edges
  labelingData.scope.edgeLabels = (label: ILabel): boolean => {
    const owner = label.owner as IEdge
    const isParallelEdge = parallelEdgeRouterData.routedMultiEdgesResult!.includes(owner)
    const isSelfLoopEdge = owner.isSelfLoop
    return isSelfLoopEdge || isParallelEdge
  }

  // While preferred placement descriptors offer lots of configuration options, they cannot be used
  // to control the minimum distance of a label to the source or target node of its owner edge.
  // However, node halos may be used towards this end. E.g. the halo defined here reserves enough
  // space above all nodes to prevent labels from overlapping the target arrows of their owner
  // edges.
  labelingData.nodeMargins = new Insets(5)

  // combine the layout data to ensure that all the information is being passed to the algorithm
  const layoutData = organicLayoutData.combineWith(parallelEdgeRouterData).combineWith(labelingData)

  return { layout, layoutData }
}
