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
  addNavigationButtons,
  addOptions,
  bindCommand,
  checkLicense,
  showApp,
  showLoadingIndicator
} from '../../resources/demo-app.js'
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
  WebGL2Stroke
} from 'yfiles'
import loadJson from '../../resources/load-json.js'
import { createFontAwesomeIcon, createUrlIcon } from '../../utils/IconCreation.js'
import { isWebGl2Supported } from '../../utils/Workarounds.js'

const iconSize = new Size(128, 128)

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
/**
 * @param {!object} licenseData
 */
function run(licenseData) {
  if (!isWebGl2Supported()) {
    // show message if the browsers does not support WebGL2
    document.getElementById('no-webgl-support').removeAttribute('style')
    showApp(null)
    return
  }

  License.value = licenseData

  const graphComponent = new GraphComponent('#graphComponent')

  initializeFastRendering(graphComponent)

  configureInteraction(graphComponent)

  initializeUI(graphComponent)

  showApp(graphComponent)
}

/**
 * Creates a small sample graph with icons of different image types.
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise.<IGraph>}
 */
async function createSmallSampleGraph(graphComponent) {
  const graph = new DefaultGraph()
  // Place labels centered below the node
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'word-ellipsis',
    insets: 5
  })
  graphComponent.graph = graph

  const webGL2GraphModelManager = graphComponent.graphModelManager
  const ctx = createCanvasContext(iconSize)

  for (let i = 0; i < iconColors.length; i++) {
    const color = iconColors[i]

    // create icon from SVG file
    const svgFileIcon = await createUrlIcon(
      ctx,
      './resources/play-16.svg',
      new Size(16, 16),
      iconSize
    )
    const svgFileIconNode = graph.createNodeAt({
      location: new Point(150 * i, 0),
      labels: ['Icon from SVG file']
    })
    webGL2GraphModelManager.setStyle(
      svgFileIconNode,
      new WebGL2IconNodeStyle({
        icon: svgFileIcon,
        fill: color,
        stroke: new WebGL2Stroke(color, 4)
      })
    )

    // create icon from SVG data url
    const svgDataURIIcon = await createUrlIcon(
      ctx,
      'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAuNSAxNi41IDE2IDE2IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAuNSAxNi41IDE2IDE2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPiAgICANCiAgICA8cG9seWdvbiBmaWxsPSIjZmZmZmZmIiBwb2ludHM9IjMuNSwyNS41IDcuNSwyOS41IDE0LjUsMjEuNSAxNC41LDE4LjUgNy41LDI2LjUgMy41LDIyLjUgICIvPg0KPC9nPg0KPC9zdmc+DQo=',
      new Size(16, 16),
      iconSize
    )
    const svgDataURIIconNode = graph.createNodeAt({
      location: new Point(150 * i, 100),
      labels: ['Icon from SVG dataURI']
    })
    webGL2GraphModelManager.setStyle(
      svgDataURIIconNode,
      new WebGL2IconNodeStyle({
        icon: svgDataURIIcon,
        shape: WebGL2ShapeNodeShape.RECTANGLE,
        fill: color,
        stroke: new WebGL2Stroke(Color.TRANSPARENT)
      })
    )

    // create font awesome icon
    const fontAwesomeIcon = createFontAwesomeIcon(ctx, 'fas fa-anchor', iconSize)
    const fontAwesomeIconNode = graph.createNodeAt({
      location: new Point(150 * i, 200),
      labels: ['Icon from Font Awesome']
    })
    webGL2GraphModelManager.setStyle(
      fontAwesomeIconNode,
      new WebGL2IconNodeStyle({
        icon: fontAwesomeIcon,
        fill: color,
        stroke: new WebGL2Stroke(Color.TRANSPARENT)
      })
    )

    // create icon from PNG file
    const pngIcon = await createUrlIcon(
      ctx,
      './resources/usericon.png',
      new Size(256, 256),
      iconSize
    )
    const pngIconNode = graph.createNodeAt({
      location: new Point(150 * i, 300),
      labels: ['Icon from PNG file']
    })
    webGL2GraphModelManager.setStyle(
      pngIconNode,
      new WebGL2IconNodeStyle({
        icon: pngIcon,
        fill: Color.TRANSPARENT,
        stroke: new WebGL2Stroke(Color.TRANSPARENT, 1)
      })
    )

    // create colored icon from SVG file
    const coloredSvgFileIcon = await createUrlIcon(
      ctx,
      './resources/settings-16.svg',
      new Size(16, 16),
      iconSize
    )
    const coloredSvgFileIconNode = graph.createNodeAt({
      location: new Point(150 * i, 400),
      labels: ['Icon with Fill Color']
    })
    webGL2GraphModelManager.setStyle(
      coloredSvgFileIconNode,
      new WebGL2IconNodeStyle({
        icon: coloredSvgFileIcon,
        fill: Color.DARK_GRAY,
        stroke: new WebGL2Stroke(Color.DARK_GRAY, 4),
        iconColor: color
      })
    )

    const aspectRatioIconNode = graph.createNode({
      layout: new Rect(150 * i - 25, 500, 50, 30),
      labels: ['Keep Aspect Ratio']
    })
    webGL2GraphModelManager.setStyle(
      aspectRatioIconNode,
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
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise.<IGraph>}
 */
function createLargeSampleGraph(graphComponent) {
  const graph = new DefaultGraph()
  graphComponent.graph = graph

  const ctx = createCanvasContext(iconSize)
  const webGL2GraphModelManager = graphComponent.graphModelManager

  const fontAwesomeIcons = faClasses.map(faClass => createFontAwesomeIcon(ctx, faClass, iconSize))

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

      const node = graph.createNodeAt(new Point(i * 50, k * 50))
      webGL2GraphModelManager.setStyle(
        node,
        new WebGL2IconNodeStyle({
          fill: iconColors[colorIndex],
          stroke: new WebGL2Stroke(iconColors[colorIndex]),
          icon: fontAwesomeIcons[iconIndex],
          iconColor: iconColors[iconColorIndex]
        })
      )
    }
  }

  return Promise.resolve(graph)
}

/**
 * Initialize WebGL2 rendering.
 * @param {!GraphComponent} graphComponent
 */
function initializeFastRendering(graphComponent) {
  graphComponent.graphModelManager = new WebGL2GraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager(graphComponent)
  graphComponent.focusIndicatorManager.enabled = false
}

/**
 * Creates a canvas for rendering and returns its context.
 * @param {!Size} iconSize
 */
function createCanvasContext(iconSize) {
  // canvas used to pre-render the icons
  const canvas = document.createElement('canvas')
  canvas.setAttribute('width', `${iconSize.width}`)
  canvas.setAttribute('height', `${iconSize.height}`)
  return canvas.getContext('2d')
}

/**
 * Configures the interaction behaviour
 * @param {!GraphComponent} graphComponent
 */
function configureInteraction(graphComponent) {
  // For calling WebGL2 specific methods, we use the WebGLGraphModelManager set on the GraphComponent.
  const gmm = graphComponent.graphModelManager

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
    const ctx = createCanvasContext(iconSize)
    const icon = createFontAwesomeIcon(ctx, faClass, iconSize)
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
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  const sampleSelectElement = document.querySelector('#graphChooserBox')
  addNavigationButtons(sampleSelectElement)
  sampleSelectElement.addEventListener('change', async evt => {
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
  })
  addOptions(sampleSelectElement, 'Different icon types', 'Large graph')
}

loadJson().then(checkLicense).then(run)
