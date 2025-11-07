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
import type { INode } from '@yfiles/yfiles'
import { colorSets } from '@yfiles/demo-app/demo-colors'
import { getTask } from './sweepline-layout'
import type { ActivityNodeStyle } from './activity-node/ActivityNodeStyle'
import { ganttChartData as dataModel } from './resources/gantt-chart-data'

export const colorPalette: string[] = [
  colorSets['demo-palette-61'].fill,
  colorSets['demo-palette-62'].fill,
  colorSets['demo-palette-55'].fill,
  colorSets['demo-palette-74'].fill,
  colorSets['demo-palette-511'].fill,
  colorSets['demo-palette-42'].fill,
  colorSets['demo-palette-43'].fill,
  colorSets['demo-palette-46'].fill,
  colorSets['demo-palette-47'].fill,
  colorSets['demo-palette-48'].fill
]

/**
 * Defines a timestamp for this demo and contains methods to handle dates and time.
 */
export class GanttTimestamp {
  time: number

  constructor(time: string | number) {
    if (typeof time === 'string') {
      this.time = Date.parse(time)
    } else {
      this.time = time
    }
  }

  /**
   * Returns the first date of the given date's month.
   */
  firstOfMonth(): GanttTimestamp {
    const date = new Date(this.time)
    date.setUTCDate(1)
    date.setUTCHours(0)
    date.setUTCMinutes(0)
    return new GanttTimestamp(date.getTime())
  }

  /**
   * Returns the last date of the given date's month.
   */
  lastOfMonth(): GanttTimestamp {
    const date = new Date(this.time)
    date.setUTCMonth(date.getUTCMonth() + 1)
    date.setUTCDate(0)
    date.setUTCHours(0)
    date.setUTCMinutes(0)
    return new GanttTimestamp(date.getTime())
  }

  /**
   * Adds the given days to this timestamp.
   */
  addDays(count: number): void {
    this.time += count * millisecondsPerDay
  }

  /**
   * Converts this timestamp in an ISO format.
   */
  toISOString(): string {
    return new Date(this.time).toISOString()
  }

  /**
   * Converts this timestamp to the local timezone.
   */
  toLocalDate(): Date {
    const date = new Date(this.time)
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000)
    return date
  }

  /**
   * Converts this timestamp to the desired format (i.e., Sunday, March 26, at 2023 00:00).
   */
  format(): string {
    const date = this.toLocalDate()
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23'
    }).format(date)
  }
}

const millisecondsPerDay = 24 * 60 * 60 * 1000
const tasks: Task[] = [...dataModel.tasks]
const originDate = new GanttTimestamp(dataModel.originDate)

/**
 * Gets the width in the graph coordinate system that corresponds to one day.
 */
export const ganttDayWidth = 80

/**
 * Calculates the x-coordinate for a given date.
 */
export function getX(day: GanttTimestamp): number {
  const durationMS = day.time - originDate.time
  return ganttDayWidth * (durationMS / millisecondsPerDay)
}

/**
 * Calculates the date for a given x-coordinate.
 */
export function getDate(x: number): GanttTimestamp {
  const milliseconds = (x / ganttDayWidth) * millisecondsPerDay
  return new GanttTimestamp(milliseconds + originDate.time)
}

/**
 * Returns the start/end dates (and their x-coordinates) that correspond to the
 * interval defined by the start and end positions.
 */
export function getVisualRange(
  startPosition: number,
  endPosition: number
): {
  startDate: GanttTimestamp
  endDate: GanttTimestamp
  startX: number
  endX: number
  oddStartDay: boolean
  oddStartMonth: boolean
} {
  const startDate = getDate(startPosition).firstOfMonth()
  const endDate = getDate(endPosition).lastOfMonth()

  const dayDiff = Math.floor((startDate.time - originDate.time) / millisecondsPerDay)
  const oddStartDay = dayDiff % 2 !== 0
  const oddStartMonth = new Date(startDate.time).getUTCMonth() % 2 !== 0

  return {
    startDate: startDate,
    endDate: endDate,
    startX: getX(startDate),
    endX: getX(endDate),
    oddStartDay,
    oddStartMonth
  }
}

/**
 * Calculates the total activity duration (in hours).
 */
export function getTotalActivityDuration(activity: Activity): number {
  const milliseconds = new Date(activity.endDate).getTime() - new Date(activity.startDate).getTime()
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  return hours + (activity.leadTime ?? 0) + (activity.followUpTime ?? 0)
}

/**
 * Returns the width of the activity's lead time.
 */
export function getLeadWidth(activity: Activity): number {
  return hoursToWorldLength(activity.leadTime ?? 0)
}

/**
 * Returns the width of the activity's follow-up time.
 */
export function getFollowUpWidth(activity: Activity): number {
  return hoursToWorldLength(activity.followUpTime ?? 0)
}

/**
 * Returns the x-coordinate of the activity's 'main' part i.e., the 'solid' one without
 * considering lead/follow-up time.
 */
export function getMainActivityX(activity: Activity, node: INode): number {
  return node.layout.x + getLeadWidth(activity)
}

/**
 * Returns the width of the activity's 'main' part i.e., the 'solid' one without
 * considering lead/follow-up time.
 */
export function getMainActivityWidth(activity: Activity, node?: INode): number {
  if (node) {
    return node.layout.width - getLeadWidth(activity) - getFollowUpWidth(activity)
  }
  const activityStartX = getX(new GanttTimestamp(activity.startDate))
  const activityEndX = getX(new GanttTimestamp(activity.endDate))
  return activityEndX - activityStartX
}

/**
 * Returns the complete width of the activity including lead/follow-up time.
 */
export function getActivityWidth(activity: Activity): number {
  return getMainActivityWidth(activity) + getLeadWidth(activity) + getFollowUpWidth(activity)
}

/**
 * Returns the task with the given id.
 */
export function getTaskForId(taskId: number): Task {
  return tasks.find((task) => task.id === taskId)!
}

/**
 * Returns the color for the given task.
 */
export function getTaskColor(task: Task): string {
  const taskIndex = tasks.findIndex((t) => t.id === task.id)
  return colorPalette[taskIndex % colorPalette.length]
}

/**
 * Updates the color of the given node based on the task row
 * in which the y-coordinate of the node lies.
 */
export function updateNodeColor(node: INode): void {
  const newColor = getTaskColor(getTask(node.layout.y))
  const style = node.style as ActivityNodeStyle
  if (style.color !== newColor) {
    style.color = newColor
  }
}

/**
 * Returns the total number of days in the month of the given timestamp.
 */
export function daysInMonth(date: GanttTimestamp): number {
  return new Date(date.lastOfMonth().time).getUTCDate()
}

/**
 * Calculates the length in world coordinates from the given duration in hours.
 */
export function hoursToWorldLength(hours: number): number {
  return (hours / 24) * ganttDayWidth
}

/**
 * Calculates the duration in hours from the given length in world coordinates.
 */
export function worldLengthToHours(worldLength: number): number {
  return (worldLength * 24) / ganttDayWidth
}

/**
 * Writes back the start/end date to the activity data associated with the given node and updates the
 * node's color based on its location.
 */
export function syncActivityWithNodeLayout(node: INode): void {
  // synchronize start and end time
  const activity = getActivity(node)
  const layout = node.layout
  activity.startDate = getDate(layout.x).toISOString()
  activity.endDate = getDate(layout.topRight.x).toISOString()

  const newTask = getTask(layout.y)
  if (activity.taskId !== newTask.id) {
    activity.taskId = newTask.id
    updateNodeColor(node)
  }
}
