/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/**
 * The type of network device.
 */
export enum DeviceKind {
  WORKSTATION = 1,
  LAPTOP = 2,
  SMARTPHONE = 3,
  SWITCH = 4,
  WLAN = 5,
  SERVER = 6,
  DATABASE = 7
}

/**
 * Class representing a device in the network.
 */
export class Device {
  // Size of the workload history.
  private static readonly LOAD_HISTORY_SIZE = 15

  /**
   * Builds a new device for the network model.
   */
  constructor() {
    this.loadHistory = Array<number>(Device.LOAD_HISTORY_SIZE).fill(0)
  }

  /**
   * The unique id of the device - used for wiring up connections
   */
  id = 0

  /**
   * The previous load values for this device. Consider this to be read-only.
   */
  loadHistory: number[]

  /**
   * The name of this device.
   */
  name: string | null = null
  /**
   * The IP address of this device.
   */
  ip: string | null = null

  /**
   * The kind of the device.
   */
  kind = DeviceKind.WORKSTATION

  /**
   * Value indicating whether this device is enabled. Disabled devices are turned off and
   * can't send or receive packets.
   */
  enabled = false

  #failed = false

  /**
   * Value indicating whether this device failed. A failed device has to be repaired before
   * it can send or receive packets again.
   * The actual result for {@link enabled} and {@link failed} is essentially the
   * same, just the interaction and graphical appearance in the demo changes.
   */
  get failed(): boolean {
    return this.#failed
  }

  fail(): void {
    this.#failed = true
    this.enabled = false
  }

  repair(): void {
    this.#failed = false
    this.enabled = true
  }

  /**
   * Gets the load of this device.
   * Load is a value between 0 and 1 that indicates how utilized the device is (with 0 being not
   * at all and 1 being fully). Load also factors into the failure probability of devices in the
   * {@link Simulator}.
   */
  get load(): number {
    return this.loadHistory.at(-1)!
  }

  /**
   * Sets the load of this device.
   * Load is a value between 0 and 1 that indicates how utilized the device is (with 0 being not
   * at all and 1 being fully). Load also factors into the failure probability of devices in the
   * {@link Simulator}.
   */
  set load(value: number) {
    this.loadHistory.push(value)
    this.loadHistory.shift()
  }

  /**
   * Determines whether this device can send packets.
   * By definition in our model, neither switches nor Wi-Fi access points can send packets; they
   * just relay them. Servers and databases won't send packets without receiving one first.
   * @returns `true` if the device is not a switch or access point, `false` otherwise.
   */
  canSendPackets(): boolean {
    switch (this.kind) {
      case DeviceKind.SWITCH:
      case DeviceKind.WLAN:
      case DeviceKind.SERVER:
      case DeviceKind.DATABASE:
        return false
      default:
        return true
    }
  }

  /**
   * Determines whether this device can receive packets.
   * By definition in our model, switches and Wi-Fi access points only relay packets. Everything
   * else can receive them.
   * @returns `true` if the device is not a switch or access point, `false` otherwise.
   */
  canReceivePackets(): boolean {
    switch (this.kind) {
      case DeviceKind.WORKSTATION:
      case DeviceKind.LAPTOP:
      case DeviceKind.SMARTPHONE:
      case DeviceKind.SERVER:
      case DeviceKind.DATABASE:
        return true
      default:
        return false
    }
  }

  /**
   * Determines whether a packet may take a certain connection to a given device type, coming
   * from a certain type of device.
   *
   * To make the simulation a bit nicer to watch, we establish a few arbitrary rules here. Packets
   * aren't allowed to visit the same sort of device directly after moving through a switch. For
   * this purpose, all client types of devices are considered equal (laptop, workstation
   * smartphone). Traffic in between relay devices, i.e., switch and Wi-Fi access points is always
   * permitted.
   *
   * This means that the following exemplary packet paths are never considered:
   * - Server &rarr; Switch &rarr; Server
   * - Laptop &rarr; WiFi &rarr; Workstation
   * - Workstation &rarr; Switch &rarr; Smartphone
   *
   * @param targetNode The candidate target device's type.
   * @returns `true` if the packet could travel to the target device according to the
   *   described rules, `false` otherwise.
   */
  canConnectTo(targetNode: Device): boolean {
    if (this.kind === DeviceKind.SWITCH || targetNode.kind === DeviceKind.SWITCH) {
      return true
    }

    const clientTypes = [DeviceKind.LAPTOP, DeviceKind.SMARTPHONE, DeviceKind.WORKSTATION]
    return clientTypes.includes(this.kind)
      ? !clientTypes.includes(targetNode.kind)
      : this !== targetNode
  }
}

/**
 * Converts the given load to a color.
 * @returns A hex encoded color in the form 'hsla(h,s,l,a)'.
 */
export function convertLoadToColor(load: number, alpha: number): string {
  return `hsla(${(1 - load) * 120},80%,50%,${alpha})`
}
