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
export const nodeData = [
  { id: 'item0', path: '/root/dir1/dir1' },
  {
    id: 'item1',
    path: '/root/dir1/dir2',
    children: [
      {
        id: 'child1',
        children: [
          { id: 'child11', children: [{ id: 'child14' }, { id: 'child15' }] },
          { id: 'child12' }
        ]
      },
      { id: 'child2', children: [{ id: 'child13' }] }
    ]
  },
  { id: 'item2', path: '/root/dir1/dir2' },
  { id: 'item3', path: '/root/dir2/dir1' },
  {
    id: 'item4',
    path: '/root/dir2/dir1',
    children: [{ id: 'child3' }, { id: 'child4' }, { id: 'child5' }]
  },
  { id: 'item5', path: '/root/dir2/dir2', children: [{ id: 'child6' }] },
  {
    id: 'item6',
    path: '/root/dir2/dir2',
    children: [{ id: 'child7', children: [{ id: 'child16' }] }, { id: 'child8' }]
  },

  { id: 'item7', path: '/root/dir1', children: [{ id: 'child9' }, { id: 'child10' }] },

  { id: 'item8', path: '/root/dir1' }
]

export const edgeData = [
  { from: 'item8', to: 'child16' },
  { from: 'item8', to: 'child9' },
  { from: 'item8', to: 'child10' },
  { from: 'item2', to: 'child14' },
  { from: 'item2', to: 'child15' },
  { from: 'item2', to: 'child13' },
  { from: 'item2', to: 'child12' },
  { from: 'item12', to: 'child13' },
  { from: 'item0', to: 'item2' },
  { from: 'item8', to: 'child8' },
  { from: 'child16', to: 'child6' },
  { from: 'item3', to: 'child5' },
  { from: 'item3', to: 'child3' },
  //It's also perfectly valid to have edges between any of the parent or child entities
  { from: '/root/dir1', to: '/root/dir2' }
]
