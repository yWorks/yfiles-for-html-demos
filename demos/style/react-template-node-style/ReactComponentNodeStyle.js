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
import { GraphComponent, NodeStyleBase, SvgVisual, Visual } from 'yfiles'

const { createElement } = React
const { createRoot } = ReactDOM

/**
 * The interface of the props passed to the SVG react component for rendering the node contents.
 * @typedef {Object} ReactComponentNodeStyleProps
 * @property {number} width
 * @property {number} height
 * @property {boolean} selected
 * @property {('low'|'high')} detail
 * @property {TTag} tag
 */

/**
 * @param {!IRenderContext} context
 * @param {!Visual} removedVisual
 * @param {boolean} dispose
 * @returns {?Visual}
 */
function dispose(context, removedVisual, dispose) {
  const root = removedVisual.root
  root.unmount()
  return null
}

/**
 * @typedef {*} RenderType
 */

/**
 * A simple INodeStyle implementation that uses React Components/render functions
 * for rendering the node visualizations
 * Use it like this:
 * ```
 *  declare type TagType = { name: string }
 *
 *  const MyNodeTemplate = ({ width, height, tag }: ReactComponentNodeStyleProps<TagType>) => (
 *    <g>
 *      <rect width={width} height={height} fill="blue" />
 *      <text y="10">{tag.name}</text>
 *   </g>
 *  )
 *
 *  const style = new ReactComponentNodeStyle(NodeTemplate)
 *
 *  const tag: TagType = { name: 'yFiles' }
 *  graph.createNode({ style, tag })
 * ```
 */
export class ReactComponentNodeStyle extends NodeStyleBase {
  /**
   * @param {!RenderType.<TTag>} type
   */
  constructor(type) {
    super()
    this.type = type
  }

  /**
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {!ReactComponentNodeStyleProps.<TTag>}
   */
  createProps(context, node) {
    return {
      width: node.layout.width,
      height: node.layout.height,
      selected: context.canvasComponent.selection.selectedNodes.isSelected(node),
      detail: context.zoom < 0.5 ? 'low' : 'high',
      tag: node.tag
    }
  }

  /**
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {?Visual}
   */
  createVisual(context, node) {
    const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const props = this.createProps(context, node)
    const element = createElement(this.type, props)
    const root = createRoot(gElement)
    root.render(element)
    SvgVisual.setTranslate(gElement, node.layout.x, node.layout.y)
    const svgVisual = new SvgVisual(gElement)
    svgVisual.cache = props
    svgVisual.root = root

    context.setDisposeCallback(svgVisual, dispose)
    return svgVisual
  }

  /**
   * @param {!IRenderContext} context
   * @param {!Visual} oldVisual
   * @param {!INode} node
   * @returns {?Visual}
   */
  updateVisual(context, oldVisual, node) {
    const oldSvgVisual = oldVisual
    const gElement = oldSvgVisual.svgElement

    const props = this.createProps(context, node)

    const lastProps = oldSvgVisual.cache
    const root = oldSvgVisual.root
    if (
      lastProps.width !== props.width ||
      lastProps.height !== props.height ||
      lastProps.selected !== props.selected ||
      lastProps.detail !== props.detail ||
      lastProps.tag !== props.tag
    ) {
      const element = createElement(this.type, props)
      root.render(element)
      oldSvgVisual.cache = props
    }
    SvgVisual.setTranslate(gElement, node.layout.x, node.layout.y)
    return oldVisual
  }
}
