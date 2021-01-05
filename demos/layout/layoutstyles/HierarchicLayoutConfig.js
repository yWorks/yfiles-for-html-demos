/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EnumDefinition,
  GenericLabeling,
  GraphComponent,
  GraphMLAttribute,
  GroupAlignmentPolicy,
  GroupCompactionPolicy,
  HierarchicLayout,
  HierarchicLayoutBusDescriptor,
  HierarchicLayoutData,
  HierarchicLayoutEdgeRoutingStyle,
  HierarchicLayoutLayeringStrategy,
  HierarchicLayoutNodeLayoutDescriptor,
  HierarchicLayoutPortAssignmentMode,
  HierarchicLayoutRoutingStyle,
  IArrow,
  IEdge,
  INode,
  LayoutMode,
  LayoutOrientation,
  LeftRightNodePlacer,
  NodeLabelMode,
  OrganicLayout,
  PolylineEdgeStyle,
  RecursiveEdgeStyle,
  SimpleProfitModel,
  TopLevelGroupToSwimlaneStage,
  TreeLayout,
  YBoolean,
  YNumber,
  YPoint,
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
    this.edgeLabelingItem = HierarchicLayoutConfig.EnumEdgeLabeling.NONE
    this.compactEdgeLabelPlacementItem = true
    this.labelPlacementAlongEdgeItem = LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem =
      LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
    this.groupLayeringStrategyItem =
      HierarchicLayoutConfig.GroupLayeringStrategyOptions.LAYOUT_GROUPS
    this.gridEnabledItem = false
    this.gridSpacingItem = 5
    this.gridPortAssignmentItem = HierarchicLayoutPortAssignmentMode.DEFAULT
    this.orientationItem = LayoutOrientation.TOP_TO_BOTTOM
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout algorithm.
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

    layout.nodePlacer.barycenterMode = this.symmetricPlacementItem

    layout.componentLayoutEnabled = this.LayoutComponentsSeparatelyItem

    layout.minimumLayerDistance = this.minimumLayerDistanceItem
    layout.nodeToEdgeDistance = this.nodeToEdgeDistanceItem
    layout.nodeToNodeDistance = this.nodeToNodeDistanceItem
    layout.edgeToEdgeDistance = this.edgeToEdgeDistanceItem

    const nld = layout.nodeLayoutDescriptor
    const eld = layout.edgeLayoutDescriptor

    layout.automaticEdgeGrouping = this.automaticEdgeGroupingEnabledItem

    eld.routingStyle = new HierarchicLayoutRoutingStyle(this.edgeRoutingItem)
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

    layout.orientationLayout.orientation = this.orientationItem

    if (this.considerNodeLabelsItem) {
      layout.considerNodeLabels = true
      layout.nodeLayoutDescriptor.nodeLabelMode = NodeLabelMode.CONSIDER_FOR_DRAWING
    } else {
      layout.considerNodeLabels = false
    }

    if (this.edgeLabelingItem !== HierarchicLayoutConfig.EnumEdgeLabeling.NONE) {
      if (this.edgeLabelingItem === HierarchicLayoutConfig.EnumEdgeLabeling.GENERIC) {
        layout.integratedEdgeLabeling = false

        const labeling = new GenericLabeling()
        labeling.placeEdgeLabels = true
        labeling.placeNodeLabels = false
        labeling.autoFlipping = true
        labeling.reduceAmbiguity = this.reduceAmbiguityItem
        labeling.profitModel = new SimpleProfitModel()
        layout.labelingEnabled = true
        layout.labeling = labeling
      } else if (this.edgeLabelingItem === HierarchicLayoutConfig.EnumEdgeLabeling.INTEGRATED) {
        layout.integratedEdgeLabeling = true
        layout.nodePlacer.labelCompaction = this.compactEdgeLabelPlacementItem
      }
    } else {
      layout.integratedEdgeLabeling = false
    }

    layout.fromScratchLayeringStrategy = this.rankingPolicyItem
    layout.componentArrangementPolicy = this.componentArrangementPolicyItem
    layout.nodePlacer.nodeCompaction = this.nodeCompactionItem
    layout.nodePlacer.straightenEdges = this.straightenEdgesItem

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
    layout.nodePlacer.groupCompactionStrategy = this.groupHorizontalCompactionItem

    if (
      !fromSketch &&
      this.groupLayeringStrategyItem ===
        HierarchicLayoutConfig.GroupLayeringStrategyOptions.LAYOUT_GROUPS
    ) {
      layout.groupAlignmentPolicy = this.groupAlignmentItem
      layout.compactGroups = this.groupEnableCompactionItem
      layout.recursiveGroupLayering = true
    } else {
      layout.recursiveGroupLayering = false
    }

    if (this.treatRootGroupAsSwimlanesItem) {
      const stage = new TopLevelGroupToSwimlaneStage()
      stage.orderSwimlanesFromSketch = this.useOrderFromSketchItem
      stage.spacing = this.swimlineSpacingItem
      layout.appendStage(stage)
    }

    layout.backLoopRouting = this.backloopRoutingItem
    layout.backLoopRoutingForSelfLoops = this.backloopRoutingForSelfLoopsItem
    layout.maximumDuration = this.maximumDurationItem * 1000

    LayoutConfiguration.addPreferredPlacementDescriptor(
      graphComponent.graph,
      this.labelPlacementAlongEdgeItem,
      this.labelPlacementSideOfEdgeItem,
      this.labelPlacementOrientationItem,
      this.labelPlacementDistanceItem
    )

    if (this.gridEnabledItem) {
      layout.gridSpacing = this.gridSpacingItem
    }

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @return {LayoutData} The configured layout data.
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
      layoutData.incrementalHints = item => {
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
      layoutData.bfsLayererCoreNodes = node => graphComponent.selection.isSelected(node)
    }

    if (this.gridEnabledItem) {
      const nld = layout.nodeLayoutDescriptor
      layoutData.nodeLayoutDescriptors = node =>
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
      layoutData.edgeDirectedness = edge => {
        if (
          edge.style.showTargetArrows ||
          (edge.style.targetArrow && edge.style.targetArrow !== IArrow.NONE)
        ) {
          return 1
        }
        return 0
      }
    }

    if (this.edgeThicknessItem) {
      layoutData.edgeThickness = edge => {
        const style = edge.style
        if (style instanceof PolylineEdgeStyle) {
          return style.stroke.thickness
        }
        return 0
      }
    }

    if (this.subComponentsItem) {
      const treeLayout = new TreeLayout()
      treeLayout.defaultNodePlacer = new LeftRightNodePlacer()
      layoutData.subComponents.add(treeLayout).delegate = node =>
        node.labels.size > 0 && node.labels.first().text === 'TL'
      const hierarchicLayout = new HierarchicLayout()
      hierarchicLayout.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
      layoutData.subComponents.add(hierarchicLayout).delegate = node =>
        node.labels.size > 0 && node.labels.first().text === 'HL'
      const organicLayout = new OrganicLayout()
      organicLayout.preferredEdgeLength = 100
      organicLayout.deterministic = true
      layoutData.subComponents.add(organicLayout).delegate = node =>
        node.labels.size > 0 && node.labels.first().text === 'OL'
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

    return layoutData
  },

  getBusEdges: function (graph, node, allBusNodes, edges) {
    const busNodes = new Set()
    // count the edges that are not bus edges but connect to the bus nodes
    // -> if there are many, then the bus structure may not look that great
    let interEdgeCount = 0
    const busEdges = []
    const busNodesWithOtherEdges = []
    const node2BusEdge = new Map()
    edges.forEach(edge => {
      const other = edge.opposite(node)
      if (graph.isGroupNode(node)) {
        // exclude groups for bus structures
        return
      }
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
    })

    const finalBusEdges = []
    const removedBusEdges = new Set()
    let busSize = busNodes.size
    while (busSize >= 4) {
      if (interEdgeCount <= busSize * 0.25) {
        // okay accept this as a bus
        busEdges.forEach(edge => {
          if (!removedBusEdges.has(edge)) {
            finalBusEdges.push(edge)
            allBusNodes.add(edge.opposite(node))
          }
        })
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
   * Enables different layout styles for possible detected subcomponents.
   */
  enableSubstructures: function () {
    this.subComponentsItem = true
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
  DescriptionGroup: {
    $meta: function () {
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
  InteractionGroup: {
    $meta: function () {
      return [
        LabelAttribute('Interactive Settings'),
        OptionGroupAttribute('GeneralGroup', 10),
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
        OptionGroupAttribute('InteractionGroup', 10),
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
        OptionGroupAttribute('InteractionGroup', 20),
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

  /**
   * Backing field for below property
   * @type {number}
   */
  $nodeToNodeDistanceItem: 0,

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
    get: function () {
      return this.$nodeToNodeDistanceItem
    },
    set: function (value) {
      this.$nodeToNodeDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $nodeToEdgeDistanceItem: 0,

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
    get: function () {
      return this.$nodeToEdgeDistanceItem
    },
    set: function (value) {
      this.$nodeToEdgeDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $edgeToEdgeDistanceItem: 0,

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
    get: function () {
      return this.$edgeToEdgeDistanceItem
    },
    set: function (value) {
      this.$edgeToEdgeDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumLayerDistanceItem: 0,

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
    get: function () {
      return this.$minimumLayerDistanceItem
    },
    set: function (value) {
      this.$minimumLayerDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {HierarchicLayoutEdgeRoutingStyle}
   */
  $edgeRoutingItem: null,

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
    get: function () {
      return this.$edgeRoutingItem
    },
    set: function (value) {
      this.$edgeRoutingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $backloopRoutingItem: false,

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
    get: function () {
      return this.$backloopRoutingItem
    },
    set: function (value) {
      this.$backloopRoutingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $backloopRoutingForSelfLoopsItem: false,

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
    get: function () {
      return this.$backloopRoutingForSelfLoopsItem
    },
    set: function (value) {
      this.$backloopRoutingForSelfLoopsItem = value
    }
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

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $automaticEdgeGroupingEnabledItem: false,

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
    get: function () {
      return this.$automaticEdgeGroupingEnabledItem
    },
    set: function (value) {
      this.$automaticEdgeGroupingEnabledItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $automaticBusRoutingEnabledItem: false,

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
    get: function () {
      return this.$automaticBusRoutingEnabledItem
    },
    set: function (value) {
      this.$automaticBusRoutingEnabledItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumFirstSegmentLengthItem: 0,

  /** @type {number} */
  minimumFirstSegmentLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum First Segment Length',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumFirstSegmentLength'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 50),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$minimumFirstSegmentLengthItem
    },
    set: function (value) {
      this.$minimumFirstSegmentLengthItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumLastSegmentLengthItem: 0,

  /** @type {number} */
  minimumLastSegmentLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Last Segment Length',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLastSegmentLength'
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
    get: function () {
      return this.$minimumLastSegmentLengthItem
    },
    set: function (value) {
      this.$minimumLastSegmentLengthItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumEdgeLengthItem: 0,

  /** @type {number} */
  minimumEdgeLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Edge Length',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLength'
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
    get: function () {
      return this.$minimumEdgeLengthItem
    },
    set: function (value) {
      this.$minimumEdgeLengthItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumEdgeDistanceItem: 0,

  /** @type {number} */
  minimumEdgeDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Edge Distance',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumDistance'
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
    get: function () {
      return this.$minimumEdgeDistanceItem
    },
    set: function (value) {
      this.$minimumEdgeDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumSlopeItem: 0,

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
        OptionGroupAttribute('EdgeSettingsGroup', 90),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$minimumSlopeItem
    },
    set: function (value) {
      this.$minimumSlopeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableMinimumSlopeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.edgeRoutingItem !== HierarchicLayoutEdgeRoutingStyle.POLYLINE
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $edgeDirectednessItem: false,

  /** @type {boolean} */
  edgeDirectednessItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('EdgeSettingsGroup', 100),
        LabelAttribute(
          'Arrows Define Edge Direction',
          '#/api/HierarchicLayoutData#HierarchicLayoutData-property-edgeDirectedness'
        ),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$edgeDirectednessItem
    },
    set: function (value) {
      this.$edgeDirectednessItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $edgeThicknessItem: false,

  /** @type {boolean} */
  edgeThicknessItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('EdgeSettingsGroup', 110),
        LabelAttribute(
          'Consider Edge Thickness',
          '#/api/HierarchicLayoutData#HierarchicLayoutData-property-edgeThickness'
        ),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$edgeThicknessItem
    },
    set: function (value) {
      this.$edgeThicknessItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $pcOptimizationEnabledItem: false,

  /** @type {boolean} */
  pcOptimizationEnabledItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Port Constraint Optimization',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-sourcePortOptimization'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 120),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$pcOptimizationEnabledItem
    },
    set: function (value) {
      this.$pcOptimizationEnabledItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $straightenEdgesItem: false,

  /** @type {boolean} */
  straightenEdgesItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Straighten Edges',
          '#/api/SimplexNodePlacer#SimplexNodePlacer-property-straightenEdges'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 130),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$straightenEdgesItem
    },
    set: function (value) {
      this.$straightenEdgesItem = value
    }
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

  /**
   * Backing field for below property
   * @type {ComponentArrangementPolicy}
   */
  $recursiveEdgeStyleItem: null,

  /** @type {ComponentArrangementPolicy} */
  recursiveEdgeStyleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Recursive Edge Routing Style',
          '#/api/HierarchicLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-recursiveEdgeStyle'
        ),
        OptionGroupAttribute('EdgeSettingsGroup', 140),
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
    get: function () {
      return this.$recursiveEdgeStyleItem
    },
    set: function (value) {
      this.$recursiveEdgeStyleItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {HierarchicLayoutLayeringStrategy}
   */
  $rankingPolicyItem: null,

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
    get: function () {
      return this.$rankingPolicyItem
    },
    set: function (value) {
      this.$rankingPolicyItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $layerAlignmentItem: 0,

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
    get: function () {
      return this.$layerAlignmentItem
    },
    set: function (value) {
      this.$layerAlignmentItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {ComponentArrangementPolicy}
   */
  $componentArrangementPolicyItem: null,

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
    get: function () {
      return this.$componentArrangementPolicyItem
    },
    set: function (value) {
      this.$componentArrangementPolicyItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $nodeCompactionItem: false,

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
    get: function () {
      return this.$nodeCompactionItem
    },
    set: function (value) {
      this.$nodeCompactionItem = value
    }
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

  /**
   * Backing field for below property
   * @type {number}
   */
  $scaleItem: 0,

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
    get: function () {
      return this.$scaleItem
    },
    set: function (value) {
      this.$scaleItem = value
    }
  },

  /**
   * @type {boolean}
   */
  shouldDisableScaleItem: {
    get: function () {
      return this.rankingPolicyItem !== HierarchicLayoutLayeringStrategy.FROM_SKETCH
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $haloItem: 0,

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
    get: function () {
      return this.$haloItem
    },
    set: function (value) {
      this.$haloItem = value
    }
  },

  /**
   * @type {boolean}
   */
  shouldDisableHaloItem: {
    get: function () {
      return this.rankingPolicyItem !== HierarchicLayoutLayeringStrategy.FROM_SKETCH
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumSizeItem: 0,

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
    get: function () {
      return this.$minimumSizeItem
    },
    set: function (value) {
      this.$minimumSizeItem = value
    }
  },

  /**
   * @type {boolean}
   */
  shouldDisableMinimumSizeItem: {
    get: function () {
      return this.rankingPolicyItem !== HierarchicLayoutLayeringStrategy.FROM_SKETCH
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $maximumSizeItem: 0,

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
    get: function () {
      return this.$maximumSizeItem
    },
    set: function (value) {
      this.$maximumSizeItem = value
    }
  },

  /**
   * @type {boolean}
   */
  shouldDisableMaximumSizeItem: {
    get: function () {
      return this.rankingPolicyItem !== HierarchicLayoutLayeringStrategy.FROM_SKETCH
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $considerNodeLabelsItem: false,

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
    get: function () {
      return this.$considerNodeLabelsItem
    },
    set: function (value) {
      this.$considerNodeLabelsItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {HierarchicLayoutConfig.EnumEdgeLabeling}
   */
  $edgeLabelingItem: null,

  /** @type {HierarchicLayoutConfig.EnumEdgeLabeling} */
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
            ['None', HierarchicLayoutConfig.EnumEdgeLabeling.NONE],
            ['Integrated', HierarchicLayoutConfig.EnumEdgeLabeling.INTEGRATED],
            ['Generic', HierarchicLayoutConfig.EnumEdgeLabeling.GENERIC]
          ]
        }),
        TypeAttribute(HierarchicLayoutConfig.EnumEdgeLabeling.$class)
      ]
    },
    get: function () {
      return this.$edgeLabelingItem
    },
    set: function (value) {
      this.$edgeLabelingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $compactEdgeLabelPlacementItem: false,

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
    get: function () {
      return this.$compactEdgeLabelPlacementItem
    },
    set: function (value) {
      this.$compactEdgeLabelPlacementItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableCompactEdgeLabelPlacementItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.edgeLabelingItem !== HierarchicLayoutConfig.EnumEdgeLabeling.INTEGRATED
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $reduceAmbiguityItem: false,

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
    get: function () {
      return this.$reduceAmbiguityItem
    },
    set: function (value) {
      this.$reduceAmbiguityItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.edgeLabelingItem !== HierarchicLayoutConfig.EnumEdgeLabeling.GENERIC
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutConfiguration.EnumLabelPlacementOrientation}
   */
  $labelPlacementOrientationItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementOrientation} */
  labelPlacementOrientationItem: {
    $meta: function () {
      return [
        LabelAttribute('Orientation', '#/api/PreferredPlacementDescriptor'),
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
    get: function () {
      return this.$labelPlacementOrientationItem
    },
    set: function (value) {
      this.$labelPlacementOrientationItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.edgeLabelingItem === HierarchicLayoutConfig.EnumEdgeLabeling.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutConfiguration.EnumLabelPlacementAlongEdge}
   */
  $labelPlacementAlongEdgeItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementAlongEdge} */
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
    get: function () {
      return this.$labelPlacementAlongEdgeItem
    },
    set: function (value) {
      this.$labelPlacementAlongEdgeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.edgeLabelingItem === HierarchicLayoutConfig.EnumEdgeLabeling.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutConfiguration.EnumLabelPlacementSideOfEdge}
   */
  $labelPlacementSideOfEdgeItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementSideOfEdge} */
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
    get: function () {
      return this.$labelPlacementSideOfEdgeItem
    },
    set: function (value) {
      this.$labelPlacementSideOfEdgeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.edgeLabelingItem === HierarchicLayoutConfig.EnumEdgeLabeling.NONE
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $labelPlacementDistanceItem: 0,

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
    get: function () {
      return this.$labelPlacementDistanceItem
    },
    set: function (value) {
      this.$labelPlacementDistanceItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.edgeLabelingItem === HierarchicLayoutConfig.EnumEdgeLabeling.NONE ||
        this.labelPlacementSideOfEdgeItem ===
          LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
      )
    }
  },

  /**
   * Backing field for below property
   * @type {HierarchicLayoutConfig.GroupLayeringStrategyOptions}
   */
  $groupLayeringStrategyItem: null,

  /** @type {HierarchicLayoutConfig.GroupLayeringStrategyOptions} */
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
            ['Layout Groups', HierarchicLayoutConfig.GroupLayeringStrategyOptions.LAYOUT_GROUPS],
            ['Ignore Groups', HierarchicLayoutConfig.GroupLayeringStrategyOptions.IGNORE_GROUPS]
          ]
        }),
        TypeAttribute(HierarchicLayoutConfig.GroupLayeringStrategyOptions.$class)
      ]
    },
    get: function () {
      return this.$groupLayeringStrategyItem
    },
    set: function (value) {
      this.$groupLayeringStrategyItem = value
    }
  },

  /**
   * @type {boolean}
   */
  shouldDisableGroupLayeringStrategyItem: {
    get: function () {
      return this.UseDrawingAsSketchItem
    }
  },

  /**
   * Backing field for below property
   * @type {GroupAlignmentPolicy}
   */
  $groupAlignmentItem: 0,

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
    get: function () {
      return this.$groupAlignmentItem
    },
    set: function (value) {
      this.$groupAlignmentItem = value
    }
  },

  /**
   * @type {boolean}
   */
  shouldDisableGroupAlignmentItem: {
    get: function () {
      return (
        this.groupLayeringStrategyItem !==
          HierarchicLayoutConfig.GroupLayeringStrategyOptions.LAYOUT_GROUPS ||
        this.groupEnableCompactionItem
      )
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $groupEnableCompactionItem: false,

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
    get: function () {
      return this.$groupEnableCompactionItem
    },
    set: function (value) {
      this.$groupEnableCompactionItem = value
    }
  },

  /**
   * @type {boolean}
   */
  shouldDisableGroupEnableCompactionItem: {
    get: function () {
      return (
        this.groupLayeringStrategyItem !==
          HierarchicLayoutConfig.GroupLayeringStrategyOptions.LAYOUT_GROUPS ||
        this.UseDrawingAsSketchItem
      )
    }
  },

  /**
   * Backing field for below property
   * @type {GroupCompactionPolicy}
   */
  $groupHorizontalCompactionItem: null,

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
    get: function () {
      return this.$groupHorizontalCompactionItem
    },
    set: function (value) {
      this.$groupHorizontalCompactionItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $treatRootGroupAsSwimlanesItem: false,

  /** @type {boolean} */
  treatRootGroupAsSwimlanesItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('SwimlanesGroup', 10),
        LabelAttribute('Treat Groups as Swimlanes', '#/api/TopLevelGroupToSwimlaneStage'),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$treatRootGroupAsSwimlanesItem
    },
    set: function (value) {
      this.$treatRootGroupAsSwimlanesItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $useOrderFromSketchItem: false,

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
    get: function () {
      return this.$useOrderFromSketchItem
    },
    set: function (value) {
      this.$useOrderFromSketchItem = value
    }
  },

  /**
   * @type {boolean}
   */
  shouldDisableUseOrderFromSketchItem: {
    get: function () {
      return !this.treatRootGroupAsSwimlanesItem
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $swimlineSpacingItem: 0,

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
    get: function () {
      return this.$swimlineSpacingItem
    },
    set: function (value) {
      this.$swimlineSpacingItem = value
    }
  },

  /**
   * @type {boolean}
   */
  shouldDisableSwimlineSpacingItem: {
    get: function () {
      return !this.treatRootGroupAsSwimlanesItem
    }
  },

  /**
   * @type {boolean}
   */
  shouldHideSwimlineSpacingItem: {
    get: function () {
      return !this.treatRootGroupAsSwimlanesItem
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $gridEnabledItem: false,

  /** @type {boolean} */
  gridEnabledItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('GridGroup', 10),
        LabelAttribute('Grid', '#/api/HierarchicLayout#HierarchicLayout-property-gridSpacing'),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$gridEnabledItem
    },
    set: function (value) {
      this.$gridEnabledItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $gridSpacingItem: 0,

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
    get: function () {
      return this.$gridSpacingItem
    },
    set: function (value) {
      this.$gridSpacingItem = value
    }
  },

  /**
   * @type {boolean}
   */
  shouldDisableGridSpacingItem: {
    get: function () {
      return !this.$gridEnabledItem
    }
  },

  /**
   * Backing field for below property
   * @type {HierarchicLayoutPortAssignmentMode}
   */
  $gridPortAssignmentItem: null,

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
    get: function () {
      return this.$gridPortAssignmentItem
    },
    set: function (value) {
      this.$gridPortAssignmentItem = value
    }
  },

  /**
   * @type {boolean}
   */
  shouldDisableGridPortAssignmentItem: {
    get: function () {
      return !this.$gridEnabledItem
    }
  },

  $static: {
    EnumEdgeLabeling: new EnumDefinition(() => {
      return {
        NONE: 0,
        INTEGRATED: 1,
        GENERIC: 2
      }
    }),

    GroupLayeringStrategyOptions: new EnumDefinition(() => {
      return {
        LAYOUT_GROUPS: 0,
        IGNORE_GROUPS: 1
      }
    })
  }
})
export default HierarchicLayoutConfig
