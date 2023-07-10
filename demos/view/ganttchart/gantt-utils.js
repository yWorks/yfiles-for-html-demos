/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { getActivity } from './resources/data-model.js'
import { colorSets } from 'demo-resources/demo-colors'
import { getTask } from './sweepline-layout.js'
import { ganttChartData as dataModel } from './resources/gantt-chart-data.js'

export const colorPalette = [
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
  time

  /**
   * @param {!(string|number)} time
   */
  constructor(time) {
    if (typeof time === 'string') {
      this.time = Date.parse(time)
    } else {
      this.time = time
    }
  }

  /**
   * Returns the first date of the given date's month.
   * @returns {!GanttTimestamp}
   */
  firstOfMonth() {
    const date = new Date(this.time)
    date.setUTCDate(1)
    date.setUTCHours(0)
    date.setUTCMinutes(0)
    return new GanttTimestamp(date.getTime())
  }

  /**
   * Returns the last date of the given date's month.
   * @returns {!GanttTimestamp}
   */
  lastOfMonth() {
    const date = new Date(this.time)
    date.setUTCMonth(date.getUTCMonth() + 1)
    date.setUTCDate(0)
    date.setUTCHours(0)
    date.setUTCMinutes(0)
    return new GanttTimestamp(date.getTime())
  }

  /**
   * Adds the given days to this timestamp.
   * @param {number} count
   */
  addDays(count) {
    this.time += count * millisecondsPerDay
  }

  /**
   * Converts this timestamp in an ISO format.
   * @returns {!string}
   */
  toISOString() {
    return new Date(this.time).toISOString()
  }

  /**
   * Converts this timestamp to the local timezone.
   * @returns {!Date}
   */
  toLocalDate() {
    const date = new Date(this.time)
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000)
    return date
  }

  /**
   * Converts this timestamp to the desired format (i.e., Sunday, March 26, at 2023 00:00).
   * @returns {!string}
   */
  format() {
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
const tasks = [...dataModel.tasks]
const originDate = new GanttTimestamp(dataModel.originDate)

/**
 * Gets the width in the graph coordinate system that corresponds to one day.
 */
export const ganttDayWidth = 80

/**
 * Calculates the x-coordinate for a given date.
 * @param {!GanttTimestamp} day
 * @returns {number}
 */
export function getX(day) {
  const durationMS = day.time - originDate.time
  return ganttDayWidth * (durationMS / millisecondsPerDay)
}

/**
 * Calculates the date for a given x-coordinate.
 * @param {number} x
 * @returns {!GanttTimestamp}
 */
export function getDate(x) {
  const milliseconds = (x / ganttDayWidth) * millisecondsPerDay
  return new GanttTimestamp(milliseconds + originDate.time)
}

/**
 * Returns the start/end dates (and their x-coordinates) that correspond to the
 * interval defined by the start and end positions.
 * @param {number} startPosition
 * @param {number} endPosition
 * @returns {!object}
 */
export function getVisualRange(startPosition, endPosition) {
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
 * @param {!Activity} activity
 * @returns {number}
 */
export function getTotalActivityDuration(activity) {
  const milliseconds = new Date(activity.endDate).getTime() - new Date(activity.startDate).getTime()
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  return hours + (activity.leadTime ?? 0) + (activity.followUpTime ?? 0)
}

/**
 * Returns the width of the activity's lead time.
 * @param {!Activity} activity
 * @returns {number}
 */
export function getLeadWidth(activity) {
  return hoursToWorldLength(activity.leadTime ?? 0)
}

/**
 * Returns the width of the activity's follow-up time.
 * @param {!Activity} activity
 * @returns {number}
 */
export function getFollowUpWidth(activity) {
  return hoursToWorldLength(activity.followUpTime ?? 0)
}

/**
 * Returns the x-coordinate of the activity's 'main' part i.e., the 'solid' one without
 * considering lead/follow-up time.
 * @param {!Activity} activity
 * @param {!INode} node
 * @returns {number}
 */
export function getMainActivityX(activity, node) {
  return node.layout.x + getLeadWidth(activity)
}

/**
 * Returns the width of the activity's 'main' part i.e., the 'solid' one without
 * considering lead/follow-up time.
 * @param {!Activity} activity
 * @param {!INode} [node]
 * @returns {number}
 */
export function getMainActivityWidth(activity, node) {
  if (node) {
    return node.layout.width - getLeadWidth(activity) - getFollowUpWidth(activity)
  }
  const activityStartX = getX(new GanttTimestamp(activity.startDate))
  const activityEndX = getX(new GanttTimestamp(activity.endDate))
  return activityEndX - activityStartX
}

/**
 * Returns the complete width of the activity including lead/follow-up time.
 * @param {!Activity} activity
 * @returns {number}
 */
export function getActivityWidth(activity) {
  return getMainActivityWidth(activity) + getLeadWidth(activity) + getFollowUpWidth(activity)
}

/**
 * Returns the task with the given id.
 * @param {number} taskId
 * @returns {!Task}
 */
export function getTaskForId(taskId) {
  return tasks.find(task => task.id === taskId)
}

/**
 * Returns the color for the given task.
 * @param {!Task} task
 * @returns {!string}
 */
export function getTaskColor(task) {
  const taskIndex = tasks.findIndex(t => t.id === task.id)
  return colorPalette[taskIndex % colorPalette.length]
}

/**
 * Updates the color of the given node based on the task row
 * in which the y-coordinate of the node lies.
 * @param {!INode} node
 */
export function updateNodeColor(node) {
  const newColor = getTaskColor(getTask(node.layout.y))
  const style = node.style
  if (style.color !== newColor) {
    style.color = newColor
  }
}

/**
 * Returns the total number of days in the month of the given timestamp.
 * @param {!GanttTimestamp} date
 * @returns {number}
 */
export function daysInMonth(date) {
  return new Date(date.lastOfMonth().time).getUTCDate()
}

/**
 * Calculates the length in world coordinates from the given duration in hours.
 * @param {number} hours
 * @returns {number}
 */
export function hoursToWorldLength(hours) {
  return (hours / 24) * ganttDayWidth
}

/**
 * Calculates the duration in hours from the given length in world coordinates.
 * @param {number} worldLength
 * @returns {number}
 */
export function worldLengthToHours(worldLength) {
  return (worldLength * 24) / ganttDayWidth
}

/**
 * Writes back the start/end date to the activity data associated with the given node and updates the
 * node's color based on its location.
 * @param {!INode} node
 */
export function syncActivityWithNodeLayout(node) {
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
