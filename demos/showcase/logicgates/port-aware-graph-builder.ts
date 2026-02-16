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
  EdgeCreator,
  type EdgesSource,
  FreeNodePortLocationModel,
  FreePortLabelModel,
  GraphBuilder,
  type IEdge,
  type IEdgeStyle,
  type IGraph,
  type ILabelModelParameter,
  type INode,
  type INodeStyle,
  type IPort,
  IPortStyle,
  NodeCreator,
  type NodesSource,
  Point,
  PolylineEdgeStyle,
  type Rect,
  ShapeNodeStyle,
  Size
} from '@yfiles/yfiles'
import { AndGateNodeStyle } from './node-styles/AndGateNodeStyle'
import { NotNodeStyle } from './node-styles/NotNodeStyle'
import { OrNodeStyle } from './node-styles/OrNodeStyle'
import { XOrNodeStyle } from './node-styles/XOrNodeStyle'

/*
 This file shows how to configure GraphBuilder to support ports.
 */

// In this sample the data is arranged in the following way.
// When used in an own sample it has to be adjusted for the source data.

export type NodeData = {
  /** the ID for the node, must be unique for all nodes in the graph */
  id: string
  /** the node type. Determines appearance and ports */
  type: 'and' | 'or' | 'not' | 'nand' | 'nor' | 'xor' | 'xnor'
}
export type EdgeData = {
  /** the ID for the edge, must be unique for all edges in the graph */
  id: string
  /** the source port ID as 'nodeID;portID' */
  from: string
  /** the target port ID as 'nodeID;portID' */
  to: string
}
// internally used port data
type PortData = {
  /** the ID for the port. Must be unique for all ports at the same node */
  id: string
  /** an optional name which can be used as label */
  name?: string
  /** the relative location (number between 0 and 1) */
  location: [number, number]
  /** whether the port is located at the right side */
  rightSide?: boolean
}

let graphBuilder: GraphBuilder
let nodesSource: NodesSource<NodeData>
let edgesSource: EdgesSource<EdgeData>

/**
 * Creates a new instance of a port-aware graph builder.
 * The builder uses the given node and edge sources.
 * @param graph The graph the builder works on
 * @param sampleNodes The data to build the nodes from
 * @param sampleEdges The data to build the edges from
 */
export function createPortAwareGraphBuilder(
  graph: IGraph,
  sampleNodes: NodeData[],
  sampleEdges: EdgeData[]
): GraphBuilder {
  graphBuilder = new GraphBuilder(graph)

  nodesSource = graphBuilder.createNodesSource({ data: sampleNodes, id: 'id' })
  // change the node creator but keep the original's defaults
  nodesSource.nodeCreator = new TypeAwareNodeCreator({ defaults: nodesSource.nodeCreator.defaults })
  nodesSource.nodeCreator.styleProvider = (nodeData) => {
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
    sourceId: (data) => getNodeId(data.from),
    targetId: (data) => getNodeId(data.to),
    id: 'id'
  })
  edgesSource.edgeCreator = new PortAwareEdgeCreator({ defaults: edgesSource.edgeCreator.defaults })
  edgesSource.edgeCreator.defaults.style = new PolylineEdgeStyle({ stroke: '2px black' })
  return graphBuilder
}

/**
 * Update new nodes and edges data for the builder's nodes source.
 * @param nodesSourceData The new node data to set.
 * @param edgesSourceData The new edge data to set.
 */
export function setBuilderData(nodesSourceData: any[], edgesSourceData: any[]): void {
  graphBuilder.setData(nodesSource, nodesSourceData)
  graphBuilder.setData(edgesSource, edgesSourceData)
}

/**
 * Extracts the node ID from the source or target ID of an edge.
 * @param fullId The full ID.
 */
function getNodeId(fullId: string): string {
  // here the ID is 'nodeId;portId'
  return fullId.split(';')[0]
}

/**
 * A node creator which adds ports according to the node's type.
 * Overrides createNodeCore to add ports according to the node's type.
 */
class TypeAwareNodeCreator extends NodeCreator<NodeData> {
  /**
   * Overrides the original node creator to add ports
   * according to the node type.
   * Note that the given style is already chosen for the node type
   * since method getStyle is overridden below.
   */
  createNodeCore(
    graph: IGraph,
    groupNode: boolean,
    parent: INode,
    layout: Rect,
    style: INodeStyle,
    tag: any
  ): INode {
    // this assumes that we don't use a custom tag provider,
    // i.e. the tag contains the node data as provided by the node source array
    const nodeData = tag as NodeData

    // let the base implementation create the node
    const node = super.createNodeCore(graph, groupNode, parent, layout, style, tag)

    // add ports according to their type
    this.getPorts(nodeData).forEach((pin) => {
      this.addPort(graph, node, pin)
    })
    return node
  }

  /**
   * Adds a port to the given node.
   * The port can be identified by its ID which is set to its tag.
   * @param graph The graph to operate on.
   * @param node The node to add the port to.
   * @param portData The port data to create the port for.
   */
  private addPort(graph: IGraph, node: INode, portData: PortData) {
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
   * @param graph The graph to operate on.
   * @param port The port to add the label to.
   * @param portData The port data to create the label for.
   */
  private addPortLabel(graph: IGraph, port: IPort, portData: PortData) {
    const text = this.getPortLabel(portData)
    if (text) {
      graph.addLabel(port, text, this.getParameter(portData))
    }
  }

  /**
   * Updates a given node. This function is called for nodes which already exist in the graph.
   * The method itself updates the ports and style. The actual node update is delegated to the base method.
   * @param graph The graph to operate on.
   * @param node The node to update.
   * @param parent The parent node.
   * @param dataItem The new data item.
   */
  updateNode(graph: IGraph, node: INode, parent: INode | null, dataItem: NodeData) {
    super.updateNode(graph, node, parent, dataItem)
    graph.setStyle(node, this.getStyle(dataItem)!)
    let index = 0
    const portsToRemove: IPort[] = []
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
   */
  private getPorts(nodeData: NodeData): PortData[] {
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
   */
  private getPortLocation(pin: PortData): Point {
    return Point.from(pin.location)
  }

  /**
   * Gets the ID from the port data.
   */
  private getPortId(pin: PortData) {
    return pin.id
  }

  /**
   * Gets the port style from the port data.
   */
  private getPortStyle(pin: PortData): IPortStyle {
    // the ports are invisible
    return IPortStyle.VOID_PORT_STYLE
  }

  /**
   * Gets the port label location parameter.
   */
  private getParameter(pin: PortData): ILabelModelParameter {
    return new FreePortLabelModel().createParameter(
      new Point(0, -5),
      new Point(pin.rightSide ? 0.8 : 0.5, 1)
    )
  }

  /**
   * Gets the port label text.
   * Might be null if no label should be displayed.
   */
  private getPortLabel(pin: PortData): string | undefined {
    return pin.name
  }
}

/**
 * A custom edge creator connects the edges to specified ports.
 * Overrides createEdgeCore to extract a port ID from the source and target node ID.
 * Determines the port with that ID and connects the edge to that port.
 */
class PortAwareEdgeCreator extends EdgeCreator<EdgeData> {
  /**
   * Overrides the original edge creator to connect edges to specified ports.
   * @param graph The graph to operate on.
   * @param source The source node.
   * @param target The target node.
   * @param style The edge style.
   * @param tag The edge tag (actually the node data of the target node)
   */
  protected createEdgeCore(
    graph: IGraph,
    source: INode,
    target: INode,
    style: IEdgeStyle,
    tag: any
  ): IEdge {
    const edgeData = tag as EdgeData
    // get the source port: if there is an ID specified (from), get the first with the matching ID
    // if no ID is specified: get the first port
    const sourcePortId = this.getSourcePortId(edgeData)
    const sourcePort = sourcePortId
      ? source.ports.find((p) => p.tag === sourcePortId)
      : source.ports.at(0)
    const targetPortId = this.getTargetPortId(edgeData)
    const targetPort = targetPortId
      ? target.ports.find((p) => p.tag === targetPortId)
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
   * @param graph The graph to operate on.
   * @param edge The edge to update.
   * @param dataItem The edge data of the edge to update.
   */
  updateEdge(graph: IGraph, edge: IEdge, dataItem: EdgeData) {
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
   * Developers who want to use this graph builder
   * in their own applications can modify the following
   * methods to adapt to different edge data definitions.
   * *****************************************************/

  /**
   * Gets the source port ID from the edge data.
   * Returns undefined if the port to connect is not specified.
   */
  private getSourcePortId(data: EdgeData): string | undefined {
    return data.from?.split(';')[1]
  }

  /**
   * Gets the target port ID from the edge data.
   * Returns undefined if the port to connect is not specified.
   */
  private getTargetPortId(data: EdgeData): string | undefined {
    return data.to?.split(';')[1]
  }
}
