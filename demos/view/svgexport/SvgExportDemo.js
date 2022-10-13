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
  EventRecognizers,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GeneralPath,
  GraphComponent,
  GraphEditorInputMode,
  GraphModelManager,
  HandleInputMode,
  HandlePositions,
  IArrow,
  ICommand,
  IGraph,
  IHandle,
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
  Size,
  StringTemplateNodeStyle,
  SvgExport,
  WebGL2FocusIndicatorManager,
  WebGL2GraphModelManager,
  WebGL2IconNodeStyle,
  WebGL2SelectionIndicatorManager,
  WebGL2ShapeNodeStyle
} from 'yfiles'

import PositionHandler from './PositionHandler.js'
import FileSaveSupport from '../../utils/FileSaveSupport.js'
import { addClass, bindCommand, removeClass, showApp } from '../../resources/demo-app.js'
import {
  applyDemoTheme,
  colorSets,
  createDemoNodeStyle,
  initDemoStyles
} from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'
import { BrowserDetection } from '../../utils/BrowserDetection.js'
import { createCanvasContext, createUrlIcon } from '../../utils/IconCreation.js'

/**
 * The area that will be exported.
 * @type {MutableRectangle}
 */
let exportRect
const imageData = {}

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  initializeInteraction(graphComponent)
  retainNodeAspectRatio(graphComponent.graph)

  // add nodes and edges with different visualizations to demonstrate that the SVG export does not
  // depend on the styles used to visualize elements
  await addNetworkSample(graphComponent.graph)
  addCssStyleSample(graphComponent.graph)
  addBezierEdgesSample(graphComponent.graph)

  // set nice default styles for nodes and edges
  initDemoStyles(graphComponent.graph)
  // Start the async ImageData creation. Once finished, this will enable the WebGL2 mode button.
  createIconImageData()

  graphComponent.fitGraphBounds()

  initializeUI(graphComponent)
  showApp(graphComponent)
}

/**
 * Exports a certain area of the graph to an SVG element.
 * @param {!GraphComponent} graphComponent The demo's main graph view.
 * @param {number} scale The scale factor for the export operation.
 * E.g. a scale factor of 2 will result in an exported graphic that is twice as large as the
 * original area.
 * @param {boolean} transparent If true, the exported SVG document will have no background element;
 * otherwise it will have an opaque white background element.
 * @param {?Rect} rectangle The area to export.
 * @returns {!Promise.<Element>} A promise that resolves with the exported SVG element.
 */
async function exportSvg(graphComponent, scale, transparent, rectangle) {
  // create a new graph component for exporting the original SVG content
  const exportComponent = new GraphComponent()
  // ... and assign it the same graph.
  exportComponent.graph = graphComponent.graph
  exportComponent.updateContentRect()

  if (graphComponent.graphModelManager instanceof WebGL2GraphModelManager) {
    useWebGL2Rendering(exportComponent)
  }

  // determine the bounds of the exported area
  const targetRect = rectangle || exportComponent.contentRect

  // create the exporter class
  const exporter = new SvgExport({
    worldBounds: targetRect,
    scale,
    encodeImagesBase64: true,
    inlineSvgImages: true,
    background: transparent ? 'transparent' : 'white'
  })

  // set cssStyleSheets to null so the SvgExport will automatically collect all style sheets
  exporter.cssStyleSheet = null

  return exporter.exportSvgAsync(exportComponent)
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
 * @param {!GraphEditorInputMode} inputMode The demo's main input mode.
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
function retainNodeAspectRatio(graph) {
  graph.decorator.nodeDecorator.reshapeHandleProviderDecorator.setFactory(
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
 * Adds sample nodes represented by yFiles's {@link StringTemplateNodeStyle}.
 * @param {!IGraph} graph The demo's graph.
 */
function addCssStyleSample(graph) {
  const nodeStyle = new StringTemplateNodeStyle(
    '<rect class="{Binding css}" fill="none" stroke="black" ' +
      'width="{TemplateBinding width}" height="{TemplateBinding height}">' +
      '</rect>'
  )
  graph.createNode(new Rect(10, 200, 40, 40), nodeStyle, { css: 'demo-palette-23-node' })
  graph.createNode(new Rect(110, 200, 40, 40), nodeStyle, { css: 'demo-palette-25-node' })
  graph.createNode(new Rect(210, 200, 40, 40), nodeStyle, { css: 'demo-palette-21-node' })
  graph.createNode(new Rect(10, 300, 40, 40), nodeStyle, { css: 'demo-palette-23-node' })
  graph.createNode(new Rect(110, 300, 40, 40), nodeStyle, { css: 'demo-palette-25-node' })
  graph.createNode(new Rect(210, 300, 40, 40), nodeStyle, { css: 'demo-palette-21-node' })
}

/**
 * Adds sample nodes and edges representing a simple computer network.
 * @param {!IGraph} graph The demo's graph.
 * @returns {!Promise}
 */
async function addNetworkSample(graph) {
  const edgeStyle = new PolylineEdgeStyle({
    targetArrow: IArrow.DEFAULT
  })

  const switchStyle = new ImageNodeStyle({
    image: './resources/switch.svg',
    // determine the intrinsic aspect ratio of the image
    aspectRatio: await ImageNodeStyle.getAspectRatio('./resources/switch.svg')
  })
  const workstationStyle = new ImageNodeStyle({
    image: './resources/workstation.svg',
    // determine the intrinsic aspect ratio of the image
    aspectRatio: await ImageNodeStyle.getAspectRatio('./resources/workstation.svg')
  })

  const labelModel = new ExteriorLabelModel()
  const southLabelPosition = labelModel.createParameter(ExteriorLabelModelPosition.SOUTH)
  const northLabelPosition = labelModel.createParameter(ExteriorLabelModelPosition.NORTH)

  // create sample nodes
  const n1 = graph.createNode([150, 0, 60, 40], switchStyle, { type: 'switch' })
  const n2 = graph.createNode([0, 80, 60, 40], workstationStyle, { type: 'workstation' })
  const n3 = graph.createNode([100, 80, 60, 40], workstationStyle, { type: 'workstation' })
  const n4 = graph.createNode([200, 80, 60, 40], workstationStyle, { type: 'workstation' })
  const n5 = graph.createNode([300, 80, 60, 40], workstationStyle, { type: 'workstation' })

  // create sample edges
  graph.createEdge(n1, n2, edgeStyle)
  graph.createEdge(n1, n3, edgeStyle)
  graph.createEdge(n1, n4, edgeStyle)
  graph.createEdge(n1, n5, edgeStyle)

  // create sample labels
  graph.addLabel(n1, 'Switch', northLabelPosition)
  graph.addLabel(n2, 'Workstation 1', southLabelPosition)
  graph.addLabel(n3, 'Workstation 2', southLabelPosition)
  graph.addLabel(n4, 'Workstation 3', southLabelPosition)
  graph.addLabel(n5, 'Workstation 4', southLabelPosition)
}

/**
 * Adds curved edges.
 * @param {!IGraph} graph The demo's graph.
 */
function addBezierEdgesSample(graph) {
  const nodeStyle = createDemoNodeStyle('demo-palette-21')
  const edgeStyle = new BezierEdgeStyle({ stroke: `28px ${colorSets['demo-palette-22'].stroke}33` })

  const node1 = graph.createNode([0, 400, 30, 60], nodeStyle)
  const node2 = graph.createNode([0, 475, 30, 90], nodeStyle)
  const node3 = graph.createNode([0, 580, 30, 60], nodeStyle)
  const node4 = graph.createNode([230, 400, 30, 110], nodeStyle)
  const node5 = graph.createNode([230, 530, 30, 110], nodeStyle)

  const edge1 = graph.createEdge({ source: node1, target: node4, bends: [], style: edgeStyle })
  graph.setPortLocation(edge1.sourcePort, new Point(30, 415))
  graph.setPortLocation(edge1.targetPort, new Point(230, 415))
  const edge2 = graph.createEdge({
    source: node1,
    target: node5,
    bends: [new Point(80, 445), new Point(180, 545)],
    style: edgeStyle
  })
  graph.setPortLocation(edge2.sourcePort, new Point(30, 445))
  graph.setPortLocation(edge2.targetPort, new Point(230, 545))
  const edge3 = graph.createEdge({
    source: node2,
    target: node4,
    bends: [new Point(80, 550), new Point(180, 455)],
    style: edgeStyle
  })
  graph.setPortLocation(edge3.sourcePort, new Point(30, 550))
  graph.setPortLocation(edge3.targetPort, new Point(230, 455))
  const edge4 = graph.createEdge({
    source: node2,
    target: node5,
    bends: [new Point(80, 490), new Point(180, 585)],
    style: edgeStyle
  })
  graph.setPortLocation(edge4.sourcePort, new Point(30, 490))
  graph.setPortLocation(edge4.targetPort, new Point(230, 585))
  const edge5 = graph.createEdge({
    source: node3,
    target: node4,
    bends: [new Point(80, 595), new Point(180, 495)],
    style: edgeStyle
  })
  graph.setPortLocation(edge5.sourcePort, new Point(30, 595))
  graph.setPortLocation(edge5.targetPort, new Point(230, 495))
  const edge6 = graph.createEdge({ source: node3, target: node5, bends: [], style: edgeStyle })
  graph.setPortLocation(edge6.sourcePort, new Point(30, 625))
  graph.setPortLocation(edge6.targetPort, new Point(230, 625))
}

/**
 * Creates the ImageData for each icon used in this demo.
 *
 * Since creating ImageData for an image URL can only be done asynchronous, this is done in advance.
 * Once finished, this will enable the WebGL2 mode button of this demo.
 */
async function createIconImageData() {
  if (!BrowserDetection.webGL2) {
    // This is only needed for WebGL2 rendering mode
    return
  }

  const deviceNames = ['switch', 'workstation']
  const svgSize = new Size(70, 70)
  const ctx = createCanvasContext(128, 128)
  const imageDataArray = await Promise.all(
    deviceNames.map(device => createUrlIcon(ctx, `./resources/${device}.svg`, svgSize))
  )

  for (let i = 0; i < deviceNames.length; i++) {
    imageData[deviceNames[i]] = imageDataArray[i]
  }

  // Now the ImageData is ready, and we can allow the user to switch to WebGL2 rendering mode
  document.getElementById('toggleWebGL2Mode').removeAttribute('disabled')
}

/**
 * @param {!GraphComponent} graphComponent
 */
function useWebGL2Rendering(graphComponent) {
  const webGL2GraphModelManager = new WebGL2GraphModelManager()
  graphComponent.graphModelManager = webGL2GraphModelManager
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager()
  graphComponent.focusIndicatorManager = new WebGL2FocusIndicatorManager()

  // Set explicit WebGL2 styles for nodes that don't get a suitable style by the auto-conversion
  // from the SVG style
  for (const node of graphComponent.graph.nodes) {
    if (typeof node.tag?.type === 'string') {
      webGL2GraphModelManager.setStyle(
        node,
        new WebGL2IconNodeStyle({
          icon: imageData[node.tag.type] || imageData['workstation'],
          fill: 'transparent',
          stroke: 'none',
          preserveAspectRatio: true
        })
      )
    } else if (typeof node.tag?.css === 'string') {
      const colorSet = colorSets[node.tag.css.replace('-node', '')]
      webGL2GraphModelManager.setStyle(
        node,
        new WebGL2ShapeNodeStyle({
          shape: 'rectangle',
          fill: colorSet.fill,
          stroke: `1px ${colorSet.stroke}`
        })
      )
    }
  }
}

/**
 * Shows the export dialog.
 * @param {!Element} svgElement
 */
function showExportDialog(svgElement) {
  svgElement.setAttribute('style', 'width: 100%; height: auto')
  document.getElementById('svgContainerInner').appendChild(svgElement)

  removeClass(document.getElementById('popup'), 'hidden')
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the toolbar.
 * @param {!GraphComponent} graphComponent The demo's main graph view.
 */
function initializeUI(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  // disable the save button in IE9
  const ieVersion = BrowserDetection.ieVersion
  if (ieVersion > 0 && ieVersion <= 9) {
    const saveButton = document.getElementById('svgSaveButton')
    saveButton.setAttribute('style', 'display: none')
    // add save hint
    const hint = document.createElement('p')
    hint.innerHTML = 'Right-click the image and hit "Save As&hellip;" to save the SVG file.'
    const container = document.getElementById('outerClientExport')
    container.insertBefore(hint, document.getElementById('svgContainer'))
  }

  document.getElementById('svgSaveButton').addEventListener('click', () => {
    const svgElement = document.getElementById('svgContainerInner').children.item(0)
    let fileContent = SvgExport.exportSvgString(svgElement)
    if (BrowserDetection.ieVersion > 0) {
      fileContent = SvgExport.encodeSvgDataUrl(fileContent)
    }
    FileSaveSupport.save(fileContent, 'graph.svg').catch(() => {
      alert(
        'Saving directly to the filesystem is not supported by this browser.' +
          ' Please use the server-based export instead.'
      )
    })
  })

  document.querySelector('#exportButton').addEventListener('click', async evt => {
    evt.target.disabled = true

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

    const transparent = document.getElementById('transparent')
    const inputUseRect = document.getElementById('useRect')
    const rectangle = inputUseRect && inputUseRect.checked ? new Rect(exportRect) : null
    const svg = await exportSvg(graphComponent, scale, transparent.checked, rectangle)
    showExportDialog(svg)
  })

  document.querySelector('#closeButton').addEventListener('click', evt => {
    // Hide the popup
    addClass(document.getElementById('popup'), 'hidden')
    // Remove the exported SVG element from the popup since it is no longer needed
    document.getElementById('svgContainerInner').innerHTML = ''
    // Re-enable the export button
    document.querySelector('#exportButton').disabled = false
  })

  document.querySelector('#toggleWebGL2Mode').addEventListener('change', evt => {
    if (evt.target.checked) {
      useWebGL2Rendering(graphComponent)
    } else {
      graphComponent.graphModelManager = new GraphModelManager()
    }
  })
}

// noinspection JSIgnoredPromiseFromCall
run()
