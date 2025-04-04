/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { IconLabelStyle, LabelStyle, ShapeNodeStyle } from '@yfiles/yfiles'
import { getSubtree } from '../subtrees'
import { getDepth } from '../data-types'
import { CollapseDecorator } from './CollapseDecorator'
import { MindMapNodeStyle } from './MindMapNodeStyle'
import { MindMapEdgeStyle } from './MindMapEdgeStyle'
import { MindMapIconLabelStyle } from './MindMapIconLabelStyle'
import { createTagChangeUndoUnit } from '../interaction/TagChangeUndoUnit'
/**
 * The array of node styles used for nodes at different depths.
 * The style at position i in the array is used for nodes at depth i of the tree.
 */
let nodeStyles
/**
 * The array of edge styles used for edges at different depths.
 * The style at position i in the array is used for edges from depth i to depth i+1 of the tree.
 */
let edgeStyles
/**
 * The array of label styles used for node labels at different depths.
 * The style at position i in the array is used for labels at depth i of the tree.
 */
let labelStyles
/**
 * Sets the default styles for the nodes.
 */
export function initializeStyles() {
  nodeStyles = [
    new CollapseDecorator(new ShapeNodeStyle({ shape: 'pill', stroke: '2px #60656a' })),
    new CollapseDecorator(new MindMapNodeStyle('level1')),
    new CollapseDecorator(new MindMapNodeStyle('level2'))
  ]
  edgeStyles = [new MindMapEdgeStyle(25, 8), new MindMapEdgeStyle(8, 3), new MindMapEdgeStyle(4, 3)]
  labelStyles = [
    new MindMapIconLabelStyle(
      new IconLabelStyle({
        wrappedStyle: new LabelStyle({
          font: '30px Arial'
        })
      })
    ),
    new MindMapIconLabelStyle(
      new IconLabelStyle({
        wrappedStyle: new LabelStyle({
          font: '18px Arial'
        })
      })
    ),
    new MindMapIconLabelStyle(
      new IconLabelStyle({
        wrappedStyle: new LabelStyle({
          font: '16px Arial'
        })
      })
    )
  ]
}
/**
 * Updates the styles of a subtree based on the depth information
 * in the nodes' tags.
 */
export function updateStyles(subtreeRoot, fullGraph) {
  const { nodes: subtreeNodes, edges: subtreeEdges } = getSubtree(fullGraph, subtreeRoot)
  subtreeNodes.forEach((node) => {
    const depth = getDepth(node)
    const label = node.labels.first()
    const nodeStyle = getNodeStyle(depth)
    const labelStyle = getLabelStyle(depth)
    fullGraph.setStyle(node, nodeStyle)
    fullGraph.setStyle(label, labelStyle)
  })
  subtreeEdges.forEach((edge) => {
    const depth = getDepth(edge.sourceNode)
    const edgeStyle = getEdgeStyle(depth)
    fullGraph.setStyle(edge, edgeStyle)
  })
}
/**
 * Gets the label style based on the depth information
 * in the nodes' tags.
 * @param depth The node's depth.
 * @returns The label's style.
 */
export function getLabelStyle(depth) {
  const maxStyle = labelStyles.length - 1
  return labelStyles[depth > maxStyle ? maxStyle : depth]
}
/**
 * Gets the node style based on the depth information
 * in the nodes' tags.
 * @param depth The node's depth.
 * @returns The node's style.
 */
export function getNodeStyle(depth) {
  const maxStyle = nodeStyles.length - 1
  return nodeStyles[depth > maxStyle ? maxStyle : depth]
}
/**
 * Gets the edge style based on the depth information.
 */
export function getEdgeStyle(depth) {
  const maxStyle = edgeStyles.length - 1
  return edgeStyles[depth > maxStyle ? maxStyle : depth]
}
/**
 * Sets the color for a node.
 */
export function setNodeColor(node, color, graphComponent) {
  const oldData = node.tag
  const newData = { ...oldData, color }
  node.tag = newData
  // create a custom undo unit
  graphComponent.graph.undoEngine.addUnit(
    createTagChangeUndoUnit('Change Color', oldData, newData, node)
  )
  graphComponent.invalidate()
}
