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
      bounds: [-47.61, 396.02, 96.0, 96.0],
      label: 'oschi',
      type: 'workstation'
    },
    {
      id: 1,
      bounds: [322.01, -130.0, 96.0, 96.0],
      label: 'scanner',
      type: 'scanner'
    },
    {
      id: 2,
      bounds: [237.76, 296.27, 96.0, 96.0],
      label: 'router',
      type: 'router'
    },
    { id: 3, bounds: [78.21, 12.57, 96.0, 96.0], label: 'klotz', type: 'server' },
    {
      id: 4,
      bounds: [98.51, 558.62, 96.0, 96.0],
      label: 'brummer',
      type: 'workstation'
    },
    {
      id: 5,
      bounds: [371.03, 4.28, 96.0, 96.0],
      label: 'schnucki',
      type: 'workstation'
    },
    {
      id: 6,
      bounds: [-47.61, 172.37, 96.0, 96.0],
      label: 'power',
      type: 'workstation'
    },
    {
      id: 7,
      bounds: [481.73, -45.72, 96.0, 96.0],
      label: 'color',
      type: 'printer'
    },
    {
      id: 8,
      bounds: [-183.3, 438.47, 96.0, 96.0],
      label: 'deskjet',
      type: 'printer'
    },
    {
      id: 9,
      bounds: [964.64, 233.16, 96.0, 96.0],
      label: 'laser',
      type: 'printer'
    },
    {
      id: 10,
      bounds: [570.69, 213.43, 96.0, 96.0],
      label: 'scanner',
      type: 'scanner'
    },
    {
      id: 11,
      bounds: [759.14, 362.41, 96.0, 96.0],
      label: 'switch',
      type: 'switch'
    },
    {
      id: 12,
      bounds: [866.5, 308.77, 96.0, 96.0],
      label: 'trumm',
      type: 'workstation'
    },
    {
      id: 13,
      bounds: [836.21, 478.16, 96.0, 96.0],
      label: 'garelli',
      type: 'workstation'
    },
    {
      id: 14,
      bounds: [700.4, 263.83, 96.0, 96.0],
      label: 'brocken',
      type: 'workstation'
    },
    {
      id: 15,
      bounds: [664.83, 462.74, 96.0, 96.0],
      label: 'kreidler',
      type: 'workstation'
    },
    {
      id: 16,
      bounds: [727.38, 133.29, 96.0, 96.0],
      label: 'phaser',
      type: 'printer'
    },
    {
      id: 17,
      bounds: [554.57, 546.24, 96.0, 96.0],
      label: 'phaser',
      type: 'printer'
    },
    {
      id: 18,
      bounds: [315.66, 583.79, 96.0, 96.0],
      label: 'protz',
      type: 'workstation'
    }
  ],
  edges: [
    { id: 0, src: 2, tgt: 0 },
    { id: 1, src: 2, tgt: 6 },
    { id: 2, src: 2, tgt: 5 },
    { id: 3, src: 2, tgt: 4 },
    { id: 4, src: 2, tgt: 3 },
    { id: 5, src: 0, tgt: 8 },
    { id: 6, src: 5, tgt: 7 },
    { id: 7, src: 5, tgt: 1 },
    { id: 8, src: 11, tgt: 15 },
    { id: 9, src: 11, tgt: 14 },
    { id: 10, src: 11, tgt: 13 },
    { id: 11, src: 11, tgt: 12 },
    { id: 12, src: 12, tgt: 9 },
    { id: 13, src: 14, tgt: 16 },
    { id: 14, src: 14, tgt: 10 },
    { id: 15, src: 2, tgt: 11 },
    { id: 16, src: 15, tgt: 17 },
    { id: 17, src: 2, tgt: 18 }
  ]
}
