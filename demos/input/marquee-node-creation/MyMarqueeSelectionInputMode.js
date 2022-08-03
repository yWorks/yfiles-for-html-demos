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
  BaseClass,
  CollectSnapResultsEventArgs,
  GraphSnapContext,
  HandlePositions,
  IInputModeContext,
  IRenderContext,
  IVisualTemplate,
  MarqueeSelectionEventArgs,
  MarqueeSelectionInputMode,
  NodeReshapeSnapResultProvider,
  Point,
  Rect,
  ReshapePolicy,
  ReshapeRectangleContext,
  SimpleNode,
  Size,
  SnapContext,
  SvgVisual
} from 'yfiles'

export default class MyMarqueeSelectionInputMode extends MarqueeSelectionInputMode {
  constructor() {
    super()
    this.snapContext = null
    this.priority = 50
    this.dummyNode = new SimpleNode()

    // determines in which quadrant the marquee is dragged
    this.currentReshapePosition = HandlePositions.NONE

    // customizing the marquee rect visualization to look like the current node
    this.template = new MyMarqueeTemplate()
  }

  /**
   * Creates a rectangle that incorporates the snap result
   * @param {!Point} startDragLocation
   * @param {!Point} currentDragLocation
   * @returns {!Rect}
   */
  calculateMarqueeRectangle(startDragLocation, currentDragLocation) {
    this.currentReshapePosition = HandlePositions.NONE
    if (startDragLocation.x > currentDragLocation.x) {
      this.currentReshapePosition |= HandlePositions.WEST
    } else {
      this.currentReshapePosition |= HandlePositions.EAST
    }
    if (startDragLocation.y > currentDragLocation.y) {
      this.currentReshapePosition |= HandlePositions.NORTH
    } else {
      this.currentReshapePosition |= HandlePositions.SOUTH
    }

    const snapState = this.getSnapContext().handleMove(currentDragLocation, false)
    const rect = super.calculateMarqueeRectangle(startDragLocation, snapState.location)

    this.dummyNode.layout = rect

    this.getSnapContext().dragged(currentDragLocation, snapState)
    return rect
  }

  /**
   * Called when a drag is started. Prepares the SnapContext for collecting results that the marquee can be snapped to.
   * @param {!MarqueeSelectionEventArgs} evt
   */
  onDragStarted(evt) {
    super.onDragStarted(evt)

    const snapContext = this.getSnapContext()

    snapContext.initializeDrag(
      IInputModeContext.createInputModeContext(this),
      this.selectionRectangle.topLeft
    )

    snapContext.addItemToBeReshaped(this.dummyNode)

    snapContext.dragInitialized()

    this.dummyNode.layout = new Rect(evt.rectangle)

    const initialBounds = new Rect(evt.rectangle)

    const lastEventLocation = this.inputModeContext?.canvasComponent?.lastEventLocation
    this.currentReshapePosition = this.getReshapePosition(lastEventLocation, evt.rectangle)

    this.getSnapContext().addItemToBeReshaped(this.dummyNode)

    const collectSnapResultsEventListener = (sender, evt1) => {
      const reshapePosition = this.currentReshapePosition
      const topLeftChangeFactor_x =
        (reshapePosition & HandlePositions.WEST) == HandlePositions.WEST ? 1 : 0
      const topLeftChangeFactor_y =
        (reshapePosition & HandlePositions.NORTH) == HandlePositions.NORTH ? 1 : 0
      const bottomRightChangeFactor_x =
        (reshapePosition & HandlePositions.WEST) == HandlePositions.WEST ? 0 : 1
      const bottomRightChangeFactor_y =
        (reshapePosition & HandlePositions.NORTH) == HandlePositions.NORTH ? 0 : 1
      const sizeChangeFactor_x =
        (reshapePosition & HandlePositions.WEST) == HandlePositions.WEST ? -1 : 1
      const sizeChangeFactor_y =
        (reshapePosition & HandlePositions.NORTH) == HandlePositions.NORTH ? -1 : 1

      NodeReshapeSnapResultProvider.INSTANCE.collectSnapResults(
        snapContext,
        evt1,
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
    snapContext.addCollectSnapResultsListener(collectSnapResultsEventListener)

    snapContext.addCleanedUpListener((sender, evt1) =>
      snapContext.removeCollectSnapResultsListener(collectSnapResultsEventListener)
    )
  }

  /**
   * Signals the SnapContext that the drag is finished.
   * @param {!MarqueeSelectionEventArgs} evt
   */
  onDragFinished(evt) {
    const x =
      this.currentReshapePosition & HandlePositions.WEST
        ? this.selectionRectangle.minX
        : this.selectionRectangle.maxX
    const y =
      this.currentReshapePosition & HandlePositions.NORTH
        ? this.selectionRectangle.minY
        : this.selectionRectangle.maxY
    this.getSnapContext().dragFinished(new Point(x, y), false)
    super.onDragFinished(evt)
  }

  /**
   * Signals the SnapContext that the drag has been canceled.
   * @param {!MarqueeSelectionEventArgs} evt
   */
  onDragCanceled(evt) {
    this.getSnapContext().cancelDrag()
  }

  /**
   * Looks up the current SnapContext or creates a new one
   */
  getSnapContext() {
    if (this.snapContext != null) {
      return this.snapContext
    } else {
      this.snapContext = super.inputModeContext.lookup(SnapContext.$class)
      if (this.snapContext == null) {
        return new GraphSnapContext()
      } else {
        return this.snapContext
      }
    }
  }

  /**
   * Determines the reshape position
   * @param {!Point} pointer
   * @param {!Rect} rect
   * @returns {!HandlePositions}
   */
  getReshapePosition(pointer, rect) {
    const result = HandlePositions.NONE
    if (pointer.x < rect.centerX) {
      this.currentReshapePosition |= HandlePositions.WEST
    } else {
      this.currentReshapePosition |= HandlePositions.EAST
    }
    if (pointer.y < rect.centerY) {
      this.currentReshapePosition |= HandlePositions.NORTH
    } else {
      this.currentReshapePosition |= HandlePositions.SOUTH
    }
    return result
  }
}

/**
 * This class wraps the current node style so as to be usable as a template for the marquee rectangle
 */
class MyMarqueeTemplate extends BaseClass(IVisualTemplate) {
  constructor() {
    super()
    this.dummyNode = new SimpleNode()
  }

  /**
   * @param {!IRenderContext} context
   * @param {!Rect} bounds
   * @param {*} dataObject
   * @returns {!SvgVisual}
   */
  createVisual(context, bounds, dataObject) {
    this.dummyNode.layout = bounds
    const graph = context.canvasComponent.inputModeContext.graph
    const wrappedStyle = graph.nodeDefaults.style
    const visualCreator = wrappedStyle.renderer.getVisualCreator(this.dummyNode, wrappedStyle)
    const visual = visualCreator.createVisual(context)
    if (visual) {
      visual.svgElement.setAttribute('opacity', '0.3')
    }
    return visual
  }
  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @param {!Rect} bounds
   * @param {*} dataObject
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, bounds, dataObject) {
    return this.createVisual(context, bounds, null)
  }
}
