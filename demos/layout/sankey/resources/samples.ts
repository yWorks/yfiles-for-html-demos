/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
export default {
  nodes: [
    {
      id: 0,
      label: ['Black Party'],
      x: 0,
      y: 0,
      colorId: 1
    },
    {
      id: 1,
      label: ['Red Party'],
      x: 0,
      y: 100,
      colorId: 2
    },
    {
      id: 2,
      label: ['Yellow Party'],
      x: 0,
      y: 200,
      colorId: 3
    },
    {
      id: 3,
      label: ['Green Party'],
      x: 0,
      y: 300,
      colorId: 4
    },
    {
      id: 4,
      label: ['Purple Party'],
      x: 0,
      y: 400,
      colorId: 5
    },
    {
      id: 5,
      label: ['Black Party'],
      x: 100,
      y: 0,
      colorId: 1
    },
    {
      id: 6,
      label: ['Red Party'],
      x: 100,
      y: 100,
      colorId: 2
    },
    {
      id: 7,
      label: ['Yellow Party'],
      x: 100,
      y: 200,
      colorId: 3
    },
    {
      id: 8,
      label: ['Green Party'],
      x: 100,
      y: 300,
      colorId: 4
    },
    {
      id: 9,
      label: ['Purple Party'],
      x: 100,
      y: 400,
      colorId: 5
    },
    {
      id: 10,
      label: ['Non-voter'],
      x: 100,
      y: 500,
      colorId: 7
    },
    {
      id: 11,
      label: ['Black Party'],
      x: 200,
      y: 0,
      colorId: 1
    },
    {
      id: 12,
      label: ['Red Party'],
      x: 200,
      y: 100,
      colorId: 2
    },
    {
      id: 13,
      label: ['Yellow Party'],
      x: 200,
      y: 200,
      colorId: 3
    },
    {
      id: 14,
      label: ['Green Party'],
      x: 200,
      y: 300,
      colorId: 4
    },
    {
      id: 15,
      label: ['Purple Party'],
      x: 200,
      y: 400,
      colorId: 5
    },
    {
      id: 16,
      label: ['Blue Party'],
      x: 200,
      y: 500,
      colorId: 6
    },
    {
      id: 17,
      label: ['Non-voter'],
      x: 200,
      y: 600,
      colorId: 7
    }
  ],

  edges: [
    {
      from: 0,
      to: 5,
      label: 13654
    },
    {
      from: 0,
      to: 7,
      label: 1140
    },
    {
      from: 0,
      to: 8,
      label: 50
    },
    {
      from: 0,
      to: 9,
      label: 40
    },
    {
      from: 0,
      to: 10,
      label: 1080
    },
    {
      from: 1,
      to: 5,
      label: 880
    },
    {
      from: 1,
      to: 6,
      label: 9890
    },
    {
      from: 1,
      to: 7,
      label: 530
    },
    {
      from: 1,
      to: 8,
      label: 870
    },
    {
      from: 1,
      to: 9,
      label: 1100
    },
    {
      from: 1,
      to: 10,
      label: 2040
    },
    {
      from: 2,
      to: 7,
      label: 6278
    },
    {
      from: 2,
      to: 10,
      label: 70
    },
    {
      from: 3,
      to: 7,
      label: 30
    },
    {
      from: 3,
      to: 8,
      label: 3681
    },
    {
      from: 3,
      to: 9,
      label: 140
    },
    {
      from: 3,
      to: 10,
      label: 30
    },
    {
      from: 4,
      to: 7,
      label: 20
    },
    {
      from: 4,
      to: 9,
      label: 3837
    },
    {
      from: 4,
      to: 10,
      label: 300
    },
    {
      from: 5,
      to: 11,
      label: 14685
    },
    {
      from: 5,
      to: 16,
      label: 290
    },
    {
      from: 6,
      to: 11,
      label: 210
    },
    {
      from: 6,
      to: 12,
      label: 9755
    },
    {
      from: 6,
      to: 16,
      label: 180
    },
    {
      from: 7,
      to: 11,
      label: 2110
    },
    {
      from: 7,
      to: 12,
      label: 530
    },
    {
      from: 7,
      to: 13,
      label: 2084
    },
    {
      from: 7,
      to: 14,
      label: 170
    },
    {
      from: 7,
      to: 15,
      label: 90
    },
    {
      from: 7,
      to: 16,
      label: 430
    },
    {
      from: 7,
      to: 17,
      label: 460
    },
    {
      from: 8,
      to: 11,
      label: 420
    },
    {
      from: 8,
      to: 12,
      label: 550
    },
    {
      from: 8,
      to: 14,
      label: 3570
    },
    {
      from: 8,
      to: 16,
      label: 90
    },
    {
      from: 8,
      to: 17,
      label: 40
    },
    {
      from: 9,
      to: 11,
      label: 120
    },
    {
      from: 9,
      to: 12,
      label: 370
    },
    {
      from: 9,
      to: 14,
      label: 40
    },
    {
      from: 9,
      to: 15,
      label: 3780
    },
    {
      from: 9,
      to: 16,
      label: 340
    },
    {
      from: 9,
      to: 17,
      label: 320
    },
    {
      from: 10,
      to: 11,
      label: 1130
    },
    {
      from: 10,
      to: 12,
      label: 360
    },
    {
      from: 10,
      to: 16,
      label: 210
    },
    {
      from: 10,
      to: 17,
      label: 1800
    }
  ]
}
