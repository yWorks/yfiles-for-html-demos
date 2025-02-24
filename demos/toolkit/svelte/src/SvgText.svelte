<script lang="ts">
  import type { FontStyleStringValues, FontWeightStringValues, TextWrappingStringValues } from '@yfiles/yfiles'
  import { Font, Size, TextMeasurePolicy, TextRenderSupport, TextWrapping } from '@yfiles/yfiles'

  export let maxWidth = -1
  export let maxHeight = -1
  export let x = 0
  export let y = 0
  export let text = ''
  export let rtl = false
  export let fontFamily = 'serif'
  export let textWrapping: TextWrappingStringValues = 'wrap-word'
  export let fontSize = 12
  export let fontStyle: FontStyleStringValues = 'normal'
  export let fontWeight: FontWeightStringValues = 'normal'
  export let fill = 'black'

  let element: SVGTextElement | SVGGElement

  $: {
    let maxSize =
      maxWidth >= 0 || maxHeight >= 0
        ? new Size(
            maxWidth < 0 ? Number.MAX_VALUE : maxWidth,
            maxHeight < 0 ? Number.MAX_VALUE : maxHeight
          )
        : null
    const wrapping = TextWrapping.from(textWrapping.replaceAll('-', '_') as TextWrappingStringValues)
    const font = new Font(fontFamily, fontSize, fontStyle, fontWeight)
    if (element) {
      while (element.firstElementChild !== null) {
        element.firstElementChild.remove()
      }
      TextRenderSupport.addText(
        element,
        text,
        font,
        maxSize,
        wrapping,
        TextMeasurePolicy.AUTOMATIC,
        rtl
      )
    }
  }
</script>

{#if rtl}
  <g transform={`translate(${x} ${y})`} {fill} bind:this={element}></g>
{:else}
  <text transform={`translate(${x} ${y})`} {fill} bind:this={element}></text>
{/if}
