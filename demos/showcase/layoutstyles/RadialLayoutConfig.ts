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
  CenterNodesPolicy,
  Class,
  EdgeBundleDescriptor,
  GenericLabeling,
  GraphComponent,
  ILayoutAlgorithm,
  LayoutData,
  RadialLayeringStrategy,
  RadialLayout,
  RadialLayoutData,
  RadialLayoutRoutingStyle,
  RadialNodeLabelPlacement
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

enum EdgeRoutingStrategies {
  ARC = RadialLayoutRoutingStyle.ARC as number,
  POLYLINE = RadialLayoutRoutingStyle.POLYLINE as number,
  CURVED = RadialLayoutRoutingStyle.CURVED as number,
  RADIAL_POLYLINE = RadialLayoutRoutingStyle.RADIAL_POLYLINE as number,
  BUNDLED = 4
}

enum CenterPolicy {
  DIRECTED = 0,
  CENTRALITY = 1,
  WEIGHTED_CENTRALITY = 2,
  CUSTOM = 3
}

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
export const RadialLayoutConfig = (Class as any)('RadialLayoutConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    GeneralGroup: [
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
    descriptionText: [
      new OptionGroupAttribute('DescriptionGroup', 10),
      new ComponentAttribute(Components.HTML_BLOCK),
      new TypeAttribute(String)
    ],
    minimumLayerDistanceItem: [
      new LabelAttribute(
        'Minimum Circle Distance',
        '#/api/RadialLayout#RadialLayout-property-minimumLayerDistance'
      ),
      new OptionGroupAttribute('GeneralGroup', 10),
      new MinMaxAttribute(1, 1000),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumNodeToNodeDistanceItem: [
      new LabelAttribute(
        'Minimum Node Distance',
        '#/api/RadialLayout#RadialLayout-property-minimumNodeDistance'
      ),
      new OptionGroupAttribute('GeneralGroup', 20),
      new MinMaxAttribute(0, 300),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    maximumChildSectorAngleItem: [
      new LabelAttribute(
        'Maximum Child Sector Angle',
        '#/api/RadialLayout#RadialLayout-property-maximumChildSectorAngle'
      ),
      new OptionGroupAttribute('GeneralGroup', 30),
      new MinMaxAttribute(15, 360),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    edgeRoutingStrategyItem: [
      new LabelAttribute(
        'Routing Style',
        '#/api/RadialLayout#RadialLayout-property-edgeRoutingStyle'
      ),
      new OptionGroupAttribute('GeneralGroup', 40),
      new EnumValuesAttribute([
        ['Straight', EdgeRoutingStrategies.POLYLINE],
        ['Arc', EdgeRoutingStrategies.ARC],
        ['Curved', EdgeRoutingStrategies.CURVED],
        ['Radial Polyline', EdgeRoutingStrategies.RADIAL_POLYLINE],
        ['Bundled', EdgeRoutingStrategies.BUNDLED]
      ]),
      new TypeAttribute(EdgeRoutingStrategies)
    ],
    edgeSmoothnessItem: [
      new LabelAttribute(
        'Arc Smoothness',
        '#/api/RadialLayout#RadialLayout-property-minimumBendAngle'
      ),
      new OptionGroupAttribute('GeneralGroup', 50),
      new MinMaxAttribute(MINIMUM_SMOOTHNESS, MAXIMUM_SMOOTHNESS),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    edgeBundlingStrengthItem: [
      new LabelAttribute(
        'Bundling Strength',
        '#/api/EdgeBundling#EdgeBundling-property-bundlingStrength'
      ),
      new OptionGroupAttribute('GeneralGroup', 55),
      new MinMaxAttribute(0, 1.0, 0.01),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    centerStrategyItem: [
      new LabelAttribute(
        'Center Allocation Strategy',
        '#/api/RadialLayout#RadialLayout-property-centerNodesPolicy'
      ),
      new OptionGroupAttribute('GeneralGroup', 60),
      new EnumValuesAttribute([
        ['Directed', CenterPolicy.DIRECTED],
        ['Centrality', CenterPolicy.CENTRALITY],
        ['Weighted Centrality', CenterPolicy.WEIGHTED_CENTRALITY],
        ['Selected Nodes', CenterPolicy.CUSTOM]
      ]),
      new TypeAttribute(CenterPolicy)
    ],
    layeringStrategyItem: [
      new LabelAttribute(
        'Circle Assignment Strategy',
        '#/api/RadialLayout#RadialLayout-property-layeringStrategy'
      ),
      new OptionGroupAttribute('GeneralGroup', 70),
      new EnumValuesAttribute([
        ['Distance From Center', RadialLayeringStrategy.BFS],
        ['Hierarchical', RadialLayeringStrategy.HIERARCHICAL],
        ['Dendrogram', RadialLayeringStrategy.DENDROGRAM]
      ]),
      new TypeAttribute(RadialLayeringStrategy)
    ],
    nodeLabelingStyleItem: [
      new LabelAttribute(
        'Node Labeling',
        '#/api/RadialLayout#RadialLayout-property-nodeLabelPlacement'
      ),
      new OptionGroupAttribute('NodePropertiesGroup', 10),
      new EnumValuesAttribute([
        ['Ignore Labels', RadialNodeLabelPlacement.IGNORE],
        ['Consider Labels', RadialNodeLabelPlacement.CONSIDER],
        ['Generic', RadialNodeLabelPlacement.GENERIC],
        ['Horizontal', RadialNodeLabelPlacement.HORIZONTAL],
        ['Ray-like at Leaves', RadialNodeLabelPlacement.RAY_LIKE_LEAVES],
        ['Ray-like', RadialNodeLabelPlacement.RAY_LIKE]
      ]),
      new TypeAttribute(RadialNodeLabelPlacement)
    ],
    edgeLabelingItem: [
      new LabelAttribute(
        'Edge Labeling',
        '#/api/RadialLayout#RadialLayout-property-edgeLabelPlacement'
      ),
      new OptionGroupAttribute('EdgePropertiesGroup', 10),
      new TypeAttribute(Boolean)
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
        '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-angle'
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
    ]
  },

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)

    const layout = new RadialLayout()

    this.centerStrategyItem = CenterPolicy.WEIGHTED_CENTRALITY
    this.layeringStrategyItem = RadialLayeringStrategy.BFS
    this.minimumLayerDistanceItem = layout.minimumLayerDistance | 0
    this.minimumNodeToNodeDistanceItem = layout.minimumNodeDistance | 0
    this.maximumChildSectorAngleItem = layout.maximumChildSectorAngle | 0
    this.edgeRoutingStrategyItem = RadialLayoutRoutingStyle.ARC
    this.edgeSmoothnessItem = MAXIMUM_SMOOTHNESS
    this.edgeBundlingStrengthItem = 0.95

    this.edgeLabelingItem = false
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10
    this.title = 'Radial Layout'

    this.nodeLabelingStyleItem = layout.nodeLabelPlacement
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const layout = new RadialLayout()
    layout.minimumNodeDistance = this.minimumNodeToNodeDistanceItem

    if (this.edgeRoutingStrategyItem !== EdgeRoutingStrategies.BUNDLED) {
      layout.edgeRoutingStyle = this.edgeRoutingStrategyItem
    }
    layout.minimumBendAngle =
      1 + (MAXIMUM_SMOOTHNESS - this.edgeSmoothnessItem) * SMOOTHNESS_ANGLE_FACTOR
    layout.minimumLayerDistance = this.minimumLayerDistanceItem
    layout.maximumChildSectorAngle = this.maximumChildSectorAngleItem
    layout.centerNodesPolicy = this.getCenterNodesPolicy(this.centerStrategyItem)
    layout.layeringStrategy = this.layeringStrategyItem

    const ebc = layout.edgeBundling
    ebc.bundlingStrength = this.edgeBundlingStrengthItem
    ebc.defaultBundleDescriptor = new EdgeBundleDescriptor({
      bundled: this.edgeRoutingStrategyItem === EdgeRoutingStrategies.BUNDLED
    })

    if (this.edgeLabelingItem) {
      layout.edgeLabelPlacement = 'generic'
      if (this.reduceAmbiguityItem) {
        layout.layoutStages.get(GenericLabeling)!.defaultEdgeLabelingCosts.ambiguousPlacementCost =
          1.0
      }
    }

    layout.nodeLabelPlacement = this.nodeLabelingStyleItem

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
    if (this.centerStrategyItem === CenterPolicy.CUSTOM) {
      layoutData = new RadialLayoutData({
        centerNodes: (node) => graphComponent.selection.includes(node)
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

  getCenterNodesPolicy(policy: CenterPolicy) {
    switch (policy) {
      case CenterPolicy.CENTRALITY:
        return CenterNodesPolicy.CENTRALITY
      case CenterPolicy.DIRECTED:
        return CenterNodesPolicy.DIRECTED
      case CenterPolicy.WEIGHTED_CENTRALITY:
      case CenterPolicy.CUSTOM:
      default:
        return CenterNodesPolicy.WEIGHTED_CENTRALITY
    }
  },

  /** @type {OptionGroup} */
  GeneralGroup: null,

  /** @type {OptionGroup} */
  LabelingGroup: null,

  /** @type {OptionGroup} */
  NodePropertiesGroup: null,

  /** @type {OptionGroup} */
  EdgePropertiesGroup: null,

  /** @type {OptionGroup} */
  PreferredPlacementGroup: null,

  /** @type {string} */
  descriptionText: {
    get: function () {
      return (
        '<p>The radial layout style arranges the nodes of a graph on concentric circles. Similar to hierarchical layouts, the overall flow of the graph is nicely visualized.</p>' +
        '<p>This style is well suited for the visualization of directed graphs and tree-like structures.</p>'
      )
    }
  },

  /** @type {number} */
  minimumLayerDistanceItem: 1,

  /** @type {number} */
  minimumNodeToNodeDistanceItem: 0,

  /** @type {number} */
  maximumChildSectorAngleItem: 15,

  /** @type {RadialLayoutRoutingStyle} */
  edgeRoutingStrategyItem: null,

  /** @type {number} */
  edgeSmoothnessItem: MINIMUM_SMOOTHNESS,

  /** @type {boolean} */
  shouldDisableEdgeSmoothnessItem: <any>{
    get: function (): boolean {
      return this.edgeRoutingStrategyItem !== RadialLayoutRoutingStyle.ARC
    }
  },

  /** @type {number} */
  edgeBundlingStrengthItem: 1.0,

  /** @type {boolean} */
  shouldDisableEdgeBundlingStrengthItem: <any>{
    get: function (): boolean {
      return this.edgeRoutingStrategyItem !== EdgeRoutingStrategies.BUNDLED
    }
  },

  /** @type {CenterNodesPolicy} */
  centerStrategyItem: null,

  /** @type {RadialLayeringStrategy} */
  layeringStrategyItem: null,

  /** @type {RadialNodeLabelPlacement} */
  nodeLabelingStyleItem: null,

  /** @type {boolean} */
  edgeLabelingItem: false,

  /** @type {boolean} */
  reduceAmbiguityItem: false,

  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: <any>{
    get: function (): boolean {
      return !this.edgeLabelingItem
    }
  },

  /** @type {LabelPlacementOrientation} */
  labelPlacementOrientationItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: <any>{
    get: function (): boolean {
      return !this.edgeLabelingItem
    }
  },

  /** @type {LabelPlacementAlongEdge} */
  labelPlacementAlongEdgeItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: <any>{
    get: function (): boolean {
      return !this.edgeLabelingItem
    }
  },

  /** @type {LabelPlacementSideOfEdge} */
  labelPlacementSideOfEdgeItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: <any>{
    get: function (): boolean {
      return !this.edgeLabelingItem
    }
  },

  /** @type {number} */
  labelPlacementDistanceItem: 0,

  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: <any>{
    get: function (): boolean {
      return (
        !this.edgeLabelingItem ||
        this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
      )
    }
  }
})
