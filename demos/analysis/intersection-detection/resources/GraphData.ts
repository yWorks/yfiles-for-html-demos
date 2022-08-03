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
  nodeList: [
    {
      id: 0,
      layout: { x: 1110, y: -229.25, width: 30, height: 76 },
      isEllipse: true
    },
    {
      id: 1,
      layout: { x: 165, y: -267.75, width: 127.5, height: 123 },
      isEllipse: true
    },
    { id: 2, layout: { x: 386.5, y: -485.75, width: 30, height: 132.25 } },
    { id: 3, layout: { x: 386.5, y: -567.5, width: 30, height: 66 } },
    { id: 4, layout: { x: 1013, y: -396.75, width: 57, height: 30 } },
    { id: 5, layout: { x: 923, y: -474, width: 30, height: 30 } },
    {
      id: 6,
      layout: { x: 754, y: -485.5, width: 109, height: 53 },
      labels: [
        {
          text: 'Node Label',
          anchorX: 773.5,
          anchorY: -450.5,
          upX: 0,
          upY: -1,
          width: 70,
          height: 17
        }
      ]
    },
    { id: 7, layout: { x: 793.5, y: -598.5, width: 30, height: 30 } },
    {
      id: 8,
      layout: { x: 386.5, y: -659.75, width: 30, height: 73.5 },
      labels: [
        {
          text: 'Overlapping External\nNode Label',
          anchorX: 339.375,
          anchorY: -550.875,
          upX: 0,
          upY: -1,
          width: 121,
          height: 35
        }
      ]
    },
    { id: 9, layout: { x: 676.25, y: -367.5, width: 30, height: 88 } },
    { id: 10, layout: { x: 793.5, y: -267, width: 30, height: 30 } },
    { id: 11, layout: { x: 903, y: -145.5, width: 70, height: 71 } },
    { id: 12, layout: { x: 793.5, y: -350, width: 30, height: 53 } },
    {
      id: 13,
      layout: { x: 923, y: -351.75, width: 30, height: 30 },
      labels: [
        {
          text: 'Label-Label\nOverlap',
          anchorX: 902.5,
          anchorY: -286.75,
          upX: 0,
          upY: -1,
          width: 71,
          height: 35
        }
      ]
    },
    { id: 14, layout: { x: 386.5, y: -267.75, width: 30, height: 62.25 } },
    {
      id: 15,
      layout: { x: 109.125, y: -334.875, width: 89.3125, height: 88 },
      labels: [
        {
          text: 'Node-Node Overlap\nw/o Considering\nShape Geometry',
          anchorX: 42.4375,
          anchorY: -200.4375,
          upX: 0,
          upY: -1,
          width: 115,
          height: 35
        }
      ],
      isEllipse: true
    },
    {
      id: 16,
      layout: { x: 351, y: -389.25, width: 101, height: 59.25 },
      labels: [
        {
          text: 'Node-Node\nOverlap',
          anchorX: 365,
          anchorY: -342.125,
          upX: 0,
          upY: -1,
          width: 70,
          height: 35
        }
      ]
    },
    { id: 17, layout: { x: 609.75, y: -137.01, width: 163, height: 107 } },
    {
      id: 18,
      layout: { x: 351, y: -107, width: 168.5, height: 107 },
      labels: [
        { text: 'Group', anchorX: 355, anchorY: -89, upX: 0, upY: -1, width: 160.5, height: 14 }
      ],
      isGroup: true
    },
    { id: 19, layout: { x: 362.5, y: -80, width: 78, height: 71 }, parent: 18 },
    { id: 20, layout: { x: 480.5, y: -71, width: 30, height: 53 }, parent: 18 },
    {
      id: 21,
      layout: { x: 541.5, y: -692.5, width: 181.5, height: 200 },
      labels: [
        {
          text: 'Group',
          anchorX: 545.5,
          anchorY: -674.5,
          upX: 0,
          upY: -1,
          width: 173.5,
          height: 14
        }
      ],
      isGroup: true
    },
    { id: 22, layout: { x: 550.5, y: -620.25, width: 78, height: 73.5 }, parent: 21 },
    { id: 23, layout: { x: 668.5, y: -665.5, width: 45.5, height: 164 }, parent: 21 }
  ],
  edgeList: [
    {
      id: 0,
      source: 19,
      target: 20,
      sourcePort: { x: 440.5, y: -44.5 },
      targetPort: { x: 480.5, y: -44.5 },
      bends: [],
      labels: []
    },
    {
      id: 1,
      source: 22,
      target: 23,
      sourcePort: { x: 628.5, y: -583.5 },
      targetPort: { x: 668.5, y: -583.5 },
      bends: [],
      labels: []
    },
    {
      id: 2,
      source: 20,
      target: 0,
      sourcePort: { x: 510.5, y: -44.5 },
      targetPort: { x: 1110, y: -162.75 },
      bends: [
        { x: 1051.5, y: -44.5 },
        { x: 1051.5, y: -162.75 }
      ],
      labels: [
        {
          text: 'Node-Edge Intersection',
          anchorX: 629.7176751806351,
          anchorY: -10.898125862130414,
          upX: 0,
          upY: -1,
          width: 135,
          height: 17
        }
      ]
    },
    {
      id: 3,
      source: 4,
      target: 0,
      sourcePort: { x: 1070, y: -381.75 },
      targetPort: { x: 1110, y: -219.75 },
      bends: [
        { x: 1085, y: -381.75 },
        { x: 1085, y: -219.75 }
      ],
      labels: []
    },
    {
      id: 4,
      source: 5,
      target: 4,
      sourcePort: { x: 953, y: -459 },
      targetPort: { x: 1013, y: -387.75 },
      bends: [
        { x: 968, y: -459 },
        { x: 968, y: -387.75 }
      ],
      labels: []
    },
    {
      id: 5,
      source: 2,
      target: 5,
      sourcePort: { x: 416.5, y: -419.625 },
      targetPort: { x: 923, y: -449 },
      bends: [
        { x: 431.5, y: -419.625 },
        { x: 431.5, y: -402.5 },
        { x: 873, y: -402.5 },
        { x: 873, y: -449 }
      ],
      labels: []
    },
    {
      id: 6,
      source: 6,
      target: 5,
      sourcePort: { x: 863, y: -459 },
      targetPort: { x: 923, y: -459 },
      bends: [],
      labels: []
    },
    {
      id: 7,
      source: 7,
      target: 5,
      sourcePort: { x: 823.5, y: -583.5 },
      targetPort: { x: 923, y: -469 },
      bends: [
        { x: 873, y: -583.5 },
        { x: 873, y: -469 }
      ],
      labels: []
    },
    {
      id: 8,
      source: 3,
      target: 22,
      sourcePort: { x: 416.5, y: -541.1 },
      targetPort: { x: 550.5, y: -583.5 },
      bends: [
        { x: 483.5, y: -541.1 },
        { x: 483.5, y: -583.5 }
      ],
      labels: []
    },
    {
      id: 9,
      source: 23,
      target: 7,
      sourcePort: { x: 714, y: -583.5 },
      targetPort: { x: 793.5, y: -583.5 },
      bends: [],
      labels: []
    },
    {
      id: 10,
      source: 8,
      target: 4,
      sourcePort: { x: 416.5, y: -630.3499999999999 },
      targetPort: { x: 1013, y: -393.75 },
      bends: [
        { x: 978, y: -630.3499999999999 },
        { x: 978, y: -393.75 }
      ],
      labels: [
        {
          text: 'Node-Edge Intersections',
          anchorX: 738.6600632962525,
          anchorY: -630.3509999999999,
          upX: 0,
          upY: -1,
          width: 141,
          height: 17
        }
      ]
    },
    {
      id: 11,
      source: 9,
      target: 10,
      sourcePort: { x: 706.25, y: -294.16666666666663 },
      targetPort: { x: 793.5, y: -252 },
      bends: [
        { x: 721.25, y: -294.16666666666663 },
        { x: 721.25, y: -252 }
      ],
      labels: []
    },
    {
      id: 12,
      source: 10,
      target: 11,
      sourcePort: { x: 823.5, y: -252 },
      targetPort: { x: 903, y: -117.1 },
      bends: [
        { x: 838.5, y: -252 },
        { x: 838.5, y: -117.1 }
      ],
      labels: []
    },
    {
      id: 13,
      source: 11,
      target: 4,
      sourcePort: { x: 973, y: -110 },
      targetPort: { x: 1013, y: -369.75 },
      bends: [
        { x: 988, y: -110 },
        { x: 988, y: -369.75 }
      ],
      labels: [
        {
          text: 'Label-Label\nOverlap',
          anchorX: 918.7252868474927,
          anchorY: -285.5786087891839,
          upX: 0,
          upY: -1,
          width: 71,
          height: 35
        }
      ]
    },
    {
      id: 14,
      source: 13,
      target: 4,
      sourcePort: { x: 953, y: -336.75 },
      targetPort: { x: 1013, y: -375.75 },
      bends: [
        { x: 968, y: -336.75 },
        { x: 968, y: -375.75 }
      ],
      labels: []
    },
    {
      id: 15,
      source: 9,
      target: 12,
      sourcePort: { x: 706.25, y: -323.5 },
      targetPort: { x: 793.5, y: -323.5 },
      bends: [],
      labels: []
    },
    {
      id: 16,
      source: 12,
      target: 13,
      sourcePort: { x: 823.5, y: -336.75 },
      targetPort: { x: 923, y: -336.75 },
      bends: [],
      labels: []
    },
    {
      id: 17,
      source: 9,
      target: 4,
      sourcePort: { x: 706.25, y: -352.8333333333333 },
      targetPort: { x: 1013, y: -381.75 },
      bends: [
        { x: 721.25, y: -352.8333333333333 },
        { x: 721.25, y: -381.75 }
      ],
      labels: []
    },
    {
      id: 18,
      source: 1,
      target: 14,
      sourcePort: { x: 292.5, y: -206.25 },
      targetPort: { x: 386.5, y: -236.625 },
      bends: [
        { x: 299.5, y: -206.25 },
        { x: 299.5, y: -236.625 }
      ],
      labels: []
    },
    {
      id: 19,
      source: 14,
      target: 0,
      sourcePort: { x: 416.5, y: -236.625 },
      targetPort: { x: 1110.5, y: -200.75 },
      bends: [
        { x: 431.5, y: -236.625 },
        { x: 431.5, y: -207 },
        { x: 1051.5, y: -207 },
        { x: 1051.5, y: -200.75 }
      ],
      labels: [
        {
          text: 'Edge Crossings',
          anchorX: 866.9280644001085,
          anchorY: -207.00100000000003,
          upX: 0,
          upY: -1,
          width: 93,
          height: 17
        }
      ]
    },
    {
      id: 20,
      source: 12,
      target: 11,
      sourcePort: { x: 823.5, y: -310.25 },
      targetPort: { x: 903, y: -131.3 },
      bends: [
        { x: 848.5, y: -310.25 },
        { x: 848.5, y: -131.3 }
      ],
      labels: []
    },
    {
      id: 21,
      source: 16,
      target: 9,
      sourcePort: { x: 452, y: -353.70000000000005 },
      targetPort: { x: 676.25, y: -323.5 },
      bends: [
        { x: 564.125, y: -353.70000000000005 },
        { x: 564.125, y: -323.5 }
      ],
      labels: [
        {
          text: 'Overlapping\nEdge Segments',
          anchorX: 574.6044093513838,
          anchorY: -330.42289899821225,
          upX: 0,
          upY: -1,
          width: 94,
          height: 35
        }
      ]
    },
    {
      id: 22,
      source: 17,
      target: 11,
      sourcePort: { x: 772.75, y: -94.21 },
      targetPort: { x: 903.0000000000001, y: -94.21 },
      labels: []
    },
    {
      id: 23,
      source: 1,
      target: 0,
      sourcePort: { x: 288.412719648346, y: -184.58333333333337 },
      targetPort: { x: 1110.232644372002, y: -184.58333333333334 },
      labels: []
    },
    {
      id: 24,
      source: 15,
      target: 9,
      sourcePort: { x: 197.178, y: -301.25 },
      targetPort: { x: 676.25, y: -323.5 },
      bends: [
        { x: 564.125, y: -301.25 },
        { x: 564.125, y: -323.5 }
      ],
      labels: []
    },
    {
      id: 25,
      source: 15,
      target: 2,
      sourcePort: { x: 180.75, y: -325.9375 },
      targetPort: { x: 386.5, y: -419.625 },
      bends: [
        { x: 225.125, y: -325.9375 },
        { x: 225.125, y: -419.625 }
      ],
      labels: []
    },
    {
      id: 26,
      source: 3,
      target: 6,
      sourcePort: { x: 416.5, y: -527.9 },
      targetPort: { x: 754, y: -459 },
      bends: [
        { x: 431.5, y: -527.9 },
        { x: 431.5, y: -459 }
      ],
      labels: []
    }
  ]
}
