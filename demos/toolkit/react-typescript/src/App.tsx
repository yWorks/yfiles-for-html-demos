/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  nodesSource: NodeData[]
  edgesSource: EdgeData[]
}

export interface AppState {
  graphData: GraphData
}

export default class App extends Component<{}, AppState> {
  readonly state: AppState

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

  addNode(): void {
    const newIdx =
      this.state.graphData.nodesSource.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1
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

  removeNode(): void {
    this.setState(state => {
      const randomNodeIdx = Math.floor(
        Math.random() * (this.state.graphData.nodesSource.length - 1)
      )
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

  resetData(): void {
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

  render(): JSX.Element {
    return (
      <div className="App">
        <aside className="demo-sidebar left">
          <DemoDescription />
        </aside>
        <aside className="demo-sidebar right">
          <DemoDataPanel
            graphData={this.state.graphData}
            onAddNode={(): void => this.addNode()}
            onRemoveNode={(): void => this.removeNode()}
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
            onResetData={(): void => this.resetData()}
          />
        </div>
      </div>
    )
  }
}
