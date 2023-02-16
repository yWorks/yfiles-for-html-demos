/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import {
  BezierEdgeStyle,
  CreateBendInputMode,
  CreateEdgeInputMode,
  GraphEditorInputMode,
  HandleInputMode,
  IBend,
  IEdge,
  IGraph,
  IModelItem,
  InputModeEventArgs,
  ItemEventArgs,
  Point,
  SelectionEventArgs
} from 'yfiles'
import { BezierCreateEdgeInputMode } from './BezierCreateEdgeInputMode.js'

export class BezierGraphEditorInputMode extends GraphEditorInputMode {
  /**
   * @param {!object} config
   */
  constructor(config) {
    super()
    this.config = config
  }

  /**
   * Overridden to ensure when deleting bezier bends, the correct number is actually removed.
   * This method doe the following:
   * - for each middle control point of a bezier control triple, it also selects both other control points
   * - if there are bezier control points selected where the middle control point is NOT selected, they are deselected.
   * So in effect, either a complete triple is removed (when the middle point is selected), or nothing (when ONLY one of the outer points is selected)
   * Exception: When only two control points are left, both are deleted together
   * @param {!SelectionEventArgs.<IModelItem>} args
   */
  onDeletingSelection(args) {
    const selectedCurveBends = args.selection
      .filter(
        bend =>
          bend instanceof IBend &&
          bend.owner.style instanceof BezierEdgeStyle &&
          bend.owner.bends.size % 3 === 2 &&
          bend.index % 3 === 2
      )
      .toList()
    selectedCurveBends.forEach(selectedCurveBend => {
      const curveBend = selectedCurveBend
      args.selection.setSelected(curveBend.owner.bends.get(curveBend.index - 1), true)
      args.selection.setSelected(curveBend.owner.bends.get(curveBend.index + 1), true)
    })
    // Remove remaining single control points from the list...
    const singularControlPoints = args.selection
      .filter(
        bend =>
          bend instanceof IBend &&
          bend.owner.style instanceof BezierEdgeStyle &&
          bend.owner.bends.size % 3 === 2 &&
          (bend.index === 0 ||
            bend.index === bend.owner.bends.size - 1 ||
            (bend.index % 3 === 1 &&
              !args.selection.isSelected(bend.owner.bends.get(bend.index + 1))) ||
            (bend.index % 3 === 0 &&
              !args.selection.isSelected(bend.owner.bends.get(bend.index + -1))))
      )
      .toList()
    singularControlPoints.forEach(singularControlPoint => {
      const owner = singularControlPoint.owner
      if (owner.bends.size > 2) {
        args.selection.setSelected(singularControlPoint, false)
      } else {
        // Special case: Remove both of the last control points
        args.selection.setSelected(owner.bends.get(0), true)
        args.selection.setSelected(owner.bends.get(1), true)
      }
    })

    super.onDeletingSelection(args)
  }

  /**
   * @param {!object} sender
   * @param {!ItemEventArgs.<IBend>} event
   */
  onCreateBendInputModeBendCreated(sender, event) {
    const bend = event.item
    if (bend) {
      const edge = bend.owner
      const mode = sender

      if (
        mode instanceof BezierCreateBendInputMode &&
        edge.style instanceof BezierEdgeStyle &&
        edge.bends.size % 3 === 2 &&
        bend.index % 3 === 2
      ) {
        // we need to remove the bend when the gesture is canceled.
        const handler = new BendCreationHandler(bend, this.graph, mode)
        handler.register(this.handleInputMode)
        try {
          this.dragBend(bend)
        } finally {
          handler.dragged()
        }
      } else {
        super.onCreateBendInputModeBendCreated(sender, event)
      }
    }
  }

  /**
   * This class removes the dragged bend when the handle input mode is canceled.
   * This is to support the {@link GraphEditorInputMode.onCreateBendInputModeBendCreated}
   * implementation for bends that are created during the gesture and the user wants to cancel
   * the gesture, not only moving the bend back to the original location, but also removing
   * the newly created bend.
   *
   * This implementation also removes the additionally created bends for a bezier edge and resets the positions of the control points.
   * @returns {!CreateBendInputMode}
   */
  createCreateBendInputMode() {
    const inputMode = new BezierCreateBendInputMode()
    inputMode.priority = 42
    return inputMode
  }

  /**
   * @returns {!CreateEdgeInputMode}
   */
  createCreateEdgeInputMode() {
    const inputMode = new BezierCreateEdgeInputMode()
    inputMode.priority = 45
    inputMode.createSmoothSplines = this.config.smoothSegments
    return inputMode
  }
}

/**
 * Custom input mode implementation that temporarily remembers all bend locations of the affected edge.
 * This is to make it easier to unroll the bend creation when the drag is canceled
 */
class BezierCreateBendInputMode extends CreateBendInputMode {
  /**
   * @type {!Map.<IBend,Point>}
   */
  get locationMementos() {
    return this.$locationMementos
  }

  constructor() {
    super()
    this.$locationMementos = new Map()
  }

  /**
   * @param {!IEdge} edge
   * @param {!Point} location
   * @returns {?IBend}
   */
  createBend(edge, location) {
    this.locationMementos.clear()
    edge.bends.forEach(existingBend => {
      this.locationMementos.set(existingBend, existingBend.location.toPoint())
    })
    return super.createBend(edge, location)
  }
}

class BendCreationHandler {
  /**
   * @param {!IBend} bend
   * @param {!IGraph} graph
   * @param {!BezierCreateBendInputMode} bendInputMode
   */
  constructor(bend, graph, bendInputMode) {
    this.bend = bend
    this.graph = graph
    this.bendInputMode = bendInputMode
    this.initialized = false
    this.inputMode = null

    this.dragStartedListener = null
    this.dragCanceledListener = null
    this.dragFinishedListener = null
  }

  /**
   * @param {!HandleInputMode} inputMode
   */
  register(inputMode) {
    this.inputMode = inputMode
    this.dragStartedListener = this.inputModeOnDragStarted.bind(this)
    this.dragCanceledListener = this.inputModeOnDragCanceled.bind(this)
    this.dragFinishedListener = this.inputModeOnDragFinished.bind(this)
    inputMode.addDragStartedListener(this.dragStartedListener)
    inputMode.addDragCanceledListener(this.dragCanceledListener)
    inputMode.addDragFinishedListener(this.dragFinishedListener)
  }

  /**
   * @param {!object} sender
   * @param {!InputModeEventArgs} args
   */
  inputModeOnDragFinished(sender, args) {
    this.unregister()
  }

  /**
   * @param {!object} sender
   * @param {!InputModeEventArgs} args
   */
  inputModeOnDragCanceled(sender, args) {
    this.unregister()
    if (this.graph.contains(this.bend)) {
      const edge = this.bend.owner
      const bendIndex = this.bend.index
      let previousBend = null
      let nextBend = null
      if (bendIndex > 0) {
        previousBend = edge.bends.get(bendIndex - 1)
      }
      let prevPrevBend = null
      if (bendIndex > 1) {
        prevPrevBend = edge.bends.get(bendIndex - 2)
      }
      if (bendIndex < edge.bends.size - 1) {
        nextBend = edge.bends.get(bendIndex + 1)
      }
      let nextNextBend = null
      if (bendIndex < edge.bends.size - 2) {
        nextNextBend = edge.bends.get(bendIndex + 2)
      }
      this.graph.remove(this.bend)
      // Also remove the additional bends
      if (previousBend) {
        this.graph.remove(previousBend)
      }
      if (nextBend) {
        this.graph.remove(nextBend)
      }
      // And roll back the position change of the adjacent bends
      if (prevPrevBend) {
        const oldLocation = this.bendInputMode.locationMementos.get(prevPrevBend)
        if (oldLocation) {
          this.graph.setBendLocation(prevPrevBend, oldLocation)
        }
      }
      if (nextNextBend) {
        const oldLocation = this.bendInputMode.locationMementos.get(nextNextBend)
        if (oldLocation) {
          this.graph.setBendLocation(nextNextBend, oldLocation)
        }
      }
    }
  }

  /**
   * @param {!object} sender
   * @param {!InputModeEventArgs} args
   */
  inputModeOnDragStarted(sender, args) {
    this.initialized = true
  }

  dragged() {
    if (!this.initialized) {
      this.unregister()
    }
  }

  unregister() {
    this.inputMode.removeDragStartedListener(this.dragStartedListener)
    this.inputMode.removeDragCanceledListener(this.dragCanceledListener)
    this.inputMode.removeDragFinishedListener(this.dragFinishedListener)
    this.dragStartedListener = null
    this.dragCanceledListener = null
    this.dragFinishedListener = null
  }
}
