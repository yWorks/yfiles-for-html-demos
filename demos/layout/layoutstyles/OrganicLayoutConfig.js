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
      exports.OrganicLayoutConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.OrganicLayoutConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('OrganicLayout')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)
            const layout = new yfiles.organic.OrganicLayout()
            this.scopeItem = yfiles.organic.Scope.ALL
            this.preferredEdgeLengthItem = layout.preferredEdgeLength
            this.allowNodeOverlapsItem = layout.nodeOverlapsAllowed
            this.minimumNodeDistanceItem = 10
            this.avoidNodeEdgeOverlapsItem = layout.nodeEdgeOverlapAvoided
            this.compactnessItem = layout.compactnessFactor
            this.useAutoClusteringItem = layout.clusterNodes
            this.autoClusteringQualityItem = layout.clusteringQuality

            this.restrictOutputItem = demo.OrganicLayoutConfig.EnumOutputRestrictions.NONE
            this.rectCageUseViewItem = true
            this.cageXItem = 0.0
            this.cageYItem = 0.0
            this.cageWidthItem = 1000.0
            this.cageHeightItem = 1000.0
            this.arCageUseViewItem = true
            this.cageRatioItem = 1.0

            this.groupLayoutPolicyItem =
              demo.OrganicLayoutConfig.EnumGroupLayoutPolicy.LAYOUT_GROUPS

            this.qualityTimeRatioItem = layout.qualityTimeRatio
            this.maximumDurationItem = layout.maximumDuration / 1000
            this.activateDeterministicModeItem = layout.deterministic

            this.cycleSubstructureItem = yfiles.organic.CycleSubstructureStyle.NONE
            this.chainSubstructureItem = yfiles.organic.ChainSubstructureStyle.NONE
            this.starSubstructureItem = yfiles.organic.StarSubstructureStyle.NONE
            this.parallelSubstructureItem = yfiles.organic.ParallelSubstructureStyle.NONE

            this.considerNodeLabelsItem = layout.considerNodeLabels
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
           * @type {yfiles.layout.ILayoutStage}
           */
          $preStage: null,

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout algorithm.
           */
          createConfiguredLayout: function(graphComponent) {
            const layout = new yfiles.organic.OrganicLayout()
            layout.preferredEdgeLength = this.preferredEdgeLengthItem
            layout.considerNodeLabels = this.considerNodeLabelsItem
            layout.nodeOverlapsAllowed = this.allowNodeOverlapsItem
            layout.minimumNodeDistance = this.minimumNodeDistanceItem
            layout.scope = this.scopeItem
            layout.compactnessFactor = this.compactnessItem
            layout.considerNodeSizes = true
            layout.clusterNodes = this.useAutoClusteringItem
            layout.clusteringQuality = this.autoClusteringQualityItem
            layout.nodeEdgeOverlapAvoided = this.avoidNodeEdgeOverlapsItem
            layout.deterministic = this.activateDeterministicModeItem
            layout.maximumDuration = 1000 * this.maximumDurationItem
            layout.qualityTimeRatio = this.qualityTimeRatioItem

            if (this.edgeLabelingItem) {
              const genericLabeling = new yfiles.labeling.GenericLabeling()
              genericLabeling.placeEdgeLabels = true
              genericLabeling.placeNodeLabels = false
              genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
              layout.labelingEnabled = true
              layout.labeling = genericLabeling
            }
            layout.componentLayout.style = yfiles.layout.ComponentArrangementStyles.MULTI_ROWS

            this.$configureOutputRestrictions(graphComponent, layout)

            layout.cycleSubstructureStyle = this.cycleSubstructureItem
            layout.chainSubstructureStyle = this.chainSubstructureItem
            layout.starSubstructureStyle = this.starSubstructureItem
            layout.parallelSubstructureStyle = this.parallelSubstructureItem

            if (this.useEdgeGroupingItem) {
              graphComponent.graph.mapperRegistry.createConstantMapper(
                yfiles.graph.IEdge.$class,
                yfiles.lang.Object.$class,
                yfiles.layout.PortConstraintKeys.SOURCE_GROUP_ID_DP_KEY,
                'Group'
              )
              graphComponent.graph.mapperRegistry.createConstantMapper(
                yfiles.graph.IEdge.$class,
                yfiles.lang.Object.$class,
                yfiles.layout.PortConstraintKeys.TARGET_GROUP_ID_DP_KEY,
                'Group'
              )
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
            const layoutData = new yfiles.organic.OrganicLayoutData()

            switch (this.groupLayoutPolicyItem) {
              case demo.OrganicLayoutConfig.EnumGroupLayoutPolicy.IGNORE_GROUPS:
                this.$preStage = new yfiles.layout.HideGroupsStage()
                layout.prependStage(this.$preStage)
                break
              case demo.OrganicLayoutConfig.EnumGroupLayoutPolicy.LAYOUT_GROUPS:
                // do nothing...
                break
              case demo.OrganicLayoutConfig.EnumGroupLayoutPolicy.FIX_GROUP_BOUNDS:
                layoutData.groupNodeModes.delegate = node => {
                  return graphComponent.graph.isGroupNode(node)
                    ? yfiles.organic.GroupNodeMode.FIX_BOUNDS
                    : yfiles.organic.GroupNodeMode.NORMAL
                }
                break
              case demo.OrganicLayoutConfig.EnumGroupLayoutPolicy.FIX_GROUP_CONTENTS:
                layoutData.groupNodeModes.delegate = node => {
                  return graphComponent.graph.isGroupNode(node)
                    ? yfiles.organic.GroupNodeMode.FIX_CONTENTS
                    : yfiles.organic.GroupNodeMode.NORMAL
                }
                break
              default:
                this.$preStage = new yfiles.layout.HideGroupsStage()
                layout.prependStage(this.$preStage)
                break
            }

            layoutData.affectedNodes.source = graphComponent.selection.selectedNodes

            if (this.edgeDirectednessItem) {
              layoutData.edgeDirectedness.delegate = edge => {
                if (
                  edge.style.showTargetArrows ||
                  (edge.style.targetArrow && edge.style.targetArrow !== yfiles.styles.IArrow.NONE)
                ) {
                  return 1
                }
                return 0
              }
            }
            return layoutData
          },

          $configureOutputRestrictions: function(graphComponent, layout) {
            let viewInfoIsAvailable = false
            const visibleRect = demo.OrganicLayoutConfig.getVisibleRectangle(graphComponent)
            let x = 0,
              y = 0,
              w = 0,
              h = 0
            if (visibleRect !== null) {
              viewInfoIsAvailable = true
              x = visibleRect[0]
              y = visibleRect[1]
              w = visibleRect[2]
              h = visibleRect[3]
            }
            switch (this.restrictOutputItem) {
              case demo.OrganicLayoutConfig.EnumOutputRestrictions.NONE:
                layout.componentLayoutEnabled = true
                layout.outputRestriction = yfiles.organic.OutputRestriction.NONE
                break
              case demo.OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_CAGE:
                if (!viewInfoIsAvailable || !this.rectCageUseViewItem) {
                  x = this.cageXItem
                  y = this.cageYItem
                  w = this.cageWidthItem
                  h = this.cageHeightItem
                }
                layout.outputRestriction = yfiles.organic.OutputRestriction.createRectangularCageRestriction(
                  x,
                  y,
                  w,
                  h
                )
                layout.componentLayoutEnabled = false
                break
              case demo.OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_AR:
                let /**number*/ ratio
                if (viewInfoIsAvailable && this.arCageUseViewItem) {
                  ratio = w / h
                } else {
                  ratio = this.cageRatioItem
                }
                layout.outputRestriction = yfiles.organic.OutputRestriction.createAspectRatioRestriction(
                  ratio
                )
                layout.componentLayoutEnabled = true
                layout.componentLayout.preferredSize = new yfiles.algorithms.YDimension(
                  ratio * 100,
                  100
                )
                break
              case demo.OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_ELLIPTICAL_CAGE:
                if (!viewInfoIsAvailable || !this.rectCageUseViewItem) {
                  x = this.cageXItem
                  y = this.cageYItem
                  w = this.cageWidthItem
                  h = this.cageHeightItem
                }
                layout.outputRestriction = yfiles.organic.OutputRestriction.createEllipticalCageRestriction(
                  x,
                  y,
                  w,
                  h
                )
                layout.componentLayoutEnabled = false
                break
              default:
                layout.componentLayoutEnabled = true
                layout.outputRestriction = yfiles.organic.OutputRestriction.NONE
                break
            }
          },

          /**
           * Called when the layout has finished to remove mappers.
           * @param graphComponent the given graphComponent
           */
          postProcess: function(graphComponent) {
            if (this.useEdgeGroupingItem) {
              const mapperRegistry = graphComponent.graph.mapperRegistry
              mapperRegistry.removeMapper(yfiles.layout.PortConstraintKeys.SOURCE_GROUP_ID_DP_KEY)
              mapperRegistry.removeMapper(yfiles.layout.PortConstraintKeys.TARGET_GROUP_ID_DP_KEY)
            }
          },

          /**
           * Enables different layout styles for possible detected substructures.
           */
          enableSubstructures: function() {
            this.cycleSubstructureItem = yfiles.organic.CycleSubstructureStyle.CIRCULAR
            this.chainSubstructureItem = yfiles.organic.ChainSubstructureStyle.STRAIGHT_LINE
            this.starSubstructureItem = yfiles.organic.StarSubstructureStyle.RADIAL
            this.parallelSubstructureItem = yfiles.organic.ParallelSubstructureStyle.STRAIGHT_LINE
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
          VisualGroup: {
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
          RestrictionsGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Restrictions'),
                demo.options.OptionGroupAttribute('RootGroup', 20),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          CageGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Bounds'),
                demo.options.OptionGroupAttribute('RestrictionsGroup', 20),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          ARGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Aspect Ratio'),
                demo.options.OptionGroupAttribute('RestrictionsGroup', 30),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          GroupingGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Grouping'),
                demo.options.OptionGroupAttribute('RootGroup', 30),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          AlgorithmGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Algorithm'),
                demo.options.OptionGroupAttribute('RootGroup', 40),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          SubstructureLayoutGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Substructure Layout'),
                demo.options.OptionGroupAttribute('RootGroup', 50),
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
                demo.options.OptionGroupAttribute('RootGroup', 60),
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
              return "<p style='margin-top:0'>The organic layout style is based on the force-directed layout paradigm. This algorithm simulates physical forces and rearranges the positions of the nodes in such a way that the sum of the forces emitted by the nodes and the edges reaches a (local) minimum.</p><p>This style is well suited for the visualization of highly connected backbone regions with attached peripheral ring or tree structures. In a diagram arranged by this algorithm, these regions of a network can be easily identified.</p><p>The organic layout style is a multi-purpose layout for undirected graphs. It produces clear representations of complex networks and is especially fitted for application domains such as:</p><ul><li>Bioinformatics</li><li>Enterprise networking</li><li>Knowledge representation</li><li>System management</li><li>WWW visualization</li><li>Mesh visualization</li></ul>"
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.organic.Scope}
           */
          $scopeItem: null,

          /** @type {yfiles.organic.Scope} */
          scopeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Scope',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-scope'
                ),
                demo.options.OptionGroupAttribute('VisualGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['All', yfiles.organic.Scope.ALL],
                    ['Mainly Selection', yfiles.organic.Scope.MAINLY_SUBSET],
                    ['Selection', yfiles.organic.Scope.SUBSET]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.organic.Scope.$class)
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
          $preferredEdgeLengthItem: 0,

          /** @type {number} */
          preferredEdgeLengthItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Preferred Edge Length',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-preferredEdgeLength'
                ),
                demo.options.OptionGroupAttribute('VisualGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 5,
                  max: 500
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$preferredEdgeLengthItem
            },
            set: function(value) {
              this.$preferredEdgeLengthItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $allowNodeOverlapsItem: false,

          /** @type {boolean} */
          allowNodeOverlapsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Allow Overlapping Nodes',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-nodeOverlapsAllowed'
                ),
                demo.options.OptionGroupAttribute('VisualGroup', 40),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$allowNodeOverlapsItem
            },
            set: function(value) {
              this.$allowNodeOverlapsItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableAllowNodeOverlapsItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.considerNodeLabelsItem
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
                  'Minimum Node Distance',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-minimumNodeDistance'
                ),
                demo.options.OptionGroupAttribute('VisualGroup', 30),
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 100.0,
                  step: 0.01
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

          /** @type {boolean} */
          shouldDisableMinimumNodeDistanceItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.allowNodeOverlapsItem && !this.considerNodeLabelsItem
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $avoidNodeEdgeOverlapsItem: false,

          /** @type {boolean} */
          avoidNodeEdgeOverlapsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Avoid Node/Edge Overlaps',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-nodeEdgeOverlapAvoided'
                ),
                demo.options.OptionGroupAttribute('VisualGroup', 60),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$avoidNodeEdgeOverlapsItem
            },
            set: function(value) {
              this.$avoidNodeEdgeOverlapsItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $compactnessItem: 0,

          /** @type {number} */
          compactnessItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Compactness',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-compactnessFactor'
                ),
                demo.options.OptionGroupAttribute('VisualGroup', 70),
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 1.0,
                  step: 0.1
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$compactnessItem
            },
            set: function(value) {
              this.$compactnessItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $useAutoClusteringItem: false,

          /** @type {boolean} */
          useAutoClusteringItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Use Natural Clustering',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-clusterNodes'
                ),
                demo.options.OptionGroupAttribute('VisualGroup', 80),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$useAutoClusteringItem
            },
            set: function(value) {
              this.$useAutoClusteringItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $autoClusteringQualityItem: 0,

          /** @type {number} */
          autoClusteringQualityItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Natural Clustering Quality',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-clusteringQuality'
                ),
                demo.options.OptionGroupAttribute('VisualGroup', 90),
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 1.0,
                  step: 0.01
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$autoClusteringQualityItem
            },
            set: function(value) {
              this.$autoClusteringQualityItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableAutoClusteringQualityItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.useAutoClusteringItem === false
            }
          },

          /**
           * Backing field for below property
           * @type {demo.OrganicLayoutConfig.EnumOutputRestrictions}
           */
          $restrictOutputItem: null,

          /** @type {demo.OrganicLayoutConfig.EnumOutputRestrictions} */
          restrictOutputItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Output Area',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-outputRestriction'
                ),
                demo.options.OptionGroupAttribute('RestrictionsGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Unrestricted', demo.OrganicLayoutConfig.EnumOutputRestrictions.NONE],
                    ['Rectangular', demo.OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_CAGE],
                    ['Aspect Ratio', demo.OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_AR],
                    [
                      'Elliptical',
                      demo.OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_ELLIPTICAL_CAGE
                    ]
                  ]
                }),
                demo.options.TypeAttribute(demo.OrganicLayoutConfig.EnumOutputRestrictions.$class)
              ]
            },
            get: function() {
              return this.$restrictOutputItem
            },
            set: function(value) {
              this.$restrictOutputItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableCageGroup: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.restrictOutputItem !==
                  demo.OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_CAGE &&
                this.restrictOutputItem !==
                  demo.OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_ELLIPTICAL_CAGE
              )
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $rectCageUseViewItem: false,

          /** @type {boolean} */
          rectCageUseViewItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Use Visible Area',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-outputRestriction'
                ),
                demo.options.OptionGroupAttribute('CageGroup', 10),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$rectCageUseViewItem
            },
            set: function(value) {
              this.$rectCageUseViewItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $cageXItem: 0,

          /** @type {number} */
          cageXItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Top Left X'),
                demo.options.OptionGroupAttribute('CageGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$cageXItem
            },
            set: function(value) {
              this.$cageXItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableCageXItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.rectCageUseViewItem
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $cageYItem: 0,

          /** @type {number} */
          cageYItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Top Left Y'),
                demo.options.OptionGroupAttribute('CageGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$cageYItem
            },
            set: function(value) {
              this.$cageYItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableCageYItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.rectCageUseViewItem
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $cageWidthItem: 0,

          /** @type {number} */
          cageWidthItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Width'),
                demo.options.OptionGroupAttribute('CageGroup', 40),
                demo.options.MinMaxAttribute().init({ min: 1 }),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$cageWidthItem
            },
            set: function(value) {
              this.$cageWidthItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableCageWidthItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.rectCageUseViewItem
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $cageHeightItem: 0,

          /** @type {number} */
          cageHeightItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Height'),
                demo.options.OptionGroupAttribute('CageGroup', 50),
                demo.options.MinMaxAttribute().init({ min: 1 }),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$cageHeightItem
            },
            set: function(value) {
              this.$cageHeightItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableCageHeightItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.rectCageUseViewItem
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $arCageUseViewItem: false,

          /** @type {boolean} */
          arCageUseViewItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Use Ratio of View'),
                demo.options.OptionGroupAttribute('ARGroup', 10),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$arCageUseViewItem
            },
            set: function(value) {
              this.$arCageUseViewItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $cageRatioItem: 0,

          /** @type {number} */
          cageRatioItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Aspect Ratio'),
                demo.options.OptionGroupAttribute('ARGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 0.2,
                  max: 5.0,
                  step: 0.01
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$cageRatioItem
            },
            set: function(value) {
              this.$cageRatioItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableCageRatioItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.arCageUseViewItem
            }
          },

          /**
           * Backing field for below property
           * @type {demo.OrganicLayoutConfig.EnumGroupLayoutPolicy}
           */
          $groupLayoutPolicyItem: null,

          /** @type {demo.OrganicLayoutConfig.EnumGroupLayoutPolicy} */
          groupLayoutPolicyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Group Layout Policy',
                  '#/api/yfiles.organic.OrganicLayoutData#OrganicLayoutData-property-groupNodeModes'
                ),
                demo.options.OptionGroupAttribute('GroupingGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Layout Groups', demo.OrganicLayoutConfig.EnumGroupLayoutPolicy.LAYOUT_GROUPS],
                    [
                      'Fix Bounds of Groups',
                      demo.OrganicLayoutConfig.EnumGroupLayoutPolicy.FIX_GROUP_BOUNDS
                    ],
                    [
                      'Fix Contents of Groups',
                      demo.OrganicLayoutConfig.EnumGroupLayoutPolicy.FIX_GROUP_CONTENTS
                    ],
                    ['Ignore Groups', demo.OrganicLayoutConfig.EnumGroupLayoutPolicy.IGNORE_GROUPS]
                  ]
                }),
                demo.options.TypeAttribute(demo.OrganicLayoutConfig.EnumGroupLayoutPolicy.$class)
              ]
            },
            get: function() {
              return this.$groupLayoutPolicyItem
            },
            set: function(value) {
              this.$groupLayoutPolicyItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $qualityTimeRatioItem: 0,

          /** @type {number} */
          qualityTimeRatioItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Quality',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-qualityTimeRatio'
                ),
                demo.options.OptionGroupAttribute('AlgorithmGroup', 10),
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 1.0,
                  step: 0.01
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$qualityTimeRatioItem
            },
            set: function(value) {
              this.$qualityTimeRatioItem = value
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
                  'Maximum Duration (sec)',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-maximumDuration'
                ),
                demo.options.OptionGroupAttribute('AlgorithmGroup', 20),
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
           * @type {boolean}
           */
          $activateDeterministicModeItem: false,

          /** @type {boolean} */
          activateDeterministicModeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Deterministic Mode',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-deterministic'
                ),
                demo.options.OptionGroupAttribute('AlgorithmGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$activateDeterministicModeItem
            },
            set: function(value) {
              this.$activateDeterministicModeItem = value
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
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-considerNodeLabels'
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
           * @type {yfiles.organic.CycleSubstructureStyle}
           */
          $cycleSubstructureItem: null,

          /** @type {yfiles.organic.CycleSubstructureStyle} */
          cycleSubstructureItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Cycles',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-cycleSubstructureStyle'
                ),
                demo.options.OptionGroupAttribute('SubstructureLayoutGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Ignore', yfiles.organic.CycleSubstructureStyle.NONE],
                    ['Circular', yfiles.organic.CycleSubstructureStyle.CIRCULAR]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.organic.CycleSubstructureStyle.$class)
              ]
            },
            get: function() {
              return this.$cycleSubstructureItem
            },
            set: function(value) {
              this.$cycleSubstructureItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.organic.ChainSubstructureStyle}
           */
          $chainSubstructureItem: null,

          /** @type {yfiles.organic.ChainSubstructureStyle} */
          chainSubstructureItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Chains',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-chainSubstructureStyle'
                ),
                demo.options.OptionGroupAttribute('SubstructureLayoutGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Ignore', yfiles.organic.ChainSubstructureStyle.NONE],
                    ['Rectangular', yfiles.organic.ChainSubstructureStyle.RECTANGULAR],
                    ['Straight-Line', yfiles.organic.ChainSubstructureStyle.STRAIGHT_LINE]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.organic.ChainSubstructureStyle.$class)
              ]
            },
            get: function() {
              return this.$chainSubstructureItem
            },
            set: function(value) {
              this.$chainSubstructureItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.organic.StarSubstructureStyle}
           */
          $starSubstructureItem: null,

          /** @type {yfiles.organic.StarSubstructureStyle} */
          starSubstructureItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Star',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-starSubstructureStyle'
                ),
                demo.options.OptionGroupAttribute('SubstructureLayoutGroup', 30),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Ignore', yfiles.organic.StarSubstructureStyle.NONE],
                    ['Circular', yfiles.organic.StarSubstructureStyle.CIRCULAR],
                    ['Radial', yfiles.organic.StarSubstructureStyle.RADIAL],
                    ['Separated Radial', yfiles.organic.StarSubstructureStyle.SEPARATED_RADIAL]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.organic.StarSubstructureStyle.$class)
              ]
            },
            get: function() {
              return this.$starSubstructureItem
            },
            set: function(value) {
              this.$starSubstructureItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.organic.ParallelSubstructureStyle}
           */
          $parallelSubstructureItem: null,

          /** @type {yfiles.organic.ParallelSubstructureStyle  } */
          parallelSubstructureItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Parallel',
                  '#/api/yfiles.organic.OrganicLayout#OrganicLayout-property-parallelSubstructureStyle'
                ),
                demo.options.OptionGroupAttribute('SubstructureLayoutGroup', 40),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Ignore', yfiles.organic.ParallelSubstructureStyle.NONE],
                    ['Radial', yfiles.organic.ParallelSubstructureStyle.RADIAL],
                    ['Rectangular', yfiles.organic.ParallelSubstructureStyle.RECTANGULAR],
                    ['Straight-Line', yfiles.organic.ParallelSubstructureStyle.STRAIGHT_LINE]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.organic.ParallelSubstructureStyle.$class)
              ]
            },
            get: function() {
              return this.$parallelSubstructureItem
            },
            set: function(value) {
              this.$parallelSubstructureItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $edgeDirectednessItem: false,

          /** @type {boolean} */
          edgeDirectednessItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Arrows Define Edge Direction',
                  '#/api/yfiles.organic.OrganicLayoutData#OrganicLayoutData-property-edgeDirectedness'
                ),
                demo.options.OptionGroupAttribute('SubstructureLayoutGroup', 50),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$edgeDirectednessItem
            },
            set: function(value) {
              this.$edgeDirectednessItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $useEdgeGroupingItem: false,

          /** @type {boolean} */
          useEdgeGroupingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Use Edge Grouping',
                  '#/api/yfiles.layout.PortConstraintKeys'
                ),
                demo.options.OptionGroupAttribute('SubstructureLayoutGroup', 60),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$useEdgeGroupingItem
            },
            set: function(value) {
              this.$useEdgeGroupingItem = value
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
                  '#/api/yfiles.organic.OrganicLayout#MultiStageLayout-property-labelingEnabled'
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

          /** @lends {demo.OrganicLayoutConfig} */
          $static: {
            /**
             * @return {number[]}
             */
            getVisibleRectangle: function(graphComponent) {
              const visibleRect = [0, 0, 0, 0]
              if (graphComponent !== null) {
                const viewPort = graphComponent.viewport
                visibleRect[0] = viewPort.x
                visibleRect[1] = viewPort.y
                visibleRect[2] = viewPort.width
                visibleRect[3] = viewPort.height
                return visibleRect
              }
              return null
            },

            // ReSharper restore UnusedMember.Global
            // ReSharper restore InconsistentNaming
            EnumOutputRestrictions: new yfiles.lang.EnumDefinition(() => {
              return {
                NONE: 0,
                OUTPUT_CAGE: 1,
                OUTPUT_AR: 2,
                OUTPUT_ELLIPTICAL_CAGE: 3
              }
            }),

            EnumGroupLayoutPolicy: new yfiles.lang.EnumDefinition(() => {
              return {
                LAYOUT_GROUPS: 0,
                FIX_GROUP_BOUNDS: 1,
                FIX_GROUP_CONTENTS: 2,
                IGNORE_GROUPS: 3
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
