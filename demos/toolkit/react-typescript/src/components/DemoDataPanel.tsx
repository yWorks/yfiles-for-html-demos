/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import React, { Component } from 'react'
import './DemoDescription.css'
import ItemElement from './ItemElement'
import plusIcon from '../assets/plus-16.svg'
import minusIcon from '../assets/minus-16.svg'
import { GraphData } from '../App'

interface DemoDataPanelProps {
  graphData: GraphData
  onRemoveNode(): void
  onAddNode(): void
}

export default class DemoDataPanel extends Component<DemoDataPanelProps> {
  render(): JSX.Element {
    const nodeItems = this.props.graphData.nodesSource.map(node => (
      <ItemElement item={node} key={node.id} />
    ))

    const edgeItems = this.props.graphData.edgesSource.map(edge => (
      <ItemElement item={edge} key={`${edge.fromNode}-${edge.toNode}`} />
    ))

    return (
      <div>
        <h1 className="demo-sidebar-header">Graph Data</h1>
        <div className="demo-sidebar-content">
          <p>
            The following buttons add/remove items in the internal <code>graphData</code> object,
            that is bound to the <code>GraphComponent</code>. Upon change, the graph will be updated
            and rearranged.
          </p>
          <div className="controls">
            <button className="control-button" onClick={this.props.onAddNode}>
              <img src={plusIcon} alt="AddNodeIcon" />
              <br /> <span>Add Node</span>
            </button>
            <button
              className="control-button"
              onClick={this.props.onRemoveNode}
              disabled={this.props.graphData.nodesSource.length === 0}
            >
              <img src={minusIcon} alt="RemoveNodeIcon" />
              <br /> <span>Remove Node</span>
            </button>
          </div>
          <h2>Nodes Source</h2>
          {nodeItems}
          <h2>Edges Source</h2>
          {edgeItems}
        </div>
      </div>
    )
  }
}
