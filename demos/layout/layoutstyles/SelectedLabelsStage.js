/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { LayoutStageBase } from 'yfiles'
import MyDataProviderAdapter from './MyDataProviderAdapter.js'

/**
 * A layout stage that takes care to convert the selected labels mapper into the respective data provider.
 * Unfortunately, mappers for labels are not converted into working data providers for labels automatically.
 */
export default class SelectedLabelsStage extends LayoutStageBase {
  /** @type {string} */
  static get PROVIDER_KEY() {
    return 'YetAnotherKey'
  }

  static get SELECTED_LABELS_AT_ITEM_KEY() {
    return 'SelectedLabelsAtItem'
  }

  applyLayout(graph) {
    const dataProvider = graph.getDataProvider(SelectedLabelsStage.SELECTED_LABELS_AT_ITEM_KEY)
    graph.addDataProvider(
      SelectedLabelsStage.PROVIDER_KEY,
      new MyDataProviderAdapter(dataProvider, graph)
    )
    this.applyLayoutCore(graph)
    graph.removeDataProvider(SelectedLabelsStage.PROVIDER_KEY)
  }
}
