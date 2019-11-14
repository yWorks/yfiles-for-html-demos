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

define(['yfiles/view-editor'], yfiles => {
  /**
   * A node style that displays another wrapped style rotated by a specified rotation angle.
   * The angle is stored in this decorator to keep the tag free for user data. Hence, this decorator should not be
   * shared between nodes if they can have different angles.
   */
  class RotatableNodeStyleDecorator extends yfiles.lang.Class(
    yfiles.styles.NodeStyleBase,
    yfiles.graphml.IMarkupExtensionConverter
  ) {
    /**
     * Creates a new instance with a wrapped node style and an angle.
     * @param {yfiles.styles.INodeStyle} wrapped
     * @param {number} angle
     */
    constructor(wrapped = null, angle = 0) {
      super()
      this.$wrapped = wrapped || new yfiles.styles.ShapeNodeStyle()
      this.rotatedLayout = new CachingOrientedRectangle()
      this.angle = angle || 0

      this.matrix = new yfiles.geometry.Matrix()
      this.matrixCenter = yfiles.geometry.Point.ORIGIN
      this.matrixAngle = 0
      this.inverseMatrix = new yfiles.geometry.Matrix()
      this.inverseMatrixCenter = yfiles.geometry.Point.ORIGIN
      this.inverseMatrixAngle = 0
    }

    /**
     * Returns the wrapped style.
     * @return {yfiles.styles.INodeStyle}
     */
    get wrapped() {
      return this.$wrapped
    }

    /**
     * Specifies the wrapped style.
     * @param {yfiles.styles.INodeStyle} value
     */
    set wrapped(value) {
      this.$wrapped = value
    }

    /**
     * Returns the rotation angle.
     * @return {number}
     */
    get angle() {
      return this.rotatedLayout.angle
    }

    /**
     * Specifies the rotation angle.
     * @param {number} angle
     */
    set angle(angle) {
      this.rotatedLayout.angle = angle
    }

    /**
     * Creates a visual which rotates the visualization of the wrapped style.
     * @param {yfiles.view.IRenderContext} context
     * @param {yfiles.graph.INode} node
     * @return {yfiles.view.SvgVisualGroup}
     */
    createVisual(context, node) {
      /** @type {yfiles.view.SvgVisual} */
      const visual = this.wrapped.renderer
        .getVisualCreator(node, this.wrapped)
        .createVisual(context)
      const container = new yfiles.view.SvgVisualGroup()
      const matrix = new yfiles.geometry.Matrix()
      matrix.rotate(toRadians(-this.angle), node.layout.center)
      container.transform = matrix
      container.add(visual)
      container['render-data-cache'] = {
        angle: this.angle,
        center: node.layout.center,
        wrapped: this.wrapped
      }
      context.registerForChildrenIfNecessary(container, this.disposeChildren)
      return container
    }

    /**
     * Updates a visual which rotates the visualization of the wrapped style.
     * @param {yfiles.view.IRenderContext} context
     * @param {yfiles.view.SvgVisualGroup} oldVisual
     * @param {yfiles.graph.INode} node
     * @return {yfiles.view.SvgVisualGroup}
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

      /** @type {yfiles.view.SvgVisual} */
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
      context.registerForChildrenIfNecessary(oldVisual, this.disposeChildren)

      if (cache.angle !== this.angle || !cache.center.equals(node.layout.center)) {
        const matrix = new yfiles.geometry.Matrix()
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
     * @param {yfiles.view.ICanvasContext} context
     * @param {yfiles.graph.INode} node
     */
    getBounds(context, node) {
      const nodeOrientedRect = this.getRotatedLayout(node)

      // Create an oriented rectangle with the size of the wrapped bounds and the location and rotation of the node
      const wrappedBounds = this.wrapped.renderer
        .getBoundsProvider(node, this.wrapped)
        .getBounds(context)

      const orientedRectangle = new yfiles.geometry.OrientedRectangle(
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
     * Returns the intersection point of the node's rotated bounds and the segment between the inner and outer point or
     * null if there is no intersection.
     * @param {yfiles.graph.INode} node
     * @param {yfiles.geometry.Point} inner
     * @param {yfiles.geometry.Point} outer
     * @return {yfiles.geometry.Point|null}
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
     * @param {yfiles.graph.INode} node
     * @return {yfiles.geometry.GeneralPath}
     */
    getOutline(node) {
      const outline = this.wrapped.renderer
        .getShapeGeometry(node, this.wrapped)
        .getOutline()
        .clone()
      outline.transform(this.getInverseRotationMatrix(node))
      return outline
    }

    /**
     * Returns whether or not the given location is inside the rotated node.
     * @param {yfiles.input.IInputModeContext} context
     * @param {yfiles.geometry.Point} location
     * @param {yfiles.graph.INode} node
     * @return {boolean}
     */
    isHit(context, location, node) {
      // rotated the point like the node, that is by the angle around the node center
      const transformedPoint = this.getRotatedPoint(location, node, false)
      return this.wrapped.renderer
        .getHitTestable(node, this.wrapped)
        .isHit(context, transformedPoint)
    }

    /**
     * Returns whether or not the given node is inside the rectangle.
     * @param {yfiles.input.IInputModeContext} context
     * @param {yfiles.geometry.Rect} rectangle
     * @param {yfiles.graph.INode} node
     * @return {boolean}
     */
    isInBox(context, rectangle, node) {
      const nodeOrientedRect = this.getRotatedLayout(node)

      // Create an oriented rectangle with the size of the wrapped bounds and the location and rotation of the node
      const wrappedBounds = this.wrapped.renderer
        .getBoundsProvider(node, this.wrapped)
        .getBounds(context)
      const orientedRectangle = new yfiles.geometry.OrientedRectangle(
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
     * @param {yfiles.view.ICanvasContext} context
     * @param {yfiles.geometry.Rect} rectangle
     * @param {yfiles.graph.INode} node
     * @return {boolean}
     */
    isVisible(context, rectangle, node) {
      return (
        this.wrapped.renderer
          .getVisibilityTestable(node, this.wrapped)
          .isVisible(context, rectangle) || this.getBounds(context, node).intersects(rectangle)
      )
    }

    /**
     * Returns customized helpers that consider the node rotation for resizing and rotating gestures, highlight
     * indicators, and clipboard operations.
     * Other lookup calls will be delegated to the lookup of the wrapped node style.
     * @param {yfiles.graph.INode} node
     * @param {yfiles.lang.Class} type
     * @return {object}
     */
    lookup(node, type) {
      // Custom reshape handles that rotate with the node
      if (type === yfiles.input.IReshapeHandleProvider.$class) {
        return new RotatedReshapeHandleProvider(node)
      }
      // Custom handle to rotate the node
      if (type === yfiles.input.IHandleProvider.$class) {
        return new NodeRotateHandleProvider(node)
      }
      // Selection decoration
      if (type === yfiles.view.ISelectionIndicatorInstaller.$class) {
        return new RotatableNodeIndicatorInstaller(
          yfiles.view.OrientedRectangleIndicatorInstaller.SELECTION_TEMPLATE_KEY
        )
      }
      // Focus decoration
      if (type === yfiles.view.IFocusIndicatorInstaller.$class) {
        return new RotatableNodeIndicatorInstaller(
          yfiles.view.OrientedRectangleIndicatorInstaller.FOCUS_TEMPLATE_KEY
        )
      }
      // Highlight decoration
      if (type === yfiles.view.IHighlightIndicatorInstaller.$class) {
        return new RotatableNodeIndicatorInstaller(
          yfiles.view.OrientedRectangleIndicatorInstaller.HIGHLIGHT_TEMPLATE_KEY
        )
      }
      // Clipboard helper that clones the style instance when pasting rotated nodes
      if (type === yfiles.graph.IClipboardHelper.$class) {
        return new RotatableNodeClipboardHelper()
      }

      return (
        super.lookup(node, type) ||
        this.wrapped.renderer.getContext(node, this.wrapped).lookup(type)
      )
    }

    /**
     * Creates a copy of this node style decorator.
     * @return {RotatableNodeStyleDecorator}
     */
    clone() {
      return new RotatableNodeStyleDecorator(this.wrapped, this.angle)
    }

    /**
     * Returns the rotated bounds of the node.
     * @param {yfiles.graph.INode} node
     * @return {CachingOrientedRectangle}
     */
    getRotatedLayout(node) {
      this.rotatedLayout.updateCache(node.layout.toRect())
      return this.rotatedLayout
    }

    /**
     * Returns the rotated point.
     * @param {yfiles.geometry.Point} point
     * @param {yfiles.graph.INode} node
     * @param {boolean} inverse
     * @return {yfiles.geometry.Point}
     */
    getRotatedPoint(point, node, inverse) {
      const matrix = inverse ? this.getInverseRotationMatrix(node) : this.getRotationMatrix(node)
      return matrix.transform(point)
    }

    /**
     * Returns the rotation matrix for the given node and the current angle.
     * @param {yfiles.graph.INode} node
     * @return {yfiles.geometry.Matrix}
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
     * @param {yfiles.graph.INode} node
     * @return {yfiles.geometry.Matrix}
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
     * @param {yfiles.view.IRenderContext} context
     * @param {yfiles.view.Visual} removedVisual
     * @param {boolean} dispose
     * @return {yfiles.view.Visual}
     */
    disposeChildren(context, removedVisual, dispose) {
      const container = yfiles.view.SvgVisualGroup.isInstance(removedVisual) ? removedVisual : null
      if (container != null && container.children.size > 0) {
        context.childVisualRemoved(container.children[0])
      }
      return null
    }

    /**
     * Returns that this style can be converted.
     * @param {yfiles.graphml.IWriteContext} context The current write context.
     * @param {Object} value The object to convert.
     * @returns {boolean}
     */
    canConvert(context, value) {
      return true
    }

    /**
     * Converts this style using {@link RotatableNodeStyleDecoratorExtension}.
     * @param {yfiles.graphml.IWriteContext} context The current write context.
     * @param {Object} value The object to convert.
     * @returns {yfiles.graphml.MarkupExtension}
     */
    convert(context, value) {
      const extension = new RotatableNodeStyleDecoratorExtension()
      extension.wrapped = value.wrapped
      extension.angle = value.angle
      return extension
    }
  }

  /**
   * An extension of {yfiles.view.OrientedRectangleIndicatorInstaller} that uses the rotated layout of nodes using a
   * {@link RotatableNodeStyleDecorator}. The indicator will be rotated to fit the rotated bounds of the node.
   */
  class RotatableNodeIndicatorInstaller extends yfiles.view.OrientedRectangleIndicatorInstaller {
    /**
     * Creates a new instance with a visualization described by a template key.
     * @param {string} templateKey
     */
    constructor(templateKey) {
      super(null, templateKey)
      if (templateKey === yfiles.view.OrientedRectangleIndicatorInstaller.FOCUS_TEMPLATE_KEY) {
        this.template = new yfiles.view.IVisualTemplate({
          createVisual(context, bounds, object) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
            rect.setAttribute('x', bounds.x)
            rect.setAttribute('y', bounds.y)
            rect.setAttribute('width', bounds.width)
            rect.setAttribute('height', bounds.height)
            rect.setAttribute('stroke', 'black')
            rect.setAttribute('stroke-dasharray', '2, 2')
            rect.setAttribute('stroke-dashoffset', '1.5')
            rect.setAttribute('stroke-linecap', 'butt')
            rect.setAttribute('fill', 'none')
            return new yfiles.view.SvgVisual(rect)
          },
          updateVisual(context, oldVisual, bounds, object) {
            const rect = oldVisual.svgElement
            rect.setAttribute('x', bounds.x)
            rect.setAttribute('y', bounds.y)
            rect.setAttribute('width', bounds.width)
            rect.setAttribute('height', bounds.height)
            return oldVisual
          }
        })
      } else if (
        templateKey === yfiles.view.OrientedRectangleIndicatorInstaller.HIGHLIGHT_TEMPLATE_KEY
      ) {
        this.template = new yfiles.view.IVisualTemplate({
          createVisual(context, bounds, object) {
            const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')
            const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
            rect1.setAttribute('x', bounds.x)
            rect1.setAttribute('y', bounds.y)
            rect1.setAttribute('width', bounds.width)
            rect1.setAttribute('height', bounds.height)
            rect1.setAttribute('stroke', 'black')
            rect1.setAttribute('stroke-width', '3')
            rect1.setAttribute('fill', 'none')
            container.appendChild(rect1)
            const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
            rect2.setAttribute('x', bounds.x)
            rect2.setAttribute('y', bounds.y)
            rect2.setAttribute('width', bounds.width)
            rect2.setAttribute('height', bounds.height)
            rect2.setAttribute('stroke', 'white')
            rect2.setAttribute('fill', 'none')
            container.appendChild(rect2)
            return new yfiles.view.SvgVisual(container)
          },
          updateVisual(context, oldVisual, bounds, object) {
            const container = oldVisual.svgElement
            const rect1 = container.firstChild
            rect1.setAttribute('x', bounds.x)
            rect1.setAttribute('y', bounds.y)
            rect1.setAttribute('width', bounds.width)
            rect1.setAttribute('height', bounds.height)
            const rect2 = container.lastChild
            rect2.setAttribute('x', bounds.x)
            rect2.setAttribute('y', bounds.y)
            rect2.setAttribute('width', bounds.width)
            rect2.setAttribute('height', bounds.height)
            return oldVisual
          }
        })
      }
    }

    /**
     * Returns the rotated layout of the specified node.
     * @param {*} item
     * @return {yfiles.geometry.IOrientedRectangle}
     */
    getRectangle(item) {
      const node = item
      const styleWrapper = node.style
      if (styleWrapper instanceof RotatableNodeStyleDecorator) {
        return styleWrapper.getRotatedLayout(node)
      }
      return new yfiles.geometry.OrientedRectangle(node.layout)
    }
  }

  /**
   * A node reshape handle that adjusts its position according to the node rotation.
   */
  class RotatedNodeResizeHandle extends yfiles.lang.Class(
    yfiles.input.IHandle,
    yfiles.geometry.IPoint
  ) {
    /**
     * Creates a new instance.
     * @param {yfiles.input.HandlePositions} position
     * @param {yfiles.graph.INode} node
     * @param {yfiles.input.IReshapeHandler} reshapeHandler
     * @param {boolean} symmetricResize
     */
    constructor(position, node, reshapeHandler, symmetricResize) {
      super()
      this.position = position
      this.node = node
      this.reshapeHandler = reshapeHandler
      this.$symmetricResize = symmetricResize
      this.portHandles = new yfiles.collections.List()
      this.initialLayout = new yfiles.geometry.OrientedRectangle(
        this.getNodeBasedOrientedRectangle()
      )

      this.dummyLocation = null
      this.dummySize = null
      this.provider = null
      this.initialRect = null
    }

    /**
     * Returns the node rotation information.
     * @return {CachingOrientedRectangle}
     */
    getNodeBasedOrientedRectangle() {
      const wrapper =
        this.node.style instanceof RotatableNodeStyleDecorator ? this.node.style : null
      return wrapper !== null ? wrapper.getRotatedLayout(this.node) : new CachingOrientedRectangle()
    }

    /**
     * Sets the original node bounds according to the given anchor location and size.
     * @param {yfiles.input.IInputModeContext} inputModeContext
     * @param {yfiles.geometry.Point} anchor
     * @param {yfiles.geometry.Size} size
     * @return {yfiles.geometry.Rect}
     */
    setNodeLocationAndSize(inputModeContext, anchor, size) {
      const graph = inputModeContext.graph
      if (!graph) {
        return yfiles.geometry.Rect.EMPTY
      }
      const orientedRectangle = new yfiles.geometry.OrientedRectangle(
        anchor.x,
        anchor.y,
        size.width,
        size.height,
        this.initialLayout.upX,
        this.initialLayout.upY
      )
      const center = orientedRectangle.orientedRectangleCenter

      const layout = yfiles.geometry.Rect.fromCenter(center, size.toSize())
      graph.setNodeLayout(this.node, layout)
      return layout
    }

    /**
     * Returns whether or not the node is symmetrically resized.
     * @return {boolean}
     */
    get symmetricResize() {
      return this.$symmetricResize
    }

    /**
     * Defines the visualization of the handle. In this case a dot that rotates nicely.
     * @return {yfiles.input.HandleTypes}
     */
    get type() {
      return yfiles.input.HandleTypes.RESIZE
    }

    /**
     * Returns the cursor visualization according to the handle position.
     * @return {yfiles.view.Cursor}
     */
    get cursor() {
      const layout = this.getNodeBasedOrientedRectangle()
      const angle = layout.angle
      const cursors = [
        yfiles.view.Cursor.NESW_RESIZE,
        yfiles.view.Cursor.NS_RESIZE,
        yfiles.view.Cursor.NWSE_RESIZE,
        yfiles.view.Cursor.EW_RESIZE
      ]
      let index
      // Pick the right array index for the respective handle location
      switch (this.position) {
        case yfiles.input.HandlePositions.NORTH_WEST:
        case yfiles.input.HandlePositions.SOUTH_EAST:
          index = 2
          break
        case yfiles.input.HandlePositions.NORTH:
        case yfiles.input.HandlePositions.SOUTH:
          index = 1
          break
        case yfiles.input.HandlePositions.NORTH_EAST:
        case yfiles.input.HandlePositions.SOUTH_WEST:
          index = 0
          break
        case yfiles.input.HandlePositions.EAST:
        case yfiles.input.HandlePositions.WEST:
          index = 3
          break
        default:
          return yfiles.view.Cursor.POINTER
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
     * @return {yfiles.geometry.Point}
     */
    get location() {
      return this.getLocation(this.getNodeBasedOrientedRectangle(), this.position)
    }

    /**
     * Stores the initial layout of the node in case the user cancels the resizing.
     * @param {yfiles.input.IInputModeContext} inputModeContext
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
     * @param {yfiles.input.IInputModeContext} inputModeContext
     * @param {yfiles.geometry.Point} originalLocation
     * @param {yfiles.geometry.Point} newLocation
     */
    handleMove(inputModeContext, originalLocation, newLocation) {
      // calculate how much the the handle was moved
      const upNormal = new yfiles.geometry.Point(-this.initialLayout.upY, this.initialLayout.upX)
      const deltaW = this.getWidthDelta(originalLocation, newLocation, upNormal)
      const up = this.initialLayout.upVector
      const deltaH = this.getHeightDelta(originalLocation, newLocation, up)

      // add one or two times delta to the width to expand the node right and left
      this.dummySize = new yfiles.geometry.Size(
        this.initialLayout.width + deltaW * (this.symmetricResize ? 2 : 1),
        this.initialLayout.height + deltaH * (this.symmetricResize ? 2 : 1)
      )

      // Calculate the new location.
      // Depending on our handle position, a different corner of the node should stay fixed.
      if (this.symmetricResize) {
        const dx = upNormal.x * deltaW + up.x * deltaH
        const dy = upNormal.y * deltaW + up.y * deltaH
        this.dummyLocation = this.initialLayout.anchorLocation.subtract(
          new yfiles.geometry.Point(dx, dy)
        )
      } else {
        const w = this.dummySize.width - this.initialLayout.width
        const h = this.dummySize.height - this.initialLayout.height
        switch (this.position) {
          case yfiles.input.HandlePositions.NORTH_WEST:
            this.dummyLocation = this.initialLayout.anchorLocation.subtract(
              new yfiles.geometry.Point(-up.y * w, up.x * w)
            )
            break
          case yfiles.input.HandlePositions.SOUTH:
          case yfiles.input.HandlePositions.SOUTH_WEST:
          case yfiles.input.HandlePositions.WEST:
            this.dummyLocation = this.initialLayout.anchorLocation.subtract(
              new yfiles.geometry.Point(up.x * h - up.y * w, up.y * h + up.x * w)
            )
            break
          case yfiles.input.HandlePositions.SOUTH_EAST:
            this.dummyLocation = this.initialLayout.anchorLocation.subtract(
              new yfiles.geometry.Point(up.x * h, up.y * h)
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
     * @param {yfiles.geometry.Point} originalLocation
     * @param {yfiles.geometry.Point} newLocation
     * @param {yfiles.geometry.Point} vector
     */
    getWidthDelta(originalLocation, newLocation, vector) {
      switch (this.position) {
        case yfiles.input.HandlePositions.NORTH_WEST:
        case yfiles.input.HandlePositions.WEST:
        case yfiles.input.HandlePositions.SOUTH_WEST:
          // calculate the total distance the handle has been moved in this drag gesture
          // max with minus half the node size - because the node can't shrink below zero
          return Math.max(
            vector.scalarProduct(originalLocation.subtract(newLocation)),
            -this.initialLayout.width * (this.symmetricResize ? 0.5 : 1)
          )
        case yfiles.input.HandlePositions.NORTH_EAST:
        case yfiles.input.HandlePositions.EAST:
        case yfiles.input.HandlePositions.SOUTH_EAST:
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
     * @param {yfiles.geometry.Point} originalLocation
     * @param {yfiles.geometry.Point} newLocation
     * @param {yfiles.geometry.Point} vector
     * @return {number}
     */
    getHeightDelta(originalLocation, newLocation, vector) {
      switch (this.position) {
        case yfiles.input.HandlePositions.NORTH_WEST:
        case yfiles.input.HandlePositions.NORTH:
        case yfiles.input.HandlePositions.NORTH_EAST:
          return Math.max(
            vector.scalarProduct(newLocation.subtract(originalLocation)),
            -this.initialLayout.height * (this.symmetricResize ? 0.5 : 1)
          )
        case yfiles.input.HandlePositions.SOUTH_WEST:
        case yfiles.input.HandlePositions.SOUTH:
        case yfiles.input.HandlePositions.SOUTH_EAST:
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
     * @param {yfiles.input.IInputModeContext} inputModeContext
     * @param {yfiles.geometry.Point} originalLocation
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
     * @param {yfiles.input.IInputModeContext} inputModeContext
     * @param {yfiles.geometry.Point} originalLocation
     * @param {yfiles.geometry.Point} newLocation
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
     * @param {yfiles.geometry.IOrientedRectangle} rectangle
     * @param {number} ratioWidth
     * @param {number} ratioHeight
     * @return {yfiles.geometry.Point}
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
      return new yfiles.geometry.Point(x2, y2)
    }

    /**
     * Returns the x-coordinate of the rotated bounds.
     * @return {number}
     */
    get x() {
      return this.getLocation(this.getNodeBasedOrientedRectangle(), this.position).x
    }

    /**
     * Returns the y-coordinate of the rotated bounds.
     * @return {number}
     */
    get y() {
      return this.getLocation(this.getNodeBasedOrientedRectangle(), this.position).y
    }

    /**
     * Returns the location of the specified position on the border of the oriented rectangle.
     * @param {yfiles.geometry.IOrientedRectangle} layout
     * @param {yfiles.input.HandlePositions} position
     * @return {yfiles.geometry.Point}
     */
    getLocation(layout, position) {
      if (!layout) {
        return this.node.layout.toPoint()
      }
      switch (position) {
        case yfiles.input.HandlePositions.NORTH_WEST:
          return RotatedNodeResizeHandle.getLocation(layout, 0.0, 1.0)
        case yfiles.input.HandlePositions.NORTH:
          return RotatedNodeResizeHandle.getLocation(layout, 0.5, 1.0)
        case yfiles.input.HandlePositions.NORTH_EAST:
          return RotatedNodeResizeHandle.getLocation(layout, 1.0, 1.0)
        case yfiles.input.HandlePositions.EAST:
          return RotatedNodeResizeHandle.getLocation(layout, 1.0, 0.5)
        case yfiles.input.HandlePositions.SOUTH_EAST:
          return RotatedNodeResizeHandle.getLocation(layout, 1.0, 0.0)
        case yfiles.input.HandlePositions.SOUTH:
          return RotatedNodeResizeHandle.getLocation(layout, 0.5, 0.0)
        case yfiles.input.HandlePositions.SOUTH_WEST:
          return layout.anchorLocation
        case yfiles.input.HandlePositions.WEST:
          return RotatedNodeResizeHandle.getLocation(layout, 0.0, 0.5)
        default:
          throw new Error()
      }
    }
  }

  /**
   * Provides reshape handles for rotated nodes.
   */
  class RotatedReshapeHandleProvider extends yfiles.lang.Class(
    yfiles.input.IReshapeHandleProvider
  ) {
    /**
     * Creates a new instance for a given node.
     * @param {yfiles.graph.INode} node
     */
    constructor(node) {
      super()
      this.node = node
      // use a reshape handler to properly handle
      // implicit resizing of parent group nodes
      this.reshapeHandler = node.lookup(yfiles.input.IReshapeHandler.$class)
    }

    /**
     * Returns all eight positions around a node.
     * @param {yfiles.input.IInputModeContext} inputModeContext
     * @return {yfiles.input.HandlePositions}
     */
    getAvailableHandles(inputModeContext) {
      return yfiles.input.HandlePositions.BORDER
    }

    /**
     * Returns a RotatedNodeResizeHandle for the given position and node.
     * @param {yfiles.input.IInputModeContext} inputModeContext
     * @param {yfiles.input.HandlePositions} position
     * @return {yfiles.input.IHandle}
     */
    getHandle(inputModeContext, position) {
      return new RotatedNodeResizeHandle(position, this.node, this.reshapeHandler, false)
    }
  }

  /**
   * Provides a rotate handle for a given node.
   */
  class NodeRotateHandleProvider extends yfiles.lang.Class(yfiles.input.IHandleProvider) {
    /**
     * Creates a new instance for the given node.
     * @param {yfiles.graph.INode} node
     */
    constructor(node) {
      super()
      this.node = node
      this.reshapeHandler = node.lookup(yfiles.input.IReshapeHandler.$class)
      this.$snapStep = 45
      this.$snapDelta = 10
      this.$snapToSameAngleDelta = 5
    }

    /**
     * Returns the angular step size to which rotation should snap (in degrees).
     * Default is 45. Setting this to zero will disable snapping to predefined steps.
     * @return {number}
     */
    get snapStep() {
      return this.$snapStep
    }

    /**
     * Specifies the angular step size to which rotation should snap (in degrees).
     * Default is 45. Setting this to zero will disable snapping to predefined steps.
     * @param {number} value
     */
    set snapStep(value) {
      this.$snapStep = value
    }

    /**
     * Returns the snapping distance when rotation should snap (in degrees).
     * The rotation will snap if the angle is less than this distance from a <see cref="SnapStep">snapping angle</see>.
     * Default is 10.
     * Setting this to a non-positive value will disable snapping to predefined steps.
     * @return {number}
     */
    get snapDelta() {
      return this.$snapDelta
    }

    /**
     * Specifies the snapping distance when rotation should snap (in degrees).
     * The rotation will snap if the angle is less than this distance from a <see cref="SnapStep">snapping angle</see>.
     * Default is 10.
     * Setting this to a non-positive value will disable snapping to predefined steps.
     * @param {number} value
     */
    set snapDelta(value) {
      this.$snapDelta = value
    }

    /**
     * Returns the snapping distance (in degrees) for snapping to the same angle as other visible nodes.
     * Rotation will snap to another node's rotation angle if the current angle differs from the other one by less than
     * this. The default is 5. Setting this to a non-positive value will disable same angle snapping.
     * @return {number}
     */
    get snapToSameAngleDelta() {
      return this.$snapToSameAngleDelta
    }

    /**
     * Specifies the snapping distance (in degrees) for snapping to the same angle as other visible nodes.
     * Rotation will snap to another node's rotation angle if the current angle differs from the other one by less than
     * this. The default is 5. Setting this to a non-positive value will disable same angle snapping.
     * @param {number} delta
     */
    set snapToSameAngleDelta(delta) {
      this.$snapToSameAngleDelta = delta
    }

    /**
     * Returns a set of handles for the rotated node.
     * @param inputModeContext
     * @return {yfiles.collections.List.<yfiles.input.IHandle>}
     */
    getHandles(inputModeContext) {
      const handle = new NodeRotateHandle(this.node, this.reshapeHandler, inputModeContext)
      handle.snapDelta = this.snapDelta
      handle.snapStep = this.snapStep
      handle.snapToSameAngleDelta = this.snapToSameAngleDelta

      return yfiles.collections.List.fromArray([handle])
    }
  }

  /**
   * A custom {@link yfiles.input.IHandle} implementation that implements the functionality needed for rotating a label.
   */
  class NodeRotateHandle extends yfiles.lang.Class(yfiles.input.IHandle, yfiles.geometry.IPoint) {
    /**
     * Creates a new instance.
     * @param {yfiles.graph.INode} node
     * @param {yfiles.input.IReshapeHandler} reshapeHandler
     * @param {yfiles.input.IInputModeContext} inputModeContext
     */
    constructor(node, reshapeHandler, inputModeContext) {
      super()
      this.node = node
      this.reshapeHandler = reshapeHandler
      this.inputModeContext = new DelegatingContext(inputModeContext)
      this.portHandles = new yfiles.collections.List()

      this.rotationCenter = null
      this.initialAngle = 0
      this.compoundEdit = null

      // Load the custom rotation cursor
      this.$cursor = new yfiles.view.Cursor('resources/rotate.cur', yfiles.view.Cursor.CROSSHAIR)

      // A cache of angles and nodes with those angles used for same angle snapping.
      this.nodeAngles = null

      // The currently highlighted nodes for same angle snapping.
      this.sameAngleHighlightedNodes = null
    }

    /**
     * Returns the current oriented rectangle for the given node.
     * @param {yfiles.graph.INode} node
     * @return {CachingOrientedRectangle}
     */
    getOrientedRectangle(node) {
      const wrapper = node.style
      return wrapper instanceof RotatableNodeStyleDecorator
        ? wrapper.getRotatedLayout(node)
        : new CachingOrientedRectangle()
    }

    /**
     * Returns the threshold value the specifies whether the angle should snap to the next multiple of {@link #snapStep}
     * in degrees. Set a value less than or equal to zero to disable this feature.
     * @return {number}
     */
    get snapDelta() {
      return this.$snapDelta
    }

    /**
     * Specifies the threshold value the specifies whether the angle should snap to the next multiple of
     * {@link #snapStep} in degrees. Set a value less than or equal to zero to disable this feature.
     * @param {number} delta
     */
    set snapDelta(delta) {
      this.$snapDelta = delta
    }

    /**
     * Returns the steps in degrees to which rotation should snap to.
     * @return {number}
     */
    get snapStep() {
      return this.$snapStep
    }

    /**
     * Specifies the steps in degrees to which rotation should snap to.
     * @param {number} step
     */
    set snapStep(step) {
      this.$snapStep = step
    }

    /**
     * Returns the snapping distance (in degrees) for snapping to the same angle as other visible nodes.
     * Rotation will snap to another node's rotation angle if the current angle differs from the other one by less than
     * this. The default is 5. Setting this to a non-positive value will disable same angle snapping.
     * @return {number}
     */
    get snapToSameAngleDelta() {
      return this.$snapToSameAngleDelta
    }

    /**
     * Specifies the snapping distance (in degrees) for snapping to the same angle as other visible nodes.
     * Rotation will snap to another node's rotation angle if the current angle differs from the other one by less than
     * this. The default is 5. Setting this to a non-positive value will disable same angle snapping.
     * @param {number} delta
     */
    set snapToSameAngleDelta(delta) {
      this.$snapToSameAngleDelta = delta
    }

    /**
     * Returns the type of handle which is used.
     * @return {yfiles.input.HandleTypes.MOVE}
     */
    get type() {
      return yfiles.input.HandleTypes.MOVE
    }

    /**
     * Returns the cursor that is shown when using this handle.
     * @return {yfiles.view.Cursor}
     */
    get cursor() {
      return this.$cursor
    }

    /**
     * Returns the location of the handle.
     * Since this instance also implements {@link yfiles.geometry.IPoint}, we can simply return this.
     */
    get location() {
      return this
    }

    /**
     * Initializes the drag.
     * @param {yfiles.input.IInputModeContext} inputModeContext
     */
    initializeDrag(inputModeContext) {
      const imc = inputModeContext.lookup(yfiles.input.IModelItemCollector.$class)
      if (imc) {
        imc.add(this.node)
      }
      this.rotationCenter = this.node.layout.center
      this.initialAngle = this.getAngle()

      const graph = inputModeContext.lookup(yfiles.graph.IGraph.$class)
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
              yfiles.graph.INode.isInstance(userObject) &&
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
     * @param {yfiles.input.IInputModeContext} inputModeContext
     * @param {yfiles.geometry.Point} originalLocation
     * @param {yfiles.geometry.Point} newLocation
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
     * If the vector is almost horizontal or vertical, this method returns the exact horizontal or vertical up vector
     * instead.
     * @param {yfiles.geometry.Point} upVector
     * @return {number}
     */
    calculateAngle(upVector) {
      return normalizeAngle(-(Math.atan2(upVector.y, upVector.x) / Math.PI * 180 + 90))
    }

    /**
     * Snaps the angle to the rotation angles of other nodes and the coordinate axes.
     * Angles near such an angle are replaced with this angle.
     * @param {yfiles.input.IInputModeContext} inputModeContext
     * @param {number} angle
     * @return {number}
     */
    snapAngle(inputModeContext, angle) {
      // Check for disabled snapping
      const snapContext = inputModeContext.lookup(yfiles.input.SnapContext.$class)
      if (snapContext && !snapContext.enabled) {
        return angle
      }
      // Same angle snapping
      if (this.snapToSameAngleDelta > 0 && this.nodeAngles) {
        // Find the first angle that is sufficiently similar
        const candidate = this.nodeAngles
          .sort((nodeAngle1, nodeAngle2) => nodeAngle2.angle - nodeAngle1.angle)
          .find(
            nodeAngle =>
              normalizeAngle(Math.abs(nodeAngle.angle - angle)) < this.snapToSameAngleDelta
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
     * @param {yfiles.input.IInputModeContext} context
     * @param {yfiles.geometry.Point} originalLocation
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
     * @param {yfiles.input.IInputModeContext} context
     * @param {yfiles.geometry.Point} originalLocation
     * @param {yfiles.geometry.Point} newLocation
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
      const edgeEditingContext = context.lookup(yfiles.input.OrthogonalEdgeEditingContext.$class)
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
     * @param {yfiles.input.IInputModeContext} context
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
     * @param {yfiles.input.IInputModeContext} context
     * @param {number} angle
     */
    setAngle(context, angle) {
      const wrapper = this.node.style
      if (wrapper instanceof RotatableNodeStyleDecorator) {
        const undoEngine = context.lookup(yfiles.graph.UndoEngine.$class)
        if (undoEngine) {
          const undoUnit = new AngleChangeUndoUnit(wrapper)
          undoEngine.addUnit(undoUnit)
        }
        wrapper.angle = angle
      }
    }

    /**
     * Reads the angle from the node style if the style supports this.
     * @return {number}
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
     * @param {yfiles.input.IInputModeContext} context
     * @return {boolean}
     */
    shouldSnap(context) {
      const modifiers = context.canvasComponent.lastMouseEvent.modifiers
      const shouldSnap =
        (modifiers & yfiles.view.ModifierKeys.SHIFT) !== yfiles.view.ModifierKeys.SHIFT
      if (!shouldSnap && this.sameAngleHighlightedNodes) {
        this.clearSameAngleHighlights(context)
      }
      return shouldSnap
    }

    /**
     * Returns the x-coordinate of the handle's location.
     * @return {number}
     */
    get x() {
      return this.getLocation().x
    }

    /**
     * Returns the y-coordinate of the handle's location.
     * @return {number}
     */
    get y() {
      return this.getLocation().y
    }

    /**
     * Returns the handle's location.
     * @return {yfiles.geometry.Point}
     */
    getLocation() {
      const orientedRectangle = this.getOrientedRectangle(this.node)
      const anchor = orientedRectangle.anchorLocation
      const size = orientedRectangle.toSize()
      const up = new yfiles.geometry.Point(orientedRectangle.upX, orientedRectangle.upY)
      // calculate the location of the handle from the anchor, the size and the orientation
      const offset = 20
      return anchor
        .add(up.multiply(size.height + offset))
        .add(new yfiles.geometry.Point(-up.y, up.x).multiply(size.width * 0.5))
    }
  }

  /**
   * An undo unit to provide undo-/redo-functionality for angle changes.
   */
  class AngleChangeUndoUnit extends yfiles.graph.UndoUnitBase {
    /**
     * Creates a new instance.
     * @param {RotatableNodeStyleDecorator} nodeStyleDecorator
     */
    constructor(nodeStyleDecorator) {
      super('Change Angle')
      this.nodeStyleDecorator = nodeStyleDecorator
      this.oldAngle = nodeStyleDecorator.angle
      this.newAngle = 0
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
  class RotatableNodeClipboardHelper extends yfiles.lang.Class(yfiles.graph.IClipboardHelper) {
    /**
     * Returns whether or not to copying the given item is possible.
     * @param {yfiles.graph.IGraphClipboardContext} context
     * @param {yfiles.graph.IModelItem} item
     */
    shouldCopy(context, item) {
      return true
    }

    /**
     * Returns whether or not to cutting the given item is possible.
     * @param {yfiles.graph.IGraphClipboardContext} context
     * @param {yfiles.graph.IModelItem} item
     */
    shouldCut(context, item) {
      return true
    }

    /**
     * Returns whether or not to pasting of the given item is possible.
     * @param {yfiles.graph.IGraphClipboardContext} context
     * @param {yfiles.graph.IModelItem} item
     * @param {object} userData
     */
    shouldPaste(context, item, userData) {
      return true
    }

    /**
     * Adds no additional state to the copy-operation.
     * @param {yfiles.graph.IGraphClipboardContext} context
     * @param {yfiles.graph.IModelItem} item
     * @return {object}
     */
    copy(context, item) {
      return null
    }

    /**
     * Adds no additional state to the cut-operation.
     * @param {yfiles.graph.IGraphClipboardContext} context
     * @param {yfiles.graph.IModelItem} item
     * @return {object}
     */
    cut(context, item) {
      return null
    }

    /**
     * Copies the node style for the paste-operation because {@link RotatableNodeStyleDecorator} should not be shared.
     * @param {yfiles.graph.IGraphClipboardContext} context
     * @param {yfiles.graph.IModelItem} item
     * @param {object} userData
     */
    paste(context, item, userData) {
      const node = item
      if (node instanceof yfiles.graph.INode) {
        return
      }
      const styleWrapper = node.style
      if (styleWrapper instanceof RotatableNodeStyleDecorator) {
        if (context.targetGraph.foldingView) {
          context.targetGraph.foldingView.manager.masterGraph.setStyle(item, styleWrapper.clone())
        } else {
          context.targetGraph.setStyle(node, styleWrapper.clone())
        }
      }
    }
  }

  /**
   * An oriented rectangle that specifies the location, size and rotation angle of a rotated node.
   * This class is used mainly for performance reasons. It provides cached values. In principle, it would be enough to
   * store just the rotation angle but then, we would have to recalculate all the properties of this class very often.
   */
  class CachingOrientedRectangle extends yfiles.lang.Class(yfiles.geometry.IOrientedRectangle) {
    /**
     * Creates a new instance.
     * @param {yfiles.geometry.Rect} layout
     */
    constructor(layout = yfiles.geometry.Rect.EMPTY) {
      super()
      this.$upVector = new yfiles.geometry.Point(0, -1)
      this.$angle = 0.0
      this.cachedLayout = layout
      this.cachedOrientedRect = new yfiles.geometry.OrientedRectangle(this.cachedLayout)
    }

    /**
     * Returns the rotation angle.
     * @return {number}
     */
    get angle() {
      return this.$angle
    }

    /**
     * Specifies the rotation angle.
     * @param {number} angle
     */
    set angle(angle) {
      this.$angle = normalizeAngle(angle)
      this.cachedOrientedRect.angle = toRadians(angle)
      this.cachedOrientedRect.setCenter(this.cachedLayout.center)
      this.$upVector = this.cachedOrientedRect.upVector
    }

    /**
     * Returns the width of the rectangle.
     * @return {number}
     */
    get width() {
      return this.cachedLayout.width
    }

    /**
     * Returns the height of the rectangle.
     * @return {number}
     */
    get height() {
      return this.cachedLayout.height
    }

    /**
     * Returns the x-coordinate of the rectangle's anchor point.
     * @return {number}
     */
    get anchorX() {
      return this.cachedOrientedRect.anchorX
    }

    /**
     * Returns the y-coordinate of the rectangle's anchor point.
     * @return {number}
     */
    get anchorY() {
      return this.cachedOrientedRect.anchorY
    }

    /**
     * Returns the x-coordinate of the rectangle's up vector.
     * @return {number}
     */
    get upX() {
      return this.cachedOrientedRect.upX
    }

    /**
     * Returns the y-coordinate of the rectangle's up vector.
     * @return {number}
     */
    get upY() {
      return this.cachedOrientedRect.upY
    }

    /**
     * Returns the rectangle's up vector.
     * @return {yfiles.geometry.Point}
     */
    get upVector() {
      return this.$upVector
    }

    /**
     * Specifies the rectangle's up vector.
     * @param {yfiles.geometry.Point} upVector
     */
    set upVector(upVector) {
      this.$upVector = upVector
      this.cachedOrientedRect.setUpVector(upVector.x, upVector.y)
      this.cachedOrientedRect.setCenter(this.cachedLayout.center)
      this.angle = toDegrees(this.cachedOrientedRect.angle)
    }

    /**
     * Returns the angle in radians.
     * @return {number}
     */
    getRadians() {
      return toRadians(this.angle)
    }

    /**
     * Updates the layout in the cache.
     * @param {yfiles.geometry.Rect} layout
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
   * A context that returns no SnapContext in its lookup and delegates its other methods to an inner context.
   */
  class DelegatingContext extends yfiles.lang.Class(yfiles.input.IInputModeContext) {
    /**
     * Creates a new instance
     * @param {yfiles.input.IInputModeContext} context
     */
    constructor(context) {
      super()
      this.context = context
    }

    /**
     * Returns the wrapped context's zoom.
     * @return {number}
     */
    get zoom() {
      return this.context.zoom
    }

    /**
     * Returns the wrapped context's hit test radius.
     * @return {number}
     */
    get hitTestRadius() {
      return this.context.hitTestRadius
    }

    /**
     * Returns the wrapped context's canvas component.
     * @return {yfiles.view.CanvasComponent}
     */
    get canvasComponent() {
      return this.context.canvasComponent
    }

    /**
     * Returns the wrapped context's parent input mode.
     * @return {yfiles.input.IInputMode}
     */
    get parentInputMode() {
      return this.context.parentInputMode
    }

    /**
     * Delegates to the wrapped context's lookup but cancels the snap context.
     * @param {yfiles.lang.Class} type
     * @return {object}
     */
    lookup(type) {
      return type === yfiles.input.SnapContext.$class ? null : this.context.lookup(type)
    }
  }

  /**
   * This port handle is used only to trigger the updates of the orthogonal edge editing facility of yFiles.
   * In yFiles, all code related to updates of the orthogonal edge editing facility is internal. As a workaround,
   * we explicitly call internal port handles from our custom node handles.
   */
  class DummyPortLocationModelParameterHandle extends yfiles.input
    .PortLocationModelParameterHandle {
    /**
     * Does nothing since we don't want to change the port location.
     * @param {yfiles.graph.IGraph} graph
     * @param {yfiles.graph.IPort} port
     * @param {yfiles.graph.IPortLocationModelParameter} newParameter
     */
    setParameter(graph, port, newParameter) {
      // do nothing
    }

    /**
     * Returns the current port location since we don't want to change the port location.
     * @param {yfiles.graph.IPort} port
     * @param {yfiles.graph.IPortLocationModel} model
     * @param {yfiles.geometry.Point} newLocation
     */
    getNewParameter(port, model, newLocation) {
      return port.locationParameter
    }
  }

  /**
   * Markup extension that helps (de-)serializing a {@link RotatableNodeStyleDecorator).
   */
  const RotatableNodeStyleDecoratorExtension = yfiles.lang.Class(
    'RotatableNodeStyleDecoratorExtension',
    {
      $extends: yfiles.graphml.MarkupExtension,

      $angle: 0,
      /**
       * @type {number}
       */
      angle: {
        $meta() {
          return [
            yfiles.graphml.GraphMLAttribute().init({ defaultValue: 0 }),
            yfiles.lang.TypeAttribute(yfiles.lang.Number.$class)
          ]
        },
        get() {
          return this.$angle
        },
        set(value) {
          this.$angle = value
        }
      },

      $wrapped: null,
      /**
       * @type {yfiles.styles.INodeStyle}
       */
      wrapped: {
        get() {
          return this.$wrapped
        },
        set(value) {
          this.$wrapped = value
        }
      },

      provideValue(serviceProvider) {
        const style = new RotatableNodeStyleDecorator()
        style.angle = this.angle
        style.wrapped = this.wrapped
        return style
      }
    }
  )

  /**
   * Normalizes the angle to 0–360°.
   * @param {number} angle
   * @return {number}
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
   * @return {number}
   */
  function toDegrees(radians) {
    return radians * 180 / Math.PI
  }

  /**
   * Returns the given angle in radians.
   * @param {number} degrees
   * @return {number}
   */
  function toRadians(degrees) {
    return degrees / 180 * Math.PI
  }

  return {
    RotatableNodeStyleDecorator,
    RotatableNodeStyleDecoratorExtension,
    NodeRotateHandle
  }
})
