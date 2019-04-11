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
  DefaultGraph,
  DefaultLabelStyle,
  FoldingManager,
  Font,
  GraphBuilder,
  GraphComponent,
  GraphCopier,
  GraphItemTypes,
  GraphViewerInputMode,
  GroupingKeys,
  HierarchicNestingPolicy,
  ICommand,
  IGraph,
  INode,
  InteriorStretchLabelModel,
  License,
  NodeStyleBase,
  NodeStyleDecorationInstaller,
  NodeWeightComparer,
  Point,
  ShapeNodeStyle,
  Size,
  StyleDecorationZoomPolicy,
  SvgVisual,
  TextWrapping,
  TilingPolicy,
  TreeMapLayout,
  TreeMapLayoutData,
  VoidLabelStyle,
  YDimension,
  YInsets,
  YString
} from 'yfiles'

import TreeMapData from './resources/TreeMapData.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/**
 * The graph component containing the current graph.
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * The complete graph containing all nodes and the general hierarchy information.
 * This graph is used as a template for the visible sub-graphs.
 * @type {IGraph}
 */
let masterGraph = null

/**
 * Starts and sets up the demo.
 */
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')
  initializeGraph()
  initializeInputModes()
  registerCommands()
  showApp(graphComponent)
}

/**
 * Initializes the default styles and loads a sample graph from JSON.
 */
function initializeGraph() {
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
  const graphBuilder = new GraphBuilder({
    graph,
    nodesSource: TreeMapData.nodesSource,
    groupsSource: TreeMapData.groupsSource,
    nodeIdBinding: 'id',
    groupBinding: 'groupRef',
    parentGroupBinding: 'parentGroupRef',
    groupIdBinding: 'groupTag',
    nodeLabelBinding: tag => tag.label || null
  })

  graphBuilder.buildGraph()

  graph.nodes.forEach(node => {
    if (graph.isGroupNode(node)) {
      graph.addLabel(node, node.tag.label)
    }
  })

  // store the master graph as a template
  masterGraph = graph
  masterGraph.mapperRegistry.createMapper(INode.$class, YDimension.$class, 'ROOT_TO_PREFERRED_SIZE')

  graphComponent.viewportLimiter.honorBothDimensions = false

  // create a sub-graph that only shows the root and its children and grandchildren
  updateGraph(null)
}

/**
 * Initializes the input modes.
 * Groups and folders can be navigated by clicking on the respective node. Valid/clickable nodes get a highlight
 * when the mouse hovers over them.
 */
function initializeInputModes() {
  const inputMode = new GraphViewerInputMode()
  inputMode.selectableItems = GraphItemTypes.NONE
  inputMode.focusableItems = GraphItemTypes.NONE
  inputMode.addItemClickedListener((sender, event) => {
    const item = event.item
    const itemGraph = graphComponent.graph

    // remember if the click will be going downwards or upwards
    let isDrillDown = true

    // get the node from the master graph to be able to check the hierarchy information
    let root = masterGraph.nodes.find(
      node => item.tag.id === node.tag.id && item.tag.groupTag === node.tag.groupTag
    )
    // group nodes can be entered or they lead to a higher hierarchy level
    if (masterGraph.isGroupNode(root)) {
      if (!itemGraph.getParent(item)) {
        // up to a higher hierarchy level, take the parent of the root node as new root
        root = masterGraph.getParent(root)
        isDrillDown = false
      } else {
        const preferredSizes = masterGraph.mapperRegistry.getMapper('ROOT_TO_PREFERRED_SIZE')
        const preferredSize = preferredSizes.get(root)
        if (!preferredSize) {
          preferredSizes.set(root, new YDimension(item.layout.width, item.layout.height))
        }
      }
      if (root) {
        masterGraph.setNodeLayout(root, item.layout.toRect())

        // update the graph to only contain the new root and its children and grandchildren
        updateGraph(root, item, isDrillDown)
      }
      event.handled = true
    }
  })
  // add tooltips that show the label text
  inputMode.toolTipItems = GraphItemTypes.NODE
  inputMode.mouseHoverInputMode.toolTipLocationOffset = [10, 10]
  inputMode.addQueryItemToolTipListener((sender, event) => {
    if (event.handled) {
      return
    }
    const hitNode = event.item
    if (hitNode.labels.size > 0) {
      event.toolTip = hitNode.labels.get(0).text
      event.handled = true
    }
  })

  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  inputMode.itemHoverInputMode.discardInvalidItems = false
  inputMode.itemHoverInputMode.addHoveredItemChangedListener((sender, event) => {
    const manager = graphComponent.highlightIndicatorManager
    inputMode.defaultCursor = 'DEFAULT'
    manager.clearHighlights()
    const item = event.item

    if (item) {
      // get the node from the master graph to be able to check the hierarchy information
      let root = masterGraph.nodes.find(
        node => item.tag.id === node.tag.id && item.tag.groupTag === node.tag.groupTag
      )

      const itemGraph = graphComponent.graph
      if (masterGraph.isGroupNode(root)) {
        let cursor = 'ZOOM_IN'
        if (!itemGraph.getParent(item)) {
          root = masterGraph.getParent(root)
          cursor = 'ZOOM_OUT'
        }
        if (root) {
          inputMode.defaultCursor = cursor
          manager.addHighlight(item)
        }
      } else {
        const parent = masterGraph.getParent(root)
        if (parent && parent.tag.parentGroupRef !== '') {
          const itemParent = graphComponent.graph.getParent(item)
          inputMode.defaultCursor = !itemGraph.getParent(itemParent) ? 'ZOOM_OUT' : 'ZOOM_IN'
          manager.addHighlight(itemParent)
        }
      }
    }
  })
  graphComponent.inputMode = inputMode
}

/**
 * Updates the current graph when the root node changes.
 * @param {INode} root
 * @param {INode} clickedNode
 * @param {boolean} isDrillDown
 */
function updateGraph(root, clickedNode, isDrillDown) {
  let graph = new DefaultGraph({
    nodeDefaults: masterGraph.nodeDefaults,
    groupNodeDefaults: masterGraph.groupNodeDefaults
  })
  const copier = new GraphCopier()

  let clickedNodeCopy
  if (root) {
    // collect the descendants of the root nodes that should be visible
    const visibleNodes = []
    masterGraph.getChildren(root).forEach(child => {
      visibleNodes.push(child)
      masterGraph.getChildren(child).forEach(grandChild => visibleNodes.push(grandChild))
    })
    visibleNodes.push(root)
    // create a copy of the graph containing only the visible nodes
    copier.copy(
      masterGraph,
      item => visibleNodes.includes(item) || visibleNodes.includes(item.owner),
      graph,
      Point.ORIGIN,
      () => {}
    )

    // center nodes inside the route to get a smooth animation
    graph.nodes.forEach(node => {
      graph.setNodeCenter(node, root.layout.center)

      // Animate the upwards direction by 'fitting' the clicked node into the layout. This is achieved by keeping
      // the original layout for the clicked nodes and children.
      if (!isDrillDown) {
        const isClickedNode =
          (node.tag.id && clickedNode.tag.id && node.tag.id === clickedNode.tag.id) ||
          (node.tag.groupTag &&
            clickedNode.tag.groupTag &&
            node.tag.groupTag === clickedNode.tag.groupTag)

        if (isClickedNode) {
          graph.setNodeLayout(node, clickedNode.layout.toRect())
          clickedNodeCopy = node
          if (graphComponent.graph.isGroupNode(clickedNode)) {
            // also transfer the layout of the children
            graphComponent.graph.getChildren(clickedNode).forEach(child => {
              const copiedChild = graph.nodes.find(
                n => (n.tag.id ? n.tag.id === child.tag.id : n.tag.groupTag === child.tag.groupTag)
              )
              graph.setNodeLayout(copiedChild, child.layout.toRect())
            })
          }
        }
      }
    })
  } else {
    // use the master graph since the global root was selected
    copier.copy(masterGraph, graph)
    graphComponent.graph = graph

    // center nodes inside the viewport to get a smooth animation
    graph.nodes.forEach(node => {
      graph.setNodeCenter(node, graphComponent.viewport.center)
    })
  }

  // clear highlights to avoid artifact highlights of the previews sub-graph
  graphComponent.highlightIndicatorManager.clearHighlights()

  // create a folding view that collapses the grandchildren of the current root
  const foldingManager = new FoldingManager(graph)
  const folderNodeConverter = foldingManager.folderNodeConverter
  folderNodeConverter.copyFirstLabel = true
  folderNodeConverter.folderNodeStyle = new ColorNodeStyle()
  folderNodeConverter.cloneNodeStyle = false
  folderNodeConverter.labelStyle = masterGraph.nodeDefaults.labels.style
  folderNodeConverter.labelLayoutParameter = InteriorStretchLabelModel.CENTER
  graph = foldingManager.createFoldingView({
    isExpanded: node => {
      const parent = graph.getParent(node)
      return !parent || !graph.getParent(parent)
    }
  }).graph

  // update the label text, folders should show their sizes like files
  graph.nodes.forEach(node => {
    if (!graph.foldingView.isExpanded(node)) {
      const text = node.labels.first().text
      graph.setLabelText(node.labels.first(), `${text}\n(${getSizeString(node.tag.size)})`)
    }
  })

  // update the label in the tool bar
  let pathString = null
  masterGraph.groupingSupport.getPathToRoot(root).forEach(node => {
    if (node) {
      if (pathString) {
        pathString = `${node.tag.label} > ${pathString}`
      } else {
        pathString = node.tag.label
      }
    }
  })
  const path = document.getElementById('path')
  path.innerHTML = pathString || 'yFiles-for-HTML-Complete'

  // register a highlight
  const decorator = graph.decorator
  decorator.nodeDecorator.highlightDecorator.setImplementation(
    new NodeStyleDecorationInstaller({
      nodeStyle: new ShapeNodeStyle({
        fill: null,
        stroke: '3px crimson'
      }),
      margins: 0,
      zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
    })
  )

  graphComponent.graph = graph

  // if it is an outwards animation, bring the clicked node to the front
  if (clickedNodeCopy && !isDrillDown) {
    const clickedItem = graphComponent.graph.nodes
      .filter(n => n.tag.groupTag === clickedNodeCopy.tag.groupTag)
      .first()
    graphComponent.graphModelManager.getCanvasObject(clickedItem).toFront()
    if (graph.isGroupNode(clickedItem)) {
      const childs = graph.getChildren(clickedItem)
      childs.forEach(child => {
        graphComponent.graphModelManager.getCanvasObject(child).toFront()
      })
    }
  }

  // calculate a layout for the new sub-graph
  applyLayout()
}

/**
 * Transforms the given size to a string showing the largest unit and the smallest number.
 * @param {number} size
 * @return {string}
 */
function getSizeString(size) {
  if (size >= 1000000) {
    return `${(size / 1000000).toFixed(2)}mb`
  } else if (size >= 1000) {
    return `${(size / 1000).toFixed(2)}kb`
  }
  return `${size}byte`
}

/**
 * Applies a TreeMapLayout to the current graph. The configuration is derived from the information in the module.
 */
function applyLayout() {
  const graph = graphComponent.graph

  // register a mapper providing group node insets to avoid children overlapping group labels
  graph.mapperRegistry.createConstantMapper(
    GroupingKeys.GROUP_NODE_INSETS_DP_KEY,
    new YInsets(23, 1, 1, 1)
  )

  // configure layout algorithm using the settings from the module
  const minimumWidth = Number.parseInt(document.getElementById('minimum-node-width').value)
  const minimumHeight = Number.parseInt(document.getElementById('minimum-node-height').value)
  const layout = new TreeMapLayout({
    preferredSize: getPreferredSize(graph),
    aspectRatio: Number.parseFloat(document.getElementById('aspect-ratio').value),
    tilingPolicy: getTilingAlgorithm(),
    minimumNodeSize: new YDimension(minimumWidth, minimumHeight),
    spacing: Number.parseInt(document.getElementById('spacing').value),
    nodeComparer: getNodeComparer(graph)
  })

  // determine the current weight range
  const maximumWeight = 500
  const minimumWeight = 10
  let minWeight = Number.MAX_VALUE
  let maxWeight = 0
  graph.nodes.forEach(node => {
    if (!graph.isGroupNode(node)) {
      const weight = node.tag.size
      minWeight = Math.min(minWeight, weight)
      maxWeight = Math.max(maxWeight, weight)
    }
  })
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
  graphComponent.morphLayout(layout, '0.7s', layoutData).then(() => {
    // clean up previously added mappers
    graph.mapperRegistry.removeMapper(GroupingKeys.GROUP_NODE_INSETS_DP_KEY)
    graph.mapperRegistry.removeMapper('NODE_TO_NAME')

    // update text sizes and show labels again
    updateLabelTextSizes(graph)
    nodeLabelGroup.visible = true

    // update the hover, it may have changed depending on the new graph
    graphComponent.inputMode.itemHoverInputMode.updateHover()

    // update the viewport limiter
    graphComponent.viewportLimiter.bounds = graphComponent.viewport
  })
}

/**
 * Determines the preferred layout size for the current graph.
 * @param {IGraph} graph
 * @return {YDimension}
 */
function getPreferredSize(graph) {
  const zoomingMode = document.getElementById('select-zooming-mode').value
  const defaultMapSize = 1000
  const preferredSizes = masterGraph.mapperRegistry.getMapper('ROOT_TO_PREFERRED_SIZE')
  const root = graph.nodes.filter(node => !graph.getParent(node)).firstOrDefault()
  const preferredSize = preferredSizes.get(
    masterGraph.nodes.filter(node => node.tag.groupTag === root.tag.groupTag).firstOrDefault()
  )
  if (zoomingMode === 'Aspect Ratio of Root' && preferredSize) {
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
 * @return {TilingPolicy.SQUARIFIED | TilingPolicy.SLICE_AND_DICE}
 */
function getTilingAlgorithm() {
  const tilingAlgorithm = document.getElementById('select-tiling-algorithm').value
  if (tilingAlgorithm === 'Squarified') {
    return TilingPolicy.SQUARIFIED
  }
  return TilingPolicy.SLICE_AND_DICE
}

/**
 * Creates a node comparer according to the sorting settings.
 * @param {IGraph} graph
 * @return {TreeMapNodeComparator}
 */
function getNodeComparer(graph) {
  const sortingCriterion = document.getElementById('select-sorting-criterion').value
  const fileDirectoryOrder = document.getElementById('select-file-directory-order').value
  const ascending = sortingCriterion.indexOf('ascending') !== -1
  const useNameAsCriterion = sortingCriterion.startsWith('Name')
  const considerLeafState = fileDirectoryOrder.startsWith('Files')
  const leafsTrailing = fileDirectoryOrder.indexOf('after') !== -1
  if (useNameAsCriterion) {
    graph.mapperRegistry.createDelegateMapper(
      INode.$class,
      YString.$class,
      'NODE_TO_NAME',
      node => node.labels.first().text
    )
  }
  return new TreeMapNodeComparator(ascending, useNameAsCriterion, considerLeafState, leafsTrailing)
}

/**
 * Updates the sizes of the label texts according to the sizes of their owner nodes.
 * @param {IGraph} graph
 */
function updateLabelTextSizes(graph) {
  // we'll use a hidden div to measure the text sizes
  const textMeasureDiv = document.getElementById('text-measure-container')
  graph.nodes.forEach(node => {
    // only adjust text sizes for normal nodes and folders
    if (graph.isGroupNode(node)) {
      return
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
      if (lowSize > 8) {
        // update label style with re-sized font
        label.style.font = new Font({ fontSize: lowSize })
      } else {
        // wrap the text if the font size would be too small to read
        label.style.wrapping = TextWrapping.WORD
      }
    }
  })
}

/**
 * Wires up the toolbar and module elements.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  // update the labels of the sliders that show the current value
  const aspectRatio = document.getElementById('aspect-ratio')
  const aspectRatioLabel = document.getElementById('aspect-ratio-label')
  aspectRatio.addEventListener('input', () => {
    aspectRatioLabel.innerHTML = aspectRatio.value
  })
  const spacing = document.getElementById('spacing')
  const spacingLabel = document.getElementById('spacing-label')
  spacing.addEventListener('input', () => {
    spacingLabel.innerHTML = spacing.value
  })
  const minimumNodeWidth = document.getElementById('minimum-node-width')
  const minimumNodeWidthLabel = document.getElementById('minimum-node-width-label')
  minimumNodeWidth.addEventListener('input', () => {
    minimumNodeWidthLabel.innerHTML = minimumNodeWidth.value
  })
  const minimumNodeHeight = document.getElementById('minimum-node-height')
  const minimumNodeHeightLabel = document.getElementById('minimum-node-height-label')
  minimumNodeHeight.addEventListener('input', () => {
    minimumNodeHeightLabel.innerHTML = minimumNodeHeight.value
  })

  // apply a layout with the current settings
  bindAction("button[data-command='ApplyLayout']", applyLayout)
}

/**
 * A flexible comparer which can be used for sorting groups and leaf nodes using different criteria.
 */
class TreeMapNodeComparator extends NodeWeightComparer {
  constructor(ascending, useNameAsCriterion, considerLeafState, leafsTrailing) {
    super()
    this.ascending = ascending
    this.useNameAsCriterion = useNameAsCriterion
    this.considerLeafState = considerLeafState
    this.leafsTrailing = leafsTrailing
  }

  compare(node1, node2) {
    if (this.considerLeafState) {
      // leafs should either come last (trailing) or first (leading)
      const degree1 = node1.outDegree
      const degree2 = node2.outDegree
      if (degree1 === 0 && degree2 > 0) {
        // only first node is a leaf
        return this.leafsTrailing ? 1 : -1
      }
      if (degree1 > 0 && degree2 === 0) {
        // only second node is a leaf
        return this.leafsTrailing ? -1 : 1
      }
    } // else: leafs are handled the same way as non-leafs

    // both are non-leafs or leafs, or leaf state is ignored
    // a) compare by name
    if (this.useNameAsCriterion) {
      const names = node1.graph.getDataProvider('NODE_TO_NAME')
      const name1 = names.get(node1)
      const name2 = names.get(node2)
      const result = name1.localeCompare(name2)
      return this.ascending ? result : -result
    }
    // b) compare by weight
    return this.ascending ? -super.compare(node1, node2) : super.compare(node1, node2)
  }
}

/**
 * A simple node style which draws a rectangle. The color for the rectangle is provided in the tag.
 */
class ColorNodeStyle extends NodeStyleBase {
  createVisual(context, node) {
    const { x, y, width, height } = node.layout
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', width)
    rect.setAttribute('height', height)
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

  updateVisual(context, oldVisual, node) {
    const rect = oldVisual.svgElement
    if (!rect) {
      return this.createVisual(context, node)
    }

    const renderCache = rect['render-cache']
    const { x, y, width, height } = node.layout
    if (renderCache.fill !== node.tag.color) {
      rect.setAttribute('fill', node.tag.color)
    }
    if (renderCache.width !== width || renderCache.height !== height) {
      rect.setAttribute('width', width)
      rect.setAttribute('height', height)
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

loadJson().then(run)
