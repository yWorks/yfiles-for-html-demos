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
import { DefaultLabelStyle, IconLabelStyle, ShapeNodeStyle } from 'yfiles'
import { getSubtree } from '../subtrees.js'
import { getDepth } from '../data-types.js'
import { CollapseDecorator } from './CollapseDecorator.js'
import { MindMapNodeStyle } from './MindMapNodeStyle.js'
import { MindMapEdgeStyle } from './MindMapEdgeStyle.js'
import { MindMapIconLabelStyleRenderer } from './MindMapIconLabelStyleRenderer.js'
import { TagChangeUndoUnit } from '../interaction/TagChangeUndoUnit.js'

/**
 * The array of node styles used for nodes at different depths.
 * The style at position i in the array is used for nodes at depth i of the tree.
 * @type {Array.<INodeStyle>}
 */
let nodeStyles

/**
 * The array of edge styles used for edges at different depths.
 * The style at position i in the array is used for edges from depth i to depth i+1 of the tree.
 * @type {Array.<IEdgeStyle>}
 */
let edgeStyles

/**
 * The array of label styles used for node labels at different depths.
 * The style at position i in the array is used for labels at depth i of the tree.
 * @type {Array.<ILabelStyle>}
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
    new IconLabelStyle({
      wrapped: new DefaultLabelStyle({
        font: '30px Arial'
      }),
      renderer: new MindMapIconLabelStyleRenderer()
    }),
    new IconLabelStyle({
      wrapped: new DefaultLabelStyle({ font: '18px Arial' }),
      renderer: new MindMapIconLabelStyleRenderer()
    }),
    new IconLabelStyle({
      wrapped: new DefaultLabelStyle({ font: '16px Arial' }),
      renderer: new MindMapIconLabelStyleRenderer()
    })
  ]
}

/**
 * Updates the styles of a subtree based on the depth information
 * in the nodes' tags.
 * @param {!INode} subtreeRoot
 * @param {!IGraph} fullGraph
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
 * @param {number} depth The node's depth.
 * @returns {!ILabelStyle} The label's style.
 */
export function getLabelStyle(depth) {
  const maxStyle = labelStyles.length - 1
  return labelStyles[depth > maxStyle ? maxStyle : depth]
}

/**
 * Gets the node style based on the depth information
 * in the nodes' tags.
 * @param {number} depth The node's depth.
 * @returns {!INodeStyle} The node's style.
 */
export function getNodeStyle(depth) {
  const maxStyle = nodeStyles.length - 1
  return nodeStyles[depth > maxStyle ? maxStyle : depth]
}

/**
 * Gets the edge style based on the depth information.
 * @param {number} depth
 * @returns {!IEdgeStyle}
 */
export function getEdgeStyle(depth) {
  const maxStyle = edgeStyles.length - 1
  return edgeStyles[depth > maxStyle ? maxStyle : depth]
}

/**
 * Sets the color for a node.
 * @param {!INode} node
 * @param {!string} color
 * @param {!GraphComponent} graphComponent
 */
export function setNodeColor(node, color, graphComponent) {
  const oldData = node.tag
  const newData = { ...oldData, color }
  node.tag = newData

  // create a custom undo unit
  graphComponent.graph.undoEngine.addUnit(
    new TagChangeUndoUnit('Change Color', 'Change Color', oldData, newData, node)
  )
  graphComponent.invalidate()
}
