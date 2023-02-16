/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  BalloonLayout,
  BalloonLayoutData,
  Class,
  ComponentArrangementStyles,
  ComponentLayout,
  EdgeBundleDescriptor,
  EdgeRouter,
  EdgeRouterScope,
  Enum,
  FreeNodeLabelModel,
  GenericLabeling,
  GraphComponent,
  ILayoutAlgorithm,
  InterleavedMode,
  LayoutData,
  NodeLabelingPolicy,
  OrganicEdgeRouter,
  RootNodePolicy,
  TreeReductionStage,
  YBoolean,
  YNumber,
  YString
} from 'yfiles'

import LayoutConfiguration, {
  EdgeLabeling,
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge,
  NodeLabelingPolicies
} from './LayoutConfiguration.js'
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
    const layout = new BalloonLayout()

    this.rootNodePolicyItem = RootNodePolicy.DIRECTED_ROOT
    this.routingStyleForNonTreeEdgesItem = RoutingStyle.ORTHOGONAL
    this.actOnSelectionOnlyItem = false
    this.preferredChildWedgeItem = layout.preferredChildWedge
    this.preferredRootWedgeItem = layout.preferredRootWedge
    this.minimumEdgeLengthItem = layout.minimumEdgeLength
    this.compactnessFactorItem = layout.compactnessFactor
    this.allowOverlapsItem = layout.allowOverlaps
    this.balloonFromSketchItem = layout.fromSketchMode
    this.placeChildrenInterleavedItem = layout.interleavedMode === InterleavedMode.ALL_NODES
    this.straightenChainsItem = layout.chainStraighteningMode

    this.nodeLabelingStyleItem = NodeLabelingPolicies.CONSIDER_CURRENT_POSITION
    this.edgeLabelingItem = EdgeLabeling.NONE
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
    this.title = 'Balloon Layout'
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
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
      case NodeLabelingPolicies.NONE:
        layout.considerNodeLabels = false
        break
      case NodeLabelingPolicies.RAYLIKE_LEAVES:
        layout.integratedNodeLabeling = true
        layout.nodeLabelingPolicy = NodeLabelingPolicy.RAY_LIKE_LEAVES
        break
      case NodeLabelingPolicies.CONSIDER_CURRENT_POSITION:
        layout.considerNodeLabels = true
        break
      case NodeLabelingPolicies.HORIZONTAL:
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
    if (this.routingStyleForNonTreeEdgesItem === RoutingStyle.ORGANIC) {
      treeReductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()
      treeReductionStage.nonTreeEdgeSelectionKey = OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
    } else if (this.routingStyleForNonTreeEdgesItem === RoutingStyle.ORTHOGONAL) {
      const edgeRouter = new EdgeRouter()
      edgeRouter.rerouting = true
      edgeRouter.scope = EdgeRouterScope.ROUTE_AFFECTED_EDGES
      treeReductionStage.nonTreeEdgeSelectionKey = edgeRouter.affectedEdgesDpKey
      treeReductionStage.nonTreeEdgeRouter = edgeRouter
    } else if (this.routingStyleForNonTreeEdgesItem === RoutingStyle.STRAIGHTLINE) {
      treeReductionStage.nonTreeEdgeRouter = treeReductionStage.createStraightLineRouter()
    } else if (this.routingStyleForNonTreeEdgesItem === RoutingStyle.BUNDLED) {
      const ebc = treeReductionStage.edgeBundling
      ebc.bundlingStrength = this.edgeBundlingStrengthItem
      ebc.defaultBundleDescriptor = new EdgeBundleDescriptor({
        bundled: this.routingStyleForNonTreeEdgesItem === RoutingStyle.BUNDLED
      })
    }

    if (this.edgeLabelingItem === EdgeLabeling.GENERIC) {
      layout.integratedEdgeLabeling = false

      const genericLabeling = new GenericLabeling()
      genericLabeling.placeEdgeLabels = true
      genericLabeling.placeNodeLabels = false
      genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
      layout.labelingEnabled = true
      layout.labeling = genericLabeling
    } else if (this.edgeLabelingItem === EdgeLabeling.INTEGRATED) {
      layout.integratedEdgeLabeling = true
      treeReductionStage.nonTreeEdgeLabelingAlgorithm = new GenericLabeling()
    }

    if (
      this.nodeLabelingStyleItem === NodeLabelingPolicies.RAYLIKE_LEAVES ||
      this.nodeLabelingStyleItem === NodeLabelingPolicies.HORIZONTAL
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

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData = new BalloonLayoutData()

    if (this.rootNodePolicyItem === RootNodePolicy.SELECTED_ROOT) {
      const selection = graphComponent.selection.selectedNodes
      if (selection.size > 0) {
        layoutData.treeRoot.item = selection.first()
      }
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
    value: null
  },

  /** @type {RoutingStyle} */
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
            ['Orthogonal', RoutingStyle.ORTHOGONAL],
            ['Organic', RoutingStyle.ORGANIC],
            ['Straight-Line', RoutingStyle.STRAIGHTLINE],
            ['Bundled', RoutingStyle.BUNDLED]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

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
    value: false
  },

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
    value: 1.0
  },

  /** @type {boolean} */
  shouldDisableEdgeBundlingStrengthItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.routingStyleForNonTreeEdgesItem !== RoutingStyle.BUNDLED
    }
  },

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
    value: 0
  },

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
    value: 0
  },

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
    value: 0
  },

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
    value: 0
  },

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
    value: false
  },

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
    value: false
  },

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
    value: false
  },

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
    value: false
  },

  /** @type {NodeLabelingPolicies} */
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
            ['Ignore Labels', NodeLabelingPolicies.NONE],
            ['Consider Labels', NodeLabelingPolicies.CONSIDER_CURRENT_POSITION],
            ['Horizontal', NodeLabelingPolicies.HORIZONTAL],
            ['Ray-like at Leaves', NodeLabelingPolicies.RAYLIKE_LEAVES]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /**
   * @type {EdgeLabeling}
   */
  $edgeLabelingItem: null,

  /** @type {EdgeLabeling} */
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
            ['None', EdgeLabeling.NONE],
            ['Integrated', EdgeLabeling.INTEGRATED],
            ['Generic', EdgeLabeling.GENERIC]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    get: function () {
      return this.$edgeLabelingItem
    },
    set: function (value) {
      this.$edgeLabelingItem = value
      if (value === EdgeLabeling.INTEGRATED) {
        this.labelPlacementOrientationItem = LabelPlacementOrientation.PARALLEL
        this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.AT_TARGET
        this.labelPlacementDistanceItem = 0
      }
    }
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
  shouldDisableReduceAmbiguityItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
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
  shouldDisableLabelPlacementOrientationItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.edgeLabelingItem === EdgeLabeling.NONE ||
        this.edgeLabelingItem === EdgeLabeling.INTEGRATED
      )
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
  shouldDisableLabelPlacementAlongEdgeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.edgeLabelingItem === EdgeLabeling.NONE ||
        this.edgeLabelingItem === EdgeLabeling.INTEGRATED
      )
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
  shouldDisableLabelPlacementSideOfEdgeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
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
  shouldDisableLabelPlacementDistanceItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.edgeLabelingItem === EdgeLabeling.NONE ||
        this.edgeLabelingItem === EdgeLabeling.INTEGRATED ||
        this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
      )
    }
  }
})
export default BalloonLayoutConfig

export /**
 * @readonly
 * @enum {number}
 */
const RoutingStyle = {
  ORTHOGONAL: 0,
  ORGANIC: 1,
  STRAIGHTLINE: 2,
  BUNDLED: 3
}
