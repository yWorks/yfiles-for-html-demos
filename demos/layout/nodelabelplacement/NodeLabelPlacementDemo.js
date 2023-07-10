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
  ExtendedLabelCandidateProfitModel,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  FreeNodeLabelModel,
  GenericLabeling,
  GenericLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HorizontalTextAlignment,
  ILabelModel,
  INode,
  InteriorLabelModel,
  LabelCandidateDescriptor,
  LayoutExecutor,
  License,
  Rect,
  SandwichLabelModel,
  ShapeNodeShape,
  Size
} from 'yfiles'

import SampleData from './resources/sample.js'
import MapVisualCreator from './MapVisualCreator.js'
import CityLabelStyle from './CityLabelStyle.js'
import {
  applyDemoTheme,
  createDemoNodeLabelStyle,
  createDemoShapeNodeStyle
} from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'

/**
 * The graph component.
 * @type {GraphComponent}
 */
let graphComponent

/**
 * Holds whether or not a layout is in progress.
 * @type {boolean}
 */
let inLayout = false

/**
 * Holds the available label models.
 * @type {Array}
 */
let labelModels = []

/**
 * Runs the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // initialize the node label properties
  initializeOptions()

  // set the default styles for nodes and labels
  initializeGraph()

  // create the input mode
  initializeInputMode()

  // create the sample graph
  await createSampleGraph()

  // wire up the UI
  initializeUI()
}

/**
 * Initialize the node label options.
 */
function initializeOptions() {
  const modelWithInset5 = new ExteriorLabelModel({ insets: 5 })
  const modelWithInset10 = new ExteriorLabelModel({ insets: 10 })
  const modelWithInset15 = new ExteriorLabelModel({ insets: 15 })

  const labelModelParameters = [
    modelWithInset5.createParameter(ExteriorLabelModelPosition.NORTH),
    modelWithInset5.createParameter(ExteriorLabelModelPosition.NORTH_EAST),
    modelWithInset5.createParameter(ExteriorLabelModelPosition.NORTH_WEST),
    modelWithInset5.createParameter(ExteriorLabelModelPosition.SOUTH),
    modelWithInset5.createParameter(ExteriorLabelModelPosition.SOUTH_EAST),
    modelWithInset5.createParameter(ExteriorLabelModelPosition.SOUTH_WEST),
    modelWithInset5.createParameter(ExteriorLabelModelPosition.EAST),
    modelWithInset5.createParameter(ExteriorLabelModelPosition.WEST),

    modelWithInset10.createParameter(ExteriorLabelModelPosition.NORTH),
    modelWithInset10.createParameter(ExteriorLabelModelPosition.NORTH_EAST),
    modelWithInset10.createParameter(ExteriorLabelModelPosition.NORTH_WEST),
    modelWithInset10.createParameter(ExteriorLabelModelPosition.SOUTH),
    modelWithInset10.createParameter(ExteriorLabelModelPosition.SOUTH_EAST),
    modelWithInset10.createParameter(ExteriorLabelModelPosition.SOUTH_WEST),
    modelWithInset10.createParameter(ExteriorLabelModelPosition.EAST),
    modelWithInset10.createParameter(ExteriorLabelModelPosition.WEST),

    modelWithInset15.createParameter(ExteriorLabelModelPosition.NORTH),
    modelWithInset15.createParameter(ExteriorLabelModelPosition.NORTH_EAST),
    modelWithInset15.createParameter(ExteriorLabelModelPosition.NORTH_WEST),
    modelWithInset15.createParameter(ExteriorLabelModelPosition.SOUTH),
    modelWithInset15.createParameter(ExteriorLabelModelPosition.SOUTH_EAST),
    modelWithInset15.createParameter(ExteriorLabelModelPosition.SOUTH_WEST),
    modelWithInset15.createParameter(ExteriorLabelModelPosition.EAST),
    modelWithInset15.createParameter(ExteriorLabelModelPosition.WEST)
  ]

  const genericLabelModel = new GenericLabelModel(labelModelParameters[0])
  labelModelParameters.forEach(labelModelParameter => {
    const insets = labelModelParameter.model.insets.top
    const profit = insets < 10 ? 1.0 : insets < 15 ? 0.9 : 0.8
    const labelCandidateDescriptor = new LabelCandidateDescriptor({ profit })
    genericLabelModel.addParameter(labelModelParameter, labelCandidateDescriptor)
  })

  labelModels = [
    new InteriorLabelModel(),
    new ExteriorLabelModel(),
    new FreeNodeLabelModel(),
    new SandwichLabelModel({ yOffset: 3 }),
    genericLabelModel
  ]
}

/**
 * Initializes node and label styles that are applied when the graph is created.
 */
function initializeGraph() {
  const graph = graphComponent.graph
  // set the default style for nodes
  graph.nodeDefaults.style = createDemoShapeNodeStyle(ShapeNodeShape.ELLIPSE)

  // set the default size for nodes
  graph.nodeDefaults.size = new Size(10, 10)

  // set the default style for labels
  graph.nodeDefaults.labels.style = new CityLabelStyle(createDemoNodeLabelStyle())
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.NORTH

  // add the background visual for the map
  graphComponent.backgroundGroup.addChild(new MapVisualCreator())
}

/**
 * Creates the input mode.
 */
function initializeInputMode() {
  const inputMode = new GraphEditorInputMode({
    showHandleItems: GraphItemTypes.NONE,
    allowCreateEdge: false
  })
  // add a label for each newly created node
  inputMode.addNodeCreatedListener(async (sender, args) => {
    graphComponent.graph.addLabel(args.item, 'City')
    await placeLabels()
  })
  graphComponent.inputMode = inputMode
}

/**
 * Configures the label models and runs the labeling algorithm.
 * @returns {!Promise}
 */
async function placeLabels() {
  if (inLayout) {
    return
  }
  // Check if the label size input is valid. Valid inputs are greater than zero and less than 50.
  const fontSizeElement = document.querySelector('#label-font-size')
  const textSize = parseFloat(fontSizeElement.value)
  if (isNaN(textSize) || textSize <= 0 || textSize > 50) {
    return alert('Label size should be greater than 0 and less than 50.')
  }

  const graph = graphComponent.graph
  setUIDisabled(true)

  const labelModelComboBox = document.querySelector('#label-models')
  const labelModel = labelModels[labelModelComboBox.selectedIndex]
  // sets the label model based on the selected value of the corresponding combo-box
  graph.labels
    .filter(label => label.owner instanceof INode)
    .forEach(label => {
      // if the default label model is not the selected, change it
      if (labelModel !== graph.nodeDefaults.labels.layoutParameter.model) {
        graph.setLabelLayoutParameter(label, labelModel.createDefaultParameter())
      }

      // sets the label size based on the selected value of the corresponding text-field
      const cityLabelStyle = label.style
      if (cityLabelStyle && cityLabelStyle.innerLabelStyle) {
        const updatedStyle = new DefaultLabelStyle({
          textSize,
          horizontalTextAlignment: HorizontalTextAlignment.CENTER,
          backgroundFill: '#FFC398',
          textFill: '662b00'
        })
        graph.setStyle(label, new CityLabelStyle(updatedStyle))
      }
    })

  // set as default label model parameter
  graph.nodeDefaults.labels.layoutParameter = labelModel.createDefaultParameter()
  const updatedStyle = new DefaultLabelStyle({
    textSize,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER,
    backgroundFill: '#FFC398',
    textFill: '662b00'
  })
  graph.nodeDefaults.labels.style = new CityLabelStyle(updatedStyle)
  graphComponent.invalidate()

  // apply the labeling algorithm
  const labelingAlgorithm = new GenericLabeling({
    placeEdgeLabels: false,
    removeEdgeOverlaps: true,
    profitModel: new ExtendedLabelCandidateProfitModel()
  })

  try {
    await new LayoutExecutor({
      graphComponent,
      layout: labelingAlgorithm,
      duration: '0.5s',
      easedAnimation: true
    }).start()
  } finally {
    setUIDisabled(false)
  }
}

/**
 * Changes the state of the UI's elements.
 * @param {boolean} disabled True if the UI elements should be enabled, false otherwise
 */
function setUIDisabled(disabled) {
  inLayout = disabled
  document.querySelector('#label-models').disabled = disabled
  document.querySelector('#label-font-size').disabled = disabled
  document.querySelector('#place-labels').disabled = disabled
}

/**
 * Wires up the UI.
 */
function initializeUI() {
  document.querySelector('#place-labels').addEventListener('click', placeLabels)
  document.querySelector('#label-font-size').addEventListener('change', placeLabels)
  addNavigationButtons(document.querySelector('#label-models')).addEventListener(
    'change',
    placeLabels
  )
}

/**
 * Creates the sample graph.
 * @returns {!Promise}
 */
async function createSampleGraph() {
  const builder = new GraphBuilder(graphComponent.graph)
  const defaultNodeSize = graphComponent.graph.nodeDefaults.size
  builder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    layout: data => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height),
    labels: ['label']
  })
  builder.buildGraph()

  // fit content
  graphComponent.fitGraphBounds()

  // places the node labels
  await placeLabels()
}

run().then(finishLoading)
