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
import { GraphItemTypes, Point, TimeSpan } from '@yfiles/yfiles'
import { isFlowNode } from '../FlowNode/FlowNode'

export function initializeTooltips(graphComponent) {
  // Assume input mode has already been initialized because of order of operations in the main run function
  const inputMode = graphComponent.inputMode

  const toolTipInputMode = inputMode.toolTipInputMode
  toolTipInputMode.toolTipLocationOffset = new Point(10, 10)
  // Increase time it takes for tooltip to appear and the time before it disappears
  toolTipInputMode.delay = TimeSpan.fromMilliseconds(300)
  toolTipInputMode.duration = TimeSpan.fromSeconds(20)

  inputMode.toolTipItems = GraphItemTypes.NODE
  inputMode.addEventListener('query-item-tool-tip', (eventArgs) => {
    if (eventArgs.handled) {
      // Tooltip content has already been assigned -> nothing to do.
      return
    }
    const item = eventArgs.item
    // Validate if the node matches our custom FlowNode type
    if (!isFlowNode(item)) {
      return
    }

    // If validation messages is empty we don't have anything to show in the tooltip
    const validation = item.tag.validate(item.tag)
    if (!validation.validationMessages.length) {
      return
    }

    // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
    eventArgs.toolTip = createValidationTooltipContent(validation.validationMessages)

    // Indicate that the tooltip content has been set.
    eventArgs.handled = true
  })
}

/**
 * The tooltip may either be a plain string or it can also be a rich HTML element. In this case, we
 * show the latter. We use validationMessages returned by node's validation method and show them as a list in the
 * tooltip.
 * Basic tooltip styling can be done using yfiles-tooltip CSS class (see /resources/style.css).
 */
function createValidationTooltipContent(validationMessages) {
  // build the tooltip container
  const tooltip = document.createElement('div')
  tooltip.classList.add('tooltip')

  // const lineMark = document.createElement('div')
  // lineMark.classList.add('tooltip__line-mark')
  // tooltip.appendChild(lineMark)

  // Append the static title and append it to tooltip container
  const title = document.createElement('h4')
  title.innerHTML = 'There seems to be a problem with one or more properties:'
  tooltip.appendChild(title)

  // Create list of messages and append it to tooltip container
  const ul = document.createElement('ul')
  validationMessages.forEach((message) => {
    const li = document.createElement('li')
    li.innerHTML = message
    ul.appendChild(li)
  })
  tooltip.appendChild(ul)

  return tooltip
}
