/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  Animator,
  CopiedLayoutGraph,
  GraphComponent,
  GraphConnectivity,
  IEdge,
  IEnumerable,
  IGraph,
  IModelItem,
  INode,
  INodeMap,
  InteractiveOrganicLayout,
  InteractiveOrganicLayoutExecutionContext,
  LayoutGraphAdapter,
  Maps,
  Point
} from 'yfiles'

/**
 * This class manages the interactive layout of this demo.
 */
export default class InteractiveLayout {
  private graphComponent!: GraphComponent
  private graph!: IGraph
  private copiedLayoutGraph: CopiedLayoutGraph | null = null
  private layoutContext: InteractiveOrganicLayoutExecutionContext | null = null
  private animator!: Animator
  private nodesAdded: INode[] = []
  private edgesAdded: IEdge[] = []
  private edgesRemoved: IEdge[] = []
  private nodesRemoved: INode[] = []
  private layout!: InteractiveOrganicLayout
  private movedNode: INode | null = null
  private components!: INodeMap

  /**
   * Initializes the layout algorithm.
   * @param graphComponent The given graph component
   * @param callback Called if layout has been initialized.
   */
  initLayout(graphComponent: GraphComponent, callback: Function): void {
    this.graphComponent = graphComponent
    this.graph = graphComponent.graph

    this.animator = new Animator(graphComponent)
    this.animator.autoInvalidation = false
    this.animator.allowUserInteraction = true

    if (callback) {
      callback()
    }
  }

  /**
   * Starts the layout.
   */
  startLayout(): void {
    // create a copy of the graph for the layout algorithm
    const adapter = new LayoutGraphAdapter(this.graph)
    this.copiedLayoutGraph = adapter.createCopiedLayoutGraph()

    // create the layout
    const organicLayout = new InteractiveOrganicLayout({
      qualityTimeRatio: 0.2,
      preferredNodeDistance: 30
    })

    this.layoutContext = organicLayout.startLayout(this.copiedLayoutGraph)

    let first = true
    // make the nodes unmovable at the beginning, so that the layout of the graph is maintained as it is in the
    // JSON file
    this.copiedLayoutGraph.nodes.forEach(node => {
      organicLayout.setInertia(node, 1)
    })

    this.animator.animate(() => {
      if (
        this.nodesAdded.length > 0 ||
        this.edgesAdded.length > 0 ||
        this.edgesRemoved.length > 0
      ) {
        this.layout.syncStructure()
        this.layoutContext!.continueLayout(10)
      }

      // At this point, we have to configure the layout algorithm so that:
      // (i) the new nodes can freely move,
      // (ii) the nodes that already exist in the graph can move but not as the new nodes, so that the mental map of
      //      the graph does not change a lot,
      // (iii) if an edge is removed, its source/target nodes can move more that the other nodes of the graph.
      if (this.edgesAdded.length > 0) {
        this.edgesAdded.forEach(edge => {
          const copiedSource = this.copiedLayoutGraph!.getCopiedNode(edge.sourceNode)
          const copiedTarget = this.copiedLayoutGraph!.getCopiedNode(edge.targetNode)

          if (copiedSource) {
            if (this.nodesAdded.includes(edge.sourceNode!)) {
              this.layout.setInertia(copiedSource, 0)
              this.layout.setStress(copiedSource, 1)
            } else {
              this.layout.setInertia(copiedSource, 0.7)
              this.layout.setStress(copiedSource, 0.5)
            }
          }

          if (copiedTarget) {
            if (this.nodesAdded.includes(edge.targetNode!)) {
              this.layout.setInertia(copiedTarget, 0)
              this.layout.setStress(copiedTarget, 1)
            } else {
              this.layout.setInertia(copiedTarget, 0.7)
              this.layout.setStress(copiedTarget, 0.5)
            }
          }
        })

        this.edgesAdded.length = 0
      }

      if (this.nodesAdded.length > 0) {
        this.graph.nodes.forEach(node => {
          if (this.nodesAdded.includes(node)) {
            const copiedNode = this.copiedLayoutGraph!.getCopiedNode(node)
            if (copiedNode) {
              this.layout.setInertia(copiedNode, 0.8)
              this.layout.setStress(copiedNode, 1)
            }
          }
        })

        this.nodesAdded.length = 0
      }

      if (this.edgesRemoved.length > 0) {
        this.edgesRemoved.forEach(edge => {
          const sourceNode = edge.sourceNode
          if (this.graph.contains(sourceNode)) {
            const copiedSource = this.copiedLayoutGraph!.getCopiedNode(sourceNode)
            if (copiedSource) {
              this.layout.setInertia(copiedSource, 0)
              this.layout.setStress(copiedSource, 0.5)
            }
          }
          const targetNode = edge.targetNode
          if (this.graph.contains(targetNode)) {
            const copiedTarget = this.copiedLayoutGraph!.getCopiedNode(targetNode)
            if (copiedTarget) {
              this.layout.setInertia(copiedTarget, 0)
              this.layout.setStress(copiedTarget, 0.5)
            }
          }
        })

        this.edgesRemoved.length = 0
      }

      this.layoutContext!.continueLayout(10)
      if (organicLayout.commitPositionsSmoothly(50, 0.05) > 0) {
        this.graphComponent.invalidate()

        if (first) {
          this.copiedLayoutGraph!.nodes.forEach(node => {
            organicLayout.setInertia(node, 0.8)
            organicLayout.setStress(node, 0.6)
          })
          first = false
        }
      }
    }, Number.POSITIVE_INFINITY)

    this.layout = organicLayout
  }

  /**
   * Stops the layout.
   */
  stopLayout(): void {
    this.animator.stop()
    this.layout.stop()
  }

  /**
   * Invoked when a node is created.
   */
  onNodeCreated(node: INode): void {
    this.nodesAdded.push(node)
    this.layout.wakeUp()
  }

  /**
   * Invoked when a node is removed.
   */
  onNodeRemoved(node: INode): void {
    this.nodesRemoved.push(node)
    this.layout.wakeUp()
  }

  /**
   * Invoked when an edge is created.
   */
  onEdgeCreated(edge: IEdge): void {
    this.edgesAdded.push(edge)
    this.layout.wakeUp()
  }

  /**
   * Invoked when an edge is removed.
   */
  onEdgeRemoved(edge: IEdge): void {
    this.edgesRemoved.push(edge)
    this.layout.wakeUp()
  }

  /**
   * Invoked when dragging has started.
   */
  onDragStarted(affectedItems: IEnumerable<IModelItem>): void {
    const item = affectedItems.size > 0 ? affectedItems.at(0) : null
    if (item instanceof INode && this.graph.contains(item)) {
      this.movedNode = item
      this.copiedLayoutGraph!.syncStructure()

      this.components = Maps.createHashedNodeMap()
      GraphConnectivity.connectedComponents(this.copiedLayoutGraph!, this.components)

      const copiedMovedNode = this.copiedLayoutGraph!.getCopiedNode(this.movedNode)
      if (copiedMovedNode) {
        const center = this.movedNode.layout.center
        this.layout.setCenter(copiedMovedNode, center.x, center.y)
        this.layout.setInertia(copiedMovedNode, 1)

        const movedNodeComponent = this.components.getInt(copiedMovedNode)
        this.copiedLayoutGraph!.nodes.forEach(node => {
          if (node !== copiedMovedNode) {
            if (this.components.getInt(node) === movedNodeComponent) {
              this.layout.setStress(node, 0.5)
              this.layout.setInertia(node, 0.5)
            } else {
              this.layout.setStress(node, 0)
              this.layout.setInertia(node, 0.99)
            }
          }
        })
      }
    } else if (!this.graph.contains(this.movedNode)) {
      this.movedNode = null
    }
    this.layout.wakeUp()
  }

  /**
   * Invoked when dragging is in progress.
   */
  onDragged(): void {
    if (this.movedNode && this.graph.contains(this.movedNode)) {
      const center = this.movedNode.layout.center
      const centerX = center.x
      const centerY = center.y
      this.graph.setNodeCenter(this.movedNode, new Point(centerX, centerY))
      const copiedMovedNode = this.copiedLayoutGraph!.getCopiedNode(this.movedNode)
      if (copiedMovedNode) {
        this.layout.setCenter(copiedMovedNode, centerX, centerY)

        const movedNodeComponent = this.components.getInt(copiedMovedNode)
        this.copiedLayoutGraph!.nodes.forEach(node => {
          if (node !== copiedMovedNode) {
            if (this.components.getInt(node) === movedNodeComponent) {
              this.layout.setStress(node, 0.5)
              this.layout.setInertia(node, 0.5)
            } else {
              this.layout.setStress(node, 0)
              this.layout.setInertia(node, 0.99)
            }
          }
        })
      }
    } else if (!this.graph.contains(this.movedNode)) {
      this.movedNode = null
    }
  }

  /**
   * Invoked when dragging has finished.
   */
  onDragFinished(): void {
    if (this.movedNode && this.graph.contains(this.movedNode)) {
      const center = this.movedNode.layout.center
      const centerX = center.x
      const centerY = center.y
      this.graph.setNodeCenter(this.movedNode, new Point(centerX, centerY))
      const copiedMovedNode = this.copiedLayoutGraph!.getCopiedNode(this.movedNode)
      if (copiedMovedNode) {
        this.graph.setNodeCenter(this.movedNode, new Point(centerX, centerY))
        this.layout.setCenter(copiedMovedNode, centerX, centerY)
        this.layout.setStress(copiedMovedNode, 0)
        this.layout.setInertia(copiedMovedNode, 0)
      }

      this.movedNode = null
    } else if (!this.graph.contains(this.movedNode)) {
      this.movedNode = null
    }
  }
}
