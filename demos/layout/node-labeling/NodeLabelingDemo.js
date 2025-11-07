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
import {
  DiscreteNodeLabelPositions,
  FreeNodeLabelModel,
  GenericLabeling,
  GenericLabelingData,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ILabel,
  INode,
  LabelingCosts,
  LabelingOptimizationStrategy,
  LayoutExecutor,
  License,
  NodeLabelCandidates,
  Rect,
  ShapeNodeShape,
  Size
} from '@yfiles/yfiles'

import SampleData from './resources/sample'
import { MapVisualCreator } from './MapVisualCreator'
import { CityLabelStyle } from './CityLabelStyle'
import { createDemoNodeLabelStyle, createDemoShapeNodeStyle } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-app/demo-page'

/**
 * The graph component.
 */
let graphComponent

/**
 * Holds whether a layout is in progress.
 */
let inLayout = false

/**
 * Holds the available label candidates.
 */
let labelCandidateModes = []

/**
 * Holds the label styles
 */
let labelStyle
let cityLabelStyle

let pinnedLabelStyle
let pinnedCityLabelStyle

/**
 * Runs the demo.
 */
async function run() {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')
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
  // A set of candidates that chooses from three distances of the cardinal directions
  const threePositionsCardinal = new NodeLabelCandidates()
  threePositionsCardinal.addDiscreteCandidates(DiscreteNodeLabelPositions.SIDES, 5, 1.0)
  threePositionsCardinal.addDiscreteCandidates(DiscreteNodeLabelPositions.SIDES, 10, 0.9)
  threePositionsCardinal.addDiscreteCandidates(DiscreteNodeLabelPositions.SIDES, 15, 0.8)

  // A set of candidates that chooses from cardinal directions but prefers placing the label on top
  const cardinalPreferTop = new NodeLabelCandidates()
  cardinalPreferTop.addDiscreteCandidates(DiscreteNodeLabelPositions.TOP, 5, 1.0)
  //but other cardinal positions should also be possible
  cardinalPreferTop.addDiscreteCandidates(
    DiscreteNodeLabelPositions.LEFT |
      DiscreteNodeLabelPositions.BOTTOM |
      DiscreteNodeLabelPositions.RIGHT,
    5,
    0.8
  )

  // A set of candidates that prefers placing the label on top but chooses another position
  // if not possible
  const freePreferTopSideCandidates = new NodeLabelCandidates()
  freePreferTopSideCandidates.addDiscreteCandidates(DiscreteNodeLabelPositions.TOP, 5, 1.0)
  freePreferTopSideCandidates.addFreeCandidates(0.8)

  labelCandidateModes = [
    // Interior candidates
    new NodeLabelCandidates().addDiscreteCandidates(DiscreteNodeLabelPositions.INSIDE, 0),
    // Exterior candidates
    new NodeLabelCandidates().addDiscreteCandidates(DiscreteNodeLabelPositions.OUTSIDE, 20),
    threePositionsCardinal,
    cardinalPreferTop,
    // No preferred position, leave it up to the GenericLabeling algorithm
    new NodeLabelCandidates().addFreeCandidates(),
    freePreferTopSideCandidates
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
  labelStyle = createDemoNodeLabelStyle()
  cityLabelStyle = new CityLabelStyle(labelStyle)
  pinnedLabelStyle = createDemoNodeLabelStyle('demo-green')
  pinnedCityLabelStyle = new CityLabelStyle(pinnedLabelStyle)

  graph.nodeDefaults.labels.style = cityLabelStyle
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.CENTER
  // add the background visual for the map
  graphComponent.renderTree.createElement(
    graphComponent.renderTree.backgroundGroup,
    new MapVisualCreator()
  )
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
  inputMode.addEventListener('node-created', async (evt) => {
    graphComponent.graph.addLabel(evt.item, 'City')
    await placeLabels()
  })

  /**
   * Pins the label on drag finished
   */
  function dragFinished(evt) {
    inputMode.moveUnselectedItemsInputMode.affectedItems
      .concat(inputMode.moveSelectedItemsInputMode.affectedItems)
      .forEach(async (item) => {
        if (item instanceof ILabel) {
          evt.context.graph?.setStyle(item, pinnedCityLabelStyle)
          item.tag = 'fixed'
          await placeLabels()
        }
      })
  }

  /**
   * Unpins the label on click and runs the currently selected label layout
   */
  async function clickLabel(evt) {
    const item = evt.item
    if (item instanceof ILabel) {
      if (item.tag) {
        evt.context.graph?.setStyle(item, cityLabelStyle)
        item.tag = null
        await placeLabels()
      }
    }
  }

  inputMode.moveUnselectedItemsInputMode.addEventListener('drag-finished', dragFinished)
  inputMode.moveSelectedItemsInputMode.addEventListener('drag-finished', dragFinished)
  inputMode.addEventListener('item-clicked', clickLabel)

  graphComponent.inputMode = inputMode
}

/**
 * Unpins all labels
 */
async function unpinLabels() {
  const graph = graphComponent.graph
  graph.labels.forEach((label) => {
    if (label.tag != null) {
      label.tag = null
      graph.setStyle(label, cityLabelStyle)
    }
  })
  await placeLabels()
}

/**
 * Configures the label model and runs the labeling algorithm.
 */
async function placeLabels() {
  if (inLayout) {
    return
  }
  setUIDisabled(true)
  // configure the labeling algorithm
  const labelingAlgorithm = new GenericLabeling({ scope: 'node-labels' })
  const labelCandidateComboBox = document.querySelector('#label-candidates')
  // select the label candidate set and configure the GenericLabelingData
  const labelCandidate = labelCandidateModes[labelCandidateComboBox.selectedIndex]
  const labelingData = new GenericLabelingData({
    nodeLabelingCosts: new LabelingCosts(LabelingOptimizationStrategy.AMBIGUOUS_PLACEMENTS)
  })
  labelingData.nodeLabelCandidates = labelCandidate
  // excludes pinned labels from the layout
  labelingData.scope.nodeLabels = (label) => label.tag != 'fixed'

  try {
    await new LayoutExecutor({
      graphComponent,
      layout: labelingAlgorithm,
      layoutData: labelingData,
      animationDuration: '0.5s',
      easedAnimation: true,
      animateViewport: false
    }).start()
  } finally {
    setUIDisabled(false)
  }
}

/**
 * Changes the state of the UI's elements.
 * @param disabled True if the UI elements should be enabled, false otherwise
 */
function setUIDisabled(disabled) {
  inLayout = disabled
  document.querySelector('#label-candidates').disabled = disabled
  document.querySelector('#label-font-size').disabled = disabled
  document.querySelector('#place-labels').disabled = disabled
  document.querySelector('#unpin-labels').disabled = disabled
}

/**
 * Wires up the UI.
 */
function initializeUI() {
  document.querySelector('#place-labels').addEventListener('click', placeLabels)
  document.querySelector('#unpin-labels').addEventListener('click', unpinLabels)
  document.querySelector('#label-font-size').addEventListener('change', changeFontSize)
  addNavigationButtons(document.querySelector('#label-candidates')).addEventListener(
    'change',
    placeLabels
  )
}

/**
 * Creates the sample graph.
 */
async function createSampleGraph() {
  const builder = new GraphBuilder(graphComponent.graph)
  const defaultNodeSize = graphComponent.graph.nodeDefaults.size
  builder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    layout: (data) => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height),
    labels: ['label']
  })
  builder.buildGraph()

  // fit content
  await graphComponent.fitGraphBounds()

  // places the node labels
  await placeLabels()
}

async function changeFontSize(e) {
  // Check if the label size input is valid. Valid inputs are greater than zero and less than 50.
  const fontSizeElement = e.target
  const textSize = parseFloat(fontSizeElement.value)
  if (Number.isNaN(textSize) || textSize <= 0 || textSize > 50) {
    return alert('Label size should be greater than 0 and less than 50.')
  }

  const graph = graphComponent.graph

  labelStyle.textSize = textSize
  pinnedLabelStyle.textSize = textSize

  cityLabelStyle = new CityLabelStyle(labelStyle)
  pinnedCityLabelStyle = new CityLabelStyle(pinnedLabelStyle)

  graph.labels
    .filter((label) => label.owner instanceof INode)
    .forEach((label) => {
      // sets the label size based on the selected value of the corresponding text-field
      if (cityLabelStyle && cityLabelStyle.innerLabelStyle) {
        graph.setStyle(label, label.tag ? pinnedCityLabelStyle : cityLabelStyle)
      }
    })

  graph.nodeDefaults.labels.style = cityLabelStyle
  graphComponent.invalidate()
  await placeLabels()
}

run().then(finishLoading)
