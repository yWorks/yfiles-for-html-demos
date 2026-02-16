/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import type { INode, IRenderContext, TaggedSvgVisual } from '@yfiles/yfiles'
import {
  GraphComponent,
  NodeStyleBase,
  SvgVisual,
  type Visual,
  VisualCachingPolicy
} from '@yfiles/yfiles'

import { createRoot, type Root } from 'react-dom/client'
import { type ComponentClass, createElement, type FunctionComponent } from 'react'

type RenderType<TTag> = FunctionComponent<TTag> | ComponentClass<TTag>

/**
 * Helper for the ReactComponentHtmlNodeStyle to factor out the props retrieval per node
 */
type TagProvider<P> = (context: IRenderContext, node: INode) => P

/**
 * The default implementation just uses the props from the tag of the item to be rendered.
 */
const defaultTagProvider: TagProvider<any> = (_, node) => node.tag

/**
 * The interface of the props passed to the SVG react component for rendering the node contents.
 */
export interface ReactComponentSvgNodeStyleProps<TTag = any> {
  width: number
  height: number
  selected: boolean
  detail: 'low' | 'high'
  tag: TTag
}

type Cache<TTag> = { props: ReactComponentSvgNodeStyleProps<TTag>; root: Root }

/**
 * Utility type for type-safe implementation of the Visual that stores the props
 * it has been created for along with the React Root.
 */
type ReactStyleSvgVisual<TTag> = TaggedSvgVisual<SVGGElement, Cache<TTag>>

/**
 * Helper method that will be used by the below style to release React resources when the
 * node gets removed from the yFiles scene graph.
 */
function unmountReact(
  context: IRenderContext,
  removedVisual: Visual,
  dispose: boolean
): Visual | null {
  const visual = removedVisual as ReactStyleSvgVisual<any>
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
 * A simple INodeStyle implementation that uses React Components/render functions
 * for rendering the node visualizations with SVG
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
 *  const style = new ReactComponentSvgNodeStyle(NodeTemplate)
 *
 *  const tag: TagType = { name: 'yFiles' }
 *  graph.createNode({ style, tag })
 * ```
 */
export class ReactComponentSvgNodeStyle<TTag> extends NodeStyleBase<ReactStyleSvgVisual<TTag>> {
  private readonly tagProvider: TagProvider<TTag>
  private readonly type: RenderType<ReactComponentSvgNodeStyleProps<TTag>>

  /**
   * Creates a new instance
   * @param type the React component rendering the SVG content
   * @param tagProvider the optional provider function that provides the "tag" in the props.
   * By default, this will use the node's tag.
   */
  constructor(
    type: RenderType<ReactComponentSvgNodeStyleProps<TTag>>,
    tagProvider: TagProvider<TTag> = defaultTagProvider
  ) {
    super()
    this.type = type
    this.tagProvider = tagProvider
  }

  createProps(context: IRenderContext, node: INode): ReactComponentSvgNodeStyleProps<TTag> {
    return {
      width: node.layout.width,
      height: node.layout.height,
      selected:
        context.canvasComponent instanceof GraphComponent &&
        context.canvasComponent.selection.nodes.includes(node),
      detail: context.zoom < 0.5 ? 'low' : 'high',
      tag: this.tagProvider(context, node)
    }
  }

  createVisual(context: IRenderContext, node: INode): ReactStyleSvgVisual<TTag> {
    const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const props = this.createProps(context, node)
    const element = createElement<ReactComponentSvgNodeStyleProps<TTag>>(this.type, props)
    const root = createRoot(gElement)
    root.render(element)
    const cache = { props, root } satisfies Cache<TTag>
    const svgVisual = SvgVisual.from(gElement, cache)
    context.setDisposeCallback(svgVisual, unmountReact)
    SvgVisual.setTranslate(gElement, node.layout.x, node.layout.y)
    return svgVisual
  }

  updateVisual(
    context: IRenderContext,
    oldVisual: ReactStyleSvgVisual<TTag>,
    node: INode
  ): ReactStyleSvgVisual<TTag> {
    const newProps = this.createProps(context, node)

    const cache = oldVisual.tag
    const oldProps = cache.props
    if (
      oldProps.width !== newProps.width ||
      oldProps.height !== newProps.height ||
      oldProps.selected !== newProps.selected ||
      oldProps.detail !== newProps.detail ||
      oldProps.tag !== newProps.tag
    ) {
      const element = createElement<ReactComponentSvgNodeStyleProps<TTag>>(this.type, newProps)
      oldVisual.tag.root.render(element)
      cache.props = newProps
    }
    SvgVisual.setTranslate(oldVisual.svgElement, node.layout.x, node.layout.y)
    return oldVisual
  }
}
