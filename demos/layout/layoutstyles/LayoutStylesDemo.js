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

/* eslint-disable global-require */

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
  'utils/ContextMenu',
  'resources/demo-option-editor',
  'yfiles/view-layout-bridge',
  'yfiles/view-folding',
  'yfiles/view-graphml',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles, ContextMenu) => {
  const demo = yfiles.module('demo')

  /**
   * The GraphComponent
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * The overview component
   * @type {yfiles.view.GraphOverviewComponent}
   */
  let overviewComponent = null

  /**
   * Stores all available layout algorithms and maps each name to the corresponding configuration.
   * @type {yfiles.collections.Map.<string,demo.LayoutConfiguration>}
   */
  let availableLayouts = null

  /**
   * The option editor that stores the currently selected layout configuration.
   * @type {demo.options.OptionEditor}
   */
  let optionEditor = null

  let configOptionsValid = false
  let inLayout = false
  let inLoadSample = false

  // get hold of some UI elements

  const layoutComboBox = /** @type {HTMLSelectElement} */ document.getElementById(
    'layout-select-box'
  )
  const sampleComboBox = /** @type {HTMLSelectElement} */ document.getElementById(
    'sample-combo-box'
  )
  const nextButton = document.getElementById('next-sample-button')
  const previousButton = document.getElementById('previous-sample-button')
  const layoutButton = document.getElementById('apply-layout-button')
  const resetButton = document.getElementById('reset-layout-button')
  const generateEdgeThicknessButton = document.getElementById('generate-edge-thickness-button')
  const resetEdgeThicknessButton = document.getElementById('reset-edge-thickness-button')
  const generateEdgeDirectionButton = document.getElementById('generate-edge-direction-button')
  const resetEdgeDirectionButton = document.getElementById('reset-edge-direction-button')

  function run() {
    // initialize the GraphComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    // initialize the GraphOverviewComponent
    overviewComponent = new yfiles.view.GraphOverviewComponent('overviewComponent', graphComponent)

    // wire up the UI
    registerCommands()

    configOptionsValid = true

    // we start loading the input mode
    graphComponent.inputMode = createEditorMode()

    setUIDisabled(true)
    // use the file system for built-in I/O
    enableGraphML()
    // initialize the property editor
    const editorElement = window.document.getElementById('data-editor')
    optionEditor = new demo.options.OptionEditor(editorElement)
    editorElement.addEventListener(
      'keypress',
      evt => {
        if (evt.key === 13) {
          applyLayout(false)
        }
      },
      false
    )

    // in order to load the sample graphs we require the styles and graphml
    // we populate the combo box
    ;[
      'Hierarchic',
      'Grouping',
      'Organic',
      'Orthogonal',
      'Circular',
      'Tree',
      'Balloon',
      'Radial',
      'Series-Parallel',
      'Polyline Router',
      'Bus Router',
      'Components',
      'Tabular',
      '-----------',
      'Organic with Substructures',
      'Hierarchic with Subcomponents',
      'Orthogonal with Substructures'
    ].forEach(sample => {
      const option = document.createElement('option')
      option.text = sample
      option.value = sample
      sampleComboBox.add(option)
      if (sample === '-----------') {
        option.disabled = true
      }
    })

    // initialize the graph and the defaults
    initializeGraph()
    // and create the sample graph
    createSampleGraph(graphComponent.graph)
    graphComponent.fitGraphBounds()

    // configure overview panel
    overviewComponent.graphVisualCreator = new DemoStyles.DemoStyleOverviewPaintable(
      graphComponent.graph
    )

    // after the initial graph is loaded, we continue loading with the algorithms
    initializeLayoutAlgorithms()

    // initialize the demo
    app.show(graphComponent, overviewComponent)
  }

  /**
   * Enables loading and saving the graph to GraphML.
   */
  function enableGraphML() {
    // create a new GraphMLSupport instance that handles save and load operations
    const gs = new yfiles.graphml.GraphMLSupport({
      graphComponent,
      // configure to load and save to the file system
      storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM
    })
    const ioh = new yfiles.graphml.GraphMLIOHandler()
    ioh.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      DemoStyles
    )
    gs.graphMLIOHandler = ioh
  }

  /**
   * Loads all layout modules and populates the layout combo box.
   */
  function initializeLayoutAlgorithms() {
    if (layoutComboBox === null) {
      return
    }

    availableLayouts = new yfiles.collections.Map()

    const layoutAlgorithmsNames = [
      'Hierarchic',
      'Organic',
      'Orthogonal',
      'Circular',
      'Tree',
      'Balloon',
      'Radial',
      'Series-Parallel',
      '-----------',
      'Polyline Router',
      'Channel Router',
      'Bus Router',
      'Organic Router',
      'Parallel Router',
      '-----------',
      'Labeling',
      'Components',
      'Tabular',
      'Partial',
      'Graph Transform'
    ]
    layoutComboBox.items = yfiles.collections.List.fromArray(layoutAlgorithmsNames)

    layoutAlgorithmsNames.forEach(name => {
      const option = document.createElement('option')
      option.text = name
      layoutComboBox.add(option)
      if (name === '-----------') {
        option.disabled = true
      }
    })

    // load hierarchic layout module
    require([
      'yfiles/layout-hierarchic',
      'yfiles/layout-tree',
      'yfiles/layout-organic',
      'yfiles/router-polyline',
      'HierarchicLayoutConfig.js'
    ], () => {
      availableLayouts.set('Hierarchic', new demo.HierarchicLayoutConfig())
      maybeLoadAsInitialSample('hierarchic', true)
      maybeLoadAsInitialSample('grouping')
      maybeLoadAsInitialSample('hierarchic with subcomponents')
    })

    // load organic layout module
    require(['yfiles/layout-organic', 'OrganicLayoutConfig.js'], () => {
      availableLayouts.set('Organic', new demo.OrganicLayoutConfig())
      maybeLoadAsInitialSample('organic')
      maybeLoadAsInitialSample('organic with substructures')
    })

    // load orthogonal layout module
    require(['yfiles/layout-orthogonal', 'OrthogonalLayoutConfig.js'], () => {
      availableLayouts.set('Orthogonal', new demo.OrthogonalLayoutConfig())
      maybeLoadAsInitialSample('orthogonal')
      maybeLoadAsInitialSample('orthogonal with substructures')
    })

    // load circular layout module
    require(['yfiles/layout-organic', 'CircularLayoutConfig.js'], () => {
      availableLayouts.set('Circular', new demo.CircularLayoutConfig())
      maybeLoadAsInitialSample('circular')
    })

    // load tree layout module
    require([
      'yfiles/layout-tree',
      'yfiles/router-other',
      'yfiles/router-polyline',
      'TreeLayoutConfig.js'
    ], () => {
      availableLayouts.set('Tree', new demo.TreeLayoutConfig())
      maybeLoadAsInitialSample('tree')
    })

    // load balloon layout module
    require([
      'yfiles/layout-tree',
      'yfiles/router-other',
      'yfiles/router-polyline',
      'BalloonLayoutConfig.js'
    ], () => {
      availableLayouts.set('Balloon', new demo.BalloonLayoutConfig())
      maybeLoadAsInitialSample('balloon')
    })

    // load radial layout module
    require(['yfiles/layout-radial', 'RadialLayoutConfig.js'], () => {
      availableLayouts.set('Radial', new demo.RadialLayoutConfig())
      maybeLoadAsInitialSample('radial')
    })

    // load series-parallel layout module
    require([
      'yfiles/layout-seriesparallel',
      'yfiles/router-polyline',
      'SeriesParallelLayoutConfig.js'
    ], () => {
      availableLayouts.set('Series-Parallel', new demo.SeriesParallelLayoutConfig())
      maybeLoadAsInitialSample('series-parallel')
    })

    // load polyline router module
    require(['yfiles/router-polyline', 'PolylineEdgeRouterConfig.js'], () => {
      availableLayouts.set('Polyline Router', new demo.PolylineEdgeRouterConfig())
      maybeLoadAsInitialSample('polyline router')
    })

    // load channel router module
    require(['yfiles/router-other', 'ChannelEdgeRouterConfig.js'], () => {
      availableLayouts.set('Channel Router', new demo.ChannelEdgeRouterConfig())
    })

    // load bus router module
    require(['yfiles/router-other', 'BusEdgeRouterConfig.js'], () => {
      availableLayouts.set('Bus Router', new demo.BusEdgeRouterConfig())
      maybeLoadAsInitialSample('bus router')
    })

    // load organic router module
    require(['yfiles/router-other', 'OrganicEdgeRouterConfig.js'], () => {
      availableLayouts.set('Organic Router', new demo.OrganicEdgeRouterConfig())
    })

    // load parallel edge layout module
    require(['yfiles/router-other', 'ParallelEdgeRouterConfig.js'], () => {
      availableLayouts.set('Parallel Router', new demo.ParallelEdgeRouterConfig())
    })

    // load labeling module
    require(['yfiles/router-other', 'LabelingConfig.js'], () => {
      availableLayouts.set('Labeling', new demo.LabelingConfig())
    })

    // load component layout module
    require(['yfiles/layout-seriesparallel', 'ComponentLayoutConfig.js'], () => {
      availableLayouts.set('Components', new demo.ComponentLayoutConfig())
      maybeLoadAsInitialSample('components')
    })

    // load tabular layout module
    require(['yfiles/layout-seriesparallel', 'TabularLayoutConfig.js'], () => {
      availableLayouts.set('Tabular', new demo.TabularLayoutConfig())
      maybeLoadAsInitialSample('tabular')
    })

    // load partial layout module
    require(['yfiles/layout-organic', 'PartialLayoutConfig.js'], () => {
      availableLayouts.set('Partial', new demo.PartialLayoutConfig())
    })

    // load graph transformer layout module
    require(['yfiles/layout-seriesparallel', 'GraphTransformerConfig.js'], () => {
      availableLayouts.set('Graph Transform', new demo.GraphTransformerConfig())
    })
  }

  /**
   * Reset the configuration.
   */
  function resetConfig() {
    const selectedIndex = layoutComboBox.selectedIndex
    if (selectedIndex >= 0) {
      const key = layoutComboBox[selectedIndex].value
      if (key !== null && availableLayouts !== null && availableLayouts.has(key)) {
        switch (key) {
          case 'Hierarchic':
            availableLayouts.set(key, new demo.HierarchicLayoutConfig())
            break
          case 'Organic':
            availableLayouts.set(key, new demo.OrganicLayoutConfig())
            break
          case 'Orthogonal':
            availableLayouts.set(key, new demo.OrthogonalLayoutConfig())
            break
          case 'Circular':
            availableLayouts.set(key, new demo.CircularLayoutConfig())
            break
          case 'Tree':
            availableLayouts.set(key, new demo.TreeLayoutConfig())
            break
          case 'Balloon':
            availableLayouts.set(key, new demo.BalloonLayoutConfig())
            break
          case 'Radial':
            availableLayouts.set(key, new demo.RadialLayoutConfig())
            break
          case 'Labeling':
            availableLayouts.set(key, new demo.LabelingConfig())
            break
          case 'Components':
            availableLayouts.set(key, new demo.ComponentLayoutConfig())
            break
          case 'Tabular':
            availableLayouts.set(key, new demo.TabularLayoutConfig())
            break
          case 'Partial':
            availableLayouts.set(key, new demo.PartialLayoutConfig())
            break
          case 'Graph Transform':
            availableLayouts.set(key, new demo.GraphTransformerConfig())
            break
          case 'Polyline Router':
            availableLayouts.set(key, new demo.PolylineEdgeRouterConfig())
            break
          case 'Channel Router':
            availableLayouts.set(key, new demo.ChannelEdgeRouterConfig())
            break
          case 'Bus Router':
            availableLayouts.set(key, new demo.BusEdgeRouterConfig())
            break
          case 'Organic Router':
            availableLayouts.set(key, new demo.OrganicEdgeRouterConfig())
            break
          case 'Parallel Router':
            availableLayouts.set(key, new demo.ParallelEdgeRouterConfig())
            break
          default:
            availableLayouts.set(key, new demo.HierarchicLayoutConfig())
            break
        }
        onLayoutChanged()
      }
    }
  }

  /**
   * Applies the layout algorithm of the given key.
   * @param {string} key
   */
  function applyLayoutForKey(key) {
    // center the initial position of the animation
    yfiles.input.ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)

    let forceUpdateConfigPanel = false
    if (key === 'Organic with Substructures' || key === 'Organic') {
      key = 'Organic'
      forceUpdateConfigPanel = true
    }
    if (key === 'Hierarchic with Subcomponents' || key === 'Hierarchic') {
      key = 'Hierarchic'
      forceUpdateConfigPanel = true
    }
    if (key === 'Orthogonal with Substructures' || key === 'Orthogonal') {
      key = 'Orthogonal'
      forceUpdateConfigPanel = true
    }
    // get the layout and use 'Hierarchic' if the key is unknown (shouldn't happen in this demo)
    const actualKey = availableLayouts !== null && availableLayouts.has(key) ? key : 'Hierarchic'
    const actualIndex = getIndexInComboBox(actualKey, layoutComboBox)
    // run the layout if the layout combo box is already correct
    if (layoutComboBox.selectedIndex !== actualIndex || forceUpdateConfigPanel) {
      // otherwise, change the selection and indirectly trigger the layout
      layoutComboBox.selectedIndex = actualIndex
      onLayoutChanged()
    }
    applyLayout(true)
  }

  /**
   * Returns the index of the first option with the given text (ignoring case).
   * @param {string} text The text to match.
   * @param {HTMLSelectElement} combobox The combobox to search.
   * @return {number} The index of the first option with the given text (ignoring case), or -1 if no such option exists.
   */
  function getIndexInComboBox(text, combobox) {
    const lowerCaseText = text.toLowerCase()
    const options = combobox.options
    for (let i = 0; i < options.length; i++) {
      if (options[i].text && options[i].text.toLowerCase() === lowerCaseText) {
        return i
      }
    }
    return -1
  }

  /**
   * Actually applies the layout.
   * @param {boolean} clearUndo Specifies whether the undo queue should be cleared after the layout
   * calculation. This is set to <code>true</code> if this method is called directly after
   * loading a new sample graph.
   */
  function applyLayout(clearUndo) {
    const config = optionEditor.config

    if (!config || !configOptionsValid || inLayout) {
      return
    }

    // prevent starting another layout calculation
    inLayout = true
    setUIDisabled(true)

    config.apply(graphComponent, () => {
      releaseLocks()
      setUIDisabled(false)
      updateUIState()
      if (clearUndo) {
        graphComponent.graph.undoEngine.clear()
      }
    })
  }

  /**
   * Handles a selection change in the layout combo box.
   */
  function onLayoutChanged() {
    if (layoutComboBox === null) {
      return
    }
    const sampleGraphKey = sampleComboBox.options[sampleComboBox.selectedIndex].value
    const key = layoutComboBox.options[layoutComboBox.selectedIndex]
      ? layoutComboBox.options[layoutComboBox.selectedIndex].text
      : null
    if (key != null && availableLayouts !== null && availableLayouts.has(key)) {
      graphComponent.graph.edgeDefaults.style.showTargetArrows = isLayoutDirected(key)
      const config = availableLayouts.get(key)
      if (key === 'Hierarchic' || key === 'Hierarchic with Subcomponents') {
        // enable edge-thickness buttons only for Hierarchic Layout
        generateEdgeThicknessButton.disabled = false
        resetEdgeThicknessButton.disabled = false
        generateEdgeDirectionButton.disabled = false
        resetEdgeDirectionButton.disabled = false
      } else {
        // disable edge-thickness buttons only for all other layouts
        generateEdgeThicknessButton.disabled = true
        resetEdgeThicknessButton.disabled = true
        generateEdgeDirectionButton.disabled = true
        resetEdgeDirectionButton.disabled = true
        onResetEdgeThicknesses(graphComponent.graph)
        onResetEdgeDirections(graphComponent.graph)
      }

      if (sampleGraphKey === 'Organic with Substructures' && key === 'Organic') {
        config.enableSubstructures()
      }
      if (sampleGraphKey === 'Hierarchic with Subcomponents' && key === 'Hierarchic') {
        config.enableSubstructures()
      }
      if (sampleGraphKey === 'Orthogonal with Substructures' && key === 'Orthogonal') {
        config.enableSubstructures()
      }

      optionEditor.config = config
      optionEditor.validateConfigCallback = b => {
        configOptionsValid = b
        layoutButton.disabled = !(configOptionsValid && !inLayout)
      }
    }
  }

  /**
   * Handles a selection change in the sample combo box.
   */
  function onSampleChanged() {
    if (inLayout || inLoadSample) {
      return
    }
    const key = sampleComboBox.options[sampleComboBox.selectedIndex].value
    const graph = graphComponent.graph
    if (key === null || key === 'None') {
      // no specific item - just clear the graph
      graph.clear()
      // and fit the contents
      yfiles.input.ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
      return
    }
    inLoadSample = true
    setUIDisabled(true)
    graph.edgeDefaults.style.showTargetArrows = isLayoutDirected(key)
    if (key === 'Hierarchic') {
      // enable edge-thickness and edge-direction buttons only for Hierarchic Layout
      generateEdgeThicknessButton.disabled = false
      resetEdgeThicknessButton.disabled = false
      generateEdgeDirectionButton.disabled = false
      resetEdgeDirectionButton.disabled = false
      // the hierarchic graph is the sample graph that does not require GraphML I/O
      createSampleGraph(graph)
      applyLayoutForKey(key)
    } else {
      if (key === 'Grouping') {
        // enable edge-thickness and edge-direction buttons only for Hierarchic Layout
        generateEdgeThicknessButton.disabled = false
        resetEdgeThicknessButton.disabled = false
        generateEdgeDirectionButton.disabled = false
        resetEdgeDirectionButton.disabled = false
      } else {
        // disable edge-thickness and edge-direction buttons for all other layouts
        generateEdgeThicknessButton.disabled = true
        resetEdgeThicknessButton.disabled = true
        generateEdgeDirectionButton.disabled = true
        resetEdgeDirectionButton.disabled = true
      }
      // derive the file name from the key and
      const fileName = key.toLowerCase().replace(/[-\s]/g, '')
      const filePath = `resources/${fileName}.graphml`
      // load the sample graph and start the layout algorithm in the done handler
      const ioh = new yfiles.graphml.GraphMLIOHandler()
      ioh.addXamlNamespaceMapping(
        'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
        DemoStyles
      )
      ioh
        .readFromURL(graph, filePath)
        .then(() => {
          applyLayoutForKey(key)
        })
        .catch(error => {
          if (
            graph.nodes.size === 0 &&
            window.location.protocol.toLowerCase().indexOf('file') >= 0
          ) {
            alert(
              'Unable to open the sample graph. A default graph will be loaded instead. Perhaps your browser does not ' +
                'allow handling cross domain HTTP requests. Please see the demo readme for details.'
            )
            // the sample graph cannot be loaded, so we run the default graph
            createSampleGraph(graph)
            require(['yfiles/layout-hierarchic'], () => {
              if (sampleComboBox.selectedIndex === 9 || sampleComboBox.selectedIndex === 10) {
                graph.applyLayout(new yfiles.hierarchic.HierarchicLayout())
              }
              applyLayoutForKey(key)
            })
          }
          if (typeof window.reportError === 'function') {
            window.reportError(error)
          }
        })
    }
  }

  /**
   * Generate and add random labels for a collection of ModelItems.
   * Existing items will be deleted before adding the new items.
   * @param {yfiles.collections.IEnumerable.<yfiles.model.IModelItem>} items the collection of items the labels are
   *   generated for
   */
  function onGenerateItemLabels(items) {
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
    // remove all existing item labels
    items.forEach(item => {
      const labels = new yfiles.collections.List()
      item.labels.forEach(label => {
        labels.add(label)
      })
      labels.forEach(label => {
        graphComponent.graph.remove(label)
      })
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

  /**
   * @param {yfiles.graph.IGraph} graph
   */
  function onRemoveItemLabels(graph) {
    const labels = new yfiles.collections.List()
    graph.edges.forEach(edge => edge.labels.forEach(label => labels.add(label)))
    graph.nodes.forEach(node => node.labels.forEach(label => labels.add(label)))
    labels.forEach(label => graph.remove(label))
  }

  /**
   * @param {yfiles.graph.IGraph} graph
   */
  function onGenerateEdgeThicknesses(graph) {
    graph.edges.forEach(edge => {
      const oldStyle = edge.style
      const thickness = Math.random() * 4 + 1
      const style = new yfiles.styles.PolylineEdgeStyle({
        stroke: new yfiles.view.Stroke({
          fill: 'rgb(51, 102, 153)',
          thickness
        })
      })
      if (oldStyle instanceof yfiles.styles.PolylineEdgeStyle) {
        style.targetArrow = oldStyle.targetArrow
      } else {
        style.targetArrow = oldStyle.showTargetArrows
          ? new DemoStyles.DemoArrow()
          : yfiles.styles.IArrow.NONE
      }
      graph.setStyle(edge, style)
    })
  }

  /**
   * @param {yfiles.graph.IGraph} graph
   */
  function onResetEdgeThicknesses(graph) {
    graph.edges.forEach(edge => {
      let showTargetArrow = false
      const oldStyle = edge.style
      if (oldStyle instanceof yfiles.styles.PolylineEdgeStyle) {
        showTargetArrow = oldStyle.targetArrow !== yfiles.styles.IArrow.NONE
      } else if (oldStyle instanceof DemoStyles.DemoEdgeStyle) {
        showTargetArrow = oldStyle.showTargetArrows
      }
      const edgeStyle = new DemoStyles.DemoEdgeStyle()
      edgeStyle.showTargetArrows = showTargetArrow
      graph.setStyle(edge, edgeStyle)
    })
    graph.invalidateDisplays()
  }

  /**
   * @param {yfiles.graph.IGraph} graph
   */
  function onGenerateEdgeDirections(graph) {
    graph.edges.forEach(edge => {
      const directed = Math.random() >= 0.5
      const style = edge.style
      if (style instanceof yfiles.styles.PolylineEdgeStyle) {
        style.targetArrow = directed ? new DemoStyles.DemoArrow() : yfiles.styles.IArrow.NONE
      } else {
        graph.setStyle(edge, new DemoStyles.DemoEdgeStyle())
        edge.style.showTargetArrows = directed
      }
    })
    graph.invalidateDisplays()
  }

  /**
   * @param {yfiles.graph.IGraph} graph
   */
  function onResetEdgeDirections(graph, directed) {
    graph.edges.forEach(edge => {
      const style = edge.style
      if (style instanceof yfiles.styles.PolylineEdgeStyle) {
        style.targetArrow =
          typeof directed !== 'undefined' || style.targetArrow !== null
            ? new DemoStyles.DemoArrow()
            : null
      } else {
        graph.setStyle(edge, new DemoStyles.DemoEdgeStyle())
        edge.style.showTargetArrows =
          typeof directed !== 'undefined' ? directed : style.showTargetArrows
      }
    })
    graph.invalidateDisplays()
  }

  /**
   * Initializes the graph instance and set default styles.
   */
  function initializeGraph() {
    const graph = graphComponent.graph

    // Enable grouping and undo support.
    graph.undoEngineEnabled = true

    // set some nice defaults
    DemoStyles.initDemoStyles(graph)
  }

  /**
   * Creates the default input mode for the <code>GraphComponent</code>,
   * a {@link yfiles.input.GraphEditorInputMode}.
   * @return {yfiles.input.IInputMode} a new <code>GraphEditorInputMode</code> instance configured for snapping and
   *   orthogonal edge editing
   */
  function createEditorMode() {
    const newGraphSnapContext = new yfiles.input.GraphSnapContext({
      enabled: false,
      gridSnapType: yfiles.input.GridSnapTypes.NONE
    })

    const newLabelSnapContext = new yfiles.input.LabelSnapContext({
      enabled: false
    })

    // create default interaction with snapping and orthogonal edge editing
    const mode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true,
      snapContext: newGraphSnapContext,
      labelSnapContext: newLabelSnapContext,
      orthogonalEdgeEditingContext: new yfiles.input.OrthogonalEdgeEditingContext()
    })
    // initially disable the orthogonal edge editing;
    mode.orthogonalEdgeEditingContext.enabled = false

    mode.navigationInputMode.collapsingGroupsAllowed = false
    mode.navigationInputMode.expandingGroupsAllowed = false

    // make bend creation more important than moving of selected edges
    // this has the effect that dragging a selected edge (not its bends)
    // will create a new bend instead of moving all bends
    // This is especially nicer in conjunction with orthogonal
    // edge editing because this creates additional bends every time
    // the edge is moved otherwise
    mode.createBendInputMode.priority = mode.moveInputMode.priority - 1

    // also we add a context menu
    initializeContextMenu(mode)

    return mode
  }

  /**
   * @param {yfiles.input.GraphInputMode} inputMode
   */
  function initializeContextMenu(inputMode) {
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
   * Populates the context menu based on the item the mouse hovers over
   * @param {ContextMenu} contextMenu
   * @param {yfiles.input.PopulateItemContextMenuEventArgs<IModelItem>} args
   */
  function populateContextMenu(contextMenu, args) {
    contextMenu.clearItems()

    // get the item which is located at the mouse position
    const hits = graphComponent.graphModelManager.hitTester.enumerateHits(
      args.context,
      args.queryLocation
    )

    // check whether a node was it. If it was, we prefer it over edges
    const hit = hits.find(item => yfiles.graph.INode.isInstance(item)) || hits.firstOrDefault()

    if (hit === null) {
      // empty canvas hit: provide 'select all'
      contextMenu.addMenuItem('Select All', evt => {
        yfiles.input.ICommand.SELECT_ALL.execute(null, graphComponent)
      })
    }

    const graphSelection = graphComponent.selection

    // if a node or an edge is hit: provide 'Select All Nodes' or 'Select All Edges', respectively
    // also: select the hit item
    if (yfiles.graph.INode.isInstance(hit)) {
      contextMenu.addMenuItem('Select All Nodes', evt => {
        graphComponent.selection.clear()
        graphComponent.graph.nodes.forEach(node => {
          graphComponent.selection.setSelected(node, true)
        })
      })
      if (!graphSelection.isSelected(hit)) {
        graphSelection.clear()
      }
      graphSelection.setSelected(hit, true)
    } else if (yfiles.graph.IEdge.isInstance(hit)) {
      contextMenu.addMenuItem('Select All Edges', evt => {
        graphComponent.selection.clear()
        graphComponent.graph.edges.forEach(edge => {
          graphComponent.selection.setSelected(edge, true)
        })
      })
      if (!graphSelection.isSelected(hit)) {
        graphSelection.clear()
      }
      graphSelection.setSelected(hit, true)
    }
    // if one or more nodes are selected: add options to cut and copy
    if (graphSelection.selectedNodes.count > 0) {
      contextMenu.addMenuItem('Cut', evt => {
        yfiles.input.ICommand.CUT.execute(null, graphComponent)
      })
      contextMenu.addMenuItem('Copy', evt => {
        yfiles.input.ICommand.COPY.execute(null, graphComponent)
      })
    }
    if (!graphComponent.clipboard.empty) {
      // clipboard is not empty: add option to paste
      contextMenu.addMenuItem('Paste', evt => {
        yfiles.input.ICommand.PASTE.execute(args.queryLocation, graphComponent)
      })
    }

    // finally, if the context menu has at least one entry, set the showMenu flag
    if (contextMenu.element.childNodes.length > 0) {
      args.showMenu = true
    }
  }

  /**
   * Wire up the UI...
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    // called by the demo framework initially so that the button commands can be bound to actual commands and actions
    app.bindAction("button[data-command='New']", () => {
      graphComponent.graph.clear()
      graphComponent.graph.undoEngine.clear()
    })
    app.bindCommand("button[data-command='Open']", iCommand.OPEN, graphComponent, null)
    app.bindCommand("button[data-command='Save']", iCommand.SAVE, graphComponent, null)

    app.bindCommand(
      "button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindCommand("button[data-command='Cut']", iCommand.CUT, graphComponent, null)
    app.bindCommand("button[data-command='Copy']", iCommand.COPY, graphComponent, null)
    app.bindCommand("button[data-command='Paste']", iCommand.PASTE, graphComponent, null)
    app.bindCommand("button[data-command='Delete']", iCommand.DELETE, graphComponent, null)

    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent, null)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent, null)

    app.bindCommand(
      "button[data-command='GroupSelection']",
      iCommand.GROUP_SELECTION,
      graphComponent,
      null
    )
    app.bindCommand(
      "button[data-command='UngroupSelection']",
      iCommand.UNGROUP_SELECTION,
      graphComponent,
      null
    )

    app.bindAction('#snapping-button', () => {
      const snappingEnabled = document.querySelector('#snapping-button').checked
      graphComponent.inputMode.snapContext.enabled = snappingEnabled
      graphComponent.inputMode.labelSnapContext.enabled = snappingEnabled
    })

    app.bindAction('#orthogonal-editing-button', () => {
      graphComponent.inputMode.orthogonalEdgeEditingContext.enabled = document.querySelector(
        '#orthogonal-editing-button'
      ).checked
    })

    app.bindAction("button[data-command='LayoutCommand']", () => {
      applyLayout(false)
    })
    app.bindAction("button[data-command='ResetConfigCommand']", resetConfig)
    app.bindChangeListener("select[data-command='LayoutSelectionChanged']", onLayoutChanged)
    app.bindChangeListener("select[data-command='SampleSelectionChanged']", onSampleChanged)

    app.bindAction("button[data-command='PreviousFile']", () => {
      // skip the '-------'
      if (sampleComboBox.selectedIndex === 14) {
        sampleComboBox.selectedIndex--
      }
      sampleComboBox.selectedIndex--
      onSampleChanged()
    })
    app.bindAction("button[data-command='NextFile']", () => {
      // skip the '-------'
      if (sampleComboBox.selectedIndex === 12) {
        sampleComboBox.selectedIndex++
      }
      sampleComboBox.selectedIndex++
      onSampleChanged()
    })

    app.bindAction("button[data-command='GenerateNodeLabels']", () => {
      onGenerateItemLabels(graphComponent.graph.nodes)
    })
    app.bindAction("button[data-command='GenerateEdgeLabels']", () => {
      onGenerateItemLabels(graphComponent.graph.edges)
    })
    app.bindAction("button[data-command='RemoveLabels']", () => {
      onRemoveItemLabels(graphComponent.graph)
    })
    app.bindAction("button[data-command='GenerateEdgeThicknesses']", () => {
      onGenerateEdgeThicknesses(graphComponent.graph)
    })
    app.bindAction("button[data-command='ResetEdgeThicknesses']", () => {
      onResetEdgeThicknesses(graphComponent.graph)
    })
    app.bindAction("button[data-command='GenerateEdgeDirections']", () => {
      onGenerateEdgeDirections(graphComponent.graph)
    })
    app.bindAction("button[data-command='ResetEdgeDirections']", () => {
      onResetEdgeDirections(graphComponent.graph, true)
    })
  }

  /**
   * Checks whether the given sample is the one that is requested in the hash part of the URL, and loads it if it is.
   * @param {string} sample The name of the sample to check.
   * @param {boolean} isDefault Whether the given sample is the default one.
   */
  function maybeLoadAsInitialSample(sample, isDefault = false) {
    // First, get the normalized sample name from the hash part of the URL
    let requestedSample = ''
    if (window.location.hash) {
      const match = window.location.hash.match(/#([\w_-]+)/)
      if (match && match.length > 1) {
        requestedSample = match[1].toLowerCase().replace(/_/g, ' ')
      }
    }

    // use the default sample if
    // - no sample was requested explicitly, or
    // - the requested sample does not match any existing sample, or
    // - the default sample was explicitly requested
    const useDefaultSample =
      getIndexInComboBox(requestedSample, sampleComboBox) === -1 || sample === requestedSample

    if (isDefault && useDefaultSample) {
      // In contrast to the other branch, this one does not load a GraphML file and works only for the first
      // ('hierarchic') sample.
      onLayoutChanged()
      applyLayout(true)
    } else if (sample === requestedSample) {
      // If the given sample is the requested one, load the given sample as initial sample
      sampleComboBox.selectedIndex = getIndexInComboBox(sample, sampleComboBox)
      onSampleChanged()
    }
  }

  function releaseLocks() {
    inLoadSample = false
    inLayout = false
  }

  /**
   * Enables the HTML elements and the input mode.
   * @param {boolean} disabled true if the elements should be disabled, false otherwise
   */
  function setUIDisabled(disabled) {
    document.querySelector("button[data-command='New']").disabled = disabled
    document.querySelector("button[data-command='Open']").disabled = disabled
    document.querySelector("button[data-command='Save']").disabled = disabled
    sampleComboBox.disabled = disabled
    nextButton.disabled = disabled
    previousButton.disabled = disabled
    layoutButton.disabled = disabled
    resetButton.disabled = disabled
    graphComponent.inputMode.waiting = disabled
  }

  function updateUIState() {
    sampleComboBox.disabled = false
    nextButton.disabled = sampleComboBox.selectedIndex >= sampleComboBox.length - 1
    previousButton.disabled = sampleComboBox.selectedIndex <= 0
    layoutButton.disabled = !(configOptionsValid && !inLayout)
  }

  /**
   * Returns whether or not the current layout algorithm considers edge directions.
   * @param {string} key The descriptor of the current layout.
   * @return {boolean}
   */
  function isLayoutDirected(key) {
    return key !== 'Organic' && key !== 'Orthogonal' && key !== 'Circular'
  }

  /**
   * Programmatically creates a sample graph so that we do not require GraphML I/O for this demo.
   */
  function createSampleGraph(graph) {
    graph.clear()
    const nodes = []
    for (let i = 0; i < 27; i++) {
      nodes[i] = graph.createNode()
    }

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
