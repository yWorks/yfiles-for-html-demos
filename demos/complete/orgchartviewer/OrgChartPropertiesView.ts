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
import { addClass } from '../../resources/demo-app'
import { IModelItem, INode } from 'yfiles'
import type { Employee } from './OrgChartViewerDemo'

export default class OrgChartPropertiesView {
  /**
   * Creates a new OrgChartPropertiesView
   * @param element The DOM element that will be filled with the properties.
   * @param selectAndZoomToNodeWithEmail - the function will be called when clicking
   *   on email links in the View
   */
  constructor(
    private readonly element: Element,
    private readonly selectAndZoomToNodeWithEmail: (email: string) => void
  ) {}

  showProperties(item: IModelItem | null): void {
    this.clear()

    if (item instanceof INode && item.tag) {
      // When the graph is created from the source data by class TreeSource,
      // The source data for each node is attached to the node as it's tag.
      const employee = item.tag as Employee
      const heading = document.createElement('div')
      addClass(heading, 'user-detail')
      this.element.appendChild(heading)
      // The employee name
      heading.appendChild(createElement('h2', employee.name))
      heading.appendChild(createElement('div', employee.position || ''))

      const svgIcon = this.createSVGIcon(employee.icon, 50, 50, '0 0 75 75')
      if (svgIcon) {
        heading.appendChild(svgIcon)
      }

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
      const statusIcon = this.createSVGIcon(`${employee.status}_icon`, 100, 15, '-5 -2.5 70 5')
      if (statusIcon) {
        statusTd.appendChild(statusIcon)
      }

      // Create links to the parent and colleague nodes.
      // (Note that the parent references are added to the
      // source data in {@link OrgChartViewerDemo.addParentReferences()}.
      const parent = employee.parent
      if (parent) {
        const parentTr = document.createElement('tr')
        parentTr.appendChild(createElement('td', 'Superior'))
        const parentTd = document.createElement('td')
        parentTd.appendChild(this.createLinkEntry(parent))
        parentTr.appendChild(parentTd)
        table.appendChild(parentTr)

        const colleagues = parent.subordinates
        if (colleagues && colleagues.length > 1) {
          const colleagueTr = document.createElement('tr')
          colleagueTr.appendChild(createElement('td', 'Colleagues'))
          const colleagueTd = document.createElement('td')
          for (const colleague of colleagues) {
            if (colleague !== employee) {
              if (colleagueTd.childElementCount > 0) {
                colleagueTd.appendChild(document.createTextNode(', '))
              }
              colleagueTd.appendChild(this.createLinkEntry(colleague))
            }
          }
          colleagueTr.appendChild(colleagueTd)
          table.appendChild(colleagueTr)
        }
      }

      // Create links to subordinate nodes
      const subs = employee.subordinates
      if (subs) {
        const subTr = document.createElement('tr')
        subTr.appendChild(createElement('td', 'Subordinates'))
        const subTd = document.createElement('td')
        for (const sub of subs) {
          if (subTd.childElementCount > 0) {
            subTd.appendChild(document.createTextNode(', '))
          }
          subTd.appendChild(this.createLinkEntry(sub))
        }
        subTr.appendChild(subTd)
        table.appendChild(subTr)
      }
    }
  }

  /**
   * Creates an SVG element that references the provided SVG icon, e.g.:
   * ```
   * <svg width="50" height="50"><use xlink:href="#usericon_male1"></use></svg>
   * ```
   */
  createSVGIcon(
    iconRef: string,
    width: number,
    height: number,
    viewBox: string
  ): SVGElement | null {
    const icon = document.getElementById(iconRef)
    if (icon != null) {
      const svgNS = 'http://www.w3.org/2000/svg'
      const xlinkNS = 'http://www.w3.org/1999/xlink'
      const svgElement = document.createElementNS(svgNS, 'svg')
      const useElement = document.createElementNS(svgNS, 'use')
      useElement.setAttributeNS(xlinkNS, 'xlink:href', `#${iconRef}`)
      svgElement.setAttribute('width', `${width}`)
      svgElement.setAttribute('height', `${height}`)
      svgElement.setAttribute('viewBox', viewBox)
      svgElement.appendChild(useElement)
      return svgElement
    }
    return null
  }

  /**
   * clicking a link to another employee in the properties view will select
   * and zoom to the corresponding node in the organization chart.
   * We use the E-Mail address to identify individual employees.
   */
  createLinkEntry(employee: Employee): HTMLElement {
    const element = createElement('a', employee.name)
    element.setAttribute('href', '#')
    element.addEventListener('click', event => {
      this.selectAndZoomToNodeWithEmail(employee.email)
      event.preventDefault()
    })
    return element
  }

  clear(): void {
    this.element.innerHTML = ''
  }
}

/**
 * Creates a DOM element with the specified text content
 */
function createElement(tagName: string, textContent: string): HTMLElement {
  const element = document.createElement(tagName)
  element.textContent = textContent
  return element
}
