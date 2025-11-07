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
import {
  BaseClass,
  type ILookup,
  IMarkupExtensionConverter,
  type INode,
  type IRenderContext,
  type IWriteContext,
  MarkupExtension,
  NodeStyleBase,
  type Size,
  SvgVisual,
  type TaggedSvgVisual
} from '@yfiles/yfiles'
import { getNodeData } from '../data-types'

/**
 * Augment the SvgVisual type with the data used to cache the rendering information.
 */
type Cache = { size: Size; color: string }
type MindMapNodeStyleVisual = TaggedSvgVisual<SVGGElement, Cache>

/**
 * The node style used for the non-root nodes of the mind map.
 * Each node will be represented by a colored line based on its level in the mind map.
 */
export class MindMapNodeStyle extends BaseClass(
  NodeStyleBase<MindMapNodeStyleVisual>,
  IMarkupExtensionConverter
) {
  className: string

  /**
   * Creates a new instance of this style using the given class name.
   * @param className The CSS class attributed to the node.
   */
  constructor(className: string) {
    super()
    this.className = className
  }

  /**
   * Creates the visual for this node style.
   * The node will be represented by a colored line.
   */
  createVisual(renderContext: IRenderContext, node: INode): MindMapNodeStyleVisual {
    // create a container element
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this.render(renderContext, node, g)
    // move the container to the node position
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    // store the data used to create the elements with the container
    return SvgVisual.from(g, { size: node.layout.toSize(), color: getNodeData(node).color })
  }

  /**
   * Updates the node visual.
   * If the size or color of the node has changed, a new visual will be created.
   */
  updateVisual(
    renderContext: IRenderContext,
    oldVisual: MindMapNodeStyleVisual,
    node: INode
  ): MindMapNodeStyleVisual {
    const container = oldVisual.svgElement
    const nodeData = getNodeData(node)
    const nodeSize = node.layout.toSize()

    // check if the data used to create the visualization has changed
    if (!nodeSize.equals(oldVisual.tag.size) || nodeData.color !== oldVisual.tag.color) {
      // remove the old elements and re-render the node
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
      this.render(renderContext, node, container)
      // updates the cached information for the rendering
      oldVisual.tag = { size: nodeSize, color: nodeData.color }
    }
    // move the container to the node position
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * Creates the line svg element and adds it to the container.
   */
  render(_renderContext: IRenderContext, node: INode, container: SVGGElement): void {
    const nodeData = getNodeData(node)
    const color = nodeData.color
    const size = node.layout.toSize()

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.x1.baseVal.value = 0
    line.x2.baseVal.value = size.width
    line.y1.baseVal.value = line.y2.baseVal.value = size.height
    // set the CSS class for the line
    line.setAttribute('class', `node-underline ${this.className}`)
    line.setAttribute('stroke', color)

    container.appendChild(line)
  }

  /**
   * Returns that this style can be converted.
   */
  canConvert(_context: IWriteContext, _value: MindMapNodeStyle): boolean {
    return true
  }

  /**
   * Converts this style using {@link MindMapNodeStyleExtension}.
   */
  convert(_context: IWriteContext, value: MindMapNodeStyle): MarkupExtension {
    const mindMapNodeStyleExtension = new MindMapNodeStyleExtension()
    mindMapNodeStyleExtension.className = value.className
    return mindMapNodeStyleExtension
  }
}

/**
 * A markup extension that creates a {@link MindMapNodeStyle} instance configured with a specified class name.
 */
export class MindMapNodeStyleExtension extends MarkupExtension {
  private _className!: string

  /**
   * Gets or sets the class name to be used by the MindMapNodeStyle.
   */
  get className(): string {
    return this._className
  }

  set className(value: string) {
    this._className = value
  }

  /**
   * Provides a {@link MindMapNodeStyle} instance using the configured class name.
   * @returns A new `MindMapNodeStyle` initialized with the specified class name.
   */
  provideValue(_serviceProvider: ILookup): MindMapNodeStyle {
    return new MindMapNodeStyle(this.className)
  }
}

export default { MindMapNodeStyle, MindMapNodeStyleExtension }
