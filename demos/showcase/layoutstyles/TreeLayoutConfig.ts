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
  AspectRatioSubtreePlacer,
  BusSubtreePlacer,
  Class,
  CompactSubtreePlacer,
  ComponentArrangementStyle,
  DendrogramSubtreePlacer,
  DoubleLayerSubtreePlacer,
  EdgeBundleDescriptor,
  EdgeLabelPlacement,
  EdgePortCandidates,
  EdgeRouter,
  GenericLabeling,
  GraphComponent,
  ILayoutAlgorithm,
  type INode,
  LayoutData,
  LayoutOrientation,
  LeftRightSubtreePlacer,
  LevelAlignedSubtreePlacer,
  Mapper,
  MultiLayerSubtreePlacer,
  MultiLayerSubtreePlacerRootAlignment,
  MultiParentDescriptor,
  NodeLabelPlacement,
  OrganicEdgeRouter,
  PortSides,
  SingleLayerSubtreePlacer,
  SingleLayerSubtreePlacerRootAlignment,
  SingleSplitSubtreePlacer,
  StraightLineEdgeRouter,
  SubgraphLayoutStage,
  SubtreeRootAlignment,
  SubtreeTransform,
  TreeLayout,
  TreeLayoutData,
  TreeLayoutPortAssigner,
  TreeLayoutPortAssignmentMode,
  TreeReductionStage
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
import LayoutConfiguration, {
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge
} from './LayoutConfiguration'
import HandleEdgesBetweenGroupsStage from './HandleEdgesBetweenGroupsStage'

enum RoutingStyle {
  ORTHOGONAL,
  ORGANIC,
  STRAIGHT_LINE,
  BUNDLED
}

export enum SubtreePlacer {
  SINGLE_LAYER,
  BUS,
  DOUBLE_LAYER,
  LEFT_RIGHT,
  LEVEL_ALIGNED,
  ASPECT_RATIO,
  DENDROGRAM,
  MULTI_LAYER,
  COMPACT,
  HV,
  SINGLE_SPLIT_LAYERED
}

enum TreeRootAlignment {
  CENTER,
  MEDIAN,
  LEFT,
  LEADING,
  RIGHT,
  TRAILING
}

enum PortAssignment {
  CENTER,
  DISTRIBUTED_TOP,
  DISTRIBUTED_BOTTOM,
  DISTRIBUTED_LEFT,
  DISTRIBUTED_RIGHT
}

/**
 * Configuration options for the layout algorithm of the same name.
 */
const TreeLayoutConfig = (Class as any)('TreeLayoutConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    GeneralGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    SubtreePlacerGroup: [
      new LabelAttribute('Subtree Placer'),
      new OptionGroupAttribute('RootGroup', 20),
      new TypeAttribute(OptionGroup)
    ],
    EdgesGroup: [
      new LabelAttribute('Edges'),
      new OptionGroupAttribute('RootGroup', 30),
      new TypeAttribute(OptionGroup)
    ],
    NonTreeEdgesGroup: [
      new LabelAttribute('Non-Tree Edges'),
      new OptionGroupAttribute('EdgesGroup', 20),
      new TypeAttribute(OptionGroup)
    ],
    LabelingGroup: [
      new LabelAttribute('Labeling'),
      new OptionGroupAttribute('RootGroup', 40),
      new TypeAttribute(OptionGroup)
    ],
    NodePropertiesGroup: [
      new LabelAttribute('Node Settings'),
      new OptionGroupAttribute('LabelingGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    EdgePropertiesGroup: [
      new LabelAttribute('Edge Settings'),
      new OptionGroupAttribute('LabelingGroup', 20),
      new TypeAttribute(OptionGroup)
    ],
    PreferredPlacementGroup: [
      new LabelAttribute('Preferred Edge Label Placement'),
      new OptionGroupAttribute('LabelingGroup', 30),
      new TypeAttribute(OptionGroup)
    ],
    descriptionText: [
      new OptionGroupAttribute('DescriptionGroup', 10),
      new ComponentAttribute(Components.HTML_BLOCK),
      new TypeAttribute(String)
    ],
    defaultLayoutOrientationItem: [
      new LabelAttribute('Orientation', '#/api/TreeLayout#TreeLayout-property-layoutOrientation'),
      new OptionGroupAttribute('GeneralGroup', 5),
      new EnumValuesAttribute([
        ['Top to Bottom', LayoutOrientation.TOP_TO_BOTTOM],
        ['Bottom to Top', LayoutOrientation.BOTTOM_TO_TOP],
        ['Left to Right', LayoutOrientation.LEFT_TO_RIGHT],
        ['Right to Left', LayoutOrientation.RIGHT_TO_LEFT]
      ]),
      new TypeAttribute(LayoutOrientation)
    ],
    actOnSelectionOnlyItem: [
      new LabelAttribute(
        'Act on Selection Only',
        '#/api/SubgraphLayoutStage#LayoutStageBase-property-enabled'
      ),
      new OptionGroupAttribute('GeneralGroup', 10),
      new TypeAttribute(Boolean)
    ],
    nodeLabelingItem: [
      new OptionGroupAttribute('NodePropertiesGroup', 10),
      new LabelAttribute(
        'Node Labeling',
        '#/api/TreeLayout#TreeLayout-property-nodeLabelPlacement'
      ),
      new EnumValuesAttribute([
        ['Consider', NodeLabelPlacement.CONSIDER],
        ['Generic', NodeLabelPlacement.GENERIC],
        ['Ignore', NodeLabelPlacement.IGNORE]
      ]),
      new TypeAttribute(NodeLabelPlacement)
    ],
    subtreePlacerItem: [
      new LabelAttribute(
        'Subtree Placer',
        '#/api/TreeLayout#TreeLayout-property-defaultSubtreePlacer'
      ),
      new OptionGroupAttribute('SubtreePlacerGroup', 10),
      new EnumValuesAttribute([
        ['Single Layer', SubtreePlacer.SINGLE_LAYER],
        ['Compact', SubtreePlacer.COMPACT],
        ['Bus', SubtreePlacer.BUS],
        ['Double Layer', SubtreePlacer.DOUBLE_LAYER],
        ['Left-Right', SubtreePlacer.LEFT_RIGHT],
        ['Level-Aligned', SubtreePlacer.LEVEL_ALIGNED],
        ['Aspect Ratio', SubtreePlacer.ASPECT_RATIO],
        ['Dendrogram', SubtreePlacer.DENDROGRAM],
        ['Multi-Layer', SubtreePlacer.MULTI_LAYER],
        ['Horizontal-Vertical', SubtreePlacer.HV],
        ['Single Split Layered', SubtreePlacer.SINGLE_SPLIT_LAYERED]
      ]),
      new TypeAttribute(SubtreePlacer)
    ],
    spacingItem: [
      new LabelAttribute(
        'Spacing',
        '#/api/SingleLayerSubtreePlacer#SingleLayerSubtreePlacer-property-horizontalDistance'
      ),
      new OptionGroupAttribute('SubtreePlacerGroup', 20),
      new MinMaxAttribute(0, 500),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    rootAlignmentItem: [
      new LabelAttribute(
        'Root Alignment',
        '#/api/SingleLayerSubtreePlacer#SingleLayerSubtreePlacer-property-rootAlignment'
      ),
      new OptionGroupAttribute('SubtreePlacerGroup', 30),
      new EnumValuesAttribute([
        ['Center', TreeRootAlignment.CENTER],
        ['Median', TreeRootAlignment.MEDIAN],
        ['Left', TreeRootAlignment.LEFT],
        ['Leading', TreeRootAlignment.LEADING],
        ['Right', TreeRootAlignment.RIGHT],
        ['Trailing', TreeRootAlignment.TRAILING]
      ]),
      new TypeAttribute(TreeRootAlignment)
    ],
    alignPortsItem: [
      new LabelAttribute(
        'Align Ports',
        '#/api/SingleLayerSubtreePlacer#SingleLayerSubtreePlacer-property-alignPorts'
      ),
      new OptionGroupAttribute('SubtreePlacerGroup', 40),
      new TypeAttribute(Boolean)
    ],
    subtreePlacerAspectRatioItem: [
      new LabelAttribute(
        'Aspect Ratio',
        '#/api/AspectRatioSubtreePlacer#AspectRatioSubtreePlacer-property-aspectRatio'
      ),
      new OptionGroupAttribute('SubtreePlacerGroup', 50),
      new MinMaxAttribute(0.1, 4, 0.1),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    allowMultiParentsItem: [
      new LabelAttribute(
        'Allow Multi-Parents',
        '#/api/TreeLayout#TreeLayout-property-allowMultiParent'
      ),
      new OptionGroupAttribute('SubtreePlacerGroup', 60),
      new TypeAttribute(Boolean)
    ],
    routingStyleForNonTreeEdgesItem: [
      new LabelAttribute(
        'Routing Style for Non-Tree Edges',
        '#/api/TreeReductionStage#TreeReductionStage-property-nonTreeEdgeRouter'
      ),
      new OptionGroupAttribute('NonTreeEdgesGroup', 10),
      new EnumValuesAttribute([
        ['Orthogonal', RoutingStyle.ORTHOGONAL],
        ['Organic', RoutingStyle.ORGANIC],
        ['Straight-Line', RoutingStyle.STRAIGHT_LINE],
        ['Bundled', RoutingStyle.BUNDLED]
      ]),
      new TypeAttribute(RoutingStyle)
    ],
    edgeBundlingStrengthItem: [
      new LabelAttribute(
        'Bundling Strength',
        '#/api/EdgeBundling#EdgeBundling-property-bundlingStrength'
      ),
      new OptionGroupAttribute('NonTreeEdgesGroup', 20),
      new MinMaxAttribute(0, 1.0, 0.01),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    portAssignmentItem: [
      new LabelAttribute(
        'Port Assignment',
        '#/api/TreeLayoutData#TreeLayoutData-property-portAssigners'
      ),
      new OptionGroupAttribute('EdgesGroup', 10),
      new EnumValuesAttribute([
        ['None', PortAssignment.CENTER],
        ['Distributed Top', PortAssignment.DISTRIBUTED_TOP],
        ['Distributed Bottom', PortAssignment.DISTRIBUTED_BOTTOM],
        ['Distributed Left', PortAssignment.DISTRIBUTED_LEFT],
        ['Distributed Right', PortAssignment.DISTRIBUTED_RIGHT]
      ]),
      new TypeAttribute(PortAssignment)
    ],
    edgeLabelingItem: [
      new LabelAttribute(
        'Edge Labeling',
        '#/api/TreeLayout#TreeLayout-property-edgeLabelPlacement'
      ),
      new OptionGroupAttribute('EdgePropertiesGroup', 10),
      new EnumValuesAttribute([
        ['Ignore', EdgeLabelPlacement.IGNORE],
        ['Integrated', EdgeLabelPlacement.INTEGRATED],
        ['Generic', EdgeLabelPlacement.GENERIC]
      ]),
      new TypeAttribute(EdgeLabelPlacement)
    ],
    reduceAmbiguityItem: [
      new LabelAttribute(
        'Reduce Ambiguity',
        '#/api/LabelingCosts#LabelingCosts-property-ambiguousPlacementCost'
      ),
      new OptionGroupAttribute('EdgePropertiesGroup', 20),
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

    const aspectRatioSubtreePlacer = new AspectRatioSubtreePlacer()

    this.routingStyleForNonTreeEdgesItem = RoutingStyle.ORTHOGONAL
    this.edgeBundlingStrengthItem = 0.95
    this.actOnSelectionOnlyItem = false

    this.defaultLayoutOrientationItem = LayoutOrientation.TOP_TO_BOTTOM

    this.nodeLabelingItem = NodeLabelPlacement.CONSIDER

    this.subtreePlacerItem = SubtreePlacer.SINGLE_LAYER

    this.spacingItem = 30
    this.rootAlignmentItem = TreeRootAlignment.CENTER
    this.alignPortsItem = false
    this.allowMultiParentsItem = false
    this.portAssignmentItem = PortAssignment.CENTER

    this.subtreePlacerAspectRatioItem = aspectRatioSubtreePlacer.aspectRatio

    this.edgeLabelingItem = EdgeLabelPlacement.INTEGRATED
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10
    this.title = 'Tree Layout'
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const layout: TreeLayout =
      this.subtreePlacerItem !== SubtreePlacer.HV ? this.configureDefaultLayout() : new TreeLayout()

    layout.parallelEdgeRouter.enabled = false
    layout.componentLayout.style = ComponentArrangementStyle.MULTI_ROWS

    const subgraphLayout = layout.layoutStages.get(SubgraphLayoutStage)!
    subgraphLayout.enabled = this.actOnSelectionOnlyItem

    this.configureTreeReductionStage(layout.treeReductionStage)

    const placeLabels = this.edgeLabelingItem !== EdgeLabelPlacement.IGNORE

    // required to prevent WrongGraphStructure exception which may be thrown by TreeLayout if there are edges
    // between group nodes
    layout.layoutStages.prepend(new HandleEdgesBetweenGroupsStage(placeLabels))

    layout.nodeLabelPlacement = this.nodeLabelingItem
    layout.edgeLabelPlacement = this.edgeLabelingItem
    if (this.edgeLabelingItem === EdgeLabelPlacement.GENERIC) {
      const labeling = layout.layoutStages.get(GenericLabeling)!
      labeling.scope = 'edge-labels'
      if (this.reduceAmbiguityItem) {
        labeling.defaultEdgeLabelingCosts.ambiguousPlacementCost = 1.0
      }
    }

    return layout
  },

  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: TreeLayout
  ): LayoutData {
    const layoutData =
      this.subtreePlacerItem === SubtreePlacer.HV
        ? this.createLayoutDataHorizontalVertical(graphComponent)
        : this.subtreePlacerItem === SubtreePlacer.SINGLE_SPLIT_LAYERED
          ? this.createLayoutDataSingleSplitPlacer(graphComponent)
          : this.createLayoutDataTree(graphComponent, layout)

    if (this.portAssignmentItem !== PortAssignment.CENTER) {
      layoutData.ports.sourcePortCandidates = this.createPortCandidate(this.portAssignmentItem)
    }

    let resultData = layoutData.combineWith(
      this.createLabelingLayoutData(
        graphComponent.graph,
        this.labelPlacementAlongEdgeItem,
        this.labelPlacementSideOfEdgeItem,
        this.labelPlacementOrientationItem,
        this.labelPlacementDistanceItem
      )
    )
    if (this.actOnSelectionOnlyItem) {
      resultData = resultData.combineWith(this.createSubgraphLayoutData(graphComponent))
    }
    return resultData
  },

  createLayoutDataTree: function (graphComponent: GraphComponent, layout: TreeLayout): LayoutData {
    const graph = graphComponent.graph
    return new TreeLayoutData({
      multiLayerSubtreePlacerLayerIndices: (node: INode) => {
        const predecessors = graph.predecessors(node)
        const parent = predecessors.at(0)
        if (parent) {
          const siblings = graph.successors(parent).toArray()
          return siblings.indexOf(node) % Math.round(Math.sqrt(siblings.length))
        }
        return 0
      },
      leftRightSubtreePlacerLeftNodes: (node) => {
        const predecessors = graph.predecessors(node)
        const parent = predecessors.at(0)
        if (parent) {
          const siblings = graph.successors(parent).toArray()
          return siblings.indexOf(node) % 2 !== 0
        }
        return false
      },
      compactSubtreePlacerStrategyMementos: new Mapper(),
      assistantNodes: (node) => {
        return node.tag ? node.tag.assistant : null
      },
      multiParentDescriptors: new MultiParentDescriptor({
        minimumBusDistance: 20
      })
    })
  },

  createLayoutDataHorizontalVertical: function (graphComponent: GraphComponent): TreeLayoutData {
    return new TreeLayoutData({
      subtreePlacers: (node) => {
        // children of selected nodes should be placed vertical and to the right of their child nodes, while
        // the children of non-selected horizontal downwards
        const subtreeTransform = graphComponent.selection.includes(node)
          ? SubtreeTransform.ROTATE_LEFT_FLIP_Y
          : SubtreeTransform.NONE

        return new SingleLayerSubtreePlacer({
          transformation: subtreeTransform,
          rootAlignment: SingleLayerSubtreePlacerRootAlignment.LEADING_ON_BUS,
          verticalDistance: this.spacingItem,
          horizontalDistance: this.spacingItem,
          alignPorts: this.alignPortsItem
        })
      }
    })
  },

  createLayoutDataSingleSplitPlacer: function (graphComponent: GraphComponent): TreeLayoutData {
    const graph = graphComponent.graph
    if (graph.nodes.size == 0) {
      return new TreeLayoutData()
    }
    //half the subtrees are delegated to the left placer and half to the right placer
    const leftNodes = new Set()
    let root = graph.nodes.find((node) => graph.inDegree(node) === 0) ?? graph.nodes.at(0)!
    let left = true
    const seenNodes = new Set<INode>()
    seenNodes.add(root)

    for (const successor of graph.successors(root)) {
      const stack = [successor]
      while (stack.length > 0) {
        const child = stack.pop()!
        if (left) {
          leftNodes.add(child)
        } // else: right node
        //push successors on stack -> whole subtree is either left or right
        graph.successors(child).forEach((succSucc) => {
          if (!seenNodes.has(succSucc)) {
            stack.push(succSucc)
            seenNodes.add(succSucc)
          }
        })
      }
      left = !left
    }
    return new TreeLayoutData({
      singleSplitSubtreePlacerPrimaryNodes: (node) => leftNodes.has(node),
      // tells the layout which subtree placer to use for a node
      subtreePlacers: (node) => {
        if (node === root) {
          return this.singleSplitRootPlacer
        }
        if (leftNodes.has(node)) {
          return this.singleSplitLeftPlacer
        }
        return this.singleSplitRightPlacer
      },
      treeRoot: { item: root }
    })
  },

  /**
   * Configures the tree reduction stage that will handle edges that do not belong to the tree.
   */
  configureTreeReductionStage: function (treeReductionStage: TreeReductionStage): void {
    if (this.edgeLabelingItem === EdgeLabelPlacement.INTEGRATED) {
      treeReductionStage.nonTreeEdgeLabeling = new GenericLabeling()
    }
    treeReductionStage.allowMultiParent =
      (this.subtreePlacerItem === SubtreePlacer.SINGLE_LAYER ||
        this.subtreePlacerItem === SubtreePlacer.BUS ||
        this.subtreePlacerItem === SubtreePlacer.LEFT_RIGHT ||
        this.subtreePlacerItem === SubtreePlacer.DENDROGRAM) &&
      this.allowMultiParentsItem

    if (this.routingStyleForNonTreeEdgesItem === RoutingStyle.ORGANIC) {
      treeReductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()
    } else if (this.routingStyleForNonTreeEdgesItem === RoutingStyle.ORTHOGONAL) {
      treeReductionStage.nonTreeEdgeRouter = new EdgeRouter({
        rerouting: true,
        defaultEdgeDescriptor: { minimumLastSegmentLength: 20 }
      })
    } else if (this.routingStyleForNonTreeEdgesItem === RoutingStyle.STRAIGHT_LINE) {
      treeReductionStage.nonTreeEdgeRouter = new StraightLineEdgeRouter()
    } else if (this.routingStyleForNonTreeEdgesItem === RoutingStyle.BUNDLED) {
      const ebc = treeReductionStage.edgeBundling
      ebc.bundlingStrength = this.edgeBundlingStrengthItem
      ebc.defaultBundleDescriptor = new EdgeBundleDescriptor({ bundled: true })
    }
  },

  /**
   * Configures the default tree layout algorithm.
   */
  configureDefaultLayout: function (): TreeLayout {
    const isDefaultSubtreePlacer = this.subtreePlacerItem === SubtreePlacer.SINGLE_LAYER

    const layout = new TreeLayout({
      layoutOrientation:
        this.subtreePlacerItem === SubtreePlacer.ASPECT_RATIO
          ? LayoutOrientation.TOP_TO_BOTTOM
          : this.defaultLayoutOrientationItem
    })

    const spacing = this.spacingItem

    let rootAlignment:
      | SingleLayerSubtreePlacerRootAlignment
      | SubtreeRootAlignment
      | MultiLayerSubtreePlacerRootAlignment = SingleLayerSubtreePlacerRootAlignment.CENTER
    switch (this.rootAlignmentItem) {
      default:
      case TreeRootAlignment.CENTER:
        rootAlignment = isDefaultSubtreePlacer
          ? SingleLayerSubtreePlacerRootAlignment.CENTER
          : SubtreeRootAlignment.CENTER
        break
      case TreeRootAlignment.MEDIAN:
        rootAlignment = isDefaultSubtreePlacer
          ? SingleLayerSubtreePlacerRootAlignment.MEDIAN
          : SubtreeRootAlignment.MEDIAN
        break
      case TreeRootAlignment.LEFT:
        rootAlignment = isDefaultSubtreePlacer
          ? SingleLayerSubtreePlacerRootAlignment.LEFT
          : SubtreeRootAlignment.LEFT
        break
      case TreeRootAlignment.LEADING:
        rootAlignment = isDefaultSubtreePlacer
          ? SingleLayerSubtreePlacerRootAlignment.LEADING
          : SubtreeRootAlignment.LEADING
        break
      case TreeRootAlignment.RIGHT:
        rootAlignment = isDefaultSubtreePlacer
          ? SingleLayerSubtreePlacerRootAlignment.RIGHT
          : SubtreeRootAlignment.RIGHT
        break
      case TreeRootAlignment.TRAILING:
        rootAlignment = isDefaultSubtreePlacer
          ? SingleLayerSubtreePlacerRootAlignment.TRAILING
          : SubtreeRootAlignment.TRAILING
        break
    }

    const aspectRatio = this.subtreePlacerAspectRatioItem
    const allowMultiParents = this.allowMultiParentsItem

    switch (this.subtreePlacerItem) {
      default:
      case SubtreePlacer.SINGLE_LAYER:
        const singleLayerSubtreePlacer = new SingleLayerSubtreePlacer({
          horizontalDistance: spacing,
          verticalDistance: spacing,
          rootAlignment: rootAlignment as SingleLayerSubtreePlacerRootAlignment,
          alignPorts: this.alignPortsItem
        })
        if (this.portAssignmentItem !== PortAssignment.CENTER) {
          singleLayerSubtreePlacer.minimumChannelSegmentDistance = 5
        }
        layout.defaultSubtreePlacer = singleLayerSubtreePlacer
        layout.allowMultiParent = allowMultiParents
        break
      case SubtreePlacer.BUS:
        layout.defaultSubtreePlacer = new BusSubtreePlacer({
          spacing
        })
        layout.allowMultiParent = allowMultiParents
        break
      case SubtreePlacer.DOUBLE_LAYER:
        layout.defaultSubtreePlacer = new DoubleLayerSubtreePlacer({
          spacing,
          rootAlignment: rootAlignment as SubtreeRootAlignment,
          alignPorts: this.alignPortsItem
        })
        break
      case SubtreePlacer.LEFT_RIGHT:
        layout.defaultSubtreePlacer = new LeftRightSubtreePlacer({
          spacing,
          alignPorts: this.alignPortsItem
        })
        layout.allowMultiParent = allowMultiParents
        break
      case SubtreePlacer.LEVEL_ALIGNED:
        const levelAlignedSubtreePlacer = new LevelAlignedSubtreePlacer()
        levelAlignedSubtreePlacer.spacing = spacing
        levelAlignedSubtreePlacer.layerSpacing = spacing
        levelAlignedSubtreePlacer.rootAlignment = rootAlignment as SubtreeRootAlignment
        levelAlignedSubtreePlacer.alignPorts = this.alignPortsItem
        layout.defaultSubtreePlacer = levelAlignedSubtreePlacer
        break
      case SubtreePlacer.ASPECT_RATIO:
        layout.defaultSubtreePlacer = new AspectRatioSubtreePlacer({
          horizontalDistance: spacing,
          verticalDistance: spacing,
          aspectRatio
        })
        break
      case SubtreePlacer.DENDROGRAM:
        layout.defaultSubtreePlacer = new DendrogramSubtreePlacer({
          minimumRootDistance: spacing,
          minimumSubtreeDistance: spacing
        })
        layout.allowMultiParent = allowMultiParents
        break
      case SubtreePlacer.MULTI_LAYER:
        layout.defaultSubtreePlacer = new MultiLayerSubtreePlacer({
          spacing,
          rootAlignment: rootAlignment as unknown as MultiLayerSubtreePlacerRootAlignment
        })
        break
      case SubtreePlacer.COMPACT:
        layout.defaultSubtreePlacer = new CompactSubtreePlacer({
          horizontalDistance: spacing,
          verticalDistance: spacing,
          preferredAspectRatio: aspectRatio
        })
        break
      case SubtreePlacer.SINGLE_SPLIT_LAYERED:
        const rightLevelAlignedSubtreePlacer = new LevelAlignedSubtreePlacer(
          SubtreeTransform.ROTATE_RIGHT
        )
        rightLevelAlignedSubtreePlacer.transformation = SubtreeTransform.ROTATE_RIGHT
        rightLevelAlignedSubtreePlacer.verticalAlignment = 0
        rightLevelAlignedSubtreePlacer.edgeRoutingStyle = 'orthogonal'
        rightLevelAlignedSubtreePlacer.spacing = spacing
        rightLevelAlignedSubtreePlacer.layerSpacing = spacing
        rightLevelAlignedSubtreePlacer.rootAlignment = rootAlignment as SubtreeRootAlignment
        rightLevelAlignedSubtreePlacer.alignPorts = this.alignPortsItem
        this.singleSplitLeftPlacer = rightLevelAlignedSubtreePlacer

        const leftLevelAlignedSubtreePlacer = new LevelAlignedSubtreePlacer(
          SubtreeTransform.ROTATE_LEFT
        )
        leftLevelAlignedSubtreePlacer.transformation = SubtreeTransform.ROTATE_LEFT
        leftLevelAlignedSubtreePlacer.verticalAlignment = 0
        leftLevelAlignedSubtreePlacer.edgeRoutingStyle = 'orthogonal'
        leftLevelAlignedSubtreePlacer.layerSpacing = spacing
        leftLevelAlignedSubtreePlacer.rootAlignment = rootAlignment as SubtreeRootAlignment
        leftLevelAlignedSubtreePlacer.alignPorts = this.alignPortsItem
        this.singleSplitRightPlacer = leftLevelAlignedSubtreePlacer

        this.singleSplitRootPlacer = new SingleSplitSubtreePlacer(
          this.singleSplitLeftPlacer,
          this.singleSplitRightPlacer
        )
        break
    }

    layout.defaultPortAssigner = new TreeLayoutPortAssigner(
      this.portAssignmentItem === PortAssignment.CENTER
        ? TreeLayoutPortAssignmentMode.CENTER
        : TreeLayoutPortAssignmentMode.DISTRIBUTED
    )

    return layout
  },

  createPortCandidate(portAssignment: PortAssignment): EdgePortCandidates {
    switch (portAssignment) {
      default:
      case PortAssignment.CENTER:
        throw new Error('Center cannot be translated to port side')
      case PortAssignment.DISTRIBUTED_TOP:
        return new EdgePortCandidates().addFreeCandidate(PortSides.TOP)
      case PortAssignment.DISTRIBUTED_BOTTOM:
        return new EdgePortCandidates().addFreeCandidate(PortSides.BOTTOM)
      case PortAssignment.DISTRIBUTED_LEFT:
        return new EdgePortCandidates().addFreeCandidate(PortSides.LEFT)
      case PortAssignment.DISTRIBUTED_RIGHT:
        return new EdgePortCandidates().addFreeCandidate(PortSides.RIGHT)
    }
  },

  /** @type {OptionGroup} */
  GeneralGroup: null,

  /** @type {OptionGroup} */
  SubtreePlacerGroup: null,

  /** @type {OptionGroup} */
  EdgesGroup: null,

  /** @type {OptionGroup} */
  NonTreeEdgesGroup: null,

  /** @type {OptionGroup} */
  LabelingGroup: null,

  /** @type {OptionGroup} */
  NodePropertiesGroup: null,

  /** @type {OptionGroup} */
  EdgePropertiesGroup: null,

  /** @type {OptionGroup} */
  PreferredPlacementGroup: null,

  /**
   * Gets the description text.
   * The description text.
   * @type {string}
   */
  descriptionText: {
    get: function (): string {
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
  defaultLayoutOrientationItem: null,

  /** @type {boolean} */
  shouldDisableDefaultLayoutOrientationItem: <any>{
    get: function (): boolean {
      return (
        this.subtreePlacerItem === SubtreePlacer.ASPECT_RATIO ||
        this.subtreePlacerItem === SubtreePlacer.COMPACT
      )
    }
  },

  /** @type {boolean} */
  actOnSelectionOnlyItem: false,

  /** @type {NodeLabelPlacement} */
  nodeLabelingItem: null,

  /** @type {SubtreePlacer} */
  subtreePlacerItem: null,

  /** @type {number} */
  spacingItem: 0,

  /** @type {TreeRootAlignment} */
  rootAlignmentItem: null,

  /** @type {boolean} */
  shouldDisableRootAlignmentItem: <any>{
    get: function (): boolean {
      return (
        this.subtreePlacerItem === SubtreePlacer.ASPECT_RATIO ||
        this.subtreePlacerItem === SubtreePlacer.BUS ||
        this.subtreePlacerItem === SubtreePlacer.DENDROGRAM ||
        this.subtreePlacerItem === SubtreePlacer.COMPACT
      )
    }
  },

  /** @type {boolean} */
  alignPortsItem: false,

  /** @type {boolean} */
  shouldDisableAlignPortsItem: <any>{
    get: function (): boolean {
      return (
        (this.subtreePlacerItem !== SubtreePlacer.SINGLE_LAYER &&
          this.subtreePlacerItem !== SubtreePlacer.DOUBLE_LAYER &&
          this.subtreePlacerItem !== SubtreePlacer.LEFT_RIGHT &&
          this.subtreePlacerItem !== SubtreePlacer.SINGLE_SPLIT_LAYERED &&
          this.subtreePlacerItem !== SubtreePlacer.HV) ||
        (this.rootAlignmentItem !== TreeRootAlignment.CENTER &&
          this.rootAlignmentItem !== TreeRootAlignment.MEDIAN &&
          this.rootAlignmentItem !== TreeRootAlignment.LEFT &&
          this.rootAlignmentItem !== TreeRootAlignment.RIGHT)
      )
    }
  },

  /** @type {number} */
  subtreePlacerAspectRatioItem: 0.1,

  /** @type {boolean} */
  shouldDisableSubtreePlacerAspectRatioItem: <any>{
    get: function (): boolean {
      return (
        this.subtreePlacerItem !== SubtreePlacer.ASPECT_RATIO &&
        this.subtreePlacerItem !== SubtreePlacer.COMPACT
      )
    }
  },

  /** @type {boolean} */
  allowMultiParentsItem: false,

  /** @type {boolean} */
  shouldDisableAllowMultiParentsItem: <any>{
    get: function (): boolean {
      return (
        this.subtreePlacerItem !== SubtreePlacer.SINGLE_LAYER &&
        this.subtreePlacerItem !== SubtreePlacer.DENDROGRAM &&
        this.subtreePlacerItem !== SubtreePlacer.BUS &&
        this.subtreePlacerItem !== SubtreePlacer.LEFT_RIGHT
      )
    }
  },

  /** @type {RoutingStyle} */
  routingStyleForNonTreeEdgesItem: null,

  /** @type {number} */
  edgeBundlingStrengthItem: 1.0,

  /** @type {boolean} */
  shouldDisableEdgeBundlingStrengthItem: <any>{
    get: function (): boolean {
      return this.routingStyleForNonTreeEdgesItem !== RoutingStyle.BUNDLED
    }
  },

  /** @type {TreeLayoutPortAssignmentMode} */
  portAssignmentItem: null,

  /**
   * @type {EdgeLabelPlacement}
   */
  $edgeLabelingItem: null,

  /** @type {EdgeLabelPlacement} */
  edgeLabelingItem: <any>{
    get: function (): EdgeLabelPlacement {
      return this.$edgeLabelingItem
    },
    set: function (value: EdgeLabelPlacement) {
      this.$edgeLabelingItem = value
      this.labelPlacementOrientationItem =
        value === EdgeLabelPlacement.INTEGRATED
          ? LabelPlacementOrientation.PARALLEL
          : LabelPlacementOrientation.HORIZONTAL
      this.labelPlacementAlongEdgeItem =
        value === EdgeLabelPlacement.INTEGRATED
          ? LabelPlacementAlongEdge.AT_TARGET
          : LabelPlacementAlongEdge.CENTERED
      this.labelPlacementDistanceItem = value === EdgeLabelPlacement.INTEGRATED ? 0 : 10
    }
  },

  /** @type {boolean} */
  reduceAmbiguityItem: false,

  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: <any>{
    get: function (): boolean {
      return this.edgeLabelingItem !== EdgeLabelPlacement.GENERIC
    }
  },

  /** @type {LabelPlacementOrientation} */
  labelPlacementOrientationItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: <any>{
    get: function (): boolean {
      return this.edgeLabelingItem === EdgeLabelPlacement.IGNORE
    }
  },

  /** @type {LabelPlacementAlongEdge} */
  labelPlacementAlongEdgeItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: <any>{
    get: function (): boolean {
      return this.edgeLabelingItem === EdgeLabelPlacement.IGNORE
    }
  },

  /** @type {LabelPlacementSideOfEdge} */
  labelPlacementSideOfEdgeItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: <any>{
    get: function (): boolean {
      return this.edgeLabelingItem === EdgeLabelPlacement.IGNORE
    }
  },

  /** @type {number} */
  labelPlacementDistanceItem: 0,

  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: <any>{
    get: function (): boolean {
      return (
        this.edgeLabelingItem === EdgeLabelPlacement.IGNORE ||
        this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
      )
    }
  }
})
export default TreeLayoutConfig
