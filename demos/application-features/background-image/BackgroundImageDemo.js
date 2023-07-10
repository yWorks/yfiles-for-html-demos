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
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeLabelModel,
  GroupNodeStyle,
  ICanvasObject,
  ICanvasObjectDescriptor,
  IGraph,
  License,
  Point,
  Size
} from 'yfiles'

import RectangleVisualCreator from './RectangleVisualCreator.js'
import ImageVisualCreator from './ImageVisualCreator.js'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

/**
 * Application Features - Add an image or colored rectangle to the background of the graph
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * The canvas object that stores the background visualization. This can be used to remove the background image.
 * @type {ICanvasObject}
 */
let background = null

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)

  // create an initial sample graph
  createGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  // Finally, enable the undo engine. This prevents undoing of the graph creation
  graphComponent.graph.undoEngineEnabled = true

  // set initial background
  displayImage()

  // bind the buttons to their functionality
  initializeUI()
}

/**
 * Creates the image and puts it in the background of the graph.
 */
function displayImage() {
  // delete what is already displayed in the background
  if (background !== null) {
    background.remove()
  }
  // create the image and display it
  background = graphComponent.backgroundGroup.addChild(
    new ImageVisualCreator(),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Creates a colored rectangle and puts it in the background of the graph.
 */
function displayRectangle() {
  // delete what is already displayed in the background
  if (background !== null) {
    background.remove()
  }
  // create the rectangle and display it
  background = graphComponent.backgroundGroup.addChild(
    new RectangleVisualCreator(),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param {!IGraph} graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
  initDemoStyles(graph)

  // set the style, label and label parameter for group nodes
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: 'darkgray',
    tabPosition: 'top-trailing',
    contentAreaFill: 'white'
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'right',
    textFill: 'black'
  })
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createDefaultParameter()

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
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
 * Binds the buttons in the toolbar to their functionality.
 */
function initializeUI() {
  const imageButton = document.querySelector('#image')
  const rectangleButton = document.querySelector('#rectangle')

  imageButton.addEventListener('click', () => {
    // display Image in the background
    displayImage()
    // enable the rectangle button
    rectangleButton.disabled = false
    // disabled the image button
    imageButton.disabled = true
  })

  rectangleButton.addEventListener('click', () => {
    // display colored rectangle in the background
    displayRectangle()
    // disable the rectangle button
    rectangleButton.disabled = true
    // enable the image button
    imageButton.disabled = false
  })
}

run().then(finishLoading)
