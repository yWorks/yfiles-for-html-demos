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
import type { INode } from 'yfiles'
import type { LabeledTimeInterval, TimeEntry } from './Timeline'

type GroupBucket<TDataItem> = {
  type: 'group'
  parent?: GroupBucket<TDataItem>
  children: Bucket<TDataItem>[]
  layer: number
  index?: number
  indexInLayer: number
  start: Date // inclusive
  end: Date // exclusive
  label?: string
  aggregatedValue: number
}

type LeafBucket<TDataItem> = {
  type: 'leaf'
  parent?: GroupBucket<TDataItem>
  item: TDataItem
  layer: number
  index?: number
  indexInLayer: number
  start: Date // inclusive
  end: Date // exclusive
  label?: string
  aggregatedValue: number
}

/**
 * The bar-chart buckets.
 */
export type Bucket<TDataItem> = GroupBucket<TDataItem> | LeafBucket<TDataItem>

/**
 * Returns the bucket that is represented be the given node.
 */
export function getBucket<TDataItem>(node: INode): Bucket<TDataItem> {
  return node.tag as Bucket<TDataItem>
}

/**
 * Extracts the business data items from the group node.
 * Each bucket is a group node that eventually contains leaf nodes in the graph model that actually hold the business
 * data items.
 */
export function getItemsFromBucket<TDataItem>(bucketNode: INode): TDataItem[] {
  return getLeaves(getBucket(bucketNode))
}

/**
 * Aggregates buckets from the given data items.
 * @param items The items that need to be sorted in buckets
 * @param getTimeEntry A mapping from data items to TimeEntry
 * @param granularities Granularity functions that produce different detail levels
 */
export function aggregateBuckets<TDataItem>(
  items: TDataItem[],
  getTimeEntry: (item: TDataItem) => TimeEntry | undefined,
  granularities: ((start: Date, end: Date) => Iterable<LabeledTimeInterval>)[]
): Bucket<TDataItem>[] {
  let currentLevel = collectLeafBuckets(items, getTimeEntry)
  const allNonLeafBuckets: Bucket<TDataItem>[] = []

  let layer = 1
  for (const granularity of granularities) {
    currentLevel = aggregateBucketsCore(currentLevel, granularity, allNonLeafBuckets, layer)
    layer++
  }

  return allNonLeafBuckets
}

/**
 * Aggregates the buckets for a specific detail level.
 */
function aggregateBucketsCore<TDataItem>(
  buckets: Bucket<TDataItem>[],
  iterateTimeSlices: (start: Date, end: Date) => Iterable<LabeledTimeInterval>,
  allBuckets: Bucket<TDataItem>[],
  layer: number
): Bucket<TDataItem>[] {
  if (buckets.length === 0) {
    return []
  }

  const minDate = buckets[0].start
  const maxDate = buckets[buckets.length - 1].end

  const newBuckets: Bucket<TDataItem>[] = []
  const activeBuckets = new Set<Bucket<TDataItem>>()
  let bucketIndex = 0
  for (const [start, end, label] of iterateTimeSlices(minDate, maxDate)) {
    const childBuckets: Bucket<TDataItem>[] = []
    for (; bucketIndex < buckets.length && buckets[bucketIndex].start < end; bucketIndex++) {
      const entry = buckets[bucketIndex]
      activeBuckets.add(entry)
    }

    for (const bucket of Array.from(activeBuckets)) {
      if (start <= bucket.start && bucket.end <= end) {
        childBuckets.push(bucket)
      } else {
        activeBuckets.delete(bucket)
      }
    }

    const bucket: Bucket<TDataItem> = {
      type: 'group',
      start,
      end,
      children: childBuckets,
      label,
      aggregatedValue: 1,
      layer,
      indexInLayer: -1
    }
    let aggregatedValue = 0
    bucket.children.forEach((child, i) => {
      child.parent = bucket
      child.index = i
      aggregatedValue += child.aggregatedValue
    })
    bucket.aggregatedValue = aggregatedValue

    newBuckets.push(bucket)
    allBuckets.push(bucket)
  }

  for (let i = 0; i < newBuckets.length; i++) {
    newBuckets[i].indexInLayer = i
  }

  return newBuckets
}

function createIntervalBuckets<TDataItem>(
  item: TDataItem,
  start: Date,
  end: Date
): Bucket<TDataItem>[] {
  const buckets: Bucket<TDataItem>[] = []
  let currentDate = new Date(start)
  const intervalLabel = `${start.toDateString()} - ${end.toDateString()}`
  while (currentDate <= end) {
    buckets.push(createLeafBucket(item, intervalLabel, currentDate, currentDate))
    const nextDate = currentDate.setDate(currentDate.getDate() + 1)
    currentDate = new Date(nextDate)
  }
  return buckets
}

function createLeafBucket<TDataItem>(
  item: TDataItem,
  label: string,
  start: Date,
  end: Date
): Bucket<TDataItem> {
  return {
    type: 'leaf',
    item,
    start,
    end,
    label,
    aggregatedValue: 1,
    layer: 0,
    indexInLayer: -1
  }
}

function collectLeafBuckets<TDataItem>(
  items: TDataItem[],
  getTimeEntry: (t: TDataItem) => TimeEntry | undefined
): Bucket<TDataItem>[] {
  const entries: Bucket<TDataItem>[] = items.flatMap((item) => {
    const timeEntry = getTimeEntry(item)
    if (timeEntry) {
      if (Array.isArray(timeEntry)) {
        return timeEntry.flatMap((entry) => {
          if (typeof entry === 'number') {
            const date = new Date(entry)
            return createLeafBucket(item, `${date.getHours()}:${date.getMinutes()}`, date, date)
          } else if (entry.start !== undefined && entry.end !== undefined) {
            return createIntervalBuckets(item, new Date(entry.start), new Date(entry.end))
          }
          return []
        })
      } else if (timeEntry.start !== undefined && timeEntry.end !== undefined) {
        return createIntervalBuckets(item, new Date(timeEntry.start), new Date(timeEntry.end))
      }
    }
    return []
  })

  entries.sort((a, b) => a.start.getTime() - b.start.getTime())
  for (let i = 0; i < entries.length; i++) {
    entries[i].indexInLayer = i
  }
  return entries
}

/**
 * Obtains all leaf items in the given bucket.
 */
function getLeaves<TDataItem>(bucket: Bucket<TDataItem>): TDataItem[] {
  if (bucket.type === 'leaf') {
    return [bucket.item]
  } else {
    return bucket.children.flatMap((child) => getLeaves(child))
  }
}
