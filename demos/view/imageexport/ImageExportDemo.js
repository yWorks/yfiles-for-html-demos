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
  EventRecognizers,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GeneralPath,
  GraphComponent,
  GraphEditorInputMode,
  GraphInputMode,
  HandleInputMode,
  HandlePositions,
  IArrow,
  IGraph,
  IHandle,
  IHitTestable,
  ImageNodeStyle,
  Insets,
  IReshapeHandler,
  License,
  MoveInputMode,
  MutableRectangle,
  NodeReshapeHandleProvider,
  ObservableCollection,
  PolylineEdgeStyle,
  Rect,
  RectangleHandle,
  RectangleIndicatorInstaller,
  Size,
  SvgExport
} from 'yfiles'

import PositionHandler from './PositionHandler.js'
import FileSaveSupport from '../../utils/FileSaveSupport.js'
import ServerSideImageExport from './ServerSideImageExport.js'
import ClientSideImageExport from './ClientSideImageExport.js'
import { addClass, bindAction, removeClass, showApp } from '../../resources/demo-app.js'

import { applyDemoTheme } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'
import { BrowserDetection } from '../../utils/BrowserDetection.js'

/**
 * Server URLs for server-side export.
 */
const NODE_SERVER_URL = 'http://localhost:3000'
const JAVA_SERVLET_URL = 'http://localhost:8080/BatikServlet/BatikServlet'

/**
 * Handles the client-sided image export.
 */
const clientSideImageExport = new ClientSideImageExport()

/**
 * Handles the server-sided image export.
 */
const serverSideImageExport = new ServerSideImageExport()

/**
 * The area that will be exported.
 * @type {MutableRectangle}
 */
let exportRect

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  if (window.location.protocol === 'file:') {
    alert(
      'This demo features image export with inlined images. ' +
        'Due to the browsers security settings, images cannot be inlined if the demo is started from the file system. ' +
        'Please start the demo from a web server.'
    )
  }

  // initialize the main GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  initializeInteraction(graphComponent)
  retainAspectRatio(graphComponent.graph)

  initializeGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  // disable the client-side save button in IE9
  const ieVersion = BrowserDetection.ieVersion
  if (ieVersion > 0 && ieVersion <= 9) {
    disableClientSaveButton()
  }

  // enable server-side export in any browser except for IE9 due to limited XHR CORS support
  if (!ieVersion || ieVersion > 9) {
    enableServerSideExportButtons()
  }

  registerCommands(graphComponent)
  showApp(graphComponent)
}

/**
 * Initializes user interaction.
 * Aside from basic editing, this demo provides a visual marker (the 'export rectangle') that
 * determines the area that will be exported. Users may move and resize the marker with their mouse.
 * @param {!GraphComponent} graphComponent The demo's main graph view.
 */
function initializeInteraction(graphComponent) {
  const geim = new GraphEditorInputMode()

  // create the model for the export rectangle, ...
  exportRect = new MutableRectangle(-10, 0, 300, 160)
  // ... visualize it in the canvas, ...
  const installer = new RectangleIndicatorInstaller(exportRect)
  installer.addCanvasObject(
    graphComponent.createRenderContext(),
    graphComponent.backgroundGroup,
    exportRect
  )
  // ... and make it movable and resizable
  addExportRectInputModes(geim)

  // assign the configured input mode to the GraphComponent
  graphComponent.inputMode = geim
}

/**
 * Adds the view modes that handle moving and resizing of the export rectangle.
 * @param {!GraphInputMode} inputMode The demo's main input mode.
 */
function addExportRectInputModes(inputMode) {
  // create a mode that deals with resizing the export rectangle and ...
  const exportHandleInputMode = new HandleInputMode({
    // ensure that this mode takes precedence over most other modes
    // i.e. resizing the export rectangle takes precedence over other interactive editing
    priority: 1
  })
  // ... add it to the demo's main input mode
  inputMode.add(exportHandleInputMode)

  // create handles for resizing the export rectangle and ...
  const newDefaultCollectionModel = new ObservableCollection()
  newDefaultCollectionModel.add(new RectangleHandle(HandlePositions.NORTH_EAST, exportRect))
  newDefaultCollectionModel.add(new RectangleHandle(HandlePositions.NORTH_WEST, exportRect))
  newDefaultCollectionModel.add(new RectangleHandle(HandlePositions.SOUTH_EAST, exportRect))
  newDefaultCollectionModel.add(new RectangleHandle(HandlePositions.SOUTH_WEST, exportRect))
  // ... add the handles to the input mode that is responsible for resizing the export rectangle
  exportHandleInputMode.handles = newDefaultCollectionModel

  // create a mode that deals with moving the export rectangle and ...
  const moveInputMode = new MoveInputMode({
    // create a custom position handler that moves the export rectangle on mouse events
    positionHandler: new PositionHandler(exportRect),
    // create a hit testable that determines if a mouse event occurs 'on' the export rectangle
    // and thus should be handled by this mode
    hitTestable: IHitTestable.create((context, location) => {
      const path = new GeneralPath(5)
      path.appendRectangle(exportRect, false)
      return path.pathContains(location, context.hitTestRadius + 3 / context.zoom)
    }),
    // ensure that this mode takes precedence over the move input mode used for regular graph
    // elements
    priority: 41
  })

  // ... add it to the demo's main input mode
  inputMode.add(moveInputMode)
}

/**
 * Configures node resize behavior to force resize operations to keep the aspect ratio of the
 * respective nodes.
 * @param {!IGraph} graph The demo's graph.
 */
function retainAspectRatio(graph) {
  graph.decorator.nodeDecorator.reshapeHandleProviderDecorator.setFactory(node => {
    const keepAspectRatio = new NodeReshapeHandleProvider(
      node,
      node.lookup(IReshapeHandler.$class),
      HandlePositions.CORNERS
    )
    keepAspectRatio.ratioReshapeRecognizer = EventRecognizers.ALWAYS
    return keepAspectRatio
  })
}

/**
 * Initializes the graph instance and set default styles.
 * @param {!IGraph} graph
 */
function initializeGraph(graph) {
  const newPolylineEdgeStyle = new PolylineEdgeStyle()
  newPolylineEdgeStyle.targetArrow = IArrow.DEFAULT
  graph.edgeDefaults.style = newPolylineEdgeStyle

  const switchStyle = new ImageNodeStyle('./resources/switch.svg')
  const workstationStyle = new ImageNodeStyle('./resources/workstation.svg')

  const labelModel = new ExteriorLabelModel()
  const labelModelParameter1 = labelModel.createParameter(ExteriorLabelModelPosition.SOUTH)
  const labelModelParameter2 = labelModel.createParameter(ExteriorLabelModelPosition.NORTH)

  const n1 = graph.createNode(new Rect(170, 20, 40, 40), switchStyle)
  const n2 = graph.createNode(new Rect(20, 100, 40, 40), workstationStyle)
  const n3 = graph.createNode(new Rect(120, 100, 40, 40), workstationStyle)
  const n4 = graph.createNode(new Rect(220, 100, 40, 40), workstationStyle)
  const n5 = graph.createNode(new Rect(320, 100, 40, 40), workstationStyle)

  graph.createEdge(n1, n2)
  graph.createEdge(n1, n3)
  graph.createEdge(n1, n4)
  graph.createEdge(n1, n5)

  graph.addLabel(n1, 'Switch', labelModelParameter2)
  graph.addLabel(n2, 'Workstation 1', labelModelParameter1)
  graph.addLabel(n3, 'Workstation 2', labelModelParameter1)
  graph.addLabel(n4, 'Workstation 3', labelModelParameter1)
  graph.addLabel(n5, 'Workstation 4', labelModelParameter1)

  // use the workstation as default node style for newly created nodes
  graph.nodeDefaults.style = workstationStyle
}

/**
 * Disables the client-side save button in IE9 and hints to the browser native save option.
 */
function disableClientSaveButton() {
  const clientSaveButton = document.getElementById('clientPngSaveButton')
  clientSaveButton.setAttribute('style', 'display: none')
  const hint = document.createElement('p')
  hint.innerHTML = 'Right-click the image and hit "Save As&hellip;" to save the png file.'
  hint.setAttribute('style', 'margin: 0')
  const container = document.getElementById('outerClientExport')
  const title = container.querySelector('h2')
  title.setAttribute('style', 'margin-bottom: 0;')
  container.insertBefore(hint, document.getElementById('imageContainer'))
  container.insertBefore(hint, document.getElementById('imageContainer'))
}

/**
 * Enables server-side export buttons.
 */
async function enableServerSideExportButtons() {
  // if a server is available, enable the server export button
  const isAliveJava = await isServerAlive(JAVA_SERVLET_URL)
  document.getElementById('BatikServerExportButton').disabled = !isAliveJava

  const isAliveNode = await isServerAlive(NODE_SERVER_URL)
  document.getElementById('NodeServerServerExportButton').disabled = !isAliveNode
}

/**
 * Checks whether or not the given parameters are a valid input for export.
 * @param {number} scale The desired scale factor for the image export.
 * @param {number} margin The desired margins for the image export.
 * @returns {boolean}
 */
function checkInputValues(scale, margin) {
  if (isNaN(scale) || scale <= 0) {
    alert('Scale must be a positive number.')
    return false
  }
  if (isNaN(margin) || margin < 0) {
    alert('Margin must be a non-negative number.')
    return false
  }
  return true
}

/**
 * Requests a server-side export.
 * @param {!string} svgData A string representation of the SVG document to be exported.
 * @param {!Size} size The size of the exported image.
 * @param {!string} url The URL of the service that will convert the given SVG document to a raster image.
 */
function requestServerExport(svgData, size, url) {
  serverSideImageExport.requestFile(url, 'png', svgData, size)
  hidePopup()
}

/**
 * Shows the export dialog for the client-side graph exports.
 * @param {?HTMLImageElement} pngImage The DOM representation of the raster image that is exported.
 */
function showClientExportDialog(pngImage) {
  const saveButton = document.getElementById('clientPngSaveButton')
  const imageContainerInner = document.getElementById('imageContainerInner')
  imageContainerInner.innerHTML = ''

  if (pngImage === null) {
    imageContainerInner.innerHTML = `
<p>
  Image export in IE9 is possible in general, but requires an older version of canvg.<br>
  Please refer to this older Version of the Image Export demo, that used the old version of canvg:
</p>
<p>
  <a href="https://github.com/yWorks/yfiles-for-html-demos/tree/v2.3.0.3/demos/view/imageexport" target="_blank">
  https://github.com/yWorks/yfiles-for-html-demos/tree/v2.3.0.3/demos/view/imageexport</a>
</p>
<p>
  See the index.html and ClientSideImageExport.js for further details.
</p>
`
    saveButton.disabled = true
  } else {
    imageContainerInner.appendChild(pngImage)

    const imageButton = cloneAndReplace(saveButton)
    imageButton.addEventListener(
      'click',
      () => {
        FileSaveSupport.save(pngImage.src, 'graph.png').catch(() => {
          alert(
            'Saving directly to the filesystem is not supported by this browser. Please use the server based export instead.'
          )
        })
      },
      false
    )
  }

  showPopup()
}

/**
 * Checks if the server at the given URL is alive.
 * @param {!string} url The URL of the service to check.
 * @returns {!Promise.<(Response|boolean)>}
 */
function isServerAlive(url) {
  const initObject = {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8'
    },
    body: 'isAlive',
    mode: 'no-cors'
  }

  return fetch(url, initObject).catch(() => Promise.resolve(false))
}

/**
 * Replaces the given element with a clone. This prevents adding multiple listeners to a button.
 * @param {!HTMLElement} element The element to replace.
 * @returns {!HTMLElement}
 */
function cloneAndReplace(element) {
  const clone = element.cloneNode(true)
  element.parentNode.replaceChild(clone, element)
  return clone
}

/**
 * Hides the export dialog.
 */
function hidePopup() {
  addClass(document.getElementById('popup'), 'hidden')
}

/**
 * Shows the export dialog.
 */
function showPopup() {
  removeClass(document.getElementById('popup'), 'hidden')
}

/**
 * Wires up the UI.
 * @param {!GraphComponent} graphComponent The demo's main graph view.
 */
function registerCommands(graphComponent) {
  const inputScale = document.getElementById('scale')
  const inputMargin = document.getElementById('margin')
  const inputUseRect = document.getElementById('useRect')

  bindAction("button[data-command='Export']", async () => {
    const scale = parseFloat(inputScale.value)
    const margin = parseFloat(inputMargin.value)
    if (checkInputValues(scale, margin)) {
      const rectangle = inputUseRect && inputUseRect.checked ? new Rect(exportRect) : null

      if (BrowserDetection.ieVersion === 9) {
        // IE9 requires an older version of canvg, which is not included in this demo anymore.
        // See https://github.com/yWorks/yfiles-for-html-demos/tree/v2.3.0.3/demos/view/imageexport
        // for a compatible version
        showClientExportDialog(null)
      } else {
        // configure export, export the image and show a dialog to save the image
        clientSideImageExport.scale = scale
        clientSideImageExport.margins = new Insets(margin)
        const image = await clientSideImageExport.exportImage(graphComponent.graph, rectangle)
        showClientExportDialog(image)
      }
    }
  })

  bindAction("button[data-command='BatikServerExportButton']", async () => {
    const scale = parseFloat(inputScale.value)
    const margin = parseFloat(inputMargin.value)
    if (checkInputValues(scale, margin)) {
      const rectangle = inputUseRect && inputUseRect.checked ? new Rect(exportRect) : null

      // configure export, export the SVG and show a dialog to download the image
      serverSideImageExport.scale = scale
      serverSideImageExport.margins = new Insets(margin)
      const svg = await serverSideImageExport.exportSvg(graphComponent.graph, rectangle)
      const svgString = SvgExport.exportSvgString(svg.element)
      requestServerExport(svgString, svg.size, JAVA_SERVLET_URL)
    }
  })

  bindAction("button[data-command='NodeServerServerExportButton']", async () => {
    const scale = parseFloat(inputScale.value)
    const margin = parseFloat(inputMargin.value)
    if (checkInputValues(scale, margin)) {
      const rectangle = inputUseRect && inputUseRect.checked ? new Rect(exportRect) : null

      // configure export, export the SVG and show a dialog to download the image
      serverSideImageExport.scale = scale
      serverSideImageExport.margins = new Insets(margin)
      const svg = await serverSideImageExport.exportSvg(graphComponent.graph, rectangle)
      const svgString = SvgExport.exportSvgString(svg.element)
      const svgData = SvgExport.encodeSvgDataUrl(svgString)
      requestServerExport(svgData, svg.size, NODE_SERVER_URL)
    }
  })

  bindAction('#closeButton', hidePopup)
}

// noinspection JSIgnoredPromiseFromCall
run()
