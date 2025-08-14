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
  EdgeLabelPreferredPlacement,
  HierarchicalLayout,
  HierarchicalLayoutData,
  IGraph,
  ILayoutAlgorithm,
  Insets,
  LabelAlongEdgePlacements,
  LabelAngleReferences,
  LabelEdgeSides,
  LabelSideReferences,
  LayoutData
} from '@yfiles/yfiles'

/**
 * Demonstrates how to configure {@link HierarchicalLayout} for automatic edge label placement.
 * @param graph The graph to be laid out
 * @returns {{HierarchicalLayout, HierarchicalLayoutData}} the configured layout algorithm and the
 * corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph: IGraph): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  // create and configure the hierarchical layout algorithm
  const layout = new HierarchicalLayout()
  // By default, rotated labels are normalized to prevent upside down labels.
  // However, for some use cases (some) labels need to be "upside down"
  // to support these cases, it is possible to turn off the aforementioned normalization
  // by uncommenting the following line:
  // ;(layout.labeling as LabelLayoutTranslator).autoFlipping = false

  // Integrated edge labeling produces very good results that are sensible for a lot of cases by
  // default. Additionally, the algorithm offers some control over how and where individual labels
  // should be placed. This is where preferred placement descriptors come into play.

  // moves a label as close to its owner edge's source node as possible
  // additionally, the corresponding label is placed on the left side of the edge
  const closeToSourceDesc = new EdgeLabelPreferredPlacement()
  closeToSourceDesc.placementAlongEdge = LabelAlongEdgePlacements.AT_SOURCE_PORT
  closeToSourceDesc.sideReference = LabelSideReferences.ABSOLUTE_WITH_LEFT_ABOVE
  closeToSourceDesc.edgeSide = LabelEdgeSides.LEFT_OF_EDGE
  closeToSourceDesc.distanceToEdge = 4

  // moves a label as close to its owner edge's target node as possible
  // additionally, the corresponding label is placed on the right side of the edge *in relation
  // to the edge's direction* (i.e. for a bottom-to-top edge the label will be on the right side,
  // for a top-to-bottom edge, it will be on the left side)
  const closeToTargetDesc = new EdgeLabelPreferredPlacement()
  closeToTargetDesc.placementAlongEdge = LabelAlongEdgePlacements.AT_TARGET_PORT
  closeToTargetDesc.edgeSide = LabelEdgeSides.RIGHT_OF_EDGE
  closeToTargetDesc.distanceToEdge = 4

  // default placement
  const defaultDesc = new EdgeLabelPreferredPlacement()

  // rotates a label such that its baseline is parallel to its owner edge's path
  // additionally, the label is placed close to its owner edge's target node and next to the edge
  const downwardsDesc = new EdgeLabelPreferredPlacement()
  downwardsDesc.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
  downwardsDesc.placementAlongEdge = LabelAlongEdgePlacements.AT_TARGET
  downwardsDesc.edgeSide = LabelEdgeSides.LEFT_OF_EDGE
  downwardsDesc.distanceToEdge = 4

  // rotates a label such that its baseline is parallel to its owner edge's path
  // additionally, the label is placed next to the edge
  const parallelDesc = new EdgeLabelPreferredPlacement()
  parallelDesc.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
  parallelDesc.edgeSide = LabelEdgeSides.LEFT_OF_EDGE
  parallelDesc.distanceToEdge = 4

  // rotates a label by a fixed angle
  // additionally, the label is placed next to the edge
  const rotatedDesc = new EdgeLabelPreferredPlacement()
  rotatedDesc.angle = Math.PI * 0.225
  rotatedDesc.edgeSide = LabelEdgeSides.LEFT_OF_EDGE

  // rotates a label upside down
  // note, the aforementioned rotation normalization has to be turned off for this descriptor to
  // produce the desired effect, see the autoFlipping line above
  const upsideDownDesc = new EdgeLabelPreferredPlacement()
  upsideDownDesc.angle = Math.PI

  // rotates a label such that its baseline is parallel to its owner edge's path
  // additionally, the label is rotated to point in the opposite direction of a downwardsDesc label
  // note, the aforementioned rotation normalization has to be turned off for this descriptor to
  // produce the desired effect, see the autoFlipping line above
  const upwardsDesc = new EdgeLabelPreferredPlacement()
  upwardsDesc.angle = Math.PI
  upwardsDesc.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
  upwardsDesc.placementAlongEdge = LabelAlongEdgePlacements.AT_TARGET
  upwardsDesc.edgeSide = LabelEdgeSides.RIGHT_OF_EDGE
  upwardsDesc.distanceToEdge = 4

  // create and configure layout data for the hierarchical layout algorithm
  const layoutData = new HierarchicalLayoutData()
  // register all the descriptors
  layoutData.edgeLabelPreferredPlacements = (label) => {
    switch (label.text) {
      case 'Close to Source':
        return closeToSourceDesc
      case 'Close to Target':
        return closeToTargetDesc
      case 'Downwards':
        return downwardsDesc
      case 'Parallel':
        return parallelDesc
      case 'Rotated':
        return rotatedDesc
      case 'Upside down':
        return upsideDownDesc
      case 'Upwards':
        return upwardsDesc
      default:
        return defaultDesc
    }
  }

  // While preferred placement descriptors offer lots of configuration options, they cannot be used
  // to control the minimum distance of a label to the source or target node of its owner edge.
  // However, node margins may be used towards this end. E.g. the halo defined here reserves enough
  // space above all nodes to prevent labels from overlapping the target arrows of their owner
  // edges. (Due to the simple structure of this demo's sample graph, all edges enter their
  // target nodes from above.)
  layoutData.nodeMargins = new Insets(15, 0, 0, 0)

  return { layout, layoutData }
}
