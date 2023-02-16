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
import { Color, IEnumerable, IRenderContext, Point, WebGLVisual } from 'yfiles'

export default class WebglBlobVisual extends WebGLVisual {
  locations: IEnumerable<Point>
  color: { a: number; r: number; b: number; g: number }
  size: number
  maxBlobCount: number
  private dataToSend: Float32Array | null = null
  private fragmentShader = ''
  private buffer: WebGLBuffer | null = null
  private vertexBuffer: Float32Array | null = null

  constructor(locations: IEnumerable<Point>, color: Color, size?: number, maxBlobCount?: number) {
    super()
    this.locations = locations
    this.color = color || { r: 128, g: 128, b: 128, a: 128 }
    this.size = size || 100
    this.maxBlobCount = maxBlobCount || 128
  }

  /**
   * @yjs:keep = enable
   */
  render(renderContext: IRenderContext, gl: WebGLRenderingContext): void {
    if (!this.buffer || !gl.isBuffer(this.buffer)) {
      // initialize and cache all the data that we need for the first time
      const maxUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)
      const blobCount = (this.maxBlobCount = Math.min(this.maxBlobCount, maxUniformVectors - 10))

      this.dataToSend = new Float32Array(blobCount * 2)
      this.fragmentShader = `
        precision lowp float;

        uniform float scale;
        uniform vec2 centers[${blobCount}];
        uniform vec4 color;
        uniform int count;
        void main() {
          vec2 frag = vec2(gl_FragCoord);
          float v = 0.0;
          for (int i = 0; i < ${blobCount}; i++) {
            if (i == count) {
              gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
              return;
            }
            vec2 mb = centers[i];
            vec2 d = (mb - frag) * scale;
            float r = dot(d,d);
            if (r < 1.0){
              r = (1.0 - r);
              v += r * r;
              if (v > 0.5) {
                gl_FragColor = color;
                return;
              }
            }
          }
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      `

      this.buffer = gl.createBuffer()
      this.vertexBuffer = new Float32Array(8)
      this.vertexBuffer[0] = -1
      this.vertexBuffer[1] = -1
      this.vertexBuffer[2] = 1
      this.vertexBuffer[3] = -1
      this.vertexBuffer[4] = -1
      this.vertexBuffer[5] = 1
      this.vertexBuffer[6] = 1
      this.vertexBuffer[7] = 1
    }

    const program = renderContext.webGLSupport.useProgram(
      `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(vec3(position, 1), 1);
        }
        `,
      this.fragmentShader
    )

    const ballSize = this.size
    const centers = this.locations.map(p => renderContext.toViewCoordinates(p))

    const dataToSend = this.dataToSend!
    const maxDist = ballSize * 2 * renderContext.zoom

    const height = gl.canvas.height
    const width = gl.canvas.width

    const pixelRatio = renderContext.canvasComponent!.devicePixelRatio

    let count = 0
    centers.forEach(center => {
      if (
        center.x > -maxDist &&
        center.y > -maxDist &&
        center.x - maxDist < width &&
        center.y - maxDist < height
      ) {
        dataToSend[count++] = center.x * pixelRatio
        dataToSend[count++] = height - center.y * pixelRatio
      }
    })

    if (count > 0) {
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA)

      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
      gl.bufferData(gl.ARRAY_BUFFER, this.vertexBuffer, gl.STATIC_DRAW)

      const positionLocation = gl.getAttribLocation(program, 'position')
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      const centersLoc = gl.getUniformLocation(program, 'centers')
      const colorLoc = gl.getUniformLocation(program, 'color')
      const countLoc = gl.getUniformLocation(program, 'count')
      const scaleLoc = gl.getUniformLocation(program, 'scale')

      const factor = 1 / (ballSize * renderContext.zoom * pixelRatio)

      gl.uniform1f(scaleLoc, factor)

      gl.uniform1i(countLoc, Math.min(this.maxBlobCount, count / 2))
      gl.uniform2fv(centersLoc, dataToSend)
      gl.uniform4f(
        colorLoc,
        this.color.r / 255,
        this.color.g / 255,
        this.color.b / 255,
        this.color.a / 255
      )

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
  }
}
