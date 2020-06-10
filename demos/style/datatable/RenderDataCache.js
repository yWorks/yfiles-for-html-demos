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
import { Font, Point, Size } from 'yfiles'

/**
 * Saves the data which is necessary for the creation of a style and some additional information
 * to speed up node/label style rendering.
 */
export default class RenderDataCache {
  /**
   * @param {object} data
   * @param {Font} font
   * @param {Size} size
   * @param {Point} location
   */
  constructor(data, font, size, location) {
    this.size = size || Size.EMPTY
    this.location = location || Point.ORIGIN
    this.data = data
    this.font = font
    this.propertyNames = data !== null ? Object.keys(data) : []

    this.lineHeight = -1.0
    this.maxLabelWidth = -1.0
  }

  /** @type {Object} */
  get data() {
    return this.$data
  }

  /** @type {Object} */
  set data(value) {
    this.$data = value
  }

  /** @type {Font} */
  get font() {
    return this.$font
  }

  /** @type {Font} */
  set font(value) {
    this.$font = value
  }

  /** @type {Size} */
  get size() {
    return this.$size
  }

  /** @type {Size} */
  set size(value) {
    this.$size = value
  }

  /** @type {Point} */
  get location() {
    return this.$location
  }

  /** @type {Point} */
  set location(value) {
    this.$location = value
  }

  /** @type {number} */
  get lineHeight() {
    return this.$lineHeight
  }

  /** @type {number} */
  set lineHeight(value) {
    this.$lineHeight = value
  }

  /** @type {number} */
  get maxLabelWidth() {
    return this.$maxLabelWidth
  }

  /** @type {number} */
  set maxLabelWidth(value) {
    this.$maxLabelWidth = value
  }

  /**
   * Adopts the values for line height and label widths from the given {@link RenderDataCache} if appropriate.
   * @param {RenderDataCache} other
   */
  adoptValues(other) {
    if (!this.font.equals(other.font)) {
      return
    }
    this.lineHeight = other.lineHeight
    if (this.data === other.data) {
      this.maxLabelWidth = other.maxLabelWidth
      this.propertyNames = other.propertyNames
    }
  }

  /**
   * Returns whether this data has the same visual representation (ignoring location and size) as the given other
   * data.
   * @param {RenderDataCache} other
   * @return {boolean}
   */
  hasSameVisual(other) {
    return this.data === other.data && other.font.equals(this.font)
  }

  /**
   * @param {object} obj
   * @return {boolean}
   */
  equals(obj) {
    return obj !== null && obj instanceof RenderDataCache && this.hasSameVisual(obj)
  }
}
