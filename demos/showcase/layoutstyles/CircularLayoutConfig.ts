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
  CircularLayout,
  CircularLayoutData,
  CircularLayoutEdgeRoutingPolicy,
  CircularLayoutOnCircleRoutingStyle,
  CircularLayoutRoutingStyle,
  CircularLayoutStarSubstructureStyle,
  CircularLayoutStyle,
  Class,
  EdgeBundleDescriptor,
  Enum,
  FreeNodeLabelModel,
  GenericLabeling,
  GraphComponent,
  ILayoutAlgorithm,
  LayoutData,
  NodeLabelingPolicy,
  PartitionStyle,
  YBoolean,
  YNumber,
  YString
} from 'yfiles'

import LayoutConfiguration, {
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge,
  NodeLabelingPolicies
} from './LayoutConfiguration'
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
const CircularLayoutConfig = (Class as any)('CircularLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('CircularLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
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

    this.defaultBetweenCirclesRoutingItem = CircularLayoutRoutingStyle.STRAIGHT
    this.defaultInCircleRoutingStyleItem = CircularLayoutRoutingStyle.STRAIGHT
    this.defaultOnCircleRoutingStyleItem = CircularLayoutOnCircleRoutingStyle.STRAIGHT

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

    this.starSubstructureItem = CircularLayoutStarSubstructureStyle.NONE
    this.starSubstructureSizeItem = layout.starSubstructureSize

    this.edgeLabelingItem = false
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
    this.title = 'Circular Layout'

    this.nodeLabelingStyleItem = NodeLabelingPolicies.CONSIDER_CURRENT_POSITION
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph.mapperRegistry} if necessary.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
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

    layout.defaultEdgeLayoutDescriptor.betweenCirclesRoutingStyle =
      this.defaultBetweenCirclesRoutingItem
    layout.defaultEdgeLayoutDescriptor.inCircleRoutingStyle = this.defaultInCircleRoutingStyleItem
    layout.defaultEdgeLayoutDescriptor.onCircleRoutingStyle = this.defaultOnCircleRoutingStyleItem

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

    switch (this.nodeLabelingStyleItem) {
      case NodeLabelingPolicies.NONE:
        layout.considerNodeLabels = false
        break
      case NodeLabelingPolicies.RAYLIKE_LEAVES:
        layout.integratedNodeLabeling = true
        layout.nodeLabelingPolicy = NodeLabelingPolicy.RAY_LIKE_LEAVES
        break
      case NodeLabelingPolicies.CONSIDER_CURRENT_POSITION:
        layout.considerNodeLabels = true
        break
      case NodeLabelingPolicies.HORIZONTAL:
        layout.integratedNodeLabeling = true
        layout.nodeLabelingPolicy = NodeLabelingPolicy.HORIZONTAL
        break
      default:
        layout.considerNodeLabels = false
        break
    }

    if (
      this.nodeLabelingStyleItem === NodeLabelingPolicies.RAYLIKE_LEAVES ||
      this.nodeLabelingStyleItem === NodeLabelingPolicies.HORIZONTAL
    ) {
      graphComponent.graph.nodeLabels.forEach((label) => {
        graphComponent.graph.setLabelLayoutParameter(
          label,
          FreeNodeLabelModel.INSTANCE.findBestParameter(
            label,
            FreeNodeLabelModel.INSTANCE,
            label.layout
          )
        )
      })
    }

    layout.starSubstructureStyle = this.starSubstructureItem
    layout.starSubstructureSize = this.starSubstructureSizeItem

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
   */
  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: CircularLayout
  ): LayoutData {
    const layoutData = new CircularLayoutData()

    if (this.layoutStyleItem === CircularLayoutStyle.CUSTOM_GROUPS) {
      layoutData.customGroups.delegate = (node) => graphComponent.graph.getParent(node)
    }

    if (this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.MARKED_EXTERIOR) {
      layoutData.exteriorEdges.items = graphComponent.selection.selectedEdges.toList()
    }

    return layoutData.combineWith(
      this.createLabelingLayoutData(
        graphComponent.graph,
        this.labelPlacementAlongEdgeItem,
        this.labelPlacementSideOfEdgeItem,
        this.labelPlacementOrientationItem,
        this.labelPlacementDistanceItem
      )
    )
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
  CycleGroup: {
    $meta: function () {
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
    $meta: function () {
      return [
        LabelAttribute('Edges'),
        OptionGroupAttribute('RootGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  DefaultEdgesGroup: {
    $meta: function () {
      return [
        LabelAttribute('Default Edges'),
        OptionGroupAttribute('EdgesGroup', 40),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  ExteriorEdgesGroup: {
    $meta: function () {
      return [
        LabelAttribute('Exterior Edges'),
        OptionGroupAttribute('EdgesGroup', 50),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  TreeGroup: {
    $meta: function () {
      return [
        LabelAttribute('Tree'),
        OptionGroupAttribute('RootGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  SubstructureLayoutGroup: {
    $meta: function () {
      return [
        LabelAttribute('Substructure Layout'),
        OptionGroupAttribute('RootGroup', 50),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  LabelingGroup: {
    $meta: function () {
      return [
        LabelAttribute('Labeling'),
        OptionGroupAttribute('RootGroup', 60),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  NodePropertiesGroup: {
    $meta: function () {
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
    $meta: function () {
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
    $meta: function () {
      return [
        LabelAttribute('Preferred Edge Label Placement'),
        OptionGroupAttribute('LabelingGroup', 30),
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
      return "<p style='margin-top:0'>The circular layout style emphasizes group and tree structures within a network. It creates node partitions by analyzing the connectivity structure of the network, and arranges the partitions as separate circles. The circles themselves are arranged in a radial tree layout fashion.</p><p>This layout style portraits interconnected ring and star topologies and is excellent for applications in:</p><ul><li>Social networking (criminology, economics, fraud detection, etc.)</li><li>Network management</li><li>WWW visualization</li><li>eCommerce</li></ul>"
    }
  },

  /** @type {CircularLayoutStyle} */
  layoutStyleItem: {
    $meta: function () {
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
    value: null
  },

  /** @type {boolean} */
  actOnSelectionOnlyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Act on Selection Only',
          '#/api/CircularLayout#MultiStageLayout-property-subgraphLayoutEnabled'
        ),
        OptionGroupAttribute('GeneralGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  fromSketchItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Use Drawing as Sketch',
          '#/api/CircularLayout#CircularLayout-property-fromSketchMode'
        ),
        OptionGroupAttribute('GeneralGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {PartitionStyle} */
  partitionLayoutStyleItem: {
    $meta: function () {
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
            ['Compact Disk', PartitionStyle.COMPACT_DISK],
            ['Organic', PartitionStyle.ORGANIC]
          ]
        }),
        TypeAttribute(PartitionStyle.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  minimumNodeDistanceItem: {
    $meta: function () {
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
    value: 0
  },

  /** @type {boolean} */
  shouldDisableMinimumNodeDistanceItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.chooseRadiusAutomaticallyItem === false
    }
  },

  /** @type {boolean} */
  chooseRadiusAutomaticallyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Choose Radius Automatically',
          '#/api/SingleCycleLayout#SingleCycleLayout-property-automaticRadius'
        ),
        OptionGroupAttribute('CycleGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  fixedRadiusItem: {
    $meta: function () {
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
    value: 1
  },

  /** @type {boolean} */
  shouldDisableFixedRadiusItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.chooseRadiusAutomaticallyItem
    }
  },

  /** @type {boolean} */
  edgeBundlingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Enable Edge Bundling',
          '#/api/EdgeBundling#EdgeBundling-property-defaultBundleDescriptor'
        ),
        OptionGroupAttribute('EdgesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableEdgeBundlingItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return (
        this.partitionLayoutStyleItem !== PartitionStyle.CYCLE ||
        this.layoutStyleItem === CircularLayoutStyle.BCC_ISOLATED
      )
    }
  },

  /** @type {CircularLayoutEdgeRoutingPolicy} */
  edgeRoutingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Routing Style',
          '#/api/CircularLayout#CircularLayout-property-edgeRoutingPolicy'
        ),
        OptionGroupAttribute('EdgesGroup', 30),
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
    value: CircularLayoutEdgeRoutingPolicy.INTERIOR
  },

  /** @type {CircularLayoutRoutingStyle} */
  defaultBetweenCirclesRoutingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Routing Style Between Circles',
          '#/api/CircularLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-betweenCirclesRoutingStyle'
        ),
        OptionGroupAttribute('DefaultEdgesGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Straight', CircularLayoutRoutingStyle.STRAIGHT],
            ['Curved', CircularLayoutRoutingStyle.CURVED]
          ]
        }),
        TypeAttribute(CircularLayoutRoutingStyle.$class)
      ]
    },
    value: CircularLayoutRoutingStyle.STRAIGHT
  },

  /** @type {boolean} */
  shouldDisableDefaultBetweenCirclesRoutingItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.EXTERIOR
    }
  },

  /** @type {CircularLayoutRoutingStyle} */
  defaultInCircleRoutingStyleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Routing Style Within Partitions',
          '#/api/CircularLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-inCircleRoutingStyle'
        ),
        OptionGroupAttribute('DefaultEdgesGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Straight', CircularLayoutRoutingStyle.STRAIGHT],
            ['Curved', CircularLayoutRoutingStyle.CURVED]
          ]
        }),
        TypeAttribute(CircularLayoutRoutingStyle.$class)
      ]
    },
    value: CircularLayoutRoutingStyle.STRAIGHT
  },

  /** @type {boolean} */
  shouldDisableDefaultInCircleRoutingStyleItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.EXTERIOR
    }
  },

  /** @type {CircularLayoutOnCircleRoutingStyle} */
  defaultOnCircleRoutingStyleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Routing Style Between Neighbors',
          '#/api/CircularLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-onCircleRoutingStyle'
        ),
        OptionGroupAttribute('DefaultEdgesGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Straight', CircularLayoutOnCircleRoutingStyle.STRAIGHT],
            ['Curved', CircularLayoutOnCircleRoutingStyle.CURVED],
            ['On Circle', CircularLayoutOnCircleRoutingStyle.ON_CIRCLE]
          ]
        }),
        TypeAttribute(CircularLayoutOnCircleRoutingStyle.$class)
      ]
    },
    value: CircularLayoutOnCircleRoutingStyle.STRAIGHT
  },

  /** @type {boolean} */
  shouldDisableDefaultOnCircleRoutingStyleItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.EXTERIOR
    }
  },

  /** @type {number} */
  exteriorEdgeToCircleDistanceItem: {
    $meta: function () {
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
    value: 20
  },

  /** @type {boolean} */
  shouldDisableExteriorEdgeToCircleDistanceItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /** @type {number} */
  exteriorEdgeToEdgeDistanceItem: {
    $meta: function () {
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
    value: 10
  },

  /** @type {boolean} */
  shouldDisableExteriorEdgeToEdgeDistanceItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /** @type {number} */
  exteriorEdgeCornerRadiusItem: {
    $meta: function () {
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
    value: 20
  },

  /** @type {boolean} */
  shouldDisableExteriorEdgeCornerRadiusItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /** @type {number} */
  exteriorEdgeAngleItem: {
    $meta: function () {
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
    value: 10
  },

  /** @type {boolean} */
  shouldDisableExteriorEdgeAngleItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /** @type {number} */
  exteriorEdgeSmoothnessItem: {
    $meta: function () {
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
    value: 0.7
  },

  /** @type {boolean} */
  shouldDisableExteriorEdgeSmoothnessItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.edgeRoutingItem === CircularLayoutEdgeRoutingPolicy.INTERIOR
    }
  },

  /** @type {number} */
  edgeBundlingStrengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Bundling Strength',
          '#/api/EdgeBundling#EdgeBundling-property-bundlingStrength'
        ),
        OptionGroupAttribute('EdgesGroup', 20),
        MinMaxAttribute().init({
          min: 0,
          max: 1.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 1.0
  },

  /** @type {boolean} */
  shouldDisableEdgeBundlingStrengthItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return (
        this.partitionLayoutStyleItem !== PartitionStyle.CYCLE ||
        this.layoutStyleItem === CircularLayoutStyle.BCC_ISOLATED
      )
    }
  },

  /** @type {number} */
  preferredChildWedgeItem: {
    $meta: function () {
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
    value: 1
  },

  /** @type {number} */
  minimumEdgeLengthItem: {
    $meta: function () {
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
    value: 5
  },

  /** @type {number} */
  maximumDeviationAngleItem: {
    $meta: function () {
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
    value: 1
  },

  /** @type {number} */
  compactnessFactorItem: {
    $meta: function () {
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
    value: 0.1
  },

  /** @type {number} */
  minimumTreeNodeDistanceItem: {
    $meta: function () {
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
    value: 0
  },

  /** @type {boolean} */
  allowOverlapsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Allow Overlaps',
          '#/api/BalloonLayout#BalloonLayout-property-allowOverlaps'
        ),
        OptionGroupAttribute('TreeGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  placeChildrenOnCommonRadiusItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Place Children on Common Radius',
          '#/api/CircularLayout#CircularLayout-property-placeChildrenOnCommonRadius'
        ),
        OptionGroupAttribute('TreeGroup', 70),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableTreeGroupItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.layoutStyleItem === CircularLayoutStyle.SINGLE_CYCLE
    }
  },

  /** @type {CircularLayoutStarSubstructureStyle} */
  starSubstructureItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Star',
          '#/api/CircularLayout#CircularLayout-property-starSubstructureStyle'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Ignore', CircularLayoutStarSubstructureStyle.NONE],
            ['Radial', CircularLayoutStarSubstructureStyle.RADIAL],
            ['Separated Radial', CircularLayoutStarSubstructureStyle.SEPARATED_RADIAL]
          ]
        }),
        TypeAttribute(CircularLayoutStarSubstructureStyle.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  starSubstructureSizeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Star Size',
          '#/api/CircularLayout#CircularLayout-property-starSubstructureSize'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 15),
        MinMaxAttribute().init({
          min: 4,
          max: 20
        }),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 4
  },

  shouldDisableStarSubstructureSizeItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.starSubstructureItem === CircularLayoutStarSubstructureStyle.NONE
    }
  },

  /** @type {NodeLabelingPolicies} */
  nodeLabelingStyleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Node Labeling',
          '#/api/CircularLayout#CircularLayout-property-nodeLabelingPolicy'
        ),
        OptionGroupAttribute('NodePropertiesGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Ignore Labels', NodeLabelingPolicies.NONE],
            ['Consider Labels', NodeLabelingPolicies.CONSIDER_CURRENT_POSITION],
            ['Horizontal', NodeLabelingPolicies.HORIZONTAL],
            ['Ray-like at Leaves', NodeLabelingPolicies.RAYLIKE_LEAVES]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  edgeLabelingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Labeling',
          '#/api/CircularLayout#MultiStageLayout-property-labelingEnabled'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  reduceAmbiguityItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Reduce Ambiguity',
          '#/api/GenericLabeling#MISLabelingBase-property-reduceAmbiguity'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return !this.edgeLabelingItem
    }
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

  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return !this.edgeLabelingItem
    }
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

  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return !this.edgeLabelingItem
    }
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

  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return !this.edgeLabelingItem
    }
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
  shouldDisableLabelPlacementDistanceItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return (
        !this.edgeLabelingItem ||
        this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
      )
    }
  }
})
export default CircularLayoutConfig
