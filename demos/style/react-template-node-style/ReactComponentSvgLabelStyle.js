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
  GraphComponent,
  LabelStyleBase,
  Size,
  SvgVisual,
  Visual,
  VisualCachingPolicy
} from '@yfiles/yfiles'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
/**
 * The default implementation just uses the props from the tag of the item to be rendered.
 * @param context
 * @param node
 */
const defaultTagProvider = (context, node) => node.tag
/**
 * Helper method that will be used by the below style to release React resources when the
 * label gets removed from the yFiles scene graph.
 */
function unmountReact(context, removedVisual, dispose) {
  const visual = removedVisual
  // In React.StrictMode, React warns about unmounting components synchronously during rendering which
  // may happen when React calls the cleanup callback of the component that contains the GraphComponent.
  // To prevent this warning, you can enable visual-caching by setting "graphComponent.visualCaching = 'always'"
  // and when the GraphComponent is cleaned up, asynchronously unmount the visual.
  const visualCaching = context.canvasComponent?.visualCaching === VisualCachingPolicy.ALWAYS
  if (visualCaching && dispose) {
    setTimeout(() => {
      visual.tag.root.unmount()
    }, 0)
  } else {
    visual.tag.root.unmount()
  }
  return null
}
/**
 * A simple ILabelStyle implementation that uses React Components/render functions
 * for rendering label visualizations using SVG
 * Use it like this:
 * ```
 *  declare type TagType = { name: string }
 *
 *  const MyLabelTemplate = ({ width, height, tag }: ReactComponentLabelStyleProps<TagType>) => (
 *    <g>
 *      <rect width={width} height={height} fill="blue" />
 *      <text y="10">{tag.name}</text>
 *   </g>
 *  )
 *
 *  const style = new ReactComponentSvgLabelStyle(LabelTemplate, [200,20])
 *
 *  const tag: TagType = { name: 'yFiles' }
 *  graph.addLabel({ owner: graph.createNode(), style, tag })
 * ```
 */
export class ReactComponentSvgLabelStyle extends LabelStyleBase {
  type
  tagProvider
  size
  /**
   * Creates a new instance
   * @param type the React component rendering the SVG content
   * @param tagProvider the optional provider function that provides the "tag" in the props.
   * By default, this will use the node's tag.
   */
  constructor(type, size, tagProvider = defaultTagProvider) {
    super()
    this.type = type
    this.tagProvider = tagProvider
    this.size = Size.from(size)
  }
  createProps(context, label) {
    const layout = label.layout
    return {
      width: layout.width,
      height: layout.height,
      selected:
        context.canvasComponent instanceof GraphComponent &&
        context.canvasComponent.selection.labels.includes(label),
      text: label.text,
      detail: context.zoom < 0.5 ? 'low' : 'high',
      tag: this.tagProvider(context, label)
    }
  }
  createVisual(context, label) {
    const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const props = this.createProps(context, label)
    const element = createElement(this.type, props)
    const root = createRoot(gElement)
    root.render(element)
    const cache = { props, root }
    const svgVisual = SvgVisual.from(gElement, cache)
    context.setDisposeCallback(svgVisual, unmountReact)
    LabelStyleBase.createLayoutTransform(context, label.layout, true).applyTo(gElement)
    return svgVisual
  }
  updateVisual(context, oldVisual, label) {
    const newProps = this.createProps(context, label)
    const cache = oldVisual.tag
    const oldProps = cache.props
    if (
      oldProps.width !== newProps.width ||
      oldProps.height !== newProps.height ||
      oldProps.selected !== newProps.selected ||
      oldProps.detail !== newProps.detail ||
      oldProps.tag !== newProps.tag
    ) {
      const element = createElement(this.type, newProps)
      oldVisual.tag.root.render(element)
      cache.props = newProps
    }
    LabelStyleBase.createLayoutTransform(context, label.layout, true).applyTo(oldVisual.svgElement)
    return oldVisual
  }
  getPreferredSize(label) {
    return this.size
  }
}
