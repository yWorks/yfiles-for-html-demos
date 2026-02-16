/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
export const hierarchicalData = {
  nodes: [
    { id: 0, x: -296, y: -105, w: 30, h: 30 },
    { id: 1, x: -555, y: -420, w: 30, h: 30 },
    { id: 2, x: -143.75, y: -270.875, w: 30, h: 30 },
    { id: 3, x: -65.5625, y: -186.875, w: 30, h: 30 },
    { id: 4, x: 80.90625, y: -236.875, w: 30, h: 30 },
    { id: 5, x: 127.140625, y: -148.875, w: 30, h: 30 },
    { id: 6, x: -35.7421875, y: -9.875, w: 30, h: 30 },
    { id: 7, x: -350.9296875, y: -292.9375, w: 30, h: 30 },
    { id: 8, x: -228.9296875, y: -159.9375, w: 30, h: 30 },
    { id: 9, x: -515.9296875, y: -186.9375, w: 30, h: 30 },
    { id: 10, x: -654.9296875, y: -179.9375, w: 30, h: 30 },
    { id: 11, x: -768.89453125, y: -277.9375, w: 30, h: 30 },
    { id: 12, x: -812.876953125, y: -364.9375, w: 30, h: 30 },
    { id: 13, x: -89.8681640625, y: -407.9375, w: 30, h: 30 },
    { id: 14, x: 132.1318359375, y: -38.9375, w: 30, h: 30 },
    { id: 15, x: -509.37255859375, y: -14.9375, w: 30, h: 30 },
    { id: 16, x: -788.37255859375, y: -47.9375, w: 30, h: 30 },
    { id: 17, x: -900.37255859375, y: -146.9375, w: 30, h: 30 }
  ],
  edges: [
    { source: 3, target: 4 },
    { source: 4, target: 5 },
    { source: 5, target: 6 },
    { source: 6, target: 0 },
    { source: 3, target: 6 },
    { source: 2, target: 3 },
    { source: 1, target: 0 },
    { source: 17, target: 11 },
    { source: 11, target: 12 },
    { source: 12, target: 1 },
    { source: 1, target: 10 },
    { source: 10, target: 9 },
    { source: 9, target: 15 },
    { source: 15, target: 16 },
    { source: 17, target: 10 },
    { source: 7, target: 9 },
    { source: 7, target: 1 },
    { source: 2, target: 8 },
    { source: 8, target: 0 },
    { source: 7, target: 13 },
    { source: 13, target: 2 },
    { source: 13, target: 4 },
    { source: 5, target: 14 },
    { source: 6, target: 14 },
    { source: 6, target: 15 },
    { source: 10, target: 15 },
    { source: 1, target: 13 },
    { source: 1, target: 9 },
    { source: 7, target: 8 },
    { source: 11, target: 10 },
    { source: 12, target: 17 },
    { source: 17, target: 16 },
    { source: 11, target: 1 },
    { source: 7, target: 2 }
  ]
}
