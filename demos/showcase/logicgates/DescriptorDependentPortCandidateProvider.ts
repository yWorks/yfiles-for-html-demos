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
  BaseClass,
  FreeNodePortLocationModel,
  type IEnumerable,
  type IGraph,
  type IInputModeContext,
  type INode,
  type IPort,
  type IPortCandidate,
  IPortCandidateProvider,
  List,
  ListEnumerable,
  Point,
  PortCandidate,
  PortCandidateValidity,
  SimpleNode,
  SimplePort
} from '@yfiles/yfiles'
import type { GateNodeStyle } from './node-styles/GateNodeStyle'
import { LogicGateType } from './LogicGateType'

enum EdgeDirection {
  IN = 0,
  OUT = 1
}

type PortDescriptor = {
  x: number
  y: number
  direction: number
}

/**
 * Provides all available ports of the given graph with the specified edge direction.
 */
export class DescriptorDependentPortCandidateProvider extends BaseClass(IPortCandidateProvider) {
  /**
   * Creates a new instance of DescriptorDependentPortCandidateProvider.
   */
  constructor(private readonly node: INode) {
    super()
  }

  /**
   * Returns all port candidates that apply for the provided opposite port candidate.
   * @param context The context for which the candidates should be provided
   * @param target The opposite port candidate
   */
  getSourcePortCandidates(
    context: IInputModeContext,
    target: IPortCandidate
  ): IEnumerable<IPortCandidate> {
    return this.getPortCandidatesForDirection(EdgeDirection.OUT)
  }

  /**
   * Returns all port candidates that apply for the provided opposite port candidate.
   * @param context The context for which the candidates should be provided
   * @param source The opposite port candidate
   */
  getTargetPortCandidates(
    context: IInputModeContext,
    source: IPortCandidate
  ): IEnumerable<IPortCandidate> {
    return this.getPortCandidatesForDirection(EdgeDirection.IN)
  }

  /**
   * Returns all source port candidates that belong to the context of this provider.
   * @param context The context for which the candidates should be provided
   */
  getAllSourcePortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    return this.getPortCandidatesForDirection(EdgeDirection.OUT)
  }

  /**
   * Returns all target port candidates that belong to the context of this provider.
   * @param context The context for which the candidates should be provided
   */
  getAllTargetPortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    return this.getPortCandidatesForDirection(EdgeDirection.IN)
  }

  /**
   * Returns the suitable candidates based on the specified edge direction.
   * @param direction The direction of the edge
   */
  getPortCandidatesForDirection(direction: number): List<IPortCandidate> {
    const candidates = new List<IPortCandidate>()
    // iterate over all available ports
    for (const port of this.node.ports) {
      // create a port candidate, invalidate it (so it is visible but not usable)
      const candidate = new PortCandidate(port)
      candidate.validity = PortCandidateValidity.INVALID

      // get the port descriptor which is stored in the port's tag
      const portDescriptor = port.tag as PortDescriptor
      // make the candidate valid if the direction is the same as the one supplied
      if (portDescriptor.direction === direction) {
        candidate.validity = PortCandidateValidity.VALID
      }
      // add the candidate to the list
      candidates.add(candidate)
    }
    // and return the list
    return candidates
  }
}

/**
 * Creates the port descriptors for the given nodes. If a graph is provided, the ports are directly added
 * to the graph. Otherwise they are added as SimplePorts to the node's port list.
 * @param nodes The nodes for which the port descriptors should be created
 * @param graph The graph which contains the nodes. If no graph is provided, the ports are added to the nodes port list.
 */
export function createPortDescriptors(nodes: Iterable<INode>, graph?: IGraph): void {
  for (const node of nodes) {
    const portDescriptors = createPortDescriptorsForNode(node)
    const model = new FreeNodePortLocationModel()
    const ports: IPort[] = []

    // iterate through all descriptors and add their ports, using the descriptor as the tag for the port
    for (const descriptor of portDescriptors) {
      // use the descriptor's location as offset
      const portLocationModelParameter = model.createParameter(
        node,
        new Point(descriptor.x, descriptor.y)
      )
      const port = graph
        ? graph.addPort(node, portLocationModelParameter)
        : new SimplePort(node, portLocationModelParameter)
      port.tag = descriptor
      if (!graph) {
        ports.push(port)
      }
    }

    if (!graph && node instanceof SimpleNode) {
      node.ports = new ListEnumerable(ports)
    }
  }
}

/**
 * Creates a list of all edges belonging to the type of the node as specified by its logic gate type.
 * @param node The given node
 */
function createPortDescriptorsForNode(node: INode): List<PortDescriptor> {
  const layout = node.layout
  const width = layout.width
  const height = layout.height
  const ports = new List<PortDescriptor>()
  const style = node.style as GateNodeStyle
  switch (style.gateType) {
    default:
    case LogicGateType.AND:
    case LogicGateType.NAND:
    case LogicGateType.OR:
    case LogicGateType.NOR:
    case LogicGateType.XOR:
    case LogicGateType.XNOR: {
      ports.add({ x: width, y: height * 0.5, direction: EdgeDirection.OUT })
      ports.add({ x: 0, y: height * 0.25, direction: EdgeDirection.IN })
      ports.add({ x: 0, y: height * 0.75, direction: EdgeDirection.IN })
      return ports
    }
    case LogicGateType.NOT: {
      ports.add({ x: width, y: height * 0.5, direction: EdgeDirection.OUT })
      ports.add({ x: 0, y: height * 0.5, direction: EdgeDirection.IN })
      return ports
    }
  }
}
