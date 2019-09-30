import React, { Component } from 'react'

export default class ItemElement extends Component {
  constructor(props) {
    super(props)
    this.state = { backgroundColor: '#00d7ff' }
  }

  componentDidMount() {
    this.setState({ backgroundColor: 'transparent' })
  }

  render() {
    const style = {
      backgroundColor: this.state.backgroundColor,
      transition: 'background-color 1s ease-out'
    }
    const codeStyle = {
      margin: 0
    }
    return (
      <div style={style}>
        <pre style={codeStyle}>{JSON.stringify(this.props.item)}</pre>
      </div>
    )
  }
}
