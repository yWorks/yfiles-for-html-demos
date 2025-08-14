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
  FolderNodeConverter,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphModelManager,
  GroupNodeLabelModel,
  GroupNodeStyle,
  IGraph,
  INode,
  LabelStyle,
  License,
  NodeAlignmentPolicy,
  Rect,
  WebGLGraphModelManager
} from '@yfiles/yfiles'
import { configureToolTips } from './ToolTipHelper'
import { colorSets, initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { BrowserDetection, finishLoading } from '@yfiles/demo-resources/demo-page'
import { initializeSvgWebGlSwitchButton } from './svg-webgl-switch'

async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  configureFolding(graphComponent)
  configureInteraction(graphComponent)
  configureRenderMode(graphComponent)

  configureDefaultStyles(graphComponent.graph)
  createSampleGraph(graphComponent.graph)

  // center the sample graph in the visible area
  void graphComponent.fitGraphBounds()

  initializeSvgWebGlSwitchButton('#styleTypeChooser', graphComponent)
}

/**
 * Creates a sample graph with several group and folder nodes.
 */
function createSampleGraph(graph) {
  // create a couple of GroupNodeStyle instances that demonstrate various tab configuration options
  // for tabs that are placed at the top of the respective node ...
  const stylesWithTabAtTop = []

  // style for red nodes
  const red = colorSets['demo-palette-59']
  stylesWithTabAtTop.push(
    new GroupNodeStyle({
      folderIcon: 'none',
      tabFill: red.fill,
      tabBackgroundFill: red.fill,
      // tab width 0 together with a leading or trailing tab position prevents corner rounding for
      // the "inner" corners of the tab stroke and the content area
      tabPosition: 'top-leading',
      tabWidth: 0.0,
      tabHeight: 24.0,
      stroke: red.stroke
    })
  )

  // style for green nodes
  const green = colorSets['demo-palette-53']
  stylesWithTabAtTop.push(
    new GroupNodeStyle({
      cornerRadius: 0.0,
      groupIcon: 'triangle-down',
      folderIcon: 'triangle-up',
      // enable general CSS support by setting a CSS class
      // this is used for the rotation and hover animations of the folder/group icon
      cssClass: 'group-node',
      iconPosition: 'leading',
      iconBackgroundShape: 'square',
      iconForegroundFill: 'white',
      tabFill: green.fill,
      tabPosition: 'top-leading',
      tabSlope: 0.0,
      stroke: `1px ${green.stroke}`
    })
  )

  // style for blue nodes
  const blue = colorSets['demo-palette-56']
  stylesWithTabAtTop.push(
    new GroupNodeStyle({
      drawShadow: true,
      groupIcon: 'chevron-down',
      folderIcon: 'chevron-up',
      // enable general CSS support by setting a CSS class
      // this is used for the rotation and hover animations of the folder/group icon
      cssClass: 'group-node',
      iconForegroundFill: blue.stroke,
      iconPosition: 'trailing',
      tabPosition: 'top-leading',
      tabFill: blue.fill,
      tabBackgroundFill: blue.stroke,
      tabHeight: 22.0,
      tabSlope: 0.5,
      stroke: `1px ${blue.stroke}`
    })
  )

  // style for orange nodes
  const orange = colorSets['demo-palette-51']
  stylesWithTabAtTop.push(
    new GroupNodeStyle({
      cornerRadius: 8,
      contentAreaFill: orange.nodeLabelFill,
      drawShadow: true,
      groupIcon: 'minus',
      // enable general CSS support by setting a CSS class
      // this is used for the hover animation of the folder/group icon
      cssClass: 'group-node',
      iconBackgroundFill: orange.nodeLabelFill,
      iconForegroundFill: orange.stroke,
      iconBackgroundShape: 'circle-solid',
      tabFill: orange.fill,
      tabHeight: 22.0,
      tabPadding: 8.0,
      stroke: `1px ${orange.stroke}`
    })
  )

  // ... and for tabs at different sides of the respective nodes
  const stylesWithTabAtMiscPositions = []

  // style for gold nodes
  const gold = colorSets['demo-palette-510']
  stylesWithTabAtMiscPositions.push(
    new GroupNodeStyle({
      groupIcon: 'minus',
      // enable general CSS support by setting a CSS class
      // this is used for the hover animation of the folder/group icon
      cssClass: 'group-node',
      contentAreaFill: 'none',
      renderTransparentContentArea: true,
      iconForegroundFill: gold.fill,
      tabFill: gold.fill
    })
  )

  // style for gray nodes
  const gray = colorSets['demo-palette-58']
  stylesWithTabAtMiscPositions.push(
    new GroupNodeStyle({
      cornerRadius: 0.0,
      groupIcon: 'triangle-left',
      folderIcon: 'triangle-right',
      // enable general CSS support by setting a CSS class
      // this is used for the rotation and hover animations of the folder/group icon
      cssClass: 'group-node',
      iconPosition: 'leading',
      iconBackgroundShape: 'square',
      iconForegroundFill: 'white',
      tabFill: gray.fill,
      tabSlope: 0.0,
      tabPosition: 'right-leading',
      stroke: `1px ${gray.stroke}`
    })
  )

  // style for light-green nodes
  const lightGreen = colorSets['demo-palette-54']
  stylesWithTabAtMiscPositions.push(
    new GroupNodeStyle({
      drawShadow: true,
      groupIcon: 'chevron-up',
      folderIcon: 'chevron-down',
      // enable general CSS support by setting a CSS class
      // this is used for the rotation and hover animations of the folder/group icon
      cssClass: 'group-node',
      iconForegroundFill: blue.stroke,
      iconPosition: 'leading',
      tabPosition: 'bottom-trailing',
      tabFill: lightGreen.fill,
      tabBackgroundFill: green.stroke,
      tabHeight: 22.0,
      tabSlope: 0.5,
      stroke: `1px ${lightGreen.stroke}`
    })
  )

  // style for purple nodes
  const purple = colorSets['demo-palette-55']
  stylesWithTabAtMiscPositions.push(
    new GroupNodeStyle({
      cornerRadius: 8,
      contentAreaFill: purple.nodeLabelFill,
      drawShadow: true,
      groupIcon: 'minus',
      // enable general CSS support by setting a CSS class
      // this is used for the hover animation of the folder/group icon
      cssClass: 'group-node',
      iconPosition: 'leading',
      iconBackgroundFill: purple.nodeLabelFill,
      iconForegroundFill: purple.stroke,
      iconBackgroundShape: 'circle-solid',
      tabPosition: 'left',
      tabFill: purple.fill,
      tabHeight: 22.0,
      tabPadding: 8.0,
      stroke: `1px ${purple.stroke}`
    })
  )

  // create label styles that use the same color sets as the GroupNodeStyle instances created above
  const labelStyles = []

  // style for red nodes
  labelStyles.push(
    new LabelStyle({
      verticalTextAlignment: 'top',
      wrapping: 'wrap-character-ellipsis',
      textFill: red.nodeLabelFill
    })
  )

  // style for green nodes
  labelStyles.push(
    new LabelStyle({
      verticalTextAlignment: 'center',
      wrapping: 'wrap-character-ellipsis',
      textFill: green.text
    })
  )

  // style for blue nodes
  // this style uses centered horizontal text because of the sloped tab in the blue nodes
  labelStyles.push(
    new LabelStyle({
      horizontalTextAlignment: 'center',
      verticalTextAlignment: 'center',
      wrapping: 'wrap-character-ellipsis',
      textFill: blue.nodeLabelFill
    })
  )

  // style for orange nodes
  labelStyles.push(
    new LabelStyle({
      verticalTextAlignment: 'center',
      wrapping: 'wrap-character-ellipsis',
      textFill: orange.nodeLabelFill
    })
  )

  const labelStylesWithTabAtMiscPositions = []

  // style for gold nodes
  labelStylesWithTabAtMiscPositions.push(
    new LabelStyle({
      verticalTextAlignment: 'center',
      wrapping: 'wrap-character-ellipsis',
      textFill: gold.nodeLabelFill
    })
  )
  // style for gray nodes
  labelStylesWithTabAtMiscPositions.push(
    new LabelStyle({ verticalTextAlignment: 'center', wrapping: 'wrap-character-ellipsis' })
  )
  // style for light-green nodes
  labelStylesWithTabAtMiscPositions.push(
    new LabelStyle({
      verticalTextAlignment: 'center',
      wrapping: 'wrap-character-ellipsis',
      textFill: green.nodeLabelFill
    })
  )
  // style for purple nodes
  labelStylesWithTabAtMiscPositions.push(
    new LabelStyle({
      verticalTextAlignment: 'center',
      wrapping: 'wrap-character-ellipsis',
      textFill: purple.nodeLabelFill
    })
  )

  const labelTexts = ['Red', 'Green', 'Blue', 'Orange']
  const labelTextsWithTabAtMiscPositions = ['Gold', 'Gray', 'Light green', 'Purple']

  // create one group node and one folder node for each of the above GroupNodeStyle instances
  createGroupAndFolderNodes(graph, stylesWithTabAtTop, labelStyles, labelTexts, 0, 0)
  createGroupAndFolderNodes(
    graph,
    stylesWithTabAtMiscPositions,
    labelStylesWithTabAtMiscPositions,
    labelTextsWithTabAtMiscPositions,
    0,
    425
  )

  // create a couple of child nodes for group nodes ...
  const nodes = graph.nodes.toArray()
  const p1c1 = createChildNode(graph, nodes[1], 20, 52)
  const p1c2 = createChildNode(graph, nodes[1], 80, 32)
  const p1c3 = createChildNode(graph, nodes[1], 60, 102)
  const p1c4 = createChildNode(graph, nodes[1], 140, 102)
  const p2c1 = createChildNode(graph, nodes[2], 43, 42)
  const p2c2 = createChildNode(graph, nodes[2], 133, 78)
  createChildNode(graph, nodes[8], 33, 33)
  const p8c2 = createChildNode(graph, nodes[8], 68, 103)
  const p8c3 = createChildNode(graph, nodes[8], 103, 33)
  const p9c1 = createChildNode(graph, nodes[9], 10, 10)
  const p9c2 = createChildNode(graph, nodes[9], 58, 42)
  const p9c3 = createChildNode(graph, nodes[9], 96, 94)
  createChildNode(graph, nodes[10], 43, 14)
  const pBc1 = createChildNode(graph, nodes[11], 34, 34)
  const pBc2 = createChildNode(graph, nodes[11], 128, 74)
  const pBc3 = createChildNode(graph, nodes[11], 138, 28)
  const pBc4 = createChildNode(graph, nodes[11], 50, 88)

  graph.createEdge(p1c1, p1c3)
  graph.createEdge(p1c3, p1c2)
  graph.createEdge(p1c3, p1c4)
  graph.createEdge(p2c2, p2c1)
  graph.createEdge(p8c2, p8c3)
  graph.createEdge(p9c1, p9c2)
  graph.createEdge(p9c2, p9c3)
  graph.createEdge(pBc1, pBc2)
  graph.createEdge(pBc3, pBc4)

  // ... and folder nodes
  createChildNode(graph, nodes[4], 68, 46)
  createChildNode(graph, nodes[4], 147, 82)
  createChildNode(graph, nodes[7], 55, 100)
  createChildNode(graph, nodes[12], 8, 26)
  createChildNode(graph, nodes[12], 87, 62)
  createChildNode(graph, nodes[13], 29, 85)
  createChildNode(graph, nodes[13], 59, 55)
  createChildNode(graph, nodes[13], 89, 25)
  createChildNode(graph, nodes[14], 8, 15)
  createChildNode(graph, nodes[14], 58, 15)
  createChildNode(graph, nodes[14], 108, 15)
  createChildNode(graph, nodes[14], 58, 55)
  createChildNode(graph, nodes[14], 108, 55)
  createChildNode(graph, nodes[14], 158, 55)
  createChildNode(graph, nodes[15], 55, 25)
  createChildNode(graph, nodes[15], 133, 25)
  createChildNode(graph, nodes[15], 55, 95)
  createChildNode(graph, nodes[15], 133, 95)
}

/**
 * Creates a group node and a folder node for each of the given style instances.
 * Additionally, this method will add one label to each created group or folder node.
 * @param graph The graph in which to create the new group and folder nodes.
 * @param nodeStyles The style instances for which to create new group and folder nodes.
 * @param labelStyles The style instances for the labels of the new group and folder nodes.
 * @param labelTexts The texts for the labels of the new group and folder nodes.
 * @param x0 The top-left x-coordinate of the first node to create.
 * @param y0 The top-left x-coordinate of the first node to create.
 */
function createGroupAndFolderNodes(graph, nodeStyles, labelStyles, labelTexts, x0, y0) {
  // place the labels of the group and folder nodes into the tab background of their visualizations
  // GroupNodeLabelModel's default parameter can be used to place labels into the tab area instead
  const tabBackgroundParameter = new GroupNodeLabelModel().createTabBackgroundParameter()

  let y = y0
  const width = 200
  const height = 150
  for (let j = 0; j < 2; ++j) {
    let x = x0
    const n = nodeStyles.length
    for (let i = 0; i < n; ++i) {
      const node = graph.createGroupNode(null, new Rect(x, y, width, height), nodeStyles[i])

      graph.addLabel(node, `${labelTexts[i]} ${j + 1}`, tabBackgroundParameter, labelStyles[i])

      if (j > 0) {
        collapseLast(graph)
      }

      x += width + 100
    }

    y += height + 25
  }
}

/**
 * Creates a child node for the given parent group node.
 * The created node will be neither a group node nor a folder node.
 * @param graph The graph in which to create the new node.
 * @param parent The parent node for the new node.
 * @param xOffset The distance in x-direction from the new node's top left corner to the parent node's top left corner.
 * @param yOffset The distance in y-direction from the new node's top left corner to the parent node's top left corner.
 */
function createChildNode(graph, parent, xOffset, yOffset) {
  const nl = parent.layout
  const node = graph.createNode(new Rect(nl.x + xOffset, nl.y + yOffset, 30, 30))
  graph.setParent(node, parent)
  return node
}

/**
 * Collapses the last group node in the given graph.
 */
function collapseLast(graph) {
  graph.foldingView.collapse(graph.nodes.last())
}

/**
 * Enables folding in the given graph component.
 */
function configureFolding(graphComponent) {
  graphComponent.graph = new FoldingManager({
    folderNodeConverter: new FolderNodeConverter({ folderNodeDefaults: { copyLabels: true } }),
    masterGraph: graphComponent.graph
  }).createFoldingView().graph
}

/**
 * Enables basic user interaction for the given graph component.
 */
function configureInteraction(graphComponent) {
  const editorInputMode = new GraphEditorInputMode({
    allowCreateNode: false,
    deletableItems: GraphItemTypes.ALL & ~GraphItemTypes.NODE,
    // give labels a higher priority, so that double-clicking labels will still trigger the label
    // editing, even though below we handle the double clicks for nodes
    doubleClickHitTestOrder: [GraphItemTypes.LABEL, GraphItemTypes.ALL],
    navigationInputMode: { autoGroupNodeAlignmentPolicy: NodeAlignmentPolicy.CENTER }
  })
  // Provide a way to collapse group nodes or expand folder nodes even if their style does not
  // show an icon for collapsing or expanding.
  editorInputMode.addEventListener('item-left-double-clicked', (evt) => {
    const item = evt.item
    if (item instanceof INode) {
      const foldingView = graphComponent.graph.foldingView
      if (
        foldingView &&
        foldingView.manager.masterGraph.isGroupNode(foldingView.getMasterItem(item))
      ) {
        if (foldingView.isExpanded(item)) {
          editorInputMode.navigationInputMode.collapseGroup(item)
        } else {
          editorInputMode.navigationInputMode.expandGroup(item)
        }
        // we need to make sure that any handles that are present are reevaluated because they
        // may have different constraints after the expand/collapse operation
        editorInputMode.requeryHandles()
        evt.handled = true
      }
    }
  })

  configureToolTips(editorInputMode)

  graphComponent.inputMode = editorInputMode
}

/**
 * Configures the graphModelManager to support switching between svg and webgl rendering.
 * At the beginning, the svg rendering is applied.
 */
function configureRenderMode(graphComponent) {
  graphComponent.graphModelManager = BrowserDetection.webGL2
    ? new WebGLGraphModelManager({ renderMode: 'svg' })
    : new GraphModelManager()
}

/**
 * Configures the default styles for new nodes, edges, and labels in the given graph.
 */
function configureDefaultStyles(graph) {
  initDemoStyles(graph, { theme: 'demo-palette-58' })
}

run().then(finishLoading)
