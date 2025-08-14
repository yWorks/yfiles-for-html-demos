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
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  IGraph,
  INode,
  InteriorNodeLabelModel,
  LayoutExecutor,
  License,
  OrthogonalLayout,
  Size
} from '@yfiles/yfiles'

import { setClipboardStyles } from './ClipboardStyles'
import { DeferredCutClipboard } from './DeferredCutClipboard'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'

let graphComponent

async function run() {
  License.value = await fetchLicense()

  // add the graph component
  graphComponent = new GraphComponent('#graphComponent')
  // set the styles and create a sample graph
  initializeGraph(graphComponent.graph)
  setClipboardStyles(graphComponent.graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(new OrthogonalLayout({ gridSpacing: 30 }))
  void graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true

  /**
   * Creates nodes and edges according to the given data.
   */
  function buildGraph(graph, graphData) {
    const graphBuilder = new GraphBuilder(graph)

    graphBuilder
      .createNodesSource({ data: graphData.nodeList, id: (item) => item.id })
      .nodeCreator.createLabelBinding((item) => item.label)

    graphBuilder
      .createEdgesSource({
        data: graphData.edgeList,
        sourceId: (item) => item.source,
        targetId: (item) => item.target
      })
      .edgeCreator.createLabelBinding((item) => item.label)

    graphBuilder.buildGraph()
  }

  /**
   * Initializes the defaults for the styling in this demo.
   *
   * @param graph The graph.
   */
  function initializeGraph(graph) {
    // set styles for this demo
    initDemoStyles(graph)

    // set sizes and locations specific for this demo
    graph.nodeDefaults.size = new Size(50, 50)

    graph.nodeDefaults.labels.layoutParameter = InteriorNodeLabelModel.CENTER
  }

  // configure the clipboard itself
  const clipboard = new DeferredCutClipboard()
  // trigger a repaint after copy since copy removed the "marked for cut" mark from the elements
  clipboard.addEventListener('items-copied', () => graphComponent.invalidate())
  graphComponent.clipboard = clipboard

  // set up the input mode
  const mode = new GraphEditorInputMode()
  mode.marqueeSelectableItems = GraphItemTypes.NODE | GraphItemTypes.BEND
  graphComponent.inputMode = mode
  graphComponent.graph.undoEngineEnabled = true

  // for demonstration purposes we configure a context menu
  // to make it possible to paste to an arbitrary location
  configureContextMenu(graphComponent)
}

/**
 * Configures a context menu.
 * This is to provide the ability to paste graph elements to an arbitrary location.
 * Developers who want to know more about using context menus should look at the
 * contextmenu demo in the input folder.
 */
function configureContextMenu(graphComponent) {
  const inputMode = graphComponent.inputMode

  inputMode.addEventListener('populate-item-context-menu', (evt) => {
    if (evt.handled) {
      return
    }

    const inputMode = graphComponent.inputMode
    if (evt.item instanceof INode) {
      if (!graphComponent.selection.nodes.includes(evt.item)) {
        graphComponent.selection.clear()
        graphComponent.selection.nodes.add(evt.item)
      }
    } else {
      graphComponent.selection.clear()
    }
    if (graphComponent.selection.nodes.size > 0) {
      evt.contextMenu = [
        { label: 'Cut', action: () => inputMode.cut() },
        { label: 'Copy', action: () => inputMode.copy() },
        { label: 'Delete', action: () => inputMode.deleteSelection() }
      ]
    } else {
      evt.contextMenu = [
        { label: 'Paste', action: () => inputMode.pasteAtLocation(evt.queryLocation) }
      ]
    }
  })
}

run().then(finishLoading)
