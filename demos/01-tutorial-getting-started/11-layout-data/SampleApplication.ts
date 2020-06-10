/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphOverviewComponent,
  HierarchicLayout,
  HierarchicLayoutData,
  HierarchicLayoutNodeLayoutDescriptor,
  ICommand,
  IGraph,
  IInputModeContext,
  INode,
  InteriorStretchLabelModel,
  LabelEventArgs,
  License,
  MinimumNodeSizeStage,
  PanelNodeStyle,
  Point,
  Rect,
  ShapeNodeStyle,
  Size
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import GraphBuilderData from './resources/graph'

// @ts-ignore
let graphComponent: GraphComponent = null

function run(licenseData: object): void {
  License.value = licenseData

  // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
  graphComponent = new GraphComponent('#graphComponent')

  // Enable grouping
  configureGroupNodeStyles()

  // Configure interaction
  configureInteraction()

  // Configures default label model parameters for newly created graph elements
  setDefaultLabelLayoutParameters()

  // Configures default styles for newly created graph elements
  setDefaultStyles()

  // Read a sample graph from an embedded resource file
  createSampleGraph()

  // Enables the undo engine (disabled by default)
  enableUndo()

  // Manages the viewport
  updateViewport()

  // bind the demo buttons to their commands
  registerCommands()

  // Initialize the demo application's CSS and Javascript for the description
  showApp(graphComponent)
}

/**
 * Applies a hierarchic layout and uses the data of the layout from the tags of the nodes.
 */
async function runLayout(): Promise<void> {
  const hierarchicLayout = new HierarchicLayout()

  // /////////////// New in this Sample /////////////////

  // Configures the layout data from the data that exits in the tags of the nodes
  const hierarchicLayoutData = new HierarchicLayoutData({
    nodeLayoutDescriptors: (node: INode): HierarchicLayoutNodeLayoutDescriptor =>
      new HierarchicLayoutNodeLayoutDescriptor({
        // Sets the alignment of the node based on the tag
        layerAlignment: node.tag && node.tag.alignment ? getAlignment(node) : 0
      })
  })
  // ////////////////////////////////////////////////////

  // Uses the morphLayout method to perform the layout, animate it, manage undo and adjust the content rectangle in
  // one call. Here, the actual layout is wrapped into a MinimumNodeSizeStage to avoid errors with nodes of size '0'.
  // morphLayout runs asynchronously and returns immediately yielding a Promise that we can await or use to catch
  // errors.
  try {
    await graphComponent.morphLayout({
      layout: new MinimumNodeSizeStage(hierarchicLayout),
      layoutData: hierarchicLayoutData,
      morphDuration: '1s',
      easedAnimation: true
    })
  } catch (error) {
    // this is just for the purpose of the demo - usually you would employ your own
    // logging or error handling logic, here
    if (typeof (window as any).reportError === 'function') {
      ;(window as any).reportError(error)
    } else {
      throw error
    }
  }
}

/**
 * Returns the alignment value based on the data stored in the given node's tag.
 * @param node The given node
 */
function getAlignment(node: INode): number {
  // The layer alignment can take values within interval [0,1], where 0 corresponds to top alignment, 0.5 to
  // center alignment and 1.0 to bottom alignment. In this dataset, we have stored the alignment in the tag as
  // 'Top', 'Center' or 'Bottom' and thus, we have to convert it to actual numerical values.
  switch (node.tag.alignment) {
    default:
    case 'Center':
      return 0.5
    case 'Top':
      return 0.0
    case 'Bottom':
      return 1.0
  }
}

/**
 * Creates the sample graph and runs the layout.
 */
function createSampleGraph(): void {
  const builder = new GraphBuilder(graphComponent.graph)
  builder.createNodesSource({
    data: GraphBuilderData.nodes,
    id: 'id',
    parentId: 'parent',
    layout: 'layout',
    labels: ['alignment']
  })
  builder.createGroupNodesSource({
    data: GraphBuilderData.groups,
    id: 'id',
    layout: 'layout'
  })
  builder.createEdgesSource(GraphBuilderData.edges, 'source', 'target', 'id')

  builder.buildGraph()

  // Runs the layout
  runLayout()
}

/**
 * Enables the Undo functionality.
 */
function enableUndo(): void {
  // Enables undo on the graph.
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Configures the default style for group nodes.
 */
function configureGroupNodeStyles(): void {
  const graph = graphComponent.graph
  // PanelNodeStyle is a style especially suited to group nodes
  // Creates a panel with a light blue background
  graph.groupNodeDefaults.style = new PanelNodeStyle({
    color: 'rgb(214, 229, 248)',
    insets: [18, 5, 5, 5],
    labelInsetsColor: 'rgb(214, 229, 248)'
  })

  // Sets a label style with right-aligned text
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'right'
  })

  // Places the label at the top inside of the panel.
  // For PanelNodeStyle, InteriorStretchLabelModel is usually the most appropriate label model
  graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH
}

/**
 * Configures basic interaction.
 * Interaction is handled by InputModes. {@link GraphEditorInputMode} is the main
 * InputMode that already provides a large number of graph interaction gestures, such as moving, deleting, creating,
 * resizing graph elements. Note that labels can be edited by pressing F2. Also, labels can be moved to different
 * locations determined by their label model.
 */
function configureInteraction(): void {
  // Creates a new GraphEditorInputMode instance and registers it as the main
  // input mode for the graphComponent
  const inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  // Creates a node with the default 'Center' alignment
  inputMode.nodeCreator = (
    context: IInputModeContext,
    graph: IGraph,
    location: Point,
    parent: INode | null
  ): INode => {
    const node = graph.createNodeAt(location)
    graph.addLabel(node, 'Center')
    node.tag = { alignment: 'Center' }
    return node
  }

  // Updates the node's tag with the new label's text
  inputMode.addLabelTextChangedListener((source: object, event: LabelEventArgs): void => {
    const owner = event.owner
    if (INode.isInstance(owner) && !graphComponent.graph.isGroupNode(owner)) {
      owner.tag.alignment = event.item.text
    }
  })
  graphComponent.inputMode = inputMode
}

/**
 * Sets up default label model parameters for graph elements.
 * Label model parameters control the actual label placement as well as the available
 * placement candidates when moving the label interactively.
 */
function setDefaultLabelLayoutParameters(): void {
  // For edge labels, the default is a label that is rotated to match the associated edge segment
  // We'll start by creating a model that is similar to the default:
  const edgeLabelModel = new EdgePathLabelModel({
    autoRotation: true,
    distance: 10,
    sideOfEdge: EdgeSides.LEFT_OF_EDGE | EdgeSides.RIGHT_OF_EDGE
  })
  // Finally, we can set this label model as the default for edge labels
  graphComponent.graph.edgeDefaults.labels.layoutParameter = edgeLabelModel.createDefaultParameter()
}

/**
 * Assigns default styles for graph elements.
 * Default styles apply only to elements created after the default style has been set,
 * so typically, you'd set these as early as possible in your application.
 */
function setDefaultStyles(): void {
  const graph = graphComponent.graph
  // configure defaults for normal nodes and their labels
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: 'darkorange',
    stroke: 'white'
  })
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'word-ellipsis'
  })
  // Sets the defined style as the default for both edge and node labels
  // Creates a label style with the label text color set to dark red
  const defaultLabelStyle = new DefaultLabelStyle({
    font: '12px Tahoma',
    textFill: 'black'
  })
  graph.edgeDefaults.labels.style = defaultLabelStyle
  graph.nodeDefaults.labels.style = defaultLabelStyle
}

/**
 * Updates the content rectangle to encompass all existing graph elements.
 * If you create your graph elements programmatically, the content rectangle
 * (i.e. the rectangle in <b>world coordinates</b>
 * that encloses the graph) is <b>not</b> updated automatically to enclose these elements.
 * Typically, this manifests in wrong/missing scrollbars, incorrect {@link GraphOverviewComponent}
 * behavior and the like.
 *
 * This method demonstrates several ways to update the content rectangle, with or without adjusting the zoom level
 * to show the whole graph in the view.
 *
 * Note that updating the content rectangle only does not change the current viewport (i.e. the world coordinate
 * rectangle that corresponds to the currently visible area in view coordinates)
 *
 * Uncomment various combinations of lines in this method and observe the different effects.
 */
function updateViewport(): void {
  // Uncomment the following line to update the content rectangle
  // to include all graph elements
  // This should result in correct scrolling behaviour:

  // graphComponent.updateContentRect();

  // Additionally, we can also set the zoom level so that the
  // content rectangle fits exactly into the viewport area:
  // Uncomment this line in addition to UpdateContentRect:
  // Note that this changes the zoom level (i.e. the graph elements will look smaller)

  // graphComponent.fitContent();

  // The sequence above is equivalent to just calling:
  graphComponent.fitGraphBounds()
}

/** Helper method that binds the various commands available in yFiles for HTML to the buttons
 * in the demo's toolbar.
 */
function registerCommands(): void {
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)

  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)

  bindAction("button[data-command='Layout']", async (): Promise<void> => runLayout())
}

// start tutorial
loadJson().then(run)
