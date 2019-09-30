/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgeRouter,
  EdgeRouterScope,
  EnumDefinition,
  FreeEdgeLabelModel,
  GenericLabeling,
  GraphComponent,
  Grid,
  IEdgeLabelLayout,
  ILabel,
  ILayoutAlgorithm,
  LabelAngleReferences,
  LabelPlacements,
  LayoutData,
  LayoutExecutor,
  LayoutGraphAdapter,
  MinimumNodeSizeStage,
  MonotonicPathRestriction,
  PenaltySettings,
  PolylineEdgeRouterData,
  PreferredPlacementDescriptor,
  SequentialLayout,
  YBoolean,
  YNumber,
  YString
} from 'yfiles'

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
 * Configuration options for the the polyline edge router.
 * @yjs:keep=DescriptionGroup,DistancesGroup,EdgePropertiesGroup,GridGroup,LabelingGroup,LayoutGroup,NodePropertiesGroup,PolylineGroup,PreferredPlacementGroup,descriptionText,considerEdgeLabelsItem,considerNodeLabelsItem,edgeLabelingItem,enablePolylineRoutingItem,enableReroutingItem,gridEnabledItem,gridSpacingItem,labelPlacementAlongEdgeItem,labelPlacementDistanceItem,labelPlacementOrientationItem,labelPlacementSideOfEdgeItem,maximumDurationItem,minimumEdgeToEdgeDistanceItem,minimumFirstSegmentLengthItem,minimumLastSegmentLengthItem,minimumNodeCornerDistanceItem,minimumNodeToEdgeDistanceItem,monotonicRestrictionItem,optimizationStrategyItem,preferredPolylineSegmentLengthItem,scopeItem,shouldDisableGridSpacingItem,shouldDisableLabelPlacementAlongEdgeItem,shouldDisableLabelPlacementDistanceItem,shouldDisableLabelPlacementOrientationItem,shouldDisableLabelPlacementSideOfEdgeItem,shouldDisablePreferredPolylineSegmentLengthItem
 */
export const PolylineEdgeRouterConfig = Class('PolylineEdgeRouterConfig', {
  $meta: [LabelAttribute('PolylineEdgeRouter')],

  /**
   * A guard to prevent running multiple layout calculations at the same time.
   * @type {boolean}
   */
  $layoutRunning: false,

  /**
   * The current layout algorithm.
   * @type {ILayoutAlgorithm}
   */
  $layout: null,

  /**
   * The current layout data.
   * @type {LayoutData}
   */
  $layoutData: null,

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function() {
    this.$initPolylineEdgeRouterConfig()
    const router = new EdgeRouter()

    this.scopeItem = router.scope
    this.optimizationStrategyItem = PolylineEdgeRouterConfig.EnumStrategies.BALANCED
    this.monotonicRestrictionItem = PolylineEdgeRouterConfig.EnumMonotonyFlags.NONE
    this.enableReroutingItem = router.rerouting
    this.maximumDurationItem = 30

    const descriptor = router.defaultEdgeLayoutDescriptor
    this.minimumEdgeToEdgeDistanceItem = 5
    this.minimumNodeToEdgeDistanceItem = router.minimumNodeToEdgeDistance
    this.minimumNodeCornerDistanceItem = descriptor.minimumNodeCornerDistance
    this.minimumFirstSegmentLengthItem = descriptor.minimumFirstSegmentLength
    this.minimumLastSegmentLengthItem = descriptor.minimumLastSegmentLength

    const grid = router.grid
    this.gridEnabledItem = grid !== null
    this.gridSpacingItem = grid !== null ? grid.spacing : 10

    this.enablePolylineRoutingItem = true
    this.preferredPolylineSegmentLengthItem = router.preferredPolylineSegmentLength

    this.considerNodeLabelsItem = router.considerNodeLabels
    this.considerEdgeLabelsItem = router.considerEdgeLabels
    this.edgeLabelingItem = false
    this.labelPlacementAlongEdgeItem = PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem =
      PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem =
      PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
  },

  /**
   * Applies this configuration to the given {@link GraphComponent}.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *  configuration on
   * @return {Promise} A promise which resolves after the layout is applied without errors.
   */
  apply: async function(graphComponent) {
    if (this.$layoutRunning) {
      return Promise.reject(new Error('Edge routing already in progress'))
    }

    if (!this.layout) {
      this.layout = this.createConfiguredLayout(graphComponent)
    }
    if (!this.layoutData) {
      this.layoutData = this.createConfiguredLayoutData(graphComponent, this.layout)
    }

    // configure the LayoutExecutor
    const layoutExecutor = new LayoutExecutor({
      graphComponent,
      layout: new MinimumNodeSizeStage(this.layout),
      duration: '0.5s',
      animateViewport: true
    })

    // set the cancel duration for the layout computation to 20s
    if (this.layoutData && this.layoutData.abortHandler) {
      this.layoutData.abortHandler.cancelDuration = '20s'
    } else {
      layoutExecutor.abortHandler.cancelDuration = '20s'
    }

    // set the layout data to the LayoutExecutor
    if (this.layoutData) {
      layoutExecutor.layoutData = this.layoutData
    }
    try {
      // start the LayoutExecutor with finish and error handling code
      await layoutExecutor.start()
      this.postProcess(graphComponent)
    } catch (error) {
      this.postProcess()
      if (error.name === 'AlgorithmAbortedError') {
        alert(
          'The layout computation was canceled because the maximum configured runtime of 20 seconds was exceeded.'
        )
      } else if (typeof window.reportError === 'function') {
        window.reportError(error)
      }
    } finally {
      this.$layoutRunning = false
    }
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The given graphComponent
   */
  createConfiguredLayout: function(graphComponent) {
    const router = new EdgeRouter()
    const descriptor = router.defaultEdgeLayoutDescriptor

    router.scope = this.scopeItem

    if (this.optimizationStrategyItem === PolylineEdgeRouterConfig.EnumStrategies.BALANCED) {
      descriptor.penaltySettings = PenaltySettings.OPTIMIZATION_BALANCED
    } else if (
      this.optimizationStrategyItem === PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_BENDS
    ) {
      descriptor.penaltySettings = PenaltySettings.OPTIMIZATION_EDGE_BENDS
    } else if (
      this.optimizationStrategyItem === PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_EDGE_LENGTH
    ) {
      descriptor.penaltySettings = PenaltySettings.OPTIMIZATION_EDGE_LENGTHS
    } else {
      descriptor.penaltySettings = PenaltySettings.OPTIMIZATION_EDGE_CROSSINGS
    }

    if (this.monotonicRestrictionItem === PolylineEdgeRouterConfig.EnumMonotonyFlags.HORIZONTAL) {
      descriptor.monotonicPathRestriction = MonotonicPathRestriction.HORIZONTAL
    } else if (
      this.monotonicRestrictionItem === PolylineEdgeRouterConfig.EnumMonotonyFlags.VERTICAL
    ) {
      descriptor.monotonicPathRestriction = MonotonicPathRestriction.VERTICAL
    } else if (this.monotonicRestrictionItem === PolylineEdgeRouterConfig.EnumMonotonyFlags.BOTH) {
      descriptor.monotonicPathRestriction = MonotonicPathRestriction.BOTH
    } else {
      descriptor.monotonicPathRestriction = MonotonicPathRestriction.NONE
    }

    descriptor.minimumEdgeToEdgeDistance = this.minimumEdgeToEdgeDistanceItem
    router.minimumNodeToEdgeDistance = this.minimumNodeToEdgeDistanceItem
    descriptor.minimumNodeCornerDistance = this.minimumNodeCornerDistanceItem
    descriptor.minimumFirstSegmentLength = this.minimumFirstSegmentLengthItem
    descriptor.minimumLastSegmentLength = this.minimumLastSegmentLengthItem

    if (this.gridEnabledItem) {
      router.grid = new Grid(0, 0, this.gridSpacingItem)
    } else {
      router.grid = null
    }

    router.considerNodeLabels = this.considerNodeLabelsItem
    router.considerEdgeLabels = this.considerEdgeLabelsItem
    router.rerouting = this.enableReroutingItem

    router.polylineRouting = this.enablePolylineRoutingItem
    router.preferredPolylineSegmentLength = this.preferredPolylineSegmentLengthItem
    router.maximumDuration = this.maximumDurationItem * 1000

    this.layout = new SequentialLayout()
    this.layout.appendLayout(router)

    if (this.edgeLabelingItem) {
      const genericLabeling = new GenericLabeling()
      genericLabeling.placeEdgeLabels = true
      genericLabeling.placeNodeLabels = false
      genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
      this.layout.appendLayout(genericLabeling)
    }

    PolylineEdgeRouterConfig.addPreferredPlacementDescriptor(
      graphComponent.graph,
      this.labelPlacementAlongEdgeItem,
      this.labelPlacementSideOfEdgeItem,
      this.labelPlacementOrientationItem,
      this.labelPlacementDistanceItem
    )
  },

  /**
   * Creates the layout data of the configuration.
   * @param {GraphComponent} graphComponent The given graphComponent
   */
  createConfiguredLayoutData: function(graphComponent) {
    this.layoutData = new PolylineEdgeRouterData()
    const selection = graphComponent.selection
    if (this.scopeItem === EdgeRouterScope.ROUTE_EDGES_AT_AFFECTED_NODES) {
      this.layoutData.affectedNodes = node => selection.isSelected(node)
    } else if (this.scopeItem === EdgeRouterScope.ROUTE_AFFECTED_EDGES) {
      this.layoutData.affectedEdges = edge => selection.isSelected(edge)
    } else {
      this.layoutData.affectedEdges = edge => true
      this.layoutData.affectedNodes = edge => true
    }
    return this.layoutData
  },

  /**
   * Configures the layout algorithm and the layout data.
   * @param {GraphComponent} graphComponent The given graphComponent
   */
  createConfiguration: function(graphComponent) {
    this.createConfiguredLayout(graphComponent)
    return this.createConfiguredLayoutData(graphComponent)
  },

  /**
   * Called after the layout animation is done.
   */
  postProcess: function() {
    this.layout = null
    this.layoutData = null
  },

  /** @type {OptionGroup} */
  DescriptionGroup: {
    $meta: function() {
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
    $meta: function() {
      return [
        LabelAttribute('Layout'),
        OptionGroupAttribute('RootGroup', 10),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  DistancesGroup: {
    $meta: function() {
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
    $meta: function() {
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
    $meta: function() {
      return [
        LabelAttribute('Octilinear Routing'),
        OptionGroupAttribute('RootGroup', 40),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  LabelingGroup: {
    $meta: function() {
      return [
        LabelAttribute('Labeling'),
        OptionGroupAttribute('RootGroup', 50),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  NodePropertiesGroup: {
    $meta: function() {
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
    $meta: function() {
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
    $meta: function() {
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
    $meta: function() {
      return [
        OptionGroupAttribute('DescriptionGroup', 10),
        ComponentAttribute(Components.HTML_BLOCK),
        TypeAttribute(YString.$class)
      ]
    },
    get: function() {
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
    $meta: function() {
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
    get: function() {
      return this.$scopeItem
    },
    set: function(value) {
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
    $meta: function() {
      return [
        LabelAttribute(
          'Optimization Strategy',
          '#/api/EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-penaltySettings'
        ),
        OptionGroupAttribute('LayoutGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Balanced', PolylineEdgeRouterConfig.EnumStrategies.BALANCED],
            ['Less Bends', PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_BENDS],
            ['Less Crossings', PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_CROSSINGS],
            ['Shorter Edges', PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_EDGE_LENGTH]
          ]
        }),
        TypeAttribute(PolylineEdgeRouterConfig.EnumStrategies.$class)
      ]
    },
    get: function() {
      return this.$optimizationStrategyItem
    },
    set: function(value) {
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
    $meta: function() {
      return [
        LabelAttribute(
          'Monotonic Restriction',
          '#/api/EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-monotonicPathRestriction'
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
    get: function() {
      return this.$monotonicRestrictionItem
    },
    set: function(value) {
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
    $meta: function() {
      return [
        LabelAttribute('Reroute Crossing Edges', '#/api/EdgeRouter#EdgeRouter-property-rerouting'),
        OptionGroupAttribute('LayoutGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$enableReroutingItem
    },
    set: function(value) {
      this.$enableReroutingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $maximumDurationItem: 0,

  /** @type {number} */
  maximumDurationItem: {
    $meta: function() {
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
    get: function() {
      return this.$maximumDurationItem
    },
    set: function(value) {
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
    $meta: function() {
      return [
        LabelAttribute(
          'Edge to Edge',
          '#/api/EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumEdgeToEdgeDistance'
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
    get: function() {
      return this.$minimumEdgeToEdgeDistanceItem
    },
    set: function(value) {
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
    $meta: function() {
      return [
        LabelAttribute(
          'Node to Edge',
          '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-minimumNodeToEdgeDistance'
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
    get: function() {
      return this.$minimumNodeToEdgeDistanceItem
    },
    set: function(value) {
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
    $meta: function() {
      return [
        LabelAttribute(
          'Port to Node Corner',
          '#/api/yfiles.router.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumNodeCornerDistance'
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
    get: function() {
      return this.$minimumNodeCornerDistanceItem
    },
    set: function(value) {
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
    $meta: function() {
      return [
        LabelAttribute(
          'First Segment Length',
          '#/api/yfiles.router.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumFirstSegmentLength'
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
    get: function() {
      return this.$minimumFirstSegmentLengthItem
    },
    set: function(value) {
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
    $meta: function() {
      return [
        LabelAttribute(
          'Last Segment Length',
          '#/api/yfiles.router.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLastSegmentLength'
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
    get: function() {
      return this.$minimumLastSegmentLengthItem
    },
    set: function(value) {
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
    $meta: function() {
      return [
        LabelAttribute('Route on Grid', '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-grid'),
        OptionGroupAttribute('GridGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$gridEnabledItem
    },
    set: function(value) {
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
    $meta: function() {
      return [
        LabelAttribute('Grid Spacing', '#/api/yfiles.router.Grid#Grid-property-spacing'),
        OptionGroupAttribute('GridGroup', 20),
        MinMaxAttribute().init({
          min: 2,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$gridSpacingItem
    },
    set: function(value) {
      this.$gridSpacingItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableGridSpacingItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.gridEnabledItem === false
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $enablePolylineRoutingItem: false,

  /** @type {boolean} */
  enablePolylineRoutingItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Octilinear Routing',
          '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-polylineRouting'
        ),
        OptionGroupAttribute('PolylineGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$enablePolylineRoutingItem
    },
    set: function(value) {
      this.$enablePolylineRoutingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $preferredPolylineSegmentLengthItem: 0,

  /** @type {number} */
  preferredPolylineSegmentLengthItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Preferred Polyline Segment Length',
          '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-preferredPolylineSegmentLength'
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
    get: function() {
      return this.$preferredPolylineSegmentLengthItem
    },
    set: function(value) {
      this.$preferredPolylineSegmentLengthItem = value
    }
  },

  /** @type {boolean} */
  shouldDisablePreferredPolylineSegmentLengthItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.enablePolylineRoutingItem === false
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $considerNodeLabelsItem: false,

  /** @type {boolean} */
  considerNodeLabelsItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Consider Node Labels',
          '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-considerNodeLabels'
        ),
        OptionGroupAttribute('NodePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$considerNodeLabelsItem
    },
    set: function(value) {
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
    $meta: function() {
      return [
        LabelAttribute(
          'Consider Fixed Edges Labels',
          '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-considerEdgeLabels'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$considerEdgeLabelsItem
    },
    set: function(value) {
      this.$considerEdgeLabelsItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $edgeLabelingItem: false,

  /** @type {boolean} */
  edgeLabelingItem: {
    $meta: function() {
      return [
        LabelAttribute('Edge Labeling', '#/api/GenericLabeling'),
        OptionGroupAttribute('EdgePropertiesGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$edgeLabelingItem
    },
    set: function(value) {
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
    $meta: function() {
      return [
        LabelAttribute(
          'Reduce Ambiguity',
          '#/api/GenericLabeling#MISLabelingBase-property-reduceAmbiguity'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$reduceAmbiguityItem
    },
    set: function(value) {
      this.$reduceAmbiguityItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return !this.edgeLabelingItem
    }
  },

  /**
   * Backing field for below property
   * @type {PolylineEdgeRouterConfig.EnumLabelPlacementOrientation}
   */
  $labelPlacementOrientationItem: null,

  /** @type {PolylineEdgeRouterConfig.EnumLabelPlacementOrientation} */
  labelPlacementOrientationItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Orientation',
          '#/api/LayoutGraphAdapter#LayoutGraphAdapter-field-EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Parallel', PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.PARALLEL],
            ['Orthogonal', PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.ORTHOGONAL],
            ['Horizontal', PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.HORIZONTAL],
            ['Vertical', PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.VERTICAL]
          ]
        }),
        TypeAttribute(PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.$class)
      ]
    },
    get: function() {
      return this.$labelPlacementOrientationItem
    },
    set: function(value) {
      this.$labelPlacementOrientationItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return !this.edgeLabelingItem
    }
  },

  /**
   * Backing field for below property
   * @type {PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge}
   */
  $labelPlacementAlongEdgeItem: null,

  /** @type {PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge} */
  labelPlacementAlongEdgeItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Along Edge',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-placeAlongEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Anywhere', PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.ANYWHERE],
            ['At Source', PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.AT_SOURCE],
            ['At Target', PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.AT_TARGET],
            ['Centered', PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.CENTERED]
          ]
        }),
        TypeAttribute(PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.$class)
      ]
    },
    get: function() {
      return this.$labelPlacementAlongEdgeItem
    },
    set: function(value) {
      this.$labelPlacementAlongEdgeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return !this.edgeLabelingItem
    }
  },

  /**
   * Backing field for below property
   * @type {PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge}
   */
  $labelPlacementSideOfEdgeItem: null,

  /** @type {PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge} */
  labelPlacementSideOfEdgeItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Side of Edge',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-sideOfEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Anywhere', PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ANYWHERE],
            ['On Edge', PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ON_EDGE],
            ['Left', PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.LEFT],
            ['Right', PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.RIGHT],
            ['Left or Right', PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.LEFT_OR_RIGHT]
          ]
        }),
        TypeAttribute(PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.$class)
      ]
    },
    get: function() {
      return this.$labelPlacementSideOfEdgeItem
    },
    set: function(value) {
      this.$labelPlacementSideOfEdgeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return !this.edgeLabelingItem
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $labelPlacementDistanceItem: 0,

  /** @type {number} */
  labelPlacementDistanceItem: {
    $meta: function() {
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
    get: function() {
      return this.$labelPlacementDistanceItem
    },
    set: function(value) {
      this.$labelPlacementDistanceItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return (
        (!this.edgeLabelingItem ||
        this.labelPlacementSideOfEdgeItem ===
          PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ON_EDGE)
      )
    }
  },

  $initPolylineEdgeRouterConfig: function() {
    this.$scopeItem = EdgeRouterScope.ROUTE_ALL_EDGES
    this.$optimizationStrategyItem = PolylineEdgeRouterConfig.EnumStrategies.BALANCED
    this.$monotonicRestrictionItem = PolylineEdgeRouterConfig.EnumMonotonyFlags.NONE
    this.$labelPlacementOrientationItem =
      PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.PARALLEL
    this.$labelPlacementAlongEdgeItem =
      PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.ANYWHERE
    this.$labelPlacementSideOfEdgeItem =
      PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ANYWHERE
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

    /**
     * Adds a mapper with a {@link PreferredPlacementDescriptor} that matches the given settings
     * to the mapper registry of the given graph. In addition, sets the label model of all edge labels to free
     * since that model can realizes any label placement calculated by a layout algorithm.
     */
    addPreferredPlacementDescriptor: function(
      graph,
      placeAlongEdge,
      sideOfEdge,
      orientation,
      distanceToEdge
    ) {
      const model = new FreeEdgeLabelModel()
      const descriptor = PolylineEdgeRouterConfig.createPreferredPlacementDescriptor(
        placeAlongEdge,
        sideOfEdge,
        orientation,
        distanceToEdge
      )

      graph.mapperRegistry.createConstantMapper(
        ILabel.$class,
        IEdgeLabelLayout.$class,
        LayoutGraphAdapter.EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY,
        descriptor
      )

      graph.edgeLabels.forEach(label => {
        graph.setLabelLayoutParameter(label, model.findBestParameter(label, model, label.layout))
      })
    },

    /**
     * Creates a new {@link PreferredPlacementDescriptor} that matches the given settings.
     * @return {PreferredPlacementDescriptor}
     */
    createPreferredPlacementDescriptor: function(
      placeAlongEdge,
      sideOfEdge,
      orientation,
      distanceToEdge
    ) {
      const descriptor = new PreferredPlacementDescriptor()

      switch (sideOfEdge) {
        case PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ANYWHERE:
          descriptor.sideOfEdge = LabelPlacements.ANYWHERE
          break
        case PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ON_EDGE:
          descriptor.sideOfEdge = LabelPlacements.ON_EDGE
          break
        case PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.LEFT:
          descriptor.sideOfEdge = LabelPlacements.LEFT_OF_EDGE
          break
        case PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.RIGHT:
          descriptor.sideOfEdge = LabelPlacements.RIGHT_OF_EDGE
          break
        case PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.LEFT_OR_RIGHT:
          descriptor.sideOfEdge = LabelPlacements.LEFT_OF_EDGE | LabelPlacements.RIGHT_OF_EDGE
          break
        default:
          descriptor.sideOfEdge = LabelPlacements.ANYWHERE
          break
      }

      switch (placeAlongEdge) {
        case PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.ANYWHERE:
          descriptor.placeAlongEdge = LabelPlacements.ANYWHERE
          break
        case PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.AT_SOURCE:
          descriptor.placeAlongEdge = LabelPlacements.AT_SOURCE
          break
        case PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.AT_TARGET:
          descriptor.placeAlongEdge = LabelPlacements.AT_TARGET
          break
        case PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.CENTERED:
          descriptor.placeAlongEdge = LabelPlacements.AT_CENTER
          break
        default:
          descriptor.placeAlongEdge = LabelPlacements.ANYWHERE
          break
      }

      switch (orientation) {
        case PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.PARALLEL:
          descriptor.angle = 0.0
          descriptor.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
          break
        case PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.ORTHOGONAL:
          descriptor.angle = Math.PI / 2
          descriptor.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
          break
        case PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.HORIZONTAL:
          descriptor.angle = 0.0
          descriptor.angleReference = LabelAngleReferences.ABSOLUTE
          break
        case PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.VERTICAL:
          descriptor.angle = Math.PI / 2
          descriptor.angleReference = LabelAngleReferences.ABSOLUTE
          break
        default:
          descriptor.angle = 0.0
          descriptor.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
          break
      }

      descriptor.distanceToEdge = distanceToEdge
      return descriptor
    },

    /**
     * Specifies constants for the preferred placement along an edge used by layout configurations.
     */
    EnumLabelPlacementAlongEdge: new EnumDefinition(() => {
      return {
        ANYWHERE: 0,
        AT_SOURCE: 1,
        AT_TARGET: 2,
        CENTERED: 3
      }
    }),

    /**
     * Specifies constants for the preferred placement at a side of an edge used by layout configurations.
     */
    EnumLabelPlacementSideOfEdge: new EnumDefinition(() => {
      return {
        ANYWHERE: 0,
        ON_EDGE: 1,
        LEFT: 2,
        RIGHT: 3,
        LEFT_OR_RIGHT: 4
      }
    }),

    /**
     * Specifies constants for the orientation of an edge label used by layout configurations.
     */
    EnumLabelPlacementOrientation: new EnumDefinition(() => {
      return {
        PARALLEL: 0,
        ORTHOGONAL: 1,
        HORIZONTAL: 2,
        VERTICAL: 3
      }
    })
  }
})
