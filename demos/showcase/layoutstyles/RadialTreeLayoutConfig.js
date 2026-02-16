/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ChildOrderingPolicy,
  Class,
  ComponentArrangementStyle,
  EdgeBundleDescriptor,
  EdgeLabelPlacement,
  EdgeRouter,
  GenericLabeling,
  OrganicEdgeRouter,
  RadialNodeLabelPlacement,
  RadialTreeLayout,
  RadialTreeLayoutData,
  RootSelectionPolicy,
  StraightLineEdgeRouter,
  SubgraphLayoutStage
} from '@yfiles/yfiles'

import {
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge,
  LayoutConfiguration
} from './LayoutConfiguration'
import {
  ComponentAttribute,
  EnumValuesAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from '@yfiles/demo-app/demo-option-editor'

export const RoutingStyle = { ORTHOGONAL: 0, ORGANIC: 1, STRAIGHT_LINE: 2, BUNDLED: 3 }

export const RadialTreeRootNodePolicy = {
  DIRECTED_ROOT: 0,
  CENTER_ROOT: 1,
  WEIGHTED_CENTER_ROOT: 2,
  SELECTED_ROOT: 3
}

/**
 * Configuration options for the layout algorithm of the same name.
 */
export const RadialTreeLayoutConfig = Class('RadialTreeLayoutConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    GeneralGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    LabelingGroup: [
      new LabelAttribute('Labeling'),
      new OptionGroupAttribute('RootGroup', 20),
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
      new ComponentAttribute('html-block'),
      new TypeAttribute(String)
    ],
    rootSelectionPolicyItem: [
      new LabelAttribute(
        'Root Selection Policy',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-rootSelectionPolicy'
      ),
      new OptionGroupAttribute('GeneralGroup', 10),
      new EnumValuesAttribute([
        ['Directed Root', 'directed-root'],
        ['Center Root', 'center-root'],
        ['Weighted Center Root', 'weighted-center-root'],
        ['Selected Root', 'selected-root']
      ]),
      new TypeAttribute(RadialTreeRootNodePolicy)
    ],
    routingStyleForNonTreeEdgesItem: [
      new LabelAttribute(
        'Routing Style for Non-Tree Edges',
        '#/api/TreeReductionStage#TreeReductionStage-property-nonTreeEdgeRouter'
      ),
      new OptionGroupAttribute('GeneralGroup', 20),
      new EnumValuesAttribute([
        ['Orthogonal', 'orthogonal'],
        ['Organic', 'organic'],
        ['Straight-Line', 'straight-line'],
        ['Bundled', 'bundled']
      ]),
      new TypeAttribute(RoutingStyle)
    ],
    actOnSelectionOnlyItem: [
      new LabelAttribute(
        'Act on Selection Only',
        '#/api/SubgraphLayoutStage#LayoutStageBase-property-enabled'
      ),
      new OptionGroupAttribute('GeneralGroup', 30),
      new TypeAttribute(Boolean)
    ],
    edgeBundlingStrengthItem: [
      new LabelAttribute(
        'Bundling Strength',
        '#/api/EdgeBundling#EdgeBundling-property-bundlingStrength'
      ),
      new OptionGroupAttribute('GeneralGroup', 40),
      new MinMaxAttribute(0, 1.0, 0.01),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    preferredChildSectorAngle: [
      new LabelAttribute(
        'Preferred Child Sector Angle',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-preferredChildSectorAngle'
      ),
      new OptionGroupAttribute('GeneralGroup', 50),
      new MinMaxAttribute(1, 359),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    preferredRootSectorAngle: [
      new LabelAttribute(
        'Preferred Root Sector Angle',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-preferredRootSectorAngle'
      ),
      new OptionGroupAttribute('GeneralGroup', 60),
      new MinMaxAttribute(1, 360),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    minimumEdgeLengthItem: [
      new LabelAttribute(
        'Minimum Edge Length',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-minimumEdgeLength'
      ),
      new OptionGroupAttribute('GeneralGroup', 70),
      new MinMaxAttribute(10, 400),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    compactnessFactorItem: [
      new LabelAttribute(
        'Compactness Factor',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-compactnessFactor'
      ),
      new OptionGroupAttribute('GeneralGroup', 80),
      new MinMaxAttribute(0.1, 0.9, 0.01),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    allowOverlapsItem: [
      new LabelAttribute(
        'Allow Overlaps',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-allowOverlaps'
      ),
      new OptionGroupAttribute('GeneralGroup', 90),
      new TypeAttribute(Boolean)
    ],
    childOrderingPolicyItem: [
      new LabelAttribute(
        'Child Ordering Policy',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-childOrderingPolicy'
      ),
      new OptionGroupAttribute('GeneralGroup', 100),
      new EnumValuesAttribute([
        ['Compact', ChildOrderingPolicy.COMPACT],
        ['From Sketch', ChildOrderingPolicy.FROM_SKETCH],
        ['Symmetric', ChildOrderingPolicy.SYMMETRIC]
      ]),
      new TypeAttribute(ChildOrderingPolicy)
    ],
    placeChildrenInterleavedItem: [
      new LabelAttribute(
        'Place Children Interleaved',
        '#/api/RadialTreeLayout#RadialTreeLayoutData-property-interleavedNodes'
      ),
      new OptionGroupAttribute('GeneralGroup', 110),
      new TypeAttribute(Boolean)
    ],
    straightenChainsItem: [
      new LabelAttribute(
        'Straighten Chains',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-chainStraighteningMode'
      ),
      new OptionGroupAttribute('GeneralGroup', 120),
      new TypeAttribute(Boolean)
    ],
    nodeLabelingStyleItem: [
      new LabelAttribute(
        'Node Labeling',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-nodeLabelPlacement'
      ),
      new OptionGroupAttribute('NodePropertiesGroup', 20),
      new EnumValuesAttribute([
        ['Ignore Labels', RadialNodeLabelPlacement.IGNORE],
        ['Consider Labels', RadialNodeLabelPlacement.CONSIDER],
        ['Generic', RadialNodeLabelPlacement.GENERIC],
        ['Horizontal', RadialNodeLabelPlacement.HORIZONTAL],
        ['Ray-like at Leaves', RadialNodeLabelPlacement.RAY_LIKE_LEAVES],
        ['Ray-like', RadialNodeLabelPlacement.RAY_LIKE]
      ]),
      new TypeAttribute(RadialNodeLabelPlacement)
    ],
    edgeLabelingItem: [
      new LabelAttribute(
        'Edge Labeling',
        '#/api/RadialTreeLayout#RadialTreeLayout-property-edgeLabelPlacement'
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
        '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-angle'
      ),
      new OptionGroupAttribute('PreferredPlacementGroup', 10),
      new EnumValuesAttribute([
        ['Parallel', 'parallel'],
        ['Orthogonal', 'orthogonal'],
        ['Horizontal', 'horizontal'],
        ['Vertical', 'vertical']
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
        ['Anywhere', 'anywhere'],
        ['At Source', 'at-source'],
        ['At Source Port', 'at-source-port'],
        ['At Target', 'at-target'],
        ['At Target Port', 'at-target-port'],
        ['Centered', 'centered']
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
        ['Anywhere', 'anywhere'],
        ['On Edge', 'on-edge'],
        ['Left', 'left'],
        ['Right', 'right'],
        ['Left or Right', 'left-or-right']
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
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ]
  },

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)
    const layout = new RadialTreeLayout()

    this.rootSelectionPolicyItem = 'directed-root'
    this.routingStyleForNonTreeEdgesItem = 'orthogonal'
    this.actOnSelectionOnlyItem = false
    this.preferredChildSectorAngle = layout.preferredChildSectorAngle
    this.preferredRootSectorAngle = layout.preferredRootSectorAngle
    this.minimumEdgeLengthItem = layout.minimumEdgeLength
    this.compactnessFactorItem = layout.compactnessFactor
    this.allowOverlapsItem = layout.allowOverlaps
    this.childOrderingPolicyItem = layout.childOrderingPolicy
    this.placeChildrenInterleavedItem = false
    this.straightenChainsItem = layout.chainStraighteningMode

    this.nodeLabelingStyleItem = layout.nodeLabelPlacement
    this.edgeLabelingItem = layout.edgeLabelPlacement
    this.labelPlacementAlongEdgeItem = 'centered'
    this.labelPlacementSideOfEdgeItem = 'on-edge'
    this.labelPlacementOrientationItem = 'horizontal'
    this.labelPlacementDistanceItem = 10.0
    this.title = 'Radial Tree Layout'
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    const layout = new RadialTreeLayout()

    layout.componentLayout.style = ComponentArrangementStyle.MULTI_ROWS
    layout.rootSelectionPolicy = this.getRootNodePolicy(this.rootSelectionPolicyItem)
    layout.preferredChildSectorAngle = this.preferredChildSectorAngle
    layout.preferredRootSectorAngle = this.preferredRootSectorAngle
    layout.minimumEdgeLength = this.minimumEdgeLengthItem
    layout.compactnessFactor = this.compactnessFactorItem
    layout.allowOverlaps = this.allowOverlapsItem
    layout.childOrderingPolicy = this.childOrderingPolicyItem
    layout.chainStraighteningMode = this.straightenChainsItem
    layout.nodeLabelPlacement = this.nodeLabelingStyleItem

    // configures tree reduction state and non-tree edge routing.
    const subgraphLayout = layout.layoutStages.get(SubgraphLayoutStage)
    subgraphLayout.enabled = this.actOnSelectionOnlyItem

    const treeReductionStage = layout.treeReductionStage
    if (this.routingStyleForNonTreeEdgesItem === 'organic') {
      treeReductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()
    } else if (this.routingStyleForNonTreeEdgesItem === 'orthogonal') {
      treeReductionStage.nonTreeEdgeRouter = new EdgeRouter({ rerouting: true })
    } else if (this.routingStyleForNonTreeEdgesItem === 'straight-line') {
      treeReductionStage.nonTreeEdgeRouter = new StraightLineEdgeRouter()
    } else if (this.routingStyleForNonTreeEdgesItem === 'bundled') {
      const ebc = treeReductionStage.edgeBundling
      ebc.bundlingStrength = this.edgeBundlingStrengthItem
      ebc.defaultBundleDescriptor = new EdgeBundleDescriptor({
        bundled: this.routingStyleForNonTreeEdgesItem === 'bundled'
      })
    }

    layout.edgeLabelPlacement = this.edgeLabelingItem
    if (this.edgeLabelingItem === EdgeLabelPlacement.GENERIC && this.reduceAmbiguityItem) {
      const labeling = layout.layoutStages.get(GenericLabeling)
      labeling.defaultEdgeLabelingCosts.ambiguousPlacementCost = 1.0
    }
    if (this.edgeLabelingItem === EdgeLabelPlacement.INTEGRATED) {
      treeReductionStage.nonTreeEdgeLabeling = new GenericLabeling()
    }

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const radialTreeLayoutData = new RadialTreeLayoutData()

    if (this.rootSelectionPolicyItem === 'selected-root') {
      const selection = graphComponent.selection.nodes
      if (selection.size > 0) {
        radialTreeLayoutData.treeRoot.item = selection.first()
      }
    }
    radialTreeLayoutData.interleavedNodes = this.placeChildrenInterleavedItem
      ? () => true
      : () => false

    let resultData = radialTreeLayoutData.combineWith(
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

  getRootNodePolicy(policy) {
    switch (policy) {
      case 'center-root':
        return RootSelectionPolicy.CENTER_ROOT
      case 'weighted-center-root':
        return RootSelectionPolicy.WEIGHTED_CENTER_ROOT
      default:
      case 'selected-root':
      case 'directed-root':
        return RootSelectionPolicy.DIRECTED_ROOT
    }
  },

  /** @type {OptionGroup} */
  GeneralGroup: null,

  /** @type {OptionGroup} */
  LabelingGroup: null,

  /** @type {OptionGroup} */
  NodePropertiesGroup: null,

  /** @type {OptionGroup} */
  EdgePropertiesGroup: null,

  /** @type {OptionGroup} */
  PreferredPlacementGroup: null,

  /** @type {string} */
  descriptionText: {
    get: function () {
      return (
        "<p style='margin-top:0'>The radial tree layout style is a tree layout style that" +
        ' positions the subtrees in a radial fashion around their root nodes. It is ideally' +
        ' suited for larger trees.</p>'
      )
    }
  },

  /** @type {RootSelectionPolicy} */
  rootSelectionPolicyItem: null,

  /** @type {RoutingStyle} */
  routingStyleForNonTreeEdgesItem: null,

  /** @type {boolean} */
  actOnSelectionOnlyItem: false,

  /** @type {number} */
  edgeBundlingStrengthItem: 1.0,

  /** @type {boolean} */
  shouldDisableEdgeBundlingStrengthItem: {
    get: function () {
      return this.routingStyleForNonTreeEdgesItem !== 'bundled'
    }
  },

  /** @type {number} */
  preferredChildSectorAngle: 0,

  /** @type {number} */
  preferredRootSectorAngle: 0,

  /** @type {number} */
  minimumEdgeLengthItem: 0,

  /** @type {number} */
  compactnessFactorItem: 0,

  /** @type {boolean} */
  allowOverlapsItem: false,

  /** @type {ChildOrderingPolicy} */
  childOrderingPolicyItem: null,

  /** @type {boolean} */
  placeChildrenInterleavedItem: false,

  /** @type {boolean} */
  straightenChainsItem: false,

  /** @type {RadialNodeLabelPlacement} */
  nodeLabelingStyleItem: null,

  /**
   * @type {EdgeLabelPlacement}
   */
  $edgeLabelingItem: null,

  /** @type {EdgeLabelPlacement} */
  edgeLabelingItem: {
    get: function () {
      return this.$edgeLabelingItem
    },
    set: function (value) {
      this.$edgeLabelingItem = value
      if (value === EdgeLabelPlacement.INTEGRATED) {
        this.labelPlacementOrientationItem = 'parallel'
        this.labelPlacementAlongEdgeItem = 'at-target'
        this.labelPlacementDistanceItem = 0
      }
    }
  },

  /** @type {boolean} */
  reduceAmbiguityItem: false,

  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: {
    get: function () {
      return this.edgeLabelingItem !== EdgeLabelPlacement.GENERIC
    }
  },

  /** @type {LabelPlacementOrientation} */
  labelPlacementOrientationItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: {
    get: function () {
      return (
        this.edgeLabelingItem === EdgeLabelPlacement.IGNORE ||
        this.edgeLabelingItem === EdgeLabelPlacement.INTEGRATED
      )
    }
  },

  /** @type {LabelPlacementAlongEdge} */
  labelPlacementAlongEdgeItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: {
    get: function () {
      return (
        this.edgeLabelingItem === EdgeLabelPlacement.IGNORE ||
        this.edgeLabelingItem === EdgeLabelPlacement.INTEGRATED
      )
    }
  },

  /** @type {LabelPlacementSideOfEdge} */
  labelPlacementSideOfEdgeItem: null,

  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: {
    get: function () {
      return this.edgeLabelingItem === EdgeLabelPlacement.IGNORE
    }
  },

  /** @type {number} */
  labelPlacementDistanceItem: 0,

  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: {
    get: function () {
      return (
        this.edgeLabelingItem === EdgeLabelPlacement.IGNORE ||
        this.edgeLabelingItem === EdgeLabelPlacement.INTEGRATED ||
        this.labelPlacementSideOfEdgeItem === 'on-edge'
      )
    }
  }
})
