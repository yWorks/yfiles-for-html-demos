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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Arrow,
  Cursor,
  EdgeSegmentLabelModel,
  EdgeSides,
  ExteriorNodeLabelModel,
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicalLayout,
  IBend,
  IconLabelStyle,
  IEdge,
  IGraph,
  ILabel,
  INode,
  InteriorNodeLabelModel,
  LabelStyle,
  LayoutExecutor,
  License,
  Point,
  PolylineEdgeStyle,
  resources,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size
} from '@yfiles/yfiles'

import { ButtonInputMode, ButtonTrigger, QueryButtonsEvent } from './ButtonInputMode'
import { OffsetLabelModelWrapper } from './OffsetLabelModelWrapper'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import cutIcon from '@yfiles/demo-resources/icons/cut2-16.svg'

import type { JSONGraph } from '@yfiles/demo-utils/json-model'
import graphData from './graph-data.json'

let graphComponent: GraphComponent
let buttonInputMode: ButtonInputMode

/**
 * Creates a {@link ButtonInputMode} and registers a listener to add buttons for nodes, edges, bend and labels.
 */
function createButtonInputMode(): ButtonInputMode {
  buttonInputMode = new ButtonInputMode()

  // the QueryButtonsEvent is dispatched for an owning IModelItem when buttons shall be displayed for it
  buttonInputMode.setQueryButtonsListener((queryEvent) => {
    if (queryEvent.owner instanceof INode) {
      // for nodes we add four arrow buttons around it that create a node and an edge between 'owner' and the new node
      addNodeArrowButton(
        queryEvent,
        [1, 0.5],
        Math.PI / 2,
        new Point(80, 0),
        Cursor.E_RESIZE,
        'to the right'
      )
      addNodeArrowButton(queryEvent, [0.5, 1], Math.PI, new Point(0, 80), Cursor.S_RESIZE, 'below')
      addNodeArrowButton(
        queryEvent,
        [0, 0.5],
        -Math.PI / 2,
        new Point(-80, 0),
        Cursor.W_RESIZE,
        'to the left'
      )
      addNodeArrowButton(queryEvent, [0.5, 0], 0, new Point(0, -80), Cursor.N_RESIZE, 'above')
    } else if (queryEvent.owner instanceof IEdge) {
      // for edges we add a row of colored buttons that change the color of the edge
      addEdgeColorButton(queryEvent, '#363020', new Point(-62.5, 0))
      addEdgeColorButton(queryEvent, '#605C4E', new Point(-37.5, 0))
      addEdgeColorButton(queryEvent, '#A49966', new Point(-12.5, 0))
      addEdgeColorButton(queryEvent, '#C7C7A6', new Point(12.5, 0))
      addEdgeColorButton(queryEvent, '#A4778B', new Point(37.5, 0))
      addEdgeColorButton(queryEvent, '#AA4586', new Point(62.5, 0))
    } else if (queryEvent.owner instanceof ILabel) {
      // for labels, we add a button that triggers label text editing
      queryEvent.addButton({
        text: 'Edit',
        layoutParameter: ExteriorNodeLabelModel.TOP_RIGHT,
        onAction: () =>
          (graphComponent.inputMode as GraphEditorInputMode).startLabelEditing(
            queryEvent.owner as ILabel
          ),
        tooltip: 'Edit label text'
      })
    } else if (queryEvent.owner instanceof IBend) {
      // for bends, we add a button that splits the edge at the bend location
      queryEvent.addButton({
        icon: cutIcon,
        layoutParameter: FreeNodeLabelModel.INSTANCE.createParameter({
          angle: -Math.PI * 0.75,
          labelRatio: [0.5, 0],
          labelOffset: [0, 0],
          layoutRatio: [0, 0],
          layoutOffset: [0, 0]
        }),
        onAction: () => splitEdgeAt(queryEvent.owner as IBend),
        tooltip: 'Split edge here'
      })
    }
  })

  return buttonInputMode
}

/**
 * Adds an arrow button to an owner node that creates a new node and an edge to it.
 * @param queryEvent The {@link QueryButtonsEvent} to add the button to.
 * @param layoutRatio The ratios of the node layout where the button is placed.
 * @param angle The angle to rotate the arrow button by.
 * @param nodeCreationOffset The offset from the owner's layout location where the new node will be created.
 * @param cursor The cursor to show when hovering over the arrow button.
 * @param tooltip The tooltip to show when hovering over the arrow button.
 */
function addNodeArrowButton(
  queryEvent: QueryButtonsEvent,
  layoutRatio: [number, number],
  angle: number = -Math.PI / 2,
  nodeCreationOffset: Point,
  cursor: Cursor,
  tooltip: string
) {
  const tag: any = {}

  queryEvent.addButton({
    style: new IconLabelStyle({
      backgroundShape: ShapeNodeShape.TRIANGLE,
      iconSize: new Size(30, 15),
      autoFlip: false,
      backgroundFill: 'white',
      iconPlacement: InteriorNodeLabelModel.CENTER,
      cssClass: 'input-button'
    }),
    size: new Size(30, 15),
    layoutParameter: FreeNodeLabelModel.INSTANCE.createParameter({
      angle,
      labelRatio: [0.5, 1],
      labelOffset: [0, 15],
      layoutRatio: layoutRatio,
      layoutOffset: [0, 0]
    }),
    onAction: () => createNodeAndEdge(queryEvent.owner as INode, nodeCreationOffset),
    cursor: cursor,
    tag: tag,
    tooltip: 'Create node ' + tooltip
  })
}

/**
 * Creates a new node and an edge between owner and the new node.
 * @param owner The node to start the new edge from.
 * @param offset The offset of the new node to the layout of owner.
 */
function createNodeAndEdge(owner: INode, offset: Point): IEdge {
  return graphComponent.graph.createEdge(
    owner,
    graphComponent.graph.createNodeAt({ location: owner.layout.center.add(offset) })
  )
}

/**
 * Adds a colored button to an owning edge that changes the stroke of the edge.
 * @param queryEvent The {@link QueryButtonsEvent} to add the button to.
 * @param fill The fill color of the button and the edge.
 * @param offset The offset this button uses for its placement.
 */
function addEdgeColorButton(queryEvent: QueryButtonsEvent, fill: string, offset: Point) {
  // position the color buttons above the center of the first segment of the edge
  const baseParameter = new EdgeSegmentLabelModel(10).createParameterFromSource(
    1,
    0.5,
    EdgeSides.ABOVE_EDGE
  )

  queryEvent.addButton({
    style: new LabelStyle({ autoFlip: false, backgroundFill: fill, shape: 'rectangle' }),
    onAction: () => {
      const edgeStyle = (queryEvent.owner as IEdge).style as PolylineEdgeStyle
      edgeStyle.stroke = '1.5px ' + fill
      edgeStyle.targetArrow = new Arrow({ fill: fill, type: 'triangle' })
      graphComponent.graphModelManager.update(queryEvent.owner)
      graphComponent.invalidate()
    },
    layoutParameter: OffsetLabelModelWrapper.INSTANCE.createOffsetParameter(baseParameter, offset),
    tooltip: 'Change edge color'
  })
}

/**
 * Splits an edge at a specified bend.
 * @param bend The bend whose owning edges will be split.
 */
function splitEdgeAt(bend: IBend) {
  const graph = graphComponent.graph
  const edge = bend.owner
  const newNode = graph.createNodeAt(bend.location)
  const edge1 = graph.createEdge(edge.sourcePort, graph.addPort(newNode))
  const edge2 = graph.createEdge(graph.addPort(newNode), edge!.targetPort)
  const splitIndex = edge?.bends.indexOf(bend) || 0
  edge?.bends.forEach((b, index) => {
    if (index < splitIndex) {
      graph.addBend(edge1, b.location)
    } else if (index > splitIndex) {
      graph.addBend(edge2, b.location)
    }
  })
  graph.remove(edge!)
}

/**
 * Initializes the defaults for the styles in this demo.
 */
function initGraphDefaults(): void {
  const graph = graphComponent.graph

  // configure defaults normal nodes and their labels
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#177E89',
    stroke: '1.5px #304F52'
  })
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.style = new LabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'wrap-word-ellipsis',
    textFill: '#11353A',
    backgroundFill: '#A1CACF',
    padding: 2
  })
  graph.nodeDefaults.labels.layoutParameter = ExteriorNodeLabelModel.BOTTOM
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '1.5px #363020',
    targetArrow: new Arrow({ fill: '#363020', type: 'triangle' })
  })
  graph.edgeDefaults.shareStyleInstance = false
}

/**
 * Binds the buttons in the toolbar to their functionality.
 */
function initializeUI(): void {
  document
    .querySelector('#button-trigger-combo-box')!
    .addEventListener('change', () => onButtonTriggerChanged())
}

/**
 * Changes the trigger used by the ButtonInputMode to decide when to show the buttons for an IModelItem.
 */
function onButtonTriggerChanged() {
  const featureComboBox = document.querySelector<HTMLSelectElement>('#button-trigger-combo-box')!
  switch (featureComboBox.selectedIndex) {
    case 1: // CurrentItem
      buttonInputMode.buttonTrigger = ButtonTrigger.CURRENT_ITEM
      break
    case 2: // RightClick
      buttonInputMode.buttonTrigger = ButtonTrigger.RIGHT_CLICK
      break
    case 0: // Hover
      buttonInputMode.buttonTrigger = ButtonTrigger.HOVER
      break
    default:
  }
}

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')

  // initializes the input mode
  initializeInteraction()

  // configures default styles for newly created graph elements
  initGraphDefaults()

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(
    new HierarchicalLayout({
      minimumLayerDistance: 100,
      nodeToEdgeDistance: 100,
      nodeDistance: 100
    })
  )
  await graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true

  // bind the toolbar buttons to their actions
  initializeUI()
}

/**
 * Initializes the input mode, i.e., configures the key gestures and adds the custom ButtonInputMode.
 */
function initializeInteraction(): void {
  // remove the ENTER key from label editing
  resources.invariant.EditLabelKey = 'F2'

  // initialize graph component
  const graphEditorInputMode = new GraphEditorInputMode({
    focusableItems: GraphItemTypes.ALL,
    // disable edit on typing to not edit label with SPACE key
    allowEditLabelOnTyping: false
  })

  // add an input mode that adds buttons to nodes, edges, bends and labels
  graphEditorInputMode.add(createButtonInputMode())

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder
    .createNodesSource({ data: graphData.nodeList, id: (item) => item.id })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

run().then(finishLoading)
