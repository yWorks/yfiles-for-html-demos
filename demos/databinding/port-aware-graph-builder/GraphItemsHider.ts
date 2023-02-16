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
import type { IEdgeStyle, ILabelStyle, IModelItem, INodeStyle, IPortStyle } from 'yfiles'
import {
  IGraph,
  INode,
  Mapper,
  VoidEdgeStyle,
  VoidLabelStyle,
  VoidNodeStyle,
  VoidPortStyle
} from 'yfiles'

const itemToStyle = new Mapper<IModelItem, INodeStyle | IEdgeStyle | ILabelStyle | IPortStyle>()

/**
 * Hides the visualizations of the given nodes and their related items.
 * In this context, the items related to a node are
 * - the edges connected to the node,
 * - the node's labels,
 * - the node's ports, and
 * - the labels of the node's ports.
 * This method does not remove items from the given graph.
 * This method has to be called prior to using method {@link #showNodesAndRelatedItems}.
 * @param graph The graph that contains the given nodes.
 * @param nodes The nodes whose visualizations will be hidden.
 */
export function hideNodesAndRelatedItems(graph: IGraph, nodes: INode[]): void {
  itemToStyle.clear()

  for (const node of nodes) {
    itemToStyle.set(node, node.style)
    graph.setStyle(node, VoidNodeStyle.INSTANCE)

    for (const edge of graph.edgesAt(node)) {
      const style = edge.style
      if (style != VoidEdgeStyle.INSTANCE) {
        itemToStyle.set(edge, style)
        graph.setStyle(edge, VoidEdgeStyle.INSTANCE)
      }
    }

    for (const label of node.labels) {
      itemToStyle.set(label, label.style)
      graph.setStyle(label, VoidLabelStyle.INSTANCE)
    }

    for (const port of node.ports) {
      itemToStyle.set(port, port.style)
      graph.setStyle(port, VoidPortStyle.INSTANCE)

      for (const label of port.labels) {
        itemToStyle.set(label, label.style)
        graph.setStyle(label, VoidLabelStyle.INSTANCE)
      }
    }
  }
}

/**
 * Shows the visualizations of the given nodes and their related items again.
 * Before using this method, {@link #hideNodesAndRelatedItems} has to be called.
 * The given graph may not be modified structurally in-between calling
 * {@link #hideNodesAndRelatedItems} and using this method.
 * The given set of nodes has to be the same set that was passed to
 * {@link #hideNodesAndRelatedItems} before.
 * @param graph The graph that contains the given nodes.
 * @param nodes The nodes whose visualizations will be shown.
 */
export function showNodesAndRelatedItems(graph: IGraph, nodes: INode[]): void {
  for (const node of nodes) {
    graph.setStyle(node, itemToStyle.get(node) as INodeStyle)

    for (const edge of graph.edgesAt(node)) {
      graph.setStyle(edge, itemToStyle.get(edge) as IEdgeStyle)
    }

    for (const label of node.labels) {
      graph.setStyle(label, itemToStyle.get(label) as ILabelStyle)
    }

    for (const port of node.ports) {
      graph.setStyle(port, itemToStyle.get(port) as IPortStyle)

      for (const label of port.labels) {
        graph.setStyle(label, itemToStyle.get(label) as ILabelStyle)
      }
    }
  }

  itemToStyle.clear()
}
