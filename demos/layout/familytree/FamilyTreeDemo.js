/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  FamilyTreeLayout,
  FamilyTreeLayoutData,
  FamilyType,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  IArrow,
  ICommand,
  InteriorLabelModel,
  License,
  PolylineEdgeStyle,
  ShapeNodeShape,
  ShapeNodeStyle
} from 'yfiles'

import { bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import GraphBuilderData from './resources/kennedy-family.js'

/** @type {GraphComponent} */
let graphComponent = null

function run(licenseData) {
  License.value = licenseData

  // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
  graphComponent = new GraphComponent('#graphComponent')

  // Configure interaction
  graphComponent.inputMode = new GraphViewerInputMode()

  // Configures default styles for the edges
  setDefaultEdgeStyle()

  // Read a sample graph from an embedded resource file
  createSampleGraph()

  // Sets the nodes's styles, the male node will be blue,
  // the female node will be pink and the family node that connect
  // partners with each other and their children will be gray and circle.
  setFamilyNodesStyle()

  // Apply the family tree layout on the graph
  runLayout()

  // Bind the demo buttons to their commands
  registerCommands()

  // Initialize the demo application's CSS and Javascript for the description
  showApp(graphComponent)
}

/**
 * Applies the family tree layout using the nodes' types stored in the tags.
 * The node's type is important to configure the layout algorithm.
 */
function runLayout() {
  const familyTreeLayout = new FamilyTreeLayout()
  const familyTreeLayoutData = new FamilyTreeLayoutData({
    familyTypes: node => {
      switch (node.tag.familyType) {
        case 'MALE':
          return FamilyType.MALE
        case 'FEMALE':
          return FamilyType.FEMALE
        case 'FAMILY':
          return FamilyType.FAMILY
      }
    }
  })
  graphComponent.morphLayout(familyTreeLayout, '1s', familyTreeLayoutData).catch(error => {
    if (typeof window.reportError === 'function') {
      window.reportError(error)
    } else {
      throw error
    }
  })
}

/**
 * Creates the sample graph.
 */
function createSampleGraph() {
  const graph = graphComponent.graph
  const builder = new GraphBuilder({
    graph,
    nodesSource: GraphBuilderData.nodes,
    edgesSource: GraphBuilderData.edges,
    sourceNodeBinding: 'source',
    targetNodeBinding: 'target',
    nodeIdBinding: 'id',
    nodeLabelBinding: data => data.labels.text
  })

  builder.buildGraph()

  // Sets the sizes of the nodes
  graph.nodes.forEach(node => {
    node.layout.width = node.tag.layout.width
    node.layout.height = node.tag.layout.height
  })

  // Creates styles for the labels in the nodes
  const namesStyle = new DefaultLabelStyle({
    font: '14px Tahoma',
    textFill: 'black',
    horizontalTextAlignment: 'Center',
    insets: [-10, 0, 0, 0]
  })

  const dateStyle = new DefaultLabelStyle({
    font: '11px Tahoma',
    textFill: 'rgb(119,136,153)',
    insets: [5, 5, 5, 5]
  })

  // Iterate the node data and create the labels of the node
  graph.nodes.forEach(node => {
    if (node.tag.labels) {
      node.tag.labels.forEach(label => {
        if (label.text.includes('*'))
          graph.addLabel(node, label.text, InteriorLabelModel.SOUTH_WEST, dateStyle)
        else {
          if (label.text.includes('✝'))
            graph.addLabel(node, label.text, InteriorLabelModel.SOUTH_EAST, dateStyle)
          else graph.addLabel(node, label.text, InteriorLabelModel.CENTER, namesStyle)
        }
      })
    }
  })
}

/**
 * Assigns the style to the family tree nodes. Males will be visualized in blue color, females in pink and the
 * family nodes that connect partners with each other and their children will be circular with gray color.
 */
function setFamilyNodesStyle() {
  const maleStyle = new ShapeNodeStyle({
    fill: 'rgb(176,224,230)',
    stroke: 'white',
    shape: ShapeNodeShape.ROUND_RECTANGLE
  })
  const femaleStyle = new ShapeNodeStyle({
    fill: 'rgb(255,182,193)',
    stroke: 'white',
    shape: ShapeNodeShape.ROUND_RECTANGLE
  })
  const familyKnot = new ShapeNodeStyle({
    fill: 'rgb(170, 170, 170)',
    stroke: 'white',
    shape: ShapeNodeShape.ELLIPSE
  })
  const graph = graphComponent.graph
  graph.nodes.forEach(node => {
    switch (node.tag.familyType) {
      case 'MALE':
        graph.setStyle(node, maleStyle)
        break
      case 'FEMALE':
        graph.setStyle(node, femaleStyle)
        break
      case 'FAMILY':
        graph.setStyle(node, familyKnot)
        break
    }
  })
}

/**
 * Assigns default styles for the edges.
 */
function setDefaultEdgeStyle() {
  graphComponent.graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })
}

/** Helper method that binds the various commands available in yFiles for HTML to the buttons
 * in the demo's toolbar.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// start tutorial
loadJson().then(run)
