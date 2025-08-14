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
  CanvasComponent,
  Graph,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GroupingNodePositionHandler,
  INode,
  INodeSizeConstraintProvider,
  IPositionHandler,
  IReshapeHandler,
  License,
  NodeSizeConstraintProvider,
  OrthogonalEdgeEditingContext,
  Point,
  Rect,
  Size
} from '@yfiles/yfiles'

import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import SampleData from './resources/SampleData'
import { NonOverlapPositionHandler } from './NonOverlapPositionHandler'
import { NonOverlapReshapeHandler } from './NonOverlapReshapeHandler'
import { LayoutHelper } from './LayoutHelper'
import { enableSingleSelection } from './SingleSelectionHelper'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'

let graphComponent

async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  initializeInputModes()
  initializeGraph()

  // bind the buttons to their actions
  initializeUI()
}

/**
 * Registers the {@link GraphEditorInputMode} as the {@link CanvasComponent.inputMode}
 * and initializes the marquee input mode that clears the area of the marquee rectangle.
 */
function initializeInputModes() {
  const graph = graphComponent.graph

  // create a GraphEditorInputMode instance
  const editMode = new GraphEditorInputMode()
  graphComponent.inputMode = editMode

  // enable single selection
  enableSingleSelection(graphComponent)

  // enable orthogonal edge editing
  const orthogonalEdgeEditingContext = new OrthogonalEdgeEditingContext()
  editMode.orthogonalEdgeEditingContext = orthogonalEdgeEditingContext

  // disable orthogonal edge editing during node move or resize gestures
  const disableOrthogonalEdgeEditing = async () => {
    if (editMode.moveUnselectedItemsInputMode.affectedItems.size > 0) {
      orthogonalEdgeEditingContext.enabled = false
    }
  }
  const enableOrthogonalEdgeEditing = async () => {
    orthogonalEdgeEditingContext.enabled = true
  }
  editMode.handleInputMode.addEventListener('drag-starting', disableOrthogonalEdgeEditing)
  editMode.handleInputMode.addEventListener('drag-finished', enableOrthogonalEdgeEditing)
  editMode.handleInputMode.addEventListener('drag-canceled', enableOrthogonalEdgeEditing)
  editMode.moveUnselectedItemsInputMode.addEventListener(
    'drag-starting',
    disableOrthogonalEdgeEditing
  )
  editMode.moveUnselectedItemsInputMode.addEventListener(
    'drag-finished',
    enableOrthogonalEdgeEditing
  )
  editMode.moveUnselectedItemsInputMode.addEventListener(
    'drag-canceled',
    enableOrthogonalEdgeEditing
  )

  // use a position handler that avoids overlapping,
  // but only apply it to the moved node and not to the children of groups
  graph.decorator.nodes.positionHandler.addFactory(
    (node) => {
      return (
        (!editMode.moveUnselectedItemsInputMode.isDragging &&
          !editMode.moveSelectedItemsInputMode.isDragging) ||
        (editMode.moveSelectedItemsInputMode.isDragging &&
          graphComponent.selection.nodes.first() === node)
      )
    },
    (node) => {
      // Lookup the node position handler that only handles the location of the node itself
      const defaultPositionHandler = Graph.DEFAULT_NODE_LOOKUP.contextLookup(node, IPositionHandler)
      // wrap it in a GroupingNodePositionHandler that moves all child nodes but doesn't update the
      // parent group node bounds
      const handler = new GroupingNodePositionHandler(node, defaultPositionHandler)
      handler.adjustParentNodeLayout = false
      // wrap it in a NonOverlapPositionHandler that removes overlaps during and after the move gesture
      return new NonOverlapPositionHandler(node, handler)
    }
  )

  // use a reshape handler that avoids overlapping
  graph.decorator.nodes.reshapeHandler.addFactory((node) => {
    // Lookup the node reshape handler that only reshapes the node itself (and not its parent group node)
    const defaultReshapeHandler = Graph.DEFAULT_NODE_LOOKUP.contextLookup(node, IReshapeHandler)
    // wrap it in a NonOverlapReshapeHandler that removes overlaps during and after the resize gesture
    return new NonOverlapReshapeHandler(node, defaultReshapeHandler)
  })

  // set a size constraint provider for a minimum node size for all nodes not already providing their own one
  const minimumSize = new Size(5, 5)
  const sizeConstraintProviderDecorator = graph.decorator.nodes.sizeConstraintProvider
  sizeConstraintProviderDecorator.addWrapperFactory((_, provider) => {
    return provider || new NodeSizeConstraintProvider(minimumSize, Size.INFINITE)
  })

  // avoid overlapping when creating, pasting or duplicating nodes
  editMode.addEventListener('node-created', async (evt) => {
    await makeSpace(evt.item)
  })
  graphComponent.clipboard.fromClipboardCopier.addEventListener('node-copied', async (evt) => {
    // clear the current selection before the layout starts because GraphEditorInputMode cannot
    // do this while the layout is running (the selection is usually cleared after this event)
    graphComponent.selection.clear()
    await makeSpace(evt.copy)
  })
  graphComponent.clipboard.duplicateCopier.addEventListener('node-copied', async (evt) => {
    // clear the current selection before the layout starts because GraphEditorInputMode cannot
    // do this while the layout is running (the selection is usually cleared after this event)
    graphComponent.selection.clear()
    await makeSpace(evt.copy)
  })
}

/**
 * Makes space for a new node.
 */
async function makeSpace(node) {
  await new LayoutHelper(graphComponent, node).layoutImmediately()
}

/**
 * Initializes styles and loads a sample graph.
 */
function initializeGraph() {
  initDemoStyles(graphComponent.graph, { orthogonalEditing: true })
  loadGraph('hierarchical')
}

/**
 * Loads the sample graph associated with the given name
 */
function loadGraph(sampleName) {
  // @ts-ignore We don't have proper types for the sample data
  const data = SampleData[sampleName]

  const graph = graphComponent.graph
  graph.clear()

  const defaultNodeSize = graph.nodeDefaults.size
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: data.nodes,
    id: 'id',
    parentId: 'parentId',
    layout: (data) => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height)
  })
  if (data.groups) {
    builder.createGroupNodesSource({
      data: data.groups,
      id: 'id',
      parentId: 'parentId',
      layout: (data) => data // the data object itself has x, y, width, height properties
    })
  }
  builder.createEdgesSource(data.edges, 'source', 'target', 'id')

  builder.buildGraph()

  graph.edges.forEach((edge) => {
    if (edge.tag.sourcePort) {
      graph.setPortLocation(edge.sourcePort, Point.from(edge.tag.sourcePort))
    }
    if (edge.tag.targetPort) {
      graph.setPortLocation(edge.targetPort, Point.from(edge.tag.targetPort))
    }
    edge.tag.bends.forEach((bend) => {
      graph.addBend(edge, bend)
    })
  })

  void graphComponent.fitGraphBounds()
}

/**
 * Registers commands and actions for the items in the toolbar.
 */
function initializeUI() {
  const sampleGraphs = document.querySelector('#sample-graphs')
  addNavigationButtons(sampleGraphs).addEventListener('change', () => {
    const selectedIndex = sampleGraphs.selectedIndex
    const selectedOption = sampleGraphs.options[selectedIndex]
    loadGraph(selectedOption.value)
  })
}

run().then(finishLoading)
