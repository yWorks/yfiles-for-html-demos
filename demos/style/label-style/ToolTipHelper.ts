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
import type { CssFill, LabelStyle } from '@yfiles/yfiles'
import {
  Fill,
  GraphInputMode,
  HorizontalTextAlignment,
  ILabel,
  LabelShape,
  Point,
  TextWrapping,
  TimeSpan,
  VerticalTextAlignment
} from '@yfiles/yfiles'

/**
 * Configures the given input mode to show tool tips for labels.
 * The tool tips show a description of the corresponding label's configuration.
 */
export function configureToolTips(inputMode: GraphInputMode): void {
  // Customize the tool tip's behavior to our liking.
  const toolTipInputMode = inputMode.toolTipInputMode
  toolTipInputMode.toolTipLocationOffset = new Point(15, 15)
  toolTipInputMode.delay = TimeSpan.fromMilliseconds(50)
  toolTipInputMode.duration = TimeSpan.fromSeconds(10)

  // Register a listener for when a tool tip should be shown.
  inputMode.addEventListener('query-item-tool-tip', (evt): void => {
    if (evt.handled) {
      // Tool tip content has already been assigned -> nothing to do.
      return
    }

    // Use a rich HTML element as tool tip content. Alternatively, a plain string would do as well.
    if (evt.item instanceof ILabel) {
      evt.toolTip = createToolTipContent(evt.item)
      // Indicate that the tool tip content has been set.
      evt.handled = true
    }
  })
}

/**
 * The tool tip may either be a plain string or it can also be a rich HTML element. In this case, we
 * show the latter. We just extract the first label text from the given item and show it as
 * tool tip.
 */
function createToolTipContent(label: ILabel): HTMLElement {
  const style = label.style as LabelStyle

  const title = document.createElement('h4')
  title.innerHTML = 'Properties of "' + label.text + '"'
  const grid1 = document.createElement('div')
  grid1.classList.add('tooltip-content')
  addToToolTipGrid(grid1, 'Shape', LabelShape[style.shape])
  addToToolTipGrid(grid1, 'Background Fill', style.backgroundFill!)
  addToToolTipGrid(
    grid1,
    'Insets',
    `[${style.padding.top}, ${style.padding.right}, ${style.padding.bottom}, ${style.padding.left}]`
  )

  const textTitle = document.createElement('h4')
  textTitle.innerHTML = 'Text properties'
  const grid2 = document.createElement('div')
  grid2.classList.add('tooltip-content')
  addToToolTipGrid(grid2, 'Font', `${style.font.fontFamily}, ${style.font.fontSize}`)
  addToToolTipGrid(grid2, 'Text Color', style.textFill)
  addToToolTipGrid(
    grid2,
    'Horizontal Alignment',
    HorizontalTextAlignment[style.horizontalTextAlignment]
  )
  addToToolTipGrid(grid2, 'Vertical Alignment', VerticalTextAlignment[style.verticalTextAlignment])
  addToToolTipGrid(grid2, 'Wrapping', TextWrapping[style.wrapping])

  // build the tooltip container
  const toolTip = document.createElement('div')
  toolTip.classList.add('tooltip-container')
  toolTip.appendChild(title)
  toolTip.appendChild(grid1)
  toolTip.appendChild(textTitle)
  toolTip.appendChild(grid2)
  return toolTip
}

/**
 * Adds a property with a given key and value to the grid div element that shows properties
 * as key-value pairs.
 */
function addToToolTipGrid(grid: HTMLDivElement, key: string, value: string | Fill): void {
  const keySpan = document.createElement('span')
  keySpan.innerHTML = key
  grid.appendChild(keySpan)

  const valueSpan = document.createElement('span')
  if (typeof value === 'string') {
    valueSpan.innerHTML = value
  } else {
    valueSpan.classList.add('color')
    valueSpan.setAttribute('style', `background-color: ${(value as CssFill).value};`)
  }

  grid.appendChild(valueSpan)
}
