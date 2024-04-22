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
import {
  GraphComponent,
  HtmlVisual,
  LabelStyleBase,
  Size,
  Visual,
  VisualCachingPolicy
} from 'yfiles'

import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
/**
 * @typedef {(FunctionComponent.<TTag>|ComponentClass.<TTag>)} RenderType
 */

/**
 * Helper for the ReactComponentHtmlNodeStyle to factor out the props retrieval per node
 * @typedef {function} TagProvider
 */

/**
 * The default implementation just uses the props from the tag of the item to be rendered.
 * @param context
 * @param node
 */
const defaultTagProvider = (context, node) => node.tag

/**
 * The interface of the props passed to the HTML react component for rendering the label contents.
 * @typedef {Object} ReactComponentHtmlLabelStyleProps
 * @property {boolean} selected
 * @property {string} text
 * @property {('low'|'high')} detail
 * @property {TTag} tag
 */

/**
 * @typedef {Object} Cache
 * @property {ReactComponentHtmlLabelStyleProps.<TTag>} props
 * @property {Root} root
 */

/**
 * Utility type for type-safe implementation of the Visual that stores the props
 * it has been created for along with the React Root.
 * @typedef {TaggedHtmlVisual.<HTMLDivElement,Cache.<TTag>>} ReactComponentHtmlLabelStyleVisual
 */

/**
 * Helper method that will be used by the below style to release React resources when the
 * label gets removed from the yFiles scene graph.
 * @param {!IRenderContext} context
 * @param {!Visual} removedVisual
 * @param {boolean} dispose
 * @returns {?Visual}
 */
function unmountReact(context, removedVisual, dispose) {
  const visual = removedVisual
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
 * A simple ILabelStyle implementation that uses React Components/render functions
 * for rendering the label visualizations as an HtmlVisual
 * Use it like this:
 * ```
 *  declare type TagType = { name: string }
 *
 *  const MyHtmlLabelTemplate = ({ name }: TagType) => (
 *    <>
 *      <span>{name}</span>
 *   </>
 *  )
 *
 *  const style = new ReactComponentLabelStyle(MyHtmlLabelTemplate)
 *
 *  const tag: TagType = { name: 'yFiles' }
 *  graph.createLabel({ style, tag })
 * ```
 */
export class ReactComponentHtmlLabelStyle extends LabelStyleBase {
  size
  /**
   * Creates a new instance
   * @param {!RenderType.<ReactComponentHtmlLabelStyleProps.<TTag>>} reactComponent the React component rendering the HTML content
   * @param {!TagProvider.<TTag>} tagProvider the optional provider function that provides the "tag" in the props.
   * By default, this will use the node's tag.
   * @param {!(Size|SizeConvertible)} size
   */
  constructor(reactComponent, size, tagProvider = defaultTagProvider) {
    super()
    this.tagProvider = tagProvider
    this.reactComponent = reactComponent
    this.size = Size.from(size)
  }

  /**
   * @param {!IRenderContext} context
   * @param {!ILabel} label
   * @returns {!ReactComponentHtmlLabelStyleProps.<TTag>}
   */
  createProps(context, label) {
    return {
      selected:
        context.canvasComponent instanceof GraphComponent &&
        context.canvasComponent.selection.selectedLabels.isSelected(label),
      text: label.text,
      detail: context.zoom < 0.5 ? 'low' : 'high',
      tag: this.tagProvider(context, label)
    }
  }

  /**
   * @param {!IRenderContext} context
   * @param {!ILabel} label
   * @returns {!ReactComponentHtmlLabelStyleVisual.<TTag>}
   */
  createVisual(context, label) {
    // obtain the properties from the label
    const props = this.createProps(context, label)

    // create a React root and render the component into
    const div = document.createElement('div')
    const root = createRoot(div)
    root.render(createElement(this.reactComponent, props))

    const cache = { props, root }
    // wrap the Dom element into a HtmlVisual, adding the "root" for later use in updateVisual
    const visual = HtmlVisual.from(div, cache)

    // set the CSS layout for the container
    HtmlVisual.setLayout(visual.element, label.layout.bounds)

    // register a callback that unmounts the React app when the visual is discarded
    context.setDisposeCallback(visual, unmountReact)
    return visual
  }

  /**
   * @param {!IRenderContext} context
   * @param {!ReactComponentHtmlLabelStyleVisual.<TTag>} oldVisual
   * @param {!ILabel} label
   * @returns {!ReactComponentHtmlLabelStyleVisual.<TTag>}
   */
  updateVisual(context, oldVisual, label) {
    const newProps = this.createProps(context, label)

    const cache = oldVisual.tag
    const oldProps = cache.props
    if (
      oldProps.selected !== newProps.selected ||
      oldProps.detail !== newProps.detail ||
      oldProps.tag !== newProps.tag
    ) {
      const element = createElement(this.reactComponent, newProps)
      oldVisual.tag.root.render(element)
      cache.props = newProps
    }

    // update the CSS layout of the container element
    HtmlVisual.setLayout(oldVisual.element, label.layout.bounds)

    return oldVisual
  }

  /**
   * @param {!ILabel} label
   * @returns {!Size}
   */
  getPreferredSize(label) {
    return Size.from(this.size)
  }
}
