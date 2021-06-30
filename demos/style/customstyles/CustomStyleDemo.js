/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  CollapsibleNodeStyleDecorator,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IGraph,
  IInputMode,
  InteriorLabelModel,
  InteriorLabelModelPosition,
  License,
  Point,
  Size
} from 'yfiles'

import CustomCollapsibleNodeStyleDecoratorRenderer from './CustomCollapsibleNodeStyleDecoratorRenderer.js'
import CustomGroupNodeStyle from './CustomGroupNodeStyle.js'
import CustomSimpleLabelStyle from './CustomSimpleLabelStyle.js'
import CustomSimpleEdgeStyle from './CustomSimpleEdgeStyle.js'
import CustomSimpleNodeStyle from './CustomSimpleNodeStyle.js'
import CustomSimplePortStyle from './CustomSimplePortStyle.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {FoldingManager} */
let foldingManager

/**
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData

  const graphComponent = new GraphComponent('graphComponent')

  // From now on, everything can be done on the actual managed view instance
  enableFolding(graphComponent)

  // Initialize default styles for nodes
  initializeStyles(graphComponent.graph)

  // Create some graph elements with the above defined styles.
  createSampleGraph(graphComponent.graph)

  // Initialize the input mode
  graphComponent.inputMode = createEditorMode()

  graphComponent.fitGraphBounds()

  registerCommands(graphComponent)

  showApp(graphComponent)
}

/**
 * Sets a custom NodeStyle instance as a template for newly created
 * nodes in the graph.
 * @param {!IGraph} graph
 */
function initializeStyles(graph) {
  // Wrap the style with CollapsibleNodeStyleDecorator
  // Use a custom renderer to change the collapse button visualization
  const nodeStyleDecorator = new CollapsibleNodeStyleDecorator(
    new CustomGroupNodeStyle(),
    new CustomCollapsibleNodeStyleDecoratorRenderer(new Size(14, 14))
  )
  // Use a different label model for button placement
  const newInteriorLabelModel = new InteriorLabelModel({ insets: 2 })
  nodeStyleDecorator.buttonPlacement = newInteriorLabelModel.createParameter(
    InteriorLabelModelPosition.SOUTH_EAST
  )
  graph.groupNodeDefaults.style = nodeStyleDecorator

  // Create a new style and use it as default port style
  graph.nodeDefaults.ports.style = new CustomSimplePortStyle()

  // Create a new style and use it as default node style
  graph.nodeDefaults.style = new CustomSimpleNodeStyle()
  // Create a new style and use it as default edge style
  graph.edgeDefaults.style = new CustomSimpleEdgeStyle()
  // Create a new style and use it as default label style
  graph.nodeDefaults.labels.style = new CustomSimpleLabelStyle()
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.NORTH
  graph.edgeDefaults.labels.style = new CustomSimpleLabelStyle()

  graph.nodeDefaults.size = new Size(50, 50)
}

/**
 * Creates the default input mode for the graphComponent,
 * a {@link GraphEditorInputMode}.
 * @returns {!IInputMode} a new GraphEditorInputMode instance
 */
function createEditorMode() {
  return new GraphEditorInputMode({
    allowEditLabel: true,
    hideLabelDuringEditing: false,
    allowGroupingOperations: true
  })
}

/**
 * Creates the initial sample graph.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
  const n0 = graph.createNodeAt({
    location: new Point(291, 433),
    tag: 'rgb(108, 0, 255)'
  })
  const n1 = graph.createNodeAt({
    location: new Point(396, 398),
    tag: 'rgb(210, 255, 0)'
  })
  const n2 = graph.createNodeAt({
    location: new Point(462, 308),
    tag: 'rgb(0, 72, 255)'
  })
  const n3 = graph.createNodeAt({
    location: new Point(462, 197),
    tag: 'rgb(255, 0, 84)'
  })
  const n4 = graph.createNodeAt({
    location: new Point(396, 107),
    tag: 'rgb(255, 30, 0)'
  })
  const n5 = graph.createNodeAt({
    location: new Point(291, 73),
    tag: 'rgb(0, 42, 255)'
  })
  const n6 = graph.createNodeAt({
    location: new Point(185, 107),
    tag: 'rgb(114, 255, 0)'
  })
  const n7 = graph.createNodeAt({
    location: new Point(119, 197),
    tag: 'rgb(216, 0, 255)'
  })
  const n8 = graph.createNodeAt({
    location: new Point(119, 308),
    tag: 'rgb(36, 255, 0)'
  })
  const n9 = graph.createNodeAt({
    location: new Point(185, 398),
    tag: 'rgb(216, 0, 255)'
  })

  const labelModel = new ExteriorLabelModel({ insets: 15 })

  graph.addLabel(n0, 'Node 0', labelModel.createParameter(ExteriorLabelModelPosition.SOUTH))
  graph.addLabel(n1, 'Node 1', labelModel.createParameter(ExteriorLabelModelPosition.SOUTH_EAST))
  graph.addLabel(n2, 'Node 2', labelModel.createParameter(ExteriorLabelModelPosition.EAST))
  graph.addLabel(n3, 'Node 3', labelModel.createParameter(ExteriorLabelModelPosition.EAST))
  graph.addLabel(n4, 'Node 4', labelModel.createParameter(ExteriorLabelModelPosition.NORTH_EAST))
  graph.addLabel(n5, 'Node 5', labelModel.createParameter(ExteriorLabelModelPosition.NORTH))
  graph.addLabel(n6, 'Node 6', labelModel.createParameter(ExteriorLabelModelPosition.NORTH_WEST))
  graph.addLabel(n7, 'Node 7', labelModel.createParameter(ExteriorLabelModelPosition.WEST))
  graph.addLabel(n8, 'Node 8', labelModel.createParameter(ExteriorLabelModelPosition.WEST))
  graph.addLabel(n9, 'Node 9', labelModel.createParameter(ExteriorLabelModelPosition.SOUTH_WEST))

  graph.createEdge(n0, n4)
  graph.createEdge(n6, n0)
  graph.createEdge(n6, n5)
  graph.createEdge(n5, n2)
  graph.createEdge(n3, n7)
  graph.createEdge(n9, n4)

  // put all nodes into a group
  const group1 = graph.groupNodes(graph.nodes)
  group1.tag = 'gold'
}

/**
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='ModifyColors']", () => modifyColors(graphComponent))
}

/**
 * Enables folding - changes the graphComponent's graph to a managed view
 * that provides the actual collapse/expand state.
 * @param {!GraphComponent} graphComponent
 */
function enableFolding(graphComponent) {
  // Creates the folding manager and sets its master graph to
  // the single graph that has served for all purposes up to this point
  foldingManager = new FoldingManager(graphComponent.graph)
  // Creates a managed view from the master graph and
  // replaces the existing graph view with a managed view
  graphComponent.graph = foldingManager.createFoldingView().graph
}

/**
 * Modifies the tag of each leaf node.
 * @param {!GraphComponent} graphComponent
 */
function modifyColors(graphComponent) {
  const graph = graphComponent.graph
  // set the tag of all non-group (leaf) nodes to a new color
  graph.nodes
    .filter(node => !graph.isGroupNode(node))
    .forEach(node => {
      node.tag = `hsl(${Math.random() * 360},100%,50%)`
    })
  // and invalidate the view as the graph cannot know that we changed the styles
  graphComponent.invalidate()
}

// start demo
loadJson().then(run)
