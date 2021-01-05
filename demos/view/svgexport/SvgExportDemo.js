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
  ICommand,
  IHitTestable,
  ImageNodeStyle,
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
  StringTemplateNodeStyle,
  SvgExport
} from 'yfiles'

import PositionHandler from './PositionHandler.js'
import FileSaveSupport from '../../utils/FileSaveSupport.js'
import {
  addClass,
  bindAction,
  bindCommand,
  detectInternetExplorerVersion,
  removeClass,
  showApp
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

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

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  ieVersion = detectInternetExplorerVersion()

  initializeInputModes()
  keepAspectRatio()
  registerCommands()

  createNetworkGraph()
  createCssStyleGraph()
  createBezierEdgesGraph()

  showApp(graphComponent)
}

function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  // disable the save button in IE9
  if (ieVersion !== -1 && ieVersion <= 9) {
    const saveButton = document.getElementById('svgSaveButton')
    saveButton.setAttribute('style', 'display: none')
    // add save hint
    const hint = document.createElement('p')
    hint.innerHTML = 'Right-click the image and hit "Save As&hellip;" to save the SVG file.'
    const container = document.getElementById('outerClientExport')
    container.insertBefore(hint, document.getElementById('svgContainer'))
  }

  bindAction("button[data-command='Export']", async () => {
    hidePopup()

    if (window.location.protocol === 'file:') {
      alert(
        'This demo features SVG export with inlined images. ' +
          'Due to the browsers security settings, images can not be inlined if the demo is started from the file system. ' +
          'Please start the demo from a web server.'
      )
      return
    }
    const scale = parseFloat(document.getElementById('scale').value)
    if (isNaN(scale) || scale <= 0) {
      alert('Scale must be a positive number.')
      return
    }

    const inputUseRect = document.getElementById('useRect')
    const rectangle = inputUseRect && inputUseRect.checked ? new Rect(exportRect) : null
    const svg = await exportSvg(scale, rectangle)
    showExportDialog(svg)
  })

  document.getElementById('closeButton').addEventListener('click', hidePopup, false)
}

/**
 * Exports the graph to an SVG element.
 * This function returns a Promise to allow showing the SVG in a popup with a save button,
 * afterwards.
 * @param {number} scale
 * @param {Rect} rectangle
 * @return {Promise}
 */
function exportSvg(scale, rectangle) {
  // Create a new graph component for exporting the original SVG content
  const exportComponent = new GraphComponent()
  // ... and assign it the same graph.
  exportComponent.graph = graphComponent.graph
  exportComponent.updateContentRect()

  // Determine the bounds of the exported area
  const targetRect = rectangle || exportComponent.contentRect

  // Create the exporter class
  const exporter = new SvgExport(targetRect, scale)
  exporter.encodeImagesBase64 = true
  exporter.inlineSvgImages = true

  // set cssStyleSheets to null so the SvgExport will automatically collect all style sheets
  exporter.cssStyleSheet = null

  return exporter.exportSvgAsync(exportComponent)
}

/**
 * Shows the export dialog.
 * @param {SVGElement} svgElement
 */
function showExportDialog(svgElement) {
  svgElement.setAttribute('style', 'width: 100%; height: auto')
  const svgContainerInner = document.getElementById('svgContainerInner')
  svgContainerInner.appendChild(svgElement)

  const svgButton = cloneAndReplace(document.getElementById('svgSaveButton'))
  svgButton.addEventListener(
    'click',
    () => {
      let fileContent = SvgExport.exportSvgString(svgElement)
      if (ieVersion !== -1) {
        fileContent = SvgExport.encodeSvgDataUrl(fileContent)
      }
      FileSaveSupport.save(fileContent, 'graph.svg').catch(() => {
        alert(
          'Saving directly to the filesystem is not supported by this browser. Please use the server-based export instead.'
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

function createCssStyleGraph() {
  const graph = graphComponent.graph

  graph.nodeDefaults.style = new StringTemplateNodeStyle(
    '<rect class="{Binding}" fill="lightgray" width="{TemplateBinding width}" height="{TemplateBinding height}"></rect>'
  )
  graph.nodeDefaults.size = new Size(40, 40)
  graph.edgeDefaults.style = new PolylineEdgeStyle({ targetArrow: IArrow.DEFAULT })

  graph.createNode({ layout: new Rect(10, 200, 40, 40), tag: 'node red' })
  graph.createNode({ layout: new Rect(110, 200, 40, 40), tag: 'node green' })
  graph.createNode({ layout: new Rect(210, 200, 40, 40), tag: 'node blue' })
  graph.createNode({ layout: new Rect(10, 300, 40, 40), tag: 'node red' })
  graph.createNode({ layout: new Rect(110, 300, 40, 40), tag: 'node green' })
  graph.createNode({ layout: new Rect(210, 300, 40, 40), tag: 'node blue' })

  graphComponent.fitGraphBounds()
}

/**
 * Initializes the graph instance and set default styles.
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

  const node1 = graph.createNode([0, 400, 30, 60])
  const node2 = graph.createNode([0, 475, 30, 90])
  const node3 = graph.createNode([0, 580, 30, 60])
  const node4 = graph.createNode([230, 400, 30, 110])
  const node5 = graph.createNode([230, 530, 30, 110])

  const edge1 = graph.createEdge({ source: node1, target: node4, bends: [] })
  graph.setPortLocation(edge1.sourcePort, new Point(30, 415))
  graph.setPortLocation(edge1.targetPort, new Point(230, 415))
  const edge2 = graph.createEdge({
    source: node1,
    target: node5,
    bends: [new Point(80, 445), new Point(180, 545)]
  })
  graph.setPortLocation(edge2.sourcePort, new Point(30, 445))
  graph.setPortLocation(edge2.targetPort, new Point(230, 545))
  const edge3 = graph.createEdge({
    source: node2,
    target: node4,
    bends: [new Point(80, 550), new Point(180, 455)]
  })
  graph.setPortLocation(edge3.sourcePort, new Point(30, 550))
  graph.setPortLocation(edge3.targetPort, new Point(230, 455))
  const edge4 = graph.createEdge({
    source: node2,
    target: node5,
    bends: [new Point(80, 490), new Point(180, 585)]
  })
  graph.setPortLocation(edge4.sourcePort, new Point(30, 490))
  graph.setPortLocation(edge4.targetPort, new Point(230, 585))
  const edge5 = graph.createEdge({
    source: node3,
    target: node4,
    bends: [new Point(80, 595), new Point(180, 495)]
  })
  graph.setPortLocation(edge5.sourcePort, new Point(30, 595))
  graph.setPortLocation(edge5.targetPort, new Point(230, 495))
  const edge6 = graph.createEdge({ source: node3, target: node5, bends: [] })
  graph.setPortLocation(edge6.sourcePort, new Point(30, 625))
  graph.setPortLocation(edge6.targetPort, new Point(230, 625))

  graphComponent.fitGraphBounds()
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
  document.getElementById('svgContainerInner').innerHTML = ''
}

/**
 * Shows the export dialog.
 */
function showPopup() {
  removeClass(document.getElementById('popup'), 'hidden')
}

// run the demo
loadJson().then(run)
