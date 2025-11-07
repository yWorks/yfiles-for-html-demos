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
// eslint-disable @typescript-eslint/explicit-function-return-type

import { GroupNodeStyle, type IGraph, type ILabelStyle, type INode } from '@yfiles/yfiles'
import {
  Arrow,
  EdgePathLabelModel,
  ExteriorNodeLabelModel,
  GraphBuilder,
  HierarchicalLayout,
  HierarchicalLayoutData,
  LabelStyle,
  PolylineEdgeStyle,
  PortAdjustmentPolicy,
  ShapeNodeStyle
} from '@yfiles/yfiles'

type SampleDataNode = {
  id: number
  layout?: { x: number; y: number; width: number; height: number }
  tag: { type: number }
  isGroup?: boolean
  parent?: number
}
type SampleDataType = { nodeList: SampleDataNode[]; edgeList: { source: number; target: number }[] }

const SampleData: SampleDataType = {
  nodeList: [
    { id: 0, layout: { x: 432.5, y: 0, width: 40, height: 40 }, tag: { type: 2 } },
    { id: 1, layout: { x: 820, y: 181.25, width: 40, height: 40 }, tag: { type: 2 } },
    { id: 2, layout: { x: 255, y: 181.25, width: 40, height: 40 }, tag: { type: 2 } },
    { id: 3, layout: { x: 30, y: 181.25, width: 40, height: 40 }, tag: { type: 1 } },
    { id: 4, layout: { x: 580, y: 181.25, width: 40, height: 40 }, tag: { type: 0 } },
    { id: 5, layout: { x: 820, y: 295.75, width: 40, height: 40 }, tag: { type: 1 }, parent: 36 },
    { id: 6, layout: { x: 575, y: 295.75, width: 40, height: 40 }, tag: { type: 2 }, parent: 35 },
    { id: 7, layout: { x: 400, y: 295.75, width: 40, height: 40 }, tag: { type: 1 } },
    { id: 8, layout: { x: 750, y: 295.75, width: 40, height: 40 }, tag: { type: 1 }, parent: 36 },
    { id: 9, layout: { x: 600, y: 646.75, width: 40, height: 40 }, tag: { type: 1 } },
    { id: 10, layout: { x: 190, y: 295.75, width: 40, height: 40 }, tag: { type: 0 } },
    { id: 11, layout: { x: 260, y: 295.75, width: 40, height: 40 }, tag: { type: 2 } },
    { id: 12, layout: { x: 120, y: 295.75, width: 40, height: 40 }, tag: { type: 0 } },
    { id: 13, layout: { x: 260, y: 387.75, width: 40, height: 40 }, tag: { type: 2 } },
    { id: 14, layout: { x: 190, y: 387.75, width: 40, height: 40 }, tag: { type: 2 } },
    { id: 15, layout: { x: 330, y: 295.75, width: 40, height: 40 }, tag: { type: 0 } },
    { id: 16, layout: { x: 330, y: 387.75, width: 40, height: 40 }, tag: { type: 2 } },
    { id: 17, layout: { x: 330, y: 447.75, width: 40, height: 40 }, tag: { type: 2 } },
    { id: 18, layout: { x: 10, y: 285.75, width: 80, height: 60 }, tag: { type: 0 } },
    { id: 19, layout: { x: 390, y: 769.6071428571429, width: 40, height: 40 }, tag: { type: 0 } },
    { id: 20, layout: { x: 400, y: 387.75, width: 40, height: 40 }, tag: { type: 1 } },
    { id: 21, layout: { x: 400, y: 447.75, width: 40, height: 40 }, tag: { type: 1 } },
    { id: 22, layout: { x: 480, y: 539.75, width: 80, height: 55 }, tag: { type: 0 } },
    { id: 23, layout: { x: 370, y: 539.75, width: 80, height: 55 }, tag: { type: 0 } },
    { id: 24, layout: { x: 470, y: 387.75, width: 40, height: 40 }, tag: { type: 2 }, parent: 35 },
    { id: 25, layout: { x: 610, y: 387.75, width: 40, height: 40 }, tag: { type: 2 }, parent: 35 },
    { id: 26, layout: { x: 540, y: 387.75, width: 40, height: 40 }, tag: { type: 2 }, parent: 35 },
    { id: 27, layout: { x: 680, y: 387.75, width: 40, height: 40 }, tag: { type: 0 } },
    { id: 28, layout: { x: 785, y: 387.75, width: 40, height: 40 }, tag: { type: 1 }, parent: 36 },
    { id: 29, layout: { x: 460, y: 769.6071428571429, width: 40, height: 40 }, tag: { type: 0 } },
    { id: 30, layout: { x: 600, y: 769.6071428571429, width: 40, height: 40 }, tag: { type: 1 } },
    { id: 31, layout: { x: 810, y: 769.6071428571429, width: 40, height: 40 }, tag: { type: 1 } },
    { id: 32, layout: { x: 530, y: 769.6071428571429, width: 40, height: 40 }, tag: { type: 0 } },
    { id: 33, layout: { x: 740, y: 769.6071428571429, width: 40, height: 40 }, tag: { type: 1 } },
    { id: 34, layout: { x: 670, y: 769.6071428571429, width: 40, height: 40 }, tag: { type: 1 } },
    { id: 35, isGroup: true, tag: { type: 1 } },
    { id: 36, isGroup: true, tag: { type: 0 } }
  ],
  edgeList: [
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 0, target: 3 },
    { source: 0, target: 4 },
    { source: 1, target: 5 },
    { source: 4, target: 6 },
    { source: 4, target: 7 },
    { source: 4, target: 8 },
    { source: 4, target: 9 },
    { source: 2, target: 10 },
    { source: 2, target: 11 },
    { source: 2, target: 12 },
    { source: 11, target: 13 },
    { source: 10, target: 14 },
    { source: 2, target: 15 },
    { source: 15, target: 16 },
    { source: 16, target: 17 },
    { source: 3, target: 18 },
    { source: 12, target: 19 },
    { source: 7, target: 20 },
    { source: 20, target: 21 },
    { source: 21, target: 22 },
    { source: 21, target: 23 },
    { source: 23, target: 19 },
    { source: 6, target: 24 },
    { source: 6, target: 25 },
    { source: 6, target: 26 },
    { source: 6, target: 27 },
    { source: 5, target: 28 },
    { source: 8, target: 28 },
    { source: 22, target: 9 },
    { source: 9, target: 19 },
    { source: 9, target: 29 },
    { source: 9, target: 30 },
    { source: 9, target: 31 },
    { source: 9, target: 32 },
    { source: 9, target: 33 },
    { source: 9, target: 34 }
  ]
}

/**
 * Creates an initial sample graph.
 */
export function createSampleGraph(graph: IGraph): void {
  graph.clear()
  const builder = new GraphBuilder(graph)
  const nodesSource = builder.createNodesSource({
    data: SampleData.nodeList.filter((node) => !node.isGroup),
    id: 'id',
    parentId: 'parent',
    layout: 'layout',
    tag: 'tag',
    style: (dataItem) => {
      return new ShapeNodeStyle({
        shape: 'round-rectangle',
        cssClass: `node type-${dataItem.tag.type || '0'}`
      })
    }
  })

  const groupNodeSource = builder.createGroupNodesSource({
    data: SampleData.nodeList.filter((node) => node.isGroup),
    id: 'id',
    parentId: 'parent',
    tag: 'tag',
    layout: 'layout',
    style: (dataItem) => {
      return new GroupNodeStyle({
        tabPosition: 'top',
        cssClass: `group-node type-${dataItem.tag.type || '0'}`
      })
    }
  })

  const edgesSource = builder.createEdgesSource({
    data: SampleData.edgeList,
    sourceId: 'source',
    targetId: 'target',
    tag: null,
    style: () => {
      return new PolylineEdgeStyle({
        smoothingLength: 50,
        cssClass: 'edge',
        stroke: '1px solid currentColor',
        targetArrow: new Arrow({ stroke: null, fill: 'currentColor', type: 'triangle' })
      })
    }
  })

  const nodeLabelParameter = new ExteriorNodeLabelModel({ margins: { right: 7 } }).createParameter(
    'right'
  )
  const labelStyle = new LabelStyle({
    cssClass: 'label invisible', // fade-in labels on hover
    padding: 5,
    backgroundFill: 'rgba(255,255,255,0.7)',
    shape: 'round-rectangle'
  })
  nodesSource.nodeCreator.createLabelBinding({
    text: (dataItem: SampleDataNode) => `.node\n.type-${dataItem.tag.type || '0'}`,
    layoutParameter: () => nodeLabelParameter,
    style: () => labelStyle.clone()
  })
  groupNodeSource.nodeCreator.createLabelBinding({
    text: (dataItem: SampleDataNode) => `.group-node\n.type-${dataItem.tag.type || '0'}`,
    layoutParameter: () => nodeLabelParameter,
    style: () => labelStyle.clone()
  })
  edgesSource.edgeCreator.createLabelBinding({
    text: (_) => '.edge',
    layoutParameter: () =>
      new EdgePathLabelModel({
        sideOfEdge: 'below-edge',
        autoRotation: false
      }).createRatioParameter(),
    style: () => labelStyle.clone()
  })

  builder.buildGraph()

  const layout = new HierarchicalLayout({
    nodeDistance: 70,
    defaultEdgeDescriptor: { minimumFirstSegmentLength: 30, minimumLastSegmentLength: 30 },
    nodeLabelPlacement: 'ignore',
    edgeLabelPlacement: 'ignore'
  })
  const layoutData = new HierarchicalLayoutData({
    // consider the node types of the sample data
    nodeTypes: (node: INode) => (node.tag as SampleDataNode['tag']).type
  })

  graph.applyLayout({ layout, layoutData, portAdjustmentPolicies: PortAdjustmentPolicy.ALWAYS })
}
