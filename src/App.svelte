<script lang="ts">
  import NavBar from "./components/NavBar.svelte";
  import {SearchResult} from './interfaces';
  import PathShowcase from './components/PathShowcase.svelte';

  let steamApiKey: string;
  let firstId: string;
  let secondId: string;
  let searching: boolean = false;
  let data = null;

  async function handleClickEvent() {
    if (!steamApiKey || !firstId || !secondId) {
      alert("You need to provide all the values");
      return;
    }

    if (steamApiKey.length !== 32 && firstId.length !== 17 && secondId.length !== 17) {
      alert("Provided values are incorrect");
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

<main>
  <NavBar />

  <div class="inline-label" style="text-align: right">
    <p class="label">Steam API key:</p>
    <p class="label">Steam ID of the first profile:</p>
    <p class="label">Steam ID of the second profile:</p>
  </div>

  <div class="inline">
    <input type="text" bind:value={steamApiKey}>
    <br />
    <input type="text" bind:value={firstId}>
    <br />
    <input type="text" bind:value={secondId}>
  </div>

  <br />

  <button class="find-button" on:click={handleClickEvent}>
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

  .background {
    background-color: rgb(14, 20, 28);
    display: inline-block;
    padding: 12px;
    text-align: left;
    margin: 10px;
  }

  p.message {
    margin: 5px;
  }

  .label {
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
    color: rgb(184, 182, 180);
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
</style>
