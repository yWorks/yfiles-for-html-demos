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
  DefaultLabelStyle,
  FamilyTreeLayout,
  FamilyTreeLayoutData,
  FamilyType,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  IArrow,
  ICommand,
  IGraph,
  INode,
  InteriorLabelModel,
  License,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle
} from 'yfiles'

import { bindCommand, checkLicense, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import GraphBuilderData from './resources/kennedy-family.js'

/**
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData

  // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
  const graphComponent = new GraphComponent('#graphComponent')

  // Configure interaction
  graphComponent.inputMode = new GraphViewerInputMode()

  // Configures default styles for the edges
  setDefaultEdgeStyle(graphComponent.graph)

  // Read a sample graph from an embedded resource file
  createSampleGraph(graphComponent.graph)

  // Apply the family tree layout on the graph
  runLayout(graphComponent)

  // Bind the demo buttons to their commands
  registerCommands(graphComponent)

  // Initialize the demo application's CSS and Javascript for the description
  showApp(graphComponent)
}

/**
 * Applies the family tree layout using the nodes' types stored in the tags.
 * The node's type is important to configure the layout algorithm.
 * @param {!GraphComponent} graphComponent
 */
function runLayout(graphComponent) {
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
        default:
          return null
      }
    }
  })
  graphComponent.morphLayout(familyTreeLayout, '1s', familyTreeLayoutData).catch(error => {
    const reporter = window.reportError
    if (typeof reporter === 'function') {
      reporter(error)
    } else {
      throw error
    }
  })
}

/**
 * Creates the sample graph.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
  // Create styles for the nodes
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

  // Create styles for the labels in the nodes
  const namesStyle = new DefaultLabelStyle({
    font: '14px Tahoma',
    textFill: 'black',
    horizontalTextAlignment: 'center',
    insets: [-10, 0, 0, 0]
  })
  const dateStyle = new DefaultLabelStyle({
    font: '11px Tahoma',
    textFill: 'rgb(119,136,153)',
    insets: [5, 5, 5, 5]
  })

  // Use the GraphBuilder to create the graph items from data
  const builder = new GraphBuilder(graph)
  const nodesSource = builder.createNodesSource({
    data: GraphBuilderData.nodes,
    id: 'id',
    layout: data => new Rect(0, 0, data.layout.width, data.layout.height)
  })

  // Configure the styles to use for nodes
  const nodeCreator = nodesSource.nodeCreator
  nodeCreator.styleProvider = data => {
    switch (data.familyType) {
      case 'MALE':
        return maleStyle
      case 'FEMALE':
        return femaleStyle
      case 'FAMILY':
        return familyKnot
      default:
        return null
    }
  }

  const labelCreator = nodeCreator.createLabelsSource(data => data.labels).labelCreator
  labelCreator.textProvider = data => data.text
  labelCreator.layoutParameterProvider = data => {
    const text = data.text
    if (isBirthDate(text)) {
      return InteriorLabelModel.SOUTH_WEST
    } else if (isDeathDate(text)) {
      return InteriorLabelModel.SOUTH_EAST
    }
    return InteriorLabelModel.CENTER
  }
  // Configure the styles to use for labels
  labelCreator.styleProvider = data => {
    const text = data.text
    return isBirthDate(text) || isDeathDate(text) ? dateStyle : namesStyle
  }

  builder.createEdgesSource(GraphBuilderData.edges, 'source', 'target', 'id')

  builder.buildGraph()
}

/**
 * Determines if the given date string denotes a birth date.
 * @param {!string} text
 * @returns {boolean}
 */
function isBirthDate(text) {
  return text.indexOf('*') !== -1
}

/**
 * Determines if the given date string denotes a death date.
 * @param {!string} text
 * @returns {boolean}
 */
function isDeathDate(text) {
  return text.indexOf('✝') !== -1
}

/**
 * Assigns default styles for the edges.
 * @param {!IGraph} graph
 */
function setDefaultEdgeStyle(graph) {
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })
}

/** Helper method that binds the various commands available in yFiles for HTML to the buttons
 * in the demo's toolbar.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// start tutorial
loadJson().then(checkLicense).then(run)
