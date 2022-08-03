/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphComponent,
  IEdge,
  IGraph,
  INode,
  LayeredNodePlacer,
  LayoutData,
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
import { isCrossReference, isLeft, isRoot } from './MindmapUtil'

/**
 * This class contains methods that deal with the mindmap graph layout.
 */
export default class MindmapLayout {
  public static instance: MindmapLayout = new MindmapLayout()

  // initialize the layout
  treeLayout: TreeLayout = new TreeLayout({
    // use port constraints
    defaultPortAssignment: new DefaultTreeLayoutPortAssignment(
      TreeLayoutPortAssignmentMode.PORT_CONSTRAINT
    )
  })

  // create the node placers
  placerLeft: LayeredNodePlacer = new LayeredNodePlacer({
    modificationMatrix: RotatableNodePlacerMatrix.ROT270,
    id: RotatableNodePlacerMatrix.ROT270,
    routingStyle: 'orthogonal',
    verticalAlignment: 0,
    spacing: 10,
    layerSpacing: 45
  })

  placerRight: LayeredNodePlacer = new LayeredNodePlacer({
    modificationMatrix: RotatableNodePlacerMatrix.ROT90,
    id: RotatableNodePlacerMatrix.ROT90,
    routingStyle: 'orthogonal',
    verticalAlignment: 0,
    spacing: 10,
    layerSpacing: 45
  })

  placerRoot: DelegatingNodePlacer = new DelegatingNodePlacer(
    RotatableNodePlacerMatrix.DEFAULT,
    this.placerLeft,
    this.placerRight
  )

  /** A flag indicating whether a layout animation is currently in progress. */
  inLayout = false

  /**
   * Constructs the MindmapLayout.
   */
  constructor() {
    this.treeLayout.prependStage(new PlaceNodesAtBarycenterStage())
    // a layout stage that keeps a certain node in place during layout
    this.treeLayout.prependStage(new FixNodeLayoutStage())
    this.treeLayout.prependStage(new TreeReductionStage())
  }

  /**
   * Adds the mappers to the graph that are needed for the layout.
   * The mappers provide the layout algorithm with additional information that is needed
   * to achieve the desired layout.
   */
  createLayoutData(): LayoutData {
    return new TreeLayoutData({
      // tells the DelegatingNodePlacer which side a node is on
      delegatingNodePlacerPrimaryNodes: isLeft,
      // tells the layout which node placer to use for a node
      nodePlacers: node => {
        if (isRoot(node)) {
          return this.placerRoot
        }
        if (isLeft(node)) {
          return this.placerLeft
        }
        return this.placerRight
      },
      // tells the layout how to sort the children of specific nodes
      outEdgeComparers: (node: INode): ((edge1: IEdge, edge2: IEdge) => number) => {
        return (edge1, edge2) => {
          if (edge1 === edge2) {
            return 0
          }
          const y1 = edge1.targetNode!.layout.y
          const y2 = edge2.targetNode!.layout.y

          if (isLeft(edge1.targetNode!)) {
            return y1 - y2
          }
          return y2 - y1
        }
      },
      // tells the layout which side to place a source port on
      sourcePortConstraints: edge =>
        PortConstraint.create(isLeft(edge.targetNode!) ? PortSide.WEST : PortSide.EAST, true),
      // tells the layout which side to place a target port on
      targetPortConstraints: edge =>
        PortConstraint.create(isLeft(edge.targetNode!) ? PortSide.EAST : PortSide.WEST, true)
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
   * @param graph The input graph.
   * @param edges The list of edges for which the ports should be adjusted.
   */
  adjustPortLocations(graph: IGraph, edges: Iterable<IEdge>): void {
    for (const edge of edges) {
      if (!isCrossReference(edge)) {
        const sourceNode = edge.sourceNode!
        const targetNode = edge.targetNode!

        if (!isRoot(sourceNode)) {
          const sourceLayout = sourceNode.layout
          const sourceBottomLeft = new Point(-sourceLayout.width * 0.5, sourceLayout.height * 0.5)
          const sourceBottomRight = new Point(+sourceLayout.width * 0.5, sourceLayout.height * 0.5)
          graph.setRelativePortLocation(
            edge.sourcePort!,
            isLeft(sourceNode) ? sourceBottomLeft : sourceBottomRight
          )
        } else {
          // source is root node - set port to center
          graph.setRelativePortLocation(edge.sourcePort!, Point.ORIGIN)
        }

        if (!isRoot(targetNode)) {
          const targetLayout = targetNode.layout
          const targetBottomLeft = new Point(-targetLayout.width * 0.5, targetLayout.height * 0.5)
          const targetBottomRight = new Point(+targetLayout.width * 0.5, targetLayout.height * 0.5)
          graph.setRelativePortLocation(
            edge.targetPort!,
            isLeft(targetNode) ? targetBottomRight : targetBottomLeft
          )
        }
      }
    }
  }

  /**
   * Calculates a layout on a subtree that is specified by a given
   * root node.
   * @param graph The input graph.
   * @param subtreeRoot The root node of the subtree.
   * @param subtreeNodes Pre-calculated nodes belonging to the subtree
   * @param subtreeEdges Pre-calculated edges belonging to the subtree
   */
  layoutSubtree(graph: IGraph, subtreeRoot: INode, subtreeNodes: INode[], subtreeEdges: IEdge[]) {
    // fix node layout stage - mark subtree root node as fixed
    const layoutData = this.createLayoutData()
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

    this.adjustPortLocations(graph, subtreeEdges)
    graph.applyLayout(new SubgraphLayout(this.treeLayout), layoutData)
  }

  /**
   * Calculates an animated layout on the graph.
   * @param graphComponent The given graphComponent.
   * @param incrementalNodes Nodes to add incrementally or null if the layout should be calculated from scratch
   * @param collapse Whether nodes are hidden (true) or added
   */
  async layout(
    graphComponent: GraphComponent,
    incrementalNodes: INode[] = [],
    collapse = false
  ): Promise<void> {
    // check a layout is currently in progress
    if (this.inLayout) {
      return Promise.resolve()
    }
    const graph = graphComponent.graph
    this.adjustPortLocations(graph, graph.edges)
    this.inLayout = true

    let layoutData: LayoutData = this.createLayoutData().combineWith(
      new FixNodeLayoutData({ fixedNodes: isRoot })
    )
    if (incrementalNodes.length > 0) {
      if (!collapse) {
        // move the incremental nodes to the barycenter of their neighbors before layout to get a
        // smooth layout animation
        this.prepareSmoothExpandLayoutAnimation(graph, incrementalNodes)
      } else {
        // mark the incremental nodes so they end up in the barycenter of their neighbors after
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
      layout: this.treeLayout,
      layoutData,
      duration: '0.2s',
      allowUserInteraction: false
    })
    try {
      await layoutExecutor.start()
    } catch (err) {
      if (err instanceof Error && err.name === 'AlgorithmAbortedError') {
        alert(
          'The layout computation was canceled because the maximum configured runtime was exceeded.'
        )
      } else if (typeof (window as any).reportError === 'function') {
        ;(window as any).reportError(err)
      }
    } finally {
      this.inLayout = false
    }
  }

  /**
   * Moves incremental nodes between their neighbors before expanding for a smooth animation.
   */
  prepareSmoothExpandLayoutAnimation(graph: IGraph, incrementalNodes: INode[]): void {
    // mark the new nodes and place them between their neighbors
    const layoutData = new PlaceNodesAtBarycenterStageData({
      affectedNodes: incrementalNodes
    })
    const layout = new PlaceNodesAtBarycenterStage()
    graph.applyLayout(layout, layoutData)
  }
}
