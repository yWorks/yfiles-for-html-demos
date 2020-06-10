/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { ILookup, MarkupExtension } from 'yfiles'
import MindmapEdgeStyle from './MindmapEdgeStyle.js'

/**
 * A markup extension class used for (de-)serializing a custom edge style, namely
 * MindmapEdgeStyle class, that is written in ECMAScript 6.
 */
export default class MindmapEdgeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this.$thicknessStart = 1
    this.$thicknessEnd = 1
  }

  /**
   * Gets the start thickness of an edge.
   * The explicit getter/setter is needed to support (de-)serialization.
   * @return {number}
   */
  get thicknessStart() {
    return this.$thicknessStart
  }

  /**
   * Sets the start thickness of an edge.
   * The explicit getter/setter is needed to support (de-)serialization.
   * @param {number} value
   */
  set thicknessStart(value) {
    this.$thicknessStart = value
  }

  /**
   * Gets the end thickness of an edge.
   * The explicit getter/setter is needed to support (de-)serialization.
   * @return {number}
   */
  get thicknessEnd() {
    return this.$thicknessEnd
  }

  /**
   * Sets the end thickness of an edge.
   * The explicit getter/setter is needed to support (de-)serialization.
   * @param {number} value
   */
  set thicknessEnd(value) {
    this.$thicknessEnd = value
  }

  /**
   * @param {ILookup} lookup
   * @return {MindmapEdgeStyle}
   */
  provideValue(lookup) {
    return new MindmapEdgeStyle(this.thicknessStart, this.thicknessEnd)
  }
}
