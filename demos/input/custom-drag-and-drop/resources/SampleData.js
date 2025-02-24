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
    {
      id: 0,
      layout: {
        x: 211,
        y: 278,
        width: 50,
        height: 50
      }
    },
    {
      id: 1,
      layout: {
        x: 192,
        y: 452,
        width: 50,
        height: 50
      }
    },
    {
      id: 2,
      layout: {
        x: 490,
        y: 245,
        width: 50,
        height: 50
      }
    },
    {
      id: 3,
      layout: {
        x: 711,
        y: 458,
        width: 50,
        height: 50
      }
    },
    {
      id: 4,
      layout: {
        x: 425,
        y: 643,
        width: 50,
        height: 50
      }
    }
  ],
  edges: [
    {
      id: 0,
      source: 1,
      target: 4
    },
    {
      id: 1,
      source: 4,
      target: 3
    },
    {
      id: 2,
      source: 3,
      target: 2
    },
    {
      id: 3,
      source: 2,
      target: 0
    },
    {
      id: 4,
      source: 0,
      target: 1
    },
    {
      id: 5,
      source: 2,
      target: 4
    }
  ]
}
