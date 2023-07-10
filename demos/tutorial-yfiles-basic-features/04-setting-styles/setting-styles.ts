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
  Arrow,
  BridgeEdgeStyle,
  DefaultLabelStyle,
  type IGraph,
  ImageNodeStyle,
  Point,
  PolylineEdgeStyle,
  RectangleCornerStyle,
  RectangleNodeStyle,
  ShapeNodeStyle,
  Size
} from 'yfiles'

/**
 * Set up default styles for graph elements.
 * Default styles apply only to elements created after the default style has been set,
 * so typically, you'd set these as early as possible in your application.
 */
export function setDefaultStyles(graph: IGraph): void {
  // Create a ShapeNodeStyle instance, using an orange fill.
  // Set this style as the default for all nodes that don't have another
  // style assigned explicitly.
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#ff6c00',
    stroke: '1.5px #662f01'
  })
  // Also assign the default node size
  graph.nodeDefaults.size = new Size(40, 40)

  // Create a PolylineEdgeStyle which will be used as default for all edges
  // that don't have another style assigned explicitly
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '1.5px #662f01',
    targetArrow: '#662f01 small triangle'
  })

  // Create a label style using Tahoma as the label font and a black text color
  const defaultLabelStyle = new DefaultLabelStyle({
    font: '12px Tahoma',
    textFill: 'black',
    backgroundFill: '#8fff',
    shape: 'round-rectangle',
    insets: [2, 5]
  })

  // Set the defined style as the default for both edge and node labels
  graph.edgeDefaults.labels.style = defaultLabelStyle
  graph.nodeDefaults.labels.style = defaultLabelStyle
}

/**
 * Creates a node, an edge and a label using specific styles,
 * i.e. styles different from the defaults.
 */
export function createGraphItemsWithStyles(graph: IGraph) {
  const sourceNode = graph.nodes.get(0)

  const node = graph.createNodeAt({
    location: new Point(30, 215),
    style: new ImageNodeStyle('resources/star-16.svg')
  })
  graph.createEdge({
    source: sourceNode,
    target: node,
    style: new PolylineEdgeStyle({
      targetArrow: '#224556 medium triangle',
      stroke: '2px #224556'
    })
  })
  graph.addLabel({
    text: 'New Label',
    owner: node,
    style: new DefaultLabelStyle({ backgroundFill: '#a6a6c0' })
  })
}

/**
 * Changes the styles of some of the graph items.
 */
export function setStyles(graph: IGraph) {
  // get some graph items to change the style for
  const node1 = graph.nodes.get(1)
  const node2 = graph.nodes.get(2)
  const edge = graph.edges.get(0)
  const label = graph.nodeLabels.at(2)!

  const edgeStyle = new PolylineEdgeStyle({
    stroke: '2px dashed #224556',
    sourceArrow: '#224556 medium circle',
    targetArrow: '#224556 medium short'
  })

  graph.setStyle(edge, edgeStyle)

  // Creates a different style for the label with black text and a red border
  const labelStyle = new DefaultLabelStyle({
    backgroundStroke: '2px #46A8D5',
    backgroundFill: '#b4dbed',
    insets: [3, 5, 3, 5]
  })

  graph.setStyle(label, labelStyle)

  const nodeStyle1 = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: '#a37ab3',
    stroke: '2px #433449'
  })
  graph.setStyle(node1, nodeStyle1)

  const nodeStyle2 = new RectangleNodeStyle({
    fill: '#46a8d5',
    stroke: '2px #224556',
    cornerStyle: RectangleCornerStyle.CUT
  })
  graph.setStyle(node2, nodeStyle2)
}
