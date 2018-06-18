'use strict'

/* eslint-disable import/no-unresolved */
/* eslint-disable jsx-a11y/label-has-for */

const React = require('react')
const GraphComponent = require('./GraphComponent')
const yfiles = require('yfiles/view-editor')
const DemoStyles = require('../../../resources/demo-styles')

class App extends React.Component {
  /**
   * Create a new graph with nicer default node and edge styles,
   * and create a simple graph structure
   * @returns {yfiles.graph.DefaultGraph}
   */
  static createDefaultGraph() {
    const graph = new yfiles.graph.DefaultGraph()
    graph.nodeDefaults.style = new DemoStyles.DemoNodeStyle()
    graph.edgeDefaults.style = new DemoStyles.DemoEdgeStyle()
    const n1 = graph.createNodeAt(new yfiles.geometry.Point(150, 150))
    const n2 = graph.createNodeAt(new yfiles.geometry.Point(250, 150))
    const n3 = graph.createNodeAt(new yfiles.geometry.Point(150, 250))
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
        <GraphComponent graph={this.state.graph} editable={this.state.editable} />
      </div>
    )
  }
}

module.exports = App
