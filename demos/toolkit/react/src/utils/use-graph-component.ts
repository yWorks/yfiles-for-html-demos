/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  Arrow,
  EdgePathLabelModel,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  type IGraph,
  License,
  PolylineEdgeStyle,
  Size
} from '@yfiles/yfiles'
import { ReactComponentNodeStyle } from './ReactComponentNodeStyle.ts'
import NodeTemplate from '../components/NodeTemplate.tsx'
import { useLayoutEffect, useMemo, useRef } from 'react'
import licenseData from '../license.json'
import LabelTemplate from '../components/LabelTemplate'
import { ReactComponentLabelStyle } from './ReactComponentLabelStyle'

function configureDefaultStyles(graph: IGraph) {
  graph.nodeDefaults.size = new Size(60, 40)
  graph.nodeDefaults.style = new ReactComponentNodeStyle(NodeTemplate)
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    smoothingLength: 25,
    stroke: '4px #66485B',
    targetArrow: new Arrow({ fill: '#66485B', lengthScale: 2, widthScale: 2, type: 'ellipse' })
  })
  graph.edgeDefaults.labels.style = new ReactComponentLabelStyle(LabelTemplate)
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    autoRotation: false,
    sideOfEdge: 'on-edge'
  }).createRatioParameter()
}

export function useGraphComponent() {
  const graphComponentContainer = useRef<HTMLDivElement>(null)

  const graphComponent = useMemo(() => {
    // include the yFiles License
    // eslint-disable-next-line react-hooks/immutability
    License.value = licenseData
    // initialize the GraphComponent
    const gc = new GraphComponent()
    // register interaction
    gc.inputMode = new GraphViewerInputMode({
      // nodes and labels should be selectable
      selectableItems: GraphItemTypes.NODE | GraphItemTypes.LABEL
    })
    // specify default styles for newly created nodes and edges
    configureDefaultStyles(gc.graph)
    return gc
  }, [])

  useLayoutEffect(() => {
    const gcContainer = graphComponentContainer.current!
    // eslint-disable-next-line react-hooks/immutability
    graphComponent.htmlElement.style.width = '100%'
    graphComponent.htmlElement.style.height = '100%'
    gcContainer.appendChild(graphComponent.htmlElement)

    return () => {
      gcContainer.innerHTML = ''
    }
  }, [graphComponentContainer, graphComponent])

  return { graphComponentContainer, graphComponent }
}
