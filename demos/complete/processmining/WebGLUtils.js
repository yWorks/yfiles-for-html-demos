/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { IRenderContext } from 'yfiles'

export class WebGLBufferData {
  /**
   * @param {number} entryCount
   * @param {!GLenum} pointerType
   * @param {!string} attributeName
   * @param {!GLint} elementSize
   * @param {!object} dataType
   */
  constructor(entryCount, pointerType, attributeName, elementSize, dataType) {
    this.dirty = true
    this.buffer = null
    this.data = null
    this.attributeLocation = -1
    this.entryCount = entryCount
    this.pointerType = pointerType
    this.attributeName = attributeName
    this.elementSize = elementSize
    this.DataType = dataType
  }

  /**
   * @param {!WebGLRenderingContext} gl
   * @param {!WebGLProgram} program
   */
  init(gl, program) {
    this.dirty = true
    this.buffer = gl.createBuffer()
    this.data = new this.DataType(this.elementSize * this.entryCount)
    this.attributeLocation = gl.getAttribLocation(program, this.attributeName)
  }

  updateData() {
    this.dirty = true
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!WebGLRenderingContext} gl
   */
  enableRendering(renderContext, gl) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    if (this.dirty) {
      gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW)
      this.dirty = false
    }
    gl.enableVertexAttribArray(this.attributeLocation)
    gl.vertexAttribPointer(this.attributeLocation, this.elementSize, this.pointerType, false, 0, 0)
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!WebGLRenderingContext} gl
   */
  disableRendering(renderContext, gl) {
    gl.disableVertexAttribArray(this.attributeLocation)
  }

  /**
   * @param {!WebGLRenderingContext} gl
   * @param {!WebGLProgram} program
   */
  dispose(gl, program) {
    gl.deleteBuffer(this.buffer)
    gl.deleteProgram(program)
    this.data = null
    this.entryCount = 0
    this.attributeLocation = -1
  }
}

export class WebGLProgramInfo {
  /**
   * @param {number} entryCount
   */
  constructor(entryCount) {
    this.entryCount = entryCount
    this.buffers = []
  }

  /**
   * @param {!string} attributeName
   * @param {number} [entrySize=1]
   * @returns {!WebGLBufferData.<Float32Array>}
   */
  createFloatBuffer(attributeName, entrySize = 1) {
    const bufferData = new WebGLBufferData(
      this.entryCount,
      WebGLRenderingContext.prototype.FLOAT,
      attributeName,
      entrySize,
      Float32Array
    )
    this.buffers.push(bufferData)
    return bufferData
  }

  /**
   * @param {!WebGLRenderingContext} gl
   * @param {!WebGLProgram} program
   */
  init(gl, program) {
    for (const buffer of this.buffers) {
      buffer.init(gl, program)
    }
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!WebGLRenderingContext} gl
   */
  enableRendering(renderContext, gl) {
    for (const buffer of this.buffers) {
      buffer.enableRendering(renderContext, gl)
    }
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!WebGLRenderingContext} gl
   */
  disableRendering(renderContext, gl) {
    for (const buffer of this.buffers) {
      buffer.disableRendering(renderContext, gl)
    }
  }

  /**
   * @param {!WebGLRenderingContext} gl
   * @param {!WebGLProgram} program
   */
  dispose(gl, program) {
    for (const buffer of this.buffers) {
      buffer.dispose(gl, program)
    }
  }
}
