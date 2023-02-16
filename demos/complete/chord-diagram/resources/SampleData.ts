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
export default {
  nodes: [
    {
      id: 0,
      label: ['a'],
      x: 0,
      y: 0,
      color: '#363020'
    },
    {
      id: 1,
      label: ['b'],
      x: 0,
      y: 100,
      color: '#605C4E'
    },
    {
      id: 2,
      label: ['c'],
      x: 0,
      y: 200,
      color: '#A49966'
    },
    {
      id: 3,
      label: ['d'],
      x: 0,
      y: 300,
      color: '#C7C7A6'
    },
    {
      id: 4,
      label: ['e'],
      x: 0,
      y: 300,
      color: '#EAFFDA'
    },
    {
      id: 5,
      label: ['f'],
      x: 0,
      y: 300,
      color: '#A4778B'
    },
    {
      id: 6,
      label: ['g'],
      x: 0,
      y: 300,
      color: '#AA4586'
    },
    {
      id: 7,
      label: ['h'],
      x: 0,
      y: 300,
      color: '#177E89'
    },
    {
      id: 8,
      label: ['i'],
      x: 0,
      y: 300,
      color: '#8c0202'
    },
    {
      id: 9,
      label: ['j'],
      x: 0,
      y: 300,
      color: '#ff5400'
    }
  ],

  edges: [
    {
      from: 0,
      to: 1,
      thickness: 30
    },
    {
      from: 0,
      to: 2,
      thickness: 20
    },
    {
      from: 0,
      to: 3,
      thickness: 10
    },
    {
      from: 1,
      to: 2,
      thickness: 15
    },
    {
      from: 1,
      to: 3,
      thickness: 25
    },
    {
      from: 2,
      to: 3,
      thickness: 12
    },
    {
      from: 3,
      to: 4,
      thickness: 12
    },
    {
      from: 3,
      to: 6,
      thickness: 12
    },
    {
      from: 6,
      to: 7,
      thickness: 12
    },
    {
      from: 1,
      to: 5,
      thickness: 12
    },
    {
      from: 3,
      to: 8,
      thickness: 19
    },
    {
      from: 3,
      to: 9,
      thickness: 17
    }
  ]
}
