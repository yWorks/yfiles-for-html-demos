/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
import {
  CanvasComponent,
  CollapsibleNodeStyleDecoratorRenderer,
  Fill,
  Font,
  GeneralPath,
  GraphComponent,
  IInputModeContext,
  ILabel,
  INode,
  IRenderContext,
  Insets,
  LabelStyleBase,
  Matrix,
  NodeStyleBase,
  Point,
  Rect,
  Size,
  SolidColorFill,
  Stroke,
  SvgVisual,
  SvgVisualGroup,
  TextRenderSupport,
  Visual
} from 'yfiles'

import * as IsometricTransformationSupport from './IsometricTransformationSupport.js'

/**
 * A node style that visualizes the node as block in an isometric fashion.
 */
export class NodeStyle extends NodeStyleBase {
  /**
   * @param {IRenderContext} context
   * @param {INode} node
   * @return {SvgVisual}
   */
  createVisual(context, node) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const faces = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const lines = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    container.appendChild(faces)
    container.appendChild(lines)

    // create faces
    const geometry = node.tag.geometry
    const corners = IsometricTransformationSupport.calculateCorners(geometry)
    IsometricTransformationSupport.moveTo(node.layout.x, node.layout.y, corners)

    const topFacePath = NodeStyle.getTopFacePath(corners)
    const faceTop = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    faceTop.setAttribute('d', topFacePath.createSvgPathData())
    faces.appendChild(faceTop)

    const faceLeft = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const faceRight = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    if (geometry.height > 0) {
      const leftFacePath = NodeStyle.getLeftFacePath(corners)
      faceLeft.setAttribute('d', leftFacePath.createSvgPathData())
      faces.appendChild(faceLeft)

      const rightFacePath = NodeStyle.getRightFacePath(corners)
      faceRight.setAttribute('d', rightFacePath.createSvgPathData())
      faces.appendChild(faceRight)
    }

    const fill = getFill(node.tag.fill)
    if (!fill) {
      Fill.setFill(null, faceTop, context)
      Fill.setFill(null, faceLeft, context)
      Fill.setFill(null, faceRight, context)
    } else {
      let color = fill
      color.applyTo(faceTop, context)
      if (geometry.height > 0) {
        color = darker(color)
        color.applyTo(faceLeft, context)
        color = darker(color)
        color.applyTo(faceRight, context)
      }
    }

    // create lines
    const outline = this.getLines(node, corners, geometry)
    lines.setAttribute('d', outline.createSvgPathData())
    const stroke = getStroke(node.tag.stroke) || null
    Stroke.setStroke(stroke, lines, context)
    lines.style.fill = 'none'

    container['render-data-cache'] = {
      x: node.layout.x,
      y: node.layout.y,
      width: geometry.width,
      height: geometry.height,
      depth: geometry.depth,
      fill: node.tag.fill,
      stroke: node.tag.stroke
    }

    return new SvgVisual(container)
  }

  /**
   * @param {IRenderContext} context
   * @param {Visual} oldVisual
   * @param {INode} node
   * @return {SvgVisual}
   */
  updateVisual(context, oldVisual, node) {
    const container = oldVisual.svgElement
    const cache = container['render-data-cache']

    if (container.childElementCount !== 2) {
      return this.createVisual(context, node)
    }

    const faces = container.firstElementChild
    const lines = container.lastElementChild

    // create faces
    const geometry = node.tag.geometry
    const corners = IsometricTransformationSupport.calculateCorners(geometry)
    IsometricTransformationSupport.moveTo(node.layout.x, node.layout.y, corners)

    if (cache.x !== node.layout.x || cache.y !== node.layout.y || cache.geometry !== geometry) {
      const topFacePath = NodeStyle.getTopFacePath(corners)
      const faceTop = faces.firstElementChild
      faceTop.setAttribute('d', topFacePath.createSvgPathData())

      if (geometry.height === 0 && faces.childElementCount > 1) {
        faces.removeChild(faces.lastElementChild)
        faces.removeChild(faces.lastElementChild)
      } else if (geometry.height > 0) {
        let faceLeft
        let faceRight
        if (faces.childElementCount === 1) {
          faceLeft = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          faceRight = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          faces.appendChild(faceLeft)
          faces.appendChild(faceRight)
        } else {
          faceLeft = faces.childNodes.item(1)
          faceRight = faces.childNodes.item(2)
        }
        const leftFacePath = NodeStyle.getLeftFacePath(corners)
        faceLeft.setAttribute('d', leftFacePath.createSvgPathData())

        const rightFacePath = NodeStyle.getRightFacePath(corners)
        faceRight.setAttribute('d', rightFacePath.createSvgPathData())
      }

      // update lines
      const outline = this.getLines(node, corners, geometry)
      lines.setAttribute('d', outline.createSvgPathData())
    }

    const fill = getFill(node.tag.fill)
    if (cache.fill !== fill) {
      if (!fill) {
        Fill.TRANSPARENT.applyTo(faces.childNodes.item(0), context)
        if (geometry.height > 0) {
          Fill.TRANSPARENT.applyTo(faces.childNodes.item(1), context)
          Fill.TRANSPARENT.applyTo(faces.childNodes.item(2), context)
        }
      } else {
        let color = fill
        color.applyTo(faces.childNodes.item(0), context)
        if (geometry.height > 0) {
          color = darker(color)
          color.applyTo(faces.childNodes.item(1), context)
          color = darker(color)
          color.applyTo(faces.childNodes.item(2), context)
        }
      }
    }

    const stroke = getStroke(node.tag.stroke) || Stroke.TRANSPARENT
    if (cache.stroke !== stroke) {
      Stroke.setStroke(stroke, lines, context)
    }

    container['render-data-cache'] = {
      x: node.layout.x,
      y: node.layout.y,
      width: geometry.width,
      height: geometry.height,
      depth: geometry.depth,
      fill: node.tag.fill,
      stroke: node.tag.stroke
    }

    return new SvgVisual(container)
  }

  /**
   * Creates a {@link GeneralPath} that describes the edges of the block.
   * @param {INode} node the that is visualized
   * @param {Array} corners the coordinates of the corners of the block.
   * @param {Object} geometry the 3D-geometry data for the node.
   * @return {GeneralPath}
   */
  getLines(node, corners, geometry) {
    const outline = this.getOutline(node)

    if (geometry.height > 0) {
      // add lines to visualize the edges of the cuboid
      outline.moveTo(
        corners[IsometricTransformationSupport.C7_X],
        corners[IsometricTransformationSupport.C7_Y]
      )
      outline.lineTo(
        corners[IsometricTransformationSupport.C4_X],
        corners[IsometricTransformationSupport.C4_Y]
      )
      outline.moveTo(
        corners[IsometricTransformationSupport.C7_X],
        corners[IsometricTransformationSupport.C7_Y]
      )
      outline.lineTo(
        corners[IsometricTransformationSupport.C3_X],
        corners[IsometricTransformationSupport.C3_Y]
      )
      outline.moveTo(
        corners[IsometricTransformationSupport.C7_X],
        corners[IsometricTransformationSupport.C7_Y]
      )
      outline.lineTo(
        corners[IsometricTransformationSupport.C6_X],
        corners[IsometricTransformationSupport.C6_Y]
      )
    }
    return outline
  }

  /**
   * Creates a {@link GeneralPath} that describes the face on top of the block.
   * @param {Array} corners the coordinates of the corners of the block.
   * @return {GeneralPath}
   */
  static getTopFacePath(corners) {
    const path = new GeneralPath()
    path.moveTo(
      corners[IsometricTransformationSupport.C4_X],
      corners[IsometricTransformationSupport.C4_Y]
    )
    path.lineTo(
      corners[IsometricTransformationSupport.C5_X],
      corners[IsometricTransformationSupport.C5_Y]
    )
    path.lineTo(
      corners[IsometricTransformationSupport.C6_X],
      corners[IsometricTransformationSupport.C6_Y]
    )
    path.lineTo(
      corners[IsometricTransformationSupport.C7_X],
      corners[IsometricTransformationSupport.C7_Y]
    )
    path.close()
    return path
  }

  /**
   * Creates a {@link GeneralPath} that describes the face on the left front of the block.
   * @param {Array} corners the coordinates of the corners of the block.
   * @return {GeneralPath}
   */
  static getLeftFacePath(corners) {
    const path = new GeneralPath()
    path.moveTo(
      corners[IsometricTransformationSupport.C0_X],
      corners[IsometricTransformationSupport.C0_Y]
    )
    path.lineTo(
      corners[IsometricTransformationSupport.C4_X],
      corners[IsometricTransformationSupport.C4_Y]
    )
    path.lineTo(
      corners[IsometricTransformationSupport.C7_X],
      corners[IsometricTransformationSupport.C7_Y]
    )
    path.lineTo(
      corners[IsometricTransformationSupport.C3_X],
      corners[IsometricTransformationSupport.C3_Y]
    )
    path.close()
    return path
  }

  /**
   * Creates a {@link GeneralPath} that describes the face on the right front of the block.
   * @param {Array} corners the coordinates of the corners of the block.
   * @return {GeneralPath}
   */
  static getRightFacePath(corners) {
    const path = new GeneralPath()
    path.moveTo(
      corners[IsometricTransformationSupport.C3_X],
      corners[IsometricTransformationSupport.C3_Y]
    )
    path.lineTo(
      corners[IsometricTransformationSupport.C7_X],
      corners[IsometricTransformationSupport.C7_Y]
    )
    path.lineTo(
      corners[IsometricTransformationSupport.C6_X],
      corners[IsometricTransformationSupport.C6_Y]
    )
    path.lineTo(
      corners[IsometricTransformationSupport.C2_X],
      corners[IsometricTransformationSupport.C2_Y]
    )
    path.close()
    return path
  }

  /**
   * @param {INode} node
   * @return {GeneralPath}
   */
  getOutline(node) {
    const outline = new GeneralPath()
    const corners = IsometricTransformationSupport.calculateCorners(node.tag.geometry)
    IsometricTransformationSupport.moveTo(node.layout.x, node.layout.y, corners)
    outline.moveTo(
      corners[IsometricTransformationSupport.C0_X],
      corners[IsometricTransformationSupport.C0_Y]
    )
    outline.lineTo(
      corners[IsometricTransformationSupport.C3_X],
      corners[IsometricTransformationSupport.C3_Y]
    )
    outline.lineTo(
      corners[IsometricTransformationSupport.C2_X],
      corners[IsometricTransformationSupport.C2_Y]
    )
    outline.lineTo(
      corners[IsometricTransformationSupport.C6_X],
      corners[IsometricTransformationSupport.C6_Y]
    )
    outline.lineTo(
      corners[IsometricTransformationSupport.C5_X],
      corners[IsometricTransformationSupport.C5_Y]
    )
    outline.lineTo(
      corners[IsometricTransformationSupport.C4_X],
      corners[IsometricTransformationSupport.C4_Y]
    )
    outline.close()
    return outline
  }

  /**
   * @param {CanvasContext} context
   * @param {INode} node
   * @return {Rect}
   */
  getBounds(context, node) {
    return this.getOutline(node).getBounds()
  }

  /**
   * @param {IInputModeContext} context
   * @param {Point} location
   * @return {INode} node
   */
  isHit(context, location, node) {
    return this.getOutline(node).areaContains(location)
  }

  /**
   * @return {INode} node
   * @param {Point} location
   */
  isInside(node, location) {
    return this.getOutline(node).areaContains(location)
  }

  /**
   * @param {CanvasContext} context
   * @param {Rect} rectangle
   * @param {INode} node
   * @return {boolean}
   */
  isVisible(context, rectangle, node) {
    return this.getOutline(node).intersects(rectangle, 0.5)
  }

  /**
   * @param {INode} node
   * @param {Point} inner
   * @param {Point} outer
   * @return {Point}
   */
  getIntersection(node, inner, outer) {
    const outline = this.getOutline(node)
    const factor = outline.findLineIntersection(inner, outer)
    if (factor !== Number.POSITIVE_INFINITY) {
      return new Point(
        inner.x + factor * (outer.x - inner.x),
        inner.y + factor * (outer.y - inner.y)
      )
    }
    return null
  }
}

/**
 * Returns a darker shade fill of the given fill.
 * @param {SolidColorFill} fill the base fill.
 * @return {SolidColorFill}
 */
function darker(fill) {
  const color = fill.color
  const factor = 0.7
  const r = Math.max(0, Math.min(Math.round(color.r * factor), 255))
  const g = Math.max(0, Math.min(Math.round(color.g * factor), 255))
  const b = Math.max(0, Math.min(Math.round(color.b * factor), 255))
  return new SolidColorFill(r, g, b, color.a)
}

/**
 * A node that visualizes group nodes in an isometric fashion.
 */
export class GroupNodeStyle extends NodeStyleBase {
  constructor() {
    super()
    this.wrapped = new NodeStyle()
  }

  /**
   * Returns the gap around a collapse button.
   * @return {number}
   */
  static get ICON_GAP() {
    return 2
  }

  /**
   * Returns height of a collapse button.
   * @return {number}
   */
  static get ICON_HEIGHT() {
    return 18
  }

  /**
   * Returns width of a collapse button.
   * @return {number}
   */
  static get ICON_WIDTH() {
    return 18
  }

  /**
   * @param {IRenderContext} context
   * @param {INode} node
   * @return {SvgVisualGroup}
   */
  createVisual(context, node) {
    const container = new SvgVisualGroup()
    container.add(this.wrapped.createVisual(context, node))
    container.add(this.createHeader(node, context))
    container.add(
      this.createButton(node, GroupNodeStyle.isCollapsed(node, context.canvasComponent), context)
    )
    return container
  }

  /**
   * @param {IRenderContext} context
   * @param {Visual} oldVisual
   * @param {INode} node
   * @return {SvgVisualGroup}
   */
  updateVisual(context, oldVisual, node) {
    const container = oldVisual

    if (!(container instanceof SvgVisualGroup)) {
      return this.createVisual(node)
    }

    this.wrapped.updateVisual(context, container.children.get(0), node)
    this.updateHeader(node, container.children.get(1), context)
    this.updateButton(
      node,
      container.children.get(2),
      GroupNodeStyle.isCollapsed(node, context.canvasComponent)
    )
    return container
  }

  /**
   * Creates an isometrically transformed rectangle that fills the header in which a label can be placed.
   * @param {INode} node the group node.
   * @param {IRenderContext} context
   * @return {SvgVisual}
   */
  createHeader(node, context) {
    const header = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    GroupNodeStyle.renderHeader(header, node, context)
    return new SvgVisual(header)
  }

  /**
   * Updates an isometrically transformed rectangle that fills the header in which a label can be placed.
   * @param {INode} node the group node.
   * @param {SvgVisual} oldVisual the visual to update.
   * @param {IRenderContext} context
   * @return {SvgVisual}
   */
  updateHeader(node, oldVisual, context) {
    const header = oldVisual.svgElement
    const cache = header['render-data-cache']

    // Calculate the height of the label in the layout space
    let headerHeight = GroupNodeStyle.ICON_HEIGHT + 2 * GroupNodeStyle.ICON_GAP
    const firstLabel = node.labels.firstOrDefault()
    if (firstLabel) {
      headerHeight = Math.max(headerHeight, firstLabel.layout.height)
    }
    const fill = getFill(node.tag.headerFill)
    if (
      cache.x !== node.layout.x ||
      cache.y !== node.layout.y ||
      cache.headerHeight !== headerHeight ||
      cache.geometry !== node.tag.geometry ||
      cache.fill !== fill
    ) {
      GroupNodeStyle.renderHeader(header, node, context)
    }
    return oldVisual
  }

  /**
   * @param {SVGElement} header
   * @param {INode} node
   * @param {IRenderContext} context
   */
  static renderHeader(header, node, context) {
    // calculate the corners of the node in the view space.
    const geometry = node.tag.geometry
    const corners = IsometricTransformationSupport.calculateCorners(geometry)
    IsometricTransformationSupport.moveTo(node.layout.x, node.layout.y, corners)

    // the lower corner is the anchor of the label.
    const anchorX = corners[IsometricTransformationSupport.C3_X]
    const anchorY = corners[IsometricTransformationSupport.C3_Y]

    // Calculate the box of the label in the layout space. It uses the whole width of the node.
    let headerHeight = GroupNodeStyle.ICON_HEIGHT + 2 * GroupNodeStyle.ICON_GAP
    const firstLabel = node.labels.firstOrDefault()
    if (firstLabel) {
      headerHeight = Math.max(headerHeight, firstLabel.layout.height)
    }
    header.setAttribute('x', anchorX)
    header.setAttribute('y', anchorY - headerHeight)
    header.setAttribute('width', geometry.width)
    header.setAttribute('height', headerHeight)
    const fill = getFill(node.tag.headerFill)
    if (fill) {
      fill.applyTo(header, context)
    } else {
      new SolidColorFill(153, 204, 255, 255).applyTo(header, context)
    }

    // add the transformation from the layout space into the view space
    transformToViewSpace(header, anchorX, anchorY)

    header['render-data-cache'] = {
      x: node.layout.x,
      y: node.layout.y,
      headerHeight,
      geometry,
      fill
    }
  }

  /**
   * Creates a visual that shows a collapse button.
   * @param {INode} node the group node.
   * @param {boolean} collapsed whether or not the group node is currently collapsed.
   * @param {IRenderContext} context
   * @return {SvgVisual}
   */
  createButton(node, collapsed, context) {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    GroupNodeStyle.renderButton(icon, node, collapsed)
    const visual = new SvgVisual(icon)
    CollapsibleNodeStyleDecoratorRenderer.addToggleExpansionStateCommand(visual, node, context)
    return visual
  }

  /**
   * Updates the visual that shows a collapse button.
   * @param {INode} node the group node.
   * @param {SvgVisual} oldVisual
   * @param {boolean} collapsed whether or not the group node is currently collapsed.
   * @return {Visual}
   */
  updateButton(node, oldVisual, collapsed) {
    const icon = oldVisual.svgElement
    const cache = icon['render-data-cache']
    if (
      cache.x !== node.layout.x ||
      cache.y !== node.layout.y ||
      cache.geometry !== node.tag.geometry
    ) {
      GroupNodeStyle.renderButton(icon, node, collapsed)
    }
    return oldVisual
  }

  /**
   * @param {SVGElement} icon
   * @param {INode} node
   * @param {boolean} collapsed
   * @return {SVGElement}
   */
  static renderButton(icon, node, collapsed) {
    // paint group state icon
    // calculate the corners of the node in the view space.
    const geometry = node.tag.geometry
    const corners = IsometricTransformationSupport.calculateCorners(geometry)
    IsometricTransformationSupport.moveTo(node.layout.x, node.layout.y, corners)

    // the lower corner is the anchor of the label.
    const anchorX = corners[IsometricTransformationSupport.C3_X]
    const anchorY = corners[IsometricTransformationSupport.C3_Y]

    // determine position of the icon
    const x = anchorX + GroupNodeStyle.ICON_GAP
    const y = anchorY - GroupNodeStyle.ICON_HEIGHT - GroupNodeStyle.ICON_GAP

    // paint icon border
    const path = new GeneralPath()
    path.moveTo(x, y)
    path.lineTo(x + GroupNodeStyle.ICON_WIDTH, y)
    path.lineTo(x + GroupNodeStyle.ICON_WIDTH, y + GroupNodeStyle.ICON_HEIGHT)
    path.lineTo(x, y + GroupNodeStyle.ICON_HEIGHT)
    path.close()

    // paint "+" (folder) or "-" (group)
    path.moveTo(x + GroupNodeStyle.ICON_WIDTH * 0.25, y + GroupNodeStyle.ICON_HEIGHT * 0.5)
    path.lineTo(x + GroupNodeStyle.ICON_WIDTH * 0.75, y + GroupNodeStyle.ICON_HEIGHT * 0.5)
    if (collapsed) {
      path.moveTo(x + GroupNodeStyle.ICON_WIDTH * 0.5, y + GroupNodeStyle.ICON_HEIGHT * 0.25)
      path.lineTo(x + GroupNodeStyle.ICON_WIDTH * 0.5, y + GroupNodeStyle.ICON_HEIGHT * 0.75)
    }

    // create icon
    icon.setAttribute('d', path.createSvgPathData())
    icon.setAttribute('fill', 'white')
    icon.setAttribute('stroke', 'black')
    icon.setAttribute('stroke-linecap', 'round')
    icon.setAttribute('stroke-linejoin', 'round')

    // add the transformation from the layout space into the view space
    transformToViewSpace(icon, anchorX, anchorY)

    // store data for updating button visual
    icon['render-data-cache'] = {
      x: node.layout.x,
      y: node.layout.y,
      geometry: node.tag.geometry
    }

    return icon
  }

  /**
   * Returns whether or not the given group node is collapsed.
   * @param {INode} node
   * @param {CanvasComponent} canvasComponent
   * @return {boolean}
   */
  static isCollapsed(node, canvasComponent) {
    if (!(canvasComponent instanceof GraphComponent)) {
      return false
    }
    const foldedGraph = canvasComponent.graph.foldingView
    // check if given node is in graph
    if (!foldedGraph || !foldedGraph.graph.contains(node)) {
      return false
    }
    // check if the node really is a group in the master graph
    return !foldedGraph.isExpanded(node)
  }

  getOutline(node) {
    return this.wrapped.getOutline(node)
  }

  getBounds(context, node) {
    return this.wrapped.getBounds(context, node)
  }

  isHit(context, location, node) {
    return this.wrapped.isHit(context, location, node)
  }

  isInside(node, location) {
    return this.wrapped.isInside(node, location)
  }

  isVisible(context, rectangle, node) {
    return this.wrapped.isVisible(context, rectangle, node)
  }

  getIntersection(node, inner, outer) {
    return this.wrapped.getIntersection(node, inner, outer)
  }
}

/**
 * A node style that visualizes group node labels in an isometric fashion.
 */
export class GroupLabelStyle extends LabelStyleBase {
  /**
   * Creates a new instance of GroupLabelStyle
   * @param {Insets} insets
   * @param {Font} font
   */
  constructor(insets, font) {
    super()
    this.insets = insets || new Insets(3)
    this.font = font || new Font({ fontSize: 14 })
  }

  /**
   * @param {IRenderContext} context
   * @param {ILabel} label
   * @return {SvgVisual}
   */
  createVisual(context, label) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // Calculate the corners of the node in the view space.
    const group = label.owner
    const geometry = group.tag.geometry
    const corners = IsometricTransformationSupport.calculateCorners(geometry)
    IsometricTransformationSupport.moveTo(group.layout.x, group.layout.y, corners)

    // The lower corner is the anchor of the label.
    // Note: this label configuration does not take label models into account
    const anchorX = corners[IsometricTransformationSupport.C3_X]
    const anchorY = corners[IsometricTransformationSupport.C3_Y]

    // Add the label text with the transformed graphics context.
    // It is placed on the bottom right side of the node.
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.textContent = label.text
    text.setAttribute('x', anchorX + geometry.width - this.insets.right)
    text.setAttribute('y', anchorY - this.insets.bottom - 3)
    text.setAttribute('text-anchor', 'end')
    text.setAttribute('vertical-align', 'text-bottom')
    this.font.applyTo(text)

    container.appendChild(text)

    // Create a transformation from the layout space into the view space.
    transformToViewSpace(container, anchorX, anchorY)

    container['render-data-cache'] = {
      text: label.text,
      x: group.layout.x,
      y: group.layout.y,
      geometry
    }

    return new SvgVisual(container)
  }

  /**
   * @param {IRenderContext} context
   * @param {Visual} oldVisual
   * @param {ILabel} label
   * @return {Visual}
   */
  updateVisual(context, oldVisual, label) {
    const container = oldVisual.svgElement
    const cache = container['render-data-cache']

    if (container.childElementCount !== 1) {
      return this.createVisual(context, label)
    }

    // Calculate the corners of the node in the view space.
    const group = label.owner
    const geometry = group.tag.geometry
    const corners = IsometricTransformationSupport.calculateCorners(geometry)
    IsometricTransformationSupport.moveTo(group.layout.x, group.layout.y, corners)

    if (
      cache.text !== label.text ||
      cache.x !== label.layout.bounds.x ||
      cache.y !== label.layout.bounds.y
    ) {
      // The lower corner is the anchor of the label.
      // Note: this label configuration does not take label models into account
      const anchorX = corners[IsometricTransformationSupport.C3_X]
      const anchorY = corners[IsometricTransformationSupport.C3_Y]

      // Add the label text with the transformed graphics context.
      // It is placed on the bottom right side of the node.
      const text = container.firstElementChild
      text.textContent = label.text
      text.setAttribute('x', anchorX + geometry.width - this.insets.right)
      text.setAttribute('y', anchorY - this.insets.bottom - 3)
      text.setAttribute('text-anchor', 'end')
      text.setAttribute('vertical-align', 'text-bottom')

      // Create a transformation from the layout space into the view space.
      transformToViewSpace(container, anchorX, anchorY)
    }

    container['render-data-cache'] = {
      text: label.text,
      x: group.layout.x,
      y: group.layout.y,
      geometry
    }

    return oldVisual
  }

  /**
   * @param {ILabel} label
   * @return {Size}
   */
  getPreferredSize(label) {
    const size = TextRenderSupport.measureText(label.text, this.font)
    return new Size(
      size.width + this.insets.left + this.insets.right,
      size.height + this.insets.top + this.insets.bottom
    )
  }

  /**
   * @param {CanvasContext} context
   * @param {Rect} rectangle
   * @param {ILabel} label
   */
  isVisible(context, rectangle, label) {
    return label.owner.style.isVisible(context, rectangle, label.owner)
  }
}

/**
 * An edge label style that visualizes the label text and box standing up on the isometric plane.
 */
export class EdgeLabelStyle extends LabelStyleBase {
  /**
   * Creates a new instance of EdgeLabelStyle.
   * @param {Insets} insets
   */
  constructor(insets) {
    super()
    this.insets = insets || new Insets(3)
  }

  /**
   * @param {IRenderContext} context
   * @param {ILabel} label
   * @return {SvgVisual}
   */
  createVisual(context, label) {
    const bounds = label.layout.bounds
    const geometry = label.tag.geometry

    const corners = IsometricTransformationSupport.calculateCorners(geometry)
    IsometricTransformationSupport.moveTo(bounds.x, bounds.y, corners)

    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // only draw the side of the 3-dimensional label box as background for the label
    // the correct side depends on the labels orientation
    const path = EdgeLabelStyle.getBackgroundPath(label, corners)
    const box = path.createSvgPath()
    const stroke = getStroke(label.tag.stroke) || Stroke.BLACK
    stroke.applyTo(box, context)
    const fill = getFill(label.tag.fill) || new SolidColorFill(255, 255, 153, 255)
    fill.applyTo(box, context)
    container.appendChild(box)

    const anchor = EdgeLabelStyle.getAnchor(label, corners)
    const matrix = EdgeLabelStyle.getTransformationMatrix(label, anchor)

    // paint the text with transformed graphics context
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.textContent = label.text
    text.setAttribute('x', anchor.x + this.insets.left)
    text.setAttribute('y', anchor.y - this.insets.bottom - 3)
    const textFill = getFill(label.tag.textFill) || Fill.BLACK
    textFill.applyTo(text, context)
    matrix.applyTo(text)
    container.appendChild(text)

    container['render-data-cache'] = {
      text: label.text,
      x: bounds.x,
      y: bounds.y,
      geometry,
      stroke,
      fill,
      textFill
    }

    return new SvgVisual(container)
  }

  /**
   * @param {IRenderContext} context
   * @param {Visual} oldVisual
   * @param {ILabel} label
   * @return {Visual}
   */
  updateVisual(context, oldVisual, label) {
    const bounds = label.layout.bounds
    const geometry = label.tag.geometry

    const corners = IsometricTransformationSupport.calculateCorners(geometry)
    IsometricTransformationSupport.moveTo(bounds.x, bounds.y, corners)

    const container = oldVisual.svgElement
    const cache = container['render-data-cache']

    if (container.childElementCount !== 2) {
      return this.createVisual(context, label)
    }

    const box = container.firstElementChild
    const text = container.lastElementChild
    if (
      cache.text !== label.text ||
      cache.geometry !== geometry ||
      cache.x !== bounds.x ||
      cache.y !== bounds.y
    ) {
      // only draw the side of the 3-dimensional label box as background for the label
      // the correct side depends on the labels orientation
      const path = EdgeLabelStyle.getBackgroundPath(label, corners)
      box.setAttribute('d', path.createSvgPathData())

      // paint the text with transformed graphics context
      const anchor = EdgeLabelStyle.getAnchor(label, corners)
      const matrix = EdgeLabelStyle.getTransformationMatrix(label, anchor)
      text.textContent = label.text
      text.setAttribute('x', anchor.x + this.insets.left)
      text.setAttribute('y', anchor.y - this.insets.bottom - 3)
      matrix.applyTo(text)
    }

    const stroke = getStroke(label.tag.stroke) || Stroke.BLACK
    if (cache.stroke !== stroke) {
      stroke.applyTo(box)
    }
    const fill = getFill(label.tag.fill) || new SolidColorFill(255, 255, 153, 255)
    if (cache.fill !== fill) {
      fill.applyTo(box, context)
    }

    const textFill = getFill(label.tag.textFill) || Fill.BLACK
    if (cache.textFill !== textFill) {
      textFill.applyTo(text, context)
    }

    container['render-data-cache'] = {
      text: label.text,
      x: bounds.x,
      y: bounds.y,
      geometry,
      stroke,
      fill,
      textFill
    }

    return oldVisual
  }

  /**
   * Returns a {@link GeneralPath} that show one side of the labels 3D-geometry and is used as
   * background for the label.
   * @param {ILabel} label the label for which the background is rendered.
   * @param {Array} corners the coordinates of the corners of the label box.
   * @return {GeneralPath}
   */
  static getBackgroundPath(label, corners) {
    const path = new GeneralPath()
    if (label.tag.geometry && label.tag.geometry.horizontal) {
      path.moveTo(
        corners[IsometricTransformationSupport.C0_X],
        corners[IsometricTransformationSupport.C0_Y]
      )
      path.lineTo(
        corners[IsometricTransformationSupport.C1_X],
        corners[IsometricTransformationSupport.C1_Y]
      )
      path.lineTo(
        corners[IsometricTransformationSupport.C5_X],
        corners[IsometricTransformationSupport.C5_Y]
      )
      path.lineTo(
        corners[IsometricTransformationSupport.C4_X],
        corners[IsometricTransformationSupport.C4_Y]
      )
      path.close()
    } else {
      path.moveTo(
        corners[IsometricTransformationSupport.C2_X],
        corners[IsometricTransformationSupport.C2_Y]
      )
      path.lineTo(
        corners[IsometricTransformationSupport.C1_X],
        corners[IsometricTransformationSupport.C1_Y]
      )
      path.lineTo(
        corners[IsometricTransformationSupport.C5_X],
        corners[IsometricTransformationSupport.C5_Y]
      )
      path.lineTo(
        corners[IsometricTransformationSupport.C6_X],
        corners[IsometricTransformationSupport.C6_Y]
      )
      path.close()
    }
    return path
  }

  /**
   * Returns one corner of the label block to anchor the label on.
   * @param {ILabel} label the label to be placed.
   * @param {Array} corners the coordinates of the corners of the label box.
   * @return {Point}
   */
  static getAnchor(label, corners) {
    if (label.tag.geometry && label.tag.geometry.horizontal) {
      return new Point(
        corners[IsometricTransformationSupport.C0_X],
        corners[IsometricTransformationSupport.C0_Y]
      )
    }
    return new Point(
      corners[IsometricTransformationSupport.C1_X],
      corners[IsometricTransformationSupport.C1_Y]
    )
  }

  /**
   * Returns the matrix to transform the label from layout to view space.
   * @param {ILabel} label the label to transform.
   * @param {Point} anchor The anchor of the label (one of the corners of the block)
   * @return {Matrix}
   */
  static getTransformationMatrix(label, anchor) {
    const matrix = new Matrix()
    if (label.tag.geometry && label.tag.geometry.horizontal) {
      // transformation to the left backside of the 3-dimensional label box
      matrix.translate(Point.from(anchor))
      matrix.multiply(new Matrix(0.87, 0, -0.5, 1, 0, 0))
      matrix.translate(new Point(-anchor.x, -anchor.y))
    } else {
      // transformation to the right backside of the 3-dimensional label box
      matrix.translate(Point.from(anchor))
      matrix.multiply(new Matrix(0.87, 0, 0.5, 1, 0, 0))
      matrix.translate(new Point(-anchor.x, -anchor.y))
    }
    return matrix
  }

  /**
   * @param {ILabel} label
   * @return {Size}
   */
  getPreferredSize(label) {
    const geometry = label.tag && label.tag.geometry
    const corners = IsometricTransformationSupport.calculateCorners(geometry)
    const bounds = label.layout.bounds
    IsometricTransformationSupport.moveTo(bounds.x, bounds.y, corners)
    return IsometricTransformationSupport.calculateViewBounds(geometry, corners).toSize()
  }
}

/**
 * Transforms the given element into view space.
 * @param {HtmlElement} element the element to transform.
 * @param {number} anchorX the x-coordinate of the anchor.
 * @param {number} anchorY the y-coordinate of the anchor.
 */
function transformToViewSpace(element, anchorX, anchorY) {
  const matrix = new Matrix()
  matrix.translate(new Point(anchorX, anchorY))
  matrix.multiply(
    new Matrix(
      IsometricTransformationSupport.M_TO_VIEW_11,
      IsometricTransformationSupport.M_TO_VIEW_12,
      IsometricTransformationSupport.M_TO_VIEW_21,
      IsometricTransformationSupport.M_TO_VIEW_22,
      0,
      0
    )
  )
  matrix.translate(new Point(-anchorX, -anchorY))
  matrix.applyTo(element)
}

/**
 * Returns a fill for the given color string.
 * @param {string} color the color string 'rgba(r,g,b,a)'
 * @return {Fill}
 */
function getFill(color) {
  return color ? new SolidColorFill(color) : null
}

/**
 * Returns a stroke for the given color string.
 * @param {string} color the color string 'rgba(r,g,b,a)'
 * @return {Stroke}
 */
function getStroke(color) {
  return color ? new Stroke(color) : null
}
