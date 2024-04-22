/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Class,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  IEdge,
  IGraph,
  ILabel,
  INode,
  LayoutExecutor,
  LayoutOrientation,
  License,
  OrganicLayout,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size,
  SmartEdgeLabelModel
} from 'yfiles'

import ContextualToolbar from './ContextualToolbar'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import type { JSONGraph } from 'demo-utils/json-model'
import graphData from './graph-data.json'

let graphComponent: GraphComponent
let contextualToolbar: ContextualToolbar

async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.graph.undoEngineEnabled = true

  // initialize the contextual toolbar
  contextualToolbar = new ContextualToolbar(
    graphComponent,
    document.getElementById('contextualToolbar')!
  )

  initializeInputMode()
  initializeDefaultStyles(graphComponent.graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(
    new OrganicLayout({
      minimumNodeDistance: 50,
      automaticGroupNodeCompaction: true,
      layoutOrientation: LayoutOrientation.BOTTOM_TO_TOP
    })
  )
  graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
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
  nodesSource.nodeCreator.createLabelBinding((item) => item.label)
  nodesSource.nodeCreator.styleBindings.addBinding('shape', (item) => item.tag)
  nodesSource.nodeCreator.styleBindings.addBinding('fill', (item) => {
    if (item.id === 0 || item.id === 4) {
      return '#e01a4f'
    }
    if (item.id === 2 || item.id === 7) {
      return '#0b7189'
    }
  })

  const edgesSource = graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })
  edgesSource.edgeCreator.createLabelBinding((item) => item.label)

  graphBuilder.buildGraph()
}
/**
 * Initializes the default styles.
 */
function initializeDefaultStyles(graph: IGraph): void {
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: '#228B22',
    stroke: '#228B22'
  })
  graph.nodeDefaults.size = new Size(45, 45)
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter(ExteriorLabelModelPosition.NORTH)

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: 'thick #333',
    targetArrow: '#333 large triangle'
  })
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createParameterFromSource(
    0,
    5
  )
}

/**
 * Creates and configures an editor input mode for the GraphComponent of this demo.
 */
function initializeInputMode(): void {
  const mode = new GraphEditorInputMode()

  // update the contextual toolbar when the selection changes ...
  mode.addMultiSelectionFinishedListener((_, evt) => {
    // this implementation of the contextual toolbar only supports nodes, edges and labels
    contextualToolbar.selectedItems = evt.selection
      .filter((item) => item instanceof INode || item instanceof ILabel || item instanceof IEdge)
      .toArray()
  })
  // ... or when an item is right clicked
  mode.addItemRightClickedListener((_, evt) => {
    // this implementation of the contextual toolbar only supports nodes, edges and labels
    graphComponent.selection.clear()
    graphComponent.selection.setSelected(evt.item, true)
    contextualToolbar.selectedItems = [evt.item]
  })

  graphComponent.inputMode = mode

  // if an item is deselected or deleted, we remove that element from the selectedItems
  graphComponent.selection.addItemSelectionChangedListener((_, evt) => {
    if (!evt.itemSelected) {
      // remove the element from the selectedItems of the contextual toolbar
      const idx = contextualToolbar.selectedItems.findIndex((item) => item === evt.item)
      const newSelection = contextualToolbar.selectedItems.slice()
      newSelection.splice(idx, 1)
      contextualToolbar.selectedItems = newSelection
    }
  })
}

run().then(finishLoading)
