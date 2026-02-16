/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphSnapContext,
  HandlePositions,
  InputModeContext,
  MarqueeSelectionInputMode,
  NodeReshapeSnapResultProvider,
  ObjectRendererBase,
  Point,
  Rect,
  ReshapePolicy,
  ReshapeRectangleContext,
  SimpleNode,
  Size
} from '@yfiles/yfiles'

export class MyMarqueeSelectionInputMode extends MarqueeSelectionInputMode {
  dummyNode

  // determines in which quadrant the marquee is dragged
  currentReshapePosition

  constructor() {
    super()
    this.priority = 50
    this.dummyNode = new SimpleNode()

    this.currentReshapePosition = HandlePositions.NONE

    this.useViewCoordinates = false

    // customizing the marquee rect visualization to look like the current node
    this.marqueeRenderer = new MyMarqueeTemplate()
  }

  /**
   * Creates a rectangle that incorporates the snap result
   */
  calculateMarqueeRectangle(startDragLocation, currentDragLocation) {
    this.currentReshapePosition = HandlePositions.NONE
    if (startDragLocation.x > currentDragLocation.x) {
      this.currentReshapePosition |= HandlePositions.LEFT
    } else {
      this.currentReshapePosition |= HandlePositions.RIGHT
    }
    if (startDragLocation.y > currentDragLocation.y) {
      this.currentReshapePosition |= HandlePositions.TOP
    } else {
      this.currentReshapePosition |= HandlePositions.BOTTOM
    }

    const snapState = this.getSnapContext().handleMove(currentDragLocation, false)
    const rect = super.calculateMarqueeRectangle(startDragLocation, snapState)

    this.dummyNode.layout = rect

    this.getSnapContext().dragged(currentDragLocation, snapState)
    return rect
  }

  /**
   * Called when a drag is started. Prepares the SnapContext for collecting results that the marquee can be snapped to.
   */
  onDragStarted(evt) {
    super.onDragStarted(evt)

    const snapContext = this.getSnapContext()

    snapContext.initializeDrag(
      new InputModeContext(this.parentInputModeContext),
      this.selectionRectangle.topLeft
    )

    snapContext.addItemToBeReshaped(this.dummyNode)

    snapContext.dragInitialized()

    this.dummyNode.layout = Rect.from(evt.rectangle)

    const initialBounds = Rect.from(evt.rectangle)

    const lastEventLocation = this.parentInputModeContext?.canvasComponent?.lastEventLocation
    this.currentReshapePosition = this.getReshapePosition(lastEventLocation, evt.rectangle)

    this.getSnapContext().addItemToBeReshaped(this.dummyNode)

    const collectSnapResultsEventListener = (evt) => {
      const reshapePosition = this.currentReshapePosition
      const topLeftChangeFactor_x =
        (reshapePosition & HandlePositions.LEFT) == HandlePositions.LEFT ? 1 : 0
      const topLeftChangeFactor_y =
        (reshapePosition & HandlePositions.TOP) == HandlePositions.TOP ? 1 : 0
      const bottomRightChangeFactor_x =
        (reshapePosition & HandlePositions.LEFT) == HandlePositions.LEFT ? 0 : 1
      const bottomRightChangeFactor_y =
        (reshapePosition & HandlePositions.TOP) == HandlePositions.TOP ? 0 : 1
      const sizeChangeFactor_x =
        (reshapePosition & HandlePositions.LEFT) == HandlePositions.LEFT ? -1 : 1
      const sizeChangeFactor_y =
        (reshapePosition & HandlePositions.TOP) == HandlePositions.TOP ? -1 : 1

      NodeReshapeSnapResultProvider.INSTANCE.collectSnapResults(
        snapContext,
        evt,
        this.dummyNode,
        new ReshapeRectangleContext(
          initialBounds,
          Size.ZERO,
          Size.INFINITE,
          Rect.EMPTY,
          Rect.INFINITE,
          reshapePosition,
          [topLeftChangeFactor_x, topLeftChangeFactor_y],
          [bottomRightChangeFactor_x, bottomRightChangeFactor_y],
          [sizeChangeFactor_x, sizeChangeFactor_y],
          ReshapePolicy.NONE,
          1
        )
      )
    }
    snapContext.addEventListener('collect-snap-results', collectSnapResultsEventListener)

    snapContext.addEventListener('cleaned-up', () =>
      snapContext.removeEventListener('collect-snap-results', collectSnapResultsEventListener)
    )
  }

  /**
   * Signals the SnapContext that the drag is finished.
   */
  onDragFinished(evt) {
    const x =
      this.currentReshapePosition & HandlePositions.LEFT
        ? this.selectionRectangle.x
        : this.selectionRectangle.maxX
    const y =
      this.currentReshapePosition & HandlePositions.TOP
        ? this.selectionRectangle.y
        : this.selectionRectangle.maxY
    this.getSnapContext().dragFinished(new Point(x, y), false)
    super.onDragFinished(evt)
  }

  /**
   * Signals the SnapContext that the drag has been canceled.
   */
  onDragCanceled(evt) {
    this.getSnapContext().cancelDrag()
  }

  snapContext = null

  /**
   * Looks up the current SnapContext or creates a new one
   */
  getSnapContext() {
    if (this.snapContext != null) {
      return this.snapContext
    } else {
      this.snapContext = this.parentInputModeContext.lookup(GraphSnapContext)
      if (this.snapContext == null) {
        return new GraphSnapContext()
      } else {
        return this.snapContext
      }
    }
  }

  /**
   * Determines the reshape position
   */
  getReshapePosition(pointer, rect) {
    const result = HandlePositions.NONE
    if (pointer.x < rect.centerX) {
      this.currentReshapePosition |= HandlePositions.LEFT
    } else {
      this.currentReshapePosition |= HandlePositions.RIGHT
    }
    if (pointer.y < rect.centerY) {
      this.currentReshapePosition |= HandlePositions.TOP
    } else {
      this.currentReshapePosition |= HandlePositions.BOTTOM
    }
    return result
  }
}

export class MyMarqueeTemplate extends ObjectRendererBase {
  dummyNode

  constructor() {
    super()
    this.dummyNode = new SimpleNode()
  }

  createVisual(context, renderTag) {
    this.dummyNode.layout = renderTag.selectionRectangle
    const graph = context.canvasComponent.inputModeContext.graph
    const wrappedStyle = graph.nodeDefaults.style
    const visualCreator = wrappedStyle.renderer.getVisualCreator(this.dummyNode, wrappedStyle)
    const visual = visualCreator.createVisual(context)
    if (visual) {
      visual.svgElement.setAttribute('opacity', '0.3')
    }
    return visual
  }

  updateVisual(context, oldVisual, renderTag) {
    return this.createVisual(context, renderTag)
  }
}
