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
'use client'
import './ReactGraphComponent.css'
import { ContextMenuComponent } from './ContextMenuComponent'
import { ReactGraphOverviewComponent } from './GraphOverviewComponent'
import { GraphData } from '@/app/page'
import React, { useMemo, useState } from 'react'
import { Command } from '@yfiles/yfiles'
import DemoToolbar from './DemoToolbar'
import { LayoutSupport } from '@/app/utils/LayoutSupport'
import { useTooltips } from '@/app/utils/use-tooltips'
import { useGraphSearch } from '@/app/utils/use-graph-search'
import { useGraphBuilder } from '@/app/utils/use-graph-builder'
import { useGraphComponent } from '@/app/utils/use-graph-component'

export interface ReactGraphComponentProps {
  graphData: GraphData
  onResetData(): void
}

export function ReactGraphComponent({ graphData, onResetData }: ReactGraphComponentProps) {
  // get hold of the GraphComponent
  const { graphComponent, graphComponentContainer } = useGraphComponent()

  // register tooltips on graph items
  useTooltips(graphComponent)

  // update graph on data changes
  const layoutSupport = useMemo(() => new LayoutSupport(graphComponent), [graphComponent])
  useGraphBuilder(graphComponent, graphData, layoutSupport)

  // register search on graph items
  const [searchQuery, setSearchQuery] = useState('')
  useGraphSearch(graphComponent, searchQuery)

  return (
    <>
      <div className="toolbar">
        <DemoToolbar
          resetData={onResetData}
          zoomIn={() => graphComponent.executeCommand(Command.INCREASE_ZOOM)}
          zoomOut={() => graphComponent.executeCommand(Command.DECREASE_ZOOM)}
          resetZoom={() => graphComponent.executeCommand(Command.ZOOM, 1)}
          fitContent={() => void graphComponent.fitGraphBounds()}
          searchChange={(evt) => setSearchQuery(evt.target.value)}
        />
      </div>
      <div className="main">
        <div
          className="graph-component-container"
          style={{ width: '100%', height: '100%' }}
          ref={graphComponentContainer}
        />
        <ContextMenuComponent graphComponent={graphComponent} />
        <div style={{ position: 'absolute', left: '20px', top: '20px' }}>
          <ReactGraphOverviewComponent graphComponent={graphComponent} />
        </div>
      </div>
    </>
  )
}
