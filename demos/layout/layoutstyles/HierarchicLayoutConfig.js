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
  AsIsLayerer,
  Class,
  ComponentArrangementPolicy,
  Enum,
  FeedbackEdgeSet,
  GenericLabeling,
  GraphComponent,
  GraphMLAttribute,
  GroupAlignmentPolicy,
  GroupCompactionPolicy,
  HashMap,
  HierarchicLayout,
  HierarchicLayoutBusDescriptor,
  HierarchicLayoutData,
  HierarchicLayoutEdgeRoutingStyle,
  HierarchicLayoutLayeringStrategy,
  HierarchicLayoutNodeLayoutDescriptor,
  HierarchicLayoutPortAssignmentMode,
  HierarchicLayoutRoutingStyle,
  HierarchicLayoutSubcomponentDescriptor,
  IArrow,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  INode,
  ITable,
  LayoutData,
  LayoutMode,
  LayoutOrientation,
  LeftRightNodePlacer,
  List,
  LongestPath,
  MapEntry,
  NodeLabelMode,
  OrganicLayout,
  PolylineEdgeStyle,
  RecursiveEdgeStyle,
  SimpleProfitModel,
  SimplexNodePlacer,
  TopLevelGroupToSwimlaneStage,
  TreeLayout,
  YBoolean,
  YNumber,
  YPoint,
  YString
} from 'yfiles'

import LayoutConfiguration, {
  EdgeLabeling,
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge
} from './LayoutConfiguration.js'
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
const HierarchicLayoutConfig = Class('HierarchicLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('HierarchicLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    LayoutConfiguration.call(this)
    this.groupHorizontalCompactionItem = GroupCompactionPolicy.NONE
    this.groupAlignmentItem = GroupAlignmentPolicy.TOP
    this.considerNodeLabelsItem = true
    this.maximumSizeItem = 1000.0
    this.scaleItem = 1.0
    this.componentArrangementPolicyItem = ComponentArrangementPolicy.TOPMOST
    this.nodeCompactionItem = false
    this.rankingPolicyItem = HierarchicLayoutLayeringStrategy.HIERARCHICAL_OPTIMAL
    this.minimumSlopeItem = 0.25
    this.edgeDirectednessItem = true
    this.edgeThicknessItem = true
    this.minimumEdgeDistanceItem = 15.0
    this.minimumEdgeLengthItem = 20.0
    this.minimumLastSegmentLengthItem = 15.0
    this.minimumFirstSegmentLengthItem = 10.0
    this.edgeRoutingItem = HierarchicLayoutEdgeRoutingStyle.ORTHOGONAL
    this.minimumLayerDistanceItem = 10.0
    this.edgeToEdgeDistanceItem = 15.0
    this.nodeToEdgeDistanceItem = 15.0
    this.nodeToNodeDistanceItem = 30.0
    this.symmetricPlacementItem = true
    this.recursiveEdgeStyleItem = RecursiveEdgeStyle.OFF
    this.maximumDurationItem = 5
    this.edgeLabelingItem = EdgeLabeling.NONE
    this.compactEdgeLabelPlacementItem = true
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
    this.groupLayeringStrategyItem = GroupLayeringStrategyOptions.LAYOUT_GROUPS
    this.gridEnabledItem = false
    this.gridSpacingItem = 5
    this.gridPortAssignmentItem = HierarchicLayoutPortAssignmentMode.DEFAULT
    this.orientationItem = LayoutOrientation.TOP_TO_BOTTOM
    this.title = 'Hierarchic Layout'
    this.subComponentsItem = false
    this.highlightCriticalPath = false
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph.mapperRegistry} if necessary.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    const layout = new HierarchicLayout()

    //  mark incremental elements if required
    const fromSketch = this.UseDrawingAsSketchItem
    const incrementalLayout = this.SelectedElementsIncrementallyItem
    const selectedElements =
      graphComponent.selection.selectedEdges.size !== 0 ||
      graphComponent.selection.selectedNodes.size !== 0

    if (incrementalLayout && selectedElements) {
      layout.layoutMode = LayoutMode.INCREMENTAL
    } else if (fromSketch) {
      layout.layoutMode = LayoutMode.INCREMENTAL
    } else {
      layout.layoutMode = LayoutMode.FROM_SCRATCH
    }

    const nodePlacer = layout.nodePlacer
    nodePlacer.barycenterMode = this.symmetricPlacementItem

    layout.componentLayoutEnabled = this.LayoutComponentsSeparatelyItem

    layout.minimumLayerDistance = this.minimumLayerDistanceItem
    layout.nodeToEdgeDistance = this.nodeToEdgeDistanceItem
    layout.nodeToNodeDistance = this.nodeToNodeDistanceItem
    layout.edgeToEdgeDistance = this.edgeToEdgeDistanceItem

    const nld = layout.nodeLayoutDescriptor
    const eld = layout.edgeLayoutDescriptor

    layout.automaticEdgeGrouping = this.automaticEdgeGroupingEnabledItem

    eld.routingStyle = new HierarchicLayoutRoutingStyle(this.edgeRoutingItem)
    eld.routingStyle.curveShortcuts = this.curveShortcutsItem
    eld.routingStyle.curveUTurnSymmetry = this.curveUTurnSymmetryItem
    eld.minimumFirstSegmentLength = this.minimumFirstSegmentLengthItem
    eld.minimumLastSegmentLength = this.minimumLastSegmentLengthItem

    eld.minimumDistance = this.minimumEdgeDistanceItem
    eld.minimumLength = this.minimumEdgeLengthItem

    eld.minimumSlope = this.minimumSlopeItem

    eld.sourcePortOptimization = this.pcOptimizationEnabledItem
    eld.targetPortOptimization = this.pcOptimizationEnabledItem

    eld.recursiveEdgeStyle = this.recursiveEdgeStyleItem

    nld.minimumDistance = Math.min(layout.nodeToNodeDistance, layout.nodeToEdgeDistance)
    nld.minimumLayerHeight = 0
    nld.layerAlignment = this.layerAlignmentItem

    layout.layoutOrientation = this.orientationItem

    if (this.considerNodeLabelsItem) {
      layout.considerNodeLabels = true
      layout.nodeLayoutDescriptor.nodeLabelMode = NodeLabelMode.CONSIDER_FOR_DRAWING
    } else {
      layout.considerNodeLabels = false
    }

    if (this.edgeLabelingItem !== EdgeLabeling.NONE) {
      if (this.edgeLabelingItem === EdgeLabeling.GENERIC) {
        layout.integratedEdgeLabeling = false

        const labeling = new GenericLabeling()
        labeling.placeEdgeLabels = true
        labeling.placeNodeLabels = false
        labeling.autoFlipping = true
        labeling.reduceAmbiguity = this.reduceAmbiguityItem
        labeling.profitModel = new SimpleProfitModel()
        layout.labelingEnabled = true
        layout.labeling = labeling
      } else if (this.edgeLabelingItem === EdgeLabeling.INTEGRATED) {
        layout.integratedEdgeLabeling = true
        nodePlacer.labelCompaction = this.compactEdgeLabelPlacementItem
      }
    } else {
      layout.integratedEdgeLabeling = false
    }

    layout.fromScratchLayeringStrategy = this.rankingPolicyItem
    layout.componentArrangementPolicy = this.componentArrangementPolicyItem
    nodePlacer.nodeCompaction = this.nodeCompactionItem
    nodePlacer.straightenEdges = this.straightenEdgesItem

    // configure AsIsLayerer
    const layerer =
      layout.layoutMode === LayoutMode.FROM_SCRATCH
        ? layout.fromScratchLayerer
        : layout.fixedElementsLayerer
    if (layerer instanceof AsIsLayerer) {
      layerer.nodeHalo = this.haloItem
      layerer.nodeScalingFactor = this.scaleItem
      layerer.minimumNodeSize = this.minimumSizeItem
      layerer.maximumNodeSize = this.maximumSizeItem
    }

    // configure grouping
    nodePlacer.groupCompactionStrategy = this.groupHorizontalCompactionItem

    if (
      !fromSketch &&
      this.groupLayeringStrategyItem === GroupLayeringStrategyOptions.LAYOUT_GROUPS
    ) {
      layout.groupAlignmentPolicy = this.groupAlignmentItem
      layout.compactGroups = this.groupEnableCompactionItem
      layout.recursiveGroupLayering = true
    } else {
      layout.recursiveGroupLayering = false
    }

    // append the stage only if the graph does not already contain table nodes
    if (this.treatRootGroupAsSwimlanesItem && !this.containsTable(graphComponent.graph)) {
      const stage = new TopLevelGroupToSwimlaneStage()
      stage.orderSwimlanesFromSketch = this.useOrderFromSketchItem
      stage.spacing = this.swimlineSpacingItem
      layout.appendStage(stage)
    }

    layout.backLoopRouting = this.backloopRoutingItem
    layout.backLoopRoutingForSelfLoops = this.backloopRoutingForSelfLoopsItem
    layout.maximumDuration = this.maximumDurationItem * 1000

    if (this.gridEnabledItem) {
      layout.gridSpacing = this.gridSpacingItem
    }

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const graph = graphComponent.graph
    const layoutData = new HierarchicLayoutData()

    const incrementalLayout = this.SelectedElementsIncrementallyItem
    const selectedElements =
      graphComponent.selection.selectedEdges.size !== 0 ||
      graphComponent.selection.selectedNodes.size !== 0

    if (incrementalLayout && selectedElements) {
      // configure the mode
      const ihf = layout.createIncrementalHintsFactory()
      layoutData.incrementalHints.delegate = item => {
        // Return the correct hint type for each model item that appears in one of these sets
        if (INode.isInstance(item) && graphComponent.selection.isSelected(item)) {
          return ihf.createLayerIncrementallyHint(item)
        }
        if (IEdge.isInstance(item) && graphComponent.selection.isSelected(item)) {
          return ihf.createSequenceIncrementallyHint(item)
        }
        return null
      }
    }

    if (this.rankingPolicyItem === HierarchicLayoutLayeringStrategy.BFS) {
      layoutData.bfsLayererCoreNodes.delegate = node => graphComponent.selection.isSelected(node)
    }

    if (this.gridEnabledItem) {
      const nld = layout.nodeLayoutDescriptor
      layoutData.nodeLayoutDescriptors.delegate = node =>
        new HierarchicLayoutNodeLayoutDescriptor({
          layerAlignment: nld.layerAlignment,
          minimumDistance: nld.minimumDistance,
          minimumLayerHeight: nld.minimumLayerHeight,
          nodeLabelMode: nld.nodeLabelMode,
          // anchor nodes on grid according to their alignment within the layer
          gridReference: new YPoint(0.0, (nld.layerAlignment - 0.5) * node.layout.height),
          portAssignment: this.gridPortAssignmentItem
        })
    }

    if (this.edgeDirectednessItem) {
      layoutData.edgeDirectedness.delegate = edge => {
        const style = edge.style
        if (
          style instanceof PolylineEdgeStyle &&
          style.targetArrow &&
          style.targetArrow !== IArrow.NONE
        ) {
          return 1
        } else {
          return 0
        }
      }
    }

    if (this.edgeThicknessItem) {
      layoutData.edgeThickness.delegate = edge => {
        const style = edge.style
        if (style instanceof PolylineEdgeStyle) {
          return style.stroke.thickness
        }
        return 0
      }
    }

    if (this.subComponentsItem) {
      // layout all siblings with label 'TL' separately with tree layout
      const treeLayout = new TreeLayout()
      treeLayout.defaultNodePlacer = new LeftRightNodePlacer()
      for (const listOfNodes of this.findSubComponents(graph, 'TL')) {
        layoutData.subcomponents.add(new HierarchicLayoutSubcomponentDescriptor(treeLayout)).items =
          listOfNodes
      }
      // layout all siblings with label 'HL' separately with hierarchical layout
      const hierarchicLayout = new HierarchicLayout()
      hierarchicLayout.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
      for (const listOfNodes of this.findSubComponents(graph, 'HL')) {
        layoutData.subcomponents.add(
          new HierarchicLayoutSubcomponentDescriptor(hierarchicLayout)
        ).items = listOfNodes
      }
      // layout all siblings with label 'OL' separately with organic layout
      const organicLayout = new OrganicLayout()
      organicLayout.preferredEdgeLength = 100
      organicLayout.deterministic = true
      for (const listOfNodes of this.findSubComponents(graph, 'OL')) {
        layoutData.subcomponents.add(
          new HierarchicLayoutSubcomponentDescriptor(organicLayout)
        ).items = listOfNodes
      }
    }

    if (this.highlightCriticalPath) {
      // highlight the longest path in the graph as critical path
      // since the longest path algorithm only works for acyclic graphs,
      // feedback edges and self loops have to be excluded here
      const feedbackEdgeSetResult = new FeedbackEdgeSet().run(graph)
      const longestPath = new LongestPath({
        subgraphEdges: {
          excludes: edge => feedbackEdgeSetResult.feedbackEdgeSet.contains(edge) || edge.isSelfloop
        }
      }).run(graph)
      if (longestPath.edges.size > 0) {
        layoutData.criticalEdgePriorities.delegate = edge => {
          if (longestPath.edges.contains(edge)) {
            return 10
          }
          return 1
        }
      }
    }

    if (this.automaticBusRoutingEnabledItem) {
      const allBusNodes = new Set()
      graph.nodes.forEach(node => {
        if (!graph.isGroupNode(node) && !allBusNodes.has(node)) {
          // search for good opportunities for bus structures rooted at this node
          if (graph.inDegree(node) >= 4) {
            const busDescriptor = new HierarchicLayoutBusDescriptor()
            const busEdges = this.getBusEdges(graph, node, allBusNodes, graph.inEdgesAt(node))
            if (busEdges.length > 0) {
              layoutData.buses.add(busDescriptor).items = busEdges
            }
          }
          if (graph.outDegree(node) >= 4) {
            const busDescriptor = new HierarchicLayoutBusDescriptor()
            const busEdges = this.getBusEdges(graph, node, allBusNodes, graph.outEdgesAt(node))
            if (busEdges.length > 0) {
              layoutData.buses.add(busDescriptor).items = busEdges
            }
          }
        }
      })
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

  getBusEdges: function (graph, node, allBusNodes, edges) {
    if (graph.isGroupNode(node)) {
      // exclude groups for bus structures
      return []
    }

    const busNodes = new Set()
    // count the edges that are not bus edges but connect to the bus nodes
    // -> if there are many, then the bus structure may not look that great
    let interEdgeCount = 0
    const busEdges = []
    const busNodesWithOtherEdges = []
    const node2BusEdge = new Map()
    for (const edge of edges) {
      const other = edge.opposite(node)
      if (!busNodes.has(other)) {
        busNodes.add(other)
        busEdges.push(edge)
        node2BusEdge.set(other, edge)
        const otherEdgesCount = graph.degree(other) - 1
        if (otherEdgesCount > 0) {
          busNodesWithOtherEdges.push(other)
          interEdgeCount += otherEdgesCount
        }
      }
    }

    const finalBusEdges = []
    const removedBusEdges = new Set()
    let busSize = busNodes.size
    while (busSize >= 4) {
      if (interEdgeCount <= busSize * 0.25) {
        // okay accept this as a bus
        for (const edge of busEdges) {
          if (!removedBusEdges.has(edge)) {
            finalBusEdges.push(edge)
            allBusNodes.add(edge.opposite(node))
          }
        }
        break
      } else {
        // this bus has too many other edges remove some if possible
        if (busNodesWithOtherEdges.length > 0) {
          const nodeToRemove = busNodesWithOtherEdges.pop()
          removedBusEdges.add(node2BusEdge.get(nodeToRemove))
          busSize--
          interEdgeCount -= graph.degree(nodeToRemove) - 1
        }
      }
    }

    return finalBusEdges
  },

  /**
   * Determines sub-components by label text and group membership.
   * This is necessary because {@link HierarchicLayout} does not support sub-components with nodes
   * that belong to different parent groups.
   */
  findSubComponents(graph, labelText) {
    const nodeToComponent = new HashMap()
    for (const node of graph.nodes) {
      if (node.labels.size > 0 && node.labels.first().text === labelText) {
        const parent = graph.getParent(node)
        if (!nodeToComponent.has(parent)) {
          nodeToComponent.add(new MapEntry(parent, new List()))
        }
        nodeToComponent.get(parent).add(node)
      }
    }
    return nodeToComponent.values
  },

  /**
   * Checks whether the graph contains a table node.
   * @param graph The input graph
   */
  containsTable(graph) {
    return graph.nodes.find(node => !!node.lookup(ITable.$class)) !== null
  },

  /** @type {boolean} */
  subComponentsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Layout Sub-components Separately',
          '#/api/HierarchicLayoutData#HierarchicLayoutData-property-subComponents'
        ),
        OptionGroupAttribute('GeneralGroup', 45),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /**
   * Enables automatic bus routing.
   */
  enableAutomaticBusRouting: function () {
    this.automaticBusRoutingEnabledItem = true
  },

  /**
   * Enables automatic bus routing.
   */
  enableCurvedRouting: function () {
    this.edgeRoutingItem = HierarchicLayoutEdgeRoutingStyle.CURVED
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
  IncrementalGroup: {
    $meta: function () {
      return [
        LabelAttribute('Incremental Layout'),
        OptionGroupAttribute('GeneralGroup', 70),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  DistanceGroup: {
    $meta: function () {
      return [
        OptionGroupAttribute('GeneralGroup', 60),
        LabelAttribute('Minimum Distances'),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  EdgeSettingsGroup: {
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
  RankGroup: {
    $meta: function () {
      return [
        LabelAttribute('Layers'),
        OptionGroupAttribute('RootGroup', 30),
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

  /** @type {OptionGroup} */
  GroupingGroup: {
    $meta: function () {
      return [
        LabelAttribute('Grouping'),
        OptionGroupAttribute('RootGroup', 50),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  SwimlanesGroup: {
    $meta: function () {
      return [
        LabelAttribute('Swimlanes'),
        OptionGroupAttribute('RootGroup', 60),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  GridGroup: {
    $meta: function () {
      return [
        LabelAttribute('Grid'),
        OptionGroupAttribute('RootGroup', 70),
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
      return "<p style='margin-top:0'>The hierarchical layout style highlights the main direction or flow of a directed graph. It places the nodes of a graph in hierarchically arranged layers such that the (majority of) its edges follows the overall orientation, for example, top-to-bottom.</p><p>This style is tailored for application domains in which it is crucial to clearly visualize the dependency relations between entities. In particular, if such relations form a chain of dependencies between entities, this layout style nicely exhibits them. Generally, whenever the direction of information flow matters, the hierarchical layout style is an invaluable tool.</p><p>Suitable application domains of this layout style include, for example:</p><ul><li>Workflow visualization</li><li>Software engineering like call graph visualization or activity diagrams</li><li>Process modeling</li><li>Database modeling and Entity-Relationship diagrams</li><li>Bioinformatics, for example biochemical pathways</li><li>Network management</li><li>Decision diagrams</li></ul>"
    }
  },

  /** @type {boolean} */
  SelectedElementsIncrementallyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Selected Elements Incrementally',
          '#/api/HierarchicLayout#HierarchicLayout-property-layoutMode'
        ),
        OptionGroupAttribute('IncrementalGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  UseDrawingAsSketchItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Use Drawing as Sketch',
          '#/api/HierarchicLayout#HierarchicLayout-property-layoutMode'
        ),
        OptionGroupAttribute('IncrementalGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {LayoutOrientation} */
  orientationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Orientation',
          '#/api/HierarchicLayout#MultiStageLayout-property-layoutOrientation'
        ),
        GraphMLAttribute().init({ defaultValue: LayoutOrientation.TOP_TO_BOTTOM }),
        OptionGroupAttribute('GeneralGroup', 20),
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

  /** @type {boolean} */
  LayoutComponentsSeparatelyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Layout Components Separately',
          '#/api/HierarchicLayout#MultiStageLayout-property-componentLayoutEnabled'
        ),
        OptionGroupAttribute('GeneralGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  symmetricPlacementItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Symmetric Placement',
          '#/api/SimplexNodePlacer#SimplexNodePlacer-property-barycenterMode'
        ),
        OptionGroupAttribute('GeneralGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  maximumDurationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Maximum Duration',
          '#/api/HierarchicLayout#HierarchicLayout-property-maximumDuration'
        ),
        MinMaxAttribute().init({
          min: 0,
          max: 150
        }),
        OptionGroupAttribute('GeneralGroup', 50),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {number} */
  nodeToNodeDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Node to Node Distance',
          '#/api/HierarchicLayout#HierarchicLayout-property-nodeToNodeDistance'
        ),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        OptionGroupAttribute('DistanceGroup', 10),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {number} */
  nodeToEdgeDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Node to Edge Distance',
          '#/api/HierarchicLayout#HierarchicLayout-property-nodeToEdgeDistance'
        ),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        OptionGroupAttribute('DistanceGroup', 20),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {number} */
  edgeToEdgeDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge to Edge Distance',
          '#/api/HierarchicLayout#HierarchicLayout-property-edgeToEdgeDistance'
        ),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        OptionGroupAttribute('DistanceGroup', 30),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {number} */
  minimumLayerDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Layer to Layer Distance',
          '#/api/HierarchicLayout#HierarchicLayout-property-minimumLayerDistance'
        ),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        OptionGroupAttribute('DistanceGroup', 40),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {HierarchicLayoutEdgeRoutingStyle} */
  edgeRoutingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Routing Style',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-routingStyle'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Octilinear', HierarchicLayoutEdgeRoutingStyle.OCTILINEAR],
            ['Orthogonal', HierarchicLayoutEdgeRoutingStyle.ORTHOGONAL],
            ['Polyline', HierarchicLayoutEdgeRoutingStyle.POLYLINE],
            ['Curved', HierarchicLayoutEdgeRoutingStyle.CURVED]
          ]
        }),
        TypeAttribute(HierarchicLayoutEdgeRoutingStyle.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  backloopRoutingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Backloop Routing',
          '#/api/HierarchicLayout#HierarchicLayout-property-backLoopRouting'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  backloopRoutingForSelfLoopsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Backloop Routing For Self-loops',
          '#/api/HierarchicLayout#HierarchicLayout-property-backLoopRoutingForSelfLoops'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableBackloopRoutingForSelfLoopsItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return !this.backloopRoutingItem
    }
  },

  /** @type {boolean} */
  automaticEdgeGroupingEnabledItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Automatic Edge Grouping',
          '#/api/HierarchicLayout#HierarchicLayout-property-automaticEdgeGrouping'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  automaticBusRoutingEnabledItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Automatic Bus Routing',
          '#/api/HierarchicLayoutData#HierarchicLayoutData-property-buses'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 45),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  highlightCriticalPath: {
    $meta: function () {
      return [
        LabelAttribute(
          'Highlight Critical Path',
          '#/api/HierarchicLayoutData#HierarchicLayoutData-property-criticalEdgePriorities'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 50),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  minimumFirstSegmentLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum First Segment Length',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumFirstSegmentLength'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 60),
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

  /** @type {number} */
  minimumLastSegmentLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Last Segment Length',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLastSegmentLength'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 70),
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

  /** @type {number} */
  minimumEdgeLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Edge Length',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLength'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 80),
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

  /** @type {number} */
  minimumEdgeDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Edge Distance',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumDistance'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 90),
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

  /** @type {number} */
  minimumSlopeItem: {
    $meta: function () {
      return [
        MinMaxAttribute().init({
          min: 0.0,
          max: 5.0,
          step: 0.01
        }),
        LabelAttribute(
          'Minimum Slope',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumSlope'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 100),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableMinimumSlopeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.edgeRoutingItem !== HierarchicLayoutEdgeRoutingStyle.POLYLINE &&
        this.edgeRoutingItem !== HierarchicLayoutEdgeRoutingStyle.CURVED
      )
    }
  },

  /** @type {boolean} */
  edgeDirectednessItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('EdgeSettingsGroup', 110),
        LabelAttribute(
          'Arrows Define Edge Direction',
          '#/api/HierarchicLayoutData#HierarchicLayoutData-property-edgeDirectedness'
        ),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  edgeThicknessItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('EdgeSettingsGroup', 120),
        LabelAttribute(
          'Consider Edge Thickness',
          '#/api/HierarchicLayoutData#HierarchicLayoutData-property-edgeThickness'
        ),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  pcOptimizationEnabledItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Port Constraint Optimization',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-sourcePortOptimization'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 130),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  straightenEdgesItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Straighten Edges',
          '#/api/SimplexNodePlacer#SimplexNodePlacer-property-straightenEdges'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 140),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableStraightenEdgesItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.symmetricPlacementItem
    }
  },

  /** @type {ComponentArrangementPolicy} */
  recursiveEdgeStyleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Recursive Edge Routing Style',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-recursiveEdgeStyle'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 150),
        EnumValuesAttribute().init({
          values: [
            ['Off', RecursiveEdgeStyle.OFF],
            ['Directed', RecursiveEdgeStyle.DIRECTED],
            ['Undirected', RecursiveEdgeStyle.UNDIRECTED]
          ]
        }),
        TypeAttribute(ComponentArrangementPolicy.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  curveUTurnSymmetryItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'U-turn Symmetry',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-curveUTurnSymmetry'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 160),
        MinMaxAttribute().init({ min: 0, max: 1, step: 0.1 }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableCurveUTurnSymmetryItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.edgeRoutingItem !== HierarchicLayoutEdgeRoutingStyle.CURVED
    }
  },

  /** @type {boolean} */
  curveShortcutsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Allow Shortcuts',
          '#/api/EdgeRouterEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-curveShortcuts'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 170),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableCurveShortcutsItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.edgeRoutingItem !== HierarchicLayoutEdgeRoutingStyle.CURVED
    }
  },

  /** @type {HierarchicLayoutLayeringStrategy} */
  rankingPolicyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Layer Assignment Policy',
          '#/api/HierarchicLayout#HierarchicLayout-property-fromScratchLayeringStrategy'
        ),
        OptionGroupAttribute('RankGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Hierarchical - Optimal', HierarchicLayoutLayeringStrategy.HIERARCHICAL_OPTIMAL],
            [
              'Hierarchical - Tight Tree Heuristic',
              HierarchicLayoutLayeringStrategy.HIERARCHICAL_TIGHT_TREE
            ],
            ['BFS Layering', HierarchicLayoutLayeringStrategy.BFS],
            ['From Sketch', HierarchicLayoutLayeringStrategy.FROM_SKETCH],
            ['Hierarchical - Topmost', HierarchicLayoutLayeringStrategy.HIERARCHICAL_TOPMOST]
          ]
        }),
        TypeAttribute(HierarchicLayoutLayeringStrategy.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  layerAlignmentItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Alignment within Layer',
          '#/api/HierarchicLayoutNodeLayoutDescriptor#NodeLayoutDescriptor-property-layerAlignment'
        ),
        OptionGroupAttribute('RankGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Top Border of Nodes', 0],
            ['Center of Nodes', 0.5],
            ['Bottom Border of Nodes', 1]
          ]
        }),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {ComponentArrangementPolicy} */
  componentArrangementPolicyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Component Arrangement',
          '#/api/HierarchicLayout#HierarchicLayout-property-componentArrangementPolicy'
        ),
        OptionGroupAttribute('RankGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Topmost', ComponentArrangementPolicy.TOPMOST],
            ['Compact', ComponentArrangementPolicy.COMPACT]
          ]
        }),
        TypeAttribute(ComponentArrangementPolicy.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  nodeCompactionItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('RankGroup', 40),
        LabelAttribute(
          'Stacked Placement',
          '#/api/SimplexNodePlacer#SimplexNodePlacer-property-nodeCompaction'
        ),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {OptionGroup} */
  SketchGroup: {
    $meta: function () {
      return [
        OptionGroupAttribute('RankGroup', 50),
        LabelAttribute('From Sketch Layer Assignment'),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  scaleItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('SketchGroup', 10),
        MinMaxAttribute().init({
          min: 0.0,
          max: 5.0,
          step: 0.01
        }),
        LabelAttribute('Scale', '#/api/AsIsLayerer#AsIsLayerer-property-nodeScalingFactor'),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /**
   * @type {boolean}
   */
  shouldDisableScaleItem: {
    get: function () {
      return this.rankingPolicyItem !== HierarchicLayoutLayeringStrategy.FROM_SKETCH
    }
  },

  /** @type {number} */
  haloItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('SketchGroup', 20),
        LabelAttribute('Halo', '#/api/AsIsLayerer#AsIsLayerer-property-nodeHalo'),
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

  /**
   * @type {boolean}
   */
  shouldDisableHaloItem: {
    get: function () {
      return this.rankingPolicyItem !== HierarchicLayoutLayeringStrategy.FROM_SKETCH
    }
  },

  /** @type {number} */
  minimumSizeItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('SketchGroup', 30),
        LabelAttribute('Minimum Size', '#/api/AsIsLayerer#AsIsLayerer-property-minimumNodeSize'),
        MinMaxAttribute().init({
          min: 0,
          max: 1000
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /**
   * @type {boolean}
   */
  shouldDisableMinimumSizeItem: {
    get: function () {
      return this.rankingPolicyItem !== HierarchicLayoutLayeringStrategy.FROM_SKETCH
    }
  },

  /** @type {number} */
  maximumSizeItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('SketchGroup', 40),
        LabelAttribute('Maximum Size', '#/api/AsIsLayerer#AsIsLayerer-property-maximumNodeSize'),
        MinMaxAttribute().init({
          min: 0,
          max: 1000
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /**
   * @type {boolean}
   */
  shouldDisableMaximumSizeItem: {
    get: function () {
      return this.rankingPolicyItem !== HierarchicLayoutLayeringStrategy.FROM_SKETCH
    }
  },

  /** @type {boolean} */
  considerNodeLabelsItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('NodePropertiesGroup', 10),
        LabelAttribute(
          'Consider Node Labels',
          '#/api/HierarchicLayout#HierarchicLayout-property-considerNodeLabels'
        ),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {EdgeLabeling} */
  edgeLabelingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Labeling',
          '#/api/HierarchicLayout#MultiStageLayout-property-labelingEnabled'
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
    value: null
  },

  /** @type {boolean} */
  compactEdgeLabelPlacementItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Compact Placement',
          '#/api/SimplexNodePlacer#SimplexNodePlacer-property-labelCompaction'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableCompactEdgeLabelPlacementItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.edgeLabelingItem !== EdgeLabeling.INTEGRATED
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
        OptionGroupAttribute('EdgePropertiesGroup', 40),
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
        LabelAttribute('Orientation', '#/api/PreferredPlacementDescriptor'),
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
  },

  /** @type {GroupLayeringStrategyOptions} */
  groupLayeringStrategyItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('GroupingGroup', 10),
        LabelAttribute(
          'Layering Strategy',
          '#/api/HierarchicLayout#HierarchicLayout-property-recursiveGroupLayering'
        ),
        EnumValuesAttribute().init({
          values: [
            ['Layout Groups', GroupLayeringStrategyOptions.LAYOUT_GROUPS],
            ['Ignore Groups', GroupLayeringStrategyOptions.IGNORE_GROUPS]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /**
   * @type {boolean}
   */
  shouldDisableGroupLayeringStrategyItem: {
    get: function () {
      return this.UseDrawingAsSketchItem
    }
  },

  /** @type {GroupAlignmentPolicy} */
  groupAlignmentItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('GroupingGroup', 20),
        LabelAttribute(
          'Vertical Alignment',
          '#/api/HierarchicLayout#HierarchicLayout-property-groupAlignmentPolicy'
        ),
        EnumValuesAttribute().init({
          values: [
            ['Top', GroupAlignmentPolicy.TOP],
            ['Center', GroupAlignmentPolicy.CENTER],
            ['Bottom', GroupAlignmentPolicy.BOTTOM]
          ]
        }),
        TypeAttribute(GroupAlignmentPolicy.$class)
      ]
    },
    value: 0
  },

  /**
   * @type {boolean}
   */
  shouldDisableGroupAlignmentItem: {
    get: function () {
      return (
        this.groupLayeringStrategyItem !== GroupLayeringStrategyOptions.LAYOUT_GROUPS ||
        this.groupEnableCompactionItem
      )
    }
  },

  /** @type {boolean} */
  groupEnableCompactionItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('GroupingGroup', 30),
        LabelAttribute(
          'Compact Layers',
          '#/api/HierarchicLayout#HierarchicLayout-property-compactGroups'
        ),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /**
   * @type {boolean}
   */
  shouldDisableGroupEnableCompactionItem: {
    get: function () {
      return (
        this.groupLayeringStrategyItem !== GroupLayeringStrategyOptions.LAYOUT_GROUPS ||
        this.UseDrawingAsSketchItem
      )
    }
  },

  /** @type {GroupCompactionPolicy} */
  groupHorizontalCompactionItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('GroupingGroup', 40),
        LabelAttribute(
          'Horizontal Group Compaction',
          '#/api/SimplexNodePlacer#SimplexNodePlacer-property-groupCompactionStrategy'
        ),
        EnumValuesAttribute().init({
          values: [
            ['Weak', GroupCompactionPolicy.NONE],
            ['Strong', GroupCompactionPolicy.MAXIMAL]
          ]
        }),
        TypeAttribute(GroupCompactionPolicy.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  treatRootGroupAsSwimlanesItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('SwimlanesGroup', 10),
        LabelAttribute('Treat Groups as Swimlanes', '#/api/TopLevelGroupToSwimlaneStage'),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  useOrderFromSketchItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('SwimlanesGroup', 20),
        LabelAttribute(
          'Use Sketch for Lane Order',
          '#/api/TopLevelGroupToSwimlaneStage#TopLevelGroupToSwimlaneStage-property-orderSwimlanesFromSketch'
        ),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /**
   * @type {boolean}
   */
  shouldDisableUseOrderFromSketchItem: {
    get: function () {
      return !this.treatRootGroupAsSwimlanesItem
    }
  },

  /** @type {number} */
  swimlineSpacingItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('SwimlanesGroup', 30),
        LabelAttribute(
          'Lane Spacing',
          '#/api/TopLevelGroupToSwimlaneStage#TopLevelGroupToSwimlaneStage-property-spacing'
        ),
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

  /**
   * @type {boolean}
   */
  shouldDisableSwimlineSpacingItem: {
    get: function () {
      return !this.treatRootGroupAsSwimlanesItem
    }
  },

  /** @type {boolean} */
  gridEnabledItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('GridGroup', 10),
        LabelAttribute('Grid', '#/api/HierarchicLayout#HierarchicLayout-property-gridSpacing'),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  gridSpacingItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('GridGroup', 20),
        LabelAttribute(
          'Grid Spacing',
          '#/api/HierarchicLayout#HierarchicLayout-property-gridSpacing'
        ),
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

  /**
   * @type {boolean}
   */
  shouldDisableGridSpacingItem: {
    get: function () {
      return !this.gridEnabledItem
    }
  },

  /** @type {HierarchicLayoutPortAssignmentMode} */
  gridPortAssignmentItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('GridGroup', 30),
        LabelAttribute(
          'Grid Port Style',
          '#/api/HierarchicLayoutNodeLayoutDescriptor#NodeLayoutDescriptor-property-portAssignment'
        ),
        EnumValuesAttribute().init({
          values: [
            ['Default', HierarchicLayoutPortAssignmentMode.DEFAULT],
            ['On Grid', HierarchicLayoutPortAssignmentMode.ON_GRID],
            ['On Subgrid', HierarchicLayoutPortAssignmentMode.ON_SUBGRID]
          ]
        }),
        TypeAttribute(HierarchicLayoutPortAssignmentMode.$class)
      ]
    },
    value: null
  },

  /**
   * @type {boolean}
   */
  shouldDisableGridPortAssignmentItem: {
    get: function () {
      return !this.gridEnabledItem
    }
  }
})
export default HierarchicLayoutConfig

/**
 * @readonly
 * @enum {number}
 */
const GroupLayeringStrategyOptions = {
  LAYOUT_GROUPS: 0,
  IGNORE_GROUPS: 1
}
