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
  const EdgeBetweenness = {
    nodes: [
      {
        id: 0,
        x: 442.81219512195116,
        y: 712.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 1,
        x: 174.81219512195116,
        y: 842.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 2,
        x: 306.81219512195116,
        y: 891.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 3,
        x: 180.81219512195116,
        y: 905.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 4,
        x: 380.81219512195116,
        y: 820.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 5,
        x: 241.81219512195116,
        y: 884.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 6,
        x: 246.81219512195116,
        y: 823.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 7,
        x: 368.81219512195116,
        y: 759.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 8,
        x: 251.81219512195116,
        y: 952.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 9,
        x: 441.81219512195116,
        y: 776.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 10,
        x: 308.89512195121955,
        y: 823.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 11,
        x: 381.81219512195116,
        y: 698.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 12,
        x: 283.24878048780494,
        y: 768.4195121951218,
        w: 30,
        h: 30
      },
      {
        id: 13,
        x: 444.81219512195116,
        y: 839.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 14,
        x: -14.463414634146432,
        y: 756.4585365853659,
        w: 30,
        h: 30
      },
      {
        id: 15,
        x: 371.81219512195116,
        y: 884.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 16,
        x: -94.20995934959353,
        y: 535.5333333333338,
        w: 30,
        h: 30
      },
      {
        id: 17,
        x: -174.08739837398372,
        y: 598.8882113821137,
        w: 30,
        h: 30
      },
      {
        id: 18,
        x: -245.53252032520317,
        y: 522.2491869918699,
        w: 30,
        h: 30
      },
      {
        id: 19,
        x: -135.6691056910568,
        y: 474.07845528455294,
        w: 30,
        h: 30
      },
      {
        id: 20,
        x: -247.51422764227635,
        y: 447.60284552845525,
        w: 30,
        h: 30
      },
      {
        id: 21,
        x: -157.75813008130075,
        y: 648.3180894308948,
        w: 30,
        h: 30
      },
      {
        id: 22,
        x: 656.8121951219512,
        y: 1061.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 23,
        x: 595.8121951219512,
        y: 1062.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 24,
        x: 640.8121951219512,
        y: 1000.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 25,
        x: 579.8121951219512,
        y: 987.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 26,
        x: 701.8121951219512,
        y: 983.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 27,
        x: 932.6573170731707,
        y: 1014.1597560975611,
        w: 30,
        h: 30
      },
      {
        id: 28,
        x: 869.6573170731706,
        y: 1012.1597560975611,
        w: 30,
        h: 30
      },
      {
        id: 29,
        x: 804.6573170731706,
        y: 1026.159756097561,
        w: 30,
        h: 30
      },
      {
        id: 30,
        x: 176.81219512195116,
        y: 1113.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 31,
        x: 237.81219512195116,
        y: 1078.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 32,
        x: 263.81219512195116,
        y: 1139.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 33,
        x: 243.81219512195116,
        y: 1016.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 34,
        x: 481.81219512195116,
        y: 575.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 35,
        x: 659.8121951219512,
        y: 381.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 36,
        x: 461.81219512195116,
        y: 315.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 37,
        x: 654.8121951219512,
        y: 300.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 38,
        x: 392.81219512195116,
        y: 446.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 39,
        x: 593.8121951219512,
        y: 340.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 40,
        x: 532.8121951219512,
        y: 378.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 41,
        x: 439.81219512195116,
        y: 507.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 42,
        x: 552.8121951219512,
        y: 279.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 43,
        x: 331.81219512195116,
        y: 494.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 44,
        x: 410.81219512195116,
        y: 385.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 45,
        x: 376.81219512195116,
        y: 555.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 46,
        x: 471.81219512195116,
        y: 436.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 47,
        x: -91.3432926829268,
        y: 383.29634146341465,
        w: 30,
        h: 30
      },
      {
        id: 48,
        x: 727.8121951219512,
        y: 412.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 49,
        x: 344.81219512195116,
        y: 348.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 50,
        x: 443.5560975609757,
        y: 124.8878048780488,
        w: 30,
        h: 30
      },
      {
        id: 51,
        x: 83.55609756097562,
        y: 168.88780487804883,
        w: 30,
        h: 30
      },
      {
        id: 52,
        x: 184.55609756097562,
        y: 57.8878048780488,
        w: 30,
        h: 30
      },
      {
        id: 53,
        x: 44.55609756097556,
        y: 94.8878048780488,
        w: 30,
        h: 30
      },
      {
        id: 54,
        x: 313.5560975609756,
        y: 70.8878048780488,
        w: 30,
        h: 30
      },
      {
        id: 55,
        x: 112.55609756097562,
        y: 102.8878048780488,
        w: 30,
        h: 30
      },
      {
        id: 56,
        x: 179.55609756097562,
        y: 142.88780487804883,
        w: 30,
        h: 30
      },
      {
        id: 57,
        x: 374.5560975609756,
        y: 107.8878048780488,
        w: 30,
        h: 30
      },
      {
        id: 58,
        x: 105.55609756097562,
        y: 38.8878048780488,
        w: 30,
        h: 30
      },
      {
        id: 59,
        x: 382.5560975609756,
        y: 37.8878048780488,
        w: 30,
        h: 30
      },
      {
        id: 60,
        x: 252.55609756097562,
        y: 90.8878048780488,
        w: 30,
        h: 30
      },
      {
        id: 61,
        x: 443.5560975609757,
        y: 50.8878048780488,
        w: 30,
        h: 30
      },
      {
        id: 62,
        x: 297.5560975609756,
        y: 161.88780487804883,
        w: 30,
        h: 30
      },
      {
        id: 63,
        x: 309.81219512195116,
        y: 70.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 64,
        x: 14.556097560975559,
        y: 211.88780487804883,
        w: 30,
        h: 30
      },
      {
        id: 65,
        x: 251.55609756097562,
        y: 16.887804878048797,
        w: 30,
        h: 30
      },
      {
        id: 66,
        x: 504.81219512195116,
        y: 700.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 67,
        x: 667.8121951219512,
        y: 907.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 68,
        x: 854.9719512195122,
        y: 486.9310975609755,
        w: 30,
        h: 30
      },
      {
        id: 69,
        x: 941.9719512195123,
        y: 423.9310975609755,
        w: 30,
        h: 30
      },
      {
        id: 70,
        x: 887.3585365853658,
        y: 664.4725609756097,
        w: 30,
        h: 30
      },
      {
        id: 71,
        x: 880.9719512195122,
        y: 425.9310975609755,
        w: 30,
        h: 30
      },
      {
        id: 72,
        x: 951.9719512195123,
        y: 484.9310975609755,
        w: 30,
        h: 30
      },
      {
        id: 73,
        x: 833.9719512195122,
        y: 547.9310975609756,
        w: 30,
        h: 30
      },
      {
        id: 74,
        x: 915.9719512195123,
        y: 545.9310975609756,
        w: 30,
        h: 30
      },
      {
        id: 75,
        x: 869.9719512195122,
        y: 608.9310975609756,
        w: 30,
        h: 30
      },
      {
        id: 76,
        x: 797.8121951219512,
        y: 917.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 77,
        x: 882.6573170731706,
        y: 1075.159756097561,
        w: 30,
        h: 30
      },
      {
        id: 78,
        x: -221.03252032520322,
        y: 678.0040650406509,
        w: 30,
        h: 30
      },
      {
        id: 79,
        x: 976.9719512195123,
        y: 563.9310975609756,
        w: 30,
        h: 30
      },
      {
        id: 80,
        x: 18.696341463414512,
        y: 834.3475609756097,
        w: 30,
        h: 30
      },
      {
        id: 81,
        x: 859.8121951219512,
        y: 817.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 82,
        x: 798.8121951219512,
        y: 840.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 83,
        x: 780.8121951219512,
        y: 774.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 84,
        x: 728.8121951219512,
        y: 713.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 85,
        x: 722.8121951219512,
        y: 650.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 86,
        x: 719.8121951219512,
        y: 778.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 87,
        x: 675.8121951219512,
        y: 839.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 88,
        x: 728.8121951219512,
        y: 922.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 89,
        x: 736.8121951219512,
        y: 860.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 90,
        x: 658.8121951219512,
        y: 760.9609756097561,
        w: 30,
        h: 30
      },
      {
        id: 91,
        x: -29.019512195122047,
        y: 521.1347560975612,
        w: 30,
        h: 30
      },
      {
        id: 92,
        x: -62.17926829268282,
        y: 610.7420731707318,
        w: 30,
        h: 30
      },
      {
        id: 93,
        x: 35.08678861788604,
        y: 617.5674796747969,
        w: 30,
        h: 30
      },
      {
        id: 94,
        x: -364.3414634146342,
        y: 464.9920731707319,
        w: 30,
        h: 30
      },
      {
        id: 95,
        x: -303.3414634146342,
        y: 469.9920731707319,
        w: 30,
        h: 30
      },
      {
        id: 96,
        x: -343.90345528455293,
        y: 519.1211382113822,
        w: 30,
        h: 30
      },
      {
        id: 97,
        x: -431.3653455284551,
        y: 496.4585365853662,
        w: 30,
        h: 30
      },
      {
        id: 98,
        x: 793.5347560975608,
        y: 140.1896341463416,
        w: 30,
        h: 30
      },
      {
        id: 99,
        x: 854.5347560975608,
        y: 145.18963414634158,
        w: 30,
        h: 30
      },
      {
        id: 100,
        x: 813.9727642276421,
        y: 194.31869918699198,
        w: 30,
        h: 30
      },
      {
        id: 101,
        x: 726.5108739837399,
        y: 165.97012195121965,
        w: 30,
        h: 30
      },
      {
        id: 102,
        x: 930.4432418699188,
        y: 622.973780487805,
        w: 30,
        h: 30
      },
      {
        id: 103,
        x: -298.40980691056893,
        y: 582.2621951219512,
        w: 30,
        h: 30
      },
      {
        id: 104,
        x: -104.63175813008121,
        y: 815.6146341463414,
        w: 30,
        h: 30
      },
      {
        id: 105,
        x: -60.963465447154476,
        y: 866.1060975609755,
        w: 30,
        h: 30
      },
      {
        id: 106,
        x: 18.185315040650494,
        y: 721.4548780487805,
        w: 30,
        h: 30
      },
      {
        id: 107,
        x: -136.01834349593486,
        y: 896.1280487804877,
        w: 30,
        h: 30
      },
      {
        id: 108,
        x: -92.35005081300807,
        y: 1012.1219512195123,
        w: 30,
        h: 30
      },
      {
        id: 109,
        x: -65.05736788617878,
        y: 1055.790243902439,
        w: 30,
        h: 30
      },
      {
        id: 110,
        x: -142.84151422764216,
        y: 1083.0829268292682,
        w: 30,
        h: 30
      }
    ],
    edges: [
      {
        source: 1,
        target: 3
      },
      {
        source: 7,
        target: 11
      },
      {
        source: 15,
        target: 4
      },
      {
        source: 15,
        target: 10
      },
      {
        source: 2,
        target: 8
      },
      {
        source: 1,
        target: 14
      },
      {
        source: 5,
        target: 3
      },
      {
        source: 7,
        target: 4
      },
      {
        source: 15,
        target: 2
      },
      {
        source: 8,
        target: 3
      },
      {
        source: 9,
        target: 11
      },
      {
        source: 12,
        target: 4
      },
      {
        source: 8,
        target: 5
      },
      {
        source: 13,
        target: 9
      },
      {
        source: 6,
        target: 2
      },
      {
        source: 13,
        target: 15
      },
      {
        source: 7,
        target: 12
      },
      {
        source: 12,
        target: 10
      },
      {
        source: 2,
        target: 10
      },
      {
        source: 6,
        target: 1
      },
      {
        source: 9,
        target: 4
      },
      {
        source: 7,
        target: 10
      },
      {
        source: 6,
        target: 12
      },
      {
        source: 6,
        target: 5
      },
      {
        source: 7,
        target: 0
      },
      {
        source: 9,
        target: 0
      },
      {
        source: 17,
        target: 18
      },
      {
        source: 18,
        target: 19
      },
      {
        source: 19,
        target: 16
      },
      {
        source: 16,
        target: 17
      },
      {
        source: 18,
        target: 20
      },
      {
        source: 17,
        target: 21
      },
      {
        source: 22,
        target: 23
      },
      {
        source: 22,
        target: 24
      },
      {
        source: 24,
        target: 26
      },
      {
        source: 26,
        target: 25
      },
      {
        source: 25,
        target: 23
      },
      {
        source: 23,
        target: 24
      },
      {
        source: 24,
        target: 25
      },
      {
        source: 22,
        target: 26
      },
      {
        source: 27,
        target: 28
      },
      {
        source: 28,
        target: 29
      },
      {
        source: 29,
        target: 26
      },
      {
        source: 30,
        target: 31
      },
      {
        source: 31,
        target: 32
      },
      {
        source: 31,
        target: 33
      },
      {
        source: 35,
        target: 37
      },
      {
        source: 41,
        target: 45
      },
      {
        source: 49,
        target: 38
      },
      {
        source: 49,
        target: 44
      },
      {
        source: 36,
        target: 42
      },
      {
        source: 35,
        target: 48
      },
      {
        source: 39,
        target: 37
      },
      {
        source: 41,
        target: 38
      },
      {
        source: 49,
        target: 36
      },
      {
        source: 42,
        target: 37
      },
      {
        source: 43,
        target: 45
      },
      {
        source: 46,
        target: 38
      },
      {
        source: 42,
        target: 39
      },
      {
        source: 47,
        target: 43
      },
      {
        source: 40,
        target: 36
      },
      {
        source: 47,
        target: 49
      },
      {
        source: 41,
        target: 46
      },
      {
        source: 46,
        target: 44
      },
      {
        source: 36,
        target: 44
      },
      {
        source: 40,
        target: 35
      },
      {
        source: 43,
        target: 38
      },
      {
        source: 41,
        target: 44
      },
      {
        source: 40,
        target: 46
      },
      {
        source: 40,
        target: 39
      },
      {
        source: 41,
        target: 34
      },
      {
        source: 51,
        target: 53
      },
      {
        source: 57,
        target: 61
      },
      {
        source: 65,
        target: 54
      },
      {
        source: 65,
        target: 60
      },
      {
        source: 52,
        target: 58
      },
      {
        source: 51,
        target: 64
      },
      {
        source: 55,
        target: 53
      },
      {
        source: 57,
        target: 54
      },
      {
        source: 65,
        target: 52
      },
      {
        source: 58,
        target: 53
      },
      {
        source: 59,
        target: 61
      },
      {
        source: 62,
        target: 54
      },
      {
        source: 58,
        target: 55
      },
      {
        source: 63,
        target: 59
      },
      {
        source: 56,
        target: 52
      },
      {
        source: 63,
        target: 65
      },
      {
        source: 57,
        target: 62
      },
      {
        source: 62,
        target: 60
      },
      {
        source: 52,
        target: 60
      },
      {
        source: 56,
        target: 51
      },
      {
        source: 59,
        target: 54
      },
      {
        source: 57,
        target: 60
      },
      {
        source: 56,
        target: 62
      },
      {
        source: 56,
        target: 55
      },
      {
        source: 57,
        target: 50
      },
      {
        source: 59,
        target: 50
      },
      {
        source: 50,
        target: 36
      },
      {
        source: 49,
        target: 62
      },
      {
        source: 33,
        target: 8
      },
      {
        source: 0,
        target: 66
      },
      {
        source: 26,
        target: 67
      },
      {
        source: 73,
        target: 68
      },
      {
        source: 68,
        target: 71
      },
      {
        source: 71,
        target: 69
      },
      {
        source: 72,
        target: 74
      },
      {
        source: 74,
        target: 75
      },
      {
        source: 75,
        target: 70
      },
      {
        source: 74,
        target: 68
      },
      {
        source: 72,
        target: 69
      },
      {
        source: 75,
        target: 73
      },
      {
        source: 28,
        target: 76
      },
      {
        source: 28,
        target: 77
      },
      {
        source: 21,
        target: 78
      },
      {
        source: 72,
        target: 79
      },
      {
        source: 74,
        target: 79
      },
      {
        source: 80,
        target: 14
      },
      {
        source: 85,
        target: 84
      },
      {
        source: 84,
        target: 83
      },
      {
        source: 81,
        target: 82
      },
      {
        source: 82,
        target: 83
      },
      {
        source: 83,
        target: 86
      },
      {
        source: 86,
        target: 87
      },
      {
        source: 87,
        target: 67
      },
      {
        source: 67,
        target: 88
      },
      {
        source: 26,
        target: 88
      },
      {
        source: 87,
        target: 89
      },
      {
        source: 89,
        target: 88
      },
      {
        source: 89,
        target: 82
      },
      {
        source: 87,
        target: 90
      },
      {
        source: 86,
        target: 90
      },
      {
        source: 90,
        target: 84
      },
      {
        source: 76,
        target: 88
      },
      {
        source: 76,
        target: 82
      },
      {
        source: 91,
        target: 92
      },
      {
        source: 92,
        target: 93
      },
      {
        source: 94,
        target: 95
      },
      {
        source: 95,
        target: 96
      },
      {
        source: 97,
        target: 94
      },
      {
        source: 98,
        target: 99
      },
      {
        source: 99,
        target: 100
      },
      {
        source: 101,
        target: 98
      },
      {
        source: 101,
        target: 100
      },
      {
        source: 98,
        target: 100
      },
      {
        source: 95,
        target: 20
      },
      {
        source: 16,
        target: 91
      },
      {
        source: 93,
        target: 6
      },
      {
        source: 66,
        target: 90
      },
      {
        source: 70,
        target: 84
      },
      {
        source: 101,
        target: 37
      },
      {
        source: 19,
        target: 47
      },
      {
        source: 18,
        target: 103
      },
      {
        source: 103,
        target: 78
      },
      {
        source: 103,
        target: 96
      },
      {
        source: 93,
        target: 91
      },
      {
        source: 91,
        target: 47
      },
      {
        source: 14,
        target: 104
      },
      {
        source: 104,
        target: 105
      },
      {
        source: 106,
        target: 14
      },
      {
        source: 104,
        target: 107
      },
      {
        source: 107,
        target: 105
      },
      {
        source: 70,
        target: 102
      },
      {
        source: 75,
        target: 102
      },
      {
        source: 108,
        target: 110
      },
      {
        source: 110,
        target: 109
      },
      {
        source: 109,
        target: 108
      },
      {
        source: 108,
        target: 107
      }
    ]
  }

  const kMeans = {
    nodes: [
      {
        id: 0,
        x: 451,
        y: 642,
        w: 30,
        h: 30
      },
      {
        id: 1,
        x: 183,
        y: 772,
        w: 30,
        h: 30
      },
      {
        id: 2,
        x: 315,
        y: 821,
        w: 30,
        h: 30
      },
      {
        id: 3,
        x: 189,
        y: 835,
        w: 30,
        h: 30
      },
      {
        id: 4,
        x: 389,
        y: 750,
        w: 30,
        h: 30
      },
      {
        id: 5,
        x: 250,
        y: 814,
        w: 30,
        h: 30
      },
      {
        id: 6,
        x: 255,
        y: 753,
        w: 30,
        h: 30
      },
      {
        id: 7,
        x: 377,
        y: 689,
        w: 30,
        h: 30
      },
      {
        id: 8,
        x: 260,
        y: 882,
        w: 30,
        h: 30
      },
      {
        id: 9,
        x: 450,
        y: 706,
        w: 30,
        h: 30
      },
      {
        id: 10,
        x: 328,
        y: 753,
        w: 30,
        h: 30
      },
      {
        id: 11,
        x: 390,
        y: 628,
        w: 30,
        h: 30
      },
      {
        id: 12,
        x: 316,
        y: 692,
        w: 30,
        h: 30
      },
      {
        id: 13,
        x: 453,
        y: 769,
        w: 30,
        h: 30
      },
      {
        id: 14,
        x: 122,
        y: 751,
        w: 30,
        h: 30
      },
      {
        id: 15,
        x: 380,
        y: 814,
        w: 30,
        h: 30
      },
      {
        id: 16,
        x: 120.03760162601628,
        y: 575.1077235772361,
        w: 30,
        h: 30
      },
      {
        id: 17,
        x: 59.03760162601628,
        y: 526.1077235772357,
        w: 30,
        h: 30
      },
      {
        id: 18,
        x: 99.03760162601628,
        y: 453.1077235772357,
        w: 30,
        h: 30
      },
      {
        id: 19,
        x: 147.03760162601628,
        y: 514.1077235772357,
        w: 30,
        h: 30
      },
      {
        id: 20,
        x: 160.03760162601628,
        y: 423.1077235772357,
        w: 30,
        h: 30
      },
      {
        id: 21,
        x: 72.03760162601628,
        y: 392.1077235772357,
        w: 30,
        h: 30
      },
      {
        id: 22,
        x: -1.962398373983703,
        y: 547.1077235772361,
        w: 30,
        h: 30
      },
      {
        id: 23,
        x: 665,
        y: 991,
        w: 30,
        h: 30
      },
      {
        id: 24,
        x: 604,
        y: 992,
        w: 30,
        h: 30
      },
      {
        id: 25,
        x: 649,
        y: 930,
        w: 30,
        h: 30
      },
      {
        id: 26,
        x: 588,
        y: 876.060975609756,
        w: 30,
        h: 30
      },
      {
        id: 27,
        x: 710,
        y: 913,
        w: 30,
        h: 30
      },
      {
        id: 28,
        x: 904,
        y: 920,
        w: 30,
        h: 30
      },
      {
        id: 29,
        x: 841,
        y: 918,
        w: 30,
        h: 30
      },
      {
        id: 30,
        x: 776,
        y: 932,
        w: 30,
        h: 30
      },
      {
        id: 31,
        x: 185,
        y: 1043,
        w: 30,
        h: 30
      },
      {
        id: 32,
        x: 246,
        y: 1008,
        w: 30,
        h: 30
      },
      {
        id: 33,
        x: 272,
        y: 1069,
        w: 30,
        h: 30
      },
      {
        id: 34,
        x: 252,
        y: 946,
        w: 30,
        h: 30
      },
      {
        id: 35,
        x: 490,
        y: 505,
        w: 30,
        h: 30
      },
      {
        id: 36,
        x: 668,
        y: 311,
        w: 30,
        h: 30
      },
      {
        id: 37,
        x: 470,
        y: 245,
        w: 30,
        h: 30
      },
      {
        id: 38,
        x: 663,
        y: 230,
        w: 30,
        h: 30
      },
      {
        id: 39,
        x: 401,
        y: 376,
        w: 30,
        h: 30
      },
      {
        id: 40,
        x: 602,
        y: 270,
        w: 30,
        h: 30
      },
      {
        id: 41,
        x: 541,
        y: 308,
        w: 30,
        h: 30
      },
      {
        id: 42,
        x: 448,
        y: 437,
        w: 30,
        h: 30
      },
      {
        id: 43,
        x: 561,
        y: 209,
        w: 30,
        h: 30
      },
      {
        id: 44,
        x: 340,
        y: 424,
        w: 30,
        h: 30
      },
      {
        id: 45,
        x: 419,
        y: 315,
        w: 30,
        h: 30
      },
      {
        id: 46,
        x: 385,
        y: 485,
        w: 30,
        h: 30
      },
      {
        id: 47,
        x: 480,
        y: 366,
        w: 30,
        h: 30
      },
      {
        id: 48,
        x: 316,
        y: 351,
        w: 30,
        h: 30
      },
      {
        id: 49,
        x: 736,
        y: 342,
        w: 30,
        h: 30
      },
      {
        id: 50,
        x: 353,
        y: 278,
        w: 30,
        h: 30
      },
      {
        id: 51,
        x: 429,
        y: 154,
        w: 30,
        h: 30
      },
      {
        id: 52,
        x: 69,
        y: 198,
        w: 30,
        h: 30
      },
      {
        id: 53,
        x: 170,
        y: 87,
        w: 30,
        h: 30
      },
      {
        id: 54,
        x: 30,
        y: 124,
        w: 30,
        h: 30
      },
      {
        id: 55,
        x: 299,
        y: 100,
        w: 30,
        h: 30
      },
      {
        id: 56,
        x: 98,
        y: 132,
        w: 30,
        h: 30
      },
      {
        id: 57,
        x: 165,
        y: 172,
        w: 30,
        h: 30
      },
      {
        id: 58,
        x: 360,
        y: 137,
        w: 30,
        h: 30
      },
      {
        id: 59,
        x: 91,
        y: 68,
        w: 30,
        h: 30
      },
      {
        id: 60,
        x: 368,
        y: 67,
        w: 30,
        h: 30
      },
      {
        id: 61,
        x: 238,
        y: 120,
        w: 30,
        h: 30
      },
      {
        id: 62,
        x: 429,
        y: 80,
        w: 30,
        h: 30
      },
      {
        id: 63,
        x: 283,
        y: 191,
        w: 30,
        h: 30
      },
      {
        id: 64,
        x: 318,
        y: 0,
        w: 30,
        h: 30
      },
      {
        id: 65,
        x: 0,
        y: 241,
        w: 30,
        h: 30
      },
      {
        id: 66,
        x: 237,
        y: 46,
        w: 30,
        h: 30
      },
      {
        id: 67,
        x: 513,
        y: 630,
        w: 30,
        h: 30
      },
      {
        id: 68,
        x: 452,
        y: 580,
        w: 30,
        h: 30
      },
      {
        id: 69,
        x: 676,
        y: 837,
        w: 30,
        h: 30
      },
      {
        id: 70,
        x: 816.7621951219512,
        y: 440.5335365853657,
        w: 30,
        h: 30
      },
      {
        id: 71,
        x: 903.7621951219514,
        y: 377.5335365853657,
        w: 30,
        h: 30
      },
      {
        id: 72,
        x: 817.7621951219512,
        y: 623.5335365853657,
        w: 30,
        h: 30
      },
      {
        id: 73,
        x: 842.7621951219512,
        y: 379.5335365853657,
        w: 30,
        h: 30
      },
      {
        id: 74,
        x: 913.7621951219514,
        y: 438.5335365853657,
        w: 30,
        h: 30
      },
      {
        id: 75,
        x: 795.7621951219512,
        y: 501.5335365853657,
        w: 30,
        h: 30
      },
      {
        id: 76,
        x: 877.7621951219512,
        y: 499.5335365853657,
        w: 30,
        h: 30
      },
      {
        id: 77,
        x: 831.7621951219512,
        y: 562.5335365853657,
        w: 30,
        h: 30
      },
      {
        id: 78,
        x: 806,
        y: 847,
        w: 30,
        h: 30
      },
      {
        id: 79,
        x: 854,
        y: 981,
        w: 30,
        h: 30
      },
      {
        id: 80,
        x: -62.9623983739837,
        y: 571.1077235772361,
        w: 30,
        h: 30
      },
      {
        id: 81,
        x: 938.7621951219514,
        y: 517.5335365853657,
        w: 30,
        h: 30
      },
      {
        id: 82,
        x: 0,
        y: 715,
        w: 30,
        h: 30
      },
      {
        id: 83,
        x: 61,
        y: 732,
        w: 30,
        h: 30
      },
      {
        id: 84,
        x: 868,
        y: 747,
        w: 30,
        h: 30
      },
      {
        id: 85,
        x: 807,
        y: 770,
        w: 30,
        h: 30
      },
      {
        id: 86,
        x: 789,
        y: 704,
        w: 30,
        h: 30
      },
      {
        id: 87,
        x: 737,
        y: 643,
        w: 30,
        h: 30
      },
      {
        id: 88,
        x: 731,
        y: 580,
        w: 30,
        h: 30
      },
      {
        id: 89,
        x: 728,
        y: 708,
        w: 30,
        h: 30
      },
      {
        id: 90,
        x: 684,
        y: 769,
        w: 30,
        h: 30
      },
      {
        id: 91,
        x: 737,
        y: 852,
        w: 30,
        h: 30
      },
      {
        id: 92,
        x: 745,
        y: 790,
        w: 30,
        h: 30
      },
      {
        id: 93,
        x: 667,
        y: 690,
        w: 30,
        h: 30
      },
      {
        id: 94,
        x: 302.81402439024396,
        y: 599.146341463415,
        w: 30,
        h: 30
      },
      {
        id: 95,
        x: 258.05487804878055,
        y: 632.5762195121954,
        w: 30,
        h: 30
      },
      {
        id: 96,
        x: 217.4928861788618,
        y: 681.7052845528458,
        w: 30,
        h: 30
      },
      {
        id: 97,
        x: -44.78963414634154,
        y: 409.4969512195123,
        w: 30,
        h: 30
      },
      {
        id: 98,
        x: 16.21036585365846,
        y: 414.4969512195123,
        w: 30,
        h: 30
      },
      {
        id: 99,
        x: -24.351626016260298,
        y: 463.6260162601627,
        w: 30,
        h: 30
      },
      {
        id: 100,
        x: -111.81351626016254,
        y: 440.9634146341466,
        w: 30,
        h: 30
      },
      {
        id: 101,
        x: 566.0957317073171,
        y: 78.78109756097578,
        w: 30,
        h: 30
      },
      {
        id: 102,
        x: 622.7743902439024,
        y: 93.56097560975621,
        w: 30,
        h: 30
      },
      {
        id: 103,
        x: 597.4508130081301,
        y: 146.55650406504083,
        w: 30,
        h: 30
      },
      {
        id: 104,
        x: 541.3755081300815,
        y: 127.98780487804893,
        w: 30,
        h: 30
      },
      {
        id: 105,
        x: 99.83838169978924,
        y: 852.6113821138208,
        w: 30,
        h: 30
      }
    ],
    edges: [
      {
        source: 1,
        target: 3
      },
      {
        source: 7,
        target: 11
      },
      {
        source: 15,
        target: 4
      },
      {
        source: 15,
        target: 10
      },
      {
        source: 2,
        target: 8
      },
      {
        source: 1,
        target: 14
      },
      {
        source: 5,
        target: 3
      },
      {
        source: 7,
        target: 4
      },
      {
        source: 15,
        target: 2
      },
      {
        source: 8,
        target: 3
      },
      {
        source: 9,
        target: 11
      },
      {
        source: 12,
        target: 4
      },
      {
        source: 8,
        target: 5
      },
      {
        source: 13,
        target: 9
      },
      {
        source: 6,
        target: 2
      },
      {
        source: 13,
        target: 15
      },
      {
        source: 7,
        target: 12
      },
      {
        source: 12,
        target: 10
      },
      {
        source: 2,
        target: 10
      },
      {
        source: 6,
        target: 1
      },
      {
        source: 9,
        target: 4
      },
      {
        source: 7,
        target: 10
      },
      {
        source: 6,
        target: 12
      },
      {
        source: 6,
        target: 5
      },
      {
        source: 7,
        target: 0
      },
      {
        source: 9,
        target: 0
      },
      {
        source: 17,
        target: 18
      },
      {
        source: 18,
        target: 19
      },
      {
        source: 19,
        target: 16
      },
      {
        source: 16,
        target: 17
      },
      {
        source: 18,
        target: 20
      },
      {
        source: 18,
        target: 21
      },
      {
        source: 17,
        target: 22
      },
      {
        source: 23,
        target: 24
      },
      {
        source: 23,
        target: 25
      },
      {
        source: 25,
        target: 27
      },
      {
        source: 27,
        target: 26
      },
      {
        source: 26,
        target: 24
      },
      {
        source: 24,
        target: 25
      },
      {
        source: 25,
        target: 26
      },
      {
        source: 23,
        target: 27
      },
      {
        source: 28,
        target: 29
      },
      {
        source: 29,
        target: 30
      },
      {
        source: 30,
        target: 27
      },
      {
        source: 31,
        target: 32
      },
      {
        source: 32,
        target: 33
      },
      {
        source: 32,
        target: 34
      },
      {
        source: 36,
        target: 38
      },
      {
        source: 42,
        target: 46
      },
      {
        source: 50,
        target: 39
      },
      {
        source: 50,
        target: 45
      },
      {
        source: 37,
        target: 43
      },
      {
        source: 36,
        target: 49
      },
      {
        source: 40,
        target: 38
      },
      {
        source: 42,
        target: 39
      },
      {
        source: 50,
        target: 37
      },
      {
        source: 43,
        target: 38
      },
      {
        source: 44,
        target: 46
      },
      {
        source: 47,
        target: 39
      },
      {
        source: 43,
        target: 40
      },
      {
        source: 48,
        target: 44
      },
      {
        source: 41,
        target: 37
      },
      {
        source: 48,
        target: 50
      },
      {
        source: 42,
        target: 47
      },
      {
        source: 47,
        target: 45
      },
      {
        source: 37,
        target: 45
      },
      {
        source: 41,
        target: 36
      },
      {
        source: 44,
        target: 39
      },
      {
        source: 42,
        target: 45
      },
      {
        source: 41,
        target: 47
      },
      {
        source: 41,
        target: 40
      },
      {
        source: 42,
        target: 35
      },
      {
        source: 52,
        target: 54
      },
      {
        source: 58,
        target: 62
      },
      {
        source: 66,
        target: 55
      },
      {
        source: 66,
        target: 61
      },
      {
        source: 53,
        target: 59
      },
      {
        source: 52,
        target: 65
      },
      {
        source: 56,
        target: 54
      },
      {
        source: 58,
        target: 55
      },
      {
        source: 66,
        target: 53
      },
      {
        source: 59,
        target: 54
      },
      {
        source: 60,
        target: 62
      },
      {
        source: 63,
        target: 55
      },
      {
        source: 59,
        target: 56
      },
      {
        source: 64,
        target: 60
      },
      {
        source: 57,
        target: 53
      },
      {
        source: 64,
        target: 66
      },
      {
        source: 58,
        target: 63
      },
      {
        source: 63,
        target: 61
      },
      {
        source: 53,
        target: 61
      },
      {
        source: 57,
        target: 52
      },
      {
        source: 60,
        target: 55
      },
      {
        source: 58,
        target: 61
      },
      {
        source: 57,
        target: 63
      },
      {
        source: 57,
        target: 56
      },
      {
        source: 58,
        target: 51
      },
      {
        source: 60,
        target: 51
      },
      {
        source: 51,
        target: 37
      },
      {
        source: 50,
        target: 63
      },
      {
        source: 34,
        target: 8
      },
      {
        source: 0,
        target: 67
      },
      {
        source: 0,
        target: 68
      },
      {
        source: 27,
        target: 69
      },
      {
        source: 75,
        target: 70
      },
      {
        source: 70,
        target: 73
      },
      {
        source: 73,
        target: 71
      },
      {
        source: 74,
        target: 76
      },
      {
        source: 76,
        target: 77
      },
      {
        source: 77,
        target: 72
      },
      {
        source: 76,
        target: 70
      },
      {
        source: 74,
        target: 71
      },
      {
        source: 77,
        target: 75
      },
      {
        source: 29,
        target: 78
      },
      {
        source: 29,
        target: 79
      },
      {
        source: 22,
        target: 80
      },
      {
        source: 74,
        target: 81
      },
      {
        source: 76,
        target: 81
      },
      {
        source: 82,
        target: 83
      },
      {
        source: 83,
        target: 14
      },
      {
        source: 88,
        target: 87
      },
      {
        source: 87,
        target: 86
      },
      {
        source: 84,
        target: 85
      },
      {
        source: 85,
        target: 86
      },
      {
        source: 86,
        target: 89
      },
      {
        source: 89,
        target: 90
      },
      {
        source: 90,
        target: 69
      },
      {
        source: 69,
        target: 91
      },
      {
        source: 27,
        target: 91
      },
      {
        source: 90,
        target: 92
      },
      {
        source: 92,
        target: 91
      },
      {
        source: 92,
        target: 85
      },
      {
        source: 90,
        target: 93
      },
      {
        source: 89,
        target: 93
      },
      {
        source: 93,
        target: 87
      },
      {
        source: 78,
        target: 91
      },
      {
        source: 78,
        target: 85
      },
      {
        source: 94,
        target: 95
      },
      {
        source: 95,
        target: 96
      },
      {
        source: 97,
        target: 98
      },
      {
        source: 98,
        target: 99
      },
      {
        source: 100,
        target: 97
      },
      {
        source: 101,
        target: 102
      },
      {
        source: 102,
        target: 103
      },
      {
        source: 104,
        target: 101
      },
      {
        source: 104,
        target: 103
      },
      {
        source: 101,
        target: 103
      }
    ]
  }

  const Hierarchical = {
    nodes: [
      {
        id: 0,
        x: -296,
        y: -105,
        w: 30,
        h: 30
      },
      {
        id: 1,
        x: -555,
        y: -420,
        w: 30,
        h: 30
      },
      {
        id: 2,
        x: -143.75,
        y: -270.875,
        w: 30,
        h: 30
      },
      {
        id: 3,
        x: -65.5625,
        y: -186.875,
        w: 30,
        h: 30
      },
      {
        id: 4,
        x: 80.90625,
        y: -236.875,
        w: 30,
        h: 30
      },
      {
        id: 5,
        x: 127.140625,
        y: -148.875,
        w: 30,
        h: 30
      },
      {
        id: 6,
        x: -35.7421875,
        y: -9.875,
        w: 30,
        h: 30
      },
      {
        id: 7,
        x: -350.9296875,
        y: -292.9375,
        w: 30,
        h: 30
      },
      {
        id: 8,
        x: -228.9296875,
        y: -159.9375,
        w: 30,
        h: 30
      },
      {
        id: 9,
        x: -515.9296875,
        y: -186.9375,
        w: 30,
        h: 30
      },
      {
        id: 10,
        x: -654.9296875,
        y: -179.9375,
        w: 30,
        h: 30
      },
      {
        id: 11,
        x: -768.89453125,
        y: -277.9375,
        w: 30,
        h: 30
      },
      {
        id: 12,
        x: -812.876953125,
        y: -364.9375,
        w: 30,
        h: 30
      },
      {
        id: 13,
        x: -89.8681640625,
        y: -407.9375,
        w: 30,
        h: 30
      },
      {
        id: 14,
        x: 132.1318359375,
        y: -38.9375,
        w: 30,
        h: 30
      },
      {
        id: 15,
        x: -509.37255859375,
        y: -14.9375,
        w: 30,
        h: 30
      },
      {
        id: 16,
        x: -788.37255859375,
        y: -47.9375,
        w: 30,
        h: 30
      },
      {
        id: 17,
        x: -900.37255859375,
        y: -146.9375,
        w: 30,
        h: 30
      }
    ],
    edges: [
      {
        source: 3,
        target: 4
      },
      {
        source: 4,
        target: 5
      },
      {
        source: 5,
        target: 6
      },
      {
        source: 6,
        target: 0
      },
      {
        source: 3,
        target: 6
      },
      {
        source: 2,
        target: 3
      },
      {
        source: 1,
        target: 0
      },
      {
        source: 17,
        target: 11
      },
      {
        source: 11,
        target: 12
      },
      {
        source: 12,
        target: 1
      },
      {
        source: 1,
        target: 10
      },
      {
        source: 10,
        target: 9
      },
      {
        source: 9,
        target: 15
      },
      {
        source: 15,
        target: 16
      },
      {
        source: 17,
        target: 10
      },
      {
        source: 7,
        target: 9
      },
      {
        source: 7,
        target: 1
      },
      {
        source: 2,
        target: 8
      },
      {
        source: 8,
        target: 0
      },
      {
        source: 7,
        target: 13
      },
      {
        source: 13,
        target: 2
      },
      {
        source: 13,
        target: 4
      },
      {
        source: 5,
        target: 14
      },
      {
        source: 6,
        target: 14
      },
      {
        source: 6,
        target: 15
      },
      {
        source: 10,
        target: 15
      },
      {
        source: 1,
        target: 13
      },
      {
        source: 1,
        target: 9
      },
      {
        source: 7,
        target: 8
      },
      {
        source: 11,
        target: 10
      },
      {
        source: 12,
        target: 17
      },
      {
        source: 17,
        target: 16
      },
      {
        source: 11,
        target: 1
      },
      {
        source: 7,
        target: 2
      }
    ]
  }

  const BiconnectedComponents = {
    nodes: [
      {
        id: 0,
        x: 25.8829268292684,
        y: 562.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 1,
        x: 239.8829268292684,
        y: 360.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 2,
        x: 89.8829268292684,
        y: 345.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 3,
        x: 230.8829268292684,
        y: 287.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 4,
        x: 3.882926829268399,
        y: 440.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 5,
        x: 169.8829268292684,
        y: 332.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 6,
        x: 158.8829268292684,
        y: 394.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 7,
        x: 43.8829268292684,
        y: 501.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 8,
        x: 144.8829268292684,
        y: 271.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 9,
        x: -57.1170731707316,
        y: 485.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 10,
        x: 64.8829268292684,
        y: 414.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 11,
        x: -35.1170731707316,
        y: 546.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 12,
        x: 125.8829268292684,
        y: 457.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 13,
        x: -68.1170731707316,
        y: 415.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 14,
        x: -3.117073170731601,
        y: 374.7736585365853,
        w: 30,
        h: 30
      },
      {
        id: 15,
        x: 980,
        y: 234,
        w: 30,
        h: 30
      },
      {
        id: 16,
        x: 970,
        y: 295,
        w: 30,
        h: 30
      },
      {
        id: 17,
        x: 776.1916593108789,
        y: 164.04432520325207,
        w: 30,
        h: 30
      },
      {
        id: 18,
        x: 828.5397677119626,
        y: 191.34810840108406,
        w: 30,
        h: 30
      },
      {
        id: 19,
        x: 822,
        y: 139,
        w: 30,
        h: 30
      },
      {
        id: 20,
        x: 965.7561706026588,
        y: 386.41723835333596,
        w: 30,
        h: 30
      },
      {
        id: 21,
        x: 187.5961646664084,
        y: 170.33106981546007,
        w: 30,
        h: 30
      },
      {
        id: 22,
        x: 190.5961646664084,
        y: 48.33106981546007,
        w: 30,
        h: 30
      },
      {
        id: 23,
        x: 166.5961646664084,
        y: 109.33106981546007,
        w: 30,
        h: 30
      },
      {
        id: 24,
        x: 524,
        y: 442,
        w: 30,
        h: 30
      },
      {
        id: 25,
        x: 418,
        y: 547,
        w: 30,
        h: 30
      },
      {
        id: 26,
        x: 463,
        y: 425,
        w: 30,
        h: 30
      },
      {
        id: 27,
        x: 295,
        y: 573,
        w: 30,
        h: 30
      },
      {
        id: 28,
        x: 402,
        y: 420,
        w: 30,
        h: 30
      },
      {
        id: 29,
        x: 459,
        y: 486,
        w: 30,
        h: 30
      },
      {
        id: 30,
        x: 296,
        y: 512,
        w: 30,
        h: 30
      },
      {
        id: 31,
        x: 398,
        y: 481,
        w: 30,
        h: 30
      },
      {
        id: 32,
        x: 234,
        y: 555,
        w: 30,
        h: 30
      },
      {
        id: 33,
        x: 356,
        y: 603,
        w: 30,
        h: 30
      },
      {
        id: 34,
        x: 235,
        y: 494,
        w: 30,
        h: 30
      },
      {
        id: 35,
        x: 357,
        y: 542,
        w: 30,
        h: 30
      },
      {
        id: 36,
        x: 232,
        y: 616,
        w: 30,
        h: 30
      },
      {
        id: 37,
        x: 585,
        y: 396,
        w: 30,
        h: 30
      },
      {
        id: 38,
        x: 293,
        y: 648,
        w: 30,
        h: 30
      },
      {
        id: 39,
        x: 355,
        y: 857,
        w: 30,
        h: 30
      },
      {
        id: 40,
        x: 61,
        y: 736,
        w: 30,
        h: 30
      },
      {
        id: 41,
        x: 140,
        y: 821,
        w: 30,
        h: 30
      },
      {
        id: 42,
        x: 18,
        y: 797,
        w: 30,
        h: 30
      },
      {
        id: 43,
        x: 262,
        y: 798,
        w: 30,
        h: 30
      },
      {
        id: 44,
        x: 79,
        y: 797,
        w: 30,
        h: 30
      },
      {
        id: 45,
        x: 140,
        y: 759,
        w: 30,
        h: 30
      },
      {
        id: 46,
        x: 323,
        y: 786,
        w: 30,
        h: 30
      },
      {
        id: 47,
        x: 70,
        y: 858,
        w: 30,
        h: 30
      },
      {
        id: 48,
        x: 294,
        y: 865,
        w: 30,
        h: 30
      },
      {
        id: 49,
        x: 201,
        y: 791,
        w: 30,
        h: 30
      },
      {
        id: 50,
        x: 384,
        y: 796,
        w: 30,
        h: 30
      },
      {
        id: 51,
        x: 232,
        y: 730,
        w: 30,
        h: 30
      },
      {
        id: 52,
        x: 233,
        y: 920,
        w: 30,
        h: 30
      },
      {
        id: 53,
        x: -25,
        y: 697,
        w: 30,
        h: 30
      },
      {
        id: 54,
        x: 229,
        y: 859,
        w: 30,
        h: 30
      },
      {
        id: 55,
        x: 707,
        y: 426,
        w: 30,
        h: 30
      },
      {
        id: 56,
        x: 691,
        y: 497,
        w: 30,
        h: 30
      },
      {
        id: 57,
        x: 656,
        y: 329,
        w: 30,
        h: 30
      },
      {
        id: 58,
        x: 646,
        y: 436,
        w: 30,
        h: 30
      },
      {
        id: 59,
        x: 752,
        y: 499,
        w: 30,
        h: 30
      },
      {
        id: 60,
        x: 780,
        y: 377,
        w: 30,
        h: 30
      },
      {
        id: 61,
        x: 768,
        y: 438,
        w: 30,
        h: 30
      },
      {
        id: 62,
        x: 717,
        y: 365,
        w: 30,
        h: 30
      },
      {
        id: 63,
        x: 251.5961646664084,
        y: 79.33106981546007,
        w: 30,
        h: 30
      },
      {
        id: 64,
        x: 921.9008829526394,
        y: 357.7327582913923,
        w: 30,
        h: 30
      },
      {
        id: 65,
        x: 829,
        y: 478,
        w: 30,
        h: 30
      },
      {
        id: 66,
        x: 312.5961646664084,
        y: 81.33106981546007,
        w: 30,
        h: 30
      },
      {
        id: 67,
        x: 377.5961646664084,
        y: 55.33106981546007,
        w: 30,
        h: 30
      },
      {
        id: 68,
        x: 439.5961646664084,
        y: 85.33106981546007,
        w: 30,
        h: 30
      },
      {
        id: 69,
        x: 374.5961646664084,
        y: 116.33106981546007,
        w: 30,
        h: 30
      },
      {
        id: 70,
        x: 370.5961646664084,
        y: 177.33106981546007,
        w: 30,
        h: 30
      },
      {
        id: 71,
        x: 248.5961646664084,
        y: 140.33106981546007,
        w: 30,
        h: 30
      },
      {
        id: 72,
        x: 309.5961646664084,
        y: 142.33106981546007,
        w: 30,
        h: 30
      },
      {
        id: 73,
        x: 435.5961646664084,
        y: 146.33106981546007,
        w: 30,
        h: 30
      },
      {
        id: 74,
        x: 951.1916593108787,
        y: 59.41590708478512,
        w: 30,
        h: 30
      },
      {
        id: 75,
        x: 885.7640154858692,
        y: 158.31551993805653,
        w: 30,
        h: 30
      },
      {
        id: 76,
        x: 975.1916593108787,
        y: 120.41590708478512,
        w: 30,
        h: 30
      },
      {
        id: 77,
        x: 1012.1916593108787,
        y: 56.41590708478512,
        w: 30,
        h: 30
      },
      {
        id: 78,
        x: 471.3546999612854,
        y: 239.08547296425354,
        w: 30,
        h: 30
      },
      {
        id: 79,
        x: 532.3546999612854,
        y: 211.08547296425354,
        w: 30,
        h: 30
      },
      {
        id: 80,
        x: 539.3546999612854,
        y: 272.08547296425354,
        w: 30,
        h: 30
      },
      {
        id: 81,
        x: 478.3546999612854,
        y: 300.08547296425354,
        w: 30,
        h: 30
      },
      {
        id: 82,
        x: 897.9804183765648,
        y: 415.6441078848884,
        w: 30,
        h: 30
      },
      {
        id: 83,
        x: 507.0952419667053,
        y: 600.7713250742031,
        w: 30,
        h: 30
      },
      {
        id: 84,
        x: 568.0952419667053,
        y: 572.7713250742031,
        w: 30,
        h: 30
      },
      {
        id: 85,
        x: 575.0952419667053,
        y: 633.7713250742031,
        w: 30,
        h: 30
      },
      {
        id: 86,
        x: 514.0952419667053,
        y: 661.7713250742031,
        w: 30,
        h: 30
      },
      {
        id: 87,
        x: -70.0585365853658,
        y: 716.16553490773,
        w: 30,
        h: 30
      },
      {
        id: 88,
        x: -68.0585365853658,
        y: 660.16553490773,
        w: 30,
        h: 30
      }
    ],
    edges: [
      {
        source: 1,
        target: 3
      },
      {
        source: 7,
        target: 11
      },
      {
        source: 14,
        target: 4
      },
      {
        source: 14,
        target: 10
      },
      {
        source: 2,
        target: 8
      },
      {
        source: 5,
        target: 3
      },
      {
        source: 7,
        target: 4
      },
      {
        source: 14,
        target: 2
      },
      {
        source: 8,
        target: 3
      },
      {
        source: 9,
        target: 11
      },
      {
        source: 12,
        target: 4
      },
      {
        source: 8,
        target: 5
      },
      {
        source: 13,
        target: 9
      },
      {
        source: 6,
        target: 2
      },
      {
        source: 13,
        target: 14
      },
      {
        source: 7,
        target: 12
      },
      {
        source: 12,
        target: 10
      },
      {
        source: 2,
        target: 10
      },
      {
        source: 6,
        target: 1
      },
      {
        source: 9,
        target: 4
      },
      {
        source: 7,
        target: 10
      },
      {
        source: 6,
        target: 12
      },
      {
        source: 6,
        target: 5
      },
      {
        source: 7,
        target: 0
      },
      {
        source: 9,
        target: 0
      },
      {
        source: 15,
        target: 16
      },
      {
        source: 17,
        target: 18
      },
      {
        source: 17,
        target: 19
      },
      {
        source: 16,
        target: 20
      },
      {
        source: 22,
        target: 23
      },
      {
        source: 23,
        target: 21
      },
      {
        source: 24,
        target: 26
      },
      {
        source: 30,
        target: 34
      },
      {
        source: 38,
        target: 27
      },
      {
        source: 38,
        target: 33
      },
      {
        source: 25,
        target: 31
      },
      {
        source: 28,
        target: 26
      },
      {
        source: 30,
        target: 27
      },
      {
        source: 31,
        target: 26
      },
      {
        source: 32,
        target: 34
      },
      {
        source: 35,
        target: 27
      },
      {
        source: 31,
        target: 28
      },
      {
        source: 36,
        target: 32
      },
      {
        source: 29,
        target: 25
      },
      {
        source: 36,
        target: 38
      },
      {
        source: 30,
        target: 35
      },
      {
        source: 35,
        target: 33
      },
      {
        source: 25,
        target: 33
      },
      {
        source: 29,
        target: 24
      },
      {
        source: 32,
        target: 27
      },
      {
        source: 29,
        target: 35
      },
      {
        source: 29,
        target: 28
      },
      {
        source: 40,
        target: 42
      },
      {
        source: 46,
        target: 50
      },
      {
        source: 54,
        target: 43
      },
      {
        source: 54,
        target: 49
      },
      {
        source: 41,
        target: 47
      },
      {
        source: 40,
        target: 53
      },
      {
        source: 44,
        target: 42
      },
      {
        source: 46,
        target: 43
      },
      {
        source: 54,
        target: 41
      },
      {
        source: 47,
        target: 42
      },
      {
        source: 48,
        target: 50
      },
      {
        source: 51,
        target: 43
      },
      {
        source: 47,
        target: 44
      },
      {
        source: 52,
        target: 48
      },
      {
        source: 45,
        target: 41
      },
      {
        source: 52,
        target: 54
      },
      {
        source: 46,
        target: 51
      },
      {
        source: 51,
        target: 49
      },
      {
        source: 41,
        target: 49
      },
      {
        source: 45,
        target: 40
      },
      {
        source: 48,
        target: 43
      },
      {
        source: 46,
        target: 49
      },
      {
        source: 45,
        target: 51
      },
      {
        source: 45,
        target: 44
      },
      {
        source: 46,
        target: 39
      },
      {
        source: 48,
        target: 39
      },
      {
        source: 38,
        target: 51
      },
      {
        source: 60,
        target: 55
      },
      {
        source: 55,
        target: 58
      },
      {
        source: 58,
        target: 56
      },
      {
        source: 59,
        target: 61
      },
      {
        source: 61,
        target: 62
      },
      {
        source: 62,
        target: 57
      },
      {
        source: 61,
        target: 55
      },
      {
        source: 59,
        target: 56
      },
      {
        source: 62,
        target: 60
      },
      {
        source: 22,
        target: 63
      },
      {
        source: 20,
        target: 64
      },
      {
        source: 59,
        target: 65
      },
      {
        source: 61,
        target: 65
      },
      {
        source: 68,
        target: 67
      },
      {
        source: 66,
        target: 67
      },
      {
        source: 67,
        target: 69
      },
      {
        source: 69,
        target: 70
      },
      {
        source: 21,
        target: 71
      },
      {
        source: 70,
        target: 72
      },
      {
        source: 72,
        target: 71
      },
      {
        source: 72,
        target: 66
      },
      {
        source: 70,
        target: 73
      },
      {
        source: 69,
        target: 73
      },
      {
        source: 73,
        target: 68
      },
      {
        source: 63,
        target: 71
      },
      {
        source: 63,
        target: 66
      },
      {
        source: 74,
        target: 75
      },
      {
        source: 75,
        target: 76
      },
      {
        source: 77,
        target: 74
      },
      {
        source: 78,
        target: 79
      },
      {
        source: 79,
        target: 80
      },
      {
        source: 81,
        target: 78
      },
      {
        source: 81,
        target: 80
      },
      {
        source: 78,
        target: 80
      },
      {
        source: 77,
        target: 76
      },
      {
        source: 76,
        target: 74
      },
      {
        source: 19,
        target: 18
      },
      {
        source: 20,
        target: 82
      },
      {
        source: 82,
        target: 64
      },
      {
        source: 37,
        target: 58
      },
      {
        source: 75,
        target: 19
      },
      {
        source: 37,
        target: 57
      },
      {
        source: 75,
        target: 18
      },
      {
        source: 83,
        target: 84
      },
      {
        source: 84,
        target: 85
      },
      {
        source: 86,
        target: 83
      },
      {
        source: 86,
        target: 85
      },
      {
        source: 83,
        target: 85
      },
      {
        source: 25,
        target: 83
      },
      {
        source: 60,
        target: 18
      },
      {
        source: 18,
        target: 16
      },
      {
        source: 18,
        target: 15
      },
      {
        source: 53,
        target: 87
      },
      {
        source: 53,
        target: 88
      },
      {
        source: 88,
        target: 87
      }
    ]
  }

  return {
    EdgeBetweenness,
    kMeans,
    Hierarchical,
    BiconnectedComponents
  }
})
