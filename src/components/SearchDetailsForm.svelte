<script lang="ts">
  export let apiKey: string;
  export let firstId: string;
  export let secondId: string;
</script>

<div class="form-container">
  <div class="input-row">
    <label for="api-key">Steam API key:</label>
    <input type="text" id="api-key" bind:value={apiKey}>
  </div>
  <div class="input-row">
    <label for="first-id">Steam ID of the first profile:</label>
    <input type="text" id="first-id" bind:value={firstId}>
  </div>
  <div class="input-row">
    <label for="second-id">Steam ID of the second profile:</label>
    <input type="text" id="second-id" bind:value={secondId}>
  </div>
</div>

<style>
  .input-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.8em;
  }

  .form-container {
    display: flex;
    flex-direction: column;
    align-self: center;
    align-items: end;
    gap: 0.6em;
    margin-bottom: 1.5em;
  }

  input {
    color: rgb(233, 233, 233);
    width: 20em;
    background-color: rgb(50, 53, 60);
    border-radius: 3px;
    border: none;
  }

  input:focus {
    outline: none;
  }
</style>
