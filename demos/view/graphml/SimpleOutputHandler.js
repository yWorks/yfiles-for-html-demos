/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-graphml'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * An output handler that writes primitive data types and ignores complex types.
   *
   * @extends yfiles.graphml.OutputHandlerBase
   */
  class SimpleOutputHandler extends yfiles.graphml.OutputHandlerBase {
    /**
     * @param {GraphMLProperty} property
     * @param {PropertiesPanel} propertiesPanel
     */
    constructor(property, propertiesPanel) {
      super(
        yfiles.lang.Object.$class,
        yfiles.lang.Object.$class,
        property.keyScope,
        property.name,
        property.type
      )
      this.property = property
      this.propertiesPanel = propertiesPanel
      this.defaultExists = property.defaultExists
      if (property.defaultExists) {
        this.defaultValue = property.defaultValue
      }
    }

    /**
     * Writes the property data to xml.
     *
     * Only primitive data types are written. Complex data types are ignored, because they
     * cannot be serialized in a meaningful manner.
     *
     * @see Overrides {@link yfiles.graphml.OutputHandlerBase#writeValueCore}
     * @param {yfiles.graphml.IWriteContext} context
     * @param {object} data
     */
    writeValueCore(context, data) {
      if (data !== null) {
        switch (this.property.type) {
          case yfiles.graphml.KeyType.INT:
            context.writer.writeString((data | 0).toString())
            break
          case yfiles.graphml.KeyType.LONG:
            context.writer.writeString((data | 0).toString())
            break
          case yfiles.graphml.KeyType.FLOAT:
            context.writer.writeString(data)
            break
          case yfiles.graphml.KeyType.DOUBLE:
            context.writer.writeString(data)
            break
          case yfiles.graphml.KeyType.STRING:
            context.writer.writeCData(data)
            break
          case yfiles.graphml.KeyType.BOOLEAN:
            context.writer.writeString((!!data).toString())
            break
          default:
            throw new Error('Invalid Type!')
        }
      }
    }

    /**
     * Gets the value for the given key.
     * @param {yfiles.graphml.IWriteContext} context
     * @param {Object} key
     * @return {Object}
     * @see Overrides {@link yfiles.graphml.OutputHandlerBase#getValue}
     */
    getValue(context, key) {
      if (yfiles.graph.IModelItem.isInstance(key)) {
        return this.propertiesPanel.getItemValue(this.property, key)
      } else if (yfiles.graph.IGraph.isInstance(key) && context.objectStack.size === 2) {
        return this.propertiesPanel.getGraphValue(this.property)
      }
      return null
    }
  }

  return SimpleOutputHandler
})
