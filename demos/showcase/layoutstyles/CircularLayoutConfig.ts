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
  CircularLayout,
  CircularLayoutData,
  CircularLayoutEdgeRoutingPolicy,
  CircularLayoutOnCircleRoutingStyle,
  CircularLayoutPartitioningPolicy,
  CircularLayoutPartitionStyle,
  CircularLayoutRoutingStyle,
  CircularLayoutStarSubstructureStyle,
  Class,
  EdgeBundleDescriptor,
  GenericLabeling,
  GraphComponent,
  ILayoutAlgorithm,
  type INode,
  LayoutData,
  RadialEdgeLabelPlacement,
  RadialNodeLabelPlacement,
  SubgraphLayoutStage
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

export enum CircularPartitioningPolicy {
  BCC_COMPACT = 0,
  BCC_ISOLATED = 1,
  SINGLE_CYCLE = 2,
  CUSTOM_PARTITIONS = 3
}

enum EdgeRoutingPolicy {
  INTERIOR = 0,
  AUTOMATIC = 1,
  EXTERIOR = 2,
  MARKED_EXTERIOR = 3
}

/**
 * Configuration options for the layout algorithm of the same name.
 */
export const CircularLayoutConfig = (Class as any)('CircularLayoutConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    GeneralGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    CycleGroup: [
      new LabelAttribute('Partition'),
      new OptionGroupAttribute('RootGroup', 20),
      new TypeAttribute(OptionGroup)
    ],
    EdgesGroup: [
      new LabelAttribute('Edges'),
      new OptionGroupAttribute('RootGroup', 30),
      new TypeAttribute(OptionGroup)
    ],
    DefaultEdgesGroup: [
      new LabelAttribute('Default Edges'),
      new OptionGroupAttribute('EdgesGroup', 40),
      new TypeAttribute(OptionGroup)
    ],
    ExteriorEdgesGroup: [
      new LabelAttribute('Exterior Edges'),
      new OptionGroupAttribute('EdgesGroup', 50),
      new TypeAttribute(OptionGroup)
    ],
    TreeGroup: [
      new LabelAttribute('Tree'),
      new OptionGroupAttribute('RootGroup', 30),
      new TypeAttribute(OptionGroup)
    ],
    SubstructureLayoutGroup: [
      new LabelAttribute('Substructure Layout'),
      new OptionGroupAttribute('RootGroup', 50),
      new TypeAttribute(OptionGroup)
    ],
    LabelingGroup: [
      new LabelAttribute('Labeling'),
      new OptionGroupAttribute('RootGroup', 60),
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
    partitioningPolicyItem: [
      new LabelAttribute(
        'Partitioning Policy',
        '#/api/CircularLayout#CircularLayout-property-partitioningPolicy'
      ),
      new OptionGroupAttribute('GeneralGroup', 10),
      new EnumValuesAttribute([
        ['BCC Compact', CircularPartitioningPolicy.BCC_COMPACT],
        ['BCC Isolated', CircularPartitioningPolicy.BCC_ISOLATED],
        ['Custom Groups', CircularPartitioningPolicy.CUSTOM_PARTITIONS],
        ['Single Cycle', CircularPartitioningPolicy.SINGLE_CYCLE]
      ]),
      new TypeAttribute(Number)
    ],
    actOnSelectionOnlyItem: [
      new LabelAttribute(
        'Act on Selection Only',
        '#/api/SubgraphLayoutStage#LayoutStageBase-property-enabled'
      ),
      new OptionGroupAttribute('GeneralGroup', 20),
      new TypeAttribute(Boolean)
    ],
    fromSketchItem: [
      new LabelAttribute(
        'Use Drawing as Sketch',
        '#/api/CircularLayout#CircularLayout-property-fromSketchMode'
      ),
      new OptionGroupAttribute('GeneralGroup', 30),
      new TypeAttribute(Boolean)
    ],
    partitionStyleItem: [
      new LabelAttribute(
        'Partition Style',
        '#/api/PartitionDescriptor#PartitionDescriptor-property-style'
      ),
      new OptionGroupAttribute('CycleGroup', 10),
      new EnumValuesAttribute([
        ['Circle', CircularLayoutPartitionStyle.CYCLE],
        ['Disk', CircularLayoutPartitionStyle.DISK],
        ['Compact Disk', CircularLayoutPartitionStyle.COMPACT_DISK],
        ['Organic', CircularLayoutPartitionStyle.ORGANIC]
      ]),
      new TypeAttribute(CircularLayoutPartitionStyle)
    ],
    minimumNodeDistanceItem: [
      new LabelAttribute(
        'Minimum Node Distance',
        '#/api/PartitionDescriptor#PartitionDescriptor-property-minimumNodeDistance'
      ),
      new OptionGroupAttribute('CycleGroup', 20),
      new MinMaxAttribute(0, 999),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    chooseRadiusAutomaticallyItem: [
      new LabelAttribute(
        'Choose Radius Automatically',
        '#/api/PartitionDescriptor#PartitionDescriptor-property-automaticRadius'
      ),
      new OptionGroupAttribute('CycleGroup', 30),
      new TypeAttribute(Boolean)
    ],
    fixedRadiusItem: [
      new LabelAttribute(
        'Fixed Radius',
        '#/api/PartitionDescriptor#PartitionDescriptor-property-fixedRadius'
      ),
      new OptionGroupAttribute('CycleGroup', 40),
      new MinMaxAttribute(1, 800),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    edgeBundlingItem: [
      new LabelAttribute(
        'Enable Edge Bundling',
        '#/api/EdgeBundling#EdgeBundling-property-defaultBundleDescriptor'
      ),
      new OptionGroupAttribute('EdgesGroup', 10),
      new TypeAttribute(Boolean)
    ],
    edgeRoutingItem: [
      new LabelAttribute(
        'Edge Routing Style',
        '#/api/CircularLayout#CircularLayout-property-edgeRoutingPolicy'
      ),
      new OptionGroupAttribute('EdgesGroup', 30),
      new EnumValuesAttribute([
        ['Inside', EdgeRoutingPolicy.INTERIOR],
        ['Outside', EdgeRoutingPolicy.EXTERIOR],
        ['Automatic', EdgeRoutingPolicy.AUTOMATIC],
        ['Selected Edge Outside', EdgeRoutingPolicy.MARKED_EXTERIOR]
      ]),
      new TypeAttribute(CircularLayoutEdgeRoutingPolicy)
    ],
    defaultBetweenCirclesRoutingItem: [
      new LabelAttribute(
        'Routing Style Between Circles',
        '#/api/CircularLayoutEdgeDescriptor#CircularLayoutEdgeDescriptor-property-betweenCirclesRoutingStyle'
      ),
      new OptionGroupAttribute('DefaultEdgesGroup', 10),
      new EnumValuesAttribute([
        ['Straight', CircularLayoutRoutingStyle.STRAIGHT_LINE],
        ['Curved', CircularLayoutRoutingStyle.CURVED]
      ]),
      new TypeAttribute(CircularLayoutRoutingStyle)
    ],
    defaultInCircleRoutingStyleItem: [
      new LabelAttribute(
        'Routing Style Within Partitions',
        '#/api/CircularLayoutEdgeDescriptor#CircularLayoutEdgeDescriptor-property-inCircleRoutingStyle'
      ),
      new OptionGroupAttribute('DefaultEdgesGroup', 20),
      new EnumValuesAttribute([
        ['Straight', CircularLayoutRoutingStyle.STRAIGHT_LINE],
        ['Curved', CircularLayoutRoutingStyle.CURVED]
      ]),
      new TypeAttribute(CircularLayoutRoutingStyle)
    ],
    defaultOnCircleRoutingStyleItem: [
      new LabelAttribute(
        'Routing Style Between Neighbors',
        '#/api/CircularLayoutEdgeDescriptor#CircularLayoutEdgeDescriptor-property-onCircleRoutingStyle'
      ),
      new OptionGroupAttribute('DefaultEdgesGroup', 30),
      new EnumValuesAttribute([
        ['Straight', CircularLayoutOnCircleRoutingStyle.STRAIGHT_LINE],
        ['Curved', CircularLayoutOnCircleRoutingStyle.CURVED],
        ['On Circle', CircularLayoutOnCircleRoutingStyle.ON_CIRCLE]
      ]),
      new TypeAttribute(CircularLayoutOnCircleRoutingStyle)
    ],
    exteriorEdgeToCircleDistanceItem: [
      new LabelAttribute(
        'Distance to Circle',
        '#/api/CircularLayoutExteriorEdgeDescriptor#CircularLayoutExteriorEdgeDescriptor-property-circleDistance'
      ),
      new OptionGroupAttribute('ExteriorEdgesGroup', 10),
      new MinMaxAttribute(10, 100, 1),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    exteriorEdgeToEdgeDistanceItem: [
      new LabelAttribute(
        'Edge to Edge Distance',
        '#/api/CircularLayoutExteriorEdgeDescriptor#CircularLayoutExteriorEdgeDescriptor-property-edgeDistance'
      ),
      new OptionGroupAttribute('ExteriorEdgesGroup', 20),
      new MinMaxAttribute(5, 50, 1),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    exteriorEdgeCornerRadiusItem: [
      new LabelAttribute(
        'Corner Radius',
        '#/api/CircularLayoutExteriorEdgeDescriptor#CircularLayoutExteriorEdgeDescriptor-property-preferredCurveLength'
      ),
      new OptionGroupAttribute('ExteriorEdgesGroup', 30),
      new MinMaxAttribute(0, 100, 1),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    exteriorEdgeAngleItem: [
      new LabelAttribute(
        'Angle',
        '#/api/CircularLayoutExteriorEdgeDescriptor#CircularLayoutExteriorEdgeDescriptor-property-preferredAngle'
      ),
      new OptionGroupAttribute('ExteriorEdgesGroup', 40),
      new MinMaxAttribute(0, 45, 1),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    exteriorEdgeSmoothnessItem: [
      new LabelAttribute(
        'Smoothness',
        '#/api/CircularLayoutExteriorEdgeDescriptor#CircularLayoutExteriorEdgeDescriptor-property-smoothness'
      ),
      new OptionGroupAttribute('ExteriorEdgesGroup', 50),
      new MinMaxAttribute(0, 1, 0.01),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    edgeBundlingStrengthItem: [
      new LabelAttribute(
        'Bundling Strength',
        '#/api/EdgeBundling#EdgeBundling-property-bundlingStrength'
      ),
      new OptionGroupAttribute('EdgesGroup', 20),
      new MinMaxAttribute(0, 1.0, 0.01),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    preferredChildSectorAngleItem: [
      new LabelAttribute(
        'Preferred Child Sector Angle',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-preferredChildSectorAngle'
      ),
      new OptionGroupAttribute('TreeGroup', 10),
      new MinMaxAttribute(1, 359),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumEdgeLengthItem: [
      new LabelAttribute(
        'Minimum Edge Length',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-minimumEdgeLength'
      ),
      new OptionGroupAttribute('TreeGroup', 20),
      new MinMaxAttribute(5, 400),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    maximumDeviationAngleItem: [
      new LabelAttribute(
        'Maximum Deviation Angle',
        '#/api/CircularLayout#CircularLayout-property-maximumDeviationAngle'
      ),
      new OptionGroupAttribute('TreeGroup', 30),
      new MinMaxAttribute(1, 360),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    compactnessFactorItem: [
      new LabelAttribute(
        'Compactness Factor',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-compactnessFactor'
      ),
      new OptionGroupAttribute('TreeGroup', 40),
      new MinMaxAttribute(0.1, 0.9, 0.01),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumTreeNodeDistanceItem: [
      new LabelAttribute(
        'Minimum Node Distance',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-minimumNodeDistance'
      ),
      new OptionGroupAttribute('TreeGroup', 50),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    allowOverlapsItem: [
      new LabelAttribute(
        'Allow Overlaps',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-allowOverlaps'
      ),
      new OptionGroupAttribute('TreeGroup', 60),
      new TypeAttribute(Boolean)
    ],
    placeChildrenOnCommonRadiusItem: [
      new LabelAttribute(
        'Place Children on Common Radius',
        '#/api/CircularLayout#CircularLayout-property-placeChildrenOnCommonRadius'
      ),
      new OptionGroupAttribute('TreeGroup', 70),
      new TypeAttribute(Boolean)
    ],
    starSubstructureItem: [
      new LabelAttribute(
        'Star',
        '#/api/CircularLayout#CircularLayout-property-starSubstructureStyle'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 10),
      new EnumValuesAttribute([
        ['Ignore', CircularLayoutStarSubstructureStyle.NONE],
        ['Radial', CircularLayoutStarSubstructureStyle.RADIAL],
        ['Separated Radial', CircularLayoutStarSubstructureStyle.SEPARATED_RADIAL]
      ]),
      new TypeAttribute(CircularLayoutStarSubstructureStyle)
    ],
    starSubstructureSizeItem: [
      new LabelAttribute(
        'Minimum Star Size',
        '#/api/CircularLayout#CircularLayout-property-starSubstructureSize'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 15),
      new MinMaxAttribute(4, 20),
      new TypeAttribute(Number)
    ],
    nodeLabelingStyleItem: [
      new LabelAttribute(
        'Node Labeling',
        '#/api/CircularLayout#CircularLayout-property-nodeLabelPlacement'
      ),
      new OptionGroupAttribute('NodePropertiesGroup', 10),
      new EnumValuesAttribute([
        ['Ignore Labels', RadialNodeLabelPlacement.IGNORE],
        ['Consider Labels', RadialNodeLabelPlacement.CONSIDER],
        ['Horizontal', RadialNodeLabelPlacement.HORIZONTAL],
        ['Generic', RadialNodeLabelPlacement.GENERIC],
        ['Ray-like at Leaves', RadialNodeLabelPlacement.RAY_LIKE_LEAVES],
        ['Ray-like', RadialNodeLabelPlacement.RAY_LIKE]
      ]),
      new TypeAttribute(RadialNodeLabelPlacement)
    ],
    edgeLabelingItem: [
      new LabelAttribute(
        'Edge Labeling',
        '#/api/CircularLayout#CircularLayout-property-edgeLabelPlacement'
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
    ]
  },

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)
    const layout = new CircularLayout()
    const treeLayout = layout.backboneLayout

    this.partitioningPolicyItem = CircularPartitioningPolicy.BCC_COMPACT
    this.actOnSelectionOnlyItem = false
    this.fromSketchItem = false

    this.partitionStyleItem = CircularLayoutPartitionStyle.CYCLE
    this.minimumNodeDistanceItem = 30
    this.chooseRadiusAutomaticallyItem = true
    this.fixedRadiusItem = 200

    this.defaultBetweenCirclesRoutingItem = CircularLayoutRoutingStyle.STRAIGHT_LINE
    this.defaultInCircleRoutingStyleItem = CircularLayoutRoutingStyle.STRAIGHT_LINE
    this.defaultOnCircleRoutingStyleItem = CircularLayoutOnCircleRoutingStyle.STRAIGHT_LINE

    this.edgeRoutingItem = CircularLayoutEdgeRoutingPolicy.INTERIOR
    this.exteriorEdgeToCircleDistanceItem = 20
    this.exteriorEdgeToEdgeDistanceItem = 10
    this.exteriorEdgeCornerRadiusItem = 20
    this.exteriorEdgeAngleItem = 10
    this.exteriorEdgeSmoothnessItem = 0.7

    this.edgeBundlingItem = false
    this.edgeBundlingStrengthItem = 1.0

    this.preferredChildSectorAngleItem = treeLayout.preferredChildSectorAngle
    this.minimumEdgeLengthItem = treeLayout.minimumEdgeLength
    this.maximumDeviationAngleItem = layout.maximumDeviationAngle
    this.compactnessFactorItem = treeLayout.compactnessFactor
    this.minimumTreeNodeDistanceItem = treeLayout.minimumNodeDistance
    this.allowOverlapsItem = treeLayout.allowOverlaps
    this.placeChildrenOnCommonRadiusItem = true

    this.starSubstructureItem = CircularLayoutStarSubstructureStyle.NONE
    this.starSubstructureSizeItem = layout.starSubstructureSize

    this.edgeLabelingItem = layout.edgeLabelPlacement !== RadialEdgeLabelPlacement.IGNORE
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
    this.title = 'Circular Layout'

    this.nodeLabelingStyleItem = layout.nodeLabelPlacement
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const layout = new CircularLayout()
    layout.partitioningPolicy = this.getPartitioningPolicy(this.partitioningPolicyItem)
    layout.maximumDeviationAngle = this.maximumDeviationAngleItem
    layout.fromSketchMode = this.fromSketchItem
    layout.partitionDescriptor.style = this.partitionStyleItem
    layout.placeChildrenOnCommonRadius = this.placeChildrenOnCommonRadiusItem

    layout.partitionDescriptor.minimumNodeDistance = this.minimumNodeDistanceItem
    layout.partitionDescriptor.automaticRadius = this.chooseRadiusAutomaticallyItem
    layout.partitionDescriptor.fixedRadius = this.fixedRadiusItem

    if (this.edgeLabelingItem) {
      layout.edgeLabelPlacement = 'generic'
      if (this.reduceAmbiguityItem) {
        layout.layoutStages.get(GenericLabeling)!.defaultEdgeLabelingCosts.ambiguousPlacementCost =
          1.0
      }
    } else {
      layout.edgeLabelPlacement = 'ignore'
    }

    layout.edgeDescriptor.betweenCirclesRoutingStyle = this.defaultBetweenCirclesRoutingItem
    layout.edgeDescriptor.inCircleRoutingStyle = this.defaultInCircleRoutingStyleItem
    layout.edgeDescriptor.onCircleRoutingStyle = this.defaultOnCircleRoutingStyleItem

    layout.edgeRoutingPolicy = this.getEdgeRoutingPolicy(this.edgeRoutingItem)
    layout.exteriorEdgeDescriptor.circleDistance = this.exteriorEdgeToCircleDistanceItem
    layout.exteriorEdgeDescriptor.edgeDistance = this.exteriorEdgeToEdgeDistanceItem
    layout.exteriorEdgeDescriptor.preferredCurveLength = this.exteriorEdgeCornerRadiusItem
    layout.exteriorEdgeDescriptor.preferredAngle = this.exteriorEdgeAngleItem
    layout.exteriorEdgeDescriptor.smoothness = this.exteriorEdgeSmoothnessItem

    const subgraphLayout = layout.layoutStages.get(SubgraphLayoutStage)!
    subgraphLayout.enabled = this.actOnSelectionOnlyItem

    const backboneLayout = layout.backboneLayout
    backboneLayout.preferredChildSectorAngle = this.preferredChildSectorAngleItem
    backboneLayout.minimumEdgeLength = this.minimumEdgeLengthItem
    backboneLayout.compactnessFactor = this.compactnessFactorItem
    backboneLayout.allowOverlaps = this.allowOverlapsItem
    backboneLayout.minimumNodeDistance = this.minimumTreeNodeDistanceItem

    const ebc = layout.edgeBundling
    ebc.bundlingStrength = this.edgeBundlingStrengthItem
    ebc.defaultBundleDescriptor = new EdgeBundleDescriptor({
      bundled: this.edgeBundlingItem
    })

    layout.nodeLabelPlacement = this.nodeLabelingStyleItem

    layout.starSubstructureStyle = this.starSubstructureItem
    layout.starSubstructureSize = this.starSubstructureSizeItem

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
   */
  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: CircularLayout
  ): LayoutData {
    const layoutData = new CircularLayoutData()

    if (this.partitioningPolicyItem === CircularPartitioningPolicy.CUSTOM_PARTITIONS) {
      layoutData.partitions = (node: INode) => graphComponent.graph.getParent(node)
    }

    if (this.edgeRoutingItem === EdgeRoutingPolicy.MARKED_EXTERIOR) {
      layoutData.exteriorEdges = graphComponent.selection.edges.toList()
    }

    let resultData = layoutData.combineWith(
      this.createLabelingLayoutData(
        graphComponent.graph,
        this.labelPlacementAlongEdgeItem,
        this.labelPlacementSideOfEdgeItem,
        this.labelPlacementOrientationItem,
        this.labelPlacementDistanceItem
      )
    )
    if (this.actOnSelectionOnlyItem) {
      resultData = resultData.combineWith(this.createSubgraphLayoutData(graphComponent))
    }
    return resultData
  },

  getPartitioningPolicy(style: CircularPartitioningPolicy): CircularLayoutPartitioningPolicy {
    switch (style) {
      default:
      case CircularPartitioningPolicy.CUSTOM_PARTITIONS:
      case CircularPartitioningPolicy.BCC_COMPACT:
        return CircularLayoutPartitioningPolicy.BCC_COMPACT
      case CircularPartitioningPolicy.BCC_ISOLATED:
        return CircularLayoutPartitioningPolicy.BCC_ISOLATED
      case CircularPartitioningPolicy.SINGLE_CYCLE:
        return CircularLayoutPartitioningPolicy.SINGLE_CYCLE
    }
  },

  getEdgeRoutingPolicy(policy: EdgeRoutingPolicy): CircularLayoutEdgeRoutingPolicy {
    switch (policy) {
      default:
      case EdgeRoutingPolicy.MARKED_EXTERIOR:
      case EdgeRoutingPolicy.INTERIOR:
        return CircularLayoutEdgeRoutingPolicy.INTERIOR
      case EdgeRoutingPolicy.AUTOMATIC:
        return CircularLayoutEdgeRoutingPolicy.AUTOMATIC
      case EdgeRoutingPolicy.EXTERIOR:
        return CircularLayoutEdgeRoutingPolicy.EXTERIOR
    }
  },

  /** @type {OptionGroup} */
  GeneralGroup: null,

  /** @type {OptionGroup} */
  CycleGroup: null,

  /** @type {OptionGroup} */
  EdgesGroup: null,

  /** @type {OptionGroup} */
  DefaultEdgesGroup: null,

  /** @type {OptionGroup} */
  ExteriorEdgesGroup: null,

  /** @type {OptionGroup} */
  TreeGroup: null,

  /** @type {OptionGroup} */
  SubstructureLayoutGroup: null,

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
      return "<p style='margin-top:0'>The circular layout style emphasizes group and tree structures within a network. It creates node partitions by analyzing the connectivity structure of the network, and arranges the partitions as separate circles. The circles themselves are arranged in a radial tree layout fashion.</p><p>This layout style portraits interconnected ring and star topologies and is excellent for applications in:</p><ul><li>Social networking (criminology, economics, fraud detection, etc.)</li><li>Network management</li><li>WWW visualization</li><li>eCommerce</li></ul>"
    }
  },

  /** @type {CircularPartitioningPolicy} */
  partitioningPolicyItem: null,

  /** @type {boolean} */
  actOnSelectionOnlyItem: false,

  /** @type {boolean} */
  fromSketchItem: false,

  /** @type {CircularLayoutPartitionStyle} */
  partitionStyleItem: null,

  /** @type {number} */
  minimumNodeDistanceItem: 0,

  /** @type {boolean} */
  shouldDisableMinimumNodeDistanceItem: <any>{
    get: function (): boolean {
      return this.chooseRadiusAutomaticallyItem === false
    }
  },

  /** @type {boolean} */
  chooseRadiusAutomaticallyItem: false,

  /** @type {number} */
  fixedRadiusItem: 1,

  /** @type {boolean} */
  shouldDisableFixedRadiusItem: <any>{
    get: function (): boolean {
      return this.chooseRadiusAutomaticallyItem
    }
  },

  /** @type {boolean} */
  edgeBundlingItem: false,

  /** @type {boolean} */
  shouldDisableEdgeBundlingItem: <any>{
    get: function (): boolean {
      return (
        this.partitionStyleItem !== CircularLayoutPartitionStyle.CYCLE ||
        this.partitioningPolicyItem === CircularPartitioningPolicy.BCC_ISOLATED
      )
    }
  },

  /** @type {EdgeRoutingPolicy} */
  edgeRoutingItem: CircularLayoutEdgeRoutingPolicy.INTERIOR,

  /** @type {CircularLayoutRoutingStyle} */
  defaultBetweenCirclesRoutingItem: CircularLayoutRoutingStyle.STRAIGHT_LINE,

  /** @type {boolean} */
  shouldDisableDefaultBetweenCirclesRoutingItem: <any>{
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.EXTERIOR
    }
  },

  /** @type {CircularLayoutRoutingStyle} */
  defaultInCircleRoutingStyleItem: CircularLayoutRoutingStyle.STRAIGHT_LINE,

  /** @type {boolean} */
  shouldDisableDefaultInCircleRoutingStyleItem: <any>{
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.EXTERIOR
    }
  },

  /** @type {CircularLayoutOnCircleRoutingStyle} */
  defaultOnCircleRoutingStyleItem: CircularLayoutOnCircleRoutingStyle.STRAIGHT_LINE,

  /** @type {boolean} */
  shouldDisableDefaultOnCircleRoutingStyleItem: <any>{
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.EXTERIOR
    }
  },

  /** @type {number} */
  exteriorEdgeToCircleDistanceItem: 20,

  /** @type {boolean} */
  shouldDisableExteriorEdgeToCircleDistanceItem: <any>{
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /** @type {number} */
  exteriorEdgeToEdgeDistanceItem: 10,

  /** @type {boolean} */
  shouldDisableExteriorEdgeToEdgeDistanceItem: <any>{
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /** @type {number} */
  exteriorEdgeCornerRadiusItem: 20,

  /** @type {boolean} */
  shouldDisableExteriorEdgeCornerRadiusItem: <any>{
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /** @type {number} */
  exteriorEdgeAngleItem: 10,

  /** @type {boolean} */
  shouldDisableExteriorEdgeAngleItem: <any>{
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /** @type {number} */
  exteriorEdgeSmoothnessItem: 0.7,

  /** @type {boolean} */
  shouldDisableExteriorEdgeSmoothnessItem: <any>{
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /** @type {number} */
  edgeBundlingStrengthItem: 1.0,

  /** @type {boolean} */
  shouldDisableEdgeBundlingStrengthItem: <any>{
    get: function (): boolean {
      return (
        this.partitionStyleItem !== CircularLayoutPartitionStyle.CYCLE ||
        this.partitioningPolicyItem === CircularLayoutPartitioningPolicy.BCC_ISOLATED
      )
    }
  },

  /** @type {number} */
  preferredChildSectorAngleItem: 1,

  /** @type {number} */
  minimumEdgeLengthItem: 5,

  /** @type {number} */
  maximumDeviationAngleItem: 1,

  /** @type {number} */
  compactnessFactorItem: 0.1,

  /** @type {number} */
  minimumTreeNodeDistanceItem: 0,

  /** @type {boolean} */
  allowOverlapsItem: false,

  /** @type {boolean} */
  placeChildrenOnCommonRadiusItem: false,

  /** @type {boolean} */
  shouldDisableTreeGroupItem: <any>{
    get: function (): boolean {
      return this.partitioningPolicyItem === CircularLayoutPartitioningPolicy.SINGLE_CYCLE
    }
  },

  /** @type {CircularLayoutStarSubstructureStyle} */
  starSubstructureItem: null,

  /** @type {number} */
  starSubstructureSizeItem: 4,

  shouldDisableStarSubstructureSizeItem: <any>{
    get: function () {
      return this.starSubstructureItem === CircularLayoutStarSubstructureStyle.NONE
    }
  },

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
