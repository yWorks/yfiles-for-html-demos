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
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  GridSnapTypes,
  GroupNodeStyle,
  HierarchicalLayout,
  IEdge,
  type IGraph,
  type ILabel,
  ImageNodeStyle,
  INode,
  InteriorNodeLabelModel,
  IPort,
  LabelDropInputMode,
  LabelStyle,
  LayoutExecutor,
  License,
  NodeDropInputMode,
  PortDropInputMode,
  Rect,
  ShapePortStyle,
  Size,
  SmartEdgeLabelModel,
  SnappableItems
} from '@yfiles/yfiles'
import { EdgeDropInputMode } from '@yfiles/demo-utils/EdgeDropInputMode'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import type { JSONGraph, JSONNode } from '@yfiles/demo-utils/json-model'
import graphData from './resources/graph-data.json'
import { initializeDnDPanel } from './drag-and-drop'

/**
 *  This demo shows how to enable drag and drop functionality for nodes,
 *  edges, labels, and ports.
 *
 *  It uses the yFiles library classes {@link NodeDropInputMode}, {@link LabelDropInputMode},
 *  {@link PortDropInputMode}, and the custom class {@link EdgeDropInputMode}.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  initializeInteraction(graphComponent)
  initializeDnDPanel()

  // init graph default styles and visual decorators
  const graph = graphComponent.graph
  initializeGraph(graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(
    new HierarchicalLayout({
      defaultEdgeDescriptor: { minimumFirstSegmentLength: 25, minimumLastSegmentLength: 25 },
      minimumLayerDistance: 50
    })
  )
  void graphComponent.fitGraphBounds()
  graphComponent.zoom = 1.5

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true

  initializeUI(graphComponent)
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  const nodesSource = graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id
  })
  nodesSource.nodeCreator.styleProvider = (item: JSONNode): ImageNodeStyle | undefined =>
    item.tag === 'icon' ? new ImageNodeStyle('resources/y.svg') : undefined
  nodesSource.nodeCreator.layoutProvider = (item: JSONNode): Rect | undefined =>
    item.tag === 'icon' ? new Rect(0, 0, 50, 50) : undefined
  nodesSource.nodeCreator.createLabelBinding({
    text: (data) => data.label,
    layoutParameter: () => InteriorNodeLabelModel.CENTER
  })

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Initializes the graph.
 * Sets up styles and visual decorations of graph elements.
 */
function initializeGraph(graph: IGraph): void {
  initDemoStyles(graph)

  graph.nodeDefaults.size = new Size(80, 40)
  // draw a port with an elliptical shape
  graph.nodeDefaults.ports.style = new ShapePortStyle({
    fill: 'darkblue',
    stroke: 'cornflowerblue',
    shape: 'ellipse'
  })
  graph.nodeDefaults.labels.style = new LabelStyle({
    backgroundFill: '#ffc499',
    textFill: '#662b00',
    padding: 5,
    shape: 'round-rectangle'
  })
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.CENTER
  graph.edgeDefaults.ports.style = new ShapePortStyle({
    fill: 'darkblue',
    stroke: 'cornflowerblue',
    shape: 'ellipse'
  })
  graph.edgeDefaults.labels.style = new LabelStyle({
    backgroundFill: '#c2aa99',
    textFill: '#662b00',
    padding: 5,
    shape: 'round-rectangle'
  })
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createParameterFromSource(0)
}

/**
 * Creates and activates a {@link GraphEditorInputMode} and configures it to enable drag and drop.
 */
function initializeInteraction(graphComponent: GraphComponent): void {
  // configure the snapping context
  const mode = new GraphEditorInputMode({
    snapContext: new GraphSnapContext({
      snappableItems: SnappableItems.NODE | SnappableItems.EDGE,
      nodeDistance: 30,
      nodeToEdgeDistance: 20,
      snapDistance: 10,
      gridSnapType: GridSnapTypes.ALL
    })
  })

  // create a new NodeDropInputMode to configure the drag and drop operation
  mode.nodeDropInputMode = new NodeDropInputMode({
    // enables the display of the dragged element during the drag
    showPreview: true,
    // initially disables snapping for the dragged element to existing elements
    snappingEnabled: false,
    // by default, the mode available in GraphEditorInputMode is disabled, so first enable it
    enabled: true,
    // nodes that have a GroupNodeStyle assigned have to be created as group nodes
    isGroupNodePredicate: (draggedNode) => draggedNode.style instanceof GroupNodeStyle
  })

  // create a new LabelDropInputMode to configure the drag and drop operation
  mode.labelDropInputMode = new LabelDropInputMode({
    showPreview: true,
    snappingEnabled: false,
    enabled: true,
    useLocationForParameter: true,
    // allow for nodes and edges to be the new label owner
    isValidLabelOwnerPredicate: (labelOwner, label: ILabel | null) => {
      // check whether the labelOwner matches the dragged label's owner,
      // so that a dragged edge-label is only dropped on an edge
      return (
        (labelOwner instanceof INode && label?.owner instanceof INode) ||
        (labelOwner instanceof IEdge && label?.owner instanceof IEdge) ||
        (labelOwner instanceof IPort && label?.owner instanceof IPort)
      )
    }
  })

  // create a new PortDropInputMode to configure the drag and drop operation
  mode.portDropInputMode = new PortDropInputMode({
    showPreview: true,
    snappingEnabled: false,
    enabled: true,
    useLocationForParameter: true,
    // allow only for nodes to be the new port owner
    isValidPortOwnerPredicate: (portOwner) => portOwner instanceof INode
  })

  // add the edge drop input mode
  mode.add(new EdgeDropInputMode())

  graphComponent.inputMode = mode
}

/**
 * Registers event listeners for the snapping checkbox.
 */
function initializeUI(graphComponent: GraphComponent): void {
  document.getElementById('preview-snapping-checkbox')!.addEventListener('change', (e) => {
    const inputMode = graphComponent.inputMode as GraphEditorInputMode
    const nodeDropInputMode = inputMode.nodeDropInputMode
    nodeDropInputMode.snappingEnabled = (e.currentTarget as HTMLInputElement).checked
  })
}

void run().then(finishLoading)
