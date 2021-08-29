<script lang="ts">
  import NavBar from "./components/NavBar.svelte";
  import {startSearch, findPath} from "./separation-calculator"

  let steamApiKey: string;
  let firstId: string;
  let secondId: string;
  let searching = false;
  let result;

  async function handleClickEvent() {
    searching = !searching;
    if (steamApiKey && firstId && secondId) {
      result = await startSearch(steamApiKey, firstId, secondId);
    } else {
      alert('You need to fill all fields');
    }
  }

</script>

<main>
  <NavBar />

  <div class="inline-label" style="text-align: right">
    <p>Steam API key:</p>
    <p>Steam ID of the first profile:</p>
    <p>Steam ID of the second profile:</p>
  </div>

  <div class="inline">
    <input type="text" bind:value={steamApiKey}>
    <br>
    <input type="text" bind:value={firstId}>
    <br>
    <input type="text" bind:value={secondId}>
  </div>

  <br />

  <button class="find-button" on:click={handleClickEvent}>Find degree of separation</button>

  <br />

  {#if searching}
    searching
    {result}
  {/if}

</main>

<style>
  main {
    text-align: center;
    min-width: 600px;
    overflow-x: hidden;
    color: rgb(184, 182, 180);
  }

  .inline {
    display: inline-block;
    text-align: right;
  }

  .inline-label {
    display: inline-block;
  }

  p {
    margin-bottom: 23px;
    margin-right: 10px;
  }

  input {
    color: rgb(233, 233, 233);
    width: 19em;
    background-color: rgb(50, 53, 60);
    border-radius: 3px;
    border: none;
  }

  input:focus {
    outline: none;
  }

  .find-button {
    border: none;
    background-image: linear-gradient(to right, rgb(61, 163, 241) 5%, rgb(36, 96, 208) 60%);
    border-radius: 2px;
    color: rgb(195, 225, 248);
    padding-left: 1em;
    padding-right: 1em;
    cursor: pointer;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  /*@media (min-width: 640px) {*/
  /*  main {*/
  /*    max-width: none;*/
  /*  }*/
  /*}*/
</style>