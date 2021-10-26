/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { INode, IRenderContext, NodeStyleBase, SvgVisual, Visual } from 'yfiles'
import ReactDOM from 'react-dom'
import React, { ComponentClass, FunctionComponent } from 'react'

/**
 * @param {!IRenderContext} context
 * @param {!Visual} removedVisual
 * @param {boolean} dispose
 * @returns {?Visual}
 */
function dispose(context, removedVisual, dispose) {
  const gElement = removedVisual.svgElement
  ReactDOM.unmountComponentAtNode(gElement)
  return null
}

/**
 * @typedef {Object} ReactComponentNodeStyleProps
 * @property {number} width
 * @property {number} height
 * @property {TTag} tag
 */

/**
 * @typedef {(ComponentClass.<ReactComponentNodeStyleProps.<TTag>>|FunctionComponent.<ReactComponentNodeStyleProps.<TTag>>)} RenderType
 */

/**
 * A simple INodeStyle implementation that uses React Components for rendering the node visualizations
 */
export default class ReactComponentNodeStyle extends NodeStyleBase {
  /**
   * @param {!RenderType.<TTag>} type
   */
  constructor(type) {
    super()
    this.type = type
  }

  /**
   * @param {!INode} node
   * @returns {!ReactComponentNodeStyleProps.<TTag>}
   */
  createProps(node) {
    return {
      width: node.layout.width,
      height: node.layout.height,
      tag: node.tag
    }
  }

  /**
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {?Visual}
   */
  createVisual(context, node) {
    const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const props = this.createProps(node)
    const element = React.createElement(this.type, props)
    ReactDOM.render(element, gElement)
    SvgVisual.setTranslate(gElement, node.layout.x, node.layout.y)
    const svgVisual = new SvgVisual(gElement)
    svgVisual['data-state'] = props

    context.setDisposeCallback(svgVisual, dispose)
    return svgVisual
  }

  /**
   * @param {!IRenderContext} context
   * @param {!Visual} oldVisual
   * @param {!INode} node
   * @returns {?Visual}
   */
  updateVisual(context, oldVisual, node) {
    const gElement = oldVisual.svgElement

    const props = this.createProps(node)

    const lastProps = oldVisual['data-state']
    if (
      lastProps.width !== props.width ||
      lastProps.height !== props.height ||
      lastProps.tag !== props.tag
    ) {
      const element = React.createElement(this.type, props)
      ReactDOM.render(element, gElement)
      oldVisual['data-state'] = props
    }
    SvgVisual.setTranslate(gElement, node.layout.x, node.layout.y)
    return oldVisual
  }
}
