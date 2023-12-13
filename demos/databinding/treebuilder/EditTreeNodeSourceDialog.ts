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
import * as CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/dialog/dialog'

import type { TreeNodesSourceDefinitionBuilderConnector } from './ModelClasses'

/**
 * Editing dialog for schema graph nodes business data ({@link TreeNodesSourceDefinition}
 */
export class EditTreeNodesSourceDialog {
  private dialogContainerModal: HTMLDivElement
  private dialogContainer: HTMLDivElement
  private readonly acceptCallback: () => void

  private readonly nodesSourceConnector: TreeNodesSourceDefinitionBuilderConnector

  private dataEditor: any
  private idBindingInput?: HTMLInputElement
  private templateEditor: any
  private nameInput?: HTMLInputElement

  /**
   * Constructor for EditTreeNodesSourceDialog
   * @param nodesSourceConnector the connector providing the business data
   * @param acceptCallback the callback to call on accept (for updating the graph)
   */
  constructor(
    nodesSourceConnector: TreeNodesSourceDefinitionBuilderConnector,
    acceptCallback: () => void
  ) {
    this.acceptCallback = acceptCallback
    this.dialogContainerModal = document.querySelector<HTMLDivElement>('#editSourceDialogModal')!
    this.dialogContainer = document.querySelector<HTMLDivElement>('#editSourceDialog')!
    this.nodesSourceConnector = nodesSourceConnector
  }

  /**
   * Creates the input fields for the dialog and initializes them with the {@link SourceDefinition}s
   * business data
   */
  private initialize(): void {
    this.createHeading('Edit Nodes Source')

    this.nameInput = this.createInputField('Name', 'The name of the nodes source.')

    this.dataEditor = this.createEditorField(
      'Data',
      'The nodes business data in JSON format. Either an array of node objects or an object' +
        ' with strings as keys and node objects as values. If any data is provided, this source is ' +
        'automatically considered a root nodes source.',
      { name: 'javascript', json: true }
    )

    this.idBindingInput = this.createInputField(
      'ID Binding',
      'ID binding as string or function definition.'
    )
    this.templateEditor = this.createEditorField(
      'Template',
      'Defines the SVG template that is used to visualize a node. This may contain dynamic' +
        ' bindings as demonstrated in the samples that allow visualizing arbitrary properties of the node' +
        ' business data, such as the name or id properties.',
      'xml'
    )

    this.nameInput.value = this.nodesSourceConnector.sourceDefinition.name
    this.dataEditor.setValue(this.nodesSourceConnector.sourceDefinition.data || '')
    this.idBindingInput.value = this.nodesSourceConnector.sourceDefinition.idBinding
    this.templateEditor.setValue(this.nodesSourceConnector.sourceDefinition.template)
  }

  /**
   * Applies edited values to the {@link SourceDefinition}, recreates bindings
   * and calls the provided accept callback
   */
  accept(): void {
    this.nodesSourceConnector.sourceDefinition.name = this.nameInput!.value
    this.nodesSourceConnector.sourceDefinition.idBinding = this.idBindingInput!.value
    this.nodesSourceConnector.sourceDefinition.template = this.templateEditor.getValue()
    this.nodesSourceConnector.sourceDefinition.data = this.dataEditor.getValue()

    try {
      this.nodesSourceConnector.applyDefinition()

      this.dispose()
      this.acceptCallback()
    } catch (e) {
      alert(e)
    }
  }

  /**
   * Sets the dialog's div to visible and adds the accept and cancel buttons
   */
  async show(): Promise<void> {
    // CodeMirror requires the textArea to be in the DOM and visible already when instantiating
    this.dialogContainerModal.style.removeProperty('display')

    return new Promise((resolve) => {
      setTimeout(() => {
        this.initialize()

        const buttonsContainer = document.createElement('div')
        buttonsContainer.classList.add('buttonsContainer')

        const cancelButton = document.createElement('button')
        cancelButton.textContent = 'Cancel'
        cancelButton.addEventListener('click', () => this.cancel())
        buttonsContainer.appendChild(cancelButton)

        const acceptButton = document.createElement('button')
        acceptButton.textContent = 'Accept and Update'
        acceptButton.addEventListener('click', () => this.accept())
        buttonsContainer.appendChild(acceptButton)

        this.dialogContainer.appendChild(buttonsContainer)

        resolve()
      })
    })
  }

  /**
   * discards/ignores entered/changed data and disposes the dialog
   */
  private cancel(): void {
    this.dispose()
  }

  /**
   * Disposes the dialog by removing all children and setting the display property accordingly
   */
  private dispose(): void {
    while (this.dialogContainer.lastChild) {
      this.dialogContainer.removeChild(this.dialogContainer.lastChild)
    }
    this.dialogContainerModal.style.setProperty('display', 'none')
  }

  /**
   * creates a simple HTMLHeadingElement
   * @param text the text used in the heading
   */
  private createHeading(text: string): HTMLHeadingElement {
    const heading = document.createElement('h2')
    heading.textContent = text
    this.dialogContainer.appendChild(heading)
    return heading
  }

  /**
   * creates a simple HTMLInputElement adorned with heading and documentation
   * @param labelText the heading text for the input
   * @param doc the documentation text. Can be longer as it is rendered as a HTML paragraph
   */
  private createInputField(labelText: string, doc: string): HTMLInputElement {
    const label = this.createDescription(labelText, doc)
    const input = document.createElement('input')
    input.setAttribute('type', 'text')
    label.appendChild(input)
    return input
  }

  /**
   * creates an CodeMirror text/code input field component adorned with heading and documentation
   * @param labelText the heading label
   * @param doc the documentation text. Can be longer as it is rendered as a HTML paragraph
   * @param mode the language syntax configuration object for CodeMirror
   */
  private createEditorField(
    labelText: string,
    doc: string,
    mode: string | object
  ): CodeMirror.EditorFromTextArea {
    const container = this.createDescription(labelText, doc)
    const textArea = document.createElement('textarea')
    container.appendChild(textArea)
    return CodeMirror.fromTextArea(textArea, {
      lineNumbers: true,
      mode: mode
    } as any)
  }

  /**
   * Creates a HTMLDivElement containing a heading and a documentation paragraph
   * @param labelText the heading text
   * @param doc the documentation text. Can be longer as it is rendered as a HTML paragraph
   */
  private createDescription(labelText: string, doc: string): HTMLDivElement {
    const container = document.createElement('div')
    const label = document.createElement('h3')
    label.textContent = labelText
    container.appendChild(label)

    const docParagraph = document.createElement('p')
    docParagraph.textContent = doc
    container.appendChild(docParagraph)

    this.dialogContainer.appendChild(container)

    return container
  }
}
