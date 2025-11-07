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
import {} from '@yfiles/yfiles'
import { hiddenProperties, isFlowNode, lockedProperties } from '../FlowNode/FlowNode'
import { showErrorDialog } from './showErrorDialog'

export function initializeTagExplorer(graphComponent) {
  // Use selection event instead of currentItemChanged event to be able to clear tag explorer when no item is selected
  graphComponent.selection.addEventListener('item-added', () => {
    try {
      const list = document.getElementById('tags-explorer-list')
      list.innerHTML = ''
      // If current item isn't a node then don't populate tag explorer
      const node = graphComponent.selection.first()
      if (!isFlowNode(node)) {
        return
      }

      populateTagExplorer(node)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error initializing node properties panel'
      showErrorDialog({ title: message, message })
    }
  })

  // Repopulate current tag manager view with updated tags whenever tag is changed by outside source, e.g. undo-redo
  graphComponent.graph.addEventListener('node-tag-changed', (evt) => {
    const graphSelection = graphComponent.selection
    if (graphSelection.nodes.size === 0) {
      return
    }

    const changedNode = evt.item
    const selectedNode = graphSelection.nodes.first()

    if (
      !selectedNode ||
      !changedNode ||
      !isFlowNode(selectedNode) ||
      changedNode !== selectedNode
    ) {
      return
    }

    populateTagExplorer(selectedNode)
  })
}

function populateTagExplorer(selectedNode) {
  const list = document.getElementById('tags-explorer-list')
  list.innerHTML = ''

  const tagKeys = Object.keys(selectedNode.tag)
  tagKeys
    .filter((key) => !hiddenProperties.includes(key))
    .forEach((key) => {
      list.appendChild(
        createTagInputLine({
          name: key,
          initValue: selectedNode.tag[key],
          node: selectedNode,
          validate: selectedNode.tag.validate
        })
      )
    })
}

function createTagInputLine({ name, initValue, node, validate }) {
  const inputName = name
  const label = document.createElement('label')
  label.setAttribute('for', inputName)
  label.className = 'tags-explorer-list-label'
  label.innerHTML = inputName + ':'

  const item = document.createElement('li')
  const input = document.createElement('input')
  input.setAttribute('id', inputName)
  input.setAttribute('type', 'text')
  input.setAttribute('value', initValue)
  if (lockedProperties.includes(name)) {
    input.setAttribute('disabled', 'true')
  }

  input.addEventListener('change', (event) => {
    if (!event.target || !(event instanceof Event) || !(event.target instanceof HTMLInputElement)) {
      return
    }
    const newTags = { ...node.tag, [name]: event.target.value }
    // validate tags on each change of input
    const validation = validate(newTags)
    configureValidationClassOnListItem(item, validation, name)

    node.tag = newTags
  })

  input.className = 'tags-explorer-list-input'
  item.appendChild(label)
  item.appendChild(input)
  item.classList.add('tags-explorer-list-item')
  // validate tags on initial render of input
  const validation = validate(node.tag)
  configureValidationClassOnListItem(item, validation, name)

  return item
}

function configureValidationClassOnListItem(item, validation, name) {
  if (validation.invalidProperties.includes(String(name))) {
    item.classList.add('tags-explorer-list-item__invalid')
  } else {
    item.classList.remove('tags-explorer-list-item__invalid')
  }
}
