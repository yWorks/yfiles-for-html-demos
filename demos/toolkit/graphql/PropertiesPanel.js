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
export class PropertiesPanel {
  element
  /**
   * Creates a new properties panel that shows the individual properties.
   * @param element The DOM element that will be filled with the properties.
   */
  constructor(element) {
    this.element = element
  }
  showProperties(node) {
    this.clear()
    if (!node || !node.tag) {
      return
    }
    // When the graph is created with the GraphBuilder, the business data of each object is made
    // available in the node's tag.
    const person = node.tag
    const heading = document.createElement('div')
    heading.classList.add('user-detail')
    this.element.appendChild(heading)
    // The person's icon
    const icon = document.createElement('span')
    icon.classList.add('usericon')
    icon.classList.add(person.icon)
    heading.appendChild(icon)
    // The person's name
    heading.appendChild(createElement('h2', person.name))
    // Display the individual properties
    const table = document.createElement('table')
    this.element.appendChild(table)
    // The person's id
    let tr = document.createElement('tr')
    tr.appendChild(createElement('td', 'ID'))
    tr.appendChild(createElement('td', `${person.id}`))
    table.appendChild(tr)
    // The person's icon
    tr = document.createElement('tr')
    tr.appendChild(createElement('td', 'Icon'))
    tr.appendChild(createElement('td', person.icon))
    table.appendChild(tr)
    // The person's friends count
    tr = document.createElement('tr')
    tr.appendChild(createElement('td', 'Nr. of Friends'))
    tr.appendChild(createElement('td', `${person.friendsCount}`))
    table.appendChild(tr)
    // Create a list of friends
    const subTr = document.createElement('tr')
    subTr.appendChild(createElement('td', 'Visible Friends'))
    const subTd = document.createElement('td')
    for (const friend of person.friends) {
      if (subTd.childElementCount > 0) {
        subTd.appendChild(document.createTextNode(', '))
      }
      const name = document.createElement('span')
      name.innerHTML = friend.name
      subTd.appendChild(name)
    }
    subTr.appendChild(subTd)
    table.appendChild(subTr)
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
 */
function createElement(tagName, textContent) {
  const element = document.createElement(tagName)
  element.textContent = textContent
  return element
}
