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
    if ('function' == typeof define && define.amd) {
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
      exports.OrganicEdgeRouterConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.OrganicEdgeRouterConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('OrganicEdgeRouter')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)
            const router = new yfiles.router.OrganicEdgeRouter()
            this.selectionOnlyItem = false
            this.minimumNodeDistanceItem = router.minimumDistance
            this.keepBendsItem = router.keepExistingBends
            this.routeOnlyNecessaryItem = !router.routeAllEdges
            this.allowMovingNodesItem = false
          },

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout algorithm.
           */
          createConfiguredLayout: function(graphComponent) {
            const router = new yfiles.router.OrganicEdgeRouter()
            router.minimumDistance = this.minimumNodeDistanceItem
            router.keepExistingBends = this.keepBendsItem
            router.routeAllEdges = this.routeOnlyNecessaryItem

            const layout = new yfiles.layout.SequentialLayout()
            if (this.allowMovingNodesItem) {
              // if we are allowed to move nodes, we can improve the routing results by temporarily enlarging nodes and
              // removing overlaps (this strategy ensures that there is enough space for the edges)
              const cls = new yfiles.layout.CompositeLayoutStage()
              cls.appendStage(router.createNodeEnlargementStage())
              cls.appendStage(new yfiles.organic.RemoveOverlapsStage(0))
              layout.appendLayout(cls)
            }
            if (router.keepExistingBends) {
              // we want to keep the original bends
              const bendConverter = new yfiles.layout.BendConverter()
              bendConverter.affectedEdgesDpKey =
                yfiles.router.OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
              bendConverter.adoptAffectedEdges = this.selectionOnlyItem
              bendConverter.coreLayout = router
              layout.appendLayout(bendConverter)
            } else {
              layout.appendLayout(router)
            }

            return layout
          },

          /**
           * Creates and configures the layout data.
           * @return {yfiles.layout.LayoutData} The configured layout data.
           */
          createConfiguredLayoutData: function(graphComponent, layout) {
            const layoutData = new yfiles.router.OrganicEdgeRouterData()

            if (this.selectionOnlyItem) {
              layoutData.affectedEdges.delegate = edge => {
                return graphComponent.selection.isSelected(edge)
              }
            }

            return layoutData
          },

          /**
           * Called after the layout animation is done.
           * @see Overrides {@link demo.LayoutConfiguration#postProcess}
           */
          postProcess: function(graphComponent) {
            graphComponent.graph.mapperRegistry.removeMapper(
              yfiles.router.OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
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

          // ReSharper restore UnusedMember.Global
          // ReSharper restore InconsistentNaming
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
              return "<p style='margin-top:0'>The organic edge routing algorithm routes edges in soft curves to ensure that they do not overlap with nodes. It is especially well suited for non-orthogonal, organic or circular diagrams.</p>"
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $selectionOnlyItem: false,

          /** @type {boolean} */
          selectionOnlyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Route Selected Edges Only',
                  '#/api/yfiles.router.OrganicEdgeRouterData#OrganicEdgeRouterData-property-affectedEdges'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 10),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$selectionOnlyItem
            },
            set: function(value) {
              this.$selectionOnlyItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumNodeDistanceItem: 0,

          /** @type {number} */
          minimumNodeDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Distance',
                  '#/api/yfiles.router.OrganicEdgeRouter#OrganicEdgeRouter-property-minimumDistance'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumNodeDistanceItem
            },
            set: function(value) {
              this.$minimumNodeDistanceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $keepBendsItem: false,

          /** @type {boolean} */
          keepBendsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Keep Existing Bends',
                  '#/api/yfiles.router.OrganicEdgeRouter#OrganicEdgeRouter-property-keepExistingBends'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$keepBendsItem
            },
            set: function(value) {
              this.$keepBendsItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $routeOnlyNecessaryItem: false,

          /** @type {boolean} */
          routeOnlyNecessaryItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Route Only Necessary',
                  '#/api/yfiles.router.OrganicEdgeRouter#OrganicEdgeRouter-property-routeAllEdges'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 40),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$routeOnlyNecessaryItem
            },
            set: function(value) {
              this.$routeOnlyNecessaryItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $allowMovingNodesItem: false,

          /** @type {boolean} */
          allowMovingNodesItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Allow Moving Nodes',
                  '#/api/yfiles.layout.CompositeLayoutStage'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 50),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$allowMovingNodesItem
            },
            set: function(value) {
              this.$allowMovingNodesItem = value
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
