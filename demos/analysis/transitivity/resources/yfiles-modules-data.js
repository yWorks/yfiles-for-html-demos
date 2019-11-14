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
  /* @yjs:keep */
  const nodes = [
    {
      id: 0,
      label: 'yfiles/complete'
    },
    {
      id: 1,
      label: 'yfiles/layout'
    },
    {
      id: 2,
      label: 'yfiles/layout-radial'
    },
    {
      id: 3,
      label: 'yfiles/layout-familytree'
    },
    {
      id: 4,
      label: 'yfiles/layout-multipage'
    },
    {
      id: 5,
      label: 'yfiles/layout-orthogonal-compact'
    },
    {
      id: 6,
      label: 'yfiles/layout-orthogonal'
    },
    {
      id: 7,
      label: 'yfiles/layout-seriesparallel'
    },
    {
      id: 8,
      label: 'yfiles/layout-hierarchic'
    },
    {
      id: 9,
      label: 'yfiles/layout-organic'
    },
    {
      id: 10,
      label: 'yfiles/router-other'
    },
    {
      id: 11,
      label: 'yfiles/router-polyline'
    },
    {
      id: 12,
      label: 'yfiles/layout-tree'
    },
    {
      id: 13,
      label: 'yfiles/algorithms'
    },
    {
      id: 14,
      label: 'yfiles/view-layout-bridge'
    },
    {
      id: 15,
      label: 'yfiles/view'
    },
    {
      id: 16,
      label: 'yfiles/view-folding'
    },
    {
      id: 17,
      label: 'yfiles/view-graphml'
    },
    {
      id: 18,
      label: 'yfiles/view-editor'
    },
    {
      id: 19,
      label: 'yfiles/view-table'
    },
    {
      id: 20,
      label: 'yfiles/view-component'
    }
  ]

  const edges = [
    {
      from: 0,
      to: 1
    },
    {
      from: 0,
      to: 14
    },
    {
      from: 0,
      to: 15
    },
    {
      from: 1,
      to: 7
    },
    {
      from: 1,
      to: 2
    },
    {
      from: 1,
      to: 3
    },
    {
      from: 1,
      to: 4
    },
    {
      from: 1,
      to: 5
    },
    {
      from: 2,
      to: 8
    },
    {
      from: 3,
      to: 8
    },
    {
      from: 3,
      to: 10
    },
    {
      from: 4,
      to: 9
    },
    {
      from: 4,
      to: 10
    },
    {
      from: 4,
      to: 11
    },
    {
      from: 5,
      to: 6
    },
    {
      from: 5,
      to: 10
    },
    {
      from: 5,
      to: 11
    },
    {
      from: 6,
      to: 12
    },
    {
      from: 7,
      to: 13
    },
    {
      from: 8,
      to: 13
    },
    {
      from: 9,
      to: 13
    },
    {
      from: 10,
      to: 13
    },
    {
      from: 11,
      to: 13
    },
    {
      from: 12,
      to: 13
    },
    {
      from: 14,
      to: 13
    },
    {
      from: 14,
      to: 20
    },
    {
      from: 15,
      to: 16
    },
    {
      from: 15,
      to: 17
    },
    {
      from: 15,
      to: 18
    },
    {
      from: 15,
      to: 19
    },
    {
      from: 16,
      to: 20
    },
    {
      from: 17,
      to: 20
    },
    {
      from: 18,
      to: 20
    },
    {
      from: 19,
      to: 20
    },
    {
      from: 0,
      to: 20
    },
    {
      from: 1,
      to: 6
    },
    {
      from: 1,
      to: 8
    },
    {
      from: 1,
      to: 9
    },
    {
      from: 1,
      to: 12
    }
  ]

  return {
    nodes,
    edges
  }
})
