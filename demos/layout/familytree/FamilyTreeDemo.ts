/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  DefaultLabelStyle,
  FamilyTreeLayout,
  FamilyTreeLayoutData,
  FamilyType,
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  IArrow,
  ICommand,
  IGraph,
  INode,
  License,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle
} from 'yfiles'

import { bindCommand, reportDemoError, showApp } from '../../resources/demo-app'
import GraphBuilderData from './resources/kennedy-family'

import { applyDemoTheme } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

async function run(): Promise<void> {
  License.value = await fetchLicense()

  // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

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
 */
function runLayout(graphComponent: GraphComponent): void {
  const familyTreeLayout = new FamilyTreeLayout()
  const familyTreeLayoutData = new FamilyTreeLayoutData({
    familyTypes: (node: INode) => {
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
    reportDemoError(error)
  })
}

/**
 * Creates the sample graph.
 */
function createSampleGraph(graph: IGraph): void {
  // Create styles for the nodes
  const maleStyle = new ShapeNodeStyle({
    fill: '#67b7dc',
    stroke: '#617984',
    shape: ShapeNodeShape.ROUND_RECTANGLE
  })
  const femaleStyle = new ShapeNodeStyle({
    fill: '#dc67ce',
    stroke: '#846180',
    shape: ShapeNodeShape.ROUND_RECTANGLE
  })
  const familyKnot = new ShapeNodeStyle({
    fill: 'rgb(170, 170, 170)',
    stroke: 'white',
    shape: ShapeNodeShape.ELLIPSE
  })

  // Create styles for the labels in the nodes
  const nameMaleStyle = new DefaultLabelStyle({
    font: '14px Tahoma',
    backgroundFill: '#c1e1f1',
    textFill: '#2d4a59',
    horizontalTextAlignment: 'center',
    insets: 3
  })
  const nameFemaleStyle = new DefaultLabelStyle({
    font: '14px Tahoma',
    backgroundFill: '#f1c1ea',
    textFill: '#592d53',
    horizontalTextAlignment: 'center',
    insets: 3
  })
  const dateMaleStyle = new DefaultLabelStyle({
    font: '11px Tahoma',
    backgroundFill: '#c1e1f1',
    textFill: '#2d4a59',
    insets: 3
  })
  const dateFemaleStyle = new DefaultLabelStyle({
    font: '11px Tahoma',
    backgroundFill: '#f1c1ea',
    textFill: '#592d53',
    insets: 3
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

  const labelCreator = nodeCreator.createLabelsSource(data =>
    data.labels.map(label => ({ text: label.text, familyType: data.familyType }))
  ).labelCreator
  labelCreator.textProvider = data => data.text
  labelCreator.layoutParameterProvider = data => {
    const text = data.text
    if (isBirthDate(text)) {
      return FreeNodeLabelModel.INSTANCE.createParameter({
        layoutRatio: [0, 1],
        layoutOffset: [5, -5],
        labelRatio: [0, 1]
      })
    } else if (isDeathDate(text)) {
      return FreeNodeLabelModel.INSTANCE.createParameter({
        layoutRatio: [1, 1],
        layoutOffset: [-5, -5],
        labelRatio: [1, 1]
      })
    }
    return FreeNodeLabelModel.INSTANCE.createParameter({
      layoutRatio: [0.5, 0],
      layoutOffset: [0, 7],
      labelRatio: [0.5, 0]
    })
  }
  // Configure the styles to use for labels
  labelCreator.styleProvider = data => {
    const text = data.text
    if (isBirthDate(text) || isDeathDate(text)) {
      return data.familyType === 'MALE'
        ? dateMaleStyle
        : data.familyType === 'FEMALE'
        ? dateFemaleStyle
        : null
    } else {
      return data.familyType === 'MALE'
        ? nameMaleStyle
        : data.familyType === 'FEMALE'
        ? nameFemaleStyle
        : null
    }
  }

  builder.createEdgesSource(GraphBuilderData.edges, 'source', 'target', 'id')

  builder.buildGraph()
}

/**
 * Determines if the given date string denotes a birth date.
 */
function isBirthDate(text: string): boolean {
  return text.indexOf('*') !== -1
}

/**
 * Determines if the given date string denotes a death date.
 */
function isDeathDate(text: string): boolean {
  return text.indexOf('✝') !== -1
}

/**
 * Assigns default styles for the edges.
 */
function setDefaultEdgeStyle(graph: IGraph): void {
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })
}

/**
 * Helper method that binds the various commands available in yFiles for HTML to the buttons
 * in the demo's toolbar.
 */
function registerCommands(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// noinspection JSIgnoredPromiseFromCall
run()
