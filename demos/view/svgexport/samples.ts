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
import { colorSets, createDemoNodeStyle } from 'demo-resources/demo-styles'
import {
  BezierEdgeStyle,
  DefaultLabelStyle,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  Font,
  type GraphComponent,
  IArrow,
  type IGraph,
  ImageNodeStyle,
  Point,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle,
  StringTemplateNodeStyle
} from 'yfiles'
// @ts-ignore svg import
import ImageSwitch from './resources/switch.svg'
// @ts-ignore svg import
import ImageWorkstation from './resources/workstation.svg'

export type Tag = {
  type?: string
  css?: string
}

export async function createSampleGraph(graphComponent: GraphComponent): Promise<void> {
  // add nodes and edges with different visualizations to demonstrate that the SVG export does not
  // depend on the styles used to visualize elements
  await addNetworkSample(graphComponent.graph)
  addCustomFontSample(graphComponent.graph)
  addCssStyleSample(graphComponent.graph)
  addBezierEdgesSample(graphComponent.graph)
}

/**
 * Adds sample nodes and edges representing a simple computer network.
 */
async function addNetworkSample(graph: IGraph): Promise<void> {
  const edgeStyle = new PolylineEdgeStyle({
    targetArrow: IArrow.DEFAULT
  })

  const imageSwitch = ImageSwitch as string
  const imageWorkstation = ImageWorkstation as string
  const switchStyle = new ImageNodeStyle({
    image: imageSwitch,
    // determine the intrinsic aspect ratio of the image
    aspectRatio: await ImageNodeStyle.getAspectRatio(imageSwitch)
  })
  const workstationStyle = new ImageNodeStyle({
    image: imageWorkstation,
    // determine the intrinsic aspect ratio of the image
    aspectRatio: await ImageNodeStyle.getAspectRatio(imageWorkstation)
  })

  const labelModel = new ExteriorLabelModel()
  const southLabelPosition = labelModel.createParameter(ExteriorLabelModelPosition.SOUTH)
  const northLabelPosition = labelModel.createParameter(ExteriorLabelModelPosition.NORTH)

  // create sample nodes
  const n1 = graph.createNode([150, 0, 60, 40], switchStyle, { type: 'switch' })
  const n2 = graph.createNode([0, 80, 60, 40], workstationStyle, { type: 'workstation' })
  const n3 = graph.createNode([100, 80, 60, 40], workstationStyle, { type: 'workstation' })
  const n4 = graph.createNode([200, 80, 60, 40], workstationStyle, { type: 'workstation' })
  const n5 = graph.createNode([300, 80, 60, 40], workstationStyle, { type: 'workstation' })

  // create sample edges
  graph.createEdge(n1, n2, edgeStyle)
  graph.createEdge(n1, n3, edgeStyle)
  graph.createEdge(n1, n4, edgeStyle)
  graph.createEdge(n1, n5, edgeStyle)

  // create sample labels
  graph.addLabel(n1, 'Switch', northLabelPosition)
  graph.addLabel(n2, 'Workstation 1', southLabelPosition)
  graph.addLabel(n3, 'Workstation 2', southLabelPosition)
  graph.addLabel(n4, 'Workstation 3', southLabelPosition)
  graph.addLabel(n5, 'Workstation 4', southLabelPosition)
}

/**
 * Adds sample nodes with labels that use a custom font.
 * @param graph The demo's graph.
 */
function addCustomFontSample(graph: IGraph): void {
  const nodeStyle = new ShapeNodeStyle({ fill: 'orange' })

  const labelModel = new ExteriorLabelModel({ insets: 10 })

  graph.createNode({
    style: nodeStyle,
    layout: [55, 210, 50, 50],
    labels: [
      {
        text: 'Кирилица',
        style: new DefaultLabelStyle({
          font: new Font({
            fontFamily: 'Prata',
            fontSize: 16
          })
        }),
        layoutParameter: labelModel.createParameter(ExteriorLabelModelPosition.SOUTH)
      }
    ]
  })

  graph.createNode({
    style: nodeStyle,
    layout: [205, 210, 50, 50],
    labels: [
      {
        text: '平仮名',
        style: new DefaultLabelStyle({
          font: new Font({
            fontFamily: 'Kosugi',
            fontSize: 16
          })
        }),
        layoutParameter: labelModel.createParameter(ExteriorLabelModelPosition.SOUTH)
      }
    ]
  })
}

/**
 * Adds sample nodes represented by yFiles' {@link StringTemplateNodeStyle}.
 */
function addCssStyleSample(graph: IGraph): void {
  const nodeStyle = new StringTemplateNodeStyle(
    '<rect class="{Binding css}" fill="none" stroke="black" ' +
      'width="{TemplateBinding width}" height="{TemplateBinding height}">' +
      '</rect>'
  )
  graph.createNode(new Rect(10, 350, 40, 40), nodeStyle, { css: 'demo-palette-23-node' })
  graph.createNode(new Rect(110, 350, 40, 40), nodeStyle, { css: 'demo-palette-25-node' })
  graph.createNode(new Rect(210, 350, 40, 40), nodeStyle, { css: 'demo-palette-21-node' })
  graph.createNode(new Rect(10, 450, 40, 40), nodeStyle, { css: 'demo-palette-23-node' })
  graph.createNode(new Rect(110, 450, 40, 40), nodeStyle, { css: 'demo-palette-25-node' })
  graph.createNode(new Rect(210, 450, 40, 40), nodeStyle, { css: 'demo-palette-21-node' })
}

/**
 * Adds curved edges.
 */
function addBezierEdgesSample(graph: IGraph): void {
  const nodeStyle = createDemoNodeStyle('demo-palette-21')
  const edgeStyle = new BezierEdgeStyle({ stroke: `28px ${colorSets['demo-palette-22'].stroke}33` })

  const node1 = graph.createNode([0, 550, 30, 60], nodeStyle)
  const node2 = graph.createNode([0, 625, 30, 90], nodeStyle)
  const node3 = graph.createNode([0, 730, 30, 60], nodeStyle)
  const node4 = graph.createNode([230, 550, 30, 110], nodeStyle)
  const node5 = graph.createNode([230, 680, 30, 110], nodeStyle)

  const edge1 = graph.createEdge({ source: node1, target: node4, bends: [], style: edgeStyle })
  graph.setPortLocation(edge1.sourcePort!, new Point(30, 565))
  graph.setPortLocation(edge1.targetPort!, new Point(230, 565))
  const edge2 = graph.createEdge({
    source: node1,
    target: node5,
    bends: [new Point(80, 595), new Point(180, 695)],
    style: edgeStyle
  })
  graph.setPortLocation(edge2.sourcePort!, new Point(30, 595))
  graph.setPortLocation(edge2.targetPort!, new Point(230, 695))
  const edge3 = graph.createEdge({
    source: node2,
    target: node4,
    bends: [new Point(80, 700), new Point(180, 605)],
    style: edgeStyle
  })
  graph.setPortLocation(edge3.sourcePort!, new Point(30, 700))
  graph.setPortLocation(edge3.targetPort!, new Point(230, 605))
  const edge4 = graph.createEdge({
    source: node2,
    target: node5,
    bends: [new Point(80, 640), new Point(180, 735)],
    style: edgeStyle
  })
  graph.setPortLocation(edge4.sourcePort!, new Point(30, 640))
  graph.setPortLocation(edge4.targetPort!, new Point(230, 735))
  const edge5 = graph.createEdge({
    source: node3,
    target: node4,
    bends: [new Point(80, 745), new Point(180, 645)],
    style: edgeStyle
  })
  graph.setPortLocation(edge5.sourcePort!, new Point(30, 745))
  graph.setPortLocation(edge5.targetPort!, new Point(230, 645))
  const edge6 = graph.createEdge({ source: node3, target: node5, bends: [], style: edgeStyle })
  graph.setPortLocation(edge6.sourcePort!, new Point(30, 775))
  graph.setPortLocation(edge6.targetPort!, new Point(230, 775))
}
