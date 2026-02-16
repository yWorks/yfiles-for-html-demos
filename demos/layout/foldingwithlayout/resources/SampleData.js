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
export default {
  nodesSource: [
    { id: 0, layout: { x: 188, y: 0, width: 30, height: 30 } },
    { id: 1, layout: { x: 188, y: 50, width: 30, height: 30 } },
    { id: 3, group: 'group1', layout: { x: 188, y: 112, width: 30, height: 30 } },
    { id: 4, group: 'group1', layout: { x: 93.5, y: 167, width: 30, height: 30 } },
    { id: 5, group: 'group1', layout: { x: 89.5, y: 927, width: 30, height: 30 } },
    { id: 7, group: 'group2', layout: { x: 93.5, y: 229, width: 30, height: 30 } },
    { id: 8, group: 'group2', layout: { x: 48, y: 616, width: 30, height: 30 } },
    { id: 9, group: 'group2', layout: { x: 18, y: 229, width: 30, height: 30 } },
    { id: 11, group: 'group3', layout: { x: 93.5, y: 306, width: 30, height: 30 } },
    { id: 12, group: 'group3', layout: { x: 86, y: 552, width: 30, height: 30 } },
    { id: 14, group: 'group4', layout: { x: 101, y: 383, width: 30, height: 30 } },
    { id: 15, group: 'group4', layout: { x: 116, y: 438, width: 30, height: 30 } },
    { id: 16, group: 'group3', layout: { x: 116, y: 488, width: 30, height: 30 } },
    { id: 18, group: 'group5', layout: { x: 171.5, y: 702, width: 30, height: 30 } },
    { id: 19, group: 'group5', layout: { x: 87, y: 834, width: 30, height: 30 } },
    { id: 21, group: 'group6', layout: { x: 179, y: 779, width: 30, height: 30 } },
    { id: 22, group: 'group6', layout: { x: 156, y: 834, width: 30, height: 30 } },
    { id: 23, group: 'group6', layout: { x: 216, y: 834, width: 30, height: 30 } }
  ],
  edgesSource: [
    { from: 0, to: 1, sourcePort: { x: 203, y: 30 }, targetPort: { x: 203, y: 50 } },
    {
      from: 1,
      to: 3,
      sourcePort: { x: 203, y: 80 },
      targetPort: { x: 203, y: 112 },
      tag: { from: '01', to: '10', sourcePort: { x: 315, y: 80 }, targetPort: { x: 315, y: 112 } }
    },
    {
      from: 3,
      to: 4,
      sourcePort: { x: 193, y: 142 },
      targetPort: { x: 108.5, y: 167 },
      bends: [
        { x: 193, y: 152 },
        { x: 108.5, y: 152 }
      ]
    },
    {
      from: 3,
      to: 18,
      sourcePort: { x: 203, y: 142 },
      targetPort: { x: 194, y: 702 },
      bends: [
        { x: 203, y: 665 },
        { x: 194, y: 665 }
      ]
    },
    {
      from: 3,
      to: 5,
      sourcePort: { x: 213, y: 142 },
      targetPort: { x: 117, y: 927 },
      bends: [
        { x: 213, y: 152 },
        { x: 279, y: 152 },
        { x: 279, y: 912 },
        { x: 117, y: 912 }
      ]
    },
    { from: 4, to: 7, sourcePort: { x: 108.5, y: 197 }, targetPort: { x: 108.5, y: 229 } },
    {
      from: 7,
      to: 8,
      sourcePort: { x: 98.5, y: 259 },
      targetPort: { x: 55.5, y: 616 },
      bends: [
        { x: 98.5, y: 269 },
        { x: 53, y: 269 },
        { x: 53, y: 592 },
        { x: 55.5, y: 592 }
      ]
    },
    { from: 7, to: 11, sourcePort: { x: 108.5, y: 259 }, targetPort: { x: 108.5, y: 306 } },
    {
      from: 8,
      to: 5,
      sourcePort: { x: 63, y: 646 },
      targetPort: { x: 97, y: 927 },
      bends: [
        { x: 63, y: 892 },
        { x: 97, y: 892 }
      ]
    },
    {
      from: 9,
      to: 5,
      sourcePort: { x: 33, y: 259 },
      targetPort: { x: 92, y: 927 },
      bends: [
        { x: 33, y: 902 },
        { x: 92, y: 902 }
      ]
    },
    {
      from: 11,
      to: 12,
      sourcePort: { x: 101, y: 336 },
      targetPort: { x: 91, y: 552 },
      bends: [
        { x: 101, y: 346 },
        { x: 77, y: 346 },
        { x: 77, y: 537 },
        { x: 91, y: 537 }
      ]
    },
    {
      from: 11,
      to: 14,
      sourcePort: { x: 116, y: 336 },
      targetPort: { x: 116, y: 383 },
      tag: {
        from: '30',
        to: '40',
        sourcePort: { x: 327.5, y: 341 },
        targetPort: { x: 327.5, y: 388 }
      }
    },
    {
      from: 12,
      to: 8,
      sourcePort: { x: 101, y: 582 },
      targetPort: { x: 70.5, y: 616 },
      bends: [
        { x: 101, y: 601 },
        { x: 70.5, y: 601 }
      ]
    },
    {
      from: 14,
      to: 15,
      sourcePort: { x: 123.5, y: 413 },
      targetPort: { x: 131, y: 438 },
      bends: [
        { x: 123.5, y: 423 },
        { x: 131, y: 423 }
      ]
    },
    {
      from: 14,
      to: 12,
      sourcePort: { x: 108.5, y: 413 },
      targetPort: { x: 101, y: 552 },
      bends: [
        { x: 108.5, y: 423 },
        { x: 101, y: 423 }
      ]
    },
    {
      from: 15,
      to: 16,
      sourcePort: { x: 131, y: 468 },
      targetPort: { x: 131, y: 488 },
      tag: {
        from: '41',
        to: '42',
        sourcePort: { x: 342.5, y: 495 },
        targetPort: { x: 342.5, y: 520 }
      }
    },
    {
      from: 16,
      to: 12,
      sourcePort: { x: 131, y: 518 },
      targetPort: { x: 111, y: 552 },
      bends: [
        { x: 131, y: 537 },
        { x: 111, y: 537 }
      ]
    },
    {
      from: 18,
      to: 21,
      sourcePort: { x: 194, y: 732 },
      targetPort: { x: 194, y: 779 },
      tag: {
        from: '50',
        to: '60',
        sourcePort: { x: 112.5, y: 418 },
        targetPort: { x: 112.5, y: 465 }
      }
    },
    {
      from: 18,
      to: 19,
      sourcePort: { x: 179, y: 732 },
      targetPort: { x: 102, y: 834 },
      bends: [
        { x: 179, y: 742 },
        { x: 102, y: 742 }
      ]
    },
    {
      from: 19,
      to: 5,
      sourcePort: { x: 102, y: 864 },
      targetPort: { x: 102, y: 927 },
      tag: {
        from: '51',
        to: '12',
        sourcePort: { x: 35, y: 550 },
        targetPort: { x: 155, y: 732 },
        bends: [
          { x: 35, y: 683 },
          { x: 155, y: 683 }
        ]
      }
    },
    {
      from: 21,
      to: 22,
      sourcePort: { x: 186.5, y: 809 },
      targetPort: { x: 171, y: 834 },
      bends: [
        { x: 186.5, y: 819 },
        { x: 171, y: 819 }
      ]
    },
    {
      from: 21,
      to: 23,
      sourcePort: { x: 201.5, y: 809 },
      targetPort: { x: 231, y: 834 },
      bends: [
        { x: 201.5, y: 819 },
        { x: 231, y: 819 }
      ]
    },
    {
      from: 22,
      to: 5,
      sourcePort: { x: 171, y: 864 },
      targetPort: { x: 107, y: 927 },
      bends: [
        { x: 171, y: 892 },
        { x: 107, y: 892 }
      ]
    },
    {
      from: 23,
      to: 5,
      sourcePort: { x: 231, y: 864 },
      targetPort: { x: 112, y: 927 },
      bends: [
        { x: 231, y: 902 },
        { x: 112, y: 902 }
      ]
    },
    {
      from: 7,
      to: 18,
      sourcePort: { x: 118.5, y: 259 },
      targetPort: { x: 179, y: 702 },
      bends: [
        { x: 118.5, y: 269 },
        { x: 179, y: 269 }
      ]
    }
  ],
  groupsSource: [
    {
      id: 'group1',
      layout: { x: 0, y: 85, width: 288, height: 881 },
      label: 'group one',
      collapsed: true
    },
    {
      id: 'group2',
      layout: { x: 9, y: 202, width: 179, height: 453 },
      label: 'group two',
      collapsed: true,
      parentGroup: 'group1'
    },
    {
      id: 'group3',
      layout: { x: 68, y: 279, width: 96, height: 312 },
      label: 'group three',
      collapsed: true,
      parentGroup: 'group2'
    },
    {
      id: 'group4',
      layout: { x: 92, y: 356, width: 63, height: 171 },
      label: 'group four',
      collapsed: true,
      parentGroup: 'group3'
    },
    {
      id: 'group5',
      layout: { x: 78, y: 675, width: 186, height: 207 },
      label: 'group five',
      collapsed: true,
      parentGroup: 'group1'
    },
    {
      id: 'group6',
      layout: { x: 147, y: 752, width: 108, height: 121 },
      label: 'group six',
      collapsed: true,
      parentGroup: 'group5'
    }
  ]
}
