/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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

define([], () => {
  const SineSample = {
    nodes: [
      {
        id: 0,
        angle: 0,
        cx: 0,
        cy: 0
      },
      {
        id: 1,
        angle: 18,
        cx: 70,
        cy: 144.2079307083088
      },
      {
        id: 2,
        angle: 36,
        cx: 140,
        cy: 274.29978440315415
      },
      {
        id: 3,
        angle: 54,
        cx: 210,
        cy: 377.54126404164214
      },
      {
        id: 4,
        angle: 72,
        cx: 280,
        cy: 443.82637427107164
      },
      {
        id: 5,
        angle: 90,
        cx: 350,
        cy: 466.6666666666667
      },
      {
        id: 6,
        angle: 108,
        cx: 420,
        cy: 443.8263742710717
      },
      {
        id: 7,
        angle: 126,
        cx: 490,
        cy: 377.54126404164214
      },
      {
        id: 8,
        angle: 144,
        cx: 560,
        cy: 274.2997844031542
      },
      {
        id: 9,
        angle: 162,
        cx: 630,
        cy: 144.20793070830885
      },
      {
        id: 10,
        angle: 180,
        cx: 700,
        cy: 5.684341886080802e-14
      },
      {
        id: 11,
        angle: 162,
        cx: 770,
        cy: -144.20793070830857
      },
      {
        id: 12,
        angle: 144,
        cx: 840,
        cy: -274.2997844031541
      },
      {
        id: 13,
        angle: 126,
        cx: 910,
        cy: -377.5412640416421
      },
      {
        id: 14,
        angle: 108,
        cx: 980,
        cy: -443.82637427107164
      },
      {
        id: 15,
        angle: 90,
        cx: 1050,
        cy: -466.6666666666667
      },
      {
        id: 16,
        angle: 72,
        cx: 1120,
        cy: -443.8263742710717
      },
      {
        id: 17,
        angle: 54,
        cx: 1190,
        cy: -377.54126404164225
      },
      {
        id: 18,
        angle: 36,
        cx: 1260,
        cy: -274.2997844031542
      },
      {
        id: 19,
        angle: 18,
        cx: 1330,
        cy: -144.20793070830888
      },
      {
        id: 20,
        angle: 0,
        cx: 1400,
        cy: -1.1368683772161603e-13
      }
    ],
    edges: [
      {
        source: 19,
        target: 12
      },
      {
        source: 3,
        target: 16
      },
      {
        source: 7,
        target: 4
      },
      {
        source: 5,
        target: 17
      },
      {
        source: 19,
        target: 18
      },
      {
        source: 15,
        target: 6
      },
      {
        source: 11,
        target: 6
      },
      {
        source: 4,
        target: 10
      },
      {
        source: 0,
        target: 5
      },
      {
        source: 20,
        target: 16
      },
      {
        source: 6,
        target: 10
      },
      {
        source: 20,
        target: 9
      },
      {
        source: 13,
        target: 1
      },
      {
        source: 14,
        target: 15
      },
      {
        source: 11,
        target: 19
      }
    ]
  }

  const CircleSample = {
    nodes: [
      {
        id: 0,
        angle: 90,
        cx: 25,
        cy: 550
      },
      {
        id: 1,
        angle: 100,
        cx: 111.82408883346517,
        cy: 542.403876506104
      },
      {
        id: 2,
        angle: 110,
        cx: 196.01007166283435,
        cy: 519.8463103929541
      },
      {
        id: 3,
        angle: 120,
        cx: 275,
        cy: 483.01270189221935
      },
      {
        id: 4,
        angle: 130,
        cx: 346.3938048432696,
        cy: 433.022221559489
      },
      {
        id: 5,
        angle: 140,
        cx: 408.022221559489,
        cy: 371.39380484326966
      },
      {
        id: 6,
        angle: 150,
        cx: 458.0127018922193,
        cy: 300.00000000000006
      },
      {
        id: 7,
        angle: 160,
        cx: 494.84631039295414,
        cy: 221.0100716628344
      },
      {
        id: 8,
        angle: 170,
        cx: 517.403876506104,
        cy: 136.82408883346523
      },
      {
        id: 9,
        angle: 180,
        cx: 525,
        cy: 50.00000000000003
      },
      {
        id: 10,
        angle: 190,
        cx: 517.403876506104,
        cy: -36.824088833465154
      },
      {
        id: 11,
        angle: 200,
        cx: 494.8463103929542,
        cy: -121.01007166283435
      },
      {
        id: 12,
        angle: 210,
        cx: 458.01270189221935,
        cy: -199.9999999999999
      },
      {
        id: 13,
        angle: 220,
        cx: 408.022221559489,
        cy: -271.39380484326966
      },
      {
        id: 14,
        angle: 230,
        cx: 346.3938048432697,
        cy: -333.02222155948897
      },
      {
        id: 15,
        angle: 240,
        cx: 275,
        cy: -383.01270189221935
      },
      {
        id: 16,
        angle: 250,
        cx: 196.01007166283443,
        cy: -419.84631039295414
      },
      {
        id: 17,
        angle: 260,
        cx: 111.82408883346514,
        cy: -442.403876506104
      },
      {
        id: 18,
        angle: 270,
        cx: 25.00000000000006,
        cy: -450
      },
      {
        id: 19,
        angle: 280,
        cx: -61.82408883346524,
        cy: -442.403876506104
      },
      {
        id: 20,
        angle: 290,
        cx: -146.01007166283432,
        cy: -419.8463103929542
      },
      {
        id: 21,
        angle: 300,
        cx: -225.00000000000006,
        cy: -383.0127018922193
      },
      {
        id: 22,
        angle: 310,
        cx: -296.3938048432696,
        cy: -333.0222215594891
      },
      {
        id: 23,
        angle: 320,
        cx: -358.02222155948897,
        cy: -271.3938048432697
      },
      {
        id: 24,
        angle: 330,
        cx: -408.01270189221924,
        cy: -200.00000000000023
      },
      {
        id: 25,
        angle: 340,
        cx: -444.8463103929541,
        cy: -121.01007166283469
      },
      {
        id: 26,
        angle: 350,
        cx: -467.403876506104,
        cy: -36.82408883346517
      },
      {
        id: 27,
        angle: 0,
        cx: -475,
        cy: 49.99999999999991
      },
      {
        id: 28,
        angle: 10,
        cx: -467.40387650610404,
        cy: 136.824088833465
      },
      {
        id: 29,
        angle: 20,
        cx: -444.84631039295425,
        cy: 221.01007166283406
      },
      {
        id: 30,
        angle: 30,
        cx: -408.0127018922193,
        cy: 300.00000000000006
      },
      {
        id: 31,
        angle: 40,
        cx: -358.0222215594891,
        cy: 371.3938048432696
      },
      {
        id: 32,
        angle: 50,
        cx: -296.3938048432698,
        cy: 433.0222215594889
      },
      {
        id: 33,
        angle: 60,
        cx: -225.00000000000023,
        cy: 483.0127018922192
      },
      {
        id: 34,
        angle: 70,
        cx: -146.0100716628343,
        cy: 519.8463103929541
      },
      {
        id: 35,
        angle: 80,
        cx: -61.82408883346564,
        cy: 542.4038765061039
      }
    ],
    edges: [
      {
        source: 23,
        target: 5
      },
      {
        source: 5,
        target: 31
      },
      {
        source: 23,
        target: 31
      },
      {
        source: 12,
        target: 18
      },
      {
        source: 1,
        target: 5
      },
      {
        source: 29,
        target: 2
      },
      {
        source: 23,
        target: 27
      },
      {
        source: 13,
        target: 33
      },
      {
        source: 16,
        target: 8
      },
      {
        source: 12,
        target: 18
      },
      {
        source: 13,
        target: 19
      },
      {
        source: 30,
        target: 27
      },
      {
        source: 29,
        target: 6
      },
      {
        source: 34,
        target: 5
      },
      {
        source: 27,
        target: 8
      }
    ]
  }

  return {
    SineSample,
    CircleSample
  }
})
