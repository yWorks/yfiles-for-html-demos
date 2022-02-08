/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  ConstrainedHandle,
  IBend,
  ICanvasObject,
  ICanvasObjectDescriptor,
  IEdge,
  IHandle,
  IInputModeContext,
  INode,
  IRenderContext,
  IVisualCreator,
  Mapper,
  Matrix,
  Point,
  PortConstraint,
  PortSide,
  SvgVisual,
  Visual
} from 'yfiles'

/**
 * Helper class that provides a handle for the first and last bend of an edge
 * that interactively determines the port constraint.
 */
export default class PortConstraintBendHandle extends BaseClass(ConstrainedHandle, IVisualCreator) {
  /**
   * Creates a new handle that wraps the base handle.
   * @param {!IHandle} baseHandle
   * @param {boolean} sourceEnd
   * @param {!IBend} bend
   * @param {!Mapper.<IEdge,PortConstraint>} portConstraints
   */
  constructor(baseHandle, sourceEnd, bend, portConstraints) {
    super(baseHandle)
    this.portConstraints = portConstraints
    this.bend = bend
    this.sourceEnd = sourceEnd
    this.canvasObject = null
    this.sourceEnd = sourceEnd
    this.bend = bend
    this.portConstraints = portConstraints
  }

  /**
   * Called when a drag of the handle is initialized.
   * To indicate in which direction the port constraint will be assigned, an arrow visual is added.
   * @see overrides {@link ConstrainedHandle#onInitialized}
   * @param {!IInputModeContext} inputModeContext
   * @param {!Point} originalLocation
   */
  onInitialized(inputModeContext, originalLocation) {
    super.onInitialized(inputModeContext, originalLocation)
    // render the indicator
    this.installArrowPath(inputModeContext)
    const rootGroup = inputModeContext.canvasComponent.rootGroup
    this.canvasObject = rootGroup.addChild(this, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)
  }

  /**
   * Called when a drag of the handle is canceled.
   * The arrow visual is removed.
   * @see overrides {@link ConstrainedHandle#onCanceled}
   * @param {!IInputModeContext} inputModeContext
   * @param {!Point} originalLocation
   */
  onCanceled(inputModeContext, originalLocation) {
    super.onCanceled(inputModeContext, originalLocation)
    // remove the indicator
    this.uninstallArrowPath(inputModeContext)
    this.canvasObject.remove()
  }

  /**
   * Called when a drag of the handle is canceled.
   * The port constraints are assigned and the arrow visual is removed.
   * @see overrides {@link ConstrainedHandle#onFinished}
   * @param {!IInputModeContext} inputModeContext
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  onFinished(inputModeContext, originalLocation, newLocation) {
    super.onFinished(inputModeContext, originalLocation, newLocation)
    // remove the indicator
    this.uninstallArrowPath(inputModeContext)
    this.canvasObject.remove()

    // calculate the direction
    const port = this.sourceEnd ? this.bend.owner.sourcePort : this.bend.owner.targetPort
    const nodeLayout = port.owner.layout
    const portLocation = nodeLayout.center
    const bendLocation = this.bend.location.toPoint()
    const delta = bendLocation.subtract(portLocation)
    let pc = null
    if (delta.vectorLength > MIN_DISTANCE && !nodeLayout.contains(bendLocation)) {
      const direction = delta.normalized
      if (direction.isHorizontalVector) {
        if (direction.x > 0) {
          pc = PortConstraint.create(PortSide.EAST)
        } else {
          pc = PortConstraint.create(PortSide.WEST)
        }
      } else if (direction.y > 0) {
        pc = PortConstraint.create(PortSide.SOUTH)
      } else {
        pc = PortConstraint.create(PortSide.NORTH)
      }
    }

    // and set the port constraint
    if (pc === null) {
      this.portConstraints.delete(this.bend.owner)
    } else {
      this.portConstraints.set(this.bend.owner, pc)
    }
  }

  /**
   * Returns the unconstrained location.
   * @see overrides {@link ConstrainedHandle#constrainNewLocation}
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   * @returns {!Point}
   */
  constrainNewLocation(context, originalLocation, newLocation) {
    return newLocation
  }

  /**
   * Creates a visual that contains an arrow visualization for the direction of port constraints.
   * @see overrides {@link IVisualCreator#createVisual}
   * @param {!IRenderContext} context
   * @returns {!Visual}
   */
  createVisual(context) {
    const a = window.document.createElementNS('http://www.w3.org/2000/svg', 'use')
    a.href.baseVal = `#${BEND_HANDLE_PORT_CONSTRAINT_ARROW_TEMPLATE_KEY}`
    const transform = this.getArrowTransform()
    a.setAttribute('transform', transform.toSvgTransform())
    return new SvgVisual(a)
  }

  /**
   * Updates the arrow visualization for the direction of port constraints.
   * @see overrides {@link IVisualCreator#createVisual}
   * @param {!IRenderContext} context
   * @param {!Visual} oldVisual
   * @returns {!Visual}
   */
  updateVisual(context, oldVisual) {
    if (!(oldVisual instanceof SvgVisual)) {
      return this.createVisual(context)
    }
    const a = oldVisual.svgElement
    const transform = this.getArrowTransform()
    a.setAttribute('transform', transform.toSvgTransform())
    return oldVisual
  }

  /**
   * Returns a transform that put the arrow visualization in place.
   * The arrow is moved to the respective node and rotated in the according direction.
   * @returns {!Matrix}
   */
  getArrowTransform() {
    let transform = new Matrix()
    const port = this.sourceEnd ? this.bend.owner.sourcePort : this.bend.owner.targetPort
    const nodeLayout = port.owner.layout
    const portLocation = nodeLayout.center
    let { x: dx, y: dy } = portLocation
    const bendLocation = this.bend.location.toPoint()
    const delta = bendLocation.subtract(portLocation)
    if (delta.vectorLength > MIN_DISTANCE && !nodeLayout.contains(bendLocation)) {
      const direction = delta.normalized

      // rotate and translate arrow
      const arrowOffset = 11
      if (direction.isHorizontalVector) {
        if (direction.x > 0) {
          dx = nodeLayout.maxX + arrowOffset
          transform = this.sourceEnd
            ? new Matrix(-1, 0, 0, 1, dx, dy)
            : new Matrix(1, 0, 0, 1, dx, dy)
        } else {
          dx = nodeLayout.x - arrowOffset
          transform = this.sourceEnd
            ? new Matrix(1, 0, 0, -1, dx, dy)
            : new Matrix(-1, 0, 0, 1, dx, dy)
        }
      } else if (direction.y < 0) {
        dy = nodeLayout.y - arrowOffset
        transform = this.sourceEnd
          ? new Matrix(0, 1, 1, 0, dx, dy)
          : new Matrix(0, 1, -1, 0, dx, dy)
      } else {
        dy = nodeLayout.maxY + arrowOffset
        transform = this.sourceEnd
          ? new Matrix(0, -1, -1, 0, dx, dy)
          : new Matrix(0, -1, 1, 0, dx, dy)
      }
    }
    return transform
  }

  /**
   * Creates the arrow path and stores it in the defs section of the CanvasComponent.
   * @param {!IInputModeContext} context
   */
  installArrowPath(context) {
    if (window.document.getElementById(BEND_HANDLE_PORT_CONSTRAINT_ARROW_TEMPLATE_KEY) !== null) {
      // early exit if template has already been created
      return
    }
    const defs = context.canvasComponent.svgDefsManager.defs
    if (defs !== null) {
      const svgPath = window.document.createElementNS('http://www.w3.org/2000/svg', 'path')
      svgPath.setAttribute('fill', 'green')
      svgPath.setAttribute('d', 'M-15,0 L-5,10 L-2,7 L-5,4 L8,4 L8,-4 L-5,-4 L-2,-7 L-5,-10 Z')
      svgPath.setAttribute('id', BEND_HANDLE_PORT_CONSTRAINT_ARROW_TEMPLATE_KEY)

      defs.appendChild(svgPath)
    }
  }

  /**
   * Removes the arrow path from the defs section of the CanvasComponent.
   * @param {!IInputModeContext} context
   */
  uninstallArrowPath(context) {
    const arrowPathElement = window.document.getElementById(
      BEND_HANDLE_PORT_CONSTRAINT_ARROW_TEMPLATE_KEY
    )
    if (arrowPathElement !== null) {
      const defs = context.canvasComponent.svgDefsManager.defs
      if (defs !== null) {
        defs.removeChild(arrowPathElement)
      }
    }
  }
}

/**
 * The minimum distance to require for a port constraint
 */
const MIN_DISTANCE = 12

/**
 * The key to access the path element for the port constraint arrow in defs
 */
const BEND_HANDLE_PORT_CONSTRAINT_ARROW_TEMPLATE_KEY =
  'BEND_HANDLE_PORT_CONSTRAINT_ARROW_TEMPLATE_KEY'
