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
  'DecisionTree.js',
  'utils/ContextMenu',
  'GroupNodePortCandidateProvider.js',
  'yfiles/view-graphml',
  'yfiles/layout-hierarchic',
  'yfiles/view-layout-bridge',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  DecisionTree,
  ContextMenu,
  GroupNodePortCandidateProvider
) => {
  function run() {
    // initialize the GraphComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    // load the input module and initialize the input mode
    initializeInputModes()

    highlightManager = new yfiles.view.HighlightIndicatorManager(graphComponent)
    const startNodeHighlightInstaller = new yfiles.view.NodeStyleDecorationInstaller({
      nodeStyle: new yfiles.styles.ShapeNodeStyle({
        fill: null,
        stroke: '5px rgb(0, 153, 51)'
      }),
      zoomPolicy: 'world_coordinates',
      margins: 1.5
    })
    graphComponent.graph.decorator.nodeDecorator.highlightDecorator.setFactory(
      node => node === rootNode,
      node => startNodeHighlightInstaller
    )

    // initialize the context menu
    configureContextMenu()

    // initialize the graph
    initializeGraph()

    // enable GraphML support
    enableGraphML()
    // add the sample graphs
    ;['cars', 'what-to-do', 'quiz'].forEach(graph => {
      const option = document.createElement('option')
      option.text = graph
      option.value = graph
      graphChooserBox.add(option)
    })
    setTimeout(() => {
      readSampleGraph().then(showDecisionTree)
    }, 500)

    registerCommands()

    app.show()
  }

  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {yfiles.graphml.GraphMLSupport} */
  let graphMLSupport = null

  const graphChooserBox = document.querySelector("select[data-command='SelectedFileChanged']")
  const nextButton = document.querySelector("button[data-command='NextFile']")
  const previousButton = document.querySelector("button[data-command='PreviousFile']")

  const showDecisionTreeButton = document.getElementById('showDecisionTreeButton')
  const editDecisionTreeButton = document.getElementById('editDecisionTreeButton')

  let decisionTree = null

  let rootNode = null

  let highlightManager = null

  /**
   * Initializes the graph instance, setting default styles
   * and creating a small sample graph.
   */
  function initializeGraph() {
    // Assign the default demo styles
    const graph = graphComponent.graph
    DemoStyles.initDemoStyles(graph)

    // create a new style that uses the specified svg snippet as a template for the node.
    graph.nodeDefaults.size = new yfiles.geometry.Size(146, 35)
    graph.nodeDefaults.shareStyleInstance = false

    // and a style for the labels
    graph.nodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      wrapping: yfiles.view.TextWrapping.CHARACTER_ELLIPSIS,
      verticalTextAlignment: yfiles.view.VerticalTextAlignment.CENTER,
      horizontalTextAlignment: yfiles.view.HorizontalTextAlignment.CENTER
    })
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.InteriorStretchLabelModel.CENTER

    graph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
      node => graph.isGroupNode(node),
      node => new GroupNodePortCandidateProvider(node)
    )

    graphComponent.fitGraphBounds()
  }

  /**
   * Creates an editor mode and registers it as the
   * {@link yfiles.view.CanvasComponent#inputMode}.
   */
  function initializeInputModes() {
    // Create an editor input mode
    const graphEditorInputMode = new yfiles.input.GraphEditorInputMode()
    graphEditorInputMode.allowGroupingOperations = true

    // refresh the graph layout after an edge has been created
    graphEditorInputMode.createEdgeInputMode.addEdgeCreatedListener((sender, args) => {
      runIncrementalLayout(
        yfiles.collections.List.fromArray([args.item.sourceNode, args.item.targetNode])
      )
    })

    graphComponent.inputMode = graphEditorInputMode
  }

  /**
   * Initializes the context menu.
   */
  function configureContextMenu() {
    const inputMode = graphComponent.inputMode

    // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
    // context menu widget as well. See the Context Menu demo for more details about working with context menus.
    const contextMenu = new ContextMenu(graphComponent)

    // Add event listeners to the various events that open the context menu. These listeners then
    // call the provided callback function which in turn asks the current ContextMenuInputMode if a
    // context menu should be shown at the current location.
    contextMenu.addOpeningEventListeners(graphComponent, location => {
      if (inputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
        contextMenu.show(location)
      }
    })

    // Add and event listener that populates the context menu according to the hit elements, or cancels showing a menu.
    // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
    inputMode.addPopulateItemContextMenuListener((sender, args) =>
      populateContextMenu(contextMenu, args)
    )

    // Add a listener that closes the menu when the input mode requests this
    inputMode.contextMenuInputMode.addCloseMenuListener(() => {
      contextMenu.close()
    })

    // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
    contextMenu.onClosedCallback = () => {
      inputMode.contextMenuInputMode.menuClosed()
    }
  }

  /**
   * Populates the context menu based on the item the mouse hovers over.
   * @param {object} contextMenu The context menu.
   * @param {yfiles.input.PopulateItemContextMenuEventArgs} args The event args.
   */
  function populateContextMenu(contextMenu, args) {
    contextMenu.clearItems()

    const node = yfiles.graph.INode.isInstance(args.item) ? args.item : null

    if (!node || graphComponent.graph.isGroupNode(node)) {
      args.showMenu = false
      return
    }

    args.showMenu = true
    // If the cursor is over a node select it
    updateSelection(node)

    // Create the context menu items
    if (graphComponent.selection.selectedNodes.size > 0) {
      contextMenu.addMenuItem('Set as root node', () => setAsRootNode(args.item))
    } else {
      // no node has been hit
      contextMenu.addMenuItem('Clear root node', () => setAsRootNode(null))
    }
  }

  function setAsRootNode(node) {
    rootNode = node
    highlightManager.clearHighlights()
    if (node) {
      highlightManager.addHighlight(node)
    }
  }

  /**
   * Helper method that updates the node selection state when the context menu is opened on a node.
   * @param {yfiles.graph.INode} node The node or <code>null</code>.
   */
  function updateSelection(node) {
    if (node === null) {
      // clear the whole selection
      graphComponent.selection.clear()
    } else if (!graphComponent.selection.selectedNodes.isSelected(node)) {
      // no - clear the remaining selection
      graphComponent.selection.clear()
      // and select the node
      graphComponent.selection.selectedNodes.setSelected(node, true)
      // also update the current item
      graphComponent.currentItem = node
    }
  }

  /**
   * Indicates whether a layout is currently in calculation
   * @type {boolean}
   */
  let runningLayout = false

  function runLayout(animated) {
    const layout = new yfiles.hierarchic.HierarchicLayout()
    layout.backLoopRouting = true
    if (layout !== null && !runningLayout) {
      runningLayout = true
      const layoutExecutor = new yfiles.layout.LayoutExecutor(graphComponent, layout)
      layoutExecutor.animateViewport = false
      layoutExecutor.duration = animated ? '0.3s' : 0
      const promise = layoutExecutor.start()
      promise
        .then(o => {
          runningLayout = false
        })
        .catch(error => {
          if (typeof window.reportError === 'function') {
            window.reportError(error)
          }
        })
    }
  }

  function runIncrementalLayout(incrementalNodes) {
    const layout = new yfiles.hierarchic.HierarchicLayout()
    layout.layoutMode = yfiles.hierarchic.LayoutMode.INCREMENTAL
    layout.backLoopRouting = true
    if (layout !== null && !runningLayout) {
      runningLayout = true

      // configure the incremental hints
      const layoutData = new yfiles.hierarchic.HierarchicLayoutData()
      const incrementalNodesCollection = new yfiles.layout.ItemCollection()
      incrementalNodesCollection.items = incrementalNodes
      layoutData.incrementalHints.incrementalLayeringNodes = incrementalNodesCollection

      const layoutExecutor = new yfiles.layout.LayoutExecutor(graphComponent, layout)
      layoutExecutor.animateViewport = false
      layoutExecutor.layoutData = layoutData
      layoutExecutor.duration = '0.3s'
      const promise = layoutExecutor.start()
      promise
        .then(o => {
          runningLayout = false
        })
        .catch(error => {
          if (typeof window.reportError === 'function') {
            window.reportError(error)
          }
        })
    }
  }

  /**
   * Displays the decision tree component for the current graph
   */
  function showDecisionTree() {
    if (decisionTree) {
      // dispose the old decision tree
      decisionTree.dispose()
      decisionTree = null
    }
    try {
      // create a new decision tree with the current graph and display it in the DOM
      decisionTree = new DecisionTree(
        graphComponent.graph,
        rootNode,
        document.getElementById('decisionTree')
      )
      document.getElementById('graphComponent').style.display = 'none'
      document.getElementById('decisionTree').style.display = 'block'
      document.querySelector('#toolbar-decisiontree').style.display = 'block'
      document.querySelector('#toolbar-editor').style.display = 'none'
      showDecisionTreeButton.style.display = 'none'
      editDecisionTreeButton.style.display = 'block'
    } catch (e) {
      alert(
        'No suitable root node found. The root node is a node with no incoming edges, if not specified explicitly.'
      )
    }
  }

  /**
   * Closes the decision tree component and displays the complete graph
   */
  function editDecisionTree() {
    if (decisionTree) {
      // dispose the old decision tree
      decisionTree.dispose()
      decisionTree = null
    }
    document.getElementById('graphComponent').style.display = 'block'
    document.getElementById('decisionTree').style.display = 'none'
    document.querySelector('#toolbar-decisiontree').style.display = 'none'
    document.querySelector('#toolbar-editor').style.display = 'block'
    showDecisionTreeButton.style.display = 'block'
    editDecisionTreeButton.style.display = 'none'
    graphComponent.fitGraphBounds()
  }

  function registerCommands() {
    const iCommand = yfiles.input.ICommand

    app.bindAction("#toolbar-editor button[data-command='New']", () => {
      setAsRootNode(null)
      graphComponent.graph.clear()
      yfiles.input.ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
    })
    app.bindCommand(
      "#toolbar-editor button[data-command='Open']",
      iCommand.OPEN,
      graphComponent,
      null
    )
    app.bindCommand(
      "#toolbar-editor button[data-command='Save']",
      iCommand.SAVE,
      graphComponent,
      null
    )

    app.bindCommand(
      "#toolbar-editor button[data-command='ZoomIn']",
      iCommand.INCREASE_ZOOM,
      graphComponent,
      null
    )
    app.bindCommand(
      "#toolbar-editor button[data-command='ZoomOut']",
      iCommand.DECREASE_ZOOM,
      graphComponent,
      null
    )
    app.bindCommand(
      "#toolbar-editor button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      graphComponent,
      null
    )
    app.bindCommand(
      "#toolbar-editor button[data-command='ZoomOriginal']",
      iCommand.ZOOM,
      graphComponent,
      1.0
    )

    app.bindAction("#toolbar-editor button[data-command='Layout']", () => {
      runLayout(true)
    })

    // use dynamic actions to check if there is a decisionTree component
    app.bindAction("#toolbar-decisiontree button[data-command='ZoomIn']", () => {
      if (decisionTree) {
        iCommand.INCREASE_ZOOM.execute(null, decisionTree.graphComponent)
      }
    })
    app.bindAction("#toolbar-decisiontree button[data-command='ZoomOut']", () => {
      if (decisionTree) {
        iCommand.DECREASE_ZOOM.execute(null, decisionTree.graphComponent)
      }
    })
    app.bindAction("#toolbar-decisiontree button[data-command='FitContent']", () => {
      if (decisionTree) {
        iCommand.FIT_GRAPH_BOUNDS.execute(null, decisionTree.graphComponent)
      }
    })
    app.bindAction("#toolbar-decisiontree button[data-command='ZoomOriginal']", () => {
      if (decisionTree) {
        iCommand.ZOOM.execute(1, decisionTree.graphComponent)
      }
    })
    app.bindAction(
      "#toolbar-decisiontree button[data-command='PreviousFile']",
      onPreviousButtonClicked
    )
    app.bindAction("#toolbar-decisiontree button[data-command='NextFile']", onNextButtonClicked)
    app.bindChangeListener(
      "#toolbar-decisiontree select[data-command='SelectedFileChanged']",
      () => {
        setAsRootNode(null)
        readSampleGraph().then(showDecisionTree)
      }
    )
    app.bindAction("#toolbar-decisiontree button[data-command='Restart']", showDecisionTree)

    app.bindAction("*[data-command='ShowDecisionTree']", showDecisionTree)
    app.bindAction("*[data-command='EditDecisionTree']", editDecisionTree)
  }

  /**
   * Enables loading the graph to GraphML.
   */
  function enableGraphML() {
    const gs = new yfiles.graphml.GraphMLSupport({
      graphComponent,
      storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM,
      graphMLIOHandler: new yfiles.graphml.GraphMLIOHandler()
    })
    gs.graphMLIOHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      DemoStyles
    )
    graphMLSupport = gs
  }

  /**
   * Updates the previous/next button states.
   */
  function updateButtons() {
    nextButton.disabled = graphChooserBox.selectedIndex >= graphChooserBox.length - 1
    previousButton.disabled = graphChooserBox.selectedIndex <= 0
  }

  /**
   * Switches to the previous graph.
   */
  function onPreviousButtonClicked() {
    graphChooserBox.selectedIndex--
    setAsRootNode(null)
    readSampleGraph().then(showDecisionTree)
  }

  /**
   * Switches to the next graph.
   */
  function onNextButtonClicked() {
    graphChooserBox.selectedIndex++
    setAsRootNode(null)
    readSampleGraph().then(showDecisionTree)
  }

  /**
   * Helper method that reads the currently selected graphml from the combobox.
   * @return {Promise} A promise that is resolved when the graph is parsed.
   */
  function readSampleGraph() {
    // Disable navigation buttons while graph is loaded
    nextButton.disabled = true
    previousButton.disabled = true

    // first derive the file name
    const selectedItem = graphChooserBox.options[graphChooserBox.selectedIndex].value
    const fileName = `resources/${selectedItem}.graphml`
    // then load the graph
    return app
      .readGraph(graphMLSupport.graphMLIOHandler, graphComponent.graph, fileName)
      .then(() => {
        // when done - fit the bounds
        yfiles.input.ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
        // re-enable navigation buttons
        setTimeout(updateButtons, 100)
      })
  }

  // run the demo
  run()
})
