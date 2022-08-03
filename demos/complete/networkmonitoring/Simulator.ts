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
import Device, { DeviceKind } from './Device'
import Network from './Network'
import Connection from './Connection'

/**
 * A simple simulator that sends packets through the network.
 */
export default class Simulator {
  private readonly failedListeners: ((sender: this, args: Device | Connection) => void)[] = []

  // The number of new packets that should be created per tick.
  private static readonly NEW_PACKETS_PER_TICK = 5

  // The probability that a device or connection fails.
  private static readonly FAILURE_PROBABILITY = 0.001

  // The number of past ticks to consider when calculating the load of devices and connections.
  private static readonly HISTORY_SIZE = 23

  // Current timestamp of the simulation.
  private time = 0

  // List of packets in the past that are no longer active, but still need to be retained for
  // calculating the load of nodes and edges.
  private historicalPackets: Packet[] = []

  // List of active packets that are currently moving around the network.
  private activePackets: Packet[] = []

  /**
   * Indicates whether random failures of devices and connections should happen.
   */
  failuresEnabled = false

  /**
   * Initializes a new instance of the {@link Simulator} class to operate on the given {@link Network}.
   * @param network The network model to simulate.
   */
  constructor(public readonly network: Network) {}

  /**
   * Adds a listener for failed events.
   */
  addFailedListener(listener: (sender: this, args: Device | Connection) => void): void {
    this.failedListeners.push(listener)
  }

  /**
   * Removes a listener for failed events.
   */
  removeFailedListener(listener: (sender: this, args: Device | Connection) => void): void {
    const index = this.failedListeners.indexOf(listener)
    if (index >= 0) {
      this.failedListeners.splice(index, 1)
    }
  }

  /**
   * Performs one step in the simulation.
   * Packets move one device per tick. Every tick a number of new packets are created.
   */
  tick(): void {
    if (this.failuresEnabled) {
      this.breakThings()
    }

    // reset packet-related properties on the connections
    this.activePackets.forEach(packet => {
      packet.connection.hasForwardPacket = false
      packet.connection.hasBackwardPacket = false
    })

    this.pruneOldPackets()
    this.movePackets()
    this.updateLoads()

    this.createPackets()

    this.activePackets.forEach(packet => {
      const connection = packet.connection
      connection.hasForwardPacket =
        connection.hasForwardPacket || packet.sender === connection.sender
      connection.hasBackwardPacket =
        connection.hasBackwardPacket || packet.sender === connection.receiver
    })

    this.time++
  }

  /**
   * Determines for every connection and device whether it should fail and does so, if necessary.
   */
  private breakThings(): void {
    const itemsThatCanBreak = [...this.network.devices, ...this.network.connections].filter(
      item => !item.failed
    )

    const itemsThatShouldBreak = itemsThatCanBreak
      .filter(item => Math.random() < Simulator.FAILURE_PROBABILITY * (item.load + 0.1))
      .slice(0, 3)

    itemsThatShouldBreak.forEach(item => {
      item.failed = true
      this.onFailed(item)
    })
  }

  /**
   * Creates new packets.
   * Packets are only sent from laptops, workstations, smartphones and tablets.
   * @see {@link Device.canSendPackets}
   */
  createPackets(): void {
    // Find all connections that are still enabled and unbroken. Connections are automatically
    // disabled if either endpoint is disabled or broken.
    const enabledConnections = this.network.connections.filter(
      connection => connection.enabled && !connection.failed
    )

    // Restrict them to those edges that are adjacent to a node that can send packets.
    const eligibleConnections = enabledConnections.filter(
      connection => connection.sender.canSendPackets() || connection.receiver.canSendPackets()
    )

    // Pick a number of those edges at random
    const selectedConnections = shuffle(eligibleConnections).slice(
      0,
      Simulator.NEW_PACKETS_PER_TICK + 1
    )

    const packets = selectedConnections.map(connection => {
      const sender = connection.sender.canSendPackets() ? connection.sender : connection.receiver
      const receiver = connection.sender.canSendPackets() ? connection.receiver : connection.sender
      return this.createPacket(sender, receiver, connection)
    })

    this.activePackets.push(...packets)
  }

  /**
   * Moves the active packets around the network according to certain rules.
   * Packets move freely and randomly within the network until they arrive at a non-switch, non-WiFi device.
   * Servers and databases always bounce back a new packet when they receive one, while client devices
   * simply receive packets and maybe spawn new ones in {@link Simulator.createPackets}.
   * @see {@link NetworkSimulator.createPackets}
   * @see {@link Device.canConnectTo}
   */
  movePackets(): void {
    // Find packets that need to be considered for moving.
    // This excludes packets that end in a disabled or broken device or that travel along a now-broken connection.
    // We don't care whether the source is alive or not by now.
    const packetsToMove = this.activePackets.filter(packet => {
      const isConnectionWorking = packet.connection.enabled && !packet.connection.failed
      const isReceiverWorking = packet.receiver.enabled && !packet.receiver.failed
      return isConnectionWorking && isReceiverWorking
    })

    // Packets that arrive at servers or databases. They result in a reply packet.
    const replyPackets = packetsToMove.filter(packet => {
      const isSenderWorking = packet.sender.enabled && !packet.sender.failed
      const doReceiverReply =
        packet.receiver.kind === DeviceKind.SERVER || packet.receiver.kind === DeviceKind.DATABASE
      return isSenderWorking && doReceiverReply
    })

    // All other packets that just move on to their next destination.
    const movingPackets = packetsToMove.filter(packet => !packet.receiver.canReceivePackets())

    // All packets have to be moved to the history list. We create new ones appropriately.
    this.historicalPackets.push(...this.activePackets)
    this.activePackets = []

    movingPackets.forEach(packet => {
      const origin = packet.sender
      const currentConnection = packet.connection

      // We start from the old device of the packet
      const startDevice = packet.receiver

      // Try finding a random connection to follow ...
      const possiblePathConnections = this.network
        .getAdjacentConnections(startDevice)
        .filter(connection => connection !== currentConnection)
        .filter(connection => {
          const oppositeDevice =
            connection.sender === startDevice ? connection.receiver : connection.sender
          return origin.canConnectTo(oppositeDevice)
        })
        .filter(connection => connection.enabled && !connection.failed)

      if (possiblePathConnections.length > 0) {
        const connection = shuffle(possiblePathConnections)[0]

        const oppositeDevice =
          connection.sender === startDevice ? connection.receiver : connection.sender

        const newPacket = this.createPacket(startDevice, oppositeDevice, connection)
        this.activePackets.push(newPacket)
      }
    })

    replyPackets.forEach(packet => {
      // We just bounce a new packet on the same edge, but in reverse direction.
      this.activePackets.push(this.createPacket(packet.receiver, packet.sender, packet.connection))
    })
  }

  /**
   * Removes packets from the history that are no longer considered for connection or device load.
   * @see {@link NetworkSimulator.HISTORY_SIZE}
   */
  pruneOldPackets(): void {
    this.historicalPackets = this.historicalPackets.filter(
      packet => packet.time >= this.time - Simulator.HISTORY_SIZE
    )
  }

  /**
   * Updates load of devices and connections based on traffic in the network.
   * The criteria are perhaps a bit arbitrary here. Connection load is defined as the number of
   * timestamps in the history that this connection transmitted a packet. Device load is the number
   * of packets involving this devices adjusted by the number of adjacent connections.
   */
  updateLoads(): void {
    const history = [...this.activePackets, ...this.historicalPackets]

    // update connection loads
    this.network.connections.forEach(connection => {
      const timestamps = history
        .filter(packet => packet.connection === connection)
        .map(packet => packet.time)
      const numberOfHistoryPackets = new Set(timestamps).size
      connection.load = Math.min(1, numberOfHistoryPackets / Simulator.HISTORY_SIZE)
    })

    // update device loads
    this.network.devices.forEach(device => {
      const timestamps = history.filter(
        packet => packet.sender === device || packet.receiver === device
      )
      const numberOfHistoryPackets = new Set(timestamps).size
      device.load = Math.min(
        1,
        numberOfHistoryPackets /
          Simulator.HISTORY_SIZE /
          this.network.getAdjacentConnections(device).length
      )
    })
  }

  /**
   * Creates a single packet with the appropriate timestamp.
   * @param sender The sender of the packet.
   * @param receiver The receiver of the packet.
   * @param connection The connection on which the packet travels.
   * @return The newly-created packet.
   */
  createPacket(sender: Device, receiver: Device, connection: Connection): Packet {
    return new Packet(sender, receiver, connection, this.time)
  }

  /**
   * Notifies all registered listeners when something failed.
   */
  onFailed(item: Device | Connection): void {
    for (const listener of this.failedListeners) {
      listener(this, item)
    }
  }
}

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 */
function shuffle<T>(array: Array<T>): Array<T> {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * Simple data structure to model a packet moving through the network.
 */
class Packet {
  constructor(
    public sender: Device,
    public receiver: Device,
    public connection: Connection,
    public time: number
  ) {}
}
