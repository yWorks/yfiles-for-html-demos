/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
// eslint-disable-next-line no-unused-vars

/**
 * @typedef {'analysis'|'application-features'|'databinding'|'input'|'integration'|'layout'|'layout-features'|'loading'|'showcase'|'style'|'testing'|'view'}  NormalDemoCategory
 *
 * @typedef {'tutorial-basic-features'|'tutorial-edge-style-implementation'|'tutorial-graph-builder'|'tutorial-label-style-implementation'|'tutorial-node-style-implementation'|'tutorial-port-style-implementation'} TutorialCategory
 *
 * @typedef {NormalDemoCategory | TutorialCategory} DemoCategory
 *
 * @typedef {'needs-layout' | 'no-viewer'} PackageType
 * @typedef {'js-only' | 'ts-only'} LanguageType
 */

/**
 * @typedef {object} DemoEntry
 * @property {string} id
 * @property {string} name
 * @property {string} summary
 * @property {string} demoPath
 * @property {DemoCategory} category
 * @property {string} [type]
 * @property {PackageType} [packageType]
 * @property {LanguageType} [languageType]
 * @property {boolean} [onlineAvailable]
 * @property {boolean} [hiddenInGrid]
 * @property {string} thumbnailPath
 * @property {string} sourcePath
 * @property {string[]} tags
 * @property {string[]} [keywords]
 */

/**
 * @typedef {object} HiddenEntry
 * @property {string} id
 * @property {string} name
 * @property {string} summary
 * @property {DemoCategory} [category]
 * @property {true} hidden
 */

function getCategoryNames() {
  return {
    analysis: 'Analysis',
    'application-features': 'Application Features',
    databinding: 'Data Binding',
    input: 'Interaction',
    integration: 'Integration',
    layout: 'Layout',
    'layout-features': 'Layout Features',
    loading: 'Loading',
    showcase: 'Showcase',
    style: 'Style',
    testing: 'Testing',
    'tutorial-basic-features': 'Tutorial: Basic Features',
    'tutorial-edge-style-implementation': 'Tutorial: Edge Style Implementation',
    'tutorial-graph-builder': 'Tutorial: Graph Builder',
    'tutorial-label-style-implementation': 'Tutorial: Label Style Implementation',
    'tutorial-node-style-implementation': 'Tutorial: Node Style Implementation',
    'tutorial-port-style-implementation': 'Tutorial: Port Style Implementation',
    view: 'View'
  }
}

/**
 * @return {DemoCategory[]}
 */
function getLayoutCategories() {
  return [
    'analysis',
    'complete',
    'databinding',
    'layout',
    'layout-features',
    'showcase',
    'tutorial-graph-builder'
  ]
}

/**
 * @return {Array<DemoEntry | HiddenEntry>}
 */
function getDemoData() {
  const data = [
    {
      id: 'layout-styles',
      name: 'Layout Styles',
      demoPath: 'showcase/layoutstyles/index.html',
      summary:
        'Showcases the most used layout algorithms of yFiles, including hierarchic, organic, orthogonal, tree, circular, balloon, and several edge routing styles.',
      category: 'showcase',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'edge routing'],
      keywords: [
        'layout styles samples',
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
        'edge router',
        'polyline router',
        'channel router',
        'bus router',
        'organic router',
        'parallel router',
        'generic labeling',
        'components',
        'tabular',
        'partial',
        'graph transformer',
        'label placement',
        'compact disk',
        'v2.4.0.0'
      ]
    },
    {
      id: 'layout-styles-hierarchic',
      name: 'Layout Styles: Hierarchic',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=hierarchic&sample=hierarchic',
      summary:
        'Suitable for any kind of directed diagram, like flow charts, BPMN diagrams and more',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-hierarchic.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'hierarchic'],
      keywords: [
        'layout styles samples',
        'layout algorithm',
        'HierarchicLayout',
        'hierarchy',
        'hierarchical',
        'sugiyama',
        'layered',
        'flow',
        'direction',
        'bus structures',
        'directed',
        'layers',
        'curves',
        'curved',
        'splines',
        'polyline',
        'octilinear',
        'orthogonal',
        'bpmn',
        'uml',
        'flowchart',
        'sankey',
        'decision tree',
        'incremental',
        'grouping',
        'partition grid',
        'swimlane',
        'call graph',
        'pathways',
        'entity relationship',
        'workflow'
      ]
    },
    {
      id: 'layout-styles-organic',
      name: 'Layout Styles: Organic',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=organic&sample=organic',
      summary:
        'Suitable for many types of undirected graphs and complex networks, like social networks, WWW visualizations or knowledge representation.',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-organic.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'organic'],
      keywords: [
        'layout styles samples',
        'layout algorithm',
        'OrganicLayout',
        'force directed',
        'spring embedder',
        'energy based',
        'Kamada Kawai',
        'Fruchterman Reingold',
        'physical',
        'social',
        'network',
        'networking',
        'straight line',
        'substructures',
        'stars',
        'chains',
        'cliques',
        'mesh',
        'undirected',
        'large graphs'
      ]
    },
    {
      id: 'layout-styles-edgerouter',
      name: 'Layout Styles: Edge Router',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=edge-router&sample=edge-router',
      summary: 'For routing edges in an orthogonal, octilinear or curved style.',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-edgerouter.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['edge routing', 'polyline'],
      keywords: [
        'layout styles samples',
        'routing algorithm',
        'router',
        'layout',
        'routing',
        'route',
        're-routing',
        'curved',
        'curves',
        'splines',
        'path',
        'orthogonal',
        'octilinear',
        'polyline',
        'bus',
        'backbone'
      ]
    },
    {
      id: 'layout-styles-tree',
      name: 'Layout Styles: Tree',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=tree&sample=tree',
      summary:
        'Suitable to visualize tree structures like organization charts or for dataflow analysis.',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-tree.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'tree'],
      keywords: [
        'layout styles samples',
        'layout algorithm',
        'tree layout',
        'tree',
        'node placer',
        'org chart',
        'root',
        'directed',
        'dendrogram',
        'hierarchic',
        'hierarchy',
        'data analysis'
      ]
    },
    {
      id: 'layout-styles-balloon',
      name: 'Layout Styles: Balloon',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=balloon&sample=balloon',
      summary: 'Suitable to visualize tree-like structures in a radial fashion.',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-balloon.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'balloon'],
      keywords: [
        'layout styles samples',
        'balloon layout',
        'tree',
        'radial',
        'balloons',
        'stars',
        'star like',
        'social networks',
        'organic'
      ]
    },
    {
      id: 'layout-styles-orthogonal',
      name: 'Layout Styles: Orthogonal',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=orthogonal&sample=orthogonal',
      summary:
        'Suitable for diagrams with orthogonal edges such as UML, database schemas, system management and more.',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-orthogonal.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'orthogonal'],
      keywords: [
        'layout styles samples',
        'layout algorithm',
        'orthogonal layout',
        'tsm',
        'topology shape metrics',
        'planar',
        'substructures',
        'perpendicular',
        'system management',
        'uml',
        'data management'
      ]
    },
    {
      id: 'layout-styles-circular',
      name: 'Layout Styles: Circular',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=circular&sample=circular',
      summary:
        'Suitable for applications in social networking, for WWW visualization and network management',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-circular.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'circular'],
      keywords: [
        'layout styles samples',
        'layout algorithm',
        'circular layout',
        'cycles',
        'circles',
        'elliptical',
        'bundling',
        'radial',
        'straight lines',
        'arcs',
        'rings',
        'chords'
      ]
    },
    {
      id: 'layout-styles-radial',
      name: 'Layout Styles: Radial',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=radial&sample=radial',
      summary: 'Suitable to visualize directed diagrams with a certain flow.',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-radial.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'radial'],
      keywords: [
        'layout styles samples',
        'radial layout',
        'circles',
        'circular',
        'concentric',
        'hierarchical',
        'hierarchy',
        'layered',
        'arcs',
        'tree',
        'directed',
        'bundling'
      ]
    },
    {
      id: 'layout-styles-disk',
      name: 'Layout Styles: Compact Disk',
      hiddenInGrid: true,
      demoPath:
        'showcase/layoutstyles/index.html?layout=compact-disk&sample=compact-disk-with-edges',
      summary: 'Suitable to visualize diagrams with few edges in a compact disk-like fashion.',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-compact-disk.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'compact disk'],
      keywords: ['v2.5.0.0', 'layout styles samples', 'concentric', 'compact disk', 'round']
    },
    {
      id: 'layout-styles-seriesparallel',
      name: 'Layout Styles: Series-Parallel',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=series-parallel&sample=series-parallel',
      summary: 'Suitable for diagrams with a main direction, like flow charts.',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-seriesparallel.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'seriesparallel'],
      keywords: [
        'layout styles samples',
        'layout algorithm',
        'series parallel layout',
        'series',
        'parallel',
        'hierarchical',
        'orthogonal',
        'octilinear',
        'directed',
        'sp graph'
      ]
    },
    {
      id: 'layout-styles-busrouter',
      name: 'Layout Styles: Bus Router',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=bus-router',
      summary: 'For routing edges in an orthogonal bus-style.',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-busrouter.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['edge routing', 'bus'],
      keywords: [
        'layout styles samples',
        'routing algorithm',
        'bus router',
        'layout',
        'routing',
        'orthogonal',
        'buses',
        'backbones'
      ]
    },
    {
      id: 'layout-styles-components',
      name: 'Layout Styles: Components',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=components&sample=components',
      summary: 'For arranging any kind of disconnected diagram components.',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-components.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'component'],
      keywords: ['layout styles samples', 'layout algorithm', 'component layout', 'components']
    },
    {
      id: 'layout-styles-tabular',
      name: 'Layout Styles: Tabular',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=tabular&sample=tabular',
      summary: 'Suitable to arrange elements in rows and columns.',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-tabular.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'tabular'],
      keywords: [
        'layout styles samples',
        'layout algorithm',
        'tabular layout',
        'rows',
        'row-like',
        'columns',
        'column-like',
        'grid',
        'components',
        'disconnected',
        'tables'
      ]
    },
    {
      id: 'layout-styles-labeling',
      name: 'Layout Styles: Labeling',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=labeling',
      summary: 'Places node and edge labels.',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-labeling.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['label placement'],
      keywords: ['layout styles samples', 'generic labeling', 'preferred placement']
    },
    {
      id: 'layout-styles-partial',
      name: 'Layout Styles: Partial',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=partial',
      summary:
        'Suitable for incremental scenarios where new elements should be added to an existing diagram layout.',
      category: 'layout',
      type: 'layout-styles',
      thumbnailPath: 'resources/image/layoutstyles-partial.png',
      sourcePath: 'showcase/layoutstyles/LayoutStylesDemo.js',
      tags: ['layout', 'partial', 'incremental'],
      keywords: [
        'layout styles samples',
        'layout algorithm',
        'partial layout',
        'mental map',
        'subgraph',
        'fixed'
      ]
    },
    {
      id: 'bpmn-editor',
      name: 'BPMN Editor',
      demoPath: 'showcase/bpmn/index.html',
      summary:
        'An editor for Business Process diagrams that features interactive editing, BPMN node styles and a specialized BPMN layout algorithm.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/bpmneditor.png',
      sourcePath: 'showcase/bpmn/BpmnEditorDemo.js',
      tags: ['style', 'layout', 'interaction'],
      keywords: [
        'context menu',
        'drag and drop',
        'palette',
        'ports',
        'overview',
        'dnd',
        'notable style',
        'data management'
      ]
    },
    {
      id: 'organization-chart',
      name: 'Organization Chart',
      demoPath: 'showcase/orgchart/index.html',
      summary: 'An interactive viewer for organization charts with automatic layout updates.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/interactiveorgchart.png',
      sourcePath: 'showcase/orgchart/OrgChartDemo.js',
      tags: ['style', 'layout', 'interaction'],
      keywords: [
        'orgchart',
        'animation',
        'filtering',
        'search',
        'highlight',
        'templates',
        'print',
        'data panel',
        'structures',
        'hide',
        'detail',
        'notable style',
        'data management'
      ]
    },
    {
      id: 'process-mining',
      name: 'Process Mining',
      demoPath: 'showcase/processmining/index.html',
      summary: 'Shows how to create an animated visualization of a process flow.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/processmining.png',
      sourcePath: 'showcase/processmining/ProcessMiningDemo.js',
      tags: ['webgl', 'animation', 'heatmap'],
      keywords: ['v2.3.0.2', 'notable style', 'data analysis']
    },
    {
      id: 'company-ownership',
      name: 'Company Ownership Chart',
      demoPath: 'showcase/company-ownership/index.html',
      summary:
        'Interactively explore the ownership of companies and their management relationships.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/company-ownership.png',
      sourcePath: 'showcase/company-ownership/CompanyOwnershipDemo.js',
      tags: ['style', 'layout', 'interaction'],
      keywords: [
        'v2.5.0.2',
        'ownership',
        'relationship',
        'orgchart',
        'company',
        'business',
        'corporation',
        'investors',
        'shareholders',
        'business chart',
        'filtering',
        'search',
        'highlight',
        'templates',
        'hide',
        'detail',
        'notable style',
        'data management'
      ]
    },
    {
      id: 'gantt-chart',
      name: 'Gantt Chart',
      demoPath: 'view/ganttchart/index.html',
      summary: 'An editor for Gantt charts.',
      category: 'view',
      type: 'use-cases',
      thumbnailPath: 'resources/image/ganttchart.png',
      sourcePath: 'view/ganttchart/GanttChartDemo.js',
      tags: ['style', 'interaction'],
      keywords: [
        'activity',
        'activities',
        'tasks',
        'swim lanes',
        'calendar',
        'dates',
        'times',
        'schedule',
        'data management'
      ]
    },
    {
      id: 'fraud-detection',
      name: 'Fraud Detection',
      demoPath: 'showcase/frauddetection/index.html',
      summary: 'Example of a fraud detection application for time-dependent data.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/fraud-detection.png',
      sourcePath: 'showcase/frauddetection/FraudDetectionDemo.js',
      tags: ['timeline', 'webgl', 'layout'],
      keywords: [
        'filtering',
        'animations',
        'structures',
        'detail',
        'data analysis',
        'data management',
        'detail view',
        'inspection view'
      ]
    },
    {
      id: 'isometric-drawing',
      name: 'Isometric Drawing',
      demoPath: 'showcase/isometricdrawing/index.html',
      summary: 'Displays graphs in 3D using an arbitrary projection and WebGL rendering.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/isometric-drawing.png',
      sourcePath: 'showcase/isometricdrawing/IsometricDrawingDemo.js',
      tags: ['webgl', 'style', 'layout', 'projection'],
      keywords: [
        'v2.3.0.0',
        'groups',
        'folding',
        'hierarchic',
        'orthogonal',
        'labels',
        '3d',
        'isometric'
      ]
    },
    {
      id: 'network-monitoring',
      name: 'Network Monitoring',
      demoPath: 'showcase/networkmonitoring/index.html',
      summary: 'Example of a monitoring tool for computer networks.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/networkmonitoring.png',
      sourcePath: 'showcase/networkmonitoring/NetworkMonitoringDemo.js',
      tags: ['style', 'viewer', 'animation'],
      keywords: [
        'tool tips',
        'data panel',
        'chart',
        'structures',
        'd3js',
        'd3.js',
        'notable style',
        'data analysis',
        'data management'
      ]
    },
    {
      id: 'metaball-groups',
      name: 'Metaball Groups',
      demoPath: 'showcase/metaballgroups/index.html',
      summary: 'Shows how to render metaball-like background visualizations.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/metaballgroups.png',
      sourcePath: 'showcase/metaballgroups/MetaballGroupsDemo.js',
      tags: ['background', 'webgl'],
      keywords: ['v2.2.0.0', 'overlapping', 'heatmap', 'data analysis']
    },
    {
      id: 'map',
      name: 'Map',
      demoPath: 'showcase/map/index.html',
      summary: 'Draws a graph on top of an interactive map.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/map.png',
      sourcePath: 'showcase/map/MapDemo.js',
      tags: ['style', 'leaflet', 'shortest paths'],
      keywords: [
        'v2.1.0.2',
        'overlay',
        'layers',
        'tooltips',
        'filtering',
        'curves',
        'data management'
      ]
    },
    {
      id: 'graph-wizard-flowchart',
      name: 'GraphWizard for Flowchart',
      demoPath: 'showcase/graph-wizard-for-flowchart/index.html',
      summary: 'Customizes defaults and input gestures to support fast creation of flowcharts.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/graphwizard-flowchart.png',
      sourcePath: 'showcase/graph-wizard-for-flowchart/GraphWizardForFlowchartDemo.js',
      tags: ['wizard', 'flowchart'],
      keywords: ['v2.4.0.4', 'flow', 'shapes', 'layout', 'input', 'button', 'data management']
    },
    {
      id: 'flowchart-editor',
      name: 'Flowchart Editor',
      demoPath: 'showcase/flowchart/index.html',
      summary:
        'An editor for Flowchart diagrams that features interactive editing, flowchart node styles, and automatic layout.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/flowchart-editor.png',
      sourcePath: 'showcase/flowchart/FlowchartDemo.js',
      tags: ['style', 'layout', 'drag and drop'],
      keywords: ['hierarchic', 'palette', 'dnd', 'data management']
    },
    {
      id: 'uml-editor',
      name: 'UML Editor',
      demoPath: 'showcase/uml/index.html',
      summary:
        'An editor for UML diagrams with a tailored UML node style, automatic layout, and a quick way to create new edges with the mouse or touch.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/uml-editor.png',
      sourcePath: 'showcase/uml/UMLEditorDemo.js',
      tags: ['style', 'layout', 'interaction'],
      keywords: [
        'v2.1.0.1',
        'context menu',
        'labels',
        'edge router',
        'hierarchic',
        'structures',
        'data management'
      ]
    },
    {
      id: 'decision-tree',
      name: 'Decision Tree',
      demoPath: 'showcase/decisiontree/index.html',
      summary:
        'An interactive Decision Tree component that lets you design and explore your own decision graphs.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/decisiontree.png',
      sourcePath: 'showcase/decisiontree/DecisionTreeDemo.js',
      tags: ['layout', 'interaction'],
      keywords: ['hierarchic', 'context menu', 'data management']
    },
    {
      id: 'mindmap-editor',
      name: 'Mindmap Editor',
      demoPath: 'showcase/mindmap/index.html',
      summary:
        'A Mindmap editor with a tailored node style, custom user interaction, and a specialized layoutthat automatically arranges new entries.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/mindmap.png',
      sourcePath: 'showcase/mindmap/MindmapDemo.js',
      tags: ['style', 'layout', 'interaction'],
      keywords: ['context menu', 'tree', 'structures', 'labels', 'notable style']
    },
    {
      id: 'sankey-diagram',
      name: 'Sankey Diagram',
      demoPath: 'layout/sankey/index.html',
      summary:
        'A diagram used for visualizing flow information in which the thickness of the edges is proportional to the flow quantity.',
      category: 'layout',
      type: 'use-cases',
      thumbnailPath: 'resources/image/sankey.png',
      sourcePath: 'layout/sankey/SankeyDemo.js',
      tags: ['edge thickness', 'style', 'layout'],
      keywords: ['context menu', 'hierarchic', 'generic labeling', 'labels', 'data analysis']
    },
    {
      id: 'tree-of-life',
      name: 'Tree of Life',
      demoPath: 'showcase/tree-of-life/index.html',
      summary: 'An interactive radial dendrogram visualization of the Tree of Life.',
      category: 'showcase',
      thumbnailPath: 'resources/image/tree-of-life.png',
      sourcePath: 'showcase/tree-of-life/TreeOfLifeDemo.js',
      tags: ['styles', 'layout', 'webgl2'],
      keywords: [
        'v2.5.0.0',
        'background',
        'visual',
        'RadialLayout',
        'labels',
        'smart click navigation',
        'graph search',
        'explore',
        'phylogenetic',
        'biology',
        'webgl2'
      ]
    },
    {
      id: 'tree-map',
      name: 'Tree Map',
      demoPath: 'layout/treemap/index.html',
      summary: 'Shows disk usage of a directory tree with the Tree Map layout.',
      category: 'layout',
      type: 'use-cases',
      thumbnailPath: 'resources/image/treemap.png',
      sourcePath: 'layout/treemap/TreeMapDemo.js',
      tags: ['layout', 'tree map'],
      keywords: [
        'tree map',
        'v2.1.0.0',
        'animations',
        'tool tips',
        'data analysis',
        'data management'
      ]
    },
    {
      id: 'tag-cloud',
      name: 'Tag Cloud',
      demoPath: 'showcase/tag-cloud/index.html',
      summary: 'Shows how to create a Tag Cloud.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/tag-cloud.png',
      sourcePath: 'showcase/tag-cloud/TagCloudDemo.js',
      tags: ['layout', 'style'],
      keywords: ['v2.4.0.4', 'words', 'components', 'labels']
    },
    {
      id: 'critical-path-analysis',
      name: 'Critical Path Analysis (CPA)',
      demoPath: 'analysis/criticalpathanalysis/index.html',
      summary: 'Shows how to perform critical path analysis in project management.',
      category: 'analysis',
      type: 'use-cases',
      thumbnailPath: 'resources/image/criticalpathanalysis.png',
      sourcePath: 'analysis/criticalpathanalysis/CriticalPathAnalysisDemo.js',
      tags: ['analysis', 'hierarchic', 'rank'],
      keywords: [
        'critical',
        'paths',
        'project',
        'management',
        'slack',
        'scheduling',
        'data analysis'
      ]
    },
    {
      id: 'logic-gates',
      name: 'Logic Gates',
      demoPath: 'showcase/logicgates/index.html',
      summary: 'An editor for networks of logic gates, with tailored automatic layout.',
      category: 'showcase',
      type: 'use-cases',
      thumbnailPath: 'resources/image/logicgates.png',
      sourcePath: 'showcase/logicgates/LogicGatesDemo.js',
      tags: ['port', 'style', 'layout'],
      keywords: [
        'ports',
        'candidates',
        'constraints',
        'hierarchic',
        'edge router',
        'drag and drop',
        'palette',
        'reversed edge creation',
        'dnd',
        'data management'
      ]
    },
    {
      id: 'graph-analysis',
      name: 'Graph Analysis',
      demoPath: 'showcase/graphanalysis/index.html',
      summary:
        'Showcases a selection of graph algorithms such as shortest paths, flows, centrality measures, that help analyzing the structure of a graph.',
      category: 'showcase',
      type: 'features',
      thumbnailPath: 'resources/image/graphanalysis.png',
      sourcePath: 'showcase/graphanalysis/GraphAnalysisDemo.js',
      tags: ['analysis', 'graph structure'],
      keywords: [
        'context menu',
        'centrality',
        'connectivity',
        'reachability',
        'cycles',
        'minimum spanning tree',
        'mst',
        'shortest paths',
        'data analysis',
        'biconnected',
        'strongly connected components',
        'k-core',
        'chains',
        'single-source',
        'degree centrality',
        'closeness centrality',
        'eigenvector centrality',
        'weights',
        'node edge betweenness centrality',
        'page rank',
        'substructures',
        'stars',
        'trees',
        'cliques',
        'directed',
        'direction'
      ]
    },
    {
      id: 'hierarchic-nesting',
      name: 'Hierarchic Nesting',
      demoPath: 'layout/hierarchic-nesting/index.html',
      summary: 'The hierarchic layout nicely expands and collapses sub-graphs organized in groups.',
      category: 'layout',
      type: 'features',
      thumbnailPath: 'resources/image/hierarchicgrouping.png',
      sourcePath: 'layout/hierarchic-nesting/HierarchicNestingDemo.js',
      tags: ['layout', 'hierarchic', 'animation'],
      keywords: ['overview', 'folding', 'hide', 'grouping']
    },
    {
      id: 'folding-with-layout',
      name: 'Folding With Layout',
      demoPath: 'layout/foldingwithlayout/index.html',
      summary:
        'Shows how an automatic layout makes space for opening groups and reclaims the space of closing groups.',
      category: 'layout',
      type: 'features',
      thumbnailPath: 'resources/image/foldingwithlayout.png',
      sourcePath: 'layout/foldingwithlayout/FoldingWithLayoutDemo.js',
      tags: ['layout', 'hierarchic', 'grouping'],
      keywords: [
        'folding',
        'hide',
        'create',
        'space',
        'clear area layout',
        'fill area layout',
        'v2.3.0.2'
      ]
    },
    {
      id: 'large-graphs',
      name: 'Large Graphs',
      demoPath: 'showcase/large-graphs/index.html',
      summary:
        'Shows how to display large graphs with both good performance in WebGL2 and high quality in SVG.',
      category: 'showcase',
      type: 'features',
      thumbnailPath: 'resources/image/large-graphs.png',
      sourcePath: 'showcase/large-graphs/LargeGraphsDemo.js',
      tags: ['performance', 'webgl'],
      keywords: ['v2.4.0.0', 'rendering', 'large', 'huge', 'webgl2', 'svg', 'data management']
    },
    {
      id: 'large-graph-aggregation',
      name: 'Large Graph Aggregation',
      demoPath: 'showcase/largegraphaggregation/index.html',
      summary:
        'Shows how to use the smart node aggregation for drill-down exploration of a large graph.',
      category: 'showcase',
      type: 'features',
      thumbnailPath: 'resources/image/largegraphaggregation.png',
      sourcePath: 'showcase/largegraphaggregation/LargeGraphAggregationDemo.js',
      tags: ['large graph', 'exploration'],
      keywords: [
        'v2.3.0.0',
        'v2.5.0.0',
        'balloon',
        'cactus',
        'aggregation graph wrapper',
        'curves',
        'bezier',
        'clusters',
        'data analysis'
      ]
    },
    {
      id: 'interactive-aggregation',
      name: 'Interactive Aggregation',
      demoPath: 'application-features/interactiveaggregation/index.html',
      summary:
        'Shows how to analyze a graph by interactively aggregating nodes with common properties.',
      category: 'application-features',
      type: 'features',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/interactiveaggregation.png',
      sourcePath: 'application-features/interactiveaggregation/InteractiveAggregationDemo.js',
      tags: ['large graph', 'exploration'],
      keywords: [
        'v2.3.0.2',
        'aggregation graph wrapper',
        'context menu',
        'clusters',
        'data analysis'
      ]
    },
    {
      id: 'large-tree',
      name: 'Large Collapsible Tree',
      demoPath: 'view/large-tree/index.html',
      summary: 'Shows a tree graph, where a large number of nodes can be added interactively.',
      category: 'view',
      type: 'features',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/large-tree.png',
      sourcePath: 'view/large-tree/LargeTreeDemo.js',
      tags: ['performance', 'webgl', 'interaction'],
      keywords: ['v2.4.0.0', 'rendering', 'large', 'huge', 'webgl2', 'svg', 'collapse']
    },
    {
      id: 'collapsible-trees',
      name: 'Collapsible Trees',
      demoPath: 'view/collapse/index.html',
      summary: 'Shows interactive collapsing and expanding of subtrees of a graph.',
      category: 'view',
      type: 'features',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/collapsibletree.png',
      sourcePath: 'view/collapse/CollapseDemo.js',
      tags: ['layout', 'interaction', 'animation'],
      keywords: ['hierarchic', 'organic', 'tree', 'balloon', 'filtering', 'hide', 'collapse']
    },
    {
      id: 'rendering-optimizations',
      name: 'Rendering Optimizations',
      demoPath: 'view/rendering-optimizations/index.html',
      summary: 'Illustrates optimizations of the rendering performance for large graphs.',
      category: 'view',
      type: 'features',
      thumbnailPath: 'resources/image/rendering-optimizations.png',
      sourcePath: 'view/rendering-optimizations/RenderingOptimizationsDemo.js',
      tags: ['performance', 'canvas', 'webgl'],
      keywords: ['v2.4.0.0', 'fps', 'rendering', 'large', 'huge', 'webgl2']
    },
    {
      id: 'neighborhood-view',
      name: 'Neighborhood View',
      demoPath: 'showcase/neighborhood/index.html',
      summary: 'Shows the neighborhood of the currently selected node alongside the graph.',
      category: 'showcase',
      type: 'features',
      thumbnailPath: 'resources/image/neighborhoodview.png',
      sourcePath: 'showcase/neighborhood/NeighborhoodDemo.js',
      tags: ['layout', 'interaction'],
      keywords: ['hierarchic', 'copy', 'detail', 'data analysis', 'data management']
    },
    {
      id: 'neighborhood-circles',
      name: 'Neighborhood Circles',
      demoPath: 'showcase/neighborhood-circles/index.html',
      summary: 'Shows the neighborhood of selected nodes arranged on concentric circles.',
      category: 'showcase',
      type: 'features',
      thumbnailPath: 'resources/image/neighborhood-circles.png',
      sourcePath: 'showcase/neighborhood-circles/NeighborhoodCirclesDemo.js',
      tags: ['layout', 'interaction'],
      keywords: ['v2.6.0.0', 'radial', 'copy', 'detail', 'data analysis', 'data management']
    },
    {
      id: 'contextual-toolbar',
      name: 'Contextual Toolbar',
      demoPath: 'view/contextualtoolbar/index.html',
      summary:
        'Shows a contextual toolbar for the current selection that enables fast and easy style changes.',
      category: 'view',
      type: 'features',
      thumbnailPath: 'resources/image/contextualtoolbar.png',
      sourcePath: 'view/contextualtoolbar/ContextualToolbarDemo.js',
      tags: ['interaction', 'overlay'],
      keywords: ['v2.1.0.2', 'html', 'popup', 'context menu']
    },
    {
      id: 'magnifying-glass',
      name: 'Magnifying Glass',
      demoPath: 'input/magnifying-glass/index.html',
      summary: "Shows a floating lens that magnifies the cursor's surroundings.",
      category: 'input',
      type: 'features',
      thumbnailPath: 'resources/image/magnifying-glass.png',
      sourcePath: 'input/magnifying-glass/MagnifyingGlassDemo.js',
      tags: ['interaction', 'input'],
      keywords: ['v2.4.0.5', 'magnifier ', 'lens', 'zoom', 'input mode']
    },
    {
      id: 'css-item-style',
      name: 'CSS Item Style',
      demoPath: 'style/css-item-style/index.html',
      summary: 'Shows how to style and animate graph items with CSS.',
      category: 'style',
      type: 'custom-styles',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/css-item-style.png',
      sourcePath: 'style/css-item-style/CSSItemStyleDemo.js',
      tags: ['css', 'animation', 'style'],
      keywords: ['v2.6.0.0', 'stylesheets', 'transition', 'fading', 'fade-out']
    },
    {
      id: 'default-label-style',
      name: 'Default Label Style',
      demoPath: 'style/default-label-style/index.html',
      summary: 'Shows the features of the DefaultLabelStyle class.',
      category: 'style',

      thumbnailPath: 'resources/image/default-label-style.png',
      sourcePath: 'style/default-label-style/DefaultLabelStyleDemo.js',
      tags: ['style', 'labels'],
      keywords: ['v2.5.0.0', 'library style', 'style options']
    },
    {
      id: 'rectangle-node-style',
      name: 'Rectangle Node Style',
      demoPath: 'style/rectangle-node-style/index.html',
      summary:
        'Shows the different node shapes that can be implemented with the RectangleNodeStyle class.',
      category: 'style',
      thumbnailPath: 'resources/image/rectangle-node-style.png',
      sourcePath: 'style/rectangle-node-style/RectangleNodeStyleDemo.js',
      tags: ['style', 'interaction'],
      keywords: [
        'v2.5.0.0',
        'handles',
        'rectangles',
        'rounded rectangles',
        'round rectangles',
        'pills',
        'hexagons',
        'octagons',
        'library style',
        'style options'
      ]
    },
    {
      id: 'shape-node-style',
      name: 'Shape Node Style',
      demoPath: 'style/shape-node-style/index.html',
      summary: 'Shows the features of the ShapeNodeStyle class.',
      category: 'style',
      thumbnailPath: 'resources/image/shape-node-style.png',
      sourcePath: 'style/shape-node-style/ShapeNodeStyleDemo.js',
      tags: ['style', 'nodes'],
      keywords: ['v2.5.0.0', 'library style', 'style options']
    },
    {
      id: 'group-node-style',
      name: 'Group Node Style',
      demoPath: 'style/group-node-style/index.html',
      summary:
        'Shows the group and folder node visualization options offered by the GroupNodeStyle class.',
      category: 'style',
      thumbnailPath: 'resources/image/group-node-style.png',
      sourcePath: 'style/group-node-style/GroupNodeStyleDemo.js',
      tags: ['style', 'nodes', 'webgl2'],
      keywords: ['v2.5.0.0', 'library style', 'style options']
    },
    {
      id: 'arrow-node-style',
      name: 'Arrow Node Style',
      demoPath: 'style/arrow-node-style/index.html',
      summary: 'Shows the features of the ArrowNodeStyle class.',
      category: 'style',
      thumbnailPath: 'resources/image/arrow-node-style.png',
      sourcePath: 'style/arrow-node-style/ArrowNodeStyleDemo.js',
      tags: ['style', 'nodes', 'arrows'],
      keywords: ['v2.5.0.0', 'library style', 'style options']
    },
    {
      id: 'arrow-edge-style',
      name: 'Arrow Edge Style',
      demoPath: 'style/arrow-edge-style/index.html',
      summary: 'Shows the features of the ArrowEdgeStyle class.',
      category: 'style',
      thumbnailPath: 'resources/image/arrow-edge-style.png',
      sourcePath: 'style/arrow-edge-style/ArrowEdgeStyleDemo.js',
      tags: ['style', 'edges', 'arrows'],
      keywords: ['v2.5.0.0', 'library style', 'style options']
    },
    {
      id: 'webgl-animations',
      name: 'WebGL2 Animations',
      demoPath: 'style/webgl-animations/index.html',
      summary: 'Shows howto use WebGL2 animations to highlight interesting parts of a graph.',
      category: 'style',
      type: 'features',
      thumbnailPath: 'resources/image/webgl-animations.png',
      sourcePath: 'style/webgl-animations/WebGLAnimationsDemo.js',
      tags: ['animation', 'webgl2'],
      keywords: ['v2.4.0.0', 'v2.5.0.0']
    },
    {
      id: 'webgl-label-fading',
      name: 'WebGL2 Label Fading',
      demoPath: 'view/webgl-label-fading/index.html',
      summary:
        'Shows how to achieve a simple level of detail effect by fading in/out labels at a certain zoom value using WebGL2 rendering.',
      category: 'view',
      type: 'features',
      thumbnailPath: 'resources/image/webgl-label-fading.png',
      sourcePath: 'view/webgl-label-fading/WebGL2LabelFadingDemo.js',
      tags: ['webgl'],
      keywords: ['v2.6.0.0', 'rendering', 'webgl2', 'level of detail', 'LOD', 'fading']
    },
    {
      id: 'clustering-algorithms',
      name: 'Clustering Algorithms',
      demoPath: 'analysis/clustering/index.html',
      summary:
        'Showcases a selection of clustering algorithms such as edge betweenness, k-means, hierarchical and biconnected components clustering.',
      category: 'analysis',
      type: 'features',
      thumbnailPath: 'resources/image/clustering.png',
      sourcePath: 'analysis/clustering/ClusteringDemo.js',
      tags: ['analysis'],
      keywords: ['k-means', 'hierarchical', 'voronoi', 'dendrogram', 'background', 'data analysis']
    },
    {
      id: 'intersection-detection',
      name: 'Intersection Detection',
      demoPath: 'analysis/intersection-detection/index.html',
      summary: 'Shows how to compute and highlight intersections between graph items.',
      category: 'analysis',
      type: 'features',
      thumbnailPath: 'resources/image/intersection-detection.png',
      sourcePath: 'analysis/intersection-detection/IntersectionDetectionDemo.js',
      tags: ['analysis'],
      keywords: [
        'v2.5.0.0',
        'intersection',
        'intersections',
        'overlap',
        'overlaps',
        'crossings',
        'algorithm'
      ]
    },
    {
      id: 'network-flows',
      name: 'Network Flows',
      demoPath: 'analysis/networkflows/index.html',
      summary:
        'Presents three network flow graph analysis algorithms that are applied on a network of water pipes.',
      category: 'analysis',
      type: 'features',
      thumbnailPath: 'resources/image/networkflows.png',
      sourcePath: 'analysis/networkflows/NetworkFlowsDemo.js',
      tags: ['analysis', 'style'],
      keywords: ['network flows', 'maximum', 'minimum', 'cuts', 'labels', 'data management']
    },
    {
      id: 'transitivity',
      name: 'Transitivity',
      demoPath: 'analysis/transitivity/index.html',
      summary:
        'Shows how transitivity graph analysis algorithms can be applied to solve reachability problems.',
      category: 'analysis',
      type: 'features',
      thumbnailPath: 'resources/image/transitivity.png',
      sourcePath: 'analysis/transitivity/TransitivityDemo.js',
      tags: ['analysis'],
      keywords: [
        'transitive',
        'closures',
        'reduction',
        'filtering',
        'structures',
        'highlights',
        'data analysis',
        'data management'
      ]
    },
    {
      id: 'graph-editor',
      name: 'Graph Editor',
      demoPath: 'view/grapheditor/index.html',
      summary: 'Shows the graph editing features of the graph component.',
      category: 'view',
      type: 'features',
      thumbnailPath: 'resources/image/simpleeditor.png',
      sourcePath: 'view/grapheditor/GraphEditorDemo.js',
      tags: ['interaction'],
      keywords: ['context menu', 'groups', 'folding', 'overview', 'Labels']
    },
    {
      id: 'valid-begin-cursors',
      name: 'Valid Begin Cursors',
      demoPath: 'input/valid-begin-cursors/index.html',
      summary:
        'Shows how various cursors can be used to indicate valid gestures at the current location.',
      category: 'input',
      type: 'features',
      thumbnailPath: 'resources/image/valid-begin-cursors.png',
      sourcePath: 'input/valid-begin-cursors/ValidBeginCursorsDemo.js',
      tags: ['interaction'],
      keywords: ['v2.5.0.0', 'cursors', 'marquee', 'lasso', 'viewport', 'tooltips']
    },
    {
      id: 'table-editor',
      name: 'Table Editor',
      demoPath: 'application-features/tableeditor/index.html',
      summary:
        'Shows the support for diagrams that are organized in a tabular way, for example in a grid or a swimlane layout.',
      category: 'application-features',
      type: 'features',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/tableeditor.png',
      sourcePath: 'application-features/tableeditor/TableEditorDemo.js',
      tags: ['table', 'interaction'],
      keywords: [
        'drag and drop',
        'palette',
        'hierarchic',
        'groups',
        'context menu',
        'move',
        'labels',
        'dnd'
      ]
    },
    {
      id: 'graph-viewer',
      name: 'Graph Viewer',
      demoPath: 'view/graphviewer/index.html',
      summary: 'Displays sample graphs from various application domains.',
      category: 'view',
      type: 'features',
      thumbnailPath: 'resources/image/graphviewer.png',
      sourcePath: 'view/graphviewer/GraphViewerDemo.js',
      tags: ['style', 'overview'],
      keywords: [
        'tool tips',
        'context menu',
        'data panel',
        'search',
        'highlight',
        'curves',
        'bezier'
      ]
    },
    {
      id: 'html-popup',
      name: 'HTML Popup',
      demoPath: 'view/htmlpopup/index.html',
      summary:
        'Shows HTML pop-up panels that displays additional information about a clicked node or edge.',
      category: 'view',
      type: 'features',
      thumbnailPath: 'resources/image/htmlpopup.png',
      sourcePath: 'view/htmlpopup/HTMLPopupDemo.js',
      tags: ['interaction', 'overlay'],
      keywords: ['html popups', 'data panel', 'tool tips', 'structures', 'details']
    },
    {
      id: 'structure-view',
      name: 'Structure View',
      demoPath: 'view/structureview/index.html',
      summary: 'A tree list component that shows the nesting of the groups and nodes.',
      category: 'view',
      type: 'features',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/structureview.png',
      sourcePath: 'view/structureview/StructureViewDemo.js',
      tags: ['interaction'],
      keywords: [
        'lists',
        'tree',
        'overview',
        'structures',
        'v2.1.0.3',
        'labels',
        'data analysis',
        'data management'
      ]
    },
    {
      id: 'rendering-order',
      name: 'Rendering Order',
      demoPath: 'view/renderingorder/index.html',
      summary: 'Shows different rendering order settings.',
      category: 'view',
      type: 'features',
      thumbnailPath: 'resources/image/renderingorder.png',
      sourcePath: 'view/renderingorder/RenderingOrderDemo.js',
      tags: ['rendering', 'z-order', 'grouping'],
      keywords: ['hierarchic nesting', 'ports', 'labels', 'groups']
    },
    {
      id: 'z-order',
      name: 'Z-Order',
      demoPath: 'view/zorder/index.html',
      summary:
        'Shows how to adjust the z-order of graph elements and to keep this z-order consistent.',
      category: 'view',
      type: 'features',
      thumbnailPath: 'resources/image/zorder.png',
      sourcePath: 'view/zorder/ZOrderDemo.js',
      tags: ['rendering', 'z-order'],
      keywords: [
        'v2.3.0.0',
        'raise',
        'lower',
        'to Front',
        'to Back',
        'clipboard',
        'graphml',
        'z-index'
      ]
    },
    {
      id: 'rotatable-nodes',
      name: 'Rotatable Nodes',
      demoPath: 'application-features/rotatablenodes/index.html',
      summary: 'Shows nodes that can be rotated with the mouse or touch.',
      category: 'application-features',
      type: 'features',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/RotatableNodes.png',
      sourcePath: 'application-features/rotatablenodes/RotatableNodesDemo.js',
      tags: ['style', 'layout', 'interaction'],
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
        'edge router',
        'polyline router',
        'organic router',
        'curves'
      ]
    },
    {
      id: 'touch-interaction',
      name: 'Touch Interaction',
      demoPath: 'input/touchcustomization/index.html',
      summary: 'Shows how a graph editor application can be optimized for touch devices.',
      category: 'input',
      type: 'features',
      thumbnailPath: 'resources/image/custom_touch_interaction.png',
      sourcePath: 'input/touchcustomization/TouchEditorDemo.js',
      tags: ['interaction', 'mobile'],
      keywords: ['v2.1.0.0', 'palette', 'drag and drop', 'context menu', 'move', 'dnd']
    },
    {
      id: 'deep-zoom',
      name: 'Deep Zoom',
      demoPath: 'view/deep-zoom/index.html',
      summary:
        'Seamlessly zoom into the contents of deeply nested group nodes, similar to "deep zoom" for images',
      category: 'view',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/deep-zoom.png',
      sourcePath: 'view/deep-zoom/DeepZoomDemo.js',
      tags: ['view', 'styles', 'groups'],
      keywords: ['v2.5.0.2', 'group', 'group style', 'viewport', 'folding', 'zoom', 'content']
    },
    {
      id: 'arrange-objects',
      name: 'Arrange Objects',
      demoPath: 'view/arrange-objects/index.html',
      summary: 'Shows simple operations for aligning and distributing nodes.',
      category: 'view',
      type: 'features',
      thumbnailPath: 'resources/image/arrange-objects.png',
      sourcePath: 'view/arrange-objects/ArrangeObjectsDemo.js',
      tags: ['viewer'],
      keywords: ['v2.4.0.4', 'arrange', 'align nodes', 'distribute nodes']
    },
    {
      id: 'custom-styles',
      name: 'Custom Styles',
      demoPath: 'style/customstyles/index.html',
      summary:
        'Shows how to create custom styles for nodes, edges, labels, ports, and edge arrows.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/customstyles.png',
      sourcePath: 'style/customstyles/CustomStyleDemo.js',
      tags: ['style', 'grouping'],
      keywords: ['folding', 'labels', 'ports']
    },
    {
      id: 'template-styles',
      name: 'Template Styles',
      demoPath: 'style/templatestyles/index.html',
      summary: 'Shows SVG template styles for nodes, labels and ports.',
      category: 'style',
      type: 'custom-styles',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/templatestyles.png',
      sourcePath: 'style/templatestyles/TemplateStylesDemo.js',
      tags: ['style', 'data binding'],
      keywords: ['v2.1.0.2', 'svg', 'data panel', 'templates', 'notable style']
    },
    {
      id: 'string-template-node-style',
      name: 'String Template Node Style',
      demoPath: 'style/string-template-node-style/index.html',
      summary: 'Presents a versatile and customizable template node style.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/string-template-node-style.png',
      sourcePath: 'style/string-template-node-style/StringTemplateNodeStyleDemo.js',
      tags: ['style', 'template'],
      keywords: ['v2.4.0.4', 'data bindings', 'data panel']
    },
    {
      id: 'react-template-node-style',
      name: 'React JSX Component Style',
      demoPath: 'style/react-template-node-style/index.html',
      summary:
        'Presents a versatile and easily customizable template node style based on JSX and React.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/generic-template-style.png',
      sourcePath: 'style/react-template-node-style/ReactComponentStylesDemo.js',
      tags: ['style', 'template', 'react', 'jsx'],
      keywords: ['v2.5.0.2', 'data bindings', 'data panel', 'tree', 'htmlvisual']
    },
    {
      id: 'vue-template-node-style',
      name: 'Vue Template Node Style',
      demoPath: 'style/vue-template-node-style/index.html',
      summary: 'Presents a versatile and easily customizable template node style based on Vue.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/generic-template-style.png',
      sourcePath: 'style/vue-template-node-style/VueTemplateNodeStyleDemo.js',
      tags: ['style', 'template', 'vuejs'],
      keywords: ['v2.1.0.0', 'data bindings', 'data panel', 'tree']
    },
    {
      id: 'lit-template-node-style',
      name: 'Lit Template Node Style',
      demoPath: 'style/lit-template-node-style/index.html',
      summary:
        'Presents a versatile and easily customizable template node style based on the Lit templating framework.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/lit-template-node-style.png',
      sourcePath: 'style/lit-template-node-style/LitTemplateNodeStyleDemo.js',
      tags: ['style', 'template', 'lit'],
      keywords: ['v2.5.0.2', 'data bindings', 'data panel', 'conditional', 'rendering']
    },
    {
      id: 'webgl-styles',
      name: 'WebGL2 Styles',
      demoPath: 'style/webgl-styles/index.html',
      summary: 'Shows the various graph element styles available in WebGL2 rendering.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/webgl-styles.png',
      sourcePath: 'style/webgl-styles/WebGLStylesDemo.js',
      tags: ['style', 'webgl2'],
      keywords: ['v2.4.0.0', 'v2.5.0.0', 'styles', 'notable style']
    },
    {
      id: 'webgl-selection-styles',
      name: 'WebGL2 Selection Styles',
      demoPath: 'style/webgl-selection-styles/index.html',
      summary: 'Shows the possible styling configurations for selections in WebGL2 rendering.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/webgl-selection-styles.png',
      sourcePath: 'style/webgl-selection-styles/WebGLSelectionStylesDemo.js',
      tags: ['style', 'webgl2', 'selection'],
      keywords: ['v2.5.0.0', 'styles']
    },
    {
      id: 'css-styling',
      name: 'CSS Styling',
      demoPath: 'style/cssstyling/index.html',
      summary: 'Shows how to style indicators and other templates.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/cssstyling.png',
      sourcePath: 'style/cssstyling/CSSStylingDemo.js',
      tags: ['css', 'indicators', 'themes'],
      keywords: ['stylesheets', 'v2.2.0.0', 'labels', 'notable style']
    },
    {
      id: 'theme-variants',
      name: 'Theme Variants',
      demoPath: 'style/theme-variants/index.html',
      summary: 'Shows various interaction visualization themes simultaneously.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/theming.png',
      sourcePath: 'style/theme-variants/ThemeVariantsDemo.js',
      tags: ['theme', 'handle', 'color'],
      keywords: ['v2.5.0.0']
    },
    {
      id: 'isometric-bar-chart-style',
      name: 'Isometric Bar Chart Node Style',
      demoPath: 'style/isometric-bar-chart-style/index.html',
      summary: 'Shows how a node style can be augmented with isometric bars.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/isometric-bar-chart-style.png',
      sourcePath: 'style/isometric-bar-chart-style/IsometricBarChartStyleDemo.js',
      tags: ['styles', 'projection', 'bars'],
      keywords: ['v2.4.0.4', 'organic', 'labels', '3D', 'isometric', 'bars', 'notable style']
    },
    {
      id: 'd3-chart-nodes',
      name: 'd3 Chart Nodes',
      demoPath: 'style/d3chartnodes/index.html',
      summary: 'Presents a node style that visualizes dynamic data with d3.js.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/d3chartnodes.png',
      sourcePath: 'style/d3chartnodes/D3ChartNodesDemo.js',
      tags: ['style', 'sparklines', 'bars'],
      keywords: ['v2.2.0.0', 'd3js', 'd3.js']
    },
    {
      id: 'editable-path-style',
      name: 'Editable Path Node Style',
      demoPath: 'style/editablepathstyle/index.html',
      summary: 'Shows a path-based node style whose control points can be moved by users.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/editablepath.png',
      sourcePath: 'style/editablepathstyle/EditablePathNodeStyle.js',
      tags: ['style', 'path', 'editing'],
      keywords: ['v2.3.0.2', 'handles', 'general paths', 'interaction', 'editing']
    },
    {
      id: 'webgl-icon-node',
      name: 'WebGL2 Icon Node',
      demoPath: 'style/webgl-icon-node/index.html',
      summary: 'Shows how to render icon nodes with WebGL2.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/webgl-icon-node.png',
      sourcePath: 'style/webgl-icon-node/WebGLIconNodeDemo.js',
      tags: ['style', 'webgl2'],
      keywords: ['v2.4.0.0', 'notable style']
    },
    {
      id: 'clickable-style-decorator',
      name: 'Clickable Style Decorator',
      summary: 'Illustrates an approach for handling clicks on specific areas of the style.',
      demoPath: 'style/clickable-style-decorator/index.html',
      thumbnailPath: 'resources/image/clickable-style-decorator.png',
      category: 'style',
      tags: ['interaction', 'icon'],
      keywords: [
        'NodeDecorator',
        'ILookupDecorator',
        'NodeStyleBase',
        'images',
        'events',
        'regions',
        'input mode'
      ],
      sourcePath: 'style/clickable-style-decorator/ClickableStyleDecoratorDemo.js'
    },
    {
      id: 'composite-node-style',
      name: 'Composite Node Style',
      summary: 'Shows how to combine node visualizations from several styles.',
      demoPath: 'style/composite-node-style/index.html',
      thumbnailPath: 'resources/image/composite-node-style.png',
      category: 'style',
      tags: ['style', 'icon'],
      keywords: ['v2.4.0.4', 'composite'],
      sourcePath: 'style/composite-node-style/CompositeNodeStyleDemo.js'
    },
    {
      id: 'level-of-detail-style',
      name: 'Level of Detail Style',
      summary: 'Shows a node style that hides details when zooming out.',
      demoPath: 'style/level-of-detail-style/index.html',
      thumbnailPath: 'resources/image/level-of-detail-style.png',
      category: 'style',
      tags: ['style', 'performance'],
      keywords: ['v2.2.0.0', 'data binding', 'readability', 'hide', 'rendering', 'sketch'],
      sourcePath: 'style/level-of-detail-style/LevelOfDetailDemo.js'
    },
    {
      id: 'list-node',
      name: 'List Node',
      demoPath: 'view/list-node/index.html',
      summary: 'Shows a node which contains re-arrangeable rows.',
      category: 'view',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/listnode.png',
      sourcePath: 'view/list-node/ListNodeDemo.js',
      tags: ['interaction', 'style', 'table'],
      keywords: ['v2.4.0.4', 'rows', 'tables']
    },
    {
      id: 'data-table',
      name: 'Data Table',
      demoPath: 'style/datatable/index.html',
      summary: 'Shows a node style and a label style that display data in a tabular fashion.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/datatable.png',
      sourcePath: 'style/datatable/DataTableDemo.js',
      tags: ['style', 'label'],
      keywords: ['v2.6.0.0', 'data table', 'structures', 'data management', 'html', 'htmlvisual']
    },
    {
      id: 'bezier-edge-style',
      name: 'Bezier Edge Style',
      demoPath: 'style/bezieredgestyle/index.html',
      summary: 'Shows how to use the curved edge style consisting of Bezier splines.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/bezieredgestyle.png',
      sourcePath: 'style/bezieredgestyle/BezierEdgeStyleDemo.js',
      tags: ['style', 'curve', 'interaction'],
      keywords: [
        'v2.3.0.0',
        'handles',
        'indicators',
        'bends',
        'create edge input mode',
        'selection',
        'labels',
        'curves',
        'bezier'
      ]
    },
    {
      id: 'directed-edge-label-style',
      name: 'Directed Edge Label Style',
      demoPath: 'style/directed-edge-label/index.html',
      summary:
        'Shows label styles displaying arrows that always point to the source or target port.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/directed-edge-label.png',
      sourcePath: 'style/directed-edge-label/DirectedEdgeLabelDemo.js',
      tags: ['style', 'label', 'edge'],
      keywords: ['v2.4.0.4', 'edges', 'directed', 'labels']
    },
    {
      id: 'markup-labels',
      name: 'Markup Label',
      summary:
        'Markup label style lets you use html-like markup to structure and style the label text.',
      demoPath: 'style/markup-labels/index.html',
      thumbnailPath: 'resources/image/markuplabels.png',
      category: 'style',
      type: 'custom-styles',
      tags: ['style', 'label', 'markup'],
      keywords: ['v2.3.0.0', 'rich texts', 'styling', 'html', 'xml', 'color'],
      sourcePath: 'style/markup-labels/MarkupLabelsDemo.js'
    },
    {
      id: 'markdown-label',
      name: 'Markdown Label',
      demoPath: 'style/markdownlabel/index.html',
      summary: 'Use markdown to format the label text.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/markdownlabel.png',
      sourcePath: 'style/markdownlabel/MarkdownLabelDemo.js',
      tags: ['style', 'label', 'markdown'],
      keywords: ['v2.3.0.0', 'rich text', 'styling', 'html', 'markdown']
    },
    {
      id: 'rich-text-label',
      name: 'Rich Text Label',
      demoPath: 'style/richtextlabel/index.html',
      summary: 'Edit markup labels with a WYSIWYG text editor.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/richtextlabel.png',
      sourcePath: 'style/richtextlabel/RichTextLabelDemo.js',
      tags: ['style', 'label', 'rich text'],
      keywords: ['v2.3.0.0', 'styling', 'html', 'xml', 'markdown', 'markup', 'colors', 'wysiwyg']
    },
    {
      id: 'overview',
      name: 'Overview Styling',
      demoPath: 'view/overviewstyles/index.html',
      summary: 'Shows several different rendering techniques and styles for the overview.',
      category: 'view',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/overview.png',
      sourcePath: 'view/overviewstyles/OverviewStylesDemo.js',
      tags: ['style', 'canvas'],
      keywords: ['v2.2.0.0', 'overview input mode', 'svg', 'labels']
    },
    {
      id: 'html-controls',
      name: 'HTML Controls',
      demoPath: 'style/html-controls/index.html',
      summary: 'Shows how a custom HTML-based node style can be used to create interactive nodes.',
      category: 'style',
      type: 'custom-styles',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/html-controls.png',
      sourcePath: 'style/html-controls/HtmlControlsDemo.js',
      tags: ['style', 'label'],
      keywords: ['v2.6.0.0', 'html', 'responsive', 'htmlvisual']
    },
    {
      id: 'html-label-style',
      name: 'HTML Label Style',
      demoPath: 'style/html-label-style/index.html',
      summary: 'Shows how HTML can be used for label rendering with a custom label style.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/html-label-style.png',
      sourcePath: 'style/html-label-style/HtmlLabelStyleDemo.js',
      tags: ['style', 'label', 'htmlvisual'],
      keywords: ['v2.6.0.0']
    },
    {
      id: 'invariant-label-style',
      name: 'Zoom-invariant Label Style',
      demoPath: 'style/invariant-label/index.html',
      summary: 'Shows label styles that are independent of the zoom level.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/invariant-label.png',
      sourcePath: 'style/invariant-label/ZoomInvariantLabelStyleDemo.js',
      tags: ['style', 'label', 'zoom'],
      keywords: ['v2.2.0.2', 'size', 'fit']
    },
    {
      id: 'simple-arrow-style',
      name: 'Simple Arrow Style',
      demoPath: 'style/simple-arrow-style/index.html',
      summary: 'Shows how to create a simple custom arrow for edges.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/simple-arrow-style.png',
      sourcePath: 'style/simple-arrow-style/SimpleArrowStyleDemo.js',
      tags: ['style', 'arrow'],
      keywords: ['v2.5.0.2', 'styling', 'arrow', 'edge', 'custom']
    },
    {
      id: 'selection-styling',
      name: 'Selection Styling',
      demoPath: 'style/selectionstyling/index.html',
      summary:
        'Shows customized selection painting of nodes, edges and labels by decorating these items with a corresponding\n      style.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/selectionstyling.png',
      sourcePath: 'style/selectionstyling/SelectionStylingDemo.js',
      tags: ['style', 'interaction'],
      keywords: ['selection styling', 'labels', 'notable style']
    },
    {
      id: 'style-decorators',
      name: 'Style Decorators',
      demoPath: 'style/styledecorators/index.html',
      summary:
        'Shows how to create styles for nodes, edges, and labels that wrap existing styles and add visual decorators.',
      category: 'style',
      type: 'custom-styles',
      thumbnailPath: 'resources/image/styledecorators.png',
      sourcePath: 'style/styledecorators/StyleDecoratorsDemo.js',
      tags: ['style', 'decorators'],
      keywords: ['ports']
    },
    {
      id: 'edge-bundling',
      name: 'Edge Bundling',
      demoPath: 'layout/edgebundling/index.html',
      summary:
        'Shows how edge bundling can be applied for reducing visual cluttering in dense graphs.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/edgebundling.png',
      sourcePath: 'layout/edgebundling/EdgeBundlingDemo.js',
      tags: ['style', 'curve', 'layout'],
      keywords: [
        'context menu',
        'organic',
        'radial',
        'tree',
        'balloon',
        'bundles',
        'bezier',
        'curves',
        'data analysis'
      ]
    },
    {
      id: 'chord-diagram',
      name: 'Chord Diagram',
      demoPath: 'showcase/chord-diagram/index.html',
      summary: 'Shows a chord diagram that emphasizes the magnitude of connections between nodes.',
      category: 'showcase',
      type: 'layout-features',
      thumbnailPath: 'resources/image/chord-diagram.png',
      sourcePath: 'showcase/chord-diagram/ChordDiagramDemo.js',
      tags: ['edge thickness', 'style', 'layout'],
      keywords: ['v2.4.0.4', 'chords', 'arcs', 'bezier', 'curves', 'notable style']
    },
    {
      id: 'chord-diagram-non-ribbon',
      name: 'Non-ribbon Chord Diagram',
      demoPath: 'showcase/chord-diagram-non-ribbon/index.html',
      summary:
        'Shows a non-ribbon chord diagram that emphasizes the traceability of the connections.',
      category: 'showcase',
      type: 'layout-features',
      thumbnailPath: 'resources/image/chord-diagram-non-ribbon.png',
      sourcePath: 'showcase/chord-diagram-non-ribbon/NonRibbonChordDiagramDemo.js',
      tags: ['style', 'layout', 'curve'],
      keywords: ['v2.5.0.2', 'chords', 'arcs', 'bezier', 'curves', 'notable style', 'node types']
    },
    {
      id: 'arc-diagram',
      name: 'Arc Diagram',
      demoPath: 'layout/arc-diagram/index.html',
      summary: 'Shows how to visualize a graph as an arc diagram.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/arc-diagram.png',
      sourcePath: 'layout/arc-diagram/ArcDiagramDemo.js',
      tags: ['layout', 'curve'],
      keywords: ['v2.4.0.4', 'arcs', 'bezier', 'networks', 'curves']
    },
    {
      id: 'maze-routing',
      name: 'Maze Routing',
      demoPath: 'layout/mazerouting/index.html',
      summary: 'Shows how the automatic edge routing finds routes through a maze.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/mazerouting.png',
      sourcePath: 'layout/mazerouting/MazeRoutingDemo.js',
      tags: ['layout', 'edge routing', 'polyline'],
      keywords: ['edge router', 'polyline router', 'background', 'layout', 'data analysis']
    },
    {
      id: 'component-drag-and-drop',
      name: 'Component Drag and Drop',
      demoPath: 'input/componentdraganddrop/index.html',
      summary:
        'A demo that shows how to clear space for a dropped component in an existing layout.',
      category: 'input',
      type: 'layout-features',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/componentdraganddrop.png',
      sourcePath: 'input/componentdraganddrop/ComponentDragAndDropDemo.js',
      tags: ['layout', 'component'],
      keywords: [
        'v2.3.0.0',
        'drop input mode',
        'create',
        'space',
        'clear area layout',
        'fill area layout',
        'drag and drop',
        'palette',
        'dnd',
        'interactive'
      ]
    },
    {
      id: 'edge-label-placement',
      name: 'Edge Label Placement',
      demoPath: 'layout/edgelabelplacement/index.html',
      summary:
        'Shows how to place edge labels at the preferred location with a labeling algorithm.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/edgelabelplacement.png',
      sourcePath: 'layout/edgelabelplacement/EdgeLabelPlacementDemo.js',
      tags: ['label placement'],
      keywords: [
        'integrated',
        'texts',
        'generic labeling',
        'tree',
        'hierarchic',
        'orthogonal',
        'edge router',
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
      type: 'layout-features',
      thumbnailPath: 'resources/image/nodelabelplacement.png',
      sourcePath: 'layout/nodelabelplacement/NodeLabelPlacementDemo.js',
      tags: ['label placement'],
      keywords: ['generic labeling', 'text', 'background']
    },
    {
      id: 'node-types',
      name: 'Node Types',
      demoPath: 'layout/nodetypes/index.html',
      summary: 'Shows how different layout algorithms handle nodes with types.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/nodetypes.png',
      sourcePath: 'layout/nodetypes/NodeTypesDemo.js',
      tags: ['layout', 'node type'],
      keywords: [
        'v2.4.0.0',
        'v2.5.0.0',
        'types',
        'tree',
        'hierarchic',
        'organic',
        'components',
        'circular',
        'balloon',
        'compact disk',
        'data analysis'
      ]
    },
    {
      id: 'interactive-hierarchic-layout',
      name: 'Interactive Hierarchic Layout',
      demoPath: 'layout/interactive-hierarchic/index.html',
      summary:
        'The incremental mode of the hierarchic layout style can fit new nodes and edges into the existing drawing.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/incrementalhierarchic.png',
      sourcePath: 'layout/interactive-hierarchic/InteractiveHierarchicDemo.js',
      tags: ['layout', 'hierarchic'],
      keywords: ['ports', 'background', 'incremental']
    },
    {
      id: 'interactive-edge-routing',
      name: 'Interactive Edge Routing',
      demoPath: 'layout/interactiveedgerouting/index.html',
      summary: 'After each edit the edge paths are re-routed if necessary.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/interactiveedgerouting.png',
      sourcePath: 'layout/interactiveedgerouting/InteractiveEdgeRoutingDemo.js',
      tags: ['layout', 'edge routing'],
      keywords: ['v2.4.0.0', 'interaction', 'edge router']
    },
    {
      id: 'edge-grouping',
      name: 'Edge Grouping',
      demoPath: 'layout/edgegrouping/index.html',
      summary: 'The hierarchic layout can group the paths or ports of edges.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/edgegrouping.png',
      sourcePath: 'layout/edgegrouping/EdgeGroupingDemo.js',
      tags: ['layout', 'hierarchic'],
      keywords: [
        'v2.1.0.3',
        'edge groups',
        'port groups',
        'hierarchic',
        'ports',
        'context menu',
        'groups',
        'bridges',
        'data analysis'
      ]
    },
    {
      id: 'edge-router-grouping',
      name: 'EdgeRouter Grouping',
      demoPath: 'layout/edgeroutergrouping/index.html',
      summary: 'The EdgeRouter can group the paths or ports of edges.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/edge-router-grouping.png',
      sourcePath: 'layout/edgeroutergrouping/EdgeRouterGroupingDemo.js',
      tags: ['layout', 'edge routing'],
      keywords: [
        'v2.2.0.2',
        'edge groups',
        'port groups',
        'edge router',
        'polyline',
        'ports',
        'context menu',
        'bridges',
        'data analysis'
      ]
    },
    {
      id: 'boundary-labeling',
      name: 'Boundary Labeling',
      demoPath: 'layout/boundary-labeling/index.html',
      summary: 'Shows how to configure organic layout for annotating points on a diagram.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/boundary-labeling.png',
      sourcePath: 'layout/boundary-labeling/BoundaryLabelingDemo.js',
      tags: ['layout', 'organic', 'constraint'],
      keywords: [
        'v2.6.0.0',
        'align',
        'horizontal',
        'vertical',
        'labeling',
        'boundary',
        'map',
        'technical drawing',
        'image'
      ]
    },
    {
      id: 'height-profile',
      name: 'Height Profile',
      demoPath: 'layout/height-profile/index.html',
      summary: 'Shows how to configure organic layout to create height profile visualization',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/height-profile.png',
      sourcePath: 'layout/height-profile/HeightProfileDemo.js',
      tags: ['layout', 'organic', 'constraints'],
      keywords: ['v2.6.0.0', 'height', 'labeling', 'timeline', 'time', 'time-data']
    },
    {
      id: 'metabolic-pathways',
      name: 'Metabolic Pathways',
      demoPath: 'layout/metabolic-pathways/index.html',
      summary: 'Shows how to configure organic layout for visualizing metabolic pathways.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/metabolic-pathways.png',
      sourcePath: 'layout/metabolic-pathways/MetabolicPathwaysDemo.js',
      tags: ['layout', 'organic', 'constraint'],
      keywords: [
        'v2.6.0.0',
        'align',
        'horizontal',
        'vertical',
        'cycle',
        'circle',
        'biology',
        'chemical',
        'reaction'
      ]
    },
    {
      id: 'organic-substructures',
      name: 'Organic Substructures',
      demoPath: 'layout/organic-substructures/index.html',
      summary: 'Shows organic layout, and its substructures and node types features.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/organic-substructures.png',
      sourcePath: 'layout/organic-substructures/OrganicSubstructuresDemo.js',
      tags: ['layout', 'organic', 'substructure', 'node type'],
      keywords: ['v2.4.0.0', 'clustering', 'grouping', 'similar', 'data management']
    },
    {
      id: 'circular-substructures',
      name: 'Circular Substructures',
      demoPath: 'layout/circular-substructures/index.html',
      summary: 'Shows circular layout, and its substructures and node types features.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/circular-substructures.png',
      sourcePath: 'layout/circular-substructures/CircularSubstructuresDemo.js',
      tags: ['layout', 'circular', 'substructure', 'node type'],
      keywords: ['v2.6.0.0']
    },
    {
      id: 'busrouting',
      name: 'Bus Routing',
      demoPath: 'layout/busrouting/index.html',
      summary: 'Shows how to group edges in bus structures.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/busrouting.png',
      sourcePath: 'layout/busrouting/BusRoutingDemo.js',
      tags: ['layout', 'edge routing', 'bus'],
      keywords: ['v2.4.0.0', 'edge router', 'edge groups', 'bus structures']
    },
    {
      id: 'fill-area-layout',
      name: 'Fill Area Layout',
      demoPath: 'layout/fillarealayout/index.html',
      summary: 'Shows how to fill free space after deleting nodes.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/fillarealayout.png',
      sourcePath: 'layout/fillarealayout/FillAreaLayoutDemo.js',
      tags: ['layout', 'interactive layout'],
      keywords: ['v2.3.0.0', 'deletion', 'adjustment', 'interactive']
    },
    {
      id: 'clear-marquee-area',
      name: 'Clear Marquee Area',
      demoPath: 'layout/clearmarqueearea/index.html',
      summary: 'Shows how to automatically keep a marquee area clear of graph elements.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/clearmarqueearea.png',
      sourcePath: 'layout/clearmarqueearea/ClearMarqueeAreaDemo.js',
      tags: ['layout', 'interactive layout'],
      keywords: [
        'v2.3.0.2',
        'create',
        'space',
        'clear area layout',
        'fill area layout',
        'adjustment',
        'interactive'
      ]
    },
    {
      id: 'clear-rectangle-area',
      name: 'Clear Rectangle Area',
      demoPath: 'layout/clearrectanglearea/index.html',
      summary:
        'Shows how to automatically keep a user-defined rectangular area clear of graph elements.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/clearrectanglearea.png',
      sourcePath: 'layout/clearrectanglearea/ClearRectangleAreaDemo.js',
      tags: ['layout', 'interactive layout'],
      keywords: [
        'v2.3.0.2',
        'create',
        'space',
        'clear area layout',
        'fill area layout',
        'adjustment',
        'interactive'
      ]
    },
    {
      id: 'node-overlap-avoiding',
      name: 'Node Overlap Avoiding',
      demoPath: 'layout/nodeoverlapavoiding/index.html',
      summary:
        'Shows how an automatic layout can remove node overlaps while a user interactively edits a graph.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/nodeoverlapavoiding.png',
      sourcePath: 'layout/nodeoverlapavoiding/NodeOverlapAvoidingDemo.js',
      tags: ['layout', 'interactive layout'],
      keywords: [
        'v2.3.0.2',
        'move',
        'resize',
        'resizing',
        'space',
        'clear area layout',
        'fill area layout',
        'adjustment',
        'interactive'
      ]
    },
    {
      id: 'node-alignment',
      name: 'Node Alignment',
      demoPath: 'layout/node-alignment/index.html',
      summary: 'Shows how to align nodes on horizontal and/or vertical lines.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/node-alignment.png',
      sourcePath: 'layout/node-alignment/NodeAlignmentDemo.js',
      tags: ['layout', 'interactive layout'],
      keywords: ['v2.6.0.0', 'node alignment', 'snapping', 'interactive', 'drag', 'drop']
    },
    {
      id: 'hierarchic-busstructures',
      name: 'Hierarchic Bus Structures',
      demoPath: 'layout/busstructures/index.html',
      summary: 'Bus structures in the hierarchic layout result in more compact arrangements.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/busstructures.png',
      sourcePath: 'layout/busstructures/BusStructuresDemo.js',
      tags: ['layout', 'hierarchic', 'bus'],
      keywords: ['v2.2.0.2', 'bus structures', 'orthogonal', 'compact']
    },
    {
      id: 'hierarchic-subcomponents',
      name: 'Hierarchic Subcomponents',
      demoPath: 'layout/subcomponents/index.html',
      summary: 'The hierarchic layout can arrange subcomponents with different layout styles.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/subcomponents.png',
      sourcePath: 'layout/subcomponents/SubcomponentsDemo.js',
      tags: ['layout', 'hierarchic'],
      keywords: ['v2.5.0.0', 'tree', 'organic', 'orthogonal']
    },
    {
      id: 'tabular-groups',
      name: 'Tabular Groups',
      summary: 'Shows how to configure the tabular groups feature of the hierarchical layout.',
      demoPath: 'layout/tabular-groups/index.html',
      thumbnailPath: 'resources/image/tabular-groups.png',
      category: 'layout',
      tags: ['hierarchic', 'tabular', 'groups'],
      keywords: ['v2.5.0.0', 'layout', 'table', 'column', 'compact'],
      sourcePath: 'layout/tabular-groups/TabularGroupsDemo.js'
    },
    {
      id: 'critical-paths',
      name: 'Critical Paths',
      demoPath: 'layout/criticalpaths/index.html',
      summary:
        'The hierarchic and tree layout styles can emphasize critical (important) paths by aligning their nodes.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/CriticalPaths.png',
      sourcePath: 'layout/criticalpaths/CriticalPathsDemo.js',
      tags: ['layout', 'hierarchic', 'tree'],
      keywords: ['context menu', 'data analysis']
    },
    {
      id: 'custom-layout-stage',
      name: 'Custom Layout Stage',
      sourcePath: 'layout/custom-layout-stage/CustomLayoutStageDemo.js',
      summary:
        'Custom layout stages can be used to solve unique layout problems that are not adequately covered by existing layout algorithms.',
      demoPath: 'layout/custom-layout-stage/index.html',
      thumbnailPath: 'resources/image/CustomLayoutStage.png',
      category: 'layout',
      type: 'layout-features',
      tags: ['layout', 'layout stage'],
      keywords: [
        'v2.4.0.0',
        'ILayoutStage',
        'LayoutStageBase',
        'CoreLayout',
        'IDataProvider',
        'data provider',
        'LayoutGraph',
        'LayoutGraphHider',
        'dummy edges',
        'temporary elements',
        'temporary edges',
        'layout post-processing',
        'DataProviderBase',
        'GenericLayoutData',
        'LayoutData'
      ]
    },
    {
      id: 'split-edges',
      name: 'Split Edges',
      demoPath: 'layout/splitedges/index.html',
      summary:
        'Shows how to align edges at group nodes using RecursiveGroupLayout with HierarchicLayout.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/splitedges.png',
      sourcePath: 'layout/splitedges/SplitEdgesDemo.js',
      tags: ['layout', 'hierarchic', 'tree'],
      keywords: ['v2.1.0.3', 'context menu', 'recursive']
    },
    {
      id: 'partition-grid',
      name: 'Partition Grid',
      demoPath: 'layout/partitiongrid/index.html',
      summary: 'Demonstrates the usage of a partition grid for hierarchic and organic layouts.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/partitiongrid.png',
      sourcePath: 'layout/partitiongrid/PartitionGridDemo.js',
      tags: ['layout', 'partition grid', 'hierarchic', 'organic'],
      keywords: ['data management']
    },
    {
      id: 'simple-partition-grid',
      name: 'Simple Partition Grid',
      demoPath: 'layout/simplepartitiongrid/index.html',
      summary: 'Shows how to create a simple partition grid.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/simplePartitionGrid.png',
      sourcePath: 'layout/simplepartitiongrid/SimplePartitionGridDemo.js',
      tags: ['layout', 'partition grid', 'hierarchic'],
      keywords: ['v2.2.0.0']
    },
    {
      id: 'interactive-graph-restructuring',
      name: 'Interactive Graph Restructuring',
      demoPath: 'input/interactivegraphrestructuring/index.html',
      summary: 'Shows how to interactively relocate subtrees from one parent to another.',
      category: 'input',
      type: 'layout-features',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/interactivegraphrestructuring.png',
      sourcePath: 'input/interactivegraphrestructuring/InteractiveGraphRestructuringDemo.js',
      tags: ['interactive layout', 'animation'],
      keywords: [
        'v2.3.0.0',
        'tree',
        'sub-tree',
        're-parent',
        'fill area layout',
        'create space',
        'space maker'
      ]
    },
    {
      id: 'layer-constraints',
      name: 'Layer Constraints',
      demoPath: 'layout/layerconstraints/index.html',
      summary:
        'Shows how to use layer constraints to prescribe the node layering in hierarchic layouts.',
      category: 'layout',
      type: 'layout-features',
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
      type: 'layout-features',
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
      type: 'layout-features',
      thumbnailPath: 'resources/image/interactive-organic-layout.png',
      sourcePath: 'layout/interactiveorganic/InteractiveOrganicDemo.js',
      tags: ['layout', 'interactive layout'],
      keywords: ['organic', 'move']
    },
    {
      id: 'multi-page-layout',
      name: 'Multi-Page Layout',
      demoPath: 'layout/multipage/index.html',
      summary:
        'Shows how to divide a large model graph into several smaller page graphs, for example to print to multiple pages.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/multipage.png',
      sourcePath: 'layout/multipage/MultiPageDemo.js',
      tags: ['layout', 'hierarchic', 'tree'],
      keywords: [
        'multi page',
        'multiple pages',
        'orthogonal',
        'circular',
        'organic',
        'large',
        'split',
        'print',
        'data analysis',
        'data management'
      ]
    },
    {
      id: 'tree-layout',
      name: 'Tree Layout',
      demoPath: 'layout/tree/index.html',
      summary: 'Shows how to use different node placer in TreeLayout.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/treelayout.png',
      sourcePath: 'layout/tree/TreeLayoutDemo.js',
      tags: ['layout', 'tree'],
      keywords: ['node placers', 'v2.2.0.2']
    },
    {
      id: 'partial-layout',
      name: 'Partial Layout',
      demoPath: 'layout/partial/index.html',
      summary: 'Shows how to integrate new graph elements into an existing graph layout.',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/partiallayout.png',
      sourcePath: 'layout/partial/PartialLayoutDemo.js',
      tags: ['layout', 'incremental', 'partial'],
      keywords: ['hierarchic', 'orthogonal', 'organic', 'circular', 'curves']
    },
    {
      id: 'bridges',
      name: 'Bridges',
      demoPath: 'view/bridges/index.html',
      summary:
        'Shows the capabilities of the <code>BridgeManager</code> class for inserting bridges into edge paths.',
      category: 'view',
      type: 'layout-features',
      thumbnailPath: 'resources/image/bridges.png',
      sourcePath: 'view/bridges/BridgesDemo.js',
      tags: ['line gaps', 'line jumps'],
      keywords: ['intersection', 'intersecting', 'groups']
    },
    {
      id: 'custom-edge-creation',
      name: 'Custom Edge Creation',
      demoPath: 'input/customedgecreation/index.html',
      summary:
        'Shows how to provide directional ports and demonstrates interactive routing during edge creation.',
      category: 'input',
      type: 'layout-features',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/customedgecreation.png',
      sourcePath: 'input/customedgecreation/CustomEdgeCreationDemo.js',
      tags: ['layout', 'edge routing', 'interaction'],
      keywords: [
        'v2.2.0.2',
        'edge router',
        'channel edge router',
        'orthogonal',
        'port candidate provider',
        'styles',
        'ports'
      ]
    },
    {
      id: 'family-tree',
      name: 'Family Tree',
      demoPath: 'layout/familytree/index.html',
      summary: 'Shows how to visualize genealogical graphs (family trees).',
      category: 'layout',
      type: 'layout-features',
      thumbnailPath: 'resources/image/family-tree.png',
      sourcePath: 'layout/familytree/FamilyTreeDemo.js',
      tags: ['layout', 'genealogy'],
      keywords: [
        'family tree',
        'tree',
        'layout',
        'genealogical',
        'v2.2.0.0',
        'structures',
        'labels'
      ]
    },
    {
      id: 'edge-to-edge',
      name: 'Edge To Edge',
      demoPath: 'view/edgetoedge/index.html',
      summary: 'Shows edge-to-edge connections.',
      category: 'view',
      type: 'layout-features',
      thumbnailPath: 'resources/image/edge_to_edge.png',
      sourcePath: 'view/edgetoedge/EdgeToEdgeDemo.js',
      tags: ['edge creation', 'interaction'],
      keywords: ['port candidate providers']
    },
    {
      id: 'graph-builder',
      name: 'Graph Builder',
      demoPath: 'databinding/graphbuilder/index.html',
      summary:
        'Interactively builds and modifies a graph from JSON business data using class <code>GraphBuilder</code>.',
      category: 'databinding',
      type: 'loading',
      thumbnailPath: 'resources/image/graphbuilder.png',
      sourcePath: 'databinding/graphbuilder/GraphBuilderDemo.js',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchic', 'structures', 'labels', 'v2.3.0.0']
    },
    {
      id: 'tree-graph-builder',
      name: 'Tree Builder',
      demoPath: 'databinding/treebuilder/index.html',
      summary:
        'Interactively builds and modifies a graph from JSON business data using class <code>TreeBuilder</code>.',
      category: 'databinding',
      type: 'loading',
      thumbnailPath: 'resources/image/treebuilder.png',
      sourcePath: 'databinding/treebuilder/TreeBuilderDemo.js',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchic', 'structures', 'labels', 'v2.3.0.0']
    },
    {
      id: 'adjacency-graph-builder',
      name: 'Adjacency Graph Builder',
      demoPath: 'databinding/adjacencygraphbuilder/index.html',
      summary:
        'Interactively builds and modifies a graph from JSON business data using class <code>AdjacencyGraphBuilder</code>.',
      category: 'databinding',
      type: 'loading',
      thumbnailPath: 'resources/image/adjacencygraphbuilder.png',
      sourcePath: 'databinding/adjacencygraphbuilder/AdjacencyGraphBuilderDemo.js',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchic', 'structures', 'labels', 'v2.3.0.0']
    },
    {
      id: 'simple-graph-builder',
      name: 'Simple Graph Builder',
      demoPath: 'databinding/simplegraphbuilder/index.html',
      summary:
        'Automatically builds a graph from JSON business data using <code>GraphBuilder</code>, <code>AdjacencyGraphBuilder</code> or <code>TreeBuilder</code>.',
      category: 'databinding',
      type: 'loading',
      thumbnailPath: 'resources/image/simplegraphbuilder.png',
      sourcePath: 'databinding/simplegraphbuilder/SimpleGraphBuilderDemo.js',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchic', 'labels', 'v2.3.0.0']
    },
    {
      id: 'port-aware-graph-builder',
      name: 'Port-aware Graph Builder',
      demoPath: 'databinding/port-aware-graph-builder/index.html',
      summary:
        'Builds a graph using <code>GraphBuilder</code> and connects the items to specific ports.',
      category: 'databinding',
      type: 'loading',
      thumbnailPath: 'resources/image/port-aware-graph-builder.png',
      sourcePath: 'databinding/port-aware-graph-builder/PortAwareGraphBuilderDemo.js',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchic', 'ports', 'v2.5.0.0']
    },
    {
      id: 'port-aware-adjacency-graph-builder',
      name: 'Port-aware Adjacency Graph Builder',
      demoPath: 'databinding/port-aware-adjacency-graph-builder/index.html',
      summary:
        'Builds a graph using <code>AdjacencyGraphBuilder</code> and connects the items to specific ports.',
      category: 'databinding',
      type: 'loading',
      thumbnailPath: 'resources/image/port-aware-adjacency-graph-builder.png',
      sourcePath:
        'databinding/port-aware-adjacency-graph-builder/PortAwareAdjacencyGraphBuilderDemo.js',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchic', 'ports', 'v2.5.0.0']
    },
    {
      id: 'port-aware-tree-builder',
      name: 'Port-aware Tree Builder',
      demoPath: 'databinding/port-aware-tree-builder/index.html',
      summary:
        'Builds a graph using <code>TreeBuilder</code> and connects the items to specific ports.',
      category: 'databinding',
      type: 'loading',
      thumbnailPath: 'resources/image/port-aware-tree-builder.png',
      sourcePath: 'databinding/port-aware-tree-builder/PortAwareTreeBuilderDemo.js',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['tree', 'ports', 'v2.5.0.0']
    },
    {
      id: 'image-export',
      name: 'Image Export',
      demoPath: 'view/imageexport/index.html',
      summary: 'Shows how to export the whole diagram or a part of it to a PNG image.',
      category: 'view',
      type: 'export',
      thumbnailPath: 'resources/image/export.png',
      sourcePath: 'view/imageexport/ImageExportDemo.js',
      tags: ['export', 'png', 'jpg'],
      keywords: ['jpeg', 'bitmap', 'save', 'handles']
    },
    {
      id: 'svg-export',
      name: 'SVG Export',
      demoPath: 'view/svgexport/index.html',
      summary: 'Shows how to export the whole diagram or a part of it to an SVG image.',
      category: 'view',
      type: 'export',
      thumbnailPath: 'resources/image/export.png',
      sourcePath: 'view/svgexport/SvgExportDemo.js',
      tags: ['export', 'svg', 'vector graphics'],
      keywords: ['scalable vector graphics', 'save', 'handles', 'curves', 'bezier']
    },
    {
      id: 'pdf-export',
      name: 'PDF Export',
      demoPath: 'view/pdfexport/index.html',
      summary: 'Shows how to export the whole diagram or a part of it to a PDF.',
      category: 'view',
      type: 'export',
      thumbnailPath: 'resources/image/export.png',
      sourcePath: 'view/pdfexport/PdfExportDemo.js',
      tags: ['export', 'pdf'],
      keywords: ['vector graphics', 'handles']
    },
    {
      id: 'printing',
      name: 'Printing',
      demoPath: 'view/printing/index.html',
      summary: 'Shows how to print the whole diagram or a part of it.',
      category: 'view',
      type: 'export',
      thumbnailPath: 'resources/image/export.png',
      sourcePath: 'view/printing/PrintingDemo.js',
      tags: ['printing'],
      keywords: ['posters', 'vector graphics', 'handles']
    },
    {
      id: 'file-operations',
      name: 'File Operations',
      demoPath: 'application-features/file-operations/index.html',
      summary: 'Shows various ways to open and save a graph as GraphML.',
      category: 'view',
      type: 'integration',
      thumbnailPath: 'resources/image/file-operations.png',
      sourcePath: 'application-features/file-operations/FileOperationsDemo.js',
      tags: ['i/o', 'export', 'graphml'],
      keywords: ['load', 'save', 'io', 'json', 'graphbuilder']
    },
    {
      id: 'events-viewer',
      name: 'Events Viewer',
      demoPath: 'view/events/index.html',
      summary:
        'Shows the multitude of events provided by the classes <code>IGraph</code>, <code>GraphComponent</code>, and the <em>Input Modes</em>.',
      category: 'view',
      type: 'integration',
      thumbnailPath: 'resources/image/events.png',
      sourcePath: 'view/events/EventsDemo.js',
      tags: ['interaction'],
      keywords: ['palette', 'drag and drop', 'dnd']
    },
    {
      id: 'webgl-precompilation',
      name: 'WebGL2 Precompilation',
      demoPath: 'view/webgl-precompilation/index.html',
      summary: 'Shows how to precompile the WebGL2 styles you want to use',
      category: 'view',
      type: 'source-code',
      thumbnailPath: 'resources/image/webgl-precompilation.png',
      sourcePath: 'view/webgl-precompilation/WebGLPrecompilationDemo.js',
      tags: ['webgl2'],
      keywords: ['v2.6.0.0', 'shader', 'compile']
    },
    {
      id: 'angular-cli',
      name: 'Angular CLI',
      demoPath: 'toolkit/angular/README.html',
      summary:
        'Shows how to use yFiles for HTML in an Angular app (Angular 2 and newer) using Angular CLI.',
      category: 'integration',
      type: 'integration',
      packageType: 'needs-layout',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/angular.png',
      sourcePath: 'toolkit/angular/src/main.ts',
      tags: ['angular', 'data binding'],
      keywords: ['v2.1.0.0', 'tools', 'tree', 'data panel', 'integration']
    },
    {
      id: 'angular-component-node-style',
      name: 'Angular Component Node Style',
      demoPath: 'style/angular-component-node-style/README.html',
      summary: 'Shows how to use an Angular component to visualize graph nodes.',
      category: 'style',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/angular-component-node-style.png',
      sourcePath: 'style/angular-component-node-style/src/AngularComponentNodeStyle.ts',
      tags: ['angular', 'component', 'style'],
      keywords: ['v2.6.0.0', 'material', 'htmlvisual']
    },
    {
      id: 'react',
      name: 'React',
      demoPath: 'toolkit/react/README.html',
      summary: 'Shows how to use yFiles for HTML with the React library.',
      category: 'integration',
      type: 'integration',
      packageType: 'needs-layout',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/react.png',
      sourcePath: 'toolkit/react/src/main.tsx',
      tags: ['react', 'json', 'vite'],
      keywords: ['v2.6.0.0', 'web worker', 'data', 'integration']
    },
    {
      id: 'react-class-components',
      name: 'React Class Components',
      demoPath: 'toolkit/react-class-components/README.html',
      summary: 'Shows how to integrate yFiles in a basic React application with class components.',
      category: 'integration',
      type: 'integration',
      packageType: 'needs-layout',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/react.png',
      sourcePath: 'toolkit/react-class-components/src/main.tsx',
      tags: ['react', 'vite'],
      keywords: ['v2.6.0.0', 'integration']
    },
    {
      id: 'react-component-node-style',
      name: 'React Component Node Style',
      demoPath: 'style/react-component-node-style/README.html',
      summary: 'Shows how to use a React component to visualize graph nodes.',
      category: 'style',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/react-component-node-style.png',
      sourcePath: 'style/react-component-node-style/src/ReactComponentHtmlNodeStyle.ts',
      tags: ['react', 'component', 'style'],
      keywords: ['v2.6.0.0', 'material', 'mui', 'htmlvisual']
    },
    {
      id: 'preact',
      name: 'Preact',
      demoPath: 'toolkit/preact/index.html',
      summary: 'Shows how to integrate yFiles in a basic Preact application with TypeScript.',
      category: 'integration',
      type: 'integration',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/preact.png',
      sourcePath: 'toolkit/preact/PreactDemo.ts',
      tags: ['react', 'preact', 'json'],
      keywords: ['v2.4.0.4', 'data', 'integration']
    },
    {
      id: 'vue',
      name: 'Vue',
      demoPath: 'toolkit/vue/README.html',
      summary: 'Shows how to integrate yFiles in a Vue 3 app with TypeScript and Vite.',
      category: 'integration',
      type: 'integration',
      packageType: 'needs-layout',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/vue.png',
      sourcePath: 'toolkit/vue/src/main.ts',
      tags: ['vuejs', 'vue3'],
      keywords: ['v2.6.0.0', 'component', 'single', 'file', 'integration', 'web worker', 'vite']
    },
    {
      id: 'vue-component-node-style',
      name: 'Vue Component Node Style',
      demoPath: 'style/vue-component-node-style/README.html',
      summary: 'Shows how to use a Vue component to visualize graph nodes.',
      category: 'style',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/vue-component-node-style.png',
      sourcePath: 'style/vue-component-node-style/src/VueComponentNodeStyle.ts',
      tags: ['vue', 'component', 'style'],
      keywords: ['v2.6.0.0', 'material', 'vuetify', 'vuejs', 'htmlvisual']
    },
    {
      id: 'svelte',
      name: 'Svelte',
      demoPath: 'toolkit/svelte/README.html',
      summary:
        'Shows how to integrate the yFiles library in a <a href="https://svelte.dev/" target="_blank">Svelte</a> project.',
      category: 'integration',
      type: 'integration',
      packageType: 'needs-layout',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/svelte.png',
      sourcePath: 'toolkit/svelte/src/main.ts',
      tags: ['svelte', 'vite'],
      keywords: ['v2.4.0.4', 'web worker', 'hmr', 'integration']
    },
    {
      id: 'graphql',
      name: 'GraphQL',
      demoPath: 'toolkit/graphql/index.html',
      summary: 'Shows how to load data from a GraphQL service and display it with yFiles for HTML.',
      category: 'integration',
      type: 'integration',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/graphql.png',
      sourcePath: 'toolkit/graphql/GraphQLDemo.js',
      tags: ['graphql', 'database'],
      keywords: ['v2.2.0.2', 'remote', 'organic', 'layout', 'integration']
    },
    {
      id: 'neo4j',
      name: 'Neo4j',
      demoPath: 'toolkit/neo4j/index.html',
      summary: 'Shows how to load data from a Neo4j database and display it with yFiles for HTML.',
      category: 'integration',
      type: 'integration',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/neo4j.png',
      sourcePath: 'toolkit/neo4j/Neo4jDemo.js',
      tags: ['neo4j', 'database'],
      keywords: ['remote', 'organic', 'layout', 'integration']
    },
    {
      id: 'next',
      name: 'Next.js',
      demoPath: 'toolkit/next/README.html',
      summary: 'Shows how to use yFiles for HTML with the Next.js library.',
      category: 'integration',
      type: 'integration',
      packageType: 'needs-layout',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/next.png',
      sourcePath: 'toolkit/next/app/page.tsx',
      tags: ['next.js', 'react'],
      keywords: ['v2.6.0.0', 'web worker', 'data', 'integration', 'nextjs']
    },
    {
      id: 'solid',
      name: 'SolidJS',
      demoPath: 'toolkit/solid/index.html',
      summary: 'Shows how to integrate yFiles in a SolidJS app with TypeScript and Vite.',
      category: 'integration',
      type: 'integration',
      packageType: 'needs-layout',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/solid.png',
      sourcePath: 'toolkit/solid/src/main.tsx',
      tags: ['solidjs', 'vite'],
      keywords: ['v2.6.0.0', 'component', 'integration', 'web worker', 'vite']
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      demoPath: 'loading/nodejs/index.html',
      summary:
        "Shows how to run a yFiles layout algorithm in a <a href='https://nodejs.org/' target='_blank'>Node.js&reg;</a> environment.",
      category: 'loading',
      type: 'integration',
      packageType: 'needs-layout',
      thumbnailPath: 'resources/image/nodejs.png',
      sourcePath: 'loading/nodejs/NodeJSDemo.js',
      tags: ['nodejs', 'layout'],
      keywords: ['folding', 'hierarchic', 'json', 'web worker']
    },
    {
      id: 'web-components',
      name: 'Web Components',
      demoPath: 'toolkit/webcomponents/index.html',
      summary: 'Shows how to use yFiles for HTML with Web Components v1.',
      category: 'integration',
      type: 'integration',
      thumbnailPath: 'resources/image/web_components.png',
      sourcePath: 'toolkit/webcomponents/WebComponentsDemo.js',
      tags: ['web components', 'shadow dom', 'html imports']
    },
    {
      id: 'amd-loading',
      name: 'AMD Loading',
      demoPath: 'loading/amdloading/index.html',
      summary: 'Loads the yFiles library modules with the AMD loading standard (require.js).',
      category: 'loading',
      type: 'integration',
      languageType: 'js-only',
      thumbnailPath: 'resources/image/amdloading.png',
      sourcePath: 'loading/amdloading/AmdLoadingDemo.js',
      tags: ['loader', 'modules'],
      keywords: ['requirejs', 'require.js', 'non-symbolic']
    },
    {
      id: 'basic-module-loading',
      name: 'Basic Module Loading',
      demoPath: 'loading/basic-module-loading/index.html',
      summary: 'A basic example of loading the yFiles library modules.',
      category: 'loading',
      type: 'integration',
      thumbnailPath: 'resources/image/basic-module-loading.png',
      sourcePath: 'loading/basic-module-loading/BasicModuleLoading.ts',
      tags: ['loader', 'modules'],
      keywords: ['minimal', 'start', 'quick']
    },
    {
      id: 'rollup',
      name: 'Rollup.js',
      demoPath: 'loading/rollupjs/README.html',
      summary:
        'Shows how to bundle the yFiles library in a <a href="https://rollupjs.org" target="_blank">rollup</a> project.',
      category: 'loading',
      type: 'integration',
      languageType: 'js-only',
      thumbnailPath: 'resources/image/rollupjs.png',
      sourcePath: 'loading/rollupjs/src/RollupJsDemo.js',
      tags: ['deployment', 'optimizer'],
      keywords: ['v2.2.0.0', 'web worker', 'modules']
    },
    {
      id: 'script-loading',
      name: 'Script Loading',
      demoPath: 'loading/scriptloading/index.html',
      summary: 'Loads the yFiles modules using plain old &lt;script&gt; tags.',
      category: 'loading',
      type: 'integration',
      languageType: 'js-only',
      thumbnailPath: 'resources/image/scriptloading.png',
      sourcePath: 'loading/scriptloading/ScriptLoadingDemo.js',
      tags: ['loader', 'modules'],
      keywords: ['script loading', 'non-symbolic']
    },
    {
      id: 'web-worker-webpack',
      name: 'Web Worker Webpack',
      demoPath: 'loading/webworker-webpack/README.html',
      summary: 'Shows how to run a yFiles layout algorithm in a Web Worker task using Webpack.',
      category: 'loading',
      type: 'integration',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/webworker.png',
      sourcePath: 'loading/webworker-webpack/src/WebWorkerWebpackDemo.ts',
      tags: ['webpack', 'web worker', 'layout'],
      keywords: [
        'v2.4.0.0',
        'threads',
        'threading',
        'background',
        'json',
        'folding',
        'hierarchic',
        'webpack'
      ]
    },
    {
      id: 'web-worker-modules',
      name: 'Web Worker Modules',
      summary: 'Shows how to run a layout in a Web Worker task using module workers.',
      demoPath: 'loading/webworker-modules/index.html',
      sourcePath: 'loading/webworker-modules/WebWorkerModulesDemo.js',
      thumbnailPath: 'resources/image/webworkermodules.png',
      category: 'loading',
      type: 'integration',
      packageType: 'needs-layout',
      tags: ['modules', 'web worker', 'layout'],
      keywords: ['v2.4.0.0', 'threads', 'threading', 'background', 'async', 'modules', 'hierarchic']
    },
    {
      id: 'web-worker-umd',
      name: 'Web Worker UMD',
      demoPath: 'loading/webworker-umd/index.html',
      summary: 'Shows how to run a yFiles layout algorithm in a Web Worker task using AMD modules.',
      category: 'loading',
      type: 'integration',
      languageType: 'js-only',
      thumbnailPath: 'resources/image/webworkerumd.png',
      sourcePath: 'loading/webworker-umd/WebWorkerDemo.js',
      tags: ['umd', 'web worker', 'layout'],
      keywords: [
        'v2.4.0.0',
        'threads',
        'threading',
        'background',
        'json',
        'folding',
        'hierarchic',
        'non-symbolic',
        'umd'
      ]
    },
    {
      id: 'webpack',
      name: 'webpack',
      demoPath: 'loading/webpack/README.html',
      summary:
        'Shows how to integrate the yFiles library in a <a href="https://webpack.js.org" target="_blank">webpack</a> project using ES modules.',
      category: 'loading',
      type: 'integration',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/webpack.png',
      sourcePath: 'loading/webpack/src/webpack-demo.ts',
      tags: ['nodejs', 'npm', 'es modules', 'deployment', 'layout'],
      keywords: ['organic']
    },
    {
      id: 'webpack-lazy-yfiles',
      name: 'Webpack Lazy Load yFiles',
      demoPath: 'loading/webpack-lazy-yfiles/README.html',
      summary:
        'Shows how to lazily load yFiles in a <a href="https://webpack.js.org/" target="_blank">webpack</a> project with dynamic imports.',
      category: 'loading',
      type: 'integration',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/webpack.png',
      sourcePath: 'loading/webpack-lazy-yfiles/src/webpack-demo.ts',
      tags: ['es modules', 'deployment'],
      keywords: ['v2.3.0.0', 'hierarchic', 'dynamic imports']
    },
    {
      id: 'webpack-lazy-layout',
      name: 'Webpack Lazy Load Layout',
      demoPath: 'loading/webpack-lazy-layout/README.html',
      summary:
        'Shows how to lazily load selected yFiles modules in a <a href="https://webpack.js.org" target="_blank">webpack</a> project with dynamic imports.',
      category: 'loading',
      type: 'integration',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/webpack.png',
      sourcePath: 'loading/webpack-lazy-layout/src/webpack-demo.ts',
      tags: ['es modules', 'deployment'],
      keywords: ['v2.3.0.0', 'hierarchic', 'dynamic imports']
    },
    {
      id: 'vite',
      name: 'Vite',
      demoPath: 'loading/vite/README.html',
      summary:
        'Shows how to integrate the yFiles library in a <a href="https://vitejs.dev/" target="_blank">Vite</a> project.',
      category: 'loading',
      type: 'integration',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/vite.png',
      sourcePath: 'loading/vite/src/main.ts',
      tags: ['es modules', 'deployment', 'web worker'],
      keywords: ['v2.4.0.4', 'webworker']
    },
    {
      id: 'parcel',
      name: 'Parcel',
      demoPath: 'loading/parcel/README.html',
      summary:
        'Shows how to integrate the yFiles library in a <a href="https://parceljs.org/" target="_blank">Parcel</a> project.',
      category: 'loading',
      type: 'integration',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/parcel.png',
      sourcePath: 'loading/parcel/src/ParcelDemo.ts',
      tags: ['es modules', 'parcel', 'web worker'],
      keywords: ['v2.5.0.3', 'webworker', 'deployment']
    },
    {
      id: 'web-dev-server',
      name: 'Web Dev Server',
      demoPath: 'loading/web-dev-server/README.html',
      summary:
        'Shows how to integrate the yFiles library in a <a href="https://modern-web.dev/docs/dev-server/overview/" target="_blank">Web Dev Server</a> project.',
      category: 'loading',
      type: 'integration',
      languageType: 'js-only',
      thumbnailPath: 'resources/image/web-dev-server.png',
      sourcePath: 'loading/web-dev-server/src/index.js',
      tags: ['es modules', 'deployment'],
      keywords: ['v2.4.0.4']
    },
    {
      id: 'webdriverio',
      name: 'WebdriverIO',
      demoPath: 'testing/wdio/README.html',
      summary: 'Shows how to test a yFiles for HTML app in multiple browsers using WebdriverIO.',
      category: 'testing',
      type: 'integration',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/wdio.png',
      sourcePath: 'testing/wdio/WdioDemo.js',
      tags: ['testing', 'wdio', 'selenium'],
      keywords: ['v2.6.0.0', 'integration', 'web driver', 'end-to-end', 'e2e']
    },
    {
      id: 'cypress',
      name: 'Cypress',
      demoPath: 'testing/cypress/README.html',
      summary: 'Shows how to test a yFiles for HTML app using Cypress.',
      category: 'testing',
      type: 'integration',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/cypress.png',
      sourcePath: 'testing/cypress/cypress/e2e/yfiles.cy.ts',
      tags: ['testing', 'cypress'],
      keywords: ['v2.6.0.0', 'integration', 'end-to-end']
    },
    {
      id: 'jest',
      name: 'Jest',
      demoPath: 'testing/jest/README.html',
      summary: 'Shows how to test a yFiles for HTML app using Jest.',
      category: 'testing',
      type: 'integration',
      languageType: 'js-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/jest.png',
      sourcePath: 'testing/jest/src/JestDemo.js',
      tags: ['testing', 'jest'],
      keywords: ['v2.6.0.0', 'unit', 'tests']
    },
    {
      id: 'jest-puppeteer',
      name: 'Jest Puppeteer',
      demoPath: 'testing/jest-puppeteer/README.html',
      summary: 'Shows how to test a yFiles for HTML app using Jest with the Puppeteer environment.',
      category: 'testing',
      type: 'integration',
      languageType: 'js-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/jest-puppeteer.png',
      sourcePath: 'testing/jest-puppeteer/integration/app.test.js',
      tags: ['testing', 'jest', 'puppeteer'],
      keywords: ['v2.6.0.0', 'v2.2.0.2', 'integration', 'end-to-end']
    },
    {
      id: 'vitest',
      name: 'Vitest',
      demoPath: 'testing/vitest/README.html',
      summary: 'Shows how to test a yFiles for HTML app using Vitest.',
      category: 'testing',
      type: 'integration',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/vitest.png',
      sourcePath: 'testing/vitest/test/yfiles.test.ts',
      tags: ['testing', 'vitest'],
      keywords: ['v2.6.0.0', 'integration', 'end-to-end']
    },
    {
      id: 'playwright',
      name: 'Playwright',
      demoPath: 'testing/playwright/README.html',
      summary: 'Shows how to test a yFiles for HTML app using Playwright.',
      category: 'testing',
      type: 'integration',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/playwright.png',
      sourcePath: 'testing/playwright/tests/yfiles.spec.ts',
      tags: ['testing', 'playwright'],
      keywords: ['v2.6.0.0', 'integration', 'end-to-end']
    },
    {
      id: 'selenium-webdriver',
      name: 'Selenium WebDriver',
      demoPath: 'testing/selenium-webdriver/README.html',
      summary: 'Shows how to test a yFiles for HTML app using Selenium WebDriver.',
      category: 'testing',
      type: 'integration',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/selenium-webdriver.png',
      sourcePath: 'testing/selenium-webdriver/tests/yfiles.test.js',
      tags: ['testing', 'selenium', 'webdriver'],
      keywords: ['v2.6.0.0', 'integration', 'end-to-end']
    },
    {
      id: 'clipboard',
      name: 'Clipboard',
      demoPath: 'view/clipboard/index.html',
      summary:
        'Shows different ways of using the class GraphClipboard for Copy & Paste operations.',
      category: 'view',
      type: 'source-code',
      thumbnailPath: 'resources/image/clipboard.png',
      sourcePath: 'view/clipboard/ClipboardDemo.js',
      tags: ['interaction', 'copy', 'paste'],
      keywords: ['labels']
    },
    {
      id: 'clipboard-deferred-cut',
      name: 'Deferred Cut Clipboard',
      demoPath: 'view/clipboard-deferred-cut/index.html',
      summary:
        'Shows a clipboard which grays elements out upon cut and only removes them when they are finally pasted.',
      category: 'view',
      type: 'source-code',
      thumbnailPath: 'resources/image/clipboarddeferredcut.png',
      sourcePath: 'view/clipboard-deferred-cut/DeferredCutClipboardDemo.js',
      tags: ['interaction', 'copy', 'paste'],
      keywords: ['v2.4.0.4', 'labels']
    },
    {
      id: 'node-selection-resizing',
      name: 'Node Selection Resizing',
      demoPath: 'input/nodeselectionresizing/index.html',
      summary: 'Shows how to reshape a selection of nodes as one unit.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/nodeselectionresizing.png',
      sourcePath: 'input/nodeselectionresizing/NodeSelectionResizingDemo.js',
      tags: ['interaction', 'resizing'],
      keywords: ['v2.3.0.0', 'input mode', 'scale']
    },
    {
      id: 'custom-label-model',
      name: 'Custom Label Model',
      demoPath: 'input/customlabelmodel/index.html',
      summary: 'Shows how to implement and use a custom label model.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/custom_label_model.png',
      sourcePath: 'input/customlabelmodel/CustomLabelModelDemo.js',
      tags: ['interaction', 'label'],
      keywords: ['placements']
    },
    {
      id: 'graphml',
      name: 'GraphML',
      demoPath: 'view/graphml/index.html',
      summary: "Provides a live view of the graph's GraphML representation.",
      category: 'view',
      type: 'source-code',
      thumbnailPath: 'resources/image/graphml.png',
      sourcePath: 'view/graphml/GraphMLDemo.js',
      tags: ['graphml', 'i/o'],
      keywords: [
        'load',
        'save',
        'io',
        'data panel',
        'groups',
        'folding',
        'labels',
        'curves',
        'bezier'
      ]
    },
    {
      id: 'custom-port-location-model',
      name: 'Custom Port Location Model',
      demoPath: 'input/customportmodel/index.html',
      summary: 'Shows how to implement and use a custom port location model.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/custom_port_model.png',
      sourcePath: 'input/customportmodel/CustomPortModelDemo.js',
      tags: ['interaction', 'port'],
      keywords: ['port candidate providers', 'placements']
    },
    {
      id: 'custom-snapping',
      name: 'Custom Snapping',
      demoPath: 'input/customsnapping/index.html',
      summary: 'Shows how the snapping feature can be customized.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/custom-snapping.png',
      sourcePath: 'input/customsnapping/CustomSnappingDemo.js',
      tags: ['interaction', 'snapping'],
      keywords: ['guides', 'lines', 'labels', 'move']
    },
    {
      id: 'drag-from-component',
      name: 'Drag From Component',
      demoPath: 'input/drag-from-component/index.html',
      summary: 'Shows how to drag graph items out of the graph component to another element.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/drag-from-component.png',
      sourcePath: 'input/drag-from-component/DragFromComponentDemo.js',
      tags: ['interaction', 'drag and drop'],
      keywords: ['v2.4.0.4', 'move', 'dnd']
    },
    {
      id: 'context-menu',
      name: 'Context Menu',
      demoPath: 'input/contextmenu/index.html',
      summary:
        'Shows how to add a context menu to the nodes of a graph and to the canvas background.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/contextmenu.png',
      sourcePath: 'input/contextmenu/ContextMenuDemo.js',
      tags: ['interaction'],
      keywords: ['context menu', 'copy']
    },
    {
      id: 'application-features-drag-and-drop',
      name: 'Simple Drag And Drop',
      summary:
        'Shows how to enable dragging nodes from a panel and drop them into the graph component.',
      demoPath: 'application-features/drag-and-drop/index.html',
      thumbnailPath: 'resources/image/tutorial03.png',
      category: 'application-features',
      tags: ['interaction', 'drag and drop'],
      keywords: ['DropInputMode', 'addDragDroppedListener', 'move', 'events', 'input mode', 'dnd'],
      sourcePath: 'application-features/drag-and-drop/SimpleDragAndDropDemo.js'
    },
    {
      id: 'drag-and-drop',
      name: 'Drag and Drop',
      demoPath: 'input/draganddrop/index.html',
      summary: 'Shows drag and drop of nodes, groups and labels.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/draganddrop.png',
      sourcePath: 'input/draganddrop/DragAndDropDemo.js',
      tags: ['interaction', 'drag and drop'],
      keywords: ['palette', 'ports', 'labels', 'groups', 'html5', 'native', 'move', 'dnd']
    },
    {
      id: 'graph-drag-and-drop',
      name: 'Graph Drag and Drop',
      demoPath: 'input/graph-drag-and-drop/index.html',
      summary: 'Shows drag and drop of graphs consisting of multiple items.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/graph-drag-and-drop.png',
      sourcePath: 'input/graph-drag-and-drop/GraphDragAndDropDemo.js',
      tags: ['interaction', 'drag and drop'],
      keywords: ['v2.4.0.4', 'palette', 'graphs', 'groups', 'dnd']
    },
    {
      id: 'custom-drag-and-drop',
      name: 'Custom Drag and Drop',
      demoPath: 'input/custom-drag-and-drop/index.html',
      summary: 'Shows how to change the color of nodes and edges using drag and drop operations.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/color-dnd.png',
      sourcePath: 'input/custom-drag-and-drop/CustomDragAndDropDemo.js',
      tags: ['interaction', 'drag and drop'],
      keywords: ['v2.4.0.4', 'palette', 'colors', 'dnd']
    },
    {
      id: 'edge-reconnection',
      name: 'Edge Reconnection',
      demoPath: 'input/edgereconnection/index.html',
      summary: 'Shows how the reconnection of edge ports can be customized and restricted.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/edgereconnection.png',
      sourcePath: 'input/edgereconnection/EdgeReconnectionPortCandidateProviderDemo.js',
      tags: ['interaction'],
      keywords: ['port candidate providers', 'ports']
    },
    {
      id: 'label-editing',
      name: 'Label Editing',
      demoPath: 'input/labelediting/index.html',
      summary: 'Shows customizations of the interactive label editing.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/label_editing.png',
      sourcePath: 'input/labelediting/LabelEditingDemo.js',
      tags: ['interaction', 'label'],
      keywords: ['texts', 'validation']
    },
    {
      id: 'custom-handle-provider',
      name: 'Custom Handle Provider',
      demoPath: 'input/custom-handle-provider/index.html',
      summary:
        'Shows how to implement custom handles that allow to interactively change the shape of an ArrowNodeStyle.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/custom-handle-provider.png',
      sourcePath: 'input/custom-handle-provider/CustomHandleProviderDemo.js',
      tags: ['interaction', 'style'],
      keywords: ['v2.5.0.0', 'handles', 'arrow', 'shaft', 'IHandleProvider', 'IHandle']
    },
    {
      id: 'label-handle-provider',
      name: 'Label Handle Provider',
      demoPath: 'input/labelhandleprovider/index.html',
      summary:
        'Shows how to implement custom handles that allow interactive resizing and rotation of labels.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/LabelHandleProvider.png',
      sourcePath: 'input/labelhandleprovider/LabelHandleProviderDemo.js',
      tags: ['interaction', 'label'],
      keywords: ['handles']
    },
    {
      id: 'move-unselected-nodes',
      name: 'Move Unselected Nodes',
      demoPath: 'input/moveunselectednodes/index.html',
      summary:
        'Shows a special input mode that allows you to move nodes without selecting them first.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/move_unselected_nodes.png',
      sourcePath: 'input/moveunselectednodes/MoveUnselectedNodesDemo.js',
      tags: ['interaction', 'selection'],
      keywords: ['input mode', 'move']
    },
    {
      id: 'orthogonal-edge-editing-customization',
      name: 'Orthogonal Edge Editing Customization',
      demoPath: 'input/orthogonal-edge-editing-customization/index.html',
      summary: 'Shows how to customize orthogonal edge editing.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/orthogonal-edges.png',
      sourcePath:
        'input/orthogonal-edge-editing-customization/OrthogonalEdgeEditingCustomizationDemo.js',
      tags: ['interaction'],
      keywords: ['orthogonal edges', 'move']
    },
    {
      id: 'port-candidate-provider',
      name: 'Port Candidate Provider',
      demoPath: 'input/portcandidateprovider/index.html',
      summary: 'Shows how edge creation can be customized.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/portcandidateprovider.png',
      sourcePath: 'input/portcandidateprovider/PortCandidateProviderDemo.js',
      tags: ['interaction', 'port'],
      keywords: ['port candidate providers']
    },
    {
      id: 'position-handler',
      name: 'Position Handler',
      demoPath: 'input/positionhandler/index.html',
      summary: 'Shows how to customize and restrict the movement behavior of nodes.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/position-handler.png',
      sourcePath: 'input/positionhandler/PositionHandlerDemo.js',
      tags: ['interaction'],
      keywords: ['position handlers', 'move']
    },
    {
      id: 'reparent-handler',
      name: 'Reparent Handler',
      demoPath: 'input/reparenthandler/index.html',
      summary: 'Shows how reparenting of nodes can be customized.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/reparenthandler.png',
      sourcePath: 'input/reparenthandler/ReparentHandlerDemo.js',
      tags: ['interaction', 'grouping'],
      keywords: ['re-parent handlers']
    },
    {
      id: 'reshape-handle-provider-configuration',
      name: 'Reshape Handle Provider Configuration',
      demoPath: 'input/reshapehandleconfiguration/index.html',
      summary: 'Shows how resizing of nodes can be customized.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/reshape-handle.png',
      sourcePath: 'input/reshapehandleconfiguration/ReshapeHandleProviderConfigurationDemo.js',
      tags: ['interaction', 'resizing'],
      keywords: ['v2.3.0.0', 'handles', 'reshape', 'size', 'scale']
    },
    {
      id: 'reshape-handle-provider',
      name: 'Reshape Handle Provider',
      demoPath: 'input/reshapehandleprovider/index.html',
      summary: 'Shows how to add resize handles to ports.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/reshape-port-handle.png',
      sourcePath: 'input/reshapehandleprovider/ReshapeHandleProviderDemo.js',
      tags: ['interaction', 'resizing', 'port'],
      keywords: ['v2.3.0.0', 'handles', 'reshape', 'size', 'scale']
    },
    {
      id: 'restricted-editing',
      name: 'Restricted Editing',
      demoPath: 'input/restricted-editing/index.html',
      summary: 'Shows how to restrict interactive editing with GraphEditorInputMode.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/restricted-editing.png',
      sourcePath: 'input/restricted-editing/RestrictedEditingDemo.js',
      tags: ['interaction'],
      keywords: ['v2.4.0.4', 'editing', 'viewing']
    },
    {
      id: 'lasso-selection',
      name: 'Lasso Selection',
      demoPath: 'input/lassoselection/index.html',
      summary: 'Shows how to configure a lasso tool for freeform selection.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/lassoselection.png',
      sourcePath: 'input/lassoselection/LassoSelectionDemo.js',
      tags: ['interaction', 'selection'],
      keywords: ['v2.1.0.2', 'testable', 'free']
    },
    {
      id: 'marquee-node-creation',
      name: 'Marquee Node Creation',
      demoPath: 'input/marquee-node-creation/index.html',
      summary: 'Shows how to customize the MarqueeSelectionInputMode class to create new nodes.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/marquee-node-creation.png',
      sourcePath: 'input/marquee-node-creation/MarqueeNodeCreationDemo.js',
      tags: ['interaction'],
      keywords: ['v2.4.0.4', 'marquee', 'selection', 'creation', 'creating']
    },
    {
      id: 'single-selection',
      name: 'Single Selection',
      demoPath: 'input/singleselection/index.html',
      summary: 'Shows how to configure GraphEditorInputMode for single selection mode.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/singleselection.png',
      sourcePath: 'input/singleselection/SingleSelectionDemo.js',
      tags: ['interaction', 'selection'],
      keywords: ['single selection']
    },
    {
      id: 'size-constraint-provider',
      name: 'Size Constraint Provider',
      demoPath: 'input/sizeconstraintprovider/index.html',
      summary: 'Shows how resizing of nodes can be restricted.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/size-constraint.png',
      sourcePath: 'input/sizeconstraintprovider/SizeConstraintProviderDemo.js',
      tags: ['interaction'],
      keywords: ['size constraint providers', 'handles']
    },
    {
      id: 'button-input-mode',
      name: 'Button Input Mode',
      demoPath: 'input/button-input-mode/index.html',
      summary: 'Shows how to use a custom input mode adding temporary buttons for model items.',
      category: 'input',
      type: 'source-code',
      thumbnailPath: 'resources/image/button-input-mode.png',
      sourcePath: 'input/button-input-mode/ButtonInputModeDemo.js',
      tags: ['interaction'],
      keywords: ['v2.4.0.4', 'buttons', 'input mode']
    },
    {
      id: 'without-view',
      name: 'Layout Without View',
      sourcePath: 'layout/without-view/LayoutWithoutViewDemo.js',
      demoPath: 'layout/without-view/index.html',
      summary:
        'Shows how to use the graph analysis and layout algorithms without a view and without the IGraph API',
      category: 'layout',
      type: 'source-code',
      packageType: 'no-viewer',
      thumbnailPath: 'resources/image/without-view.png',
      tags: ['headless', 'layout', 'analysis'],
      keywords: ['v2.3.0.1', 'invisible', 'background', 'memory', 'centrality', 'hierarchic']
    },
    {
      id: 'application-features-background-image',
      name: 'Background Image',
      summary: 'Shows how to add a background visualizations to a graph component.',
      demoPath: 'application-features/background-image/index.html',
      thumbnailPath: 'resources/image/tutorial3step2.png',
      category: 'application-features',
      tags: ['background', 'icon'],
      keywords: ['v2.2.0.0', 'ICanvasObjectGroup', 'backgroundGroup'],
      sourcePath: 'application-features/background-image/BackgroundImageDemo.js'
    },
    {
      id: 'application-features-building-graph-from-data',
      name: 'Building Graphs From Data',
      summary: 'Shows how to build a graph from data in JSON format.',
      demoPath: 'application-features/building-graph-from-data/index.html',
      thumbnailPath: 'resources/image/tutorial3step3.png',
      category: 'application-features',
      tags: ['json', 'i/o'],
      keywords: ['read', 'write', 'input', 'files', 'data base'],
      sourcePath: 'application-features/building-graph-from-data/BuildingGraphFromDataDemo.js'
    },
    {
      id: 'application-features-building-swimlanes-from-data',
      name: 'Building Swimlanes From Data',
      summary: 'Shows how to build a graph with swimlanes from data in JSON format.',
      demoPath: 'application-features/building-swimlanes-from-data/index.html',
      thumbnailPath: 'resources/image/tutorial3step4.png',
      category: 'application-features',
      packageType: 'needs-layout',
      tags: ['json', 'i/o', 'table'],
      keywords: ['read', 'write', 'input', 'files', 'data base'],
      sourcePath:
        'application-features/building-swimlanes-from-data/BuildingSwimlanesFromDataDemo.js'
    },
    {
      id: 'application-features-external-links',
      name: 'External Links',
      summary: 'Shows how to add labels that act like external links and open in a new window.',
      demoPath: 'application-features/external-links/index.html',
      thumbnailPath: 'resources/image/tutorial3step8.png',
      category: 'application-features',
      tags: ['interaction'],
      keywords: ['ItemHoverInputMode', 'control', 'events', 'input mode'],
      sourcePath: 'application-features/external-links/ExternalLinksDemo.js'
    },
    {
      id: 'application-features-filtering',
      name: 'Filtering',
      summary: 'Shows how to configure graph filtering.',
      demoPath: 'application-features/filtering/index.html',
      thumbnailPath: 'resources/image/tutorial3step9.png',
      category: 'application-features',
      tags: ['filtering', 'grouping'],
      keywords: ['v2.2.0.0', 'FilteredGraphWrapper', 'subset', 'predicates', 'hide', 'hiding'],
      sourcePath: 'application-features/filtering/FilteringDemo.js'
    },
    {
      id: 'application-features-filtering-with-folding',
      name: 'Filtering With Folding',
      summary: 'Shows how to configure filtering and folding in the same application.',
      demoPath: 'application-features/filtering-with-folding/index.html',
      thumbnailPath: 'resources/image/tutorial3step10.png',
      category: 'application-features',
      tags: ['filtering', 'grouping'],
      keywords: [
        'v2.2.0.0',
        'FilteredGraphWrapper',
        'subset',
        'folder',
        'folding',
        'predicate',
        'masterGraph',
        'wrappedGraph',
        'FoldingManager',
        'nesting',
        'folded',
        'hide'
      ],
      sourcePath: 'application-features/filtering-with-folding/FilteringWithFoldingDemo.js'
    },
    {
      id: 'application-features-folding',
      name: 'Folding',
      summary: 'Shows how to enable collapsing and expanding of group nodes.',
      demoPath: 'application-features/folding/index.html',
      thumbnailPath: 'resources/image/tutorial3step11.png',
      category: 'application-features',
      tags: ['folding', 'grouping'],
      keywords: [
        'v2.2.0.0',
        'masterGraph',
        'wrappedGraph',
        'FoldingManager',
        'expand',
        'nesting',
        'hide',
        'collapse'
      ],
      sourcePath: 'application-features/folding/FoldingDemo.js'
    },
    {
      id: 'application-features-graph-copy',
      name: 'Graph Copy',
      summary: 'Shows how to copy a graph or parts of a graph.',
      demoPath: 'application-features/graph-copy/index.html',
      thumbnailPath: 'resources/image/tutorial3graphcopy.png',
      category: 'application-features',
      tags: ['clipboard'],
      keywords: ['v2.2.0.0', 'GraphCopier', 'copy', 'cut', 'paste'],
      sourcePath: 'application-features/graph-copy/GraphCopyDemo.js'
    },
    {
      id: 'application-features-graph-decorator',
      name: 'Graph Decorator',
      summary: 'Shows how to decorate graph items to change their behavior or visualization.',
      demoPath: 'application-features/graph-decorator/index.html',
      thumbnailPath: 'resources/image/demo-graph-decorator.png',
      category: 'application-features',
      tags: ['interaction'],
      keywords: [
        'v2.2.0.2',
        'GraphDecorator',
        'NodeDecorator',
        'ILookupDecorator',
        'ports',
        'IPortCandidate',
        'port candidate providers'
      ],
      sourcePath: 'application-features/graph-decorator/GraphDecoratorDemo.js'
    },
    {
      id: 'application-features-simple-highlight',
      name: 'Simple Highlight Decorator',
      summary: 'Shows how to highlight nodes and edges when the mouse hovers over them.',
      demoPath: 'application-features/simple-highlight-decorator/index.html',
      thumbnailPath: 'resources/image/highlight-decorator.png',
      category: 'application-features',
      tags: ['highlight', 'hover', 'interaction'],
      keywords: ['v2.4.0.2', 'GraphDecorator', 'NodeDecorator', 'HighlightDecorator'],
      sourcePath: 'application-features/simple-highlight-decorator/SimpleHighlightDecoratorDemo.js'
    },
    {
      id: 'application-features-complex-highlight',
      name: 'Complex Highlight Decorator',
      summary:
        'Shows how to highlight nodes with different effects based on data stored in their tags.',
      demoPath: 'application-features/complex-highlight-decorator/index.html',
      thumbnailPath: 'resources/image/complex-highlight-decorator.png',
      category: 'application-features',
      tags: ['highlight', 'hover', 'interaction'],
      keywords: [
        'v2.4.0.2',
        'GraphDecorator',
        'NodeDecorator',
        'HighlightDecorator',
        'HighlightIndicatorManager'
      ],
      sourcePath:
        'application-features/complex-highlight-decorator/ComplexHighlightDecoratorDemo.js'
    },
    {
      id: 'application-features-graph-search',
      name: 'Graph Search',
      summary: 'Shows how to search for specific nodes in a graph.',
      demoPath: 'application-features/graph-search/index.html',
      thumbnailPath: 'resources/image/tutorial3step12.png',
      category: 'application-features',
      tags: ['highlight'],
      keywords: ['v2.2.0.0', 'query', 'queries', 'match', 'matches', 'find'],
      sourcePath: 'application-features/graph-search/GraphSearchDemo.js'
    },
    {
      id: 'application-features-grid-snapping',
      name: 'Grid Snapping',
      summary: 'Shows how to enable grid snapping during interactive changes.',
      demoPath: 'application-features/grid-snapping/index.html',
      thumbnailPath: 'resources/image/tutorial3step13.png',
      category: 'application-features',
      tags: ['grid', 'interaction', 'snapping'],
      keywords: [
        'GraphSnapContext',
        'LabelSnapContext',
        'GridSnapTypes',
        'GridVisualCreator',
        'align',
        'visuals',
        'interactive'
      ],
      sourcePath: 'application-features/grid-snapping/GridSnappingDemo.js'
    },
    {
      id: 'application-features-input-output',
      name: 'Save and Load GraphML',
      summary: 'Shows how to use GraphML input and output.',
      demoPath: 'application-features/input-output/index.html',
      thumbnailPath: 'resources/image/tutorial3input-output.png',
      category: 'application-features',
      tags: ['graphml', 'i/o'],
      keywords: ['GraphMLSupport', 'read', 'write', 'files', 'io'],
      sourcePath: 'application-features/input-output/InputOutputDemo.js'
    },
    {
      id: 'application-features-custom-graphml',
      name: 'Custom Data in GraphML',
      summary: 'Shows how to read and write additional data from and to GraphML.',
      demoPath: 'application-features/custom-graphml/index.html',
      thumbnailPath: 'resources/image/tutorial3custom-graphml.png',
      category: 'application-features',
      tags: ['graphml', 'i/o'],
      keywords: [
        'IMapper',
        'mapperRegistry',
        'GraphMLIOHandler',
        'data',
        'json',
        'read',
        'write',
        'files',
        'io'
      ],
      sourcePath: 'application-features/custom-graphml/CustomGraphMLDemo.js'
    },
    {
      id: 'application-features-label-text-wrapping',
      name: 'Label Text Wrapping',
      summary: 'Shows how to enable label text wrapping and trimming.',
      demoPath: 'application-features/label-text-wrapping/index.html',
      thumbnailPath: 'resources/image/tutorial3step15.png',
      category: 'application-features',
      tags: ['label'],
      keywords: [
        'v2.3.0.0',
        'TextWrapping',
        'linebreaks',
        'rtl',
        'characters',
        'words',
        'right-to-left',
        'ellipsis',
        'webgl'
      ],
      sourcePath: 'application-features/label-text-wrapping/LabelTextWrappingDemo.js'
    },
    {
      id: 'application-features-native-listeners',
      name: 'Native Listeners',
      summary: 'Illustrates how to register native event listeners to a SVG elements of a style.',
      demoPath: 'application-features/native-listeners/index.html',
      thumbnailPath: 'resources/image/tutorial3step17.png',
      category: 'application-features',
      tags: ['interaction', 'style'],
      keywords: ['NodeDecorator', 'ILookupDecorator', 'NodeStyleBase', 'events', 'decorator'],
      sourcePath: 'application-features/native-listeners/NativeListenersDemo.js'
    },
    {
      id: 'application-features-orthogonal-edge-editing',
      name: 'Orthogonal Edge Editing',
      summary: 'Shows how to enable interactive orthogonal edge editing.',
      demoPath: 'application-features/orthogonal-edges/index.html',
      thumbnailPath: 'resources/image/tutorial3step18.png',
      category: 'application-features',
      tags: ['edge creation', 'bends'],
      keywords: ['OrthogonalEdgeEditingContext', 'OrthogonalEdgeEditingPolicy'],
      sourcePath: 'application-features/orthogonal-edges/OrthogonalEdgesDemo.js'
    },
    {
      id: 'application-features-rectangular-indicator',
      name: 'Rectangular Indicator',
      summary: 'Shows how to add an interactive rectangular indicator to the graph component.',
      demoPath: 'application-features/rectangular-indicator/index.html',
      thumbnailPath: 'resources/image/tutorial3step19.png',
      category: 'application-features',
      tags: ['interaction', 'selection'],
      keywords: [
        'v2.2.0.0',
        'PositionHandler',
        'RectangleIndicatorInstaller',
        'RectangleHandle',
        'handles'
      ],
      sourcePath: 'application-features/rectangular-indicator/RectangularIndicatorDemo.js'
    },
    {
      id: 'application-features-smart-click-navigation',
      name: 'Smart Click Navigation',
      demoPath: 'application-features/smart-click-navigation/index.html',
      summary: 'Shows the how to scroll and zoom to the area of interest by single edge-clicks.',
      category: 'application-features',
      thumbnailPath: 'resources/image/navigation.png',
      tags: ['exploration'],
      keywords: ['v2.2.0.0', 'navigation', 'zoom', 'move', 'interaction'],
      sourcePath: 'application-features/smart-click-navigation/SmartClickNavigationDemo.js'
    },
    {
      id: 'application-features-snapping',
      name: 'Snapping',
      summary: 'Shows how to enable snapping (guide lines) for interactive changes.',
      demoPath: 'application-features/snapping/index.html',
      thumbnailPath: 'resources/image/tutorial3snapping.png',
      category: 'application-features',
      tags: ['interaction', 'snapping'],
      keywords: ['move', 'resize', 'resizing'],
      sourcePath: 'application-features/snapping/SnappingDemo.js'
    },
    {
      id: 'application-features-application-features-subdivide-edges',
      name: 'Subdivide Edges',
      summary: 'Shows how to subdivide an edge when a node is dragged on it.',
      demoPath: 'application-features/subdivide-edges/index.html',
      thumbnailPath: 'resources/image/tutorial3subdivision.png',
      category: 'application-features',
      tags: ['interaction', 'drag and drop'],
      keywords: [
        'v2.5.0.3',
        'drop input mode',
        'create',
        'subdivide',
        'split',
        'drag and drop',
        'dnd',
        'insert',
        'divide'
      ],
      sourcePath: 'application-features/subdivide-edges/SubdivideEdgesDemo.js'
    },
    {
      id: 'application-features-theming',
      name: 'Theming',
      summary: 'Shows how to use a theme to change the look-and-feel of an application.',
      demoPath: 'application-features/theming/index.html',
      thumbnailPath: 'resources/image/tutorial3theming.png',
      category: 'application-features',
      tags: ['interaction', 'theme'],
      keywords: ['dark mode', 'light mode', 'colors', 'theming', 'v2.5.0.0'],
      sourcePath: 'application-features/theming/ThemingDemo.js'
    },
    {
      id: 'application-features-tooltips',
      name: 'Tooltips',
      summary: 'Shows how to enable tooltips for graph items.',
      demoPath: 'application-features/tooltips/index.html',
      thumbnailPath: 'resources/image/tutorial3step21.png',
      category: 'application-features',
      tags: ['hover', 'interaction'],
      keywords: ['mouseHoverInputMode', 'addQueryItemToolTipListener', 'events', 'data', 'json'],
      sourcePath: 'application-features/tooltips/TooltipsDemo.js'
    },
    {
      id: 'application-features-accessibility',
      name: 'Accessibility',
      summary: 'Shows how to use the aria-live region to update screen readers.',
      demoPath: 'application-features/accessibility/index.html',
      thumbnailPath: 'resources/image/tutorial3accessibility.png',
      category: 'application-features',
      tags: ['accessibility', 'aria'],
      keywords: ['v2.3.0.0', 'tool tips', 'live', 'region', 'screen reader'],
      sourcePath: 'application-features/accessibility/AccessibilityDemo.js'
    },
    {
      id: 'application-features-webgl-rendering',
      name: 'WebGL2 Rendering',
      summary: 'Shows how to enable the WebGL2 rendering mode.',
      demoPath: 'application-features/webgl-rendering/index.html',
      thumbnailPath: 'resources/image/feature-webgl-rendering.png',
      category: 'application-features',
      tags: ['webgl2', 'performance'],
      keywords: ['v2.4.0.0', 'large', 'performance', 'styles', 'fast'],
      sourcePath: 'application-features/webgl-rendering/WebGLRenderingDemo.js'
    },
    {
      id: 'application-features-overview',
      name: 'Overview Component',
      summary: 'Shows how to add an overview component to the application.',
      demoPath: 'application-features/overview/index.html',
      thumbnailPath: 'resources/image/feature-overview-component.png',
      category: 'application-features',
      tags: ['interaction'],
      keywords: ['v2.4.0.4', 'overview', 'navigation', 'zoom'],
      sourcePath: 'application-features/overview/OverviewComponentDemo.js'
    },
    {
      id: 'layout-features-hierarchic',
      name: 'Hierarchic Layout',
      summary: 'Shows common configuration options for hierarchical layout.',
      demoPath: 'layout-features/hierarchic/index.html',
      thumbnailPath: 'resources/image/tutorial4hierarchic.png',
      category: 'layout-features',
      tags: ['hierarchic'],
      keywords: [
        'v2.4.0.4',
        'layout',
        'orthogonal',
        'octilinear',
        'port-constraints',
        'critical-path'
      ],
      sourcePath: 'layout-features/hierarchic/SampleApplication.js'
    },
    {
      id: 'layout-features-hierarchic-incremental',
      name: 'Incremental Hierarchic Layout',
      summary: 'Shows how to run the hierarchical layout on a predefined set of nodes.',
      demoPath: 'layout-features/hierarchic-incremental/index.html',
      thumbnailPath: 'resources/image/tutorial4-hierarchic-incremental.png',
      category: 'layout-features',
      tags: ['hierarchic', 'incremental'],
      keywords: ['v2.4.0.4', 'layout', 'subset', 'layout', 'nodes', 'set', 'node-set'],
      sourcePath: 'layout-features/hierarchic-incremental/SampleApplication.js'
    },
    {
      id: 'layout-features-portcandidateset',
      name: 'Hierarchic Layout with PortCandidateSet',
      summary: 'Shows how to use a PortCandidateSet with hierarchical layout.',
      demoPath: 'layout-features/hierarchic-portcandidate-set/index.html',
      thumbnailPath: 'resources/image/tutorial4hierarchicportcandidateset.png',
      category: 'layout-features',
      tags: ['hierarchic', 'ports'],
      keywords: ['v2.4.0.4', 'layout', 'ports', 'candidates', 'portcandidateset'],
      sourcePath: 'layout-features/hierarchic-portcandidate-set/SampleApplication.js'
    },
    {
      id: 'layout-features-hierarchic-edge-grouping',
      name: 'Hierarchic Layout with Edge Grouping',
      summary: 'Shows how to configure edge grouping for hierarchical layout.',
      demoPath: 'layout-features/hierarchic-edge-grouping/index.html',
      thumbnailPath: 'resources/image/tutorial4hierarchicedgegrouping.png',
      category: 'layout-features',
      tags: ['hierarchic', 'edgegroups'],
      keywords: ['v2.4.0.4', 'layout', 'groups'],
      sourcePath: 'layout-features/hierarchic-edge-grouping/SampleApplication.js'
    },
    {
      id: 'layout-features-hierarchic-with-given-layering',
      name: 'Hierarchic Layout with Given Layering',
      summary: 'Shows how to configure hierarchical layout with a given layering.',
      demoPath: 'layout-features/hierarchic-given-layering/index.html',
      thumbnailPath: 'resources/image/tutorial4hierarchicgivenlayering.png',
      category: 'layout-features',
      tags: ['hierarchic', 'given', 'layers'],
      keywords: ['v2.4.0.4', 'layout', 'hierarchic', 'given', 'layering', 'layers'],
      sourcePath: 'layout-features/hierarchic-given-layering/SampleApplication.js'
    },
    {
      id: 'layout-features-constraints',
      name: 'Hierarchic Layout with Constraints',
      summary:
        'Shows how to use constraints to control layering and sequencing in the hierarchical layout.',
      demoPath: 'layout-features/hierarchic-constraints/index.html',
      thumbnailPath: 'resources/image/tutorial4hierarchicconstraints.png',
      category: 'layout-features',
      tags: ['hierarchic', 'constraints'],
      keywords: ['v2.4.0.4', 'layout'],
      sourcePath: 'layout-features/hierarchic-constraints/SampleApplication.js'
    },
    {
      id: 'layout-features-sequence-constraints',
      name: 'Hierarchic Layout with Sequence Constraints',
      summary: 'Shows how to use constraints to control sequencing in hierarchical layout.',
      demoPath: 'layout-features/hierarchic-sequence-constraints/index.html',
      thumbnailPath: 'resources/image/tutorial4hierarchicsequenceconstraints.png',
      category: 'layout-features',
      tags: ['hierarchic', 'constraints'],
      keywords: ['v2.4.0.4', 'layout', 'sequencing'],
      sourcePath: 'layout-features/hierarchic-sequence-constraints/SampleApplication.js'
    },
    {
      id: 'layout-features-layer-constraints',
      name: 'Hierarchic Layout with Layer Constraints',
      summary: 'Shows how to use constraints to control layering in hierarchical layout.',
      demoPath: 'layout-features/hierarchic-layer-constraints/index.html',
      thumbnailPath: 'resources/image/tutorial4hierarchiclayerconstraints.png',
      category: 'layout-features',
      tags: ['hierarchic', 'constraints'],
      keywords: ['v2.4.0.4', 'layout', 'layering'],
      sourcePath: 'layout-features/hierarchic-layer-constraints/SampleApplication.js'
    },
    {
      id: 'layout-features-hierarchic-node-alignment',
      name: 'Hierarchic Layout with Node Alignment',
      summary: 'Shows how to align a set of nodes with hierarchical layout.',
      demoPath: 'layout-features/hierarchic-node-alignment/index.html',
      thumbnailPath: 'resources/image/tutorial4hierarchicverticalnodealignment.png',
      category: 'layout-features',
      tags: ['hierarchic', 'alignment'],
      keywords: ['v2.4.0.4', 'layout', 'alignment', 'critical', 'paths'],
      sourcePath: 'layout-features/hierarchic-node-alignment/SampleApplication.js'
    },
    {
      id: 'layout-features-hierarchic-edge-labeling',
      name: 'Hierarchic Layout with Edge Labeling',
      summary: 'Shows how to configure automatic label placement of hierarchical layout.',
      demoPath: 'layout-features/hierarchic-edge-labeling/index.html',
      thumbnailPath: 'resources/image/tutorial4hierarchicedgelabeling.png',
      category: 'layout-features',
      tags: ['hierarchic', 'labeling'],
      keywords: ['v2.4.0.4', 'layout', 'integrated-labeling', 'label-placement', 'auto-flipping'],
      sourcePath: 'layout-features/hierarchic-edge-labeling/SampleApplication.js'
    },
    {
      id: 'layout-features-hierarchic-compact-groups',
      name: 'Compact Groups in Hierarchic Layout',
      summary:
        'Shows how to configure the hierarchical layout such that it yields maximally compact group nodes.',
      demoPath: 'layout-features/hierarchic-compact-groups/index.html',
      thumbnailPath: 'resources/image/tutorial4hierarchiccompactgroups.png',
      category: 'layout-features',
      tags: ['hierarchic', 'compaction'],
      keywords: [
        'v2.4.0.4',
        'layout',
        'recursive layering',
        'SimplexNodePlacer',
        'bendReduction',
        'groupCompactionStrategy',
        'groupCompactionPolicy'
      ],
      sourcePath: 'layout-features/hierarchic-compact-groups/SampleApplication.js'
    },
    {
      id: 'layout-features-organic',
      name: 'Organic Layout',
      summary: 'Shows common configuration options for organic layout.',
      demoPath: 'layout-features/organic/index.html',
      thumbnailPath: 'resources/image/tutorial4organic.png',
      category: 'layout-features',
      tags: ['organic'],
      keywords: ['v2.4.0.4', 'layout', 'graph shape', 'compactness', 'node distance', 'simple'],
      sourcePath: 'layout-features/organic/SampleApplication.js'
    },
    {
      id: 'layout-features-organic-incremental',
      name: 'Incremental Organic Layout',
      summary: 'Shows how to run the organic layout on a predefined set of nodes.',
      demoPath: 'layout-features/organic-incremental/index.html',
      thumbnailPath: 'resources/image/tutorial4organicincremental.png',
      category: 'layout-features',
      tags: ['organic', 'incremental'],
      keywords: ['v2.4.0.4', 'layout', 'subset', 'nodes', 'set', 'node-set'],
      sourcePath: 'layout-features/organic-incremental/SampleApplication.js'
    },
    {
      id: 'layout-features-organic-edge-labeling',
      name: 'Organic Layout with Edge Labeling',
      summary: 'Shows how to configure automatic label placement of organic layout.',
      demoPath: 'layout-features/organic-edge-labeling/index.html',
      thumbnailPath: 'resources/image/tutorial4organicedgelabeling.png',
      category: 'layout-features',
      tags: ['organic', 'labeling'],
      keywords: ['v2.6.0.0', 'layout', 'integrated-labeling', 'label-placement', 'auto-flipping'],
      sourcePath: 'layout-features/organic-edge-labeling/SampleApplication.js'
    },
    {
      id: 'layout-features-organic-substructures',
      name: 'Organic Layout with Substructures',
      summary: 'Shows how to configure the layout of substructures in the organic layout.',
      demoPath: 'layout-features/organic-substructures/index.html',
      thumbnailPath: 'resources/image/tutorial4organicsubstructures.png',
      category: 'layout-features',
      tags: ['organic', 'substructures'],
      keywords: ['v2.4.0.4', 'layout'],
      sourcePath: 'layout-features/organic-substructures/SampleApplication.js'
    },
    {
      id: 'layout-features-organic-constraints',
      name: 'Organic Layout with Constraints',
      summary: 'Shows how to configure constraints for the organic layout algorithm.',
      demoPath: 'layout-features/organic-constraints/index.html',
      thumbnailPath: 'resources/image/tutorial4organicconstraints.png',
      category: 'layout-features',
      tags: ['organic', 'constraints'],
      keywords: ['v2.6.0.0', 'layout', 'circle', 'constraints', 'align', 'cycle'],
      sourcePath: 'layout-features/organic-constraints/SampleApplication.js'
    },
    {
      id: 'layout-features-edgerouter',
      name: 'Edge Router',
      summary: 'Shows common configuration options for the edge routing algorithm.',
      demoPath: 'layout-features/edge-router/index.html',
      thumbnailPath: 'resources/image/tutorial4edgerouter.png',
      category: 'layout-features',
      tags: ['router'],
      keywords: [
        'v2.4.0.4',
        'layout',
        'orthogonal',
        'octilinear',
        'port-candidates',
        'edge-grouping',
        'scope',
        'routing-style',
        'EdgeRouterEdgeLayoutDescriptor'
      ],
      sourcePath: 'layout-features/edge-router/SampleApplication.js'
    },
    {
      id: 'layout-features-edge-router-incremental',
      name: 'Incremental Edge Router',
      summary: 'Shows how to run the edge router on a predefined set of edges.',
      demoPath: 'layout-features/edge-router-incremental/index.html',
      thumbnailPath: 'resources/image/tutorial4edgerouterincremental.png',
      category: 'layout-features',
      tags: ['incremental', 'routing'],
      keywords: ['v2.4.0.4', 'layout', 'subset', 'edges', 'set', 'edge-set'],
      sourcePath: 'layout-features/edge-router-incremental/SampleApplication.js'
    },
    {
      id: 'layout-features-edge-router-buses',
      name: 'Edge Router with Buses',
      summary:
        'Shows how to configure the edge routing algorithm to produce orthogonal bus-style paths.',
      demoPath: 'layout-features/edge-router-buses/index.html',
      thumbnailPath: 'resources/image/tutorial4edgerouterbuses.png',
      category: 'layout-features',
      tags: ['routing', 'orthogonal', 'bus'],
      keywords: [
        'v2.4.0.4',
        'layout',
        'edge router',
        'edgegroups',
        'bus',
        'bus structures',
        'backbone',
        'givenPoints',
        'EdgeRouterBusDescriptor'
      ],
      sourcePath: 'layout-features/edge-router-buses/SampleApplication.js'
    },
    {
      id: 'layout-features-tree',
      name: 'Basic Tree Layout',
      summary: 'Shows common configuration options for the tree layout.',
      demoPath: 'layout-features/tree/index.html',
      thumbnailPath: 'resources/image/tutorial4tree.png',
      category: 'layout-features',
      tags: ['tree'],
      keywords: ['v2.4.0.4', 'layout', 'outedgecomparers', 'portassignment', 'nodeplacer'],
      sourcePath: 'layout-features/tree/SampleApplication.js'
    },
    {
      id: 'layout-features-tree-node-placers',
      name: 'Tree Layout with Node Placers',
      summary: 'Shows how to use different node placers in tree layout.',
      demoPath: 'layout-features/tree-node-placers/index.html',
      thumbnailPath: 'resources/image/tutorial4treenodeplacers.png',
      category: 'layout-features',
      tags: ['tree', 'nodeplacer'],
      keywords: ['v2.4.0.4', 'layout', 'nodes'],
      sourcePath: 'layout-features/tree-node-placers/SampleApplication.js'
    },
    {
      id: 'layout-features-orthogonal',
      name: 'Orthogonal Layout',
      summary: 'Shows common configuration options for the orthogonal layout.',
      demoPath: 'layout-features/orthogonal/index.html',
      thumbnailPath: 'resources/image/tutorial4orthogonal.png',
      category: 'layout-features',
      tags: ['orthogonal'],
      keywords: ['v2.4.0.4', 'layout', 'directed', 'halo'],
      sourcePath: 'layout-features/orthogonal/SampleApplication.js'
    },
    {
      id: 'layout-features-recursive-group-layout',
      name: 'Recursive Group Layout',
      summary:
        'Shows how to use different layouts for group nodes using the recursive group layout.',
      demoPath: 'layout-features/recursive-group-layout/index.html',
      thumbnailPath: 'resources/image/tutorial4recursivegrouplayout.png',
      category: 'layout-features',
      tags: ['recursive', 'groups'],
      keywords: ['v2.4.0.4', 'layout'],
      sourcePath: 'layout-features/recursive-group-layout/SampleApplication.js'
    },
    {
      id: 'layout-features-cactus-group-layout',
      name: 'Cactus Group Layout',
      summary: 'Shows how to configure the cactus group layout to arrange grouped graphs.',
      demoPath: 'layout-features/cactus/index.html',
      thumbnailPath: 'resources/image/tutorial4cactus.png',
      category: 'layout-features',
      tags: ['cactus', 'groups'],
      keywords: ['v2.5.0.0', 'layout', 'hierarchy', 'round', 'nesting', 'bundling', 'fractal'],
      sourcePath: 'layout-features/cactus/SampleApplication.js'
    },
    {
      id: 'layout-features-compact-disk-groups',
      name: 'Compact Disk Groups',
      summary: 'Shows how to configure the compact disk layout to arrange children of group nodes.',
      demoPath: 'layout-features/compact-disk-groups/index.html',
      thumbnailPath: 'resources/image/tutorial4compactdiskgroups.png',
      category: 'layout-features',
      tags: ['compact', 'disk', 'groups'],
      keywords: [
        'v2.5.0.0',
        'layout',
        'round',
        'nesting',
        'node types',
        'recursive',
        'RecursiveGroupLayout'
      ],
      sourcePath: 'layout-features/compact-disk-groups/SampleApplication.js'
    },
    {
      id: 'layout-features-compact-tabular-layout',
      name: 'Compact Tabular Layout',
      summary: 'Shows how to configure the tabular layout to create compact drawings',
      demoPath: 'layout-features/compact-tabular-layout/index.html',
      thumbnailPath: 'resources/image/tutorial4compacttabularlayout.png',
      category: 'layout-features',
      tags: ['compact', 'tabular', 'router'],
      keywords: ['v2.6.0.0', 'layout', 'compact', 'table', 'tabular', 'edgerouter', 'aspect ratio'],
      sourcePath: 'layout-features/compact-tabular-layout/CompactTabularLayoutDemo.js'
    },
    {
      id: 'tutorial-basic-features-graphcomponent',
      name: '01 Creating the View',
      summary:
        'Introduces the GraphComponent class, the central UI element for working with graphs.',
      demoPath: 'tutorial-yfiles-basic-features/01-graphcomponent/index.html',
      thumbnailPath: 'resources/image/tutorial1step1.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0'],
      sourcePath: 'tutorial-yfiles-basic-features/01-graphcomponent/creating-the-view.ts'
    },
    {
      id: 'tutorial-basic-features-graph-element-creation',
      name: '02 Creating Graph Elements',
      summary: 'Shows how to create the basic graph elements.',
      demoPath: 'tutorial-yfiles-basic-features/02-graph-element-creation/index.html',
      thumbnailPath: 'resources/image/tutorial1step2.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'nodes', 'edges', 'labels'],
      sourcePath:
        'tutorial-yfiles-basic-features/02-graph-element-creation/graph-element-creation.ts'
    },
    {
      id: 'tutorial-basic-features-managing-viewport',
      name: '03 Managing Viewport',
      summary: 'Shows how to work with the viewport.',
      demoPath: 'tutorial-yfiles-basic-features/03-managing-viewport/index.html',
      thumbnailPath: 'resources/image/tutorial1step2.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'zoom', 'fit content'],
      sourcePath: 'tutorial-yfiles-basic-features/03-managing-viewport/managing-viewport.ts'
    },
    {
      id: 'tutorial-basic-features-setting-styles',
      name: '04 Setting Styles',
      summary: 'Shows how to configure the visual appearance of graph elements using styles.',
      demoPath: 'tutorial-yfiles-basic-features/04-setting-styles/index.html',
      thumbnailPath: 'resources/image/tutorial1step4.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: [
        'v2.6.0.0',
        'DefaultLabelStyle',
        'ShapeNodeStyle',
        'RectangleNodeStyle',
        'PolylineEdgeStyle',
        'Arrow'
      ],
      sourcePath: 'tutorial-yfiles-basic-features/04-setting-styles/setting-styles.ts'
    },
    {
      id: 'tutorial-basic-features-label-placement',
      name: '05 Label Placement',
      summary:
        'Shows how to control label placement with the help of so called label model parameters.',
      demoPath: 'tutorial-yfiles-basic-features/05-label-placement/index.html',
      thumbnailPath: 'resources/image/tutorial1step5.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'InteriorLabelModel', 'SmartEdgeLabelModel'],
      sourcePath: 'tutorial-yfiles-basic-features/05-label-placement/label-placement.ts'
    },
    {
      id: 'tutorial-basic-features-basic-interaction',
      name: '06 Basic Interaction',
      summary:
        'Shows the default interaction gestures that are provided by class GraphEditorInputMode.',
      demoPath: 'tutorial-yfiles-basic-features/06-basic-interaction/index.html',
      thumbnailPath: 'resources/image/tutorial1step6.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0'],
      sourcePath: 'tutorial-yfiles-basic-features/06-basic-interaction/basic-interaction.ts'
    },
    {
      id: 'tutorial-basic-features-undo-clipboard-support',
      name: '07 Undo Clipboard Support',
      summary: 'Shows how to use the undo and clipboard features.',
      demoPath: 'tutorial-yfiles-basic-features/07-undo-clipboard-support/index.html',
      thumbnailPath: 'resources/image/tutorial1step7.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'cut', 'copy', 'paste', 'redo'],
      sourcePath:
        'tutorial-yfiles-basic-features/07-undo-clipboard-support/undo-clipboard-support.ts'
    },
    {
      id: 'tutorial-basic-features-grouping',
      name: '08 Grouping',
      summary: 'Shows how to configure support for grouped (or hierarchically organized) graphs.',
      demoPath: 'tutorial-yfiles-basic-features/08-grouping/index.html',
      thumbnailPath: 'resources/image/tutorial1step8.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'PanelNodeStyle', 'InteriorStretchLabelModel'],
      sourcePath: 'tutorial-yfiles-basic-features/08-grouping/grouping.ts'
    },
    {
      id: 'tutorial-basic-features-data-binding',
      name: '09 Data Binding',
      summary: 'Shows how to bind data to graph elements.',
      demoPath: 'tutorial-yfiles-basic-features/09-data-binding/index.html',
      thumbnailPath: 'resources/image/tutorial1step9.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'Mapper'],
      sourcePath: 'tutorial-yfiles-basic-features/09-data-binding/data-binding.ts'
    },
    {
      id: 'tutorial-basic-features-layout',
      name: '10 Layout',
      summary:
        'Shows how to use the layout algorithms in yFiles for HTML to automatically place the graph elements.',
      demoPath: 'tutorial-yfiles-basic-features/10-layout/index.html',
      thumbnailPath: 'resources/image/tutorial1step10.png',
      category: 'tutorial-basic-features',
      packageType: 'needs-layout',
      tags: ['tutorial', 'basic features', 'hierarchic'],
      keywords: ['v2.6.0.0', 'morphLayout'],
      sourcePath: 'tutorial-yfiles-basic-features/10-layout/layout.ts'
    },
    {
      id: 'tutorial-basic-features-layout-data',
      name: '11 Layout Data',
      summary: 'Shows how to configure individual settings for each node for the automatic layout.',
      demoPath: 'tutorial-yfiles-basic-features/11-layout-data/index.html',
      thumbnailPath: 'resources/image/tutorial1step11.png',
      category: 'tutorial-basic-features',
      packageType: 'needs-layout',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'hierarchic'],
      sourcePath: 'tutorial-yfiles-basic-features/11-layout-data/layout-data.ts'
    },
    {
      id: 'tutorial-basic-features-graph-analysis',
      name: '12 Analysis Algorithms',
      summary: 'Shows how to use the graph analysis algorithms.',
      demoPath: 'tutorial-yfiles-basic-features/12-graph-analysis/index.html',
      thumbnailPath: 'resources/image/tutorial1step12.png',
      category: 'tutorial-basic-features',
      packageType: 'needs-layout',
      tags: ['tutorial', 'basic features', 'analysis'],
      keywords: ['v2.6.0.0', 'Reachability', 'ShortestPaths', 'v2.2.0.0'],
      sourcePath: 'tutorial-yfiles-basic-features/12-graph-analysis/graph-analysis.ts'
    },
    {
      id: 'tutorial-graph-builder-create-graph',
      name: '01 Create Graph',
      summary:
        'Introduces the GraphBuilder class which helps to transfer business data into a graph.',
      demoPath: 'tutorial-graph-builder/01-create-graph/index.html',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'graph', 'import'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json'],
      sourcePath: 'tutorial-graph-builder/01-create-graph/create-graph.js',
      thumbnailPath: 'resources/image/tutorial-05-graph-builder.png'
    },
    {
      id: 'tutorial-graph-builder-create-nodes-sources',
      name: '02 Create Nodes Sources',
      summary: 'Shows how to retrieve nodes from different data sources.',
      demoPath: 'tutorial-graph-builder/02-create-nodes-sources/index.html',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'nodes', 'import'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json', 'nodes sources'],
      sourcePath: 'tutorial-graph-builder/02-create-nodes-sources/create-nodes-sources.js',
      thumbnailPath: 'resources/image/tutorial-05-nodes-sources.png'
    },
    {
      id: 'tutorial-graph-builder-create-edges-sources',
      name: '03 Create Edges Sources',
      summary: 'Shows how to retrieve edges from different data sources.',
      demoPath: 'tutorial-graph-builder/03-create-edges-sources/index.html',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'edges', 'import'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json', 'edges sources'],
      sourcePath: 'tutorial-graph-builder/03-create-edges-sources/create-edges-sources.js',
      thumbnailPath: 'resources/image/tutorial-05-edges-sources.png'
    },
    {
      id: 'tutorial-graph-builder-group-nodes',
      name: '04 Group Nodes',
      summary:
        'Shows how to create group nodes to visualize hierarchy information within the business data.',
      demoPath: 'tutorial-graph-builder/04-group-nodes/index.html',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'groups', 'import'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'hierarchy', 'json'],
      sourcePath: 'tutorial-graph-builder/04-group-nodes/create-group-nodes.js',
      thumbnailPath: 'resources/image/tutorial-05-group-nodes.png'
    },
    {
      id: 'tutorial-graph-builder-implicit-grouping',
      name: '05 Implicit Grouping',
      summary: 'Shows how to create group nodes implicitly.',
      demoPath: 'tutorial-graph-builder/05-implicit-grouping/index.html',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'groups', 'import'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'graphbuilder',
        'business data',
        'grouping',
        'json',
        'import'
      ],
      sourcePath: 'tutorial-graph-builder/05-implicit-grouping/implicit-group-nodes.ts',
      thumbnailPath: 'resources/image/tutorial-05-implicit-grouping.png'
    },
    {
      id: 'tutorial-graph-builder-configure-styles',
      name: '06 Configure Styles',
      summary: 'Shows how to associate different node and edge styles with the business data.',
      demoPath: 'tutorial-graph-builder/06-configure-styles/index.html',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'styling'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json', 'visualization'],
      sourcePath: 'tutorial-graph-builder/06-configure-styles/configure-styles.js',
      thumbnailPath: 'resources/image/tutorial-05-configure-styles.png'
    },
    {
      id: 'tutorial-graph-builder-create-labels-sources',
      name: '07 Create Labels Sources',
      summary: 'Shows how to retrieve labels for nodes and edges from the business data.',
      demoPath: 'tutorial-graph-builder/07-create-labels-sources/index.html',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'labels', 'import'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json'],
      sourcePath: 'tutorial-graph-builder/07-create-labels-sources/create-labels-sources.js',
      thumbnailPath: 'resources/image/tutorial-05-labels-sources.png'
    },
    {
      id: 'tutorial-graph-builder-configure-labels',
      name: '08 Configure Labels',
      summary: 'Shows how to associate different label styles with the business data.',
      demoPath: 'tutorial-graph-builder/08-configure-labels/index.html',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'labels', 'styling'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data'],
      sourcePath: 'tutorial-graph-builder/08-configure-labels/configure-labels.js',
      thumbnailPath: 'resources/image/tutorial-05-configure-labels.png'
    },
    {
      id: 'tutorial-graph-builder-configure-tags',
      name: '09 Configure Tags',
      summary: "Shows how to provide the business data in the elements' tags.",
      demoPath: 'tutorial-graph-builder/09-configure-tags/index.html',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'tags'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json'],
      sourcePath: 'tutorial-graph-builder/09-configure-tags/configure-tags.js',
      thumbnailPath: 'resources/image/tutorial-05-configure-tags.png'
    },
    {
      id: 'tutorial-graph-builder-configure-layout',
      name: '10 Configure Layout',
      summary: 'Shows how to load positions for graph elements from the business data.',
      demoPath: 'tutorial-graph-builder/10-configure-layout/index.html',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'layout'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'graphbuilder',
        'business data',
        'json',
        'positions',
        'locations'
      ],
      sourcePath: 'tutorial-graph-builder/10-configure-layout/configure-layout.js',
      thumbnailPath: 'resources/image/tutorial-05-configure-layout.png'
    },
    {
      id: 'tutorial-graph-builder-update-graph',
      name: '11 Update Graph',
      summary: 'Shows how to update the graph after incremental changes in the business data.',
      demoPath: 'tutorial-graph-builder/11-update-graph/index.html',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'update'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json'],
      sourcePath: 'tutorial-graph-builder/11-update-graph/update-graph.js',
      thumbnailPath: 'resources/image/tutorial-05-update-graph.png'
    },
    {
      id: 'tutorial-graph-builder-adjacency-graph-builder',
      name: '12 Adjacency Graph Builder',
      summary:
        'Shows how to build a graph from data with implicit relationship information using AdjacencyGraphBuilder.',
      demoPath: 'tutorial-graph-builder/12-adjacency-graph-builder/index.html',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'adjacency list'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'graphbuilder',
        'business data',
        'AdjacencyGraphBuilder',
        'json',
        'import'
      ],
      sourcePath: 'tutorial-graph-builder/12-adjacency-graph-builder/adjacency-graph-building.ts',
      thumbnailPath: 'resources/image/tutorial-05-adjacency-graph-builder.png'
    },
    {
      id: 'tutorial-graph-builder-tree-builder',
      name: '13 Tree Builder',
      summary: 'Shows how to build a graph from tree structured data using TreeBuilder.',
      demoPath: 'tutorial-graph-builder/13-tree-builder/index.html',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'tree'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'graphbuilder',
        'business data',
        'TreeBuilder',
        'json',
        'import'
      ],
      sourcePath: 'tutorial-graph-builder/13-tree-builder/tree-graph-building.ts',
      thumbnailPath: 'resources/image/tutorial-05-tree-graph-builder.png'
    },
    {
      id: 'tutorial-node-style-implementation-create-a-rectangle',
      name: '01 Create A Rectangle',
      summary: 'Create a simple node style using SVG',
      demoPath: 'tutorial-style-implementation-node/01-create-a-rectangle/index.html',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],
      sourcePath: 'tutorial-style-implementation-node/01-create-a-rectangle/CustomNodeStyle.js',
      thumbnailPath: 'resources/image/tutorial-06-create-a-rectangle.png'
    },
    {
      id: 'tutorial-node-style-implementation-create-a-custom-shape',
      name: '02 Create A Custom Shape',
      summary: 'Create a simple node style with a custom shape using SVG',
      demoPath: 'tutorial-style-implementation-node/02-create-a-custom-shape/index.html',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'path', 'nodestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],
      sourcePath: 'tutorial-style-implementation-node/02-create-a-custom-shape/CustomNodeStyle.js',
      thumbnailPath: 'resources/image/tutorial-06-create-a-custom-shape.png'
    },
    {
      id: 'tutorial-node-style-implementation-render-performance',
      name: '03 Render Performance',
      summary: 'Optimize rendering performance of an SVG node style',
      demoPath: 'tutorial-style-implementation-node/03-render-performance/index.html',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'custom',
        'styling',
        'updateVisual',
        'optimization',
        'performance'
      ],
      sourcePath: 'tutorial-style-implementation-node/03-render-performance/CustomNodeStyle.js',
      thumbnailPath: 'resources/image/tutorial-06-render-performance.png'
    },
    {
      id: 'tutorial-node-style-implementation-making-the-style-configurable',
      name: '04 Making the Style Configurable',
      summary: 'Make a custom node style configurable by adding properties',
      demoPath: 'tutorial-style-implementation-node/04-making-the-style-configurable/index.html',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'configuration'],
      sourcePath:
        'tutorial-style-implementation-node/04-making-the-style-configurable/CustomNodeStyle.js',
      thumbnailPath: 'resources/image/tutorial-06-making-the-style-configurable.png'
    },
    {
      id: 'tutorial-node-style-implementation-data-from-tag',
      name: '05 Data from Tag',
      summary: 'Adjust how the node style renders the node using the node business data',
      demoPath: 'tutorial-style-implementation-node/05-data-from-tag/index.html',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle', 'tag'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'business data'],
      sourcePath: 'tutorial-style-implementation-node/05-data-from-tag/CustomNodeStyle.js',
      thumbnailPath: 'resources/image/tutorial-06-data-from-tag.png'
    },
    {
      id: 'tutorial-node-style-implementation-render-text',
      name: '06 Rendering Text',
      summary: 'Adjust the node style to render text defined by the node business data',
      demoPath: 'tutorial-style-implementation-node/06-render-text/index.html',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'TextRenderSupport'],
      sourcePath: 'tutorial-style-implementation-node/06-render-text/CustomNodeStyle.js',
      thumbnailPath: 'resources/image/tutorial-06-render-text.png'
    },
    {
      id: 'tutorial-node-style-implementation-hit-testing',
      name: '07 Hit-Testing',
      summary: 'Customize which area of a node can be hovered and clicked',
      demoPath: 'tutorial-style-implementation-node/07-hit-testing/index.html',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle', 'hittest'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'click', 'ishit'],
      sourcePath: 'tutorial-style-implementation-node/07-hit-testing/CustomNodeStyle.js',
      thumbnailPath: 'resources/image/tutorial-06-hit-testing.png'
    },
    {
      id: 'tutorial-node-style-implementation-edge-cropping',
      name: '08 Edge Cropping',
      summary: 'Customize where edges at the node are cropped',
      demoPath: 'tutorial-style-implementation-node/08-edge-cropping/index.html',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle', 'edges'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'custom',
        'styling',
        'edgecropping',
        'isinside',
        'getoutline',
        'getintersection'
      ],
      sourcePath: 'tutorial-style-implementation-node/08-edge-cropping/CustomNodeStyle.js',
      thumbnailPath: 'resources/image/tutorial-06-edge-cropping.png'
    },
    {
      id: 'tutorial-node-style-implementation-visibility',
      name: '09 Item Visibility',
      summary:
        'Adjust the visibility check to parts of the node visualization that lie outside of the node bounds',
      demoPath: 'tutorial-style-implementation-node/09-visibility/index.html',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle', 'visible'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'isvisible'],
      sourcePath: 'tutorial-style-implementation-node/09-visibility/CustomNodeStyle.js',
      thumbnailPath: 'resources/image/tutorial-06-visibility.png'
    },
    {
      id: 'tutorial-node-style-implementation-bounds',
      name: '10 Render Boundaries',
      summary:
        'Adjust the node boundaries to parts of the node visualization that lie outside of the node bounds',
      demoPath: 'tutorial-style-implementation-node/10-bounds/index.html',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle', 'bounds'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'getbounds'],
      sourcePath: 'tutorial-style-implementation-node/10-bounds/CustomNodeStyle.js',
      thumbnailPath: 'resources/image/tutorial-06-bounds.png'
    },
    {
      id: 'tutorial-node-style-implementation-group-node-style',
      name: '11 Group Node Style',
      summary: 'Create a basic group node style',
      demoPath: 'tutorial-style-implementation-node/11-group-node-style/index.html',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle', 'group'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'grouping', 'insets'],
      sourcePath: 'tutorial-style-implementation-node/11-group-node-style/CustomGroupNodeStyle.js',
      thumbnailPath: 'resources/image/tutorial-06-group-node-style.png'
    },
    {
      id: 'tutorial-node-style-implementation-group-node-style-behavior',
      name: '12 Group Node Style Behavior',
      summary: 'Adjust the group node style minimum size and size calculation',
      demoPath: 'tutorial-style-implementation-node/12-group-node-style-behavior/index.html',
      category: 'tutorial-node-style-implementation',
      tags: ['nodestyle', 'group', 'size'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'custom',
        'styling',
        'grouping',
        'minimum',
        'constraint',
        'groupbounds'
      ],
      sourcePath:
        'tutorial-style-implementation-node/12-group-node-style-behavior/CustomGroupNodeStyle.js',
      thumbnailPath: 'resources/image/tutorial-06-group-node-style-behavior.png'
    },
    {
      id: 'tutorial-label-style-implementation-render-label-text',
      name: '01 Rendering the Label Text',
      summary: 'Visualize a label using a basic text element',
      demoPath: 'tutorial-style-implementation-label/01-render-label-text/index.html',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling'],
      sourcePath: 'tutorial-style-implementation-label/01-render-label-text/CustomLabelStyle.ts',
      thumbnailPath: 'resources/image/tutorial-07-render-label-text.png'
    },
    {
      id: 'tutorial-label-style-implementation-using-text-utilities',
      name: '02 Using Text Utilities',
      summary: 'Use convenience functionality to place the text',
      demoPath: 'tutorial-style-implementation-label/02-using-text-utilities/index.html',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['tutorial', 'custom', 'styling'],
      sourcePath: 'tutorial-style-implementation-label/02-using-text-utilities/CustomLabelStyle.ts',
      thumbnailPath: 'resources/image/tutorial-07-using-text-utilities.png'
    },
    {
      id: 'tutorial-label-style-implementation-add-background-shape',
      name: '03 Adding a Background Shape',
      summary: 'Add a customized background to the label text',
      demoPath: 'tutorial-style-implementation-label/03-add-background-shape/index.html',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling', 'background'],
      sourcePath: 'tutorial-style-implementation-label/03-add-background-shape/CustomLabelStyle.ts',
      thumbnailPath: 'resources/image/tutorial-07-add-background-shape.png'
    },
    {
      id: 'tutorial-label-style-implementation-preferred-size',
      name: '04 Preferred Label Size',
      summary: 'Let the label style set the desired label size',
      demoPath: 'tutorial-style-implementation-label/04-preferred-size/index.html',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling', 'size'],
      sourcePath: 'tutorial-style-implementation-label/04-preferred-size/CustomLabelStyle.ts',
      thumbnailPath: 'resources/image/tutorial-07-preferred-size.png'
    },
    {
      id: 'tutorial-label-style-implementation-render-performance',
      name: '05 Render Performance',
      summary: 'Optimize the render performance of the label style',
      demoPath: 'tutorial-style-implementation-label/05-render-performance/index.html',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling'],
      sourcePath: 'tutorial-style-implementation-label/05-render-performance/CustomLabelStyle.ts',
      thumbnailPath: 'resources/image/tutorial-07-render-performance.png'
    },
    {
      id: 'tutorial-label-style-implementation-text-alignment',
      name: '06 Text Alignment',
      summary: 'Configure horizontal and vertical text alignment inside the label bounds',
      demoPath: 'tutorial-style-implementation-label/06-text-alignment/index.html',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'custom',
        'label',
        'styling',
        'alignment',
        'left',
        'right',
        'top',
        'bottom',
        'center',
        'middle'
      ],
      sourcePath: 'tutorial-style-implementation-label/06-text-alignment/CustomLabelStyle.ts',
      thumbnailPath: 'resources/image/tutorial-07-text-alignment.png'
    },
    {
      id: 'tutorial-label-style-implementation-line-wrapping',
      name: '07 Line Wrapping',
      summary: 'Add automatic line wrapping to the label style',
      demoPath: 'tutorial-style-implementation-label/07-line-wrapping/index.html',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text', 'wrapping'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling', 'wrapping', 'line', 'break'],
      sourcePath: 'tutorial-style-implementation-label/07-line-wrapping/CustomLabelStyle.ts',
      thumbnailPath: 'resources/image/tutorial-07-line-wrapping.png'
    },
    {
      id: 'tutorial-label-style-implementation-data-from-tag',
      name: '08 Data From Tag',
      summary: 'Use data from the label tag in the visualization',
      demoPath: 'tutorial-style-implementation-label/08-data-from-tag/index.html',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling', 'business data'],
      sourcePath: 'tutorial-style-implementation-label/08-data-from-tag/CustomLabelStyle.ts',
      thumbnailPath: 'resources/image/tutorial-07-data-from-tag.png'
    },
    {
      id: 'tutorial-label-style-implementation-hit-testing',
      name: '09 Hit-Testing',
      summary: 'Configure which parts of the label visualization are clickable',
      demoPath: 'tutorial-style-implementation-label/09-hit-testing/index.html',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text', 'hittest'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling'],
      sourcePath: 'tutorial-style-implementation-label/09-hit-testing/CustomLabelStyle.ts',
      thumbnailPath: 'resources/image/tutorial-07-hit-testing.png'
    },
    {
      id: 'tutorial-label-style-implementation-visibility',
      name: '10 Visibility',
      summary:
        'Adjust the visibility check to parts of the label visualization that lie outside of the label bounds',
      demoPath: 'tutorial-style-implementation-label/10-visibility/index.html',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],
      sourcePath: 'tutorial-style-implementation-label/10-visibility/CustomLabelStyle.ts',
      thumbnailPath: 'resources/image/tutorial-07-visibility.png'
    },
    {
      id: 'tutorial-label-style-implementation-bounds',
      name: '11 Bounds',
      summary:
        'Adjust the label boundaries to parts of the label visualization that lie outside of the label bounds',
      demoPath: 'tutorial-style-implementation-label/11-bounds/index.html',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling'],
      sourcePath: 'tutorial-style-implementation-label/11-bounds/CustomLabelStyle.ts',
      thumbnailPath: 'resources/image/tutorial-07-bounds.png'
    },
    {
      id: 'tutorial-edge-style-implementation-create-a-polyline',
      name: '01 Create a Polyline',
      summary: 'Create a simple edge style using SVG',
      demoPath: 'tutorial-style-implementation-edge/01-create-a-polyline/index.html',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],
      sourcePath: 'tutorial-style-implementation-edge/01-create-a-polyline/CustomEdgeStyle.js',
      thumbnailPath: 'resources/image/tutorial-08-create-a-polyline.png'
    },
    {
      id: 'tutorial-edge-style-implementation-crop-the-polyline',
      name: '02 Crop the Polyline',
      summary: 'Crop the edge path at the outline of its source and target nodes.',
      demoPath: 'tutorial-style-implementation-edge/02-crop-the-polyline/index.html',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],
      sourcePath: 'tutorial-style-implementation-edge/02-crop-the-polyline/CustomEdgeStyle.js',
      thumbnailPath: 'resources/image/tutorial-08-crop-the-polyline.png'
    },
    {
      id: 'tutorial-edge-style-implementation-create-parallel-polylines',
      name: '03 Create Parallel Polylines',
      summary: 'Create parallel polylines for edge visualization.',
      demoPath: 'tutorial-style-implementation-edge/03-create-parallel-polylines/index.html',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],
      sourcePath:
        'tutorial-style-implementation-edge/03-create-parallel-polylines/CustomEdgeStyle.js',
      thumbnailPath: 'resources/image/tutorial-08-create-parallel-polylines.png'
    },
    {
      id: 'tutorial-edge-style-implementation-render-performance',
      name: '04 Render Performance',
      summary: 'Optimize rendering performance of an SVG edge style',
      demoPath: 'tutorial-style-implementation-edge/04-render-performance/index.html',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],
      sourcePath: 'tutorial-style-implementation-edge/04-render-performance/CustomEdgeStyle.js',
      thumbnailPath: 'resources/image/tutorial-08-render-performance.png'
    },
    {
      id: 'tutorial-edge-style-implementation-making-the-style-configurable',
      name: '05 Making the Style Configurable',
      summary: 'Make a custom edge style configurable by adding properties',
      demoPath: 'tutorial-style-implementation-edge/05-making-the-style-configurable/index.html',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'distance'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'configuration'],
      sourcePath:
        'tutorial-style-implementation-edge/05-making-the-style-configurable/CustomEdgeStyle.js',
      thumbnailPath: 'resources/image/tutorial-08-making-the-style-configurable.png'
    },
    {
      id: 'tutorial-edge-style-implementation-data-from-tag',
      name: '06 Data from Tag',
      summary: 'Adjust how the edge style renders the edge using the edge business data',
      demoPath: 'tutorial-style-implementation-edge/06-data-from-tag/index.html',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'color', 'tag'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'business data'],
      sourcePath: 'tutorial-style-implementation-edge/06-data-from-tag/CustomEdgeStyle.js',
      thumbnailPath: 'resources/image/tutorial-08-data-from-tag.png'
    },
    {
      id: 'tutorial-edge-style-implementation-hit-testing',
      name: '07 Hit-Testing',
      summary: 'Customize which area of a edge can be hovered and clicked',
      demoPath: 'tutorial-style-implementation-edge/07-hit-testing/index.html',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'hittest'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'click', 'ishit'],
      sourcePath: 'tutorial-style-implementation-edge/07-hit-testing/CustomEdgeStyle.js',
      thumbnailPath: 'resources/image/tutorial-08-hit-testing.png'
    },
    {
      id: 'tutorial-edge-style-implementation-visibility',
      name: '08 Item Visibility',
      summary:
        'Adjust the visibility check to parts of the edge visualization that lie outside of the edge bounds',
      demoPath: 'tutorial-style-implementation-edge/08-visibility/index.html',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'visible'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'isvisible'],
      sourcePath: 'tutorial-style-implementation-edge/08-visibility/CustomEdgeStyle.js',
      thumbnailPath: 'resources/image/tutorial-08-visibility.png'
    },
    {
      id: 'tutorial-edge-style-implementation-bounds',
      name: '09 Render Boundaries',
      summary:
        'Adjust the edge boundaries to parts of the edge visualization that lie outside of the edge path',
      demoPath: 'tutorial-style-implementation-edge/09-bounds/index.html',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'bounds'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'getbounds'],
      sourcePath: 'tutorial-style-implementation-edge/09-bounds/CustomEdgeStyle.js',
      thumbnailPath: 'resources/image/tutorial-08-bounds.png'
    },
    {
      id: 'tutorial-edge-style-implementation-bridge-support',
      name: '10 Bridge Support',
      summary:
        'Adjust the edge visualization to resolve the visual ambiguity induced by intersecting edge paths',
      demoPath: 'tutorial-style-implementation-edge/10-bridge-support/index.html',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'bridge'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'bridge'],
      sourcePath: 'tutorial-style-implementation-edge/10-bridge-support/CustomEdgeStyle.js',
      thumbnailPath: 'resources/image/tutorial-08-bridge-support.png'
    },
    {
      id: 'tutorial-edge-style-implementation-adding-arrows',
      name: '11 Adding Arrows',
      summary: 'Add arrows to indicate the edge’s direction',
      demoPath: 'tutorial-style-implementation-edge/11-adding-arrows/index.html',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'arrow'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'arrow'],
      sourcePath: 'tutorial-style-implementation-edge/11-adding-arrows/CustomEdgeStyle.js',
      thumbnailPath: 'resources/image/tutorial-08-adding-arrows.png'
    },
    {
      id: 'tutorial-edge-style-implementation-custom-arrow',
      name: '12 Custom Arrow',
      summary: 'Create a custom arrow that matches our edge style',
      demoPath: 'tutorial-style-implementation-edge/12-custom-arrow/index.html',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'arrow'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'arrow'],
      sourcePath: 'tutorial-style-implementation-edge/12-custom-arrow/CustomEdgeStyle.js',
      thumbnailPath: 'resources/image/tutorial-08-custom-arrow.png'
    },
    {
      id: 'tutorial-port-style-implementation-render-port-shape',
      name: '01 Rendering the Port',
      summary: 'Visualize a port as a basic circle shape',
      demoPath: 'tutorial-style-implementation-port/01-render-port-shape/index.html',
      category: 'tutorial-port-style-implementation',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling'],
      sourcePath: 'tutorial-style-implementation-port/01-render-port-shape/CustomPortStyle.ts',
      thumbnailPath: 'resources/image/tutorial-09-render-port-shape.png'
    },
    {
      id: 'tutorial-port-style-implementation-port-size',
      name: '02 Port Size',
      summary: 'Configuring the port size in the style',
      demoPath: 'tutorial-style-implementation-port/02-port-size/index.html',
      category: 'tutorial-port-style-implementation',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling'],
      sourcePath: 'tutorial-style-implementation-port/02-port-size/CustomPortStyle.ts',
      thumbnailPath: 'resources/image/tutorial-09-port-size.png'
    },
    {
      id: 'tutorial-port-style-implementation-render-performance',
      name: '03 Render Performance',
      summary: 'Optimize rendering performance of an SVG port style',
      demoPath: 'tutorial-style-implementation-port/03-render-performance/index.html',
      category: 'tutorial-port-style-implementation',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling', 'optimization'],
      sourcePath: 'tutorial-style-implementation-port/03-render-performance/CustomPortStyle.ts',
      thumbnailPath: 'resources/image/tutorial-09-render-performance.png'
    },
    {
      id: 'tutorial-port-style-implementation-conditional-coloring',
      name: '04 Conditional Port Coloring',
      summary: 'Set the color of the port based on the number of connected edges',
      demoPath: 'tutorial-style-implementation-port/04-conditional-coloring/index.html',
      category: 'tutorial-port-style-implementation',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling', 'color', 'fill'],
      sourcePath: 'tutorial-style-implementation-port/04-conditional-coloring/CustomPortStyle.ts',
      thumbnailPath: 'resources/image/tutorial-09-conditional-coloring.png'
    },
    {
      id: 'tutorial-port-style-implementation-hit-testing',
      name: '05 Hit-Testing',
      summary: 'Customize which area of a port can be hovered and clicked',
      demoPath: 'tutorial-style-implementation-port/05-hit-testing/index.html',
      category: 'tutorial-port-style-implementation',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling'],
      sourcePath: 'tutorial-style-implementation-port/05-hit-testing/CustomPortStyle.ts',
      thumbnailPath: 'resources/image/tutorial-09-hit-testing.png'
    },
    {
      id: 'tutorial-port-style-implementation-edge-cropping',
      name: '06 Edge Cropping',
      summary: 'Crop the edge at the port outline',
      demoPath: 'tutorial-style-implementation-port/06-edge-cropping/index.html',
      category: 'tutorial-port-style-implementation',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling'],
      sourcePath: 'tutorial-style-implementation-port/06-edge-cropping/CustomPortStyle.ts',
      thumbnailPath: 'resources/image/tutorial-09-edge-cropping.png'
    },
    {
      id: 'yfiles-demo-list',
      name: 'yFiles Demo List',
      summary: 'Lists all source code demos that are included in the yFiles package.',
      demoPath: './README.html',
      hidden: true
    },
    {
      id: 'tutorial-basic-features',
      name: 'Basic Features Tutorial',
      summary:
        'A step-by-step introduction to the concepts and main features of the yFiles for HTML diagramming library',
      category: 'tutorial',
      demoPath: './README.html#tutorial-basic-features',
      hidden: true
    },
    {
      id: 'tutorial-graph-builder',
      name: 'Graph Builder Tutorial',
      summary:
        'Guides through conveniently transferring business data into a graph to display, manage and explore.',
      category: 'tutorial',
      demoPath: './README.html#tutorial-graph-builder',
      hidden: true
    },
    {
      id: 'tutorial-node-style-implementation',
      name: 'Node Style Implementation Tutorial',
      summary:
        'A step-by-step guide on how to create a custom visual representation of nodes using SVG.',
      category: 'tutorial',
      demoPath: './README.html#tutorial-style-implementation-node',
      hidden: true
    },
    {
      id: 'tutorial-label-style-implementation',
      name: 'Label Style Implementation Tutorial',
      summary:
        'A step-by-step guide on how to create a custom visual representation of labels using SVG.',
      category: 'tutorial',
      demoPath: './README.html#tutorial-style-implementation-label',
      hidden: true
    },
    {
      id: 'tutorial-edge-style-implementation',
      name: 'Edge Style Implementation Tutorial',
      summary:
        'A step-by-step guide on how to create a custom visual representation of edges using SVG.',
      category: 'tutorial',
      demoPath: './README.html#tutorial-style-implementation-edge',
      hidden: true
    },
    {
      id: 'tutorial-port-style-implementation',
      name: 'Port Style Implementation Tutorial',
      summary:
        'A step-by-step guide on how to create a custom visual representation of ports using SVG.',
      category: 'tutorial',
      demoPath: './README.html#tutorial-style-implementation-port',
      hidden: true
    }
  ]

  return postProcess(data)
}

function postProcess(demoDataArray) {
  for (const demo of demoDataArray) {
    if (demo.category == null) {
      demo.hidden = true
      continue
    }

    if (demo.category === 'tutorial') {
      demo.demoPath ??= demo.id
      demo.hidden = true
      continue
    }

    if (demo.category.startsWith('tutorial-')) {
      demo.thumbnailPath ??= `resources/image/${demo.category}.png`
    }

    demo.thumbnailPath ??= `resources/image/${demo.id}.png`
    demo.demoDir ??= determineDemoDir(demo.demoPath)
  }

  return demoDataArray
}

function determineDemoDir(demoPath) {
  const dirs = demoPath.split('/')
  return dirs.length > 1 ? `${dirs[0]}/${dirs[1]}` : dirs[0]
}

if (
  typeof exports === 'object' &&
  typeof module !== 'undefined' &&
  typeof module.exports === 'object'
) {
  const myModule = (module.exports = getDemoData())
  myModule.getDemoData = getDemoData
  myModule.getCategoryNames = getCategoryNames
  myModule.getLayoutCategories = getLayoutCategories
}
