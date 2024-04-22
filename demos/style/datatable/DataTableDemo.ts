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
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLSupport,
  IGraph,
  INode,
  License,
  Point,
  Rect,
  StorageLocation
} from 'yfiles'

import createNewRandomUserData, { type UserData } from './UserDataFactory'
import DataTableLabelStyle from './DataTableLabelStyle'
import DataTableNodeStyle from './DataTableNodeStyle'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { DataTableRenderSupport } from './DataTableRenderSupport'

async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // since the labels always show the data of their owners, they can only be copied together with their owner
  graphComponent.clipboard.independentCopyItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

  // initialize default demo styles
  initializeStyles(graphComponent.graph)

  // initialize the input mode
  initializeInputMode(graphComponent)

  // enable the graphml support for loading and saving
  enableGraphML(graphComponent)

  // create a sample graph
  createSampleGraph(graphComponent.graph, 4)

  graphComponent.fitGraphBounds()

  // enable the undo engine
  graphComponent.graph.undoEngineEnabled = true

  // wire up the UI
  initializeUI(graphComponent)
}

/**
 * Initializes the default styles for nodes and labels.
 */
function initializeStyles(graph: IGraph): void {
  // initialize node style
  graph.nodeDefaults.style = new DataTableNodeStyle()

  // initialize default label
  graph.nodeDefaults.labels.style = new DataTableLabelStyle()
}

/**
 * Initializes the input mode.
 */
function initializeInputMode(graphComponent: GraphComponent): void {
  const mode = new GraphEditorInputMode({
    // labels are added with the toolbar button and are not editable
    allowEditLabel: false,
    allowAddLabel: false
  })
  // add random user data to new nodes
  mode.addNodeCreatedListener((_, evt) => {
    evt.item.tag = createNewRandomUserData()
    // check if the label should be displayed
    onToggleNodeLabel(graphComponent.graph, evt.item, shouldAddLabels())
    updateNodeSize(evt.item, graphComponent.graph)
    graphComponent.updateContentRect()
  })
  graphComponent.inputMode = mode
}

/**
 * Enables loading and saving the graph from/to GraphML.
 */
function enableGraphML(graphComponent: GraphComponent): void {
  // create a new GraphMLSupport instance that handles save and load operations
  const gs = new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  // enable serialization of the custom styles - without a namespace mapping, serialization will fail
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/DataTableNodeStyle/1.0',
    'DataTableNodeStyle',
    DataTableNodeStyle.$class
  )
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/DataTableLabelStyle/1.0',
    'DataTableLabelStyle',
    DataTableLabelStyle.$class
  )

  gs.graphMLIOHandler.addParsedListener((_, evt) => {
    onToggleLabels(evt.context.graph)
  })
}

/**
 * Executed when Toggle Labels button is pressed.
 */
function onToggleLabels(graph: IGraph): void {
  const addLabels = shouldAddLabels()
  for (const node of graph.nodes) {
    onToggleNodeLabel(graph, node, addLabels)
  }
}

/**
 * Executed for each node when Toggle Labels button is pressed.
 */
function onToggleNodeLabel(graph: IGraph, node: INode, addLabels: boolean): void {
  if (addLabels) {
    const exteriorLabelModel = new ExteriorLabelModel({ insets: 10 })
    const parameter =
      node.layout.x < 200
        ? exteriorLabelModel.createParameter(ExteriorLabelModelPosition.WEST)
        : exteriorLabelModel.createParameter(ExteriorLabelModelPosition.EAST)
    graph.addLabel(node, '', parameter)
  } else {
    // if there are labels, remove them
    for (const label of [...node.labels]) {
      graph.remove(label)
    }
  }
}

/**
 * Determines whether to add or to remove labels.
 */
function shouldAddLabels(): boolean {
  return document.querySelector<HTMLInputElement>('#toggle-labels-btn')!.checked
}

function updateNodeSize(node: INode, graph: IGraph) {
  const userData = node.tag as UserData
  const size = DataTableRenderSupport.calculateTableSize(userData, 'data-table-node')
  const origLayout = node.layout
  graph.setNodeLayout(node, new Rect(origLayout.x, origLayout.y, size.width, size.height))
}

/**
 * Creates an initial graph.
 */
function createSampleGraph(graph: IGraph, nodeCount: number): void {
  // Create nodes with random user data
  const nodes = []
  for (let i = 0; i < nodeCount; i++) {
    const x = i % 2 === 0 ? 0 : 400
    nodes[i] = graph.createNodeAt({
      location: new Point(x, i * 200),
      tag: createNewRandomUserData()
    })
  }

  // resize nodes
  graph.nodes.forEach((node) => updateNodeSize(node, graph))

  // Create some edges
  if (nodes.length > 1) {
    graph.createEdge(nodes[0], nodes[1])
  }
  for (let i = 2; i < nodes.length; i++) {
    graph.createEdge(nodes[i - 1], nodes[i])
    graph.createEdge(nodes[i - 2], nodes[i])
  }
}

/**
 * Binds actions to the demo's UI controls.
 */
function initializeUI(graphComponent: GraphComponent): void {
  document.querySelector('#toggle-labels-btn')!.addEventListener('click', () => {
    onToggleLabels(graphComponent.graph)
    graphComponent.updateContentRect()
    void graphComponent.ensureVisible(graphComponent.contentRect)
  })
}

run().then(finishLoading)
