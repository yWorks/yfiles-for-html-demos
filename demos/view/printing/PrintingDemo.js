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
  'resources/demo-styles',
  'PrintingSupport.js',
  'PositionHandler.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  PrintingSupport,
  PositionHandler
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /**
   * region that will be exported and displayed in the demo
   * @type {yfiles.geometry.MutableRectangle}
   */
  let exportRect = null

  let margin = null

  let scale = null

  let useRect = null

  let useTilePrinting = null

  let useTileWidth = null

  let useTileHeight = null

  /**
   * Runs the demo.
   */
  function run() {
    init()

    initializeInputModes()
    initializeGraph()

    // wire up the printing button
    app.bindAction("button[data-command='Print']", printButtonClick)

    app.show(graphComponent)
  }

  /**
   * Initializes the UI's elements.
   */
  function init() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    scale = document.getElementById('scale')
    margin = document.getElementById('margin')
    useRect = document.getElementById('useRect')
    useTilePrinting = document.getElementById('useTilePrinting')
    useTileWidth = document.getElementById('tileWidth')
    useTileHeight = document.getElementById('tileHeight')
  }

  /**
   * Initializes the input mode.
   */
  function initializeInputModes() {
    // Create a GraphEditorInputMode instance
    const editMode = new yfiles.input.GraphEditorInputMode()

    // and install the edit mode into the canvas.
    graphComponent.inputMode = editMode

    // create the model for the export rectangle
    exportRect = new yfiles.geometry.MutableRectangle(0, 0, 100, 100)

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
   * Initializes the graph instance and set default styles.
   */
  function initializeGraph() {
    const graph = graphComponent.graph
    // initialize the default styles
    DemoStyles.initDemoStyles(graph)

    // create sample graph
    graph.addLabel(graph.createNodeAt(new yfiles.geometry.Point(30, 30)), 'Node')
    const node = graph.createNodeAt(new yfiles.geometry.Point(90, 30))
    graph.createEdge(node, graph.createNodeAt(new yfiles.geometry.Point(90, 90)))
    graph.createEdge(node, graph.createNodeAt(new yfiles.geometry.Point(200, 30)))

    graphComponent.fitGraphBounds()
  }

  /**
   * Adds the input modes that handle the resizing and movement of the export rectangle.
   * @param {yfiles.input.GraphEditorInputMode} inputMode
   */
  function addExportRectInputModes(inputMode) {
    // create a mode that deals with the handles
    const exportHandleInputMode = new yfiles.input.HandleInputMode()
    exportHandleInputMode.priority = 1
    // add it to the graph editor mode
    inputMode.add(exportHandleInputMode)

    // create handles for interactive resizing the export rectangle
    const exportHandles = new yfiles.collections.ObservableCollection()
    exportHandles.add(
      new yfiles.input.RectangleHandle(yfiles.input.HandlePositions.NORTH_EAST, exportRect)
    )
    exportHandles.add(
      new yfiles.input.RectangleHandle(yfiles.input.HandlePositions.NORTH_WEST, exportRect)
    )
    exportHandles.add(
      new yfiles.input.RectangleHandle(yfiles.input.HandlePositions.SOUTH_EAST, exportRect)
    )
    exportHandles.add(
      new yfiles.input.RectangleHandle(yfiles.input.HandlePositions.SOUTH_WEST, exportRect)
    )
    exportHandleInputMode.handles = exportHandles

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
   * Actually perform the printing upon the click of the print button.
   */
  function printButtonClick() {
    if (!isNumber(scale.value, 'Scale') || !isNumber(margin.value, 'Margin')) {
      return
    }
    if (
      useTilePrinting.checked &&
      (!isNumber(scale.value, 'Tile width') || !isNumber(margin.value, 'Tile height'))
    ) {
      return
    }

    // we use a helper class
    const printingSupport = new PrintingSupport()

    printingSupport.scale = parseFloat(scale.value)
    printingSupport.margin = parseInt(margin.value, 10)
    printingSupport.tiledPrinting = useTilePrinting.checked
    printingSupport.tileWidth = parseInt(useTileWidth.value, 10)
    printingSupport.tileHeight = parseInt(useTileHeight.value, 10)

    // finally start the "printing" process.
    // this will open a new document in a separate browser window/tab and use
    // the javascript "print()" method of the browser to print the document.
    printingSupport.printGraph(graphComponent.graph, useRect.checked ? exportRect.toRect() : null)
  }

  /**
   * @param {number} number
   * @param {string} text
   * @return {boolean}
   */
  function isNumber(number, text) {
    if (isNaN(parseFloat(number))) {
      alert(`${text} must be a valid number.`)
      return false
    }
    return true
  }

  // run the demo
  run()
})
