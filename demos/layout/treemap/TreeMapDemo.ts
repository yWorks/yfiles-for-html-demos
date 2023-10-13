/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Cursor,
  DefaultFolderNodeConverter,
  DefaultGraph,
  DefaultLabelStyle,
  FoldingManager,
  Font,
  GraphBuilder,
  GraphComponent,
  GraphCopier,
  GraphHighlightIndicatorManager,
  GraphItemTypes,
  GraphViewerInputMode,
  GroupingKeys,
  HierarchicNestingPolicy,
  IGraph,
  ILabel,
  IndicatorNodeStyleDecorator,
  INode,
  InteriorStretchLabelModel,
  IRenderContext,
  License,
  NodeStyleBase,
  NodeWeightComparer,
  Point,
  ShapeNodeStyle,
  Size,
  SvgVisual,
  TextWrapping,
  TilingPolicy,
  TreeMapLayout,
  TreeMapLayoutData,
  VoidLabelStyle,
  YDimension,
  YInsets,
  YNode,
  YString
} from 'yfiles'

import TreeMapData from './resources/TreeMapData'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/**
 * Mapper registry key for node names.
 */
const NAME_KEY = 'NODE_TO_NAME'
/**
 * Mapper registry key for preferred sizes.
 */
const PREFERRED_SIZE_KEY = 'ROOT_TO_PREFERRED_SIZE'

/**
 * The graph component containing the current graph.
 */
let graphComponent: GraphComponent

/**
 * The complete graph containing all nodes and the general hierarchy information.
 * This graph is used as a template for the visible sub-graphs.
 */
let masterGraph: IGraph

/**
 * Starts and sets up the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  initializeGraph()
  initializeInputModes()
  initializeUI()
}

/**
 * Initializes the default styles and loads a sample graph from JSON.
 */
function initializeGraph(): void {
  // configure default styles to instantly apply to the sample graph
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new ColorNodeStyle()
  graph.nodeDefaults.size = new Size(70, 70)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    textSize: 9,
    textFill: 'white',
    horizontalTextAlignment: 'center',
    verticalTextAlignment: 'center'
  })
  graph.nodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.CENTER
  graph.nodeDefaults.labels.shareStyleInstance = false
  graph.nodeDefaults.shareStyleInstance = false

  graph.groupNodeDefaults.style = new ShapeNodeStyle({
    fill: 'rgba(104, 104, 104, 1)',
    stroke: null
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    backgroundFill: 'rgb(77, 77, 77)',
    textFill: 'white',
    textSize: 14,
    horizontalTextAlignment: 'center',
    verticalTextAlignment: 'center',
    insets: [3, 5, 3, 5]
  })
  graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH

  // Disable hierarchic nesting, to easily control the z-order of the nodes during animation. We assume
  // this graph has no edges.
  graphComponent.graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NONE

  // load the sample graph
  const graphBuilder = new GraphBuilder(graph)
  graphBuilder.createNodesSource({
    data: TreeMapData.nodesSource,
    id: 'id',
    parentId: 'groupRef',
    labels: ['label']
  })
  graphBuilder.createGroupNodesSource({
    data: TreeMapData.groupsSource,
    id: 'groupTag',
    parentId: 'parentGroupRef'
  })

  graphBuilder.buildGraph()

  for (const node of graph.nodes) {
    if (graph.isGroupNode(node)) {
      graph.addLabel(node, node.tag.label)
    }
  }

  // store the master graph as a template
  masterGraph = graph
  masterGraph.mapperRegistry.createMapper(INode.$class, YDimension.$class, PREFERRED_SIZE_KEY)

  graphComponent.viewportLimiter.honorBothDimensions = false

  // create a sub-graph that only shows the root and its children and grandchildren
  updateGraph()
}

/**
 * Initializes the input modes.
 * Groups and folders can be navigated by clicking on the respective node. Valid/clickable nodes
 * get a highlight when the mouse hovers over them.
 */
function initializeInputModes(): void {
  const inputMode = new GraphViewerInputMode()
  inputMode.selectableItems = GraphItemTypes.NONE
  inputMode.focusableItems = GraphItemTypes.NONE
  inputMode.addItemClickedListener((_, evt) => {
    const item = evt.item
    if (item instanceof INode && onNodeClicked(item)) {
      evt.handled = true
    }
  })
  // add tooltips that show the label text
  inputMode.toolTipItems = GraphItemTypes.NODE
  inputMode.mouseHoverInputMode.toolTipLocationOffset = new Point(10, 10)
  inputMode.addQueryItemToolTipListener((_, evt) => {
    if (evt.handled) {
      return
    }
    const hitNode = evt.item
    if (hitNode instanceof INode && hitNode.labels.size > 0) {
      evt.toolTip = hitNode.labels.get(0).text
      evt.handled = true
    }
  })

  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  inputMode.itemHoverInputMode.discardInvalidItems = false
  inputMode.itemHoverInputMode.addHoveredItemChangedListener((_, evt) => {
    const manager = graphComponent.highlightIndicatorManager
    manager.clearHighlights()

    const item = evt.item

    inputMode.defaultCursor = Cursor.DEFAULT
    if (item instanceof INode) {
      // get the node from the master graph to be able to check the hierarchy information
      let root = masterGraph.nodes.find(node => equalTags(item, node))

      const itemGraph = graphComponent.graph
      if (masterGraph.isGroupNode(root)) {
        let cursor = Cursor.ZOOM_IN
        if (!itemGraph.getParent(item)) {
          root = root ? masterGraph.getParent(root) : null
          cursor = Cursor.ZOOM_OUT
        }
        if (root) {
          inputMode.defaultCursor = cursor
          manager.addHighlight(item)
        }
      } else {
        const parent = root ? masterGraph.getParent(root) : null
        if (parent && parent.tag.parentGroupRef !== '') {
          const itemParent = graphComponent.graph.getParent(item)!
          inputMode.defaultCursor = itemGraph.getParent(itemParent)
            ? Cursor.ZOOM_IN
            : Cursor.ZOOM_OUT
          manager.addHighlight(itemParent)
        }
      }
    }
  })
  graphComponent.inputMode = inputMode
}

/**
 * Handles node clicked events.
 * @param clickedNode the node that was clicked.
 * @returns true if the visible graph is changed due to the click and false otherwise.
 */
function onNodeClicked(clickedNode: INode): boolean {
  // remember if the click will be going downwards or upwards
  let isDrillDown = true

  // get the node from the master graph to be able to check the hierarchy information
  let root = masterGraph.nodes.find(node => equalTags(clickedNode, node))

  // group nodes can be entered, or they lead to a higher hierarchy level
  if (root && masterGraph.isGroupNode(root)) {
    const visibleGraph = graphComponent.graph
    const clickedNodeLayout = clickedNode.layout
    if (!visibleGraph.getParent(clickedNode)) {
      // up to a higher hierarchy level, take the parent of the root node as new root
      root = masterGraph.getParent(root)
      isDrillDown = false
    } else {
      const preferredSizes = masterGraph.mapperRegistry.getMapper<INode, YDimension>(
        PREFERRED_SIZE_KEY
      )!
      const preferredSize = preferredSizes.get(root)
      if (!preferredSize) {
        preferredSizes.set(root, new YDimension(clickedNodeLayout.width, clickedNodeLayout.height))
      }
    }
    if (root) {
      masterGraph.setNodeLayout(root, clickedNodeLayout.toRect())

      // update the graph to only contain the new root and its children and grandchildren
      updateGraph(root, clickedNode, isDrillDown)
    }
    return true
  }
  return false
}

/**
 * Updates the current graph when the root node changes.
 */
function updateGraph(root?: INode, clickedNode?: INode, isDrillDown = false): void {
  let graph: IGraph = new DefaultGraph({
    nodeDefaults: masterGraph.nodeDefaults,
    groupNodeDefaults: masterGraph.groupNodeDefaults
  })
  const copier = new GraphCopier()

  let clickedNodeCopy: INode | null = null
  if (root) {
    // collect the descendants of the root nodes that should be visible
    const visibleNodes: INode[] = []
    for (const child of masterGraph.getChildren(root)) {
      visibleNodes.push(child)
      for (const grandChild of masterGraph.getChildren(child)) {
        visibleNodes.push(grandChild)
      }
    }
    visibleNodes.push(root)
    // create a copy of the graph containing only the visible nodes
    copier.copy(
      masterGraph,
      // there are only nodes and labels in this demo
      item => visibleNodes.includes((item instanceof ILabel ? item.owner : item) as INode),
      graph,
      Point.ORIGIN,
      () => {}
    )

    // center nodes inside the route to get a smooth animation
    for (const node of graph.nodes) {
      graph.setNodeCenter(node, root.layout.center)

      // Animate the upwards direction by 'fitting' the clicked node into the layout. This is achieved by keeping
      // the original layout for the clicked nodes and children.
      if (clickedNode && !isDrillDown) {
        if (equalTags(node, clickedNode)) {
          graph.setNodeLayout(node, clickedNode.layout.toRect())
          clickedNodeCopy = node
          const visibleGraph = graphComponent.graph
          if (visibleGraph.isGroupNode(clickedNode)) {
            // also transfer the layout of the children
            for (const child of visibleGraph.getChildren(clickedNode)) {
              const copiedChild = graph.nodes.find(n => equalTags(child, n))
              if (copiedChild) {
                graph.setNodeLayout(copiedChild, child.layout.toRect())
              }
            }
          }
        }
      }
    }
  } else {
    // use the master graph since the global root was selected
    copier.copy(masterGraph, graph)
    graphComponent.graph = graph

    // center nodes inside the viewport to get a smooth animation
    for (const node of graph.nodes) {
      graph.setNodeCenter(node, graphComponent.viewport.center)
    }
  }

  // clear highlights to avoid artifact highlights of the previews sub-graph
  graphComponent.highlightIndicatorManager.clearHighlights()

  // create a folding view that collapses the grandchildren of the current root
  const foldingManager = new FoldingManager(graph)
  foldingManager.folderNodeConverter = new DefaultFolderNodeConverter({
    copyFirstLabel: true,
    folderNodeStyle: new ColorNodeStyle(),
    cloneNodeStyle: false,
    labelStyle: masterGraph.nodeDefaults.labels.style,
    labelLayoutParameter: InteriorStretchLabelModel.CENTER
  })
  graph = foldingManager.createFoldingView({
    isExpanded: node => {
      const parent = graph.getParent(node)
      return !parent || !graph.getParent(parent)
    }
  }).graph

  // update the label text, folders should show their sizes like files
  for (const node of graph.nodes) {
    if (!graph.foldingView!.isExpanded(node)) {
      const text = node.labels.first().text
      graph.setLabelText(node.labels.first(), `${text}\n(${getSizeString(node.tag.size)})`)
    }
  }

  // update the label in the toolbar
  let pathString = ''
  if (root) {
    for (const node of masterGraph.groupingSupport.getPathToRoot(root)) {
      if (node) {
        if (pathString) {
          pathString = `${node.tag.label} > ${pathString}`
        } else {
          pathString = node.tag.label
        }
      }
    }
  }
  const path = document.querySelector<HTMLSpanElement>(`#path`)!
  path.innerHTML = pathString || 'yFiles-for-HTML-Complete'

  // register a highlight
  graphComponent.highlightIndicatorManager = new GraphHighlightIndicatorManager({
    nodeStyle: new IndicatorNodeStyleDecorator({
      wrapped: new ShapeNodeStyle({
        fill: null,
        stroke: '3px crimson'
      })
    })
  })

  graphComponent.graph = graph

  // if it is an outward animation, bring the clicked node to the front
  if (clickedNodeCopy && !isDrillDown) {
    const clickedItem = graphComponent.graph.nodes
      .filter(n => n.tag.groupTag === clickedNodeCopy!.tag.groupTag)
      .first()
    const itemCo = graphComponent.graphModelManager.getCanvasObject(clickedItem)
    if (itemCo) {
      itemCo.toFront()
    }
    if (graph.isGroupNode(clickedItem)) {
      for (const child of graph.getChildren(clickedItem)) {
        const childCo = graphComponent.graphModelManager.getCanvasObject(child)
        if (childCo) {
          childCo.toFront()
        }
      }
    }
  }

  // calculate a layout for the new sub-graph
  applyLayout()
}

/**
 * Checks if the id and the groupTag properties of the tags of the given nodes are equal.
 */
function equalTags(n1: INode, n2: INode): boolean {
  const t1 = n1.tag
  const t2 = n2.tag
  return t1 && t2 && ((t1.id && t1.id === t2.id) || (t1.groupTag && t1.groupTag === t2.groupTag))
}

/**
 * Transforms the given size to a string showing the largest unit and the smallest number.
 */
function getSizeString(size: number): string {
  if (size >= 1000000) {
    return `${(size / 1000000).toFixed(2)}mb`
  } else if (size >= 1000) {
    return `${(size / 1000).toFixed(2)}kb`
  }
  return `${size}byte`
}

/**
 * Applies a TreeMapLayout to the current graph. The configuration is derived from the information
 * in the module.
 */
async function applyLayout(): Promise<void> {
  const graph = graphComponent.graph

  // register a mapper providing group node insets to avoid children overlapping group labels
  graph.mapperRegistry.createConstantMapper(
    GroupingKeys.GROUP_NODE_INSETS_DP_KEY,
    new YInsets(23, 1, 1, 1)
  )

  // configure layout algorithm using the settings from the module
  const minimumWidth = Number.parseInt(
    document.querySelector<HTMLInputElement>(`#minimum-node-width`)!.value
  )
  const minimumHeight = Number.parseInt(
    document.querySelector<HTMLInputElement>(`#minimum-node-height`)!.value
  )
  const layout = new TreeMapLayout({
    preferredSize: getPreferredSize(graph),
    aspectRatio: Number.parseFloat(
      document.querySelector<HTMLInputElement>(`#aspect-ratio`)!.value
    ),
    tilingPolicy: getTilingAlgorithm(),
    minimumNodeSize: new YDimension(minimumWidth, minimumHeight),
    spacing: Number.parseInt(document.querySelector<HTMLInputElement>(`#spacing`)!.value),
    nodeComparer: createNodeComparer(graph)
  })

  // determine the current weight range
  const maximumWeight = 500
  const minimumWeight = 10
  let minWeight: number = Number.MAX_VALUE
  let maxWeight = 0
  for (const node of graph.nodes) {
    if (!graph.isGroupNode(node)) {
      const weight = node.tag.size
      minWeight = Math.min(minWeight, weight)
      maxWeight = Math.max(maxWeight, weight)
    }
  }
  const weightRange = maxWeight - minWeight
  const goalWeightRange = maximumWeight - minimumWeight

  const layoutData = new TreeMapLayoutData({
    nodeWeights: node => {
      if (graph.isGroupNode(node)) {
        return 0
      }
      // scale weights them to avoid large differences
      const weight = Math.max(node.tag.size, 0.1)
      if (maxWeight / minWeight > maximumWeight / minimumWeight && weightRange > goalWeightRange) {
        const scaledWeight = (weight - minWeight) / weightRange
        return minimumWeight + scaledWeight * goalWeightRange
      }
      return weight
    }
  })

  // hide labels during layout
  const nodeLabelGroup = graphComponent.graphModelManager.nodeLabelGroup
  nodeLabelGroup.visible = false
  await graphComponent.morphLayout(layout, '0.7s', layoutData)
  // clean up previously added mappers
  graph.mapperRegistry.removeMapper(GroupingKeys.GROUP_NODE_INSETS_DP_KEY)
  graph.mapperRegistry.removeMapper(NAME_KEY)

  // update text sizes and show labels again
  updateLabelTextSizes(graph)
  nodeLabelGroup.visible = true

  // update the hover, it may have changed depending on the new graph
  ;(graphComponent.inputMode as GraphViewerInputMode).itemHoverInputMode.updateHover()

  // update the viewport limiter
  graphComponent.viewportLimiter.bounds = graphComponent.viewport
}

/**
 * Determines the preferred layout size for the current graph.
 */
function getPreferredSize(graph: IGraph): YDimension {
  const zoomingMode = document.querySelector<HTMLSelectElement>(`#select-zooming-mode`)!.value
  const defaultMapSize = 1000
  const preferredSizes = masterGraph.mapperRegistry.getMapper<INode, Size>(PREFERRED_SIZE_KEY)!
  const root = graph.nodes.filter(node => !graph.getParent(node)).at(0)
  const groupTag = root && root.tag ? root.tag.groupTag : null
  const preferredSize = preferredSizes.get(
    masterGraph.nodes.filter(node => node.tag && node.tag.groupTag === groupTag).at(0)!
  )
  if (zoomingMode === 'aspect-ratio' && preferredSize) {
    // if we have a preferred size specified, then the according property on the layout algorithm is configured
    // we do not keep the exact size, but the aspect ratio. the larger side has always size DEFAULT_MAP_SIZE
    if (preferredSize.height > preferredSize.width) {
      const ratio = preferredSize.width / preferredSize.height
      return new YDimension(defaultMapSize * ratio, defaultMapSize)
    }
    const ratio = preferredSize.height / preferredSize.width
    return new YDimension(defaultMapSize, defaultMapSize * ratio)
  }
  return new YDimension(defaultMapSize, defaultMapSize)
}

/**
 * Determines the tiling algorithm.
 */
function getTilingAlgorithm(): TilingPolicy {
  const tilingAlgorithm =
    document.querySelector<HTMLSelectElement>(`#select-tiling-algorithm`)!.value
  return tilingAlgorithm === 'squarified' ? TilingPolicy.SQUARIFIED : TilingPolicy.SLICE_AND_DICE
}

/**
 * Creates a node comparer according to the sorting settings.
 */
function createNodeComparer(graph: IGraph): TreeMapNodeComparer {
  const sortingCriterion =
    document.querySelector<HTMLSelectElement>(`#select-sorting-criterion`)!.value
  const fileDirectoryOrder = document.querySelector<HTMLSelectElement>(
    `#select-file-directory-order`
  )!.value
  const ascending = sortingCriterion.indexOf('ascending') !== -1
  const useNameAsCriterion = sortingCriterion.indexOf('name') === 0
  const considerLeafState = fileDirectoryOrder.indexOf('files') === 0
  const leavesTrailing = fileDirectoryOrder.indexOf('after') !== -1
  if (useNameAsCriterion) {
    graph.mapperRegistry.createDelegateMapper(
      INode.$class,
      YString.$class,
      NAME_KEY,
      node => node.labels.first().text
    )
  }
  return new TreeMapNodeComparer(ascending, useNameAsCriterion, considerLeafState, leavesTrailing)
}

/**
 * Updates the sizes of the label texts according to the sizes of their owner nodes.
 */
function updateLabelTextSizes(graph: IGraph): void {
  // we'll use a hidden div to measure the text sizes
  const textMeasureDiv = document.querySelector<HTMLDivElement>(`#text-measure-container`)!
  for (const node of graph.nodes) {
    // only adjust text sizes for normal nodes and folders
    if (graph.isGroupNode(node)) {
      continue
    }

    const label = node.labels.first()
    const minSizeForLabel = 50
    graph.setStyle(label, graph.nodeDefaults.labels.style.clone())
    const layout = node.layout
    if (layout.height < minSizeForLabel || layout.width < minSizeForLabel) {
      // the node is rather small, do not display the label at all
      graph.setStyle(label, new VoidLabelStyle())
    } else {
      const { height } = layout
      const labelInset = 10
      // perform a kind of binary search to find a good font size for the label text
      let lowSize = 8
      let highSize = height / 2 - labelInset
      while (highSize - lowSize > 1) {
        const midSize = Math.round((highSize + lowSize) / 2)
        textMeasureDiv.innerHTML = label.text
        textMeasureDiv.style.fontSize = `${midSize}px`
        const labelWidth = textMeasureDiv.clientWidth
        const labelHeight = textMeasureDiv.clientHeight
        if (labelWidth < layout.width - labelInset && labelHeight < layout.height - labelInset) {
          lowSize = midSize
        } else {
          highSize = midSize
        }
      }
      const style = label.style as DefaultLabelStyle
      if (lowSize > 8) {
        // update label style with re-sized font
        style.font = new Font({ fontSize: lowSize })
      } else {
        // wrap the text if the font size would be too small to read
        style.wrapping = TextWrapping.WORD
      }
    }
  }
}

/**
 * Wires up the toolbar and module elements.
 */
function initializeUI(): void {
  // update the labels of the sliders that show the current value
  bindLabelToInput('aspect-ratio', 'aspect-ratio-label')
  bindLabelToInput('spacing', 'spacing-label')
  bindLabelToInput('minimum-node-width', 'minimum-node-width-label')
  bindLabelToInput('minimum-node-height', 'minimum-node-height-label')

  // apply a layout with the current settings
  document.querySelector('#apply-layout')!.addEventListener('click', () => applyLayout())
}

/**
 * Registers a listener that updates the innerHTML property of the HTMLLabelElement with the given
 * labelId with the value property of the HTMLInputElement with the given inputId.
 */
function bindLabelToInput(inputId: string, labelId: string): void {
  const input = document.querySelector<HTMLInputElement>(`#${inputId}`)!
  const label = document.querySelector<HTMLLabelElement>(`#${labelId}`)!
  input.addEventListener('input', () => {
    label.innerHTML = input.value
  })
}

/**
 * A flexible comparer which can be used for sorting groups and leaf nodes using different criteria.
 */
class TreeMapNodeComparer extends NodeWeightComparer {
  constructor(
    private readonly ascending: boolean,
    private readonly useNameAsCriterion: boolean,
    private readonly considerLeafState: boolean,
    private readonly leavesTrailing: boolean
  ) {
    super()
  }

  compare(node1: YNode, node2: YNode): number {
    if (this.considerLeafState) {
      // leaves should either come last (trailing) or first (leading)
      const degree1 = node1.outDegree
      const degree2 = node2.outDegree
      if (degree1 === 0 && degree2 > 0) {
        // only first node is a leaf
        return this.leavesTrailing ? 1 : -1
      }
      if (degree1 > 0 && degree2 === 0) {
        // only second node is a leaf
        return this.leavesTrailing ? -1 : 1
      }
    } // else: leaves are handled the same way as non-leaves

    // both are non-leaves or leaves, or leaf state is ignored
    // a) compare by name
    if (this.useNameAsCriterion) {
      const names = node1.graph!.getDataProvider(NAME_KEY)!
      const name1 = names.get(node1)
      const name2 = names.get(node2)
      const result = name1.localeCompare(name2)
      return this.ascending ? result : -result
    }
    // b) compare by weight
    const result = super.compare(node1, node2)
    return this.ascending ? -result : result
  }
}

type RenderDataCache = {
  x: number
  y: number
  width: number
  height: number
  fill: string
}

/**
 * A simple node style which draws a rectangle. The color for the rectangle is provided in the tag.
 */
class ColorNodeStyle extends NodeStyleBase {
  createVisual(_: IRenderContext, node: INode): SvgVisual {
    const { x, y, width, height } = node.layout
    const rect = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect'
    ) as SVGRectElement & { 'render-cache': RenderDataCache }
    rect.setAttribute('width', width.toString())
    rect.setAttribute('height', height.toString())
    rect.setAttribute('fill', node.tag.color)
    rect.setAttribute('stroke', 'none')
    rect['render-cache'] = {
      x,
      y,
      width,
      height,
      fill: node.tag.color
    }
    SvgVisual.setTranslate(rect, x, y)
    return new SvgVisual(rect)
  }

  updateVisual(context: IRenderContext, oldVisual: SvgVisual, node: INode): SvgVisual {
    const rect = oldVisual.svgElement as SVGRectElement & { 'render-cache': RenderDataCache }
    if (!rect) {
      return this.createVisual(context, node)
    }

    const renderCache = rect['render-cache']
    const { x, y, width, height } = node.layout
    if (renderCache.fill !== node.tag.color) {
      rect.setAttribute('fill', node.tag.color)
    }
    if (renderCache.width !== width || renderCache.height !== height) {
      rect.setAttribute('width', width.toString())
      rect.setAttribute('height', height.toString())
    }
    if (renderCache.x !== x || renderCache.y !== y) {
      SvgVisual.setTranslate(rect, x, y)
    }
    rect['render-cache'] = {
      x,
      y,
      width,
      height,
      fill: node.tag.color
    }
    return oldVisual
  }
}

run().then(finishLoading)
