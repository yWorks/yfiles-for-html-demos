// @ts-ignore
import licenseData from '../../../../../lib/license.json'

import WidgetBase from '@dojo/framework/widget-core/WidgetBase'
import { v, dom, w } from '@dojo/framework/widget-core/d'

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
