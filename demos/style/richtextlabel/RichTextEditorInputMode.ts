/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
import { MarkupLabelStyle, TextEditorInputMode } from 'yfiles'

/**
 * A custom {@link TextEditorInputMode} which utilizes Quill to provide a WYSIWYG text editor that
 * allows to easily create labels with the {@link MarkupLabelStyle}.
 */
export class RichTextEditorInputMode extends TextEditorInputMode {
  private quill: any

  /**
   * Wire up Quill with the {@link TextEditorInputMode#editorText}.
   * @yjs:keep=root
   */
  // @ts-ignore
  get editorText(): string {
    return this.quill.root.innerHTML
  }

  /**
   * Wire up Quill with the {@link TextEditorInputMode#editorText}.
   * @yjs:keep=root
   */
  set editorText(value: string) {
    this.quill.setContents([])
    this.quill.root.innerHTML = value
  }

  /**
   * Creates a new instance of the {@link RichTextEditorInputMode} which utilizes Quill to provide a WYSIWYG text editor that
   * allows to easily create labels with the {@link MarkupLabelStyle}.
   */
  constructor() {
    const container = RichTextEditorInputMode.initializeQuillContainer()
    super(container)

    // initialize Quill in the editor container
    this.quill = new Quill(container.firstElementChild, {
      theme: 'snow',
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, 4, 5, false] }],
            [{ size: ['normal', 'small', 'large'] }],
            [{ color: [] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['code-block', 'clean']
          ],
          handlers: {
            // a custom Quill handler that utilizes <small> and <large> tags for the size dropdown
            size: (value: string): void => {
              const range = this.quill.getSelection()
              if (range && range.length > 0) {
                if (value === 'small') {
                  this.quill.removeFormat(range, 'large', true)
                  this.quill.formatText(range, 'small', true)
                } else if (value === 'large') {
                  this.quill.removeFormat(range, 'small', true)
                  this.quill.formatText(range, 'large', true)
                } else {
                  this.quill.removeFormat(range, 'small', true)
                  this.quill.removeFormat(range, 'large', true)
                }
              }
            }
          }
        }
      }
    })

    // edits should not be discarded when the editor is closed due to focus lost
    this.autoCommitOnFocusLost = true
  }

  /**
   * Select the content in the Quill editor when the editor is opened.
   */
  installTextBox(): void {
    super.installTextBox()
    setTimeout(() => this.quill.setSelection(0, Number.POSITIVE_INFINITY), 0)
  }

  /**
   * Initializes an {@link HTMLDivElement} in which Quill can be
   */
  private static initializeQuillContainer(): HTMLDivElement {
    const container = document.createElement('div')
    container.style.backgroundColor = 'white'
    container.style.position = 'absolute'
    container.style.maxWidth = '800px'
    container.tabIndex = -1
    container.appendChild(document.createElement('div'))

    // stop propagation on the events of the editor container, otherwise the GraphComponent gains
    // focus when clicking elements in the editor and thus close the editor box.
    container.addEventListener('mousedown', e => e.stopPropagation(), false)
    container.addEventListener('mouseup', e => e.stopPropagation(), false)
    container.addEventListener('mouseout', e => e.stopPropagation(), false)
    container.addEventListener('mousemove', e => e.stopPropagation(), false)
    container.addEventListener('mouseover', e => e.stopPropagation(), false)
    container.addEventListener('click', e => e.stopPropagation(), false)
    return container
  }
}

// Globally loaded Quill
declare const Quill: any

// We define some custom elements '<small>' and '<large>' for the MarkupLabelStyle and use them in Quill
const Inline = Quill.import('blots/inline')

/**
 * The <small> element for usage in Quill.
 */
export class SmallBlock extends Inline {}
SmallBlock.blotName = 'small'
SmallBlock.tagName = 'small'

/**
 * The <large> element for usage in Quill.js.
 */
export class LargeBlock extends Inline {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static create() {
    const node = super.create()
    node.setAttribute('style', 'font-size: 1.5em')
    return node
  }
}
LargeBlock.blotName = 'large'
LargeBlock.tagName = 'large'

// Make the custom elements available in Quill
Quill.register(SmallBlock)
Quill.register(LargeBlock)
