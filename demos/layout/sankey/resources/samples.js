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

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /* @yjs:keep */
  const nodes = [
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
  ]

  const edges = [
    {
      from: 0,
      to: 5,
      label: 13654000
    },
    {
      from: 0,
      to: 7,
      label: 1140000
    },
    {
      from: 0,
      to: 8,
      label: 50000
    },
    {
      from: 0,
      to: 9,
      label: 40000
    },
    {
      from: 0,
      to: 10,
      label: 1080000
    },
    {
      from: 1,
      to: 5,
      label: 880000
    },
    {
      from: 1,
      to: 6,
      label: 9890000
    },
    {
      from: 1,
      to: 7,
      label: 530000
    },
    {
      from: 1,
      to: 8,
      label: 870000
    },
    {
      from: 1,
      to: 9,
      label: 1100000
    },
    {
      from: 1,
      to: 10,
      label: 2040000
    },
    {
      from: 2,
      to: 7,
      label: 6278000
    },
    {
      from: 2,
      to: 10,
      label: 70000
    },
    {
      from: 3,
      to: 7,
      label: 30000
    },
    {
      from: 3,
      to: 8,
      label: 3681000
    },
    {
      from: 3,
      to: 9,
      label: 140000
    },
    {
      from: 3,
      to: 10,
      label: 30000
    },
    {
      from: 4,
      to: 7,
      label: 20000
    },
    {
      from: 4,
      to: 9,
      label: 3837000
    },
    {
      from: 4,
      to: 10,
      label: 300000
    },
    {
      from: 5,
      to: 11,
      label: 14685000
    },
    {
      from: 5,
      to: 16,
      label: 290000
    },
    {
      from: 6,
      to: 11,
      label: 210000
    },
    {
      from: 6,
      to: 12,
      label: 9755000
    },
    {
      from: 6,
      to: 16,
      label: 180000
    },
    {
      from: 7,
      to: 11,
      label: 2110000
    },
    {
      from: 7,
      to: 12,
      label: 530000
    },
    {
      from: 7,
      to: 13,
      label: 2084000
    },
    {
      from: 7,
      to: 14,
      label: 170000
    },
    {
      from: 7,
      to: 15,
      label: 90000
    },
    {
      from: 7,
      to: 16,
      label: 430000
    },
    {
      from: 7,
      to: 17,
      label: 460000
    },
    {
      from: 8,
      to: 11,
      label: 420000
    },
    {
      from: 8,
      to: 12,
      label: 550000
    },
    {
      from: 8,
      to: 14,
      label: 3570000
    },
    {
      from: 8,
      to: 16,
      label: 90000
    },
    {
      from: 8,
      to: 17,
      label: 40000
    },
    {
      from: 9,
      to: 11,
      label: 120000
    },
    {
      from: 9,
      to: 12,
      label: 370000
    },
    {
      from: 9,
      to: 14,
      label: 40000
    },
    {
      from: 9,
      to: 15,
      label: 3780000
    },
    {
      from: 9,
      to: 16,
      label: 340000
    },
    {
      from: 9,
      to: 17,
      label: 320000
    },
    {
      from: 10,
      to: 11,
      label: 1130000
    },
    {
      from: 10,
      to: 12,
      label: 360000
    },
    {
      from: 10,
      to: 16,
      label: 210000
    }
  ]

  return {
    nodes,
    edges
  }
})
