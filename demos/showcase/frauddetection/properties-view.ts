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
import { type GraphComponent, type GraphEditorInputMode, type IModelItem, INode } from 'yfiles'
import { getEntityData, getInfoMap } from './entity-data'
import { nodeStyleMapping } from './styles/graph-styles'

/**
 * Creates the right-panel which displays information about the selected node.
 */
export function initializePropertiesView(graphComponent: GraphComponent): void {
  let detailsContainer = document.querySelector<HTMLDivElement>('.details-container')
  if (!detailsContainer) {
    detailsContainer = document.createElement('div')
    detailsContainer.classList.add('details-container')

    // creates the div that contains the message displayed when no item is selected
    const messageElement = document.createElement('div')
    messageElement.classList.add('no-item-selection')
    const textElement = createElement('text', 'No item selected')
    textElement.classList.add('no-item-selection-text')
    messageElement.appendChild(textElement)
    detailsContainer.appendChild(messageElement)
  }
  const parentContainer = document.querySelector('#properties-view')!
  parentContainer.appendChild(detailsContainer)
  toggleNoSelectionVisibility(true)

  const inputMode = graphComponent.inputMode as GraphEditorInputMode
  graphComponent.selection.addItemSelectionChangedListener((_, evt) => {
    clearPropertiesView()
    updatePropertiesView(evt.item, evt.itemSelected, detailsContainer!)
  })

  inputMode.addCanvasClickedListener(() => {
    clearPropertiesView()
  })
}

/**
 * Updates the information that has to be displayed based on the selected node.
 */
function updatePropertiesView(
  item: IModelItem | null,
  isSelected: boolean,
  detailsContainer: HTMLDivElement
): void {
  if (item instanceof INode && isSelected) {
    toggleNoSelectionVisibility(false)
    showEntityProperties(item, detailsContainer)
  }
}

/**
 * Cleats the properties view panel.
 */
export function clearPropertiesView(): void {
  const detailsContainer = document.querySelector<HTMLDivElement>('.properties-container')
  detailsContainer?.remove()
  toggleNoSelectionVisibility(true)
}

/**
 * Creates the HTMLElement that will display the information of the given node and adds it to the parent container.
 */
function showEntityProperties(node: INode, parentContainer: HTMLDivElement): void {
  const propertiesContainer = document.createElement('div')
  propertiesContainer.classList.add('properties-container')

  const entity = getEntityData(node)

  const headerContainer = document.createElement('div')
  headerContainer.classList.add('header-container')
  propertiesContainer.appendChild(headerContainer)

  const heading = document.createElement('div')
  heading.classList.add('header')
  headerContainer.appendChild(heading)

  const imageUrl = nodeStyleMapping[entity.type].image
  if (imageUrl) {
    const icon = document.createElement('img')
    icon.setAttribute('width', '30')
    icon.setAttribute('height', '30')
    icon.setAttribute('src', imageUrl)
    heading.appendChild(icon)
  }

  const typeElement = createElement('h2', entity.type)
  typeElement.style.display = 'inline-block'
  heading.appendChild(typeElement)

  const tableContainer = document.createElement('div')
  tableContainer.classList.add('table-container')
  propertiesContainer.appendChild(tableContainer)

  const table = document.createElement('table')
  tableContainer.appendChild(table)

  const infoMap: Record<string, string> = getInfoMap(node)
  Object.keys(infoMap).forEach((key: string) => {
    const tr: HTMLTableRowElement = document.createElement('tr')
    tr.appendChild(createElement('td', key))
    tr.appendChild(createElement('td', infoMap[key]))
    table.appendChild(tr)
  })
  parentContainer.appendChild(propertiesContainer)
}

/**
 * Sets the visibility of the message displayed when no item is selected.
 */
function toggleNoSelectionVisibility(visible: boolean): void {
  document.querySelector<HTMLDivElement>('.no-item-selection')!.style.display = visible
    ? 'flex'
    : 'none'
}

/**
 * Creates a DOM element with the specified text content.
 */
function createElement(tagName: string, textContent: string): HTMLElement {
  const element = document.createElement(tagName)
  element.textContent = textContent
  return element
}
