/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
import {
  BaseClass,
  CanvasComponent,
  Color,
  GeneralPath,
  IArrow,
  IBoundsProvider,
  ICanvasContext,
  ICanvasObject,
  ICanvasObjectDescriptor,
  IEdge,
  IHitTestable,
  IRenderContext,
  IVisibilityTestable,
  IVisualCreator,
  PathType,
  PolylineEdgeStyle,
  SimpleEdge,
  Visual,
  WebGLVisual
} from 'yfiles'
import { WebGLBufferData, WebGLProgramInfo } from './WebGLUtils.js'

/**
 * @typedef {*} MyWebGLProgram
 */

/**
 * @typedef {Object} ItemEntry
 * @property {number} color
 * @property {number} startTime
 * @property {number} endTime
 * @property {number} x0
 * @property {number} x1
 * @property {number} y0
 * @property {number} y1
 * @property {number} size
 */

const dummyEdgeStyle = new PolylineEdgeStyle({ sourceArrow: IArrow.NONE, targetArrow: IArrow.NONE })

/**
 * @param {!IEdge} path
 * @returns {!GeneralPath}
 */
function getGeneralPath(path) {
  const dummyEdge = new SimpleEdge({
    sourcePort: path.sourcePort,
    targetPort: path.targetPort,
    style: dummyEdgeStyle,
    bends: path.bends
  })

  return dummyEdge.style.renderer.getPathGeometry(dummyEdge, dummyEdge.style).getPath()
}

class ProcessItemProgramInfo extends WebGLProgramInfo {
  /**
   * @param {number} entryCount
   */
  constructor(entryCount) {
    super(entryCount)
    this.samplerUniformLocation = null
    this.timeUniformLocation = null
    this.texture = null
    this.toPositionData = this.createFloatBuffer('a_to', 2)
    this.fromPositionData = this.createFloatBuffer('a_from', 2)
    this.indexData = this.createFloatBuffer('a_index', 1)
    this.sizeData = this.createFloatBuffer('a_size', 1)
    this.startTimeData = this.createFloatBuffer('a_startTime', 1)
    this.endTimeData = this.createFloatBuffer('a_endTime', 1)
    this.colorData = this.createFloatBuffer('a_color', 1)
  }

  /**
   * @param {!WebGLRenderingContext} gl
   * @param {!WebGLProgram} program
   */
  init(gl, program) {
    super.init(gl, program)
    this.initRainbowTexture(gl)

    this.samplerUniformLocation = gl.getUniformLocation(program, 'u_Sampler')
    this.timeUniformLocation = gl.getUniformLocation(program, 'time')
  }

  /**
   * @param {!WebGLRenderingContext} gl
   * @returns {?WebGLTexture}
   */
  initRainbowTexture(gl) {
    // noinspection AssignmentResultUsedJS
    const texture = (this.texture = gl.createTexture())
    gl.bindTexture(gl.TEXTURE_2D, texture)
    const width = 256
    const height = 1
    const values = []
    for (let i = 0; i < width; i++) {
      const c = Color.fromHSLA(i / 256, 0.8, 0.5, 1)
      values.push(c.r & 255, c.g & 255, c.b & 255, 255)
    }
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array(values)
    )

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    return texture
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!WebGLRenderingContext} gl
   */
  enableRendering(renderContext, gl) {
    super.enableRendering(renderContext, gl)

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0)
    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(this.samplerUniformLocation, 0)
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!WebGLRenderingContext} gl
   * @param {number} time
   */
  render(renderContext, gl, time) {
    if (this.entryCount > 0) {
      this.enableRendering(renderContext, gl)
      gl.uniform1f(this.timeUniformLocation, time)
      gl.drawArrays(gl.TRIANGLES, 0, this.entryCount)
      this.disableRendering(renderContext, gl)
    }
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!WebGLRenderingContext} gl
   */
  disableRendering(renderContext, gl) {
    super.disableRendering(renderContext, gl)
  }

  /**
   * @param {!WebGLRenderingContext} gl
   * @param {!WebGLProgram} program
   */
  dispose(gl, program) {
    super.dispose(gl, program)
    gl.deleteTexture(this.texture)
  }
}

// language=GLSL
const fragmentShader = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision mediump float;

varying float v_colorIndex;
uniform sampler2D u_Sampler;
varying vec2 v_coord;

void main()
{
  float r = 0.0, delta = 0.0, alpha = 1.0;
  r = dot(v_coord, v_coord);
#ifdef GL_OES_standard_derivatives
  delta = fwidth(r);
  alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
  gl_FragColor = texture2D(u_Sampler, vec2(v_colorIndex, 0)) * alpha;
#endif
#ifndef GL_OES_standard_derivatives
  if ( dot(v_coord, v_coord) < 1.0){
    gl_FragColor = texture2D(u_Sampler, vec2(v_colorIndex, 0));
  } else {
    gl_FragColor = vec4( 0., 0., 0., 0. );
  }
#endif
}`

// language=GLSL
const vertexShader = `
uniform   float time;
attribute vec2  a_from;
attribute vec2  a_to;
attribute float a_startTime;
attribute float a_endTime;
attribute float a_index;
attribute float a_size;
attribute float a_color;
varying   vec2  v_coord;
varying   float v_colorIndex;

void main() {
  if (time >= a_startTime && time < a_endTime){
    int index = int(a_index);
    v_colorIndex = a_color;
    float timeRatio = (time - a_startTime) / (a_endTime - a_startTime);
    vec2 pos = mix(a_from, a_to, timeRatio);
    v_coord = vec2(0,0);

    float w = a_size;
    float h = a_size;

    if (index == 2 || index == 3 || index == 4){
      pos.x -= w;
      v_coord.x = 1.;
    } else {
      pos.x += w;
      v_coord.x = -1.;
    }
    if (index == 0 || index == 5 || index == 4){
      pos.y -= h;
      v_coord.y = -1.;
    } else {
      pos.y += h;
      v_coord.y = 1.;
    }
    gl_Position = vec4((u_yf_worldToWebGL * vec3(pos, 1)).xy, 0., 1.);
  } else {
    gl_Position = vec4(-10.,-10.,-10.,1);
  }
}`

/**
 * A render visual that draws process items in a canvas using WebGL.
 */
export class ProcessItemVisual extends WebGLVisual {
  constructor() {
    super()
    this.timeDirty = true
    this.$time = 0
    this.entries = []
    this.entryCount = 0
    this.dirty = false
  }

  /**
   * @type {number}
   */
  set time(value) {
    this.$time = value
    this.timeDirty = true
  }

  /**
   * @type {number}
   */
  get time() {
    return this.$time
  }

  clearItems() {
    this.dirty = true
    this.entries.length = 0
    this.entryCount = 0
  }

  /**
   * @param {!IEdge} path
   * @param {boolean} reverse
   * @param {number} [startTime=0]
   * @param {number} [endTime=1]
   * @param {number} [size=10]
   * @param {number} [color=0.5]
   */
  addItem(path, reverse, startTime = 0, endTime = 1, size = 10, color = 0.5) {
    this.dirty = true

    const entries = this.entries

    function appendSegment(x0, y0, x1, y1) {
      if (reverse) {
        const dx = x0 - x1
        const dy = y0 - y1
        const length = Math.sqrt(dx * dx + dy * dy)

        const segmentStartTime = startTime + (endTime - startTime) * (runningTotal / totalLength)
        runningTotal -= length
        const segmentEndTime = startTime + (endTime - startTime) * (runningTotal / totalLength)

        entries.push({
          color,
          startTime: segmentEndTime,
          endTime: segmentStartTime,
          size,
          x0: x1,
          y0: y1,
          x1: x0,
          y1: y0
        })
      } else {
        const dx = x1 - x0
        const dy = y1 - y0
        const length = Math.sqrt(dx * dx + dy * dy)

        const segmentStartTime = startTime + (endTime - startTime) * (runningTotal / totalLength)
        runningTotal += length
        const segmentEndTime = startTime + (endTime - startTime) * (runningTotal / totalLength)

        entries.push({
          color,
          startTime: segmentStartTime,
          endTime: segmentEndTime,
          size,
          x0,
          y0,
          x1,
          y1
        })
      }
    }

    const generalPath = getGeneralPath(path)

    const totalLength = generalPath.getLength()

    const pathCursor = generalPath.createCursor()
    const coords = [0, 0, 0, 0, 0, 0]

    let runningTotal = reverse ? totalLength : 0

    let lastMoveX = 0
    let lastMoveY = 0
    let lastX = 0
    let lastY = 0

    while (pathCursor.moveNext()) {
      switch (pathCursor.getCurrent(coords)) {
        case PathType.LINE_TO:
          // noinspection AssignmentResultUsedJS
          appendSegment(lastX, lastY, (lastX = coords[0]), (lastY = coords[1]))
          break
        case PathType.CLOSE:
          // noinspection AssignmentResultUsedJS
          appendSegment(lastX, lastY, (lastX = lastMoveX), (lastY = lastMoveY))
          break
        case PathType.CUBIC_TO:
          // noinspection AssignmentResultUsedJS
          appendSegment(lastX, lastY, (lastX = coords[4]), (lastY = coords[5]))
          break
        case PathType.MOVE_TO:
          // noinspection NestedAssignmentJS,AssignmentResultUsedJS
          lastX = lastMoveX = coords[0]
          // noinspection NestedAssignmentJS,AssignmentResultUsedJS
          lastY = lastMoveY = coords[1]
          break
        case PathType.QUAD_TO:
          // noinspection AssignmentResultUsedJS
          appendSegment(lastX, lastY, (lastX = coords[2]), (lastY = coords[3]))
          break
      }
    }
  }

  expungeOldEntries() {
    const currentTime = this.time
    const entries = this.entries
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].endTime < currentTime) {
        entries.splice(i, 1)
        // noinspection AssignmentToForLoopParameterJS
        i--
      }
    }
  }

  /**
   * Paints onto the context using WebGL item styles.
   * @param {!IRenderContext} renderContext
   * @param {!WebGLRenderingContext} gl
   */
  render(renderContext, gl) {
    gl.getExtension('GL_OES_standard_derivatives')
    gl.getExtension('OES_standard_derivatives')
    const program = renderContext.webGLSupport.useProgram(vertexShader, fragmentShader)
    if (!program.info || this.dirty) {
      // noinspection AssignmentResultUsedJS
      const entryCount = (this.entryCount = this.entries.length)
      const vertexCount = entryCount * 6
      if (program.info) {
        program.info.dispose(gl, program)
      }

      program.info = new ProcessItemProgramInfo(vertexCount)
      program.info.init(gl, program)
      this.updateData(program.info)
    }

    program.info.render(renderContext, gl, this.time)
  }

  /**
   * @param {!ProcessItemProgramInfo} programInfo
   */
  updateData(programInfo) {
    const toPosition = programInfo.toPositionData.data
    const fromPosition = programInfo.fromPositionData.data
    const start = programInfo.startTimeData.data
    const end = programInfo.endTimeData.data
    const colorData = programInfo.colorData.data
    const itemSize = programInfo.sizeData.data
    const vertexIndex = programInfo.indexData.data
    this.entries.forEach((n, index) => {
      const offset = index * 12
      const { x0, y0, x1, y1, size, startTime, endTime, color } = n
      for (let i = 0; i < 12; i += 2) {
        fromPosition[offset + i] = x0
        fromPosition[offset + i + 1] = y0
        toPosition[offset + i] = x1
        toPosition[offset + i + 1] = y1
      }
      let coordinatesOffset = index * 6
      for (let i = 0; i < 6; i++) {
        start[coordinatesOffset] = startTime
        end[coordinatesOffset] = endTime
        itemSize[coordinatesOffset] = size
        vertexIndex[coordinatesOffset] = i
        // noinspection IncrementDecrementResultUsedJS
        colorData[coordinatesOffset++] = color
      }
    })
    this.dirty = false
    this.timeDirty = false
  }

  /**
   * @type {boolean}
   */
  get needsRepaint() {
    return (this.entryCount > 0 && this.timeDirty) || (this.dirty && this.entries.length > 0)
  }
}

class ProcessItemCanvasObjectDescriptor extends BaseClass(ICanvasObjectDescriptor, IVisualCreator) {
  constructor() {
    super()
    this.processItemVisual = null
  }

  /**
   * @param {!unknown} forUserObject
   * @returns {!IBoundsProvider}
   */
  getBoundsProvider(forUserObject) {
    return IBoundsProvider.UNBOUNDED
  }

  /**
   * @param {!unknown} forUserObject
   * @returns {!IHitTestable}
   */
  getHitTestable(forUserObject) {
    return IHitTestable.NEVER
  }

  /**
   * @param {!unknown} forUserObject
   * @returns {!IVisibilityTestable}
   */
  getVisibilityTestable(forUserObject) {
    return IVisibilityTestable.ALWAYS
  }

  /**
   * @param {!unknown} forUserObject
   * @returns {!IVisualCreator}
   */
  getVisualCreator(forUserObject) {
    this.processItemVisual = forUserObject
    return this
  }

  /**
   * @param {!ICanvasContext} context
   * @param {!ICanvasObject} canvasObject
   * @returns {boolean}
   */
  isDirty(context, canvasObject) {
    return canvasObject.dirty || canvasObject.userObject.needsRepaint
  }

  /**
   * @param {!IRenderContext} context
   * @returns {?Visual}
   */
  createVisual(context) {
    return this.processItemVisual
  }

  /**
   * @param {!IRenderContext} context
   * @param {?Visual} oldVisual
   * @returns {?Visual}
   */
  updateVisual(context, oldVisual) {
    return this.processItemVisual
  }
}

/**
 * @param {!CanvasComponent} canvas
 * @returns {!ProcessItemVisual}
 */
export function installProcessItemVisual(canvas) {
  const processItemVisual = new ProcessItemVisual()
  canvas.highlightGroup.addChild(processItemVisual, new ProcessItemCanvasObjectDescriptor())
  return processItemVisual
}
