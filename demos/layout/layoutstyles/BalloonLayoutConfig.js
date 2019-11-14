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
      exports.BalloonLayoutConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.BalloonLayoutConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('BalloonLayout')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)
            this.$initBalloonLayoutConfig()
            const layout = new yfiles.tree.BalloonLayout()

            this.rootNodePolicyItem = yfiles.tree.RootNodePolicy.DIRECTED_ROOT
            this.routingStyleForNonTreeEdgesItem = demo.BalloonLayoutConfig.EnumRoute.ORTHOGONAL
            this.actOnSelectionOnlyItem = false
            this.preferredChildWedgeItem = layout.preferredChildWedge
            this.preferredRootWedgeItem = layout.preferredRootWedge
            this.minimumEdgeLengthItem = layout.minimumEdgeLength
            this.compactnessFactorItem = layout.compactnessFactor
            this.allowOverlapsItem = layout.allowOverlaps
            this.balloonFromSketchItem = layout.fromSketchMode
            this.placeChildrenInterleavedItem =
              layout.interleavedMode === yfiles.tree.InterleavedMode.ALL_NODES
            this.straightenChainsItem = layout.chainStraighteningMode

            this.nodeLabelingStyleItem =
              demo.BalloonLayoutConfig.EnumNodeLabelingPolicies.CONSIDER_CURRENT_POSITION
            this.edgeLabelingItem = demo.BalloonLayoutConfig.EnumEdgeLabeling.NONE
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
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout algorithm.
           */
          createConfiguredLayout: function(graphComponent) {
            const layout = new yfiles.tree.BalloonLayout()

            layout.componentLayout.style = yfiles.layout.ComponentArrangementStyles.MULTI_ROWS

            layout.rootNodePolicy = this.rootNodePolicyItem
            layout.preferredChildWedge = this.preferredChildWedgeItem
            layout.preferredRootWedge = this.preferredRootWedgeItem
            layout.minimumEdgeLength = this.minimumEdgeLengthItem
            layout.compactnessFactor = 1 - this.compactnessFactorItem
            layout.allowOverlaps = this.allowOverlapsItem
            layout.fromSketchMode = this.balloonFromSketchItem
            layout.chainStraighteningMode = this.straightenChainsItem
            layout.interleavedMode = this.placeChildrenInterleavedItem
              ? yfiles.tree.InterleavedMode.ALL_NODES
              : yfiles.tree.InterleavedMode.OFF

            switch (this.nodeLabelingStyleItem) {
              case demo.BalloonLayoutConfig.EnumNodeLabelingPolicies.NONE:
                layout.considerNodeLabels = false
                break
              case demo.BalloonLayoutConfig.EnumNodeLabelingPolicies.RAYLIKE_LEAVES:
                layout.integratedNodeLabeling = true
                layout.nodeLabelingPolicy = yfiles.tree.NodeLabelingPolicy.RAY_LIKE_LEAVES
                break
              case demo.BalloonLayoutConfig.EnumNodeLabelingPolicies.CONSIDER_CURRENT_POSITION:
                layout.considerNodeLabels = true
                break
              case demo.BalloonLayoutConfig.EnumNodeLabelingPolicies.HORIZONTAL:
                layout.integratedNodeLabeling = true
                layout.nodeLabelingPolicy = yfiles.tree.NodeLabelingPolicy.HORIZONTAL
                break
              default:
                layout.considerNodeLabels = false
                break
            }

            // configures tree reduction state and non-tree edge routing.
            layout.subgraphLayoutEnabled = this.actOnSelectionOnlyItem
            const multiStageLayout = layout

            const treeReductionStage = new yfiles.tree.TreeReductionStage()
            multiStageLayout.appendStage(treeReductionStage)
            if (
              this.routingStyleForNonTreeEdgesItem === demo.BalloonLayoutConfig.EnumRoute.ORGANIC
            ) {
              const organic = new yfiles.router.OrganicEdgeRouter()
              treeReductionStage.nonTreeEdgeRouter = organic
              treeReductionStage.nonTreeEdgeSelectionKey =
                yfiles.router.OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
            } else if (
              this.routingStyleForNonTreeEdgesItem === demo.BalloonLayoutConfig.EnumRoute.ORTHOGONAL
            ) {
              const edgeRouter = new yfiles.router.EdgeRouter()
              edgeRouter.rerouting = true
              edgeRouter.scope = 'ROUTE_AFFECTED_EDGES'
              treeReductionStage.nonTreeEdgeSelectionKey = edgeRouter.affectedEdgesDpKey
              treeReductionStage.nonTreeEdgeRouter = edgeRouter
            } else if (
              this.routingStyleForNonTreeEdgesItem ===
              demo.BalloonLayoutConfig.EnumRoute.STRAIGHTLINE
            ) {
              treeReductionStage.nonTreeEdgeRouter = treeReductionStage.createStraightLineRouter()
            } else if (
              this.routingStyleForNonTreeEdgesItem === demo.BalloonLayoutConfig.EnumRoute.BUNDLED
            ) {
              const ebc = treeReductionStage.edgeBundling
              const bundlingDescriptor = new yfiles.layout.EdgeBundleDescriptor()
              bundlingDescriptor.bundled =
                this.routingStyleForNonTreeEdgesItem === demo.BalloonLayoutConfig.EnumRoute.BUNDLED
              ebc.bundlingStrength = this.edgeBundlingStrengthItem
              ebc.defaultBundleDescriptor = bundlingDescriptor
            }

            if (this.edgeLabelingItem === demo.BalloonLayoutConfig.EnumEdgeLabeling.GENERIC) {
              layout.integratedEdgeLabeling = false

              const genericLabeling = new yfiles.labeling.GenericLabeling()
              genericLabeling.placeEdgeLabels = true
              genericLabeling.placeNodeLabels = false
              genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
              layout.labelingEnabled = true
              layout.labeling = genericLabeling
            } else if (
              this.edgeLabelingItem === demo.BalloonLayoutConfig.EnumEdgeLabeling.INTEGRATED
            ) {
              layout.integratedEdgeLabeling = true
              treeReductionStage.nonTreeEdgeLabelingAlgorithm = new yfiles.labeling.GenericLabeling()
            }

            if (
              this.nodeLabelingStyleItem ===
                demo.BalloonLayoutConfig.EnumNodeLabelingPolicies.RAYLIKE_LEAVES ||
              this.nodeLabelingStyleItem ===
                demo.BalloonLayoutConfig.EnumNodeLabelingPolicies.HORIZONTAL
            ) {
              graphComponent.graph.nodeLabels.forEach(label => {
                graphComponent.graph.setLabelLayoutParameter(
                  label,
                  yfiles.graph.FreeNodeLabelModel.INSTANCE.findBestParameter(
                    label,
                    yfiles.graph.FreeNodeLabelModel.INSTANCE,
                    label.layout
                  )
                )
              })
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
            const layoutData = new yfiles.tree.BalloonLayoutData()

            if (this.rootNodePolicyItem === yfiles.tree.RootNodePolicy.SELECTED_ROOT) {
              const selection = graphComponent.selection.selectedNodes

              if (selection.size > 0) {
                const root = selection.first()
                layoutData.treeRoot.delegate = node => node === root
              }
            }

            return layoutData
          },

          // ReSharper disable InconsistentNaming
          // ReSharper disable UnusedMember.Global
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
                "<p style='margin-top:0'>The balloon layout style is a tree layout style that positions the subtrees in a radial " +
                'fashion around their root nodes. It is ideally suited for larger trees.</p>'
              )
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.tree.RootNodePolicy}
           */
          $rootNodePolicyItem: null,

          /** @type {yfiles.tree.RootNodePolicy} */
          rootNodePolicyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Root Node Policy',
                  '#/api/yfiles.tree.BalloonLayout#BalloonLayout-property-rootNodePolicy'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Directed Root', yfiles.tree.RootNodePolicy.DIRECTED_ROOT],
                    ['Center Root', yfiles.tree.RootNodePolicy.CENTER_ROOT],
                    ['Weighted Center Root', yfiles.tree.RootNodePolicy.WEIGHTED_CENTER_ROOT],
                    ['Selected Root', yfiles.tree.RootNodePolicy.SELECTED_ROOT]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.tree.RootNodePolicy.$class)
              ]
            },
            get: function() {
              return this.$rootNodePolicyItem
            },
            set: function(value) {
              this.$rootNodePolicyItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {demo.BalloonLayoutConfig.EnumRoute}
           */
          $routingStyleForNonTreeEdgesItem: null,

          /** @type {demo.BalloonLayoutConfig.EnumRoute} */
          routingStyleForNonTreeEdgesItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Routing Style for Non-Tree Edges',
                  '#/api/yfiles.tree.TreeReductionStage#TreeReductionStage-property-nonTreeEdgeRouter'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Orthogonal', demo.BalloonLayoutConfig.EnumRoute.ORTHOGONAL],
                    ['Organic', demo.BalloonLayoutConfig.EnumRoute.ORGANIC],
                    ['Straight-Line', demo.BalloonLayoutConfig.EnumRoute.STRAIGHTLINE],
                    ['Bundled', demo.BalloonLayoutConfig.EnumRoute.BUNDLED]
                  ]
                }),
                demo.options.TypeAttribute(demo.BalloonLayoutConfig.EnumRoute.$class)
              ]
            },
            get: function() {
              return this.$routingStyleForNonTreeEdgesItem
            },
            set: function(value) {
              this.$routingStyleForNonTreeEdgesItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $actOnSelectionOnlyItem: false,

          /** @type {boolean} */
          actOnSelectionOnlyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Act on Selection Only',
                  '#/api/yfiles.tree.BalloonLayout#MultiStageLayout-property-subgraphLayoutEnabled'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$actOnSelectionOnlyItem
            },
            set: function(value) {
              this.$actOnSelectionOnlyItem = value
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
                demo.options.OptionGroupAttribute('GeneralGroup', 40),
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
                this.routingStyleForNonTreeEdgesItem !== demo.BalloonLayoutConfig.EnumRoute.BUNDLED
              )
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $preferredChildWedgeItem: 0,

          /** @type {number} */
          preferredChildWedgeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Preferred Child Wedge',
                  '#/api/yfiles.tree.BalloonLayout#BalloonLayout-property-preferredChildWedge'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 50),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 359
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$preferredChildWedgeItem
            },
            set: function(value) {
              this.$preferredChildWedgeItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $preferredRootWedgeItem: 0,

          /** @type {number} */
          preferredRootWedgeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Preferred Root Wedge',
                  '#/api/yfiles.tree.BalloonLayout#BalloonLayout-property-preferredRootWedge'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 60),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 360
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$preferredRootWedgeItem
            },
            set: function(value) {
              this.$preferredRootWedgeItem = value
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
                  '#/api/yfiles.tree.BalloonLayout#BalloonLayout-property-minimumEdgeLength'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 70),
                demo.options.MinMaxAttribute().init({
                  min: 10,
                  max: 400
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

          /**
           * Backing field for below property
           * @type {number}
           */
          $compactnessFactorItem: 0,

          /** @type {number} */
          compactnessFactorItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Compactness Factor',
                  '#/api/yfiles.tree.BalloonLayout#BalloonLayout-property-compactnessFactor'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 80),
                demo.options.MinMaxAttribute().init({
                  min: 0.1,
                  max: 0.9,
                  step: 0.01
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$compactnessFactorItem
            },
            set: function(value) {
              this.$compactnessFactorItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $allowOverlapsItem: false,

          /** @type {boolean} */
          allowOverlapsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Allow Overlaps',
                  '#/api/yfiles.tree.BalloonLayout#BalloonLayout-property-allowOverlaps'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 90),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$allowOverlapsItem
            },
            set: function(value) {
              this.$allowOverlapsItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $balloonFromSketchItem: false,

          /** @type {boolean} */
          balloonFromSketchItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Use Drawing as Sketch',
                  '#/api/yfiles.tree.BalloonLayout#BalloonLayout-property-fromSketchMode'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 100),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$balloonFromSketchItem
            },
            set: function(value) {
              this.$balloonFromSketchItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $placeChildrenInterleavedItem: false,

          /** @type {boolean} */
          placeChildrenInterleavedItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Place Children Interleaved',
                  '#/api/yfiles.tree.BalloonLayout#BalloonLayout-property-interleavedMode'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 110),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$placeChildrenInterleavedItem
            },
            set: function(value) {
              this.$placeChildrenInterleavedItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $straightenChainsItem: false,

          /** @type {boolean} */
          straightenChainsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Straighten Chains',
                  '#/api/yfiles.tree.BalloonLayout#BalloonLayout-property-chainStraighteningMode'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 120),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$straightenChainsItem
            },
            set: function(value) {
              this.$straightenChainsItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {demo.BalloonLayoutConfig.EnumNodeLabelingPolicies}
           */
          $nodeLabelingStyleItem: null,

          /** @type {demo.BalloonLayoutConfig.EnumNodeLabelingPolicies} */
          nodeLabelingStyleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Node Labeling',
                  '#/api/yfiles.tree.BalloonLayout#BalloonLayout-property-considerNodeLabels'
                ),
                demo.options.OptionGroupAttribute('NodePropertiesGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Ignore Labels', demo.BalloonLayoutConfig.EnumNodeLabelingPolicies.NONE],
                    [
                      'Consider Labels',
                      demo.BalloonLayoutConfig.EnumNodeLabelingPolicies.CONSIDER_CURRENT_POSITION
                    ],
                    ['Horizontal', demo.BalloonLayoutConfig.EnumNodeLabelingPolicies.HORIZONTAL],
                    [
                      'Ray-like at Leaves',
                      demo.BalloonLayoutConfig.EnumNodeLabelingPolicies.RAYLIKE_LEAVES
                    ]
                  ]
                }),
                demo.options.TypeAttribute(demo.BalloonLayoutConfig.EnumNodeLabelingPolicies.$class)
              ]
            },
            get: function() {
              return this.$nodeLabelingStyleItem
            },
            set: function(value) {
              this.$nodeLabelingStyleItem = value
            }
          },

          /**
           * @type {demo.BalloonLayoutConfig.EnumEdgeLabeling}
           */
          $edgeLabelingItem: null,

          /** @type {demo.BalloonLayoutConfig.EnumEdgeLabeling} */
          edgeLabelingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Edge Labeling',
                  '#/api/yfiles.tree.BalloonLayout#MultiStageLayout-property-labelingEnabled'
                ),
                demo.options.OptionGroupAttribute('EdgePropertiesGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['None', demo.BalloonLayoutConfig.EnumEdgeLabeling.NONE],
                    ['Integrated', demo.BalloonLayoutConfig.EnumEdgeLabeling.INTEGRATED],
                    ['Generic', demo.BalloonLayoutConfig.EnumEdgeLabeling.GENERIC]
                  ]
                }),
                demo.options.TypeAttribute(demo.BalloonLayoutConfig.EnumEdgeLabeling.$class)
              ]
            },
            get: function() {
              return this.$edgeLabelingItem
            },
            set: function(value) {
              this.$edgeLabelingItem = value
              if (value === demo.BalloonLayoutConfig.EnumEdgeLabeling.INTEGRATED) {
                this.labelPlacementOrientationItem =
                  demo.LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL
                this.labelPlacementAlongEdgeItem =
                  demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET
                this.labelPlacementDistanceItem = 0
              }
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
              return this.edgeLabelingItem !== demo.BalloonLayoutConfig.EnumEdgeLabeling.GENERIC
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
              return (
                this.edgeLabelingItem === demo.BalloonLayoutConfig.EnumEdgeLabeling.NONE ||
                this.edgeLabelingItem === demo.BalloonLayoutConfig.EnumEdgeLabeling.INTEGRATED
              )
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
              return (
                this.edgeLabelingItem === demo.BalloonLayoutConfig.EnumEdgeLabeling.NONE ||
                this.edgeLabelingItem === demo.BalloonLayoutConfig.EnumEdgeLabeling.INTEGRATED
              )
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
              return this.edgeLabelingItem === demo.BalloonLayoutConfig.EnumEdgeLabeling.NONE
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
                this.edgeLabelingItem === demo.BalloonLayoutConfig.EnumEdgeLabeling.NONE ||
                this.edgeLabelingItem === demo.BalloonLayoutConfig.EnumEdgeLabeling.INTEGRATED ||
                this.labelPlacementSideOfEdgeItem ===
                  demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
              )
            }
          },

          $initBalloonLayoutConfig: function() {
            this.$rootNodePolicyItem = yfiles.tree.RootNodePolicy.DIRECTED_ROOT
            this.$routingStyleForNonTreeEdgesItem = demo.BalloonLayoutConfig.EnumRoute.ORTHOGONAL
            this.$nodeLabelingStyleItem = demo.BalloonLayoutConfig.EnumNodeLabelingPolicies.NONE
            this.$edgeLabelingItem = demo.BalloonLayoutConfig.EnumEdgeLabeling.NONE
            this.$labelPlacementOrientationItem =
              demo.LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL
            this.$labelPlacementAlongEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.ANYWHERE
            this.$labelPlacementSideOfEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ANYWHERE
          },

          /** @lends {demo.BalloonLayoutConfig} */
          $static: {
            EnumRoute: new yfiles.lang.EnumDefinition(() => {
              return {
                ORTHOGONAL: 0,
                ORGANIC: 1,
                STRAIGHTLINE: 2,
                BUNDLED: 3
              }
            }),

            EnumEdgeLabeling: new yfiles.lang.EnumDefinition(() => {
              return {
                NONE: 0,
                INTEGRATED: 1,
                GENERIC: 2
              }
            }),

            EnumNodeLabelingPolicies: new yfiles.lang.EnumDefinition(() => {
              return {
                NONE: 0,
                HORIZONTAL: 1,
                RAYLIKE_LEAVES: 2,
                CONSIDER_CURRENT_POSITION: 3
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
