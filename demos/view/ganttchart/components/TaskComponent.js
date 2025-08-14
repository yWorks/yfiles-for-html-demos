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
import { ganttChartData as dataModel } from '../resources/gantt-chart-data'
import { getTaskColor } from '../gantt-utils'
import { ganttTaskSpacing, getCompleteTaskHeight } from '../sweepline-layout'

/**
 * Manages the html task elements on the left vertical sidebar.
 */
export class TaskComponent {
  parent
  taskWrapper

  constructor(parentElementId, graphComponent) {
    this.parent = document.getElementById(parentElementId)
    this.parent.style.marginTop = `${70 + ganttTaskSpacing * 0.5}px`

    this.taskWrapper = document.createElement('div')
    this.taskWrapper.className = 'task-list'

    this.parent.append(this.taskWrapper)

    // synchronize with y-axis with the graphComponent
    graphComponent.addEventListener('viewport-changed', (_, graphComponent) => {
      this.taskWrapper.style.top = `${-graphComponent.viewPoint.y}px`
    })
  }

  /**
   * Creates a div element for each task stored in the data and assigns the corresponding task color.
   */
  createTasks() {
    dataModel.tasks.forEach((task) => {
      const height = getCompleteTaskHeight(task) + ganttTaskSpacing
      const taskDiv = document.createElement('div')
      taskDiv.className = 'task-list__task'
      taskDiv.dataset.taskId = String(task.id)
      taskDiv.style.backgroundColor = getTaskColor(task)
      taskDiv.style.height = `${height}px`
      taskDiv.innerHTML = task.name

      this.taskWrapper.append(taskDiv)
    })
  }

  /**
   * Updates the height of each task element.
   * Called when node positions have been modified.
   */
  updateTasks() {
    dataModel.tasks.forEach((task) => {
      const elem = this.getTaskElementById(task.id)
      if (elem) {
        const height = getCompleteTaskHeight(task) + ganttTaskSpacing
        elem.style.height = `${height}px`
      }
    })
  }

  /**
   * Returns the task element with the given id, if exists.
   */
  getTaskElementById(id) {
    for (const taskElem of this.taskWrapper.children) {
      if (taskElem instanceof HTMLElement && Number(taskElem.dataset.taskId) === id) {
        return taskElem
      }
    }
    return null
  }
}
