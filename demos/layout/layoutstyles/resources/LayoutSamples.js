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
  ChainLayoutStyle,
  ChainSubstructureStyle,
  CircularLayoutStyle,
  OrganicLayoutClusteringPolicy,
  ComponentAssignmentStrategy,
  CycleLayoutStyle,
  CycleSubstructureStyle,
  EdgeRouterEdgeRoutingStyle,
  HierarchicLayoutEdgeRoutingStyle,
  OperationType,
  ParallelSubstructureStyle,
  PartialLayoutEdgeRoutingStrategy,
  PartialLayoutOrientation,
  StarSubstructureStyle,
  SubgraphPlacement,
  SubstructureOrientation,
  TreeLayoutStyle
} from 'yfiles'
import { NodeLabelingPolicies } from '../BalloonLayoutConfig.js'
import {
  EdgeLabeling,
  LabelPlacementAlongEdge,
  LabelPlacementOrientation,
  LabelPlacementSideOfEdge
} from '../LayoutConfiguration.js'
import { SubgraphLayouts } from '../PartialLayoutConfig.js'
import { BusMembership, PortSides } from '../PolylineEdgeRouterConfig.js'
import { TreeNodePlacer } from '../TreeLayoutConfig.js'

/**
 * @typedef {Object} LayoutSample
 * @property {string} layout
 * @property {Array.<string>} presets
 * @property {Array.<SampleDiagram>} samples
 */

/**
 * @typedef {Object} SampleDiagram
 * @property {string} sample
 * @property {string} label
 * @property {string} [defaultPreset]
 * @property {Array.<string>} [invalidPresets]
 */

/**
 * @typedef {Object} Separator
 * @property {boolean} separator
 */

/**
 * @typedef {Object} Preset
 * @property {string} description
 * @property {string} label
 * @property {*} settings
 */

/**
 * @param {!(LayoutSample|Separator)} entry
 * @returns {!Separator}
 */
export function isSeparator(entry) {
  return typeof entry.separator !== 'undefined'
}

export const LayoutStyles = [
  {
    layout: 'Hierarchic',
    presets: [
      'default',
      'hierarchic-with-curves',
      'hierarchic-with-buses',
      'hierarchic-incremental',
      'hierarchic-flowchart',
      'hierarchic-with-subcomponents'
    ],
    samples: [
      {
        sample: 'hierarchic',
        label: 'Default',
        defaultPreset: 'default',
        invalidPresets: ['hierarchic-with-subcomponents', 'hierarchic-with-buses']
      },
      {
        sample: 'grouping',
        label: 'Grouping',
        defaultPreset: 'default',
        invalidPresets: ['hierarchic-with-subcomponents', 'hierarchic-with-buses']
      },
      {
        sample: 'hierarchic-with-buses',
        label: 'Bus Structures',
        defaultPreset: 'hierarchic-with-buses',
        invalidPresets: ['hierarchic-with-subcomponents']
      },
      {
        sample: 'hierarchic-with-subcomponents',
        label: 'Sub-Components',
        defaultPreset: 'hierarchic-with-subcomponents'
      },
      {
        sample: 'registration-flowchart',
        label: 'Registration Flowchart',
        defaultPreset: 'hierarchic-flowchart',
        invalidPresets: ['hierarchic-with-buses', 'hierarchic-with-subcomponents']
      },
      {
        sample: 'bpmn-order-table',
        label: 'Order Fulfillment Table',
        defaultPreset: 'default',
        invalidPresets: ['hierarchic-with-buses', 'hierarchic-with-subcomponents']
      },
      {
        sample: 'bpmn-job-posting',
        label: 'BPMN Job Posting',
        defaultPreset: 'hierarchic-incremental',
        invalidPresets: ['hierarchic-with-buses', 'hierarchic-with-subcomponents']
      }
    ]
  },
  {
    layout: 'Organic',
    presets: ['default', 'organic-with-substructures', 'organic-clustered'],
    samples: [
      {
        sample: 'generic-organic',
        label: 'Default',
        defaultPreset: 'default'
      },
      {
        sample: 'mesh',
        label: 'Mesh',
        defaultPreset: 'default',
        invalidPresets: ['organic-with-substructures']
      },
      {
        sample: 'organic-with-substructures',
        label: 'Substructures',
        defaultPreset: 'organic-with-substructures'
      },
      {
        sample: 'computer-network',
        label: 'Computer Network',
        defaultPreset: 'organic-with-substructures'
      }
    ]
  },
  {
    layout: 'Orthogonal',
    presets: ['default', 'orthogonal-with-substructures'],
    samples: [
      {
        sample: 'orthogonal',
        label: 'Default',
        defaultPreset: 'default'
      },
      {
        sample: 'orthogonal-with-substructures',
        label: 'Substructures',
        defaultPreset: 'orthogonal-with-substructures'
      }
    ]
  },
  {
    layout: 'Circular',
    presets: ['default', 'single-cycle-bundled'],
    samples: [
      { sample: 'circular', label: 'Default', defaultPreset: 'default' },
      { sample: 'social-network', label: 'Social Network', defaultPreset: 'single-cycle-bundled' }
    ]
  },
  {
    layout: 'Tree',
    presets: ['default', 'tree-multiparent', 'compact', 'tree-mindmap'],
    samples: [
      {
        sample: 'tree',
        label: 'Default',
        defaultPreset: 'default',
        invalidPresets: ['tree-multiparent']
      },
      {
        sample: 'multi-parent-tree',
        label: 'Multi-parent Tree',
        defaultPreset: 'tree-multiparent'
      },
      {
        sample: 'organization-chart',
        label: 'Organization Chart',
        defaultPreset: 'compact',
        invalidPresets: ['tree-multiparent']
      },
      {
        sample: 'mindmap',
        label: 'Mindmap',
        defaultPreset: 'tree-mindmap',
        invalidPresets: ['tree-multiparent']
      }
    ]
  },
  {
    layout: 'Classic Tree',
    presets: ['default'],
    samples: [
      { sample: 'tree', label: 'Default', defaultPreset: 'default' },
      { sample: 'mindmap', label: 'Mindmap', defaultPreset: 'default' }
    ]
  },
  {
    layout: 'Balloon',
    presets: ['default', 'balloon-with-rays'],
    samples: [
      { sample: 'balloon', label: 'Default', defaultPreset: 'default' },
      {
        sample: 'balloon-with-rays',
        label: 'Ray-like label placement',
        defaultPreset: 'balloon-with-rays'
      },
      { sample: 'mindmap', label: 'Mindmap', defaultPreset: 'default' }
    ]
  },
  {
    layout: 'Radial',
    presets: ['default'],
    samples: [
      { sample: 'airports', label: 'Airports', defaultPreset: 'default' },
      { sample: 'blossom', label: 'Blossom', defaultPreset: 'default' },
      { sample: 'generic-radial', label: 'Generic', defaultPreset: 'default' },
      { sample: 'mindmap', label: 'Mindmap', defaultPreset: 'default' }
    ]
  },
  {
    layout: 'Series-Parallel',
    presets: ['default'],
    samples: [{ sample: 'series-parallel', label: 'Default', defaultPreset: 'default' }]
  },
  {
    layout: 'Components',
    presets: ['default', 'print-format'],
    samples: [
      { sample: 'multiple-components', label: 'Multiple Components', defaultPreset: 'default' },
      { sample: 'uml-package-diagram', label: 'Package Diagram', defaultPreset: 'print-format' }
    ]
  },
  {
    layout: 'Tabular',
    presets: ['default'],
    samples: [{ sample: 'tabular', label: 'Default', defaultPreset: 'default' }]
  },
  { separator: true },
  {
    layout: 'Edge Router',
    presets: [
      'default',
      'edge-router-with-curves',
      'edge-router-single-bus',
      'edge-router-with-buses',
      'edge-router-left-right-flow'
    ],
    samples: [
      {
        sample: 'edge-router',
        label: 'Default',
        defaultPreset: 'default',
        invalidPresets: ['edge-router-with-buses']
      },
      {
        sample: 'edge-router-with-buses',
        label: 'Buses',
        defaultPreset: 'edge-router-with-buses'
      },
      { sample: 'network-plan', label: 'Network Plan', defaultPreset: 'edge-router-with-buses' },
      {
        sample: 'activity-diagram',
        label: 'Activity Diagram',
        defaultPreset: 'edge-router-left-right-flow',
        invalidPresets: ['edge-router-with-buses']
      }
    ]
  },
  {
    layout: 'Bus Router',
    presets: ['default'],
    samples: [{ sample: 'network-plan', label: 'Network Plan', defaultPreset: 'default' }]
  },
  {
    layout: 'Channel Router',
    presets: ['default', 'channel-router-reduce-bends'],
    samples: [
      { sample: 'edge-router', label: 'Default', defaultPreset: 'default' },
      {
        sample: 'network-plan',
        label: 'Network Plan',
        defaultPreset: 'channel-router-reduce-bends'
      },
      {
        sample: 'activity-diagram',
        label: 'Activity Diagram',
        defaultPreset: 'default'
      }
    ]
  },
  {
    layout: 'Organic Router',
    presets: ['default'],
    samples: [
      { sample: 'organic-star', label: 'Organic Star', defaultPreset: 'default' },
      { sample: 'edge-router', label: 'Default', defaultPreset: 'default' }
    ]
  },
  {
    layout: 'Parallel Router',
    presets: ['default'],
    samples: [{ sample: 'edge-router', label: 'Default', defaultPreset: 'default' }]
  },
  { separator: true },
  {
    layout: 'Labeling',
    presets: [
      'default',
      'labeling-both',
      'labeling-nodes',
      'labeling-edges-sides',
      'labeling-edges-parallel'
    ],
    samples: [
      {
        sample: 'node-labels',
        label: 'Metro Map 1',
        defaultPreset: 'labeling-nodes',
        invalidPresets: ['labeling-edges-sides', 'labeling-edges-parallel']
      },
      {
        sample: 'node-and-edge-labels',
        label: 'Metro Map 2',
        defaultPreset: 'labeling-both'
      },
      {
        sample: 'edge-labels',
        label: 'Edge Labels',
        defaultPreset: 'labeling-edges-sides',
        invalidPresets: ['labeling-nodes']
      }
    ]
  },
  {
    layout: 'Partial',
    presets: [
      'default',
      'partial-with-hierarchic',
      'partial-with-organic',
      'partial-with-orthogonal',
      'partial-with-circular'
    ],
    samples: [
      {
        sample: 'partial-with-hierarchic',
        label: 'Partial with Hierarchic',
        defaultPreset: 'partial-with-hierarchic'
      },
      {
        sample: 'partial-with-organic',
        label: 'Partial with Organic',
        defaultPreset: 'partial-with-organic'
      },
      {
        sample: 'partial-with-orthogonal',
        label: 'Partial with Orthogonal',
        defaultPreset: 'partial-with-orthogonal'
      },
      {
        sample: 'partial-with-circular',
        label: 'Partial with Circular',
        defaultPreset: 'partial-with-circular'
      }
    ]
  },
  {
    layout: 'Graph Transform',
    presets: ['default', 'rotate45', 'mirrorY', 'scale3'],
    samples: [
      { sample: 'lattice', label: 'Lattice', defaultPreset: 'rotate45' },
      { sample: 'structured', label: 'Structured', defaultPreset: 'mirrorY' },
      { sample: 'shrunk', label: 'Shrunk', defaultPreset: 'scale3' }
    ]
  }
]

export const Presets = {
  'hierarchic-with-buses': {
    description:
      '<p>Enables the bus structures feature. Bus structures are arranged using a' +
      ' style that results in a more compact layout. Edges to the bus nodes are routed using a' +
      ' shared bus segment that connects to the common root node. In this demo, the buses' +
      ' are automatically determined such that child nodes without further connections form a bus.</p>',
    label: 'Buses',
    settings: {
      automaticBusRoutingEnabledItem: true
    }
  },

  'hierarchic-with-curves': {
    description:
      '<p>Enables curved routing, symmetric u-turns for curves and adjust the minimum slope setting to' +
      ' better fit the curved routing style.</p>',
    label: 'Curves',
    settings: {
      edgeRoutingItem: HierarchicLayoutEdgeRoutingStyle.CURVED,
      curveShortcutsItem: true,
      curveUTurnSymmetryItem: 1.0,
      minimumSlopeItem: 0.1
    }
  },

  'hierarchic-with-subcomponents': {
    description:
      '<p>Enables the sub-component feature which makes it possible to arrange defined' +
      ' subsets of nodes and edges using a different layout algorithm. In this demo, the label' +
      ' text of nodes is considered to derive these sub-components. </p> ' +
      '<ul>' +
      '<li>Nodes with label "HL" are arranged using a hierarchic layout with left-to-right orientation</li>' +
      '<li>Nodes with label "OL" are arranged using organic layout</li>' +
      '<li>Those with label "TL" are handled by a tree layout algorithm.</li' +
      '</ul>',
    label: 'Sub-Components',
    settings: {
      subComponentsItem: true
    }
  },

  'hierarchic-flowchart': {
    description:
      '<p>Suitable settings for a top-to-bottom flowchart with curved edges and integrated edge labeling.' +
      ' To emphasize the longest path through the diagram, nodes on the path are aligned.</p>',
    label: 'Flowchart',
    settings: {
      edgeRoutingItem: HierarchicLayoutEdgeRoutingStyle.CURVED,
      labelPlacementAlongEdgeItem: LabelPlacementAlongEdge.AT_SOURCE,
      edgeLabelingItem: EdgeLabeling.INTEGRATED,
      highlightCriticalPath: true
    }
  },

  'hierarchic-incremental': {
    description:
      '<p>Arranges selected elements while keeping relative positions of elements that are not selected.</p>',
    label: 'Incremental',
    settings: {
      minimumLayerDistanceItem: 30,
      SelectedElementsIncrementallyItem: true,
      UseDrawingAsSketchItem: true
    }
  },

  'organic-with-substructures': {
    description:
      '<p>Enables the substructure features. Chains, cycles, stars and parallel structures are ' +
      'automatically detected and handled in a specific way. This makes it much easier to detect such common ' +
      'structure in the underlying data.</p>',
    label: 'Substructures',
    settings: {
      cycleSubstructureItem: CycleSubstructureStyle.CIRCULAR,
      chainSubstructureItem: ChainSubstructureStyle.STRAIGHT_LINE,
      starSubstructureItem: StarSubstructureStyle.CIRCULAR,
      parallelSubstructureItem: ParallelSubstructureStyle.STRAIGHT_LINE
    }
  },

  'organic-clustered': {
    description:
      '<p>Enables an automatic clustering of nodes and increases the quality settings of' +
      ' the organic layout algorithm.</p>',
    label: 'Clustered',
    settings: {
      maximumDurationItem: 60,
      qualityTimeRatioItem: 1.0,
      clusteringPolicyItem: OrganicLayoutClusteringPolicy.LOUVAIN_MODULARITY
    }
  },

  'orthogonal-with-substructures': {
    description:
      '<p>Enables the substructure features. Chains, cycles and trees are automatically detected and ' +
      'handled in a specific way. This makes it much easier to detect such common structure in the underlying data.</p>',
    label: 'Substructures',
    settings: {
      chainSubstructureStyleItem: ChainLayoutStyle.WRAPPED_WITH_NODES_AT_TURNS,
      chainSubstructureSizeItem: 2,
      cycleSubstructureStyleItem: CycleLayoutStyle.CIRCULAR_WITH_BENDS_AT_CORNERS,
      cycleSubstructureSizeItem: 4,
      treeSubstructureStyleItem: TreeLayoutStyle.INTEGRATED,
      treeSubstructureSizeItem: 3,
      treeSubstructureOrientationItem: SubstructureOrientation.AUTO_DETECT
    }
  },

  'single-cycle-bundled': {
    description:
      '<p>Uses a single-cycle style and edge bundling to bundle together edges and ' +
      'thus increase the readability in diagrams with a large number of connections.</p>',
    label: 'Single-Cycle Bundled',
    settings: {
      layoutStyleItem: CircularLayoutStyle.SINGLE_CYCLE,
      edgeBundlingItem: true
    }
  },

  'partial-with-hierarchic': {
    description: '<p>Incorporate new elements into an hierarchic layout using PartialLayout.</p>',
    label: 'Partial with Hierarchic',
    settings: {
      alignNodesItem: true,
      componentAssignmentStrategyItem: ComponentAssignmentStrategy.CONNECTED,
      minNodeDistItem: 5,
      orientationItem: PartialLayoutOrientation.TOP_TO_BOTTOM,
      routingToSubgraphItem: PartialLayoutEdgeRoutingStrategy.ORTHOGONAL,
      subgraphLayoutItem: SubgraphLayouts.HIERARCHIC,
      subgraphPlacementItem: SubgraphPlacement.BARYCENTER
    }
  },
  'partial-with-organic': {
    description: '<p>Incorporate new elements into an organic layout using PartialLayout.</p>',
    label: 'Partial with Organic',
    settings: {
      alignNodesItem: true,
      componentAssignmentStrategyItem: ComponentAssignmentStrategy.SINGLE,
      minNodeDistItem: 5,
      orientationItem: PartialLayoutOrientation.NONE,
      routingToSubgraphItem: PartialLayoutEdgeRoutingStrategy.STRAIGHTLINE,
      subgraphLayoutItem: SubgraphLayouts.ORGANIC,
      subgraphPlacementItem: SubgraphPlacement.BARYCENTER
    }
  },
  'partial-with-orthogonal': {
    description: '<p>Incorporate new elements into an orthogonal layout using PartialLayout.</p>',
    label: 'Partial with Orthogonal',
    settings: {
      alignNodesItem: true,
      componentAssignmentStrategyItem: ComponentAssignmentStrategy.SINGLE,
      minNodeDistItem: 5,
      orientationItem: PartialLayoutOrientation.NONE,
      routingToSubgraphItem: PartialLayoutEdgeRoutingStrategy.ORTHOGONAL,
      subgraphLayoutItem: SubgraphLayouts.ORTHOGONAL,
      subgraphPlacementItem: SubgraphPlacement.BARYCENTER
    }
  },
  'partial-with-circular': {
    description: '<p>Incorporate new elements into a circular layout using PartialLayout.</p>',
    label: 'Partial with Circular',
    settings: {
      alignNodesItem: false,
      componentAssignmentStrategyItem: ComponentAssignmentStrategy.CONNECTED,
      minNodeDistItem: 5,
      orientationItem: PartialLayoutOrientation.NONE,
      routingToSubgraphItem: PartialLayoutEdgeRoutingStrategy.STRAIGHTLINE,
      subgraphLayoutItem: SubgraphLayouts.CIRCULAR,
      subgraphPlacementItem: SubgraphPlacement.BARYCENTER
    }
  },

  'edge-router-left-right-flow': {
    description:
      '<p>The edges connect at the left or right node side and, futhermore, the algorithm' +
      ' places edge labels using the integrated labeling approach.</p>',
    label: 'Left/Right Ports & Labeling',
    settings: {
      portSidesItem: PortSides.LEFT_RIGHT,
      edgeLabelingItem: EdgeLabeling.INTEGRATED,
      routingStyleItem: EdgeRouterEdgeRoutingStyle.OCTILINEAR
    }
  },

  'edge-router-single-bus': {
    description:
      '<p>All edges are routed on a single, common bus that must consist of ' +
      'only a single backbone segment.</p>',
    label: 'Single Bus',
    settings: {
      busMembershipItem: BusMembership.SINGLE,
      allowMultipleBackboneSegmentsItem: false
    }
  },

  'edge-router-with-buses': {
    description:
      '<p>Enables bus routing and derives the bus membership of an edge from a custom' +
      ' data tag. In this demo, the effect can be observed when choosing the respective' +
      ' "Buses" sample graph. In that sample, the color of the edges reflect the data tag and thus' +
      ' the bus membership of an edge.</p>',
    label: 'Custom Buses',
    settings: {
      busMembershipItem: BusMembership.TAG
    }
  },

  'edge-router-with-curves': {
    description: '<p>Edges are routed as smooth curves.</p>',
    label: 'Curves',
    settings: {
      routingStyleItem: EdgeRouterEdgeRoutingStyle.CURVED
    }
  },

  'channel-router-reduce-bends': {
    description:
      '<p>The algorithm tries to reduce bends at the expense of potentially more edge' +
      ' crossings. Edges are not routed on grid coordinates anymore.</p>',
    label: 'Reduce Bends',
    settings: {
      activateGridRoutingItem: false,
      bendCostItem: 20,
      edgeCrossingCostItem: 1
    }
  },

  'tree-multiparent': {
    description: '<p>Considers multiple parents for tree nodes.</p>',
    label: 'Multi-parent',
    settings: {
      allowMultiParentsItem: true,
      spacingItem: 50
    }
  },

  'tree-mindmap': {
    description:
      '<p>Suitable configuration for a mindmap-like diagram. This preset configures a DelegatingNodePlacer' +
      ' that delegates to two layered placers with different orientations, one arranging the subtree' +
      ' from left to right and the other from right to left.</p>',
    label: 'Mindmap',
    settings: {
      nodePlacerItem: TreeNodePlacer.DELEGATING_LAYERED,
      spacingItem: 50
    }
  },

  scale3: {
    description: '<p>Scales the graph by 3.</p>',
    label: 'Scale x3',
    settings: {
      operationItem: OperationType.SCALE,
      scaleFactorItem: 3
    }
  },

  mirrorY: {
    description: '<p>Mirrors the diagram at the y-axis.</p>',
    label: 'Mirror Vertically',
    settings: {
      operationItem: OperationType.MIRROR_Y_AXIS
    }
  },

  rotate45: {
    description: '<p>Rotates the graph by 45 degrees.</p>',
    label: 'Rotate 45°',
    settings: {
      operationItem: OperationType.ROTATE,
      rotationAngleItem: 45
    }
  },

  'labeling-edges-sides': {
    description:
      '<p>Places the edge labels and configures the PreferredPlacementDescriptor such that ' +
      'they are placed close beside the edge segments (left or right) and horizontal. Ignores node labels.</p>',
    label: 'Edge Labels at Sides',
    settings: {
      placeNodeLabelsItem: false,
      placeEdgeLabelsItem: true,
      labelPlacementDistanceItem: 4,
      labelPlacementSideOfEdgeItem: LabelPlacementSideOfEdge.LEFT_OR_RIGHT
    }
  },

  'labeling-edges-parallel': {
    description:
      '<p>Places the edge labels and configures the PreferredPlacementDescriptor such that ' +
      'labels are placed parallel to the segments. Ignores node labels.</p>',
    label: 'Edge Labels Parallel',
    settings: {
      placeNodeLabelsItem: false,
      placeEdgeLabelsItem: true,
      labelPlacementSideOfEdgeItem: LabelPlacementSideOfEdge.ON_EDGE,
      labelPlacementOrientationItem: LabelPlacementOrientation.PARALLEL,
      labelPlacementAlongEdgeItem: LabelPlacementAlongEdge.ANYWHERE
    }
  },

  'labeling-both': {
    description:
      '<p>Places the node and edge labels and configures the PreferredPlacementDescriptor such that ' +
      'edge labels are placed parallel to the segments</p>',
    label: 'Node & Edge Labels',
    settings: {
      placeNodeLabelsItem: true,
      placeEdgeLabelsItem: true,
      labelPlacementSideOfEdgeItem: LabelPlacementSideOfEdge.LEFT_OR_RIGHT,
      labelPlacementOrientationItem: LabelPlacementOrientation.PARALLEL,
      labelPlacementAlongEdgeItem: LabelPlacementAlongEdge.ANYWHERE
    }
  },

  'labeling-nodes': {
    description:
      '<p>Places the node labels, avoiding overlaps with other elements. Ignores edge labels.</p>',
    label: 'Node Labels',
    settings: {
      placeNodeLabelsItem: true,
      placeEdgeLabelsItem: false
    }
  },

  'balloon-with-rays': {
    description: '<p>Places node label in a ray-like fashion pointing away from the root node.</p>',
    label: 'Ray-like label placement',
    settings: {
      edgeLabelingItem: EdgeLabeling.INTEGRATED,
      nodeLabelingStyleItem: NodeLabelingPolicies.RAYLIKE_LEAVES,
      placeChildrenInterleavedItem: true,
      preferredChildWedgeItem: 100
    }
  },

  'print-format': {
    description:
      '<p>Arranges components in US Letter landscape format that works well for printing.</p>',
    label: 'Print Format',
    settings: {
      aspectRatioItem: 1.3,
      useScreenRatioItem: false
    }
  },

  compact: {
    description:
      '<p>This preset utilizes the compact node placer and places all nodes that are marked with <code>assistant</code> in their tag alongside the main branch as <a href="https://docs.yworks.com/yfileshtml/#/api/TreeLayoutData#TreeLayoutData-property-assistantNodes" target="_blank">assistantNodes</a>.</p>',
    label: 'Compact',
    settings: {
      nodePlacerItem: TreeNodePlacer.COMPACT
    }
  },

  default: {
    description: '<p>Resets the layout settings to their defaults.</p>',
    label: 'Default',
    settings: {}
  }
}
