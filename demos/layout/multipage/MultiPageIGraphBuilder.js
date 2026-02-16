/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgeDefaults,
  FreeLabelModel,
  Graph,
  ILabelModelParameterFinder,
  LabelStyle,
  LayoutGraphAdapter,
  Mapper,
  MultiPageEdgeType,
  MultiPageLayout,
  MultiPageNodeType,
  NodeDefaults,
  Point,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle
} from '@yfiles/yfiles'

export class MultiPageIGraphBuilder {
  // initialize mappers
  layoutToViewNode = new Mapper()
  modelToViewPort = new Mapper()
  viewToLayoutNode = new Mapper()
  normalEdgeDefaults
  connectorEdgeDefaults
  proxyEdgeDefaults
  proxyReferenceEdgeDefaults
  normalNodeDefaults
  groupNodeDefaults
  connectorNodeDefaults
  proxyNodeDefaults
  proxyReferenceNodeDefaults
  result

  /**
   * Creates a new instance for the given model graph and the given {@link MultiPageLayout}.
   * @param result The holder for the pages created by the
   *   {@link MultiPageLayout}.
   */
  constructor(result) {
    // initialize the graph item defaults with the null styles
    const normalEdgeDefaults = new EdgeDefaults()
    normalEdgeDefaults.style = NULL_EDGE_STYLE
    normalEdgeDefaults.labels.style = NULL_LABEL_STYLE
    normalEdgeDefaults.labels.layoutParameter = NULL_LABEL_MODEL_PARAMETER
    this.normalEdgeDefaults = normalEdgeDefaults

    const connectorEdgeDefaults = new EdgeDefaults()
    connectorEdgeDefaults.style = NULL_EDGE_STYLE
    connectorEdgeDefaults.labels.style = NULL_LABEL_STYLE
    connectorEdgeDefaults.labels.layoutParameter = NULL_LABEL_MODEL_PARAMETER
    this.connectorEdgeDefaults = connectorEdgeDefaults

    const proxyEdgeDefaults = new EdgeDefaults()
    proxyEdgeDefaults.style = NULL_EDGE_STYLE
    proxyEdgeDefaults.labels.style = NULL_LABEL_STYLE
    proxyEdgeDefaults.labels.layoutParameter = NULL_LABEL_MODEL_PARAMETER
    this.proxyEdgeDefaults = proxyEdgeDefaults

    const proxyReferenceEdgeDefaults = new EdgeDefaults()
    proxyReferenceEdgeDefaults.style = NULL_EDGE_STYLE
    proxyReferenceEdgeDefaults.labels.style = NULL_LABEL_STYLE
    proxyReferenceEdgeDefaults.labels.layoutParameter = NULL_LABEL_MODEL_PARAMETER
    this.proxyReferenceEdgeDefaults = proxyReferenceEdgeDefaults

    const normalNodeDefaults = new NodeDefaults()
    normalNodeDefaults.style = NULL_NODE_STYLE
    normalNodeDefaults.labels.style = NULL_LABEL_STYLE
    normalNodeDefaults.labels.layoutParameter = NULL_LABEL_MODEL_PARAMETER
    this.normalNodeDefaults = normalNodeDefaults

    const groupNodeDefaults = new NodeDefaults()
    groupNodeDefaults.style = NULL_NODE_STYLE
    groupNodeDefaults.labels.style = NULL_LABEL_STYLE
    groupNodeDefaults.labels.layoutParameter = NULL_LABEL_MODEL_PARAMETER
    this.groupNodeDefaults = groupNodeDefaults

    const connectorNodeDefaults = new NodeDefaults()
    connectorNodeDefaults.style = NULL_NODE_STYLE
    connectorNodeDefaults.labels.style = NULL_LABEL_STYLE
    connectorNodeDefaults.labels.layoutParameter = NULL_LABEL_MODEL_PARAMETER
    this.connectorNodeDefaults = connectorNodeDefaults

    const proxyNodeDefaults = new NodeDefaults()
    proxyNodeDefaults.style = NULL_NODE_STYLE
    proxyNodeDefaults.labels.style = NULL_LABEL_STYLE
    proxyNodeDefaults.labels.layoutParameter = NULL_LABEL_MODEL_PARAMETER
    this.proxyNodeDefaults = proxyNodeDefaults

    const proxyReferenceNodeDefaults = new NodeDefaults()
    proxyReferenceNodeDefaults.style = NULL_NODE_STYLE
    proxyReferenceNodeDefaults.labels.style = NULL_LABEL_STYLE
    proxyReferenceNodeDefaults.labels.layoutParameter = NULL_LABEL_MODEL_PARAMETER
    this.proxyReferenceNodeDefaults = proxyReferenceNodeDefaults

    this.result = result
  }

  /**
   * Creates a list of page graphs.
   * For each page of the multi-page layout, a graph is created that contains
   * the page's nodes.
   * Multi-page metadata is stored in each node's tag and can be used to retrieve
   * the referenced node and the page number.
   * @returns The array of created graphs.
   */
  createViewGraphs() {
    this.viewToLayoutNode.clear()
    const viewGraphs = new Array(this.result.pageGraphs.size)

    for (let i = 0; i < viewGraphs.length; i++) {
      viewGraphs[i] = this.createPageView(i)
    }

    for (let i = 0; i < viewGraphs.length; i++) {
      const graph = viewGraphs[i]
      graph.nodes.forEach((node) => {
        const tag = node.tag
        if (tag.isReferenceNode) {
          const referencingNode = this.result.context.getReferencingNode(this.getLayoutNode(node))
          tag.referencedNode = this.getViewNode(referencingNode)
        }
      })
    }

    return viewGraphs
  }

  /**
   * Copies a single page into the given view graph.
   * @param pageNo The page number.
   * @returns The view graph where the page was created in.
   */
  createPageView(pageNo) {
    const pageLayoutGraph = this.result.pageGraphs.get(pageNo)
    const pageView = new Graph()
    this.copyPage(pageLayoutGraph, pageView, pageNo)
    return pageView
  }

  /**
   * Copies the contents of the given {@link LayoutGraph} into the given view graph.
   * @param pageLayoutGraph The layout graph to use as source.
   * @param pageView The view graph to use as target.
   * @param pageNo The page number of the page to copy.
   */
  copyPage(pageLayoutGraph, pageView, pageNo) {
    // copy all nodes
    pageLayoutGraph.nodes.forEach((layoutNode) => {
      const copiedNode = this.copyNode(layoutNode, pageView)
      // add a mapping from layout node to view node
      this.layoutToViewNode.set(layoutNode, copiedNode)
      // store the page number
      copiedNode.tag.pageNumber = pageNo
    })

    // copy all edges
    pageLayoutGraph.edges.forEach((layoutEdge) => {
      this.copyEdge(pageLayoutGraph, layoutEdge, pageView)
    })
  }

  /**
   * Copy all labels of the given edge.
   */
  copyEdgeLabels(pageView, layoutEdge, copiedEdge, modelEdge, labelDefaults) {
    const edgeLabels = layoutEdge.labels.toArray()
    for (let i = 0; i < edgeLabels.length; i++) {
      // get the label layout from the layout graph
      const edgeLabelLayout = edgeLabels[i]
      // get the original label from the model graph
      const edgeModelLabel = modelEdge.labels.get(i)
      this.copyEdgeLabel(pageView, edgeLabelLayout, edgeModelLabel, copiedEdge, labelDefaults)
    }
  }

  /**
   * Copy all labels of the given node.
   */
  copyNodeLabels(pageView, layoutNode, copiedNode, modelNode) {
    const nodeLabels = layoutNode.labels.toArray()
    // for each label
    for (let i = 0; i < nodeLabels.length; i++) {
      // get the layout from the layout graph
      const nodeLabelLayout = nodeLabels[i]
      // get the original label from the model graph
      const nodeModelLabel = modelNode.labels.get(i)
      this.copyNodeLabel(pageView, nodeLabelLayout, nodeModelLabel, layoutNode, copiedNode)
    }
  }

  /**
   * Copy one edge label.
   * @param pageView The view (i.e. target) graph.
   * @param edgeLabelLayout The layout of the label.
   * @param modelLabel The original label.
   * @param viewEdge The copied edge (from the view graph).
   * @param labelDefaults The defaults to use for label creation.
   * @returns The copied label.
   */
  copyEdgeLabel(pageView, edgeLabelLayout, modelLabel, viewEdge, labelDefaults) {
    // get the style from edgeLabelStyle property. If none is set get it from the original (model) label.
    const style =
      labelDefaults.style !== NULL_LABEL_STYLE
        ? labelDefaults.getStyleInstance(viewEdge)
        : modelLabel.style.clone()

    // create a new label in the view graph using the style,
    // the text from the original label and the layout from the layout graph
    const viewLabel = pageView.addLabel({
      owner: viewEdge,
      text: modelLabel.text,
      style,
      tag: modelLabel.tag
    })

    // the layout graph yields an oriented rectangle for the label, now we need to find the according parameter
    // for the view model
    const finder = modelLabel.layoutParameter.model
      .getContext(viewLabel)
      .lookup(ILabelModelParameterFinder)
    let parameter
    if (!finder || labelDefaults.layoutParameter != NULL_LABEL_MODEL_PARAMETER) {
      parameter = labelDefaults.getLayoutParameterInstance(viewEdge)
    } else {
      parameter = finder.findBestParameter(edgeLabelLayout.layout)
    }
    pageView.setLabelLayoutParameter(viewLabel, parameter)
    return viewLabel
  }

  /**
   * Copy one node label.
   * @param pageView The view (i.e. target) graph.
   * @param nodeLabelLayout The layout of the label.
   * @param modelLabel The model (i.e. original) label.
   * @param layoutNode The node in the layout graph.
   * @param viewNode The node in the view graph.
   * @returns The copied label.
   */
  copyNodeLabel(pageView, nodeLabelLayout, modelLabel, layoutNode, viewNode) {
    let labelDefaults
    // determine the style for the label
    switch (this.result.context.getNodeType(layoutNode)) {
      case MultiPageNodeType.GROUP:
        labelDefaults = this.groupNodeDefaults.labels
        break
      case MultiPageNodeType.CONNECTOR:
        labelDefaults = this.connectorNodeDefaults.labels
        break
      case MultiPageNodeType.PROXY:
        labelDefaults = this.proxyNodeDefaults.labels
        break
      case MultiPageNodeType.PROXY_REFERENCE:
        labelDefaults = this.proxyReferenceNodeDefaults.labels
        break
      default:
        labelDefaults = this.normalNodeDefaults.labels
        break
    }

    const style =
      labelDefaults.style !== NULL_LABEL_STYLE
        ? labelDefaults.getStyleInstance(viewNode)
        : modelLabel !== null
          ? modelLabel.style.clone()
          : pageView.nodeDefaults.labels.style

    const viewLabel = pageView.addLabel({
      owner: viewNode,
      text: modelLabel.text,
      style,
      tag: modelLabel.tag
    })

    // the layout graph yields an oriented rectangle for the label, now we need to find the according parameter
    // for the view model
    const finder = modelLabel.layoutParameter.model
      .getContext(viewLabel)
      .lookup(ILabelModelParameterFinder)

    let parameter
    if (!finder || !modelLabel || labelDefaults.layoutParameter != NULL_LABEL_MODEL_PARAMETER) {
      parameter = labelDefaults.getLayoutParameterInstance(viewNode)
    } else {
      parameter = finder.findBestParameter(nodeLabelLayout.layout)
    }
    pageView.setLabelLayoutParameter(viewLabel, parameter)

    return viewLabel
  }

  /**
   * Returns a node of the output {@link IGraph} that corresponds
   * to the provided node of the {@link LayoutGraph} returned by the
   * multi-page layout.
   */
  getViewNode(layoutNode) {
    return this.layoutToViewNode.get(layoutNode)
  }

  /**
   * Returns the layout node that corresponds
   * to the provided node of the output graph.
   */
  getLayoutNode(viewNode) {
    return this.viewToLayoutNode.get(viewNode)
  }

  /**
   * Returns a node of the original input graph that corresponds
   * to the provided node of the {@link LayoutGraph} returned by the
   *  multi-page layout.
   * As the multi-page layout introduces auxiliary nodes, this method
   * might return `null`.
   */
  getModelNode(layoutNode) {
    return this.result.context.getNodeId(layoutNode)
  }

  /**
   * Returns an edge of the original input graph that corresponds
   * the provided edge of the {@link LayoutGraph} returned by the
   * multi-page layout.
   * As the multi-page layout introduces auxiliary nodes, this method
   *  might return `null`
   */
  getModelEdge(layoutEdge) {
    return this.result.context.getEdgeId(layoutEdge)
  }

  /**
   * If the provided {@link LayoutGraph} node has a represented node,
   * returns the node of the original input graph that corresponds to this node.
   */
  getRepresentedNode(layoutNode) {
    // represented node is the Node in the LayoutGraph representation of the model graph
    const representedNode = this.result.context.getRepresentedNode(layoutNode)
    if (representedNode !== null) {
      // translate it into the corresponding INode from the model graph.
      const originalNodeDp = representedNode.graph.context.getItemData(
        LayoutGraphAdapter.ORIGINAL_NODE_DATA_KEY
      )
      return originalNodeDp.get(representedNode)
    }
    return null
  }

  /**
   * If the provided {@link LayoutGraph} edge has a represented edge,
   * returns the edge of the original input graph that corresponds to this edge.
   */
  getRepresentedEdge(layoutEdge) {
    const representedEdge = this.result.context.getRepresentedEdge(layoutEdge)
    if (representedEdge !== null) {
      // translate it into the corresponding IEdge from the model graph.
      const originalEdgeDp = representedEdge.graph.context.getItemData(
        LayoutGraphAdapter.ORIGINAL_EDGE_DATA_KEY
      )
      return originalEdgeDp.get(representedEdge)
    }
    return null
  }

  /**
   * Returns a port of the resulting graph view that corresponds to the
   *  provided port of the original input graph.
   */
  getViewPort(layoutPort) {
    return this.modelToViewPort.get(layoutPort)
  }

  /**
   * Called by the various edge creation callbacks to create an edge in the resulting graph view
   * that corresponds to the provided `layoutEdge`.
   * If a model edge is provided, the edge will be created between the copies of the corresponding
   * source/target ports.
   * @param pageLayoutGraph The layout graph representing the current page.
   * @param pageView The {@link IGraph} that is built to show the multi-page
   *   layout in a graph canvas.
   * @param layoutEdge The edge of the layout graph that should be copied.
   * @param modelEdge The edge of the original input graph that corresponds to the
   *   `layoutEdge` (may be `null`).
   * @param edgeDefaults The defaults to use for edge creation.
   * @returns The created edge
   * @see {@link MultiPageIGraphBuilder.createConnectorEdge}
   * @see {@link MultiPageIGraphBuilder.createNormalEdge}
   * @see {@link MultiPageIGraphBuilder.createProxyEdge}
   * @see {@link MultiPageIGraphBuilder.createProxyReferenceEdge}
   */
  createEdgeCore(pageLayoutGraph, pageView, layoutEdge, modelEdge, edgeDefaults) {
    // Check if there is another layout edge on this page which represents the same normal edge
    const conflictingEdge = pageLayoutGraph.edges.some((edge) => {
      const representedEdge = this.getRepresentedEdge(edge)
      return edge !== layoutEdge && representedEdge === modelEdge
    })

    const style =
      !modelEdge || edgeDefaults.style !== NULL_EDGE_STYLE
        ? edgeDefaults.getStyleInstance()
        : modelEdge.style.clone()
    const tag = modelEdge ? modelEdge.tag : null

    let viewEdge
    if (modelEdge && !conflictingEdge) {
      // if the edge has a model edge: create the copied edge between
      // the copies of its source and target ports
      const modelSourcePort = modelEdge.sourcePort
      const modelTargetPort = modelEdge.targetPort
      const viewSourcePort = this.getViewPort(modelSourcePort)
      const viewTargetPort = this.getViewPort(modelTargetPort)
      viewEdge = pageView.createEdge(viewSourcePort, viewTargetPort, style, tag)
    } else {
      // otherwise create it between the copies of its source and target nodes
      const viewSource = this.getViewNode(layoutEdge.source)
      const viewTarget = this.getViewNode(layoutEdge.target)
      viewEdge = pageView.createEdge(viewSource, viewTarget, style, tag)
    }

    // adjust the port location
    const newSourcePortLocation = layoutEdge.sourcePortLocation
    const newTargetPortLocation = layoutEdge.targetPortLocation
    pageView.setPortLocation(viewEdge.sourcePort, newSourcePortLocation.toPoint())
    pageView.setPortLocation(viewEdge.targetPort, newTargetPortLocation.toPoint())

    // and copy the bends
    layoutEdge.bends.forEach((bend) => {
      pageView.addBend(viewEdge, bend.location)
    })

    return viewEdge
  }

  /**
   * Copies the given edge. Delegate to the type specific implementations.
   * @param pageLayoutGraph The layout graph.
   * @param layoutEdge The edge in the layout graph.
   * @param pageView The view graph to create the copy in.
   * @returns The copied edge.
   */
  copyEdge(pageLayoutGraph, layoutEdge, pageView) {
    switch (this.result.context.getEdgeType(layoutEdge)) {
      case MultiPageEdgeType.REGULAR:
        return this.createNormalEdge(pageLayoutGraph, layoutEdge, pageView)
      case MultiPageEdgeType.CONNECTOR:
        return this.createConnectorEdge(pageLayoutGraph, layoutEdge, pageView)
      case MultiPageEdgeType.PROXY:
        return this.createProxyEdge(pageLayoutGraph, layoutEdge, pageView)
      case MultiPageEdgeType.PROXY_REFERENCE:
        return this.createProxyReferenceEdge(pageLayoutGraph, layoutEdge, pageView)
      default:
        throw new Error('unknown edge type')
    }
  }

  /**
   * Create a normal edge, i.e., an edge that directly corresponds to an edge of the original input graph.
   * @param pageLayoutGraph The layout graph representing the current page
   * @param layoutEdge The edge of the layout graph that should be copied
   * @param pageView The {@link IGraph} that is built to show the multi-page
   *   layout in a graph canvas
   * @returns The created edge
   * @see {@link MultiPageIGraphBuilder.createEdgeCore}
   */
  createNormalEdge(pageLayoutGraph, layoutEdge, pageView) {
    const modelEdge = this.getModelEdge(layoutEdge)
    const edge = this.createEdgeCore(
      pageLayoutGraph,
      pageView,
      layoutEdge,
      modelEdge,
      this.normalEdgeDefaults
    )
    this.copyEdgeLabels(pageView, layoutEdge, edge, modelEdge, this.normalEdgeDefaults.labels)
    return edge
  }

  /**
   * Create a connector edge.
   * A connector edge is an edge connected to a connector node, i.e., it represents an edge
   * of the input graph whose endpoints lie on different pages.
   * @param pageLayoutGraph The layout graph representing the current page
   * @param layoutEdge The edge of the layout graph that should be copied
   * @param pageView The {@link IGraph} that is built to show the multi-page
   *   layout in a graph canvas
   * @returns The created edge
   * @see {@link MultiPageIGraphBuilder.createEdgeCore}
   */
  createConnectorEdge(pageLayoutGraph, layoutEdge, pageView) {
    const representedEdge = this.getRepresentedEdge(layoutEdge)
    const viewEdge = this.createEdgeCore(
      pageLayoutGraph,
      pageView,
      layoutEdge,
      representedEdge,
      this.connectorEdgeDefaults
    )
    this.copyEdgeLabels(
      pageView,
      layoutEdge,
      viewEdge,
      representedEdge,
      this.connectorEdgeDefaults.labels
    )
    return viewEdge
  }

  /**
   * Create a proxy edge.
   * A proxy edge is an edge connected to a proxy node, i.e., a node that is a proxy
   * for an original node located on a different page.
   * @param pageLayoutGraph The layout graph representing the current page
   * @param layoutEdge The edge of the layout graph that should be copied
   * @param pageView The {@link IGraph} that is built to show the multi-page
   *   layout in a graph canvas
   * @returns The created edge
   * @see {@link MultiPageIGraphBuilder.createEdgeCore}
   */
  createProxyEdge(pageLayoutGraph, layoutEdge, pageView) {
    const representedEdge = this.getRepresentedEdge(layoutEdge)
    const viewEdge = this.createEdgeCore(
      pageLayoutGraph,
      pageView,
      layoutEdge,
      representedEdge,
      this.proxyEdgeDefaults
    )
    this.copyEdgeLabels(
      pageView,
      layoutEdge,
      viewEdge,
      representedEdge,
      this.proxyEdgeDefaults.labels
    )
    return viewEdge
  }

  /**
   * Create a proxy reference edge.
   * A proxy reference edge is an edge connected to a proxy reference node, i.e., a node that
   * refers to a proxy of an original node located on a different page.
   * @param pageLayoutGraph The layout graph representing the current page
   * @param layoutEdge The edge of the layout graph that should be copied
   * @param pageView The {@link IGraph} that is built to show the multi-page
   *   layout in a graph canvas
   * @returns The created edge
   * @see {@link MultiPageIGraphBuilder.createEdgeCore}
   */
  createProxyReferenceEdge(pageLayoutGraph, layoutEdge, pageView) {
    const representedEdge = this.getRepresentedEdge(layoutEdge)
    return this.createEdgeCore(
      pageLayoutGraph,
      pageView,
      layoutEdge,
      representedEdge,
      this.proxyReferenceEdgeDefaults
    )
  }

  /**
   * Called by the various node creation callbacks to create a node in the resulting graph view
   * that corresponds to the provided `layoutNode`.
   * If a model node is provided, the ports of the original node will be copied to the created view node.
   * Also, a clone of the original node style will be used as the style of the created node.
   * @param pageView The {@link IGraph} that is built to show the multi-page layout in a graph canvas
   * @param layoutNode The node of the layout graph that should be copied
   * @param modelNode The node of the original input graph that corresponds to the
   *   `layoutNode` (maybe `null`)
   * @param isReferenceNode Whether the node is a proxy reference node
   * @param nodeDefaults The defaults for the new node
   * @returns the created node
   * @see {@link MultiPageIGraphBuilder.createConnectorNode}
   * @see {@link MultiPageIGraphBuilder.createNormalNode}
   * @see {@link MultiPageIGraphBuilder.createGroupNode}
   * @see {@link MultiPageIGraphBuilder.createProxyNode}
   * @see {@link MultiPageIGraphBuilder.createProxyReferenceNode}
   */
  createNodeCore(pageView, layoutNode, modelNode, isReferenceNode, nodeDefaults) {
    // get the layout from the layout graph
    const nodeLayout = layoutNode.layout
    // get the style from the node defaults or the model node (or the default style if none is provided)
    const style =
      nodeDefaults.style !== NULL_NODE_STYLE
        ? nodeDefaults.getStyleInstance()
        : modelNode !== null
          ? modelNode.style.clone()
          : pageView.nodeDefaults.style.clone()
    const tag = modelNode !== null ? modelNode.tag : null
    // create the copied node
    const viewNode = pageView.createNode(
      new Rect(nodeLayout.x, nodeLayout.y, nodeLayout.width, nodeLayout.height),
      style,
      tag
    )
    // copy the ports of the model node
    if (modelNode !== null) {
      this.copyPorts(pageView, viewNode, modelNode)
    }

    this.viewToLayoutNode.set(viewNode, layoutNode)

    viewNode.tag = { isReferenceNode }

    return viewNode
  }

  /**
   * Copy the given node. Delegate to the type specific implementations.
   * @param layoutNode The node in the layout graph.
   * @param pageView The view graph to copy the node to.
   * @returns The copied node.
   */
  copyNode(layoutNode, pageView) {
    let viewNode
    switch (this.result.context.getNodeType(layoutNode)) {
      case MultiPageNodeType.REGULAR:
        viewNode = this.createNormalNode(layoutNode, pageView)
        break
      case MultiPageNodeType.GROUP:
        viewNode = this.createGroupNode(layoutNode, pageView)
        break
      case MultiPageNodeType.CONNECTOR:
        viewNode = this.createConnectorNode(layoutNode, pageView)
        break
      case MultiPageNodeType.PROXY:
        viewNode = this.createProxyNode(layoutNode, pageView)
        break
      case MultiPageNodeType.PROXY_REFERENCE:
        viewNode = this.createProxyReferenceNode(layoutNode, pageView)
        break
      default:
        throw new Error('unknown node type')
    }
    return viewNode
  }

  /**
   * Copy the ports from a provided node of the original input graph to a node of the resulting multi-page graph view.
   */
  copyPorts(pageView, viewNode, modelNode) {
    modelNode.ports.forEach((port) => {
      const viewPort = pageView.addPort(viewNode, port.locationParameter.clone())
      if (port.style !== null) {
        pageView.setStyle(viewPort, port.style.clone())
      }
      this.modelToViewPort.set(port, viewPort)
    })
  }

  /**
   * Create a normal node, i.e., a node that directly corresponds to a node of the original input graph.
   * This implementation copies the labels of the corresponding node in the original input graph.
   * Also the style of the original node is used for the returned node, unless a style is set
   * for the {@link normalNodeDefaults}.
   *
   * @param layoutNode The node of the layout graph that should be copied
   * @param pageView The {@link IGraph} that is built to show the multi-page
   *   layout in a graph canvas
   * @returns The created node
   * @see {@link MultiPageIGraphBuilder.createNodeCore}
   */
  createNormalNode(layoutNode, pageView) {
    const modelNode = this.getModelNode(layoutNode)
    const viewNode = this.createNodeCore(
      pageView,
      layoutNode,
      modelNode,
      false,
      this.normalNodeDefaults
    )
    this.copyNodeLabels(pageView, layoutNode, viewNode, modelNode)
    return viewNode
  }

  /**
   * Create a group node, i.e., a node that directly corresponds to a group node of the original input graph.
   * This implementation copies the labels of the corresponding node in the original input graph.
   * Also the style of the original node is used for the returned node, unless a style is set
   * for the {@link groupNodeDefaults}.
   *
   * @param layoutNode The node of the layout graph that should be copied
   * @param pageView The {@link IGraph} that is built to show the multi-page
   *   layout in a graph canvas
   * @returns The created node
   * @see {@link MultiPageIGraphBuilder.createNodeCore}
   */
  createGroupNode(layoutNode, pageView) {
    const modelNode = this.getModelNode(layoutNode)
    const viewNode = this.createNodeCore(
      pageView,
      layoutNode,
      modelNode,
      false,
      this.groupNodeDefaults
    )
    this.copyNodeLabels(pageView, layoutNode, viewNode, modelNode)
    return viewNode
  }

  /**
   * Create a connector node, i.e., a node that represents a "jump mark" to another connector node on a different
   * page. This implementation copies the labels of the represented node and applies the
   * {@link connectorNodeDefaults}.
   *
   * @param layoutNode The node of the layout graph that should be copied
   * @param pageView The {@link IGraph} that is built to show the multi-page
   *   layout in a graph canvas
   * @returns The created node
   * @see {@link MultiPageIGraphBuilder.createNodeCore}
   */
  createConnectorNode(layoutNode, pageView) {
    const representedNode = this.getRepresentedNode(layoutNode)
    const viewNode = this.createNodeCore(
      pageView,
      layoutNode,
      representedNode,
      true,
      this.connectorNodeDefaults
    )
    this.copyNodeLabels(pageView, layoutNode, viewNode, representedNode)
    return viewNode
  }

  /**
   * Create a proxy node, i.e., a node that "partially" represents a node of the input graph.
   * This implementation copies the labels of the represented node and applies the {@link proxyNodeDefaults}.
   *
   * @param layoutNode The node of the layout graph that should be copied
   * @param pageView The {@link IGraph} that is built to show the multi-page
   *   layout in a graph canvas
   * @returns The created node
   * @see {@link MultiPageIGraphBuilder.createNodeCore}
   */
  createProxyNode(layoutNode, pageView) {
    const representedNode = this.getRepresentedNode(layoutNode)
    const viewNode = this.createNodeCore(
      pageView,
      layoutNode,
      representedNode,
      true,
      this.proxyNodeDefaults
    )
    this.copyNodeLabels(pageView, layoutNode, viewNode, representedNode)
    return viewNode
  }

  /**
   * Create a proxy reference node, i.e., a node referencing a proxy node.
   * This implementation copies the labels of the represented node and applies the
   * {@link proxyReferenceNodeDefaults}.
   *
   * @param layoutNode The node of the layout graph that should be copied
   * @param pageView The {@link IGraph} that is built to show the multi-page
   *   layout in a graph canvas
   * @returns The created node
   * @see {@link MultiPageIGraphBuilder.createNodeCore}
   */
  createProxyReferenceNode(layoutNode, pageView) {
    const representedNode = this.getRepresentedNode(layoutNode)
    const viewNode = this.createNodeCore(
      pageView,
      layoutNode,
      representedNode,
      true,
      this.proxyReferenceNodeDefaults
    )
    const referencingNode = this.result.context.getReferencingNode(layoutNode)
    const targetPage = this.result.context.getPage(referencingNode)
    const style =
      this.proxyReferenceNodeDefaults.labels.style !== NULL_LABEL_STYLE
        ? this.proxyReferenceNodeDefaults.labels.getStyleInstance(viewNode)
        : pageView.nodeDefaults.labels.getStyleInstance(viewNode)
    const parameter =
      this.proxyReferenceNodeDefaults.labels.layoutParameter !== NULL_LABEL_MODEL_PARAMETER
        ? this.proxyReferenceNodeDefaults.labels.getLayoutParameterInstance(viewNode)
        : pageView.nodeDefaults.labels.getLayoutParameterInstance(viewNode)
    pageView.addLabel(viewNode, `p${targetPage + 1}`, parameter, style)
    return viewNode
  }
}

/**
 * The default node style used for node defaults.
 * This style instance is only a marker that tells the graph builder to clone the style
 * of the corresponding node in the original graph.
 */
const NULL_NODE_STYLE = new ShapeNodeStyle()

/**
 * The default edge style used for edge defaults.
 * This style instance is only a marker that tells the graph builder to clone the style
 * of the corresponding edge in the original graph.
 */
const NULL_EDGE_STYLE = new PolylineEdgeStyle()

/**
 * The default label style used for label defaults.
 * This style instance is only a marker that tells the graph builder to clone the style
 * of the corresponding label in the original graph.
 */
const NULL_LABEL_STYLE = new LabelStyle()

/**
 * The default label model parameter used for label defaults.
 * This label model parameter instance is only a marker that tells the graph builder to clone the
 * label model parameter of the corresponding label in the original graph.
 */
const NULL_LABEL_MODEL_PARAMETER = FreeLabelModel.INSTANCE.createAbsolute(Point.ORIGIN)
