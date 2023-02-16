/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  AdjacencyTypes,
  BusRouter,
  BusRouterBusDescriptor,
  BusRouterData,
  Class,
  Edge,
  EdgeRouterScope,
  Enum,
  GenericLayoutData,
  GraphComponent,
  IEdge,
  ILayoutAlgorithm,
  LayoutData,
  LayoutGraph,
  LayoutGraphHider,
  LayoutStageBase,
  Mapper,
  RoutingPolicy,
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
import LayoutConfiguration from './LayoutConfiguration'

/**
 * Configuration options for the layout algorithm of the same name.
 */
const BusEdgeRouterConfig = (Class as any)('BusEdgeRouterConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('BusRouter')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore
    LayoutConfiguration.call(this)
    const router = new BusRouter()
    this.scopeItem = BusRouterScope.ALL
    this.busesItem = BusType.TAG
    this.gridEnabledItem = router.gridRouting
    this.gridSpacingItem = router.gridSpacing
    this.minDistanceToNodesItem = router.minimumDistanceToNode
    this.minDistanceToEdgesItem = router.minimumDistanceToEdge

    this.preferredBackboneCountItem = 1
    this.minimumBackboneLengthItem = router.minimumBackboneSegmentLength

    this.crossingCostItem = router.crossingCost
    this.crossingReroutingItem = router.rerouting
    this.minimumConnectionsCountItem = 6
    this.title = 'Bus Router'
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const router = new BusRouter()
    switch (this.scopeItem) {
      case BusRouterScope.ALL:
        router.scope = EdgeRouterScope.ROUTE_ALL_EDGES
        break
      case BusRouterScope.PARTIAL:
      case BusRouterScope.SUBSET:
      case BusRouterScope.SUBSET_BUS:
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

    if (this.scopeItem === BusRouterScope.PARTIAL) {
      return new HideNonOrthogonalEdgesStage(router)
    }

    return router
  },

  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
   */
  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: ILayoutAlgorithm
  ): LayoutData {
    const graph = graphComponent.graph
    const graphSelection = graphComponent.selection
    const scopePartial = this.scopeItem === BusRouterScope.PARTIAL
    const busIds = new Mapper<IEdge, BusRouterBusDescriptor>()
    const layoutData = new BusRouterData({
      edgeDescriptors: busIds
    })

    graph.edges.forEach(edge => {
      const isFixed =
        scopePartial &&
        !graphSelection.isSelected(edge.sourceNode!) &&
        !graphSelection.isSelected(edge.targetNode!)
      const id = this.getBusId(edge, this.busesItem)
      const descriptor = new BusRouterBusDescriptor(id, isFixed)
      descriptor.routingPolicy = this.routingPolicyItem
      busIds.set(edge, descriptor)
    })

    const selectedIds = new Set<any>()
    switch (this.scopeItem) {
      case BusRouterScope.SUBSET:
        layoutData.affectedEdges.delegate = edge => graphSelection.isSelected(edge)
        break
      case BusRouterScope.SUBSET_BUS:
        graph.edges
          .filter(item => graphSelection.isSelected(item))
          .forEach(edge => {
            const busId = busIds.get(edge)!.busId
            if (!selectedIds.has(busId)) {
              selectedIds.add(busId)
            }
          })

        layoutData.affectedEdges.delegate = edge => selectedIds.has(busIds.get(edge)!.busId)
        break
      case BusRouterScope.PARTIAL: {
        graph.nodes
          .filter(item => graphSelection.isSelected(item))
          .flatMap(node => graph.edgesAt(node, AdjacencyTypes.ALL))
          .forEach(edge => {
            const busId = busIds.get(edge)!.busId
            if (!selectedIds.has(busId)) {
              selectedIds.add(busId)
            }
          })

        const hideNonOrthogonalEdgesLayoutData = new GenericLayoutData()
        hideNonOrthogonalEdgesLayoutData.addNodeItemCollection(
          HideNonOrthogonalEdgesStage.SELECTED_NODES_DP_KEY,
          graphSelection.selectedNodes
        )
        layoutData.affectedEdges.delegate = edge => selectedIds.has(busIds.get(edge)!.busId)

        return layoutData.combineWith(hideNonOrthogonalEdgesLayoutData)
      }
    }

    return layoutData
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
  SelectionGroup: {
    $meta: function () {
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
    $meta: function () {
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
    $meta: function () {
      return [
        OptionGroupAttribute('DescriptionGroup', 10),
        ComponentAttribute(Components.HTML_BLOCK),
        TypeAttribute(YString.$class)
      ]
    },
    get: function () {
      return "<p style='margin-top:0'>Orthogonal bus-style edge routing combines the (likely confusing) mass of edges in parts of a diagram where each node is connected to each other node in a concise, orthogonal tree-like structure. This algorithm does not change the positions of the nodes.</p><p>The algorithm aims to find routes where all edge paths share as much way as possible. It yields long line segments where ideally all but the first and last segments of all edge paths are drawn on top of each other, with short connections branching off to the nodes. The short connections bundle the respective first or last segments of a node's incident edges.</p>"
    }
  },

  /** @type {BusRouterScope} */
  scopeItem: {
    $meta: function () {
      return [
        LabelAttribute('Scope', '#/api/BusRouter#BusRouter-property-scope'),
        OptionGroupAttribute('LayoutGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['All Edges', BusRouterScope.ALL],
            ['Selected Edges', BusRouterScope.SUBSET],
            ['Buses of Selected Edges', BusRouterScope.SUBSET_BUS],
            ['Reroute to Selected Nodes', BusRouterScope.PARTIAL]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {BusType} */
  busesItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Bus Membership',
          '#/api/BusRouterData#BusRouterData-property-edgeDescriptors'
        ),
        OptionGroupAttribute('LayoutGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Single Bus', BusType.SINGLE],
            ['Defined by First Label', BusType.LABEL],
            ['Defined by User Tag', BusType.TAG]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  gridEnabledItem: {
    $meta: function () {
      return [
        LabelAttribute('Route on Grid', '#/api/BusRouter#BusRouter-property-gridRouting'),
        OptionGroupAttribute('LayoutGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  gridSpacingItem: {
    $meta: function () {
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
    value: 2
  },

  /** @type {boolean} */
  shouldDisableGridSpacingItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return !this.gridEnabledItem
    }
  },

  /** @type {number} */
  minDistanceToNodesItem: {
    $meta: function () {
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
    value: 0
  },

  /** @type {number} */
  minDistanceToEdgesItem: {
    $meta: function () {
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
    value: 0
  },

  /** @type {number} */
  preferredBackboneCountItem: {
    $meta: function () {
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
    value: 1
  },

  /** @type {number} */
  minimumBackboneLengthItem: {
    $meta: function () {
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
    value: 1
  },

  /** @type {number} */
  routingPolicyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Routing Policy',
          '#/api/BusRouterBusDescriptor#BusRouterBusDescriptor-property-routingPolicy'
        ),
        OptionGroupAttribute('RoutingGroup', 5),
        EnumValuesAttribute().init({
          values: [
            ['Always', RoutingPolicy.ALWAYS],
            ['Path As Needed', RoutingPolicy.PATH_AS_NEEDED]
          ]
        }),
        TypeAttribute(RoutingPolicy.$class)
      ]
    },
    value: RoutingPolicy.ALWAYS
  },

  /** @type {number} */
  crossingCostItem: {
    $meta: function () {
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
    value: 0
  },

  /** @type {boolean} */
  crossingReroutingItem: {
    $meta: function () {
      return [
        LabelAttribute('Reroute Crossing Edges', '#/api/BusRouter#BusRouter-property-rerouting'),
        OptionGroupAttribute('RoutingGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  minimumConnectionsCountItem: {
    $meta: function () {
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
    value: 0
  },

  /**
   * @returns the bus id of the given edge considering the given bus determination type
   */
  getBusId: function (edge: IEdge, busType: BusType): any {
    switch (busType) {
      case BusType.LABEL:
        return edge.labels.at(0)?.text ?? ''
      case BusType.TAG:
        return edge.tag
      default:
        return SINGLE_BUS_ID
    }
  }
})

const SINGLE_BUS_ID = {}

export enum BusType {
  SINGLE,
  LABEL,
  TAG
}

export enum BusRouterScope {
  ALL,
  SUBSET,
  SUBSET_BUS,
  PARTIAL
}

class HideNonOrthogonalEdgesStage extends LayoutStageBase {
  static get SELECTED_NODES_DP_KEY() {
    return 'BusEdgeRouterConfig.SELECTED_NODES_DP_KEY'
  }

  applyLayout(graph: LayoutGraph): void {
    const affectedEdges = graph.getDataProvider(BusRouter.DEFAULT_AFFECTED_EDGES_DP_KEY)
    const selectedNodes = graph.getDataProvider(HideNonOrthogonalEdgesStage.SELECTED_NODES_DP_KEY)
    const hider = new LayoutGraphHider(graph)
    const hiddenEdges = new Set<Edge>()
    graph.edges.forEach(edge => {
      if (
        affectedEdges!.getBoolean(edge) &&
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
