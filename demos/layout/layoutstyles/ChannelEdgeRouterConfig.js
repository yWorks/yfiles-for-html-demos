/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
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
      exports.ChannelEdgeRouterConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.ChannelEdgeRouterConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('ChannelEdgeRouter')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)
            this.scopeItem = yfiles.router.Scope.ROUTE_ALL_EDGES
            this.minimumDistanceItem = 10
            this.activateGridRoutingItem = true
            this.gridSpacingItem = 20

            this.bendCostItem = 1.0
            this.edgeCrossingCostItem = 5.0
            this.nodeCrossingCostItem = 50.0
          },

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout.
           */
          createConfiguredLayout: function(graphComponent) {
            const router = new yfiles.router.ChannelEdgeRouter()

            const orthogonalPatternEdgeRouter = new yfiles.router.OrthogonalPatternEdgeRouter()

            orthogonalPatternEdgeRouter.affectedEdgesDpKey =
              yfiles.router.ChannelEdgeRouter.AFFECTED_EDGES_DP_KEY
            orthogonalPatternEdgeRouter.minimumDistance = this.minimumDistanceItem
            orthogonalPatternEdgeRouter.gridRouting = this.activateGridRoutingItem
            orthogonalPatternEdgeRouter.gridSpacing = this.gridSpacingItem

            orthogonalPatternEdgeRouter.bendCost = this.bendCostItem
            orthogonalPatternEdgeRouter.edgeCrossingCost = this.edgeCrossingCostItem
            orthogonalPatternEdgeRouter.nodeCrossingCost = this.nodeCrossingCostItem

            // disable edge overlap costs when Edge distribution will run afterwards anyway
            orthogonalPatternEdgeRouter.edgeOverlapCost = 0.0

            router.pathFinderStrategy = orthogonalPatternEdgeRouter

            const segmentDistributionStage = new yfiles.router.OrthogonalSegmentDistributionStage()
            segmentDistributionStage.affectedEdgesDpKey =
              yfiles.router.ChannelEdgeRouter.AFFECTED_EDGES_DP_KEY
            segmentDistributionStage.preferredDistance = this.minimumDistanceItem
            segmentDistributionStage.gridRouting = this.activateGridRoutingItem
            segmentDistributionStage.gridSpacing = this.gridSpacingItem

            router.edgeDistributionStrategy = segmentDistributionStage

            return router
          },

          /**
           * Called by {@link demo.LayoutConfiguration#apply} to create the layout data of the configuration. This
           * method is typically overridden to provide mappers for the different layouts.
           */
          createConfiguredLayoutData: function(graphComponent, layout) {
            const layoutData = new yfiles.router.ChannelEdgeRouterData()
            const selection = graphComponent.selection
            if (this.scopeItem === yfiles.router.Scope.ROUTE_EDGES_AT_AFFECTED_NODES) {
              layoutData.affectedEdges.delegate = edge =>
                selection.isSelected(edge.sourceNode) || selection.isSelected(edge.targetNode)
            } else if (this.scopeItem === yfiles.router.Scope.ROUTE_AFFECTED_EDGES) {
              layoutData.affectedEdges.delegate = edge => selection.isSelected(edge)
            } else {
              layoutData.affectedEdges.delegate = edge => true
            }
            return layoutData
          },

          /**
           * Called after the layout animation is done.
           * @see Overrides {@link demo.LayoutConfiguration#postProcess}
           */
          postProcess: function(graphComponent) {},

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
          CostsGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Costs'),
                demo.options.OptionGroupAttribute('RootGroup', 20),
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
              return "<p style='margin-top:0'>Channel edge router uses a rather fast but simple algorithm for finding orthogonal edge routes. Compared to polyline and orthogonal edge router, edge segments can be very close to each other and edges may also overlap with nodes. However, this algorithm is faster in many situations.</p>"
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.router.Scope}
           */
          $scopeItem: null,

          /** @type {yfiles.router.Scope} */
          scopeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Scope',
                  '#/api/yfiles.router.ChannelEdgeRouterData#ChannelEdgeRouterData-property-affectedEdges'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['All Edges', yfiles.router.Scope.ROUTE_ALL_EDGES],
                    ['Selected Edges', yfiles.router.Scope.ROUTE_AFFECTED_EDGES],
                    ['Edges at Selected Nodes', yfiles.router.Scope.ROUTE_EDGES_AT_AFFECTED_NODES]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.router.Scope.$class)
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
           * @type {number}
           */
          $minimumDistanceItem: 0,

          /** @type {number} */
          minimumDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Distance',
                  '#/api/yfiles.router.OrthogonalPatternEdgeRouter#OrthogonalPatternEdgeRouter-property-minimumDistance'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 30),
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 100.0
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumDistanceItem
            },
            set: function(value) {
              this.$minimumDistanceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $activateGridRoutingItem: false,

          /** @type {boolean} */
          activateGridRoutingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Route on Grid',
                  '#/api/yfiles.router.OrthogonalPatternEdgeRouter#OrthogonalPatternEdgeRouter-property-gridRouting'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 40),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$activateGridRoutingItem
            },
            set: function(value) {
              this.$activateGridRoutingItem = value
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
                  '#/api/yfiles.router.OrthogonalPatternEdgeRouter#OrthogonalPatternEdgeRouter-property-gridSpacing'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 50),
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
              return !this.activateGridRoutingItem
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $bendCostItem: 0,

          /** @type {number} */
          bendCostItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Bend Cost',
                  '#/api/yfiles.router.OrthogonalPatternEdgeRouter#OrthogonalPatternEdgeRouter-property-bendCost'
                ),
                demo.options.OptionGroupAttribute('CostsGroup', 10),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$bendCostItem
            },
            set: function(value) {
              this.$bendCostItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $edgeCrossingCostItem: 0,

          /** @type {number} */
          edgeCrossingCostItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Edge Crossing Cost',
                  '#/api/yfiles.router.OrthogonalPatternEdgeRouter#OrthogonalPatternEdgeRouter-property-edgeCrossingCost'
                ),
                demo.options.OptionGroupAttribute('CostsGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$edgeCrossingCostItem
            },
            set: function(value) {
              this.$edgeCrossingCostItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $nodeCrossingCostItem: 0,

          /** @type {number} */
          nodeCrossingCostItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Node Overlap Cost',
                  '#/api/yfiles.router.OrthogonalPatternEdgeRouter#OrthogonalPatternEdgeRouter-property-nodeCrossingCost'
                ),
                demo.options.OptionGroupAttribute('CostsGroup', 30),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$nodeCrossingCostItem
            },
            set: function(value) {
              this.$nodeCrossingCostItem = value
            }
          }
        }
      })
    })
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
