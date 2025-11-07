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
import { HashMap } from '@yfiles/yfiles'
import { createGraphMLEditor, EditorView } from '@yfiles/demo-app/codemirror-editor'

/**
 * This class handles synchronization of the GraphML editor with the view graph.
 * @yjs:keep = setValue,getValue
 */

export class EditorSync {
  itemToIdMap = new HashMap()
  itemToMarkerMap = new HashMap()
  markerToItemMap = new HashMap()
  contentChanged
  cursorActivity
  _editor = null
  _graph = null
  markerField = null
  editorContentChangedListener
  itemSelectedListener
  addMarker
  removeMarker
  ignoreChanges = false

  constructor() {
    this.contentChanged = this.onContentChanged.bind(this)
    this.cursorActivity = this.onCursorActivity.bind(this)
    this.editorContentChangedListener = () => {}
    this.itemSelectedListener = () => {}
  }

  /**
   * Dispatched when the GraphML content has been modified by the used.
   */
  addEditorContentChangedListener(listener) {
    this.editorContentChangedListener = listener
  }

  /**
   * Dispatched when the GraphML content has been modified by the used.
   */
  removeEditorContentChangedListener() {
    this.editorContentChangedListener = () => {}
  }

  /**
   * Dispatched when the GraphML representation of a graph item has been selected in the editor.
   */
  setItemSelectedListener(listener) {
    this.itemSelectedListener = listener
  }

  /**
   * Dispatched when the GraphML representation of a graph item has been selected in the editor.
   */
  removeItemSelectedListener() {
    this.itemSelectedListener = () => {}
  }

  hasValidText() {
    const outputText = document.querySelector('#outputText')
    if (outputText) {
      return !(outputText.textContent && outputText.textContent.length > 1)
    }
    return true
  }

  /**
   * Initializes the graph and text editor.
   */

  initialize(masterGraph) {
    this._graph = masterGraph

    const textArea = document.querySelector('#editorContainer')

    const { editor, markerField, addMarker, removeMarker } = createGraphMLEditor(
      textArea,
      (update) => this.contentChanged(update),
      (update) => this.cursorActivity(update)
    )

    this.addMarker = addMarker
    this.removeMarker = removeMarker
    this.markerField = markerField
    this._editor = editor
  }

  /**
   * generate a marker with the supplied parameters
   */
  addMarkerWrapper(from, to, id, item, cssClass = '', scrollToView = false) {
    const effects = [this.addMarker.of({ from: from, to: to, className: cssClass, id: id })]
    if (scrollToView) {
      effects.push(EditorView.scrollIntoView(from, { y: 'start' }))
    }
    this.editor.dispatch({ effects: effects })

    const newMarker = this.editor.state.field(this.markerField).markers.get(id)
    this.itemToMarkerMap.set(item, newMarker)
    this.markerToItemMap.set(newMarker, item)

    return newMarker
  }

  /**
   * The editor content has been edited: dispatch an event that notifies the view, and update the markers.
   */
  onContentChanged(update) {
    if (this.ignoreChanges) {
      return
    }

    const value = update.state.doc.toString()
    this.editorContentChangedListener({ value })
    this.onCursorActivity(update)
  }

  /**
   * The graph has been modified interactively in the view:
   * replace the editor content with the updated GraphML representation, and update the editor markers.
   */
  onGraphModified(event) {
    // don't fire changes while replacing the content
    this.ignoreChanges = true
    this.editor.dispatch({
      changes: { from: 0, to: this.editor.state.doc.length, insert: event.graphml }
    })
    setOutput('')
    this.ignoreChanges = false
    this.setMarkers()
    this.onItemSelected(event.selectedItem)
  }

  /**
   * Display GraphML errors in a HTML div element.
   */
  onGraphMLError(ex) {
    setOutput(ex.message)
  }

  /**
   * The GraphML has been parsed successfully: update markers
   */
  onGraphMLParsed() {
    this.setMarkers()
    // clear text in output area
    setOutput('')
  }

  /**
   * Called when a document has been parsed.
   */
  onParsed(_args) {
    // clear text in output area
    setOutput('')
  }

  getMarkersAt(view, pos) {
    const found = []
    const state = view.state.field(this.markerField)

    // Get the line start and end positions

    state.markers.forEach((marker) => {
      if (marker.from <= pos && marker.to >= pos) {
        found.push(marker)
      }
    })

    return found
  }

  /**
   * When the editor cursor is moved, see if we can identify a graph item representation
   * at the current cursor position.
   */
  onCursorActivity(update) {
    const cursor = update.state.selection.main.head
    const markers = this.getMarkersAt(this.editor, cursor)
    if (markers[0]) {
      const marker = getInnermostMarker(cursor, markers)
      const item = this.markerToItemMap.get(marker)
      this.itemSelectedListener({ item })
    }
  }

  /**
   * Map editor markers to graph items.
   */
  setMarkers() {
    this.itemToMarkerMap.values.forEach((marker) => {
      if (marker) {
        this.editor.dispatch({ effects: this.removeMarker.of(marker.id) })
      }
    })
    this.itemToMarkerMap.clear()
    this.markerToItemMap.clear()

    const editorText = this.editor.state.doc.toString()

    const graph = this._graph
    graph.nodes.forEach((node) => {
      this.setMarkersForItem(node, 'node', editorText)
    })
    graph.edges.forEach((edge) => {
      this.setMarkersForItem(edge, 'edge', editorText)
    })
  }

  /**
   * Identify corresponding node/edge and label snippets for the provided item.
   * @param item A node or edge
   * @param tagName "node" or "edge"
   * @param editorText The GraphML text shown in the editor
   */
  setMarkersForItem(item, tagName, editorText) {
    // The internal GraphML ID for the item (determined during GraphML parsing/writing)
    const itemId = this.itemToIdMap.get(item)

    // Find the <node> or <edge> start tag
    const regexpStr = `<${tagName}.*?id="${itemId}".*?>`
    const regexp = new RegExp(regexpStr, 'i')
    const matches = regexp.exec(editorText)
    if (!matches) {
      return
    }

    // set an editor marker with the corresponding start and end indices
    const startIndex = editorText.indexOf(matches[0], 0)
    const endIndex = findMatchingTag(editorText, startIndex, tagName)
    this.addMarkerWrapper(startIndex, endIndex, itemId ?? '', item)

    //
    // Find Label markers (labels are not part of the core GraphML standard and have no individual IDs).
    //
    // Identifying the correct set of <y:Label> elements is tedious, because <nodes> can contain nested
    // <graphs> and styles that also contain <y:Label> elements.
    //

    // The full GraphML representation of the label owner
    const labelOwnerText = editorText.substring(startIndex, endIndex)

    // If there is a nested <graph> section, we remove it for further matching,
    // so we find only labels belonging to the correct item.
    const nestedGraphRegExp = new RegExp('<graph(.|\\n)*<\\/graph>', '')
    const nestedGraphMatch = nestedGraphRegExp.exec(labelOwnerText)
    let nestedGraphStartIndex = 0
    let nestedGraphMatchLength = 0
    let labelOwnerTextWithoutNesting = labelOwnerText
    if (nestedGraphMatch) {
      nestedGraphStartIndex = labelOwnerText.indexOf(nestedGraphMatch[0], 0)
      if (nestedGraphStartIndex >= 0) {
        labelOwnerTextWithoutNesting = labelOwnerText.replace(nestedGraphMatch[0], '')
        nestedGraphMatchLength = nestedGraphMatch[0].length
      }
    }
    // Find the whole label data section (so we don't match other nested <y:Label> elements (e.g. inside of a
    // TableNodeStyle)
    const labelDataRegExp = new RegExp(
      '<data.*>(?:\\s|\\n)*?<x:List>(?:\\s|\\n)*(<y:Label.*>(?:\\n|.)*?<\\/y:Label>)*(?:\\s|\\n)*<\\/x:List>(?:\\s|\\n)*<\\/data>',
      'gi'
    )
    const labelDataMatch = labelOwnerTextWithoutNesting?.match(labelDataRegExp)

    if (labelDataMatch) {
      const labelData = labelDataMatch[0]

      // Finally, find the individual <y:Label> elements
      const labelRegExp = new RegExp('<y:Label.*>(?:\\n|.)*?<\\/y:Label>', 'gi')

      let labelMatches = labelRegExp.exec(labelData)
      let labelIndex = 0
      while (labelMatches) {
        const labelItem = item.labels.get(labelIndex)
        const labelText = labelMatches[0]

        let labelStartIndex = labelOwnerTextWithoutNesting.indexOf(labelText)
        // If we removed a nested graph, we have to consider this for the marker index
        if (nestedGraphMatch && labelStartIndex > nestedGraphStartIndex) {
          // label element after nested graph: increase index
          labelStartIndex += nestedGraphMatchLength
        }
        labelStartIndex += startIndex
        const labelEndIndex = labelStartIndex + labelText.length
        this.addMarkerWrapper(labelStartIndex, labelEndIndex, labelText, labelItem)

        labelIndex++
        labelMatches = labelRegExp.exec(labelData)
      }
    }
  }

  /**
   * The user has selected a view item: identify the corresponding editor section and highlight it.
   */
  onItemSelected(masterItem) {
    if (masterItem && this.itemToMarkerMap.has(masterItem)) {
      const options = { className: 'text-highlight' }
      this.replaceMarker(masterItem, options)
    }
  }

  /**
   * Unhighlight a deselected item by providing null-options to {@link replaceMarker}.
   */
  onItemDeselected(masterItem) {
    this.replaceMarker(masterItem, {})
  }

  /**
   * Update a marker with the provided options (e.g. CSS class)
   */
  replaceMarker(masterItem, options) {
    if (masterItem !== null && this.itemToMarkerMap.has(masterItem)) {
      const oldMarker = this.itemToMarkerMap.get(masterItem)
      if (typeof oldMarker !== 'undefined') {
        this.markerToItemMap.delete(oldMarker)
        this.editor.dispatch({ effects: this.removeMarker.of(oldMarker.id) })
        return this.addMarkerWrapper(
          oldMarker.from,
          oldMarker.to,
          oldMarker.id,
          masterItem,
          options.className,
          true
        )
      }
    }
    return null
  }

  get editor() {
    return this._editor
  }
}

/**
 * Find the shortest marker (text index pair) that spans the provided position.
 */
function getInnermostMarker(position, markers) {
  let inner = markers[0]
  let innerPos = inner
  for (let i = 1; i < markers.length; i++) {
    const marker = markers[i]
    const markerPos = marker
    if ((markerPos.from | 0) > (innerPos.from | 0) && (position | 0) > (markerPos.from | 0)) {
      inner = marker
      innerPos = markerPos
    }
  }
  return inner
}

/**
 * Finds a matching closing tag for a provided start tag (at the appropriate nesting depth).
 * @returns The index of the match
 */
function findMatchingTag(str, startIndex, tagName) {
  const regExp = new RegExp(`<${tagName}.*>|</${tagName}>`, 'gi')
  const substr = str.substring(startIndex)
  let matches = regExp.exec(substr)
  let depth = 0
  while (matches) {
    depth = matches[0].indexOf(`<${tagName}`) === 0 ? depth + 1 : depth - 1
    if (depth === 0) {
      break
    }
    matches = regExp.exec(substr)
  }
  return regExp.lastIndex + startIndex
}

function setOutput(text) {
  const outputText = document.querySelector('#outputText')
  outputText.textContent = text
}
