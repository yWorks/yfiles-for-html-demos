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
  'utils/JsonIO',
  'yfiles/view-folding',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles, jsonIO) => {
  let graphComponent = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    // initialize styles as well as graph
    graphComponent.inputMode = new yfiles.input.GraphEditorInputMode()
    initializeGraph()
    createSampleGraph(graphComponent.graph)
    graphComponent.fitGraphBounds()

    registerCommands()

    app.show(graphComponent)

    runNodeJSLayout(true)
  }

  /**
   * Runs the layout using the NodeJS server.
   * @param {boolean} clearUndo Specifies whether the undo queue should be cleared after the layout
   * calculation. This is set to <code>true</code> if this method is called directly after
   * loading a new sample graph.
   */
  function runNodeJSLayout(clearUndo) {
    showLoading()

    const request = new XMLHttpRequest()

    request.onreadystatechange = e => {}

    request.onerror = () => {
      if (clearUndo) {
        graphComponent.graph.undoEngine.clear()
      }
      hideLoading()
      alert(
        'Layout request failed. Is the layout server running? \n\nPlease start the layout server and reload the demo.\n'
      )
    }

    request.onload = () => {
      if (request.status === 200) {
        const responseText = request.responseText
        const json = JSON.parse(responseText)
        if (clearUndo) {
          graphComponent.graph.undoEngine.clear()
        }
        applyCalculatedLayout(json, clearUndo)
        hideLoading()
      } else {
        if (clearUndo) {
          graphComponent.graph.undoEngine.clear()
        }
        hideLoading()
        alert(
          'Layout request failed. Is the layout server running? \n\nPlease start the layout server and reload the demo.\n'
        )
      }
    }

    // transfer the graph structure and layout in JSON format
    const jsonWriter = new jsonIO.JSONWriter()
    jsonWriter.nodeIdProvider = n => n.tag.id

    // In addition to the default data, we need the insets for the layout calculation
    jsonWriter.nodeDataCreated = (data, node, graph) => {
      const insetsProvider = node.lookup(yfiles.input.INodeInsetsProvider.$class)
      if (insetsProvider !== null) {
        const insets = insetsProvider.getInsets(node)
        data.insets = {
          top: insets.top,
          right: insets.right,
          bottom: insets.bottom,
          left: insets.left
        }
      }
    }

    request.open('POST', 'http://localhost:3001/layout', true)
    // required for IE9 (otherwise the content-type header is empty)
    request.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8')
    request.send(JSON.stringify(jsonWriter.write(graphComponent.graph)))
  }

  /**
   * Applies the graph layout that was calculated by the NodeJS server to the graph.
   * @yjs:keep=nodeList,edgeList,graphBounds,id,layout
   * @param {Object} response The JSON object from the NodeJS server that specifies the new graph layout.
   * @param {boolean} clearUndo Specifies whether the undo queue should be cleared after the layout
   * calculation. This is set to <code>true</code> if this method is called directly after
   * loading a new sample graph.
   */
  function applyCalculatedLayout(response, clearUndo) {
    const nodes = response.nodeList
    const edges = response.edgeList

    // collect the resulting node, bend, port and label positions, so we
    // can animate to the new layout using IAnimation.createGraphAnimation
    const node2Layout = new yfiles.collections.Mapper()
    const edge2Bends = new yfiles.collections.Mapper()
    const port2Location = new yfiles.collections.Mapper()
    const label2Parameter = new yfiles.collections.Mapper()

    // make sure that the layout calculation is a single undo step
    const graph = graphComponent.graph
    const compoundEdit = graph.beginEdit('Layout', 'Layout')

    // collect the new node layouts
    for (let i1 = 0; i1 < nodes.length; i1++) {
      const nodeObj = nodes[i1]
      storeNodeLayout(node2Layout, label2Parameter, nodeObj)
    }

    // collect the new bend and port locations
    edges.forEach(edgeObj =>
      storeEdgeLayout(edge2Bends, node2Layout, port2Location, label2Parameter, edgeObj)
    )

    // the target port location parameters have to be created for node instances that
    // are already located at the final locations.
    const portMapper = yfiles.collections.IMapper.fromDelegate(port => {
      const location = port2Location.get(port)
      const ownerLayout = node2Layout.get(port.owner)
      if (location !== null && ownerLayout !== null) {
        const dummyNode = new yfiles.graph.SimpleNode()
        dummyNode.layout = ownerLayout
        return port.locationParameter.model.createParameter(dummyNode, location)
      }
      return port.locationParameter
    })

    // we also animate the viewport, so the full graph is visible after the layout animation
    const bounds = response.graphBounds
    const targetBounds = new yfiles.geometry.Rect(
      parseFloat(bounds.x),
      parseFloat(bounds.y),
      parseFloat(bounds.width),
      parseFloat(bounds.height)
    )
    // we ignore label locations here.
    const graphAnimation = yfiles.view.IAnimation.createGraphAnimation(
      graph,
      node2Layout,
      edge2Bends,
      portMapper,
      null,
      '1s'
    )
    const viewportAnimation = new yfiles.view.ViewportAnimation(graphComponent, targetBounds, '1s')
    viewportAnimation.targetViewMargins = new yfiles.geometry.Insets(10)
    const parallelAnimation = yfiles.view.IAnimation.createParallelAnimation([
      graphAnimation,
      viewportAnimation
    ])
    const animator = new yfiles.view.Animator(graphComponent)

    animator.animate(parallelAnimation).then(() => {
      compoundEdit.commit()
      if (clearUndo) {
        compoundEdit.cancel()
        graphComponent.graph.undoEngine.clear()
      }
      graphComponent.contentRect = targetBounds
    })
  }

  /**
   * Gets the label model parameter which describes the given label with findBestParameter.
   * @param {Object} labelObj The JSON label object from the NodeJS server that specifies the new label layout
   * @param {ILabel} dummyLabel A dummy label that is used to calculate the layout parameter.
   * @return {yfiles.graph.ILabelModelParameter} The parameter that best matches the new layout.
   */
  function getLabelParameter(labelObj, dummyLabel) {
    const model = dummyLabel.layoutParameter.model
    const parameterFinder = model.lookup(yfiles.graph.ILabelModelParameterFinder.$class)
    const layout = new yfiles.geometry.OrientedRectangle(
      labelObj.anchorX,
      labelObj.anchorY,
      labelObj.width,
      labelObj.height,
      labelObj.upX,
      labelObj.upY
    )
    return parameterFinder.findBestParameter(dummyLabel, model, layout)
  }

  /**
   * Stores the node layout copied from the NodeJS object to the map that holds the layout of the nodes of the graph.
   * @param {yfiles.collections.Mapper} node2Layout The map that stores the node layouts
   * @param {yfiles.collections.Mapper} label2Parameter The map that stores the label parameters.
   * @param {Object} nodeObj The JSON node object from the NodeJS server that specifies the new node layout
   */
  function storeNodeLayout(node2Layout, label2Parameter, nodeObj) {
    const node = graphComponent.graph.nodes.find(n => n.tag.id === nodeObj.tag.id)
    if (node !== null) {
      const objLayout = nodeObj.layout
      const x = parseFloat(objLayout.x)
      const y = parseFloat(objLayout.y)
      const w = parseFloat(objLayout.width)
      const h = parseFloat(objLayout.height)
      const newLayout = new yfiles.geometry.Rect(x, y, w, h)
      node2Layout.set(node, newLayout)

      // We need a dummy label with the new owner layout, so the ILabelModelParameterFinder can
      // calculate the parameter correctly.
      const dummyNode = new yfiles.graph.SimpleNode()
      dummyNode.layout = newLayout
      nodeObj.labels &&
        nodeObj.labels.forEach((labelObj, index) => {
          const label = node.labels.get(index)
          const dummyLabel = new yfiles.graph.SimpleLabel(
            dummyNode,
            label.text,
            label.layoutParameter
          )
          dummyLabel.preferredSize = label.preferredSize
          label2Parameter.set(label, getLabelParameter(labelObj.layout, dummyLabel))
        })
    }
  }

  /**
   * Shows the wait cursor and disables editing during the layout calculation.
   */
  function showLoading() {
    const statusElement = document.getElementById('graphComponentStatus')
    statusElement.style.setProperty('visibility', 'visible', '')
    const waitMode = graphComponent.lookup(yfiles.input.WaitInputMode.$class)
    if (waitMode !== null && !waitMode.waiting) {
      if (waitMode.controller !== null && waitMode.controller.canRequestMutex()) {
        waitMode.waiting = true
      }
    }
  }

  /**
   * Stores the edge layout alongside the port locations from the nodejs server's edge object to the respective maps
   * that hold the information for the graph.
   * @param {yfiles.collections.Mapper} edge2Bends The map that stores the edge bends.
   * @param {yfiles.collections.Mapper} node2Layout The map that stores the node layouts.
   * @param {yfiles.collections.Mapper} port2Location The map that stores the port locations.
   * @param {yfiles.collections.Mapper} label2Parameter The map that stores the label parameters.
   * @param {Object} edgeObj The JSON edge object from the nodejs server that specifies the new layout.
   */
  function storeEdgeLayout(edge2Bends, node2Layout, port2Location, label2Parameter, edgeObj) {
    const edge = graphComponent.graph.edges.find(e => e.tag.id === edgeObj.tag.id)
    if (edge !== null) {
      // We need a dummy label with the new source/target port layout, so the ILabelModelParameterFinder can
      // calculate the parameter correctly
      const dummySource = new yfiles.graph.SimpleNode()
      const dummyTarget = new yfiles.graph.SimpleNode()
      dummySource.layout = node2Layout.get(edge.sourcePort.owner)
      dummyTarget.layout = node2Layout.get(edge.targetPort.owner)
      const sourcePort = new yfiles.graph.SimplePort(dummySource, edge.sourcePort.locationParameter)
      const targetPort = new yfiles.graph.SimplePort(dummyTarget, edge.targetPort.locationParameter)

      const dummyEdge = new yfiles.graph.SimpleEdge(sourcePort, targetPort)

      if (Array.isArray(edgeObj.bends)) {
        const bends = []
        for (let i = 0; i < edgeObj.bends.length; i++) {
          bends.push(getLocationFromObj(edgeObj.bends[i]))
        }
        edge2Bends.set(edge, bends)
      }

      port2Location.set(edge.sourcePort, getLocationFromObj(edgeObj.sourcePort))
      port2Location.set(edge.targetPort, getLocationFromObj(edgeObj.targetPort))

      edgeObj.labels &&
        edgeObj.labels.forEach((labelObj, index) => {
          const label = edge.labels.get(index)
          const dummyLabel = new yfiles.graph.SimpleLabel(
            dummyEdge,
            label.text,
            label.layoutParameter
          )
          dummyLabel.preferredSize = label.preferredSize
          label2Parameter.set(label, getLabelParameter(labelObj.layout, dummyLabel))
        })
    }
  }

  /**
   * Removes the wait cursor and restores editing after the layout calculation.
   */
  function hideLoading() {
    const statusElement = document.getElementById('graphComponentStatus')
    if (statusElement !== null) {
      statusElement.style.setProperty('visibility', 'hidden', '')
    }
    const waitMode = graphComponent.lookup(yfiles.input.WaitInputMode.$class)
    if (waitMode !== null) {
      waitMode.waiting = false
    }
  }

  /**
   * Registers the JavaScript commands for the GUI elements, typically the
   * tool bar buttons, during the creation of this application.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent)
    app.bindAction("button[data-command='NodeJSLayout']", () => {
      runNodeJSLayout(false)
    })
  }

  /**
   * Initializes the graph defaults and adds item created listeners that set a unique ID to each new node and edge.
   * The IDs are used in the exported JSON files to identify items in the graph model.
   */
  function initializeGraph() {
    // Configure folding
    const manager = new yfiles.graph.FoldingManager()
    const dummyNodeConverter = new yfiles.graph.DefaultFolderNodeConverter()
    dummyNodeConverter.folderNodeSize = new yfiles.geometry.Size(150, 100)
    manager.folderNodeConverter = dummyNodeConverter

    const foldingView = manager.createFoldingView()
    foldingView.enqueueNavigationalUndoUnits = true
    graphComponent.graph = foldingView.graph

    // enable undo/redo support
    manager.masterGraph.undoEngineEnabled = true

    // Configure default styling etc.
    DemoStyles.initDemoStyles(graphComponent.graph)

    // set default label styles
    graphComponent.graph.nodeDefaults.labels.layoutParameter =
      yfiles.graph.InteriorLabelModel.CENTER
    graphComponent.graph.edgeDefaults.labels.layoutParameter = yfiles.graph.FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

    // Add listeners for item created events to add a tag to each new item
    const masterGraph = manager.masterGraph
    masterGraph.addNodeCreatedListener((source, evt) => {
      evt.item.tag = {
        id: (masterGraph.isGroupNode(evt.item) ? 'G-' : 'N-') + masterGraph.nodes.size
      }
    })
    masterGraph.addEdgeCreatedListener((source, evt) => {
      evt.item.tag = { id: `E-${masterGraph.edges.size}` }
    })
  }

  /**
   * Returns the location stored in the given JSON object.
   * @param {Object} obj The JSON object that contains the location.
   * @return {yfiles.geometry.Point} The location stored in the given JSON object.
   */
  function getLocationFromObj(obj) {
    const x = parseFloat(obj.x)
    const y = parseFloat(obj.y)
    return new yfiles.geometry.Point(x, y)
  }

  /**
   * Creates the sample graph for this demo.
   * @param {yfiles.graph.IGraph} graph The input graph to be filled.
   */
  function createSampleGraph(graph) {
    graph.clear()

    const root = graph.createNode()

    for (let i = 0; i < 3; i++) {
      const groupNode = graph.createGroupNode()
      const nestedGroupNode1 = graph.createGroupNode(groupNode)
      const nestedGroupNode2 = graph.createGroupNode(groupNode)

      const nodes = []
      for (let j = 0; j < 8; j++) {
        nodes[j] = graph.createNode()
        graph.setParent(nodes[j], groupNode)
      }

      for (let k = 8; k < 16; k++) {
        nodes[k] = graph.createNode()
        graph.setParent(nodes[k], nestedGroupNode1)
      }

      for (let l = 16; l < 27; l++) {
        nodes[l] = graph.createNode()
        graph.setParent(nodes[l], nestedGroupNode2)
      }

      graph.createEdge(root, nodes[18])
      graph.createEdge(nodes[3], nodes[7])
      graph.createEdge(nodes[0], nodes[1])
      graph.createEdge(nodes[0], nodes[4])
      graph.createEdge(nodes[1], nodes[2])
      graph.createEdge(nodes[0], nodes[9])
      graph.createEdge(nodes[6], nodes[10])
      graph.createEdge(nodes[11], nodes[12])
      graph.createEdge(nodes[11], nodes[13])
      graph.createEdge(nodes[8], nodes[11])
      graph.createEdge(nodes[15], nodes[16])
      graph.createEdge(nodes[16], nodes[17])
      graph.createEdge(nodes[18], nodes[19])
      graph.createEdge(nodes[20], nodes[21])
      graph.createEdge(nodes[7], nodes[17])
      graph.createEdge(nodes[9], nodes[22])
      graph.createEdge(nodes[22], nodes[3])
      graph.createEdge(nodes[19], nodes[0])
      graph.createEdge(nodes[8], nodes[4])
      graph.createEdge(nodes[18], nodes[25])
      graph.createEdge(nodes[24], nodes[8])
      graph.createEdge(nodes[26], nodes[25])
      graph.createEdge(nodes[10], nodes[20])
      graph.createEdge(nodes[5], nodes[23])
      graph.createEdge(nodes[25], nodes[15])
      graph.createEdge(nodes[10], nodes[15])
      graph.createEdge(nodes[21], nodes[17])
      graph.createEdge(nodes[26], nodes[6])
      graph.createEdge(nodes[13], nodes[12])
      graph.createEdge(nodes[12], nodes[14])
      graph.createEdge(nodes[14], nodes[11])
      graph.createEdge(nodes[21], nodes[5])
      graph.createEdge(nodes[5], nodes[6])
      graph.createEdge(nodes[9], nodes[7])
      graph.createEdge(nodes[19], nodes[24])
    }

    generateItemLabels(graph.edges)
    generateItemLabels(graph.nodes.filter(node => !graph.isGroupNode(node)))
  }

  /**
   * Generate and add random labels for a collection of ModelItems.
   * Existing items will be deleted before adding the new items.
   * @param {yfiles.collections.IEnumerable.<yfiles.model.IModelItem>} items the collection of items the labels are
   *   generated for
   */
  function generateItemLabels(items) {
    const wordCountMin = 1
    const wordCountMax = 3
    const labelPercMin = 0.2
    const labelPercMax = 0.7
    const labelCount = Math.floor(
      items.size * (Math.random() * (labelPercMax - labelPercMin) + labelPercMin)
    )
    const itemList = new yfiles.collections.List()
    items.forEach(item => {
      itemList.add(item)
    })

    // add random item labels
    const loremList = getLoremIpsum()
    for (let i = 0; i < labelCount; i++) {
      let label = ''
      const wordCount = Math.floor(Math.random() * (wordCountMax + 1 - wordCountMin)) + wordCountMin
      for (let j = 0; j < wordCount; j++) {
        const k = Math.floor(Math.random() * loremList.length)
        label += j === 0 ? '' : ' '
        label += loremList[k]
      }
      const itemIdx = Math.floor(Math.random() * itemList.size)
      const item = itemList.get(itemIdx)
      itemList.removeAt(itemIdx)
      graphComponent.graph.addLabel(item, label)
    }
  }

  /** @return {string[]} */
  function getLoremIpsum() {
    return [
      'lorem',
      'ipsum',
      'dolor',
      'sit',
      'amet',
      'consectetur',
      'adipiscing',
      'elit',
      'donec',
      'felis',
      'erat',
      'malesuada',
      'quis',
      'ipsum',
      'et',
      'condimentum',
      'ultrices',
      'orci',
      'nullam',
      'interdum',
      'vestibulum',
      'eros',
      'sed',
      'porta',
      'donec',
      'ac',
      'eleifend',
      'dolor',
      'at',
      'dictum',
      'ipsum',
      'pellentesque',
      'vel',
      'suscipit',
      'mi',
      'nullam',
      'aliquam',
      'turpis',
      'et',
      'dolor',
      'porttitor',
      'varius',
      'nullam',
      'vel',
      'arcu',
      'rutrum',
      'iaculis',
      'est',
      'sit',
      'amet',
      'rhoncus',
      'turpis',
      'vestibulum',
      'lacinia',
      'sollicitudin',
      'urna',
      'nec',
      'vestibulum',
      'nulla',
      'id',
      'lacinia',
      'metus',
      'etiam',
      'ac',
      'felis',
      'rutrum',
      'sollicitudin',
      'erat',
      'vitae',
      'egestas',
      'tortor',
      'curabitur',
      'quis',
      'libero',
      'aliquet',
      'mattis',
      'mauris',
      'nec',
      'tempus',
      'nibh',
      'in',
      'at',
      'lectus',
      'luctus',
      'mattis',
      'urna',
      'pretium',
      'eleifend',
      'lacus',
      'sed',
      'interdum',
      'sapien',
      'nec',
      'justo',
      'vestibulum',
      'non',
      'scelerisque',
      'nibh',
      'sollicitudin',
      'interdum',
      'et',
      'malesuada',
      'fames',
      'ac',
      'ante',
      'ipsum',
      'primis',
      'in',
      'faucibus',
      'vivamus',
      'congue',
      'tristique',
      'magna',
      'quis',
      'elementum',
      'phasellus',
      'sit',
      'amet',
      'tristique',
      'massa',
      'vestibulum',
      'eu',
      'leo',
      'vitae',
      'quam',
      'dictum',
      'venenatis',
      'eu',
      'id',
      'nibh',
      'donec',
      'eget',
      'eleifend',
      'felis',
      'nulla',
      'ac',
      'suscipit',
      'ante',
      'et',
      'sollicitudin',
      'dui',
      'mauris',
      'in',
      'pulvinar',
      'tortor',
      'vestibulum',
      'pulvinar',
      'arcu',
      'vel',
      'tellus',
      'maximus',
      'blandit',
      'morbi',
      'sed',
      'sem',
      'vehicula',
      'fermentum',
      'nisi',
      'eu',
      'fringilla',
      'metus',
      'duis',
      'ut',
      'quam',
      'eget',
      'odio',
      'hendrerit',
      'finibus',
      'ut',
      'a',
      'lectus',
      'cras',
      'ullamcorper',
      'turpis',
      'in',
      'purus',
      'facilisis',
      'vestibulum',
      'donec',
      'maximus',
      'ac',
      'tortor',
      'tempus',
      'egestas',
      'aenean',
      'est',
      'diam',
      'dictum',
      'et',
      'sodales',
      'vel',
      'efficitur',
      'ac',
      'libero',
      'vivamus',
      'vehicula',
      'ligula',
      'eu',
      'diam',
      'auctor',
      'at',
      'dapibus',
      'nulla',
      'pellentesque',
      'morbi',
      'et',
      'dapibus',
      'dolor',
      'quis',
      'auctor',
      'turpis',
      'nunc',
      'sed',
      'pretium',
      'diam',
      'quisque',
      'non',
      'massa',
      'consectetur',
      'tempor',
      'augue',
      'vel',
      'volutpat',
      'ex',
      'vivamus',
      'vestibulum',
      'dolor',
      'risus',
      'quis',
      'mollis',
      'urna',
      'fermentum',
      'sed',
      'sed',
      'porttitor',
      'venenatis',
      'volutpat',
      'nulla',
      'facilisi',
      'donec',
      'aliquam',
      'mi',
      'vitae',
      'ligula',
      'dictum',
      'ornare',
      'suspendisse',
      'finibus',
      'ligula',
      'vitae',
      'congue',
      'iaculis',
      'donec',
      'vestibulum',
      'erat',
      'vel',
      'tortor',
      'iaculis',
      'tempor',
      'vivamus',
      'et',
      'purus',
      'eu',
      'ipsum',
      'rhoncus',
      'pretium',
      'sit',
      'amet',
      'nec',
      'nisl',
      'nunc',
      'molestie',
      'consectetur',
      'rhoncus',
      'duis',
      'ex',
      'nunc',
      'interdum',
      'at',
      'molestie',
      'quis',
      'blandit',
      'quis',
      'diam',
      'nunc',
      'imperdiet',
      'lorem',
      'vel',
      'scelerisque',
      'facilisis',
      'eros',
      'massa',
      'auctor',
      'nisl',
      'vitae',
      'efficitur',
      'leo',
      'diam',
      'vel',
      'felis',
      'aliquam',
      'tincidunt',
      'dapibus',
      'arcu',
      'in',
      'pulvinar',
      'metus',
      'tincidunt',
      'et',
      'etiam',
      'turpis',
      'ligula',
      'sodales',
      'a',
      'eros',
      'vel',
      'fermentum',
      'imperdiet',
      'purus',
      'fusce',
      'mollis',
      'enim',
      'sed',
      'volutpat',
      'blandit',
      'arcu',
      'orci',
      'iaculis',
      'est',
      'non',
      'iaculis',
      'lorem',
      'sapien',
      'sit',
      'amet',
      'est',
      'morbi',
      'ut',
      'porttitor',
      'elit',
      'aenean',
      'ac',
      'sodales',
      'lectus',
      'morbi',
      'ut',
      'bibendum',
      'arcu',
      'maecenas',
      'tincidunt',
      'erat',
      'vel',
      'maximus',
      'pellentesque',
      'ut',
      'placerat',
      'quam',
      'sem',
      'a',
      'auctor',
      'ligula',
      'imperdiet',
      'quis',
      'pellentesque',
      'gravida',
      'consectetur',
      'urna',
      'suspendisse',
      'vitae',
      'nisl',
      'et',
      'ante',
      'ornare',
      'vulputate',
      'sed',
      'a',
      'est',
      'lorem',
      'ipsum',
      'dolor',
      'sit',
      'amet',
      'consectetur',
      'adipiscing',
      'elit',
      'sed',
      'eu',
      'facilisis',
      'lectus',
      'nullam',
      'iaculis',
      'dignissim',
      'eros',
      'eget',
      'tincidunt',
      'metus',
      'viverra',
      'at',
      'donec',
      'nec',
      'justo',
      'vitae',
      'risus',
      'eleifend',
      'imperdiet',
      'eget',
      'ut',
      'ante',
      'ut',
      'arcu',
      'ex',
      'convallis',
      'in',
      'lobortis',
      'at',
      'mattis',
      'sed',
      'velit',
      'ut',
      'viverra',
      'ultricies',
      'lacus',
      'suscipit',
      'feugiat',
      'eros',
      'luctus',
      'et',
      'vestibulum',
      'et',
      'aliquet',
      'mauris',
      'quisque',
      'convallis',
      'purus',
      'posuere',
      'aliquam',
      'nulla',
      'sit',
      'amet',
      'posuere',
      'orci',
      'nullam',
      'sed',
      'iaculis',
      'mauris',
      'ut',
      'volutpat',
      'est',
      'suspendisse',
      'in',
      'vestibulum',
      'felis',
      'nullam',
      'gravida',
      'nulla',
      'at',
      'varius',
      'fringilla',
      'ipsum',
      'ipsum',
      'finibus',
      'lectus',
      'nec',
      'vestibulum',
      'lorem',
      'arcu',
      'ut',
      'magna',
      'aliquam',
      'aliquam',
      'erat',
      'erat',
      'ac',
      'euismod',
      'orci',
      'iaculis',
      'blandit',
      'morbi',
      'tincidunt',
      'posuere',
      'mi',
      'non',
      'eleifend',
      'vivamus',
      'accumsan',
      'dolor',
      'magna',
      'in',
      'cursus',
      'eros',
      'malesuada',
      'eu',
      'sed',
      'auctor',
      'consectetur',
      'tempus',
      'maecenas',
      'luctus',
      'turpis',
      'a'
    ]
  }

  // start demo
  run()
})
