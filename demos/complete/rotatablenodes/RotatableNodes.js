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
  CanvasComponent,
  Class,
  Cursor,
  GeneralPath,
  GraphComponent,
  GraphMLAttribute,
  GraphMLIOHandler,
  HandlePositions,
  HandleSerializationEventArgs,
  HandleTypes,
  ICanvasContext,
  IClipboardHelper,
  ICompoundEdit,
  IFocusIndicatorInstaller,
  IGraph,
  IGraphClipboardContext,
  IHandle,
  IHandleProvider,
  IHighlightIndicatorInstaller,
  IInputMode,
  IInputModeContext,
  IMarkupExtensionConverter,
  IModelItem,
  IModelItemCollector,
  INode,
  INodeStyle,
  IOrientedRectangle,
  IPoint,
  IPort,
  IPortLocationModel,
  IPortLocationModelParameter,
  IRenderContext,
  IReshapeHandleProvider,
  IReshapeHandler,
  ISelectionIndicatorInstaller,
  ISize,
  ISvgDefsCreator,
  IVisualTemplate,
  IWriteContext,
  List,
  MarkupExtension,
  Matrix,
  ModifierKeys,
  NodeStyleBase,
  OrientedRectangle,
  OrientedRectangleIndicatorInstaller,
  OrthogonalEdgeEditingContext,
  Point,
  PortLocationModelParameterHandle,
  Rect,
  ShapeNodeStyle,
  Size,
  SnapContext,
  SvgVisual,
  SvgVisualGroup,
  TypeAttribute,
  UndoEngine,
  UndoUnitBase,
  Visual,
  YNumber,
  ILookup
} from 'yfiles'

/**
 * A node style that displays another wrapped style rotated by a specified rotation angle.
 * The angle is stored in this decorator to keep the tag free for user data. Hence, this decorator
 * should not be shared between nodes if they can have different angles.
 */
export class RotatableNodeStyleDecorator extends BaseClass(
  NodeStyleBase,
  IMarkupExtensionConverter
) {
  /**
   * Creates a new instance with a wrapped node style and an angle.
   * @param {?INodeStyle} [wrapped=null]
   * @param {number} [angle=0]
   */
  constructor(wrapped = null, angle = 0) {
    super()
    this.rotatedLayout = new CachingOrientedRectangle()
    this.matrix = new Matrix()
    this.matrixAngle = 0
    this.inverseMatrix = new Matrix()
    this.inverseMatrixAngle = 0
    // Specifies the wrapped style.
    this.wrapped = wrapped || new ShapeNodeStyle()
    this.angle = angle || 0
    this.matrixCenter = Point.ORIGIN
    this.inverseMatrixCenter = Point.ORIGIN
  }

  /**
   * Returns the rotation angle.
   * @type {number}
   */
  get angle() {
    return this.rotatedLayout.angle
  }

  /**
   * Specifies the rotation angle.
   * @type {number}
   */
  set angle(angle) {
    this.rotatedLayout.angle = angle
  }

  /**
   * Creates a visual which rotates the visualization of the wrapped style.
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {!SvgVisualGroup}
   */
  createVisual(context, node) {
    const visual = this.wrapped.renderer.getVisualCreator(node, this.wrapped).createVisual(context)
    const container = new SvgVisualGroup()
    const matrix = new Matrix()
    matrix.rotate(toRadians(-this.angle), node.layout.center)
    container.transform = matrix
    container.add(visual)
    container['render-data-cache'] = {
      angle: this.angle,
      center: node.layout.center,
      wrapped: this.wrapped
    }
    context.registerForChildrenIfNecessary(container, this.disposeChildren.bind(this))
    return container
  }

  /**
   * Updates a visual which rotates the visualization of the wrapped style.
   * @param {!IRenderContext} context
   * @param {!SvgVisualGroup} oldVisual
   * @param {!INode} node
   * @returns {!SvgVisualGroup}
   */
  updateVisual(context, oldVisual, node) {
    if (!oldVisual.children || oldVisual.children.size !== 1) {
      return this.createVisual(context, node)
    }

    const cache = oldVisual['render-data-cache']

    const oldWrappedStyle = cache.wrapped
    const newWrappedStyle = this.wrapped

    const creator = this.wrapped.renderer.getVisualCreator(node, this.wrapped)

    const oldWrappedVisual = oldVisual.children.get(0)

    let newWrappedVisual
    if (newWrappedStyle !== oldWrappedStyle) {
      newWrappedVisual = creator ? creator.createVisual(context) : null
    } else {
      newWrappedVisual = creator ? creator.updateVisual(context, oldWrappedVisual) : null
    }

    if (oldWrappedVisual !== newWrappedVisual) {
      oldVisual.children.insert(0, newWrappedVisual)
      context.childVisualRemoved(oldWrappedVisual)
    }
    context.registerForChildrenIfNecessary(oldVisual, this.disposeChildren.bind(this))

    if (cache.angle !== this.angle || !cache.center.equals(node.layout.center)) {
      const matrix = new Matrix()
      matrix.rotate(toRadians(-this.angle), node.layout.center)
      oldVisual.transform = matrix
    }

    oldVisual['render-data-cache'] = {
      angle: this.angle,
      center: node.layout.center,
      wrapped: this.wrapped
    }

    return oldVisual
  }

  /**
   * Returns bounds based on the size provided by the wrapped style and the location and
   * rotation of the node.
   * @param {!ICanvasContext} context
   * @param {!INode} node
   */
  getBounds(context, node) {
    const nodeOrientedRect = this.getRotatedLayout(node)

    // Create an oriented rectangle with the size of the wrapped bounds and the location and rotation of the node
    const wrappedBounds = this.wrapped.renderer
      .getBoundsProvider(node, this.wrapped)
      .getBounds(context)

    const orientedRectangle = new OrientedRectangle(
      0,
      0,
      wrappedBounds.width,
      wrappedBounds.height,
      nodeOrientedRect.upX,
      nodeOrientedRect.upY
    )
    orientedRectangle.setCenter(node.layout.center)

    return orientedRectangle.bounds
  }

  /**
   * Returns the intersection point of the node's rotated bounds and the segment between the inner
   * and outer point or null if there is no intersection.
   * @param {!INode} node
   * @param {!Point} inner
   * @param {!Point} outer
   * @returns {?Point}
   */
  getIntersection(node, inner, outer) {
    const rotatedInner = this.getRotatedPoint(inner, node, false)
    const rotatedOuter = this.getRotatedPoint(outer, node, false)

    const rotatedIntersection = this.wrapped.renderer
      .getShapeGeometry(node, this.wrapped)
      .getIntersection(rotatedInner, rotatedOuter)
    if (rotatedIntersection) {
      return this.getRotatedPoint(rotatedIntersection, node, true)
    }
    return null
  }

  /**
   * Returns the outline of the node's rotated shape.
   * @param {!INode} node
   * @returns {!GeneralPath}
   */
  getOutline(node) {
    let outline = this.wrapped.renderer.getShapeGeometry(node, this.wrapped).getOutline()
    if (outline) {
      outline = outline.clone()
      outline.transform(this.getInverseRotationMatrix(node))
    } else {
      const layout = this.getRotatedLayout(node)
      outline = new GeneralPath()
      outline.appendOrientedRectangle(layout, false)
    }
    return outline
  }

  /**
   * Returns whether or not the given location is inside the rotated node.
   * @param {!IInputModeContext} context
   * @param {!Point} location
   * @param {!INode} node
   * @returns {boolean}
   */
  isHit(context, location, node) {
    // rotated the point like the node, that is by the angle around the node center
    const transformedPoint = this.getRotatedPoint(location, node, false)
    return this.wrapped.renderer.getHitTestable(node, this.wrapped).isHit(context, transformedPoint)
  }

  /**
   * Returns whether or not the given node is inside the rectangle.
   * @param {!IInputModeContext} context
   * @param {!Rect} rectangle
   * @param {!INode} node
   * @returns {boolean}
   */
  isInBox(context, rectangle, node) {
    const nodeOrientedRect = this.getRotatedLayout(node)

    // Create an oriented rectangle with the size of the wrapped bounds and the location and rotation of the node
    const wrappedBounds = this.wrapped.renderer
      .getBoundsProvider(node, this.wrapped)
      .getBounds(context)
    const orientedRectangle = new OrientedRectangle(
      0,
      0,
      wrappedBounds.width,
      wrappedBounds.height,
      nodeOrientedRect.upX,
      nodeOrientedRect.upY
    )
    orientedRectangle.setCenter(node.layout.center)

    return rectangle.intersects(orientedRectangle, 0.01)
  }

  /**
   * Returns whether or not the node is currently visible.
   * @param {!ICanvasContext} context
   * @param {!Rect} rectangle
   * @param {!INode} node
   * @returns {boolean}
   */
  isVisible(context, rectangle, node) {
    return (
      this.wrapped.renderer
        .getVisibilityTestable(node, this.wrapped)
        .isVisible(context, rectangle) || this.getBounds(context, node).intersects(rectangle)
    )
  }

  /**
   * Returns customized helpers that consider the node rotation for resizing and rotating gestures,
   * highlight indicators, and clipboard operations. Other lookup calls will be delegated to the
   * lookup of the wrapped node style.
   * @param {!INode} node
   * @param {!Class} type
   * @returns {!object}
   */
  lookup(node, type) {
    // Custom reshape handles that rotate with the node
    if (type === IReshapeHandleProvider.$class) {
      return new RotatedReshapeHandleProvider(node)
    }
    // Custom handle to rotate the node
    if (type === IHandleProvider.$class) {
      return new NodeRotateHandleProvider(node)
    }
    // Selection decoration
    if (type === ISelectionIndicatorInstaller.$class) {
      return new RotatableNodeIndicatorInstaller(
        OrientedRectangleIndicatorInstaller.SELECTION_TEMPLATE_KEY
      )
    }
    // Focus decoration
    if (type === IFocusIndicatorInstaller.$class) {
      return new RotatableNodeIndicatorInstaller(
        OrientedRectangleIndicatorInstaller.FOCUS_TEMPLATE_KEY
      )
    }
    // Highlight decoration
    if (type === IHighlightIndicatorInstaller.$class) {
      return new RotatableNodeIndicatorInstaller(
        OrientedRectangleIndicatorInstaller.HIGHLIGHT_TEMPLATE_KEY
      )
    }
    // Clipboard helper that clones the style instance when pasting rotated nodes
    if (type === IClipboardHelper.$class) {
      return new RotatableNodeClipboardHelper()
    }

    return (
      super.lookup(node, type) || this.wrapped.renderer.getContext(node, this.wrapped).lookup(type)
    )
  }

  /**
   * Creates a copy of this node style decorator.
   * @returns {*}
   */
  clone() {
    return new RotatableNodeStyleDecorator(this.wrapped, this.angle)
  }

  /**
   * Returns the rotated bounds of the node.
   * @param {!INode} node
   * @returns {!CachingOrientedRectangle}
   */
  getRotatedLayout(node) {
    this.rotatedLayout.updateCache(node.layout.toRect())
    return this.rotatedLayout
  }

  /**
   * Returns the rotated point.
   * @param {!Point} point
   * @param {!INode} node
   * @param {boolean} inverse
   * @returns {!Point}
   */
  getRotatedPoint(point, node, inverse) {
    const matrix = inverse ? this.getInverseRotationMatrix(node) : this.getRotationMatrix(node)
    return matrix.transform(point)
  }

  /**
   * Returns the rotation matrix for the given node and the current angle.
   * @param {!INode} node
   * @returns {!Matrix}
   */
  getRotationMatrix(node) {
    const center = node.layout.center
    if (!center.equals(this.matrixCenter) || this.angle !== this.matrixAngle) {
      this.matrix.reset()
      this.matrix.rotate(toRadians(this.angle), center)
      this.matrixCenter = center
      this.matrixAngle = this.angle
    }
    return this.matrix
  }

  /**
   * Returns the inverse rotation matrix for the given node and the current angle.
   * @param {!INode} node
   * @returns {!Matrix}
   */
  getInverseRotationMatrix(node) {
    const center = node.layout.center
    if (!center.equals(this.inverseMatrixCenter) || this.angle !== this.inverseMatrixAngle) {
      this.inverseMatrix.reset()
      this.inverseMatrix.rotate(toRadians(-this.angle), center)
      this.inverseMatrixCenter = center
      this.inverseMatrixAngle = this.angle
    }
    return this.inverseMatrix
  }

  /**
   * @param {!IRenderContext} context
   * @param {!Visual} removedVisual
   * @param {boolean} _dispose
   * @returns {?Visual}
   */
  disposeChildren(context, removedVisual, _dispose) {
    const container = removedVisual instanceof SvgVisualGroup ? removedVisual : null
    if (container != null && container.children.size > 0) {
      context.childVisualRemoved(container.children.get(0))
    }
    return null
  }

  /**
   * Returns that this style can be converted.
   * @param {!IWriteContext} context The current write context.
   * @param {*} value The object to convert.
   * @returns {boolean}
   */
  canConvert(context, value) {
    return true
  }

  /**
   * Converts this style using {@link RotatableNodeStyleDecoratorExtension}.
   * @param {!IWriteContext} context The current write context.
   * @param {*} value The object to convert.
   * @returns {!MarkupExtension}
   */
  convert(context, value) {
    const extension = new RotatableNodeStyleDecoratorExtension()
    extension.wrapped = value.wrapped
    extension.angle = value.angle
    return extension
  }
}

/**
 * An extension of {OrientedRectangleIndicatorInstaller} that uses the rotated layout of nodes
 * using a
 * {@link RotatableNodeStyleDecorator}. The indicator will be rotated to fit the rotated bounds of
 * the node.
 */
class RotatableNodeIndicatorInstaller extends OrientedRectangleIndicatorInstaller {
  /**
   * Creates a new instance with a visualization described by a template key.
   * @param {!string} templateKey
   */
  constructor(templateKey) {
    super(null, templateKey)
    if (templateKey === OrientedRectangleIndicatorInstaller.FOCUS_TEMPLATE_KEY) {
      this.template = IVisualTemplate.create({
        createVisual(context, bounds) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          rect.setAttribute('x', bounds.x.toString())
          rect.setAttribute('y', bounds.y.toString())
          rect.setAttribute('width', bounds.width.toString())
          rect.setAttribute('height', bounds.height.toString())
          rect.setAttribute('stroke', 'black')
          rect.setAttribute('stroke-dasharray', '2, 2')
          rect.setAttribute('stroke-dashoffset', '1.5')
          rect.setAttribute('stroke-linecap', 'butt')
          rect.setAttribute('fill', 'none')
          return new SvgVisual(rect)
        },
        updateVisual(context, oldVisual, bounds) {
          const rect = oldVisual.svgElement
          rect.setAttribute('x', bounds.x.toString())
          rect.setAttribute('y', bounds.y.toString())
          rect.setAttribute('width', bounds.width.toString())
          rect.setAttribute('height', bounds.height.toString())
          return oldVisual
        }
      })
    } else if (templateKey === OrientedRectangleIndicatorInstaller.HIGHLIGHT_TEMPLATE_KEY) {
      this.template = IVisualTemplate.create({
        createVisual(context, bounds) {
          const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')
          const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          rect1.setAttribute('x', bounds.x.toString())
          rect1.setAttribute('y', bounds.y.toString())
          rect1.setAttribute('width', bounds.width.toString())
          rect1.setAttribute('height', bounds.height.toString())
          rect1.setAttribute('stroke', 'black')
          rect1.setAttribute('stroke-width', '3')
          rect1.setAttribute('fill', 'none')
          container.appendChild(rect1)
          const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          rect2.setAttribute('x', bounds.x.toString())
          rect2.setAttribute('y', bounds.y.toString())
          rect2.setAttribute('width', bounds.width.toString())
          rect2.setAttribute('height', bounds.height.toString())
          rect2.setAttribute('stroke', 'white')
          rect2.setAttribute('fill', 'none')
          container.appendChild(rect2)
          return new SvgVisual(container)
        },
        updateVisual(context, oldVisual, bounds) {
          const container = oldVisual.svgElement
          const rect1 = container.firstChild
          rect1.setAttribute('x', bounds.x.toString())
          rect1.setAttribute('y', bounds.y.toString())
          rect1.setAttribute('width', bounds.width.toString())
          rect1.setAttribute('height', bounds.height.toString())
          const rect2 = container.lastChild
          rect2.setAttribute('x', bounds.x.toString())
          rect2.setAttribute('y', bounds.y.toString())
          rect2.setAttribute('width', bounds.width.toString())
          rect2.setAttribute('height', bounds.height.toString())
          return oldVisual
        }
      })
    }
  }

  /**
   * Returns the rotated layout of the specified node.
   * @param {!INode} item
   * @returns {!IOrientedRectangle}
   */
  getRectangle(item) {
    const styleWrapper = item.style
    if (styleWrapper instanceof RotatableNodeStyleDecorator) {
      return styleWrapper.getRotatedLayout(item)
    }
    return new OrientedRectangle(item.layout)
  }
}

/**
 * A node reshape handle that adjusts its position according to the node rotation.
 */
class RotatedNodeResizeHandle extends BaseClass(IHandle, IPoint) {
  /**
   * Creates a new instance.
   *
   * @param {!HandlePositions} position The position of the handle around the node
   * @param {!INode} node The node to resize
   * @param {!IReshapeHandler} reshapeHandler the original reshape handler of the node
   * @param {boolean} symmetricResize whether or not the node is symmetrically resized.
   */
  constructor(position, node, reshapeHandler, symmetricResize) {
    super()
    this.symmetricResize = symmetricResize
    this.reshapeHandler = reshapeHandler
    this.node = node
    this.position = position
    this.portHandles = new List()
    this.dummyLocation = null
    this.dummySize = null
    this.initialRect = null
    this.initialLayout = new OrientedRectangle(this.getNodeBasedOrientedRectangle())
  }

  /**
   * Returns the node rotation information.
   * @returns {!CachingOrientedRectangle}
   */
  getNodeBasedOrientedRectangle() {
    if (this.node.style instanceof RotatableNodeStyleDecorator) {
      return this.node.style.getRotatedLayout(this.node)
    }
    return new CachingOrientedRectangle()
  }

  /**
   * Sets the original node bounds according to the given anchor location and size.
   * @param {!IInputModeContext} inputModeContext
   * @param {!Point} anchor
   * @param {!ISize} size
   * @returns {!Rect}
   */
  setNodeLocationAndSize(inputModeContext, anchor, size) {
    const graph = inputModeContext.graph
    if (!graph) {
      return Rect.EMPTY
    }
    const orientedRectangle = new OrientedRectangle(
      anchor.x,
      anchor.y,
      size.width,
      size.height,
      this.initialLayout.upX,
      this.initialLayout.upY
    )
    const center = orientedRectangle.orientedRectangleCenter

    const layout = Rect.fromCenter(center, size.toSize())
    graph.setNodeLayout(this.node, layout)
    return layout
  }

  /**
   * Defines the visualization of the handle. In this case a dot that rotates nicely.
   * @type {!HandleTypes}
   */
  get type() {
    return HandleTypes.RESIZE
  }

  /**
   * Returns the cursor visualization according to the handle position.
   * @type {!Cursor}
   */
  get cursor() {
    const layout = this.getNodeBasedOrientedRectangle()
    const angle = layout.angle
    const cursors = [Cursor.NESW_RESIZE, Cursor.NS_RESIZE, Cursor.NWSE_RESIZE, Cursor.EW_RESIZE]
    let index
    // Pick the right array index for the respective handle location
    switch (this.position) {
      case HandlePositions.NORTH_WEST:
      case HandlePositions.SOUTH_EAST:
        index = 2
        break
      case HandlePositions.NORTH:
      case HandlePositions.SOUTH:
        index = 1
        break
      case HandlePositions.NORTH_EAST:
      case HandlePositions.SOUTH_WEST:
        index = 0
        break
      case HandlePositions.EAST:
      case HandlePositions.WEST:
        index = 3
        break
      default:
        return Cursor.POINTER
    }
    // Then shift the array position according to the rotation angle
    index += Math.round(angle / 45)
    index %= cursors.length
    if (index < 0) {
      index += cursors.length
    }
    return cursors[index % cursors.length]
  }

  /**
   * Gets the location of this handle considering the node rotation.
   * @type {!Point}
   */
  get location() {
    return this.getLocation(this.getNodeBasedOrientedRectangle(), this.position)
  }

  /**
   * Stores the initial layout of the node in case the user cancels the resizing.
   * @param {!IInputModeContext} inputModeContext
   */
  initializeDrag(inputModeContext) {
    if (this.reshapeHandler) {
      // if there is a reshape handler: initialize to
      // ensure proper handling of a parent group node
      this.reshapeHandler.initializeReshape(inputModeContext)
    }
    this.initialLayout.reshape(this.getNodeBasedOrientedRectangle())
    this.dummyLocation = this.initialLayout.anchorLocation
    this.dummySize = this.initialLayout.size
    this.initialRect = this.node.layout.toRect()

    this.portHandles.clear()
    const portContext = new DelegatingContext(inputModeContext)
    this.node.ports.forEach(port => {
      const portHandle = new DummyPortLocationModelParameterHandle(port)
      portHandle.initializeDrag(portContext)
      this.portHandles.add(portHandle)
    })
  }

  /**
   * Adjusts the node location and size according to the new handle location.
   * @param {!IInputModeContext} inputModeContext
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  handleMove(inputModeContext, originalLocation, newLocation) {
    // calculate how much the the handle was moved
    const upNormal = new Point(-this.initialLayout.upY, this.initialLayout.upX)
    const deltaW = this.getWidthDelta(originalLocation, newLocation, upNormal)
    const up = this.initialLayout.upVector
    const deltaH = this.getHeightDelta(originalLocation, newLocation, up)

    // add one or two times delta to the width to expand the node right and left
    this.dummySize = new Size(
      this.initialLayout.width + deltaW * (this.symmetricResize ? 2 : 1),
      this.initialLayout.height + deltaH * (this.symmetricResize ? 2 : 1)
    )

    // Calculate the new location.
    // Depending on our handle position, a different corner of the node should stay fixed.
    if (this.symmetricResize) {
      const dx = upNormal.x * deltaW + up.x * deltaH
      const dy = upNormal.y * deltaW + up.y * deltaH
      this.dummyLocation = this.initialLayout.anchorLocation.subtract(new Point(dx, dy))
    } else {
      const w = this.dummySize.width - this.initialLayout.width
      const h = this.dummySize.height - this.initialLayout.height
      switch (this.position) {
        case HandlePositions.NORTH_WEST:
          this.dummyLocation = this.initialLayout.anchorLocation.subtract(
            new Point(-up.y * w, up.x * w)
          )
          break
        case HandlePositions.SOUTH:
        case HandlePositions.SOUTH_WEST:
        case HandlePositions.WEST:
          this.dummyLocation = this.initialLayout.anchorLocation.subtract(
            new Point(up.x * h - up.y * w, up.y * h + up.x * w)
          )
          break
        case HandlePositions.SOUTH_EAST:
          this.dummyLocation = this.initialLayout.anchorLocation.subtract(
            new Point(up.x * h, up.y * h)
          )
          break
        // case HandlePositions.North:
        // case HandlePositions.NorthEast:
        // case HandlePositions.East:
        default:
          this.dummyLocation = this.initialLayout.anchorLocation
          break
      }
    }

    const newLayout = this.setNodeLocationAndSize(
      inputModeContext,
      this.dummyLocation,
      this.dummySize
    )

    const portContext = new DelegatingContext(inputModeContext)
    this.portHandles.forEach(portHandle => {
      portHandle.handleMove(portContext, this.dummyLocation, newLocation)
    })
    if (this.reshapeHandler) {
      // if there is a reshape handler:
      // ensure proper handling of a parent group node
      this.reshapeHandler.handleReshape(inputModeContext, this.initialRect, newLayout)
    }
  }

  /**
   * Returns the delta by which the width of the node was changed.
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   * @param {!Point} vector
   * @returns {number}
   */
  getWidthDelta(originalLocation, newLocation, vector) {
    switch (this.position) {
      case HandlePositions.NORTH_WEST:
      case HandlePositions.WEST:
      case HandlePositions.SOUTH_WEST:
        // calculate the total distance the handle has been moved in this drag gesture
        // max with minus half the node size - because the node can't shrink below zero
        return Math.max(
          vector.scalarProduct(originalLocation.subtract(newLocation)),
          -this.initialLayout.width * (this.symmetricResize ? 0.5 : 1)
        )
      case HandlePositions.NORTH_EAST:
      case HandlePositions.EAST:
      case HandlePositions.SOUTH_EAST:
        return Math.max(
          vector.scalarProduct(newLocation.subtract(originalLocation)),
          -this.initialLayout.width * (this.symmetricResize ? 0.5 : 1)
        )
      default:
        return 0.0
    }
  }

  /**
   * Returns the delta by which the height of the node was changed.
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   * @param {!Point} vector
   * @returns {number}
   */
  getHeightDelta(originalLocation, newLocation, vector) {
    switch (this.position) {
      case HandlePositions.NORTH_WEST:
      case HandlePositions.NORTH:
      case HandlePositions.NORTH_EAST:
        return Math.max(
          vector.scalarProduct(newLocation.subtract(originalLocation)),
          -this.initialLayout.height * (this.symmetricResize ? 0.5 : 1)
        )
      case HandlePositions.SOUTH_WEST:
      case HandlePositions.SOUTH:
      case HandlePositions.SOUTH_EAST:
        return Math.max(
          vector.scalarProduct(originalLocation.subtract(newLocation)),
          -this.initialLayout.height * (this.symmetricResize ? 0.5 : 1)
        )
      default:
        return 0.0
    }
  }

  /**
   * Restores the original node layout.
   * @param {!IInputModeContext} inputModeContext
   * @param {!Point} originalLocation
   */
  cancelDrag(inputModeContext, originalLocation) {
    this.setNodeLocationAndSize(
      inputModeContext,
      this.initialLayout.anchor.toPoint(),
      this.initialLayout.size.toSize()
    )
    const portContext = new DelegatingContext(inputModeContext)
    this.portHandles.forEach(portHandle => {
      portHandle.cancelDrag(portContext, originalLocation)
    })
    this.portHandles.clear()
    if (this.reshapeHandler) {
      // if there is a reshape handler:
      // ensure proper handling of a parent group node
      this.reshapeHandler.cancelReshape(inputModeContext, this.initialRect)
    }
  }

  /**
   * Applies the new node layout.
   * @param {!IInputModeContext} inputModeContext
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  dragFinished(inputModeContext, originalLocation, newLocation) {
    const newLayout = this.setNodeLocationAndSize(
      inputModeContext,
      this.dummyLocation,
      this.dummySize
    )
    const portContext = new DelegatingContext(inputModeContext)
    this.portHandles.forEach(portHandle => {
      portHandle.dragFinished(portContext, originalLocation, newLocation)
    })
    this.portHandles.clear()
    if (this.reshapeHandler) {
      // if there is a reshape handler:
      // ensure proper handling of a parent group node
      this.reshapeHandler.reshapeFinished(inputModeContext, this.initialRect, newLayout)
    }
  }

  /**
   * Gets the location that is specified by the given ratios.
   * @param {!IOrientedRectangle} rectangle
   * @param {number} ratioWidth
   * @param {number} ratioHeight
   * @returns {!Point}
   */
  static getLocation(rectangle, ratioWidth, ratioHeight) {
    const x1 = rectangle.anchorX
    const y1 = rectangle.anchorY

    const upX = rectangle.upX
    const upY = rectangle.upY

    const w = rectangle.width * ratioWidth
    const h = rectangle.height * ratioHeight
    const x2 = x1 + upX * h - upY * w
    const y2 = y1 + upY * h + upX * w
    return new Point(x2, y2)
  }

  /**
   * Returns the x-coordinate of the rotated bounds.
   * @type {number}
   */
  get x() {
    return this.getLocation(this.getNodeBasedOrientedRectangle(), this.position).x
  }

  /**
   * Returns the y-coordinate of the rotated bounds.
   * @type {number}
   */
  get y() {
    return this.getLocation(this.getNodeBasedOrientedRectangle(), this.position).y
  }

  /**
   * Returns the location of the specified position on the border of the oriented rectangle.
   * @param {!IOrientedRectangle} layout
   * @param {!HandlePositions} position
   * @returns {!Point}
   */
  getLocation(layout, position) {
    if (!layout) {
      return this.node.layout.toPoint()
    }
    switch (position) {
      case HandlePositions.NORTH_WEST:
        return RotatedNodeResizeHandle.getLocation(layout, 0.0, 1.0)
      case HandlePositions.NORTH:
        return RotatedNodeResizeHandle.getLocation(layout, 0.5, 1.0)
      case HandlePositions.NORTH_EAST:
        return RotatedNodeResizeHandle.getLocation(layout, 1.0, 1.0)
      case HandlePositions.EAST:
        return RotatedNodeResizeHandle.getLocation(layout, 1.0, 0.5)
      case HandlePositions.SOUTH_EAST:
        return RotatedNodeResizeHandle.getLocation(layout, 1.0, 0.0)
      case HandlePositions.SOUTH:
        return RotatedNodeResizeHandle.getLocation(layout, 0.5, 0.0)
      case HandlePositions.SOUTH_WEST:
        return layout.anchorLocation
      case HandlePositions.WEST:
        return RotatedNodeResizeHandle.getLocation(layout, 0.0, 0.5)
      default:
        throw new Error()
    }
  }
}

/**
 * Provides reshape handles for rotated nodes.
 */
class RotatedReshapeHandleProvider extends BaseClass(IReshapeHandleProvider) {
  /**
   * Creates a new instance for a given node.
   * @param {!INode} node
   */
  constructor(node) {
    super()
    this.node = node
    // use a reshape handler to properly handle
    // implicit resizing of parent group nodes
    this.reshapeHandler = node.lookup(IReshapeHandler.$class)
  }

  /**
   * Returns all eight positions around a node.
   * @param {!IInputModeContext} inputModeContext
   * @returns {!HandlePositions}
   */
  getAvailableHandles(inputModeContext) {
    return HandlePositions.BORDER
  }

  /**
   * Returns a RotatedNodeResizeHandle for the given position and node.
   * @param {!IInputModeContext} inputModeContext
   * @param {!HandlePositions} position
   * @returns {!IHandle}
   */
  getHandle(inputModeContext, position) {
    return new RotatedNodeResizeHandle(position, this.node, this.reshapeHandler, false)
  }
}

/**
 * Provides a rotate handle for a given node.
 */
class NodeRotateHandleProvider extends BaseClass(IHandleProvider) {
  /**
   * Creates a new instance for the given node.
   * @param {!INode} node
   */
  constructor(node) {
    super()
    this.node = node
    this.node = node
    this.reshapeHandler = node.lookup(IReshapeHandler.$class)
    // Specifies the angular step size to which rotation should snap (in degrees).
    // Default is 45. Setting this to zero will disable snapping to predefined steps.
    this.snapStep = 45
    // Specifies the snapping distance when rotation should snap (in degrees).
    // The rotation will snap if the angle is less than this distance from a <see
    // cref="SnapStep">snapping angle</see>. Default is 10. Setting this to a non-positive value will
    // disable snapping to predefined steps.
    this.snapDelta = 10
    // Specifies the snapping distance (in degrees) for snapping to the same angle as other visible
    // nodes. Rotation will snap to another node's rotation angle if the current angle differs from
    // the other one by less than this. The default is 5. Setting this to a non-positive value will
    // disable same angle snapping.
    this.snapToSameAngleDelta = 5
  }

  /**
   * Returns a set of handles for the rotated node.
   * @param {!IInputModeContext} context
   * @returns {!List.<IHandle>}
   */
  getHandles(context) {
    const handle = new NodeRotateHandle(this.node, this.reshapeHandler)
    handle.snapDelta = this.snapDelta
    handle.snapStep = this.snapStep
    handle.snapToSameAngleDelta = this.snapToSameAngleDelta

    return List.fromArray([handle])
  }
}

/**
 * @typedef {Object} SameAngleGroup
 * @property {number} angle
 * @property {Array.<INode>} nodes
 */

/**
 * A custom {@link IHandle} implementation that implements the functionality needed for rotating a
 * label.
 */
export class NodeRotateHandle extends BaseClass(IHandle, IPoint) {
  /**
   * Creates a new instance.
   * @param {!INode} node
   * @param {!IReshapeHandler} reshapeHandler
   */
  constructor(node, reshapeHandler) {
    super()
    this.reshapeHandler = reshapeHandler
    this.node = node
    this.portHandles = new List()
    this.rotationCenter = null
    this.initialAngle = 0
    this.compoundEdit = null

    // Load the custom rotation cursor
    this._cursor = new Cursor('resources/rotate.cur', Cursor.CROSSHAIR)

    // A cache of angles and nodes with those angles used for same angle snapping.
    this.nodeAngles = null

    // The currently highlighted nodes for same angle snapping.
    this.sameAngleHighlightedNodes = null

    // Specifies the threshold value the specifies whether the angle should snap to the next multiple
    // of
    // {@link #snapStep} in degrees. Set a value less than or equal to zero to disable this feature.
    this.snapDelta = 0
    // Specifies the steps in degrees to which rotation should snap to.
    this.snapStep = 0
    // Specifies the snapping distance (in degrees) for snapping to the same angle as other visible
    // nodes. Rotation will snap to another node's rotation angle if the current angle differs from
    // the other one by less than this. The default is 5. Setting this to a non-positive value will
    // disable same angle snapping.
    this.snapToSameAngleDelta = 0
  }

  /**
   * Returns the current oriented rectangle for the given node.
   * @param {!INode} node
   * @returns {!CachingOrientedRectangle}
   */
  getOrientedRectangle(node) {
    const wrapper = node.style
    return wrapper instanceof RotatableNodeStyleDecorator
      ? wrapper.getRotatedLayout(node)
      : new CachingOrientedRectangle()
  }

  /**
   * Returns the type of handle which is used.
   * @type {!HandleTypes}
   */
  get type() {
    return HandleTypes.MOVE
  }

  /**
   * Returns the cursor that is shown when using this handle.
   * @type {!Cursor}
   */
  get cursor() {
    return this._cursor
  }

  /**
   * Returns the location of the handle.
   * Since this instance also implements {@link IPoint}, we can simply return this.
   * @type {*}
   */
  get location() {
    return this
  }

  /**
   * Initializes the drag.
   * @param {!IInputModeContext} inputModeContext
   */
  initializeDrag(inputModeContext) {
    const imc = inputModeContext.lookup(IModelItemCollector.$class)
    if (imc) {
      imc.add(this.node)
    }
    this.rotationCenter = this.node.layout.center
    this.initialAngle = this.getAngle()

    const graph = inputModeContext.graph
    if (graph) {
      this.compoundEdit = graph.beginEdit('Change Rotation Angle', 'Change Rotation Angle')
    }

    this.portHandles.clear()
    const portContext = new DelegatingContext(inputModeContext)
    this.node.ports.forEach(port => {
      const portHandle = new DummyPortLocationModelParameterHandle(port)
      portHandle.initializeDrag(portContext)
      this.portHandles.add(portHandle)
    })
    if (this.reshapeHandler) {
      this.reshapeHandler.initializeReshape(inputModeContext)
    }
    // Collect other visible nodes and their angles and can be rotated and are not *this* node
    if (this.snapToSameAngleDelta > 0) {
      const canvas = inputModeContext.canvasComponent

      // only collect nodes that are in the viewport
      const rotatedNodes = canvas
        .getCanvasObjects()
        .filter(co => {
          const userObject = co.userObject
          return (
            userObject !== this.node &&
            userObject instanceof INode &&
            userObject.style instanceof RotatableNodeStyleDecorator &&
            canvas.viewport.intersects(userObject.layout.toRect())
          )
        })
        .map(co => co.userObject)
      // Group nodes by identical angles
      this.nodeAngles = rotatedNodes.reduce((groups, node) => {
        const angle = node.style.angle
        const group = groups.find(g => g.angle === angle)
        if (group) {
          group.nodes.push(node)
        } else {
          groups.push({
            angle,
            nodes: [node]
          })
        }
        return groups
      }, [])
    }
  }

  /**
   * Updates the node according to the moving handle.
   * @param {!IInputModeContext} inputModeContext
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  handleMove(inputModeContext, originalLocation, newLocation) {
    // calculate the angle
    const vector = newLocation.subtract(this.rotationCenter).normalized
    let angle = this.calculateAngle(vector)
    if (this.shouldSnap(inputModeContext)) {
      angle = this.snapAngle(inputModeContext, angle)
    }
    this.setAngle(inputModeContext, angle)

    const portContext = new DelegatingContext(inputModeContext)
    this.portHandles.forEach(portHandle => {
      portHandle.handleMove(portContext, originalLocation, newLocation)
    })
    if (this.reshapeHandler) {
      this.reshapeHandler.handleReshape(
        inputModeContext,
        this.node.layout.toRect(),
        this.node.layout.toRect()
      )
    }
  }

  /**
   * Returns the 'snapped' vector for the given up vector.
   * If the vector is almost horizontal or vertical, this method returns the exact horizontal or
   * vertical up vector instead.
   * @param {!Point} upVector
   * @returns {number}
   */
  calculateAngle(upVector) {
    return normalizeAngle(-((Math.atan2(upVector.y, upVector.x) / Math.PI) * 180 + 90))
  }

  /**
   * Snaps the angle to the rotation angles of other nodes and the coordinate axes.
   * Angles near such an angle are replaced with this angle.
   * @param {!IInputModeContext} inputModeContext
   * @param {number} angle
   * @returns {number}
   */
  snapAngle(inputModeContext, angle) {
    // Check for disabled snapping
    const snapContext = inputModeContext.lookup(SnapContext.$class)
    if (snapContext && !snapContext.enabled) {
      return angle
    }
    // Same angle snapping
    if (this.snapToSameAngleDelta > 0 && this.nodeAngles) {
      // Find the first angle that is sufficiently similar
      const candidate = this.nodeAngles
        .sort((nodeAngle1, nodeAngle2) => nodeAngle2.angle - nodeAngle1.angle)
        .find(
          nodeAngle => normalizeAngle(Math.abs(nodeAngle.angle - angle)) < this.snapToSameAngleDelta
        )
      if (candidate) {
        // Add highlight to every matching node
        const canvas = inputModeContext.canvasComponent
        if (this.sameAngleHighlightedNodes !== candidate.nodes) {
          this.clearSameAngleHighlights(inputModeContext)
        }
        candidate.nodes.forEach(matchingNode => {
          canvas.highlightIndicatorManager.addHighlight(matchingNode)
        })
        this.sameAngleHighlightedNodes = candidate.nodes
        return candidate.angle
      }
      this.clearSameAngleHighlights(inputModeContext)
    }
    if (this.snapDelta <= 0.0 || this.snapStep === 0) {
      return angle
    }
    const mod = Math.abs(angle % this.snapStep)
    return mod < this.snapDelta || mod > this.snapStep - this.snapDelta
      ? this.snapStep * Math.round(angle / this.snapStep)
      : angle
  }

  /**
   * Cancels the drag and cleans up.
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   */
  cancelDrag(context, originalLocation) {
    this.setAngle(context, this.initialAngle)

    const portContext = new DelegatingContext(context)
    this.portHandles.forEach(portHandle => {
      portHandle.cancelDrag(portContext, originalLocation)
    })
    this.portHandles.clear()
    if (this.reshapeHandler) {
      this.reshapeHandler.cancelReshape(context, this.node.layout.toRect())
    }
    if (this.compoundEdit) {
      this.compoundEdit.cancel()
    }
    this.nodeAngles = null
    this.clearSameAngleHighlights(context)
  }

  /**
   * Finishes the drag and updates the angle of the rotated node.
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  dragFinished(context, originalLocation, newLocation) {
    const vector = newLocation.subtract(this.rotationCenter).normalized

    let angle = this.calculateAngle(vector)
    if (this.shouldSnap(context)) {
      angle = this.snapAngle(context, angle)
    }
    this.setAngle(context, angle)

    // Switch width / height for 'vertical' rotations
    // Note that other parts of the application need support for this feature, too.
    const graph = context.graph
    if (!graph) {
      return
    }

    const portContext = new DelegatingContext(context)
    this.portHandles.forEach(portHandle => {
      portHandle.dragFinished(portContext, originalLocation, newLocation)
    })
    this.portHandles.clear()

    // Workaround: if the OrthogonalEdgeEditingContext is used to keep the edges orthogonal, it is not allowed
    // to change that edges manually. Therefore, we explicitly finish the OrthogonalEdgeEditingContext here and
    // then call the edge router.
    const edgeEditingContext = context.lookup(OrthogonalEdgeEditingContext.$class)
    if (edgeEditingContext && edgeEditingContext.isInitialized) {
      edgeEditingContext.dragFinished()
    }

    if (this.reshapeHandler) {
      this.reshapeHandler.reshapeFinished(
        context,
        this.node.layout.toRect(),
        this.node.layout.toRect()
      )
    }

    if (this.compoundEdit) {
      this.compoundEdit.commit()
    }

    this.nodeAngles = null
    this.clearSameAngleHighlights(context)
  }

  /**
   * Removes highlights for same angle snapping.
   * @param {!IInputModeContext} context
   */
  clearSameAngleHighlights(context) {
    if (this.sameAngleHighlightedNodes) {
      this.sameAngleHighlightedNodes.forEach(highlightedNode => {
        context.canvasComponent.highlightIndicatorManager.removeHighlight(highlightedNode)
      })
      this.sameAngleHighlightedNodes = null
    }
  }

  /**
   * Sets the angle to the node style if the style supports this.
   * @param {!IInputModeContext} context
   * @param {number} angle
   */
  setAngle(context, angle) {
    const wrapper = this.node.style
    if (wrapper instanceof RotatableNodeStyleDecorator) {
      const undoEngine = context.lookup(UndoEngine.$class)
      if (undoEngine) {
        const undoUnit = new AngleChangeUndoUnit(wrapper)
        undoEngine.addUnit(undoUnit)
      }
      wrapper.angle = angle
    }
  }

  /**
   * Reads the angle from the node style if the style supports this.
   * @returns {number}
   */
  getAngle() {
    const wrapper = this.node.style
    if (wrapper instanceof RotatableNodeStyleDecorator) {
      return wrapper.angle
    }
    return 0
  }

  /**
   * Whether the current gesture does not disable snapping.
   * @param {!IInputModeContext} context
   * @returns {boolean}
   */
  shouldSnap(context) {
    const modifiers = context.canvasComponent.lastMouseEvent.modifiers
    const shouldSnap = (modifiers & ModifierKeys.SHIFT) !== ModifierKeys.SHIFT
    if (!shouldSnap && this.sameAngleHighlightedNodes) {
      this.clearSameAngleHighlights(context)
    }
    return shouldSnap
  }

  /**
   * Returns the x-coordinate of the handle's location.
   * @type {number}
   */
  get x() {
    return this.getLocation().x
  }

  /**
   * Returns the y-coordinate of the handle's location.
   * @type {number}
   */
  get y() {
    return this.getLocation().y
  }

  /**
   * Returns the handle's location.
   * @returns {!Point}
   */
  getLocation() {
    const orientedRectangle = this.getOrientedRectangle(this.node)
    const anchor = orientedRectangle.anchorLocation
    const size = orientedRectangle.toSize()
    const up = new Point(orientedRectangle.upX, orientedRectangle.upY)
    // calculate the location of the handle from the anchor, the size and the orientation
    const offset = 20
    return anchor
      .add(up.multiply(size.height + offset))
      .add(new Point(-up.y, up.x).multiply(size.width * 0.5))
  }
}

/**
 * An undo unit to provide undo-/redo-functionality for angle changes.
 */
class AngleChangeUndoUnit extends UndoUnitBase {
  /**
   * Creates a new instance.
   * @param {!RotatableNodeStyleDecorator} nodeStyleDecorator
   */
  constructor(nodeStyleDecorator) {
    super('Change Angle')
    this.newAngle = 0
    this.nodeStyleDecorator = nodeStyleDecorator
    this.oldAngle = nodeStyleDecorator.angle
  }

  undo() {
    this.newAngle = this.nodeStyleDecorator.angle
    this.nodeStyleDecorator.angle = this.oldAngle
  }

  redo() {
    this.nodeStyleDecorator.angle = this.newAngle
  }
}

/**
 * Helper class to support clipboard operations for rotatable nodes.
 */
class RotatableNodeClipboardHelper extends BaseClass(IClipboardHelper) {
  /**
   * Returns whether or not to copying the given item is possible.
   * @param {!IGraphClipboardContext} context
   * @param {!IModelItem} item
   * @returns {boolean}
   */
  shouldCopy(context, item) {
    return true
  }

  /**
   * Returns whether or not to cutting the given item is possible.
   * @param {!IGraphClipboardContext} context
   * @param {!IModelItem} item
   * @returns {boolean}
   */
  shouldCut(context, item) {
    return true
  }

  /**
   * Returns whether or not to pasting of the given item is possible.
   * @param {!IGraphClipboardContext} context
   * @param {!IModelItem} item
   * @param {*} userData
   * @returns {boolean}
   */
  shouldPaste(context, item, userData) {
    return true
  }

  /**
   * Adds no additional state to the copy-operation.
   * @param {!IGraphClipboardContext} context
   * @param {!IModelItem} item
   * @returns {*}
   */
  copy(context, item) {
    return null
  }

  /**
   * Adds no additional state to the cut-operation.
   * @param {!IGraphClipboardContext} context
   * @param {!IModelItem} item
   * @returns {*}
   */
  cut(context, item) {
    return null
  }

  /**
   * Copies the node style for the paste-operation because {@link RotatableNodeStyleDecorator}
   * should not be shared.
   * @param {!IGraphClipboardContext} context
   * @param {!IModelItem} item
   * @param {*} userData
   */
  paste(context, item, userData) {
    if (!(item instanceof INode)) {
      return
    }
    const node = item
    const styleWrapper = node.style
    if (styleWrapper instanceof RotatableNodeStyleDecorator) {
      if (context.targetGraph.foldingView) {
        context.targetGraph.foldingView.manager.masterGraph.setStyle(node, styleWrapper.clone())
      } else {
        context.targetGraph.setStyle(node, styleWrapper.clone())
      }
    }
  }
}

/**
 * An oriented rectangle that specifies the location, size and rotation angle of a rotated node.
 * This class is used mainly for performance reasons. It provides cached values. In principle, it
 * would be enough to store just the rotation angle but then, we would have to recalculate all the
 * properties of this class very often.
 */
class CachingOrientedRectangle extends BaseClass(IOrientedRectangle) {
  /**
   * Creates a new instance.
   * @param {!Rect} layout
   */
  constructor(layout = Rect.EMPTY) {
    super()
    this._upVector = new Point(0, -1)
    this._angle = 0
    this.cachedLayout = layout
    this.cachedOrientedRect = new OrientedRectangle(layout)
  }

  /**
   * Returns the rotation angle.
   * @type {number}
   */
  get angle() {
    return this._angle
  }

  /**
   * Specifies the rotation angle.
   * @type {number}
   */
  set angle(angle) {
    this._angle = normalizeAngle(angle)
    this.cachedOrientedRect.angle = toRadians(angle)
    this.cachedOrientedRect.setCenter(this.cachedLayout.center)
    this._upVector = this.cachedOrientedRect.upVector
  }

  /**
   * Returns the width of the rectangle.
   * @type {number}
   */
  get width() {
    return this.cachedLayout.width
  }

  /**
   * Returns the height of the rectangle.
   * @type {number}
   */
  get height() {
    return this.cachedLayout.height
  }

  /**
   * Returns the x-coordinate of the rectangle's anchor point.
   * @type {number}
   */
  get anchorX() {
    return this.cachedOrientedRect.anchorX
  }

  /**
   * Returns the y-coordinate of the rectangle's anchor point.
   * @type {number}
   */
  get anchorY() {
    return this.cachedOrientedRect.anchorY
  }

  /**
   * Returns the x-coordinate of the rectangle's up vector.
   * @type {number}
   */
  get upX() {
    return this.cachedOrientedRect.upX
  }

  /**
   * Returns the y-coordinate of the rectangle's up vector.
   * @type {number}
   */
  get upY() {
    return this.cachedOrientedRect.upY
  }

  /**
   * Returns the rectangle's up vector.
   * @type {!Point}
   */
  get upVector() {
    return this._upVector
  }

  /**
   * Specifies the rectangle's up vector.
   * @type {!Point}
   */
  set upVector(upVector) {
    this._upVector = upVector
    this.cachedOrientedRect.setUpVector(upVector.x, upVector.y)
    this.cachedOrientedRect.setCenter(this.cachedLayout.center)
    this.angle = toDegrees(this.cachedOrientedRect.angle)
  }

  /**
   * Returns the angle in radians.
   * @returns {number}
   */
  getRadians() {
    return toRadians(this.angle)
  }

  /**
   * Updates the layout in the cache.
   * @param {!Rect} layout
   */
  updateCache(layout) {
    if (
      layout.equals(this.cachedLayout) &&
      this.upVector.equals(this.cachedOrientedRect.upVector)
    ) {
      return
    }
    this.cachedLayout = layout
    this.cachedOrientedRect.setUpVector(this.upVector.x, this.upVector.y)
    this.cachedOrientedRect.width = this.width
    this.cachedOrientedRect.height = this.height
    this.cachedOrientedRect.setCenter(this.cachedLayout.center)
  }
}

/**
 * A context that returns no SnapContext in its lookup and delegates its other methods to an inner
 * context.
 */
class DelegatingContext extends BaseClass(IInputModeContext) {
  /**
   * Creates a new instance
   * @param {!IInputModeContext} context
   */
  constructor(context) {
    super()
    this.context = context
  }

  /**
   * Returns the wrapped context's zoom.
   * @type {number}
   */
  get zoom() {
    return this.context.zoom
  }

  /**
   * Returns the wrapped context's hit test radius.
   * @type {number}
   */
  get hitTestRadius() {
    return this.context.hitTestRadius
  }

  /**
   * Returns the wrapped context's canvas component.
   * @type {?CanvasComponent}
   */
  get canvasComponent() {
    return this.context.canvasComponent
  }

  /**
   * Returns the wrapped context's parent input mode.
   * @type {?IInputMode}
   */
  get parentInputMode() {
    return this.context.parentInputMode
  }

  /**
   * Delegates to the wrapped context's lookup but cancels the snap context.
   * @param {!Class} type
   * @returns {?object}
   */
  lookup(type) {
    return type === SnapContext.$class ? null : this.context.lookup(type)
  }

  /**
   * @param {!ISvgDefsCreator} defsSupport
   * @returns {!string}
   */
  getDefsId(defsSupport) {
    return this.context.getDefsId(defsSupport)
  }
}

/**
 * This port handle is used only to trigger the updates of the orthogonal edge editing facility of
 * yFiles. In yFiles, all code related to updates of the orthogonal edge editing facility is
 * internal. As a workaround, we explicitly call internal port handles from our custom node
 * handles.
 */
class DummyPortLocationModelParameterHandle extends PortLocationModelParameterHandle {
  /**
   * Does nothing since we don't want to change the port location.
   * @param {!IGraph} graph
   * @param {!IPort} port
   * @param {!IPortLocationModelParameter} newParameter
   */
  setParameter(graph, port, newParameter) {
    // do nothing
  }

  /**
   * Returns the current port location since we don't want to change the port location.
   * @param {!IPort} port
   * @param {!IPortLocationModel} model
   * @param {!Point} newLocation
   * @returns {!IPortLocationModelParameter}
   */
  getNewParameter(port, model, newLocation) {
    return port.locationParameter
  }
}

/**
 * Markup extension that helps (de-)serializing a {@link RotatableNodeStyleDecorator).
 */
export class RotatableNodeStyleDecoratorExtension extends MarkupExtension {
  constructor() {
    super()
    this._angle = 0
  }

  /**
   * @type {number}
   */
  get angle() {
    return this._angle
  }

  /**
   * @type {number}
   */
  set angle(value) {
    this._angle = value
  }

  /**
   * @type {!INodeStyle}
   */
  get wrapped() {
    return this._wrapped
  }

  /**
   * @type {!INodeStyle}
   */
  set wrapped(value) {
    this._wrapped = value
  }

  /**
   * Meta attributes for GraphML serialization
   * @type {!object}
   */
  static get $meta() {
    return {
      angle: [GraphMLAttribute().init({ defaultValue: 0 }), TypeAttribute(YNumber.$class)]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {*}
   */
  provideValue(serviceProvider) {
    const style = new RotatableNodeStyleDecorator()
    style.angle = this.angle
    style.wrapped = this.wrapped
    return style
  }
}

/**
 * Normalizes the angle to 0–360°.
 * @param {number} angle
 * @returns {number}
 */
function normalizeAngle(angle) {
  let normalizedAngle = angle % 360
  if (normalizedAngle < 0) {
    normalizedAngle += 360
  }
  return normalizedAngle
}

/**
 * Returns the given angle in degrees.
 * @param {number} radians
 * @returns {number}
 */
function toDegrees(radians) {
  return (radians * 180) / Math.PI
}

/**
 * Returns the given angle in radians.
 * @param {number} degrees
 * @returns {number}
 */
function toRadians(degrees) {
  return (degrees / 180) * Math.PI
}

/**
 * @param {!GraphMLIOHandler} source
 * @param {!HandleSerializationEventArgs} args
 */
export function RotatableNodesSerializationListener(source, args) {
  const item = args.item
  if (item instanceof RotatableNodeStyleDecorator) {
    const markupExtension = new RotatableNodeStyleDecoratorExtension()
    markupExtension.angle = item.angle
    markupExtension.wrapped = item.wrapped
    args.context.serializeReplacement(
      RotatableNodeStyleDecoratorExtension.$class,
      item,
      markupExtension
    )
    args.handled = true
  }
}
