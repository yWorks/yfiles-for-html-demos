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
       * @yjs:keep=GeneralGroup,RotateGroup,ScaleGroup,TranslateGroup,actOnSelectionOnlyItem,applyBestFitRotationItem,operationItem,rotationAngleItem,scaleFactorItem,scaleNodeSizeItem,shouldDisableApplyBestFitRotationItem,shouldDisableRotationAngleItem,shouldDisableScaleFactorItem,shouldDisableScaleNodeSizeItem,shouldDisableTranslateXItem,shouldDisableTranslateYItem,translateXItem,translateYItem
       * @class
       * @extends demo.LayoutConfiguration
       */
      exports.GraphTransformerConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.GraphTransformerConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('GraphTransformer')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)
            const transformer = new yfiles.layout.GraphTransformer()
            this.operationItem = yfiles.layout.OperationType.SCALE
            this.actOnSelectionOnlyItem = false
            this.rotationAngleItem = transformer.rotationAngle
            this.applyBestFitRotationItem = false
            this.scaleFactorItem = transformer.scaleFactorX
            this.scaleNodeSizeItem = transformer.scaleNodeSize
            this.translateXItem = transformer.translateX
            this.translateYItem = transformer.translateY
          },

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout  algorithm.
           */
          createConfiguredLayout: function(graphComponent) {
            const transformer = new yfiles.layout.GraphTransformer()
            transformer.operation = this.operationItem
            transformer.subgraphLayoutEnabled = this.actOnSelectionOnlyItem
            transformer.rotationAngle = this.rotationAngleItem
            if (
              this.applyBestFitRotationItem &&
              this.operationItem === yfiles.layout.OperationType.ROTATE
            ) {
              const size = graphComponent.innerSize
              this.applyBestFitRotationItem = true
              const layoutGraph = new yfiles.layout.LayoutGraphAdapter(
                graphComponent.graph,
                null
              ).createCopiedLayoutGraph()
              transformer.rotationAngle = yfiles.layout.GraphTransformer.findBestFitRotationAngle(
                layoutGraph,
                size.width,
                size.height
              )
            } else {
              this.applyBestFitRotationItem = false
            }

            transformer.scaleFactor = this.scaleFactorItem
            transformer.scaleNodeSize = this.scaleNodeSizeItem
            transformer.translateX = this.translateXItem
            transformer.translateY = this.translateYItem

            return transformer
          },

          // ReSharper disable UnusedMember.Global
          // ReSharper disable InconsistentNaming
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
          RotateGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Rotate'),
                demo.options.OptionGroupAttribute('GeneralGroup', 20),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          ScaleGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Scale'),
                demo.options.OptionGroupAttribute('GeneralGroup', 30),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          TranslateGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Translate'),
                demo.options.OptionGroupAttribute('GeneralGroup', 40),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          // ReSharper restore UnusedMember.Global
          // ReSharper restore InconsistentNaming
          /**
           * Backing field for below property
           * @type {yfiles.layout.OperationType}
           */
          $operationItem: null,

          /** @type {yfiles.layout.OperationType} */
          operationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Operation',
                  '#/api/yfiles.layout.GraphTransformer#GraphTransformer-property-operation'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Mirror on X axis', yfiles.layout.OperationType.MIRROR_X_AXIS],
                    ['Mirror on Y axis', yfiles.layout.OperationType.MIRROR_Y_AXIS],
                    ['Rotate', yfiles.layout.OperationType.ROTATE],
                    ['Scale', yfiles.layout.OperationType.SCALE],
                    ['Translate', yfiles.layout.OperationType.TRANSLATE]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.layout.OperationType.$class)
              ]
            },
            get: function() {
              return this.$operationItem
            },
            set: function(value) {
              this.$operationItem = value
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
                  '#/api/yfiles.layout.GraphTransformer#MultiStageLayout-property-subgraphLayoutEnabled'
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
           * @type {number}
           */
          $rotationAngleItem: 0,

          /** @type {number} */
          rotationAngleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Rotation Angle',
                  '#/api/yfiles.layout.GraphTransformer#GraphTransformer-property-rotationAngle'
                ),
                demo.options.OptionGroupAttribute('RotateGroup', 10),
                demo.options.MinMaxAttribute().init({
                  min: -360,
                  max: 360
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$rotationAngleItem
            },
            set: function(value) {
              this.$rotationAngleItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableRotationAngleItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.operationItem !== yfiles.layout.OperationType.ROTATE ||
                this.applyBestFitRotationItem
              )
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $applyBestFitRotationItem: false,

          /** @type {boolean} */
          applyBestFitRotationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Best Fit Rotation',
                  '#/api/yfiles.layout.GraphTransformer#GraphTransformer-method-findBestFitRotationAngle'
                ),
                demo.options.OptionGroupAttribute('RotateGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$applyBestFitRotationItem
            },
            set: function(value) {
              this.$applyBestFitRotationItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableApplyBestFitRotationItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.operationItem !== yfiles.layout.OperationType.ROTATE
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $scaleFactorItem: 0,

          /** @type {number} */
          scaleFactorItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Scale Factor',
                  '#/api/yfiles.layout.GraphTransformer#GraphTransformer-property-scaleFactor'
                ),
                demo.options.OptionGroupAttribute('ScaleGroup', 10),
                demo.options.MinMaxAttribute().init({
                  min: 0.1,
                  max: 10.0,
                  step: 0.01
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$scaleFactorItem
            },
            set: function(value) {
              this.$scaleFactorItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableScaleFactorItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.operationItem !== yfiles.layout.OperationType.SCALE
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $scaleNodeSizeItem: false,

          /** @type {boolean} */
          scaleNodeSizeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Scale Node Size',
                  '#/api/yfiles.layout.GraphTransformer#GraphTransformer-property-scaleNodeSize'
                ),
                demo.options.OptionGroupAttribute('ScaleGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$scaleNodeSizeItem
            },
            set: function(value) {
              this.$scaleNodeSizeItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableScaleNodeSizeItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.operationItem !== yfiles.layout.OperationType.SCALE
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $translateXItem: 0,

          /** @type {number} */
          translateXItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Horizontal Distance',
                  '#/api/yfiles.layout.GraphTransformer#GraphTransformer-property-translateX'
                ),
                demo.options.OptionGroupAttribute('TranslateGroup', 10),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$translateXItem
            },
            set: function(value) {
              this.$translateXItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableTranslateXItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.operationItem !== yfiles.layout.OperationType.TRANSLATE
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $translateYItem: 0,

          /** @type {number} */
          translateYItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Vertical Distance',
                  '#/api/yfiles.layout.GraphTransformer#GraphTransformer-property-translateY'
                ),
                demo.options.OptionGroupAttribute('TranslateGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$translateYItem
            },
            set: function(value) {
              this.$translateYItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableTranslateYItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.operationItem !== yfiles.layout.OperationType.TRANSLATE
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
