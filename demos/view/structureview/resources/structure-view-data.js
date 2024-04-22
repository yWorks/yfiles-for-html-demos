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
export const sampleData = {
  nodes: [
    { id: 'N1' },
    { id: 'N2', parentId: 'Group 1' },
    { id: 'N3', parentId: 'Group 1' },
    { id: 'N4', parentId: 'Group 1' },
    { id: 'N5', parentId: 'Group 2' },
    { id: 'N6', parentId: 'Group 2' },
    { id: 'N7', parentId: 'Group 2' },
    { id: 'N8', parentId: 'Group 2' },
    { id: 'N9', parentId: 'Group 1' },
    { id: 'N10', parentId: 'Group 1' },
    { id: 'N11', parentId: 'Group 3' },
    { id: 'N12', parentId: 'Group 3' },
    { id: 'N13', parentId: 'Group 3' },
    { id: 'N14', parentId: 'Group 3' },
    { id: 'N15', parentId: 'Group 3' },
    { id: 'N16' },
    { id: 'Group 1' },
    { id: 'Group 2', parentId: 'Group 1' },
    { id: 'Group 3' }
  ],
  edges: [
    { from: 'N1', to: 'N2' },
    { from: 'N2', to: 'N3' },
    { from: 'N2', to: 'N4' },
    { from: 'N3', to: 'N5' },
    { from: 'N3', to: 'N10' },
    { from: 'N4', to: 'N6' },
    { from: 'N5', to: 'N7' },
    { from: 'N6', to: 'N8' },
    { from: 'N7', to: 'N9' },
    { from: 'N10', to: 'N11' },
    { from: 'N10', to: 'N12' },
    { from: 'N11', to: 'N13' },
    { from: 'N12', to: 'N14' },
    { from: 'N12', to: 'N15' },
    { from: 'N13', to: 'N16' }
  ]
}
