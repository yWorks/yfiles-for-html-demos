/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
  Arrow,
  ArrowType,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicLayout,
  HierarchicLayoutData,
  IComparer,
  INode,
  LayoutExecutor,
  LayoutMode,
  List,
  MinimumNodeSizeStage,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  Point,
  PolylineEdgeStyle,
  Rect
} from 'yfiles'

import { DemoGroupStyle, DemoNodeStyle } from '../../resources/demo-styles.js'

const pathNodeStyle = new DemoNodeStyle()
pathNodeStyle.cssClass = 'path-node'
const sideNodeStyle = new DemoNodeStyle()
sideNodeStyle.cssClass = 'side-node'
const clickableNodeStyle = new DemoNodeStyle()
clickableNodeStyle.cssClass = 'clickable-node'
const endNodeStyle = new DemoNodeStyle()
endNodeStyle.cssClass = 'end-node'
const groupNodeStyle = new DemoGroupStyle()
const edgeStyle = new PolylineEdgeStyle({
  smoothingLength: 30,
  targetArrow: new Arrow({
    type: ArrowType.TRIANGLE,
    stroke: 'rgb(51, 102, 153)',
    fill: 'rgb(51, 102, 153)',
    cropLength: 1
  }),
  stroke: '2px rgb(51, 102, 153)'
})

const targetZoom = 2

/**
 * A component that displays a graph as an interactive decision tree.
 */
export default class DecisionTree {
  /**
   * Creates a new instance of the decision tree component using the given graph, root node and container element
   * @param graph The decision graph
   * @param rootNode The root node that the decision tree starts with
   * @param containerElement The element to display the decision tree in
   */
  constructor(graph, rootNode, containerElement, onLayout) {
    this.originalGraph = graph
    this.onLayout = onLayout
    // initialize the GraphComponent
    const graphComponent = new GraphComponent(containerElement)
    this.graph = graphComponent.graph
    this.$graphComponent = graphComponent

    // a mapping from the original nodes to the copied nodes
    this.nodeMap = new Map()

    this.nodeToLayerMap = new Map()
    this.layerToNodesMap = new Map()
    this.currentLayer = 0

    // the node that are currently clickable
    this.activeNodes = new Set()
    // the previously clicked nodes
    this.pathNodes = new Set()

    // load the input module and initialize the input mode
    this.initializeInputModes()

    this.initializeDecisionGraph(rootNode)
  }

  /**
   * Copies the root node and its direct descendants
   * @param root the root node
   */
  initializeDecisionGraph(root) {
    let rootNode = root
    // if root node is not explicitly specified, use the first node
    // that has the least incoming edges and is not a group node
    if (rootNode === null) {
      const nodes = this.originalGraph.nodes.toArray()
      nodes.sort((node1, node2) => {
        const inDegree1 = this.originalGraph.inDegree(node1)
        const inDegree2 = this.originalGraph.inDegree(node2)
        if (inDegree1 === inDegree2) {
          return 0
        }
        return inDegree1 < inDegree2 ? -1 : 1
      })
      rootNode = nodes.find(node => !this.originalGraph.isGroupNode(node))
    }
    if (rootNode === null || !this.originalGraph.contains(rootNode)) {
      /* eslint-disable no-throw-literal */
      throw 'Root node not found.'
    }
    // copy root node
    const copiedRootNode = this.copyNode(rootNode)
    this.activeNodes.add(copiedRootNode)

    this.$graphComponent.zoomTo(copiedRootNode.layout.center, targetZoom)

    // load the descendants
    this.onNodeClicked(copiedRootNode, false)
  }

  /**
   * Creates a viewer mode and registers it as the
   * {@link CanvasComponent#inputMode}.
   */
  initializeInputModes() {
    // Create a viewer input mode and register callbacks for item clicks
    const graphViewerInputMode = new GraphViewerInputMode({
      selectableItems: GraphItemTypes.NONE,
      clickableItems: GraphItemTypes.NODE
    })
    graphViewerInputMode.addItemClickedListener((sender, args) => {
      const node = args.item
      if (INode.isInstance(node)) {
        // toggle the collapsed state of the clicked node
        this.onNodeClicked(node, true)
      }
    })
    this.$graphComponent.inputMode = graphViewerInputMode

    // disable selection
    this.$graphComponent.selectionIndicatorManager.enabled = false
    this.$graphComponent.focusIndicatorManager.enabled = false
    this.$graphComponent.highlightIndicatorManager.enabled = false
  }

  /**
   * Loads the neighbors of a node that are connected via outgoing edges,
   * if an active node has been clicked
   * @param copiedNode The node that has been clicked
   * @param animateScroll Whether to animate scrolling to the new nodes
   */
  async onNodeClicked(copiedNode, animateScroll) {
    let newNodes
    if (
      this.originalGraph.outDegree(this.nodeMap.get(copiedNode)) === 0 ||
      this.graph.isGroupNode(copiedNode)
    ) {
      // node is an end node or group
      return
    }
    if (this.activeNodes.has(copiedNode)) {
      // a node on the current layer has been clicked
      newNodes = this.expandActiveNode(copiedNode)
    } else if (!this.graph.isGroupNode(copiedNode)) {
      // a node in a higher layer has been clicked
      newNodes = this.onHigherNodeClicked(copiedNode)
    }
    this.updateNodeStyles()
    this.onLayout(true)
    await this.runLayout(newNodes, animateScroll)
    let nodeArea = null
    newNodes.forEach(node => {
      if (nodeArea === null) {
        nodeArea = node.layout.toRect()
      } else {
        nodeArea = Rect.add(nodeArea, node.layout.toRect())
      }
      nodeArea = nodeArea.getEnlarged(10)
    })
    if (nodeArea) {
      let zoom = targetZoom
      if (nodeArea.width * targetZoom > this.$graphComponent.size.width) {
        zoom = this.$graphComponent.size.width / nodeArea.width
      }
      if (animateScroll) {
        await this.$graphComponent.zoomToAnimated(Point.from(nodeArea.center), zoom)
      } else {
        this.$graphComponent.zoomTo(nodeArea.center, zoom)
      }
    }
    this.onLayout(false)
  }

  /**
   * Called when a node in the current layer has been clicked.
   * @param copiedNode The node that has been clicked
   * @returns {List} The new nodes that were added
   */
  expandActiveNode(copiedNode) {
    this.currentLayer++
    // get the corresponding node in the original graph
    const originalNode = this.nodeMap.get(copiedNode)
    this.pathNodes.add(copiedNode)
    this.activeNodes.clear()
    const newNodes = new List()
    const copiedParentNodes = new Map()
    // copy outgoing neighbors from original graph
    this.originalGraph.outEdgesAt(originalNode).forEach(edge => {
      const originalTargetNode = edge.targetNode
      if (!this.originalGraph.isGroupNode(originalTargetNode)) {
        // target is not a group
        // copy node
        const copiedTargetNode = this.copyNode(originalTargetNode)

        if (this.originalGraph.outDegree(this.nodeMap.get(copiedTargetNode)) > 0) {
          // if the new node has outgoing edges, it's an active node now
          this.activeNodes.add(copiedTargetNode)
        }
        this.copyEdge(edge, copiedNode, copiedTargetNode)
        newNodes.add(copiedTargetNode)

        // if new node is in a group, copy parent node
        const parentNode = this.originalGraph.getParent(originalTargetNode)
        if (parentNode !== null) {
          // check if parent node has already been copied
          if (!copiedParentNodes.has(parentNode)) {
            // copy parent node
            const copiedParentNode = this.copyGroupNode(parentNode, null)
            newNodes.add(copiedParentNode)
            copiedParentNodes.set(parentNode, copiedParentNode)
          }
          // set copied node as a child node of the copied parent
          this.graph.setParent(copiedTargetNode, copiedParentNodes.get(parentNode))
        }
      } else {
        // node is a group - copy the group and all its children
        const copiedGroupNode = this.copyGroupNode(originalTargetNode)

        // copy children
        this.originalGraph.getChildren(originalTargetNode).forEach(n => {
          const copiedChildNode = this.copyNode(n, copiedGroupNode)
          newNodes.add(copiedChildNode)
        })

        this.copyEdge(edge, copiedNode, copiedGroupNode)

        this.graph.getChildren(copiedGroupNode).forEach(childNode => {
          if (this.originalGraph.outDegree(this.nodeMap.get(childNode)) > 0) {
            // child nodes that have outgoing edges are clickable nodes
            this.activeNodes.add(childNode)
          }
        })

        newNodes.add(copiedGroupNode)
      }
    })
    return newNodes
  }

  /**
   * Called when a node in a layer above the current layer has been clicked.
   * All nodes in lower layers are removed and the clicked node is expanded.
   * @param copiedNode The node that has been clicked
   * @returns {List} The new nodes that were added
   */
  onHigherNodeClicked(copiedNode) {
    // get the layer the clicked node is in
    const layer = this.nodeToLayerMap.get(copiedNode)
    // get all nodes in this layer
    let layerNodes = this.layerToNodesMap.get(layer)
    // remove all nodes in this layer from the path
    layerNodes.forEach(n => {
      this.pathNodes.delete(n)
    })
    // remove all nodes in lower layers
    for (let l = layer + 1; l <= this.currentLayer; l++) {
      layerNodes = this.layerToNodesMap.get(l)
      layerNodes.forEach(n => {
        this.graph.remove(n)
        this.pathNodes.delete(n)
        this.activeNodes.delete(n)
        this.nodeToLayerMap.delete(n)
      })
      this.layerToNodesMap.delete(l)
    }
    // set the layer of the clicked layer as current layer
    this.currentLayer = layer
    // expand the clicked node
    return this.expandActiveNode(copiedNode)
  }

  /**
   * Updates the styles of all nodes.
   */
  updateNodeStyles() {
    this.graph.nodes.forEach(node => {
      const originalNode = this.nodeMap.get(node)
      if (this.graph.isGroupNode(node)) {
        this.graph.setStyle(node, groupNodeStyle)
      } else if (this.originalGraph.outDegree(originalNode) === 0) {
        this.graph.setStyle(node, endNodeStyle)
      } else if (this.activeNodes.has(node)) {
        this.graph.setStyle(node, clickableNodeStyle)
      } else if (this.pathNodes.has(node)) {
        this.graph.setStyle(node, pathNodeStyle)
      } else {
        this.graph.setStyle(node, sideNodeStyle)
      }
    })
  }

  /**
   * Copies a non-group node from the original graph to the decision graph and assigns the parent, if specified.
   * @param originalNode The node to copy
   * @param copiedParent The parent in the decision graph, or null
   * @returns {INode} The copied node
   */
  copyNode(originalNode, copiedParent) {
    const copiedNode = this.graph.createNode(
      copiedParent || null,
      originalNode.layout.toRect(),
      originalNode.style,
      originalNode.tag
    )
    originalNode.labels.forEach(label => {
      this.graph.addLabel(
        copiedNode,
        label.text,
        label.layoutParameter,
        label.style,
        label.preferredSize,
        label.tag
      )
    })

    this.nodeMap.set(copiedNode, originalNode)
    this.setNodeLayer(copiedNode)
    return copiedNode
  }

  /**
   * Copies a group node from the original graph to the decision graph and assigns the parent, if specified.
   * @param originalNode The group node to copy
   * @param copiedParent The parent in the decision graph, or null
   * @returns {INode} The copied group node
   */
  copyGroupNode(originalNode, copiedParent) {
    const copiedGroupNode = this.graph.createGroupNode(
      copiedParent || null,
      originalNode.layout.toRect(),
      originalNode.style,
      originalNode.tag
    )
    originalNode.labels.forEach(label => {
      this.graph.addLabel(
        copiedGroupNode,
        label.text,
        label.layoutParameter,
        label.style,
        label.preferredSize,
        label.tag
      )
    })

    this.nodeMap.set(copiedGroupNode, originalNode)
    this.setNodeLayer(copiedGroupNode)
    return copiedGroupNode
  }

  /**
   * Copies an edge from the original graph to the decision graph.
   * @param originalEdge The edge to copy
   * @param copiedSourceNode The source node in the decision graph
   * @param copiedTargetNode The target node in the decision graph
   * @returns {IEdge} The copied edge
   */
  copyEdge(originalEdge, copiedSourceNode, copiedTargetNode) {
    const originalSourcePort = originalEdge.sourcePort
    const originalTargetPort = originalEdge.targetPort
    const copiedSourcePort = this.graph.addPort(
      copiedSourceNode,
      originalSourcePort.locationParameter,
      originalSourcePort.style,
      originalSourcePort.tag
    )
    const copiedTargetPort = this.graph.addPort(
      copiedTargetNode,
      originalTargetPort.locationParameter,
      originalTargetPort.style,
      originalTargetPort.tag
    )
    const copiedEdge = this.graph.createEdge(
      copiedSourcePort,
      copiedTargetPort,
      edgeStyle,
      originalEdge.tag
    )
    originalEdge.labels.forEach(label => {
      this.graph.addLabel(
        copiedEdge,
        label.text,
        label.layoutParameter,
        label.style,
        label.preferredSize,
        label.tag
      )
    })
    return copiedEdge
  }

  /**
   * Associates the given node with the current layer.
   * @param copiedNode A node from the decision graph
   */
  setNodeLayer(copiedNode) {
    this.nodeToLayerMap.set(copiedNode, this.currentLayer)
    if (!this.layerToNodesMap.has(this.currentLayer)) {
      this.layerToNodesMap.set(this.currentLayer, new Set())
    }
    this.layerToNodesMap.get(this.currentLayer).add(copiedNode)
  }

  /**
   * Runs an incremental layout on the decision graph.
   * @param incrementalNodes The newly added nodes
   * @param animated Whether to use a layout animation
   * @return {Promise}
   */
  async runLayout(incrementalNodes, animated) {
    if (!this.runningLayout) {
      const layout = new HierarchicLayout()
      layout.edgeLayoutDescriptor.minimumSlope = 0
      layout.layoutMode = LayoutMode.INCREMENTAL
      layout.nodePlacer.barycenterMode = false

      const layoutData = new HierarchicLayoutData()
      if (incrementalNodes) {
        // move the incremental nodes between their neighbors before expanding for a smooth animation
        this.prepareSmoothExpandLayoutAnimation(incrementalNodes)

        // define sequence constraints for the incremental nodes to keep the x-order of the original graph
        incrementalNodes.sort(
          new IComparer((node1, node2) => {
            const originalNode1 = this.nodeMap.get(node1)
            const originalNode2 = this.nodeMap.get(node2)
            return originalNode1.layout.x < originalNode2.layout.x ? 1 : -1
          })
        )
        for (let i = 0; i < incrementalNodes.size - 1; i++) {
          layoutData.sequenceConstraints.placeBefore(
            incrementalNodes.get(i),
            incrementalNodes.get(i + 1)
          )
        }
        // configure the incremental hints
        layoutData.incrementalHints.incrementalLayeringNodes = incrementalNodes
      }
      // configure critical edges so the path edges are aligned
      layoutData.criticalEdgePriorities = edge =>
        this.pathNodes.has(edge.sourceNode) && this.pathNodes.has(edge.targetNode) ? 1 : 0

      this.runningLayout = true
      const layoutExecutor = new LayoutExecutor({
        graphComponent: this.$graphComponent,
        layout: new MinimumNodeSizeStage(layout),
        layoutData,
        duration: animated ? '0.2s' : 0
      })
      try {
        await layoutExecutor.start()
      } catch (error) {
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        } else {
          throw error
        }
      } finally {
        this.runningLayout = false
      }
    }
  }

  /**
   * Moves incremental nodes between their neighbors before expanding for a smooth animation.
   * @param {List} incrementalNodes
   */
  prepareSmoothExpandLayoutAnimation(incrementalNodes) {
    const graph = this.$graphComponent.graph

    // mark the new nodes and place them between their neighbors
    const layoutData = new PlaceNodesAtBarycenterStageData({
      affectedNodes: node => incrementalNodes.indexOf(node) >= 0
    })
    const layout = new PlaceNodesAtBarycenterStage()
    graph.applyLayout(layout, layoutData)
  }

  /**
   * Disposes the decision tree and removes it from its container element.
   */
  dispose() {
    const div = this.$graphComponent.div
    this.$graphComponent.cleanUp()
    div.innerHTML = ''
    this.$graphComponent = null
  }

  /**
   * Returns the GraphComponent used by the decision tree.
   * @returns {GraphComponent}
   */
  get graphComponent() {
    return this.$graphComponent
  }
}
