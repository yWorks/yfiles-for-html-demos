import React from 'react'
import ReactGraphComponent from './ReactGraphComponent.jsx'
import {DefaultGraph, ShapeNodeStyle} from 'yfiles'

class App extends React.Component {
  /**
   * Create a new graph with nicer default node and edge styles,
   * and create a simple graph structure
   * @returns {DefaultGraph}
   */
  static createDefaultGraph() {
    const graph = new DefaultGraph()
    graph.nodeDefaults.style = new ShapeNodeStyle({
      fill: 'orange',
      stroke: 'orange',
      shape: 'rectangle'
    })
    const n1 = graph.createNodeAt([150, 150])
    const n2 = graph.createNodeAt([250, 150])
    const n3 = graph.createNodeAt([150, 250])
    graph.createEdge(n1, n2)
    graph.createEdge(n1, n3)
    graph.createEdge(n2, n3)
    return graph
  }

  constructor() {
    super()
    // The app state consists of the "editable" and "graph" properties.
    // State changes are propagated to GraphComponent properties
    // in the app's render function.
    this.state = {
      editable: true,
      graph: App.createDefaultGraph()
    }
    this.toggleEditable = this.toggleEditable.bind(this)
    this.resetGraph = this.resetGraph.bind(this)
  }

  /**
   * Toggle state.editable
   */
  toggleEditable() {
    const editable = this.state.editable
    this.setState({ editable: !editable })
  }

  /**
   * Restore the default graph
   */
  resetGraph() {
    this.setState({ graph: App.createDefaultGraph() })
  }

  render() {
    return (
      <div>
        <div className="demo-toolbar">
          <button className="demo-icon-yIconReload" onClick={this.resetGraph} />
          <span className="demo-separator" />
          <input
            type="checkbox"
            id="toggleEditable"
            className="demo-toggle-button labeled"
            onClick={this.toggleEditable}
          />
          <label htmlFor="toggleEditable">Toggle Editing</label>
        </div>
        <ReactGraphComponent graph={this.state.graph} editable={this.state.editable} />
      </div>
    )
  }
}

export default App
