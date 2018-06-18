/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define([
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'yfiles/layout-tree'
], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * Demonstrates how to use the recursive group layout to realize different layouts of elements assigned
   * to different tiers.
   *
   * Each group node can be assigned to the left, right or middle tier.
   *
   * All group nodes mapped to {@link LEFT_TREE_GROUP_NODE} are placed on the left side. Their content is
   * drawn using a {@link yfiles.tree.TreeLayout} with layout orientation left-to-right.
   * Analogously, all group nodes mapped to {link TierType.RIGHT_TREE_GROUP_NODE} are placed on the right side.
   * Their content is drawn using a {@link yfiles.tree.TreeLayout} with layout orientation right-to-left.
   * Elements not assigned to left or right group nodes are always lay out in the middle using the
   * {@link yfiles.hierarchic.HierarchicLayout} with layout orientation left-to-right. Note that group nodes of type
   * {@link COMMON_NODE} are handled non-recursively.
   */
  class ThreeTierLayout extends yfiles.layout.LayoutStageBase {
    /**
     * Creates a new instance of <code>ThreeTierLayout</code>.
     * @param {boolean} fromSketch - Whether the {@link yfiles.hierarchic.HierarchicLayout} shall be run in incremental
     *   layout mode.
     */
    constructor(fromSketch) {
      super()

      const hierarchicLayout = new yfiles.hierarchic.HierarchicLayout()
      hierarchicLayout.layoutOrientation = yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT
      hierarchicLayout.layoutMode = fromSketch
        ? yfiles.hierarchic.LayoutMode.INCREMENTAL
        : yfiles.hierarchic.LayoutMode.FROM_SCRATCH

      // in case there are a lot of inter-edges, port optimization can take a while
      // then we want to take cut the calculation short and get a less optimized result
      hierarchicLayout.maximumDuration = 2000

      const recursiveGroupLayout = new yfiles.layout.RecursiveGroupLayout(hierarchicLayout)
      recursiveGroupLayout.autoAssignPortCandidates = true
      recursiveGroupLayout.fromSketchMode = true

      this.coreLayout = recursiveGroupLayout
    }

    /**
     * @param {yfiles.layout.LayoutGraph} graph
     */
    applyLayout(graph) {
      this.applyLayoutCore(graph)
    }

    /**
     * Returns the layout data that shall be used for the ThreeTierLayout with the specified graph.
     * @param {yfiles.graph.IGraph} graph
     * @param {boolean} fromSketch
     * @return {LayoutData}
     */
    static LAYOUT_DATA(graph, fromSketch) {
      return new LayoutData(graph, fromSketch)
    }
  }

  /**
   * The layout data that shall be used for the ThreeTierLayout with the specified graph.
   */
  class LayoutData extends yfiles.layout.CompositeLayoutData {
    /**
     * Creates a new instance configured for the specified graph.
     * @param {yfiles.graph.IGraph} graph The graph to configure the layout data for.
     * @param {boolean} fromSketch Whether the {@link yfiles.hierarchic.HierarchicLayout} shall be run in incremental
     *   layout mode.
     */
    constructor(graph, fromSketch) {
      super()

      // set up port candidates for edges (edges should be attached to the left/right side of the corresponding node
      const candidates = yfiles.collections.List.fromArray([
        yfiles.layout.PortCandidate.createCandidate(yfiles.layout.PortDirections.WEST),
        yfiles.layout.PortCandidate.createCandidate(yfiles.layout.PortDirections.EAST)
      ])

      // configure the different sub group layout settings
      const leftToRightTreeLayout = new yfiles.tree.TreeReductionStage()
      leftToRightTreeLayout.nonTreeEdgeRouter = leftToRightTreeLayout.createStraightLineRouter()
      leftToRightTreeLayout.coreLayout = new yfiles.tree.TreeLayout()
      leftToRightTreeLayout.coreLayout.layoutOrientation =
        yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT

      const rightToLeftTreeLayout = new yfiles.tree.TreeReductionStage()
      rightToLeftTreeLayout.nonTreeEdgeRouter = rightToLeftTreeLayout.createStraightLineRouter()
      rightToLeftTreeLayout.coreLayout = new yfiles.tree.TreeLayout()
      rightToLeftTreeLayout.coreLayout.layoutOrientation =
        yfiles.layout.LayoutOrientation.RIGHT_TO_LEFT

      const recursiveGroupLayoutData = new yfiles.layout.RecursiveGroupLayoutData()
      recursiveGroupLayoutData.sourcePortCandidates.constant = candidates
      recursiveGroupLayoutData.targetPortCandidates.constant = candidates

      // map each group node to the layout algorithm that should be used for its content
      recursiveGroupLayoutData.groupNodeLayouts.delegate = node => {
        switch (getTierType(node, graph)) {
          case TierType.LEFT_TREE_GROUP_NODE:
            return leftToRightTreeLayout
          case TierType.RIGHT_TREE_GROUP_NODE:
            return rightToLeftTreeLayout
          default:
            return null
        }
      }

      this.items.add(recursiveGroupLayoutData)

      const hierarchicLayoutData = new yfiles.hierarchic.HierarchicLayoutData()
      hierarchicLayoutData.nodeLayoutDescriptors.delegate = node => {
        // align tree group nodes within their layer
        switch (getTierType(node, graph)) {
          case TierType.LEFT_TREE_GROUP_NODE: {
            const descriptor = new yfiles.hierarchic.NodeLayoutDescriptor()
            descriptor.layerAlignment = 1
            return descriptor
          }
          case TierType.RIGHT_TREE_GROUP_NODE: {
            const descriptor = new yfiles.hierarchic.NodeLayoutDescriptor()
            descriptor.layerAlignment = 0
            return descriptor
          }
          default:
            return null
        }
      }

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
      this.items.add(hierarchicLayoutData)
    }
  }

  /**
   * Returns the type of tier the node is assigned to.
   * @param {yfiles.graph.INode} node
   * @param {yfiles.graph.IGraph} graph
   * @return {TierType}
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

  /**
   * @typedef TierType
   * @enum {number}
   */
  const TierType = yfiles.lang.Enum('TierType', {
    COMMON_NODE: 0,
    LEFT_TREE_GROUP_NODE: 1,
    RIGHT_TREE_GROUP_NODE: 2
  })

  return ThreeTierLayout
})
