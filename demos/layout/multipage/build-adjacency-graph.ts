/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  AdjacencyGraphBuilder,
  EdgeCreator,
  type IGraph,
  type ILabel,
  type INode,
  Rect
} from '@yfiles/yfiles'

interface TypeInfo {
  id: string
  name: string
}
interface NamespaceInfo {
  id: string
  name: string
  types: TypeInfo[]
}
interface RootInfo {
  id: string
  name: string
  namespaces: NamespaceInfo[]
}
interface DataFileFormat {
  nodes: RootInfo[]
}

/**
 * Runs the adjacency graph builder to populate the given graph
 * with data from the JSON object.
 */
export function buildAdjacencyGraph(graph: IGraph, graphData: DataFileFormat): void {
  graph.clear()

  const builder = new AdjacencyGraphBuilder(graph)

  // Create initial nodes source for the root objects
  const rootItems: RootInfo[] = graphData.nodes
  const rootSource = builder.createNodesSource<RootInfo>(rootItems, (item) => item.id)
  rootSource.nodeCreator.createLabelBinding((rootItem: RootInfo) => rootItem.name)

  // From the root, create successor source for namespaces
  const namespaceSource = rootSource.createSuccessorsSource<NamespaceInfo>(
    (rootItem) => rootItem.namespaces,
    new EdgeCreator<RootInfo>()
  )
  namespaceSource.nodeCreator.createLabelBinding(
    (namespaceItem: NamespaceInfo) => namespaceItem.name
  )

  // From each namespace, create successor source for types
  const typeSource = namespaceSource.createSuccessorsSource<TypeInfo>(
    (nsItem) => nsItem.types,
    new EdgeCreator<NamespaceInfo>()
  )
  typeSource.nodeCreator.createLabelBinding((typeItem: TypeInfo) => typeItem.name)

  builder.buildGraph()

  graph.nodes.forEach((node) => {
    fitNodeSizeToLabel(graph, node)
  })
}

/**
 * Adjusts the size of the given node to fit to its label.
 */
function fitNodeSizeToLabel(
  graph: IGraph,
  node: INode,
  heightPadding: number = 10,
  widthPadding: number = 10
): void {
  if (node.labels.size === 0) {
    return
  }
  const label: ILabel = node.labels.first()!

  const labelPreferredSize = graph.calculateLabelPreferredSize({
    owner: node, // node label
    text: label.text,
    style: label.style,
    layoutParameter: label.layoutParameter
  })

  const oldLayout = node.layout
  graph.setNodeLayout(
    node,
    new Rect(
      oldLayout.x,
      oldLayout.y,
      labelPreferredSize.width + widthPadding,
      labelPreferredSize.height + heightPadding
    )
  )
}
