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
import { MarkupLabelStyle, TextEditorInputMode } from '@yfiles/yfiles'
import Quill from 'quill'

// Quill snow theme
import 'quill/dist/quill.snow.css'

/**
 * A custom {@link TextEditorInputMode} which utilizes Quill to provide a WYSIWYG text editor that
 * allows to easily create labels with the {@link MarkupLabelStyle}.
 */
export class RichTextEditorInputMode extends TextEditorInputMode {
  private quill: Quill

  /**
   * Wire up Quill with the {@link TextEditorInputMode.editorText}.
   * @yjs:keep = root
   */
  get editorText(): string {
    return this.quill.getSemanticHTML()
  }

  /**
   * Wire up Quill with the {@link TextEditorInputMode.editorText}.
   * @yjs:keep = root
   */
  set editorText(value: string) {
    this.quill.setContents([])
    this.quill.root.innerHTML = value
  }

  /**
   * Creates a new instance of the {@link RichTextEditorInputMode} which utilizes Quill to provide a WYSIWYG text editor that
   * allows to easily create labels with the {@link MarkupLabelStyle}.
   * @yjs:keep = theme,handlers
   */
  constructor() {
    const container = RichTextEditorInputMode.initializeQuillContainer()
    super(container)

    // initialize Quill in the editor container
    this.quill = new Quill(container.firstElementChild as HTMLElement, {
      theme: 'snow',
      modules: {
        keyboard: {
          bindings: {
            cancelEdit: {
              key: 'Escape',
              handler: () => {
                this.cancel()
              }
            },
            stopEdit: {
              key: 'Enter',
              shortKey: true,
              handler: () => {
                this.tryStop()
              }
            }
          }
        },
        toolbar: {
          container: [
            [{ header: [1, 2, 3, 4, 5, false] }],
            [{ color: [] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['clean']
          ]
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
    ;[
      'mousedown',
      'mouseup',
      'mouseout',
      'mousemove',
      'mouseover',
      'click',
      'touchstart',
      'touchend',
      'touchmove',
      'pointerup',
      'pointerdown',
      'pointermove'
    ].forEach((event) => {
      container.addEventListener(event, (container) => container.stopPropagation(), {
        passive: false
      })
    })
    return container
  }
}
