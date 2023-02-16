/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { addClass } from '../../resources/demo-app.js'

/**
 * Helper class for showing properties of a node in the OrgChart.
 */
export default class PropertiesView {
  /**
   * Creates a new PropertiesView
   * @param {!Element} element The DOM element that will be filled with the properties.
   */
  constructor(element) {
    this.element = element
  }

  /**
   * @param {!INode} node
   */
  showProperties(node) {
    this.clear()

    // When the graph is created from the source data by class TreeSource,
    // the source data for each node is attached to the node as its tag.
    if (node == null || node.tag == null) {
      return
    }
    const employee = node.tag
    const heading = document.createElement('div')
    addClass(heading, 'user-detail')
    this.element.appendChild(heading)
    // The employee name
    const nameElement = createElement('h2', employee.name)
    nameElement.style.display = 'inline-block'
    heading.appendChild(nameElement)

    const nameInput = document.createElement('input')
    nameInput.value = employee.name
    nameInput.style.display = 'none'
    heading.appendChild(nameInput)

    const editButton = document.createElement('button')
    editButton.setAttribute('class', 'demo-edit-name-button')
    editButton.setAttribute('title', 'Click to Edit')
    editButton.style.position = 'absolute'
    editButton.style.right = '0'
    heading.appendChild(editButton)
    heading.appendChild(createElement('div', employee.position))

    this.addNameEventListeners(employee, nameElement, nameInput, editButton)

    const icon = document.createElement('img')
    icon.setAttribute('width', '50')
    icon.setAttribute('height', '50')
    icon.setAttribute('src', `./resources/${employee.icon}.svg`)
    heading.appendChild(icon)

    // Display the individual properties
    const table = document.createElement('table')
    this.element.appendChild(table)
    // The employee business unit
    let tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Dept.'))
    tr.appendChild(createElement('td', employee.businessUnit))
    // The employee email
    tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Email'))
    tr.appendChild(createElement('td', employee.email))
    // The employee phone
    tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Phone'))
    tr.appendChild(createElement('td', employee.phone))
    // The employee fax
    tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Fax'))
    tr.appendChild(createElement('td', employee.fax))
    // The employee status
    tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Status'))
    const statusTd = document.createElement('td')
    tr.appendChild(statusTd)
    const statusSelect = createStatusSelect()
    statusSelect.addEventListener('change', () => {
      employee.status = statusSelect.value
      // notify the template style binding engine of the property change
      employee.firePropertyChanged('status')
    })
    statusTd.appendChild(statusSelect)
    statusSelect.value = employee.status.toLowerCase()
  }

  /**
   * @param {*} employee
   * @param {!HTMLElement} nameElement
   * @param {!HTMLInputElement} nameInput
   * @param {!HTMLButtonElement} editButton
   */
  addNameEventListeners(employee, nameElement, nameInput, editButton) {
    editButton.addEventListener('click', () => {
      nameElement.style.display = 'none'
      nameInput.style.display = 'inline-block'
      nameInput.focus()
    })

    const cancelNameEdit = () => {
      nameInput.value = employee.name = nameElement.textContent
      // notify the template style binding engine of the property change
      employee.firePropertyChanged('name')
      nameInput.style.display = 'none'
      nameElement.style.display = 'inline-block'
    }

    nameInput.addEventListener('keypress', evt => {
      const newName = nameInput.value
      employee.name = newName
      // notify the template style binding engine of the property change
      employee.firePropertyChanged('name')
      if (evt.key === 'Enter') {
        nameElement.textContent = newName
        nameInput.style.display = 'none'
        nameElement.style.display = 'inline-block'
      } else if (evt.key === 'Escape') {
        cancelNameEdit()
      }
    })

    nameInput.addEventListener('blur', () => cancelNameEdit())
  }

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

/**
 * @returns {!HTMLSelectElement}
 */
function createStatusSelect() {
  const select = document.createElement('select')
  createStatusOption(select, 'Present')
  createStatusOption(select, 'Busy')
  createStatusOption(select, 'Unavailable')
  return select
}

/**
 * @param {!HTMLSelectElement} select
 * @param {!string} val
 */
function createStatusOption(select, val) {
  const option = document.createElement('option')
  option.setAttribute('value', val.toLowerCase())
  option.textContent = val
  select.appendChild(option)
}
