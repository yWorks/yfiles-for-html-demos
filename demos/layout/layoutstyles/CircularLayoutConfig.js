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
  CircularLayout,
  CircularLayoutData,
  CircularLayoutEdgeRoutingPolicy,
  CircularLayoutStyle,
  Class,
  EdgeBundleDescriptor,
  GenericLabeling,
  GraphComponent,
  PartitionStyle,
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
const CircularLayoutConfig = Class('CircularLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('CircularLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function() {
    LayoutConfiguration.call(this)
    const layout = new CircularLayout()
    const treeLayout = layout.balloonLayout

    this.layoutStyleItem = CircularLayoutStyle.BCC_COMPACT
    this.actOnSelectionOnlyItem = false
    this.fromSketchItem = false
    this.handleNodeLabelsItem = false

    this.partitionLayoutStyleItem = PartitionStyle.CYCLE
    this.minimumNodeDistanceItem = 30
    this.chooseRadiusAutomaticallyItem = true
    this.fixedRadiusItem = 200

    this.edgeRoutingItem = CircularLayoutEdgeRoutingPolicy.INTERIOR
    this.exteriorEdgeToCircleDistanceItem = 20
    this.exteriorEdgeToEdgeDistanceItem = 10
    this.exteriorEdgeCornerRadiusItem = 20
    this.exteriorEdgeAngleItem = 10
    this.exteriorEdgeSmoothnessItem = 0.7

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
   * @return {ILayoutAlgorithm} The configured layout algorithm.
   */
  createConfiguredLayout: function(graphComponent) {
    const layout = new CircularLayout()
    const balloonLayout = layout.balloonLayout

    layout.layoutStyle = this.layoutStyleItem
    layout.subgraphLayoutEnabled = this.actOnSelectionOnlyItem
    layout.maximumDeviationAngle = this.maximumDeviationAngleItem
    layout.fromSketchMode = this.fromSketchItem
    layout.considerNodeLabels = this.handleNodeLabelsItem

    layout.partitionStyle = this.partitionLayoutStyleItem

    layout.singleCycleLayout.minimumNodeDistance = this.minimumNodeDistanceItem
    layout.singleCycleLayout.automaticRadius = this.chooseRadiusAutomaticallyItem
    layout.singleCycleLayout.fixedRadius = this.fixedRadiusItem

    balloonLayout.preferredChildWedge = this.preferredChildWedgeItem
    balloonLayout.minimumEdgeLength = this.minimumEdgeLengthItem
    balloonLayout.compactnessFactor = this.compactnessFactorItem
    balloonLayout.allowOverlaps = this.allowOverlapsItem
    layout.placeChildrenOnCommonRadius = this.placeChildrenOnCommonRadiusItem
    balloonLayout.minimumNodeDistance = this.minimumTreeNodeDistanceItem

    if (this.edgeLabelingItem) {
      const genericLabeling = new GenericLabeling()
      genericLabeling.placeEdgeLabels = true
      genericLabeling.placeNodeLabels = false
      genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
      layout.labelingEnabled = true
      layout.labeling = genericLabeling
    }

    layout.edgeRoutingPolicy = this.edgeRoutingItem
    layout.exteriorEdgeLayoutDescriptor.circleDistance = this.exteriorEdgeToCircleDistanceItem
    layout.exteriorEdgeLayoutDescriptor.edgeToEdgeDistance = this.exteriorEdgeToEdgeDistanceItem
    layout.exteriorEdgeLayoutDescriptor.preferredCurveLength = this.exteriorEdgeCornerRadiusItem
    layout.exteriorEdgeLayoutDescriptor.preferredAngle = this.exteriorEdgeAngleItem
    layout.exteriorEdgeLayoutDescriptor.smoothness = this.exteriorEdgeSmoothnessItem

    const ebc = layout.edgeBundling
    ebc.bundlingStrength = this.edgeBundlingStrengthItem
    ebc.defaultBundleDescriptor = new EdgeBundleDescriptor({
      bundled: this.edgeBundlingItem
    })

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
    const layoutData = new CircularLayoutData()

    if (this.layoutStyleItem === CircularLayoutStyle.CUSTOM_GROUPS) {
      layoutData.customGroups = node => graphComponent.graph.getParent(node)
    }

    if (this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.MARKED_EXTERIOR) {
      layoutData.exteriorEdges = graphComponent.selection.selectedEdges
    }

    return layoutData
  },

  /**
   * Called after the layout animation is done.
   * @see Overrides {@link LayoutConfiguration#postProcess}
   */
  postProcess: function(graphComponent) {},

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
  CycleGroup: {
    $meta: function() {
      return [
        LabelAttribute('Partition'),
        OptionGroupAttribute('RootGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  EdgesGroup: {
    $meta: function() {
      return [
        LabelAttribute('Edges'),
        OptionGroupAttribute('RootGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  ExteriorEdgesGroup: {
    $meta: function() {
      return [
        LabelAttribute('Exterior Edges'),
        OptionGroupAttribute('EdgesGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  TreeGroup: {
    $meta: function() {
      return [
        LabelAttribute('Tree'),
        OptionGroupAttribute('RootGroup', 30),
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
        OptionGroupAttribute('RootGroup', 50),
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
      return "<p style='margin-top:0'>The circular layout style emphasizes group and tree structures within a network. It creates node partitions by analyzing the connectivity structure of the network, and arranges the partitions as separate circles. The circles themselves are arranged in a radial tree layout fashion.</p><p>This layout style portraits interconnected ring and star topologies and is excellent for applications in:</p><ul><li>Social networking (criminology, economics, fraud detection, etc.)</li><li>Network management</li><li>WWW visualization</li><li>eCommerce</li></ul>"
    }
  },

  /**
   * Backing field for below property
   * @type {CircularLayoutStyle}
   */
  $layoutStyleItem: null,

  /** @type {CircularLayoutStyle} */
  layoutStyleItem: {
    $meta: function() {
      return [
        LabelAttribute('Layout Style', '#/api/CircularLayout#CircularLayout-property-layoutStyle'),
        OptionGroupAttribute('GeneralGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['BCC Compact', CircularLayoutStyle.BCC_COMPACT],
            ['BCC Isolated', CircularLayoutStyle.BCC_ISOLATED],
            ['Custom Groups', CircularLayoutStyle.CUSTOM_GROUPS],
            ['Single Cycle', CircularLayoutStyle.SINGLE_CYCLE]
          ]
        }),
        TypeAttribute(CircularLayoutStyle.$class)
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
        LabelAttribute(
          'Act on Selection Only',
          '#/api/CircularLayout#MultiStageLayout-property-subgraphLayoutEnabled'
        ),
        OptionGroupAttribute('GeneralGroup', 20),
        TypeAttribute(YBoolean.$class)
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
        LabelAttribute(
          'Use Drawing as Sketch',
          '#/api/CircularLayout#CircularLayout-property-fromSketchMode'
        ),
        OptionGroupAttribute('GeneralGroup', 30),
        TypeAttribute(YBoolean.$class)
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
   * @type {PartitionLayoutStyle}
   */
  $partitionLayoutStyleItem: null,

  /** @type {PartitionLayoutStyle} */
  partitionLayoutStyleItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Partition Layout Style',
          '#/api/CircularLayout#CircularLayout-property-partitionStyle'
        ),
        OptionGroupAttribute('CycleGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Circle', PartitionStyle.CYCLE],
            ['Disk', PartitionStyle.DISK],
            ['Organic Disk', PartitionStyle.ORGANIC]
          ]
        }),
        TypeAttribute(PartitionStyle.$class)
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
        LabelAttribute(
          'Minimum Node Distance',
          '#/api/SingleCycleLayout#SingleCycleLayout-property-minimumNodeDistance'
        ),
        OptionGroupAttribute('CycleGroup', 20),
        MinMaxAttribute().init({
          min: 0,
          max: 999
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
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
      return [TypeAttribute(YBoolean.$class)]
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
        LabelAttribute(
          'Choose Radius Automatically',
          '#/api/SingleCycleLayout#SingleCycleLayout-property-automaticRadius'
        ),
        OptionGroupAttribute('CycleGroup', 30),
        TypeAttribute(YBoolean.$class)
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
        LabelAttribute(
          'Fixed Radius',
          '#/api/SingleCycleLayout#SingleCycleLayout-property-fixedRadius'
        ),
        OptionGroupAttribute('CycleGroup', 40),
        MinMaxAttribute().init({
          min: 1,
          max: 800
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
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
      return [TypeAttribute(YBoolean.$class)]
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
        LabelAttribute(
          'Enable Edge Bundling',
          '#/api/EdgeBundling#EdgeBundling-property-defaultBundleDescriptor'
        ),
        OptionGroupAttribute('EdgesGroup', 40),
        TypeAttribute(YBoolean.$class)
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
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return (
        (this.partitionLayoutStyleItem !== PartitionStyle.CYCLE ||
        this.layoutStyleItem === CircularLayoutStyle.BCC_ISOLATED)
      )
    }
  },

  /**
   * Backing field for below property
   * @type {CircularLayoutEdgeRoutingPolicy}
   */
  $edgeRoutingItem: CircularLayoutEdgeRoutingPolicy.INTERIOR,

  /** @type {CircularLayoutEdgeRoutingPolicy} */
  edgeRoutingItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Edge Routing Style',
          '#/api/CircularLayout#CircularLayout-property-edgeRoutingPolicy'
        ),
        OptionGroupAttribute('EdgesGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Inside', CircularLayoutEdgeRoutingPolicy.INTERIOR],
            ['Outside', CircularLayoutEdgeRoutingPolicy.EXTERIOR],
            ['Automatic', CircularLayoutEdgeRoutingPolicy.AUTOMATIC],
            ['Selected Edge Outside', CircularLayoutEdgeRoutingPolicy.MARKED_EXTERIOR]
          ]
        }),
        TypeAttribute(CircularLayoutEdgeRoutingPolicy.$class)
      ]
    },
    get: function() {
      return this.$edgeRoutingItem
    },
    set: function(value) {
      this.$edgeRoutingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $exteriorEdgeToCircleDistanceItem: 20,

  /** @type {number} */
  exteriorEdgeToCircleDistanceItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Distance to Circle',
          '#/api/ExteriorEdgeLayoutDescriptor#ExteriorEdgeLayoutDescriptor-property-circleDistance'
        ),
        OptionGroupAttribute('ExteriorEdgesGroup', 10),
        MinMaxAttribute().init({
          min: 10,
          max: 100,
          step: 1
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$exteriorEdgeToCircleDistanceItem
    },
    set: function(value) {
      this.$exteriorEdgeToCircleDistanceItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableExteriorEdgeToCircleDistanceItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $exteriorEdgeToEdgeDistanceItem: 10,

  /** @type {number} */
  exteriorEdgeToEdgeDistanceItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Edge to Edge Distance',
          '#/api/ExteriorEdgeLayoutDescriptor#ExteriorEdgeLayoutDescriptor-property-edgeToEdgeDistance'
        ),
        OptionGroupAttribute('ExteriorEdgesGroup', 20),
        MinMaxAttribute().init({
          min: 5,
          max: 50,
          step: 1
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$exteriorEdgeToEdgeDistanceItem
    },
    set: function(value) {
      this.$exteriorEdgeToEdgeDistanceItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableExteriorEdgeToEdgeDistanceItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $exteriorEdgeCornerRadiusItem: 20,

  /** @type {number} */
  exteriorEdgeCornerRadiusItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Corner Radius',
          '#/api/ExteriorEdgeLayoutDescriptor#ExteriorEdgeLayoutDescriptor-property-preferredCurveLength'
        ),
        OptionGroupAttribute('ExteriorEdgesGroup', 30),
        MinMaxAttribute().init({
          min: 0,
          max: 100,
          step: 1
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$exteriorEdgeCornerRadiusItem
    },
    set: function(value) {
      this.$exteriorEdgeCornerRadiusItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableExteriorEdgeCornerRadiusItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $exteriorEdgeAngleItem: 10,

  /** @type {number} */
  exteriorEdgeAngleItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Angle',
          '#/api/ExteriorEdgeLayoutDescriptor#ExteriorEdgeLayoutDescriptor-property-preferredAngle'
        ),
        OptionGroupAttribute('ExteriorEdgesGroup', 40),
        MinMaxAttribute().init({
          min: 0,
          max: 45,
          step: 1
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$exteriorEdgeAngleItem
    },
    set: function(value) {
      this.$exteriorEdgeAngleItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableExteriorEdgeAngleItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $exteriorEdgeSmoothnessItem: 0.7,

  /** @type {number} */
  exteriorEdgeSmoothnessItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Smoothness',
          '#/api/ExteriorEdgeLayoutDescriptor#ExteriorEdgeLayoutDescriptor-property-smoothness'
        ),
        OptionGroupAttribute('ExteriorEdgesGroup', 50),
        MinMaxAttribute().init({
          min: 0,
          max: 1,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$exteriorEdgeSmoothnessItem
    },
    set: function(value) {
      this.$exteriorEdgeSmoothnessItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableExteriorEdgeSmoothnessItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
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
        OptionGroupAttribute('EdgesGroup', 50),
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
      return (
        (this.partitionLayoutStyleItem !== PartitionStyle.CYCLE ||
        this.layoutStyleItem === CircularLayoutStyle.BCC_ISOLATED)
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
        LabelAttribute(
          'Preferred Child Wedge',
          '#/api/BalloonLayout#BalloonLayout-property-preferredChildWedge'
        ),
        OptionGroupAttribute('TreeGroup', 10),
        MinMaxAttribute().init({
          min: 1,
          max: 359
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
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
        LabelAttribute(
          'Minimum Edge Length',
          '#/api/BalloonLayout#BalloonLayout-property-minimumEdgeLength'
        ),
        OptionGroupAttribute('TreeGroup', 20),
        MinMaxAttribute().init({
          min: 5,
          max: 400
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
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
        LabelAttribute(
          'Maximum Deviation Angle',
          '#/api/CircularLayout#CircularLayout-property-maximumDeviationAngle'
        ),
        OptionGroupAttribute('TreeGroup', 30),
        MinMaxAttribute().init({
          min: 1,
          max: 360
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
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
        LabelAttribute(
          'Compactness Factor',
          '#/api/BalloonLayout#BalloonLayout-property-compactnessFactor'
        ),
        OptionGroupAttribute('TreeGroup', 40),
        MinMaxAttribute().init({
          min: 0.1,
          max: 0.9,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
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
        LabelAttribute(
          'Minimum Node Distance',
          '#/api/BalloonLayout#BalloonLayout-property-minimumNodeDistance'
        ),
        OptionGroupAttribute('TreeGroup', 50),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
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
        LabelAttribute(
          'Allow Overlaps',
          '#/api/BalloonLayout#BalloonLayout-property-allowOverlaps'
        ),
        OptionGroupAttribute('TreeGroup', 60),
        TypeAttribute(YBoolean.$class)
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
        LabelAttribute(
          'Place Children on Common Radius',
          '#/api/CircularLayout#CircularLayout-property-placeChildrenOnCommonRadius'
        ),
        OptionGroupAttribute('TreeGroup', 70),
        TypeAttribute(YBoolean.$class)
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
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.layoutStyleItem === CircularLayoutStyle.SINGLE_CYCLE
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
        LabelAttribute(
          'Consider Node Labels',
          '#/api/CircularLayout#CircularLayout-property-considerNodeLabels'
        ),
        OptionGroupAttribute('NodePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
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
        LabelAttribute(
          'Edge Labeling',
          '#/api/CircularLayout#MultiStageLayout-property-labelingEnabled'
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
  }
})
export default CircularLayoutConfig
