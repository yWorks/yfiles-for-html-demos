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
import { IEdge, IGraph, INode, Rect } from 'yfiles'

/**
 * This class holds the nodes and edges of a subtree rooted at a specific node.
 */
export default class Subtree {
  graph
  root
  nodes
  edges
  $newParent

  /**
   * Initializes a subtree with the given root node.
   * @param {!IGraph} graph The graph in which the subtree lives
   * @param {!INode} root The root of the subtree
   */
  constructor(graph, root) {
    this.graph = graph
    this.root = root
    this.nodes = new Set()
    this.edges = new Set()
    this.initializeSubtree(root)
    this.$newParent = this.parent
  }

  /**
   * Returns the edge connecting the parent and the root.
   * @type {!IEdge}
   */
  get parentToRootEdge() {
    return this.graph.inEdgesAt(this.root).at(0)
  }

  /**
   * Returns the parent node of the subtree.
   * @type {?INode}
   */
  get parent() {
    return this.parentToRootEdge ? this.parentToRootEdge.sourceNode : null
  }

  /**
   * Sets the parent node of the subtree.
   * @param parent The parent node of the subtree
   * @type {?INode}
   */
  set parent(parent) {
    if (parent && this.parentToRootEdge) {
      this.graph.setEdgePorts(
        this.parentToRootEdge,
        parent.ports.first(),
        this.parentToRootEdge.targetPort
      )
      this.graph.clearBends(this.parentToRootEdge)
    }
  }

  /**
   * Returns the new parent of the subtree.
   * @type {?INode}
   */
  get newParent() {
    return this.$newParent
  }

  /**
   * Sets the new parent of the subtree.
   * @type {?INode}
   */
  set newParent(newParent) {
    this.$newParent = newParent
  }

  /**
   * Returns the bounds including the nodes of the subtree.
   * @type {!Rect}
   */
  get bounds() {
    let subtreeBounds = Rect.EMPTY
    this.nodes.forEach((node) => {
      subtreeBounds = Rect.add(subtreeBounds, node.layout.toRect())
    })
    return subtreeBounds
  }

  /**
   * Determines the nodes and edges of a subtree of a given root.
   * @param {!INode} root The root node of the subtree
   */
  initializeSubtree(root) {
    this.graph.outEdgesAt(root).forEach((outEdge) => {
      this.edges.add(outEdge)
      this.initializeSubtree(outEdge.targetNode)
    })
    this.nodes.add(root)
  }
}
