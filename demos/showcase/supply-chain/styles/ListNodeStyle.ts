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
import { HtmlVisual, type INode, type IRenderContext, NodeStyleBase } from '@yfiles/yfiles'
import { buildPropertyElementId } from '../utils/helpers'
import { NodeTag } from '../utils/NodeTag'
import type { HtmlEditableNodeStyleVisual, NodeData, NodeTagProperty } from '../types'

// maps color group ids to CSS classes
const colorGroupIdToCssClass: Map<number, string> = new Map([
  [0, 'demo-blue'],
  [1, 'ultra-violet'],
  [2, 'vista-blue'],
  [3, 'baby-blue'],
  [4, 'ash-blue'],
  [5, 'sage-green']
])

/**
 * Implements a custom node style for rendering HTML. This class defines the node's interactive HTML,
 * including event handling and visual effects such as highlighting, animations, and alert indicators.
 */
export class ListNodeStyle extends NodeStyleBase<HtmlEditableNodeStyleVisual> {
  private readonly nodeData: NodeData
  private readonly onClickCallback: (e: Event) => void
  private readonly colorGroupId: number
  private nodeTagCache: Map<string, NodeTag> = new Map()

  constructor(nodeData: NodeData, onClickCallback: (e: Event) => void, colorGroupId: number) {
    super()
    this.nodeData = nodeData
    this.onClickCallback = onClickCallback
    this.colorGroupId = colorGroupId
  }

  /**
   * Creates an HTML visual for a given node within the render context.
   */
  protected createVisual(context: IRenderContext, node: INode): HtmlEditableNodeStyleVisual {
    const doc = context.canvasComponent!.htmlElement.ownerDocument
    const div = doc.createElement('div')
    const visual = HtmlVisual.from(div)
    HtmlVisual.setLayout(div, node.layout)

    createNodeContainerHTML(
      div,
      this.nodeData,
      this.colorGroupId,
      node.tag as NodeTag,
      this.onClickCallback
    )

    this.nodeTagCache.set(
      node.tag.id,
      new NodeTag(node.tag.id, node.tag.layer, { ...node.tag.properties })
    )

    return visual
  }

  /**
   * Updates the HTML visual of the node based on its current node tag data, applying updated style
   * or content changes.
   */
  protected updateVisual(
    _: IRenderContext,
    oldVisual: HtmlEditableNodeStyleVisual,
    node: INode
  ): HtmlEditableNodeStyleVisual {
    // check whether there has been any change in the node tag data
    if (JSON.stringify(this.nodeTagCache.get(node.tag.id)) !== JSON.stringify(node.tag)) {
      const propertyContainers = oldVisual.element.querySelectorAll('.node-property-container')
      propertyContainers?.forEach((propertyElement: Element) => {
        const tagProperty: NodeTagProperty = node.tag.properties.find(
          (tagProp: any) => propertyElement.id === tagProp.elementId
        )

        if (tagProperty?.toHighlight) {
          propertyElement.classList.add('highlight-node-property')
        } else {
          propertyElement.classList.remove('highlight-node-property')
        }

        if (tagProperty?.toAlert) {
          propertyElement.classList.add('alert-node-property')
        } else {
          propertyElement.classList.remove('alert-node-property')
        }

        if (tagProperty?.toFlash) {
          propertyElement.classList.add('flash-node-property')
          ;(node.tag as NodeTag).updatePropertyFlash(propertyElement.id, false)
        }

        if (tagProperty?.toFlashAlert) {
          propertyElement.classList.add('flash-alert-node-property')
          ;(node.tag as NodeTag).updatePropertyFlashAlert(propertyElement.id, false)
        }

        const stockElement = propertyElement.querySelector('.node-stock')
        if (stockElement) {
          stockElement.textContent = tagProperty?.stock.toString()
        }
      })

      this.nodeTagCache.set(
        node.tag.id,
        new NodeTag(node.tag.id, node.tag.layer, { ...node.tag.properties })
      )
    }

    HtmlVisual.setLayout(oldVisual.element, node.layout)
    return oldVisual
  }
}

/**
 * Creates the HTML structure for a node container and appends it to the given container element.
 */
export function createNodeContainerHTML(
  containerDiv: HTMLElement,
  nodeData: NodeData,
  colorGroupId: number,
  nodeTag: NodeTag,
  onClickCallback: (e: Event) => void,
  isExampleNode = false
): void {
  const colorClass = colorGroupIdToCssClass.get(colorGroupId)!
  containerDiv.classList.add('node-container', colorClass)

  // example nodes are not part of the graph; instead, they are rendered as part of the demo's
  // description; example nodes might share the same data as graph nodes; therefore, example nodes
  // should not receive the (possibly identical) node id to ensure ids stay unique across the DOM
  containerDiv.innerHTML = `
      <div id="${!isExampleNode ? nodeData.id : ''}" class="node-content">
        <div class="node-header ${colorClass}">
          ${nodeData.icon ? `<div class="node-icon">${nodeData.icon}</div>` : ''}
          <div class="node-header-details ${colorClass}">
            <h2 class="node-headline">${nodeData.headline}</h2>
            ${nodeData.location ? `<p class="node-location">${nodeData.location}</p>` : ''}
          </div>
        </div>
          <div class="node-properties">
        </div>
      </div>
    `

  const nodeProperties = containerDiv.querySelector('.node-properties') as HTMLElement
  nodeData.properties.forEach((prop: any) => {
    const elementId = buildPropertyElementId(nodeData.id, prop.id)
    const tagProperty: NodeTagProperty | undefined = nodeTag.properties.find(
      (tagProp: any) => tagProp.elementId === elementId
    )
    const stockValue = tagProperty?.stock !== undefined ? tagProperty.stock : prop.stock
    const highlightClass = tagProperty?.toHighlight ? 'highlight-node-property' : ''
    const flashClass = tagProperty?.toFlash ? 'flash-node-property' : ''
    const alertClass = tagProperty?.toAlert ? 'alert-node-property' : ''
    const flashAlertClass = tagProperty?.toFlashAlert ? 'flash-alert-node-property' : ''

    const tempContainer = document.createElement('div')
    tempContainer.innerHTML = `
        <div id="${!isExampleNode ? elementId : ''}" class="node-property-container ${highlightClass} ${flashClass} ${alertClass} ${flashAlertClass}">
          <p class="node-property">${prop.name}</p>
          <div class="node-stock-container">
            <button class="node-button produce ${colorClass}">
              <span>add</span>
            </button>
            ${
              prop.endOfChain
                ? `<button class="node-button sell ${colorClass}">
                     <span>remove</span>
                   </button>`
                : ''
            }
            <span class="node-stock">${stockValue}</span>
          </div>
        </div>
      `

    const propertyContainer = tempContainer.firstElementChild as HTMLElement
    nodeProperties.appendChild(propertyContainer)

    for (const eventName of [
      'click',
      'mousedown',
      'mouseup',
      'mousemove',
      'keydown',
      'contextmenu',
      'touchstart',
      'pointerdown',
      'pointermove',
      'pointerup'
    ]) {
      propertyContainer.addEventListener(eventName, (e) => e.stopPropagation())
    }
    propertyContainer.addEventListener('click', (e) => onClickCallback(e))

    // on animation end or cancel, remove CSS classes responsible for triggering the animation
    propertyContainer.addEventListener('animationend', (e: AnimationEvent) => {
      if (e.animationName === 'flash-background') {
        const eventTriggerElement = e.target as HTMLElement
        eventTriggerElement.classList.remove('flash-node-property')
      }
      if (e.animationName === 'pulse') {
        const eventTriggerElement = e.target as HTMLElement
        eventTriggerElement.classList.remove('flash-alert-node-property')
      }
    })
    propertyContainer.addEventListener('animationcancel', (e: AnimationEvent) => {
      if (e.animationName === 'flash-background') {
        const eventTriggerElement = e.target as HTMLElement
        eventTriggerElement.classList.remove('flash-node-property')
      }
      if (e.animationName === 'pulse') {
        const eventTriggerElement = e.target as HTMLElement
        eventTriggerElement.classList.remove('flash-alert-node-property')
      }
    })
  })
}
