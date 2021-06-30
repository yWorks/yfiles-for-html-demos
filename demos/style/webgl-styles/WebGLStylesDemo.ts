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
import {
  Color,
  DefaultFolderNodeConverter,
  DefaultLabelStyle,
  FoldingManager,
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IGraph,
  ILabel,
  INode,
  Insets,
  ItemEventArgs,
  License,
  NodeAlignmentPolicy,
  Size,
  WebGL2ArcEdgeStyle,
  WebGL2ArrowType,
  WebGL2BridgeEdgeStyle,
  WebGL2DefaultLabelStyle,
  WebGL2GraphModelManager,
  WebGL2IconLabelStyle,
  WebGL2LabelShape,
  WebGL2NodeEffect,
  WebGL2PolylineEdgeStyle,
  WebGL2SelectionIndicatorManager,
  WebGL2ShapeNodeShape,
  WebGL2ShapeNodeStyle,
  WebGL2Stroke,
  PolylineEdgeStyle,
  IArrow
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import { webGl2Supported } from '../../utils/Workarounds'
import { createFontAwesomeIcon } from '../../utils/IconCreation'

let fontAwesomeIcons: ImageData[] | null = null
let foldingManager: FoldingManager | null = null

/**
 * Bootstraps the demo.
 */
function run(licenseData: object) {
  if (!webGl2Supported) {
    // show message if the browsers does not support WebGL2
    document.getElementById('no-webgl-support')!.removeAttribute('style')
    showApp(null)
    return
  }

  License.value = licenseData
  const graphComponent = new GraphComponent('#graphComponent')

  enableWebGLRendering(graphComponent)
  configureDefaultStyles(graphComponent.graph)
  configureInteraction(graphComponent)
  configureUI()

  fontAwesomeIcons = createFontAwesomeIcons()

  // enables group nodes to be collapsed - optional
  enableFolding(graphComponent)
  // create an initial sample graph
  createGraph(graphComponent)

  graphComponent.fitGraphBounds()

  // bind the buttons to their commands
  registerCommands(graphComponent)

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Configures the "classic" (non-WebGL2) style defaults
 */
function configureDefaultStyles(graph: IGraph) {
  graph.nodeDefaults.size = new Size(70, 70)

  // we need to set the insets on the label style defaults,
  // as those have to be in sync with the insets set in the
  // WebGL2DefaultLabelStyle.
  const defaultLabelStyle = new DefaultLabelStyle({
    insets: new Insets(5)
  })
  graph.nodeDefaults.labels.style = defaultLabelStyle
  graph.edgeDefaults.labels.style = defaultLabelStyle
}

/**
 * Sets up folding
 * The FoldingManager creates a copy of the graph. From this so-called view graph, items are removed and added when a group is collapsed.
 * When an item gets re-added after expanding a group, the WebGL-style has to be set again for this item.
 */
function enableFolding(graphComponent: GraphComponent) {
  // first create the folding manager
  foldingManager = new FoldingManager(graphComponent.graph)

  const view = foldingManager.createFoldingView()
  // each view contains a folding-enabled graph, the view graph
  const viewGraph = view.graph
  // the view graph is the graph to display
  graphComponent.graph = viewGraph

  // after a group is expanded, it's child nodes are re-added to the view graph and need to be styled again
  view.addGroupExpandedListener((sender, evt) => {
    const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
    const node = evt.item

    viewGraph.getChildren(node).forEach(node => {
      const masterNode = view.getMasterItem(node)
      if (masterNode) {
        if (masterNode.tag) {
          // re-apply the node style that was saved in the tag
          const descriptor = masterNode.tag as MyWebGLStyleDescriptor
          const style = new WebGL2ShapeNodeStyle(
            descriptor.shape,
            descriptor.color,
            descriptor.effect === WebGL2NodeEffect.AMBIENT_STROKE_COLOR
              ? WebGL2Stroke.BLACK
              : WebGL2Stroke.NONE,
            descriptor.effect
          )
          gmm.setStyle(node, style)
        }
      }

      // apply WebGL2 label styles to the node's label
      node.labels.forEach(label => {
        // For simplicity's sake, we do not store any information on label styles when collapsing a
        // group. Instead, we simply set new style instances for labels when expanding a group.
        if (label.text === '') {
          // if the label has no text, WebGL2IconLabelStyle is used to show a random icon
          const iconIndex = Math.floor(Math.random() * fontAwesomeIcons!.length)
          gmm.setStyle(
            label,
            new WebGL2IconLabelStyle({
              icon: fontAwesomeIcons![iconIndex],
              iconColor: 'grey',
              backgroundColor: 'white',
              backgroundStroke: 'grey'
            })
          )
        } else {
          // if the label has text, WebGL2DefaultLabelStyle is used
          gmm.setStyle(
            label,
            new WebGL2DefaultLabelStyle({
              shape: WebGL2LabelShape.PILL,
              backgroundStroke: WebGL2Stroke.BLACK,
              backgroundColor: 'white',
              insets: 5
            })
          )
        }
      })
    })
  })

  // set a default size for collapsed nodes
  const folderNodeConverter = foldingManager.folderNodeConverter as DefaultFolderNodeConverter
  folderNodeConverter.folderNodeSize = new Size(100, 20)

  // configure expand/collapse behaviour
  const geim = graphComponent.inputMode as GraphEditorInputMode
  geim.navigationInputMode.allowExpandGroup = true
  geim.navigationInputMode.allowCollapseGroup = true
  geim.navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_RIGHT

  // ensure that labels are hit-tested before nodes, so that the image label used for expanding/collapsing has precedence
  geim.clickHitTestOrder = [GraphItemTypes.LABEL, GraphItemTypes.EDGE, GraphItemTypes.NODE]
  geim.allowEditLabelOnDoubleClick = false

  // add a click listener to check if an expand/collapse label has been left-clicked
  geim.addItemLeftClickedListener((sender, args) => {
    if (args.item instanceof ILabel) {
      // the node this label belongs to
      const node = args.item.owner as INode
      if (node != null) {
        // check that it is a collapsible group node
        const masterNode = view.getMasterItem(node)
        if (foldingManager?.masterGraph.isGroupNode(masterNode)) {
          const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
          if (view.isExpanded(masterNode!)) {
            geim.navigationInputMode.collapseGroup(node)
            gmm.setStyle(node, getWebGLGroupStyle())
            addImageLabel(node, graphComponent, 1, new Color(61, 85, 219))
          } else {
            geim.navigationInputMode.expandGroup(node)
            gmm.setStyle(node, getWebGLGroupStyle())
            addImageLabel(node, graphComponent, 0, new Color(61, 85, 219))
          }
        }
      }
    }
  })
}
/**
 * Configures the interaction behaviour
 */
function configureInteraction(graphComponent: GraphComponent) {
  // For calling WebGL2 specific methods, we use the WebGLGraphModelManager set on the GraphComponent.
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager

  // Allow editing of the graph
  const geim = new GraphEditorInputMode({
    allowClipboardOperations: false,
    allowGroupingOperations: true,
    marqueeSelectableItems: GraphItemTypes.NODE | GraphItemTypes.BEND,
    //Completely disable handles for ports and edges
    showHandleItems: GraphItemTypes.ALL & ~GraphItemTypes.PORT & ~GraphItemTypes.EDGE
  })

  // Disable moving of individual edge segments
  graphComponent.graph.decorator.edgeDecorator.positionHandlerDecorator.hideImplementation()

  //Don't show bend handles and disable bend creation for styles that don't support bends
  graphComponent.graph.decorator.bendDecorator.handleDecorator.hideImplementation(b => {
    const style = gmm.getStyle(b.owner!)
    return !(style instanceof WebGL2PolylineEdgeStyle)
  })
  graphComponent.graph.decorator.edgeDecorator.bendCreatorDecorator.hideImplementation(e => {
    const style = gmm.getStyle(e)
    return !(style instanceof WebGL2PolylineEdgeStyle)
  })

  // On node creation, set the configured style as well as a random color
  geim.addNodeCreatedListener((inputMode: GraphEditorInputMode, evt: ItemEventArgs<INode>) => {
    const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
    const node = evt.item
    addLabel(node, graphComponent)
    addImageLabel(node, graphComponent)
    gmm.setStyle(
      node,
      new WebGL2ShapeNodeStyle(
        getConfiguredNodeShape(),
        getConfiguredNodeColor(graphComponent.graph.isGroupNode(node)),
        getConfiguredNodeStroke(),
        getConfiguredNodeEffect()
      )
    )
  })

  // On edge creation, set the configured edge style
  geim.createEdgeInputMode.addEdgeCreatedListener((sender, evt) => {
    const edge = evt.item
    const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
    gmm.setStyle(edge, getConfiguredEdgeStyle())
  })

  geim.createEdgeInputMode.addGestureStartedListener((sender, evt) => {
    ;(geim.createEdgeInputMode.dummyEdge.style as PolylineEdgeStyle).targetArrow = IArrow.NONE
  })

  geim.addLabelAddedListener((sender, evt) => {
    const label = evt.item
    gmm.setStyle(
      label,
      new WebGL2DefaultLabelStyle({
        shape: getConfiguredLabelShape(),
        backgroundStroke: WebGL2Stroke.BLACK,
        backgroundColor: 'white',
        insets: 5
      })
    )
  })

  graphComponent.inputMode = geim
}

/**
 * Enables WebGL2 as the rendering technique.
 */
function enableWebGLRendering(graphComponent: GraphComponent) {
  graphComponent.graphModelManager = new WebGL2GraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager(graphComponent)
  graphComponent.focusIndicatorManager.enabled = false
}

/**
 * Sets a rainbow image as background for the node fill slider
 */
function configureUI() {
  const canvas = document.createElement('canvas')
  canvas.setAttribute('width', '180')
  canvas.setAttribute('height', '15')
  const ctx = canvas.getContext('2d')!
  for (let x = 0; x < 180; x++) {
    ctx.fillStyle = `hsl(${x * 2}, 100%, 50%)`
    ctx.strokeStyle = `hsl(${x * 2}, 100%, 50%)`
    ctx.fillRect(x, 0, 1, 15)
  }
  const colorSlider = document.getElementById('nodeFill') as HTMLInputElement
  colorSlider.style.backgroundImage = `url(${canvas.toDataURL()})`
}

/**
 * Creates an array of {@link ImageData} from a selection of font awesome classes.
 */
function createFontAwesomeIcons(): ImageData[] {
  // the font awesome classes used in this demo
  const faClasses = [
    'fa fa-minus',
    'fa fa-plus',
    'fas fa-anchor',
    'fab fa-angellist',
    'fas fa-angle-double-right',
    'fas fa-arrow-alt-circle-down',
    'fas fa-baby-carriage',
    'fas fa-basketball-ball',
    'fas fa-bell',
    'fas fa-book-reader',
    'fas fa-bug',
    'fas fa-camera-retro'
  ]
  const iconSize = new Size(128, 128)
  const ctx = createCanvasContext(iconSize)
  return faClasses.map(faClass => createFontAwesomeIcon(ctx, faClass, iconSize))
}

/**
 * Creates a color using the "nodeFill" slider value as the hue
 * and differing lightness for group and non-group nodes.
 *
 * @param isGroupNode whether the color will be used for a group node.
 */
function getConfiguredNodeColor(isGroupNode: boolean): Color {
  const lightness = isGroupNode ? 0.85 : 0.5
  const colorSliderValue = parseInt((document.getElementById('nodeFill') as HTMLInputElement).value)
  return Color.fromHSLA(colorSliderValue / 180, 1, lightness, 1.0)
}

/**
 * Depending on the nodeStroke checkbox, returns either a black stroke or none.
 */
function getConfiguredNodeStroke() {
  const paintStroke = document.querySelector<HTMLInputElement>('#nodeStroke')!.checked
  if (paintStroke) {
    return WebGL2Stroke.BLACK
  }
  return WebGL2Stroke.NONE
}

/**
 * Returns the {@link WebGL2ShapeNodeShape} as configured in the HTML combobox.
 */
function getConfiguredNodeShape(): WebGL2ShapeNodeShape {
  const shapeComboValue = (document.querySelector('#nodeShape')! as HTMLSelectElement).value
  return WebGL2ShapeNodeShape[
    shapeComboValue as keyof typeof WebGL2ShapeNodeShape
  ] as WebGL2ShapeNodeShape
}

/**
 * Returns the {@link WebGL2NodeEffect} as configured in the HTML combobox.
 */
function getConfiguredNodeEffect(): WebGL2NodeEffect {
  const effectComboValue = (document.querySelector('#nodeEffect')! as HTMLSelectElement).value
  return WebGL2NodeEffect[effectComboValue as keyof typeof WebGL2NodeEffect] as WebGL2NodeEffect
}

/**
 * Returns the {@link WebGL2ArrowType}s for source and target arrows as configured in the
 * relevant HTML comboboxes.
 */
function getConfiguredArrowTypes(): { source: WebGL2ArrowType; target: WebGL2ArrowType } {
  const sourceArrowComboValue = (document.querySelector('#sourceArrow')! as HTMLSelectElement).value
  const sourceArrow = WebGL2ArrowType[
    sourceArrowComboValue as keyof typeof WebGL2ArrowType
  ] as WebGL2ArrowType

  const targetArrowComboValue = (document.querySelector('#targetArrow')! as HTMLSelectElement).value
  const targetArrow = WebGL2ArrowType[
    targetArrowComboValue as keyof typeof WebGL2ArrowType
  ] as WebGL2ArrowType

  return { source: sourceArrow, target: targetArrow }
}

/**
 * Returns the {@link WebGL2LabelShape} as configured in the HTML combobox.
 */
function getConfiguredLabelShape(): WebGL2LabelShape {
  const labelStyleComboValue = (document.querySelector('#labelShape')! as HTMLSelectElement).value
  return WebGL2LabelShape[labelStyleComboValue as keyof typeof WebGL2LabelShape] as WebGL2LabelShape
}

/**
 * Returns the edge style as configured in the relevant HTML comboboxes.
 */
function getConfiguredEdgeStyle() {
  const configuredArrowTypes = getConfiguredArrowTypes()
  switch ((document.querySelector('#edgeStyle')! as HTMLSelectElement).value) {
    default:
    case 'Default':
      return new WebGL2PolylineEdgeStyle({
        stroke: 'black',
        sourceArrow: configuredArrowTypes.source,
        targetArrow: configuredArrowTypes.target
      })
    case 'Arc':
      return new WebGL2ArcEdgeStyle({
        height: 60,
        fixedHeight: true,
        stroke: 'black',
        sourceArrow: configuredArrowTypes.source,
        targetArrow: configuredArrowTypes.target
      })
    case 'Bridge':
      return new WebGL2BridgeEdgeStyle({
        height: 60,
        fanLength: 40,
        stroke: 'black',
        sourceArrow: configuredArrowTypes.source,
        targetArrow: configuredArrowTypes.target
      })
  }
}

/**
 * Adds a Label to a node using the configured label shape and the number of nodes in the graph
 * for the label text.
 *
 * @param node the node to add the label to
 * @param graphComponent the graph component
 */
function addLabel(node: INode, graphComponent: GraphComponent) {
  const graph = graphComponent.graph
  const graphModelManager = graphComponent.graphModelManager as WebGL2GraphModelManager

  const label = graph.addLabel(node, `Node ${graph.nodes.size}`)
  graphModelManager.setStyle(
    label,
    new WebGL2DefaultLabelStyle({
      shape: getConfiguredLabelShape(),
      backgroundStroke: WebGL2Stroke.BLACK,
      backgroundColor: 'white',
      insets: 5
    })
  )
}

/**
 * Creates a canvas for rendering and returns its context.
 */
function createCanvasContext(iconSize: Size) {
  // canvas used to pre-render the icons
  const canvas = document.createElement('canvas')
  canvas.setAttribute('width', `${iconSize.width}`)
  canvas.setAttribute('height', `${iconSize.height}`)
  return canvas.getContext('2d')!
}

/**
 * Adds a label with {@link WebGL2IconLabelStyle} containing a random grey font awesome image. Optionally, color and icon may be set.
 * to a node.
 */
function addImageLabel(
  node: INode,
  graphComponent: GraphComponent,
  iconIndex?: number,
  iconColor?: Color
) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
  const label = graph.addLabel(
    node,
    '',
    FreeNodeLabelModel.INSTANCE.createParameter({
      labelRatio: [0.6, 0.5],
      layoutRatio: [1, 0],
      layoutOffset: [0, 0]
    })
  )
  if (iconIndex === undefined) {
    iconIndex = Math.floor(Math.random() * fontAwesomeIcons!.length)
  }

  const size = new Size(30, 30)
  graph.setLabelPreferredSize(label, size)
  gmm.setStyle(
    label,
    new WebGL2IconLabelStyle({
      icon: fontAwesomeIcons![iconIndex],
      iconColor: iconColor ? iconColor : 'grey',
      backgroundColor: 'white',
      backgroundStroke: 'grey'
    })
  )
}

/**
 * Creates an initial sample graph.
 */
function createGraph(graphComponent: GraphComponent) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager

  const shapes: WebGL2ShapeNodeShape[] = [
    WebGL2ShapeNodeShape.ELLIPSE,
    WebGL2ShapeNodeShape.RECTANGLE,
    WebGL2ShapeNodeShape.ROUND_RECTANGLE,
    WebGL2ShapeNodeShape.HEXAGON,
    WebGL2ShapeNodeShape.HEXAGON2,
    WebGL2ShapeNodeShape.OCTAGON,
    WebGL2ShapeNodeShape.TRIANGLE,
    WebGL2ShapeNodeShape.PILL
  ]

  const effects: WebGL2NodeEffect[] = [
    WebGL2NodeEffect.NONE,
    WebGL2NodeEffect.SHADOW,
    WebGL2NodeEffect.AMBIENT_FILL_COLOR,
    WebGL2NodeEffect.AMBIENT_STROKE_COLOR
  ]

  const effect2arrow = new Map([
    [WebGL2NodeEffect.NONE, WebGL2ArrowType.NONE],
    [WebGL2NodeEffect.SHADOW, WebGL2ArrowType.POINTED],
    [WebGL2NodeEffect.AMBIENT_FILL_COLOR, WebGL2ArrowType.TRIANGLE],
    [WebGL2NodeEffect.AMBIENT_STROKE_COLOR, WebGL2ArrowType.DEFAULT]
  ])

  const nodeSize = 70
  const nodeDistance = 150

  let x = 0
  let y = 0
  let lastNode: INode | null = null
  for (const effect of effects) {
    lastNode = null
    const edgeStyle = new WebGL2PolylineEdgeStyle({
      stroke: 'black',
      sourceArrow: effect2arrow.get(effect)!,
      targetArrow: effect2arrow.get(effect)!
    })

    // create a group node of appropriate size to house the following nodes
    const groupNode = graph.createGroupNode({
      layout: [
        -nodeSize * 0.25,
        y * nodeDistance - nodeSize / 2,
        shapes.length * nodeDistance,
        nodeSize * 2
      ]
    })
    const groupNodeStyle = getWebGLGroupStyle()
    gmm.setStyle(groupNode, groupNodeStyle)
    // add a minus sign as imagelabel
    addImageLabel(groupNode, graphComponent, 0, new Color(61, 85, 219))

    for (const shape of shapes) {
      const width = shape === WebGL2ShapeNodeShape.PILL ? 100 : nodeSize

      // save the styles properties so as to be able to recreate it after group has been collapsed - optional for folding
      const styleDescriptor = new MyWebGLStyleDescriptor(
        shape,
        Color.fromHSLA(graph.nodes.size / 32, 1, 0.5, 1.0),
        effect === WebGL2NodeEffect.AMBIENT_STROKE_COLOR ? WebGL2Stroke.BLACK : WebGL2Stroke.NONE,
        effect
      )
      const node = graph.createNode({
        layout: [x * nodeDistance, y * nodeDistance, width, nodeSize],
        tag: styleDescriptor
      })

      addLabel(node, graphComponent)

      gmm.setStyle(
        node,
        new WebGL2ShapeNodeStyle(
          shape,
          Color.fromHSLA(graph.nodes.size / 32, 1, 0.5, 1.0),
          effect === WebGL2NodeEffect.AMBIENT_STROKE_COLOR ? WebGL2Stroke.BLACK : WebGL2Stroke.NONE,
          effect
        )
      )

      addImageLabel(node, graphComponent)
      if (lastNode) {
        const edge = graph.createEdge(lastNode, node)
        gmm.setStyle(edge, edgeStyle)
      }
      graph.setParent(node, groupNode)
      lastNode = node
      x++
    }

    x = 0
    y++
  }
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)

  // Applies the configured styles to either the selected or all graph items.
  bindAction("button[data-command='ApplyStyles']", (): void => {
    const useSelection = document.querySelector<HTMLInputElement>('#stylesOnSelection')!.checked
    const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager

    const nodesToStyle = useSelection
      ? graphComponent.selection.selectedNodes
      : graphComponent.graph.nodes
    const configuredNodeShape = getConfiguredNodeShape()
    const configuredNodeEffect = getConfiguredNodeEffect()
    nodesToStyle.forEach(node => {
      const configuredNodeColor = getConfiguredNodeColor(graphComponent.graph.isGroupNode(node))
      const configuredNodeStroke = getConfiguredNodeStroke()
      gmm.setStyle(
        node,
        new WebGL2ShapeNodeStyle(
          configuredNodeShape,
          configuredNodeColor,
          configuredNodeStroke,
          configuredNodeEffect
        )
      )
      // update the tag as well
      node.tag = new MyWebGLStyleDescriptor(
        configuredNodeShape,
        configuredNodeColor,
        configuredNodeStroke,
        configuredNodeEffect
      )
    })

    const edgesToStyle = useSelection
      ? graphComponent.selection.selectedEdges
      : graphComponent.graph.edges
    const configuredEdgeStyle = getConfiguredEdgeStyle()
    edgesToStyle.forEach(edge => {
      gmm.setStyle(edge, configuredEdgeStyle)
    })

    const labelsToStyle = useSelection
      ? graphComponent.selection.selectedLabels
      : graphComponent.graph.labels
    const configuredLabelShape = getConfiguredLabelShape()
    labelsToStyle.forEach(label => {
      if (gmm.getStyle(label) instanceof WebGL2DefaultLabelStyle) {
        gmm.setStyle(
          label,
          new WebGL2DefaultLabelStyle({
            shape: configuredLabelShape,
            textColor: 'black',
            backgroundStroke: 'black',
            backgroundColor: 'white',
            insets: 5
          })
        )
      }
    })
    //Handle state may have changed, make sure to update it
    ;(<GraphEditorInputMode>graphComponent.inputMode).requeryHandles()
    graphComponent.invalidate()
  })
}

/**
 * A default WebGL-style to use for group nodes
 */
function getWebGLGroupStyle() {
  return new WebGL2ShapeNodeStyle(
    WebGL2ShapeNodeShape.ROUND_RECTANGLE,
    'rgb(253,253,253)',
    '1px gray',
    'shadow'
  )
}

/**
 * Simple DTO to remember a node's WebGL-style properties for re-initialization
 */
class MyWebGLStyleDescriptor {
  effect: WebGL2NodeEffect
  shape: WebGL2ShapeNodeShape
  color: Color
  stroke: WebGL2Stroke
  constructor(
    shape: WebGL2ShapeNodeShape,
    color: Color,
    stroke: WebGL2Stroke,
    effect: WebGL2NodeEffect
  ) {
    this.effect = effect
    this.shape = shape
    this.color = color
    this.stroke = stroke
  }
}

// start demo
loadJson().then(run)
