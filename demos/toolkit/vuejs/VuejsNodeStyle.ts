/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { GraphComponent, INode, IRenderContext, NodeStyleBase, SvgVisual, Visual } from 'yfiles'

// import vue typings
// @ts-ignore
import { VueConstructor } from 'vue'
// import vue typings
// @ts-ignore
import { CombinedVueInstance } from 'vue/types/vue'

type SVGElementWithVueComponent = SVGElement & {
  'data-vueComponent': CombinedVueInstance<any, any, any, any, any>
}

function isSVGElementWithVueComponent(
  svgElement: SVGElement
): svgElement is SVGElementWithVueComponent {
  return (svgElement as SVGElementWithVueComponent)['data-vueComponent'] !== undefined
}

/**
 * A node style which uses a Vuejs component to display a node.
 */
export default class VuejsNodeStyle extends NodeStyleBase {
  private readonly $vueComponentConstructor: VueConstructor

  constructor(vueComponentConstructor: VueConstructor) {
    super()
    this.$vueComponentConstructor = vueComponentConstructor
  }

  /**
   * Creates a visual that uses a Vuejs component to display a node.
   * @see Overrides {@link NodeStyleBase.createVisual}
   */
  createVisual(context: IRenderContext, node: INode): SvgVisual {
    // create the Vue component
    const component = new this.$vueComponentConstructor()
    // Populate it with the node data.
    // The properties are reactive, which means the view will be automatically updated by Vue.js when the data
    // changes.
    component.$props.tag = node.tag
    component.$data.zoom = context.zoom
    // mount the component without passing in a DOM element
    component.$mount()

    const svgElement = component.$el as SVGElementWithVueComponent

    // set the location
    SvgVisual.setTranslate(svgElement, node.layout.x, node.layout.y)

    // save the component instance with the DOM element so we can retrieve it later
    svgElement['data-vueComponent'] = component

    // return an SvgVisual that uses the DOM element of the component
    const svgVisual = new SvgVisual(svgElement)
    context.setDisposeCallback(svgVisual, (context, visual, dispose) => {
      if (visual instanceof SvgVisual && isSVGElementWithVueComponent(visual.svgElement)) {
        // clean up vue component instance after the visual is disposed
        visual.svgElement['data-vueComponent'].$destroy()
      }
      return null
    })
    return svgVisual
  }

  /**
   * Updates the visual by returning the old visual, as Vuejs handles updating the component.
   * @see Overrides {@link NodeStyleBase.updateVisual}
   */
  updateVisual(context: IRenderContext, oldVisual: Visual, node: INode): SvgVisual {
    if (!(oldVisual instanceof SvgVisual && isSVGElementWithVueComponent(oldVisual.svgElement))) {
      return this.createVisual(context, node)
    }
    const svgElement = oldVisual.svgElement

    // Update the location
    SvgVisual.setTranslate(svgElement, node.layout.x, node.layout.y)
    // the zoom property is a primitive value, so we must update it manually on the component
    svgElement['data-vueComponent'].$data.zoom = context.zoom
    // set the focused property of each component
    const graphComponent = context.canvasComponent as GraphComponent
    svgElement['data-vueComponent'].$data.focused =
      graphComponent.focusIndicatorManager.focusedItem === node
    return oldVisual
  }
}
