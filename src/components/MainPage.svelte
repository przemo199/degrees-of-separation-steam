<script lang="ts">
  import type {SearchResult} from "../interfaces";
  import SearchResultDisplay from "./SearchResultDisplay.svelte";
  import SearchDetailsForm from "./SearchDetailsForm.svelte";

  const STEAM_API_KEY_LENGTH = 32;

  let apiKey: string;
  let firstId: string;
  let secondId: string;
  let request: Promise<SearchResult> = Promise.reject();

  async function findDegreeOfSeparation() {
    const response = await fetch("/api/find-degree", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({apiKey: apiKey, steamId1: firstId, steamId2: secondId})
    });

    if (response.ok) {
      return (await response.json()) as SearchResult;
    } else {
      return Promise.reject(new Error(response.statusText));
    }
  }

  function handleSearch() {
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

    request = findDegreeOfSeparation();
  }
</script>

<SearchDetailsForm bind:firstId bind:secondId bind:apiKey />

<button class="find-button" on:click={handleSearch}>
  Find degree of separation
</button>

<div class="result-container">
  {#await request}
    <h1>Searching...</h1>
  {:then result}
    <SearchResultDisplay {apiKey} data={result} />
  {:catch error}
    {#if error}
      {`Oops, something went wrong: ${error.message}`}
    {/if}
  {/await}
</div>

<style>
  .result-container {
    background-color: rgb(14, 20, 28);
    display: flex;
    flex-direction: column;
    padding: 12px;
    text-align: left;
    margin: 10px;
    align-self: center;
  }

  .result-container:empty {
    display: none;
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
