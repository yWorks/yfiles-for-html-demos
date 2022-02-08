/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultPortCandidate,
  IInputModeContext,
  INode,
  IPortCandidate,
  IPortCandidateProvider,
  List,
  PortCandidateValidity,
  IEnumerable
} from 'yfiles'
import { GateNodeStyle } from './DemoStyles'

export enum LogicGateType {
  AND = 0,
  NAND = 1,
  NOT = 2,
  OR = 3,
  NOR = 4,
  XOR = 5,
  XNOR = 6
}
export enum EdgeDirection {
  IN = 0,
  OUT = 1
}

/**
 * Provides all available ports of the given graph with the specified edge direction.
 */
export class DescriptorDependentPortCandidateProvider
  extends BaseClass<IPortCandidateProvider>(IPortCandidateProvider)
  implements IPortCandidateProvider
{
  private readonly node: INode

  /**
   * Creates a new instance of DescriptorDependentPortCandidateProvider.
   */
  constructor(node: INode) {
    super()
    this.node = node
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
    this.node.ports.forEach(port => {
      // create a port candidate, invalidate it (so it is visible but not usable)
      const candidate = new DefaultPortCandidate(port)
      candidate.validity = PortCandidateValidity.INVALID

      // get the port descriptor
      const portDescriptor = port.tag
      // make the candidate valid if the direction is the same as the one supplied
      if (portDescriptor && portDescriptor.direction === direction) {
        candidate.validity = PortCandidateValidity.VALID
      }
      // add the candidate to the list
      candidates.add(candidate)
    })
    // and return the list
    return candidates
  }
}

/**
 * Helper class that describes properties that are necessary to create port candidates in this demo.
 */
export class PortDescriptor {
  readonly x: number
  readonly y: number
  readonly direction: number

  /**
   * Creates a new PortDescriptor instance.
   * @param x The relative x coordinate of the port
   * @param y The relative y coordinate of the port
   * @param direction The direction of the port
   */
  constructor(x: number, y: number, direction: number) {
    this.x = x
    this.y = y
    this.direction = direction
  }

  /**
   * Creates a list of all edges belonging to the type of the node as specified by its logic gate type.
   * @param node The given node
   */
  static createPortDescriptors(node: INode): List<PortDescriptor> {
    const layout = node.layout
    const width = layout.width
    const height = layout.height
    const ports = new List<PortDescriptor>()
    const style = node.style as GateNodeStyle
    switch (style.gateType) {
      default:
      case LogicGateType.AND:
      case LogicGateType.NAND: {
        ports.add(new PortDescriptor(width, height * 0.5, EdgeDirection.OUT))
        ports.add(new PortDescriptor(0, height * 0.25, EdgeDirection.IN))
        ports.add(new PortDescriptor(0, height * 0.75, EdgeDirection.IN))
        return ports
      }
      case LogicGateType.NOT: {
        ports.add(new PortDescriptor(width, height * 0.5, EdgeDirection.OUT))
        ports.add(new PortDescriptor(0, height * 0.5, EdgeDirection.IN))
        return ports
      }
      case LogicGateType.OR:
      case LogicGateType.NOR:
      case LogicGateType.XOR:
      case LogicGateType.XNOR: {
        ports.add(new PortDescriptor(width, height * 0.5, EdgeDirection.OUT))
        ports.add(new PortDescriptor(0, height * 0.25, EdgeDirection.IN))
        ports.add(new PortDescriptor(0, height * 0.75, EdgeDirection.IN))
        return ports
      }
    }
  }
}
