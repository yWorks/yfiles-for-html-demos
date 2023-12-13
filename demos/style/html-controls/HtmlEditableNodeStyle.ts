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
import {
  type GraphComponent,
  HtmlVisual,
  ICommand,
  type INode,
  type IRenderContext,
  NodeStyleBase,
  type TypedHtmlVisual
} from 'yfiles'
import { avatars, statusValues, type UserData } from './data'

const avatarImages = avatars
  .map((path) => `<img class='editable-node-style__avatar-select-image' src="${path}">`)
  .join('')

type HtmlEditableNodeStyleVisual = TypedHtmlVisual<HTMLDivElement>

/**
 * A custom HTML-based node style that uses both native HTML input elements and a custom
 * image selection grid to enable interactive editing of the node data.
 * The elements are styled using the CSS rules in styles.css
 */
export class HtmlEditableNodeStyle extends NodeStyleBase<HtmlEditableNodeStyleVisual> {
  protected createVisual(context: IRenderContext, node: INode): HtmlEditableNodeStyleVisual {
    const doc = context.canvasComponent!.div.ownerDocument
    const div = doc.createElement('div')
    div.classList.add('html-style')
    const visual = HtmlVisual.from(div)
    HtmlVisual.setLayout(div, node.layout)
    this.createContent(context, div, node)
    return visual
  }

  protected updateVisual(
    context: IRenderContext,
    oldVisual: HtmlEditableNodeStyleVisual,
    node: INode
  ): HtmlEditableNodeStyleVisual {
    HtmlVisual.setLayout(oldVisual.element, node.layout)
    return oldVisual
  }

  /**
   * We only have to implement createContent() for this use case.
   * The base style takes care of updating the position of the container element in updateVisual().
   */
  protected createContent(context: IRenderContext, element: HTMLDivElement, node: INode): void {
    const data = node.tag as UserData

    const statusOptions = statusValues.map(
      (status) => `<option${status === data.status ? ' selected' : ''}>${status}</option>`
    )

    element.innerHTML = `
      <div class='editable-node-style'>
        <form class='editable-node-style__form'>
          <div class='editable-node-style__top'>
            <div class='editable-node-style__avatar'>
              <img class='editable-node-style__avatar-image' src='${data.avatar}'>
              <div class='editable-node-style__avatar-select'>
                ${avatarImages}
              </div>
            </div>
            <div class='editable-node-style__details'>
              <div class='editable-node-style__header'>
                <div class='editable-node-style__status-light'></div>
                <div contenteditable='true' class='editable-node-style__input editable-node-style__name'>${data.name}</div>
              </div>
              <label>Since</label>
              <input class='editable-node-style__input editable-node-style__since' type='date' value='${data.since}' >
              <label>Status</Label>
              <select class='editable-node-style__input editable-node-style__status'>${statusOptions}</select>
            </div>
          </div>
         <div class='editable-node-style__description-container'>
           <textarea class='editable-node-style__input editable-node-style__description'>${data.description}</textarea>
         </div>
         <input disabled class='editable-node-style__input editable-node-style__submit' type='submit' value='Apply'>
       </form>
      </div>
    `

    setStatusClass(element.firstElementChild!, data)

    const inputs = element.querySelectorAll<HTMLInputElement>('.editable-node-style__input')
    const submit = element.querySelector<HTMLInputElement>('.editable-node-style__submit')!
    const form = element.querySelector<HTMLFormElement>('.editable-node-style__form')!
    const avatar = element.querySelector<HTMLFormElement>('.editable-node-style__avatar')!
    const name = element.querySelector<HTMLInputElement>('.editable-node-style__name')!
    const avatarImage = element.querySelector<HTMLImageElement>(
      '.editable-node-style__avatar-image'
    )!
    const avatarSelectImages = element.querySelectorAll<HTMLImageElement>(
      '.editable-node-style__avatar-select-image'
    )!

    function toggleAvatarSelecting(): void {
      avatar.classList.toggle('editable-node-style__avatar-selecting')
    }

    avatarImage.addEventListener('click', toggleAvatarSelecting, { capture: true })
    for (const selectImg of avatarSelectImages) {
      selectImg.addEventListener(
        'click',
        function () {
          avatarImage.src = this.src
          submit.disabled = false
          toggleAvatarSelecting()
        },
        { capture: true }
      )
    }

    for (const input of [...inputs, avatarImage, ...avatarSelectImages]) {
      // Show the submit-button as soon as the content was edited
      input.addEventListener('input', function () {
        submit.disabled = false
      })
      // prevent yFiles from handling events we need for the form elements
      preventPropagation(input)
    }
    form.addEventListener('submit', (evt) => {
      const since = element.querySelector<HTMLInputElement>('.editable-node-style__since')!.value
      const status = element.querySelector<HTMLSelectElement>('.editable-node-style__status')!.value
      const description = element.querySelector<HTMLTextAreaElement>(
        '.editable-node-style__description'
      )!.value
      data.avatar = avatarImage.src
      data.name = name.innerText
      data.since = since
      data.status = status as (typeof statusValues)[number]
      data.description = description

      submit.disabled = true

      // Select the node (re-selecting it if necessary) to cause the node data view to update
      const graphComponent = context.canvasComponent as GraphComponent
      ICommand.DESELECT_ALL.execute(null, graphComponent)
      ICommand.SELECT_ITEM.execute(node, graphComponent)

      setStatusClass(element.firstElementChild!, data)
      evt.preventDefault()
    })
  }
}

function setStatusClass(element: Element, data: UserData): void {
  for (const status of statusValues) {
    const className = `editable-node-style--${status}`
    if (status !== data.status) {
      element.classList.remove(className)
    } else {
      element.classList.add(className)
    }
  }
}

function stopPropagation(e: Event): void {
  e.stopPropagation()
}

function preventPropagation(element: HTMLElement): void {
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
    element.addEventListener(eventName, stopPropagation)
  }
}

function extractName(path: string): string {
  return path.substring(path.lastIndexOf('_') + 1, path.lastIndexOf('.'))
}
