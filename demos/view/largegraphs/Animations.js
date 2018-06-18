/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * Animation that zooms in and out again.
   * Half the animation duration is spent zooming in from the initial zoom level to a given target zoom level. The
   * other half of the animation duration is spent zooming out again.
   * @implements {yfiles.view.IAnimation}
   */
  class ZoomInAndBackAnimation extends yfiles.lang.Class(yfiles.view.IAnimation) {
    /**
     * @param {yfiles.view.CanvasComponent} canvas
     * @param {number} targetZoom
     * @param {yfiles.lang.TimeSpan} duration
     */
    constructor(canvas, targetZoom, duration) {
      super()
      this.canvas = canvas
      this.targetZoomLog = Math.log(targetZoom) / Math.log(2)
      this.$preferredDuration = new yfiles.lang.TimeSpan(duration.totalMilliseconds)
      this.$delta = 0
      this.$initialZoomLog = 0
    }

    /**
     * Gets the preferred duration of the animation.
     * @see Specified by {@link yfiles.view.IAnimation#preferredDuration}.
     * @type {yfiles.lang.TimeSpan}
     */
    get preferredDuration() {
      return this.$preferredDuration
    }

    /**
     * Sets the preferred duration of the animation.
     * @see Specified by {@link yfiles.view.IAnimation#preferredDuration}.
     * @type {yfiles.lang.TimeSpan}
     */
    set preferredDuration(value) {
      this.$preferredDuration = value
    }

    /**
     * The zoom level difference between the initial and the target zoom level.
     * @type {number}
     */
    get delta() {
      return this.$delta
    }

    /** @type {number} */
    set delta(value) {
      this.$delta = value
    }

    /**
     * Binary logarithm of the initial zoom level.
     * @type {number}
     */
    get initialZoomLog() {
      return this.$initialZoomLog
    }

    /** @type {number} */
    set initialZoomLog(value) {
      this.$initialZoomLog = value
    }

    /**
     * Initializes the animation. Call this method once before subsequent
     * calls to {@link yfiles.view.IAnimation#animate}.
     * @see Specified by {@link yfiles.view.IAnimation#initialize}.
     */
    initialize() {
      this.initialZoomLog = Math.log(this.canvas.zoom) / Math.log(2)
      this.delta = this.targetZoomLog - this.initialZoomLog
    }

    /**
     * Does the animation according to the relative animation time.
     * The animation starts with the time 0 and ends with time 1.
     * @param {number} time the animation time [0,1]
     * @see Specified by {@link yfiles.view.IAnimation#animate}.
     */
    animate(time) {
      const newZoom =
        time < 0.5
          ? this.initialZoomLog + this.delta * (time * 2)
          : this.targetZoomLog - this.delta * ((time - 0.5) * 2)
      this.canvas.zoom = Math.pow(2, newZoom)
    }

    /**
     * Cleans up after an animation has finished.
     * @see Specified by {@link yfiles.view.IAnimation#cleanUp}.
     */
    cleanUp() {}
  }

  /**
   * An animation that pans the viewport in a circular motion.
   * The animation pans the viewport in a circle with a diameter of half the viewport's width.
   * @implements {yfiles.view.IAnimation}
   */
  class CirclePanAnimation extends yfiles.lang.Class(yfiles.view.IAnimation) {
    /**
     * Initializes a new instance of the {@link CirclePanAnimation} class with the given number of revolutions and
     *   animation time.
     * @param {yfiles.view.CanvasComponent} canvas The {@link yfiles.view.CanvasComponent} whose viewport will be
     *   animated.
     * @param {number} revolutions The number of rotations during the animation.
     * @param {yfiles.lang.TimeSpan} duration The duration of the animation.
     */
    constructor(canvas, revolutions, duration) {
      super()
      this.canvas = canvas
      this.revolutions = revolutions
      this.$preferredDuration = new yfiles.lang.TimeSpan(duration.totalMilliseconds)
      this.$lastAngle = 0
      this.$lastRadius = 0
    }

    /**
     * The rotation angle during the last frame.
     * This is needed for correct interaction with a simultaneous zoom animation.
     * @type {number}
     */
    get lastAngle() {
      return this.$lastAngle
    }

    /** @type {number} */
    set lastAngle(value) {
      this.$lastAngle = value
    }

    /**
     * The circle radius during the last frame.
     * This is needed for correct interaction with a simultaneous zoom animation.
     * @type {number}
     */
    get lastRadius() {
      return this.$lastRadius
    }

    /** @type {number} */
    set lastRadius(value) {
      this.$lastRadius = value
    }

    /**
     * Gets the preferred duration of the animation.
     * @see Specified by {@link yfiles.view.IAnimation#preferredDuration}.
     * @type {yfiles.lang.TimeSpan}
     */
    get preferredDuration() {
      return this.$preferredDuration
    }

    /** @type {yfiles.lang.TimeSpan} */
    set preferredDuration(value) {
      this.$preferredDuration = value
    }

    /**
     * Initializes the animation. Call this method once before subsequent
     * calls to {@link yfiles.view.IAnimation#animate}.
     * @see Specified by {@link yfiles.view.IAnimation#initialize}.
     */
    initialize() {
      this.lastAngle = 0
      this.lastRadius = this.canvas.viewport.width / 4
    }

    /**
     * Does the animation according to the relative animation time.
     * The animation starts with the time 0 and ends with time 1.
     * @param {number} time the animation time [0,1]
     * @see Specified by {@link yfiles.view.IAnimation#animate}.
     */
    animate(time) {
      // The circle radius depends on the viewport size to be zoom-invariant
      const radius = this.canvas.viewport.width / 4
      const totalAngle = 2 * Math.PI * this.revolutions
      const currentAngle = totalAngle * time

      // Undo the last frame's movement first
      const undo = new yfiles.geometry.Point(
        Math.cos(this.lastAngle) * this.lastRadius,
        Math.sin(this.lastAngle) * this.lastRadius
      )
      // Then apply the current one. This is needed to play well with a simultaneous zoom animation.

      const p1 = new yfiles.geometry.Point(
        this.canvas.viewPoint.x - undo.x,
        this.canvas.viewPoint.y - undo.y
      )
      const p2 = new yfiles.geometry.Point(
        Math.cos(currentAngle) * radius,
        Math.sin(currentAngle) * radius
      )
      this.canvas.viewPoint = p1.add(p2)
      this.lastRadius = radius
      this.lastAngle = currentAngle
    }

    /**
     * Cleans up after an animation has finished.
     * @see Specified by {@link yfiles.view.IAnimation#cleanUp}.
     */
    cleanUp() {}
  }

  /**
   * An animation that moves nodes in a circular motion.
   * @implements {yfiles.view.IAnimation}
   */
  class CircleNodeAnimation extends yfiles.lang.Class(yfiles.view.IAnimation) {
    /**
     * Initializes a new instance of the {@link CircleNodeAnimation} class with the given graph, nodes, radius,
     *   number of revolutions and preferred duration.
     * @param {yfiles.graph.IGraph} g The graph the nodes belong to.
     * @param {yfiles.collections.IEnumerable.<yfiles.graph.INode>} nodes The nodes.
     * @param {number} radius The radius of the movement circle.
     * @param {number} revolutions The number of revolutions around the circle.
     * @param {yfiles.lang.TimeSpan} preferredDuration Preferred duration of the animation.
     */
    constructor(g, nodes, radius, revolutions, preferredDuration) {
      super()
      this.graph = g
      this.radius = radius
      this.nodes = nodes.toList()
      this.revolutions = revolutions
      this.$preferredDuration = new yfiles.lang.TimeSpan(preferredDuration.totalMilliseconds)
      this.$startBounds = null
    }

    /**
     * Gets the preferred duration of the animation.
     * @see Specified by {@link yfiles.view.IAnimation#preferredDuration}.
     * @type {yfiles.lang.TimeSpan}
     */
    get preferredDuration() {
      return this.$preferredDuration
    }

    /** @type {yfiles.lang.TimeSpan} */
    set preferredDuration(value) {
      this.$preferredDuration = value
    }

    /**
     * A list of the nodes' start locations.
     * @type {yfiles.collections.List.<yfiles.geometry.Rect>}
     */
    get startBounds() {
      return this.$startBounds
    }

    /** @type {yfiles.collections.List.<yfiles.geometry.Rect>} */
    set startBounds(value) {
      this.$startBounds = value
    }

    /**
     * Initializes the animation. Call this method once before subsequent
     * calls to {@link yfiles.view.IAnimation#animate}.
     * @see Specified by {@link yfiles.view.IAnimation#initialize}.
     */
    initialize() {
      this.startBounds = this.nodes.map(n => n.layout.toRect()).toList()
    }

    /**
     * Does the animation according to the relative animation time.
     * The animation starts with the time 0 and ends with time 1.
     * @param {number} time the animation time [0,1]
     * @see Specified by {@link yfiles.view.IAnimation#animate}.
     */
    animate(time) {
      const totalAngle = 2 * Math.PI * this.revolutions
      const currentAngle = totalAngle * time
      const offset = new yfiles.geometry.Point(
        Math.cos(currentAngle) * this.radius,
        Math.sin(currentAngle) * this.radius
      )
      for (let i = 0; i < this.nodes.size; i++) {
        const n = this.nodes.get(i)

        const topRight = new yfiles.geometry.Point(this.radius, 0)
        const topLeft = this.startBounds.get(i).topLeft
        const p = new yfiles.geometry.Point(topLeft.x - topRight.x, topLeft.y - topRight.y)
        const newPosition = p.add(offset)
        this.graph.setNodeLayout(
          n,
          new yfiles.geometry.Rect(newPosition, this.startBounds.get(i).size)
        )
      }
    }

    /**
     * Cleans up after an animation has finished.
     * @see Specified by {@link yfiles.view.IAnimation#cleanUp}.
     */
    cleanUp() {}
  }

  return {
    ZoomInAndBackAnimation,
    CirclePanAnimation,
    CircleNodeAnimation
  }
})
