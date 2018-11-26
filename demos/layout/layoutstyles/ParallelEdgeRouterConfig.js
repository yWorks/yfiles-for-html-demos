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
      exports.ParallelEdgeRouterConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.ParallelEdgeRouterConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('ParallelEdgeRouter')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)
            const router = new yfiles.router.ParallelEdgeRouter()
            this.scopeItem = demo.ParallelEdgeRouterConfig.EnumScope.SCOPE_ALL_EDGES
            this.useSelectedEdgesAsMasterItem = false
            this.considerEdgeDirectionItem = router.directedMode
            this.useAdaptiveLineDistanceItem = router.adaptiveLineDistances
            this.lineDistanceItem = router.lineDistance | 0
            this.joinEndsItem = router.joinEnds
            this.joinDistanceItem = router.absJoinEndDistance
          },

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout algorithm.
           */
          createConfiguredLayout: function(graphComponent) {
            const router = new yfiles.router.ParallelEdgeRouter()
            router.adjustLeadingEdge = false
            router.directedMode = this.considerEdgeDirectionItem
            router.adaptiveLineDistances = this.useAdaptiveLineDistanceItem
            router.lineDistance = this.lineDistanceItem
            router.joinEnds = this.joinEndsItem
            router.absJoinEndDistance = this.joinDistanceItem

            return router
          },

          /**
           * Called by {@link demo.LayoutConfiguration#apply} to create the layout data of the configuration. This
           * method is typically overridden to provide mappers for the different layouts.
           */
          createConfiguredLayoutData: function(graphComponent, layout) {
            const layoutData = new yfiles.router.ParallelEdgeRouterData()
            const selection = graphComponent.selection

            if (
              this.scopeItem === demo.ParallelEdgeRouterConfig.EnumScope.SCOPE_AT_SELECTED_NODES
            ) {
              layoutData.affectedEdges.delegate = edge =>
                selection.isSelected(edge.sourceNode) || selection.isSelected(edge.targetNode)
            } else if (
              this.scopeItem === demo.ParallelEdgeRouterConfig.EnumScope.SCOPE_SELECTED_EDGES
            ) {
              layoutData.affectedEdges.source = selection.selectedEdges
            } else {
              layoutData.affectedEdges.delegate = edge => true
            }

            if (this.useSelectedEdgesAsMasterItem) {
              layoutData.leadingEdges.source = selection.selectedEdges
            }

            return layoutData
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
              return "<p style='margin-top:0'>The parallel edge routing algorithm routes parallel edges which connect the same pair of nodes in a graph. It is often used as layout stage for other layout algorithms to handle the parallel edges for those.</p>"
            }
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

          /**
           * Backing field for below property
           * @type {demo.ParallelEdgeRouterConfig.EnumScope}
           */
          $scopeItem: null,

          /** @type {demo.ParallelEdgeRouterConfig.EnumScope} */
          scopeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Scope',
                  '#/api/yfiles.router.ParallelEdgeRouterData#ParallelEdgeRouterData-property-affectedEdges'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['All Edges', demo.ParallelEdgeRouterConfig.EnumScope.SCOPE_ALL_EDGES],
                    [
                      'Selected Edges',
                      demo.ParallelEdgeRouterConfig.EnumScope.SCOPE_SELECTED_EDGES
                    ],
                    [
                      'Edges at Selected Nodes',
                      demo.ParallelEdgeRouterConfig.EnumScope.SCOPE_AT_SELECTED_NODES
                    ]
                  ]
                }),
                demo.options.TypeAttribute(demo.ParallelEdgeRouterConfig.EnumScope.$class)
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
           * @type {boolean}
           */
          $useSelectedEdgesAsMasterItem: false,

          /** @type {boolean} */
          useSelectedEdgesAsMasterItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Use Selected Edges As Leading Edges',
                  '#/api/yfiles.router.ParallelEdgeRouterData#ParallelEdgeRouterData-property-leadingEdges'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$useSelectedEdgesAsMasterItem
            },
            set: function(value) {
              this.$useSelectedEdgesAsMasterItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $considerEdgeDirectionItem: false,

          /** @type {boolean} */
          considerEdgeDirectionItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Consider Edge Direction',
                  '#/api/yfiles.router.ParallelEdgeRouter#ParallelEdgeRouter-property-directedMode'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$considerEdgeDirectionItem
            },
            set: function(value) {
              this.$considerEdgeDirectionItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $useAdaptiveLineDistanceItem: false,

          /** @type {boolean} */
          useAdaptiveLineDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Use Adaptive Line Distance',
                  '#/api/yfiles.router.ParallelEdgeRouter#ParallelEdgeRouter-property-adaptiveLineDistances'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 40),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$useAdaptiveLineDistanceItem
            },
            set: function(value) {
              this.$useAdaptiveLineDistanceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $lineDistanceItem: 0,

          /** @type {number} */
          lineDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Line Distance',
                  '#/api/yfiles.router.ParallelEdgeRouter#ParallelEdgeRouter-property-lineDistance'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 50),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 50
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$lineDistanceItem
            },
            set: function(value) {
              this.$lineDistanceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $joinEndsItem: false,

          /** @type {boolean} */
          joinEndsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Join Ends',
                  '#/api/yfiles.router.ParallelEdgeRouter#ParallelEdgeRouter-property-joinEnds'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 60),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$joinEndsItem
            },
            set: function(value) {
              this.$joinEndsItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $joinDistanceItem: 0,

          /** @type {number} */
          joinDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Join Distance',
                  '#/api/yfiles.router.ParallelEdgeRouter#ParallelEdgeRouter-property-absJoinEndDistance'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 70),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 50
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$joinDistanceItem
            },
            set: function(value) {
              this.$joinDistanceItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableJoinDistanceItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return !this.joinEndsItem
            }
          },

          /** @lends {demo.ParallelEdgeRouterConfig} */
          $static: {
            // ReSharper restore UnusedMember.Global
            // ReSharper restore InconsistentNaming
            EnumScope: new yfiles.lang.EnumDefinition(() => {
              return {
                SCOPE_ALL_EDGES: 0,
                SCOPE_SELECTED_EDGES: 1,
                SCOPE_AT_SELECTED_NODES: 2
              }
            })
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
