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
  Arrow,
  FreeEdgeLabelModel,
  FreeNodeLabelModel,
  GraphBuilder,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HorizontalTextAlignment,
  IArrow,
  Insets,
  LabelShape,
  LabelStyle,
  OrientedRectangle,
  Point,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  VerticalTextAlignment
} from '@yfiles/yfiles'

/**
 * Builds a graph structure from the provided data using yFiles GraphBuilder.
 * @param graph The target IGraph instance where the graph will be built.
 * @param graphData The source data containing nodes and edges information.
 * @internal
 */
export function buildGraph(graph, graphData) {
  graph.clear()

  const graphBuilder = new GraphBuilder(graph)

  const data = graphData

  const nodeSource = graphBuilder.createNodesSource({
    data: (data.nodes ?? data.nodeList ?? []).filter((item) => !item.isGroup),
    id: 'id',
    parentId: 'parent',
    tag: 'tag',
    style: (dataItem) => {
      if (dataItem?.cssClass == null) {
        return undefined
      }
      if (dataItem?.cssClass && graph.nodeDefaults.style['cssClass'] != null) {
        const style = graph.nodeDefaults.style.clone()
        style.cssClass = `node ${dataItem.cssClass}`
        return style
      }
      return new ShapeNodeStyle({
        shape: 'round-rectangle',
        stroke: '1.5px solid',
        cssClass: `node ${dataItem.cssClass}`
      })
    },
    layout: 'layout'
  })

  nodeSource.nodeCreator.createLabelsSource({
    data: (dataItem) =>
      (typeof dataItem.labels === 'string' ? [dataItem.labels] : dataItem.labels) ?? [],
    text: (dataItem) => (typeof dataItem === 'string' ? dataItem : dataItem.text),
    tag: (dataItem) => dataItem,
    style: (dataItem) => {
      if (typeof dataItem == 'string' || dataItem?.cssClass == null) {
        return undefined
      }
      if (dataItem?.cssClass && graph.nodeDefaults.labels.style['cssClass'] != null) {
        const style = graph.nodeDefaults.labels.style.clone()
        style.cssClass = `node-label ${dataItem.cssClass}`
        return style
      }
      return new LabelStyle({
        shape: LabelShape.ROUND_RECTANGLE,
        backgroundFill: '#000',
        verticalTextAlignment: VerticalTextAlignment.CENTER,
        horizontalTextAlignment: HorizontalTextAlignment.CENTER,
        padding: new Insets(2, 4, 2, 4),
        cssClass: `node-label ${dataItem.cssClass}`
      })
    }
  })

  const groupNodeSource = graphBuilder.createGroupNodesSource({
    data: (data.nodes ?? data.nodeList ?? []).filter((item) => item.isGroup),
    id: 'id',
    parentId: 'parent',
    tag: 'tag',
    layout: 'layout',
    style: (dataItem) => {
      if (dataItem?.cssClass == null) {
        return undefined
      }
      if (dataItem?.cssClass && graph.groupNodeDefaults.style['cssClass'] != null) {
        const style = graph.groupNodeDefaults.style.clone()
        style.cssClass = `group-node ${dataItem.cssClass}`
        return style
      }
      return new GroupNodeStyle({
        tabPosition: 'top-trailing',
        tabSizePolicy: 'adjust-to-label',
        stroke: '1.5px solid',
        cornerRadius: 8,
        tabWidth: 20,
        contentAreaPadding: 8,
        hitTransparentContentArea: true,
        cssClass: `group-node ${dataItem.cssClass}`
      })
    }
  })

  groupNodeSource.nodeCreator.createLabelsSource({
    data: (dataItem) =>
      typeof dataItem.labels === 'string' ? [dataItem.labels] : (dataItem.labels ?? []),
    text: (dataItem) => (typeof dataItem === 'string' ? dataItem : dataItem.text),
    tag: (dataItem) => dataItem,
    style: (dataItem) => {
      if (typeof dataItem == 'string' || dataItem?.cssClass == null) {
        return undefined
      }
      if (dataItem?.cssClass && graph.groupNodeDefaults.labels.style['cssClass'] != null) {
        const style = graph.groupNodeDefaults.labels.style.clone()
        style.cssClass = `group-node-label ${dataItem.cssClass}`
        return style
      }
      return new LabelStyle({
        wrapping: 'wrap-character-ellipsis',
        cssClass: `group-node-label ${dataItem.cssClass}`
      })
    },
    defaults: { layoutParameter: new GroupNodeLabelModel().createTabParameter() }
  })

  const edgeSource = graphBuilder.createEdgesSource({
    data: data.edges ?? data.edgeList ?? [],
    sourceId: 'source',
    targetId: 'target',
    bends: 'bends',
    tag: (dataItem) => dataItem,
    style: (dataItem) => {
      if (dataItem?.cssClass == null && !dataItem.undirected) {
        return undefined // Use default edge style
      }
      if (dataItem?.cssClass && graph.edgeDefaults.style['cssClass'] != null) {
        const style = graph.edgeDefaults.style.clone()
        style.cssClass = `edge ${dataItem.cssClass}`
        if (dataItem.undirected) {
          style.targetArrow = IArrow.NONE
        }
        return style
      }
      return new PolylineEdgeStyle({
        smoothingLength: 8,
        cssClass: dataItem.cssClass ? `edge ${dataItem.cssClass}` : 'edge',
        stroke: '1.5px solid currentColor',
        targetArrow: dataItem.undirected
          ? IArrow.NONE
          : new Arrow({
              stroke: null,
              fill: 'currentColor',
              type: 'triangle',
              widthScale: 0.75,
              lengthScale: 0.75
            })
      })
    }
  })

  edgeSource.edgeCreator.createLabelsSource({
    data: (itemData) =>
      (typeof itemData.labels === 'string' ? [itemData.labels] : itemData.labels) ?? [],
    text: (dataItem) => (typeof dataItem === 'string' ? dataItem : dataItem.text),
    tag: (dataItem) => dataItem,
    style: (dataItem) => {
      if (typeof dataItem == 'string' || dataItem?.cssClass == null) {
        return undefined
      }
      if (dataItem?.cssClass && graph.edgeDefaults.labels.style['cssClass'] != null) {
        const style = graph.edgeDefaults.labels.style.clone()
        style.cssClass = `edge-label ${dataItem.cssClass}`
        return style
      }
      return new LabelStyle({
        shape: LabelShape.ROUND_RECTANGLE,
        backgroundFill: '#000',
        verticalTextAlignment: VerticalTextAlignment.CENTER,
        horizontalTextAlignment: HorizontalTextAlignment.CENTER,
        padding: new Insets(2, 4, 2, 4),
        cssClass: `edge-label ${dataItem.cssClass}`
      })
    }
  })

  graphBuilder.buildGraph()

  // set the port locations and then update the tag with the actual tag
  graph.edges.forEach((edge) => {
    if (edge.tag?.sourcePort) {
      graph.setPortLocation(edge.sourcePort, Point.from(edge.tag?.sourcePort))
    }
    if (edge.tag?.targetPort) {
      graph.setPortLocation(edge.targetPort, Point.from(edge.tag?.targetPort))
    }
    edge.tag = edge.tag?.tag ?? null
  })

  // set the label positions
  graph.nodeLabels.forEach((label) => {
    if (label.tag?.anchorX && label.tag?.anchorY && label.tag?.width && label.tag?.height) {
      const layoutParameter = FreeNodeLabelModel.INSTANCE.findBestParameter(
        label,
        new OrientedRectangle(
          label.tag.anchorX,
          label.tag.anchorY,
          label.tag.width,
          label.tag.height,
          label.tag.upX,
          label.tag.upY
        )
      )
      graph.setLabelLayoutParameter(label, layoutParameter)
    }
  })
  graph.edgeLabels.forEach((label) => {
    if (label.tag?.anchorX && label.tag?.anchorY && label.tag?.width && label.tag?.height) {
      graph.setLabelLayoutParameter(
        label,
        new FreeEdgeLabelModel().findBestParameter(
          label,
          new OrientedRectangle(
            label.tag.anchorX,
            label.tag.anchorY,
            label.tag.width,
            label.tag.height,
            label.tag.upX,
            label.tag.upY
          )
        )
      )
    }
  })
}
