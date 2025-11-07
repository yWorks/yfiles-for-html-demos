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
// eslint-disable-next-line no-unused-vars

/**
 * @typedef {'analysis'|'application-features'|'data-binding'|'input'|'integration'|'layout'|'layout-features'|'loading'|'showcase'|'style'|'testing'|'view'}  NormalDemoCategory
 */

/**
 * @typedef {'tutorial-basic-features'|'tutorial-style-implementation-edge'|'tutorial-graph-builder'|'tutorial-style-implementation-label'|'tutorial-style-implementation-node'|'tutorial-style-implementation-port'} TutorialCategory
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
    'tutorial-style-implementation-edge': 'Tutorial: Edge Style Implementation',
    'tutorial-graph-builder': 'Tutorial: Graph Builder',
    'tutorial-style-implementation-label': 'Tutorial: Label Style Implementation',
    'tutorial-style-implementation-node': 'Tutorial: Node Style Implementation',
    'tutorial-style-implementation-port': 'Tutorial: Port Style Implementation',
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
      summary: `Presents yFiles' exceptional layout algorithms, including hierarchical,
       organic, orthogonal, tree, edge routing, and more.`,
      description: `This demo presents yFiles' exceptional automatic layout algorithms, including hierarchical,
       organic, orthogonal, tree, circular, radial tree, and various edge routing styles.
       Explore a broad range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'showcase',
      tags: ['layout', 'edge routing'],
      keywords: [
        'layout styles samples',
        'options',
        'overview',
        'hierarchical',
        'organic',
        'orthogonal',
        'circular',
        'tree',
        'radial tree',
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
      id: 'layout-styles-hierarchical',
      name: 'Layout Styles: Hierarchical',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=hierarchical&sample=hierarchical',
      summary: `Presents yFiles' hierarchical layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' hierarchical layout algorithm and its other layout
       styles.
       Hierarchical layouts are particularly useful for directed diagrams, like flow charts, BPMN
       diagrams and more.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      tags: ['layout', 'hierarchical'],
      keywords: [
        'layout styles samples',
        'layout algorithm',
        'HierarchicalLayout',
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
        'from sketch',
        'grouping',
        'layout grid',
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
      id: 'layout-styles-edge-router',
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
        'hierarchical',
        'hierarchy',
        'data analysis'
      ]
    },
    {
      id: 'layout-styles-radial-tree',
      name: 'Layout Styles: Radial Tree',
      hiddenInGrid: true,
      demoPath: 'showcase/layoutstyles/index.html?layout=radial-tree&sample=radial-tree',
      summary: `Presents yFiles' radial tree layout algorithm and its other layout styles.`,
      description: `This demo presents yFiles' radial tree layout algorithm and its other layout
       styles.
       As a subtype of tree layouts, radial tree layouts are particularly useful to visualize tree-like
       structures in a radial fashion.
       Explore a wide range of pre-built sample graphs and use cases, or delve into the specifics
       and tailor the layout to your requirements.`,
      category: 'layout',
      tags: ['layout', 'radial-tree', 'balloon'],
      keywords: [
        'layout styles samples',
        'radial tree layout',
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
      tags: ['layout', 'compact disk'],
      keywords: ['v2.5.0.0', 'layout styles samples', 'concentric', 'compact disk', 'round']
    },
    {
      id: 'layout-styles-series-parallel',
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
      tags: ['webgl', 'animation', 'heatmap'],
      keywords: ['v2.3.0.2', 'notable style', 'data analysis']
    },
    {
      id: 'supply-chain',
      name: 'Supply Chain',
      demoPath: 'showcase/supply-chain/',
      summary: 'Showcases an interactive bakery supply chain.',
      description: `This demo visualizes a bakery supply chain in France from grain farms to
        supermarket shelves. Each site manages a set of products. You can increase and decrease
        stock levels, simulating production and sales. Use the graph's highlighting feature to
        trace and compare product flows.`,
      category: 'showcase',
      tags: ['interaction', 'style'],
      keywords: [
        'v3.0.0.4',
        'supply chain',
        'supplychain',
        'supply-chain',
        'highlight',
        'highlighting',
        'expand',
        'collapse',
        'folding',
        'port',
        'ports',
        'hierarchical',
        'hierarchy',
        'bakery',
        'bake',
        'data flow',
        'data management',
        'explore',
        'animations'
      ]
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
      description: `This demo shows how to create a Gantt chart from JSON data.
      The diagram demonstrates the planning and scheduling of a software project in a calendar view,
       showing the activities in relation to the tasks they belong to and the time when they have
       to be done.
      Select to display the detailed information of each activity.`,
      category: 'view',
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
      tags: ['webgl', 'style', 'layout', 'projection'],
      keywords: [
        'v2.3.0.0',
        'groups',
        'folding',
        'hierarchical',
        'orthogonal',
        'labels',
        '3d',
        'isometric',
        'padding',
        'margin'
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
      description: `This demo shows how to render metaball-like background visualizations that
      demonstrate how nodes are associated with zero or more groups.
      The app calculates a new layout using yFiles organic layout algorithm every time the "Change
      Layout" button is pressed.
      Hardware-accelerated WebGL is used in this demo for the efficient rendering of the metaballs.`,
      category: 'showcase',
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
      description: `This demo is a graph wizard for flowchart diagrams. It shows how graph defaults
      and input gestures can be customized to enable the fast creation of flowcharts.
      In the graph wizard, actions are triggered by the buttons or the keyboard shortcuts, and the
      created graph can be saved and exported in a GraphML file.`,
      summary: 'Customizes defaults and input gestures to support fast creation of flowcharts.',
      category: 'showcase',
      tags: ['wizard', 'flowchart'],
      keywords: ['v2.4.0.4', 'flow', 'shapes', 'layout', 'input', 'button', 'data management']
    },
    {
      id: 'flowchart-editor',
      name: 'Flowchart Editor',
      demoPath: 'showcase/flowchart/',
      summary:
        'An editor for Flowchart diagrams that features interactive editing, flowchart node styles, and automatic layout.',
      description: `This sample app is an editor for flowchart diagrams. It features interactive
      editing and automatic layout, and demonstrates a number of node styles which are shaped as
      common flowchart symbols.
      It offers a set of sample graphs, on which different node styles and flowchart layout can be
      tried out.`,
      category: 'showcase',
      tags: ['style', 'layout', 'drag and drop'],
      keywords: ['hierarchical', 'palette', 'dnd', 'data management']
    },
    {
      id: 'uml-editor',
      name: 'UML Editor',
      demoPath: 'showcase/uml/',
      summary:
        'An editor for UML diagrams with a tailored UML node style, automatic layout, and a quick way to create new edges with the mouse or touch.',
      description: `This sample app is an editor for UML diagrams. It showcases a custom UML node
      style that renders a UML data set, as well as additional control elements for creating entries
      and edges.
      Every time the Layout button is pressed, a new layout is calculated using the yFiles hierarchical
      layout algorithm, and the inheritance edges are bundled.`,
      category: 'showcase',
      tags: ['style', 'layout', 'interaction'],
      keywords: [
        'v2.1.0.1',
        'context menu',
        'labels',
        'edge router',
        'hierarchical',
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
      description: `This demo shows how to create an interactive decision tree from a graph.
      The decision tree starts with the root node and its child nodes. When clicking on any node,
      its child nodes will be displayed accordingly. In this way, you can unfold the decision tree
      step-by-step with the selected nodes.`,
      category: 'showcase',
      tags: ['layout', 'interaction'],
      keywords: ['hierarchical', 'context menu', 'data management']
    },
    {
      id: 'mindmap-editor',
      name: 'Mindmap Editor',
      demoPath: 'showcase/mindmap/',
      summary:
        'A Mindmap editor with a tailored node style, custom user interaction, and a specialized layout that automatically arranges new entries.',
      description: `This demo presents an interactive mind map application. It is used for
      organizing information and showing relations between items. It showcases the custom node style
      and interactions for mind maps.
      The yFiles tree layout algorithm ensures that the graph is nicely laid out and new entries
      are automatically arranged.`,
      category: 'showcase',
      tags: ['style', 'layout', 'interaction'],
      keywords: ['context menu', 'tree', 'structures', 'labels', 'notable style']
    },
    {
      id: 'sankey-diagram',
      name: 'Sankey Diagram',
      demoPath: 'layout/sankey/',
      summary:
        'A diagram used for visualizing flow information in which the thickness of the edges is proportional to the flow quantity.',
      description: `This demo presents a sankey diagram, visualizing the voter's migration flow
      between different political parties over the course of four elections.
      From left to right, the thickness of the edges is proportional to the flow quantity. The
      layout is realized with yFiles hierarchical layout algorithm.`,
      category: 'layout',
      tags: ['edge thickness', 'style', 'layout'],
      keywords: ['context menu', 'hierarchical', 'generic labeling', 'labels', 'data analysis']
    },
    {
      id: 'tree-of-life',
      name: 'Tree of Life',
      demoPath: 'showcase/tree-of-life/',
      summary: 'An interactive radial dendrogram visualization of the Tree of Life.',
      description: `An interactive radial dendrogram visualization of the Tree of Life. The demo
       dataset is incomplete and contains 30,000 of the more than 2.3 million species
       that have lived on Earth.
       For better interaction and rendering performance, WebGL is used to render the graph
       items.`,
      category: 'showcase',
      tags: ['styles', 'layout', 'webgl'],
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
      id: 'home-automation',
      name: 'Home Automation',
      demoPath: 'showcase/home-automation/',
      summary: 'Demonstrates visual programming of a home automation network.',
      description: `This demo simulates a tool for visually programming a home automation network,
      in which the nodes represent various stages of data flow within the system.
      It showcases the application of basic validation, namely, output ports can only be
      connected to input ports, no edges can be duplicated, and the required properties of nodes
      must be provided.`,
      category: 'showcase',
      tags: ['interaction', 'layout', 'drag and drop'],
      keywords: ['v2.6.0.3', 'validation', 'grid']
    },
    {
      id: 'tree-map',
      name: 'Tree Map',
      demoPath: 'layout/treemap/',
      summary: 'Shows disk usage of a directory tree with the Tree Map layout.',
      description: `This demo presents a treemap chart, visualizing the disk usage of a directory
      tree.
      In this use case, the files are represented in nested rectangles, the displayed sizes of which
       are proportional to their actual sizes on the disk.
      The yFiles TreeMap layout algorithm ensures the efficient arrangement of the nodes according
      to their weights and relations inside groups.`,
      category: 'layout',
      tags: ['layout', 'tree map'],
      keywords: [
        'tree map',
        'v2.1.0.0',
        'animations',
        'tool tips',
        'data analysis',
        'data management',
        'padding',
        'margin'
      ]
    },
    {
      id: 'tag-cloud',
      name: 'Tag Cloud',
      demoPath: 'showcase/tag-cloud/',
      summary: 'Shows how to create a Tag Cloud.',
      description: `This demo presents a tag cloud application, visualizing the frequencies of words
      in a text document.
      In this tag cloud, the more frequent words are displayed with increasingly larger font sizes,
      and the minimum frequency for words to be displayed can be controlled with the Word Frequency
      slider.`,
      category: 'showcase',
      tags: ['layout', 'style'],
      keywords: ['v2.4.0.4', 'words', 'components', 'labels']
    },
    {
      id: 'critical-path-analysis',
      name: 'Critical Path Analysis (CPA)',
      demoPath: 'analysis/criticalpathanalysis/',
      summary: 'Shows how to perform critical path analysis in project management.',
      description: `This demo shows how to perform critical path analysis in project management with
      the example of a construction project. It maps out the most important tasks in the project and
      estimates the time needed to complete the project.
      The graph uses the Rank Assignment algorithm to calculate the critical path, and the hierarchic
      layout places the nodes in layers based on their ranking.`,
      category: 'analysis',
      tags: ['analysis', 'hierarchical', 'rank'],
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
      description: `This sample app is an editor for networks of logic gates. It showcases the
      visualization of a digital system with yFiles for HTML.
      The graph uses port candidates to make sure that the incoming edges only connect to the left
      side of the target node, while outgoing edges only connect to the right side of the source
      node.`,
      category: 'showcase',
      tags: ['port', 'style', 'layout'],
      keywords: [
        'ports',
        'candidates',
        'constraints',
        'hierarchical',
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
      id: 'hierarchical-nesting',
      name: 'Hierarchical Nesting',
      demoPath: 'layout/hierarchical-nesting/',
      summary:
        'The hierarchical layout nicely expands and collapses sub-graphs organized in groups.',
      description: `This demo demonstrates how to nicely expand and collapse sub-graphs that are
      organized in groups, which can help to keep complex hierarchically organized diagrams clear
      and straightforward.
      The from sketch mode of the hierarchical layout algorithm ensures that the currently visible
      part of the graph is well-organized while remaining similar to the previous arrangement.`,
      category: 'layout',
      tags: ['layout', 'hierarchical', 'animation'],
      keywords: ['overview', 'folding', 'hide', 'grouping', 'from sketch', 'padding']
    },
    {
      id: 'hierarchical-nesting-incremental',
      name: 'Hierarchical Nesting (Incremental)',
      demoPath: 'layout/hierarchical-nesting-incremental/',
      summary: 'Shows how to nicely lay out newly loaded nodes when expanding folded groups.',
      description: `This demo shows how to nicely lay out the newly loaded nodes in graph when the
      collapsed groups are unfolded.
      Each time a folded group is expanded, all of its child nodes are retrieved and marked as
      incremental. The from sketch mode of the layout algorithm then ensures that the currently
      visible part of the graph is well-organized while remaining similar to the previous arrangement.`,
      category: 'layout',
      tags: ['layout', 'hierarchical', 'incremental'],
      keywords: [
        'v3.0.0.0',
        'overview',
        'fold',
        'hide',
        'group',
        'dynamic',
        'load',
        'collapse',
        'from sketch',
        'interactive',
        'data',
        'padding'
      ]
    },
    {
      id: 'folding-with-layout',
      name: 'Folding With Layout',
      demoPath: 'layout/foldingwithlayout/',
      summary:
        'Shows how an automatic layout makes space for opening groups and reclaims the space of closing groups.',
      category: 'layout',
      tags: ['layout', 'hierarchical', 'grouping'],
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
        'Shows how to display large graphs with both good performance in WebGL and high quality in SVG.',
      category: 'showcase',
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
      tags: ['large graph', 'exploration'],
      keywords: [
        'v2.3.0.0',
        'v2.5.0.0',
        'balloon',
        'radial group',
        'radial tree',
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
      description: `This demo shows the use of WebGL as a rendering technique for displaying very
       large graphs with high performance. Starting from a small tree graph, you can add more layers
       of children to the graph, up to a maximum of 250,000 nodes.
       The yFiles tree layout algorithm ensures that the graph is nicely laid out. Animations
       smoothly transition the graph to the new state.`,
      category: 'view',
      distributionType: 'needs-layout',
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
      tags: ['layout', 'interaction', 'animation'],
      keywords: [
        'hierarchical',
        'organic',
        'tree',
        'balloon',
        'radial',
        'filtering',
        'hide',
        'collapse'
      ]
    },
    {
      id: 'neighborhood-view',
      name: 'Neighborhood View',
      demoPath: 'showcase/neighborhood/',
      summary: 'Shows the neighborhood of the currently selected node alongside the graph.',
      category: 'showcase',
      tags: ['layout', 'interaction'],
      keywords: ['hierarchical', 'copy', 'detail', 'data analysis', 'data management', 'margin']
    },
    {
      id: 'neighborhood-circles',
      name: 'Neighborhood Circles',
      demoPath: 'showcase/neighborhood-circles/',
      summary: 'Shows the neighborhood of selected nodes arranged on concentric circles.',
      category: 'showcase',
      tags: ['layout', 'interaction'],
      keywords: [
        'v2.6.0.0',
        'radial',
        'copy',
        'detail',
        'data analysis',
        'data management',
        'margin'
      ]
    },
    {
      id: 'contextual-toolbar',
      name: 'Contextual Toolbar',
      demoPath: 'view/contextualtoolbar/',
      summary:
        'Shows a contextual toolbar for the current selection that enables fast and easy style changes.',
      category: 'view',
      distributionType: 'needs-layout',
      tags: ['interaction', 'overlay'],
      keywords: ['v2.1.0.2', 'html', 'popup', 'context menu']
    },
    {
      id: 'magnifying-glass',
      name: 'Magnifying Glass',
      demoPath: 'input/magnifying-glass/',
      summary: "Shows a floating lens that magnifies the cursor's surroundings.",
      category: 'input',
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
      tags: ['css', 'animation', 'style'],
      keywords: ['v2.6.0.0', 'stylesheets', 'transition', 'fading', 'fade-out', 'padding', 'margin']
    },
    {
      id: 'label-style',
      name: 'Label Style',
      demoPath: 'style/label-style/',
      summary: 'Shows the features of the LabelStyle class.',
      category: 'style',
      tags: ['style', 'labels'],
      keywords: ['v2.5.0.0', 'library style', 'style options', 'padding']
    },
    {
      id: 'rectangle-node-style',
      name: 'Rectangle Node Style',
      demoPath: 'style/rectangle-node-style/',
      summary:
        'Shows the different node shapes that can be implemented with the RectangleNodeStyle class.',
      category: 'style',
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
      tags: ['style', 'nodes', 'shapes'],
      keywords: [
        'v2.5.0.0',
        'library style',
        'style options',
        'node shape',
        'ellipse',
        'pill',
        'pentagon',
        'rectangle',
        'octagon',
        'diamond',
        'hexagon',
        'triangle',
        'star'
      ]
    },
    {
      id: 'shape-port-style',
      name: 'Shape Port Style',
      demoPath: 'style/shape-port-style/',
      summary: 'Shows the features of the ShapePortStyle class.',
      description: `This demo showcases all port shapes that can be created using the ShapePortStyle class.
       Besides port shapes, ShapePortStyle class offers other properties to further customize ports,
       including fill, stroke, size and offset.`,
      category: 'style',
      tags: ['style', 'ports', 'shapes'],
      keywords: [
        'v3.0.0.0',
        'library style',
        'style options',
        'port shape',
        'ellipse',
        'pill',
        'pentagon',
        'rectangle',
        'octagon',
        'diamond',
        'hexagon',
        'triangle',
        'star'
      ]
    },
    {
      id: 'group-node-style',
      name: 'Group Node Style',
      demoPath: 'style/group-node-style/',
      summary:
        'Shows the group and folder node visualization options offered by the GroupNodeStyle class.',
      category: 'style',
      tags: ['style', 'nodes', 'webgl'],
      keywords: ['v2.5.0.0', 'library style', 'style options', 'webgl2', 'padding', 'margin']
    },
    {
      id: 'arrow',
      name: 'Arrow',
      demoPath: 'style/arrow/',
      summary: 'Shows all arrow types of the Arrow class.',
      description: `This demo showcases all arrow types that can be created using the Arrow class.
       Different arrow types visualize the arrow in different shapes.
       Besides arrow types, Arrow class offers other properties to further customize arrows,
       including fill, stroke, length and scale.`,
      category: 'style',
      tags: ['arrows', 'edges'],
      keywords: [
        'v3.0.0.0',
        'arrow type',
        'arrowtype',
        'chevron',
        'cross',
        'deltoid',
        'diamond',
        'ellipse',
        'kite',
        'stealth',
        'triangle'
      ]
    },
    {
      id: 'arrow-node-style',
      name: 'Arrow Node Style',
      demoPath: 'style/arrow-node-style/',
      summary: 'Shows the features of the ArrowNodeStyle class.',
      category: 'style',
      tags: ['style', 'nodes', 'arrows'],
      keywords: ['v2.5.0.0', 'library style', 'style options']
    },
    {
      id: 'arrow-edge-style',
      name: 'Arrow Edge Style',
      demoPath: 'style/arrow-edge-style/',
      summary: 'Shows the features of the ArrowEdgeStyle class.',
      category: 'style',
      tags: ['style', 'edges', 'arrows'],
      keywords: ['v2.5.0.0', 'library style', 'style options']
    },
    {
      id: 'webgl-animations',
      name: 'WebGL Animations',
      demoPath: 'style/webgl-animations/',
      summary: 'Shows howto use WebGL animations to highlight interesting parts of a graph.',
      category: 'style',
      tags: ['animation', 'webgl'],
      keywords: ['v2.4.0.0', 'v2.5.0.0', 'webgl2']
    },
    {
      id: 'webgl-label-fading',
      name: 'WebGL Label Fading',
      demoPath: 'view/webgl-label-fading/',
      summary:
        'Shows how to achieve a simple level of detail effect by fading in/out labels at a certain zoom value using WebGL rendering.',
      category: 'view',
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
      tags: ['analysis'],
      keywords: ['k-means', 'hierarchical', 'voronoi', 'dendrogram', 'background', 'data analysis']
    },
    {
      id: 'intersection-detection',
      name: 'Intersection Detection',
      demoPath: 'analysis/intersection-detection/',
      summary: 'Shows how to compute and highlight intersections between graph items.',
      category: 'analysis',
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
      tags: ['interaction'],
      keywords: ['v2.5.0.0', 'cursors', 'marquee', 'lasso', 'viewport', 'tooltips', 'playground']
    },
    {
      id: 'table-editor',
      name: 'Table Editor',
      demoPath: 'application-features/tableeditor/',
      summary:
        'Shows the support for diagrams that are organized in a tabular way, for example in a grid or a swimlane layout.',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['table', 'interaction'],
      keywords: [
        'drag and drop',
        'palette',
        'hierarchical',
        'groups',
        'context menu',
        'move',
        'labels',
        'dnd',
        'padding'
      ]
    },
    {
      id: 'graph-viewer',
      name: 'Graph Viewer',
      demoPath: 'view/graphviewer/',
      summary: 'Displays sample graphs from various application domains.',
      category: 'view',
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
      tags: ['rendering', 'z-order', 'grouping'],
      keywords: ['hierarchical nesting', 'ports', 'labels', 'groups']
    },
    {
      id: 'z-order',
      name: 'Z-Order',
      demoPath: 'view/zorder/',
      summary:
        'Shows how to adjust the z-order of graph elements and to keep this z-order consistent.',
      category: 'view',
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
      tags: ['style', 'layout', 'interaction'],
      keywords: [
        'handles',
        'input',
        'rotation',
        'v2.1.0.1',
        'labels',
        'ports',
        'hierarchical',
        'organic',
        'orthogonal',
        'circular',
        'tree',
        'radial tree',
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
      tags: ['view', 'styles', 'groups'],
      keywords: ['v2.5.0.2', 'group', 'group style', 'viewport', 'folding', 'zoom', 'content']
    },
    {
      id: 'arrange-objects',
      name: 'Arrange Objects',
      demoPath: 'view/arrange-objects/',
      summary: 'Shows simple operations for aligning and distributing nodes.',
      category: 'view',
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
      tags: ['style', 'grouping'],
      keywords: ['folding', 'labels', 'ports', 'padding', 'margin']
    },
    {
      id: 'template-styles',
      name: 'Template Styles',
      demoPath: 'style/templatestyles/',
      summary: 'Shows SVG template styles for nodes using a simple templating engine.',
      description: `This demo shows how to make use of a custom simple SVG templating engine for
        the creation of data-bound node style visualizations.`,
      category: 'style',
      distributionType: 'needs-layout',
      tags: ['style', 'data binding'],
      keywords: ['v3.0.0.0', 'svg', 'data panel', 'templates', 'notable style']
    },
    {
      id: 'template-node-style',
      name: 'Template Node Style',
      demoPath: 'style/template-node-style/',
      summary:
        'Presents a versatile and customizable template node style using a simple templating engine.',
      description: `Interactively edit an SVG template for nodes to see how data-binding can be used for the
       creation of rich, responsive node style visualizations.`,
      category: 'style',
      tags: ['style', 'template'],
      keywords: ['v3.0.0.0', 'data bindings', 'data panel']
    },
    {
      id: 'react-template-node-style',
      name: 'React JSX Component Style',
      demoPath: 'style/react-template-node-style/README.html',
      summary:
        'Presents a versatile and easily customizable template node style based on JSX and React.',
      category: 'style',
      languageType: 'ts-only',
      tags: ['style', 'template', 'react', 'jsx'],
      keywords: ['v2.5.0.2', 'data bindings', 'data panel', 'tree', 'htmlvisual']
    },
    {
      id: 'vue-template-node-style',
      name: 'Vue Template Node Style',
      demoPath: 'style/vue-template-node-style/README.html',
      summary: 'Presents a versatile and easily customizable template node style based on Vue.',
      category: 'style',
      languageType: 'ts-only',
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
      tags: ['style', 'template', 'lit'],
      keywords: ['v2.5.0.2', 'data bindings', 'data panel', 'conditional', 'rendering']
    },
    {
      id: 'webgl-styles',
      name: 'WebGL Styles',
      demoPath: 'style/webgl-styles/',
      summary: 'Shows the various graph item styles available in WebGL rendering.',
      description: `This demo shows the available styles for nodes, edges and labels in WebGL
       rendering mode. You can interactively change each major style property in a settings panel.
       Due to the technical limitations of WebGL, the visualization of graph items in this
       rendering mode is not fully configurable, but limited to the provided properties. This is
       different from SVG, where you can use any SVG feature and snippet for visualization.`,
      category: 'style',
      tags: ['style', 'webgl'],
      keywords: ['v2.4.0.0', 'v2.5.0.0', 'styles', 'notable style', 'webgl2']
    },
    {
      id: 'webgl-selection-styles',
      name: 'WebGL Selection Styles',
      demoPath: 'style/webgl-selection-styles/',
      summary: 'Shows the possible styling configurations for selections in WebGL rendering.',
      category: 'style',
      tags: ['style', 'webgl', 'selection'],
      keywords: ['v2.5.0.0', 'styles', 'webgl2']
    },
    {
      id: 'css-styling',
      name: 'CSS Styling',
      demoPath: 'style/cssstyling/',
      summary: 'Shows how to style indicators and other templates.',
      category: 'style',
      distributionType: 'needs-layout',
      tags: ['css', 'indicators', 'themes'],
      keywords: ['stylesheets', 'v2.2.0.0', 'labels', 'notable style', 'padding']
    },
    {
      id: 'theme-variants',
      name: 'Theme Variants',
      demoPath: 'style/theme-variants/',
      summary: 'Shows various interaction visualization themes simultaneously.',
      category: 'style',
      tags: ['theme', 'handle', 'color'],
      keywords: ['v2.5.0.0']
    },
    {
      id: 'isometric-bar-chart-style',
      name: 'Isometric Bar Chart Node Style',
      demoPath: 'style/isometric-bar-chart-style/',
      summary: 'Shows how a node style can be augmented with isometric bars.',
      category: 'style',
      tags: ['styles', 'projection', 'bars'],
      keywords: ['v2.4.0.4', 'organic', 'labels', '3D', 'isometric', 'bars', 'notable style']
    },
    {
      id: 'd3-chart-nodes',
      name: 'd3 Chart Nodes',
      demoPath: 'style/d3chartnodes/',
      summary: 'Presents a node style that visualizes dynamic data with d3.js.',
      category: 'style',
      tags: ['style', 'sparklines', 'bars'],
      keywords: ['v2.2.0.0', 'd3js', 'd3.js']
    },
    {
      id: 'editable-path-style',
      name: 'Editable Path Node Style',
      demoPath: 'style/editablepathstyle/',
      summary: 'Shows a path-based node style whose control points can be moved by users.',
      category: 'style',
      tags: ['style', 'path', 'editing'],
      keywords: ['v2.3.0.2', 'handles', 'general paths', 'interaction', 'editing']
    },
    {
      id: 'webgl-icon-node',
      name: 'WebGL Image Node',
      demoPath: 'style/webgl-image-node/',
      summary: 'Shows how to render image nodes with WebGL.',
      category: 'style',
      tags: ['style', 'webgl'],
      keywords: ['v2.4.0.0', 'notable style', 'webgl2']
    },
    {
      id: 'clickable-style-decorator',
      name: 'Clickable Style Decorator',
      summary: 'Illustrates an approach for handling clicks on specific areas of the style.',
      demoPath: 'style/clickable-style-decorator/',
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
      category: 'style',
      tags: ['style', 'icon'],
      keywords: ['v2.4.0.4', 'composite']
    },
    {
      id: 'level-of-detail-style',
      name: 'Level of Detail Style',
      summary: 'Shows a node style that hides details when zooming out.',
      demoPath: 'style/level-of-detail-style/',
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
      tags: ['interaction', 'style', 'table'],
      keywords: ['v2.4.0.4', 'rows', 'tables']
    },
    {
      id: 'data-table',
      name: 'Data Table',
      demoPath: 'style/datatable/',
      summary: 'Shows a node style and a label style that display data in a tabular fashion.',
      category: 'style',
      tags: ['style', 'label'],
      keywords: ['v2.6.0.0', 'data table', 'structures', 'data management', 'html', 'htmlvisual']
    },
    {
      id: 'bezier-edge-style',
      name: 'Bezier Edge Style',
      demoPath: 'style/bezieredgestyle/',
      summary: 'Shows how to use the curved edge style consisting of Bezier splines.',
      category: 'style',
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
      category: 'style',
      tags: ['style', 'label', 'markup'],
      keywords: ['v2.3.0.0', 'rich texts', 'styling', 'html', 'xml', 'color', 'padding', 'margin']
    },
    {
      id: 'markdown-label',
      name: 'Markdown Label',
      demoPath: 'style/markdownlabel/',
      summary: 'Use markdown to format the label text.',
      category: 'style',
      distributionType: 'needs-layout',
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
      tags: ['style', 'label', 'rich text'],
      keywords: ['v2.3.0.0', 'styling', 'html', 'xml', 'markdown', 'markup', 'colors', 'wysiwyg']
    },
    {
      id: 'overview-styling',
      name: 'Overview Styling',
      demoPath: 'view/overviewstyles/',
      summary: 'Shows several different rendering techniques and styles for the overview.',
      category: 'view',
      distributionType: 'needs-layout',
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
      tags: ['style', 'label', 'zoom'],
      keywords: ['v2.2.0.2', 'size', 'fit']
    },
    {
      id: 'simple-arrow-style',
      name: 'Simple Arrow Style',
      demoPath: 'style/simple-arrow-style/',
      summary: 'Shows how to create a simple custom arrow for edges.',
      category: 'style',
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
      tags: ['style', 'decorators'],
      keywords: ['ports']
    },
    {
      id: 'general-path-node-style',
      name: 'General Path Node Style',
      demoPath: 'style/general-path-node-style/',
      summary:
        'Shows how to create a variety of star, polygon, and other custom node styles with GeneralPathNodeStyle.',
      category: 'style',
      tags: ['style', 'node', 'star', 'polygon'],
      keywords: [
        'v3.0.0.0',
        'styling',
        'custom',
        'icon',
        'factory',
        'airplane',
        'computer',
        'person',
        'path'
      ]
    },
    {
      id: 'edge-bundling',
      name: 'Edge Bundling',
      demoPath: 'layout/edgebundling/',
      summary:
        'Shows how edge bundling can be applied for reducing visual cluttering in dense graphs.',
      category: 'layout',
      tags: ['style', 'curve', 'layout'],
      keywords: [
        'layoutfeatures',
        'context menu',
        'organic',
        'radial',
        'tree',
        'radial tree',
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
      tags: ['edge thickness', 'style', 'layout'],
      keywords: [
        'v2.4.0.4',
        'layoutfeatures',
        'chords',
        'arcs',
        'bezier',
        'curves',
        'notable style',
        'margin'
      ]
    },
    {
      id: 'chord-diagram-non-ribbon',
      name: 'Non-ribbon Chord Diagram',
      demoPath: 'showcase/chord-diagram-non-ribbon/',
      summary:
        'Shows a non-ribbon chord diagram that emphasizes the traceability of the connections.',
      category: 'showcase',
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
      tags: ['layout', 'curve'],
      keywords: ['v2.4.0.4', 'layoutfeatures', 'arcs', 'bezier', 'networks', 'curves']
    },
    {
      id: 'maze-routing',
      name: 'Maze Routing',
      demoPath: 'layout/mazerouting/',
      summary: 'Shows how the automatic edge routing finds routes through a maze.',
      category: 'layout',
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
      tags: ['label placement'],
      keywords: [
        'layoutfeatures',
        'integrated',
        'texts',
        'generic labeling',
        'tree',
        'hierarchical',
        'orthogonal',
        'edge router',
        'move',
        'padding'
      ]
    },
    {
      id: 'node-labeling',
      name: 'Automatic Node Labeling',
      demoPath: 'layout/node-labeling/',
      summary:
        'Shows how to place node labels at the preferred location with a labeling algorithm.',
      category: 'layout',
      tags: ['label placement'],
      keywords: [
        'layoutfeatures',
        'generic labeling',
        'text',
        'background',
        'label candidates',
        'padding'
      ]
    },
    {
      id: 'node-types',
      name: 'Node Types',
      demoPath: 'layout/nodetypes/',
      summary: 'Shows how different layout algorithms handle nodes with types.',
      category: 'layout',
      tags: ['layout', 'node type'],
      keywords: [
        'v2.4.0.0',
        'v2.5.0.0',
        'layoutfeatures',
        'types',
        'tree',
        'hierarchical',
        'organic',
        'components',
        'circular',
        'balloon',
        'compact disk',
        'data analysis'
      ]
    },
    {
      id: 'interactive-hierarchical-layout',
      name: 'Interactive Hierarchical Layout',
      demoPath: 'layout/interactive-hierarchical/',
      summary:
        'The from sketch mode of the hierarchical layout style can incrementally fit new nodes and edges into the existing drawing.',
      category: 'layout',
      tags: ['layout', 'hierarchical'],
      keywords: ['layoutfeatures', 'ports', 'background', 'incremental', 'from sketch']
    },
    {
      id: 'interactive-edge-routing',
      name: 'Interactive Edge Routing',
      demoPath: 'layout/interactiveedgerouting/',
      summary: 'After each edit the edge paths are re-routed if necessary.',
      category: 'layout',
      tags: ['layout', 'edge routing'],
      keywords: ['v2.4.0.0', 'layoutfeatures', 'interaction', 'edge router']
    },
    {
      id: 'edge-grouping',
      name: 'Edge Grouping',
      demoPath: 'layout/edgegrouping/',
      summary: 'The hierarchical layout can group the paths or ports of edges.',
      category: 'layout',
      tags: ['layout', 'hierarchical'],
      keywords: [
        'v2.1.0.3',
        'layoutfeatures',
        'edge groups',
        'port groups',
        'hierarchical',
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
      tags: ['layout', 'organic', 'constraints'],
      keywords: [
        'v2.6.0.0',
        'layoutfeatures',
        'height',
        'labeling',
        'timeline',
        'time',
        'time-data',
        'margin'
      ]
    },
    {
      id: 'metabolic-pathways',
      name: 'Metabolic Pathways',
      demoPath: 'layout/metabolic-pathways/',
      summary: 'Shows how to configure organic layout for visualizing metabolic pathways.',
      category: 'layout',
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
        'reaction',
        'margin',
        'nodeMargin'
      ]
    },
    {
      id: 'organic-substructures',
      name: 'Organic Substructures',
      demoPath: 'layout/organic-substructures/',
      summary: 'Shows organic layout, and its substructures and node types features.',
      category: 'layout',
      tags: ['layout', 'organic', 'substructure', 'node type'],
      keywords: [
        'v2.4.0.0',
        'layoutfeatures',
        'clustering',
        'grouping',
        'similar',
        'data management',
        'margin',
        'padding'
      ]
    },
    {
      id: 'circular-substructures',
      name: 'Circular Substructures',
      demoPath: 'layout/circular-substructures/',
      summary: 'Shows circular layout, and its substructures and node types features.',
      category: 'layout',
      tags: ['layout', 'circular', 'substructure', 'node type'],
      keywords: ['v2.6.0.0', 'layoutfeatures']
    },
    {
      id: 'bus-routing',
      name: 'Bus Routing',
      demoPath: 'layout/busrouting/',
      summary: 'Shows how to group edges in bus structures.',
      category: 'layout',
      tags: ['layout', 'edge routing', 'bus'],
      keywords: ['v2.4.0.0', 'layoutfeatures', 'edge router', 'edge groups', 'bus structures']
    },
    {
      id: 'fill-area-layout',
      name: 'Fill Area Layout',
      demoPath: 'layout/fillarealayout/',
      summary: 'Shows how to fill free space after deleting nodes.',
      category: 'layout',
      tags: ['layout', 'interactive layout'],
      keywords: ['v2.3.0.0', 'layoutfeatures', 'deletion', 'adjustment', 'interactive']
    },
    {
      id: 'clear-marquee-area',
      name: 'Clear Marquee Area',
      demoPath: 'layout/clearmarqueearea/',
      summary: 'Shows how to automatically keep a marquee area clear of graph elements.',
      category: 'layout',
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
      id: 'hierarchical-grid-components',
      name: 'Hierarchical Grid Components',
      demoPath: 'layout/hierarchical-grid-components/',
      summary: 'Grid components in the hierarchical layout result in more compact arrangements.',
      category: 'layout',
      tags: ['layout', 'hierarchical', 'grid components'],
      keywords: [
        'v2.2.0.2',
        'layoutfeatures',
        'gridcomponents',
        'bus structures',
        'orthogonal',
        'compact'
      ]
    },
    {
      id: 'hierarchical-subcomponents',
      name: 'Hierarchical Subcomponents',
      demoPath: 'layout/subcomponents/',
      summary: 'The hierarchical layout can arrange subcomponents with different layout styles.',
      category: 'layout',
      tags: ['layout', 'hierarchical'],
      keywords: ['v2.5.0.0', 'layoutfeatures', 'tree', 'organic', 'orthogonal']
    },
    {
      id: 'tabular-groups',
      name: 'Tabular Groups',
      summary: 'Shows how to configure the tabular groups feature of the hierarchical layout.',
      demoPath: 'layout/tabular-groups/',
      category: 'layout',
      tags: ['hierarchical', 'tabular', 'groups'],
      keywords: ['v2.5.0.0', 'layoutfeatures', 'layout', 'table', 'column', 'compact', 'padding']
    },
    {
      id: 'critical-paths',
      name: 'Critical Paths',
      demoPath: 'layout/criticalpaths/',
      summary:
        'The hierarchical and tree layout styles can emphasize critical (important) paths by aligning their nodes.',
      category: 'layout',
      tags: ['layout', 'hierarchical', 'tree'],
      keywords: ['layoutfeatures', 'data analysis']
    },
    {
      id: 'custom-layout-stage',
      name: 'Custom Layout Stage',

      summary:
        'Custom layout stages can be used to solve unique layout problems that are not adequately covered by existing layout algorithms.',
      demoPath: 'layout/custom-layout-stage/',
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
        'Shows how to align edges at group nodes using RecursiveGroupLayout with HierarchicalLayout.',
      category: 'layout',
      tags: ['layout', 'hierarchical', 'tree'],
      keywords: ['v2.1.0.3', 'layoutfeatures', 'context menu', 'recursive']
    },
    {
      id: 'layout-grid',
      name: 'Layout Grid',
      demoPath: 'layout/layoutgrid/',
      summary: 'Demonstrates the usage of a layout grid for hierarchical and organic layouts.',
      category: 'layout',
      tags: ['layout', 'layout grid', 'hierarchical', 'organic'],
      keywords: ['layoutfeatures', 'data management', 'partition grid', 'layout grid']
    },
    {
      id: 'simple-layout-grid',
      name: 'Simple Layout Grid',
      demoPath: 'layout/simplelayoutgrid/',
      summary: 'Shows how to create a simple layout grid.',
      category: 'layout',
      tags: ['layout', 'layout grid', 'hierarchical'],
      keywords: ['v2.2.0.0', 'layoutfeatures', 'partition grid', 'layout grid']
    },
    {
      id: 'interactive-graph-restructuring',
      name: 'Interactive Graph Restructuring',
      demoPath: 'input/interactivegraphrestructuring/',
      summary: 'Shows how to interactively relocate subtrees from one parent to another.',
      category: 'input',
      distributionType: 'needs-layout',
      tags: ['interactive layout', 'animation'],
      keywords: [
        'v2.3.0.0',
        'layoutfeatures',
        'tree',
        'sub-tree',
        're-parent',
        'fill area layout',
        'create space',
        'space maker',
        'hierarchical'
      ]
    },
    {
      id: 'layer-constraints',
      name: 'Layer Constraints',
      demoPath: 'layout/layerconstraints/',
      summary:
        'Shows how to use layer constraints to prescribe the node layering in hierarchical layouts.',
      category: 'layout',
      tags: ['layout', 'hierarchical'],
      keywords: ['layoutfeatures']
    },
    {
      id: 'sequence-constraints',
      name: 'Sequence Constraints',
      demoPath: 'layout/sequenceconstraints/',
      summary:
        'Shows how to use sequence constraints to prescribe the node sequencing in hierarchical layouts.',
      category: 'layout',
      tags: ['layout', 'hierarchical'],
      keywords: ['layoutfeatures']
    },
    {
      id: 'interactive-organic-layout',
      name: 'Interactive Organic Layout',
      demoPath: 'layout/interactiveorganic/',
      summary: "Shows the 'interactive organic' layout algorithm.",
      category: 'layout',
      tags: ['layout', 'interactive layout'],
      keywords: ['layoutfeatures', 'organic', 'move', 'worker']
    },
    {
      id: 'multi-page-layout',
      name: 'Multi-Page Layout',
      demoPath: 'layout/multipage/',
      summary:
        'Shows how to divide a large model graph into several smaller page graphs, for example to print to multiple pages.',
      category: 'layout',
      tags: ['layout', 'hierarchical', 'tree'],
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
      summary: 'Shows how to use different subtree placer in TreeLayout.',
      category: 'layout',
      tags: ['layout', 'tree'],
      keywords: ['v2.2.0.2', 'layoutfeatures', 'subtree placers', 'node placers']
    },
    {
      id: 'partial-layout',
      name: 'Partial Layout',
      demoPath: 'layout/partial/',
      summary: 'Shows how to integrate new graph elements into an existing graph layout.',
      category: 'layout',
      tags: ['layout', 'incremental', 'partial'],
      keywords: ['layoutfeatures', 'hierarchical', 'orthogonal', 'organic', 'circular', 'curves']
    },
    {
      id: 'bridges',
      name: 'Bridges',
      demoPath: 'view/bridges/',
      summary:
        'Shows the capabilities of the <code>BridgeManager</code> class for inserting bridges into edge paths.',
      category: 'view',
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
      id: 'edge-to-edge',
      name: 'Edge To Edge',
      demoPath: 'view/edgetoedge/',
      summary: 'Shows edge-to-edge connections.',
      category: 'view',
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
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchical', 'structures', 'labels', 'v2.3.0.0']
    },
    {
      id: 'tree-graph-builder',
      name: 'Tree Builder',
      demoPath: 'databinding/treebuilder/',
      summary:
        'Interactively builds and modifies a graph from JSON business data using class <code>TreeBuilder</code>.',
      category: 'data-binding',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchical', 'structures', 'labels', 'v2.3.0.0']
    },
    {
      id: 'adjacency-graph-builder',
      name: 'Adjacency Graph Builder',
      demoPath: 'databinding/adjacencygraphbuilder/',
      summary:
        'Interactively builds and modifies a graph from JSON business data using class <code>AdjacencyGraphBuilder</code>.',
      category: 'data-binding',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchical', 'structures', 'labels', 'v2.3.0.0']
    },
    {
      id: 'simple-graph-builder',
      name: 'Simple Graph Builder',
      demoPath: 'databinding/simple-graph-builder/',
      summary:
        'Automatically builds a graph from JSON business data using <code>GraphBuilder</code>.',
      category: 'data-binding',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchical', 'labels', 'v2.3.0.0', 'playground']
    },
    {
      id: 'simple-adjacency-graph-builder',
      name: 'Simple Adjacency Graph Builder',
      demoPath: 'databinding/simple-adjacency-graph-builder/',
      summary:
        'Automatically builds a graph from JSON business data using <code>AdjacencyGraphBuilder</code>.',
      category: 'data-binding',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchical', 'labels', 'v2.3.0.0', 'playground']
    },
    {
      id: 'simple-adjacency-graph-builder-with-ids',
      name: 'Simple Adjacency Graph Builder With Ids',
      demoPath: 'databinding/simple-adjacency-graph-builder-with-ids/',
      summary:
        'Automatically builds a graph from JSON business data using <code>AdjacencyGraphBuilder</code> with node ids.',
      category: 'data-binding',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchical', 'labels', 'v2.3.0.0', 'playground']
    },
    {
      id: 'simple-graph-builder-implicit-groups',
      name: 'Simple Graph Builder With Implicit Groups',
      demoPath: 'databinding/simple-graph-builder-implicit-groups/',
      summary:
        'Automatically builds a graph from JSON business data with implicit groups using <code>GraphBuilder</code>.',
      category: 'data-binding',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchical', 'labels', 'v2.3.0.0', 'playground']
    },
    {
      id: 'simple-tree-builder-array',
      name: 'Simple Tree Builder (Array)',
      demoPath: 'databinding/simple-tree-builder-array/',
      summary:
        'Automatically builds a graph from an array containing business data using <code>TreeBuilder</code>.',
      category: 'data-binding',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchical', 'labels', 'v2.3.0.0', 'playground']
    },
    {
      id: 'simple-tree-builder-json',
      name: 'Simple Tree Builder (JSON)',
      demoPath: 'databinding/simple-tree-builder-json/',
      summary:
        'Automatically builds a graph from JSON business data using <code>TreeBuilder</code>.',
      category: 'data-binding',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchical', 'labels', 'v2.3.0.0', 'playground']
    },
    {
      id: 'port-aware-graph-builder',
      name: 'Port-aware Graph Builder',
      demoPath: 'databinding/port-aware-graph-builder/',
      summary:
        'Builds a graph using <code>GraphBuilder</code> and connects the items to specific ports.',
      category: 'data-binding',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchical', 'ports', 'v2.5.0.0']
    },
    {
      id: 'port-aware-adjacency-graph-builder',
      name: 'Port-aware Adjacency Graph Builder',
      demoPath: 'databinding/port-aware-adjacency-graph-builder/',
      summary:
        'Builds a graph using <code>AdjacencyGraphBuilder</code> and connects the items to specific ports.',
      category: 'data-binding',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['hierarchical', 'ports', 'v2.5.0.0']
    },
    {
      id: 'port-aware-tree-builder',
      name: 'Port-aware Tree Builder',
      demoPath: 'databinding/port-aware-tree-builder/',
      summary:
        'Builds a graph using <code>TreeBuilder</code> and connects the items to specific ports.',
      category: 'data-binding',
      tags: ['json', 'data binding', 'layout'],
      keywords: ['tree', 'ports', 'v2.5.0.0']
    },
    {
      id: 'image-export',
      name: 'Image Export',
      demoPath: 'view/imageexport/',
      summary: 'Shows how to export the whole diagram or a part of it to a PNG image.',
      category: 'view',
      tags: ['export', 'png', 'jpg'],
      keywords: ['jpeg', 'bitmap', 'save', 'handles']
    },
    {
      id: 'svg-export',
      name: 'SVG Export',
      demoPath: 'view/svgexport/',
      summary: 'Shows how to export the whole diagram or a part of it to an SVG image.',
      category: 'view',
      tags: ['export', 'svg', 'vector graphics'],
      keywords: ['scalable vector graphics', 'save', 'handles', 'curves', 'bezier']
    },
    {
      id: 'pdf-export',
      name: 'PDF Export',
      demoPath: 'view/pdfexport/',
      summary: 'Shows how to export the whole diagram or a part of it to a PDF.',
      category: 'view',
      tags: ['export', 'pdf'],
      keywords: ['vector graphics', 'handles']
    },
    {
      id: 'printing',
      name: 'Printing',
      demoPath: 'view/printing/',
      summary: 'Shows how to print the whole diagram or a part of it.',
      category: 'view',
      tags: ['printing'],
      keywords: ['posters', 'vector graphics', 'handles']
    },
    {
      id: 'file-operations',
      name: 'File Operations',
      demoPath: 'application-features/file-operations/',
      summary: 'Shows different ways to open and save a graph.',
      category: 'view',
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
      tags: ['interaction'],
      keywords: ['palette', 'drag and drop', 'dnd']
    },
    {
      id: 'webgl-precompilation',
      name: 'WebGL Precompilation',
      demoPath: 'view/webgl-precompilation/',
      summary: 'Shows how to precompile the WebGL styles you want to use',
      category: 'view',
      tags: ['webgl'],
      keywords: ['v2.6.0.0', 'shader', 'compile', 'webgl2']
    },
    {
      id: 'angular',
      name: 'Angular',
      demoPath: 'toolkit/angular/README.html',
      summary: 'Shows how to use yFiles for HTML in an Angular app.',
      category: 'integration',
      distributionType: 'needs-layout',
      languageType: 'ts-only',
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
      tags: ['nodejs', 'layout'],
      keywords: ['folding', 'hierarchical', 'json', 'web worker']
    },
    {
      id: 'web-components',
      name: 'Web Components',
      demoPath: 'toolkit/webcomponents/',
      summary: 'Shows how to use yFiles for HTML with Web Components v1.',
      category: 'integration',
      tags: ['web components', 'shadow dom', 'html imports']
    },
    {
      id: 'basic-demo',
      name: 'Basic Demo',
      demoPath: 'loading/basic-demo/',
      summary: 'A simple demo that you can use as a starting point for your own project.',
      category: 'loading',
      tags: ['loader', 'modules'],
      keywords: [
        'getting starting',
        'hello world',
        'starter kit',
        'boilerplate',
        'quick',
        'minimal',
        'simple',
        'template'
      ]
    },
    {
      id: 'rollup',
      name: 'Rollup.js',
      demoPath: 'loading/rollupjs/README.html',
      summary:
        'Shows how to bundle the yFiles library in a <a href="https://rollupjs.org" target="_blank">rollup</a> project.',
      category: 'loading',
      languageType: 'js-only',
      tags: ['deployment', 'optimizer'],
      keywords: ['v2.2.0.0', 'web worker', 'modules']
    },
    {
      id: 'web-worker-webpack',
      name: 'Web Worker Webpack',
      demoPath: 'loading/webworker-webpack/README.html',
      summary: 'Shows how to run a yFiles layout algorithm in a Web Worker task using Webpack.',
      category: 'loading',
      languageType: 'ts-only',
      tags: ['webpack', 'web worker', 'layout'],
      keywords: [
        'v2.4.0.0',
        'threads',
        'threading',
        'background',
        'json',
        'folding',
        'hierarchical',
        'webpack'
      ]
    },
    {
      id: 'web-worker',
      name: 'Web Worker',
      summary: 'Shows how to run a layout in a Web Worker task using module workers.',
      demoPath: 'loading/webworker/',
      category: 'loading',
      distributionType: 'needs-layout',
      tags: ['modules', 'web worker', 'layout'],
      keywords: [
        'v2.4.0.0',
        'threads',
        'threading',
        'background',
        'async',
        'modules',
        'hierarchical'
      ]
    },
    {
      id: 'webpack',
      name: 'webpack',
      demoPath: 'loading/webpack/README.html',
      summary:
        'Shows how to integrate the yFiles library in a <a href="https://webpack.js.org" target="_blank">webpack</a> project.',
      category: 'loading',
      languageType: 'ts-only',
      tags: ['nodejs', 'npm', 'modules', 'esm', 'deployment', 'layout'],
      keywords: ['organic']
    },
    {
      id: 'vite',
      name: 'Vite',
      demoPath: 'loading/vite/README.html',
      summary:
        'Shows how to integrate the yFiles library in a <a href="https://vitejs.dev/" target="_blank">Vite</a> project.',
      category: 'loading',
      languageType: 'ts-only',
      tags: ['modules', 'esm', 'deployment', 'web worker'],
      keywords: ['v2.4.0.4', 'webworker']
    },
    {
      id: 'vite-lazy-yfiles',
      name: 'Vite Lazy Load yFiles',
      demoPath: 'loading/vite-lazy-yfiles/README.html',
      summary:
        'Shows how to lazily load yFiles in a <a href="https://vitejs.dev/" target="_blank">Vite</a> project with dynamic imports.',
      category: 'loading',
      languageType: 'ts-only',
      tags: ['modules', 'esm', 'deployment'],
      keywords: ['v3.0', 'hierarchical', 'dynamic imports', 'vite']
    },
    {
      id: 'web-dev-server',
      name: 'Web Dev Server',
      demoPath: 'loading/web-dev-server/README.html',
      summary:
        'Shows how to integrate the yFiles library in a <a href="https://modern-web.dev/docs/dev-server/overview/" target="_blank">Web Dev Server</a> project.',
      category: 'loading',
      languageType: 'js-only',
      tags: ['modules', 'esm', 'deployment'],
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
      tags: ['interaction', 'copy', 'paste'],
      keywords: ['v2.4.0.4', 'labels']
    },
    {
      id: 'node-selection-resizing',
      name: 'Node Selection Resizing',
      demoPath: 'input/nodeselectionresizing/',
      summary: 'Shows how to reshape a selection of nodes as one unit.',
      category: 'input',
      tags: ['interaction', 'resizing'],
      keywords: ['v2.3.0.0', 'input mode', 'scale']
    },
    {
      id: 'border-aligned-label-model',
      name: 'Border-Aligned Label Model',
      demoPath: 'input/border-aligned-label-model/',
      summary:
        'Shows how to implement a custom label model that positions labels around node borders.',
      category: 'input',
      tags: ['interaction', 'label'],
      keywords: ['v3.0.0.4', 'placements', 'ILabelModel', 'playground']
    },
    {
      id: 'offset-wrapper-label-model',
      name: 'Offset Wrapper Label Model',
      demoPath: 'input/offset-wrapper-label-model/',
      summary:
        'Shows how to implement a custom label model that adds an adjustable offset to labels.',
      category: 'input',
      tags: ['interaction', 'label'],
      keywords: ['v3.0.0.4', 'placements', 'ILabelModel', 'playground']
    },
    {
      id: 'graphml',
      name: 'GraphML',
      demoPath: 'view/graphml/',
      summary: "Provides a live view of the graph's GraphML representation.",
      category: 'view',
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
      tags: ['interaction', 'port'],
      keywords: ['port candidate providers', 'placements']
    },
    {
      id: 'custom-snapping',
      name: 'Custom Snapping',
      demoPath: 'input/customsnapping/',
      summary: 'Shows how the snapping feature can be customized.',
      category: 'input',
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
      tags: ['interaction', 'drag and drop'],
      keywords: ['v2.4.0.4', 'move', 'dnd']
    },
    {
      id: 'context-menu',
      name: 'Context Menu',
      demoPath: 'input/context-menu/',
      summary:
        'Shows how to add a context menu to the nodes of a graph and to the canvas background.',
      category: 'input',
      tags: ['interaction'],
      keywords: ['context menu', 'copy', 'playground']
    },
    {
      id: 'simple-drag-and-drop',
      name: 'Simple Drag And Drop',
      summary:
        'Shows how to enable dragging nodes from a panel and drop them into the graph component.',
      demoPath: 'application-features/drag-and-drop/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction', 'drag and drop'],
      keywords: ['DropInputMode', 'move', 'events', 'input mode', 'dnd']
    },
    {
      id: 'drag-and-drop',
      name: 'Drag and Drop',
      demoPath: 'input/draganddrop/',
      summary: 'Shows drag and drop of nodes, groups and labels.',
      category: 'input',
      distributionType: 'needs-layout',
      tags: ['interaction', 'drag and drop'],
      keywords: ['palette', 'ports', 'labels', 'groups', 'html', 'move', 'dnd']
    },
    {
      id: 'graph-drag-and-drop',
      name: 'Graph Drag and Drop',
      demoPath: 'input/graph-drag-and-drop/',
      summary: 'Shows drag and drop of graphs consisting of multiple items.',
      category: 'input',
      tags: ['interaction', 'drag and drop'],
      keywords: ['v2.4.0.4', 'palette', 'graphs', 'groups', 'dnd']
    },
    {
      id: 'custom-drag-and-drop',
      name: 'Custom Drag and Drop',
      demoPath: 'input/custom-drag-and-drop/',
      summary: 'Shows how to change the color of nodes and edges using drag and drop operations.',
      category: 'input',
      tags: ['interaction', 'drag and drop'],
      keywords: ['v2.4.0.4', 'palette', 'colors', 'dnd']
    },
    {
      id: 'edge-reconnection',
      name: 'Edge Reconnection',
      demoPath: 'input/edgereconnection/',
      summary: 'Shows how the reconnection of edge ports can be customized and restricted.',
      category: 'input',
      tags: ['interaction'],
      keywords: ['port candidate providers', 'ports']
    },
    {
      id: 'label-editing',
      name: 'Label Editing',
      demoPath: 'input/labelediting/',
      summary: 'Shows customizations of the interactive label editing.',
      category: 'input',
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
      tags: ['interaction', 'selection'],
      keywords: ['input mode', 'move']
    },
    {
      id: 'orthogonal-edge-editing-customization',
      name: 'Orthogonal Edge Editing Customization',
      demoPath: 'input/orthogonal-edge-editing-customization/',
      summary: 'Shows how to customize orthogonal edge editing.',
      category: 'input',
      tags: ['interaction'],
      keywords: ['orthogonal edges', 'move']
    },
    {
      id: 'port-candidate-provider',
      name: 'Port Candidate Provider',
      demoPath: 'input/portcandidateprovider/',
      summary: 'Shows how edge creation can be customized.',
      category: 'input',
      tags: ['interaction', 'port'],
      keywords: ['port candidate providers']
    },
    {
      id: 'position-handler',
      name: 'Position Handler',
      demoPath: 'input/positionhandler/',
      summary: 'Shows how to customize and restrict the movement behavior of nodes.',
      category: 'input',
      tags: ['interaction'],
      keywords: ['position handlers', 'move']
    },
    {
      id: 'reparent-handler',
      name: 'Reparent Handler',
      demoPath: 'input/reparenthandler/',
      summary: 'Shows how reparenting of nodes can be customized.',
      category: 'input',
      tags: ['interaction', 'grouping'],
      keywords: ['re-parent handlers']
    },
    {
      id: 'reshape-handle-provider-configuration',
      name: 'Reshape Handle Provider Configuration',
      demoPath: 'input/reshapehandleconfiguration/',
      summary: 'Shows how resizing of nodes can be customized.',
      category: 'input',
      tags: ['interaction', 'resizing'],
      keywords: ['v2.3.0.0', 'handles', 'reshape', 'size', 'scale']
    },
    {
      id: 'reshape-handle-provider',
      name: 'Reshape Handle Provider',
      demoPath: 'input/reshapehandleprovider/',
      summary: 'Shows how to add resize handles to ports.',
      category: 'input',
      tags: ['interaction', 'resizing', 'port'],
      keywords: ['v2.3.0.0', 'handles', 'reshape', 'size', 'scale']
    },
    {
      id: 'restricted-editing',
      name: 'Restricted Editing',
      demoPath: 'input/restricted-editing/',
      summary: 'Shows how to restrict interactive editing with GraphEditorInputMode.',
      category: 'input',
      tags: ['interaction'],
      keywords: ['v2.4.0.4', 'editing', 'viewing']
    },
    {
      id: 'lasso-selection',
      name: 'Lasso Selection',
      demoPath: 'input/lasso-selection/',
      summary: 'Shows how to configure a lasso tool for freeform selection.',
      category: 'input',
      distributionType: 'needs-layout',
      tags: ['interaction', 'selection'],
      keywords: ['v2.1.0.2', 'testable', 'free', 'playground']
    },
    {
      id: 'marquee-node-creation',
      name: 'Marquee Node Creation',
      demoPath: 'input/marquee-node-creation/',
      summary: 'Shows how to customize the MarqueeSelectionInputMode class to create new nodes.',
      category: 'input',
      tags: ['interaction'],
      keywords: ['v2.4.0.4', 'marquee', 'selection', 'creation', 'creating']
    },
    {
      id: 'mouse-wheel-customization',
      name: 'Mouse Wheel Customization',
      demoPath: 'input/mousewheel-customization/',
      summary: 'Shows how to customize and enhance the default mouse wheel behavior.',
      category: 'input',
      tags: ['interaction'],
      keywords: ['v3.0.0.0', 'wheel', 'mousewheel', 'scroll', 'zoom', 'resize']
    },
    {
      id: 'single-selection',
      name: 'Single Selection',
      demoPath: 'input/single-selection/',
      summary: 'Shows how to configure GraphEditorInputMode for single selection mode.',
      category: 'input',
      distributionType: 'needs-layout',
      tags: ['interaction', 'selection'],
      keywords: ['single selection', 'playground']
    },
    {
      id: 'size-constraint-provider',
      name: 'Size Constraint Provider',
      demoPath: 'input/sizeconstraintprovider/',
      summary: 'Shows how resizing of nodes can be restricted.',
      category: 'input',
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
      tags: ['interaction'],
      keywords: ['v2.4.0.4', 'buttons', 'input mode']
    },
    {
      id: 'circle-snapping',
      name: 'Circular Snapping',
      summary:
        'Shows how to enable circular and angle snapping (guidelines) for interactive changes.',
      demoPath: 'input/circle-snapping/',
      category: 'input',
      tags: ['interaction', 'snapping', 'circle'],
      keywords: ['v3.0.0.0', 'move', 'resize', 'resizing', 'guides']
    },
    {
      id: 'without-view',
      name: 'Layout Without View',

      demoPath: 'layout/without-view/',
      summary:
        'Shows how to use the graph analysis and layout algorithms without a view and without the IGraph API',
      category: 'layout',
      distributionType: 'no-viewer',
      tags: ['headless', 'layout', 'analysis'],
      keywords: ['v2.3.0.1', 'invisible', 'background', 'memory', 'centrality', 'hierarchical']
    },
    {
      id: 'background-image',
      name: 'Background Image',
      summary: 'Shows how to add a background visualizations to a graph component.',
      demoPath: 'application-features/background-image/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['background', 'icon'],
      keywords: ['v2.2.0.0', 'IRenderTreeGroup', 'backgroundGroup']
    },
    {
      id: 'building-graph-from-data',
      name: 'Building Graphs From Data',
      summary: 'Shows how to build a graph from data in JSON format.',
      demoPath: 'application-features/building-graph-from-data/',
      category: 'application-features',
      tags: ['json', 'i/o'],
      keywords: ['read', 'write', 'input', 'files', 'data base', 'playground']
    },
    {
      id: 'building-swimlanes-from-data',
      name: 'Building Swimlanes From Data',
      summary: 'Shows how to build a graph with swimlanes from data in JSON format.',
      demoPath: 'application-features/building-swimlanes-from-data/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['json', 'i/o', 'table'],
      keywords: ['read', 'write', 'input', 'files', 'data base']
    },
    {
      id: 'external-links',
      name: 'External Links',
      summary: 'Shows how to add labels that act like external links and open in a new window.',
      demoPath: 'application-features/external-links/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction'],
      keywords: ['ItemHoverInputMode', 'control', 'events', 'input mode']
    },
    {
      id: 'filtering',
      name: 'Filtering',
      summary: 'Shows how to configure graph filtering.',
      demoPath: 'application-features/filtering/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['filtering', 'grouping'],
      keywords: [
        'v2.2.0.0',
        'FilteredGraphWrapper',
        'subset',
        'predicates',
        'hide',
        'hiding',
        'playground'
      ]
    },
    {
      id: 'filtering-with-folding',
      name: 'Filtering With Folding',
      summary: 'Shows how to configure filtering and folding in the same application.',
      demoPath: 'application-features/filtering-with-folding/',
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
      id: 'folding',
      name: 'Folding',
      summary: 'Shows how to enable collapsing and expanding of group nodes.',
      demoPath: 'application-features/folding/',
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
        'collapse',
        'playground'
      ]
    },
    {
      id: 'folding-with-merged-edges',
      name: 'Folding With Merged Edges',
      summary: 'Shows how to enable the merging of edges when collapsing group nodes.',
      demoPath: 'application-features/folding-with-merged-edges/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['folding', 'grouping'],
      keywords: [
        'v3.0.0.0',
        'masterGraph',
        'wrappedGraph',
        'FoldingManager',
        'MergingFoldingEdgeConverter',
        'expand',
        'nesting',
        'hide',
        'collapse'
      ]
    },
    {
      id: 'graph-copy',
      name: 'Graph Copy',
      summary: 'Shows how to copy a graph or parts of a graph.',
      demoPath: 'application-features/graph-copy/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['clipboard'],
      keywords: ['v2.2.0.0', 'GraphCopier', 'copy', 'cut', 'paste']
    },
    {
      id: 'graph-decorator',
      name: 'Graph Decorator',
      summary: 'Shows how to decorate graph items to change their behavior or visualization.',
      demoPath: 'application-features/graph-decorator/',
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
      id: 'simple-highlight',
      name: 'Simple Highlight Decorator',
      summary: 'Shows how to highlight nodes and edges when the mouse hovers over them.',
      demoPath: 'application-features/simple-highlight-decorator/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['highlight', 'hover', 'interaction'],
      keywords: [
        'v2.4.0.2',
        'GraphDecorator',
        'NodeDecorator',
        'HighlightDecorator',
        'playground',
        'margin'
      ]
    },
    {
      id: 'complex-highlight',
      name: 'Complex Highlight Decorator',
      summary:
        'Shows how to highlight nodes with different effects based on data stored in their tags.',
      demoPath: 'application-features/complex-highlight-decorator/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['highlight', 'hover', 'interaction'],
      keywords: [
        'v2.4.0.2',
        'GraphDecorator',
        'NodeDecorator',
        'HighlightDecorator',
        'HighlightIndicatorManager',
        'margin'
      ]
    },
    {
      id: 'graph-search',
      name: 'Graph Search',
      summary: 'Shows how to search for specific nodes in a graph.',
      demoPath: 'application-features/graph-search/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['highlight'],
      keywords: ['v2.2.0.0', 'query', 'queries', 'match', 'matches', 'find']
    },
    {
      id: 'grid-snapping',
      name: 'Grid Snapping',
      summary: 'Shows how to enable grid snapping during interactive changes.',
      demoPath: 'application-features/grid-snapping/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['grid', 'interaction', 'snapping'],
      keywords: [
        'GraphSnapContext',
        'GridSnapTypes',
        'GridVisualCreator',
        'align',
        'visuals',
        'interactive'
      ]
    },
    {
      id: 'input-output',
      name: 'Save and Load GraphML',
      summary: 'Shows how to use GraphML input and output.',
      demoPath: 'application-features/input-output/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['graphml', 'i/o'],
      keywords: ['GraphMLIOHandler', 'read', 'write', 'files', 'io']
    },
    {
      id: 'custom-graphml',
      name: 'Custom Data in GraphML',
      summary: 'Shows how to read and write additional data from and to GraphML.',
      demoPath: 'application-features/custom-graphml/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['graphml', 'i/o'],
      keywords: ['IMapper', 'GraphMLIOHandler', 'data', 'json', 'read', 'write', 'files', 'io']
    },
    {
      id: 'label-text-wrapping',
      name: 'Label Text Wrapping',
      summary: 'Shows how to enable label text wrapping and trimming.',
      demoPath: 'application-features/label-text-wrapping/',
      category: 'application-features',
      tags: ['label', 'webgl'],
      keywords: [
        'v2.3.0.0',
        'TextWrapping',
        'linebreaks',
        'rtl',
        'characters',
        'words',
        'right-to-left',
        'ellipsis',
        'webgl2',
        'padding',
        'margin'
      ]
    },
    {
      id: 'native-listeners',
      name: 'Native Listeners',
      summary: 'Illustrates how to register native event listeners to a SVG elements of a style.',
      demoPath: 'application-features/native-listeners/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction', 'style'],
      keywords: ['NodeDecorator', 'ILookupDecorator', 'NodeStyleBase', 'events', 'decorator']
    },
    {
      id: 'orthogonal-edge-editing',
      name: 'Orthogonal Edge Editing',
      summary: 'Shows how to enable interactive orthogonal edge editing.',
      demoPath: 'application-features/orthogonal-edges/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['edge creation', 'bends'],
      keywords: ['OrthogonalEdgeEditingContext', 'OrthogonalEdgeEditingPolicy']
    },
    {
      id: 'rectangular-indicator',
      name: 'Rectangular Indicator',
      summary: 'Shows how to add an interactive rectangular indicator to the graph component.',
      demoPath: 'application-features/rectangular-indicator/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction', 'selection'],
      keywords: ['v2.2.0.0', 'PositionHandler', 'RectangleHandle', 'handles']
    },
    {
      id: 'smart-click-navigation',
      name: 'Smart Click Navigation',
      demoPath: 'application-features/smart-click-navigation/',
      summary: 'Shows the how to scroll and zoom to the area of interest by single edge-clicks.',
      category: 'application-features',
      tags: ['exploration'],
      keywords: ['v2.2.0.0', 'navigation', 'zoom', 'move', 'interaction']
    },
    {
      id: 'snapping',
      name: 'Snapping',
      summary: 'Shows how to enable snapping (guide lines) for interactive changes.',
      demoPath: 'application-features/snapping/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction', 'snapping'],
      keywords: ['move', 'resize', 'resizing']
    },
    {
      id: 'subdivide-edges',
      name: 'Subdivide Edges',
      summary: 'Shows how to subdivide an edge when a node is dragged on it.',
      demoPath: 'application-features/subdivide-edges/',
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
      id: 'simple-theming',
      name: 'Theming',
      summary: 'Shows how to use a theme to change the look-and-feel of an application.',
      demoPath: 'application-features/theming/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction', 'theme'],
      keywords: ['dark mode', 'light mode', 'colors', 'theming', 'v2.5.0.0']
    },
    {
      id: 'tooltips',
      name: 'Tooltips',
      summary: 'Shows how to enable tooltips for graph items.',
      demoPath: 'application-features/tooltips/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['hover', 'interaction'],
      keywords: ['mouseHoverInputMode', 'query-item-tool-tip', 'events', 'data', 'json']
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      summary: 'Shows how to use the aria-live region to update screen readers.',
      demoPath: 'application-features/accessibility/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['accessibility', 'aria'],
      keywords: ['v2.3.0.0', 'tool tips', 'live', 'region', 'screen reader']
    },
    {
      id: 'webgl-rendering',
      name: 'WebGL Rendering',
      summary: 'Shows how to enable the WebGL rendering mode.',
      demoPath: 'application-features/webgl-rendering/',
      category: 'application-features',
      tags: ['webgl', 'performance'],
      keywords: ['v2.4.0.0', 'large', 'performance', 'styles', 'fast', 'webgl2']
    },
    {
      id: 'overview',
      name: 'Overview Component',
      summary: 'Shows how to add an overview component to the application.',
      demoPath: 'application-features/overview/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['interaction'],
      keywords: ['v2.4.0.4', 'overview', 'navigation', 'zoom']
    },
    {
      id: 'timeline',
      name: 'Timeline',
      summary: 'Shows how to add a timeline component to the graph.',
      demoPath: 'application-features/timeline/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['timeline', 'interaction', 'highlight'],
      keywords: ['v3.0.0.0', 'temporal data', 'hover']
    },
    {
      id: 'viewport-limiter',
      name: 'Viewport Limiter',
      summary: 'Shows how to use the viewport limiter to constrain the graph navigation.',
      demoPath: 'application-features/viewportlimiter/',
      category: 'application-features',
      distributionType: 'needs-layout',
      tags: ['viewport', 'interaction', 'navigation'],
      keywords: ['v3.0.0.0', 'zoom', 'pan', 'viewportlimiter']
    },
    {
      id: 'layout-hierarchical',
      name: 'Hierarchical Layout',
      summary: 'Shows common configuration options for hierarchical layout.',
      demoPath: 'layout-features/hierarchical/',
      category: 'layout-features',
      tags: ['hierarchical'],
      keywords: [
        'v2.4.0.4',
        'layout',
        'orthogonal',
        'octilinear',
        'port-constraints',
        'critical-path',
        'playground'
      ]
    },
    {
      id: 'layout-hierarchical-incremental',
      name: 'Incremental Hierarchical Layout',
      summary: 'Shows how to run the hierarchical layout on a predefined set of nodes.',
      demoPath: 'layout-features/hierarchical-incremental/',
      category: 'layout-features',
      tags: ['hierarchical', 'incremental'],
      keywords: [
        'v2.4.0.4',
        'layout',
        'subset',
        'layout',
        'nodes',
        'set',
        'node-set',
        'from sketch',
        'playground'
      ]
    },
    {
      id: 'layout-hierarchical-node-port-candidates',
      name: 'Hierarchical Layout with Node Port Candidates',
      summary: 'Shows how to use node port candidates with hierarchical layout.',
      demoPath: 'layout-features/hierarchical-node-port-candidates/',
      category: 'layout-features',
      tags: ['hierarchical', 'ports'],
      keywords: [
        'v2.4.0.4',
        'layout',
        'ports',
        'candidates',
        'nodeportcandidates',
        'keyword',
        'playground'
      ]
    },
    {
      id: 'layout-hierarchical-edge-grouping',
      name: 'Hierarchical Layout with Edge Grouping',
      summary: 'Shows how to configure edge grouping for hierarchical layout.',
      demoPath: 'layout-features/hierarchical-edge-grouping/',
      category: 'layout-features',
      tags: ['hierarchical', 'edgegroups'],
      keywords: ['v2.4.0.4', 'layout', 'groups', 'playground']
    },
    {
      id: 'layout-hierarchical-with-given-layering',
      name: 'Hierarchical Layout with Given Layering',
      summary: 'Shows how to configure hierarchical layout with a given layering.',
      demoPath: 'layout-features/hierarchical-given-layering/',
      category: 'layout-features',
      tags: ['hierarchical', 'given', 'layers'],
      keywords: ['v2.4.0.4', 'layout', 'given', 'layering', 'layers', 'playground']
    },
    {
      id: 'layout-constraints',
      name: 'Hierarchical Layout with Constraints',
      summary:
        'Shows how to use constraints to control layering and sequencing in the hierarchical layout.',
      demoPath: 'layout-features/hierarchical-constraints/',
      category: 'layout-features',
      tags: ['hierarchical', 'constraints'],
      keywords: ['v2.4.0.4', 'layout', 'playground']
    },
    {
      id: 'layout-sequence-constraints',
      name: 'Hierarchical Layout with Sequence Constraints',
      summary: 'Shows how to use constraints to control sequencing in hierarchical layout.',
      demoPath: 'layout-features/hierarchical-sequence-constraints/',
      category: 'layout-features',
      tags: ['hierarchical', 'constraints'],
      keywords: ['v2.4.0.4', 'layout', 'sequencing', 'playground']
    },
    {
      id: 'layout-layer-constraints',
      name: 'Hierarchical Layout with Layer Constraints',
      summary: 'Shows how to use constraints to control layering in hierarchical layout.',
      demoPath: 'layout-features/hierarchical-layer-constraints/',
      category: 'layout-features',
      tags: ['hierarchical', 'constraints'],
      keywords: ['v2.4.0.4', 'layout', 'layering', 'playground']
    },
    {
      id: 'layout-hierarchical-node-alignment',
      name: 'Hierarchical Layout with Node Alignment',
      summary: 'Shows how to align a set of nodes with hierarchical layout.',
      demoPath: 'layout-features/hierarchical-node-alignment/',
      category: 'layout-features',
      tags: ['hierarchical', 'alignment'],
      keywords: ['v2.4.0.4', 'layout', 'alignment', 'critical', 'paths', 'playground']
    },
    {
      id: 'layout-hierarchical-edge-labeling',
      name: 'Hierarchical Layout with Edge Labeling',
      summary: 'Shows how to configure automatic label placement of hierarchical layout.',
      demoPath: 'layout-features/hierarchical-edge-labeling/',
      category: 'layout-features',
      tags: ['hierarchical', 'labeling'],
      keywords: [
        'v2.4.0.4',
        'layout',
        'integrated-labeling',
        'label-placement',
        'auto-flipping',
        'playground',
        'margin',
        'padding',
        'nodeMargin'
      ]
    },
    {
      id: 'layout-hierarchical-compact-groups',
      name: 'Hierarchical Layout with Compact Groups',
      summary:
        'Shows how to configure the hierarchical layout such that it yields maximally compact group nodes.',
      demoPath: 'layout-features/hierarchical-compact-groups/',
      category: 'layout-features',
      tags: ['hierarchical', 'compaction'],
      keywords: [
        'v2.4.0.4',
        'layout',
        'recursive layering',
        'DefaultCoordinateAssignment',
        'bendReduction',
        'groupCompactionStrategy',
        'groupCompactionPolicy',
        'playground'
      ]
    },
    {
      id: 'layout-organic',
      name: 'Organic Layout',
      summary: 'Shows common configuration options for organic layout.',
      demoPath: 'layout-features/organic/',
      category: 'layout-features',
      tags: ['organic'],
      keywords: [
        'v2.4.0.4',
        'layout',
        'graph shape',
        'compactness',
        'node distance',
        'simple',
        'playground'
      ]
    },
    {
      id: 'layout-organic-incremental',
      name: 'Incremental Organic Layout',
      summary: 'Shows how to run the organic layout on a predefined set of nodes.',
      demoPath: 'layout-features/organic-incremental/',
      category: 'layout-features',
      tags: ['organic', 'incremental'],
      keywords: ['v2.4.0.4', 'layout', 'subset', 'nodes', 'set', 'node-set', 'playground']
    },
    {
      id: 'layout-organic-edge-labeling',
      name: 'Organic Layout with Edge Labeling',
      summary: 'Shows how to configure automatic label placement of organic layout.',
      demoPath: 'layout-features/organic-edge-labeling/',
      category: 'layout-features',
      tags: ['organic', 'labeling'],
      keywords: [
        'v2.6.0.0',
        'layout',
        'integrated-labeling',
        'label-placement',
        'auto-flipping',
        'playground',
        'margin',
        'nodeMargin'
      ]
    },
    {
      id: 'layout-organic-substructures',
      name: 'Organic Layout with Substructures',
      summary: 'Shows how to configure the layout of substructures in the organic layout.',
      demoPath: 'layout-features/organic-substructures/',
      category: 'layout-features',
      tags: ['organic', 'substructures'],
      keywords: ['v2.4.0.4', 'layout', 'playground']
    },
    {
      id: 'layout-organic-constraints',
      name: 'Organic Layout with Constraints',
      summary: 'Shows how to configure constraints for the organic layout algorithm.',
      demoPath: 'layout-features/organic-constraints/',
      category: 'layout-features',
      tags: ['organic', 'constraints'],
      keywords: ['v2.6.0.0', 'layout', 'circle', 'constraints', 'align', 'cycle', 'playground']
    },
    {
      id: 'layout-edgerouter',
      name: 'Edge Router',
      summary: 'Shows common configuration options for the edge routing algorithm.',
      demoPath: 'layout-features/edge-router/',
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
        'EdgeRouterEdgeDescriptor',
        'playground'
      ]
    },
    {
      id: 'layout-edge-router-incremental',
      name: 'Incremental Edge Router',
      summary: 'Shows how to run the edge router on a predefined set of edges.',
      demoPath: 'layout-features/edge-router-incremental/',
      category: 'layout-features',
      tags: ['incremental', 'routing'],
      keywords: ['v2.4.0.4', 'layout', 'subset', 'edges', 'set', 'edge-set', 'playground']
    },
    {
      id: 'layout-edge-router-buses',
      name: 'Bus-Style Edge Routing',
      summary:
        'Shows how to configure the edge routing algorithm to produce orthogonal bus-style paths.',
      demoPath: 'layout-features/edge-router-buses/',
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
        'EdgeRouterBusDescriptor',
        'playground'
      ]
    },
    {
      id: 'layout-edge-router-buses-custom',
      name: 'Bus-Style Edge Routing (Custom)',
      summary:
        'Shows how to configure the edge routing algorithm to produce orthogonal bus-style paths with custom backbone points.',
      demoPath: 'layout-features/edge-router-buses-custom/',
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
        'EdgeRouterBusDescriptor',
        'playground'
      ]
    },
    {
      id: 'layout-tree',
      name: 'Basic Tree Layout',
      summary: 'Shows common configuration options for the tree layout.',
      demoPath: 'layout-features/tree/',
      category: 'layout-features',
      tags: ['tree'],
      keywords: [
        'v2.4.0.4',
        'layout',
        'outedgecomparers',
        'portassignment',
        'subtreeplacer',
        'nodeplacer',
        'playground'
      ]
    },
    {
      id: 'layout-tree-node-placers',
      name: 'Tree Layout with Subtree Placers',
      summary: 'Shows how to use different subtree placers in tree layout.',
      demoPath: 'layout-features/tree-node-placers/',
      category: 'layout-features',
      tags: ['tree', 'subtreeplacer', 'nodeplacer'],
      keywords: ['v2.4.0.4', 'layout', 'nodes', 'playground']
    },
    {
      id: 'layout-orthogonal',
      name: 'Orthogonal Layout',
      summary: 'Shows common configuration options for the orthogonal layout.',
      demoPath: 'layout-features/orthogonal/',
      category: 'layout-features',
      tags: ['orthogonal'],
      keywords: ['v2.4.0.4', 'layout', 'directed', 'nodemargin', 'playground', 'margin']
    },
    {
      id: 'layout-recursive-group-layout',
      name: 'Recursive Group Layout',
      summary:
        'Shows how to use different layouts for group nodes using the recursive group layout.',
      demoPath: 'layout-features/recursive-group-layout/',
      category: 'layout-features',
      tags: ['recursive', 'groups'],
      keywords: ['v2.4.0.4', 'layout', 'playground']
    },
    {
      id: 'layout-radial-group-layout',
      name: 'Radial Group Layout',
      summary: 'Shows how to configure the radial group layout to arrange grouped graphs.',
      demoPath: 'layout-features/radial-group/',
      category: 'layout-features',
      tags: ['radial', 'groups'],
      keywords: [
        'v2.5.0.0',
        'layout',
        'hierarchy',
        'round',
        'nesting',
        'bundling',
        'fractal',
        'cactus',
        'playground'
      ]
    },
    {
      id: 'layout-compact-disk-groups',
      name: 'Compact Disk Groups',
      summary: 'Shows how to configure the compact disk layout to arrange children of group nodes.',
      demoPath: 'layout-features/compact-disk-groups/',
      category: 'layout-features',
      tags: ['compact', 'disk', 'groups'],
      keywords: [
        'v2.5.0.0',
        'layout',
        'round',
        'nesting',
        'node types',
        'recursive',
        'RecursiveGroupLayout',
        'playground'
      ]
    },
    {
      id: 'layout-compact-tabular-layout',
      name: 'Compact Tabular Layout',
      summary: 'Shows how to configure the tabular layout to create compact drawings',
      demoPath: 'layout-features/compact-tabular-layout/',
      category: 'layout-features',
      tags: ['compact', 'tabular', 'router'],
      keywords: [
        'v2.6.0.0',
        'layout',
        'compact',
        'table',
        'tabular',
        'edgerouter',
        'aspect ratio',
        'playground'
      ]
    },
    {
      id: 'port-alignment',
      name: 'Port Alignment',
      summary: 'Shows how to implement port alignment in hierarchical layout to visualize paths.',
      demoPath: 'layout/port-alignment/',
      category: 'layout',
      tags: ['port', 'hierarchical', 'path'],
      keywords: ['v3.0.0.0', 'layout', 'portdata']
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
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0']
    },
    {
      id: 'tutorial-basic-features-graph-element-creation',
      name: '02 Creating Graph Elements',
      summary: 'Shows how to create the basic graph elements.',
      demoPath: 'tutorial-yfiles-basic-features/02-graph-element-creation/',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'nodes', 'edges', 'labels']
    },
    {
      id: 'tutorial-basic-features-managing-viewport',
      name: '03 Managing Viewport',
      summary: 'Shows how to work with the viewport.',
      demoPath: 'tutorial-yfiles-basic-features/03-managing-viewport/',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'zoom', 'fit content']
    },
    {
      id: 'tutorial-basic-features-setting-styles',
      name: '04 Setting Styles',
      summary: 'Shows how to configure the visual appearance of graph elements using styles.',
      demoPath: 'tutorial-yfiles-basic-features/04-setting-styles/',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: [
        'v2.6.0.0',
        'LabelStyle',
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
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0']
    },
    {
      id: 'tutorial-basic-features-undo-clipboard-support',
      name: '07 Undo Clipboard Support',
      summary: 'Shows how to use the undo and clipboard features.',
      demoPath: 'tutorial-yfiles-basic-features/07-undo-clipboard-support/',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'cut', 'copy', 'paste', 'redo']
    },
    {
      id: 'tutorial-basic-features-grouping',
      name: '08 Grouping',
      summary: 'Shows how to configure support for grouped (or hierarchically organized) graphs.',
      demoPath: 'tutorial-yfiles-basic-features/08-grouping/',
      category: 'tutorial-basic-features',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'PanelNodeStyle', 'InteriorStretchLabelModel']
    },
    {
      id: 'tutorial-basic-features-data-binding',
      name: '09 Data Binding',
      summary: 'Shows how to bind data to graph elements.',
      demoPath: 'tutorial-yfiles-basic-features/09-data-binding/',
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
      category: 'tutorial-basic-features',
      distributionType: 'needs-layout',
      tags: ['tutorial', 'basic features', 'hierarchical'],
      keywords: ['v2.6.0.0', 'morphLayout']
    },
    {
      id: 'tutorial-basic-features-layout-data',
      name: '11 Layout Data',
      summary: 'Shows how to configure individual settings for each node for the automatic layout.',
      demoPath: 'tutorial-yfiles-basic-features/11-layout-data/',
      category: 'tutorial-basic-features',
      distributionType: 'needs-layout',
      tags: ['tutorial', 'basic features'],
      keywords: ['v2.6.0.0', 'hierarchical']
    },
    {
      id: 'tutorial-basic-features-graph-analysis',
      name: '12 Analysis Algorithms',
      summary: 'Shows how to use the graph analysis algorithms.',
      demoPath: 'tutorial-yfiles-basic-features/12-graph-analysis/',
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
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json', 'data binding']
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
    },
    {
      id: 'tutorial-graph-builder-create-labels-sources',
      name: '07 Create Labels Sources',
      summary: 'Shows how to retrieve labels for nodes and edges from the business data.',
      demoPath: 'tutorial-graph-builder/07-create-labels-sources/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'labels', 'import'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json', 'data binding']
    },
    {
      id: 'tutorial-graph-builder-configure-labels',
      name: '08 Configure Labels',
      summary: 'Shows how to associate different label styles with the business data.',
      demoPath: 'tutorial-graph-builder/08-configure-labels/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'labels', 'styling'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'data binding']
    },
    {
      id: 'tutorial-graph-builder-configure-tags',
      name: '09 Configure Tags',
      summary: "Shows how to provide the business data in the elements' tags.",
      demoPath: 'tutorial-graph-builder/09-configure-tags/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'tags'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json', 'data binding']
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
      ]
    },
    {
      id: 'tutorial-graph-builder-update-graph',
      name: '11 Update Graph',
      summary: 'Shows how to update the graph after incremental changes in the business data.',
      demoPath: 'tutorial-graph-builder/11-update-graph/',
      category: 'tutorial-graph-builder',
      tags: ['business data', 'update'],
      keywords: ['v2.6.0.0', 'tutorial', 'graphbuilder', 'business data', 'json', 'data binding']
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
      ]
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
      ]
    },
    {
      id: 'tutorial-style-implementation-node',
      name: 'Tutorial: Node Style Implementation',
      summary: 'Learn how to implement a custom node style using SVG.',
      demoPath: 'tutorial-style-implementation-node/01-create-a-rectangle/',
      category: 'tutorial-style-implementation-node',
      tags: ['svg', 'nodestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling']
    },
    {
      id: 'tutorial-style-implementation-node-create-a-rectangle',
      name: '01 Create A Rectangle',
      summary: 'Create a simple node style using SVG',
      demoPath: 'tutorial-style-implementation-node/01-create-a-rectangle/',
      category: 'tutorial-style-implementation-node',
      tags: ['svg', 'nodestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling']
    },
    {
      id: 'tutorial-style-implementation-node-create-a-custom-shape',
      name: '02 Create A Custom Shape',
      summary: 'Create a simple node style with a custom shape using SVG',
      demoPath: 'tutorial-style-implementation-node/02-create-a-custom-shape/',
      category: 'tutorial-style-implementation-node',
      tags: ['svg', 'path', 'nodestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling']
    },
    {
      id: 'tutorial-style-implementation-node-render-performance',
      name: '03 Render Performance',
      summary: 'Optimize rendering performance of an SVG node style',
      demoPath: 'tutorial-style-implementation-node/03-render-performance/',
      category: 'tutorial-style-implementation-node',
      tags: ['svg', 'nodestyle'],
      keywords: [
        'v2.6.0.0',
        'tutorial',
        'custom',
        'styling',
        'updateVisual',
        'optimization',
        'performance'
      ]
    },
    {
      id: 'tutorial-style-implementation-node-making-the-style-configurable',
      name: '04 Making the Style Configurable',
      summary: 'Make a custom node style configurable by adding properties',
      demoPath: 'tutorial-style-implementation-node/04-making-the-style-configurable/',
      category: 'tutorial-style-implementation-node',
      tags: ['svg', 'nodestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'configuration']
    },
    {
      id: 'tutorial-style-implementation-node-data-from-tag',
      name: '05 Data from Tag',
      summary: 'Adjust how the node style renders the node using the node business data',
      demoPath: 'tutorial-style-implementation-node/05-data-from-tag/',
      category: 'tutorial-style-implementation-node',
      tags: ['svg', 'nodestyle', 'tag'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'business data']
    },
    {
      id: 'tutorial-style-implementation-node-render-text',
      name: '06 Rendering Text',
      summary: 'Adjust the node style to render text defined by the node business data',
      demoPath: 'tutorial-style-implementation-node/06-render-text/',
      category: 'tutorial-style-implementation-node',
      tags: ['svg', 'nodestyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'TextRenderSupport']
    },
    {
      id: 'tutorial-style-implementation-node-hit-testing',
      name: '07 Hit-Testing',
      summary: 'Customize which area of a node can be hovered and clicked',
      demoPath: 'tutorial-style-implementation-node/07-hit-testing/',
      category: 'tutorial-style-implementation-node',
      tags: ['svg', 'nodestyle', 'hittest'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'click', 'ishit']
    },
    {
      id: 'tutorial-style-implementation-node-edge-cropping',
      name: '08 Edge Cropping',
      summary: 'Customize where edges at the node are cropped',
      demoPath: 'tutorial-style-implementation-node/08-edge-cropping/',
      category: 'tutorial-style-implementation-node',
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
      ]
    },
    {
      id: 'tutorial-style-implementation-node-visibility',
      name: '09 Item Visibility',
      summary:
        'Adjust the visibility check to parts of the node visualization that lie outside of the node bounds',
      demoPath: 'tutorial-style-implementation-node/09-visibility/',
      category: 'tutorial-style-implementation-node',
      tags: ['svg', 'nodestyle', 'visible'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'isvisible']
    },
    {
      id: 'tutorial-style-implementation-node-bounds',
      name: '10 Render Boundaries',
      summary:
        'Adjust the node boundaries to parts of the node visualization that lie outside of the node bounds',
      demoPath: 'tutorial-style-implementation-node/10-bounds/',
      category: 'tutorial-style-implementation-node',
      tags: ['svg', 'nodestyle', 'bounds'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'getbounds']
    },
    {
      id: 'tutorial-style-implementation-node-group-node-style',
      name: '11 Group Node Style',
      summary: 'Create a basic group node style',
      demoPath: 'tutorial-style-implementation-node/11-group-node-style/',
      category: 'tutorial-style-implementation-node',
      tags: ['svg', 'nodestyle', 'group'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'grouping', 'padding']
    },
    {
      id: 'tutorial-style-implementation-node-group-node-style-behavior',
      name: '12 Group Node Style Behavior',
      summary: 'Adjust the group node style minimum size and size calculation',
      demoPath: 'tutorial-style-implementation-node/12-group-node-style-behavior/',
      category: 'tutorial-style-implementation-node',
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
      ]
    },
    {
      id: 'tutorial-style-implementation-label',
      name: 'Tutorial: Label Style Implementation',
      summary: 'Learn how to implement a custom label style using SVG.',
      demoPath: 'tutorial-style-implementation-label/01-render-label-text/',
      category: 'tutorial-style-implementation-label',
      tags: ['labelstyle', 'text', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling']
    },
    {
      id: 'tutorial-style-implementation-label-render-label-text',
      name: '01 Rendering the Label Text',
      summary: 'Visualize a label using a basic text element',
      demoPath: 'tutorial-style-implementation-label/01-render-label-text/',
      category: 'tutorial-style-implementation-label',
      tags: ['labelstyle', 'text', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling']
    },
    {
      id: 'tutorial-style-implementation-label-using-text-utilities',
      name: '02 Using Text Utilities',
      summary: 'Use convenience functionality to place the text',
      demoPath: 'tutorial-style-implementation-label/02-using-text-utilities/',
      category: 'tutorial-style-implementation-label',
      tags: ['labelstyle', 'text'],
      keywords: ['tutorial', 'custom', 'styling']
    },
    {
      id: 'tutorial-style-implementation-label-add-background-shape',
      name: '03 Adding a Background Shape',
      summary: 'Add a customized background to the label text',
      demoPath: 'tutorial-style-implementation-label/03-add-background-shape/',
      category: 'tutorial-style-implementation-label',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling', 'background']
    },
    {
      id: 'tutorial-style-implementation-label-preferred-size',
      name: '04 Preferred Label Size',
      summary: 'Let the label style set the desired label size',
      demoPath: 'tutorial-style-implementation-label/04-preferred-size/',
      category: 'tutorial-style-implementation-label',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling', 'size']
    },
    {
      id: 'tutorial-style-implementation-label-render-performance',
      name: '05 Render Performance',
      summary: 'Optimize the render performance of the label style',
      demoPath: 'tutorial-style-implementation-label/05-render-performance/',
      category: 'tutorial-style-implementation-label',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling']
    },
    {
      id: 'tutorial-style-implementation-label-text-alignment',
      name: '06 Text Alignment',
      summary: 'Configure horizontal and vertical text alignment inside the label bounds',
      demoPath: 'tutorial-style-implementation-label/06-text-alignment/',
      category: 'tutorial-style-implementation-label',
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
        'middle',
        'margin',
        'padding'
      ]
    },
    {
      id: 'tutorial-style-implementation-label-line-wrapping',
      name: '07 Line Wrapping',
      summary: 'Add automatic line wrapping to the label style',
      demoPath: 'tutorial-style-implementation-label/07-line-wrapping/',
      category: 'tutorial-style-implementation-label',
      tags: ['labelstyle', 'text', 'wrapping'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling', 'wrapping', 'line', 'break']
    },
    {
      id: 'tutorial-style-implementation-label-data-from-tag',
      name: '08 Data From Tag',
      summary: 'Use data from the label tag in the visualization',
      demoPath: 'tutorial-style-implementation-label/08-data-from-tag/',
      category: 'tutorial-style-implementation-label',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling', 'business data']
    },
    {
      id: 'tutorial-style-implementation-label-hit-testing',
      name: '09 Hit-Testing',
      summary: 'Configure which parts of the label visualization are clickable',
      demoPath: 'tutorial-style-implementation-label/09-hit-testing/',
      category: 'tutorial-style-implementation-label',
      tags: ['labelstyle', 'text', 'hittest'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling']
    },
    {
      id: 'tutorial-style-implementation-label-visibility',
      name: '10 Visibility',
      summary:
        'Adjust the visibility check to parts of the label visualization that lie outside of the label bounds',
      demoPath: 'tutorial-style-implementation-label/10-visibility/',
      category: 'tutorial-style-implementation-label',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling']
    },
    {
      id: 'tutorial-style-implementation-label-bounds',
      name: '11 Bounds',
      summary:
        'Adjust the label boundaries to parts of the label visualization that lie outside of the label bounds',
      demoPath: 'tutorial-style-implementation-label/11-bounds/',
      category: 'tutorial-style-implementation-label',
      tags: ['labelstyle', 'text'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'label', 'styling']
    },
    {
      id: 'tutorial-style-implementation-edge',
      name: 'Tutorial: Edge Style Implementation',
      summary: 'Learn how to implement a custom edge style using SVG.',
      demoPath: 'tutorial-style-implementation-edge/01-create-a-polyline/',
      category: 'tutorial-style-implementation-edge',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling']
    },
    {
      id: 'tutorial-style-implementation-edge-create-a-polyline',
      name: '01 Create a Polyline',
      summary: 'Create a simple edge style using SVG',
      demoPath: 'tutorial-style-implementation-edge/01-create-a-polyline/',
      category: 'tutorial-style-implementation-edge',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling']
    },
    {
      id: 'tutorial-style-implementation-edge-crop-the-polyline',
      name: '02 Crop the Polyline',
      summary: 'Crop the edge path at the outline of its source and target nodes.',
      demoPath: 'tutorial-style-implementation-edge/02-crop-the-polyline/',
      category: 'tutorial-style-implementation-edge',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling']
    },
    {
      id: 'tutorial-style-implementation-edge-create-parallel-polylines',
      name: '03 Create Parallel Polylines',
      summary: 'Create parallel polylines for edge visualization.',
      demoPath: 'tutorial-style-implementation-edge/03-create-parallel-polylines/',
      category: 'tutorial-style-implementation-edge',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling']
    },
    {
      id: 'tutorial-style-implementation-edge-render-performance',
      name: '04 Render Performance',
      summary: 'Optimize rendering performance of an SVG edge style',
      demoPath: 'tutorial-style-implementation-edge/04-render-performance/',
      category: 'tutorial-style-implementation-edge',
      tags: ['svg', 'edgestyle'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling']
    },
    {
      id: 'tutorial-style-implementation-edge-making-the-style-configurable',
      name: '05 Making the Style Configurable',
      summary: 'Make a custom edge style configurable by adding properties',
      demoPath: 'tutorial-style-implementation-edge/05-making-the-style-configurable/',
      category: 'tutorial-style-implementation-edge',
      tags: ['svg', 'edgestyle', 'distance'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'configuration']
    },
    {
      id: 'tutorial-style-implementation-edge-data-from-tag',
      name: '06 Data from Tag',
      summary: 'Adjust how the edge style renders the edge using the edge business data',
      demoPath: 'tutorial-style-implementation-edge/06-data-from-tag/',
      category: 'tutorial-style-implementation-edge',
      tags: ['svg', 'edgestyle', 'color', 'tag'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'business data']
    },
    {
      id: 'tutorial-style-implementation-edge-hit-testing',
      name: '07 Hit-Testing',
      summary: 'Customize which area of a edge can be hovered and clicked',
      demoPath: 'tutorial-style-implementation-edge/07-hit-testing/',
      category: 'tutorial-style-implementation-edge',
      tags: ['svg', 'edgestyle', 'hittest'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'click', 'ishit']
    },
    {
      id: 'tutorial-style-implementation-edge-visibility',
      name: '08 Item Visibility',
      summary:
        'Adjust the visibility check to parts of the edge visualization that lie outside of the edge bounds',
      demoPath: 'tutorial-style-implementation-edge/08-visibility/',
      category: 'tutorial-style-implementation-edge',
      tags: ['svg', 'edgestyle', 'visible'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'isvisible']
    },
    {
      id: 'tutorial-style-implementation-edge-bounds',
      name: '09 Render Boundaries',
      summary:
        'Adjust the edge boundaries to parts of the edge visualization that lie outside of the edge path',
      demoPath: 'tutorial-style-implementation-edge/09-bounds/',
      category: 'tutorial-style-implementation-edge',
      tags: ['svg', 'edgestyle', 'bounds'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'getbounds']
    },
    {
      id: 'tutorial-style-implementation-edge-bridge-support',
      name: '10 Bridge Support',
      summary:
        'Adjust the edge visualization to resolve the visual ambiguity induced by intersecting edge paths',
      demoPath: 'tutorial-style-implementation-edge/10-bridge-support/',
      category: 'tutorial-style-implementation-edge',
      tags: ['svg', 'edgestyle', 'bridge'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'bridge']
    },
    {
      id: 'tutorial-style-implementation-edge-adding-arrows',
      name: '11 Adding Arrows',
      summary: 'Add arrows to indicate the edge’s direction',
      demoPath: 'tutorial-style-implementation-edge/11-adding-arrows/',
      category: 'tutorial-style-implementation-edge',
      tags: ['svg', 'edgestyle', 'arrow'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'arrow']
    },
    {
      id: 'tutorial-style-implementation-edge-custom-arrow',
      name: '12 Custom Arrow',
      summary: 'Create a custom arrow that matches our edge style',
      demoPath: 'tutorial-style-implementation-edge/12-custom-arrow/',
      category: 'tutorial-style-implementation-edge',
      tags: ['svg', 'edgestyle', 'arrow'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'styling', 'arrow']
    },
    {
      id: 'tutorial-style-implementation-port',
      name: 'Tutorial: Port Style Implementation',
      summary: 'Learn how to implement a custom port style using SVG.',
      demoPath: 'tutorial-style-implementation-port/01-render-port-shape/',
      category: 'tutorial-style-implementation-port',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling']
    },
    {
      id: 'tutorial-style-implementation-port-render-port-shape',
      name: '01 Rendering the Port',
      summary: 'Visualize a port as a basic circle shape',
      demoPath: 'tutorial-style-implementation-port/01-render-port-shape/',
      category: 'tutorial-style-implementation-port',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling']
    },
    {
      id: 'tutorial-style-implementation-port-port-size',
      name: '02 Port Size',
      summary: 'Configuring the port size in the style',
      demoPath: 'tutorial-style-implementation-port/02-port-size/',
      category: 'tutorial-style-implementation-port',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling']
    },
    {
      id: 'tutorial-style-implementation-port-render-performance',
      name: '03 Render Performance',
      summary: 'Optimize rendering performance of an SVG port style',
      demoPath: 'tutorial-style-implementation-port/03-render-performance/',
      category: 'tutorial-style-implementation-port',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling', 'optimization']
    },
    {
      id: 'tutorial-style-implementation-port-conditional-coloring',
      name: '04 Conditional Port Coloring',
      summary: 'Set the color of the port based on the number of connected edges',
      demoPath: 'tutorial-style-implementation-port/04-conditional-coloring/',
      category: 'tutorial-style-implementation-port',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling', 'color', 'fill']
    },
    {
      id: 'tutorial-style-implementation-port-hit-testing',
      name: '05 Hit-Testing',
      summary: 'Customize which area of a port can be hovered and clicked',
      demoPath: 'tutorial-style-implementation-port/05-hit-testing/',
      category: 'tutorial-style-implementation-port',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling']
    },
    {
      id: 'tutorial-style-implementation-port-edge-cropping',
      name: '06 Edge Cropping',
      summary: 'Crop the edge at the port outline',
      demoPath: 'tutorial-style-implementation-port/06-edge-cropping/',
      category: 'tutorial-style-implementation-port',
      tags: ['portstyle', 'svg'],
      keywords: ['v2.6.0.0', 'tutorial', 'custom', 'port', 'styling']
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

    demo.thumbnailPath ??= `../doc/demo-thumbnails/${demo.id}.webp`
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
