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
  EdgeLabelPreferredPlacement,
  EdgeRouter,
  FreeEdgeLabelModel,
  GenericLabeling,
  GenericLabelingData,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicalLayout,
  type IEnumerable,
  type IGraph,
  type ILabel,
  type ILayoutAlgorithm,
  LabelAlongEdgePlacements,
  LabelAngleOnRightSideRotations,
  LabelAngleReferences,
  LabelEdgeSides,
  LabelSideReferences,
  type LabelStyle,
  LayoutAnchoringPolicy,
  LayoutAnchoringStage,
  LayoutAnchoringStageData,
  LayoutExecutor,
  LayoutOrientation,
  License,
  Mapper,
  OrganicLayout,
  OrthogonalLayout,
  Size,
  TreeLayout
} from '@yfiles/yfiles'

import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'
import type { JSONGraph } from '@yfiles/demo-utils/json-model'
import graphData from './graph-data.json'
import { toDegrees, toRadians } from '../../utils/LegacyGeometryUtilities'

type EdgeLabelPlacementOption = {
  text: string
  myValue:
    | ILayoutAlgorithm
    | LabelAlongEdgePlacements
    | LabelEdgeSides
    | LabelSideReferences
    | LabelAngleReferences
    | LabelAngleOnRightSideRotations
} & HTMLOptionElement

/**
 * The graph component.
 */
let graphComponent: GraphComponent

/**
 * The graph that contains the labels.
 */
let graph: IGraph

/**
 * The mapper which provides a PreferredPlacementDescriptor for each edge label.
 * This mapper is used by the layout algorithms to consider the preferred placement for the edge labels.
 */
let descriptorMapper: Mapper<ILabel, EdgeLabelPreferredPlacement>

// init UI elements
const layoutComboBox = document.querySelector<HTMLSelectElement>('#algorithm-select-box')!
const layoutButton = document.querySelector<HTMLButtonElement>('#layout-button')!
const labelTextArea = document.querySelector<HTMLTextAreaElement>('#label-textarea')!
const distanceToEdgeNumberField = document.querySelector<HTMLInputElement>(
  '#distance-to-edge-number-field'
)!
const angleNumberField = document.querySelector<HTMLInputElement>('#angle-number-field')!
const placementAlongEdgeComboBox = document.querySelector<HTMLSelectElement>(
  '#placement-along-edge-combobox'
)!
const placementSideOfEdgeComboBox = document.querySelector<HTMLSelectElement>(
  '#placement-side-of-edge-combobox'
)!
const sideReferenceComboBox = document.querySelector<HTMLSelectElement>('#side-reference-combobox')!
const angleReferenceComboBox = document.querySelector<HTMLSelectElement>(
  '#angle-reference-combobox'
)!
const angleRotationComboBox = document.querySelector<HTMLSelectElement>('#angle-rotation-combobox')!
const add180CheckBox = document.querySelector<HTMLInputElement>('#add-180-checkbox')!

/**
 * This demo shows how to place edge labels using {@link EdgeLabelPreferredPlacement} together
 * with a generic labeling algorithm or a layout algorithm that supports integrated edge labeling.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  graph = graphComponent.graph

  descriptorMapper = new Mapper<ILabel, EdgeLabelPreferredPlacement>()

  initializeUI()

  initializeGraph()
  initializeStyles()
  initializeInputMode()

  initializeOptions()
  initializeLayoutComboBox()

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(createHierarchicalLayout(LayoutOrientation.TOP_TO_BOTTOM))
  await graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id,
    parentId: (item) => item.parentId
  })

  const edgesSource = graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })
  edgesSource.edgeCreator.createLabelsSource((item) => item.labels).labelCreator.textProvider = (
    item
  ): string => item.text

  graphBuilder.buildGraph()
}

/**
 * Does the label placement using the selected labeling/layout algorithm. Before this, the
 * PreferredPlacementDescriptor of the labels is set according to the option handlers settings.
 * @see {@link updateLabelProperties}
 * @param fitViewToContent Whether to animate the viewport
 */
async function doLayout(fitViewToContent: boolean): Promise<void> {
  const waitInputMode = (graphComponent.inputMode as GraphEditorInputMode).waitInputMode
  if (waitInputMode.waiting) {
    return
  }

  setUIDisabled(true)

  // retrieve current labeling/layout algorithm from the combo-box
  const layout = (layoutComboBox.options[layoutComboBox.selectedIndex] as EdgeLabelPlacementOption)
    .myValue as ILayoutAlgorithm

  // provide preferred placement data to the layout algorithm
  const layoutData = new GenericLabelingData({
    edgeLabelPreferredPlacements: (edge) => descriptorMapper.get(edge)!
  })

  // fix node port stage is used to keep the bounding box of the graph in the view port
  layoutData.combineWith(
    new LayoutAnchoringStageData({
      nodeAnchoringPolicies: LayoutAnchoringPolicy.CENTER
    })
  )

  // initialize layout executor
  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: new LayoutAnchoringStage(layout),
    layoutData,
    animationDuration: '0.5s',
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
 * @param disabled true if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled: boolean): void {
  ;(graphComponent.inputMode as GraphEditorInputMode).waitInputMode.waiting = disabled
  layoutButton.disabled = disabled
  layoutComboBox.disabled = disabled
}

/**
 * Called whenever a property of the option handler has changed.
 * @param source The HTMLElement that reported a change.
 */
function onLabelPropertyChanged(source: HTMLElement): void {
  updateLabelValues(getAffectedLabels(), source)
  void doLayout(false)
}

/**
 * Updates the PreferredPlacementDescriptors for all affected labels.
 * Affected labels are part of the selection or all labels if no label is selected.
 * @param labels The affected labels.
 * @param source The HTMLElement that reported a change.
 */
function updateLabelValues(labels: IEnumerable<ILabel>, source: HTMLElement): void {
  labels.forEach((edgeLabel) => {
    const oldDescriptor = descriptorMapper.get(edgeLabel)
    const descriptor = oldDescriptor ?? new EdgeLabelPreferredPlacement()

    if (source === labelTextArea) {
      graph.setLabelText(edgeLabel, labelTextArea.value)
    }
    if (source === placementAlongEdgeComboBox && placementAlongEdgeComboBox.selectedIndex !== -1) {
      descriptor.placementAlongEdge = (
        placementAlongEdgeComboBox.options[
          placementAlongEdgeComboBox.selectedIndex
        ] as EdgeLabelPlacementOption
      ).myValue as LabelAlongEdgePlacements
    }
    if (
      source === placementSideOfEdgeComboBox &&
      placementSideOfEdgeComboBox.selectedIndex !== -1
    ) {
      descriptor.edgeSide = (
        placementSideOfEdgeComboBox.options[
          placementSideOfEdgeComboBox.selectedIndex
        ] as EdgeLabelPlacementOption
      ).myValue as LabelEdgeSides
    }
    if (source === sideReferenceComboBox && sideReferenceComboBox.selectedIndex !== -1) {
      descriptor.sideReference = (
        sideReferenceComboBox.options[
          sideReferenceComboBox.selectedIndex
        ] as EdgeLabelPlacementOption
      ).myValue as LabelSideReferences
    }
    if (source === angleReferenceComboBox && angleReferenceComboBox.selectedIndex !== -1) {
      descriptor.angleReference = (
        angleReferenceComboBox.options[
          angleReferenceComboBox.selectedIndex
        ] as EdgeLabelPlacementOption
      ).myValue as LabelAngleReferences
    }
    if (source === angleRotationComboBox && angleRotationComboBox.selectedIndex !== -1) {
      descriptor.angleRotationOnRightSide = (
        angleRotationComboBox.options[
          angleRotationComboBox.selectedIndex
        ] as EdgeLabelPlacementOption
      ).myValue as LabelAngleOnRightSideRotations
    }
    if (source === add180CheckBox) {
      descriptor.addHalfRotationOnRightSide = add180CheckBox.checked
    }
    if (source === angleNumberField) {
      const v = parseFloat(angleNumberField.value)
      if (!Number.isNaN(v)) {
        descriptor.angle = toRadians(v)
      }
    }
    if (source === distanceToEdgeNumberField) {
      const v = parseFloat(distanceToEdgeNumberField.value)
      if (!Number.isNaN(v)) {
        descriptor.distanceToEdge = v
      }
    }
  })
}

/**
 * Updates the properties in the option handler when the selection has changed.
 * The options show the descriptor values for all selected labels or nothing if the values do not match.
 * @param labels The affected labels.
 */
function updateLabelProperties(labels: IEnumerable<ILabel>): void {
  let valuesUndefined = true
  let text: string | null = null
  let placement: LabelAlongEdgePlacements | null = null
  let side: LabelEdgeSides | null = null
  let sideReference: LabelSideReferences | null = null
  let angle: number | null = null
  let angleReference: LabelAngleReferences | null = null
  let angleRotation: LabelAngleOnRightSideRotations | null = null
  let hasAngleOffset: boolean | null = null
  let distance: number | null = null

  for (const label of labels) {
    const descriptor = descriptorMapper.get(label)! as EdgeLabelPreferredPlacement
    if (valuesUndefined) {
      text = label.text
      placement = descriptor.placementAlongEdge
      side = descriptor.edgeSide
      sideReference = descriptor.sideReference
      angle = descriptor.angle
      angleReference = descriptor.angleReference
      angleRotation = descriptor.angleRotationOnRightSide
      hasAngleOffset = descriptor.addHalfRotationOnRightSide
      distance = descriptor.distanceToEdge
      valuesUndefined = false
    } else {
      if (text && text !== label.text) {
        text = null
      }
      if (placement && placement !== descriptor.placementAlongEdge) {
        placement = null
      }
      if (side && side !== descriptor.edgeSide) {
        side = null
      }
      if (sideReference && sideReference !== descriptor.sideReference) {
        sideReference = null
      }
      if (angle && angle !== descriptor.angle) {
        angle = null
      }
      if (angleReference && angleReference !== descriptor.angleReference) {
        angleReference = null
      }
      if (angleRotation && angleRotation !== descriptor.angleRotationOnRightSide) {
        angleRotation = null
      }
      if (hasAngleOffset && hasAngleOffset !== descriptor.addHalfRotationOnRightSide) {
        hasAngleOffset = null
      }
      if (distance && distance !== descriptor.distanceToEdge) {
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
  labelTextArea.value = text ? text : ''

  distanceToEdgeNumberField.value = distance ? distance.toString() : ''

  angleNumberField.value = angle ? toDegrees(angle).toString() : ''

  add180CheckBox.checked = hasAngleOffset === null ? false : hasAngleOffset

  placementAlongEdgeComboBox.selectedIndex = placement
    ? getIndex(placementAlongEdgeComboBox, placement)
    : -1

  placementSideOfEdgeComboBox.selectedIndex = side
    ? getIndex(placementSideOfEdgeComboBox, side)
    : -1

  sideReferenceComboBox.selectedIndex = sideReference
    ? getIndex(sideReferenceComboBox, sideReference)
    : -1

  angleReferenceComboBox.selectedIndex = angleReference
    ? getIndex(angleReferenceComboBox, angleReference)
    : -1

  angleRotationComboBox.selectedIndex = angleRotation
    ? getIndex(angleRotationComboBox, angleRotation)
    : -1
}

/**
 * Retrieves the index for the given option in the combo-box.
 * @param comboBox The combo-box that contains the given option.
 * @param value The value of the option for which the index is needed.
 */
function getIndex(
  comboBox: HTMLSelectElement,
  value:
    | ILayoutAlgorithm
    | LabelAlongEdgePlacements
    | LabelEdgeSides
    | LabelSideReferences
    | LabelAngleReferences
    | LabelAngleOnRightSideRotations
): number {
  const options = comboBox.options
  for (let i = 0; i < options.length; i++) {
    const option = options[i] as EdgeLabelPlacementOption
    if (option.myValue === value) {
      return i
    }
  }
  return -1
}

/**
 * Binds the actions to the buttons of the toolbar and the input elements of the option handler.
 */
function initializeUI(): void {
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
    (input) => {
      if (parseFloat((input.target! as HTMLInputElement).value) > 200) {
        alert('Distance cannot be larger than 200.')
        ;(input.target! as HTMLInputElement).value = '-1'
      }
    },
    false
  )
  angleNumberField.addEventListener(
    'change',
    (input) => {
      const angle = parseFloat((input.target! as HTMLInputElement).value)
      if (angle <= -360 || angle >= 360) {
        ;(input.target! as HTMLInputElement).value = `${angle % 360}`
      }
    },
    false
  )
}

/**
 * Adds label listeners to the graph which ensure that each label has an associated preferred
 * placement descriptor.
 */
function initializeGraph(): void {
  // add preferred placement information to each new label
  graph.addEventListener('label-added', (evt) => {
    descriptorMapper.set(evt.item, new EdgeLabelPreferredPlacement())
  })
  graph.addEventListener('label-removed', (evt) => {
    descriptorMapper.delete(evt.item)
  })
}

/**
 * Initializes node, edge and label styles that are applied when the graph is created.
 */
function initializeStyles(): void {
  initDemoStyles(graph)
  graph.nodeDefaults.size = new Size(50, 30)

  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createParameter()

  //allow full 360 degrees rotation for edge labels
  ;(graph.edgeDefaults.labels.style as LabelStyle).autoFlip = false
}

/**
 * Configures the input mode such that only labels can be added/removed to the graph.
 * Also, selecting labels will trigger an update of the option handler.
 */
function initializeInputMode(): void {
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
  inputMode.addEventListener('multi-selection-finished', () =>
    updateLabelProperties(getAffectedLabels())
  )

  graphComponent.inputMode = inputMode
}

/**
 * Initializes the properties in the option handler with options and default values.
 */
function initializeOptions(): void {
  addOption(placementAlongEdgeComboBox, 'AtCenter', LabelAlongEdgePlacements.AT_CENTER)
  addOption(placementAlongEdgeComboBox, 'AtSource', LabelAlongEdgePlacements.AT_SOURCE)
  addOption(placementAlongEdgeComboBox, 'AtTarget', LabelAlongEdgePlacements.AT_TARGET)
  addOption(placementAlongEdgeComboBox, 'Anywhere', LabelAlongEdgePlacements.ANYWHERE)
  addOption(placementAlongEdgeComboBox, 'AtSourcePort', LabelAlongEdgePlacements.AT_SOURCE_PORT)
  addOption(placementAlongEdgeComboBox, 'AtTargetPort', LabelAlongEdgePlacements.AT_TARGET_PORT)
  placementAlongEdgeComboBox.addEventListener('change', () =>
    onLabelPropertyChanged(placementAlongEdgeComboBox)
  )
  placementAlongEdgeComboBox.selectedIndex = 0

  addOption(placementSideOfEdgeComboBox, 'RightOfEdge', LabelEdgeSides.RIGHT_OF_EDGE)
  addOption(placementSideOfEdgeComboBox, 'OnEdge', LabelEdgeSides.ON_EDGE)
  addOption(placementSideOfEdgeComboBox, 'LeftOfEdge', LabelEdgeSides.LEFT_OF_EDGE)
  addOption(placementSideOfEdgeComboBox, 'Anywhere', LabelAlongEdgePlacements.ANYWHERE)
  placementSideOfEdgeComboBox.addEventListener('change', () =>
    onLabelPropertyChanged(placementSideOfEdgeComboBox)
  )
  placementSideOfEdgeComboBox.selectedIndex = 1

  addOption(sideReferenceComboBox, 'RelativeToEdgeFlow', LabelSideReferences.RELATIVE_TO_EDGE_FLOW)
  addOption(
    sideReferenceComboBox,
    'AbsoluteWithLeftAbove',
    LabelSideReferences.ABSOLUTE_WITH_LEFT_ABOVE
  )
  addOption(
    sideReferenceComboBox,
    'AbsoluteWithRightAbove',
    LabelSideReferences.ABSOLUTE_WITH_RIGHT_ABOVE
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
function initializeLayoutComboBox(): void {
  addOption(
    layoutComboBox,
    'Hierarchical, Top to Bottom',
    createHierarchicalLayout(LayoutOrientation.TOP_TO_BOTTOM)
  )
  addOption(
    layoutComboBox,
    'Hierarchical, Left to Right',
    createHierarchicalLayout(LayoutOrientation.LEFT_TO_RIGHT)
  )
  addOption(layoutComboBox, 'Generic Edge Labeling', new GenericLabeling())
  addOption(layoutComboBox, 'Organic', createOrganicLayout())
  addOption(layoutComboBox, 'Generic Tree', createTreeLayout())
  addOption(layoutComboBox, 'Orthogonal', createOrthogonalLayout())

  layoutComboBox.selectedIndex = 0
}

/**
 * Creates a configured HierarchicalLayout.
 */
function createHierarchicalLayout(layoutOrientation: LayoutOrientation): HierarchicalLayout {
  return new HierarchicalLayout({ layoutOrientation })
}

function createTreeLayout(): ILayoutAlgorithm {
  const layout = new TreeLayout()
  layout.parallelEdgeRouter.enabled = false

  const reductionStage = layout.treeReductionStage
  reductionStage.nonTreeEdgeRouter = new EdgeRouter()
  reductionStage.nonTreeEdgeLabeling = new GenericLabeling()

  return layout
}

function createOrthogonalLayout(): ILayoutAlgorithm {
  return new OrthogonalLayout()
}

function createOrganicLayout(): ILayoutAlgorithm {
  return new OrganicLayout({
    edgeLabelPlacement: 'integrated',
    deterministic: true,
    defaultPreferredEdgeLength: 60,
    defaultMinimumNodeDistance: 20
  })
}

function addOption(
  comboBox: HTMLSelectElement,
  text: string,
  value:
    | ILayoutAlgorithm
    | LabelAlongEdgePlacements
    | LabelEdgeSides
    | LabelSideReferences
    | LabelAngleReferences
    | LabelAngleOnRightSideRotations
): void {
  const option = document.createElement('option') as EdgeLabelPlacementOption
  option.text = text
  option.myValue = value
  comboBox.add(option)
}

/**
 * Returns a collection of labels that are currently affected by option changes.
 * Affected labels are all selected labels or all labels in case no label is selected.
 */
function getAffectedLabels(): IEnumerable<ILabel> {
  const selectedLabels = graphComponent.selection.labels
  return selectedLabels.size > 0 ? selectedLabels : graph.edgeLabels
}

void run().then(finishLoading)
