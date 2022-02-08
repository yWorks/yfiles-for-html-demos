/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
        data: `[
  {
    id: 0,
    childrenOrange: [
      {
        id: 1,
        childrenBlue: [{ id: 2, childrenOrange: [{ id: 3 }] }]
      },
      {
        id: 4,
        childrenBlue: [
          { id: 5, childrenOrange: [{ id: 6 }] },
          { id: 7 }
        ]
      }
    ]
  }
]`,
        template: `<rect fill='#ff6c00' stroke='#662b00' stroke-width='1.5' rx='3.5' ry='3.5' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect>
<text transform='translate(10 20)' data-content='{Binding id}' style='font-size:18px; fill:#000;'></text>`,
        idBinding: 'id'
      },
      {
        name: 'Blue Nodes',
        template: `<rect fill='#242265' stroke='#24113D' stroke-width='1.5' rx='3.5' ry='3.5' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect>
<text transform='translate(10 20)' data-content='{Binding id}' style='font-size:18px; fill:#FFFFFF;'></text>`,
        idBinding: 'id'
      }
    ],
    edgesSource: [
      { parentSource: 'Blue Nodes', childSource: 'Orange Nodes', childBinding: 'childrenBlue' },
      { parentSource: 'Orange Nodes', childSource: 'Blue Nodes', childBinding: 'childrenOrange' }
    ]
  },
  {
    name: '2 - Nested Trees',
    nodesSources: [
      {
        name: 'Orange Nodes',
        data: `[
  {
    id: 0,
    blueChildren: [
      {
        id: 1,
        orangeChildren: [{ id: 2, blueChildren: [{ id: 3 }] }]
      },
      {
        id: 4,
        orangeChildren: [
          { id: 5, blueChildren: [{ id: 6 }] },
          { id: 7, redChildren: [{id: 8, redChildren: [{id: 9}, {id: 10}]}] }
        ]
      }
    ]
  }
]`,
        template: `<rect fill='#ff6c00' stroke='#662b00' stroke-width='1.5' rx='3.5' ry='3.5' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect>
<text transform='translate(10 20)' data-content='{Binding id}' style='font-size:18px; fill:#000;'></text>`,
        idBinding: 'id'
      },
      {
        name: 'Blue Nodes',
        template: `<rect fill='#242265' stroke='#24113D' stroke-width='1.5' rx='3.5' ry='3.5' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect>
<text transform='translate(10 20)' data-content='{Binding id}' style='font-size:18px; fill:#FFFFFF;'></text>`,
        idBinding: 'id'
      },
      {
        name: 'Red Nodes',
        template: `<rect fill="#AB2346" stroke="#673E49" stroke-width='1.5' rx='3.5' ry='3.5' width="{TemplateBinding width}" height="{TemplateBinding height}"></rect>
<text transform="translate(10 20)" data-content="{Binding id}" style="font-size:18px; fill:white;"></text>`,
        idBinding: 'id'
      }
    ],
    edgesSource: [
      { parentSource: 'Blue Nodes', childSource: 'Orange Nodes', childBinding: 'orangeChildren' },
      { parentSource: 'Orange Nodes', childSource: 'Blue Nodes', childBinding: 'blueChildren' },
      { parentSource: 'Orange Nodes', childSource: 'Red Nodes', childBinding: 'redChildren' },
      { parentSource: 'Red Nodes', childSource: 'Red Nodes', childBinding: 'redChildren' }
    ]
  },
  {
    name: '3 - Dynamic Bindings',
    nodesSources: [
      {
        name: 'Orange Nodes',
        data: `[
  {
    id: 0,
    childNodes: [
      {
        id: 1
      },
      {
        id: 2
      }
    ]
  }
]`,
        template: `<rect fill='#ff6c00' stroke='#662b00' stroke-width='1.5' rx='3.5' ry='3.5' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect>
<text transform='translate(10 20)' data-content='{Binding id}' style='font-size:18px; fill:#000;'></text>`,
        idBinding: 'node => node.id'
      },
      {
        name: 'Blue Nodes',
        template: `<rect fill='#242265' stroke='#24113D' stroke-width='1.5' rx='3.5' ry='3.5' width='{TemplateBinding width}' height='{TemplateBinding height}'></rect>
<text transform='translate(10 20)' data-content='{Binding id}' style='font-size:18px; fill:#FFFFFF;'></text>`,
        idBinding: 'node => node.id'
      }
    ],
    edgesSource: [
      {
        parentSource: 'Orange Nodes',
        childSource: 'Blue Nodes',
        childBinding: 'node => node.childNodes'
      }
    ]
  }
]
