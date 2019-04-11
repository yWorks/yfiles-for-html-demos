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
import { Class, ILookup, MarkupExtension } from 'yfiles'
import MindmapNodeStyleRoot from './MindmapNodeStyleRoot.js'

/**
 * A markup extension class used for (de-)serializing a custom node style, namely
 * MindmapNodeStyleRoot class, that is written in ECMAScript 6.
 */
const MindmapNodeStyleRootExtension = Class('MindmapNodeStyleRootExtension', {
  $extends: MarkupExtension,

  /**
   * Backing field for below property
   * @type {string}
   */
  $className: '',

  /**
   * Gets or sets the class name.
   * The explicit getter/setter is needed to support (de-)serialization.
   * @type {string}
   */
  className: {
    get: function() {
      return this.$className
    },
    set: function(value) {
      this.$className = value
    }
  },

  /**
   * @param {ILookup} lookup
   * @return {MindmapNodeStyleRoot}
   */
  provideValue: function(lookup) {
    let mindmapNodeStyleRoot = new MindmapNodeStyleRoot(this.className)
    return mindmapNodeStyleRoot
  }
})

export default MindmapNodeStyleRootExtension
