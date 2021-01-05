/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
  BezierEdgeStyle,
  DefaultLabelStyle,
  EventRecognizers,
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
  IReshapeHandler,
  License,
  MoveInputMode,
  MutableRectangle,
  NodeReshapeHandleProvider,
  ObservableCollection,
  Point,
  PolylineEdgeStyle,
  Rect,
  RectangleHandle,
  RectangleIndicatorInstaller,
  ShapeNodeShape,
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

  // bootstrap application
  graphComponent = new GraphComponent('graphComponent')
  clientSidePdfExport = new ClientSidePdfExport()
  serverSidePdfExport = new ServerSidePdfExport()
  ieVersion = detectInternetExplorerVersion()

  initializeInputModes()
  keepAspectRatio()

  // create sample graph
  createNetworkGraph()
  createCustomFontGraph()
  createBezierEdgesGraph()

  // disable client-side export button in IE9 and hide the save buttons
  if (ieVersion !== -1 && ieVersion <= 9) {
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
 * Wires up the UI.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  const inputPaperSize = document.getElementById('paperSize')
  const inputScale = document.getElementById('scale')
  const inputMargin = document.getElementById('margin')
  const inputUseRect = document.getElementById('useRect')

  bindChangeListener('#paperSize', newSize => {
    inputScale.disabled = newSize !== 'auto'
  })

  bindAction("button[data-command='Export']", async () => {
    const paperSize = inputPaperSize.value === 'auto' ? null : inputPaperSize.value
    const scale = parseFloat(inputScale.value)
    const margin = parseFloat(inputMargin.value)
    if (checkInputValues(scale, margin)) {
      const rectangle = inputUseRect && inputUseRect.checked ? new Rect(exportRect) : null

      // configure export, export the image and show a dialog to save the image
      clientSidePdfExport.scale = scale
      clientSidePdfExport.margins = new Insets(margin)
      clientSidePdfExport.paperSize = paperSize
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
    const paperSize = inputPaperSize.value === 'auto' ? null : inputPaperSize.value
    const scale = parseFloat(inputScale.value)
    const margin = parseFloat(inputMargin.value)
    if (checkInputValues(scale, margin)) {
      const rectangle = inputUseRect && inputUseRect.checked ? new Rect(exportRect) : null

      // configure export, export the SVG and show a dialog to download the image
      serverSidePdfExport.scale = scale
      serverSidePdfExport.margins = new Insets(margin)
      serverSidePdfExport.paperSize = paperSize
      const pdf = await serverSidePdfExport.exportSvg(graphComponent.graph, rectangle)
      requestServerExport(pdf.element, pdf.size, JAVA_SERVLET_URL)
    }
  })
  bindAction("button[data-command='NodeServerServerExportButton']", async () => {
    const paperSize = inputPaperSize.value === 'auto' ? null : inputPaperSize.value
    const scale = parseFloat(inputScale.value)
    const margin = parseFloat(inputMargin.value)
    if (checkInputValues(scale, margin)) {
      const rectangle = inputUseRect && inputUseRect.checked ? new Rect(exportRect) : null

      // configure export, export the SVG and show a dialog to download the image
      serverSidePdfExport.scale = scale
      serverSidePdfExport.margins = new Insets(margin)
      serverSidePdfExport.paperSize = paperSize
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
  exportRect = new MutableRectangle(-20, 0, 300, 160)

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
 * Since this demo uses image nodes, we make sure that they always keep their aspect ratio during
 * resize.
 */
function keepAspectRatio() {
  graphComponent.graph.decorator.nodeDecorator.reshapeHandleProviderDecorator.setFactory(
    node => node.style instanceof ImageNodeStyle,
    node => {
      const keepAspectRatio = new NodeReshapeHandleProvider(
        node,
        node.lookup(IReshapeHandler.$class),
        HandlePositions.CORNERS
      )
      keepAspectRatio.ratioReshapeRecognizer = EventRecognizers.ALWAYS
      return keepAspectRatio
    }
  )
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
 * Create a graph with network style nodes.
 */
function createNetworkGraph() {
  const graph = graphComponent.graph

  // set the workstation as default node style
  graph.nodeDefaults.style = new ImageNodeStyle('./resources/workstation.svg')
  graph.nodeDefaults.size = new Size(40, 40)
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    targetArrow: IArrow.DEFAULT
  })

  const switchStyle = new ImageNodeStyle('./resources/switch.svg')
  const workstationStyle = new ImageNodeStyle('./resources/workstation.svg')

  const labelModel = new ExteriorLabelModel()
  const labelModelParameter1 = labelModel.createParameter(ExteriorLabelModelPosition.SOUTH)
  const labelModelParameter2 = labelModel.createParameter(ExteriorLabelModelPosition.NORTH)

  // create sample graph
  const n1 = graph.createNodeAt(new Point(170, 20), switchStyle)
  const n2 = graph.createNodeAt(new Point(20, 100), workstationStyle)
  const n3 = graph.createNodeAt(new Point(120, 100), workstationStyle)
  const n4 = graph.createNodeAt(new Point(220, 100), workstationStyle)
  const n5 = graph.createNodeAt(new Point(320, 100), workstationStyle)

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

  graph.nodeDefaults.style = new ShapeNodeStyle({ fill: 'orange' })
  graph.nodeDefaults.size = new Size(50, 50)
  graph.edgeDefaults.style = new PolylineEdgeStyle({ targetArrow: IArrow.DEFAULT })

  const labelModel = new ExteriorLabelModel({ insets: 10 })

  graph.createNodeAt({
    location: [55, 210],
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

  graph.createNodeAt({
    location: [205, 210],
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
 * Creates a graph that uses curved edges.
 */
function createBezierEdgesGraph() {
  const graph = graphComponent.graph

  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: ShapeNodeShape.ROUND_RECTANGLE,
    fill: 'lightgrey',
    stroke: '2px white'
  })
  graph.nodeDefaults.size = new Size(30, 30)
  graph.edgeDefaults.style = new BezierEdgeStyle({
    stroke: '28px #66dc143c'
  })

  const node1 = graph.createNode([0, 300, 30, 60])
  const node2 = graph.createNode([0, 375, 30, 90])
  const node3 = graph.createNode([0, 480, 30, 60])
  const node4 = graph.createNode([230, 300, 30, 110])
  const node5 = graph.createNode([230, 430, 30, 110])

  const edge1 = graph.createEdge({ source: node1, target: node4, bends: [] })
  graph.setPortLocation(edge1.sourcePort, new Point(30, 315))
  graph.setPortLocation(edge1.targetPort, new Point(230, 315))
  const edge2 = graph.createEdge({
    source: node1,
    target: node5,
    bends: [new Point(80, 345), new Point(180, 445)]
  })
  graph.setPortLocation(edge2.sourcePort, new Point(30, 345))
  graph.setPortLocation(edge2.targetPort, new Point(230, 445))
  const edge3 = graph.createEdge({
    source: node2,
    target: node4,
    bends: [new Point(80, 450), new Point(180, 355)]
  })
  graph.setPortLocation(edge3.sourcePort, new Point(30, 450))
  graph.setPortLocation(edge3.targetPort, new Point(230, 355))
  const edge4 = graph.createEdge({
    source: node2,
    target: node5,
    bends: [new Point(80, 390), new Point(180, 485)]
  })
  graph.setPortLocation(edge4.sourcePort, new Point(30, 390))
  graph.setPortLocation(edge4.targetPort, new Point(230, 485))
  const edge5 = graph.createEdge({
    source: node3,
    target: node4,
    bends: [new Point(80, 495), new Point(180, 395)]
  })
  graph.setPortLocation(edge5.sourcePort, new Point(30, 495))
  graph.setPortLocation(edge5.targetPort, new Point(230, 395))
  const edge6 = graph.createEdge({ source: node3, target: node5, bends: [] })
  graph.setPortLocation(edge6.sourcePort, new Point(30, 525))
  graph.setPortLocation(edge6.targetPort, new Point(230, 525))

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
