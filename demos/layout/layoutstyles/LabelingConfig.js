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
      define([
        'yfiles/lang',
        'yfiles/view-component',
        './SelectedLabelsStage.js',
        'LayoutConfiguration.js'
      ], f)
    } else {
      f(r.yfiles.lang, r.yfiles)
    }
  })((lang, yfiles, SelectedLabelsStage) => {
    const demo = yfiles.module('demo')
    yfiles.module('demo', exports => {
      /**
       * Configuration options for the layout algorithm of the same name.
       * @class
       * @extends demo.LayoutConfiguration
       */
      exports.LabelingConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.LabelingConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('Labeling')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)
            this.$initLabelingConfig()
            this.placeNodeLabelsItem = true
            this.placeEdgeLabelsItem = true
            this.considerSelectedFeaturesOnlyItem = false

            this.optimizationStrategyItem = yfiles.labeling.OptimizationStrategy.BALANCED

            this.allowNodeOverlapsItem = false
            this.allowEdgeOverlapsItem = true
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
            let labeling = new yfiles.labeling.GenericLabeling()
            labeling.autoFlipping = true
            labeling.optimizationStrategy = this.optimizationStrategyItem
            if (labeling.optimizationStrategy === yfiles.labeling.OptimizationStrategy.NONE) {
              labeling.profitModel = new yfiles.layout.SimpleProfitModel()
            }

            labeling.removeNodeOverlaps = !this.allowNodeOverlapsItem
            labeling.removeEdgeOverlaps = !this.allowEdgeOverlapsItem
            labeling.placeEdgeLabels = this.placeEdgeLabelsItem
            labeling.placeNodeLabels = this.placeNodeLabelsItem
            labeling.reduceAmbiguity = this.reduceAmbiguityItem

            const selectionOnly = this.considerSelectedFeaturesOnlyItem
            labeling.affectedLabelsDpKey = null

            if (graphComponent.selection !== null && selectionOnly) {
              labeling.affectedLabelsDpKey = SelectedLabelsStage.PROVIDER_KEY
              labeling = new SelectedLabelsStage(labeling)
            }

            demo.LayoutConfiguration.addPreferredPlacementDescriptor(
              graphComponent.graph,
              this.labelPlacementAlongEdgeItem,
              this.labelPlacementSideOfEdgeItem,
              this.labelPlacementOrientationItem,
              this.labelPlacementDistanceItem
            )
            this.$setupEdgeLabelModels(graphComponent)

            return labeling
          },

          /**
           * Creates and configures the layout data.
           * @return {yfiles.layout.LayoutData} The configured layout data.
           */
          createConfiguredLayoutData: function(graphComponent, layout) {
            const layoutData = new yfiles.labeling.LabelingData()

            const selection = graphComponent.selection
            if (selection !== null) {
              // layoutData.affectedLabels.source = selection.selectedLabels;
              layoutData.affectedLabels.delegate = label => {
                return selection.isSelected(label)
              }

              graphComponent.graph.mapperRegistry.createDelegateMapper(
                yfiles.graph.ILabelOwner.$class,
                yfiles.lang.Object.$class,
                SelectedLabelsStage.SELECTED_LABELS_AT_ITEM_KEY,
                function(item) {
                  const bools = []
                  for (let i = 0; i < item.labels.size; i++) {
                    bools.push(
                      selection.isSelected(item.labels.get(i)) || selection.isSelected(item)
                    )
                  }
                  return bools
                }
              )
            }

            return layoutData
          },

          /**
           * Called after the layout animation is done.
           * @see Overrides {@link demo.LayoutConfiguration#postProcess}
           */
          postProcess: function(graphComponent) {},

          $setupEdgeLabelModels: function(graphComponent) {
            const model = new yfiles.graph.FreeEdgeLabelModel()

            const selectionOnly = this.considerSelectedFeaturesOnlyItem
            const placeEdgeLabels = this.placeEdgeLabelsItem
            if (!placeEdgeLabels) {
              return
            }

            const parameterFinder = model.lookup(yfiles.graph.ILabelModelParameterFinder.$class)
            const graph = graphComponent.graph
            graph.edgeLabels.forEach(label => {
              if (selectionOnly) {
                if (graphComponent.selection.isSelected(label)) {
                  graph.setLabelLayoutParameter(
                    label,
                    parameterFinder.findBestParameter(label, model, label.layout)
                  )
                }
              } else {
                graph.setLabelLayoutParameter(
                  label,
                  parameterFinder.findBestParameter(label, model, label.layout)
                )
              }
            })
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
          QualityGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Quality'),
                demo.options.OptionGroupAttribute('RootGroup', 20),
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
                demo.options.OptionGroupAttribute('RootGroup', 30),
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
              return "<p style='margin-top:0'>This algorithm finds good positions for the labels of nodes and edges. Typically, a label should be placed near the item it belongs to and it should not overlap with other labels. Optionally, overlaps with nodes and edges can be avoided as well.</p>"
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $placeNodeLabelsItem: false,

          /** @type {boolean} */
          placeNodeLabelsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Place Node Labels',
                  '#/api/yfiles.labeling.GenericLabeling#LabelingBase-property-placeNodeLabels'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 10),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$placeNodeLabelsItem
            },
            set: function(value) {
              this.$placeNodeLabelsItem = value
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
                  '#/api/yfiles.labeling.GenericLabeling#LabelingBase-property-placeEdgeLabels'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 20),
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
           * @type {boolean}
           */
          $considerSelectedFeaturesOnlyItem: false,

          /** @type {boolean} */
          considerSelectedFeaturesOnlyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Consider Selected Features Only',
                  '#/api/yfiles.labeling.GenericLabeling#LabelingBase-property-affectedLabelsDpKey'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$considerSelectedFeaturesOnlyItem
            },
            set: function(value) {
              this.$considerSelectedFeaturesOnlyItem = value
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
                  'Allow Node Overlaps',
                  '#/api/yfiles.labeling.GenericLabeling#MISLabelingBase-property-removeNodeOverlaps'
                ),
                demo.options.OptionGroupAttribute('QualityGroup', 10),
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

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $allowEdgeOverlapsItem: false,

          /** @type {boolean} */
          allowEdgeOverlapsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Allow Edge Overlaps',
                  '#/api/yfiles.labeling.GenericLabeling#MISLabelingBase-property-removeEdgeOverlaps'
                ),
                demo.options.OptionGroupAttribute('QualityGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$allowEdgeOverlapsItem
            },
            set: function(value) {
              this.$allowEdgeOverlapsItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.labeling.OptimizationStrategy}
           */
          $optimizationStrategyItem: null,

          /** @type {yfiles.labeling.OptimizationStrategy} */
          optimizationStrategyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Optimization Strategy',
                  '#/api/yfiles.labeling.GenericLabeling#MISLabelingBase-property-optimizationStrategy'
                ),
                demo.options.OptionGroupAttribute('QualityGroup', 40),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Balanced', yfiles.labeling.OptimizationStrategy.BALANCED],
                    ['NodeOverlap', yfiles.labeling.OptimizationStrategy.NODE_OVERLAP],
                    ['LabelOverlap', yfiles.labeling.OptimizationStrategy.LABEL_OVERLAP],
                    ['EdgeOverlap', yfiles.labeling.OptimizationStrategy.EDGE_OVERLAP],
                    ['None', yfiles.labeling.OptimizationStrategy.NONE]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.labeling.OptimizationStrategy.$class)
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
                demo.options.OptionGroupAttribute('QualityGroup', 50),
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
                this.labelPlacementSideOfEdgeItem ===
                demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
              )
            }
          },

          $initLabelingConfig: function() {
            this.$optimizationStrategyItem = yfiles.labeling.OptimizationStrategy.BALANCED
            this.$labelPlacementOrientationItem =
              demo.LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL
            this.$labelPlacementAlongEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.ANYWHERE
            this.$labelPlacementSideOfEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ANYWHERE
          },

          /** @lends {demo.LabelingConfig} */
          $static: {
            /**
             * @type {string}
             */
            LABEL_SELECTION_DP_KEY: 'LabelSelection'
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
