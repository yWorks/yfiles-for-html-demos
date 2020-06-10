/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { FreeNodePortLocationModel, GraphComponent, License, Point, Rect } from 'yfiles'
import { showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'

// @ts-ignore
let graphComponent: GraphComponent = null

function run(licenseData: object): void {
  License.value = licenseData
  // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
  graphComponent = new GraphComponent('#graphComponent')

  // /////////////// New in this Sample /////////////////

  // Populates the graph and overrides some styles and label models
  populateGraph()

  // ////////////////////////////////////////////////////

  // Initialize the demo application's CSS and Javascript for the description
  // this is specific for the tiny little demo framework we are using
  // and not relevant in other applications.
  showApp(graphComponent)
}

// /////////////// New in this Sample /////////////////

/**
 * Creates a sample graph and introduces all important graph elements present in
 * yFiles for HTML. Additionally, this method now overrides the label placement for some specific labels.
 */
function populateGraph(): void {
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

// ////////////////////////////////////////////////////

// start tutorial
loadJson().then(run)
