/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeLabelModel,
  GroupNodeStyle,
  ICommand,
  IEdge,
  IGraph,
  INode,
  License,
  Point,
  RectangleNodeStyle,
  Size
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

let graphComponent: GraphComponent

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  // configures default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph)
  try {
    // load the graph data from the given JSON file
    const graphData = await loadJSON('./GraphData.json')

    // then build the graph with the given data set
    buildGraph(graphComponent.graph, graphData)

    graphComponent.fitGraphBounds()

    // Often, the input data has no layout information at all. In this case you can apply any of the automatic layout
    // algorithms, to automatically layout your input data, e.g. with HierarchicLayout. Make sure to require the
    // relevant modules for example yfiles/view-layout-bridge and yfiles/layout-hierarchic
    // graphComponent.morphLayout(new HierarchicLayout(), '500ms');

    // Finally, enable the undo engine. This prevents undoing of the graph creation
    graphComponent.graph.undoEngineEnabled = true
  } catch (e) {
    alert(e)
  }

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 * How to iterate through the data set and which information are applied to the graph, depends on the structure of
 * the input data. However, the general approach is always the same, i.e. iterating through the data set and
 * calling the graph item factory methods like
 * {@link IGraph.createNode()},
 * {@link IGraph.createGroupNode()},
 * {@link IGraph.createEdge()},
 * {@link IGraph.addLabel()}
 * and other {@link IGraph} functions to apply the given information to the graph model.
 *
 * @param graph The graph.
 * @param graphData The graph data that was loaded from the JSON file.
 * @yjs:keep = groupsSource,nodesSource,edgesSource
 */
function buildGraph(graph: IGraph, graphData: any): void {
  // Store groups and nodes to be accessible by their IDs.
  // It will be easier to assign them as parents or connect them with edges afterwards.
  const groups: { [id: string]: INode } = {}
  const nodes: { [id: string]: INode } = {}

  // Iterate the group data and create the according group nodes.
  graphData.groupsSource.forEach((groupData: any): void => {
    groups[groupData.id] = graph.createGroupNode({
      labels: groupData.label != null ? [groupData.label] : [],
      layout: groupData.layout,
      tag: groupData
    })
  })

  // Iterate the node data and create the according nodes.
  graphData.nodesSource.forEach((nodeData: any): void => {
    const node = graph.createNode({
      labels: nodeData.label != null ? [nodeData.label] : [],
      layout: nodeData.layout,
      tag: nodeData
    })
    if (nodeData.fill) {
      // If the node data specifies an individual fill color, adjust the style.
      const nodeStyle = graph.nodeDefaults.style.clone() as RectangleNodeStyle
      nodeStyle.fill = nodeData.fill
      graph.setStyle(node, nodeStyle)
    }
    nodes[nodeData.id] = node
  })

  // Set the parent groups after all nodes/groups are created.
  graph.nodes.forEach((node: INode): void => {
    if (node.tag.group) {
      graph.setParent(node, groups[node.tag.group])
    }
  })

  // Iterate the edge data and create the according edges.
  graphData.edgesSource.forEach((edgeData: any): void => {
    // Note that nodes and groups need to have disjoint sets of ids, otherwise it is impossible to determine
    // which node is the correct source/target.
    graph.createEdge({
      source: nodes[edgeData.from] || groups[edgeData.from],
      target: nodes[edgeData.to] || groups[edgeData.to],
      labels: edgeData.label != null ? [edgeData.label] : [],
      tag: edgeData
    })
  })

  // If given, apply the edge layout information
  graph.edges.forEach((edge: IEdge): void => {
    const edgeData = edge.tag
    if (edgeData.sourcePort) {
      graph.setPortLocation(edge.sourcePort!, Point.from(edgeData.sourcePort))
    }
    if (edgeData.targetPort) {
      graph.setPortLocation(edge.targetPort!, Point.from(edgeData.targetPort))
    }
    if (edgeData.bends) {
      edgeData.bends.forEach((bendLocation: Point): void => {
        graph.addBend(edge, bendLocation)
      })
    }
  })
}

/**
 * Initializes the defaults for the styling in this tutorial.
 *
 * @param graph The graph.
 */
function initTutorialDefaults(graph: IGraph): void {
  // set styles that are the same for all tutorials
  initDemoStyles(graph)

  // set the style, label and label parameter for group nodes
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#61a044',
    tabPosition: 'left-trailing',
    drawShadow: true,
    tabWidth: 70
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'left',
    textFill: '#eee'
  })
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createDefaultParameter()

  // set sizes and locations specific for this tutorial
  graph.nodeDefaults.size = new Size(40, 40)

  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands(): void {
  bindAction("button[data-command='New']", (): void => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
}

/**
 * Returns a promise that resolves when the JSON file is loaded.
 * In general, this can load other files, like plain text files or CSV files, too. However,
 * before usage you need to parse the file content which is done by JSON.parse in case of a JSON file as
 * demonstrated here.
 *
 * @param url The URL to load.
 * @returns A promise with the loaded data.
 */

async function loadJSON(url: string): Promise<JSON> {
  const response = await fetch(url)
  return response.json()
}

// noinspection JSIgnoredPromiseFromCall
run()
