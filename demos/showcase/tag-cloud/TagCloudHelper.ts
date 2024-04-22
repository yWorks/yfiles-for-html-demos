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
import {
  DefaultLabelStyle,
  Font,
  GenericLayoutData,
  IGraph,
  INode,
  InteriorLabelModel,
  LayoutGraph,
  LayoutStageBase,
  Size,
  SolidColorFill,
  TextMeasurePolicy,
  TextRenderSupport
} from 'yfiles'

// The maximum desired font size for the Tag Cloud
const MAX_FONT = 500

// The minimum desired font size for the Tag Cloud
const MIN_FONT = 20

// A constant that will determine the upper outliers
const TOP_OUTLIER_FILTER = 20

// A constant that will determine the bottom outliers
const BOTTOM_OUTLIER_FILTER = 5

// The colors of the words in the Tag Cloud
const colors = [
  '#c1c1c1',
  '#e0e04f',
  '#6dbc8d',
  '#56926e',
  '#ff6c00',
  '#db3a34',
  '#6c4f77',
  '#4281a4',
  '#242265'
]

/**
 * Builds the graph based on the given object that holds the frequency of each word.
 * @param graph The tag cloud graph
 * @param wordFrequency Holds the frequency of each word in the tag cloud
 * @param minFrequency The minimum frequency for a word to be shown in the tag cloud visualization
 */
export function buildTagCloud(
  graph: IGraph,
  wordFrequency: { keyword: string; frequency: number }[],
  minFrequency: number
) {
  const sizeAndColor = determineFontSizeAndColor(wordFrequency)

  for (const pair of wordFrequency) {
    const frequency = pair.frequency
    const fontSize = sizeAndColor[frequency].fontSize
    const fontColor = sizeAndColor[frequency].fontColor

    // for each word, create a node and add its text as label
    const word = pair.keyword
    const node = graph.createNode({ tag: pair })
    graph.addLabel(node, word, InteriorLabelModel.CENTER)
    if (frequency >= minFrequency) {
      updateNodeLabel(graph, node, fontSize, fontColor)
    }
  }
}

/**
 * Updates the given graph for minimum frequency changes.
 * @param graph The tag cloud graph
 * @param wordFrequency Holds the frequency of each word in the tag cloud
 * @param minFrequency The minimum frequency for a word to be shown in the tag cloud visualization
 */
export function updateTagCloud(
  graph: IGraph,
  wordFrequency: { keyword: string; frequency: number }[],
  minFrequency: number
) {
  const sizeAndColor = determineFontSizeAndColor(wordFrequency)

  for (const node of graph.nodes) {
    const frequency = node.tag.frequency
    const fontSize = sizeAndColor[frequency].fontSize
    const fontColor = sizeAndColor[frequency].fontColor
    if (frequency >= minFrequency) {
      updateNodeLabel(graph, node, fontSize, fontColor)
    }
  }
}

/**
 * Updates font size and the font color for the label of the given node.
 * @param graph The tag cloud graph
 * @param node The node to update
 * @param fontSize The new font size for the given label
 * @param fontColor The new font color for the given label
 */
function updateNodeLabel(graph: IGraph, node: INode, fontSize: number, fontColor: string) {
  // set the desired font size and font color to the label of the node
  graph.setStyle(
    node.labels.get(0),
    new DefaultLabelStyle({
      font: new Font({ fontSize: fontSize }),
      textFill: new SolidColorFill(fontColor)
    })
  )
}

/**
 * Determines the font size and font color of a word based on its frequency.
 * More frequent words will be visualized with larger fonts.
 * @param wordFrequency Holds the frequency of each word in the tag cloud
 */
function determineFontSizeAndColor(wordFrequency: { keyword: string; frequency: number }[]): {
  [frequency: number]: { fontColor: string; fontSize: number }
} {
  // sort the words based on their frequency - needed to find possible outliers
  wordFrequency = wordFrequency.sort((a, b) => {
    if (a.frequency < b.frequency) {
      return -1
    } else if (a.frequency > b.frequency) {
      return 1
    } else {
      return 0
    }
  })

  // find the interquartile range (IQR) that is the difference between the Q3=75th and Q1=25th
  // percentiles in the data - needed to find possible outliers
  const range = findInterquartileRange(wordFrequency)

  // calculate the min and max value without considering possible outliers
  const extrema = findMinMaxFrequency(wordFrequency, range.q1, range.q3)
  const fontSizeScale = (MAX_FONT - MIN_FONT) / extrema.diff
  const colorScale = (MAX_FONT - MIN_FONT) / colors.length

  const result: { [frequency: number]: { fontColor: string; fontSize: number } } = {}

  let lastTopFont = MAX_FONT

  for (const pair of wordFrequency) {
    const frequency = pair.frequency
    if (!result[frequency]) {
      let fontColor
      let fontSize

      // determine the font size and font color based on the frequency of each word
      // possible top und bottom outliers will considered differently
      if (isBottomOutlier(frequency, range.q1, range.q3)) {
        fontColor = '#17d372'
        fontSize = 5
      } else if (isTopOutlier(frequency, range.q1, range.q3)) {
        fontColor = '#00cbee'
        // the words are sorted, so for each top outlier we can increase its font size a little
        fontSize = lastTopFont + 5
        lastTopFont = fontSize
      } else {
        // linear normalization
        const fontRange = (frequency - extrema.min) * fontSizeScale
        fontSize = MIN_FONT + fontRange

        const colorIndex = Math.min(Math.floor(fontRange / colorScale), colors.length - 1)
        fontColor = colors[colorIndex]
      }
      result[frequency] = { fontColor, fontSize }
    }
  }

  return result
}

/**
 * Determines whether a value is a top outlier.
 * A value is a top outlier if is greater than the Q3 + (Q3 - Q1) * TOP_OUTLIER_FILTER,
 * where Q1, Q3 are the 25th and 75th percentiles in the data.
 * Normally, TOP_OUTLIER_FILTER equals to 1.5 but it can be adjusted based on the data.
 * @param value The frequency value to be examined
 * @param q1 The value of the 25th percentile
 * @param q3 The value of the 75th percentile
 */
function isTopOutlier(value: number, q1: number, q3: number): boolean {
  return value > q3 + (q3 - q1) * TOP_OUTLIER_FILTER
}

/**
 * Determines whether a value is a bottom outlier.
 * A value is a bottom outlier if is less than the Q1 - (Q3 - Q1) * BOTTOM_OUTLIER_FILTER,
 * where Q1, Q3 are the 25th and 75th percentiles of the data.
 * Normally, BOTTOM_OUTLIER_FILTER equals to 1.5 but it can be adjusted based on the data.
 * @param value The frequency value to be examined
 * @param q1 The value of the lower quartile (25th percentile)
 * @param q3 The value of the upper quartile (75th percentile)
 */
function isBottomOutlier(value: number, q1: number, q3: number): boolean {
  return value < q1 - (q3 - q1) * BOTTOM_OUTLIER_FILTER
}

/**
 * Calculates the Q1=25th and Q3=75th percentiles of the data.
 * @param wordFrequency Holds the frequency of each word in the tag cloud
 * @returns The values of the lower quartile q1 and the upper quartile q3
 */
function findInterquartileRange(wordFrequency: { keyword: string; frequency: number }[]): {
  q1: number
  q3: number
} {
  let q1: number
  let q3: number
  const length = wordFrequency.length
  if (length % 4 === 0) {
    q1 = (wordFrequency[length * 0.25].frequency + wordFrequency[length * 0.25 + 1].frequency) * 0.5
    q3 = (wordFrequency[length * 0.75].frequency + wordFrequency[length * 0.75 + 1].frequency) * 0.5
  } else {
    q1 = wordFrequency[Math.floor(length * 0.25 + 1)].frequency
    q3 = wordFrequency[Math.ceil(length * 0.75 + 1)].frequency
  }
  return { q1, q3 }
}

/**
 * Calculates the minimum and maximum frequency values of the data without considering possible top
 * and bottom outliers.
 * @param wordFrequency Holds the frequency of each word in the tag cloud
 * @param q1 The value of the lower quartile (25th percentile)
 * @param q3 The value of the upper quartile (75th percentile)
 * @returns The minimum, maximum, and difference of the two aforementioned values
 */
function findMinMaxFrequency(
  wordFrequency: { keyword: string; frequency: number }[],
  q1: number,
  q3: number
): { min: number; max?: number; diff: number } {
  let min = Number.MAX_VALUE
  let max = -Number.MAX_VALUE

  for (const pair of wordFrequency) {
    const frequency = pair.frequency
    if (!isBottomOutlier(frequency, q1, q3) && !isTopOutlier(frequency, q1, q3)) {
      min = Math.min(min, frequency)
      max = Math.max(max, frequency)
    }
  }

  return { min, max, diff: min !== max ? max - min : 1 }
}

/**
 * A layout stage that assign to the new size to the nodes of the tag cloud. This stage is needed
 * in order to animate the result of the layout algorithm when different threshold values are selected.
 */
export class AssignNodeSizesStage extends LayoutStageBase {
  static readonly NODE_SIZE_DP_KEY: string = 'AssignNodeSizesStage.NODE_SIZE_DP_KEY'

  applyLayout(graph: LayoutGraph): void {
    const dp = graph.getDataProvider(AssignNodeSizesStage.NODE_SIZE_DP_KEY)
    if (dp === null) {
      // If no provider is registered, there is nothing to do
      return
    }

    // assign the new size to the nodes
    graph.nodes.forEach((node) => {
      const size = dp.get(node)
      if (size) {
        graph.setSize(node, size.width, size.height)
      }
    })
  }
}

/**
 * Creates the layout data object needed for the AssignNodeSizesStage.
 * For each tag cloud node, the label size has to be calculated based on which the node size
 * will be adjusted.
 */
export function createAssignNodeSizeStageLayoutData() {
  // use the GenericLayoutData to pass the information about the node sizes to the AssignNodeSizesStage
  const layoutData = new GenericLayoutData()
  layoutData.addNodeItemMapping(AssignNodeSizesStage.NODE_SIZE_DP_KEY, (node) => {
    const label = node.labels.get(0)
    const style = label.style as DefaultLabelStyle

    // calculate the desired render size for the label and...
    const labelRenderSize = TextRenderSupport.measureText({
      text: label.text,
      font: new Font({ fontSize: style.font.fontSize }),
      measurePolicy: TextMeasurePolicy.SVG
    })
    // ... adjust the size of the node accordingly
    // since words in a tag cloud are usually very close to each other or even overlap, the node
    // is assigned a height that is slightly smaller than its associated label's height
    return new Size(labelRenderSize.width, labelRenderSize.height * 0.79)
  })
  return layoutData
}
