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
  BalloonLayout,
  BalloonLayoutData,
  Class,
  ComponentArrangementStyles,
  EdgeBundleDescriptor,
  EdgeRouter,
  EnumDefinition,
  FreeNodeLabelModel,
  GenericLabeling,
  GraphComponent,
  InterleavedMode,
  NodeLabelingPolicy,
  OrganicEdgeRouter,
  RootNodePolicy,
  TreeReductionStage,
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
 */
const BalloonLayoutConfig = Class('BalloonLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('BalloonLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    LayoutConfiguration.call(this)
    this.$initBalloonLayoutConfig()
    const layout = new BalloonLayout()

    this.rootNodePolicyItem = RootNodePolicy.DIRECTED_ROOT
    this.routingStyleForNonTreeEdgesItem = BalloonLayoutConfig.EnumRoute.ORTHOGONAL
    this.actOnSelectionOnlyItem = false
    this.preferredChildWedgeItem = layout.preferredChildWedge
    this.preferredRootWedgeItem = layout.preferredRootWedge
    this.minimumEdgeLengthItem = layout.minimumEdgeLength
    this.compactnessFactorItem = layout.compactnessFactor
    this.allowOverlapsItem = layout.allowOverlaps
    this.balloonFromSketchItem = layout.fromSketchMode
    this.placeChildrenInterleavedItem = layout.interleavedMode === InterleavedMode.ALL_NODES
    this.straightenChainsItem = layout.chainStraighteningMode

    this.nodeLabelingStyleItem =
      BalloonLayoutConfig.EnumNodeLabelingPolicies.CONSIDER_CURRENT_POSITION
    this.edgeLabelingItem = BalloonLayoutConfig.EnumEdgeLabeling.NONE
    this.labelPlacementAlongEdgeItem = LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem =
      LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    const layout = new BalloonLayout()

    layout.componentLayout.style = ComponentArrangementStyles.MULTI_ROWS

    layout.rootNodePolicy = this.rootNodePolicyItem
    layout.preferredChildWedge = this.preferredChildWedgeItem
    layout.preferredRootWedge = this.preferredRootWedgeItem
    layout.minimumEdgeLength = this.minimumEdgeLengthItem
    layout.compactnessFactor = 1 - this.compactnessFactorItem
    layout.allowOverlaps = this.allowOverlapsItem
    layout.fromSketchMode = this.balloonFromSketchItem
    layout.chainStraighteningMode = this.straightenChainsItem
    layout.interleavedMode = this.placeChildrenInterleavedItem
      ? InterleavedMode.ALL_NODES
      : InterleavedMode.OFF

    switch (this.nodeLabelingStyleItem) {
      case BalloonLayoutConfig.EnumNodeLabelingPolicies.NONE:
        layout.considerNodeLabels = false
        break
      case BalloonLayoutConfig.EnumNodeLabelingPolicies.RAYLIKE_LEAVES:
        layout.integratedNodeLabeling = true
        layout.nodeLabelingPolicy = NodeLabelingPolicy.RAY_LIKE_LEAVES
        break
      case BalloonLayoutConfig.EnumNodeLabelingPolicies.CONSIDER_CURRENT_POSITION:
        layout.considerNodeLabels = true
        break
      case BalloonLayoutConfig.EnumNodeLabelingPolicies.HORIZONTAL:
        layout.integratedNodeLabeling = true
        layout.nodeLabelingPolicy = NodeLabelingPolicy.HORIZONTAL
        break
      default:
        layout.considerNodeLabels = false
        break
    }

    // configures tree reduction state and non-tree edge routing.
    layout.subgraphLayoutEnabled = this.actOnSelectionOnlyItem
    const multiStageLayout = layout

    const treeReductionStage = new TreeReductionStage()
    multiStageLayout.appendStage(treeReductionStage)
    if (this.routingStyleForNonTreeEdgesItem === BalloonLayoutConfig.EnumRoute.ORGANIC) {
      const organic = new OrganicEdgeRouter()
      treeReductionStage.nonTreeEdgeRouter = organic
      treeReductionStage.nonTreeEdgeSelectionKey = OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
    } else if (this.routingStyleForNonTreeEdgesItem === BalloonLayoutConfig.EnumRoute.ORTHOGONAL) {
      const edgeRouter = new EdgeRouter()
      edgeRouter.rerouting = true
      edgeRouter.scope = 'ROUTE_AFFECTED_EDGES'
      treeReductionStage.nonTreeEdgeSelectionKey = edgeRouter.affectedEdgesDpKey
      treeReductionStage.nonTreeEdgeRouter = edgeRouter
    } else if (
      this.routingStyleForNonTreeEdgesItem === BalloonLayoutConfig.EnumRoute.STRAIGHTLINE
    ) {
      treeReductionStage.nonTreeEdgeRouter = treeReductionStage.createStraightLineRouter()
    } else if (this.routingStyleForNonTreeEdgesItem === BalloonLayoutConfig.EnumRoute.BUNDLED) {
      const ebc = treeReductionStage.edgeBundling
      ebc.bundlingStrength = this.edgeBundlingStrengthItem
      ebc.defaultBundleDescriptor = new EdgeBundleDescriptor({
        bundled: this.routingStyleForNonTreeEdgesItem === BalloonLayoutConfig.EnumRoute.BUNDLED
      })
    }

    if (this.edgeLabelingItem === BalloonLayoutConfig.EnumEdgeLabeling.GENERIC) {
      layout.integratedEdgeLabeling = false

      const genericLabeling = new GenericLabeling()
      genericLabeling.placeEdgeLabels = true
      genericLabeling.placeNodeLabels = false
      genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
      layout.labelingEnabled = true
      layout.labeling = genericLabeling
    } else if (this.edgeLabelingItem === BalloonLayoutConfig.EnumEdgeLabeling.INTEGRATED) {
      layout.integratedEdgeLabeling = true
      treeReductionStage.nonTreeEdgeLabelingAlgorithm = new GenericLabeling()
    }

    if (
      this.nodeLabelingStyleItem === BalloonLayoutConfig.EnumNodeLabelingPolicies.RAYLIKE_LEAVES ||
      this.nodeLabelingStyleItem === BalloonLayoutConfig.EnumNodeLabelingPolicies.HORIZONTAL
    ) {
      graphComponent.graph.nodeLabels.forEach(label => {
        graphComponent.graph.setLabelLayoutParameter(
          label,
          FreeNodeLabelModel.INSTANCE.findBestParameter(
            label,
            FreeNodeLabelModel.INSTANCE,
            label.layout
          )
        )
      })
    }

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
   * Creates and configures the layout data.
   * @return {LayoutData} The configured layout data.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData = new BalloonLayoutData()

    if (this.rootNodePolicyItem === RootNodePolicy.SELECTED_ROOT) {
      const selection = graphComponent.selection.selectedNodes

      if (selection.size > 0) {
        const root = selection.first()
        layoutData.treeRoot = node => node === root
      }
    }

    return layoutData
  },

  // ReSharper disable InconsistentNaming
  // ReSharper disable UnusedMember.Global
  /** @type {OptionGroup} */
  DescriptionGroup: {
    $meta: function () {
      return [
        LabelAttribute('Description'),
        OptionGroupAttribute('RootGroup', 5),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  GeneralGroup: {
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

  // ReSharper restore UnusedMember.Global
  // ReSharper restore InconsistentNaming
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
      return (
        "<p style='margin-top:0'>The balloon layout style is a tree layout style that" +
        ' positions the subtrees in a radial fashion around their root nodes. It is ideally' +
        ' suited for larger trees.</p>'
      )
    }
  },

  /**
   * Backing field for below property
   * @type {RootNodePolicy}
   */
  $rootNodePolicyItem: null,

  /** @type {RootNodePolicy} */
  rootNodePolicyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Root Node Policy',
          '#/api/BalloonLayout#BalloonLayout-property-rootNodePolicy'
        ),
        OptionGroupAttribute('GeneralGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Directed Root', RootNodePolicy.DIRECTED_ROOT],
            ['Center Root', RootNodePolicy.CENTER_ROOT],
            ['Weighted Center Root', RootNodePolicy.WEIGHTED_CENTER_ROOT],
            ['Selected Root', RootNodePolicy.SELECTED_ROOT]
          ]
        }),
        TypeAttribute(RootNodePolicy.$class)
      ]
    },
    get: function () {
      return this.$rootNodePolicyItem
    },
    set: function (value) {
      this.$rootNodePolicyItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {BalloonLayoutConfig.EnumRoute}
   */
  $routingStyleForNonTreeEdgesItem: null,

  /** @type {BalloonLayoutConfig.EnumRoute} */
  routingStyleForNonTreeEdgesItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Routing Style for Non-Tree Edges',
          '#/api/TreeReductionStage#TreeReductionStage-property-nonTreeEdgeRouter'
        ),
        OptionGroupAttribute('GeneralGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Orthogonal', BalloonLayoutConfig.EnumRoute.ORTHOGONAL],
            ['Organic', BalloonLayoutConfig.EnumRoute.ORGANIC],
            ['Straight-Line', BalloonLayoutConfig.EnumRoute.STRAIGHTLINE],
            ['Bundled', BalloonLayoutConfig.EnumRoute.BUNDLED]
          ]
        }),
        TypeAttribute(BalloonLayoutConfig.EnumRoute.$class)
      ]
    },
    get: function () {
      return this.$routingStyleForNonTreeEdgesItem
    },
    set: function (value) {
      this.$routingStyleForNonTreeEdgesItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $actOnSelectionOnlyItem: false,

  /** @type {boolean} */
  actOnSelectionOnlyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Act on Selection Only',
          '#/api/BalloonLayout#MultiStageLayout-property-subgraphLayoutEnabled'
        ),
        OptionGroupAttribute('GeneralGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$actOnSelectionOnlyItem
    },
    set: function (value) {
      this.$actOnSelectionOnlyItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $edgeBundlingStrengthItem: 1.0,

  /** @type {number} */
  edgeBundlingStrengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Bundling Strength',
          '#/api/EdgeBundling#EdgeBundling-property-bundlingStrength'
        ),
        OptionGroupAttribute('GeneralGroup', 40),
        MinMaxAttribute().init({
          min: 0,
          max: 1.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$edgeBundlingStrengthItem
    },
    set: function (value) {
      this.$edgeBundlingStrengthItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableEdgeBundlingStrengthItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.routingStyleForNonTreeEdgesItem !== BalloonLayoutConfig.EnumRoute.BUNDLED
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $preferredChildWedgeItem: 0,

  /** @type {number} */
  preferredChildWedgeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Preferred Child Wedge',
          '#/api/BalloonLayout#BalloonLayout-property-preferredChildWedge'
        ),
        OptionGroupAttribute('GeneralGroup', 50),
        MinMaxAttribute().init({
          min: 1,
          max: 359
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$preferredChildWedgeItem
    },
    set: function (value) {
      this.$preferredChildWedgeItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $preferredRootWedgeItem: 0,

  /** @type {number} */
  preferredRootWedgeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Preferred Root Wedge',
          '#/api/BalloonLayout#BalloonLayout-property-preferredRootWedge'
        ),
        OptionGroupAttribute('GeneralGroup', 60),
        MinMaxAttribute().init({
          min: 1,
          max: 360
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$preferredRootWedgeItem
    },
    set: function (value) {
      this.$preferredRootWedgeItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumEdgeLengthItem: 0,

  /** @type {number} */
  minimumEdgeLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Edge Length',
          '#/api/BalloonLayout#BalloonLayout-property-minimumEdgeLength'
        ),
        OptionGroupAttribute('GeneralGroup', 70),
        MinMaxAttribute().init({
          min: 10,
          max: 400
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$minimumEdgeLengthItem
    },
    set: function (value) {
      this.$minimumEdgeLengthItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $compactnessFactorItem: 0,

  /** @type {number} */
  compactnessFactorItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Compactness Factor',
          '#/api/BalloonLayout#BalloonLayout-property-compactnessFactor'
        ),
        OptionGroupAttribute('GeneralGroup', 80),
        MinMaxAttribute().init({
          min: 0.1,
          max: 0.9,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$compactnessFactorItem
    },
    set: function (value) {
      this.$compactnessFactorItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $allowOverlapsItem: false,

  /** @type {boolean} */
  allowOverlapsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Allow Overlaps',
          '#/api/BalloonLayout#BalloonLayout-property-allowOverlaps'
        ),
        OptionGroupAttribute('GeneralGroup', 90),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$allowOverlapsItem
    },
    set: function (value) {
      this.$allowOverlapsItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $balloonFromSketchItem: false,

  /** @type {boolean} */
  balloonFromSketchItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Use Drawing as Sketch',
          '#/api/BalloonLayout#BalloonLayout-property-fromSketchMode'
        ),
        OptionGroupAttribute('GeneralGroup', 100),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$balloonFromSketchItem
    },
    set: function (value) {
      this.$balloonFromSketchItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $placeChildrenInterleavedItem: false,

  /** @type {boolean} */
  placeChildrenInterleavedItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Place Children Interleaved',
          '#/api/BalloonLayout#BalloonLayout-property-interleavedMode'
        ),
        OptionGroupAttribute('GeneralGroup', 110),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$placeChildrenInterleavedItem
    },
    set: function (value) {
      this.$placeChildrenInterleavedItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $straightenChainsItem: false,

  /** @type {boolean} */
  straightenChainsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Straighten Chains',
          '#/api/BalloonLayout#BalloonLayout-property-chainStraighteningMode'
        ),
        OptionGroupAttribute('GeneralGroup', 120),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$straightenChainsItem
    },
    set: function (value) {
      this.$straightenChainsItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {BalloonLayoutConfig.EnumNodeLabelingPolicies}
   */
  $nodeLabelingStyleItem: null,

  /** @type {BalloonLayoutConfig.EnumNodeLabelingPolicies} */
  nodeLabelingStyleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Node Labeling',
          '#/api/BalloonLayout#BalloonLayout-property-considerNodeLabels'
        ),
        OptionGroupAttribute('NodePropertiesGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Ignore Labels', BalloonLayoutConfig.EnumNodeLabelingPolicies.NONE],
            [
              'Consider Labels',
              BalloonLayoutConfig.EnumNodeLabelingPolicies.CONSIDER_CURRENT_POSITION
            ],
            ['Horizontal', BalloonLayoutConfig.EnumNodeLabelingPolicies.HORIZONTAL],
            ['Ray-like at Leaves', BalloonLayoutConfig.EnumNodeLabelingPolicies.RAYLIKE_LEAVES]
          ]
        }),
        TypeAttribute(BalloonLayoutConfig.EnumNodeLabelingPolicies.$class)
      ]
    },
    get: function () {
      return this.$nodeLabelingStyleItem
    },
    set: function (value) {
      this.$nodeLabelingStyleItem = value
    }
  },

  /**
   * @type {BalloonLayoutConfig.EnumEdgeLabeling}
   */
  $edgeLabelingItem: null,

  /** @type {BalloonLayoutConfig.EnumEdgeLabeling} */
  edgeLabelingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Labeling',
          '#/api/BalloonLayout#MultiStageLayout-property-labelingEnabled'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['None', BalloonLayoutConfig.EnumEdgeLabeling.NONE],
            ['Integrated', BalloonLayoutConfig.EnumEdgeLabeling.INTEGRATED],
            ['Generic', BalloonLayoutConfig.EnumEdgeLabeling.GENERIC]
          ]
        }),
        TypeAttribute(BalloonLayoutConfig.EnumEdgeLabeling.$class)
      ]
    },
    get: function () {
      return this.$edgeLabelingItem
    },
    set: function (value) {
      this.$edgeLabelingItem = value
      if (value === BalloonLayoutConfig.EnumEdgeLabeling.INTEGRATED) {
        this.labelPlacementOrientationItem =
          LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL
        this.labelPlacementAlongEdgeItem = LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET
        this.labelPlacementDistanceItem = 0
      }
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $reduceAmbiguityItem: false,

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
    get: function () {
      return this.$reduceAmbiguityItem
    },
    set: function (value) {
      this.$reduceAmbiguityItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.edgeLabelingItem !== BalloonLayoutConfig.EnumEdgeLabeling.GENERIC
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutConfiguration.EnumLabelPlacementOrientation}
   */
  $labelPlacementOrientationItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementOrientation} */
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
            ['Parallel', LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL],
            ['Orthogonal', LayoutConfiguration.EnumLabelPlacementOrientation.ORTHOGONAL],
            ['Horizontal', LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL],
            ['Vertical', LayoutConfiguration.EnumLabelPlacementOrientation.VERTICAL]
          ]
        }),
        TypeAttribute(LayoutConfiguration.EnumLabelPlacementOrientation.$class)
      ]
    },
    get: function () {
      return this.$labelPlacementOrientationItem
    },
    set: function (value) {
      this.$labelPlacementOrientationItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.edgeLabelingItem === BalloonLayoutConfig.EnumEdgeLabeling.NONE ||
        this.edgeLabelingItem === BalloonLayoutConfig.EnumEdgeLabeling.INTEGRATED
      )
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutConfiguration.EnumLabelPlacementAlongEdge}
   */
  $labelPlacementAlongEdgeItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementAlongEdge} */
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
            ['Anywhere', LayoutConfiguration.EnumLabelPlacementAlongEdge.ANYWHERE],
            ['At Source', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_SOURCE],
            ['At Source Port', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_SOURCE_PORT],
            ['At Target', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET],
            ['At Target Port', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET_PORT],
            ['Centered', LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED]
          ]
        }),
        TypeAttribute(LayoutConfiguration.EnumLabelPlacementAlongEdge.$class)
      ]
    },
    get: function () {
      return this.$labelPlacementAlongEdgeItem
    },
    set: function (value) {
      this.$labelPlacementAlongEdgeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.edgeLabelingItem === BalloonLayoutConfig.EnumEdgeLabeling.NONE ||
        this.edgeLabelingItem === BalloonLayoutConfig.EnumEdgeLabeling.INTEGRATED
      )
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutConfiguration.EnumLabelPlacementSideOfEdge}
   */
  $labelPlacementSideOfEdgeItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementSideOfEdge} */
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
    get: function () {
      return this.$labelPlacementSideOfEdgeItem
    },
    set: function (value) {
      this.$labelPlacementSideOfEdgeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.edgeLabelingItem === BalloonLayoutConfig.EnumEdgeLabeling.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $labelPlacementDistanceItem: 0,

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
    get: function () {
      return this.$labelPlacementDistanceItem
    },
    set: function (value) {
      this.$labelPlacementDistanceItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.edgeLabelingItem === BalloonLayoutConfig.EnumEdgeLabeling.NONE ||
        this.edgeLabelingItem === BalloonLayoutConfig.EnumEdgeLabeling.INTEGRATED ||
        this.labelPlacementSideOfEdgeItem ===
          LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
      )
    }
  },

  $initBalloonLayoutConfig: function () {
    this.$rootNodePolicyItem = RootNodePolicy.DIRECTED_ROOT
    this.$routingStyleForNonTreeEdgesItem = BalloonLayoutConfig.EnumRoute.ORTHOGONAL
    this.$nodeLabelingStyleItem = BalloonLayoutConfig.EnumNodeLabelingPolicies.NONE
    this.$edgeLabelingItem = BalloonLayoutConfig.EnumEdgeLabeling.NONE
    this.$labelPlacementOrientationItem = LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL
    this.$labelPlacementAlongEdgeItem = LayoutConfiguration.EnumLabelPlacementAlongEdge.ANYWHERE
    this.$labelPlacementSideOfEdgeItem = LayoutConfiguration.EnumLabelPlacementSideOfEdge.ANYWHERE
  },

  $static: {
    EnumRoute: new EnumDefinition(() => {
      return {
        ORTHOGONAL: 0,
        ORGANIC: 1,
        STRAIGHTLINE: 2,
        BUNDLED: 3
      }
    }),

    EnumEdgeLabeling: new EnumDefinition(() => {
      return {
        NONE: 0,
        INTEGRATED: 1,
        GENERIC: 2
      }
    }),

    EnumNodeLabelingPolicies: new EnumDefinition(() => {
      return {
        NONE: 0,
        HORIZONTAL: 1,
        RAYLIKE_LEAVES: 2,
        CONSIDER_CURRENT_POSITION: 3
      }
    })
  }
})
export default BalloonLayoutConfig
