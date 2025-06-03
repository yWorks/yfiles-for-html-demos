/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GenericLabelingData,
  GraphComponent,
  ILabelModelParameterFinder,
  ILayoutAlgorithm,
  LabelingCosts,
  LabelingOptimizationStrategy,
  LayoutData,
  RecursiveGroupLayout
} from '@yfiles/yfiles'
import {
  ComponentAttribute,
  Components,
  EnumValuesAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from '@yfiles/demo-resources/demo-option-editor'
import {
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge,
  LayoutConfiguration
} from './LayoutConfiguration'
/**
 * Configuration options for the layout algorithm of the same name.
 */
export const LabelingConfig = Class('LabelingConfig', {
  $extends: LayoutConfiguration,
  _meta: {
    GeneralGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    QualityGroup: [
      new LabelAttribute('Quality'),
      new OptionGroupAttribute('RootGroup', 20),
      new TypeAttribute(OptionGroup)
    ],
    PreferredPlacementGroup: [
      new LabelAttribute('Preferred Edge Label Placement'),
      new OptionGroupAttribute('RootGroup', 30),
      new TypeAttribute(OptionGroup)
    ],
    descriptionText: [
      new OptionGroupAttribute('DescriptionGroup', 10),
      new ComponentAttribute(Components.HTML_BLOCK),
      new TypeAttribute(String)
    ],
    placeNodeLabelsItem: [
      new LabelAttribute(
        'Place Node Labels',
        '#/api/GenericLabeling#GenericLabeling-property-scope'
      ),
      new OptionGroupAttribute('GeneralGroup', 10),
      new TypeAttribute(Boolean)
    ],
    placeEdgeLabelsItem: [
      new LabelAttribute(
        'Place Edge Labels',
        '#/api/GenericLabeling#GenericLabeling-property-scope'
      ),
      new OptionGroupAttribute('GeneralGroup', 20),
      new TypeAttribute(Boolean)
    ],
    considerSelectedFeaturesOnlyItem: [
      new LabelAttribute(
        'Consider Selected Features Only',
        '#/api/GenericLabelingData#GenericLabelingData-property-scope'
      ),
      new OptionGroupAttribute('GeneralGroup', 30),
      new TypeAttribute(Boolean)
    ],
    optimizationStrategyItem: [
      new LabelAttribute('Reduce Overlaps', '#/api/LabelingOptimizationStrategy'),
      new OptionGroupAttribute('QualityGroup', 40),
      new EnumValuesAttribute([
        ['Balanced', LabelingOptimizationStrategy.BALANCED],
        ['With Nodes', LabelingOptimizationStrategy.NODE_OVERLAPS],
        ['Between Labels', LabelingOptimizationStrategy.LABEL_OVERLAPS],
        ['With Edges', LabelingOptimizationStrategy.EDGE_OVERLAPS],
        ['Layout Grid Overlap', LabelingOptimizationStrategy.LAYOUT_GRID_VIOLATIONS],
        ["Don't optimize", null]
      ]),
      new TypeAttribute(LabelingOptimizationStrategy)
    ],
    reduceAmbiguityItem: [
      new LabelAttribute(
        'Reduce Ambiguity',
        '#/api/LabelingCosts#LabelingCosts-property-ambiguousPlacementCost'
      ),
      new OptionGroupAttribute('QualityGroup', 50),
      new TypeAttribute(Boolean)
    ],
    labelPlacementOrientationItem: [
      new LabelAttribute(
        'Orientation',
        '#/api/EdgeLabelPreferredPlacement#EdgeLabelPreferredPlacement-property-angle'
      ),
      new OptionGroupAttribute('PreferredPlacementGroup', 10),
      new EnumValuesAttribute([
        ['Parallel', LabelPlacementOrientation.PARALLEL],
        ['Orthogonal', LabelPlacementOrientation.ORTHOGONAL],
        ['Horizontal', LabelPlacementOrientation.HORIZONTAL],
        ['Vertical', LabelPlacementOrientation.VERTICAL]
      ]),
      new TypeAttribute(LabelPlacementOrientation)
    ],
    labelPlacementAlongEdgeItem: [
      new LabelAttribute(
        'Along Edge',
        '#/api/EdgeLabelPreferredPlacement#EdgeLabelPreferredPlacement-property-placementAlongEdge'
      ),
      new OptionGroupAttribute('PreferredPlacementGroup', 20),
      new EnumValuesAttribute([
        ['Anywhere', LabelPlacementAlongEdge.ANYWHERE],
        ['At Source', LabelPlacementAlongEdge.AT_SOURCE],
        ['At Source Port', LabelPlacementAlongEdge.AT_SOURCE_PORT],
        ['At Target', LabelPlacementAlongEdge.AT_TARGET],
        ['At Target Port', LabelPlacementAlongEdge.AT_TARGET_PORT],
        ['Centered', LabelPlacementAlongEdge.CENTERED]
      ]),
      new TypeAttribute(LabelPlacementAlongEdge)
    ],
    labelPlacementSideOfEdgeItem: [
      new LabelAttribute(
        'Side of Edge',
        '#/api/EdgeLabelPreferredPlacement#EdgeLabelPreferredPlacement-property-edgeSide'
      ),
      new OptionGroupAttribute('PreferredPlacementGroup', 30),
      new EnumValuesAttribute([
        ['Anywhere', LabelPlacementSideOfEdge.ANYWHERE],
        ['On Edge', LabelPlacementSideOfEdge.ON_EDGE],
        ['Left', LabelPlacementSideOfEdge.LEFT],
        ['Right', LabelPlacementSideOfEdge.RIGHT],
        ['Left or Right', LabelPlacementSideOfEdge.LEFT_OR_RIGHT]
      ]),
      new TypeAttribute(LabelPlacementSideOfEdge)
    ],
    labelPlacementDistanceItem: [
      new LabelAttribute(
        'Distance',
        '#/api/EdgeLabelPreferredPlacement#EdgeLabelPreferredPlacement-property-distanceToEdge'
      ),
      new OptionGroupAttribute('PreferredPlacementGroup', 40),
      new MinMaxAttribute(0.0, 40.0),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ]
  },
  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)
    this.placeNodeLabelsItem = true
    this.placeEdgeLabelsItem = true
    this.considerSelectedFeaturesOnlyItem = false
    this.optimizationStrategyItem = LabelingOptimizationStrategy.BALANCED
    this.reduceAmbiguityItem = true
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
    this.title = 'Labeling'
  },
  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout.
   */
  createConfiguredLayout: function (graphComponent) {
    if (!this.placeEdgeLabelsItem && !this.placeNodeLabelsItem) {
      return RecursiveGroupLayout.FIX_CONTENT_LAYOUT
    }
    const labeling = new GenericLabeling()
    const labelingPenalties = new LabelingCosts(
      this.optimizationStrategyItem ?? LabelingOptimizationStrategy.BALANCED
    )
    labeling.defaultEdgeLabelingCosts = labelingPenalties
    labeling.defaultNodeLabelingCosts = labelingPenalties
    if (this.placeNodeLabelsItem && this.placeEdgeLabelsItem) {
      labeling.scope = 'all'
    } else {
      labeling.scope = this.placeEdgeLabelsItem ? 'edge-labels' : 'node-labels'
    }
    if (this.reduceAmbiguityItem) {
      labeling.defaultNodeLabelingCosts.ambiguousPlacementCost = 1.0
      labeling.defaultEdgeLabelingCosts.ambiguousPlacementCost = 1.0
    }
    return labeling
  },
  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData = new GenericLabelingData()
    const selection = graphComponent.selection
    if (selection !== null && this.considerSelectedFeaturesOnlyItem) {
      layoutData.scope.nodeLabels = (label) =>
        selection.includes(label) || selection.includes(label.owner)
      layoutData.scope.edgeLabels = (label) =>
        selection.includes(label) || selection.includes(label.owner)
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
    const graph = graphComponent.graph
    for (const label of graph.edgeLabels) {
      const parameterFinder = model.getContext(label).lookup(ILabelModelParameterFinder)
      if (selectionOnly) {
        if (graphComponent.selection.includes(label)) {
          graph.setLabelLayoutParameter(label, parameterFinder.findBestParameter(label.layout))
        }
      } else {
        graph.setLabelLayoutParameter(label, parameterFinder.findBestParameter(label.layout))
      }
    }
  },
  /** @type {OptionGroup} */
  GeneralGroup: null,
  /** @type {OptionGroup} */
  QualityGroup: null,
  /** @type {OptionGroup} */
  PreferredPlacementGroup: null,
  /** @type {string} */
  descriptionText: {
    get: function () {
      return "<p style='margin-top:0'>This algorithm finds good positions for the labels of nodes and edges. Typically, a label should be placed near the item it belongs to and it should not overlap with other labels. Optionally, overlaps with nodes and edges can be avoided as well.</p>"
    }
  },
  /** @type {boolean} */
  placeNodeLabelsItem: false,
  /** @type {boolean} */
  placeEdgeLabelsItem: false,
  /** @type {boolean} */
  considerSelectedFeaturesOnlyItem: false,
  /** @type {LabelingOptimizationStrategy} */
  optimizationStrategyItem: null,
  /** @type {boolean} */
  reduceAmbiguityItem: false,
  /** @type {LabelPlacementOrientation} */
  labelPlacementOrientationItem: null,
  /** @type {LabelPlacementAlongEdge} */
  labelPlacementAlongEdgeItem: null,
  /** @type {LabelPlacementSideOfEdge} */
  labelPlacementSideOfEdgeItem: null,
  /** @type {number} */
  labelPlacementDistanceItem: 0,
  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: {
    get: function () {
      return this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
    }
  }
})
