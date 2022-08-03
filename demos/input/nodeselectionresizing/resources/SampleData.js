/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
export default {
  nodes: [
    { id: 0, x: -15, y: -115 },
    { id: 1, x: -15, y: -15 },
    { id: 2, x: -115, y: 85 },
    { id: 3, x: -15, y: 85 },
    { id: 4, x: 85, y: 85 },
    { id: 5, x: -130, y: 165, width: 260, height: 200, isGroup: true },
    { id: 6, x: -115, y: 200, parent: 5 },
    { id: 7, x: -15, y: 200, parent: 5 },
    { id: 8, x: 85, y: 200, parent: 5 },
    { id: 9, x: -115, y: 300, parent: 5 },
    { id: 10, x: -15, y: 300, parent: 5 },
    { id: 11, x: 85, y: 300, parent: 5 }
  ],
  edges: [
    {
      id: 0,
      source: 6,
      target: 9,
      sourcePort: { x: -100, y: 215 },
      targetPort: { x: -100, y: 315 }
    },
    { id: 1, source: 7, target: 10, sourcePort: { x: 0, y: 215 }, targetPort: { x: 0, y: 315 } },
    {
      id: 2,
      source: 8,
      target: 11,
      sourcePort: { x: 100, y: 215 },
      targetPort: { x: 100, y: 315 }
    },
    {
      id: 3,
      source: 0,
      target: 0,
      sourcePort: { x: 0, y: -100 },
      targetPort: { x: 0, y: -100 },
      bends: [
        { x: -31.5, y: -100 },
        { x: -31.5, y: -140 },
        { x: 0, y: -140 }
      ]
    },
    { id: 4, source: 0, target: 1, sourcePort: { x: 0, y: -100 }, targetPort: { x: 0, y: 0 } },
    {
      id: 5,
      source: 1,
      target: 2,
      sourcePort: { x: 0, y: 0 },
      targetPort: { x: -100, y: 100 },
      bends: [
        { x: 0, y: 40 },
        { x: -100, y: 40 }
      ]
    },
    { id: 6, source: 1, target: 3, sourcePort: { x: 0, y: 0 }, targetPort: { x: 0, y: 100 } },
    {
      id: 7,
      source: 1,
      target: 4,
      sourcePort: { x: 0, y: 0 },
      targetPort: { x: 100, y: 100 },
      bends: [
        { x: 0, y: 40 },
        { x: 100, y: 40 }
      ]
    },
    { id: 8, source: 3, target: 6, sourcePort: { x: 0, y: 100 }, targetPort: { x: -100, y: 215 } },
    { id: 9, source: 3, target: 7, sourcePort: { x: 0, y: 100 }, targetPort: { x: 0, y: 215 } },
    { id: 10, source: 3, target: 8, sourcePort: { x: 0, y: 100 }, targetPort: { x: 100, y: 215 } },
    {
      id: 11,
      source: 0,
      target: 11,
      sourcePort: { x: 0, y: -100 },
      targetPort: { x: 100, y: 315 },
      bends: [
        { x: 150, y: -100 },
        { x: 150, y: 315 }
      ]
    }
  ]
}
