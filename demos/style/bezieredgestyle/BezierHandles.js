/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Class,
  Cursor,
  HandleTypes,
  IBend,
  IHandle,
  IInputModeContext,
  ILookup,
  IPoint,
  MoveInputMode,
  Point
} from 'yfiles'

const EPS = 1e-6

/**
 * Handle for an outer control point bend of a bezier curve
 * The outer control point bends are those that are not located on the path, but determine the slope of the segments.
 * If the control point triple is currently collinear, this implementation moves the <b>other</b> outer control point
 * of the triple so that this invariant is kept. Otherwise, the other control point is not adjusted.
 */
export class OuterControlPointHandle extends BaseClass(IHandle) {
  /**
   * Creates a new instance that wraps the original <code>coreHandle</code> for the given <code>bend</code>.
   * @param {!IHandle} coreHandle
   * @param {!IBend} bend
   */
  constructor(coreHandle, bend) {
    super()
    // The core bend handle that performs the actual bend movement.
    this.coreHandle = coreHandle
    // The bend that belongs to this handle instance
    this.bend = bend
    // The other handle that is controlled indirectly from us.
    this.slaveHandle = null
    // The original location ot the slave handle, required to perform the actual movement of the other handle.
    this.slaveOrigin = Point.ORIGIN
    // The location of the middle bend of a control point triple. This is used as the axis of rotation to keep the collinearity invariant.
    this.middleLocation = Point.ORIGIN
  }

  /**
   * Initializes our own drag and determines whether we are a slave or the master and if there are actual slvae handles in that case
   * @param {!IInputModeContext} context
   */
  initializeDrag(context) {
    this.coreHandle.initializeDrag(context)
    if (context.parentInputMode instanceof MoveInputMode) {
      // If we are moved via MoveInputMode (happens when the whole edge is dragged)
      // We only delegate to the core handle
      return
    }

    // If we are indirectly controlled from the other control point or the bend curve point
    // those implementations put a marker in the lookup
    // If such a marker is present, we DON'T delegate to the other handle and just move ourselves.
    const bcph = context.lookup(InnerControlPointHandle.$class)
    const cph = context.lookup(OuterControlPointHandle.$class)

    if (!bcph && !cph) {
      // We are the master handle and so we control the other one
      const index = this.bend.index

      // Whether this is the first or the last bend in such a control point triple
      const isFirstInTriplet = index % 3 === 1

      let otherBend = null
      let middleBend = null
      if (isFirstInTriplet && index < this.bend.owner.bends.size - 1) {
        // We are the first of the triple and there is a potential slave handle
        // So get the slave and the middle bend
        otherBend = this.bend.owner.bends.get(index + 2)
        middleBend = this.bend.owner.bends.get(index + 1)
      } else if (index >= 3) {
        // We are the last of the triple and there is a potential slave handle
        // So get the slave and the middle bend
        otherBend = this.bend.owner.bends.get(index - 2)
        middleBend = this.bend.owner.bends.get(index - 1)
      }
      if (
        otherBend &&
        middleBend &&
        areCollinear(this.bend.location, middleBend.location, otherBend.location)
      ) {
        this.slaveHandle = otherBend.lookup(IHandle.$class)
        this.middleLocation = middleBend.location.toPoint()
      }

      if (this.slaveHandle) {
        // There not only a bend, but actually a handle to control
        // notify it that it is the slave
        // We just put ourselves in the context, so our presence serves as flag to the other handle
        // And from now on control its actions.
        const childContext = IInputModeContext.createInputModeContext(
          context.parentInputMode,
          context,
          ILookup.createSingleLookup(this, OuterControlPointHandle.$class)
        )
        this.slaveHandle.initializeDrag(childContext)
        this.slaveOrigin = this.slaveHandle.location.toPoint()
      }
    }
  }

  /**
   * Move the core handle and if present also the slave handle in a way that the control point triple is collinear.
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  handleMove(context, originalLocation, newLocation) {
    this.coreHandle.handleMove(context, originalLocation, newLocation)

    if (this.slaveHandle) {
      // If necessary, rotate the slave handle
      // Move the other one by the point reflection of our move delta, keeping its distance, though
      const delta = newLocation.subtract(this.middleLocation)
      // The distance of the slave handle - we keep this
      const otherDist = this.slaveOrigin.subtract(this.middleLocation).vectorLength
      // We can use the original context since we have already done all decisions in InitializeDrag
      this.slaveHandle.handleMove(
        context,
        this.slaveOrigin,
        this.middleLocation.subtract(delta.normalized.multiply(otherDist))
      )
    }
  }

  /**
   * Cancel the movement on the core handle and if present also on the slave handle
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   */
  cancelDrag(context, originalLocation) {
    this.coreHandle.cancelDrag(context, originalLocation)

    if (this.slaveHandle) {
      // If necessary, cancel the movement of the slave handle, using its old origin
      // We can use the original context since we have already done all decisions in InitializeDrag
      this.slaveHandle.cancelDrag(context, this.slaveOrigin)
      this.slaveHandle = null
    }
  }

  /**
   * Finish the movement on the core handle and if present also on the slave handle
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  dragFinished(context, originalLocation, newLocation) {
    this.coreHandle.dragFinished(context, originalLocation, newLocation)
    if (this.slaveHandle) {
      // If necessary, rotate the slave handle
      // Move the other one by the point reflection of our move delta, keeping its distance, though
      const delta = newLocation.subtract(this.middleLocation)
      // The distance of the slave handle - we keep this
      const otherDist = this.slaveOrigin.subtract(this.middleLocation).vectorLength
      this.slaveHandle.dragFinished(
        context,
        this.slaveOrigin,
        this.middleLocation.subtract(delta.normalized.multiply(otherDist))
      )
      this.cleanUp()
    }
  }

  /**
   * Clean up work at the end of the gesture, either by canceling or finishing
   */
  cleanUp() {
    this.slaveHandle = null
  }

  /**
   * We use a slightly different visualization
   * @type {!HandleTypes}
   */
  get type() {
    return HandleTypes.DEFAULT | HandleTypes.VARIANT1
  }

  /**
   * Use the core handle's cursor
   * @type {!Cursor}
   */
  get cursor() {
    return this.coreHandle.cursor
  }

  /**
   * Use the core handle's location
   * @type {!IPoint}
   */
  get location() {
    return this.coreHandle.location
  }
}

/**
 * Handle for an inner control point bend of a bezier curve
 * The inner control point bends are those that are actually located on the path.
 * If the control point triple is currently collinear, this implementation moves the  outer control points
 * of the triple so that this invariant is kept. Otherwise, the other control points are not adjusted.
 */
export class InnerControlPointHandle extends BaseClass(IHandle) {
  /**
   * Creates a new instance that wraps the original <code>coreHandle</code> for the given <code>bend<code/>.
   * @param {!IHandle} coreHandle
   * @param {!IBend} bend
   */
  constructor(coreHandle, bend) {
    super()
    // The core bend handle that performs the actual bend movement.
    this.coreHandle = coreHandle
    // The bend that belongs to this handle instance
    this.bend = bend

    // The first (slave) handle in a control point triple
    this.firstSlaveHandle = null
    // The last (slave) handle in a control point triple
    this.lastSlaveHandle = null
    // The original location ot the first slave handle, required to perform the actual movement of the that handle.
    this.firstOrigin = Point.ORIGIN
    // The original location ot the last slave handle, required to perform the actual movement of the that handle.
    this.lastOrigin = Point.ORIGIN
  }

  /**
   * Initializes our own drag and determines whether we are a slave or the master and if there are actual slvae handles in that case
   * @param {!IInputModeContext} context
   */
  initializeDrag(context) {
    this.coreHandle.initializeDrag(context)

    if (context.parentInputMode instanceof MoveInputMode) {
      // If we are moved via MoveInputMode (happens when the whole edge is dragged)
      // We only delegate to the core handle
      return
    }

    const index = this.bend.index

    const firstBend = index > 0 ? this.bend.owner.bends.get(index - 1) : null
    const lastBend =
      index < this.bend.owner.bends.size - 1 ? this.bend.owner.bends.get(index + 1) : null

    if (
      firstBend &&
      lastBend &&
      areCollinear(firstBend.location, this.bend.location, lastBend.location)
    ) {
      // Put a marker in the context so that the slave handles can distinguish whether they are moved dependent from us, or are dragged directly
      const childContext = IInputModeContext.createInputModeContext(
        context.parentInputMode,
        context,
        ILookup.createSingleLookup(this, InnerControlPointHandle.$class)
      )
      this.firstSlaveHandle = firstBend.lookup(IHandle.$class)
      this.lastSlaveHandle = lastBend.lookup(IHandle.$class)

      if (this.firstSlaveHandle) {
        this.firstSlaveHandle.initializeDrag(childContext)
        this.firstOrigin = this.firstSlaveHandle.location.toPoint()
      }
      if (this.lastSlaveHandle) {
        this.lastSlaveHandle.initializeDrag(childContext)
        this.lastOrigin = this.lastSlaveHandle.location.toPoint()
      }
    }
  }

  /**
   * Move the core handle and if present also the slave handles in a way that the control point triple is collinear.
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  handleMove(context, originalLocation, newLocation) {
    const delta = newLocation.subtract(originalLocation)
    this.coreHandle.handleMove(context, originalLocation, newLocation)
    if (this.firstSlaveHandle) {
      this.firstSlaveHandle.handleMove(context, this.firstOrigin, this.firstOrigin.add(delta))
    }
    if (this.lastSlaveHandle) {
      this.lastSlaveHandle.handleMove(context, this.lastOrigin, this.lastOrigin.add(delta))
    }
  }

  /**
   * Cancel the movement on the core handle and if present also on the slave handles
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   */
  cancelDrag(context, originalLocation) {
    const childContext = IInputModeContext.createInputModeContext(
      context.parentInputMode,
      context,
      ILookup.createSingleLookup(this, InnerControlPointHandle.$class)
    )
    this.coreHandle.cancelDrag(context, originalLocation)
    if (this.firstSlaveHandle) {
      this.firstSlaveHandle.cancelDrag(childContext, this.firstOrigin)
    }
    if (this.lastSlaveHandle) {
      this.lastSlaveHandle.cancelDrag(childContext, this.lastOrigin)
    }
  }

  /**
   * Finish the movement on the core handle and if present also on the slave handles
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  dragFinished(context, originalLocation, newLocation) {
    const delta = newLocation.subtract(originalLocation)
    this.coreHandle.dragFinished(context, originalLocation, newLocation)
    if (this.firstSlaveHandle) {
      this.firstSlaveHandle.dragFinished(context, this.firstOrigin, this.firstOrigin.add(delta))
    }
    if (this.lastSlaveHandle) {
      this.lastSlaveHandle.dragFinished(context, this.lastOrigin, this.lastOrigin.add(delta))
    }
    this.cleanUp()
  }

  /**
   * Clean up work at the end of the gesture, either by canceling or finishing
   */
  cleanUp() {
    this.firstSlaveHandle = null
    this.lastSlaveHandle = null
  }

  /**
   * Use the core handle's type
   * @type {!HandleTypes}
   */
  get type() {
    return this.coreHandle.type
  }

  /**
   * Use the core handle's cursor
   * @type {!Cursor}
   */
  get cursor() {
    return this.coreHandle.cursor
  }

  /**
   * Use the core handle's location
   * @type {!IPoint}
   */
  get location() {
    return this.coreHandle.location
  }
}

/**
 * Checks whether three points are collinear.
 * @param {!IPoint} p1 the first point
 * @param {!IPoint} p2 the second point
 * @param {!IPoint} p3 the third point
 * @returns {boolean} true iff all three points are (approximately) collinear.
 */
function areCollinear(p1, p2, p3) {
  // Use the cross product to check whether we are collinear
  return Math.abs(0.5 * (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y))) < EPS
}

Class.fixType(InnerControlPointHandle)
Class.fixType(OuterControlPointHandle)
