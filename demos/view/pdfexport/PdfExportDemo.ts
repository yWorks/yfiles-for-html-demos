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

import PositionHandler from './PositionHandler'
import FileSaveSupport from '../../utils/FileSaveSupport'
import ServerSidePdfExport from './ServerSidePdfExport'
import ClientSidePdfExport from './ClientSidePdfExport'
import {
  addClass,
  bindAction,
  bindChangeListener,
  bindCommand,
  removeClass,
  showApp
} from '../../resources/demo-app'
import { detectInternetExplorerVersion } from '../../utils/Workarounds'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

/**
 * This demo supports specific PDF output sizes.
 */
export enum PaperSize {
  A3 = 'A3',
  A4 = 'A4',
  A5 = 'A5',
  A6 = 'A6',
  LETTER = 'Letter',
  AUTO = 'Auto'
}

/**
 * Server URLs for server-side export.
 */
const NODE_SERVER_URL = 'http://localhost:3001'
const JAVA_SERVLET_URL = 'http://localhost:8080/BatikServlet/BatikServlet'

/**
 * Handles the client-sided PDF export.
 */
const clientSidePdfExport = new ClientSidePdfExport()

/**
 * Handles the server-sided PDF export.
 */
const serverSidePdfExport = new ServerSidePdfExport()

/**
 * The area that will be exported.
 */
let exportRect: MutableRectangle

/**
 * The detected IE version for x-browser compatibility.
 */
const ieVersion = detectInternetExplorerVersion()

async function run(): Promise<void> {
  License.value = await fetchLicense()
  if (window.location.protocol === 'file:') {
    alert(
      'This demo features image export with inlined images. ' +
        'Due to the browsers security settings, images can not be inlined if the demo is started from the file system. ' +
        'Please start the demo from a web server.'
    )
  }

  // initialize the main GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  initializeInteraction(graphComponent)
  retainAspectRatio(graphComponent.graph)

  // demonstrate export capabilities with different samples
  addNetworkSample(graphComponent.graph)
  addCustomFontSample(graphComponent.graph)
  addBezierEdgesSample(graphComponent.graph)

  // set nice default styles for nodes and edges
  initDemoStyles(graphComponent.graph)

  graphComponent.fitGraphBounds()

  // disable client-side export button in IE9 and hide the save buttons
  if (ieVersion !== -1 && ieVersion <= 9) {
    disableClientSaveButton()
  }

  // disable server-side export in IE9 due to limited XHR CORS support
  if (ieVersion === -1 || (ieVersion !== -1 && ieVersion > 9)) {
    enableServerSideExportButtons()
  }

  registerCommands(graphComponent)
  showApp(graphComponent)
}

/**
 * Initializes user interaction.
 * Aside from basic editing, this demo provides a visual marker (the 'export rectangle') that
 * determines the area that will be exported. Users may move and resize the marker with their mouse.
 * @param graphComponent The demo's main graph view.
 */
function initializeInteraction(graphComponent: GraphComponent): void {
  const geim = new GraphEditorInputMode()

  // create the model for the export rectangle, ...
  exportRect = new MutableRectangle(-20, 0, 300, 160)
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
 * @param inputMode The demo's main input mode.
 */
function addExportRectInputModes(inputMode: GraphInputMode): void {
  // create a mode that deals with resizing the export rectangle and ...
  const exportHandleInputMode = new HandleInputMode({
    // ensure that this mode takes precedence over most other modes
    // i.e. resizing the export rectangle takes precedence over other interactive editing
    priority: 1
  })
  // ... add it to the demo's main input mode
  inputMode.add(exportHandleInputMode)

  // create handles for resizing the export rectangle and ...
  const newDefaultCollectionModel = new ObservableCollection<IHandle>()
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
 * @param graph The demo's graph.
 */
function retainAspectRatio(graph: IGraph): void {
  graph.decorator.nodeDecorator.reshapeHandleProviderDecorator.setFactory(node => {
    const keepAspectRatio = new NodeReshapeHandleProvider(
      node,
      node.lookup(IReshapeHandler.$class) as IReshapeHandler,
      HandlePositions.CORNERS
    )
    keepAspectRatio.ratioReshapeRecognizer = EventRecognizers.ALWAYS
    return keepAspectRatio
  })
}

/**
 * Adds sample nodes and edges representing a simple computer network.
 * @param graph The demo's graph.
 */
function addNetworkSample(graph: IGraph): void {
  const edgeStyle = new PolylineEdgeStyle({
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

  graph.createEdge(n1, n2, edgeStyle)
  graph.createEdge(n1, n3, edgeStyle)
  graph.createEdge(n1, n4, edgeStyle)
  graph.createEdge(n1, n5, edgeStyle)

  graph.addLabel(n1, 'Switch', labelModelParameter2)
  graph.addLabel(n2, 'Workstation 1', labelModelParameter1)
  graph.addLabel(n3, 'Workstation 2', labelModelParameter1)
  graph.addLabel(n4, 'Workstation 3', labelModelParameter1)
  graph.addLabel(n5, 'Workstation 4', labelModelParameter1)
}

/**
 * Adds sample nodes with labels that use a custom font.
 * @param graph The demo's graph.
 */
function addCustomFontSample(graph: IGraph): void {
  const nodeStyle = new ShapeNodeStyle({ fill: 'orange' })

  const labelModel = new ExteriorLabelModel({ insets: 10 })

  graph.createNode({
    style: nodeStyle,
    layout: [55, 210, 50, 50],
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
    style: nodeStyle,
    layout: [205, 210, 50, 50],
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
}

/**
 * Adds curved edges.
 * @param graph The demo's graph.
 */
function addBezierEdgesSample(graph: IGraph): void {
  const nodeStyle = new ShapeNodeStyle({
    shape: ShapeNodeShape.ROUND_RECTANGLE,
    fill: 'lightgrey',
    stroke: '2px white'
  })
  const edgeStyle = new BezierEdgeStyle({ stroke: '28px #66dc143c' })

  const node1 = graph.createNode([0, 300, 30, 60], nodeStyle)
  const node2 = graph.createNode([0, 375, 30, 90], nodeStyle)
  const node3 = graph.createNode([0, 480, 30, 60], nodeStyle)
  const node4 = graph.createNode([230, 300, 30, 110], nodeStyle)
  const node5 = graph.createNode([230, 430, 30, 110], nodeStyle)

  const edge1 = graph.createEdge({ source: node1, target: node4, bends: [], style: edgeStyle })
  graph.setPortLocation(edge1.sourcePort!, new Point(30, 315))
  graph.setPortLocation(edge1.targetPort!, new Point(230, 315))
  const edge2 = graph.createEdge({
    source: node1,
    target: node5,
    bends: [new Point(80, 345), new Point(180, 445)],
    style: edgeStyle
  })
  graph.setPortLocation(edge2.sourcePort!, new Point(30, 345))
  graph.setPortLocation(edge2.targetPort!, new Point(230, 445))
  const edge3 = graph.createEdge({
    source: node2,
    target: node4,
    bends: [new Point(80, 450), new Point(180, 355)],
    style: edgeStyle
  })
  graph.setPortLocation(edge3.sourcePort!, new Point(30, 450))
  graph.setPortLocation(edge3.targetPort!, new Point(230, 355))
  const edge4 = graph.createEdge({
    source: node2,
    target: node5,
    bends: [new Point(80, 390), new Point(180, 485)],
    style: edgeStyle
  })
  graph.setPortLocation(edge4.sourcePort!, new Point(30, 390))
  graph.setPortLocation(edge4.targetPort!, new Point(230, 485))
  const edge5 = graph.createEdge({
    source: node3,
    target: node4,
    bends: [new Point(80, 495), new Point(180, 395)],
    style: edgeStyle
  })
  graph.setPortLocation(edge5.sourcePort!, new Point(30, 495))
  graph.setPortLocation(edge5.targetPort!, new Point(230, 395))
  const edge6 = graph.createEdge({ source: node3, target: node5, bends: [], style: edgeStyle })
  graph.setPortLocation(edge6.sourcePort!, new Point(30, 525))
  graph.setPortLocation(edge6.targetPort!, new Point(230, 525))
}

/**
 * Checks whether or not the given parameters are a valid input for export.
 * @param scale The desired scale factor for the image export.
 * @param margin The desired margins for the image export.
 */
function checkInputValues(scale: number, margin: number): boolean {
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
 * @param svgElement The SVG document that is to be exported.
 * @param size The size of the exported image.
 * @param url The URL of the service that will convert the given SVG document to a PDF.
 */
function requestServerExport(svgElement: Element, size: Size, url: string): any {
  const svgString = SvgExport.exportSvgString(svgElement)
  serverSidePdfExport.requestFile(url, 'pdf', svgString, size)
  hidePopup()
}

/**
 * Shows the export dialog for the client-side graph exports.
 * @param raw The raw PDF content that is written to a file.
 * @param pdfUrl A data URI representation of the generated PDF that can be previewed.
 */
function showClientExportDialog(raw: string, pdfUrl: string): void {
  const pdfIframe = document.createElement('iframe')
  pdfIframe.setAttribute('style', 'width: 99%; height: 99%')
  pdfIframe.src = pdfUrl
  const pdfContainerInner = document.getElementById('pdfContainerInner') as HTMLDivElement
  pdfContainerInner.innerHTML = ''
  pdfContainerInner.appendChild(pdfIframe)

  const saveButton = document.getElementById('clientPdfSaveButton') as HTMLButtonElement
  const pdfButton = cloneAndReplace(saveButton)
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
 * Disables the client-side save button in IE9.
 */
function disableClientSaveButton(): void {
  ;(document.getElementById('ExportButton') as HTMLButtonElement).disabled = true
  const clientSaveButton = document.getElementById('clientPdfSaveButton') as HTMLButtonElement
  clientSaveButton.setAttribute('style', 'display: none')
}

/**
 * Enables server-side export buttons.
 */
async function enableServerSideExportButtons(): Promise<void> {
  // if a server is available, enable the server export button
  const isAliveJava = await isServerAlive(JAVA_SERVLET_URL)
  ;(document.getElementById('BatikServerExportButton') as HTMLButtonElement).disabled = !isAliveJava

  const isAliveNode = await isServerAlive(NODE_SERVER_URL)
  ;(document.getElementById('NodeServerServerExportButton') as HTMLButtonElement).disabled =
    !isAliveNode
}

/**
 * Checks if the server at the given URL is alive.
 * @param url The URL of the service to check.
 */
function isServerAlive(url: string): Promise<Response | boolean> {
  const initObject = {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8'
    },
    body: 'isAlive',
    mode: 'no-cors'
  } as RequestInit

  return fetch(url, initObject).catch(() => Promise.resolve(false))
}

/**
 * Replaces the given element with a clone. This prevents adding multiple listeners to a button.
 * @param element The element to replace.
 */
function cloneAndReplace(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement
  element.parentNode!.replaceChild(clone, element)
  return clone
}

/**
 * Hides the export dialog.
 */
function hidePopup(): void {
  addClass(document.getElementById('popup')!, 'hidden')
}

/**
 * Shows the export dialog.
 */
function showPopup(): void {
  removeClass(document.getElementById('popup')!, 'hidden')
}

/**
 * Returns the chosen export paper size.
 */
function getPaperSize(): PaperSize {
  const inputPaperSize = document.getElementById('paperSize') as HTMLSelectElement
  return PaperSize[inputPaperSize.value as keyof typeof PaperSize]
}

/**
 * Wires up the UI.
 * @param graphComponent The demo's main graph view.
 */
function registerCommands(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  const inputScale = document.getElementById('scale') as HTMLInputElement
  const inputMargin = document.getElementById('margin') as HTMLInputElement
  const inputUseRect = document.getElementById('useRect') as HTMLInputElement

  bindChangeListener('#paperSize', newSize => {
    inputScale.disabled = newSize !== 'auto'
  })

  bindAction("button[data-command='Export']", async () => {
    const scale = parseFloat(inputScale.value)
    const margin = parseFloat(inputMargin.value)
    if (checkInputValues(scale, margin)) {
      const rectangle = inputUseRect && inputUseRect.checked ? new Rect(exportRect) : null

      // configure export, export the PDF and show a dialog to save the PDF file
      clientSidePdfExport.scale = scale
      clientSidePdfExport.margins = new Insets(margin)
      clientSidePdfExport.paperSize = getPaperSize()
      const { raw, uri } = await clientSidePdfExport.exportPdf(graphComponent.graph, rectangle)
      if (ieVersion !== -1) {
        // disable HTML preview in IE and directly download the file
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
      serverSidePdfExport.paperSize = getPaperSize()
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
      serverSidePdfExport.paperSize = getPaperSize()
      const pdf = await serverSidePdfExport.exportSvg(graphComponent.graph, rectangle)
      requestServerExport(pdf.element, pdf.size, NODE_SERVER_URL)
    }
  })

  bindAction('#closeButton', hidePopup)
}

// noinspection JSIgnoredPromiseFromCall
run()
