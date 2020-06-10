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
import { BaseClass, delegate, IPropertyObservable, PropertyChangedEventArgs } from 'yfiles'

/**
 * Class representing a node in the network model.
 */
export default class ModelNode extends BaseClass(IPropertyObservable) {
  /**
   * Builds a new node for the network model.
   */
  constructor() {
    super()
    this.$propertyChangedEvent = null
    this.$enabled = false
    this.$failed = false
    this.$load = 0
    // initialize the load history with zeroes
    this.$loadHistory = []
    for (let i = 0; i < ModelNode.LOAD_HISTORY_SIZE; i++) {
      this.$loadHistory.push(0)
    }
    this.$name = null
    this.$ip = null
    this.$type = 0
  }

  /**
   * Cache size of the workload history.
   * @type {number}
   */
  static get LOAD_HISTORY_SIZE() {
    return 15
  }

  /**
   * Sets a value indicating whether this node is enabled. Disabled nodes are turned off and
   * cannot send or receive packets.
   * @type {boolean}
   */
  set enabled(value) {
    this.$enabled = value
    this.onPropertyChanged('Enabled')
  }

  /**
   * Gets a value indicating whether this node is enabled. Disabled nodes are turned off and
   * cannot send or receive packets.
   * @type {boolean}
   */
  get enabled() {
    return this.$enabled
  }

  /**
   * Sets a value indicating whether this node failed. A failed node has to be repaired before it
   * can send or receive packets again.
   * The actual result for {@link ModelNode#enabled} and {@link ModelNode#failed} is essentially the same, just the
   * interaction and graphical appearance in the demo changes.
   * @type {boolean}
   */
  set failed(value) {
    this.$failed = value
    this.onPropertyChanged('Failed')
  }

  /**
   * Gets a value indicating whether this node failed. A failed node has to be repaired before it
   * can send or receive packets again.
   * The actual result for {@link ModelNode#enabled} and {@link ModelNode#failed} is essentially the same, just the
   * interaction and graphical appearance in the demo changes.
   * @type {boolean}
   */
  get failed() {
    return this.$failed
  }

  /**
   * Sets the load of this node.
   * Load is a value between 0 and 1 that indicates how utilized the node is (with 0 being not at all and 1
   * being fully). Load also factors into the failure probability of nodes in the
   * {@link NetworkSimulator}.
   * @type {number}
   */
  set load(value) {
    this.$load = value
    this.addToLoadHistory(value)
    this.onPropertyChanged('Load')
  }

  /**
   * Gets the load of this node.
   * Load is a value between 0 and 1 that indicates how utilized the node is (with 0 being not at all and 1
   * being fully). Load also factors into the failure probability of nodes in the
   * {@link NetworkSimulator}.
   * @type {number}
   */
  get load() {
    return this.$load
  }

  /**
   * Gets the previous load values for this node.
   * The array contains previous workload values.
   * @type {Array}
   */
  get loadHistory() {
    return this.$loadHistory
  }

  /**
   * Sets the name of this node.
   * @type {string}
   */
  set name(value) {
    this.$name = value
  }

  /**
   * Gets the name of this node.
   * @type {string}
   */
  get name() {
    return this.$name
  }

  /**
   * Sets the IP address of this node.
   * @type {string}
   */
  set ip(value) {
    this.$ip = value
  }

  /**
   * Gets the IP address of this node.
   * @type {string}
   */
  get ip() {
    return this.$ip
  }

  /**
   * Sets the type of the node.
   * @type {number}
   */
  set type(value) {
    this.$type = value
  }

  /**
   * Gets the type of the node.
   * @type {number}
   */
  get type() {
    return this.$type
  }

  /**
   * Sets the property changed event.
   * @type {function(Object, PropertyChangedEventArgs)}
   */
  set propertyChangedEvent(value) {
    this.$propertyChangedEvent = value
  }

  /**
   * Gets the property changed event.
   */
  get propertyChangedEvent() {
    return this.$propertyChangedEvent
  }

  /**
   * Event handler for changes of node properties.
   * @param {function(object, PropertyChangedEventArgs)} listener
   */
  addPropertyChangedListener(listener) {
    this.propertyChangedEvent = delegate.combine(this.propertyChangedEvent, listener)
  }

  /**
   * Event handler for changes of node properties.
   * @param {function(object, PropertyChangedEventArgs)} listener
   */
  removePropertyChangedListener(listener) {
    this.propertyChangedEvent = delegate.remove(this.propertyChangedEvent, listener)
  }

  /**
   * Adds the given load value to the load history.
   * @param {number} load
   */
  addToLoadHistory(load) {
    this.loadHistory.push(load)
    this.loadHistory.shift()
  }

  /**
   * Called when the node status or load changes.
   * @param {string} propertyName
   */
  onPropertyChanged(propertyName) {
    const handler = this.propertyChangedEvent
    if (handler !== null) {
      handler(this, new PropertyChangedEventArgs(propertyName))
    }
  }

  // The following properties are strictly view model properties. They are just in here to simplify the
  // In a real application they wouldn't be in the model.
  /**
   * Determines whether this node can send packets.
   * By definition in our model, neither switches nor WiFi access points can send packets; they just relay them.
   * Servers and databases won't send packets without receiving one first.
   * @return {boolean} <code>true</code> if the node is not a switch or access point, <code>false</code> otherwise.
   */
  canSendPackets() {
    switch (this.type) {
      case ModelNode.SWITCH:
      case ModelNode.WLAN:
      case ModelNode.SERVER:
      case ModelNode.DATABASE:
        return false
      default:
        return true
    }
  }

  /**
   * Determines whether this node can receive packets.
   * By definition in our model, switches and WiFi access points only relay packets. Everything else can receive them.
   * @return {boolean} <code>true</code> if the node is not a switch or access point, <code>false</code> otherwise.
   */
  canReceivePackets() {
    switch (this.type) {
      case ModelNode.WORKSTATION:
      case ModelNode.LAPTOP:
      case ModelNode.SMARTPHONE:
      case ModelNode.SERVER:
      case ModelNode.DATABASE:
        return true
      default:
        return false
    }
  }

  /**
   * Determines whether a packet may take a certain connection to a given node type, coming
   * from a certain type of node.
   *
   * To make the simulation a bit nicer to watch, we establish a few arbitrary rules here. Packets are not
   * allowed to visit the same sort of node directly after moving through a switch. For this purpose all
   * client types of nodes are considered equal (laptop, workstation, smartphone). Traffic in
   * between relay nodes, i.e. switch and WiFi access points is always permitted.
   *
   * This means that the following exemplary packet paths are never considered:
   * <ul>
   *   <li>Server ? Switch ? Server</li>
   *   <li>Laptop ? WiFi ? Workstation</li>
   *   <li>Workstation ? Switch ? Smartphone</li>
   * </ul>
   * @param {ModelNode} targetNode The candidate target node's type.
   * @return {boolean}
   * <code>true</code> if the packet could travel to the target node according to the described rules,
   * <code>false</code> otherwise.
   */
  canConnectTo(targetNode) {
    if (this.type === ModelNode.SWITCH || targetNode.type === ModelNode.SWITCH) {
      return true
    }

    const clientTypes = new Set()
    if (!clientTypes.has(ModelNode.LAPTOP)) {
      clientTypes.add(ModelNode.LAPTOP)
    }
    if (!clientTypes.has(ModelNode.SMARTPHONE)) {
      clientTypes.add(ModelNode.SMARTPHONE)
    }
    if (!clientTypes.has(ModelNode.WORKSTATION)) {
      clientTypes.add(ModelNode.WORKSTATION)
    }

    if (clientTypes.has(this.type)) {
      return !clientTypes.has(targetNode.type)
    }

    return this !== targetNode
  }

  /**
   * Static field for a node that represents a workstation.
   * @return {number}
   */
  static get WORKSTATION() {
    return 1
  }

  /**
   * Static field for a node that represents a laptop.
   * @return {number}
   */
  static get LAPTOP() {
    return 2
  }

  /**
   * Static field for a node that represents a smartphone.
   * @return {number}
   */
  static get SMARTPHONE() {
    return 3
  }

  /**
   * Static field for a node that represents a switch.
   * @return {number}
   */
  static get SWITCH() {
    return 4
  }

  /**
   * Static field for a node that represents a wlan.
   * @return {number}
   */
  static get WLAN() {
    return 5
  }

  /**
   * Static field for a node that represents a server.
   * @return {number}
   */
  static get SERVER() {
    return 6
  }

  /**
   * Static field for a node that represents a database.
   * @return {number}
   */
  static get DATABASE() {
    return 7
  }
}
