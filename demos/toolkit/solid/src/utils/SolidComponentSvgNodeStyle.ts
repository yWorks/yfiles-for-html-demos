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
import type { GraphComponent, INode, IRenderContext, ITagOwner, TaggedSvgVisual } from 'yfiles'
import { NodeStyleBase, SvgVisual } from 'yfiles'
import { render } from 'solid-js/web'
import { batch } from 'solid-js'
import type { Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { createStore } from 'solid-js/store'

export type SolidComponentNodeStyleProps<T = unknown> = {
  layout: { width: number; height: number }
  selected: boolean
  tag: T
}

type SolidComponentSvgNodeStyleVisual<T> = TaggedSvgVisual<
  SVGGElement,
  { setStore: SetStoreFunction<SolidComponentNodeStyleProps<T>> }
>

function defaultGetTag<T>(item: ITagOwner): T {
  return item.tag
}

export class SolidComponentSvgNodeStyle<T = unknown> extends NodeStyleBase<
  SolidComponentSvgNodeStyleVisual<T>
> {
  constructor(
    private readonly renderFunction: Component<SolidComponentNodeStyleProps<T>>,
    private readonly getTag: (node: INode, context: IRenderContext) => T = defaultGetTag
  ) {
    super()
  }

  protected createVisual(
    context: IRenderContext,
    node: INode
  ): SolidComponentSvgNodeStyleVisual<T> {
    const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const nodeLayout = node.layout
    const [store, setStore] = createStore({
      layout: { width: nodeLayout.width, height: nodeLayout.height },
      tag: this.getTag(node, context),
      selected: (context.canvasComponent as GraphComponent).selection.selectedNodes.isSelected(node)
    } as SolidComponentNodeStyleProps<T>)

    render(() => this.renderFunction(store), gElement)
    SvgVisual.setTranslate(gElement, nodeLayout.x, nodeLayout.y)

    return SvgVisual.from(gElement, { setStore })
  }

  protected updateVisual(
    context: IRenderContext,
    oldVisual: SolidComponentSvgNodeStyleVisual<T>,
    node: INode
  ): SolidComponentSvgNodeStyleVisual<T> {
    const setStore = oldVisual.tag.setStore

    const nodeLayout = node.layout
    batch(() => {
      setStore('layout', 'width', nodeLayout.width)
      setStore('layout', 'height', nodeLayout.height)
      setStore('tag', this.getTag(node, context))
      setStore(
        'selected',
        (context.canvasComponent as GraphComponent).selection.selectedNodes.isSelected(node)
      )
    })

    SvgVisual.setTranslate(oldVisual.svgElement, nodeLayout.x, nodeLayout.y)

    return oldVisual
  }
}
