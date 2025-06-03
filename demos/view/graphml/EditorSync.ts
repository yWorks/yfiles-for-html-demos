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
import { HashMap, IGraph, ILabelOwner, IModelItem, ParseEventArgs } from '@yfiles/yfiles'
import { EditorState, StateEffect, StateEffectType, StateField } from '@codemirror/state'
import { Decoration, type DecorationSet, ViewUpdate } from '@codemirror/view'
import { basicSetup, EditorView } from 'codemirror'
import { xml } from '@codemirror/lang-xml'
import { lintGutter } from '@codemirror/lint'
import { getXmlLinter } from '@yfiles/demo-resources/codeMirrorLinters'

type Marker = {
  from: number
  to: number
  className?: string
  id: string
}

const xmlLinter = getXmlLinter()

/**
 * This class handles synchronization of the GraphML editor with the view graph.
 * @yjs:keep = setValue,getValue
 */

export class EditorSync {
  public readonly itemToIdMap: HashMap<IModelItem, string> = new HashMap()
  private readonly itemToMarkerMap: HashMap<IModelItem, Marker> = new HashMap()
  private readonly markerToItemMap: HashMap<Marker, IModelItem> = new HashMap()
  private readonly contentChanged: (update: ViewUpdate) => void
  private readonly cursorActivity: (update: ViewUpdate) => void
  private _editor: EditorView | null = null
  private _graph: IGraph | null = null
  private markerField: StateField<{
    decorations: DecorationSet
    markers: Map<string, Marker>
  }> | null = null
  private editorContentChangedListener: (evt: { value: string }) => void
  private itemSelectedListener: (evt: { item: IModelItem }) => void
  private addMarker: StateEffectType<Marker> | undefined
  private removeMarker: StateEffectType<string> | undefined

  constructor() {
    this.contentChanged = this.onContentChanged.bind(this)
    this.cursorActivity = this.onCursorActivity.bind(this)
    this.editorContentChangedListener = () => {}
    this.itemSelectedListener = () => {}
  }

  /**
   * Dispatched when the GraphML content has been modified by the used.
   */
  addEditorContentChangedListener(listener: (evt: { value: string }) => void): void {
    this.editorContentChangedListener = listener
  }

  /**
   * Dispatched when the GraphML content has been modified by the used.
   */
  removeEditorContentChangedListener(): void {
    this.editorContentChangedListener = () => {}
  }

  /**
   * Dispatched when the GraphML representation of a graph item has been selected in the editor.
   */
  setItemSelectedListener(listener: (evt: { item: IModelItem }) => void): void {
    this.itemSelectedListener = listener
  }

  /**
   * Dispatched when the GraphML representation of a graph item has been selected in the editor.
   */
  removeItemSelectedListener(): void {
    this.itemSelectedListener = () => {}
  }

  /**
   * Initializes the graph and text editor.
   */

  initialize(masterGraph: IGraph): void {
    this._graph = masterGraph

    const addMarker = StateEffect.define<Marker>()
    this.addMarker = addMarker
    const removeMarker = StateEffect.define<string>()
    this.removeMarker = removeMarker

    this.markerField = StateField.define<{
      decorations: DecorationSet
      markers: Map<string, Marker>
    }>({
      create() {
        return {
          decorations: Decoration.none,
          markers: new Map()
        }
      },
      update(value, tr) {
        let { decorations, markers } = value
        decorations = decorations.map(tr.changes)

        for (let e of tr.effects) {
          if (e.is<Marker>(addMarker)) {
            const marker = e.value
            decorations = decorations.update({
              add: [
                Decoration.mark({
                  class: marker.className
                }).range(marker.from, marker.to)
              ]
            })
            markers.set(marker.id, marker)
          } else if (e.is<string>(removeMarker)) {
            const markerId = e.value
            const marker = markers.get(markerId)
            if (marker) {
              decorations = decorations.update({
                filter: (from, to) => !(from === marker.from && to === marker.to)
              })
              markers.delete(marker.id)
            }
          }
        }
        return { decorations, markers }
      },
      provide: (f) => EditorView.decorations.from(f, (value) => value.decorations)
    })

    const textArea = document.querySelector('#editorContainer') as HTMLTextAreaElement

    const startState = EditorState.create({
      doc: textArea.value,
      extensions: [
        basicSetup,
        this.markerField,
        xml(),
        xmlLinter,
        lintGutter(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            this.contentChanged(update)
          }
        }),
        EditorView.updateListener.of((update) => {
          if (update.selectionSet) {
            this.cursorActivity(update)
          }
        })
      ]
    })
    this._editor = new EditorView({
      parent: textArea,
      state: startState
    })
  }

  /**
   * generate a marker with the supplied parameters
   */

  private addMarkerWrapper(
    from: number,
    to: number,
    id: string,
    item: IModelItem,
    cssClass = '',
    scrollToView = false
  ): Marker {
    const effects: StateEffect<unknown>[] = [
      this.addMarker!.of({
        from: from,
        to: to,
        className: cssClass,
        id: id
      })
    ]
    if (scrollToView) {
      effects.push(EditorView.scrollIntoView(from, { y: 'start' }))
    }
    this.editor.dispatch({
      effects: effects
    })

    const newMarker = this.editor.state.field(this.markerField!).markers.get(id)!
    this.itemToMarkerMap.set(item, newMarker)
    this.markerToItemMap.set(newMarker, item)

    return newMarker
  }

  /**
   * The editor content has been edited: dispatch an event that notifies the view, and update the markers.
   */
  private onContentChanged(update: ViewUpdate): void {
    const value = update.state.doc.toString()
    this.editorContentChangedListener({ value })
    this.onCursorActivity(update)
  }

  /**
   * The graph has been modified interactively in the view:
   * replace the editor content with the updated GraphML representation, and update the editor markers.
   */
  onGraphModified(event: { graphml: string; selectedItem: IModelItem | null }): void {
    // don't fire changes while replacing the content
    this.editor.dispatch({
      changes: {
        from: 0,
        to: this.editor.state.doc.length,
        insert: event.graphml
      }
    })
    setOutput('')
    this.setMarkers()
    this.onItemSelected(event.selectedItem)
  }

  /**
   * Display GraphML errors in a HTML div element.
   */
  onGraphMLError(ex: Error): void {
    setOutput(ex.message)
  }

  /**
   * The GraphML has been parsed successfully: update markers
   */
  onGraphMLParsed(): void {
    this.setMarkers()
    // clear text in output area
    setOutput('')
  }

  /**
   * Called when a document has been parsed.
   */
  onParsed(args: ParseEventArgs): void {
    // clear text in output area
    setOutput('')
  }

  private getMarkersAt(view: EditorView, pos: number): Marker[] {
    const found: Marker[] = []
    const state = view.state.field(this.markerField!)

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
  private onCursorActivity(update: ViewUpdate): void {
    const cursor = update.state.selection.main.head
    const markers = this.getMarkersAt(this.editor, cursor)
    if (markers[0]) {
      const marker = getInnermostMarker(cursor, markers)
      const item = this.markerToItemMap.get(marker)!
      this.itemSelectedListener({ item })
    }
  }

  /**
   * Map editor markers to graph items.
   */
  private setMarkers(): void {
    this.itemToMarkerMap.values.forEach((marker) => {
      this.editor.dispatch({
        effects: this.removeMarker!.of(marker.id)
      })
    })
    this.itemToMarkerMap.clear()
    this.markerToItemMap.clear()

    const editorText = this.editor.state.doc.toString()

    const graph = this._graph!
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
  private setMarkersForItem(item: ILabelOwner, tagName: string, editorText: string): void {
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
    let labelOwnerTextWithoutNesting: string = labelOwnerText
    if (nestedGraphMatch) {
      nestedGraphStartIndex = labelOwnerText.indexOf(nestedGraphMatch[0], 0)
      labelOwnerTextWithoutNesting = labelOwnerText.replace(nestedGraphMatch[0], '')
      nestedGraphMatchLength = nestedGraphMatch[0].length
    }
    // Find the whole label data section (so we don't match other nested <y:Label> elements (e.g. inside of a
    // TableNodeStyle)
    const labelDataRegExp = new RegExp(
      '<data.*>(?:\\s|\\n)*?<x:List>(?:\\s|\\n)*(<y:Label.*>(?:\\n|.)*?<\\/y:Label>)*(?:\\s|\\n)*<\\/x:List>(?:\\s|\\n)*<\\/data>',
      'gi'
    )
    const labelDataMatch = labelOwnerTextWithoutNesting.match(labelDataRegExp)

    if (labelDataMatch !== null) {
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
   * An view item has been selected by the user: identify the corresponding editor section and highlight it.
   */
  onItemSelected(masterItem: IModelItem | null): void {
    if (masterItem && this.itemToMarkerMap.keys.includes(masterItem)) {
      const options = {
        className: 'text-highlight'
      }
      this.replaceMarker(masterItem, options)
    }
  }

  /**
   * Unhighlight a deselected item by providing null-options to {@link replaceMarker}.
   */
  onItemDeselected(masterItem: IModelItem): void {
    this.replaceMarker(masterItem, {})
  }

  /**
   * Update a marker with the provided options (e.g. CSS class)
   */
  private replaceMarker(masterItem: IModelItem, options: any): Marker | null {
    if (masterItem !== null && this.itemToMarkerMap.keys.includes(masterItem)) {
      const oldMarker = this.itemToMarkerMap.get(masterItem)!
      if (typeof oldMarker !== 'undefined') {
        this.markerToItemMap.delete(oldMarker)
        this.editor.dispatch({
          effects: this.removeMarker!.of(oldMarker.id)
        })
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

  private get editor() {
    return this._editor!
  }
}

/**
 * Find the shortest marker (text index pair) that spans the provided position.
 */
function getInnermostMarker(position: number, markers: Marker[]): Marker {
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
function findMatchingTag(str: string, startIndex: number, tagName: string): number {
  const regExp = new RegExp(`<${tagName}.*>|</${tagName}>`, 'gi')
  const substr = str.substr(startIndex)
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

function setOutput(text: string): void {
  const outputText = document.querySelector<HTMLTextAreaElement>('#outputText')!
  outputText.textContent = text
}
