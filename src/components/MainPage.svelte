<script lang="ts">
  import type {SearchResult} from "../interfaces";
  import SearchResultDisplay from "./SearchResultDisplay.svelte";

  const STEAM_API_KEY_LENGTH = 32;

  let apiKey: string;
  let firstId: string;
  let secondId: string;
  let searching: boolean = false;
  let data = null;
  let request: Promise<SearchResult> = Promise.reject();

  async function findDegreeOfSeparation() {
    if (!apiKey || !firstId || !secondId) {
      alert("You must provide all the values");
      return;
    }

    if (apiKey.length !== STEAM_API_KEY_LENGTH) {
      alert("You provided incorrect Steam API key");
      return;
    }

    if (firstId === secondId) {
      alert("You must provide two different Steam IDs");
      return;
    }

    data = null;
    searching = true;

    const response = await fetch("/api/find-degree", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({apiKey: apiKey, steamId1: firstId, steamId2: secondId})
    });

    if (response.ok) {
      return (await response.json()) as SearchResult;
    } else {
      alert(response.status + " " + response.statusText);
    }

    searching = false;
  }

  function handleSearch() {
    request = findDegreeOfSeparation();
  }
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

<button class="find-button" on:click={handleSearch}>
  Find degree of separation
</button>

{#await request}
  <div class="background">
    <h1>Searching...</h1>
  </div>
{:then result}
  <div class="background">
    <SearchResultDisplay {apiKey} data={result} />
  </div>
{:catch error}
{/await}

<style>
  .background {
    background-color: rgb(14, 20, 28);
    display: inline-block;
    padding: 12px;
    text-align: left;
    margin: 10px;
    align-self: center;
  }

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

  .find-button {
    border: none;
    background-image: linear-gradient(to right, rgb(61, 163, 241) 5%, rgb(36, 96, 208) 60%);
    border-radius: 2px;
    color: rgb(195, 225, 248);
    padding-left: 1em;
    padding-right: 1em;
    cursor: pointer;
    align-self: center;
    margin-bottom: 2.5em;
  }

  h1 {
    color: rgb(184, 182, 180);
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
</style>
