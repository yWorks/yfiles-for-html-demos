<script lang="ts">
  import type { FontStyleStringValues, TextWrappingStringValues } from '@yfiles/yfiles'
  import { Font, Size, TextMeasurePolicy, TextRenderSupport, TextWrapping } from '@yfiles/yfiles'

  let {
    maxWidth = -1,
    maxHeight = -1,
    x = 0,
    y = 0,
    text = '',
    rtl = false,
    fontFamily = 'serif',
    textWrapping = 'wrap-word',
    fontSize = 12,
    fontStyle = 'normal',
    fontWeight = 'normal',
    fill = 'black'
  }: {
    maxWidth: number,
    maxHeight: number,
    x: number,
    y: number,
    text: string,
    rtl: boolean,
    fontFamily: string,
    textWrapping: TextWrappingStringValues,
    fontSize: number,
    fontStyle: FontStyleStringValues,
    fontWeight: string,
    fill: string
  } = $props()

  let element: SVGTextElement | SVGGElement = $state()


  let maxSize = $derived(
    maxWidth >= 0 || maxHeight >= 0
      ? new Size(
        maxWidth < 0 ? Number.MAX_VALUE : maxWidth,
        maxHeight < 0 ? Number.MAX_VALUE : maxHeight
      )
      : null)
  const wrapping = $derived(TextWrapping.from(textWrapping.replaceAll('-', '_') as TextWrappingStringValues))
  const font = $derived(new Font(fontFamily, fontSize, fontStyle, fontWeight))
  $effect(() => {
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
  })
</script>

{#if rtl}
  <g transform={`translate(${x} ${y})`} {fill} bind:this={element}></g>
{:else}
  <text transform={`translate(${x} ${y})`} {fill} bind:this={element}></text>
{/if}
