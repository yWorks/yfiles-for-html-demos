/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { GraphComponent, ICommand } from 'yfiles'
import { onMount } from 'solid-js'

type DemoToolbarProps = {
  graphComponent: () => GraphComponent
  resetGraph: () => void
  layout: () => void
}
export const DemoToolbar = (props: DemoToolbarProps) => {
  const commandCallbacks = {
    resetData: () => {},
    zoomIn: () => {},
    resetZoom: () => {},
    zoomOut: () => {},
    fitContent: () => {}
  }

  onMount(() => {
    const graphComponent = props.graphComponent()
    commandCallbacks.resetData = () => props.resetGraph()
    commandCallbacks.zoomIn = () => ICommand.INCREASE_ZOOM.execute(null, graphComponent)
    commandCallbacks.zoomOut = () => ICommand.DECREASE_ZOOM.execute(null, graphComponent)
    commandCallbacks.resetZoom = () => ICommand.ZOOM.execute(1.0, graphComponent)
    commandCallbacks.fitContent = () => ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })

  return (
    <div class={'demo-page__toolbar'}>
      <button
        class={'demo-icon-yIconReload'}
        title="Reset Data"
        onClick={() => commandCallbacks.resetData()}
      />
      <span class={'demo-separator'} />
      <button
        class={'demo-icon-yIconZoomIn'}
        title="Zoom In"
        onClick={() => commandCallbacks.zoomIn()}
      />
      <button
        class={'demo-icon-yIconZoomOriginal'}
        title="Reset Zoom"
        onClick={() => commandCallbacks.resetZoom()}
      />
      <button
        class={'demo-icon-yIconZoomOut'}
        title="Zoom Out"
        onClick={() => commandCallbacks.zoomOut()}
      />
      <button
        class={'demo-icon-yIconZoomFit'}
        title="Fit Diagram"
        onClick={() => commandCallbacks.fitContent()}
      />
      <span class="demo-separator"></span>
      <button class="demo-icon-yIconLayout labeled" onClick={() => props.layout()}>
        Layout
      </button>
    </div>
  )
}
