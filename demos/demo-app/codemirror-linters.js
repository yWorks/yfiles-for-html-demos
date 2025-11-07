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
import { linter } from '@codemirror/lint'
import '@codemirror/lang-css'
import '@codemirror/lang-json'
import '@codemirror/lang-xml'
import { XMLValidator } from 'fast-xml-parser'
import postcss, { CssSyntaxError } from 'postcss'

export const getXmlLinter = () =>
  linter((view) => {
    const diagnostics = []
    const text = view.state.doc.toString()
    const result = XMLValidator.validate(text)
    if (result !== true) {
      const line = result.err.line || 1
      const col = result.err.col || 0
      const startPos = view.state.doc.line(line).from + col
      const from = startPos > 0 ? startPos - 1 : startPos
      const to = from + 1
      diagnostics.push({ from, to, severity: 'error', message: result.err.msg })
    }
    return diagnostics
  })

export const getJsonLinter = () =>
  linter((view) => {
    const diagnostics = []
    const text = view.state.doc.toString()
    try {
      JSON.parse(text)
    } catch (e) {
      if (e instanceof SyntaxError) {
        const match = /at position (\d+)/.exec(e.message)
        const pos = match ? parseInt(match[1]) : 0
        diagnostics.push({ from: pos, to: pos + 1, severity: 'error', message: e.message })
      }
    }
    return diagnostics
  })

export const getCssLinter = () =>
  linter((view) => {
    const text = view.state.doc.toString()
    const diagnostics = []
    try {
      postcss.parse(text, { from: undefined })
    } catch (e) {
      if (e instanceof CssSyntaxError) {
        const error = e
        const line = error.line || 1
        const column = error.column || 0

        const lines = text.split('\n')
        const pos = lines.slice(0, line - 1).join('\n').length + column

        diagnostics.push({
          from: pos,
          to: pos + 1,
          severity: 'error',
          message: error.reason || error.message
        })
      } else {
        const error = e
        diagnostics.push({ from: 0, to: text.length, severity: 'error', message: error.message })
      }
    }
    return diagnostics
  })
