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
import './ReactGraphComponent.css'
import { ContextMenuComponent } from './ContextMenuComponent.tsx'
import { ReactGraphOverviewComponent } from './GraphOverviewComponent.tsx'
import { GraphData } from '../App.tsx'
import { useMemo, useState } from 'react'
import { Command, GraphComponent, SvgExport } from '@yfiles/yfiles'
import DemoToolbar from './DemoToolbar.tsx'
import { LayoutSupport } from '../utils/LayoutSupport.ts'
import { useTooltips } from '../utils/use-tooltips.tsx'
import { useGraphSearch } from '../utils/use-graph-search.ts'
import { useGraphBuilder } from '../utils/use-graph-builder.ts'
import { useGraphComponent } from '../utils/use-graph-component.ts'
import { downloadFile } from '@yfiles/demo-utils/file-support.ts'

interface ReactGraphComponentProps {
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
          exportSvg={() => exportSvg(graphComponent)}
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

/**
 * Exports the graph component to an SVG.
 */
async function exportSvg(graphComponent: GraphComponent): Promise<void> {
  const exportComponent = new GraphComponent()
  exportComponent.graph = graphComponent.graph
  exportComponent.updateContentBounds()
  const exporter = new SvgExport({
    worldBounds: exportComponent.contentBounds,
    encodeImagesBase64: true,
    inlineSvgImages: true
  })

  // set cssStyleSheets to null so the SvgExport will automatically collect all style sheets
  exporter.cssStyleSheet = null
  const svg = await exporter.exportSvgAsync(exportComponent, async () => {
    // in case you have styles that render asynchronously, or if React hasn't finished rendering yet,
    // you can wait for them to finish here, e.g. like this:
    // await new Promise((resolve) => setTimeout(resolve, 2000))
  })
  downloadFile(SvgExport.exportSvgString(svg), 'graph.svg')
}
