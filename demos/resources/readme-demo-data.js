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
 * @typedef {'analysis'|'application-features'|'data-binding'|'input'|'integration'|'layout'|'layout-features'|'loading'|'showcase'|'style'|'testing'|'view'}  NormalDemoCategory
 */

/**
 * @typedef {'tutorial-basic-features'|'tutorial-edge-style-implementation'|'tutorial-graph-builder'|'tutorial-label-style-implementation'|'tutorial-node-style-implementation'|'tutorial-port-style-implementation'} TutorialCategory
 */

/**
 * @typedef {NormalDemoCategory | TutorialCategory} DemoCategory
 */

/**
 * Marks a demo that needs the layout part and that works without the viewer part, respectively,
 * Demos that work without layout can omit this property.
 * Demos that belong to the categories listed in getLayoutCategories() are automatically considered
 * to be 'needs-layout'.
 * @typedef {'needs-layout' | 'no-viewer'} DistributionType
 */

/**
 *
 * @typedef {'js-only' | 'ts-only'} LanguageType
 */

/**
 * @typedef {object} DemoEntry
 * @property {string} id
 * @property {string} name
 * @property {string} summary
 * @property {string} demoPath
 * @property {string} [demoDir] - The directory of the demo. Typically, this is auto-generated from demoPath.
 * @property {DemoCategory} category
 * @property {DistributionType} [distributionType]
 * @property {LanguageType} [languageType]
 * @property {boolean} [onlineAvailable]
 * @property {boolean} [hiddenInGrid]
 * @property {string} thumbnailPath
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
    'data-binding': 'Data Binding',
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
 * Demos in these categories are considered to have a {@link DistributionType} of
 * 'needs-layout'.
 * @return {DemoCategory[]}
 */
function getLayoutCategories() {
  return [
    'analysis',
    'data-binding',
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
  /** @type {Array<DemoEntry | HiddenEntry>} */
  const data = [
    {
      id: 'layout-styles',
      name: 'Layout Styles',
      demoPath: 'showcase/layoutstyles/',
      summary: `Presents yFiles' exceptional layout algorithms, including hierarchic,
       organic, orthogonal, tree, edge routing, and more.`,
      description: `This demo presents yFiles' exceptional automatic layout algorithms, including hierarchic,
       organic, orthogonal, tree, circular, balloon, and various edge routing styles.
       Explore a broad range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'showcase',
      thumbnailPath: 'resources/image/layoutstyles.png',
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
      summary: `Presents yFiles' hierarchic layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' hierarchic layout algorithm and its other layout
       styles.
       Hierarchical layouts are particularly useful for directed diagrams, like flow charts, BPMN
       diagrams and more.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-hierarchic.png',
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
      summary: `Presents yFiles' organic layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' organic layout algorithm and its other layout
       styles.
       Organic layouts are particularly useful for many types of undirected graphs and complex
       networks, like social networks, web visualizations, and knowledge representation.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-organic.png',
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
      summary: `Presents yFiles' edge routing algorithm and its other layout styles.`,
      description: `This demo presents yFiles' edge routing algorithm and its other layout
       styles.
       The edge routing algorithms can route edges in an orthogonal, octilinear, or curved
       way such that they don't cross through nodes or other obstacles.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-edgerouter.png',
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
      summary: `Presents yFiles' tree layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' tree layout algorithm and its other layout
       styles.
       Tree layouts are particularly useful to visualize tree structures like organization charts or
       for dataflow analysis.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-tree.png',
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
      summary: `Presents yFiles' balloon layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' balloon layout algorithm and its other layout
       styles.
       As a subtype of tree layouts, balloon layouts are particularly useful to visualize tree-like
       structures in a radial fashion.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-balloon.png',
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
      summary: `Presents yFiles' orthogonal layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' orthogonal layout algorithm and its other layout
       styles.
       Orthogonal layouts are particularly useful for diagrams with orthogonal edges such as UML,
       database schemas, system management and more.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-orthogonal.png',
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
      summary: `Presents yFiles' circular layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' circular layout algorithm and its other layout
       styles.
       Circular layouts are particularly useful for applications in social networking, for WWW
       visualization, and network management.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-circular.png',
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
      summary: `Presents yFiles' radial layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' radial layout algorithm and its other layout
       styles.
       Radial layouts are particularly useful to visualize directed diagrams with a certain flow.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-radial.png',
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
      summary: `Presents yFiles' compact disk layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' compact disk layout algorithm and its other layout
       styles.
       Compact disk layouts are particularly useful to visualize diagrams with few edges in a
       compact disk-like fashion.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-compact-disk.png',
      tags: ['layout', 'compact disk'],
      keywords: ['v2.5.0.0', 'layout styles samples', 'concentric', 'compact disk', 'round']
    },
    {
      id: 'layout-styles-seriesparallel',
      name: 'Layout Styles: Series-Parallel',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=series-parallel&sample=series-parallel',
      summary: `Presents yFiles' series-parallel layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' series-parallel layout algorithm and its other layout
       styles.
       Series-parallel layouts are particularly useful for diagrams with a main direction, such as
       charts.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-seriesparallel.png',
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
      summary: `Presents yFiles' bus routing algorithm and its other layout styles.`,
      description: `This demo presents yFiles' hierarchic layout algorithm and its other layout
       styles.
       Bus-routing algorithms are particularly useful for routing edges in an orthogonal bus-style
       fashion.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-busrouter.png',
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
      summary: `Presents yFiles' component layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' component layout algorithm and its other layout
       styles.
       Component layouts are particularly useful for arranging any kind of disconnected
       diagram components.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-components.png',
      tags: ['layout', 'component'],
      keywords: ['layout styles samples', 'layout algorithm', 'component layout', 'components']
    },
    {
      id: 'layout-styles-tabular',
      name: 'Layout Styles: Tabular',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=tabular&sample=tabular',
      summary: `Presents yFiles' tabular layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' component layout algorithm and its other layout
       styles.
       Tabular layouts arrange elements in rows and columns.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-tabular.png',
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
      summary: `Presents yFiles' label placement algorithm and its other layout styles.`,
      description: `This demo presents yFiles' label placement algorithm and its other layout
       styles.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the algorithm to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-labeling.png',
      tags: ['label placement'],
      keywords: ['layout styles samples', 'generic labeling', 'preferred placement']
    },
    {
      id: 'layout-styles-partial',
      name: 'Layout Styles: Partial',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=partial',
      summary: `Presents yFiles' partial layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' component layout algorithm and its other layout
       styles.
       Partial layouts are particularly useful for incremental scenarios where new elements should
       be added to an existing diagram layout.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      thumbnailPath: 'resources/image/layoutstyles-partial.png',
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
      demoPath: 'showcase/bpmn/',
      summary:
        'An interactive business process diagram editor with BPMN node styles and a special layout algorithm.',
      description: `This example of an interactive editor for business process diagrams features node styles
       that follow the BPMN 2.0 spec and a special layout algorithm. Also, the app shows UI elements
       like a context menu, tooltips, a drag and drop palette, and more. Browse the sample graphs
       to see all diagram features in action.`,
      category: 'showcase',
      thumbnailPath: 'resources/image/bpmneditor.png',
      tags: ['style', 'layout', 'interaction'],
      keywords: [
        'context menu',
        'data management',
        'dnd',
        'drag and drop',
        'notable style',
        'overview',
        'palette',
        'ports'
      ]
    },
    {
      id: 'organization-chart',
      name: 'Organization Chart',
      demoPath: 'showcase/orgchart/',
      summary:
        'An interactive viewer for organization charts with adaptive styles and automatic layout.',
      description: `This is a demo of an interactive viewer for organization charts. Start with an overview of the
       company, and zoom in on employees to see how the adaptive styles gradually reveal more information.
       Hide and show departments or teams to focus on what you want to see, while yFiles' tree layout
       algorithm ensure that the chart is always properly arranged.`,
      category: 'showcase',
      thumbnailPath: 'resources/image/interactiveorgchart.png',
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
        'data management',
        'level of detail'
      ]
    },
    {
      id: 'process-mining',
      name: 'Process Mining',
      demoPath: 'showcase/processmining/',
      summary: 'Shows how to create an animated visualization of a process flow.',
      description: `This demo shows an animated visualization of a process flow.
       Its diagram shows how entities move through the steps of a processing pipeline. A heat map in
       the background of the diagram shows which elements in the graph are nearing their capacity
       limit. Hardware-accelerated WebGL rendering ensures that all animations and transitions run
       smoothly.`,
      category: 'showcase',
      thumbnailPath: 'resources/image/processmining.png',
      tags: ['webgl', 'animation', 'heatmap'],
      keywords: ['v2.3.0.2', 'notable style', 'data analysis']
    },
    {
      id: 'company-ownership',
      name: 'Company Ownership Chart',
      demoPath: 'showcase/company-ownership/',
      summary:
        'Interactively research the ownership of companies and their management relationships.',
      description: `Research company ownership and management relationships with this demo.
       The diagram illustrates both the ownership (shareholders, investors, etc.) and management
       relationships between business entities.
       To focus on different aspects, nodes can be displayed in two ways: Either with different
       shapes and colors depending on their type, or as a tabular view of the most relevant properties.`,
      category: 'showcase',
      thumbnailPath: 'resources/image/company-ownership.png',
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
      demoPath: 'view/ganttchart/',
      summary: 'An editor for Gantt charts.',
      category: 'view',
      thumbnailPath: 'resources/image/ganttchart.png',
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
      demoPath: 'showcase/frauddetection/',
      summary: 'Example of a fraud detection application for time-dependent data.',
      description: `This sample app demonstrates how to create a fraud detection application with
       yFiles. It features two use cases, first-party bank fraud and insurance fraud.
       Typically, the data in such use cases is time-dependent: It is not only important which
       entities interact with each other, but also when they do so. The application supports this
       type of analysis with a timeline component that allows you to interactively restrict the
       graph to time periods of interest.`,
      category: 'showcase',
      thumbnailPath: 'resources/image/fraud-detection.png',
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
      demoPath: 'showcase/isometricdrawing/',
      summary: 'Displays graphs in 3D using an freely adjustable projection and WebGL rendering.',
      description: `This demo displays graphs in 3D using an freely adjustable projection, adding an
       extra dimension to the visualization. This can be used to show a property of the business
       data as height, or just to look nice.
       The full range of interactions supported by yFiles is available in this demo. In addition,
       each node has a special handle at its top. Use this handle to change the height of the node.`,
      category: 'showcase',
      thumbnailPath: 'resources/image/isometric-drawing.png',
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
      demoPath: 'showcase/networkmonitoring/',
      summary: 'Example of a monitoring tool for computer networks.',
      description: `An exemplary computer network monitoring app. Watch the traffic flowing through the network.
       The network consists of PCs, notebooks, tablets, servers, databases and routers. The color of
       a connection depicts its traffic load and changes from green to yellow to red. You can inspect
       the load history in an device's pop-up panel. The bar charts in these popups are created with D3.js.`,
      category: 'showcase',
      thumbnailPath: 'resources/image/networkmonitoring.png',
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
      demoPath: 'showcase/metaballgroups/',
      summary: 'Shows how to render metaball-like background visualizations.',
      category: 'showcase',
      thumbnailPath: 'resources/image/metaballgroups.png',
      tags: ['background', 'webgl'],
      keywords: ['v2.2.0.0', 'overlapping', 'heatmap', 'data analysis']
    },
    {
      id: 'map',
      name: 'Map',
      demoPath: 'showcase/map/',
      summary: 'Displays a graph on top of an interactive map.',
      description: `This demo displays a yFiles graph on top of an interactive
       <a href="https://leafletjs.com/">Leaflet map</a>.
       Initially, the map contains only the most frequently used airports. As you zoom in, more
       airports and connections are added to the graph. Instant translation between geodetic and
       Cartesian coordinates keeps the graph and map in sync as you zoom and pan.`,
      category: 'showcase',
      thumbnailPath: 'resources/image/map.png',
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
      demoPath: 'showcase/graph-wizard-for-flowchart/',
      summary: 'Customizes defaults and input gestures to support fast creation of flowcharts.',
      category: 'showcase',
      thumbnailPath: 'resources/image/graphwizard-flowchart.png',
      tags: ['wizard', 'flowchart'],
      keywords: ['v2.4.0.4', 'flow', 'shapes', 'layout', 'input', 'button', 'data management']
    },
    {
      id: 'flowchart-editor',
      name: 'Flowchart Editor',
      demoPath: 'showcase/flowchart/',
      summary:
        'An editor for Flowchart diagrams that features interactive editing, flowchart node styles, and automatic layout.',
      category: 'showcase',
      thumbnailPath: 'resources/image/flowchart-editor.png',
      tags: ['style', 'layout', 'drag and drop'],
      keywords: ['hierarchic', 'palette', 'dnd', 'data management']
    },
    {
      id: 'uml-editor',
      name: 'UML Editor',
      demoPath: 'showcase/uml/',
      summary:
        'An editor for UML diagrams with a tailored UML node style, automatic layout, and a quick way to create new edges with the mouse or touch.',
      category: 'showcase',
      thumbnailPath: 'resources/image/uml-editor.png',
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
      demoPath: 'showcase/decisiontree/',
      summary:
        'An interactive Decision Tree component that lets you design and explore your own decision graphs.',
      category: 'showcase',
      thumbnailPath: 'resources/image/decisiontree.png',
      tags: ['layout', 'interaction'],
      keywords: ['hierarchic', 'context menu', 'data management']
    },
    {
      id: 'mindmap-editor',
      name: 'Mindmap Editor',
      demoPath: 'showcase/mindmap/',
      summary:
        'A Mindmap editor with a tailored node style, custom user interaction, and a specialized layoutthat automatically arranges new entries.',
      category: 'showcase',
      thumbnailPath: 'resources/image/mindmap.png',
      tags: ['style', 'layout', 'interaction'],
      keywords: ['context menu', 'tree', 'structures', 'labels', 'notable style']
    },
    {
      id: 'sankey-diagram',
      name: 'Sankey Diagram',
      demoPath: 'layout/sankey/',
      summary:
        'A diagram used for visualizing flow information in which the thickness of the edges is proportional to the flow quantity.',
      category: 'layout',
      thumbnailPath: 'resources/image/sankey.png',
      tags: ['edge thickness', 'style', 'layout'],
      keywords: ['context menu', 'hierarchic', 'generic labeling', 'labels', 'data analysis']
    },
    {
      id: 'tree-of-life',
      name: 'Tree of Life',
      demoPath: 'showcase/tree-of-life/',
      summary: 'An interactive radial dendrogram visualization of the Tree of Life.',
      description: `An interactive radial dendrogram visualization of the Tree of Life. The demo
       dataset is incomplete and contains 30,000 of the more than 2.3 million species
       that have lived on Earth.
       For better interaction and rendering performance, WebGL2 is used to render the graph
       items.`,
      category: 'showcase',
      thumbnailPath: 'resources/image/tree-of-life.png',
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
      demoPath: 'layout/treemap/',
      summary: 'Shows disk usage of a directory tree with the Tree Map layout.',
      category: 'layout',
      thumbnailPath: 'resources/image/treemap.png',
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
      demoPath: 'showcase/tag-cloud/',
      summary: 'Shows how to create a Tag Cloud.',
      category: 'showcase',
      thumbnailPath: 'resources/image/tag-cloud.png',
      tags: ['layout', 'style'],
      keywords: ['v2.4.0.4', 'words', 'components', 'labels']
    },
    {
      id: 'critical-path-analysis',
      name: 'Critical Path Analysis (CPA)',
      demoPath: 'analysis/criticalpathanalysis/',
      summary: 'Shows how to perform critical path analysis in project management.',
      category: 'analysis',
      thumbnailPath: 'resources/image/criticalpathanalysis.png',
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
      demoPath: 'showcase/logicgates/',
      summary: 'An editor for networks of logic gates, with tailored automatic layout.',
      category: 'showcase',
      thumbnailPath: 'resources/image/logicgates.png',
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
      demoPath: 'showcase/graphanalysis/',
      summary: `Showcases yFiles' algorithms that help analyzing the structure of a graph, such as shortest paths, flows, centrality measures`,
      description: `This demo showcases yFiles' algorithms that help analyzing the structure of a
       graph, such as shortest paths, flows, and centrality measures.
       Explore a broad range of pre-built sample graphs, or interactively change the graph and see
       the result update in real time.`,
      category: 'showcase',
      thumbnailPath: 'resources/image/graphanalysis.png',
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
      demoPath: 'layout/hierarchic-nesting/',
      summary: 'The hierarchic layout nicely expands and collapses sub-graphs organized in groups.',
      category: 'layout',
      thumbnailPath: 'resources/image/hierarchicgrouping.png',
      tags: ['layout', 'hierarchic', 'animation'],
      keywords: ['overview', 'folding', 'hide', 'grouping']
    },
    {
      id: 'folding-with-layout',
      name: 'Folding With Layout',
      demoPath: 'layout/foldingwithlayout/',
      summary:
        'Shows how an automatic layout makes space for opening groups and reclaims the space of closing groups.',
      category: 'layout',
      thumbnailPath: 'resources/image/foldingwithlayout.png',
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
      demoPath: 'showcase/large-graphs/',
      summary:
        'Shows how to display large graphs with both good performance in WebGL2 and high quality in SVG.',
      category: 'showcase',
      thumbnailPath: 'resources/image/large-graphs.png',
      tags: ['performance', 'webgl'],
      keywords: ['v2.4.0.0', 'rendering', 'large', 'huge', 'webgl2', 'svg', 'data management']
    },
    {
      id: 'large-graph-aggregation',
      name: 'Large Graph Aggregation',
      demoPath: 'showcase/largegraphaggregation/',
      summary:
        'Shows how to use the smart node aggregation for drill-down exploration of a large graph.',
      description: `This demo implements an interactive explorer for large data sets.
       The yFiles NodeAggregation algorithm first creates a hierarchical clustering of the data to
       reduce it to a manageable size. Then, starting from a few parent groups, you can
       interactively dive into the data.
       When expanding and merging groups, yFiles automatic layout algorithms ensure that you don't
       lose track and everything is always nicely arranged.`,
      category: 'showcase',
      thumbnailPath: 'resources/image/largegraphaggregation.png',
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
      demoPath: 'application-features/interactiveaggregation/',
      summary:
        'Shows how to analyze a graph by interactively aggregating nodes with common properties.',
      category: 'application-features',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/interactiveaggregation.png',
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
      demoPath: 'view/large-tree/',
      summary: 'Shows a tree graph, where a large number of nodes can be added interactively.',
      description: `This demo shows the use of WebGL2 as a rendering technique for displaying very
       large graphs with high performance. Starting from a small tree graph, you can add more layers
       of children to the graph, up to a maximum of 250,000 nodes.
       The yFiles tree layout algorithm ensures that the graph is nicely laid out. Animations
       smoothly transition the graph to the new state.`,
      category: 'view',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/large-tree.png',
      tags: ['performance', 'webgl', 'interaction'],
      keywords: ['v2.4.0.0', 'rendering', 'large', 'huge', 'webgl2', 'svg', 'collapse']
    },
    {
      id: 'collapsible-trees',
      name: 'Collapsible Trees',
      demoPath: 'view/collapse/',
      summary: 'Shows interactive collapsing and expanding of subtrees of a graph.',
      category: 'view',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/collapsibletree.png',
      tags: ['layout', 'interaction', 'animation'],
      keywords: ['hierarchic', 'organic', 'tree', 'balloon', 'filtering', 'hide', 'collapse']
    },
    {
      id: 'rendering-optimizations',
      name: 'Rendering Optimizations',
      demoPath: 'view/rendering-optimizations/',
      summary: 'Illustrates optimizations of the rendering performance for large graphs.',
      category: 'view',
      thumbnailPath: 'resources/image/rendering-optimizations.png',
      tags: ['performance', 'canvas', 'webgl'],
      keywords: ['v2.4.0.0', 'fps', 'rendering', 'large', 'huge', 'webgl2']
    },
    {
      id: 'neighborhood-view',
      name: 'Neighborhood View',
      demoPath: 'showcase/neighborhood/',
      summary: 'Shows the neighborhood of the currently selected node alongside the graph.',
      category: 'showcase',
      thumbnailPath: 'resources/image/neighborhoodview.png',
      tags: ['layout', 'interaction'],
      keywords: ['hierarchic', 'copy', 'detail', 'data analysis', 'data management']
    },
    {
      id: 'neighborhood-circles',
      name: 'Neighborhood Circles',
      demoPath: 'showcase/neighborhood-circles/',
      summary: 'Shows the neighborhood of selected nodes arranged on concentric circles.',
      category: 'showcase',
      thumbnailPath: 'resources/image/neighborhood-circles.png',
      tags: ['layout', 'interaction'],
      keywords: ['v2.6.0.0', 'radial', 'copy', 'detail', 'data analysis', 'data management']
    },
    {
      id: 'contextual-toolbar',
      name: 'Contextual Toolbar',
      demoPath: 'view/contextualtoolbar/',
      summary:
        'Shows a contextual toolbar for the current selection that enables fast and easy style changes.',
      category: 'view',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/contextualtoolbar.png',
      tags: ['interaction', 'overlay'],
      keywords: ['v2.1.0.2', 'html', 'popup', 'context menu']
    },
    {
      id: 'magnifying-glass',
      name: 'Magnifying Glass',
      demoPath: 'input/magnifying-glass/',
      summary: "Shows a floating lens that magnifies the cursor's surroundings.",
      category: 'input',
      thumbnailPath: 'resources/image/magnifying-glass.png',
      tags: ['interaction', 'input'],
      keywords: ['v2.4.0.5', 'magnifier ', 'lens', 'zoom', 'input mode']
    },
    {
      id: 'css-item-style',
      name: 'CSS Item Style',
      demoPath: 'style/css-item-style/',
      summary: 'Shows how to style and animate graph items with CSS.',
      description: `Shows how to style and animate graph items with CSS. CSS styling makes it
       especially easy to animate changes in the state of diagram items, but can also be used for
       permanent effects.
       The demo shows the graph and its styles side-by-side, and instantly applies style changes
       to the corresponding items.`,
      category: 'style',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/css-item-style.png',
      tags: ['css', 'animation', 'style'],
      keywords: ['v2.6.0.0', 'stylesheets', 'transition', 'fading', 'fade-out']
    },
    {
      id: 'default-label-style',
      name: 'Default Label Style',
      demoPath: 'style/default-label-style/',
      summary: 'Shows the features of the DefaultLabelStyle class.',
      category: 'style',

      thumbnailPath: 'resources/image/default-label-style.png',
      tags: ['style', 'labels'],
      keywords: ['v2.5.0.0', 'library style', 'style options']
    },
    {
      id: 'rectangle-node-style',
      name: 'Rectangle Node Style',
      demoPath: 'style/rectangle-node-style/',
      summary:
        'Shows the different node shapes that can be implemented with the RectangleNodeStyle class.',
      category: 'style',
      thumbnailPath: 'resources/image/rectangle-node-style.png',
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
      demoPath: 'style/shape-node-style/',
      summary: 'Shows the features of the ShapeNodeStyle class.',
      category: 'style',
      thumbnailPath: 'resources/image/shape-node-style.png',
      tags: ['style', 'nodes'],
      keywords: ['v2.5.0.0', 'library style', 'style options']
    },
    {
      id: 'group-node-style',
      name: 'Group Node Style',
      demoPath: 'style/group-node-style/',
      summary:
        'Shows the group and folder node visualization options offered by the GroupNodeStyle class.',
      category: 'style',
      thumbnailPath: 'resources/image/group-node-style.png',
      tags: ['style', 'nodes', 'webgl2'],
      keywords: ['v2.5.0.0', 'library style', 'style options']
    },
    {
      id: 'arrow-node-style',
      name: 'Arrow Node Style',
      demoPath: 'style/arrow-node-style/',
      summary: 'Shows the features of the ArrowNodeStyle class.',
      category: 'style',
      thumbnailPath: 'resources/image/arrow-node-style.png',
      tags: ['style', 'nodes', 'arrows'],
      keywords: ['v2.5.0.0', 'library style', 'style options']
    },
    {
      id: 'arrow-edge-style',
      name: 'Arrow Edge Style',
      demoPath: 'style/arrow-edge-style/',
      summary: 'Shows the features of the ArrowEdgeStyle class.',
      category: 'style',
      thumbnailPath: 'resources/image/arrow-edge-style.png',
      tags: ['style', 'edges', 'arrows'],
      keywords: ['v2.5.0.0', 'library style', 'style options']
    },
    {
      id: 'webgl-animations',
      name: 'WebGL2 Animations',
      demoPath: 'style/webgl-animations/',
      summary: 'Shows howto use WebGL2 animations to highlight interesting parts of a graph.',
      category: 'style',
      thumbnailPath: 'resources/image/webgl-animations.png',
      tags: ['animation', 'webgl2'],
      keywords: ['v2.4.0.0', 'v2.5.0.0']
    },
    {
      id: 'webgl-label-fading',
      name: 'WebGL2 Label Fading',
      demoPath: 'view/webgl-label-fading/',
      summary:
        'Shows how to achieve a simple level of detail effect by fading in/out labels at a certain zoom value using WebGL2 rendering.',
      category: 'view',
      thumbnailPath: 'resources/image/webgl-label-fading.png',
      tags: ['webgl'],
      keywords: ['v2.6.0.0', 'rendering', 'webgl2', 'level of detail', 'LOD', 'fading']
    },
    {
      id: 'clustering-algorithms',
      name: 'Clustering Algorithms',
      demoPath: 'analysis/clustering/',
      summary:
        'Showcases a selection of clustering algorithms such as edge betweenness, k-means, hierarchical and biconnected components clustering.',
      category: 'analysis',
      thumbnailPath: 'resources/image/clustering.png',
      tags: ['analysis'],
      keywords: ['k-means', 'hierarchical', 'voronoi', 'dendrogram', 'background', 'data analysis']
    },
    {
      id: 'intersection-detection',
      name: 'Intersection Detection',
      demoPath: 'analysis/intersection-detection/',
      summary: 'Shows how to compute and highlight intersections between graph items.',
      category: 'analysis',
      thumbnailPath: 'resources/image/intersection-detection.png',
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
      demoPath: 'analysis/networkflows/',
      summary:
        'Presents three network flow graph analysis algorithms that are applied on a network of water pipes.',
      category: 'analysis',
      thumbnailPath: 'resources/image/networkflows.png',
      tags: ['analysis', 'style'],
      keywords: ['network flows', 'maximum', 'minimum', 'cuts', 'labels', 'data management']
    },
    {
      id: 'transitivity',
      name: 'Transitivity',
      demoPath: 'analysis/transitivity/',
      summary:
        'Shows how transitivity graph analysis algorithms can be applied to solve reachability problems.',
      category: 'analysis',
      thumbnailPath: 'resources/image/transitivity.png',
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
      demoPath: 'view/grapheditor/',
      summary: 'Shows the graph editing features of the graph component.',
      category: 'view',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/simpleeditor.png',
      tags: ['interaction'],
      keywords: ['context menu', 'groups', 'folding', 'overview', 'Labels']
    },
    {
      id: 'valid-begin-cursors',
      name: 'Valid Begin Cursors',
      demoPath: 'input/valid-begin-cursors/',
      summary:
        'Shows how various cursors can be used to indicate valid gestures at the current location.',
      category: 'input',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/valid-begin-cursors.png',
      tags: ['interaction'],
      keywords: ['v2.5.0.0', 'cursors', 'marquee', 'lasso', 'viewport', 'tooltips']
    },
    {
      id: 'table-editor',
      name: 'Table Editor',
      demoPath: 'application-features/tableeditor/',
      summary:
        'Shows the support for diagrams that are organized in a tabular way, for example in a grid or a swimlane layout.',
      category: 'application-features',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/tableeditor.png',
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
      demoPath: 'view/graphviewer/',
      summary: 'Displays sample graphs from various application domains.',
      category: 'view',
      thumbnailPath: 'resources/image/graphviewer.png',
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
      demoPath: 'view/htmlpopup/',
      summary:
        'Shows HTML pop-up panels that displays additional information about a clicked node or edge.',
      category: 'view',
      thumbnailPath: 'resources/image/htmlpopup.png',
      tags: ['interaction', 'overlay'],
      keywords: ['html popups', 'data panel', 'tool tips', 'structures', 'details']
    },
    {
      id: 'structure-view',
      name: 'Structure View',
      demoPath: 'view/structureview/',
      summary: 'A tree list component that shows the nesting of the groups and nodes.',
      category: 'view',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/structureview.png',
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
      demoPath: 'view/renderingorder/',
      summary: 'Shows different rendering order settings.',
      category: 'view',
      thumbnailPath: 'resources/image/renderingorder.png',
      tags: ['rendering', 'z-order', 'grouping'],
      keywords: ['hierarchic nesting', 'ports', 'labels', 'groups']
    },
    {
      id: 'z-order',
      name: 'Z-Order',
      demoPath: 'view/zorder/',
      summary:
        'Shows how to adjust the z-order of graph elements and to keep this z-order consistent.',
      category: 'view',
      thumbnailPath: 'resources/image/zorder.png',
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
      demoPath: 'application-features/rotatablenodes/',
      summary: 'Shows nodes that can be rotated with the mouse or touch.',
      category: 'application-features',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/RotatableNodes.png',
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
      demoPath: 'input/touchcustomization/',
      summary: 'Shows how a graph editor application can be optimized for touch devices.',
      category: 'input',
      thumbnailPath: 'resources/image/custom_touch_interaction.png',
      tags: ['interaction', 'mobile'],
      keywords: ['v2.1.0.0', 'palette', 'drag and drop', 'context menu', 'move', 'dnd']
    },
    {
      id: 'deep-zoom',
      name: 'Deep Zoom',
      demoPath: 'view/deep-zoom/',
      summary:
        'Seamlessly zoom into the contents of deeply nested group nodes, similar to "deep zoom" for images',
      category: 'view',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/deep-zoom.png',
      tags: ['view', 'styles', 'groups'],
      keywords: ['v2.5.0.2', 'group', 'group style', 'viewport', 'folding', 'zoom', 'content']
    },
    {
      id: 'arrange-objects',
      name: 'Arrange Objects',
      demoPath: 'view/arrange-objects/',
      summary: 'Shows simple operations for aligning and distributing nodes.',
      category: 'view',
      thumbnailPath: 'resources/image/arrange-objects.png',
      tags: ['viewer'],
      keywords: ['v2.4.0.4', 'arrange', 'align nodes', 'distribute nodes']
    },
    {
      id: 'custom-styles',
      name: 'Custom Styles',
      demoPath: 'style/customstyles/',
      summary:
        'Shows how to create custom styles for nodes, edges, labels, ports, and edge arrows.',
      category: 'style',
      thumbnailPath: 'resources/image/customstyles.png',
      tags: ['style', 'grouping'],
      keywords: ['folding', 'labels', 'ports']
    },
    {
      id: 'template-styles',
      name: 'Template Styles',
      demoPath: 'style/templatestyles/',
      summary: 'Shows SVG template styles for nodes, labels and ports.',
      category: 'style',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/templatestyles.png',
      tags: ['style', 'data binding'],
      keywords: ['v2.1.0.2', 'svg', 'data panel', 'templates', 'notable style']
    },
    {
      id: 'string-template-node-style',
      name: 'String Template Node Style',
      demoPath: 'style/string-template-node-style/',
      summary: 'Presents a versatile and customizable template node style.',
      category: 'style',
      thumbnailPath: 'resources/image/string-template-node-style.png',
      tags: ['style', 'template'],
      keywords: ['v2.4.0.4', 'data bindings', 'data panel']
    },
    {
      id: 'react-template-node-style',
      name: 'React JSX Component Style',
      demoPath: 'style/react-template-node-style/',
      summary:
        'Presents a versatile and easily customizable template node style based on JSX and React.',
      category: 'style',
      thumbnailPath: 'resources/image/generic-template-style.png',
      tags: ['style', 'template', 'react', 'jsx'],
      keywords: ['v2.5.0.2', 'data bindings', 'data panel', 'tree', 'htmlvisual']
    },
    {
      id: 'vue-template-node-style',
      name: 'Vue Template Node Style',
      demoPath: 'style/vue-template-node-style/',
      summary: 'Presents a versatile and easily customizable template node style based on Vue.',
      category: 'style',
      thumbnailPath: 'resources/image/generic-template-style.png',
      tags: ['style', 'template', 'vuejs'],
      keywords: ['v2.1.0.0', 'data bindings', 'data panel', 'tree']
    },
    {
      id: 'lit-template-node-style',
      name: 'Lit Template Node Style',
      demoPath: 'style/lit-template-node-style/',
      summary:
        'Presents a versatile and easily customizable template node style based on the Lit templating framework.',
      category: 'style',
      thumbnailPath: 'resources/image/lit-template-node-style.png',
      tags: ['style', 'template', 'lit'],
      keywords: ['v2.5.0.2', 'data bindings', 'data panel', 'conditional', 'rendering']
    },
    {
      id: 'webgl-styles',
      name: 'WebGL2 Styles',
      demoPath: 'style/webgl-styles/',
      summary: 'Shows the various graph item styles available in WebGL2 rendering.',
      description: `This demo shows the available styles for nodes, edges and labels in WebGL2
       rendering mode. You can interactively change each major style property in a settings panel.
       Due to the technical limitations of WebGL2, the visualization of graph items in this
       rendering mode is not fully configurable, but limited to the provided properties. This is
       different from SVG, where you can use any SVG feature and snippet for visualization.`,
      category: 'style',
      thumbnailPath: 'resources/image/webgl-styles.png',
      tags: ['style', 'webgl2'],
      keywords: ['v2.4.0.0', 'v2.5.0.0', 'styles', 'notable style']
    },
    {
      id: 'webgl-selection-styles',
      name: 'WebGL2 Selection Styles',
      demoPath: 'style/webgl-selection-styles/',
      summary: 'Shows the possible styling configurations for selections in WebGL2 rendering.',
      category: 'style',
      thumbnailPath: 'resources/image/webgl-selection-styles.png',
      tags: ['style', 'webgl2', 'selection'],
      keywords: ['v2.5.0.0', 'styles']
    },
    {
      id: 'css-styling',
      name: 'CSS Styling',
      demoPath: 'style/cssstyling/',
      summary: 'Shows how to style indicators and other templates.',
      category: 'style',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/cssstyling.png',
      tags: ['css', 'indicators', 'themes'],
      keywords: ['stylesheets', 'v2.2.0.0', 'labels', 'notable style']
    },
    {
      id: 'theme-variants',
      name: 'Theme Variants',
      demoPath: 'style/theme-variants/',
      summary: 'Shows various interaction visualization themes simultaneously.',
      category: 'style',
      thumbnailPath: 'resources/image/theming.png',
      tags: ['theme', 'handle', 'color'],
      keywords: ['v2.5.0.0']
    },
    {
      id: 'isometric-bar-chart-style',
      name: 'Isometric Bar Chart Node Style',
      demoPath: 'style/isometric-bar-chart-style/',
      summary: 'Shows how a node style can be augmented with isometric bars.',
      category: 'style',
      thumbnailPath: 'resources/image/isometric-bar-chart-style.png',
      tags: ['styles', 'projection', 'bars'],
      keywords: ['v2.4.0.4', 'organic', 'labels', '3D', 'isometric', 'bars', 'notable style']
    },
    {
      id: 'd3-chart-nodes',
      name: 'd3 Chart Nodes',
      demoPath: 'style/d3chartnodes/',
      summary: 'Presents a node style that visualizes dynamic data with d3.js.',
      category: 'style',
      thumbnailPath: 'resources/image/d3chartnodes.png',
      tags: ['style', 'sparklines', 'bars'],
      keywords: ['v2.2.0.0', 'd3js', 'd3.js']
    },
    {
      id: 'editable-path-style',
      name: 'Editable Path Node Style',
      demoPath: 'style/editablepathstyle/',
      summary: 'Shows a path-based node style whose control points can be moved by users.',
      category: 'style',
      thumbnailPath: 'resources/image/editablepath.png',
      tags: ['style', 'path', 'editing'],
      keywords: ['v2.3.0.2', 'handles', 'general paths', 'interaction', 'editing']
    },
    {
      id: 'webgl-icon-node',
      name: 'WebGL2 Icon Node',
      demoPath: 'style/webgl-icon-node/',
      summary: 'Shows how to render icon nodes with WebGL2.',
      category: 'style',
      thumbnailPath: 'resources/image/webgl-icon-node.png',
      tags: ['style', 'webgl2'],
      keywords: ['v2.4.0.0', 'notable style']
    },
    {
      id: 'clickable-style-decorator',
      name: 'Clickable Style Decorator',
      summary: 'Illustrates an approach for handling clicks on specific areas of the style.',
      demoPath: 'style/clickable-style-decorator/',
      thumbnailPath: 'resources/image/clickable-style-decorator.png',
      category: 'style',
      distributionType: 'needs-layout',
      tags: ['interaction', 'icon'],
      keywords: [
        'NodeDecorator',
        'ILookupDecorator',
        'NodeStyleBase',
        'images',
        'events',
        'regions',
        'input mode'
      ]
    },
    {
      id: 'composite-node-style',
      name: 'Composite Node Style',
      summary: 'Shows how to combine node visualizations from several styles.',
      demoPath: 'style/composite-node-style/',
      thumbnailPath: 'resources/image/composite-node-style.png',
      category: 'style',
      tags: ['style', 'icon'],
      keywords: ['v2.4.0.4', 'composite']
    },
    {
      id: 'level-of-detail-style',
      name: 'Level of Detail Style',
      summary: 'Shows a node style that hides details when zooming out.',
      demoPath: 'style/level-of-detail-style/',
      thumbnailPath: 'resources/image/level-of-detail-style.png',
      category: 'style',
      tags: ['style', 'performance'],
      keywords: ['v2.2.0.0', 'data binding', 'readability', 'hide', 'rendering', 'sketch']
    },
    {
      id: 'list-node',
      name: 'List Node',
      demoPath: 'view/list-node/',
      summary: 'Shows a node which contains re-arrangeable rows.',
      category: 'view',
      thumbnailPath: 'resources/image/listnode.png',
      tags: ['interaction', 'style', 'table'],
      keywords: ['v2.4.0.4', 'rows', 'tables']
    },
    {
      id: 'data-table',
      name: 'Data Table',
      demoPath: 'style/datatable/',
      summary: 'Shows a node style and a label style that display data in a tabular fashion.',
      category: 'style',
      thumbnailPath: 'resources/image/datatable.png',
      tags: ['style', 'label'],
      keywords: ['v2.6.0.0', 'data table', 'structures', 'data management', 'html', 'htmlvisual']
    },
    {
      id: 'bezier-edge-style',
      name: 'Bezier Edge Style',
      demoPath: 'style/bezieredgestyle/',
      summary: 'Shows how to use the curved edge style consisting of Bezier splines.',
      category: 'style',
      thumbnailPath: 'resources/image/bezieredgestyle.png',
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
      demoPath: 'style/directed-edge-label/',
      summary:
        'Shows label styles displaying arrows that always point to the source or target port.',
      category: 'style',
      thumbnailPath: 'resources/image/directed-edge-label.png',
      tags: ['style', 'label', 'edge'],
      keywords: ['v2.4.0.4', 'edges', 'directed', 'labels']
    },
    {
      id: 'markup-labels',
      name: 'Markup Label',
      summary:
        'Markup label style lets you use html-like markup to structure and style the label text.',
      demoPath: 'style/markup-labels/',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/markuplabels.png',
      category: 'style',
      tags: ['style', 'label', 'markup'],
      keywords: ['v2.3.0.0', 'rich texts', 'styling', 'html', 'xml', 'color']
    },
    {
      id: 'markdown-label',
      name: 'Markdown Label',
      demoPath: 'style/markdownlabel/',
      summary: 'Use markdown to format the label text.',
      category: 'style',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/markdownlabel.png',
      tags: ['style', 'label', 'markdown'],
      keywords: ['v2.3.0.0', 'rich text', 'styling', 'html', 'markdown']
    },
    {
      id: 'rich-text-label',
      name: 'Rich Text Label',
      demoPath: 'style/richtextlabel/',
      summary: 'Edit markup labels with a WYSIWYG text editor.',
      category: 'style',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/richtextlabel.png',
      tags: ['style', 'label', 'rich text'],
      keywords: ['v2.3.0.0', 'styling', 'html', 'xml', 'markdown', 'markup', 'colors', 'wysiwyg']
    },
    {
      id: 'overview',
      name: 'Overview Styling',
      demoPath: 'view/overviewstyles/',
      summary: 'Shows several different rendering techniques and styles for the overview.',
      category: 'view',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/overview.png',
      tags: ['style', 'canvas'],
      keywords: ['v2.2.0.0', 'overview input mode', 'svg', 'labels']
    },
    {
      id: 'html-controls',
      name: 'HTML Controls',
      demoPath: 'style/html-controls/',
      summary: 'Shows how a custom HTML-based node style can be used to create interactive nodes.',
      category: 'style',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/html-controls.png',
      tags: ['style', 'label'],
      keywords: ['v2.6.0.0', 'html', 'responsive', 'htmlvisual']
    },
    {
      id: 'html-label-style',
      name: 'HTML Label Style',
      demoPath: 'style/html-label-style/',
      summary: 'Shows how HTML can be used for label rendering with a custom label style.',
      category: 'style',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/html-label-style.png',
      tags: ['style', 'label', 'htmlvisual'],
      keywords: ['v2.6.0.0']
    },
    {
      id: 'invariant-label-style',
      name: 'Zoom-invariant Label Style',
      demoPath: 'style/invariant-label/',
      summary: 'Shows label styles that are independent of the zoom level.',
      category: 'style',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/invariant-label.png',
      tags: ['style', 'label', 'zoom'],
      keywords: ['v2.2.0.2', 'size', 'fit']
    },
    {
      id: 'simple-arrow-style',
      name: 'Simple Arrow Style',
      demoPath: 'style/simple-arrow-style/',
      summary: 'Shows how to create a simple custom arrow for edges.',
      category: 'style',
      thumbnailPath: 'resources/image/simple-arrow-style.png',
      tags: ['style', 'arrow'],
      keywords: ['v2.5.0.2', 'styling', 'arrow', 'edge', 'custom']
    },
    {
      id: 'selection-styling',
      name: 'Selection Styling',
      demoPath: 'style/selectionstyling/',
      summary:
        'Shows customized selection painting of nodes, edges and labels by decorating these items with a corresponding\n      style.',
      category: 'style',
      thumbnailPath: 'resources/image/selectionstyling.png',
      tags: ['style', 'interaction'],
      keywords: ['selection styling', 'labels', 'notable style']
    },
    {
      id: 'style-decorators',
      name: 'Style Decorators',
      demoPath: 'style/styledecorators/',
      summary:
        'Shows how to create styles for nodes, edges, and labels that wrap existing styles and add visual decorators.',
      category: 'style',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/styledecorators.png',
      tags: ['style', 'decorators'],
      keywords: ['ports']
    },
    {
      id: 'edge-bundling',
      name: 'Edge Bundling',
      demoPath: 'layout/edgebundling/',
      summary:
        'Shows how edge bundling can be applied for reducing visual cluttering in dense graphs.',
      category: 'layout',
      thumbnailPath: 'resources/image/edgebundling.png',
      tags: ['style', 'curve', 'layout'],
      keywords: [
        'layoutfeatures',
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
      demoPath: 'showcase/chord-diagram/',
      summary: 'Shows a chord diagram that emphasizes the magnitude of connections between nodes.',
      category: 'showcase',
      thumbnailPath: 'resources/image/chord-diagram.png',
      tags: ['edge thickness', 'style', 'layout'],
      keywords: [
        'v2.4.0.4',
        'layoutfeatures',
        'chords',
        'arcs',
        'bezier',
        'curves',
        'notable style'
      ]
    },
    {
      id: 'chord-diagram-non-ribbon',
      name: 'Non-ribbon Chord Diagram',
      demoPath: 'showcase/chord-diagram-non-ribbon/',
      summary:
        'Shows a non-ribbon chord diagram that emphasizes the traceability of the connections.',
      category: 'showcase',
      thumbnailPath: 'resources/image/chord-diagram-non-ribbon.png',
      tags: ['style', 'layout', 'curve'],
      keywords: [
        'v2.5.0.2',
        'layoutfeatures',
        'chords',
        'arcs',
        'bezier',
        'curves',
        'notable style',
        'node types'
      ]
    },
    {
      id: 'arc-diagram',
      name: 'Arc Diagram',
      demoPath: 'layout/arc-diagram/',
      summary: 'Shows how to visualize a graph as an arc diagram.',
      category: 'layout',
      thumbnailPath: 'resources/image/arc-diagram.png',
      tags: ['layout', 'curve'],
      keywords: ['v2.4.0.4', 'layoutfeatures', 'arcs', 'bezier', 'networks', 'curves']
    },
    {
      id: 'maze-routing',
      name: 'Maze Routing',
      demoPath: 'layout/mazerouting/',
      summary: 'Shows how the automatic edge routing finds routes through a maze.',
      category: 'layout',
      thumbnailPath: 'resources/image/mazerouting.png',
      tags: ['layout', 'edge routing', 'polyline'],
      keywords: [
        'layoutfeatures',
        'edge router',
        'polyline router',
        'background',
        'layout',
        'data analysis'
      ]
    },
    {
      id: 'component-drag-and-drop',
      name: 'Component Drag and Drop',
      demoPath: 'input/componentdraganddrop/',
      summary:
        'A demo that shows how to clear space for a dropped component in an existing layout.',
      category: 'input',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/componentdraganddrop.png',
      tags: ['layout', 'component'],
      keywords: [
        'v2.3.0.0',
        'layoutfeatures',
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
      demoPath: 'layout/edgelabelplacement/',
      summary:
        'Shows how to place edge labels at the preferred location with a labeling algorithm.',
      category: 'layout',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/edgelabelplacement.png',
      tags: ['label placement'],
      keywords: [
        'layoutfeatures',
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
      demoPath: 'layout/nodelabelplacement/',
      summary:
        'Shows how to place node labels at the preferred location with a labeling algorithm.',
      category: 'layout',
      thumbnailPath: 'resources/image/nodelabelplacement.png',
      tags: ['label placement'],
      keywords: ['layoutfeatures', 'generic labeling', 'text', 'background']
    },
    {
      id: 'node-types',
      name: 'Node Types',
      demoPath: 'layout/nodetypes/',
      summary: 'Shows how different layout algorithms handle nodes with types.',
      category: 'layout',
      thumbnailPath: 'resources/image/nodetypes.png',
      tags: ['layout', 'node type'],
      keywords: [
        'v2.4.0.0',
        'v2.5.0.0',
        'layoutfeatures',
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
      demoPath: 'layout/interactive-hierarchic/',
      summary:
        'The incremental mode of the hierarchic layout style can fit new nodes and edges into the existing drawing.',
      category: 'layout',
      thumbnailPath: 'resources/image/incrementalhierarchic.png',
      tags: ['layout', 'hierarchic'],
      keywords: ['layoutfeatures', 'ports', 'background', 'incremental']
    },
    {
      id: 'interactive-edge-routing',
      name: 'Interactive Edge Routing',
      demoPath: 'layout/interactiveedgerouting/',
      summary: 'After each edit the edge paths are re-routed if necessary.',
      category: 'layout',
      thumbnailPath: 'resources/image/interactiveedgerouting.png',
      tags: ['layout', 'edge routing'],
      keywords: ['v2.4.0.0', 'layoutfeatures', 'interaction', 'edge router']
    },
    {
      id: 'edge-grouping',
      name: 'Edge Grouping',
      demoPath: 'layout/edgegrouping/',
      summary: 'The hierarchic layout can group the paths or ports of edges.',
      category: 'layout',
      thumbnailPath: 'resources/image/edgegrouping.png',
      tags: ['layout', 'hierarchic'],
      keywords: [
        'v2.1.0.3',
        'layoutfeatures',
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
      demoPath: 'layout/edgeroutergrouping/',
      summary: 'The EdgeRouter can group the paths or ports of edges.',
      category: 'layout',
      thumbnailPath: 'resources/image/edge-router-grouping.png',
      tags: ['layout', 'edge routing'],
      keywords: [
        'v2.2.0.2',
        'layoutfeatures',
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
      demoPath: 'layout/boundary-labeling/',
      summary: 'Shows how to configure organic layout for annotating points on a diagram.',
      category: 'layout',
      thumbnailPath: 'resources/image/boundary-labeling.png',
      tags: ['layout', 'organic', 'constraint'],
      keywords: [
        'v2.6.0.0',
        'layoutfeatures',
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
      demoPath: 'layout/height-profile/',
      summary: 'Shows how to configure organic layout to create height profile visualization',
      category: 'layout',
      thumbnailPath: 'resources/image/height-profile.png',
      tags: ['layout', 'organic', 'constraints'],
      keywords: [
        'v2.6.0.0',
        'layoutfeatures',
        'height',
        'labeling',
        'timeline',
        'time',
        'time-data'
      ]
    },
    {
      id: 'metabolic-pathways',
      name: 'Metabolic Pathways',
      demoPath: 'layout/metabolic-pathways/',
      summary: 'Shows how to configure organic layout for visualizing metabolic pathways.',
      category: 'layout',
      thumbnailPath: 'resources/image/metabolic-pathways.png',
      tags: ['layout', 'organic', 'constraint'],
      keywords: [
        'v2.6.0.0',
        'layoutfeatures',
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
      demoPath: 'layout/organic-substructures/',
      summary: 'Shows organic layout, and its substructures and node types features.',
      category: 'layout',
      thumbnailPath: 'resources/image/organic-substructures.png',
      tags: ['layout', 'organic', 'substructure', 'node type'],
      keywords: [
        'v2.4.0.0',
        'layoutfeatures',
        'clustering',
        'grouping',
        'similar',
        'data management'
      ]
    },
    {
      id: 'circular-substructures',
      name: 'Circular Substructures',
      demoPath: 'layout/circular-substructures/',
      summary: 'Shows circular layout, and its substructures and node types features.',
      category: 'layout',
      thumbnailPath: 'resources/image/circular-substructures.png',
      tags: ['layout', 'circular', 'substructure', 'node type'],
      keywords: ['v2.6.0.0', 'layoutfeatures']
    },
    {
      id: 'busrouting',
      name: 'Bus Routing',
      demoPath: 'layout/busrouting/',
      summary: 'Shows how to group edges in bus structures.',
      category: 'layout',
      thumbnailPath: 'resources/image/busrouting.png',
      tags: ['layout', 'edge routing', 'bus'],
      keywords: ['v2.4.0.0', 'layoutfeatures', 'edge router', 'edge groups', 'bus structures']
    },
    {
      id: 'fill-area-layout',
      name: 'Fill Area Layout',
      demoPath: 'layout/fillarealayout/',
      summary: 'Shows how to fill free space after deleting nodes.',
      category: 'layout',
      thumbnailPath: 'resources/image/fillarealayout.png',
      tags: ['layout', 'interactive layout'],
      keywords: ['v2.3.0.0', 'layoutfeatures', 'deletion', 'adjustment', 'interactive']
    },
    {
      id: 'clear-marquee-area',
      name: 'Clear Marquee Area',
      demoPath: 'layout/clearmarqueearea/',
      summary: 'Shows how to automatically keep a marquee area clear of graph elements.',
      category: 'layout',
      thumbnailPath: 'resources/image/clearmarqueearea.png',
      tags: ['layout', 'interactive layout'],
      keywords: [
        'v2.3.0.2',
        'layoutfeatures',
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
      demoPath: 'layout/clearrectanglearea/',
      summary:
        'Shows how to automatically keep a user-defined rectangular area clear of graph elements.',
      category: 'layout',
      thumbnailPath: 'resources/image/clearrectanglearea.png',
      tags: ['layout', 'interactive layout'],
      keywords: [
        'v2.3.0.2',
        'layoutfeatures',
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
      demoPath: 'layout/nodeoverlapavoiding/',
      summary:
        'Shows how an automatic layout can remove node overlaps while a user interactively edits a graph.',
      category: 'layout',
      thumbnailPath: 'resources/image/nodeoverlapavoiding.png',
      tags: ['layout', 'interactive layout'],
      keywords: [
        'v2.3.0.2',
        'layoutfeatures',
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
      demoPath: 'layout/node-alignment/',
      summary: 'Shows how to align nodes on horizontal and/or vertical lines.',
      category: 'layout',
      thumbnailPath: 'resources/image/node-alignment.png',
      tags: ['layout', 'interactive layout'],
      keywords: [
        'v2.6.0.0',
        'layoutfeatures',
        'node alignment',
        'snapping',
        'interactive',
        'drag',
        'drop'
      ]
    },
    {
      id: 'hierarchic-busstructures',
      name: 'Hierarchic Bus Structures',
      demoPath: 'layout/busstructures/',
      summary: 'Bus structures in the hierarchic layout result in more compact arrangements.',
      category: 'layout',
      thumbnailPath: 'resources/image/busstructures.png',
      tags: ['layout', 'hierarchic', 'bus'],
      keywords: ['v2.2.0.2', 'layoutfeatures', 'bus structures', 'orthogonal', 'compact']
    },
    {
      id: 'hierarchic-subcomponents',
      name: 'Hierarchic Subcomponents',
      demoPath: 'layout/subcomponents/',
      summary: 'The hierarchic layout can arrange subcomponents with different layout styles.',
      category: 'layout',
      thumbnailPath: 'resources/image/subcomponents.png',
      tags: ['layout', 'hierarchic'],
      keywords: ['v2.5.0.0', 'layoutfeatures', 'tree', 'organic', 'orthogonal']
    },
    {
      id: 'tabular-groups',
      name: 'Tabular Groups',
      summary: 'Shows how to configure the tabular groups feature of the hierarchical layout.',
      demoPath: 'layout/tabular-groups/',
      thumbnailPath: 'resources/image/tabular-groups.png',
      category: 'layout',
      tags: ['hierarchic', 'tabular', 'groups'],
      keywords: ['v2.5.0.0', 'layoutfeatures', 'layout', 'table', 'column', 'compact']
    },
    {
      id: 'critical-paths',
      name: 'Critical Paths',
      demoPath: 'layout/criticalpaths/',
      summary:
        'The hierarchic and tree layout styles can emphasize critical (important) paths by aligning their nodes.',
      category: 'layout',
      thumbnailPath: 'resources/image/CriticalPaths.png',
      tags: ['layout', 'hierarchic', 'tree'],
      keywords: ['layoutfeatures', 'data analysis']
    },
    {
      id: 'custom-layout-stage',
      name: 'Custom Layout Stage',

      summary:
        'Custom layout stages can be used to solve unique layout problems that are not adequately covered by existing layout algorithms.',
      demoPath: 'layout/custom-layout-stage/',
      thumbnailPath: 'resources/image/CustomLayoutStage.png',
      category: 'layout',
      tags: ['layout', 'layout stage'],
      keywords: [
        'v2.4.0.0',
        'layoutfeatures',
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
      demoPath: 'layout/splitedges/',
      summary:
        'Shows how to align edges at group nodes using RecursiveGroupLayout with HierarchicLayout.',
      category: 'layout',
      thumbnailPath: 'resources/image/splitedges.png',
      tags: ['layout', 'hierarchic', 'tree'],
      keywords: ['v2.1.0.3', 'layoutfeatures', 'context menu', 'recursive']
    },
    {
      id: 'partition-grid',
      name: 'Partition Grid',
      demoPath: 'layout/partitiongrid/',
      summary: 'Demonstrates the usage of a partition grid for hierarchic and organic layouts.',
      category: 'layout',
      thumbnailPath: 'resources/image/partitiongrid.png',
      tags: ['layout', 'partition grid', 'hierarchic', 'organic'],
      keywords: ['layoutfeatures', 'data management']
    },
    {
      id: 'simple-partition-grid',
      name: 'Simple Partition Grid',
      demoPath: 'layout/simplepartitiongrid/',
      summary: 'Shows how to create a simple partition grid.',
      category: 'layout',
      thumbnailPath: 'resources/image/simplePartitionGrid.png',
      tags: ['layout', 'partition grid', 'hierarchic'],
      keywords: ['v2.2.0.0', 'layoutfeatures']
    },
    {
      id: 'interactive-graph-restructuring',
      name: 'Interactive Graph Restructuring',
      demoPath: 'input/interactivegraphrestructuring/',
      summary: 'Shows how to interactively relocate subtrees from one parent to another.',
      category: 'input',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/interactivegraphrestructuring.png',
      tags: ['interactive layout', 'animation'],
      keywords: [
        'v2.3.0.0',
        'layoutfeatures',
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
      demoPath: 'layout/layerconstraints/',
      summary:
        'Shows how to use layer constraints to prescribe the node layering in hierarchic layouts.',
      category: 'layout',
      thumbnailPath: 'resources/image/layerconstraints.png',
      tags: ['layout', 'hierarchic'],
      keywords: ['layoutfeatures']
    },
    {
      id: 'sequence-constraints',
      name: 'Sequence Constraints',
      demoPath: 'layout/sequenceconstraints/',
      summary:
        'Shows how to use sequence constraints to prescribe the node sequencing in hierarchic layouts.',
      category: 'layout',
      thumbnailPath: 'resources/image/sequenceconstraints.png',
      tags: ['layout', 'hierarchic'],
      keywords: ['layoutfeatures']
    },
    {
      id: 'interactive-organic-layout',
      name: 'Interactive Organic Layout',
      demoPath: 'layout/interactiveorganic/',
      summary: "Shows the 'interactive organic' layout algorithm.",
      category: 'layout',
      thumbnailPath: 'resources/image/interactive-organic-layout.png',
      tags: ['layout', 'interactive layout'],
      keywords: ['layoutfeatures', 'organic', 'move']
    },
    {
      id: 'multi-page-layout',
      name: 'Multi-Page Layout',
      demoPath: 'layout/multipage/',
      summary:
        'Shows how to divide a large model graph into several smaller page graphs, for example to print to multiple pages.',
      category: 'layout',
      thumbnailPath: 'resources/image/multipage.png',
      tags: ['layout', 'hierarchic', 'tree'],
      keywords: [
        'layoutfeatures',
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
      demoPath: 'layout/tree/',
      summary: 'Shows how to use different node placer in TreeLayout.',
      category: 'layout',
      thumbnailPath: 'resources/image/treelayout.png',
      tags: ['layout', 'tree'],
      keywords: ['v2.2.0.2', 'layoutfeatures', 'node placers']
    },
    {
      id: 'partial-layout',
      name: 'Partial Layout',
      demoPath: 'layout/partial/',
      summary: 'Shows how to integrate new graph elements into an existing graph layout.',
      category: 'layout',
      thumbnailPath: 'resources/image/partiallayout.png',
      tags: ['layout', 'incremental', 'partial'],
      keywords: ['layoutfeatures', 'hierarchic', 'orthogonal', 'organic', 'circular', 'curves']
    },
    {
      id: 'bridges',
      name: 'Bridges',
      demoPath: 'view/bridges/',
      summary:
        'Shows the capabilities of the <code>BridgeManager</code> class for inserting bridges into edge paths.',
      category: 'view',
      thumbnailPath: 'resources/image/bridges.png',
      tags: ['line gaps', 'line jumps'],
      keywords: ['layoutfeatures', 'intersection', 'intersecting', 'groups']
    },
    {
      id: 'custom-edge-creation',
      name: 'Custom Edge Creation',
      demoPath: 'input/customedgecreation/',
      summary:
        'Shows how to provide directional ports and demonstrates interactive routing during edge creation.',
      category: 'input',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/customedgecreation.png',
      tags: ['layout', 'edge routing', 'interaction'],
      keywords: [
        'v2.2.0.2',
        'layoutfeatures',
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
      demoPath: 'layout/familytree/',
      summary: 'Shows how to visualize genealogical graphs (family trees).',
      category: 'layout',
      thumbnailPath: 'resources/image/family-tree.png',
      tags: ['layout', 'genealogy'],
      keywords: [
        'layoutfeatures',
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
      demoPath: 'view/edgetoedge/',
      summary: 'Shows edge-to-edge connections.',
      category: 'view',
      thumbnailPath: 'resources/image/edge_to_edge.png',
      tags: ['edge creation', 'interaction'],
      keywords: ['layoutfeatures', 'port candidate providers']
    },
    {
      id: 'graph-builder',
      name: 'Graph Builder',
      demoPath: 'databinding/graphbuilder/',
      summary:
        'Interactively builds and modifies a graph from JSON business data using class <code>GraphBuilder</code>.',
      category: 'data-binding',
      thumbnailPath: 'resources/image/graphbuilder.png',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchic', 'structures', 'labels', 'v2.3.0.0']
    },
    {
      id: 'tree-graph-builder',
      name: 'Tree Builder',
      demoPath: 'databinding/treebuilder/',
      summary:
        'Interactively builds and modifies a graph from JSON business data using class <code>TreeBuilder</code>.',
      category: 'data-binding',
      thumbnailPath: 'resources/image/treebuilder.png',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchic', 'structures', 'labels', 'v2.3.0.0']
    },
    {
      id: 'adjacency-graph-builder',
      name: 'Adjacency Graph Builder',
      demoPath: 'databinding/adjacencygraphbuilder/',
      summary:
        'Interactively builds and modifies a graph from JSON business data using class <code>AdjacencyGraphBuilder</code>.',
      category: 'data-binding',
      thumbnailPath: 'resources/image/adjacencygraphbuilder.png',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchic', 'structures', 'labels', 'v2.3.0.0']
    },
    {
      id: 'simple-graph-builder',
      name: 'Simple Graph Builder',
      demoPath: 'databinding/simplegraphbuilder/',
      summary:
        'Automatically builds a graph from JSON business data using <code>GraphBuilder</code>, <code>AdjacencyGraphBuilder</code> or <code>TreeBuilder</code>.',
      category: 'data-binding',
      thumbnailPath: 'resources/image/simplegraphbuilder.png',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchic', 'labels', 'v2.3.0.0']
    },
    {
      id: 'port-aware-graph-builder',
      name: 'Port-aware Graph Builder',
      demoPath: 'databinding/port-aware-graph-builder/',
      summary:
        'Builds a graph using <code>GraphBuilder</code> and connects the items to specific ports.',
      category: 'data-binding',
      thumbnailPath: 'resources/image/port-aware-graph-builder.png',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchic', 'ports', 'v2.5.0.0']
    },
    {
      id: 'port-aware-adjacency-graph-builder',
      name: 'Port-aware Adjacency Graph Builder',
      demoPath: 'databinding/port-aware-adjacency-graph-builder/',
      summary:
        'Builds a graph using <code>AdjacencyGraphBuilder</code> and connects the items to specific ports.',
      category: 'data-binding',
      thumbnailPath: 'resources/image/port-aware-adjacency-graph-builder.png',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchic', 'ports', 'v2.5.0.0']
    },
    {
      id: 'port-aware-tree-builder',
      name: 'Port-aware Tree Builder',
      demoPath: 'databinding/port-aware-tree-builder/',
      summary:
        'Builds a graph using <code>TreeBuilder</code> and connects the items to specific ports.',
      category: 'data-binding',
      thumbnailPath: 'resources/image/port-aware-tree-builder.png',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['tree', 'ports', 'v2.5.0.0']
    },
    {
      id: 'image-export',
      name: 'Image Export',
      demoPath: 'view/imageexport/',
      summary: 'Shows how to export the whole diagram or a part of it to a PNG image.',
      category: 'view',
      thumbnailPath: 'resources/image/export.png',
      tags: ['export', 'png', 'jpg'],
      keywords: ['jpeg', 'bitmap', 'save', 'handles']
    },
    {
      id: 'svg-export',
      name: 'SVG Export',
      demoPath: 'view/svgexport/',
      summary: 'Shows how to export the whole diagram or a part of it to an SVG image.',
      category: 'view',
      thumbnailPath: 'resources/image/export.png',
      tags: ['export', 'svg', 'vector graphics'],
      keywords: ['scalable vector graphics', 'save', 'handles', 'curves', 'bezier']
    },
    {
      id: 'pdf-export',
      name: 'PDF Export',
      demoPath: 'view/pdfexport/',
      summary: 'Shows how to export the whole diagram or a part of it to a PDF.',
      category: 'view',
      thumbnailPath: 'resources/image/export.png',
      tags: ['export', 'pdf'],
      keywords: ['vector graphics', 'handles']
    },
    {
      id: 'printing',
      name: 'Printing',
      demoPath: 'view/printing/',
      summary: 'Shows how to print the whole diagram or a part of it.',
      category: 'view',
      thumbnailPath: 'resources/image/export.png',
      tags: ['printing'],
      keywords: ['posters', 'vector graphics', 'handles']
    },
    {
      id: 'file-operations',
      name: 'File Operations',
      demoPath: 'application-features/file-operations/',
      summary: 'Shows different ways to open and save a graph.',
      category: 'view',
      thumbnailPath: 'resources/image/file-operations.png',
      tags: ['i/o', 'export', 'graphml'],
      keywords: ['load', 'save', 'io', 'json', 'graphbuilder']
    },
    {
      id: 'events-viewer',
      name: 'Events Viewer',
      demoPath: 'view/events/',
      summary:
        'Shows the multitude of events provided by the classes <code>IGraph</code>, <code>GraphComponent</code>, and the <em>Input Modes</em>.',
      category: 'view',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/events.png',
      tags: ['interaction'],
      keywords: ['palette', 'drag and drop', 'dnd']
    },
    {
      id: 'webgl-precompilation',
      name: 'WebGL2 Precompilation',
      demoPath: 'view/webgl-precompilation/',
      summary: 'Shows how to precompile the WebGL2 styles you want to use',
      category: 'view',
      thumbnailPath: 'resources/image/webgl-precompilation.png',
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
      distributionType: 'needs-layout',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/angular.png',
      tags: ['angular', 'data binding'],
      keywords: ['v2.1.0.0', 'tools', 'tree', 'data panel', 'integration', 'framework']
    },
    {
      id: 'angular-component-node-style',
      name: 'Angular Component Node Style',
      demoPath: 'style/angular-component-node-style/README.html',
      summary: 'Shows how to use an Angular component to visualize graph nodes.',
      category: 'style',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/angular-component-node-style.png',
      tags: ['angular', 'component', 'style'],
      keywords: ['v2.6.0.0', 'material', 'htmlvisual', 'framework', 'data binding']
    },
    {
      id: 'react',
      name: 'React',
      demoPath: 'toolkit/react/README.html',
      summary: 'Shows how to use yFiles for HTML with the React library.',
      category: 'integration',
      distributionType: 'needs-layout',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/react.png',
      tags: ['react', 'json', 'vite'],
      keywords: ['v2.6.0.0', 'web worker', 'data', 'integration', 'framework']
    },
    {
      id: 'react-class-components',
      name: 'React Class Components',
      demoPath: 'toolkit/react-class-components/README.html',
      summary: 'Shows how to integrate yFiles in a basic React application with class components.',
      category: 'integration',
      distributionType: 'needs-layout',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/react.png',
      tags: ['react', 'vite'],
      keywords: ['v2.6.0.0', 'integration', 'framework']
    },
    {
      id: 'react-component-node-style',
      name: 'React Component Node Style',
      demoPath: 'style/react-component-node-style/README.html',
      summary: 'Shows how to use a React component to visualize graph nodes.',
      category: 'style',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/react-component-node-style.png',
      tags: ['react', 'component', 'style'],
      keywords: ['v2.6.0.0', 'material', 'mui', 'htmlvisual', 'framework']
    },
    {
      id: 'preact',
      name: 'Preact',
      demoPath: 'toolkit/preact/',
      summary: 'Shows how to integrate yFiles in a basic Preact application with TypeScript.',
      category: 'integration',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/preact.png',
      tags: ['react', 'preact', 'json'],
      keywords: ['v2.4.0.4', 'data', 'integration', 'framework']
    },
    {
      id: 'vue',
      name: 'Vue',
      demoPath: 'toolkit/vue/README.html',
      summary: 'Shows how to integrate yFiles in a Vue 3 app with TypeScript and Vite.',
      category: 'integration',
      distributionType: 'needs-layout',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/vue.png',
      tags: ['vuejs', 'vue3'],
      keywords: [
        'v2.6.0.0',
        'component',
        'single',
        'file',
        'integration',
        'web worker',
        'vite',
        'framework'
      ]
    },
    {
      id: 'vue-component-node-style',
      name: 'Vue Component Node Style',
      demoPath: 'style/vue-component-node-style/README.html',
      summary: 'Shows how to use a Vue component to visualize graph nodes.',
      category: 'style',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/vue-component-node-style.png',
      tags: ['vue', 'component', 'style'],
      keywords: ['v2.6.0.0', 'material', 'vuetify', 'vuejs', 'htmlvisual', 'framework']
    },
    {
      id: 'svelte',
      name: 'Svelte',
      demoPath: 'toolkit/svelte/README.html',
      summary:
        'Shows how to integrate the yFiles library in a <a href="https://svelte.dev/" target="_blank">Svelte</a> project.',
      category: 'integration',
      distributionType: 'needs-layout',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/svelte.png',
      tags: ['svelte', 'vite'],
      keywords: ['v2.4.0.4', 'web worker', 'hmr', 'integration', 'framework']
    },
    {
      id: 'graphql',
      name: 'GraphQL',
      demoPath: 'toolkit/graphql/',
      summary: 'Shows how to load data from a GraphQL service and display it with yFiles for HTML.',
      category: 'integration',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/graphql.png',
      tags: ['graphql', 'database'],
      keywords: ['v2.2.0.2', 'remote', 'organic', 'layout', 'integration', 'data import']
    },
    {
      id: 'neo4j',
      name: 'Neo4j',
      demoPath: 'toolkit/neo4j/',
      summary: 'Shows how to load data from a Neo4j database and display it with yFiles for HTML.',
      category: 'integration',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/neo4j.png',
      tags: ['neo4j', 'database'],
      keywords: ['remote', 'organic', 'layout', 'integration', 'data import']
    },
    {
      id: 'next',
      name: 'Next.js',
      demoPath: 'toolkit/next/README.html',
      summary: 'Shows how to use yFiles for HTML with the Next.js library.',
      category: 'integration',
      distributionType: 'needs-layout',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/next.png',
      tags: ['next.js', 'react'],
      keywords: ['v2.6.0.0', 'web worker', 'data', 'integration', 'nextjs', 'framework']
    },
    {
      id: 'solid',
      name: 'SolidJS',
      demoPath: 'toolkit/solid/README.html',
      summary: 'Shows how to integrate yFiles in a SolidJS app with TypeScript and Vite.',
      category: 'integration',
      distributionType: 'needs-layout',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/solid.png',
      tags: ['solidjs', 'vite'],
      keywords: ['v2.6.0.0', 'component', 'integration', 'web worker', 'vite', 'framework']
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      demoPath: 'loading/nodejs/',
      summary:
        "Shows how to run a yFiles layout algorithm in a <a href='https://nodejs.org/' target='_blank'>Node.js&reg;</a> environment.",
      category: 'loading',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/nodejs.png',
      tags: ['nodejs', 'layout'],
      keywords: ['folding', 'hierarchic', 'json', 'web worker']
    },
    {
      id: 'web-components',
      name: 'Web Components',
      demoPath: 'toolkit/webcomponents/',
      summary: 'Shows how to use yFiles for HTML with Web Components v1.',
      category: 'integration',
      thumbnailPath: 'resources/image/web_components.png',
      tags: ['web components', 'shadow dom', 'html imports']
    },
    {
      id: 'amd-loading',
      name: 'AMD Loading',
      demoPath: 'loading/amdloading/',
      summary: 'Loads the yFiles library modules with the AMD loading standard (require.js).',
      category: 'loading',
      languageType: 'js-only',
      thumbnailPath: 'resources/image/amdloading.png',
      tags: ['loader', 'modules'],
      keywords: ['requirejs', 'require.js', 'non-symbolic']
    },
    {
      id: 'basic-module-loading',
      name: 'Basic Module Loading',
      demoPath: 'loading/basic-module-loading/',
      summary: 'A basic example of loading the yFiles library modules.',
      category: 'loading',
      thumbnailPath: 'resources/image/basic-module-loading.png',
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
      languageType: 'js-only',
      thumbnailPath: 'resources/image/rollupjs.png',
      tags: ['deployment', 'optimizer'],
      keywords: ['v2.2.0.0', 'web worker', 'modules']
    },
    {
      id: 'script-loading',
      name: 'Script Loading',
      demoPath: 'loading/scriptloading/',
      summary: 'Loads the yFiles modules using plain old &lt;script&gt; tags.',
      category: 'loading',
      languageType: 'js-only',
      thumbnailPath: 'resources/image/scriptloading.png',
      tags: ['loader', 'modules'],
      keywords: ['script loading', 'non-symbolic']
    },
    {
      id: 'web-worker-webpack',
      name: 'Web Worker Webpack',
      demoPath: 'loading/webworker-webpack/README.html',
      summary: 'Shows how to run a yFiles layout algorithm in a Web Worker task using Webpack.',
      category: 'loading',
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/webworker.png',
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
      demoPath: 'loading/webworker-modules/',

      thumbnailPath: 'resources/image/webworkermodules.png',
      category: 'loading',
      distributionType: 'needs-layout',
      tags: ['modules', 'web worker', 'layout'],
      keywords: ['v2.4.0.0', 'threads', 'threading', 'background', 'async', 'modules', 'hierarchic']
    },
    {
      id: 'web-worker-umd',
      name: 'Web Worker UMD',
      demoPath: 'loading/webworker-umd/',
      summary: 'Shows how to run a yFiles layout algorithm in a Web Worker task using AMD modules.',
      category: 'loading',
      languageType: 'js-only',
      thumbnailPath: 'resources/image/webworkerumd.png',
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
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/webpack.png',
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
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/webpack.png',
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
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/webpack.png',
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
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/vite.png',
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
      languageType: 'ts-only',
      thumbnailPath: 'resources/image/parcel.png',
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
      languageType: 'js-only',
      thumbnailPath: 'resources/image/web-dev-server.png',
      tags: ['es modules', 'deployment'],
      keywords: ['v2.4.0.4']
    },
    {
      id: 'webdriverio',
      name: 'WebdriverIO',
      demoPath: 'testing/wdio/README.html',
      summary: 'Shows how to test a yFiles for HTML app in multiple browsers using WebdriverIO.',
      category: 'testing',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/wdio.png',
      tags: ['testing', 'wdio', 'selenium'],
      keywords: ['v2.6.0.0', 'integration', 'web driver', 'end-to-end', 'e2e']
    },
    {
      id: 'cypress',
      name: 'Cypress',
      demoPath: 'testing/cypress/README.html',
      summary: 'Shows how to test a yFiles for HTML app using Cypress.',
      category: 'testing',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/cypress.png',
      tags: ['testing', 'cypress'],
      keywords: ['v2.6.0.0', 'integration', 'end-to-end']
    },
    {
      id: 'jest',
      name: 'Jest',
      demoPath: 'testing/jest/README.html',
      summary: 'Shows how to test a yFiles for HTML app using Jest.',
      category: 'testing',
      languageType: 'js-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/jest.png',
      tags: ['testing', 'jest'],
      keywords: ['v2.6.0.0', 'unit', 'tests']
    },
    {
      id: 'jest-puppeteer',
      name: 'Jest Puppeteer',
      demoPath: 'testing/jest-puppeteer/README.html',
      summary: 'Shows how to test a yFiles for HTML app using Jest with the Puppeteer environment.',
      category: 'testing',
      languageType: 'js-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/jest-puppeteer.png',
      tags: ['testing', 'jest', 'puppeteer'],
      keywords: ['v2.6.0.0', 'v2.2.0.2', 'integration', 'end-to-end']
    },
    {
      id: 'vitest',
      name: 'Vitest',
      demoPath: 'testing/vitest/README.html',
      summary: 'Shows how to test a yFiles for HTML app using Vitest.',
      category: 'testing',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/vitest.png',
      tags: ['testing', 'vitest'],
      keywords: ['v2.6.0.0', 'integration', 'end-to-end']
    },
    {
      id: 'playwright',
      name: 'Playwright',
      demoPath: 'testing/playwright/README.html',
      summary: 'Shows how to test a yFiles for HTML app using Playwright.',
      category: 'testing',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/playwright.png',
      tags: ['testing', 'playwright'],
      keywords: ['v2.6.0.0', 'integration', 'end-to-end']
    },
    {
      id: 'selenium-webdriver',
      name: 'Selenium WebDriver',
      demoPath: 'testing/selenium-webdriver/README.html',
      summary: 'Shows how to test a yFiles for HTML app using Selenium WebDriver.',
      category: 'testing',
      languageType: 'ts-only',
      onlineAvailable: false,
      thumbnailPath: 'resources/image/selenium-webdriver.png',
      tags: ['testing', 'selenium', 'webdriver'],
      keywords: ['v2.6.0.0', 'integration', 'end-to-end']
    },
    {
      id: 'application-under-test',
      name: 'Application Under Test',
      demoPath: 'testing/application-under-test/',
      summary: 'A simple app that is used as the test candidate in some of the testing demos.',
      hidden: true,
      category: 'view',
      tags: ['testing']
    },
    {
      id: 'clipboard',
      name: 'Clipboard',
      demoPath: 'view/clipboard/',
      summary:
        'Shows different ways of using the class GraphClipboard for Copy & Paste operations.',
      category: 'view',
      thumbnailPath: 'resources/image/clipboard.png',
      tags: ['interaction', 'copy', 'paste'],
      keywords: ['labels']
    },
    {
      id: 'clipboard-deferred-cut',
      name: 'Deferred Cut Clipboard',
      demoPath: 'view/clipboard-deferred-cut/',
      summary:
        'Shows a clipboard which grays elements out upon cut and only removes them when they are finally pasted.',
      category: 'view',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/clipboarddeferredcut.png',
      tags: ['interaction', 'copy', 'paste'],
      keywords: ['v2.4.0.4', 'labels']
    },
    {
      id: 'node-selection-resizing',
      name: 'Node Selection Resizing',
      demoPath: 'input/nodeselectionresizing/',
      summary: 'Shows how to reshape a selection of nodes as one unit.',
      category: 'input',
      thumbnailPath: 'resources/image/nodeselectionresizing.png',
      tags: ['interaction', 'resizing'],
      keywords: ['v2.3.0.0', 'input mode', 'scale']
    },
    {
      id: 'custom-label-model',
      name: 'Custom Label Model',
      demoPath: 'input/customlabelmodel/',
      summary: 'Shows how to implement and use a custom label model.',
      category: 'input',
      thumbnailPath: 'resources/image/custom_label_model.png',
      tags: ['interaction', 'label'],
      keywords: ['placements']
    },
    {
      id: 'graphml',
      name: 'GraphML',
      demoPath: 'view/graphml/',
      summary: "Provides a live view of the graph's GraphML representation.",
      category: 'view',
      thumbnailPath: 'resources/image/graphml.png',
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
      demoPath: 'input/customportmodel/',
      summary: 'Shows how to implement and use a custom port location model.',
      category: 'input',
      thumbnailPath: 'resources/image/custom_port_model.png',
      tags: ['interaction', 'port'],
      keywords: ['port candidate providers', 'placements']
    },
    {
      id: 'custom-snapping',
      name: 'Custom Snapping',
      demoPath: 'input/customsnapping/',
      summary: 'Shows how the snapping feature can be customized.',
      category: 'input',
      thumbnailPath: 'resources/image/custom-snapping.png',
      tags: ['interaction', 'snapping'],
      keywords: ['guides', 'lines', 'labels', 'move']
    },
    {
      id: 'drag-from-component',
      name: 'Drag From Component',
      demoPath: 'input/drag-from-component/',
      summary: 'Shows how to drag graph items out of the graph component to another element.',
      category: 'input',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/drag-from-component.png',
      tags: ['interaction', 'drag and drop'],
      keywords: ['v2.4.0.4', 'move', 'dnd']
    },
    {
      id: 'context-menu',
      name: 'Context Menu',
      demoPath: 'input/contextmenu/',
      summary:
        'Shows how to add a context menu to the nodes of a graph and to the canvas background.',
      category: 'input',
      thumbnailPath: 'resources/image/contextmenu.png',
      tags: ['interaction'],
      keywords: ['context menu', 'copy']
    },
    {
      id: 'application-features-drag-and-drop',
      name: 'Simple Drag And Drop',
      summary:
        'Shows how to enable dragging nodes from a panel and drop them into the graph component.',
      demoPath: 'application-features/drag-and-drop/',
      thumbnailPath: 'resources/image/tutorial03.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction', 'drag and drop'],
      keywords: ['DropInputMode', 'addDragDroppedListener', 'move', 'events', 'input mode', 'dnd']
    },
    {
      id: 'drag-and-drop',
      name: 'Drag and Drop',
      demoPath: 'input/draganddrop/',
      summary: 'Shows drag and drop of nodes, groups and labels.',
      category: 'input',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/draganddrop.png',
      tags: ['interaction', 'drag and drop'],
      keywords: ['palette', 'ports', 'labels', 'groups', 'html5', 'native', 'move', 'dnd']
    },
    {
      id: 'graph-drag-and-drop',
      name: 'Graph Drag and Drop',
      demoPath: 'input/graph-drag-and-drop/',
      summary: 'Shows drag and drop of graphs consisting of multiple items.',
      category: 'input',
      thumbnailPath: 'resources/image/graph-drag-and-drop.png',
      tags: ['interaction', 'drag and drop'],
      keywords: ['v2.4.0.4', 'palette', 'graphs', 'groups', 'dnd']
    },
    {
      id: 'custom-drag-and-drop',
      name: 'Custom Drag and Drop',
      demoPath: 'input/custom-drag-and-drop/',
      summary: 'Shows how to change the color of nodes and edges using drag and drop operations.',
      category: 'input',
      thumbnailPath: 'resources/image/color-dnd.png',
      tags: ['interaction', 'drag and drop'],
      keywords: ['v2.4.0.4', 'palette', 'colors', 'dnd']
    },
    {
      id: 'edge-reconnection',
      name: 'Edge Reconnection',
      demoPath: 'input/edgereconnection/',
      summary: 'Shows how the reconnection of edge ports can be customized and restricted.',
      category: 'input',
      thumbnailPath: 'resources/image/edgereconnection.png',
      tags: ['interaction'],
      keywords: ['port candidate providers', 'ports']
    },
    {
      id: 'label-editing',
      name: 'Label Editing',
      demoPath: 'input/labelediting/',
      summary: 'Shows customizations of the interactive label editing.',
      category: 'input',
      thumbnailPath: 'resources/image/label_editing.png',
      tags: ['interaction', 'label'],
      keywords: ['texts', 'validation']
    },
    {
      id: 'custom-handle-provider',
      name: 'Custom Handle Provider',
      demoPath: 'input/custom-handle-provider/',
      summary:
        'Shows how to implement custom handles that allow to interactively change the shape of an ArrowNodeStyle.',
      category: 'input',
      thumbnailPath: 'resources/image/custom-handle-provider.png',
      tags: ['interaction', 'style'],
      keywords: ['v2.5.0.0', 'handles', 'arrow', 'shaft', 'IHandleProvider', 'IHandle']
    },
    {
      id: 'label-handle-provider',
      name: 'Label Handle Provider',
      demoPath: 'input/labelhandleprovider/',
      summary:
        'Shows how to implement custom handles that allow interactive resizing and rotation of labels.',
      category: 'input',
      thumbnailPath: 'resources/image/LabelHandleProvider.png',
      tags: ['interaction', 'label'],
      keywords: ['handles']
    },
    {
      id: 'move-unselected-nodes',
      name: 'Move Unselected Nodes',
      demoPath: 'input/moveunselectednodes/',
      summary:
        'Shows a special input mode that allows you to move nodes without selecting them first.',
      category: 'input',
      thumbnailPath: 'resources/image/move_unselected_nodes.png',
      tags: ['interaction', 'selection'],
      keywords: ['input mode', 'move']
    },
    {
      id: 'orthogonal-edge-editing-customization',
      name: 'Orthogonal Edge Editing Customization',
      demoPath: 'input/orthogonal-edge-editing-customization/',
      summary: 'Shows how to customize orthogonal edge editing.',
      category: 'input',
      thumbnailPath: 'resources/image/orthogonal-edges.png',
      tags: ['interaction'],
      keywords: ['orthogonal edges', 'move']
    },
    {
      id: 'port-candidate-provider',
      name: 'Port Candidate Provider',
      demoPath: 'input/portcandidateprovider/',
      summary: 'Shows how edge creation can be customized.',
      category: 'input',
      thumbnailPath: 'resources/image/portcandidateprovider.png',
      tags: ['interaction', 'port'],
      keywords: ['port candidate providers']
    },
    {
      id: 'position-handler',
      name: 'Position Handler',
      demoPath: 'input/positionhandler/',
      summary: 'Shows how to customize and restrict the movement behavior of nodes.',
      category: 'input',
      thumbnailPath: 'resources/image/position-handler.png',
      tags: ['interaction'],
      keywords: ['position handlers', 'move']
    },
    {
      id: 'reparent-handler',
      name: 'Reparent Handler',
      demoPath: 'input/reparenthandler/',
      summary: 'Shows how reparenting of nodes can be customized.',
      category: 'input',
      thumbnailPath: 'resources/image/reparenthandler.png',
      tags: ['interaction', 'grouping'],
      keywords: ['re-parent handlers']
    },
    {
      id: 'reshape-handle-provider-configuration',
      name: 'Reshape Handle Provider Configuration',
      demoPath: 'input/reshapehandleconfiguration/',
      summary: 'Shows how resizing of nodes can be customized.',
      category: 'input',
      thumbnailPath: 'resources/image/reshape-handle.png',
      tags: ['interaction', 'resizing'],
      keywords: ['v2.3.0.0', 'handles', 'reshape', 'size', 'scale']
    },
    {
      id: 'reshape-handle-provider',
      name: 'Reshape Handle Provider',
      demoPath: 'input/reshapehandleprovider/',
      summary: 'Shows how to add resize handles to ports.',
      category: 'input',
      thumbnailPath: 'resources/image/reshape-port-handle.png',
      tags: ['interaction', 'resizing', 'port'],
      keywords: ['v2.3.0.0', 'handles', 'reshape', 'size', 'scale']
    },
    {
      id: 'restricted-editing',
      name: 'Restricted Editing',
      demoPath: 'input/restricted-editing/',
      summary: 'Shows how to restrict interactive editing with GraphEditorInputMode.',
      category: 'input',
      thumbnailPath: 'resources/image/restricted-editing.png',
      tags: ['interaction'],
      keywords: ['v2.4.0.4', 'editing', 'viewing']
    },
    {
      id: 'lasso-selection',
      name: 'Lasso Selection',
      demoPath: 'input/lassoselection/',
      summary: 'Shows how to configure a lasso tool for freeform selection.',
      category: 'input',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/lassoselection.png',
      tags: ['interaction', 'selection'],
      keywords: ['v2.1.0.2', 'testable', 'free']
    },
    {
      id: 'marquee-node-creation',
      name: 'Marquee Node Creation',
      demoPath: 'input/marquee-node-creation/',
      summary: 'Shows how to customize the MarqueeSelectionInputMode class to create new nodes.',
      category: 'input',
      thumbnailPath: 'resources/image/marquee-node-creation.png',
      tags: ['interaction'],
      keywords: ['v2.4.0.4', 'marquee', 'selection', 'creation', 'creating']
    },
    {
      id: 'single-selection',
      name: 'Single Selection',
      demoPath: 'input/singleselection/',
      summary: 'Shows how to configure GraphEditorInputMode for single selection mode.',
      category: 'input',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/singleselection.png',
      tags: ['interaction', 'selection'],
      keywords: ['single selection']
    },
    {
      id: 'size-constraint-provider',
      name: 'Size Constraint Provider',
      demoPath: 'input/sizeconstraintprovider/',
      summary: 'Shows how resizing of nodes can be restricted.',
      category: 'input',
      thumbnailPath: 'resources/image/size-constraint.png',
      tags: ['interaction'],
      keywords: ['size constraint providers', 'handles']
    },
    {
      id: 'button-input-mode',
      name: 'Button Input Mode',
      demoPath: 'input/button-input-mode/',
      summary: 'Shows how to use a custom input mode adding temporary buttons for model items.',
      category: 'input',
      distributionType: 'needs-layout',
      thumbnailPath: 'resources/image/button-input-mode.png',
      tags: ['interaction'],
      keywords: ['v2.4.0.4', 'buttons', 'input mode']
    },
    {
      id: 'without-view',
      name: 'Layout Without View',

      demoPath: 'layout/without-view/',
      summary:
        'Shows how to use the graph analysis and layout algorithms without a view and without the IGraph API',
      category: 'layout',
      distributionType: 'no-viewer',
      thumbnailPath: 'resources/image/without-view.png',
      tags: ['headless', 'layout', 'analysis'],
      keywords: ['v2.3.0.1', 'invisible', 'background', 'memory', 'centrality', 'hierarchic']
    },
    {
      id: 'application-features-background-image',
      name: 'Background Image',
      summary: 'Shows how to add a background visualizations to a graph component.',
      demoPath: 'application-features/background-image/',
      thumbnailPath: 'resources/image/tutorial3step2.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['background', 'icon'],
      keywords: ['v2.2.0.0', 'ICanvasObjectGroup', 'backgroundGroup']
    },
    {
      id: 'application-features-building-graph-from-data',
      name: 'Building Graphs From Data',
      summary: 'Shows how to build a graph from data in JSON format.',
      demoPath: 'application-features/building-graph-from-data/',
      thumbnailPath: 'resources/image/tutorial3step3.png',
      category: 'application-features',
      tags: ['json', 'i/o'],
      keywords: ['read', 'write', 'input', 'files', 'data base']
    },
    {
      id: 'application-features-building-swimlanes-from-data',
      name: 'Building Swimlanes From Data',
      summary: 'Shows how to build a graph with swimlanes from data in JSON format.',
      demoPath: 'application-features/building-swimlanes-from-data/',
      thumbnailPath: 'resources/image/tutorial3step4.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['json', 'i/o', 'table'],
      keywords: ['read', 'write', 'input', 'files', 'data base']
    },
    {
      id: 'application-features-external-links',
      name: 'External Links',
      summary: 'Shows how to add labels that act like external links and open in a new window.',
      demoPath: 'application-features/external-links/',
      thumbnailPath: 'resources/image/tutorial3step8.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction'],
      keywords: ['ItemHoverInputMode', 'control', 'events', 'input mode']
    },
    {
      id: 'application-features-filtering',
      name: 'Filtering',
      summary: 'Shows how to configure graph filtering.',
      demoPath: 'application-features/filtering/',
      thumbnailPath: 'resources/image/tutorial3step9.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['filtering', 'grouping'],
      keywords: ['v2.2.0.0', 'FilteredGraphWrapper', 'subset', 'predicates', 'hide', 'hiding']
    },
    {
      id: 'application-features-filtering-with-folding',
      name: 'Filtering With Folding',
      summary: 'Shows how to configure filtering and folding in the same application.',
      demoPath: 'application-features/filtering-with-folding/',
      thumbnailPath: 'resources/image/tutorial3step10.png',
      category: 'application-features',
      distributionType: 'needs-layout',
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
      ]
    },
    {
      id: 'application-features-folding',
      name: 'Folding',
      summary: 'Shows how to enable collapsing and expanding of group nodes.',
      demoPath: 'application-features/folding/',
      thumbnailPath: 'resources/image/tutorial3step11.png',
      category: 'application-features',
      distributionType: 'needs-layout',
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
      ]
    },
    {
      id: 'application-features-graph-copy',
      name: 'Graph Copy',
      summary: 'Shows how to copy a graph or parts of a graph.',
      demoPath: 'application-features/graph-copy/',
      thumbnailPath: 'resources/image/tutorial3graphcopy.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['clipboard'],
      keywords: ['v2.2.0.0', 'GraphCopier', 'copy', 'cut', 'paste']
    },
    {
      id: 'application-features-graph-decorator',
      name: 'Graph Decorator',
      summary: 'Shows how to decorate graph items to change their behavior or visualization.',
      demoPath: 'application-features/graph-decorator/',
      thumbnailPath: 'resources/image/demo-graph-decorator.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction'],
      keywords: [
        'v2.2.0.2',
        'GraphDecorator',
        'NodeDecorator',
        'ILookupDecorator',
        'ports',
        'IPortCandidate',
        'port candidate providers'
      ]
    },
    {
      id: 'application-features-simple-highlight',
      name: 'Simple Highlight Decorator',
      summary: 'Shows how to highlight nodes and edges when the mouse hovers over them.',
      demoPath: 'application-features/simple-highlight-decorator/',
      thumbnailPath: 'resources/image/highlight-decorator.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['highlight', 'hover', 'interaction'],
      keywords: ['v2.4.0.2', 'GraphDecorator', 'NodeDecorator', 'HighlightDecorator']
    },
    {
      id: 'application-features-complex-highlight',
      name: 'Complex Highlight Decorator',
      summary:
        'Shows how to highlight nodes with different effects based on data stored in their tags.',
      demoPath: 'application-features/complex-highlight-decorator/',
      thumbnailPath: 'resources/image/complex-highlight-decorator.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['highlight', 'hover', 'interaction'],
      keywords: [
        'v2.4.0.2',
        'GraphDecorator',
        'NodeDecorator',
        'HighlightDecorator',
        'HighlightIndicatorManager'
      ]
    },
    {
      id: 'application-features-graph-search',
      name: 'Graph Search',
      summary: 'Shows how to search for specific nodes in a graph.',
      demoPath: 'application-features/graph-search/',
      thumbnailPath: 'resources/image/tutorial3step12.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['highlight'],
      keywords: ['v2.2.0.0', 'query', 'queries', 'match', 'matches', 'find']
    },
    {
      id: 'application-features-grid-snapping',
      name: 'Grid Snapping',
      summary: 'Shows how to enable grid snapping during interactive changes.',
      demoPath: 'application-features/grid-snapping/',
      thumbnailPath: 'resources/image/tutorial3step13.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['grid', 'interaction', 'snapping'],
      keywords: [
        'GraphSnapContext',
        'LabelSnapContext',
        'GridSnapTypes',
        'GridVisualCreator',
        'align',
        'visuals',
        'interactive'
      ]
    },
    {
      id: 'application-features-input-output',
      name: 'Save and Load GraphML',
      summary: 'Shows how to use GraphML input and output.',
      demoPath: 'application-features/input-output/',
      thumbnailPath: 'resources/image/tutorial3input-output.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['graphml', 'i/o'],
      keywords: ['GraphMLSupport', 'read', 'write', 'files', 'io']
    },
    {
      id: 'application-features-custom-graphml',
      name: 'Custom Data in GraphML',
      summary: 'Shows how to read and write additional data from and to GraphML.',
      demoPath: 'application-features/custom-graphml/',
      thumbnailPath: 'resources/image/tutorial3custom-graphml.png',
      category: 'application-features',
      distributionType: 'needs-layout',
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
      ]
    },
    {
      id: 'application-features-label-text-wrapping',
      name: 'Label Text Wrapping',
      summary: 'Shows how to enable label text wrapping and trimming.',
      demoPath: 'application-features/label-text-wrapping/',
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
      ]
    },
    {
      id: 'application-features-native-listeners',
      name: 'Native Listeners',
      summary: 'Illustrates how to register native event listeners to a SVG elements of a style.',
      demoPath: 'application-features/native-listeners/',
      thumbnailPath: 'resources/image/tutorial3step17.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction', 'style'],
      keywords: ['NodeDecorator', 'ILookupDecorator', 'NodeStyleBase', 'events', 'decorator']
    },
    {
      id: 'application-features-orthogonal-edge-editing',
      name: 'Orthogonal Edge Editing',
      summary: 'Shows how to enable interactive orthogonal edge editing.',
      demoPath: 'application-features/orthogonal-edges/',
      thumbnailPath: 'resources/image/tutorial3step18.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['edge creation', 'bends'],
      keywords: ['OrthogonalEdgeEditingContext', 'OrthogonalEdgeEditingPolicy']
    },
    {
      id: 'application-features-rectangular-indicator',
      name: 'Rectangular Indicator',
      summary: 'Shows how to add an interactive rectangular indicator to the graph component.',
      demoPath: 'application-features/rectangular-indicator/',
      thumbnailPath: 'resources/image/tutorial3step19.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction', 'selection'],
      keywords: [
        'v2.2.0.0',
        'PositionHandler',
        'RectangleIndicatorInstaller',
        'RectangleHandle',
        'handles'
      ]
    },
    {
      id: 'application-features-smart-click-navigation',
      name: 'Smart Click Navigation',
      demoPath: 'application-features/smart-click-navigation/',
      summary: 'Shows the how to scroll and zoom to the area of interest by single edge-clicks.',
      category: 'application-features',
      thumbnailPath: 'resources/image/navigation.png',
      tags: ['exploration'],
      keywords: ['v2.2.0.0', 'navigation', 'zoom', 'move', 'interaction']
    },
    {
      id: 'application-features-snapping',
      name: 'Snapping',
      summary: 'Shows how to enable snapping (guide lines) for interactive changes.',
      demoPath: 'application-features/snapping/',
      thumbnailPath: 'resources/image/tutorial3snapping.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction', 'snapping'],
      keywords: ['move', 'resize', 'resizing']
    },
    {
      id: 'application-features-application-features-subdivide-edges',
      name: 'Subdivide Edges',
      summary: 'Shows how to subdivide an edge when a node is dragged on it.',
      demoPath: 'application-features/subdivide-edges/',
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
      ]
    },
    {
      id: 'application-features-theming',
      name: 'Theming',
      summary: 'Shows how to use a theme to change the look-and-feel of an application.',
      demoPath: 'application-features/theming/',
      thumbnailPath: 'resources/image/tutorial3theming.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction', 'theme'],
      keywords: ['dark mode', 'light mode', 'colors', 'theming', 'v2.5.0.0']
    },
    {
      id: 'application-features-tooltips',
      name: 'Tooltips',
      summary: 'Shows how to enable tooltips for graph items.',
      demoPath: 'application-features/tooltips/',
      thumbnailPath: 'resources/image/tutorial3step21.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['hover', 'interaction'],
      keywords: ['mouseHoverInputMode', 'addQueryItemToolTipListener', 'events', 'data', 'json']
    },
    {
      id: 'application-features-accessibility',
      name: 'Accessibility',
      summary: 'Shows how to use the aria-live region to update screen readers.',
      demoPath: 'application-features/accessibility/',
      thumbnailPath: 'resources/image/tutorial3accessibility.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['accessibility', 'aria'],
      keywords: ['v2.3.0.0', 'tool tips', 'live', 'region', 'screen reader']
    },
    {
      id: 'application-features-webgl-rendering',
      name: 'WebGL2 Rendering',
      summary: 'Shows how to enable the WebGL2 rendering mode.',
      demoPath: 'application-features/webgl-rendering/',
      thumbnailPath: 'resources/image/feature-webgl-rendering.png',
      category: 'application-features',
      tags: ['webgl2', 'performance'],
      keywords: ['v2.4.0.0', 'large', 'performance', 'styles', 'fast']
    },
    {
      id: 'application-features-overview',
      name: 'Overview Component',
      summary: 'Shows how to add an overview component to the application.',
      demoPath: 'application-features/overview/',
      thumbnailPath: 'resources/image/feature-overview-component.png',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction'],
      keywords: ['v2.4.0.4', 'overview', 'navigation', 'zoom']
    },
    {
      id: 'layout-features-hierarchic',
      name: 'Hierarchic Layout',
      summary: 'Shows common configuration options for hierarchical layout.',
      demoPath: 'layout-features/hierarchic/',
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
      ]
    },
    {
      id: 'layout-features-hierarchic-incremental',
      name: 'Incremental Hierarchic Layout',
      summary: 'Shows how to run the hierarchical layout on a predefined set of nodes.',
      demoPath: 'layout-features/hierarchic-incremental/',
      thumbnailPath: 'resources/image/tutorial4-hierarchic-incremental.png',
      category: 'layout-features',
      tags: ['hierarchic', 'incremental'],
      keywords: ['v2.4.0.4', 'layout', 'subset', 'layout', 'nodes', 'set', 'node-set']
    },
    {
      id: 'layout-features-portcandidateset',
      name: 'Hierarchic Layout with PortCandidateSet',
      summary: 'Shows how to use a PortCandidateSet with hierarchical layout.',
      demoPath: 'layout-features/hierarchic-portcandidate-set/',
      thumbnailPath: 'resources/image/tutorial4hierarchicportcandidateset.png',
      category: 'layout-features',
      tags: ['hierarchic', 'ports'],
      keywords: ['v2.4.0.4', 'layout', 'ports', 'candidates', 'portcandidateset']
    },
    {
      id: 'layout-features-hierarchic-edge-grouping',
      name: 'Hierarchic Layout with Edge Grouping',
      summary: 'Shows how to configure edge grouping for hierarchical layout.',
      demoPath: 'layout-features/hierarchic-edge-grouping/',
      thumbnailPath: 'resources/image/tutorial4hierarchicedgegrouping.png',
      category: 'layout-features',
      tags: ['hierarchic', 'edgegroups'],
      keywords: ['v2.4.0.4', 'layout', 'groups']
    },
    {
      id: 'layout-features-hierarchic-with-given-layering',
      name: 'Hierarchic Layout with Given Layering',
      summary: 'Shows how to configure hierarchical layout with a given layering.',
      demoPath: 'layout-features/hierarchic-given-layering/',
      thumbnailPath: 'resources/image/tutorial4hierarchicgivenlayering.png',
      category: 'layout-features',
      tags: ['hierarchic', 'given', 'layers'],
      keywords: ['v2.4.0.4', 'layout', 'hierarchic', 'given', 'layering', 'layers']
    },
    {
      id: 'layout-features-constraints',
      name: 'Hierarchic Layout with Constraints',
      summary:
        'Shows how to use constraints to control layering and sequencing in the hierarchical layout.',
      demoPath: 'layout-features/hierarchic-constraints/',
      thumbnailPath: 'resources/image/tutorial4hierarchicconstraints.png',
      category: 'layout-features',
      tags: ['hierarchic', 'constraints'],
      keywords: ['v2.4.0.4', 'layout']
    },
    {
      id: 'layout-features-sequence-constraints',
      name: 'Hierarchic Layout with Sequence Constraints',
      summary: 'Shows how to use constraints to control sequencing in hierarchical layout.',
      demoPath: 'layout-features/hierarchic-sequence-constraints/',
      thumbnailPath: 'resources/image/tutorial4hierarchicsequenceconstraints.png',
      category: 'layout-features',
      tags: ['hierarchic', 'constraints'],
      keywords: ['v2.4.0.4', 'layout', 'sequencing']
    },
    {
      id: 'layout-features-layer-constraints',
      name: 'Hierarchic Layout with Layer Constraints',
      summary: 'Shows how to use constraints to control layering in hierarchical layout.',
      demoPath: 'layout-features/hierarchic-layer-constraints/',
      thumbnailPath: 'resources/image/tutorial4hierarchiclayerconstraints.png',
      category: 'layout-features',
      tags: ['hierarchic', 'constraints'],
      keywords: ['v2.4.0.4', 'layout', 'layering']
    },
    {
      id: 'layout-features-hierarchic-node-alignment',
      name: 'Hierarchic Layout with Node Alignment',
      summary: 'Shows how to align a set of nodes with hierarchical layout.',
      demoPath: 'layout-features/hierarchic-node-alignment/',
      thumbnailPath: 'resources/image/tutorial4hierarchicverticalnodealignment.png',
      category: 'layout-features',
      tags: ['hierarchic', 'alignment'],
      keywords: ['v2.4.0.4', 'layout', 'alignment', 'critical', 'paths']
    },
    {
      id: 'layout-features-hierarchic-edge-labeling',
      name: 'Hierarchic Layout with Edge Labeling',
      summary: 'Shows how to configure automatic label placement of hierarchical layout.',
      demoPath: 'layout-features/hierarchic-edge-labeling/',
      thumbnailPath: 'resources/image/tutorial4hierarchicedgelabeling.png',
      category: 'layout-features',
      tags: ['hierarchic', 'labeling'],
      keywords: ['v2.4.0.4', 'layout', 'integrated-labeling', 'label-placement', 'auto-flipping']
    },
    {
      id: 'layout-features-hierarchic-compact-groups',
      name: 'Compact Groups in Hierarchic Layout',
      summary:
        'Shows how to configure the hierarchical layout such that it yields maximally compact group nodes.',
      demoPath: 'layout-features/hierarchic-compact-groups/',
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
      ]
    },
    {
      id: 'layout-features-organic',
      name: 'Organic Layout',
      summary: 'Shows common configuration options for organic layout.',
      demoPath: 'layout-features/organic/',
      thumbnailPath: 'resources/image/tutorial4organic.png',
      category: 'layout-features',
      tags: ['organic'],
      keywords: ['v2.4.0.4', 'layout', 'graph shape', 'compactness', 'node distance', 'simple']
    },
    {
      id: 'layout-features-organic-incremental',
      name: 'Incremental Organic Layout',
      summary: 'Shows how to run the organic layout on a predefined set of nodes.',
      demoPath: 'layout-features/organic-incremental/',
      thumbnailPath: 'resources/image/tutorial4organicincremental.png',
      category: 'layout-features',
      tags: ['organic', 'incremental'],
      keywords: ['v2.4.0.4', 'layout', 'subset', 'nodes', 'set', 'node-set']
    },
    {
      id: 'layout-features-organic-edge-labeling',
      name: 'Organic Layout with Edge Labeling',
      summary: 'Shows how to configure automatic label placement of organic layout.',
      demoPath: 'layout-features/organic-edge-labeling/',
      thumbnailPath: 'resources/image/tutorial4organicedgelabeling.png',
      category: 'layout-features',
      tags: ['organic', 'labeling'],
      keywords: ['v2.6.0.0', 'layout', 'integrated-labeling', 'label-placement', 'auto-flipping']
    },
    {
      id: 'layout-features-organic-substructures',
      name: 'Organic Layout with Substructures',
      summary: 'Shows how to configure the layout of substructures in the organic layout.',
      demoPath: 'layout-features/organic-substructures/',
      thumbnailPath: 'resources/image/tutorial4organicsubstructures.png',
      category: 'layout-features',
      tags: ['organic', 'substructures'],
      keywords: ['v2.4.0.4', 'layout']
    },
    {
      id: 'layout-features-organic-constraints',
      name: 'Organic Layout with Constraints',
      summary: 'Shows how to configure constraints for the organic layout algorithm.',
      demoPath: 'layout-features/organic-constraints/',
      thumbnailPath: 'resources/image/tutorial4organicconstraints.png',
      category: 'layout-features',
      tags: ['organic', 'constraints'],
      keywords: ['v2.6.0.0', 'layout', 'circle', 'constraints', 'align', 'cycle']
    },
    {
      id: 'layout-features-edgerouter',
      name: 'Edge Router',
      summary: 'Shows common configuration options for the edge routing algorithm.',
      demoPath: 'layout-features/edge-router/',
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
      ]
    },
    {
      id: 'layout-features-edge-router-incremental',
      name: 'Incremental Edge Router',
      summary: 'Shows how to run the edge router on a predefined set of edges.',
      demoPath: 'layout-features/edge-router-incremental/',
      thumbnailPath: 'resources/image/tutorial4edgerouterincremental.png',
      category: 'layout-features',
      tags: ['incremental', 'routing'],
      keywords: ['v2.4.0.4', 'layout', 'subset', 'edges', 'set', 'edge-set']
    },
    {
      id: 'layout-features-edge-router-buses',
      name: 'Edge Router with Buses',
      summary:
        'Shows how to configure the edge routing algorithm to produce orthogonal bus-style paths.',
      demoPath: 'layout-features/edge-router-buses/',
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
      ]
    },
    {
      id: 'layout-features-tree',
      name: 'Basic Tree Layout',
      summary: 'Shows common configuration options for the tree layout.',
      demoPath: 'layout-features/tree/',
      thumbnailPath: 'resources/image/tutorial4tree.png',
      category: 'layout-features',
      tags: ['tree'],
      keywords: ['v2.4.0.4', 'layout', 'outedgecomparers', 'portassignment', 'nodeplacer']
    },
    {
      id: 'layout-features-tree-node-placers',
      name: 'Tree Layout with Node Placers',
      summary: 'Shows how to use different node placers in tree layout.',
      demoPath: 'layout-features/tree-node-placers/',
      thumbnailPath: 'resources/image/tutorial4treenodeplacers.png',
      category: 'layout-features',
      tags: ['tree', 'nodeplacer'],
      keywords: ['v2.4.0.4', 'layout', 'nodes']
    },
    {
      id: 'layout-features-orthogonal',
      name: 'Orthogonal Layout',
      summary: 'Shows common configuration options for the orthogonal layout.',
      demoPath: 'layout-features/orthogonal/',
      thumbnailPath: 'resources/image/tutorial4orthogonal.png',
      category: 'layout-features',
      tags: ['orthogonal'],
      keywords: ['v2.4.0.4', 'layout', 'directed', 'halo']
    },
    {
      id: 'layout-features-recursive-group-layout',
      name: 'Recursive Group Layout',
      summary:
        'Shows how to use different layouts for group nodes using the recursive group layout.',
      demoPath: 'layout-features/recursive-group-layout/',
      thumbnailPath: 'resources/image/tutorial4recursivegrouplayout.png',
      category: 'layout-features',
      tags: ['recursive', 'groups'],
      keywords: ['v2.4.0.4', 'layout']
    },
    {
      id: 'layout-features-cactus-group-layout',
      name: 'Cactus Group Layout',
      summary: 'Shows how to configure the cactus group layout to arrange grouped graphs.',
      demoPath: 'layout-features/cactus/',
      thumbnailPath: 'resources/image/tutorial4cactus.png',
      category: 'layout-features',
      tags: ['cactus', 'groups'],
      keywords: ['v2.5.0.0', 'layout', 'hierarchy', 'round', 'nesting', 'bundling', 'fractal']
    },
    {
      id: 'layout-features-compact-disk-groups',
      name: 'Compact Disk Groups',
      summary: 'Shows how to configure the compact disk layout to arrange children of group nodes.',
      demoPath: 'layout-features/compact-disk-groups/',
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
      ]
    },
    {
      id: 'layout-features-compact-tabular-layout',
      name: 'Compact Tabular Layout',
      summary: 'Shows how to configure the tabular layout to create compact drawings',
      demoPath: 'layout-features/compact-tabular-layout/',
      thumbnailPath: 'resources/image/tutorial4compacttabularlayout.png',
      category: 'layout-features',
      tags: ['compact', 'tabular', 'router'],
      keywords: ['v2.6.0.0', 'layout', 'compact', 'table', 'tabular', 'edgerouter', 'aspect ratio']
    },
    {
      id: 'tutorial-basic-features',
      name: 'Tutorial: Basic Features',
      summary: 'Learn about the most commonly used yFiles features.',
      demoPath: 'tutorial-yfiles-basic-features/01-graphcomponent/',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0']
    },
    {
      id: 'tutorial-basic-features-graphcomponent',
      name: '01 Creating the View',
      summary:
        'Introduces the GraphComponent class, the central UI element for working with graphs.',
      demoPath: 'tutorial-yfiles-basic-features/01-graphcomponent/',
      thumbnailPath: 'resources/image/tutorial1step1.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0']
    },
    {
      id: 'tutorial-basic-features-graph-element-creation',
      name: '02 Creating Graph Elements',
      summary: 'Shows how to create the basic graph elements.',
      demoPath: 'tutorial-yfiles-basic-features/02-graph-element-creation/',
      thumbnailPath: 'resources/image/tutorial1step2.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'nodes', 'edges', 'labels']
    },
    {
      id: 'tutorial-basic-features-managing-viewport',
      name: '03 Managing Viewport',
      summary: 'Shows how to work with the viewport.',
      demoPath: 'tutorial-yfiles-basic-features/03-managing-viewport/',
      thumbnailPath: 'resources/image/tutorial1step2.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'zoom', 'fit content']
    },
    {
      id: 'tutorial-basic-features-setting-styles',
      name: '04 Setting Styles',
      summary: 'Shows how to configure the visual appearance of graph elements using styles.',
      demoPath: 'tutorial-yfiles-basic-features/04-setting-styles/',
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
      ]
    },
    {
      id: 'tutorial-basic-features-label-placement',
      name: '05 Label Placement',
      summary:
        'Shows how to control label placement with the help of so called label model parameters.',
      demoPath: 'tutorial-yfiles-basic-features/05-label-placement/',
      thumbnailPath: 'resources/image/tutorial1step5.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'InteriorLabelModel', 'SmartEdgeLabelModel']
    },
    {
      id: 'tutorial-basic-features-basic-interaction',
      name: '06 Basic Interaction',
      summary:
        'Shows the default interaction gestures that are provided by class GraphEditorInputMode.',
      demoPath: 'tutorial-yfiles-basic-features/06-basic-interaction/',
      thumbnailPath: 'resources/image/tutorial1step6.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0']
    },
    {
      id: 'tutorial-basic-features-undo-clipboard-support',
      name: '07 Undo Clipboard Support',
      summary: 'Shows how to use the undo and clipboard features.',
      demoPath: 'tutorial-yfiles-basic-features/07-undo-clipboard-support/',
      thumbnailPath: 'resources/image/tutorial1step7.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'cut', 'copy', 'paste', 'redo']
    },
    {
      id: 'tutorial-basic-features-grouping',
      name: '08 Grouping',
      summary: 'Shows how to configure support for grouped (or hierarchically organized) graphs.',
      demoPath: 'tutorial-yfiles-basic-features/08-grouping/',
      thumbnailPath: 'resources/image/tutorial1step8.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'PanelNodeStyle', 'InteriorStretchLabelModel']
    },
    {
      id: 'tutorial-basic-features-data-binding',
      name: '09 Data Binding',
      summary: 'Shows how to bind data to graph elements.',
      demoPath: 'tutorial-yfiles-basic-features/09-data-binding/',
      thumbnailPath: 'resources/image/tutorial1step9.png',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'Mapper']
    },
    {
      id: 'tutorial-basic-features-layout',
      name: '10 Layout',
      summary:
        'Shows how to use the layout algorithms in yFiles for HTML to automatically place the graph elements.',
      demoPath: 'tutorial-yfiles-basic-features/10-layout/',
      thumbnailPath: 'resources/image/tutorial1step10.png',
      category: 'tutorial-basic-features',
      distributionType: 'needs-layout',
      tags: ['tutorial', 'basic features', 'hierarchic'],
      keywords: ['v2.6.0.0', 'morphLayout']
    },
    {
      id: 'tutorial-basic-features-layout-data',
      name: '11 Layout Data',
      summary: 'Shows how to configure individual settings for each node for the automatic layout.',
      demoPath: 'tutorial-yfiles-basic-features/11-layout-data/',
      thumbnailPath: 'resources/image/tutorial1step11.png',
      category: 'tutorial-basic-features',
      distributionType: 'needs-layout',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'hierarchic']
    },
    {
      id: 'tutorial-basic-features-graph-analysis',
      name: '12 Analysis Algorithms',
      summary: 'Shows how to use the graph analysis algorithms.',
      demoPath: 'tutorial-yfiles-basic-features/12-graph-analysis/',
      thumbnailPath: 'resources/image/tutorial1step12.png',
      category: 'tutorial-basic-features',
      distributionType: 'needs-layout',
      tags: ['tutorial', 'basic features', 'analysis'],
      keywords: ['v2.6.0.0', 'Reachability', 'ShortestPaths', 'v2.2.0.0']
    },
    {
      id: 'tutorial-graph-builder',
      name: 'Tutorial: Graph Builder',
      summary: 'Learn how to convert business data into a graph using the GraphBuilder class.',
      demoPath: 'tutorial-graph-builder/01-create-graph/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'graph', 'import'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json', 'data binding']
    },
    {
      id: 'tutorial-graph-builder-create-graph',
      name: '01 Create Graph',
      summary:
        'Introduces the GraphBuilder class which helps to transfer business data into a graph.',
      demoPath: 'tutorial-graph-builder/01-create-graph/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'graph', 'import'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json', 'data binding'],

      thumbnailPath: 'resources/image/tutorial-05-graph-builder.png'
    },
    {
      id: 'tutorial-graph-builder-create-nodes-sources',
      name: '02 Create Nodes Sources',
      summary: 'Shows how to retrieve nodes from different data sources.',
      demoPath: 'tutorial-graph-builder/02-create-nodes-sources/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'nodes', 'import'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'graphbuilder',
        'business data',
        'json',
        'nodes sources',
        'data binding'
      ],

      thumbnailPath: 'resources/image/tutorial-05-nodes-sources.png'
    },
    {
      id: 'tutorial-graph-builder-create-edges-sources',
      name: '03 Create Edges Sources',
      summary: 'Shows how to retrieve edges from different data sources.',
      demoPath: 'tutorial-graph-builder/03-create-edges-sources/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'edges', 'import'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'graphbuilder',
        'business data',
        'json',
        'edges sources',
        'data binding'
      ],

      thumbnailPath: 'resources/image/tutorial-05-edges-sources.png'
    },
    {
      id: 'tutorial-graph-builder-group-nodes',
      name: '04 Group Nodes',
      summary:
        'Shows how to create group nodes to visualize hierarchy information within the business data.',
      demoPath: 'tutorial-graph-builder/04-group-nodes/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'groups', 'import'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'graphbuilder',
        'business data',
        'hierarchy',
        'json',
        'data binding'
      ],

      thumbnailPath: 'resources/image/tutorial-05-group-nodes.png'
    },
    {
      id: 'tutorial-graph-builder-implicit-grouping',
      name: '05 Implicit Grouping',
      summary: 'Shows how to create group nodes implicitly.',
      demoPath: 'tutorial-graph-builder/05-implicit-grouping/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'groups', 'import'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'graphbuilder',
        'business data',
        'grouping',
        'json',
        'import',
        'data binding'
      ],

      thumbnailPath: 'resources/image/tutorial-05-implicit-grouping.png'
    },
    {
      id: 'tutorial-graph-builder-configure-styles',
      name: '06 Configure Styles',
      summary: 'Shows how to associate different node and edge styles with the business data.',
      demoPath: 'tutorial-graph-builder/06-configure-styles/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'styling'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'graphbuilder',
        'business data',
        'json',
        'visualization',
        'data binding'
      ],

      thumbnailPath: 'resources/image/tutorial-05-configure-styles.png'
    },
    {
      id: 'tutorial-graph-builder-create-labels-sources',
      name: '07 Create Labels Sources',
      summary: 'Shows how to retrieve labels for nodes and edges from the business data.',
      demoPath: 'tutorial-graph-builder/07-create-labels-sources/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'labels', 'import'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json', 'data binding'],

      thumbnailPath: 'resources/image/tutorial-05-labels-sources.png'
    },
    {
      id: 'tutorial-graph-builder-configure-labels',
      name: '08 Configure Labels',
      summary: 'Shows how to associate different label styles with the business data.',
      demoPath: 'tutorial-graph-builder/08-configure-labels/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'labels', 'styling'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'data binding'],

      thumbnailPath: 'resources/image/tutorial-05-configure-labels.png'
    },
    {
      id: 'tutorial-graph-builder-configure-tags',
      name: '09 Configure Tags',
      summary: "Shows how to provide the business data in the elements' tags.",
      demoPath: 'tutorial-graph-builder/09-configure-tags/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'tags'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json', 'data binding'],

      thumbnailPath: 'resources/image/tutorial-05-configure-tags.png'
    },
    {
      id: 'tutorial-graph-builder-configure-layout',
      name: '10 Configure Layout',
      summary: 'Shows how to load positions for graph elements from the business data.',
      demoPath: 'tutorial-graph-builder/10-configure-layout/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'layout'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'graphbuilder',
        'business data',
        'json',
        'positions',
        'locations',
        'data binding'
      ],

      thumbnailPath: 'resources/image/tutorial-05-configure-layout.png'
    },
    {
      id: 'tutorial-graph-builder-update-graph',
      name: '11 Update Graph',
      summary: 'Shows how to update the graph after incremental changes in the business data.',
      demoPath: 'tutorial-graph-builder/11-update-graph/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'update'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json', 'data binding'],

      thumbnailPath: 'resources/image/tutorial-05-update-graph.png'
    },
    {
      id: 'tutorial-graph-builder-adjacency-graph-builder',
      name: '12 Adjacency Graph Builder',
      summary:
        'Shows how to build a graph from data with implicit relationship information using AdjacencyGraphBuilder.',
      demoPath: 'tutorial-graph-builder/12-adjacency-graph-builder/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'adjacency list'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'graphbuilder',
        'business data',
        'AdjacencyGraphBuilder',
        'json',
        'import',
        'data binding'
      ],

      thumbnailPath: 'resources/image/tutorial-05-adjacency-graph-builder.png'
    },
    {
      id: 'tutorial-graph-builder-tree-builder',
      name: '13 Tree Builder',
      summary: 'Shows how to build a graph from tree structured data using TreeBuilder.',
      demoPath: 'tutorial-graph-builder/13-tree-builder/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'tree'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'graphbuilder',
        'business data',
        'TreeBuilder',
        'json',
        'import',
        'data binding'
      ],

      thumbnailPath: 'resources/image/tutorial-05-tree-graph-builder.png'
    },
    {
      id: 'tutorial-node-style-implementation',
      name: 'Tutorial: Node Style Implementation',
      summary: 'Learn how to implement a custom node style using SVG.',
      demoPath: 'tutorial-style-implementation-node/01-create-a-rectangle/',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling']
    },
    {
      id: 'tutorial-node-style-implementation-create-a-rectangle',
      name: '01 Create A Rectangle',
      summary: 'Create a simple node style using SVG',
      demoPath: 'tutorial-style-implementation-node/01-create-a-rectangle/',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],

      thumbnailPath: 'resources/image/tutorial-06-create-a-rectangle.png'
    },
    {
      id: 'tutorial-node-style-implementation-create-a-custom-shape',
      name: '02 Create A Custom Shape',
      summary: 'Create a simple node style with a custom shape using SVG',
      demoPath: 'tutorial-style-implementation-node/02-create-a-custom-shape/',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'path', 'nodestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],

      thumbnailPath: 'resources/image/tutorial-06-create-a-custom-shape.png'
    },
    {
      id: 'tutorial-node-style-implementation-render-performance',
      name: '03 Render Performance',
      summary: 'Optimize rendering performance of an SVG node style',
      demoPath: 'tutorial-style-implementation-node/03-render-performance/',
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

      thumbnailPath: 'resources/image/tutorial-06-render-performance.png'
    },
    {
      id: 'tutorial-node-style-implementation-making-the-style-configurable',
      name: '04 Making the Style Configurable',
      summary: 'Make a custom node style configurable by adding properties',
      demoPath: 'tutorial-style-implementation-node/04-making-the-style-configurable/',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'configuration'],
      thumbnailPath: 'resources/image/tutorial-06-making-the-style-configurable.png'
    },
    {
      id: 'tutorial-node-style-implementation-data-from-tag',
      name: '05 Data from Tag',
      summary: 'Adjust how the node style renders the node using the node business data',
      demoPath: 'tutorial-style-implementation-node/05-data-from-tag/',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle', 'tag'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'business data'],

      thumbnailPath: 'resources/image/tutorial-06-data-from-tag.png'
    },
    {
      id: 'tutorial-node-style-implementation-render-text',
      name: '06 Rendering Text',
      summary: 'Adjust the node style to render text defined by the node business data',
      demoPath: 'tutorial-style-implementation-node/06-render-text/',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'TextRenderSupport'],

      thumbnailPath: 'resources/image/tutorial-06-render-text.png'
    },
    {
      id: 'tutorial-node-style-implementation-hit-testing',
      name: '07 Hit-Testing',
      summary: 'Customize which area of a node can be hovered and clicked',
      demoPath: 'tutorial-style-implementation-node/07-hit-testing/',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle', 'hittest'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'click', 'ishit'],

      thumbnailPath: 'resources/image/tutorial-06-hit-testing.png'
    },
    {
      id: 'tutorial-node-style-implementation-edge-cropping',
      name: '08 Edge Cropping',
      summary: 'Customize where edges at the node are cropped',
      demoPath: 'tutorial-style-implementation-node/08-edge-cropping/',
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

      thumbnailPath: 'resources/image/tutorial-06-edge-cropping.png'
    },
    {
      id: 'tutorial-node-style-implementation-visibility',
      name: '09 Item Visibility',
      summary:
        'Adjust the visibility check to parts of the node visualization that lie outside of the node bounds',
      demoPath: 'tutorial-style-implementation-node/09-visibility/',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle', 'visible'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'isvisible'],

      thumbnailPath: 'resources/image/tutorial-06-visibility.png'
    },
    {
      id: 'tutorial-node-style-implementation-bounds',
      name: '10 Render Boundaries',
      summary:
        'Adjust the node boundaries to parts of the node visualization that lie outside of the node bounds',
      demoPath: 'tutorial-style-implementation-node/10-bounds/',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle', 'bounds'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'getbounds'],

      thumbnailPath: 'resources/image/tutorial-06-bounds.png'
    },
    {
      id: 'tutorial-node-style-implementation-group-node-style',
      name: '11 Group Node Style',
      summary: 'Create a basic group node style',
      demoPath: 'tutorial-style-implementation-node/11-group-node-style/',
      category: 'tutorial-node-style-implementation',
      tags: ['svg', 'nodestyle', 'group'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'grouping', 'insets'],

      thumbnailPath: 'resources/image/tutorial-06-group-node-style.png'
    },
    {
      id: 'tutorial-node-style-implementation-group-node-style-behavior',
      name: '12 Group Node Style Behavior',
      summary: 'Adjust the group node style minimum size and size calculation',
      demoPath: 'tutorial-style-implementation-node/12-group-node-style-behavior/',
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
      thumbnailPath: 'resources/image/tutorial-06-group-node-style-behavior.png'
    },
    {
      id: 'tutorial-label-style-implementation',
      name: 'Tutorial: Label Style Implementation',
      summary: 'Learn how to implement a custom label style using SVG.',
      demoPath: 'tutorial-style-implementation-label/01-render-label-text/',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling']
    },
    {
      id: 'tutorial-label-style-implementation-render-label-text',
      name: '01 Rendering the Label Text',
      summary: 'Visualize a label using a basic text element',
      demoPath: 'tutorial-style-implementation-label/01-render-label-text/',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling'],

      thumbnailPath: 'resources/image/tutorial-07-render-label-text.png'
    },
    {
      id: 'tutorial-label-style-implementation-using-text-utilities',
      name: '02 Using Text Utilities',
      summary: 'Use convenience functionality to place the text',
      demoPath: 'tutorial-style-implementation-label/02-using-text-utilities/',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['tutorial', 'custom', 'styling'],

      thumbnailPath: 'resources/image/tutorial-07-using-text-utilities.png'
    },
    {
      id: 'tutorial-label-style-implementation-add-background-shape',
      name: '03 Adding a Background Shape',
      summary: 'Add a customized background to the label text',
      demoPath: 'tutorial-style-implementation-label/03-add-background-shape/',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling', 'background'],

      thumbnailPath: 'resources/image/tutorial-07-add-background-shape.png'
    },
    {
      id: 'tutorial-label-style-implementation-preferred-size',
      name: '04 Preferred Label Size',
      summary: 'Let the label style set the desired label size',
      demoPath: 'tutorial-style-implementation-label/04-preferred-size/',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling', 'size'],

      thumbnailPath: 'resources/image/tutorial-07-preferred-size.png'
    },
    {
      id: 'tutorial-label-style-implementation-render-performance',
      name: '05 Render Performance',
      summary: 'Optimize the render performance of the label style',
      demoPath: 'tutorial-style-implementation-label/05-render-performance/',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling'],

      thumbnailPath: 'resources/image/tutorial-07-render-performance.png'
    },
    {
      id: 'tutorial-label-style-implementation-text-alignment',
      name: '06 Text Alignment',
      summary: 'Configure horizontal and vertical text alignment inside the label bounds',
      demoPath: 'tutorial-style-implementation-label/06-text-alignment/',
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

      thumbnailPath: 'resources/image/tutorial-07-text-alignment.png'
    },
    {
      id: 'tutorial-label-style-implementation-line-wrapping',
      name: '07 Line Wrapping',
      summary: 'Add automatic line wrapping to the label style',
      demoPath: 'tutorial-style-implementation-label/07-line-wrapping/',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text', 'wrapping'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling', 'wrapping', 'line', 'break'],

      thumbnailPath: 'resources/image/tutorial-07-line-wrapping.png'
    },
    {
      id: 'tutorial-label-style-implementation-data-from-tag',
      name: '08 Data From Tag',
      summary: 'Use data from the label tag in the visualization',
      demoPath: 'tutorial-style-implementation-label/08-data-from-tag/',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling', 'business data'],

      thumbnailPath: 'resources/image/tutorial-07-data-from-tag.png'
    },
    {
      id: 'tutorial-label-style-implementation-hit-testing',
      name: '09 Hit-Testing',
      summary: 'Configure which parts of the label visualization are clickable',
      demoPath: 'tutorial-style-implementation-label/09-hit-testing/',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text', 'hittest'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling'],

      thumbnailPath: 'resources/image/tutorial-07-hit-testing.png'
    },
    {
      id: 'tutorial-label-style-implementation-visibility',
      name: '10 Visibility',
      summary:
        'Adjust the visibility check to parts of the label visualization that lie outside of the label bounds',
      demoPath: 'tutorial-style-implementation-label/10-visibility/',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],

      thumbnailPath: 'resources/image/tutorial-07-visibility.png'
    },
    {
      id: 'tutorial-label-style-implementation-bounds',
      name: '11 Bounds',
      summary:
        'Adjust the label boundaries to parts of the label visualization that lie outside of the label bounds',
      demoPath: 'tutorial-style-implementation-label/11-bounds/',
      category: 'tutorial-label-style-implementation',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling'],

      thumbnailPath: 'resources/image/tutorial-07-bounds.png'
    },
    {
      id: 'tutorial-edge-style-implementation',
      name: 'Tutorial: Edge Style Implementation',
      summary: 'Learn how to implement a custom edge style using SVG.',
      demoPath: 'tutorial-style-implementation-edge/01-create-a-polyline/',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling']
    },
    {
      id: 'tutorial-edge-style-implementation-create-a-polyline',
      name: '01 Create a Polyline',
      summary: 'Create a simple edge style using SVG',
      demoPath: 'tutorial-style-implementation-edge/01-create-a-polyline/',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],

      thumbnailPath: 'resources/image/tutorial-08-create-a-polyline.png'
    },
    {
      id: 'tutorial-edge-style-implementation-crop-the-polyline',
      name: '02 Crop the Polyline',
      summary: 'Crop the edge path at the outline of its source and target nodes.',
      demoPath: 'tutorial-style-implementation-edge/02-crop-the-polyline/',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],

      thumbnailPath: 'resources/image/tutorial-08-crop-the-polyline.png'
    },
    {
      id: 'tutorial-edge-style-implementation-create-parallel-polylines',
      name: '03 Create Parallel Polylines',
      summary: 'Create parallel polylines for edge visualization.',
      demoPath: 'tutorial-style-implementation-edge/03-create-parallel-polylines/',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],
      thumbnailPath: 'resources/image/tutorial-08-create-parallel-polylines.png'
    },
    {
      id: 'tutorial-edge-style-implementation-render-performance',
      name: '04 Render Performance',
      summary: 'Optimize rendering performance of an SVG edge style',
      demoPath: 'tutorial-style-implementation-edge/04-render-performance/',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling'],

      thumbnailPath: 'resources/image/tutorial-08-render-performance.png'
    },
    {
      id: 'tutorial-edge-style-implementation-making-the-style-configurable',
      name: '05 Making the Style Configurable',
      summary: 'Make a custom edge style configurable by adding properties',
      demoPath: 'tutorial-style-implementation-edge/05-making-the-style-configurable/',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'distance'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'configuration'],
      thumbnailPath: 'resources/image/tutorial-08-making-the-style-configurable.png'
    },
    {
      id: 'tutorial-edge-style-implementation-data-from-tag',
      name: '06 Data from Tag',
      summary: 'Adjust how the edge style renders the edge using the edge business data',
      demoPath: 'tutorial-style-implementation-edge/06-data-from-tag/',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'color', 'tag'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'business data'],

      thumbnailPath: 'resources/image/tutorial-08-data-from-tag.png'
    },
    {
      id: 'tutorial-edge-style-implementation-hit-testing',
      name: '07 Hit-Testing',
      summary: 'Customize which area of a edge can be hovered and clicked',
      demoPath: 'tutorial-style-implementation-edge/07-hit-testing/',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'hittest'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'click', 'ishit'],

      thumbnailPath: 'resources/image/tutorial-08-hit-testing.png'
    },
    {
      id: 'tutorial-edge-style-implementation-visibility',
      name: '08 Item Visibility',
      summary:
        'Adjust the visibility check to parts of the edge visualization that lie outside of the edge bounds',
      demoPath: 'tutorial-style-implementation-edge/08-visibility/',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'visible'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'isvisible'],

      thumbnailPath: 'resources/image/tutorial-08-visibility.png'
    },
    {
      id: 'tutorial-edge-style-implementation-bounds',
      name: '09 Render Boundaries',
      summary:
        'Adjust the edge boundaries to parts of the edge visualization that lie outside of the edge path',
      demoPath: 'tutorial-style-implementation-edge/09-bounds/',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'bounds'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'getbounds'],

      thumbnailPath: 'resources/image/tutorial-08-bounds.png'
    },
    {
      id: 'tutorial-edge-style-implementation-bridge-support',
      name: '10 Bridge Support',
      summary:
        'Adjust the edge visualization to resolve the visual ambiguity induced by intersecting edge paths',
      demoPath: 'tutorial-style-implementation-edge/10-bridge-support/',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'bridge'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'bridge'],

      thumbnailPath: 'resources/image/tutorial-08-bridge-support.png'
    },
    {
      id: 'tutorial-edge-style-implementation-adding-arrows',
      name: '11 Adding Arrows',
      summary: 'Add arrows to indicate the edge’s direction',
      demoPath: 'tutorial-style-implementation-edge/11-adding-arrows/',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'arrow'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'arrow'],

      thumbnailPath: 'resources/image/tutorial-08-adding-arrows.png'
    },
    {
      id: 'tutorial-edge-style-implementation-custom-arrow',
      name: '12 Custom Arrow',
      summary: 'Create a custom arrow that matches our edge style',
      demoPath: 'tutorial-style-implementation-edge/12-custom-arrow/',
      category: 'tutorial-edge-style-implementation',
      tags: ['svg', 'edgestyle', 'arrow'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'arrow'],

      thumbnailPath: 'resources/image/tutorial-08-custom-arrow.png'
    },
    {
      id: 'tutorial-port-style-implementation',
      name: 'Tutorial: Port Style Implementation',
      summary: 'Learn how to implement a custom port style using SVG.',
      demoPath: 'tutorial-style-implementation-port/01-render-port-shape/',
      category: 'tutorial-port-style-implementation',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling']
    },
    {
      id: 'tutorial-port-style-implementation-render-port-shape',
      name: '01 Rendering the Port',
      summary: 'Visualize a port as a basic circle shape',
      demoPath: 'tutorial-style-implementation-port/01-render-port-shape/',
      category: 'tutorial-port-style-implementation',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling'],

      thumbnailPath: 'resources/image/tutorial-09-render-port-shape.png'
    },
    {
      id: 'tutorial-port-style-implementation-port-size',
      name: '02 Port Size',
      summary: 'Configuring the port size in the style',
      demoPath: 'tutorial-style-implementation-port/02-port-size/',
      category: 'tutorial-port-style-implementation',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling'],

      thumbnailPath: 'resources/image/tutorial-09-port-size.png'
    },
    {
      id: 'tutorial-port-style-implementation-render-performance',
      name: '03 Render Performance',
      summary: 'Optimize rendering performance of an SVG port style',
      demoPath: 'tutorial-style-implementation-port/03-render-performance/',
      category: 'tutorial-port-style-implementation',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling', 'optimization'],

      thumbnailPath: 'resources/image/tutorial-09-render-performance.png'
    },
    {
      id: 'tutorial-port-style-implementation-conditional-coloring',
      name: '04 Conditional Port Coloring',
      summary: 'Set the color of the port based on the number of connected edges',
      demoPath: 'tutorial-style-implementation-port/04-conditional-coloring/',
      category: 'tutorial-port-style-implementation',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling', 'color', 'fill'],

      thumbnailPath: 'resources/image/tutorial-09-conditional-coloring.png'
    },
    {
      id: 'tutorial-port-style-implementation-hit-testing',
      name: '05 Hit-Testing',
      summary: 'Customize which area of a port can be hovered and clicked',
      demoPath: 'tutorial-style-implementation-port/05-hit-testing/',
      category: 'tutorial-port-style-implementation',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling'],

      thumbnailPath: 'resources/image/tutorial-09-hit-testing.png'
    },
    {
      id: 'tutorial-port-style-implementation-edge-cropping',
      name: '06 Edge Cropping',
      summary: 'Crop the edge at the port outline',
      demoPath: 'tutorial-style-implementation-port/06-edge-cropping/',
      category: 'tutorial-port-style-implementation',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling'],

      thumbnailPath: 'resources/image/tutorial-09-edge-cropping.png'
    },
    {
      id: 'yfiles-demo-list',
      name: 'yFiles Demo List',
      summary: 'Lists all source code demos that are included in the yFiles package.',
      demoPath: './README.html',
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
    demo.demoDir ??= getDemoDir(demo)
  }

  return demoDataArray
}

/**
 * Returns the directory of the given demo according to its demoPath property.
 * @param {{demoPath:string}} demoEntry - The data of a single demo.
 */
function getDemoDir(demoEntry) {
  const demoPath = demoEntry.demoPath
  return demoPath.substring(0, demoPath.lastIndexOf('/'))
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
