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
import { IEnumerable, IGraph, INode, Rect } from 'yfiles'

/*
 * Provides utility functions for aligning nodes, i.e.
 *   alignTop               - nodes will get the same y-coordinate
 *   alignLeft              - nodes will get the same x-coordinate
 *   alignBottom            - nodes will get the same maximum y-coordinate
 *   alignRight             - nodes will get the same maximum x-coordinate
 *   alignHorizontally      - node centers will get the same x-coordinate
 *   alignVertically        - node centers will get the same y-coordinate and distributing nodes, i.e.
 *   distributeHorizontally - nodes will be distributed along x-axis
 *   distributeVertically   - nodes will be distributed along y-axis
 *
 * For simplicity's sake, group nodes are currently not supported.
 */

/**
 * Aligns the given nodes such that all nodes have the same y-coordinate.
 * @param graph the graph that contains the given nodes.
 * @param nodes the nodes to be repositioned.
 */
export function alignTop(graph: IGraph, nodes: IEnumerable<INode>): void {
  if (hasAtLeastTwoNodes(nodes)) {
    alignMinCoordImpl(graph, nodes, 'y')
  }
}

/**
 * Aligns the given nodes such that all nodes have the same x-coordinate.
 * @param graph the graph that contains the given nodes.
 * @param nodes the nodes to be repositioned.
 */
export function alignLeft(graph: IGraph, nodes: IEnumerable<INode>): void {
  if (hasAtLeastTwoNodes(nodes)) {
    alignMinCoordImpl(graph, nodes, 'x')
  }
}

/**
 * Aligns the given nodes such that `y + height` is the same value for all nodes.
 * @param graph the graph that contains the given nodes.
 * @param nodes the nodes to be repositioned.
 */
export function alignBottom(graph: IGraph, nodes: IEnumerable<INode>): void {
  if (hasAtLeastTwoNodes(nodes)) {
    alignMaxCoordImpl(graph, nodes, 'y', 'height')
  }
}

/**
 * Aligns the given nodes such that `x + width` is the same value for all nodes.
 * @param graph the graph that contains the given nodes.
 * @param nodes the nodes to be repositioned.
 */
export function alignRight(graph: IGraph, nodes: IEnumerable<INode>): void {
  if (hasAtLeastTwoNodes(nodes)) {
    alignMaxCoordImpl(graph, nodes, 'x', 'width')
  }
}

/**
 * Aligns the given nodes such that the centers of the nodes have the same x-coordinate.
 * @param graph the graph that contains the given nodes.
 * @param nodes the nodes to be repositioned.
 */
export function alignHorizontally(graph: IGraph, nodes: IEnumerable<INode>): void {
  if (hasAtLeastTwoNodes(nodes)) {
    alignCenterCoordImpl(graph, nodes, 'x', 'width')
  }
}

/**
 * Aligns the given nodes such that the centers of the nodes have the same y-coordinate.
 * @param graph the graph that contains the given nodes.
 * @param nodes the nodes to be repositioned.
 */
export function alignVertically(graph: IGraph, nodes: IEnumerable<INode>): void {
  if (hasAtLeastTwoNodes(nodes)) {
    alignCenterCoordImpl(graph, nodes, 'y', 'height')
  }
}

/**
 * Aligns the given nodes by the given coordinate property.
 * Used for top and left aligning nodes.
 * @param graph the graph that contains the given nodes.
 * @param nodes the nodes to be repositioned.
 * @param coordinate the coordinate property to use for positioning the nodes.
 */
function alignMinCoordImpl(graph: IGraph, nodes: IEnumerable<INode>, coordinate: 'x' | 'y'): void {
  if (nodes.size == 0) {
    return
  }

  const edit = graph.beginEdit('Align Nodes', 'Align Nodes')

  const min = nodes.reduce(
    (min, node) => Math.min(node.layout[coordinate], min),
    nodes.first().layout[coordinate]
  )
  for (const node of nodes) {
    updateLayout(graph, node, coordinate, min)
  }

  edit.commit()
}

/**
 * Aligns the given nodes by the given coordinate and size properties.
 * Used for bottom and right aligning nodes.
 * @param graph the graph that contains the given nodes.
 * @param nodes the nodes to be repositioned.
 * @param coordinate the coordinate property to use for positioning the nodes.
 * @param size the size property to use for positioning the nodes.
 */
function alignMaxCoordImpl(
  graph: IGraph,
  nodes: IEnumerable<INode>,
  coordinate: 'x' | 'y',
  size: 'width' | 'height'
): void {
  if (nodes.size == 0) {
    return
  }

  const edit = graph.beginEdit('Align Nodes', 'Align Nodes')

  const max = nodes.reduce(
    (max, node) => Math.max(node.layout[coordinate] + node.layout[size], max),
    nodes.first().layout[coordinate]
  )
  // technically, the initial value should be
  //   nodes.at(0).layout[coordinate] + nodes.at(0).layout[size]
  // but since the reduction calculates a maximum and nodes must have non-negative width and height,
  // it does not matter for the result
  for (const node of nodes) {
    updateLayout(graph, node, coordinate, max - node.layout[size])
  }

  edit.commit()
}

/**
 * Aligns the given nodes by the center of the given coordinate and size properties.
 * Used for vertical and horizontal aligning nodes.
 * @param graph the graph that contains the given nodes.
 * @param nodes the nodes to be repositioned.
 * @param coordinate the coordinate property to use for positioning the nodes.
 * @param size the size property to use for positioning the nodes.
 */
function alignCenterCoordImpl(
  graph: IGraph,
  nodes: IEnumerable<INode>,
  coordinate: 'x' | 'y',
  size: 'width' | 'height'
): void {
  if (nodes.size == 0) {
    return
  }

  const edit = graph.beginEdit('Align Nodes', 'Align Nodes')

  const node = nodes.reduce(
    (largestNode, node) => (largestNode.layout[size] < node.layout[size] ? node : largestNode),
    nodes.first()
  )
  const center = node.layout.center[coordinate]
  for (const node of nodes) {
    updateLayout(graph, node, coordinate, center - node.layout[size] * 0.5)
  }

  edit.commit()
}

/**
 * Distributes the given nodes along the x-axis. I.e. the given nodes are repositioned such that
 * they do not overlap horizontally. (Vertical overlaps are not removed, though.)
 * @param graph the graph that contains the given nodes.
 * @param nodes the nodes to be repositioned.
 * @param minimumSpacing the minimum distance between distributed nodes.
 */
export function distributeHorizontally(
  graph: IGraph,
  nodes: IEnumerable<INode>,
  minimumSpacing = 0
): void {
  if (hasAtLeastTwoNodes(nodes)) {
    distributeImpl(graph, nodes, minimumSpacing, 'x', 'width')
  }
}

/**
 * Distributes the given nodes along the y-axis. I.e. the given nodes are repositioned such that
 * they do not overlap vertically. (Horizontal overlaps are not removed, though.)
 * @param graph the graph that contains the given nodes.
 * @param nodes the nodes to be repositioned.
 * @param minimumSpacing the minimum distance between distributed nodes.
 */
export function distributeVertically(
  graph: IGraph,
  nodes: IEnumerable<INode>,
  minimumSpacing = 0
): void {
  if (hasAtLeastTwoNodes(nodes)) {
    distributeImpl(graph, nodes, minimumSpacing, 'y', 'height')
  }
}

/**
 * Distributes the given nodes along the given coordinate axis.
 * @param graph the graph that contains the given nodes.
 * @param nodes the nodes to be repositioned.
 * @param minimumSpacing the minimum distance between distributed nodes.
 * @param coordinate the coordinate property to use for positioning the nodes.
 * @param size the size property to use for positioning the nodes.
 */
function distributeImpl(
  graph: IGraph,
  nodes: IEnumerable<INode>,
  minimumSpacing: number,
  coordinate: 'x' | 'y',
  size: 'width' | 'height'
): void {
  if (nodes.size == 0) {
    return
  }

  const edit = graph.beginEdit('Distribute Nodes', 'Distribute Nodes')

  const fnl = nodes.first().layout
  let min = fnl[coordinate]
  let max = fnl[coordinate] + fnl[size]
  let occupied = 0

  const array: INode[] = []
  for (const node of nodes) {
    const nl = node.layout

    min = Math.min(min, nl[coordinate])
    max = Math.max(max, nl[coordinate] + nl[size])
    occupied += nl[size]

    array.push(node)
  }

  const dist = Math.max(0, minimumSpacing)
  const availableSpace = max - min - occupied
  const spacingInBetween = availableSpace > dist ? availableSpace / (array.length - 1) : dist

  array.sort((n1, n2) => {
    const center1 = n1.layout.center[coordinate]
    const center2 = n2.layout.center[coordinate]
    if (center1 < center2) {
      return -1
    } else if (center1 > center2) {
      return 1
    } else {
      return 0
    }
  })

  let pos = array[0].layout[coordinate]
  for (const node of array) {
    updateLayout(graph, node, coordinate, pos)
    pos += node.layout[size] + spacingInBetween
  }

  edit.commit()
}

/**
 * Determines if the given enumerable has at least two elements.
 * @param nodes the enumerable to check.
 */
function hasAtLeastTwoNodes(nodes: IEnumerable<INode>): boolean {
  const en = nodes.getEnumerator()
  return en.moveNext() && en.moveNext()
}

/**
 * Sets the given value for the given coordinate of the given node.
 * @param graph the graph that contains the given node.
 * @param node the node whose coordinate is set.
 * @param coordinate the coordinate property to set.
 * @param value the new value to set for the given coordinate.
 */
function updateLayout(graph: IGraph, node: INode, coordinate: 'x' | 'y', value: number): void {
  const nl = node.layout
  const geometry = { x: nl.x, y: nl.y, width: nl.width, height: nl.height }
  geometry[coordinate] = value
  graph.setNodeLayout(node, Rect.from(geometry))
}
