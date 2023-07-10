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
  EdgeCreator,
  EdgesSource,
  FreeNodePortLocationModel,
  FreePortLabelModel,
  GraphBuilder,
  IEdge,
  IEdgeStyle,
  IGraph,
  ILabelModelParameter,
  INode,
  INodeStyle,
  IPort,
  IPortStyle,
  NodeCreator,
  NodesSource,
  Point,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle,
  Size,
  VoidPortStyle
} from 'yfiles'
import { AndGateNodeStyle } from '../../showcase/logicgates/node-styles/AndGateNodeStyle.js'
import { NotNodeStyle } from '../../showcase/logicgates/node-styles/NotNodeStyle.js'
import { OrNodeStyle } from '../../showcase/logicgates/node-styles/OrNodeStyle.js'
import { XOrNodeStyle } from '../../showcase/logicgates/node-styles/XOrNodeStyle.js'

/*
 This file shows how to configure GraphBuilder to support ports.
 */

// In this sample the data is arranged in the following way.
// When used in an own sample it has to be adjusted for the source data.

/**
 * @typedef {Object} NodeData
 * @property {string} id
 * @property {('and'|'or'|'not'|'nand'|'nor'|'xor'|'xnor')} type
 */
/**
 * @typedef {Object} EdgeData
 * @property {string} id
 * @property {string} from
 * @property {string} to
 */
// internally used port data
/**
 * @typedef {Object} PortData
 * @property {string} id
 * @property {string} [name]
 * @property {Array.<number>} location
 * @property {boolean} [rightSide]
 */

/** @type {GraphBuilder} */
let graphBuilder
/** @type {NodesSource.<NodeData>} */
let nodesSource
/** @type {EdgesSource.<EdgeData>} */
let edgesSource

/**
 * Creates a new instance of a port-aware graph builder.
 * The builder uses the given node and edge sources.
 * @param {!IGraph} graph The graph the builder works on
 * @param {!Array.<NodeData>} sampleNodes The data to build the nodes from
 * @param {!Array.<EdgeData>} sampleEdges The data to build the edges from
 * @returns {!GraphBuilder}
 */
export function createPortAwareGraphBuilder(graph, sampleNodes, sampleEdges) {
  graphBuilder = new GraphBuilder(graph)

  nodesSource = graphBuilder.createNodesSource({
    data: sampleNodes,
    id: 'id'
  })
  // change the node creator but keep the original's defaults
  nodesSource.nodeCreator = new TypeAwareNodeCreator({ defaults: nodesSource.nodeCreator.defaults })
  nodesSource.nodeCreator.styleProvider = nodeData => {
    switch (nodeData.type) {
      case 'or':
        return new OrNodeStyle(false, '#A49966', '#625F50', '#FFFFFF')
      case 'nor':
        return new OrNodeStyle(true, '#C7C7A6', '#77776E', '#000000')
      case 'and':
        return new AndGateNodeStyle(false, '#363020', '#201F1A', '#FFFFFF')
      case 'nand':
        return new AndGateNodeStyle(true, '#605C4E', '#3A3834', '#FFFFFF')
      case 'xor':
        return new XOrNodeStyle(false, '#A4778B', '#62555B', '#FFFFFF')
      case 'xnor':
        return new XOrNodeStyle(true, '#AA4586', '#66485B', '#FFFFFF')
      case 'not':
        return new NotNodeStyle('#177e89', '#093237', '#FFFFFF')
      default:
        return new ShapeNodeStyle()
    }
  }

  nodesSource.nodeCreator.defaults.size = new Size(100, 50)

  edgesSource = graphBuilder.createEdgesSource({
    data: sampleEdges,
    // we extract the node Id from source Id and target Id
    // that way EdgeCreator.createEdgeCore will already get the correct source and target nodes
    sourceId: data => getNodeId(data.from),
    targetId: data => getNodeId(data.to),
    id: 'id'
  })
  edgesSource.edgeCreator = new PortAwareEdgeCreator({ defaults: edgesSource.edgeCreator.defaults })
  edgesSource.edgeCreator.defaults.style = new PolylineEdgeStyle({ stroke: '2px black' })
  return graphBuilder
}

/**
 * Update new nodes and edges data for the builder's nodes source.
 * @param {!Array.<*>} nodesSourceData The new node data to set.
 * @param {!Array.<*>} edgesSourceData The new edge data to set.
 */
export function setBuilderData(nodesSourceData, edgesSourceData) {
  graphBuilder.setData(nodesSource, nodesSourceData)
  graphBuilder.setData(edgesSource, edgesSourceData)
}

/**
 * Extracts the node ID from the source or target ID of an edge.
 * @param {!string} fullId The full ID.
 * @returns {!string}
 */
function getNodeId(fullId) {
  // here the ID is 'nodeId;portId'
  return fullId.split(';')[0]
}

/**
 * A node creator which adds ports according to the node's type.
 * Overrides createNodeCore to add ports according to the node's type.
 */
class TypeAwareNodeCreator extends NodeCreator {
  /**
   * Overrides the original node creator to add ports
   * according to the node type.
   * Note that the given style is already chosen for the node type
   * since method getStyle is overridden below.
   * @param {!IGraph} graph
   * @param {boolean} groupNode
   * @param {!INode} parent
   * @param {!Rect} layout
   * @param {!INodeStyle} style
   * @param {*} tag
   * @returns {!INode}
   */
  createNodeCore(graph, groupNode, parent, layout, style, tag) {
    // this assumes that we don't use a custom tag provider,
    // i.e. the tag contains the node data as provided by the node source array
    const nodeData = tag

    // let the base implementation create the node
    const node = super.createNodeCore(graph, groupNode, parent, layout, style, tag)

    // add ports according to their type
    this.getPorts(nodeData).forEach(pin => {
      this.addPort(graph, node, pin)
    })
    return node
  }

  /**
   * Adds a port to the given node.
   * The port can be identified by its ID which is set to its tag.
   * @param {!IGraph} graph The graph to operate on.
   * @param {!INode} node The node to add the port to.
   * @param {!PortData} portData The port data to create the port for.
   */
  addPort(graph, node, portData) {
    const port = graph.addPort({
      owner: node,
      locationParameter: new FreeNodePortLocationModel().createParameterForRatios(
        this.getPortLocation(portData)
      ),
      style: this.getPortStyle(portData),
      tag: this.getPortId(portData)
    })
    this.addPortLabel(graph, port, portData)
  }

  /**
   * Adds a label to the port.
   * @param {!IGraph} graph The graph to operate on.
   * @param {!IPort} port The port to add the label to.
   * @param {!PortData} portData The port data to create the label for.
   */
  addPortLabel(graph, port, portData) {
    const text = this.getPortLabel(portData)
    if (text) {
      graph.addLabel(port, text, this.getParameter(portData))
    }
  }

  /**
   * Updates a given node. This function is called for nodes which already exist in the graph.
   * The method itself updates the ports and style. The actual node update is delegated to the base method.
   * @param {!IGraph} graph The graph to operate on.
   * @param {!INode} node The node to update.
   * @param {?INode} parent The parent node.
   * @param {!NodeData} dataItem The new data item.
   */
  updateNode(graph, node, parent, dataItem) {
    super.updateNode(graph, node, parent, dataItem)
    graph.setStyle(node, this.getStyle(dataItem))
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
          if (text) {
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
   * Developers who want to use this graph builder
   * in their own applications can modify the following
   * methods to adapt to different node data (Gate) and
   * port data (Pin) definitions.
   * *****************************************************/

  /**
   * Gets an array of PortData from the given node data.
   * The port data is created according to the node type.
   * @param {!NodeData} nodeData
   * @returns {!Array.<PortData>}
   */
  getPorts(nodeData) {
    switch (nodeData.type) {
      case 'or':
      case 'nor':
      case 'and':
      case 'nand':
      case 'xor':
      case 'xnor':
        return [
          { id: 'in0', name: 'in0', location: [0, 0.25] },
          { id: 'in1', name: 'in1', location: [0, 0.75] },
          { id: 'out0', name: 'out', location: [1, 0.5], rightSide: true }
        ]
      case 'not':
      default:
        return [
          { id: 'in0', name: 'in', location: [0, 0.5] },
          { id: 'out0', name: 'out', location: [1, 0.5], rightSide: true }
        ]
    }
  }

  /**
   * Gets the (relative) port location from the port data.
   * @param {!PortData} pin
   * @returns {!Point}
   */
  getPortLocation(pin) {
    return Point.from(pin.location)
  }

  /**
   * Gets the ID from the port data.
   * @param {!PortData} pin
   */
  getPortId(pin) {
    return pin.id
  }

  /**
   * Gets the port style from the port data.
   * @param {!PortData} pin
   * @returns {!IPortStyle}
   */
  getPortStyle(pin) {
    // the ports are invisible
    return VoidPortStyle.INSTANCE
  }

  /**
   * Gets the port label location parameter.
   * @param {!PortData} pin
   * @returns {!ILabelModelParameter}
   */
  getParameter(pin) {
    return new FreePortLabelModel().createParameter(
      new Point(0, -5),
      new Point(pin.rightSide ? 0.8 : 0.5, 1)
    )
  }

  /**
   * Gets the port label text.
   * Might be null if no label should be displayed.
   * @param {!PortData} pin
   * @returns {!string}
   */
  getPortLabel(pin) {
    return pin.name
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
   * @param {!IGraph} graph The graph to operate on.
   * @param {!INode} source The source node.
   * @param {!INode} target The target node.
   * @param {!IEdgeStyle} style The edge style.
   * @param {*} tag The edge tag (actually the node data of the target node)
   * @returns {!IEdge}
   */
  createEdgeCore(graph, source, target, style, tag) {
    const edgeData = tag
    // get the source port: if there is an ID specified (from), get the first with the matching ID
    // if no ID is specified: get the first port
    const sourcePortId = this.getSourcePortId(edgeData)
    const sourcePort = sourcePortId
      ? source.ports.find(p => p.tag === sourcePortId)
      : source.ports.at(0)
    const targetPortId = this.getTargetPortId(edgeData)
    const targetPort = targetPortId
      ? target.ports.find(p => p.tag === targetPortId)
      : target.ports.at(0)

    // create the edges between source and target port. If no port is provided add a default port.
    return graph.createEdge(
      sourcePort ?? graph.addPort(source),
      targetPort ?? graph.addPort(target),
      style,
      tag
    )
  }

  /**
   * Updates a given edge. This function is called for edges which already exist in the graph.
   * Delegates to the base implementation for the actual edge update,
   * then sets the new ports if needed.
   * @param {!IGraph} graph The graph to operate on.
   * @param {!IEdge} edge The edge to update.
   * @param {!EdgeData} dataItem The edge data of the edge to update.
   */
  updateEdge(graph, edge, dataItem) {
    super.updateEdge(graph, edge, dataItem)

    // If there is no ID or the ID is already the current port ID don't update the port.
    // Otherwise, get the first port at the source node which matches the ID.
    const sourcePortId = this.getSourcePortId(dataItem)
    const sourcePort =
      sourcePortId && sourcePortId !== edge.sourcePort.tag
        ? edge.sourcePort.owner.ports.find(p => p.tag === sourcePortId)
        : edge.sourcePort
    // same for the target port
    const targetPortId = this.getTargetPortId(dataItem)
    const targetPort =
      targetPortId && targetPortId !== edge.targetPort.tag
        ? edge.targetPort.owner.ports.find(p => p.tag === targetPortId)
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
   * Developers who want to use this graph builder
   * in their own applications can modify the following
   * methods to adapt to different edge data definitions.
   * *****************************************************/

  /**
   * Gets the source port ID from the edge data.
   * Returns undefined if the port to connect is not specified.
   * @param {!EdgeData} data
   * @returns {!string}
   */
  getSourcePortId(data) {
    return data.from?.split(';')[1]
  }

  /**
   * Gets the target port ID from the edge data.
   * Returns undefined if the port to connect is not specified.
   * @param {!EdgeData} data
   * @returns {!string}
   */
  getTargetPortId(data) {
    return data.to?.split(';')[1]
  }
}
