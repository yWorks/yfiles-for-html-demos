/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphComponent,
  ILabelModelParameter,
  IModelItem,
  INode,
  Point,
  SimpleLabel,
  Size
} from 'yfiles'

/**
 * Adds a HTML panel on top of the contents of the GraphComponent that can display arbitrary information about a
 * {@link IModelItem graph element}. In order to not interfere with the positioning of the popup, HTML
 * content should be added as ancestor of the {@link #div div element}, and use relative positioning.
 * This implementation uses a {@link ILabelModelParameter layout parameter} to determine the position of
 * the popup.
 */
export default class NodePopup {
  graphComponent: GraphComponent
  layoutParameter: ILabelModelParameter
  currentItem: INode | null = null
  dirty = false
  div: HTMLDivElement

  /**
   * Creates a new popup.
   */
  constructor(graphComponent: GraphComponent, id: string) {
    this.graphComponent = graphComponent

    const labelModel = new ExteriorLabelModel({ insets: 2 })
    this.layoutParameter = labelModel.createParameter(ExteriorLabelModelPosition.EAST)

    this.div = document.getElementById(id) as HTMLDivElement
    this.div.style.display = 'none'
    this.registerListeners()
  }

  /**
   * Updates the {@link IModelItem item} to display information for.
   * Setting this property to a value other than null shows the popup.
   * Setting the property to null hides the popup.
   * @param item The item whose information is displayed.
   */
  updatePopup(item: INode | null): void {
    if (item === this.currentItem) {
      return
    }
    this.currentItem = item
    if (item !== null) {
      this.updateContent(item)
      this.show()
    } else {
      this.hide()
    }
  }

  /**
   * Registers some listeners to keep the location of the popup updated.
   */
  registerListeners(): void {
    // add listener for viewport changes to set a dirty mark when zooming or panning
    this.graphComponent.addViewportChangedListener(() => {
      if (this.currentItem) {
        this.dirty = true
      }
    })

    // add listener for node bounds changes to set a dirty mark when moving the corresponding node
    this.graphComponent.graph.addNodeLayoutChangedListener((source, node) => {
      if (this.currentItem && this.currentItem === node) {
        this.dirty = true
      }
    })

    // add listener for updates of the visual tree to actually update the location of the popup when needed
    this.graphComponent.addUpdatedVisualListener(() => {
      if (this.currentItem && this.dirty) {
        this.dirty = false
        this.updateLocation()
      }
    })

    // Add close button listener to be able to close the popup by clicking the button
    document.getElementById(`${this.div.id}-closeButton`)!.addEventListener(
      'click',
      () => {
        this.updatePopup(null)
      },
      true
    )
  }

  /**
   * Makes this popup visible near the given item.
   */
  show(): void {
    this.div.style.display = 'block'
    this.updateLocation()
  }

  /**
   * Hides this popup.
   */
  hide(): void {
    this.div.style.display = 'none'
  }

  /**
   * Updates the content of the popup using the information stored in the tag of the given model item.
   * @param item The item from which the information is retrieved.
   */
  updateContent(item: IModelItem): void {
    if (item.tag) {
      const title = this.div.querySelector(`#${this.div.id}-title`)!
      title.innerHTML = `${item.tag.type} Properties`

      const info = this.getInfo(item.tag)
      const content = this.div.querySelector(`#${this.div.id}-content`)!

      const removedElements = []
      for (let i = 0; i < Math.max(info.length, content.childElementCount); i++) {
        if (i < info.length) {
          const data = info[i]
          if (i < content.childElementCount) {
            // there still is an old element => reuse the previous info element
            const element = content.children[i]
            element.firstElementChild!.innerHTML = data[0]
            ;(element.lastElementChild as HTMLOptionElement).value = data[1]
          } else {
            // there are not enough old elements => create a new info element
            const element = document.createElement('div')
            element.setAttribute('class', 'row')
            const column1 = document.createElement('label')
            column1.setAttribute('class', 'col1')
            column1.innerHTML = data[0]
            const column2 = document.createElement('input')
            column2.setAttribute('class', 'col2')
            column2.setAttribute('class', 'wideText')
            column2.setAttribute('type', 'text')
            column2.setAttribute('readonly', 'readonly')
            column2.value = data[1]
            element.appendChild(column1)
            element.appendChild(column2)
            content.appendChild(element)
          }
        } else {
          // there are too many old elements => remove the info element
          removedElements.push(content.children[i])
        }
      }
      removedElements.forEach(element => {
        content.removeChild(element)
      })
    }
  }

  /**
   * Retrieve the information from the tag element.
   * @param tag The tag object from which to retrieve the information.
   * @return An array of arrays with length = 2 which stores a name and a value for each piece of information.
   */
  getInfo(tag: {
    info: string | Record<string, string>
    enter: string[]
    exit: string[]
  }): [string, any][] {
    const info: [string, any][] = []

    // the tag info may consist of a single string or an info object
    if (typeof tag.info === 'string') {
      info.push(['info', tag.info])
    } else {
      for (const key of Object.keys(tag.info)) {
        info.push([key, tag.info[key]])
      }
    }

    // also add enter and exit dates
    const enter = tag.enter.length > 1 ? 'Enter Dates' : 'Enter Date'
    const exit = tag.exit.length > 1 ? 'Exit Dates' : 'Exit Date'
    info.push([enter, tag.enter])
    info.push([exit, tag.exit])

    return info
  }

  /**
   * Changes the location of this popup to the location calculated by the {@link NodePopup#layoutParameter}.
   * Currently, this implementation does not support rotated popups.
   */
  updateLocation(): void {
    if (!this.currentItem && !this.layoutParameter) {
      return
    }

    const width = this.div.clientWidth
    const height = this.div.clientHeight
    const zoom = this.graphComponent.zoom

    const dummyLabel = new SimpleLabel(this.currentItem, '', this.layoutParameter)
    dummyLabel.preferredSize = new Size(width / zoom, height / zoom)
    if (this.layoutParameter.supports(dummyLabel)) {
      dummyLabel.layoutParameter = this.layoutParameter
      const layout = this.layoutParameter.model.getGeometry(dummyLabel, this.layoutParameter)

      // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
      const viewPoint = this.graphComponent.toViewCoordinates(
        new Point(layout.anchorX, layout.anchorY - height / zoom)
      )
      this.div.style.left = `${viewPoint.x}px`
      this.div.style.top = `${viewPoint.y}px`
    }
  }
}
