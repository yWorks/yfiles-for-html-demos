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
import { Graph } from '@yfiles/yfiles'
import { createNode } from '../src/ItemFactory.js'

/**
 * This test file tests ItemFactory while mocking yFiles. Note that some yFiles functionality
 * (such as GraphComponent) requires a working DOM implementation. Jest's JSDOM environment
 * misses some required DOM APIs. For code importing yFiles library files that require a DOM, it is
 * necessary to mock yFiles.
 */

// Mock yFiles. Note that Jests automatic mocking mechanism does not work with yFiles because
// of the internal structure of the yFiles library.
jest.mock('@yfiles/yfiles', () => ({
  Graph: class Graph {
    createNode({ layout }) {
      return { layout }
    }

    createEdge(sourceNode, targetNode) {
      return { sourceNode, targetNode }
    }
  },
  Rect: class Rect {
    constructor(x, y, w, h) {
      this.x = x
      this.y = y
      this.width = w
      this.height = h
    }
  }
}))

test('creates a node at the specified location', () => {
  const graph = new Graph()

  const node = createNode(graph, 13, 37)
  expect(node.layout.x).toEqual(13)
  expect(node.layout.y).toEqual(37)
})
