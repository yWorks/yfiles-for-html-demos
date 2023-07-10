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
  IGraph,
  ILayoutAlgorithm,
  LabelAngleReferences,
  LabelPlacements,
  LabelSideReferences,
  LayoutData,
  NodeHalo,
  PreferredPlacementDescriptor
} from 'yfiles'

/**
 * Demonstrates how to configure {@link HierarchicLayout} for automatic edge label placement.
 * @param {!IGraph} graph The graph to be laid out
 * @returns {!object} {{HierarchicLayout, HierarchicLayoutData}} the configured layout algorithm and the
 * corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph) {
  // create and configure the hierarchic layout algorithm
  const layout = new HierarchicLayout()
  // tell the hierarchic layout algorithm to place edge labels, too
  layout.integratedEdgeLabeling = true
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
  const closeToSourceDesc = new PreferredPlacementDescriptor()
  closeToSourceDesc.placeAlongEdge = LabelPlacements.AT_SOURCE_PORT
  closeToSourceDesc.sideReference = LabelSideReferences.ABSOLUTE_WITH_LEFT_IN_NORTH
  closeToSourceDesc.sideOfEdge = LabelPlacements.LEFT_OF_EDGE
  closeToSourceDesc.distanceToEdge = 4

  // moves a label as close to its owner edge's target node as possible
  // additionally, the corresponding label is placed on the right side of the edge *in relation
  // to the edge's direction* (i.e. for a bottom-to-top edge the label will be on the right side,
  // for a top-to-bottom edge, it will be on the left side)
  const closeToTargetDesc = new PreferredPlacementDescriptor()
  closeToTargetDesc.placeAlongEdge = LabelPlacements.AT_TARGET_PORT
  closeToTargetDesc.sideOfEdge = LabelPlacements.RIGHT_OF_EDGE
  closeToTargetDesc.distanceToEdge = 4

  // default placement
  const defaultDesc = new PreferredPlacementDescriptor()

  // rotates a label such that its baseline is parallel to its owner edge's path
  // additionally, the label is placed close to its owner edge's target node and next to the edge
  const downwardsDesc = new PreferredPlacementDescriptor()
  downwardsDesc.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
  downwardsDesc.placeAlongEdge = LabelPlacements.AT_TARGET
  downwardsDesc.sideOfEdge = LabelPlacements.LEFT_OF_EDGE
  downwardsDesc.distanceToEdge = 4

  // rotates a label such that its baseline is parallel to its owner edge's path
  // additionally, the label is placed next to the edge
  const parallelDesc = new PreferredPlacementDescriptor()
  parallelDesc.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
  parallelDesc.sideOfEdge = LabelPlacements.LEFT_OF_EDGE
  parallelDesc.distanceToEdge = 4

  // rotates a label by a fixed angle
  // additionally, the label is placed next to the edge
  const rotatedDesc = new PreferredPlacementDescriptor()
  rotatedDesc.angle = Math.PI * 0.225
  rotatedDesc.sideOfEdge = LabelPlacements.LEFT_OF_EDGE

  // rotates a label upside down
  // note, the aforementioned rotation normalization has to be turned off for this descriptor to
  // produce the desired effect, see the autoFlipping line above
  const upsideDownDesc = new PreferredPlacementDescriptor()
  upsideDownDesc.angle = Math.PI

  // rotates a label such that its baseline is parallel to its owner edge's path
  // additionally, the label is rotated to point in the opposite direction of a downwardsDesc label
  // note, the aforementioned rotation normalization has to be turned off for this descriptor to
  // produce the desired effect, see the autoFlipping line above
  const upwardsDesc = new PreferredPlacementDescriptor()
  upwardsDesc.angle = Math.PI
  upwardsDesc.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
  upwardsDesc.placeAlongEdge = LabelPlacements.AT_TARGET
  upwardsDesc.sideOfEdge = LabelPlacements.RIGHT_OF_EDGE
  upwardsDesc.distanceToEdge = 4

  // create and configure layout data for the hierarchic layout algorithm
  const layoutData = new HierarchicLayoutData()
  // register all the descriptors
  layoutData.edgeLabelPreferredPlacement.delegate = label => {
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
  // However, node halos may be used towards this end. E.g. the halo defined here reserves enough
  // space above all nodes to prevent labels from overlapping the target arrows of their owner
  // edges. (Due to the simple structure of this demo's sample graph, all edges enter their
  // target nodes from above.)
  layoutData.nodeHalos.constant = NodeHalo.create(15, 0, 0, 0)

  return { layout, layoutData }
}
