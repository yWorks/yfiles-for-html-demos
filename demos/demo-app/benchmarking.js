/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Animator, BaseClass, IAnimation, List, Point, Rect, TimeSpan } from '@yfiles/yfiles'

/**
 * Creates a small benchmarking panel with FPS meter and demo animations.
 *
 * @param graphComponent The GraphComponent used by the benchmarking UI for animations and FPS metering.
 * @returns The HTMLElement that contains the benchmarking UI.
 */
export function createBenchmarkingUI(graphComponent) {
  const container = document.createElement('div')
  container.innerHTML = `
<style>
#fpsContainer {
  position: relative;
  height: 150px;
  width: 100%;
}

#fpsContainer canvas {
  width: 100%;
  height: 100%;
}

#gt40 {
  position: absolute;
  top: 15px;
  left: 6px;
  font-size: 14px;
  color: white;
}

#lt20 {
  position: absolute;
  bottom: 15px;
  left: 6px;
  font-size: 14px;
  color: white;
}

.animations-grid {
  display: grid;
  grid: 1fr / auto-flow;
}

.animations-button {
  display: grid;
  grid: auto-flow / 1fr;
  justify-items: center;
  user-select: none;
  cursor: pointer;
}

.animations-button button {
  user-select: none;
  cursor: pointer;
}

.animations-button span {
  font-size: 90%;
}

.control-button {
  overflow: visible;
  margin-bottom: 4px;
  width: 70px !important;
  height: 70px !important;
  padding: 4px;
}

.control-button svg {
  fill: white;
  stroke-width: 1;
}
</style>
<h2>Benchmarking</h2>
<fieldset>
  <legend><span>FPS: </span><span id="fps">60</span></legend>
  <div id="fpsContainer">
    <canvas id="fpsMeter"></canvas>
    <div id="gt40">&gt; 40 FPS</div>
    <div id="lt20">&lt; 20 FPS</div>
  </div>
</fieldset>
<fieldset>
  <legend>Animations</legend>
  <div class="animations-grid">
    <div class="animations-button">
      <button id="panAnimationBtn" title="Pan Animation" class="control-button">
        <span class="button-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 65 65"
          >
            <path
              stroke="black"
              d="m 32 6.0042738 c -14.305631 0 -25.9812922 11.7045292 -25.9812922 26.0101602 0 14.305631 11.6756612 25.981292 25.9812922 25.981292 14.305631 0 25.981292 -11.675661 25.981292 -25.981292 l -8.314013 0 c 0 9.812405 -7.854874 17.667279 -17.667279 17.667279 -9.812405 0 -17.667279 -7.854874 -17.667279 -17.667279 0 -9.812405 7.854874 -17.696147 17.667279 -17.696147 3.862455 0 7.546507 1.28368 10.565725 3.550777 L 39.823256 19.976435 52.424945 22.901741 53.015979 9.8725995 49.34973 12.701674 C 44.620298 8.4439323 38.469554 6.0042738 32 6.0042738 z"
            ></path>
          </svg>
        </span>
      </button>
      <span class="control-description">Pan in circle</span>
    </div>
    <div class="animations-button">
      <button id="zoomAnimationBtn" title="Zoom Animation" class="control-button">
        <span class="button-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 65 65"
          >
            <path
              stroke="black"
              d="m 32.173292 2.4918554 c 0 0 -10.022672 5.90499 -10.022672 5.90499 0 0 4.994041 0.01147 4.994041 0.01147 0 0 -7.003383 36.0945106 -7.003383 36.0945106 0 0 -11.7811574 -0.06402 -11.7811574 -0.06402 0 0 23.3218474 17.069337 23.3218474 17.069337 0 0 23.957911 -16.818923 23.957911 -16.818923 0 0 -11.858798 -0.0644 -11.858798 -0.0644 0 0 -6.635341 -36.193535 -6.635341 -36.193535 0 0 5.004447 0.011501 5.004447 0.011501 0 0 -9.976895 -5.9509323 -9.976895 -5.9509323"
            ></path>
          </svg>
        </span>
      </button>
      <span class="control-description">Zoom</span>
    </div>
    <div class="animations-button">
      <button id="spiralAnimationBtn" title="Spiral Animation" class="control-button">
        <span class="button-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 65 65"
          >
            <path
              stroke="black"
              d="m 20.027658 30.466513 c 1.673406 3.215045 6.162171 3.947451 9.416327 2.400931 4.899943 -2.328676 6.006917 -8.2175 3.546529 -12.452279 -3.56982 -6.144313 -12.342975 -7.44977 -18.648804 -4.178484 -8.8703711 4.6017 -10.7606702 15.47465 -5.9152371 23.22535 6.6396701 10.620744 22.0789981 12.759686 33.0838691 6.692996 6.513638 -3.590795 11.172082 -9.617345 13.069219 -16.360875 l 3.596923 0.284906 -9.754136 -12.920611 -11.389992 11.143488 3.581825 0.284824 c 0 0 -3.534659 6.885415 -7.046706 8.821511 -5.933641 3.271058 -14.25827 2.117776 -17.83827 -3.608751 -2.612576 -4.179048 -1.593359 -10.041562 3.189399 -12.522721 3.399996 -1.763823 8.130336 -1.059943 10.055123 2.252968 1.3266 2.283323 0.729738 5.458479 -1.912229 6.714061 -1.754587 0.833859 -4.174855 0.438957 -5.077126 -1.294541 -0.572703 -1.100311 -0.283037 -2.631743 1.01117 -3.167464 l 0.956491 1.057454 0.2615 -3.139272 -3.234255 -0.147273 0.959763 1.055608 c -2.387145 1.002667 -2.97355 3.817474 -1.911383 5.858174 z"
            ></path>
          </svg>
        </span>
      </button>
      <span class="control-description">Spiral zoom</span>
    </div>
    <div class="animations-button">
      <button
        id="moveNodeAnimationBtn"
        title="Move Nodes Animation"
        class="control-button"
      >
        <span class="button-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 65 65"
          >
            <path
              stroke="black"
              d="m 33.5625 14.959821 -2.53125 4.0625 c 4.266346 2.635565 5.573065 8.171154 2.9375 12.4375 -2.635565 4.266346 -8.171154 5.573065 -12.4375 2.9375 -0.486396 -0.300474 -0.927402 -0.647575 -1.34375 -1.03125 l 1.6875 -0.96875 -8.25 -4.84375 -0.09375 9.59375 2.34375 -1.34375 c 0.915764 1.043001 1.972441 1.956194 3.15625 2.6875 6.473304 3.998928 15.032322 1.973304 19.03125 -4.5 3.998928 -6.473304 1.973304 -15.032322 -4.5 -19.03125 z M 17.571428 13.5 l 4.714286 0 m -8.142857 0 1.714286 0 M 8.9999998 13.5 12 13.5 m -6.4285712 -5.9285717 20.1428562 0 0 11.8571427 -20.1428562 0 z"
            ></path>
          </svg>
        </span>
      </button>
      <span class="control-description">Move Nodes</span>
    </div>
  </div>
</fieldset>
  `

  initializeFpsMeter(container, graphComponent)
  initializeAnimationButtons(graphComponent, container)

  return container
}

/**
 * Initializes and starts the FPS meter UI.
 *
 * @param container The root container that holds the FPS value element and canvas.
 * @param graphComponent The GraphComponent whose update cycle is measured.
 */
function initializeFpsMeter(container, graphComponent) {
  // Query created elements (scoped to container)
  const fpsValue = container.querySelector(`#fps`)
  const canvas = container.querySelector(`#fpsMeter`)

  const fpsMeter = new FPSMeter(graphComponent, fpsValue, canvas)
  fpsMeter.start()
}

/**
 * Wires up demo animation buttons and provides helper utilities to run them.
 *
 * @param graphComponent The GraphComponent on which the animations will run.
 * @param container The container element that provides the buttons.
 */
function initializeAnimationButtons(graphComponent, container) {
  const btnPan = container.querySelector(`#panAnimationBtn`)
  const btnZoom = container.querySelector(`#zoomAnimationBtn`)
  const btnSpiral = container.querySelector(`#spiralAnimationBtn`)
  const btnMove = container.querySelector(`#moveNodeAnimationBtn`)

  // Button actions
  btnZoom.addEventListener('click', async () => {
    const node = getRandomNode(graphComponent.graph)
    graphComponent.center = node.layout.center
    const animation = new ZoomInAndBackAnimation(graphComponent, 10, TimeSpan.fromSeconds(5))
    await runAnimation(animation)
  })

  btnPan.addEventListener('click', async () => {
    const animation = new CirclePanAnimation(graphComponent, 2, TimeSpan.fromSeconds(2))
    await runAnimation(animation)
  })

  btnSpiral.addEventListener('click', async () => {
    const node = getRandomNode(graphComponent.graph)
    graphComponent.center = node.layout.center.add(new Point(graphComponent.viewport.width / 4, 0))
    const zoom = new ZoomInAndBackAnimation(graphComponent, 10, TimeSpan.fromSeconds(10))
    const pan = new CirclePanAnimation(graphComponent, 14, TimeSpan.fromSeconds(10))
    const animation = IAnimation.createParallelAnimation([zoom, pan])
    await runAnimation(animation)
  })

  btnMove.addEventListener('click', async () => {
    const selection = graphComponent.selection
    if (selection.nodes.size === 0) {
      selection.add(getRandomNode(graphComponent.graph))
    }
    const animation = new CircleNodeAnimation(
      graphComponent.graph,
      selection.nodes,
      graphComponent.viewport.width / 10,
      2,
      TimeSpan.fromSeconds(2)
    )
    await runAnimation(animation)
  })

  /**
   * Runs the given animation on the GraphComponent while disabling UI buttons.
   *
   * @param animation The animation to run.
   * @returns A promise that resolves when the animation has finished.
   */
  async function runAnimation(animation) {
    startAnimation()
    const animator = new Animator(graphComponent)
    await animator.animate(animation)
    endAnimation()
  }

  /**
   * Picks a random node from the given graph.
   *
   * @param graph The graph to choose the node from.
   * @returns A randomly selected node; if the graph is empty, returns an arbitrary index-safe result.
   */
  function getRandomNode(graph) {
    const nodes = graph.nodes.toList()
    return nodes.get(Math.floor(Math.random() * Math.max(1, nodes.size)))
  }

  const disabledButtons = [btnZoom, btnPan, btnSpiral, btnMove]
  /**
   * Enables or disables all animation buttons in the panel.
   *
   * @param disabled Whether the buttons should be disabled.
   */
  const setButtonsDisabled = (disabled) => {
    disabledButtons.forEach((b) => {
      b.disabled = disabled
    })
  }

  /**
   * Disables the UI buttons to prevent concurrent animations.
   */
  function startAnimation() {
    return setButtonsDisabled(true)
  }

  /**
   * Re-enables the UI buttons after an animation has finished.
   */
  function endAnimation() {
    setButtonsDisabled(false)
  }
}

/**
 * Lightweight FPS meter that samples frame times from GraphComponent update events
 * and renders a small sparkline-style chart into a canvas.
 */
class FPSMeter {
  fpsSpan
  graphComponent
  width
  height
  frameCache = []
  fpsHistory = []
  ctx
  cacheSize = 20
  timerId = 0

  /**
   * Creates a new FPSMeter instance.
   *
   * @param graphComponent The GraphComponent to listen to for frame updates.
   * @param fpsSpan The span element where the numeric FPS value is displayed.
   * @param canvasEl The canvas element used to render the FPS history graph.
   */
  constructor(graphComponent, fpsSpan, canvasEl) {
    this.graphComponent = graphComponent
    this.fpsSpan = fpsSpan
    const ctx = canvasEl.getContext('2d')
    if (!ctx) {
      throw new Error('2D canvas context not available')
    }
    this.ctx = ctx
    this.width = canvasEl.width
    this.height = canvasEl.height
    this.drawBackground()
  }

  /**
   * Subscribes to GraphComponent update events and begins measuring FPS.
   */
  start() {
    this.graphComponent.addEventListener('updating-visual', () => {
      this.dropOldFrames()
    })
    this.graphComponent.addEventListener('updated-visual', () => {
      this.measureAndUpdate()
    })
  }

  /**
   * Discards cached frame timestamps if too much time has passed between frames.
   */
  dropOldFrames() {
    if (this.frameCache.length === 0) {
      return
    }

    // We consider our frame cache outdated if the end of the last frame
    // was a "long" time before the start of the current frame.
    const lastFrameEnd = this.frameCache.at(-1)
    const oldFrameThresholdMS = 30 // a bit longer than the duration of a regular frame at 60 fps
    if (Date.now() - lastFrameEnd > oldFrameThresholdMS) {
      this.resetFrameCache()
    }
  }

  /**
   * Records a frame timestamp, computes the current FPS, and updates the UI and history chart.
   */
  measureAndUpdate() {
    const time = Date.now()
    const cache = this.frameCache
    cache.push(time)
    if (cache.length > this.cacheSize) {
      cache.shift()
    } else if (cache.length < 3) {
      return
    }

    if (this.timerId === 0) {
      this.timerId = window.setTimeout(() => {
        const d = (cache[cache.length - 1] - cache[0]) * 0.001
        const fps = Math.min(Math.floor(cache.length / d), 60)
        this.timerId = 0
        this.fpsSpan.textContent = fps.toString()

        this.fpsHistory.push(fps)
        if (this.fpsHistory.length > this.cacheSize) {
          this.fpsHistory.shift()
        } else if (this.fpsHistory.length < 2) {
          return
        }
        this.update()
      }, 50)
    }
  }

  /**
   * Clears the short-term frame timestamp cache.
   */
  resetFrameCache() {
    this.frameCache = []
  }

  /**
   * Redraws the FPS meter canvas (background bands and FPS polyline).
   */
  update() {
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.drawBackground()

    this.drawFps()
  }

  /**
   * Draws the three background bands indicating >40 FPS, 40–20 FPS, and <20 FPS ranges.
   */
  drawBackground() {
    const thirdOfHeight = this.height / 3
    // > 40 fps
    this.ctx.fillStyle = 'rgba(0, 160, 0, 0.4)'
    this.ctx.fillRect(0, 0, this.width, thirdOfHeight)
    // 40 - 20 fps
    this.ctx.fillStyle = 'rgba(255, 110, 0, 0.4)'
    this.ctx.fillRect(0, thirdOfHeight, this.width, thirdOfHeight)
    // < 20 fps
    this.ctx.fillStyle = 'rgba(160, 0, 0, 0.4)'
    this.ctx.fillRect(0, thirdOfHeight * 2, this.width, thirdOfHeight)
  }

  /**
   * Draws the FPS history polyline using the current fpsHistory values.
   */
  drawFps() {
    const xStep = Math.floor(this.width / this.cacheSize)
    const yMin = 5
    const yMax = this.height - 5
    const usableHeight = yMax - yMin

    this.ctx.moveTo(0, 5)
    this.ctx.beginPath()
    for (let i = 0; i < this.fpsHistory.length; i++) {
      const y = this.height - (yMin + usableHeight * (this.fpsHistory[i] / 60))
      this.ctx.lineTo(i * xStep, y)
    }
    this.ctx.strokeStyle = '#666'
    this.ctx.lineWidth = 2
    this.ctx.stroke()
  }
}

/**
 * Animation that zooms in and out again.
 * Half the animation duration is spent zooming in from the initial zoom level to a given target
 * zoom level. The other half of the duration is spent zooming out again.
 */
export class ZoomInAndBackAnimation extends BaseClass(IAnimation) {
  duration
  canvas
  targetZoomLog
  delta = 0
  initialZoomLog = 0

  /**
   * Initializes a new instance of the {@link ZoomInAndBackAnimation} class with the given target
   * zoom factor and preferred duration.
   * @param canvas The {@link CanvasComponent} whose viewport will be animated.
   * @param targetZoom The target zoom factor.
   * @param duration The preferred duration for the animation.
   */
  constructor(canvas, targetZoom, duration) {
    super()
    this.canvas = canvas
    this.duration = duration
    this.targetZoomLog = Math.log(targetZoom) / Math.log(2)
  }

  /**
   * Gets the preferred duration of the animation.
   * @see Specified by {@link IAnimation.preferredDuration}.
   */
  get preferredDuration() {
    return this.duration
  }

  /**
   * Initializes the animation. Call this method once before subsequent
   * calls to {@link IAnimation.animate}.
   * @see Specified by {@link IAnimation.initialize}.
   */
  initialize() {
    this.initialZoomLog = Math.log(this.canvas.zoom) / Math.log(2)
    this.delta = this.targetZoomLog - this.initialZoomLog
  }

  /**
   * Does the animation according to the relative animation time.
   * The animation starts with the time 0 and ends with time 1.
   * @param time the animation time [0,1]
   * @see Specified by {@link IAnimation.animate}.
   */
  animate(time) {
    const newZoom =
      time < 0.5
        ? this.initialZoomLog + this.delta * (time * 2)
        : this.targetZoomLog - this.delta * ((time - 0.5) * 2)
    this.canvas.zoom = 2 ** newZoom
  }

  /**
   * Cleans up after an animation has finished.
   * @see Specified by {@link IAnimation.cleanUp}.
   */
  cleanUp() {}
}

/**
 * An animation that pans the viewport in a circular motion.
 * The animation pans the viewport in a circle with a diameter of half the viewport's width.
 */
export class CirclePanAnimation extends BaseClass(IAnimation) {
  duration
  revolutions
  canvas
  lastAngle = 0
  lastRadius = 0

  /**
   * Initializes a new instance of the {@link CirclePanAnimation} class with the given number of
   * revolutions and preferred duration.
   * @param canvas The {@link CanvasComponent} whose viewport will be animated.
   * @param revolutions The number of rotations during the animation.
   * @param duration The preferred duration for the animation.
   */
  constructor(canvas, revolutions, duration) {
    super()
    this.canvas = canvas
    this.revolutions = revolutions
    this.duration = duration
  }

  /**
   * Gets the preferred duration of the animation.
   * @see Specified by {@link IAnimation.preferredDuration}.
   */
  get preferredDuration() {
    return this.duration
  }

  /**
   * Initializes the animation. Call this method once before subsequent
   * calls to {@link IAnimation.animate}.
   * @see Specified by {@link IAnimation.initialize}.
   */
  initialize() {
    this.lastAngle = 0
    this.lastRadius = this.canvas.viewport.width / 4
  }

  /**
   * Does the animation according to the relative animation time.
   * The animation starts with the time 0 and ends with time 1.
   * @param time the animation time [0,1]
   * @see Specified by {@link IAnimation.animate}.
   */
  animate(time) {
    // The circle radius depends on the viewport size to be zoom-invariant
    const radius = this.canvas.viewport.width / 4
    const totalAngle = 2 * Math.PI * this.revolutions
    const currentAngle = totalAngle * time

    // Undo the last frame's movement first
    const undo = new Point(
      Math.cos(this.lastAngle) * this.lastRadius,
      Math.sin(this.lastAngle) * this.lastRadius
    )
    // Then apply the current one. This is needed to play well with a simultaneous zoom animation.
    const p1 = new Point(this.canvas.viewPoint.x - undo.x, this.canvas.viewPoint.y - undo.y)
    const p2 = new Point(Math.cos(currentAngle) * radius, Math.sin(currentAngle) * radius)
    this.canvas.viewPoint = p1.add(p2)
    this.lastRadius = radius
    this.lastAngle = currentAngle
  }

  /**
   * Cleans up after an animation has finished.
   * @see Specified by {@link IAnimation.cleanUp}.
   */
  cleanUp() {}
}

/**
 * An animation that moves nodes in a circular motion.
 */
export class CircleNodeAnimation extends BaseClass(IAnimation) {
  duration
  revolutions
  radius
  graph
  nodes
  startBounds = new List()

  /**
   * Initializes a new instance of the {@link CircleNodeAnimation} class with the given graph,
   * nodes, radius, number of revolutions, and preferred duration.
   * @param graph The graph the nodes belong to.
   * @param nodes The nodes.
   * @param radius The radius of the movement circle.
   * @param revolutions The number of revolutions around the circle.
   * @param duration The preferred duration for the animation.
   */
  constructor(graph, nodes, radius, revolutions, duration) {
    super()
    this.graph = graph
    this.radius = radius
    this.revolutions = revolutions
    this.duration = duration
    this.nodes = nodes.toList()
  }

  /**
   * Gets the preferred duration of the animation.
   * @see Specified by {@link IAnimation.preferredDuration}.
   */
  get preferredDuration() {
    return this.duration
  }

  /**
   * Initializes the animation. Call this method once before subsequent
   * calls to {@link IAnimation.animate}.
   * @see Specified by {@link IAnimation.initialize}.
   */
  initialize() {
    this.startBounds = this.nodes.map((n) => n.layout.toRect()).toList()
  }

  /**
   * Does the animation according to the relative animation time.
   * The animation starts with the time 0 and ends with time 1.
   * @param time the animation time [0,1]
   * @see Specified by {@link IAnimation.animate}.
   */
  animate(time) {
    const totalAngle = 2 * Math.PI * this.revolutions
    const currentAngle = totalAngle * time
    const offset = new Point(
      Math.cos(currentAngle) * this.radius,
      Math.sin(currentAngle) * this.radius
    )

    this.nodes.forEach((node, index) => {
      const topRight = new Point(this.radius, 0)
      const bounds = this.startBounds.get(index)
      const topLeft = bounds.topLeft
      const p = new Point(topLeft.x - topRight.x, topLeft.y - topRight.y)
      this.graph.setNodeLayout(node, new Rect(p.add(offset), bounds.size))
    })
  }

  /**
   * Cleans up after an animation has finished.
   * @see Specified by {@link IAnimation.cleanUp}.
   */
  cleanUp() {}
}
