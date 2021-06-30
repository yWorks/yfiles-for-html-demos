/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CompositeLayoutData,
  HierarchicLayout,
  HierarchicLayoutData,
  HierarchicLayoutNodeLayoutDescriptor,
  IGraph,
  INode,
  LayoutData,
  LayoutMode,
  LayoutOrientation,
  PortCandidate,
  PortDirections,
  RecursiveGroupLayout,
  RecursiveGroupLayoutData,
  TreeLayout,
  TreeReductionStage
} from 'yfiles'

/**
 * @readonly
 * @enum {number}
 */
const TierType = {
  COMMON_NODE: 0,
  LEFT_TREE_GROUP_NODE: 1,
  RIGHT_TREE_GROUP_NODE: 2
}

/**
 * Demonstrates how to use the recursive group layout to realize different layouts of elements assigned
 * to different tiers.
 *
 * Each group node can be assigned to the left, right or middle tier.
 *
 * All group nodes mapped to {@link LEFT_TREE_GROUP_NODE} are placed on the left side. Their content is
 * drawn using a {@link TreeLayout} with layout orientation left-to-right.
 * Analogously, all group nodes mapped to {link TierType.RIGHT_TREE_GROUP_NODE} are placed on the right side.
 * Their content is drawn using a {@link TreeLayout} with layout orientation right-to-left.
 * Elements not assigned to left or right group nodes are always lay out in the middle using the
 * {@link HierarchicLayout} with layout orientation left-to-right. Note that group nodes of type
 * {@link COMMON_NODE} are handled non-recursively.
 * @param {boolean} fromSketch - Whether the {@link HierarchicLayout} shall be run in incremental layout mode.
 * @returns {!RecursiveGroupLayout}
 */
export function createThreeTierLayout(fromSketch) {
  const hierarchicLayout = new HierarchicLayout({
    layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT,
    layoutMode: fromSketch ? LayoutMode.INCREMENTAL : LayoutMode.FROM_SCRATCH,
    // in case there are a lot of inter-edges, port optimization can take a while
    // then we want to take cut the calculation short and get a less optimized result
    maximumDuration: 2000
  })

  return new RecursiveGroupLayout({
    coreLayout: hierarchicLayout,
    autoAssignPortCandidates: true,
    fromSketchMode: true
  })
}

/**
 * Returns the layout data that shall be used for the three tier layout with the specified graph.
 * @param {!IGraph} graph
 * @param {boolean} fromSketch
 * @returns {!LayoutData}
 */
export function createThreeTierLayoutData(graph, fromSketch) {
  const ld = new CompositeLayoutData()

  // set up port candidates for edges (edges should be attached to the left/right side of the corresponding node
  const candidates = [
    PortCandidate.createCandidate(PortDirections.WEST),
    PortCandidate.createCandidate(PortDirections.EAST)
  ]

  // configure the different sub group layout settings
  const leftToRightTreeLayout = new TreeReductionStage({
    coreLayout: new TreeLayout({
      layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT
    })
  })
  leftToRightTreeLayout.nonTreeEdgeRouter = leftToRightTreeLayout.createStraightLineRouter()

  const rightToLeftTreeLayout = new TreeReductionStage({
    coreLayout: new TreeLayout({
      layoutOrientation: LayoutOrientation.RIGHT_TO_LEFT
    })
  })
  rightToLeftTreeLayout.nonTreeEdgeRouter = rightToLeftTreeLayout.createStraightLineRouter()

  ld.items.add(
    new RecursiveGroupLayoutData({
      sourcePortCandidates: candidates,
      targetPortCandidates: candidates,

      // map each group node to the layout algorithm that should be used for its content
      groupNodeLayouts: node => {
        switch (getTierType(node, graph)) {
          case TierType.LEFT_TREE_GROUP_NODE:
            return leftToRightTreeLayout
          case TierType.RIGHT_TREE_GROUP_NODE:
            return rightToLeftTreeLayout
          default:
            return null
        }
      }
    })
  )

  const hierarchicLayoutData = new HierarchicLayoutData({
    nodeLayoutDescriptors: node => {
      // align tree group nodes within their layer
      switch (getTierType(node, graph)) {
        case TierType.LEFT_TREE_GROUP_NODE: {
          return new HierarchicLayoutNodeLayoutDescriptor({ layerAlignment: 1 })
        }
        case TierType.RIGHT_TREE_GROUP_NODE: {
          return new HierarchicLayoutNodeLayoutDescriptor({ layerAlignment: 0 })
        }
        default:
          return null
      }
    }
  })

  if (!fromSketch) {
    // insert layer constraints to guarantee the desired placement for "left" and "right" group nodes
    const layerConstraints = hierarchicLayoutData.layerConstraints
    graph.nodes.forEach(node => {
      // align tree group nodes within their layer
      const type = getTierType(node, graph)
      if (type === TierType.LEFT_TREE_GROUP_NODE) {
        layerConstraints.placeAtTop(node)
      } else if (type === TierType.RIGHT_TREE_GROUP_NODE) {
        layerConstraints.placeAtBottom(node)
      }
    })
  }
  ld.items.add(hierarchicLayoutData)

  return ld
}

/**
 * Returns the type of tier the node is assigned to.
 * @param {!INode} node
 * @param {!IGraph} graph
 * @returns {!TierType}
 */
function getTierType(node, graph) {
  const foldingView = graph.foldingView

  if (
    graph.isGroupNode(node) ||
    // node is an expanded group node
    foldingView.isInFoldingState(node)
  ) {
    const labelText = node.labels.size > 0 ? node.labels.first().text : ''
    switch (labelText) {
      case 'left':
        return TierType.LEFT_TREE_GROUP_NODE
      case 'right':
        return TierType.RIGHT_TREE_GROUP_NODE
      default:
        return TierType.COMMON_NODE
    }
  }
  return TierType.COMMON_NODE
}
