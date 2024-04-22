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
import { EdgeTypeEnum } from './data-types.js'

/**
 * Creates the properties view panel to display the properties of the clicked elements.
 */
export class PropertiesView {
  /**
   * Creates the PropertiesView.
   * @param {!Element} element The DOM element that will be filled with the properties.
   */
  constructor(element) {
    this.element = element
    this.element = element
  }

  /**
   * Displays the properties of the given node.
   * @param {!Company} item The given node
   */
  showNodeProperties(item) {
    this.clear()

    const heading = document.createElement('div')
    heading.appendChild(createElement('h2', 'Company Details'))
    heading.classList.add('heading')
    this.element.appendChild(heading)
    // Display the individual properties
    const table = document.createElement('table')
    this.element.appendChild(table)

    let tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Name'))
    tr.appendChild(createElement('td', item.name))

    tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Type'))
    tr.appendChild(createElement('td', item.nodeType))

    tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Jurisdiction'))
    tr.appendChild(createElement('td', `${item.jurisdiction}`))

    if (item.taxStatus !== undefined) {
      tr = document.createElement('tr')
      table.appendChild(tr)
      tr.appendChild(createElement('td', 'Tax Status'))
      tr.appendChild(createElement('td', `${item.taxStatus}`))
    }

    if (item.currency !== undefined) {
      tr = document.createElement('tr')
      table.appendChild(tr)
      tr.appendChild(createElement('td', 'Currency'))
      tr.appendChild(createElement('td', `${item.currency}`))
    }

    if (item.units !== undefined) {
      tr = document.createElement('tr')
      table.appendChild(tr)
      tr.appendChild(createElement('td', 'Units'))
      tr.appendChild(createElement('td', `${item.units}`))
    }
  }

  /**
   * Displays the properties of the given edge.
   * @param {!(OwnershipEdge|RelationshipEdge)} item The given edge
   */
  showEdgeProperties(item) {
    this.clear()

    const heading = document.createElement('div')
    heading.appendChild(createElement('h2', 'Relationship Details'))
    heading.classList.add('heading')
    this.element.appendChild(heading)
    // Display the individual properties
    const table = document.createElement('table')
    this.element.appendChild(table)
    // The company business unit
    let tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Type'))
    tr.appendChild(createElement('td', item.type))

    if (item.type === EdgeTypeEnum.Hierarchy) {
      tr = document.createElement('tr')
      table.appendChild(tr)
      tr.appendChild(createElement('td', 'Ownership'))
      tr.appendChild(createElement('td', `${item.ownership}`))
    }
  }

  /**
   * Clears the properties panel.
   */
  clear() {
    this.element.innerHTML = ''
  }
}

/**
 * Creates a DOM element with the specified text content
 * @param {!string} tagName
 * @param {!string} textContent
 * @returns {!HTMLElement}
 */
function createElement(tagName, textContent) {
  const element = document.createElement(tagName)
  element.textContent = textContent
  return element
}
