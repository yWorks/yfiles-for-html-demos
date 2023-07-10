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
import {
  ArcEdgeStyle,
  Arrow,
  ArrowEdgeStyle,
  ArrowStyleShape,
  ArrowType,
  ExteriorLabelModel,
  Font,
  GeneralPath,
  HorizontalTextAlignment,
  IArrow,
  type IEdge,
  type IEdgeStyle,
  type IGraph,
  ImageNodeStyle,
  MarkupLabelStyle,
  Rect,
  RectangleNodeStyle,
  Size,
  VerticalTextAlignment
} from 'yfiles'
import { type ColorSet, colorSets } from 'demo-resources/demo-colors'
import { getType, NodeTypes } from './data-types'

/**
 * A mapping between node types and colors.
 */
const predefinedColorSets = new Map<NodeTypes, ColorSet>([
  [NodeTypes.PRODUCT, colorSets['demo-palette-54']],
  [NodeTypes.REACTANT, colorSets['demo-palette-56']],
  [NodeTypes.ENZYME, colorSets['demo-palette-59']],
  [
    NodeTypes.REACTION,
    {
      fill: '#0b7189',
      stroke: 'black',
      nodeLabelFill: '#9dc6d0',
      edgeLabelFill: '#9f9ea9',
      text: '#0e0e28'
    }
  ],
  [NodeTypes.CO_REACTANT, colorSets['demo-palette-72']],
  [NodeTypes.OTHER, colorSets['demo-palette-511']]
])

/**
 * The style used for labels that can support HTML tags.
 */
const markupLabelStyle = new MarkupLabelStyle({
  shape: 'round-rectangle',
  insets: 2,
  verticalTextAlignment: VerticalTextAlignment.CENTER,
  horizontalTextAlignment: HorizontalTextAlignment.CENTER,
  font: new Font({ fontSize: 14, fontWeight: 'bold', fontFamily: 'Tahoma,sans-serif' })
})

/**
 * The color of the edges.
 */
const edgeStrokeColor = '#0b7189'

/**
 * Initializes the default styles for the nodes and edges of the graph.
 */
export function initializeDefaultStyles(graph: IGraph): void {
  graph.nodeDefaults.size = new Size(190, 60)
  graph.edgeDefaults.style = new ArrowEdgeStyle({
    shape: ArrowStyleShape.ARROW,
    stroke: `2px ${edgeStrokeColor}`,
    fill: `${edgeStrokeColor}`
  })
}

/**
 * Updates the node and edge styles based on the node types.
 */
export function updateStyles(graph: IGraph): void {
  graph.nodes.forEach(node => {
    const type = getType(node)
    const colorSet = predefinedColorSets.get(type)!
    graph.setStyle(
      node,
      type !== NodeTypes.REACTION
        ? new RectangleNodeStyle({
            fill: colorSet.nodeLabelFill,
            stroke: `2px solid ${colorSet.fill}`
          })
        : reactionNodeStyle
    )

    if (node.labels.size > 0) {
      const label = node.labels.at(0)!
      graph.setStyle(label, markupLabelStyle)
      if (type === NodeTypes.CO_REACTANT || type === NodeTypes.OTHER) {
        graph.setLabelLayoutParameter(label, ExteriorLabelModel.NORTH)
      }
    }

    if (type === NodeTypes.REACTION) {
      graph.setNodeLayout(node, new Rect(0, 0, 40, 40))
    } else if (type === NodeTypes.CO_REACTANT || type === NodeTypes.OTHER) {
      graph.setNodeLayout(node, new Rect(0, 0, 20, 20))
    }
  })

  const visited = new Set()
  graph.edges.toArray().forEach(edge => {
    if (visited.has(edge)) {
      return
    }

    const source = edge.sourceNode!
    const sourceType = getType(source)
    const target = edge.targetNode!
    const targetType = getType(target)

    const parallelEdge = graph.getEdge(target, source)
    if (parallelEdge && !visited.has(parallelEdge)) {
      graph.remove(parallelEdge)
      graph.setStyle(
        edge,
        new ArrowEdgeStyle({
          shape: ArrowStyleShape.DOUBLE_ARROW,
          stroke: `2px ${edgeStrokeColor}`,
          fill: `${edgeStrokeColor}`
        })
      )
      visited.add(parallelEdge)
      visited.add(edge)
    }

    if (sourceType === NodeTypes.CO_REACTANT || targetType === NodeTypes.CO_REACTANT) {
      graph.setStyle(edge, getArcEdgeStyle(graph, edge))
    }
  })
}

/**
 * Returns an arc-edge style for edges attached to co-reactants by calculating the appropriate edge height.
 */
export function getArcEdgeStyle(graph: IGraph, edge: IEdge): IEdgeStyle {
  const hasArrow = getType(edge.sourceNode!) !== NodeTypes.CO_REACTANT
  return new ArcEdgeStyle({
    height: getArcHeight(graph, edge),
    stroke: `3px dashed ${edgeStrokeColor}`,
    targetArrow: hasArrow
      ? new Arrow({
          type: ArrowType.TRIANGLE,
          stroke: `3px ${edgeStrokeColor}`,
          fill: `${edgeStrokeColor}`
        })
      : IArrow.NONE
  })
}

/**
 * Calculates the height for the arc edge based on the position of its source/target.
 */
function getArcHeight(graph: IGraph, edge: IEdge): number {
  const source = edge.sourceNode!
  const target = edge.targetNode!

  const reaction = getType(source) === NodeTypes.REACTION ? source : target
  const coReactants = graph
    .neighbors(reaction)
    .filter(
      neighbor =>
        getType(neighbor) === NodeTypes.CO_REACTANT && neighbor.layout.x > reaction.layout.x
    )
  return coReactants.size > 1 ? -40 : 40
}

/**
 * The node style used for rendering reactions with an image.
 */
export const reactionNodeStyle = new ImageNodeStyle({
  image: 'resources/reaction.svg',
  aspectRatio: 1,
  normalizedOutline: createReactionNodeOutline()
})

/**
 * Returns the normalized outline for the ImageNodeStyle to support the elliptical shape.
 */
function createReactionNodeOutline(): GeneralPath {
  const outline = new GeneralPath()
  outline.appendEllipse(new Rect(0, 0, 1, 1), true)
  outline.close()
  return outline
}
