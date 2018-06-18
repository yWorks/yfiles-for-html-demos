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
      define(['yfiles/lang', 'yfiles/view-component'], f)
    } else {
      f(r.yfiles.lang, r.yfiles)
    }
  })((lang, yfiles) => {
    const demo = yfiles.module('demo')
    yfiles.module('demo', exports => {
      /**
       * Configuration options for the the polyline edge router.
       * @yjs:keep=DescriptionGroup,DistancesGroup,EdgePropertiesGroup,GridGroup,LabelingGroup,LayoutGroup,NodePropertiesGroup,PolylineGroup,PreferredPlacementGroup,descriptionText,considerEdgeLabelsItem,considerNodeLabelsItem,edgeLabelingItem,enablePolylineRoutingItem,enableReroutingItem,gridEnabledItem,gridSpacingItem,labelPlacementAlongEdgeItem,labelPlacementDistanceItem,labelPlacementOrientationItem,labelPlacementSideOfEdgeItem,maximumDurationItem,minimumEdgeToEdgeDistanceItem,minimumFirstSegmentLengthItem,minimumLastSegmentLengthItem,minimumNodeCornerDistanceItem,minimumNodeToEdgeDistanceItem,monotonicRestrictionItem,optimizationStrategyItem,preferredPolylineSegmentLengthItem,scopeItem,shouldDisableGridSpacingItem,shouldDisableLabelPlacementAlongEdgeItem,shouldDisableLabelPlacementDistanceItem,shouldDisableLabelPlacementOrientationItem,shouldDisableLabelPlacementSideOfEdgeItem,shouldDisablePreferredPolylineSegmentLengthItem
       * @class
       */
      exports.PolylineEdgeRouterConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.PolylineEdgeRouterConfig.prototype} */
        return {
          $meta: [demo.options.LabelAttribute('PolylineEdgeRouter')],

          /**
           * A guard to prevent running multiple layout calculations at the same time.
           * @type {boolean}
           */
          $layoutRunning: false,

          /**
           * The current layout algorithm.
           * @type {yfiles.layout.ILayoutAlgorithm}
           */
          $layout: null,

          /**
           * The current layout data.
           * @type {yfiles.layout.LayoutData}
           */
          $layoutData: null,

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            this.$initPolylineEdgeRouterConfig()
            const router = new yfiles.router.EdgeRouter()

            this.scopeItem = router.scope
            this.optimizationStrategyItem = demo.PolylineEdgeRouterConfig.EnumStrategies.BALANCED
            this.monotonicRestrictionItem = demo.PolylineEdgeRouterConfig.EnumMonotonyFlags.NONE
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

            this.enablePolylineRoutingItem = true
            this.preferredPolylineSegmentLengthItem = router.preferredPolylineSegmentLength

            this.considerNodeLabelsItem = router.considerNodeLabels
            this.considerEdgeLabelsItem = router.considerEdgeLabels
            this.edgeLabelingItem = false
            this.labelPlacementAlongEdgeItem =
              demo.PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.CENTERED
            this.labelPlacementSideOfEdgeItem =
              demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ON_EDGE
            this.labelPlacementOrientationItem =
              demo.PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.HORIZONTAL
            this.labelPlacementDistanceItem = 10.0
          },

          /**
           * Applies this configuration to the given {@link yfiles.view.GraphComponent}.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *  configuration on
           * @return {Promise} A promise which resolves after the layout is applied without errors.
           */
          apply: function(graphComponent) {
            if (this.$layoutRunning) {
              return Promise.reject()
            }

            if (!this.layout) {
              this.layout = this.createConfiguredLayout(graphComponent)
            }
            if (!this.layoutData) {
              this.layoutData = this.createConfiguredLayoutData(graphComponent, this.layout)
            }

            // configure the LayoutExecutor
            const layoutExecutor = new yfiles.layout.LayoutExecutor(
              graphComponent,
              new yfiles.layout.MinimumNodeSizeStage(this.layout)
            )
            layoutExecutor.duration = '0.5s'
            layoutExecutor.animateViewport = true

            // set the cancel duration for the layout computation to 20s
            if (this.layoutData && this.layoutData.abortHandler) {
              this.layoutData.abortHandler.cancelDuration = '20s'
            } else {
              layoutExecutor.abortHandler.cancelDuration = '20s'
            }

            // set the layout data to the LayoutExecutor
            if (this.layoutData) {
              layoutExecutor.layoutData = this.layoutData
            }

            // start the LayoutExecutor with finish and error handling code
            return layoutExecutor
              .start()
              .then(() => {
                this.$layoutRunning = false
                this.postProcess(graphComponent)
              })
              .catch(error => {
                this.$layoutRunning = false
                this.postProcess()
                if (error.name === 'AlgorithmAbortedError') {
                  alert(
                    'The layout computation was canceled because the maximum configured runtime of 20 seconds was exceeded.'
                  )
                } else if (typeof window.reportError === 'function') {
                  window.reportError(error)
                }
              })
          },

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
           */
          createConfiguredLayout: function(graphComponent) {
            const router = new yfiles.router.EdgeRouter()
            const descriptor = router.defaultEdgeLayoutDescriptor

            router.scope = this.scopeItem

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
              descriptor.penaltySettings = yfiles.router.PenaltySettings.OPTIMIZATION_EDGE_CROSSINGS
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
              descriptor.monotonicPathRestriction = yfiles.router.MonotonicPathRestriction.VERTICAL
            } else if (
              this.monotonicRestrictionItem === demo.PolylineEdgeRouterConfig.EnumMonotonyFlags.BOTH
            ) {
              descriptor.monotonicPathRestriction = yfiles.router.MonotonicPathRestriction.BOTH
            } else {
              descriptor.monotonicPathRestriction = yfiles.router.MonotonicPathRestriction.NONE
            }

            descriptor.minimumEdgeToEdgeDistance = this.minimumEdgeToEdgeDistanceItem
            router.minimumNodeToEdgeDistance = this.minimumNodeToEdgeDistanceItem
            descriptor.minimumNodeCornerDistance = this.minimumNodeCornerDistanceItem
            descriptor.minimumFirstSegmentLength = this.minimumFirstSegmentLengthItem
            descriptor.minimumLastSegmentLength = this.minimumLastSegmentLengthItem

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

            this.layout = new yfiles.layout.SequentialLayout()
            this.layout.appendLayout(router)

            if (this.edgeLabelingItem) {
              const genericLabeling = new yfiles.labeling.GenericLabeling()
              genericLabeling.placeEdgeLabels = true
              genericLabeling.placeNodeLabels = false
              genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
              this.layout.appendLayout(genericLabeling)
            }

            demo.PolylineEdgeRouterConfig.addPreferredPlacementDescriptor(
              graphComponent.graph,
              this.labelPlacementAlongEdgeItem,
              this.labelPlacementSideOfEdgeItem,
              this.labelPlacementOrientationItem,
              this.labelPlacementDistanceItem
            )
          },

          /**
           * Creates the layout data of the configuration.
           * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
           */
          createConfiguredLayoutData: function(graphComponent) {
            this.layoutData = new yfiles.router.PolylineEdgeRouterData()
            const selection = graphComponent.selection
            if (this.scopeItem === yfiles.router.Scope.ROUTE_EDGES_AT_AFFECTED_NODES) {
              this.layoutData.affectedNodes.delegate = node => selection.isSelected(node)
            } else if (this.scopeItem === yfiles.router.Scope.ROUTE_AFFECTED_EDGES) {
              this.layoutData.affectedEdges.delegate = edge => selection.isSelected(edge)
            } else {
              this.layoutData.affectedEdges.delegate = edge => true
              this.layoutData.affectedNodes.delegate = node => true
            }
            return this.layoutData
          },

          /**
           * Configures the layout algorithm and the layout data.
           * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
           */
          createConfiguration: function(graphComponent) {
            this.createConfiguredLayout(graphComponent)
            const configuredLayoutData = this.createConfiguredLayoutData(graphComponent)
            return configuredLayoutData
          },

          /**
           * Called after the layout animation is done.
           */
          postProcess: function() {
            this.layout = null
            this.layoutData = null
          },

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
                demo.options.LabelAttribute('Layout'),
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
                demo.options.LabelAttribute('Scope'),
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
                demo.options.LabelAttribute('Optimization Strategy'),
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
                demo.options.LabelAttribute('Monotonic Restriction'),
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
                demo.options.LabelAttribute('Reroute Crossing Edges'),
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
           * @type {number}
           */
          $maximumDurationItem: 0,

          /** @type {number} */
          maximumDurationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Maximum Duration'),
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
                demo.options.LabelAttribute('Edge to Edge'),
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
                demo.options.LabelAttribute('Node to Edge'),
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
                demo.options.LabelAttribute('Port to Node Corner'),
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
                demo.options.LabelAttribute('First Segment Length'),
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
                demo.options.LabelAttribute('Last Segment Length'),
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
                demo.options.LabelAttribute('Route on Grid'),
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
                demo.options.LabelAttribute('Grid Spacing'),
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
                demo.options.LabelAttribute('Octilinear Routing'),
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
                demo.options.LabelAttribute('Preferred Polyline Segment Length'),
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
                demo.options.LabelAttribute('Consider Node Labels'),
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
                demo.options.LabelAttribute('Consider Fixed Edges Labels'),
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
                demo.options.LabelAttribute('Edge Labeling'),
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
                demo.options.LabelAttribute('Reduce Ambiguity'),
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
           * @type {demo.PolylineEdgeRouterConfig.EnumLabelPlacementOrientation}
           */
          $labelPlacementOrientationItem: null,

          /** @type {demo.PolylineEdgeRouterConfig.EnumLabelPlacementOrientation} */
          labelPlacementOrientationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Orientation'),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    [
                      'Parallel',
                      demo.PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.PARALLEL
                    ],
                    [
                      'Orthogonal',
                      demo.PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.ORTHOGONAL
                    ],
                    [
                      'Horizontal',
                      demo.PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.HORIZONTAL
                    ],
                    [
                      'Vertical',
                      demo.PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.VERTICAL
                    ]
                  ]
                }),
                demo.options.TypeAttribute(
                  demo.PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.$class
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
           * @type {demo.PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge}
           */
          $labelPlacementAlongEdgeItem: null,

          /** @type {demo.PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge} */
          labelPlacementAlongEdgeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Along Edge'),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    [
                      'Anywhere',
                      demo.PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.ANYWHERE
                    ],
                    [
                      'At Source',
                      demo.PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.AT_SOURCE
                    ],
                    [
                      'At Target',
                      demo.PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.AT_TARGET
                    ],
                    ['Centered', demo.PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.CENTERED]
                  ]
                }),
                demo.options.TypeAttribute(
                  demo.PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.$class
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
           * @type {demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge}
           */
          $labelPlacementSideOfEdgeItem: null,

          /** @type {demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge} */
          labelPlacementSideOfEdgeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Side of Edge'),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 30),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    [
                      'Anywhere',
                      demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ANYWHERE
                    ],
                    ['On Edge', demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ON_EDGE],
                    ['Left', demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.LEFT],
                    ['Right', demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.RIGHT],
                    [
                      'Left or Right',
                      demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.LEFT_OR_RIGHT
                    ]
                  ]
                }),
                demo.options.TypeAttribute(
                  demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.$class
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
                demo.options.LabelAttribute('Distance'),
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
                  demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ON_EDGE
              )
            }
          },

          $initPolylineEdgeRouterConfig: function() {
            this.$scopeItem = yfiles.router.Scope.ROUTE_ALL_EDGES
            this.$optimizationStrategyItem = demo.PolylineEdgeRouterConfig.EnumStrategies.BALANCED
            this.$monotonicRestrictionItem = demo.PolylineEdgeRouterConfig.EnumMonotonyFlags.NONE
            this.$labelPlacementOrientationItem =
              demo.PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.PARALLEL
            this.$labelPlacementAlongEdgeItem =
              demo.PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.ANYWHERE
            this.$labelPlacementSideOfEdgeItem =
              demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ANYWHERE
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
            }),

            /**
             * Adds a mapper with a {@link yfiles.layout.PreferredPlacementDescriptor} that matches the given settings
             * to the mapper registry of the given graph. In addition, sets the label model of all edge labels to free
             * since that model can realizes any label placement calculated by a layout algorithm.
             */
            addPreferredPlacementDescriptor: function(
              graph,
              placeAlongEdge,
              sideOfEdge,
              orientation,
              distanceToEdge
            ) {
              const model = new yfiles.graph.FreeEdgeLabelModel()
              const descriptor = demo.PolylineEdgeRouterConfig.createPreferredPlacementDescriptor(
                placeAlongEdge,
                sideOfEdge,
                orientation,
                distanceToEdge
              )

              graph.mapperRegistry.createConstantMapper(
                yfiles.graph.ILabel.$class,
                yfiles.layout.IEdgeLabelLayout.$class,
                yfiles.layout.LayoutGraphAdapter
                  .EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY,
                descriptor
              )

              graph.edgeLabels.forEach(label => {
                graph.setLabelLayoutParameter(
                  label,
                  model.findBestParameter(label, model, label.layout)
                )
              })
            },

            /**
             * Creates a new {@link yfiles.layout.PreferredPlacementDescriptor} that matches the given settings.
             * @return {yfiles.layout.PreferredPlacementDescriptor}
             */
            createPreferredPlacementDescriptor: function(
              placeAlongEdge,
              sideOfEdge,
              orientation,
              distanceToEdge
            ) {
              const descriptor = new yfiles.layout.PreferredPlacementDescriptor()

              switch (sideOfEdge) {
                case demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ANYWHERE:
                  descriptor.sideOfEdge = yfiles.layout.LabelPlacements.ANYWHERE
                  break
                case demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.ON_EDGE:
                  descriptor.sideOfEdge = yfiles.layout.LabelPlacements.ON_EDGE
                  break
                case demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.LEFT:
                  descriptor.sideOfEdge = yfiles.layout.LabelPlacements.LEFT_OF_EDGE
                  break
                case demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.RIGHT:
                  descriptor.sideOfEdge = yfiles.layout.LabelPlacements.RIGHT_OF_EDGE
                  break
                case demo.PolylineEdgeRouterConfig.EnumLabelPlacementSideOfEdge.LEFT_OR_RIGHT:
                  descriptor.sideOfEdge =
                    yfiles.layout.LabelPlacements.LEFT_OF_EDGE |
                    yfiles.layout.LabelPlacements.RIGHT_OF_EDGE
                  break
                default:
                  descriptor.sideOfEdge = yfiles.layout.LabelPlacements.ANYWHERE
                  break
              }

              switch (placeAlongEdge) {
                case demo.PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.ANYWHERE:
                  descriptor.placeAlongEdge = yfiles.layout.LabelPlacements.ANYWHERE
                  break
                case demo.PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.AT_SOURCE:
                  descriptor.placeAlongEdge = yfiles.layout.LabelPlacements.AT_SOURCE
                  break
                case demo.PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.AT_TARGET:
                  descriptor.placeAlongEdge = yfiles.layout.LabelPlacements.AT_TARGET
                  break
                case demo.PolylineEdgeRouterConfig.EnumLabelPlacementAlongEdge.CENTERED:
                  descriptor.placeAlongEdge = yfiles.layout.LabelPlacements.AT_CENTER
                  break
                default:
                  descriptor.placeAlongEdge = yfiles.layout.LabelPlacements.ANYWHERE
                  break
              }

              switch (orientation) {
                case demo.PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.PARALLEL:
                  descriptor.angle = 0.0
                  descriptor.angleReference =
                    yfiles.layout.LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
                  break
                case demo.PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.ORTHOGONAL:
                  descriptor.angle = Math.PI / 2
                  descriptor.angleReference =
                    yfiles.layout.LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
                  break
                case demo.PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.HORIZONTAL:
                  descriptor.angle = 0.0
                  descriptor.angleReference = yfiles.layout.LabelAngleReferences.ABSOLUTE
                  break
                case demo.PolylineEdgeRouterConfig.EnumLabelPlacementOrientation.VERTICAL:
                  descriptor.angle = Math.PI / 2
                  descriptor.angleReference = yfiles.layout.LabelAngleReferences.ABSOLUTE
                  break
                default:
                  descriptor.angle = 0.0
                  descriptor.angleReference =
                    yfiles.layout.LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
                  break
              }

              descriptor.distanceToEdge = distanceToEdge
              return descriptor
            },

            /**
             * Specifies constants for the preferred placement along an edge used by layout configurations.
             */
            EnumLabelPlacementAlongEdge: new yfiles.lang.EnumDefinition(() => {
              return {
                ANYWHERE: 0,
                AT_SOURCE: 1,
                AT_TARGET: 2,
                CENTERED: 3
              }
            }),

            /**
             * Specifies constants for the preferred placement at a side of an edge used by layout configurations.
             */
            EnumLabelPlacementSideOfEdge: new yfiles.lang.EnumDefinition(() => {
              return {
                ANYWHERE: 0,
                ON_EDGE: 1,
                LEFT: 2,
                RIGHT: 3,
                LEFT_OR_RIGHT: 4
              }
            }),

            /**
             * Specifies constants for the orientation of an edge label used by layout configurations.
             */
            EnumLabelPlacementOrientation: new yfiles.lang.EnumDefinition(() => {
              return {
                PARALLEL: 0,
                ORTHOGONAL: 1,
                HORIZONTAL: 2,
                VERTICAL: 3
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
