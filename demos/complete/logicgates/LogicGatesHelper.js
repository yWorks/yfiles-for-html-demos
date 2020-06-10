/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Enum,
  IInputModeContext,
  INode,
  IPortCandidate,
  IPortCandidateProvider,
  List,
  PortCandidateValidity
} from 'yfiles'

/**
 * Defines the types of logic gates.
 */
export const LogicGateType = Enum('LogicGateType', {
  AND: 0,
  NAND: 1,
  NOT: 2,
  OR: 3,
  NOR: 4,
  XOR: 5,
  XNOR: 6
})

/**
 * Defines the edge direction.
 */
export const EdgeDirection = Enum('EdgeDirection', {
  IN: 0,
  OUT: 1
})

/**
 * Provides all available ports of the given graph with the specified edge direction.
 */
export class DescriptorDependentPortCandidateProvider extends BaseClass(IPortCandidateProvider) {
  /**
   * Creates a new instance of DescriptorDependentPortCandidateProvider.
   * @param {INode} node
   */
  constructor(node) {
    super()
    this.node = node
  }

  /**
   * Returns all port candidates that apply for the provided opposite port candidate.
   * @param {IInputModeContext} context The context for which the candidates should be provided
   * @param {IPortCandidate} target The opposite port candidate
   * @return {IListEnumerable}
   */
  getSourcePortCandidates(context, target) {
    return this.getPortCandidatesForDirection(EdgeDirection.OUT)
  }

  /**
   * Returns all port candidates that apply for the provided opposite port candidate.
   * @param {IInputModeContext} context The context for which the candidates should be provided
   * @param {IPortCandidate} source The opposite port candidate
   * @return {IListEnumerable}
   */
  getTargetPortCandidates(context, source) {
    return this.getPortCandidatesForDirection(EdgeDirection.IN)
  }

  /**
   * Returns all source port candidates that belong to the context of this provider.
   * @param {IInputModeContext} context The context for which the candidates should be provided
   * @return {IListEnumerable}
   */
  getAllSourcePortCandidates(context) {
    return this.getPortCandidatesForDirection(EdgeDirection.OUT)
  }

  /**
   * Returns all target port candidates that belong to the context of this provider.
   * @param {IInputModeContext} context The context for which the candidates should be provided
   * @return {IListEnumerable}
   */
  getAllTargetPortCandidates(context) {
    return this.getPortCandidatesForDirection(EdgeDirection.IN)
  }

  /**
   * Returns the suitable candidates based on the specified edge direction.
   * @param {number} direction The direction of the edge
   * @return {List}
   */
  getPortCandidatesForDirection(direction) {
    const candidates = new List()
    // iterate over all available ports
    this.node.ports.forEach(port => {
      // create a port candidate, invalidate it (so it is visible but not usable)
      const candidate = new DefaultPortCandidate(port)
      candidate.validity = PortCandidateValidity.INVALID

      // get the port descriptor
      const portDescriptor = port.tag
      // make the candidate valid if the direction is the same as the one supplied
      if (portDescriptor !== null && portDescriptor.direction === direction) {
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
  /**
   * Creates a new PortDescriptor instance.
   * @param {number} x The relative x coordinate of the port
   * @param {number} y The relative y coordinate of the port
   * @param {number} direction The direction of the port
   */
  constructor(x, y, direction) {
    this.x = x
    this.y = y
    this.direction = direction
  }

  /**
   * Creates a list of all edges belonging to the type of the node as specified by its logic gate type.
   * @param {INode} node The given node
   * @return {List}
   */
  static createPortDescriptors(node) {
    const layout = node.layout
    const width = layout.width
    const height = layout.height
    const ports = new List()
    switch (node.style.gateType) {
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
