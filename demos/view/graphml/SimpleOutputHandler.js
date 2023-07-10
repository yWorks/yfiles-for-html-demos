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
import { IGraph, IModelItem, IWriteContext, KeyType, OutputHandlerBase, YObject } from 'yfiles'

/**
 * An output handler that writes primitive data types and ignores complex types.
 */
export class SimpleOutputHandler extends OutputHandlerBase {
  /**
   * @param {!GraphMLProperty} property
   * @param {!PropertiesPanel} propertiesPanel
   */
  constructor(property, propertiesPanel) {
    super(YObject.$class, YObject.$class, property.keyScope, property.name, property.type)
    this.propertiesPanel = propertiesPanel
    this.property = property
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
   * @see Overrides {@link OutputHandlerBase.writeValueCore}
   * @param {!IWriteContext} context
   * @param {*} data
   */
  writeValueCore(context, data) {
    if (data !== null) {
      switch (this.property.type) {
        case KeyType.INT:
          context.writer.writeString((data | 0).toString())
          break
        case KeyType.LONG:
          context.writer.writeString((data | 0).toString())
          break
        case KeyType.FLOAT:
          context.writer.writeString(data)
          break
        case KeyType.DOUBLE:
          context.writer.writeString(data)
          break
        case KeyType.STRING:
          context.writer.writeCData(data)
          break
        case KeyType.BOOLEAN:
          context.writer.writeString((!!data).toString())
          break
        default:
          throw new Error('Invalid Type!')
      }
    }
  }

  /**
   * Gets the value for the given key.
   * @see Overrides {@link OutputHandlerBase.getValue}
   * @param {!IWriteContext} context
   * @param {*} key
   * @returns {*}
   */
  getValue(context, key) {
    if (key instanceof IModelItem) {
      return this.propertiesPanel.getItemValue(key, this.property)
    } else if (key instanceof IGraph && context.objectStack.size === 2) {
      return this.propertiesPanel.getGraphValue(this.property)
    }
    return null
  }
}
