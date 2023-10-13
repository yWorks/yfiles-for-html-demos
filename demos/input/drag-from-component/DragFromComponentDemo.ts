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
  DefaultLabelStyle,
  Fill,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  IGraph,
  INode,
  Insets,
  LabelShape,
  LayoutExecutor,
  License,
  ModifierKeys,
  MouseEventArgs,
  MouseEventTypes,
  Size
} from 'yfiles'

import { DraggableGraphComponent, NodeDragInputMode } from './NodeDragInputMode'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import type { JSONGraph } from 'demo-utils/json-model'
import graphData from './graph-data.json'

let graphComponent: GraphComponent = null!

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize graph component
  graphComponent = new DraggableGraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // initialize the input modes and the Drag and Drop
  configureInputModes(graphComponent)

  // configure default styles and create a sample graph
  initDefaultStyles(graphComponent.graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(
    new HierarchicLayout({ orthogonalRouting: true, minimumLayerDistance: 35 })
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
    id: item => item.id
  })

  nodesSource.nodeCreator.styleBindings.addBinding('fill', item => {
    if (item.label) {
      if (item.label.startsWith('Red')) {
        return Fill.from('#ab2346')
      }
      if (item.label.startsWith('Orange')) {
        return Fill.from('#ff6c00')
      }
      if (item.label.startsWith('Blue')) {
        return Fill.from('#111d4a')
      }
    }
  })

  nodesSource.nodeCreator.createLabelBinding(item => item.label).styleProvider = item => {
    if (item.label) {
      if (item.label.startsWith('Red')) {
        return new DefaultLabelStyle({
          backgroundFill: '#dda7b5',
          shape: LabelShape.ROUND_RECTANGLE,
          insets: new Insets(4, 2, 4, 1)
        })
      }
      if (item.label.startsWith('Orange')) {
        return new DefaultLabelStyle({
          backgroundFill: '#ffc499',
          shape: LabelShape.ROUND_RECTANGLE,
          insets: new Insets(4, 2, 4, 1)
        })
      }
      if (item.label.startsWith('Blue')) {
        return new DefaultLabelStyle({
          backgroundFill: '#a0a5b7',
          shape: LabelShape.ROUND_RECTANGLE,
          insets: new Insets(4, 2, 4, 1)
        })
      }
    }
  }

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: item => item.source,
    targetId: item => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Configures drag and drop for this tutorial.
 */
function configureInputModes(graphComponent: GraphComponent): void {
  const mode = new GraphEditorInputMode()

  // edge creation: start with drag + shift down
  // since drag without shift will start dragging a node from the component
  mode.createEdgeInputMode.prepareRecognizer = (_eventSource, evt) =>
    evt instanceof MouseEventArgs &&
    evt.eventType == MouseEventTypes.DOWN &&
    evt.modifiers == ModifierKeys.SHIFT

  // move nodes: start with drag + shift down,
  // so dragging a selected node without shift will start dragging a node from the component
  mode.moveInputMode.pressedRecognizer = (_eventSource, evt) =>
    evt instanceof MouseEventArgs &&
    evt.eventType == MouseEventTypes.DOWN &&
    evt.modifiers == ModifierKeys.SHIFT

  // configure dragging from the component
  const dragMode = new NodeDragInputMode()
  // lower priority than moveInputMode, so
  // dragging a selected node moves it
  // dragging an unselected node starts drag and drop
  dragMode.priority = mode.moveInputMode.priority + 1
  mode.add(dragMode)

  // configure the drop targets to handle the item drop

  // target #1: the list
  const list = document.querySelector<HTMLDivElement>('#drop-list')!
  dragMode.addDropTarget(list, (_evt, node) => {
    if (node) {
      addDroppedItemToList(node, list)
    }
  })

  // target #2: the trashcan
  const trashcan = document.getElementById('drop-trashcan')!
  dragMode.addDropTarget(trashcan, (_evt, node) => {
    if (node) {
      graphComponent.graph.remove(node)
    }
  })

  // install the input mode
  graphComponent.inputMode = mode
  // enable undo and redo commands
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Adds the given node to the list.
 */
function addDroppedItemToList(node: INode, list: HTMLDivElement): void {
  const dropHere = document.getElementById('drop-here')!
  dropHere.setAttribute('hidden', 'true')
  const item = document.createElement('div')
  item.setAttribute('class', 'drop-item')
  item.setAttribute('draggable', 'false')
  // add an image which represents the node
  item.appendChild(NodeDragInputMode.createNodeImage(node))
  list.appendChild(item)
}

/**
 * Initializes the defaults for the styles in this demo.
 */
function initDefaultStyles(graph: IGraph): void {
  initDemoStyles(graph, {
    theme: {
      node: 'demo-orange',
      edge: 'demo-orange'
    }
  })

  graph.nodeDefaults.size = new Size(70, 50)
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.labels.shareStyleInstance = false
}

run().then(finishLoading)
