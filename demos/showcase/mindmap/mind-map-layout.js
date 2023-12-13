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
  DefaultTreeLayoutPortAssignment,
  DelegatingNodePlacer,
  FixNodeLayoutData,
  FixNodeLayoutStage,
  LayeredNodePlacer,
  LayoutExecutor,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  Point,
  PortConstraint,
  PortSide,
  RotatableNodePlacerMatrix,
  SubgraphLayout,
  SubgraphLayoutData,
  TreeLayout,
  TreeLayoutData,
  TreeLayoutPortAssignmentMode,
  TreeReductionStage,
  TreeReductionStageData
} from 'yfiles'
import { isCrossReference, isLeft, isRoot } from './data-types.js'

/**
 * A flag indicating whether a layout animation is currently in progress.
 * @type {boolean}
 */
let inLayout = false

/**
 * Returns a configured tree layout.
 * @returns {!TreeLayout}
 */
function createLayout() {
  const treeLayout = new TreeLayout({
    // use port constraints to keep the locations at the bottom of the node
    defaultPortAssignment: new DefaultTreeLayoutPortAssignment(
      TreeLayoutPortAssignmentMode.PORT_CONSTRAINT
    )
  })

  treeLayout.prependStage(new PlaceNodesAtBarycenterStage())
  // a layout stage that keeps a certain node in place during layout
  treeLayout.prependStage(new FixNodeLayoutStage())
  treeLayout.prependStage(new TreeReductionStage())

  return treeLayout
}

/**
 * Returns a layout data which specifies the different node placers,
 * port constraints, and edge comparators.
 * @returns {!LayoutData}
 */
function createLayoutData() {
  // create a node placer for a tree layout rotated to the left
  const placerLeft = new LayeredNodePlacer({
    modificationMatrix: RotatableNodePlacerMatrix.ROT270,
    id: RotatableNodePlacerMatrix.ROT270,
    routingStyle: 'orthogonal',
    verticalAlignment: 0,
    spacing: 10,
    layerSpacing: 45
  })

  // create a node placer for a tree layout rotated to the right
  const placerRight = new LayeredNodePlacer({
    modificationMatrix: RotatableNodePlacerMatrix.ROT90,
    id: RotatableNodePlacerMatrix.ROT90,
    routingStyle: 'orthogonal',
    verticalAlignment: 0,
    spacing: 10,
    layerSpacing: 45
  })

  // create a node placer that delegates some subtrees to the left and others to the right
  const placerRoot = new DelegatingNodePlacer(
    RotatableNodePlacerMatrix.DEFAULT,
    placerLeft,
    placerRight
  )

  return new TreeLayoutData({
    // tells the DelegatingNodePlacer which side a node is on
    delegatingNodePlacerPrimaryNodes: isLeft,
    // tells the layout which node placer to use for a node
    nodePlacers: (node) => {
      if (isRoot(node)) {
        return placerRoot
      }
      if (isLeft(node)) {
        return placerLeft
      }
      return placerRight
    },
    // tells the layout how to sort the children of specific nodes
    outEdgeComparers: (_) => {
      return (edge1, edge2) => {
        if (edge1 === edge2) {
          return 0
        }
        const y1 = edge1.targetNode.layout.y
        const y2 = edge2.targetNode.layout.y

        if (isLeft(edge1.targetNode)) {
          return y1 - y2
        }
        return y2 - y1
      }
    },
    // tells the layout which side to place a source port on
    sourcePortConstraints: (edge) =>
      PortConstraint.create(isLeft(edge.targetNode) ? PortSide.WEST : PortSide.EAST, true),
    // tells the layout which side to place a target port on
    targetPortConstraints: (edge) =>
      PortConstraint.create(isLeft(edge.targetNode) ? PortSide.EAST : PortSide.WEST, true)
    // a layout stage that hides cross-reference edges from the layout
  }).combineWith(
    new TreeReductionStageData({
      nonTreeEdges: isCrossReference
    })
  )
}

/**
 * Moves the source and target ports of the given edges to the bottom-left or
 * bottom-right corner of the node.
 * @param {!IGraph} graph
 * @param {!Array.<IEdge>} edges
 */
export function adjustPortLocations(graph, edges) {
  for (const edge of edges) {
    if (!isCrossReference(edge)) {
      const sourceNode = edge.sourceNode
      const targetNode = edge.targetNode

      if (!isRoot(sourceNode)) {
        const sourceLayout = sourceNode.layout
        const sourceBottomLeft = new Point(-sourceLayout.width * 0.5, sourceLayout.height * 0.5)
        const sourceBottomRight = new Point(+sourceLayout.width * 0.5, sourceLayout.height * 0.5)
        graph.setRelativePortLocation(
          edge.sourcePort,
          isLeft(sourceNode) ? sourceBottomLeft : sourceBottomRight
        )
      } else {
        // source is root node - set port to center
        graph.setRelativePortLocation(edge.sourcePort, Point.ORIGIN)
      }

      if (!isRoot(targetNode)) {
        const targetLayout = targetNode.layout
        const targetBottomLeft = new Point(-targetLayout.width * 0.5, targetLayout.height * 0.5)
        const targetBottomRight = new Point(+targetLayout.width * 0.5, targetLayout.height * 0.5)
        graph.setRelativePortLocation(
          edge.targetPort,
          isLeft(targetNode) ? targetBottomRight : targetBottomLeft
        )
      }
    }
  }
}

/**
 * Calculates a layout on a subtree that is specified by a given
 * root node.
 * @param {!IGraph} graph The input graph.
 * @param {!INode} subtreeRoot The root node of the subtree.
 * @param {!Array.<INode>} subtreeNodes Pre-calculated nodes belonging to the subtree
 * @param {!Array.<IEdge>} subtreeEdges Pre-calculated edges belonging to the subtree
 */
export function layoutSubtree(graph, subtreeRoot, subtreeNodes, subtreeEdges) {
  const layout = createLayout()
  // fix node layout stage - mark subtree root node as fixed
  const layoutData = createLayoutData()
    .combineWith(
      new FixNodeLayoutData({
        fixedNodes: subtreeRoot
      })
    )
    .combineWith(
      new SubgraphLayoutData({
        subgraphNodes: subtreeNodes
      })
    )

  adjustPortLocations(graph, subtreeEdges)
  graph.applyLayout(new SubgraphLayout(layout), layoutData)
}

/**
 * Calculates an animated layout on the graph.
 * @param {!GraphComponent} graphComponent The given graphComponent.
 * @param {!Array.<INode>} incrementalNodes Nodes to add incrementally or null if the layout should be calculated from scratch
 * @param collapse Whether nodes are hidden (true) or added
 * @param {boolean} [collapse=false]
 * @returns {!Promise}
 */
export async function layoutTree(graphComponent, incrementalNodes = [], collapse = false) {
  // check a layout is currently in progress
  if (inLayout) {
    return Promise.resolve()
  }
  const graph = graphComponent.graph
  adjustPortLocations(graph, graph.edges.toArray())
  inLayout = true

  const layout = createLayout()

  let layoutData = createLayoutData().combineWith(new FixNodeLayoutData({ fixedNodes: isRoot }))
  if (incrementalNodes.length > 0) {
    if (!collapse) {
      // move the incremental nodes to the barycenter of their neighbors before layout to get a
      // smooth layout animation
      prepareSmoothExpandLayoutAnimation(graph, incrementalNodes)
    } else {
      // mark the incremental nodes, so they end up in the barycenter of their neighbors after
      // layout for a smooth layout animation
      layoutData = layoutData.combineWith(
        new PlaceNodesAtBarycenterStageData({
          affectedNodes: incrementalNodes
        })
      )
    }
  }

  // execute an animated layout
  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: layout,
    layoutData,
    duration: '0.2s',
    allowUserInteraction: false
  })
  try {
    await layoutExecutor.start()
  } finally {
    inLayout = false
  }
}

/**
 * Moves incremental nodes between their neighbors before expanding for a smooth animation.
 * @param {!IGraph} graph
 * @param {!Array.<INode>} incrementalNodes
 */
function prepareSmoothExpandLayoutAnimation(graph, incrementalNodes) {
  // mark the new nodes and place them between their neighbors
  const layoutData = new PlaceNodesAtBarycenterStageData({
    affectedNodes: incrementalNodes
  })
  const layout = new PlaceNodesAtBarycenterStage()
  graph.applyLayout(layout, layoutData)
}

/**
 * Determines whether a layout is currently running.
 * @returns {boolean}
 */
export function isInLayout() {
  return inLayout
}
