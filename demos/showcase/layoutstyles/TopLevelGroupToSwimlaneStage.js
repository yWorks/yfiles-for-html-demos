/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  Exception,
  LayoutGraphGrouping,
  LayoutGraphHider,
  LayoutGrid,
  LayoutKeys,
  LayoutStageBase,
  Mapper,
  Point,
  Size,
  YList
} from '@yfiles/yfiles'

/**
 This stage can be used for automatically assigning a {@link LayoutGrid} instance that treats
 top-level group nodes as vertical rows/columns.
 <p>
 This stage will modify the hierarchy by temporarily removing the top-level group nodes and assigning
 corresponding grid cells to the remaining nodes. After running the core layout, the top-level group nodes will
 be arranged to function as rows. This class allows using the current coordinates of the group nodes to
 arrange the swimlanes from sketch. Also, the spacing between swimlanes may be specified.
 </p>
 <p>
 This stage can be used in conjunction with layouts that support {@link LayoutGrid},
 like, for example {@link HierarchicalLayout}.
 </p>
 */
export class TopLevelGroupToSwimlaneStage extends LayoutStageBase {
  orderSwimlanesFromSketch = false
  _spacing = 0

  get spacing() {
    return this._spacing
  }

  set spacing(value) {
    if (value < 0) {
      throw new Exception('The spacing should be non-negative: ' + value)
    }
    this._spacing = value
  }

  applyLayoutImpl(graph) {
    // check if there is anything to do at all.
    if (graph.isEmpty || !LayoutGraphGrouping.isGrouped(graph)) {
      this.coreLayout.applyLayout(graph)
      return
    }

    const grouping = LayoutGraphGrouping.createReadOnlyView(graph)

    // count all descriptors
    let counter = 0

    const paddingProvider = graph.context.getItemData(LayoutKeys.GROUP_NODE_PADDING_DATA_KEY)
    const sizeProvider = graph.context.getItemData(LayoutKeys.MINIMUM_GROUP_NODE_SIZE_DATA_KEY)

    // now find all swimlane nodes by iterating all top-level group nodes
    const topLevelColumns = new YList()
    const root2MyDescriptor = new Mapper()

    graph.nodes
      .filter((node) => graph.isGroupNode(node) && !grouping.hasParent(node))
      .forEach((topLevelGroup) => {
        // construct column info for this top level group
        const column = new TopLevelColumn(topLevelGroup, counter++)
        topLevelColumns.add(column)

        column.rightInset = 0
        column.leftInset = 0

        const groupPadding = paddingProvider?.get(topLevelGroup)
        if (groupPadding != null) {
          column.leftInset = groupPadding.left
          // spacing is always to the right
          column.rightInset = groupPadding.right
        }

        const minimumGroupSize = sizeProvider?.get(topLevelGroup)
        if (minimumGroupSize != null) {
          column.minimumWidth = minimumGroupSize.width
        }

        // remember original spacing - we need it to model empty lanes
        column.originalLeftInset = column.leftInset
        column.originalRightInset = column.rightInset

        // add the spacing
        column.rightInset += this.spacing

        // mark it as fixed
        column.indexFixed = this.orderSwimlanesFromSketch
        // remember the descriptor
        root2MyDescriptor.set(topLevelGroup, column)
      })

    // create a hider that will hide the top-level groups (swim lanes) - edges are not being routed currently
    const hider = new LayoutGraphHider(graph)

    // hide roots
    for (const topLevelColumn of topLevelColumns) {
      if (topLevelColumn.group) {
        hider.hide(topLevelColumn.group)
      }
    }

    // at least reset edges between swim lane nodes ....
    for (const edge of hider.hiddenEdges) {
      edge.resetPath()
    }

    // check if this is a non-trivial task, i.e., the graph is not empty for the core layout after hiding top-level groups
    if (!graph.isEmpty) {
      // create a column for those nodes that don't belong to any group, which has not a fixed index
      const nonGroupedColumn = new TopLevelColumn()
      nonGroupedColumn.indexFixed = false
      nonGroupedColumn.leftInset = 0
      nonGroupedColumn.rightInset = this.spacing

      // remember which roots have been used at all, i.e., have nodes assigned to them
      const usedRootGroups = new Set()
      const allRootGroups = new Set(topLevelColumns.map((column) => column.group))

      // for all nodes, assign them to a top-level column
      const topLevelColumnMapping = graph.createNodeDataMap()
      for (const node of graph.nodes) {
        // find the root group
        let parent = grouping.getParent(node)
        while (true) {
          if (parent == null) {
            // root node, not contained in any group
            topLevelColumnMapping.set(node, nonGroupedColumn)
            break
          }

          // walk up and find ancestor
          if (allRootGroups.has(parent)) {
            // we found the root group, use its descriptor
            topLevelColumnMapping.set(node, root2MyDescriptor.get(parent))
            usedRootGroups.add(parent)
            break
          }

          // continue searching our way upwards
          parent = grouping.getParent(parent)
        }
      }

      // see if there are empty lanes that need to have some space reserved
      if (usedRootGroups.size != allRootGroups.size && this.orderSwimlanesFromSketch) {
        // sort them the way the code will sort them
        topLevelColumns.sort(TopLevelColumn.comparison)
        // remember the space to reserve on the left side
        let accuX = 0
        // remember the last non-empty column to add the space to its right side
        let lastReal = null
        for (const column of topLevelColumns) {
          // if this is empty
          if (column.group && !usedRootGroups.has(column.group)) {
            // get its width, we will keep that width as is
            const width = column.group.layout.width
            // see if we remember it for later
            if (lastReal == null) {
              accuX += width + this.spacing
            } else {
              // or whether we can add it to the last real one...
              lastReal.rightInset = lastReal.rightInset + width + this.spacing
            }
          } else {
            // this one is non-empty: add the necessary space to the left
            column.leftInset += accuX
            accuX = 0
            lastReal = column
          }
        }
      }

      // sort descriptors and then add it in that order
      topLevelColumns.sort(TopLevelColumn.comparison)

      // specify layout grid and mapping
      const newGrid = new LayoutGrid(0, 0)
      newGrid.optimizeColumnOrder = !this.orderSwimlanesFromSketch
      const layoutGridRow = newGrid.addRow()
      topLevelColumns.add(nonGroupedColumn)
      for (const topLevelColumn of topLevelColumns) {
        const LayoutGridColumn = newGrid.addColumn()
        topLevelColumn.actualGridLayoutGridColumn = LayoutGridColumn
        LayoutGridColumn.leftPadding = topLevelColumn.leftInset
        LayoutGridColumn.rightPadding = topLevelColumn.rightInset
        LayoutGridColumn.minimumWidth = topLevelColumn.minimumWidth
        LayoutGridColumn.indexFixed = topLevelColumn.indexFixed
      }
      // remove nonGroupedColumn - it was just temporarily in the list to add an actual column in the above loop
      topLevelColumns.pop()

      const newGridCellMapper = new Mapper()
      for (const node of graph.nodes) {
        newGridCellMapper.set(
          node,
          newGrid.createCellDescriptor(
            layoutGridRow,
            topLevelColumnMapping.get(node).actualGridLayoutGridColumn
          )
        )
      }
      graph.disposeNodeDataMap(topLevelColumnMapping)

      // Run the core layout
      // register new grid on a new graph context layer to avoid overwriting old, existing stuff
      graph.context.pushLayer()
      graph.context.addItemData(LayoutGrid.LAYOUT_GRID_CELL_DESCRIPTOR_DATA_KEY, newGridCellMapper)
      this.coreLayout.applyLayout(graph)
      graph.context.popLayer()

      // calculate the bounds
      const graphBounds = graph.getBounds()

      // unhide
      hider.unhideAll()

      let minY = graphBounds.y
      let maxY = graphBounds.y + graphBounds.height
      if (paddingProvider != null) {
        for (const column of topLevelColumns) {
          if (column.group) {
            const padding = paddingProvider.get(column.group)
            if (padding != null) {
              minY = Math.min(graphBounds.y - padding.top, minY)
              maxY = Math.max(graphBounds.y + graphBounds.height + padding.bottom, maxY)
            }
          }
        }
      } else {
        minY -= 10
        maxY += 10
      }

      let height = maxY - minY
      if (sizeProvider != null) {
        for (const column of topLevelColumns) {
          const size = sizeProvider.get(column.group)
          if (size != null) {
            const h = size.height
            if (height < h) {
              height = h
            }
          }
        }
      }

      // now place the top level group nodes that were hidden during the core layout
      let foundFirstReal = false
      let lastMaxX = Number.POSITIVE_INFINITY
      let maxX = -Number.MAX_VALUE

      if (usedRootGroups.size == 0) {
        // if only empty descriptors, except for the non-grouped column
        foundFirstReal = true
        lastMaxX = maxX =
          nonGroupedColumn.actualGridLayoutGridColumn.position +
          nonGroupedColumn.actualGridLayoutGridColumn.width
      }

      for (const column of topLevelColumns) {
        const group = column.group
        if (group) {
          const columnDescriptor = column.actualGridLayoutGridColumn
          // see if this one has been computed at all, i.e., it was non-empty
          if (columnDescriptor.index >= 0) {
            // assign the width to the computed one, but remember to subtract the extra padding for the dummy lanes
            let dRight = 0
            let dLeft = 0

            if (column != nonGroupedColumn) {
              dRight = columnDescriptor.leftPadding - column.originalLeftInset
              dLeft = columnDescriptor.rightPadding - column.originalRightInset
            }

            group.layout.width = columnDescriptor.width - (dRight + dLeft)
            group.layout.height = height
            group.layout.x = columnDescriptor.position + dRight
            group.layout.y = minY
            // remember the last one and the maximum x
            lastMaxX = group.layout.x + group.layout.width
            maxX = Math.max(lastMaxX, maxX)
            if (!foundFirstReal && this.orderSwimlanesFromSketch) {
              // go back in time and adjust previous empty lanes correspondingly
              let rootCell = topLevelColumns.firstCell
              for (; rootCell != null && rootCell.info != column; rootCell = rootCell.next) {}
              rootCell = rootCell.previous
              let x = group.layout.x
              for (; rootCell != null; rootCell = rootCell.previous) {
                const pNode = rootCell.info.group
                if (pNode) {
                  pNode.layout.height = height
                  pNode.layout.x = x - pNode.layout.width - this.spacing
                  pNode.layout.y = minY
                  x -= pNode.layout.width + this.spacing
                }
              }
            }

            foundFirstReal = true
          } else {
            // append empty swim lane
            if (foundFirstReal && this.orderSwimlanesFromSketch) {
              group.layout.size = new Size(group.layout.width, height)
              group.layout.topLeft = new Point(lastMaxX + this.spacing, minY)
              lastMaxX = group.layout.x + group.layout.width
            }
          }
        }
      }

      // if this was not from sketch append all empty lanes at the back...
      if (!this.orderSwimlanesFromSketch) {
        for (const column of topLevelColumns) {
          if (column.actualGridLayoutGridColumn.index < 0) {
            const group = column.group
            if (group) {
              group.layout.height = height
              group.layout.x = maxX + this.spacing
              group.layout.y = minY
              maxX = group.layout.x + group.layout.width
            }
          }
        }
      }
    } else {
      // case that graph is empty after hiding top-level groups, do not actually call core layout
      hider.unhideAll()
      if (this.orderSwimlanesFromSketch) {
        topLevelColumns.sort(TopLevelColumn.comparison)
      }

      const maximumHeight = topLevelColumns.reduce(
        (maxHeight, topLevelColumn) =>
          Math.max(maxHeight, topLevelColumn.group ? topLevelColumn.group.layout.height : 0),
        0
      )

      let x = 0.0
      // make them all the same height... and put them next to each other
      for (const column of topLevelColumns) {
        const group = column.group
        if (group) {
          group.layout.height = maximumHeight
          group.layout.topLeft = new Point(x, 0)
          x += group.layout.width + this.spacing
        }
      }
    }
  }
}

class TopLevelColumn {
  index
  topLevelGroup
  group
  actualGridLayoutGridColumn = null
  originalLeftInset = 0
  originalRightInset = 0
  rightInset = 0
  leftInset = 0
  minimumWidth = 0
  indexFixed = false

  constructor(topLevelGroup, index) {
    this.topLevelGroup = topLevelGroup
    this.index = index
    this.group = topLevelGroup ?? null
    this.index = index ?? -1
  }

  static comparison = (c1, c2) => {
    if (!c1.group || !c2.group) {
      return !c1.group ? 1 : -1
    }
    const x1 = c1.group.layout.centerX
    const x2 = c2.group.layout.centerX
    if (x1 < x2) {
      return -1
    } else if (x1 > x2) {
      return 1
    }
    return c1.index - c2.index ? -1 : 1
  }
}
