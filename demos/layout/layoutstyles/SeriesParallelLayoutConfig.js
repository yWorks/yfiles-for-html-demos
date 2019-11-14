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
       * @yjs:keep=considerNodeLabelsItem,descriptionGroup,descriptionTextItem,distanceGroup,edgesGroup,generalGroup,labelingGroup,minimumEdgeLengthItem,minimumEdgeToEdgeDistanceItem,minimumFirstSegmentLengthItem,minimumLastSegmentLengthItem,minimumNodeToEdgeDistanceItem,minimumNodeToNodeDistanceItem,minimumPolylineSegmentLengthItem,minimumSlopeItem,orientationItem,placeEdgeLabelsItem,portStyleItem,preferredOctilinearSegmentLengthItem,routeEdgesInFlowDirectionItem,routingStyleItem,routingStyleNonSeriesParallelItem,shouldDisableMinimumPolylineSegmentLengthItem,shouldDisableMinimumSlopeItem,shouldDisablePreferredOctilinearSegmentLengthItem,useDrawingAsSketchItem,verticalAlignmentItem
       * @class
       * @extends demo.LayoutConfiguration
       */
      exports.SeriesParallelLayoutConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.SeriesParallelLayoutConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('SeriesParallelLayout')],

          constructor: function() {
            demo.LayoutConfiguration.call(this)
            const layout = new yfiles.seriesparallel.SeriesParallelLayout()
            const edgeLayoutDescriptor = layout.defaultEdgeLayoutDescriptor

            this.orientationItem = yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM
            this.verticalAlignmentItem = 0.5
            this.useDrawingAsSketchItem = layout.fromSketchMode
            this.minimumNodeToNodeDistanceItem = 30
            this.minimumNodeToEdgeDistanceItem = 15
            this.minimumEdgeToEdgeDistanceItem = 15
            this.considerNodeLabelsItem = true
            this.placeEdgeLabelsItem = true

            this.portStyleItem = yfiles.seriesparallel.PortAssignmentMode.CENTER
            this.routingStyleItem = yfiles.seriesparallel.RoutingStyle.ORTHOGONAL
            this.preferredOctilinearSegmentLengthItem = layout.preferredOctilinearSegmentLength
            this.minimumPolylineSegmentLengthItem = layout.minimumPolylineSegmentLength
            this.minimumSlopeItem = layout.minimumSlope
            this.routingStyleNonSeriesParallelItem =
              demo.SeriesParallelLayoutConfig.ROUTING_STYLE_ORTHOGONAL
            this.routeEdgesInFlowDirectionItem = true
            this.minimumFirstSegmentLengthItem = edgeLayoutDescriptor.minimumFirstSegmentLength
            this.minimumLastSegmentLengthItem = edgeLayoutDescriptor.minimumLastSegmentLength
            this.minimumEdgeLengthItem = 20
          },

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout algorithm.
           */
          createConfiguredLayout: function(graphComponent) {
            const layout = new yfiles.seriesparallel.SeriesParallelLayout()
            layout.generalGraphHandling = true

            layout.layoutOrientation = this.orientationItem

            layout.verticalAlignment = this.verticalAlignmentItem
            layout.fromSketchMode = this.useDrawingAsSketchItem

            layout.minimumNodeToNodeDistance = this.minimumNodeToNodeDistanceItem
            layout.minimumNodeToEdgeDistance = this.minimumNodeToEdgeDistanceItem
            layout.minimumEdgeToEdgeDistance = this.minimumEdgeToEdgeDistanceItem

            layout.considerNodeLabels = this.considerNodeLabelsItem
            layout.integratedEdgeLabeling = this.placeEdgeLabelsItem

            const portAssignment = layout.defaultPortAssignment
            portAssignment.mode = this.portStyleItem
            portAssignment.forkStyle = this.routeEdgesInFlowDirectionItem
              ? yfiles.seriesparallel.ForkStyle.OUTSIDE_NODE
              : yfiles.seriesparallel.ForkStyle.AT_NODE

            layout.routingStyle = this.routingStyleItem
            if (this.routingStyleItem === yfiles.seriesparallel.RoutingStyle.OCTILINEAR) {
              layout.preferredOctilinearSegmentLength = this.preferredOctilinearSegmentLengthItem
            } else if (this.routingStyleItem === yfiles.seriesparallel.RoutingStyle.POLYLINE) {
              layout.minimumPolylineSegmentLength = this.minimumPolylineSegmentLengthItem
              layout.minimumSlope = this.minimumSlopeItem
            }

            if (
              this.routingStyleNonSeriesParallelItem ===
              demo.SeriesParallelLayoutConfig.ROUTING_STYLE_ORTHOGONAL
            ) {
              const edgeRouter = new yfiles.router.EdgeRouter()
              edgeRouter.rerouting = true
              edgeRouter.scope = yfiles.router.Scope.ROUTE_AFFECTED_EDGES
              layout.nonSeriesParallelEdgeRouter = edgeRouter
              layout.nonSeriesParallelEdgesDpKey = edgeRouter.affectedEdgesDpKey
            } else if (
              this.routingStyleNonSeriesParallelItem ===
              demo.SeriesParallelLayoutConfig.ROUTING_STYLE_ORGANIC
            ) {
              const edgeRouter = new yfiles.router.OrganicEdgeRouter()
              layout.nonSeriesParallelEdgeRouter = edgeRouter
              layout.nonSeriesParallelEdgesDpKey =
                yfiles.router.OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
            } else if (
              this.routingStyleNonSeriesParallelItem ===
              demo.SeriesParallelLayoutConfig.ROUTING_STYLE_STRAIGHT
            ) {
              const edgeRouter = new yfiles.router.StraightLineEdgeRouter()
              edgeRouter.scope = yfiles.router.Scope.ROUTE_AFFECTED_EDGES
              layout.nonSeriesParallelEdgeRouter = edgeRouter
              layout.nonSeriesParallelEdgesDpKey = edgeRouter.affectedEdgesDpKey
            }

            const edgeLayoutDescriptor = layout.defaultEdgeLayoutDescriptor
            edgeLayoutDescriptor.minimumFirstSegmentLength = this.minimumFirstSegmentLengthItem
            edgeLayoutDescriptor.minimumLastSegmentLength = this.minimumLastSegmentLengthItem
            edgeLayoutDescriptor.minimumLength = this.minimumEdgeLengthItem

            return layout
          },

          /**
           * Backing field for below property
           * @type {demo.options.OptionGroup}
           */
          $descriptionGroup: null,

          /** @type {demo.options.OptionGroup} */
          descriptionGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Description'),
                demo.options.OptionGroupAttribute('RootGroup', 5),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            get: function() {
              return this.$descriptionGroup
            },
            set: function(value) {
              this.$descriptionGroup = value
            }
          },

          /**
           * Backing field for below property
           * @type {demo.options.OptionGroup}
           */
          $generalGroup: null,

          /** @type {demo.options.OptionGroup} */
          generalGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('General'),
                demo.options.OptionGroupAttribute('RootGroup', 10),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            get: function() {
              return this.$generalGroup
            },
            set: function(value) {
              this.$generalGroup = value
            }
          },

          /**
           * Backing field for below property
           * @type {demo.options.OptionGroup}
           */
          $edgesGroup: null,

          /** @type {demo.options.OptionGroup} */
          edgesGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Edges'),
                demo.options.OptionGroupAttribute('RootGroup', 10),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            get: function() {
              return this.$edgesGroup
            },
            set: function(value) {
              this.$edgesGroup = value
            }
          },

          /** @type {string} */
          descriptionTextItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('descriptionGroup', 10),
                demo.options.ComponentAttribute(demo.options.Components.HTML_BLOCK),
                demo.options.TypeAttribute(yfiles.lang.String.$class)
              ]
            },
            get: function() {
              return '<p>The series-parallel layout algorithm highlights the main direction or flow of a graph, similar to the hierarchic style. In comparison, this algorithm is usually faster but can be used only on special graphs, namely series-parallel graphs.</p>'
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.layout.LayoutOrientation}
           */
          $orientationItem: null,

          /** @type {yfiles.layout.LayoutOrientation} */
          orientationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Orientation',
                  '#/api/yfiles.layout.OrientationLayout#OrientationLayout-property-orientation'
                ),
                yfiles.graphml
                  .GraphMLAttribute()
                  .init({ defaultValue: yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM }),
                demo.options.OptionGroupAttribute('generalGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Top to Bottom', yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM],
                    ['Left to Right', yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT],
                    ['Bottom to Top', yfiles.layout.LayoutOrientation.BOTTOM_TO_TOP],
                    ['Right to Left', yfiles.layout.LayoutOrientation.RIGHT_TO_LEFT]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.layout.LayoutOrientation.$class)
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
           * @type {number}
           */
          $verticalAlignmentItem: 0,

          /** @type {number} */
          verticalAlignmentItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Vertical Alignment',
                  '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-verticalAlignment'
                ),
                yfiles.graphml.GraphMLAttribute().init({ defaultValue: 0.5 }),
                demo.options.OptionGroupAttribute('generalGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [['Top', 0.0], ['Center', 0.5], ['Bottom', 1.0]]
                }),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$verticalAlignmentItem
            },
            set: function(value) {
              this.$verticalAlignmentItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $useDrawingAsSketchItem: false,

          /** @type {boolean} */
          useDrawingAsSketchItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Use Drawing as Sketch',
                  '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-fromSketchMode'
                ),
                demo.options.OptionGroupAttribute('generalGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$useDrawingAsSketchItem
            },
            set: function(value) {
              this.$useDrawingAsSketchItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {demo.options.OptionGroup}
           */
          $distanceGroup: null,

          /** @type {demo.options.OptionGroup} */
          distanceGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Minimum Distances'),
                demo.options.OptionGroupAttribute('generalGroup', 30),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            get: function() {
              return this.$distanceGroup
            },
            set: function(value) {
              this.$distanceGroup = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumNodeToNodeDistanceItem: 0,

          /** @type {number} */
          minimumNodeToNodeDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Node to Node Distance',
                  '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-minimumNodeToNodeDistance'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.OptionGroupAttribute('distanceGroup', 10),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumNodeToNodeDistanceItem
            },
            set: function(value) {
              this.$minimumNodeToNodeDistanceItem = value
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
                demo.options.LabelAttribute(
                  'Node to Edge Distance',
                  '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-minimumNodeToEdgeDistance'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.OptionGroupAttribute('distanceGroup', 20),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
          $minimumEdgeToEdgeDistanceItem: 0,

          /** @type {number} */
          minimumEdgeToEdgeDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Edge to Edge Distance',
                  '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-minimumEdgeToEdgeDistance'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.OptionGroupAttribute('distanceGroup', 30),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
           * @type {demo.options.OptionGroup}
           */
          $labelingGroup: null,

          /** @type {demo.options.OptionGroup} */
          labelingGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Labeling'),
                demo.options.OptionGroupAttribute('generalGroup', 40),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            get: function() {
              return this.$labelingGroup
            },
            set: function(value) {
              this.$labelingGroup = value
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
                demo.options.LabelAttribute(
                  'Consider Node Labels',
                  '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-considerNodeLabels'
                ),
                demo.options.OptionGroupAttribute('labelingGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
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
          $placeEdgeLabelsItem: false,

          /** @type {boolean} */
          placeEdgeLabelsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Place Edge Labels',
                  '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-integratedEdgeLabeling'
                ),
                demo.options.OptionGroupAttribute('labelingGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$placeEdgeLabelsItem
            },
            set: function(value) {
              this.$placeEdgeLabelsItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.seriesparallel.PortAssignmentMode}
           */
          $portStyleItem: null,

          /** @type {yfiles.seriesparallel.PortAssignmentMode} */
          portStyleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Port Style',
                  '#/api/yfiles.seriesparallel.DefaultPortAssignment#DefaultPortAssignment-property-mode'
                ),
                demo.options.OptionGroupAttribute('edgesGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Centered', yfiles.seriesparallel.PortAssignmentMode.CENTER],
                    ['Distributed', yfiles.seriesparallel.PortAssignmentMode.DISTRIBUTED]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.seriesparallel.PortAssignmentMode.$class)
              ]
            },
            get: function() {
              return this.$portStyleItem
            },
            set: function(value) {
              this.$portStyleItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.seriesparallel.RoutingStyle}
           */
          $routingStyleItem: null,

          /** @type {yfiles.seriesparallel.RoutingStyle} */
          routingStyleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Routing Style',
                  '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-routingStyle'
                ),
                demo.options.OptionGroupAttribute('edgesGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Orthogonal', yfiles.seriesparallel.RoutingStyle.ORTHOGONAL],
                    ['Octilinear', yfiles.seriesparallel.RoutingStyle.OCTILINEAR],
                    ['Polyline', yfiles.seriesparallel.RoutingStyle.POLYLINE]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.seriesparallel.RoutingStyle.$class)
              ]
            },
            get: function() {
              return this.$routingStyleItem
            },
            set: function(value) {
              this.$routingStyleItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $preferredOctilinearSegmentLengthItem: 0,

          /** @type {number} */
          preferredOctilinearSegmentLengthItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Preferred Octilinear Segment Length',
                  '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-preferredOctilinearSegmentLength'
                ),
                demo.options.OptionGroupAttribute('edgesGroup', 30),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$preferredOctilinearSegmentLengthItem
            },
            set: function(value) {
              this.$preferredOctilinearSegmentLengthItem = value
            }
          },

          /** @type {boolean} */
          shouldDisablePreferredOctilinearSegmentLengthItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.routingStyleItem !== yfiles.seriesparallel.RoutingStyle.OCTILINEAR
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumPolylineSegmentLengthItem: 0,

          /** @type {number} */
          minimumPolylineSegmentLengthItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Polyline Segment Length',
                  '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-minimumPolylineSegmentLength'
                ),
                demo.options.OptionGroupAttribute('edgesGroup', 40),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumPolylineSegmentLengthItem
            },
            set: function(value) {
              this.$minimumPolylineSegmentLengthItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableMinimumPolylineSegmentLengthItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.routingStyleItem !== yfiles.seriesparallel.RoutingStyle.POLYLINE
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumSlopeItem: 0,

          /** @type {number} */
          minimumSlopeItem: {
            $meta: function() {
              return [
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 5.0,
                  step: 0.01
                }),
                demo.options.LabelAttribute(
                  'Minimum Slope',
                  '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-minimumSlope'
                ),
                demo.options.OptionGroupAttribute('edgesGroup', 50),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumSlopeItem
            },
            set: function(value) {
              this.$minimumSlopeItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableMinimumSlopeItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.routingStyleItem !== yfiles.seriesparallel.RoutingStyle.POLYLINE
            }
          },

          /**
           * Backing field for below property
           * @type {string}
           */
          $routingStyleNonSeriesParallelItem: null,

          /** @type {string} */
          routingStyleNonSeriesParallelItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Routing Style (Non-Series-Parallel Edges)',
                  '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-nonSeriesParallelEdgeRouter'
                ),
                demo.options.OptionGroupAttribute('edgesGroup', 60),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Orthogonal', demo.SeriesParallelLayoutConfig.ROUTING_STYLE_ORTHOGONAL],
                    ['Organic', demo.SeriesParallelLayoutConfig.ROUTING_STYLE_ORGANIC],
                    ['Straight-Line', demo.SeriesParallelLayoutConfig.ROUTING_STYLE_STRAIGHT]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.lang.String.$class)
              ]
            },
            get: function() {
              return this.$routingStyleNonSeriesParallelItem
            },
            set: function(value) {
              this.$routingStyleNonSeriesParallelItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $routeEdgesInFlowDirectionItem: false,

          /** @type {boolean} */
          routeEdgesInFlowDirectionItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Route Edges in Flow Direction',
                  '#/api/yfiles.seriesparallel.DefaultPortAssignment#DefaultPortAssignment-property-forkStyle'
                ),
                demo.options.OptionGroupAttribute('edgesGroup', 70),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$routeEdgesInFlowDirectionItem
            },
            set: function(value) {
              this.$routeEdgesInFlowDirectionItem = value
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
                demo.options.LabelAttribute(
                  'Minimum First Segment Length',
                  '#/api/yfiles.seriesparallel.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumFirstSegmentLength'
                ),
                demo.options.OptionGroupAttribute('edgesGroup', 80),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
                demo.options.LabelAttribute(
                  'Minimum Last Segment Length',
                  '#/api/yfiles.seriesparallel.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLastSegmentLength'
                ),
                demo.options.OptionGroupAttribute('edgesGroup', 90),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
           * @type {number}
           */
          $minimumEdgeLengthItem: 0,

          /** @type {number} */
          minimumEdgeLengthItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Edge Length',
                  '#/api/yfiles.seriesparallel.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLength'
                ),
                demo.options.OptionGroupAttribute('edgesGroup', 100),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumEdgeLengthItem
            },
            set: function(value) {
              this.$minimumEdgeLengthItem = value
            }
          },

          /** @lends {demo.SeriesParallelLayoutConfig} */
          $static: {
            /**
             * @type {string}
             */
            ROUTING_STYLE_ORTHOGONAL: 'RoutingStyle.Orthogonal',

            /**
             * @type {string}
             */
            ROUTING_STYLE_ORGANIC: 'RoutingStyle.Organic',

            /**
             * @type {string}
             */
            ROUTING_STYLE_STRAIGHT: 'RoutingStyle.Straight'
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
