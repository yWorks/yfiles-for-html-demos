/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
    { id: 0 },
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: 10 },
    { id: 11 },
    { id: 12 },
    { id: 13 },
    { id: 14 },
    { id: 15 },
    { id: 16 },
    { id: 17 },
    { id: 18 },
    { id: 19 },
    { id: 20 }
  ],
  edges: [
    { id: 0, from: 0, to: 20, groupIds: { sourceGroupId: 'st9', targetGroupId: 'st9' } },
    { id: 1, from: 1, to: 2, groupIds: { sourceGroupId: 's1' } },
    { id: 2, from: 1, to: 3, groupIds: { sourceGroupId: 's1' } },
    { id: 4, from: 1, to: 4, groupIds: { sourceGroupId: 's1' } },
    { id: 5, from: 1, to: 7, groupIds: { sourceGroupId: 's2' } },
    { id: 6, from: 1, to: 10, groupIds: { sourceGroupId: 's2' } },
    { id: 7, from: 3, to: 6, groupIds: {} },
    { id: 8, from: 4, to: 7, groupIds: { sourceGroupId: 'st3', targetGroupId: 'st3' } },
    { id: 9, from: 4, to: 8, groupIds: { sourceGroupId: 'st3', targetGroupId: 'st3' } },
    { id: 10, from: 4, to: 9, groupIds: { sourceGroupId: 'st3', targetGroupId: 'st3' } },
    { id: 11, from: 4, to: 10, groupIds: { sourceGroupId: 'st3', targetGroupId: 'st3' } },
    { id: 12, from: 4, to: 11, groupIds: { sourceGroupId: 'st4', targetGroupId: 'st4' } },
    { id: 13, from: 4, to: 13, groupIds: { sourceGroupId: 'st4', targetGroupId: 'st4' } },
    { id: 14, from: 5, to: 19, groupIds: { targetGroupId: 't5' } },
    { id: 15, from: 6, to: 11, groupIds: {} },
    { id: 16, from: 7, to: 12, groupIds: { sourcePortGroupId: 'sp6' } },
    { id: 17, from: 7, to: 13, groupIds: { sourcePortGroupId: 'sp6' } },
    { id: 18, from: 7, to: 16, groupIds: { sourcePortGroupId: 'sp6' } },
    { id: 19, from: 8, to: 14, groupIds: {} },
    { id: 20, from: 8, to: 15, groupIds: { targetPortGroupId: 'tp7' } },
    { id: 21, from: 9, to: 15, groupIds: { targetPortGroupId: 'tp7' } },
    { id: 22, from: 10, to: 15, groupIds: { targetPortGroupId: 'tp7' } },
    { id: 23, from: 11, to: 19, groupIds: { targetGroupId: 't5' } },
    { id: 24, from: 12, to: 19, groupIds: { targetGroupId: 't5' } },
    { id: 25, from: 13, to: 16, groupIds: {} },
    { id: 26, from: 14, to: 0, groupIds: {} },
    { id: 27, from: 14, to: 20, groupIds: { sourceGroupId: 'st10', targetGroupId: 'st10' } },
    { id: 28, from: 15, to: 18, groupIds: {} },
    { id: 29, from: 15, to: 20, groupIds: { sourceGroupId: 'st10', targetGroupId: 'st10' } },
    { id: 30, from: 16, to: 19, groupIds: { targetGroupId: 't8' } },
    { id: 31, from: 17, to: 20, groupIds: { sourceGroupId: 'st9', targetGroupId: 'st9' } },
    { id: 32, from: 18, to: 19, groupIds: { targetGroupId: 't8' } }
  ]
}
