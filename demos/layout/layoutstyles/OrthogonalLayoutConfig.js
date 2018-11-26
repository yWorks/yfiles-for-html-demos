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
       * @yjs:keep=DescriptionGroup,EdgePropertiesGroup,EdgesGroup,GroupingGroup,LabelingGroup,LayoutGroup,NodePropertiesGroup,PreferredPlacementGroup,descriptionText,considerNodeLabelsItem,crossingReductionItem,edgeLabelingItem,gridSpacingItem,groupLayoutPolicyItem,groupLayoutQualityItem,labelPlacementAlongEdgeItem,labelPlacementDistanceItem,labelPlacementOrientationItem,labelPlacementSideOfEdgeItem,edgeLengthReductionItem,minimumFirstSegmentLengthItem,minimumLastSegmentLengthItem,minimumSegmentLengthItem,perceivedBendsPostprocessingItem,shouldDisablecrossingReductionItem,shouldDisableLabelPlacementAlongEdgeItem,shouldDisableLabelPlacementDistanceItem,shouldDisableLabelPlacementOrientationItem,shouldDisableLabelPlacementSideOfEdgeItem,shouldDisablePerceivedBendsPostprocessingItem,uniformPortAssignmentItem,shouldDisableStyleItem,shouldDisableUseRandomizationItem,styleItem,useExistingDrawingAsSketchItem,useFaceMaximizationItem,useRandomizationItem,cycleSubstructureStyleItem,cycleSubstructureSizeItem,shouldDisableCycleSubstructureSizeItem,chainSubstructureStyleItem,chainSubstructureSizeItem,shouldDisableChainSubstructureSizeItem,treeSubstructureStyleItem,treeSubstructureSizeItem,shouldDisableTreeSubstructureSizeItem
       * @class
       * @extends demo.LayoutConfiguration
       */
      exports.OrthogonalLayoutConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.OrthogonalLayoutConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('OrthogonalLayout')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)

            this.styleItem = yfiles.orthogonal.LayoutStyle.NORMAL
            this.gridSpacingItem = 15
            this.edgeLengthReductionItem = true
            this.useExistingDrawingAsSketchItem = false
            this.crossingReductionItem = true
            this.perceivedBendsPostprocessingItem = true
            this.uniformPortAssignmentItem = false
            this.useRandomizationItem = true
            this.useFaceMaximizationItem = false

            this.considerNodeLabelsItem = false
            this.edgeLabelingItem = demo.OrthogonalLayoutConfig.EnumEdgeLabeling.NONE
            this.labelPlacementAlongEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED
            this.labelPlacementSideOfEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
            this.labelPlacementOrientationItem =
              demo.LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
            this.labelPlacementDistanceItem = 10.0

            this.minimumFirstSegmentLengthItem = 15.0
            this.minimumSegmentLengthItem = 15.0
            this.minimumLastSegmentLengthItem = 15.0
            this.considerEdgeDirectionItem = false

            this.chainSubstructureStyleItem = yfiles.orthogonal.ChainLayoutStyle.NONE
            this.chainSubstructureSizeItem = 2
            this.cycleSubstructureStyleItem = yfiles.orthogonal.CycleLayoutStyle.NONE
            this.cycleSubstructureSizeItem = 4
            this.treeSubstructureStyleItem = yfiles.orthogonal.TreeLayoutStyle.NONE
            this.treeSubstructureSizeItem = 3
            this.treeSubstructureOrientationItem =
              yfiles.orthogonal.SubstructureOrientation.AUTO_DETECT

            this.groupLayoutPolicyItem = demo.OrthogonalLayoutConfig.EnumGroupPolicy.LAYOUT_GROUPS
          },

          /**
           * Creates and configures a layout.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout.
           */
          createConfiguredLayout: function(graphComponent) {
            const layout = new yfiles.orthogonal.OrthogonalLayout()
            if (
              this.groupLayoutPolicyItem === demo.OrthogonalLayoutConfig.EnumGroupPolicy.FIX_GROUPS
            ) {
              const fgl = new yfiles.layout.FixGroupLayoutStage()
              fgl.interEdgeRoutingStyle = yfiles.layout.InterEdgeRoutingStyle.ORTHOGONAL
              layout.prependStage(fgl)
            } else if (
              this.groupLayoutPolicyItem ===
              demo.OrthogonalLayoutConfig.EnumGroupPolicy.IGNORE_GROUPS
            ) {
              layout.hideGroupsStageEnabled = true
            }

            layout.layoutStyle = this.styleItem
            layout.gridSpacing = this.gridSpacingItem
            layout.edgeLengthReduction = this.edgeLengthReductionItem
            layout.optimizePerceivedBends = this.perceivedBendsPostprocessingItem
            layout.uniformPortAssignment = this.uniformPortAssignmentItem
            layout.crossingReduction = this.crossingReductionItem
            layout.randomization = this.useRandomizationItem
            layout.faceMaximization = this.useFaceMaximizationItem
            layout.fromSketchMode = this.useExistingDrawingAsSketchItem
            layout.edgeLayoutDescriptor.minimumFirstSegmentLength = this.minimumFirstSegmentLengthItem
            layout.edgeLayoutDescriptor.minimumLastSegmentLength = this.minimumLastSegmentLengthItem
            layout.edgeLayoutDescriptor.minimumSegmentLength = this.minimumSegmentLengthItem

            // set edge labeling options
            const normalStyle = layout.layoutStyle === yfiles.orthogonal.LayoutStyle.NORMAL
            layout.integratedEdgeLabeling =
              this.edgeLabelingItem === demo.OrthogonalLayoutConfig.EnumEdgeLabeling.INTEGRATED &&
              normalStyle
            layout.considerNodeLabels = this.considerNodeLabelsItem && normalStyle

            if (
              this.edgeLabelingItem === demo.OrthogonalLayoutConfig.EnumEdgeLabeling.GENERIC ||
              (this.edgeLabelingItem === demo.OrthogonalLayoutConfig.EnumEdgeLabeling.INTEGRATED &&
                normalStyle)
            ) {
              layout.labelingEnabled = true
              if (this.edgeLabelingItem === demo.OrthogonalLayoutConfig.EnumEdgeLabeling.GENERIC) {
                layout.labeling.reduceAmbiguity = this.reduceAmbiguityItem
              }
            } else if (!this.considerNodeLabelsItem || !normalStyle) {
              layout.labelingEnabled = false
            }

            layout.chainStyle = this.chainSubstructureStyleItem
            layout.chainSize = this.chainSubstructureSizeItem
            layout.cycleStyle = this.cycleSubstructureStyleItem
            layout.cycleSize = this.cycleSubstructureSizeItem
            layout.treeStyle = this.treeSubstructureStyleItem
            layout.treeSize = this.treeSubstructureSizeItem
            layout.treeOrientation = this.treeSubstructureOrientationItem

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
           * Creates the layout data of the configuration.
           * @param {yfiles.view.GraphComponent} graphComponent
           * @param {yfiles.layout.ILayoutAlgorithm} layout
           * @return {null}
           */
          createConfiguredLayoutData: function(graphComponent, layout) {
            const layoutData = new yfiles.orthogonal.OrthogonalLayoutData()
            if (this.considerEdgeDirectionItem) {
              layoutData.directedEdges.source = graphComponent.selection.selectedEdges
            } else {
              layoutData.directedEdges.delegate = edge => false
            }
            return layoutData
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

          /** @type {demo.options.OptionGroup} */
          EdgesGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Edges'),
                demo.options.OptionGroupAttribute('RootGroup', 30),
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
              return "<p style='margin-top:0'>The orthogonal layout style is a multi-purpose layout style for undirected graphs. It is well suited for medium-sized sparse graphs, and produces compact drawings with no overlaps, few crossings, and few bends.</p><p>It is especially fitted for application domains such as</p><ul><li>Software engineering</li><li>Database schema</li><li>System management</li><li>Knowledge representation</li></ul>"
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.orthogonal.LayoutStyle}
           */
          $styleItem: null,

          /** @type {yfiles.orthogonal.LayoutStyle} */
          styleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Layout Style',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-layoutStyle'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Normal', yfiles.orthogonal.LayoutStyle.NORMAL],
                    ['Uniform Node Sizes', yfiles.orthogonal.LayoutStyle.UNIFORM],
                    ['Node Boxes', yfiles.orthogonal.LayoutStyle.BOX],
                    ['Mixed', yfiles.orthogonal.LayoutStyle.MIXED],
                    ['Node Boxes (Fixed Node Size)', yfiles.orthogonal.LayoutStyle.FIXED_BOX],
                    ['Mixed (Fixed Node Size)', yfiles.orthogonal.LayoutStyle.FIXED_MIXED]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.orthogonal.LayoutStyle.$class)
              ]
            },
            get: function() {
              return this.$styleItem
            },
            set: function(value) {
              this.$styleItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableStyleItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.useExistingDrawingAsSketchItem === true
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
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-gridSpacing'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 1,
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

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $edgeLengthReductionItem: false,

          /** @type {boolean} */
          edgeLengthReductionItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Length Reduction',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-edgeLengthReduction'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$edgeLengthReductionItem
            },
            set: function(value) {
              this.$edgeLengthReductionItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $useExistingDrawingAsSketchItem: false,

          /** @type {boolean} */
          useExistingDrawingAsSketchItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Use Drawing as Sketch',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-fromSketchMode'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 40),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$useExistingDrawingAsSketchItem
            },
            set: function(value) {
              this.$useExistingDrawingAsSketchItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $crossingReductionItem: false,

          /** @type {boolean} */
          crossingReductionItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Crossing Reduction',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-crossingReduction'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 50),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$crossingReductionItem
            },
            set: function(value) {
              this.$crossingReductionItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableCrossingReductionItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.useExistingDrawingAsSketchItem === true
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $perceivedBendsPostprocessingItem: false,

          /** @type {boolean} */
          perceivedBendsPostprocessingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimize Perceived Bends',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-optimizePerceivedBends'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 60),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$perceivedBendsPostprocessingItem
            },
            set: function(value) {
              this.$perceivedBendsPostprocessingItem = value
            }
          },

          /** @type {boolean} */
          shouldDisablePerceivedBendsPostprocessingItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.useExistingDrawingAsSketchItem === true
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $uniformPortAssignmentItem: false,

          /** @type {boolean} */
          uniformPortAssignmentItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Uniform Port Assignment',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-uniformPortAssignment'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 65),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$uniformPortAssignmentItem
            },
            set: function(value) {
              this.$uniformPortAssignmentItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableUniformPortAssignmentItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                !this.useExistingDrawingAsSketchItem &&
                this.styleItem !== yfiles.orthogonal.LayoutStyle.NORMAL &&
                this.styleItem !== yfiles.orthogonal.LayoutStyle.UNIFORM
              )
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $useRandomizationItem: false,

          /** @type {boolean} */
          useRandomizationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Randomization',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-randomization'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 70),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$useRandomizationItem
            },
            set: function(value) {
              this.$useRandomizationItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableUseRandomizationItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.useExistingDrawingAsSketchItem === true
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $useFaceMaximizationItem: false,

          /** @type {boolean} */
          useFaceMaximizationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Face Maximization',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-faceMaximization'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 80),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$useFaceMaximizationItem
            },
            set: function(value) {
              this.$useFaceMaximizationItem = value
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
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-considerNodeLabels'
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
           * @type {demo.OrthogonalLayoutConfig.EnumEdgeLabeling}
           */
          $edgeLabelingItem: null,

          /** @type {demo.OrthogonalLayoutConfig.EnumEdgeLabeling} */
          edgeLabelingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Edge Labeling',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-integratedEdgeLabeling'
                ),
                demo.options.OptionGroupAttribute('EdgePropertiesGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['None', demo.OrthogonalLayoutConfig.EnumEdgeLabeling.NONE],
                    ['Integrated', demo.OrthogonalLayoutConfig.EnumEdgeLabeling.INTEGRATED],
                    ['Generic', demo.OrthogonalLayoutConfig.EnumEdgeLabeling.GENERIC]
                  ]
                }),
                demo.options.TypeAttribute(demo.OrthogonalLayoutConfig.EnumEdgeLabeling.$class)
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
              return this.edgeLabelingItem !== demo.OrthogonalLayoutConfig.EnumEdgeLabeling.GENERIC
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
              return this.edgeLabelingItem === demo.OrthogonalLayoutConfig.EnumEdgeLabeling.NONE
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
              return this.edgeLabelingItem === demo.OrthogonalLayoutConfig.EnumEdgeLabeling.NONE
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
              return this.edgeLabelingItem === demo.OrthogonalLayoutConfig.EnumEdgeLabeling.NONE
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
                this.edgeLabelingItem === demo.OrthogonalLayoutConfig.EnumEdgeLabeling.NONE ||
                this.labelPlacementSideOfEdgeItem ===
                  demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
              )
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
                  '#/api/yfiles.orthogonal.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumFirstSegmentLength'
                ),
                demo.options.OptionGroupAttribute('EdgesGroup', 10),
                demo.options.MinMaxAttribute().init({
                  min: 1,
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
          $minimumSegmentLengthItem: 0,

          /** @type {number} */
          minimumSegmentLengthItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Segment Length',
                  '#/api/yfiles.orthogonal.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumFirstSegmentLength'
                ),
                demo.options.OptionGroupAttribute('EdgesGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumSegmentLengthItem
            },
            set: function(value) {
              this.$minimumSegmentLengthItem = value
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
                  '#/api/yfiles.orthogonal.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLastSegmentLength'
                ),
                demo.options.OptionGroupAttribute('EdgesGroup', 30),
                demo.options.MinMaxAttribute().init({
                  min: 1,
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
          $considerEdgeDirectionItem: 0,

          /** @type {number} */
          considerEdgeDirectionItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Route Selected Edges Downwards',
                  '#/api/yfiles.orthogonal.OrthogonalLayoutData#OrthogonalLayoutData-property-directedEdges'
                ),
                demo.options.OptionGroupAttribute('EdgesGroup', 40),
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
           * @type {demo.OrthogonalLayoutConfig.EnumGroupPolicy}
           */
          $groupLayoutPolicyItem: null,

          /** @type {demo.OrthogonalLayoutConfig.EnumGroupPolicy} */
          groupLayoutPolicyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Group Layout Policy',
                  '#/api/yfiles.layout.FixGroupLayoutStage'
                ),
                demo.options.OptionGroupAttribute('GroupingGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Layout Groups', demo.OrthogonalLayoutConfig.EnumGroupPolicy.LAYOUT_GROUPS],
                    [
                      'Fix Contents of Groups',
                      demo.OrthogonalLayoutConfig.EnumGroupPolicy.FIX_GROUPS
                    ],
                    ['Ignore Groups', demo.OrthogonalLayoutConfig.EnumGroupPolicy.IGNORE_GROUPS]
                  ]
                }),
                demo.options.TypeAttribute(demo.OrthogonalLayoutConfig.EnumGroupPolicy.$class)
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
           * @type {yfiles.orthogonal.CycleLayoutStyle}
           */
          $cycleSubstructureStyleItem: null,

          /** @type {yfiles.orthogonal.CycleLayoutStyle} */
          cycleSubstructureStyleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Cycles',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-cycleStyle'
                ),
                demo.options.OptionGroupAttribute('SubstructureLayoutGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Ignore', yfiles.orthogonal.CycleLayoutStyle.NONE],
                    [
                      'Circular with Nodes at Corners',
                      yfiles.orthogonal.CycleLayoutStyle.CIRCULAR_WITH_NODES_AT_CORNERS
                    ],
                    [
                      'Circular with Bends at Corners',
                      yfiles.orthogonal.CycleLayoutStyle.CIRCULAR_WITH_BENDS_AT_CORNERS
                    ]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.orthogonal.CycleLayoutStyle.$class)
              ]
            },
            get: function() {
              return this.$cycleSubstructureStyleItem
            },
            set: function(value) {
              this.$cycleSubstructureStyleItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $cycleSubstructureSizeItem: 0,

          /** @type {number} */
          cycleSubstructureSizeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Cycle Size',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-cycleSize'
                ),
                demo.options.OptionGroupAttribute('SubstructureLayoutGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 4,
                  max: 20,
                  value: 3
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$cycleSubstructureSizeItem
            },
            set: function(value) {
              this.$cycleSubstructureSizeItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableCycleSubstructureSizeItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.cycleSubstructureStyleItem === yfiles.orthogonal.CycleLayoutStyle.NONE
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.orthogonal.ChainLayoutStyle}
           */
          $chainSubstructureStyleItem: null,

          /** @type {yfiles.orthogonal.ChainLayoutStyle} */
          chainSubstructureStyleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Chains',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-chainStyle'
                ),
                demo.options.OptionGroupAttribute('SubstructureLayoutGroup', 30),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Ignore', yfiles.orthogonal.ChainLayoutStyle.NONE],
                    ['Straight', yfiles.orthogonal.ChainLayoutStyle.STRAIGHT],
                    [
                      'Wrapped with Nodes at Turns',
                      yfiles.orthogonal.ChainLayoutStyle.WRAPPED_WITH_NODES_AT_TURNS
                    ],
                    [
                      'Wrapped with Bends at Turns',
                      yfiles.orthogonal.ChainLayoutStyle.WRAPPED_WITH_BENDS_AT_TURNS
                    ]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.orthogonal.CycleLayoutStyle.$class)
              ]
            },
            get: function() {
              return this.$chainSubstructureStyleItem
            },
            set: function(value) {
              this.$chainSubstructureStyleItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $chainSubstructureSizeItem: 0,

          /** @type {number} */
          chainSubstructureSizeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Chain Length',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-chainSize'
                ),
                demo.options.OptionGroupAttribute('SubstructureLayoutGroup', 40),
                demo.options.MinMaxAttribute().init({
                  min: 2,
                  max: 20,
                  value: 3
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$chainSubstructureSizeItem
            },
            set: function(value) {
              this.$chainSubstructureSizeItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableChainSubstructureSizeItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.chainSubstructureStyleItem === yfiles.orthogonal.ChainLayoutStyle.NONE
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.orthogonal.TreeLayoutStyle}
           */
          $treeSubstructureStyleItem: null,

          /** @type {yfiles.orthogonal.TreeLayoutStyle} */
          treeSubstructureStyleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Tree Style',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-treeStyle'
                ),
                demo.options.OptionGroupAttribute('SubstructureLayoutGroup', 50),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Ignore', yfiles.orthogonal.TreeLayoutStyle.NONE],
                    ['Default', yfiles.orthogonal.TreeLayoutStyle.DEFAULT],
                    ['Integrated', yfiles.orthogonal.TreeLayoutStyle.INTEGRATED],
                    ['Compact', yfiles.orthogonal.TreeLayoutStyle.COMPACT],
                    ['Aspect Ratio', yfiles.orthogonal.TreeLayoutStyle.ASPECT_RATIO]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.orthogonal.CycleLayoutStyle.$class)
              ]
            },
            get: function() {
              return this.$treeSubstructureStyleItem
            },
            set: function(value) {
              this.$treeSubstructureStyleItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $treeSubstructureSizeItem: 0,

          /** @type {number} */
          treeSubstructureSizeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Tree Size',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-treeSize'
                ),
                demo.options.OptionGroupAttribute('SubstructureLayoutGroup', 60),
                demo.options.MinMaxAttribute().init({
                  min: 3,
                  max: 20,
                  value: 3
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$treeSubstructureSizeItem
            },
            set: function(value) {
              this.$treeSubstructureSizeItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableTreeSubstructureSizeItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.treeSubstructureStyleItem === yfiles.orthogonal.TreeLayoutStyle.NONE
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.orthogonal.SubstructureOrientation}
           */
          $treeSubstructureOrientationItem: null,

          /** @type {yfiles.orthogonal.SubstructureOrientation} */
          treeSubstructureOrientationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Tree Orientation',
                  '#/api/yfiles.orthogonal.OrthogonalLayout#OrthogonalLayout-property-treeOrientation'
                ),
                demo.options.OptionGroupAttribute('SubstructureLayoutGroup', 70),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Automatic', yfiles.orthogonal.SubstructureOrientation.AUTO_DETECT],
                    ['Top to Bottom', yfiles.orthogonal.SubstructureOrientation.TOP_TO_BOTTOM],
                    ['Bottom to Top', yfiles.orthogonal.SubstructureOrientation.BOTTOM_TO_TOP],
                    ['Left to Right', yfiles.orthogonal.SubstructureOrientation.LEFT_TO_RIGHT],
                    ['Right to Left', yfiles.orthogonal.SubstructureOrientation.RIGHT_TO_LEFT]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.orthogonal.SubstructureOrientation.$class)
              ]
            },
            get: function() {
              return this.$treeSubstructureOrientationItem
            },
            set: function(value) {
              this.$treeSubstructureOrientationItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableTreeSubstructureOrientationItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.treeSubstructureStyleItem === yfiles.orthogonal.TreeLayoutStyle.NONE
            }
          },

          /**
           * Enables different layout styles for possible detected substructures.
           */
          enableSubstructures: function() {
            this.chainSubstructureStyleItem =
              yfiles.orthogonal.ChainLayoutStyle.WRAPPED_WITH_NODES_AT_TURNS
            this.chainSubstructureSizeItem = 2
            this.cycleSubstructureStyleItem =
              yfiles.orthogonal.CycleLayoutStyle.CIRCULAR_WITH_BENDS_AT_CORNERS
            this.cycleSubstructureSizeItem = 4
            this.treeSubstructureStyleItem = yfiles.orthogonal.TreeLayoutStyle.INTEGRATED
            this.treeSubstructureSizeItem = 3
            this.treeSubstructureOrientationItem =
              yfiles.orthogonal.SubstructureOrientation.AUTO_DETECT
          },

          /** @lends {demo.OrthogonalLayoutConfig} */
          $static: {
            // ReSharper restore UnusedMember.Global
            // ReSharper restore InconsistentNaming
            EnumEdgeLabeling: new yfiles.lang.EnumDefinition(() => {
              return {
                NONE: 0,
                INTEGRATED: 1,
                GENERIC: 2
              }
            }),

            EnumGroupPolicy: new yfiles.lang.EnumDefinition(() => {
              return {
                LAYOUT_GROUPS: 0,
                FIX_GROUPS: 1,
                IGNORE_GROUPS: 2
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
