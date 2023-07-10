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
  EdgeRouter,
  EdgeRouterScope,
  FixNodeLayoutData,
  FixNodeLayoutStage,
  FreeEdgeLabelModel,
  GenericLabeling,
  GenericLayoutData,
  Geom,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicLayout,
  LabelAngleOnRightSideOffsets,
  LabelAngleOnRightSideRotations,
  LabelAngleReferences,
  LabelPlacements,
  LabelSideReferences,
  LayoutExecutor,
  LayoutGraphAdapter,
  LayoutKeys,
  LayoutOrientation,
  License,
  Mapper,
  MinimumNodeSizeStage,
  OrganicLayout,
  OrthogonalLayout,
  PreferredPlacementDescriptor,
  Size,
  TreeLayout,
  TreeReductionStage
} from 'yfiles'

import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'

/**
 * @typedef {*} EdgeLabelPlacementOption
 */

/**
 * The graph component.
 * @type {GraphComponent}
 */
let graphComponent

/**
 * The graph that contains the labels.
 * @type {IGraph}
 */
let graph

/**
 * The mapper which provides a PreferredPlacementDescriptor for each edge label.
 * This mapper is used by the layout algorithms to consider the preferred placement for the edge labels.
 * @type {Mapper.<ILabel,PreferredPlacementDescriptor>}
 */
let descriptorMapper

// init UI elements
const layoutComboBox = document.querySelector('#algorithm-select-box')
const layoutButton = document.querySelector('#layout-button')
const labelTextArea = document.querySelector('#label-textarea')
const distanceToEdgeNumberField = document.querySelector('#distance-to-edge-number-field')
const angleNumberField = document.querySelector('#angle-number-field')
const placementAlongEdgeComboBox = document.querySelector('#placement-along-edge-combobox')
const placementSideOfEdgeComboBox = document.querySelector('#placement-side-of-edge-combobox')
const sideReferenceComboBox = document.querySelector('#side-reference-combobox')
const angleReferenceComboBox = document.querySelector('#angle-reference-combobox')
const angleRotationComboBox = document.querySelector('#angle-rotation-combobox')
const add180CheckBox = document.querySelector('#add-180-checkbox')

/**
 * This demo shows how to place edge labels using {@link PreferredPlacementDescriptor} together
 * with a generic labeling algorithm or a layout algorithm that supports integrated edge labeling.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  graph = graphComponent.graph

  descriptorMapper = new Mapper()

  initializeUI()

  initializeGraph()
  initializeStyles()
  initializeInputMode()

  initializeOptions()
  initializeLayoutComboBox()

  createSampleGraph()

  graph.undoEngineEnabled = true
}

/**
 * Does the label placement using the selected labeling/layout algorithm. Before this, the
 * PreferredPlacementDescriptor of the labels is set according to the option handlers settings.
 * @see {@link updateLabelProperties}
 * @param {boolean} fitViewToContent Whether to animate the viewport
 * @returns {!Promise}
 */
async function doLayout(fitViewToContent) {
  const waitInputMode = graphComponent.inputMode.waitInputMode
  if (waitInputMode.waiting) {
    return
  }

  setUIDisabled(true)

  // retrieve current labeling/layout algorithm from the combo-box
  const layout = layoutComboBox.options[layoutComboBox.selectedIndex].myValue

  // provide preferred placement data to the layout algorithm
  const layoutData = new GenericLayoutData({
    labelItemMappings: [
      [LayoutGraphAdapter.EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY, descriptorMapper]
    ]
  })

  // fix node port stage is used to keep the bounding box of the graph in the view port
  layoutData.combineWith(new FixNodeLayoutData({ fixedNodes: () => true }))

  // initialize layout executor
  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: new MinimumNodeSizeStage(new FixNodeLayoutStage(layout)),
    layoutData,
    duration: '0.5s',
    animateViewport: fitViewToContent
  })

  // apply layout
  try {
    await layoutExecutor.start()
  } finally {
    setUIDisabled(false)
  }
}

/**
 * Disables the HTML elements of the UI and the input mode.
 *
 * @param {boolean} disabled true if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  graphComponent.inputMode.waitInputMode.waiting = disabled
  layoutButton.disabled = disabled
  layoutComboBox.disabled = disabled
}

/**
 * Called whenever a property of the option handler has changed.
 * @param {!HTMLElement} source The HTMLElement that reported a change.
 */
function onLabelPropertyChanged(source) {
  updateLabelValues(getAffectedLabels(), source)
  void doLayout(false)
}

/**
 * Updates the PreferredPlacementDescriptors for all affected labels.
 * Affected labels are part of the selection or all labels if no label is selected.
 * @param {!IEnumerable.<ILabel>} labels The affected labels.
 * @param {!HTMLElement} source The HTMLElement that reported a change.
 */
function updateLabelValues(labels, source) {
  labels.forEach(edgeLabel => {
    const oldDescriptor = descriptorMapper.get(edgeLabel)
    const descriptor = oldDescriptor
      ? new PreferredPlacementDescriptor(oldDescriptor)
      : new PreferredPlacementDescriptor()

    if (source === labelTextArea) {
      graph.setLabelText(edgeLabel, labelTextArea.value)
    }
    if (source === placementAlongEdgeComboBox && placementAlongEdgeComboBox.selectedIndex !== -1) {
      descriptor.placeAlongEdge =
        placementAlongEdgeComboBox.options[placementAlongEdgeComboBox.selectedIndex].myValue
    }
    if (
      source === placementSideOfEdgeComboBox &&
      placementSideOfEdgeComboBox.selectedIndex !== -1
    ) {
      descriptor.sideOfEdge =
        placementSideOfEdgeComboBox.options[placementSideOfEdgeComboBox.selectedIndex].myValue
    }
    if (source === sideReferenceComboBox && sideReferenceComboBox.selectedIndex !== -1) {
      descriptor.sideReference =
        sideReferenceComboBox.options[sideReferenceComboBox.selectedIndex].myValue
    }
    if (source === angleReferenceComboBox && angleReferenceComboBox.selectedIndex !== -1) {
      descriptor.angleReference =
        angleReferenceComboBox.options[angleReferenceComboBox.selectedIndex].myValue
    }
    if (source === angleRotationComboBox && angleRotationComboBox.selectedIndex !== -1) {
      descriptor.angleRotationOnRightSide =
        angleRotationComboBox.options[angleRotationComboBox.selectedIndex].myValue
    }
    if (source === add180CheckBox) {
      descriptor.angleOffsetOnRightSide = add180CheckBox.checked
        ? LabelAngleOnRightSideOffsets.SEMI
        : LabelAngleOnRightSideOffsets.NONE
    }
    if (source === angleNumberField) {
      const v = parseFloat(angleNumberField.value)
      if (!isNaN(v)) {
        descriptor.angle = Geom.toRadians(v)
      }
    }
    if (source === distanceToEdgeNumberField) {
      const v = parseFloat(distanceToEdgeNumberField.value)
      if (!isNaN(v)) {
        descriptor.distanceToEdge = v
      }
    }

    // change descriptor if there was a change
    if (!descriptor.equals(oldDescriptor)) {
      descriptorMapper.set(edgeLabel, descriptor)
    }
  })
}

/**
 * Updates the properties in the option handler when the selection has changed.
 * The options show the descriptor values for all selected labels or nothing if the values do not match.
 * @param {!IEnumerable.<ILabel>} labels The affected labels.
 */
function updateLabelProperties(labels) {
  let valuesUndefined = true
  let text = null
  let placement = null
  let side = null
  let sideReference = null
  let angle = null
  let angleReference = null
  let angleRotation = null
  let hasAngleOffset = null
  let distance = null

  for (const label of labels) {
    const descriptor = descriptorMapper.get(label)
    if (valuesUndefined) {
      text = label.text
      placement = descriptor.placeAlongEdge
      side = descriptor.sideOfEdge
      sideReference = descriptor.sideReference
      angle = descriptor.angle
      angleReference = descriptor.angleReference
      angleRotation = descriptor.angleRotationOnRightSide
      hasAngleOffset = descriptor.isAngleOffsetOnRightSide180
      distance = descriptor.distanceToEdge
      valuesUndefined = false
    } else {
      if (text !== null && text !== label.text) {
        text = null
      }
      if (placement !== null && placement !== descriptor.placeAlongEdge) {
        placement = null
      }
      if (side !== null && side !== descriptor.sideOfEdge) {
        side = null
      }
      if (sideReference !== null && sideReference !== descriptor.sideReference) {
        sideReference = null
      }
      if (angle !== null && angle !== descriptor.angle) {
        angle = null
      }
      if (angleReference !== null && angleReference !== descriptor.angleReference) {
        angleReference = null
      }
      if (angleRotation !== null && angleRotation !== descriptor.angleRotationOnRightSide) {
        angleRotation = null
      }
      if (hasAngleOffset !== null && hasAngleOffset !== descriptor.isAngleOffsetOnRightSide180) {
        hasAngleOffset = null
      }
      if (distance !== null && distance !== descriptor.distanceToEdge) {
        distance = null
      }

      if (
        text === null &&
        placement === null &&
        side === null &&
        sideReference === null &&
        angle === null &&
        angleReference === null &&
        angleRotation === null &&
        distance === 0
      ) {
        break
      }
    }
  }

  // If, for a single property, there are multiple values present in the set of selected edge labels, the
  // respective option item is set to indicate an "undefined value" state.
  labelTextArea.value = text !== null ? text : ''

  distanceToEdgeNumberField.value = distance !== null ? distance.toString() : ''

  angleNumberField.value = angle !== null ? Geom.toDegrees(angle).toString() : ''

  add180CheckBox.checked = hasAngleOffset === null ? false : hasAngleOffset

  placementAlongEdgeComboBox.selectedIndex =
    placement !== null ? getIndex(placementAlongEdgeComboBox, placement) : -1

  placementSideOfEdgeComboBox.selectedIndex =
    side !== null ? getIndex(placementSideOfEdgeComboBox, side) : -1

  sideReferenceComboBox.selectedIndex =
    sideReference !== null ? getIndex(sideReferenceComboBox, sideReference) : -1

  angleReferenceComboBox.selectedIndex =
    angleReference !== null ? getIndex(angleReferenceComboBox, angleReference) : -1

  angleRotationComboBox.selectedIndex =
    angleRotation !== null ? getIndex(angleRotationComboBox, angleRotation) : -1
}

/**
 * Retrieves the index for the given option in the combo-box.
 * @param {!HTMLSelectElement} comboBox The combo-box that contains the given option.
 * @param {!(ILayoutAlgorithm|LabelPlacements|LabelSideReferences|LabelAngleReferences|LabelAngleOnRightSideRotations)} value The value of the option for which the index is needed.
 * @returns {number}
 */
function getIndex(comboBox, value) {
  const options = comboBox.options
  for (let i = 0; i < options.length; i++) {
    const option = options[i]
    if (option.myValue === value) {
      return i
    }
  }
  return -1
}

/**
 * Binds the actions to the buttons of the toolbar and the input elements of the option handler.
 */
function initializeUI() {
  addNavigationButtons(layoutComboBox)

  layoutButton.addEventListener('click', () => doLayout(true))
  layoutComboBox.addEventListener('change', () => doLayout(true))
  placementAlongEdgeComboBox.addEventListener('change', () =>
    onLabelPropertyChanged(placementAlongEdgeComboBox)
  )
  placementSideOfEdgeComboBox.addEventListener('change', () =>
    onLabelPropertyChanged(placementSideOfEdgeComboBox)
  )
  sideReferenceComboBox.addEventListener('change', () =>
    onLabelPropertyChanged(sideReferenceComboBox)
  )
  angleReferenceComboBox.addEventListener('change', () =>
    onLabelPropertyChanged(angleReferenceComboBox)
  )
  angleRotationComboBox.addEventListener('change', () =>
    onLabelPropertyChanged(angleRotationComboBox)
  )

  distanceToEdgeNumberField.addEventListener(
    'change',
    input => {
      if (parseFloat(input.target.value) > 200) {
        alert('Distance cannot be larger than 200.')
        input.target.value = '-1'
      }
    },
    false
  )
  angleNumberField.addEventListener(
    'change',
    input => {
      const angle = parseFloat(input.target.value)
      if (angle <= -360 || angle >= 360) {
        input.target.value = `${angle % 360}`
      }
    },
    false
  )
}

/**
 * Adds label listeners to the graph which ensure that each label has an associated preferred
 * placement descriptor.
 */
function initializeGraph() {
  // add preferred placement information to each new label
  graph.addLabelAddedListener((source, event) => {
    descriptorMapper.set(event.item, new PreferredPlacementDescriptor())
  })
  graph.addLabelRemovedListener((source, event) => {
    descriptorMapper.delete(event.item)
  })
}

/**
 * Initializes node, edge and label styles that are applied when the graph is created.
 */
function initializeStyles() {
  initDemoStyles(graph)
  graph.nodeDefaults.size = new Size(50, 30)

  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()
}

/**
 * Configures the input mode such that only labels can be added/removed to the graph.
 * Also, selecting labels will trigger an update of the option handler.
 */
function initializeInputMode() {
  const inputMode = new GraphEditorInputMode({
    allowCreateEdge: false,
    allowCreateNode: false,
    allowCreateBend: false,
    deletableItems: GraphItemTypes.LABEL,
    marqueeSelectableItems: GraphItemTypes.LABEL,
    selectableItems: GraphItemTypes.LABEL | GraphItemTypes.EDGE,
    focusableItems: GraphItemTypes.NONE
  })

  // update the option handler settings when the selection changes
  inputMode.addMultiSelectionFinishedListener(() => updateLabelProperties(getAffectedLabels()))

  graphComponent.inputMode = inputMode
}

/**
 * Initializes the properties in the option handler with options and default values.
 */
function initializeOptions() {
  addOption(placementAlongEdgeComboBox, 'AtCenter', LabelPlacements.AT_CENTER)
  addOption(placementAlongEdgeComboBox, 'AtSource', LabelPlacements.AT_SOURCE)
  addOption(placementAlongEdgeComboBox, 'AtTarget', LabelPlacements.AT_TARGET)
  addOption(placementAlongEdgeComboBox, 'Anywhere', LabelPlacements.ANYWHERE)
  addOption(placementAlongEdgeComboBox, 'AtSourcePort', LabelPlacements.AT_SOURCE_PORT)
  addOption(placementAlongEdgeComboBox, 'AtTargetPort', LabelPlacements.AT_TARGET_PORT)
  placementAlongEdgeComboBox.addEventListener('change', () =>
    onLabelPropertyChanged(placementAlongEdgeComboBox)
  )
  placementAlongEdgeComboBox.selectedIndex = 0

  addOption(placementSideOfEdgeComboBox, 'RightOfEdge', LabelPlacements.RIGHT_OF_EDGE)
  addOption(placementSideOfEdgeComboBox, 'OnEdge', LabelPlacements.ON_EDGE)
  addOption(placementSideOfEdgeComboBox, 'LeftOfEdge', LabelPlacements.LEFT_OF_EDGE)
  addOption(placementSideOfEdgeComboBox, 'Anywhere', LabelPlacements.ANYWHERE)
  placementSideOfEdgeComboBox.addEventListener('change', () =>
    onLabelPropertyChanged(placementSideOfEdgeComboBox)
  )
  placementSideOfEdgeComboBox.selectedIndex = 1

  addOption(sideReferenceComboBox, 'RelativeToEdgeFlow', LabelSideReferences.RELATIVE_TO_EDGE_FLOW)
  addOption(
    sideReferenceComboBox,
    'AbsoluteWithLeftInNorth',
    LabelSideReferences.ABSOLUTE_WITH_LEFT_IN_NORTH
  )
  addOption(
    sideReferenceComboBox,
    'AbsoluteWithRightInNorth',
    LabelSideReferences.ABSOLUTE_WITH_RIGHT_IN_NORTH
  )
  sideReferenceComboBox.addEventListener('change', () =>
    onLabelPropertyChanged(sideReferenceComboBox)
  )
  sideReferenceComboBox.selectedIndex = 0

  addOption(
    angleReferenceComboBox,
    'RelativeToEdgeFlow',
    LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
  )
  addOption(angleReferenceComboBox, 'Absolute', LabelAngleReferences.ABSOLUTE)
  angleReferenceComboBox.addEventListener('change', () =>
    onLabelPropertyChanged(angleReferenceComboBox)
  )
  angleReferenceComboBox.selectedIndex = 1

  addOption(angleRotationComboBox, 'Clockwise', LabelAngleOnRightSideRotations.CLOCKWISE)
  addOption(
    angleRotationComboBox,
    'CounterClockwise',
    LabelAngleOnRightSideRotations.COUNTER_CLOCKWISE
  )
  angleRotationComboBox.addEventListener('change', () =>
    onLabelPropertyChanged(angleRotationComboBox)
  )
  angleRotationComboBox.selectedIndex = 0

  labelTextArea.addEventListener('change', () => onLabelPropertyChanged(labelTextArea))
  labelTextArea.value = 'Label'

  distanceToEdgeNumberField.addEventListener('change', () =>
    onLabelPropertyChanged(distanceToEdgeNumberField)
  )
  distanceToEdgeNumberField.value = '5.00'

  angleNumberField.addEventListener('change', () => onLabelPropertyChanged(angleNumberField))
  angleNumberField.value = '0.00'

  add180CheckBox.addEventListener('change', () => onLabelPropertyChanged(add180CheckBox))
  add180CheckBox.checked = false
}

/**
 * Initializes the layout combo-box with a selection of layout algorithms.
 */
function initializeLayoutComboBox() {
  addOption(layoutComboBox, 'Generic Edge Labeling', new GenericLabeling())
  addOption(
    layoutComboBox,
    'Hierarchic, Top to Bottom',
    createHierarchicLayout(LayoutOrientation.TOP_TO_BOTTOM)
  )
  addOption(
    layoutComboBox,
    'Hierarchic, Left to Right',
    createHierarchicLayout(LayoutOrientation.LEFT_TO_RIGHT)
  )
  addOption(layoutComboBox, 'Organic', createOrganicLayout())
  addOption(layoutComboBox, 'Generic Tree', createGenericTreeLayout())
  addOption(layoutComboBox, 'Orthogonal', createOrthogonalLayout())

  layoutComboBox.selectedIndex = 0
}

/**
 * Creates a configured HierarchicLayout.
 * @param {!LayoutOrientation} layoutOrientation
 * @returns {!HierarchicLayout}
 */
function createHierarchicLayout(layoutOrientation) {
  const layout = new HierarchicLayout()
  layout.integratedEdgeLabeling = true
  layout.layoutOrientation = layoutOrientation

  disableAutoFlipping(layout)
  return layout
}

/**
 * @returns {!ILayoutAlgorithm}
 */
function createGenericTreeLayout() {
  const reductionStage = new TreeReductionStage()

  const affectedLabelsKey = 'AFFECTED_LABELS'
  const labelingAlgorithm = new GenericLabeling()
  labelingAlgorithm.affectedLabelsDpKey = affectedLabelsKey
  reductionStage.nonTreeEdgeLabelingAlgorithm = labelingAlgorithm
  reductionStage.nonTreeEdgeLabelSelectionKey = affectedLabelsKey

  const affectedEdgesKey = LayoutKeys.AFFECTED_EDGES_DP_KEY
  const edgeRouter = new EdgeRouter()
  edgeRouter.affectedEdgesDpKey = affectedEdgesKey
  edgeRouter.scope = EdgeRouterScope.ROUTE_AFFECTED_EDGES
  reductionStage.nonTreeEdgeRouter = edgeRouter
  reductionStage.nonTreeEdgeSelectionKey = affectedEdgesKey

  const layout = new TreeLayout()
  layout.integratedEdgeLabeling = true

  layout.prependStage(reductionStage)
  disableAutoFlipping(layout)
  return layout
}

/**
 * @returns {!ILayoutAlgorithm}
 */
function createOrthogonalLayout() {
  const layout = new OrthogonalLayout()
  layout.integratedEdgeLabeling = true

  disableAutoFlipping(layout)
  return layout
}

/**
 * @returns {!ILayoutAlgorithm}
 */
function createOrganicLayout() {
  const layout = new OrganicLayout()
  layout.integratedEdgeLabeling = true
  layout.deterministic = true
  layout.preferredEdgeLength = 60
  layout.minimumNodeDistance = 20

  disableAutoFlipping(layout)
  return layout
}

/**
 * Disables auto-flipping for labels on the layout algorithm since the result could differ from the values in the
 * PreferredPlacementDescriptor.
 * @param {!MultiStageLayout} multiStageLayout The current layout algorithm.
 */
function disableAutoFlipping(multiStageLayout) {
  const labelLayoutTranslator = multiStageLayout.labeling
  labelLayoutTranslator.autoFlipping = false
}

/**
 * @param {!HTMLSelectElement} comboBox
 * @param {!string} text
 * @param {!(ILayoutAlgorithm|LabelPlacements|LabelSideReferences|LabelAngleReferences|LabelAngleOnRightSideRotations)} value
 */
function addOption(comboBox, text, value) {
  const option = document.createElement('option')
  option.text = text
  option.myValue = value
  comboBox.add(option)
}

/**
 * Creates a graph with labels at each edge and an initial layout.
 */
function createSampleGraph() {
  // create nodes
  const nodes = []
  for (let i = 0; i < 29; i++) {
    nodes.push(graph.createNode())
  }

  // create edges
  const edges = []
  edges.push(graph.createEdge(nodes[0], nodes[3]))
  edges.push(graph.createEdge(nodes[4], nodes[0]))
  edges.push(graph.createEdge(nodes[0], nodes[4]))
  edges.push(graph.createEdge(nodes[0], nodes[4]))
  edges.push(graph.createEdge(nodes[0], nodes[6]))
  edges.push(graph.createEdge(nodes[0], nodes[6]))
  edges.push(graph.createEdge(nodes[1], nodes[7]))
  edges.push(graph.createEdge(nodes[1], nodes[9]))
  edges.push(graph.createEdge(nodes[2], nodes[9]))
  edges.push(graph.createEdge(nodes[4], nodes[10]))
  edges.push(graph.createEdge(nodes[5], nodes[10]))
  edges.push(graph.createEdge(nodes[5], nodes[11]))
  edges.push(graph.createEdge(nodes[5], nodes[26]))
  edges.push(graph.createEdge(nodes[6], nodes[12]))
  edges.push(graph.createEdge(nodes[12], nodes[6]))
  edges.push(graph.createEdge(nodes[6], nodes[13]))
  edges.push(graph.createEdge(nodes[7], nodes[13]))
  edges.push(graph.createEdge(nodes[8], nodes[13]))
  edges.push(graph.createEdge(nodes[8], nodes[16]))
  edges.push(graph.createEdge(nodes[9], nodes[17]))
  edges.push(graph.createEdge(nodes[11], nodes[18]))
  edges.push(graph.createEdge(nodes[13], nodes[19]))
  edges.push(graph.createEdge(nodes[14], nodes[19]))
  edges.push(graph.createEdge(nodes[15], nodes[19]))
  edges.push(graph.createEdge(nodes[16], nodes[20]))
  edges.push(graph.createEdge(nodes[16], nodes[21]))
  edges.push(graph.createEdge(nodes[18], nodes[22]))
  edges.push(graph.createEdge(nodes[19], nodes[23]))
  edges.push(graph.createEdge(nodes[19], nodes[25]))
  edges.push(graph.createEdge(nodes[22], nodes[26]))
  edges.push(graph.createEdge(nodes[23], nodes[27]))
  edges.push(graph.createEdge(nodes[24], nodes[27]))
  edges.push(graph.createEdge(nodes[24], nodes[28]))

  // add labels
  edges.forEach((edge, i) => {
    graph.addLabel(edge, 'Label')
    if (i === 8 || i === 29) {
      graph.addLabel(edge, 'Label')
      graph.addLabel(edge, 'Label')
    }
  })

  // initial layout and label placement
  const layout = new HierarchicLayout()
  layout.integratedEdgeLabeling = true
  const labeling = new GenericLabeling()
  labeling.coreLayout = layout
  graph.applyLayout(labeling)
  graphComponent.fitGraphBounds()

  // update option handler
  updateLabelProperties(graph.edgeLabels)
}

/**
 * Returns a collection of labels that are currently affected by option changes.
 * Affected labels are all selected labels or all labels in case no label is selected.
 * @returns {!IEnumerable.<ILabel>}
 */
function getAffectedLabels() {
  const selectedLabels = graphComponent.selection.selectedLabels
  return selectedLabels.size > 0 ? selectedLabels : graph.edgeLabels
}

void run().then(finishLoading)
