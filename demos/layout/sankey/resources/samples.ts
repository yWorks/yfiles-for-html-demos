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
import type { PoliticalParty, VoterShift } from '../data-types'

export const electionData: { parties: PoliticalParty[]; voterShift: VoterShift[] } = {
  parties: [
    { id: 0, name: 'Black Party' },
    { id: 1, name: 'Red Party' },
    { id: 2, name: 'Yellow Party' },
    { id: 3, name: 'Green Party' },
    { id: 4, name: 'Purple Party' },
    { id: 5, name: 'Black Party' },
    { id: 6, name: 'Red Party' },
    { id: 7, name: 'Yellow Party' },
    { id: 8, name: 'Green Party' },
    { id: 9, name: 'Purple Party' },
    { id: 10, name: 'Non-voter' },
    { id: 11, name: 'Black Party' },
    { id: 12, name: 'Red Party' },
    { id: 13, name: 'Yellow Party' },
    { id: 14, name: 'Green Party' },
    { id: 15, name: 'Purple Party' },
    { id: 16, name: 'Blue Party' },
    { id: 17, name: 'Non-voter' },
    { id: 18, name: 'Black Party' },
    { id: 19, name: 'Red Party' },
    { id: 20, name: 'Yellow Party' },
    { id: 21, name: 'Green Party' },
    { id: 22, name: 'Purple Party' },
    { id: 23, name: 'Blue Party' },
    { id: 24, name: 'Non-voter' },
    { id: 25, name: 'Black Party' },
    { id: 26, name: 'Red Party' },
    { id: 27, name: 'Yellow Party' },
    { id: 28, name: 'Green Party' },
    { id: 29, name: 'Purple Party' },
    { id: 30, name: 'Blue Party' },
    { id: 31, name: 'Non-voter' },
    { id: 32, name: 'Non-voter' }
  ],

  voterShift: [
    { source: 0, target: 5, voters: 13654 },
    { source: 0, target: 7, voters: 1140 },
    { source: 0, target: 8, voters: 50 },
    { source: 0, target: 9, voters: 40 },
    { source: 0, target: 10, voters: 1080 },
    { source: 1, target: 5, voters: 880 },
    { source: 1, target: 6, voters: 9890 },
    { source: 1, target: 7, voters: 530 },
    { source: 1, target: 8, voters: 870 },
    { source: 1, target: 9, voters: 1100 },
    { source: 1, target: 10, voters: 2040 },
    { source: 2, target: 7, voters: 6278 },
    { source: 2, target: 10, voters: 70 },
    { source: 3, target: 7, voters: 30 },
    { source: 3, target: 8, voters: 3681 },
    { source: 3, target: 9, voters: 140 },
    { source: 3, target: 10, voters: 30 },
    { source: 4, target: 7, voters: 20 },
    { source: 4, target: 9, voters: 3837 },
    { source: 4, target: 10, voters: 300 },
    { source: 5, target: 11, voters: 14685 },
    { source: 5, target: 16, voters: 290 },
    { source: 6, target: 11, voters: 210 },
    { source: 6, target: 12, voters: 9755 },
    { source: 6, target: 16, voters: 180 },
    { source: 7, target: 11, voters: 2110 },
    { source: 7, target: 12, voters: 530 },
    { source: 7, target: 13, voters: 2084 },
    { source: 7, target: 14, voters: 170 },
    { source: 7, target: 15, voters: 90 },
    { source: 7, target: 16, voters: 430 },
    { source: 7, target: 17, voters: 460 },
    { source: 8, target: 11, voters: 420 },
    { source: 8, target: 12, voters: 550 },
    { source: 8, target: 14, voters: 3570 },
    { source: 8, target: 16, voters: 90 },
    { source: 8, target: 17, voters: 40 },
    { source: 9, target: 11, voters: 120 },
    { source: 9, target: 12, voters: 370 },
    { source: 9, target: 14, voters: 40 },
    { source: 9, target: 15, voters: 3780 },
    { source: 9, target: 16, voters: 340 },
    { source: 9, target: 17, voters: 320 },
    { source: 10, target: 11, voters: 1130 },
    { source: 10, target: 12, voters: 360 },
    { source: 10, target: 16, voters: 210 },
    { source: 10, target: 17, voters: 16835 },
    { source: 11, target: 18, voters: 15065 },
    { source: 11, target: 20, voters: 1360 },
    { source: 11, target: 21, voters: 30 },
    { source: 11, target: 22, voters: 90 },
    { source: 11, target: 23, voters: 980 },
    { source: 11, target: 24, voters: 1610 },
    { source: 12, target: 18, voters: 20 },
    { source: 12, target: 19, voters: 9276 },
    { source: 12, target: 20, voters: 450 },
    { source: 12, target: 21, voters: 380 },
    { source: 12, target: 22, voters: 430 },
    { source: 12, target: 23, voters: 470 },
    { source: 13, target: 20, voters: 2115 },
    { source: 13, target: 23, voters: 40 },
    { source: 14, target: 20, voters: 110 },
    { source: 14, target: 21, voters: 3545 },
    { source: 14, target: 22, voters: 170 },
    { source: 14, target: 23, voters: 40 },
    { source: 15, target: 20, voters: 60 },
    { source: 15, target: 22, voters: 3365 },
    { source: 15, target: 23, voters: 400 },
    { source: 16, target: 23, voters: 2793 },
    { source: 17, target: 18, voters: 380 },
    { source: 17, target: 19, voters: 360 },
    { source: 17, target: 20, voters: 700 },
    { source: 17, target: 21, voters: 230 },
    { source: 17, target: 22, voters: 270 },
    { source: 17, target: 23, voters: 1200 },
    { source: 17, target: 24, voters: 13072 },
    { source: 18, target: 25, voters: 11050 },
    { source: 18, target: 26, voters: 1530 },
    { source: 18, target: 27, voters: 490 },
    { source: 18, target: 28, voters: 920 },
    { source: 18, target: 31, voters: 50 },
    { source: 19, target: 26, voters: 8760 },
    { source: 19, target: 28, voters: 260 },
    { source: 20, target: 26, voters: 180 },
    { source: 20, target: 27, voters: 4160 },
    { source: 20, target: 28, voters: 240 },
    { source: 21, target: 28, voters: 5257 },
    { source: 22, target: 25, voters: 20 },
    { source: 22, target: 26, voters: 640 },
    { source: 22, target: 27, voters: 110 },
    { source: 22, target: 28, voters: 480 },
    { source: 22, target: 29, voters: 2267 },
    { source: 22, target: 30, voters: 90 },
    { source: 22, target: 31, voters: 320 },
    { source: 23, target: 25, voters: 80 },
    { source: 23, target: 26, voters: 260 },
    { source: 23, target: 27, voters: 210 },
    { source: 23, target: 28, voters: 60 },
    { source: 23, target: 30, voters: 4675 },
    { source: 23, target: 31, voters: 180 },
    { source: 24, target: 26, voters: 520 },
    { source: 24, target: 27, voters: 300 },
    { source: 24, target: 31, voters: 13584 },
    { source: 32, target: 10, voters: 14645 }
  ]
}
