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
  Class,
  CurveConnectionStyle,
  EdgeRouter,
  EdgeRouterBusDescriptor,
  EdgeRouterData,
  EdgeRouterEdgeLayoutDescriptor,
  EdgeRouterEdgeRoutingStyle,
  EdgeRouterScope,
  Enum,
  GenericLabeling,
  GraphComponent,
  Grid,
  ILayoutAlgorithm,
  LayoutData,
  List,
  MonotonicPathRestriction,
  PenaltySettings,
  PortCandidate,
  PortDirections,
  RoutingPolicy,
  SequentialLayout,
  YBoolean,
  YNumber,
  YPoint,
  YString
} from 'yfiles'

import LayoutConfiguration, {
  EdgeLabeling,
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge
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
} from 'demo-resources/demo-option-editor'

/**
 * Configuration options for the layout algorithm of the same name.
 */
const PolylineEdgeRouterConfig = Class('PolylineEdgeRouterConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('PolylineEdgeRouter')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    LayoutConfiguration.call(this)
    const router = new EdgeRouter()

    this.scopeItem = router.scope
    this.optimizationStrategyItem = Strategies.BALANCED
    this.monotonicRestrictionItem = MonotonyFlags.NONE
    this.enableReroutingItem = router.rerouting
    this.maximumDurationItem = 30

    const descriptor = router.defaultEdgeLayoutDescriptor
    this.minimumEdgeToEdgeDistanceItem = descriptor.minimumEdgeToEdgeDistance
    this.minimumNodeToEdgeDistanceItem = router.minimumNodeToEdgeDistance
    this.minimumNodeCornerDistanceItem = descriptor.minimumNodeCornerDistance
    this.minimumFirstSegmentLengthItem = descriptor.minimumFirstSegmentLength
    this.minimumLastSegmentLengthItem = descriptor.minimumLastSegmentLength
    this.routingPolicyItem = descriptor.routingPolicy

    this.useIntermediatePointsItem = false

    const grid = router.grid
    this.gridEnabledItem = grid !== null
    this.gridSpacingItem = grid !== null ? grid.spacing : 10

    this.routingStyleItem = EdgeRouterEdgeRoutingStyle.ORTHOGONAL
    this.preferredPolylineSegmentLengthItem = descriptor.preferredOctilinearSegmentLength
    this.preferredPolylineSegmentRatioItem = descriptor.maximumOctilinearSegmentRatio
    this.curveAtSourceItem = descriptor.sourceCurveConnectionStyle
    this.curveAtTargetItem = descriptor.targetCurveConnectionStyle
    this.curveUTurnSymmetryItem = descriptor.curveUTurnSymmetry
    this.curveShortcutsItem = descriptor.curveShortcuts
    this.portSidesItem = PortSides.ANY

    this.busMembershipItem = BusMembership.NONE

    this.considerNodeLabelsItem = router.considerNodeLabels
    this.considerEdgeLabelsItem = router.considerEdgeLabels
    this.edgeLabelingItem = EdgeLabeling.NONE
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10
    this.title = 'Edge Router'
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph.mapperRegistry} if necessary.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout.
   */
  createConfiguredLayout: function (graphComponent) {
    const router = new EdgeRouter()

    router.scope = this.scopeItem

    router.minimumNodeToEdgeDistance = this.minimumNodeToEdgeDistanceItem

    if (this.gridEnabledItem) {
      router.grid = new Grid(0, 0, this.gridSpacingItem)
    } else {
      router.grid = null
    }

    router.considerNodeLabels = this.considerNodeLabelsItem
    router.considerEdgeLabels = this.considerEdgeLabelsItem
    router.rerouting = this.enableReroutingItem

    router.maximumDuration = this.maximumDurationItem * 1000

    const layout = new SequentialLayout()
    layout.appendLayout(router)

    if (this.edgeLabelingItem === EdgeLabeling.INTEGRATED) {
      router.integratedEdgeLabeling = true
    } else if (this.edgeLabelingItem === EdgeLabeling.GENERIC) {
      const genericLabeling = new GenericLabeling()
      genericLabeling.placeEdgeLabels = true
      genericLabeling.placeNodeLabels = false
      genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
      layout.appendLayout(genericLabeling)
    }

    return layout
  },

  /**
   * Called by {@link LayoutConfiguration.apply} to create the layout data of the configuration.
   * This method is typically overridden to provide mappers for the different layouts.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData = new EdgeRouterData({
      edgeLayoutDescriptors: (edge) => {
        const descriptor = new EdgeRouterEdgeLayoutDescriptor({
          minimumEdgeToEdgeDistance: this.minimumEdgeToEdgeDistanceItem,
          minimumNodeCornerDistance: this.minimumNodeCornerDistanceItem,
          minimumFirstSegmentLength: this.minimumFirstSegmentLengthItem,
          minimumLastSegmentLength: this.minimumLastSegmentLengthItem,
          preferredOctilinearSegmentLength: this.$preferredPolylineSegmentLengthItem,
          maximumOctilinearSegmentRatio: this.$preferredPolylineSegmentRatioItem,
          sourceCurveConnectionStyle: this.curveAtSourceItem,
          targetCurveConnectionStyle: this.curveAtTargetItem,
          curveUTurnSymmetry: this.curveUTurnSymmetryItem,
          curveShortcuts: this.curveShortcutsItem,
          routingStyle: this.routingStyleItem,
          routingPolicy: this.routingPolicyItem
        })

        if (this.optimizationStrategyItem === Strategies.BALANCED) {
          descriptor.penaltySettings = PenaltySettings.OPTIMIZATION_BALANCED
        } else if (this.optimizationStrategyItem === Strategies.MINIMIZE_BENDS) {
          descriptor.penaltySettings = PenaltySettings.OPTIMIZATION_EDGE_BENDS
        } else if (this.optimizationStrategyItem === Strategies.MINIMIZE_EDGE_LENGTH) {
          descriptor.penaltySettings = PenaltySettings.OPTIMIZATION_EDGE_LENGTHS
        } else {
          descriptor.penaltySettings = PenaltySettings.OPTIMIZATION_EDGE_CROSSINGS
        }

        if (this.monotonicRestrictionItem === MonotonyFlags.HORIZONTAL) {
          descriptor.monotonicPathRestriction = MonotonicPathRestriction.HORIZONTAL
        } else if (this.monotonicRestrictionItem === MonotonyFlags.VERTICAL) {
          descriptor.monotonicPathRestriction = MonotonicPathRestriction.VERTICAL
        } else if (this.monotonicRestrictionItem === MonotonyFlags.BOTH) {
          descriptor.monotonicPathRestriction = MonotonicPathRestriction.BOTH
        } else {
          descriptor.monotonicPathRestriction = MonotonicPathRestriction.NONE
        }

        if (this.useIntermediatePointsItem) {
          const intermediateRoutingPoints = new List()
          edge.bends.forEach((bend) =>
            intermediateRoutingPoints.add(new YPoint(bend.location.x, bend.location.y))
          )
          descriptor.intermediateRoutingPoints = intermediateRoutingPoints
        }

        return descriptor
      }
    })

    const selection = graphComponent.selection
    if (this.scopeItem === EdgeRouterScope.ROUTE_EDGES_AT_AFFECTED_NODES) {
      layoutData.affectedNodes.delegate = (node) => selection.isSelected(node)
    } else if (this.scopeItem === EdgeRouterScope.ROUTE_AFFECTED_EDGES) {
      layoutData.affectedEdges.delegate = (edge) => selection.isSelected(edge)
    } else {
      layoutData.affectedEdges.delegate = (edge) => true
      layoutData.affectedNodes.delegate = (edge) => true
    }

    if (this.portSidesItem !== PortSides.ANY) {
      let candidates
      if (this.portSidesItem === PortSides.LEFT_RIGHT) {
        candidates = new List([
          PortCandidate.createCandidate(PortDirections.EAST),
          PortCandidate.createCandidate(PortDirections.WEST)
        ])
      } else {
        candidates = new List([
          PortCandidate.createCandidate(PortDirections.NORTH),
          PortCandidate.createCandidate(PortDirections.SOUTH)
        ])
      }
      layoutData.sourcePortCandidates.constant = candidates
      layoutData.targetPortCandidates.constant = candidates
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
            layoutData.buses.add(busDescriptor).delegate = (edge) =>
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
            layoutData.buses.add(busDescriptor).delegate = (edge) => edge.tag === tag
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
  enableBusRouting: function () {
    this.busMembershipItem = BusMembership.TAG
  },

  /**
   * Enables automatic bus routing.
   */
  enableCurvedRouting: function () {
    this.routingStyleItem = EdgeRouterEdgeRoutingStyle.CURVED
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
  DistancesGroup: {
    $meta: function () {
      return [
        LabelAttribute('Minimum Distances'),
        OptionGroupAttribute('RootGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  GridGroup: {
    $meta: function () {
      return [
        LabelAttribute('Grid'),
        OptionGroupAttribute('RootGroup', 40),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  PolylineGroup: {
    $meta: function () {
      return [
        LabelAttribute('Routing Style'),
        OptionGroupAttribute('RootGroup', 20),
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
        OptionGroupAttribute('RootGroup', 50),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  BusGroup: {
    $meta: function () {
      return [
        LabelAttribute('Bus Routing'),
        OptionGroupAttribute('PolylineGroup', 80),
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
      return "<p style='margin-top:0'>Polyline edge routing calculates polyline edge paths for a diagram's edges. The positions of the nodes are not changed by this algorithm.</p><p>Edges will be routed orthogonally, that is each edge path consists of horizontal and vertical segments, or octilinear. Octilinear means that the slope of each segment of an edge path is a multiple of 45 degrees.</p><p>This type of edge routing is especially well suited for technical diagrams.</p>"
    }
  },

  /** @type {EdgeRouterScope} */
  scopeItem: {
    $meta: function () {
      return [
        LabelAttribute('Scope', '#/api/EdgeRouter#EdgeRouter-property-scope'),
        OptionGroupAttribute('LayoutGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['All Edges', EdgeRouterScope.ROUTE_ALL_EDGES],
            ['Selected Edges', EdgeRouterScope.ROUTE_AFFECTED_EDGES],
            ['Edges at Selected Nodes', EdgeRouterScope.ROUTE_EDGES_AT_AFFECTED_NODES]
          ]
        }),
        TypeAttribute(EdgeRouterScope.$class)
      ]
    },
    value: null
  },

  /** @type {Strategies} */
  optimizationStrategyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Optimization Strategy',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-penaltySettings'
        ),
        OptionGroupAttribute('LayoutGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Balanced', Strategies.BALANCED],
            ['Fewer Bends', Strategies.MINIMIZE_BENDS],
            ['Fewer Crossings', Strategies.MINIMIZE_CROSSINGS],
            ['Shorter Edges', Strategies.MINIMIZE_EDGE_LENGTH]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {MonotonyFlags} */
  monotonicRestrictionItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Monotonic Restriction',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-monotonicPathRestriction'
        ),
        OptionGroupAttribute('LayoutGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['None', MonotonyFlags.NONE],
            ['Horizontal', MonotonyFlags.HORIZONTAL],
            ['Vertical', MonotonyFlags.VERTICAL],
            ['Both', MonotonyFlags.BOTH]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  enableReroutingItem: {
    $meta: function () {
      return [
        LabelAttribute('Reroute Crossing Edges', '#/api/EdgeRouter#EdgeRouter-property-rerouting'),
        OptionGroupAttribute('LayoutGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  useIntermediatePointsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Keep Bends as Intermediate Points',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-intermediateRoutingPoints'
        ),
        OptionGroupAttribute('LayoutGroup', 65),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableUseIntermediatePointsItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.busMembershipItem !== BusMembership.NONE
    }
  },

  /** @type {number} */
  maximumDurationItem: {
    $meta: function () {
      return [
        LabelAttribute('Maximum Duration', '#/api/EdgeRouter#EdgeRouter-property-maximumDuration'),
        OptionGroupAttribute('LayoutGroup', 70),
        MinMaxAttribute().init({
          min: 0,
          max: 150
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {number} */
  routingPolicyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Routing Policy',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-routingPolicy'
        ),
        OptionGroupAttribute('LayoutGroup', 80),
        EnumValuesAttribute().init({
          values: [
            ['Always', RoutingPolicy.ALWAYS],
            ['Path As Needed', RoutingPolicy.PATH_AS_NEEDED],
            ['Segments As Needed', RoutingPolicy.SEGMENTS_AS_NEEDED]
          ]
        }),
        TypeAttribute(RoutingPolicy.$class)
      ]
    },
    value: RoutingPolicy.ALWAYS
  },

  /** @type {PortSides} */
  portSidesItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Allowed port sides',
          '#/api/EdgeRouterData#EdgeRouterData-property-sourcePortCandidates'
        ),
        OptionGroupAttribute('LayoutGroup', 90),
        EnumValuesAttribute().init({
          values: [
            ['Any', PortSides.ANY],
            ['Left or Right', PortSides.LEFT_RIGHT],
            ['Top or Bottom', PortSides.TOP_BOTTOM]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  minimumEdgeToEdgeDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge to Edge',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumEdgeToEdgeDistance'
        ),
        OptionGroupAttribute('DistancesGroup', 10),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {number} */
  minimumNodeToEdgeDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Node to Edge',
          '#/api/EdgeRouter#EdgeRouter-property-minimumNodeToEdgeDistance'
        ),
        OptionGroupAttribute('DistancesGroup', 20),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {number} */
  minimumNodeCornerDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Port to Node Corner',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumNodeCornerDistance'
        ),
        OptionGroupAttribute('DistancesGroup', 30),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {number} */
  minimumFirstSegmentLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'First Segment Length',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumFirstSegmentLength'
        ),
        OptionGroupAttribute('DistancesGroup', 40),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {number} */
  minimumLastSegmentLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Last Segment Length',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLastSegmentLength'
        ),
        OptionGroupAttribute('DistancesGroup', 50),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  gridEnabledItem: {
    $meta: function () {
      return [
        LabelAttribute('Route on Grid', '#/api/EdgeRouter#EdgeRouter-property-grid'),
        OptionGroupAttribute('GridGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  gridSpacingItem: {
    $meta: function () {
      return [
        LabelAttribute('Grid Spacing', '#/api/Grid#Grid-property-spacing'),
        OptionGroupAttribute('GridGroup', 20),
        MinMaxAttribute().init({
          min: 2,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 2
  },

  /** @type {boolean} */
  shouldDisableGridSpacingItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.gridEnabledItem === false
    }
  },

  /** @type {EdgeRouterEdgeRoutingStyle} */
  routingStyleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'RoutingStyle',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-routingStyle'
        ),
        OptionGroupAttribute('PolylineGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Orthogonal', EdgeRouterEdgeRoutingStyle.ORTHOGONAL],
            ['Octilinear', EdgeRouterEdgeRoutingStyle.OCTILINEAR],
            ['Curved', EdgeRouterEdgeRoutingStyle.CURVED]
          ]
        }),
        TypeAttribute(EdgeRouterEdgeRoutingStyle.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  preferredPolylineSegmentLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Preferred Octilinear Segment Length',
          '#/api/EdgeRouter#EdgeRouter-property-preferredPolylineSegmentLength'
        ),
        OptionGroupAttribute('PolylineGroup', 20),
        MinMaxAttribute().init({
          min: 5,
          max: 500
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 5
  },

  /** @type {boolean} */
  shouldDisablePreferredPolylineSegmentLengthItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.routingStyleItem !== EdgeRouterEdgeRoutingStyle.OCTILINEAR
    }
  },

  /** @type {number} */
  preferredPolylineSegmentRatioItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Preferred Octilinear Segment Ratio',
          '#/api/EdgeRouter#EdgeRouter-property-maximumOctilinearSegmentRatio'
        ),
        OptionGroupAttribute('PolylineGroup', 30),
        MinMaxAttribute().init({
          min: 0,
          max: 0.5,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0.3
  },

  /** @type {boolean} */
  shouldDisablePreferredPolylineSegmentRatioItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.routingStyleItem !== EdgeRouterEdgeRoutingStyle.OCTILINEAR
    }
  },

  /** @type {CurveConnectionStyle} */
  curveAtSourceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Curve Connection at Source',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeRouterEdgeLayoutDescriptor-property-sourceCurveConnectionStyle'
        ),
        OptionGroupAttribute('PolylineGroup', 40),
        EnumValuesAttribute().init({
          values: [
            ['Straight', CurveConnectionStyle.KEEP_PORT],
            ['Organic', CurveConnectionStyle.ORGANIC]
          ]
        }),
        TypeAttribute(CurveConnectionStyle.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  shouldDisableCurveAtSourceItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.routingStyleItem !== EdgeRouterEdgeRoutingStyle.CURVED
    }
  },

  /** @type {CurveConnectionStyle} */
  curveAtTargetItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Curve Connection at Target',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeRouterEdgeLayoutDescriptor-property-targetCurveConnectionStyle'
        ),
        OptionGroupAttribute('PolylineGroup', 50),
        EnumValuesAttribute().init({
          values: [
            ['Straight', CurveConnectionStyle.KEEP_PORT],
            ['Organic', CurveConnectionStyle.ORGANIC]
          ]
        }),
        TypeAttribute(CurveConnectionStyle.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  shouldDisableCurveAtTargetItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.routingStyleItem !== EdgeRouterEdgeRoutingStyle.CURVED
    }
  },

  /** @type {number} */
  curveUTurnSymmetryItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'U-turn symmetry',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-curveUTurnSymmetry'
        ),
        OptionGroupAttribute('PolylineGroup', 60),
        MinMaxAttribute().init({ min: 0, max: 1, step: 0.1 }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableCurveUTurnSymmetryItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.routingStyleItem !== EdgeRouterEdgeRoutingStyle.CURVED
    }
  },

  /** @type {number} */
  curveShortcutsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Allow shortcuts',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-curveShortcuts'
        ),
        OptionGroupAttribute('PolylineGroup', 70),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableCurveShortcutsItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.routingStyleItem !== EdgeRouterEdgeRoutingStyle.CURVED
    }
  },

  /** @type {Strategies} */
  busMembershipItem: {
    $meta: function () {
      return [
        LabelAttribute('Membership', '#/api/EdgeRouterData#EdgeRouterData-property-buses'),
        OptionGroupAttribute('BusGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['No Buses', BusMembership.NONE],
            ['Single Bus', BusMembership.SINGLE],
            ['By First Label', BusMembership.LABEL],
            ['By User Tag', BusMembership.TAG]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  automaticEdgeGroupingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Automatic Edge Grouping',
          '#/api/EdgeRouterBusDescriptor#EdgeRouterBusDescriptor-property-automaticEdgeGrouping'
        ),
        OptionGroupAttribute('BusGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: true
  },

  /** @type {boolean} */
  shouldDisableAutomaticEdgeGroupingItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.busMembershipItem === BusMembership.NONE
    }
  },

  /** @type {number} */
  minimumBackboneSegmentLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Backbone Segment Length',
          '#/api/EdgeRouterBusDescriptor#EdgeRouterBusDescriptor-property-minimumBackboneSegmentLength'
        ),
        OptionGroupAttribute('BusGroup', 30),
        MinMaxAttribute().init({
          min: 1,
          max: 1000
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 100
  },

  /** @type {boolean} */
  shouldDisableMinimumBackboneSegmentLengthItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.busMembershipItem === BusMembership.NONE
    }
  },

  /** @type {boolean} */
  allowMultipleBackboneSegmentsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Multiple Backbone Segments',
          '#/api/EdgeRouterBusDescriptor#EdgeRouterBusDescriptor-property-multipleBackboneSegments'
        ),
        OptionGroupAttribute('BusGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: true
  },

  /** @type {boolean} */
  shouldDisableAllowMultipleBackboneSegmentsItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.busMembershipItem === BusMembership.NONE
    }
  },

  /** @type {boolean} */
  considerNodeLabelsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Consider Node Labels',
          '#/api/EdgeRouter#EdgeRouter-property-considerNodeLabels'
        ),
        OptionGroupAttribute('NodePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  considerEdgeLabelsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Consider Fixed Edges Labels',
          '#/api/EdgeRouter#EdgeRouter-property-considerEdgeLabels'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  edgeLabelingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Labeling',
          '#/api/EdgeRouter#EdgeRouter-property-integratedEdgeLabeling'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 20),
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
        OptionGroupAttribute('EdgePropertiesGroup', 30),
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
  shouldDisableLabelPlacementAlongEdgeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
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
        this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
      )
    }
  }
})
export default PolylineEdgeRouterConfig

/**
 * @readonly
 * @enum {number}
 */
const Strategies = {
  BALANCED: 0,
  MINIMIZE_BENDS: 1,
  MINIMIZE_CROSSINGS: 2,
  MINIMIZE_EDGE_LENGTH: 3
}

/**
 * @readonly
 * @enum {number}
 */
const MonotonyFlags = {
  NONE: 0,
  HORIZONTAL: 1,
  VERTICAL: 2,
  BOTH: 3
}

export /**
 * @readonly
 * @enum {number}
 */
const BusMembership = {
  NONE: 0,
  SINGLE: 1,
  LABEL: 2,
  TAG: 3
}

export /**
 * @readonly
 * @enum {number}
 */
const PortSides = {
  ANY: 0,
  LEFT_RIGHT: 1,
  TOP_BOTTOM: 2
}
