/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
export default {
  nodesSource: [
    {
      id: '0',
      name: 'Root',
      ports: [
        { id: 'in', location: [0.5, 0] },
        { id: 'out 0', location: [0.25, 1] },
        { id: 'out 1', location: [0.5, 1] },
        { id: 'out 2', location: [0.75, 1] }
      ],
      children: [
        {
          id: '1-0',
          name: 'Node 1 - 0',
          color: 'blue',
          ports: [
            { id: 'in', location: [0.5, 0] },
            { id: 'out 0', location: [0.25, 1] },
            { id: 'out 1', location: [0.5, 1] },
            { id: 'out 2', location: [0.75, 1] }
          ],
          from: 'out 0',
          to: 'in',
          children: [
            {
              id: '1-0-0',
              name: 'Node 1 - 0 - 0',
              ports: [
                { id: 'in', location: [0.5, 0] },
                { id: 'out 0', location: [0.25, 1] },
                { id: 'out 1', location: [0.5, 1] },
                { id: 'out 2', location: [0.75, 1] }
              ],
              from: 'out 0',
              to: 'in'
            },
            {
              id: '1-0-1',
              name: 'Node 1 - 0 - 1',
              ports: [
                { id: 'in', location: [0.5, 0] },
                { id: 'out 0', location: [0.25, 1] },
                { id: 'out 1', location: [0.5, 1] },
                { id: 'out 2', location: [0.75, 1] }
              ],
              from: 'out 1',
              to: 'in'
            },
            {
              id: '1-0-2',
              name: 'Node 1 - 0 - 2',
              ports: [
                { id: 'in', location: [0.5, 0] },
                { id: 'out 0', location: [0.25, 1] },
                { id: 'out 1', location: [0.5, 1] },
                { id: 'out 2', location: [0.75, 1] }
              ],
              from: 'out 2',
              to: 'in'
            }
          ]
        },
        {
          id: '1-1',
          name: 'Node 1 - 1',
          color: 'blue',
          ports: [
            { id: 'in', location: [0.5, 0] },
            { id: 'out 0', location: [0.25, 1] },
            { id: 'out 1', location: [0.5, 1] },
            { id: 'out 2', location: [0.75, 1] }
          ],
          from: 'out 2',
          to: 'in',
          children: [
            {
              id: '1-1-0',
              name: 'Node 1 - 1 - 0',
              ports: [
                { id: 'in', location: [0.5, 0] },
                { id: 'out 0', location: [0.25, 1] },
                { id: 'out 1', location: [0.5, 1] },
                { id: 'out 2', location: [0.75, 1] }
              ],
              from: 'out 1',
              to: 'in'
            },
            {
              id: '1-1-1',
              name: 'Node 1 - 1 - 1',
              ports: [
                { id: 'in', location: [0.5, 0] },
                { id: 'out 0', location: [0.25, 1] },
                { id: 'out 1', location: [0.5, 1] },
                { id: 'out 2', location: [0.75, 1] }
              ],
              from: 'out 1',
              to: 'in'
            }
          ]
        }
      ]
    }
  ],
  updateNodesSource: [
    {
      id: '0',
      name: 'Root',
      ports: [
        { id: 'in', location: [0.5, 0] },
        { id: 'out 0', location: [0.25, 1] },
        { id: 'out 1', location: [0.5, 1] },
        { id: 'out 2', location: [0.75, 1] }
      ],
      children: [
        {
          id: '1-0',
          name: 'Node 1 - 0',
          color: 'blue',
          ports: [
            { id: 'in', location: [0.5, 0] },
            { id: 'out 0', location: [0.2, 1] },
            { id: 'out 1', location: [0.4, 1] },
            { id: 'out 2', location: [0.6, 1] },
            { id: 'out 3', location: [0.8, 1] }
          ],
          from: 'out 0',
          to: 'in',
          children: [
            {
              id: '1-0-0',
              name: 'Node 1 - 0 - 0',
              ports: [
                { id: 'in', location: [0.5, 0] },
                { id: 'out 0', location: [0.25, 1] },
                { id: 'out 1', location: [0.5, 1] },
                { id: 'out 2', location: [0.75, 1] }
              ],
              from: 'out 0',
              to: 'in'
            },
            {
              id: '1-0-1',
              name: 'Node 1 - 0 - 1',
              ports: [
                { id: 'in', location: [0.5, 0] },
                { id: 'out 0', location: [0.25, 1] },
                { id: 'out 1', location: [0.5, 1] },
                { id: 'out 2', location: [0.75, 1] }
              ],
              from: 'out 2',
              to: 'in'
            }
          ]
        },
        {
          id: '1-1',
          name: 'Node 1 - 1',
          color: 'blue',
          ports: [
            { id: 'in', location: [0.5, 0] },
            { id: 'out 0', location: [0.25, 1] },
            { id: 'out 2', location: [0.75, 1] }
          ],
          from: 'out 1',
          to: 'in',
          children: [
            {
              id: '1-1-0',
              name: 'Node 1 - 1 - 0',
              ports: [
                { id: 'in', location: [0.5, 0] },
                { id: 'out 0', location: [0.25, 1] },
                { id: 'out 1', location: [0.5, 1] },
                { id: 'out 2', location: [0.75, 1] }
              ],
              from: 'out 0',
              to: 'in'
            }
          ]
        },
        {
          id: '1-2',
          name: 'New Node 1 - 2',
          color: 'blue',
          ports: [
            { id: 'in', location: [0.5, 0] },
            { id: 'out 0', location: [0.25, 1] },
            { id: 'out 1', location: [0.5, 1] },
            { id: 'out 2', location: [0.75, 1] }
          ],
          from: 'out 2',
          to: 'in',
          children: [
            {
              id: '1-2-0',
              name: 'Node 1 - 2 - 0',
              ports: [
                { id: 'in', location: [0.5, 0] },
                { id: 'out 0', location: [0.25, 1] },
                { id: 'out 1', location: [0.5, 1] },
                { id: 'out 2', location: [0.75, 1] }
              ],
              from: 'out 1',
              to: 'in'
            },
            {
              id: '1-2-1',
              name: 'Node 1 - 2 - 1',
              ports: [
                { id: 'in', location: [0.5, 0] },
                { id: 'out 0', location: [0.25, 1] },
                { id: 'out 1', location: [0.5, 1] },
                { id: 'out 2', location: [0.75, 1] }
              ],
              from: 'out 2',
              to: 'in'
            },
            {
              id: '1-1-1',
              name: 'Node 1 - 1 - 1',
              ports: [
                { id: 'in', location: [0.5, 0] },
                { id: 'out 0', location: [0.25, 1] },
                { id: 'out 1', location: [0.5, 1] },
                { id: 'out 2', location: [0.75, 1] }
              ],
              from: 'out 0',
              to: 'in'
            }
          ]
        }
      ]
    }
  ]
}
