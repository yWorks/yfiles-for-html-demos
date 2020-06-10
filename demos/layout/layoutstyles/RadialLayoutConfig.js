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
  CenterNodesPolicy,
  Class,
  EdgeBundleDescriptor,
  EnumDefinition,
  GenericLabeling,
  GraphComponent,
  RadialLayout,
  RadialLayoutData,
  RadialLayoutEdgeRoutingStrategy,
  RadialLayoutLayeringStrategy,
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
} from '../../resources/demo-option-editor.js'

/**
 * Configuration options for the layout algorithm of the same name.
 */
const RadialLayoutConfig = Class('RadialLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('RadialLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function() {
    LayoutConfiguration.call(this)

    const layout = new RadialLayout()

    this.centerStrategyItem = CenterNodesPolicy.WEIGHTED_CENTRALITY
    this.layeringStrategyItem = RadialLayoutLayeringStrategy.BFS
    this.minimumLayerDistanceItem = layout.minimumLayerDistance | 0
    this.minimumNodeToNodeDistanceItem = layout.minimumNodeToNodeDistance | 0
    this.maximumChildSectorSizeItem = layout.maximumChildSectorAngle | 0
    this.edgeRoutingStrategyItem = RadialLayoutEdgeRoutingStrategy.ARC
    this.edgeSmoothnessItem =
      Math.min(
        RadialLayoutConfig.MAXIMUM_SMOOTHNESS,
        (1 +
          RadialLayoutConfig.MAXIMUM_SMOOTHNESS * RadialLayoutConfig.SMOOTHNESS_ANGLE_FACTOR -
          layout.minimumBendAngle) /
          RadialLayoutConfig.SMOOTHNESS_ANGLE_FACTOR
      ) | 0
    this.edgeBundlingStrengthItem = 0.95

    this.edgeLabelingItem = false
    this.considerNodeLabelsItem = layout.considerNodeLabels
    this.labelPlacementAlongEdgeItem = LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem =
      LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout algorithm.
   */
  createConfiguredLayout: function(graphComponent) {
    const layout = new RadialLayout()
    layout.minimumNodeToNodeDistance = this.minimumNodeToNodeDistanceItem

    if (this.edgeRoutingStrategyItem !== RadialLayoutConfig.EnumEdgeRoutingStrategies.BUNDLED) {
      layout.edgeRoutingStrategy = this.edgeRoutingStrategyItem
    }
    const minimumBendAngle =
      1 +
      (RadialLayoutConfig.MAXIMUM_SMOOTHNESS - this.edgeSmoothnessItem) *
        RadialLayoutConfig.SMOOTHNESS_ANGLE_FACTOR
    layout.minimumBendAngle = minimumBendAngle
    layout.minimumLayerDistance = this.minimumLayerDistanceItem
    layout.maximumChildSectorAngle = this.maximumChildSectorSizeItem
    layout.centerNodesPolicy = this.centerStrategyItem
    layout.layeringStrategy = this.layeringStrategyItem
    layout.considerNodeLabels = this.considerNodeLabelsItem

    const ebc = layout.edgeBundling
    ebc.bundlingStrength = this.edgeBundlingStrengthItem
    ebc.defaultBundleDescriptor = new EdgeBundleDescriptor({
      bundled: this.edgeRoutingStrategyItem === RadialLayoutConfig.EnumEdgeRoutingStrategies.BUNDLED
    })

    if (this.edgeLabelingItem) {
      const labeling = new GenericLabeling()
      labeling.placeEdgeLabels = true
      labeling.placeNodeLabels = false
      labeling.reduceAmbiguity = this.reduceAmbiguityItem
      layout.labelingEnabled = true
      layout.labeling = labeling
    }

    LayoutConfiguration.addPreferredPlacementDescriptor(
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
   * @return {LayoutData} The configured layout data.
   */
  createConfiguredLayoutData: function(graphComponent, layout) {
    const layoutData = new RadialLayoutData()

    if (this.centerStrategyItem === CenterNodesPolicy.CUSTOM) {
      layoutData.centerNodes = node => graphComponent.selection.isSelected(node)
    }
    return layoutData
  },

  // ReSharper disable UnusedMember.Global
  // ReSharper disable InconsistentNaming
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
  LabelingGroup: {
    $meta: function() {
      return [
        LabelAttribute('Labeling'),
        OptionGroupAttribute('RootGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  NodePropertiesGroup: {
    $meta: function() {
      return [
        LabelAttribute('Node Settings'),
        OptionGroupAttribute('LabelingGroup', 10),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  EdgePropertiesGroup: {
    $meta: function() {
      return [
        LabelAttribute('Edge Settings'),
        OptionGroupAttribute('LabelingGroup', 20),
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
        OptionGroupAttribute('LabelingGroup', 30),
        TypeAttribute(OptionGroup.$class)
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
        OptionGroupAttribute('DescriptionGroup', 10),
        ComponentAttribute(Components.HTML_BLOCK),
        TypeAttribute(YString.$class)
      ]
    },
    get: function() {
      return (
        ('<p>The radial layout style arranges the nodes of a graph on concentric circles. Similar to hierarchic layouts, the overall flow of the graph is nicely visualized.</p>' +
        '<p>This style is well suited for the visualization of directed graphs and tree-like structures.</p>')
      )
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumLayerDistanceItem: 0,

  /** @type {number} */
  minimumLayerDistanceItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Circle Distance',
          '#/api/RadialLayout#RadialLayout-property-minimumLayerDistance'
        ),
        OptionGroupAttribute('GeneralGroup', 10),
        MinMaxAttribute().init({
          min: 1,
          max: 1000
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumLayerDistanceItem
    },
    set: function(value) {
      this.$minimumLayerDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumNodeToNodeDistanceItem: 0,

  /** @type {number} */
  minimumNodeToNodeDistanceItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Node Distance',
          '#/api/RadialLayout#RadialLayout-property-minimumNodeToNodeDistance'
        ),
        OptionGroupAttribute('GeneralGroup', 20),
        MinMaxAttribute().init({
          min: 0,
          max: 300
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumNodeToNodeDistanceItem
    },
    set: function(value) {
      this.$minimumNodeToNodeDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $maximumChildSectorSizeItem: 0,

  /** @type {number} */
  maximumChildSectorSizeItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Maximum Child Sector Size',
          '#/api/RadialLayout#RadialLayout-property-maximumChildSectorAngle'
        ),
        OptionGroupAttribute('GeneralGroup', 30),
        MinMaxAttribute().init({
          min: 15,
          max: 360
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$maximumChildSectorSizeItem
    },
    set: function(value) {
      this.$maximumChildSectorSizeItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {RadialLayoutEdgeRoutingStrategy}
   */
  $edgeRoutingStrategyItem: 0,

  /** @type {RadialLayoutEdgeRoutingStrategy} */
  edgeRoutingStrategyItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Routing Style',
          '#/api/RadialLayout#RadialLayout-property-edgeRoutingStrategy'
        ),
        OptionGroupAttribute('GeneralGroup', 40),
        EnumValuesAttribute().init({
          values: [
            ['Straight', RadialLayoutConfig.EnumEdgeRoutingStrategies.POLYLINE],
            ['Arc', RadialLayoutConfig.EnumEdgeRoutingStrategies.ARC],
            ['Bundled', RadialLayoutConfig.EnumEdgeRoutingStrategies.BUNDLED]
          ]
        }),
        TypeAttribute(RadialLayoutEdgeRoutingStrategy.$class)
      ]
    },
    get: function() {
      return this.$edgeRoutingStrategyItem
    },
    set: function(value) {
      this.$edgeRoutingStrategyItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $edgeSmoothnessItem: 0,

  /** @type {number} */
  edgeSmoothnessItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Arc Smoothness',
          '#/api/RadialLayout#RadialLayout-property-minimumBendAngle'
        ),
        OptionGroupAttribute('GeneralGroup', 50),
        MinMaxAttribute().init({
          min: RadialLayoutConfig.MINIMUM_SMOOTHNESS,
          max: RadialLayoutConfig.MAXIMUM_SMOOTHNESS
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$edgeSmoothnessItem
    },
    set: function(value) {
      this.$edgeSmoothnessItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableEdgeSmoothnessItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.edgeRoutingStrategyItem !== RadialLayoutEdgeRoutingStrategy.ARC
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
        LabelAttribute(
          'Bundling Strength',
          '#/api/EdgeBundling#EdgeBundling-property-bundlingStrength'
        ),
        OptionGroupAttribute('GeneralGroup', 55),
        MinMaxAttribute().init({
          min: 0,
          max: 1.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
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
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.edgeRoutingStrategyItem !== RadialLayoutConfig.EnumEdgeRoutingStrategies.BUNDLED
    }
  },

  /**
   * Backing field for below property
   * @type {CenterNodesPolicy}
   */
  $centerStrategyItem: null,

  /** @type {CenterNodesPolicy} */
  centerStrategyItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Center Allocation Strategy',
          '#/api/RadialLayout#RadialLayout-property-centerNodesPolicy'
        ),
        OptionGroupAttribute('GeneralGroup', 60),
        EnumValuesAttribute().init({
          values: [
            ['Directed', CenterNodesPolicy.DIRECTED],
            ['Centrality', CenterNodesPolicy.CENTRALITY],
            ['Weighted Centrality', CenterNodesPolicy.WEIGHTED_CENTRALITY],
            ['Selected Nodes', CenterNodesPolicy.CUSTOM]
          ]
        }),
        TypeAttribute(CenterNodesPolicy.$class)
      ]
    },
    get: function() {
      return this.$centerStrategyItem
    },
    set: function(value) {
      this.$centerStrategyItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {RadialLayoutLayeringStrategy}
   */
  $layeringStrategyItem: 0,

  /** @type {RadialLayoutLayeringStrategy} */
  layeringStrategyItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Circle Assignment Strategy',
          '#/api/RadialLayout#RadialLayout-property-layeringStrategy'
        ),
        OptionGroupAttribute('GeneralGroup', 70),
        EnumValuesAttribute().init({
          values: [
            ['Distance From Center', RadialLayoutLayeringStrategy.BFS],
            ['Hierarchic', RadialLayoutLayeringStrategy.HIERARCHICAL]
          ]
        }),
        TypeAttribute(RadialLayoutLayeringStrategy.$class)
      ]
    },
    get: function() {
      return this.$layeringStrategyItem
    },
    set: function(value) {
      this.$layeringStrategyItem = value
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
        LabelAttribute(
          'Consider Node Labels',
          '#/api/RadialLayout#RadialLayout-property-considerNodeLabels'
        ),
        OptionGroupAttribute('NodePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
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
   * @type {boolean}
   */
  $edgeLabelingItem: false,

  /** @type {boolean} */
  edgeLabelingItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Edge Labeling',
          '#/api/RadialLayout#MultiStageLayout-property-labelingEnabled'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
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
        LabelAttribute(
          'Reduce Ambiguity',
          '#/api/GenericLabeling#MISLabelingBase-property-reduceAmbiguity'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 20),
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

  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return !this.edgeLabelingItem
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

  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return !this.edgeLabelingItem
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

  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return !this.edgeLabelingItem
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

  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
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
        (!this.edgeLabelingItem ||
        this.labelPlacementSideOfEdgeItem ===
          LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE)
      )
    }
  },

  $static: {
    /**
     * @type {number}
     */
    MAXIMUM_SMOOTHNESS: 10,

    /**
     * @type {number}
     */
    MINIMUM_SMOOTHNESS: 1,

    /**
     * @type {number}
     */
    SMOOTHNESS_ANGLE_FACTOR: 4,

    EnumEdgeRoutingStrategies: new EnumDefinition(() => {
      return {
        ARC: RadialLayoutEdgeRoutingStrategy.ARC,
        POLYLINE: RadialLayoutEdgeRoutingStrategy.POLYLINE,
        BUNDLED: 2
      }
    })
  }
})
export default RadialLayoutConfig
