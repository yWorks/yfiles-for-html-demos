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
  gates: [
    { id: '00', type: 'nand' },
    { id: '01', type: 'not' },
    { id: '02', type: 'nand' },
    { id: '03', type: 'not' },
    { id: '04', type: 'nand' },
    { id: '10', type: 'and' },
    { id: '11', type: 'nand' },
    { id: '12', type: 'and' },
    { id: '20', type: 'and' },
    { id: '21', type: 'not' },
    { id: '30', type: 'and' },
    { id: '31', type: 'not' }
  ],
  connections: [
    { id: '00:0-10:0', from: '00;out0', to: '10;in0' },
    { id: '01:0-10:1', from: '01;out0', to: '10;in1' },
    { id: '01:0-11:0', from: '01;out0', to: '11;in0' },
    { id: '02:0-11:1', from: '02;out0', to: '11;in1' },
    { id: '03:0-12:0', from: '03;out0', to: '12;in0' },
    { id: '04:0-12:1', from: '04;out0', to: '12;in1' },
    { id: '05:0-12:1', from: '05;out0', to: '12;in1' },
    { id: '10:0-20:0', from: '10;out0', to: '20;in0' },
    { id: '11:0-20:1', from: '11;out0', to: '20;in1' },
    { id: '12:0-21:0', from: '12;out0', to: '21;in0' },
    { id: '20:0-30:0', from: '20;out0', to: '30;in0' },
    { id: '21:0-30:1', from: '21;out0', to: '30;in1' },
    { id: '21:0-31:0', from: '21;out0', to: '31;in0' }
  ],
  updateGates: [
    { id: '01', type: 'not' },
    { id: '02', type: 'nand' },
    { id: '04', type: 'nand' },
    { id: '05', type: 'or' },
    { id: '10', type: 'and' },
    { id: '11', type: 'nand' },
    { id: '12', type: 'and' },
    { id: '20', type: 'and' },
    { id: '21', type: 'not' },
    { id: '30', type: 'and' },
    { id: '31', type: 'not' },
    { id: '40', type: 'or' }
  ],
  updateConnections: [
    { id: '01:0-10:0', from: '01;out0', to: '10;in0' },
    { id: '02:0-10:1', from: '02;out0', to: '10;in1' },
    { id: '02:0-11:0', from: '02;out0', to: '11;in0' },
    { id: '03:0-12:0', from: '03;out0', to: '12;in0' },
    { id: '04:0-12:0', from: '04;out0', to: '12;in0' },
    { id: '05:0-12:1', from: '05;out0', to: '12;in1' },
    { id: '00:0-10:0', from: '00;out0', to: '10;in0' },
    { id: '10:0-20:0', from: '10;out0', to: '20;in0' },
    { id: '11:0-20:1', from: '11;out0', to: '20;in1' },
    { id: '12:0-21:0', from: '12;out0', to: '21;in0' },
    { id: '20:0-30:0', from: '20;out0', to: '30;in0' },
    { id: '21:0-30:1', from: '21;out0', to: '30;in1' },
    { id: '21:0-31:0', from: '21;out0', to: '31;in0' },
    { id: '30:0-40:0', from: '30;out0', to: '40;in0' },
    { id: '31:0-40:1', from: '31;out0', to: '40;in1' }
  ]
}
