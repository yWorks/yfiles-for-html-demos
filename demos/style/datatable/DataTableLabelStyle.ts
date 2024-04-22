/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { HtmlVisual, ILabel, IRenderContext, LabelStyleBase, Size } from 'yfiles'
import { DataTableRenderSupport, RenderDataCache } from './DataTableRenderSupport'
import type { UserData } from './UserDataFactory'

/**
 * A label style to display data in a tabular fashion.
 * The style uses the {@link HtmlVisual} and an HTML table to render the visual
 */
export default class DataTableLabelStyle extends LabelStyleBase {
  private readonly renderSupport = new DataTableRenderSupport()

  /**
   * Creates the visual for the given label.
   * @see Overrides {@link LabelStyleBase.createVisual}
   */
  createVisual(context: IRenderContext, label: ILabel): HtmlVisual {
    // This implementation creates a 'g' element and uses it for the rendering of the label.
    const divElement = document.createElement('div')
    // Get the necessary data for rendering of the label
    const cache = new RenderDataCache(label.owner!.tag)

    // Render the label
    this.renderSupport.render(divElement, cache, 'data-table-label')

    // move container to correct location
    const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
    transform.applyTo(divElement)

    return new HtmlVisual(divElement)
  }

  /**
   * Re-renders the label using the old visual for performance reasons.
   * @see Overrides {@link LabelStyleBase.updateVisual}
   */
  updateVisual(context: IRenderContext, oldVisual: HtmlVisual, label: ILabel): HtmlVisual {
    const container = oldVisual.element as HTMLDivElement & {
      'data-renderDataCache'?: RenderDataCache
    }
    // Get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']!
    // Get the data for the new visual
    const newCache = new RenderDataCache(label.owner!.tag)

    if (!newCache.equals(oldCache)) {
      // The data changed, create a new visual
      this.renderSupport.render(container, newCache, 'data-table-label')
    }

    // arrange because the layout might have changed
    const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
    transform.applyTo(container)

    return oldVisual
  }

  /**
   * Returns the preferred size of the label.
   * @see Overrides {@link LabelStyleBase.getPreferredSize}
   * @param label The label to which this style instance is assigned.
   * @returns The preferred size.
   */
  getPreferredSize(label: ILabel): Size {
    return DataTableRenderSupport.calculateTableSize(
      label.owner!.tag as UserData,
      'data-table-label'
    )
  }
}
