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
import { HtmlVisual, INode, IRenderContext, NodeStyleBase, type TaggedHtmlVisual } from 'yfiles'
import { type Component, createApp, defineComponent, h, type Plugin, reactive } from 'vue'

/**
 * Since props are immutable, we need a wrapper component that holds the props for the user's component as mutable state.
 */
const WrapperComponent = defineComponent({
  props: ['component', 'initialState'],
  setup(props) {
    const state = reactive(props.initialState)
    function setState(value: any) {
      for (const k of Object.keys(value)) {
        state[k] = value[k]
      }
    }
    return {
      state,
      setState
    }
  },
  render() {
    return h(this.component, this.state)
  }
})

type PropsProvider<P> = (context: IRenderContext, node: INode) => P

const defaultPropsProvider: PropsProvider<any> = (context, node) => ({ tag: node.tag })

type VueComponentNodeStyleVisual = TaggedHtmlVisual<HTMLDivElement, any>
/**
 * An {@link INodeStyle} implementation that renders a Vue.js component as the visualization for a node.
 */
export class VueComponentNodeStyle<P> extends NodeStyleBase<VueComponentNodeStyleVisual> {
  constructor(
    private readonly vueComponent: Component,
    private readonly propsProvider: PropsProvider<P> = defaultPropsProvider,
    private readonly plugins: Plugin[] = []
  ) {
    super()
  }

  protected createVisual(context: IRenderContext, node: INode): VueComponentNodeStyleVisual {
    const div = context.canvasComponent!.div.ownerDocument.createElement('div')
    const props = this.propsProvider(context, node)
    const app = createApp(WrapperComponent, { component: this.vueComponent, initialState: props })
    for (const plugin of this.plugins) {
      app.use(plugin)
    }
    const visual = HtmlVisual.from(div, app.mount(div))
    HtmlVisual.setLayout(div, node.layout)
    // register a callback that unmounts the Vue app when the visual is discarded
    context.setDisposeCallback(visual, () => {
      app.unmount()
      return null
    })
    return visual
  }

  protected updateVisual(
    context: IRenderContext,
    oldVisual: VueComponentNodeStyleVisual,
    node: INode
  ): VueComponentNodeStyleVisual {
    oldVisual.tag.setState(this.propsProvider(context, node))
    HtmlVisual.setLayout(oldVisual.element, node.layout)
    return oldVisual
  }
}
