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
  Color,
  ExteriorNodeLabelModel,
  Graph,
  GraphComponent,
  GraphEditorInputMode,
  IGraph,
  LabelStyle,
  License,
  Point,
  Rect,
  Size,
  WebGLGraphModelManager,
  WebGLImageNodeStyle,
  WebGLSelectionIndicatorManager,
  WebGLShapeNodeShape,
  WebGLStroke,
  WebGLTextureRendering
} from '@yfiles/yfiles'
import {
  createCanvasContext,
  createFontAwesomeIcon,
  createUrlIcon
} from '@yfiles/demo-utils/IconCreation'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import {
  addNavigationButtons,
  addOptions,
  checkWebGL2Support,
  finishLoading,
  showLoadingIndicator
} from '@yfiles/demo-resources/demo-page'

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
async function run() {
  if (!checkWebGL2Support()) {
    return
  }

  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')

  initializeFastRendering(graphComponent)

  configureInteraction(graphComponent)

  initializeUI(graphComponent)
}

/**
 * Creates a small sample graph with icons of different image types.
 */
async function createSmallSampleGraph(graphComponent) {
  const graph = new Graph()
  // Place labels centered below the node
  graph.nodeDefaults.labels.layoutParameter = ExteriorNodeLabelModel.BOTTOM
  graph.nodeDefaults.labels.style = new LabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'wrap-word-ellipsis',
    padding: 5
  })
  graphComponent.graph = graph

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
    graph.setStyle(
      graph.createNodeAt({ labels: ['Icon from SVG file'], location: new Point(150 * i, 0) }),
      new WebGLImageNodeStyle({
        image: svgFileIcon,
        imageColor: 'white',
        backgroundFill: color,
        backgroundStroke: 'none',
        textureRendering:
          i % 2 == 0 ? WebGLTextureRendering.SDF : WebGLTextureRendering.INTERPOLATED
      })
    )

    // Create node with icon from SVG data URI
    graph.setStyle(
      graph.createNodeAt({ labels: ['Icon from SVG data URI'], location: new Point(150 * i, 100) }),
      new WebGLImageNodeStyle({
        image: svgDataURIIcon,
        imageColor: 'white',
        backgroundShape: WebGLShapeNodeShape.RECTANGLE,
        backgroundFill: color,
        backgroundStroke: 'none',
        textureRendering:
          i % 2 == 0 ? WebGLTextureRendering.SDF : WebGLTextureRendering.INTERPOLATED
      })
    )

    // Create node with Font Awesome icon
    graph.setStyle(
      graph.createNodeAt({ labels: ['Icon from Font Awesome'], location: new Point(150 * i, 200) }),
      new WebGLImageNodeStyle({
        image: fontAwesomeIcon,
        imageColor: 'white',
        backgroundFill: color,
        backgroundStroke: 'none',
        textureRendering:
          i % 2 == 0 ? WebGLTextureRendering.SDF : WebGLTextureRendering.INTERPOLATED
      })
    )

    // Create node with icon from PNG file
    graph.setStyle(
      graph.createNodeAt({ labels: ['Icon from PNG file'], location: new Point(150 * i, 300) }),
      new WebGLImageNodeStyle({
        image: pngIcon,
        backgroundFill: Color.TRANSPARENT,
        backgroundStroke: new WebGLStroke(Color.TRANSPARENT, 1)
      })
    )

    // Create node with icon and fill/background color
    graph.setStyle(
      graph.createNodeAt({ labels: ['Icon with Fill Color'], location: new Point(150 * i, 400) }),
      new WebGLImageNodeStyle({
        image: svgFileIconGear,
        imageColor: color,
        backgroundFill: Color.DARK_GRAY,
        backgroundStroke: new WebGLStroke(Color.DARK_GRAY, 4),
        textureRendering:
          i % 2 == 0 ? WebGLTextureRendering.SDF : WebGLTextureRendering.INTERPOLATED
      })
    )

    // Create node with icon that keeps its aspect ratio
    graph.setStyle(
      graph.createNode({
        labels: ['Keep Aspect Ratio'],
        layout: new Rect(150 * i - 25, 500, 50, 30)
      }),
      new WebGLImageNodeStyle({
        image: pngIcon,
        backgroundShape: 'rectangle',
        backgroundFill: color,
        backgroundStroke: new WebGLStroke(color, 4),
        preserveAspectRatio: true
      })
    )
  }

  return graph
}

/**
 * Creates graph of 250x400 nodes with random Font Awesome icons and colors.
 */
function createLargeSampleGraph(graphComponent) {
  const graph = new Graph()
  graphComponent.graph = graph

  const ctx = createCanvasContext(128, 128)

  const fontAwesomeIcons = faClasses.map((faClass) => createFontAwesomeIcon(ctx, faClass))

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
      graph.setStyle(
        node,
        new WebGLImageNodeStyle({
          image: fontAwesomeIcons[iconIndex],
          imageColor: iconColors[iconColorIndex],
          backgroundShape:
            Math.random() > 0.5 ? WebGLShapeNodeShape.ELLIPSE : WebGLShapeNodeShape.RECTANGLE,
          backgroundFill: iconColors[colorIndex],
          backgroundStroke:
            Math.random() > 0.5
              ? new WebGLStroke(iconColors[strokeColorIndex], 1)
              : WebGLStroke.NONE,
          textureRendering: WebGLTextureRendering.SDF
        })
      )
    }
  }

  return Promise.resolve(graph)
}

/**
 * Initialize WebGL rendering.
 */
function initializeFastRendering(graphComponent) {
  graphComponent.graphModelManager = new WebGLGraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGLSelectionIndicatorManager()
  graphComponent.focusIndicatorManager.enabled = false
}

/**
 * Configures the interaction behaviour
 */
function configureInteraction(graphComponent) {
  const graphEditorInputMode = new GraphEditorInputMode({ allowCreateEdge: false })

  // Disable moving of individual edge segments
  graphComponent.graph.decorator.edges.positionHandler.hide()

  graphEditorInputMode.addEventListener('node-created', (evt) => {
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
    graphComponent.graph.setStyle(
      node,
      new WebGLImageNodeStyle({
        image: icon,
        imageColor: iconColors[iconColorIndex],
        backgroundFill: iconColors[colorIndex],
        backgroundStroke: new WebGLStroke(iconColors[colorIndex])
      })
    )
  })

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function initializeUI(graphComponent) {
  const sampleSelectElement = document.querySelector('#graph-chooser-box')
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
    void graphComponent.fitGraphBounds()
    sampleSelectElement.disabled = false
  })
  addOptions(sampleSelectElement, 'Different icon types', 'Large graph')
}

run().then(finishLoading)
