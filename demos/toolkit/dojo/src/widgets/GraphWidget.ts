/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
// @ts-ignore
import licenseData from '../../../../../lib/license.json'

import WidgetBase from '@dojo/framework/core/WidgetBase'
import { v, dom, w } from '@dojo/framework/core/vdom'

import {
  GraphComponent,
  GraphEditorInputMode,
  GraphViewerInputMode,
  License,
  ShapeNodeStyle
} from 'yfiles'

import './styles/GraphWidget.css'
import DemoToolbar from './DemoToolbar'

/**
 * A simple widget that encapsulates a GraphComponent and the toolbar.
 */
export default class GraphWidget extends WidgetBase {
  private readonly graphComponentElement: HTMLElement
  private readonly graphComponent: GraphComponent

  constructor() {
    super()
    License.value = licenseData

    // create the control
    this.graphComponent = new GraphComponent()

    // some input mode for interaction
    this.graphComponent.inputMode = new GraphViewerInputMode()

    // initialize the graph
    this.initializeDefaultStyles()
    this.createSampleGraph()

    // store the div for the render callback
    this.graphComponentElement = this.graphComponent.div
  }

  /**
   * Once the component is rendered, we call fitGraphBounds to center the graph.
   */
  protected onAttach(): void {
    this.graphComponent.fitGraphBounds()
  }

  /**
   * Sets default styles for the graph.
   */
  private initializeDefaultStyles() {
    this.graphComponent.graph.nodeDefaults.style = new ShapeNodeStyle({
      fill: 'orange',
      stroke: 'orange',
      shape: 'rectangle'
    })
  }

  /**
   * Creates the default graph.
   */
  private createSampleGraph() {
    const graph = this.graphComponent.graph
    graph.clear()

    const n1 = graph.createNodeAt([150, 150])
    const n2 = graph.createNodeAt([250, 150])
    const n3 = graph.createNodeAt([150, 250])
    graph.createEdge(n1, n2)
    graph.createEdge(n1, n3)
    graph.createEdge(n2, n3)
    this.graphComponent.fitGraphBounds()
  }

  private onToggleEditClick(isEditable: boolean) {
    this.graphComponent.inputMode = isEditable
      ? new GraphEditorInputMode()
      : new GraphViewerInputMode()
  }

  protected render() {
    // render the previously created dom
    return v('div', [
      v('div', { classes: 'toolbar' }, [
        w(DemoToolbar, {
          onToggleEditClick: this.onToggleEditClick,
          onGraphRefreshClick: this.createSampleGraph
        })
      ]),
      dom({
        node: this.graphComponentElement,
        diffType: 'none'
      })
    ])
  }
}
