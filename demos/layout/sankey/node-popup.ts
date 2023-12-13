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
import { ExteriorLabelModel, type GraphComponent, type GraphEditorInputMode, INode } from 'yfiles'
import HTMLPopupSupport from '../../view/htmlpopup/HTMLPopupSupport'
import { colors, updateNodeColor } from './styles-support'
import { TagChangeUndoUnit } from './interaction/TagChangeUndoUnit'
import { getPoliticalParty } from './data-types'
import {
  hideAllPickerContainer,
  showPickerContainer
} from '../../showcase/mindmap/node-popup-toolbar'

// we use font-awesome icons for the contextual toolbar in this demo
import '@fortawesome/fontawesome-free/js/all.min.js'

let nodePopup: HTMLPopupSupport<INode>

/**
 * Creates a node popup that allows for changing the color of a node and its adjacent edges.
 */
export function initializeNodePopup(graphComponent: GraphComponent): void {
  // creates the HTML elements for the node popup
  createNodePopup(graphComponent)

  // creates the HTML panel that will display the node popup
  nodePopup = new HTMLPopupSupport(
    graphComponent,
    document.getElementById('contextualToolbar')!,
    ExteriorLabelModel.EAST
  )

  const inputMode = graphComponent.inputMode as GraphEditorInputMode
  // configures the input mode to show the popup when a node is clicked
  inputMode.addItemClickedListener((_, evt) => {
    if (evt.item instanceof INode) {
      document.getElementById('color-picker-label')!.style.display = 'inline-block'
      nodePopup.currentItem = evt.item
    }
  })

  // when a node drag operation starts, hide the popup
  inputMode.moveUnselectedInputMode.addDragStartedListener(() => {
    hidePopup(graphComponent)
  })

  // when a click on empty space occurs, hide the popup
  inputMode.addCanvasClickedListener(() => {
    hidePopup(graphComponent)
  })
}

/**
 * Creates the HTML element for the node popup and registers the required listener to the
 * button component.
 */
function createNodePopup(graphComponent: GraphComponent): void {
  createColorPicker(graphComponent)
  document
    .getElementById('color-picker')!
    .addEventListener('click', (evt) =>
      showPickerContainer(graphComponent, evt.target as HTMLInputElement)
    )
}

/**
 * Creates the div container for the color picker.
 * Adds the necessary buttons and registers the listeners for the change of the color.
 */
function createColorPicker(graphComponent: GraphComponent): void {
  const colorContainer = document.querySelector<HTMLDivElement>('#color-picker-colors')!

  const darkColors = colors.map((c: { dark: string; light: string }): string => c.dark)
  for (const color of darkColors) {
    const colorButton = document.createElement('button')
    colorButton.setAttribute('data-color', color)
    colorButton.setAttribute('style', `background-color:${color}`)
    colorContainer.appendChild(colorButton)
    colorButton.addEventListener(
      'click',
      () => {
        const currentItem = nodePopup.currentItem
        hidePopup(graphComponent)
        if (currentItem) {
          const oldLabelText = currentItem.labels.at(0)!.text
          const graph = graphComponent.graph
          graph.nodes
            .filter((node: INode): boolean => node.labels.at(0)!.text === oldLabelText)
            .forEach((node: INode): void => {
              // store the new color to the node's data
              const colorId = darkColors.indexOf(color)
              const oldData = { ...getPoliticalParty(node) }
              const newData = getPoliticalParty(node)
              newData.colorId = colorId

              // create an undo unit so that the color change can be reverted, if needed
              const tagUndoUnit = new TagChangeUndoUnit(
                'Color changed',
                'Color changed',
                oldData,
                newData,
                node,
                () => updateNodeColor(node, graph)
              )
              // add the undo unit to the graph's undo engine
              graph.undoEngine!.addUnit(tagUndoUnit)

              // update the color of the node and its adjacent edges
              updateNodeColor(node, graph)
            })

          // force an update to use the new color
          graphComponent.invalidate()
        }
      },
      false
    )
  }
}

/**
 * Hides the popup element along with its component.
 */
export function hidePopup(graphComponent: GraphComponent): void {
  hideAllPickerContainer()
  nodePopup.currentItem = null
  graphComponent.focus()
}
