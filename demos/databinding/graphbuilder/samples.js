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
    nodesSource: "['A','B','C','D']",
    edgesSource:
      "[\n{from:'A', to:'B', name:'e1'}, \n{from:'A', to:'C', name:'e2'}, \n{from:'D', to:'C', name:'e3'}, \n{from:'D', to:'A', name:'e4'}\n]",
    sourceNodeBinding: 'from',
    targetNodeBinding: 'to',
    nodeIdBinding: '',
    edgeLabelBinding: '',
    nodeTemplate:
      "<rect fill='darkorange' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect><text transform='translate(10 20)' data-content='{Binding}' style='font-size:18px; fill:#000;'></text>"
  },
  {
    name: '2 - Simple Arrays and Lazy Nodes',
    updateEnabled: true,
    nodesSource: "['A','B','C','D']",
    edgesSource:
      "[\n{from:'A', to:'B', name:'e1'}, \n{from:'A', to:'C', name:'e2'}, \n{from:'D', to:'C', name:'e3'}" +
      ", \n{from:'D', to:'A', name:'e4'}, \n{from:'B', to:'E', name:'e5'}, \n{from:'C', to:'F', name:'e6'}, \n{from:'E', to:'F', name:'e7'}\n]",
    sourceNodeBinding: 'from',
    targetNodeBinding: 'to',
    nodeIdBinding: '',
    edgeLabelBinding: 'name',
    nodeTemplate:
      "<rect fill='darkorange' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect><text transform='translate(10 20)' data-content='{Binding}' style='font-size:18px; fill:#000;'></text>",
    lazyNodeDefinition: true
  },
  {
    name: '3 - Dynamic Bindings',
    updateEnabled: true,
    nodesSource: "['A','B','C','D']",
    edgesSource: "['AB', 'AC', 'DC', 'DA']",
    sourceNodeBinding: 'function(edge) { return edge.charAt(0);}',
    targetNodeBinding: 'function(edge) { return edge.charAt(1);}',
    nodeIdBinding: '',
    edgeLabelBinding: '',
    nodeTemplate:
      "<rect fill='darkorange' stroke='white' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect><text transform='translate(10 20)' data-content='{Binding}' style='font-size:18px;'></text>",
    lazyNodeDefinition: false
  },
  {
    name: '4 - Objects and Ids',
    nodesSource:
      "[\n{name:'Peter', id:'item0'}, \n{name:'Paul', id:'item1'}, \n{name:'Mary', id:'item2'} \n]",
    edgesSource:
      "[\n{from:'item1', to:'item2'}, \n{from:'item2', to:'item0'}, \n{from:'item2', to:'item1'}, \n{from:'item0', to:'item1'}\n]",
    sourceNodeBinding: 'function(edge) { return edge.from;}',
    targetNodeBinding: 'function(edge) { return edge.to;}',
    nodeIdBinding: 'id',
    edgeLabelBinding: '',
    nodeTemplate:
      "<rect fill='darkorange' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect><text transform='translate(10 20)' data-content='{Binding name}' style='font-size:18px;'></text><text transform='translate(10 40)' data-content='{Binding id}' style='font-size:18px;'></text>",
    lazyNodeDefinition: false
  },
  {
    name: '5 - Complex Objects + Edge Labels',
    nodesSource: "{\n0:{'name':'Peter'}, \n1:{'name':'Paul'}, \n2:{'name':'Mary'}\n}",
    edgesSource:
      "[\n{from:'1', to:'2', label:'edge 1'}, \n{from:'2', to:'0', label:'edge 2'}, \n{from:'2', to:'1', label:'edge 3'}, \n{from:'0', to:'1', label:'edge 4'}\n]",
    sourceNodeBinding: 'from',
    targetNodeBinding: 'to',
    nodeIdBinding: '',
    edgeLabelBinding: 'label',
    nodeTemplate:
      "<rect fill='darkorange' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect><text transform='translate(10 20)' data-content='{Binding name}' style='font-size:18px;'></text>",
    lazyNodeDefinition: false
  },
  {
    name: '6 - Dynamic Modules',
    nodesSource:
      'nodes = require.getRequiredModuleStates(),\nedges = [],\nnodes.forEach(function(n){n.dependencies.forEach(function(e){var ed = {t:e}; ed.s = n.name; edges.push(ed)})}),\n(nodes)',
    edgesSource: 'edges',
    sourceNodeBinding: 's',
    targetNodeBinding: 't',
    nodeIdBinding: 'name',
    edgeLabelBinding: '',
    nodeTemplate:
      "<rect fill='darkorange' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect><text transform='translate(5 30)' data-content='{Binding name}' style='font-size:9px;'></text>",
    lazyNodeDefinition: false
  },
  {
    name: '7 - Tree',
    nodesSource:
      "n0={name:'root'},\nn1={name:'n1, level 1'},\nn2={name:'n2, level 1'},\nn3={name:'n3, level 2'},\nn4={name:'n4, level 2'},\nn5={name:'n5, level 2'},\n([n0])",
    edgesSource:
      '[\n{from:n0, to:n1},\n{from:n0, to:n2},\n{from:n1, to:n3},\n{from:n1, to:n4},\n{from:n1, to:n5}\n]',
    sourceNodeBinding: 'from',
    targetNodeBinding: 'to',
    nodeIdBinding: '',
    edgeLabelBinding: '',
    nodeTemplate:
      "<rect fill='darkorange' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect><text transform='translate(5 30)' data-content='{Binding name}' style='font-size:9px;'></text>",
    lazyNodeDefinition: true
  }
])
