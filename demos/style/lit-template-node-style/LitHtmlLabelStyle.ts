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
import {
  type GeneralPath,
  type GraphComponent,
  HtmlVisual,
  type ILabel,
  type ILabelStyle,
  type IRenderContext,
  LabelStyleBase,
  Size,
  type SizeConvertible,
  type TaggedHtmlVisual
} from '@yfiles/yfiles'
import { html, nothing, render } from 'lit-html'

/**
 * The interface of the props passed to the lit render function for rendering the label's HTML contents.
 */
export interface LitHtmlLabelStyleProps<TTag = any> {
  layout: { width: number; height: number }
  text: string
  selected: boolean
  zoom: number
  tag: TTag
}

/**
 * Caching the properties of the LitHtmlLabelStyle to decide whether a style update is necessary.
 */
type LitHtmlLabelStyleVisual<TTag> = TaggedHtmlVisual<HTMLElement, LitHtmlLabelStyleProps<TTag>>

/**
 * The render function used for the Lit label style.
 */
export type LitHtmlLabelStyleRenderFunction<T> = (
  context: LitHtmlLabelStyleProps<T>
) => ReturnType<typeof html>

/**
 * A label style which uses Lit render functions for displaying the contents of a node with HTML.
 */
export class LitHtmlLabelStyle<T = any> extends LabelStyleBase<LitHtmlLabelStyleVisual<T>> {
  readonly renderFunction: LitHtmlLabelStyleRenderFunction<T>
  public size: Size
  normalizedOutline?: GeneralPath

  /**
   * Creates the style using the provided render function.
   */
  constructor(renderFunction: LitHtmlLabelStyleRenderFunction<T>, size: Size | SizeConvertible) {
    super()
    this.renderFunction = renderFunction
    this.size = Size.from(size)
  }

  /**
   * Creates the properties that we pass by default to the render function.
   * Custom variations could be passing other properties to the context, of course.
   * @param context The renderContext to be used
   * @param label The label to which this style instance is assigned
   */
  createProps(context: IRenderContext, label: ILabel): LitHtmlLabelStyleProps<T> {
    return {
      layout: { width: label.layout.width, height: label.layout.height },
      selected: (context.canvasComponent as GraphComponent).selection?.labels.includes(label),
      text: label.text,
      zoom: context.zoom,
      tag: label.tag as T
    }
  }

  /**
   * Creates a visual that uses a Lit rendered DOM HTML snippet to display a label.
   * @param context The renderContext to be used
   * @param label The label to which this style instance is assigned
   */
  createVisual(context: IRenderContext, label: ILabel): LitHtmlLabelStyleVisual<T> {
    const props = this.createProps(context, label)
    const result = this.renderFunction(props)

    const element = document.createElement('div')
    const visual = HtmlVisual.from(element, props)

    HtmlVisual.setLayout(element, label.layout.bounds)

    render(result, element)

    // return an HtmlVisual that uses the g element that has been rendered into
    return visual
  }

  /**
   * Efficient implementation of the update method that only re-renders the snippet if the
   * props have changed.
   * The location is always updated accordingly.
   * @param context The renderContext to be used
   * @param oldVisual The visual that has been created in the call to createVisual
   * @param label The label to which this style instance is assigned
   */
  updateVisual(
    context: IRenderContext,
    oldVisual: LitHtmlLabelStyleVisual<T>,
    label: ILabel
  ): LitHtmlLabelStyleVisual<T> {
    const props = this.createProps(context, label)

    // check if some property has changed
    const lastProps = oldVisual.tag
    if (
      lastProps.layout.width !== props.layout.width ||
      lastProps.layout.height !== props.layout.height ||
      lastProps.selected !== props.selected ||
      lastProps.zoom !== props.zoom ||
      lastProps.tag !== props.tag
    ) {
      // props have changed, re-render
      const result = this.renderFunction(props)
      render(result, oldVisual.element)
      oldVisual.tag = props
    }

    // update location in any case
    HtmlVisual.setLayout(oldVisual.element, label.layout.bounds)
    return oldVisual
  }

  /**
   * Returns the preferred size of the label.
   * @param label The label to which this style instance is assigned.
   */
  protected getPreferredSize(label: ILabel): Size {
    return this.size
  }
}

/**
 * Parses a string (using eval) as a function to use for rendering a LitHtmlLabelStyle
 * @param renderFunctionSource The source of the function
 * @param size The size of the label to be rendered
 */
export function createLitHtmlLabelStyleFromSource(
  renderFunctionSource: string,
  size: Size | SizeConvertible
): ILabelStyle {
  const renderFunction = new Function(
    'const html = arguments[0]; const nothing = arguments[1]; const renderFunction = ' +
      renderFunctionSource +
      '\n return renderFunction'
  )(html, nothing)
  return new LitHtmlLabelStyle(renderFunction, size)
}
