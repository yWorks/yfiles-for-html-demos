/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Device } from './Device'
import { Connection } from './Connection'
import type { NetworkData, NodeId } from './network-sample'

/**
 * Models the network of devices and connections.
 */
export class Network {
  onDataUpdated: (() => void) | undefined
  onDeviceFailure: ((item: Device) => void) | undefined
  onConnectionFailure: ((item: Connection) => void) | undefined

  /**
   * Deserializes the object model from some JSON data
   */
  static loadFromJSON(data: NetworkData): Network {
    const idMap = new Map<NodeId, Device>()
    const devices = data.nodeList.map((tag) => {
      const device = new Device()
      device.name = tag.name
      device.ip = tag.ip
      device.enabled = true
      device.kind = tag.type
      device.load = tag.load
      device.id = tag.id

      idMap.set(device.id, device)
      return device
    })

    const connections = data.edgeList.map(
      (edge) => new Connection(idMap.get(edge.source)!, idMap.get(edge.target)!)
    )

    return new Network(devices, connections)
  }

  /**
   * Initializes a new instance of the {@link Network} class with the given devices and connections.
   * @param devices The devices in the network.
   * @param connections The connections in the network.
   */
  constructor(
    readonly devices: Device[],
    readonly connections: Connection[]
  ) {}

  /**
   * Returns the connections having the given device as either sender or receiver.
   * @param device The device to find connected connections of.
   * @returns The connections that are connected to the device.
   */
  getAdjacentConnections(device: Device): Connection[] {
    return this.connections.filter((connection) => Network.isAdjacentConnection(connection, device))
  }

  /**
   * Checks whether the given connection is adjacent to the given device.
   */
  private static isAdjacentConnection(connection: Connection, device: Device): boolean {
    return connection.sender === device || connection.receiver === device
  }
}
