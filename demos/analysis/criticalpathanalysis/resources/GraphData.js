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
export default {
  nodes: [
    {
      id: 0,
      layout: {
        x: 0,
        y: 0,
        width: 30,
        height: 30
      },
      label: 'START',
      tag: {
        duration: 1
      }
    },
    {
      id: 1,
      layout: {
        x: 0,
        y: 0,
        width: 50,
        height: 30
      },
      label: 'Excavating',
      tag: {
        duration: 10
      }
    },
    {
      id: 2,
      layout: {
        x: 0,
        y: 0,
        width: 90,
        height: 30
      },
      label: 'Foundation',
      tag: {
        duration: 30
      }
    },
    {
      id: 3,
      layout: {
        x: 0,
        y: 0,
        width: 90,
        height: 30
      },
      label: 'Framing',
      tag: {
        duration: 30
      }
    },
    {
      id: 4,
      layout: {
        x: 0,
        y: 0,
        width: 70,
        height: 30
      },
      label: 'Plumbing',
      tag: {
        duration: 20
      }
    },
    {
      id: 5,
      layout: {
        x: 0,
        y: 0,
        width: 60,
        height: 30
      },
      label: 'Brickwork',
      tag: {
        duration: 15
      }
    },
    {
      id: 6,
      layout: {
        x: 0,
        y: 0,
        width: 36,
        height: 30
      },
      label: 'Windows',
      tag: {
        duration: 3
      }
    },
    {
      id: 7,
      layout: {
        x: 0,
        y: 0,
        width: 90,
        height: 30
      },
      label: 'Roof',
      tag: {
        duration: 30
      }
    },
    {
      id: 8,
      layout: {
        x: 0,
        y: 0,
        width: 70,
        height: 30
      },
      label: 'Flooring',
      tag: {
        duration: 20
      }
    },
    {
      id: 9,
      layout: {
        x: 0,
        y: 0,
        width: 60,
        height: 30
      },
      label: 'Electrical',
      tag: {
        duration: 15
      }
    },
    {
      id: 10,
      layout: {
        x: 0,
        y: 0,
        width: 46,
        height: 30
      },
      label: 'Kitchen/Bathroom',
      tag: {
        duration: 8
      }
    },
    {
      id: 11,
      layout: {
        x: 0,
        y: 0,
        width: 70,
        height: 30
      },
      label: 'Painting',
      tag: {
        duration: 20
      }
    },
    {
      id: 12,
      layout: {
        x: 0,
        y: 0,
        width: 70,
        height: 30
      },
      label: 'Landscape',
      tag: {
        duration: 20
      }
    },
    {
      id: 13,
      layout: {
        x: 0,
        y: 0,
        width: 30,
        height: 30
      },
      label: 'FINISH',
      tag: {
        duration: 0
      }
    }
  ],
  edges: [
    {
      source: 0,
      target: 1,
      label: '0d',
      tag: {
        transitionDuration: 0
      }
    },
    {
      source: 1,
      target: 2,
      label: '2d',
      tag: {
        transitionDuration: 2
      }
    },
    {
      source: 2,
      target: 3,
      label: '2d',
      tag: {
        transitionDuration: 2
      }
    },
    {
      source: 3,
      target: 4,
      label: '2d',
      tag: {
        transitionDuration: 2
      }
    },
    {
      source: 3,
      target: 5,
      label: '2d',
      tag: {
        transitionDuration: 2
      }
    },
    {
      source: 4,
      target: 8,
      label: '2d',
      tag: {
        transitionDuration: 2
      }
    },
    {
      source: 5,
      target: 6,
      label: '1d',
      tag: {
        transitionDuration: 1
      }
    },
    {
      source: 3,
      target: 7,
      label: '2d',
      tag: {
        transitionDuration: 2
      }
    },
    {
      source: 7,
      target: 8,
      label: '2d',
      tag: {
        transitionDuration: 2
      }
    },
    {
      source: 6,
      target: 8,
      label: '2d',
      tag: {
        transitionDuration: 2
      }
    },
    {
      source: 9,
      target: 10,
      label: '2d',
      tag: {
        transitionDuration: 2
      }
    },
    {
      source: 7,
      target: 9,
      label: '2d',
      tag: {
        transitionDuration: 1
      }
    },
    {
      source: 7,
      target: 12,
      label: '2d',
      tag: {
        transitionDuration: 2
      }
    },
    {
      source: 8,
      target: 10,
      label: '2d',
      tag: {
        transitionDuration: 2
      }
    },
    {
      source: 10,
      target: 11,
      label: '2d',
      tag: {
        transitionDuration: 2
      }
    },
    {
      source: 11,
      target: 13,
      label: '5d',
      tag: {
        transitionDuration: 5
      }
    },
    {
      source: 12,
      target: 13,
      label: '6d',
      tag: {
        transitionDuration: 6
      }
    }
  ]
}
