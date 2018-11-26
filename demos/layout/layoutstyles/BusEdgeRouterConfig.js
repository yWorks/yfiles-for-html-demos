/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

/*eslint-disable*/
;(function(r) {
  ;(function(f) {
    if ('function' === typeof define && define.amd) {
      define(['yfiles/lang', 'yfiles/view-component', 'LayoutConfiguration.js'], f)
    } else {
      f(r.yfiles.lang, r.yfiles)
    }
  })((lang, yfiles) => {
    const demo = yfiles.module('demo')
    yfiles.module('demo', exports => {
      /**
       * Configuration options for the layout algorithm of the same name.
       * @class
       * @extends demo.LayoutConfiguration
       */
      exports.BusEdgeRouterConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.BusEdgeRouterConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('BusRouter')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)
            const router = new yfiles.router.BusRouter()
            this.scopeItem = demo.BusEdgeRouterConfig.EnumScope.ALL
            this.busesItem = demo.BusEdgeRouterConfig.EnumBuses.LABEL
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
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout algorithm.
           */
          createConfiguredLayout: function(graphComponent) {
            const router = new yfiles.router.BusRouter()
            switch (this.scopeItem) {
              case demo.BusEdgeRouterConfig.EnumScope.ALL:
                router.scope = yfiles.router.Scope.ROUTE_ALL_EDGES
                break
              case demo.BusEdgeRouterConfig.EnumScope.PARTIAL:
              case demo.BusEdgeRouterConfig.EnumScope.SUBSET:
              case demo.BusEdgeRouterConfig.EnumScope.SUBSET_BUS:
                router.scope = yfiles.router.Scope.ROUTE_AFFECTED_EDGES
                break
              default:
                router.scope = yfiles.router.Scope.ROUTE_ALL_EDGES
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

            if (this.scopeItem === demo.BusEdgeRouterConfig.EnumScope.PARTIAL) {
              return new HideNonOrthogonalEdgesStage(router)
            }

            return router
          },

          /**
           * Creates and configures the layout data.
           * @return {yfiles.layout.LayoutData} The configured layout data.
           */
          createConfiguredLayoutData: function(graphComponent, layout) {
            const graph = graphComponent.graph
            const graphSelection = graphComponent.selection
            const scopePartial = this.scopeItem === demo.BusEdgeRouterConfig.EnumScope.PARTIAL

            const busIds = graph.mapperRegistry.createMapper(
              yfiles.router.BusRouter.EDGE_DESCRIPTOR_DP_KEY
            )

            graph.edges.forEach(edge => {
              const isFixed =
                scopePartial &&
                !graphSelection.isSelected(edge.sourceNode) &&
                !graphSelection.isSelected(edge.targetNode)
              const id = demo.BusEdgeRouterConfig.getBusId(edge, this.busesItem)
              busIds.set(edge, new yfiles.router.BusDescriptor(id, isFixed))
            })

            const selectedIds = new Set()

            const layoutData = new yfiles.router.BusRouterData()
            switch (this.scopeItem) {
              case demo.BusEdgeRouterConfig.EnumScope.SUBSET:
                layoutData.affectedEdges.delegate = edge => graphSelection.isSelected(edge)
                break
              case demo.BusEdgeRouterConfig.EnumScope.SUBSET_BUS:
                graph.edges.filter(item => graphSelection.isSelected(item)).forEach(edge => {
                  const busId = busIds.get(edge).busId

                  if (!selectedIds.has(busId)) {
                    selectedIds.add(busId)
                  }
                })

                layoutData.affectedEdges.delegate = edge => selectedIds.has(busIds.get(edge).busId)
                break
              case demo.BusEdgeRouterConfig.EnumScope.PARTIAL:
                graph.nodes
                  .filter(item => graphSelection.isSelected(item))
                  .selectMany(node => graph.edgesAt(node, yfiles.graph.AdjacencyTypes.ALL))
                  .forEach(edge => {
                    const busId = busIds.get(edge).busId
                    if (!selectedIds.has(busId)) {
                      selectedIds.add(busId)
                    }
                  })

                graph.mapperRegistry.createDelegateMapper(
                  yfiles.graph.IEdge.$class,
                  yfiles.lang.Boolean.$class,
                  HideNonOrthogonalEdgesStage.SELECTED_NODES_DP_KEY,
                  node => graphSelection.isSelected(node)
                )

                layoutData.affectedEdges.delegate = edge => {
                  return selectedIds.has(busIds.get(edge).busId)
                }
                break
            }

            return layoutData
          },

          /**
           * Called after the layout animation is done.
           * @see Overrides {@link demo.LayoutConfiguration#postProcess}
           */
          postProcess: function(graphComponent) {
            graphComponent.graph.mapperRegistry.removeMapper(
              yfiles.router.BusRouter.EDGE_DESCRIPTOR_DP_KEY
            )
            graphComponent.graph.mapperRegistry.removeMapper(
              yfiles.router.BusRouter.DEFAULT_AFFECTED_EDGES_DP_KEY
            )
          },

          // ReSharper disable UnusedMember.Global
          // ReSharper disable InconsistentNaming
          /** @type {demo.options.OptionGroup} */
          DescriptionGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Description'),
                demo.options.OptionGroupAttribute('RootGroup', 5),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          LayoutGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('General'),
                demo.options.OptionGroupAttribute('RootGroup', 10),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          SelectionGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Backbone Selection'),
                demo.options.OptionGroupAttribute('RootGroup', 20),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          RoutingGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Routing and Recombination'),
                demo.options.OptionGroupAttribute('RootGroup', 30),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {string} */
          descriptionText: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('DescriptionGroup', 10),
                demo.options.ComponentAttribute(demo.options.Components.HTML_BLOCK),
                demo.options.TypeAttribute(yfiles.lang.String.$class)
              ]
            },
            get: function() {
              return "<p style='margin-top:0'>Orthogonal bus-style edge routing combines the (likely confusing) mass of edges in parts of a diagram where each node is connected to each other node in a concise, orthogonal tree-like structure. This algorithm does not change the positions of the nodes.</p><p>The algorithm aims to find routes where all edge paths share as much way as possible. It yields long line segments where ideally all but the first and last segments of all edge paths are drawn on top of each other, with short connections branching off to the nodes. The short connections bundle the respective first or last segments of a node's incident edges.</p>"
            }
          },

          /**
           * Backing field for below property
           * @type {demo.BusEdgeRouterConfig.EnumScope}
           */
          $scopeItem: null,

          /** @type {demo.BusEdgeRouterConfig.EnumScope} */
          scopeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Scope',
                  '#/api/yfiles.router.BusRouter#BusRouter-property-scope'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['All Edges', demo.BusEdgeRouterConfig.EnumScope.ALL],
                    ['Selected Edges', demo.BusEdgeRouterConfig.EnumScope.SUBSET],
                    ['Buses of Selected Edges', demo.BusEdgeRouterConfig.EnumScope.SUBSET_BUS],
                    ['Reroute to Selected Nodes', demo.BusEdgeRouterConfig.EnumScope.PARTIAL]
                  ]
                }),
                demo.options.TypeAttribute(demo.BusEdgeRouterConfig.EnumScope.$class)
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
           * @type {demo.BusEdgeRouterConfig.EnumBuses}
           */
          $busesItem: null,

          /** @type {demo.BusEdgeRouterConfig.EnumBuses} */
          busesItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Bus Membership',
                  '#/api/yfiles.router.BusRouter#BusRouter-field-EDGE_DESCRIPTOR_DP_KEY'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Single Bus', demo.BusEdgeRouterConfig.EnumBuses.SINGLE],
                    ['Defined by First Label', demo.BusEdgeRouterConfig.EnumBuses.LABEL],
                    ['Defined by User Tag', demo.BusEdgeRouterConfig.EnumBuses.TAG]
                  ]
                }),
                demo.options.TypeAttribute(demo.BusEdgeRouterConfig.EnumBuses.$class)
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
                demo.options.LabelAttribute(
                  'Route on Grid',
                  '#/api/yfiles.router.BusRouter#BusRouter-property-gridRouting'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
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
                demo.options.LabelAttribute(
                  'Grid Spacing',
                  '#/api/yfiles.router.BusRouter#BusRouter-property-gridSpacing'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 40),
                demo.options.MinMaxAttribute().init({
                  min: 2,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
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
                demo.options.LabelAttribute(
                  'Minimum Node Distance',
                  '#/api/yfiles.router.BusRouter#BusRouter-property-minimumDistanceToNode'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 50),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
                demo.options.LabelAttribute(
                  'Minimum Edge Distance',
                  '#/api/yfiles.router.BusRouter#BusRouter-property-minimumDistanceToEdge'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 60),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
                demo.options.LabelAttribute(
                  'Preferred Segment Count',
                  '#/api/yfiles.router.BusRouter#BusRouter-property-preferredBackboneSegmentCount'
                ),
                demo.options.OptionGroupAttribute('SelectionGroup', 10),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 10
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
                demo.options.LabelAttribute(
                  'Minimum Segment Length',
                  '#/api/yfiles.router.BusRouter#BusRouter-property-minimumBackboneSegmentLength'
                ),
                demo.options.OptionGroupAttribute('SelectionGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 500
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
                demo.options.LabelAttribute(
                  'Crossing Cost',
                  '#/api/yfiles.router.BusRouter#BusRouter-property-crossingCost'
                ),
                demo.options.OptionGroupAttribute('RoutingGroup', 10),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 50
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
                demo.options.LabelAttribute(
                  'Reroute Crossing Edges',
                  '#/api/yfiles.router.BusRouter#BusRouter-property-rerouting'
                ),
                demo.options.OptionGroupAttribute('RoutingGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
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
                demo.options.LabelAttribute(
                  'Minimum Bus Connections Count',
                  '#/api/yfiles.router.BusRouter#BusRouter-property-minimumBusConnectionsCount'
                ),
                demo.options.OptionGroupAttribute('RoutingGroup', 30),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 20
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumConnectionsCountItem
            },
            set: function(value) {
              this.$minimumConnectionsCountItem = value
            }
          },

          /** @lends {demo.BusEdgeRouterConfig} */
          $static: {
            /**
             * @return {Object}
             */
            getBusId: function(e, busDetermination) {
              switch (busDetermination) {
                case demo.BusEdgeRouterConfig.EnumBuses.LABEL:
                  return e.labels.size > 0 ? e.labels.elementAt(0).text : ''
                case demo.BusEdgeRouterConfig.EnumBuses.TAG:
                  return e.tag
                default:
                  return demo.BusEdgeRouterConfig.SINGLE_BUS_ID
              }
            },

            /**
             * @type {Object}
             */
            SINGLE_BUS_ID: null,

            // ReSharper restore UnusedMember.Global
            // ReSharper restore InconsistentNaming
            EnumScope: new yfiles.lang.EnumDefinition(() => {
              return {
                ALL: 0,
                SUBSET: 1,
                SUBSET_BUS: 2,
                PARTIAL: 3
              }
            }),

            EnumBuses: new yfiles.lang.EnumDefinition(() => {
              return {
                SINGLE: 0,
                LABEL: 1,
                TAG: 2
              }
            }),

            $clinit: function() {
              demo.BusEdgeRouterConfig.SINGLE_BUS_ID = {}
            }
          }
        }
      })
    })

    class HideNonOrthogonalEdgesStage extends yfiles.layout.LayoutStageBase {
      constructor(/**yfiles.layout.ILayoutAlgorithm*/ layout) {
        super(layout)
      }

      static get SELECTED_NODES_DP_KEY() {
        return 'BusEdgeRouterConfig.SELECTED_NODES_DP_KEY'
      }

      applyLayout(/**yfiles.layout.LayoutGraph*/ graph) {
        const affectedEdges = graph.getDataProvider(
          yfiles.router.BusRouter.DEFAULT_AFFECTED_EDGES_DP_KEY
        )
        const selectedNodes = graph.getDataProvider(
          HideNonOrthogonalEdgesStage.SELECTED_NODES_DP_KEY
        )
        const hider = new yfiles.algorithms.LayoutGraphHider(graph)
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

    return yfiles.module('demo')
  })
})(
  'undefined' !== typeof window
    ? window
    : 'undefined' !== typeof global
      ? global
      : 'undefined' !== typeof self
        ? self
        : this
)
