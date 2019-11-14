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
       * @class
       * @extends demo.LayoutConfiguration
       */
      exports.RadialLayoutConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.RadialLayoutConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('RadialLayout')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)

            const layout = new yfiles.radial.RadialLayout()

            this.centerStrategyItem = yfiles.radial.CenterNodesPolicy.WEIGHTED_CENTRALITY
            this.layeringStrategyItem = yfiles.radial.LayeringStrategy.BFS
            this.minimumLayerDistanceItem = layout.minimumLayerDistance | 0
            this.minimumNodeToNodeDistanceItem = layout.minimumNodeToNodeDistance | 0
            this.maximumChildSectorSizeItem = layout.maximumChildSectorAngle | 0
            this.edgeRoutingStrategyItem = yfiles.radial.EdgeRoutingStrategy.ARC
            this.edgeSmoothnessItem =
              Math.min(
                demo.RadialLayoutConfig.MAXIMUM_SMOOTHNESS,
                (1 +
                  demo.RadialLayoutConfig.MAXIMUM_SMOOTHNESS *
                    demo.RadialLayoutConfig.SMOOTHNESS_ANGLE_FACTOR -
                  layout.minimumBendAngle) /
                  demo.RadialLayoutConfig.SMOOTHNESS_ANGLE_FACTOR
              ) | 0
            this.edgeBundlingStrengthItem = 0.95

            this.edgeLabelingItem = false
            this.considerNodeLabelsItem = layout.considerNodeLabels
            this.labelPlacementAlongEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED
            this.labelPlacementSideOfEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
            this.labelPlacementOrientationItem =
              demo.LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
            this.labelPlacementDistanceItem = 10
          },

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout algorithm.
           */
          createConfiguredLayout: function(graphComponent) {
            const layout = new yfiles.radial.RadialLayout()
            layout.minimumNodeToNodeDistance = this.minimumNodeToNodeDistanceItem

            if (
              this.edgeRoutingStrategyItem !==
              demo.RadialLayoutConfig.EnumEdgeRoutingStrategies.BUNDLED
            ) {
              layout.edgeRoutingStrategy = this.edgeRoutingStrategyItem
            }
            const minimumBendAngle =
              1 +
              (demo.RadialLayoutConfig.MAXIMUM_SMOOTHNESS - this.edgeSmoothnessItem) *
                demo.RadialLayoutConfig.SMOOTHNESS_ANGLE_FACTOR
            layout.minimumBendAngle = minimumBendAngle
            layout.minimumLayerDistance = this.minimumLayerDistanceItem
            layout.maximumChildSectorAngle = this.maximumChildSectorSizeItem
            layout.centerNodesPolicy = this.centerStrategyItem
            layout.layeringStrategy = this.layeringStrategyItem
            layout.considerNodeLabels = this.considerNodeLabelsItem

            const ebc = layout.edgeBundling
            const bundlingDescriptor = new yfiles.layout.EdgeBundleDescriptor()
            bundlingDescriptor.bundled =
              this.edgeRoutingStrategyItem ===
              demo.RadialLayoutConfig.EnumEdgeRoutingStrategies.BUNDLED
            ebc.bundlingStrength = this.edgeBundlingStrengthItem
            ebc.defaultBundleDescriptor = bundlingDescriptor

            if (this.edgeLabelingItem) {
              const labeling = new yfiles.labeling.GenericLabeling()
              labeling.placeEdgeLabels = true
              labeling.placeNodeLabels = false
              labeling.reduceAmbiguity = this.reduceAmbiguityItem
              layout.labelingEnabled = true
              layout.labeling = labeling
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
           * Creates and configures the layout data.
           * @return {yfiles.layout.LayoutData} The configured layout data.
           */
          createConfiguredLayoutData: function(graphComponent, layout) {
            const layoutData = new yfiles.radial.RadialLayoutData()

            if (this.centerStrategyItem === yfiles.radial.CenterNodesPolicy.CUSTOM) {
              layoutData.centerNodes.delegate = node => graphComponent.selection.isSelected(node)
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
          GeneralGroup: {
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
          LabelingGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Labeling'),
                demo.options.OptionGroupAttribute('RootGroup', 20),
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
              return (
                '<p>The radial layout style arranges the nodes of a graph on concentric circles. Similar to hierarchic layouts, the overall flow of the graph is nicely visualized.</p>' +
                '<p>This style is well suited for the visualization of directed graphs and tree-like structures.</p>'
              )
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumLayerDistanceItem: 0,

          /** @type {number} */
          minimumLayerDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Circle Distance',
                  '#/api/yfiles.radial.RadialLayout#RadialLayout-property-minimumLayerDistance'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 10),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 1000
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumLayerDistanceItem
            },
            set: function(value) {
              this.$minimumLayerDistanceItem = value
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
                  'Minimum Node Distance',
                  '#/api/yfiles.radial.RadialLayout#RadialLayout-property-minimumNodeToNodeDistance'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 300
                }),
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
          $maximumChildSectorSizeItem: 0,

          /** @type {number} */
          maximumChildSectorSizeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Maximum Child Sector Size',
                  '#/api/yfiles.radial.RadialLayout#RadialLayout-property-maximumChildSectorAngle'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 30),
                demo.options.MinMaxAttribute().init({
                  min: 15,
                  max: 360
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$maximumChildSectorSizeItem
            },
            set: function(value) {
              this.$maximumChildSectorSizeItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.radial.EdgeRoutingStrategy}
           */
          $edgeRoutingStrategyItem: 0,

          /** @type {yfiles.radial.EdgeRoutingStrategy} */
          edgeRoutingStrategyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Routing Style',
                  '#/api/yfiles.radial.RadialLayout#RadialLayout-property-edgeRoutingStrategy'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 40),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Straight', demo.RadialLayoutConfig.EnumEdgeRoutingStrategies.POLYLINE],
                    ['Arc', demo.RadialLayoutConfig.EnumEdgeRoutingStrategies.ARC],
                    ['Bundled', demo.RadialLayoutConfig.EnumEdgeRoutingStrategies.BUNDLED]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.radial.EdgeRoutingStrategy.$class)
              ]
            },
            get: function() {
              return this.$edgeRoutingStrategyItem
            },
            set: function(value) {
              this.$edgeRoutingStrategyItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $edgeSmoothnessItem: 0,

          /** @type {number} */
          edgeSmoothnessItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Arc Smoothness',
                  '#/api/yfiles.radial.RadialLayout#RadialLayout-property-minimumBendAngle'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 50),
                demo.options.MinMaxAttribute().init({
                  min: demo.RadialLayoutConfig.MINIMUM_SMOOTHNESS,
                  max: demo.RadialLayoutConfig.MAXIMUM_SMOOTHNESS
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$edgeSmoothnessItem
            },
            set: function(value) {
              this.$edgeSmoothnessItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableEdgeSmoothnessItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.edgeRoutingStrategyItem !== yfiles.radial.EdgeRoutingStrategy.ARC
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $edgeBundlingStrengthItem: 1.0,

          /** @type {number} */
          edgeBundlingStrengthItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Bundling Strength',
                  '#/api/yfiles.layout.EdgeBundling#EdgeBundling-property-bundlingStrength'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 55),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 1.0,
                  step: 0.01
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$edgeBundlingStrengthItem
            },
            set: function(value) {
              this.$edgeBundlingStrengthItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableEdgeBundlingStrengthItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.edgeRoutingStrategyItem !==
                demo.RadialLayoutConfig.EnumEdgeRoutingStrategies.BUNDLED
              )
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.radial.CenterNodesPolicy}
           */
          $centerStrategyItem: null,

          /** @type {yfiles.radial.CenterNodesPolicy} */
          centerStrategyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Center Allocation Strategy',
                  '#/api/yfiles.radial.RadialLayout#RadialLayout-property-centerNodesPolicy'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 60),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Directed', yfiles.radial.CenterNodesPolicy.DIRECTED],
                    ['Centrality', yfiles.radial.CenterNodesPolicy.CENTRALITY],
                    ['Weighted Centrality', yfiles.radial.CenterNodesPolicy.WEIGHTED_CENTRALITY],
                    ['Selected Nodes', yfiles.radial.CenterNodesPolicy.CUSTOM]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.radial.CenterNodesPolicy.$class)
              ]
            },
            get: function() {
              return this.$centerStrategyItem
            },
            set: function(value) {
              this.$centerStrategyItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.radial.LayeringStrategy}
           */
          $layeringStrategyItem: 0,

          /** @type {yfiles.radial.LayeringStrategy} */
          layeringStrategyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Circle Assignment Strategy',
                  '#/api/yfiles.radial.RadialLayout#RadialLayout-property-layeringStrategy'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 70),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Distance From Center', yfiles.radial.LayeringStrategy.BFS],
                    ['Hierarchic', yfiles.radial.LayeringStrategy.HIERARCHICAL]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.radial.LayeringStrategy.$class)
              ]
            },
            get: function() {
              return this.$layeringStrategyItem
            },
            set: function(value) {
              this.$layeringStrategyItem = value
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
                  '#/api/yfiles.radial.RadialLayout#RadialLayout-property-considerNodeLabels'
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
          $edgeLabelingItem: false,

          /** @type {boolean} */
          edgeLabelingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Edge Labeling',
                  '#/api/yfiles.radial.RadialLayout#MultiStageLayout-property-labelingEnabled'
                ),
                demo.options.OptionGroupAttribute('EdgePropertiesGroup', 10),
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
                demo.options.OptionGroupAttribute('EdgePropertiesGroup', 20),
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

          /** @lends {demo.RadialLayoutConfig} */
          $static: {
            /**
             * @type {number}
             */
            MAXIMUM_SMOOTHNESS: 10,

            /**
             * @type {number}
             */
            MINIMUM_SMOOTHNESS: 1,

            /**
             * @type {number}
             */
            SMOOTHNESS_ANGLE_FACTOR: 4,

            EnumEdgeRoutingStrategies: new yfiles.lang.EnumDefinition(() => {
              return {
                ARC: yfiles.radial.EdgeRoutingStrategy.ARC,
                POLYLINE: yfiles.radial.EdgeRoutingStrategy.POLYLINE,
                BUNDLED: 2
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
