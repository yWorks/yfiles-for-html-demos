/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultLabelStyle,
  ExteriorLabelModel,
  GraphComponent,
  GraphCopier,
  GraphEditorInputMode,
  GraphViewerInputMode,
  IBend,
  ICommand,
  IEdge,
  IGraph,
  ILabel,
  INode,
  IPort,
  InteriorStretchLabelModel,
  Key,
  License,
  ModifierKeys,
  PanelNodeStyle,
  Point,
  ShapeNodeStyle,
  Size,
  IModelItem
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let originalGraphComponent = null

/** @type {GraphComponent} */
let copyGraphComponent = null

/**
 * Bootstraps the demo.
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData

  originalGraphComponent = new GraphComponent('#originalGraphComponent')
  copyGraphComponent = new GraphComponent('#copyGraphComponent')
  originalGraphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  copyGraphComponent.inputMode = new GraphViewerInputMode()
  // configures default styles for newly created original graph and the copy graph elements
  initTutorialDefaults(originalGraphComponent.graph)
  initTutorialDefaults(copyGraphComponent.graph)

  // create an initial sample original graph
  createGraph(originalGraphComponent.graph)
  originalGraphComponent.fitGraphBounds()

  // Finally, enable the undo engine in the original graph. This prevents undoing of the graph creation
  originalGraphComponent.graph.undoEngineEnabled = true

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(originalGraphComponent)
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
 * Initializes the defaults for the styles in this tutorial.
 *
 * @param {!IGraph} graph The graph.
 */
function initTutorialDefaults(graph) {
  // configure defaults for normal nodes and their labels
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: 'darkorange',
    stroke: 'white'
  })
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'word-ellipsis'
  })
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH

  // configure defaults for group nodes and their labels
  graph.groupNodeDefaults.style = new PanelNodeStyle({
    color: 'rgb(214, 229, 248)',
    insets: [18, 5, 5, 5],
    labelInsetsColor: 'rgb(214, 229, 248)'
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'right'
  })
  graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH
}

/**
 * Creates an initial sample graph.
 *
 * @param {!IGraph} graph The graph.
 */
function createGraph(graph) {
  const node1 = graph.createNodeAt([110, 20])
  const node2 = graph.createNodeAt([145, 95])
  const node3 = graph.createNodeAt([75, 95])
  const node4 = graph.createNodeAt([30, 175])
  const node5 = graph.createNodeAt([100, 175])

  graph.groupNodes({ children: [node1, node2, node3], labels: ['Group 1'] })

  const edge1 = graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node1, node3)
  const edge3 = graph.createEdge(node3, node4)
  const edge4 = graph.createEdge(node3, node5)
  const edge5 = graph.createEdge(node1, node5)
  graph.setPortLocation(edge1.sourcePort, new Point(123.33, 40))
  graph.setPortLocation(edge1.targetPort, new Point(145, 75))
  graph.setPortLocation(edge2.sourcePort, new Point(96.67, 40))
  graph.setPortLocation(edge2.targetPort, new Point(75, 75))
  graph.setPortLocation(edge3.sourcePort, new Point(65, 115))
  graph.setPortLocation(edge3.targetPort, new Point(30, 155))
  graph.setPortLocation(edge4.sourcePort, new Point(85, 115))
  graph.setPortLocation(edge4.targetPort, new Point(90, 155))
  graph.setPortLocation(edge5.sourcePort, new Point(110, 40))
  graph.setPortLocation(edge5.targetPort, new Point(110, 155))
  graph.addBends(edge1, [new Point(123.33, 55), new Point(145, 55)])
  graph.addBends(edge2, [new Point(96.67, 55), new Point(75, 55)])
  graph.addBends(edge3, [new Point(65, 130), new Point(30, 130)])
  graph.addBends(edge4, [new Point(85, 130), new Point(90, 130)])
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands() {
  bindAction("button[data-command='NewInOriginalGraph']", () => {
    originalGraphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, originalGraphComponent)
  })
  bindCommand(
    "button[data-command='FitContentInOriginalGraph']",
    ICommand.FIT_GRAPH_BOUNDS,
    originalGraphComponent
  )
  bindCommand(
    "button[data-command='ZoomInOriginalGraph']",
    ICommand.ZOOM,
    originalGraphComponent,
    1.0
  )
  bindCommand("button[data-command='Undo']", ICommand.UNDO, originalGraphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, originalGraphComponent)
  bindCommand(
    "button[data-command='GroupSelection']",
    ICommand.GROUP_SELECTION,
    originalGraphComponent
  )
  bindCommand(
    "button[data-command='UngroupSelection']",
    ICommand.UNGROUP_SELECTION,
    originalGraphComponent
  )
  const kim = originalGraphComponent.inputMode.keyboardInputMode
  const copy = ICommand.createCommand()
  kim.addCommandBinding(copy, copyGraph, () => originalGraphComponent.selection.size > 0)
  bindCommand("button[data-command='Copy']", copy, originalGraphComponent, null)
  kim.addKeyBinding(Key.C, ModifierKeys.NONE, copy)

  bindAction("button[data-command='NewInCopyGraph']", () => {
    copyGraphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, copyGraphComponent)
  })

  bindCommand("button[data-command='ZoomInCopyGraph']", ICommand.ZOOM, copyGraphComponent, 1.0)
  bindCommand(
    "button[data-command='FitContentInCopyGraph']",
    ICommand.FIT_GRAPH_BOUNDS,
    copyGraphComponent
  )
}

// start tutorial
loadJson().then(run)
