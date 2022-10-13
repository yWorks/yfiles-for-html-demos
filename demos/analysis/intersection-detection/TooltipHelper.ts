/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { IEdge, IModelItem, INode, Intersection, Point } from 'yfiles'
import { addClass } from '../../resources/demo-app'


/**
 * The tool tip may either be a plain string or it can also be a rich HTML element. In this case, we
 * show the latter. We just extract the first label text from the given item and show it as
 * tool tip.
 */
export function createToolTipContent(item: IModelItem, intersectionInfoArray: Intersection[]): HTMLElement | null {
  const filteredIntersections = intersectionInfoArray.filter(intersection => item === intersection.item1 || item === intersection.item2)
  if (filteredIntersections.length === 0) {
    return null
  }
  const title = document.createElement('h3')
  addClass(title, 'tooltip-title')
  title.innerHTML = 'Intersections Info'

  const toolTip = document.createElement('div')
  addClass(toolTip, 'tooltip-container')
  toolTip.appendChild(title)

  let n = 0
  for (const intersection of filteredIntersections) {
    const item1 = intersection.item1
    const item2 = intersection.item2

    const grid1 = document.createElement('div')
    addClass(grid1, 'tooltip-content')

    let intersectionType
    if (item1 instanceof INode && item2 instanceof INode) {
      intersectionType = 'Node-Node'
    } else if (item1 instanceof IEdge && item2 instanceof IEdge) {
      intersectionType = 'Edge-Edge'
    } else if (
      (item1 instanceof IEdge && item2 instanceof INode) ||
      (item1 instanceof INode && item2 instanceof IEdge)
    ) {
      intersectionType = 'Node-Edge'
    } else {
      intersectionType = 'Label-Label'
    }
    addToToolTipGrid(grid1, 'Intersection Type', intersectionType)
    let result
    const pointsNum = intersection.intersectionPoints.size
    if (pointsNum > 2) {
      result = 'Polygon'
    } else if (pointsNum === 2) {
      result = 'Line'
    } else {
      result = 'Single point'
    }
    addToToolTipGrid(grid1, 'Geometrical Result', result)
    toolTip.appendChild(grid1)

    const grid2 = document.createElement('div')
    addClass(grid2, 'tooltip-content')
    addToToolTipGrid(grid2, 'Intersection Points', '')

    let i = 1
    for (const point of intersection.intersectionPoints) {
      addToToolTipGrid(grid2, `Point ${i++}`, getRoundedPoint(point))
    }
    toolTip.appendChild(grid2)
    if (n++ !== filteredIntersections.length - 1) {
      const separator = document.createElement('hr')
      addClass(separator, 'tooltip-separator')
      toolTip.appendChild(separator)
    }
  }
  return toolTip
}

function getRoundedPoint(p: Point) {
  return `[${Math.round(p.x * 10) / 10}, ${Math.round(p.y * 10) / 10}]`
}

/**
 * Adds a property with a given key and value to the grid div element that shows properties
 * as key-value pairs.
 */
function addToToolTipGrid(grid: HTMLDivElement, key: string, value: string): void {
  const keySpan = document.createElement('span')
  addClass(keySpan, 'tooltip-key')
  keySpan.innerHTML = key
  grid.appendChild(keySpan)

  const valueSpan = document.createElement('span')
  valueSpan.innerHTML = value
  grid.appendChild(valueSpan)
}

