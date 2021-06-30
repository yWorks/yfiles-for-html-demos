/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* global moment */

// import moment typings
import moment, { MomentInput, Moment } from 'moment'

/**
 * A helper class that handles the data model and maps graph coordinates to the corresponding dates.
 * The originDate specified in the data model is set as the origin on the x-axis.
 * The first task is placed at the origin of the y axis. Subsequent tasks are placed below.
 * @yjs:keep=duration
 */
export default class GanttMapper {
  private readonly _originDate: Moment
  tasks: Task[]
  private _subRowMap: Map<Activity, number> = new Map()
  private _subRowCountMap: Map<number, number> = new Map()

  constructor(dataModel: any) {
    this._originDate = moment(dataModel.originDate)
    this.tasks = dataModel.tasks.slice()
  }

  /**
   * Calculates the x coordinate for a given date.
   */
  getX(date: MomentInput): number {
    const momentDate = moment(date)
    const duration = moment.duration(momentDate.diff(this._originDate))
    const days = duration.asHours() / 24.0
    return days * GanttMapper.dayWidth
  }

  /**
   * Calculates the date for a given x coordinate.
   */
  getDate(x: number): Moment {
    const duration = x / GanttMapper.dayWidth
    const durationMin = (duration * 24 * 60) | 0
    return moment(this._originDate).add(moment.duration(durationMin, 'minutes'))
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
    const duration = moment.duration(moment(activity.endDate).diff(moment(activity.startDate)))
    return (duration.asHours() + (activity.leadTime || 0) + (activity.followUpTime || 0)) | 0
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
  get originDate(): Moment {
    return moment(this._originDate)
  }

  static format(date: MomentInput, formatString: string): string {
    return moment(date).format(formatString)
  }

  /**
   * Gets the width in the graph coordinate system that corresponds to one day.
   */
  static get dayWidth(): number {
    return 80
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
