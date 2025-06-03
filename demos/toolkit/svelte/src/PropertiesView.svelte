<script lang="ts">
  import type { Person } from './types'

  let {
    person
  }: { person: Person | null } = $props()
</script>

<div class="demo-sidebar__content">
  <h2>Properties</h2>
  {#if person}
    <div>
      <label>Name <input type="text" bind:value={person.name} /></label>
      <label>Position <input type="text" bind:value={person.position} /></label>
      <label>E-Mail <input type="text" bind:value={person.email} /></label>
      <label>Phone <input type="text" bind:value={person.phone} /></label>
      <label>Fax <input type="text" bind:value={person.fax} /></label>
      <label>
        Business Unit
        <select bind:value={person.businessUnit}>
          <option>Executive Unit</option>
          <option>Production</option>
          <option>Sales</option>
          <option>Accounting</option>
        </select>
      </label>
    </div>
  {:else}
    <div>
      <h3>Please select an employee.</h3>
    </div>
  {/if}
</div>

<style>
  input,
  select {
    display: block;
    box-sizing: border-box;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 5px;
    padding: 0.5rem 0.75rem;
    margin: 5px 0 10px;
    line-height: 1.25;
    width: 100%;
  }
</style>
