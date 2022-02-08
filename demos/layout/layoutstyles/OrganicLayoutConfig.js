/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ChainSubstructureStyle,
  Class,
  ComponentArrangementStyles,
  ComponentLayout,
  CycleSubstructureStyle,
  Enum,
  GenericLabeling,
  GraphComponent,
  GroupNodeMode,
  HideGroupsStage,
  IArrow,
  ILayoutAlgorithm,
  ILayoutStage,
  LayoutData,
  MultiStageLayout,
  OrganicLayout,
  OrganicLayoutClusteringPolicy,
  OrganicLayoutData,
  OrganicLayoutScope,
  OutputRestriction,
  ParallelSubstructureStyle,
  PolylineEdgeStyle,
  StarSubstructureStyle,
  YBoolean,
  YDimension,
  YNumber,
  YString
} from 'yfiles'

import LayoutConfiguration, {
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
import { DemoEdgeStyle } from '../../resources/demo-styles.js'

/**
 * Configuration options for the layout algorithm of the same name.
 */
const OrganicLayoutConfig = Class('OrganicLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('OrganicLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    LayoutConfiguration.call(this)
    const layout = new OrganicLayout()
    this.scopeItem = OrganicLayoutScope.ALL
    this.preferredEdgeLengthItem = layout.preferredEdgeLength
    this.allowNodeOverlapsItem = layout.nodeOverlapsAllowed
    this.minimumNodeDistanceItem = 10
    this.avoidNodeEdgeOverlapsItem = layout.nodeEdgeOverlapAvoided
    this.compactnessItem = layout.compactnessFactor
    this.clusteringPolicy = layout.clusteringPolicy
    this.clusteringQualityItem = layout.clusteringQuality

    this.restrictOutputItem = OutputRestrictions.NONE
    this.rectCageUseViewItem = true
    this.cageXItem = 0.0
    this.cageYItem = 0.0
    this.cageWidthItem = 1000.0
    this.cageHeightItem = 1000.0
    this.arCageUseViewItem = true
    this.cageRatioItem = 1.0

    this.groupLayoutPolicyItem = GroupLayoutPolicy.LAYOUT_GROUPS

    this.qualityTimeRatioItem = layout.qualityTimeRatio
    this.maximumDurationItem = layout.maximumDuration / 1000
    this.activateDeterministicModeItem = true

    this.cycleSubstructureItem = CycleSubstructureStyle.NONE
    this.cycleSubstructureSizeItem = layout.cycleSubstructureSize
    this.chainSubstructureItem = ChainSubstructureStyle.NONE
    this.chainSubstructureSizeItem = layout.chainSubstructureSize
    this.starSubstructureItem = StarSubstructureStyle.NONE
    this.starSubstructureSizeItem = layout.starSubstructureSize
    this.parallelSubstructureItem = ParallelSubstructureStyle.NONE
    this.parallelSubstructureSizeItem = layout.parallelSubstructureSize

    this.considerNodeLabelsItem = layout.considerNodeLabels
    this.edgeLabelingItem = false
    this.labelPlacementAlongEdgeItem = LabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem = LabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
    this.title = 'Organic Layout'
  },

  /**
   * @type {ILayoutStage}
   */
  $preStage: null,

  /**
   * Creates and configures a layout.
   * @param graphComponent The <code>GraphComponent</code> to apply the configuration on.
   * @return The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    const layout = new OrganicLayout()
    layout.preferredEdgeLength = this.preferredEdgeLengthItem
    layout.considerNodeLabels = this.considerNodeLabelsItem
    layout.nodeOverlapsAllowed = this.allowNodeOverlapsItem
    layout.minimumNodeDistance = this.minimumNodeDistanceItem
    layout.scope = this.scopeItem
    layout.compactnessFactor = this.compactnessItem
    layout.considerNodeSizes = true
    layout.clusteringPolicy = this.clusteringPolicyItem
    layout.clusteringQuality = this.clusteringQualityItem
    layout.nodeEdgeOverlapAvoided = this.avoidNodeEdgeOverlapsItem
    layout.deterministic = this.activateDeterministicModeItem
    layout.maximumDuration = 1000 * this.maximumDurationItem
    layout.qualityTimeRatio = this.qualityTimeRatioItem

    if (this.edgeLabelingItem) {
      const genericLabeling = new GenericLabeling()
      genericLabeling.placeEdgeLabels = true
      genericLabeling.placeNodeLabels = false
      genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
      layout.labelingEnabled = true
      layout.labeling = genericLabeling
    }
    layout.componentLayout.style = ComponentArrangementStyles.MULTI_ROWS

    this.configureOutputRestrictions(graphComponent, layout)

    layout.cycleSubstructureStyle = this.cycleSubstructureItem
    layout.cycleSubstructureSize = this.cycleSubstructureSizeItem
    layout.chainSubstructureStyle = this.chainSubstructureItem
    layout.chainSubstructureSize = this.chainSubstructureSizeItem
    layout.starSubstructureStyle = this.starSubstructureItem
    layout.starSubstructureSize = this.starSubstructureSizeItem
    layout.parallelSubstructureStyle = this.parallelSubstructureItem
    layout.parallelSubstructureSize = this.parallelSubstructureSizeItem

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @return The configured layout data.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData = new OrganicLayoutData({
      affectedNodes: graphComponent.selection.selectedNodes
    })

    switch (this.groupLayoutPolicyItem) {
      case GroupLayoutPolicy.IGNORE_GROUPS:
        this.$preStage = new HideGroupsStage()
        layout.prependStage(this.$preStage)
        break
      case GroupLayoutPolicy.LAYOUT_GROUPS:
        // do nothing...
        break
      case GroupLayoutPolicy.FIX_GROUP_BOUNDS:
        layoutData.groupNodeModes.delegate = node => {
          return graphComponent.graph.isGroupNode(node)
            ? GroupNodeMode.FIX_BOUNDS
            : GroupNodeMode.NORMAL
        }
        break
      case GroupLayoutPolicy.FIX_GROUP_CONTENTS:
        layoutData.groupNodeModes.delegate = node => {
          return graphComponent.graph.isGroupNode(node)
            ? GroupNodeMode.FIX_CONTENTS
            : GroupNodeMode.NORMAL
        }
        break
      default:
        this.$preStage = new HideGroupsStage()
        layout.prependStage(this.$preStage)
        break
    }

    if (this.edgeDirectednessItem) {
      layoutData.edgeDirectedness.delegate = edge => {
        if (
          (edge.style instanceof DemoEdgeStyle && edge.style.showTargetArrows) ||
          (edge.style instanceof PolylineEdgeStyle &&
            edge.style.targetArrow &&
            edge.style.targetArrow !== IArrow.NONE)
        ) {
          return 1
        }
        return 0
      }
    }
    if (this.useEdgeGroupingItem) {
      layoutData.sourceGroupIds.constant = 'Group'
      layoutData.targetGroupIds.constant = 'Group'
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

  configureOutputRestrictions: function (graphComponent, layout) {
    let viewInfoIsAvailable = false
    const visibleRect = this.getVisibleRectangle(graphComponent)
    let x = 0
    let y = 0
    let w = 0
    let h = 0
    if (visibleRect !== null) {
      viewInfoIsAvailable = true
      x = visibleRect[0]
      y = visibleRect[1]
      w = visibleRect[2]
      h = visibleRect[3]
    }
    switch (this.restrictOutputItem) {
      case OutputRestrictions.NONE:
        layout.componentLayoutEnabled = true
        layout.outputRestriction = OutputRestriction.NONE
        break
      case OutputRestrictions.OUTPUT_CAGE:
        if (!viewInfoIsAvailable || !this.rectCageUseViewItem) {
          x = this.cageXItem
          y = this.cageYItem
          w = this.cageWidthItem
          h = this.cageHeightItem
        }
        layout.outputRestriction = OutputRestriction.createRectangularCageRestriction(x, y, w, h)
        layout.componentLayoutEnabled = false
        break
      case OutputRestrictions.OUTPUT_AR: {
        const ratio = viewInfoIsAvailable && this.arCageUseViewItem ? w / h : this.cageRatioItem
        layout.outputRestriction = OutputRestriction.createAspectRatioRestriction(ratio)
        layout.componentLayoutEnabled = true
        layout.componentLayout.preferredSize = new YDimension(ratio * 100, 100)
        break
      }
      case OutputRestrictions.OUTPUT_ELLIPTICAL_CAGE:
        if (!viewInfoIsAvailable || !this.rectCageUseViewItem) {
          x = this.cageXItem
          y = this.cageYItem
          w = this.cageWidthItem
          h = this.cageHeightItem
        }
        layout.outputRestriction = OutputRestriction.createEllipticalCageRestriction(x, y, w, h)
        layout.componentLayoutEnabled = false
        break
      default:
        layout.componentLayoutEnabled = true
        layout.outputRestriction = OutputRestriction.NONE
        break
    }
  },

  getVisibleRectangle: function (graphComponent) {
    const visibleRect = [0, 0, 0, 0]
    if (graphComponent !== null) {
      const viewPort = graphComponent.viewport
      visibleRect[0] = viewPort.x
      visibleRect[1] = viewPort.y
      visibleRect[2] = viewPort.width
      visibleRect[3] = viewPort.height
      return visibleRect
    }
    return null
  },

  /** @type {OptionGroup} */
  VisualGroup: {
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
  RestrictionsGroup: {
    $meta: function () {
      return [
        LabelAttribute('Restrictions'),
        OptionGroupAttribute('RootGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  CageGroup: {
    $meta: function () {
      return [
        LabelAttribute('Bounds'),
        OptionGroupAttribute('RestrictionsGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  ARGroup: {
    $meta: function () {
      return [
        LabelAttribute('Aspect Ratio'),
        OptionGroupAttribute('RestrictionsGroup', 30),
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
        OptionGroupAttribute('RootGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  AlgorithmGroup: {
    $meta: function () {
      return [
        LabelAttribute('Algorithm'),
        OptionGroupAttribute('RootGroup', 40),
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
      return "<p style='margin-top:0'>The organic layout style is based on the force-directed layout paradigm. This algorithm simulates physical forces and rearranges the positions of the nodes in such a way that the sum of the forces emitted by the nodes and the edges reaches a (local) minimum.</p><p>This style is well suited for the visualization of highly connected backbone regions with attached peripheral ring or tree structures. In a diagram arranged by this algorithm, these regions of a network can be easily identified.</p><p>The organic layout style is a multi-purpose layout for undirected graphs. It produces clear representations of complex networks and is especially fitted for application domains such as:</p><ul><li>Bioinformatics</li><li>Enterprise networking</li><li>Knowledge representation</li><li>System management</li><li>WWW visualization</li><li>Mesh visualization</li></ul>"
    }
  },

  /** @type {OrganicLayoutScope} */
  scopeItem: {
    $meta: function () {
      return [
        LabelAttribute('Scope', '#/api/OrganicLayout#OrganicLayout-property-scope'),
        OptionGroupAttribute('VisualGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['All', OrganicLayoutScope.ALL],
            ['Selection and Connected Nodes', OrganicLayoutScope.MAINLY_SUBSET],
            ['Selection and Nearby Nodes', OrganicLayoutScope.MAINLY_SUBSET_GEOMETRIC],
            ['Selection', OrganicLayoutScope.SUBSET]
          ]
        }),
        TypeAttribute(OrganicLayoutScope.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  preferredEdgeLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Preferred Edge Length',
          '#/api/OrganicLayout#OrganicLayout-property-preferredEdgeLength'
        ),
        OptionGroupAttribute('VisualGroup', 20),
        MinMaxAttribute().init({
          min: 5,
          max: 500
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  allowNodeOverlapsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Allow Overlapping Nodes',
          '#/api/OrganicLayout#OrganicLayout-property-nodeOverlapsAllowed'
        ),
        OptionGroupAttribute('VisualGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  shouldDisableAllowNodeOverlapsItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.considerNodeLabelsItem
    }
  },

  /** @type {number} */
  minimumNodeDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Node Distance',
          '#/api/OrganicLayout#OrganicLayout-property-minimumNodeDistance'
        ),
        OptionGroupAttribute('VisualGroup', 30),
        MinMaxAttribute().init({
          min: 0.0,
          max: 100.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableMinimumNodeDistanceItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.allowNodeOverlapsItem && !this.considerNodeLabelsItem
    }
  },

  /** @type {boolean} */
  avoidNodeEdgeOverlapsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Avoid Node/Edge Overlaps',
          '#/api/OrganicLayout#OrganicLayout-property-nodeEdgeOverlapAvoided'
        ),
        OptionGroupAttribute('VisualGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  compactnessItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Compactness',
          '#/api/OrganicLayout#OrganicLayout-property-compactnessFactor'
        ),
        OptionGroupAttribute('VisualGroup', 70),
        MinMaxAttribute().init({
          min: 0.0,
          max: 1.0,
          step: 0.1
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  clusteringPolicyItem: {
    $meta: function () {
      return [
        LabelAttribute('Clustering', '#/api/OrganicLayout#OrganicLayout-property-clusteringPolicy'),
        OptionGroupAttribute('VisualGroup', 80),
        EnumValuesAttribute().init({
          values: [
            ['None', OrganicLayoutClusteringPolicy.NONE],
            ['Edge Betweenness', OrganicLayoutClusteringPolicy.EDGE_BETWEENNESS],
            ['Label Propagation', OrganicLayoutClusteringPolicy.LABEL_PROPAGATION],
            ['Louvain Modularity', OrganicLayoutClusteringPolicy.LOUVAIN_MODULARITY]
          ]
        }),
        TypeAttribute(OrganicLayoutClusteringPolicy.$class)
      ]
    },
    value: OrganicLayoutClusteringPolicy.NONE
  },

  /** @type {number} */
  clusteringQualityItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Betweenness Clustering Quality',
          '#/api/OrganicLayout#OrganicLayout-property-clusteringQuality'
        ),
        OptionGroupAttribute('VisualGroup', 90),
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
  shouldDisableClusteringQualityItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.clusteringPolicyItem !== OrganicLayoutClusteringPolicy.EDGE_BETWEENNESS
    }
  },

  /** @type {OutputRestrictions} */
  restrictOutputItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Output Area',
          '#/api/OrganicLayout#OrganicLayout-property-outputRestriction'
        ),
        OptionGroupAttribute('RestrictionsGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Unrestricted', OutputRestrictions.NONE],
            ['Rectangular', OutputRestrictions.OUTPUT_CAGE],
            ['Aspect Ratio', OutputRestrictions.OUTPUT_AR],
            ['Elliptical', OutputRestrictions.OUTPUT_ELLIPTICAL_CAGE]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  shouldDisableCageGroup: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.restrictOutputItem !== OutputRestrictions.OUTPUT_CAGE &&
        this.restrictOutputItem !== OutputRestrictions.OUTPUT_ELLIPTICAL_CAGE
      )
    }
  },

  /** @type {boolean} */
  rectCageUseViewItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Use Visible Area',
          '#/api/OrganicLayout#OrganicLayout-property-outputRestriction'
        ),
        OptionGroupAttribute('CageGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  cageXItem: {
    $meta: function () {
      return [
        LabelAttribute('Top Left X'),
        OptionGroupAttribute('CageGroup', 20),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableCageXItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.rectCageUseViewItem
    }
  },

  /** @type {number} */
  cageYItem: {
    $meta: function () {
      return [
        LabelAttribute('Top Left Y'),
        OptionGroupAttribute('CageGroup', 30),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableCageYItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.rectCageUseViewItem
    }
  },

  /** @type {number} */
  cageWidthItem: {
    $meta: function () {
      return [
        LabelAttribute('Width'),
        OptionGroupAttribute('CageGroup', 40),
        MinMaxAttribute().init({ min: 1, max: 100000 }),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableCageWidthItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.rectCageUseViewItem
    }
  },

  /** @type {number} */
  cageHeightItem: {
    $meta: function () {
      return [
        LabelAttribute('Height'),
        OptionGroupAttribute('CageGroup', 50),
        MinMaxAttribute().init({ min: 1, max: 100000 }),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableCageHeightItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.rectCageUseViewItem
    }
  },

  /** @type {boolean} */
  arCageUseViewItem: {
    $meta: function () {
      return [
        LabelAttribute('Use Ratio of View'),
        OptionGroupAttribute('ARGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  cageRatioItem: {
    $meta: function () {
      return [
        LabelAttribute('Aspect Ratio'),
        OptionGroupAttribute('ARGroup', 20),
        MinMaxAttribute().init({
          min: 0.2,
          max: 5.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  shouldDisableCageRatioItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.arCageUseViewItem
    }
  },

  /** @type {GroupLayoutPolicy} */
  groupLayoutPolicyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Group Layout Policy',
          '#/api/OrganicLayoutData#OrganicLayoutData-property-groupNodeModes'
        ),
        OptionGroupAttribute('GroupingGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Layout Groups', GroupLayoutPolicy.LAYOUT_GROUPS],
            ['Fix Bounds of Groups', GroupLayoutPolicy.FIX_GROUP_BOUNDS],
            ['Fix Contents of Groups', GroupLayoutPolicy.FIX_GROUP_CONTENTS],
            ['Ignore Groups', GroupLayoutPolicy.IGNORE_GROUPS]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  qualityTimeRatioItem: {
    $meta: function () {
      return [
        LabelAttribute('Quality', '#/api/OrganicLayout#OrganicLayout-property-qualityTimeRatio'),
        OptionGroupAttribute('AlgorithmGroup', 10),
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

  /** @type {number} */
  maximumDurationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Maximum Duration (sec)',
          '#/api/OrganicLayout#OrganicLayout-property-maximumDuration'
        ),
        OptionGroupAttribute('AlgorithmGroup', 20),
        MinMaxAttribute().init({
          min: 0,
          max: 150
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  activateDeterministicModeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Deterministic Mode',
          '#/api/OrganicLayout#OrganicLayout-property-deterministic'
        ),
        OptionGroupAttribute('AlgorithmGroup', 30),
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
          '#/api/OrganicLayout#OrganicLayout-property-considerNodeLabels'
        ),
        OptionGroupAttribute('NodePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {CycleSubstructureStyle} */
  cycleSubstructureItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Cycles',
          '#/api/OrganicLayout#OrganicLayout-property-cycleSubstructureStyle'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Ignore', CycleSubstructureStyle.NONE],
            ['Circular', CycleSubstructureStyle.CIRCULAR],
            ['Circular, also within other structures', CycleSubstructureStyle.CIRCULAR_NESTED]
          ]
        }),
        TypeAttribute(CycleSubstructureStyle.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  cycleSubstructureSizeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Cycle Size',
          '#/api/OrganicLayout#OrganicLayout-property-cycleSubstructureSize'
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

  shouldDisableCycleSubstructureSizeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.cycleSubstructureItem === CycleSubstructureStyle.NONE
    }
  },

  /** @type {ChainSubstructureStyle} */
  chainSubstructureItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Chains',
          '#/api/OrganicLayout#OrganicLayout-property-chainSubstructureStyle'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Ignore', ChainSubstructureStyle.NONE],
            ['Rectangular', ChainSubstructureStyle.RECTANGULAR],
            [
              'Rectangular, also within other structures',
              ChainSubstructureStyle.RECTANGULAR_NESTED
            ],
            ['Straight-Line', ChainSubstructureStyle.STRAIGHT_LINE],
            [
              'Straight-Line, also within other structures',
              ChainSubstructureStyle.STRAIGHT_LINE_NESTED
            ]
          ]
        }),
        TypeAttribute(ChainSubstructureStyle.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  chainSubstructureSizeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Chain Size',
          '#/api/OrganicLayout#OrganicLayout-property-chainSubstructureSize'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 25),
        MinMaxAttribute().init({
          min: 4,
          max: 20
        }),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 4
  },

  shouldDisableChainSubstructureSizeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.chainSubstructureItem === ChainSubstructureStyle.NONE
    }
  },

  /** @type {StarSubstructureStyle} */
  starSubstructureItem: {
    $meta: function () {
      return [
        LabelAttribute('Star', '#/api/OrganicLayout#OrganicLayout-property-starSubstructureStyle'),
        OptionGroupAttribute('SubstructureLayoutGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Ignore', StarSubstructureStyle.NONE],
            ['Circular', StarSubstructureStyle.CIRCULAR],
            ['Circular, also within other structures', StarSubstructureStyle.CIRCULAR_NESTED],
            ['Radial', StarSubstructureStyle.RADIAL],
            ['Radial, also within other structures', StarSubstructureStyle.RADIAL_NESTED],
            ['Separated Radial', StarSubstructureStyle.SEPARATED_RADIAL]
          ]
        }),
        TypeAttribute(StarSubstructureStyle.$class)
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
          '#/api/OrganicLayout#OrganicLayout-property-starSubstructureSize'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 35),
        MinMaxAttribute().init({
          min: 4,
          max: 20
        }),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 4
  },

  shouldDisableStarSubstructureSizeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.starSubstructureItem === StarSubstructureStyle.NONE
    }
  },

  /** @type {ParallelSubstructureStyle  } */
  parallelSubstructureItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Parallel',
          '#/api/OrganicLayout#OrganicLayout-property-parallelSubstructureStyle'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 40),
        EnumValuesAttribute().init({
          values: [
            ['Ignore', ParallelSubstructureStyle.NONE],
            ['Radial', ParallelSubstructureStyle.RADIAL],
            ['Rectangular', ParallelSubstructureStyle.RECTANGULAR],
            ['Straight-Line', ParallelSubstructureStyle.STRAIGHT_LINE]
          ]
        }),
        TypeAttribute(ParallelSubstructureStyle.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  parallelSubstructureSizeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum size for parallel structures',
          '#/api/OrganicLayout#OrganicLayout-property-parallelSubstructureSize'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 45),
        MinMaxAttribute().init({
          min: 3,
          max: 20
        }),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 3
  },

  shouldDisableParallelSubstructureSizeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.parallelSubstructureItem === ParallelSubstructureStyle.NONE
    }
  },

  /** @type {boolean} */
  edgeDirectednessItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Arrows Define Edge Direction',
          '#/api/OrganicLayoutData#OrganicLayoutData-property-edgeDirectedness'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 50),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  useEdgeGroupingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Use Edge Grouping',
          '#/api/OrganicLayoutData#OrganicLayoutData-property-sourceGroupIds'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  edgeLabelingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Labeling',
          '#/api/OrganicLayout#MultiStageLayout-property-labelingEnabled'
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
  shouldDisableReduceAmbiguityItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
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
  shouldDisableLabelPlacementOrientationItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
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
  shouldDisableLabelPlacementAlongEdgeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
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
  shouldDisableLabelPlacementSideOfEdgeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
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
  shouldDisableLabelPlacementDistanceItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        !this.edgeLabelingItem ||
        this.labelPlacementSideOfEdgeItem === LabelPlacementSideOfEdge.ON_EDGE
      )
    }
  }
})
export default OrganicLayoutConfig

export /**
 * @readonly
 * @enum {number}
 */
const OutputRestrictions = {
  NONE: 0,
  OUTPUT_CAGE: 1,
  OUTPUT_AR: 2,
  OUTPUT_ELLIPTICAL_CAGE: 3
}

export /**
 * @readonly
 * @enum {number}
 */
const GroupLayoutPolicy = {
  LAYOUT_GROUPS: 0,
  FIX_GROUP_BOUNDS: 1,
  FIX_GROUP_CONTENTS: 2,
  IGNORE_GROUPS: 3
}
