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
import {
  GenericLayoutData,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  type IContextLookupChainLink,
  IEdge,
  type IGraph,
  INode,
  LayoutExecutor,
  License,
  Mapper,
  Rect
} from '@yfiles/yfiles'
import { ChordDiagramLayout } from './ChordDiagramLayout'
import { ChordEdgeStyle, type EdgeStyleHints } from './ChordEdgeStyle'
import { CircleSegmentNodeStyle } from './CircleSegmentNodeStyle'
import SampleData from './resources/SampleData'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'

// maps edges to their thickness
const weightMapping = new Mapper<IEdge, number>()
// maps edges to layout specific information
const edgeStyleHints = new Mapper<IEdge, EdgeStyleHints>()

let edgeHighlightDecoratorLookupChainLink: IContextLookupChainLink | undefined

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  LayoutExecutor.ensure()

  License.value = licenseData

  const graphComponent = new GraphComponent('#graphComponent')
  // setup effects of hovering and selecting edges
  configureUserInteraction(graphComponent)

  // configure default styles for newly created graph elements
  initStyles(graphComponent)

  // create an initial sample graph
  createSampleGraph(graphComponent.graph)

  // bind the toolbar components their actions
  initializeUI(graphComponent)

  // layout the graph
  runLayout(graphComponent)

  // center the diagram
  await graphComponent.fitGraphBounds()
}

/**
 * Prevents interactive editing and registers hover and selection effects.
 */
function configureUserInteraction(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph
  const manager = graphComponent.graphModelManager

  // create an input mode that generally does not allow modifying the graph
  const gvim = new GraphViewerInputMode()
  // set edges as selectable
  gvim.selectableItems = GraphItemTypes.EDGE
  // set which items are hoverable
  gvim.itemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

  gvim.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    // reset opacities of all edges
    graph.edges.forEach((edge) => {
      edge.tag.opacity = ChordEdgeStyle.defaultOpacity
    })

    // if hovered on a node, highlight all edges of this node
    if (evt.item instanceof INode) {
      const node = evt.item
      graph.edgesAt(node).forEach((edge) => {
        edge.tag.opacity = 1.0
        manager.toFront(edge)
      })
    }
    // if hovered on an edge, make it opaque
    else if (evt.item instanceof IEdge) {
      const edge = evt.item
      edge.tag.opacity = 1.0
      manager.toFront(edge)
    }
    graphComponent.invalidate()
  })

  // when the selected edge changes, the toolbar slider needs to reflect the thickness of the current edge
  graphComponent.selection.addEventListener('item-added', (evt) => {
    if (evt.item instanceof IEdge) {
      const label = document.querySelector<HTMLElement>('#thickness-label')!
      const slider = document.querySelector<HTMLInputElement>('#thickness')!
      const edge = evt.item
      edge.tag.highlighted = true
      manager.toFront(edge)
      slider.value = String(weightMapping.get(edge))
      slider.disabled = false
      slider.classList.remove('disabled-control')
      label.classList.remove('disabled-control')

      // deselect all other edges
      graphComponent.selection.edges
        .filter((e) => e != edge)
        .toList()
        .forEach((e) => graphComponent.selection.remove(e))
    }
  })

  graphComponent.selection.addEventListener('item-removed', (evt) => {
    if (evt.item instanceof IEdge) {
      const label = document.querySelector<HTMLElement>('#thickness-label')!
      const slider = document.querySelector<HTMLInputElement>('#thickness')!
      const edge = evt.item
      edge.tag.highlighted = false
      slider.disabled = graphComponent.selection.edges.size == 0
      slider.classList.add('disabled-control')
      label.classList.add('disabled-control')
    }
  })

  graphComponent.inputMode = gvim
}

/**
 * Configures the look of the graph.
 * @param graphComponent The component containing the graph.
 */
function initStyles(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph
  graph.edgeDefaults.style = new ChordEdgeStyle(edgeStyleHints)
  graph.nodeDefaults.style = new CircleSegmentNodeStyle()

  // hide the default selection for edges
  graph.decorator.edges.selectionRenderer.hide()
  // hide the focus visual for nodes
  graph.decorator.nodes.focusRenderer.hide()
}

/**
 * Creates the sample graph.
 */
function createSampleGraph(graph: IGraph): void {
  const defaultNodeSize = graph.nodeDefaults.size
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    layout: (data) => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height)
  })
  builder.createEdgesSource({ data: SampleData.edges, sourceId: 'from', targetId: 'to' })

  builder.buildGraph()

  graph.edges.forEach((edge) => weightMapping.set(edge, parseFloat(edge.tag.thickness)))
}

/**
 * Shows or hides the visualization of the actual graph structure.
 * @param graphComponent the demo's main graph view.
 * @param enabled if true, the actual graph structure is shown; otherwise it is not.
 */
function showGraph(graphComponent: GraphComponent, enabled: boolean): void {
  const graph = graphComponent.graph
  // if the actual, basic graph is shown, use the standard selection indicators, else hide them.
  if (enabled) {
    if (edgeHighlightDecoratorLookupChainLink) {
      graph.decorator.edges.remove(edgeHighlightDecoratorLookupChainLink)
    }
  } else {
    edgeHighlightDecoratorLookupChainLink = graph.decorator.edges.selectionRenderer.hide()
  }
  // also tell the styles to render additional information
  const edgeStyle = graph.edgeDefaults.style as ChordEdgeStyle
  edgeStyle.showStyleHints = enabled
  const nodeStyle = graph.nodeDefaults.style as CircleSegmentNodeStyle
  nodeStyle.showStyleHints = enabled

  graphComponent.invalidate()
}

/**
 * Sets the given edge weight for the currently selected edges and updates the chord layout.
 * @param graphComponent the demo's main graph view.
 * @param weight the new weight for each of the selected edges.
 */
function updateDiagram(graphComponent: GraphComponent, weight: number): void {
  for (const edge of graphComponent.selection.edges) {
    weightMapping.set(edge, weight)
  }
  runLayout(graphComponent)
}

let currentGapRatio = 0.25

/**
 * Updates the amount of gap to node space of the diagram and re-layouts
 */
function updateGapRatio(graphComponent: GraphComponent, gapRatio: number) {
  currentGapRatio = gapRatio
  runLayout(graphComponent)
}

/**
 * Runs the chord layout.
 */
function runLayout(graphComponent: GraphComponent) {
  const layout = new ChordDiagramLayout()

  // passes the edge thickness and the map with the style hints that has to be filled by the layout algorithm
  const chordDiagramLayoutData = new GenericLayoutData() // create a mapping that for the thickness
  chordDiagramLayoutData.addItemMapping(ChordDiagramLayout.EDGE_WEIGHT_KEY).mapper = weightMapping
  chordDiagramLayoutData.addItemMapping<EdgeStyleHints>(ChordDiagramLayout.STYLE_HINT_KEY).mapper =
    edgeStyleHints
  layout.gapRatio = currentGapRatio
  graphComponent.graph.applyLayout(layout, chordDiagramLayoutData)
}

/**
 * Binds actions to the buttons in the toolbar.
 */
function initializeUI(graphComponent: GraphComponent): void {
  document
    .querySelector<HTMLInputElement>('#toggle-actual-graph')!
    .addEventListener('change', (evt) =>
      showGraph(graphComponent, (evt.target as HTMLInputElement).checked)
    )
  // when the slider is moved, increase/decrease the weight of the edge and update the chord layout
  document
    .querySelector<HTMLInputElement>('#thickness')!
    .addEventListener('input', (evt) =>
      updateDiagram(graphComponent, parseFloat((evt.target as HTMLInputElement).value))
    )
  // when the gap slider is moved increase/decrease the gaps between the nodes
  document
    .querySelector<HTMLInputElement>('#gap-ratio')!
    .addEventListener('input', (evt) =>
      updateGapRatio(graphComponent, parseFloat((evt.target as HTMLInputElement).value))
    )
}

run().then(finishLoading)
