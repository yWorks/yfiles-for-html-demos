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
import { createDemoGroupStyle, createDemoNodeStyle } from '@yfiles/demo-resources/demo-styles'
import { DragAndDropPanel, type DragAndDropPanelItem } from '@yfiles/demo-utils/DragAndDropPanel'
import {
  ArrowNodeStyle,
  FreeEdgeLabelModel,
  FreeNodeLabelModel,
  FreeNodePortLocationModel,
  FreePortLabelModel,
  GroupNodeLabelModel,
  type IEdge,
  IEdgeStyle,
  type ILabel,
  IListEnumerable,
  ImageNodeStyle,
  type INode,
  type IPort,
  LabelStyle,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  ShapePortStyle,
  SimpleEdge,
  SimpleLabel,
  SimpleNode,
  SimplePort
} from '@yfiles/yfiles'

/**
 * Initializes the drag and drop panel.
 */
export function initializeDnDPanel(): void {
  const dragAndDropPanel = new DragAndDropPanel(document.getElementById('dnd-panel')!)
  dragAndDropPanel.maxItemWidth = 160
  dragAndDropPanel.populatePanel(createDnDPanelItems())
}

/**
 * Creates the items that provide the visualizations for the drag and drop panels.
 */
function createDnDPanelItems(): DragAndDropPanelItem<INode | IEdge | ILabel | IPort>[] {
  const itemContainer: DragAndDropPanelItem<INode | IEdge | ILabel | IPort>[] = []

  // Create some nodes
  const groupNodeStyle = createDemoGroupStyle({})

  // A label model with insets for the expand/collapse button
  const groupLabelStyle = new LabelStyle({ textFill: 'white' })

  const groupNode = new SimpleNode({ layout: new Rect(0, 0, 80, 80), style: groupNodeStyle })

  const groupLabel = new SimpleLabel({
    owner: groupNode,
    text: 'Group Node',
    layoutParameter: new GroupNodeLabelModel().createTabBackgroundParameter(),
    style: groupLabelStyle
  })
  groupNode.labels = IListEnumerable.from([groupLabel])
  itemContainer.push({ modelItem: groupNode, tooltip: 'Group Node' })

  const demoStyleNode = new SimpleNode({
    layout: new Rect(0, 0, 60, 40),
    style: createDemoNodeStyle()
  })
  itemContainer.push({ modelItem: demoStyleNode, tooltip: 'Demo Node' })

  const shapeStyleNode = new SimpleNode({
    layout: new Rect(0, 0, 60, 40),
    style: new ShapeNodeStyle({
      shape: ShapeNodeShape.ROUND_RECTANGLE,
      stroke: 'rgb(255, 140, 0)',
      fill: 'rgb(255, 140, 0)'
    })
  })
  itemContainer.push({ modelItem: shapeStyleNode, tooltip: 'Shape Node' })

  const arrowNode = new SimpleNode({
    layout: new Rect(0, 0, 60, 40),
    style: new ArrowNodeStyle({ fill: 'rgb(255, 140, 0)' })
  })
  itemContainer.push({ modelItem: arrowNode, tooltip: 'Arrow Node' })

  const imageStyleNode = new SimpleNode({
    layout: new Rect(0, 0, 60, 60),
    style: new ImageNodeStyle('resources/y.svg')
  })

  itemContainer.push({ modelItem: imageStyleNode, tooltip: 'Image Node' })

  const port = new SimplePort({
    owner: demoStyleNode,
    locationParameter: FreeNodePortLocationModel.CENTER,
    style: new ShapePortStyle({ fill: 'darkblue', stroke: 'cornflowerblue', shape: 'ellipse' })
  })
  itemContainer.push({ modelItem: port, tooltip: 'Port' })

  const nodeLabelStyle = new LabelStyle({
    backgroundFill: '#ffc499',
    textFill: '#662b00',
    padding: 5,
    shape: 'round-rectangle'
  })

  const nodeLabel = new SimpleLabel({
    owner: demoStyleNode,
    text: 'Node Label',
    layoutParameter: FreeNodeLabelModel.CENTER,
    style: nodeLabelStyle
  })
  nodeLabel.preferredSize = nodeLabelStyle.renderer.getPreferredSize(nodeLabel, nodeLabelStyle)
  itemContainer.push({ modelItem: nodeLabel, tooltip: 'Node Label' })

  const edge0 = new SimpleEdge({
    style: IEdgeStyle.VOID_EDGE_STYLE,
    sourcePort: port,
    targetPort: port
  })

  const edgeLabelStyle = new LabelStyle({
    backgroundFill: '#c2aa99',
    textFill: '#662b00',
    padding: 5,
    shape: 'round-rectangle'
  })

  const edgeLabel = new SimpleLabel({
    owner: edge0,
    text: 'Edge Label',
    style: edgeLabelStyle,
    layoutParameter: FreeEdgeLabelModel.INSTANCE.createParameter()
  })

  edgeLabel.preferredSize = edgeLabelStyle.renderer.getPreferredSize(edgeLabel, edgeLabelStyle)
  itemContainer.push({ modelItem: edgeLabel, tooltip: 'Edge Label' })

  const portLabelStyle = new LabelStyle({
    backgroundFill: '#e0d5cc',
    textFill: '#662b00',
    padding: 5,
    shape: 'round-rectangle'
  })

  const portLabel = new SimpleLabel({
    owner: port,
    text: 'Port Label',
    layoutParameter: FreePortLabelModel.CENTER,
    style: portLabelStyle
  })
  portLabel.preferredSize = portLabelStyle.renderer.getPreferredSize(portLabel, portLabelStyle)
  itemContainer.push({ modelItem: portLabel, tooltip: 'Port Label' })

  const edge1 = new SimpleEdge({
    style: new PolylineEdgeStyle({ smoothingLength: 100, targetArrow: 'triangle' })
  })
  const edge2 = new SimpleEdge({
    style: new PolylineEdgeStyle({ sourceArrow: 'triangle', targetArrow: 'triangle' })
  })
  const edge3 = new SimpleEdge({ style: new PolylineEdgeStyle({ stroke: '2px dashed gray' }) })

  itemContainer.push({ modelItem: edge1, tooltip: 'Default' })
  itemContainer.push({ modelItem: edge2, tooltip: 'Bidirectional' })
  itemContainer.push({ modelItem: edge3, tooltip: 'Dashed' })

  return itemContainer
}
