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
import {
  BaseClass,
  CompactNodePlacer,
  EdgeRouterScope,
  GraphComponent,
  GraphItemTypes,
  GraphOverviewComponent,
  GraphViewerInputMode,
  IArrow,
  ICommand,
  IGraph,
  IModelItem,
  INode,
  Insets,
  ITreeLayoutPortAssignment,
  LayoutGraph,
  License,
  PlaceNodesAtBarycenterStage,
  PolylineEdgeStyle,
  ShowFocusPolicy,
  Size,
  StraightLineEdgeRouter,
  TemplateNodeStyle,
  TreeBuilder,
  TreeLayout,
  TreeLayoutData,
  YNode,
  YPoint
} from 'yfiles'

import GraphSearch from '../../utils/GraphSearch'
import LevelOfDetailNodeStyle from './LevelOfDetailNodeStyle'
import OrgChartPropertiesView from './OrgChartPropertiesView'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app'
import OrgChartData from './resources/OrgChartData'

import { applyDemoTheme } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

export type Employee = {
  position?: string
  name: string
  email: string
  phone: string
  fax: string
  businessUnit: string
  status: string
  icon: string
  subordinates?: Employee[]
  parent?: Employee
}

let graphComponent: GraphComponent

/**
 * The overview graph shown alongside the GraphComponent.
 */
let overviewComponent: GraphOverviewComponent
/**
 * The component for the search in the graph
 */
let graphSearch: OrgChartGraphSearch

async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  graphComponent.focusIndicatorManager.showFocusPolicy = ShowFocusPolicy.ALWAYS
  graphComponent.selectionIndicatorManager.enabled = false
  graphComponent.focusIndicatorManager.enabled = false

  overviewComponent = new GraphOverviewComponent('overviewComponent')
  overviewComponent.graphComponent = graphComponent

  initializeInputMode()

  graphSearch = new OrgChartGraphSearch(graphComponent)
  GraphSearch.registerEventListener(document.getElementById('searchBox')!, graphSearch)

  initializeConverters()

  graphComponent.graph = createGraph(OrgChartData)

  runLayout()

  createPropertiesView()

  // register toolbar commands
  registerCommands()

  showApp(graphComponent, overviewComponent)
}

/**
 * Create the properties view that displays the information about the current employee.
 */
function createPropertiesView(): void {
  const propertiesViewElement = document.getElementById('propertiesView')!
  const propertiesView = new OrgChartPropertiesView(propertiesViewElement, email => {
    const nodeForEMail = graphComponent.graph.nodes.find(
      node => node.tag != null && email === node.tag.email
    )
    if (nodeForEMail !== null) {
      zoomToItem(nodeForEMail)
      graphComponent.focus()
    }
  })

  graphComponent.addCurrentItemChangedListener(() => {
    propertiesView.showProperties(graphComponent.currentItem)
  })
}

/**
 * Focuses the given item.
 */
function zoomToItem(item: IModelItem): void {
  if (item instanceof INode) {
    graphComponent.currentItem = item
    ICommand.ZOOM_TO_CURRENT_ITEM.execute(null, graphComponent)
  }
}

/**
 * Registers the JavaScript commands for the GUI elements, typically the
 * tool bar buttons, during the creation of this application.
 */
function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindAction("button[data-command='ZoomOriginal']", () => {
    ICommand.ZOOM.execute(1, graphComponent)
  })
}

/**
 * Initializes the converters for the bindings of the template node styles.
 */
function initializeConverters(): void {
  TemplateNodeStyle.CONVERTERS.orgChartConverters = {
    // converter function for node border
    borderConverter: (value: any, parameter: any): string => {
      if (typeof value === 'boolean') {
        return value ? '#FFBB33' : 'rgba(0,0,0,0)'
      }
      return '#FFF'
    },
    overviewConverter: (value: any, parameter: any): string => {
      if (typeof value === 'string' && value.length > 0) {
        return value.replace(/^(.)(\S*)(.*)/, '$1.$3')
      }
      return ''
    },
    // converter function that converts a name to an abbreviated name
    intermediateConverter: (value: any, parameter: any): any => {
      if (typeof value === 'string' && value.length > 17) {
        return value.replace(/^(.)(\S*)(.*)/, '$1.$3')
      }
      return value
    },
    // converter function that may convert a name to an abbreviated name
    lineBreakConverter: (value: any, firstline: any): string => {
      if (typeof value === 'string') {
        let copy: string = value
        while (copy.length > 20 && copy.indexOf(' ') > -1) {
          copy = copy.substring(0, copy.lastIndexOf(' '))
        }
        if (firstline === 'true') {
          return copy
        }
        return value.substring(copy.length)
      }
      return ''
    },
    // converter function that adds a hash to a given string and - if present - appends the parameter to it
    addHashConverter: (value: any, parameter: any): any => {
      if (typeof value === 'string') {
        if (typeof parameter === 'string') {
          return `#${value}${parameter}`
        }
        return `#${value}`
      }
      return value
    }
  }
}

/**
 * Initializes the input mode for interaction.
 */
function initializeInputMode(): void {
  const graphViewerInputMode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.PORT,
    selectableItems: GraphItemTypes.NONE,
    marqueeSelectableItems: GraphItemTypes.NONE,
    toolTipItems: GraphItemTypes.NONE,
    contextMenuItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NODE,
    clickHitTestOrder: [GraphItemTypes.PORT, GraphItemTypes.NODE]
  })
  graphViewerInputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE

  graphViewerInputMode.addItemDoubleClickedListener(() => {
    if (!(graphComponent.currentItem instanceof INode)) {
      return
    }
    ICommand.ZOOM_TO_CURRENT_ITEM.execute(null, graphComponent)
  })

  graphViewerInputMode.itemHoverInputMode.addHoveredItemChangedListener(function (sender, args) {
    // we use the highlight manager to highlight hovered items
    const manager = graphComponent.highlightIndicatorManager
    if (args.oldItem) {
      manager.removeHighlight(args.oldItem)
    }
    if (args.item) {
      manager.addHighlight(args.item)
    }
  })
  graphViewerInputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE

  graphComponent.inputMode = graphViewerInputMode
}

/**
 * Sets style defaults for nodes and edges.
 */
function registerElementDefaults(graph: IGraph): void {
  graph.nodeDefaults.style = new LevelOfDetailNodeStyle(
    new TemplateNodeStyle('detailNodeStyleTemplate'),
    new TemplateNodeStyle('intermediateNodeStyleTemplate'),
    new TemplateNodeStyle('overviewNodeStyleTemplate')
  )
  graph.nodeDefaults.size = new Size(285, 100)
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })

  // Hide the default highlight in favor of the CSS highlighting from the template styles
  graph.decorator.nodeDecorator.highlightDecorator.hideImplementation()
}

/**
 * Applies the layout to the graph
 */
function runLayout(): void {
  graphComponent.graph.applyLayout(
    createConfiguredLayout(),
    createConfiguredLayoutData(graphComponent.graph)
  )
  graphComponent.fitGraphBounds()
  limitViewport()
}

/**
 * Creates a tree layout data for the tree layout
 * @returns A configured TreeLayoutData.
 */
function createConfiguredLayoutData(graph: IGraph): TreeLayoutData {
  return new TreeLayoutData({
    assistantNodes: node => node.tag && node.tag.assistant && graph.inDegree(node) > 0,
    nodeTypes: (node: INode) => (node.tag && node.tag.status ? node.tag.status : null)
  })
}

/**
 * Creates a tree layout that handles assistant nodes and stack leaf nodes.
 * @returns A configured TreeLayout.
 */
function createConfiguredLayout(): TreeLayout {
  const treeLayout = new TreeLayout()
  treeLayout.defaultPortAssignment = new (class extends BaseClass(ITreeLayoutPortAssignment) {
    assignPorts(graph: LayoutGraph, node: YNode) {
      const inEdge = node.firstInEdge
      if (inEdge) {
        graph.setTargetPointRel(inEdge, YPoint.ORIGIN)
      }
      const halfHeight = graph.getSize(node).height / 2
      node.outEdges.forEach(outEdge => {
        graph.setSourcePointRel(outEdge, new YPoint(0, halfHeight))
      })
    }
  })()
  // we let the CompactNodePlacer arrange the nodes
  treeLayout.defaultNodePlacer = new CompactNodePlacer()

  // layout stages used to place nodes at barycenter for smoother layout animations
  const edgeRouter = new StraightLineEdgeRouter()
  edgeRouter.scope = EdgeRouterScope.ROUTE_EDGES_AT_AFFECTED_NODES
  treeLayout.appendStage(edgeRouter)
  treeLayout.appendStage(new PlaceNodesAtBarycenterStage())

  return treeLayout
}

/**
 * Setup a ViewportLimiter that makes sure that the explorable region doesn't exceed the graph size.
 */
function limitViewport(): void {
  graphComponent.updateContentRect(new Insets(100))
  const limiter = graphComponent.viewportLimiter
  limiter.honorBothDimensions = false
  limiter.bounds = graphComponent.contentRect
}

/**
 * Adds a "parent" reference to all subordinates contained in the source data.
 * The parent reference is needed to create the colleague and parent links
 * in the properties view.
 * @param nodesSourceItem The source data in JSON format
 */
function addParentReferences(nodesSourceItem: Employee): void {
  const subs = nodesSourceItem.subordinates
  if (subs !== undefined) {
    for (let i = 0; i < subs.length; i++) {
      const sub = subs[i]
      sub.parent = nodesSourceItem
      addParentReferences(sub)
    }
  }
}
/**
 * Creates the sample graph of this demo.
 * @param nodesSource The source data in JSON format.
 * @returns The complete sample graph of this demo.
 */
function createGraph(nodesSource: Employee[]): IGraph {
  addParentReferences(nodesSource[0])

  const treeBuilder = new TreeBuilder()
  registerElementDefaults(treeBuilder.graph)
  // configure the root nodes
  const rootSource = treeBuilder.createRootNodesSource(nodesSource)
  // configure the recursive structure of the children
  rootSource.addChildNodesSource(data => data.subordinates, rootSource)
  treeBuilder.buildGraph()

  return treeBuilder.graph
}

/**
 * Implements the custom graph search for this demo.
 * It matches the search term with the label text and the contents of the tag of the nodes.
 */
class OrgChartGraphSearch extends GraphSearch {
  /**
   * Returns whether the given node is a match when searching for the given text.
   * This method searches the matching string to the labels and the tags of the nodes.
   * @param node The node to be examined
   * @param text The text to be queried
   * @returns True if the node matches the text, false otherwise
   */
  matches(node: INode, text: string): boolean {
    const lowercaseText = text.toLowerCase()
    // the icon property does not have to be matched
    if (
      node.tag &&
      Object.getOwnPropertyNames(node.tag).some(
        prop =>
          prop !== 'icon' &&
          node.tag[prop] &&
          node.tag[prop].toString().toLowerCase().indexOf(lowercaseText) !== -1
      )
    ) {
      return true
    }
    return node.labels.some(label => label.text.toLowerCase().indexOf(lowercaseText) !== -1)
  }
}

// noinspection JSIgnoredPromiseFromCall
run()
