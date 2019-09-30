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
  render() {
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
