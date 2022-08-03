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
import {
  Animator,
  BaseClass,
  EdgeStyleBase,
  GeneralPath,
  IAnimation,
  IArrow,
  IBend,
  ICanvasContext,
  IEdge,
  IRenderContext,
  Point,
  Rect,
  SvgVisual,
  TimeSpan,
  Visual
} from 'yfiles'
import DeviceStyle from './DeviceStyle'
import Connection from './Connection'

/**
 * An edge style that visualizes the connections of a network.
 * It colors the edge based on the load and renders the animated packet as well as the 'failed'
 * icon.
 */
export default class ConnectionStyle extends EdgeStyleBase {
  /**
   * Initializes the EdgeStyle using the given Animator.
   * @param packetAnimator The animator for the animation of the packages.
   * @param passiveSupported Whether or not the browser supports active and passive event listeners.
   */
  constructor(private packetAnimator: Animator, private passiveSupported: boolean) {
    super()
  }

  /**
   * @see Overrides {@link EdgeStyleBase.createVisual}
   */
  createVisual(context: IRenderContext, edge: IEdge): SvgVisual {
    const container = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // create the edge path
    const connection = edge.tag as Connection
    const pathColor = this.getPathColor(connection)
    const path = this.getPath(edge).createSvgPath()
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', pathColor)
    path.setAttribute('stroke-width', '5')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('class', 'edgePath')
    ;(path as any)['data-color'] = pathColor

    container.appendChild(path)

    // create the element for forward packets
    const forwardPacket = this.createPacketElement()
    forwardPacket.style.setProperty('visibility', 'hidden')
    container.appendChild(forwardPacket)

    // create the element for backward packets
    const backwardPacket = this.createPacketElement()
    backwardPacket.style.setProperty('visibility', 'hidden')
    container.appendChild(backwardPacket)

    // start animations if necessary
    if (connection.hasForwardPacket) {
      const animation = new PacketAnimation(forwardPacket, edge, true)
      this.packetAnimator.allowUserInteraction = true
      this.packetAnimator.animate(animation)
    }
    if (connection.hasBackwardPacket) {
      const animation = new PacketAnimation(backwardPacket, edge, false)
      this.packetAnimator.allowUserInteraction = true
      this.packetAnimator.animate(animation)
    }

    if (connection.failed) {
      path.style.setProperty('cursor', 'pointer')
      // draw failed icon
      this.addExclamationMark(edge, container)
    }
    ;(container as any)['data-failed'] = connection.failed

    return new SvgVisual(container)
  }

  /**
   * @see Overrides {@link EdgeStyleBase.updateVisual}
   */
  updateVisual(context: IRenderContext, oldVisual: Visual, edge: IEdge): SvgVisual {
    if (!(oldVisual instanceof SvgVisual)) {
      return this.createVisual(context, edge)
    }

    const container = oldVisual.svgElement

    const path = container.childNodes[0] as SVGPathElement

    // update the edge path
    const gp = this.getPath(edge)
    const updatedPath = gp.createSvgPath()
    path.setAttribute('d', updatedPath.getAttribute('d')!)

    // update the path color
    const connection = edge.tag as Connection
    const pathColor = this.getPathColor(connection)
    if (pathColor !== (path as any)['data-color']) {
      path.setAttribute('stroke', this.getPathColor(connection))
      ;(path as any)['data-color'] = pathColor
    }

    // start the packet animations, if necessary
    if (connection.hasForwardPacket) {
      const forwardPacket = container.childNodes.item(1) as SVGElement
      if (!(forwardPacket as any)['data-animation-running']) {
        const animation = new PacketAnimation(forwardPacket, edge, true)
        this.packetAnimator.allowUserInteraction = true
        this.packetAnimator.animate(animation)
      }
    }
    if (connection.hasBackwardPacket) {
      const backwardPacket = container.childNodes.item(2) as SVGElement
      if (!(backwardPacket as any)['data-animation-running']) {
        const animation = new PacketAnimation(backwardPacket, edge, false)
        this.packetAnimator.allowUserInteraction = true
        this.packetAnimator.animate(animation)
      }
    }

    // update the 'failed' icon
    if ((container as any)['data-failed'] !== connection.failed) {
      if (connection.failed) {
        path.style.setProperty('cursor', 'pointer')
        this.addExclamationMark(edge, container)
      } else {
        path.style.removeProperty('cursor')
        ConnectionStyle.removeExclamationMark(container)
      }
      ;(container as any)['data-failed'] = connection.failed
    }

    return oldVisual
  }

  /**
   * Creates a packet visualization.
   */
  createPacketElement(): SVGElement {
    const packet = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    packet.setAttribute('rx', '5')
    packet.setAttribute('ry', '5')
    packet.setAttribute('cx', '0')
    packet.setAttribute('cy', '0')
    return packet
  }

  /**
   * Determines whether the visualization for the specified edge is visible in the context.
   * This method is implemented explicitly for improved performance.
   * @see Overrides {@link EdgeStyleBase.isVisible}
   */
  isVisible(canvasContext: ICanvasContext, clip: Rect, edge: IEdge): boolean {
    const sourcePortLocation = edge.sourcePort!.location
    if (clip.contains(sourcePortLocation)) {
      return true
    }

    const targetPortLocation = edge.targetPort!.location
    return clip.intersectsLine(sourcePortLocation, targetPortLocation)
  }

  /**
   * Creates the edge path.
   * This is an optimized implementation to reduce the amount of calculation
   * that needs to be done for edge cropping. Bends are not considered.
   * @see Overrides {@link EdgeStyleBase.getPath}
   */
  getPath(edge: IEdge): GeneralPath {
    const path = new GeneralPath()
    path.moveTo(edge.sourcePort!.location)
    edge.bends.forEach((bend: IBend): void => {
      path.lineTo(bend.location)
    })
    path.lineTo(edge.targetPort!.location)
    return this.cropPath(edge, IArrow.NONE, IArrow.NONE, path)!
  }

  /**
   * Returns the color of the Edge depending on its (load) state.
   */
  getPathColor(connection: Connection): string {
    const edgeWorks = connection && !connection.failed && connection.enabled
    return edgeWorks ? DeviceStyle.convertLoadToColor(connection.load, 1) : 'rgb(211, 211, 211)'
  }

  /**
   * Adds the 'failed' icon to the given g element.
   */
  addExclamationMark(edge: IEdge, g: SVGElement): void {
    const center = this.getPath(edge).getPoint(0.5)
    const imageExclamation = window.document.createElementNS('http://www.w3.org/2000/svg', 'image')
    imageExclamation.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'href',
      './resources/exclamation.svg'
    )
    imageExclamation.setAttribute('width', '24')
    imageExclamation.setAttribute('height', '24')
    imageExclamation.setAttribute('transform', `translate(${center.x - 12} ${center.y - 12})`)
    imageExclamation.setAttribute('class', 'failed')
    imageExclamation.setAttribute('cursor', 'pointer')

    // add listeners that "repair" the failed edge
    const repairEdge = (evt: Event): void => {
      const connection = edge.tag
      connection.failed = false
      evt.stopImmediatePropagation()
    }
    imageExclamation.addEventListener('mousedown', repairEdge, true)
    imageExclamation.addEventListener(
      'touchstart',
      repairEdge,
      this.passiveSupported ? { passive: false } : true
    )

    g.appendChild(imageExclamation)
  }

  /**
   * Removes the 'failed' icon from the given g element.
   */
  static removeExclamationMark(g: SVGElement): void {
    while (g.childNodes.length > 3) {
      g.removeChild(g.lastChild!)
    }
  }
}

/**
 * An animation that moves a packet visualization along the edge path.
 */
class PacketAnimation extends BaseClass(IAnimation) {
  private sourceLocation: Point | null = null
  private targetLocation: Point | null = null

  /**
   * The preferred duration of the animation.
   */
  get preferredDuration() {
    return TimeSpan.fromMilliseconds(1400)
  }

  /**
   * Constructor that takes the packet Element, the Edge to move on and the move direction.
   */
  constructor(private packet: SVGElement, private edge: IEdge, private forward: boolean) {
    super()
  }

  /**
   * Initializes the packet loaction and starts the animation.
   * @see Specified by {@link IAnimation.initialize}.
   */
  initialize(): void {
    ;(this.packet as any)['data-animation-running'] = true

    // find the source and target point for the animation
    const path = this.edge.style.renderer.getPathGeometry(this.edge, this.edge.style).getPath()!
    const pathCursor = path.createCursor()
    pathCursor.moveNext()
    this.sourceLocation = pathCursor.currentEndPoint
    pathCursor.toLast()
    this.targetLocation = pathCursor.currentEndPoint

    // translate to the source point
    this.packet.setAttribute(
      'transform',
      `translate(${this.sourceLocation.x} ${this.sourceLocation.y})`
    )
    // show the element
    this.packet.style.setProperty('visibility', 'visible')
  }

  /**
   * One update step. Updates the current packet location.
   * @see Specified by {@link IAnimation.animate}.
   */
  animate(time: number): void {
    // check if the element is still alive
    if (!this.packet.ownerDocument || !this.packet.parentNode) {
      return
    }

    // interpolate the current packet location
    const currentLocation = this.forward
      ? Point.interpolate(this.sourceLocation!, this.targetLocation!, time)
      : Point.interpolate(this.targetLocation!, this.sourceLocation!, time)

    this.packet.setAttribute('transform', `translate(${currentLocation.x} ${currentLocation.y})`)
  }

  /**
   * Hides the packet Element.
   * @see Specified by {@link IAnimation.cleanup}.
   */
  cleanUp(): void {
    // hide the packet element
    this.packet.style.setProperty('visibility', 'hidden')
    ;(this.packet as any)['data-animation-running'] = false
  }
}
