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
       * @yjs:keep=DescriptionGroup,LayoutGroup,alignNodesItem,descriptionText,minNodeDistItem,componentAssignmentStrategyItem,orientationItem,routingToSubgraphItem,subgraphLayoutItem,subgraphPlacementItem
       * @class
       * @extends demo.LayoutConfiguration
       */
      exports.PartialLayoutConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.PartialLayoutConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('PartialLayout')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)
            this.routingToSubgraphItem = yfiles.partial.EdgeRoutingStrategy.AUTOMATIC
            this.componentAssignmentStrategyItem =
              yfiles.partial.ComponentAssignmentStrategy.CONNECTED
            this.subgraphLayoutItem = demo.PartialLayoutConfig.EnumSubgraphLayouts.IHL
            this.subgraphPlacementItem = yfiles.partial.SubgraphPlacement.FROM_SKETCH
            this.minNodeDistItem = 30
            this.orientationItem = yfiles.partial.LayoutOrientation.AUTO_DETECT
            this.alignNodesItem = true
          },

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout.
           */
          createConfiguredLayout: function(graphComponent) {
            const layout = new yfiles.partial.PartialLayout()
            layout.considerNodeAlignment = this.alignNodesItem
            layout.minimumNodeDistance = this.minNodeDistItem
            layout.subgraphPlacement = this.subgraphPlacementItem
            layout.componentAssignmentStrategy = this.componentAssignmentStrategyItem
            layout.layoutOrientation = this.orientationItem
            layout.edgeRoutingStrategy = this.routingToSubgraphItem

            let subgraphLayout = null
            if (
              this.componentAssignmentStrategyItem !==
              yfiles.partial.ComponentAssignmentStrategy.SINGLE
            ) {
              switch (this.subgraphLayoutItem) {
                case demo.PartialLayoutConfig.EnumSubgraphLayouts.IHL:
                  subgraphLayout = new yfiles.hierarchic.HierarchicLayout()
                  break
                case demo.PartialLayoutConfig.EnumSubgraphLayouts.ORGANIC:
                  subgraphLayout = new yfiles.organic.OrganicLayout()
                  break
                case demo.PartialLayoutConfig.EnumSubgraphLayouts.CIRCULAR:
                  subgraphLayout = new yfiles.circular.CircularLayout()
                  break
                case demo.PartialLayoutConfig.EnumSubgraphLayouts.ORTHOGONAL:
                  subgraphLayout = new yfiles.orthogonal.OrthogonalLayout()
                  break
                default:
                  break
              }
            }
            layout.coreLayout = subgraphLayout

            return layout
          },

          /**
           * Creates and configures the layout data.
           * @return {yfiles.layout.LayoutData} The configured layout data.
           */
          createConfiguredLayoutData: function(graphComponent, layout) {
            const layoutData = new yfiles.partial.PartialLayoutData()
            const selection = graphComponent.selection

            layoutData.affectedNodes.source = selection.selectedNodes
            layoutData.affectedEdges.source = selection.selectedEdges

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
              return "<p style='margin-top:0'>Partial layout arranges user-specified parts of a diagram, the so-called partial elements, while keeping the other parts fixed. It is related to incremental graph layout. This concept is a perfect fit for incremental scenarios where subsequently added parts should be arranged so that they fit into a given, unchanged diagram.</p><p>In a first step, partial elements are combined to form subgraph components. Subsequently, these are arranged and afterwards placed so that the remainder of the diagram, which consists of the so-called fixed elements, is not affected.</p><p>Placing a subgraph component predominantly means finding a good position that both meets certain proximity criteria and offers enough space to accommodate the subgraph component.</p>"
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.partial.EdgeRoutingStrategy}
           */
          $routingToSubgraphItem: null,

          /** @type {yfiles.partial.EdgeRoutingStrategy} */
          routingToSubgraphItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Edge Routing Style',
                  '#/api/yfiles.partial.PartialLayout#PartialLayout-property-edgeRoutingStrategy'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Auto-Detect', yfiles.partial.EdgeRoutingStrategy.AUTOMATIC],
                    ['Octilinear', yfiles.partial.EdgeRoutingStrategy.OCTILINEAR],
                    ['Straight-Line', yfiles.partial.EdgeRoutingStrategy.STRAIGHTLINE],
                    ['Orthogonal', yfiles.partial.EdgeRoutingStrategy.ORTHOGONAL],
                    ['Organic', yfiles.partial.EdgeRoutingStrategy.ORGANIC]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.partial.EdgeRoutingStrategy.$class)
              ]
            },
            get: function() {
              return this.$routingToSubgraphItem
            },
            set: function(value) {
              this.$routingToSubgraphItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.partial.ComponentAssignmentStrategy}
           */
          $componentAssignmentStrategyItem: null,

          /** @type {yfiles.partial.ComponentAssignmentStrategy} */
          componentAssignmentStrategyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Placement Strategy',
                  '#/api/yfiles.partial.PartialLayout#PartialLayout-property-componentAssignmentStrategy'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    [
                      'Connected Nodes as a Unit',
                      yfiles.partial.ComponentAssignmentStrategy.CONNECTED
                    ],
                    ['Each Node Separately', yfiles.partial.ComponentAssignmentStrategy.SINGLE],
                    ['All Nodes as a Unit', yfiles.partial.ComponentAssignmentStrategy.CUSTOMIZED],
                    ['Clustering', yfiles.partial.ComponentAssignmentStrategy.CLUSTERING]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.partial.ComponentAssignmentStrategy.$class)
              ]
            },
            get: function() {
              return this.$componentAssignmentStrategyItem
            },
            set: function(value) {
              this.$componentAssignmentStrategyItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {demo.PartialLayoutConfig.EnumSubgraphLayouts}
           */
          $subgraphLayoutItem: null,

          /** @type {demo.PartialLayoutConfig.EnumSubgraphLayouts} */
          subgraphLayoutItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Subgraph Layouter',
                  '#/api/yfiles.partial.PartialLayout#PartialLayout-property-coreLayout'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 30),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Hierarchical', demo.PartialLayoutConfig.EnumSubgraphLayouts.IHL],
                    ['Organic', demo.PartialLayoutConfig.EnumSubgraphLayouts.ORGANIC],
                    ['Circular', demo.PartialLayoutConfig.EnumSubgraphLayouts.CIRCULAR],
                    ['Orthogonal', demo.PartialLayoutConfig.EnumSubgraphLayouts.ORTHOGONAL],
                    ['As Is', demo.PartialLayoutConfig.EnumSubgraphLayouts.AS_IS]
                  ]
                }),
                demo.options.TypeAttribute(demo.PartialLayoutConfig.EnumSubgraphLayouts.$class)
              ]
            },
            get: function() {
              return this.$subgraphLayoutItem
            },
            set: function(value) {
              this.$subgraphLayoutItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.partial.SubgraphPlacement}
           */
          $subgraphPlacementItem: 0,

          /** @type {yfiles.partial.SubgraphPlacement} */
          subgraphPlacementItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Preferred Placement',
                  '#/api/yfiles.partial.PartialLayout#PartialLayout-property-subgraphPlacement'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 40),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Close to Initial Position', yfiles.partial.SubgraphPlacement.FROM_SKETCH],
                    ['Close to Neighbors', yfiles.partial.SubgraphPlacement.BARYCENTER]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.partial.SubgraphPlacement.$class)
              ]
            },
            get: function() {
              return this.$subgraphPlacementItem
            },
            set: function(value) {
              this.$subgraphPlacementItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minNodeDistItem: 0,

          /** @type {number} */
          minNodeDistItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Node Distance',
                  '#/api/yfiles.partial.PartialLayout#PartialLayout-property-minimumNodeDistance'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 50),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minNodeDistItem
            },
            set: function(value) {
              this.$minNodeDistItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.partial.LayoutOrientation}
           */
          $orientationItem: null,

          /** @type {yfiles.partial.LayoutOrientation} */
          orientationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Orientation',
                  '#/api/yfiles.partial.PartialLayout#PartialLayout-property-layoutOrientation'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 60),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Auto Detect', yfiles.partial.LayoutOrientation.AUTO_DETECT],
                    ['Top to Bottom', yfiles.partial.LayoutOrientation.TOP_TO_BOTTOM],
                    ['Left to Right', yfiles.partial.LayoutOrientation.LEFT_TO_RIGHT],
                    ['Bottom to Top', yfiles.partial.LayoutOrientation.BOTTOM_TO_TOP],
                    ['Right to Left', yfiles.partial.LayoutOrientation.RIGHT_TO_LEFT],
                    ['None', yfiles.partial.LayoutOrientation.NONE]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.partial.LayoutOrientation.$class)
              ]
            },
            get: function() {
              return this.$orientationItem
            },
            set: function(value) {
              this.$orientationItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $alignNodesItem: false,

          /** @type {boolean} */
          alignNodesItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Align Nodes',
                  '#/api/yfiles.partial.PartialLayout#PartialLayout-property-considerNodeAlignment'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 70),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$alignNodesItem
            },
            set: function(value) {
              this.$alignNodesItem = value
            }
          },

          /** @lends {demo.PartialLayoutConfig} */
          $static: {
            // ReSharper restore UnusedMember.Global
            // ReSharper restore InconsistentNaming
            EnumSubgraphLayouts: new yfiles.lang.EnumDefinition(() => {
              return {
                IHL: 0,
                ORGANIC: 1,
                CIRCULAR: 2,
                ORTHOGONAL: 3,
                AS_IS: 4
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
