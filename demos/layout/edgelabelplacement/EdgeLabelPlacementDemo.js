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
import {
  DefaultLabelStyle,
  EdgeRouter,
  EdgeRouterScope,
  FixNodeLayoutStage,
  FreeEdgeLabelModel,
  GenericLabeling,
  Geom,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicLayout,
  ICommand,
  IGraph,
  ILabel,
  LabelAngleOnRightSideOffsets,
  LabelAngleOnRightSideRotations,
  LabelAngleReferences,
  LabelPlacements,
  LabelSideReferences,
  LayoutExecutor,
  LayoutGraphAdapter,
  LayoutOrientation,
  License,
  MinimumNodeSizeStage,
  OrthogonalLayout,
  PreferredPlacementDescriptor,
  Size,
  TreeLayout,
  TreeReductionStage
} from 'yfiles'

import { DemoEdgeStyle, DemoNodeStyle } from '../../resources/demo-styles.js'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/**
 * The graph component.
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * The graph that contains the labels.
 * @type {IGraph}
 */
let graph = null

/**
 * The mapper which provides a PreferredPlacementDescriptor for each edge label.
 * This mapper is used by the layout algorithms to consider the preferred placement for the edge labels.
 * @type {IMapper.<ILabel,PreferredPlacementDescriptor>}
 */
let descriptorMapper = null

/**
 * Flag to prevent re-entrant layouts.
 * @type {boolean}
 */
let layouting = false

/**
 * This demo shows how to influence the placement of edge labels by a generic labeling algorithm as well as by a
 * layout algorithm with integrated edge labeling using a PreferredPlacementDescriptor.
 */
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')
  graph = graphComponent.graph

  registerCommands()

  initializeGraph()
  initializeStyles()
  initializeInputMode()

  initializeOptions()
  initializeLayoutComboBox()

  createSampleGraph()

  showApp(graphComponent)
}

/**
 * Does the label placement using the selected labeling/layout algorithm. Before this, the
 * PreferredPlacementDescriptor of the labels is set according to the option handlers settings.
 * @see {@link #updateLabelProperties}
 * @param {boolean} fitViewToContent Whether to animate the viewport
 */
async function doLayout(fitViewToContent) {
  if (!layouting) {
    layouting = true
    setUIDisabled(true)

    // retrieve current labeling/layout algorithm from the combo-box
    const layoutComboBox = document.getElementById('layoutComboBox')
    const layoutAlgorithm = layoutComboBox.options[layoutComboBox.selectedIndex].myValue

    // initialize layout executor
    const layout = new MinimumNodeSizeStage(new FixNodeLayoutStage(layoutAlgorithm))
    const layoutExecutor = new LayoutExecutor({
      graphComponent,
      layout,
      duration: '0.5s',
      animateViewport: fitViewToContent
    })

    // apply layout
    try {
      await layoutExecutor.start()
    } catch (error) {
      if (typeof window.reportError === 'function') {
        window.reportError(error)
      } else {
        throw error
      }
    } finally {
      layouting = false
      setUIDisabled(false)
    }
  }
}

/**
 * Disables the HTML elements of the UI and the input mode.
 *
 * @param disabled true if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  document.getElementById('layoutButton').disabled = disabled
  document.getElementById('layoutComboBox').disabled = disabled
}

/**
 * Called whenever a property of the option handler has changed.
 * @param source The HTMLElement that reported a change.
 */
function onLabelPropertyChanged(source) {
  updateLabelValues(getAffectedLabels(), source)
  doLayout(false)
}

/**
 * Updates the PreferredPlacementDescriptors for all affected labels.
 * Affected labels are part of the selection or all labels if no label is selected.
 * @param {IEnumerable.<ILabel>} labels The affected labels.
 * @param source The HTMLElement that reported a change.
 */
function updateLabelValues(labels, source) {
  if (descriptorMapper === null) {
    return
  }

  const labelTextArea = document.getElementById('labelTextArea')
  const distanceToEdgeNumberField = document.getElementById('distanceToEdgeNumberField')
  const angleNumberField = document.getElementById('angleNumberField')
  const placementAlongEdgeComboBox = document.getElementById('placementAlongEdgeComboBox')
  const placementSideOfEdgeComboBox = document.getElementById('placementSideOfEdgeComboBox')
  const sideReferenceComboBox = document.getElementById('sideReferenceComboBox')
  const angleReferenceComboBox = document.getElementById('angleReferenceComboBox')
  const angleRotationComboBox = document.getElementById('angleRotationComboBox')
  const add180CheckBox = document.getElementById('add180CheckBox')

  labels.forEach(edgeLabel => {
    const oldDescriptor = descriptorMapper.get(edgeLabel)
    const descriptor = new PreferredPlacementDescriptor(oldDescriptor)

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
 * @param {IEnumerable.<ILabel>} labels The affected labels.
 */
function updateLabelProperties(labels) {
  if (descriptorMapper === null) {
    return
  }

  let valuesUndefined = true
  let text = null
  let /** @type {LabelPlacements} */ placement = null
  let /** @type {LabelPlacements} */ side = null
  let /** @type {LabelSideReferences} */ sideReference = null
  let angle = null
  let /** @type {LabelAngleReferences} */ angleReference = null
  let /** @type {LabelAngleOnRightSideRotations} */ angleRotation = null
  let hasAngleOffset = null
  let distance = null

  const labelsArray = labels.toArray()
  for (let i = 0; i < labelsArray.length; i++) {
    const label = labelsArray[i]
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
  const labelTextArea = document.getElementById('labelTextArea')
  labelTextArea.value = text !== null ? text : ''

  const distanceToEdgeNumberField = document.getElementById('distanceToEdgeNumberField')
  distanceToEdgeNumberField.value = distance !== null ? distance.toString() : ''

  const angleNumberField = document.getElementById('angleNumberField')
  angleNumberField.value = angle !== null ? Geom.toDegrees(angle).toString() : ''

  const add180CheckBox = document.getElementById('add180CheckBox')
  add180CheckBox.checked = hasAngleOffset === null ? false : hasAngleOffset

  const placementAlongEdgeComboBox = document.getElementById('placementAlongEdgeComboBox')
  placementAlongEdgeComboBox.selectedIndex =
    placement !== null ? getIndex(placementAlongEdgeComboBox, placement) : -1

  const placementSideOfEdgeComboBox = document.getElementById('placementSideOfEdgeComboBox')
  placementSideOfEdgeComboBox.selectedIndex =
    side !== null ? getIndex(placementSideOfEdgeComboBox, side) : -1

  const sideReferenceComboBox = document.getElementById('sideReferenceComboBox')
  sideReferenceComboBox.selectedIndex =
    sideReference !== null ? getIndex(sideReferenceComboBox, sideReference) : -1

  const angleReferenceComboBox = document.getElementById('angleReferenceComboBox')
  angleReferenceComboBox.selectedIndex =
    angleReference !== null ? getIndex(angleReferenceComboBox, angleReference) : -1

  const angleRotationComboBox = document.getElementById('angleRotationComboBox')
  angleRotationComboBox.selectedIndex =
    angleRotation !== null ? getIndex(angleRotationComboBox, angleRotation) : -1
}

/**
 * Retrieves the index for the given option in the combo-box.
 * @param comboBox The combo-box that contains the given option.
 * @param value The value of the option for which the index is needed.
 * @return {number}
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
 * Binds the commands to the buttons of the toolbar and the input elements of the option handler.
 */
function registerCommands() {
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='Layout']", () => doLayout(true))
  bindChangeListener("select[data-command='SelectLayout']", () => doLayout(true))
  bindAction("button[data-command='PlacementAlongEdgeChanged']", () =>
    onLabelPropertyChanged(document.getElementById('placementAlongEdgeChanged'))
  )
  bindAction("button[data-command='PlacementSideOfEdgeChanged']", () =>
    onLabelPropertyChanged(document.getElementById('placementSideOfEdgeComboBox'))
  )
  bindAction("button[data-command='SideReferenceChanged']", () =>
    onLabelPropertyChanged(document.getElementById('sideReferenceComboBox'))
  )
  bindAction("button[data-command='AngleReferenceChanged']", () =>
    onLabelPropertyChanged(document.getElementById('angleReferenceComboBox'))
  )
  bindAction("button[data-command='AngleRotationChanged']", () =>
    onLabelPropertyChanged(document.getElementById('angleRotationComboBox'))
  )
  document.getElementById('distanceToEdgeNumberField').addEventListener(
    'change',
    input => {
      if (input.target.value > 200) {
        alert('Distance cannot be larger than 200.')
        input.target.value = -1
      }
    },
    false
  )
  document.getElementById('angleNumberField').addEventListener(
    'change',
    input => {
      const angle = input.target.value
      if (angle <= -360 || angle >= 360) {
        input.target.value = angle % 360
      }
    },
    false
  )
}

/**
 * Adds mappers and label edit listeners to the graph.
 */
function initializeGraph() {
  // the mapper for the preferred placement information
  descriptorMapper = graph.mapperRegistry.createMapper(
    ILabel.$class,
    PreferredPlacementDescriptor.$class,
    LayoutGraphAdapter.EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY
  )

  // fix node port stage is used to keep the bounding box of the graph in the view port
  graph.mapperRegistry.createConstantMapper(FixNodeLayoutStage.FIXED_NODE_DP_KEY, true)

  // add preferred placement information to each new label
  graph.addLabelAddedListener((source, event) => {
    descriptorMapper.set(event.item, new PreferredPlacementDescriptor())
  })
  graph.addLabelRemovedListener((source, event) => {
    descriptorMapper.delete(event.item)
  })

  graph.undoEngineEnabled = true
}

/**
 * Initializes node, edge and label styles that are applied when the graph is created.
 */
function initializeStyles() {
  graph.nodeDefaults.style = new DemoNodeStyle()
  graph.nodeDefaults.size = new Size(50, 30)

  graph.edgeDefaults.style = new DemoEdgeStyle()
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

  // the label style indicates the label's borders and does not auto-flip to show the actual placement
  graph.edgeDefaults.labels.style = new DefaultLabelStyle({
    backgroundStroke: 'lightblue',
    backgroundFill: 'rgba(255, 255, 255, 0.5)',
    autoFlip: false,
    insets: [3, 5, 3, 5]
  })
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
  const placementAlongEdgeComboBox = document.getElementById('placementAlongEdgeComboBox')
  addOption(placementAlongEdgeComboBox, 'AtCenter', LabelPlacements.AT_CENTER)
  addOption(placementAlongEdgeComboBox, 'AtSource', LabelPlacements.AT_SOURCE)
  addOption(placementAlongEdgeComboBox, 'AtTarget', LabelPlacements.AT_TARGET)
  addOption(placementAlongEdgeComboBox, 'Anywhere', LabelPlacements.ANYWHERE)
  addOption(placementAlongEdgeComboBox, 'AtSourcePort', LabelPlacements.AT_SOURCE_PORT)
  addOption(placementAlongEdgeComboBox, 'AtTargetPort', LabelPlacements.AT_TARGET_PORT)
  placementAlongEdgeComboBox.addEventListener('change', event =>
    onLabelPropertyChanged(placementAlongEdgeComboBox)
  )
  placementAlongEdgeComboBox.selectedIndex = 0

  const placementSideOfEdgeComboBox = document.getElementById('placementSideOfEdgeComboBox')
  addOption(placementSideOfEdgeComboBox, 'RightOfEdge', LabelPlacements.RIGHT_OF_EDGE)
  addOption(placementSideOfEdgeComboBox, 'OnEdge', LabelPlacements.ON_EDGE)
  addOption(placementSideOfEdgeComboBox, 'LeftOfEdge', LabelPlacements.LEFT_OF_EDGE)
  addOption(placementSideOfEdgeComboBox, 'Anywhere', LabelPlacements.ANYWHERE)
  placementSideOfEdgeComboBox.addEventListener('change', event =>
    onLabelPropertyChanged(placementSideOfEdgeComboBox)
  )
  placementSideOfEdgeComboBox.selectedIndex = 1

  const sideReferenceComboBox = document.getElementById('sideReferenceComboBox')
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
  sideReferenceComboBox.addEventListener('change', event =>
    onLabelPropertyChanged(sideReferenceComboBox)
  )
  sideReferenceComboBox.selectedIndex = 0

  const angleReferenceComboBox = document.getElementById('angleReferenceComboBox')
  addOption(
    angleReferenceComboBox,
    'RelativeToEdgeFlow',
    LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
  )
  addOption(angleReferenceComboBox, 'Absolute', LabelAngleReferences.ABSOLUTE)
  angleReferenceComboBox.addEventListener('change', event =>
    onLabelPropertyChanged(angleReferenceComboBox)
  )
  angleReferenceComboBox.selectedIndex = 1

  const angleRotationComboBox = document.getElementById('angleRotationComboBox')
  addOption(angleRotationComboBox, 'Clockwise', LabelAngleOnRightSideRotations.CLOCKWISE)
  addOption(
    angleRotationComboBox,
    'CounterClockwise',
    LabelAngleOnRightSideRotations.COUNTER_CLOCKWISE
  )
  angleRotationComboBox.addEventListener('change', event =>
    onLabelPropertyChanged(angleRotationComboBox)
  )
  angleRotationComboBox.selectedIndex = 0

  const labelTextArea = document.getElementById('labelTextArea')
  labelTextArea.addEventListener('change', event => onLabelPropertyChanged(labelTextArea))
  labelTextArea.value = 'Label'

  const distanceToEdgeNumberField = document.getElementById('distanceToEdgeNumberField')
  distanceToEdgeNumberField.addEventListener('change', event =>
    onLabelPropertyChanged(distanceToEdgeNumberField)
  )
  distanceToEdgeNumberField.value = '5.00'

  const angleNumberField = document.getElementById('angleNumberField')
  angleNumberField.addEventListener('change', event => onLabelPropertyChanged(angleNumberField))
  angleNumberField.value = '0.00'

  const add180CheckBox = document.getElementById('add180CheckBox')
  add180CheckBox.addEventListener('change', event => onLabelPropertyChanged(add180CheckBox))
  add180CheckBox.checked = false
}

/**
 * Initializes the layout combo-box with a selection of layout algorithms.
 */
function initializeLayoutComboBox() {
  const layoutComboBox = document.getElementById('layoutComboBox')
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
  addOption(layoutComboBox, 'Generic Tree', createGenericTreeLayout())
  addOption(layoutComboBox, 'Orthogonal', createOrthogonalLayout())

  layoutComboBox.selectedIndex = 0
}

/**
 * Creates a configured HierarchicLayout.
 * @param {LayoutOrientation} layoutOrientation
 * @return {HierarchicLayout}
 */
function createHierarchicLayout(layoutOrientation) {
  const layout = new HierarchicLayout()
  layout.integratedEdgeLabeling = true
  layout.layoutOrientation = layoutOrientation

  disableAutoFlipping(layout)
  return layout
}

/** @return {ILayoutAlgorithm} */
function createGenericTreeLayout() {
  const reductionStage = new TreeReductionStage()
  const labelingAlgorithm = new GenericLabeling()
  labelingAlgorithm.affectedLabelsDpKey = 'AFFECTED_LABELS'
  reductionStage.nonTreeEdgeLabelingAlgorithm = labelingAlgorithm
  reductionStage.nonTreeEdgeLabelSelectionKey = labelingAlgorithm.affectedLabelsDpKey
  const edgeRouter = new EdgeRouter()
  edgeRouter.scope = EdgeRouterScope.ROUTE_AFFECTED_EDGES
  reductionStage.nonTreeEdgeRouter = edgeRouter
  reductionStage.nonTreeEdgeSelectionKey = edgeRouter.affectedEdgesDpKey

  const layout = new TreeLayout()
  layout.integratedEdgeLabeling = true

  layout.prependStage(reductionStage)
  disableAutoFlipping(layout)
  return layout
}

/** @return {ILayoutAlgorithm} */
function createOrthogonalLayout() {
  const layout = new OrthogonalLayout()
  layout.integratedEdgeLabeling = true

  disableAutoFlipping(layout)
  return layout
}

/**
 * Disables auto-flipping for labels on the layout algorithm since the result could differ from the values in the
 * PreferredPlacementDescriptor.
 * @param multiStageLayout The current layout algorithm.
 */
function disableAutoFlipping(multiStageLayout) {
  const labelLayoutTranslator = multiStageLayout.labeling
  labelLayoutTranslator.autoFlipping = false
}

/**
 * @param {HTMLElement} comboBox
 * @param {string} text
 * @param {object} value
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
 * @return {IEnumerable.<ILabel>}
 */
function getAffectedLabels() {
  const selectedLabels = graphComponent.selection.selectedLabels
  return selectedLabels.size > 0 ? selectedLabels : graph.edgeLabels
}

loadJson().then(run)
