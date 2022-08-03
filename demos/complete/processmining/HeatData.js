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
export class HeatData {
  /**
   * @param {number} [elements=64]
   * @param {number} [minTime=0]
   * @param {number} [maxTime=1]
   */
  constructor(elements = 64, minTime = 0, maxTime = 1) {
    this.values = new Float32Array(elements)
    this.minTime = minTime
    this.maxTime = maxTime
  }

  /**
   * @param {number} time
   * @returns {number}
   */
  getValue(time) {
    if (time < this.minTime || time >= this.maxTime) {
      return 0
    } else {
      const ratio = this.calculateRatio(time)
      const index = Math.floor(ratio)
      const fraction = ratio - index
      if (index + 1 < this.values.length) {
        return this.values[index] * (1 - fraction) + this.values[index + 1] * fraction
      } else {
        return this.values[index]
      }
    }
  }

  /**
   * @param {number} time
   * @param {number} value
   */
  addValue(time, value) {
    if (time >= this.minTime && time < this.maxTime) {
      const ratio = this.calculateRatio(time)
      const index = Math.floor(ratio)
      const fraction = ratio - index
      if (fraction > 0) {
        this.values[index] += (1 - fraction) * value
        this.values[index + 1] += value * fraction
      } else {
        this.values[index] += value
      }
    }
  }

  /**
   * @param {number} time
   * @returns {number}
   */
  calculateRatio(time) {
    return ((time - this.minTime) / (this.maxTime - this.minTime)) * this.values.length
  }
}
