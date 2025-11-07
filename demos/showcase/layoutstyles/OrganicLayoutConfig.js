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
  Arrow,
  ArrowType,
  Class,
  ComponentArrangementStyle,
  EdgeLabelPlacement,
  GroupHidingStage,
  GroupNodeHandlingPolicy,
  GroupSubstructureStyle,
  LayoutOrientation,
  NodeLabelPlacement,
  OrganicLayout,
  OrganicLayoutChainSubstructureStyle,
  OrganicLayoutClusteringPolicy,
  OrganicLayoutCycleSubstructureStyle,
  OrganicLayoutData,
  OrganicLayoutGroupSubstructureScope,
  OrganicLayoutParallelSubstructureStyle,
  OrganicLayoutStarSubstructureStyle,
  OrganicLayoutTreeSubstructureStyle,
  OrganicScope,
  PolylineEdgeStyle,
  ShapeConstraint,
  Size,
  TimeSpan
} from '@yfiles/yfiles'

import {
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge,
  LayoutConfiguration
} from './LayoutConfiguration'
import {
  ComponentAttribute,
  EnumValuesAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from '@yfiles/demo-app/demo-option-editor'

/// <summary>
///   Enum constants that specify the scope for the <see cref="OrganicLayout"/>.
/// </summary>
const OrganicLayoutScope = {
  /// <summary>Scope mode indicating that the algorithm should place <em>all</em> nodes of the graph.</summary>
  ALL: 0,

  /// Scope mode indicating that the algorithm should place the node.
  AFFECTED: OrganicScope.AFFECTED,

  /// <summary>
  ///   Scope mode indicating that the algorithm should place a node but may to a certain degree
  //    also move nodes that are geometrically close to a node from the subset.
  /// </summary>
  INCLUDE_CLOSE_NODES: OrganicScope.INCLUDE_CLOSE_NODES,

  /// <summary>
  ///   Scope mode indicating that the algorithm should place a node but may to a certain degree
  //    also move nodes that are structurally close to the node.
  /// </summary>
  INCLUDE_EXTENDED_NEIGHBORHOOD: OrganicScope.INCLUDE_EXTENDED_NEIGHBORHOOD
}

export const OutputRestrictions = {
  NONE: 0,
  OUTPUT_CAGE: 1,
  OUTPUT_AR: 2,
  OUTPUT_ELLIPTICAL_CAGE: 3
}

export const GroupLayoutPolicy = {
  LAYOUT_GROUPS: 0,
  FIX_GROUP_BOUNDS: 1,
  FIX_GROUP_CONTENTS: 2,
  IGNORE_GROUPS: 3
}

/**
 * Configuration options for the layout algorithm of the same name.
 */
export const OrganicLayoutConfig = Class('OrganicLayoutConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    VisualGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    RestrictionsGroup: [
      new LabelAttribute('Restrictions'),
      new OptionGroupAttribute('RootGroup', 20),
      new TypeAttribute(OptionGroup)
    ],
    CageGroup: [
      new LabelAttribute('Bounds'),
      new OptionGroupAttribute('RestrictionsGroup', 20),
      new TypeAttribute(OptionGroup)
    ],
    ARGroup: [
      new LabelAttribute('Aspect Ratio'),
      new OptionGroupAttribute('RestrictionsGroup', 30),
      new TypeAttribute(OptionGroup)
    ],
    GroupingGroup: [
      new LabelAttribute('Grouping'),
      new OptionGroupAttribute('RootGroup', 30),
      new TypeAttribute(OptionGroup)
    ],
    AlgorithmGroup: [
      new LabelAttribute('Algorithm'),
      new OptionGroupAttribute('RootGroup', 40),
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
      new ComponentAttribute('html-block'),
      new TypeAttribute(String)
    ],
    scopeItem: [
      new LabelAttribute('Scope', '#/api/OrganicLayoutData#OrganicLayoutData-property-scope'),
      new OptionGroupAttribute('VisualGroup', 10),
      new EnumValuesAttribute([
        ['All', 'all'],
        ['Selection', 'affected'],
        ['Selection and Connected Nodes', 'include-extended-neighborhood'],
        ['Selection and Nearby Nodes', 'include-close-nodes']
      ]),
      new TypeAttribute(Number)
    ],
    preferredEdgeLengthItem: [
      new LabelAttribute(
        'Preferred Edge Length',
        '#/api/OrganicLayout#OrganicLayout-property-defaultPreferredEdgeLength'
      ),
      new OptionGroupAttribute('VisualGroup', 20),
      new MinMaxAttribute(5, 500),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    allowNodeOverlapsItem: [
      new LabelAttribute(
        'Allow Overlapping Nodes',
        '#/api/OrganicLayout#OrganicLayout-property-allowNodeOverlaps'
      ),
      new OptionGroupAttribute('VisualGroup', 40),
      new TypeAttribute(Boolean)
    ],
    minimumNodeDistanceItem: [
      new LabelAttribute(
        'Minimum Node Distance',
        '#/api/OrganicLayout#OrganicLayout-property-defaultMinimumNodeDistance'
      ),
      new OptionGroupAttribute('VisualGroup', 30),
      new MinMaxAttribute(0.0, 100.0, 0.01),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    avoidNodeEdgeOverlapsItem: [
      new LabelAttribute(
        'Avoid Node/Edge Overlaps',
        '#/api/OrganicLayout#OrganicLayout-property-avoidNodeEdgeOverlap'
      ),
      new OptionGroupAttribute('VisualGroup', 60),
      new TypeAttribute(Boolean)
    ],
    compactnessItem: [
      new LabelAttribute(
        'Compactness',
        '#/api/OrganicLayout#OrganicLayout-property-compactnessFactor'
      ),
      new OptionGroupAttribute('VisualGroup', 70),
      new MinMaxAttribute(0.0, 1.0, 0.1),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    orientationItem: [
      new LabelAttribute(
        'Orientation',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-layoutOrientation'
      ),
      new OptionGroupAttribute('VisualGroup', 80),
      new EnumValuesAttribute([
        ['None', null],
        ['Top to Bottom', LayoutOrientation.TOP_TO_BOTTOM],
        ['Left to Right', LayoutOrientation.LEFT_TO_RIGHT],
        ['Bottom to Top', LayoutOrientation.BOTTOM_TO_TOP],
        ['Right to Left', LayoutOrientation.RIGHT_TO_LEFT]
      ]),
      new TypeAttribute(LayoutOrientation)
    ],
    clusteringPolicyItem: [
      new LabelAttribute(
        'Clustering',
        '#/api/OrganicLayout#OrganicLayout-property-clusteringPolicy'
      ),
      new OptionGroupAttribute('VisualGroup', 100),
      new EnumValuesAttribute([
        ['None', OrganicLayoutClusteringPolicy.NONE],
        ['Edge Betweenness', OrganicLayoutClusteringPolicy.EDGE_BETWEENNESS],
        ['Label Propagation', OrganicLayoutClusteringPolicy.LABEL_PROPAGATION],
        ['Louvain Modularity', OrganicLayoutClusteringPolicy.LOUVAIN_MODULARITY]
      ]),
      new TypeAttribute(OrganicLayoutClusteringPolicy)
    ],
    restrictOutputItem: [
      new LabelAttribute(
        'Output Area',
        '#/api/OrganicLayout#OrganicLayout-property-shapeConstraint'
      ),
      new OptionGroupAttribute('RestrictionsGroup', 10),
      new EnumValuesAttribute([
        ['Unrestricted', 'none'],
        ['Rectangular', 'output-cage'],
        ['Aspect Ratio', 'output-ar'],
        ['Elliptical', 'output-elliptical-cage']
      ]),
      new TypeAttribute(OutputRestrictions)
    ],
    rectCageUseViewItem: [
      new LabelAttribute(
        'Use Visible Area',
        '#/api/OrganicLayout#OrganicLayout-property-shapeConstraint'
      ),
      new OptionGroupAttribute('CageGroup', 10),
      new TypeAttribute(Boolean)
    ],
    cageXItem: [
      new LabelAttribute('Top Left X'),
      new OptionGroupAttribute('CageGroup', 20),
      new TypeAttribute(Number)
    ],
    cageYItem: [
      new LabelAttribute('Top Left Y'),
      new OptionGroupAttribute('CageGroup', 30),
      new TypeAttribute(Number)
    ],
    cageWidthItem: [
      new LabelAttribute('Width'),
      new OptionGroupAttribute('CageGroup', 40),
      new MinMaxAttribute(1, 100000),
      new TypeAttribute(Number)
    ],
    cageHeightItem: [
      new LabelAttribute('Height'),
      new OptionGroupAttribute('CageGroup', 50),
      new MinMaxAttribute(1, 100000),
      new TypeAttribute(Number)
    ],
    arCageUseViewItem: [
      new LabelAttribute('Use Ratio of View'),
      new OptionGroupAttribute('ARGroup', 10),
      new TypeAttribute(Boolean)
    ],
    cageRatioItem: [
      new LabelAttribute('Aspect Ratio'),
      new OptionGroupAttribute('ARGroup', 20),
      new MinMaxAttribute(0.2, 5.0, 0.01),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    groupLayoutPolicyItem: [
      new LabelAttribute(
        'Group Layout Policy',
        '#/api/OrganicScopeData#OrganicScopeData-property-groupNodeHandlingPolicies'
      ),
      new OptionGroupAttribute('GroupingGroup', 10),
      new EnumValuesAttribute([
        ['Layout Groups', 'layout-groups'],
        ['Fix Bounds of Groups', 'fix-group-bounds'],
        ['Fix Contents of Groups', 'fix-group-contents'],
        ['Ignore Groups', 'ignore-groups']
      ]),
      new TypeAttribute(GroupLayoutPolicy)
    ],
    qualityTimeRatioItem: [
      new LabelAttribute('Quality', '#/api/OrganicLayout#OrganicLayout-property-qualityTimeRatio'),
      new OptionGroupAttribute('AlgorithmGroup', 10),
      new MinMaxAttribute(0.0, 1.0, 0.01),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    stopDurationItem: [
      new LabelAttribute(
        'Stop Duration (sec)',
        '#/api/OrganicLayout#OrganicLayout-property-stopDuration'
      ),
      new OptionGroupAttribute('AlgorithmGroup', 20),
      new MinMaxAttribute(0, 150),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    activateDeterministicModeItem: [
      new LabelAttribute(
        'Deterministic Mode',
        '#/api/OrganicLayout#OrganicLayout-property-deterministic'
      ),
      new OptionGroupAttribute('AlgorithmGroup', 30),
      new TypeAttribute(Boolean)
    ],
    nodeLabelingItem: [
      new OptionGroupAttribute('NodePropertiesGroup', 10),
      new LabelAttribute(
        'Node Labeling',
        '#/api/OrganicLayout#OrganicLayout-property-nodeLabelPlacement'
      ),
      new EnumValuesAttribute([
        ['Consider', NodeLabelPlacement.CONSIDER],
        ['Generic', NodeLabelPlacement.GENERIC],
        ['Ignore', NodeLabelPlacement.IGNORE]
      ]),
      new TypeAttribute(NodeLabelPlacement)
    ],
    cycleSubstructureItem: [
      new LabelAttribute(
        'Cycles',
        '#/api/OrganicLayout#OrganicLayout-property-cycleSubstructureStyle'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 10),
      new EnumValuesAttribute([
        ['Ignore', OrganicLayoutCycleSubstructureStyle.NONE],
        ['Circular', OrganicLayoutCycleSubstructureStyle.CIRCULAR],
        [
          'Circular, also within other structures',
          OrganicLayoutCycleSubstructureStyle.CIRCULAR_NESTED
        ]
      ]),
      new TypeAttribute(OrganicLayoutCycleSubstructureStyle)
    ],
    cycleSubstructureSizeItem: [
      new LabelAttribute(
        'Minimum Cycle Size',
        '#/api/OrganicLayout#OrganicLayout-property-cycleSubstructureSize'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 15),
      new MinMaxAttribute(4, 20),
      new TypeAttribute(Number)
    ],
    chainSubstructureItem: [
      new LabelAttribute(
        'Chains',
        '#/api/OrganicLayout#OrganicLayout-property-chainSubstructureStyle'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 20),
      new EnumValuesAttribute([
        ['Ignore', OrganicLayoutChainSubstructureStyle.NONE],
        ['Rectangular', OrganicLayoutChainSubstructureStyle.RECTANGULAR],
        [
          'Rectangular, also within other structures',
          OrganicLayoutChainSubstructureStyle.RECTANGULAR_NESTED
        ],
        ['Straight-Line', OrganicLayoutChainSubstructureStyle.STRAIGHT_LINE],
        [
          'Straight-Line, also within other structures',
          OrganicLayoutChainSubstructureStyle.STRAIGHT_LINE_NESTED
        ],
        ['Disk', OrganicLayoutChainSubstructureStyle.DISK],
        ['Disk, also within other structures', OrganicLayoutChainSubstructureStyle.DISK_NESTED]
      ]),
      new TypeAttribute(OrganicLayoutChainSubstructureStyle)
    ],
    chainSubstructureSizeItem: [
      new LabelAttribute(
        'Minimum Chain Size',
        '#/api/OrganicLayout#OrganicLayout-property-chainSubstructureSize'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 25),
      new MinMaxAttribute(4, 20),
      new TypeAttribute(Number)
    ],
    starSubstructureItem: [
      new LabelAttribute(
        'Star',
        '#/api/OrganicLayout#OrganicLayout-property-starSubstructureStyle'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 30),
      new EnumValuesAttribute([
        ['Ignore', OrganicLayoutStarSubstructureStyle.NONE],
        ['Circular', OrganicLayoutStarSubstructureStyle.CIRCULAR],
        [
          'Circular, also within other structures',
          OrganicLayoutStarSubstructureStyle.CIRCULAR_NESTED
        ],
        ['Radial', OrganicLayoutStarSubstructureStyle.RADIAL],
        ['Radial, also within other structures', OrganicLayoutStarSubstructureStyle.RADIAL_NESTED],
        ['Separated Radial', OrganicLayoutStarSubstructureStyle.SEPARATED_RADIAL]
      ]),
      new TypeAttribute(OrganicLayoutStarSubstructureStyle)
    ],
    starSubstructureSizeItem: [
      new LabelAttribute(
        'Minimum Star Size',
        '#/api/OrganicLayout#OrganicLayout-property-starSubstructureSize'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 35),
      new MinMaxAttribute(4, 20),
      new TypeAttribute(Number)
    ],
    parallelSubstructureItem: [
      new LabelAttribute(
        'Parallel',
        '#/api/OrganicLayout#OrganicLayout-property-parallelSubstructureStyle'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 40),
      new EnumValuesAttribute([
        ['Ignore', OrganicLayoutParallelSubstructureStyle.NONE],
        ['Radial', OrganicLayoutParallelSubstructureStyle.RADIAL],
        ['Rectangular', OrganicLayoutParallelSubstructureStyle.RECTANGULAR],
        ['Straight-Line', OrganicLayoutParallelSubstructureStyle.STRAIGHT_LINE]
      ]),
      new TypeAttribute(OrganicLayoutParallelSubstructureStyle)
    ],
    parallelSubstructureSizeItem: [
      new LabelAttribute(
        'Minimum size for parallel structures',
        '#/api/OrganicLayout#OrganicLayout-property-parallelSubstructureSize'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 45),
      new MinMaxAttribute(3, 20),
      new TypeAttribute(Number)
    ],
    treeSubstructureItem: [
      new LabelAttribute(
        'Tree',
        '#/api/OrganicLayout#OrganicLayout-property-treeSubstructureStyle'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 50),
      new EnumValuesAttribute([
        ['Ignore', OrganicLayoutTreeSubstructureStyle.NONE],
        ['Radial', OrganicLayoutTreeSubstructureStyle.RADIAL],
        ['Radial Tree', OrganicLayoutTreeSubstructureStyle.RADIAL_TREE],
        ['Oriented', OrganicLayoutTreeSubstructureStyle.ORIENTED]
      ]),
      new TypeAttribute(OrganicLayoutTreeSubstructureStyle)
    ],
    treeSubstructureSizeItem: [
      new LabelAttribute(
        'Minimum size for tree structures',
        '#/api/OrganicLayout#OrganicLayout-property-treeSubstructureSize'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 55),
      new MinMaxAttribute(3, 20),
      new TypeAttribute(Number)
    ],
    groupSubstructureStyleItem: [
      new LabelAttribute(
        'Group Substructure Style',
        '#/api/OrganicLayout#OrganicLayout-property-groupSubstructureStyle'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 60),
      new EnumValuesAttribute([
        ['Circle', GroupSubstructureStyle.CIRCLE],
        ['Compact Disk', GroupSubstructureStyle.COMPACT_DISK],
        ['Disk', GroupSubstructureStyle.DISK],
        ['Organic Disk', GroupSubstructureStyle.ORGANIC_DISK]
      ]),
      new TypeAttribute(GroupSubstructureStyle)
    ],
    groupSubstructureScopeItem: [
      new LabelAttribute(
        'Group Substructures',
        '#/api/OrganicLayout#OrganicLayout-property-groupSubstructureScope'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 65),
      new EnumValuesAttribute([
        ['Ignore', OrganicLayoutGroupSubstructureScope.NO_GROUPS],
        ['All Groups', OrganicLayoutGroupSubstructureScope.ALL_GROUPS],
        ['Groups Without Intra-Edges', OrganicLayoutGroupSubstructureScope.GROUPS_WITHOUT_EDGES],
        [
          'Groups Without Inter-Edges',
          OrganicLayoutGroupSubstructureScope.GROUPS_WITHOUT_INTER_EDGES
        ]
      ]),
      new TypeAttribute(OrganicLayoutGroupSubstructureScope)
    ],
    groupSubstructureSizeItem: [
      new LabelAttribute(
        'Minimum size for group structures',
        '#/api/OrganicLayout#OrganicLayout-property-groupSubstructureSize'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 70),
      new MinMaxAttribute(2, 20),
      new TypeAttribute(Number)
    ],
    clusterAsGroupSubstructureItem: [
      new LabelAttribute(
        'Clusters With Group Substructures',
        '#/api/OrganicLayout#OrganicLayout-property-allowClusterAsGroupSubstructure'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 75),
      new TypeAttribute(Boolean)
    ],
    edgeDirectednessItem: [
      new LabelAttribute(
        'Arrows Define Edge Direction',
        '#/api/OrganicLayoutData#OrganicLayoutData-property-edgeDirectedness'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 80),
      new TypeAttribute(Boolean)
    ],
    useEdgeGroupingItem: [
      new LabelAttribute(
        'Use Edge Grouping',
        '#/api/OrganicLayoutData#OrganicLayoutData-property-substructureSourceGroupIds'
      ),
      new OptionGroupAttribute('SubstructureLayoutGroup', 90),
      new TypeAttribute(Boolean)
    ],
    edgeLabelingItem: [
      new LabelAttribute(
        'Edge Labeling',
        '#/api/OrganicLayout#OrganicLayout-property-edgeLabelPlacement'
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
        ['Parallel', 'parallel'],
        ['Orthogonal', 'orthogonal'],
        ['Horizontal', 'horizontal'],
        ['Vertical', 'vertical']
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
        ['Anywhere', 'anywhere'],
        ['At Source', 'at-source'],
        ['At Source Port', 'at-source-port'],
        ['At Target', 'at-target'],
        ['At Target Port', 'at-target-port'],
        ['Centered', 'centered']
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
        ['Anywhere', 'anywhere'],
        ['On Edge', 'on-edge'],
        ['Left', 'left'],
        ['Right', 'right'],
        ['Left or Right', 'left-or-right']
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
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ]
  },

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)
    const layout = new OrganicLayout()
    this.scopeItem = 'all'
    this.preferredEdgeLengthItem = layout.defaultPreferredEdgeLength
    this.allowNodeOverlapsItem = layout.allowNodeOverlaps
    this.minimumNodeDistanceItem = 10
    this.avoidNodeEdgeOverlapsItem = layout.avoidNodeEdgeOverlap
    this.compactnessItem = layout.compactnessFactor
    this.orientationItem = null
    this.clusteringPolicy = layout.clusteringPolicy

    this.restrictOutputItem = 'none'
    this.rectCageUseViewItem = true
    this.cageXItem = 0.0
    this.cageYItem = 0.0
    this.cageWidthItem = 1000.0
    this.cageHeightItem = 1000.0
    this.arCageUseViewItem = true
    this.cageRatioItem = 1.0

    this.groupLayoutPolicyItem = 'layout-groups'

    this.qualityTimeRatioItem = layout.qualityTimeRatio
    this.stopDurationItem = layout.stopDuration.totalSeconds
    this.activateDeterministicModeItem = true

    this.cycleSubstructureItem = OrganicLayoutCycleSubstructureStyle.NONE
    this.cycleSubstructureSizeItem = layout.cycleSubstructureSize
    this.chainSubstructureItem = OrganicLayoutChainSubstructureStyle.NONE
    this.chainSubstructureSizeItem = layout.chainSubstructureSize
    this.starSubstructureItem = OrganicLayoutStarSubstructureStyle.NONE
    this.starSubstructureSizeItem = layout.starSubstructureSize
    this.parallelSubstructureItem = OrganicLayoutParallelSubstructureStyle.NONE
    this.parallelSubstructureSizeItem = layout.parallelSubstructureSize
    this.treeSubstructureItem = OrganicLayoutTreeSubstructureStyle.NONE
    this.treeSubstructureSizeItem = layout.treeSubstructureSize
    this.groupSubstructureStyleItem = GroupSubstructureStyle.COMPACT_DISK
    this.groupSubstructureScopeItem = OrganicLayoutGroupSubstructureScope.NO_GROUPS
    this.groupSubstructureSizeItem = layout.groupSubstructureSize
    this.clusterAsGroupSubstructureItem = false

    this.nodeLabelingItem = layout.nodeLabelPlacement
    this.edgeLabelingItem = layout.edgeLabelPlacement
    this.labelPlacementAlongEdgeItem = 'centered'
    this.labelPlacementSideOfEdgeItem = 'on-edge'
    this.labelPlacementOrientationItem = 'horizontal'
    this.labelPlacementDistanceItem = 10.0
    this.title = 'Organic Layout'
  },

  /**
   * @type {ILayoutStage}
   */
  $preStage: null,

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    const layout = new OrganicLayout()
    layout.defaultPreferredEdgeLength = this.preferredEdgeLengthItem
    layout.nodeLabelPlacement = this.nodeLabelingItem
    layout.allowNodeOverlaps = this.allowNodeOverlapsItem
    layout.defaultMinimumNodeDistance = this.minimumNodeDistanceItem
    layout.compactnessFactor = this.compactnessItem
    layout.clusteringPolicy = this.clusteringPolicyItem
    layout.avoidNodeEdgeOverlap = this.avoidNodeEdgeOverlapsItem
    layout.deterministic = this.activateDeterministicModeItem
    layout.stopDuration = TimeSpan.fromSeconds(parseFloat(this.stopDurationItem))
    layout.qualityTimeRatio = this.qualityTimeRatioItem

    const labeling = layout.genericLabeling
    labeling.enabled = this.edgeLabelingItem === EdgeLabelPlacement.GENERIC
    labeling.scope = 'edge-labels'
    if (this.orientationItem !== null) {
      layout.layoutOrientation = this.orientationItem
    }

    layout.edgeLabelPlacement = this.edgeLabelingItem
    if (this.edgeLabelingItem === EdgeLabelPlacement.GENERIC && this.reduceAmbiguityItem) {
      labeling.defaultEdgeLabelingCosts.ambiguousPlacementCost = 1.0
    }

    layout.componentLayout.style = ComponentArrangementStyle.MULTI_ROWS

    this.configureOutputRestrictions(graphComponent, layout)

    layout.cycleSubstructureStyle = this.cycleSubstructureItem
    layout.cycleSubstructureSize = this.cycleSubstructureSizeItem
    layout.chainSubstructureStyle = this.chainSubstructureItem
    layout.chainSubstructureSize = this.chainSubstructureSizeItem
    layout.starSubstructureStyle = this.starSubstructureItem
    layout.starSubstructureSize = this.starSubstructureSizeItem
    layout.parallelSubstructureStyle = this.parallelSubstructureItem
    layout.parallelSubstructureSize = this.parallelSubstructureSizeItem
    layout.treeSubstructureStyle = this.treeSubstructureItem
    layout.treeSubstructureSize = this.treeSubstructureSizeItem
    layout.groupSubstructureStyle = this.groupSubstructureStyleItem
    layout.groupSubstructureScope = this.groupSubstructureScopeItem
    layout.groupSubstructureSize = this.groupSubstructureSizeItem
    layout.allowClusterAsGroupSubstructure = this.clusterAsGroupSubstructureItem

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData = new OrganicLayoutData()
    if (this.groupLayoutPolicyItem == 'ignore-groups') {
      layout.layoutStages.get(GroupHidingStage).enabled = true
    }

    if (this.scopeItem != 'all') {
      layoutData.scope.nodes = graphComponent.selection.nodes
      layoutData.scope.scopeModes = (node) =>
        graphComponent.selection.nodes.includes(node) ? this.scopeItem : OrganicScope.FIXED
    }

    layoutData.scope.groupNodeHandlingPolicies = (node) => {
      if (graphComponent.graph.isGroupNode(node)) {
        switch (this.groupLayoutPolicyItem) {
          case 'fix-group-bounds':
            return GroupNodeHandlingPolicy.FIX_BOUNDS
          case 'layout-groups':
            return GroupNodeHandlingPolicy.FREE
          case 'fix-group-contents':
            return GroupNodeHandlingPolicy.FIX_CONTENTS
        }
      }
      return GroupNodeHandlingPolicy.FREE
    }

    if (this.edgeDirectednessItem) {
      layoutData.edgeDirectedness = (edge) => {
        const style = edge.style
        if (
          style instanceof PolylineEdgeStyle &&
          !(style.targetArrow instanceof Arrow && style.targetArrow.type === ArrowType.NONE)
        ) {
          return 1
        }
        return 0
      }
    }
    if (this.useEdgeGroupingItem) {
      layoutData.substructureSourceGroupIds = 'Group'
      layoutData.substructureTargetGroupIds = 'Group'
    }

    if (this.orientationItem !== null) {
      layoutData.edgeOrientation.mapperFunction = (edge) => {
        const style = edge.style
        if (
          style instanceof PolylineEdgeStyle &&
          !(style.targetArrow instanceof Arrow && style.targetArrow.type === ArrowType.NONE)
        ) {
          return 1
        }
        return 0
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

  configureOutputRestrictions: function (graphComponent, layout) {
    let viewInfoIsAvailable = false
    const visibleRect = this.getVisibleRectangle(graphComponent)
    let x = 0
    let y = 0
    let w = 0
    let h = 0
    if (visibleRect !== null) {
      viewInfoIsAvailable = true
      x = visibleRect[0]
      y = visibleRect[1]
      w = visibleRect[2]
      h = visibleRect[3]
    }
    switch (this.restrictOutputItem) {
      case 'none':
        layout.componentLayout.enabled = true
        layout.shapeConstraint = ShapeConstraint.NONE
        break
      case 'output-cage':
        if (!viewInfoIsAvailable || !this.rectCageUseViewItem) {
          x = this.cageXItem
          y = this.cageYItem
          w = this.cageWidthItem
          h = this.cageHeightItem
        }
        layout.shapeConstraint = ShapeConstraint.createRectangularConstraint(x, y, w, h)
        layout.componentLayout.enabled = false
        break
      case 'output-ar': {
        const ratio = viewInfoIsAvailable && this.arCageUseViewItem ? w / h : this.cageRatioItem
        layout.shapeConstraint = ShapeConstraint.createAspectRatioConstraint(ratio)
        layout.componentLayout.enabled = true
        layout.componentLayout.preferredSize = new Size(ratio * 100, 100)
        break
      }
      case 'output-elliptical-cage':
        if (!viewInfoIsAvailable || !this.rectCageUseViewItem) {
          x = this.cageXItem
          y = this.cageYItem
          w = this.cageWidthItem
          h = this.cageHeightItem
        }
        layout.shapeConstraint = ShapeConstraint.createEllipticalConstraint(x, y, w, h)
        layout.componentLayout.enabled = false
        break
      default:
        layout.componentLayout.enabled = true
        layout.shapeConstraint = ShapeConstraint.NONE
        break
    }
  },

  getVisibleRectangle: function (graphComponent) {
    const visibleRect = [0, 0, 0, 0]
    if (graphComponent !== null) {
      const viewPort = graphComponent.viewport
      visibleRect[0] = viewPort.x
      visibleRect[1] = viewPort.y
      visibleRect[2] = viewPort.width
      visibleRect[3] = viewPort.height
      return visibleRect
    }
    return null
  },

  /** @type {OptionGroup} */
  VisualGroup: null,

  /** @type {OptionGroup} */
  RestrictionsGroup: null,

  /** @type {OptionGroup} */
  CageGroup: null,

  /** @type {OptionGroup} */
  ARGroup: null,

  /** @type {OptionGroup} */
  GroupingGroup: null,

  /** @type {OptionGroup} */
  AlgorithmGroup: null,

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
      return "<p style='margin-top:0'>The organic layout style is based on the force-directed layout paradigm. This algorithm simulates physical forces and rearranges the positions of the nodes in such a way that the sum of the forces emitted by the nodes and the edges reaches a (local) minimum.</p><p>This style is well suited for the visualization of highly connected backbone regions with attached peripheral ring or tree structures. In a diagram arranged by this algorithm, these regions of a network can be easily identified.</p><p>The organic layout style is a multi-purpose layout for undirected graphs. It produces clear representations of complex networks and is especially fitted for application domains such as:</p><ul><li>Bioinformatics</li><li>Enterprise networking</li><li>Knowledge representation</li><li>System management</li><li>WWW visualization</li><li>Mesh visualization</li></ul>"
    }
  },

  /** @type {OrganicLayoutScope} */
  scopeItem: null,

  /** @type {number} */
  preferredEdgeLengthItem: 0,

  /** @type {boolean} */
  allowNodeOverlapsItem: false,

  /** @type {boolean} */
  shouldDisableAllowNodeOverlapsItem: {
    get: function () {
      return this.nodeLabelingItem !== NodeLabelPlacement.IGNORE
    }
  },

  /** @type {number} */
  minimumNodeDistanceItem: 0,

  /** @type {boolean} */
  shouldDisableMinimumNodeDistanceItem: {
    get: function () {
      return this.allowNodeOverlapsItem && this.nodeLabelingItem === NodeLabelPlacement.IGNORE
    }
  },

  /** @type {boolean} */
  avoidNodeEdgeOverlapsItem: false,

  /** @type {number} */
  compactnessItem: 0,

  /** @type {LayoutOrientation} */
  orientationItem: null,

  /** @type {boolean} */
  clusteringPolicyItem: OrganicLayoutClusteringPolicy.NONE,

  /** @type {OutputRestrictions} */
  restrictOutputItem: null,

  /** @type {boolean} */
  shouldDisableCageGroup: {
    get: function () {
      return (
        this.restrictOutputItem !== 'output-cage' &&
        this.restrictOutputItem !== 'output-elliptical-cage'
      )
    }
  },

  /** @type {boolean} */
  rectCageUseViewItem: false,

  /** @type {number} */
  cageXItem: 0,

  /** @type {boolean} */
  shouldDisableCageXItem: {
    get: function () {
      return this.rectCageUseViewItem
    }
  },

  /** @type {number} */
  cageYItem: 0,

  /** @type {boolean} */
  shouldDisableCageYItem: {
    get: function () {
      return this.rectCageUseViewItem
    }
  },

  /** @type {number} */
  cageWidthItem: 0,

  /** @type {boolean} */
  shouldDisableCageWidthItem: {
    get: function () {
      return this.rectCageUseViewItem
    }
  },

  /** @type {number} */
  cageHeightItem: 0,

  /** @type {boolean} */
  shouldDisableCageHeightItem: {
    get: function () {
      return this.rectCageUseViewItem
    }
  },

  /** @type {boolean} */
  arCageUseViewItem: false,

  /** @type {number} */
  cageRatioItem: 0,

  /** @type {boolean} */
  shouldDisableCageRatioItem: {
    get: function () {
      return this.arCageUseViewItem
    }
  },

  /** @type {GroupLayoutPolicy} */
  groupLayoutPolicyItem: null,

  /** @type {number} */
  qualityTimeRatioItem: 0,

  /** @type {number} */
  stopDurationItem: 5,

  /** @type {boolean} */
  activateDeterministicModeItem: false,

  /** @type {NodeLabelPlacement} */
  nodeLabelingItem: null,

  /** @type {OrganicLayoutCycleSubstructureStyle} */
  cycleSubstructureItem: null,

  /** @type {number} */
  cycleSubstructureSizeItem: 4,

  shouldDisableCycleSubstructureSizeItem: {
    get: function () {
      return this.cycleSubstructureItem === OrganicLayoutCycleSubstructureStyle.NONE
    }
  },

  /** @type {OrganicLayoutChainSubstructureStyle} */
  chainSubstructureItem: null,

  /** @type {number} */
  chainSubstructureSizeItem: 4,

  shouldDisableChainSubstructureSizeItem: {
    get: function () {
      return this.chainSubstructureItem === OrganicLayoutChainSubstructureStyle.NONE
    }
  },

  /** @type {OrganicLayoutStarSubstructureStyle} */
  starSubstructureItem: null,

  /** @type {number} */
  starSubstructureSizeItem: 4,

  shouldDisableStarSubstructureSizeItem: {
    get: function () {
      return this.starSubstructureItem === OrganicLayoutStarSubstructureStyle.NONE
    }
  },

  /** @type {OrganicLayoutParallelSubstructureStyle  } */
  parallelSubstructureItem: null,

  /** @type {number} */
  parallelSubstructureSizeItem: 3,

  shouldDisableParallelSubstructureSizeItem: {
    get: function () {
      return this.parallelSubstructureItem === OrganicLayoutParallelSubstructureStyle.NONE
    }
  },

  /** @type {OrganicLayoutTreeSubstructureStyle} */
  treeSubstructureItem: null,

  /** @type {number} */
  treeSubstructureSizeItem: 4,

  shouldDisableTreeSubstructureSizeItem: {
    get: function () {
      return this.treeSubstructureItem === OrganicLayoutTreeSubstructureStyle.NONE
    }
  },

  /** @type {GroupSubstructureStyle} */
  groupSubstructureStyleItem: null,

  shouldDisableGroupSubstructureStyleItem: {
    get: function () {
      return this.groupSubstructureScopeItem === OrganicLayoutGroupSubstructureScope.NO_GROUPS
    }
  },

  /** @type {OrganicLayoutGroupSubstructureScope} */
  groupSubstructureScopeItem: null,

  /** @type {number} */
  groupSubstructureSizeItem: 4,

  shouldDisableGroupSubstructureSizeItem: {
    get: function () {
      return this.groupSubstructureScopeItem === OrganicLayoutGroupSubstructureScope.NO_GROUPS
    }
  },

  /** @type {boolean} */
  clusterAsGroupSubstructureItem: false,

  shouldDisableClusterAsGroupSubstructureItem: {
    get: function () {
      return (
        this.groupSubstructureScopeItem !== OrganicLayoutGroupSubstructureScope.ALL_GROUPS &&
        this.groupSubstructureScopeItem !==
          OrganicLayoutGroupSubstructureScope.GROUPS_WITHOUT_INTER_EDGES
      )
    }
  },

  /** @type {boolean} */
  edgeDirectednessItem: false,

  /** @type {boolean} */
  useEdgeGroupingItem: false,

  /** @type {EdgeLabelPlacement} */
  edgeLabelingItem: null,

  /** @type {boolean} */
  reduceAmbiguityItem: false,

  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: {
    get: function () {
      return this.edgeLabelingItem !== EdgeLabelPlacement.GENERIC
    }
  },

  /** @type {LabelPlacementOrientation} */
  labelPlacementOrientationItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: {
    get: function () {
      return this.edgeLabelingItem === EdgeLabelPlacement.IGNORE
    }
  },

  /** @type {LabelPlacementAlongEdge} */
  labelPlacementAlongEdgeItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: {
    get: function () {
      return this.edgeLabelingItem === EdgeLabelPlacement.IGNORE
    }
  },

  /** @type {LabelPlacementSideOfEdge} */
  labelPlacementSideOfEdgeItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: {
    get: function () {
      return this.edgeLabelingItem === EdgeLabelPlacement.IGNORE
    }
  },

  /** @type {number} */
  labelPlacementDistanceItem: 0,

  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: {
    get: function () {
      return (
        this.edgeLabelingItem === EdgeLabelPlacement.IGNORE ||
        this.labelPlacementSideOfEdgeItem === 'on-edge'
      )
    }
  }
})
