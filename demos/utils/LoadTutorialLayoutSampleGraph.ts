/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
import {
  Color,
  DefaultEdgePathCropper,
  DefaultLabelStyle,
  FreeEdgeLabelModel,
  GraphBuilder,
  HorizontalTextAlignment,
  IArrow,
  IEdgeStyle,
  IGraph,
  ILabelStyle,
  INodeStyle,
  Insets,
  InteriorLabelModel,
  InteriorStretchLabelModel,
  PanelNodeStyle,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  ShapeNodeStyleRenderer,
  SolidColorFill,
  Stroke,
  VerticalTextAlignment
} from 'yfiles'
import { DemoLabelStyleRenderer } from '../resources/basic-demo-styles'

/**
 * @yjs:keep=nodeList,edgeList
 */
export async function loadLayoutSampleGraph(graph: IGraph, fileName: string): Promise<void> {
  const response = await fetch(fileName)
  const data = await response.json()

  initStyles(graph)

  const builder = new GraphBuilder(graph)
  const nodesSource = builder.createNodesSource({
    data: data.nodeList.filter((node: any) => !node.isGroup),
    id: 'id',
    tag: 'tag',
    layout: 'layout',
    parentId: 'parent'
  })
  const groupSource = builder.createGroupNodesSource({
    data: data.nodeList.filter((node: any) => node.isGroup),
    id: 'id',
    tag: 'tag',
    layout: 'layout'
  })

  const nodeCreator = nodesSource.nodeCreator
  nodeCreator.styleProvider = (data: any) => getTutorialNodeStyle(data)

  const nodeLabelCreator = nodeCreator.createLabelsSource(
    (data: any) => data.labels || []
  ).labelCreator
  nodeLabelCreator.textProvider = (data: any) => data.text
  nodeLabelCreator.layoutParameterProvider = (data: any) => InteriorLabelModel.CENTER
  nodeLabelCreator.styleProvider = (data: any) => getTutorialLabelStyle(2.5, data)

  const groupCreator = groupSource.nodeCreator
  groupCreator.styleProvider = (data: any) => getTutorialGroupNodeStyle(data)

  const groupLabelCreator = groupCreator.createLabelsSource(
    (data: any) => data.labels || []
  ).labelCreator
  groupLabelCreator.textProvider = (data: any) => data.text
  groupLabelCreator.layoutParameterProvider = (data: any) => InteriorStretchLabelModel.NORTH
  groupLabelCreator.styleProvider = (data: any) => getTutorialGroupLabelStyle()

  const edgesSource = builder.createEdgesSource({
    data: data.edgeList,
    id: 'id',
    sourceId: 'source',
    targetId: 'target',
    bends: 'bends',
    tag: 'tag'
  })
  const edgeCreator = edgesSource.edgeCreator
  edgeCreator.styleProvider = (data: any) => getTutorialEdgeStyle(data)

  const edgeLabelCreator = edgeCreator.createLabelsSource(
    (data: any) => data.labels || []
  ).labelCreator
  edgeLabelCreator.textProvider = (data: any) => data.text || ''
  edgeLabelCreator.layoutParameterProvider = (data: any) =>
    new FreeEdgeLabelModel().createDefaultParameter()
  edgeLabelCreator.styleProvider = (data: any) => getTutorialLabelStyle(2.0, data)

  builder.buildGraph()
}

function initStyles(graph: IGraph): void {
  graph.nodeDefaults.style = getTutorialNodeStyle(null)
  graph.edgeDefaults.style = getTutorialEdgeStyle(null)
  graph.decorator.portDecorator.edgePathCropperDecorator.setImplementation(
    new DefaultEdgePathCropper({ cropAtPort: true, extraCropLength: 1.0 })
  )
  graph.nodeDefaults.labels.style = getTutorialLabelStyle(2.5, null)
  graph.edgeDefaults.labels.style = getTutorialLabelStyle(2.0, null)
  graph.groupNodeDefaults.style = getTutorialGroupNodeStyle(null)
  graph.groupNodeDefaults.labels.style = getTutorialGroupLabelStyle()
  graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH
}

function getTutorialGroupLabelStyle(): ILabelStyle {
  return new DefaultLabelStyle({
    horizontalTextAlignment: 'right',
    textFill: '#0C313A',
    insets: [4, 5, 2, 5]
  })
}

function getTutorialGroupNodeStyle(data: any): INodeStyle {
  return new PanelNodeStyle({
    color: data && data.fill ? data.fill : '#FFFFFF',
    insets: data && data.insets ? data.insets : [30, 5, 5, 5],
    labelInsetsColor: data && data.labelInsetsColor ? data.labelInsetsColor : '#9CC5CF'
  })
}

function getTutorialNodeStyle(data: any): INodeStyle {
  const shapeNodeStyle = new ShapeNodeStyle({
    shape: data && data.shape ? data.shape : 'round-rectangle',
    fill: data && data.fill ? data.fill : '#FF6C00',
    stroke: data && data.stroke ? data.stroke : '1.5px #662b00'
  })
  ;(shapeNodeStyle.renderer as ShapeNodeStyleRenderer).roundRectArcRadius = 3.5
  return shapeNodeStyle
}

function getTutorialEdgeStyle(data: any): IEdgeStyle {
  const stroke = Stroke.from((data && data.stroke) || '1.5px #662b00')
  return new PolylineEdgeStyle({
    stroke: stroke,
    sourceArrow: getArrow(data ? data.sourceArrow : null, stroke),
    targetArrow: getArrow(data ? data.targetArrow : null, stroke)
  })
}

function getArrow(dataArrow: string | null, stroke: Stroke): IArrow {
  if (!dataArrow) {
    return IArrow.NONE
  }
  if (dataArrow === 'default') {
    //the arrow is default, so we take the color from the edge stroke
    const color = stroke.fill instanceof SolidColorFill ? stroke.fill.color : Color.from('#662b00')
    return IArrow.from(`rgba(${color.r},${color.g},${color.b},${color.a}) small triangle`)
  }
  //custom arrow from json data, use it directly
  return IArrow.from(dataArrow)
}

function getTutorialLabelStyle(rounding: number, data: any): ILabelStyle {
  const labelStyle = new DefaultLabelStyle(new DemoLabelStyleRenderer(rounding))
  labelStyle.backgroundFill = data && data.fill ? data.fill : '#FFC398'
  labelStyle.textFill = data && data.textFill ? data.textFill : '#662b00'
  labelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  labelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  labelStyle.insets = new Insets(4, 2, 4, 1)
  return labelStyle
}
