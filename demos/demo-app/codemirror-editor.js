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
import { basicSetup, EditorView } from 'codemirror'
import { lintGutter } from '@codemirror/lint'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { xml } from '@codemirror/lang-xml'
import { cypher } from '@codemirror/legacy-modes/mode/cypher'
import { StreamLanguage } from '@codemirror/language'
import { getCssLinter, getJsonLinter, getXmlLinter } from './codemirror-linters'
import { EditorState, StateEffect, StateField } from '@codemirror/state'
import { Decoration } from '@codemirror/view'

export * from '@codemirror/view'
export * from '@codemirror/state'

export function createCodemirrorEditor(mode, parentElement, additionExtensions = []) {
  const extensions = [basicSetup]
  if (mode === 'js') {
    extensions.push(javascript())
  } else if (mode === 'jsx') {
    extensions.push(javascript({ jsx: true }))
  } else if (mode === 'json') {
    extensions.push(javascript(), getJsonLinter(), lintGutter())
  } else if (mode === 'css') {
    extensions.push(css(), getCssLinter(), lintGutter())
  } else if (mode === 'cypher') {
    extensions.push(StreamLanguage.define(cypher))
  } else {
    extensions.push(xml(), getXmlLinter(), lintGutter())
  }
  extensions.push(...additionExtensions)
  return new EditorView({ parent: parentElement, extensions: extensions })
}

export function createGraphMLEditor(textArea, contentChanged, cursorActivity) {
  const addMarker = StateEffect.define()
  const removeMarker = StateEffect.define()

  const markerField = StateField.define({
    create() {
      return { decorations: Decoration.none, markers: new Map() }
    },
    update(value, tr) {
      const { markers } = value
      let decorations = value.decorations.map(tr.changes)

      for (const e of tr.effects) {
        if (e.is(addMarker)) {
          const marker = e.value
          if (marker.from >= 0 && marker.to <= tr.newDoc.length) {
            decorations = decorations.update({
              add: [Decoration.mark({ class: marker.className }).range(marker.from, marker.to)]
            })
            markers.set(marker.id, marker)
          }
        } else if (e.is(removeMarker)) {
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

  const startState = EditorState.create({
    doc: textArea.value,
    extensions: [
      basicSetup,
      markerField,
      xml(),
      getXmlLinter(),
      lintGutter(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          contentChanged(update)
        }
      }),
      EditorView.updateListener.of((update) => {
        if (update.selectionSet) {
          cursorActivity(update)
        }
      })
    ]
  })
  const editor = new EditorView({ parent: textArea, state: startState })

  return { editor, markerField, addMarker, removeMarker }
}
