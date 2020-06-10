/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import React, { Component } from 'react'
import {
  Arrow,
  DefaultLabelStyle,
  Font,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  License,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size
} from 'yfiles'
import 'yfiles/yfiles.css'
import './ReactGraphComponent.css'
import DemoToolbar from './DemoToolbar.jsx'
import yFilesLicense from '../license.json'

export default class ReactGraphComponent extends Component {
  constructor(props) {
    super(props)
    // include the yFiles License
    License.value = yFilesLicense

    // Initialize the GraphComponent
    this.graphComponent = new GraphComponent()
    this.graphComponent.inputMode = new GraphEditorInputMode()
    this.initializeDefaultStyles()
  }

  async componentDidMount() {
    // Append the GraphComponent to the DOM
    this.div.appendChild(this.graphComponent.div)
  }

  /**
   * Sets default styles for the graph.
   */
  initializeDefaultStyles() {
    this.graphComponent.graph.nodeDefaults.size = new Size(60, 40)
    this.graphComponent.graph.nodeDefaults.style = new ShapeNodeStyle({
      fill: '#00d7ff',
      stroke: '#00d7ff',
      shape: 'round-rectangle'
    })
    this.graphComponent.graph.nodeDefaults.labels.style = new DefaultLabelStyle({
      textFill: '#fff',
      font: new Font('Robot, sans-serif', 14)
    })
    this.graphComponent.graph.edgeDefaults.style = new PolylineEdgeStyle({
      smoothingLength: 25,
      stroke: '5px #242265',
      targetArrow: new Arrow({
        fill: '#242265',
        scale: 2,
        type: 'circle'
      })
    })
  }

  render() {
    return (
      <div>
        <div className="toolbar">
          <DemoToolbar
            resetData={this.props.onResetData}
            zoomIn={() => ICommand.INCREASE_ZOOM.execute(null, this.graphComponent)}
            zoomOut={() => ICommand.DECREASE_ZOOM.execute(null, this.graphComponent)}
            resetZoom={() => ICommand.ZOOM.execute(1.0, this.graphComponent)}
            fitContent={() => ICommand.FIT_GRAPH_BOUNDS.execute(null, this.graphComponent)}
          />
        </div>
        <div
          className="graph-component-container"
          ref={node => {
            this.div = node
          }}
        />
      </div>
    )
  }
}

ReactGraphComponent.defaultProps = {
  graphData: {
    nodesSource: [],
    edgesSource: []
  }
}
