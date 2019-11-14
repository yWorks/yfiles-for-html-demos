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

define(['yfiles/view-component', 'NetworkMonitoringNodeStyle.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  NetworkMonitoringNodeStyle
) => {
  /**
   * An edge style that sets the edge color based on the load and renders
   * the animated packet as well as the 'failed' icon.
   * @extends yfiles.styles.EdgeStyleBase
   */
  class NetworkMonitoringEdgeStyle extends yfiles.styles.EdgeStyleBase {
    /**
     * Initializes the EdgeStyle using the given Animator.
     * @param {yfiles.view.Animator} packetAnimator The animator for the aniamtion of the packages.
     * @param {boolean} passiveSupported Whether or not the browser supports active and passive event listeners.
     */
    constructor(packetAnimator, passiveSupported) {
      super()
      this.packetAnimator = packetAnimator
      this.passiveSupported = !!passiveSupported
    }

    /**
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#createVisual}
     * @param {yfiles.view.IRenderContext} context
     * @param {yfiles.graph.IEdge} edge
     * @return {yfiles.view.SvgVisual}
     */
    createVisual(context, edge) {
      const container = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
      const modelEdge = edge.tag
      // get the stroke color
      const pathColor = this.getPathColor(modelEdge)

      // create the edge path
      const path = this.getPath(edge).createSvgPath()
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', pathColor)
      path.setAttribute('stroke-width', '5')
      path.setAttribute('stroke-linecap', 'round')
      path.setAttribute('class', 'edgePath')
      path['data-color'] = pathColor

      container.appendChild(path)

      // create the element for forward packets
      const forwardPacket = this.createPacketElement()
      // set initial visibility to hidden
      forwardPacket.style.setProperty('visibility', 'hidden', null)
      // create the element for backward packets
      const backwardPacket = this.createPacketElement()
      backwardPacket.style.setProperty('visibility', 'hidden', null)

      container.appendChild(forwardPacket)
      container.appendChild(backwardPacket)

      // start animations if necessary
      if (modelEdge.hasForwardPacket) {
        const animation = new PacketAnimation(forwardPacket, edge, true)
        this.packetAnimator.allowUserInteraction = true
        this.packetAnimator.animate(animation)
      }
      if (modelEdge.hasBackwardPacket) {
        const animation = new PacketAnimation(backwardPacket, edge, false)
        this.packetAnimator.allowUserInteraction = true
        this.packetAnimator.animate(animation)
      }

      if (modelEdge.failed) {
        path.style.setProperty('cursor', 'pointer', null)
        // draw failed icon
        this.addExclamationMark(edge, container)
      }
      container['data-failed'] = modelEdge.failed
      return new yfiles.view.SvgVisual(container)
    }

    /**
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#updateVisual}
     * @param {yfiles.view.IRenderContext} context
     * @param {yfiles.view.Visual} oldVisual
     * @param {yfiles.graph.IEdge} edge
     * @return {yfiles.view.SvgVisual}
     */
    updateVisual(context, oldVisual, edge) {
      const container = oldVisual.svgElement
      const modelEdge = edge.tag
      const pathColor = this.getPathColor(modelEdge)

      // update the edge path
      const gp = this.getPath(edge)
      const path = container.childNodes[0]

      const updatedPath = gp.createSvgPath()
      path.setAttribute('d', updatedPath.getAttribute('d'))

      // update the path color
      if (pathColor !== path['data-color']) {
        path.setAttribute('stroke', this.getPathColor(modelEdge))
        path['data-color'] = pathColor
      }

      // start the packet animations, if necessary
      if (modelEdge.hasForwardPacket) {
        const forwardPacket = container.childNodes.item(1)
        if (!forwardPacket['data-animation-running']) {
          const animation = new PacketAnimation(forwardPacket, edge, true)
          this.packetAnimator.allowUserInteraction = true
          this.packetAnimator.animate(animation)
        }
      }
      if (modelEdge.hasBackwardPacket) {
        const backwardPacket = container.childNodes.item(2)
        if (!backwardPacket['data-animation-running']) {
          const animation = new PacketAnimation(backwardPacket, edge, false)
          this.packetAnimator.allowUserInteraction = true
          this.packetAnimator.animate(animation)
        }
      }

      // update the 'failed' icon
      if (container['data-failed'] !== modelEdge.failed) {
        if (modelEdge.failed) {
          path.style.setProperty('cursor', 'pointer', null)
          this.addExclamationMark(edge, container)
        } else {
          path.style.removeProperty('cursor')
          NetworkMonitoringEdgeStyle.removeExclamationMark(container)
        }
        container['data-failed'] = modelEdge.failed
      }

      return oldVisual
    }

    /**
     * Creates a packet visualization.
     * @return {SVGElement}
     */
    createPacketElement() {
      const packet = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      packet.setAttribute('rx', '5')
      packet.setAttribute('ry', '5')
      packet.setAttribute('cx', 0)
      packet.setAttribute('cy', 0)
      return packet
    }

    /**
     * Determines whether the visualization for the specified edge is visible in the context.
     * This method is implemented explicitly for improved performance.
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#isVisible}
     * @param {yfiles.view.ICanvasContext} canvasContext
     * @param {yfiles.geometry.Rect} clip
     * @param {yfiles.graph.IEdge} edge
     * @return {boolean}
     */
    isVisible(canvasContext, clip, edge) {
      const sp = edge.sourcePort.locationParameter.model.getLocation(
        edge.sourcePort,
        edge.sourcePort.locationParameter
      )
      if (clip.contains(sp)) {
        return true
      }
      const tp = edge.targetPort.locationParameter.model.getLocation(
        edge.targetPort,
        edge.targetPort.locationParameter
      )
      return clip.intersectsLine(sp, tp)
    }

    /**
     * Creates the edge path.
     * This is an optimized implementation to reduce the amount of calculation
     * that needs to be done for edge cropping. Bends are not considered.
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#getPath}
     * @param {yfiles.graph.IEdge} edge
     * @return {yfiles.geometry.GeneralPath}
     */
    getPath(edge) {
      // Create a general path from the source port to the target port
      const path = new yfiles.geometry.GeneralPath(2)
      // get the sourceport location
      const sp = edge.sourcePort.locationParameter.model.getLocation(
        edge.sourcePort,
        edge.sourcePort.locationParameter
      )
      const tp = edge.targetPort.locationParameter.model.getLocation(
        edge.targetPort,
        edge.targetPort.locationParameter
      )
      // calculate the vector from source to target
      const dx = tp.x - sp.x
      const dy = tp.y - sp.y
      // calculate the vector length
      const l = Math.sqrt(dx * dx + dy * dy)

      // get the max bounds of source and target node as crop length
      const sourceNodeLayout = edge.sourceNode.layout
      const targetNodeLayout = edge.targetNode.layout
      const sourceCropLength = Math.max(sourceNodeLayout.width, sourceNodeLayout.height) * 0.5
      const targetCropLength = Math.max(targetNodeLayout.width, targetNodeLayout.height) * 0.5

      // shorten source and target location by the crop length
      // this results in a circular crop
      const spx = sp.x + dx * (sourceCropLength / l)
      const spy = sp.y + dy * (sourceCropLength / l)
      const tpx = tp.x - dx * (targetCropLength / l)
      const tpy = tp.y - dy * (targetCropLength / l)

      // crop the path at the node outline
      path.moveTo(spx, spy)
      path.lineTo(tpx, tpy)
      return path
    }

    /**
     * Returns the color of the Edge depending on its (load) state.
     * @param {ModelEdge} modelEdge
     * @return {string}
     */
    getPathColor(modelEdge) {
      if (modelEdge !== null && !modelEdge.failed && modelEdge.enabled) {
        return NetworkMonitoringNodeStyle.convertLoadToColor(modelEdge.load, 1)
      }
      return 'rgb(211, 211, 211)'
    }

    /**
     * Adds the 'failed' icon to the given g element.
     * @param {yfiles.graph.IEdge} edge
     * @param {SVGElement} g
     */
    addExclamationMark(edge, g) {
      const center = this.getPath(edge).getPoint(0.5)
      const imageExclamation = window.document.createElementNS(
        'http://www.w3.org/2000/svg',
        'image'
      )
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
      const repairEdge = evt => {
        const modelEdge = edge.tag
        modelEdge.failed = false
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
     * @param {SVGElement} g
     */
    static removeExclamationMark(g) {
      while (g.childNodes.length > 3) {
        g.removeChild(g.lastChild)
      }
    }
  }

  /**
   * An animation that moves a packet visualization along the edge path.
   * @implements {yfiles.view.IAnimation}
   */
  class PacketAnimation extends yfiles.lang.Class(yfiles.view.IAnimation) {
    /**
     * Constructor that takes the packet Element, the Edge to move on and the move direction.
     * @param {Element} packet
     * @param {yfiles.graph.IEdge} edge
     * @param {boolean} forward
     */
    constructor(packet, edge, forward) {
      super()

      this.initPacketAnimation()
      this.packet = packet
      this.edge = edge
      this.forward = forward
    }

    /**
     * Gets the preferred duration of the animation.
     * @see Specified by {@link yfiles.view.IAnimation#preferredDuration}.
     * @type {yfiles.lang.TimeSpan}
     */
    get preferredDuration() {
      return new yfiles.lang.TimeSpan(this.duration.totalMilliseconds)
    }

    /** @type {yfiles.geometry.Point} */
    set sourceLocation(value) {
      this.$sourceLocation = value
    }

    /** @type {yfiles.geometry.Point} */
    get sourceLocation() {
      return this.$sourceLocation
    }

    /** @type {yfiles.geometry.Point} */
    set targetLocation(value) {
      this.$targetLocation = value
    }

    /** @type {yfiles.geometry.Point} */
    get targetLocation() {
      return this.$targetLocation
    }

    /**
     * Initializes the packet loaction and starts the animation.
     * @see Specified by {@link yfiles.view.IAnimation#initialize}.
     */
    initialize() {
      this.packet['data-animation-running'] = true
      // find the source and target point for the animation
      const path = this.edge.style.renderer.getPathGeometry(this.edge, this.edge.style).getPath()
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
      this.packet.style.setProperty('visibility', 'visible', null)
    }

    /**
     * One update step. Updates the current packet location.
     * @param {number} time
     * @see Specified by {@link yfiles.view.IAnimation#animate}.
     */
    animate(time) {
      // check if the element is still alive
      if (this.packet.ownerDocument === null || this.packet.parentNode === null) {
        return
      }
      // calculate the current packet location
      const currentLocation = this.forward
        ? this.sourceLocation.add(this.targetLocation.subtract(this.sourceLocation).multiply(time))
        : this.targetLocation.add(this.sourceLocation.subtract(this.targetLocation).multiply(time))
      this.packet.setAttribute('transform', `translate(${currentLocation.x} ${currentLocation.y})`)
    }

    /**
     * Hides the packet Element.
     * @see Specified by {@link yfiles.view.IAnimation#cleanup}.
     */
    cleanUp() {
      // hide the packet element
      this.packet.style.setProperty('visibility', 'hidden', null)
      this.packet['data-animation-running'] = false
    }

    initPacketAnimation() {
      this.duration = yfiles.lang.TimeSpan.fromMilliseconds(1400)
      this.$sourceLocation = null
      this.$targetLocation = null
    }
  }

  return NetworkMonitoringEdgeStyle
})
