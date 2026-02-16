/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  HierarchicalLayoutData,
  LayoutTransformations,
  SubgraphLayoutStage
} from '@yfiles/yfiles'

import { LayoutConfiguration, OperationType } from './LayoutConfiguration'
import {
  ComponentAttribute,
  EnumValuesAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from '@yfiles/demo-app/demo-option-editor'

/**
 * Configuration options for the layout algorithm of the same name.
 */
export const LayoutTransformationsConfig = Class('LayoutTransformationsConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    GeneralGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    RotateGroup: [
      new LabelAttribute('Rotate'),
      new OptionGroupAttribute('GeneralGroup', 30),
      new TypeAttribute(OptionGroup)
    ],
    ScaleGroup: [
      new LabelAttribute('Scale'),
      new OptionGroupAttribute('GeneralGroup', 40),
      new TypeAttribute(OptionGroup)
    ],
    TranslateGroup: [
      new LabelAttribute('Translate'),
      new OptionGroupAttribute('GeneralGroup', 50),
      new TypeAttribute(OptionGroup)
    ],
    descriptionText: [
      new OptionGroupAttribute('DescriptionGroup', 10),
      new ComponentAttribute('html-block'),
      new TypeAttribute(String)
    ],
    operationItem: [
      new LabelAttribute('Operation', '#/api/LayoutTransformations'),
      new OptionGroupAttribute('GeneralGroup', 10),
      new EnumValuesAttribute([
        ['Mirror on X axis', 'mirror-x-axis'],
        ['Mirror on Y axis', 'mirror-y-axis'],
        ['Rotate', 'rotate'],
        ['Scale', 'scale'],
        ['Translate', 'translate']
      ]),
      new TypeAttribute(Number)
    ],
    actOnSelectionOnlyItem: [
      new LabelAttribute(
        'Act on Selection Only',
        '#/api/SubgraphLayoutStage#LayoutStageBase-property-enabled'
      ),
      new OptionGroupAttribute('GeneralGroup', 20),
      new TypeAttribute(Boolean)
    ],
    rotationAngleItem: [
      new LabelAttribute(
        'Rotation Angle',
        '#/api/LayoutTransformations#LayoutTransformations-method-createRotationStage'
      ),
      new OptionGroupAttribute('RotateGroup', 10),
      new MinMaxAttribute(-360, 360),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    applyBestFitRotationItem: [
      new LabelAttribute(
        'Best Fit Rotation',
        '#/api/LayoutTransformations#LayoutTransformations-method-createBestFitRotationStage'
      ),
      new OptionGroupAttribute('RotateGroup', 20),
      new TypeAttribute(Boolean)
    ],
    scaleFactorItem: [
      new LabelAttribute(
        'Scale Factor',
        '#/api/LayoutTransformations#LayoutTransformations-method-createScalingStage'
      ),
      new OptionGroupAttribute('ScaleGroup', 10),
      new MinMaxAttribute(0.1, 10.0, 0.01),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    scaleNodeSizeItem: [
      new LabelAttribute(
        'Scale Node Size',
        '#/api/LayoutTransformations#LayoutTransformations-method-createScalingStage'
      ),
      new OptionGroupAttribute('ScaleGroup', 20),
      new TypeAttribute(Boolean)
    ],
    translateXItem: [
      new LabelAttribute(
        'Horizontal Distance',
        '#/api/LayoutTransformations#LayoutTransformations-method-createTranslationStage'
      ),
      new OptionGroupAttribute('TranslateGroup', 10),
      new TypeAttribute(Number)
    ],
    translateYItem: [
      new LabelAttribute(
        'Vertical Distance',
        '#/api/LayoutTransformations#LayoutTransformations-method-createTranslationStage'
      ),
      new OptionGroupAttribute('TranslateGroup', 20),
      new TypeAttribute(Number)
    ]
  },

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)
    this.operationItem = 'scale'
    this.actOnSelectionOnlyItem = false
    this.rotationAngleItem = 0
    this.applyBestFitRotationItem = false
    this.scaleFactorItem = 1
    this.scaleNodeSizeItem = false
    this.translateXItem = 0
    this.translateYItem = 0
    this.title = 'Layout Transformations'
  },

  /**
   * Creates and configures a layout.
   * @param _graphComponent The {@link GraphComponent} to apply the configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (_graphComponent) {
    let stage
    switch (this.operationItem) {
      case 'mirror-x-axis':
        stage = LayoutTransformations.createMirroringStage(true)
        break
      case 'mirror-y-axis':
        stage = LayoutTransformations.createMirroringStage(false)
        break
      case 'rotate':
        stage = this.applyBestFitRotationItem
          ? LayoutTransformations.createBestFitRotationStage()
          : LayoutTransformations.createRotationStage(this.rotationAngleItem)
        break
      case 'scale':
        stage = LayoutTransformations.createScalingStage(
          this.scaleFactorItem,
          this.scaleFactorItem,
          this.scaleNodeSizeItem
        )
        break
      case 'translate':
        stage = LayoutTransformations.createTranslationStage(
          this.translateXItem,
          this.translateYItem
        )
        break
      default:
        stage = LayoutTransformations.createScalingStage()
    }

    return this.actOnSelectionOnlyItem ? new SubgraphLayoutStage(stage) : stage
  },

  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
   */
  createConfiguredLayoutData: function (graphComponent, _layout) {
    return this.actOnSelectionOnlyItem
      ? this.createSubgraphLayoutData(graphComponent)
      : new HierarchicalLayoutData()
  },

  /** @type {OptionGroup} */
  GeneralGroup: null,

  /** @type {OptionGroup} */
  RotateGroup: null,

  /** @type {OptionGroup} */
  ScaleGroup: null,

  /** @type {OptionGroup} */
  TranslateGroup: null,

  /** @type {string} */
  descriptionText: {
    get: function () {
      return '<p>This layout algorithm applies geometric transformations to (sub-)graphs.</p><p>There are several ways to transform the graph that include mirroring, rotating, scaling and translating.</p>'
    }
  },

  /** @type {OperationType} */
  operationItem: null,

  /** @type {boolean} */
  actOnSelectionOnlyItem: false,

  /** @type {number} */
  rotationAngleItem: 0,

  /** @type {boolean} */
  shouldDisableRotationAngleItem: {
    get: function () {
      return this.operationItem !== 'rotate' || this.applyBestFitRotationItem
    }
  },

  /** @type {boolean} */
  applyBestFitRotationItem: false,

  /** @type {boolean} */
  shouldDisableApplyBestFitRotationItem: {
    get: function () {
      return this.operationItem !== 'rotate'
    }
  },

  /** @type {number} */
  scaleFactorItem: 0.1,

  /** @type {boolean} */
  shouldDisableScaleFactorItem: {
    get: function () {
      return this.operationItem !== 'scale'
    }
  },

  /** @type {boolean} */
  scaleNodeSizeItem: false,

  /** @type {boolean} */
  shouldDisableScaleNodeSizeItem: {
    get: function () {
      return this.operationItem !== 'scale'
    }
  },

  /** @type {number} */
  translateXItem: 0,

  /** @type {boolean} */
  shouldDisableTranslateXItem: {
    get: function () {
      return this.operationItem !== 'translate'
    }
  },

  /** @type {number} */
  translateYItem: 0,

  /** @type {boolean} */
  shouldDisableTranslateYItem: {
    get: function () {
      return this.operationItem !== 'translate'
    }
  }
})
