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
import { Simulator } from './Simulator.js'

/**
 * Represents a connection in the network.
 */
export class Connection {
  /**
   * Creates a new instance.
   * @param {!Device} sender The sending device.
   * @param {!Device} receiver The receiving device.
   */
  constructor(sender, receiver) {
    this.receiver = receiver
    this.sender = sender
    this.sender = sender
    this.receiver = receiver
  }

  /**
   * The load of this connection.
   * Load is a value between 0 and 1 that indicates how utilized the connection is (with 0 being
   * not at all and 1 being fully). Load also factors into the failure probability of connections
   * in the {@link Simulator}.
   */
  load = 0

  /**
   * Gets a value indicating whether this connection is enabled.
   * A connection is enabled if and only if its attached devices are enabled and have not failed.
   * @type {boolean}
   */
  get enabled() {
    const isSenderWorking = this.sender.enabled && !this.sender.failed
    const isReceiverWorking = this.receiver.enabled && !this.receiver.failed
    return isSenderWorking && isReceiverWorking
  }

  #failed = false

  /**
   * Gets a value indicating whether this connection has failed.
   * @type {boolean}
   */
  get failed() {
    return this.#failed
  }

  fail() {
    this.#failed = true
  }

  repair() {
    this.#failed = false
  }

  /**
   * Value indicating whether this connection is delivering a packet in forward direction.
   */
  hasForwardPacket = false

  /**
   * Value indicating whether this connection is delivering a packet in backwards direction.
   */
  hasBackwardPacket = false
}
