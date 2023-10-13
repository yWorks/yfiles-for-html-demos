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
import {
  Color,
  Enum,
  Fill,
  GraphInputMode,
  HorizontalTextAlignment,
  ILabel,
  LabelShape,
  Point,
  TextWrapping,
  TimeSpan,
  VerticalTextAlignment
} from 'yfiles'

/**
 * Configures the given input mode to show tool tips for labels.
 * The tool tips show a description of the corresponding label's configuration.
 * @param {!GraphInputMode} inputMode
 */
export function configureToolTips(inputMode) {
  // Customize the tool tip's behavior to our liking.
  const mouseHoverInputMode = inputMode.mouseHoverInputMode
  mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
  mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(50)
  mouseHoverInputMode.duration = TimeSpan.fromSeconds(10)

  // Register a listener for when a tool tip should be shown.
  inputMode.addQueryItemToolTipListener((_, evt) => {
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
 * @param {!ILabel} label
 * @returns {!HTMLElement}
 */
function createToolTipContent(label) {
  const style = label.style

  const title = document.createElement('h4')
  title.innerHTML = 'Properties of "' + label.text + '"'
  const grid1 = document.createElement('div')
  grid1.classList.add('tooltip-content')
  addToToolTipGrid(grid1, 'Shape', Enum.getName(LabelShape.$class, style.shape))
  addToToolTipGrid(grid1, 'Background Fill', style.backgroundFill)
  addToToolTipGrid(
    grid1,
    'Insets',
    `[${style.insets.top}, ${style.insets.right}, ${style.insets.bottom}, ${style.insets.left}]`
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
    Enum.getName(HorizontalTextAlignment.$class, style.horizontalTextAlignment)
  )
  addToToolTipGrid(
    grid2,
    'Vertical Alignment',
    Enum.getName(VerticalTextAlignment.$class, style.verticalTextAlignment)
  )
  addToToolTipGrid(grid2, 'Wrapping', Enum.getName(TextWrapping.$class, style.wrapping))
  addToToolTipGrid(grid2, 'Clip Text', String(style.clipText))

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
 * @param {!HTMLDivElement} grid
 * @param {!string} key
 * @param {!(string|Fill)} value
 */
function addToToolTipGrid(grid, key, value) {
  const keySpan = document.createElement('span')
  keySpan.innerHTML = key
  grid.appendChild(keySpan)

  const valueSpan = document.createElement('span')
  if (typeof value === 'string') {
    valueSpan.innerHTML = value
  } else {
    valueSpan.classList.add('color')
    valueSpan.setAttribute('style', `background-color: ${fillToHexString(value)};`)
  }
  grid.appendChild(valueSpan)
}

/**
 * Returns the hexadecimal representation of the given solid color fill.
 * @param {!Fill} fill
 * @returns {!string}
 */
function fillToHexString(fill) {
  return colorToHexString(fill.color)
}

/**
 * Returns the hexadecimal representation of the given color.
 * @param {!Color} c
 * @returns {!string}
 */
function colorToHexString(c) {
  return '#' + (toHexString(c.r) + toHexString(c.g) + toHexString(c.b)).toUpperCase()
}

/**
 * Returns the hexadecimal representation of the given number.
 * This methods assumes a value in the range [0, 255].
 * @param {number} value
 * @returns {!string}
 */
function toHexString(value) {
  return (value < 16 ? '0' : '') + value.toString(16)
}
