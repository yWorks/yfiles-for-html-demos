/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
  nodesSource: [
    { id: '00', layout: { x: 300, y: 0, width: 30, height: 30 } },
    { id: '01', layout: { x: 300, y: 50, width: 30, height: 30 } },
    { id: '10', layout: { x: 300, y: 112, width: 30, height: 30 }, group: 'group1' },
    { id: '11', layout: { x: 300, y: 162, width: 30, height: 30 }, group: 'group1' },
    { id: '12', layout: { x: 152.5, y: 732, width: 30, height: 30 }, group: 'group1' },
    { id: '20', layout: { x: 300, y: 224, width: 30, height: 30 }, group: 'group2' },
    { id: '21', layout: { x: 255, y: 648, width: 30, height: 30 }, group: 'group2' },
    { id: '22', layout: { x: 440, y: 224, width: 30, height: 30 }, group: 'group2' },
    { id: '30', layout: { x: 305, y: 311, width: 30, height: 30 }, group: 'group3' },
    { id: '31', layout: { x: 297.5, y: 584, width: 30, height: 30 }, group: 'group3' },
    { id: '40', layout: { x: 312.5, y: 388, width: 30, height: 30 }, group: 'group4' },
    { id: '41', layout: { x: 327.5, y: 465, width: 30, height: 30 }, group: 'group4' },
    { id: '42', layout: { x: 327.5, y: 520, width: 30, height: 30 }, group: 'group4' },
    { id: '50', layout: { x: 90, y: 388, width: 30, height: 30 }, group: 'group5' },
    { id: '51', layout: { x: 20, y: 520, width: 30, height: 30 }, group: 'group5' },
    { id: '60', layout: { x: 97.5, y: 465, width: 30, height: 30 }, group: 'group6' },
    { id: '61', layout: { x: 90, y: 520, width: 30, height: 30 }, group: 'group6' },
    { id: '62', layout: { x: 150, y: 520, width: 30, height: 30 }, group: 'group6' }
  ],

  edgesSource: [
    { from: '00', to: '01', sourcePort: { x: 315, y: 30 }, targetPort: { x: 315, y: 50 } },
    { from: '01', to: '10', sourcePort: { x: 315, y: 80 }, targetPort: { x: 315, y: 112 } },
    { from: '10', to: '11', sourcePort: { x: 315, y: 142 }, targetPort: { x: 315, y: 162 } },
    {
      from: '10',
      to: '50',
      sourcePort: { x: 305, y: 142 },
      targetPort: { x: 105, y: 388 },
      bends: [
        { x: 305, y: 152 },
        { x: 105, y: 152 }
      ]
    },
    {
      from: '10',
      to: '12',
      sourcePort: { x: 325, y: 142 },
      targetPort: { x: 180, y: 732 },
      bends: [
        { x: 325, y: 152 },
        { x: 402.5, y: 152 },
        { x: 402.5, y: 717 },
        { x: 180, y: 717 }
      ]
    },
    { from: '11', to: '20', sourcePort: { x: 315, y: 192 }, targetPort: { x: 315, y: 224 } },
    {
      from: '20',
      to: '21',
      sourcePort: { x: 307.5, y: 254 },
      targetPort: { x: 262.5, y: 648 },
      bends: [
        { x: 307.5, y: 274 },
        { x: 262.5, y: 274 }
      ]
    },
    {
      from: '20',
      to: '30',
      sourcePort: { x: 322.5, y: 254 },
      targetPort: { x: 320, y: 311 },
      bends: [
        { x: 322.5, y: 264 },
        { x: 320, y: 264 }
      ]
    },
    {
      from: '21',
      to: '12',
      sourcePort: { x: 270, y: 678 },
      targetPort: { x: 175, y: 732 },
      bends: [
        { x: 270, y: 707 },
        { x: 175, y: 707 }
      ]
    },
    {
      from: '22',
      to: '12',
      sourcePort: { x: 255, y: 254 },
      targetPort: { x: 170, y: 732 },
      bends: [
        { x: 440, y: 697 },
        { x: 170, y: 697 }
      ]
    },
    {
      from: '30',
      to: '31',
      sourcePort: { x: 312.5, y: 341 },
      targetPort: { x: 302.5, y: 584 },
      bends: [
        { x: 312.5, y: 351 },
        { x: 287.5, y: 351 },
        { x: 287.5, y: 569 },
        { x: 302.5, y: 569 }
      ]
    },
    { from: '30', to: '40', sourcePort: { x: 327.5, y: 341 }, targetPort: { x: 327.5, y: 388 } },
    {
      from: '31',
      to: '21',
      sourcePort: { x: 312.5, y: 614 },
      targetPort: { x: 277.5, y: 648 },
      bends: [
        { x: 312.5, y: 633 },
        { x: 277.5, y: 633 }
      ]
    },
    {
      from: '40',
      to: '41',
      sourcePort: { x: 335, y: 418 },
      targetPort: { x: 342.5, y: 465 },
      bends: [
        { x: 335, y: 428 },
        { x: 342.5, y: 428 }
      ]
    },
    {
      from: '40',
      to: '31',
      sourcePort: { x: 320, y: 418 },
      targetPort: { x: 312.5, y: 584 },
      bends: [
        { x: 320, y: 428 },
        { x: 312.5, y: 428 }
      ]
    },
    { from: '41', to: '42', sourcePort: { x: 342.5, y: 495 }, targetPort: { x: 342.5, y: 520 } },
    {
      from: '42',
      to: '31',
      sourcePort: { x: 342.5, y: 550 },
      targetPort: { x: 322.5, y: 584 },
      bends: [
        { x: 342.5, y: 569 },
        { x: 322.5, y: 569 }
      ]
    },
    { from: '50', to: '60', sourcePort: { x: 112.5, y: 418 }, targetPort: { x: 112.5, y: 465 } },
    {
      from: '50',
      to: '51',
      sourcePort: { x: 97.5, y: 418 },
      targetPort: { x: 35, y: 520 },
      bends: [
        { x: 97.5, y: 428 },
        { x: 35, y: 428 }
      ]
    },
    {
      from: '51',
      to: '12',
      sourcePort: { x: 35, y: 550 },
      targetPort: { x: 155, y: 732 },
      bends: [
        { x: 35, y: 683 },
        { x: 155, y: 683 }
      ]
    },
    { from: '60', to: '61', sourcePort: { x: 105, y: 495 }, targetPort: { x: 105, y: 520 } },
    {
      from: '60',
      to: '62',
      sourcePort: { x: 120, y: 495 },
      targetPort: { x: 165, y: 520 },
      bends: [
        { x: 120, y: 505 },
        { x: 165, y: 505 }
      ]
    },
    {
      from: '61',
      to: '12',
      sourcePort: { x: 105, y: 550 },
      targetPort: { x: 160, y: 732 },
      bends: [
        { x: 105, y: 673 },
        { x: 160, y: 673 }
      ]
    },
    { from: '62', to: '12', sourcePort: { x: 165, y: 550 }, targetPort: { x: 165, y: 732 } },
    { from: '20', to: '50', sourcePort: { x: 165, y: 550 }, targetPort: { x: 165, y: 732 } }
  ],

  groupsSource: [
    { id: 'group1', layout: { x: 0, y: 85, width: 412.5, height: 686 }, label: 'group one' },
    {
      id: 'group2',
      layout: { x: 230, y: 197, width: 157.5, height: 490 },
      parentGroup: 'group1',
      label: 'group two'
    },
    {
      id: 'group3',
      layout: { x: 277.5, y: 284, width: 100, height: 339 },
      parentGroup: 'group2',
      label: 'group three',
      collapsed: true
    },
    {
      id: 'group4',
      layout: { x: 302.5, y: 361, width: 65, height: 198 },
      parentGroup: 'group3',
      label: 'group four'
    },
    {
      id: 'group5',
      layout: { x: 10, y: 361, width: 190, height: 207 },
      parentGroup: 'group1',
      label: 'group five'
    },
    {
      id: 'group6',
      layout: { x: 80, y: 438, width: 110, height: 121 },
      parentGroup: 'group5',
      label: 'group six',
      collapsed: true
    }
  ]
}
