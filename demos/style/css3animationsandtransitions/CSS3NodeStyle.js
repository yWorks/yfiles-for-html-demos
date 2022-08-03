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
import { GraphComponent, INode, IRenderContext, NodeStyleBase, SvgVisual } from 'yfiles'
import { addClass, removeClass } from '../../resources/demo-app.js'

/**
 * A modified version the the demo node style which sets additional CSS classes on its elements.
 */
export default class CSS3NodeStyle extends NodeStyleBase {
  /**
   * Re-renders the node and updates its CSS classes.
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @param {!INode} node
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, node) {
    const g = oldVisual.svgElement
    const rect = g.querySelector('.node-rect')
    const shine = g.querySelector('.node-shine')
    const cache = g['data-renderDataCache']
    if (!cache) {
      return this.createVisual(context, node)
    }

    const layout = node.layout
    const width = layout.width
    const height = layout.height

    if (cache.width !== width) {
      rect.width.baseVal.value = width
      shine.width.baseVal.value = width / 5
      cache.width = width
    }
    if (cache.height !== height) {
      rect.height.baseVal.value = height
      shine.height.baseVal.value = height
      cache.height = height
    }
    if (cache.x !== layout.x || cache.y !== layout.y) {
      g.transform.baseVal.getItem(0).setTranslate(layout.x, layout.y)
      cache.x = layout.x
      cache.y = layout.y
    }

    this.setCssClasses(context, node, g)

    return oldVisual
  }

  /**
   * Creates the visual for a node and sets some additional CSS classes on it.
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {!SvgVisual}
   */
  createVisual(context, node) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    const shine = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    const layout = node.layout
    const nodeRounding = 3.5
    rect.width.baseVal.value = layout.width
    rect.height.baseVal.value = layout.height
    shine.width.baseVal.value = layout.width / 5
    shine.height.baseVal.value = layout.height
    rect.setAttribute('rx', `${nodeRounding}`)
    rect.setAttribute('ry', `${nodeRounding}`)
    rect.setAttribute('fill', '#FF8C00')
    rect.setAttribute('stroke', '#662b00')
    rect.setAttribute('stroke-width', '1.5px')
    shine.setAttribute('fill', '#FFFFFF')

    // set some identifying CSS classes on the elements of this visual
    g.setAttribute('class', 'node')
    rect.setAttribute('class', 'node-rect')
    shine.setAttribute('class', 'node-shine')

    // set additional CSS classes based on the state of the node
    this.setCssClasses(context, node, g)

    // remove the node-created class after the created animation is finished
    // to avoid re-triggering it on subsequent redraws
    g.addEventListener('animationend', e => {
      if (e.animationName === 'nodeCreatedAnimation') {
        removeClass(g, 'node-created')
      }
    })
    g['data-renderDataCache'] = {
      x: layout.x,
      y: layout.y,
      width: layout.width,
      height: layout.height
    }

    g.appendChild(rect)
    g.appendChild(shine)
    g.setAttribute('transform', `translate(${layout.x} ${layout.y})`)

    return new SvgVisual(g)
  }

  /**
   * Sets additional CSS classes on the node visual based on the state of the node.
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @param {!Element} element
   */
  setCssClasses(context, node, element) {
    // add the node-created class if the node was just created and remove the created flag on its
    // data object to avoid adding the class again when the node is redrawn
    if (node.tag && node.tag.created) {
      addClass(element, 'node-created')
      delete node.tag.created
    }

    // add the node-focused class if the node is currently focused, remove the class otherwise
    const canvasComponent = context.canvasComponent
    if (canvasComponent.currentItem === node) {
      addClass(element, 'node-focused')
    } else {
      removeClass(element, 'node-focused')
    }

    // add the node-selected class if the node is currently selected, remove the class otherwise
    if (canvasComponent.selection.selectedNodes.includes(node)) {
      addClass(element, 'node-selected')
    } else {
      removeClass(element, 'node-selected')
    }
  }
}
