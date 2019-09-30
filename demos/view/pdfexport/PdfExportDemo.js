/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultLabelStyle,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  Font,
  GeneralPath,
  GraphComponent,
  GraphEditorInputMode,
  GraphInputMode,
  HandleInputMode,
  HandlePositions,
  IArrow,
  ICommand,
  IHitTestable,
  ImageNodeStyle,
  Insets,
  License,
  MoveInputMode,
  MutableRectangle,
  ObservableCollection,
  PolylineEdgeStyle,
  Rect,
  RectangleHandle,
  RectangleIndicatorInstaller,
  ShapeNodeStyle,
  Size,
  SvgExport
} from 'yfiles'

import PositionHandler from './PositionHandler.js'
import FileSaveSupport from '../../utils/FileSaveSupport.js'
import ServerSidePdfExport from './ServerSidePdfExport.js'
import ClientSidePdfExport from './ClientSidePdfExport.js'
import {
  addClass,
  bindAction,
  bindChangeListener,
  bindCommand,
  detectInternetExplorerVersion,
  removeClass,
  showApp
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** the server urls */
const NODE_SERVER_URL = 'http://localhost:3001'
const JAVA_SERVLET_URL = 'http://localhost:8080/BatikServlet/BatikServlet'

/** @type {GraphComponent} */
let graphComponent = null

/** @type {ClientSidePdfExport} */
let clientSidePdfExport = null

/** @type {ServerSidePdfExport} */
let serverSidePdfExport = null

/**
 * region that will be exported
 * @type {MutableRectangle}
 */
let exportRect = null

/**
 * detect IE version for x-browser compatibility
 * @type {number}
 */
let ieVersion = -1

async function run(licenseData) {
  License.value = licenseData
  if (window.location.protocol === 'file:') {
    alert(
      'This demo features image export with inlined images. ' +
        'Due to the browsers security settings, images can not be inlined if the demo is started from the file system. ' +
        'Please start the demo from a web server.'
    )
  }

  // initialize the UI's elements
  init()

  initializeInputModes()
  initializeDefaultStyles()
  createNetworkGraph()

  if (ieVersion !== -1 && ieVersion <= 9) {
    // disable client-side export button in IE9 and hide the save buttons
    document.getElementById('ExportButton').disabled = true
    const clientSaveButton = document.getElementById('clientPdfSaveButton')
    clientSaveButton.setAttribute('style', 'display: none')
  }

  // disable server-side export in IE9 due to limited XHR CORS support
  if (ieVersion === -1 || (ieVersion !== -1 && ieVersion > 9)) {
    enableServerSideExportButtons()
  }

  registerCommands()

  showApp(graphComponent)
}

async function enableServerSideExportButtons() {
  // if a server is available, enable the server export button
  const isAliveJava = await isServerAlive(JAVA_SERVLET_URL)
  document.getElementById('BatikServerExportButton').disabled = !isAliveJava

  const isAliveNode = await isServerAlive(NODE_SERVER_URL)
  document.getElementById('NodeServerServerExportButton').disabled = !isAliveNode
}

/**
 * Initializes the UI's elements.
 */
function init() {
  graphComponent = new GraphComponent('graphComponent')

  clientSidePdfExport = new ClientSidePdfExport()
  serverSidePdfExport = new ServerSidePdfExport()

  ieVersion = detectInternetExplorerVersion()
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindChangeListener('#graphChooserBox', value => {
    if (value === 'custom-fonts') {
      createCustomFontGraph()
    } else {
      createNetworkGraph()
    }
  })

  const inputScale = document.getElementById('scale')
  const inputMargin = document.getElementById('margin')
  const inputUseRect = document.getElementById('useRect')

  bindAction("button[data-command='Export']", async () => {
    const scale = parseFloat(inputScale.value)
    const margin = parseFloat(inputMargin.value)
    if (checkInputValues(scale, margin)) {
      const rectangle = inputUseRect && inputUseRect.checked ? new Rect(exportRect) : null

      // configure export, export the image and show a dialog to save the image
      clientSidePdfExport.scale = scale
      clientSidePdfExport.margins = new Insets(margin)
      const { raw, uri } = await clientSidePdfExport.exportPdf(graphComponent.graph, rectangle)
      if (ieVersion !== -1) {
        // disable HTML preview in IE
        FileSaveSupport.save(raw, 'graph.pdf').catch(() => {
          alert(
            'Saving directly to the filesystem is not supported by this browser. Please use the server based export instead.'
          )
        })
      } else {
        showClientExportDialog(raw, uri)
      }
    }
  })

  bindAction("button[data-command='BatikServerExportButton']", async () => {
    const scale = parseFloat(inputScale.value)
    const margin = parseFloat(inputMargin.value)
    if (checkInputValues(scale, margin)) {
      const rectangle = inputUseRect && inputUseRect.checked ? new Rect(exportRect) : null

      // configure export, export the SVG and show a dialog to download the image
      serverSidePdfExport.scale = scale
      serverSidePdfExport.margins = new Insets(margin)
      const pdf = await serverSidePdfExport.exportSvg(graphComponent.graph, rectangle)
      requestServerExport(pdf.element, pdf.size, JAVA_SERVLET_URL)
    }
  })
  bindAction("button[data-command='NodeServerServerExportButton']", async () => {
    const scale = parseFloat(inputScale.value)
    const margin = parseFloat(inputMargin.value)
    if (checkInputValues(scale, margin)) {
      const rectangle = inputUseRect && inputUseRect.checked ? new Rect(exportRect) : null

      // configure export, export the SVG and show a dialog to download the image
      serverSidePdfExport.scale = scale
      serverSidePdfExport.margins = new Insets(margin)
      const pdf = await serverSidePdfExport.exportSvg(graphComponent.graph, rectangle)
      requestServerExport(pdf.element, pdf.size, NODE_SERVER_URL)
    }
  })

  document.getElementById('closeButton').addEventListener(
    'click',
    () => {
      hidePopup()
    },
    false
  )
}

/**
 * Checks whether or not the given parameters are a valid input for export.
 * @param {number} scale
 * @param {number} margin
 * @return {boolean}
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
 * Requests the PDF export from the server.
 * @param {Element} svgElement
 * @param {Size} size
 * @param {string} serverUrl
 */
function requestServerExport(svgElement, size, serverUrl) {
  const svgString = SvgExport.exportSvgString(svgElement)
  serverSidePdfExport.requestFile(serverUrl, 'pdf', svgString, size)

  hidePopup()
}

/**
 * Shows the export dialog for the client-side graph exports.
 * @param {string} raw
 * @param {string} pdfUrl
 */
function showClientExportDialog(raw, pdfUrl) {
  const pdfIframe = document.createElement('iframe')
  pdfIframe.setAttribute('style', 'width: 99%; height: 99%')
  pdfIframe.src = pdfUrl
  const pdfContainerInner = document.getElementById('pdfContainerInner')
  pdfContainerInner.innerHTML = ''
  pdfContainerInner.appendChild(pdfIframe)

  const pdfButton = cloneAndReplace(document.getElementById('clientPdfSaveButton'))
  pdfButton.addEventListener(
    'click',
    () => {
      FileSaveSupport.save(raw, 'graph.pdf').catch(() => {
        alert(
          'Saving directly to the filesystem is not supported by this browser. Please use the server based export instead.'
        )
      })
    },
    false
  )

  showPopup()
}

/**
 * Initializes the input modes.
 */
function initializeInputModes() {
  graphComponent.inputMode = new GraphEditorInputMode()

  // create the model for the export rectangle
  exportRect = new MutableRectangle(-10, 0, 300, 160)

  // visualize it
  const installer = new RectangleIndicatorInstaller(exportRect)
  installer.addCanvasObject(
    graphComponent.createRenderContext(),
    graphComponent.backgroundGroup,
    exportRect
  )

  addExportRectInputModes(graphComponent.inputMode)
}

/**
 * Adds the view modes that handle the resizing and movement of the export rectangle.
 * @param {GraphInputMode} inputMode
 */
function addExportRectInputModes(inputMode) {
  // create a mode that deals with the handles
  const exportHandleInputMode = new HandleInputMode()
  exportHandleInputMode.priority = 1
  // add it to the graph editor mode
  inputMode.add(exportHandleInputMode)

  // now the handles
  const newDefaultCollectionModel = new ObservableCollection()
  newDefaultCollectionModel.add(new RectangleHandle(HandlePositions.NORTH_EAST, exportRect))
  newDefaultCollectionModel.add(new RectangleHandle(HandlePositions.NORTH_WEST, exportRect))
  newDefaultCollectionModel.add(new RectangleHandle(HandlePositions.SOUTH_EAST, exportRect))
  newDefaultCollectionModel.add(new RectangleHandle(HandlePositions.SOUTH_WEST, exportRect))
  exportHandleInputMode.handles = newDefaultCollectionModel

  // create a mode that allows for dragging the export rectangle at the sides
  const moveInputMode = new MoveInputMode()
  moveInputMode.positionHandler = new PositionHandler(exportRect)
  moveInputMode.hitTestable = IHitTestable.create((context, location) => {
    const path = new GeneralPath(5)
    path.appendRectangle(exportRect, false)
    return path.pathContains(location, context.hitTestRadius + 3 / context.zoom)
  })

  // add it to the edit mode
  moveInputMode.priority = 41
  inputMode.add(moveInputMode)
}

/**
 * Initializes the graph instance and set default styles.
 */
function initializeDefaultStyles() {
  const graph = graphComponent.graph
  const newPolylineEdgeStyle = new PolylineEdgeStyle()
  newPolylineEdgeStyle.targetArrow = IArrow.DEFAULT
  graph.edgeDefaults.style = newPolylineEdgeStyle

  // set the workstation as default node style
  graph.nodeDefaults.style = new ImageNodeStyle('./resources/workstation.svg')
}

/**
 * Create a graph with network style nodes.
 */
function createNetworkGraph() {
  const graph = graphComponent.graph
  graph.clear()

  const switchStyle = new ImageNodeStyle('./resources/switch.svg')
  const workstationStyle = new ImageNodeStyle('./resources/workstation.svg')

  const labelModel = new ExteriorLabelModel()
  const labelModelParameter1 = labelModel.createParameter(ExteriorLabelModelPosition.SOUTH)
  const labelModelParameter2 = labelModel.createParameter(ExteriorLabelModelPosition.NORTH)

  // create sample graph
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

  graphComponent.fitGraphBounds()
}

/**
 * Creates a graph with labels that use a custom font.
 */
function createCustomFontGraph() {
  const graph = graphComponent.graph
  graph.clear()

  const labelModel = new ExteriorLabelModel({ insets: 10 })

  graph.createNode({
    layout: [40, 50, 50, 50],
    style: new ShapeNodeStyle({ fill: 'orange' }),
    labels: [
      {
        text: 'Кирилица',
        style: new DefaultLabelStyle({
          font: new Font({
            fontFamily: 'Prata',
            fontSize: 16
          })
        }),
        layoutParameter: labelModel.createParameter(ExteriorLabelModelPosition.SOUTH)
      }
    ]
  })

  graph.createNode({
    layout: [190, 50, 50, 50],
    style: new ShapeNodeStyle({ fill: 'orange' }),
    labels: [
      {
        text: '平仮名',
        style: new DefaultLabelStyle({
          font: new Font({
            fontFamily: 'Kosugi',
            fontSize: 16
          })
        }),
        layoutParameter: labelModel.createParameter(ExteriorLabelModelPosition.SOUTH)
      }
    ]
  })

  graphComponent.fitGraphBounds()
}

/**
 * Check if the server at <code>url</code> is alive.
 * @param {string} url
 * @return {Promise}
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
 * @param {HTMLElement} element
 * @return {HTMLElement}
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

// run the demo
loadJson().then(run)
