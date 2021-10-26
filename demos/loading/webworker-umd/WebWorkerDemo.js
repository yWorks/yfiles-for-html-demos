/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
'use strict'

/* eslint-disable no-alert */

require.config({
  packages: [
    {
      name: 'yfiles-umd',
      location: './node_modules/yfiles-umd/',
      main: 'complete'
    }
  ]
})

require([
  'yfiles-umd/view-editor',
  'yfiles-umd/view-folding',
  'yfiles-umd/view-layout-bridge',
  'yfiles-umd/layout-hierarchic'
], (/** @param {yfiles} yfiles */ yfiles) => {
  const {
    License,
    CollapsibleNodeStyleDecorator,
    Color,
    DefaultLabelStyle,
    GraphComponent,
    GraphEditorInputMode,
    WaitInputMode,
    ICommand,
    FoldingManager,
    DefaultFolderNodeConverter,
    ShapeNodeStyle,
    PolylineEdgeStyle,
    Arrow,
    ArrowType,
    FreeEdgeLabelModel,
    InteriorLabelModel,
    LayoutExecutorAsync,
    HierarchicLayoutData,
    NodeHalo
  } = yfiles
  let graphComponent = null

  const layoutButton = document.getElementById('layoutBtn')

  let executor = null
  const worker = new Worker('./WorkerLayout.js')
  worker.onmessage = e => {
    if (e.data === 'ready') {
      runWebWorkerLayout(true)
    }
  }

  function run(licenseData) {
    License.value = licenseData
    graphComponent = new GraphComponent('graphComponent')
    // initialize styles as well as graph
    graphComponent.inputMode = new GraphEditorInputMode({
      allowGroupingOperations: true
    })
    initializeGraph()
    createSampleGraph(graphComponent.graph)
    graphComponent.fitGraphBounds()

    registerCommands()
  }

  /**
   * Runs the web worker layout task.
   * @param {boolean} clearUndo Specifies whether the undo queue should be cleared after the layout
   * calculation. This is set to <code>true</code> if this method is called directly after
   * loading a new sample graph.
   */
  async function runWebWorkerLayout(clearUndo) {
    const layoutData = createLayoutData()
    const layoutDescriptor = createLayoutDescriptor()

    showLoading()

    // helper function that performs the actual message passing to the web worker
    function webWorkerMessageHandler(data) {
      return new Promise(resolve => {
        worker.onmessage = e => resolve(e.data)
        worker.postMessage(data)
      })
    }

    // create an asynchronous layout executor that calculates a layout on the worker
    executor = new LayoutExecutorAsync({
      messageHandler: webWorkerMessageHandler,
      graphComponent,
      layoutDescriptor,
      layoutData,
      duration: '1s',
      animateViewport: true,
      easedAnimation: true
    })

    // run the Web Worker layout
    await executor.start()

    if (clearUndo) {
      graphComponent.graph.undoEngine.clear()
    }

    hideLoading()
  }

  /**
   * Cancels the Web Worker and the layout executor. The layout is stopped and the graph stays the same.
   */
  async function cancelWebWorkerLayout() {
    await executor.cancel()
  }

  /**
   * Creates the object that describes the layout to the Web Worker layout executor.
   * @returns {LayoutDescriptor} The LayoutDescriptor for this layout
   */
  function createLayoutDescriptor() {
    return {
      name: 'HierarchicLayout',
      properties: {
        nodeToNodeDistance: 50,
        considerNodeLabels: true,
        integratedEdgeLabeling: true
      }
    }
  }

  /**
   * Creates the layout data that is used to execute the layout.
   * @returns The LayoutDescriptor for this layout
   */
  function createLayoutData() {
    return new HierarchicLayoutData({
      nodeHalos: node => NodeHalo.create(10),
      targetGroupIds: edge => edge.targetNode
    })
  }

  /**
   * Shows the wait cursor and disables editing during the layout calculation.
   */
  function showLoading() {
    layoutButton.disabled = true
    const statusElement = document.getElementById('graphComponentStatus')
    if (statusElement) {
      statusElement.style.setProperty('visibility', 'visible', '')
    }
    const waitMode = graphComponent.lookup(WaitInputMode.$class)
    if (waitMode !== null && !waitMode.waiting) {
      if (waitMode.controller !== null && waitMode.controller.canRequestMutex()) {
        waitMode.waiting = true
      }
    }
  }

  /**
   * Removes the wait cursor and restores editing after the layout calculation.
   */
  function hideLoading() {
    layoutButton.disabled = false
    const statusElement = document.getElementById('graphComponentStatus')
    if (statusElement !== null) {
      statusElement.style.setProperty('visibility', 'hidden', '')
    }
    const waitMode = graphComponent.lookup(WaitInputMode.$class)
    if (waitMode !== null) {
      waitMode.waiting = false
    }
  }

  /**
   * Registers the JavaScript commands for the GUI elements, typically the
   * tool bar buttons, during the creation of this application.
   */
  function registerCommands() {
    function bindCommand(selector, command, parameter = null) {
      const element = document.querySelector(selector)
      command.addCanExecuteChangedListener(() => {
        if (command.canExecute(parameter, graphComponent)) {
          element.removeAttribute('disabled')
        } else {
          element.setAttribute('disabled', 'disabled')
        }
      })
      element.addEventListener('click', e => {
        if (command.canExecute(parameter, graphComponent)) {
          command.execute(parameter, graphComponent)
        }
      })
    }

    bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
    bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
    bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
    bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
    bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
    bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
    document
      .querySelector("button[data-command='WebWorkerLayout']")
      .addEventListener('click', () => {
        runWebWorkerLayout(false)
      })

    function bindAction(selector, action) {
      const element = document.querySelector(selector)
      if (!element) {
        return
      }
      element.addEventListener('click', e => {
        action(e)
      })
    }

    bindAction("div[data-command='cancelLayout']", () => cancelWebWorkerLayout())
  }

  /**
   * Initializes the graph defaults and adds item created listeners that set a unique ID to each
   * new node and edge. The IDs are used in the exported JSON files to identify items in the graph
   * model.
   */
  function initializeGraph() {
    // Configure folding
    const manager = new FoldingManager()
    const dummyNodeConverter = new DefaultFolderNodeConverter()
    dummyNodeConverter.folderNodeSize = [150, 100]
    manager.folderNodeConverter = dummyNodeConverter

    const foldingView = manager.createFoldingView()
    foldingView.enqueueNavigationalUndoUnits = true
    graphComponent.graph = foldingView.graph

    // enable undo/redo support
    manager.masterGraph.undoEngineEnabled = true

    // Configure default styling etc.
    graphComponent.graph.nodeDefaults.style = new ShapeNodeStyle({
      fill: '#ff6c00',
      stroke: '1.5px #662b00',
      shape: 'round-rectangle'
    })
    graphComponent.graph.groupNodeDefaults.style = new CollapsibleNodeStyleDecorator(
      new ShapeNodeStyle({
        fill: 'white',
        stroke: '2px #0b7189'
      })
    )
    graphComponent.graph.edgeDefaults.style = new PolylineEdgeStyle({
      stroke: '1.5px #662b00',
      targetArrow: new Arrow({ type: ArrowType.TRIANGLE, color: Color.from('#662b00') })
    })

    // set default label styles
    graphComponent.graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER
    graphComponent.graph.edgeDefaults.labels.layoutParameter =
      FreeEdgeLabelModel.INSTANCE.createDefaultParameter()
    graphComponent.graph.nodeDefaults.labels.style = new DefaultLabelStyle({
      textFill: '#662b00',
      backgroundFill: '#FFC398',
      insets: [0, 2]
    })
    graphComponent.graph.edgeDefaults.labels.style = new DefaultLabelStyle({
      textFill: '#662b00',
      backgroundFill: '#c1a998',
      insets: [0, 2]
    })

    // Add listeners for item created events to add a tag to each new item
    const masterGraph = manager.masterGraph
    masterGraph.addNodeCreatedListener((source, evt) => {
      evt.item.tag = {
        id: (masterGraph.isGroupNode(evt.item) ? 'G-' : 'N-') + masterGraph.nodes.size
      }
    })
    masterGraph.addEdgeCreatedListener((source, evt) => {
      evt.item.tag = {
        id: `E-${masterGraph.edges.size}`
      }
    })
  }

  /**
   * Creates the sample graph for this demo.
   * @param {IGraph} graph The input graph to be filled.
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

    generateItemLabels(graph.edges.toList())
    generateItemLabels(graph.nodes.filter(node => !graph.isGroupNode(node)).toList())
  }

  /**
   * Generate and add random labels for a collection of ModelItems.
   * Existing items will be deleted before adding the new items.
   * @param {IList.<ILabelOwner>} items the collection of items the labels are
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
      const itemIdx = Math.floor(Math.random() * items.size)
      const item = items.get(itemIdx)
      items.removeAt(itemIdx)
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
  fetch('../../../lib/license.json').then(response => {
    response.json().then(json => {
      run(json)
    })
  })
})
