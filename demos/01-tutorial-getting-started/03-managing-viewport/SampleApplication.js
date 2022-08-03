/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  FreeNodePortLocationModel,
  GraphComponent,
  GraphOverviewComponent,
  ICommand,
  License,
  Point,
  Rect
} from 'yfiles'

import { bindCommand, showApp } from '../../resources/demo-app.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
  graphComponent = new GraphComponent('#graphComponent')

  // Populates the graph and overrides some styles and label models
  populateGraph()

  // /////////////// New in this Sample /////////////////

  // Manages the viewport
  updateViewport()

  // Creates a node outside the initial content rectangle
  const graph = graphComponent.graph
  graph.addLabel(
    graph.createNodeAt(new Point(-500, -500)),
    'Outside initial viewport',
    ExteriorLabelModel.SOUTH
  )

  // ////////////////////////////////////////////////////

  // bind the demo buttons to their commands
  registerCommands()

  // Initialize the demo application's CSS and Javascript for the description
  showApp(graphComponent)
}

/**
 * Creates a sample graph and introduces all important graph elements present in
 * yFiles for HTML. Additionally, this method now overrides the label placement for some specific labels.
 */
function populateGraph() {
  // ////////// Sample node creation ///////////////////
  const graph = graphComponent.graph

  // Creates two nodes with the default node size
  // The location is specified for the _center_
  const node1 = graph.createNodeAt(new Point(30, 30))
  const node2 = graph.createNodeAt(new Point(150, 30))
  // Creates a third node with a different size of 60x30
  // In this case, the location of (400,400) describes the _upper left_
  // corner of the node bounds
  const node3 = graph.createNode(new Rect(230, 200, 60, 30))

  // ///////////////////////////////////////////////////

  // ////////// Sample edge creation ///////////////////

  // Creates some edges between the nodes
  graph.createEdge(node1, node2)
  const edge = graph.createEdge(node2, node3)

  // ///////////////////////////////////////////////////

  // ////////// Using Bends ////////////////////////////

  // Creates the first bend for edge at (260, 30)
  graph.addBend(edge, new Point(260, 30))

  // ///////////////////////////////////////////////////

  // ////////// Using Ports ////////////////////////////

  // Actually, edges connect "ports", not nodes directly.
  // If necessary, you can manually create ports at nodes
  // and let the edges connect to these.
  // Creates a port in the center of the node layout
  const port1AtNode1 = graph.addPort(node1, FreeNodePortLocationModel.NODE_CENTER_ANCHORED)

  // Creates a port at the middle of the left border
  // Note to use absolute locations when placing ports using PointD.
  const port1AtNode3 = graph.addPortAt(node3, new Point(node3.layout.x, node3.layout.center.y))

  // Creates an edge that connects these specific ports
  const edgeAtPorts = graph.createEdge(port1AtNode1, port1AtNode3)

  // ///////////////////////////////////////////////////

  // ////////// Sample label creation ///////////////////

  // Adds labels to several graph elements
  graph.addLabel(node1, 'n1')
  graph.addLabel(node2, 'n2')
  graph.addLabel(node3, 'n3')
  graph.addLabel(edgeAtPorts, 'Edge at Ports')

  // ///////////////////////////////////////////////////
}

/**
 * Updates the content rectangle to encompass all existing graph elements.
 * If you create your graph elements programmatically, the content rectangle
 * (i.e. the rectangle in __world coordinates__
 * that encloses the graph) is __not__ updated automatically to enclose these elements.
 * Typically, this manifests in wrong/missing scrollbars, incorrect {@link GraphOverviewComponent}
 * behavior and the like.
 *
 * This method demonstrates several ways to update the content rectangle, with or without adjusting the zoom level
 * to show the whole graph in the view.
 *
 * Note that updating the content rectangle only does not change the current Viewport (i.e. the world coordinate
 * rectangle that corresponds to the currently visible area in view coordinates)
 *
 * Uncomment various combinations of lines in this method and observe the different effects.
 *
 * The following demos in this tutorial will assume that you've called {@link GraphComponent.fitGraphBounds}
 * in this method.
 */
function updateViewport() {
  // Uncomment the following line to update the content rectangle
  // to include all graph elements
  // This should result in correct scrolling behaviour:

  // graphComponent.updateContentRect();

  // Additionally, we can also set the zoom level so that the
  // content rectangle fits exactly into the viewport area:
  // Uncomment this line in addition to UpdateContentRect:
  // Note that this changes the zoom level (i.e. the graph elements will look smaller)

  // graphComponent.fitContent();

  // The sequence above is equivalent to just calling:
  graphComponent.fitGraphBounds()
}

/**
 * This is specific for the demo framework and not relevant in real applications
 * This method binds the execution for some predefined commands in the library
 * to some buttons in the UI.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// noinspection JSIgnoredPromiseFromCall
run()
