/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  FreeEdgeLabelModel,
  GenericLabeling,
  GraphComponent,
  ILabelModelParameterFinder,
  ILabelOwner,
  LabelingData,
  OptimizationStrategy,
  SimpleProfitModel,
  YBoolean,
  YNumber,
  YObject,
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
import LayoutConfiguration from './LayoutConfiguration.js'
import SelectedLabelsStage from './SelectedLabelsStage.js'

/**
 * Configuration options for the layout algorithm of the same name.
 */
const LabelingConfig = Class('LabelingConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('Labeling')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function() {
    LayoutConfiguration.call(this)
    this.placeNodeLabelsItem = true
    this.placeEdgeLabelsItem = true
    this.considerSelectedFeaturesOnlyItem = false

    this.optimizationStrategyItem = OptimizationStrategy.BALANCED

    this.allowNodeOverlapsItem = false
    this.allowEdgeOverlapsItem = true
    this.reduceAmbiguityItem = true

    this.labelPlacementAlongEdgeItem = LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem =
      LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout.
   */
  createConfiguredLayout: function(graphComponent) {
    let labeling = new GenericLabeling()
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
      labeling.affectedLabelsDpKey = SelectedLabelsStage.PROVIDER_KEY
      labeling = new SelectedLabelsStage(labeling)
    }

    LayoutConfiguration.addPreferredPlacementDescriptor(
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
   * @return {LayoutData} The configured layout data.
   */
  createConfiguredLayoutData: function(graphComponent, layout) {
    const layoutData = new LabelingData()

    const selection = graphComponent.selection
    if (selection !== null) {
      layoutData.affectedLabels = selection.selectedLabels

      graphComponent.graph.mapperRegistry.createDelegateMapper(
        ILabelOwner.$class,
        YObject.$class,
        SelectedLabelsStage.SELECTED_LABELS_AT_ITEM_KEY,
        function(item) {
          const bools = []
          for (let i = 0; i < item.labels.size; i++) {
            bools.push(selection.isSelected(item.labels.get(i)) || selection.isSelected(item))
          }
          return bools
        }
      )
    }

    return layoutData
  },

  /**
   * Called after the layout animation is done.
   * @see Overrides {@link LayoutConfiguration#postProcess}
   */
  postProcess: function(graphComponent) {
    graphComponent.graph.mapperRegistry.removeMapper(
      SelectedLabelsStage.SELECTED_LABELS_AT_ITEM_KEY
    )
  },

  $setupEdgeLabelModels: function(graphComponent) {
    const model = new FreeEdgeLabelModel()

    const selectionOnly = this.considerSelectedFeaturesOnlyItem
    const placeEdgeLabels = this.placeEdgeLabelsItem
    if (!placeEdgeLabels) {
      return
    }

    const parameterFinder = model.lookup(ILabelModelParameterFinder.$class)
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

  /** @type {OptionGroup} */
  DescriptionGroup: {
    $meta: function() {
      return [
        LabelAttribute('Description'),
        OptionGroupAttribute('RootGroup', 5),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  GeneralGroup: {
    $meta: function() {
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
    $meta: function() {
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
    $meta: function() {
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
    $meta: function() {
      return [
        OptionGroupAttribute('DescriptionGroup', 10),
        ComponentAttribute(Components.HTML_BLOCK),
        TypeAttribute(YString.$class)
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
        LabelAttribute(
          'Place Node Labels',
          '#/api/GenericLabeling#LabelingBase-property-placeNodeLabels'
        ),
        OptionGroupAttribute('GeneralGroup', 10),
        TypeAttribute(YBoolean.$class)
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
        LabelAttribute(
          'Place Edge Labels',
          '#/api/GenericLabeling#LabelingBase-property-placeEdgeLabels'
        ),
        OptionGroupAttribute('GeneralGroup', 20),
        TypeAttribute(YBoolean.$class)
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
        LabelAttribute(
          'Consider Selected Features Only',
          '#/api/GenericLabeling#LabelingBase-property-affectedLabelsDpKey'
        ),
        OptionGroupAttribute('GeneralGroup', 30),
        TypeAttribute(YBoolean.$class)
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
        LabelAttribute(
          'Allow Node Overlaps',
          '#/api/GenericLabeling#MISLabelingBase-property-removeNodeOverlaps'
        ),
        OptionGroupAttribute('QualityGroup', 10),
        TypeAttribute(YBoolean.$class)
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
        LabelAttribute(
          'Allow Edge Overlaps',
          '#/api/GenericLabeling#MISLabelingBase-property-removeEdgeOverlaps'
        ),
        OptionGroupAttribute('QualityGroup', 20),
        TypeAttribute(YBoolean.$class)
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
   * @type {OptimizationStrategy}
   */
  $optimizationStrategyItem: null,

  /** @type {OptimizationStrategy} */
  optimizationStrategyItem: {
    $meta: function() {
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
        LabelAttribute(
          'Reduce Ambiguity',
          '#/api/GenericLabeling#MISLabelingBase-property-reduceAmbiguity'
        ),
        OptionGroupAttribute('QualityGroup', 50),
        TypeAttribute(YBoolean.$class)
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
   * @type {LayoutConfiguration.EnumLabelPlacementOrientation}
   */
  $labelPlacementOrientationItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementOrientation} */
  labelPlacementOrientationItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Orientation',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-angle'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Parallel', LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL],
            ['Orthogonal', LayoutConfiguration.EnumLabelPlacementOrientation.ORTHOGONAL],
            ['Horizontal', LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL],
            ['Vertical', LayoutConfiguration.EnumLabelPlacementOrientation.VERTICAL]
          ]
        }),
        TypeAttribute(LayoutConfiguration.EnumLabelPlacementOrientation.$class)
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
   * @type {LayoutConfiguration.EnumLabelPlacementAlongEdge}
   */
  $labelPlacementAlongEdgeItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementAlongEdge} */
  labelPlacementAlongEdgeItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Along Edge',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-placeAlongEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Anywhere', LayoutConfiguration.EnumLabelPlacementAlongEdge.ANYWHERE],
            ['At Source', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_SOURCE],
            ['At Source Port', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_SOURCE_PORT],
            ['At Target', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET],
            ['At Target Port', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET_PORT],
            ['Centered', LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED]
          ]
        }),
        TypeAttribute(LayoutConfiguration.EnumLabelPlacementAlongEdge.$class)
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
   * @type {LayoutConfiguration.EnumLabelPlacementSideOfEdge}
   */
  $labelPlacementSideOfEdgeItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementSideOfEdge} */
  labelPlacementSideOfEdgeItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Side of Edge',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-sideOfEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Anywhere', LayoutConfiguration.EnumLabelPlacementSideOfEdge.ANYWHERE],
            ['On Edge', LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE],
            ['Left', LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT],
            ['Right', LayoutConfiguration.EnumLabelPlacementSideOfEdge.RIGHT],
            ['Left or Right', LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT_OR_RIGHT]
          ]
        }),
        TypeAttribute(LayoutConfiguration.EnumLabelPlacementSideOfEdge.$class)
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
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return (
        (this.labelPlacementSideOfEdgeItem ===
        LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE)
      )
    }
  }
})
export default LabelingConfig
