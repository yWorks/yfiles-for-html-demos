/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphModelManager,
  IVisualTemplate,
  MarqueeSelectionEventArgs,
  MarqueeSelectionInputMode,
  Rect,
  SimpleNode
} from 'yfiles'

import GanttMapper from './GanttMapper.js'
import ActivityNodeStyle from './ActivityNodeStyle.js'

/**
 * A customized MarqueeSelectionInputMode that makes it possible to create task nodes.
 * For this purpose, the default template (blue marquee/rubber band rectangle) is switched off.
 * Instead, a temporary dummy node is rendered during task creation. This node is not part of the graph,
 * but only used for pure visualization.
 * When the gesture is finished, a node is created in the area defined by the task and the
 * x-coordinates of the dragged area.
 */
export default class CreateActivityInputMode extends MarqueeSelectionInputMode {
  /**
   * Creates a new instance.
   * @param {GanttMapper} mapper The mapper.
   * @param {function(INode):void} applyCallback The callback that is executed when the gesture is finished.
   */
  constructor(mapper, applyCallback) {
    super()

    /** @type {GanttMapper} */
    this.mapper = mapper
    /** @type {function(INode):void} */
    this.applyCallback = applyCallback

    // create the dummy node
    this.dummyNode = new SimpleNode()

    // switch off the default template
    this.template = new IVisualTemplate({
      createVisual() {
        return null
      },
      updateVisual() {
        return null
      }
    })
  }

  /**
   * @param {MarqueeSelectionEventArgs} evt - The event argument that contains context information.
   */
  onDragStarted(evt) {
    // get the dragged rectangle
    const marqueeRectangle = this.selectionRectangle
    // get the index of the task at the mouse position
    this.task = this.mapper.getTask(marqueeRectangle.y)
    // set the dummy node layout
    const layout = this.getDummyNodeLayout(marqueeRectangle)
    this.dummyNode.layout = layout
    const activity = {
      name: 'New Activity',
      startDate: this.mapper.getDate(layout.x),
      endDate: this.mapper.getDate(layout.x + layout.width),
      leadTime: 0,
      followUpTime: 0
    }
    this.dummyNode.tag = {
      activity,
      leadTimeWidth: 0,
      followUpTimeWidth: 0
    }

    const task = this.mapper.getTask(layout.y)
    this.dummyNode.style = task.color
      ? new ActivityNodeStyle(task.color)
      : this.inputModeContext.canvasComponent.graph.nodeDefaults.style

    // add the dummy node visual to the graph control
    this.canvasObject = this.inputModeContext.canvasComponent.contentGroup.addChild(
      this.dummyNode,
      GraphModelManager.DEFAULT_NODE_DESCRIPTOR
    )

    super.onDragStarted.call(this, evt)
  }

  /**
   * @param {MarqueeSelectionEventArgs} evt - The event argument that contains context information.
   */
  onDragging(evt) {
    // update the dummy node layout
    const layout = this.getDummyNodeLayout(this.selectionRectangle)
    this.dummyNode.layout = layout
    const activity = this.dummyNode.tag.activity
    activity.startDate = this.mapper.getDate(layout.x)
    activity.endDate = this.mapper.getDate(layout.x + layout.width)

    super.onDragging(evt)
  }

  /**
   * @param {MarqueeSelectionEventArgs} evt - The event argument that contains context information.
   */
  onDragFinished(evt) {
    // remove the dummy node visual
    if (this.canvasObject !== null) {
      this.canvasObject.remove()
    }
    const graph = this.inputModeContext.canvasComponent.graph
    const layout = this.getDummyNodeLayout(this.selectionRectangle)
    // create a new task
    const task = this.mapper.getTask(layout.y)
    const style = task.color ? new ActivityNodeStyle(task.color) : graph.nodeDefaults.style
    // create a new node with a label
    const node = graph.createNode({
      layout,
      tag: this.dummyNode.tag,
      labels: [this.dummyNode.tag.activity.name],
      style
    })

    // apply the graph modifications when a new node has been created
    if (this.applyCallback) {
      this.applyCallback(node)
    }

    super.onDragFinished(evt)
  }

  /**
   * @param {MarqueeSelectionEventArgs} evt - The event argument that contains context information.
   */
  onDragCanceled(evt) {
    // remove the dummy node visual
    if (this.canvasObject !== null) {
      this.canvasObject.remove()
    }

    super.onDragCanceled(evt)
  }

  getDummyNodeLayout(marqueeRect) {
    const x = marqueeRect.x
    // get the y coordinate of the task the drag was started in
    const y = this.mapper.getTaskY(this.task) + GanttMapper.activitySpacing
    const width = marqueeRect.width
    const height = GanttMapper.activityHeight
    return new Rect(x, y, width, height)
  }
}
