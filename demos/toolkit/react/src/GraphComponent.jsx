'use strict'

/* eslint-disable import/no-unresolved */

const React = require('react')
const PropTypes = require('prop-types');
const yfiles = require('yfiles/view-editor')

class GraphComponent extends React.Component {
  /**
   * @param {{graph: React.PropTypes.object, editable: React.PropTypes.bool}} props
   */
  constructor(props) {
    super(props)
    this.$graphComponent = null
    this.editMode = new yfiles.input.GraphEditorInputMode()
    this.viewMode = new yfiles.input.GraphViewerInputMode()
  }

  /**
   * When the GraphComponent has been added to the DOM, we create the
   * yfiles.view.GraphComponent instance in the rendered div element.
   */
  componentDidMount() {
    const container = this.div
    this.graphComponent = new yfiles.view.GraphComponent(container)
    this.setInputMode(this.props.editable)
    this.graphComponent.graph = this.props.graph
  }

  /**
   * When the React lifecycle tells us that properties might have changed,
   * we compare the property states and set the corresponding properties
   * of the yfiles.view.GraphComponent instance
   * @param {{graph: React.PropTypes.object, editable: React.PropTypes.bool}} nextProps
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.editable !== this.props.editable) {
      this.setInputMode(nextProps.editable)
    }
    if (nextProps.graph !== this.props.graph) {
      this.graphComponent.graph = nextProps.graph
    }
  }

  componentWillUnmount() {}

  /**
   * Gets/sets the GraphComponent.
   * @type {yfiles.view.GraphComponent}
   */
  get graphComponent() {
    return this.$graphComponent
  }

  /** @type {yfiles.view.GraphComponent} */
  set graphComponent(value) {
    this.$graphComponent = value
  }

  /**
   * Changes the graphcomponent's input mode.
   * @param {boolean} editable
   */
  setInputMode(editable) {
    this.graphComponent.inputMode = editable ? this.editMode : this.viewMode
  }

  /**
   * The GraphComponent's render function just creates the div that holds
   * the actual yFiles yfiles.view.GraphComponent
   * @returns {XML}
   */
  render() {
    return (
      <div
        ref={node => {
          this.div = node
        }}
        id="graphComponent"
      />
    )
  }
}

GraphComponent.defaultProps = {
  editable: true,
  graph: null
}

GraphComponent.propTypes = {
  editable: PropTypes.bool,
  graph: PropTypes.object
}

module.exports = GraphComponent
