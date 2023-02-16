/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  ClassicTreeLayout,
  ClassicTreeLayoutEdgeRoutingStyle,
  ComponentArrangementStyles,
  EdgeBundleDescriptor,
  EdgeRouter,
  EdgeRouterScope,
  Enum,
  GenericLabeling,
  GraphComponent,
  ILayoutAlgorithm,
  LayoutData,
  LayoutOrientation,
  LeafPlacement,
  OrganicEdgeRouter,
  PortStyle,
  TreeReductionStage,
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
} from '../../resources/demo-option-editor'
import LayoutConfiguration, {
  EdgeLabeling,
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge
} from './LayoutConfiguration'
import HandleEdgesBetweenGroupsStage from './HandleEdgesBetweenGroupsStage'

/**
 * Configuration options for the layout algorithm of the same name.
 */
const ClassicTreeLayoutConfig = (Class as any)('ClassicTreeLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('ClassicTreeLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    //@ts-ignore
    LayoutConfiguration.call(this)

    const layout = new ClassicTreeLayout()

    this.routingStyleForNonTreeEdgesItem = RoutingStyle.ORTHOGONAL
    this.edgeBundlingStrengthItem = 0.95
    this.actOnSelectionOnlyItem = false

    this.classicLayoutOrientationItem = LayoutOrientation.TOP_TO_BOTTOM

    this.minimumNodeDistanceItem = layout.minimumNodeDistance | 0
    this.minimumLayerDistanceItem = layout.minimumLayerDistance | 0
    this.portStyleItem = PortStyle.NODE_CENTER

    this.considerNodeLabelsItem = false

    this.orthogonalEdgeRoutingItem = false

    this.verticalAlignmentItem = 0.5
    this.leafPlacementPolicyItem = LeafPlacement.SIBLINGS_ON_SAME_LAYER
    this.enforceGlobalLayeringItem = false

    this.busAlignmentItem = 0.5

    this.edgeLabelingItem = EdgeLabeling.NONE
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10
    this.title = 'Classic Tree Layout'
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph.mapperRegistry} if necessary.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const layout = this.configureClassicLayout()

    layout.parallelEdgeRouterEnabled = false
    layout.componentLayout.style = ComponentArrangementStyles.MULTI_ROWS
    layout.subgraphLayoutEnabled = this.actOnSelectionOnlyItem

    layout.prependStage(this.createTreeReductionStage())

    const placeLabels =
      this.edgeLabelingItem === EdgeLabeling.INTEGRATED ||
      this.edgeLabelingItem === EdgeLabeling.GENERIC

    // required to prevent WrongGraphStructure exception which may be thrown by TreeLayout if there are edges
    // between group nodes
    layout.prependStage(new HandleEdgesBetweenGroupsStage(placeLabels))

    layout.considerNodeLabels = this.considerNodeLabelsItem

    if (this.edgeLabelingItem === EdgeLabeling.GENERIC) {
      layout.integratedEdgeLabeling = false

      const labeling = new GenericLabeling()
      labeling.placeEdgeLabels = true
      labeling.placeNodeLabels = false
      labeling.reduceAmbiguity = this.reduceAmbiguityItem
      layout.labelingEnabled = true
      layout.labeling = labeling
    } else if (this.edgeLabelingItem === EdgeLabeling.INTEGRATED) {
      layout.integratedEdgeLabeling = true
    }

    return layout
  },

  /**
   * Configures the tree reduction stage that will handle edges that do not belong to the tree.
   */
  createTreeReductionStage: function (): TreeReductionStage {
    // configures tree reduction stage and non-tree edge routing
    const reductionStage = new TreeReductionStage()
    if (this.edgeLabelingItem === EdgeLabeling.INTEGRATED) {
      reductionStage.nonTreeEdgeLabelingAlgorithm = new GenericLabeling()
    }
    reductionStage.multiParentAllowed =
      !this.enforceGlobalLayeringItem &&
      this.leafPlacementPolicyItem !== LeafPlacement.ALL_LEAVES_ON_SAME_LAYER

    if (this.routingStyleForNonTreeEdgesItem === RoutingStyle.ORGANIC) {
      reductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()
      reductionStage.nonTreeEdgeSelectionKey = OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
    } else if (this.routingStyleForNonTreeEdgesItem === RoutingStyle.ORTHOGONAL) {
      const edgeRouter = new EdgeRouter()
      edgeRouter.rerouting = true
      edgeRouter.scope = EdgeRouterScope.ROUTE_AFFECTED_EDGES
      reductionStage.nonTreeEdgeRouter = edgeRouter
      reductionStage.nonTreeEdgeSelectionKey = edgeRouter.affectedEdgesDpKey
    } else if (this.routingStyleForNonTreeEdgesItem === RoutingStyle.STRAIGHTLINE) {
      reductionStage.nonTreeEdgeRouter = reductionStage.createStraightLineRouter()
    } else if (this.routingStyleForNonTreeEdgesItem === RoutingStyle.BUNDLED) {
      const ebc = reductionStage.edgeBundling
      ebc.bundlingStrength = this.edgeBundlingStrengthItem
      ebc.defaultBundleDescriptor = new EdgeBundleDescriptor({ bundled: true })
    }
    return reductionStage
  },

  /**
   * Configures the default classic tree layout algorithm.
   */
  configureClassicLayout: function (): ClassicTreeLayout {
    const layout = new ClassicTreeLayout()

    layout.minimumNodeDistance = this.minimumNodeDistanceItem
    layout.minimumLayerDistance = this.minimumLayerDistanceItem

    layout.layoutOrientation = this.classicLayoutOrientationItem

    if (this.orthogonalEdgeRoutingItem) {
      layout.edgeRoutingStyle = ClassicTreeLayoutEdgeRoutingStyle.ORTHOGONAL
    } else {
      layout.edgeRoutingStyle = ClassicTreeLayoutEdgeRoutingStyle.PLAIN
    }

    layout.leafPlacement = this.leafPlacementPolicyItem
    layout.enforceGlobalLayering = this.enforceGlobalLayeringItem
    layout.portStyle = this.portStyleItem

    layout.verticalAlignment = this.verticalAlignmentItem
    layout.busAlignment = this.busAlignmentItem

    return layout
  },

  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: ILayoutAlgorithm
  ): LayoutData {
    return this.createLabelingLayoutData(
      graphComponent.graph,
      this.labelPlacementAlongEdgeItem,
      this.labelPlacementSideOfEdgeItem,
      this.labelPlacementOrientationItem,
      this.labelPlacementDistanceItem
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
  EdgesGroup: {
    $meta: function () {
      return [
        LabelAttribute('Edges'),
        OptionGroupAttribute('RootGroup', 20),
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
        OptionGroupAttribute('RootGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  NonTreeEdgesGroup: {
    $meta: function () {
      return [
        LabelAttribute('Non-Tree Edges'),
        OptionGroupAttribute('EdgesGroup', 40),
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

  /**
   * Gets the description text.
   * The description text.
   * @type {string}
   */
  descriptionText: {
    $meta: function () {
      return [
        OptionGroupAttribute('DescriptionGroup', 10),
        ComponentAttribute(Components.HTML_BLOCK),
        TypeAttribute(YString.$class)
      ]
    },
    get: function (): string {
      return (
        '<p>This layout is designed to arrange directed and undirected trees that have a unique root node. All children are placed below their parent in relation to the main layout direction. The edges of the graph are routed as straight-line segments or in an orthogonal bus-like fashion.</p>' +
        '<p>Tree layout algorithms are commonly used for visualizing relational data and for producing diagrams of high quality that are able to reveal possible hierarchic properties of the graph. More precisely, they find applications in dataflow analysis, software engineering, bioinformatics and business administration.</p>'
      )
    }
  },

  /** @type {LayoutOrientation} */
  classicLayoutOrientationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Orientation',
          '#/api/OrientationLayout#OrientationLayout-property-orientation'
        ),
        OptionGroupAttribute('GeneralGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Top to Bottom', LayoutOrientation.TOP_TO_BOTTOM],
            ['Left to Right', LayoutOrientation.LEFT_TO_RIGHT],
            ['Bottom to Top', LayoutOrientation.BOTTOM_TO_TOP],
            ['Right to Left', LayoutOrientation.RIGHT_TO_LEFT]
          ]
        }),
        TypeAttribute(LayoutOrientation.$class)
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
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-minimumNodeDistance'
        ),
        MinMaxAttribute().init({
          min: 1,
          max: 100
        }),
        OptionGroupAttribute('GeneralGroup', 20),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 1
  },

  /** @type {number} */
  minimumLayerDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Layer Distance',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-minimumLayerDistance'
        ),
        MinMaxAttribute().init({
          min: 10,
          max: 300
        }),
        OptionGroupAttribute('GeneralGroup', 30),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 10
  },

  /** @type {boolean} */
  actOnSelectionOnlyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Act on Selection Only',
          '#/api/TreeLayout#MultiStageLayout-property-subgraphLayoutEnabled'
        ),
        OptionGroupAttribute('GeneralGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  considerNodeLabelsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Consider Node Labels',
          '#/api/TreeLayout#TreeLayout-property-considerNodeLabels'
        ),
        OptionGroupAttribute('NodePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {LeafPlacement} */
  leafPlacementPolicyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Leaf Placement',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-leafPlacement'
        ),
        OptionGroupAttribute('GeneralGroup', 40),
        EnumValuesAttribute().init({
          values: [
            ['Siblings in same Layer', LeafPlacement.SIBLINGS_ON_SAME_LAYER],
            ['All Leaves in same Layer', LeafPlacement.ALL_LEAVES_ON_SAME_LAYER],
            ['Leaves stacked', LeafPlacement.LEAVES_STACKED],
            ['Leaves stacked left', LeafPlacement.LEAVES_STACKED_LEFT],
            ['Leaves stacked right', LeafPlacement.LEAVES_STACKED_RIGHT],
            ['Leaves stacked left and right', LeafPlacement.LEAVES_STACKED_LEFT_AND_RIGHT]
          ]
        }),
        TypeAttribute(LeafPlacement.$class)
      ]
    },
    value: null
  },

  /** @type {RoutingStyle} */
  routingStyleForNonTreeEdgesItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Routing Style for Non-Tree Edges',
          '#/api/TreeReductionStage#TreeReductionStage-property-nonTreeEdgeRouter'
        ),
        OptionGroupAttribute('NonTreeEdgesGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Orthogonal', RoutingStyle.ORTHOGONAL],
            ['Organic', RoutingStyle.ORGANIC],
            ['Straight-Line', RoutingStyle.STRAIGHTLINE],
            ['Bundled', RoutingStyle.BUNDLED]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  edgeBundlingStrengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Bundling Strength',
          '#/api/EdgeBundling#EdgeBundling-property-bundlingStrength'
        ),
        OptionGroupAttribute('NonTreeEdgesGroup', 20),
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
      return this.routingStyleForNonTreeEdgesItem !== RoutingStyle.BUNDLED
    }
  },

  /** @type {PortStyle} */
  portStyleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Port Style',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-portStyle'
        ),
        OptionGroupAttribute('EdgesGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Node Centered', PortStyle.NODE_CENTER],
            ['Border Centered', PortStyle.BORDER_CENTER],
            ['Border Distributed', PortStyle.BORDER_DISTRIBUTED]
          ]
        }),
        TypeAttribute(PortStyle.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  enforceGlobalLayeringItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Global Layering',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-enforceGlobalLayering'
        ),
        OptionGroupAttribute('GeneralGroup', 35),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  orthogonalEdgeRoutingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Orthogonal Edge Routing',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-edgeRoutingStyle'
        ),
        OptionGroupAttribute('EdgesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  busAlignmentItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Bus Alignment',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-busAlignment'
        ),
        OptionGroupAttribute('EdgesGroup', 30),
        MinMaxAttribute().init({
          min: 0.0,
          max: 1.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableBusAlignmentItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return (
        this.orthogonalEdgeRoutingItem === false ||
        (this.enforceGlobalLayeringItem === false &&
          this.leafPlacementPolicyItem !== LeafPlacement.ALL_LEAVES_ON_SAME_LAYER)
      )
    }
  },

  /** @type {number} */
  verticalAlignmentItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Vertical Child Alignment',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-verticalAlignment'
        ),
        OptionGroupAttribute('GeneralGroup', 50),
        MinMaxAttribute().init({
          min: 0.0,
          max: 1.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableVerticalAlignmentItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return !this.enforceGlobalLayeringItem
    }
  },

  /**
   * @type {EdgeLabeling}
   */
  $edgeLabelingItem: null,

  /** @type {EdgeLabeling} */
  edgeLabelingItem: <any>{
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Labeling',
          '#/api/TreeLayout#MultiStageLayout-property-labelingEnabled'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['None', EdgeLabeling.NONE],
            ['Integrated', EdgeLabeling.INTEGRATED],
            ['Generic', EdgeLabeling.GENERIC]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    get: function (): EdgeLabeling {
      return this.$edgeLabelingItem
    },
    set: function (value: EdgeLabeling) {
      this.$edgeLabelingItem = value
      if (value === EdgeLabeling.INTEGRATED) {
        this.labelPlacementOrientationItem = LabelPlacementOrientation.PARALLEL
        this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.AT_TARGET
        this.labelPlacementDistanceItem = 0
      }
    }
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
      return this.edgeLabelingItem !== EdgeLabeling.GENERIC
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
      return this.edgeLabelingItem === EdgeLabeling.NONE
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
      return this.edgeLabelingItem === EdgeLabeling.NONE
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
      return this.edgeLabelingItem === EdgeLabeling.NONE
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
        this.edgeLabelingItem === EdgeLabeling.NONE ||
        this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
      )
    }
  }
})
export default ClassicTreeLayoutConfig

enum RoutingStyle {
  ORTHOGONAL,
  ORGANIC,
  STRAIGHTLINE,
  BUNDLED
}
