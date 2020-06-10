/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  AdjacencyTypes,
  BusRouter,
  BusRouterBusDescriptor,
  BusRouterData,
  Class,
  EdgeRouterScope,
  EnumDefinition,
  GraphComponent,
  IEdge,
  LayoutGraphHider,
  LayoutStageBase,
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
import LayoutConfiguration from './LayoutConfiguration.js'

/**
 * Configuration options for the layout algorithm of the same name.
 */
const BusEdgeRouterConfig = Class('BusEdgeRouterConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('BusRouter')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function() {
    LayoutConfiguration.call(this)
    const router = new BusRouter()
    this.scopeItem = BusEdgeRouterConfig.EnumScope.ALL
    this.busesItem = BusEdgeRouterConfig.EnumBuses.LABEL
    this.gridEnabledItem = router.gridRouting
    this.gridSpacingItem = router.gridSpacing
    this.minDistanceToNodesItem = router.minimumDistanceToNode
    this.minDistanceToEdgesItem = router.minimumDistanceToEdge

    this.preferredBackboneCountItem = 1
    this.minimumBackboneLengthItem = router.minimumBackboneSegmentLength

    this.crossingCostItem = router.crossingCost
    this.crossingReroutingItem = router.rerouting
    this.minimumConnectionsCountItem = 6
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout algorithm.
   */
  createConfiguredLayout: function(graphComponent) {
    const router = new BusRouter()
    switch (this.scopeItem) {
      case BusEdgeRouterConfig.EnumScope.ALL:
        router.scope = EdgeRouterScope.ROUTE_ALL_EDGES
        break
      case BusEdgeRouterConfig.EnumScope.PARTIAL:
      case BusEdgeRouterConfig.EnumScope.SUBSET:
      case BusEdgeRouterConfig.EnumScope.SUBSET_BUS:
        router.scope = EdgeRouterScope.ROUTE_AFFECTED_EDGES
        break
      default:
        router.scope = EdgeRouterScope.ROUTE_ALL_EDGES
        break
    }
    router.gridRouting = this.gridEnabledItem
    router.gridSpacing = this.gridSpacingItem
    router.minimumDistanceToNode = this.minDistanceToNodesItem
    router.minimumDistanceToEdge = this.minDistanceToEdgesItem
    router.preferredBackboneSegmentCount = this.preferredBackboneCountItem
    router.minimumBackboneSegmentLength = this.minimumBackboneLengthItem
    router.minimumBusConnectionsCount = this.minimumConnectionsCountItem
    router.crossingCost = this.crossingCostItem
    router.rerouting = this.crossingReroutingItem

    if (this.scopeItem === BusEdgeRouterConfig.EnumScope.PARTIAL) {
      return new HideNonOrthogonalEdgesStage(router)
    }

    return router
  },

  /**
   * Creates and configures the layout data.
   * @return {LayoutData} The configured layout data.
   */
  createConfiguredLayoutData: function(graphComponent, layout) {
    const graph = graphComponent.graph
    const graphSelection = graphComponent.selection
    const scopePartial = this.scopeItem === BusEdgeRouterConfig.EnumScope.PARTIAL

    const busIds = graph.mapperRegistry.createMapper(BusRouter.EDGE_DESCRIPTOR_DP_KEY)

    graph.edges.forEach(edge => {
      const isFixed =
        scopePartial &&
        !graphSelection.isSelected(edge.sourceNode) &&
        !graphSelection.isSelected(edge.targetNode)
      const id = BusEdgeRouterConfig.getBusId(edge, this.busesItem)
      busIds.set(edge, new BusRouterBusDescriptor(id, isFixed))
    })

    const selectedIds = new Set()

    const layoutData = new BusRouterData()
    switch (this.scopeItem) {
      case BusEdgeRouterConfig.EnumScope.SUBSET:
        layoutData.affectedEdges = edge => graphSelection.isSelected(edge)
        break
      case BusEdgeRouterConfig.EnumScope.SUBSET_BUS:
        graph.edges
          .filter(item => graphSelection.isSelected(item))
          .forEach(edge => {
            const busId = busIds.get(edge).busId

            if (!selectedIds.has(busId)) {
              selectedIds.add(busId)
            }
          })

        layoutData.affectedEdges = edge => selectedIds.has(busIds.get(edge).busId)
        break
      case BusEdgeRouterConfig.EnumScope.PARTIAL:
        graph.nodes
          .filter(item => graphSelection.isSelected(item))
          .flatMap(node => graph.edgesAt(node, AdjacencyTypes.ALL))
          .forEach(edge => {
            const busId = busIds.get(edge).busId
            if (!selectedIds.has(busId)) {
              selectedIds.add(busId)
            }
          })

        graph.mapperRegistry.createDelegateMapper(
          IEdge.$class,
          YBoolean.$class,
          HideNonOrthogonalEdgesStage.SELECTED_NODES_DP_KEY,
          node => graphSelection.isSelected(node)
        )

        layoutData.affectedEdges = edge => {
          return selectedIds.has(busIds.get(edge).busId)
        }
        break
    }

    return layoutData
  },

  /**
   * Called after the layout animation is done.
   * @see Overrides {@link LayoutConfiguration#postProcess}
   */
  postProcess: function(graphComponent) {
    graphComponent.graph.mapperRegistry.removeMapper(BusRouter.EDGE_DESCRIPTOR_DP_KEY)
    graphComponent.graph.mapperRegistry.removeMapper(BusRouter.DEFAULT_AFFECTED_EDGES_DP_KEY)
  },

  // ReSharper disable UnusedMember.Global
  // ReSharper disable InconsistentNaming
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
        LabelAttribute('General'),
        OptionGroupAttribute('RootGroup', 10),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  SelectionGroup: {
    $meta: function() {
      return [
        LabelAttribute('Backbone Selection'),
        OptionGroupAttribute('RootGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  RoutingGroup: {
    $meta: function() {
      return [
        LabelAttribute('Routing and Recombination'),
        OptionGroupAttribute('RootGroup', 30),
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
      return "<p style='margin-top:0'>Orthogonal bus-style edge routing combines the (likely confusing) mass of edges in parts of a diagram where each node is connected to each other node in a concise, orthogonal tree-like structure. This algorithm does not change the positions of the nodes.</p><p>The algorithm aims to find routes where all edge paths share as much way as possible. It yields long line segments where ideally all but the first and last segments of all edge paths are drawn on top of each other, with short connections branching off to the nodes. The short connections bundle the respective first or last segments of a node's incident edges.</p>"
    }
  },

  /**
   * Backing field for below property
   * @type {BusEdgeRouterConfig.EnumScope}
   */
  $scopeItem: null,

  /** @type {BusEdgeRouterConfig.EnumScope} */
  scopeItem: {
    $meta: function() {
      return [
        LabelAttribute('Scope', '#/api/BusRouter#BusRouter-property-scope'),
        OptionGroupAttribute('LayoutGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['All Edges', BusEdgeRouterConfig.EnumScope.ALL],
            ['Selected Edges', BusEdgeRouterConfig.EnumScope.SUBSET],
            ['Buses of Selected Edges', BusEdgeRouterConfig.EnumScope.SUBSET_BUS],
            ['Reroute to Selected Nodes', BusEdgeRouterConfig.EnumScope.PARTIAL]
          ]
        }),
        TypeAttribute(BusEdgeRouterConfig.EnumScope.$class)
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
   * @type {BusEdgeRouterConfig.EnumBuses}
   */
  $busesItem: null,

  /** @type {BusEdgeRouterConfig.EnumBuses} */
  busesItem: {
    $meta: function() {
      return [
        LabelAttribute('Bus Membership', '#/api/BusRouter#BusRouter-field-EDGE_DESCRIPTOR_DP_KEY'),
        OptionGroupAttribute('LayoutGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Single Bus', BusEdgeRouterConfig.EnumBuses.SINGLE],
            ['Defined by First Label', BusEdgeRouterConfig.EnumBuses.LABEL],
            ['Defined by User Tag', BusEdgeRouterConfig.EnumBuses.TAG]
          ]
        }),
        TypeAttribute(BusEdgeRouterConfig.EnumBuses.$class)
      ]
    },
    get: function() {
      return this.$busesItem
    },
    set: function(value) {
      this.$busesItem = value
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
        LabelAttribute('Route on Grid', '#/api/BusRouter#BusRouter-property-gridRouting'),
        OptionGroupAttribute('LayoutGroup', 30),
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
        LabelAttribute('Grid Spacing', '#/api/BusRouter#BusRouter-property-gridSpacing'),
        OptionGroupAttribute('LayoutGroup', 40),
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
      return !this.gridEnabledItem
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minDistanceToNodesItem: 0,

  /** @type {number} */
  minDistanceToNodesItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Node Distance',
          '#/api/BusRouter#BusRouter-property-minimumDistanceToNode'
        ),
        OptionGroupAttribute('LayoutGroup', 50),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minDistanceToNodesItem
    },
    set: function(value) {
      this.$minDistanceToNodesItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minDistanceToEdgesItem: 0,

  /** @type {number} */
  minDistanceToEdgesItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Edge Distance',
          '#/api/BusRouter#BusRouter-property-minimumDistanceToEdge'
        ),
        OptionGroupAttribute('LayoutGroup', 60),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minDistanceToEdgesItem
    },
    set: function(value) {
      this.$minDistanceToEdgesItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $preferredBackboneCountItem: 0,

  /** @type {number} */
  preferredBackboneCountItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Preferred Segment Count',
          '#/api/BusRouter#BusRouter-property-preferredBackboneSegmentCount'
        ),
        OptionGroupAttribute('SelectionGroup', 10),
        MinMaxAttribute().init({
          min: 1,
          max: 10
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$preferredBackboneCountItem
    },
    set: function(value) {
      this.$preferredBackboneCountItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumBackboneLengthItem: 0,

  /** @type {number} */
  minimumBackboneLengthItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Segment Length',
          '#/api/BusRouter#BusRouter-property-minimumBackboneSegmentLength'
        ),
        OptionGroupAttribute('SelectionGroup', 20),
        MinMaxAttribute().init({
          min: 1,
          max: 500
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumBackboneLengthItem
    },
    set: function(value) {
      this.$minimumBackboneLengthItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $crossingCostItem: 0,

  /** @type {number} */
  crossingCostItem: {
    $meta: function() {
      return [
        LabelAttribute('Crossing Cost', '#/api/BusRouter#BusRouter-property-crossingCost'),
        OptionGroupAttribute('RoutingGroup', 10),
        MinMaxAttribute().init({
          min: 1,
          max: 50
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$crossingCostItem
    },
    set: function(value) {
      this.$crossingCostItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $crossingReroutingItem: false,

  /** @type {boolean} */
  crossingReroutingItem: {
    $meta: function() {
      return [
        LabelAttribute('Reroute Crossing Edges', '#/api/BusRouter#BusRouter-property-rerouting'),
        OptionGroupAttribute('RoutingGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$crossingReroutingItem
    },
    set: function(value) {
      this.$crossingReroutingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumConnectionsCountItem: 0,

  /** @type {number} */
  minimumConnectionsCountItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Bus Connections Count',
          '#/api/BusRouter#BusRouter-property-minimumBusConnectionsCount'
        ),
        OptionGroupAttribute('RoutingGroup', 30),
        MinMaxAttribute().init({
          min: 1,
          max: 20
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumConnectionsCountItem
    },
    set: function(value) {
      this.$minimumConnectionsCountItem = value
    }
  },

  $static: {
    /**
     * @return {Object}
     */
    getBusId: function(e, busDetermination) {
      switch (busDetermination) {
        case BusEdgeRouterConfig.EnumBuses.LABEL:
          return e.labels.size > 0 ? e.labels.elementAt(0).text : ''
        case BusEdgeRouterConfig.EnumBuses.TAG:
          return e.tag
        default:
          return BusEdgeRouterConfig.SINGLE_BUS_ID
      }
    },

    /**
     * @type {Object}
     */
    SINGLE_BUS_ID: null,

    // ReSharper restore UnusedMember.Global
    // ReSharper restore InconsistentNaming
    EnumScope: new EnumDefinition(() => {
      return {
        ALL: 0,
        SUBSET: 1,
        SUBSET_BUS: 2,
        PARTIAL: 3
      }
    }),

    EnumBuses: new EnumDefinition(() => {
      return {
        SINGLE: 0,
        LABEL: 1,
        TAG: 2
      }
    }),

    $clinit: function() {
      BusEdgeRouterConfig.SINGLE_BUS_ID = {}
    }
  }
})

class HideNonOrthogonalEdgesStage extends LayoutStageBase {
  static get SELECTED_NODES_DP_KEY() {
    return 'BusEdgeRouterConfig.SELECTED_NODES_DP_KEY'
  }

  applyLayout(/** LayoutGraph */ graph) {
    const affectedEdges = graph.getDataProvider(BusRouter.DEFAULT_AFFECTED_EDGES_DP_KEY)
    const selectedNodes = graph.getDataProvider(HideNonOrthogonalEdgesStage.SELECTED_NODES_DP_KEY)
    const hider = new LayoutGraphHider(graph)
    const hiddenEdges = new Set()
    graph.edges.forEach(edge => {
      if (
        affectedEdges.getBoolean(edge) &&
        selectedNodes !== null &&
        !selectedNodes.getBoolean(edge.source) &&
        !selectedNodes.getBoolean(edge.target)
      ) {
        const path = graph.getPath(edge).toArray()
        for (let i = 1; i < path.length; i++) {
          const p1 = path[i - 1]
          const p2 = path[i]
          if (Math.abs(p1.x - p2.x) >= 0.0001 && Math.abs(p1.y - p2.y) >= 0.0001) {
            hiddenEdges.add(edge)
          }
        }
      }
    })
    hiddenEdges.forEach(edge => {
      hider.hide(edge)
    })

    super.applyLayoutCore(graph)

    hider.unhideEdges()
  }
}
export default BusEdgeRouterConfig
