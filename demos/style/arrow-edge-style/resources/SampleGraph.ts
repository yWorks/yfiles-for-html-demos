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
import type { ColorSetName } from '../../../resources/demo-styles'

type GraphData = {
  nodeList: { id: number; layout: { x: number; y: number; width: number; height: number } }[]
  edgeList: {
    source: number
    target: number
    style?: {
      shape: 'arrow' | 'double-arrow' | 'notched-arrow' | 'trapezoid' | 'parallelogram'
      thickness: number
      angle: number
      shaftRatio: number
      color: ColorSetName
    }
  }[]
}

export const SampleGraph: GraphData = {
  nodeList: [
    {
      id: 0,
      layout: {
        x: 315,
        y: 450,
        width: 30,
        height: 30
      }
    },
    {
      id: 1,
      layout: {
        x: 315,
        y: 315,
        width: 30,
        height: 30
      }
    },
    {
      id: 2,
      layout: {
        x: 360,
        y: 315,
        width: 30,
        height: 30
      }
    },
    {
      id: 3,
      layout: {
        x: 405,
        y: 315,
        width: 30,
        height: 30
      }
    },
    {
      id: 4,
      layout: {
        x: 450,
        y: 315,
        width: 30,
        height: 30
      }
    },
    {
      id: 5,
      layout: {
        x: 315,
        y: 405,
        width: 30,
        height: 30
      }
    },
    {
      id: 6,
      layout: {
        x: 360,
        y: 405,
        width: 30,
        height: 30
      }
    },
    {
      id: 7,
      layout: {
        x: 525,
        y: 405,
        width: 30,
        height: 30
      }
    },
    {
      id: 8,
      layout: {
        x: 525,
        y: 450,
        width: 30,
        height: 30
      }
    },
    {
      id: 9,
      layout: {
        x: 480,
        y: 450,
        width: 30,
        height: 30
      }
    },
    {
      id: 10,
      layout: {
        x: 570,
        y: 450,
        width: 30,
        height: 30
      }
    },
    {
      id: 11,
      layout: {
        x: 570,
        y: 405,
        width: 30,
        height: 30
      }
    },
    {
      id: 12,
      layout: {
        x: 360,
        y: 360,
        width: 30,
        height: 30
      }
    },
    {
      id: 13,
      layout: {
        x: 615,
        y: 450,
        width: 30,
        height: 30
      }
    },
    {
      id: 14,
      layout: {
        x: 615,
        y: 405,
        width: 30,
        height: 30
      }
    },
    {
      id: 15,
      layout: {
        x: 660,
        y: 450,
        width: 30,
        height: 30
      }
    },
    {
      id: 16,
      layout: {
        x: 270,
        y: 405,
        width: 30,
        height: 30
      }
    },
    {
      id: 17,
      layout: {
        x: 270,
        y: 360,
        width: 30,
        height: 30
      }
    },
    {
      id: 18,
      layout: {
        x: 225,
        y: 270,
        width: 30,
        height: 30
      }
    },
    {
      id: 19,
      layout: {
        x: 480,
        y: 270,
        width: 30,
        height: 30
      }
    },
    {
      id: 20,
      layout: {
        x: 705,
        y: 270,
        width: 30,
        height: 30
      }
    },
    {
      id: 21,
      layout: {
        x: 225,
        y: 495,
        width: 30,
        height: 30
      }
    },
    {
      id: 22,
      layout: {
        x: 480,
        y: 495,
        width: 30,
        height: 30
      }
    },
    {
      id: 23,
      layout: {
        x: 705,
        y: 495,
        width: 30,
        height: 30
      }
    },
    {
      id: 24,
      layout: {
        x: 795,
        y: 382.5,
        width: 30,
        height: 30
      }
    },
    {
      id: 25,
      layout: {
        x: 135,
        y: 382.5,
        width: 30,
        height: 30
      }
    },
    {
      id: 26,
      layout: {
        x: 615,
        y: 315,
        width: 30,
        height: 30
      }
    },
    {
      id: 27,
      layout: {
        x: 705,
        y: 405,
        width: 30,
        height: 30
      }
    }
  ],
  edgeList: [
    {
      source: 8,
      target: 9
    },
    {
      source: 8,
      target: 10
    },
    {
      source: 10,
      target: 13
    },
    {
      source: 13,
      target: 15
    },
    {
      source: 13,
      target: 14
    },
    {
      source: 7,
      target: 8
    },
    {
      source: 1,
      target: 5
    },
    {
      source: 5,
      target: 6
    },
    {
      source: 6,
      target: 7
    },
    {
      source: 7,
      target: 11
    },
    {
      source: 6,
      target: 12
    },
    {
      source: 9,
      target: 0
    },
    {
      source: 5,
      target: 0
    },
    {
      source: 2,
      target: 1
    },
    {
      source: 2,
      target: 3
    },
    {
      source: 3,
      target: 4
    },
    {
      source: 5,
      target: 16
    },
    {
      source: 16,
      target: 17
    },
    {
      source: 19,
      target: 18,
      style: {
        shape: 'double-arrow',
        thickness: 30,
        angle: 40,
        shaftRatio: 1.0,
        color: 'demo-green'
      }
    },
    {
      source: 18,
      target: 25,
      style: {
        shape: 'notched-arrow',
        thickness: 30,
        angle: 45,
        shaftRatio: 0.3,
        color: 'demo-purple'
      }
    },
    {
      source: 22,
      target: 21,
      style: {
        shape: 'trapezoid',
        thickness: 20,
        angle: -40,
        shaftRatio: 1.0,
        color: 'demo-red'
      }
    },
    {
      source: 21,
      target: 25,
      style: {
        shape: 'notched-arrow',
        thickness: 30,
        angle: 45,
        shaftRatio: 0.3,
        color: 'demo-purple'
      }
    },
    {
      source: 22,
      target: 23,
      style: {
        shape: 'parallelogram',
        thickness: 20,
        angle: 40,
        shaftRatio: 1.0,
        color: 'demo-red'
      }
    },
    {
      source: 23,
      target: 24,
      style: {
        shape: 'notched-arrow',
        thickness: 30,
        angle: 45,
        shaftRatio: 0.3,
        color: 'demo-purple'
      }
    },
    {
      source: 19,
      target: 20,
      style: {
        shape: 'double-arrow',
        thickness: 30,
        angle: 40,
        shaftRatio: 1.0,
        color: 'demo-green'
      }
    },
    {
      source: 20,
      target: 24,
      style: {
        shape: 'notched-arrow',
        thickness: 30,
        angle: 45,
        shaftRatio: 0.3,
        color: 'demo-purple'
      }
    },
    {
      source: 14,
      target: 26
    },
    {
      source: 14,
      target: 27
    }
  ]
}
