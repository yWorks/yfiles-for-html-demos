/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import type { Activity, Task } from './resources/data-model'
import { getActivity } from './resources/data-model'
import { ganttChartData as dataModel } from './resources/gantt-chart-data'
import type { GraphComponent, GraphEditorInputMode, INode } from '@yfiles/yfiles'
import { Animator, IAnimation, Rect, TimeSpan } from '@yfiles/yfiles'

/**
 * Type that describes the data needed for the sweep-line.
 */
type SweepLineData = { x: number; activity: Activity; open: boolean }

export const ganttActivityHeight = 40
export const ganttActivitySpacing = 20
export const ganttTaskSpacing = 10

const subRowMap: Map<Activity, number> = new Map()
const subRowCountMap: Map<number, number> = new Map()

/**
 * Gets the y-coordinate for a given task.
 */
export function getTaskY(task: Task): number {
  const tasks = dataModel.tasks
  const index = tasks.findIndex((t) => t.id === task.id)
  let height: number = ganttTaskSpacing
  for (let i = 0; i < index; i++) {
    height += getCompleteTaskHeight(tasks[i]) + ganttTaskSpacing
  }
  return height
}

/**
 * Gets the task at the given y-coordinate.
 */
export function getTask(y: number): Task {
  const tasks = dataModel.tasks
  let currentY = 0
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    currentY += getCompleteTaskHeight(task) + ganttTaskSpacing
    if (currentY > y) {
      return task
    }
  }
  return tasks[tasks.length - 1]
}

/**
 * Gets the y-coordinate for a given activity, considering the sub-row information.
 */
export function getActivityY(activity: Activity): number {
  const taskId = activity.taskId
  const task = dataModel.tasks.find((t) => t.id === taskId)!
  let y: number = getTaskY(task) + ganttActivitySpacing
  const subRow = getSubRowIndex(activity)
  y += subRow * (ganttActivityHeight + ganttActivitySpacing)
  return y
}

/**
 * Calculates the task height, including sub-rows and spacing.
 */
export function getCompleteTaskHeight(task: Task): number {
  const subRowCount = getSubRowCount(task)
  return subRowCount * (ganttActivityHeight + ganttActivitySpacing) + ganttActivitySpacing
}

/**
 * Calculates the height of all tasks, including their sub-rows and spacing
 */
export function getTotalTasksHeight(): number {
  return dataModel.tasks.reduce<number>(
    (acc, task) => acc + getCompleteTaskHeight(task) + ganttTaskSpacing,
    0
  )
}

/**
 * Gets the sub-row in which the given activity is placed.
 */
export function getSubRowIndex(activity: Activity): number {
  if (typeof subRowMap.get(activity) !== 'undefined') {
    return subRowMap.get(activity)!
  }
  return 0
}

/**
 * Gets the number of sub-rows for a given task.
 */
export function getSubRowCount(task: Task): number {
  return typeof subRowCountMap.get(task.id) === 'number' ? subRowCountMap.get(task.id)! : 1
}

/**
 * Calculates the new height for each task row, spreading overlapping activity nodes
 * on multiple sub-rows.
 * The calculated data is stored in the mapper.
 */
export function updateSubRowMappings(graphComponent: GraphComponent): void {
  // maps the task id to the task's activities
  const taskId2Activities = new Map<number, INode[]>()
  // maps each task to its sub-row index
  // maps each task row to the number of sub-rows
  subRowMap.clear()
  subRowCountMap.clear()

  // create the task mapping for each activity and initialize the sub-row mapping with 0
  for (const node of graphComponent.graph.nodes) {
    const activity = getActivity(node)
    const taskId = activity.taskId
    if (!taskId2Activities.has(taskId)) {
      taskId2Activities.set(taskId, [])
    }
    taskId2Activities.get(taskId)!.push(node)
    subRowMap.set(activity, 0)
  }

  // calculate the sub-row mapping for each task
  dataModel.tasks.forEach((task) => {
    const maxRowIndex = calculateMappingForTask(task, taskId2Activities, subRowMap, graphComponent)
    subRowCountMap.set(task.id, maxRowIndex + 1)
  })
}

/**
 * Analyzes node overlaps within the same task lane
 * and splits up those nodes in sub-rows.
 * @param graphComponent The current GraphComponent
 * @param animate Whether to animate the resulting node layout change
 */
export async function updateSubRows(
  graphComponent: GraphComponent,
  animate: boolean
): Promise<void> {
  // update the information mapping the tasks to sub-rows and rows to the number of sub-rows
  updateSubRowMappings(graphComponent)
  // a list of node animations used to collect and execute them all at the same time
  const animations: IAnimation[] = []
  for (const node of graphComponent.graph.nodes) {
    const activity = getActivity(node)
    // get the sub-row calculated earlier
    const subRowIndex = getSubRowIndex(activity)
    if (typeof subRowIndex !== 'undefined') {
      const layout = node.layout

      const yTop = getActivityY(activity)
      // calculate the new node layout
      const newLayout = new Rect(layout.x, yTop, layout.width, layout.height)
      // check if we need to update the current layout
      if (!newLayout.equals(layout)) {
        if (animate) {
          // create an animated transition
          const animation = IAnimation.createNodeAnimation(
            graphComponent.graph,
            node,
            newLayout,
            new TimeSpan(200)
          )
          animations.push(animation)
        } else {
          // set the new bounds without animation
          graphComponent.graph.setNodeLayout(
            node,
            new Rect(layout.x, yTop, layout.width, layout.height)
          )
        }
      }
    }
  }

  if (animate && animations.length > 0) {
    // create a composite animation that executes all node transitions at the same time
    const compositeAnimation = IAnimation.createParallelAnimation(animations)
    const geim = graphComponent.inputMode as GraphEditorInputMode
    geim.waiting = true
    // start the animation
    await new Animator(graphComponent).animate(compositeAnimation)
    geim.waiting = false
  }
}

/**
 * Calculates the sub-row mapping for a given task.
 * In order to do that, a sweep line, or scan line algorithm is used:
 * The tasks are sorted by their x-coordinate. The algorithm runs over
 * the activities from left to right and chooses the first available sub-row
 * for each task until all activities have been assigned to a sub-row.
 * @returns The number of sub-rows needed for this task row.
 */
export function calculateMappingForTask(
  task: Task,
  taskId2Activities: Map<number, INode[]>,
  subRowMap: Map<Activity, number>,
  graphComponent: GraphComponent
): number {
  let maxRowIndex = 0
  // get the array of activities for this task
  const activityNodes = taskId2Activities.get(task.id)
  if (activityNodes) {
    // create an array for the sweep-line algorithm
    const sweeplineData: SweepLineData[] = []
    // push the information about start and end dates for each activity to the array
    activityNodes.forEach((node) => {
      const bounds = node.style.renderer
        .getBoundsProvider(node, node.style)
        .getBounds(graphComponent.canvasContext)
      const xStart = bounds.x
      const xEnd = bounds.x + bounds.width
      const activity = getActivity(node)
      // push the information where the activity starts
      sweeplineData.push({
        x: xStart,
        activity,
        open: true
      })
      // push the information where the task ends
      sweeplineData.push({
        x: xEnd,
        activity,
        open: false
      })
    })

    // sort by x-coordinates
    sweeplineData.sort((t1, t2) => t1.x - t2.x)
    const subRows: Activity[] = [] // holds information about available and unavailable sub-rows
    // sweep (scan) the data
    sweeplineData.forEach((d) => {
      // a new task begins
      if (d.open) {
        // search for the first available sub-row
        let i = 0
        while (subRows[i]) {
          i++
        }
        // put the activity in the sub-row
        subRows[i] = d.activity
        // possibly increment the max row information
        maxRowIndex = Math.max(maxRowIndex, i)
        // save the 'activity to sub-row' information in the mapping
        subRowMap.set(d.activity, i)
      } else {
        // a task ends
        const i = subRowMap.get(d.activity)!
        // delete it from the sub-rows storage
        delete subRows[i]
      }
    })
  }
  // return the number of rows needed
  return maxRowIndex
}
