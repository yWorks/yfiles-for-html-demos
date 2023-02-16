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
  Color,
  DefaultGraph,
  DefaultLabelStyle,
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IGraph,
  License,
  Point,
  Rect,
  Size,
  WebGL2GraphModelManager,
  WebGL2IconNodeStyle,
  WebGL2SelectionIndicatorManager,
  WebGL2ShapeNodeShape,
  WebGL2Stroke,
  WebGL2TextureRendering
} from 'yfiles'
import {
  addNavigationButtons,
  addOptions,
  bindCommand,
  checkWebGL2Support,
  showApp,
  showLoadingIndicator
} from '../../resources/demo-app'
import { createCanvasContext, createFontAwesomeIcon, createUrlIcon } from '../../utils/IconCreation'
import { fetchLicense } from '../../resources/fetch-license'

// Some selected colors to colorize the icons
const iconColors = [
  Color.from('#DB3A34'),
  Color.from('#F0C808'),
  Color.from('#4281A4'),
  Color.from('#242265'),
  Color.from('#56926E')
]

// the font awesome classes used in this sample
const faClasses = [
  'fas fa-anchor',
  'fab fa-angellist',
  'fas fa-angle-double-right',
  'fas fa-arrow-alt-circle-down',
  'fas fa-baby-carriage',
  'fas fa-basketball-ball',
  'fas fa-bell',
  'fas fa-book-reader',
  'fas fa-bug',
  'fas fa-camera-retro'
]

// the "graph loading" indicator element
async function run(): Promise<void> {
  if (!checkWebGL2Support()) {
    showApp()
    return
  }

  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')

  initializeFastRendering(graphComponent)

  configureInteraction(graphComponent)

  initializeUI(graphComponent)

  showApp(graphComponent)
}

/**
 * Creates a small sample graph with icons of different image types.
 */
async function createSmallSampleGraph(graphComponent: GraphComponent): Promise<IGraph> {
  const graph = new DefaultGraph() as IGraph
  // Place labels centered below the node
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'word-ellipsis',
    insets: 5
  })
  graphComponent.graph = graph

  const webGL2GraphModelManager = graphComponent.graphModelManager as WebGL2GraphModelManager
  const ctx = createCanvasContext(128, 128)

  // Pre-created icons because they are shared between several nodes and have to be created in
  // asynchronous code

  // Create icon from SVG file
  const svgFileIcon = await createUrlIcon(ctx, './resources/play-16.svg', new Size(16, 16))
  // Create icon from SVG data URI
  const svgDataURIIcon = await createUrlIcon(
    ctx,
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAuNSAxNi41IDE2IDE2IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAuNSAxNi41IDE2IDE2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPiAgICANCiAgICA8cG9seWdvbiBmaWxsPSIjZmZmZmZmIiBwb2ludHM9IjMuNSwyNS41IDcuNSwyOS41IDE0LjUsMjEuNSAxNC41LDE4LjUgNy41LDI2LjUgMy41LDIyLjUgICIvPg0KPC9nPg0KPC9zdmc+DQo=',
    new Size(16, 16)
  )
  // Create Font Awesome icon
  const fontAwesomeIcon = createFontAwesomeIcon(ctx, 'fas fa-anchor')
  // Create icon from PNG file
  const pngIcon = await createUrlIcon(ctx, './resources/usericon.png', new Size(256, 256))
  // Create another icon from SVG file
  const svgFileIconGear = await createUrlIcon(ctx, './resources/settings-16.svg', new Size(16, 16))

  for (let i = 0; i < iconColors.length; i++) {
    const color = iconColors[i]

    // Create node with icon from SVG file
    webGL2GraphModelManager.setStyle(
      graph.createNodeAt({
        labels: ['Icon from SVG file'],
        location: new Point(150 * i, 0)
      }),
      new WebGL2IconNodeStyle({
        icon: svgFileIcon,
        fill: color,
        iconColor: 'white',
        textureRendering:
          i % 2 == 0 ? WebGL2TextureRendering.SDF : WebGL2TextureRendering.INTERPOLATED,
        stroke: 'none'
      })
    )

    // Create node with icon from SVG data URI
    webGL2GraphModelManager.setStyle(
      graph.createNodeAt({
        labels: ['Icon from SVG data URI'],
        location: new Point(150 * i, 100)
      }),
      new WebGL2IconNodeStyle({
        icon: svgDataURIIcon,
        shape: WebGL2ShapeNodeShape.RECTANGLE,
        iconColor: 'white',
        fill: color,
        textureRendering:
          i % 2 == 0 ? WebGL2TextureRendering.SDF : WebGL2TextureRendering.INTERPOLATED,
        stroke: 'none'
      })
    )

    // Create node with Font Awesome icon
    webGL2GraphModelManager.setStyle(
      graph.createNodeAt({
        labels: ['Icon from Font Awesome'],
        location: new Point(150 * i, 200)
      }),
      new WebGL2IconNodeStyle({
        icon: fontAwesomeIcon,
        fill: color,
        iconColor: 'white',
        textureRendering:
          i % 2 == 0 ? WebGL2TextureRendering.SDF : WebGL2TextureRendering.INTERPOLATED,
        stroke: 'none'
      })
    )

    // Create node with icon from PNG file
    webGL2GraphModelManager.setStyle(
      graph.createNodeAt({
        labels: ['Icon from PNG file'],
        location: new Point(150 * i, 300)
      }),
      new WebGL2IconNodeStyle({
        icon: pngIcon,
        fill: Color.TRANSPARENT,
        stroke: new WebGL2Stroke(Color.TRANSPARENT, 1)
      })
    )

    // Create node with icon and fill/background color
    webGL2GraphModelManager.setStyle(
      graph.createNodeAt({
        labels: ['Icon with Fill Color'],
        location: new Point(150 * i, 400)
      }),
      new WebGL2IconNodeStyle({
        icon: svgFileIconGear,
        fill: Color.DARK_GRAY,
        textureRendering:
          i % 2 == 0 ? WebGL2TextureRendering.SDF : WebGL2TextureRendering.INTERPOLATED,
        stroke: new WebGL2Stroke(Color.DARK_GRAY, 4),
        iconColor: color
      })
    )

    // Create node with icon that keeps its aspect ratio
    webGL2GraphModelManager.setStyle(
      graph.createNode({
        labels: ['Keep Aspect Ratio'],
        layout: new Rect(150 * i - 25, 500, 50, 30)
      }),
      new WebGL2IconNodeStyle({
        icon: pngIcon,
        shape: 'rectangle',
        fill: color,
        stroke: new WebGL2Stroke(color, 4),
        preserveAspectRatio: true
      })
    )
  }

  return graph
}

/**
 * Creates graph of 250x400 nodes with random Font Awesome icons and colors.
 */
function createLargeSampleGraph(graphComponent: GraphComponent): Promise<IGraph> {
  const graph = new DefaultGraph()
  graphComponent.graph = graph

  const ctx = createCanvasContext(128, 128)
  const webGL2GraphModelManager = graphComponent.graphModelManager as WebGL2GraphModelManager

  const fontAwesomeIcons = faClasses.map(faClass => createFontAwesomeIcon(ctx, faClass))

  for (let i = 0; i < 400; i++) {
    for (let k = 0; k < 250; k++) {
      const iconIndex = Math.floor(Math.random() * fontAwesomeIcons.length)
      // select a random color for the node
      const colorIndex = Math.floor(Math.random() * iconColors.length)
      let iconColorIndex = colorIndex
      // select a different random color for the icon
      while (iconColorIndex === colorIndex) {
        iconColorIndex = Math.floor(Math.random() * iconColors.length)
      }

      let strokeColorIndex = colorIndex
      // select a different random color for the icon
      while (strokeColorIndex === colorIndex) {
        strokeColorIndex = Math.floor(Math.random() * iconColors.length)
      }

      const node = graph.createNodeAt(new Point(i * 50, k * 50))
      webGL2GraphModelManager.setStyle(
        node,
        new WebGL2IconNodeStyle({
          shape:
            Math.random() > 0.5 ? WebGL2ShapeNodeShape.ELLIPSE : WebGL2ShapeNodeShape.RECTANGLE,
          fill: iconColors[colorIndex],
          stroke:
            Math.random() > 0.5
              ? new WebGL2Stroke(iconColors[strokeColorIndex], 1)
              : WebGL2Stroke.NONE,
          icon: fontAwesomeIcons[iconIndex],
          textureRendering: WebGL2TextureRendering.SDF,
          iconColor: iconColors[iconColorIndex]
        })
      )
    }
  }

  return Promise.resolve(graph)
}

/**
 * Initialize WebGL2 rendering.
 */
function initializeFastRendering(graphComponent: GraphComponent) {
  graphComponent.graphModelManager = new WebGL2GraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager()
  graphComponent.focusIndicatorManager.enabled = false
}

/**
 * Configures the interaction behaviour
 */
function configureInteraction(graphComponent: GraphComponent) {
  // For calling WebGL2 specific methods, we use the WebGLGraphModelManager set on the GraphComponent.
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager

  const graphEditorInputMode = new GraphEditorInputMode({
    allowCreateEdge: false,
    allowGroupingOperations: true,
    marqueeSelectableItems: GraphItemTypes.NODE | GraphItemTypes.BEND,
    //Completely disable handles for ports and edges
    showHandleItems: GraphItemTypes.ALL & ~GraphItemTypes.PORT & ~GraphItemTypes.EDGE
  })
  // Disable moving of individual edge segments
  graphComponent.graph.decorator.edgeDecorator.positionHandlerDecorator.hideImplementation()

  graphEditorInputMode.addNodeCreatedListener((sender, evt) => {
    const node = evt.item
    const faClass = faClasses[Math.floor(Math.random() * faClasses.length)]
    const ctx = createCanvasContext(128, 128)
    const icon = createFontAwesomeIcon(ctx, faClass)
    // select a random color for the node
    const colorIndex = Math.floor(Math.random() * iconColors.length)
    let iconColorIndex = colorIndex
    // select a different random color for the icon
    while (iconColorIndex === colorIndex) {
      iconColorIndex = Math.floor(Math.random() * iconColors.length)
    }
    gmm.setStyle(
      node,
      new WebGL2IconNodeStyle({
        fill: iconColors[colorIndex],
        stroke: new WebGL2Stroke(iconColors[colorIndex]),
        icon: icon,
        iconColor: iconColors[iconColorIndex]
      })
    )
  })

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function initializeUI(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  const sampleSelectElement = document.querySelector<HTMLSelectElement>('#graphChooserBox')!
  addNavigationButtons(sampleSelectElement)
  sampleSelectElement.addEventListener('change', async () => {
    sampleSelectElement.disabled = true
    switch (sampleSelectElement.options[sampleSelectElement.selectedIndex].value) {
      default:
      case 'Different icon types':
        await createSmallSampleGraph(graphComponent)
        break
      case 'Large graph':
        await showLoadingIndicator(true, 'Creating 100.000 Font Awesome icons')
        await createLargeSampleGraph(graphComponent)
        await showLoadingIndicator(false)
        break
    }
    graphComponent.fitGraphBounds()
    sampleSelectElement.disabled = false
  })
  addOptions(sampleSelectElement, 'Different icon types', 'Large graph')
}

// noinspection JSIgnoredPromiseFromCall
run()
