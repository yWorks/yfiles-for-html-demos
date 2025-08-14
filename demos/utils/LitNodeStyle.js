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
  GeneralPath,
  GraphComponent,
  INode,
  INodeStyle,
  IRenderContext,
  Matrix,
  NodeStyleBase,
  SvgVisual
} from '@yfiles/yfiles'

// @ts-ignore Import via URL
// eslint-disable-next-line import/no-unresolved
import { nothing, render, svg } from 'lit-html'

/**
 * A node style which uses Lit render functions for displaying the contents of a node with SVG.
 */
export class LitNodeStyle extends NodeStyleBase {
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
      layout: { width: node.layout.width, height: node.layout.height },
      selected: context.canvasComponent.selection?.nodes.includes(node) ?? false,
      zoom: context.zoom,
      tag: node.tag
    }
  }

  /**
   * Creates a visual that uses a Lit rendered DOM SVG snippet to display a node.
   * @param context The renderContext to be used
   * @param node The node to which this style instance is assigned
   */
  createVisual(context, node) {
    const props = this.createProps(context, node)
    const result = this.renderFunction(props)

    const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    SvgVisual.setTranslate(gElement, node.layout.x, node.layout.y)

    const svgVisual = SvgVisual.from(gElement, props)

    render(result, gElement)

    // return an SvgVisual that uses the g element that has been rendered into
    return svgVisual
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
    const gElement = oldVisual.svgElement

    const props = this.createProps(context, node)

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
      render(result, gElement)
      oldVisual.tag = props
    }

    // update location in any case
    SvgVisual.setTranslate(gElement, node.layout.x, node.layout.y)
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
 * Parses a string (using eval) as a function to use for rendering a LitNodeStyle
 * @param renderFunctionSource The source of the function
 */
export function createLitNodeStyleFromSource(renderFunctionSource) {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const renderFunction = new Function(
    'const svg = arguments[0]; const nothing = arguments[1]; const renderFunction = ' +
      renderFunctionSource +
      '\n return renderFunction'
  )(svg, nothing)
  return new LitNodeStyle(renderFunction)
}
