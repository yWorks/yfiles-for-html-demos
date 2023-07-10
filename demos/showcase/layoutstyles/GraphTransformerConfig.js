/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  Class,
  GraphComponent,
  GraphTransformer,
  ILayoutAlgorithm,
  LayoutGraphAdapter,
  OperationType,
  YBoolean,
  YNumber,
  YString
} from 'yfiles'

import LayoutConfiguration from './LayoutConfiguration.js'
import {
  ComponentAttribute,
  Components,
  EnumValuesAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from 'demo-resources/demo-option-editor'

/**
 * Configuration options for the layout algorithm of the same name.
 */
const GraphTransformerConfig = Class('GraphTransformerConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('GraphTransformer')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    LayoutConfiguration.call(this)
    const transformer = new GraphTransformer()
    this.operationItem = OperationType.SCALE
    this.actOnSelectionOnlyItem = false
    this.rotationAngleItem = transformer.rotationAngle
    this.applyBestFitRotationItem = false
    this.scaleFactorItem = transformer.scaleFactorX
    this.scaleNodeSizeItem = transformer.scaleNodeSize
    this.translateXItem = transformer.translateX
    this.translateYItem = transformer.translateY
    this.title = 'Graph Transformer'
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph.mapperRegistry} if necessary.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout  algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    const transformer = new GraphTransformer()
    transformer.operation = this.operationItem
    transformer.subgraphLayoutEnabled = this.actOnSelectionOnlyItem
    transformer.rotationAngle = this.rotationAngleItem
    if (this.applyBestFitRotationItem && this.operationItem === OperationType.ROTATE) {
      const size = graphComponent.innerSize
      this.applyBestFitRotationItem = true
      const layoutGraph = new LayoutGraphAdapter(graphComponent.graph).createCopiedLayoutGraph()
      transformer.rotationAngle = GraphTransformer.findBestFitRotationAngle(
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

  /** @type {OptionGroup} */
  GeneralGroup: {
    $meta: function () {
      return [
        LabelAttribute('General'),
        OptionGroupAttribute('RootGroup', 10),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  RotateGroup: {
    $meta: function () {
      return [
        LabelAttribute('Rotate'),
        OptionGroupAttribute('GeneralGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  ScaleGroup: {
    $meta: function () {
      return [
        LabelAttribute('Scale'),
        OptionGroupAttribute('GeneralGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  TranslateGroup: {
    $meta: function () {
      return [
        LabelAttribute('Translate'),
        OptionGroupAttribute('GeneralGroup', 40),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {string} */
  descriptionText: {
    $meta: function () {
      return [
        OptionGroupAttribute('DescriptionGroup', 10),
        ComponentAttribute(Components.HTML_BLOCK),
        TypeAttribute(YString.$class)
      ]
    },
    get: function () {
      return '<p>This layout algorithm applies geometric transformations to (sub-)graphs.</p><p>There are several ways to transform the graph that include mirroring, rotating, scaling and translating.</p>'
    }
  },

  /** @type {OperationType} */
  operationItem: {
    $meta: function () {
      return [
        LabelAttribute('Operation', '#/api/GraphTransformer#GraphTransformer-property-operation'),
        OptionGroupAttribute('GeneralGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Mirror on X axis', OperationType.MIRROR_X_AXIS],
            ['Mirror on Y axis', OperationType.MIRROR_Y_AXIS],
            ['Rotate', OperationType.ROTATE],
            ['Scale', OperationType.SCALE],
            ['Translate', OperationType.TRANSLATE]
          ]
        }),
        TypeAttribute(OperationType.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  actOnSelectionOnlyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Act on Selection Only',
          '#/api/GraphTransformer#MultiStageLayout-property-subgraphLayoutEnabled'
        ),
        OptionGroupAttribute('GeneralGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  rotationAngleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Rotation Angle',
          '#/api/GraphTransformer#GraphTransformer-property-rotationAngle'
        ),
        OptionGroupAttribute('RotateGroup', 10),
        MinMaxAttribute().init({
          min: -360,
          max: 360
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableRotationAngleItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.operationItem !== OperationType.ROTATE || this.applyBestFitRotationItem
    }
  },

  /** @type {boolean} */
  applyBestFitRotationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Best Fit Rotation',
          '#/api/GraphTransformer#GraphTransformer-method-findBestFitRotationAngle'
        ),
        OptionGroupAttribute('RotateGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableApplyBestFitRotationItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.operationItem !== OperationType.ROTATE
    }
  },

  /** @type {number} */
  scaleFactorItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Scale Factor',
          '#/api/GraphTransformer#GraphTransformer-property-scaleFactor'
        ),
        OptionGroupAttribute('ScaleGroup', 10),
        MinMaxAttribute().init({
          min: 0.1,
          max: 10.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0.1
  },

  /** @type {boolean} */
  shouldDisableScaleFactorItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.operationItem !== OperationType.SCALE
    }
  },

  /** @type {boolean} */
  scaleNodeSizeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Scale Node Size',
          '#/api/GraphTransformer#GraphTransformer-property-scaleNodeSize'
        ),
        OptionGroupAttribute('ScaleGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableScaleNodeSizeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.operationItem !== OperationType.SCALE
    }
  },

  /** @type {number} */
  translateXItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Horizontal Distance',
          '#/api/GraphTransformer#GraphTransformer-property-translateX'
        ),
        OptionGroupAttribute('TranslateGroup', 10),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableTranslateXItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.operationItem !== OperationType.TRANSLATE
    }
  },

  /** @type {number} */
  translateYItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Vertical Distance',
          '#/api/GraphTransformer#GraphTransformer-property-translateY'
        ),
        OptionGroupAttribute('TranslateGroup', 20),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableTranslateYItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.operationItem !== OperationType.TRANSLATE
    }
  }
})
export default GraphTransformerConfig
