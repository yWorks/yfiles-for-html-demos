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
/**
 * Analyzes graph data for quality issues.
 *
 * Identifies:
 * - Dangling edges (missing source or target nodes)
 * - Isolated nodes (no incident edges)
 * - Duplicate nodes (same label within type, with exact, lowercase, and normalized matching)
 *
 * @param data - Graph data with nodes and edges
 * @returns Report containing missing references and duplicate nodes
 */
export function analyzeData(data) {
  const nodeById = new Map(data.nodes.map((n) => [n.id, n]))

  return {
    missing: {
      danglingEdges: findDanglingEdges(data.edges, nodeById),
      isolatedNodes: findIsolatedNodes(data.nodes, data.edges)
    },
    duplicates: findDuplicateNodes(data.nodes)
  }
}

/**
 * Finds edges with missing source or target nodes.
 *
 * @param edges - The edges to analyze
 * @param nodeById - Map of node IDs for quick lookup
 * @returns Array of edges missing source or target nodes
 */
function findDanglingEdges(edges, nodeById) {
  return edges
    .filter((e) => !nodeById.has(e.from) || !nodeById.has(e.to))
    .map((e) => ({
      id: e.id,
      fromExists: nodeById.has(e.from),
      toExists: nodeById.has(e.to),
      from: e.from,
      to: e.to,
      label: e.label
    }))
}

/**
 * Finds nodes with no incident edges (isolated or orphan nodes).
 *
 * @param nodes - The nodes to analyze
 * @param edges - The edges to check connectivity
 * @returns Array of node IDs with no incident edges
 */
function findIsolatedNodes(nodes, edges) {
  const degree = new Map(nodes.map((n) => [n.id, 0]))

  for (const e of edges) {
    if (degree.has(e.from)) degree.set(e.from, (degree.get(e.from) || 0) + 1)
    if (degree.has(e.to)) degree.set(e.to, (degree.get(e.to) || 0) + 1)
  }

  return [...degree.entries()].filter(([, d]) => d === 0).map(([id]) => id)
}

/**
 * Finds duplicate nodes grouped by exact, lowercase, and normalized labels.
 *
 * @param nodes - The nodes to analyze
 * @returns Report with duplicate groups by matching strategy
 */
function findDuplicateNodes(nodes) {
  const byType = groupBy(nodes, (n) => n.type)

  const exact = []
  const lowercase = []
  const normalized = []

  for (const [type, nodeList] of byType.entries()) {
    findDuplicatesByKey(nodeList, (n) => n.label, type, exact)
    findDuplicatesByKey(nodeList, (n) => normalizeLabel(n.label || ''), type, lowercase)
    findDuplicatesByKey(nodeList, (n) => normalizeFullLabel(n.label || ''), type, normalized)
  }

  return { exact, lowercase, normalized }
}

/**
 * Generic grouping function that groups items by a key function.
 *
 * @param items - Items to group
 * @param keyFn - Function to extract the grouping key from an item
 * @returns Map of keys to grouped items
 */
function groupBy(items, keyFn) {
  const map = new Map()

  for (const item of items) {
    const key = keyFn(item)
    const group = map.get(key) ?? []
    group.push(item)
    map.set(key, group)
  }

  return map
}

/**
 * Finds duplicate nodes within a group by a key function.
 *
 * Groups nodes by the key function and collects groups with 2 or more items.
 *
 * @param nodes - Nodes to analyze
 * @param keyFn - Function to extract grouping key from node
 * @param type - Node type for reporting
 * @param out - Output array to append duplicate groups to
 */
function findDuplicatesByKey(nodes, keyFn, type, out) {
  const grouped = new Map()

  for (const n of nodes) {
    const k = keyFn(n)
    if (!k) continue

    const v = grouped.get(k) ?? { labelExample: n.label, ids: [] }
    v.ids.push(n.id)
    grouped.set(k, v)
  }

  for (const [k, v] of grouped.entries()) {
    if (v.ids.length > 1) {
      out.push({ type, key: k, labelExample: v.labelExample, nodeIds: v.ids })
    }
  }
}

/**
 * Normalizes label to lowercase for case-insensitive matching.
 *
 * @param label - The label to normalize
 * @returns Normalized label in lowercase
 */
function normalizeLabel(label) {
  return label.trim().toLowerCase()
}

/**
 * Fully normalizes label by removing diacritics, collapsing whitespace, trimming dashes, normalizing quotes, and removing punctuation.
 *
 * @param label - The label to normalize
 * @returns Fully normalized label
 */
function normalizeFullLabel(label) {
  const normalized = label
    .toLowerCase()
    .replace(/\s+/g, ' ') // collapse multiple whitespace
    .replace(/^[\s-]+|[\s-]+$/g, '') // trim spaces and leading/trailing dashes
    .replace(/[\u2018\u2019]/g, "'") // normalize curly single quotes
    .replace(/[\u201C\u201D]/g, '"') // normalize curly double quotes

  return stripDiacritics(normalized)
    .replace(/[\p{P}\s]+/gu, '') // remove all punctuation and spaces (ES2018+)
    .trim()
}

/**
 * Removes diacritical marks (accents) from characters using Unicode normalization.
 *
 * @param text - The text to remove diacritics from
 * @returns Text with diacritics removed
 */
function stripDiacritics(text) {
  return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
}
