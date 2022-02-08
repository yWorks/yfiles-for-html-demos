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
import {
  EdgePathLabelModel,
  EdgeSides,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IEdge,
  IGraph,
  ILabel,
  ILabelOwner,
  IModelItem,
  INode,
  InteriorLabelModel,
  IPort,
  License,
  MouseHoverInputMode,
  Point,
  QueryItemToolTipEventArgs,
  Rect,
  Size,
  TimeSpan,
  ToolTipQueryEventArgs
} from 'yfiles'

import { addClass, bindAction, bindCommand, checkLicense, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import { initBasicDemoStyles } from '../../resources/basic-demo-styles'

// @ts-ignore
let graphComponent: GraphComponent = null

/**
 * Bootstraps the demo.
 */
function run(licenseData: object): void {
  License.value = licenseData
  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    focusableItems: 'all'
  })
  graphComponent.graph.undoEngineEnabled = true

  // configures default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph)

  // enable tooltips
  initializeTooltips()

  // wire up screen reader live region
  initializeLiveRegion()

  // add a sample graph
  createGraph()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for
 * the {@link MouseHoverInputMode#addQueryToolTipListener QueryToolTip} event of the
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
  mouseHoverInputMode.delay = TimeSpan.from('500ms')
  mouseHoverInputMode.duration = TimeSpan.from('5s')

  // Register a listener for when a tooltip should be shown.
  inputMode.addQueryItemToolTipListener(
    (src: object, eventArgs: QueryItemToolTipEventArgs<IModelItem>): void => {
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
      const label = currentItem.labels.firstOrDefault()
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

  addClass(tooltip, 'tooltip')
  tooltip.appendChild(title)
  tooltip.appendChild(text)

  return tooltip
}

/**
 * Initializes the defaults for the styling in this tutorial.
 *
 * @param graph The graph.
 */
function initTutorialDefaults(graph: IGraph): void {
  // set styles that are the same for all tutorials
  initBasicDemoStyles(graph)

  // set sizes and locations specific for this tutorial
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Creates a simple sample graph.
 */
function createGraph(): void {
  const graph = graphComponent.graph

  const n1 = graph.createNode(new Rect(126, 0, 50, 30))
  const n2 = graph.createNode(new Rect(126, 72, 50, 30))
  const n3 = graph.createNode(new Rect(75, 147, 50, 30))
  const n4 = graph.createNode(new Rect(177.5, 147, 50, 30))
  const n5 = graph.createNode(new Rect(110, 249, 50, 30))
  const n6 = graph.createNode(new Rect(177.5, 249, 50, 30))
  const n7 = graph.createNode(new Rect(110, 299, 50, 30))
  const n8 = graph.createNode(new Rect(177.5, 299, 50, 30))
  const n9 = graph.createNode(new Rect(110, 359, 50, 30))
  const n10 = graph.createNode(new Rect(20, 299, 50, 30))
  const n11 = graph.createNode(new Rect(20, 440, 50, 30))
  const n12 = graph.createNode(new Rect(110, 440, 50, 30))
  const n13 = graph.createNode(new Rect(20, 515, 50, 30))
  const n14 = graph.createNode(new Rect(80, 515, 50, 30))
  const n15 = graph.createNode(new Rect(140, 515, 50, 30))
  const n16 = graph.createNode(new Rect(20, 569, 50, 30))

  const groupNode = graph.createGroupNode({
    labels: ['Group']
  })
  graph.groupNodes(groupNode, [n5, n6, n7, n8])
  graph.adjustGroupNodeLayout(groupNode)

  graph.createEdge({ source: n1, target: n2, labels: ['Edge 1'] })
  graph.createEdge({ source: n2, target: n3, labels: ['Edge 2'] })
  graph.createEdge({ source: n2, target: n4, labels: ['Edge 3'] })
  graph.createEdge(n3, n5)
  graph.createEdge(n3, n10)
  graph.createEdge(n5, n7)
  graph.createEdge(n7, n9)
  graph.createEdge(n4, n6)
  graph.createEdge(n6, n8)
  graph.createEdge(n10, n11)
  graph.createEdge(n10, n12)
  graph.createEdge(n11, n13)
  graph.createEdge(n13, n16)
  graph.createEdge(n12, n14)
  graph.createEdge(n12, n15)

  graph.nodes.forEach((node: INode, idx: number): void => {
    if (!graph.isGroupNode(node)) {
      graph.addLabel(node, `Node ${idx + 1}`)
    }
  })

  graphComponent.fitGraphBounds()
  graph.undoEngine!.clear()
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
  bindAction('#atomic-toggle', (): void => {
    graphComponent.ariaLiveRegion.setAttribute(
      'aria-atomic',
      String((document.getElementById('atomic-toggle') as HTMLInputElement).checked)
    )
  })
}

// start tutorial
loadJson().then(checkLicense).then(run)
