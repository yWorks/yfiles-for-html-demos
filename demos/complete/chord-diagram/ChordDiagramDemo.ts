/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  Class,
  EdgeSelectionIndicatorInstaller,
  GenericLayoutData,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  ICommand,
  IEdge,
  IGraph,
  IMapper,
  INode,
  LayoutExecutor,
  License,
  Rect
} from 'yfiles'
import {
  addClass,
  bindChangeListener,
  bindCommand,
  bindInputListener,
  removeClass,
  showApp
} from '../../resources/demo-app'
import { ChordDiagramLayout } from './ChordDiagramLayout'
import { ChordEdgeStyle } from './ChordEdgeStyle'
import { CircleSegmentNodeStyle } from './CircleSegmentNodeStyle'
import SampleData from './resources/SampleData'

import { applyDemoTheme } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

// this custom layout data will be used to transfer edge weights to the chord diagram layout algorithm
const chordDiagramLayoutData: GenericLayoutData = new GenericLayoutData()
// maps edges to their thickness
let weightMapping: IMapper<IEdge, number>

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  Class.ensure(LayoutExecutor)

  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // setup effects of hovering and selecting edges
  configureUserInteraction(graphComponent)

  // configure default styles for newly created graph elements
  initStyles(graphComponent.graph)

  // create an initial sample graph
  createSampleGraph(graphComponent.graph)

  // bind the toolbar components their commands
  registerCommands(graphComponent)

  // layout the graph
  graphComponent.graph.applyLayout(new ChordDiagramLayout(), chordDiagramLayoutData)

  // center the diagram
  graphComponent.fitGraphBounds()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
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

  gvim.itemHoverInputMode.addHoveredItemChangedListener((sender, evt) => {
    // reset opacities of all edges
    graph.edges.forEach(edge => {
      edge.tag.opacity = ChordEdgeStyle.defaultOpacity
    })

    // if hovered on a node, highlight all edges of this node
    if (evt.item instanceof INode) {
      const node = evt.item
      graph.edgesAt(node).forEach(edge => {
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
  graphComponent.selection.addItemSelectionChangedListener((sender, evt) => {
    if (evt.item instanceof IEdge) {
      const label = document.getElementById('thickness-label') as HTMLElement
      const slider = document.getElementById('thickness') as HTMLInputElement
      const edge = evt.item
      if (evt.itemSelected) {
        edge.tag.highlighted = true
        manager.toFront(edge)
        slider.value = String(weightMapping.get(edge))
        slider.disabled = false
        removeClass(slider, 'disabled-control')
        removeClass(label, 'disabled-control')

        // deselect all other edges
        graphComponent.selection.selectedEdges
          .filter(e => e != edge)
          .toList()
          .forEach(e => graphComponent.selection.setSelected(e, false))
      } else {
        edge.tag.highlighted = false
        slider.disabled = graphComponent.selection.selectedEdges.size == 0
        addClass(slider, 'disabled-control')
        addClass(label, 'disabled-control')
      }
    }
  })

  graphComponent.inputMode = gvim
}

/**
 * Configures the look of the graph.
 * @param graph The graph.
 */
function initStyles(graph: IGraph): void {
  graph.edgeDefaults.style = new ChordEdgeStyle(graph)
  graph.nodeDefaults.style = new CircleSegmentNodeStyle()

  // hide the default selection for edges
  graph.decorator.edgeDecorator.selectionDecorator.hideImplementation()
  // hide the focus visual for nodes
  graph.decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()
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
    layout: data => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height)
  })
  builder.createEdgesSource({
    data: SampleData.edges,
    sourceId: 'from',
    targetId: 'to'
  })

  builder.buildGraph()

  // create a mapping that for the thickness
  weightMapping = chordDiagramLayoutData.addEdgeItemMapping<number>(
    ChordDiagramLayout.EDGE_WEIGHT_KEY
  ).mapper

  graph.edges.forEach(edge => {
    // create initial weights for the edges, these are relative and will be normalized by the layout
    weightMapping.set(edge, parseFloat(edge.tag.thickness))
  })
}

/**
 * Shows or hides the visualization of the actual graph structure.
 * @param graphComponent the demo's main graph view.
 * @param enabled if true, the actual graph structure is shown; otherwise it is not.
 */
function showGraph(graphComponent: GraphComponent, enabled: boolean): void {
  const graph = graphComponent.graph
  const selectionDecorator = graph.decorator.edgeDecorator.selectionDecorator
  // if the actual, basic graph is shown, use the standard selection indicators, else hide them.
  if (enabled) {
    selectionDecorator.setImplementation(new EdgeSelectionIndicatorInstaller())
  } else {
    selectionDecorator.hideImplementation()
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
  const graph = graphComponent.graph
  const layout = new ChordDiagramLayout()

  for (const edge of graphComponent.selection.selectedEdges) {
    weightMapping.set(edge, weight)
  }
  layout.gapRatio = currentGapRatio
  graph.applyLayout(layout, chordDiagramLayoutData)
}

let currentGapRatio = 0.25

/**
 * Updates the amount of gap to node space of the diagram and re-layouts
 * @param graphComponent
 * @param gapRatio
 */
function updateGapRatio(graphComponent: GraphComponent, gapRatio: number) {
  currentGapRatio = gapRatio
  const graph = graphComponent.graph
  const layout = new ChordDiagramLayout()
  layout.gapRatio = currentGapRatio
  graph.applyLayout(layout, chordDiagramLayoutData)
}

/**
 * Binds commands to the buttons in the toolbar.
 */
function registerCommands(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindChangeListener("input[data-command='ToggleShowActualGraph']", enabled =>
    showGraph(graphComponent, enabled)
  )
  // when the slider is moved, increase/decrease the weight of the edge and update the chord layout
  bindInputListener('#thickness', value => updateDiagram(graphComponent, parseFloat(value)))
  // when the gap slider is moved increase/decrease the gaps between the nodes
  bindInputListener('#gap_ratio', value => updateGapRatio(graphComponent, parseFloat(value)))
}

// noinspection JSIgnoredPromiseFromCall
run()
