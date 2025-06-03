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
  Class,
  EdgeLabelPlacement,
  EdgeRouter,
  GenericLabeling,
  GraphComponent,
  GroupHidingStage,
  ILayoutAlgorithm,
  LayoutData,
  OrthogonalLayout,
  OrthogonalLayoutChainSubstructureStyle,
  OrthogonalLayoutCycleSubstructureStyle,
  OrthogonalLayoutData,
  OrthogonalLayoutMode,
  RecursiveGroupLayout,
  RecursiveGroupLayoutData,
  SubstructureOrientation,
  OrthogonalLayoutTreeSubstructureStyle,
  NodeLabelPlacement
} from '@yfiles/yfiles'

import {
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge,
  LayoutConfiguration
} from './LayoutConfiguration'
import {
  ComponentAttribute,
  Components,
  EnumValuesAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from '@yfiles/demo-resources/demo-option-editor'

enum GroupPolicy {
  LAYOUT_GROUPS,
  FIX_GROUPS,
  IGNORE_GROUPS
}

/**
 * Configuration options for the layout algorithm of the same name.
 */
export const OrthogonalLayoutConfig = (Class as any)('OrthogonalLayoutConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    LayoutGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    LabelingGroup: [
      new LabelAttribute('Labeling'),
      new OptionGroupAttribute('RootGroup', 20),
      new TypeAttribute(OptionGroup)
    ],
    NodePropertiesGroup: [
      new LabelAttribute('Node Settings'),
      new OptionGroupAttribute('LabelingGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    EdgePropertiesGroup: [
      new LabelAttribute('Edge Settings'),
      new OptionGroupAttribute('LabelingGroup', 20),
      new TypeAttribute(OptionGroup)
    ],
    PreferredPlacementGroup: [
      new LabelAttribute('Preferred Edge Label Placement'),
      new OptionGroupAttribute('LabelingGroup', 30),
      new TypeAttribute(OptionGroup)
    ],
    EdgesGroup: [
      new LabelAttribute('Edges'),
      new OptionGroupAttribute('RootGroup', 30),
      new TypeAttribute(OptionGroup)
    ],
    GroupingGroup: [
      new LabelAttribute('Grouping'),
      new OptionGroupAttribute('RootGroup', 40),
      new TypeAttribute(OptionGroup)
    ],
    SubstructureLayoutGroup: [
      new LabelAttribute('Substructure Layout'),
      new OptionGroupAttribute('RootGroup', 50),
      new TypeAttribute(OptionGroup)
    ],
    descriptionText: [
      new OptionGroupAttribute('DescriptionGroup', 10),
      new ComponentAttribute(Components.HTML_BLOCK),
      new TypeAttribute(String)
    ],
    strategyItem: [
      new LabelAttribute(
        'Layout Mode',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-layoutMode'
      ),
      new OptionGroupAttribute('LayoutGroup', 10),
      new EnumValuesAttribute([
        ['Strict', OrthogonalLayoutMode.STRICT],
        ['Relaxed', OrthogonalLayoutMode.RELAXED],
        ['Forced straight line', OrthogonalLayoutMode.FORCED_STRAIGHT_LINE]
      ]),
      new TypeAttribute(OrthogonalLayoutMode)
    ],
    gridSpacingItem: [
      new LabelAttribute(
        'Grid Spacing',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-gridSpacing'
      ),
      new OptionGroupAttribute('LayoutGroup', 20),
      new MinMaxAttribute(1, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    qualityTimeRatioItem: [
      new LabelAttribute(
        'Quality',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-qualityTimeRatio'
      ),
      new OptionGroupAttribute('LayoutGroup', 30),
      new MinMaxAttribute(0, 1),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    useExistingDrawingAsSketchItem: [
      new LabelAttribute(
        'Use Drawing as Sketch',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-fromSketchMode'
      ),
      new OptionGroupAttribute('LayoutGroup', 40),
      new TypeAttribute(Boolean)
    ],
    uniformPortAssignmentItem: [
      new LabelAttribute(
        'Uniform Port Assignment',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-uniformPortAssignment'
      ),
      new OptionGroupAttribute('LayoutGroup', 65),
      new TypeAttribute(Boolean)
    ],
    nodeLabelingItem: [
      new OptionGroupAttribute('NodePropertiesGroup', 10),
      new LabelAttribute(
        'Node Labeling',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-nodeLabelPlacement'
      ),
      new EnumValuesAttribute([
        ['Consider', NodeLabelPlacement.CONSIDER],
        ['Generic', NodeLabelPlacement.GENERIC],
        ['Ignore', NodeLabelPlacement.IGNORE]
      ]),
      new TypeAttribute(NodeLabelPlacement)
    ],
    edgeLabelingItem: [
      new LabelAttribute(
        'Edge Labeling',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-edgeLabelPlacement'
      ),
      new OptionGroupAttribute('EdgePropertiesGroup', 10),
      new EnumValuesAttribute([
        ['Ignore', EdgeLabelPlacement.IGNORE],
        ['Integrated', EdgeLabelPlacement.INTEGRATED],
        ['Generic', EdgeLabelPlacement.GENERIC]
      ]),
      new TypeAttribute(EdgeLabelPlacement)
    ],
    reduceAmbiguityItem: [
      new LabelAttribute(
        'Reduce Ambiguity',
        '#/api/LabelingCosts#LabelingCosts-property-ambiguousPlacementCost'
      ),
      new OptionGroupAttribute('EdgePropertiesGroup', 20),
      new TypeAttribute(Boolean)
    ],
    labelPlacementOrientationItem: [
      new LabelAttribute(
        'Orientation',
        '#/api/EdgeLabelPreferredPlacement#EdgeLabelPreferredPlacement-property-angle'
      ),
      new OptionGroupAttribute('PreferredPlacementGroup', 10),
      new EnumValuesAttribute([
        ['Parallel', LabelPlacementOrientation.PARALLEL],
        ['Orthogonal', LabelPlacementOrientation.ORTHOGONAL],
        ['Horizontal', LabelPlacementOrientation.HORIZONTAL],
        ['Vertical', LabelPlacementOrientation.VERTICAL]
      ]),
      new TypeAttribute(LabelPlacementOrientation)
    ],
    labelPlacementAlongEdgeItem: [
      new LabelAttribute(
        'Along Edge',
        '#/api/EdgeLabelPreferredPlacement#EdgeLabelPreferredPlacement-property-placementAlongEdge'
      ),
      new OptionGroupAttribute('PreferredPlacementGroup', 20),
      new EnumValuesAttribute([
        ['Anywhere', LabelPlacementAlongEdge.ANYWHERE],
        ['At Source', LabelPlacementAlongEdge.AT_SOURCE],
        ['At Source Port', LabelPlacementAlongEdge.AT_SOURCE_PORT],
        ['At Target', LabelPlacementAlongEdge.AT_TARGET],
        ['At Target Port', LabelPlacementAlongEdge.AT_TARGET_PORT],
        ['Centered', LabelPlacementAlongEdge.CENTERED]
      ]),
      new TypeAttribute(LabelPlacementAlongEdge)
    ],
    labelPlacementSideOfEdgeItem: [
      new LabelAttribute(
        'Side of Edge',
        '#/api/EdgeLabelPreferredPlacement#EdgeLabelPreferredPlacement-property-edgeSide'
      ),
      new OptionGroupAttribute('PreferredPlacementGroup', 30),
      new EnumValuesAttribute([
        ['Anywhere', LabelPlacementSideOfEdge.ANYWHERE],
        ['On Edge', LabelPlacementSideOfEdge.ON_EDGE],
        ['Left', LabelPlacementSideOfEdge.LEFT],
        ['Right', LabelPlacementSideOfEdge.RIGHT],
        ['Left or Right', LabelPlacementSideOfEdge.LEFT_OR_RIGHT]
      ]),
      new TypeAttribute(LabelPlacementSideOfEdge)
    ],
    labelPlacementDistanceItem: [
      new LabelAttribute(
        'Distance',
        '#/api/EdgeLabelPreferredPlacement#EdgeLabelPreferredPlacement-property-distanceToEdge'
      ),
      new OptionGroupAttribute('PreferredPlacementGroup', 40),
      new MinMaxAttribute(0.0, 40.0),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumFirstSegmentLengthItem: [
      new LabelAttribute(
        'Minimum First Segment Length',
        '#/api/OrthogonalLayoutEdgeDescriptor#OrthogonalLayoutEdgeDescriptor-property-minimumFirstSegmentLength'
      ),
      new OptionGroupAttribute('EdgesGroup', 10),
      new MinMaxAttribute(1, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumSegmentLengthItem: [
      new LabelAttribute(
        'Minimum Segment Length',
        '#/api/OrthogonalLayoutEdgeDescriptor#OrthogonalLayoutEdgeDescriptor-property-minimumFirstSegmentLength'
      ),
      new OptionGroupAttribute('EdgesGroup', 20),
      new MinMaxAttribute(1, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumLastSegmentLengthItem: [
      new LabelAttribute(
        'Minimum Last Segment Length',
        '#/api/OrthogonalLayoutEdgeDescriptor#OrthogonalLayoutEdgeDescriptor-property-minimumLastSegmentLength'
      ),
      new OptionGroupAttribute('EdgesGroup', 30),
      new MinMaxAttribute(1, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    considerEdgeDirectionItem: [
      new LabelAttribute(
        'Route Selected Edges Downwards',
        '#/api/OrthogonalLayoutData#OrthogonalLayoutData-property-edgeOrientation'
      ),
      new OptionGroupAttribute('EdgesGroup', 40),
      new TypeAttribute(Boolean)
    ],
    groupLayoutPolicyItem: [
      new LabelAttribute(
        'Group Layout Policy',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-layoutStages'
      ),
      new OptionGroupAttribute('GroupingGroup', 10),
      new EnumValuesAttribute([
        ['Layout Groups', GroupPolicy.LAYOUT_GROUPS],
        ['Fix Contents of Groups', GroupPolicy.FIX_GROUPS],
        ['Ignore Groups', GroupPolicy.IGNORE_GROUPS]
      ]),
      new TypeAttribute(GroupPolicy)
    ],
    cycleSubstructureStyleItem: [
      new LabelAttribute(
        'Cycles',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-cycleSubstructureStyle'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 10),
      new EnumValuesAttribute([
        ['Ignore', OrthogonalLayoutCycleSubstructureStyle.NONE],
        [
          'Circular with Nodes at Corners',
          OrthogonalLayoutCycleSubstructureStyle.CIRCULAR_WITH_NODES_AT_CORNERS
        ],
        [
          'Circular with Bends at Corners',
          OrthogonalLayoutCycleSubstructureStyle.CIRCULAR_WITH_BENDS_AT_CORNERS
        ]
      ]),
      new TypeAttribute(OrthogonalLayoutCycleSubstructureStyle)
    ],
    cycleSubstructureSizeItem: [
      new LabelAttribute(
        'Minimum Cycle Size',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-cycleSubstructureSize'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 20),
      new MinMaxAttribute(4, 20),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    chainSubstructureStyleItem: [
      new LabelAttribute(
        'Chains',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-chainSubstructureStyle'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 30),
      new EnumValuesAttribute([
        ['Ignore', OrthogonalLayoutChainSubstructureStyle.NONE],
        ['Straight', OrthogonalLayoutChainSubstructureStyle.STRAIGHT],
        [
          'Wrapped with Nodes at Turns',
          OrthogonalLayoutChainSubstructureStyle.WRAPPED_WITH_NODES_AT_TURNS
        ],
        [
          'Wrapped with Bends at Turns',
          OrthogonalLayoutChainSubstructureStyle.WRAPPED_WITH_BENDS_AT_TURNS
        ]
      ]),
      new TypeAttribute(OrthogonalLayoutCycleSubstructureStyle)
    ],
    chainSubstructureSizeItem: [
      new LabelAttribute(
        'Minimum Chain Length',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-chainSubstructureSize'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 40),
      new MinMaxAttribute(2, 20),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    treeSubstructureStyleItem: [
      new LabelAttribute(
        'Tree Style',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-treeSubstructureStyle'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 50),
      new EnumValuesAttribute([
        ['Ignore', OrthogonalLayoutTreeSubstructureStyle.NONE],
        ['Default', OrthogonalLayoutTreeSubstructureStyle.DEFAULT],
        ['Integrated', OrthogonalLayoutTreeSubstructureStyle.INTEGRATED],
        ['Compact', OrthogonalLayoutTreeSubstructureStyle.COMPACT],
        ['Aspect Ratio', OrthogonalLayoutTreeSubstructureStyle.ASPECT_RATIO]
      ]),
      new TypeAttribute(OrthogonalLayoutTreeSubstructureStyle)
    ],
    treeSubstructureSizeItem: [
      new LabelAttribute(
        'Minimum Tree Size',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-treeSubstructureSize'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 60),
      new MinMaxAttribute(3, 20),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    treeSubstructureOrientationItem: [
      new LabelAttribute(
        'Tree Orientation',
        '#/api/OrthogonalLayout#OrthogonalLayout-property-treeSubstructureOrientation'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 70),
      new EnumValuesAttribute([
        ['Automatic', SubstructureOrientation.AUTO_DETECT],
        ['Top to Bottom', SubstructureOrientation.TOP_TO_BOTTOM],
        ['Bottom to Top', SubstructureOrientation.BOTTOM_TO_TOP],
        ['Left to Right', SubstructureOrientation.LEFT_TO_RIGHT],
        ['Right to Left', SubstructureOrientation.RIGHT_TO_LEFT]
      ]),
      new TypeAttribute(SubstructureOrientation)
    ]
  },

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)

    this.strategyItem = OrthogonalLayoutMode.STRICT
    this.gridSpacingItem = 15
    this.qualityTimeRatioItem = 0.6
    this.uniformPortAssignmentItem = false
    this.useExistingDrawingAsSketchItem = false

    this.nodeLabelingItem = NodeLabelPlacement.CONSIDER
    this.edgeLabelingItem = EdgeLabelPlacement.INTEGRATED
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0

    this.minimumFirstSegmentLengthItem = 15.0
    this.minimumSegmentLengthItem = 15.0
    this.minimumLastSegmentLengthItem = 15.0
    this.considerEdgeDirectionItem = false

    this.chainSubstructureStyleItem = OrthogonalLayoutChainSubstructureStyle.NONE
    this.chainSubstructureSizeItem = 2
    this.cycleSubstructureStyleItem = OrthogonalLayoutCycleSubstructureStyle.NONE
    this.cycleSubstructureSizeItem = 4
    this.treeSubstructureStyleItem = OrthogonalLayoutTreeSubstructureStyle.NONE
    this.treeSubstructureSizeItem = 3
    this.treeSubstructureOrientationItem = SubstructureOrientation.AUTO_DETECT

    this.groupLayoutPolicyItem = GroupPolicy.LAYOUT_GROUPS
    this.title = 'Orthogonal Layout'
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const layout = new OrthogonalLayout()
    if (this.groupLayoutPolicyItem === GroupPolicy.FIX_GROUPS) {
      const rgl = new RecursiveGroupLayout({ interEdgeRouter: this.createInterEdgeRouter() })
      layout.layoutStages.prepend(rgl)
    } else if (this.groupLayoutPolicyItem === GroupPolicy.IGNORE_GROUPS) {
      ;(layout.layoutStages.get(GroupHidingStage) as GroupHidingStage).enabled = true
    }

    layout.layoutMode = this.strategyItem
    layout.gridSpacing = this.gridSpacingItem
    layout.qualityTimeRatio = this.qualityTimeRatioItem
    layout.uniformPortAssignment = this.uniformPortAssignmentItem
    layout.fromSketchMode = this.useExistingDrawingAsSketchItem
    layout.defaultEdgeDescriptor.minimumFirstSegmentLength = this.minimumFirstSegmentLengthItem
    layout.defaultEdgeDescriptor.minimumLastSegmentLength = this.minimumLastSegmentLengthItem
    layout.defaultEdgeDescriptor.minimumSegmentLength = this.minimumSegmentLengthItem

    // set edge labeling options
    const defaultStrategy = layout.layoutMode === OrthogonalLayoutMode.STRICT

    if (this.edgeLabelingItem === EdgeLabelPlacement.INTEGRATED && defaultStrategy) {
      layout.edgeLabelPlacement = 'integrated'
    } else if (this.edgeLabelingItem == EdgeLabelPlacement.GENERIC) {
      layout.edgeLabelPlacement = 'generic'
      if (this.reduceAmbiguityItem) {
        const labeling = layout.layoutStages.get(GenericLabeling)!
        labeling.defaultNodeLabelingCosts.ambiguousPlacementCost = 1.0
        labeling.defaultEdgeLabelingCosts.ambiguousPlacementCost = 1.0
      }
    } else {
      layout.edgeLabelPlacement = 'ignore'
    }

    if (defaultStrategy) {
      layout.nodeLabelPlacement = this.nodeLabelingItem
    } else {
      layout.nodeLabelPlacement = 'ignore'
    }

    layout.chainSubstructureStyle = this.chainSubstructureStyleItem
    layout.chainSubstructureSize = this.chainSubstructureSizeItem
    layout.cycleSubstructureStyle = this.cycleSubstructureStyleItem
    layout.cycleSubstructureSize = this.cycleSubstructureSizeItem
    layout.treeSubstructureStyle = this.treeSubstructureStyleItem
    layout.treeSubstructureSize = this.treeSubstructureSizeItem
    layout.treeSubstructureOrientation = this.treeSubstructureOrientationItem

    return layout
  },

  /**
   * Creates the layout data of the configuration.
   */
  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: OrthogonalLayout
  ): LayoutData {
    let orthogonalLayoutData = new OrthogonalLayoutData()
    if (this.considerEdgeDirectionItem) {
      orthogonalLayoutData.edgeOrientation = (edge) =>
        graphComponent.selection.includes(edge) ? 1 : 0
    } else {
      orthogonalLayoutData.edgeOrientation = 0
    }

    const recursiveGroupLayoutData = new RecursiveGroupLayoutData({
      groupNodeLayouts: RecursiveGroupLayout.FIX_GROUP_LAYOUT
    })

    const labelingData = this.createLabelingLayoutData(
      graphComponent.graph,
      this.labelPlacementAlongEdgeItem,
      this.labelPlacementSideOfEdgeItem,
      this.labelPlacementOrientationItem,
      this.labelPlacementDistanceItem
    )
    return orthogonalLayoutData.combineWith(recursiveGroupLayoutData).combineWith(labelingData)
  },

  createInterEdgeRouter() {
    const innerEdgeRouter = new EdgeRouter({
      minimumNodeToEdgeDistance: 0
    })
    innerEdgeRouter.defaultEdgeDescriptor.minimumEdgeDistance = 4
    return innerEdgeRouter
  },

  /** @type {OptionGroup} */
  LayoutGroup: null,

  /** @type {OptionGroup} */
  LabelingGroup: null,

  /** @type {OptionGroup} */
  NodePropertiesGroup: null,

  /** @type {OptionGroup} */
  EdgePropertiesGroup: null,

  /** @type {OptionGroup} */
  PreferredPlacementGroup: null,

  /** @type {OptionGroup} */
  EdgesGroup: null,

  /** @type {OptionGroup} */
  GroupingGroup: null,

  /** @type {OptionGroup} */
  SubstructureLayoutGroup: null,

  /** @type {string} */
  descriptionText: {
    get: function () {
      return "<p style='margin-top:0'>The orthogonal layout style is a multi-purpose layout style for undirected graphs. It is well suited for medium-sized sparse graphs, and produces compact drawings with no overlaps, few crossings, and few bends.</p><p>It is especially fitted for application domains such as</p><ul><li>Software engineering</li><li>Database schema</li><li>System management</li><li>Knowledge representation</li></ul>"
    }
  },

  /** @type {OrthogonalLayoutMode} */
  strategyItem: null,

  /** @type {boolean} */
  shouldDisableStrategyItem: <any>{
    get: function (): boolean {
      return this.useExistingDrawingAsSketchItem === true
    }
  },

  /** @type {number} */
  gridSpacingItem: 1,

  /** @type {NodeLabelPlacement} */
  nodeLabelingItem: null,

  /** @type {EdgeLabelPlacement} */
  edgeLabelingItem: null,

  /** @type {boolean} */
  reduceAmbiguityItem: false,

  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: <any>{
    get: function (): boolean {
      return this.edgeLabelingItem !== EdgeLabelPlacement.GENERIC
    }
  },

  /** @type {LabelPlacementOrientation} */
  labelPlacementOrientationItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: <any>{
    get: function (): boolean {
      return this.edgeLabelingItem === EdgeLabelPlacement.IGNORE
    }
  },

  /** @type {LabelPlacementAlongEdge} */
  labelPlacementAlongEdgeItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: <any>{
    get: function (): boolean {
      return this.edgeLabelingItem === EdgeLabelPlacement.IGNORE
    }
  },

  /** @type {LabelPlacementSideOfEdge} */
  labelPlacementSideOfEdgeItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: <any>{
    get: function (): boolean {
      return this.edgeLabelingItem === EdgeLabelPlacement.IGNORE
    }
  },

  /** @type {number} */
  labelPlacementDistanceItem: 0,

  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: <any>{
    get: function (): boolean {
      return (
        this.edgeLabelingItem === EdgeLabelPlacement.IGNORE ||
        this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
      )
    }
  },

  /** @type {number} */
  minimumFirstSegmentLengthItem: 1,

  /** @type {number} */
  minimumSegmentLengthItem: 1,

  /** @type {number} */
  minimumLastSegmentLengthItem: 1,

  /** @type {number} */
  considerEdgeDirectionItem: false,

  /** @type {GroupPolicy} */
  groupLayoutPolicyItem: null,

  /** @type {OrthogonalLayoutCycleSubstructureStyle} */
  cycleSubstructureStyleItem: null,

  /** @type {number} */
  cycleSubstructureSizeItem: 4,

  /** @type {boolean} */
  shouldDisableCycleSubstructureSizeItem: <any>{
    get: function (): boolean {
      return this.cycleSubstructureStyleItem === OrthogonalLayoutCycleSubstructureStyle.NONE
    }
  },

  /** @type {OrthogonalLayoutChainSubstructureStyle} */
  chainSubstructureStyleItem: null,

  /** @type {number} */
  chainSubstructureSizeItem: 3,

  /** @type {boolean} */
  shouldDisableChainSubstructureSizeItem: <any>{
    get: function (): boolean {
      return this.chainSubstructureStyleItem === OrthogonalLayoutChainSubstructureStyle.NONE
    }
  },

  /** @type {TreeSubstructureStyle} */
  treeSubstructureStyleItem: null,

  /** @type {number} */
  treeSubstructureSizeItem: 3,

  /** @type {boolean} */
  shouldDisableTreeSubstructureSizeItem: <any>{
    get: function (): boolean {
      return this.treeSubstructureStyleItem === OrthogonalLayoutTreeSubstructureStyle.NONE
    }
  },

  /** @type {SubstructureOrientation} */
  treeSubstructureOrientationItem: null,

  /** @type {boolean} */
  shouldDisableTreeSubstructureOrientationItem: <any>{
    get: function (): boolean {
      return this.treeSubstructureStyleItem === OrthogonalLayoutTreeSubstructureStyle.NONE
    }
  }
})
