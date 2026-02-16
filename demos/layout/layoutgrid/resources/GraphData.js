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
  nodes: [
    { id: 0, column: -1, row: -1 },
    { id: 1, column: -1, row: -1 },
    { id: 2, column: 3, row: 0 },
    { id: 3, column: 2, row: 1 },
    { id: 4, column: 3, row: 1, group: 'group2' },
    { id: 5, column: 1, row: 1 },
    { id: 6, column: 2, row: 0 },
    { id: 7, column: 0, row: 1, group: 'group1' },
    { id: 8, column: 0, row: 1, group: 'group1' },
    { id: 9, column: 2, row: 1 },
    { id: 10, column: 4, row: 2 },
    { id: 11, column: 1, row: 2 },
    { id: 12, column: 3, row: 3 },
    { id: 13, column: 1, row: 3 },
    { id: 14, column: 2, row: 0 },
    { id: 15, column: 2, row: 3 },
    { id: 16, column: 4, row: 1 },
    { id: 17, column: 3, row: 1, group: 'group2' }
  ],

  edges: [
    { source: 0, target: 3 },
    { source: 0, target: 7 },
    { source: 0, target: 11 },
    { source: 14, target: 0 },
    { source: 11, target: 1 },
    { source: 2, target: 4 },
    { source: 2, target: 16 },
    { source: 3, target: 5 },
    { source: 3, target: 9 },
    { source: 14, target: 3 },
    { source: 4, target: 9 },
    { source: 4, target: 12 },
    { source: 5, target: 15 },
    { source: 5, target: 8 },
    { source: 6, target: 14 },
    { source: 6, target: 9 },
    { source: 7, target: 11 },
    { source: 8, target: 11 },
    { source: 9, target: 12 },
    { source: 9, target: 15 },
    { source: 15, target: 10 },
    { source: 11, target: 12 },
    { source: 11, target: 13 },
    { source: 15, target: 3 },
    { source: 14, target: 4 },
    { source: 16, target: 10 },
    { source: 7, target: 1 },
    { source: 6, target: 17 },
    { source: 17, target: 12 },
    { source: 5, target: 13 }
  ],

  groups: [{ id: 'group1' }, { id: 'group2' }]
}
