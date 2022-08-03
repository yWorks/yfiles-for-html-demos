/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import Device from './Device.js'
import Connection from './Connection.js'

/**
 * Class modeling the network as a separate graph.
 */
export default class Network {
  /**
   * Initializes a new instance of the {@link Network} class with the given devices and connections.
   * @param {!Array.<Device>} devices The devices in the network.
   * @param {!Array.<Connection>} connections The connections in the network.
   */
  constructor(devices, connections) {
    // The devices in the model.
    this.devices = devices
    // The connections in the model.
    this.connections = connections
  }

  /**
   * Returns the connections having the given device as either sender or receiver.
   * @param {!Device} device The device to find connected connections of.
   * @returns {!Array.<Connection>} The connections that are connected to the device.
   */
  getAdjacentConnections(device) {
    return this.connections.filter(connection => Network.isAdjacentConnection(connection, device))
  }

  /**
   * Checks whether the given connection is adjacent to the given device.
   * @private
   * @param {!Connection} connection
   * @param {!Device} device
   * @returns {boolean}
   */
  static isAdjacentConnection(connection, device) {
    return connection.sender === device || connection.receiver === device
  }

  /**
   * Returns the devices that are neighbors of the given device, that is, devices that are
   * directly connected to the given device via an connection.
   * @param {!Device} device The device to find neighbors of.
   * @returns {!Array.<Device>} The neighboring devices.
   */
  getNeighborDevices(device) {
    return this.getAdjacentConnections(device).map(connection =>
      Network.getOppositeDevice(device, connection)
    )
  }

  /**
   * Returns the device at the opposite side of the connection with respect to the given device.
   * @private
   * @param {!Device} device
   * @param {!Connection} connection
   * @returns {!Device}
   */
  static getOppositeDevice(device, connection) {
    return connection.sender === device ? connection.receiver : connection.sender
  }
}
