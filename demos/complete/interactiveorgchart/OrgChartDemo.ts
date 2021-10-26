/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphInputMode,
  GraphItemTypes,
  GraphOverviewComponent,
  GraphViewerInputMode,
  HoveredItemChangedEventArgs,
  IArrow,
  ICommand,
  IGraph,
  IModelItem,
  INode,
  Key,
  License,
  ModifierKeys,
  PolylineEdgeStyle,
  PopulateItemContextMenuEventArgs,
  ShowFocusPolicy,
  Size,
  TreeBuilder
} from 'yfiles'

import ContextMenu from '../../utils/ContextMenu'
import GraphSearch from '../../utils/GraphSearch'
import ClickablePortsSupport from './ClickablePortsSupport'
import PrintingSupport from '../../utils/PrintingSupport'
import OrgChartPropertiesView from './OrgChartPropertiesView'
import { bindAction, bindCommand, checkLicense, showApp } from '../../resources/demo-app'
import OrgChartData from './resources/OrgChartData'
import OrgChartGraph from './OrgChartGraph'
import loadJson from '../../resources/load-json'
import VuejsNodeStyle from '../../utils/VuejsNodeStyle'

export type Employee = {
  position: string
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

let graphComponent: GraphComponent = null!

/**
 * The overview graph shown alongside the GraphComponent.
 **/
let overviewComponent: GraphOverviewComponent = null!

let orgChartGraph: OrgChartGraph = null!

let graphSearch: OrgChartGraphSearch = null!

let clickablePortsSupport: ClickablePortsSupport = null!

function run(licenseData: object) {
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
  GraphSearch.registerEventListener(document.getElementById('searchBox')!, graphSearch)

  // Populate the graph with the sample data and initialize the OrgChartGraph helper class
  orgChartGraph = new OrgChartGraph(graphComponent, createGraph(OrgChartData))

  graphComponent.graph = orgChartGraph.filteredGraph

  clickablePortsSupport = new ClickablePortsSupport(orgChartGraph)
  clickablePortsSupport.initializeInputMode(graphComponent.inputMode as GraphViewerInputMode)

  createPropertiesView()

  // register toolbar commands
  registerCommands()

  orgChartGraph.applyInitialLayout()

  showApp(graphComponent, overviewComponent)
}

/**
 * Create the properties view that displays the information about the current employee.
 */
function createPropertiesView(): void {
  const propertiesViewElement = document.getElementById('propertiesView')!
  const propertiesView = new OrgChartPropertiesView(
    propertiesViewElement,
    (email: string): void => {
      const nodeForEMail =
        email !== null &&
        orgChartGraph.completeGraph.nodes.find(
          (node: INode) => node.tag != null && email === node.tag.email
        )
      if (nodeForEMail !== null) {
        orgChartGraph.zoomToItem(nodeForEMail as INode)
        graphComponent.focus()
      }
    }
  )

  graphComponent.addCurrentItemChangedListener(() => {
    propertiesView.showProperties(graphComponent.currentItem as INode)
  })
}

/**
 * Initializes the context menu.
 */
function configureContextMenu(): void {
  const inputMode = graphComponent.inputMode as GraphInputMode

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

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  inputMode.addPopulateItemContextMenuListener(
    (sender: any, args: PopulateItemContextMenuEventArgs<IModelItem>) => {
      populateContextMenu(contextMenu, graphComponent, args)
    }
  )

  // Add a listener that closes the menu when the input mode requests this
  inputMode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = (): void => {
    inputMode.contextMenuInputMode.menuClosed()
  }
}

/**
 * Populates the context menu based on the item the mouse hovers over.
 *
 * @param graphComponent The given graphComponent
 * @param contextMenu The context menu.
 * @param args The event args.
 */
function populateContextMenu(
  contextMenu: ContextMenu,
  graphComponent: GraphComponent,
  args: PopulateItemContextMenuEventArgs<IModelItem>
): void {
  // The 'showMenu' property is set to true to inform the input mode that we actually want to show a context menu
  // for this item (or more generally, the location provided by the event args).
  // If you don't want to show a context menu for some locations, set 'false' in this cases.
  args.showMenu = true

  contextMenu.clearItems()

  const node = args.item

  // if we clicked on a node
  if (node instanceof INode) {
    graphComponent.currentItem = node
    // Create the context menu items
    if (orgChartGraph.canExecuteHideParent(node)) {
      contextMenu.addMenuItem('Hide Parent', async () => {
        await orgChartGraph.executeHideParent(node)
        graphSearch.updateSearch((document.getElementById('searchBox') as HTMLInputElement).value)
      })
    }
    if (orgChartGraph.canExecuteShowParent(node)) {
      contextMenu.addMenuItem('Show Parent', async () => {
        await orgChartGraph.executeShowParent(node)
        graphSearch.updateSearch((document.getElementById('searchBox') as HTMLInputElement).value)
      })
    }
    if (orgChartGraph.canExecuteHideChildren(node)) {
      contextMenu.addMenuItem('Hide Children', async () => {
        await orgChartGraph.executeHideChildren(node)
        graphSearch.updateSearch((document.getElementById('searchBox') as HTMLInputElement).value)
        clickablePortsSupport.setCollapsedStyleToChildren(node)
      })
    }
    if (orgChartGraph.canExecuteShowChildren(node)) {
      contextMenu.addMenuItem('Show Children', async () => {
        await orgChartGraph.executeShowChildren(node)
        graphSearch.updateSearch((document.getElementById('searchBox') as HTMLInputElement).value)
        clickablePortsSupport.setExpandStyleToNode(node)
      })
    }

    if (orgChartGraph.canExecuteShowAll()) {
      contextMenu.addMenuItem('Show all', async () => {
        await orgChartGraph.executeShowAll()
        graphSearch.updateSearch((document.getElementById('searchBox') as HTMLInputElement).value)
      })
    }
  } else {
    // no node has been hit
    if (orgChartGraph.canExecuteShowAll())
      contextMenu.addMenuItem('Show all', async () => {
        await orgChartGraph.executeShowAll()
        graphSearch.updateSearch((document.getElementById('searchBox') as HTMLInputElement).value)
      })
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
    ICommand.ZOOM.execute(1.0, graphComponent)
  })

  const kim = (graphComponent.inputMode as GraphViewerInputMode).keyboardInputMode
  const showAllCommand = ICommand.createCommand()
  kim.addCommandBinding(
    showAllCommand,
    () => {
      orgChartGraph.executeShowAll().then(() => {
        graphSearch.updateSearch((document.getElementById('searchBox') as HTMLInputElement).value)
      })
      return true
    },
    () => orgChartGraph.canExecuteShowAll()
  )
  kim.addKeyBinding(Key.MULTIPLY, ModifierKeys.NONE, showAllCommand)
  bindCommand("button[data-command='ShowAll']", showAllCommand, graphComponent, null)

  kim.addKeyBinding({
    key: Key.SUBTRACT,
    execute: () => {
      orgChartGraph.executeHideChildren(graphComponent.currentItem as INode).then(() => {
        graphSearch.updateSearch((document.getElementById('searchBox') as HTMLInputElement).value)
      })
      return true
    },
    canExecute: (): any => orgChartGraph.canExecuteHideChildren(graphComponent.currentItem as INode)
  })
  kim.addKeyBinding({
    key: Key.ADD,
    execute: () => {
      orgChartGraph.executeShowChildren(graphComponent.currentItem as INode).then(() => {
        graphSearch.updateSearch((document.getElementById('searchBox') as HTMLInputElement).value)
      })
      return true
    },
    canExecute: (): any => orgChartGraph.canExecuteShowChildren(graphComponent.currentItem as INode)
  })
  kim.addKeyBinding({
    key: Key.PAGE_DOWN,
    execute: () => {
      orgChartGraph.executeHideParent(graphComponent.currentItem as INode).then(() => {
        graphSearch.updateSearch((document.getElementById('searchBox') as HTMLInputElement).value)
      })
      return true
    },
    canExecute: (): any => orgChartGraph.canExecuteHideParent(graphComponent.currentItem as INode)
  })
  kim.addKeyBinding({
    key: Key.PAGE_UP,
    execute: () => {
      orgChartGraph.executeShowParent(graphComponent.currentItem as INode).then(() => {
        graphSearch.updateSearch((document.getElementById('searchBox') as HTMLInputElement).value)
      })
      return true
    },
    canExecute: (): any => orgChartGraph.canExecuteShowParent(graphComponent.currentItem as INode)
  })

  bindAction("button[data-command='Print']", print)
}

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
    orgChartGraph.zoomToItem(graphComponent.currentItem as INode)
  })

  graphViewerInputMode.itemHoverInputMode.addHoveredItemChangedListener(
    (sender: object, args: HoveredItemChangedEventArgs): void => {
      // we use the highlight manager to highlight hovered items
      const manager = graphComponent.highlightIndicatorManager
      if (args.oldItem) {
        manager.removeHighlight(args.oldItem)
      }
      if (args.item) {
        manager.addHighlight(args.item)
      }
    }
  )
  graphViewerInputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE

  graphComponent.inputMode = graphViewerInputMode
}

const nodeStyleTemplate = `<g>
<use href="#node-dropshadow" x="-10" y="-5"></use>
<rect fill="#FFFFFF" stroke="#C0C0C0" :width="layout.width" :height="layout.height"></rect>
<rect v-if="tag.status === 'present'" :width="layout.width" :height="zoom < 0.4 ? layout.height : zoom < 0.7 ? '10' : '5'" fill="#76b041" class="node-background"></rect>
<rect v-else-if="tag.status === 'busy'" :width="layout.width" :height="zoom < 0.4 ? layout.height : zoom < 0.7 ? '10' : '5'" fill="#ab2346" class="node-background"></rect>
<rect v-else-if="tag.status === 'travel'" :width="layout.width" :height="zoom < 0.4 ? layout.height : zoom < 0.7 ? '10' : '5'" fill="#a367dc" class="node-background"></rect>
<rect v-else-if="tag.status === 'unavailable'" :width="layout.width" :height="zoom < 0.4 ? layout.height : zoom < 0.7 ? '10' : '5'" fill="#c1c1c1" class="node-background"></rect>
<rect v-if="highlighted || selected" fill="transparent" :stroke="highlighted ? '#ff6c00' : '#249ae7'" stroke-width="3"
  :width="layout.width-3" :height="layout.height-3" x="1.5" y="1.5"></rect>
<!--the template for detailNodeStyle-->
<template v-if="zoom >= 0.7">
  <image :xlink:href="'./resources/' + tag.icon + '.svg'" x="15" y="10" width="63.75" height="63.75"></image>
  <image :xlink:href="'./resources/' + tag.status + '_icon.svg'" x="25" y="80" height="15" width="60"></image>
  <g style="font-size:10px; font-family:Roboto,sans-serif; font-weight: 300; fill: #444">
    <text transform="translate(100 25)" style="font-size:16px; fill:#336699">{{tag.name}}</text>
    <!-- use the VuejsNodeStyle svg-text template which supports wrapping -->
    <svg-text x="100" y="35" :width="layout.width - 140" :content="tag.position.toUpperCase()" :line-spacing="0.2" font-size="10" font-family="Roboto,sans-serif" :wrapping="3"></svg-text>
    <text transform="translate(100 72)" >{{tag.email}}</text>
    <text transform="translate(100 88)" >{{tag.phone}}</text>
    <text transform="translate(170 88)" >{{tag.fax}}</text>
  </g>
</template>
<!--the template for intermediateNodeStyle-->
<template v-else-if="zoom >= 0.4">
  <image :xlink:href="'./resources/' + tag.icon + '.svg'" x="15" y="20" width="56.25" height="56.25"/>
  <g style="font-size:15px; font-family:Roboto,sans-serif; fill:#444" width="185">
    <text transform="translate(75 40)" style="font-size:26px; font-family:Roboto,sans-serif; fill:#336699">{{tag.name}}</text>
    <!-- use the VuejsNodeStyle svg-text template which supports wrapping -->
    <svg-text x="75" y="50" :width="layout.width - 85" :content="tag.position.toUpperCase()" :line-spacing="0.2" font-size="15" font-family="Roboto,sans-serif" :wrapping="3"></svg-text>
  </g>
</template>
<!--the template for overviewNodeStyle-->
<template v-else>
  <!--converts a name to an abbreviated name-->
  <text transform="translate(30 50)" style="font-size:40px; font-family:Roboto,sans-serif; fill:#fff; dominant-baseline: central;">
    {{tag.name.replace(/^(.)(\\S*)(.*)/, '$1.$3')}}
  </text>
</template>
</g>`

/**
 * Sets style defaults for nodes and edges.
 */
function registerElementDefaults(graph: IGraph): void {
  // use the VuejsNodeStyle to display the nodes through a svg template
  // in this svg template you can see three styles in three zoom levels
  graph.nodeDefaults.style = new VuejsNodeStyle(nodeStyleTemplate)
  const nodeSize = new Size(285, 100)
  graph.nodeDefaults.size = nodeSize
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })

  graphComponent.svgDefsManager.defs.appendChild(createDropShadowElement(nodeSize))

  // Hide the default highlight in favor of the CSS highlighting from the template styles
  graph.decorator.nodeDecorator.highlightDecorator.hideImplementation()
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
 * @return The complete sample graph of this demo.
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
 * Prints the graph, separated in tiles.
 */
function print(): void {
  const printingSupport = new PrintingSupport()
  printingSupport.tiledPrinting = true
  printingSupport.scale = 0.29
  printingSupport.margin = 1
  printingSupport.tileWidth = 842
  printingSupport.tileHeight = 595
  printingSupport.print(graphComponent, undefined)
}

/**
 * Helper function to draw a round rectangle on a given canvas context.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | null
): void {
  if (!radius) {
    radius = 5
  }
  const roundRectRadius = {
    tl: radius,
    tr: radius,
    br: radius,
    bl: radius
  }
  ctx.beginPath()
  ctx.moveTo(x + roundRectRadius.tl, y)
  ctx.lineTo(x + width - roundRectRadius.tr, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + roundRectRadius.tr)
  ctx.lineTo(x + width, y + height - roundRectRadius.br)
  ctx.quadraticCurveTo(x + width, y + height, x + width - roundRectRadius.br, y + height)
  ctx.lineTo(x + roundRectRadius.bl, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - roundRectRadius.bl)
  ctx.lineTo(x, y + roundRectRadius.tl)
  ctx.quadraticCurveTo(x, y, x + roundRectRadius.tl, y)
  ctx.closePath()
}

/**
 * Creates the drop shadow element for the nodes
 */
function createDropShadowElement(nodeSize: Size): SVGImageElement {
  // pre-render the node's drop shadow using HTML5 canvas rendering
  const canvas = window.document.createElement('canvas')
  canvas.width = nodeSize.width + 30
  canvas.height = nodeSize.height + 30
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  context.fillStyle = 'rgba(0,0,0,0.4)'
  context.filter = 'blur(4px)'
  context.globalAlpha = 0.6
  roundRect(context, 10, 10, nodeSize.width, nodeSize.height, null)
  context.fill()
  const dataUrl = canvas.toDataURL('image/png')
  // put the drop-shadow in an SVG image element
  const image = window.document.createElementNS('http://www.w3.org/2000/svg', 'image')
  image.setAttribute('width', `${canvas.width}`)
  image.setAttribute('height', `${canvas.height}`)
  image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUrl)
  // switch off pointer events on the drop shadow
  image.setAttribute('style', 'pointer-events: none')
  image.setAttribute('id', 'node-dropshadow')
  return image
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
   * @return True if the node matches the text, false otherwise
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

loadJson().then(checkLicense).then(run)
