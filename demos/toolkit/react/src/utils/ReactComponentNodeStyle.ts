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
import { GraphComponent, NodeStyleBase, SvgVisual } from '@yfiles/yfiles'
import { type ComponentClass, createElement, type FunctionComponent } from 'react'
import { createRoot, type Root } from 'react-dom/client'

/**
 * The interface of the props passed to the SVG react component for rendering the node contents.
 */
export interface ReactComponentNodeStyleProps<TTag = unknown> {
  width: number
  height: number
  selected: boolean
  tag: TTag
}

type RenderType<TTag> =
  | ComponentClass<ReactComponentNodeStyleProps<TTag>>
  | FunctionComponent<ReactComponentNodeStyleProps<TTag>>

declare type Cache<TTag> = { props: ReactComponentNodeStyleProps<TTag>; root: Root }

/**
 * Utility type for type-safe implementation of the Visual that stores the props
 * it has been created for along with the React Root.
 */
type ReactStyleSvgVisual<TTag> = TaggedSvgVisual<SVGGElement, Cache<TTag>>

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
export class ReactComponentNodeStyle<TTag> extends NodeStyleBase<ReactStyleSvgVisual<TTag>> {
  constructor(private readonly type: RenderType<TTag>) {
    super()
  }

  createProps(context: IRenderContext, node: INode): ReactComponentNodeStyleProps<TTag> {
    return {
      width: node.layout.width,
      height: node.layout.height,
      selected:
        context.canvasComponent instanceof GraphComponent &&
        context.canvasComponent.selection.nodes.includes(node),
      tag: node.tag as TTag
    }
  }

  createVisual(context: IRenderContext, node: INode): ReactStyleSvgVisual<TTag> {
    const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const props = this.createProps(context, node)
    const element = createElement(this.type, props)
    const root = createRoot(gElement)
    root.render(element)
    const cache = { props, root } satisfies Cache<TTag>
    const svgVisual = SvgVisual.from(gElement, cache)

    // Ensure that React resources are released when the node gets removed from the yFiles scene
    // graph.
    context.setDisposeCallback(
      svgVisual,
      (_: IRenderContext, removedVisual: ReactStyleSvgVisual<unknown>) => {
        removedVisual.tag.root.unmount()
        return null
      }
    )

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
    const cachedProps = cache.props
    if (
      cachedProps.width !== newProps.width ||
      cachedProps.height !== newProps.height ||
      cachedProps.selected !== newProps.selected ||
      cachedProps.tag !== newProps.tag
    ) {
      const element = createElement<ReactComponentNodeStyleProps<TTag>>(this.type, newProps)
      oldVisual.tag.root.render(element)
      cache.props = newProps
    }
    SvgVisual.setTranslate(oldVisual.svgElement, node.layout.x, node.layout.y)
    return oldVisual
  }
}
