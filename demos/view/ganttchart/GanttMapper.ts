/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import type { DateTime as DateTimeType } from 'luxon'

const { DateTime } = luxon

/**
 * A helper class that handles the data model and maps graph coordinates to the corresponding dates.
 * The originDate specified in the data model is set as the origin on the x-axis.
 * The first task is placed at the origin of the y axis. Subsequent tasks are placed below.
 * @yjs:keep = duration
 */
export class GanttMapper {
  private readonly _originDate: DateTimeType
  tasks: Task[]
  private _subRowMap: Map<Activity, number> = new Map()
  private _subRowCountMap: Map<number, number> = new Map()

  constructor(dataModel: Record<string, any>) {
    this._originDate = DateTime.fromISO(dataModel.originDate)
    this.tasks = dataModel.tasks.slice()
  }

  /**
   * Calculates the x coordinate for a given date.
   */
  getX(day: DateTimeType): number {
    const duration = day.diff(this._originDate, 'minutes').minutes
    // 1440 = 24 * 60 = minutes of 1 day
    return GanttMapper.dayWidth * (duration / 1440)
  }

  /**
   * Calculates the date for a given x coordinate.
   */
  getDate(x: number): DateTimeType {
    // 1440 = 24 * 60 = minutes of 1 day
    const minutes = ((x / GanttMapper.dayWidth) * 1440) | 0
    return this._originDate.plus({ minutes })
  }

  getVisualRange(start: number, end: number) {
    const startDate = this.getDate(start).startOf('month')
    const endDate = this.getDate(end).endOf('month')

    const dayDiff = startDate.diff(this.originDate, 'days').as('days')
    const oddStartDay = dayDiff % 2 !== 0
    const oddStartMonth = startDate.month % 2 !== 0

    return {
      startDate: startDate.toJSDate(),
      endDate: endDate.toJSDate(),
      startX: this.getX(startDate),
      endX: this.getX(endDate),
      oddStartDay,
      oddStartMonth
    }
  }

  /**
   * Gets the y coordinate for a given activity, considering the sub row information.
   */
  getActivityY(activity: Activity): number {
    const taskId = activity.taskId
    const task = this.tasks.find(t => t.id === taskId)!
    let y: number = this.getTaskY(task) + GanttMapper.activitySpacing
    const subRow = this.getSubRowIndex(activity)
    y += subRow * (GanttMapper.activityHeight + GanttMapper.activitySpacing)
    return y
  }

  /**
   * Gets the y coordinate for a given task.
   */
  getTaskY(task: Task): number {
    const index = this.tasks.findIndex(t => t.id === task.id)
    let height: number = GanttMapper.taskSpacing
    for (let i = 0; i < index; i++) {
      height += this.getCompleteTaskHeight(this.tasks[i]) + GanttMapper.taskSpacing
    }
    return height
  }

  /**
   * Gets the task at the given y coordinate.
   */
  getTask(y: number): Task {
    let currentY = 0
    for (let i = 0; i < this.tasks.length; i++) {
      const task = this.tasks[i]
      currentY += this.getCompleteTaskHeight(task) + GanttMapper.taskSpacing
      if (currentY > y) {
        return task
      }
    }
    return this.tasks[this.tasks.length - 1]
  }

  /**
   * Gets the task with the given id.
   */
  getTaskForId(taskId: number): Task {
    return this.tasks.find(task => task.id === taskId)!
  }

  /**
   * Calculates the task height, including sub rows and spacing.
   */
  getCompleteTaskHeight(task: Task): number {
    const subRowCount = this.getSubRowCount(task)
    return (
      subRowCount * (GanttMapper.activityHeight + GanttMapper.activitySpacing) +
      GanttMapper.activitySpacing
    )
  }

  /**
   * Gets the sub row in which the given activity is placed.
   */
  getSubRowIndex(activity: Activity): number {
    if (typeof this._subRowMap.get(activity) !== 'undefined') {
      return this._subRowMap.get(activity)!
    }
    return 0
  }

  /**
   * Gets the number of sub rows for a given task.
   */
  getSubRowCount(task: Task): number {
    return typeof this._subRowCountMap.get(task.id) === 'number'
      ? this._subRowCountMap.get(task.id)!
      : 1
  }

  get subRowMap(): Map<Activity, number> {
    return this._subRowMap
  }

  get subRowCountMap(): Map<number, number> {
    return this._subRowCountMap
  }

  /**
   * Calculates the total activity duration in hours
   */
  getTotalActivityDuration(activity: Activity): number {
    const hours = DateTime.fromISO(activity.endDate)
      .diff(DateTime.fromISO(activity.startDate), 'hours')
      .as('hours')
    return (hours + (activity.leadTime || 0) + (activity.followUpTime || 0)) | 0
  }

  /**
   * Calculates the length in world coordinates from the given duration in hours.
   */
  hoursToWorldLength(hours: number): number {
    return (hours / 24.0) * GanttMapper.dayWidth
  }

  /**
   * Calculates the duration in hours from the given length in world coordinates.
   */
  worldLengthToHours(worldLength: number): number {
    return ((worldLength * 24) / GanttMapper.dayWidth) | 0
  }

  /**
   * Gets the date corresponding to x=0.
   */
  get originDate(): DateTimeType {
    return this._originDate
  }

  /**
   * Gets the width in the graph coordinate system that corresponds to one day.
   */
  static get dayWidth(): number {
    return 80
  }

  static daysInMonth(date: Date): number {
    return DateTime.fromJSDate(date).daysInMonth
  }

  static get taskSpacing(): number {
    return 10
  }

  static get activitySpacing(): number {
    return 20
  }

  static get activityHeight(): number {
    return 40
  }
}

export type Activity = {
  id: number
  name?: string
  taskId: number
  startDate: string
  endDate: string
  leadTime?: number
  dependencies?: number[]
  followUpTime?: number
}

export type Task = {
  id: number
  name: string
  color: { r: number; g: number; b: number }
}
