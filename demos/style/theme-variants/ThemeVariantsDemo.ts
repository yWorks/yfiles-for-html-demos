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
import type { IModelItem, INode, Rect } from 'yfiles'
import {
  DefaultGraph,
  DefaultLabelStyle,
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  ICommand,
  IGraph,
  LabelSnapContext,
  License,
  Point,
  PolylineEdgeStyle,
  ScrollBarVisibility,
  ShapeNodeStyle,
  Theme,
  ThemeVariant
} from 'yfiles'
import { colorSets } from 'demo-resources/demo-colors'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

const graphComponents: GraphComponent[] = []

const graphComponentContainer = document.getElementById('graphComponents')!

const colorPalettes: Record<
  string,
  { primaryColor: string; secondaryColor: string; backgroundColor: string }
> = {
  Blue: {
    primaryColor: colorSets['demo-lightblue'].stroke,
    secondaryColor: colorSets['demo-lightblue'].nodeLabelFill,
    backgroundColor: colorSets['demo-lightblue'].fill
  },
  Orange: {
    primaryColor: colorSets['demo-orange'].stroke,
    secondaryColor: colorSets['demo-orange'].nodeLabelFill,
    backgroundColor: colorSets['demo-orange'].fill
  },
  Green: {
    primaryColor: colorSets['demo-green'].stroke,
    secondaryColor: colorSets['demo-green'].nodeLabelFill,
    backgroundColor: colorSets['demo-green'].fill
  },
  Purple: {
    primaryColor: colorSets['demo-purple'].stroke,
    secondaryColor: colorSets['demo-purple'].nodeLabelFill,
    backgroundColor: colorSets['demo-purple'].fill
  },
  Yellow: {
    primaryColor: colorSets['demo-palette-22'].stroke,
    secondaryColor: colorSets['demo-palette-22'].nodeLabelFill,
    backgroundColor: colorSets['demo-palette-22'].fill
  }
}

let sharedGraph: IGraph

let themeScale = 1
let colors = Object.keys(colorPalettes)[0]

async function run(): Promise<void> {
  License.value = await fetchLicense()

  sharedGraph = createSampleGraph()

  initGraphComponents()

  graphComponents[0].fitGraphBounds()

  selectSampleItems()

  initializeUI()
  initColorButtons()
}

/**
 * Creates the GraphComponents with the different themes
 * and adds them to the document.
 *
 * This function is also called if the color or scale changes
 * to re-build the GraphComponents with the new theme.
 */
function initGraphComponents() {
  // re-build: keep the old selection and viewport
  const oldViewport: Rect | undefined = graphComponents[0]?.viewport
  const oldSelectedItems: IModelItem[] = graphComponents[0]?.selection.toArray() ?? []

  // re-build: remove and dispose the existing GraphComponents, first
  while (graphComponents.length) {
    const graphComponent = graphComponents.pop()!
    graphComponent.div.parentNode!.removeChild(graphComponent.div)
    // since we keep the graph we need to clear the reference on the old graph component
    graphComponent.graph = new DefaultGraph()
    graphComponent.cleanUp()
  }

  // one of each variant
  for (const variant of [
    ThemeVariant.SIMPLE_ROUND,
    ThemeVariant.SIMPLE_SQUARE,
    ThemeVariant.CLASSIC
  ]) {
    createGraphComponent(
      new Theme({
        variant,
        ...colorPalettes[colors],
        scale: themeScale
      })
    )
  }

  // classic with default colors
  createGraphComponent(
    new Theme({
      variant: 'classic',
      scale: themeScale
    })
  )

  // re-build: restore the old viewport
  if (oldViewport) {
    for (const graphComponent of graphComponents) {
      graphComponent.fitContent()
      graphComponent.zoomTo(oldViewport)
    }
  }

  // re-build: restore the old selection
  for (const selectedItem of oldSelectedItems) {
    for (const graphComponent of graphComponents) {
      graphComponent.selection.setSelected(selectedItem, true)
    }
  }

  synchronizeGraphComponents()
}

/**
 * Creates a GraphComponent with the given theme and the shared graph and selection.
 */
function createGraphComponent(theme: Theme): void {
  const graphComponent = new GraphComponent({ theme })
  graphComponentContainer.appendChild(graphComponent.div)
  graphComponent.graph = sharedGraph
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    allowReparentNodes: true,
    snapContext: new GraphSnapContext(),
    labelSnapContext: new LabelSnapContext()
  })
  graphComponent.horizontalScrollBarPolicy = ScrollBarVisibility.ALWAYS
  graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.ALWAYS
  graphComponents.push(graphComponent)
}
let changing = false

/**
 * Synchronizes the graph components so that changes in one will be mirrored in the others.
 */
function synchronizeGraphComponents(): void {
  for (const graphComponent of graphComponents) {
    const otherComponents = graphComponents.filter(g => g !== graphComponent)
    graphComponent.addUpdatedVisualListener(() => {
      for (const otherComponent of otherComponents) {
        otherComponent.invalidate()
      }
    })
    graphComponent.addViewportChangedListener(() => {
      if (!changing) {
        changing = true
        for (const otherComponent of otherComponents) {
          if (!otherComponent.viewport.equals(graphComponent.viewport)) {
            otherComponent.zoomTo(graphComponent.viewport)
          }
        }
        changing = false
      }
    })
    graphComponent.selection.addItemSelectionChangedListener((_, evt) => {
      for (const otherComponent of otherComponents) {
        otherComponent.selection.setSelected(evt.item, evt.itemSelected)
      }
    })
  }
}

/**
 * Creates a sample graph.
 */
function createSampleGraph(): IGraph {
  const graph = new DefaultGraph()

  graph.nodeDefaults.style = new ShapeNodeStyle({ fill: '#CCCCCC', stroke: 'none' })
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({ insets: 2 })
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({ insets: 5 }).createParameter(
    'south'
  )
  graph.groupNodeDefaults.style = new ShapeNodeStyle({ fill: '#EEEEEE', stroke: 'none' })
  graph.groupNodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('north')
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({ insets: 2 })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '#AAAAAA',
    targetArrow: '#AAAAAA small triangle'
  })
  graph.edgeDefaults.labels.style = new DefaultLabelStyle({ insets: 2 })

  const node1 = graph.createNodeAt({ location: [20, 110] })
  const node2 = graph.createNodeAt({ location: [120, 145] })
  const node3 = graph.createNodeAt({ location: [120, 75] })
  const node4 = graph.createNodeAt({ location: [220, 30], labels: ['Node'] })
  const node5 = graph.createNodeAt({ location: [220, 100], labels: ['Node'] })

  graph.groupNodes({ children: [node1, node2, node3], labels: ['Group'] })

  const edge1 = graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node1, node3)
  const edge3 = graph.createEdge(node3, node4)
  const edge4 = graph.createEdge(node3, node5)
  const edge5 = graph.createEdge(node1, node5)
  graph.setPortLocation(edge1.sourcePort!, new Point(40, 123.33))
  graph.setPortLocation(edge1.targetPort!, new Point(100, 145))
  graph.setPortLocation(edge2.sourcePort!, new Point(40, 96.67))
  graph.setPortLocation(edge2.targetPort!, new Point(100, 75))
  graph.setPortLocation(edge3.sourcePort!, new Point(140, 65))
  graph.setPortLocation(edge3.targetPort!, new Point(200, 30))
  graph.setPortLocation(edge4.sourcePort!, new Point(140, 85))
  graph.setPortLocation(edge4.targetPort!, new Point(200, 90))
  graph.setPortLocation(edge5.sourcePort!, new Point(40, 110))
  graph.setPortLocation(edge5.targetPort!, new Point(200, 110))
  graph.addBends(edge1, [new Point(70, 123.33), new Point(70, 145)])
  graph.addBends(edge2, [new Point(70, 96.67), new Point(70, 75)])
  graph.addBends(edge3, [new Point(170, 65), new Point(170, 30)])
  graph.addBends(edge4, [new Point(170, 85), new Point(170, 90)])

  return graph
}

/**
 * Selects some items for illustration, but only if no elements are currently selected.
 */
function selectSampleItems(): void {
  const selection = graphComponents[0].selection
  if (selection.some()) {
    // Something is already selected, don't change it
    return
  }

  const node = sharedGraph.nodes.at(0)!
  if (node == null) {
    return
  }

  selection.setSelected(node, true)
  for (const edge of graphComponents[0].graph.edgesAt(node)) {
    selection.setSelected(edge, true)
    const opposite = edge.opposite(node) as INode
    if (opposite.labels.some()) {
      selection.setSelected(opposite.labels.at(0)!, true)
    }
  }
}

function initColorButtons(): void {
  const toolbar = document.querySelector('.demo-page__toolbar')!
  Object.keys(colorPalettes).forEach(paletteName => {
    const palette = colorPalettes[paletteName]
    const button = document.createElement('button')
    button.style.backgroundColor = palette.secondaryColor
    button.className = 'color-button'
    button.textContent = paletteName
    button.title = `${paletteName} Color Palette`
    button.addEventListener('click', () => {
      colors = paletteName
      initGraphComponents()
      selectSampleItems()
    })
    toolbar.appendChild(button)
  })
}

/**
 * Binds actions the buttons in the tutorial's toolbar.
 */
function initializeUI(): void {
  document.querySelector("[data-command='FIT_GRAPH_BOUNDS']")!.addEventListener('click', () => {
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponents[0])
  })

  document.querySelector("[data-command='ZOOM_ORIGINAL']")!.addEventListener('click', () => {
    ICommand.ZOOM.execute(1.0, graphComponents[0])
  })

  document.querySelector('#scale-slider')!.addEventListener('input', (e: Event) => {
    const target = e.target as HTMLInputElement
    themeScale = parseFloat(target.value)
    initGraphComponents()
  })
}

run().then(finishLoading)
