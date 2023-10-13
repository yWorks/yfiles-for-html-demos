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
  Class,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphCopier,
  GraphEditorInputMode,
  GraphViewerInputMode,
  HierarchicLayout,
  IBend,
  ICommand,
  IEdge,
  ILabel,
  INode,
  IPort,
  Key,
  LayoutExecutor,
  License,
  ModifierKeys,
  Size
} from 'yfiles'

import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { bindYFilesCommand, finishLoading } from 'demo-resources/demo-page'
import graphData from './graph-data.json'

/** @type {GraphComponent} */
let originalGraphComponent

/** @type {GraphComponent} */
let copyGraphComponent

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  originalGraphComponent = new GraphComponent('#graphComponent')
  copyGraphComponent = new GraphComponent('#copyGraphComponent')
  applyDemoTheme(originalGraphComponent)
  applyDemoTheme(copyGraphComponent)

  originalGraphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  copyGraphComponent.inputMode = new GraphViewerInputMode()

  // configures default styles for newly created original graph and the copy graph elements
  initializeGraph(originalGraphComponent.graph)
  initializeGraph(copyGraphComponent.graph)

  // then build the graph from the given data set
  buildGraph(originalGraphComponent.graph, graphData)

  Class.ensure(LayoutExecutor)
  originalGraphComponent.graph.applyLayout(
    new HierarchicLayout({ orthogonalRouting: true, minimumLayerDistance: 35 })
  )

  originalGraphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  originalGraphComponent.graph.undoEngineEnabled = true

  // bind the buttons to their functionality
  initializeUI()
}

/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 * @param {!IGraph} graph
 * @param {!JSONGraph} graphData
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList.filter(item => !item.isGroup),
    id: item => item.id,
    parentId: item => item.parentId
  })

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter(item => item.isGroup),
      id: item => item.id
    })
    .nodeCreator.createLabelBinding(item => item.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: item => item.source,
    targetId: item => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Determines if the <em>copy</em> command created in {@link #initializeUI} may be executed.
 * @returns {boolean}
 */
function canCopyGraph() {
  return originalGraphComponent.selection.size > 0
}

/**
 * Copy the selected part of the original graph to another graph.
 * @returns {boolean}
 */
function copyGraph() {
  const graphCopier = new GraphCopier()
  copyGraphComponent.graph.clear()
  graphCopier.copy(
    originalGraphComponent.graph,
    item => {
      const selection = originalGraphComponent.selection
      if (INode.isInstance(item)) {
        // copy selected node
        return selection.isSelected(item)
      } else if (IEdge.isInstance(item)) {
        // copy selected edge when its source and target is also selected
        // because an edge cannot exist without its incident nodes
        return (
          selection.isSelected(item) &&
          selection.isSelected(item.sourceNode) &&
          selection.isSelected(item.targetNode)
        )
      } else if (IPort.isInstance(item) || IBend.isInstance(item) || ILabel.isInstance(item)) {
        // ports, bends, and labels are copied if they belong to a selected item
        // note that edges are not copied if their ports are not copied also
        return selection.isSelected(item.owner)
      }
      return false
    },
    copyGraphComponent.graph
  )
  copyGraphComponent.fitGraphBounds()
  return true
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param {!IGraph} graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
  initDemoStyles(graph)

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)

  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Clear the graph in the given graph component.
 * @param {!GraphComponent} graphComponent
 */
function clearGraph(graphComponent) {
  graphComponent.graph.clear()
  graphComponent.fitGraphBounds()
}

/**
 * Binds actions to the buttons in the tutorial's toolbar.
 */
function initializeUI() {
  document
    .querySelector('#new-in-original')
    .addEventListener('click', () => clearGraph(originalGraphComponent))

  const copy = ICommand.createCommand()
  const kim = originalGraphComponent.inputMode.keyboardInputMode
  kim.addCommandBinding(copy, copyGraph, canCopyGraph)
  kim.addKeyBinding(Key.C, ModifierKeys.NONE, copy)
  bindYFilesCommand('#copy', copy, originalGraphComponent, null, 'Copy')

  document
    .querySelector('#new-in-copy')
    .addEventListener('click', () => clearGraph(copyGraphComponent))

  bindYFilesCommand(
    '#reset-zoom-in-copy',
    ICommand.ZOOM,
    copyGraphComponent,
    1.0,
    'Zoom to original size'
  )
  bindYFilesCommand(
    '#fit-graph-bounds-in-copy',
    ICommand.FIT_GRAPH_BOUNDS,
    copyGraphComponent,
    null,
    'Fit content'
  )
}

void run().then(finishLoading)
