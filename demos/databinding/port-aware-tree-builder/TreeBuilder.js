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
  EdgeCreator,
  FreeNodePortLocationModel,
  FreePortLabelModel,
  IEdge,
  IEdgeStyle,
  IGraph,
  ILabelModelParameter,
  ILabelStyle,
  INode,
  INodeStyle,
  IPort,
  LabelCreator,
  LabelStyle,
  NodeCreator,
  NodeStylePortStyleAdapter,
  Point,
  Rect,
  ShapeNodeStyle,
  TreeBuilder,
  TreeNodesSource
} from '@yfiles/yfiles'
import { colorSets } from '@yfiles/demo-resources/demo-colors'
let treeBuilder
let nodesSource
/**
 * Creates a new instance of a port-aware tree builder.
 * The builder uses the given node source.
 * @param graph The graph the builder works on
 * @param nodesSourceData The data to build the graph from
 */
export function createPortAwareTreeBuilder(graph, nodesSourceData) {
  treeBuilder = new TreeBuilder(graph)
  nodesSource = treeBuilder.createRootNodesSource(nodesSourceData, 'id')
  const nodeCreator = new PortAwareNodeCreator({ defaults: graph.nodeDefaults })
  nodesSource.nodeCreator = nodeCreator
  const labelCreator = nodeCreator.createLabelBinding('name')
  configureStyles(nodeCreator, labelCreator)
  // Define the child node binding. Use the same source.
  nodesSource.addChildNodesSource('children', nodesSource)
  // Let the edges connect to ports
  nodesSource.parentEdgeCreator = new PortAwareEdgeCreator({ defaults: graph.edgeDefaults })
  return treeBuilder
}
/**
 * Demo specific: configures the styles to match the theme.
 */
function configureStyles(nodeCreator, labelCreator) {
  nodeCreator.styleProvider = createNodeStyle
  labelCreator.styleProvider = createLabelStyle
}
/**
 * Demo specific: configures the node style to match the theme
 * according to the optional color property of the node data.
 */
function createNodeStyle(dataItem, forPortLabels = false) {
  return dataItem && dataItem.color === 'blue'
    ? new ShapeNodeStyle({
        shape: forPortLabels ? 'rectangle' : 'round-rectangle',
        stroke: `1.5px ${colorSets['demo-lightblue'].stroke}`,
        fill: forPortLabels
          ? colorSets['demo-lightblue'].nodeLabelFill
          : colorSets['demo-lightblue'].fill
      })
    : new ShapeNodeStyle({
        shape: forPortLabels ? 'rectangle' : 'round-rectangle',
        stroke: `1.5px ${colorSets['demo-orange'].stroke}`,
        fill: forPortLabels ? colorSets['demo-orange'].nodeLabelFill : colorSets['demo-orange'].fill
      })
}
/**
 * Demo specific: configures the label style to match the theme
 * according to the optional color property of the node data.
 */
function createLabelStyle(dataItem, forPortLabels = false) {
  return dataItem && dataItem.color === 'blue'
    ? new LabelStyle({
        textFill: colorSets['demo-lightblue'].text,
        backgroundFill: forPortLabels ? null : colorSets['demo-lightblue'].nodeLabelFill,
        padding: forPortLabels ? 1 : 5,
        shape: forPortLabels ? 'rectangle' : 'round-rectangle'
      })
    : new LabelStyle({
        textFill: colorSets['demo-orange'].text,
        backgroundFill: forPortLabels ? null : colorSets['demo-orange'].nodeLabelFill,
        padding: forPortLabels ? 1 : 5,
        shape: forPortLabels ? 'rectangle' : 'round-rectangle'
      })
}
/**
 * Set new nodes data for the builder's nodes source.
 * @param nodesSourceData The new data to set.
 */
export function setBuilderData(nodesSourceData) {
  treeBuilder.setData(nodesSource, nodesSourceData)
}
/**
 * A node creator which adds ports as supplied with the node data.
 * Overrides createNodeCore to add the ports.
 */
class PortAwareNodeCreator extends NodeCreator {
  /**
   * Overrides the original node creator to add ports.
   */
  createNodeCore(graph, groupNode, parent, layout, style, tag) {
    // this assumes that we don't use a custom tag provider,
    // i.e. the tag contains the node data as provided by the node source array
    const nodeData = tag
    // let the base implementation create the node
    const node = super.createNodeCore(graph, groupNode, parent, layout, style, tag)
    // add ports
    const ports = this.getPorts(nodeData)
    if (ports) {
      for (const portData of ports) {
        this.addPort(graph, node, portData)
      }
    }
    return node
  }
  /**
   * Adds a port to the given node.
   * The port can be identified by its ID which is set to its tag.
   * @param graph The graph to operate on.
   * @param node The node to add the port to.
   * @param portData The port data to create the port for.
   */
  addPort(graph, node, portData) {
    const port = graph.addPort({
      owner: node,
      locationParameter: new FreeNodePortLocationModel().createParameterForRatios(
        this.getPortLocation(portData)
      ),
      style: new NodeStylePortStyleAdapter({
        nodeStyle: createNodeStyle(node.tag, true),
        renderSize: [8, 8]
      }),
      tag: this.getPortId(portData)
    })
    this.addPortLabel(graph, port, portData)
  }
  /**
   * Adds a label to the port.
   * @param graph The graph to operate on.
   * @param port The port to add the label to.
   * @param portData The port data to create the label for.
   */
  addPortLabel(graph, port, portData) {
    const text = this.getPortLabel(portData)
    if (text) {
      graph.addLabel(
        port,
        text,
        this.getParameter(portData),
        createLabelStyle(port.owner.tag, true)
      )
    }
  }
  /**
   * Updates a given node. This function is called for nodes which already exist in the graph.
   * The method itself updates the ports. The actual node update is delegated to the base method.
   * @param graph The graph to operate on.
   * @param node The node to update.
   * @param parent The parent node.
   * @param dataItem The new data item.
   */
  updateNode(graph, node, parent, dataItem) {
    super.updateNode(graph, node, parent, dataItem)
    let index = 0
    const portsToRemove = []
    const ports = this.getPorts(dataItem)
    // synchronize the ports according to the port data:
    // 1. update existing ports for which port data also exists
    //     with ID, location, and label according to the data
    // 2. remove ports for which no data exists
    // 3. add ports for new port data
    for (const port of node.ports) {
      if (ports && index < ports.length) {
        // update each existing port for which a port data item exists with the new port data
        const portData = ports[index++]
        // update tag and location
        port.tag = this.getPortId(portData)
        graph.setPortLocationParameter(
          port,
          new FreeNodePortLocationModel().createParameterForRatios(this.getPortLocation(portData))
        )
        // if the port has a label update it, otherwise add one
        const oldLabel = port.labels.at(0)
        if (oldLabel) {
          const text = this.getPortLabel(portData)
          if (text !== null) {
            graph.setLabelText(oldLabel, text)
            graph.setLabelLayoutParameter(oldLabel, this.getParameter(portData))
          } else {
            graph.remove(oldLabel)
          }
        } else {
          this.addPortLabel(graph, port, portData)
        }
      } else {
        // mark existing ports for which no port data exists to be removed
        portsToRemove.push(port)
      }
    }
    // actually remove the marked ports
    if (portsToRemove.length > 0) {
      for (const port of portsToRemove) {
        graph.remove(port)
      }
    } else if (ports) {
      // if there is port data left, add ports for it
      for (let i = index; i < ports.length; i++) {
        this.addPort(graph, node, ports[i])
      }
    }
  }
  /* *****************************************************
   * Developers who want to use this tree builder
   * in their own applications can modify the following
   * methods to adapt to different NodeData and
   * PortData definitions.
   * *****************************************************/
  /**
   * Gets the label placement according to the port data.
   */
  getParameter(portData) {
    // whether the port is at the bottom or at the top
    const bottom = this.getPortLocation(portData).y > 0.5
    return new FreePortLabelModel().createParameter({
      locationOffset: new Point(0, bottom ? -8 : 8),
      labelRatio: new Point(bottom ? 1 : 0, 0.5),
      angle: Math.PI / 2
    })
  }
  /**
   * Gets the label text to set from the port data.
   * Returns null if no label should be set.
   */
  getPortLabel(portData) {
    return portData.id
  }
  /**
   * Gets an array of PortData from the given node data.
   * Might be undefined.
   */
  getPorts(nodeData) {
    return nodeData.ports
  }
  /**
   * Gets the (relative) port location from the port data.
   */
  getPortLocation(portData) {
    return Point.from(portData.location)
  }
  /**
   * Gets the ID from the port data.
   */
  getPortId(portData) {
    return portData.id
  }
}
/**
 * A custom edge creator connects the edges to specified ports.
 * Overrides createEdgeCore to extract a port ID from the source and target node ID.
 * Determines the port with that ID and connects the edge to that port.
 */
class PortAwareEdgeCreator extends EdgeCreator {
  /**
   * Overrides the original edge creator to connect edges to specified ports.
   * @param graph The graph to operate on.
   * @param source The source node.
   * @param target The target node.
   * @param style The edge style.
   * @param tag The edge tag (actually the node data of the target node)
   */
  createEdgeCore(graph, source, target, style, tag) {
    const data = tag
    // get the source port: if there is an ID specified (from), get the first with the matching ID
    // if no ID is specified: get the first port
    const sourcePortId = this.getSourcePortId(data)
    const sourcePort = sourcePortId
      ? source.ports.find((p) => p.tag === sourcePortId)
      : source.ports.at(0)
    // same for the target port
    const targetPortId = this.getTargetPortId(data)
    const targetPort = targetPortId
      ? target.ports.find((p) => p.tag === targetPortId)
      : target.ports.at(0)
    // create the edges between source and target port. if no port is provided, add a default port.
    return graph.createEdge(
      sourcePort ?? graph.addPort(source),
      targetPort ?? graph.addPort(target),
      style,
      tag
    )
  }
  /**
   * Updates a given edge. This function is called for edges which already exist in the graph.
   * It delegates to the base implementation for the actual edge update,
   * then sets the new ports if needed.
   * @param graph The graph to operate on.
   * @param edge The edge to update.
   * @param dataItem The node data of the target node.
   */
  updateEdge(graph, edge, dataItem) {
    super.updateEdge(graph, edge, dataItem)
    // If there is no ID or the ID is already the current port ID don't update the port.
    // Otherwise, get the first port at the source node which matches the ID.
    const sourcePortId = this.getSourcePortId(dataItem)
    const sourcePort =
      sourcePortId && sourcePortId !== edge.sourcePort.tag
        ? edge.sourcePort.owner.ports.find((p) => p.tag === sourcePortId)
        : edge.sourcePort
    // same for the target port
    const targetPortId = this.getTargetPortId(dataItem)
    const targetPort =
      targetPortId && targetPortId !== edge.targetPort.tag
        ? edge.targetPort.owner.ports.find((p) => p.tag === targetPortId)
        : edge.targetPort
    // remember the current source and target ports
    const oldSource = edge.sourcePort
    const oldTarget = edge.targetPort
    // now set the new ports
    graph.setEdgePorts(edge, sourcePort ?? edge.sourcePort, targetPort ?? edge.targetPort)
    // if the source or target port has been changed and the old port doesn't have a tag:
    // remove it since it has been auto-generated
    if (oldSource !== edge.sourcePort && !oldSource.tag) {
      graph.remove(oldSource)
    }
    if (oldTarget !== edge.targetPort && !oldTarget.tag) {
      graph.remove(oldTarget)
    }
  }
  /* *****************************************************
   * Developers who want to use this tree builder
   * in their own applications can modify the following
   * methods to adapt to different NodeData and
   * PortData definitions.
   * *****************************************************/
  /**
   * Gets the source port ID from the node data.
   * Returns undefined if the port to connect is not specified.
   */
  getSourcePortId(data) {
    return data.from
  }
  /**
   * Gets the target port ID from the node data.
   * Returns undefined if the port to connect is not specified.
   */
  getTargetPortId(data) {
    return data.to
  }
}
