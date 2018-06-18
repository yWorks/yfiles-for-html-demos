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
       * @yjs:keep=DescriptionGroup,DistancesGroup,EdgePropertiesGroup,GridGroup,LabelingGroup,LayoutGroup,NodePropertiesGroup,PolylineGroup,PreferredPlacementGroup,descriptionText,considerEdgeLabelsItem,considerNodeLabelsItem,edgeLabelingItem,enablePolylineRoutingItem,enableReroutingItem,gridEnabledItem,gridSpacingItem,labelPlacementAlongEdgeItem,labelPlacementDistanceItem,labelPlacementOrientationItem,labelPlacementSideOfEdgeItem,maximumDurationItem,minimumEdgeToEdgeDistanceItem,minimumFirstSegmentLengthItem,minimumLastSegmentLengthItem,useIntermediatePointsItem,minimumNodeCornerDistanceItem,minimumNodeToEdgeDistanceItem,monotonicRestrictionItem,optimizationStrategyItem,preferredPolylineSegmentLengthItem,scopeItem,shouldDisableGridSpacingItem,shouldDisableLabelPlacementAlongEdgeItem,shouldDisableLabelPlacementDistanceItem,shouldDisableLabelPlacementOrientationItem,shouldDisableLabelPlacementSideOfEdgeItem,shouldDisablePreferredPolylineSegmentLengthItem
       * @class
       * @extends demo.LayoutConfiguration
       */
      exports.PolylineEdgeRouterConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.PolylineEdgeRouterConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('PolylineEdgeRouter')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)
            this.$initPolylineEdgeRouterConfig()
            const router = new yfiles.router.EdgeRouter()

            this.scopeItem = router.scope
            this.optimizationStrategyItem = demo.PolylineEdgeRouterConfig.EnumStrategies.BALANCED
            this.monotonicRestrictionItem = demo.PolylineEdgeRouterConfig.EnumMonotonyFlags.NONE
            this.enableReroutingItem = router.rerouting
            this.maximumDurationItem = 30

            const descriptor = router.defaultEdgeLayoutDescriptor
            this.minimumEdgeToEdgeDistanceItem = descriptor.minimumEdgeToEdgeDistance
            this.minimumNodeToEdgeDistanceItem = router.minimumNodeToEdgeDistance
            this.minimumNodeCornerDistanceItem = descriptor.minimumNodeCornerDistance
            this.minimumFirstSegmentLengthItem = descriptor.minimumFirstSegmentLength
            this.minimumLastSegmentLengthItem = descriptor.minimumLastSegmentLength

            this.useIntermediatePointsItem = false

            const grid = router.grid
            this.gridEnabledItem = grid !== null
            this.gridSpacingItem = grid !== null ? grid.spacing : 10

            this.enablePolylineRoutingItem = true
            this.preferredPolylineSegmentLengthItem = router.preferredPolylineSegmentLength

            this.considerNodeLabelsItem = router.considerNodeLabels
            this.considerEdgeLabelsItem = router.considerEdgeLabels
            this.edgeLabelingItem = false
            this.labelPlacementAlongEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED
            this.labelPlacementSideOfEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
            this.labelPlacementOrientationItem =
              demo.LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
            this.labelPlacementDistanceItem = 10.0
          },

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout.
           */
          createConfiguredLayout: function(graphComponent) {
            const router = new yfiles.router.EdgeRouter()

            router.scope = this.scopeItem

            router.minimumNodeToEdgeDistance = this.minimumNodeToEdgeDistanceItem

            if (this.gridEnabledItem) {
              router.grid = new yfiles.router.Grid(0, 0, this.gridSpacingItem)
            } else {
              router.grid = null
            }

            router.considerNodeLabels = this.considerNodeLabelsItem
            router.considerEdgeLabels = this.considerEdgeLabelsItem
            router.rerouting = this.enableReroutingItem

            router.polylineRouting = this.enablePolylineRoutingItem
            router.preferredPolylineSegmentLength = this.preferredPolylineSegmentLengthItem
            router.maximumDuration = this.maximumDurationItem * 1000

            const layout = new yfiles.layout.SequentialLayout()
            layout.appendLayout(router)

            if (this.edgeLabelingItem) {
              const genericLabeling = new yfiles.labeling.GenericLabeling()
              genericLabeling.placeEdgeLabels = true
              genericLabeling.placeNodeLabels = false
              genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
              layout.appendLayout(genericLabeling)
            }

            demo.LayoutConfiguration.addPreferredPlacementDescriptor(
              graphComponent.graph,
              this.labelPlacementAlongEdgeItem,
              this.labelPlacementSideOfEdgeItem,
              this.labelPlacementOrientationItem,
              this.labelPlacementDistanceItem
            )

            return layout
          },

          /**
           * Called by {@link demo.LayoutConfiguration#apply} to create the layout data of the configuration. This
           * method is typically overridden to provide mappers for the different layouts.
           */
          createConfiguredLayoutData: function(graphComponent, layout) {
            const layoutData = new yfiles.router.PolylineEdgeRouterData()

            layoutData.edgeLayoutDescriptors.delegate = edge => {
              const descriptor = new yfiles.router.EdgeLayoutDescriptor()

              if (
                this.optimizationStrategyItem ===
                demo.PolylineEdgeRouterConfig.EnumStrategies.BALANCED
              ) {
                descriptor.penaltySettings = yfiles.router.PenaltySettings.OPTIMIZATION_BALANCED
              } else if (
                this.optimizationStrategyItem ===
                demo.PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_BENDS
              ) {
                descriptor.penaltySettings = yfiles.router.PenaltySettings.OPTIMIZATION_EDGE_BENDS
              } else if (
                this.optimizationStrategyItem ===
                demo.PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_EDGE_LENGTH
              ) {
                descriptor.penaltySettings = yfiles.router.PenaltySettings.OPTIMIZATION_EDGE_LENGTHS
              } else {
                descriptor.penaltySettings =
                  yfiles.router.PenaltySettings.OPTIMIZATION_EDGE_CROSSINGS
              }

              if (
                this.monotonicRestrictionItem ===
                demo.PolylineEdgeRouterConfig.EnumMonotonyFlags.HORIZONTAL
              ) {
                descriptor.monotonicPathRestriction =
                  yfiles.router.MonotonicPathRestriction.HORIZONTAL
              } else if (
                this.monotonicRestrictionItem ===
                demo.PolylineEdgeRouterConfig.EnumMonotonyFlags.VERTICAL
              ) {
                descriptor.monotonicPathRestriction =
                  yfiles.router.MonotonicPathRestriction.VERTICAL
              } else if (
                this.monotonicRestrictionItem ===
                demo.PolylineEdgeRouterConfig.EnumMonotonyFlags.BOTH
              ) {
                descriptor.monotonicPathRestriction = yfiles.router.MonotonicPathRestriction.BOTH
              } else {
                descriptor.monotonicPathRestriction = yfiles.router.MonotonicPathRestriction.NONE
              }

              descriptor.minimumEdgeToEdgeDistance = this.minimumEdgeToEdgeDistanceItem
              descriptor.minimumNodeCornerDistance = this.minimumNodeCornerDistanceItem
              descriptor.minimumFirstSegmentLength = this.minimumFirstSegmentLengthItem
              descriptor.minimumLastSegmentLength = this.minimumLastSegmentLengthItem

              if (this.useIntermediatePointsItem) {
                const intermediateRoutingPoints = new yfiles.collections.List()
                edge.bends.forEach(bend =>
                  intermediateRoutingPoints.add(
                    new yfiles.algorithms.YPoint(bend.location.x, bend.location.y)
                  )
                )
                descriptor.intermediateRoutingPoints = intermediateRoutingPoints
              }

              return descriptor
            }

            const selection = graphComponent.selection
            if (this.scopeItem === yfiles.router.Scope.ROUTE_EDGES_AT_AFFECTED_NODES) {
              layoutData.affectedNodes.delegate = node => selection.isSelected(node)
            } else if (this.scopeItem === yfiles.router.Scope.ROUTE_AFFECTED_EDGES) {
              layoutData.affectedEdges.delegate = edge => selection.isSelected(edge)
            } else {
              layoutData.affectedEdges.delegate = edge => true
              layoutData.affectedNodes.delegate = node => true
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
          DistancesGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Minimum Distances'),
                demo.options.OptionGroupAttribute('RootGroup', 20),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          GridGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Grid'),
                demo.options.OptionGroupAttribute('RootGroup', 30),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          PolylineGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Octilinear Routing'),
                demo.options.OptionGroupAttribute('RootGroup', 40),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          LabelingGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Labeling'),
                demo.options.OptionGroupAttribute('RootGroup', 50),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          NodePropertiesGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Node Settings'),
                demo.options.OptionGroupAttribute('LabelingGroup', 10),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          EdgePropertiesGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Edge Settings'),
                demo.options.OptionGroupAttribute('LabelingGroup', 20),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          PreferredPlacementGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Preferred Edge Label Placement'),
                demo.options.OptionGroupAttribute('LabelingGroup', 30),
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
              return "<p style='margin-top:0'>Polyline edge routing calculates polyline edge paths for a diagram's edges. The positions of the nodes are not changed by this algorithm.</p><p>Edges will be routed orthogonally, that is each edge path consists of horizontal and vertical segments, or octilinear. Octilinear means that the slope of each segment of an edge path is a multiple of 45 degrees.</p><p>This type of edge routing is especially well suited for technical diagrams.</p>"
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
                  '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-scope'
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
           * @type {demo.PolylineEdgeRouterConfig.EnumStrategies}
           */
          $optimizationStrategyItem: null,

          /** @type {demo.PolylineEdgeRouterConfig.EnumStrategies} */
          optimizationStrategyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Optimization Strategy',
                  '#/api/yfiles.router.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-penaltySettings'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Balanced', demo.PolylineEdgeRouterConfig.EnumStrategies.BALANCED],
                    ['Less Bends', demo.PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_BENDS],
                    [
                      'Less Crossings',
                      demo.PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_CROSSINGS
                    ],
                    [
                      'Shorter Edges',
                      demo.PolylineEdgeRouterConfig.EnumStrategies.MINIMIZE_EDGE_LENGTH
                    ]
                  ]
                }),
                demo.options.TypeAttribute(demo.PolylineEdgeRouterConfig.EnumStrategies.$class)
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
           * @type {demo.PolylineEdgeRouterConfig.EnumMonotonyFlags}
           */
          $monotonicRestrictionItem: null,

          /** @type {demo.PolylineEdgeRouterConfig.EnumMonotonyFlags} */
          monotonicRestrictionItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Monotonic Restriction',
                  '#/api/yfiles.router.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-monotonicPathRestriction'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 30),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['None', demo.PolylineEdgeRouterConfig.EnumMonotonyFlags.NONE],
                    ['Horizontal', demo.PolylineEdgeRouterConfig.EnumMonotonyFlags.HORIZONTAL],
                    ['Vertical', demo.PolylineEdgeRouterConfig.EnumMonotonyFlags.VERTICAL],
                    ['Both', demo.PolylineEdgeRouterConfig.EnumMonotonyFlags.BOTH]
                  ]
                }),
                demo.options.TypeAttribute(demo.PolylineEdgeRouterConfig.EnumMonotonyFlags.$class)
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
                demo.options.LabelAttribute(
                  'Reroute Crossing Edges',
                  '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-rerouting'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 60),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
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
           * @type {boolean}
           */
          $useIntermediatePointsItem: false,

          /** @type {boolean} */
          useIntermediatePointsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Keep Bends as Intermediate Points',
                  '#/api/yfiles.router.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-intermediateRoutingPoints'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 65),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$useIntermediatePointsItem
            },
            set: function(value) {
              this.$useIntermediatePointsItem = value
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
                demo.options.LabelAttribute(
                  'Maximum Duration',
                  '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-maximumDuration'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 70),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 150
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
                demo.options.LabelAttribute(
                  'Edge to Edge',
                  '#/api/yfiles.router.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumEdgeToEdgeDistance'
                ),
                demo.options.OptionGroupAttribute('DistancesGroup', 10),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
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
           * @type {number}
           */
          $minimumNodeToEdgeDistanceItem: 0,

          /** @type {number} */
          minimumNodeToEdgeDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Node to Edge',
                  '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-minimumNodeToEdgeDistance'
                ),
                demo.options.OptionGroupAttribute('DistancesGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
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
          $minimumNodeCornerDistanceItem: 0,

          /** @type {number} */
          minimumNodeCornerDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Port to Node Corner',
                  '#/api/yfiles.router.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumNodeCornerDistance'
                ),
                demo.options.OptionGroupAttribute('DistancesGroup', 30),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
                demo.options.LabelAttribute(
                  'First Segment Length',
                  '#/api/yfiles.router.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumFirstSegmentLength'
                ),
                demo.options.OptionGroupAttribute('DistancesGroup', 40),
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
                  'Last Segment Length',
                  '#/api/yfiles.router.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLastSegmentLength'
                ),
                demo.options.OptionGroupAttribute('DistancesGroup', 50),
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
           * @type {boolean}
           */
          $gridEnabledItem: false,

          /** @type {boolean} */
          gridEnabledItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Route on Grid',
                  '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-grid'
                ),
                demo.options.OptionGroupAttribute('GridGroup', 10),
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
                  '#/api/yfiles.router.Grid#Grid-property-spacing'
                ),
                demo.options.OptionGroupAttribute('GridGroup', 20),
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
                demo.options.LabelAttribute(
                  'Octilinear Routing',
                  '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-polylineRouting'
                ),
                demo.options.OptionGroupAttribute('PolylineGroup', 10),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
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
                demo.options.LabelAttribute(
                  'Preferred Polyline Segment Length',
                  '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-preferredPolylineSegmentLength'
                ),
                demo.options.OptionGroupAttribute('PolylineGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 5,
                  max: 500
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
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
                demo.options.LabelAttribute(
                  'Consider Node Labels',
                  '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-considerNodeLabels'
                ),
                demo.options.OptionGroupAttribute('NodePropertiesGroup', 10),
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
          $considerEdgeLabelsItem: false,

          /** @type {boolean} */
          considerEdgeLabelsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Consider Fixed Edges Labels',
                  '#/api/yfiles.router.EdgeRouter#EdgeRouter-property-considerEdgeLabels'
                ),
                demo.options.OptionGroupAttribute('EdgePropertiesGroup', 10),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
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
                demo.options.LabelAttribute(
                  'Edge Labeling',
                  '#/api/yfiles.labeling.GenericLabeling'
                ),
                demo.options.OptionGroupAttribute('EdgePropertiesGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
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
                demo.options.LabelAttribute(
                  'Reduce Ambiguity',
                  '#/api/yfiles.labeling.GenericLabeling#MISLabelingBase-property-reduceAmbiguity'
                ),
                demo.options.OptionGroupAttribute('EdgePropertiesGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
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
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return !this.edgeLabelingItem
            }
          },

          /**
           * Backing field for below property
           * @type {demo.LayoutConfiguration.EnumLabelPlacementOrientation}
           */
          $labelPlacementOrientationItem: null,

          /** @type {demo.LayoutConfiguration.EnumLabelPlacementOrientation} */
          labelPlacementOrientationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Orientation',
                  '#/api/yfiles.layout.PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-angle'
                ),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Parallel', demo.LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL],
                    [
                      'Orthogonal',
                      demo.LayoutConfiguration.EnumLabelPlacementOrientation.ORTHOGONAL
                    ],
                    [
                      'Horizontal',
                      demo.LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
                    ],
                    ['Vertical', demo.LayoutConfiguration.EnumLabelPlacementOrientation.VERTICAL]
                  ]
                }),
                demo.options.TypeAttribute(
                  demo.LayoutConfiguration.EnumLabelPlacementOrientation.$class
                )
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
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return !this.edgeLabelingItem
            }
          },

          /**
           * Backing field for below property
           * @type {demo.LayoutConfiguration.EnumLabelPlacementAlongEdge}
           */
          $labelPlacementAlongEdgeItem: null,

          /** @type {demo.LayoutConfiguration.EnumLabelPlacementAlongEdge} */
          labelPlacementAlongEdgeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Along Edge',
                  '#/api/yfiles.layout.PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-placeAlongEdge'
                ),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Anywhere', demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.ANYWHERE],
                    ['At Source', demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_SOURCE],
                    ['At Target', demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET],
                    ['Centered', demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED]
                  ]
                }),
                demo.options.TypeAttribute(
                  demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.$class
                )
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
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return !this.edgeLabelingItem
            }
          },

          /**
           * Backing field for below property
           * @type {demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge}
           */
          $labelPlacementSideOfEdgeItem: null,

          /** @type {demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge} */
          labelPlacementSideOfEdgeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Side of Edge',
                  '#/api/yfiles.layout.PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-sideOfEdge'
                ),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 30),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Anywhere', demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ANYWHERE],
                    ['On Edge', demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE],
                    ['Left', demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT],
                    ['Right', demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.RIGHT],
                    [
                      'Left or Right',
                      demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT_OR_RIGHT
                    ]
                  ]
                }),
                demo.options.TypeAttribute(
                  demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.$class
                )
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
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
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
                demo.options.LabelAttribute(
                  'Distance',
                  '#/api/yfiles.layout.PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-distanceToEdge'
                ),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 40),
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 40.0
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                !this.edgeLabelingItem ||
                this.labelPlacementSideOfEdgeItem ===
                  demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
              )
            }
          },

          $initPolylineEdgeRouterConfig: function() {
            this.$scopeItem = yfiles.router.Scope.ROUTE_ALL_EDGES
            this.$optimizationStrategyItem = demo.PolylineEdgeRouterConfig.EnumStrategies.BALANCED
            this.$monotonicRestrictionItem = demo.PolylineEdgeRouterConfig.EnumMonotonyFlags.NONE
            this.$labelPlacementOrientationItem =
              demo.LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL
            this.$labelPlacementAlongEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.ANYWHERE
            this.$labelPlacementSideOfEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ANYWHERE
          },

          /** @lends {demo.PolylineEdgeRouterConfig} */
          $static: {
            EnumStrategies: new yfiles.lang.EnumDefinition(() => {
              return {
                BALANCED: 0,
                MINIMIZE_BENDS: 1,
                MINIMIZE_CROSSINGS: 2,
                MINIMIZE_EDGE_LENGTH: 3
              }
            }),

            EnumMonotonyFlags: new yfiles.lang.EnumDefinition(() => {
              return {
                NONE: 0,
                HORIZONTAL: 1,
                VERTICAL: 2,
                BOTH: 3
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
