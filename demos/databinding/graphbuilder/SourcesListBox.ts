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
import type { SourceDialog } from './EditSourceDialog'
import type { SourceDefinition, SourceDefinitionBuilderConnector } from './ModelClasses'

/**
 * Control containing a list of sub controls for every {link SourceDefinition} added to it
 * The sub controls provide Edit- and Remove- buttons
 */
export class SourcesListBox<
  TSourceConnector extends SourceDefinitionBuilderConnector<SourceDefinition>
> {
  private readonly Factory: (sourceName: string) => TSourceConnector
  private DialogFactory: {
    new (sourceDefinition: TSourceConnector, acceptCallback: () => void): SourceDialog
  }

  private sources: TSourceConnector[]
  private lastSourceIndex: number
  private rootElement: HTMLElement
  private readonly addButton: HTMLButtonElement
  private dataUpdatedCallback: () => void

  /**
   * Sources list box constructor
   * @param factory the arrow function providing an appropriate {@link SourceDefinitionBuilderConnector}
   *        connector via the factory class
   * @param dialogFactory the Node- or Edge- {@link SourceDialog} to use
   * @param rootElement the HTMLElement used to display the list box
   * @param dataUpdatedCallback the callback arrow function used to update the graph after
   *        the SourceDialog was closed as accepted
   */
  constructor(
    factory: (sourceName: string) => TSourceConnector,
    dialogFactory: {
      new (sourceDefinition: TSourceConnector, acceptCallback: () => void): SourceDialog
    },
    rootElement: HTMLElement,
    dataUpdatedCallback: () => void
  ) {
    this.dataUpdatedCallback = dataUpdatedCallback
    this.sources = []
    this.Factory = factory
    this.DialogFactory = dialogFactory
    this.rootElement = rootElement
    this.lastSourceIndex = 1

    this.addButton = document.createElement('button')
    this.addButton.textContent = 'Add Source'
    this.addButton.addEventListener('click', () => this.createDefinition())
    this.rootElement.appendChild(this.addButton)
  }

  /**
   * Event handler for "Add Source" button
   * Generates a new definition via the provided connector Factory
   * and add ist to the list box
   */
  private createDefinition(): TSourceConnector {
    const newDefinition = this.Factory(`Source ${this.lastSourceIndex++}`)
    this.addDefinition(newDefinition)
    return newDefinition
  }

  /**
   * Adds a new definition using the provided {@link SourceDefinitionBuilderConnector} to the list box
   * @param newDefinition the {@link SourceDefinitionBuilderConnector}
   */
  public addDefinition(newDefinition: TSourceConnector): void {
    this.sources.push(newDefinition)

    const container = document.createElement('div')
    container.classList.add('sourceCard')

    const label = document.createElement('span')
    label.textContent = newDefinition.sourceDefinition.name
    label.classList.add('sourceLabel')

    const editButton = document.createElement('button')
    editButton.classList.add('editButton')
    editButton.addEventListener('click', () => {
      void new this.DialogFactory(newDefinition, () => {
        label.textContent = newDefinition.sourceDefinition.name
        this.dataUpdatedCallback()
      }).show()
    })
    editButton.textContent = 'Edit'

    const removeButton = document.createElement('button')
    removeButton.classList.add('removeButton')
    removeButton.addEventListener('click', () => this.removeDefinition(newDefinition, container))
    removeButton.textContent = 'Remove'

    container.appendChild(label)
    container.appendChild(editButton)
    container.appendChild(removeButton)

    this.rootElement.insertBefore(container, this.addButton)
  }

  /**
   * Removes the provided definition from the list box
   * @param definition the {@link SourceDefinitionBuilderConnector}
   * @param container the list box div container
   */
  private removeDefinition(definition: TSourceConnector, container: HTMLDivElement): void {
    // The GraphBuilder does not support removing sources - for simplicity of this demo simply set
    // the data to ""
    definition.reset()
    this.sources.splice(this.sources.indexOf(definition), 1)
    this.rootElement.removeChild(container)
  }
}
