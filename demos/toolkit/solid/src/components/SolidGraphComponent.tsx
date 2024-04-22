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
import { GraphComponent, GraphEditorInputMode, License } from 'yfiles'
import license from '../license.json'
import { onCleanup, onMount } from 'solid-js'
import type { JSX } from 'solid-js'
import type { Property } from 'csstype'
import { SolidGraphOverviewComponent } from './SolidGraphOverviewComponent'
import { DemoToolbar } from './DemoToolbar'
import { createDefaultGraph } from '../utils/createDefaultGraph'
import { useLayout } from '../utils/useLayout'
import { useTooltips } from '../utils/useTooltip'

type SolidGraphComponentProps = {
  width?: Property.Width<0 | string>
  height?: Property.Height<0 | string>
  style?: JSX.CSSProperties
}
export const SolidGraphComponent = (props: SolidGraphComponentProps) => {
  License.value = license
  let gcDiv: HTMLDivElement | undefined = undefined
  let gc: GraphComponent
  let resetGraph: () => void
  let layout: () => void

  onMount(() => {
    gc = new GraphComponent(gcDiv!)
    resetGraph = createDefaultGraph(gc)
    layout = useLayout(gc)
    gc.inputMode = new GraphEditorInputMode()
    useTooltips(gc)
  })
  onCleanup(() => gc?.cleanUp())

  return (
    <>
      <DemoToolbar
        graphComponent={() => gc}
        resetGraph={() => resetGraph()}
        layout={() => layout()}
      />
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <SolidGraphOverviewComponent graphComponent={() => gc} />
        <div
          ref={gcDiv}
          style={{
            height: props?.height ?? '500px',
            width: props?.width ?? '500px',
            ...props.style
          }}
        ></div>
      </div>
    </>
  )
}
