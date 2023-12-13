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
import {
  Class,
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HierarchicLayout,
  IEdge,
  IGraph,
  ILabel,
  ILabelOwner,
  IModelItem,
  INode,
  InteriorLabelModel,
  IPort,
  LayoutExecutor,
  License,
  Point,
  QueryItemToolTipEventArgs,
  Size,
  ToolTipQueryEventArgs
} from 'yfiles'

import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import type { JSONGraph } from 'demo-utils/json-model'
import graphData from './graph-data.json'

let graphComponent: GraphComponent = null!

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    focusableItems: 'all'
  })

  const graph = graphComponent.graph

  // configures default styles for newly created graph elements
  initializeGraph(graph)

  // build the graph from the given data set
  buildGraph(graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graph.applyLayout(new HierarchicLayout({ minimumLayerDistance: 70 }))
  graphComponent.fitGraphBounds()

  // enable now the undo engine to prevent undoing of the graph creation
  graph.undoEngineEnabled = true

  // enable tooltips
  initializeTooltips()

  // wire up screen reader live region
  initializeLiveRegion()

  // bind the buttons to their functionality
  initializeUI()
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder
    .createNodesSource({
      data: graphData.nodeList.filter((item) => !item.isGroup),
      id: (item) => item.id,
      parentId: (item) => item.parentId
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder
    .createEdgesSource({
      data: graphData.edgeList,
      sourceId: (item) => item.source,
      targetId: (item) => item.target
    })
    .edgeCreator.createLabelBinding((item) => item.label)

  graphBuilder.buildGraph()
}

/**
 * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for
 * the {@link MouseHoverInputMode.addQueryToolTipListener QueryToolTip} event of the
 * GraphEditorInputMode using the
 * {@link ToolTipQueryEventArgs} parameter.
 * The {@link ToolTipQueryEventArgs} parameter provides three relevant properties:
 * Handled, QueryLocation, and ToolTip. The Handled property is a flag which indicates
 * whether the tooltip was already set by one of possibly several tooltip providers. The
 * QueryLocation property contains the mouse position for the query in world coordinates.
 * The tooltip is set by setting the ToolTip property.
 */
function initializeTooltips(): void {
  const inputMode = graphComponent.inputMode as GraphEditorInputMode

  // Customize the tooltip's behavior to our liking.
  const mouseHoverInputMode = inputMode.mouseHoverInputMode
  mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
  mouseHoverInputMode.delay = '500ms'
  mouseHoverInputMode.duration = '5s'

  // Register a listener for when a tooltip should be shown.
  inputMode.addQueryItemToolTipListener(
    (_src: object, eventArgs: QueryItemToolTipEventArgs<IModelItem>): void => {
      if (eventArgs.handled) {
        // Tooltip content has already been assigned -> nothing to do.
        return
      }

      // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
      const toolTip = createTooltipContent(eventArgs.item)
      eventArgs.toolTip = toolTip

      // Indicate that the tooltip content has been set.
      eventArgs.handled = true

      // Notify the screen reader about the tooltip
      setLiveRegionContent(toolTip.cloneNode(true) as HTMLElement)
    }
  )
}

/**
 * Populates the {@link GraphComponent.ariaLiveRegion} with the label content of the current item.
 * This causes screen readers to read the label of the currently selected item.
 */
function initializeLiveRegion(): void {
  const selectedLiveElement = document.createElement('p')
  selectedLiveElement.innerHTML = `Label of selected item: <span class="current-item">No label</span>`

  graphComponent.addCurrentItemChangedListener((): void => {
    const currentItem = graphComponent.currentItem
    if (ILabelOwner.isInstance(currentItem)) {
      const label = currentItem.labels.at(0)
      if (label) {
        // Update the live region
        const currentItemElement = selectedLiveElement.querySelector('.current-item')
        currentItemElement!.innerHTML = label.text
        if (selectedLiveElement.parentNode !== graphComponent.ariaLiveRegion) {
          setLiveRegionContent(selectedLiveElement)
        }
      }
    }
  })
}

/**
 * Sets the given element as the current aria-live region content.
 */
function setLiveRegionContent(element: HTMLElement): void {
  const ariaLiveRegion = graphComponent.ariaLiveRegion
  ariaLiveRegion.innerHTML = ''
  ariaLiveRegion.appendChild(element)
}

/**
 * The tooltip may either be a plain string or it can also be a rich HTML element. In this case, we
 * show the latter. We just extract the first label text from the given item and show it as
 * tooltip.
 */
function createTooltipContent(item: IModelItem | null): HTMLDivElement {
  const title = document.createElement('h4')

  // depending on the item, show a different title
  if (INode.isInstance(item)) {
    title.innerHTML = 'Node Tooltip'
  } else if (IEdge.isInstance(item)) {
    title.innerHTML = 'Edge Tooltip'
  } else if (IPort.isInstance(item)) {
    title.innerHTML = 'Port Tooltip'
  } else if (ILabel.isInstance(item)) {
    title.innerHTML = 'Label Tooltip'
  }

  // extract the first label from the item
  let label = ''
  if (INode.isInstance(item) || IEdge.isInstance(item) || IPort.isInstance(item)) {
    if (item.labels.size > 0) {
      label = item.labels.first().text
    }
  } else if (ILabel.isInstance(item)) {
    label = item.text
  }
  const text = document.createElement('p')
  text.innerHTML = label

  // build the tooltip container
  const tooltip = document.createElement('div')
  tooltip.setAttribute('role', 'tooltip')

  tooltip.classList.add('tooltip')
  tooltip.appendChild(title)
  tooltip.appendChild(text)

  return tooltip
}

/**
 * Initializes the defaults for the styling in this demo.
 */
function initializeGraph(graph: IGraph): void {
  initDemoStyles(graph)

  // set the style, label and label parameter for group nodes
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#ff6c00',
    stroke: '2px solid #662b00',
    tabPosition: 'left-leading'
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'left',
    textFill: '#662b00'
  })
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createDefaultParameter()

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(60, 30)
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Binds the buttons in the toolbar to their functionality.
 */
function initializeUI(): void {
  document
    .querySelector<HTMLInputElement>('#atomic-toggle')!
    .addEventListener('click', (): void => {
      graphComponent.ariaLiveRegion.setAttribute(
        'aria-atomic',
        String(document.querySelector<HTMLInputElement>('#atomic-toggle')!.checked)
      )
    })
}

run().then(finishLoading)
