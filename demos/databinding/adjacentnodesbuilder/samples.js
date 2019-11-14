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

define([], () => [
  {
    name: '1 - Simple Arrays',
    updateEnabled: true,
    nodesSource:
      "[\n{id:'A', pred:['D'], succ:['B','C']},\n{id:'B'},\n{id:'C', pred:[], succ:[]},\n{id:'D', succ:['C']}\n]",
    predecessorsBinding: 'pred',
    successorsBinding: 'succ',
    nodeIdBinding: 'id',
    nodeTemplate:
      "<rect fill='darkorange' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect><text transform='translate(10 20)' data-content='{Binding id}' style='font-size:18px;'></text>"
  },
  {
    name: '2 - Simple Arrays Again',
    updateEnabled: true,
    nodesSource:
      "[\n{id:'A', pred:['D'], succ:['B','C']},\n{id:'B', pred:['A']},\n{id:'C', pred:['A','A','A','D']},\n{id:'D', succ:['A','C']}\n]",
    predecessorsBinding: 'pred',
    successorsBinding: 'succ',
    nodeIdBinding: 'id',
    nodeTemplate:
      "<rect fill='darkorange' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect><text transform='translate(10 20)' data-content='{Binding id}' style='font-size:18px;'></text>"
  },
  {
    name: '3 - Tree',
    nodesSource:
      "[\n{name: 'router', succ: [\n  {name: 'Klotz'},\n  {name: 'Schnucki', succ: [\n    {name: 'scanner'},\n    {name: 'color printer'}\n  ]},\n  {name: 'Power'},\n  {name: 'Oschi', succ: [\n    {name: 'b/w printer'}\n  ]},\n  {name: 'switch', succ: [\n    {name: 'Brocken', succ: [\n      {name: 'scanner'},\n      {name: 'phaser printer' },\n      {name: '3D printer' }\n    ]},\n    {name: 'Trumm', succ: [\n      {name: 'laser printer'}\n    ]}\n  ]}\n]}\n]",
    predecessorsBinding: '',
    successorsBinding: 'succ',
    nodeIdBinding: '',
    nodeTemplate:
      "<rect fill='darkorange' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect><text transform='translate(10 20)' data-content='{Binding name}' style='font-size:18px;'></text>"
  }
])
