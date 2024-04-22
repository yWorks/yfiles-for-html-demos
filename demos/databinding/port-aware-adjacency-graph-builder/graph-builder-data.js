/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
// @yjs:keep = successors,predecessors
export default {
  nodesSource: [
    {
      id: '0',
      name: 'Root',
      ports: [
        { id: 'in 0', location: [0, 0.25] },
        { id: 'in 1', location: [0, 0.5] },
        { id: 'in 2', location: [0, 0.75] },
        { id: 'out 0', location: [1, 0.25] },
        { id: 'out 1', location: [1, 0.5] },
        { id: 'out 2', location: [1, 0.75] }
      ],
      successors: [
        {
          id: 'r-0',
          name: 'Right 0',
          from: 'out 0',
          to: 'in 1',
          color: 'blue',
          ports: [
            { id: 'in 0', location: [0, 0.25] },
            { id: 'in 1', location: [0, 0.5] },
            { id: 'in 2', location: [0, 0.75] },
            { id: 'out 0', location: [1, 0.25] },
            { id: 'out 1', location: [1, 0.5] },
            { id: 'out 2', location: [1, 0.75] }
          ],
          successors: [
            {
              id: 'r-0-0',
              name: 'Right 0-0',
              from: 'out 2',
              to: 'in 1',
              ports: [
                { id: 'in 0', location: [0, 0.25] },
                { id: 'in 1', location: [0, 0.5] },
                { id: 'in 2', location: [0, 0.75] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ]
            }
          ],
          predecessors: [
            {
              id: 'c-0-0',
              name: 'Center 0-0',
              from: 'out 0',
              to: 'in 0',
              ports: [
                { id: 'in 0', location: [0, 0.25] },
                { id: 'in 1', location: [0, 0.5] },
                { id: 'in 2', location: [0, 0.75] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ]
            }
          ]
        },
        {
          id: 'r-1',
          name: 'Right 1',
          from: 'out 2',
          to: 'in 1',
          color: 'blue',
          ports: [
            { id: 'in 0', location: [0, 0.25] },
            { id: 'in 1', location: [0, 0.5] },
            { id: 'in 2', location: [0, 0.75] },
            { id: 'out 0', location: [1, 0.25] },
            { id: 'out 1', location: [1, 0.5] },
            { id: 'out 2', location: [1, 0.75] }
          ],
          successors: [
            {
              id: 'r-1-0',
              name: 'Right 1-0',
              from: 'out 0',
              to: 'in 1',
              ports: [
                { id: 'in 0', location: [0, 0.25] },
                { id: 'in 1', location: [0, 0.5] },
                { id: 'in 2', location: [0, 0.75] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ]
            },
            {
              id: 'r-1-1',
              name: 'Right 1-1',
              from: 'out 2',
              to: 'in 1',
              ports: [
                { id: 'in 0', location: [0, 0.25] },
                { id: 'in 1', location: [0, 0.5] },
                { id: 'in 2', location: [0, 0.75] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ]
            }
          ]
        }
      ],
      predecessors: [
        {
          id: 'l-0',
          name: 'Left 0',
          from: 'out 1',
          to: 'in 0',
          color: 'blue',
          ports: [
            { id: 'in 0', location: [0, 0.25] },
            { id: 'in 1', location: [0, 0.5] },
            { id: 'in 2', location: [0, 0.75] },
            { id: 'out 0', location: [1, 0.25] },
            { id: 'out 1', location: [1, 0.5] },
            { id: 'out 2', location: [1, 0.75] }
          ],
          predecessors: [
            {
              id: 'l-0-0',
              name: 'Left 0-0',
              from: 'out 1',
              to: 'in 1',
              ports: [
                { id: 'in 0', location: [0, 0.25] },
                { id: 'in 1', location: [0, 0.5] },
                { id: 'in 2', location: [0, 0.75] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ]
            }
          ]
        },
        {
          id: 'l-1',
          name: 'Left 1',
          from: 'out 1',
          to: 'in 2',
          color: 'blue',
          ports: [
            { id: 'in 0', location: [0, 0.25] },
            { id: 'in 1', location: [0, 0.5] },
            { id: 'in 2', location: [0, 0.75] },
            { id: 'out 0', location: [1, 0.25] },
            { id: 'out 1', location: [1, 0.5] },
            { id: 'out 2', location: [1, 0.75] }
          ],
          predecessors: [
            {
              id: 'l-1-0',
              name: 'Left 1-0',
              from: 'out 1',
              to: 'in 0',
              ports: [
                { id: 'in 0', location: [0, 0.25] },
                { id: 'in 1', location: [0, 0.5] },
                { id: 'in 2', location: [0, 0.75] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ]
            },
            {
              id: 'l-1-1',
              name: 'Left 1-1',
              from: 'out 1',
              to: 'in 1',
              ports: [
                { id: 'in 0', location: [0, 0.25] },
                { id: 'in 1', location: [0, 0.5] },
                { id: 'in 2', location: [0, 0.75] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ]
            },
            {
              id: 'l-1-2',
              name: 'Left 1-2',
              from: 'out 1',
              to: 'in 2',
              ports: [
                { id: 'in 0', location: [0, 0.25] },
                { id: 'in 1', location: [0, 0.5] },
                { id: 'in 2', location: [0, 0.75] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ]
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
        { id: 'in 0', location: [0, 0.25] },
        { id: 'in 1', location: [0, 0.5] },
        { id: 'in 2', location: [0, 0.75] },
        { id: 'out 0', location: [1, 0.25] },
        { id: 'out 1', location: [1, 0.5] },
        { id: 'out 2', location: [1, 0.75] }
      ],
      successors: [
        {
          id: 'r-0',
          name: 'Right 0',
          from: 'out 0',
          to: 'in 1',
          color: 'blue',
          ports: [
            { id: 'in 0', location: [0, 0.25] },
            { id: 'in 1', location: [0, 0.5] },
            { id: 'in 2', location: [0, 0.75] },
            { id: 'out 0', location: [1, 0.25] },
            { id: 'out 1', location: [1, 0.5] },
            { id: 'out 2', location: [1, 0.75] }
          ],
          successors: [
            {
              id: 'r-0-0',
              name: 'Right 0-0',
              from: 'out 2',
              to: 'in 1',
              ports: [{ id: 'in 1', location: [0, 0.5] }]
            }
          ],
          predecessors: [
            {
              id: 'c-0-0',
              name: 'Center 0-0',
              from: 'out 0',
              to: 'in 0',
              ports: [
                { id: 'in 0', location: [0, 0.25] },
                { id: 'in 1', location: [0, 0.5] },
                { id: 'in 2', location: [0, 0.75] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ]
            }
          ]
        },
        {
          id: 'r-1',
          name: 'Right 1',
          from: 'out 2',
          to: 'in 1',
          color: 'blue',
          ports: [
            { id: 'in 0', location: [0, 0.25] },
            { id: 'in 1', location: [0, 0.5] },
            { id: 'in 2', location: [0, 0.75] },
            { id: 'out 0', location: [1, 0.25] },
            { id: 'out 1', location: [1, 0.5] },
            { id: 'out 2', location: [1, 0.75] }
          ],
          successors: [
            {
              id: 'r-1-1',
              name: 'Right 1-1',
              from: 'out 2',
              to: 'in 1',
              ports: [
                { id: 'in 0', location: [0, 0.16] },
                { id: 'in 1', location: [0, 0.33] },
                { id: 'in 2', location: [0, 0.5] },
                { id: 'in 3', location: [0, 0.67] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ],
              predecessors: [
                {
                  id: 'r-1-1-0',
                  name: 'Right 1-1-0',
                  from: 'out 1',
                  to: 'in 2',
                  color: 'blue',
                  ports: [
                    { id: 'in 0', location: [0, 0.25] },
                    { id: 'in 1', location: [0, 0.5] },
                    { id: 'in 2', location: [0, 0.75] },
                    { id: 'out 0', location: [1, 0.25] },
                    { id: 'out 1', location: [1, 0.5] },
                    { id: 'out 2', location: [1, 0.75] }
                  ]
                },
                {
                  id: 'r-1-1-1',
                  name: 'Right 1-1-1',
                  from: 'out 1',
                  to: 'in 3',
                  color: 'blue',
                  ports: [
                    { id: 'in 0', location: [0, 0.25] },
                    { id: 'in 1', location: [0, 0.5] },
                    { id: 'in 2', location: [0, 0.75] },
                    { id: 'out 0', location: [1, 0.25] },
                    { id: 'out 1', location: [1, 0.5] },
                    { id: 'out 2', location: [1, 0.75] }
                  ]
                }
              ]
            }
          ]
        }
      ],
      predecessors: [
        {
          id: 'l-0',
          name: 'Left 0',
          from: 'out 1',
          to: 'in 0',
          color: 'blue',
          ports: [
            { id: 'in 0', location: [0, 0.25] },
            { id: 'in 1', location: [0, 0.5] },
            { id: 'in 2', location: [0, 0.75] },
            { id: 'out 0', location: [1, 0.25] },
            { id: 'out 1', location: [1, 0.5] },
            { id: 'out 2', location: [1, 0.75] }
          ],
          predecessors: [
            {
              id: 'l-0-0',
              name: 'Left 0-0',
              from: 'out 1',
              to: 'in 1',
              ports: [
                { id: 'in 0', location: [0, 0.25] },
                { id: 'in 1', location: [0, 0.5] },
                { id: 'in 2', location: [0, 0.75] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ]
            },
            {
              id: 'l-1-0',
              name: 'Left 1-0',
              from: 'out 1',
              to: 'in 0',
              ports: [
                { id: 'in 0', location: [0, 0.25] },
                { id: 'in 1', location: [0, 0.5] },
                { id: 'in 2', location: [0, 0.75] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ]
            }
          ]
        },
        {
          id: 'l-1',
          name: 'Left 1',
          from: 'out 1',
          to: 'in 2',
          color: 'blue',
          ports: [
            { id: 'in 0', location: [0, 0.25] },
            { id: 'in 1', location: [0, 0.5] },
            { id: 'in 2', location: [0, 0.75] },
            { id: 'out 0', location: [1, 0.25] },
            { id: 'out 1', location: [1, 0.5] },
            { id: 'out 2', location: [1, 0.75] }
          ],
          predecessors: [
            {
              id: 'l-1-1',
              name: 'Left 1-1',
              from: 'out 1',
              to: 'in 1',
              ports: [
                { id: 'in 0', location: [0, 0.25] },
                { id: 'in 1', location: [0, 0.5] },
                { id: 'in 2', location: [0, 0.75] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ]
            },
            {
              id: 'l-1-2',
              name: 'Left 1-2',
              from: 'out 0',
              to: 'in 2',
              ports: [
                { id: 'in 0', location: [0, 0.25] },
                { id: 'in 1', location: [0, 0.5] },
                { id: 'in 2', location: [0, 0.75] },
                { id: 'out 0', location: [1, 0.25] },
                { id: 'out 1', location: [1, 0.5] },
                { id: 'out 2', location: [1, 0.75] }
              ],
              successors: [
                {
                  id: 'l-1-2-0',
                  name: 'Left 1-2-0',
                  from: 'out 1',
                  to: 'in 1',
                  color: 'blue',
                  ports: [
                    { id: 'in 0', location: [0, 0.25] },
                    { id: 'in 1', location: [0, 0.5] },
                    { id: 'in 2', location: [0, 0.75] },
                    { id: 'out 0', location: [1, 0.25] },
                    { id: 'out 1', location: [1, 0.5] },
                    { id: 'out 2', location: [1, 0.75] }
                  ]
                },
                {
                  id: 'l-1-2-1',
                  name: 'Left 1-2-1',
                  from: 'out 2',
                  to: 'in 1',
                  color: 'blue',
                  ports: [
                    { id: 'in 0', location: [0, 0.25] },
                    { id: 'in 1', location: [0, 0.5] },
                    { id: 'in 2', location: [0, 0.75] },
                    { id: 'out 0', location: [1, 0.25] },
                    { id: 'out 1', location: [1, 0.5] },
                    { id: 'out 2', location: [1, 0.75] }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
