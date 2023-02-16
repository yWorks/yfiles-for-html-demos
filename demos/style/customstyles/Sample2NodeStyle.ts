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
import {
  GraphMLAttribute,
  ILookup,
  INode,
  IRenderContext,
  MarkupExtension,
  NodeStyleBase,
  SvgVisual,
  TypeAttribute,
  YString
} from 'yfiles'
import type { ColorSetName } from '../../resources/demo-styles'
import { isColorSetName } from '../../resources/demo-styles'

/**
 * A custom demo node style whose colors match the given well-known CSS rule.
 */
export class Sample2NodeStyle extends NodeStyleBase {
  constructor(public cssClass?: string | ColorSetName) {
    super()
  }

  /**
   * Creates the visual for a node.
   */
  createVisual(renderContext: IRenderContext, node: INode): SvgVisual {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    const { x, y, width, height } = node.layout
    const nodeRounding = '3.5'

    rect.width.baseVal.value = width
    rect.height.baseVal.value = height
    rect.setAttribute('rx', nodeRounding)
    rect.setAttribute('ry', nodeRounding)
    rect.setAttribute('fill', '#FF6C00')
    rect.setAttribute('stroke', '#662b00')
    rect.setAttribute('stroke-width', '1.5px')

    if (this.cssClass) {
      const attribute = isColorSetName(this.cssClass) ? this.cssClass + '-node' : this.cssClass
      rect.setAttribute('class', attribute)
    }

    ;(rect as any)['data-renderDataCache'] = {
      x,
      y,
      width,
      height,
      cssClass: this.cssClass
    }

    rect.setAttribute('transform', `translate(${x} ${y})`)

    return new SvgVisual(rect)
  }

  /**
   * Re-renders the node by updating the old visual for improved performance.
   */
  updateVisual(renderContext: IRenderContext, oldVisual: SvgVisual, node: INode): SvgVisual {
    const rect = oldVisual.svgElement as SVGRectElement
    const cache = (rect as any)['data-renderDataCache']
    if (!cache) {
      return this.createVisual(renderContext, node)
    }

    const layout = node.layout
    const { x, y, width, height } = layout

    if (cache.width !== width) {
      rect.width.baseVal.value = width
      cache.width = width
    }
    if (cache.height !== height) {
      rect.height.baseVal.value = height
      cache.height = height
    }
    if (cache.x !== x || cache.y !== y) {
      rect.transform.baseVal.getItem(0).setTranslate(x, y)
      cache.x = x
      cache.y = y
    }

    if (cache.cssClass !== this.cssClass) {
      if (this.cssClass) {
        const attribute = isColorSetName(this.cssClass) ? this.cssClass + '-node' : this.cssClass
        rect.setAttribute('class', attribute)
      } else {
        rect.removeAttribute('class')
      }
      cache.cssClass = this.cssClass
    }

    return oldVisual
  }
}

export class Sample2NodeStyleExtension extends MarkupExtension {
  private _cssClass = ''

  constructor() {
    super()
  }

  get cssClass(): string {
    return this._cssClass
  }

  set cssClass(value: string) {
    this._cssClass = value
  }

  static get $meta(): { cssClass: (GraphMLAttribute | TypeAttribute)[] } {
    return {
      cssClass: [GraphMLAttribute().init({ defaultValue: '' }), TypeAttribute(YString.$class)]
    }
  }

  provideValue(serviceProvider: ILookup): Sample2NodeStyle {
    const style = new Sample2NodeStyle()
    style.cssClass = this.cssClass
    return style
  }
}
