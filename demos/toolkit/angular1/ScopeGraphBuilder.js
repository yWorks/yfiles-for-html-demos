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
   * This is a modified GraphSource that stores a child scope of the given scope in each node's tag.
   *
   * By default, GraphSource stores the business data object that corresponds to a node in the node's tag. For this
   * demo, we want to store a scope object instead (and store the data as item of the scope). Therefore, the methods
   * the deal with the creation and updating of nodes and groups are overridden to implement this behavior.
   */
  class ScopeGraphBuilder extends yfiles.binding.GraphBuilder {
    /**
     * Creates a new instance of ScopeGraphBuilder.
     * @param {yfiles.graph.IGraph} graph
     * @param {object} scope
     */
    constructor(graph, scope) {
      super(graph)
      this.scope = scope
    }

    createNode(groupedGraph, parent, location, labelData, data) {
      // call the super method
      const node = super.createNode(groupedGraph, parent, location, labelData, data)
      // create a new child scope
      const childScope = this.scope.$new(false)
      // assign the business data
      childScope.item = data
      // put the child scope in the node's tag
      node.tag = childScope
      return node
    }

    createGroupNode(groupedGraph, data) {
      // call the super method
      const node = super.createGroupNode(groupedGraph, data)
      // create a new child scope
      const childScope = this.scope.$new(false)
      // assign the business data
      childScope.item = data
      // put the child scope in the node's tag
      node.tag = childScope
      return node
    }

    updateNode(groupedGraph, node, parent, location, labelData, data) {
      // get the scope from the node's tag
      const scope = node.tag
      // call the super method (replaces 'the' tag with the data)
      super.updateNode(groupedGraph, node, parent, location, labelData, data)
      // assign the business data
      scope.item = data
      node.tag = scope
    }

    updateGroupNode(groupedGraph, groupNode, data) {
      // get the scope from the node's tag
      const scope = groupNode.tag
      // call the super method (replaces the 'tag' with the data)
      super.updateGroupNode(groupedGraph, groupNode, data)
      // assign the business data
      scope.item = data
      groupNode.tag = scope
    }
  }

  return ScopeGraphBuilder
})
