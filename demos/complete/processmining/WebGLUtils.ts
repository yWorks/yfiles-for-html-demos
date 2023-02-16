/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import type { IRenderContext } from 'yfiles'

export class WebGLBufferData<T extends BufferSource> {
  private dirty = true
  private buffer: WebGLBuffer | null = null
  private readonly DataType: { new (size: number): T }
  public data: T | null = null
  private attributeLocation: GLuint = -1
  entryCount: number
  private readonly pointerType: GLenum
  private readonly attributeName: string
  private readonly elementSize: GLint

  constructor(
    entryCount: number,
    pointerType: GLenum,
    attributeName: string,
    elementSize: GLint,
    dataType: { new (size: number): T }
  ) {
    this.entryCount = entryCount
    this.pointerType = pointerType
    this.attributeName = attributeName
    this.elementSize = elementSize
    this.DataType = dataType
  }

  init(gl: WebGLRenderingContext, program: WebGLProgram): void {
    this.dirty = true
    this.buffer = gl.createBuffer()
    this.data = new this.DataType(this.elementSize * this.entryCount)
    this.attributeLocation = gl.getAttribLocation(program, this.attributeName)
  }

  updateData(): void {
    this.dirty = true
  }

  enableRendering(renderContext: IRenderContext, gl: WebGLRenderingContext): void {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    if (this.dirty) {
      gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW)
      this.dirty = false
    }
    gl.enableVertexAttribArray(this.attributeLocation)
    gl.vertexAttribPointer(this.attributeLocation, this.elementSize, this.pointerType, false, 0, 0)
  }

  disableRendering(renderContext: IRenderContext, gl: WebGLRenderingContext): void {
    gl.disableVertexAttribArray(this.attributeLocation)
  }

  dispose(gl: WebGLRenderingContext, program: WebGLProgram): void {
    gl.deleteBuffer(this.buffer)
    gl.deleteProgram(program)
    this.data = null
    this.entryCount = 0
    this.attributeLocation = -1
  }
}

export class WebGLProgramInfo {
  private buffers: WebGLBufferData<never>[]
  protected entryCount: number

  constructor(entryCount: number) {
    this.entryCount = entryCount
    this.buffers = []
  }

  createFloatBuffer(attributeName: string, entrySize = 1): WebGLBufferData<Float32Array> {
    const bufferData = new WebGLBufferData(
      this.entryCount,
      WebGLRenderingContext.prototype.FLOAT,
      attributeName,
      entrySize,
      Float32Array
    ) as WebGLBufferData<never>
    this.buffers.push(bufferData)
    return bufferData
  }

  init(gl: WebGLRenderingContext, program: WebGLProgram): void {
    for (const buffer of this.buffers) {
      buffer.init(gl, program)
    }
  }

  enableRendering(renderContext: IRenderContext, gl: WebGLRenderingContext): void {
    for (const buffer of this.buffers) {
      buffer.enableRendering(renderContext, gl)
    }
  }

  disableRendering(renderContext: IRenderContext, gl: WebGLRenderingContext): void {
    for (const buffer of this.buffers) {
      buffer.disableRendering(renderContext, gl)
    }
  }

  dispose(gl: WebGLRenderingContext, program: WebGLProgram): void {
    for (const buffer of this.buffers) {
      buffer.dispose(gl, program)
    }
  }
}
