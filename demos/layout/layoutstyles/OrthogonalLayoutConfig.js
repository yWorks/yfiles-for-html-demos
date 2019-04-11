/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EnumDefinition,
  FixGroupLayoutStage,
  GraphComponent,
  ILayoutAlgorithm,
  InterEdgeRoutingStyle,
  OrthogonalLayout,
  OrthogonalLayoutData,
  OrthogonalLayoutStyle,
  SubstructureOrientation,
  TreeLayoutStyle,
  YBoolean,
  YNumber,
  YString
} from 'yfiles'

import LayoutConfiguration from './LayoutConfiguration.js'
import {
  ComponentAttribute,
  Components,
  EnumValuesAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from '../../resources/demo-option-editor.js'

/**
 * Configuration options for the layout algorithm of the same name.
 * @yjs:keep=DescriptionGroup,EdgePropertiesGroup,EdgesGroup,GroupingGroup,LabelingGroup,LayoutGroup,NodePropertiesGroup,PreferredPlacementGroup,descriptionText,considerNodeLabelsItem,crossingReductionItem,edgeLabelingItem,gridSpacingItem,groupLayoutPolicyItem,groupLayoutQualityItem,labelPlacementAlongEdgeItem,labelPlacementDistanceItem,labelPlacementOrientationItem,labelPlacementSideOfEdgeItem,edgeLengthReductionItem,minimumFirstSegmentLengthItem,minimumLastSegmentLengthItem,minimumSegmentLengthItem,perceivedBendsPostprocessingItem,shouldDisablecrossingReductionItem,shouldDisableLabelPlacementAlongEdgeItem,shouldDisableLabelPlacementDistanceItem,shouldDisableLabelPlacementOrientationItem,shouldDisableLabelPlacementSideOfEdgeItem,shouldDisablePerceivedBendsPostprocessingItem,uniformPortAssignmentItem,shouldDisableStyleItem,shouldDisableUseRandomizationItem,styleItem,useExistingDrawingAsSketchItem,useFaceMaximizationItem,useRandomizationItem,cycleSubstructureStyleItem,cycleSubstructureSizeItem,shouldDisableCycleSubstructureSizeItem,chainSubstructureStyleItem,chainSubstructureSizeItem,shouldDisableChainSubstructureSizeItem,treeSubstructureStyleItem,treeSubstructureSizeItem,shouldDisableTreeSubstructureSizeItem
 */
const OrthogonalLayoutConfig = Class('OrthogonalLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('OrthogonalLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function() {
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
    this.edgeLabelingItem = OrthogonalLayoutConfig.EnumEdgeLabeling.NONE
    this.labelPlacementAlongEdgeItem = LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem =
      LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
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

    this.groupLayoutPolicyItem = OrthogonalLayoutConfig.EnumGroupPolicy.LAYOUT_GROUPS
  },

  /**
   * Creates and configures a layout.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout.
   */
  createConfiguredLayout: function(graphComponent) {
    const layout = new OrthogonalLayout()
    if (this.groupLayoutPolicyItem === OrthogonalLayoutConfig.EnumGroupPolicy.FIX_GROUPS) {
      const fgl = new FixGroupLayoutStage()
      fgl.interEdgeRoutingStyle = InterEdgeRoutingStyle.ORTHOGONAL
      layout.prependStage(fgl)
    } else if (
      this.groupLayoutPolicyItem === OrthogonalLayoutConfig.EnumGroupPolicy.IGNORE_GROUPS
    ) {
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
    layout.integratedEdgeLabeling =
      this.edgeLabelingItem === OrthogonalLayoutConfig.EnumEdgeLabeling.INTEGRATED && normalStyle
    layout.considerNodeLabels = this.considerNodeLabelsItem && normalStyle

    if (
      this.edgeLabelingItem === OrthogonalLayoutConfig.EnumEdgeLabeling.GENERIC ||
      (this.edgeLabelingItem === OrthogonalLayoutConfig.EnumEdgeLabeling.INTEGRATED && normalStyle)
    ) {
      layout.labelingEnabled = true
      if (this.edgeLabelingItem === OrthogonalLayoutConfig.EnumEdgeLabeling.GENERIC) {
        layout.labeling.reduceAmbiguity = this.reduceAmbiguityItem
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

    LayoutConfiguration.addPreferredPlacementDescriptor(
      graphComponent.graph,
      this.labelPlacementAlongEdgeItem,
      this.labelPlacementSideOfEdgeItem,
      this.labelPlacementOrientationItem,
      this.labelPlacementDistanceItem
    )
    return layout
  },

  /**
   * Creates the layout data of the configuration.
   * @param {GraphComponent} graphComponent
   * @param {ILayoutAlgorithm} layout
   * @return {null}
   */
  createConfiguredLayoutData: function(graphComponent, layout) {
    const layoutData = new OrthogonalLayoutData()
    if (this.considerEdgeDirectionItem) {
      layoutData.directedEdges = graphComponent.selection.selectedEdges
    } else {
      layoutData.directedEdges = edge => false
    }
    return layoutData
  },

  /** @type {OptionGroup} */
  DescriptionGroup: {
    $meta: function() {
      return [
        LabelAttribute('Description'),
        OptionGroupAttribute('RootGroup', 5),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  LayoutGroup: {
    $meta: function() {
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
    $meta: function() {
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
    $meta: function() {
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
    $meta: function() {
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
    $meta: function() {
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
    $meta: function() {
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
    $meta: function() {
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
    $meta: function() {
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
    $meta: function() {
      return [
        OptionGroupAttribute('DescriptionGroup', 10),
        ComponentAttribute(Components.HTML_BLOCK),
        TypeAttribute(YString.$class)
      ]
    },
    get: function() {
      return "<p style='margin-top:0'>The orthogonal layout style is a multi-purpose layout style for undirected graphs. It is well suited for medium-sized sparse graphs, and produces compact drawings with no overlaps, few crossings, and few bends.</p><p>It is especially fitted for application domains such as</p><ul><li>Software engineering</li><li>Database schema</li><li>System management</li><li>Knowledge representation</li></ul>"
    }
  },

  /**
   * Backing field for below property
   * @type {OrthogonalLayoutStyle}
   */
  $styleItem: null,

  /** @type {OrthogonalLayoutStyle} */
  styleItem: {
    $meta: function() {
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
    get: function() {
      return this.$styleItem
    },
    set: function(value) {
      this.$styleItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableStyleItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.useExistingDrawingAsSketchItem === true
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $gridSpacingItem: 0,

  /** @type {number} */
  gridSpacingItem: {
    $meta: function() {
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
    get: function() {
      return this.$gridSpacingItem
    },
    set: function(value) {
      this.$gridSpacingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $edgeLengthReductionItem: false,

  /** @type {boolean} */
  edgeLengthReductionItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Length Reduction',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-edgeLengthReduction'
        ),
        OptionGroupAttribute('LayoutGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$edgeLengthReductionItem
    },
    set: function(value) {
      this.$edgeLengthReductionItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $useExistingDrawingAsSketchItem: false,

  /** @type {boolean} */
  useExistingDrawingAsSketchItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Use Drawing as Sketch',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-fromSketchMode'
        ),
        OptionGroupAttribute('LayoutGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$useExistingDrawingAsSketchItem
    },
    set: function(value) {
      this.$useExistingDrawingAsSketchItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $crossingReductionItem: false,

  /** @type {boolean} */
  crossingReductionItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Crossing Reduction',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-crossingReduction'
        ),
        OptionGroupAttribute('LayoutGroup', 50),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$crossingReductionItem
    },
    set: function(value) {
      this.$crossingReductionItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableCrossingReductionItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.useExistingDrawingAsSketchItem === true
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $perceivedBendsPostprocessingItem: false,

  /** @type {boolean} */
  perceivedBendsPostprocessingItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimize Perceived Bends',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-optimizePerceivedBends'
        ),
        OptionGroupAttribute('LayoutGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$perceivedBendsPostprocessingItem
    },
    set: function(value) {
      this.$perceivedBendsPostprocessingItem = value
    }
  },

  /** @type {boolean} */
  shouldDisablePerceivedBendsPostprocessingItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.useExistingDrawingAsSketchItem === true
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $uniformPortAssignmentItem: false,

  /** @type {boolean} */
  uniformPortAssignmentItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Uniform Port Assignment',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-uniformPortAssignment'
        ),
        OptionGroupAttribute('LayoutGroup', 65),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$uniformPortAssignmentItem
    },
    set: function(value) {
      this.$uniformPortAssignmentItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableUniformPortAssignmentItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return (
        !this.useExistingDrawingAsSketchItem &&
        this.styleItem !== OrthogonalLayoutStyle.NORMAL &&
        this.styleItem !== OrthogonalLayoutStyle.UNIFORM
      )
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $useRandomizationItem: false,

  /** @type {boolean} */
  useRandomizationItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Randomization',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-randomization'
        ),
        OptionGroupAttribute('LayoutGroup', 70),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$useRandomizationItem
    },
    set: function(value) {
      this.$useRandomizationItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableUseRandomizationItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.useExistingDrawingAsSketchItem === true
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $useFaceMaximizationItem: false,

  /** @type {boolean} */
  useFaceMaximizationItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Face Maximization',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-faceMaximization'
        ),
        OptionGroupAttribute('LayoutGroup', 80),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$useFaceMaximizationItem
    },
    set: function(value) {
      this.$useFaceMaximizationItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $considerNodeLabelsItem: false,

  /** @type {boolean} */
  considerNodeLabelsItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Consider Node Labels',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-considerNodeLabels'
        ),
        OptionGroupAttribute('NodePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$considerNodeLabelsItem
    },
    set: function(value) {
      this.$considerNodeLabelsItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {OrthogonalLayoutConfig.EnumEdgeLabeling}
   */
  $edgeLabelingItem: null,

  /** @type {OrthogonalLayoutConfig.EnumEdgeLabeling} */
  edgeLabelingItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Edge Labeling',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-integratedEdgeLabeling'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['None', OrthogonalLayoutConfig.EnumEdgeLabeling.NONE],
            ['Integrated', OrthogonalLayoutConfig.EnumEdgeLabeling.INTEGRATED],
            ['Generic', OrthogonalLayoutConfig.EnumEdgeLabeling.GENERIC]
          ]
        }),
        TypeAttribute(OrthogonalLayoutConfig.EnumEdgeLabeling.$class)
      ]
    },
    get: function() {
      return this.$edgeLabelingItem
    },
    set: function(value) {
      this.$edgeLabelingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $reduceAmbiguityItem: false,

  /** @type {boolean} */
  reduceAmbiguityItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Reduce Ambiguity',
          '#/api/GenericLabeling#MISLabelingBase-property-reduceAmbiguity'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$reduceAmbiguityItem
    },
    set: function(value) {
      this.$reduceAmbiguityItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.edgeLabelingItem !== OrthogonalLayoutConfig.EnumEdgeLabeling.GENERIC
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutConfiguration.EnumLabelPlacementOrientation}
   */
  $labelPlacementOrientationItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementOrientation} */
  labelPlacementOrientationItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Orientation',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-angle'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Parallel', LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL],
            ['Orthogonal', LayoutConfiguration.EnumLabelPlacementOrientation.ORTHOGONAL],
            ['Horizontal', LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL],
            ['Vertical', LayoutConfiguration.EnumLabelPlacementOrientation.VERTICAL]
          ]
        }),
        TypeAttribute(LayoutConfiguration.EnumLabelPlacementOrientation.$class)
      ]
    },
    get: function() {
      return this.$labelPlacementOrientationItem
    },
    set: function(value) {
      this.$labelPlacementOrientationItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.edgeLabelingItem === OrthogonalLayoutConfig.EnumEdgeLabeling.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutConfiguration.EnumLabelPlacementAlongEdge}
   */
  $labelPlacementAlongEdgeItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementAlongEdge} */
  labelPlacementAlongEdgeItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Along Edge',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-placeAlongEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Anywhere', LayoutConfiguration.EnumLabelPlacementAlongEdge.ANYWHERE],
            ['At Source', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_SOURCE],
            ['At Target', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET],
            ['Centered', LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED]
          ]
        }),
        TypeAttribute(LayoutConfiguration.EnumLabelPlacementAlongEdge.$class)
      ]
    },
    get: function() {
      return this.$labelPlacementAlongEdgeItem
    },
    set: function(value) {
      this.$labelPlacementAlongEdgeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.edgeLabelingItem === OrthogonalLayoutConfig.EnumEdgeLabeling.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutConfiguration.EnumLabelPlacementSideOfEdge}
   */
  $labelPlacementSideOfEdgeItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementSideOfEdge} */
  labelPlacementSideOfEdgeItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Side of Edge',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-sideOfEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Anywhere', LayoutConfiguration.EnumLabelPlacementSideOfEdge.ANYWHERE],
            ['On Edge', LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE],
            ['Left', LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT],
            ['Right', LayoutConfiguration.EnumLabelPlacementSideOfEdge.RIGHT],
            ['Left or Right', LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT_OR_RIGHT]
          ]
        }),
        TypeAttribute(LayoutConfiguration.EnumLabelPlacementSideOfEdge.$class)
      ]
    },
    get: function() {
      return this.$labelPlacementSideOfEdgeItem
    },
    set: function(value) {
      this.$labelPlacementSideOfEdgeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.edgeLabelingItem === OrthogonalLayoutConfig.EnumEdgeLabeling.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $labelPlacementDistanceItem: 0,

  /** @type {number} */
  labelPlacementDistanceItem: {
    $meta: function() {
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
    get: function() {
      return this.$labelPlacementDistanceItem
    },
    set: function(value) {
      this.$labelPlacementDistanceItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return (
        this.edgeLabelingItem === OrthogonalLayoutConfig.EnumEdgeLabeling.NONE ||
        this.labelPlacementSideOfEdgeItem ===
          LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
      )
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumFirstSegmentLengthItem: 0,

  /** @type {number} */
  minimumFirstSegmentLengthItem: {
    $meta: function() {
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
    get: function() {
      return this.$minimumFirstSegmentLengthItem
    },
    set: function(value) {
      this.$minimumFirstSegmentLengthItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumSegmentLengthItem: 0,

  /** @type {number} */
  minimumSegmentLengthItem: {
    $meta: function() {
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
    get: function() {
      return this.$minimumSegmentLengthItem
    },
    set: function(value) {
      this.$minimumSegmentLengthItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumLastSegmentLengthItem: 0,

  /** @type {number} */
  minimumLastSegmentLengthItem: {
    $meta: function() {
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
    get: function() {
      return this.$minimumLastSegmentLengthItem
    },
    set: function(value) {
      this.$minimumLastSegmentLengthItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $considerEdgeDirectionItem: 0,

  /** @type {number} */
  considerEdgeDirectionItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Route Selected Edges Downwards',
          '#/api/OrthogonalLayoutData#OrthogonalLayoutData-property-directedEdges'
        ),
        OptionGroupAttribute('EdgesGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$considerEdgeDirectionItem
    },
    set: function(value) {
      this.$considerEdgeDirectionItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {OrthogonalLayoutConfig.EnumGroupPolicy}
   */
  $groupLayoutPolicyItem: null,

  /** @type {OrthogonalLayoutConfig.EnumGroupPolicy} */
  groupLayoutPolicyItem: {
    $meta: function() {
      return [
        LabelAttribute('Group Layout Policy', '#/api/FixGroupLayoutStage'),
        OptionGroupAttribute('GroupingGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Layout Groups', OrthogonalLayoutConfig.EnumGroupPolicy.LAYOUT_GROUPS],
            ['Fix Contents of Groups', OrthogonalLayoutConfig.EnumGroupPolicy.FIX_GROUPS],
            ['Ignore Groups', OrthogonalLayoutConfig.EnumGroupPolicy.IGNORE_GROUPS]
          ]
        }),
        TypeAttribute(OrthogonalLayoutConfig.EnumGroupPolicy.$class)
      ]
    },
    get: function() {
      return this.$groupLayoutPolicyItem
    },
    set: function(value) {
      this.$groupLayoutPolicyItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {CycleLayoutStyle}
   */
  $cycleSubstructureStyleItem: null,

  /** @type {CycleLayoutStyle} */
  cycleSubstructureStyleItem: {
    $meta: function() {
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
    get: function() {
      return this.$cycleSubstructureStyleItem
    },
    set: function(value) {
      this.$cycleSubstructureStyleItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $cycleSubstructureSizeItem: 0,

  /** @type {number} */
  cycleSubstructureSizeItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Cycle Size',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-cycleSize'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 20),
        MinMaxAttribute().init({
          min: 4,
          max: 20,
          value: 3
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$cycleSubstructureSizeItem
    },
    set: function(value) {
      this.$cycleSubstructureSizeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableCycleSubstructureSizeItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.cycleSubstructureStyleItem === CycleLayoutStyle.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {ChainLayoutStyle}
   */
  $chainSubstructureStyleItem: null,

  /** @type {ChainLayoutStyle} */
  chainSubstructureStyleItem: {
    $meta: function() {
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
    get: function() {
      return this.$chainSubstructureStyleItem
    },
    set: function(value) {
      this.$chainSubstructureStyleItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $chainSubstructureSizeItem: 0,

  /** @type {number} */
  chainSubstructureSizeItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Chain Length',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-chainSize'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 40),
        MinMaxAttribute().init({
          min: 2,
          max: 20,
          value: 3
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$chainSubstructureSizeItem
    },
    set: function(value) {
      this.$chainSubstructureSizeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableChainSubstructureSizeItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.chainSubstructureStyleItem === ChainLayoutStyle.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {TreeLayoutStyle}
   */
  $treeSubstructureStyleItem: null,

  /** @type {TreeLayoutStyle} */
  treeSubstructureStyleItem: {
    $meta: function() {
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
    get: function() {
      return this.$treeSubstructureStyleItem
    },
    set: function(value) {
      this.$treeSubstructureStyleItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $treeSubstructureSizeItem: 0,

  /** @type {number} */
  treeSubstructureSizeItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Tree Size',
          '#/api/OrthogonalLayout#OrthogonalLayout-property-treeSize'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 60),
        MinMaxAttribute().init({
          min: 3,
          max: 20,
          value: 3
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$treeSubstructureSizeItem
    },
    set: function(value) {
      this.$treeSubstructureSizeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableTreeSubstructureSizeItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.treeSubstructureStyleItem === TreeLayoutStyle.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {SubstructureOrientation}
   */
  $treeSubstructureOrientationItem: null,

  /** @type {SubstructureOrientation} */
  treeSubstructureOrientationItem: {
    $meta: function() {
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
    get: function() {
      return this.$treeSubstructureOrientationItem
    },
    set: function(value) {
      this.$treeSubstructureOrientationItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableTreeSubstructureOrientationItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.treeSubstructureStyleItem === TreeLayoutStyle.NONE
    }
  },

  /**
   * Enables different layout styles for possible detected substructures.
   */
  enableSubstructures: function() {
    this.chainSubstructureStyleItem = ChainLayoutStyle.WRAPPED_WITH_NODES_AT_TURNS
    this.chainSubstructureSizeItem = 2
    this.cycleSubstructureStyleItem = CycleLayoutStyle.CIRCULAR_WITH_BENDS_AT_CORNERS
    this.cycleSubstructureSizeItem = 4
    this.treeSubstructureStyleItem = TreeLayoutStyle.INTEGRATED
    this.treeSubstructureSizeItem = 3
    this.treeSubstructureOrientationItem = SubstructureOrientation.AUTO_DETECT
  },

  $static: {
    // ReSharper restore UnusedMember.Global
    // ReSharper restore InconsistentNaming
    EnumEdgeLabeling: new EnumDefinition(() => {
      return {
        NONE: 0,
        INTEGRATED: 1,
        GENERIC: 2
      }
    }),

    EnumGroupPolicy: new EnumDefinition(() => {
      return {
        LAYOUT_GROUPS: 0,
        FIX_GROUPS: 1,
        IGNORE_GROUPS: 2
      }
    })
  }
})
export default OrthogonalLayoutConfig
