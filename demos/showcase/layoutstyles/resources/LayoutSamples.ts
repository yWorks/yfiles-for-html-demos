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
  CircularLayoutStarSubstructureStyle,
  ComponentAssignmentStrategy,
  EdgeLabelPlacement,
  EdgeRouterRoutingStyle,
  GroupSubstructureStyle,
  HierarchicalLayoutRoutingStyle,
  OrganicLayoutChainSubstructureStyle,
  OrganicLayoutClusteringPolicy,
  OrganicLayoutCycleSubstructureStyle,
  OrganicLayoutGroupSubstructureScope,
  OrganicLayoutParallelSubstructureStyle,
  OrganicLayoutStarSubstructureStyle,
  OrganicLayoutTreeSubstructureStyle,
  OrthogonalLayoutChainSubstructureStyle,
  OrthogonalLayoutCycleSubstructureStyle,
  OrthogonalLayoutTreeSubstructureStyle,
  PartialLayoutOrientation,
  PartialLayoutRoutingStyle,
  RadialLayeringStrategy,
  RadialLayoutRoutingStyle,
  RadialNodeLabelPlacement,
  SubgraphPlacement,
  SubstructureOrientation
} from '@yfiles/yfiles'

export type LayoutSample = { layout: string; presets: string[]; samples: SampleDiagram[] }

export type SampleDiagram = {
  sample: string
  label: string
  defaultPreset?: string
  invalidPresets?: string[]
}

type Separator = { separator: boolean }

export type Preset = { description: string; label: string; settings: any }

export function isSeparator(entry: LayoutSample | Separator): entry is Separator {
  return typeof (entry as Separator).separator !== 'undefined'
}

export const LayoutStyles: (LayoutSample | Separator)[] = [
  {
    layout: 'Hierarchical',
    presets: [
      'default',
      'hierarchical-with-curves',
      'hierarchical-with-buses',
      'hierarchical-incremental',
      'hierarchical-flowchart',
      'hierarchical-with-subcomponents'
    ],
    samples: [
      {
        sample: 'hierarchical',
        label: 'Default',
        defaultPreset: 'default',
        invalidPresets: ['hierarchical-with-subcomponents', 'hierarchical-with-buses']
      },
      {
        sample: 'grouping',
        label: 'Grouping',
        defaultPreset: 'default',
        invalidPresets: ['hierarchical-with-subcomponents', 'hierarchical-with-buses']
      },
      {
        sample: 'hierarchical-with-buses',
        label: 'Bus Structures',
        defaultPreset: 'hierarchical-with-buses',
        invalidPresets: ['hierarchical-with-subcomponents']
      },
      {
        sample: 'hierarchical-with-subcomponents',
        label: 'Sub-Components',
        defaultPreset: 'hierarchical-with-subcomponents'
      },
      {
        sample: 'registration-flowchart',
        label: 'Registration Flowchart',
        defaultPreset: 'hierarchical-flowchart',
        invalidPresets: ['hierarchical-with-buses', 'hierarchical-with-subcomponents']
      },
      {
        sample: 'bpmn-order-table',
        label: 'Order Fulfillment Table',
        defaultPreset: 'default',
        invalidPresets: ['hierarchical-with-buses', 'hierarchical-with-subcomponents']
      },
      {
        sample: 'bpmn-job-posting',
        label: 'BPMN Job Posting',
        defaultPreset: 'hierarchical-incremental',
        invalidPresets: ['hierarchical-with-buses', 'hierarchical-with-subcomponents']
      }
    ]
  },
  {
    layout: 'Organic',
    presets: [
      'default',
      'organic-with-substructures',
      'organic-group-substructures',
      'organic-clustered'
    ],
    samples: [
      { sample: 'generic-organic', label: 'Default', defaultPreset: 'default' },
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
        sample: 'organic-disk-substructures',
        label: 'Disk Substructures',
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
      { sample: 'orthogonal', label: 'Default', defaultPreset: 'default' },
      {
        sample: 'orthogonal-with-substructures',
        label: 'Substructures',
        defaultPreset: 'orthogonal-with-substructures'
      }
    ]
  },
  {
    layout: 'Circular',
    presets: ['default', 'single-cycle-bundled', 'circular-with-substructures'],
    samples: [
      { sample: 'circular', label: 'Default', defaultPreset: 'default' },
      { sample: 'social-network', label: 'Social Network', defaultPreset: 'single-cycle-bundled' },
      {
        sample: 'circular-with-substructures',
        label: 'Substructures',
        defaultPreset: 'circular-with-substructures'
      }
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
    layout: 'Radial Tree',
    presets: ['default', 'radial-tree-with-rays'],
    samples: [
      { sample: 'radial-tree', label: 'Default', defaultPreset: 'default' },
      {
        sample: 'radial-tree-with-rays',
        label: 'Ray-like label placement',
        defaultPreset: 'radial-tree-with-rays'
      },
      { sample: 'mindmap', label: 'Mindmap', defaultPreset: 'default' }
    ]
  },
  {
    layout: 'Radial',
    presets: ['default', 'dendrogram'],
    samples: [
      { sample: 'airports', label: 'Airports', defaultPreset: 'default' },
      { sample: 'blossom', label: 'Blossom', defaultPreset: 'default' },
      { sample: 'generic-radial', label: 'Generic', defaultPreset: 'default' },
      { sample: 'mindmap', label: 'Mindmap', defaultPreset: 'default' },
      { sample: 'viruses', label: 'Viruses (Phylogenetic tree)', defaultPreset: 'dendrogram' }
    ]
  },
  {
    layout: 'Compact Disk',
    presets: [
      'default',
      'compact-disk-edges',
      'compact-disk-with-rays',
      'compact-disk-recursive-groups'
    ],
    samples: [
      { sample: 'compact-disk', label: 'Default', defaultPreset: 'default' },
      {
        sample: 'compact-disk-with-edges',
        label: 'With Edges',
        defaultPreset: 'compact-disk-edges'
      },
      {
        sample: 'compact-disk-ray-labels',
        label: 'Ray-like Labels',
        defaultPreset: 'compact-disk-with-rays'
      },
      {
        sample: 'compact-disk-groups',
        label: 'Groups',
        defaultPreset: 'compact-disk-recursive-groups'
      }
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
      { sample: 'edge-router-with-buses', label: 'Buses', defaultPreset: 'edge-router-with-buses' },
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
    layout: 'Organic Edge Router',
    presets: ['default'],
    samples: [
      { sample: 'organic-star', label: 'Organic Star', defaultPreset: 'default' },
      { sample: 'edge-router', label: 'Default', defaultPreset: 'default' }
    ]
  },
  {
    layout: 'Parallel Edge Router',
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
      { sample: 'node-and-edge-labels', label: 'Metro Map 2', defaultPreset: 'labeling-both' },
      {
        sample: 'edge-labels',
        label: 'Edge Labels',
        defaultPreset: 'default',
        invalidPresets: ['labeling-nodes']
      }
    ]
  },
  {
    layout: 'Partial',
    presets: [
      'default',
      'partial-with-hierarchical',
      'partial-with-organic',
      'partial-with-orthogonal',
      'partial-with-circular'
    ],
    samples: [
      {
        sample: 'partial-with-hierarchical',
        label: 'Partial with Hierarchical',
        defaultPreset: 'partial-with-hierarchical'
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
    layout: 'Transformations',
    presets: ['default', 'rotate45', 'mirrorY', 'scale3'],
    samples: [
      { sample: 'lattice', label: 'Lattice', defaultPreset: 'rotate45' },
      { sample: 'structured', label: 'Structured', defaultPreset: 'mirrorY' },
      { sample: 'shrunk', label: 'Shrunk', defaultPreset: 'scale3' }
    ]
  }
]

export const Presets: Record<string, Preset> = {
  'hierarchical-with-buses': {
    description:
      '<p>Enables the bus structures feature. Bus structures are arranged using a' +
      ' style that results in a more compact layout. Edges to the bus nodes are routed using a' +
      ' shared bus segment that connects to the common root node. In this demo, the buses' +
      ' are automatically determined such that child nodes without further connections form a bus.</p>',
    label: 'Buses',
    settings: { automaticBusRoutingEnabledItem: true }
  },

  'hierarchical-with-curves': {
    description:
      '<p>Enables curved routing, symmetric u-turns for curves and adjust the minimum slope setting to' +
      ' better fit the curved routing style.</p>',
    label: 'Curves',
    settings: {
      edgeRoutingItem: HierarchicalLayoutRoutingStyle.CURVED,
      curveShortcutsItem: true,
      curveUTurnSymmetryItem: 1.0,
      minimumSlopeItem: 0.1
    }
  },

  'hierarchical-with-subcomponents': {
    description:
      '<p>Enables the sub-component feature which makes it possible to arrange defined' +
      ' subsets of nodes and edges using a different layout algorithm. In this demo, the label' +
      ' text of nodes is considered to derive these sub-components. </p> ' +
      '<ul>' +
      '<li>Nodes with label "HL" are arranged using a hierarchical layout with left-to-right orientation</li>' +
      '<li>Nodes with label "OL" are arranged using organic layout</li>' +
      '<li>Those with label "TL" are handled by a tree layout algorithm.</li' +
      '</ul>',
    label: 'Sub-Components',
    settings: { subComponentsItem: true }
  },

  'hierarchical-flowchart': {
    description:
      '<p>Suitable settings for a top-to-bottom flowchart with curved edges and integrated edge labeling.' +
      ' To emphasize the longest path through the diagram, nodes on the path are aligned.</p>',
    label: 'Flowchart',
    settings: {
      edgeRoutingItem: HierarchicalLayoutRoutingStyle.CURVED,
      labelPlacementAlongEdgeItem: 'at-source',
      edgeLabelingItem: EdgeLabelPlacement.INTEGRATED,
      highlightCriticalPath: true
    }
  },

  'hierarchical-incremental': {
    description:
      '<p>Arranges selected elements while keeping relative positions of elements that are not selected.</p>',
    label: 'Incremental',
    settings: {
      minimumLayerDistanceItem: 30,
      selectedElementsIncrementallyItem: true,
      useDrawingAsSketchItem: true
    }
  },

  'organic-with-substructures': {
    description:
      '<p>Enables the substructure features. Chains, cycles, stars and parallel structures are ' +
      'automatically detected and handled in a specific way. This makes it much easier to detect such common ' +
      'structures in the underlying data.</p>',
    label: 'Substructures',
    settings: {
      cycleSubstructureItem: OrganicLayoutCycleSubstructureStyle.CIRCULAR,
      chainSubstructureItem: OrganicLayoutChainSubstructureStyle.DISK,
      starSubstructureItem: OrganicLayoutStarSubstructureStyle.CIRCULAR,
      parallelSubstructureItem: OrganicLayoutParallelSubstructureStyle.STRAIGHT_LINE,
      treeSubstructureItem: OrganicLayoutTreeSubstructureStyle.RADIAL_TREE
    }
  },

  'organic-group-substructures': {
    description:
      '<p>Preconfigures the group substructure feature. Clusters are interpreted as groups that are' +
      ' arranged with the specified group substructure style.</p>',
    label: 'Clustered Substructures',
    settings: {
      clusteringPolicyItem: OrganicLayoutClusteringPolicy.LOUVAIN_MODULARITY,
      groupSubstructureStyleItem: GroupSubstructureStyle.CIRCLE,
      groupSubstructureScopeItem: OrganicLayoutGroupSubstructureScope.ALL_GROUPS,
      clusterAsGroupSubstructureItem: true
    }
  },

  'organic-clustered': {
    description:
      '<p>Enables an automatic clustering of nodes and increases the quality settings of' +
      ' the organic layout algorithm.</p>',
    label: 'Clustered',
    settings: {
      stopDurationItem: 60,
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
      chainSubstructureStyleItem:
        OrthogonalLayoutChainSubstructureStyle.WRAPPED_WITH_NODES_AT_TURNS,
      chainSubstructureSizeItem: 2,
      cycleSubstructureStyleItem:
        OrthogonalLayoutCycleSubstructureStyle.CIRCULAR_WITH_BENDS_AT_CORNERS,
      cycleSubstructureSizeItem: 4,
      treeSubstructureStyleItem: OrthogonalLayoutTreeSubstructureStyle.INTEGRATED,
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
      partitioningPolicyItem: 'single-cycle',
      edgeBundlingItem: true
    }
  },

  'circular-with-substructures': {
    description:
      '<p>Enables the substructure feature. Star structures are ' +
      'automatically detected and handled in a specific way. This makes it much easier to detect such ' +
      'structures in the underlying data.</p>',
    label: 'Substructures',
    settings: { starSubstructureItem: CircularLayoutStarSubstructureStyle.RADIAL }
  },

  'partial-with-hierarchical': {
    description: '<p>Incorporate new elements into a hierarchical layout using PartialLayout.</p>',
    label: 'Partial with Hierarchical',
    settings: {
      alignNodesItem: true,
      componentAssignmentStrategyItem: ComponentAssignmentStrategy.CONNECTED,
      minNodeDistItem: 5,
      orientationItem: PartialLayoutOrientation.TOP_TO_BOTTOM,
      routingToSubgraphItem: PartialLayoutRoutingStyle.ORTHOGONAL,
      subgraphLayoutItem: 'hierarchical',
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
      routingToSubgraphItem: PartialLayoutRoutingStyle.STRAIGHT_LINE,
      subgraphLayoutItem: 'organic',
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
      routingToSubgraphItem: PartialLayoutRoutingStyle.ORTHOGONAL,
      subgraphLayoutItem: 'orthogonal',
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
      routingToSubgraphItem: PartialLayoutRoutingStyle.STRAIGHT_LINE,
      subgraphLayoutItem: 'circular',
      subgraphPlacementItem: SubgraphPlacement.BARYCENTER
    }
  },

  'edge-router-left-right-flow': {
    description:
      '<p>The edges connect at the left or right node side and, futhermore, the algorithm' +
      ' places edge labels using the integrated labeling approach.</p>',
    label: 'Left/Right Ports & Labeling',
    settings: {
      portSidesItem: 'left-right',
      edgeLabelingItem: EdgeLabelPlacement.INTEGRATED,
      routingStyleItem: EdgeRouterRoutingStyle.OCTILINEAR
    }
  },

  'edge-router-single-bus': {
    description:
      '<p>All edges are routed on a single, common bus that must consist of ' +
      'only a single backbone segment.</p>',
    label: 'Single Bus',
    settings: { busMembershipItem: 'single', allowMultipleBackboneSegmentsItem: false }
  },

  'edge-router-with-buses': {
    description:
      '<p>Enables bus routing and derives the bus membership of an edge from a custom' +
      ' data tag. In this demo, the effect can be observed when choosing the respective' +
      ' "Buses" sample graph. In that sample, the color of the edges reflect the data tag and thus' +
      ' the bus membership of an edge.</p>',
    label: 'Custom Buses',
    settings: { busMembershipItem: 'tag' }
  },

  'edge-router-with-curves': {
    description: '<p>Edges are routed as smooth curves.</p>',
    label: 'Curves',
    settings: { routingStyleItem: EdgeRouterRoutingStyle.CURVED }
  },

  'tree-multiparent': {
    description: '<p>Considers multiple parents for tree nodes.</p>',
    label: 'Multi-parent',
    settings: { allowMultiParentsItem: true, spacingItem: 50 }
  },

  'tree-mindmap': {
    description:
      '<p>Suitable configuration for a mindmap-like diagram. This preset configures a DelegatingSubtreePlacer' +
      ' that delegates to two layered placers with different orientations, one arranging the subtree' +
      ' from left to right and the other from right to left.</p>',
    label: 'Mindmap',
    settings: { subtreePlacerItem: 'single-split-layered', spacingItem: 50 }
  },

  scale3: {
    description: '<p>Scales the graph by 3.</p>',
    label: 'Scale x3',
    settings: { operationItem: 'scale', scaleFactorItem: 3 }
  },

  mirrorY: {
    description: '<p>Mirrors the diagram at the y-axis.</p>',
    label: 'Mirror Vertically',
    settings: { operationItem: 'mirror-y-axis' }
  },

  rotate45: {
    description: '<p>Rotates the graph by 45 degrees.</p>',
    label: 'Rotate 45°',
    settings: { operationItem: 'rotate', rotationAngleItem: 45 }
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
      labelPlacementSideOfEdgeItem: 'left-or-right'
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
      labelPlacementSideOfEdgeItem: 'on-edge',
      labelPlacementOrientationItem: 'parallel',
      labelPlacementAlongEdgeItem: 'anywhere'
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
      labelPlacementSideOfEdgeItem: 'left-or-right',
      labelPlacementOrientationItem: 'parallel',
      labelPlacementAlongEdgeItem: 'anywhere'
    }
  },

  'labeling-nodes': {
    description:
      '<p>Places the node labels, avoiding overlaps with other elements. Ignores edge labels.</p>',
    label: 'Node Labels',
    settings: { placeNodeLabelsItem: true, placeEdgeLabelsItem: false }
  },

  'radial-tree-with-rays': {
    description: '<p>Places node label in a ray-like fashion pointing away from the root node.</p>',
    label: 'Ray-like label placement',
    settings: {
      edgeLabelingItem: EdgeLabelPlacement.INTEGRATED,
      nodeLabelingStyleItem: RadialNodeLabelPlacement.RAY_LIKE_LEAVES,
      placeChildrenInterleavedItem: true,
      preferredChildSectorAngle: 100
    }
  },

  'print-format': {
    description:
      '<p>Arranges components in US Letter landscape format that works well for printing.</p>',
    label: 'Print Format',
    settings: { aspectRatioItem: 1.3, useScreenRatioItem: false }
  },

  compact: {
    description:
      '<p>This preset utilizes the compact subtree placer and places all nodes that are marked with <code>assistant</code> in their tag alongside the main branch as assistantNodes.</p>',
    label: 'Compact',
    settings: { subtreePlacerItem: 'compact' }
  },

  dendrogram: {
    description:
      '<p>This preset utilizes the dendrogram layout style that is most suitable for displaying ' +
      'phylogenetic tree. </p>' +
      '<p>It utilizes the dendrogram layering strategy with an edge routing strategy ' +
      'that will route edges as a series of straight and arc segments.</p>',
    label: 'Dendrogram',
    settings: {
      edgeRoutingStrategyItem: RadialLayoutRoutingStyle.RADIAL_POLYLINE,
      layeringStrategyItem: RadialLayeringStrategy.DENDROGRAM,
      nodeLabelingStyleItem: RadialNodeLabelPlacement.RAY_LIKE,
      maximumChildSectorSizeItem: 360,
      minimumNodeToNodeDistanceItem: 5
    }
  },

  'compact-disk-edges': {
    description:
      '<p>This preset utilizes the minimum node distance ' +
      'to make space between nodes and, thus, make the edges visible.</p>',
    label: 'With Edges',
    settings: { minimumNodeDistanceItem: 30 }
  },

  'compact-disk-with-rays': {
    description: '<p>Places node labels in a ray-like fashion pointing away from the disk.</p>',
    label: 'Ray-like label placement',
    settings: { nodeLabelingStyleItem: RadialNodeLabelPlacement.RAY_LIKE_LEAVES }
  },

  'compact-disk-recursive-groups': {
    description:
      '<p>Uses RecursiveGroupLayout to run the compact disk layout algorithm for each group node ' +
      'separately. The topmost level of the hierarchy is arranged with OrganicLayout.</p>',
    label: 'Recursive Groups',
    settings: { layoutGroupsItem: 1, minimumNodeDistanceItem: 15 }
  },

  default: {
    description: '<p>Resets the layout settings to their defaults.</p>',
    label: 'Default',
    settings: {}
  }
}
