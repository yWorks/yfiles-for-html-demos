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
// eslint-disable-next-line no-unused-vars
function getDemoData() {
  return [
    {
      id: 'layout-styles',
      name: 'Layout Styles',
      demoPath: 'layout/layoutstyles/index.html',
      summary:
        'Showcases the most used layout algorithms of yFiles, including hierarchic, organic, orthogonal, tree, circular and balloon styles.',
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles.png',
      sourcePath: 'layout/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'algorithms'],
      keywords: [
        'layoutstyles',
        'options',
        'overview',
        'hierarchic',
        'organic',
        'orthogonal',
        'circular',
        'tree',
        'balloon',
        'radial',
        'series-parallel',
        'edgerouter',
        'polyline-router',
        'channel-router',
        'bus-router',
        'organic-router',
        'parallel-router',
        'genericlabeling',
        'component',
        'tabular',
        'partial',
        'graph-transform'
      ]
    },
    {
      id: 'bpmn-editor',
      name: 'BPMN Editor',
      demoPath: 'complete/bpmn/index.html',
      summary:
        'An editor for Business Process diagrams that features interactive editing, BPMN node styles and a specialized BPMN layout algorithm.',
      category: 'complete',
      thumbnailPath: 'resources/image/bpmneditor.png',
      sourcePath: 'complete/bpmn/BpmnDemo.js',
      tags: ['styles', 'layout'],
      keywords: ['contextmenu', 'draganddrop', 'palette', 'ports', 'overview']
    },
    {
      id: 'organization-chart',
      name: 'Organization Chart',
      demoPath: 'complete/interactiveorgchart/index.html',
      summary: 'An interactive viewer for organization charts with automatic layout updates.',
      category: 'complete',
      thumbnailPath: 'resources/image/interactiveorgchart.png',
      sourcePath: 'complete/interactiveorgchart/OrgChartDemo.js',
      tags: ['styles', 'layout', 'interaction'],
      keywords: [
        'animation',
        'filtering',
        'search',
        'template',
        'print',
        'datapanel',
        'structure',
        'hide',
        'detail'
      ]
    },
    {
      id: 'gantt-chart',
      name: 'Gantt Chart',
      demoPath: 'view/ganttchart/index.html',
      summary: 'An editor for Gantt charts.',
      category: 'view',
      thumbnailPath: 'resources/image/ganttchart.png',
      sourcePath: 'view/ganttchart/GanttChartDemo.js',
      tags: ['editor', 'interaction'],
      keywords: ['activity', 'tasks', 'swimlanes', 'calendar', 'date', 'time', 'schedule']
    },
    {
      id: 'fraud-detection',
      name: 'Fraud Detection',
      demoPath: 'complete/frauddetection/index.html',
      summary: 'Example of a fraud detection application for time-dependent data.',
      category: 'complete',
      thumbnailPath: 'resources/image/frauddetection.png',
      sourcePath: 'complete/frauddetection/FraudDetectionDemo.js',
      tags: ['timeline', 'layout', 'detailed view'],
      keywords: ['filtering', 'animation', 'structure', 'detail']
    },
    {
      id: 'isometric-drawing',
      name: 'Isometric Drawing',
      demoPath: 'complete/isometric/index.html',
      summary:
        'Displays graphs in an isometric fashion to create the impression of a 3-dimensional view.',
      category: 'complete',
      thumbnailPath: 'resources/image/isometric.png',
      sourcePath: 'complete/isometric/IsometricDrawingDemo.js',
      tags: ['styles', 'layout', 'viewer'],
      keywords: ['groups', 'folding', 'hierarchic', 'orthogonal', 'labels']
    },
    {
      id: 'network-monitoring',
      name: 'Network Monitoring',
      demoPath: 'complete/networkmonitoring/index.html',
      summary: 'Example of a monitoring tool for computer networks.',
      category: 'complete',
      thumbnailPath: 'resources/image/networkmonitoring.png',
      sourcePath: 'complete/networkmonitoring/NetworkMonitoringDemo.js',
      tags: ['styles', 'viewer', 'animation'],
      keywords: ['tooltip', 'datapanel', 'chart', 'structure']
    },
    {
      id: 'graph-analysis',
      name: 'Graph Analysis',
      demoPath: 'analysis/graphanalysis/index.html',
      summary:
        'Showcases a selection of graph algorithms such as shortest paths, flows, centrality measures, etc. ' +
        'that help analysing the structure of a graph.',
      category: 'analysis',
      thumbnailPath: 'resources/image/graphanalysis.png',
      sourcePath: 'analysis/graphanalysis/GraphAnalysisDemo.js',
      tags: ['algorithm', 'layout', 'styles'],
      keywords: [
        'contextmenu',
        'centrality',
        'connectivity',
        'reachability',
        'cycles',
        'spanningtree',
        'shortestpaths'
      ]
    },
    {
      id: 'edge-bundling',
      name: 'Edge Bundling',
      demoPath: 'layout/edgebundling/index.html',
      summary:
        'Shows how edge bundling can be applied for reducing visual cluttering in dense graphs.',
      category: 'layout',
      thumbnailPath: 'resources/image/edgebundling.png',
      sourcePath: 'layout/edgebundling/EdgeBundling.js',
      tags: ['styles', 'curves', 'layout'],
      keywords: ['contextmenu', 'organic', 'radial', 'tree', 'balloon', 'bundle']
    },
    {
      id: 'sankey-diagram',
      name: 'Sankey Diagram',
      demoPath: 'layout/sankey/index.html',
      summary:
        'A diagram used for visualizing flow information in which the thickness of the edges is proportional to the flow quantity.',
      category: 'layout',
      thumbnailPath: 'resources/image/sankey.png',
      sourcePath: 'layout/sankey/SankeyDemo.js',
      tags: ['edge thickness', 'styles', 'layout'],
      keywords: ['contextmenu', 'hierarchic', 'genericlabeling', 'labels']
    },
    {
      id: 'tree-map',
      name: 'Tree Map',
      demoPath: 'layout/treemap/index.html',
      summary: 'Shows disk usage of a directory tree with the Tree Map layout.',
      category: 'layout',
      thumbnailPath: 'resources/image/treemap.png',
      sourcePath: 'layout/tree/TreeMapDemo.js',
      tags: ['layout'],
      keywords: ['treemap', 'v2.1.0.0', 'animation', 'tooltip']
    },
    {
      id: 'family-tree',
      name: 'Family Tree',
      demoPath: 'layout/familytree/index.html',
      summary: 'Shows how to visualize genealogical graphs (family trees).',
      category: 'layout',
      thumbnailPath: 'resources/image/familyTree.png',
      sourcePath: 'layout/familytree/FamilyTreeDemo.js',
      tags: ['layout', 'genealogy'],
      keywords: ['familytree', 'tree', 'layout', 'genealogical', 'v2.2.0.0', 'structure']
    },
    {
      id: 'template-styles',
      name: 'Template Styles',
      demoPath: 'style/templatestyles/index.html',
      summary: 'Shows SVG template styles for nodes, labels and ports.',
      category: 'style',
      thumbnailPath: 'resources/image/templatestyles.png',
      sourcePath: 'style/templatestyles/TemplateStylesDemo.js',
      tags: ['styles', 'data binding'],
      keywords: ['v2.1.0.2', 'SVG', 'datapanel', 'template']
    },
    {
      id: 'css-styling',
      name: 'CSS Styling',
      demoPath: 'style/cssstyling/index.html',
      summary: 'Shows how to style indicators and other templates.',
      category: 'style',
      thumbnailPath: 'resources/image/cssstyling.png',
      sourcePath: 'style/cssstyling/CSSStylingDemo.js',
      tags: ['css', 'indicators', 'theme'],
      keywords: ['stylesheet', 'v2.2.0.0']
    },
    {
      id: 'overview',
      name: 'Overview Styling',
      demoPath: 'view/overviewstyles/index.html',
      summary: 'Shows several different rendering techniques and styles for the overview.',
      category: 'view',
      thumbnailPath: 'resources/image/overview.png',
      sourcePath: 'view/overviewstyles/OverviewStylesDemo.js',
      tags: ['styles', 'Canvas'],
      keywords: ['v2.2.0.0', 'overviewinputmode', 'svg']
    },
    {
      id: 'metaball-groups',
      name: 'Metaball Groups',
      demoPath: 'complete/metaballgroups/index.html',
      summary: 'Shows how to render metaball-like background visualizations.',
      category: 'complete',
      thumbnailPath: 'resources/image/metaballgroups.png',
      sourcePath: 'complete/metaballgroups/MetaballGroupsDemo.js',
      tags: ['background', 'WebGL'],
      keywords: ['v2.2.0.0', 'overlapping']
    },
    {
      id: 'maze-routing',
      name: 'Maze Routing',
      demoPath: 'layout/mazerouting/index.html',
      summary: 'Shows how the automatic edge routing finds routes through a maze.',
      category: 'layout',
      thumbnailPath: 'resources/image/mazerouting.png',
      sourcePath: 'layout/mazerouting/MazeRoutingDemo.js',
      tags: ['layout', 'router'],
      keywords: ['edgerouter', 'polylinerouter', 'background']
    },
    {
      id: 'interactive-map',
      name: 'Interactive Map',
      demoPath: 'complete/mapintegration/index.html',
      summary: 'Draws a graph on top of an interactive map.',
      category: 'complete',
      thumbnailPath: 'resources/image/mapintegration.png',
      sourcePath: 'complete/mapintegration/MapIntegrationDemo.js',
      tags: ['styles', 'layout', 'leaflet'],
      keywords: [
        'v2.1.0.2',
        'overlay',
        'layer',
        'control',
        'radial',
        'tooltip',
        'shortestpaths',
        'filtering',
        'background'
      ]
    },
    {
      id: 'uml-editor',
      name: 'UML Editor',
      demoPath: 'complete/uml/index.html',
      summary:
        'An editor for UML diagrams with a tailored UML node style, automatic layout, and a quick way to create new edges with the mouse or touch.',
      category: 'complete',
      thumbnailPath: 'resources/image/umleditor.png',
      sourcePath: 'complete/uml/UMLEditorDemo.js',
      tags: ['styles', 'layout', 'interaction'],
      keywords: ['v2.1.0.1', 'contextmenu', 'labels', 'edgerouter', 'hierarchic', 'structure']
    },
    {
      id: 'flowchart-editor',
      name: 'Flowchart Editor',
      demoPath: 'complete/flowchart/index.html',
      summary:
        'An editor for Flowchart diagrams that features interactive editing, flowchart node styles, and automatic layout.',
      category: 'complete',
      thumbnailPath: 'resources/image/flowchart.png',
      sourcePath: 'complete/flowchart/FlowchartDemo.js',
      tags: ['styles', 'layout'],
      keywords: ['hierarchic', 'palette', 'draganddrop', 'palette']
    },
    {
      id: 'decision-tree',
      name: 'Decision Tree',
      demoPath: 'complete/decisiontree/index.html',
      summary:
        'An interactive Decision Tree component that lets you design and explore your own decision graphs.',
      category: 'complete',
      thumbnailPath: 'resources/image/decisiontree.png',
      sourcePath: 'complete/decisiontree/DecisionTreeDemo.js',
      tags: ['layout', 'interaction'],
      keywords: ['hierarchic', 'contextmenu']
    },
    {
      id: 'mindmap-editor',
      name: 'Mindmap Editor',
      demoPath: 'complete/mindmap/index.html',
      summary:
        'A Mindmap editor with a tailored node style, custom user interaction, and a specialized layout' +
        'that automatically arranges new entries.',
      category: 'complete',
      thumbnailPath: 'resources/image/mindmap.png',
      sourcePath: 'complete/mindmap/MindmapDemo.js',
      tags: ['styles', 'layout'],
      keywords: ['contextmenu', 'tree', 'structure']
    },
    {
      id: 'd3-chart-nodes',
      name: 'd3 Chart Nodes',
      demoPath: 'style/d3chartnodes/index.html',
      summary: 'Presents a node style that visualizes dynamic data with d3.js.',
      category: 'style',
      thumbnailPath: 'resources/image/d3chartnodes.png',
      sourcePath: 'style/d3chartnodes/D3ChartNodesDemo.js',
      tags: ['styles', 'sparklines', 'bars', 'd3.js'],
      keywords: ['v2.2.0.0']
    },
    {
      id: 'logic-gates',
      name: 'Logic Gates',
      demoPath: 'complete/logicgates/index.html',
      summary: 'An editor for networks of logic gates, with tailored automatic layout.',
      category: 'complete',
      thumbnailPath: 'resources/image/logicgates.png',
      sourcePath: 'complete/logicgates/LogicGatesDemo.js',
      tags: ['ports', 'styles', 'layout', 'structure'],
      keywords: [
        'drag',
        'drop',
        'port',
        'candidates',
        'constraints',
        'hierarchic',
        'edgerouter',
        'draganddrop',
        'palette',
        'reversed edge creation'
      ]
    },
    {
      id: 'organization-chart-viewer',
      name: 'Organization Chart Viewer',
      demoPath: 'complete/orgchartviewer/index.html',
      summary: 'A viewer for organization charts.',
      category: 'complete',
      thumbnailPath: 'resources/image/orgchart.png',
      sourcePath: 'complete/orgchartviewer/OrgChartViewerDemo.js',
      tags: ['styles', 'layout'],
      keywords: ['search', 'template', 'datapanel', 'v2.2.0.0', 'structure']
    },
    {
      id: 'collapsible-trees',
      name: 'Collapsible Trees',
      demoPath: 'complete/collapse/index.html',
      summary: 'Shows interactive collapsing and expanding of subtrees of a graph.',
      category: 'complete',
      thumbnailPath: 'resources/image/collapsibletree.png',
      sourcePath: 'complete/collapse/CollapseDemo.js',
      tags: ['layout', 'interaction', 'animation'],
      keywords: ['hierarchic', 'organic', 'tree', 'balloon', 'filtering', 'hide']
    },
    {
      id: 'rotatable-nodes',
      name: 'Rotatable Nodes',
      demoPath: 'complete/rotatablenodes/index.html',
      summary: 'Shows nodes that can be rotated with the mouse or touch.',
      category: 'complete',
      thumbnailPath: 'resources/image/RotatableNodes.png',
      sourcePath: 'complete/rotatablenodes/RotatableNodesDemo.js',
      tags: ['interaction', 'styles', 'layout'],
      keywords: [
        'handles',
        'input',
        'rotation',
        'v2.1.0.1',
        'labels',
        'ports',
        'hierarchic',
        'organic',
        'orthogonal',
        'circular',
        'tree',
        'balloon',
        'radial',
        'edgerouter',
        'polyline-router',
        'organic-router',
        'curves'
      ]
    },
    {
      id: 'contextual-toolbar',
      name: 'Contextual Toolbar',
      demoPath: 'view/contextualtoolbar/index.html',
      summary:
        'Shows a contextual toolbar for the current selection that enables fast and easy style changes.',
      category: 'view',
      thumbnailPath: 'resources/image/contextualtoolbar.png',
      sourcePath: 'view/grapheditor/ContextualToolbarDemo.js',
      tags: ['interaction', 'overlay'],
      keywords: ['v2.1.0.2', 'html', 'popup', 'contextmenu']
    },
    {
      id: 'graph-editor',
      name: 'Graph Editor',
      demoPath: 'view/grapheditor/index.html',
      summary: 'Shows the graph editing features of the graph component.',
      category: 'view',
      thumbnailPath: 'resources/image/simpleeditor.png',
      sourcePath: 'view/grapheditor/GraphEditorDemo.js',
      tags: ['interaction'],
      keywords: ['contextmenu', 'groups', 'folding', 'overview']
    },
    {
      id: 'table-editor',
      name: 'Table Editor',
      demoPath: 'complete/tableeditor/index.html',
      summary:
        'Shows the support for diagrams that are organized in a tabular way, for example in a grid or a swimlane layout.',
      category: 'complete',
      thumbnailPath: 'resources/image/tableeditor.png',
      sourcePath: 'complete/tableeditor/TableEditorDemo.js',
      tags: ['table', 'interaction'],
      keywords: [
        'drag',
        'drop',
        'draganddrop',
        'palette',
        'hierarchic',
        'groups',
        'contextmenu',
        'move'
      ]
    },
    {
      id: 'graph-viewer',
      name: 'Graph Viewer',
      demoPath: 'view/graphviewer/index.html',
      summary: 'Displays sample graphs from various application domains.',
      category: 'view',
      thumbnailPath: 'resources/image/graphviewer.png',
      sourcePath: 'view/graphviewer/GraphViewerDemo.js',
      tags: ['styles', 'overview'],
      keywords: ['tooltip', 'contextmenu', 'datapanel', 'search']
    },
    {
      id: 'large-graphs',
      name: 'Large Graphs',
      demoPath: 'view/largegraphs/index.html',
      summary: 'Illustrates improvements in rendering performance for large graphs.',
      category: 'view',
      thumbnailPath: 'resources/image/largegraphs.png',
      sourcePath: 'view/largegraphs/LargeGraphsDemo.js',
      tags: ['performance', 'Canvas', 'WebGL'],
      keywords: ['FPS', 'rendering']
    },
    {
      id: 'events-viewer',
      name: 'Events Viewer',
      demoPath: 'view/events/index.html',
      summary:
        'Shows the multitude of events provided by the classes <code>IGraph</code>, <code>GraphComponent</code>, and the <em>Input Modes</em>.',
      category: 'view',
      thumbnailPath: 'resources/image/events.png',
      sourcePath: 'view/events/EventsDemo.js',
      tags: ['interaction'],
      keywords: ['palette', 'draganddrop']
    },
    {
      id: 'touch-interaction',
      name: 'Touch Interaction',
      demoPath: 'input/touchcustomization/index.html',
      summary: 'Shows how a graph editor application can be optimized for touch devices.',
      category: 'input',
      thumbnailPath: 'resources/image/custom_touch_interaction.png',
      sourcePath: 'input/touchcustomization/TouchEditorDemoDemo.js',
      tags: ['interaction', 'mobile'],
      keywords: ['v2.1.0.0', 'palette', 'draganddrop', 'contextmenu', 'move']
    },
    {
      id: 'neighborhood-view',
      name: 'Neighborhood View',
      demoPath: 'complete/neighborhood/index.html',
      summary: 'Shows the neighborhood of the currently selected node alongside the graph.',
      category: 'complete',
      thumbnailPath: 'resources/image/neighborhoodview.png',
      sourcePath: 'complete/neighborhood/NeighborhoodDemo.js',
      tags: ['layout', 'interaction'],
      keywords: ['hierarchic', 'copy', 'detail']
    },
    {
      id: 'clustering-algorithms',
      name: 'Clustering Algorithms',
      demoPath: 'analysis/clustering/index.html',
      summary:
        'Showcases a selection of clustering algorithms such as edge betweenness, k-means, hierarchical and biconnected components clustering.',
      category: 'analysis',
      thumbnailPath: 'resources/image/clustering.png',
      sourcePath: 'analysis/clustering/ClusteringDemo.js',
      tags: ['algorithms'],
      keywords: ['kmeans', 'hierarchical', 'voronoi', 'dendrogram', 'background']
    },
    {
      id: 'network-flows',
      name: 'Network Flows',
      demoPath: 'analysis/networkflows/index.html',
      summary:
        'Presents three network flow graph analysis algorithms that are applied on a network of water pipes.',
      category: 'analysis',
      thumbnailPath: 'resources/image/networkflows.png',
      sourcePath: 'analysis/networkflows/NetworkFlowsDemo.js',
      tags: ['algorithms', 'styles'],
      keywords: ['networkflows', 'maximum', 'minimum', 'cut']
    },
    {
      id: 'transitivity',
      name: 'Transitivity',
      demoPath: 'analysis/transitivity/index.html',
      summary:
        'Shows how transitivity graph analysis algorithms can be applied to solve reachability problems.',
      category: 'analysis',
      thumbnailPath: 'resources/image/transitivity.png',
      sourcePath: 'analysis/transitivity/TransitivityDemo.js',
      tags: ['analysis'],
      keywords: ['transitive', 'closure', 'reduction', 'npm', 'filtering', 'structure']
    },
    {
      id: 'edge-label-placement',
      name: 'Edge Label Placement',
      demoPath: 'layout/edgelabelplacement/index.html',
      summary:
        'Shows how to place edge labels at the preferred location with a labeling algorithm.',
      category: 'layout',
      thumbnailPath: 'resources/image/edgelabelplacement.png',
      sourcePath: 'layout/edgelabelplacement/EdgeLabelPlacementDemo.js',
      tags: ['labels', 'labeling'],
      keywords: [
        'generic',
        'integrated',
        'text',
        'genericlabeling',
        'tree',
        'hierarchic',
        'orthogonal',
        'edgerouter',
        'move'
      ]
    },
    {
      id: 'node-label-placement',
      name: 'Node Label Placement',
      demoPath: 'layout/nodelabelplacement/index.html',
      summary:
        'Shows how to place node labels at the preferred location with a labeling algorithm.',
      category: 'layout',
      thumbnailPath: 'resources/image/nodelabelplacement.png',
      sourcePath: 'layout/nodelabelplacement/NodeLabelPlacementDemo.js',
      tags: ['labels', 'labeling'],
      keywords: ['generic', 'genericlabeling', 'text', 'background']
    },
    {
      id: 'hierarchic-nesting',
      name: 'Hierarchic Nesting',
      demoPath: 'complete/hierarchicgrouping/index.html',
      summary: 'The hierarchic layout nicely expands and collapses sub-graphs organized in groups.',
      category: 'complete',
      thumbnailPath: 'resources/image/hierarchicgrouping.png',
      sourcePath: 'complete/hierarchicgrouping/HierarchicGroupingDemo.js',
      tags: ['layout', 'hierarchic', 'animation'],
      keywords: ['overview', 'folding', 'hide']
    },
    {
      id: 'incremental-hierarchic-layout',
      name: 'Incremental Hierarchic Layout',
      demoPath: 'layout/incrementalhierarchic/index.html',
      summary:
        'The incremental mode of the hierarchic layout style can fit new nodes and edges into the existing drawing.',
      category: 'layout',
      thumbnailPath: 'resources/image/incrementalhierarchic.png',
      sourcePath: 'layout/incrementalhierarchic/IncrementalHierarchicDemo.js',
      tags: ['layout', 'hierarchic'],
      keywords: ['ports', 'background']
    },
    {
      id: 'edge-grouping',
      name: 'Edge Grouping',
      demoPath: 'layout/edgegrouping/index.html',
      summary: 'The hierarchic layout can group the paths or ports of edges.',
      category: 'layout',
      thumbnailPath: 'resources/image/edgegrouping.png',
      sourcePath: 'layout/edgegrouping/EdgeGroupingDemo.js',
      tags: ['layout', 'hierarchic'],
      keywords: [
        'v2.1.0.3',
        'edgegroups',
        'portgroups',
        'hierarchic',
        'ports',
        'contextmenu',
        'groups',
        'bridges'
      ]
    },
    {
      id: 'hierarchic-subcomponents',
      name: 'Hierarchic Subcomponents',
      demoPath: 'layout/subcomponents/index.html',
      summary: 'The hierarchic layout can arrange subcomponents with different layout styles.',
      category: 'layout',
      thumbnailPath: 'resources/image/subcomponents.png',
      sourcePath: 'layout/subcomponents/SubcomponentsDemo.js',
      tags: ['layout', 'hierarchic', 'components'],
      keywords: ['tree', 'organic', 'orthogonal']
    },
    {
      id: 'critical-paths',
      name: 'Critical Paths',
      demoPath: 'layout/criticalpaths/index.html',
      summary:
        'The hierarchic and tree layout styles can emphasize critical (important) paths by aligning their nodes.',
      category: 'layout',
      thumbnailPath: 'resources/image/CriticalPaths.png',
      sourcePath: 'layout/criticalpaths/CriticalPathsDemo.js',
      tags: ['layout', 'hierarchic', 'tree'],
      keywords: ['contextmenu']
    },
    {
      id: 'split-edges',
      name: 'Split Edges',
      demoPath: 'layout/splitedges/index.html',
      summary:
        'Shows how to align edges at group nodes using RecursiveGroupLayout with HierarchicLayout.',
      category: 'layout',
      thumbnailPath: 'resources/image/splitedges.png',
      sourcePath: 'layout/splitedges/SplitEdgesDemo.js',
      tags: ['layout', 'hierarchic', 'tree'],
      keywords: ['v2.1.0.3', 'contextmenu', 'recursive']
    },
    {
      id: 'partition-grid',
      name: 'Partition Grid',
      demoPath: 'layout/partitiongrid/index.html',
      summary: 'Demonstrates the usage of a partition grid for hierarchic and organic layouts.',
      category: 'layout',
      thumbnailPath: 'resources/image/partitiongrid.png',
      sourcePath: 'layout/partitiongrid/PartitionGridDemo.js',
      tags: ['layout', 'partition grid', 'hierarchic', 'organic']
    },
    {
      id: 'simple-partition-grid',
      name: 'Simple Partition Grid',
      demoPath: 'layout/simplepartitiongrid/index.html',
      summary: 'Shows how to create a simple partition grid.',
      category: 'layout',
      thumbnailPath: 'resources/image/simplePartitionGrid.png',
      sourcePath: 'layout/simplepartitiongrid/SimplePartitionGridDemo.js',
      tags: ['layout', 'partition grid', 'hierarchic'],
      keywords: ['v2.2.0.0']
    },
    {
      id: 'layer-constraints',
      name: 'Layer Constraints',
      demoPath: 'layout/layerconstraints/index.html',
      summary:
        'Shows how to use layer constraints to prescribe the node layering in hierarchic layouts.',
      category: 'layout',
      thumbnailPath: 'resources/image/layerconstraints.png',
      sourcePath: 'layout/layerconstraints/LayerConstraintsDemo.js',
      tags: ['layout', 'hierarchic']
    },
    {
      id: 'sequence-constraints',
      name: 'Sequence Constraints',
      demoPath: 'layout/sequenceconstraints/index.html',
      summary:
        'Shows how to use sequence constraints to prescribe the node sequencing in hierarchic layouts.',
      category: 'layout',
      thumbnailPath: 'resources/image/sequenceconstraints.png',
      sourcePath: 'layout/sequenceconstraints/SequenceConstraintsDemo.js',
      tags: ['layout', 'hierarchic']
    },
    {
      id: 'interactive-organic-layout',
      name: 'Interactive Organic Layout',
      demoPath: 'layout/interactiveorganic/index.html',
      summary: "Shows the 'interactive organic' layout algorithm.",
      category: 'layout',
      thumbnailPath: 'resources/image/InteractiveLayout.mp4',
      sourcePath: 'layout/interactiveorganic/InteractiveOrganicDemo.js',
      tags: ['layout', 'interaction', 'animation'],
      keywords: ['organic', 'move']
    },
    {
      id: 'recursive-group-layout',
      name: 'Recursive Group Layout',
      demoPath: 'layout/recursivegroup/index.html',
      summary:
        'Shows how to use different layout styles for the contents of groups and the overall graph.',
      category: 'layout',
      thumbnailPath: 'resources/image/recursivegroup.png',
      sourcePath: 'layout/recursivegroup/RecursiveGroupDemo.js',
      tags: ['layout', 'hierarchic'],
      keywords: ['groups', 'hide']
    },
    {
      id: 'multi-page-layout',
      name: 'Multi-Page Layout',
      demoPath: 'layout/multipage/index.html',
      summary:
        'Shows how to divide a large model graph into several smaller page graphs, for example to print to' +
        ' multiple pages.',
      category: 'layout',
      thumbnailPath: 'resources/image/multipage.png',
      sourcePath: 'layout/multipage/MultiPageDemo.js',
      tags: ['layout', 'hierarchic', 'tree'],
      keywords: ['multipage', 'orthogonal', 'circular', 'organic', 'large', 'split', 'print']
    },
    {
      id: 'tree-layout',
      name: 'Tree Layout',
      demoPath: 'layout/tree/index.html',
      summary: 'Shows how to use different node placer in TreeLayout.',
      category: 'layout',
      thumbnailPath: 'resources/image/treelayout.png',
      sourcePath: 'layout/tree/TreeLayoutDemo.js',
      tags: ['layout', 'tree'],
      keywords: ['nodeplacer']
    },
    {
      id: 'partial-layout',
      name: 'Partial Layout',
      demoPath: 'layout/partial/index.html',
      summary: 'Shows how to integrate new graph elements into an existing graph layout.',
      category: 'layout',
      thumbnailPath: 'resources/image/partiallayout.png',
      sourcePath: 'layout/partial/PartialLayoutDemo.js',
      tags: ['layout', 'incremental', 'hierarchic'],
      keywords: ['orthogonal', 'organic', 'circular', 'curves']
    },
    {
      id: 'image-export',
      name: 'Image Export',
      demoPath: 'view/imageexport/index.html',
      summary: 'Shows how to export the whole diagram or a part of it to a PNG image.',
      category: 'view',
      thumbnailPath: 'resources/image/export.png',
      sourcePath: 'view/imageexport/ImageExportDemo.js',
      tags: ['PNG', 'JPEG', 'bitmap'],
      keywords: ['JPG', 'save', 'handles']
    },
    {
      id: 'svg-export',
      name: 'SVG Export',
      demoPath: 'view/svgexport/index.html',
      summary: 'Shows how to export the whole diagram or a part of it to an SVG image.',
      category: 'view',
      thumbnailPath: 'resources/image/svgexport.png',
      sourcePath: 'view/svgexport/SvgExportDemo.js',
      tags: ['SVG', 'vector graphics'],
      keywords: ['scalable vector graphics', 'save', 'handles']
    },
    {
      id: 'pdf-export',
      name: 'PDF Export',
      demoPath: 'view/pdfexport/index.html',
      summary: 'Shows how to export the whole diagram or a part of it to a PDF.',
      category: 'view',
      thumbnailPath: 'resources/image/pdfexport.png',
      sourcePath: 'view/pdfexport/PdfExportDemo.js',
      tags: ['PDF', 'vector graphics'],
      keywords: ['save', 'handles']
    },
    {
      id: 'printing',
      name: 'Printing',
      demoPath: 'view/printing/index.html',
      summary: 'Shows how to print the whole diagram or a part of it.',
      category: 'view',
      thumbnailPath: 'resources/image/printing.png',
      sourcePath: 'view/printing/PrintingDemo.js',
      tags: ['printing'],
      keywords: ['poster', 'vector graphics', 'handles']
    },
    {
      id: 'structure-view',
      name: 'Structure View',
      demoPath: 'view/structureview/index.html',
      summary: 'A tree list component that shows the nesting of the groups and nodes.',
      category: 'view',
      thumbnailPath: 'resources/image/structureview.png',
      sourcePath: 'view/structureview/StructureViewDemo.js',
      tags: ['interaction'],
      keywords: ['list', 'tree', 'overview', 'structure', 'v2.1.0.3']
    },
    {
      id: 'graph-builder',
      name: 'Graph Builder',
      demoPath: 'databinding/graphbuilder/index.html',
      summary:
        'Uses class <code>GraphBuilder</code> to interactively build and modify a graph from business data.',
      category: 'databinding',
      thumbnailPath: 'resources/image/graphbuilder.png',
      sourcePath: 'databinding/graphbuilder/GraphBuilderDemo.js',
      tags: ['JSON', 'binding', 'layout'],
      keywords: ['hierarchic', 'structure']
    },
    {
      id: 'adjacent-nodes-graph-builder',
      name: 'Adjacent Nodes Graph Builder',
      demoPath: 'databinding/adjacentnodesbuilder/index.html',
      summary:
        'Uses class <code>AdjacentNodesGraphBuilder</code> to interactively build and modify a graph from business data.',
      category: 'databinding',
      thumbnailPath: 'resources/image/adjacentnodesgraphbuilder.png',
      sourcePath: 'databinding/adjacentnodesbuilder/AdjacentNodesGraphBuilderDemo.js',
      tags: ['JSON', 'binding', 'layout'],
      keywords: ['hierarchic']
    },
    {
      id: 'simple-graph-builder',
      name: 'Simple Graph Builder',
      demoPath: 'databinding/simplegraphbuilder/index.html',
      summary:
        'Uses <code>GraphBuilder</code> or <code>TreeBuilder</code> to automatically build a graph from business data.',
      category: 'databinding',
      thumbnailPath: 'resources/image/simplegraphbuilder.png',
      sourcePath: 'databinding/simplegraphbuilder/SimpleGraphBuilderDemo.js',
      tags: ['JSON', 'binding', 'layout'],
      keywords: ['hierarchic']
    },
    {
      id: 'angular-cli',
      name: 'Angular CLI',
      demoPath: 'toolkit/angular/README.html',
      summary:
        'Shows how to use yFiles for HTML in an Angular app (Angular 2 and newer) using Angular CLI.',
      category: 'integration',
      thumbnailPath: 'resources/image/angular.png',
      sourcePath: '',
      tags: ['angular', 'binding', 'typescript'],
      keywords: ['v2.1.0.0', 'tools', 'tree', 'datapanel']
    },
    {
      id: 'angularjs-1',
      name: 'AngularJS 1',
      demoPath: 'toolkit/angular1/index.html',
      summary: 'Shows how to use yFiles for HTML in an AngularJS 1 app.',
      category: 'integration',
      thumbnailPath: 'resources/image/angularjs1.png',
      sourcePath: 'toolkit/angular1/app.js',
      tags: ['angular', 'layout'],
      keywords: ['styles', 'tree', 'datapanel']
    },
    {
      id: 'neo4j',
      name: 'Neo4j',
      demoPath: 'toolkit/neo4j/index.html',
      summary: 'Shows how to load data from a Neo4j database and display it with yFiles for HTML.',
      category: 'integration',
      thumbnailPath: 'resources/image/neo4j.png',
      sourcePath: 'integration/neo4j/Neo4jDemo.js',
      tags: ['neo4j', 'database', 'layout'],
      keywords: ['organic', 'remote']
    },
    {
      id: 'nodejs',
      name: 'NodeJS',
      demoPath: 'loading/nodejs/index.html',
      summary:
        "Shows how to run a yFiles layout algorithm in a <a href='https://nodejs.org/' target='_blank'>Node.js&reg;</a> environment.",
      category: 'loading',
      thumbnailPath: 'resources/image/nodejs.png',
      sourcePath: 'loading/nodejs/NodeJsDemo.js',
      tags: ['nodejs', 'layout'],
      keywords: ['folding', 'hierarchic', 'json']
    },
    {
      id: 'react',
      name: 'React',
      demoPath: 'toolkit/react/README.html',
      summary: 'Shows how to use yFiles for HTML with the React library.',
      category: 'integration',
      thumbnailPath: 'resources/image/react.png',
      sourcePath: '',
      tags: ['react', 'webpack']
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      demoPath: 'toolkit/typescript/README.html',
      summary:
        'Shows the integration of yFiles for HTML with TypeScript (using the ES module version of yFiles).',
      category: 'integration',
      thumbnailPath: 'resources/image/typescript.png',
      sourcePath: '',
      tags: ['typescript', 'styles', 'ES modules'],
      keywords: ['overview']
    },
    {
      id: 'vue.js',
      name: 'Vue.js',
      demoPath: 'toolkit/vuejs/index.html',
      summary: 'Shows how to use yFiles for HTML with Vue.js.',
      category: 'integration',
      thumbnailPath: 'resources/image/vuejs.png',
      sourcePath: 'toolkit/vuejs/VuejsDemo.js',
      tags: ['vuejs', 'databinding'],
      keywords: ['template', 'datapanel', 'tree', 'detail']
    },
    {
      id: 'web-components',
      name: 'Web Components',
      demoPath: 'toolkit/webcomponents/index.html',
      summary: 'Shows how to use yFiles for HTML with Web Components v1.',
      category: 'integration',
      thumbnailPath: 'resources/image/web_components.png',
      sourcePath: 'toolkit/webcomponents/WebComponentsDemo.js',
      tags: ['webcomponents', 'shadowdom', 'html import']
    },
    {
      id: 'css3-animations-and-transitions',
      name: 'CSS3 Animations and Transitions',
      demoPath: 'style/css3animationsandtransitions/index.html',
      summary: 'Shows how CSS3 transformations and animations can be applied to graph items.',
      category: 'style',
      thumbnailPath: 'resources/image/css3_animations_and_transitions.png',
      sourcePath: 'style/css3animationsandtransitions/CSS3AnimationsAndTransitionsDemo.js',
      tags: ['styles', 'animation', 'transition'],
      keywords: ['curves']
    },
    {
      id: 'custom-styles',
      name: 'Custom Styles',
      demoPath: 'style/customstyles/index.html',
      summary:
        'Shows how to create custom styles for nodes, edges, labels, ports, and edge arrows.',
      category: 'style',
      thumbnailPath: 'resources/image/customstyles.png',
      sourcePath: 'style/customstyles/CustomStyleDemo.js',
      tags: ['styles', 'groups'],
      keywords: ['folding', 'labels', 'ports']
    },
    {
      id: 'vue.js-template-node-style',
      name: 'Vue.js Template Node Style',
      demoPath: 'style/vuejstemplatenodestyle/index.html',
      summary: 'Presents a very versatile and easily customizable template node style.',
      category: 'style',
      thumbnailPath: 'resources/image/vuejstemplatenodestyle.png',
      sourcePath: '',
      tags: ['styles', 'template', 'vuejs'],
      keywords: ['v2.1.0.0', 'databinding', 'datapanel', 'tree']
    },
    {
      id: 'data-table',
      name: 'Data Table',
      demoPath: 'style/datatable/index.html',
      summary: 'Shows a node style and a label style that display data in a tabular fashion.',
      category: 'style',
      thumbnailPath: 'resources/image/datatable.png',
      sourcePath: 'style/datatable/DataTableDemo.js',
      tags: ['styles', 'labels'],
      keywords: ['datatable', 'structure']
    },
    {
      id: 'html-label',
      name: 'HTML Label',
      demoPath: 'style/htmllabel/index.html',
      summary: 'Shows how HTML can be used in label text with a custom label style.',
      category: 'style',
      thumbnailPath: 'resources/image/htmllabel.png',
      sourcePath: 'style/htmllabel/HtmlLabelDemo.js',
      tags: ['styles', 'labels'],
      keywords: ['foreignObject']
    },
    {
      id: 'html-popup',
      name: 'HTML Popup',
      demoPath: 'view/htmlpopup/index.html',
      summary:
        'Shows HTML pop-up panels that displays additional information about a clicked node or edge.',
      category: 'view',
      thumbnailPath: 'resources/image/htmlpopup.png',
      sourcePath: 'view/htmlpopup/HTMLPopupDemo.js',
      tags: ['interaction', 'overlay'],
      keywords: ['htmlpopup', 'datapanel', 'tooltip', 'structure', 'detail']
    },
    {
      id: 'selection-styling',
      name: 'Selection Styling',
      demoPath: 'style/selectionstyling/index.html',
      summary:
        'Shows customized selection painting of nodes, edges and labels by decorating these items with a corresponding\n      style.',
      category: 'style',
      thumbnailPath: 'resources/image/selectionstyling.png',
      sourcePath: 'style/selectionstyling/SelectionStylingDemo.js',
      tags: ['styles', 'interaction'],
      keywords: ['selectionstyling', 'labels']
    },
    {
      id: 'style-decorators',
      name: 'Style Decorators',
      demoPath: 'style/styledecorators/index.html',
      summary:
        'Shows how to create styles for nodes, edges, and labels that wrap existing styles and add visual decorators.',
      category: 'style',
      thumbnailPath: 'resources/image/styledecorators.png',
      sourcePath: 'style/styledecorators/StyleDecoratorsDemo.js',
      tags: ['styles', 'decorators'],
      keywords: ['ports']
    },
    {
      id: 'bridges',
      name: 'Bridges',
      demoPath: 'view/bridges/index.html',
      summary:
        'Shows the capabilities of the <code>BridgeManager</code> class for inserting bridges into edge paths.',
      category: 'view',
      thumbnailPath: 'resources/image/bridges.png',
      sourcePath: 'view/bridges/BridgesDemo.js',
      tags: ['line gaps', 'line jumps'],
      keywords: ['intersection', 'intersecting', 'groups']
    },
    {
      id: 'edge-to-edge',
      name: 'Edge To Edge',
      demoPath: 'view/edgetoedge/index.html',
      summary: 'Shows edge-to-edge connections.',
      category: 'view',
      thumbnailPath: 'resources/image/edge_to_edge.png',
      sourcePath: 'view/edgetoedge/EdgeToEdgeDemo.js',
      tags: ['edge creation', 'interaction'],
      keywords: ['portcandidateprovider']
    },
    {
      id: 'file-operations',
      name: 'File Operations',
      demoPath: 'view/fileoperations/index.html',
      summary: 'shows various ways to open and save a graph as GraphML.',
      category: 'view',
      thumbnailPath: 'resources/image/fileoperations.png',
      sourcePath: 'view/fileoperations/FileOperationsDemo.js',
      tags: ['I/O', 'export', 'GraphML'],
      keywords: ['load', 'save', 'IO']
    },
    {
      id: 'graphml',
      name: 'GraphML',
      demoPath: 'view/graphml/index.html',
      summary: "Provides a live view of the graph's GraphML representation.",
      category: 'view',
      thumbnailPath: 'resources/image/graphml.png',
      sourcePath: 'view/graphml/GraphMLDemo.html',
      tags: ['GraphML', 'I/O'],
      keywords: ['load', 'save', 'IO', 'datapanel', 'groups', 'folding']
    },
    {
      id: 'graphml-compatibility',
      name: 'GraphML Compatibility',
      demoPath: 'view/graphmlcompatibility/index.html',
      summary: 'Shows how to enable read compatibility for GraphML files from older versions.',
      category: 'view',
      thumbnailPath: 'resources/image/graphmlcompatibility.png',
      sourcePath: 'view/graphmlcompatibility/GraphMLCompatibilityDemo.js',
      tags: ['GraphML', 'I/O'],
      keywords: ['load', 'save', 'IO', '1.3']
    },
    {
      id: 'amd-loading',
      name: 'AMD Loading',
      demoPath: 'loading/amdloading/index.html',
      summary: 'Loads the yFiles library modules with the AMD loading standard (require.js).',
      category: 'loading',
      thumbnailPath: 'resources/image/amdloading.png',
      sourcePath: 'loading/amdloading/AmdLoadingDemo.js',
      tags: ['loader', 'modules'],
      keywords: ['requirejs', 'nonsymbolic']
    },
    {
      id: 'es-module-loading',
      name: 'ES Module Loading',
      demoPath: 'loading/esmodules/index.html',
      summary: 'Loads the yFiles module resources using ES module imports.',
      category: 'loading',
      thumbnailPath: 'resources/image/esmodules.png',
      sourcePath: 'loading/esmodules/src/ESModulesDemo.js',
      tags: ['ES modules', 'import'],
      keywords: ['v2.1.0.0', 'hierarchic']
    },
    {
      id: 'browserify',
      name: 'Browserify',
      demoPath: 'loading/browserify/README.html',
      summary:
        'Shows how to bundle the yFiles library in a <a href="https://browserify.org" target="_blank">Browserify</a> project.',
      category: 'loading',
      thumbnailPath: 'resources/image/browserify.png',
      sourcePath: 'loading/browserify/browserify-demo.js',
      tags: ['deployment', 'modules'],
      keywords: ['organic']
    },
    {
      id: 'rollup',
      name: 'Rollup.js',
      demoPath: 'loading/rollupjs/README.html',
      summary:
        'Shows how to bundle the yFiles library in a <a href="https://rollupjs.org" target="_blank">rollup</a> project.',
      category: 'loading',
      thumbnailPath: 'resources/image/scriptloading.png',
      sourcePath: 'loading/rollupjs/src/RollupJsDemo.js',
      tags: ['deployment', 'modules', 'rollup', 'optimizer'],
      keywords: ['v2.2.0.0']
    },
    {
      id: 'script-loading',
      name: 'Script Loading',
      demoPath: 'loading/scriptloading/index.html',
      summary: 'Loads the yFiles modules using plain old &lt;script&gt; tags.',
      category: 'loading',
      thumbnailPath: 'resources/image/scriptloading.png',
      sourcePath: 'loading/scriptloading/ScriptLoadingDemo.html',
      tags: ['loader', 'modules'],
      keywords: ['scriptloading', 'nonsymbolic']
    },
    {
      id: 'web-worker',
      name: 'Web Worker',
      demoPath: 'loading/webworker/README.html',
      summary:
        'Shows how to run a yFiles layout algorithm in a Web Worker task in order to prevent the layout calculation from blocking the UI.',
      category: 'loading',
      thumbnailPath: 'resources/image/webworker.png',
      sourcePath: 'loading/webworker/WebWorkerDemo.js',
      tags: ['threading', 'layout', 'hierarchic'],
      keywords: ['threads', 'background', 'json', 'folding', 'hierarchic']
    },
    {
      id: 'web-worker-umd',
      name: 'Web Worker UMD',
      demoPath: 'loading/webworker-umd/index.html',
      summary:
        'Shows how to run a yFiles layout algorithm in a Web Worker task in order to prevent the layout calculation from blocking the UI.',
      category: 'loading',
      thumbnailPath: 'resources/image/webworker.png',
      sourcePath: 'loading/webworker-umd/WebWorkerDemo.js',
      tags: ['threading', 'layout', 'hierarchic'],
      keywords: ['threads', 'background', 'json', 'folding', 'hierarchic', 'nonsymbolic']
    },
    {
      id: 'webpack',
      name: 'webpack',
      demoPath: 'loading/webpack/README.html',
      summary:
        'Shows how to integrate the yFiles library in a <a href="https://webpack.js.org" target="_blank">webpack</a> project using ES modules.',
      category: 'loading',
      thumbnailPath: 'resources/image/webpack.png',
      sourcePath: 'loading/webpack/src/webpack-demo.js',
      tags: ['nodejs', 'npm', 'ES Modules', 'deployment', 'layout'],
      keywords: ['organic']
    },
    {
      id: 'clipboard',
      name: 'Clipboard',
      demoPath: 'view/clipboard/index.html',
      summary:
        'Shows different ways of using the class GraphClipboard for Copy & Paste operations.',
      category: 'view',
      thumbnailPath: 'resources/image/clipboard.png',
      sourcePath: 'view/clipboard/ClipboardDemo.js',
      tags: ['interaction', 'copy', 'paste']
    },
    {
      id: 'rendering-order',
      name: 'Rendering Order',
      demoPath: 'view/renderingorder/index.html',
      summary: 'Shows different rendering order settings.',
      category: 'view',
      thumbnailPath: 'resources/image/renderingorder.png',
      sourcePath: 'view/renderingorder/RenderingOrderDemo.js',
      tags: ['rendering', 'zorder', 'nesting'],
      keywords: ['hierarchicnesting', 'ports', 'labels', 'groups']
    },
    {
      id: 'custom-label-model',
      name: 'Custom Label Model',
      demoPath: 'input/customlabelmodel/index.html',
      summary: 'Shows how to implement and use a custom label model.',
      category: 'input',
      thumbnailPath: 'resources/image/custom_label_model.png',
      sourcePath: 'input/customlabelmodel/CustomLabelModelDemo.js',
      tags: ['interaction', 'labels'],
      keywords: ['placement']
    },
    {
      id: 'custom-port-location-model',
      name: 'Custom Port Location Model',
      demoPath: 'input/customportmodel/index.html',
      summary: 'Shows how to implement and use a custom port location model.',
      category: 'input',
      thumbnailPath: 'resources/image/custom_port_model.png',
      sourcePath: 'input/customportmodel/CustomPortModelDemo.js',
      tags: ['interaction', 'ports'],
      keywords: ['portcandidateprovider', 'placement']
    },
    {
      id: 'custom-snapping',
      name: 'Custom Snapping',
      demoPath: 'input/customsnapping/index.html',
      summary: 'Shows how the snapping feature can be customized.',
      category: 'input',
      thumbnailPath: 'resources/image/CustomSnapping.mp4',
      sourcePath: 'input/customsnapping/CustomSnappingDemo.js',
      tags: ['interaction', 'snapping'],
      keywords: ['guides', 'lines', 'labels', 'move']
    },
    {
      id: 'context-menu',
      name: 'Context Menu',
      demoPath: 'input/contextmenu/index.html',
      summary:
        'Shows how to add a context menu to the nodes of a graph and to the canvas background.',
      category: 'input',
      thumbnailPath: 'resources/image/contextmenu.png',
      sourcePath: 'input/contextmenu/ContextMenuDemo.js',
      tags: ['interaction'],
      keywords: ['contextmenu', 'copy']
    },
    {
      id: 'drag-and-drop',
      name: 'Drag and Drop',
      demoPath: 'input/draganddrop/index.html',
      summary: 'Shows drag and drop of nodes, groups and labels.',
      category: 'input',
      thumbnailPath: 'resources/image/draganddrop.png',
      sourcePath: 'input/draganddrop/DragAndDropDemo.js',
      tags: ['interaction'],
      keywords: ['draganddrop', 'palette', 'ports', 'labels', 'groups', 'html5', 'native', 'move']
    },
    {
      id: 'edge-reconnection',
      name: 'Edge Reconnection',
      demoPath: 'input/edgereconnection/index.html',
      summary: 'Shows how the reconnection of edge ports can be customized and restricted.',
      category: 'input',
      thumbnailPath: 'resources/image/edgereconnection.png',
      sourcePath: 'input/edgereconnection/EdgeReconnectionPortCandidateProviderDemo.js',
      tags: ['interaction'],
      keywords: ['portcandidateprovider', 'ports']
    },
    {
      id: 'label-editing',
      name: 'Label Editing',
      demoPath: 'input/labelediting/index.html',
      summary: 'Shows customizations of the interactive label editing.',
      category: 'input',
      thumbnailPath: 'resources/image/label_editing.png',
      sourcePath: 'input/labelediting/LabelEditingDemo.js',
      tags: ['interaction', 'labels'],
      keywords: ['text', 'validation']
    },
    {
      id: 'label-handle-provider',
      name: 'Label Handle Provider',
      demoPath: 'input/labelhandleprovider/index.html',
      summary:
        'Shows how to implement custom handles that allow interactive resizing and rotation of labels.',
      category: 'input',
      thumbnailPath: 'resources/image/LabelHandleProvider.png',
      sourcePath: 'input/labelhandleprovider/LabelHandleProviderDemo.js',
      tags: ['interaction', 'labels'],
      keywords: ['handles']
    },
    {
      id: 'move-unselected-nodes',
      name: 'Move Unselected Nodes',
      demoPath: 'input/moveunselectednodes/index.html',
      summary:
        'Shows a special input mode that allows you to move nodes without selecting them first.',
      category: 'input',
      thumbnailPath: 'resources/image/move_unselected_nodes.png',
      sourcePath: 'input/moveunselectednodes/MoveUnselectedNodesDemo.js',
      tags: ['interaction', 'selection'],
      keywords: ['inputmode', 'move']
    },
    {
      id: 'orthogonal-edges',
      name: 'Orthogonal Edges',
      demoPath: 'input/orthogonaledges/index.html',
      summary: 'Shows the customization of orthogonal edge editing.',
      category: 'input',
      thumbnailPath: 'resources/image/OrthogonalEdges.mp4',
      sourcePath: 'input/orthogonaledges/OrthogonalEdgesDemo.js',
      tags: ['interaction'],
      keywords: ['orthogonaledges', 'move']
    },
    {
      id: 'port-candidate-provider',
      name: 'Port Candidate Provider',
      demoPath: 'input/portcandidateprovider/index.html',
      summary: 'Shows how edge creation can be customized.',
      category: 'input',
      thumbnailPath: 'resources/image/portcandidateprovider.png',
      sourcePath: 'input/portcandidateprovider/PortCandidateProviderDemo.js',
      tags: ['interaction', 'ports'],
      keywords: ['portcandidateprovider']
    },
    {
      id: 'position-handler',
      name: 'Position Handler',
      demoPath: 'input/positionhandler/index.html',
      summary: 'Shows how to customize and restrict the movement behavior of nodes.',
      category: 'input',
      thumbnailPath: 'resources/image/PositionHandler.mp4',
      sourcePath: 'input/positionhandler/PositionHandlerDemo.js',
      tags: ['interaction'],
      keywords: ['positionhandler', 'move']
    },
    {
      id: 'reparent-handler',
      name: 'Reparent Handler',
      demoPath: 'input/reparenthandler/index.html',
      summary: 'Shows how reparenting of nodes can be customized.',
      category: 'input',
      thumbnailPath: 'resources/image/reparenthandler.png',
      sourcePath: 'input/reparenthandler/ReparentHandlerDemo.js',
      tags: ['interaction', 'groups'],
      keywords: ['reparenthandler']
    },
    {
      id: 'reshape-handle-provider',
      name: 'Reshape Handle Provider',
      demoPath: 'input/reshapehandleprovider/index.html',
      summary: 'Shows how resizing of nodes can be customized.',
      category: 'input',
      thumbnailPath: 'resources/image/ReshapeHandle.mp4',
      sourcePath: 'input/reshapehandleprovider/ReshapeHandleProviderDemo.js',
      tags: ['interaction', 'reshapehandleprovider'],
      keywords: ['handles']
    },
    {
      id: 'lasso-selection',
      name: 'Lasso Selection',
      demoPath: 'input/lassoselection/index.html',
      summary: 'Shows how to configure a lasso tool for freeform selection.',
      category: 'input',
      thumbnailPath: 'resources/image/lassoselection.png',
      sourcePath: 'input/lassoselection/LassoSelectionDemo.js',
      tags: ['interaction', 'selection'],
      keywords: ['v2.1.0.2', 'testable', 'free']
    },
    {
      id: 'single-selection',
      name: 'Single Selection',
      demoPath: 'input/singleselection/index.html',
      summary: 'Shows how to configure GraphEditorInputMode for single selection mode.',
      category: 'input',
      thumbnailPath: 'resources/image/singleselection.png',
      sourcePath: 'input/singleselection/SingleSelectionDemo.js',
      tags: ['interaction', 'selection'],
      keywords: ['singleselection']
    },
    {
      id: 'size-constraint-provider',
      name: 'Size Constraint Provider',
      demoPath: 'input/sizeconstraintprovider/index.html',
      summary: 'Shows how resizing of nodes can be restricted.',
      category: 'input',
      thumbnailPath: 'resources/image/SizeConstraint.mp4',
      sourcePath: 'input/sizeconstraintprovider/SizeConstraintProviderDemo.js',
      tags: ['interaction'],
      keywords: ['sizeconstraintprovider', 'handles']
    },
    {
      id: 'tutorial-getting-started--graphcomponent',
      name: '01 Creating the View',
      summary:
        'Introduces class GraphComponent, which is the central UI element for working with graphs.',
      demoPath: '01-tutorial-getting-started/01-graphcomponent/index.html',
      thumbnailPath: 'resources/image/tutorial1step1.png',
      category: 'tutorial-getting-started',
      tags: ['tutorial', 'getting started']
    },
    {
      id: 'tutorial-getting-started--graph-element-creation',
      name: '02 Creating Graph Elements',
      summary: 'Shows how to create the basic graph elements.',
      demoPath: '01-tutorial-getting-started/02-graph-element-creation/index.html',
      thumbnailPath: 'resources/image/tutorial1step2.png',
      category: 'tutorial-getting-started',
      tags: ['tutorial', 'getting started'],
      keywords: ['node', 'edge', 'label']
    },
    {
      id: 'tutorial-getting-started--managing-viewport',
      name: '03 Managing Viewport',
      summary: 'Shows how to work with the viewport.',
      demoPath: '01-tutorial-getting-started/03-managing-viewport/index.html',
      thumbnailPath: 'resources/image/tutorial1step2.png',
      category: 'tutorial-getting-started',
      tags: ['tutorial', 'getting started'],
      keywords: ['zoom', 'fit content']
    },
    {
      id: 'tutorial-getting-started--setting-styles',
      name: '04 Setting Styles',
      summary: 'Shows how to configure the visual appearance of graph elements using styles.',
      demoPath: '01-tutorial-getting-started/04-setting-styles/index.html',
      thumbnailPath: 'resources/image/tutorial1step4.png',
      category: 'tutorial-getting-started',
      tags: ['tutorial', 'getting started'],
      keywords: [
        'DefaultLabelStyle',
        'ShapeNodeStyle',
        'ShinyPlateNodeStyle',
        'PolylineEdgeStyle',
        'Arrow'
      ]
    },
    {
      id: 'tutorial-getting-started--label-placement',
      name: '05 Label Placement',
      summary:
        'Shows how to control label placement with the help of so called label model parameters.',
      demoPath: '01-tutorial-getting-started/05-label-placement/index.html',
      thumbnailPath: 'resources/image/tutorial1step5.png',
      category: 'tutorial-getting-started',
      tags: ['tutorial', 'getting started'],
      keywords: ['InteriorLabelModel', 'SmartEdgeLabelModel']
    },
    {
      id: 'tutorial-getting-started--basic-interaction',
      name: '06 Basic Interaction',
      summary:
        'Shows the default interaction gestures that are provided by class GraphEditorInputMode.',
      demoPath: '01-tutorial-getting-started/06-basic-interaction/index.html',
      thumbnailPath: 'resources/image/tutorial1step6.png',
      category: 'tutorial-getting-started',
      tags: ['tutorial', 'getting started']
    },
    {
      id: 'tutorial-getting-started--undo-clipboard-support',
      name: '07 Undo Clipboard Support',
      summary: 'Shows how to use the undo and clipboard features.',
      demoPath: '01-tutorial-getting-started/07-undo-clipboard-support/index.html',
      thumbnailPath: 'resources/image/tutorial1step7.png',
      category: 'tutorial-getting-started',
      tags: ['tutorial', 'getting started'],
      keywords: ['cut', 'copy', 'paste', 'redo']
    },
    {
      id: 'tutorial-getting-started--grouping',
      name: '08 Grouping',
      summary: 'Shows how to configure support for grouped (or hierarchically organized) graphs.',
      demoPath: '01-tutorial-getting-started/08-grouping/index.html',
      thumbnailPath: 'resources/image/tutorial1step8.png',
      category: 'tutorial-getting-started',
      tags: ['tutorial', 'getting started'],
      keywords: ['PanelNodeStyle', 'InteriorStretchLabelModel']
    },
    {
      id: 'tutorial-getting-started--data-binding',
      name: '09 Data Binding',
      summary: 'Shows how to bind data to graph elements.',
      demoPath: '01-tutorial-getting-started/09-data-binding/index.html',
      thumbnailPath: 'resources/image/tutorial1step9.png',
      category: 'tutorial-getting-started',
      tags: ['tutorial', 'getting started'],
      keywords: ['Mapper']
    },
    {
      id: 'tutorial-getting-started--layout',
      name: '10 Layout',
      summary:
        'Shows how to use the layout algorithms in yFiles for HTML to automatically place the graph elements.',
      demoPath: '01-tutorial-getting-started/10-layout/index.html',
      thumbnailPath: 'resources/image/tutorial1step10.png',
      category: 'tutorial-getting-started',
      tags: ['tutorial', 'getting started', 'hierarchic'],
      keywords: ['morphLayout']
    },
    {
      id: 'tutorial-getting-started--layout-data',
      name: '11 Layout Data',
      summary: 'Shows how to configure individual settings for each node for the automatic layout.',
      demoPath: '01-tutorial-getting-started/11-layout-data/index.html',
      thumbnailPath: 'resources/image/tutorial1step11.png',
      category: 'tutorial-getting-started',
      tags: ['tutorial', 'getting started'],
      keywords: ['v2.2.0.0', 'hierarchic']
    },
    {
      id: 'tutorial-getting-started--custom-ports',
      name: '12 Custom Ports',
      summary: 'This step presents the ILookup interface.',
      demoPath: '01-tutorial-getting-started/12-custom-ports/index.html',
      thumbnailPath: 'resources/image/tutorial1step12.png',
      category: 'tutorial-getting-started',
      tags: ['tutorial', 'getting started'],
      keywords: ['decorator', 'candidate', 'provider']
    },
    {
      id: 'tutorial-getting-started--layout',
      name: '13 Analysis Algorithms',
      summary: 'Shows how to use the graph analysis algorithms.',
      demoPath: '01-tutorial-getting-started/13-graph-analysis/index.html',
      thumbnailPath: 'resources/image/tutorial1step10.png',
      category: 'tutorial-getting-started',
      tags: ['tutorial', 'getting started', 'analysis'],
      keywords: ['Reachability', 'ShortestPaths', 'v2.2.0.0']
    },
    {
      id: 'tutorial-custom-styles--custom-node-style',
      name: '01 Custom Node Style',
      summary: 'Shows how to create a custom node style.',
      demoPath: '02-tutorial-custom-styles/01-custom-node-style/index.html',
      thumbnailPath: 'resources/image/tutorial2step1.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles'],
      keywords: ['NodeStyleBase']
    },
    {
      id: 'tutorial-custom-styles--node-color',
      name: '02 Node Color',
      summary: 'Shows how to change the style of the nodes based on their tag.',
      demoPath: '02-tutorial-custom-styles/02-node-color/index.html',
      thumbnailPath: 'resources/image/tutorial2step2.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--update-visual-and-render-data-cache',
      name: '03 Update Visual And Render Data Cache',
      summary: 'Shows how to implement high-performance rendering of nodes.',
      demoPath: '02-tutorial-custom-styles/03-update-visual-and-render-data-cache/index.html',
      thumbnailPath: 'resources/image/tutorial2step3.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--is-inside',
      name: '04 Is Inside',
      summary: 'Shows how to override isInside() and getOutline() of NodeStyleBase.',
      demoPath: '02-tutorial-custom-styles/04-is-inside/index.html',
      thumbnailPath: 'resources/image/tutorial2step1.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--hit-test',
      name: '05 Hit Test',
      summary: 'Shows how to override isHit() and isInBox() of NodeStyleBase.',
      demoPath: '02-tutorial-custom-styles/05-hit-test/index.html',
      thumbnailPath: 'resources/image/tutorial2step1.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--get-bounds',
      name: '06 Get Bounds',
      summary: 'Shows how to override getBounds() of NodeStyleBase.',
      demoPath: '02-tutorial-custom-styles/06-get-bounds/index.html',
      thumbnailPath: 'resources/image/tutorial2step1.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--drop-shadow-performance',
      name: '07 Drop Shadow Performance',
      summary:
        'This step replaces the simple drop shadow in the last steps with a more visually appealing, blurred one.',
      demoPath: '02-tutorial-custom-styles/07-drop-shadow-performance/index.html',
      thumbnailPath: 'resources/image/tutorial2step7.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--edge-from-node-to-label',
      name: '08 Edge From Node To Label',
      summary: 'Shows how to visually connect a label to its owner node with a line.',
      demoPath: '02-tutorial-custom-styles/08-edge-from-node-to-label/index.html',
      thumbnailPath: 'resources/image/tutorial2step8.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--is-visible',
      name: '09 Is Visible',
      summary: 'Shows how to override the method isVisible() of NodeStyleBase.',
      demoPath: '02-tutorial-custom-styles/09-is-visible/index.html',
      thumbnailPath: 'resources/image/tutorial2step1.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--custom-label-style',
      name: '10 Custom Label Style',
      summary: 'Shows how a custom label style.',
      demoPath: '02-tutorial-custom-styles/10-custom-label-style/index.html',
      thumbnailPath: 'resources/image/tutorial2step10.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles'],
      keywords: ['LabelStyleBase']
    },
    {
      id: 'tutorial-custom-styles--label-preferred-size',
      name: '11 Label Preferred Size',
      summary:
        'Shows how to set the size of the label based on the size of its text by overriding the LabelStyleBase#getPreferredSize() method.',
      demoPath: '02-tutorial-custom-styles/11-label-preferred-size/index.html',
      thumbnailPath: 'resources/image/tutorial2step11.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--high-performance-label-rendering',
      name: '12 High Performance Label Rendering',
      summary: 'Shows how to implement high-performance rendering for labels.',
      demoPath: '02-tutorial-custom-styles/12-high-performance-label-rendering/index.html',
      thumbnailPath: 'resources/image/tutorial2step11.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--label-edit-button',
      name: '13 Label Edit Button',
      summary: 'Shows how to display a button on a label that starts the label editor.',
      demoPath: '02-tutorial-custom-styles/13-label-edit-button/index.html',
      thumbnailPath: 'resources/image/tutorial2step13.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--button-visibility',
      name: '14 Button Visibility',
      summary: "Shows how to hide the 'Label Edit' button based on the zoom level.",
      demoPath: '02-tutorial-custom-styles/14-button-visibility/index.html',
      thumbnailPath: 'resources/image/tutorial2step13.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--using-data-in-label-tag',
      name: '15 Using Data In Label Tag',
      summary:
        "Shows how to use data from a business object, which is stored in the label's tag, for rendering.",
      demoPath: '02-tutorial-custom-styles/15-using-data-in-label-tag/index.html',
      thumbnailPath: 'resources/image/tutorial2step15.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--custom-edge-style',
      name: '16 Custom Edge Style',
      summary:
        'Shows how to create a custom edge style which allows to specify the edge thickness by setting a property on the style.',
      demoPath: '02-tutorial-custom-styles/16-custom-edge-style/index.html',
      thumbnailPath: 'resources/image/tutorial2step16.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles'],
      keywords: ['EdgeStyleBase']
    },
    {
      id: 'tutorial-custom-styles--edge-hit-test',
      name: '17 Edge Hit Test',
      summary:
        'Shows how to take the thickness of the edge into account when checking if the edge was clicked.',
      demoPath: '02-tutorial-custom-styles/17-edge-hit-test/index.html',
      thumbnailPath: 'resources/image/tutorial2step17.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--edge-cropping',
      name: '18 Edge Cropping',
      summary: "Shows how to crop an edge at the node's bounds.",
      demoPath: '02-tutorial-custom-styles/18-edge-cropping/index.html',
      thumbnailPath: 'resources/image/tutorial2step18.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--animated-edge-selection',
      name: '19 Animated Edge Selection',
      summary: 'Shows how to change the style of an edge if the edge is selected.',
      demoPath: '02-tutorial-custom-styles/19-animated-edge-selection/index.html',
      thumbnailPath: 'resources/image/tutorial2step19.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--custom-arrow',
      name: '20 Custom Arrow',
      summary: 'Shows a custom arrow.',
      demoPath: '02-tutorial-custom-styles/20-custom-arrow/index.html',
      thumbnailPath: 'resources/image/tutorial2step20.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--edge-performance',
      name: '21 Edge Performance',
      summary: 'Shows how to optimize rendering performance for edges and arrows.',
      demoPath: '02-tutorial-custom-styles/21-edge-performance/index.html',
      thumbnailPath: 'resources/image/tutorial2step20.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--arrow-thickness',
      name: '22 Arrow Thickness',
      summary: 'Shows how to render the arrow based on a property of its edge.',
      demoPath: '02-tutorial-custom-styles/22-arrow-thickness/index.html',
      thumbnailPath: 'resources/image/tutorial2step22.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--custom-ports',
      name: '23 Custom Ports',
      summary: 'Shows a custom port style.',
      demoPath: '02-tutorial-custom-styles/23-custom-ports/index.html',
      thumbnailPath: 'resources/image/tutorial2step23.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles'],
      keywords: ['PortStyleBase']
    },
    {
      id: 'tutorial-custom-styles--style-decorator',
      name: '24 Style Decorator',
      summary: 'Shows how to enhance an existing node style by adding visual decorators.',
      demoPath: '02-tutorial-custom-styles/24-style-decorator/index.html',
      thumbnailPath: 'resources/image/tutorial2step23.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'introduction']
    },
    {
      id: 'tutorial-custom-styles--custom-group-style',
      name: '25 Custom Group Style',
      summary: 'Shows how to implement a special node style for group nodes.',
      demoPath: '02-tutorial-custom-styles/25-custom-group-style/index.html',
      thumbnailPath: 'resources/image/tutorial2step25.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles'],
      keywords: ['CollapsibleNodeStyleDecoratorRenderer', 'NodeStyleBase']
    },
    {
      id: 'tutorial-custom-styles--custom-group-bounds',
      name: '26 Custom Group Bounds',
      summary:
        'Shows how to customize the way that the group insets are calculated by implementing an ILayoutGroupBoundsCalculator.',
      demoPath: '02-tutorial-custom-styles/26-custom-group-bounds/index.html',
      thumbnailPath: 'resources/image/tutorial2step26.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--canvas-painting',
      name: '27 Canvas Painting',
      summary:
        'Shows how to implement a zoom-dependent high-performance rendering using HTML5 Canvas painting for nodes.',
      demoPath: '02-tutorial-custom-styles/27-canvas-painting/index.html',
      thumbnailPath: 'resources/image/tutorial2step27.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--bridge-support',
      name: '28 Bridge Support',
      summary: 'Shows how to enable bridges for a custom edge style.',
      demoPath: '02-tutorial-custom-styles/28-bridge-support/index.html',
      thumbnailPath: 'resources/image/tutorial2step28.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-custom-styles--label-line-wrapping',
      name: '29 Label Line Wrapping',
      summary:
        'Shows how to enhance a custom label style to support different line wrapping (trimming) styles as well as text clipping at the label bounds.',
      demoPath: '02-tutorial-custom-styles/29-label-line-wrapping/index.html',
      thumbnailPath: 'resources/image/tutorial2step29.png',
      category: 'tutorial-custom-styles',
      tags: ['tutorial', 'custom styles']
    },
    {
      id: 'tutorial-application-features--application-features-base',
      name: 'Application Features Base',
      summary: 'This demo is the base for the feature-specific demos of this tutorial.',
      demoPath: '03-tutorial-application-features/application-features-base/index.html',
      thumbnailPath: 'resources/image/tutorial3step1.png',
      category: 'tutorial-application-features',
      tags: ['template', 'simple', 'app']
    },
    {
      id: 'tutorial-application-features--background-image',
      name: 'Background Image',
      summary: 'Shows how to add a background visualizations to a graph component.',
      demoPath: '03-tutorial-application-features/background-image/index.html',
      thumbnailPath: 'resources/image/tutorial3step2.png',
      category: 'tutorial-application-features',
      tags: ['rectangle', 'icon', 'group'],
      keywords: ['v2.2.0.0', 'ICanvasObjectGroup', 'backgroundGroup']
    },
    {
      id: 'tutorial-application-features--building-graph-from-data',
      name: 'Building Graphs From Data',
      summary: 'Shows how to build a graph from data in JSON format.',
      demoPath: '03-tutorial-application-features/building-graph-from-data/index.html',
      thumbnailPath: 'resources/image/tutorial3step3.png',
      category: 'tutorial-application-features',
      tags: ['JSON', 'file', 'input'],
      keywords: ['I/O', 'read']
    },
    {
      id: 'tutorial-application-features--building-swimlanes-from-data',
      name: 'Building Swimlanes From Data',
      summary: 'Shows how to build a graph with swimlanes from data in JSON format.',
      demoPath: '03-tutorial-application-features/building-swimlanes-from-data/index.html',
      thumbnailPath: 'resources/image/tutorial3step4.png',
      category: 'tutorial-application-features',
      tags: ['JSON', 'lanes', 'table'],
      keywords: ['I/O', 'read', 'input']
    },
    {
      id: 'tutorial-application-features--clickable-style-decorator',
      name: 'Clickable Style Decorator',
      summary: 'Illustrates an approach for handling clicks on specific areas of the style.',
      demoPath: '03-tutorial-application-features/clickable-style-decorator/index.html',
      thumbnailPath: 'resources/image/tutorial3step5.png',
      category: 'tutorial-application-features',
      tags: ['mouse', 'icon', 'region', 'image'],
      keywords: ['NodeDecorator', 'ILookupDecorator', 'NodeStyleBase', 'event']
    },
    {
      id: 'tutorial-application-features--drag-and-drop',
      name: 'Drag And Drop',
      summary:
        'Shows how to enable dragging nodes from a panel and drop them into the graph component.',
      demoPath: '03-tutorial-application-features/drag-and-drop/index.html',
      thumbnailPath: 'resources/image/tutorial03.png',
      category: 'tutorial-application-features',
      tags: ['mouse', 'event', 'input mode'],
      keywords: ['DropInputMode', 'addDragDroppedListener', 'move']
    },
    {
      id: 'tutorial-application-features--external-links',
      name: 'External Links',
      summary: 'Shows how to add labels that act like external links and open in a new window.',
      demoPath: '03-tutorial-application-features/external-links/index.html',
      thumbnailPath: 'resources/image/tutorial3step8.png',
      category: 'tutorial-application-features',
      tags: ['navigation', 'tab', 'clickable'],
      keywords: ['ItemHoverInputMode', 'CONTROL']
    },
    {
      id: 'tutorial-application-features--filtering',
      name: 'Filtering',
      summary: 'Shows how to configure graph filtering.',
      demoPath: '03-tutorial-application-features/filtering/index.html',
      thumbnailPath: 'resources/image/tutorial3step9.png',
      category: 'tutorial-application-features',
      tags: ['hide', 'subset', 'group'],
      keywords: ['v2.2.0.0', 'FilteredGraphWrapper', 'predicate']
    },
    {
      id: 'tutorial-application-features--filtering-with-folding',
      name: 'Filtering With Folding',
      summary: 'Shows how to configure filtering and folding in the same application.',
      demoPath: '03-tutorial-application-features/filtering-with-folding/index.html',
      thumbnailPath: 'resources/image/tutorial3step10.png',
      category: 'tutorial-application-features',
      tags: ['hide', 'subset', 'folder', 'group'],
      keywords: [
        'v2.2.0.0',
        'FilteredGraphWrapper',
        'predicate',
        'masterGraph',
        'wrappedGraph',
        'FoldingManager',
        'nest',
        'folded',
        'hide'
      ]
    },
    {
      id: 'tutorial-application-features--folding',
      name: 'Folding',
      summary: 'Shows how to enable collapsing and expanding of group nodes.',
      demoPath: '03-tutorial-application-features/folding/index.html',
      thumbnailPath: 'resources/image/tutorial3step11.png',
      category: 'tutorial-application-features',
      tags: ['folder', 'group', 'folded'],
      keywords: [
        'v2.2.0.0',
        'masterGraph',
        'wrappedGraph',
        'FoldingManager',
        'collapse',
        'expand',
        'nest',
        'hide'
      ]
    },
    {
      id: 'tutorial-application-features--graph-copy',
      name: 'Graph Copy',
      summary: 'Shows how to copy a graph or parts of a graph.',
      demoPath: '03-tutorial-application-features/graph-copy/index.html',
      thumbnailPath: 'resources/image/tutorial3graphcopy.png',
      category: 'tutorial-application-features',
      tags: ['clipboard', 'cut', 'paste'],
      keywords: ['v2.2.0.0', 'GraphCopier', 'copy']
    },
    {
      id: 'tutorial-application-features--graph-search',
      name: 'Graph Search',
      summary: 'Shows how to search for specific nodes in a graph.',
      demoPath: '03-tutorial-application-features/graph-search/index.html',
      thumbnailPath: 'resources/image/tutorial3step12.png',
      category: 'tutorial-application-features',
      tags: ['highlight', 'query', 'match', 'find'],
      keywords: ['v2.2.0.0']
    },
    {
      id: 'tutorial-application-features--grid-snapping',
      name: 'Grid Snapping',
      summary: 'Shows how to enable grid snapping during interactive changes.',
      demoPath: '03-tutorial-application-features/grid-snapping/index.html',
      thumbnailPath: 'resources/image/tutorial3step13.png',
      category: 'tutorial-application-features',
      tags: ['align', 'visual', 'interactive'],
      keywords: ['GraphSnapContext', 'LabelSnapContext', 'GridSnapTypes', 'GridVisualCreator']
    },
    {
      id: 'tutorial-application-features--input-output',
      name: 'Save and Load GraphML',
      summary: 'Shows how to use GraphML input and output.',
      demoPath: '03-tutorial-application-features/input-output/index.html',
      thumbnailPath: 'resources/image/tutorial3step1.png',
      category: 'tutorial-application-features',
      tags: ['I/O', 'read', 'write', 'file'],
      keywords: ['GraphMLSupport']
    },
    {
      id: 'tutorial-application-features--custom-graphml',
      name: 'Custom Data in GraphML',
      summary: 'Shows how to read and write additional data from and to GraphML.',
      demoPath: '03-tutorial-application-features/custom-graphml/index.html',
      thumbnailPath: 'resources/image/tutorial3step1.png',
      category: 'tutorial-application-features',
      tags: ['property', 'save', 'tooltip', 'I/O'],
      keywords: ['IMapper', 'mapperRegistry', 'GraphMLIOHandler']
    },
    {
      id: 'tutorial-application-features--label-text-wrapping',
      name: 'Label Text Wrapping',
      summary: 'Shows how to enable label text wrapping and trimming.',
      demoPath: '03-tutorial-application-features/label-text-wrapping/index.html',
      thumbnailPath: 'resources/image/tutorial3step15.png',
      category: 'tutorial-application-features',
      tags: ['character', 'word', 'ellipsis'],
      keywords: ['TextWrapping', 'line break']
    },
    {
      id: 'tutorial-application-features--level-of-detail-style',
      name: 'Level of Detail Style',
      summary: 'Shows a node style that hides details when zooming out.',
      demoPath: '03-tutorial-application-features/level-of-detail-style/index.html',
      thumbnailPath: 'resources/image/tutorial3step16.png',
      category: 'tutorial-application-features',
      tags: ['overview', 'data', 'intermediate'],
      keywords: ['v2.2.0.0', 'bind', 'performance', 'readability', 'hide', 'detail']
    },
    {
      id: 'tutorial-application-features--native-listeners',
      name: 'Native Listeners',
      summary: 'Illustrates how to register native event listeners to a SVG elements of a style.',
      demoPath: '03-tutorial-application-features/native-listeners/index.html',
      thumbnailPath: 'resources/image/tutorial3step17.png',
      category: 'tutorial-application-features',
      tags: ['decorator', 'mouse'],
      keywords: ['NodeDecorator', 'ILookupDecorator', 'NodeStyleBase', 'event']
    },
    {
      id: 'tutorial-application-features--orthogonal-edges',
      name: 'Orthogonal Edges',
      summary: 'Shows how to enable interactive orthogonal edge editing.',
      demoPath: '03-tutorial-application-features/orthogonal-edges/index.html',
      thumbnailPath: 'resources/image/tutorial3step18.png',
      category: 'tutorial-application-features',
      tags: ['edge creation', 'bend'],
      keywords: ['OrthogonalEdgeEditingContext', 'OrthogonalEdgeEditingPolicy']
    },
    {
      id: 'tutorial-application-features--rectangular-indicator',
      name: 'Rectangular Indicator',
      summary: 'Shows how to add an interactive rectangular indicator to the graph component.',
      demoPath: '03-tutorial-application-features/rectangular-indicator/index.html',
      thumbnailPath: 'resources/image/tutorial3step19.png',
      category: 'tutorial-application-features',
      tags: ['interactive', 'selection', 'handle'],
      keywords: ['v2.2.0.0', 'PositionHandler', 'RectangleIndicatorInstaller', 'RectangleHandle']
    },
    {
      id: 'tutorial-application-features--smart-click-navigation',
      name: 'Smart Click Navigation',
      demoPath: '03-tutorial-application-features/smart-click-navigation/index.html',
      summary: 'Shows the how to scroll and zoom to the area of interest by single edge-clicks.',
      category: 'tutorial-application-features',
      thumbnailPath: 'resources/image/navigation.png',
      tags: ['introduction', 'tutorial'],
      keywords: ['v2.2.0.0', 'navigation', 'zoom', 'move']
    },
    {
      id: 'tutorial-application-features--snapping',
      name: 'Snapping',
      summary: 'Shows how to enable snapping (guide lines) for interactive changes.',
      demoPath: '03-tutorial-application-features/snapping/index.html',
      thumbnailPath: 'resources/image/tutorial3step1.png',
      category: 'tutorial-application-features',
      tags: ['tutorial', 'introduction']
    },
    {
      id: 'tutorial-application-features--tooltips',
      name: 'Tooltips',
      summary: 'Show how tooltips to graph items.',
      demoPath: '03-tutorial-application-features/tooltips/index.html',
      thumbnailPath: 'resources/image/tutorial3step21.png',
      category: 'tutorial-application-features',
      tags: ['hover', 'mouse', 'information'],
      keywords: ['mouseHoverInputMode', 'addQueryItemToolTipListener', 'event']
    }
  ]
}
// This is needed for docviewer processing
if (
  typeof exports === 'object' &&
  typeof module !== 'undefined' &&
  typeof module.exports === 'object'
) {
  module.exports = getDemoData()
}
