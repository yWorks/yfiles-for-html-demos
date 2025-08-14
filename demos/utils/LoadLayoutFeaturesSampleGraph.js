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
import {
  CssFill,
  EdgePathCropper,
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
  InteriorNodeLabelModel,
  LabelShape,
  LabelStyle,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Stroke,
  VerticalTextAlignment
} from '@yfiles/yfiles'

/**
 * @yjs:keep = nodeList,edgeList
 */
export async function loadLayoutSampleGraph(graph, fileName) {
  const response = await fetch(fileName)
  const data = await response.json()

  initStyles(graph)

  const builder = new GraphBuilder(graph)
  const nodesSource = builder.createNodesSource({
    data: data.nodeList.filter((node) => !node.isGroup),
    id: 'id',
    tag: 'tag',
    layout: 'layout',
    parentId: 'parent'
  })
  const groupSource = builder.createGroupNodesSource({
    data: data.nodeList.filter((node) => node.isGroup),
    id: 'id',
    tag: 'tag',
    layout: 'layout'
  })

  const nodeCreator = nodesSource.nodeCreator
  nodeCreator.styleProvider = (data) => getNodeStyle(data)

  const nodeLabelCreator = nodeCreator.createLabelsSource((data) => data.labels || []).labelCreator
  nodeLabelCreator.textProvider = (data) => data.text
  nodeLabelCreator.layoutParameterProvider = () => InteriorNodeLabelModel.CENTER
  nodeLabelCreator.styleProvider = (data) => getLabelStyle(2.5, data)

  const groupCreator = groupSource.nodeCreator
  groupCreator.styleProvider = (data) => getGroupNodeStyle(data)

  const groupLabelCreator = groupCreator.createLabelsSource(
    (data) => data.labels || []
  ).labelCreator
  groupLabelCreator.textProvider = (data) => data.text
  groupLabelCreator.layoutParameterProvider = () =>
    new GroupNodeLabelModel().createTabBackgroundParameter()
  groupLabelCreator.styleProvider = () => getGroupLabelStyle()

  const edgesSource = builder.createEdgesSource({
    data: data.edgeList,
    id: 'id',
    sourceId: 'source',
    targetId: 'target',
    bends: 'bends',
    tag: 'tag'
  })
  const edgeCreator = edgesSource.edgeCreator
  edgeCreator.styleProvider = (data) => getEdgeStyle(data)

  const edgeLabelCreator = edgeCreator.createLabelsSource((data) => data.labels || []).labelCreator
  edgeLabelCreator.textProvider = (data) => data.text || ''
  edgeLabelCreator.layoutParameterProvider = () => new FreeEdgeLabelModel().createParameter()
  edgeLabelCreator.styleProvider = (data) => getLabelStyle(2.0, data)

  builder.buildGraph()
}

function initStyles(graph) {
  graph.nodeDefaults.style = getNodeStyle(null)
  graph.edgeDefaults.style = getEdgeStyle(null)
  graph.decorator.ports.edgePathCropper.addConstant(
    new EdgePathCropper({ cropAtPort: false, extraCropLength: 1.0 })
  )
  graph.nodeDefaults.labels.style = getLabelStyle(2.5, null)
  graph.edgeDefaults.labels.style = getLabelStyle(2.0, null)
  graph.groupNodeDefaults.style = getGroupNodeStyle(null)
  graph.groupNodeDefaults.labels.style = getGroupLabelStyle()
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createTabBackgroundParameter()
}

function getGroupLabelStyle() {
  return new LabelStyle({
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'left',
    textFill: '#9CC5CF'
  })
}

function getGroupNodeStyle(data) {
  const fill = data && data.fill ? data.fill : '#0B7189'
  return new GroupNodeStyle({ tabFill: fill, stroke: `2px solid ${fill}`, tabPosition: 'top' })
}

function getNodeStyle(data) {
  return new ShapeNodeStyle({
    shape: data && data.shape ? data.shape : 'round-rectangle',
    fill: data && data.fill ? data.fill : '#FF6C00',
    stroke: data && data.stroke ? data.stroke : '1.5px #662b00'
  })
}

function getEdgeStyle(data) {
  const stroke = Stroke.from((data && data.stroke) || '1.5px #662b00')
  return new PolylineEdgeStyle({
    stroke: stroke,
    sourceArrow: getArrow(data ? data.sourceArrow : null, stroke),
    targetArrow: getArrow(data ? data.targetArrow : null, stroke)
  })
}

function getArrow(dataArrow, stroke) {
  if (!dataArrow) {
    return IArrow.NONE
  }
  if (dataArrow === 'stealth') {
    //the arrow is stealth, so we take the color from the edge stroke
    const color = stroke.fill instanceof CssFill ? stroke.fill.value : '#662b00'
    return IArrow.from(`${color} small triangle`)
  }
  //custom arrow from json data, use it directly
  return IArrow.from(dataArrow)
}

function getLabelStyle(rounding, data) {
  const labelStyle = new LabelStyle()
  labelStyle.shape = LabelShape.ROUND_RECTANGLE
  labelStyle.backgroundFill = data && data.fill ? data.fill : '#FFC398'
  labelStyle.textFill = data && data.textFill ? data.textFill : '#662b00'
  labelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  labelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  labelStyle.padding = [2, 4, 1, 4]
  return labelStyle
}
