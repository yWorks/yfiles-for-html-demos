/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import { INode, IRenderContext, NodeStyleBase, SvgVisual, Visual } from 'yfiles'
import ReactDOM from 'react-dom'
import React, { ComponentClass, FunctionComponent } from 'react'

function dispose(context: IRenderContext, removedVisual: Visual, dispose: boolean): Visual | null {
  const gElement = (removedVisual as SvgVisual).svgElement as SVGGElement
  ReactDOM.unmountComponentAtNode(gElement)
  return null
}

interface ReactComponentNodeStyleProps<TTag = any> {
  width: number
  height: number
  tag: TTag
}

type RenderType<TTag> =
  | ComponentClass<ReactComponentNodeStyleProps<TTag>>
  | FunctionComponent<ReactComponentNodeStyleProps<TTag>>

/**
 * A simple INodeStyle implementation that uses React Components for rendering the node visualizations
 */
export class ReactComponentNodeStyle<TTag> extends NodeStyleBase {
  private readonly type: RenderType<TTag>

  constructor(type: RenderType<TTag>) {
    super()
    this.type = type
  }

  createProps(node: INode): ReactComponentNodeStyleProps<TTag> {
    return {
      width: node.layout.width,
      height: node.layout.height,
      tag: node.tag as TTag
    }
  }

  createVisual(context: IRenderContext, node: INode): Visual | null {
    const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const props = this.createProps(node)
    const element = React.createElement(this.type, props)
    ReactDOM.render(element, gElement)
    SvgVisual.setTranslate(gElement, node.layout.x, node.layout.y)
    const svgVisual = new SvgVisual(gElement)
    ;(svgVisual as any)['data-state'] = props

    context.setDisposeCallback(svgVisual, dispose)
    return svgVisual
  }

  updateVisual(context: IRenderContext, oldVisual: Visual, node: INode): Visual | null {
    const gElement = (oldVisual as SvgVisual).svgElement as SVGGElement

    const props = this.createProps(node)

    const lastProps = (oldVisual as any)['data-state'] as ReactComponentNodeStyleProps<TTag>
    if (
      lastProps.width !== props.width ||
      lastProps.height !== props.height ||
      lastProps.tag !== props.tag
    ) {
      const element = React.createElement(this.type, props)
      ReactDOM.render(element, gElement)
      ;(oldVisual as any)['data-state'] = props
    }
    SvgVisual.setTranslate(gElement, node.layout.x, node.layout.y)
    return oldVisual
  }
}
