/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
export default [
  {
    name: '1 - Two Nodes Sources',
    nodesSources: [
      {
        name: 'Orange Nodes',
        data: "['A', 'B', 'C']",
        template: `<rect fill='#ff6c00' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect>
<text transform='translate(10 20)' data-content='{Binding}' style='font-size:18px; fill:#000;'></text>`,
        idBinding: ''
      },
      {
        name: 'Blue Nodes',
        data: "['X', 'Y']",
        template: `<rect fill='#242265' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect>
<text transform='translate(10 20)' data-content='{Binding}' style='font-size:18px; fill:#FFFFFF;'></text>`,
        idBinding: ''
      }
    ],
    edgesSources: [
      {
        name: 'Edges',
        data: `[
{from:'A', to:'B', name:'e1', stroke: '1px #336699'},
{from:'A', to:'C', name:'e1', stroke: '1px #336699'},
{from:'A', to:'X', name:'e1', stroke: '1px #336699'},
{from:'A', to:'Y', name:'e1', stroke: '1px #336699'},
]`,
        sourceBinding: 'from',
        targetBinding: 'to',
        labelBinding: '',
        strokeBinding: 'stroke'
      }
    ]
  },
  {
    name: '2 - Dynamic Bindings',
    nodesSources: [
      {
        name: 'Orange Nodes',
        data: "['A', 'B', 'C']",
        template: `<rect fill='#ff6c00' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect>
<text transform='translate(10 20)' data-content='{Binding}' style='font-size:18px; fill:#000;'></text>`,
        idBinding: ''
      },
      {
        name: 'Blue Nodes',
        data: "['X', 'Y']",
        template: `<rect fill='#242265' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect>
<text transform='translate(10 20)' data-content='{Binding}' style='font-size:18px; fill:#FFFFFF;'></text>`,
        idBinding: ''
      }
    ],
    edgesSources: [
      {
        name: 'Edges',
        data: `['AB', 'AC', 'AX', 'AY']`,
        sourceBinding: 'edgeDataItem => edgeDataItem.charAt(0)',
        targetBinding: 'edgeDataItem => edgeDataItem.charAt(1)',
        labelBinding: '',
        strokeBinding: 'stroke'
      }
    ]
  },
  {
    name: '3 - Objects and IDs',
    nodesSources: [
      {
        name: 'Nodes',
        data: `[
{name:'Peter', id:'item0'},
{name:'Paul', id:'item1'},
{name:'Mary', id:'item2'}
]`,
        template: `<rect fill='#ff6c00' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect>
<text transform='translate(10 20)' data-content='{Binding name}' style='font-size:18px;'></text>
<text transform='translate(10 40)' data-content='{Binding id}' style='font-size:18px;'></text>`,
        idBinding: 'id'
      }
    ],
    edgesSources: [
      {
        name: 'Edges',
        data: `[
{from:'item1', to:'item2'},
{from:'item2', to:'item0'},
{from:'item2', to:'item1'},
{from:'item0', to:'item1'}
]`,
        sourceBinding: 'function(edge) { return edge.from }',
        targetBinding: 'function(edge) { return edge.to }',
        labelBinding: '',
        strokeBinding: ''
      }
    ]
  },
  {
    name: '4 - Complex Objects + Edge Labels',
    nodesSources: [
      {
        name: 'Nodes',
        data: `{
0:{'name':'Peter'},
1:{'name':'Paul'},
2:{'name':'Mary'}
}`,
        template: `<rect fill='#ff6c00' stroke='white' rx='2' ry='2' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect>
<text transform='translate(10 20)' data-content='{Binding name}' style='font-size:18px;'></text>`,
        idBinding: ''
      }
    ],
    edgesSources: [
      {
        name: 'Edges',
        data: `[
{from:'1', to:'2', label:'edge 1'},
{from:'2', to:'0', label:'edge 2'},
{from:'2', to:'1', label:'edge 3'},
{from:'0', to:'1', label:'edge 4'}
]`,
        sourceBinding: 'from',
        targetBinding: 'to',
        labelBinding: 'label',
        strokeBinding: ''
      }
    ]
  }
]
