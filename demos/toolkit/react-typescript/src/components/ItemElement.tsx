import React, { Component } from 'react'
import { EdgeData, NodeData } from '../App'

interface ItemElementProps {
  item: NodeData | EdgeData
}

interface ItemElementState {
  backgroundColor: string
}

export default class ItemElement extends Component<ItemElementProps, ItemElementState> {
  constructor(props: ItemElementProps) {
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
