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
  ArcEdgeStyle,
  Arrow,
  ArrowType,
  DefaultLabelStyle,
  DefaultPortCandidate,
  EdgeStyleDecorationInstaller,
  EventRecognizers,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  FilteredGraphWrapper,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphMLSupport,
  GraphOverviewComponent,
  ICommand,
  IEdge,
  ILabel,
  INode,
  InputModeEventArgs,
  Insets,
  InteriorLabelModel,
  ItemClickedEventArgs,
  Key,
  LabelEventArgs,
  License,
  List,
  ModifierKeys,
  MouseEventRecognizers,
  NinePositionsEdgeLabelModel,
  Rect,
  StorageLocation,
  StyleDecorationZoomPolicy
} from 'yfiles'

import MindmapEdgeStyleExtension from './MindmapEdgeStyleExtension.js'
import MindmapNodeStyleExtension from './MindmapNodeStyleExtension.js'
import MindmapNodeStyleRootExtension from './MindmapNodeStyleRootExtension.js'
import StateLabelDecoratorExtension from './StateLabelDecoratorExtension.js'
import CollapseDecoratorExtension from './CollapseDecoratorExtension.js'
import MindmapPopupSupport from './MindmapPopupSupport.js'
import MindmapGraphModelManager from './MindmapGraphModelManager.js'
import StateLabelDecorator from './StateLabelDecorator.js'
import MindmapEdgeStyle from './MindmapEdgeStyle.js'
import MindmapNodeStyle from './MindmapNodeStyle.js'
import MindmapNodeStyleRoot from './MindmapNodeStyleRoot.js'
import CollapseDecorator from './CollapseDecorator.js'
import { ArcEdgeHandleProvider, SubtreePositionHandler } from './MindmapPositionHandlers.js'
import {
  CenterPortCandidateProvider,
  MyArcEdgeStyleRenderer,
  Structure,
  TagChangeUndoUnit
} from './MindmapUtil.js'
import MindmapEditorInputMode from './MindmapEditorInputMode.js'
import { bindAction, bindCommand, passiveSupported, showApp } from '../../resources/demo-app.js'
import MindmapOverviewGraphVisualCreator from './MindmapOverviewGraphVisualCreator.js'
import MindmapLayout from './MindmapLayout.js'
import DemoCommands from './DemoCommands.js'
import loadJson from '../../resources/load-json.js'

// This demo shows how to implement a Mindmap viewer and editor.
//
// The demo provides the following features:
// - Create and delete nodes using a popup menu or keyboard shortcuts
// - Relocate or delete subtrees
// - Save and load the mindmap
// - Collapse and expand nodes
// - Decorate nodes with state icons
// - Edit the color of nodes
// - Add cross reference edges between nodes

/**
 * The GraphComponent
 * @type GraphComponent
 */
let graphComponent = null

/**
 * The Overview Component
 * @type {GraphOverviewComponent}
 */
let overviewComponent = null

/**
 * A filtered graph hiding the collapsed nodes.
 * @type {FilteredGraphWrapper}
 */
let filteredGraph = null

/**
 * The main popup menu.
 * @type {MindmapPopupSupport}
 */
let nodePopupMain = null

/**
 * The color popup menu.
 * @type {MindmapPopupSupport}
 */
let nodePopupColor = null

/**
 * The state label icon popup menu.
 * @type {MindmapPopupSupport}
 */
let nodePopupIcon = null

/**
 * The array of node styles used for nodes at different depths.
 * The style at position i in array is used for nodes at depth i of tree.
 * @type {INodeStyle[]}
 */
let nodeStyles = null

/**
 * The array of edge styles used for edges at different depths.
 * The style at position i in array is used for edges from depth i to depth i+1 of tree.
 * @type {IEdgeStyle[]}
 */
let edgeStyles = null

/**
 * The array of label styles used for node labels at different depths.
 * The style at position i in array is used for labels at depth i of tree.
 * @type {ILabelStyle[]}
 */
let labelStyles = null

/**
 * The subtree root that is dragged.
 * @type {INode}
 */
let movedNode = null

/**
 * Holds the old tag data of a node.
 * @type {object}
 */
let oldTagData = null

/**
 * Holds the commands and interactions supported by the demo.
 * @type {DemoCommands}
 */
let demoCommands = null

/**
 * The graphml support.
 * @type {GraphMLSupport}
 */
let gs = null

/**
 * The GraphML IO Handler
 * @type {GraphMLIOHandler}
 */
let ioh = null

function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('graphComponent')
  overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)

  demoCommands = new DemoCommands(graphComponent)

  initializeInputModes()
  initializeGraph()
  initializeNodeStyle()
  initializeEdgeStyle()
  initializeGraphFiltering()
  initializeCanvasOrder()
  initializeNodePopups()
  enableUndo()

  const graph = graphComponent.graph

  // Register selection events
  graphComponent.selection.addItemSelectionChangedListener(onItemClicked)

  // Set maximum zoom factor of viewport to 2.0
  graphComponent.maximumZoom = 2.0

  // Initialize the layout
  MindmapLayout.instance.addMappers(graph)

  // Create the IO Handler
  createGraphMLIOHandler()

  // Enable GraphML support
  enableGraphML()

  // Read the graph
  readGraph('resources/hobbies.graphml')

  // configure overview panel
  overviewComponent.graphVisualCreator = new MindmapOverviewGraphVisualCreator(graph)

  // Wires up the UI.
  registerCommands()

  showApp(graphComponent, overviewComponent)
}

/**
 * Initializes and customizes the input mode.
 * The mindmap demo uses a customized version of the {@link GraphEditorInputMode} to implement
 * interactions. Various options must be set to custom values to ensure desired behaviour.
 */
function initializeInputModes() {
  const graphEditorInputMode = new MindmapEditorInputMode({
    // customize default behaviour
    allowCreateNode: false,
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL,
    clickSelectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    movableItems: GraphItemTypes.NODE,
    showHandleItems: GraphItemTypes.EDGE,
    labelEditableItems:
      GraphItemTypes.LABEL_OWNER | GraphItemTypes.NODE_LABEL | GraphItemTypes.EDGE_LABEL,
    deletableItems: GraphItemTypes.NONE,
    allowClipboardOperations: false,
    autoRemoveEmptyLabels: false
  })
  graphEditorInputMode.addItemLeftClickedListener(onItemClicked)
  graphEditorInputMode.addItemDoubleClickedListener(onItemDoubleClicked)
  graphEditorInputMode.addLabelTextChangedListener(onLabelTextChanged)

  // enable panning without ctrl-key pressed
  graphEditorInputMode.moveViewportInputMode.pressedRecognizer = MouseEventRecognizers.LEFT_DOWN
  graphEditorInputMode.moveInputMode.priority =
    graphEditorInputMode.moveViewportInputMode.priority - 1

  // register handlers for dragging and relocating subtrees
  graphEditorInputMode.moveInputMode.addDragStartedListener(onDragStarted)
  graphEditorInputMode.moveInputMode.addDraggedListener(onDragged)
  graphEditorInputMode.moveInputMode.addDragCanceledListener(onDragCanceled)
  graphEditorInputMode.moveInputMode.addDragFinishedListener(onDragFinished)
  const createEdgeInputMode = graphEditorInputMode.createEdgeInputMode
  // disable CreateEdgeInputMode
  createEdgeInputMode.enabled = false
  createEdgeInputMode.allowCreateBend = false
  // disable CreateEdgeInputMode after cross reference edge has been created
  createEdgeInputMode.addEdgeCreatedListener(() => {
    createEdgeInputMode.enabled = false
  })
  createEdgeInputMode.addGestureCanceledListener(() => {
    createEdgeInputMode.enabled = false
  })
  // customize edge creation
  createEdgeInputMode.edgeCreator = Structure.createCrossReferenceEdge

  disableMultiSelection(graphEditorInputMode)

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Disables the selection of multiple graph items using mouse/keyboard gestures.
 * Only one item may be selected at a time.
 * @param {GraphEditorInputMode} mode The input mode.
 */
function disableMultiSelection(mode) {
  // disable marquee selection
  mode.marqueeSelectionInputMode.enabled = false
  // disable multi selection with Ctrl-Click
  mode.multiSelectionRecognizer = EventRecognizers.NEVER

  // deactivate commands that can lead to multi selection
  mode.availableCommands.remove(ICommand.TOGGLE_ITEM_SELECTION)
  mode.availableCommands.remove(ICommand.SELECT_ALL)

  mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_LEFT)
  mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_UP)
  mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_DOWN)
  mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_RIGHT)
}

/**
 * Initializes and customizes graph related functionality.
 */
function initializeGraph() {
  // get the node decorator
  const nodeDecorator = graphComponent.graph.decorator.nodeDecorator
  // customize the position handler
  nodeDecorator.positionHandlerDecorator.setImplementationWrapper((item, implementation) => {
    if (Structure.getRoot(filteredGraph.wrappedGraph) !== item) {
      return new SubtreePositionHandler(implementation)
    }
    return null
  })
  // customize the port candidate provider to ensure that cross reference edges connect to the node center
  nodeDecorator.portCandidateProviderDecorator.setFactory(
    node => new CenterPortCandidateProvider(node)
  )
}

/**
 * Sets the default styles for the nodes.
 */
function initializeNodeStyle() {
  nodeStyles = [
    new CollapseDecorator(new MindmapNodeStyleRoot('level0'), passiveSupported),
    new CollapseDecorator(new MindmapNodeStyle('level1'), passiveSupported),
    new CollapseDecorator(new MindmapNodeStyle('level2'), passiveSupported)
  ]
  edgeStyles = [new MindmapEdgeStyle(25, 8), new MindmapEdgeStyle(8, 3), new MindmapEdgeStyle(3, 3)]
  labelStyles = [
    new StateLabelDecorator(new DefaultLabelStyle({ font: '30px Arial' })),
    new StateLabelDecorator(new DefaultLabelStyle({ font: '18px Arial' })),
    new StateLabelDecorator(new DefaultLabelStyle({ font: '16px Arial' }))
  ]
}

/**
 * Runs all initialization required for the custom cross reference edges.
 */
function initializeEdgeStyle() {
  const graph = graphComponent.graph

  // disable all edge handles but height handle
  graph.decorator.edgeDecorator.handleProviderDecorator.setFactory(
    edge => new ArcEdgeHandleProvider(edge)
  )

  graph.edgeDefaults.style = new ArcEdgeStyle({
    stroke: '8px lightskyblue',
    height: 50,
    targetArrow: new Arrow({
      fill: 'lightskyblue',
      stroke: 'lightskyblue',
      scale: 2,
      type: ArrowType.SHORT
    }),
    provideHeightHandle: true
  })
  // clone the style for each edge
  graph.edgeDefaults.shareStyleInstance = false
  graph.edgeDefaults.labels.layoutParameter = NinePositionsEdgeLabelModel.CENTER_BELOW

  graph.edgeDefaults.labels.style = new DefaultLabelStyle({
    font: '16px Arial',
    backgroundFill: 'white',
    insets: [3, 5, 3, 5]
  })

  // initialize custom edge selection style
  const edgeSelection = graph.decorator.edgeDecorator.selectionDecorator
  edgeSelection.setImplementation(
    new EdgeStyleDecorationInstaller({
      edgeStyle: new ArcEdgeStyle({
        renderer: new MyArcEdgeStyleRenderer(),
        stroke: '6px rgb(255, 255, 0)',
        height: 50,
        targetArrow: new Arrow({
          fill: 'rgb(255, 255, 0)',
          stroke: null,
          cropLength: 0.5,
          scale: 1.75,
          type: ArrowType.SHORT
        })
      }),
      zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
    })
  )
}

/**
 * Initializes filtering for hiding nodes.
 */
function initializeGraphFiltering() {
  const graph = graphComponent.graph

  filteredGraph = new FilteredGraphWrapper(graph, nodePredicate, edge => true)
  graphComponent.graph = filteredGraph
}

/**
 * Predicate for the filtered graph wrapper that
 * indicates whether a node should be visible.
 * @param {INode} node The node to be tested.
 * @return {boolean} True if the node should be visible, false otherwise.
 */
function nodePredicate(node) {
  // return true if none of the parent nodes is collapsed
  const edge = Structure.getInEdge(node, filteredGraph.wrappedGraph)
  if (edge !== null) {
    const parent = edge.sourcePort.owner
    return (node === movedNode || !Structure.isCollapsed(parent)) && nodePredicate(parent)
  }
  return true
}

/**
 * Initializes the visual order of canvas objects.
 */
function initializeCanvasOrder() {
  const graphModelManager = new MindmapGraphModelManager(
    graphComponent,
    graphComponent.contentGroup
  )

  // put the group above the node group
  graphModelManager.crossReferenceEdgeGroup.above(graphModelManager.nodeGroup)

  // put edge labels above node labels
  graphModelManager.edgeLabelGroup.above(graphModelManager.nodeLabelGroup)
  graphComponent.graphModelManager = graphModelManager
}

/**
 * Creates and initializes popup menus.
 * There are 3 popup menus:
 * <ul>
 * <li>{@link nodePopupMain Main popup} for general graph commands</li>
 * <li>{@link nodePopupColor Color popup} to assign a color to a node</li>
 * <li>{@link nodePopupIcon State icon popup} to assign a state icon to a node</li>
 * </ul>
 */
function initializeNodePopups() {
  const nodeLabelModel = new ExteriorLabelModel({ insets: 10 })
  const nodeLabelModelParameter = nodeLabelModel.createParameter(ExteriorLabelModelPosition.NORTH)
  const nodePopupContent = window.document.getElementById('nodePopupContent')
  nodePopupMain = new MindmapPopupSupport(graphComponent, nodePopupContent, nodeLabelModelParameter)

  nodePopupMain.div.addEventListener(
    'click',
    () => {
      nodePopupMain.currentItem = null
    },
    false
  )
  window.document.getElementById('btnSetState').addEventListener(
    'click',
    () => {
      nodePopupMain.currentItem = null
      nodePopupIcon.currentItem = graphComponent.currentItem
    },
    false
  )
  window.document.getElementById('btnSetColor').addEventListener(
    'click',
    () => {
      nodePopupMain.currentItem = null
      nodePopupColor.currentItem = graphComponent.currentItem
    },
    false
  )
  window.document.getElementById('btnCreateCrossReference').addEventListener(
    'click',
    () => {
      if (!MindmapLayout.instance.inLayout) {
        const node = graphComponent.currentItem
        startCrossReferenceEdgeCreation(node)
      }
    },
    false
  )
  window.document.getElementById('btnCreateNode').addEventListener(
    'click',
    () => {
      const tag = graphComponent.currentItem.tag
      demoCommands.executeCreateChildren(
        getNodeStyle(tag.depth + 1),
        getEdgeStyle(tag.depth),
        getLabelStyle(tag.depth + 1)
      )
    },
    false
  )
  window.document.getElementById('btnDeleteNode').addEventListener(
    'click',
    () => {
      demoCommands.executeDeleteItem()
    },
    false
  )
  const nodeLabelModelColor = new ExteriorLabelModel({ insets: 10 })
  const nodeLabelModelColorParameter = nodeLabelModelColor.createParameter(
    ExteriorLabelModelPosition.NORTH
  )

  const nodePopupColorContent = window.document.getElementById('colorPopupContent')
  nodePopupColor = new MindmapPopupSupport(
    graphComponent,
    nodePopupColorContent,
    nodeLabelModelColorParameter
  )

  const colorContainer = nodePopupColor.div
  colorContainer.addEventListener(
    'click',
    () => {
      nodePopupColor.currentItem = null
    },
    false
  )
  // create color popup menu
  const colors = [
    '#FF6502',
    '#D82622',
    '#FF91FF',
    '#80FF80',
    '#57AD57',
    '#2CAED4',
    '#5050FF',
    '#8B4513',
    '#323232'
  ]
  colors.forEach(color => {
    const div = window.document.createElement('div')
    div.setAttribute('style', `background-color:${color}`)
    div.setAttribute('class', 'colorButton')
    colorContainer.appendChild(div)
    div.addEventListener(
      'click',
      () => {
        const node = graphComponent.currentItem
        if (node !== null && INode.isInstance(node)) {
          setNodeColor(node, color)
        }
      },
      false
    )
  })

  // state icon popup menu
  const nodeLabelModelIcon = new ExteriorLabelModel({ insets: 10 })
  const nodeLabelModelIconParameter = nodeLabelModelIcon.createParameter(
    ExteriorLabelModelPosition.NORTH
  )

  const nodePopupIconContent = window.document.getElementById('iconPopupContent')
  nodePopupIcon = new MindmapPopupSupport(
    graphComponent,
    nodePopupIconContent,
    nodeLabelModelIconParameter
  )

  const iconContainer = nodePopupIcon.div
  iconContainer.addEventListener(
    'click',
    () => {
      nodePopupIcon.currentItem = null
    },
    false
  )

  StateLabelDecorator.STATE_ICONS.forEach((stateIcon, i) => {
    const div = window.document.createElement('div')
    div.setAttribute('style', `background:url(./resources/${stateIcon}-16.svg)`)
    div.setAttribute('class', 'iconButton')
    iconContainer.appendChild(div)
    div.addEventListener(
      'click',
      () => {
        demoCommands.onStateLabelClicked(i)
      },
      false
    )
  })
}

/**
 * Enables the Undo functionality.
 */
function enableUndo() {
  // Enables undo
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Initializes the GraphMLIOHandler.
 * @return {GraphMLIOHandler}
 */
function createGraphMLIOHandler() {
  ioh = new GraphMLIOHandler()
  // We have to implement a special serialization handle listener in order to be able to serialize
  // the custom style classes that have inner properties and are written in ECMAScript 6.
  ioh.addHandleSerializationListener((sender, args) => {
    const item = args.item
    if (item instanceof CollapseDecorator) {
      const collapseDecoratorExtension = new CollapseDecoratorExtension(passiveSupported)
      collapseDecoratorExtension.wrappedStyle = item.wrappedStyle
      const context = args.context
      context.serializeReplacement(
        CollapseDecoratorExtension.$class,
        item,
        collapseDecoratorExtension
      )
      args.handled = true
    } else if (item instanceof StateLabelDecorator) {
      const stateLabelDecoratorExtension = new StateLabelDecoratorExtension()
      stateLabelDecoratorExtension.wrappedStyle = item.wrappedStyle.wrapped
      stateLabelDecoratorExtension.labelModelParameterLeft = item.labelModelParameterLeft
      stateLabelDecoratorExtension.labelModelParameterRight = item.labelModelParameterRight
      stateLabelDecoratorExtension.insetsLeft = item.insetsLeft
      stateLabelDecoratorExtension.insetsRight = item.insetsRight
      const context = args.context
      context.serializeReplacement(
        StateLabelDecoratorExtension.$class,
        item,
        stateLabelDecoratorExtension
      )
      args.handled = true
    } else if (item instanceof MindmapNodeStyleRoot) {
      const mindmapNodeStyleRootExtension = new MindmapNodeStyleRootExtension()
      mindmapNodeStyleRootExtension.className = item.className
      const context = args.context
      context.serializeReplacement(
        MindmapNodeStyleRootExtension.$class,
        item,
        mindmapNodeStyleRootExtension
      )
      args.handled = true
    } else if (item instanceof MindmapNodeStyle) {
      const mindmapNodeStyleExtension = new MindmapNodeStyleExtension()
      mindmapNodeStyleExtension.className = item.className
      const context = args.context
      context.serializeReplacement(
        MindmapNodeStyleExtension.$class,
        item,
        mindmapNodeStyleExtension
      )
      args.handled = true
    } else if (item instanceof MindmapEdgeStyle) {
      const mindmapEdgeStyleExtension = new MindmapEdgeStyleExtension()
      mindmapEdgeStyleExtension.thicknessStart = item.thicknessStart
      mindmapEdgeStyleExtension.thicknessEnd = item.thicknessEnd
      const context = args.context
      context.serializeReplacement(
        MindmapEdgeStyleExtension.$class,
        item,
        mindmapEdgeStyleExtension
      )
      args.handled = true
    }
  })
  // we add the XamlNamespaceMapping mappings
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/StateLabelDecorator/1.0',
    'StateLabelDecorator',
    StateLabelDecoratorExtension.$class
  )
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/CollapseDecorator/1.0',
    'CollapseDecorator',
    CollapseDecoratorExtension.$class
  )
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/MindmapNodeStyle/1.0',
    'MindmapNodeStyle',
    MindmapNodeStyleExtension.$class
  )
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/MindmapNodeStyleRoot/1.0',
    'MindmapNodeStyleRoot',
    MindmapNodeStyleRootExtension.$class
  )
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/MindmapEdgeStyle/1.0',
    'MindmapEdgeStyle',
    MindmapEdgeStyleExtension.$class
  )
}

/**
 * Enables loading and saving the graph to GraphML.
 */
function enableGraphML() {
  // Create a new GraphMLSupport instance that handles save and load operations
  gs = new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM,
    graphMLIOHandler: ioh
  })
}

/**
 * Reads the given graphml file. If the loading fails, a default graph will be loading.
 * @param {string} fileName The file url.
 */
function readGraph(fileName) {
  const graph = graphComponent.graph
  graph.clear()

  ioh
    .readFromURL(graph, fileName)
    .then(() => {
      graphComponent.graph.nodes.forEach(node => {
        const nodeData = node.tag
        node.tag = {
          depth: nodeData.depth,
          isLeft: nodeData.isLeft,
          color: nodeData.color,
          isCollapsed: nodeData.isCollapsed,
          stateIcon: nodeData.stateIcon
        }
      })
      // when done - fit the bounds and clear the undo engine
      onGraphChanged()
    })
    .catch(error => {
      alert(`Unable to open the graph. Perhaps your browser does not allow handling cross domain HTTP requests. 
      Please see the demo readme for details: ${error}`)
      loadFallbackGraph()
    })
}

/**
 * Loads the fallback graph if the sample graph couldn't be loaded.
 */
function loadFallbackGraph() {
  graphComponent.graph.clear()
  createSampleGraph(graphComponent)
  onGraphChanged()
}

/**
 * Called when the graph has changed.
 */
function onGraphChanged() {
  graphComponent.updateContentRect()
  graphComponent.fitContent()
  filteredGraph.nodePredicateChanged()
  adjustNodeBounds()
  MindmapLayout.instance.layout(graphComponent).then(() => {
    limitViewport()
    graphComponent.fitContent()
    graphComponent.graph.undoEngine.clear()
  })
}

/**
 * Adjusts all node sizes to fit their labels' preferred size.
 */
function adjustNodeBounds() {
  const fullGraph = filteredGraph.wrappedGraph
  fullGraph.nodes.forEach(node => {
    if (node.labels.size > 0) {
      const label = node.labels.get(0)
      const preferredSize = label.style.renderer.getPreferredSize(label, label.style)
      fullGraph.setLabelPreferredSize(label, preferredSize)
      if (!Structure.isRoot(node)) {
        // enlarge bounds
        fullGraph.setNodeLayout(
          node,
          new Rect(node.layout.x, node.layout.y, preferredSize.width + 3, preferredSize.height + 3)
        )
      }
    }
  })
}

/**
 * Sets a ViewportLimiter that makes sure that the explorable region
 * doesn't exceed the graph size.
 */
function limitViewport() {
  graphComponent.updateContentRect(new Insets(100))
  const limiter = graphComponent.viewportLimiter
  limiter.honorBothDimensions = false
  limiter.bounds = Rect.add(graphComponent.contentRect, graphComponent.viewport)
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  bindAction("button[data-command='Open']", openFile)
  bindAction("button[data-command='Save']", saveFile)

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  // Register key gestures
  const kim = graphComponent.inputMode.keyboardInputMode
  kim.addKeyBinding({
    key: Key.INSERT,
    execute: (command, parameter, source) => {
      const tag = source.currentItem.tag
      demoCommands.executeCreateChildren(
        getNodeStyle(tag.depth + 1),
        getEdgeStyle(tag.depth),
        getLabelStyle(tag.depth + 1)
      )
    },
    canExecute: () => demoCommands.canExecuteCreateChildren()
  })
  kim.addKeyBinding({
    key: Key.DELETE,
    execute: () => {
      hidePopups()
      demoCommands.executeDeleteItem()
    },
    canExecute: () => demoCommands.canExecuteDeleteItem()
  })
  kim.addKeyBinding({
    key: Key.ADD,
    execute: () => demoCommands.executeExpandNode(),
    canExecute: () => demoCommands.canExecuteExpandNode()
  })
  kim.addKeyBinding({
    key: Key.SUBTRACT,
    execute: () => demoCommands.executeCollapseNode(),
    canExecute: () => demoCommands.canExecuteCollapseNode()
  })
  kim.addKeyBinding({
    key: Key.ENTER,
    execute: (command, parameter, source) => {
      const tag = source.currentItem.tag
      demoCommands.executeCreateSibling(
        getNodeStyle(tag.depth),
        getEdgeStyle(tag.depth - 1),
        getLabelStyle(tag.depth)
      )
    },
    canExecute: () => demoCommands.canExecuteCreateSibling()
  })
}

/**
 * Opens a new graphml file. Only mindmap diagrams that have been created with this demo can be displayed.
 */
function openFile() {
  gs
    .openFile(filteredGraph.wrappedGraph)
    .then(() => {
      graphComponent.graph.nodes.forEach(node => {
        const nodeData = node.tag
        node.tag = {
          depth: nodeData.depth,
          isLeft: nodeData.isLeft,
          color: nodeData.color,
          isCollapsed: nodeData.isCollapsed,
          stateIcon: nodeData.stateIcon
        }
      })
      onGraphChanged()
    })
    .catch(error => {
      alert(
        `Unsupported Diagram File. Only mindmap diagrams that have been created with this demo can be opened: ${error}`
      )
      loadFallbackGraph()
    })
}

/**
 * Saves the current graphml file. The given graph is the full graph so that possible collapsed nodes are also
 * included in the graphml file.
 */
function saveFile() {
  gs.saveFile(filteredGraph.wrappedGraph).catch(error => {
    alert(`Error occurred during saving: ${error}`)
  })
}

/**
 * Sets the color for a node.
 * @param {INode} node The node to set the color for.
 * @param {string} color The color to set.
 */
function setNodeColor(node, color) {
  const oldData = node.tag
  const newData = {
    depth: oldData.depth,
    isLeft: oldData.isLeft,
    color: oldData.color,
    isCollapsed: oldData.isCollapsed,
    stateIcon: oldData.stateIcon
  }
  newData.color = color
  node.tag = newData

  // create a custom undo unit
  graphComponent.graph.undoEngine.addUnit(
    new TagChangeUndoUnit('Change Color', 'Change Color', oldData, newData, node, null)
  )
  graphComponent.invalidate()
}

/**
 * Sets the collapsed state of a node.
 * @param {INode} node The node to set the collapsed state for.
 * @param {boolean} collapsed The state to set.
 */
function setCollapsedState(node, collapsed) {
  const oldData = node.tag
  const newData = {
    depth: oldData.depth,
    isLeft: oldData.isLeft,
    color: oldData.color,
    isCollapsed: oldData.isCollapsed,
    stateIcon: oldData.stateIcon
  }
  newData.isCollapsed = collapsed
  node.tag = newData

  // create a custom undo unit
  graphComponent.graph.undoEngine.addUnit(
    new TagChangeUndoUnit('Collapse/Expand', 'Collapse/Expand', oldData, newData, node, () => {
      filteredGraph.nodePredicateChanged()
    })
  )
  // tell the filtered graph to update the graph structure
  filteredGraph.nodePredicateChanged()
}

/**
 * Hides all popups.
 */
function hidePopups() {
  nodePopupMain.currentItem = null
  nodePopupColor.currentItem = null
  nodePopupIcon.currentItem = null
}

/**
 * Shows the popup menu when an item is selected.
 * @param {Object} sender The source of the event.
 * @param {ItemClickedEventArgs} e The event.
 */
function onItemClicked(sender, e) {
  hidePopups()
  if (INode.isInstance(e.item) && graphComponent.selection.isSelected(e.item)) {
    // show or hide pop-up
    nodePopupMain.currentItem = e.item
  }
}

/**
 * Edits node- or cross reference edge-labels when double-clicking node/edge.
 * @param {Object} sender The source of the event.
 * @param {ItemClickedEventArgs} e The event.
 */
function onItemDoubleClicked(sender, e) {
  let modelItem = e.item

  if (ILabel.isInstance(modelItem)) {
    modelItem = modelItem.owner
  }

  if (
    (INode.isInstance(modelItem) || IEdge.isInstance(modelItem)) &&
    Structure.isCrossReference(modelItem)
  ) {
    const item = modelItem
    const inputMode = graphComponent.inputMode
    if (item.labels.size > 0) {
      inputMode.editLabel(item.labels.get(0))
    } else {
      inputMode.addLabel(item)
    }
  }
}

/**
 * Executes layout when the text of a label has changed.
 * @param {Object} sender The source of the event.
 * @param {LabelEventArgs} e The event.
 */
function onLabelTextChanged(sender, e) {
  adjustNodeBounds()
  MindmapLayout.instance.layout(graphComponent).then(() => {
    limitViewport()
  })
}

/**
 * The handler executed when a node drag is started.
 * The selected node is dragged.
 */
function onDragStarted() {
  hidePopups()
  movedNode = graphComponent.selection.selectedNodes.first()
  const oldData = movedNode.tag
  oldTagData = {
    depth: oldData.depth,
    isLeft: oldData.isLeft,
    color: oldData.color,
    isCollapsed: oldData.isCollapsed,
    stateIcon: oldData.stateIcon
  }
}

/**
 * The handler executed when a node is dragged.
 * The node's and subtree's style is updated while it is moved.
 */
function onDragged() {
  const fullGraph = filteredGraph.wrappedGraph
  const subtreeEdge = Structure.getInEdge(movedNode, fullGraph)
  if (subtreeEdge !== null) {
    const depth = Structure.getDepth(subtreeEdge.sourceNode)
    Structure.setSubtreeDepths(fullGraph, movedNode, depth + 1)
    updateStyles(movedNode)
    fullGraph.setStyle(subtreeEdge, getEdgeStyle(depth))
  }
}

/**
 * The handler executed when a node drag is finished.
 * If a new parent candidate was found the subtree is relocated,
 * otherwise the node is deleted.
 * @param {Object} sender The source of the event.
 * @param {InputModeEventArgs} e The event.
 */
function onDragFinished(sender, e) {
  graphComponent.selection.clear()
  // begin a compound undo operation
  const compoundEdit = graphComponent.graph.beginEdit('Set State Label', 'Set State Label')
  const fullGraph = filteredGraph.wrappedGraph
  // update styles
  const subtreeEdge = Structure.getInEdge(movedNode, fullGraph)
  if (subtreeEdge !== null) {
    Structure.setSubtreeDepths(fullGraph, movedNode, Structure.getDepth(subtreeEdge.sourceNode) + 1)
    updateStyles(movedNode)
    adjustNodeBounds()
    setCollapsedState(subtreeEdge.sourceNode, false)
    const newTagData = movedNode.tag
    graphComponent.graph.undoEngine.addUnit(
      new TagChangeUndoUnit(
        'Set State Label',
        'Set State Label',
        oldTagData,
        newTagData,
        movedNode,
        node => {
          const subtreeNodes = new List()
          const subtreeEdges = new List()
          Structure.getSubtree(fullGraph, node, subtreeNodes, subtreeEdges)
          subtreeNodes.forEach(n => {
            n.tag.isLeft = node.tag.isLeft
          })
        }
      )
    )
  } else {
    // delete gesture
    hidePopups()
    const newTagData = movedNode.tag
    graphComponent.graph.undoEngine.addUnit(
      new TagChangeUndoUnit(
        'Set State Label',
        'Set State Label',
        oldTagData,
        newTagData,
        movedNode,
        node => filteredGraph.nodePredicateChanged(node)
      )
    )
    Structure.removeSubtree(fullGraph, movedNode)
  }
  MindmapLayout.instance.layout(graphComponent).then(() => {
    compoundEdit.commit()
    limitViewport()
  })
  movedNode = null
}

/**
 * The handler executed when a node drag is cancelled.
 */
function onDragCanceled() {
  graphComponent.selection.clear()
  hidePopups()
  const fullGraph = filteredGraph.wrappedGraph
  const subtreeEdge = Structure.getInEdge(movedNode, fullGraph)
  if (subtreeEdge !== null) {
    Structure.setSubtreeDepths(fullGraph, movedNode, Structure.getDepth(subtreeEdge.sourceNode) + 1)
    updateStyles(movedNode)
    adjustNodeBounds()
    setCollapsedState(subtreeEdge.sourceNode, false)
  }
  movedNode = null
}

/**
 * Starts interactive creation of a new cross reference edge.
 * @param {INode} node The source node of the new cross reference edge.
 */
function startCrossReferenceEdgeCreation(node) {
  const inputMode = graphComponent.inputMode
  const portCandidate = new DefaultPortCandidate(
    node,
    FreeNodePortLocationModel.NODE_CENTER_ANCHORED
  )
  const createEdgeInputMode = inputMode.createEdgeInputMode
  // enable CreateEdgeInputMode for the moment
  createEdgeInputMode.enabled = true
  createEdgeInputMode.doStartEdgeCreation(portCandidate)
}

/**
 * Updates the styles of a subtree based on the depth information
 * in the nodes' tags.
 * @param {INode} subtreeRoot The root node of the subtree.
 */
function updateStyles(subtreeRoot) {
  const subtreeNodes = new List()
  const subtreeEdges = new List()
  const fullGraph = filteredGraph.wrappedGraph
  Structure.getSubtree(fullGraph, subtreeRoot, subtreeNodes, subtreeEdges)

  subtreeNodes.forEach(
    /** INode */ node => {
      const depth = Structure.getDepth(node)
      const label = node.labels.first()
      const nodeStyle = getNodeStyle(depth)
      const labelStyle = getLabelStyle(depth)
      fullGraph.setStyle(node, nodeStyle)
      fullGraph.setStyle(label, labelStyle)
    }
  )

  subtreeEdges.forEach(
    /** IEdge */ edge => {
      const depth = Structure.getDepth(edge.sourceNode)
      const edgeStyle = getEdgeStyle(depth)
      fullGraph.setStyle(edge, edgeStyle)
    }
  )
}

/**
 * Gets the label style based on the depth information
 * in the nodes' tags.
 * @param {number} depth The nodes' depth.
 * @return {ILabelStyle} The label's style.
 */
function getLabelStyle(depth) {
  const maxStyle = labelStyles.length - 1
  return labelStyles[depth > maxStyle ? maxStyle : depth]
}

/**
 * Gets the node style based on the depth information
 * in the nodes' tags.
 * @param {number} depth The nodes' depth.
 * @return {INodeStyle} The node's style.
 */
function getNodeStyle(depth) {
  const maxStyle = nodeStyles.length - 1
  return nodeStyles[depth > maxStyle ? maxStyle : depth]
}

/**
 * Gets the edge style based on the depth information.
 * @param {number} depth The nodes' depth.
 * @return {IEdgeStyle} The edge's style.
 */
function getEdgeStyle(depth) {
  const maxStyle = edgeStyles.length - 1
  return edgeStyles[depth > maxStyle ? maxStyle : depth]
}

/**
 * Creates a sample graph if the original graphml cannot be loaded.
 */
function createSampleGraph() {
  const nodeData = {
    depth: 0,
    isLeft: false,
    color: '#FFFFFF',
    isCollapsed: false,
    stateIcon: 0
  }
  const fullGraph = filteredGraph.wrappedGraph
  const n0 = fullGraph.createNode(new Rect(85, 80, 200, 100), getNodeStyle(0), nodeData)
  graphComponent.graph.addLabel(n0, 'Topic', InteriorLabelModel.CENTER, getLabelStyle(0))
  const n1 = Structure.createChild(
    fullGraph,
    n0,
    getNodeStyle(1),
    getEdgeStyle(0),
    getLabelStyle(1)
  )
  fullGraph.setLabelText(n1.labels.get(0), 'Topic 1')
  const n2 = Structure.createChild(
    fullGraph,
    n0,
    getNodeStyle(1),
    getEdgeStyle(0),
    getLabelStyle(1)
  )
  fullGraph.setLabelText(n2.labels.get(0), 'Topic 2')
  const n3 = Structure.createChild(
    fullGraph,
    n0,
    getNodeStyle(1),
    getEdgeStyle(0),
    getLabelStyle(1)
  )
  fullGraph.setLabelText(n3.labels.get(0), 'Topic 3')
  const n11 = Structure.createChild(
    fullGraph,
    n1,
    getNodeStyle(2),
    getEdgeStyle(1),
    getLabelStyle(2)
  )
  fullGraph.setLabelText(n11.labels.get(0), 'Topic 1.1')
  const n12 = Structure.createChild(
    fullGraph,
    n1,
    getNodeStyle(2),
    getEdgeStyle(1),
    getLabelStyle(2)
  )
  fullGraph.setLabelText(n12.labels.get(0), 'Topic 1.2')
  const n13 = Structure.createChild(
    fullGraph,
    n1,
    getNodeStyle(2),
    getEdgeStyle(1),
    getLabelStyle(2)
  )
  fullGraph.setLabelText(n13.labels.get(0), 'Topic 1.3')
}

// Start the demo
loadJson().then(run)
