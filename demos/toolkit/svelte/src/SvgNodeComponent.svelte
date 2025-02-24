<script lang="ts">
  import SvgText from './SvgText.svelte'
  import type { Person } from './types'

  export let width = 0
  export let height = 0
  export let zoom = 0
  export let selected = false
  export let highlighted = false
  export let item: Person

  const zoomIntermediate = 0.4
  const zoomDetail = 0.7

  function getAbbreviatedName(name: string) {
    return name.replace(/^(.)\S+(.*)$/, '$1.$2')
  }
</script>

<!-- Shadow -->
{#if zoom > zoomIntermediate}
  <rect fill="#C0C0C0" {width} {height} x={2} y={2}></rect>
{/if}
<!-- Background and outline -->
{#if selected || highlighted}
  <rect
    fill={highlighted ? 'aliceblue' : 'white'}
    stroke={selected ? 'orange' : 'cornflowerblue'}
    stroke-width="5"
    width={width - 4}
    height={height - 4}
    x="2"
    y="2"></rect>
{:else}
  <rect fill="white" stroke="#C0C0C0" {width} {height}></rect>
{/if}
<g
  style="font-family: Roboto,sans-serif; font-weight: 300; fill: #444"
  font-size={zoom > zoomDetail ? 10 : 15}
>
  <!-- Icon -->
  {#if zoom > zoomIntermediate}
    <use
      xlink:href={'#' + item.icon}
      width="75"
      height="75"
      transform={zoom > zoomDetail
        ? 'scale(0.85) translate(15 20)'
        : 'scale(0.75) translate(15 30)'}></use>
  {/if}
  <!-- Name -->
  <text
    x={zoom > zoomIntermediate ? (zoom > zoomDetail ? 100 : 75) : 30}
    y={zoom > zoomIntermediate ? (zoom > zoomDetail ? 25 : 40) : 60}
    fill={selected ? 'orange' : '#336699'}
    font-size={zoom > zoomIntermediate ? (zoom > zoomDetail ? 16 : 24) : 40}
  >
    {zoom > zoomIntermediate ? item.name : getAbbreviatedName(item.name)}
  </text>
  <!-- Position -->
  {#if zoom > zoomIntermediate}
    <SvgText
      x={zoom > zoomDetail ? 100 : 75}
      y={zoom > zoomDetail ? 35 : 60}
      maxWidth={zoom > zoomDetail ? width - 150 : width - 95}
      maxHeight={35}
      textWrapping="wrap-word-ellipsis"
      text={item.position.toUpperCase()}
      fontFamily="Roboto"
      fontSize={10}
      fontStyle="normal"
      fontWeight="item400"
      fill="#444"
    />
  {/if}
  <!-- Email, phone, and fax number -->
  {#if zoom > zoomDetail}
    <text transform="translate(100 75)">{item.email}</text>
    <text transform="translate(100 92)">{item.phone}</text>
    <text transform="translate(170 92)">{item.fax}</text>
  {/if}
</g>
