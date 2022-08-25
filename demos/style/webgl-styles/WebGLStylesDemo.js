/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GroupNodeStyleIconBackgroundShape,
  GroupNodeStyleIconPosition,
  GroupNodeStyleIconType,
  GroupNodeStyleTabPosition,
  IArrow,
  ICommand,
  IGraph,
  INode,
  Insets,
  ItemEventArgs,
  License,
  NodeAlignmentPolicy,
  PolylineEdgeStyle,
  Size,
  WebGL2ArcEdgeStyle,
  WebGL2ArrowType,
  WebGL2BridgeEdgeStyle,
  WebGL2DefaultLabelStyle,
  WebGL2Effect,
  WebGL2GraphModelManager,
  WebGL2GroupNodeStyle,
  WebGL2IconLabelStyle,
  WebGL2LabelShape,
  WebGL2PolylineEdgeStyle,
  WebGL2SelectionIndicatorManager,
  WebGL2ShapeNodeShape,
  WebGL2ShapeNodeStyle,
  WebGL2Stroke,
  WebGL2TextureRendering
} from 'yfiles'

import {
  bindChangeListener,
  bindCommand,
  configureTwoPointerPanning,
  showApp
} from '../../resources/demo-app.js'
import { isWebGl2Supported } from '../../utils/Workarounds.js'
import { createFontAwesomeIcon } from '../../utils/IconCreation.js'
import { fetchLicense } from '../../resources/fetch-license.js'
import {
  configureEditor,
  getNumber,
  getStroke,
  getValue,
  updateEditor
} from './PropertiesEditor.js'

/** @type {Array.<ImageData>} */
let fontAwesomeIcons
/** @type {FoldingManager} */
let foldingManager

/**
 * @returns {!Promise}
 */
async function run() {
  if (!isWebGl2Supported()) {
    // show message if the browsers does not support WebGL2
    document.getElementById('no-webgl-support').removeAttribute('style')
    showApp()
    return
  }

  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('#graphComponent')

  enableWebGLRendering(graphComponent)
  configureDefaultStyles(graphComponent.graph)
  configureInteraction(graphComponent)

  fontAwesomeIcons = createFontAwesomeIcons()

  // enables group nodes to be collapsed - optional
  enableFolding(graphComponent)
  // create an initial sample graph
  createGraph(graphComponent)

  // enable undo engine
  graphComponent.graph.foldingView.manager.masterGraph.undoEngineEnabled = true

  // center the graph in the visible area
  graphComponent.fitGraphBounds()

  // bind the buttons to their commands
  registerCommands(graphComponent)

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Configures the "classic" (non-WebGL2) style defaults
 * @param {!IGraph} graph
 */
function configureDefaultStyles(graph) {
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
 * @param {!GraphComponent} graphComponent
 */
function enableFolding(graphComponent) {
  // first create the folding manager
  foldingManager = new FoldingManager(graphComponent.graph)

  const view = foldingManager.createFoldingView()
  // Each view contains a folding-enabled graph, the view graph.
  // The view graph is the graph to display.
  graphComponent.graph = view.graph

  // set a default size for collapsed nodes
  const folderNodeConverter = foldingManager.folderNodeConverter
  folderNodeConverter.folderNodeSize = new Size(100, 24)
  // Copy the first label to keep the collapse/expand button
  folderNodeConverter.copyFirstLabel = true

  // configure expand/collapse behaviour
  const geim = graphComponent.inputMode
  geim.navigationInputMode.allowExpandGroup = true
  geim.navigationInputMode.allowCollapseGroup = true
  geim.navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_RIGHT

  // ensure that labels are hit-tested before nodes, so that the image label used for expanding/collapsing has precedence
  geim.clickHitTestOrder = [GraphItemTypes.LABEL, GraphItemTypes.EDGE, GraphItemTypes.NODE]
  geim.allowEditLabelOnDoubleClick = false
}

/**
 * Configures the interaction behavior.
 * @param {!GraphComponent} graphComponent
 */
function configureInteraction(graphComponent) {
  const graph = graphComponent.graph

  // For calling WebGL2 specific methods, we use the WebGLGraphModelManager set on the GraphComponent.
  const gmm = getModelManager(graphComponent)

  // Allow editing of the graph
  const geim = new GraphEditorInputMode({
    allowClipboardOperations: true,
    allowGroupingOperations: true,
    marqueeSelectableItems: GraphItemTypes.NODE | GraphItemTypes.BEND,
    //Completely disable handles for ports and edges
    showHandleItems: GraphItemTypes.ALL & ~GraphItemTypes.PORT & ~GraphItemTypes.EDGE
  })

  // Disable moving of individual edge segments
  graph.decorator.edgeDecorator.positionHandlerDecorator.hideImplementation()

  // Do not show bend handles and disable bend creation for styles that do not support bends
  graph.decorator.bendDecorator.handleDecorator.hideImplementation(bend => {
    const style = gmm.getStyle(bend.owner)
    return !(style instanceof WebGL2PolylineEdgeStyle)
  })
  graph.decorator.edgeDecorator.bendCreatorDecorator.hideImplementation(edge => {
    const style = gmm.getStyle(edge)
    return !(style instanceof WebGL2PolylineEdgeStyle)
  })

  // On node creation, set the configured style as well as a random color
  geim.addNodeCreatedListener((sender, evt) => {
    const node = evt.item
    if (graphComponent.graph.isGroupNode(node)) {
      gmm.setStyle(node, getConfiguredGroupNodeStyle())
    } else {
      addLabel(graphComponent, node)
      addImageLabel(graphComponent, node, Color.from('gray'))
      gmm.setStyle(node, getConfiguredNodeStyle())
    }
  })

  // On edge creation, set the configured edge style
  geim.createEdgeInputMode.addEdgeCreatedListener((sender, evt) => {
    gmm.setStyle(evt.item, getConfiguredEdgeStyle())
  })

  geim.createEdgeInputMode.addGestureStartedListener(() => {
    geim.createEdgeInputMode.dummyEdge.style.targetArrow = IArrow.NONE
  })

  geim.addLabelAddedListener((sender, evt) => {
    gmm.setStyle(evt.item, getConfiguredLabelStyle())
  })

  const onSelectionChanged = () => updateEditorValues(graphComponent)
  geim.addDeletedSelectionListener(onSelectionChanged)
  geim.addGroupedSelectionListener(onSelectionChanged)
  geim.addMultiSelectionFinishedListener(onSelectionChanged)

  graphComponent.inputMode = geim

  // Use two finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)
}

/**
 * Updates the value of the style properties editor on selection changed events.
 * @param {!GraphComponent} graphComponent
 */
function updateEditorValues(graphComponent) {
  const gmm = getModelManager(graphComponent)
  const selection = graphComponent.selection

  const styles = {}
  if (selection.selectedNodes.size > 0) {
    for (const node of selection.selectedNodes) {
      const style = gmm.getStyle(node)
      if (!styles.group && style instanceof WebGL2GroupNodeStyle) {
        styles.group = style
      }
      if (!styles.node && style instanceof WebGL2ShapeNodeStyle) {
        styles.node = style
      }
      if (styles.group && styles.node) {
        break
      }
    }
  }

  if (selection.selectedEdges.size > 0) {
    styles.edge = gmm.getStyle(selection.selectedEdges.first())
  }

  if (selection.selectedLabels.size > 0) {
    styles.label = gmm.getStyle(selection.selectedLabels.first())
  }

  updateEditor(styles)
}

/**
 * Enables WebGL2 as the rendering technique.
 * @param {!GraphComponent} graphComponent
 */
function enableWebGLRendering(graphComponent) {
  graphComponent.graphModelManager = new WebGL2GraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager()
  graphComponent.focusIndicatorManager.enabled = false
}

/**
 * Creates an array of {@link ImageData} from a selection of font awesome classes.
 * @returns {!Array.<ImageData>}
 */
function createFontAwesomeIcons() {
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
 * Creates a WebGL-group-style as configured in the side panel
 */
function getConfiguredGroupNodeStyle() {
  const groupNodeEffectValue = getValue('groupNodeEffect')
  const effect = WebGL2Effect[groupNodeEffectValue]

  const fillPickerValue = getValue('groupNodeFill')
  const fill = Color.from(fillPickerValue)

  const contentFillPickerValue = getValue('groupNodeContentFill')
  const contentFill = Color.from(contentFillPickerValue)

  const tabBackgroundFillPickerValue = getValue('groupNodeTabBackgroundFill')
  const tabBackgroundFill = Color.from(tabBackgroundFillPickerValue)

  const iconBackgroundFillPickerValue = getValue('groupNodeIconBackgroundFill')
  const iconBackgroundFill = Color.from(iconBackgroundFillPickerValue)

  const iconForegroundFillPickerValue = getValue('groupNodeIconForegroundFill')
  const iconForegroundFill = Color.from(iconForegroundFillPickerValue)

  const tabHeight = getNumber('groupNodeTabHeight')
  const tabWidth = getNumber('groupNodeTabWidth')
  const cornerRadius = getNumber('groupNodeCornerRadius')

  const iconBackgroundShapeValue = getValue('groupNodeIconBackgroundShape')
  const iconBackgroundShape = GroupNodeStyleIconBackgroundShape[iconBackgroundShapeValue]

  const tabSlope = getNumber('groupNodeTabSlope')

  const tabInset = getNumber('groupNodeTabInset')

  const tabPosition = getConfiguredTabPosition()
  const iconPosition = getIconPosition(tabPosition)

  let groupIcon = GroupNodeStyleIconType.NONE
  let folderIcon = GroupNodeStyleIconType.NONE
  switch (getValue('groupNodeIcon')) {
    case 'PLUSMINUS':
      groupIcon = GroupNodeStyleIconType.MINUS
      folderIcon = GroupNodeStyleIconType.PLUS
      break
    case 'CHEVRON':
      groupIcon = GroupNodeStyleIconType.CHEVRON_DOWN
      folderIcon = GroupNodeStyleIconType.CHEVRON_RIGHT
      break
    case 'TRIANGLE':
      groupIcon = GroupNodeStyleIconType.TRIANGLE_DOWN
      folderIcon = GroupNodeStyleIconType.TRIANGLE_RIGHT
  }

  const iconSize = tabHeight - 4
  const iconOffset =
    tabPosition == GroupNodeStyleTabPosition.NONE ? iconSize / 2 : (tabHeight - iconSize) / 2

  return new WebGL2GroupNodeStyle({
    tabPosition: tabPosition,
    tabFill: fill,
    tabBackgroundFill: tabBackgroundFill,
    iconBackgroundFill: iconBackgroundFill,
    iconForegroundFill: iconForegroundFill,
    contentAreaFill: contentFill,
    tabWidth: tabWidth,
    tabHeight: tabHeight,
    cornerRadius: cornerRadius,
    groupIcon: groupIcon,
    folderIcon: folderIcon,
    iconBackgroundShape: iconBackgroundShape,
    iconPosition: iconPosition,
    effect: effect,
    tabInset: tabInset,
    tabSlope: tabSlope,
    stroke: getConfiguredStroke('group'),
    iconOffset: iconOffset,
    iconSize: iconSize,
    hitTransparentContentArea: tabPosition != GroupNodeStyleTabPosition.NONE
  })
}

/**
 * Creates a {@link GroupNodeStyleTabPosition} as configured in the side panel
 * @returns {!GroupNodeStyleTabPosition}
 */
function getConfiguredTabPosition() {
  const value = getValue('groupNodeTabPosition')
  return GroupNodeStyleTabPosition[value]
}

/**
 * Get an icon position that fits the current tab position best
 * @param {!GroupNodeStyleTabPosition} position
 */
function getIconPosition(position) {
  return position == GroupNodeStyleTabPosition.TOP_LEADING ||
    position == GroupNodeStyleTabPosition.BOTTOM_LEADING ||
    position == GroupNodeStyleTabPosition.LEFT_LEADING ||
    position == GroupNodeStyleTabPosition.RIGHT_LEADING
    ? GroupNodeStyleIconPosition.LEADING
    : GroupNodeStyleIconPosition.TRAILING
}

/**
 * Creates a {@link WebGL2ShapeNodeStyle} as configured in the side panel
 * @returns {!WebGL2ShapeNodeStyle}
 */
function getConfiguredNodeStyle() {
  return new WebGL2ShapeNodeStyle({
    shape: getConfiguredNodeShape(),
    fill: getConfiguredNodeColor(),
    effect: getConfiguredEffect('node'),
    stroke: getConfiguredStroke('node')
  })
}

/**
 * Creates a color using the "nodeFill" color input.
 * @returns {!Color}
 */
function getConfiguredNodeColor() {
  const pickerValue = getValue('nodeFill')
  return Color.from(pickerValue)
}

/**
 * Returns the {@link WebGL2ShapeNodeShape} as configured in the HTML combobox.
 * @returns {!WebGL2ShapeNodeShape}
 */
function getConfiguredNodeShape() {
  const value = getValue('nodeShape')
  return WebGL2ShapeNodeShape[value]
}

/**
 * Returns the edge style as configured in the relevant HTML combo boxes.
 */
function getConfiguredEdgeStyle() {
  switch (getValue('edgeStyle')) {
    default:
    case 'Default':
      return new WebGL2PolylineEdgeStyle({
        stroke: getConfiguredStroke('edge'),
        sourceArrow: getConfiguredArrowType('sourceArrow'),
        targetArrow: getConfiguredArrowType('targetArrow'),
        effect: getConfiguredEffect('edge'),
        smoothingLength: getConfiguredSmoothingLength()
      })
    case 'Arc':
      return new WebGL2ArcEdgeStyle({
        height: getConfiguredHeight(),
        fixedHeight: true,
        stroke: getConfiguredStroke('edge'),
        sourceArrow: getConfiguredArrowType('sourceArrow'),
        targetArrow: getConfiguredArrowType('targetArrow'),
        effect: getConfiguredEffect('edge')
      })
    case 'Bridge':
      return new WebGL2BridgeEdgeStyle({
        height: getConfiguredHeight(),
        fanLength: 65,
        stroke: getConfiguredStroke('edge'),
        sourceArrow: getConfiguredArrowType('sourceArrow'),
        targetArrow: getConfiguredArrowType('targetArrow'),
        effect: getConfiguredEffect('edge')
      })
  }
}

/**
 * @param {!string} id
 * @returns {!WebGL2ArrowType}
 */
function getConfiguredArrowType(id) {
  const value = getValue(id)
  return WebGL2ArrowType[value]
}

/**
 * @returns {number}
 */
function getConfiguredSmoothingLength() {
  return getNumber('bendSmoothing')
}

/**
 * @returns {number}
 */
function getConfiguredHeight() {
  return getNumber('height')
}

/**
 * Creates a {@link WebGL2IconLabelStyle} as configured in the side panel
 * @param {number} iconIndex
 * @param {!Color} [iconColor]
 * @returns {!WebGL2IconLabelStyle}
 */
function getConfiguredIconLabelStyle(iconIndex, iconColor) {
  if (iconIndex < 0) {
    iconIndex = Math.floor(Math.random() * fontAwesomeIcons.length)
  }

  return new WebGL2IconLabelStyle({
    icon: fontAwesomeIcons[iconIndex],
    iconColor: iconColor ? iconColor : getConfiguredLabelTextColor(),
    backgroundColor: getConfiguredLabelBackgroundColor(),
    backgroundStroke: getConfiguredStroke('label'),
    effect: getConfiguredEffect('label'),
    textureRendering: getConfiguredTextureRenderType(),
    shape: getConfiguredLabelShape()
  })
}

/**
 * Creates a {@link WebGL2DefaultLabelStyle} as configured in the side panel
 * @returns {!WebGL2DefaultLabelStyle}
 */
function getConfiguredLabelStyle() {
  return new WebGL2DefaultLabelStyle({
    shape: getConfiguredLabelShape(),
    textColor: getConfiguredLabelTextColor(),
    backgroundColor: getConfiguredLabelBackgroundColor(),
    backgroundStroke: getConfiguredStroke('label'),
    effect: getConfiguredEffect('label'),
    textureRendering: getConfiguredTextureRenderType(),
    samplingRate: getConfiguredOversamplingRate(),
    insets: 5
  })
}

/**
 * Returns the {@link WebGL2TextureRendering} as configured in the HTML combobox.
 * @returns {!WebGL2TextureRendering}
 */
function getConfiguredTextureRenderType() {
  const value = getValue('labelRenderingType')
  return value == 'SDF' ? WebGL2TextureRendering.SDF : WebGL2TextureRendering.INTERPOLATED
}
/**
 * Returns the oversampling rate for textures as configured.
 * @returns {number}
 */
function getConfiguredOversamplingRate() {
  return getNumber('labelOversampling')
}

/**
 * Returns the {@link WebGL2LabelShape} as configured in the HTML combobox.
 * @returns {!WebGL2LabelShape}
 */
function getConfiguredLabelShape() {
  const value = getValue('labelShape')
  return WebGL2LabelShape[value]
}

/**
 * Returns the label text color as configured in the HTML color picker.
 * @returns {!string}
 */
function getConfiguredLabelTextColor() {
  return getValue('labelTextColor')
}

/**
 * Returns the label background color as configured in the HTML color picker.
 * @returns {!string}
 */
function getConfiguredLabelBackgroundColor() {
  return getValue('labelBackgroundColor')
}

/**
 * Returns a {@link WebGL2Stroke} from the corresponding tab
 * @param {!('node'|'edge'|'label'|'group')} type
 */
function getConfiguredStroke(type) {
  return getStroke(type)
}

/**
 * Returns the {@link WebGL2Effect} as configured in the corresponding HTML combobox.
 * @param {!('node'|'edge'|'label')} type
 * @returns {!WebGL2Effect}
 */
function getConfiguredEffect(type) {
  const value = getValue(`${type}Effect`)
  return WebGL2Effect[value]
}

/**
 * Adds a Label to a node using the configured label shape and the number of nodes in the graph
 * for the label text.
 *
 * @param {!GraphComponent} graphComponent the graph component
 * @param {!INode} node the node to add the label to
 */
function addLabel(graphComponent, node) {
  const graph = graphComponent.graph
  const label = graph.addLabel(node, `Node ${graph.nodes.size}`)
  const gmm = getModelManager(graphComponent)
  gmm.setStyle(label, getConfiguredLabelStyle())
}

/**
 * Creates a canvas for rendering and returns its context.
 * @param {!Size} iconSize
 */
function createCanvasContext(iconSize) {
  // canvas used to pre-render the icons
  const canvas = document.createElement('canvas')
  canvas.setAttribute('width', `${iconSize.width}`)
  canvas.setAttribute('height', `${iconSize.height}`)
  return canvas.getContext('2d')
}

/**
 * Adds a label with {@link WebGL2IconLabelStyle} containing a random grey font awesome image. Optionally, color and icon may be set.
 * to a node.
 * @param {!GraphComponent} graphComponent
 * @param {!INode} node
 * @param {!Color} [iconColor]
 */
function addImageLabel(graphComponent, node, iconColor) {
  const graph = graphComponent.graph
  const label = graph.addLabel(
    node,
    '',
    FreeNodeLabelModel.INSTANCE.createParameter({
      labelRatio: [0.6, 0.5],
      layoutRatio: [1, 0],
      layoutOffset: [0, 0]
    })
  )

  graph.setLabelPreferredSize(label, new Size(30, 30))

  const gmm = getModelManager(graphComponent)
  gmm.setStyle(label, getConfiguredIconLabelStyle(-1, iconColor))
}

/**
 * Creates an initial sample graph.
 * @param {!GraphComponent} graphComponent
 */
function createGraph(graphComponent) {
  const graph = graphComponent.graph
  const gmm = getModelManager(graphComponent)

  const shapes = [
    WebGL2ShapeNodeShape.ELLIPSE,
    WebGL2ShapeNodeShape.RECTANGLE,
    WebGL2ShapeNodeShape.ROUND_RECTANGLE,
    WebGL2ShapeNodeShape.HEXAGON,
    WebGL2ShapeNodeShape.HEXAGON2,
    WebGL2ShapeNodeShape.OCTAGON,
    WebGL2ShapeNodeShape.TRIANGLE,
    WebGL2ShapeNodeShape.PILL
  ]

  const effects = [
    WebGL2Effect.NONE,
    WebGL2Effect.SHADOW,
    WebGL2Effect.AMBIENT_FILL_COLOR,
    WebGL2Effect.AMBIENT_STROKE_COLOR
  ]

  const effect2arrow = new Map([
    [WebGL2Effect.NONE, WebGL2ArrowType.NONE],
    [WebGL2Effect.SHADOW, WebGL2ArrowType.POINTED],
    [WebGL2Effect.AMBIENT_FILL_COLOR, WebGL2ArrowType.TRIANGLE],
    [WebGL2Effect.AMBIENT_STROKE_COLOR, WebGL2ArrowType.DEFAULT]
  ])

  const nodeSize = 70
  const nodeDistance = 150

  let x = 0
  let y = 0
  let lastNode = null
  let countNormalNodes = 0 // counts the non-group nodes in the graph for color variation

  for (const effect of effects) {
    lastNode = null

    // use different arrow and edge styles for each row
    const effectArrow = effect2arrow.get(effect)
    const polylineEdgeStyle = new WebGL2PolylineEdgeStyle({
      stroke: 'black',
      sourceArrow: effectArrow,
      targetArrow: effectArrow
    })

    const arcEdgeStyles = []
    const bridgeEdgeStyles = []
    for (const height of [40, 20, -20, -40]) {
      arcEdgeStyles.push(
        new WebGL2ArcEdgeStyle({
          stroke: 'black',
          sourceArrow: effectArrow,
          targetArrow: effectArrow,
          height
        })
      )
      bridgeEdgeStyles.push(
        new WebGL2BridgeEdgeStyle({
          stroke: 'black',
          sourceArrow: effectArrow,
          targetArrow: effectArrow,
          height,
          fanLength: 65
        })
      )
    }

    // create a group node of appropriate size to house the following nodes
    const groupNode = graph.createGroupNode({
      layout: [
        -nodeSize * 0.25,
        y * nodeDistance - nodeSize / 2,
        shapes.length * nodeDistance,
        nodeSize * 2
      ]
    })
    gmm.setStyle(groupNode, getConfiguredGroupNodeStyle())

    for (const shape of shapes) {
      const width = shape === WebGL2ShapeNodeShape.PILL ? 100 : nodeSize

      const node = graph.createNode([x * nodeDistance, y * nodeDistance, width, nodeSize])

      addLabel(graphComponent, node)

      gmm.setStyle(
        node,
        new WebGL2ShapeNodeStyle(
          shape,
          Color.fromHSLA(countNormalNodes / 32, 1, 0.5, 1.0),
          effect === WebGL2Effect.AMBIENT_STROKE_COLOR ? WebGL2Stroke.BLACK : WebGL2Stroke.NONE,
          effect
        )
      )
      countNormalNodes++

      addImageLabel(graphComponent, node, Color.from('gray'))
      if (lastNode) {
        if (effect === WebGL2Effect.NONE) {
          for (let styleIdx = 0; styleIdx < arcEdgeStyles.length; styleIdx++) {
            const edge = graph.createEdge(lastNode, node)
            gmm.setStyle(edge, arcEdgeStyles[styleIdx])
          }
        } else if (effect === WebGL2Effect.SHADOW) {
          for (let styleIdx = 0; styleIdx < bridgeEdgeStyles.length; styleIdx++) {
            const edge = graph.createEdge(lastNode, node)
            gmm.setStyle(edge, bridgeEdgeStyles[styleIdx])
          }
        } else if (effect === WebGL2Effect.AMBIENT_FILL_COLOR) {
          const edge = graph.createEdge(lastNode, node)
          gmm.setStyle(edge, polylineEdgeStyle)
          // add some bends to display polyline functionality
          const bend1x = lastNode.layout.center.x + 65
          const bend1y = lastNode.layout.center.y + 20
          const bend2x = lastNode.layout.center.x + 85
          const bend2y = lastNode.layout.center.y - 20
          graph.addBend(edge, [bend1x, bend1y])
          graph.addBend(edge, [bend2x, bend2y])
        } else {
          const edge = graph.createEdge(lastNode, node)
          gmm.setStyle(edge, polylineEdgeStyle)
        }
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
 * Updates the styles of the currently selected items in the given graph component.
 * @param {!GraphComponent} graphComponent The demo's main graph view.
 * @param {!('node'|'group'|'edge'|'label')} type The type of selected items whose styles need to be updated.
 */
function updateSelectedItems(graphComponent, type) {
  const gmm = getModelManager(graphComponent)
  const selection = graphComponent.selection

  switch (type) {
    case 'node':
      for (const node of selection.selectedNodes) {
        if (!(gmm.getStyle(node) instanceof WebGL2GroupNodeStyle)) {
          gmm.setStyle(node, getConfiguredNodeStyle())
        }
      }
      break
    case 'group':
      for (const node of selection.selectedNodes) {
        if (gmm.getStyle(node) instanceof WebGL2GroupNodeStyle) {
          gmm.setStyle(node, getConfiguredGroupNodeStyle())
        }
      }
      break
    case 'edge':
      for (const edge of selection.selectedEdges) {
        gmm.setStyle(edge, getConfiguredEdgeStyle())
      }
      break
    case 'label':
      for (const label of selection.selectedLabels) {
        const style = gmm.getStyle(label)
        if (style instanceof WebGL2DefaultLabelStyle) {
          gmm.setStyle(label, getConfiguredLabelStyle())
        } else {
          const idx = fontAwesomeIcons.findIndex(icon => icon === style.icon)
          gmm.setStyle(label, getConfiguredIconLabelStyle(idx))
        }
      }
      break
  }

  //Handle state may have changed, make sure to update it
  graphComponent.inputMode.requeryHandles()
  graphComponent.invalidate()
}

/**
 * Returns the WebGL model manager used by the given graph component.
 * @param {!GraphComponent} graphComponent
 * @returns {!WebGL2GraphModelManager}
 */
function getModelManager(graphComponent) {
  return graphComponent.graphModelManager
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent, null)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent, null)

  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent, null)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent, null)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent, null)
  bindCommand("button[data-command='Delete']", ICommand.DELETE, graphComponent, null)

  configureEditor(type => updateSelectedItems(graphComponent, type))

  // enable height property only when the edge style supports it
  const height = document.getElementById('height')
  bindChangeListener('#edgeStyle', value => {
    height.disabled = value === 'Default'
  })
}

// noinspection JSIgnoredPromiseFromCall
run()
