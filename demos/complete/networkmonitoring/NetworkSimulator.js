/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-component', 'ModelNode.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  ModelNode
) => {
  /**
   * A simple simulator that sends packets through the network model.
   */
  class NetworkSimulator {
    /**
     * Initializes a new instance of the {@link NetworkSimulator} class to operate on the given {@link NetworkModel}.
     * @param {NetworkModel} model The network model to simulate.
     */
    constructor(model) {
      this.initNetworkSimulator()
      this.$model = model
      this.$somethingFailedEvent = null
      this.$failuresEnabled = false
      this.$time = 0
    }

    /**
     * The number of new packets that should be created per tick.
     * @return {number}
     */
    static get NEW_PACKETS_PER_TICK() {
      return 5
    }

    /**
     * The probability that a node or edge fails.
     * @return {number}
     */
    static get FAILURE_PROBABILITY() {
      return 0.001
    }

    /**
     * The number of past ticks to consider when calculating the load of nodes and edges.
     * @return {number}
     */
    static get HISTORY_SIZE() {
      return 23
    }

    /** @type {function(Object, PropertyChangedEventArgs)} */
    set somethingFailedEvent(value) {
      this.$somethingFailedEvent = value
    }

    /** @type {function(Object, PropertyChangedEventArgs)} */
    get somethingFailedEvent() {
      return this.$somethingFailedEvent
    }

    /** @type {number} */
    set time(value) {
      this.$time = value
    }

    /** @type {number} */
    get time() {
      return this.$time
    }

    /**
     * Event handler for network failures.
     * @param {function(Object, PropertyChangedEventArgs)} value
     */
    addSomethingFailedListener(value) {
      this.somethingFailedEvent = yfiles.lang.delegate.combine(this.somethingFailedEvent, value)
    }

    /**
     * Event handler for network failures.
     * @param {function(Object, PropertyChangedEventArgs)} value
     */
    removeSomethingFailedListener(value) {
      this.somethingFailedEvent = yfiles.lang.delegate.remove(this.somethingFailedEvent, value)
    }

    /**
     * Gets the network model to simulate.
     * @type {NetworkModel}
     */
    get model() {
      return this.$model
    }

    /**
     * Sets the network model to simulate.
     * @type {NetworkModel}
     */
    set model(value) {
      this.$model = value
    }

    /**
     * Sets a value indicating whether random failures of nodes and edges should happen.
     * @type {boolean}
     */
    set failuresEnabled(value) {
      this.$failuresEnabled = value
    }

    /**
     * Gets a value indicating whether random failures of nodes and edges should happen.
     * @type {boolean}
     */
    get failuresEnabled() {
      return this.$failuresEnabled
    }

    /**
     * Performs one step in the simulation.
     * Packets move one node per tick. Every tick a number of new packets are created.
     */
    tick() {
      if (this.failuresEnabled) {
        this.breakThings()
      }

      // Reset packet-related properties on the edges
      this.activePackets.forEach(packet => {
        packet.edge.hasForwardPacket = false
        packet.edge.hasBackwardPacket = false
      })

      this.pruneOldPackets()
      this.movePackets()
      this.updateLoads()

      this.createPackets()

      this.activePackets.forEach(packet => {
        const edge = packet.edge
        edge.hasForwardPacket |= packet.start === edge.source
        edge.hasBackwardPacket |= packet.start === edge.target
      })

      this.time++
    }

    /**
     * Determines for every edge and node whether it should fail and does so, if necessary.
     */
    breakThings() {
      const thingsThatCanBreak = []
      this.model.nodes.forEach(node => {
        if (!node.failed) {
          thingsThatCanBreak.push(node)
        }
      })
      this.model.edges.forEach(edge => {
        if (!edge.failed) {
          thingsThatCanBreak.push(edge)
        }
      })
      let c = 0
      for (let i = 0; i < thingsThatCanBreak.length && c < 2; i++) {
        const thing = thingsThatCanBreak[i]
        if (Math.random() < NetworkSimulator.FAILURE_PROBABILITY * (thing.load + 0.1)) {
          thing.failed = true
          this.onSomethingFailed(thing)
          c++
        }
      }
    }

    /**
     * Creates new packets.
     * Packets are only sent from laptops, workstations, smartphones and tablets.
     * @see {@link ModelNode#canSendPackets}
     */
    createPackets() {
      // Find all edges that are still enabled and unbroken. Edges are automatically disabled if either endpoint is
      // disabled or broken. Restrict them to those edges that are adjacent to a node that can send packets.
      const eligibleEdges = new yfiles.collections.List()
      this.$model.edges.forEach(e => {
        if (e.enabled && !e.failed && (e.source.canSendPackets() || e.target.canSendPackets())) {
          eligibleEdges.add(e)
        }
      })

      // Pick a number of those edges at random
      const selectedEdges = new yfiles.collections.List()
      for (let i = 0; i < eligibleEdges.size && i < NetworkSimulator.NEW_PACKETS_PER_TICK; i++) {
        const k = (Math.random() * eligibleEdges.size) | 0
        selectedEdges.add(eligibleEdges.get(k))
        eligibleEdges.removeAt(k)
      }

      const packets = new yfiles.collections.List()
      selectedEdges.forEach(edge => {
        const startNode = edge.source.canSendPackets() ? edge.source : edge.target
        const endNode = edge.source.canSendPackets() ? edge.target : edge.source
        packets.add(this.createPacket(startNode, endNode, edge))
      })

      this.activePackets.addRange(packets)
    }

    /**
     * Moves the active packets around the network according to certain rules.
     * Packets move freely and randomly within the network until they arrive at a non-switch, non-WiFi node.
     * Servers and databases always bounce back a new packet when they receive one, while �client� nodes
     * simply receive packets and maybe spawn new ones in {@link NetworkSimulator#createPackets}.
     * @see {@link NetworkSimulator#createPackets}
     * @see {@link ModelNode#canConnectTo}
     */
    movePackets() {
      // Find packets that need to be considered for moving.
      // This excludes packets that end in a disabled or broken node or that travel along a now-broken edge.
      // We don't care whether the source is alive or not by now.

      const packetsToMove = new yfiles.collections.List()
      this.activePackets.forEach(p => {
        if (p.edge.enabled && !p.edge.failed && p.end.enabled && !p.end.failed) {
          packetsToMove.add(p)
        }
      })

      // Packets that arrive at servers or databases. They result in a reply packet.
      const replyPackets = new yfiles.collections.List()
      packetsToMove.forEach(p => {
        if (
          (p.end.type === ModelNode.SERVER || p.end.type === ModelNode.DATABASE) &&
          p.start.enabled &&
          !p.start.failed
        ) {
          replyPackets.add(p)
        }
      })

      // All other packets that just move on to their next destination.
      const movingPackets = new yfiles.collections.List()
      packetsToMove.forEach(p => {
        if (!p.end.canReceivePackets()) {
          movingPackets.add(p)
        }
      })

      // All packets have to be moved to the history list. We create new ones appropriately.
      this.historicalPackets.addRange(this.activePackets)
      this.activePackets.clear()

      movingPackets.forEach(packet => {
        const origin = packet.start
        const currentEdge = packet.edge

        // We start from the old target of the packet
        const startNode = packet.end

        // Try finding a random edge to follow ...
        const adjacentEdges = this.model.getAdjacentEdges(startNode)
        const possiblePathEdges = new yfiles.collections.List()
        adjacentEdges.forEach(e => {
          const edgeTarget = e.source === startNode ? e.target : e.source
          if (e !== currentEdge && origin.canConnectTo(edgeTarget) && e.enabled && !e.failed) {
            possiblePathEdges.add(e)
          }
        })
        let /** @type {ModelEdge} */ edge
        if (possiblePathEdges.size > 0) {
          const i = (Math.random() * possiblePathEdges.size) | 0
          edge = possiblePathEdges.get(i)
          const endNode = edge.source === startNode ? edge.target : edge.source

          const newPacket = this.createPacket(startNode, endNode, edge)
          this.activePackets.add(newPacket)
        }
      })

      replyPackets.forEach(packet => {
        this.activePackets.add(this.createPacket(packet.end, packet.start, packet.edge))
      })
    }

    /**
     * Removes packets from the history that are no longer considered for edge or node load.
     * @see {@link NetworkSimulator#HISTORY_SIZE}
     */
    pruneOldPackets() {
      for (let i = this.historicalPackets.size - 1; i >= 0; i--) {
        const p = this.historicalPackets.get(i)
        if (p.time < this.time - NetworkSimulator.HISTORY_SIZE) {
          this.historicalPackets.removeAt(i)
        }
      }
    }

    /**
     * Updates load of nodes and edges based on traffic in the network.
     * The criteria are perhaps a bit arbitrary here. Edge load is defined as the number of timestamps in the
     * history that this edge transmitted a packet. Node load is the number of packets involving this node
     * adjusted by the number of adjacent edges.
     */
    updateLoads() {
      const history = new yfiles.collections.List()
      history.addRange(this.activePackets)
      history.addRange(this.historicalPackets)

      this.model.edges.forEach(edge => {
        const set = new Set()
        history.forEach(
          /** Packet */ packet => {
            if (packet.edge === edge) {
              if (!set.has(packet.time)) {
                set.add(packet.time)
              }
            }
          }
        )
        const numberOfHistoryPackets = set.size
        edge.load = Math.min(1, numberOfHistoryPackets / NetworkSimulator.HISTORY_SIZE)
      })

      this.model.nodes.forEach(node => {
        const set = new Set()
        history.forEach(packet => {
          if (packet.start === node || packet.end === node) {
            if (!set.has(packet)) {
              set.add(packet)
            }
          }
        })
        const numberOfHistoryPackets = set.size
        node.load = Math.min(
          1,
          numberOfHistoryPackets /
            NetworkSimulator.HISTORY_SIZE /
            this.model.getAdjacentEdges(node).size
        )
      })
    }

    /**
     * Convenience method to create a single packet with the appropriate timestamp.
     * @param {ModelNode} startNode The start node of the packet.
     * @param {ModelNode} endNode The end node of the packet.
     * @param {ModelEdge} edge The edge on which the packet travels.
     * @return {Packet} The newly-created packet.
     */
    createPacket(startNode, endNode, edge) {
      const newPacket = new Packet()
      newPacket.start = startNode
      newPacket.end = endNode
      newPacket.edge = edge
      newPacket.time = this.time
      return newPacket
    }

    /**
     * Called when something fails.
     * @param {Object} sender
     */
    onSomethingFailed(sender) {
      const handler = this.somethingFailedEvent
      if (handler !== null) {
        handler(sender, new yfiles.lang.EventArgs())
      }
    }

    initNetworkSimulator() {
      this.historicalPackets = new yfiles.collections.List()
      this.activePackets = new yfiles.collections.List()
    }
  }

  /**
   * Simple data structure to model a packet moving through the network.
   */
  class Packet {
    constructor() {
      this.$time = 0
      this.$start = null
      this.$end = null
      this.$edge = null
    }

    /** @type {number} */
    get time() {
      return this.$time
    }

    /** @type {number} */
    set time(value) {
      this.$time = value
    }

    /** @type {ModelNode} */
    get start() {
      return this.$start
    }

    /** @type {ModelNode} */
    set start(value) {
      this.$start = value
    }

    /** @type {ModelNode} */
    get end() {
      return this.$end
    }

    /** @type {ModelNode} */
    set end(value) {
      this.$end = value
    }

    /** @type {ModelEdge} */
    get edge() {
      return this.$edge
    }

    /** @type {ModelEdge} */
    set edge(value) {
      this.$edge = value
    }
  }

  return NetworkSimulator
})
