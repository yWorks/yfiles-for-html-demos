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
import type { MindMapData } from '../data-types'

/**
 * A sample dataset which contains a mindmap about hobbies.
 * In this demo, the graph is expected
 * to have a [tree-structure]{@link https://en.wikipedia.org/wiki/Tree_(graph_theory)}.
 * Cross-references must be marked with type 'cross-reference',
 * so they can be distinguished from the tree edges.
 */
export const hobbies: MindMapData = {
  concepts: [
    { id: 0, text: 'hobbies' },
    { id: 1, text: 'games' },
    { id: 2, text: 'computer' },
    { id: 3, text: 'the settlers of catan' },
    { id: 4, text: 'cops and robbers' },
    { id: 5, text: 'books' },
    { id: 6, text: 'thriller' },
    { id: 7, text: 'science-fiction' },
    { id: 8, text: 'fantasy' },
    { id: 9, text: 'collecting' },
    { id: 10, text: 'stamps' },
    { id: 11, text: 'sport' },
    { id: 12, text: 'climbing' },
    { id: 13, text: 'ice' },
    { id: 14, text: 'rock' },
    { id: 15, text: 'soccer' },
    { id: 16, text: 'dancing' },
    { id: 17, text: 'diy' },
    { id: 18, text: 'cars' },
    { id: 19, text: 'planes' }
  ],
  connections: [
    { from: 0, to: 1, type: 'association' },
    { from: 1, to: 2, type: 'association' },
    { from: 1, to: 3, type: 'association' },
    { from: 1, to: 4, type: 'association' },
    { from: 0, to: 5, type: 'association' },
    { from: 5, to: 6, type: 'association' },
    { from: 5, to: 7, type: 'association' },
    { from: 5, to: 8, type: 'association' },
    { from: 0, to: 9, type: 'association' },
    { from: 9, to: 10, type: 'association' },
    { from: 0, to: 11, type: 'association' },
    { from: 11, to: 12, type: 'association' },
    { from: 12, to: 13, type: 'association' },
    { from: 12, to: 14, type: 'association' },
    { from: 11, to: 15, type: 'association' },
    { from: 11, to: 16, type: 'association' },
    { from: 0, to: 17, type: 'association' },
    { from: 17, to: 18, type: 'association' },
    { from: 17, to: 19, type: 'association' }
  ]
}
