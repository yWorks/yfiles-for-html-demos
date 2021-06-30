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
  Edge,
  GraphComponent,
  HierarchicLayout,
  HierarchicLayoutData,
  IEdge,
  IEnumerable,
  ILayoutAlgorithm,
  LabelPlacements,
  LayoutGraph,
  LayoutMode,
  LayoutOrientation,
  LayoutStageBase,
  MISLabelingBase,
  PortConstraint,
  PortSide,
  PreferredPlacementDescriptor,
  YNode
} from 'yfiles'

/**
 * This class creates and configures the hierarchic layout algorithm for the Sankey visualization.
 */
export class SankeyLayout {
  /**
   * Creates the SankeyLayout for the given graphComponent
   * @param {!GraphComponent} graphComponent The given graphComponent
   */
  constructor(graphComponent) {
    this.graphComponent = graphComponent
  }

  /**
   * Configures the hierarchic layout algorithm for the Sankey visualization
   * @param {boolean} fromSketchMode True if the layout should run from sketch, false otherwise
   * @returns {!HierarchicLayout} The configured hierarchic layout
   */
  configureHierarchicLayout(fromSketchMode) {
    const hierarchicLayout = new HierarchicLayout({
      layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT,
      layoutMode: fromSketchMode ? LayoutMode.INCREMENTAL : LayoutMode.FROM_SCRATCH,
      nodeToNodeDistance: 30,
      backLoopRouting: true
    })
    hierarchicLayout.edgeLayoutDescriptor.minimumFirstSegmentLength = 80
    hierarchicLayout.edgeLayoutDescriptor.minimumLastSegmentLength = 80

    // a port border gap ratio of zero means that ports can be placed directly on the corners of the nodes
    const portBorderRatio = 1
    hierarchicLayout.nodeLayoutDescriptor.portBorderGapRatios = portBorderRatio
    // configures the generic labeling algorithm which produces more compact results, here
    const genericLabeling = hierarchicLayout.labeling
    genericLabeling.reduceAmbiguity = false
    genericLabeling.placeNodeLabels = false
    genericLabeling.placeEdgeLabels = true
    hierarchicLayout.labelingEnabled = true

    // for Sankey diagrams, the nodes should be adjusted to the incoming/outgoing flow (enlarged if necessary)
    // -> use NodeResizingStage for that purpose
    const nodeResizingStage = new NodeResizingStage(hierarchicLayout)
    nodeResizingStage.layoutOrientation = hierarchicLayout.layoutOrientation
    nodeResizingStage.portBorderGapRatio = portBorderRatio
    hierarchicLayout.prependStage(nodeResizingStage)

    return hierarchicLayout
  }

  /**
   * Configures the hierarchic layout data for the Sankey visualization
   * @returns {!HierarchicLayoutData} The configured hierarchic Layout data object
   */
  createHierarchicLayoutData() {
    // create the layout data
    return new HierarchicLayoutData({
      // maps each edge with its thickness so that the layout algorithm takes the edge thickness under consideration
      edgeThickness: edge => edge.tag.thickness,
      // since orientation is LEFT_TO_RIGHT, we add port constraints so that the edges leave the source node at its
      // right side and enter the target node at its left side
      sourcePortConstraints: () => PortConstraint.create(PortSide.EAST, false),
      targetPortConstraints: () => PortConstraint.create(PortSide.WEST, false),
      edgeLabelPreferredPlacement: new PreferredPlacementDescriptor({
        placeAlongEdge: LabelPlacements.AT_SOURCE
      })
    })
  }
}

/**
 * This layout stage ensures that the size of the nodes is large enough such that
 * all edges can be placed without overlaps.
 */
class NodeResizingStage extends LayoutStageBase {
  /**
   * Creates a new instance of NodeResizingStage.
   * @param {!ILayoutAlgorithm} layout
   */
  constructor(layout) {
    super(layout)
    this.layout = layout
    this.$layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
    this.$portBorderGapRatio = 0
    this.$minimumPortDistance = 0
  }

  /**
   * Gets the main orientation of the layout. Should be the same value as for the associated core layout
   * algorithm.
   * @return The main orientation of the layout
   * @type {!LayoutOrientation}
   */
  get layoutOrientation() {
    return this.$layoutOrientation
  }

  /**
   * Gets the main orientation of the layout. Should be the same value as for the associated core layout
   * algorithm.
   * @param orientation One of the default layout orientations
   * @type {!LayoutOrientation}
   */
  set layoutOrientation(orientation) {
    this.$layoutOrientation = orientation
  }

  /**
   * Gets the port border gap ratio for the port distribution at the sides of the nodes.
   * Should be the same value as for the associated core layout algorithm.
   * @return The port border gap ratio
   * @type {number}
   */
  get portBorderGapRatio() {
    return this.$portBorderGapRatio
  }

  /**
   * Sets the port border gap ratio for the port distribution at the sides of the nodes. Should be the same value
   * as for the associated core layout algorithm.
   * @param portBorderGapRatio The given ratio
   * @type {number}
   */
  set portBorderGapRatio(portBorderGapRatio) {
    this.$portBorderGapRatio = portBorderGapRatio
  }

  /**
   * Returns the minimum distance between two ports on the same node side.
   * @return The minimum distance between two ports
   * @type {number}
   */
  get minimumPortDistance() {
    return this.$minimumPortDistance
  }

  /**
   * Gets the minimum distance between two ports on the same node side.
   * @param minimumPortDistance The minimum distance
   * @type {number}
   */
  set minimumPortDistance(minimumPortDistance) {
    this.$minimumPortDistance = minimumPortDistance
  }

  /**
   * Applies the layout to the given graph.
   * @param {!LayoutGraph} graph The given graph
   */
  applyLayout(graph) {
    graph.nodes.forEach(node => {
      this.adjustNodeSize(node, graph)
    })

    // run the core layout
    this.applyLayoutCore(graph)
  }

  /**
   * Adjusts the size of the given node.
   * @param {!YNode} node The given node
   * @param {!LayoutGraph} graph The given graph
   */
  adjustNodeSize(node, graph) {
    let width = 60
    let height = 40

    const leftEdgeSpace = this.calcRequiredSpace(node.inEdges, graph)
    const rightEdgeSpace = this.calcRequiredSpace(node.outEdges, graph)
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

    // adjust size for edges with strong port constraints
    const edgeThicknessDP = graph.getDataProvider(HierarchicLayout.EDGE_THICKNESS_DP_KEY)
    if (edgeThicknessDP !== null) {
      if (node.edges) {
        node.edges.forEach(edge => {
          const thickness = edgeThicknessDP.getNumber(edge)

          const spc = PortConstraint.getSPC(graph, edge)
          if (edge.source === node && spc !== null && spc.strong) {
            const sourcePoint = graph.getSourcePointRel(edge)
            width = Math.max(width, Math.abs(sourcePoint.x) * 2 + thickness)
            height = Math.max(height, Math.abs(sourcePoint.y) * 2 + thickness)
          }

          const tpc = PortConstraint.getTPC(graph, edge)
          if (edge.target === node && tpc !== null && tpc.strong) {
            const targetPoint = graph.getTargetPointRel(edge)
            width = Math.max(width, Math.abs(targetPoint.x) * 2 + thickness)
            height = Math.max(height, Math.abs(targetPoint.y) * 2 + thickness)
          }
        })
      }
    }
    graph.setSize(node, width, height)
  }

  /**
   * Calculates the space required when placing the given edge side by side without overlaps and considering
   * the specified minimum port distance and edge thickness.
   * @param {?IEnumerable.<Edge>} edges The edges to calculate the space for
   * @param {!LayoutGraph} graph The given graph
   * @returns {number}
   */
  calcRequiredSpace(edges, graph) {
    let requiredSpace = 0
    const edgeThicknessDP = graph.getDataProvider(HierarchicLayout.EDGE_THICKNESS_DP_KEY)

    let count = 0
    if (edges) {
      edges.forEach(edge => {
        const thickness = edgeThicknessDP === null ? 0 : edgeThicknessDP.getNumber(edge)
        requiredSpace += Math.max(thickness, 1)
        count++
      })
    }

    requiredSpace += (count - 1) * this.minimumPortDistance
    requiredSpace += 2 * this.portBorderGapRatio * this.minimumPortDistance
    return requiredSpace
  }
}
