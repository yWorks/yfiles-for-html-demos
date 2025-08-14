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
export const sampleData = {
  gates: [
    { id: '1', type: 'and' },
    { id: '2', type: 'not' },
    { id: '3', type: 'nand' },
    { id: '4', type: 'not' },
    { id: '5', type: 'and' },

    { id: '6', type: 'nor' },
    { id: '7', type: 'or' },
    { id: '8', type: 'xor' },

    { id: '9', type: 'not' },
    { id: '10', type: 'xnor' },

    { id: '11', type: 'and' },
    { id: '12', type: 'not' }
  ],
  connections: [
    { id: '1:0-6:1', from: '1;out0', to: '6;in0' },
    { id: '2:0-6:2', from: '2;out0', to: '6;in1' },
    { id: '2:0-7:1', from: '2;out0', to: '7;in0' },
    { id: '3:0-7:2', from: '3;out0', to: '7;in1' },
    { id: '4:0-8:1', from: '4;out0', to: '8;in0' },
    { id: '5:0-8:2', from: '5;out0', to: '8;in1' },
    { id: '6:0-9:1', from: '6;out0', to: '9;in0' },
    { id: '7:0-9:2', from: '7;out0', to: '10;in0' },
    { id: '8:0-10:1', from: '8;out0', to: '10;in1' },
    { id: '9:0-11:1', from: '9;out0', to: '11;in0' },
    { id: '10:0-11:2', from: '10;out0', to: '11;in1' },
    { id: '10:0-12:1', from: '10;out0', to: '12;in0' }
  ]
}
