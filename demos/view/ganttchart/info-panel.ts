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
import type { Activity } from './resources/data-model'
import type { CanvasComponent, GraphComponent, Point } from 'yfiles'
import { GanttTimestamp, getTaskColor, getTaskForId, getTotalActivityDuration } from './gantt-utils'

export function showInfo(text: string, location: Point, canvasComponent: CanvasComponent): void {
  const info = document.getElementById('info') as HTMLDivElement
  const pageLocation = canvasComponent.toPageFromView(canvasComponent.toViewCoordinates(location))
  info.textContent = text
  info.classList.remove('hidden')

  const width = info.clientWidth
  const height = info.clientHeight
  const gcViewBox = canvasComponent.div.getBoundingClientRect()

  info.style.left = `${Math.max(
    gcViewBox.x,
    Math.min(pageLocation.x - width * 0.5, gcViewBox.x + gcViewBox.width - width)
  )}px`
  info.style.top = `${pageLocation.y - height - 10}px`
}

export function hideInfo(): void {
  document.getElementById('info')!.classList.add('hidden')
}

/**
 * Shows information about the given activity.
 */
export function showActivityInfo(
  activity: Activity,
  location: Point,
  graphComponent: GraphComponent
): void {
  const width = 400
  const viewLocation = graphComponent.toViewCoordinates(location)
  const pageLocation = graphComponent.toPageFromView(viewLocation)

  const formatted = (isoString: string): string => {
    return new GanttTimestamp(isoString).format()
  }

  const createEntry = (name: string, content?: string | number): HTMLElement => {
    const entry = document.createElement('div')
    entry.className = 'node-info__row'
    entry.innerHTML = `<div class="node-info__cell">${name}</div><div class="node-info__cell">${content}</div>`
    return entry
  }

  const nodeInfo = document.getElementById('node-info')! as HTMLElement
  nodeInfo.innerText = ''

  const nodeInfoName = document.createElement('div')
  nodeInfoName.className = 'node-info__name'
  nodeInfoName.textContent = activity.name!

  const nodeInfoContent = document.createElement('div')
  nodeInfoContent.className = 'node-info__content'
  nodeInfoContent.append(
    createEntry('Start Time', formatted(activity.startDate)),
    createEntry('End Time', formatted(activity.endDate)),
    createEntry('Lead time', `${activity.leadTime ?? 0}h`),
    createEntry('Follow-up Time', `${activity.followUpTime ?? 0}h`),
    createEntry('Total Duration', `${getTotalActivityDuration(activity)}h`),
    createEntry('Task', getTaskForId(activity.taskId).name)
  )

  nodeInfo.append(nodeInfoName, nodeInfoContent)
  nodeInfo.style.width = `${width}px`
  nodeInfo.style.border = `3px solid ${getTaskColor(getTaskForId(activity.taskId))}`
  nodeInfo.classList.remove('hidden')

  const gcViewBox = graphComponent.div.getBoundingClientRect()
  const xPosition = Math.max(
    gcViewBox.x,
    Math.min(pageLocation.x - width * 0.5, gcViewBox.x + gcViewBox.width - width)
  )
  const yPosition =
    viewLocation.y > 200
      ? pageLocation.y - nodeInfo.getBoundingClientRect().height - 30
      : pageLocation.y + 30

  nodeInfo.style.left = `${xPosition}px`
  nodeInfo.style.top = `${yPosition}px`
}

/**
 * Hides the tool tip that displays detailed information for selected nodes.
 */
export function hideActivityInfo(): void {
  document.getElementById('node-info')!.classList.add('hidden')
}
