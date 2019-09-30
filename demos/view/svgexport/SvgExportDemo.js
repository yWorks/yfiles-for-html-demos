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
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GeneralPath,
  GraphComponent,
  GraphEditorInputMode,
  GraphInputMode,
  HandleInputMode,
  HandlePositions,
  IArrow,
  IHitTestable,
  ImageNodeStyle,
  License,
  MoveInputMode,
  MutableRectangle,
  ObservableCollection,
  PolylineEdgeStyle,
  Rect,
  RectangleHandle,
  RectangleIndicatorInstaller,
  SvgExport
} from 'yfiles'

import PositionHandler from './PositionHandler.js'
import FileSaveSupport from '../../utils/FileSaveSupport.js'
import {
  addClass,
  bindAction,
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

  initializeGraph()

  // disable the save button in IE9
  if (ieVersion !== -1 && ieVersion <= 9) {
    const saveButton = document.getElementById('svgSaveButton')
    saveButton.setAttribute('style', 'display: none')
    // add save hint
    const hint = document.createElement('p')
    hint.innerHTML = 'Right-click the image and hit "Save As&hellip;" to save the SVG file.'
    const container = document.getElementById('outerExport')
    container.insertBefore(hint, document.getElementById('svgContainer'))
  }

  bindAction("button[data-command='Export']", async () => {
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

  showApp(graphComponent)
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

  exportComponent.zoomTo(targetRect)

  // Create the exporter class
  const exporter = new SvgExport(targetRect, scale)
  exporter.encodeImagesBase64 = true
  exporter.inlineSvgImages = true

  return exporter.exportSvgAsync(exportComponent)
}

/**
 * Shows the export dialog.
 * @param {SVGElement} svgElement
 */
function showExportDialog(svgElement) {
  svgElement.setAttribute('style', 'width: 100%; height: auto')
  const svgContainerInner = document.getElementById('svgContainerInner')
  svgContainerInner.innerHTML = ''
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
function initializeGraph() {
  const graph = graphComponent.graph
  const newPolylineEdgeStyle = new PolylineEdgeStyle()
  newPolylineEdgeStyle.targetArrow = IArrow.DEFAULT
  graph.edgeDefaults.style = newPolylineEdgeStyle

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

  // set the workstation as default node style
  graph.nodeDefaults.style = workstationStyle

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
}

/**
 * Shows the export dialog.
 */
function showPopup() {
  removeClass(document.getElementById('popup'), 'hidden')
}

// run the demo
loadJson().then(run)
