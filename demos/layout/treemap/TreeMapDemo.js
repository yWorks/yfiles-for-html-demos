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
  Cursor,
  FolderNodeConverter,
  FoldingManager,
  Font,
  Graph,
  GraphBuilder,
  GraphComponent,
  GraphCopier,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicalNestingPolicy,
  IGraph,
  IGroupPaddingProvider,
  ILabelStyle,
  INode,
  Insets,
  IRenderContext,
  LabelStyle,
  LayoutExecutor,
  License,
  Mapper,
  NodeStyleBase,
  NodeStyleIndicatorRenderer,
  Point,
  ShapeNodeStyle,
  Size,
  StretchNodeLabelModel,
  SvgVisual,
  TextWrapping,
  TilingStrategy,
  TreeMapLayout,
  TreeMapLayoutData
} from '@yfiles/yfiles'

import TreeMapData from './resources/TreeMapData'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

/**
 * Maps each node to a preferred size.
 */
const preferredSizes = new Mapper()

/**
 * The graph component containing the current graph.
 */
let graphComponent

/**
 * The complete graph containing all nodes and the general hierarchy information.
 * This graph is used as a template for the visible sub-graphs.
 */
let masterGraph

/**
 * Starts and sets up the demo.
 */
async function run() {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')
  initializeInputModes()
  await initializeGraph()
  initializeUI()
}

/**
 * Initializes the default styles and loads a sample graph from JSON.
 */
async function initializeGraph() {
  // configure default styles to instantly apply to the sample graph
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new ColorNodeStyle()
  graph.nodeDefaults.size = new Size(70, 70)
  graph.nodeDefaults.labels.style = new LabelStyle({
    textSize: 9,
    textFill: 'white',
    horizontalTextAlignment: 'center',
    verticalTextAlignment: 'center'
  })
  graph.nodeDefaults.labels.layoutParameter = StretchNodeLabelModel.CENTER
  graph.nodeDefaults.labels.shareStyleInstance = false
  graph.nodeDefaults.shareStyleInstance = false

  graph.groupNodeDefaults.style = new ShapeNodeStyle({
    fill: 'rgba(104, 104, 104, 1)',
    stroke: null
  })
  graph.groupNodeDefaults.labels.style = new LabelStyle({
    backgroundFill: 'rgb(77, 77, 77)',
    textFill: 'white',
    textSize: 14,
    horizontalTextAlignment: 'center',
    verticalTextAlignment: 'center',
    padding: [3, 5, 3, 5],
    wrapping: 'wrap-character-ellipsis'
  })
  graph.groupNodeDefaults.labels.layoutParameter = StretchNodeLabelModel.TOP

  // Disable hierarchical nesting, to easily control the z-order of the nodes during animation. We assume
  // this graph has no edges.
  graphComponent.graphModelManager.hierarchicalNestingPolicy = HierarchicalNestingPolicy.NONE

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

  // create a sub-graph that only shows the root and its children and grandchildren
  await updateGraph()
}

/**
 * Initializes the input modes.
 * Groups and folders can be navigated by clicking on the respective node. Valid/clickable nodes
 * get a highlight when the mouse hovers over them.
 */
function initializeInputModes() {
  const inputMode = new GraphViewerInputMode()
  inputMode.selectableItems = GraphItemTypes.NONE
  inputMode.focusableItems = GraphItemTypes.NONE
  inputMode.addEventListener('item-clicked', (evt) => {
    const item = evt.item
    if (item instanceof INode && onNodeClicked(item)) {
      evt.handled = true
    }
  })
  // add tooltips that show the label text
  inputMode.toolTipItems = GraphItemTypes.NODE
  inputMode.toolTipInputMode.toolTipLocationOffset = new Point(10, 10)
  inputMode.addEventListener('query-item-tool-tip', (evt) => {
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
  inputMode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    const highlights = graphComponent.highlights
    highlights.clear()

    const item = evt.item

    inputMode.defaultCursor = Cursor.DEFAULT
    if (item instanceof INode) {
      // get the node from the master graph to be able to check the hierarchy information
      let root = masterGraph.nodes.find((node) => equalTags(item, node))

      const itemGraph = graphComponent.graph
      if (masterGraph.isGroupNode(root)) {
        let cursor = Cursor.ZOOM_IN
        if (!itemGraph.getParent(item)) {
          root = root ? masterGraph.getParent(root) : null
          cursor = Cursor.ZOOM_OUT
        }
        if (root) {
          inputMode.defaultCursor = cursor
          highlights.add(item)
        }
      } else {
        const parent = root ? masterGraph.getParent(root) : null
        if (parent && parent.tag.parentGroupRef !== '') {
          const itemParent = graphComponent.graph.getParent(item)
          inputMode.defaultCursor = itemGraph.getParent(itemParent)
            ? Cursor.ZOOM_IN
            : Cursor.ZOOM_OUT
          highlights.add(itemParent)
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
function onNodeClicked(clickedNode) {
  // remember if the click will be going downwards or upwards
  let isDrillDown = true

  // get the node from the master graph to be able to check the hierarchy information
  let root = masterGraph.nodes.find((node) => equalTags(clickedNode, node))

  // group nodes can be entered, or they lead to a higher hierarchy level
  if (root && masterGraph.isGroupNode(root)) {
    const visibleGraph = graphComponent.graph
    const clickedNodeLayout = clickedNode.layout
    if (!visibleGraph.getParent(clickedNode)) {
      // up to a higher hierarchy level, take the parent of the root node as new root
      root = masterGraph.getParent(root)
      isDrillDown = false
    } else {
      const preferredSize = preferredSizes.get(root)
      if (!preferredSize) {
        preferredSizes.set(root, new Size(clickedNodeLayout.width, clickedNodeLayout.height))
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
async function updateGraph(root, clickedNode, isDrillDown = false) {
  let graph = new Graph({
    nodeDefaults: masterGraph.nodeDefaults,
    groupNodeDefaults: masterGraph.groupNodeDefaults
  })
  const copier = new GraphCopier()

  let clickedNodeCopy = null
  if (root) {
    // collect the descendants of the root nodes that should be visible
    const visibleNodes = []

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
      graph,
      // there are only nodes and labels in this demo
      new Array()
        .concat(visibleNodes)
        .concat(visibleNodes.flatMap((node) => node.labels.toArray())),
      null,
      Point.ORIGIN
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
              const copiedChild = graph.nodes.find((n) => equalTags(child, n))
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
  graphComponent.highlights.clear()

  // create a folding view that collapses the grandchildren of the current root
  const foldingManager = new FoldingManager(graph)
  foldingManager.folderNodeConverter = new FolderNodeConverter({
    folderNodeDefaults: {
      copyLabels: true,
      style: new ColorNodeStyle(),
      shareStyleInstance: true,
      labels: {
        style: masterGraph.nodeDefaults.labels.style,
        layoutParameter: StretchNodeLabelModel.CENTER
      }
    }
  })
  graph = foldingManager.createFoldingView({
    isExpanded: (node) => {
      const parent = graph.getParent(node)
      return !parent || !graph.getParent(parent)
    }
  }).graph

  // update the label text, folders should show their sizes like files
  for (const node of graph.nodes) {
    if (!graph.foldingView.isExpanded(node) && node.labels.size > 0) {
      const label = node.labels.first()
      const text = label.text
      graph.setLabelText(label, `${text}\n(${getSizeString(node.tag.size)})`)
    }
  }

  // update the label in the toolbar
  let pathString = ''
  if (root) {
    for (const node of masterGraph.groupingSupport.getAncestors(root)) {
      if (node) {
        if (pathString) {
          pathString = `${node.tag.label} > ${pathString}`
        } else {
          pathString = node.tag.label
        }
      }
    }
  }
  const path = document.querySelector(`#path`)
  path.innerHTML = pathString || 'yFiles-for-HTML-Complete'

  // register a highlight
  graph.decorator.nodes.highlightRenderer.addConstant(
    new NodeStyleIndicatorRenderer({
      nodeStyle: new ShapeNodeStyle({ fill: null, stroke: '3px crimson' })
    })
  )

  graphComponent.graph = graph

  // if it is an outward animation, bring the clicked node to the front
  if (clickedNodeCopy && !isDrillDown) {
    const clickedItem = graphComponent.graph.nodes
      .filter((n) => n.tag.groupTag === clickedNodeCopy.tag.groupTag)
      .first()
    if (clickedItem) {
      const itemCo = graphComponent.graphModelManager.getRenderTreeElement(clickedItem)
      if (itemCo) {
        itemCo.toFront()
      }
      if (graph.isGroupNode(clickedItem)) {
        for (const child of graph.getChildren(clickedItem)) {
          const childCo = graphComponent.graphModelManager.getRenderTreeElement(child)
          if (childCo) {
            childCo.toFront()
          }
        }
      }
    }
  }

  // calculate a layout for the new sub-graph
  await applyLayout()
}

/**
 * Checks if the id and the groupTag properties of the tags of the given nodes are equal.
 */
function equalTags(n1, n2) {
  const t1 = n1.tag
  const t2 = n2.tag
  return t1 && t2 && ((t1.id && t1.id === t2.id) || (t1.groupTag && t1.groupTag === t2.groupTag))
}

/**
 * Transforms the given size to a string showing the largest unit and the smallest number.
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
 * Applies a TreeMapLayout to the current graph. The configuration is derived from the information
 * in the module.
 */
async function applyLayout() {
  const graph = graphComponent.graph

  // configure layout algorithm using the settings from the module
  const minimumWidth = Number.parseInt(document.querySelector(`#minimum-node-width`).value)
  const minimumHeight = Number.parseInt(document.querySelector(`#minimum-node-height`).value)
  const layout = new TreeMapLayout({
    preferredSize: getPreferredSize(graph),
    aspectRatio: Number.parseFloat(document.querySelector(`#aspect-ratio`).value),
    tilingStrategy: getTilingAlgorithm(),
    minimumNodeSize: new Size(minimumWidth, minimumHeight),
    spacing: Number.parseInt(document.querySelector(`#spacing`).value)
  })

  // determine the current weight range
  const maximumWeight = 500
  const minimumWeight = 10
  let minWeight = Number.MAX_VALUE
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

  // add some padding to group nodes to avoid children overlapping group labels
  graph.decorator.nodes.groupPaddingProvider.addConstant(
    (node) => graph.isGroupNode(node),
    IGroupPaddingProvider.create(() => new Insets(23, 1, 1, 1))
  )

  const layoutData = new TreeMapLayoutData({
    nodeWeights: (node) => {
      if (graph.isGroupNode(node)) {
        return 1
      }
      // scale weights them to avoid large differences
      const weight = Math.max(node.tag.size, 0.1)
      if (maxWeight / minWeight > maximumWeight / minimumWeight && weightRange > goalWeightRange) {
        const scaledWeight = (weight - minWeight) / weightRange
        return minimumWeight + scaledWeight * goalWeightRange
      }
      return weight
    },
    childNodeComparator: (n1, n2) => compare(n1, n2)
  })

  // hide labels during layout
  const nodeLabelGroup = graphComponent.graphModelManager.nodeLabelGroup
  nodeLabelGroup.visible = false

  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()

  await graphComponent.applyLayoutAnimated(layout, '0.7s', layoutData)

  // update text sizes and show labels again
  updateLabelTextSizes(graph)
  nodeLabelGroup.visible = true
  graphComponent.inputMode.itemHoverInputMode.updateHover()

  // update the viewport limiter
  graphComponent.viewportLimiter.bounds = graphComponent.viewport
}

/**
 * Determines the preferred layout size for the current graph.
 */
function getPreferredSize(graph) {
  const zoomingMode = document.querySelector(`#select-zooming-mode`).value
  const defaultMapSize = 1000
  const root = graph.nodes.filter((node) => !graph.getParent(node)).at(0)
  const groupTag = root && root.tag ? root.tag.groupTag : null
  const preferredSize = preferredSizes.get(
    masterGraph.nodes.filter((node) => node.tag && node.tag.groupTag === groupTag).at(0)
  )
  if (zoomingMode === 'aspect-ratio' && preferredSize) {
    // if we have a preferred size specified, then the according property on the layout algorithm is configured
    // we do not keep the exact size, but the aspect ratio. the larger side has always size DEFAULT_MAP_SIZE
    if (preferredSize.height > preferredSize.width) {
      const ratio = preferredSize.width / preferredSize.height
      return new Size(defaultMapSize * ratio, defaultMapSize)
    }
    const ratio = preferredSize.height / preferredSize.width
    return new Size(defaultMapSize, defaultMapSize * ratio)
  }
  return new Size(defaultMapSize, defaultMapSize)
}

/**
 * Determines the tiling algorithm.
 */
function getTilingAlgorithm() {
  const tilingAlgorithm = document.querySelector(`#select-tiling-algorithm`).value
  return tilingAlgorithm === 'squarified'
    ? TilingStrategy.SQUARIFIED
    : TilingStrategy.SLICE_AND_DICE
}

/**
 * Updates the sizes of the label texts according to the sizes of their owner nodes.
 */
function updateLabelTextSizes(graph) {
  // we'll use a hidden div to measure the text sizes
  const textMeasureDiv = document.querySelector(`#text-measure-container`)
  for (const node of graph.nodes) {
    // only adjust text sizes for normal nodes and folders
    if (graph.isGroupNode(node) || node.labels.size === 0) {
      continue
    }

    const label = node.labels.first()
    const minSizeForLabel = 50
    graph.setStyle(label, graph.nodeDefaults.labels.style.clone())
    const layout = node.layout
    if (layout.height < minSizeForLabel || layout.width < minSizeForLabel) {
      // the node is rather small, do not display the label at all
      graph.setStyle(label, ILabelStyle.VOID_LABEL_STYLE)
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
      const style = label.style
      if (lowSize > 8) {
        // update label style with re-sized font
        style.font = new Font({ fontSize: lowSize })
      } else {
        // wrap the text if the font size would be too small to read
        style.wrapping = TextWrapping.WRAP_WORD
      }
    }
  }
}

/**
 * Wires up the toolbar and module elements.
 */
function initializeUI() {
  // update the labels of the sliders that show the current value
  bindLabelToInput('aspect-ratio', 'aspect-ratio-label')
  bindLabelToInput('spacing', 'spacing-label')
  bindLabelToInput('minimum-node-width', 'minimum-node-width-label')
  bindLabelToInput('minimum-node-height', 'minimum-node-height-label')

  // apply a layout with the current settings
  document.querySelector('#apply-layout').addEventListener('click', () => applyLayout())
}

/**
 * Registers a listener that updates the innerHTML property of the HTMLLabelElement with the given
 * labelId with the value property of the HTMLInputElement with the given inputId.
 */
function bindLabelToInput(inputId, labelId) {
  const input = document.querySelector(`#${inputId}`)
  const label = document.querySelector(`#${labelId}`)
  input.addEventListener('input', () => {
    label.innerHTML = input.value
  })
}

/**
 * A flexible compare function  which can be used for sorting groups and leaf nodes using different criteria.
 */
function compare(node1, node2) {
  if (!node1 || !node2) {
    return 0
  }

  const sortingCriterion = document.querySelector(`#select-sorting-criterion`).value
  const fileDirectoryOrder = document.querySelector(`#select-file-directory-order`).value
  const ascending = sortingCriterion.indexOf('ascending') !== -1
  const useNameAsCriterion = sortingCriterion.indexOf('name') === 0
  const considerLeafState = fileDirectoryOrder.indexOf('files') === 0
  const leavesTrailing = fileDirectoryOrder.indexOf('after') !== -1

  if (considerLeafState) {
    // leaves should either come last (trailing) or first (leading)
    const degree1 = graphComponent.graph.outDegree(node1)
    const degree2 = graphComponent.graph.outDegree(node2)
    if (degree1 === 0 && degree2 > 0) {
      // only first node is a leaf
      return leavesTrailing ? 1 : -1
    }
    if (degree1 > 0 && degree2 === 0) {
      // only second node is a leaf
      return leavesTrailing ? -1 : 1
    }
  } // else: leaves are handled the same way as non-leaves

  // both are non-leaves or leaves, or leaf state is ignored
  // a) compare by name
  if (useNameAsCriterion && node1.labels.size > 0 && node2.labels.size > 0) {
    const name1 = node1.labels.first().text
    const name2 = node2.labels.first().text
    const result = name1.localeCompare(name2)
    return ascending ? result : -result
  }
  // b) compare by weight
  const result = node1.tag.size - node2.tag.size > 0 ? 1 : -1
  return ascending ? result : -result
}

/**
 * A simple node style which draws a rectangle. The color for the rectangle is provided in the tag.
 */
class ColorNodeStyle extends NodeStyleBase {
  createVisual(_, node) {
    const { x, y, width, height } = node.layout
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', width.toString())
    rect.setAttribute('height', height.toString())
    rect.setAttribute('fill', node.tag.color)
    rect.setAttribute('stroke', 'none')

    SvgVisual.setTranslate(rect, x, y)

    return SvgVisual.from(rect, { x, y, width, height, fill: node.tag.color })
  }

  updateVisual(context, oldVisual, node) {
    const rect = oldVisual.svgElement
    if (!rect) {
      return this.createVisual(context, node)
    }

    const renderCache = oldVisual.tag
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
    oldVisual.tag = { x, y, width, height, fill: node.tag.color }
    return oldVisual
  }
}

run().then(finishLoading)
