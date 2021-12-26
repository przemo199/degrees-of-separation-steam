<script lang="ts">
  import type {SearchResult} from "../interfaces";
  import PathShowcase from "./PathShowcase.svelte";

  let steamApiKey: string;
  let firstId: string;
  let secondId: string;
  let searching: boolean = false;
  let data = null;

  async function handleSearch() {
    if (!steamApiKey || !firstId || !secondId) {
      alert("All values must be provided");
      return;
    }

    if (steamApiKey.length !== 32) {
      alert("Incorrect Steam API key provided");
      return;
    }

    if (firstId === secondId) {
      alert("Two different Steam IDs must be provided");
      return;
    }

    data = null;
    searching = true;

    const response = await fetch("/api/find-degree", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({apiKey: steamApiKey, steamId1: firstId, steamId2: secondId})
    });

    if (response.ok) {
      const searchResult: SearchResult = await response.json();
      data = {
        degreeOfSeparation:
          searchResult.degreeOfSeparation === null ? "not found" : numberToNumeral(searchResult.degreeOfSeparation),
        path: searchResult.path === null ? "not found" : searchResult.path,
        requestsDone: searchResult.requestsDone,
        uniqueProfilesFetched: searchResult.uniqueProfilesFetched,
        searchDuration: (searchResult.searchDuration / 1000) + "s",
        tooManyRequests: searchResult.tooManyRequests
      }
    } else {
      alert(response.status + " " + response.statusText);
    }

    searching = false;
  }

  function numberToNumeral(number: number): string {
    switch (number % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
      default:
        return number + "th";
    }
  }
</script>

<div class="form-container">
  <div class="input-row">
    <p>Steam API key:</p>
    <input type="text" bind:value={steamApiKey}>
  </div>
  <div class="input-row">
    <p>Steam ID of the first profile:</p>
    <input type="text" bind:value={firstId}>
  </div>
  <div class="input-row">
    <p>Steam ID of the second profile:</p>
    <input type="text" bind:value={secondId}>
  </div>
</div>

<br />

<button class="find-button" on:click={handleSearch}>
  Find degree of separation
</button>

<br />
<br />

{#if searching}
  <div class="background">
    <h1>Searching...</h1>
  </div>
{:else if data !== null}
  <div class="background">
    <p class="message">
      {"Degree of separation: " + data.degreeOfSeparation}
    </p>
    <p class="message">
      {"Connection path discovered: " + data.path.join(", ")}
    </p>
    <p class="message">
      {"Requests done: " + data.requestsDone}
    </p>
    <p class="message">
      {"Unique profiles fetched: " + data.uniqueProfilesFetched}
    </p>
    <p class="message">
      {"Search duration: " + data.searchDuration}
    </p>
    {#if data.tooManyRequests === true}
      <p class="message">
        Daily requests limit have been exhausted
      </p>
    {/if}
    <PathShowcase steamApiKey={steamApiKey} steamIds={data.path} />
  </div>
{/if}

<style>
  .background {
    background-color: rgb(14, 20, 28);
    display: inline-block;
    padding: 12px;
    text-align: left;
    margin: 10px;
    align-self: center;
  }

  .message {
    margin: 5px;
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
  }

  h1 {
    color: rgb(184, 182, 180);
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
</style>
