/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
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
/*eslint-disable*/
'use strict'

define(['yfiles/lang', 'yfiles/view-component', './StateLabelDecorator.js'], (
  lang,
  yfiles,
  StateLabelDecorator
) => {
  /**
   * A markup extension class used for (de-)serializing a custom label style, namely
   * StateLabelDecorator class, that is written in ECMAScript 6.
   */
  const StateLabelDecoratorExtension = yfiles.lang.Class('StateLabelDecoratorExtension', {
    $extends: yfiles.graphml.MarkupExtension,

    /**
     * Backing field for below property
     * @type {yfiles.styles.IconLabelStyle}
     */
    $wrappedStyle: null,

    /**
     * Gets or sets the style used to render the icon label.
     * The explicit getter/setter is needed to support (de-)serialization.
     * @type {yfiles.styles.IconLabelStyle}
     */
    wrappedStyle: {
      get: function() {
        return this.$wrappedStyle
      },
      set: function(value) {
        this.$wrappedStyle = value
      }
    },

    /**
     * The ILabelModelParameter for an icon of a node placed on the left side of the tree.
     * Places the icon inside the label on the east.
     * @type {yfiles.graph.ILabelModelParameter}
     */
    $labelModelParameterLeft: null,

    /**
     * Gets or sets ILabelModelParameter for an icon of a node placed on the left side of the tree.
     * Places the icon inside the label on the east.
     * @type {yfiles.graph.ILabelModelParameter}
     */
    labelModelParameterLeft: {
      get: function() {
        return this.$labelModelParameterLeft
      },
      set: function(value) {
        this.$labelModelParameterLeft = value
      }
    },

    /**
     * The ILabelModelParameter for an icon of a node placed on the right side of the tree.
     * Places the icon inside the label on the east.
     * @type {yfiles.graph.ILabelModelParameter}
     */
    $labelModelParameterRight: null,

    /**
     * Gets or sets the ILabelModelParameter for an icon of a node placed on the right side of the tree.
     * Places the icon inside the label on the east.
     * @type {yfiles.graph.ILabelModelParameter}
     */
    labelModelParameterRight: {
      get: function() {
        return this.$labelModelParameterRight
      },
      set: function(value) {
        this.$labelModelParameterRight = value
      }
    },

    /**
     * The insets for an icon placed on the left side of the tree.
     * @type {yfiles.geometry.Insets}
     */
    $insetsLeft: null,

    /**
     * Gets or sets the insets for an icon placed on the left side of the tree.
     * @type {yfiles.geometry.Insets}
     */
    insetsLeft: {
      get: function() {
        return this.$insetsLeft
      },
      set: function(value) {
        this.$insetsLeft = value
      }
    },

    /**
     * The insets for an icon placed on the right side of the tree.
     * @type {yfiles.geometry.Insets}
     */
    $insetsRight: null,

    /**
     * Gets or sets the insets for an icon placed on the right side of the tree.
     * @type {yfiles.geometry.Insets}
     */
    insetsRight: {
      get: function() {
        return this.$insetsRight
      },
      set: function(value) {
        this.$insetsRight = value
      }
    },

    /**
     * @param {yfiles.graph.ILookup} lookup
     * @return {StateLabelDecorator}
     */
    provideValue: function(lookup) {
      let stateLabelDecorator = new StateLabelDecorator(this.wrappedStyle)
      return stateLabelDecorator
    }
  })
  return StateLabelDecoratorExtension
})
