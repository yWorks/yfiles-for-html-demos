import React, { Component } from 'react'
import './App.css'
import ReactGraphComponent from './components/ReactGraphComponent'
import DemoDescription from './components/DemoDescription'
import yLogo from './assets/ylogo.svg'
import DemoDataPanel from './components/DemoDataPanel'

export interface NodeData {
  id: number
  name: string
}

export interface EdgeData {
  fromNode: number
  toNode: number
}

export interface GraphData {
  nodesSource: Array<NodeData>
  edgesSource: Array<EdgeData>
}

export interface AppState {
  graphData: GraphData
}

export default class App extends Component<{}, AppState> {
  constructor(props: object) {
    super(props)
    this.state = {
      graphData: {
        nodesSource: [
          {
            id: 0,
            name: 'Node 0'
          },
          {
            id: 1,
            name: 'Node 1'
          },
          {
            id: 2,
            name: 'Node 2'
          }
        ],
        edgesSource: [
          {
            fromNode: 0,
            toNode: 1
          },
          {
            fromNode: 0,
            toNode: 2
          }
        ]
      }
    }
  }

  addNode() {
    const newIdx = this.state.graphData.nodesSource.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1
    const parentNodeIdx = Math.floor(Math.random() * (this.state.graphData.nodesSource.length - 1))
    this.setState(state => {
      const nodesSource = state.graphData.nodesSource.concat({
        id: newIdx,
        name: `Node ${newIdx}`
      })

      // Create an edge if the graph was not empty
      let edgesSource = state.graphData.edgesSource
      if (parentNodeIdx > -1) {
        edgesSource = state.graphData.edgesSource.concat({
          fromNode: nodesSource[parentNodeIdx].id,
          toNode: newIdx
        })
      }

      return {
        graphData: {
          nodesSource,
          edgesSource
        }
      }
    })
  }

  removeNode() {
    this.setState(state => {
      const randomNodeIdx = Math.floor(Math.random() * (this.state.graphData.nodesSource.length - 1))
      const newNodesSource = [...state.graphData.nodesSource]
      newNodesSource.splice(randomNodeIdx, 1)

      const nodeId = this.state.graphData.nodesSource[randomNodeIdx].id
      const newEdgesSource = state.graphData.edgesSource.filter(
        edge => edge.fromNode !== nodeId && edge.toNode !== nodeId
      )
      return {
        graphData: {
          nodesSource: newNodesSource,
          edgesSource: newEdgesSource
        }
      }
    })
  }

  resetData() {
    this.setState({
      graphData: {
        nodesSource: [
          {
            id: 0,
            name: 'Node 0'
          },
          {
            id: 1,
            name: 'Node 1'
          },
          {
            id: 2,
            name: 'Node 2'
          }
        ],
        edgesSource: [
          {
            fromNode: 0,
            toNode: 1
          },
          {
            fromNode: 0,
            toNode: 2
          }
        ]
      }
    })
  }

  render() {
    return (
      <div className="App">
        <aside className="demo-sidebar left">
          <DemoDescription />
        </aside>
        <aside className="demo-sidebar right">
          <DemoDataPanel
            graphData={this.state.graphData}
            onAddNode={() => this.addNode()}
            onRemoveNode={() => this.removeNode()}
          />
        </aside>

        <div className="demo-content">
          <div className="demo-header">
            <a href="https://www.yworks.com" target="_blank" rel="noopener noreferrer">
              <img src={yLogo} className="demo-y-logo" alt="yWorks Logo" />
            </a>
            <a href="../../../README.html" target="_blank">
              yFiles for HTML
            </a>
            <span className="demo-title">React Demo [yFiles for HTML]</span>
          </div>

          <ReactGraphComponent
            graphData={this.state.graphData}
            onResetData={() => this.resetData()}
          />
        </div>
      </div>
    )
  }
}
