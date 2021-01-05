/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgeRouterEdgeLayoutDescriptor,
  EdgeRouterEdgeRoutingStyle,
  EdgeRouterScope,
  EnumDefinition,
  GenericLabeling,
  GraphComponent,
  Grid,
  HierarchicLayoutEdgeRoutingStyle,
  List,
  MonotonicPathRestriction,
  PenaltySettings,
  PolylineEdgeRouterData,
  SequentialLayout,
  YBoolean,
  YNumber,
  YPoint,
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
 * @yjs:keep=DescriptionGroup,DistancesGroup,EdgePropertiesGroup,GridGroup,LabelingGroup,LayoutGroup,NodePropertiesGroup,PolylineGroup,PreferredPlacementGroup,descriptionText,considerEdgeLabelsItem,considerNodeLabelsItem,edgeLabelingItem,routingStyleItem,enableReroutingItem,gridEnabledItem,gridSpacingItem,labelPlacementAlongEdgeItem,labelPlacementDistanceItem,labelPlacementOrientationItem,labelPlacementSideOfEdgeItem,maximumDurationItem,minimumEdgeToEdgeDistanceItem,minimumFirstSegmentLengthItem,minimumLastSegmentLengthItem,useIntermediatePointsItem,minimumNodeCornerDistanceItem,minimumNodeToEdgeDistanceItem,monotonicRestrictionItem,optimizationStrategyItem,preferredPolylineSegmentLengthItem,scopeItem,shouldDisableGridSpacingItem,shouldDisableLabelPlacementAlongEdgeItem,shouldDisableLabelPlacementDistanceItem,shouldDisableLabelPlacementOrientationItem,shouldDisableLabelPlacementSideOfEdgeItem,shouldDisablePreferredPolylineSegmentLengthItem, busMembershipItem, enableBusRouting, preferredPolylineSegmentLengthItem, preferredPolylineSegmentRatioItem, curveAtSourceItem, curveAtTargetItem, shouldDisableCurveAtSourceItem, shouldDisableCurveAtTargetItem
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
    this.optimizationStrategyItem = PolylineEdgeRouterConfig.EnumStrategies.BALANCED
    this.monotonicRestrictionItem = PolylineEdgeRouterConfig.EnumMonotonyFlags.NONE
    this.enableReroutingItem = router.rerouting
    this.maximumDurationItem = 30

    const descriptor = router.defaultEdgeLayoutDescriptor
    this.minimumEdgeToEdgeDistanceItem = descriptor.minimumEdgeToEdgeDistance
    this.minimumNodeToEdgeDistanceItem = router.minimumNodeToEdgeDistance
    this.minimumNodeCornerDistanceItem = descriptor.minimumNodeCornerDistance
    this.minimumFirstSegmentLengthItem = descriptor.minimumFirstSegmentLength
    this.minimumLastSegmentLengthItem = descriptor.minimumLastSegmentLength

    this.useIntermediatePointsItem = false

    const grid = router.grid
    this.gridEnabledItem = grid !== null
    this.gridSpacingItem = grid !== null ? grid.spacing : 10

    this.routingStyleItem = EdgeRouterEdgeRoutingStyle.ORTHOGONAL
    this.preferredPolylineSegmentLengthItem = descriptor.preferredOctilinearSegmentLength
    this.preferredPolylineSegmentRatioItem = descriptor.maximumOctilinearSegmentRatio
    this.curveAtSourceItem = descriptor.sourceCurveConnectionStyle
    this.curveAtTargetItem = descriptor.targetCurveConnectionStyle

    this.busMembershipItem = PolylineEdgeRouterConfig.EnumBusMembership.NONE

    this.considerNodeLabelsItem = router.considerNodeLabels
    this.considerEdgeLabelsItem = router.considerEdgeLabels
    this.edgeLabelingItem = PolylineEdgeRouterConfig.EnumEdgeLabeling.NONE
    this.labelPlacementAlongEdgeItem = LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem =
      LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout.
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

    if (this.edgeLabelingItem === PolylineEdgeRouterConfig.EnumEdgeLabeling.INTEGRATED) {
      router.integratedEdgeLabeling = true
    } else if (this.edgeLabelingItem === PolylineEdgeRouterConfig.EnumEdgeLabeling.GENERIC) {
      const genericLabeling = new GenericLabeling()
      genericLabeling.placeEdgeLabels = true
      genericLabeling.placeNodeLabels = false
      genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
      layout.appendLayout(genericLabeling)
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
   * Called by {@link LayoutConfiguration#apply} to create the layout data of the configuration.
   * This method is typically overridden to provide mappers for the different layouts.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData = new PolylineEdgeRouterData({
      edgeLayoutDescriptors: edge => {
        const descriptor = new EdgeRouterEdgeLayoutDescriptor({
          minimumEdgeToEdgeDistance: this.minimumEdgeToEdgeDistanceItem,
          minimumNodeCornerDistance: this.minimumNodeCornerDistanceItem,
          minimumFirstSegmentLength: this.minimumFirstSegmentLengthItem,
          minimumLastSegmentLength: this.minimumLastSegmentLengthItem,
          preferredOctilinearSegmentLength: this.$preferredPolylineSegmentLengthItem,
          maximumOctilinearSegmentRatio: this.$preferredPolylineSegmentRatioItem,
          sourceCurveConnectionStyle: this.curveAtSourceItem,
          targetCurveConnectionStyle: this.curveAtTargetItem,
          routingStyle: this.routingStyleItem
        })

        if (this.optimizationStrategyItem === PolylineEdgeRouterConfig.EnumStrategies.BALANCED) {
          descriptor.penaltySettings = PenaltySettings.OPTIMIZATION_BALANCED
        } else if (
          this.optimizationStrategyItem === PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_BENDS
        ) {
          descriptor.penaltySettings = PenaltySettings.OPTIMIZATION_EDGE_BENDS
        } else if (
          this.optimizationStrategyItem ===
          PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_EDGE_LENGTH
        ) {
          descriptor.penaltySettings = PenaltySettings.OPTIMIZATION_EDGE_LENGTHS
        } else {
          descriptor.penaltySettings = PenaltySettings.OPTIMIZATION_EDGE_CROSSINGS
        }

        if (
          this.monotonicRestrictionItem === PolylineEdgeRouterConfig.EnumMonotonyFlags.HORIZONTAL
        ) {
          descriptor.monotonicPathRestriction = MonotonicPathRestriction.HORIZONTAL
        } else if (
          this.monotonicRestrictionItem === PolylineEdgeRouterConfig.EnumMonotonyFlags.VERTICAL
        ) {
          descriptor.monotonicPathRestriction = MonotonicPathRestriction.VERTICAL
        } else if (
          this.monotonicRestrictionItem === PolylineEdgeRouterConfig.EnumMonotonyFlags.BOTH
        ) {
          descriptor.monotonicPathRestriction = MonotonicPathRestriction.BOTH
        } else {
          descriptor.monotonicPathRestriction = MonotonicPathRestriction.NONE
        }

        if (this.useIntermediatePointsItem) {
          const intermediateRoutingPoints = new List()
          edge.bends.forEach(bend =>
            intermediateRoutingPoints.add(new YPoint(bend.location.x, bend.location.y))
          )
          descriptor.intermediateRoutingPoints = intermediateRoutingPoints
        }

        return descriptor
      }
    })

    const selection = graphComponent.selection
    if (this.scopeItem === EdgeRouterScope.ROUTE_EDGES_AT_AFFECTED_NODES) {
      layoutData.affectedNodes = node => selection.isSelected(node)
    } else if (this.scopeItem === EdgeRouterScope.ROUTE_AFFECTED_EDGES) {
      layoutData.affectedEdges = edge => selection.isSelected(edge)
    } else {
      layoutData.affectedEdges = edge => true
      layoutData.affectedNodes = edge => true
    }

    switch (this.busMembershipItem) {
      case PolylineEdgeRouterConfig.EnumBusMembership.SINGLE: {
        const busDescriptor = this.createBusDescriptor()
        layoutData.buses.add(busDescriptor).source = graphComponent.graph.edges
        break
      }
      case PolylineEdgeRouterConfig.EnumBusMembership.LABEL: {
        const visitedLabels = new Set()
        graphComponent.graph.edgeLabels.forEach(label => {
          if (!visitedLabels.has(label.text)) {
            visitedLabels.add(label.text)
            const busDescriptor = this.createBusDescriptor()
            layoutData.buses.add(busDescriptor).delegate = edge =>
              edge.labels.size > 0 && edge.labels.first().text === label.text
          }
        })
        break
      }
      case PolylineEdgeRouterConfig.EnumBusMembership.TAG: {
        const visitedTags = new Set()
        graphComponent.graph.edges.forEach(edge => {
          const tag = edge.tag
          if (!tag) {
            const busDescriptor = this.createBusDescriptor()
            layoutData.buses.add(busDescriptor).item = edge
          } else if (!visitedTags.has(tag)) {
            visitedTags.add(tag)

            const busDescriptor = this.createBusDescriptor()
            layoutData.buses.add(busDescriptor).delegate = edge => edge.tag === tag
          }
        })
        break
      }
    }

    return layoutData
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
    this.busMembershipItem = PolylineEdgeRouterConfig.EnumBusMembership.TAG
  },

  /**
   * Enables automatic bus routing.
   */
  enableCurvedRouting: function () {
    this.routingStyleItem = EdgeRouterEdgeRoutingStyle.CURVED
  },

  // ReSharper disable UnusedMember.Global
  // ReSharper disable InconsistentNaming
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
        OptionGroupAttribute('RootGroup', 20),
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
        OptionGroupAttribute('RootGroup', 30),
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
        OptionGroupAttribute('RootGroup', 40),
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
        OptionGroupAttribute('PolylineGroup', 60),
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
      return "<p style='margin-top:0'>Polyline edge routing calculates polyline edge paths for a diagram's edges. The positions of the nodes are not changed by this algorithm.</p><p>Edges will be routed orthogonally, that is each edge path consists of horizontal and vertical segments, or octilinear. Octilinear means that the slope of each segment of an edge path is a multiple of 45 degrees.</p><p>This type of edge routing is especially well suited for technical diagrams.</p>"
    }
  },

  /**
   * Backing field for below property
   * @type {EdgeRouterScope}
   */
  $scopeItem: null,

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
    get: function () {
      return this.$scopeItem
    },
    set: function (value) {
      this.$scopeItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {PolylineEdgeRouterConfig.EnumStrategies}
   */
  $optimizationStrategyItem: null,

  /** @type {PolylineEdgeRouterConfig.EnumStrategies} */
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
            ['Balanced', PolylineEdgeRouterConfig.EnumStrategies.BALANCED],
            ['Fewer Bends', PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_BENDS],
            ['Fewer Crossings', PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_CROSSINGS],
            ['Shorter Edges', PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_EDGE_LENGTH]
          ]
        }),
        TypeAttribute(PolylineEdgeRouterConfig.EnumStrategies.$class)
      ]
    },
    get: function () {
      return this.$optimizationStrategyItem
    },
    set: function (value) {
      this.$optimizationStrategyItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {PolylineEdgeRouterConfig.EnumMonotonyFlags}
   */
  $monotonicRestrictionItem: null,

  /** @type {PolylineEdgeRouterConfig.EnumMonotonyFlags} */
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
            ['None', PolylineEdgeRouterConfig.EnumMonotonyFlags.NONE],
            ['Horizontal', PolylineEdgeRouterConfig.EnumMonotonyFlags.HORIZONTAL],
            ['Vertical', PolylineEdgeRouterConfig.EnumMonotonyFlags.VERTICAL],
            ['Both', PolylineEdgeRouterConfig.EnumMonotonyFlags.BOTH]
          ]
        }),
        TypeAttribute(PolylineEdgeRouterConfig.EnumMonotonyFlags.$class)
      ]
    },
    get: function () {
      return this.$monotonicRestrictionItem
    },
    set: function (value) {
      this.$monotonicRestrictionItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $enableReroutingItem: false,

  /** @type {boolean} */
  enableReroutingItem: {
    $meta: function () {
      return [
        LabelAttribute('Reroute Crossing Edges', '#/api/EdgeRouter#EdgeRouter-property-rerouting'),
        OptionGroupAttribute('LayoutGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$enableReroutingItem
    },
    set: function (value) {
      this.$enableReroutingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $useIntermediatePointsItem: false,

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
    get: function () {
      return this.$useIntermediatePointsItem
    },
    set: function (value) {
      this.$useIntermediatePointsItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableUseIntermediatePointsItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.busMembershipItem !== PolylineEdgeRouterConfig.EnumBusMembership.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $maximumDurationItem: 0,

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
    get: function () {
      return this.$maximumDurationItem
    },
    set: function (value) {
      this.$maximumDurationItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumEdgeToEdgeDistanceItem: 0,

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
    get: function () {
      return this.$minimumEdgeToEdgeDistanceItem
    },
    set: function (value) {
      this.$minimumEdgeToEdgeDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumNodeToEdgeDistanceItem: 0,

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
    get: function () {
      return this.$minimumNodeToEdgeDistanceItem
    },
    set: function (value) {
      this.$minimumNodeToEdgeDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumNodeCornerDistanceItem: 0,

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
    get: function () {
      return this.$minimumNodeCornerDistanceItem
    },
    set: function (value) {
      this.$minimumNodeCornerDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumFirstSegmentLengthItem: 0,

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
    get: function () {
      return this.$minimumFirstSegmentLengthItem
    },
    set: function (value) {
      this.$minimumFirstSegmentLengthItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumLastSegmentLengthItem: 0,

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
    get: function () {
      return this.$minimumLastSegmentLengthItem
    },
    set: function (value) {
      this.$minimumLastSegmentLengthItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $gridEnabledItem: false,

  /** @type {boolean} */
  gridEnabledItem: {
    $meta: function () {
      return [
        LabelAttribute('Route on Grid', '#/api/EdgeRouter#EdgeRouter-property-grid'),
        OptionGroupAttribute('GridGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$gridEnabledItem
    },
    set: function (value) {
      this.$gridEnabledItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $gridSpacingItem: 0,

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
    get: function () {
      return this.$gridSpacingItem
    },
    set: function (value) {
      this.$gridSpacingItem = value
    }
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

  /**
   * Backing field for below property
   * @type {EdgeRouterEdgeRoutingStyle}
   */
  $routingStyleItem: null,

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
    get: function () {
      return this.$routingStyleItem
    },
    set: function (value) {
      this.$routingStyleItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $preferredPolylineSegmentLengthItem: 0,

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
    get: function () {
      return this.$preferredPolylineSegmentLengthItem
    },
    set: function (value) {
      this.$preferredPolylineSegmentLengthItem = value
    }
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

  /**
   * Backing field for below property
   * @type {number}
   */
  $preferredPolylineSegmentRatioItem: 0.3,

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
    get: function () {
      return this.$preferredPolylineSegmentRatioItem
    },
    set: function (value) {
      this.$preferredPolylineSegmentRatioItem = value
    }
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

  /**
   * Backing field for below property
   * @type {CurveConnectionStyle}
   */
  $curveAtSourceItem: null,

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
    get: function () {
      return this.$curveAtSourceItem
    },
    set: function (value) {
      this.$curveAtSourceItem = value
    }
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

  /**
   * Backing field for below property
   * @type {CurveConnectionStyle}
   */
  $curveAtTargetItem: null,

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
    get: function () {
      return this.$curveAtTargetItem
    },
    set: function (value) {
      this.$curveAtTargetItem = value
    }
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

  /**
   * Backing field for below property
   * @type {PolylineEdgeRouterConfig.EnumStrategies}
   */
  $busMembershipItem: null,

  /** @type {PolylineEdgeRouterConfig.EnumStrategies} */
  busMembershipItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Membership',
          '#/api/PolylineEdgeRouterData#PolylineEdgeRouterData-property-buses'
        ),
        OptionGroupAttribute('BusGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['No Buses', PolylineEdgeRouterConfig.EnumBusMembership.NONE],
            ['Single Bus', PolylineEdgeRouterConfig.EnumBusMembership.SINGLE],
            ['By First Label', PolylineEdgeRouterConfig.EnumBusMembership.LABEL],
            ['By User Tag', PolylineEdgeRouterConfig.EnumBusMembership.TAG]
          ]
        }),
        TypeAttribute(PolylineEdgeRouterConfig.EnumBusMembership.$class)
      ]
    },
    get: function () {
      return this.$busMembershipItem
    },
    set: function (value) {
      this.$busMembershipItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $automaticEdgeGroupingItem: true,

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
    get: function () {
      return this.$automaticEdgeGroupingItem
    },
    set: function (value) {
      this.$automaticEdgeGroupingItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableAutomaticEdgeGroupingItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.busMembershipItem === PolylineEdgeRouterConfig.EnumBusMembership.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumBackboneSegmentLengthItem: 100,

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
    get: function () {
      return this.$minimumBackboneSegmentLengthItem
    },
    set: function (value) {
      this.$minimumBackboneSegmentLengthItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableMinimumBackboneSegmentLengthItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.busMembershipItem === PolylineEdgeRouterConfig.EnumBusMembership.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $allowMultipleBackboneSegmentsItem: true,

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
    get: function () {
      return this.$allowMultipleBackboneSegmentsItem
    },
    set: function (value) {
      this.$allowMultipleBackboneSegmentsItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableAllowMultipleBackboneSegmentsItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.busMembershipItem === PolylineEdgeRouterConfig.EnumBusMembership.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $considerNodeLabelsItem: false,

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
    get: function () {
      return this.$considerNodeLabelsItem
    },
    set: function (value) {
      this.$considerNodeLabelsItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $considerEdgeLabelsItem: false,

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
    get: function () {
      return this.$considerEdgeLabelsItem
    },
    set: function (value) {
      this.$considerEdgeLabelsItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {PolylineEdgeRouterConfig.EnumEdgeLabeling}
   */
  $edgeLabelingItem: null,

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
            ['None', PolylineEdgeRouterConfig.EnumEdgeLabeling.NONE],
            ['Integrated', PolylineEdgeRouterConfig.EnumEdgeLabeling.INTEGRATED],
            ['Generic', PolylineEdgeRouterConfig.EnumEdgeLabeling.GENERIC]
          ]
        }),
        TypeAttribute(PolylineEdgeRouterConfig.EnumEdgeLabeling.$class)
      ]
    },
    get: function () {
      return this.$edgeLabelingItem
    },
    set: function (value) {
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
      return this.edgeLabelingItem !== PolylineEdgeRouterConfig.EnumEdgeLabeling.GENERIC
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
      return this.edgeLabelingItem === PolylineEdgeRouterConfig.EnumEdgeLabeling.NONE
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
      return this.edgeLabelingItem === PolylineEdgeRouterConfig.EnumEdgeLabeling.NONE
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
      return this.edgeLabelingItem === PolylineEdgeRouterConfig.EnumEdgeLabeling.NONE
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
        this.edgeLabelingItem === PolylineEdgeRouterConfig.EnumEdgeLabeling.NONE ||
        this.labelPlacementSideOfEdgeItem ===
          LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
      )
    }
  },

  $static: {
    EnumStrategies: new EnumDefinition(() => {
      return {
        BALANCED: 0,
        MINIMIZE_BENDS: 1,
        MINIMIZE_CROSSINGS: 2,
        MINIMIZE_EDGE_LENGTH: 3
      }
    }),

    EnumMonotonyFlags: new EnumDefinition(() => {
      return {
        NONE: 0,
        HORIZONTAL: 1,
        VERTICAL: 2,
        BOTH: 3
      }
    }),

    EnumBusMembership: new EnumDefinition(() => {
      return {
        NONE: 0,
        SINGLE: 1,
        LABEL: 2,
        TAG: 3
      }
    }),

    EnumEdgeLabeling: new EnumDefinition(() => {
      return {
        NONE: 0,
        INTEGRATED: 1,
        GENERIC: 2
      }
    })
  }
})
export default PolylineEdgeRouterConfig
