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
import React from 'react'
import { DiagramComponent } from './DiagramComponent'
import { ReactComponentHtmlNodeStyle } from './ReactComponentHtmlNodeStyle'
import { HtmlNodeComponent } from './HtmlNodeComponent'
import graphData from './assets/graph-data.json'
import { GraphComponent, GraphEditorInputMode, Size } from '@yfiles/yfiles'

function initGraph(graphComponent: GraphComponent) {
  graphComponent.inputMode = new GraphEditorInputMode({ allowEditLabelOnDoubleClick: false })

  // create the style instance using our component, providing defaults for the tag
  const style = new ReactComponentHtmlNodeStyle(
    // the React component used to render a node
    HtmlNodeComponent,
    // the props the component should receive
    (context, node) => node.tag ?? { name: 'New Node', color: 'blue-grey', content: 'No content' }
  )

  // register the node style as the default for all new nodes
  const width = 300
  const height = 250

  graphComponent.graph.nodeDefaults.style = style
  graphComponent.graph.nodeDefaults.size = new Size(width, height)

  for (const { x, y, tag } of graphData) {
    graphComponent.graph.createNode({
      layout: [x, y, width, height],
      style,
      tag
    })
  }
}

function App() {
  return (
    <div className="demo-main__graph-component">
      <DiagramComponent initGraph={initGraph} />
    </div>
  )
}

export default App
