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
  ChainLayoutStyle,
  Class,
  CycleLayoutStyle,
  Enum,
  FixGroupLayoutStage,
  GenericLabeling,
  GraphComponent,
  ILayoutAlgorithm,
  InterEdgeRoutingStyle,
  LayoutData,
  OrthogonalLayout,
  OrthogonalLayoutData,
  OrthogonalLayoutStyle,
  SubstructureOrientation,
  TreeLayoutStyle,
  YBoolean,
  YNumber,
  YString
} from 'yfiles'

import LayoutConfiguration, {
  EdgeLabeling,
  LabelPlacementAlongEdge,
  LabelPlacementSideOfEdge,
  LabelPlacementOrientation
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
} from '../../resources/demo-option-editor'

/**
 * Configuration options for the layout algorithm of the same name.
 */
const OrthogonalLayoutConfig = (Class as any)('OrthogonalLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('OrthogonalLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    //@ts-ignore
    LayoutConfiguration.call(this)

    this.styleItem = OrthogonalLayoutStyle.NORMAL
    this.gridSpacingItem = 15
    this.edgeLengthReductionItem = true
    this.useExistingDrawingAsSketchItem = false
    this.crossingReductionItem = true
    this.perceivedBendsPostprocessingItem = true
    this.uniformPortAssignmentItem = false
    this.useRandomizationItem = true
    this.useFaceMaximizationItem = false

    this.considerNodeLabelsItem = false
    this.edgeLabelingItem = EdgeLabeling.NONE
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0

    this.minimumFirstSegmentLengthItem = 15.0
    this.minimumSegmentLengthItem = 15.0
    this.minimumLastSegmentLengthItem = 15.0
    this.considerEdgeDirectionItem = false

    this.chainSubstructureStyleItem = ChainLayoutStyle.NONE
    this.chainSubstructureSizeItem = 2
    this.cycleSubstructureStyleItem = CycleLayoutStyle.NONE
    this.cycleSubstructureSizeItem = 4
    this.treeSubstructureStyleItem = TreeLayoutStyle.NONE
    this.treeSubstructureSizeItem = 3
    this.treeSubstructureOrientationItem = SubstructureOrientation.AUTO_DETECT

    this.groupLayoutPolicyItem = GroupPolicy.LAYOUT_GROUPS
    this.title = 'Orthogonal Layout'
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return The configured layout.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const layout = new OrthogonalLayout()
    if (this.groupLayoutPolicyItem === GroupPolicy.FIX_GROUPS) {
      const fgl = new FixGroupLayoutStage()
      fgl.interEdgeRoutingStyle = InterEdgeRoutingStyle.ORTHOGONAL
      layout.prependStage(fgl)
    } else if (this.groupLayoutPolicyItem === GroupPolicy.IGNORE_GROUPS) {
      layout.hideGroupsStageEnabled = true
    }

    layout.layoutStyle = this.styleItem
    layout.gridSpacing = this.gridSpacingItem
    layout.edgeLengthReduction = this.edgeLengthReductionItem
    layout.optimizePerceivedBends = this.perceivedBendsPostprocessingItem
    layout.uniformPortAssignment = this.uniformPortAssignmentItem
    layout.crossingReduction = this.crossingReductionItem
    layout.randomization = this.useRandomizationItem
    layout.faceMaximization = this.useFaceMaximizationItem
    layout.fromSketchMode = this.useExistingDrawingAsSketchItem
    layout.edgeLayoutDescriptor.minimumFirstSegmentLength = this.minimumFirstSegmentLengthItem
    layout.edgeLayoutDescriptor.minimumLastSegmentLength = this.minimumLastSegmentLengthItem
    layout.edgeLayoutDescriptor.minimumSegmentLength = this.minimumSegmentLengthItem

    // set edge labeling options
    const normalStyle = layout.layoutStyle === OrthogonalLayoutStyle.NORMAL
    layout.integratedEdgeLabeling = this.edgeLabelingItem === EdgeLabeling.INTEGRATED && normalStyle
    layout.considerNodeLabels = this.considerNodeLabelsItem && normalStyle

    if (
      this.edgeLabelingItem === EdgeLabeling.GENERIC ||
      (this.edgeLabelingItem === EdgeLabeling.INTEGRATED && normalStyle)
    ) {
      layout.labelingEnabled = true
      if (this.edgeLabelingItem === EdgeLabeling.GENERIC) {
        ;(layout.labeling as GenericLabeling).reduceAmbiguity = this.reduceAmbiguityItem
      }
    } else if (!this.considerNodeLabelsItem || !normalStyle) {
      layout.labelingEnabled = false
    }

    layout.chainStyle = this.chainSubstructureStyleItem
    layout.chainSize = this.chainSubstructureSizeItem
    layout.cycleStyle = this.cycleSubstructureStyleItem
    layout.cycleSize = this.cycleSubstructureSizeItem
    layout.treeStyle = this.treeSubstructureStyleItem
    layout.treeSize = this.treeSubstructureSizeItem
    layout.treeOrientation = this.treeSubstructureOrientationItem

    return layout
  },

  /**
   * Creates the layout data of the configuration.
   */
  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: OrthogonalLayout
  ): LayoutData {
    let layoutData
    if (this.considerEdgeDirectionItem) {
      layoutData = new OrthogonalLayoutData({
        directedEdges: graphComponent.selection.selectedEdges
      })
    } else {
      layoutData = new OrthogonalLayoutData({
        directedEdges: edge => false
      })
    }

    return layoutData.combineWith(
      this.createLabelingLayoutData(
        graphComponent.graph,
        this.labelPlacementAlongEdgeItem,
        this.labelPlacementSideOfEdgeItem,
        this.labelPlacementOrientationItem,
        this.labelPlacementDistanceItem
      )
    )
  },

  /** @type {OptionGroup} */
  LayoutGroup: {
    $meta: function () {
      return [
        LabelAttribute('General'),
        OptionGroupAttribute('RootGroup', 10),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  LabelingGroup: {
    $meta: function () {
      return [
        LabelAttribute('Labeling'),
        OptionGroupAttribute('RootGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  NodePropertiesGroup: {
    $meta: function () {
      return [
        LabelAttribute('Node Settings'),
        OptionGroupAttribute('LabelingGroup', 10),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  EdgePropertiesGroup: {
    $meta: function () {
      return [
        LabelAttribute('Edge Settings'),
        OptionGroupAttribute('LabelingGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  PreferredPlacementGroup: {
    $meta: function () {
      return [
        LabelAttribute('Preferred Edge Label Placement'),
        OptionGroupAttribute('LabelingGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  EdgesGroup: {
    $meta: function () {
      return [
        LabelAttribute('Edges'),
        OptionGroupAttribute('RootGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  GroupingGroup: {
    $meta: function () {
      return [
        LabelAttribute('Grouping'),
        OptionGroupAttribute('RootGroup', 40),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  SubstructureLayoutGroup: {
    $meta: function () {
      return [
        LabelAttribute('Substructure Layout'),
        OptionGroupAttribute('RootGroup', 50),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {string} */
  descriptionText: {
    $meta: function () {
      return [
        OptionGroupAttribute('DescriptionGroup', 10),
        ComponentAttribute(Components.HTML_BLOCK),
        TypeAttribute(YString.$class)
      ]
    },
    get: function () {
      return "<p style='margin-top:0'>The orthogonal layout style is a multi-purpose layout style for undirected graphs. It is well suited for medium-sized sparse graphs, and produces compact drawings with no overlaps, few crossings, and few bends.</p><p>It is especially fitted for application domains such as</p><ul><li>Software engineering</li><li>Database schema</li><li>System management</li><li>Knowledge representation</li></ul>"
    }
  },

  /** @type {OrthogonalLayoutStyle} */
  styleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Layout Style',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-layoutStyle'
        ),
        OptionGroupAttribute('LayoutGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Normal', OrthogonalLayoutStyle.NORMAL],
            ['Uniform Node Sizes', OrthogonalLayoutStyle.UNIFORM],
            ['Node Boxes', OrthogonalLayoutStyle.BOX],
            ['Mixed', OrthogonalLayoutStyle.MIXED],
            ['Node Boxes (Fixed Node Size)', OrthogonalLayoutStyle.FIXED_BOX],
            ['Mixed (Fixed Node Size)', OrthogonalLayoutStyle.FIXED_MIXED]
          ]
        }),
        TypeAttribute(OrthogonalLayoutStyle.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  shouldDisableStyleItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.useExistingDrawingAsSketchItem === true
    }
  },

  /** @type {number} */
  gridSpacingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Grid Spacing',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-gridSpacing'
        ),
        OptionGroupAttribute('LayoutGroup', 20),
        MinMaxAttribute().init({
          min: 1,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 1
  },

  /** @type {boolean} */
  edgeLengthReductionItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Length Reduction',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-edgeLengthReduction'
        ),
        OptionGroupAttribute('LayoutGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  useExistingDrawingAsSketchItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Use Drawing as Sketch',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-fromSketchMode'
        ),
        OptionGroupAttribute('LayoutGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  crossingReductionItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Crossing Reduction',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-crossingReduction'
        ),
        OptionGroupAttribute('LayoutGroup', 50),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableCrossingReductionItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.useExistingDrawingAsSketchItem === true
    }
  },

  /** @type {boolean} */
  perceivedBendsPostprocessingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimize Perceived Bends',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-optimizePerceivedBends'
        ),
        OptionGroupAttribute('LayoutGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisablePerceivedBendsPostprocessingItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.useExistingDrawingAsSketchItem === true
    }
  },

  /** @type {boolean} */
  uniformPortAssignmentItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Uniform Port Assignment',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-uniformPortAssignment'
        ),
        OptionGroupAttribute('LayoutGroup', 65),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableUniformPortAssignmentItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return (
        !this.useExistingDrawingAsSketchItem &&
        this.styleItem !== OrthogonalLayoutStyle.NORMAL &&
        this.styleItem !== OrthogonalLayoutStyle.UNIFORM
      )
    }
  },

  /** @type {boolean} */
  useRandomizationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Randomization',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-randomization'
        ),
        OptionGroupAttribute('LayoutGroup', 70),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableUseRandomizationItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.useExistingDrawingAsSketchItem === true
    }
  },

  /** @type {boolean} */
  useFaceMaximizationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Face Maximization',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-faceMaximization'
        ),
        OptionGroupAttribute('LayoutGroup', 80),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  considerNodeLabelsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Consider Node Labels',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-considerNodeLabels'
        ),
        OptionGroupAttribute('NodePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {EdgeLabeling} */
  edgeLabelingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Labeling',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-integratedEdgeLabeling'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['None', EdgeLabeling.NONE],
            ['Integrated', EdgeLabeling.INTEGRATED],
            ['Generic', EdgeLabeling.GENERIC]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  reduceAmbiguityItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Reduce Ambiguity',
          '#/api/GenericLabeling#MISLabelingBase-property-reduceAmbiguity'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeLabelingItem !== EdgeLabeling.GENERIC
    }
  },

  /** @type {LabelPlacementOrientation} */
  labelPlacementOrientationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Orientation',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-angle'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Parallel', LabelPlacementOrientation.PARALLEL],
            ['Orthogonal', LabelPlacementOrientation.ORTHOGONAL],
            ['Horizontal', LabelPlacementOrientation.HORIZONTAL],
            ['Vertical', LabelPlacementOrientation.VERTICAL]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeLabelingItem === EdgeLabeling.NONE
    }
  },

  /** @type {LabelPlacementAlongEdge} */
  labelPlacementAlongEdgeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Along Edge',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-placeAlongEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Anywhere', LabelPlacementAlongEdge.ANYWHERE],
            ['At Source', LabelPlacementAlongEdge.AT_SOURCE],
            ['At Source Port', LabelPlacementAlongEdge.AT_SOURCE_PORT],
            ['At Target', LabelPlacementAlongEdge.AT_TARGET],
            ['At Target Port', LabelPlacementAlongEdge.AT_TARGET_PORT],
            ['Centered', LabelPlacementAlongEdge.CENTERED]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeLabelingItem === EdgeLabeling.NONE
    }
  },

  /** @type {LabelPlacementSideOfEdge} */
  labelPlacementSideOfEdgeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Side of Edge',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-sideOfEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Anywhere', LabelPlacementSideOfEdge.ANYWHERE],
            ['On Edge', LabelPlacementSideOfEdge.ON_EDGE],
            ['Left', LabelPlacementSideOfEdge.LEFT],
            ['Right', LabelPlacementSideOfEdge.RIGHT],
            ['Left or Right', LabelPlacementSideOfEdge.LEFT_OR_RIGHT]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeLabelingItem === EdgeLabeling.NONE
    }
  },

  /** @type {number} */
  labelPlacementDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Distance',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-distanceToEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 40),
        MinMaxAttribute().init({
          min: 0.0,
          max: 40.0
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return (
        this.edgeLabelingItem === EdgeLabeling.NONE ||
        this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
      )
    }
  },

  /** @type {number} */
  minimumFirstSegmentLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum First Segment Length',
          '#/api/OrthogonalLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumFirstSegmentLength'
        ),
        OptionGroupAttribute('EdgesGroup', 10),
        MinMaxAttribute().init({
          min: 1,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 1
  },

  /** @type {number} */
  minimumSegmentLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Segment Length',
          '#/api/OrthogonalLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumFirstSegmentLength'
        ),
        OptionGroupAttribute('EdgesGroup', 20),
        MinMaxAttribute().init({
          min: 1,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 1
  },

  /** @type {number} */
  minimumLastSegmentLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Last Segment Length',
          '#/api/OrthogonalLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLastSegmentLength'
        ),
        OptionGroupAttribute('EdgesGroup', 30),
        MinMaxAttribute().init({
          min: 1,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 1
  },

  /** @type {number} */
  considerEdgeDirectionItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Route Selected Edges Downwards',
          '#/api/OrthogonalLayoutData#OrthogonalLayoutData-property-directedEdges'
        ),
        OptionGroupAttribute('EdgesGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {GroupPolicy} */
  groupLayoutPolicyItem: {
    $meta: function () {
      return [
        LabelAttribute('Group Layout Policy', '#/api/FixGroupLayoutStage'),
        OptionGroupAttribute('GroupingGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Layout Groups', GroupPolicy.LAYOUT_GROUPS],
            ['Fix Contents of Groups', GroupPolicy.FIX_GROUPS],
            ['Ignore Groups', GroupPolicy.IGNORE_GROUPS]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {CycleLayoutStyle} */
  cycleSubstructureStyleItem: {
    $meta: function () {
      return [
        LabelAttribute('Cycles', '#/api/OrthogonalLayout#OrthogonalLayout-property-cycleStyle'),
        OptionGroupAttribute('SubstructureLayoutGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Ignore', CycleLayoutStyle.NONE],
            ['Circular with Nodes at Corners', CycleLayoutStyle.CIRCULAR_WITH_NODES_AT_CORNERS],
            ['Circular with Bends at Corners', CycleLayoutStyle.CIRCULAR_WITH_BENDS_AT_CORNERS]
          ]
        }),
        TypeAttribute(CycleLayoutStyle.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  cycleSubstructureSizeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Cycle Size',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-cycleSize'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 20),
        MinMaxAttribute().init({
          min: 4,
          max: 20
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 4
  },

  /** @type {boolean} */
  shouldDisableCycleSubstructureSizeItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.cycleSubstructureStyleItem === CycleLayoutStyle.NONE
    }
  },

  /** @type {ChainLayoutStyle} */
  chainSubstructureStyleItem: {
    $meta: function () {
      return [
        LabelAttribute('Chains', '#/api/OrthogonalLayout#OrthogonalLayout-property-chainStyle'),
        OptionGroupAttribute('SubstructureLayoutGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Ignore', ChainLayoutStyle.NONE],
            ['Straight', ChainLayoutStyle.STRAIGHT],
            ['Wrapped with Nodes at Turns', ChainLayoutStyle.WRAPPED_WITH_NODES_AT_TURNS],
            ['Wrapped with Bends at Turns', ChainLayoutStyle.WRAPPED_WITH_BENDS_AT_TURNS]
          ]
        }),
        TypeAttribute(CycleLayoutStyle.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  chainSubstructureSizeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Chain Length',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-chainSize'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 40),
        MinMaxAttribute().init({
          min: 2,
          max: 20
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 3
  },

  /** @type {boolean} */
  shouldDisableChainSubstructureSizeItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.chainSubstructureStyleItem === ChainLayoutStyle.NONE
    }
  },

  /** @type {TreeLayoutStyle} */
  treeSubstructureStyleItem: {
    $meta: function () {
      return [
        LabelAttribute('Tree Style', '#/api/OrthogonalLayout#OrthogonalLayout-property-treeStyle'),
        OptionGroupAttribute('SubstructureLayoutGroup', 50),
        EnumValuesAttribute().init({
          values: [
            ['Ignore', TreeLayoutStyle.NONE],
            ['Default', TreeLayoutStyle.DEFAULT],
            ['Integrated', TreeLayoutStyle.INTEGRATED],
            ['Compact', TreeLayoutStyle.COMPACT],
            ['Aspect Ratio', TreeLayoutStyle.ASPECT_RATIO]
          ]
        }),
        TypeAttribute(CycleLayoutStyle.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  treeSubstructureSizeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Tree Size',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-treeSize'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 60),
        MinMaxAttribute().init({
          min: 3,
          max: 20
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 3
  },

  /** @type {boolean} */
  shouldDisableTreeSubstructureSizeItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.treeSubstructureStyleItem === TreeLayoutStyle.NONE
    }
  },

  /** @type {SubstructureOrientation} */
  treeSubstructureOrientationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Tree Orientation',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-treeOrientation'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 70),
        EnumValuesAttribute().init({
          values: [
            ['Automatic', SubstructureOrientation.AUTO_DETECT],
            ['Top to Bottom', SubstructureOrientation.TOP_TO_BOTTOM],
            ['Bottom to Top', SubstructureOrientation.BOTTOM_TO_TOP],
            ['Left to Right', SubstructureOrientation.LEFT_TO_RIGHT],
            ['Right to Left', SubstructureOrientation.RIGHT_TO_LEFT]
          ]
        }),
        TypeAttribute(SubstructureOrientation.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  shouldDisableTreeSubstructureOrientationItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.treeSubstructureStyleItem === TreeLayoutStyle.NONE
    }
  }
})
export default OrthogonalLayoutConfig

enum GroupPolicy {
  LAYOUT_GROUPS,
  FIX_GROUPS,
  IGNORE_GROUPS
}
