/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Class,
  GeneralPath,
  ICanvasContext,
  IInputModeContext,
  ILassoTestable,
  IMutableRectangle,
  INode,
  INodeStyle,
  Insets,
  IRenderContext,
  MutableRectangle,
  NodeStyleBase,
  Point,
  Rect,
  SimpleNode,
  SvgVisual,
  SvgVisualGroup
} from 'yfiles'

/**
 * Specifies the required information for an individual style to be used in composite visualizations.
 * @typedef {Object} StyleDefinition
 * @property {INodeStyle} style
 * @property {InsetsConvertible} [insets]
 */

/**
 * Combines visualizations of several {@link INodeStyle} instances to form a composite visualization.
 */
export class CompositeNodeStyle extends NodeStyleBase {
  mainStyle
  noMainInsets
  styleDefinitions
  dummyNode = new SimpleNode()
  dummyLayout = new MutableRectangle()

  /**
   * Initializes a new {@link CompositeNodeStyle} instance with the given style definitions.
   * The first style in the given array is considered to be this composite node style' main style.
   * @param {!Array.<StyleDefinition>} styleDefinitions the style instances that will be combined in this composite node style.
   */
  constructor(styleDefinitions) {
    super()

    if (styleDefinitions.length < 1) {
      throw new Error('Specify at least one style definition!')
    }

    // copy the given style definitions to ensure each definition has an associated Insets instance
    // to prevent the need for checking for insets during each and every style operation
    this.styleDefinitions = []
    for (const prototype of styleDefinitions) {
      const style = prototype.style
      const insets = prototype.insets ? Insets.from(prototype.insets) : Insets.EMPTY
      this.styleDefinitions.push({ style, insets })
    }

    this.mainStyle = this.styleDefinitions[0].style
    this.noMainInsets = this.styleDefinitions[0].insets.isEmpty

    this.dummyNode.layout = this.dummyLayout
  }

  /**
   * Creates a composite visualization from the visuals created by this style's various style
   * definitions.
   * @param {!IRenderContext} context the context in which to create a new visualization.
   * @param {!INode} node the node for which the visualization will be used.
   * @returns {!SvgVisualGroup}
   */
  createVisual(context, node) {
    this.setDummyLabelsPortsAndTag(node)

    const group = new SvgVisualGroup()
    const dummyNode = this.dummyNode
    const styleDefinitions = this.styleDefinitions
    for (const styleDefinition of styleDefinitions) {
      this.setDummyLayoutAndStyle(node, styleDefinition)

      const style = dummyNode.style
      const styleVisual = style.renderer.getVisualCreator(dummyNode, style).createVisual(context)
      group.add(styleVisual)
    }
    return group
  }

  /**
   * Updates the given composite visualization.
   * @param {!IRenderContext} context the context in which to create a new visualization.
   * @param {!SvgVisualGroup} oldVisual the composite visualization to update.
   * @param {!INode} node the node for which the visualization will be used.
   * @returns {!SvgVisualGroup}
   */
  updateVisual(context, oldVisual, node) {
    this.setDummyLabelsPortsAndTag(node)

    const dummyNode = this.dummyNode
    const styleDefinitions = this.styleDefinitions
    for (let i = 0; i < styleDefinitions.length; ++i) {
      this.setDummyLayoutAndStyle(node, styleDefinitions[i])

      const oldStyleVisual = oldVisual.children.get(i)
      const style = dummyNode.style
      const newStyleVisual =
        oldStyleVisual === null
          ? style.renderer.getVisualCreator(dummyNode, style).createVisual(context)
          : style.renderer.getVisualCreator(dummyNode, style).updateVisual(context, oldStyleVisual)
      if (newStyleVisual !== oldStyleVisual) {
        oldVisual.children.set(i, newStyleVisual)
      }
    }
    return oldVisual
  }

  /**
   * Calculates the visual bounds for the given node.
   * This method delegates bounds calculation to the composite node style's main style.
   * @param {!ICanvasContext} context
   * @param {!INode} node
   * @returns {!Rect}
   */
  getBounds(context, node) {
    const dummyNode = this.configureMainStyle(node)
    const style = this.mainStyle
    return style.renderer.getBoundsProvider(dummyNode, style).getBounds(context)
  }

  /**
   * Calculates the intersection point of the line segment defined by the two given points and
   * the given node's visual outline.
   * This method delegates intersection calculation to the composite node style's main style.
   * @param {!INode} node
   * @param {!Point} inner
   * @param {!Point} outer
   * @returns {?Point}
   */
  getIntersection(node, inner, outer) {
    const dummyNode = this.configureMainStyle(node)
    const style = this.mainStyle
    return style.renderer.getShapeGeometry(dummyNode, style).getIntersection(inner, outer)
  }

  /**
   * Calculates the geometry of the visual outline for the given node.
   * This method delegates outline calculation to the composite node style's main style.
   * @param {!INode} node
   * @returns {?GeneralPath}
   */
  getOutline(node) {
    const dummyNode = this.configureMainStyle(node)
    const style = this.mainStyle
    return style.renderer.getShapeGeometry(dummyNode, style).getOutline()
  }

  /**
   * Determines if a click at the given location hits the visualization for the given node.
   * This method delegates hit testing to the composite node style's main style.
   * @param {!IInputModeContext} context
   * @param {!Point} location
   * @param {!INode} node
   * @returns {boolean}
   */
  isHit(context, location, node) {
    const dummyNode = this.configureMainStyle(node)
    const style = this.mainStyle
    return style.renderer.getHitTestable(dummyNode, style).isHit(context, location)
  }

  /**
   * Determines if the visualization for the specified node is included in given marquee selection.
   * This method delegates marquee testing to the composite node style's main style.
   * @param {!IInputModeContext} context
   * @param {!Rect} rectangle
   * @param {!INode} node
   * @returns {boolean}
   */
  isInBox(context, rectangle, node) {
    const dummyNode = this.configureMainStyle(node)
    const style = this.mainStyle
    return style.renderer.getMarqueeTestable(dummyNode, style).isInBox(context, rectangle)
  }

  /**
   * Determines if the visualization for the specified node is included in the given lasso selection.
   * This method delegates lasso testing to the composite node style's main style.
   * @param {!IInputModeContext} context
   * @param {!GeneralPath} path
   * @param {!INode} node
   * @returns {boolean}
   */
  isInPath(context, path, node) {
    const dummyNode = this.configureMainStyle(node)
    const style = this.mainStyle
    const testable = style.renderer.getContext(dummyNode, style).lookup(ILassoTestable.$class)
    if (testable) {
      return testable.isInPath(context, path)
    } else {
      return super.isInPath(context, path, node)
    }
  }

  /**
   * Determines if the provided point is geometrically inside the visual bounds of the node.
   * This method delegates contains testing to the composite node style's main style.
   * @param {!INode} node
   * @param {!Point} location
   * @returns {boolean}
   */
  isInside(node, location) {
    const dummyNode = this.configureMainStyle(node)
    const style = this.mainStyle
    return style.renderer.getShapeGeometry(dummyNode, style).isInside(location)
  }

  /**
   * Determines if the given node's visualization intersects the given viewport rectangle.
   * This method delegates visibility testing to the composite node style's main style.
   * @param {!ICanvasContext} context
   * @param {!Rect} rectangle
   * @param {!INode} node
   * @returns {boolean}
   */
  isVisible(context, rectangle, node) {
    const dummyNode = this.configureMainStyle(node)
    const style = this.mainStyle
    return style.renderer.getVisibilityTestable(dummyNode, style).isVisible(context, rectangle)
  }

  /**
   * Handles queries for behavior implementations for the given node.
   * This method delegates behavior lookup to the composite node style's main style.
   * @param {!INode} node
   * @param {!Class} type
   * @returns {?object}
   */
  lookup(node, type) {
    const dummyNode = this.configureMainStyle(node)
    const style = this.mainStyle
    return style.renderer.getContext(dummyNode, style).lookup(type)
  }

  /**
   * @param {!INode} node
   * @returns {!INode}
   */
  configureMainStyle(node) {
    // in case we do not have insets for the main node style, we can use the original node because
    // the layout is the same
    if (this.noMainInsets) {
      return node
    } else {
      this.setDummyLayoutAndStyle(node, this.styleDefinitions[0])
      this.setDummyLabelsPortsAndTag(node)
      return this.dummyNode
    }
  }

  /**
   * @param {!INode} prototype
   * @param {!object} styleDefinition
   */
  setDummyLayoutAndStyle(prototype, styleDefinition) {
    reshape(this.dummyLayout, prototype, styleDefinition.insets)
    this.dummyNode.style = styleDefinition.style
  }

  /**
   * @param {!INode} prototype
   */
  setDummyLabelsPortsAndTag(prototype) {
    this.dummyNode.labels = prototype.labels
    this.dummyNode.ports = prototype.ports
    this.dummyNode.tag = prototype.tag
  }
}

/**
 * Sets the given rectangle's geometry to the interior of the given node. In this context,
 * __interior__ means the node's paraxial bounds minus the given insets.
 * @param {!IMutableRectangle} rectangle
 * @param {!INode} forNode
 * @param {!Insets} insets
 */
function reshape(rectangle, forNode, insets) {
  const nl = forNode.layout
  rectangle.reshape(
    nl.x + insets.left,
    nl.y + insets.top,
    nl.width - insets.horizontalInsets,
    nl.height - insets.verticalInsets
  )
}
