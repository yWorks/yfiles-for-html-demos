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
import {
  GraphComponent,
  GraphItemTypes,
  GraphOverviewComponent,
  GraphViewerInputMode,
  IArrow,
  ICommand,
  IGraph,
  INode,
  Key,
  License,
  ModifierKeys,
  PolylineEdgeStyle,
  PopulateItemContextMenuEventArgs,
  ShowFocusPolicy,
  Size,
  TemplateNodeStyle,
  TreeBuilder
} from 'yfiles'

import ContextMenu from '../../utils/ContextMenu.js'
import GraphSearch from '../../utils/GraphSearch.js'
import ClickablePortsSupport from './ClickablePortsSupport.js'
import OrgChartPrintingSupport from './OrgChartPrintingSupport.js'
import OrgChartPropertiesView from './OrgChartPropertiesView.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import OrgChartData from './resources/OrgChartData.js'
import OrgChartGraph from './OrgChartGraph.js'
import loadJson from '../../resources/load-json.js'
import VuejsNodeStyle from '../../resources/VuejsNodeStyle.js'

let graphComponent = null

/**
 * The overview graph shown alongside the GraphComponent.
 * @type {GraphOverviewComponent}
 **/
let overviewComponent = null

/**
 * @type {OrgChartGraph}
 */
let orgChartGraph = null

/**
 * @type {OrgChartGraphSearch}
 */
let graphSearch = null

/**
 * @type {OrgChartGraphSearch}
 */
let clickablePortsSupport = null

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  graphComponent.focusIndicatorManager.showFocusPolicy = ShowFocusPolicy.ALWAYS
  graphComponent.selectionIndicatorManager.enabled = false
  graphComponent.focusIndicatorManager.enabled = false

  overviewComponent = new GraphOverviewComponent('overviewComponent')
  overviewComponent.graphComponent = graphComponent

  initializeInputMode()

  // initialize the context Menu
  configureContextMenu()

  graphSearch = new OrgChartGraphSearch(graphComponent)
  GraphSearch.registerEventListener(document.getElementById('searchBox'), graphSearch)

  initializeConverters()

  // Populate the graph with the sample data and initialize the OrgChartGraph helper class
  orgChartGraph = new OrgChartGraph(graphComponent, createGraph(OrgChartData))

  graphComponent.graph = orgChartGraph.filteredGraph

  clickablePortsSupport = new ClickablePortsSupport(orgChartGraph)
  clickablePortsSupport.initializeInputMode(graphComponent.inputMode)

  createPropertiesView()

  // register toolbar commands
  registerCommands()

  orgChartGraph.applyInitialLayout()

  showApp(graphComponent, overviewComponent)
}

/**
 * Create the properties view that displays the information about the current employee.
 */
function createPropertiesView() {
  const propertiesViewElement = document.getElementById('propertiesView')
  const propertiesView = new OrgChartPropertiesView(propertiesViewElement, email => {
    const nodeForEMail =
      email != null &&
      orgChartGraph.completeGraph.nodes.find(node => node.tag != null && email === node.tag.email)
    if (nodeForEMail != null) {
      orgChartGraph.zoomToItem(nodeForEMail)
      graphComponent.focus()
    }
  })

  graphComponent.addCurrentItemChangedListener((sender, args) => {
    propertiesView.showProperties(graphComponent.currentItem)
  })
}

/**
 * Initializes the context menu.
 */
function configureContextMenu() {
  const inputMode = graphComponent.inputMode

  // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, location => {
    if (inputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })

  // Add and event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  inputMode.addPopulateItemContextMenuListener((sender, args) => {
    populateContextMenu(contextMenu, graphComponent, args)
  })

  // Add a listener that closes the menu when the input mode requests this
  inputMode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = () => {
    inputMode.contextMenuInputMode.menuClosed()
  }
}

/**
 * Populates the context menu based on the item the mouse hovers over.
 *
 * @param {GraphComponent} graphComponent The given graphComponent
 * @param {ContextMenu} contextMenu The context menu.
 * @param {PopulateItemContextMenuEventArgs} args The event args.
 */
function populateContextMenu(contextMenu, graphComponent, args) {
  // The 'showMenu' property is set to true to inform the input mode that we actually want to show a context menu
  // for this item (or more generally, the location provided by the event args).
  // If you don't want to show a context menu for some locations, set 'false' in this cases.
  args.showMenu = true

  contextMenu.clearItems()

  const node = INode.isInstance(args.item) ? args.item : null

  // if we clicked on a node
  if (node !== null) {
    graphComponent.currentItem = node
    // Create the context menu items
    if (orgChartGraph.canExecuteHideParent(node)) {
      contextMenu.addMenuItem('Hide Parent', () =>
        orgChartGraph
          .executeHideParent(node)
          .then(() => graphSearch.updateSearch(document.getElementById('searchBox').value))
      )
    }
    if (orgChartGraph.canExecuteShowParent(node)) {
      contextMenu.addMenuItem('Show Parent', () =>
        orgChartGraph
          .executeShowParent(node)
          .then(() => graphSearch.updateSearch(document.getElementById('searchBox').value))
      )
    }
    if (orgChartGraph.canExecuteHideChildren(node)) {
      contextMenu.addMenuItem('Hide Children', () => {
        orgChartGraph
          .executeHideChildren(node)
          .then(() => graphSearch.updateSearch(document.getElementById('searchBox').value))
        clickablePortsSupport.setCollapsedStyleToChildren(node)
      })
    }
    if (orgChartGraph.canExecuteShowChildren(node)) {
      contextMenu.addMenuItem('Show Children', () => {
        orgChartGraph
          .executeShowChildren(node)
          .then(() => graphSearch.updateSearch(document.getElementById('searchBox').value))
        clickablePortsSupport.setExpandStyleToNode(node)
      })
    }

    if (orgChartGraph.canExecuteShowAll()) {
      contextMenu.addMenuItem('Show all', () =>
        orgChartGraph
          .executeShowAll()
          .then(() => graphSearch.updateSearch(document.getElementById('searchBox').value))
      )
    }
  } else {
    // no node has been hit
    if (orgChartGraph.canExecuteShowAll())
      contextMenu.addMenuItem('Show all', () =>
        orgChartGraph
          .executeShowAll()
          .then(() => graphSearch.updateSearch(document.getElementById('searchBox').value))
      )
  }
}

/**
 * Registers the JavaScript commands for the GUI elements, typically the
 * tool bar buttons, during the creation of this application.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindAction("button[data-command='ZoomOriginal']", () => {
    ICommand.ZOOM.execute(1.0, graphComponent)
  })

  const kim = graphComponent.inputMode.keyboardInputMode
  const showAllCommand = ICommand.createCommand()
  kim.addCommandBinding(
    showAllCommand,
    () => {
      orgChartGraph
        .executeShowAll()
        .then(() => graphSearch.updateSearch(document.getElementById('searchBox').value))
    },
    () => orgChartGraph.canExecuteShowAll()
  )
  kim.addKeyBinding(Key.MULTIPLY, ModifierKeys.NONE, showAllCommand)
  bindCommand("button[data-command='ShowAll']", showAllCommand, graphComponent, null)

  kim.addKeyBinding({
    key: Key.SUBTRACT,
    execute: () => {
      orgChartGraph
        .executeHideChildren(graphComponent.currentItem)
        .then(() => graphSearch.updateSearch(document.getElementById('searchBox').value))
    },
    canExecute: () => orgChartGraph.canExecuteHideChildren(graphComponent.currentItem)
  })
  kim.addKeyBinding({
    key: Key.ADD,
    execute: () => {
      orgChartGraph
        .executeShowChildren(graphComponent.currentItem)
        .then(() => graphSearch.updateSearch(document.getElementById('searchBox').value))
    },
    canExecute: () => orgChartGraph.canExecuteShowChildren(graphComponent.currentItem)
  })
  kim.addKeyBinding({
    key: Key.PAGE_DOWN,
    execute: () => {
      orgChartGraph
        .executeHideParent(graphComponent.currentItem)
        .then(() => graphSearch.updateSearch(document.getElementById('searchBox').value))
    },
    canExecute: () => orgChartGraph.canExecuteHideParent(graphComponent.currentItem)
  })
  kim.addKeyBinding({
    key: Key.PAGE_UP,
    execute: () => {
      orgChartGraph
        .executeShowParent(graphComponent.currentItem)
        .then(() => graphSearch.updateSearch(document.getElementById('searchBox').value))
    },
    canExecute: () => orgChartGraph.canExecuteShowParent(graphComponent.currentItem)
  })

  bindAction("button[data-command='Print']", print)
}

/**
 * Initializes the converters for the bindings of the ports style.
 */
function initializeConverters() {
  TemplateNodeStyle.CONVERTERS.orgChartConverters = {
    // Set the converters for the collapsible node styles
    portIconConverter: highlighted => {
      return highlighted ? 'port-icon hover' : 'port-icon'
    },
    // Set the converters for the collapsible node styles
    portIconStateConverter: data => {
      return data && data.collapsed ? 'port-icon port-icon-expand' : 'port-icon port-icon-collapse'
    }
  }
}

function initializeInputMode() {
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
    orgChartGraph.zoomToItem(graphComponent.currentItem)
  })

  graphViewerInputMode.itemHoverInputMode.addHoveredItemChangedListener(function(sender, args) {
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

const nodeStyleTemplate = `<g>
<rect fill="#C0C0C0" :width="layout.width" :height="layout.height" x="2" y="2"></rect>
<rect fill="#FFFFFF" stroke="#C0C0C0" :width="layout.width" :height="layout.height"></rect>
<rect v-if="tag.status === 'present'" :width="layout.width" height="2" fill="#55B757"></rect>
<rect v-else-if="tag.status === 'busy'" :width="layout.width" height="2" fill="#E7527C"></rect>
<rect v-else-if="tag.status === 'travel'" :width="layout.width" height="2" fill="#9945E9"></rect>
<rect v-else-if="tag.status === 'unavailable'" :width="layout.width" height="2" fill="#8D8F91"></rect>
<rect v-if="highlighted || selected" fill="transparent" :stroke="selected ? '#FFBB33' : '#249ae7'" stroke-width="3" 
  :width="layout.width-3" :height="layout.height-3" x="1.5" y="1.5"></rect>
<!--the template for detailNodeStyle-->
<template v-if="zoom >= 0.7">
  <image :xlink:href="'./resources/' + tag.icon + '.svg'" x="15" y="10" width="63.75" height="63.75"></image>
  <image :xlink:href="'./resources/' + tag.status + '_icon.svg'" x="25" y="80" height="15" width="60"></image>
  <g style="font-size:10px; font-family:Roboto,sans-serif; font-weight: 300; fill: #444">
    <text transform="translate(100 25)" style="font-size:16px; fill:#336699">{{tag.name}}</text>   
    <text v-if="tag.position.length < 20"  transform="translate(100 45)" style="text-transform: uppercase; font-weight: 400" >{{tag.position}}</text>  
    <g v-else >
      <!-- cut the position string in two lines -->
      <text  transform="translate(100 45)" style="text-transform: uppercase; font-weight: 400">{{
        tag.position.split(' ').reduce(function(acc, current) {
          if (acc.firstline.length + current.length < 20) {
            acc.firstline = acc.firstline + ' ' + current
          } else {
            acc.secondline = acc.secondline + ' ' + current
          }
          return acc
        }, {firstline: '', secondline: ''}).firstline}}
      </text>  
      <text  transform="translate(100 57)" style=" text-transform: uppercase; font-weight: 400">{{
        tag.position.split(' ').reduce(function(acc, current) {
          if (acc.firstline.length + current.length < 20) {
            acc.firstline = acc.firstline + ' ' + current
          } else {
            acc.secondline = acc.secondline + ' ' + current
          }
          return acc
        }, {firstline: '', secondline: ''}).secondline}}
      </text>  
    </g>
    <text transform="translate(100 72)" >{{tag.email}}</text>
    <text transform="translate(100 88)" >{{tag.phone}}</text>
    <text transform="translate(170 88)" >{{tag.fax}}</text>
  </g>
</template>
<!--the template for intermediateNodeStyle-->
<template v-else-if="zoom >= 0.4">
  <image :xlink:href="'./resources/' + tag.icon + '.svg'" x="15" y="20" width="56.25" height="56.25"></image>
  <g style="font-size:15px; font-family:Roboto,sans-serif; fill:#444" width="185">
    <text transform="translate(75 40)" style="font-size:26px; font-family:Roboto,sans-serif; fill:#336699">{{tag.name}}</text> 
    <text v-if="tag.position.length < 20"  transform="translate(75 70)" style="font-size:15px; font-family:Roboto,sans-serif; text-transform: uppercase; font-weight: 400">{{tag.position}}</text>  
    <g v-else >
      <!-- cut the position string in two lines -->
      <text  transform="translate(75 70)" style="font-size:15px; font-family:Roboto,sans-serif; text-transform: uppercase; font-weight: 400">{{
        tag.position.split(' ').reduce(function(acc, current) {
          if (acc.firstline.length + current.length < 20) {
            acc.firstline = acc.firstline + ' ' + current
          } else {
            acc.secondline = acc.secondline + ' ' + current
          }
          return acc
        }, {firstline: '', secondline: ''}).firstline}}
      </text>   
      <text  transform="translate(75 90)" style="font-size:15px; font-family:Roboto,sans-serif; text-transform: uppercase; font-weight: 400">{{
        tag.position.split(' ').reduce(function(acc, current) {
          if (acc.firstline.length + current.length < 20) {
            acc.firstline = acc.firstline + ' ' + current
          } else {
            acc.secondline = acc.secondline + ' ' + current
          }
          return acc
        }, {firstline: '', secondline: ''}).secondline}}
      </text>  
    </g>
  </g>
</template>
<!--the template for overviewNodeStyle-->
<template v-else>
  <!--converts a name to an abbreviated name-->
  <text transform="translate(30 50)" style="font-size:40px; font-family:Roboto,sans-serif; fill:#336699; dominant-baseline: central;">
    {{tag.name.replace(/^(.)(\\S*)(.*)/, '$1.$3')}}
  </text>
</template>
</g>`
/**
 * Sets style defaults for nodes and edges.
 * @param {IGraph} graph
 */
function registerElementDefaults(graph) {
  // use the VuejsNodeStyle to display the nodes through a svg template
  // in this svg template you can see three styles in three zoom levels
  graph.nodeDefaults.style = new VuejsNodeStyle(nodeStyleTemplate)
  graph.nodeDefaults.size = new Size(285, 100)
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })

  // Hide the default highlight in favor of the CSS highlighting from the template styles
  graph.decorator.nodeDecorator.highlightDecorator.hideImplementation()
}

/**
 * Adds a "parent" reference to all subordinates contained in the source data.
 * The parent reference is needed to create the colleague and parent links
 * in the properties view.
 * @param {Object} nodesSourceItem The source data in JSON format
 */
function addParentReferences(nodesSourceItem) {
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
 * @param {Object} nodesSource The source data in JSON format.
 * @return {IGraph} The complete sample graph of this demo.
 */
function createGraph(nodesSource) {
  addParentReferences(nodesSource[0])

  const treeBuilder = new TreeBuilder()
  registerElementDefaults(treeBuilder.graph)
  treeBuilder.childBinding = 'subordinates'
  treeBuilder.nodesSource = nodesSource
  treeBuilder.buildGraph()

  return treeBuilder.graph
}

/**
 * Prints the graph, separated in tiles.
 */
function print() {
  const printingSupport = new OrgChartPrintingSupport()
  printingSupport.tiledPrinting = true
  printingSupport.scale = 0.29
  printingSupport.margin = 1
  printingSupport.tileWidth = 842
  printingSupport.tileHeight = 595
  printingSupport.print(graphComponent, null)
}

/**
 * Implements the custom graph search for this demo.
 * It matches the search term with the label text and the contents of the tag of the nodes.
 */
class OrgChartGraphSearch extends GraphSearch {
  /**
   * Returns whether the given node is a match when searching for the given text.
   * This method searches the matching string to the labels and the tags of the nodes.
   * @param {INode} node The node to be examined
   * @param {string} text The text to be queried
   * @return {boolean} True if the node matches the text, false otherwise
   */
  matches(node, text) {
    const lowercaseText = text.toLowerCase()
    // the icon property does not have to be matched
    if (
      node.tag &&
      Object.getOwnPropertyNames(node.tag).some(
        prop =>
          prop !== 'icon' &&
          node.tag[prop] &&
          node.tag[prop]
            .toString()
            .toLowerCase()
            .indexOf(lowercaseText) !== -1
      )
    ) {
      return true
    }
    return node.labels.some(label => label.text.toLowerCase().indexOf(lowercaseText) !== -1)
  }
}

loadJson().then(run)
