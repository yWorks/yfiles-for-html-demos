/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { render, html, useState } from './preact-loader.js'
import loadJson from '../../resources/load-json.js'
import { License } from 'yfiles'
import ItemList from './components/items/ItemList.js'
import PreactGraphComponent from './components/graphComponent/PreactGraphComponent.js'

/**
 * @typedef {Object} DataItem
 * @property {number} id
 * @property {boolean} state
 */

/**
 * @typedef {Object} ConnectionItem
 * @property {number} from
 * @property {number} to
 */

/** @type {number} */
let idCount = 6

const App = () => {
  const [items, setItems] = useState([
    { id: 0, state: true },
    { id: 1, state: false },
    { id: 2, state: true },
    { id: 3, state: false },
    { id: 4, state: true },
    { id: 5, state: true }
  ])
  const [connections, setConnections] = useState([
    { from: 0, to: 1 },
    { from: 0, to: 3 },
    { from: 1, to: 2 },
    { from: 3, to: 4 },
    { from: 3, to: 5 }
  ])

  /**
   * Toggle the state property of a specific item.
   */
  const toggleItemState = index => {
    const newItems = [...items]
    newItems[index] = { id: newItems[index].id, state: !newItems[index].state }
    setItems(newItems)
  }

  const removeDataItem = index => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  /**
   * Add a new item and create a connection from a random
   * existing node to the new item.
   */
  const addDataItem = () => {
    const newItems = [...items]
    const id = idCount++
    newItems.push({ id, state: Math.random() > 0.5 })
    setItems(newItems)
    if (newItems.length <= 1) {
      // this is the first item, don't create a connection
      return
    }
    const randomItem = items[Math.floor(Math.random() * items.length)]
    const newConnections = [...connections]
    newConnections.push({ from: randomItem.id, to: id })
    setConnections(newConnections)
  }

  return html` <${PreactGraphComponent} itemData="${items}" connectionData="${connections}" />
    <${ItemList}
      itemData="${items}"
      toggleState="${toggleItemState}"
      removeDataItem="${removeDataItem}"
      addDataItem="${addDataItem}"
    />`
}

/**
 * @param {*} license
 */
function init(license) {
  License.value = license
  render(html` <${App} />`, document.querySelector('.preact-app'))
}
loadJson().then(init)
