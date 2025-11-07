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
  EdgePortCandidates,
  HierarchicalLayout,
  HierarchicalLayoutData,
  INode,
  LabelAlongEdgePlacements,
  LayoutExecutor,
  LayoutOrientation,
  LayoutStageBase,
  Point,
  PortCandidateType
} from '@yfiles/yfiles'
import { getVoterShift } from './data-types'
import { normalizeThickness } from './edge-thickness'
import { updateStyles } from './styles-support'

/**
 * Normalizes the edge thicknesses, updates the node and edge styles and the node sizes accordingly,
 * and runs a new layout.
 */
export async function updateStylesAndLayout(graphComponent, fromSketchMode) {
  // creates a compound edit so that the thickness normalization, the style changes and the layout
  // are all included in the same undo unit so that they can be reverted at one undo/redo step
  const compoundEdit = graphComponent.graph.beginEdit('Graph updated', 'Graph updated')
  normalizeThickness(graphComponent)
  updateStyles(graphComponent.graph)
  await runLayout(graphComponent, fromSketchMode)
  compoundEdit.commit()
}

/**
 * Runs the hierarchical layout to create the sankey diagram.
 * @param graphComponent The given graphComponent
 * @param fromSketchMode True if the layout should run in incremental mode, false otherwise
 */
export async function runLayout(graphComponent, fromSketchMode) {
  // configure the layout algorithm
  const layout = createHierarchicalLayout(fromSketchMode)
  const layoutData = createHierarchicalLayoutData(graphComponent.graph, fromSketchMode)

  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()

  // run the layout and animate the result
  await graphComponent.applyLayoutAnimated(layout, '0.5s', layoutData)
}

/**
 * Configures the hierarchical layout algorithm for the Sankey visualization.
 * @param fromSketchMode True if the layout should run n incremental mode, false otherwise
 */
function createHierarchicalLayout(fromSketchMode) {
  const hierarchicalLayout = new HierarchicalLayout({
    layoutOrientation: 'left-to-right',
    fromSketchMode,
    nodeDistance: 30,
    // configure the generic labeling algorithm which produces more compact results
    edgeLabelPlacement: 'generic',
    defaultEdgeDescriptor: {
      minimumFirstSegmentLength: 80,
      minimumLastSegmentLength: 80,
      backLoopRouting: true
    },
    defaultNodeDescriptor: {
      // a port border gap ratio of zero means that ports can be placed directly
      // on the corners of the nodes
      borderToPortGapRatio: 1
    },
    coordinateAssigner: {
      // disable further reducing from bends
      bendReduction: false
    }
  })

  // for Sankey diagrams, the nodes should be adjusted to the
  // incoming/outgoing flow (enlarged if necessary) -> use NodeResizingStage for that purpose
  const nodeResizingStage = new NodeResizingStage(hierarchicalLayout)
  nodeResizingStage.layoutOrientation = hierarchicalLayout.layoutOrientation
  nodeResizingStage.portBorderGapRatio = 1
  hierarchicalLayout.layoutStages.prepend(nodeResizingStage)

  return hierarchicalLayout
}

/**
 * Configures the hierarchical layout data for the Sankey visualization
 * @returns The configured hierarchical Layout data object
 */
function createHierarchicalLayoutData(graph, fromSketchMode) {
  // create the layout data
  const hierarchicalLayoutData = new HierarchicalLayoutData({
    // maps each edge with its thickness so that the layout algorithm takes the edge
    // thickness under consideration
    edgeThickness: (edge) => getVoterShift(edge).thickness ?? 1,
    // edge labels should be placed near the source node, if possible
    edgeLabelPreferredPlacements: new EdgeLabelPreferredPlacement({
      placementAlongEdge: LabelAlongEdgePlacements.AT_SOURCE
    }),
    ports: {
      // since orientation is LEFT_TO_RIGHT, we add port candidates so that the edges
      // leave the source node at its right side and enter the target node at its left side
      sourcePortCandidates: new EdgePortCandidates().addFreeCandidate('right'),
      targetPortCandidates: new EdgePortCandidates().addFreeCandidate('left')
    }
  })

  if (!fromSketchMode) {
    // In this demo, the nodes are ordered in the layers based on their size to show how the party
    // strength gets modified along the elections.
    // From this ordering the non-voters are excluded and are placed at the bottom of the layer
    hierarchicalLayoutData.sequenceConstraints.itemComparables = (item) =>
      item instanceof INode && !isNonVoter(item)
        ? graph.edgesAt(item).reduce((acc, edge) => acc + getVoterShift(edge).thickness, 0)
        : 0
  }
  return hierarchicalLayoutData
}

/**
 * This layout stage ensures that the size of the nodes is large enough such that
 * all edges can be placed without overlaps.
 */
class NodeResizingStage extends LayoutStageBase {
  #layoutOrientation
  #portBorderGapRatio
  #minimumPortDistance

  /**
   * Creates a new instance of NodeResizingStage.
   */
  constructor(layout) {
    super(layout)
    this.#layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
    this.#portBorderGapRatio = 0
    this.#minimumPortDistance = 0
  }

  /**
   * Gets the main orientation of the layout. Should be the same value as for the associated core layout
   * algorithm.
   * @returns The main orientation of the layout
   */
  get layoutOrientation() {
    return this.#layoutOrientation
  }

  /**
   * Gets the main orientation of the layout. Should be the same value as for the associated core layout
   * algorithm.
   * @param orientation One of the default layout orientations
   */
  set layoutOrientation(orientation) {
    this.#layoutOrientation = orientation
  }

  /**
   * Gets the port border gap ratio for the port distribution at the sides of the nodes.
   * Should be the same value as for the associated core layout algorithm.
   * @returns The port border gap ratio
   */
  get portBorderGapRatio() {
    return this.#portBorderGapRatio
  }

  /**
   * Sets the port border gap ratio for the port distribution at the sides of the nodes. Should be the same value
   * as for the associated core layout algorithm.
   * @param portBorderGapRatio The given ratio
   */
  set portBorderGapRatio(portBorderGapRatio) {
    this.#portBorderGapRatio = portBorderGapRatio
  }

  /**
   * Returns the minimum distance between two ports on the same node side.
   * @returns The minimum distance between two ports
   */
  get minimumPortDistance() {
    return this.#minimumPortDistance
  }

  /**
   * Gets the minimum distance between two ports on the same node side.
   * @param minimumPortDistance The minimum distance
   */
  set minimumPortDistance(minimumPortDistance) {
    this.#minimumPortDistance = minimumPortDistance
  }

  /**
   * Applies the layout to the given graph.
   * @param graph The given graph
   */
  applyLayoutImpl(graph) {
    if (!this.coreLayout) {
      return
    }

    graph.nodes.forEach((node) => {
      this.adjustNodeSize(node, graph)
    })

    // run the core layout
    this.coreLayout.applyLayout(graph)
  }

  /**
   * Adjusts the size of the given node.
   * @param node The given node
   * @param graph The given graph
   */
  adjustNodeSize(node, graph) {
    let width = 60
    let height = 40

    const leftEdgeSpace = node.inEdges.size > 0 ? this.calcRequiredSpace(node.inEdges, graph) : 0
    const rightEdgeSpace = node.outEdges.size > 0 ? this.calcRequiredSpace(node.outEdges, graph) : 0
    if (
      this.layoutOrientation === LayoutOrientation.TOP_TO_BOTTOM ||
      this.layoutOrientation === LayoutOrientation.BOTTOM_TO_TOP
    ) {
      // we have to enlarge the width such that the in-/out-edges can be placed side by side without overlaps
      width = Math.max(width, leftEdgeSpace)
      width = Math.max(width, rightEdgeSpace)
    } else {
      // we have to enlarge the height such that the in-/out-edges can be placed side by side without overlaps
      height = Math.max(height, leftEdgeSpace)
      height = Math.max(height, rightEdgeSpace)
    }

    // adjust size for edges with strong port candidates
    const edgeThicknessDP = graph.context.getItemData(HierarchicalLayout.EDGE_THICKNESS_DATA_KEY)
    if (edgeThicknessDP !== null) {
      node.edges.forEach((edge) => {
        const thickness = edgeThicknessDP.get(edge)

        const spc = this.getFirstPortCandidate(edge, true)
        if (edge.source === node && spc && spc.type !== PortCandidateType.FREE) {
          const sourcePoint = new Point(
            edge.source.layout.center.x - edge.sourcePortLocation.x,
            edge.source.layout.center.y - edge.sourcePortLocation.y
          )
          width = Math.max(width, Math.abs(sourcePoint.x) * 2 + thickness)
          height = Math.max(height, Math.abs(sourcePoint.y) * 2 + thickness)
        }

        const tpc = this.getFirstPortCandidate(edge, false)
        if (edge.target === node && tpc && tpc.type !== PortCandidateType.FREE) {
          const targetPoint = new Point(
            edge.target.layout.center.x - edge.targetPortLocation.x,
            edge.target.layout.center.y - edge.targetPortLocation.y
          )
          width = Math.max(width, Math.abs(targetPoint.x) * 2 + thickness)
          height = Math.max(height, Math.abs(targetPoint.y) * 2 + thickness)
        }
      })
    }
    node.layout.width = width
    node.layout.height = height
  }

  /**
   * Calculates the space required when placing the given edge side by side without overlaps and considering
   * the specified minimum port distance and edge thickness.
   * @param edges The edges to calculate the space for
   * @param graph The given graph
   */
  calcRequiredSpace(edges, graph) {
    const edgeThicknessDP = graph.context.getItemData(HierarchicalLayout.EDGE_THICKNESS_DATA_KEY)
    return (
      edges.reduce((acc, edge) => {
        return acc + (edgeThicknessDP === null ? 0 : edgeThicknessDP.get(edge))
      }, 0) +
      (edges.size - 1) * this.minimumPortDistance +
      2 * this.portBorderGapRatio * this.minimumPortDistance
    )
  }

  /**
   * Returns the first port candidate for the given edge, if exists.
   */
  getFirstPortCandidate(e, atSource) {
    const dp = e.graph.context.getItemData(
      atSource
        ? EdgePortCandidates.SOURCE_PORT_CANDIDATES_DATA_KEY
        : EdgePortCandidates.TARGET_PORT_CANDIDATES_DATA_KEY
    )
    return dp?.get(e)?.candidates.at(0) ?? null
  }
}

/**
 * Returns whether the given node represents a non-voter.
 */
function isNonVoter(item) {
  return item.labels.size > 0 && item.labels.at(0).text === 'Non-voter'
}
