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
  BezierEdgeStyle,
  LabelStyle,
  ShapeNodeStyle,
  Size,
  StretchNodeLabelModel,
  Stroke
} from '@yfiles/yfiles'
import { getPoliticalParty, getVoterShift } from './data-types'

/**
 * The colors used for the node/edge visualization.
 * Dark colors will be used for the node visualization and the highlighting of the edges.
 * Light colors will be used for the edge visualization.
 */
export const colors = [
  { dark: '#000000', light: '#00000080' },
  { dark: '#db3a34', light: '#db3a3480' },
  { dark: '#f0c808', light: '#f0c80860' },
  { dark: '#56926e', light: '#56926e80' },
  { dark: '#6c4f77', light: '#6c4f7780' },
  { dark: '#4281a4', light: '#4281a480' },
  { dark: '#242265', light: '#24226590' },
  { dark: '#2d4d3a', light: '#2d4d3a90' }
]

/**
 * Configures the default size and style for nodes, edge labels, and edges.
 */
export function initializeDefaultStyles(graphComponent) {
  const graph = graphComponent.graph

  // set the default node size
  graph.nodeDefaults.size = new Size(60, 40)
  // set a non-shared style for the nodes, so that each of them gets a color based on the
  // 'colorId' property stored in its data
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.style = new ShapeNodeStyle({ stroke: null })

  // set the default style for the node labels
  graph.nodeDefaults.labels.style = new LabelStyle({
    textFill: 'white',
    font: '16px Arial',
    wrapping: 'wrap-word',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'center'
  })

  // use a label model that stretches the label over the full node layout, with small insets
  graph.nodeDefaults.labels.layoutParameter = new StretchNodeLabelModel({
    padding: 3
  }).createParameter('center')

  // set a non-shared style for the edge, so that each of them gets a color based on the
  // 'colorId' property stored in its data
  graph.edgeDefaults.shareStyleInstance = false
  graph.edgeDefaults.style = new BezierEdgeStyle()

  // set a non-shared style for the labels, so that each of them gets a text color based on the
  // 'colorId' property stored in its owner property
  graph.edgeDefaults.labels.shareStyleInstance = false
  graph.edgeDefaults.labels.style = new LabelStyle({ font: '14px Arial' })

  // hide handles for edges
  graph.decorator.edges.handleProvider.hide()
  // hide label selection
  graph.decorator.labels.selectionRenderer.hide()
}

/**
 * Updates the styles of the graph elements.
 * It basically assigns a color to each node based on its label text, stores the given color to the
 * node's data and updates the color of the node and its adjacent edges.
 */
export function updateStyles(graph) {
  const label2color = new Map()

  graph.nodeLabels.forEach((label) => {
    const node = label.owner
    // if no colorId is assigned, get one from the demo's colors
    if (getPoliticalParty(node).colorId === undefined) {
      const text = label.text
      let colorId
      if (label2color.get(text) == null) {
        colorId = label2color.size % colors.length
        label2color.set(text, colorId)
      }
      colorId = label2color.get(text)
      // update the node data
      getPoliticalParty(node).colorId = colorId
    }

    // update the node's color and its adjacent edges
    updateNodeColor(node, graph)
  })
}

/**
 * Returns the color used for the given node based on its colorId.
 */
export function getNodeColor(node) {
  return colors[getPoliticalParty(node).colorId].dark
}

/**
 * Returns the color used for the given edge based on its colorId.
 */
export function getEdgeColor(edge) {
  return colors[getVoterShift(edge).colorId].light
}

/**
 * Returns the color used for the given label based on the colorId of the associated edge.
 */
export function getLabelColor(label) {
  return colors[getVoterShift(label.owner).colorId].dark
}

/**
 * Updates the color of the given node and its adjacent edges based on the colorId property
 * of its associated data.
 */
export function updateNodeColor(node, graph) {
  const style = node.style
  style.fill = getNodeColor(node)
  updateAdjacentEdges(node, graph)
}

/**
 * Updates the adjacent edges of the given node based on the colorId property
 * of its associated data.
 */
export function updateAdjacentEdges(node, graph) {
  const colorDirectionBox = document.querySelector('#colorDirection')
  const edges =
    colorDirectionBox.value === 'outgoing' ? graph.outEdgesAt(node) : graph.inEdgesAt(node)
  for (const edge of edges) {
    getVoterShift(edge).colorId = getPoliticalParty(node).colorId
    updateEdgeStyle(edge)
  }
}

/**
 * Updates the color of the given edge and its associated labels based on the colorId property
 * of its associated data.
 */
export function updateEdgeStyle(edge) {
  const style = edge.style
  style.stroke = new Stroke(getEdgeColor(edge), getVoterShift(edge).thickness)
  edge.labels.forEach((label) => {
    const style = label.style
    style.textFill = getLabelColor(label)
  })
}
