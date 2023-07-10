/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use client'
import styles from './page.module.css'
import DemoDescription from '@/app/components/DemoDescription'
import DemoDataPanel from '@/app/components/DemoDataPanel'
import dynamic from 'next/dynamic'

import React, { useCallback, useState } from 'react'
import { ReactGraphComponentProps } from '@/app/components/ReactGraphComponent'

const yLogo = '/assets/ylogo.svg'

// render ReactGraphComponent only client side
const ReactGraphComponent = dynamic<ReactGraphComponentProps>(
  () => import('@/app/components/ReactGraphComponent').then(mod => mod.ReactGraphComponent),
  {
    ssr: false,
    loading: () => <div className={'main-loader'}></div>
  }
)

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

const INITIAL_GRAPH_DATA = {
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

export default function Home() {
  const [graphData, setGraphData] = useState(INITIAL_GRAPH_DATA)

  const addNode = useCallback(() => {
    const newIdx = graphData.nodesSource.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1
    const parentNodeIdx = Math.floor(Math.random() * graphData.nodesSource.length)
    setGraphData(prevGraphData => {
      const nodesSource = prevGraphData.nodesSource.concat({
        id: newIdx,
        name: `Node ${newIdx}`
      })

      // Create an edge if the graph was not empty
      let edgesSource = prevGraphData.edgesSource
      if (parentNodeIdx > -1) {
        edgesSource = prevGraphData.edgesSource.concat({
          fromNode: nodesSource[parentNodeIdx].id,
          toNode: newIdx
        })
      }

      return {
        nodesSource,
        edgesSource
      }
    })
  }, [graphData, setGraphData])

  const removeNode = useCallback(() => {
    setGraphData(prevGraphData => {
      const randomNodeIdx = Math.floor(Math.random() * prevGraphData.nodesSource.length)
      const newNodesSource = [...prevGraphData.nodesSource]
      newNodesSource.splice(randomNodeIdx, 1)

      const nodeId = prevGraphData.nodesSource[randomNodeIdx].id
      const newEdgesSource = prevGraphData.edgesSource.filter(
        edge => edge.fromNode !== nodeId && edge.toNode !== nodeId
      )
      return {
        nodesSource: newNodesSource,
        edgesSource: newEdgesSource
      }
    })
  }, [setGraphData])

  const resetData = useCallback(() => {
    setGraphData(INITIAL_GRAPH_DATA)
  }, [setGraphData])

  return (
    <main id="root" className={styles.main}>
      <div className="app">
        <aside className="demo-sidebar left demo-page__description">
          <DemoDescription />
        </aside>
        <aside className="demo-sidebar right">
          <DemoDataPanel graphData={graphData} onAddNode={addNode} onRemoveNode={removeNode} />
        </aside>

        <div className="demo-header">
          <a
            href="https://www.yworks.com/products/yfiles"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={yLogo} className="demo-y-logo" alt="yWorks Logo" />
          </a>
          <a
            href="https://www.yworks.com/products/yfiles"
            target="_blank"
            rel="noopener noreferrer"
          >
            yFiles for HTML
          </a>
          <a
            href="../../../README.html"
            target="_blank"
            className={'demo-title'}
            rel="noopener noreferrer"
          >
            Demos
          </a>
          <span className="demo-title">Next.js Demo</span>
        </div>

        <ReactGraphComponent graphData={graphData} onResetData={resetData} />
      </div>
    </main>
  )
}
