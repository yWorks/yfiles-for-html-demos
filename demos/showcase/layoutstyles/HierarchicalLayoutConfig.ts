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
  ComponentArrangementPolicy,
  EdgeLabelPlacement,
  FeedbackEdgeSet,
  FromSketchLayerAssigner,
  GenericLabeling,
  GraphComponent,
  GridComponentDescriptor,
  GroupAlignmentPolicy,
  GroupLayeringPolicy,
  HierarchicalLayout,
  HierarchicalLayoutData,
  HierarchicalLayoutLayeringStrategy,
  HierarchicalLayoutNodeDescriptor,
  HierarchicalLayoutPortAssignmentMode,
  HierarchicalLayoutRoutingStyle,
  HierarchicalLayoutSubcomponentDescriptor,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  INode,
  ITable,
  LayoutData,
  LayoutOrientation,
  LeftRightSubtreePlacer,
  List,
  LongestPath,
  NodeLabelPlacement,
  OrganicLayout,
  Point,
  PolylineEdgeStyle,
  RecursiveEdgePolicy,
  RoutingStyleDescriptor,
  SymmetryOptimizationStrategy,
  TimeSpan,
  TreeLayout
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
import { TopLevelGroupToSwimlaneStage } from './TopLevelGroupToSwimlaneStage'

/**
 * Configuration options for the layout algorithm of the same name.
 */
export const HierarchicalLayoutConfig = (Class as any)('HierarchicalLayoutConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    GeneralGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    subComponentsItem: [
      new LabelAttribute(
        'Layout Subcomponents Separately',
        '#/api/HierarchicalLayoutData#HierarchicalLayoutData-property-subcomponents'
      ),
      new OptionGroupAttribute('GeneralGroup', 45),
      new TypeAttribute(Boolean)
    ],
    IncrementalGroup: [
      new LabelAttribute('Incremental Layout'),
      new OptionGroupAttribute('GeneralGroup', 70),
      new TypeAttribute(OptionGroup)
    ],
    DistanceGroup: [
      new OptionGroupAttribute('GeneralGroup', 60),
      new LabelAttribute('Minimum Distances'),
      new TypeAttribute(OptionGroup)
    ],
    EdgeSettingsGroup: [
      new LabelAttribute('Edges'),
      new OptionGroupAttribute('RootGroup', 20),
      new TypeAttribute(OptionGroup)
    ],
    RankGroup: [
      new LabelAttribute('Layers'),
      new OptionGroupAttribute('RootGroup', 30),
      new TypeAttribute(OptionGroup)
    ],
    LabelingGroup: [
      new LabelAttribute('Labeling'),
      new OptionGroupAttribute('RootGroup', 40),
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
    GroupingGroup: [
      new LabelAttribute('Grouping'),
      new OptionGroupAttribute('RootGroup', 50),
      new TypeAttribute(OptionGroup)
    ],
    SwimlanesGroup: [
      new LabelAttribute('Swimlanes'),
      new OptionGroupAttribute('RootGroup', 60),
      new TypeAttribute(OptionGroup)
    ],
    GridGroup: [
      new LabelAttribute('Grid'),
      new OptionGroupAttribute('RootGroup', 70),
      new TypeAttribute(OptionGroup)
    ],
    descriptionText: [
      new OptionGroupAttribute('DescriptionGroup', 10),
      new ComponentAttribute(Components.HTML_BLOCK),
      new TypeAttribute(String)
    ],
    selectedElementsIncrementallyItem: [
      new LabelAttribute(
        'Selected Elements Incrementally',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-fromSketchMode'
      ),
      new OptionGroupAttribute('IncrementalGroup', 10),
      new TypeAttribute(Boolean)
    ],
    useDrawingAsSketchItem: [
      new LabelAttribute(
        'Use Drawing as Sketch',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-fromSketchMode'
      ),
      new OptionGroupAttribute('IncrementalGroup', 20),
      new TypeAttribute(Boolean)
    ],
    orientationItem: [
      new LabelAttribute(
        'Orientation',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-layoutOrientation'
      ),
      new OptionGroupAttribute('GeneralGroup', 20),
      new EnumValuesAttribute([
        ['Top to Bottom', LayoutOrientation.TOP_TO_BOTTOM],
        ['Left to Right', LayoutOrientation.LEFT_TO_RIGHT],
        ['Bottom to Top', LayoutOrientation.BOTTOM_TO_TOP],
        ['Right to Left', LayoutOrientation.RIGHT_TO_LEFT]
      ]),
      new TypeAttribute(LayoutOrientation)
    ],
    LayoutComponentsSeparatelyItem: [
      new LabelAttribute(
        'Layout Components Separately',
        '#/api/ComponentLayout#LayoutStageBase-property-enabled'
      ),
      new OptionGroupAttribute('GeneralGroup', 30),
      new TypeAttribute(Boolean)
    ],
    symmetricPlacementItem: [
      new LabelAttribute(
        'Symmetric Optimization',
        '#/api/CoordinateAssigner#CoordinateAssigner-property-symmetryOptimizationStrategy'
      ),
      new OptionGroupAttribute('GeneralGroup', 40),
      new EnumValuesAttribute([
        ['Strong', SymmetryOptimizationStrategy.STRONG],
        ['Weak', SymmetryOptimizationStrategy.WEAK],
        ['None', SymmetryOptimizationStrategy.NONE]
      ]),
      new TypeAttribute(SymmetryOptimizationStrategy)
    ],
    stopDurationItem: [
      new LabelAttribute(
        'Stop Duration (sec)',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-stopDuration'
      ),
      new MinMaxAttribute(0, 150),
      new OptionGroupAttribute('GeneralGroup', 50),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    nodeDistanceItem: [
      new LabelAttribute(
        'Node Distance',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-nodeDistance'
      ),
      new MinMaxAttribute(0, 100),
      new OptionGroupAttribute('DistanceGroup', 10),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    nodeToEdgeDistanceItem: [
      new LabelAttribute(
        'Node to Edge Distance',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-nodeToEdgeDistance'
      ),
      new MinMaxAttribute(0, 100),
      new OptionGroupAttribute('DistanceGroup', 20),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    edgeDistanceItem: [
      new LabelAttribute(
        'Edge Distance',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-edgeDistance'
      ),
      new MinMaxAttribute(0, 100),
      new OptionGroupAttribute('DistanceGroup', 30),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumLayerDistanceItem: [
      new LabelAttribute(
        'Layer to Layer Distance',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-minimumLayerDistance'
      ),
      new MinMaxAttribute(0, 100),
      new OptionGroupAttribute('DistanceGroup', 40),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    edgeRoutingItem: [
      new LabelAttribute(
        'Routing Style',
        '#/api/HierarchicalLayoutEdgeDescriptor#HierarchicalLayoutEdgeDescriptor-property-routingStyleDescriptor'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 10),
      new EnumValuesAttribute([
        ['Octilinear', HierarchicalLayoutRoutingStyle.OCTILINEAR],
        ['Orthogonal', HierarchicalLayoutRoutingStyle.ORTHOGONAL],
        ['Polyline', HierarchicalLayoutRoutingStyle.POLYLINE],
        ['Curved', HierarchicalLayoutRoutingStyle.CURVED]
      ]),
      new TypeAttribute(HierarchicalLayoutRoutingStyle)
    ],
    backloopRoutingItem: [
      new LabelAttribute(
        'Backloop Routing',
        '#/api/HierarchicalLayoutEdgeDescriptor#HierarchicalLayoutEdgeDescriptor-property-backLoopRouting'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 20),
      new TypeAttribute(Boolean)
    ],
    automaticEdgeGroupingEnabledItem: [
      new LabelAttribute(
        'Automatic Edge Grouping',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-automaticEdgeGrouping'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 40),
      new TypeAttribute(Boolean)
    ],
    automaticBusRoutingEnabledItem: [
      new LabelAttribute(
        'Automatic Bus Routing',
        '#/api/HierarchicalLayoutData#HierarchicalLayoutData-property-gridComponents'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 45),
      new TypeAttribute(Boolean)
    ],
    highlightCriticalPath: [
      new LabelAttribute(
        'Highlight Critical Path',
        '#/api/HierarchicalLayoutData#HierarchicalLayoutData-property-criticalEdgePriorities'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 50),
      new TypeAttribute(Boolean)
    ],
    minimumFirstSegmentLengthItem: [
      new LabelAttribute(
        'Minimum First Segment Length',
        '#/api/HierarchicalLayoutEdgeDescriptor#HierarchicalLayoutEdgeDescriptor-property-minimumFirstSegmentLength'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 60),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumLastSegmentLengthItem: [
      new LabelAttribute(
        'Minimum Last Segment Length',
        '#/api/HierarchicalLayoutEdgeDescriptor#HierarchicalLayoutEdgeDescriptor-property-minimumLastSegmentLength'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 70),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumEdgeLengthItem: [
      new LabelAttribute(
        'Minimum Edge Length',
        '#/api/HierarchicalLayoutEdgeDescriptor#HierarchicalLayoutEdgeDescriptor-property-minimumLength'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 80),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumEdgeDistanceItem: [
      new LabelAttribute(
        'Minimum Edge Distance',
        '#/api/HierarchicalLayoutEdgeDescriptor#HierarchicalLayoutEdgeDescriptor-property-minimumDistance'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 90),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumSlopeItem: [
      new MinMaxAttribute(0.0, 5.0, 0.01),
      new LabelAttribute(
        'Minimum Slope',
        '#/api/HierarchicalLayoutEdgeDescriptor#HierarchicalLayoutEdgeDescriptor-property-minimumSlope'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    edgeDirectednessItem: [
      new OptionGroupAttribute('EdgeSettingsGroup', 110),
      new LabelAttribute(
        'Arrows Define Edge Direction',
        '#/api/HierarchicalLayoutData#HierarchicalLayoutData-property-edgeDirectedness'
      ),
      new TypeAttribute(Boolean)
    ],
    edgeThicknessItem: [
      new OptionGroupAttribute('EdgeSettingsGroup', 120),
      new LabelAttribute(
        'Consider Edge Thickness',
        '#/api/HierarchicalLayoutData#HierarchicalLayoutData-property-edgeThickness'
      ),
      new TypeAttribute(Boolean)
    ],
    straightenEdgesItem: [
      new LabelAttribute(
        'Straighten Edges',
        '#/api/CoordinateAssigner#CoordinateAssigner-property-straightenEdges'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 140),
      new TypeAttribute(Boolean)
    ],
    recursiveEdgeStyleItem: [
      new LabelAttribute(
        'Recursive Edge Routing Policy',
        '#/api/HierarchicalLayoutEdgeDescriptor#HierarchicalLayoutEdgeDescriptor-property-recursiveEdgePolicy'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 150),
      new EnumValuesAttribute([
        ['Off', RecursiveEdgePolicy.OFF],
        ['Directed', RecursiveEdgePolicy.DIRECTED],
        ['Undirected', RecursiveEdgePolicy.UNDIRECTED]
      ]),
      new TypeAttribute(RecursiveEdgePolicy)
    ],
    curveUTurnSymmetryItem: [
      new LabelAttribute(
        'U-turn Symmetry',
        '#/api/EdgeRouterEdgeDescriptor#EdgeRouterEdgeDescriptor-property-curveUTurnSymmetry'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 160),
      new MinMaxAttribute(0, 1, 0.1),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    curveShortcutsItem: [
      new LabelAttribute(
        'Allow Shortcuts',
        '#/api/EdgeRouterEdgeDescriptor#EdgeRouterEdgeDescriptor-property-curveShortcuts'
      ),
      new OptionGroupAttribute('EdgeSettingsGroup', 170),
      new TypeAttribute(Boolean)
    ],
    rankingPolicyItem: [
      new LabelAttribute(
        'Layer Assignment Policy',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-fromScratchLayeringStrategy'
      ),
      new OptionGroupAttribute('RankGroup', 10),
      new EnumValuesAttribute([
        ['Hierarchical - Optimal', HierarchicalLayoutLayeringStrategy.HIERARCHICAL_OPTIMAL],
        [
          'Hierarchical - Tight Tree Heuristic',
          HierarchicalLayoutLayeringStrategy.HIERARCHICAL_TIGHT_TREE
        ],
        ['BFS Layering', HierarchicalLayoutLayeringStrategy.BFS],
        ['From Sketch', HierarchicalLayoutLayeringStrategy.FROM_SKETCH],
        ['Hierarchical - Topmost', HierarchicalLayoutLayeringStrategy.HIERARCHICAL_TOPMOST]
      ]),
      new TypeAttribute(HierarchicalLayoutLayeringStrategy)
    ],
    layerAlignmentItem: [
      new LabelAttribute(
        'Alignment within Layer',
        '#/api/HierarchicalLayoutNodeDescriptor#HierarchicalLayoutNodeDescriptor-property-layerAlignment'
      ),
      new OptionGroupAttribute('RankGroup', 20),
      new EnumValuesAttribute([
        ['Top Border of Nodes', 0],
        ['Center of Nodes', 0.5],
        ['Bottom Border of Nodes', 1]
      ]),
      new TypeAttribute(Number)
    ],
    componentArrangementPolicyItem: [
      new LabelAttribute(
        'Component Arrangement',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-componentArrangementPolicy'
      ),
      new OptionGroupAttribute('RankGroup', 30),
      new EnumValuesAttribute([
        ['Topmost', ComponentArrangementPolicy.TOPMOST],
        ['Compact', ComponentArrangementPolicy.COMPACT]
      ]),
      new TypeAttribute(ComponentArrangementPolicy)
    ],
    nodeCompactionItem: [
      new OptionGroupAttribute('RankGroup', 40),
      new LabelAttribute(
        'Stacked Placement',
        '#/api/CoordinateAssigner#CoordinateAssigner-property-nodeCompaction'
      ),
      new TypeAttribute(Boolean)
    ],
    SketchGroup: [
      new OptionGroupAttribute('RankGroup', 50),
      new LabelAttribute('From Sketch Layer Assignment'),
      new TypeAttribute(OptionGroup)
    ],
    scaleItem: [
      new OptionGroupAttribute('SketchGroup', 10),
      new MinMaxAttribute(0.0, 5.0, 0.01),
      new LabelAttribute(
        'Scale',
        '#/api/FromSketchLayerAssigner#FromSketchLayerAssigner-property-nodeScalingFactor'
      ),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    nodeMarginItem: [
      new OptionGroupAttribute('SketchGroup', 20),
      new LabelAttribute(
        'Node Margin',
        '#/api/FromSketchLayerAssigner#FromSketchLayerAssigner-property-nodeMargin'
      ),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumSizeItem: [
      new OptionGroupAttribute('SketchGroup', 30),
      new LabelAttribute(
        'Minimum Size',
        '#/api/FromSketchLayerAssigner#FromSketchLayerAssigner-property-minimumNodeSize'
      ),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    maximumSizeItem: [
      new OptionGroupAttribute('SketchGroup', 40),
      new LabelAttribute(
        'Maximum Size',
        '#/api/FromSketchLayerAssigner#FromSketchLayerAssigner-property-maximumNodeSize'
      ),
      new MinMaxAttribute(0, 1000),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    nodeLabelingItem: [
      new OptionGroupAttribute('NodePropertiesGroup', 10),
      new LabelAttribute(
        'Node Labeling',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-nodeLabelPlacement'
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
        '#/api/HierarchicalLayout#HierarchicalLayout-property-edgeLabelPlacement'
      ),
      new OptionGroupAttribute('EdgePropertiesGroup', 10),
      new EnumValuesAttribute([
        ['Ignore', EdgeLabelPlacement.IGNORE],
        ['Integrated', EdgeLabelPlacement.INTEGRATED],
        ['Generic', EdgeLabelPlacement.GENERIC]
      ]),
      new TypeAttribute(EdgeLabelPlacement)
    ],
    compactEdgeLabelPlacementItem: [
      new LabelAttribute(
        'Compact Placement',
        '#/api/CoordinateAssigner#CoordinateAssigner-property-labelCompaction'
      ),
      new OptionGroupAttribute('EdgePropertiesGroup', 30),
      new TypeAttribute(Boolean)
    ],
    reduceAmbiguityItem: [
      new LabelAttribute(
        'Reduce Ambiguity',
        '#/api/LabelingCosts#LabelingCosts-property-ambiguousPlacementCost'
      ),
      new OptionGroupAttribute('EdgePropertiesGroup', 40),
      new TypeAttribute(Boolean)
    ],
    labelPlacementOrientationItem: [
      new LabelAttribute('Orientation', '#/api/EdgeLabelPreferredPlacement'),
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
      new MinMaxAttribute(0, 40),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    groupLayeringPolicyItem: [
      new OptionGroupAttribute('GroupingGroup', 10),
      new LabelAttribute(
        'Layering Strategy',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-groupLayeringPolicy'
      ),
      new EnumValuesAttribute([
        ['Ignore Groups', GroupLayeringPolicy.IGNORE_GROUPS],
        ['Recursive', GroupLayeringPolicy.RECURSIVE],
        ['Recursive Compact', GroupLayeringPolicy.RECURSIVE_COMPACT]
      ]),
      new TypeAttribute(GroupLayeringPolicy)
    ],
    groupAlignmentItem: [
      new OptionGroupAttribute('GroupingGroup', 20),
      new LabelAttribute(
        'Vertical Alignment',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-groupAlignmentPolicy'
      ),
      new EnumValuesAttribute([
        ['Top', GroupAlignmentPolicy.TOP],
        ['Center', GroupAlignmentPolicy.CENTER],
        ['Bottom', GroupAlignmentPolicy.BOTTOM]
      ]),
      new TypeAttribute(GroupAlignmentPolicy)
    ],
    groupHorizontalCompactionItem: [
      new OptionGroupAttribute('GroupingGroup', 40),
      new LabelAttribute(
        'Horizontal Group Compaction',
        '#/api/CoordinateAssigner#CoordinateAssigner-property-groupCompaction'
      ),
      new TypeAttribute(Boolean)
    ],
    treatRootGroupAsSwimlanesItem: [
      new OptionGroupAttribute('SwimlanesGroup', 10),
      new LabelAttribute('Treat Groups as Swimlanes'),
      new TypeAttribute(Boolean)
    ],
    useOrderFromSketchItem: [
      new OptionGroupAttribute('SwimlanesGroup', 20),
      new LabelAttribute('Use Sketch for Lane Order'),
      new TypeAttribute(Boolean)
    ],
    swimlineSpacingItem: [
      new OptionGroupAttribute('SwimlanesGroup', 30),
      new LabelAttribute('Lane Spacing'),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    gridEnabledItem: [
      new OptionGroupAttribute('GridGroup', 10),
      new LabelAttribute(
        'Grid',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-gridSpacing'
      ),
      new TypeAttribute(Boolean)
    ],
    gridSpacingItem: [
      new OptionGroupAttribute('GridGroup', 20),
      new LabelAttribute(
        'Grid Spacing',
        '#/api/HierarchicalLayout#HierarchicalLayout-property-gridSpacing'
      ),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    gridPortAssignmentItem: [
      new OptionGroupAttribute('GridGroup', 30),
      new LabelAttribute(
        'Grid Port Style',
        '#/api/HierarchicalLayoutNodeDescriptor#HierarchicalLayoutNodeDescriptor-property-portAssignment'
      ),
      new EnumValuesAttribute([
        ['Default', HierarchicalLayoutPortAssignmentMode.DEFAULT],
        ['On Grid', HierarchicalLayoutPortAssignmentMode.ON_GRID],
        ['On Subgrid', HierarchicalLayoutPortAssignmentMode.ON_SUBGRID]
      ]),
      new TypeAttribute(HierarchicalLayoutPortAssignmentMode)
    ]
  },

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)
    this.groupHorizontalCompactionItem = true
    this.groupAlignmentItem = GroupAlignmentPolicy.CENTER
    this.nodeLabelingItem = NodeLabelPlacement.CONSIDER
    this.maximumSizeItem = 1000.0
    this.scaleItem = 1.0
    this.componentArrangementPolicyItem = ComponentArrangementPolicy.TOPMOST
    this.nodeCompactionItem = false
    this.rankingPolicyItem = HierarchicalLayoutLayeringStrategy.HIERARCHICAL_OPTIMAL
    this.minimumSlopeItem = 0.25
    this.edgeDirectednessItem = true
    this.edgeThicknessItem = true
    this.minimumEdgeDistanceItem = 15.0
    this.minimumEdgeLengthItem = 20.0
    this.minimumLastSegmentLengthItem = 15.0
    this.minimumFirstSegmentLengthItem = 10.0
    this.edgeRoutingItem = HierarchicalLayoutRoutingStyle.ORTHOGONAL
    this.minimumLayerDistanceItem = 10.0
    this.edgeDistanceItem = 15.0
    this.nodeToEdgeDistanceItem = 15.0
    this.nodeDistanceItem = 30.0
    this.symmetricPlacementItem = SymmetryOptimizationStrategy.STRONG
    this.recursiveEdgeStyleItem = RecursiveEdgePolicy.OFF
    this.stopDurationItem = 5
    this.edgeLabelingItem = EdgeLabelPlacement.INTEGRATED
    this.compactEdgeLabelPlacementItem = true
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
    this.groupLayeringPolicyItem = GroupLayeringPolicy.RECURSIVE
    this.gridEnabledItem = false
    this.gridSpacingItem = 5
    this.gridPortAssignmentItem = HierarchicalLayoutPortAssignmentMode.DEFAULT
    this.orientationItem = LayoutOrientation.TOP_TO_BOTTOM
    this.title = 'Hierarchical Layout'
    this.subComponentsItem = false
    this.highlightCriticalPath = false
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const layout = new HierarchicalLayout()

    //  mark incremental elements if required
    const fromSketch = this.useDrawingAsSketchItem
    const incrementalLayout = this.selectedElementsIncrementallyItem
    const selectedElements =
      graphComponent.selection.edges.size !== 0 || graphComponent.selection.nodes.size !== 0

    if (incrementalLayout && selectedElements) {
      layout.fromSketchMode = true
    } else layout.fromSketchMode = !!fromSketch

    layout.coordinateAssigner.symmetryOptimizationStrategy = this.symmetricPlacementItem

    layout.componentLayout.enabled = this.LayoutComponentsSeparatelyItem

    layout.minimumLayerDistance = this.minimumLayerDistanceItem
    layout.nodeToEdgeDistance = this.nodeToEdgeDistanceItem
    layout.nodeDistance = this.nodeDistanceItem
    layout.edgeDistance = this.edgeDistanceItem

    const nld = layout.defaultNodeDescriptor
    const eld = layout.defaultEdgeDescriptor

    layout.automaticEdgeGrouping = this.automaticEdgeGroupingEnabledItem

    eld.routingStyleDescriptor = new RoutingStyleDescriptor(this.edgeRoutingItem)
    eld.routingStyleDescriptor.curveShortcuts = this.curveShortcutsItem
    eld.routingStyleDescriptor.curveUTurnSymmetry = this.curveUTurnSymmetryItem
    eld.minimumFirstSegmentLength = this.minimumFirstSegmentLengthItem
    eld.minimumLastSegmentLength = this.minimumLastSegmentLengthItem

    eld.minimumDistance = this.minimumEdgeDistanceItem
    eld.minimumLength = this.minimumEdgeLengthItem

    eld.minimumSlope = this.minimumSlopeItem

    eld.recursiveEdgePolicy = this.recursiveEdgeStyleItem

    nld.minimumDistance = Math.min(layout.nodeDistance, layout.nodeToEdgeDistance)
    nld.minimumLayerHeight = 0
    nld.layerAlignment = this.layerAlignmentItem

    layout.layoutOrientation = this.orientationItem
    layout.nodeLabelPlacement = this.nodeLabelingItem
    layout.edgeLabelPlacement = this.edgeLabelingItem
    if (this.edgeLabelingItem === EdgeLabelPlacement.GENERIC && this.reduceAmbiguityItem) {
      const labeling = layout.layoutStages.get(GenericLabeling)!
      labeling.defaultEdgeLabelingCosts.ambiguousPlacementCost = 1.0
    }
    if (this.edgeLabelingItem === EdgeLabelPlacement.INTEGRATED) {
      layout.coordinateAssigner.labelCompaction = this.compactEdgeLabelPlacementItem
    }

    layout.fromScratchLayeringStrategy = this.rankingPolicyItem
    layout.componentArrangementPolicy = this.componentArrangementPolicyItem
    layout.coordinateAssigner.nodeCompaction = this.nodeCompactionItem
    layout.coordinateAssigner.straightenEdges = this.straightenEdgesItem

    // configure FromSketchLayerer
    const layerer = layout.fromSketchMode
      ? layout.core.fixedElementsLayerAssigner
      : layout.core.fromScratchLayerAssigner
    if (layerer instanceof FromSketchLayerAssigner) {
      layerer.nodeMargin = this.nodeMarginItem
      layerer.nodeScalingFactor = this.scaleItem
      layerer.minimumNodeSize = this.minimumSizeItem
      layerer.maximumNodeSize = this.maximumSizeItem
    }

    // configure grouping
    layout.coordinateAssigner.groupCompaction = this.groupHorizontalCompactionItem

    if (!fromSketch) {
      layout.groupLayeringPolicy = this.groupLayeringPolicyItem
      layout.groupAlignmentPolicy = this.groupAlignmentItem
    } else {
      layout.groupLayeringPolicy = GroupLayeringPolicy.RECURSIVE_COMPACT
    }

    // append the stage only if the graph does not already contain table nodes
    if (this.treatRootGroupAsSwimlanesItem && !this.containsTable(graphComponent.graph)) {
      const stage = new TopLevelGroupToSwimlaneStage()
      stage.orderSwimlanesFromSketch = this.useOrderFromSketchItem
      stage.spacing = this.swimlineSpacingItem
      layout.layoutStages.prepend(stage)
    }

    layout.defaultEdgeDescriptor.backLoopRouting = this.backloopRoutingItem
    layout.stopDuration = TimeSpan.fromSeconds(parseFloat(this.stopDurationItem))

    if (this.gridEnabledItem) {
      layout.gridSpacing = this.gridSpacingItem
    }

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
   */
  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: HierarchicalLayout
  ): LayoutData {
    const graph = graphComponent.graph
    const layoutData = new HierarchicalLayoutData()

    const incrementalLayout = this.selectedElementsIncrementallyItem
    const selectedElements =
      graphComponent.selection.edges.size !== 0 || graphComponent.selection.nodes.size !== 0

    if (incrementalLayout && selectedElements) {
      // configure the mode
      // mark the selected nodes and edges as incremental
      layoutData.incrementalNodes = graphComponent.selection.nodes
      layoutData.incrementalEdges = graphComponent.selection.edges
    }

    if (this.rankingPolicyItem === HierarchicalLayoutLayeringStrategy.BFS) {
      layoutData.bfsLayerAssignerCoreNodes = (node) => graphComponent.selection.includes(node)
    }

    if (this.gridEnabledItem) {
      const nld = layout.defaultNodeDescriptor
      layoutData.nodeDescriptors = (node) =>
        new HierarchicalLayoutNodeDescriptor({
          layerAlignment: nld.layerAlignment,
          minimumDistance: nld.minimumDistance,
          minimumLayerHeight: nld.minimumLayerHeight,
          // anchor nodes on grid according to their alignment within the layer
          gridReference: new Point(0.0, (nld.layerAlignment - 0.5) * node.layout.height),
          portAssignment: this.gridPortAssignmentItem
        })
    }

    if (this.edgeDirectednessItem) {
      layoutData.edgeDirectedness = (edge) => {
        const style = edge.style
        if (
          style instanceof PolylineEdgeStyle &&
          !(style.targetArrow instanceof Arrow && style.targetArrow.type === ArrowType.NONE)
        ) {
          return 1
        } else {
          return 0
        }
      }
    }

    if (this.edgeThicknessItem) {
      layoutData.edgeThickness = (edge) => {
        const style = edge.style
        if (style instanceof PolylineEdgeStyle) {
          return style.stroke!.thickness
        }
        return 0
      }
    }

    if (this.subComponentsItem) {
      // layout all siblings with label 'TL' separately with tree layout
      const treeLayout = new TreeLayout()
      treeLayout.defaultSubtreePlacer = new LeftRightSubtreePlacer()
      for (const listOfNodes of this.findSubComponents(graph, 'TL')) {
        layoutData.subcomponents.add(
          new HierarchicalLayoutSubcomponentDescriptor(treeLayout)
        ).items = listOfNodes
      }
      // layout all siblings with label 'HL' separately with hierarchical layout
      const hierarchicalLayout = new HierarchicalLayout()
      hierarchicalLayout.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
      for (const listOfNodes of this.findSubComponents(graph, 'HL')) {
        layoutData.subcomponents.add(
          new HierarchicalLayoutSubcomponentDescriptor(hierarchicalLayout)
        ).items = listOfNodes
      }
      // layout all siblings with label 'OL' separately with organic layout
      const organicLayout = new OrganicLayout()
      organicLayout.defaultPreferredEdgeLength = 100
      organicLayout.deterministic = true
      for (const listOfNodes of this.findSubComponents(graph, 'OL')) {
        layoutData.subcomponents.add(
          new HierarchicalLayoutSubcomponentDescriptor(organicLayout)
        ).items = listOfNodes
      }
    }

    if (this.highlightCriticalPath) {
      // highlight the longest path in the graph as critical path
      // since the longest path algorithm only works for acyclic graphs,
      // feedback edges and self loops have to be excluded here
      const feedbackEdgeSetResult = new FeedbackEdgeSet().run(graph)
      const longestPath = new LongestPath({
        subgraphEdges: {
          excludes: (edge: IEdge) =>
            feedbackEdgeSetResult.feedbackEdgeSet.contains(edge) || edge.isSelfLoop
        }
      }).run(graph)
      if (longestPath.edges.size > 0) {
        layoutData.criticalEdgePriorities = (edge) => {
          if (longestPath.edges.contains(edge)) {
            return 10
          }
          return 1
        }
      }
    }

    if (this.automaticBusRoutingEnabledItem) {
      const allBusNodes = new Set()
      graph.nodes.forEach((node) => {
        if (!graph.isGroupNode(node) && !allBusNodes.has(node)) {
          // search for good opportunities for bus structures rooted at this node
          if (graph.inDegree(node) >= 4) {
            const gridComponentDescriptor = new GridComponentDescriptor()
            const componentEdges = this.getComponentEdges(
              graph,
              node,
              allBusNodes,
              graph.inEdgesAt(node)
            )
            if (componentEdges.length > 0) {
              layoutData.gridComponents.add(gridComponentDescriptor).items = componentEdges
            }
          }
          if (graph.outDegree(node) >= 4) {
            const gridComponentDescriptor = new GridComponentDescriptor()
            const componentEdges = this.getComponentEdges(
              graph,
              node,
              allBusNodes,
              graph.outEdgesAt(node)
            )
            if (componentEdges.length > 0) {
              layoutData.gridComponents.add(gridComponentDescriptor).items = componentEdges
            }
          }
        }
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

  getComponentEdges: function (
    graph: IGraph,
    node: INode,
    allBusNodes: Set<INode>,
    edges: Iterable<IEdge>
  ): IEdge[] {
    if (graph.isGroupNode(node)) {
      // exclude groups for bus structures
      return []
    }

    const busNodes = new Set()
    // count the edges that are not bus edges but connect to the bus nodes
    // -> if there are many, then the bus structure may not look that great
    let interEdgeCount = 0
    const busEdges: IEdge[] = []
    const busNodesWithOtherEdges: INode[] = []
    const node2BusEdge = new Map()
    for (const edge of edges) {
      const other = edge.opposite(node) as INode
      if (!busNodes.has(other)) {
        busNodes.add(other)
        busEdges.push(edge)
        node2BusEdge.set(other, edge)
        const otherEdgesCount = graph.degree(other) - 1
        if (otherEdgesCount > 0) {
          busNodesWithOtherEdges.push(other)
          interEdgeCount += otherEdgesCount
        }
      }
    }

    const finalBusEdges: IEdge[] = []
    const removedBusEdges = new Set()
    let busSize = busNodes.size
    while (busSize >= 4) {
      if (interEdgeCount <= busSize * 0.25) {
        // okay accept this as a bus
        for (const edge of busEdges) {
          if (!removedBusEdges.has(edge)) {
            finalBusEdges.push(edge)
            allBusNodes.add(edge.opposite(node) as INode)
          }
        }
        break
      } else {
        // this bus has too many other edges remove some if possible
        if (busNodesWithOtherEdges.length > 0) {
          const nodeToRemove = busNodesWithOtherEdges.pop()!
          removedBusEdges.add(node2BusEdge.get(nodeToRemove))
          busSize--
          interEdgeCount -= graph.degree(nodeToRemove) - 1
        }
      }
    }

    return finalBusEdges
  },

  /**
   * Determines subcomponents by label text and group membership.
   * This is necessary because {@link HierarchicalLayout} does not support sub-components with nodes
   * that belong to different parent groups.
   */
  findSubComponents(graph: IGraph, labelText: string): Iterable<List<INode>> {
    const nodeToComponent = new Map<INode | null, List<INode>>()
    for (const node of graph.nodes) {
      if (node.labels.size > 0 && node.labels.first()!.text === labelText) {
        const parent = graph.getParent(node)
        if (!nodeToComponent.has(parent)) {
          nodeToComponent.set(parent, new List<INode>())
        }
        nodeToComponent.get(parent)!.add(node)
      }
    }
    return nodeToComponent.values()
  },

  /**
   * Checks whether the graph contains a table node.
   * @param graph The input graph
   */
  containsTable(graph: IGraph): boolean {
    return !!graph.nodes.find((node: INode): boolean => !!ITable.getTable(node))
  },

  /** @type {boolean} */
  subComponentsItem: false,

  /**
   * Enables automatic bus routing.
   */
  enableCurvedRouting: function () {
    this.edgeRoutingItem = HierarchicalLayoutRoutingStyle.CURVED
  },

  /** @type {OptionGroup} */
  GeneralGroup: null,

  /** @type {OptionGroup} */
  IncrementalGroup: null,

  /** @type {OptionGroup} */
  DistanceGroup: null,

  /** @type {OptionGroup} */
  EdgeSettingsGroup: null,

  /** @type {OptionGroup} */
  RankGroup: null,

  /** @type {OptionGroup} */
  LabelingGroup: null,

  /** @type {OptionGroup} */
  NodePropertiesGroup: null,

  /** @type {OptionGroup} */
  EdgePropertiesGroup: null,

  /** @type {OptionGroup} */
  PreferredPlacementGroup: null,

  /** @type {OptionGroup} */
  GroupingGroup: null,

  /** @type {OptionGroup} */
  SwimlanesGroup: null,

  /** @type {OptionGroup} */
  GridGroup: null,

  /** @type {string} */
  descriptionText: {
    get: function (): string {
      return "<p style='margin-top:0'>The hierarchical layout style highlights the main direction or flow of a directed graph. It places the nodes of a graph in hierarchically arranged layers such that the (majority of) its edges follows the overall orientation, for example, top-to-bottom.</p><p>This style is tailored for application domains in which it is crucial to clearly visualize the dependency relations between entities. In particular, if such relations form a chain of dependencies between entities, this layout style nicely exhibits them. Generally, whenever the direction of information flow matters, the hierarchical layout style is an invaluable tool.</p><p>Suitable application domains of this layout style include, for example:</p><ul><li>Workflow visualization</li><li>Software engineering like call graph visualization or activity diagrams</li><li>Process modeling</li><li>Database modeling and Entity-Relationship diagrams</li><li>Bioinformatics, for example biochemical pathways</li><li>Network management</li><li>Decision diagrams</li></ul>"
    }
  },

  /** @type {boolean} */
  selectedElementsIncrementallyItem: false,

  /** @type {boolean} */
  useDrawingAsSketchItem: false,

  /** @type {LayoutOrientation} */
  orientationItem: null,

  /** @type {boolean} */
  LayoutComponentsSeparatelyItem: false,

  /** @type {SymmetryOptimizationStrategy} */
  symmetricPlacementItem: null,

  /** @type {number} */
  stopDurationItem: 5,

  /** @type {number} */
  nodeDistanceItem: 0,

  /** @type {number} */
  nodeToEdgeDistanceItem: 0,

  /** @type {number} */
  edgeDistanceItem: 0,

  /** @type {number} */
  minimumLayerDistanceItem: 0,

  /** @type {RoutingStyleDescriptor} */
  edgeRoutingItem: null,

  /** @type {boolean} */
  backloopRoutingItem: false,

  /** @type {boolean} */
  automaticEdgeGroupingEnabledItem: false,

  /** @type {boolean} */
  automaticBusRoutingEnabledItem: false,

  /** @type {boolean} */
  highlightCriticalPath: false,

  /** @type {number} */
  minimumFirstSegmentLengthItem: 0,

  /** @type {number} */
  minimumLastSegmentLengthItem: 0,

  /** @type {number} */
  minimumEdgeLengthItem: 0,

  /** @type {number} */
  minimumEdgeDistanceItem: 0,

  /** @type {number} */
  minimumSlopeItem: 0,

  /** @type {boolean} */
  shouldDisableMinimumSlopeItem: <any>{
    get: function (): boolean {
      return (
        this.edgeRoutingItem !== HierarchicalLayoutRoutingStyle.POLYLINE &&
        this.edgeRoutingItem !== HierarchicalLayoutRoutingStyle.CURVED
      )
    }
  },

  /** @type {boolean} */
  edgeDirectednessItem: false,

  /** @type {boolean} */
  edgeThicknessItem: false,

  /** @type {boolean} */
  straightenEdgesItem: false,

  /** @type {boolean} */
  shouldDisableStraightenEdgesItem: <any>{
    get: function (): boolean {
      return this.symmetricPlacementItem !== SymmetryOptimizationStrategy.NONE
    }
  },

  /** @type {RecursiveEdgePolicy} */
  recursiveEdgeStyleItem: null,

  /** @type {number} */
  curveUTurnSymmetryItem: 0,

  /** @type {boolean} */
  shouldDisableCurveUTurnSymmetryItem: <any>{
    get: function (): boolean {
      return this.edgeRoutingItem !== HierarchicalLayoutRoutingStyle.CURVED
    }
  },

  /** @type {boolean} */
  curveShortcutsItem: false,

  /** @type {boolean} */
  shouldDisableCurveShortcutsItem: <any>{
    get: function (): boolean {
      return this.edgeRoutingItem !== HierarchicalLayoutRoutingStyle.CURVED
    }
  },

  /** @type {HierarchicalLayoutLayeringStrategy} */
  rankingPolicyItem: null,

  /** @type {number} */
  layerAlignmentItem: 0,

  /** @type {ComponentArrangementPolicy} */
  componentArrangementPolicyItem: null,

  /** @type {boolean} */
  nodeCompactionItem: false,

  /** @type {OptionGroup} */
  SketchGroup: null,

  /** @type {number} */
  scaleItem: 0,

  /**
   * @type {boolean}
   */
  shouldDisableScaleItem: <any>{
    get: function (): boolean {
      return this.rankingPolicyItem !== HierarchicalLayoutLayeringStrategy.FROM_SKETCH
    }
  },

  /** @type {number} */
  nodeMarginItem: 0,

  /**
   * @type {boolean}
   */
  shouldDisablenodeMarginItem: <any>{
    get: function (): boolean {
      return this.rankingPolicyItem !== HierarchicalLayoutLayeringStrategy.FROM_SKETCH
    }
  },

  /** @type {number} */
  minimumSizeItem: 0,

  /**
   * @type {boolean}
   */
  shouldDisableMinimumSizeItem: <any>{
    get: function (): boolean {
      return this.rankingPolicyItem !== HierarchicalLayoutLayeringStrategy.FROM_SKETCH
    }
  },

  /** @type {number} */
  maximumSizeItem: 0,

  /**
   * @type {boolean}
   */
  shouldDisableMaximumSizeItem: <any>{
    get: function (): boolean {
      return this.rankingPolicyItem !== HierarchicalLayoutLayeringStrategy.FROM_SKETCH
    }
  },

  /** @type {NodeLabelPlacement} */
  nodeLabelingItem: null,

  /** @type {EdgeLabelPlacement} */
  edgeLabelingItem: null,

  /** @type {boolean} */
  compactEdgeLabelPlacementItem: false,

  /** @type {boolean} */
  shouldDisableCompactEdgeLabelPlacementItem: <any>{
    get: function (): boolean {
      return this.edgeLabelingItem !== EdgeLabelPlacement.INTEGRATED
    }
  },

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

  /** @type {GroupLayeringPolicy} */
  groupLayeringPolicyItem: null,

  /**
   * @type {boolean}
   */
  shouldDisableGroupLayeringPolicyItem: <any>{
    get: function (): boolean {
      return this.useDrawingAsSketchItem
    }
  },

  /** @type {GroupAlignmentPolicy} */
  groupAlignmentItem: 0,

  /**
   * @type {boolean}
   */
  shouldDisableGroupAlignmentItem: <any>{
    get: function (): boolean {
      return this.groupLayeringPolicyItem === GroupLayeringPolicy.IGNORE_GROUPS
    }
  },

  /** @type {boolean} */
  groupHorizontalCompactionItem: true,

  /** @type {boolean} */
  treatRootGroupAsSwimlanesItem: false,

  /** @type {boolean} */
  useOrderFromSketchItem: false,

  /**
   * @type {boolean}
   */
  shouldDisableUseOrderFromSketchItem: <any>{
    get: function (): boolean {
      return !this.treatRootGroupAsSwimlanesItem
    }
  },

  /** @type {number} */
  swimlineSpacingItem: 0,

  /**
   * @type {boolean}
   */
  shouldDisableSwimlineSpacingItem: <any>{
    get: function (): boolean {
      return !this.treatRootGroupAsSwimlanesItem
    }
  },

  /** @type {boolean} */
  gridEnabledItem: false,

  /** @type {number} */
  gridSpacingItem: 0,

  /**
   * @type {boolean}
   */
  shouldDisableGridSpacingItem: <any>{
    get: function (): boolean {
      return !this.gridEnabledItem
    }
  },

  /** @type {HierarchicalLayoutPortAssignmentMode} */
  gridPortAssignmentItem: null,

  /**
   * @type {boolean}
   */
  shouldDisableGridPortAssignmentItem: <any>{
    get: function (): boolean {
      return !this.gridEnabledItem
    }
  }
})
