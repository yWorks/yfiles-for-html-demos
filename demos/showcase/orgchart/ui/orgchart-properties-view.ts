/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
import type { INode } from 'yfiles'
import type { CollapsibleTree } from '../CollapsibleTree'
import type { Employee } from '../model/orgchart-data'
import { getEmployee } from '../model/data-loading'

/**
 * Creates the HTML Properties element which displays information about the employee which is
 * associated with the given node. The information is shown in the right sidebar.
 */
export function showNodeProperties(node: INode, orgChartGraph: CollapsibleTree): void {
  const parentDiv = document.getElementById('properties-view')!
  // clear the current properties view
  parentDiv.innerText = ''

  // When the graph is created from the source data by class TreeSource,
  // The source data for each node is attached to the node as its tag.
  const employee = getEmployee(node)

  if (!employee) {
    return
  }

  const userDetail = document.createElement('div')
  userDetail.className = 'user-detail'
  userDetail.append(
    createElement('h2', employee.name ?? ''),
    createElement('div', employee.position ?? ''),
    createSVGIcon(employee.icon ?? '', 50, 50, '0 0 75 75')
  )

  const properties = document.createElement('table')
  properties.append(
    createProperty('Dept.', employee.businessUnit ?? ''),
    createProperty('Email', employee.email ?? ''),
    createProperty('Phone', employee.phone ?? ''),
    createProperty('Fax', employee.fax ?? ''),
    createProperty('Status', createSVGIcon(`${employee.status}_icon`, 100, 15, '0 2.5 70 5'))
  )

  // create parent and colleagues links
  if (employee.parent) {
    properties.append(createProperty('Superior', createLinkEntry(employee.parent, orgChartGraph)))

    const colleagues = employee.parent.subordinates!.filter(c => c !== employee)
    if (colleagues.length > 0) {
      properties.append(
        createProperty('Colleagues', ...createLinkEntryList(colleagues, orgChartGraph))
      )
    }
  }

  // create subordinate links
  if (employee.subordinates) {
    properties.append(
      createProperty('Subordinates', ...createLinkEntryList(employee.subordinates, orgChartGraph))
    )
  }

  parentDiv.append(userDetail, properties)
}

/**
 * Adds a property with the given name and value to the properties view.
 */
function createProperty(name: string, ...value: (string | Text | Element)[]): HTMLElement {
  const tr = document.createElement('tr')
  tr.append(createElement('td', name))

  const td = document.createElement('td')
  td.append(...value)
  tr.append(td)
  return tr
}

/**
 *  Creates an SVG element that references the provided SVG icon, e.g.:
 * ```
 * <svg width="50" height="50"><use xlink:href="#usericon_male1"></use></svg>
 * ```
 */
function createSVGIcon(
  iconRef: string,
  width: number,
  height: number,
  viewBox: string
): SVGElement {
  const svgNS = 'http://www.w3.org/2000/svg'
  const xlinkNS = 'http://www.w3.org/1999/xlink'
  const svgElement = document.createElementNS(svgNS, 'svg')
  const useElement = document.createElementNS(svgNS, 'image')
  useElement.setAttributeNS(xlinkNS, 'xlink:href', './resources/' + iconRef + '.svg')
  svgElement.setAttribute('width', `${width}`)
  svgElement.setAttribute('height', `${height}`)
  svgElement.setAttribute('viewBox', viewBox)
  svgElement.appendChild(useElement)
  return svgElement
}

/**
 * Clicking a link to another employee in the properties view will select
 * and zoom to the corresponding node in the organization chart.
 * We use the E-Mail address to identify individual employees.
 */
function createLinkEntry(employee: Employee, orgChartGraph: CollapsibleTree): HTMLElement {
  const element = createElement('a', employee.name ?? '')
  element.setAttribute('href', '#')
  element.addEventListener('click', event => {
    if (employee.email == null) {
      return
    }

    const node = orgChartGraph.completeGraph.nodes.find(
      n => getEmployee(n)?.email === employee.email
    )

    if (node) {
      orgChartGraph.zoomToItem(node)
    }
    event.preventDefault()
  })
  return element
}

/**
 * Creates a list of links to the given employees by using {@see createLinkEntry} but also adds a ","
 * separator as text node between every link.
 */
function createLinkEntryList(
  employees: Employee[],
  orgChartGraph: CollapsibleTree
): (HTMLElement | Text)[] {
  const list = []

  for (const employee of employees) {
    list.push(createLinkEntry(employee, orgChartGraph))
    if (employee !== employees[employees.length - 1]) {
      list.push(document.createTextNode(', '))
    }
  }

  return list
}

/**
 * Creates a DOM element with the specified text content
 */
function createElement(tagName: string, textContent: string): HTMLElement {
  const element = document.createElement(tagName)
  element.textContent = textContent
  return element
}
