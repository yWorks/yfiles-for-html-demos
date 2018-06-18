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
      exports.CircularLayoutConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.CircularLayoutConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('CircularLayout')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)
            this.$initCircularLayoutConfig()
            const layout = new yfiles.circular.CircularLayout()
            const treeLayout = layout.balloonLayout

            this.layoutStyleItem = yfiles.circular.LayoutStyle.BCC_COMPACT
            this.actOnSelectionOnlyItem = false
            this.fromSketchItem = false
            this.handleNodeLabelsItem = false

            this.partitionLayoutStyleItem = yfiles.circular.PartitionStyle.CYCLE
            this.minimumNodeDistanceItem = 30
            this.chooseRadiusAutomaticallyItem = true
            this.fixedRadiusItem = 200

            this.edgeBundlingItem = false
            this.edgeBundlingStrengthItem = 1.0

            this.preferredChildWedgeItem = treeLayout.preferredChildWedge
            this.minimumEdgeLengthItem = treeLayout.minimumEdgeLength
            this.maximumDeviationAngleItem = layout.maximumDeviationAngle
            this.compactnessFactorItem = treeLayout.compactnessFactor
            this.minimumTreeNodeDistanceItem = treeLayout.minimumNodeDistance
            this.allowOverlapsItem = treeLayout.allowOverlaps
            this.placeChildrenOnCommonRadiusItem = true

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
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout algorithm.
           */
          createConfiguredLayout: function(graphComponent) {
            const layout = new yfiles.circular.CircularLayout()
            const treeLayout = layout.balloonLayout

            layout.layoutStyle = this.layoutStyleItem
            layout.subgraphLayoutEnabled = this.actOnSelectionOnlyItem
            layout.maximumDeviationAngle = this.maximumDeviationAngleItem
            layout.fromSketchMode = this.fromSketchItem
            layout.considerNodeLabels = this.handleNodeLabelsItem

            layout.partitionStyle = this.partitionLayoutStyleItem

            layout.singleCycleLayout.minimumNodeDistance = this.minimumNodeDistanceItem
            layout.singleCycleLayout.automaticRadius = this.chooseRadiusAutomaticallyItem
            layout.singleCycleLayout.fixedRadius = this.fixedRadiusItem

            treeLayout.preferredChildWedge = this.preferredChildWedgeItem
            treeLayout.minimumEdgeLength = this.minimumEdgeLengthItem
            treeLayout.compactnessFactor = this.compactnessFactorItem
            treeLayout.allowOverlaps = this.allowOverlapsItem
            layout.placeChildrenOnCommonRadius = this.placeChildrenOnCommonRadiusItem
            treeLayout.minimumNodeDistance = this.minimumTreeNodeDistanceItem

            if (this.edgeLabelingItem) {
              const genericLabeling = new yfiles.labeling.GenericLabeling()
              genericLabeling.placeEdgeLabels = true
              genericLabeling.placeNodeLabels = false
              genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
              layout.labelingEnabled = true
              layout.labeling = genericLabeling
            }

            const ebc = layout.edgeBundling
            const bundlingDescriptor = new yfiles.layout.EdgeBundleDescriptor()
            bundlingDescriptor.bundled = this.edgeBundlingItem
            ebc.bundlingStrength = this.edgeBundlingStrengthItem
            ebc.defaultBundleDescriptor = bundlingDescriptor

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
            const layoutData = new yfiles.circular.CircularLayoutData()

            if (this.layoutStyleItem === yfiles.circular.LayoutStyle.CUSTOM_GROUPS) {
              layoutData.customGroups.delegate = node => graphComponent.graph.getParent(node)
            }

            return layoutData
          },

          /**
           * Called after the layout animation is done.
           * @see Overrides {@link demo.LayoutConfiguration#postProcess}
           */
          postProcess: function(graphComponent) {},

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
          CycleGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Partition'),
                demo.options.OptionGroupAttribute('RootGroup', 20),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          EdgeBundlingGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Edge Bundling'),
                demo.options.OptionGroupAttribute('RootGroup', 30),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          TreeGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Tree'),
                demo.options.OptionGroupAttribute('RootGroup', 30),
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
              return "<p style='margin-top:0'>The circular layout style emphasizes group and tree structures within a network. It creates node partitions by analyzing the connectivity structure of the network, and arranges the partitions as separate circles. The circles themselves are arranged in a radial tree layout fashion.</p><p>This layout style portraits interconnected ring and star topologies and is excellent for applications in:</p><ul><li>Social networking (criminology, economics, fraud detection, etc.)</li><li>Network management</li><li>WWW visualization</li><li>eCommerce</li></ul>"
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.circular.LayoutStyle}
           */
          $layoutStyleItem: null,

          /** @type {yfiles.circular.LayoutStyle} */
          layoutStyleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Layout Style',
                  '#/api/yfiles.circular.CircularLayout#CircularLayout-property-layoutStyle'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['BCC Compact', yfiles.circular.LayoutStyle.BCC_COMPACT],
                    ['BCC Isolated', yfiles.circular.LayoutStyle.BCC_ISOLATED],
                    ['Custom Groups', yfiles.circular.LayoutStyle.CUSTOM_GROUPS],
                    ['Single Cycle', yfiles.circular.LayoutStyle.SINGLE_CYCLE]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.circular.LayoutStyle.$class)
              ]
            },
            get: function() {
              return this.$layoutStyleItem
            },
            set: function(value) {
              this.$layoutStyleItem = value
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
                  '#/api/yfiles.circular.CircularLayout#MultiStageLayout-property-subgraphLayoutEnabled'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 20),
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
           * @type {boolean}
           */
          $fromSketchItem: false,

          /** @type {boolean} */
          fromSketchItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Use Drawing as Sketch',
                  '#/api/yfiles.circular.CircularLayout#CircularLayout-property-fromSketchMode'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$fromSketchItem
            },
            set: function(value) {
              this.$fromSketchItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.circular.PartitionLayoutStyle}
           */
          $partitionLayoutStyleItem: null,

          /** @type {yfiles.circular.PartitionLayoutStyle} */
          partitionLayoutStyleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Partition Layout Style',
                  '#/api/yfiles.circular.CircularLayout#CircularLayout-property-partitionStyle'
                ),
                demo.options.OptionGroupAttribute('CycleGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Circle', yfiles.circular.PartitionStyle.CYCLE],
                    ['Disk', yfiles.circular.PartitionStyle.DISK],
                    ['Organic Disk', yfiles.circular.PartitionStyle.ORGANIC]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.circular.PartitionStyle.$class)
              ]
            },
            get: function() {
              return this.$partitionLayoutStyleItem
            },
            set: function(value) {
              this.$partitionLayoutStyleItem = value
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
                  '#/api/yfiles.circular.SingleCycleLayout#SingleCycleLayout-property-minimumNodeDistance'
                ),
                demo.options.OptionGroupAttribute('CycleGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 999
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
              return this.chooseRadiusAutomaticallyItem === false
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $chooseRadiusAutomaticallyItem: false,

          /** @type {boolean} */
          chooseRadiusAutomaticallyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Choose Radius Automatically',
                  '#/api/yfiles.circular.SingleCycleLayout#SingleCycleLayout-property-automaticRadius'
                ),
                demo.options.OptionGroupAttribute('CycleGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$chooseRadiusAutomaticallyItem
            },
            set: function(value) {
              this.$chooseRadiusAutomaticallyItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $fixedRadiusItem: 0,

          /** @type {number} */
          fixedRadiusItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Fixed Radius',
                  '#/api/yfiles.circular.SingleCycleLayout#SingleCycleLayout-property-fixedRadius'
                ),
                demo.options.OptionGroupAttribute('CycleGroup', 40),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 800
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$fixedRadiusItem
            },
            set: function(value) {
              this.$fixedRadiusItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableFixedRadiusItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.chooseRadiusAutomaticallyItem
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $edgeBundlingItem: false,

          /** @type {boolean} */
          edgeBundlingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Enable Edge Bundling',
                  '#/api/yfiles.layout.EdgeBundling#EdgeBundling-property-defaultBundleDescriptor'
                ),
                demo.options.OptionGroupAttribute('EdgeBundlingGroup', 40),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$edgeBundlingItem
            },
            set: function(value) {
              this.$edgeBundlingItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableEdgeBundlingItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.partitionLayoutStyleItem !== yfiles.circular.PartitionStyle.CYCLE ||
                this.layoutStyleItem === yfiles.circular.LayoutStyle.BCC_ISOLATED
              )
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
                demo.options.OptionGroupAttribute('EdgeBundlingGroup', 50),
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
                this.partitionLayoutStyleItem !== yfiles.circular.PartitionStyle.CYCLE ||
                this.layoutStyleItem === yfiles.circular.LayoutStyle.BCC_ISOLATED
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
                demo.options.OptionGroupAttribute('TreeGroup', 10),
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
          $minimumEdgeLengthItem: 5,

          /** @type {number} */
          minimumEdgeLengthItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Edge Length',
                  '#/api/yfiles.tree.BalloonLayout#BalloonLayout-property-minimumEdgeLength'
                ),
                demo.options.OptionGroupAttribute('TreeGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 5,
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
          $maximumDeviationAngleItem: 0,

          /** @type {number} */
          maximumDeviationAngleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Maximum Deviation Angle',
                  '#/api/yfiles.circular.CircularLayout#CircularLayout-property-maximumDeviationAngle'
                ),
                demo.options.OptionGroupAttribute('TreeGroup', 30),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 360
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$maximumDeviationAngleItem
            },
            set: function(value) {
              this.$maximumDeviationAngleItem = value
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
                demo.options.OptionGroupAttribute('TreeGroup', 40),
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
           * @type {number}
           */
          $minimumTreeNodeDistanceItem: 0,

          /** @type {number} */
          minimumTreeNodeDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Node Distance',
                  '#/api/yfiles.tree.BalloonLayout#BalloonLayout-property-minimumNodeDistance'
                ),
                demo.options.OptionGroupAttribute('TreeGroup', 50),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumTreeNodeDistanceItem
            },
            set: function(value) {
              this.$minimumTreeNodeDistanceItem = value
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
                demo.options.OptionGroupAttribute('TreeGroup', 60),
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
          $placeChildrenOnCommonRadiusItem: false,

          /** @type {boolean} */
          placeChildrenOnCommonRadiusItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Place Children on Common Radius',
                  '#/api/yfiles.circular.CircularLayout#CircularLayout-property-placeChildrenOnCommonRadius'
                ),
                demo.options.OptionGroupAttribute('TreeGroup', 70),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$placeChildrenOnCommonRadiusItem
            },
            set: function(value) {
              this.$placeChildrenOnCommonRadiusItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableTreeGroupItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.layoutStyleItem === yfiles.circular.LayoutStyle.SINGLE_CYCLE
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $handleNodeLabelsItem: false,

          /** @type {boolean} */
          handleNodeLabelsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Consider Node Labels',
                  '#/api/yfiles.circular.CircularLayout#CircularLayout-property-considerNodeLabels'
                ),
                demo.options.OptionGroupAttribute('NodePropertiesGroup', 10),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$handleNodeLabelsItem
            },
            set: function(value) {
              this.$handleNodeLabelsItem = value
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
                  '#/api/yfiles.circular.CircularLayout#MultiStageLayout-property-labelingEnabled'
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

          $initCircularLayoutConfig: function() {
            this.$layoutStyleItem = yfiles.circular.LayoutStyle.BCC_COMPACT
            this.$partitionLayoutStyleItem = yfiles.circular.PartitionStyle.CYCLE
            this.$labelPlacementOrientationItem =
              demo.LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL
            this.$labelPlacementAlongEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.ANYWHERE
            this.$labelPlacementSideOfEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ANYWHERE
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
