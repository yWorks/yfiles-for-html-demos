import React, { Component } from 'react'
import './DemoToolbar.css'

export default class DemoToolbar extends Component {
  render() {
    return (
      <div className="demo-toolbar">
        <button className="demo-icon-yIconZoomIn" title="Zoom In" onClick={this.props.zoomIn} />
        <button
          className="demo-icon-yIconZoomOriginal"
          title="Reset Zoom"
          onClick={this.props.resetZoom}
        />
        <button className="demo-icon-yIconZoomOut" title="Zoom Out" onClick={this.props.zoomOut} />
        <button
          className="demo-icon-yIconZoomFit"
          title="Fit Diagram"
          onClick={this.props.fitContent}
        />
      </div>
    )
  }
}
