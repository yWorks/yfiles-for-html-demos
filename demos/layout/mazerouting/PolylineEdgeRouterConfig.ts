/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgeRouterData,
  EdgeRouterEdgeRoutingStyle,
  EdgeRouterScope,
  Enum,
  FreeEdgeLabelModel,
  GenericLabeling,
  GraphComponent,
  Grid,
  IGraph,
  ILayoutAlgorithm,
  LabelAngleReferences,
  LabelPlacements,
  LayoutData,
  LayoutExecutor,
  MinimumNodeSizeStage,
  MonotonicPathRestriction,
  PenaltySettings,
  PreferredPlacementDescriptor,
  SequentialLayout,
  TimeSpan,
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
} from '../../resources/demo-option-editor'

/**
 * Configuration options for the the polyline edge router.
 */
const PolylineEdgeRouterConfig = (Class as any)('PolylineEdgeRouterConfig', {
  $meta: [LabelAttribute('PolylineEdgeRouter')],

  /**
   * A guard to prevent running multiple layout calculations at the same time.
   * @type {boolean}
   */
  $layoutRunning: false,

  $affectedItems: null,

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    const router = new EdgeRouter()

    this.scopeItem = router.scope
    this.optimizationStrategyItem = Strategies.BALANCED
    this.monotonicRestrictionItem = MonotonyFlags.NONE
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

    this.octilinearRoutingStyleItem =
      descriptor.routingStyle === EdgeRouterEdgeRoutingStyle.OCTILINEAR
    this.preferredOctilinearSegmentLengthItem = descriptor.preferredOctilinearSegmentLength

    this.considerNodeLabelsItem = router.considerNodeLabels
    this.considerEdgeLabelsItem = router.considerEdgeLabels
    this.edgeLabelingItem = false
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
  },

  /**
   * Applies this configuration to the given {@link GraphComponent}.
   * @param graphComponent The {@link GraphComponent} to apply the configuration on
   * @return A promise which resolves after the layout is applied without errors.
   */
  apply: async function (graphComponent: GraphComponent): Promise<void> {
    if (this.$layoutRunning) {
      return Promise.reject(new Error('Edge routing already in progress'))
    }

    const layout = this.createConfiguredLayout(graphComponent)

    const layoutData = this.createConfiguredLayoutData(graphComponent, layout)

    // configure the LayoutExecutor
    const layoutExecutor = new LayoutExecutor({
      graphComponent,
      layout: new MinimumNodeSizeStage(layout),
      duration: '0.5s',
      animateViewport: true
    })

    // set the cancel duration for the layout computation to 20s
    layoutExecutor.abortHandler.cancelDuration = TimeSpan.from('20s')

    // set the layout data to the LayoutExecutor
    if (layoutData) {
      layoutExecutor.layoutData = layoutData
    }
    try {
      // start the LayoutExecutor with finish and error handling code
      await layoutExecutor.start()
    } catch (err) {
      if (err instanceof Error && err.name === 'AlgorithmAbortedError') {
        alert(
          'The layout computation was canceled because the maximum configured runtime of 20 seconds was exceeded.'
        )
      } else {
        const reporter = (window as any).reportError
        if (typeof reporter === 'function') {
          reporter(err)
        }
      }
    } finally {
      this.$layoutRunning = false
    }
  },

  /**
   * Creates and configures a routing algorithm instance.
   * @param graphComponent The given graph component
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const router = new EdgeRouter()
    const descriptor = router.defaultEdgeLayoutDescriptor

    router.scope = this.scopeItem

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

    descriptor.routingStyle = this.octilinearRoutingStyleItem
      ? EdgeRouterEdgeRoutingStyle.OCTILINEAR
      : EdgeRouterEdgeRoutingStyle.ORTHOGONAL
    descriptor.preferredOctilinearSegmentLength = this.preferredOctilinearSegmentLengthItem
    router.maximumDuration = this.maximumDurationItem * 1000

    const layout = new SequentialLayout()
    layout.appendLayout(router)

    if (this.edgeLabelingItem) {
      const genericLabeling = new GenericLabeling()
      genericLabeling.placeEdgeLabels = true
      genericLabeling.placeNodeLabels = false
      genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
      layout.appendLayout(genericLabeling)
    }

    return layout
  },

  /**
   * Creates the layout data of the configuration.
   * @param graphComponent The given graphComponent
   */
  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: ILayoutAlgorithm
  ): LayoutData {
    const layoutData = new EdgeRouterData()

    const selection = graphComponent.selection
    if (this.scopeItem === EdgeRouterScope.ROUTE_EDGES_AT_AFFECTED_NODES) {
      layoutData.affectedNodes.delegate = this.$affectedItems
        ? this.$affectedItems
        : node => selection.isSelected(node)
    } else if (this.scopeItem === EdgeRouterScope.ROUTE_AFFECTED_EDGES) {
      layoutData.affectedEdges.delegate = this.$affectedItems
        ? this.$affectedItems
        : edge => selection.isSelected(edge)
    } else {
      layoutData.affectedEdges.delegate = () => true
      layoutData.affectedNodes.delegate = () => true
    }

    this.addPreferredPlacementDescriptor(graphComponent.graph, layoutData)

    return layoutData
  },

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
        LabelAttribute('Layout'),
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
  OctilinearGroup: {
    $meta: function () {
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
    get: function (): string {
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
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeRouterEdgeLayoutDescriptor-property-penaltySettings'
        ),
        OptionGroupAttribute('LayoutGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Balanced', Strategies.BALANCED],
            ['Less Bends', Strategies.MINIMIZE_BENDS],
            ['Less Crossings', Strategies.MINIMIZE_CROSSINGS],
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
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeRouterEdgeLayoutDescriptor-property-monotonicPathRestriction'
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
    value: null
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
  minimumEdgeToEdgeDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge to Edge',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeRouterEdgeLayoutDescriptor-property-minimumEdgeToEdgeDistance'
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
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeRouterEdgeLayoutDescriptor-property-minimumNodeCornerDistance'
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
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeRouterEdgeLayoutDescriptor-property-minimumFirstSegmentLength'
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
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeRouterEdgeLayoutDescriptor-property-minimumLastSegmentLength'
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
  shouldDisableGridSpacingItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.gridEnabledItem === false
    }
  },

  /** @type {boolean} */
  octilinearRoutingStyleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Octilinear Routing',
          '#/api/EdgeRouterEdgeRoutingStyle#EdgeRoutingStyle-field-OCTILINEAR'
        ),
        OptionGroupAttribute('OctilinearGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  preferredOctilinearSegmentLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Preferred Octilinear Segment Length',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeRouterEdgeLayoutDescriptor-property-preferredOctilinearSegmentLength'
        ),
        OptionGroupAttribute('OctilinearGroup', 20),
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
  shouldDisablePreferredOctilinearSegmentLengthItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.octilinearRoutingStyleItem === false
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
        LabelAttribute('Edge Labeling', '#/api/GenericLabeling'),
        OptionGroupAttribute('EdgePropertiesGroup', 20),
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
        OptionGroupAttribute('EdgePropertiesGroup', 30),
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
          '#/api/EdgeRouterData#EdgeRouterData-property-edgeLabelPreferredPlacement'
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
            ['At Target', LabelPlacementAlongEdge.AT_TARGET],
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
  },

  /**
   * Adds a {@link PreferredPlacementDescriptor} that matches the given settings
   * to given layout data. In addition, sets the label model of all edge labels to free
   * since that model can realizes any label placement calculated by a layout algorithm.
   */
  addPreferredPlacementDescriptor: function (graph: IGraph, layoutData: EdgeRouterData): void {
    //specify the preferred placement descriptor on the layout data (each edge label gets the same settings)
    layoutData.edgeLabelPreferredPlacement.constant = this.createPreferredPlacementDescriptor()

    //specify free label model
    const model = new FreeEdgeLabelModel()
    for (const label of graph.edgeLabels) {
      graph.setLabelLayoutParameter(label, model.findBestParameter(label, model, label.layout))
    }
  },

  /**
   * Creates a new {@link PreferredPlacementDescriptor} that matches the current settings.
   * @return {PreferredPlacementDescriptor}
   */
  createPreferredPlacementDescriptor: function (): PreferredPlacementDescriptor {
    const descriptor = new PreferredPlacementDescriptor()

    switch (this.labelPlacementSideOfEdgeItem) {
      case LabelPlacementSideOfEdge.ANYWHERE:
        descriptor.sideOfEdge = LabelPlacements.ANYWHERE
        break
      case LabelPlacementSideOfEdge.ON_EDGE:
        descriptor.sideOfEdge = LabelPlacements.ON_EDGE
        break
      case LabelPlacementSideOfEdge.LEFT:
        descriptor.sideOfEdge = LabelPlacements.LEFT_OF_EDGE
        break
      case LabelPlacementSideOfEdge.RIGHT:
        descriptor.sideOfEdge = LabelPlacements.RIGHT_OF_EDGE
        break
      case LabelPlacementSideOfEdge.LEFT_OR_RIGHT:
        descriptor.sideOfEdge = LabelPlacements.LEFT_OF_EDGE | LabelPlacements.RIGHT_OF_EDGE
        break
      default:
        descriptor.sideOfEdge = LabelPlacements.ANYWHERE
        break
    }

    switch (this.labelPlacementAlongEdgeItem) {
      case LabelPlacementAlongEdge.ANYWHERE:
        descriptor.placeAlongEdge = LabelPlacements.ANYWHERE
        break
      case LabelPlacementAlongEdge.AT_SOURCE:
        descriptor.placeAlongEdge = LabelPlacements.AT_SOURCE
        break
      case LabelPlacementAlongEdge.AT_TARGET:
        descriptor.placeAlongEdge = LabelPlacements.AT_TARGET
        break
      case LabelPlacementAlongEdge.CENTERED:
        descriptor.placeAlongEdge = LabelPlacements.AT_CENTER
        break
      default:
        descriptor.placeAlongEdge = LabelPlacements.ANYWHERE
        break
    }

    switch (this.labelPlacementOrientationItem) {
      case LabelPlacementOrientation.PARALLEL:
        descriptor.angle = 0.0
        descriptor.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
        break
      case LabelPlacementOrientation.ORTHOGONAL:
        descriptor.angle = Math.PI / 2
        descriptor.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
        break
      case LabelPlacementOrientation.HORIZONTAL:
        descriptor.angle = 0.0
        descriptor.angleReference = LabelAngleReferences.ABSOLUTE
        break
      case LabelPlacementOrientation.VERTICAL:
        descriptor.angle = Math.PI / 2
        descriptor.angleReference = LabelAngleReferences.ABSOLUTE
        break
      default:
        descriptor.angle = 0.0
        descriptor.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
        break
    }

    descriptor.distanceToEdge = this.labelPlacementDistanceItem
    return descriptor
  }
})
export default PolylineEdgeRouterConfig

enum Strategies {
  BALANCED,
  MINIMIZE_BENDS,
  MINIMIZE_CROSSINGS,
  MINIMIZE_EDGE_LENGTH
}

enum MonotonyFlags {
  NONE,
  HORIZONTAL,
  VERTICAL,
  BOTH
}

/**
 * Specifies constants for the preferred placement along an edge used by layout configurations.
 */
enum LabelPlacementAlongEdge {
  ANYWHERE,
  AT_SOURCE,
  AT_TARGET,
  CENTERED
}

/**
 * Specifies constants for the preferred placement at a side of an edge used by layout configurations.
 */
enum LabelPlacementSideOfEdge {
  ANYWHERE,
  ON_EDGE,
  LEFT,
  RIGHT,
  LEFT_OR_RIGHT
}

/**
 * Specifies constants for the orientation of an edge label used by layout configurations.
 */
enum LabelPlacementOrientation {
  PARALLEL,
  ORTHOGONAL,
  HORIZONTAL,
  VERTICAL
}
