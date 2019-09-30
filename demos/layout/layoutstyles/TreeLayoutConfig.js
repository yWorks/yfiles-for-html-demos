/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
import {
  AspectRatioNodePlacer,
  BusNodePlacer,
  ChildPlacement,
  Class,
  ClassicTreeLayout,
  ClassicTreeLayoutEdgeRoutingStyle,
  CompactNodePlacer,
  ComponentArrangementStyles,
  DefaultNodePlacer,
  DefaultTreeLayoutPortAssignment,
  DendrogramNodePlacer,
  DoubleLineNodePlacer,
  EdgeBundleDescriptor,
  EdgeRouter,
  EdgeRouterScope,
  EnumDefinition,
  GenericLabeling,
  GraphComponent,
  GridNodePlacer,
  ITreeLayoutNodePlacer,
  LayeredNodePlacer,
  LayoutOrientation,
  LeafPlacement,
  LeftRightNodePlacer,
  Mapper,
  OrganicEdgeRouter,
  PortStyle,
  RootAlignment,
  RootNodeAlignment,
  SimpleNodePlacer,
  TreeLayout,
  TreeLayoutData,
  TreeLayoutPortAssignmentMode,
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
} from '../../resources/demo-option-editor.js'
import LayoutConfiguration from './LayoutConfiguration.js'
import HandleEdgesBetweenGroupsStage from './HandleEdgesBetweenGroupsStage.js'

/**
 * Configuration options for the layout algorithm of the same name.
 */
const TreeLayoutConfig = Class('TreeLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('TreeLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function() {
    LayoutConfiguration.call(this)

    const layout = new ClassicTreeLayout()
    const aspectRatioNodePlacer = new AspectRatioNodePlacer()
    const defaultNodePlacer = new DefaultNodePlacer()

    this.layoutStyleItem = TreeLayoutConfig.EnumStyle.DEFAULT
    this.routingStyleForNonTreeEdgesItem = TreeLayoutConfig.EnumRoute.ORTHOGONAL
    this.edgeBundlingStrengthItem = 0.95
    this.actOnSelectionOnlyItem = false

    this.defaultLayoutOrientationItem = LayoutOrientation.TOP_TO_BOTTOM
    this.classicLayoutOrientationItem = LayoutOrientation.TOP_TO_BOTTOM

    this.minimumNodeDistanceItem = layout.minimumNodeDistance | 0
    this.minimumLayerDistanceItem = layout.minimumLayerDistance | 0
    this.portStyleItem = PortStyle.NODE_CENTER

    this.considerNodeLabelsItem = false

    this.orthogonalEdgeRoutingItem = false

    this.verticalAlignmentItem = 0.5
    this.childPlacementPolicyItem = LeafPlacement.SIBLINGS_ON_SAME_LAYER
    this.enforceGlobalLayeringItem = false

    this.nodePlacerItem = TreeLayoutConfig.EnumNodePlacer.DEFAULT

    this.spacingItem = 20
    this.rootAlignmentItem = TreeLayoutConfig.EnumRootAlignment.CENTER
    this.allowMultiParentsItem = false
    this.portAssignmentItem = TreeLayoutPortAssignmentMode.NONE

    this.hvHorizontalSpaceItem = defaultNodePlacer.horizontalDistance | 0
    this.hvVerticalSpaceItem = defaultNodePlacer.verticalDistance | 0

    this.busAlignmentItem = 0.5

    this.arHorizontalSpaceItem = aspectRatioNodePlacer.horizontalDistance | 0
    this.arVerticalSpaceItem = aspectRatioNodePlacer.verticalDistance | 0
    this.nodePlacerAspectRatioItem = aspectRatioNodePlacer.aspectRatio

    this.arUseViewAspectRatioItem = true
    this.compactPreferredAspectRatioItem = 1

    this.edgeLabelingItem = TreeLayoutConfig.EnumEdgeLabeling.NONE
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
    let /** MultiStageLayout */ layout

    switch (this.layoutStyleItem) {
      default:
      case TreeLayoutConfig.EnumStyle.DEFAULT:
        layout = this.$configureDefaultLayout()
        break
      case TreeLayoutConfig.EnumStyle.CLASSIC:
        layout = this.$configureClassicLayout()
        break
      case TreeLayoutConfig.EnumStyle.HORIZONTAL_VERTICAL:
        layout = new TreeLayout()
        break
      case TreeLayoutConfig.EnumStyle.COMPACT:
        layout = this.$configureCompactLayout(graphComponent)
        break
    }

    layout.parallelEdgeRouterEnabled = false
    layout.componentLayout.style = ComponentArrangementStyles.MULTI_ROWS
    layout.subgraphLayoutEnabled = this.actOnSelectionOnlyItem

    layout.prependStage(this.$createTreeReductionStage())

    const placeLabels =
      this.edgeLabelingItem === TreeLayoutConfig.EnumEdgeLabeling.INTEGRATED ||
      this.edgeLabelingItem === TreeLayoutConfig.EnumEdgeLabeling.GENERIC

    // required to prevent WrongGraphStructure exception which may be thrown by TreeLayout if there are edges
    // between group nodes
    layout.prependStage(new HandleEdgesBetweenGroupsStage(placeLabels))

    layout.considerNodeLabels = this.considerNodeLabelsItem

    if (this.edgeLabelingItem === TreeLayoutConfig.EnumEdgeLabeling.GENERIC) {
      layout.integratedEdgeLabeling = false

      const labeling = new GenericLabeling()
      labeling.placeEdgeLabels = true
      labeling.placeNodeLabels = false
      labeling.reduceAmbiguity = this.reduceAmbiguityItem
      layout.labelingEnabled = true
      layout.labeling = labeling
    } else if (this.edgeLabelingItem === TreeLayoutConfig.EnumEdgeLabeling.INTEGRATED) {
      layout.integratedEdgeLabeling = true
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

  createConfiguredLayoutData: function(graphComponent, layout) {
    if (this.layoutStyleItem === TreeLayoutConfig.EnumStyle.DEFAULT) {
      const graph = graphComponent.graph
      return new TreeLayoutData({
        gridNodePlacerRowIndices: node => {
          const predecessors = graph.predecessors(node)
          const parent = predecessors.firstOrDefault()
          if (parent) {
            const siblings = graph.successors(parent).toArray()
            return siblings.indexOf(node) % Math.round(Math.sqrt(siblings.length))
          }
          return 0
        },
        leftRightNodePlacerLeftNodes: node => {
          const predecessors = graph.predecessors(node)
          const parent = predecessors.firstOrDefault()
          if (parent) {
            const siblings = graph.successors(parent).toArray()
            return siblings.indexOf(node) % 2 !== 0
          }
          return false
        },
        compactNodePlacerStrategyMementos: new Mapper()
      })
    } else if (this.layoutStyleItem === TreeLayoutConfig.EnumStyle.HORIZONTAL_VERTICAL) {
      return new TreeLayoutData({
        nodePlacers: node => {
          // children of selected nodes should be placed vertical and to the right of their child nodes, while
          // the children of non-selected horizontal downwards
          const childPlacement = graphComponent.selection.isSelected(node)
            ? ChildPlacement.VERTICAL_TO_RIGHT
            : ChildPlacement.HORIZONTAL_DOWNWARD

          return new DefaultNodePlacer(
            childPlacement,
            RootAlignment.LEADING_ON_BUS,
            this.hvVerticalSpaceItem,
            this.hvHorizontalSpaceItem
          )
        }
      })
    }
    return null
  },

  /**
   * Configures the tree reduction stage that will handle edges that do not belong to the tree.
   * @return {TreeReductionStage}
   */
  $createTreeReductionStage: function() {
    // configures tree reduction stage and non-tree edge routing
    const reductionStage = new TreeReductionStage()
    if (this.edgeLabelingItem === TreeLayoutConfig.EnumEdgeLabeling.INTEGRATED) {
      reductionStage.nonTreeEdgeLabelingAlgorithm = new GenericLabeling()
    }
    reductionStage.multiParentAllowed =
      (this.layoutStyleItem === TreeLayoutConfig.EnumStyle.CLASSIC &&
        !this.enforceGlobalLayeringItem &&
        this.childPlacementPolicyItem !== LeafPlacement.ALL_LEAVES_ON_SAME_LAYER) ||
      (this.layoutStyleItem === TreeLayoutConfig.EnumStyle.DEFAULT &&
        (this.nodePlacerItem === TreeLayoutConfig.EnumNodePlacer.DEFAULT ||
          this.nodePlacerItem === TreeLayoutConfig.EnumNodePlacer.BUS ||
          this.nodePlacerItem === TreeLayoutConfig.EnumNodePlacer.LEFT_RIGHT ||
          this.nodePlacerItem === TreeLayoutConfig.EnumNodePlacer.DENDROGRAM) &&
        this.allowMultiParentsItem)

    if (this.routingStyleForNonTreeEdgesItem === TreeLayoutConfig.EnumRoute.ORGANIC) {
      reductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()
      reductionStage.nonTreeEdgeSelectionKey = OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
    } else if (this.routingStyleForNonTreeEdgesItem === TreeLayoutConfig.EnumRoute.ORTHOGONAL) {
      const edgeRouter = new EdgeRouter()
      edgeRouter.rerouting = true
      edgeRouter.scope = EdgeRouterScope.ROUTE_AFFECTED_EDGES
      reductionStage.nonTreeEdgeRouter = edgeRouter
      reductionStage.nonTreeEdgeSelectionKey = edgeRouter.affectedEdgesDpKey
    } else if (this.routingStyleForNonTreeEdgesItem === TreeLayoutConfig.EnumRoute.STRAIGHTLINE) {
      reductionStage.nonTreeEdgeRouter = reductionStage.createStraightLineRouter()
    } else if (this.routingStyleForNonTreeEdgesItem === TreeLayoutConfig.EnumRoute.BUNDLED) {
      const ebc = reductionStage.edgeBundling
      ebc.bundlingStrength = this.edgeBundlingStrengthItem
      ebc.defaultBundleDescriptor = new EdgeBundleDescriptor({ bundled: true })
    }
    return reductionStage
  },

  /**
   * Configures the default tree layout algorithm.
   * @return {MultiStageLayout}
   */
  $configureDefaultLayout: function() {
    const isDefaultNodePlacer = this.nodePlacerItem === TreeLayoutConfig.EnumNodePlacer.DEFAULT
    const isAspectRatioNodePlacer =
      this.nodePlacerItem === TreeLayoutConfig.EnumNodePlacer.ASPECT_RATIO

    const layout = new TreeLayout()
    layout.layoutOrientation = isAspectRatioNodePlacer
      ? LayoutOrientation.TOP_TO_BOTTOM
      : this.defaultLayoutOrientationItem

    const spacing = this.spacingItem

    let rootAlignment
    switch (this.rootAlignmentItem) {
      default:
      case TreeLayoutConfig.EnumRootAlignment.CENTER:
        rootAlignment = isDefaultNodePlacer ? RootAlignment.CENTER : RootNodeAlignment.CENTER
        break
      case TreeLayoutConfig.EnumRootAlignment.MEDIAN:
        rootAlignment = isDefaultNodePlacer ? RootAlignment.MEDIAN : RootNodeAlignment.MEDIAN
        break
      case TreeLayoutConfig.EnumRootAlignment.LEFT:
        rootAlignment = isDefaultNodePlacer ? RootAlignment.LEADING : RootNodeAlignment.LEFT
        break
      case TreeLayoutConfig.EnumRootAlignment.LEADING:
        rootAlignment = isDefaultNodePlacer
          ? RootAlignment.LEADING_OFFSET
          : RootNodeAlignment.LEADING
        break
      case TreeLayoutConfig.EnumRootAlignment.RIGHT:
        rootAlignment = isDefaultNodePlacer ? RootAlignment.TRAILING : RootNodeAlignment.RIGHT
        break
      case TreeLayoutConfig.EnumRootAlignment.TRAILING:
        rootAlignment = isDefaultNodePlacer
          ? RootAlignment.TRAILING_OFFSET
          : RootNodeAlignment.TRAILING
        break
    }

    const aspectRatio = this.nodePlacerAspectRatioItem
    const allowMultiParents = this.allowMultiParentsItem

    switch (this.nodePlacerItem) {
      default:
      case TreeLayoutConfig.EnumNodePlacer.DEFAULT:
        const defaultNodePlacer = new DefaultNodePlacer()
        defaultNodePlacer.horizontalDistance = spacing
        defaultNodePlacer.verticalDistance = spacing
        defaultNodePlacer.rootAlignment = rootAlignment
        layout.defaultNodePlacer = defaultNodePlacer
        layout.multiParentAllowed = allowMultiParents
        break
      case TreeLayoutConfig.EnumNodePlacer.SIMPLE:
        const simpleNodePlacer = new SimpleNodePlacer()
        simpleNodePlacer.spacing = spacing
        simpleNodePlacer.rootAlignment = rootAlignment
        layout.defaultNodePlacer = simpleNodePlacer
        break
      case TreeLayoutConfig.EnumNodePlacer.BUS:
        const busNodePlacer = new BusNodePlacer()
        busNodePlacer.spacing = spacing
        layout.defaultNodePlacer = busNodePlacer
        layout.multiParentAllowed = allowMultiParents
        break
      case TreeLayoutConfig.EnumNodePlacer.DOUBLE_LINE:
        const doubleLineNodePlacer = new DoubleLineNodePlacer()
        doubleLineNodePlacer.spacing = spacing
        doubleLineNodePlacer.rootAlignment = rootAlignment
        layout.defaultNodePlacer = doubleLineNodePlacer
        break
      case TreeLayoutConfig.EnumNodePlacer.LEFT_RIGHT:
        const leftRightNodePlacer = new LeftRightNodePlacer()
        leftRightNodePlacer.spacing = spacing
        layout.defaultNodePlacer = leftRightNodePlacer
        layout.multiParentAllowed = allowMultiParents
        break
      case TreeLayoutConfig.EnumNodePlacer.LAYERED:
        const layeredNodePlacer = new LayeredNodePlacer()
        layeredNodePlacer.spacing = spacing
        layeredNodePlacer.layerSpacing = spacing
        layeredNodePlacer.rootAlignment = rootAlignment
        layout.defaultNodePlacer = layeredNodePlacer
        break
      case TreeLayoutConfig.EnumNodePlacer.ASPECT_RATIO:
        const aspectRatioNodePlacer = new AspectRatioNodePlacer()
        aspectRatioNodePlacer.horizontalDistance = spacing
        aspectRatioNodePlacer.verticalDistance = spacing
        aspectRatioNodePlacer.aspectRatio = aspectRatio
        layout.defaultNodePlacer = aspectRatioNodePlacer
        break
      case TreeLayoutConfig.EnumNodePlacer.DENDROGRAM:
        const dendrogramNodePlacer = new DendrogramNodePlacer()
        dendrogramNodePlacer.minimumRootDistance = spacing
        dendrogramNodePlacer.minimumSubtreeDistance = spacing
        layout.defaultNodePlacer = dendrogramNodePlacer
        layout.multiParentAllowed = allowMultiParents
        break
      case TreeLayoutConfig.EnumNodePlacer.GRID:
        const gridNodePlacer = new GridNodePlacer()
        gridNodePlacer.spacing = spacing
        gridNodePlacer.rootAlignment = rootAlignment
        layout.defaultNodePlacer = gridNodePlacer
        break
      case TreeLayoutConfig.EnumNodePlacer.COMPACT:
        const compactNodePlacer = new CompactNodePlacer()
        compactNodePlacer.horizontalDistance = spacing
        compactNodePlacer.verticalDistance = spacing
        compactNodePlacer.preferredAspectRatio = aspectRatio
        layout.defaultNodePlacer = compactNodePlacer
        break
    }

    layout.defaultPortAssignment = new DefaultTreeLayoutPortAssignment(this.portAssignmentItem)
    layout.groupingSupported = true

    return layout
  },

  /**
   * Configures the default classic tree layout algorithm.
   * @return {MultiStageLayout}
   */
  $configureClassicLayout: function() {
    const layout = new ClassicTreeLayout()

    layout.minimumNodeDistance = this.minimumNodeDistanceItem
    layout.minimumLayerDistance = this.minimumLayerDistanceItem

    const ol = layout.orientationLayout
    ol.orientation = this.classicLayoutOrientationItem

    if (this.orthogonalEdgeRoutingItem) {
      layout.edgeRoutingStyle = ClassicTreeLayoutEdgeRoutingStyle.ORTHOGONAL
    } else {
      layout.edgeRoutingStyle = ClassicTreeLayoutEdgeRoutingStyle.PLAIN
    }

    layout.leafPlacement = this.childPlacementPolicyItem
    layout.enforceGlobalLayering = this.enforceGlobalLayeringItem
    layout.portStyle = this.portStyleItem

    layout.verticalAlignment = this.verticalAlignmentItem
    layout.busAlignment = this.busAlignmentItem

    return layout
  },

  /**
   * Configures the tree layout algorithm with the appropriate node placer to obtain a compact tree layout.
   * @return {MultiStageLayout}
   */
  $configureCompactLayout: function(graphComponent) {
    const layout = new TreeLayout()
    const aspectRatioNodePlacer = new AspectRatioNodePlacer()

    if (graphComponent && this.arUseViewAspectRatioItem) {
      const size = graphComponent.innerSize
      aspectRatioNodePlacer.aspectRatio = size.width / size.height
    } else {
      aspectRatioNodePlacer.aspectRatio = this.compactPreferredAspectRatioItem
    }

    aspectRatioNodePlacer.horizontalDistance = this.arHorizontalSpaceItem
    aspectRatioNodePlacer.verticalDistance = this.arVerticalSpaceItem

    layout.defaultNodePlacer = aspectRatioNodePlacer
    return layout
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
  DefaultGroup: {
    $meta: function() {
      return [
        LabelAttribute('Default'),
        OptionGroupAttribute('RootGroup', 15),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  HVGroup: {
    $meta: function() {
      return [
        LabelAttribute('Horizontal-Vertical'),
        OptionGroupAttribute('RootGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  CompactGroup: {
    $meta: function() {
      return [
        LabelAttribute('Compact'),
        OptionGroupAttribute('RootGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  ClassicGroup: {
    $meta: function() {
      return [
        LabelAttribute('Classic'),
        OptionGroupAttribute('RootGroup', 40),
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

  /**
   * Gets the description text.
   * The description text.
   * @type {string}
   */
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
        '<p>The various flavors of the tree layout styles are great for highlighting child-parent relationships in graphs that form one or more trees, ' +
        'or trees with only few additional edges.</p>' +
        '<p>The need to visualize directed or undirected trees arises in many application areas, for example</p>' +
        '<ul>' +
        '<li>Dataflow analysis</li>' +
        '<li>Software engineering</li>' +
        '<li>Network management</li>' +
        '<li>Bioinformatics</li>' +
        '</ul>'
      )
    }
  },

  /**
   * Backing field for below property
   * @type {TreeLayoutConfig.EnumStyle}
   */
  $layoutStyleItem: null,

  /** @type {TreeLayoutConfig.EnumStyle} */
  layoutStyleItem: {
    $meta: function() {
      return [
        LabelAttribute('Layout Style', '#/api/TreeLayout#TreeLayout-property-defaultNodePlacer'),
        OptionGroupAttribute('GeneralGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Default', TreeLayoutConfig.EnumStyle.DEFAULT],
            ['Horizontal-Vertical', TreeLayoutConfig.EnumStyle.HORIZONTAL_VERTICAL],
            ['Compact', TreeLayoutConfig.EnumStyle.COMPACT],
            ['Classic', TreeLayoutConfig.EnumStyle.CLASSIC]
          ]
        }),
        TypeAttribute(TreeLayoutConfig.EnumStyle.$class)
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
   * @type {TreeLayoutConfig.EnumRoute}
   */
  $routingStyleForNonTreeEdgesItem: null,

  /** @type {TreeLayoutConfig.EnumRoute} */
  routingStyleForNonTreeEdgesItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Routing Style for Non-Tree Edges',
          '#/api/TreeReductionStage#TreeReductionStage-property-nonTreeEdgeRouter'
        ),
        OptionGroupAttribute('GeneralGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Orthogonal', TreeLayoutConfig.EnumRoute.ORTHOGONAL],
            ['Organic', TreeLayoutConfig.EnumRoute.ORGANIC],
            ['Straight-Line', TreeLayoutConfig.EnumRoute.STRAIGHTLINE],
            ['Bundled', TreeLayoutConfig.EnumRoute.BUNDLED]
          ]
        }),
        TypeAttribute(TreeLayoutConfig.EnumRoute.$class)
      ]
    },
    get: function() {
      return this.$routingStyleForNonTreeEdgesItem
    },
    set: function(value) {
      this.$routingStyleForNonTreeEdgesItem = value
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
        OptionGroupAttribute('GeneralGroup', 30),
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
      return this.routingStyleForNonTreeEdgesItem !== TreeLayoutConfig.EnumRoute.BUNDLED
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
          '#/api/TreeLayout#MultiStageLayout-property-subgraphLayoutEnabled'
        ),
        OptionGroupAttribute('GeneralGroup', 40),
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
  $considerNodeLabelsItem: false,

  /** @type {boolean} */
  considerNodeLabelsItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Consider Node Labels',
          '#/api/TreeLayout#TreeLayout-property-considerNodeLabels'
        ),
        OptionGroupAttribute('GeneralGroup', 50),
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
   * @type {ITreeLayoutNodePlacer}
   */
  $nodePlacerItem: null,

  /** @type {TreeLayoutConfig.EnumNodePlacer} */
  nodePlacerItem: {
    $meta: function() {
      return [
        LabelAttribute('Node Placer', '#/api/TreeLayout#TreeLayout-property-defaultNodePlacer'),
        OptionGroupAttribute('DefaultGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Default', TreeLayoutConfig.EnumNodePlacer.DEFAULT],
            ['Simple', TreeLayoutConfig.EnumNodePlacer.SIMPLE],
            ['Bus', TreeLayoutConfig.EnumNodePlacer.BUS],
            ['Double-Line', TreeLayoutConfig.EnumNodePlacer.DOUBLE_LINE],
            ['Left-Right', TreeLayoutConfig.EnumNodePlacer.LEFT_RIGHT],
            ['Layered', TreeLayoutConfig.EnumNodePlacer.LAYERED],
            ['Aspect Ratio', TreeLayoutConfig.EnumNodePlacer.ASPECT_RATIO],
            ['Dendrogram', TreeLayoutConfig.EnumNodePlacer.DENDROGRAM],
            ['Grid', TreeLayoutConfig.EnumNodePlacer.GRID],
            ['Compact', TreeLayoutConfig.EnumNodePlacer.COMPACT]
          ]
        }),
        TypeAttribute(TreeLayoutConfig.EnumNodePlacer.$class)
      ]
    },
    get: function() {
      return this.$nodePlacerItem
    },
    set: function(value) {
      this.$nodePlacerItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $spacingItem: 0,

  /** @type {number} */
  spacingItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Spacing',
          '#/api/DefaultNodePlacer#DefaultNodePlacer-property-horizontalDistance'
        ),
        OptionGroupAttribute('DefaultGroup', 20),
        MinMaxAttribute().init({
          min: 0,
          max: 500
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$spacingItem
    },
    set: function(value) {
      this.$spacingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {TreeLayoutConfig.EnumRootAlignment}
   */
  $rootAlignmentItem: null,

  /** @type {TreeLayoutConfig.EnumRootAlignment} */
  rootAlignmentItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Root Alignment',
          '#/api/DefaultNodePlacer#DefaultNodePlacer-property-rootAlignment'
        ),
        OptionGroupAttribute('DefaultGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Center', TreeLayoutConfig.EnumRootAlignment.CENTER],
            ['Median', TreeLayoutConfig.EnumRootAlignment.MEDIAN],
            ['Left', TreeLayoutConfig.EnumRootAlignment.LEFT],
            ['Leading', TreeLayoutConfig.EnumRootAlignment.LEADING],
            ['Right', TreeLayoutConfig.EnumRootAlignment.RIGHT],
            ['Trailing', TreeLayoutConfig.EnumRootAlignment.TRAILING]
          ]
        }),
        TypeAttribute(TreeLayoutConfig.EnumRootAlignment.$class)
      ]
    },
    get: function() {
      return this.$rootAlignmentItem
    },
    set: function(value) {
      this.$rootAlignmentItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableRootAlignmentItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return (
        (this.nodePlacerItem === TreeLayoutConfig.EnumNodePlacer.ASPECT_RATIO ||
        this.nodePlacerItem === TreeLayoutConfig.EnumNodePlacer.BUS ||
        this.nodePlacerItem === TreeLayoutConfig.EnumNodePlacer.DENDROGRAM ||
        this.nodePlacerItem === TreeLayoutConfig.EnumNodePlacer.COMPACT)
      )
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutOrientation}
   */
  $defaultLayoutOrientationItem: null,

  /** @type {LayoutOrientation} */
  defaultLayoutOrientationItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Orientation',
          '#/api/TreeLayout#MultiStageLayout-property-layoutOrientation'
        ),
        OptionGroupAttribute('DefaultGroup', 40),
        EnumValuesAttribute().init({
          values: [
            ['Top to Bottom', LayoutOrientation.TOP_TO_BOTTOM],
            ['Bottom to Top', LayoutOrientation.BOTTOM_TO_TOP],
            ['Left to Right', LayoutOrientation.LEFT_TO_RIGHT],
            ['Right to Left', LayoutOrientation.RIGHT_TO_LEFT]
          ]
        }),
        TypeAttribute(LayoutOrientation.$class)
      ]
    },
    get: function() {
      return this.$defaultLayoutOrientationItem
    },
    set: function(value) {
      this.$defaultLayoutOrientationItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableDefaultLayoutOrientationItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return (
        (this.nodePlacerItem === TreeLayoutConfig.EnumNodePlacer.ASPECT_RATIO ||
        this.nodePlacerItem === TreeLayoutConfig.EnumNodePlacer.COMPACT)
      )
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $nodePlacerAspectRatioItem: 0,

  /** @type {number} */
  nodePlacerAspectRatioItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Aspect Ratio',
          '#/api/AspectRatioNodePlacer#AspectRatioNodePlacer-property-aspectRatio'
        ),
        OptionGroupAttribute('DefaultGroup', 50),
        MinMaxAttribute().init({
          min: 0.1,
          max: 4,
          step: 0.1
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$nodePlacerAspectRatioItem
    },
    set: function(value) {
      this.$nodePlacerAspectRatioItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableNodePlacerAspectRatioItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return (
        (this.nodePlacerItem !== TreeLayoutConfig.EnumNodePlacer.ASPECT_RATIO &&
        this.nodePlacerItem !== TreeLayoutConfig.EnumNodePlacer.COMPACT)
      )
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $allowMultiParentsItem: false,

  /** @type {boolean} */
  allowMultiParentsItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Allow Multi-Parents',
          '#/api/TreeLayout#TreeLayout-property-multiParentAllowed'
        ),
        OptionGroupAttribute('DefaultGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$allowMultiParentsItem
    },
    set: function(value) {
      this.$allowMultiParentsItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableAllowMultiParentsItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return (
        (this.nodePlacerItem !== TreeLayoutConfig.EnumNodePlacer.DEFAULT &&
        this.nodePlacerItem !== TreeLayoutConfig.EnumNodePlacer.DENDROGRAM &&
        this.nodePlacerItem !== TreeLayoutConfig.EnumNodePlacer.BUS &&
        this.nodePlacerItem !== TreeLayoutConfig.EnumNodePlacer.LEFT_RIGHT)
      )
    }
  },

  /**
   * Backing field for below property
   * @type {TreeLayoutPortAssignmentMode}
   */
  $portAssignmentItem: null,

  /** @type {TreeLayoutPortAssignmentMode} */
  portAssignmentItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Port Assignment',
          '#/api/TreeLayout#TreeLayout-property-defaultPortAssignment'
        ),
        OptionGroupAttribute('DefaultGroup', 70),
        EnumValuesAttribute().init({
          values: [
            ['None', TreeLayoutPortAssignmentMode.NONE],
            ['Distributed North', TreeLayoutPortAssignmentMode.DISTRIBUTED_NORTH],
            ['Distributed South', TreeLayoutPortAssignmentMode.DISTRIBUTED_SOUTH],
            ['Distributed East', TreeLayoutPortAssignmentMode.DISTRIBUTED_EAST],
            ['Distributed West', TreeLayoutPortAssignmentMode.DISTRIBUTED_WEST]
          ]
        }),
        TypeAttribute(TreeLayoutPortAssignmentMode.$class)
      ]
    },
    get: function() {
      return this.$portAssignmentItem
    },
    set: function(value) {
      this.$portAssignmentItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $hvHorizontalSpaceItem: 0,

  /** @type {number} */
  hvHorizontalSpaceItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Horizontal Spacing',
          '#/api/DefaultNodePlacer#DefaultNodePlacer-property-horizontalDistance'
        ),
        OptionGroupAttribute('HVGroup', 10),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$hvHorizontalSpaceItem
    },
    set: function(value) {
      this.$hvHorizontalSpaceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $hvVerticalSpaceItem: 0,

  /** @type {number} */
  hvVerticalSpaceItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Vertical Spacing',
          '#/api/DefaultNodePlacer#DefaultNodePlacer-property-verticalDistance'
        ),
        OptionGroupAttribute('HVGroup', 20),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$hvVerticalSpaceItem
    },
    set: function(value) {
      this.$hvVerticalSpaceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $arHorizontalSpaceItem: 0,

  /** @type {number} */
  arHorizontalSpaceItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Horizontal Spacing',
          '#/api/AspectRatioNodePlacer#AspectRatioNodePlacer-property-horizontalDistance'
        ),
        OptionGroupAttribute('CompactGroup', 10),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$arHorizontalSpaceItem
    },
    set: function(value) {
      this.$arHorizontalSpaceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $arVerticalSpaceItem: 0,

  /** @type {number} */
  arVerticalSpaceItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Vertical Spacing',
          '#/api/AspectRatioNodePlacer#AspectRatioNodePlacer-property-verticalDistance'
        ),
        OptionGroupAttribute('CompactGroup', 20),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$arVerticalSpaceItem
    },
    set: function(value) {
      this.$arVerticalSpaceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $arUseViewAspectRatioItem: false,

  /** @type {boolean} */
  arUseViewAspectRatioItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Use Aspect Ratio of View',
          '#/api/AspectRatioNodePlacer#AspectRatioNodePlacer-property-aspectRatio'
        ),
        OptionGroupAttribute('CompactGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$arUseViewAspectRatioItem
    },
    set: function(value) {
      this.$arUseViewAspectRatioItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $compactPreferredAspectRatioItem: 0,

  /** @type {number} */
  compactPreferredAspectRatioItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Preferred Aspect Ratio',
          '#/api/AspectRatioNodePlacer#AspectRatioNodePlacer-property-aspectRatio'
        ),
        OptionGroupAttribute('CompactGroup', 50),
        MinMaxAttribute().init({
          min: 0.2,
          max: 5.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$compactPreferredAspectRatioItem
    },
    set: function(value) {
      this.$compactPreferredAspectRatioItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableCompactPreferredAspectRatioItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.arUseViewCompactPreferredAspectRatioItem
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutOrientation}
   */
  $classicLayoutOrientationItem: null,

  /** @type {LayoutOrientation} */
  classicLayoutOrientationItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Orientation',
          '#/api/OrientationLayout#OrientationLayout-property-orientation'
        ),
        OptionGroupAttribute('ClassicGroup', 10),
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
    get: function() {
      return this.$classicLayoutOrientationItem
    },
    set: function(value) {
      this.$classicLayoutOrientationItem = value
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
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-minimumNodeDistance'
        ),
        MinMaxAttribute().init({
          min: 1,
          max: 100
        }),
        OptionGroupAttribute('ClassicGroup', 20),
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
          'Minimum Layer Distance',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-minimumLayerDistance'
        ),
        MinMaxAttribute().init({
          min: 10,
          max: 300
        }),
        OptionGroupAttribute('ClassicGroup', 30),
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
   * @type {PortStyle}
   */
  $portStyleItem: null,

  /** @type {PortStyle} */
  portStyleItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Port Style',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-portStyle'
        ),
        OptionGroupAttribute('ClassicGroup', 40),
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
    get: function() {
      return this.$portStyleItem
    },
    set: function(value) {
      this.$portStyleItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $enforceGlobalLayeringItem: false,

  /** @type {boolean} */
  enforceGlobalLayeringItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Global Layering',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-enforceGlobalLayering'
        ),
        OptionGroupAttribute('ClassicGroup', 50),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$enforceGlobalLayeringItem
    },
    set: function(value) {
      this.$enforceGlobalLayeringItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $orthogonalEdgeRoutingItem: false,

  /** @type {boolean} */
  orthogonalEdgeRoutingItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Orthogonal Edge Routing',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-edgeRoutingStyle'
        ),
        OptionGroupAttribute('ClassicGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$orthogonalEdgeRoutingItem
    },
    set: function(value) {
      this.$orthogonalEdgeRoutingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $busAlignmentItem: 0,

  /** @type {number} */
  busAlignmentItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Edge Bus Alignment',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-busAlignment'
        ),
        OptionGroupAttribute('ClassicGroup', 70),
        MinMaxAttribute().init({
          min: 0.0,
          max: 1.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$busAlignmentItem
    },
    set: function(value) {
      this.$busAlignmentItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableBusAlignmentItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return (
        (this.orthogonalEdgeRoutingItem === false ||
        (this.enforceGlobalLayeringItem === false &&
          this.childPlacementPolicyItem !== LeafPlacement.ALL_LEAVES_ON_SAME_LAYER))
      )
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $verticalAlignmentItem: 0,

  /** @type {number} */
  verticalAlignmentItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Vertical Child Alignment',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-verticalAlignment'
        ),
        OptionGroupAttribute('ClassicGroup', 80),
        MinMaxAttribute().init({
          min: 0.0,
          max: 1.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$verticalAlignmentItem
    },
    set: function(value) {
      this.$verticalAlignmentItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableVerticalAlignmentItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return !this.enforceGlobalLayeringItem
    }
  },

  /**
   * Backing field for below property
   * @type {ChildPlacement}
   */
  $childPlacementPolicyItem: null,

  /** @type {ChildPlacement} */
  childPlacementPolicyItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Child Placement Policy',
          '#/api/ClassicTreeLayout#ClassicTreeLayout-property-leafPlacement'
        ),
        OptionGroupAttribute('ClassicGroup', 90),
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
    get: function() {
      return this.$childPlacementPolicyItem
    },
    set: function(value) {
      this.$childPlacementPolicyItem = value
    }
  },

  /**
   * @type {TreeLayoutConfig.EnumEdgeLabeling}
   */
  $edgeLabelingItem: null,

  /** @type {TreeLayoutConfig.EnumEdgeLabeling} */
  edgeLabelingItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Edge Labeling',
          '#/api/TreeLayout#MultiStageLayout-property-labelingEnabled'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['None', TreeLayoutConfig.EnumEdgeLabeling.NONE],
            ['Integrated', TreeLayoutConfig.EnumEdgeLabeling.INTEGRATED],
            ['Generic', TreeLayoutConfig.EnumEdgeLabeling.GENERIC]
          ]
        }),
        TypeAttribute(TreeLayoutConfig.EnumEdgeLabeling.$class)
      ]
    },
    get: function() {
      return this.$edgeLabelingItem
    },
    set: function(value) {
      this.$edgeLabelingItem = value
      if (value === TreeLayoutConfig.EnumEdgeLabeling.INTEGRATED) {
        this.labelPlacementOrientationItem =
          LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL
        this.labelPlacementAlongEdgeItem = LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET
        this.labelPlacementDistanceItem = 0
      }
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
      return this.edgeLabelingItem !== TreeLayoutConfig.EnumEdgeLabeling.GENERIC
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
      return this.edgeLabelingItem === TreeLayoutConfig.EnumEdgeLabeling.NONE
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
      return this.edgeLabelingItem === TreeLayoutConfig.EnumEdgeLabeling.NONE
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
      return this.edgeLabelingItem === TreeLayoutConfig.EnumEdgeLabeling.NONE
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
        (this.edgeLabelingItem === TreeLayoutConfig.EnumEdgeLabeling.NONE ||
        this.labelPlacementSideOfEdgeItem ===
          LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE)
      )
    }
  },

  $static: {
    // ReSharper restore UnusedMember.Global
    // ReSharper restore InconsistentNaming
    EnumRoute: new EnumDefinition(function() {
      return {
        ORTHOGONAL: 0,
        ORGANIC: 1,
        STRAIGHTLINE: 2,
        BUNDLED: 3
      }
    }),

    EnumEdgeLabeling: new EnumDefinition(function() {
      return {
        NONE: 0,
        INTEGRATED: 1,
        GENERIC: 2
      }
    }),

    EnumStyle: new EnumDefinition(function() {
      return {
        DEFAULT: 0,
        HORIZONTAL_VERTICAL: 1,
        COMPACT: 2,
        CLASSIC: 3
      }
    }),

    EnumNodePlacer: new EnumDefinition(function() {
      return {
        DEFAULT: 0,
        SIMPLE: 1,
        BUS: 2,
        DOUBLE_LINE: 3,
        LEFT_RIGHT: 4,
        LAYERED: 5,
        ASPECT_RATIO: 6,
        DENDROGRAM: 7,
        GRID: 8,
        COMPACT: 9
      }
    }),

    EnumRootAlignment: new EnumDefinition(function() {
      return {
        CENTER: 0,
        MEDIAN: 1,
        LEFT: 2,
        LEADING: 3,
        RIGHT: 4,
        TRAILING: 5
      }
    })
  }
})
export default TreeLayoutConfig
