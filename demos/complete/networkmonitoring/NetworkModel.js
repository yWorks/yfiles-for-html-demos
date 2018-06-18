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

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * Class modeling the network as a separate graph.
   */
  class NetworkModel {
    /**
     * Initializes a new instance of the {@link NetworkModel} class with the given nodes and edges.
     * @param {yfiles.collections.List.<ModelNode>} nodes The nodes in the network.
     * @param {yfiles.collections.List.<ModelEdge>} edges The edges in the network.
     */
    constructor(nodes, edges) {
      this.$nodes = nodes.toArray()
      this.$edges = edges.toArray()
    }

    /**
     * Gets a {@link yfiles.collections.List.<ModelNode>} of nodes in the model.
     * @type {yfiles.collections.List.<ModelNode>}
     */
    get nodes() {
      return yfiles.collections.List.fromArray(this.$nodes)
    }

    /**
     * Gets a {@link yfiles.collections.List.<ModelEdge>} of edges in the model.
     * @type {yfiles.collections.List.<ModelEdge>}
     */
    get edges() {
      return yfiles.collections.List.fromArray(this.$edges)
    }

    /**
     * Returns the edges having the given node as either source or target.
     * @param {ModelNode} node The node to find connected edges of.
     * @return {yfiles.collections.List.<ModelEdge>} A {@link yfiles.collections.List.<ModelEdge>} of the edges that
     *   are connected to the node.
     */
    getAdjacentEdges(node) {
      const adjacentEdges = new yfiles.collections.List()

      this.edges.forEach(
        /** ModelEdge */ edge => {
          if (edge.source.name === node.name || edge.target.name === node.name) {
            adjacentEdges.add(edge)
          }
        }
      )
      return adjacentEdges
    }

    /**
     * Returns the nodes that are neighbors of the given node, that is, nodes that are directly connected to the
     * given node via an edge.
     * @param {ModelNode} node The node to find neighbors of.
     * @return {yfiles.collections.List.<ModelNode>} A {@link yfiles.collections.List.<ModelNode>} of the neighboring
     *   nodes.
     */
    getNeighbors(node) {
      const neighborNodes = new yfiles.collections.List()
      this.edges.forEach(
        /** ModelEdge */ edge => {
          if (edge.source === node) {
            neighborNodes.add(edge.target)
          } else if (edge.target === node) {
            neighborNodes.add(edge.source)
          }
        }
      )
      return neighborNodes
    }
  }

  return NetworkModel
})
