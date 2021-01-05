/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
import { IEdge, IGraph, INode, Rect } from 'yfiles'

/**
 * This class holds the nodes and edges of a subtree rooted at a specific node.
 */
export default class Subtree {
  private graph: IGraph
  public root: INode
  public nodes: Set<INode>
  public edges: Set<IEdge>
  private $newParent: INode | null

  /**
   * Initializes a subtree with the given root node.
   * @param graph The graph in which the subtree lives
   * @param root The root of the subtree
   */
  constructor(graph: IGraph, root: INode) {
    this.graph = graph
    this.root = root
    this.nodes = new Set<INode>()
    this.edges = new Set<IEdge>()
    this.initializeSubtree(root)
    this.$newParent = this.parent
  }

  /**
   * Returns the edge connecting the parent and the root.
   */
  get parentToRootEdge(): IEdge | null {
    return this.graph.inEdgesAt(this.root).firstOrDefault()
  }

  /**
   * Returns the parent node of the subtree.
   */
  get parent(): INode | null {
    return this.parentToRootEdge ? this.parentToRootEdge.sourceNode : null
  }

  /**
   * Sets the parent node of the subtree.
   * @param parent The parent node of the subtree
   */
  set parent(parent: INode | null) {
    if (parent && this.parentToRootEdge) {
      this.graph.setEdgePorts(
        this.parentToRootEdge,
        parent.ports.firstOrDefault(),
        this.parentToRootEdge.targetPort!
      )
      this.graph.clearBends(this.parentToRootEdge)
    }
  }

  /**
   * Returns the new parent of the subtree.
   */
  get newParent(): INode | null {
    return this.$newParent
  }

  /**
   * Sets the new parent of the subtree.
   */
  set newParent(newParent: INode | null) {
    this.$newParent = newParent
  }

  /**
   * Returns the bounds including the nodes of the subtree.
   */
  get bounds(): Rect {
    let subtreeBounds = Rect.EMPTY
    this.nodes.forEach((node: INode) => {
      subtreeBounds = Rect.add(subtreeBounds, node.layout.toRect())
    })
    return subtreeBounds
  }

  /**
   * Determines the nodes and edges of a subtree of a given root.
   * @param root The root node of the subtree
   */
  private initializeSubtree(root: INode): void {
    this.graph.outEdgesAt(root).forEach((outEdge: IEdge) => {
      this.edges.add(outEdge)
      this.initializeSubtree(outEdge.targetNode!)
    })
    this.nodes.add(root)
  }
}
