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
import { HtmlVisual, Matrix, NodeStyleBase } from '@yfiles/yfiles'
import { html, nothing, render } from 'lit-html'

/**
 * A node style which uses Lit render functions for displaying the contents of a node with HTML.
 */
export class LitHtmlNodeStyle extends NodeStyleBase {
  renderFunction
  normalizedOutline

  /**
   * Creates the style using the provided render function.
   */
  constructor(renderFunction) {
    super()
    this.renderFunction = renderFunction
  }

  /**
   * Creates the properties that we pass by default to the render function.
   * Custom variations could be passing other properties to the context, of course.
   * @param context The renderContext to be used
   * @param node The node to which this style instance is assigned
   */
  createProps(context, node) {
    return {
      selected: context.canvasComponent.selection?.nodes.includes(node) ?? false,
      zoom: context.zoom,
      tag: node.tag
    }
  }

  /**
   * Creates a visual that uses a Lit rendered DOM HTML snippet to display a node.
   * @param context The renderContext to be used
   * @param node The node to which this style instance is assigned
   */
  createVisual(context, node) {
    const props = this.createProps(context, node)
    const result = this.renderFunction(props)

    const element = document.createElement('div')
    const visual = HtmlVisual.from(element, props)
    HtmlVisual.setLayout(element, node.layout)
    render(result, element)

    // return an HTMLVisual that uses the element that has been rendered into
    return visual
  }

  /**
   * Efficient implementation of the update method that only re-renders the snippet if the
   * props have changed.
   * The location is always updated accordingly.
   * @param context The renderContext to be used
   * @param oldVisual The visual that has been created in the call to createVisual
   * @param node The node to which this style instance is assigned
   */
  updateVisual(context, oldVisual, node) {
    const props = this.createProps(context, node)

    // check if some property has changed
    const lastProps = oldVisual.tag
    if (
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
    HtmlVisual.setLayout(oldVisual.element, node.layout)
    return oldVisual
  }

  getOutline(node) {
    if (!this.normalizedOutline) {
      return super.getOutline(node)
    }

    const { x, y, width, height } = node.layout
    return this.normalizedOutline.createTransformedPath(new Matrix(width, 0, 0, height, x, y))
  }
}

/**
 * Parses a string (using eval) as a function to use for rendering a LitHtmlNodeStyle
 * @param renderFunctionSource The source of the function
 */
export function createLitHtmlNodeStyleFromSource(renderFunctionSource) {
  const renderFunction = new Function(
    'const html = arguments[0]; const nothing = arguments[1]; const renderFunction = ' +
      renderFunctionSource +
      '\n return renderFunction'
  )(html, nothing)
  return new LitHtmlNodeStyle(renderFunction)
}
