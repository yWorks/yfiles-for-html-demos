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
  CenterNodesPolicy,
  Class,
  EdgeBundleDescriptor,
  Enum,
  FreeNodeLabelModel,
  GenericLabeling,
  GraphComponent,
  ILayoutAlgorithm,
  LayoutData,
  NodeLabelingPolicy,
  RadialLayout,
  RadialLayoutData,
  RadialLayoutEdgeRoutingStrategy,
  RadialLayoutLayeringStrategy,
  YBoolean,
  YNumber,
  YString
} from 'yfiles'

import LayoutConfiguration, {
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge,
  NodeLabelingPolicies
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
} from 'demo-resources/demo-option-editor'

/**
 * @type {number}
 */
const MAXIMUM_SMOOTHNESS = 10

/**
 * @type {number}
 */
const MINIMUM_SMOOTHNESS = 1

/**
 * @type {number}
 */
const SMOOTHNESS_ANGLE_FACTOR = 4

/**
 * Configuration options for the layout algorithm of the same name.
 */
const RadialLayoutConfig = (Class as any)('RadialLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('RadialLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)

    const layout = new RadialLayout()

    this.centerStrategyItem = CenterNodesPolicy.WEIGHTED_CENTRALITY
    this.layeringStrategyItem = RadialLayoutLayeringStrategy.BFS
    this.minimumLayerDistanceItem = layout.minimumLayerDistance | 0
    this.minimumNodeToNodeDistanceItem = layout.minimumNodeToNodeDistance | 0
    this.maximumChildSectorSizeItem = layout.maximumChildSectorAngle | 0
    this.edgeRoutingStrategyItem = RadialLayoutEdgeRoutingStrategy.ARC
    this.edgeSmoothnessItem = MAXIMUM_SMOOTHNESS
    this.edgeBundlingStrengthItem = 0.95

    this.edgeLabelingItem = false
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10
    this.title = 'Radial Layout'

    this.nodeLabelingStyleItem = NodeLabelingPolicies.CONSIDER_CURRENT_POSITION
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph.mapperRegistry} if necessary.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const layout = new RadialLayout()
    layout.minimumNodeToNodeDistance = this.minimumNodeToNodeDistanceItem

    if (this.edgeRoutingStrategyItem !== EdgeRoutingStrategies.BUNDLED) {
      layout.edgeRoutingStrategy = this.edgeRoutingStrategyItem
    }
    layout.minimumBendAngle =
      1 + (MAXIMUM_SMOOTHNESS - this.edgeSmoothnessItem) * SMOOTHNESS_ANGLE_FACTOR
    layout.minimumLayerDistance = this.minimumLayerDistanceItem
    layout.maximumChildSectorAngle = this.maximumChildSectorSizeItem
    layout.centerNodesPolicy = this.centerStrategyItem
    layout.layeringStrategy = this.layeringStrategyItem

    const ebc = layout.edgeBundling
    ebc.bundlingStrength = this.edgeBundlingStrengthItem
    ebc.defaultBundleDescriptor = new EdgeBundleDescriptor({
      bundled: this.edgeRoutingStrategyItem === EdgeRoutingStrategies.BUNDLED
    })

    if (this.edgeLabelingItem) {
      const labeling = new GenericLabeling()
      labeling.placeEdgeLabels = true
      labeling.placeNodeLabels = false
      labeling.reduceAmbiguity = this.reduceAmbiguityItem
      layout.labelingEnabled = true
      layout.labeling = labeling
    }

    switch (this.nodeLabelingStyleItem) {
      case NodeLabelingPolicies.NONE:
        layout.considerNodeLabels = false
        break
      case NodeLabelingPolicies.RAYLIKE_LEAVES:
        layout.integratedNodeLabeling = true
        layout.nodeLabelingPolicy = NodeLabelingPolicy.RAY_LIKE_LEAVES
        break
      case NodeLabelingPolicies.RAYLIKE:
        layout.integratedNodeLabeling = true
        layout.nodeLabelingPolicy = NodeLabelingPolicy.RAY_LIKE
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

    if (
      this.nodeLabelingStyleItem === NodeLabelingPolicies.RAYLIKE_LEAVES ||
      this.nodeLabelingStyleItem === NodeLabelingPolicies.RAYLIKE ||
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
  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: RadialLayout
  ): LayoutData {
    let layoutData
    if (this.centerStrategyItem === CenterNodesPolicy.CUSTOM) {
      layoutData = new RadialLayoutData({
        centerNodes: node => graphComponent.selection.isSelected(node)
      })
    } else {
      layoutData = new RadialLayoutData()
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
        '<p>The radial layout style arranges the nodes of a graph on concentric circles. Similar to hierarchic layouts, the overall flow of the graph is nicely visualized.</p>' +
        '<p>This style is well suited for the visualization of directed graphs and tree-like structures.</p>'
      )
    }
  },

  /** @type {number} */
  minimumLayerDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Circle Distance',
          '#/api/RadialLayout#RadialLayout-property-minimumLayerDistance'
        ),
        OptionGroupAttribute('GeneralGroup', 10),
        MinMaxAttribute().init({
          min: 1,
          max: 1000
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 1
  },

  /** @type {number} */
  minimumNodeToNodeDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Node Distance',
          '#/api/RadialLayout#RadialLayout-property-minimumNodeToNodeDistance'
        ),
        OptionGroupAttribute('GeneralGroup', 20),
        MinMaxAttribute().init({
          min: 0,
          max: 300
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {number} */
  maximumChildSectorSizeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Maximum Child Sector Size',
          '#/api/RadialLayout#RadialLayout-property-maximumChildSectorAngle'
        ),
        OptionGroupAttribute('GeneralGroup', 30),
        MinMaxAttribute().init({
          min: 15,
          max: 360
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 15
  },

  /** @type {RadialLayoutEdgeRoutingStrategy} */
  edgeRoutingStrategyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Routing Style',
          '#/api/RadialLayout#RadialLayout-property-edgeRoutingStrategy'
        ),
        OptionGroupAttribute('GeneralGroup', 40),
        EnumValuesAttribute().init({
          values: [
            ['Straight', EdgeRoutingStrategies.POLYLINE],
            ['Arc', EdgeRoutingStrategies.ARC],
            ['Curved', EdgeRoutingStrategies.CURVED],
            ['Radial Polyline', EdgeRoutingStrategies.RADIAL_POLYLINE],
            ['Bundled', EdgeRoutingStrategies.BUNDLED]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  edgeSmoothnessItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Arc Smoothness',
          '#/api/RadialLayout#RadialLayout-property-minimumBendAngle'
        ),
        OptionGroupAttribute('GeneralGroup', 50),
        MinMaxAttribute().init({
          min: MINIMUM_SMOOTHNESS,
          max: MAXIMUM_SMOOTHNESS
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: MINIMUM_SMOOTHNESS
  },

  /** @type {boolean} */
  shouldDisableEdgeSmoothnessItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeRoutingStrategyItem !== RadialLayoutEdgeRoutingStrategy.ARC
    }
  },

  /** @type {number} */
  edgeBundlingStrengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Bundling Strength',
          '#/api/EdgeBundling#EdgeBundling-property-bundlingStrength'
        ),
        OptionGroupAttribute('GeneralGroup', 55),
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
  shouldDisableEdgeBundlingStrengthItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeRoutingStrategyItem !== EdgeRoutingStrategies.BUNDLED
    }
  },

  /** @type {CenterNodesPolicy} */
  centerStrategyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Center Allocation Strategy',
          '#/api/RadialLayout#RadialLayout-property-centerNodesPolicy'
        ),
        OptionGroupAttribute('GeneralGroup', 60),
        EnumValuesAttribute().init({
          values: [
            ['Directed', CenterNodesPolicy.DIRECTED],
            ['Centrality', CenterNodesPolicy.CENTRALITY],
            ['Weighted Centrality', CenterNodesPolicy.WEIGHTED_CENTRALITY],
            ['Selected Nodes', CenterNodesPolicy.CUSTOM]
          ]
        }),
        TypeAttribute(CenterNodesPolicy.$class)
      ]
    },
    value: null
  },

  /** @type {RadialLayoutLayeringStrategy} */
  layeringStrategyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Circle Assignment Strategy',
          '#/api/RadialLayout#RadialLayout-property-layeringStrategy'
        ),
        OptionGroupAttribute('GeneralGroup', 70),
        EnumValuesAttribute().init({
          values: [
            ['Distance From Center', RadialLayoutLayeringStrategy.BFS],
            ['Hierarchic', RadialLayoutLayeringStrategy.HIERARCHICAL],
            ['Dendrogram', RadialLayoutLayeringStrategy.DENDROGRAM]
          ]
        }),
        TypeAttribute(RadialLayoutLayeringStrategy.$class)
      ]
    },
    value: null
  },

  /** @type {NodeLabelingPolicies} */
  nodeLabelingStyleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Node Labeling',
          '#/api/RadialLayout#RadialLayout-property-nodeLabelingPolicy'
        ),
        OptionGroupAttribute('NodePropertiesGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Ignore Labels', NodeLabelingPolicies.NONE],
            ['Consider Labels', NodeLabelingPolicies.CONSIDER_CURRENT_POSITION],
            ['Horizontal', NodeLabelingPolicies.HORIZONTAL],
            ['Ray-like at Leaves', NodeLabelingPolicies.RAYLIKE_LEAVES],
            ['Ray-like', NodeLabelingPolicies.RAYLIKE]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  edgeLabelingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Labeling',
          '#/api/RadialLayout#MultiStageLayout-property-labelingEnabled'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
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
      return !this.edgeLabelingItem
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
      return !this.edgeLabelingItem
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
      return !this.edgeLabelingItem
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
      return !this.edgeLabelingItem
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
        !this.edgeLabelingItem ||
        this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
      )
    }
  }
})
export default RadialLayoutConfig

enum EdgeRoutingStrategies {
  ARC = RadialLayoutEdgeRoutingStrategy.ARC as number,
  POLYLINE = RadialLayoutEdgeRoutingStrategy.POLYLINE as number,
  CURVED = RadialLayoutEdgeRoutingStrategy.CURVED as number,
  RADIAL_POLYLINE = RadialLayoutEdgeRoutingStrategy.RADIAL_POLYLINE as number,
  BUNDLED = 4
}
