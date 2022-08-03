/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
export default {
  ProblemSolving: {
    nodes: [
      {
        id: 0,
        label: 'PROBLEM ANALYSIS',
        type: 'start1'
      },
      {
        id: 1,
        label: 'DOES THE DAMN\n THING WORK?',
        type: 'decision'
      },
      {
        id: 2,
        label: 'DID YOU\nMESS WITH IT?',
        type: 'decision'
      },
      {
        id: 3,
        label: "DON'T MESS\n WITH IT",
        type: 'process'
      },
      {
        id: 4,
        label: 'YOU IDIOT!!!',
        type: 'display'
      },
      {
        id: 5,
        label: 'DOES ANYONE\n KNOW?',
        type: 'decision'
      },
      {
        id: 6,
        label: 'HIDE IT',
        type: 'process'
      },
      {
        id: 7,
        label: 'YOU POOR IDIOT',
        type: 'display'
      },
      {
        id: 8,
        label: 'WILL YOU\n CATCH HELL?',
        type: 'decision'
      },
      {
        id: 9,
        label: 'CAN YOU BLAME\n SOMEONE ELSE?',
        type: 'decision'
      },
      {
        id: 10,
        label: 'TRASH IT',
        type: 'process'
      },
      {
        id: 11,
        label: 'NO PROBLEM',
        type: 'terminator'
      }
    ],

    edges: [
      {
        from: 0,
        to: 1
      },
      {
        from: 1,
        to: 2,
        label: 'No'
      },
      {
        from: 1,
        to: 3,
        label: 'Yes'
      },
      {
        from: 2,
        to: 4,
        label: 'Yes'
      },
      {
        from: 2,
        to: 8,
        label: 'No'
      },
      {
        from: 3,
        to: 11
      },
      {
        from: 4,
        to: 5
      },
      {
        from: 5,
        to: 6,
        label: 'No'
      },
      {
        from: 5,
        to: 7,
        label: 'Yes'
      },
      {
        from: 6,
        to: 11
      },
      {
        from: 7,
        to: 9
      },
      {
        from: 8,
        to: 10,
        label: 'No'
      },
      {
        from: 8,
        to: 7,
        label: 'Yes'
      },
      {
        from: 9,
        to: 7,
        label: 'No'
      },
      {
        from: 9,
        to: 11,
        label: 'Yes'
      },
      {
        from: 10,
        to: 11
      }
    ]
  },
  StudentRegistration: {
    nodes: [
      {
        id: 0,
        label: 'Start',
        type: 'start1'
      },
      {
        id: 1,
        label: 'Submit\nRegistration',
        type: 'process'
      },
      {
        id: 2,
        label: 'Application\nComplete?',
        type: 'decision'
      },
      {
        id: 3,
        label: 'Minimum\nStandard\nmet?',
        type: 'decision'
      },
      {
        id: 4,
        label: 'Suitable for\nProgram?',
        type: 'decision'
      },
      {
        id: 5,
        label: 'Write\nRejection Letter',
        type: 'process'
      },
      {
        id: 6,
        label: 'Write\nAcceptance Letter',
        type: 'process'
      },
      {
        id: 7,
        label: 'Letter',
        type: 'document'
      }
    ],

    edges: [
      {
        from: 0,
        to: 1
      },
      {
        from: 1,
        to: 2
      },
      {
        from: 2,
        to: 1,
        label: 'No'
      },
      {
        from: 2,
        to: 3,
        label: 'Yes'
      },
      {
        from: 3,
        to: 4,
        label: 'Yes'
      },
      {
        from: 3,
        to: 5,
        label: 'No'
      },
      {
        from: 4,
        to: 5,
        label: 'No'
      },
      {
        from: 4,
        to: 6,
        label: 'Yes'
      },
      {
        from: 5,
        to: 7
      },
      {
        from: 6,
        to: 7
      }
    ]
  },
  eCommerce: {
    nodes: [
      {
        id: 0,
        label: 'Start',
        type: 'start1'
      },
      {
        id: 1,
        label: 'Registered',
        type: 'decision'
      },
      {
        id: 2,
        label: 'Login',
        type: 'data'
      },
      {
        id: 3,
        label: 'Shop?',
        type: 'decision'
      },
      {
        id: 4,
        label: 'View\nItem?',
        type: 'decision'
      },
      {
        id: 5,
        label: 'Add Item\nto Cart',
        type: 'decision'
      },
      {
        id: 6,
        label: 'Display\nCart\nContent',
        type: 'decision'
      },
      {
        id: 7,
        label: 'Change\nCart\nItems',
        type: 'decision'
      },
      {
        id: 8,
        label: 'Change\nQuantities',
        type: 'process'
      },
      {
        id: 9,
        label: 'Checkout',
        type: 'process'
      },
      {
        id: 10,
        label: 'User\nRegistration',
        type: 'data'
      },
      {
        id: 11,
        label: 'View\nAccount\nStatus?',
        type: 'decision'
      },
      {
        id: 12,
        label: 'Logout',
        type: 'terminator'
      },
      {
        id: 13,
        label: 'View\nAccount Status',
        type: 'process'
      }
    ],

    edges: [
      {
        from: 0,
        to: 1
      },
      {
        from: 1,
        to: 2,
        label: 'Yes'
      },
      {
        from: 1,
        to: 10,
        label: 'No'
      },
      {
        from: 2,
        to: 3
      },
      {
        from: 3,
        to: 4,
        label: 'Yes'
      },
      {
        from: 3,
        to: 11,
        label: 'No'
      },
      {
        from: 4,
        to: 5,
        label: 'Yes'
      },
      {
        from: 4,
        to: 3,
        label: 'No'
      },
      {
        from: 5,
        to: 6,
        label: 'Yes'
      },
      {
        from: 5,
        to: 3,
        label: 'No'
      },
      {
        from: 6,
        to: 7,
        label: 'Yes'
      },
      {
        from: 6,
        to: 3,
        label: 'No'
      },
      {
        from: 7,
        to: 8,
        label: 'Yes'
      },
      {
        from: 7,
        to: 9,
        label: 'No'
      },
      {
        from: 8,
        to: 9
      },
      {
        from: 9,
        to: 3
      },
      {
        from: 10,
        to: 2
      },
      {
        from: 11,
        to: 12,
        label: 'No'
      },
      {
        from: 11,
        to: 13,
        label: 'Yes'
      },
      {
        from: 13,
        to: 3
      }
    ]
  },
  ComputingFactorial: {
    nodes: [
      {
        id: 0,
        label: 'START',
        type: 'start1'
      },
      {
        id: 1,
        label: 'READ N',
        type: 'data'
      },
      {
        id: 2,
        label: 'M=1\nF=1',
        type: 'process'
      },
      {
        id: 3,
        label: 'F=F*M',
        type: 'process'
      },
      {
        id: 4,
        label: 'IS M=N?',
        type: 'decision'
      },
      {
        id: 5,
        label: 'PRINT F',
        type: 'data'
      },
      {
        id: 6,
        label: 'END',
        type: 'terminator'
      },
      {
        id: 7,
        label: 'M=M+1',
        type: 'process'
      }
    ],

    edges: [
      {
        from: 0,
        to: 1
      },
      {
        from: 1,
        to: 2
      },
      {
        from: 2,
        to: 3
      },
      {
        from: 3,
        to: 4
      },
      {
        from: 4,
        to: 5,
        label: 'Yes'
      },
      {
        from: 4,
        to: 7,
        label: 'No'
      },
      {
        from: 5,
        to: 6
      },
      {
        from: 7,
        to: 3
      }
    ]
  },
  LargestNumber: {
    nodes: [
      {
        id: 0,
        label: 'START',
        type: 'start1'
      },
      {
        id: 1,
        label: 'READ A,B,C',
        type: 'data'
      },
      {
        id: 2,
        label: 'IS A>B?',
        type: 'decision'
      },
      {
        id: 3,
        label: 'IS A>C?',
        type: 'decision'
      },
      {
        id: 4,
        label: 'IS B>C?',
        type: 'decision'
      },
      {
        id: 5,
        label: 'PRINT A',
        type: 'data'
      },
      {
        id: 6,
        label: 'PRINT C',
        type: 'data'
      },
      {
        id: 7,
        label: 'PRINT B',
        type: 'data'
      },
      {
        id: 8,
        label: 'END',
        type: 'terminator'
      }
    ],

    edges: [
      {
        from: 0,
        to: 1
      },
      {
        from: 1,
        to: 2
      },
      {
        from: 2,
        to: 3,
        label: 'Yes'
      },
      {
        from: 2,
        to: 4,
        label: 'No'
      },
      {
        from: 3,
        to: 5,
        label: 'Yes'
      },
      {
        from: 3,
        to: 6,
        label: 'No'
      },
      {
        from: 4,
        to: 6,
        label: 'No'
      },
      {
        from: 4,
        to: 7,
        label: 'Yes'
      },
      {
        from: 5,
        to: 8
      },
      {
        from: 6,
        to: 8
      },
      {
        from: 7,
        to: 8
      }
    ]
  }
}
