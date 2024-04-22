/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import type { ICanvasObject, IGraph, IInputModeContext, IPoint } from 'yfiles'
import {
  BaseClass,
  Cursor,
  GraphModelManager,
  IHitTestable,
  IListEnumerable,
  IPositionHandler,
  MoveInputMode,
  MutablePoint,
  Point,
  Rect,
  SimpleLabel,
  SimpleNode
} from 'yfiles'

import { ActivityNodeStyle } from './activity-node/ActivityNodeStyle'
import { getDate, getTaskColor, syncActivityWithNodeLayout } from './gantt-utils'
import { hideInfo, showInfo } from './info-panel'
import type { Activity } from './resources/data-model'
import { ganttActivityHeight, ganttActivitySpacing, getTask, getTaskY } from './sweepline-layout'

/**
 * An input mode that allows creating activities by dragging in the viewport.
 */
export class CreateActivityInputMode extends MoveInputMode {
  constructor() {
    super()
    this.positionHandler = new CreateActivityHandler()
    this.hitTestable = IHitTestable.ALWAYS
    this.validBeginCursor = Cursor.DEFAULT
    this.moveCursor = Cursor.EW_RESIZE
  }
}

/**
 * A handler that allows for creating a node with a drag gesture.
 * The drag gesture determines the duration of the activity.
 */
class CreateActivityHandler extends BaseClass(IPositionHandler) {
  private locationPoint = new MutablePoint()
  private temporaryNode: SimpleNode | null = null
  /** Canvas object for the node visualization during the gesture */
  private nodeCanvasObject: ICanvasObject | null = null
  /** Canvas object for the label visualization during the gesture */
  private labelCanvasObject: ICanvasObject | null = null

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initializeDrag(context: IInputModeContext): void {}

  /**
   * Creates a temporary dummy node that will be converted to a normal node when the drag gesture will
   * be finished and shows an info popup with the date that corresponds to the mouse location.
   */
  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    if (!this.temporaryNode) {
      // create a dummy node that does not belong to the graph and add it to
      // the graphComponent's rendering group
      this.temporaryNode = this.createTemporaryNode(context, originalLocation, newLocation)
      this.showTemporaryNode(context)
    }
    // update the location of the node
    this.locationPoint.relocate(newLocation)
    this.updateTemporaryNode(originalLocation, newLocation)

    // Show info text
    const text = getDate(this.temporaryNode!.layout.maxX).format()
    showInfo(text, this.temporaryNode.layout.topRight, context.canvasComponent!)
  }

  /**
   * Creates an actual node in the graph based on the layout, style, label, and tag of the temporary
   * node.
   */
  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    // update the location of the dummy node
    this.updateTemporaryNode(originalLocation, newLocation)

    // update the activity with the actual timestamps
    syncActivityWithNodeLayout(this.temporaryNode!)

    // remove the dummy node from the graphComponent's content group and hide the popup info
    this.hideTemporaryNode()
    hideInfo()

    // create the new node as part of the actual graph
    this.createNode(context.graph)
    this.temporaryNode = null
  }

  /**
   * Removes the dummy node from the graph component and hides the popup info.
   */
  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    this.hideTemporaryNode()
    this.temporaryNode = null
    hideInfo()
  }

  get location(): IPoint {
    return this.locationPoint
  }

  /**
   * Creates the node in the graph at the end of the gesture.
   * The created node reuses the same layout, style, tag, and label
   * of the temporary node during the gesture.
   */
  private createNode(graph: IGraph | null | undefined): void {
    if (graph && this.temporaryNode) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { layout, style, tag } = this.temporaryNode
      const node = graph.createNode(layout, style, tag)
      for (const label of this.temporaryNode.labels) {
        graph.addLabel(
          node,
          label.text,
          label.layoutParameter,
          label.style,
          label.preferredSize,
          label.tag
        )
      }
    }
  }

  /**
   * Creates the temporary node with an appropriate layout, style, and tag, so that it looks
   * just like a normal node.
   */
  private createTemporaryNode(
    context: IInputModeContext,
    originalLocation: Point,
    newLocation: Point
  ): SimpleNode {
    const layout = this.getTemporaryNodeLayout(originalLocation, newLocation)
    const task = getTask(layout.y)

    // add some initial activity data
    const activity: Activity = {
      name: 'New Activity',
      startDate: getDate(layout.x).toISOString(),
      endDate: getDate(layout.x + layout.width).toISOString(),
      leadTime: 0,
      followUpTime: 0,
      taskId: task.id
    }

    const graph = context.graph!

    // create a dummy node which is not actually part of the graph
    const node = new SimpleNode({
      layout,
      style: new ActivityNodeStyle(getTaskColor(task)),
      tag: activity
    })
    const label = new SimpleLabel({
      owner: node,
      text: activity.name,
      style: graph.nodeDefaults.labels.getStyleInstance(node),
      layoutParameter: graph.nodeDefaults.labels.getLayoutParameterInstance(node)
    })
    label.adoptPreferredSizeFromStyle()
    node.labels = IListEnumerable.from([label])

    return node
  }

  /**
   * Updates the temporary node layout in response to a drag.
   */
  private updateTemporaryNode(originalLocation: Point, newLocation: Point): void {
    if (this.temporaryNode) {
      this.temporaryNode.layout = this.getTemporaryNodeLayout(originalLocation, newLocation)
    }
  }

  /**
   * Calculates the temporary node layout based on the current pointer location during a drag.
   */
  private getTemporaryNodeLayout(originalLocation: Point, newLocation: Point): Rect {
    const y = getTaskY(getTask(originalLocation.y)) + ganttActivitySpacing
    return new Rect(
      new Point(originalLocation.x, y),
      new Point(newLocation.x, y + ganttActivityHeight)
    )
  }

  /**
   * Shows the temporary node visualization.
   * Basically, add the node and its label directly to the graphComponent with
   * the default descriptor for nodes and labels since the dummy node is not actually part of the
   * graphComponent's graph.
   */
  private showTemporaryNode(context: IInputModeContext): void {
    // Add the node and its label with the default descriptor for nodes and labels.
    // Those know how to render graph items with their style.
    const canvasComponent = context.canvasComponent
    if (this.temporaryNode && canvasComponent) {
      this.nodeCanvasObject = canvasComponent.contentGroup.addChild(
        this.temporaryNode,
        GraphModelManager.DEFAULT_NODE_DESCRIPTOR
      )
      const label = this.temporaryNode.labels.at(0)
      if (label) {
        this.labelCanvasObject = canvasComponent.contentGroup.addChild(
          label,
          GraphModelManager.DEFAULT_LABEL_DESCRIPTOR
        )
      }
    }
  }

  /**
   * Hides the temporary node visualization.
   */
  private hideTemporaryNode(): void {
    this.nodeCanvasObject?.remove()
    this.nodeCanvasObject = null
    this.labelCanvasObject?.remove()
    this.labelCanvasObject = null
  }
}
