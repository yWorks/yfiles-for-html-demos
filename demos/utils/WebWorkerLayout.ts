/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
import type {
  InsetsConvertible,
  ItemMappingConvertible,
  LayoutDescriptor,
  PortAdjustmentPolicyStringValues,
  SizeConvertible,
  TimeSpanConvertible
} from 'yfiles'
import {
  GraphComponent,
  ILabel,
  IModelItem,
  Insets,
  ISelectionModel,
  ItemMapping,
  LayoutData,
  LayoutExecutorAsync,
  PortAdjustmentPolicy,
  PortLabelPolicy,
  Size,
  TimeSpan
} from 'yfiles'

// initialize a web worker to run the layout on
// @ts-ignore
const worker = new Worker(new URL('./WebWorkerLayoutTask.js', import.meta.url), {
  type: 'module'
})
const workerInitialization = new Promise<void>(resolve => {
  worker.onmessage = e => {
    if (e.data === 'ready') {
      resolve()
    }
  }
})

// helper function that performs the actual message passing to the web worker
async function webWorkerMessageHandler(data: unknown): Promise<any> {
  await workerInitialization
  return new Promise<any>(resolve => {
    worker.onmessage = (e: any) => {
      resolve(e.data)
    }
    worker.postMessage(data)
  })
}

/**
 * A {@link LayoutExecutorAsync} utility class that instantiates a suitable web worker and
 * configures the communication accordingly.
 */
export class WebWorkerLayout extends LayoutExecutorAsync {
  constructor(args: {
    graphComponent: GraphComponent
    layoutDescriptor?: LayoutDescriptor | null
    layoutData?: LayoutData | null
    configureTableLayout?: boolean
    duration?: TimeSpan | TimeSpanConvertible
    automaticEdgeGrouping?: boolean
    fixPorts?: boolean
    animateViewport?: boolean
    considerViewportLimiter?: boolean
    easedAnimation?: boolean
    targetBoundsInsets?: Insets | InsetsConvertible
    updateContentRect?: boolean
    allowUserInteraction?: boolean
    portLabelPolicies?:
      | ItemMapping<ILabel, PortLabelPolicy>
      | ItemMappingConvertible<ILabel, PortLabelPolicy>
    edgePortNodeSize?: Size | SizeConvertible
    hideEdgesAtEdges?: boolean
    portAdjustmentPolicy?: PortAdjustmentPolicy | PortAdjustmentPolicyStringValues
    selectionModel?: ISelectionModel<IModelItem> | null
    sequentialExecution?: boolean
    cancelDuration?: TimeSpan | TimeSpanConvertible
    stopDuration?: TimeSpan | TimeSpanConvertible
  }) {
    super({ ...args, messageHandler: webWorkerMessageHandler })
  }
}
