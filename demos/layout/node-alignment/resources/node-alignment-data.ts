/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
export const sampleData: {
  nodes: {
    id: number
    layout: { x: number; y: number; width: number; height: number }
  }[]
  edges: {
    source: number
    target: number
  }[]
} = {
  nodes: [
    { id: 0, layout: { x: 435.12, y: 230.13, width: 203, height: 30 } },
    { id: 1, layout: { x: 382, y: 230.13, width: 30, height: 30 } },
    { id: 2, layout: { x: 578.68, y: 69.6, width: 164, height: 30 } },
    { id: 3, layout: { x: 364, y: 151.63, width: 66.01, height: 30 } },
    { id: 4, layout: { x: 475.62, y: 151.63, width: 122, height: 30 } },
    { id: 5, layout: { x: 639.68, y: 295.99, width: 42, height: 30 } },
    { id: 6, layout: { x: 521.62, y: 295.99, width: 30, height: 30 } },
    { id: 7, layout: { x: 313, y: 230.13, width: 30, height: 30 } },
    { id: 8, layout: { x: 331, y: 295.99, width: 132, height: 30 } },
    { id: 9, layout: { x: 307, y: 151.63, width: 42, height: 30 } },
    { id: 10, layout: { x: 621.68, y: 118.13, width: 78, height: 97 } },
    { id: 11, layout: { x: 521.62, y: 36.1, width: 30, height: 97 } },
    { id: 12, layout: { x: 327.5, y: 69.6, width: 139, height: 30 } }
  ],
  edges: [
    { source: 0, target: 1 },
    { source: 3, target: 1 },
    { source: 3, target: 4 },
    { source: 4, target: 0 },
    { source: 0, target: 6 },
    { source: 6, target: 5 },
    { source: 1, target: 7 },
    { source: 1, target: 8 },
    { source: 8, target: 6 },
    { source: 7, target: 9 },
    { source: 9, target: 3 },
    { source: 5, target: 10 },
    { source: 4, target: 10 },
    { source: 10, target: 2 },
    { source: 2, target: 11 },
    { source: 11, target: 4 },
    { source: 11, target: 12 },
    { source: 12, target: 3 }
  ]
}
