/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-editor',
  'resources/demo-app',
  'utils/FileSaveSupport',
  'PositionHandler.js',
  'ClientSidePdfExport.js',
  'ServerSidePdfExport.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  FileSaveSupport,
  PositionHandler,
  ClientSidePdfExport,
  ServerSidePdfExport
) => {
  /** the server urls */
  const PHANTOM_JS_URL = 'http://localhost:8081'
  const JAVA_SERVLET_URL = 'http://localhost:8080/BatikServlet/BatikServlet'

  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {ClientSidePdfExport} */
  let clientSidePdfExport = null

  /** @type {ServerSidePdfExport} */
  let serverSidePdfExport = null

  /**
   * region that will be exported
   * @type {yfiles.geometry.MutableRectangle}
   */
  let exportRect = null

  /**
   * detect IE version for x-browser compatibility
   * @type {number}
   */
  let ieVersion = -1

  function run() {
    if (window.location.protocol === 'file:') {
      alert(
        new Error(
          'This demo features image export with inlined images. ' +
            'Due to the browsers security settings, images can not be inlined if the demo is started from the file system. ' +
            'Please start the demo from a web server.'
        )
      )
    }

    // initialize the UI's elements
    init()

    initializeInputModes()
    initializeDefaultStyles()
    createNetworkGraph()

    if (ieVersion !== -1 && ieVersion <= 9) {
      // disable client side export button in IE9 and hide the save buttons
      document.getElementById('ExportButton').disabled = true
      const clientSaveButton = document.getElementById('clientPdfSaveButton')
      clientSaveButton.setAttribute('style', 'display: none')
    }

    // disable server sided export in IE9 due to limited XHR CORS support
    if (ieVersion === -1 || (ieVersion !== -1 && ieVersion > 9)) {
      // if a server is available, enable the server export button
      isServerAlive(JAVA_SERVLET_URL).then(() => {
        document.getElementById('BatikServerExportButton').disabled = false
      })
      isServerAlive(PHANTOM_JS_URL).then(() => {
        document.getElementById('PhantomServerExportButton').disabled = false
      })
    }

    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Initializes the UI's elements.
   */
  function init() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    clientSidePdfExport = new ClientSidePdfExport()
    serverSidePdfExport = new ServerSidePdfExport()

    ieVersion = app.detectInternetExplorerVersion()
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
    const ICommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
    app.bindChangeListener('#graphChooserBox', value => {
      if (value === 'custom-fonts') {
        createCustomFontGraph()
      } else {
        createNetworkGraph()
      }
    })

    const inputScale = document.getElementById('scale')
    const inputMargin = document.getElementById('margin')
    const inputUseRect = document.getElementById('useRect')

    app.bindAction("button[data-command='Export']", () => {
      const scale = parseFloat(inputScale.value)
      const margin = parseFloat(inputMargin.value)
      if (checkInputValues(scale, margin)) {
        const rectangle =
          inputUseRect && inputUseRect.checked ? new yfiles.geometry.Rect(exportRect) : null

        // configure export, export the image and show a dialog to save the image
        clientSidePdfExport.scale = scale
        clientSidePdfExport.margins = new yfiles.geometry.Insets(margin)
        clientSidePdfExport.exportPdf(graphComponent.graph, rectangle).then(pdfUrl => {
          if (ieVersion !== -1) {
            // disable HTML preview in IE
            FileSaveSupport.save(pdfUrl, 'graph.pdf').catch(() => {
              alert(
                'Saving directly to the filesystem is not supported by this browser. Please use the server based export instead.'
              )
            })
          } else {
            showClientExportDialog(pdfUrl)
          }
        })
      }
    })

    app.bindAction("button[data-command='BatikServerExportButton']", () => {
      const scale = parseFloat(inputScale.value)
      const margin = parseFloat(inputMargin.value)
      if (checkInputValues(scale, margin)) {
        const rectangle =
          inputUseRect && inputUseRect.checked ? new yfiles.geometry.Rect(exportRect) : null

        // configure export, export the image and show a dialog to save the image
        serverSidePdfExport.scale = scale
        serverSidePdfExport.margins = new yfiles.geometry.Insets(margin)
        serverSidePdfExport.exportSvg(graphComponent.graph, rectangle).then(pdf => {
          showServerExportDialog(pdf.element, pdf.size, JAVA_SERVLET_URL)
        })
      }
    })
    app.bindAction("button[data-command='PhantomServerExportButton']", () => {
      const scale = parseFloat(inputScale.value)
      const margin = parseFloat(inputMargin.value)
      if (checkInputValues(scale, margin)) {
        const rectangle =
          inputUseRect && inputUseRect.checked ? new yfiles.geometry.Rect(exportRect) : null

        // configure export, export the image and show a dialog to save the image
        serverSidePdfExport.scale = scale
        serverSidePdfExport.margins = new yfiles.geometry.Insets(margin)
        serverSidePdfExport.exportSvg(graphComponent.graph, rectangle).then(pdf => {
          showServerExportDialog(pdf.element, pdf.size, PHANTOM_JS_URL)
        })
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
   * Requests the pdf export from the server, the file-dialog is displayed afterwards to save the graph.
   * @param {Element} svgElement
   * @param {yfiles.geometry.Size} size
   * @param {string} serverUrl
   */
  function showServerExportDialog(svgElement, size, serverUrl) {
    const svgString = yfiles.view.SvgExport.exportSvgString(svgElement)
    serverSidePdfExport.requestFile(serverUrl, 'pdf', svgString, size)

    hidePopup()
  }

  /**
   * Shows the export dialog for the client sided graph exports.
   * @param {string} pdfUrl
   */
  function showClientExportDialog(pdfUrl) {
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
        FileSaveSupport.save(pdfUrl, 'graph.pdf').catch(() => {
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
    // Create a GraphEditorInputMode instance
    const editMode = new yfiles.input.GraphEditorInputMode()

    // and install the edit mode into the canvas.
    graphComponent.inputMode = editMode

    // create the model for the export rectangle
    exportRect = new yfiles.geometry.MutableRectangle(-10, 0, 300, 160)

    // visualize it
    const installer = new yfiles.view.RectangleIndicatorInstaller(exportRect)
    installer.addCanvasObject(
      graphComponent.createRenderContext(),
      graphComponent.backgroundGroup,
      exportRect
    )

    addExportRectInputModes(editMode)
  }

  /**
   * Adds the view modes that handle the resizing and movement of the export rectangle.
   * @param {yfiles.input.MultiplexingInputMode} inputMode
   */
  function addExportRectInputModes(inputMode) {
    // create a mode that deals with the handles
    const exportHandleInputMode = new yfiles.input.HandleInputMode()
    exportHandleInputMode.priority = 1
    // add it to the graph editor mode
    inputMode.add(exportHandleInputMode)

    // now the handles
    const newDefaultCollectionModel = new yfiles.collections.ObservableCollection()
    newDefaultCollectionModel.add(
      new yfiles.input.RectangleHandle(yfiles.input.HandlePositions.NORTH_EAST, exportRect)
    )
    newDefaultCollectionModel.add(
      new yfiles.input.RectangleHandle(yfiles.input.HandlePositions.NORTH_WEST, exportRect)
    )
    newDefaultCollectionModel.add(
      new yfiles.input.RectangleHandle(yfiles.input.HandlePositions.SOUTH_EAST, exportRect)
    )
    newDefaultCollectionModel.add(
      new yfiles.input.RectangleHandle(yfiles.input.HandlePositions.SOUTH_WEST, exportRect)
    )
    exportHandleInputMode.handles = newDefaultCollectionModel

    // create a mode that allows for dragging the export rectangle at the sides
    const moveInputMode = new yfiles.input.MoveInputMode()
    moveInputMode.positionHandler = new PositionHandler(exportRect)
    moveInputMode.hitTestable = yfiles.input.IHitTestable.create((context, location) => {
      const path = new yfiles.geometry.GeneralPath(5)
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
    const newPolylineEdgeStyle = new yfiles.styles.PolylineEdgeStyle()
    newPolylineEdgeStyle.targetArrow = yfiles.styles.IArrow.DEFAULT
    graph.edgeDefaults.style = newPolylineEdgeStyle

    // set the workstation as default node style
    graph.nodeDefaults.style = new yfiles.styles.ImageNodeStyle('./resources/workstation.svg')
  }

  /**
   * Create a graph with network style nodes.
   */
  function createNetworkGraph() {
    const graph = graphComponent.graph
    graph.clear()

    const switchStyle = new yfiles.styles.ImageNodeStyle('./resources/switch.svg')
    const workstationStyle = new yfiles.styles.ImageNodeStyle('./resources/workstation.svg')

    const labelModel = new yfiles.graph.ExteriorLabelModel()
    const labelModelParameter1 = labelModel.createParameter(
      yfiles.graph.ExteriorLabelModelPosition.SOUTH
    )
    const labelModelParameter2 = labelModel.createParameter(
      yfiles.graph.ExteriorLabelModelPosition.NORTH
    )

    // create sample graph
    const n1 = graph.createNode(new yfiles.geometry.Rect(170, 20, 40, 40), switchStyle)
    const n2 = graph.createNode(new yfiles.geometry.Rect(20, 100, 40, 40), workstationStyle)
    const n3 = graph.createNode(new yfiles.geometry.Rect(120, 100, 40, 40), workstationStyle)
    const n4 = graph.createNode(new yfiles.geometry.Rect(220, 100, 40, 40), workstationStyle)
    const n5 = graph.createNode(new yfiles.geometry.Rect(320, 100, 40, 40), workstationStyle)

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

    const labelModel = new yfiles.graph.ExteriorLabelModel({ insets: 10 })

    graph.createNode({
      layout: [40, 50, 50, 50],
      style: new yfiles.styles.ShapeNodeStyle({ fill: 'orange' }),
      labels: [
        {
          text: 'Кирилица',
          style: new yfiles.styles.DefaultLabelStyle({
            font: new yfiles.view.Font({
              fontFamily: 'Prata',
              fontSize: 16
            })
          }),
          layoutParameter: labelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH)
        }
      ]
    })

    graph.createNode({
      layout: [190, 50, 50, 50],
      style: new yfiles.styles.ShapeNodeStyle({ fill: 'orange' }),
      labels: [
        {
          text: '平仮名',
          style: new yfiles.styles.DefaultLabelStyle({
            font: new yfiles.view.Font({
              fontFamily: "'Rounded Mplus 1c'",
              fontSize: 16
            })
          }),
          layoutParameter: labelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH)
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
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          resolve()
        }
      }
      xhr.open('POST', url, true)
      xhr.send('isAlive')
    })
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
    app.addClass(document.getElementById('popup'), 'hidden')
  }

  /**
   * Shows the export dialog.
   */
  function showPopup() {
    app.removeClass(document.getElementById('popup'), 'hidden')
  }

  // run the demo
  run()
})
