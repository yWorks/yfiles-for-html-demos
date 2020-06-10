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
import { INode, IRenderContext, NodeStyleBase, Visual, WebGLVisual } from 'yfiles'

export default class IsometricWebGLNodeStyle extends NodeStyleBase {
  /**
   * @param {IRenderContext} context
   * @param {INode} node
   * @returns {Visual}
   */
  createVisual(context, node) {
    return new IsometricWebGLNodeStyleVisual(node)
  }

  /**
   * @param {IRenderContext} context
   * @param {Visual} oldVisual
   * @param {INode} node
   * @returns {Visual}
   */
  updateVisual(context, oldVisual, node) {
    return oldVisual
  }
}

/**
 * @typedef {Object} ColorLike
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * @property {number} a
 */

/**
 * A {@link WebGLVisual} that renders a node as a 3D cuboid.
 */
class IsometricWebGLNodeStyleVisual extends WebGLVisual {
  /**
   * @param {INode} node
   */
  constructor(node) {
    super()
    this.node = node
  }

  /**
   * @param {IRenderContext} ctx
   * @param {WebGLRenderingContext} gl
   */
  render(ctx, gl) {
    // a vertex consists of 7 float values, 3 for position (x, y, z) and 4 for the color (r, g, b, a)
    const vertexSize = 7
    // we render 6 faces, each face needs 2 triangles -> 6 * 2 * 3
    const numVertices = 36

    // very simple shaders that simply render the vertices at their positions with their corresponding colors
    const program = ctx.webGLSupport.useProgram(
      `attribute vec4 a_position;
            attribute vec4 a_color;
            varying vec4 v_color;

            void main() {
              gl_Position = viewTransform_3d * a_position;
              v_color = a_color;
            }`,
      `precision mediump float;
            varying vec4 v_color;

            void main() {
              gl_FragColor = v_color;
            }`
    )

    if (!this.buffer) {
      // initialize buffers
      this.buffer = gl.createBuffer()
      this.vertexBuffer = new Float32Array(vertexSize * numVertices)
    }

    const rect = this.node.layout
    const { color, height, bottom } = this.node.tag || {
      height: 0,
      color: { r: 1, g: 0, b: 0, a: 1 },
      bottom: 0
    }

    let i = 0
    // helper function that populates the buffer with a vertex
    const vertexToBuffer = ([x, y, z], { r, g, b, a }) => {
      this.vertexBuffer[i++] = x
      this.vertexBuffer[i++] = y
      this.vertexBuffer[i++] = z
      this.vertexBuffer[i++] = r
      this.vertexBuffer[i++] = g
      this.vertexBuffer[i++] = b
      this.vertexBuffer[i++] = a
    }

    // the base height of the node
    const bottomHeight = -bottom || 0
    // the four vertices of the back face
    const back = {
      bottomLeft: [rect.x, rect.y, bottomHeight],
      bottomRight: [rect.x + rect.width, rect.y, bottomHeight],
      topLeft: [rect.x, rect.y + rect.height, bottomHeight],
      topRight: [rect.x + rect.width, rect.y + rect.height, bottomHeight]
    }
    // the four vertices of the front face
    const front = {
      bottomLeft: [rect.x, rect.y, bottomHeight - height],
      bottomRight: [rect.x + rect.width, rect.y, bottomHeight - height],
      topLeft: [rect.x, rect.y + rect.height, bottomHeight - height],
      topRight: [rect.x + rect.width, rect.y + rect.height, bottomHeight - height]
    }

    // back face
    let currentColor = color
    vertexToBuffer(back.bottomLeft, currentColor)
    vertexToBuffer(back.topRight, currentColor)
    vertexToBuffer(back.topLeft, currentColor)
    vertexToBuffer(back.bottomLeft, currentColor)
    vertexToBuffer(back.bottomRight, currentColor)
    vertexToBuffer(back.topRight, currentColor)

    // front face
    currentColor = color
    vertexToBuffer(front.bottomLeft, currentColor)
    vertexToBuffer(front.topRight, currentColor)
    vertexToBuffer(front.topLeft, currentColor)
    vertexToBuffer(front.bottomLeft, currentColor)
    vertexToBuffer(front.bottomRight, currentColor)
    vertexToBuffer(front.topRight, currentColor)

    // the side that is "facing the light source"
    currentColor = multiplyColor(color, 1.15)
    vertexToBuffer(back.topLeft, currentColor)
    vertexToBuffer(front.topLeft, currentColor)
    vertexToBuffer(front.topRight, currentColor)
    vertexToBuffer(back.topRight, currentColor)
    vertexToBuffer(back.topLeft, currentColor)
    vertexToBuffer(front.topRight, currentColor)

    // the side that is "facing away from the light source"
    currentColor = multiplyColor(color, 0.7)
    vertexToBuffer(back.bottomLeft, currentColor)
    vertexToBuffer(front.bottomRight, currentColor)
    vertexToBuffer(front.bottomLeft, currentColor)
    vertexToBuffer(back.bottomLeft, currentColor)
    vertexToBuffer(back.bottomRight, currentColor)
    vertexToBuffer(front.bottomRight, currentColor)

    // the other two sides
    currentColor = multiplyColor(color, 0.85)
    vertexToBuffer(back.topLeft, currentColor)
    vertexToBuffer(back.bottomLeft, currentColor)
    vertexToBuffer(front.topLeft, currentColor)
    vertexToBuffer(back.bottomLeft, currentColor)
    vertexToBuffer(front.bottomLeft, currentColor)
    vertexToBuffer(front.topLeft, currentColor)
    currentColor = multiplyColor(color, 0.85)
    vertexToBuffer(back.bottomRight, currentColor)
    vertexToBuffer(back.topRight, currentColor)
    vertexToBuffer(front.topRight, currentColor)
    vertexToBuffer(front.bottomRight, currentColor)
    vertexToBuffer(back.bottomRight, currentColor)
    vertexToBuffer(front.topRight, currentColor)

    // enable depth testing to get correct overlaps between nodes
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)

    // actually draw
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexBuffer, gl.STATIC_DRAW)
    const posLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLocation)
    gl.vertexAttribPointer(posLocation, 3, gl.FLOAT, false, vertexSize * 4, 0)
    const colorLocation = gl.getAttribLocation(program, 'a_color')
    gl.enableVertexAttribArray(colorLocation)
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, vertexSize * 4, 3 * 4)

    gl.drawArrays(gl.TRIANGLES, 0, numVertices)
  }
}

/**
 * @param {ColorLike} c
 * @param {number} factor
 * @returns {ColorLike}
 */
function multiplyColor(c, factor) {
  return {
    r: Math.min(1, Math.max(c.r * factor, 0)),
    g: Math.min(1, Math.max(c.g * factor, 0)),
    b: Math.min(1, Math.max(c.b * factor, 0)),
    a: c.a
  }
}
