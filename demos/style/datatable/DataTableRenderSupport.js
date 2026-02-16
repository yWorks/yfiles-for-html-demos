/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Size } from '@yfiles/yfiles'

/**
 * Creates the visual appearance for data tables.
 */
export class DataTableRenderSupport {
  /**
   * Creates the visual appearance of a data table for the given size and data cache.
   * @param container The parent {@link HTMLDivElement} element for the new visualization.
   * @param cache The render data cache for the data table.
   * @param cssClass The CSS class that is added to the visual
   */
  render(container, cache, cssClass) {
    container.innerHTML = DataTableRenderSupport.createTableMarkup(
      cache.propertyNames,
      cache.data,
      cssClass
    )
  }

  /**
   * Creates the HTML text for the data table
   * @param names the property names of the data
   * @param data the data
   * @param cssClass the CSS class that is added to the visual
   */
  static createTableMarkup(names, data, cssClass) {
    let tableText = `<table class="${cssClass}">`
    if (names) {
      names.forEach((name) => {
        const userDatum = data[name]
        tableText += `<tr><td>${DataTableRenderSupport.toTitleCase(name)}</td><td>${userDatum}</td></tr>`
      })
    } else {
      tableText += `<tr><td>Empty</td></tr>`
    }
    tableText += '</table>'
    return tableText
  }

  /**
   * Converts the given string to title case.
   */
  static toTitleCase(text) {
    return text.replace(
      new RegExp('\\w\\S*', 'g'),
      (txt) => txt.substring(0, 1).toUpperCase() + txt.substring(1).toLowerCase()
    )
  }

  static calculateTableSize(userData, cssClass) {
    const div = document.createElement('div')
    div.style.setProperty('display', 'inline-block')
    div.style.setProperty('position', 'fixed')
    div.innerHTML = DataTableRenderSupport.createTableMarkup(
      Object.keys(userData),
      userData,
      cssClass
    )
    document.body.appendChild(div)
    const clientRect = div.getBoundingClientRect()
    document.body.removeChild(div)
    return new Size(clientRect.width, clientRect.height)
  }
}

/**
 * Saves the data to speed up node/label style rendering.
 */
export class RenderDataCache {
  data
  propertyNames

  constructor(data) {
    this.data = data
    this.propertyNames = this.data ? Object.keys(data) : []
  }

  /**
   * Returns whether this data has the same visual representation as the given other data.
   */
  hasSameVisual(other) {
    return this.data === other.data
  }

  equals(obj) {
    return !!obj && obj instanceof RenderDataCache && this.hasSameVisual(obj)
  }
}
