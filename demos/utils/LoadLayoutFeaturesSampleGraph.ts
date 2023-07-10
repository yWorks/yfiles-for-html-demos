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
  Color,
  DefaultEdgePathCropper,
  DefaultLabelStyle,
  FreeEdgeLabelModel,
  GraphBuilder,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HorizontalTextAlignment,
  IArrow,
  IEdgeStyle,
  IGraph,
  ILabelStyle,
  INodeStyle,
  Insets,
  InteriorLabelModel,
  LabelShape,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  ShapeNodeStyleRenderer,
  SolidColorFill,
  Stroke,
  VerticalTextAlignment
} from 'yfiles'

/**
 * @yjs:keep = nodeList,edgeList
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
  nodeCreator.styleProvider = (data: any) => getNodeStyle(data)

  const nodeLabelCreator = nodeCreator.createLabelsSource(
    (data: any) => data.labels || []
  ).labelCreator
  nodeLabelCreator.textProvider = (data: any) => data.text
  nodeLabelCreator.layoutParameterProvider = (data: any) => InteriorLabelModel.CENTER
  nodeLabelCreator.styleProvider = (data: any) => getLabelStyle(2.5, data)

  const groupCreator = groupSource.nodeCreator
  groupCreator.styleProvider = (data: any) => getGroupNodeStyle(data)

  const groupLabelCreator = groupCreator.createLabelsSource(
    (data: any) => data.labels || []
  ).labelCreator
  groupLabelCreator.textProvider = (data: any) => data.text
  groupLabelCreator.layoutParameterProvider = (data: any) =>
    new GroupNodeLabelModel().createTabBackgroundParameter()
  groupLabelCreator.styleProvider = (data: any) => getGroupLabelStyle()

  const edgesSource = builder.createEdgesSource({
    data: data.edgeList,
    id: 'id',
    sourceId: 'source',
    targetId: 'target',
    bends: 'bends',
    tag: 'tag'
  })
  const edgeCreator = edgesSource.edgeCreator
  edgeCreator.styleProvider = (data: any) => getEdgeStyle(data)

  const edgeLabelCreator = edgeCreator.createLabelsSource(
    (data: any) => data.labels || []
  ).labelCreator
  edgeLabelCreator.textProvider = (data: any) => data.text || ''
  edgeLabelCreator.layoutParameterProvider = (data: any) =>
    new FreeEdgeLabelModel().createDefaultParameter()
  edgeLabelCreator.styleProvider = (data: any) => getLabelStyle(2.0, data)

  builder.buildGraph()
}

function initStyles(graph: IGraph): void {
  graph.nodeDefaults.style = getNodeStyle(null)
  graph.edgeDefaults.style = getEdgeStyle(null)
  graph.decorator.portDecorator.edgePathCropperDecorator.setImplementation(
    new DefaultEdgePathCropper({ cropAtPort: false, extraCropLength: 1.0 })
  )
  graph.nodeDefaults.labels.style = getLabelStyle(2.5, null)
  graph.edgeDefaults.labels.style = getLabelStyle(2.0, null)
  graph.groupNodeDefaults.style = getGroupNodeStyle(null)
  graph.groupNodeDefaults.labels.style = getGroupLabelStyle()
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createTabBackgroundParameter()
}

function getGroupLabelStyle(): ILabelStyle {
  return new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'left',
    textFill: '#9CC5CF'
  })
}

function getGroupNodeStyle(data: any): INodeStyle {
  const fill = data && data.fill ? data.fill : '#0B7189'
  return new GroupNodeStyle({
    tabFill: fill,
    stroke: `2px solid ${fill}`,
    tabPosition: 'top'
  })
}

function getNodeStyle(data: any): INodeStyle {
  const shapeNodeStyle = new ShapeNodeStyle({
    shape: data && data.shape ? data.shape : 'round-rectangle',
    fill: data && data.fill ? data.fill : '#FF6C00',
    stroke: data && data.stroke ? data.stroke : '1.5px #662b00'
  })
  ;(shapeNodeStyle.renderer as ShapeNodeStyleRenderer).roundRectArcRadius = 3.5
  return shapeNodeStyle
}

function getEdgeStyle(data: any): IEdgeStyle {
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

function getLabelStyle(rounding: number, data: any): ILabelStyle {
  const labelStyle = new DefaultLabelStyle()
  labelStyle.shape = LabelShape.ROUND_RECTANGLE
  labelStyle.backgroundFill = data && data.fill ? data.fill : '#FFC398'
  labelStyle.textFill = data && data.textFill ? data.textFill : '#662b00'
  labelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  labelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  labelStyle.insets = new Insets(4, 2, 4, 1)
  return labelStyle
}
