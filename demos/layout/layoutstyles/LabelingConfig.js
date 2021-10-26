/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Enum,
  FreeEdgeLabelModel,
  GenericLabeling,
  GraphComponent,
  ILabelLayoutDpKey,
  ILabelModelParameterFinder,
  ILayoutAlgorithm,
  LabelingData,
  LayoutData,
  OptimizationStrategy,
  SimpleProfitModel,
  YBoolean,
  YNumber,
  YString
} from 'yfiles'

import {
  ComponentAttribute,
  Components,
  EnumValuesAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from '../../resources/demo-option-editor.js'
import LayoutConfiguration, {
  LabelPlacementAlongEdge,
  LabelPlacementSideOfEdge,
  LabelPlacementOrientation
} from './LayoutConfiguration.js'

const SELECTED_LABELS_KEY = new ILabelLayoutDpKey(YBoolean.$class, null, 'SelectedLabels')

/**
 * Configuration options for the layout algorithm of the same name.
 */
const LabelingConfig = Class('LabelingConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('Labeling')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    LayoutConfiguration.call(this)
    this.placeNodeLabelsItem = true
    this.placeEdgeLabelsItem = true
    this.considerSelectedFeaturesOnlyItem = false

    this.optimizationStrategyItem = OptimizationStrategy.BALANCED

    this.allowNodeOverlapsItem = false
    this.allowEdgeOverlapsItem = true
    this.reduceAmbiguityItem = true

    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
    this.title = 'Generic Labeling'
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return The configured layout.
   */
  createConfiguredLayout: function (graphComponent) {
    const labeling = new GenericLabeling()
    labeling.autoFlipping = true
    labeling.optimizationStrategy = this.optimizationStrategyItem
    if (labeling.optimizationStrategy === OptimizationStrategy.NONE) {
      labeling.profitModel = new SimpleProfitModel()
    }

    labeling.removeNodeOverlaps = !this.allowNodeOverlapsItem
    labeling.removeEdgeOverlaps = !this.allowEdgeOverlapsItem
    labeling.placeEdgeLabels = this.placeEdgeLabelsItem
    labeling.placeNodeLabels = this.placeNodeLabelsItem
    labeling.reduceAmbiguity = this.reduceAmbiguityItem

    const selectionOnly = this.considerSelectedFeaturesOnlyItem
    labeling.affectedLabelsDpKey = null

    if (graphComponent.selection !== null && selectionOnly) {
      labeling.affectedLabelsDpKey = SELECTED_LABELS_KEY
    }

    return labeling
  },

  /**
   * Creates and configures the layout data.
   * @return The configured layout data.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData = new LabelingData()

    const selection = graphComponent.selection
    if (selection !== null) {
      layoutData.affectedLabels.dpKey = SELECTED_LABELS_KEY
      layoutData.affectedLabels.delegate = label =>
        selection.isSelected(label) || selection.isSelected(label.owner)
    }

    if (this.placeEdgeLabelsItem) {
      this.setupEdgeLabelModels(graphComponent)
      return layoutData.combineWith(
        this.createLabelingLayoutData(
          graphComponent.graph,
          this.labelPlacementAlongEdgeItem,
          this.labelPlacementSideOfEdgeItem,
          this.labelPlacementOrientationItem,
          this.labelPlacementDistanceItem
        )
      )
    }

    return layoutData
  },

  setupEdgeLabelModels: function (graphComponent) {
    const model = new FreeEdgeLabelModel()

    const selectionOnly = this.considerSelectedFeaturesOnlyItem
    const placeEdgeLabels = this.placeEdgeLabelsItem
    if (!placeEdgeLabels) {
      return
    }

    const parameterFinder = model.lookup(ILabelModelParameterFinder.$class)
    const graph = graphComponent.graph
    for (const label of graph.edgeLabels) {
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
    }
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
  QualityGroup: {
    $meta: function () {
      return [
        LabelAttribute('Quality'),
        OptionGroupAttribute('RootGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  PreferredPlacementGroup: {
    $meta: function () {
      return [
        LabelAttribute('Preferred Edge Label Placement'),
        OptionGroupAttribute('RootGroup', 30),
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
      return "<p style='margin-top:0'>This algorithm finds good positions for the labels of nodes and edges. Typically, a label should be placed near the item it belongs to and it should not overlap with other labels. Optionally, overlaps with nodes and edges can be avoided as well.</p>"
    }
  },

  /** @type {boolean} */
  placeNodeLabelsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Place Node Labels',
          '#/api/GenericLabeling#LabelingBase-property-placeNodeLabels'
        ),
        OptionGroupAttribute('GeneralGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  placeEdgeLabelsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Place Edge Labels',
          '#/api/GenericLabeling#LabelingBase-property-placeEdgeLabels'
        ),
        OptionGroupAttribute('GeneralGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  considerSelectedFeaturesOnlyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Consider Selected Features Only',
          '#/api/GenericLabeling#LabelingBase-property-affectedLabelsDpKey'
        ),
        OptionGroupAttribute('GeneralGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  allowNodeOverlapsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Allow Node Overlaps',
          '#/api/GenericLabeling#MISLabelingBase-property-removeNodeOverlaps'
        ),
        OptionGroupAttribute('QualityGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  allowEdgeOverlapsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Allow Edge Overlaps',
          '#/api/GenericLabeling#MISLabelingBase-property-removeEdgeOverlaps'
        ),
        OptionGroupAttribute('QualityGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {OptimizationStrategy} */
  optimizationStrategyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Reduce overlaps',
          '#/api/GenericLabeling#MISLabelingBase-property-optimizationStrategy'
        ),
        OptionGroupAttribute('QualityGroup', 40),
        EnumValuesAttribute().init({
          values: [
            ['Balanced', OptimizationStrategy.BALANCED],
            ['With Nodes', OptimizationStrategy.NODE_OVERLAP],
            ['Between Labels', OptimizationStrategy.LABEL_OVERLAP],
            ['With Edges', OptimizationStrategy.EDGE_OVERLAP],
            ["Don't optimize", OptimizationStrategy.NONE]
          ]
        }),
        TypeAttribute(OptimizationStrategy.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  reduceAmbiguityItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Reduce Ambiguity',
          '#/api/GenericLabeling#MISLabelingBase-property-reduceAmbiguity'
        ),
        OptionGroupAttribute('QualityGroup', 50),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {LabelPlacementOrientation} */
  labelPlacementOrientationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Orientation',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-angle'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Parallel', LabelPlacementOrientation.PARALLEL],
            ['Orthogonal', LabelPlacementOrientation.ORTHOGONAL],
            ['Horizontal', LabelPlacementOrientation.HORIZONTAL],
            ['Vertical', LabelPlacementOrientation.VERTICAL]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {LabelPlacementAlongEdge} */
  labelPlacementAlongEdgeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Along Edge',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-placeAlongEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Anywhere', LabelPlacementAlongEdge.ANYWHERE],
            ['At Source', LabelPlacementAlongEdge.AT_SOURCE],
            ['At Source Port', LabelPlacementAlongEdge.AT_SOURCE_PORT],
            ['At Target', LabelPlacementAlongEdge.AT_TARGET],
            ['At Target Port', LabelPlacementAlongEdge.AT_TARGET_PORT],
            ['Centered', LabelPlacementAlongEdge.CENTERED]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {LabelPlacementSideOfEdge} */
  labelPlacementSideOfEdgeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Side of Edge',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-sideOfEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Anywhere', LabelPlacementSideOfEdge.ANYWHERE],
            ['On Edge', LabelPlacementSideOfEdge.ON_EDGE],
            ['Left', LabelPlacementSideOfEdge.LEFT],
            ['Right', LabelPlacementSideOfEdge.RIGHT],
            ['Left or Right', LabelPlacementSideOfEdge.LEFT_OR_RIGHT]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  labelPlacementDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Distance',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-distanceToEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 40),
        MinMaxAttribute().init({
          min: 0.0,
          max: 40.0
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
    }
  }
})
export default LabelingConfig
