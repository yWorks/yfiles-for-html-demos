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
  CurveConnectionStyle,
  EdgePortCandidates,
  EdgeRouter,
  EdgeRouterBusDescriptor,
  EdgeRouterCosts,
  EdgeRouterData,
  EdgeRouterEdgeDescriptor,
  EdgeRouterEdgeLabelPlacement,
  EdgeRouterNodeLabelPlacement,
  EdgeRouterRoutingStyle,
  EdgeRouterScope,
  GraphComponent,
  ILayoutAlgorithm,
  LayoutData,
  List,
  MonotonicPathRestrictions,
  Point,
  PortSides,
  SequentialLayout,
  TimeSpan
} from '@yfiles/yfiles'
import LayoutConfiguration, {
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge,
  Scope
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
export var BusMembership
;(function (BusMembership) {
  BusMembership[(BusMembership['NONE'] = 0)] = 'NONE'
  BusMembership[(BusMembership['SINGLE'] = 1)] = 'SINGLE'
  BusMembership[(BusMembership['LABEL'] = 2)] = 'LABEL'
  BusMembership[(BusMembership['TAG'] = 3)] = 'TAG'
})(BusMembership || (BusMembership = {}))
export var PortSide
;(function (PortSide) {
  PortSide[(PortSide['ANY'] = 0)] = 'ANY'
  PortSide[(PortSide['LEFT_RIGHT'] = 1)] = 'LEFT_RIGHT'
  PortSide[(PortSide['TOP_BOTTOM'] = 2)] = 'TOP_BOTTOM'
})(PortSide || (PortSide = {}))
/**
 * Configuration options for the layout algorithm of the same name.
 */
export const PolylineEdgeRouterConfig = Class('PolylineEdgeRouterConfig', {
  $extends: LayoutConfiguration,
  _meta: {
    LayoutGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    DistancesGroup: [
      new LabelAttribute('Minimum Distances'),
      new OptionGroupAttribute('RootGroup', 30),
      new TypeAttribute(OptionGroup)
    ],
    GridGroup: [
      new LabelAttribute('Grid'),
      new OptionGroupAttribute('RootGroup', 40),
      new TypeAttribute(OptionGroup)
    ],
    PolylineGroup: [
      new LabelAttribute('Routing Style'),
      new OptionGroupAttribute('RootGroup', 20),
      new TypeAttribute(OptionGroup)
    ],
    LabelingGroup: [
      new LabelAttribute('Labeling'),
      new OptionGroupAttribute('RootGroup', 50),
      new TypeAttribute(OptionGroup)
    ],
    BusGroup: [
      new LabelAttribute('Bus Routing'),
      new OptionGroupAttribute('PolylineGroup', 80),
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
    scopeItem: [
      new LabelAttribute('Scope', '#/api/EdgeRouterData#EdgeRouterData-property-scope'),
      new OptionGroupAttribute('LayoutGroup', 10),
      new EnumValuesAttribute([
        ['All Edges', Scope.ROUTE_ALL_EDGES],
        ['Selected Edges', Scope.ROUTE_AFFECTED_EDGES],
        ['Edges at Selected Nodes', Scope.ROUTE_EDGES_AT_AFFECTED_NODES]
      ]),
      new TypeAttribute(Number)
    ],
    optimizationStrategyItem: [
      new LabelAttribute(
        'Optimization Strategy',
        '#/api/EdgeRouterEdgeDescriptor#EdgeRouterEdgeDescriptor-property-edgeRouterCosts'
      ),
      new OptionGroupAttribute('LayoutGroup', 20),
      new EnumValuesAttribute([
        ['Balanced', EdgeRouterCosts.BALANCED_OPTIMIZATION],
        ['Fewer Bends', EdgeRouterCosts.EDGE_BENDS_OPTIMIZATION],
        ['Fewer Crossings', EdgeRouterCosts.EDGE_CROSSINGS_OPTIMIZATION],
        ['Shorter Edges', EdgeRouterCosts.EDGE_LENGTHS_OPTIMIZATION],
        ['Low Quality', EdgeRouterCosts.LOW_QUALITY]
      ]),
      new TypeAttribute(EdgeRouterCosts)
    ],
    monotonicRestrictionItem: [
      new LabelAttribute(
        'Monotonic Restriction',
        '#/api/EdgeRouterEdgeDescriptor#EdgeLayoutDescriptor-property-monotonicPathRestriction'
      ),
      new OptionGroupAttribute('LayoutGroup', 30),
      new EnumValuesAttribute([
        ['None', MonotonicPathRestrictions.NONE],
        ['Horizontal', MonotonicPathRestrictions.HORIZONTAL],
        ['Vertical', MonotonicPathRestrictions.VERTICAL],
        ['Both', MonotonicPathRestrictions.BOTH]
      ]),
      new TypeAttribute(MonotonicPathRestrictions)
    ],
    enableReroutingItem: [
      new LabelAttribute(
        'Reroute Crossing Edges',
        '#/api/EdgeRouter#EdgeRouter-property-rerouting'
      ),
      new OptionGroupAttribute('LayoutGroup', 60),
      new TypeAttribute(Boolean)
    ],
    useIntermediatePointsItem: [
      new LabelAttribute(
        'Keep Bends as Intermediate Points',
        '#/api/EdgeRouterEdgeDescriptor#EdgeLayoutDescriptor-property-intermediateRoutingPoints'
      ),
      new OptionGroupAttribute('LayoutGroup', 65),
      new TypeAttribute(Boolean)
    ],
    stopDurationItem: [
      new LabelAttribute(
        'Stop Duration (sec)',
        '#/api/EdgeRouter#EdgeRouter-property-stopDuration'
      ),
      new OptionGroupAttribute('LayoutGroup', 70),
      new MinMaxAttribute(0, 150),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    routingPolicyItem: [
      new LabelAttribute('Routing Policy', '#/api/EdgeRouterData#EdgeRouterData-property-scope'),
      new OptionGroupAttribute('LayoutGroup', 80),
      new EnumValuesAttribute([
        ['Always', EdgeRouterScope.PATH],
        ['Path As Needed', EdgeRouterScope.PATH_AS_NEEDED],
        ['Segments As Needed', EdgeRouterScope.SEGMENTS_AS_NEEDED],
        ['Never', EdgeRouterScope.IGNORE]
      ]),
      new TypeAttribute(EdgeRouterScope)
    ],
    portSidesItem: [
      new LabelAttribute(
        'Allowed Port Sides',
        '#/api/EdgeRouterData#EdgeRouterData-property-ports'
      ),
      new OptionGroupAttribute('LayoutGroup', 90),
      new EnumValuesAttribute([
        ['Any', PortSide.ANY],
        ['Left or Right', PortSide.LEFT_RIGHT],
        ['Top or Bottom', PortSide.TOP_BOTTOM]
      ]),
      new TypeAttribute(PortSide)
    ],
    minimumEdgeDistanceItem: [
      new LabelAttribute(
        'Edge to Edge',
        '#/api/EdgeRouterEdgeDescriptor#EdgeRouterEdgeDescriptor-property-minimumEdgeDistance'
      ),
      new OptionGroupAttribute('DistancesGroup', 10),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumNodeToEdgeDistanceItem: [
      new LabelAttribute(
        'Node to Edge',
        '#/api/EdgeRouter#EdgeRouter-property-minimumNodeToEdgeDistance'
      ),
      new OptionGroupAttribute('DistancesGroup', 20),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumNodeCornerDistanceItem: [
      new LabelAttribute(
        'Port to Node Corner',
        '#/api/EdgeRouterEdgeDescriptor#EdgeRouterEdgeDescriptor-property-minimumNodeCornerDistance'
      ),
      new OptionGroupAttribute('DistancesGroup', 30),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumFirstSegmentLengthItem: [
      new LabelAttribute(
        'First Segment Length',
        '#/api/EdgeRouterEdgeDescriptor#EdgeRouterEdgeDescriptor-property-minimumFirstSegmentLength'
      ),
      new OptionGroupAttribute('DistancesGroup', 40),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumLastSegmentLengthItem: [
      new LabelAttribute(
        'Last Segment Length',
        '#/api/EdgeRouterEdgeDescriptor#EdgeLayoutDescriptor-property-minimumLastSegmentLength'
      ),
      new OptionGroupAttribute('DistancesGroup', 50),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    gridEnabledItem: [
      new LabelAttribute('Route on Grid', '#/api/EdgeRouter#EdgeRouter-property-gridSpacing'),
      new OptionGroupAttribute('GridGroup', 10),
      new TypeAttribute(Boolean)
    ],
    gridSpacingItem: [
      new LabelAttribute('Grid Spacing', '#/api/Grid#Grid-property-gridSpacing'),
      new OptionGroupAttribute('GridGroup', 20),
      new MinMaxAttribute(2, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    routingStyleItem: [
      new LabelAttribute(
        'Routing Style',
        '#/api/EdgeRouterEdgeDescriptor#EdgeLayoutDescriptor-property-routingStyle'
      ),
      new OptionGroupAttribute('PolylineGroup', 10),
      new EnumValuesAttribute([
        ['Orthogonal', EdgeRouterRoutingStyle.ORTHOGONAL],
        ['Octilinear', EdgeRouterRoutingStyle.OCTILINEAR],
        ['Curved', EdgeRouterRoutingStyle.CURVED]
      ]),
      new TypeAttribute(EdgeRouterRoutingStyle)
    ],
    preferredOctilinearSegmentLengthItem: [
      new LabelAttribute(
        'Preferred Octilinear Segment Length',
        '#/api/EdgeRouterEdgeDescriptor#EdgeRouterEdgeDescriptor-property-preferredOctilinearSegmentLength'
      ),
      new OptionGroupAttribute('PolylineGroup', 20),
      new MinMaxAttribute(5, 500),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    maximumOctilinearSegmentRatioItem: [
      new LabelAttribute(
        'Maximum Octilinear Segment Ratio',
        '#/api/EdgeRouterEdgeDescriptor#EdgeRouterEdgeDescriptor-property-maximumOctilinearSegmentRatio'
      ),
      new OptionGroupAttribute('PolylineGroup', 30),
      new MinMaxAttribute(0, 0.5, 0.01),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    sourceCurveConnectionStyleItem: [
      new LabelAttribute(
        'Curve Connection at Source',
        '#/api/EdgeRouterEdgeDescriptor#EdgeRouterEdgeDescriptor-property-sourceCurveConnectionStyle'
      ),
      new OptionGroupAttribute('PolylineGroup', 40),
      new EnumValuesAttribute([
        ['Straight', CurveConnectionStyle.KEEP_PORT],
        ['Organic', CurveConnectionStyle.ORGANIC]
      ]),
      new TypeAttribute(CurveConnectionStyle)
    ],
    targetCurveConnectionStyleItem: [
      new LabelAttribute(
        'Curve Connection at Target',
        '#/api/EdgeRouterEdgeDescriptor#EdgeRouterEdgeDescriptor-property-targetCurveConnectionStyle'
      ),
      new OptionGroupAttribute('PolylineGroup', 50),
      new EnumValuesAttribute([
        ['Straight', CurveConnectionStyle.KEEP_PORT],
        ['Organic', CurveConnectionStyle.ORGANIC]
      ]),
      new TypeAttribute(CurveConnectionStyle)
    ],
    curveUTurnSymmetryItem: [
      new LabelAttribute(
        'U-turn Symmetry',
        '#/api/EdgeRouterEdgeDescriptor#EdgeRouterEdgeDescriptor-property-curveUTurnSymmetry'
      ),
      new OptionGroupAttribute('PolylineGroup', 60),
      new MinMaxAttribute(0, 1, 0.1),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    curveShortcutsItem: [
      new LabelAttribute(
        'Allow Shortcuts',
        '#/api/EdgeRouterEdgeDescriptor#EdgeRouterEdgeDescriptor-property-curveShortcuts'
      ),
      new OptionGroupAttribute('PolylineGroup', 70),
      new TypeAttribute(Boolean)
    ],
    busMembershipItem: [
      new LabelAttribute('Membership', '#/api/EdgeRouterData#EdgeRouterData-property-buses'),
      new OptionGroupAttribute('BusGroup', 10),
      new EnumValuesAttribute([
        ['No Buses', BusMembership.NONE],
        ['Single Bus', BusMembership.SINGLE],
        ['By First Label', BusMembership.LABEL],
        ['By User Tag', BusMembership.TAG]
      ]),
      new TypeAttribute(BusMembership)
    ],
    automaticEdgeGroupingItem: [
      new LabelAttribute(
        'Automatic Edge Grouping',
        '#/api/EdgeRouterBusDescriptor#EdgeRouterBusDescriptor-property-automaticEdgeGrouping'
      ),
      new OptionGroupAttribute('BusGroup', 20),
      new TypeAttribute(Boolean)
    ],
    minimumBackboneSegmentLengthItem: [
      new LabelAttribute(
        'Minimum Backbone Segment Length',
        '#/api/EdgeRouterBusDescriptor#EdgeRouterBusDescriptor-property-minimumBackboneSegmentLength'
      ),
      new OptionGroupAttribute('BusGroup', 30),
      new MinMaxAttribute(1, 1000),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    allowMultipleBackboneSegmentsItem: [
      new LabelAttribute(
        'Multiple Backbone Segments',
        '#/api/EdgeRouterBusDescriptor#EdgeRouterBusDescriptor-property-multipleBackboneSegments'
      ),
      new OptionGroupAttribute('BusGroup', 40),
      new TypeAttribute(Boolean)
    ],
    nodeLabelingItem: [
      new LabelAttribute(
        'Node Labeling',
        '#/api/EdgeRouter#EdgeRouter-property-nodeLabelPlacement'
      ),
      new OptionGroupAttribute('NodePropertiesGroup', 10),
      new EnumValuesAttribute([
        ['Consider', EdgeRouterNodeLabelPlacement.CONSIDER],
        ['Generic', EdgeRouterNodeLabelPlacement.GENERIC],
        ['Ignore', EdgeRouterNodeLabelPlacement.IGNORE],
        ['Ignore Group Labels', EdgeRouterNodeLabelPlacement.IGNORE_GROUP_LABELS]
      ]),
      new TypeAttribute(EdgeRouterNodeLabelPlacement)
    ],
    edgeLabelingItem: [
      new LabelAttribute(
        'Edge Labeling',
        '#/api/EdgeRouter#EdgeRouter-property-edgeLabelPlacement'
      ),
      new OptionGroupAttribute('EdgePropertiesGroup', 20),
      new EnumValuesAttribute([
        ['Ignore', EdgeRouterEdgeLabelPlacement.IGNORE],
        ['Integrated', EdgeRouterEdgeLabelPlacement.INTEGRATED],
        ['Generic', EdgeRouterEdgeLabelPlacement.GENERIC],
        ['Consider Fixed Edge Labels', EdgeRouterEdgeLabelPlacement.CONSIDER_UNAFFECTED_EDGE_LABELS]
      ]),
      new TypeAttribute(EdgeRouterEdgeLabelPlacement)
    ],
    reduceAmbiguityItem: [
      new LabelAttribute(
        'Reduce Ambiguity',
        '#/api/LabelingCosts#LabelingCosts-property-ambiguousPlacementCost'
      ),
      new OptionGroupAttribute('EdgePropertiesGroup', 30),
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
    const router = new EdgeRouter()
    this.scopeItem = Scope.ROUTE_ALL_EDGES
    this.optimizationStrategyItem = EdgeRouterCosts.BALANCED_OPTIMIZATION
    this.monotonicRestrictionItem = MonotonicPathRestrictions.NONE
    this.enableReroutingItem = router.rerouting
    this.stopDurationItem = 30
    const descriptor = router.defaultEdgeDescriptor
    this.minimumEdgeDistanceItem = descriptor.minimumEdgeDistance
    this.minimumNodeToEdgeDistanceItem = router.minimumNodeToEdgeDistance
    this.minimumNodeCornerDistanceItem = descriptor.minimumNodeCornerDistance
    this.minimumFirstSegmentLengthItem = descriptor.minimumFirstSegmentLength
    this.minimumLastSegmentLengthItem = descriptor.minimumLastSegmentLength
    this.routingPolicyItem = EdgeRouterScope.PATH
    this.useIntermediatePointsItem = false
    const gridSpacing = router.gridSpacing
    this.gridEnabledItem = gridSpacing > 0
    this.gridSpacingItem = gridSpacing !== null ? gridSpacing : 10
    this.routingStyleItem = EdgeRouterRoutingStyle.ORTHOGONAL
    this.preferredOctilinearSegmentLengthItem = descriptor.preferredOctilinearSegmentLength
    this.maximumOctilinearSegmentRatioItem = descriptor.maximumOctilinearSegmentRatio
    this.sourceCurveConnectionStyleItem = descriptor.sourceCurveConnectionStyle
    this.targetCurveConnectionStyleItem = descriptor.targetCurveConnectionStyle
    this.curveUTurnSymmetryItem = descriptor.curveUTurnSymmetry
    this.curveShortcutsItem = descriptor.curveShortcuts
    this.portSidesItem = PortSide.ANY
    this.busMembershipItem = BusMembership.NONE
    this.nodeLabelingItem = router.nodeLabelPlacement
    this.edgeLabelingItem = router.edgeLabelPlacement
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10
    this.title = 'Edge Router'
  },
  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout.
   */
  createConfiguredLayout: function (graphComponent) {
    const router = new EdgeRouter()
    router.minimumNodeToEdgeDistance = this.minimumNodeToEdgeDistanceItem
    if (this.gridEnabledItem) {
      router.gridSpacing = this.gridSpacingItem
    } else {
      router.gridSpacing = 0
    }
    router.nodeLabelPlacement = this.nodeLabelingItem
    router.rerouting = this.enableReroutingItem
    router.stopDuration = TimeSpan.fromSeconds(parseFloat(this.stopDurationItem))
    // Note that CreateConfiguredLayoutData replaces the settings on the DefaultEdgeLayoutDescriptor
    // by providing a custom one for each edge.
    router.defaultEdgeDescriptor.routingStyle = this.routingStyleItem
    router.defaultEdgeDescriptor.preferredOctilinearSegmentLength =
      this.preferredOctilinearSegmentLengthItem
    router.defaultEdgeDescriptor.maximumOctilinearSegmentRatio =
      this.maximumOctilinearSegmentRatioItem
    router.defaultEdgeDescriptor.sourceCurveConnectionStyle = this.sourceCurveConnectionStyleItem
    router.defaultEdgeDescriptor.targetCurveConnectionStyle = this.targetCurveConnectionStyleItem
    if (this.optimizationStrategyItem == EdgeRouterCosts.LOW_QUALITY) {
      router.stopDuration = TimeSpan.ZERO
    } else {
      router.stopDuration = TimeSpan.fromSeconds(this.stopDurationItem)
    }
    const layout = new SequentialLayout(router)
    router.edgeLabelPlacement = this.edgeLabelingItem
    if (this.edgeLabelingItem == EdgeRouterEdgeLabelPlacement.GENERIC && this.reduceAmbiguityItem) {
      router.genericLabeling.defaultEdgeLabelingCosts.ambiguousPlacementCost = 1.0
    }
    return layout
  },
  /**
   * Called by {@link LayoutConfiguration.apply} to create the layout data of the configuration.
   * This method is typically overridden to provide mappers for the different layouts.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData = new EdgeRouterData({
      edgeDescriptors: (edge) => {
        const descriptor = new EdgeRouterEdgeDescriptor({
          minimumEdgeDistance: this.minimumEdgeDistanceItem,
          minimumNodeCornerDistance: this.minimumNodeCornerDistanceItem,
          minimumFirstSegmentLength: this.minimumFirstSegmentLengthItem,
          minimumLastSegmentLength: this.minimumLastSegmentLengthItem,
          preferredOctilinearSegmentLength: this.preferredOctilinearSegmentLengthItem,
          maximumOctilinearSegmentRatio: this.maximumOctilinearSegmentRatioItem,
          sourceCurveConnectionStyle: this.sourceCurveConnectionStyleItem,
          targetCurveConnectionStyle: this.targetCurveConnectionStyleItem,
          curveUTurnSymmetry: this.curveUTurnSymmetryItem,
          curveShortcuts: this.curveShortcutsItem,
          routingStyle: this.routingStyleItem,
          edgeRouterCosts: this.optimizationStrategyItem,
          monotonicPathRestriction: this.monotonicRestrictionItem
        })
        if (this.useIntermediatePointsItem) {
          const intermediateRoutingPoints = new List()
          edge.bends.forEach((bend) =>
            intermediateRoutingPoints.add(new Point(bend.location.x, bend.location.y))
          )
          descriptor.intermediateRoutingPoints = intermediateRoutingPoints
        }
        return descriptor
      }
    })
    const selection = graphComponent.selection
    if (this.scopeItem === Scope.ROUTE_EDGES_AT_AFFECTED_NODES) {
      layoutData.scope.incidentNodeMapping = (node) =>
        selection.includes(node) ? this.routingPolicyItem : EdgeRouterScope.IGNORE
    } else if (this.scopeItem === Scope.ROUTE_AFFECTED_EDGES) {
      layoutData.scope.edgeMapping = (edge) =>
        selection.includes(edge) ? this.routingPolicyItem : EdgeRouterScope.IGNORE
    } else {
      layoutData.scope.edgeMapping = this.routingPolicyItem
    }
    if (this.portSidesItem !== PortSide.ANY) {
      let candidates
      if (this.portSidesItem === PortSide.LEFT_RIGHT) {
        candidates = new EdgePortCandidates()
          .addFreeCandidate(PortSides.RIGHT)
          .addFreeCandidate(PortSides.LEFT)
      } else {
        candidates = new EdgePortCandidates()
          .addFreeCandidate(PortSides.TOP)
          .addFreeCandidate(PortSides.BOTTOM)
      }
      layoutData.ports.sourcePortCandidates = candidates
      layoutData.ports.targetPortCandidates = candidates
    }
    switch (this.busMembershipItem) {
      case BusMembership.SINGLE: {
        const busDescriptor = this.createBusDescriptor()
        layoutData.buses.add(busDescriptor).source = graphComponent.graph.edges
        break
      }
      case BusMembership.LABEL: {
        const visitedLabels = new Set()
        graphComponent.graph.edgeLabels.forEach((label) => {
          if (!visitedLabels.has(label.text)) {
            visitedLabels.add(label.text)
            const busDescriptor = this.createBusDescriptor()
            layoutData.buses.add(busDescriptor).predicate = (edge) =>
              edge.labels.size > 0 && edge.labels.first().text === label.text
          }
        })
        break
      }
      case BusMembership.TAG: {
        const visitedTags = new Set()
        graphComponent.graph.edges.forEach((edge) => {
          const tag = edge.tag
          if (!tag) {
            const busDescriptor = this.createBusDescriptor()
            layoutData.buses.add(busDescriptor).item = edge
          } else if (!visitedTags.has(tag)) {
            visitedTags.add(tag)
            const busDescriptor = this.createBusDescriptor()
            layoutData.buses.add(busDescriptor).predicate = (edge) => edge.tag === tag
          }
        })
        break
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
  createBusDescriptor: function () {
    return new EdgeRouterBusDescriptor({
      automaticEdgeGrouping: this.automaticEdgeGroupingItem,
      minimumBackboneSegmentLength: this.minimumBackboneSegmentLengthItem,
      multipleBackboneSegments: this.allowMultipleBackboneSegmentsItem
    })
  },
  /**
   * Enables automatic bus routing.
   */
  enableCurvedRouting: function () {
    this.routingStyleItem = EdgeRouterRoutingStyle.CURVED
  },
  /** @type {OptionGroup} */
  LayoutGroup: null,
  /** @type {OptionGroup} */
  DistancesGroup: null,
  /** @type {OptionGroup} */
  GridGroup: null,
  /** @type {OptionGroup} */
  PolylineGroup: null,
  /** @type {OptionGroup} */
  LabelingGroup: null,
  /** @type {OptionGroup} */
  BusGroup: null,
  /** @type {OptionGroup} */
  NodePropertiesGroup: null,
  /** @type {OptionGroup} */
  EdgePropertiesGroup: null,
  /** @type {OptionGroup} */
  PreferredPlacementGroup: null,
  /** @type {string} */
  descriptionText: {
    get: function () {
      return "<p style='margin-top:0'>Edge routing calculates orthogonal, octilinear or curved edge paths for a diagram's edges. The positions of the nodes are not changed by this algorithm.</p><p>By default, edges will be routed orthogonally, that is, each edge path consists of horizontal and vertical segments. The Octilinear style inserts additional sloped segments between horizontal and vertical segments, and the Curved style replaces those segments with smooth curves.</p><p>This type of edge routing is especially well suited for technical diagrams.</p>"
    }
  },
  /** @type {Scope} */
  scopeItem: null,
  /** @type {EdgeRouterCosts} */
  optimizationStrategyItem: null,
  /** @type {MonotonicPathRestrictions} */
  monotonicRestrictionItem: null,
  /** @type {boolean} */
  enableReroutingItem: false,
  /** @type {boolean} */
  useIntermediatePointsItem: false,
  /** @type {boolean} */
  shouldDisableUseIntermediatePointsItem: {
    get: function () {
      return this.busMembershipItem !== BusMembership.NONE
    }
  },
  /** @type {number} */
  stopDurationItem: 5,
  /** @type {number} */
  routingPolicyItem: EdgeRouterScope.PATH,
  /** @type {PortSides} */
  portSidesItem: false,
  /** @type {number} */
  minimumEdgeDistanceItem: 0,
  /** @type {number} */
  minimumNodeToEdgeDistanceItem: 0,
  /** @type {number} */
  minimumNodeCornerDistanceItem: 0,
  /** @type {number} */
  minimumFirstSegmentLengthItem: 0,
  /** @type {number} */
  minimumLastSegmentLengthItem: 0,
  /** @type {boolean} */
  gridEnabledItem: false,
  /** @type {number} */
  gridSpacingItem: 2,
  /** @type {boolean} */
  shouldDisableGridSpacingItem: {
    get: function () {
      return this.gridEnabledItem === false
    }
  },
  /** @type {EdgeRouterRoutingStyle} */
  routingStyleItem: null,
  /** @type {number} */
  preferredOctilinearSegmentLengthItem: 5,
  /** @type {boolean} */
  shouldDisablePreferredOctilinearSegmentLengthItem: {
    get: function () {
      return this.routingStyleItem !== EdgeRouterRoutingStyle.OCTILINEAR
    }
  },
  /** @type {number} */
  maximumOctilinearSegmentRatioItem: 0.3,
  /** @type {boolean} */
  shouldDisableMaximumOctilinearSegmentRatioItem: {
    get: function () {
      return this.routingStyleItem !== EdgeRouterRoutingStyle.OCTILINEAR
    }
  },
  /** @type {CurveConnectionStyle} */
  sourceCurveConnectionStyleItem: null,
  /** @type {boolean} */
  shouldDisableSourceCurveConnectionStyleItem: {
    get: function () {
      return this.routingStyleItem !== EdgeRouterRoutingStyle.CURVED
    }
  },
  /** @type {CurveConnectionStyle} */
  targetCurveConnectionStyleItem: null,
  /** @type {boolean} */
  shouldDisableTargetCurveConnectionStyleItem: {
    get: function () {
      return this.routingStyleItem !== EdgeRouterRoutingStyle.CURVED
    }
  },
  /** @type {number} */
  curveUTurnSymmetryItem: 0,
  /** @type {boolean} */
  shouldDisableCurveUTurnSymmetryItem: {
    get: function () {
      return this.routingStyleItem !== EdgeRouterRoutingStyle.CURVED
    }
  },
  /** @type {number} */
  curveShortcutsItem: 0,
  /** @type {boolean} */
  shouldDisableCurveShortcutsItem: {
    get: function () {
      return this.routingStyleItem !== EdgeRouterRoutingStyle.CURVED
    }
  },
  /** @type {BusMembership} */
  busMembershipItem: null,
  /** @type {boolean} */
  automaticEdgeGroupingItem: true,
  /** @type {boolean} */
  shouldDisableAutomaticEdgeGroupingItem: {
    get: function () {
      return this.busMembershipItem === BusMembership.NONE
    }
  },
  /** @type {number} */
  minimumBackboneSegmentLengthItem: 100,
  /** @type {boolean} */
  shouldDisableMinimumBackboneSegmentLengthItem: {
    get: function () {
      return this.busMembershipItem === BusMembership.NONE
    }
  },
  /** @type {boolean} */
  allowMultipleBackboneSegmentsItem: true,
  /** @type {boolean} */
  shouldDisableAllowMultipleBackboneSegmentsItem: {
    get: function () {
      return this.busMembershipItem === BusMembership.NONE
    }
  },
  /** @type {EdgeRouterNodeLabelPlacement} */
  nodeLabelingItem: null,
  /** @type {EdgeRouterEdgeLabelPlacement} */
  edgeLabelingItem: null,
  /** @type {boolean} */
  reduceAmbiguityItem: false,
  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: {
    get: function () {
      return this.edgeLabelingItem !== EdgeRouterEdgeLabelPlacement.GENERIC
    }
  },
  /** @type {LabelPlacementOrientation} */
  labelPlacementOrientationItem: null,
  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: {
    get: function () {
      return this.edgeLabelingItem === EdgeRouterEdgeLabelPlacement.IGNORE
    }
  },
  /** @type {LabelPlacementAlongEdge} */
  labelPlacementAlongEdgeItem: null,
  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: {
    get: function () {
      return this.edgeLabelingItem === EdgeRouterEdgeLabelPlacement.IGNORE
    }
  },
  /** @type {LabelPlacementSideOfEdge} */
  labelPlacementSideOfEdgeItem: null,
  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: {
    get: function () {
      return this.edgeLabelingItem === EdgeRouterEdgeLabelPlacement.IGNORE
    }
  },
  /** @type {number} */
  labelPlacementDistanceItem: 0,
  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: {
    get: function () {
      return (
        this.edgeLabelingItem === EdgeRouterEdgeLabelPlacement.IGNORE ||
        this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
      )
    }
  }
})
