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
import data from '../resources/data.json'
import {
  type EdgeEventArgs,
  type FilteredGraphWrapper,
  type GraphComponent,
  IEdge,
  type IGraph,
  INode,
  Point
} from '@yfiles/yfiles'
import { analyzeData } from './data-analysis'
import { getEdgeTag, getLabelTag, getNodeTag } from '../types'
import { getEdgeStyle, getNodeStyle, getTextLabelStyle } from '../styles/graph-styles'
import { updateGraphInformation } from '../filter-panel'
import { removeBeaconAnimation } from '../beacon-animation'

/**
 * Marks problematic items (duplicates, isolated nodes, dangling edges) in the graph
 * and updates the graph structure with virtual elements if needed.
 *
 * @param graph - The graph to update
 */
export function updateGraphStructure(graph: IGraph): void {
  const report = analyzeData(data)

  markDuplicateNodes(graph, report.duplicates)
  markIsolatedNodes(graph, report.missing.isolatedNodes)
  createDanglingEdges(graph, report.missing.danglingEdges)
}

/**
 * Marks all duplicate nodes with a problem tag for visual identification.
 * @param graph - The graph to update
 * @param duplicates - The array of duplicated nodes
 */
function markDuplicateNodes(
  graph: IGraph,
  duplicates: ReturnType<typeof analyzeData>['duplicates']
): void {
  const allDuplicates = [...duplicates.exact, ...duplicates.normalized, ...duplicates.lowercase]
  allDuplicates.forEach((group, index) => {
    group.nodeIds.forEach((id) => {
      const node = graph.nodes.find((n) => getNodeTag(n).id === id)!
      getNodeTag(node).problem = { type: 'duplicate', id: index }
    })
  })
}

/**
 * Marks isolated nodes (no incident edges) with a problem tag.
 * @param graph - The graph to update
 * @param isolatedNodeIds - The array of the isolated node ids
 */
function markIsolatedNodes(graph: IGraph, isolatedNodeIds: string[]): void {
  isolatedNodeIds.forEach((id) => {
    const node = graph.nodes.find((n) => getNodeTag(n).id === id)!
    getNodeTag(node).problem = { type: 'isolatedNode' }
  })
}

/**
 * Creates edges with virtual nodes for dangling edges (missing endpoints).
 * @param graph - The graph to update
 * @param danglingEdges - The dangling edges of the given graph
 */
function createDanglingEdges(
  graph: IGraph,
  danglingEdges: ReturnType<typeof analyzeData>['missing']['danglingEdges']
): void {
  danglingEdges.forEach((edge, index) => {
    const source = getOrCreateNode(graph, edge.from, edge.fromExists)
    const target = getOrCreateNode(graph, edge.to, edge.toExists)

    graph.createEdge({
      source,
      target,
      tag: {
        id: edge.id,
        label: edge.label,
        from: edge.from,
        to: edge.to,
        problem: { type: 'danglingEdge', id: index },
        visible: true
      }
    })
  })
}

/**
 * Gets an existing node or creates a virtual placeholder node if it doesn't exist.
 * Virtual nodes are used as endpoints for dangling edges where the actual node
 * is missing from the graph.
 * They are rendered invisibly and marked as virtual.
 *
 * @param graph - The graph to search or create the node in
 * @param nodeId - The unique identifier of the node
 * @param exists - Whether the node already exists in the graph
 * @returns The existing node or newly created virtual placeholder node
 */
function getOrCreateNode(graph: IGraph, nodeId: string, exists: boolean): INode {
  if (exists) {
    return graph.nodes.find((n) => getNodeTag(n).id === nodeId)!
  }

  return graph.createNode({ tag: { id: nodeId, label: '', virtual: true, visible: true } })
}

/**
 * Merges duplicate nodes by redirecting all edges to a reference node
 * and removing duplicates from the graph.
 *
 * @param graphComponent - The graph component
 * @param node - A duplicate node to merge
 */
export async function mergeDuplicates(graphComponent: GraphComponent, node: INode): Promise<void> {
  const graph = (graphComponent.graph as FilteredGraphWrapper).wrappedGraph!
  const tag = getNodeTag(node)
  const duplicateGroup = graph.nodes.filter((n) => getNodeTag(n).problem?.id === tag.problem?.id)

  // Redirect edges from duplicates to node
  duplicateGroup.toArray().forEach((duplicate) => {
    if (duplicate !== node && graph.contains(duplicate)) {
      redirectEdges(graph, duplicate, node)
      graph.remove(duplicate)
      removeElementFromDOM(getNodeTag(duplicate).id)
    }
  })

  // Update reference node styling
  cleanupRefNode(graphComponent, node)
  updateGraphInformation(graphComponent.graph)
}

/**
 * Redirects all edges from a duplicate node to the reference node.
 *
 * For each edge incident to the duplicate node:
 * - Creates a new edge with the same properties.
 * - Replaces the duplicate node endpoint with the reference node.
 * - Applies styling to the new edge.
 * - Removes the old edge from the graph.
 *
 * @param graph - The graph containing the nodes and edges
 * @param fromNode - The duplicate node whose edges are being redirected
 * @param toNode - The reference node to redirect edges to
 */
function redirectEdges(graph: IGraph, fromNode: INode, toNode: INode): void {
  graph
    .edgesAt(fromNode)
    .toArray()
    .forEach((edge) => {
      const edgeTag = getEdgeTag(edge)
      const newEdge = graph.createEdge({
        source: edge.sourceNode === fromNode ? toNode : edge.sourceNode,
        target: edge.targetNode === fromNode ? toNode : edge.targetNode,
        tag: {
          id: edgeTag.id,
          label: edgeTag.label,
          from: edgeTag.from,
          to: edgeTag.to,
          visible: true
        }
      })
      graph.setStyle(newEdge, getEdgeStyle(newEdge))
      graph.remove(edge)
    })
}

/**
 * Cleans up the reference node after merging duplicates:
 * - Removes the problem marker tag.
 * - Updates node styling to normal appearance.
 * - Removes error labels and updates text labels.
 * - Cleans up DOM elements.
 *
 * @param graphComponent - The graphComponent that contains the node
 * @param refNode - The reference node to clean up
 */
function cleanupRefNode(graphComponent: GraphComponent, refNode: INode): void {
  updateElement(graphComponent, refNode, true)

  // Update or remove error labels
  const graph = graphComponent.graph
  refNode.labels.toArray().forEach((label) => {
    const labelType = getLabelTag(label).type
    if (labelType === 'text') {
      graph.setStyle(label, getTextLabelStyle(refNode))
    } else if (labelType === 'error') {
      graph.remove(label)
    }
  })
}

/**
 * Updates the state of an element.
 * - Removes the 'problem' from its tag.
 * - Removes the corresponding problem from the description panel.
 * - Removes the beacon animation of present.
 * - Updates the style if needed.
 *
 * @param graphComponent - The graphComponent to which the element belongs
 * @param item - The item to be updated
 * @param updateStyle - Whether to update the item's style
 */
function updateElement(
  graphComponent: GraphComponent,
  item: INode | IEdge,
  updateStyle: boolean
): void {
  const tag = item instanceof INode ? getNodeTag(item) : getEdgeTag(item)
  delete tag.problem
  removeElementFromDOM(tag.id)
  removeBeaconAnimation(graphComponent, item)
  if (updateStyle) {
    if (item instanceof INode) {
      graphComponent.graph.setStyle(item, getNodeStyle(item))
    } else {
      graphComponent.graph.setStyle(item, getEdgeStyle(item))
    }
  }
}

/**
 * Updates edge ports after user manually reconnects a dangling edge.
 *
 * When both endpoints are now real nodes (not virtual placeholders):
 * - Removes the problem marker tag.
 * - Updates the edge styling to normal appearance.
 * - Removes virtual placeholder nodes.
 * - Cleans up DOM elements.
 *
 * @param graphComponent - The graphComponent
 * @param evt - The event fired when the ports change
 */
export function updateEdgePorts(graphComponent: GraphComponent, evt: EdgeEventArgs): void {
  const edge = evt.item
  const wrappedGraph = (graphComponent.graph as FilteredGraphWrapper).wrappedGraph!
  const edgeTag = getEdgeTag(edge)

  // Only process dangling edges where both endpoints are now real nodes
  if (!edgeTag.problem) {
    return
  }

  // If the source/target ports are real nodes, remove the corresponding virtual nodes.
  const oldSource = evt.sourcePortOwner as INode
  const sourceNode = edge.sourceNode
  if (oldSource !== sourceNode && getNodeTag(oldSource).virtual) {
    graphComponent.selection.remove(oldSource)
    wrappedGraph.remove(oldSource)
  }

  const oldTarget = evt.targetPortOwner as INode
  const targetNode = edge.targetNode
  if (oldTarget !== targetNode && getNodeTag(oldTarget).virtual) {
    graphComponent.selection.remove(oldTarget)
    wrappedGraph.remove(evt.targetPortOwner)
  }

  updateGraphInformation(graphComponent.graph)

  const sourceNodeTag = getNodeTag(sourceNode)
  const targetNodeTag = getNodeTag(targetNode)
  if (sourceNodeTag.virtual || targetNodeTag.virtual) {
    return
  }

  // Remove problem marker and update styling
  updateElement(graphComponent, edge, true)

  // Update edge tag with new endpoint references
  edge.tag = {
    id: edgeTag.id,
    from: sourceNodeTag.id,
    to: targetNodeTag.id,
    label: edgeTag.label,
    visible: true
  }

  // Update label styling
  setTimeout(() => {
    edge.labels.forEach((label) => {
      wrappedGraph.setStyle(label, getTextLabelStyle(edge))
    })
  }, 0)
}

/**
 * Animates the viewport to center on a node or edge with zoom.
 *
 * @param graphComponent - The graph component
 * @param item - Node or edge to zoom to
 */
export async function zoomToItem(
  graphComponent: GraphComponent,
  item: INode | IEdge
): Promise<void> {
  const viewRect =
    item instanceof INode
      ? item.layout.toRect().getEnlarged(1000)
      : item.targetNode.layout.toRect().getEnlarged(1000)

  const componentWidth = graphComponent.size.width
  const componentHeight = graphComponent.size.height

  // Calculate max zoom to fit item in viewport
  const maxZoom = Math.min(componentWidth / viewRect.width, componentHeight / viewRect.height)
  const zoom = Math.min(maxZoom, 1.5)

  await graphComponent.zoomToAnimated(zoom, new Point(viewRect.centerX, viewRect.centerY))
}

/**
 * Removes a node or edge from the graph and its DOM representation from the description panel.
 *
 * @param graphComponent - The graph component
 * @param item - Node or edge to remove
 */
export function removeElement(graphComponent: GraphComponent, item: INode | IEdge): void {
  const elementId = item instanceof INode ? getNodeTag(item).id : getEdgeTag(item).id
  removeBeaconAnimation(graphComponent, item)
  if (item instanceof IEdge) {
    graphComponent.selection.remove(item.sourceNode)
    graphComponent.selection.remove(item.targetNode)
  }
  graphComponent.selection.remove(item)
  graphComponent.graph.remove(item)
  removeElementFromDOM(elementId)
  updateGraphInformation(graphComponent.graph)
}

/**
 * Removes a node/edge element from the DOM by ID and its separator.
 *
 * @param id - The element ID to remove
 */
function removeElementFromDOM(id: string): void {
  document.getElementById(id)?.remove()
  document.getElementById(`sep-${id}`)?.remove()

  const dataProblemsList = document.querySelector<HTMLDivElement>('#data-problems-list')!
  if (dataProblemsList.children.length === 0) {
    document.querySelector<HTMLSpanElement>('#data-problems-text')!.textContent =
      'All problems have been resolved!'

    document.querySelector<HTMLInputElement>('#error-animation')!.style.display = 'none'
  }
}
