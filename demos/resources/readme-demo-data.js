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
// eslint-disable-next-line no-unused-vars
function getDemoData() {
  return [
  {
    "id": "layout-styles",
    "name": "Layout Styles",
    "demoPath": "layout/layoutstyles/index.html",
    "summary": "Showcases the most used layout algorithms of yFiles, including hierarchic, organic, orthogonal, tree, circular, balloon, and several edge routing styles.",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "layout",
      "edge routing"
    ],
    "keywords": [
      "layout styles samples",
      "options",
      "overview",
      "hierarchic",
      "organic",
      "orthogonal",
      "circular",
      "tree",
      "balloon",
      "radial",
      "series-parallel",
      "edge router",
      "polyline router",
      "channel router",
      "bus router",
      "organic router",
      "parallel router",
      "generic labeling",
      "components",
      "tabular",
      "partial",
      "graph transformer",
      "label placement",
      "v2.4.0.0"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-hierarchic",
    "name": "Layout Styles: Hierarchic",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=hierarchic&sample=hierarchic",
    "summary": "Suitable for any kind of directed diagram, like flow charts, BPMN diagrams and more",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-hierarchic.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "layout",
      "hierarchic"
    ],
    "keywords": [
      "layout styles samples",
      "layout algorithm",
      "HierarchicLayout",
      "hierarchy",
      "hierarchical",
      "sugiyama",
      "layered",
      "flow",
      "direction",
      "bus structures",
      "directed",
      "layers",
      "curves",
      "curved",
      "splines",
      "polyline",
      "octilinear",
      "orthogonal",
      "bpmn",
      "uml",
      "flowchart",
      "sankey",
      "decision tree",
      "incremental",
      "grouping",
      "partition grid",
      "swimlane",
      "call graph",
      "pathways",
      "entity relationship",
      "workflow"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-organic",
    "name": "Layout Styles: Organic",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=organic&sample=organic",
    "summary": "Suitable for many types of undirected graphs and complex networks, like social networks, WWW visualizations or knowledge representation.",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-organic.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "layout",
      "organic"
    ],
    "keywords": [
      "layout styles samples",
      "layout algorithm",
      "OrganicLayout",
      "force directed",
      "spring embedder",
      "energy based",
      "Kamada Kawai",
      "Fruchterman Reingold",
      "physical",
      "social",
      "network",
      "networking",
      "straight line",
      "substructures",
      "stars",
      "chains",
      "cliques",
      "mesh",
      "undirected",
      "large graphs"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-edgerouter",
    "name": "Layout Styles: Edge Router",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=edge-router&sample=edge-router",
    "summary": "For routing edges in an orthogonal, octilinear or curved style.",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-edgerouter.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "edge routing",
      "polyline"
    ],
    "keywords": [
      "layout styles samples",
      "routing algorithm",
      "router",
      "layout",
      "routing",
      "route",
      "re-routing",
      "curved",
      "curves",
      "splines",
      "path",
      "orthogonal",
      "octilinear",
      "polyline",
      "bus",
      "backbone"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-tree",
    "name": "Layout Styles: Tree",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=tree&sample=tree",
    "summary": "Suitable to visualize tree structures like organization charts or for dataflow analysis.",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-tree.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "layout",
      "tree"
    ],
    "keywords": [
      "layout styles samples",
      "layout algorithm",
      "tree layout",
      "tree",
      "node placer",
      "org chart",
      "root",
      "directed",
      "dendrogram",
      "hierarchic",
      "hierarchy"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-balloon",
    "name": "Layout Styles: Balloon",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=balloon&sample=balloon",
    "summary": "Suitable to visualize tree-like structures in a radial fashion.",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-balloon.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "layout",
      "balloon"
    ],
    "keywords": [
      "layout styles samples",
      "balloon layout",
      "tree",
      "radial",
      "balloons",
      "stars",
      "star like",
      "social networks",
      "organic"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-orthogonal",
    "name": "Layout Styles: Orthogonal",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=orthogonal&sample=orthogonal",
    "summary": "Suitable for diagrams with orthogonal edges such as UML, database schemas, system management and more.",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-orthogonal.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "layout",
      "orthogonal"
    ],
    "keywords": [
      "layout styles samples",
      "layout algorithm",
      "orthogonal layout",
      "tsm",
      "topology shape metrics",
      "planar",
      "substructures",
      "perpendicular",
      "system management",
      "uml"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-circular",
    "name": "Layout Styles: Circular",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=circular&sample=circular",
    "summary": "Suitable for applications in social networking, for WWW visualization and network management",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-circular.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "layout",
      "circular"
    ],
    "keywords": [
      "layout styles samples",
      "layout algorithm",
      "circular layout",
      "cycles",
      "circles",
      "elliptical",
      "bundling",
      "radial",
      "straight lines",
      "arcs",
      "rings",
      "chords"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-radial",
    "name": "Layout Styles: Radial",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=radial&sample=radial",
    "summary": "Suitable to visualize directed diagrams with a certain flow.",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-radial.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "layout",
      "radial"
    ],
    "keywords": [
      "layout styles samples",
      "radial layout",
      "circles",
      "circular",
      "concentric",
      "hierarchical",
      "hierarchy",
      "layered",
      "arcs",
      "tree",
      "directed",
      "bundling"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-seriesparallel",
    "name": "Layout Styles: Series-Parallel",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=series-parallel&sample=series-parallel",
    "summary": "Suitable for diagrams with a main direction, like flow charts.",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-seriesparallel.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "layout",
      "seriesparallel"
    ],
    "keywords": [
      "layout styles samples",
      "layout algorithm",
      "series parallel layout",
      "series",
      "parallel",
      "hierarchical",
      "orthogonal",
      "octilinear",
      "directed",
      "sp graph"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-busrouter",
    "name": "Layout Styles: Bus Router",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=bus-router",
    "summary": "For routing edges in an orthogonal bus-style.",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-busrouter.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "edge routing",
      "bus"
    ],
    "keywords": [
      "layout styles samples",
      "routing algorithm",
      "bus router",
      "layout",
      "routing",
      "orthogonal",
      "buses",
      "backbones"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-components",
    "name": "Layout Styles: Components",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=components&sample=components",
    "summary": "For arranging any kind of disconnected diagram components.",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-components.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "layout",
      "component"
    ],
    "keywords": [
      "layout styles samples",
      "layout algorithm",
      "component layout",
      "components"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-tabular",
    "name": "Layout Styles: Tabular",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=tabular&sample=tabular",
    "summary": "Suitable to arrange elements in rows and columns.",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-tabular.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "layout",
      "tabular"
    ],
    "keywords": [
      "layout styles samples",
      "layout algorithm",
      "tabular layout",
      "rows",
      "row-like",
      "columns",
      "column-like",
      "grid",
      "components",
      "disconnected",
      "tables"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-labeling",
    "name": "Layout Styles: Labeling",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=labeling",
    "summary": "Places node and edge labels.",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-labeling.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "label placement"
    ],
    "keywords": [
      "layout styles samples",
      "generic labeling",
      "preferred placement"
    ],
    "ts": true
  },
  {
    "id": "layout-styles-partial",
    "name": "Layout Styles: Partial",
    "hiddenInGrid": true,
    "demoPath": "layout/layoutstyles/index.html?layout=partial",
    "summary": "Suitable for incremental scenarios where new elements should be added to an existing diagram layout.",
    "category": "layout",
    "type": "layout-styles",
    "thumbnailPath": "resources/image/layoutstyles-partial.png",
    "sourcePath": "layout/layoutstyles/LayoutStylesDemo.js",
    "tags": [
      "layout",
      "partial",
      "incremental"
    ],
    "keywords": [
      "layout styles samples",
      "layout algorithm",
      "partial layout",
      "mental map",
      "subgraph",
      "fixed"
    ],
    "ts": true
  },
  {
    "id": "bpmn-editor",
    "name": "BPMN Editor",
    "demoPath": "complete/bpmn/index.html",
    "summary": "An editor for Business Process diagrams that features interactive editing, BPMN node styles and a specialized BPMN layout algorithm.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/bpmneditor.png",
    "sourcePath": "complete/bpmn/BpmnEditorDemo.js",
    "tags": [
      "style",
      "layout",
      "interaction"
    ],
    "keywords": [
      "context menu",
      "drag and drop",
      "palette",
      "ports",
      "overview",
      "dnd",
      "notable style"
    ],
    "ts": true
  },
  {
    "id": "organization-chart",
    "name": "Organization Chart",
    "demoPath": "complete/interactiveorgchart/index.html",
    "summary": "An interactive viewer for organization charts with automatic layout updates.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/interactiveorgchart.png",
    "sourcePath": "complete/interactiveorgchart/OrgChartDemo.js",
    "tags": [
      "style",
      "layout",
      "interaction"
    ],
    "keywords": [
      "orgchart",
      "animation",
      "filtering",
      "search",
      "highlight",
      "templates",
      "print",
      "data panel",
      "structures",
      "hide",
      "detail",
      "notable style"
    ],
    "ts": true
  },
  {
    "id": "process-mining",
    "name": "Process Mining",
    "demoPath": "complete/processmining/index.html",
    "summary": "Shows how to create an animated visualization of a process flow.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/processmining.png",
    "sourcePath": "complete/processmining/ProcessMiningDemo.js",
    "tags": [
      "webgl",
      "animation",
      "heatmap"
    ],
    "keywords": [
      "v2.3.0.2",
      "notable style"
    ],
    "ts": true
  },
  {
    "id": "gantt-chart",
    "name": "Gantt Chart",
    "demoPath": "view/ganttchart/index.html",
    "summary": "An editor for Gantt charts.",
    "category": "view",
    "type": "use-cases",
    "thumbnailPath": "resources/image/ganttchart.png",
    "sourcePath": "view/ganttchart/GanttChartDemo.js",
    "tags": [
      "style",
      "interaction"
    ],
    "keywords": [
      "activity",
      "activities",
      "tasks",
      "swim lanes",
      "calendar",
      "dates",
      "times",
      "schedule"
    ],
    "ts": true
  },
  {
    "id": "fraud-detection",
    "name": "Fraud Detection",
    "demoPath": "complete/frauddetection/index.html",
    "summary": "Example of a fraud detection application for time-dependent data.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/frauddetection.png",
    "sourcePath": "complete/frauddetection/FraudDetectionDemo.js",
    "tags": [
      "timeline",
      "layout",
      "detailed view"
    ],
    "keywords": [
      "filtering",
      "animations",
      "structures",
      "detail"
    ],
    "ts": true
  },
  {
    "id": "isometric-drawing",
    "name": "Isometric Drawing",
    "demoPath": "complete/isometricdrawing/index.html",
    "summary": "Displays graphs in 3D using an arbitrary projection and WebGL rendering.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/isometric-drawing.png",
    "sourcePath": "complete/isometricdrawing/IsometricDrawingDemo.js",
    "tags": [
      "webgl",
      "style",
      "layout",
      "projection"
    ],
    "keywords": [
      "v2.3.0.0",
      "groups",
      "folding",
      "hierarchic",
      "orthogonal",
      "labels",
      "3d",
      "isometric"
    ],
    "ts": true
  },
  {
    "id": "network-monitoring",
    "name": "Network Monitoring",
    "demoPath": "complete/networkmonitoring/index.html",
    "summary": "Example of a monitoring tool for computer networks.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/networkmonitoring.png",
    "sourcePath": "complete/networkmonitoring/NetworkMonitoringDemo.js",
    "tags": [
      "style",
      "viewer",
      "animation"
    ],
    "keywords": [
      "tool tips",
      "data panel",
      "chart",
      "structures",
      "d3js",
      "d3.js",
      "notable style"
    ],
    "ts": true
  },
  {
    "id": "metaball-groups",
    "name": "Metaball Groups",
    "demoPath": "complete/metaballgroups/index.html",
    "summary": "Shows how to render metaball-like background visualizations.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/metaballgroups.png",
    "sourcePath": "complete/metaballgroups/MetaballGroupsDemo.js",
    "tags": [
      "background",
      "webgl"
    ],
    "keywords": [
      "v2.2.0.0",
      "overlapping",
      "heatmap"
    ],
    "ts": true
  },
  {
    "id": "interactive-map",
    "name": "Interactive Map",
    "demoPath": "complete/mapintegration/index.html",
    "summary": "Draws a graph on top of an interactive map.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/mapintegration.png",
    "sourcePath": "complete/mapintegration/MapIntegrationDemo.js",
    "tags": [
      "style",
      "layout",
      "leaflet"
    ],
    "keywords": [
      "v2.1.0.2",
      "overlay",
      "layers",
      "controls",
      "radial",
      "tool tips",
      "shortest paths",
      "filtering",
      "background",
      "curves",
      "bezier"
    ],
    "ts": true
  },
  {
    "id": "graph-wizard-flowchart",
    "name": "GraphWizard for Flowchart",
    "demoPath": "complete/graph-wizard-for-flowchart/index.html",
    "summary": "Customizes defaults and input gestures to support fast creation of flowcharts.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/graphwizard-flowchart.png",
    "sourcePath": "complete/graph-wizard-for-flowchart/GraphWizardForFlowchartDemo.js",
    "tags": [
      "wizard",
      "flowchart"
    ],
    "keywords": [
      "v2.4.0.4",
      "flow",
      "shapes",
      "layout",
      "input",
      "button"
    ],
    "ts": true
  },
  {
    "id": "flowchart-editor",
    "name": "Flowchart Editor",
    "demoPath": "complete/flowchart/index.html",
    "summary": "An editor for Flowchart diagrams that features interactive editing, flowchart node styles, and automatic layout.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/flowchart-editor.png",
    "sourcePath": "complete/flowchart/FlowchartDemo.js",
    "tags": [
      "style",
      "layout",
      "drag and drop"
    ],
    "keywords": [
      "hierarchic",
      "palette",
      "dnd"
    ],
    "ts": true
  },
  {
    "id": "uml-editor",
    "name": "UML Editor",
    "demoPath": "complete/uml/index.html",
    "summary": "An editor for UML diagrams with a tailored UML node style, automatic layout, and a quick way to create new edges with the mouse or touch.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/uml-editor.png",
    "sourcePath": "complete/uml/UMLEditorDemo.js",
    "tags": [
      "style",
      "layout",
      "interaction"
    ],
    "keywords": [
      "v2.1.0.1",
      "context menu",
      "labels",
      "edge router",
      "hierarchic",
      "structures"
    ],
    "ts": true
  },
  {
    "id": "decision-tree",
    "name": "Decision Tree",
    "demoPath": "complete/decisiontree/index.html",
    "summary": "An interactive Decision Tree component that lets you design and explore your own decision graphs.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/decisiontree.png",
    "sourcePath": "complete/decisiontree/DecisionTreeDemo.js",
    "tags": [
      "layout",
      "interaction"
    ],
    "keywords": [
      "hierarchic",
      "context menu"
    ],
    "ts": true
  },
  {
    "id": "mindmap-editor",
    "name": "Mindmap Editor",
    "demoPath": "complete/mindmap/index.html",
    "summary": "A Mindmap editor with a tailored node style, custom user interaction, and a specialized layoutthat automatically arranges new entries.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/mindmap.png",
    "sourcePath": "complete/mindmap/MindmapDemo.js",
    "tags": [
      "style",
      "layout",
      "interaction"
    ],
    "keywords": [
      "context menu",
      "tree",
      "structures",
      "labels",
      "notable style"
    ],
    "ts": true
  },
  {
    "id": "sankey-diagram",
    "name": "Sankey Diagram",
    "demoPath": "layout/sankey/index.html",
    "summary": "A diagram used for visualizing flow information in which the thickness of the edges is proportional to the flow quantity.",
    "category": "layout",
    "type": "use-cases",
    "thumbnailPath": "resources/image/sankey.png",
    "sourcePath": "layout/sankey/SankeyDemo.js",
    "tags": [
      "edge thickness",
      "style",
      "layout"
    ],
    "keywords": [
      "context menu",
      "hierarchic",
      "generic labeling",
      "labels"
    ],
    "ts": true
  },
  {
    "id": "tree-map",
    "name": "Tree Map",
    "demoPath": "layout/treemap/index.html",
    "summary": "Shows disk usage of a directory tree with the Tree Map layout.",
    "category": "layout",
    "type": "use-cases",
    "thumbnailPath": "resources/image/treemap.png",
    "sourcePath": "layout/treemap/TreeMapDemo.js",
    "tags": [
      "layout",
      "tree map"
    ],
    "keywords": [
      "tree map",
      "v2.1.0.0",
      "animations",
      "tool tips"
    ],
    "ts": true
  },
  {
    "id": "tag-cloud",
    "name": "Tag Cloud",
    "demoPath": "complete/tag-cloud/index.html",
    "summary": "Shows how to create a Tag Cloud.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/tag-cloud.png",
    "sourcePath": "complete/tag-cloud/TagCloudDemo.js",
    "tags": [
      "layout",
      "style"
    ],
    "keywords": [
      "v2.4.0.4",
      "words",
      "components",
      "labels"
    ],
    "ts": true
  },
  {
    "id": "organization-chart-viewer",
    "name": "Organization Chart Viewer",
    "demoPath": "complete/orgchartviewer/index.html",
    "summary": "A viewer for organization charts.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/orgchart.png",
    "sourcePath": "complete/orgchartviewer/OrgChartViewerDemo.js",
    "tags": [
      "style",
      "layout"
    ],
    "keywords": [
      "orgchart",
      "search",
      "templates",
      "data panel",
      "v2.2.0.0",
      "structures",
      "highlights"
    ],
    "ts": true
  },
  {
    "id": "critical-path-analysis",
    "name": "Critical Path Analysis (CPA)",
    "demoPath": "analysis/criticalpathanalysis/index.html",
    "summary": "Shows how to perform critical path analysis in project management.",
    "category": "analysis",
    "type": "use-cases",
    "thumbnailPath": "resources/image/criticalpathanalysis.png",
    "sourcePath": "analysis/criticalpathanalysis/CriticalPathAnalysisDemo.js",
    "tags": [
      "analysis",
      "hierarchic",
      "rank"
    ],
    "keywords": [
      "critical",
      "paths",
      "project",
      "management",
      "slack",
      "scheduling"
    ],
    "ts": true
  },
  {
    "id": "logic-gates",
    "name": "Logic Gates",
    "demoPath": "complete/logicgates/index.html",
    "summary": "An editor for networks of logic gates, with tailored automatic layout.",
    "category": "complete",
    "type": "use-cases",
    "thumbnailPath": "resources/image/logicgates.png",
    "sourcePath": "complete/logicgates/LogicGatesDemo.js",
    "tags": [
      "port",
      "style",
      "layout"
    ],
    "keywords": [
      "ports",
      "candidates",
      "constraints",
      "hierarchic",
      "edge router",
      "drag and drop",
      "palette",
      "reversed edge creation",
      "dnd"
    ],
    "ts": true
  },
  {
    "id": "graph-analysis",
    "name": "Graph Analysis",
    "demoPath": "analysis/graphanalysis/index.html",
    "summary": "Showcases a selection of graph algorithms such as shortest paths, flows, centrality measures, etc. that help analysing the structure of a graph.",
    "category": "analysis",
    "type": "features",
    "thumbnailPath": "resources/image/graphanalysis.png",
    "sourcePath": "analysis/graphanalysis/GraphAnalysisDemo.js",
    "tags": [
      "analysis",
      "layout",
      "style"
    ],
    "keywords": [
      "context menu",
      "centrality",
      "connectivity",
      "reachability",
      "cycles",
      "spanning tree",
      "shortest paths"
    ],
    "ts": true
  },
  {
    "id": "hierarchic-nesting",
    "name": "Hierarchic Nesting",
    "demoPath": "complete/hierarchicgrouping/index.html",
    "summary": "The hierarchic layout nicely expands and collapses sub-graphs organized in groups.",
    "category": "complete",
    "type": "features",
    "thumbnailPath": "resources/image/hierarchicgrouping.png",
    "sourcePath": "complete/hierarchicgrouping/HierarchicGroupingDemo.js",
    "tags": [
      "layout",
      "hierarchic",
      "animation"
    ],
    "keywords": [
      "overview",
      "folding",
      "hide"
    ],
    "ts": true
  },
  {
    "id": "folding-with-layout",
    "name": "Folding With Layout",
    "demoPath": "layout/foldingwithlayout/index.html",
    "summary": "Shows how an automatic layout makes space for opening groups and reclaims the space of closing groups.",
    "category": "layout",
    "type": "features",
    "thumbnailPath": "resources/image/foldingwithlayout.png",
    "sourcePath": "layout/foldingwithlayout/FoldingWithLayoutDemo.js",
    "tags": [
      "layout",
      "hierarchic",
      "grouping"
    ],
    "keywords": [
      "folding",
      "hide",
      "create",
      "space",
      "clear area layout",
      "fill area layout",
      "v2.3.0.2"
    ],
    "ts": true
  },
  {
    "id": "large-graphs",
    "name": "Large Graphs",
    "demoPath": "view/large-graphs/index.html",
    "summary": "Shows how to display large graphs with both good performance in WebGL2 and high quality in SVG.",
    "category": "view",
    "type": "features",
    "thumbnailPath": "resources/image/large-graphs.png",
    "sourcePath": "view/large-graphs/LargeGraphsDemo.js",
    "tags": [
      "performance",
      "webgl"
    ],
    "keywords": [
      "v2.4.0.0",
      "rendering",
      "large",
      "huge",
      "webgl2",
      "svg"
    ],
    "ts": true
  },
  {
    "id": "large-graph-aggregation",
    "name": "Large Graph Aggregation",
    "demoPath": "complete/largegraphaggregation/index.html",
    "summary": "Shows how to use the smart node aggregation for drill-down exploration of a large graph.",
    "category": "complete",
    "type": "features",
    "thumbnailPath": "resources/image/largegraphaggregation.png",
    "sourcePath": "complete/largegraphaggregation/LargeGraphAggregationDemo.js",
    "tags": [
      "large graph",
      "exploration"
    ],
    "keywords": [
      "v2.3.0.0",
      "balloon",
      "aggregation graph wrapper",
      "curves",
      "bezier",
      "clusters"
    ],
    "ts": true
  },
  {
    "id": "interactive-aggregation",
    "name": "Interactive Aggregation",
    "demoPath": "complete/interactiveaggregation/index.html",
    "summary": "Shows how to analyze a graph by interactively aggregating nodes with common properties.",
    "category": "complete",
    "type": "features",
    "thumbnailPath": "resources/image/interactiveaggregation.png",
    "sourcePath": "complete/interactiveaggregation/InteractiveAggregationDemo.js",
    "tags": [
      "large graph",
      "exploration"
    ],
    "keywords": [
      "v2.3.0.2",
      "aggregation graph wrapper",
      "context menu",
      "clusters"
    ],
    "ts": true
  },
  {
    "id": "large-tree",
    "name": "Large Collapsible Tree",
    "demoPath": "complete/large-tree/index.html",
    "summary": "Shows a tree graph, where a large number of nodes can be added interactively.",
    "category": "complete",
    "type": "features",
    "thumbnailPath": "resources/image/large-tree.png",
    "sourcePath": "complete/large-tree/LargeTreeDemo.js",
    "tags": [
      "performance",
      "webgl",
      "interaction"
    ],
    "keywords": [
      "v2.4.0.0",
      "rendering",
      "large",
      "huge",
      "webgl2",
      "svg"
    ],
    "ts": true
  },
  {
    "id": "collapsible-trees",
    "name": "Collapsible Trees",
    "demoPath": "complete/collapse/index.html",
    "summary": "Shows interactive collapsing and expanding of subtrees of a graph.",
    "category": "complete",
    "type": "features",
    "thumbnailPath": "resources/image/collapsibletree.png",
    "sourcePath": "complete/collapse/CollapseDemo.js",
    "tags": [
      "layout",
      "interaction",
      "animation"
    ],
    "keywords": [
      "hierarchic",
      "organic",
      "tree",
      "balloon",
      "filtering",
      "hide"
    ],
    "ts": true
  },
  {
    "id": "rendering-optimizations",
    "name": "Rendering Optimizations",
    "demoPath": "view/rendering-optimizations/index.html",
    "summary": "Illustrates optimizations of the rendering performance for large graphs.",
    "category": "view",
    "type": "features",
    "thumbnailPath": "resources/image/rendering-optimizations.png",
    "sourcePath": "view/rendering-optimizations/RenderingOptimizationsDemo.js",
    "tags": [
      "performance",
      "canvas",
      "webgl"
    ],
    "keywords": [
      "v2.4.0.0",
      "fps",
      "rendering",
      "large",
      "huge",
      "webgl2"
    ],
    "ts": true
  },
  {
    "id": "neighborhood-view",
    "name": "Neighborhood View",
    "demoPath": "complete/neighborhood/index.html",
    "summary": "Shows the neighborhood of the currently selected node alongside the graph.",
    "category": "complete",
    "type": "features",
    "thumbnailPath": "resources/image/neighborhoodview.png",
    "sourcePath": "complete/neighborhood/NeighborhoodDemo.js",
    "tags": [
      "layout",
      "interaction"
    ],
    "keywords": [
      "hierarchic",
      "copy",
      "detail"
    ],
    "ts": true
  },
  {
    "id": "contextual-toolbar",
    "name": "Contextual Toolbar",
    "demoPath": "view/contextualtoolbar/index.html",
    "summary": "Shows a contextual toolbar for the current selection that enables fast and easy style changes.",
    "category": "view",
    "type": "features",
    "thumbnailPath": "resources/image/contextualtoolbar.png",
    "sourcePath": "view/contextualtoolbar/ContextualToolbarDemo.js",
    "tags": [
      "interaction",
      "overlay"
    ],
    "keywords": [
      "v2.1.0.2",
      "html",
      "popup",
      "context menu"
    ],
    "ts": true
  },
  {
    "id": "magnifying-glass",
    "name": "Magnifying Glass",
    "demoPath": "input/magnifying-glass/index.html",
    "summary": "Shows a floating lens that magnifies the cursor's surroundings.",
    "category": "input",
    "type": "features",
    "thumbnailPath": "resources/image/magnifying-glass.png",
    "sourcePath": "input/magnifying-glass/MagnifyingGlassDemo.js",
    "tags": [
      "interaction",
      "input"
    ],
    "keywords": [
      "magnifier ",
      "lens",
      "zoom",
      "input mode"
    ],
    "ts": true
  },
  {
    "id": "css3-animations-and-transitions",
    "name": "CSS3 Animations and Transitions",
    "demoPath": "style/css3animationsandtransitions/index.html",
    "summary": "Shows how CSS3 transformations and animations can be applied to graph items.",
    "category": "style",
    "type": "features",
    "thumbnailPath": "resources/image/css3_animations_and_transitions.png",
    "sourcePath": "style/css3animationsandtransitions/CSS3AnimationsAndTransitionsDemo.js",
    "tags": [
      "style",
      "animation",
      "transition"
    ],
    "keywords": [
      "curves"
    ],
    "ts": true
  },
  {
    "id": "webgl-animations",
    "name": "WebGL2 Animations",
    "demoPath": "style/webgl-animations/index.html",
    "summary": "Shows howto use WebGL2 animations to highlight interesting parts of a graph.",
    "category": "style",
    "type": "features",
    "thumbnailPath": "resources/image/webgl-animations.png",
    "sourcePath": "style/webgl-animations/WebGLAnimationsDemo.js",
    "tags": [
      "animation",
      "webgl2"
    ],
    "keywords": [
      "v2.4.0.0"
    ],
    "ts": true
  },
  {
    "id": "clustering-algorithms",
    "name": "Clustering Algorithms",
    "demoPath": "analysis/clustering/index.html",
    "summary": "Showcases a selection of clustering algorithms such as edge betweenness, k-means, hierarchical and biconnected components clustering.",
    "category": "analysis",
    "type": "features",
    "thumbnailPath": "resources/image/clustering.png",
    "sourcePath": "analysis/clustering/ClusteringDemo.js",
    "tags": [
      "analysis"
    ],
    "keywords": [
      "k-means",
      "hierarchical",
      "voronoi",
      "dendrogram",
      "background"
    ],
    "ts": true
  },
  {
    "id": "network-flows",
    "name": "Network Flows",
    "demoPath": "analysis/networkflows/index.html",
    "summary": "Presents three network flow graph analysis algorithms that are applied on a network of water pipes.",
    "category": "analysis",
    "type": "features",
    "thumbnailPath": "resources/image/networkflows.png",
    "sourcePath": "analysis/networkflows/NetworkFlowsDemo.js",
    "tags": [
      "analysis",
      "style"
    ],
    "keywords": [
      "network flows",
      "maximum",
      "minimum",
      "cuts",
      "labels"
    ],
    "ts": true
  },
  {
    "id": "transitivity",
    "name": "Transitivity",
    "demoPath": "analysis/transitivity/index.html",
    "summary": "Shows how transitivity graph analysis algorithms can be applied to solve reachability problems.",
    "category": "analysis",
    "type": "features",
    "thumbnailPath": "resources/image/transitivity.png",
    "sourcePath": "analysis/transitivity/TransitivityDemo.js",
    "tags": [
      "analysis"
    ],
    "keywords": [
      "transitive",
      "closures",
      "reduction",
      "filtering",
      "structures",
      "highlights"
    ],
    "ts": true
  },
  {
    "id": "graph-editor",
    "name": "Graph Editor",
    "demoPath": "view/grapheditor/index.html",
    "summary": "Shows the graph editing features of the graph component.",
    "category": "view",
    "type": "features",
    "thumbnailPath": "resources/image/simpleeditor.png",
    "sourcePath": "view/grapheditor/GraphEditorDemo.js",
    "tags": [
      "interaction"
    ],
    "keywords": [
      "context menu",
      "groups",
      "folding",
      "overview",
      "Labels"
    ],
    "ts": true
  },
  {
    "id": "table-editor",
    "name": "Table Editor",
    "demoPath": "complete/tableeditor/index.html",
    "summary": "Shows the support for diagrams that are organized in a tabular way, for example in a grid or a swimlane layout.",
    "category": "complete",
    "type": "features",
    "thumbnailPath": "resources/image/tableeditor.png",
    "sourcePath": "complete/tableeditor/TableEditorDemo.js",
    "tags": [
      "table",
      "interaction"
    ],
    "keywords": [
      "drag and drop",
      "palette",
      "hierarchic",
      "groups",
      "context menu",
      "move",
      "labels",
      "dnd"
    ],
    "ts": true
  },
  {
    "id": "graph-viewer",
    "name": "Graph Viewer",
    "demoPath": "view/graphviewer/index.html",
    "summary": "Displays sample graphs from various application domains.",
    "category": "view",
    "type": "features",
    "thumbnailPath": "resources/image/graphviewer.png",
    "sourcePath": "view/graphviewer/GraphViewerDemo.js",
    "tags": [
      "style",
      "overview"
    ],
    "keywords": [
      "tool tips",
      "context menu",
      "data panel",
      "search",
      "highlight",
      "curves",
      "bezier"
    ],
    "ts": true
  },
  {
    "id": "html-popup",
    "name": "HTML Popup",
    "demoPath": "view/htmlpopup/index.html",
    "summary": "Shows HTML pop-up panels that displays additional information about a clicked node or edge.",
    "category": "view",
    "type": "features",
    "thumbnailPath": "resources/image/htmlpopup.png",
    "sourcePath": "view/htmlpopup/HTMLPopupDemo.js",
    "tags": [
      "interaction",
      "overlay"
    ],
    "keywords": [
      "html popups",
      "data panel",
      "tool tips",
      "structures",
      "details"
    ],
    "ts": true
  },
  {
    "id": "structure-view",
    "name": "Structure View",
    "demoPath": "view/structureview/index.html",
    "summary": "A tree list component that shows the nesting of the groups and nodes.",
    "category": "view",
    "type": "features",
    "thumbnailPath": "resources/image/structureview.png",
    "sourcePath": "view/structureview/StructureViewDemo.js",
    "tags": [
      "interaction"
    ],
    "keywords": [
      "lists",
      "tree",
      "overview",
      "structures",
      "v2.1.0.3",
      "labels"
    ],
    "ts": true
  },
  {
    "id": "rendering-order",
    "name": "Rendering Order",
    "demoPath": "view/renderingorder/index.html",
    "summary": "Shows different rendering order settings.",
    "category": "view",
    "type": "features",
    "thumbnailPath": "resources/image/renderingorder.png",
    "sourcePath": "view/renderingorder/RenderingOrderDemo.js",
    "tags": [
      "rendering",
      "z-order",
      "grouping"
    ],
    "keywords": [
      "hierarchic nesting",
      "ports",
      "labels",
      "groups"
    ],
    "ts": true
  },
  {
    "id": "z-order",
    "name": "Z-Order",
    "demoPath": "view/zorder/index.html",
    "summary": "Shows how to adjust the z-order of graph elements and to keep this z-order consistent.",
    "category": "view",
    "type": "features",
    "thumbnailPath": "resources/image/zorder.png",
    "sourcePath": "view/zorder/ZOrderDemo.js",
    "tags": [
      "rendering",
      "z-order"
    ],
    "keywords": [
      "v2.3.0.0",
      "raise",
      "lower",
      "to Front",
      "to Back",
      "clipboard",
      "graphml",
      "z-index"
    ],
    "ts": true
  },
  {
    "id": "rotatable-nodes",
    "name": "Rotatable Nodes",
    "demoPath": "complete/rotatablenodes/index.html",
    "summary": "Shows nodes that can be rotated with the mouse or touch.",
    "category": "complete",
    "type": "features",
    "thumbnailPath": "resources/image/RotatableNodes.png",
    "sourcePath": "complete/rotatablenodes/RotatableNodesDemo.js",
    "tags": [
      "style",
      "layout",
      "interaction"
    ],
    "keywords": [
      "handles",
      "input",
      "rotation",
      "v2.1.0.1",
      "labels",
      "ports",
      "hierarchic",
      "organic",
      "orthogonal",
      "circular",
      "tree",
      "balloon",
      "radial",
      "edge router",
      "polyline router",
      "organic router",
      "curves"
    ],
    "ts": true
  },
  {
    "id": "touch-interaction",
    "name": "Touch Interaction",
    "demoPath": "input/touchcustomization/index.html",
    "summary": "Shows how a graph editor application can be optimized for touch devices.",
    "category": "input",
    "type": "features",
    "thumbnailPath": "resources/image/custom_touch_interaction.png",
    "sourcePath": "input/touchcustomization/TouchEditorDemo.js",
    "tags": [
      "interaction",
      "mobile"
    ],
    "keywords": [
      "v2.1.0.0",
      "palette",
      "drag and drop",
      "context menu",
      "move",
      "dnd"
    ],
    "ts": true
  },
  {
    "id": "arrange-objects",
    "name": "Arrange Objects",
    "demoPath": "view/arrange-objects/index.html",
    "summary": "Shows simple operations for aligning and distributing nodes.",
    "category": "view",
    "type": "features",
    "thumbnailPath": "resources/image/arrange-objects.png",
    "sourcePath": "view/arrange-objects/ArrangeObjectsDemo.js",
    "tags": [
      "viewer"
    ],
    "keywords": [
      "v2.4.0.4",
      "arrange",
      "align nodes",
      "distribute nodes"
    ],
    "ts": true
  },
  {
    "id": "custom-styles",
    "name": "Custom Styles",
    "demoPath": "style/customstyles/index.html",
    "summary": "Shows how to create custom styles for nodes, edges, labels, ports, and edge arrows.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/customstyles.png",
    "sourcePath": "style/customstyles/CustomStyleDemo.js",
    "tags": [
      "style",
      "grouping"
    ],
    "keywords": [
      "folding",
      "labels",
      "ports"
    ],
    "ts": true
  },
  {
    "id": "template-styles",
    "name": "Template Styles",
    "demoPath": "style/templatestyles/index.html",
    "summary": "Shows SVG template styles for nodes, labels and ports.",
    "category": "style",
    "type": "custom-styles",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/templatestyles.png",
    "sourcePath": "style/templatestyles/TemplateStylesDemo.js",
    "tags": [
      "style",
      "data binding"
    ],
    "keywords": [
      "v2.1.0.2",
      "svg",
      "data panel",
      "templates",
      "notable style"
    ],
    "ts": true
  },
  {
    "id": "string-template-node-style",
    "name": "String Template Node Style",
    "demoPath": "style/string-template-node-style/index.html",
    "summary": "Presents a versatile and customizable template node style.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/string-template-node-style.png",
    "sourcePath": "style/string-template-node-style/StringTemplateNodeStyleDemo.js",
    "tags": [
      "style",
      "template"
    ],
    "keywords": [
      "v2.4.0.4",
      "data bindings",
      "data panel"
    ],
    "ts": true
  },
  {
    "id": "vue.js-template-node-style",
    "name": "Vue Template Node Style",
    "demoPath": "style/vuejstemplatenodestyle/index.html",
    "summary": "Presents a versatile and easily customizable template node style based on Vue.js.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/vuejstemplatenodestyle.png",
    "sourcePath": "style/vuejstemplatenodestyle/VuejsTemplateNodeStyleDemo.js",
    "tags": [
      "style",
      "template",
      "vuejs"
    ],
    "keywords": [
      "v2.1.0.0",
      "data bindings",
      "data panel",
      "tree"
    ],
    "ts": true
  },
  {
    "id": "webgl-styles",
    "name": "WebGL2 Styles",
    "demoPath": "style/webgl-styles/index.html",
    "summary": "Shows the various graph element styles available in WebGL2 rendering.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/webgl-styles.png",
    "sourcePath": "style/webgl-styles/WebGLStylesDemo.js",
    "tags": [
      "style",
      "webgl2"
    ],
    "keywords": [
      "v2.4.0.0",
      "styles",
      "notable style"
    ],
    "ts": true
  },
  {
    "id": "css-styling",
    "name": "CSS Styling",
    "demoPath": "style/cssstyling/index.html",
    "summary": "Shows how to style indicators and other templates.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/cssstyling.png",
    "sourcePath": "style/cssstyling/CSSStylingDemo.js",
    "tags": [
      "css",
      "indicators",
      "themes"
    ],
    "keywords": [
      "stylesheets",
      "v2.2.0.0",
      "labels",
      "notable style"
    ],
    "ts": true
  },
  {
    "id": "isometric-bar-chart-style",
    "name": "Isometric Bar Chart Node Style",
    "demoPath": "style/isometric-bar-chart-style/index.html",
    "summary": "Shows how a node style can be augmented with isometric bars.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/isometric-bar-chart-style.png",
    "sourcePath": "style/isometric-bar-chart-style/IsometricBarChartStyleDemo.js",
    "tags": [
      "styles",
      "projection",
      "bars"
    ],
    "keywords": [
      "v2.4.0.4",
      "organic",
      "labels",
      "3D",
      "isometric",
      "bars",
      "notable style"
    ],
    "ts": true
  },
  {
    "id": "d3-chart-nodes",
    "name": "d3 Chart Nodes",
    "demoPath": "style/d3chartnodes/index.html",
    "summary": "Presents a node style that visualizes dynamic data with d3.js.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/d3chartnodes.png",
    "sourcePath": "style/d3chartnodes/D3ChartNodesDemo.js",
    "tags": [
      "style",
      "sparklines",
      "bars",
      "d3.js"
    ],
    "keywords": [
      "v2.2.0.0",
      "d3js"
    ],
    "ts": true
  },
  {
    "id": "editable-path-style",
    "name": "Editable Path Node Style",
    "demoPath": "style/editablepathstyle/index.html",
    "summary": "Shows a path-based node style whose control points can be moved by users.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/editablepath.png",
    "sourcePath": "style/editablepathstyle/EditablePathNodeStyle.js",
    "tags": [
      "style",
      "path",
      "editing"
    ],
    "keywords": [
      "v2.3.0.2",
      "handles",
      "general paths",
      "interaction",
      "editing"
    ],
    "ts": true
  },
  {
    "id": "webgl-icon-node",
    "name": "WebGL2 Icon Node",
    "demoPath": "style/webgl-icon-node/index.html",
    "summary": "Shows how to render icon nodes with WebGL2.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/webgl-icon-node.png",
    "sourcePath": "style/webgl-icon-node/WebGLIconNodeDemo.js",
    "tags": [
      "style",
      "webgl2"
    ],
    "keywords": [
      "v2.4.0.0",
      "notable style"
    ],
    "ts": true
  },
  {
    "id": "list-node",
    "name": "List Node",
    "demoPath": "view/list-node/index.html",
    "summary": "Shows a node which contains re-arrangeable rows.",
    "category": "view",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/listnode.png",
    "sourcePath": "view/list-node/ListNodeDemo.js",
    "tags": [
      "interaction",
      "style",
      "row",
      "table"
    ],
    "keywords": [
      "v2.4.0.4",
      "rows",
      "tables"
    ],
    "ts": true
  },
  {
    "id": "data-table",
    "name": "Data Table",
    "demoPath": "style/datatable/index.html",
    "summary": "Shows a node style and a label style that display data in a tabular fashion.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/datatable.png",
    "sourcePath": "style/datatable/DataTableDemo.js",
    "tags": [
      "style",
      "label"
    ],
    "keywords": [
      "data table",
      "structures"
    ],
    "ts": true
  },
  {
    "id": "bezier-edge-style",
    "name": "Bezier Edge Style",
    "demoPath": "style/bezieredgestyle/index.html",
    "summary": "Shows how to use the curved edge style consisting of Bezier splines.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/bezieredgestyle.png",
    "sourcePath": "style/bezieredgestyle/BezierEdgeStyleDemo.js",
    "tags": [
      "style",
      "curve",
      "interaction"
    ],
    "keywords": [
      "v2.3.0.0",
      "handles",
      "indicators",
      "bends",
      "create edge input mode",
      "selection",
      "labels",
      "curves",
      "bezier"
    ],
    "ts": true
  },
  {
    "id": "directed-edge-label-style",
    "name": "Directed Edge Label Style",
    "demoPath": "style/directed-edge-label/index.html",
    "summary": "Shows label styles displaying arrows that always point to the source or target port.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/directed-edge-label.png",
    "sourcePath": "style/directed-edge-label/DirectedEdgeLabelDemo.js",
    "tags": [
      "style",
      "label",
      "edge"
    ],
    "keywords": [
      "v2.4.0.4",
      "edges",
      "directed",
      "labels"
    ],
    "ts": true
  },
  {
    "id": "markdown-label",
    "name": "Markdown Label",
    "demoPath": "style/markdownlabel/index.html",
    "summary": "Use markdown to format the label text.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/markdownlabel.png",
    "sourcePath": "style/markdownlabel/MarkdownLabelDemo.js",
    "tags": [
      "style",
      "label",
      "markdown"
    ],
    "keywords": [
      "v2.3.0.0",
      "rich text",
      "styling",
      "html",
      "markdown"
    ],
    "ts": true
  },
  {
    "id": "rich-text-label",
    "name": "Rich Text Label",
    "demoPath": "style/richtextlabel/index.html",
    "summary": "Edit markup labels with a WYSIWYG text editor.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/richtextlabel.png",
    "sourcePath": "style/richtextlabel/RichTextLabelDemo.js",
    "tags": [
      "style",
      "label",
      "rich text"
    ],
    "keywords": [
      "v2.3.0.0",
      "styling",
      "html",
      "xml",
      "markdown",
      "markup",
      "colors",
      "wysiwyg"
    ],
    "ts": true
  },
  {
    "id": "overview",
    "name": "Overview Styling",
    "demoPath": "view/overviewstyles/index.html",
    "summary": "Shows several different rendering techniques and styles for the overview.",
    "category": "view",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/overview.png",
    "sourcePath": "view/overviewstyles/OverviewStylesDemo.js",
    "tags": [
      "style",
      "canvas"
    ],
    "keywords": [
      "v2.2.0.0",
      "overview input mode",
      "svg",
      "labels"
    ],
    "ts": true
  },
  {
    "id": "html-label",
    "name": "HTML Label",
    "demoPath": "style/htmllabel/index.html",
    "summary": "Shows how HTML can be used in label text with a custom label style.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/htmllabel.png",
    "sourcePath": "style/htmllabel/HtmlLabelDemo.js",
    "tags": [
      "style",
      "label"
    ],
    "keywords": [
      "foreign object"
    ],
    "ts": true
  },
  {
    "id": "invariant-label-style",
    "name": "Zoom-invariant Label Style",
    "demoPath": "style/invariant-label/index.html",
    "summary": "Shows label styles that are independent of the zoom level.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/invariant-label.png",
    "sourcePath": "style/invariant-label/ZoomInvariantLabelStyleDemo.js",
    "tags": [
      "style",
      "label",
      "zoom"
    ],
    "keywords": [
      "v2.2.0.2",
      "size",
      "fit"
    ],
    "ts": true
  },
  {
    "id": "selection-styling",
    "name": "Selection Styling",
    "demoPath": "style/selectionstyling/index.html",
    "summary": "Shows customized selection painting of nodes, edges and labels by decorating these items with a corresponding\n      style.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/selectionstyling.png",
    "sourcePath": "style/selectionstyling/SelectionStylingDemo.js",
    "tags": [
      "style",
      "interaction"
    ],
    "keywords": [
      "selection styling",
      "labels",
      "notable style"
    ],
    "ts": true
  },
  {
    "id": "style-decorators",
    "name": "Style Decorators",
    "demoPath": "style/styledecorators/index.html",
    "summary": "Shows how to create styles for nodes, edges, and labels that wrap existing styles and add visual decorators.",
    "category": "style",
    "type": "custom-styles",
    "thumbnailPath": "resources/image/styledecorators.png",
    "sourcePath": "style/styledecorators/StyleDecoratorsDemo.js",
    "tags": [
      "style",
      "decorators"
    ],
    "keywords": [
      "ports"
    ],
    "ts": true
  },
  {
    "id": "edge-bundling",
    "name": "Edge Bundling",
    "demoPath": "layout/edgebundling/index.html",
    "summary": "Shows how edge bundling can be applied for reducing visual cluttering in dense graphs.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/edgebundling.png",
    "sourcePath": "layout/edgebundling/EdgeBundlingDemo.js",
    "tags": [
      "style",
      "curve",
      "layout"
    ],
    "keywords": [
      "context menu",
      "organic",
      "radial",
      "tree",
      "balloon",
      "bundles",
      "bezier",
      "curves"
    ],
    "ts": true
  },
  {
    "id": "chord-diagram",
    "name": "Chord Diagram",
    "demoPath": "complete/chord-diagram/index.html",
    "summary": "Shows a chord diagram that emphasizes the magnitude of connections between nodes.",
    "category": "complete",
    "type": "layout-features",
    "thumbnailPath": "resources/image/chord-diagram.png",
    "sourcePath": "complete/chord-diagram/ChordDiagramDemo.js",
    "tags": [
      "edge thickness",
      "style",
      "layout"
    ],
    "keywords": [
      "v2.4.0.4",
      "chords",
      "arcs",
      "bezier",
      "curves",
      "notable style"
    ],
    "ts": true
  },
  {
    "id": "arc-diagram",
    "name": "Arc Diagram",
    "demoPath": "layout/arc-diagram/index.html",
    "summary": "Shows how to visualize a graph as an arc diagram.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/arc-diagram.png",
    "sourcePath": "layout/arc-diagram/ArcDiagramDemo.js",
    "tags": [
      "layout",
      "curve"
    ],
    "keywords": [
      "v2.4.0.4",
      "arcs",
      "bezier",
      "networks",
      "curves"
    ],
    "ts": true
  },
  {
    "id": "maze-routing",
    "name": "Maze Routing",
    "demoPath": "layout/mazerouting/index.html",
    "summary": "Shows how the automatic edge routing finds routes through a maze.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/mazerouting.png",
    "sourcePath": "layout/mazerouting/MazeRoutingDemo.js",
    "tags": [
      "layout",
      "edge routing",
      "polyline"
    ],
    "keywords": [
      "edge router",
      "polyline router",
      "background",
      "layout"
    ],
    "ts": true
  },
  {
    "id": "component-drag-and-drop",
    "name": "Component Drag and Drop",
    "demoPath": "complete/componentdraganddrop/index.html",
    "summary": "A demo that shows how to clear space for a dropped component in an existing layout.",
    "category": "complete",
    "type": "layout-features",
    "thumbnailPath": "resources/image/componentdraganddrop.png",
    "sourcePath": "complete/componentdraganddrop/ComponentDragAndDropDemo.js",
    "tags": [
      "interactive layout",
      "component"
    ],
    "keywords": [
      "v2.3.0.0",
      "drop input mode",
      "create",
      "space",
      "clear area layout",
      "fill area layout",
      "drag and drop",
      "palette",
      "dnd"
    ],
    "ts": true
  },
  {
    "id": "edge-label-placement",
    "name": "Edge Label Placement",
    "demoPath": "layout/edgelabelplacement/index.html",
    "summary": "Shows how to place edge labels at the preferred location with a labeling algorithm.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/edgelabelplacement.png",
    "sourcePath": "layout/edgelabelplacement/EdgeLabelPlacementDemo.js",
    "tags": [
      "label placement"
    ],
    "keywords": [
      "integrated",
      "texts",
      "generic labeling",
      "tree",
      "hierarchic",
      "orthogonal",
      "edge router",
      "move"
    ],
    "ts": true
  },
  {
    "id": "node-label-placement",
    "name": "Node Label Placement",
    "demoPath": "layout/nodelabelplacement/index.html",
    "summary": "Shows how to place node labels at the preferred location with a labeling algorithm.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/nodelabelplacement.png",
    "sourcePath": "layout/nodelabelplacement/NodeLabelPlacementDemo.js",
    "tags": [
      "label placement"
    ],
    "keywords": [
      "generic labeling",
      "text",
      "background"
    ],
    "ts": true
  },
  {
    "id": "node-types",
    "name": "Node Types",
    "demoPath": "layout/nodetypes/index.html",
    "summary": "Shows how different layout algorithms handle nodes with types.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/nodetypes.png",
    "sourcePath": "layout/nodetypes/NodeTypesDemo.js",
    "tags": [
      "layout",
      "node type"
    ],
    "keywords": [
      "v2.4.0.0",
      "types",
      "tree",
      "hierarchic",
      "organic",
      "components",
      "circular"
    ],
    "ts": true
  },
  {
    "id": "incremental-hierarchic-layout",
    "name": "Incremental Hierarchic Layout",
    "demoPath": "layout/incrementalhierarchic/index.html",
    "summary": "The incremental mode of the hierarchic layout style can fit new nodes and edges into the existing drawing.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/incrementalhierarchic.png",
    "sourcePath": "layout/incrementalhierarchic/IncrementalHierarchicDemo.js",
    "tags": [
      "layout",
      "hierarchic",
      "incremental"
    ],
    "keywords": [
      "ports",
      "background"
    ],
    "ts": true
  },
  {
    "id": "interactive-edge-routing",
    "name": "Interactive Edge Routing",
    "demoPath": "layout/interactiveedgerouting/index.html",
    "summary": "After each edit the edge paths are re-routed if necessary.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/interactiveedgerouting.png",
    "sourcePath": "layout/interactiveedgerouting/InteractiveEdgeRoutingDemo.js",
    "tags": [
      "layout",
      "edge routing"
    ],
    "keywords": [
      "v2.4.0.0",
      "interaction",
      "edge router"
    ],
    "ts": true
  },
  {
    "id": "edge-grouping",
    "name": "Edge Grouping",
    "demoPath": "layout/edgegrouping/index.html",
    "summary": "The hierarchic layout can group the paths or ports of edges.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/edgegrouping.png",
    "sourcePath": "layout/edgegrouping/EdgeGroupingDemo.js",
    "tags": [
      "layout",
      "hierarchic"
    ],
    "keywords": [
      "v2.1.0.3",
      "edge groups",
      "port groups",
      "hierarchic",
      "ports",
      "context menu",
      "groups",
      "bridges"
    ],
    "ts": true
  },
  {
    "id": "edge-router-grouping",
    "name": "EdgeRouter Grouping",
    "demoPath": "layout/edgeroutergrouping/index.html",
    "summary": "The EdgeRouter can group the paths or ports of edges.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/edge-router-grouping.png",
    "sourcePath": "layout/edgeroutergrouping/EdgeRouterGroupingDemo.js",
    "tags": [
      "layout",
      "edge routing"
    ],
    "keywords": [
      "v2.2.0.2",
      "edge groups",
      "port groups",
      "edge router",
      "polyline",
      "ports",
      "context menu",
      "bridges"
    ],
    "ts": true
  },
  {
    "id": "organic-substructures",
    "name": "Organic Substructures",
    "demoPath": "layout/organicsubstructures/index.html",
    "summary": "Shows organic layout, and its substructures and node types features.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/organicsubstructures.png",
    "sourcePath": "layout/organicsubstructures/OrganicSubstructuresDemo.js",
    "tags": [
      "layout",
      "organic",
      "substructure",
      "node type"
    ],
    "keywords": [
      "v2.4.0.0",
      "clustering",
      "grouping",
      "similar"
    ],
    "ts": true
  },
  {
    "id": "busrouting",
    "name": "Bus Routing",
    "demoPath": "layout/busrouting/index.html",
    "summary": "Shows how to group edges in bus structures.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/busrouting.png",
    "sourcePath": "layout/busrouting/BusRoutingDemo.js",
    "tags": [
      "layout",
      "edge routing",
      "bus"
    ],
    "keywords": [
      "v2.4.0.0",
      "edge router",
      "edge groups",
      "bus structures"
    ],
    "ts": true
  },
  {
    "id": "fill-area-layout",
    "name": "Fill Area Layout",
    "demoPath": "layout/fillarealayout/index.html",
    "summary": "Shows how to fill free space after deleting nodes.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/fillarealayout.png",
    "sourcePath": "layout/fillarealayout/FillAreaLayoutDemo.js",
    "tags": [
      "layout",
      "interactive layout"
    ],
    "keywords": [
      "v2.3.0.0",
      "deletion",
      "adjustment",
      "interactive"
    ],
    "ts": true
  },
  {
    "id": "clear-marquee-area",
    "name": "Clear Marquee Area",
    "demoPath": "layout/clearmarqueearea/index.html",
    "summary": "Shows how to automatically keep a marquee area clear of graph elements.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/clearmarqueearea.png",
    "sourcePath": "layout/clearmarqueearea/ClearMarqueeAreaDemo.js",
    "tags": [
      "layout",
      "interactive layout"
    ],
    "keywords": [
      "v2.3.0.2",
      "create",
      "space",
      "clear area layout",
      "fill area layout",
      "adjustment",
      "interactive"
    ],
    "ts": true
  },
  {
    "id": "clear-rectangle-area",
    "name": "Clear Rectangle Area",
    "demoPath": "layout/clearrectanglearea/index.html",
    "summary": "Shows how to automatically keep a user-defined rectangular area clear of graph elements.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/clearrectanglearea.png",
    "sourcePath": "layout/clearrectanglearea/ClearRectangleAreaDemo.js",
    "tags": [
      "layout",
      "interactive layout"
    ],
    "keywords": [
      "v2.3.0.2",
      "create",
      "space",
      "clear area layout",
      "fill area layout",
      "adjustment",
      "interactive"
    ],
    "ts": true
  },
  {
    "id": "node-overlap-avoiding",
    "name": "Node Overlap Avoiding",
    "demoPath": "layout/nodeoverlapavoiding/index.html",
    "summary": "Shows how an automatic layout can remove node overlaps while a user interactively edits a graph.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/nodeoverlapavoiding.png",
    "sourcePath": "layout/nodeoverlapavoiding/NodeOverlapAvoidingDemo.js",
    "tags": [
      "layout",
      "interactive layout"
    ],
    "keywords": [
      "v2.3.0.2",
      "move",
      "resize",
      "resizing",
      "space",
      "clear area layout",
      "fill area layout",
      "adjustment",
      "interactive"
    ],
    "ts": true
  },
  {
    "id": "hierarchic-busstructures",
    "name": "Hierarchic Bus Structures",
    "demoPath": "layout/busstructures/index.html",
    "summary": "Bus structures in the hierarchic layout result in more compact arrangements.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/busstructures.png",
    "sourcePath": "layout/busstructures/BusStructuresDemo.js",
    "tags": [
      "layout",
      "hierarchic",
      "bus"
    ],
    "keywords": [
      "v2.2.0.2",
      "bus structures",
      "orthogonal",
      "compact"
    ],
    "ts": true
  },
  {
    "id": "hierarchic-subcomponents",
    "name": "Hierarchic Subcomponents",
    "demoPath": "layout/subcomponents/index.html",
    "summary": "The hierarchic layout can arrange subcomponents with different layout styles.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/subcomponents.png",
    "sourcePath": "layout/subcomponents/SubcomponentsDemo.js",
    "tags": [
      "layout",
      "hierarchic",
      "component"
    ],
    "keywords": [
      "tree",
      "organic",
      "orthogonal"
    ],
    "ts": true
  },
  {
    "id": "critical-paths",
    "name": "Critical Paths",
    "demoPath": "layout/criticalpaths/index.html",
    "summary": "The hierarchic and tree layout styles can emphasize critical (important) paths by aligning their nodes.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/CriticalPaths.png",
    "sourcePath": "layout/criticalpaths/CriticalPathsDemo.js",
    "tags": [
      "layout",
      "hierarchic",
      "tree"
    ],
    "keywords": [
      "context menu"
    ],
    "ts": true
  },
  {
    "id": "custom-layout-stage",
    "name": "Custom Layout Stage",
    "sourcePath": "layout/custom-layout-stage/CustomLayoutStageDemo.js",
    "summary": "Custom layout stages can be used to solve unique layout problems that are not adequately covered by existing layout algorithms.",
    "demoPath": "layout/custom-layout-stage/index.html",
    "thumbnailPath": "resources/image/CustomLayoutStage.png",
    "category": "layout",
    "type": "layout-features",
    "tags": [
      "layout",
      "layout stage"
    ],
    "keywords": [
      "v2.4.0.0",
      "ILayoutStage",
      "LayoutStageBase",
      "CoreLayout",
      "IDataProvider",
      "data provider",
      "LayoutGraph",
      "LayoutGraphHider",
      "dummy edges",
      "temporary elements",
      "temporary edges",
      "layout post-processing",
      "DataProviderBase",
      "GenericLayoutData",
      "LayoutData"
    ],
    "ts": true
  },
  {
    "id": "split-edges",
    "name": "Split Edges",
    "demoPath": "layout/splitedges/index.html",
    "summary": "Shows how to align edges at group nodes using RecursiveGroupLayout with HierarchicLayout.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/splitedges.png",
    "sourcePath": "layout/splitedges/SplitEdgesDemo.js",
    "tags": [
      "layout",
      "hierarchic",
      "tree"
    ],
    "keywords": [
      "v2.1.0.3",
      "context menu",
      "recursive"
    ],
    "ts": true
  },
  {
    "id": "partition-grid",
    "name": "Partition Grid",
    "demoPath": "layout/partitiongrid/index.html",
    "summary": "Demonstrates the usage of a partition grid for hierarchic and organic layouts.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/partitiongrid.png",
    "sourcePath": "layout/partitiongrid/PartitionGridDemo.js",
    "tags": [
      "layout",
      "partition grid",
      "hierarchic",
      "organic"
    ],
    "ts": true
  },
  {
    "id": "simple-partition-grid",
    "name": "Simple Partition Grid",
    "demoPath": "layout/simplepartitiongrid/index.html",
    "summary": "Shows how to create a simple partition grid.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/simplePartitionGrid.png",
    "sourcePath": "layout/simplepartitiongrid/SimplePartitionGridDemo.js",
    "tags": [
      "layout",
      "partition grid",
      "hierarchic"
    ],
    "keywords": [
      "v2.2.0.0"
    ],
    "ts": true
  },
  {
    "id": "interactive-graph-restructuring",
    "name": "Interactive Graph Restructuring",
    "demoPath": "complete/interactivegraphrestructuring/index.html",
    "summary": "Shows how to interactively relocate subtrees from one parent to another.",
    "category": "complete",
    "type": "layout-features",
    "thumbnailPath": "resources/image/interactivegraphrestructuring.png",
    "sourcePath": "complete/interactivegraphrestructuring/InteractiveGraphRestructuringDemo.js",
    "tags": [
      "interactive layout",
      "animation"
    ],
    "keywords": [
      "v2.3.0.0",
      "tree",
      "sub-tree",
      "re-parent",
      "fill area layout",
      "create space",
      "space maker"
    ],
    "ts": true
  },
  {
    "id": "layer-constraints",
    "name": "Layer Constraints",
    "demoPath": "layout/layerconstraints/index.html",
    "summary": "Shows how to use layer constraints to prescribe the node layering in hierarchic layouts.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/layerconstraints.png",
    "sourcePath": "layout/layerconstraints/LayerConstraintsDemo.js",
    "tags": [
      "layout",
      "hierarchic"
    ],
    "ts": true
  },
  {
    "id": "sequence-constraints",
    "name": "Sequence Constraints",
    "demoPath": "layout/sequenceconstraints/index.html",
    "summary": "Shows how to use sequence constraints to prescribe the node sequencing in hierarchic layouts.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/sequenceconstraints.png",
    "sourcePath": "layout/sequenceconstraints/SequenceConstraintsDemo.js",
    "tags": [
      "layout",
      "hierarchic"
    ],
    "ts": true
  },
  {
    "id": "interactive-organic-layout",
    "name": "Interactive Organic Layout",
    "demoPath": "layout/interactiveorganic/index.html",
    "summary": "Shows the 'interactive organic' layout algorithm.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/interactive-organic-layout.png",
    "sourcePath": "layout/interactiveorganic/InteractiveOrganicDemo.js",
    "tags": [
      "layout",
      "interactive layout"
    ],
    "keywords": [
      "organic",
      "move"
    ],
    "ts": true
  },
  {
    "id": "recursive-group-layout",
    "name": "Recursive Group Layout",
    "demoPath": "layout/recursivegroup/index.html",
    "summary": "Shows how to use different layout styles for the contents of groups and the overall graph.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/recursivegroup.png",
    "sourcePath": "layout/recursivegroup/RecursiveGroupDemo.js",
    "tags": [
      "layout",
      "hierarchic",
      "grouping"
    ],
    "keywords": [
      "groups",
      "hide"
    ],
    "ts": true
  },
  {
    "id": "multi-page-layout",
    "name": "Multi-Page Layout",
    "demoPath": "layout/multipage/index.html",
    "summary": "Shows how to divide a large model graph into several smaller page graphs, for example to print to multiple pages.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/multipage.png",
    "sourcePath": "layout/multipage/MultiPageDemo.js",
    "tags": [
      "layout",
      "hierarchic",
      "tree"
    ],
    "keywords": [
      "multi page",
      "multiple pages",
      "orthogonal",
      "circular",
      "organic",
      "large",
      "split",
      "print"
    ],
    "ts": true
  },
  {
    "id": "tree-layout",
    "name": "Tree Layout",
    "demoPath": "layout/tree/index.html",
    "summary": "Shows how to use different node placer in TreeLayout.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/treelayout.png",
    "sourcePath": "layout/tree/TreeLayoutDemo.js",
    "tags": [
      "layout",
      "tree"
    ],
    "keywords": [
      "node placers",
      "v2.2.0.2"
    ],
    "ts": true
  },
  {
    "id": "partial-layout",
    "name": "Partial Layout",
    "demoPath": "layout/partial/index.html",
    "summary": "Shows how to integrate new graph elements into an existing graph layout.",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/partiallayout.png",
    "sourcePath": "layout/partial/PartialLayoutDemo.js",
    "tags": [
      "layout",
      "incremental",
      "partial"
    ],
    "keywords": [
      "hierarchic",
      "orthogonal",
      "organic",
      "circular",
      "curves"
    ],
    "ts": true
  },
  {
    "id": "bridges",
    "name": "Bridges",
    "demoPath": "view/bridges/index.html",
    "summary": "Shows the capabilities of the <code>BridgeManager</code> class for inserting bridges into edge paths.",
    "category": "view",
    "type": "layout-features",
    "thumbnailPath": "resources/image/bridges.png",
    "sourcePath": "view/bridges/BridgesDemo.js",
    "tags": [
      "line gaps",
      "line jumps"
    ],
    "keywords": [
      "intersection",
      "intersecting",
      "groups"
    ],
    "ts": true
  },
  {
    "id": "custom-edge-creation",
    "name": "Custom Edge Creation",
    "demoPath": "complete/customedgecreation/index.html",
    "summary": "Shows how to provide directional ports and demonstrates interactive routing during edge creation.",
    "category": "complete",
    "type": "layout-features",
    "thumbnailPath": "resources/image/customedgecreation.png",
    "sourcePath": "complete/customedgecreation/CustomEdgeCreationDemo.js",
    "tags": [
      "layout",
      "edge routing",
      "interaction"
    ],
    "keywords": [
      "v2.2.0.2",
      "edge router",
      "channel edge router",
      "orthogonal",
      "port candidate provider",
      "styles",
      "ports"
    ],
    "ts": true
  },
  {
    "id": "family-tree",
    "name": "Family Tree",
    "demoPath": "layout/familytree/index.html",
    "summary": "Shows how to visualize genealogical graphs (family trees).",
    "category": "layout",
    "type": "layout-features",
    "thumbnailPath": "resources/image/family-tree.png",
    "sourcePath": "layout/familytree/FamilyTreeDemo.js",
    "tags": [
      "layout",
      "genealogy"
    ],
    "keywords": [
      "family tree",
      "tree",
      "layout",
      "genealogical",
      "v2.2.0.0",
      "structures",
      "labels"
    ],
    "ts": true
  },
  {
    "id": "edge-to-edge",
    "name": "Edge To Edge",
    "demoPath": "view/edgetoedge/index.html",
    "summary": "Shows edge-to-edge connections.",
    "category": "view",
    "type": "layout-features",
    "thumbnailPath": "resources/image/edge_to_edge.png",
    "sourcePath": "view/edgetoedge/EdgeToEdgeDemo.js",
    "tags": [
      "edge creation",
      "interaction"
    ],
    "keywords": [
      "port candidate providers"
    ],
    "ts": true
  },
  {
    "id": "graph-builder",
    "name": "Graph Builder",
    "demoPath": "databinding/graphbuilder/index.html",
    "summary": "Interactively builds and modifies a graph from JSON business data using class <code>GraphBuilder</code>.",
    "category": "databinding",
    "type": "loading",
    "thumbnailPath": "resources/image/graphbuilder.png",
    "sourcePath": "databinding/graphbuilder/GraphBuilderDemo.js",
    "tags": [
      "json",
      "data binding",
      "layout"
    ],
    "keywords": [
      "hierarchic",
      "structures",
      "labels",
      "v2.3.0.0"
    ],
    "ts": true
  },
  {
    "id": "tree-graph-builder",
    "name": "Tree Builder",
    "demoPath": "databinding/treebuilder/index.html",
    "summary": "Interactively builds and modifies a graph from JSON business data using class <code>TreeBuilder</code>.",
    "category": "databinding",
    "type": "loading",
    "thumbnailPath": "resources/image/treebuilder.png",
    "sourcePath": "databinding/treebuilder/TreeBuilderDemo.js",
    "tags": [
      "json",
      "data binding",
      "layout"
    ],
    "keywords": [
      "hierarchic",
      "structures",
      "labels",
      "v2.3.0.0"
    ],
    "ts": true
  },
  {
    "id": "adjacency-graph-builder",
    "name": "Adjacency Graph Builder",
    "demoPath": "databinding/adjacencygraphbuilder/index.html",
    "summary": "Interactively builds and modifies a graph from JSON business data using class <code>AdjacencyGraphBuilder</code>.",
    "category": "databinding",
    "type": "loading",
    "thumbnailPath": "resources/image/adjacencygraphbuilder.png",
    "sourcePath": "databinding/adjacencygraphbuilder/AdjacencyGraphBuilderDemo.js",
    "tags": [
      "json",
      "data binding",
      "layout"
    ],
    "keywords": [
      "hierarchic",
      "structures",
      "labels",
      "v2.3.0.0"
    ],
    "ts": true
  },
  {
    "id": "simple-graph-builder",
    "name": "Simple Graph Builder",
    "demoPath": "databinding/simplegraphbuilder/index.html",
    "summary": "Automatically builds a graph from JSON business data using <code>GraphBuilder</code>, <code>AdjacencyGraphBuilder</code> or <code>TreeBuilder</code>.",
    "category": "databinding",
    "type": "loading",
    "thumbnailPath": "resources/image/simplegraphbuilder.png",
    "sourcePath": "databinding/simplegraphbuilder/SimpleGraphBuilderDemo.js",
    "tags": [
      "json",
      "data binding",
      "layout"
    ],
    "keywords": [
      "hierarchic",
      "labels",
      "v2.3.0.0"
    ],
    "ts": true
  },
  {
    "id": "image-export",
    "name": "Image Export",
    "demoPath": "view/imageexport/index.html",
    "summary": "Shows how to export the whole diagram or a part of it to a PNG image.",
    "category": "view",
    "type": "export",
    "thumbnailPath": "resources/image/export.png",
    "sourcePath": "view/imageexport/ImageExportDemo.js",
    "tags": [
      "export",
      "png",
      "jpg"
    ],
    "keywords": [
      "jpeg",
      "bitmap",
      "save",
      "handles"
    ],
    "ts": true
  },
  {
    "id": "svg-export",
    "name": "SVG Export",
    "demoPath": "view/svgexport/index.html",
    "summary": "Shows how to export the whole diagram or a part of it to an SVG image.",
    "category": "view",
    "type": "export",
    "thumbnailPath": "resources/image/svgexport.png",
    "sourcePath": "view/svgexport/SvgExportDemo.js",
    "tags": [
      "export",
      "svg",
      "vector graphics"
    ],
    "keywords": [
      "scalable vector graphics",
      "save",
      "handles",
      "curves",
      "bezier"
    ],
    "ts": true
  },
  {
    "id": "pdf-export",
    "name": "PDF Export",
    "demoPath": "view/pdfexport/index.html",
    "summary": "Shows how to export the whole diagram or a part of it to a PDF.",
    "category": "view",
    "type": "export",
    "thumbnailPath": "resources/image/pdfexport.png",
    "sourcePath": "view/pdfexport/PdfExportDemo.js",
    "tags": [
      "export",
      "pdf"
    ],
    "keywords": [
      "vector graphics",
      "handles"
    ],
    "ts": true
  },
  {
    "id": "printing",
    "name": "Printing",
    "demoPath": "view/printing/index.html",
    "summary": "Shows how to print the whole diagram or a part of it.",
    "category": "view",
    "type": "export",
    "thumbnailPath": "resources/image/printing.png",
    "sourcePath": "view/printing/PrintingDemo.js",
    "tags": [
      "printing"
    ],
    "keywords": [
      "posters",
      "vector graphics",
      "handles"
    ],
    "ts": true
  },
  {
    "id": "file-operations",
    "name": "File Operations",
    "demoPath": "view/fileoperations/index.html",
    "summary": "shows various ways to open and save a graph as GraphML.",
    "category": "view",
    "type": "integration",
    "thumbnailPath": "resources/image/fileoperations.png",
    "sourcePath": "view/fileoperations/FileOperationsDemo.js",
    "tags": [
      "i/o",
      "export",
      "graphml"
    ],
    "keywords": [
      "load",
      "save",
      "io"
    ],
    "ts": true
  },
  {
    "id": "events-viewer",
    "name": "Events Viewer",
    "demoPath": "view/events/index.html",
    "summary": "Shows the multitude of events provided by the classes <code>IGraph</code>, <code>GraphComponent</code>, and the <em>Input Modes</em>.",
    "category": "view",
    "type": "integration",
    "thumbnailPath": "resources/image/events.png",
    "sourcePath": "view/events/EventsDemo.js",
    "tags": [
      "interaction"
    ],
    "keywords": [
      "palette",
      "drag and drop",
      "dnd"
    ],
    "ts": true
  },
  {
    "id": "angular-cli",
    "name": "Angular CLI",
    "demoPath": "toolkit/angular/README.html",
    "summary": "Shows how to use yFiles for HTML in an Angular app (Angular 2 and newer) using Angular CLI.",
    "category": "integration",
    "type": "integration",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/angular.png",
    "sourcePath": "toolkit/angular/src/main.ts",
    "tags": [
      "angular",
      "data binding",
      "typescript"
    ],
    "keywords": [
      "v2.1.0.0",
      "tools",
      "tree",
      "data panel",
      "integration"
    ],
    "ts": true
  },
  {
    "id": "angularjs-1",
    "name": "AngularJS 1",
    "demoPath": "toolkit/angular1/index.html",
    "summary": "Shows how to use yFiles for HTML in an AngularJS 1 app.",
    "category": "integration",
    "type": "integration",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/angularjs1.png",
    "sourcePath": "toolkit/angular1/app.js",
    "tags": [
      "angular",
      "style",
      "layout"
    ],
    "keywords": [
      "styles",
      "tree",
      "data panel",
      "integration"
    ]
  },
  {
    "id": "react",
    "name": "React",
    "demoPath": "toolkit/react/README.html",
    "summary": "Shows how to use yFiles for HTML with the React library.",
    "category": "integration",
    "type": "integration",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/react.png",
    "sourcePath": "toolkit/react/src/index.js",
    "tags": [
      "react",
      "json",
      "webpack"
    ],
    "keywords": [
      "v2.2.0.2",
      "web worker",
      "data",
      "integration"
    ]
  },
  {
    "id": "react-typescript",
    "name": "React With TypeScript",
    "demoPath": "toolkit/react-typescript/README.html",
    "summary": "Shows how to integrate yFiles in a basic React application with TypeScript based on Create React App.",
    "category": "integration",
    "type": "integration",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/react-typescript.png",
    "sourcePath": "toolkit/react-typescript/src/index.tsx",
    "tags": [
      "react",
      "json"
    ],
    "keywords": [
      "v2.2.0.2",
      "data",
      "integration"
    ],
    "ts": true
  },
  {
    "id": "preact",
    "name": "Preact",
    "demoPath": "toolkit/preact/index.html",
    "summary": "Shows how to integrate yFiles in a basic Preact application with TypeScript.",
    "category": "integration",
    "type": "integration",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/preact.png",
    "sourcePath": "toolkit/preact/PreactDemo.ts",
    "tags": [
      "react",
      "preact",
      "json"
    ],
    "keywords": [
      "v2.4.0.4",
      "data",
      "integration"
    ],
    "ts": true
  },
  {
    "id": "vue.js",
    "name": "Vue.js 2",
    "demoPath": "toolkit/vuejs/index.html",
    "summary": "Shows how to use yFiles for HTML with Vue.js 2.",
    "category": "integration",
    "type": "integration",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/vuejs.png",
    "sourcePath": "toolkit/vuejs/VuejsDemo.ts",
    "tags": [
      "vuejs",
      "data binding"
    ],
    "keywords": [
      "templates",
      "data panel",
      "tree",
      "details",
      "integration"
    ],
    "ts": true
  },
  {
    "id": "vue2-cli",
    "name": "Vue CLI (Vue 2) ",
    "demoPath": "toolkit/vue2-cli/README.html",
    "summary": "Shows how to integrate yFiles for HTML in a Vue 2 app with Vue CLI.",
    "category": "integration",
    "type": "integration",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/vue-cli.png",
    "sourcePath": "toolkit/vue2-cli/src/main.js",
    "tags": [
      "vuejs",
      "vue cli"
    ],
    "keywords": [
      "v2.2.0.2",
      "components",
      "single",
      "files",
      "integration",
      "web worker"
    ]
  },
  {
    "id": "vue2-cli-typescript",
    "name": "Vue CLI (Vue 2, TypeScript)",
    "demoPath": "toolkit/vue2-cli-typescript/README.html",
    "summary": "Shows how to integrate yFiles in a Vue 2 app with TypeScript and Vue CLI.",
    "category": "integration",
    "type": "integration",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/vue-cli-typescript.png",
    "sourcePath": "toolkit/vue2-cli-typescript/src/main.ts",
    "tags": [
      "vuejs",
      "vue cli"
    ],
    "keywords": [
      "v2.4.0.4",
      "component",
      "single",
      "file",
      "integration",
      "web worker"
    ],
    "ts": true
  },
  {
    "id": "vue3-cli",
    "name": "Vue CLI (Vue 3)",
    "demoPath": "toolkit/vue3-cli/README.html",
    "summary": "Shows how to integrate yFiles for HTML in a Vue 3 app with Vue CLI.",
    "category": "integration",
    "type": "integration",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/vue-cli.png",
    "sourcePath": "toolkit/vue3-cli/src/main.js",
    "tags": [
      "vuejs",
      "vue cli"
    ],
    "keywords": [
      "v2.4.0.4",
      "components",
      "single",
      "files",
      "integration",
      "web worker"
    ]
  },
  {
    "id": "vue3-cli-typescript",
    "name": "Vue CLI (Vue 3, TypeScript)",
    "demoPath": "toolkit/vue3-cli-typescript/README.html",
    "summary": "Shows how to integrate yFiles in a Vue 3 app with TypeScript and Vue CLI.",
    "category": "integration",
    "type": "integration",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/vue-cli-typescript.png",
    "sourcePath": "toolkit/vue3-cli-typescript/src/main.ts",
    "tags": [
      "vuejs",
      "vue cli",
      "vue3"
    ],
    "keywords": [
      "v2.4.0.4",
      "component",
      "single",
      "file",
      "integration",
      "web worker"
    ],
    "ts": true
  },
  {
    "id": "svelte",
    "name": "Svelte",
    "demoPath": "toolkit/svelte/README.html",
    "summary": "Shows how to integrate the yFiles library in a <a href=\"https://svelte.dev/\" target=\"_blank\">Svelte</a> project.",
    "category": "integration",
    "type": "integration",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/svelte.png",
    "sourcePath": "toolkit/svelte/src/index.ts",
    "tags": [
      "svelte",
      "snowpack"
    ],
    "keywords": [
      "v2.4.0.4",
      "web worker",
      "hmr",
      "integration"
    ],
    "ts": true
  },
  {
    "id": "graphql",
    "name": "GraphQL",
    "demoPath": "toolkit/graphql/index.html",
    "summary": "Shows how to load data from a GraphQL service and display it with yFiles for HTML.",
    "category": "integration",
    "type": "integration",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/graphql.png",
    "sourcePath": "toolkit/graphql/GraphQLDemo.js",
    "tags": [
      "graphql",
      "database"
    ],
    "keywords": [
      "v2.2.0.2",
      "remote",
      "organic",
      "layout",
      "integration"
    ],
    "ts": true
  },
  {
    "id": "neo4j",
    "name": "Neo4j",
    "demoPath": "toolkit/neo4j/index.html",
    "summary": "Shows how to load data from a Neo4j database and display it with yFiles for HTML.",
    "category": "integration",
    "type": "integration",
    "packageType": "no-viewer",
    "thumbnailPath": "resources/image/neo4j.png",
    "sourcePath": "toolkit/neo4j/Neo4jDemo.js",
    "tags": [
      "neo4j",
      "database"
    ],
    "keywords": [
      "remote",
      "organic",
      "layout",
      "integration"
    ],
    "ts": true
  },
  {
    "id": "nodejs",
    "name": "Node.js",
    "demoPath": "loading/nodejs/index.html",
    "summary": "Shows how to run a yFiles layout algorithm in a <a href='https://nodejs.org/' target='_blank'>Node.js&reg;</a> environment.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/nodejs.png",
    "sourcePath": "loading/nodejs/NodeJSDemo.js",
    "tags": [
      "nodejs",
      "layout"
    ],
    "keywords": [
      "folding",
      "hierarchic",
      "json",
      "web worker"
    ]
  },
  {
    "id": "electron",
    "name": "Electron",
    "demoPath": "toolkit/electron/README.html",
    "summary": "Shows how to create a desktop app with Electron and yFiles for HTML.",
    "category": "integration",
    "type": "integration",
    "thumbnailPath": "resources/image/electron.png",
    "sourcePath": "toolkit/electron/src/main/index.js",
    "tags": [
      "electron",
      "webpack",
      "nodejs"
    ],
    "keywords": [
      "v2.2.0.2",
      "es modules",
      "integration"
    ]
  },
  {
    "id": "dojo",
    "name": "Dojo",
    "demoPath": "toolkit/dojo/README.html",
    "summary": "Shows the integration of yFiles for HTML in a basic Dojo app based on Dojo's cli-create-app.",
    "category": "integration",
    "type": "integration",
    "thumbnailPath": "resources/image/demo-dojo.png",
    "sourcePath": "toolkit/dojo/src/main.ts",
    "tags": [
      "dojo",
      "typescript"
    ],
    "keywords": [
      "v2.2.0.2",
      "overview",
      "es modules",
      "integration"
    ],
    "ts": true
  },
  {
    "id": "web-components",
    "name": "Web Components",
    "demoPath": "toolkit/webcomponents/index.html",
    "summary": "Shows how to use yFiles for HTML with Web Components v1.",
    "category": "integration",
    "type": "integration",
    "thumbnailPath": "resources/image/web_components.png",
    "sourcePath": "toolkit/webcomponents/WebComponentsDemo.js",
    "tags": [
      "web components",
      "shadow dom",
      "html imports"
    ],
    "ts": true
  },
  {
    "id": "amd-loading",
    "name": "AMD Loading",
    "demoPath": "loading/amdloading/index.html",
    "summary": "Loads the yFiles library modules with the AMD loading standard (require.js).",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/amdloading.png",
    "sourcePath": "loading/amdloading/AmdLoadingDemo.js",
    "tags": [
      "loader",
      "modules"
    ],
    "keywords": [
      "requirejs",
      "require.js",
      "non-symbolic"
    ]
  },
  {
    "id": "es-module-loading",
    "name": "ES Module Loading",
    "demoPath": "loading/esmodules/index.html",
    "summary": "Loads the yFiles module resources using ES module imports.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/esmodules.png",
    "sourcePath": "loading/esmodules/ESModulesDemo.js",
    "tags": [
      "es modules",
      "import"
    ],
    "keywords": [
      "v2.1.0.0",
      "hierarchic"
    ]
  },
  {
    "id": "browserify",
    "name": "Browserify",
    "demoPath": "loading/browserify/README.html",
    "summary": "Shows how to bundle the yFiles library in a <a href=\"http://browserify.org\" target=\"_blank\">Browserify</a> project.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/browserify.png",
    "sourcePath": "loading/browserify/src/browserify-demo.js",
    "tags": [
      "deployment",
      "modules"
    ],
    "keywords": [
      "organic"
    ]
  },
  {
    "id": "rollup",
    "name": "Rollup.js",
    "demoPath": "loading/rollupjs/README.html",
    "summary": "Shows how to bundle the yFiles library in a <a href=\"https://rollupjs.org\" target=\"_blank\">rollup</a> project.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/rollupjs.png",
    "sourcePath": "loading/rollupjs/src/RollupJsDemo.js",
    "tags": [
      "deployment",
      "modules",
      "rollup",
      "optimizer"
    ],
    "keywords": [
      "v2.2.0.0",
      "web worker"
    ]
  },
  {
    "id": "script-loading",
    "name": "Script Loading",
    "demoPath": "loading/scriptloading/index.html",
    "summary": "Loads the yFiles modules using plain old &lt;script&gt; tags.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/scriptloading.png",
    "sourcePath": "loading/scriptloading/ScriptLoadingDemo.js",
    "tags": [
      "loader",
      "modules"
    ],
    "keywords": [
      "script loading",
      "non-symbolic"
    ]
  },
  {
    "id": "web-worker-webpack",
    "name": "Web Worker Webpack",
    "demoPath": "loading/webworker-webpack/README.html",
    "summary": "Shows how to run a yFiles layout algorithm in a Web Worker task using Webpack.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/webworker.png",
    "sourcePath": "loading/webworker-webpack/src/WebWorkerWebpackDemo.ts",
    "tags": [
      "webpack",
      "web worker",
      "layout"
    ],
    "keywords": [
      "v2.4.0.0",
      "threads",
      "threading",
      "background",
      "json",
      "folding",
      "hierarchic",
      "webpack"
    ],
    "ts": true
  },
  {
    "id": "web-worker-modules",
    "name": "Web Worker Modules",
    "summary": "Shows how to run a layout in a Web Worker task using module workers.",
    "demoPath": "loading/webworker-modules/index.html",
    "sourcePath": "loading/webworker-modules/WebWorkerModulesDemo.js",
    "thumbnailPath": "resources/image/webworkermodules.png",
    "category": "loading",
    "type": "integration",
    "tags": [
      "modules",
      "web worker",
      "layout"
    ],
    "keywords": [
      "v2.4.0.0",
      "threads",
      "threading",
      "background",
      "async",
      "modules",
      "hierarchic"
    ],
    "ts": true
  },
  {
    "id": "web-worker-umd",
    "name": "Web Worker UMD",
    "demoPath": "loading/webworker-umd/index.html",
    "summary": "Shows how to run a yFiles layout algorithm in a Web Worker task using AMD modules.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/webworkerumd.png",
    "sourcePath": "loading/webworker-umd/WebWorkerDemo.js",
    "tags": [
      "umd",
      "web worker",
      "layout"
    ],
    "keywords": [
      "v2.4.0.0",
      "threads",
      "threading",
      "background",
      "json",
      "folding",
      "hierarchic",
      "non-symbolic",
      "umd"
    ]
  },
  {
    "id": "webpack",
    "name": "webpack",
    "demoPath": "loading/webpack/README.html",
    "summary": "Shows how to integrate the yFiles library in a <a href=\"https://webpack.js.org\" target=\"_blank\">webpack</a> project using ES modules.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/webpack.png",
    "sourcePath": "loading/webpack/src/webpack-demo.js",
    "tags": [
      "nodejs",
      "npm",
      "es modules",
      "deployment",
      "layout"
    ],
    "keywords": [
      "organic"
    ]
  },
  {
    "id": "webpack-lazy-yfiles",
    "name": "Webpack Lazy Load yFiles",
    "demoPath": "loading/webpack-lazy-yfiles/README.html",
    "summary": "Shows how to lazily load yFiles in a <a href=\"https://webpack.js.org/\" target=\"_blank\">webpack</a> project with dynamic imports.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/webpack.png",
    "sourcePath": "loading/webpack-lazy-yfiles/src/webpack-demo.js",
    "tags": [
      "es modules",
      "lazy",
      "deployment"
    ],
    "keywords": [
      "v2.3.0.0",
      "hierarchic",
      "dynamic imports"
    ]
  },
  {
    "id": "webpack-lazy-layout",
    "name": "Webpack Lazy Load Layout",
    "demoPath": "loading/webpack-lazy-layout/README.html",
    "summary": "Shows how to lazily load selected yFiles modules in a <a href=\"https://webpack.js.org\" target=\"_blank\">webpack</a> project with dynamic imports.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/webpack.png",
    "sourcePath": "loading/webpack-lazy-layout/src/webpack-demo.js",
    "tags": [
      "es modules",
      "lazy",
      "deployment"
    ],
    "keywords": [
      "v2.3.0.0",
      "hierarchic",
      "dynamic imports"
    ]
  },
  {
    "id": "vite",
    "name": "Vite",
    "demoPath": "loading/vite/README.html",
    "summary": "Shows how to integrate the yFiles library in a <a href=\"https://vitejs.dev/\" target=\"_blank\">Vite</a> project.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/vite.png",
    "sourcePath": "loading/vite/src/main.js",
    "tags": [
      "es modules",
      "deployment",
      "web worker"
    ],
    "keywords": [
      "v2.4.0.4",
      "webworker"
    ],
    "ts": true
  },
  {
    "id": "snowpack",
    "name": "Snowpack",
    "demoPath": "loading/snowpack/README.html",
    "summary": "Shows how to integrate the yFiles library in a <a href=\"https://snowpack.dev\" target=\"_blank\">Snowpack</a> project.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/snowpack.png",
    "sourcePath": "loading/snowpack/src/index.ts",
    "tags": [
      "es modules",
      "deployment"
    ],
    "keywords": [
      "v2.4.0.4",
      "hierarchic",
      "hmr"
    ],
    "ts": true
  },
  {
    "id": "wmr",
    "name": "WMR Loading Demo",
    "demoPath": "loading/wmr/README.html",
    "summary": "Shows how to load yFiles for HTML with <a href=\"https://wmr.dev/\" rel=\"noopener\" target=\"_blank\">WMR</a> as a loader.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/wmr.png",
    "sourcePath": "loading/wmr/public/index.ts",
    "tags": [
      "deployment",
      "web worker",
      "layout"
    ],
    "keywords": [
      "v2.4.0.4",
      "organic",
      "hierarchic"
    ],
    "ts": true
  },
  {
    "id": "web-dev-server",
    "name": "Web Dev Server",
    "demoPath": "loading/web-dev-server/README.html",
    "summary": "Shows how to integrate the yFiles library in a <a href=\"https://modern-web.dev/docs/dev-server/overview/\" target=\"_blank\">Web Dev Server</a> project.",
    "category": "loading",
    "type": "integration",
    "thumbnailPath": "resources/image/web-dev-server.png",
    "sourcePath": "loading/web-dev-server/src/index.js",
    "tags": [
      "ES Modules",
      "deployment"
    ],
    "keywords": [
      "v2.4.0.4",
      "ES Modules",
      "deployment"
    ]
  },
  {
    "id": "webdriverio",
    "name": "WebdriverIO",
    "demoPath": "testing/wdio/README.html",
    "summary": "Shows how to test a yFiles for HTML app in multiple browsers using WebdriverIO.",
    "category": "testing",
    "type": "integration",
    "thumbnailPath": "resources/image/wdio.png",
    "sourcePath": "testing/wdio/integration/specs/WdioDemo.spec.js",
    "tags": [
      "testing",
      "wdio",
      "selenium"
    ],
    "keywords": [
      "v2.2.0.2",
      "integration",
      "web driver",
      "end-to-end"
    ]
  },
  {
    "id": "jest",
    "name": "Jest",
    "demoPath": "testing/jest/README.html",
    "summary": "Shows how to test a yFiles for HTML app using Jest.",
    "category": "testing",
    "type": "integration",
    "thumbnailPath": "resources/image/jest.png",
    "sourcePath": "testing/jest/src/ItemFactory.test.js",
    "tags": [
      "testing",
      "jest"
    ],
    "keywords": [
      "v2.3.0.4",
      "unit",
      "tests"
    ]
  },
  {
    "id": "jest-puppeteer",
    "name": "Jest Puppeteer",
    "demoPath": "testing/jest-puppeteer/README.html",
    "summary": "Shows how to test a yFiles for HTML app using Jest with the Puppeteer environment.",
    "category": "testing",
    "type": "integration",
    "thumbnailPath": "resources/image/jest-puppeteer.png",
    "sourcePath": "testing/jest-puppeteer/integration/app.test.js",
    "tags": [
      "testing",
      "jest",
      "puppeteer"
    ],
    "keywords": [
      "v2.2.0.2",
      "integration",
      "end-to-end"
    ]
  },
  {
    "id": "clipboard",
    "name": "Clipboard",
    "demoPath": "view/clipboard/index.html",
    "summary": "Shows different ways of using the class GraphClipboard for Copy & Paste operations.",
    "category": "view",
    "type": "source-code",
    "thumbnailPath": "resources/image/clipboard.png",
    "sourcePath": "view/clipboard/ClipboardDemo.js",
    "tags": [
      "interaction",
      "copy",
      "paste"
    ],
    "keywords": [
      "labels"
    ],
    "ts": true
  },
  {
    "id": "clipboard-deferred-cut",
    "name": "Deferred Cut Clipboard",
    "demoPath": "view/clipboard-deferred-cut/index.html",
    "summary": "Shows a clipboard which grays elements out upon cut and only removes them when they are finally pasted.",
    "category": "view",
    "type": "source-code",
    "thumbnailPath": "resources/image/clipboarddeferredcut.png",
    "sourcePath": "view/clipboard-deferred-cut/DeferredCutClipboardDemo.js",
    "tags": [
      "interaction",
      "copy",
      "paste"
    ],
    "keywords": [
      "v2.4.0.4",
      "labels"
    ],
    "ts": true
  },
  {
    "id": "node-selection-resizing",
    "name": "Node Selection Resizing",
    "demoPath": "input/nodeselectionresizing/index.html",
    "summary": "Shows how to reshape a selection of nodes as one unit.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/nodeselectionresizing.png",
    "sourcePath": "input/nodeselectionresizing/NodeSelectionResizingDemo.js",
    "tags": [
      "interaction",
      "resizing"
    ],
    "keywords": [
      "v2.3.0.0",
      "input mode",
      "scale"
    ],
    "ts": true
  },
  {
    "id": "custom-label-model",
    "name": "Custom Label Model",
    "demoPath": "input/customlabelmodel/index.html",
    "summary": "Shows how to implement and use a custom label model.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/custom_label_model.png",
    "sourcePath": "input/customlabelmodel/CustomLabelModelDemo.js",
    "tags": [
      "interaction",
      "label"
    ],
    "keywords": [
      "placements"
    ],
    "ts": true
  },
  {
    "id": "graphml",
    "name": "GraphML",
    "demoPath": "view/graphml/index.html",
    "summary": "Provides a live view of the graph's GraphML representation.",
    "category": "view",
    "type": "source-code",
    "thumbnailPath": "resources/image/graphml.png",
    "sourcePath": "view/graphml/GraphMLDemo.js",
    "tags": [
      "graphml",
      "i/o"
    ],
    "keywords": [
      "load",
      "save",
      "io",
      "data panel",
      "groups",
      "folding",
      "labels",
      "curves",
      "bezier"
    ],
    "ts": true
  },
  {
    "id": "graphml-compatibility",
    "name": "GraphML Compatibility",
    "demoPath": "view/graphmlcompatibility/index.html",
    "summary": "Shows how to enable read compatibility for GraphML files from older versions.",
    "category": "view",
    "type": "source-code",
    "thumbnailPath": "resources/image/graphmlcompatibility.png",
    "sourcePath": "view/graphmlcompatibility/GraphMLCompatibilityDemo.js",
    "tags": [
      "graphml",
      "i/o"
    ],
    "keywords": [
      "load",
      "save",
      "io",
      "v1.3"
    ]
  },
  {
    "id": "custom-port-location-model",
    "name": "Custom Port Location Model",
    "demoPath": "input/customportmodel/index.html",
    "summary": "Shows how to implement and use a custom port location model.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/custom_port_model.png",
    "sourcePath": "input/customportmodel/CustomPortModelDemo.js",
    "tags": [
      "interaction",
      "port"
    ],
    "keywords": [
      "port candidate providers",
      "placements"
    ],
    "ts": true
  },
  {
    "id": "custom-snapping",
    "name": "Custom Snapping",
    "demoPath": "input/customsnapping/index.html",
    "summary": "Shows how the snapping feature can be customized.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/custom-snapping.png",
    "sourcePath": "input/customsnapping/CustomSnappingDemo.js",
    "tags": [
      "interaction",
      "snapping"
    ],
    "keywords": [
      "guides",
      "lines",
      "labels",
      "move"
    ],
    "ts": true
  },
  {
    "id": "drag-from-component",
    "name": "Drag From Component",
    "demoPath": "input/drag-from-component/index.html",
    "summary": "Shows how to drag graph items out of the graph component to another element.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/drag-from-component.png",
    "sourcePath": "input/drag-from-component/DragFromComponentDemo.js",
    "tags": [
      "interaction",
      "drag and drop"
    ],
    "keywords": [
      "v2.4.0.4",
      "move",
      "dnd"
    ],
    "ts": true
  },
  {
    "id": "context-menu",
    "name": "Context Menu",
    "demoPath": "input/contextmenu/index.html",
    "summary": "Shows how to add a context menu to the nodes of a graph and to the canvas background.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/contextmenu.png",
    "sourcePath": "input/contextmenu/ContextMenuDemo.js",
    "tags": [
      "interaction"
    ],
    "keywords": [
      "context menu",
      "copy"
    ],
    "ts": true
  },
  {
    "id": "drag-and-drop",
    "name": "Drag and Drop",
    "demoPath": "input/draganddrop/index.html",
    "summary": "Shows drag and drop of nodes, groups and labels.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/draganddrop.png",
    "sourcePath": "input/draganddrop/DragAndDropDemo.js",
    "tags": [
      "interaction",
      "drag and drop"
    ],
    "keywords": [
      "palette",
      "ports",
      "labels",
      "groups",
      "html5",
      "native",
      "move",
      "dnd"
    ],
    "ts": true
  },
  {
    "id": "graph-drag-and-drop",
    "name": "Graph Drag and Drop",
    "demoPath": "input/graph-drag-and-drop/index.html",
    "summary": "Shows drag and drop of graphs consisting of multiple items.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/graph-drag-and-drop.png",
    "sourcePath": "input/graph-drag-and-drop/GraphDragAndDropDemo.js",
    "tags": [
      "interaction",
      "drag and drop"
    ],
    "keywords": [
      "v2.4.0.4",
      "palette",
      "graphs",
      "groups",
      "dnd"
    ],
    "ts": true
  },
  {
    "id": "custom-drag-and-drop",
    "name": "Custom Drag and Drop",
    "demoPath": "input/custom-drag-and-drop/index.html",
    "summary": "Shows how to change the color of nodes and edges using drag and drop operations.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/color-dnd.png",
    "sourcePath": "input/custom-drag-and-drop/CustomDragAndDropDemo.js",
    "tags": [
      "interaction",
      "drag and drop"
    ],
    "keywords": [
      "v2.4.0.4",
      "palette",
      "colors",
      "dnd"
    ],
    "ts": true
  },
  {
    "id": "edge-reconnection",
    "name": "Edge Reconnection",
    "demoPath": "input/edgereconnection/index.html",
    "summary": "Shows how the reconnection of edge ports can be customized and restricted.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/edgereconnection.png",
    "sourcePath": "input/edgereconnection/EdgeReconnectionPortCandidateProviderDemo.js",
    "tags": [
      "interaction"
    ],
    "keywords": [
      "port candidate providers",
      "ports"
    ],
    "ts": true
  },
  {
    "id": "label-editing",
    "name": "Label Editing",
    "demoPath": "input/labelediting/index.html",
    "summary": "Shows customizations of the interactive label editing.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/label_editing.png",
    "sourcePath": "input/labelediting/LabelEditingDemo.js",
    "tags": [
      "interaction",
      "label"
    ],
    "keywords": [
      "texts",
      "validation"
    ],
    "ts": true
  },
  {
    "id": "label-handle-provider",
    "name": "Label Handle Provider",
    "demoPath": "input/labelhandleprovider/index.html",
    "summary": "Shows how to implement custom handles that allow interactive resizing and rotation of labels.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/LabelHandleProvider.png",
    "sourcePath": "input/labelhandleprovider/LabelHandleProviderDemo.js",
    "tags": [
      "interaction",
      "label"
    ],
    "keywords": [
      "handles"
    ],
    "ts": true
  },
  {
    "id": "move-unselected-nodes",
    "name": "Move Unselected Nodes",
    "demoPath": "input/moveunselectednodes/index.html",
    "summary": "Shows a special input mode that allows you to move nodes without selecting them first.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/move_unselected_nodes.png",
    "sourcePath": "input/moveunselectednodes/MoveUnselectedNodesDemo.js",
    "tags": [
      "interaction",
      "selection"
    ],
    "keywords": [
      "input mode",
      "move"
    ],
    "ts": true
  },
  {
    "id": "orthogonal-edges",
    "name": "Orthogonal Edges",
    "demoPath": "input/orthogonaledges/index.html",
    "summary": "Shows the customization of orthogonal edge editing.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/orthogonal-edges.png",
    "sourcePath": "input/orthogonaledges/OrthogonalEdgesDemo.js",
    "tags": [
      "interaction"
    ],
    "keywords": [
      "orthogonal edges",
      "move"
    ],
    "ts": true
  },
  {
    "id": "port-candidate-provider",
    "name": "Port Candidate Provider",
    "demoPath": "input/portcandidateprovider/index.html",
    "summary": "Shows how edge creation can be customized.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/portcandidateprovider.png",
    "sourcePath": "input/portcandidateprovider/PortCandidateProviderDemo.js",
    "tags": [
      "interaction",
      "port"
    ],
    "keywords": [
      "port candidate providers"
    ],
    "ts": true
  },
  {
    "id": "position-handler",
    "name": "Position Handler",
    "demoPath": "input/positionhandler/index.html",
    "summary": "Shows how to customize and restrict the movement behavior of nodes.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/position-handler.png",
    "sourcePath": "input/positionhandler/PositionHandlerDemo.js",
    "tags": [
      "interaction"
    ],
    "keywords": [
      "position handlers",
      "move"
    ],
    "ts": true
  },
  {
    "id": "reparent-handler",
    "name": "Reparent Handler",
    "demoPath": "input/reparenthandler/index.html",
    "summary": "Shows how reparenting of nodes can be customized.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/reparenthandler.png",
    "sourcePath": "input/reparenthandler/ReparentHandlerDemo.js",
    "tags": [
      "interaction",
      "grouping"
    ],
    "keywords": [
      "re-parent handlers"
    ],
    "ts": true
  },
  {
    "id": "reshape-handle-provider-configuration",
    "name": "Reshape Handle Provider Configuration",
    "demoPath": "input/reshapehandleconfiguration/index.html",
    "summary": "Shows how resizing of nodes can be customized.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/reshape-handle.png",
    "sourcePath": "input/reshapehandleconfiguration/ReshapeHandleProviderConfigurationDemo.js",
    "tags": [
      "interaction",
      "resizing"
    ],
    "keywords": [
      "v2.3.0.0",
      "handles",
      "reshape",
      "size",
      "scale"
    ],
    "ts": true
  },
  {
    "id": "reshape-handle-provider",
    "name": "Reshape Handle Provider",
    "demoPath": "input/reshapehandleprovider/index.html",
    "summary": "Shows how to add resize handles to ports.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/reshape-port-handle.png",
    "sourcePath": "input/reshapehandleprovider/ReshapeHandleProviderDemo.js",
    "tags": [
      "interaction",
      "resizing",
      "port"
    ],
    "keywords": [
      "v2.3.0.0",
      "handles",
      "reshape",
      "size",
      "scale"
    ],
    "ts": true
  },
  {
    "id": "restricted-editing",
    "name": "Restricted Editing",
    "demoPath": "input/restricted-editing/index.html",
    "summary": "Shows how to restrict interactive editing with GraphEditorInputMode.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/restricted-editing.png",
    "sourcePath": "input/restricted-editing/RestrictedEditingDemo.js",
    "tags": [
      "interaction"
    ],
    "keywords": [
      "v2.4.0.4",
      "editing",
      "viewing"
    ],
    "ts": true
  },
  {
    "id": "lasso-selection",
    "name": "Lasso Selection",
    "demoPath": "input/lassoselection/index.html",
    "summary": "Shows how to configure a lasso tool for freeform selection.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/lassoselection.png",
    "sourcePath": "input/lassoselection/LassoSelectionDemo.js",
    "tags": [
      "interaction",
      "selection"
    ],
    "keywords": [
      "v2.1.0.2",
      "testable",
      "free"
    ],
    "ts": true
  },
  {
    "id": "marquee-node-creation",
    "name": "Marquee Node Creation",
    "demoPath": "input/marquee-node-creation/index.html",
    "summary": "Shows how to customize the MarqueeSelectionInputMode class to create new nodes.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/marquee-node-creation.png",
    "sourcePath": "input/marquee-node-creation/MarqueeNodeCreationDemo.js",
    "tags": [
      "interaction"
    ],
    "keywords": [
      "v2.4.0.4",
      "marquee",
      "selection",
      "creation",
      "creating"
    ],
    "ts": true
  },
  {
    "id": "single-selection",
    "name": "Single Selection",
    "demoPath": "input/singleselection/index.html",
    "summary": "Shows how to configure GraphEditorInputMode for single selection mode.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/singleselection.png",
    "sourcePath": "input/singleselection/SingleSelectionDemo.js",
    "tags": [
      "interaction",
      "selection"
    ],
    "keywords": [
      "single selection"
    ],
    "ts": true
  },
  {
    "id": "size-constraint-provider",
    "name": "Size Constraint Provider",
    "demoPath": "input/sizeconstraintprovider/index.html",
    "summary": "Shows how resizing of nodes can be restricted.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/size-constraint.png",
    "sourcePath": "input/sizeconstraintprovider/SizeConstraintProviderDemo.js",
    "tags": [
      "interaction"
    ],
    "keywords": [
      "size constraint providers",
      "handles"
    ],
    "ts": true
  },
  {
    "id": "button-input-mode",
    "name": "Button Input Mode",
    "demoPath": "input/button-input-mode/index.html",
    "summary": "Shows how to use a custom input mode adding temporary buttons for model items.",
    "category": "input",
    "type": "source-code",
    "thumbnailPath": "resources/image/button-input-mode.png",
    "sourcePath": "input/button-input-mode/ButtonInputModeDemo.js",
    "tags": [
      "interaction"
    ],
    "keywords": [
      "v2.4.0.4",
      "buttons",
      "input mode"
    ],
    "ts": true
  },
  {
    "id": "without-view",
    "name": "Layout Without View",
    "sourcePath": "layout/without-view/LayoutWithoutViewDemo.js",
    "demoPath": "layout/without-view/index.html",
    "summary": "Shows how to use the graph analysis and layout algorithms without a view and without the IGraph API",
    "category": "layout",
    "type": "source-code",
    "packageType": "layout",
    "thumbnailPath": "resources/image/without-view.png",
    "tags": [
      "headless",
      "layout",
      "analysis"
    ],
    "keywords": [
      "v2.3.0.1",
      "invisible",
      "background",
      "memory",
      "centrality",
      "hierarchic",
      "typescript"
    ],
    "ts": true
  },
  {
    "id": "tutorial-getting-started--graphcomponent",
    "name": "01 Creating the View",
    "summary": "Introduces the GraphComponent class, the central UI element for working with graphs.",
    "demoPath": "01-tutorial-getting-started/01-graphcomponent/index.html",
    "thumbnailPath": "resources/image/tutorial1step1.png",
    "category": "tutorial-getting-started",
    "tags": [
      "tutorial",
      "getting started"
    ],
    "sourcePath": "01-tutorial-getting-started/01-graphcomponent/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-getting-started--graph-element-creation",
    "name": "02 Creating Graph Elements",
    "summary": "Shows how to create the basic graph elements.",
    "demoPath": "01-tutorial-getting-started/02-graph-element-creation/index.html",
    "thumbnailPath": "resources/image/tutorial1step2.png",
    "category": "tutorial-getting-started",
    "tags": [
      "tutorial",
      "getting started"
    ],
    "keywords": [
      "nodes",
      "edges",
      "labels"
    ],
    "sourcePath": "01-tutorial-getting-started/02-graph-element-creation/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-getting-started--managing-viewport",
    "name": "03 Managing Viewport",
    "summary": "Shows how to work with the viewport.",
    "demoPath": "01-tutorial-getting-started/03-managing-viewport/index.html",
    "thumbnailPath": "resources/image/tutorial1step2.png",
    "category": "tutorial-getting-started",
    "tags": [
      "tutorial",
      "getting started"
    ],
    "keywords": [
      "zoom",
      "fit content"
    ],
    "sourcePath": "01-tutorial-getting-started/03-managing-viewport/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-getting-started--setting-styles",
    "name": "04 Setting Styles",
    "summary": "Shows how to configure the visual appearance of graph elements using styles.",
    "demoPath": "01-tutorial-getting-started/04-setting-styles/index.html",
    "thumbnailPath": "resources/image/tutorial1step4.png",
    "category": "tutorial-getting-started",
    "tags": [
      "tutorial",
      "getting started"
    ],
    "keywords": [
      "DefaultLabelStyle",
      "ShapeNodeStyle",
      "ShinyPlateNodeStyle",
      "PolylineEdgeStyle",
      "Arrow"
    ],
    "sourcePath": "01-tutorial-getting-started/04-setting-styles/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-getting-started--label-placement",
    "name": "05 Label Placement",
    "summary": "Shows how to control label placement with the help of so called label model parameters.",
    "demoPath": "01-tutorial-getting-started/05-label-placement/index.html",
    "thumbnailPath": "resources/image/tutorial1step5.png",
    "category": "tutorial-getting-started",
    "tags": [
      "tutorial",
      "getting started"
    ],
    "keywords": [
      "InteriorLabelModel",
      "SmartEdgeLabelModel"
    ],
    "sourcePath": "01-tutorial-getting-started/05-label-placement/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-getting-started--basic-interaction",
    "name": "06 Basic Interaction",
    "summary": "Shows the default interaction gestures that are provided by class GraphEditorInputMode.",
    "demoPath": "01-tutorial-getting-started/06-basic-interaction/index.html",
    "thumbnailPath": "resources/image/tutorial1step6.png",
    "category": "tutorial-getting-started",
    "tags": [
      "tutorial",
      "getting started"
    ],
    "sourcePath": "01-tutorial-getting-started/06-basic-interaction/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-getting-started--undo-clipboard-support",
    "name": "07 Undo Clipboard Support",
    "summary": "Shows how to use the undo and clipboard features.",
    "demoPath": "01-tutorial-getting-started/07-undo-clipboard-support/index.html",
    "thumbnailPath": "resources/image/tutorial1step7.png",
    "category": "tutorial-getting-started",
    "tags": [
      "tutorial",
      "getting started"
    ],
    "keywords": [
      "cut",
      "copy",
      "paste",
      "redo"
    ],
    "sourcePath": "01-tutorial-getting-started/07-undo-clipboard-support/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-getting-started--grouping",
    "name": "08 Grouping",
    "summary": "Shows how to configure support for grouped (or hierarchically organized) graphs.",
    "demoPath": "01-tutorial-getting-started/08-grouping/index.html",
    "thumbnailPath": "resources/image/tutorial1step8.png",
    "category": "tutorial-getting-started",
    "tags": [
      "tutorial",
      "getting started"
    ],
    "keywords": [
      "PanelNodeStyle",
      "InteriorStretchLabelModel"
    ],
    "sourcePath": "01-tutorial-getting-started/08-grouping/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-getting-started--data-binding",
    "name": "09 Data Binding",
    "summary": "Shows how to bind data to graph elements.",
    "demoPath": "01-tutorial-getting-started/09-data-binding/index.html",
    "thumbnailPath": "resources/image/tutorial1step9.png",
    "category": "tutorial-getting-started",
    "tags": [
      "tutorial",
      "getting started"
    ],
    "keywords": [
      "Mapper"
    ],
    "sourcePath": "01-tutorial-getting-started/09-data-binding/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-getting-started--layout",
    "name": "10 Layout",
    "summary": "Shows how to use the layout algorithms in yFiles for HTML to automatically place the graph elements.",
    "demoPath": "01-tutorial-getting-started/10-layout/index.html",
    "thumbnailPath": "resources/image/tutorial1step10.png",
    "category": "tutorial-getting-started",
    "packageType": "no-viewer",
    "tags": [
      "tutorial",
      "getting started",
      "hierarchic"
    ],
    "keywords": [
      "morphLayout"
    ],
    "sourcePath": "01-tutorial-getting-started/10-layout/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-getting-started--layout-data",
    "name": "11 Layout Data",
    "summary": "Shows how to configure individual settings for each node for the automatic layout.",
    "demoPath": "01-tutorial-getting-started/11-layout-data/index.html",
    "thumbnailPath": "resources/image/tutorial1step11.png",
    "category": "tutorial-getting-started",
    "packageType": "no-viewer",
    "tags": [
      "tutorial",
      "getting started"
    ],
    "keywords": [
      "v2.2.0.0",
      "hierarchic"
    ],
    "sourcePath": "01-tutorial-getting-started/11-layout-data/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-getting-started--graph-analysis",
    "name": "12 Analysis Algorithms",
    "summary": "Shows how to use the graph analysis algorithms.",
    "demoPath": "01-tutorial-getting-started/12-graph-analysis/index.html",
    "thumbnailPath": "resources/image/tutorial1step12.png",
    "category": "tutorial-getting-started",
    "packageType": "no-viewer",
    "tags": [
      "tutorial",
      "getting started",
      "analysis"
    ],
    "keywords": [
      "Reachability",
      "ShortestPaths",
      "v2.2.0.0"
    ],
    "sourcePath": "01-tutorial-getting-started/12-graph-analysis/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--custom-node-style",
    "name": "01 Custom Node Style",
    "summary": "Shows how to create a custom node style.",
    "demoPath": "02-tutorial-custom-styles/01-custom-node-style/index.html",
    "thumbnailPath": "resources/image/tutorial2step1.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "keywords": [
      "NodeStyleBase"
    ],
    "sourcePath": "02-tutorial-custom-styles/01-custom-node-style/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--node-color",
    "name": "02 Node Color",
    "summary": "Shows how to change the style of the nodes based on their tag.",
    "demoPath": "02-tutorial-custom-styles/02-node-color/index.html",
    "thumbnailPath": "resources/image/tutorial2step2.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/02-node-color/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--update-visual-and-render-data-cache",
    "name": "03 Update Visual And Render Data Cache",
    "summary": "Shows how to implement high-performance rendering of nodes.",
    "demoPath": "02-tutorial-custom-styles/03-update-visual-and-render-data-cache/index.html",
    "thumbnailPath": "resources/image/tutorial2step3.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/03-update-visual-and-render-data-cache/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--is-inside",
    "name": "04 Is Inside",
    "summary": "Shows how to override isInside() and getOutline() of NodeStyleBase.",
    "demoPath": "02-tutorial-custom-styles/04-is-inside/index.html",
    "thumbnailPath": "resources/image/tutorial2step1.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/04-is-inside/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--hit-test",
    "name": "05 Hit Test",
    "summary": "Shows how to override isHit() and isInBox() of NodeStyleBase.",
    "demoPath": "02-tutorial-custom-styles/05-hit-test/index.html",
    "thumbnailPath": "resources/image/tutorial2step1.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/05-hit-test/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--get-bounds",
    "name": "06 Get Bounds",
    "summary": "Shows how to override getBounds() of NodeStyleBase.",
    "demoPath": "02-tutorial-custom-styles/06-get-bounds/index.html",
    "thumbnailPath": "resources/image/tutorial2step1.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/06-get-bounds/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--drop-shadow-performance",
    "name": "07 Drop Shadow Performance",
    "summary": "This step replaces the simple drop shadow in the last steps with a more visually appealing, blurred one.",
    "demoPath": "02-tutorial-custom-styles/07-drop-shadow-performance/index.html",
    "thumbnailPath": "resources/image/tutorial2step7.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/07-drop-shadow-performance/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--edge-from-node-to-label",
    "name": "08 Edge From Node To Label",
    "summary": "Shows how to visually connect a label to its owner node with a line.",
    "demoPath": "02-tutorial-custom-styles/08-edge-from-node-to-label/index.html",
    "thumbnailPath": "resources/image/tutorial2step8.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/08-edge-from-node-to-label/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--is-visible",
    "name": "09 Is Visible",
    "summary": "Shows how to override the method isVisible() of NodeStyleBase.",
    "demoPath": "02-tutorial-custom-styles/09-is-visible/index.html",
    "thumbnailPath": "resources/image/tutorial2step1.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/09-is-visible/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--custom-label-style",
    "name": "10 Custom Label Style",
    "summary": "Shows how a custom label style.",
    "demoPath": "02-tutorial-custom-styles/10-custom-label-style/index.html",
    "thumbnailPath": "resources/image/tutorial2step10.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "keywords": [
      "LabelStyleBase"
    ],
    "sourcePath": "02-tutorial-custom-styles/10-custom-label-style/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--label-preferred-size",
    "name": "11 Label Preferred Size",
    "summary": "Shows how to set the size of the label based on the size of its text by overriding the LabelStyleBase#getPreferredSize() method.",
    "demoPath": "02-tutorial-custom-styles/11-label-preferred-size/index.html",
    "thumbnailPath": "resources/image/tutorial2step11.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/11-label-preferred-size/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--high-performance-label-rendering",
    "name": "12 High Performance Label Rendering",
    "summary": "Shows how to implement high-performance rendering for labels.",
    "demoPath": "02-tutorial-custom-styles/12-high-performance-label-rendering/index.html",
    "thumbnailPath": "resources/image/tutorial2step11.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/12-high-performance-label-rendering/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--label-edit-button",
    "name": "13 Label Edit Button",
    "summary": "Shows how to display a button on a label that starts the label editor.",
    "demoPath": "02-tutorial-custom-styles/13-label-edit-button/index.html",
    "thumbnailPath": "resources/image/tutorial2step13.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/13-label-edit-button/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--button-visibility",
    "name": "14 Button Visibility",
    "summary": "Shows how to hide the 'Label Edit' button based on the zoom level.",
    "demoPath": "02-tutorial-custom-styles/14-button-visibility/index.html",
    "thumbnailPath": "resources/image/tutorial2step13.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/14-button-visibility/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--using-data-in-label-tag",
    "name": "15 Using Data In Label Tag",
    "summary": "Shows how to use data from a business object, which is stored in the label's tag, for rendering.",
    "demoPath": "02-tutorial-custom-styles/15-using-data-in-label-tag/index.html",
    "thumbnailPath": "resources/image/tutorial2step15.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/15-using-data-in-label-tag/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--custom-edge-style",
    "name": "16 Custom Edge Style",
    "summary": "Shows how to create a custom edge style which allows to specify the edge thickness by setting a property on the style.",
    "demoPath": "02-tutorial-custom-styles/16-custom-edge-style/index.html",
    "thumbnailPath": "resources/image/tutorial2step16.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "keywords": [
      "EdgeStyleBase"
    ],
    "sourcePath": "02-tutorial-custom-styles/16-custom-edge-style/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--edge-hit-test",
    "name": "17 Edge Hit Test",
    "summary": "Shows how to take the thickness of the edge into account when checking if the edge was clicked.",
    "demoPath": "02-tutorial-custom-styles/17-edge-hit-test/index.html",
    "thumbnailPath": "resources/image/tutorial2step17.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/17-edge-hit-test/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--edge-cropping",
    "name": "18 Edge Cropping",
    "summary": "Shows how to crop an edge at the node's bounds.",
    "demoPath": "02-tutorial-custom-styles/18-edge-cropping/index.html",
    "thumbnailPath": "resources/image/tutorial2step18.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/18-edge-cropping/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--animated-edge-selection",
    "name": "19 Animated Edge Selection",
    "summary": "Shows how to change the style of an edge if the edge is selected.",
    "demoPath": "02-tutorial-custom-styles/19-animated-edge-selection/index.html",
    "thumbnailPath": "resources/image/tutorial2step19.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/19-animated-edge-selection/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--custom-arrow",
    "name": "20 Custom Arrow",
    "summary": "Shows a custom arrow.",
    "demoPath": "02-tutorial-custom-styles/20-custom-arrow/index.html",
    "thumbnailPath": "resources/image/tutorial2step20.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/20-custom-arrow/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--edge-performance",
    "name": "21 Edge Performance",
    "summary": "Shows how to optimize rendering performance for edges and arrows.",
    "demoPath": "02-tutorial-custom-styles/21-edge-performance/index.html",
    "thumbnailPath": "resources/image/tutorial2step20.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/21-edge-performance/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--arrow-thickness",
    "name": "22 Arrow Thickness",
    "summary": "Shows how to render the arrow based on a property of its edge.",
    "demoPath": "02-tutorial-custom-styles/22-arrow-thickness/index.html",
    "thumbnailPath": "resources/image/tutorial2step22.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/22-arrow-thickness/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--custom-ports",
    "name": "23 Custom Ports",
    "summary": "Shows a custom port style.",
    "demoPath": "02-tutorial-custom-styles/23-custom-ports/index.html",
    "thumbnailPath": "resources/image/tutorial2step23.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "keywords": [
      "PortStyleBase"
    ],
    "sourcePath": "02-tutorial-custom-styles/23-custom-ports/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--style-decorator",
    "name": "24 Style Decorator",
    "summary": "Shows how to enhance an existing node style by adding visual decorators.",
    "demoPath": "02-tutorial-custom-styles/24-style-decorator/index.html",
    "thumbnailPath": "resources/image/tutorial2step23.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/24-style-decorator/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--custom-group-style",
    "name": "25 Custom Group Style",
    "summary": "Shows how to implement a special node style for group nodes.",
    "demoPath": "02-tutorial-custom-styles/25-custom-group-style/index.html",
    "thumbnailPath": "resources/image/tutorial2step25.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "keywords": [
      "CollapsibleNodeStyleDecoratorRenderer",
      "NodeStyleBase"
    ],
    "sourcePath": "02-tutorial-custom-styles/25-custom-group-style/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--custom-group-bounds",
    "name": "26 Custom Group Bounds",
    "summary": "Shows how to customize the way that the group insets are calculated by implementing an ILayoutGroupBoundsCalculator.",
    "demoPath": "02-tutorial-custom-styles/26-custom-group-bounds/index.html",
    "thumbnailPath": "resources/image/tutorial2step26.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/26-custom-group-bounds/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--canvas-painting",
    "name": "27 Canvas Painting",
    "summary": "Shows how to implement a zoom-dependent high-performance rendering using HTML5 Canvas painting for nodes.",
    "demoPath": "02-tutorial-custom-styles/27-canvas-painting/index.html",
    "thumbnailPath": "resources/image/tutorial2step27.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/27-canvas-painting/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--bridge-support",
    "name": "28 Bridge Support",
    "summary": "Shows how to enable bridges for a custom edge style.",
    "demoPath": "02-tutorial-custom-styles/28-bridge-support/index.html",
    "thumbnailPath": "resources/image/tutorial2step28.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/28-bridge-support/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-custom-styles--label-line-wrapping",
    "name": "29 Label Line Wrapping",
    "summary": "Shows how to enhance a custom label style to support different line wrapping (trimming) styles as well as text clipping at the label bounds.",
    "demoPath": "02-tutorial-custom-styles/29-label-line-wrapping/index.html",
    "thumbnailPath": "resources/image/tutorial2step29.png",
    "category": "tutorial-custom-styles",
    "tags": [
      "tutorial",
      "custom style"
    ],
    "sourcePath": "02-tutorial-custom-styles/29-label-line-wrapping/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--application-features-base",
    "name": "Application Features Base",
    "summary": "This demo is the base for the feature-specific demos of this tutorial.",
    "demoPath": "03-tutorial-application-features/application-features-base/index.html",
    "thumbnailPath": "resources/image/tutorial3step1.png",
    "category": "tutorial-application-features",
    "tags": [
      "tutorial"
    ],
    "sourcePath": "03-tutorial-application-features/application-features-base/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--background-image",
    "name": "Background Image",
    "summary": "Shows how to add a background visualizations to a graph component.",
    "demoPath": "03-tutorial-application-features/background-image/index.html",
    "thumbnailPath": "resources/image/tutorial3step2.png",
    "category": "tutorial-application-features",
    "tags": [
      "background",
      "icon",
      "tutorial"
    ],
    "keywords": [
      "v2.2.0.0",
      "ICanvasObjectGroup",
      "backgroundGroup"
    ],
    "sourcePath": "03-tutorial-application-features/background-image/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--building-graph-from-data",
    "name": "Building Graphs From Data",
    "summary": "Shows how to build a graph from data in JSON format.",
    "demoPath": "03-tutorial-application-features/building-graph-from-data/index.html",
    "thumbnailPath": "resources/image/tutorial3step3.png",
    "category": "tutorial-application-features",
    "tags": [
      "json",
      "i/o",
      "tutorial"
    ],
    "keywords": [
      "read",
      "write",
      "input",
      "files",
      "data base"
    ],
    "sourcePath": "03-tutorial-application-features/building-graph-from-data/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--building-swimlanes-from-data",
    "name": "Building Swimlanes From Data",
    "summary": "Shows how to build a graph with swimlanes from data in JSON format.",
    "demoPath": "03-tutorial-application-features/building-swimlanes-from-data/index.html",
    "thumbnailPath": "resources/image/tutorial3step4.png",
    "category": "tutorial-application-features",
    "packageType": "no-viewer",
    "tags": [
      "json",
      "i/o",
      "table",
      "tutorial"
    ],
    "keywords": [
      "read",
      "write",
      "input",
      "files",
      "data base"
    ],
    "sourcePath": "03-tutorial-application-features/building-swimlanes-from-data/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--clickable-style-decorator",
    "name": "Clickable Style Decorator",
    "summary": "Illustrates an approach for handling clicks on specific areas of the style.",
    "demoPath": "03-tutorial-application-features/clickable-style-decorator/index.html",
    "thumbnailPath": "resources/image/tutorial3step5.png",
    "category": "tutorial-application-features",
    "tags": [
      "interaction",
      "icon",
      "tutorial"
    ],
    "keywords": [
      "NodeDecorator",
      "ILookupDecorator",
      "NodeStyleBase",
      "images",
      "events",
      "regions",
      "input mode"
    ],
    "sourcePath": "03-tutorial-application-features/clickable-style-decorator/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--composite-node-style",
    "name": "Composite Node Style",
    "summary": "Shows how to combine node visualizations from several styles.",
    "demoPath": "03-tutorial-application-features/composite-node-style/index.html",
    "thumbnailPath": "resources/image/composite-node-style.png",
    "category": "tutorial-application-features",
    "tags": [
      "style",
      "icon",
      "tutorial"
    ],
    "keywords": [
      "v2.4.0.4",
      "composite"
    ],
    "sourcePath": "03-tutorial-application-features/composite-node-style/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--drag-and-drop",
    "name": "Drag And Drop",
    "summary": "Shows how to enable dragging nodes from a panel and drop them into the graph component.",
    "demoPath": "03-tutorial-application-features/drag-and-drop/index.html",
    "thumbnailPath": "resources/image/tutorial03.png",
    "category": "tutorial-application-features",
    "tags": [
      "interaction",
      "tutorial",
      "drag and drop"
    ],
    "keywords": [
      "DropInputMode",
      "addDragDroppedListener",
      "move",
      "events",
      "input mode",
      "dnd"
    ],
    "sourcePath": "03-tutorial-application-features/drag-and-drop/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--external-links",
    "name": "External Links",
    "summary": "Shows how to add labels that act like external links and open in a new window.",
    "demoPath": "03-tutorial-application-features/external-links/index.html",
    "thumbnailPath": "resources/image/tutorial3step8.png",
    "category": "tutorial-application-features",
    "tags": [
      "interaction",
      "tutorial"
    ],
    "keywords": [
      "ItemHoverInputMode",
      "control",
      "events",
      "input mode"
    ],
    "sourcePath": "03-tutorial-application-features/external-links/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--filtering",
    "name": "Filtering",
    "summary": "Shows how to configure graph filtering.",
    "demoPath": "03-tutorial-application-features/filtering/index.html",
    "thumbnailPath": "resources/image/tutorial3step9.png",
    "category": "tutorial-application-features",
    "tags": [
      "filtering",
      "grouping",
      "tutorial"
    ],
    "keywords": [
      "v2.2.0.0",
      "FilteredGraphWrapper",
      "subset",
      "predicates",
      "hide",
      "hiding"
    ],
    "sourcePath": "03-tutorial-application-features/filtering/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--filtering-with-folding",
    "name": "Filtering With Folding",
    "summary": "Shows how to configure filtering and folding in the same application.",
    "demoPath": "03-tutorial-application-features/filtering-with-folding/index.html",
    "thumbnailPath": "resources/image/tutorial3step10.png",
    "category": "tutorial-application-features",
    "tags": [
      "filtering",
      "grouping",
      "tutorial"
    ],
    "keywords": [
      "v2.2.0.0",
      "FilteredGraphWrapper",
      "subset",
      "folder",
      "folding",
      "predicate",
      "masterGraph",
      "wrappedGraph",
      "FoldingManager",
      "nesting",
      "folded",
      "hide"
    ],
    "sourcePath": "03-tutorial-application-features/filtering-with-folding/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--folding",
    "name": "Folding",
    "summary": "Shows how to enable collapsing and expanding of group nodes.",
    "demoPath": "03-tutorial-application-features/folding/index.html",
    "thumbnailPath": "resources/image/tutorial3step11.png",
    "category": "tutorial-application-features",
    "tags": [
      "folding",
      "grouping",
      "tutorial"
    ],
    "keywords": [
      "v2.2.0.0",
      "masterGraph",
      "wrappedGraph",
      "FoldingManager",
      "collapse",
      "expand",
      "nesting",
      "hide"
    ],
    "sourcePath": "03-tutorial-application-features/folding/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--graph-copy",
    "name": "Graph Copy",
    "summary": "Shows how to copy a graph or parts of a graph.",
    "demoPath": "03-tutorial-application-features/graph-copy/index.html",
    "thumbnailPath": "resources/image/tutorial3graphcopy.png",
    "category": "tutorial-application-features",
    "tags": [
      "clipboard",
      "tutorial"
    ],
    "keywords": [
      "v2.2.0.0",
      "GraphCopier",
      "copy",
      "cut",
      "paste"
    ],
    "sourcePath": "03-tutorial-application-features/graph-copy/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--graph-decorator",
    "name": "Graph Decorator",
    "summary": "Shows how to decorate graph items to change their behavior or visualization.",
    "demoPath": "03-tutorial-application-features/graph-decorator/index.html",
    "thumbnailPath": "resources/image/demo-graph-decorator.png",
    "category": "tutorial-application-features",
    "tags": [
      "interaction",
      "tutorial"
    ],
    "keywords": [
      "v2.2.0.2",
      "GraphDecorator",
      "NodeDecorator",
      "ILookupDecorator",
      "ports",
      "IPortCandidate",
      "port candidate providers"
    ],
    "sourcePath": "03-tutorial-application-features/graph-decorator/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--simple-highlight",
    "name": "Simple Highlight Decorator",
    "summary": "Shows how to highlight nodes and edges when the mouse hovers over them.",
    "demoPath": "03-tutorial-application-features/simple-highlight-decorator/index.html",
    "thumbnailPath": "resources/image/highlight-decorator.png",
    "category": "tutorial-application-features",
    "tags": [
      "highlight",
      "hover",
      "interaction"
    ],
    "keywords": [
      "v2.4.0.2",
      "GraphDecorator",
      "NodeDecorator",
      "HighlightDecorator"
    ],
    "sourcePath": "03-tutorial-application-features/simple-highlight-decorator/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--complex-highlight",
    "name": "Complex Highlight Decorator",
    "summary": "Shows how to highlight nodes with different effects based on data stored in their tags.",
    "demoPath": "03-tutorial-application-features/complex-highlight-decorator/index.html",
    "thumbnailPath": "resources/image/complex-highlight-decorator.png",
    "category": "tutorial-application-features",
    "tags": [
      "highlight",
      "hover",
      "interaction"
    ],
    "keywords": [
      "v2.4.0.2",
      "GraphDecorator",
      "NodeDecorator",
      "HighlightDecorator",
      "HighlightIndicatorManager"
    ],
    "sourcePath": "03-tutorial-application-features/complex-highlight-decorator/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--graph-search",
    "name": "Graph Search",
    "summary": "Shows how to search for specific nodes in a graph.",
    "demoPath": "03-tutorial-application-features/graph-search/index.html",
    "thumbnailPath": "resources/image/tutorial3step12.png",
    "category": "tutorial-application-features",
    "tags": [
      "highlight",
      "tutorial"
    ],
    "keywords": [
      "v2.2.0.0",
      "query",
      "queries",
      "match",
      "matches",
      "find"
    ],
    "sourcePath": "03-tutorial-application-features/graph-search/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--grid-snapping",
    "name": "Grid Snapping",
    "summary": "Shows how to enable grid snapping during interactive changes.",
    "demoPath": "03-tutorial-application-features/grid-snapping/index.html",
    "thumbnailPath": "resources/image/tutorial3step13.png",
    "category": "tutorial-application-features",
    "tags": [
      "grid",
      "interaction",
      "tutorial",
      "snapping"
    ],
    "keywords": [
      "GraphSnapContext",
      "LabelSnapContext",
      "GridSnapTypes",
      "GridVisualCreator",
      "align",
      "visuals",
      "interactive"
    ],
    "sourcePath": "03-tutorial-application-features/grid-snapping/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--input-output",
    "name": "Save and Load GraphML",
    "summary": "Shows how to use GraphML input and output.",
    "demoPath": "03-tutorial-application-features/input-output/index.html",
    "thumbnailPath": "resources/image/tutorial3step1.png",
    "category": "tutorial-application-features",
    "tags": [
      "graphml",
      "i/o",
      "tutorial"
    ],
    "keywords": [
      "GraphMLSupport",
      "read",
      "write",
      "files",
      "io"
    ],
    "sourcePath": "03-tutorial-application-features/input-output/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--custom-graphml",
    "name": "Custom Data in GraphML",
    "summary": "Shows how to read and write additional data from and to GraphML.",
    "demoPath": "03-tutorial-application-features/custom-graphml/index.html",
    "thumbnailPath": "resources/image/tutorial3step1.png",
    "category": "tutorial-application-features",
    "tags": [
      "graphml",
      "i/o",
      "tutorial"
    ],
    "keywords": [
      "IMapper",
      "mapperRegistry",
      "GraphMLIOHandler",
      "data",
      "json",
      "read",
      "write",
      "files",
      "io"
    ],
    "sourcePath": "03-tutorial-application-features/custom-graphml/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--label-text-wrapping",
    "name": "Label Text Wrapping",
    "summary": "Shows how to enable label text wrapping and trimming.",
    "demoPath": "03-tutorial-application-features/label-text-wrapping/index.html",
    "thumbnailPath": "resources/image/tutorial3step15.png",
    "category": "tutorial-application-features",
    "tags": [
      "label",
      "tutorial"
    ],
    "keywords": [
      "v2.3.0.0",
      "TextWrapping",
      "linebreaks",
      "rtl",
      "characters",
      "words",
      "right-to-left",
      "ellipsis"
    ],
    "sourcePath": "03-tutorial-application-features/label-text-wrapping/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--level-of-detail-style",
    "name": "Level of Detail Style",
    "summary": "Shows a node style that hides details when zooming out.",
    "demoPath": "03-tutorial-application-features/level-of-detail-style/index.html",
    "thumbnailPath": "resources/image/tutorial3step16.png",
    "category": "tutorial-application-features",
    "tags": [
      "style",
      "performance",
      "tutorial"
    ],
    "keywords": [
      "v2.2.0.0",
      "data bindings",
      "readability",
      "hide",
      "rendering",
      "sketch"
    ],
    "sourcePath": "03-tutorial-application-features/level-of-detail-style/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--markup-labels",
    "name": "Markup Labels",
    "summary": "Markup label style lets you use html-like markup to structure and style the label text.",
    "demoPath": "03-tutorial-application-features/markup-labels/index.html",
    "thumbnailPath": "resources/image/tutorial3markuplabels.png",
    "category": "tutorial-application-features",
    "tags": [
      "style",
      "label",
      "tutorial"
    ],
    "keywords": [
      "v2.3.0.0",
      "rich texts",
      "styling",
      "html",
      "xml",
      "color"
    ],
    "sourcePath": "03-tutorial-application-features/markup-labels/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--native-listeners",
    "name": "Native Listeners",
    "summary": "Illustrates how to register native event listeners to a SVG elements of a style.",
    "demoPath": "03-tutorial-application-features/native-listeners/index.html",
    "thumbnailPath": "resources/image/tutorial3step17.png",
    "category": "tutorial-application-features",
    "tags": [
      "interaction",
      "style",
      "tutorial"
    ],
    "keywords": [
      "NodeDecorator",
      "ILookupDecorator",
      "NodeStyleBase",
      "events",
      "decorator"
    ],
    "sourcePath": "03-tutorial-application-features/native-listeners/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--orthogonal-edges",
    "name": "Orthogonal Edges",
    "summary": "Shows how to enable interactive orthogonal edge editing.",
    "demoPath": "03-tutorial-application-features/orthogonal-edges/index.html",
    "thumbnailPath": "resources/image/tutorial3step18.png",
    "category": "tutorial-application-features",
    "tags": [
      "edge creation",
      "bends",
      "tutorial"
    ],
    "keywords": [
      "OrthogonalEdgeEditingContext",
      "OrthogonalEdgeEditingPolicy"
    ],
    "sourcePath": "03-tutorial-application-features/orthogonal-edges/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--rectangular-indicator",
    "name": "Rectangular Indicator",
    "summary": "Shows how to add an interactive rectangular indicator to the graph component.",
    "demoPath": "03-tutorial-application-features/rectangular-indicator/index.html",
    "thumbnailPath": "resources/image/tutorial3step19.png",
    "category": "tutorial-application-features",
    "tags": [
      "interaction",
      "selection",
      "tutorial"
    ],
    "keywords": [
      "v2.2.0.0",
      "PositionHandler",
      "RectangleIndicatorInstaller",
      "RectangleHandle",
      "handles"
    ],
    "sourcePath": "03-tutorial-application-features/rectangular-indicator/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--smart-click-navigation",
    "name": "Smart Click Navigation",
    "demoPath": "03-tutorial-application-features/smart-click-navigation/index.html",
    "summary": "Shows the how to scroll and zoom to the area of interest by single edge-clicks.",
    "category": "tutorial-application-features",
    "thumbnailPath": "resources/image/navigation.png",
    "tags": [
      "exploration",
      "tutorial"
    ],
    "keywords": [
      "v2.2.0.0",
      "navigation",
      "zoom",
      "move",
      "interaction"
    ],
    "sourcePath": "03-tutorial-application-features/smart-click-navigation/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--snapping",
    "name": "Snapping",
    "summary": "Shows how to enable snapping (guide lines) for interactive changes.",
    "demoPath": "03-tutorial-application-features/snapping/index.html",
    "thumbnailPath": "resources/image/tutorial3snapping.png",
    "category": "tutorial-application-features",
    "tags": [
      "interaction",
      "tutorial",
      "snapping"
    ],
    "keywords": [
      "move",
      "resize",
      "resizing"
    ],
    "sourcePath": "03-tutorial-application-features/snapping/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--tooltips",
    "name": "Tooltips",
    "summary": "Shows how to enable tooltips for graph items.",
    "demoPath": "03-tutorial-application-features/tooltips/index.html",
    "thumbnailPath": "resources/image/tutorial3step21.png",
    "category": "tutorial-application-features",
    "tags": [
      "hover",
      "interaction",
      "tutorial"
    ],
    "keywords": [
      "mouseHoverInputMode",
      "addQueryItemToolTipListener",
      "events",
      "data",
      "json"
    ],
    "sourcePath": "03-tutorial-application-features/tooltips/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--accessibility",
    "name": "Accessibility",
    "summary": "Shows how to use the aria-live region to update screen readers.",
    "demoPath": "03-tutorial-application-features/accessibility/index.html",
    "thumbnailPath": "resources/image/tutorial3accessibility.png",
    "category": "tutorial-application-features",
    "tags": [
      "accessibility",
      "aria",
      "tutorial"
    ],
    "keywords": [
      "v2.3.0.0",
      "tool tips",
      "live",
      "region",
      "screen reader"
    ],
    "sourcePath": "03-tutorial-application-features/accessibility/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--webgl-rendering",
    "name": "WebGL2 Rendering",
    "summary": "Shows how to enable the WebGL2 rendering mode.",
    "demoPath": "03-tutorial-application-features/webgl-rendering/index.html",
    "thumbnailPath": "resources/image/feature-webgl-rendering.png",
    "category": "tutorial-application-features",
    "tags": [
      "webgl2",
      "performance",
      "tutorial"
    ],
    "keywords": [
      "v2.4.0.0",
      "large",
      "performance",
      "styles",
      "fast"
    ],
    "sourcePath": "03-tutorial-application-features/webgl-rendering/WebGLRenderingDemo.js",
    "ts": true
  },
  {
    "id": "tutorial-application-features--overview",
    "name": "Overview Component",
    "summary": "Shows how to add an overview component to the application.",
    "demoPath": "03-tutorial-application-features/overview/index.html",
    "thumbnailPath": "resources/image/feature-overview-component.png",
    "category": "tutorial-application-features",
    "tags": [
      "interaction",
      "tutorial"
    ],
    "keywords": [
      "v2.4.0.4",
      "overview",
      "navigation",
      "zoom"
    ],
    "sourcePath": "03-tutorial-application-features/overview/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--hierarchic",
    "name": "Hierarchic Layout",
    "summary": "Shows common configuration options for hierarchical layout.",
    "demoPath": "04-tutorial-layout-features/hierarchic/index.html",
    "thumbnailPath": "resources/image/tutorial4hierarchic.png",
    "category": "tutorial-layout-features",
    "tags": [
      "hierarchic"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "orthogonal",
      "octilinear",
      "port-constraints",
      "critical-path"
    ],
    "sourcePath": "04-tutorial-layout-features/hierarchic/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--hierarchic-incremental",
    "name": "Incremental Hierarchic Layout",
    "summary": "Shows how to run the hierarchical layout on a predefined set of nodes.",
    "demoPath": "04-tutorial-layout-features/hierarchic-incremental/index.html",
    "thumbnailPath": "resources/image/tutorial4-hierarchic-incremental.png",
    "category": "tutorial-layout-features",
    "tags": [
      "hierarchic",
      "incremental"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "subset",
      "layout",
      "nodes",
      "set",
      "node-set"
    ],
    "sourcePath": "04-tutorial-layout-features/hierarchic-incremental/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--portcandidateset",
    "name": "Hierarchic Layout with PortCandidateSet",
    "summary": "Shows how to use a PortCandidateSet with hierarchical layout.",
    "demoPath": "04-tutorial-layout-features/hierarchic-portcandidate-set/index.html",
    "thumbnailPath": "resources/image/tutorial4hierarchicportcandidateset.png",
    "category": "tutorial-layout-features",
    "tags": [
      "hierarchic",
      "ports"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "ports",
      "candidates",
      "portcandidateset"
    ],
    "sourcePath": "04-tutorial-layout-features/hierarchic-portcandidate-set/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--hierarchic-edge-grouping",
    "name": "Hierarchic Layout with Edge Grouping",
    "summary": "Shows how to configure edge grouping for hierarchical layout.",
    "demoPath": "04-tutorial-layout-features/hierarchic-edge-grouping/index.html",
    "thumbnailPath": "resources/image/tutorial4hierarchicedgegrouping.png",
    "category": "tutorial-layout-features",
    "tags": [
      "hierarchic",
      "edgegroups"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "groups"
    ],
    "sourcePath": "04-tutorial-layout-features/hierarchic-edge-grouping/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--hierarchic-with-given-layering",
    "name": "Hierarchic Layout with Given Layering",
    "summary": "Shows how to configure hierarchical layout with a given layering.",
    "demoPath": "04-tutorial-layout-features/hierarchic-given-layering/index.html",
    "thumbnailPath": "resources/image/tutorial4hierarchicgivenlayering.png",
    "category": "tutorial-layout-features",
    "tags": [
      "hierarchic",
      "given",
      "layers"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "hierarchic",
      "given",
      "layering",
      "layers"
    ],
    "sourcePath": "04-tutorial-layout-features/hierarchic-given-layering/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--constraints",
    "name": "Hierarchic Layout with Constraints",
    "summary": "Shows how to use constraints to control layering and sequencing in the hierarchical layout.",
    "demoPath": "04-tutorial-layout-features/hierarchic-constraints/index.html",
    "thumbnailPath": "resources/image/tutorial4hierarchicconstraints.png",
    "category": "tutorial-layout-features",
    "tags": [
      "hierarchic",
      "constraints"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout"
    ],
    "sourcePath": "04-tutorial-layout-features/hierarchic-constraints/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--sequence-constraints",
    "name": "Hierarchic Layout with Sequence Constraints",
    "summary": "Shows how to use constraints to control sequencing in hierarchical layout.",
    "demoPath": "04-tutorial-layout-features/hierarchic-sequence-constraints/index.html",
    "thumbnailPath": "resources/image/tutorial4hierarchicsequenceconstraints.png",
    "category": "tutorial-layout-features",
    "tags": [
      "hierarchic",
      "sequence",
      "constraints"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "sequencing"
    ],
    "sourcePath": "04-tutorial-layout-features/hierarchic-sequence-constraints/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--layer-constraints",
    "name": "Hierarchic Layout with Layer Constraints",
    "summary": "Shows how to use constraints to control layering in hierarchical layout.",
    "demoPath": "04-tutorial-layout-features/hierarchic-layer-constraints/index.html",
    "thumbnailPath": "resources/image/tutorial4hierarchiclayerconstraints.png",
    "category": "tutorial-layout-features",
    "tags": [
      "hierarchic",
      "layers",
      "constraints"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "layering"
    ],
    "sourcePath": "04-tutorial-layout-features/hierarchic-layer-constraints/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--hierarchic-node-alignment",
    "name": "Hierarchic Layout with Node Alignment",
    "summary": "Shows how to align a set of nodes with hierarchical layout.",
    "demoPath": "04-tutorial-layout-features/hierarchic-node-alignment/index.html",
    "thumbnailPath": "resources/image/tutorial4hierarchicverticalnodealignment.png",
    "category": "tutorial-layout-features",
    "tags": [
      "hierarchic",
      "alignment"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "alignment",
      "critical",
      "paths"
    ],
    "sourcePath": "04-tutorial-layout-features/hierarchic-node-alignment/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--hierarchic-edge-labeling",
    "name": "Hierarchic Layout with Edge Labeling",
    "summary": "Shows how to configure automatic label placement of hierarchical layout.",
    "demoPath": "04-tutorial-layout-features/hierarchic-edge-labeling/index.html",
    "thumbnailPath": "resources/image/tutorial4hierarchicedgelabeling.png",
    "category": "tutorial-layout-features",
    "tags": [
      "hierarchic",
      "labeling"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "integrated-labeling",
      "label-placement",
      "auto-flipping"
    ],
    "sourcePath": "04-tutorial-layout-features/hierarchic-edge-labeling/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--hierarchic-compact-groups",
    "name": "Compact Groups in Hierarchic Layout",
    "summary": "Shows how to configure the hierarchical layout such that it yields maximally compact group nodes.",
    "demoPath": "04-tutorial-layout-features/hierarchic-compact-groups/index.html",
    "thumbnailPath": "resources/image/tutorial4hierarchiccompactgroups.png",
    "category": "tutorial-layout-features",
    "tags": [
      "hierarchic",
      "compaction"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "recursive layering",
      "SimplexNodePlacer",
      "bendReduction",
      "groupCompactionStrategy",
      "groupCompactionPolicy"
    ],
    "sourcePath": "04-tutorial-layout-features/hierarchic-compact-groups/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--organic",
    "name": "Organic Layout",
    "summary": "Shows common configuration options for organic layout.",
    "demoPath": "04-tutorial-layout-features/organic/index.html",
    "thumbnailPath": "resources/image/tutorial4organic.png",
    "category": "tutorial-layout-features",
    "tags": [
      "organic"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "graph shape",
      "compactness",
      "node distance",
      "simple"
    ],
    "sourcePath": "04-tutorial-layout-features/organic/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--organic-incremental",
    "name": "Incremental Organic Layout",
    "summary": "Shows how to run the organic layout on a predefined set of nodes.",
    "demoPath": "04-tutorial-layout-features/organic-incremental/index.html",
    "thumbnailPath": "resources/image/tutorial4organicincremental.png",
    "category": "tutorial-layout-features",
    "tags": [
      "organic",
      "incremental"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "subset",
      "nodes",
      "set",
      "node-set"
    ],
    "sourcePath": "04-tutorial-layout-features/organic-incremental/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--organic-substructures",
    "name": "Organic Layout with Substructures",
    "summary": "Shows how to configure the layout of substructures in the organic layout.",
    "demoPath": "04-tutorial-layout-features/organic-substructures/index.html",
    "thumbnailPath": "resources/image/tutorial4organicsubstructures.png",
    "category": "tutorial-layout-features",
    "tags": [
      "organic",
      "substructures"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout"
    ],
    "sourcePath": "04-tutorial-layout-features/organic-substructures/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--edgerouter",
    "name": "Edge Router",
    "summary": "Shows common configuration options for the edge routing algorithm.",
    "demoPath": "04-tutorial-layout-features/edge-router/index.html",
    "thumbnailPath": "resources/image/tutorial4edgerouter.png",
    "category": "tutorial-layout-features",
    "tags": [
      "router"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "orthogonal",
      "octilinear",
      "port-candidates",
      "edge-grouping",
      "scope",
      "routing-style",
      "EdgeRouterEdgeLayoutDescriptor"
    ],
    "sourcePath": "04-tutorial-layout-features/edge-router/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--edge-router-incremental",
    "name": "Incremental Edge Router",
    "summary": "Shows how to run the edge router on a predefined set of edges.",
    "demoPath": "04-tutorial-layout-features/edge-router-incremental/index.html",
    "thumbnailPath": "resources/image/tutorial4edgerouterincremental.png",
    "category": "tutorial-layout-features",
    "tags": [
      "incremental",
      "routing"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "subset",
      "edges",
      "set",
      "edge-set"
    ],
    "sourcePath": "04-tutorial-layout-features/edge-router-incremental/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--edge-router-buses",
    "name": "Edge Router with Buses",
    "summary": "Shows how to configure the edge routing algorithm to produce orthogonal bus-style paths.",
    "demoPath": "04-tutorial-layout-features/edge-router-buses/index.html",
    "thumbnailPath": "resources/image/tutorial4edgerouterbuses.png",
    "category": "tutorial-layout-features",
    "tags": [
      "routing",
      "orthogonal",
      "bus"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "edge router",
      "edgegroups",
      "bus",
      "bus structures",
      "backbone",
      "givenPoints",
      "EdgeRouterBusDescriptor"
    ],
    "sourcePath": "04-tutorial-layout-features/edge-router-buses/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--tree",
    "name": "Tree Layout",
    "summary": "Shows common configuration options for the tree layout.",
    "demoPath": "04-tutorial-layout-features/tree/index.html",
    "thumbnailPath": "resources/image/tutorial4tree.png",
    "category": "tutorial-layout-features",
    "tags": [
      "tree"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "outedgecomparers",
      "portassignment",
      "nodeplacer"
    ],
    "sourcePath": "04-tutorial-layout-features/tree/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--tree-node-placers",
    "name": "Tree Layout with Node Placers",
    "summary": "Shows how to use different node placers in tree layout.",
    "demoPath": "04-tutorial-layout-features/tree-node-placers/index.html",
    "thumbnailPath": "resources/image/tutorial4treenodeplacers.png",
    "category": "tutorial-layout-features",
    "tags": [
      "tree",
      "nodeplacer"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "nodes"
    ],
    "sourcePath": "04-tutorial-layout-features/tree-node-placers/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--orthogonal",
    "name": "Orthogonal Layout",
    "summary": "Shows common configuration options for the orthogonal layout.",
    "demoPath": "04-tutorial-layout-features/orthogonal/index.html",
    "thumbnailPath": "resources/image/tutorial4orthogonal.png",
    "category": "tutorial-layout-features",
    "tags": [
      "orthogonal"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout",
      "directed",
      "halo"
    ],
    "sourcePath": "04-tutorial-layout-features/orthogonal/SampleApplication.js",
    "ts": true
  },
  {
    "id": "tutorial-layout-features--recursive-group-layout",
    "name": "Recursive Group Layout",
    "summary": "Shows how to use different layouts for group nodes using the recursive group layout.",
    "demoPath": "04-tutorial-layout-features/recursive-group-layout/index.html",
    "thumbnailPath": "resources/image/tutorial4recursivegrouplayout.png",
    "category": "tutorial-layout-features",
    "tags": [
      "recursive",
      "groups"
    ],
    "keywords": [
      "v2.4.0.4",
      "tutorial",
      "layout"
    ],
    "sourcePath": "04-tutorial-layout-features/recursive-group-layout/SampleApplication.js",
    "ts": true
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
