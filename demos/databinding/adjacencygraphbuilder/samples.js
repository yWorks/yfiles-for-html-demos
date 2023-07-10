/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
        data: `const n3 = { id: 3 }

return [
  {
    id: 0,
    predecessors: [n3],
    successors: [
      {
        id: 1,
        successors: [n3]
      },
      {
        id: 2,
        successors: [n3]
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
      {
        thisSource: 'Orange Nodes',
        neighborSource: 'Blue Nodes',
        neighborBinding: 'successors',
        neighborType: 'successor'
      },
      {
        thisSource: 'Blue Nodes',
        neighborSource: 'Orange Nodes',
        neighborBinding: 'successors',
        neighborType: 'successor'
      },
      {
        thisSource: 'Orange Nodes',
        neighborSource: 'Orange Nodes',
        neighborBinding: 'predecessors',
        neighborType: 'predecessor'
      }
    ]
  },
  {
    name: '2 - Tree',
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
      {
        thisSource: 'Blue Nodes',
        neighborSource: 'Orange Nodes',
        neighborBinding: 'childrenBlue',
        neighborType: 'successor'
      },
      {
        thisSource: 'Orange Nodes',
        neighborSource: 'Blue Nodes',
        neighborBinding: 'childrenOrange',
        neighborType: 'successor'
      }
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
        thisSource: 'Orange Nodes',
        neighborSource: 'Blue Nodes',
        neighborBinding: 'node => node.childNodes',
        neighborType: 'successor'
      }
    ]
  }
]
