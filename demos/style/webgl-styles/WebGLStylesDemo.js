/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Arrow,
  ArrowType,
  Color,
  FoldingManager,
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GroupNodeLabelModel,
  GroupNodeStyle,
  GroupNodeStyleIconBackgroundShape,
  GroupNodeStyleIconPosition,
  GroupNodeStyleIconType,
  GroupNodeStyleTabPosition,
  Insets,
  LabelStyle,
  License,
  NodeAlignmentPolicy,
  Size,
  WebGLArcEdgeStyle,
  WebGLArrowType,
  WebGLBridgeEdgeStyle,
  WebGLEffect,
  WebGLGraphModelManager,
  WebGLGroupNodeStyle,
  WebGLIconLabelStyle,
  WebGLLabelShape,
  WebGLLabelStyle,
  WebGLPolylineEdgeStyle,
  WebGLSelectionIndicatorManager,
  WebGLShapeNodeShape,
  WebGLShapeNodeStyle,
  WebGLStroke,
  WebGLTextureRendering
} from '@yfiles/yfiles'

import { createCanvasContext, createFontAwesomeIcon } from '@yfiles/demo-utils/IconCreation'
import licenseData from '../../../lib/license.json'
import { configureEditor, getNumber, getStroke, getValue, updateEditor } from './PropertiesEditor'
import { configureTwoPointerPanning } from '@yfiles/demo-utils/configure-two-pointer-panning'
import { checkWebGL2Support, finishLoading } from '@yfiles/demo-app/demo-page'

let fontAwesomeIcons
let foldingManager

async function run() {
  if (!checkWebGL2Support()) {
    return
  }

  License.value = licenseData
  const graphComponent = new GraphComponent('#graphComponent')

  enableWebGLRendering(graphComponent)
  configureDefaultStyles(graphComponent.graph)
  // enables group nodes to be collapsed - optional
  enableFolding(graphComponent)
  configureInteraction(graphComponent)

  fontAwesomeIcons = await createFontAwesomeIcons()

  // create an initial sample graph
  createGraph(graphComponent)

  // enable undo engine
  graphComponent.graph.foldingView.manager.masterGraph.undoEngineEnabled = true

  // center the graph in the visible area
  void graphComponent.fitGraphBounds()

  // bind the buttons to their functionality
  initializeUI(graphComponent)
}

/**
 * Configures the "classic" (non-WebGL) style defaults
 */
function configureDefaultStyles(graph) {
  graph.nodeDefaults.size = new Size(70, 70)

  // we need to set the padding on the label style defaults,
  // as those have to be in sync with the padding set in the
  // WebGLDefaultLabelStyle.
  const verticalPadding = getConfiguredVerticalPadding()
  const horizontalPadding = getConfiguredHorizontalPadding()
  const defaultLabelStyle = new LabelStyle({
    padding: new Insets(verticalPadding, horizontalPadding, verticalPadding, horizontalPadding)
  })
  graph.nodeDefaults.labels.style = defaultLabelStyle
  graph.edgeDefaults.labels.style = defaultLabelStyle

  graph.groupNodeDefaults.style = new GroupNodeStyle()
  graph.groupNodeDefaults.labels.layoutParameter = new GroupNodeLabelModel().createTabParameter()
}

/**
 * Sets up folding
 * The FoldingManager creates a copy of the graph. From this so-called view graph, items are removed and added when a group is collapsed.
 * When an item gets re-added after expanding a group, the WebGL-style has to be set again for this item.
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
  folderNodeConverter.folderNodeDefaults.size = new Size(100, 24)
  // Copy the first label to keep the collapse/expand button
  folderNodeConverter.folderNodeDefaults.copyLabels = true
}

/**
 * Configures the interaction behavior.
 */
function configureInteraction(graphComponent) {
  const graph = graphComponent.graph

  // Allow editing of the graph
  const geim = new GraphEditorInputMode({
    allowClipboardOperations: true,
    marqueeSelectableItems: GraphItemTypes.NODE | GraphItemTypes.BEND,
    //Completely disable handles for ports and edges
    showHandleItems: GraphItemTypes.ALL & ~GraphItemTypes.PORT & ~GraphItemTypes.EDGE,
    clickHitTestOrder: [GraphItemTypes.LABEL, GraphItemTypes.EDGE, GraphItemTypes.NODE]
  })

  // Configure expand/collapse behavior
  geim.navigationInputMode.allowExpandGroup = true
  geim.navigationInputMode.allowCollapseGroup = true
  geim.navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_RIGHT

  // Disable moving of individual edge segments
  graph.decorator.edges.portHandleProvider.hide()

  // Do not show bend handles and disable bend creation for styles that do not support bends
  graph.decorator.bends.handleProvider.hide((bend) => {
    const style = bend.owner.style
    return !(style instanceof WebGLPolylineEdgeStyle)
  })
  graph.decorator.edges.bendCreator.hide((edge) => {
    const style = edge.style
    return !(style instanceof WebGLPolylineEdgeStyle)
  })

  // On node creation, set the configured style as well as a random color
  geim.addEventListener('node-created', (evt) => {
    const node = evt.item
    if (graphComponent.graph.isGroupNode(node)) {
      graph.setStyle(node, getConfiguredGroupNodeStyle())
    } else {
      addLabel(graphComponent, node)
      addImageLabel(graphComponent, node, Color.from('gray'))
      graph.setStyle(node, getConfiguredNodeStyle())
    }
  })

  // On edge creation, set the configured edge style
  geim.createEdgeInputMode.addEventListener('edge-created', (evt) => {
    graph.setStyle(evt.item, getConfiguredEdgeStyle())
  })

  geim.createEdgeInputMode.addEventListener('gesture-started', () => {
    geim.createEdgeInputMode.previewEdge.style.targetArrow = new Arrow(ArrowType.NONE)
  })

  geim.addEventListener('label-added', (evt) => {
    graph.setStyle(evt.item, getConfiguredLabelStyle())
  })

  const onSelectionChanged = () => updateEditorValues(graphComponent)
  geim.addEventListener('deleted-selection', onSelectionChanged)
  geim.addEventListener('grouped-selection', onSelectionChanged)
  geim.addEventListener('multi-selection-finished', onSelectionChanged)

  graphComponent.inputMode = geim

  // Use two finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)
}

/**
 * Updates the value of the style properties editor on selection changed events.
 */
function updateEditorValues(graphComponent) {
  const selection = graphComponent.selection

  const styles = {}
  if (selection.nodes.size > 0) {
    for (const node of selection.nodes) {
      const style = node.style
      if (!styles.group && style instanceof WebGLGroupNodeStyle) {
        styles.group = style
      }
      if (!styles.node && style instanceof WebGLShapeNodeStyle) {
        styles.node = style
      }
      if (styles.group && styles.node) {
        break
      }
    }
  }

  if (selection.edges.size > 0) {
    styles.edge = selection.edges.first().style
  }

  if (selection.labels.size > 0) {
    styles.label = selection.labels.first().style
  }

  updateEditor(styles)
}

/**
 * Enables WebGL as the rendering technique.
 */
function enableWebGLRendering(graphComponent) {
  graphComponent.graphModelManager = new WebGLGraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGLSelectionIndicatorManager()
  graphComponent.focusIndicatorManager.enabled = false
}

/**
 * Creates an array of {@link ImageData} from a selection of font awesome classes.
 */
async function createFontAwesomeIcons() {
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
  const ctx = createCanvasContext(128, 128)
  return await Promise.all(faClasses.map((faClass) => createFontAwesomeIcon(ctx, faClass)))
}

/**
 * Creates a WebGL-group-style as configured in the side panel
 */
function getConfiguredGroupNodeStyle() {
  const groupNodeEffectValue = getValue('groupNodeEffect')
  const effect = WebGLEffect[groupNodeEffectValue]

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

  const tabPadding = getNumber('groupNodeTabPadding')

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

  return new WebGLGroupNodeStyle({
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
    tabPadding: tabPadding,
    tabSlope: tabSlope,
    stroke: getConfiguredStroke('group'),
    iconOffset: iconOffset,
    iconSize: iconSize,
    hitTransparentContentArea: tabPosition != GroupNodeStyleTabPosition.NONE
  })
}

/**
 * Creates a {@link GroupNodeStyleTabPosition} as configured in the side panel
 */
function getConfiguredTabPosition() {
  const value = getValue('groupNodeTabPosition')
  return GroupNodeStyleTabPosition[value]
}

/**
 * Get an icon position that fits the current tab position best
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
 * Creates a {@link WebGLShapeNodeStyle} as configured in the side panel
 */
function getConfiguredNodeStyle() {
  return new WebGLShapeNodeStyle({
    shape: getConfiguredNodeShape(),
    fill: getConfiguredNodeColor(),
    effect: getConfiguredEffect('node'),
    stroke: getConfiguredStroke('node')
  })
}

/**
 * Creates a color using the "nodeFill" color input.
 */
function getConfiguredNodeColor() {
  const pickerValue = getValue('nodeFill')
  return Color.from(pickerValue)
}

/**
 * Returns the {@link WebGLShapeNodeShape} as configured in the HTML combobox.
 */
function getConfiguredNodeShape() {
  const value = getValue('nodeShape')
  return WebGLShapeNodeShape[value]
}

/**
 * Returns the edge style as configured in the relevant HTML combo boxes.
 */
function getConfiguredEdgeStyle() {
  switch (getValue('edgeStyle')) {
    default:
    case 'Default':
      return new WebGLPolylineEdgeStyle({
        stroke: getConfiguredStroke('edge'),
        sourceArrow: getConfiguredArrowType('sourceArrow'),
        targetArrow: getConfiguredArrowType('targetArrow'),
        effect: getConfiguredEffect('edge'),
        smoothingLength: getConfiguredSmoothingLength()
      })
    case 'Arc':
      return new WebGLArcEdgeStyle({
        height: getConfiguredHeight(),
        fixedHeight: true,
        stroke: getConfiguredStroke('edge'),
        sourceArrow: getConfiguredArrowType('sourceArrow'),
        targetArrow: getConfiguredArrowType('targetArrow'),
        effect: getConfiguredEffect('edge')
      })
    case 'Bridge':
      return new WebGLBridgeEdgeStyle({
        height: getConfiguredHeight(),
        fanLength: 65,
        stroke: getConfiguredStroke('edge'),
        sourceArrow: getConfiguredArrowType('sourceArrow'),
        targetArrow: getConfiguredArrowType('targetArrow'),
        effect: getConfiguredEffect('edge')
      })
  }
}

function getConfiguredArrowType(id) {
  const value = getValue(id)
  return WebGLArrowType[value]
}

function getConfiguredSmoothingLength() {
  return getNumber('bendSmoothing')
}

function getConfiguredHeight() {
  return getNumber('height')
}

/**
 * Creates a {@link WebGLIconLabelStyle} as configured in the side panel
 */
function getConfiguredIconLabelStyle(iconIndex, iconColor) {
  if (iconIndex < 0) {
    iconIndex = Math.floor(Math.random() * fontAwesomeIcons.length)
  }

  return new WebGLIconLabelStyle({
    icon: fontAwesomeIcons[iconIndex],
    iconColor: iconColor ? iconColor : getConfiguredLabelTextColor(),
    backgroundColor: getConfiguredLabelBackgroundColor(),
    backgroundStroke: getConfiguredStroke('label'),
    effect: getConfiguredEffect('label'),
    textureRendering: getConfiguredTextureRenderType(),
    backgroundShape: getConfiguredLabelShape()
  })
}

/**
 * Creates a {@link WebGLLabelStyle} as configured in the side panel
 */
function getConfiguredLabelStyle() {
  const verticalPadding = getConfiguredVerticalPadding()
  const horizontalPadding = getConfiguredHorizontalPadding()
  return new WebGLLabelStyle({
    shape: getConfiguredLabelShape(),
    textColor: getConfiguredLabelTextColor(),
    backgroundColor: getConfiguredLabelBackgroundColor(),
    backgroundStroke: getConfiguredStroke('label'),
    effect: getConfiguredEffect('label'),
    textureRendering: getConfiguredTextureRenderType(),
    samplingRate: getConfiguredOversamplingRate(),
    padding: new Insets(verticalPadding, horizontalPadding, verticalPadding, horizontalPadding)
  })
}

/**
 * Returns the {@link WebGLTextureRendering} as configured in the HTML combobox.
 */
function getConfiguredTextureRenderType() {
  const value = getValue('labelRenderingType')
  return value == 'SDF' ? WebGLTextureRendering.SDF : WebGLTextureRendering.INTERPOLATED
}

/**
 * Returns the oversampling rate for textures as configured.
 */
function getConfiguredOversamplingRate() {
  return getNumber('labelOversampling')
}

/**
 * Returns the padding rate for labels as configured.
 */
function getConfiguredHorizontalPadding() {
  return getNumber('horizontalPadding')
}

/**
 * Returns the padding rate for labels as configured.
 */
function getConfiguredVerticalPadding() {
  return getNumber('verticalPadding')
}

/**
 * Returns the {@link WebGLLabelShape} as configured in the HTML combobox.
 */
function getConfiguredLabelShape() {
  const value = getValue('labelShape')
  return WebGLLabelShape[value]
}

/**
 * Returns the label text color as configured in the HTML color picker.
 */
function getConfiguredLabelTextColor() {
  return getValue('labelTextColor')
}

/**
 * Returns the label background color as configured in the HTML color picker.
 */
function getConfiguredLabelBackgroundColor() {
  return getValue('labelBackgroundColor')
}

/**
 * Returns a {@link WebGLStroke} from the corresponding tab
 */
function getConfiguredStroke(type) {
  return getStroke(type)
}

/**
 * Returns the {@link WebGLEffect} as configured in the corresponding HTML combobox.
 */
function getConfiguredEffect(type) {
  const value = getValue(`${type}Effect`)
  return WebGLEffect[value]
}

/**
 * Adds a Label to a node using the configured label shape and the number of nodes in the graph
 * for the label text.
 *
 * @param graphComponent the graph component
 * @param node the node to add the label to
 */
function addLabel(graphComponent, node) {
  const graph = graphComponent.graph
  const label = graph.addLabel(node, `Node ${graph.nodes.size}`)
  graph.setStyle(label, getConfiguredLabelStyle())
}

/**
 * Adds a label with {@link WebGLIconLabelStyle} containing a random grey font awesome image. Optionally, color and icon may be set.
 * to a node.
 */
function addImageLabel(graphComponent, node, iconColor) {
  const graph = graphComponent.graph
  graph.addLabel(
    node,
    '',
    FreeNodeLabelModel.INSTANCE.createParameter({
      labelRatio: [0.6, 0.5],
      layoutRatio: [1, 0],
      layoutOffset: [0, 0]
    }),
    getConfiguredIconLabelStyle(-1, iconColor),
    new Size(30, 30)
  )
}

/**
 * Creates an initial sample graph.
 */
function createGraph(graphComponent) {
  const graph = graphComponent.graph

  const shapes = [
    WebGLShapeNodeShape.ELLIPSE,
    WebGLShapeNodeShape.RECTANGLE,
    WebGLShapeNodeShape.ROUND_RECTANGLE,
    WebGLShapeNodeShape.HEXAGON,
    WebGLShapeNodeShape.HEXAGON_STANDING,
    WebGLShapeNodeShape.OCTAGON,
    WebGLShapeNodeShape.TRIANGLE,
    WebGLShapeNodeShape.PILL
  ]

  const effects = [
    WebGLEffect.NONE,
    WebGLEffect.SHADOW,
    WebGLEffect.AMBIENT_FILL_COLOR,
    WebGLEffect.AMBIENT_STROKE_COLOR
  ]

  const effect2arrow = new Map([
    [WebGLEffect.NONE, WebGLArrowType.NONE],
    [WebGLEffect.SHADOW, WebGLArrowType.POINTED],
    [WebGLEffect.AMBIENT_FILL_COLOR, WebGLArrowType.TRIANGLE],
    [WebGLEffect.AMBIENT_STROKE_COLOR, WebGLArrowType.STEALTH]
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
    const polylineEdgeStyle = new WebGLPolylineEdgeStyle({
      stroke: 'black',
      sourceArrow: effectArrow,
      targetArrow: effectArrow
    })

    const arcEdgeStyles = []
    const bridgeEdgeStyles = []
    for (const height of [40, 20, -20, -40]) {
      arcEdgeStyles.push(
        new WebGLArcEdgeStyle({
          stroke: 'black',
          sourceArrow: effectArrow,
          targetArrow: effectArrow,
          height
        })
      )
      bridgeEdgeStyles.push(
        new WebGLBridgeEdgeStyle({
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
    graph.setStyle(groupNode, getConfiguredGroupNodeStyle())

    for (const shape of shapes) {
      const width = shape === WebGLShapeNodeShape.PILL ? 100 : nodeSize

      const node = graph.createNode([x * nodeDistance, y * nodeDistance, width, nodeSize])

      addLabel(graphComponent, node)

      graph.setStyle(
        node,
        new WebGLShapeNodeStyle(
          shape,
          Color.fromHSLA(countNormalNodes / 32, 1, 0.5, 1.0),
          effect === WebGLEffect.AMBIENT_STROKE_COLOR ? WebGLStroke.BLACK : WebGLStroke.NONE,
          effect
        )
      )
      countNormalNodes++

      addImageLabel(graphComponent, node, Color.from('gray'))
      if (lastNode) {
        if (effect === WebGLEffect.NONE) {
          for (let styleIdx = 0; styleIdx < arcEdgeStyles.length; styleIdx++) {
            const edge = graph.createEdge(lastNode, node)
            graph.setStyle(edge, arcEdgeStyles[styleIdx])
          }
        } else if (effect === WebGLEffect.SHADOW) {
          for (let styleIdx = 0; styleIdx < bridgeEdgeStyles.length; styleIdx++) {
            const edge = graph.createEdge(lastNode, node)
            graph.setStyle(edge, bridgeEdgeStyles[styleIdx])
          }
        } else if (effect === WebGLEffect.AMBIENT_FILL_COLOR) {
          const edge = graph.createEdge(lastNode, node)
          graph.setStyle(edge, polylineEdgeStyle)
          // add some bends to display polyline functionality
          const bend1x = lastNode.layout.center.x + 65
          const bend1y = lastNode.layout.center.y + 20
          const bend2x = lastNode.layout.center.x + 85
          const bend2y = lastNode.layout.center.y - 20
          graph.addBend(edge, [bend1x, bend1y])
          graph.addBend(edge, [bend2x, bend2y])
        } else {
          const edge = graph.createEdge(lastNode, node)
          graph.setStyle(edge, polylineEdgeStyle)
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
 * @param graphComponent The demo's main graph view.
 * @param type The type of selected items whose styles need to be updated.
 */
function updateSelectedItems(graphComponent, type) {
  const graph = graphComponent.graph
  const selection = graphComponent.selection

  switch (type) {
    case 'node':
      for (const node of selection.nodes) {
        if (!(node.style instanceof WebGLGroupNodeStyle)) {
          graph.setStyle(node, getConfiguredNodeStyle())
        }
      }
      break
    case 'group':
      for (const node of selection.nodes) {
        if (node.style instanceof WebGLGroupNodeStyle) {
          graph.setStyle(node, getConfiguredGroupNodeStyle())
        }
      }
      break
    case 'edge':
      for (const edge of selection.edges) {
        graph.setStyle(edge, getConfiguredEdgeStyle())
      }
      break
    case 'label':
      for (const label of selection.labels) {
        const style = label.style
        if (style instanceof WebGLLabelStyle) {
          graph.setStyle(label, getConfiguredLabelStyle())
        } else if (style instanceof WebGLIconLabelStyle) {
          const preferredSize = label.preferredSize
          const idx = fontAwesomeIcons.findIndex((icon) => icon === style.icon)
          graph.setStyle(label, getConfiguredIconLabelStyle(idx))
          graph.setLabelPreferredSize(label, preferredSize)
        }
      }
      break
  }

  //Handle state may have changed, make sure to update it
  graphComponent.inputMode.requeryHandles()
  graphComponent.invalidate()
}

/**
 * Binds actions to the buttons in the tutorial's toolbar.
 */
function initializeUI(graphComponent) {
  configureEditor((type) => updateSelectedItems(graphComponent, type))

  // enable height property only when the edge style supports it
  const height = document.querySelector('#height')
  document.querySelector('#edgeStyle').addEventListener('change', (e) => {
    height.disabled = e.target.value === 'Default'
  })
}

run().then(finishLoading)
