/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CompactNodePlacer,
  ComponentArrangementStyles,
  DefaultNodePlacer,
  DefaultTreeLayoutPortAssignment,
  DelegatingNodePlacer,
  DendrogramNodePlacer,
  DoubleLineNodePlacer,
  EdgeBundleDescriptor,
  EdgeRouter,
  EdgeRouterScope,
  Enum,
  GenericLabeling,
  GraphComponent,
  GridNodePlacer,
  IGraph,
  ILayoutAlgorithm,
  LayeredNodePlacer,
  LayoutData,
  LayoutOrientation,
  LeftRightNodePlacer,
  Mapper,
  OrganicEdgeRouter,
  RootAlignment,
  RootNodeAlignment,
  RotatableNodePlacerMatrix,
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
} from 'demo-resources/demo-option-editor'
import LayoutConfiguration, {
  EdgeLabeling,
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge
} from './LayoutConfiguration.js'
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
  constructor: function () {
    LayoutConfiguration.call(this)

    const aspectRatioNodePlacer = new AspectRatioNodePlacer()

    this.routingStyleForNonTreeEdgesItem = RoutingStyle.ORTHOGONAL
    this.edgeBundlingStrengthItem = 0.95
    this.actOnSelectionOnlyItem = false

    this.defaultLayoutOrientationItem = LayoutOrientation.TOP_TO_BOTTOM

    this.considerNodeLabelsItem = false

    this.nodePlacerItem = TreeNodePlacer.DEFAULT

    this.spacingItem = 20
    this.rootAlignmentItem = TreeRootAlignment.CENTER
    this.alignPortsItem = false
    this.allowMultiParentsItem = false
    this.portAssignmentItem = TreeLayoutPortAssignmentMode.NONE

    this.nodePlacerAspectRatioItem = aspectRatioNodePlacer.aspectRatio

    this.edgeLabelingItem = EdgeLabeling.NONE
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10
    this.title = 'Tree Layout'
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph.mapperRegistry} if necessary.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    let layout

    if (this.nodePlacerItem !== TreeNodePlacer.HV) {
      layout = this.configureDefaultLayout()
    } else {
      // use a default TreeLayout to show the 'Horizontal-Vertical' style
      layout = new TreeLayout()
    }

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

  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData =
      this.nodePlacerItem === TreeNodePlacer.HV
        ? this.createLayoutDataHorizontalVertical(graphComponent)
        : this.nodePlacerItem === TreeNodePlacer.DELEGATING_LAYERED
          ? this.createLayoutDataDelegatingPlacer(graphComponent)
          : this.createLayoutDataTree(graphComponent, layout)

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

  createLayoutDataTree: function (graphComponent, layout) {
    const graph = graphComponent.graph
    return new TreeLayoutData({
      gridNodePlacerRowIndices: (node) => {
        const predecessors = graph.predecessors(node)
        const parent = predecessors.at(0)
        if (parent) {
          const siblings = graph.successors(parent).toArray()
          return siblings.indexOf(node) % Math.round(Math.sqrt(siblings.length))
        }
        return 0
      },
      leftRightNodePlacerLeftNodes: (node) => {
        const predecessors = graph.predecessors(node)
        const parent = predecessors.at(0)
        if (parent) {
          const siblings = graph.successors(parent).toArray()
          return siblings.indexOf(node) % 2 !== 0
        }
        return false
      },
      compactNodePlacerStrategyMementos: new Mapper(),
      assistantNodes: (node) => {
        return node.tag ? node.tag.assistant : null
      }
    })
  },

  createLayoutDataHorizontalVertical: function (graphComponent) {
    return new TreeLayoutData({
      nodePlacers: (node) => {
        // children of selected nodes should be placed vertical and to the right of their child nodes, while
        // the children of non-selected horizontal downwards
        const childPlacement = graphComponent.selection.isSelected(node)
          ? ChildPlacement.VERTICAL_TO_RIGHT
          : ChildPlacement.HORIZONTAL_DOWNWARD

        return new DefaultNodePlacer({
          childPlacement: childPlacement,
          rootAlignment: RootAlignment.LEADING_ON_BUS,
          verticalDistance: this.spacingItem,
          horizontalDistance: this.spacingItem,
          alignPorts: this.alignPortsItem
        })
      }
    })
  },

  createLayoutDataDelegatingPlacer: function (graphComponent) {
    const graph = graphComponent.graph
    //half the subtrees are delegated to the left placer and half to the right placer
    const leftNodes = new Set()
    const root = graph.nodes.find((node) => graph.inDegree(node) === 0)
    let left = true
    for (const successor of graph.successors(root)) {
      const stack = [successor]
      while (stack.length > 0) {
        const child = stack.pop()
        if (left) {
          leftNodes.add(child)
        } // else: right node
        //push successors on stack -> whole subtree is either left or right
        stack.push(...graph.successors(child).toArray())
      }
      left = !left
    }
    const layoutData = new TreeLayoutData({
      delegatingNodePlacerPrimaryNodes: (node) => leftNodes.has(node),
      // tells the layout which node placer to use for a node
      nodePlacers: (node) => {
        if (node === root) {
          return this.delegatingRootPlacer
        }
        if (leftNodes.has(node)) {
          return this.delegatingLeftPlacer
        }
        return this.delegatingRightPlacer
      }
    })
    layoutData.treeRoot.item = root
    return layoutData
  },

  /**
   * Configures the tree reduction stage that will handle edges that do not belong to the tree.
   */
  createTreeReductionStage: function () {
    // configures tree reduction stage and non-tree edge routing
    const reductionStage = new TreeReductionStage()
    if (this.edgeLabelingItem === EdgeLabeling.INTEGRATED) {
      reductionStage.nonTreeEdgeLabelingAlgorithm = new GenericLabeling()
    }
    reductionStage.multiParentAllowed =
      (this.nodePlacerItem === TreeNodePlacer.DEFAULT ||
        this.nodePlacerItem === TreeNodePlacer.BUS ||
        this.nodePlacerItem === TreeNodePlacer.LEFT_RIGHT ||
        this.nodePlacerItem === TreeNodePlacer.DENDROGRAM) &&
      this.allowMultiParentsItem

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
   * Configures the default tree layout algorithm.
   */
  configureDefaultLayout: function () {
    const isDefaultNodePlacer = this.nodePlacerItem === TreeNodePlacer.DEFAULT
    const isAspectRatioNodePlacer = this.nodePlacerItem === TreeNodePlacer.ASPECT_RATIO

    const layout = new TreeLayout()
    layout.layoutOrientation = isAspectRatioNodePlacer
      ? LayoutOrientation.TOP_TO_BOTTOM
      : this.defaultLayoutOrientationItem

    const spacing = this.spacingItem

    let rootAlignment
    switch (this.rootAlignmentItem) {
      default:
      case TreeRootAlignment.CENTER:
        rootAlignment = isDefaultNodePlacer ? RootAlignment.CENTER : RootNodeAlignment.CENTER
        break
      case TreeRootAlignment.MEDIAN:
        rootAlignment = isDefaultNodePlacer ? RootAlignment.MEDIAN : RootNodeAlignment.MEDIAN
        break
      case TreeRootAlignment.LEFT:
        rootAlignment = isDefaultNodePlacer ? RootAlignment.LEADING : RootNodeAlignment.LEFT
        break
      case TreeRootAlignment.LEADING:
        rootAlignment = isDefaultNodePlacer
          ? RootAlignment.LEADING_OFFSET
          : RootNodeAlignment.LEADING
        break
      case TreeRootAlignment.RIGHT:
        rootAlignment = isDefaultNodePlacer ? RootAlignment.TRAILING : RootNodeAlignment.RIGHT
        break
      case TreeRootAlignment.TRAILING:
        rootAlignment = isDefaultNodePlacer
          ? RootAlignment.TRAILING_OFFSET
          : RootNodeAlignment.TRAILING
        break
    }

    const aspectRatio = this.nodePlacerAspectRatioItem
    const allowMultiParents = this.allowMultiParentsItem

    switch (this.nodePlacerItem) {
      default:
      case TreeNodePlacer.DEFAULT:
        layout.defaultNodePlacer = new DefaultNodePlacer({
          horizontalDistance: spacing,
          verticalDistance: spacing,
          rootAlignment: rootAlignment,
          alignPorts: this.alignPortsItem
        })
        layout.multiParentAllowed = allowMultiParents
        break
      case TreeNodePlacer.SIMPLE:
        layout.defaultNodePlacer = new SimpleNodePlacer({
          spacing,
          rootAlignment: rootAlignment,
          alignPorts: this.alignPortsItem
        })
        break
      case TreeNodePlacer.BUS:
        layout.defaultNodePlacer = new BusNodePlacer({
          spacing,
          alignPorts: this.alignPortsItem
        })
        layout.multiParentAllowed = allowMultiParents
        break
      case TreeNodePlacer.DOUBLE_LINE:
        layout.defaultNodePlacer = new DoubleLineNodePlacer({
          spacing,
          rootAlignment: rootAlignment,
          alignPorts: this.alignPortsItem
        })
        break
      case TreeNodePlacer.LEFT_RIGHT:
        layout.defaultNodePlacer = new LeftRightNodePlacer({
          spacing,
          alignPorts: this.alignPortsItem
        })
        layout.multiParentAllowed = allowMultiParents
        break
      case TreeNodePlacer.LAYERED:
        layout.defaultNodePlacer = new LayeredNodePlacer({
          spacing,
          layerSpacing: spacing,
          rootAlignment: rootAlignment,
          alignPorts: this.alignPortsItem
        })
        break
      case TreeNodePlacer.ASPECT_RATIO:
        layout.defaultNodePlacer = new AspectRatioNodePlacer({
          horizontalDistance: spacing,
          verticalDistance: spacing,
          aspectRatio
        })
        break
      case TreeNodePlacer.DENDROGRAM:
        layout.defaultNodePlacer = new DendrogramNodePlacer({
          minimumRootDistance: spacing,
          minimumSubtreeDistance: spacing
        })
        layout.multiParentAllowed = allowMultiParents
        break
      case TreeNodePlacer.GRID:
        layout.defaultNodePlacer = new GridNodePlacer({
          spacing,
          rootAlignment: rootAlignment,
          alignPorts: this.alignPortsItem
        })
        break
      case TreeNodePlacer.COMPACT:
        layout.defaultNodePlacer = new CompactNodePlacer({
          horizontalDistance: spacing,
          verticalDistance: spacing,
          preferredAspectRatio: aspectRatio
        })
        break
      case TreeNodePlacer.DELEGATING_LAYERED:
        this.delegatingLeftPlacer = new LayeredNodePlacer({
          modificationMatrix: RotatableNodePlacerMatrix.ROT270,
          id: RotatableNodePlacerMatrix.ROT270,
          verticalAlignment: 0,
          routingStyle: 'orthogonal',
          spacing,
          layerSpacing: spacing,
          rootAlignment: rootAlignment,
          alignPorts: this.alignPortsItem
        })

        this.delegatingRightPlacer = new LayeredNodePlacer({
          modificationMatrix: RotatableNodePlacerMatrix.ROT90,
          id: RotatableNodePlacerMatrix.ROT90,
          verticalAlignment: 0,
          routingStyle: 'orthogonal',
          layerSpacing: spacing,
          rootAlignment: rootAlignment,
          alignPorts: this.alignPortsItem
        })

        this.delegatingRootPlacer = new DelegatingNodePlacer({
          modificationMatrix: RotatableNodePlacerMatrix.DEFAULT,
          primaryPlacer: this.delegatingLeftPlacer,
          secondaryPlacer: this.delegatingRightPlacer,
          alignPorts: this.alignPortsItem
        })
        break
    }

    layout.defaultPortAssignment = new DefaultTreeLayoutPortAssignment(this.portAssignmentItem)
    layout.groupingSupported = true

    return layout
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
  NodePlacerGroup: {
    $meta: function () {
      return [
        LabelAttribute('Node Placer'),
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
  NonTreeEdgesGroup: {
    $meta: function () {
      return [
        LabelAttribute('Non-Tree Edges'),
        OptionGroupAttribute('EdgesGroup', 20),
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
        OptionGroupAttribute('RootGroup', 40),
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
    get: function () {
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

  /** @type {LayoutOrientation} */
  defaultLayoutOrientationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Orientation',
          '#/api/TreeLayout#MultiStageLayout-property-layoutOrientation'
        ),
        OptionGroupAttribute('GeneralGroup', 5),
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
    value: null
  },

  /** @type {boolean} */
  shouldDisableDefaultLayoutOrientationItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.nodePlacerItem === TreeNodePlacer.ASPECT_RATIO ||
        this.nodePlacerItem === TreeNodePlacer.COMPACT
      )
    }
  },

  /** @type {boolean} */
  actOnSelectionOnlyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Act on Selection Only',
          '#/api/TreeLayout#MultiStageLayout-property-subgraphLayoutEnabled'
        ),
        OptionGroupAttribute('GeneralGroup', 10),
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

  /** @type {TreeNodePlacer} */
  nodePlacerItem: {
    $meta: function () {
      return [
        LabelAttribute('Node Placer', '#/api/TreeLayout#TreeLayout-property-defaultNodePlacer'),
        OptionGroupAttribute('NodePlacerGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Default', TreeNodePlacer.DEFAULT],
            ['Simple', TreeNodePlacer.SIMPLE],
            ['Compact', TreeNodePlacer.COMPACT],
            ['Bus', TreeNodePlacer.BUS],
            ['Double-Line', TreeNodePlacer.DOUBLE_LINE],
            ['Left-Right', TreeNodePlacer.LEFT_RIGHT],
            ['Layered', TreeNodePlacer.LAYERED],
            ['Aspect Ratio', TreeNodePlacer.ASPECT_RATIO],
            ['Dendrogram', TreeNodePlacer.DENDROGRAM],
            ['Grid', TreeNodePlacer.GRID],
            ['Horizontal-Vertical', TreeNodePlacer.HV],
            ['Delegating & Layered', TreeNodePlacer.DELEGATING_LAYERED]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  spacingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Spacing',
          '#/api/DefaultNodePlacer#DefaultNodePlacer-property-horizontalDistance'
        ),
        OptionGroupAttribute('NodePlacerGroup', 20),
        MinMaxAttribute().init({
          min: 0,
          max: 500
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {TreeRootAlignment} */
  rootAlignmentItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Root Alignment',
          '#/api/DefaultNodePlacer#DefaultNodePlacer-property-rootAlignment'
        ),
        OptionGroupAttribute('NodePlacerGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Center', TreeRootAlignment.CENTER],
            ['Median', TreeRootAlignment.MEDIAN],
            ['Left', TreeRootAlignment.LEFT],
            ['Leading', TreeRootAlignment.LEADING],
            ['Right', TreeRootAlignment.RIGHT],
            ['Trailing', TreeRootAlignment.TRAILING]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  shouldDisableRootAlignmentItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.nodePlacerItem === TreeNodePlacer.ASPECT_RATIO ||
        this.nodePlacerItem === TreeNodePlacer.BUS ||
        this.nodePlacerItem === TreeNodePlacer.DENDROGRAM ||
        this.nodePlacerItem === TreeNodePlacer.COMPACT
      )
    }
  },

  /** @type {boolean} */
  alignPortsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Align Ports',
          '#/api/RotatableNodePlacerBase#RotatableNodePlacerBase-property-alignPorts'
        ),
        OptionGroupAttribute('NodePlacerGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableAlignPortsItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        (this.nodePlacerItem !== TreeNodePlacer.DEFAULT &&
          this.nodePlacerItem !== TreeNodePlacer.SIMPLE &&
          this.nodePlacerItem !== TreeNodePlacer.BUS &&
          this.nodePlacerItem !== TreeNodePlacer.DOUBLE_LINE &&
          this.nodePlacerItem !== TreeNodePlacer.LEFT_RIGHT &&
          this.nodePlacerItem !== TreeNodePlacer.LAYERED &&
          this.nodePlacerItem !== TreeNodePlacer.GRID &&
          this.nodePlacerItem !== TreeNodePlacer.DELEGATING_LAYERED &&
          this.nodePlacerItem !== TreeNodePlacer.HV) ||
        (this.rootAlignmentItem !== TreeRootAlignment.CENTER &&
          this.rootAlignmentItem !== TreeRootAlignment.MEDIAN &&
          this.rootAlignmentItem !== TreeRootAlignment.LEFT &&
          this.rootAlignmentItem !== TreeRootAlignment.RIGHT)
      )
    }
  },

  /** @type {number} */
  nodePlacerAspectRatioItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Aspect Ratio',
          '#/api/AspectRatioNodePlacer#AspectRatioNodePlacer-property-aspectRatio'
        ),
        OptionGroupAttribute('NodePlacerGroup', 50),
        MinMaxAttribute().init({
          min: 0.1,
          max: 4,
          step: 0.1
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0.1
  },

  /** @type {boolean} */
  shouldDisableNodePlacerAspectRatioItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.nodePlacerItem !== TreeNodePlacer.ASPECT_RATIO &&
        this.nodePlacerItem !== TreeNodePlacer.COMPACT
      )
    }
  },

  /** @type {boolean} */
  allowMultiParentsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Allow Multi-Parents',
          '#/api/TreeLayout#TreeLayout-property-multiParentAllowed'
        ),
        OptionGroupAttribute('NodePlacerGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableAllowMultiParentsItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.nodePlacerItem !== TreeNodePlacer.DEFAULT &&
        this.nodePlacerItem !== TreeNodePlacer.DENDROGRAM &&
        this.nodePlacerItem !== TreeNodePlacer.BUS &&
        this.nodePlacerItem !== TreeNodePlacer.LEFT_RIGHT
      )
    }
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
  shouldDisableEdgeBundlingStrengthItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.routingStyleForNonTreeEdgesItem !== RoutingStyle.BUNDLED
    }
  },

  /** @type {TreeLayoutPortAssignmentMode} */
  portAssignmentItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Port Assignment',
          '#/api/TreeLayout#TreeLayout-property-defaultPortAssignment'
        ),
        OptionGroupAttribute('EdgesGroup', 10),
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
    value: null
  },

  /**
   * @type {EdgeLabeling}
   */
  $edgeLabelingItem: null,

  /** @type {EdgeLabeling} */
  edgeLabelingItem: {
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
    get: function () {
      return this.$edgeLabelingItem
    },
    set: function (value) {
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
  shouldDisableReduceAmbiguityItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
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
  shouldDisableLabelPlacementOrientationItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
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
  shouldDisableLabelPlacementAlongEdgeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
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
  shouldDisableLabelPlacementSideOfEdgeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
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
  shouldDisableLabelPlacementDistanceItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.edgeLabelingItem === EdgeLabeling.NONE ||
        this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
      )
    }
  }
})
export default TreeLayoutConfig

/**
 * @readonly
 * @enum {number}
 */
const RoutingStyle = {
  ORTHOGONAL: 0,
  ORGANIC: 1,
  STRAIGHTLINE: 2,
  BUNDLED: 3
}

export /**
 * @readonly
 * @enum {number}
 */
const TreeNodePlacer = {
  DEFAULT: 0,
  SIMPLE: 1,
  BUS: 2,
  DOUBLE_LINE: 3,
  LEFT_RIGHT: 4,
  LAYERED: 5,
  ASPECT_RATIO: 6,
  DENDROGRAM: 7,
  GRID: 8,
  COMPACT: 9,
  HV: 10,
  DELEGATING_LAYERED: 11
}

/**
 * @readonly
 * @enum {number}
 */
const TreeRootAlignment = {
  CENTER: 0,
  MEDIAN: 1,
  LEFT: 2,
  LEADING: 3,
  RIGHT: 4,
  TRAILING: 5
}
