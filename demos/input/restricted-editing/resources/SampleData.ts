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
export default {
  nodes: [
    { id: 0, bounds: [151.25, -20.0, 30.0, 30.0] },
    { id: 1, bounds: [151.25, 30.0, 30.0, 30.0] },
    { id: 2, bounds: [185.0, 619.0, 30.0, 30.0] },
    { id: 4, bounds: [57.5, 494.0, 30.0, 30.0], parent: 3 },
    { id: 5, bounds: [125.0, 494.0, 30.0, 30.0], parent: 3 },
    { id: 6, bounds: [125.0, 569.0, 30.0, 30.0], parent: 3 },
    { id: 7, bounds: [185.0, 494.0, 30.0, 30.0], parent: 3 },
    { id: 8, bounds: [185.0, 569.0, 30.0, 30.0], parent: 3 },
    { id: 9, bounds: [5.0, 569.0, 30.0, 30.0], parent: 3 },
    { id: 10, bounds: [65.0, 569.0, 30.0, 30.0], parent: 3 },
    { id: 12, bounds: [151.25, 103.0, 30.0, 30.0], parent: 11 },
    { id: 13, bounds: [185.0, 178.0, 30.0, 30.0], parent: 11 },
    { id: 14, bounds: [117.5, 178.0, 30.0, 30.0], parent: 11 },
    { id: 15, bounds: [60.0, 311.0, 30.0, 30.0], parent: 11 },
    { id: 16, bounds: [125.0, 361.0, 30.0, 30.0], parent: 11 },
    { id: 17, bounds: [125.0, 411.0, 30.0, 30.0], parent: 11 },
    { id: 19, bounds: [125.0, 261.0, 30.0, 30.0], parent: 18 },
    { id: 20, bounds: [125.0, 311.0, 30.0, 30.0], parent: 18 },
    { id: 21, bounds: [185.0, 311.0, 30.0, 30.0], parent: 18 },
    { id: 22, bounds: [185.0, 261.0, 30.0, 30.0], parent: 18 }
  ],
  groups: [
    { id: 3, bounds: [-4.0, 467.0, 228.0, 141.0] },
    { id: 11, bounds: [51.0, 76.0, 181.0, 374.0] },
    { id: 18, bounds: [115, 234.0, 110.0, 119.0], parent: 11 }
  ],
  edges: [
    { id: 0, src: 7, tgt: 8 },
    { id: 1, src: 5, tgt: 6 },
    {
      id: 2,
      src: 4,
      tgt: 9,
      bends: [
        { x: 65.0, y: 534.0 },
        { x: 20.0, y: 554.0 }
      ]
    },
    { id: 3, src: 4, tgt: 10, bends: [{ x: 80.0, y: 534.0 }] },
    { id: 4, src: 19, tgt: 20 },
    { id: 5, src: 22, tgt: 21 },
    {
      id: 6,
      src: 12,
      tgt: 14,
      bends: [
        { x: 158.75, y: 143.0 },
        { x: 132.5, y: 163.0 }
      ]
    },
    {
      id: 7,
      src: 14,
      tgt: 15,
      bends: [
        { x: 125.0, y: 218.0 },
        { x: 75.0, y: 238.0 }
      ]
    },
    {
      id: 8,
      src: 12,
      tgt: 13,
      bends: [
        { x: 173.75, y: 143.0 },
        { x: 200.0, y: 163.0 }
      ]
    },
    { id: 9, src: 14, tgt: 19, bends: [{ x: 140.0, y: 218.0 }] },
    { id: 10, src: 13, tgt: 22 },
    { id: 11, src: 20, tgt: 16 },
    { id: 12, src: 16, tgt: 17 },
    { id: 13, src: 0, tgt: 1 },
    { id: 14, src: 1, tgt: 12 },
    {
      id: 15,
      src: 17,
      tgt: 4,
      bends: [
        { x: 130.0, y: 451.0 },
        { x: 72.5, y: 471.0 }
      ]
    },
    {
      id: 16,
      src: 17,
      tgt: 7,
      bends: [
        { x: 150.0, y: 451.0 },
        { x: 200.0, y: 471.0 }
      ]
    },
    { id: 17, src: 17, tgt: 5 },
    { id: 18, src: 8, tgt: 2 }
  ]
}
