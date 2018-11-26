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
       * @yjs:keep=DescriptionGroup,LayoutGroup,descriptionText,aspectRatioItem,componentSpacingItem,fromSketchItem,gridEnabledItem,gridSpacingItem,noOverlapItem,shouldDisableAspectRatioItem,shouldDisableGridSpacingItem,styleItem,useScreenRatioItem
       * @class
       * @extends demo.LayoutConfiguration
       */
      exports.ComponentLayoutConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.ComponentLayoutConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('ComponentLayout')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)
            const layout = new yfiles.layout.ComponentLayout()
            this.styleItem = yfiles.layout.ComponentArrangementStyles.ROWS
            this.noOverlapItem =
              (layout.style & yfiles.layout.ComponentArrangementStyles.MODIFIER_NO_OVERLAP) !== 0
            this.fromSketchItem =
              (layout.style & yfiles.layout.ComponentArrangementStyles.MODIFIER_AS_IS) !== 0
            const size = layout.preferredSize
            this.useScreenRatioItem = true
            this.aspectRatioItem = size.width / size.height

            this.componentSpacingItem = layout.componentSpacing
            this.gridEnabledItem = layout.gridSpacing > 0
            this.gridSpacingItem = layout.gridSpacing > 0 ? layout.gridSpacing : 20.0
          },

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout algorithm.
           */
          createConfiguredLayout: function(graphComponent) {
            const layout = new yfiles.layout.ComponentLayout()
            layout.componentArrangement = true
            let style = this.styleItem
            if (this.noOverlapItem) {
              style |= yfiles.layout.ComponentArrangementStyles.MODIFIER_NO_OVERLAP
            }
            if (this.fromSketchItem) {
              style |= yfiles.layout.ComponentArrangementStyles.MODIFIER_AS_IS
            }
            layout.style = style

            let w, h
            if (graphComponent !== null && this.useScreenRatioItem) {
              const canvasSize = graphComponent.innerSize
              w = canvasSize.width
              h = canvasSize.height
            } else {
              w = this.aspectRatioItem
              h = 1.0 / w
              w *= 400.0
              h *= 400.0
            }
            layout.preferredSize = new yfiles.algorithms.YDimension(w, h)
            layout.componentSpacing = this.componentSpacingItem
            if (this.gridEnabledItem) {
              layout.gridSpacing = this.gridSpacingItem
            } else {
              layout.gridSpacing = 0
            }

            return layout
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
              return "<p style='margin-top:0'>The component layout arranges the connected components of a graph. It can use any other layout style to arrange each component separately, and then arranges the components as such.</p><p>In this demo, the arrangement of each component is just kept as it is.</p>"
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.layout.ComponentArrangementStyles}
           */
          $styleItem: null,

          /** @type {yfiles.layout.ComponentArrangementStyles} */
          styleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Layout Style',
                  '#/api/yfiles.layout.ComponentLayout#ComponentLayout-property-style'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['No Arrangement', yfiles.layout.ComponentArrangementStyles.NONE],
                    ['Multiple Rows', yfiles.layout.ComponentArrangementStyles.ROWS],
                    ['Single Row', yfiles.layout.ComponentArrangementStyles.SINGLE_ROW],
                    ['Single Column', yfiles.layout.ComponentArrangementStyles.SINGLE_COLUMN],
                    ['Packed Rectangle', yfiles.layout.ComponentArrangementStyles.PACKED_RECTANGLE],
                    [
                      'Compact Rectangle',
                      yfiles.layout.ComponentArrangementStyles.PACKED_COMPACT_RECTANGLE
                    ],
                    ['Packed Circle', yfiles.layout.ComponentArrangementStyles.PACKED_CIRCLE],
                    [
                      'Compact Circle',
                      yfiles.layout.ComponentArrangementStyles.PACKED_COMPACT_CIRCLE
                    ],
                    ['Nested Rows', yfiles.layout.ComponentArrangementStyles.MULTI_ROWS],
                    [
                      'Compact Nested Rows',
                      yfiles.layout.ComponentArrangementStyles.MULTI_ROWS_COMPACT
                    ],
                    [
                      'Width-constrained Nested Rows',
                      yfiles.layout.ComponentArrangementStyles.MULTI_ROWS_WIDTH_CONSTRAINT
                    ],
                    [
                      'Height-constrained Nested Rows',
                      yfiles.layout.ComponentArrangementStyles.MULTI_ROWS_HEIGHT_CONSTRAINT
                    ],
                    [
                      'Width-constrained Compact Nested Rows',
                      yfiles.layout.ComponentArrangementStyles.MULTI_ROWS_WIDTH_CONSTRAINT_COMPACT
                    ],
                    [
                      'Height-constrained Compact Nested Rows',
                      yfiles.layout.ComponentArrangementStyles.MULTI_ROWS_HEIGHT_CONSTRAINT_COMPACT
                    ]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.layout.ComponentArrangementStyles.$class)
              ]
            },
            get: function() {
              return this.$styleItem
            },
            set: function(value) {
              this.$styleItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $noOverlapItem: false,

          /** @type {boolean} */
          noOverlapItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Remove Overlaps',
                  '#/api/yfiles.layout.ComponentLayout#ComponentLayout-property-style'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$noOverlapItem
            },
            set: function(value) {
              this.$noOverlapItem = value
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
                  '#/api/yfiles.layout.ComponentLayout#ComponentLayout-property-style'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 30),
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
           * @type {boolean}
           */
          $useScreenRatioItem: false,

          /** @type {boolean} */
          useScreenRatioItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Use Screen Aspect Ratio',
                  '#/api/yfiles.layout.ComponentLayout#ComponentLayout-property-preferredSize'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 40),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$useScreenRatioItem
            },
            set: function(value) {
              this.$useScreenRatioItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $aspectRatioItem: 0,

          /** @type {number} */
          aspectRatioItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Aspect Ratio',
                  '#/api/yfiles.layout.ComponentLayout#ComponentLayout-property-preferredSize'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 50),
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
              return this.$aspectRatioItem
            },
            set: function(value) {
              this.$aspectRatioItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableAspectRatioItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.useScreenRatioItem
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $componentSpacingItem: 0,

          /** @type {number} */
          componentSpacingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Component Distance',
                  '#/api/yfiles.layout.ComponentLayout#ComponentLayout-property-componentSpacing'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 60),
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 400.0
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$componentSpacingItem
            },
            set: function(value) {
              this.$componentSpacingItem = value
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
                  '#/api/yfiles.layout.ComponentLayout#ComponentLayout-property-gridSpacing'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 70),
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
                  '#/api/yfiles.layout.ComponentLayout#ComponentLayout-property-gridSpacing'
                ),
                demo.options.OptionGroupAttribute('LayoutGroup', 80),
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
              return !this.gridEnabledItem
            }
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
